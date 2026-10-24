import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";
import {
  buildSystemPrompt,
  ALLOWED_SECTIONS,
  PALETTES,
  FONT_STYLES,
  PAGE_STYLES,
} from "./lib/prompt.mjs";

const env = (k) => globalThis.Netlify?.env?.get(k) ?? process.env[k];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_USER_CHARS = 5000;
const MAX_TOTAL_CHARS = 150000;
const MODEL_TIMEOUT_MS = 300000;

function validOptions(o) {
  if (!o || typeof o !== "object") return false;
  if (!Object.hasOwn(PALETTES, o.palette)) return false;
  if (!Object.hasOwn(FONT_STYLES, o.font)) return false;
  if (!Object.hasOwn(PAGE_STYLES, o.style)) return false;
  if (!Array.isArray(o.sections) || o.sections.length > ALLOWED_SECTIONS.length) return false;
  return o.sections.every((s) => ALLOWED_SECTIONS.includes(s)) && new Set(o.sections).size === o.sections.length;
}

function validMessages(messages) {
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 30) return false;
  let total = 0;
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (!m || typeof m.content !== "string") return false;
    if (m.role !== (i % 2 === 0 ? "user" : "assistant")) return false;
    if (m.role === "user" && m.content.length > MAX_USER_CHARS) return false;
    total += m.content.length;
  }
  return messages[messages.length - 1].role === "user" && total <= MAX_TOTAL_CHARS;
}

async function overLimit(ip) {
  const limits = getStore("limits");
  const day = new Date().toISOString().slice(0, 10);
  const perIp = Number(env("MAX_PER_IP_PER_DAY") || 10);
  const perDay = Number(env("MAX_GLOBAL_PER_DAY") || 300);
  const ipKey = "ip-" + createHash("sha256").update(ip).digest("hex").slice(0, 24) + "-" + day;
  const dayKey = "global-" + day;

  const [ipRow, dayRow] = await Promise.all([
    limits.get(ipKey, { type: "json" }),
    limits.get(dayKey, { type: "json" }),
  ]);
  const ipN = ipRow?.n || 0;
  const dayN = dayRow?.n || 0;

  if (dayN >= perDay) return "Agent BKS97 has reached its daily limit. Please try again tomorrow.";
  if (ipN >= perIp) return "You have reached today's limit for generating pages. Please try again tomorrow.";

  await Promise.all([
    limits.setJSON(ipKey, { n: ipN + 1 }),
    limits.setJSON(dayKey, { n: dayN + 1 }),
  ]);
  return null;
}

export default async (req, context) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const id = body?.id;
  if (typeof id !== "string" || !UUID.test(id)) {
    return new Response("Bad request", { status: 400 });
  }

  const jobs = getStore("jobs");
  const fail = (message) => jobs.setJSON(id, { status: "error", message, t: Date.now() });

  try {
    await jobs.setJSON(id, { status: "pending", t: Date.now() });

    const apiKey = env("OPENROUTER_API_KEY");
    const model = env("OPENROUTER_MODEL");
    if (!apiKey || !model) {
      console.error("OPENROUTER_API_KEY or OPENROUTER_MODEL is not set");
      return await fail("The service is not configured yet. Please try again later.");
    }

    if (!validOptions(body.options) || !validMessages(body.messages)) {
      return await fail("That request could not be processed. Shorten your description or start a new page.");
    }

    const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "unknown";
    const limited = await overLimit(ip);
    if (limited) return await fail(limited);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
    let res;
    try {
      res = await fetch(env("OPENROUTER_URL") || "https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey,
          "X-OpenRouter-Title": "Agent BKS97",
        },
        body: JSON.stringify({
          model,
          max_tokens: Number(env("MAX_TOKENS") || 8000),
          messages: [{ role: "system", content: buildSystemPrompt(body.options) }, ...body.messages],
        }),
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("OpenRouter error", res.status, detail.slice(0, 500));
      if (res.status === 429) return await fail("The service is busy right now. Please try again in a minute.");
      return await fail("The page could not be generated. Please try again.");
    }

    const data = await res.json();
    const choice = data?.choices?.[0];
    const text = choice?.message?.content;
    if (!text) {
      console.error("Empty model response", JSON.stringify(data).slice(0, 500));
      return await fail("The page could not be generated. Please try again.");
    }
    if (choice.finish_reason === "length") {
      return await fail("The page was too long to finish. Try a shorter description or fewer sections.");
    }

    await jobs.setJSON(id, { status: "done", content: text, t: Date.now() });
  } catch (e) {
    console.error("generate-background failed", e);
    try {
      await fail("The page could not be generated. Please try again.");
    } catch {}
  }
};
