import { getStore } from "@netlify/blobs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STALE_MS = 6 * 60 * 1000;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export default async (req) => {
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!UUID.test(id)) return json({ status: "error", message: "Invalid job." }, 400);

  const jobs = getStore("jobs");
  const job = await jobs.get(id, { type: "json" });
  if (!job) return json({ status: "pending" });

  if (job.status === "pending") {
    if (Date.now() - (job.t || 0) > STALE_MS) {
      await jobs.delete(id);
      return json({ status: "error", message: "Generation timed out. Please try again." });
    }
    return json({ status: "pending" });
  }

  await jobs.delete(id);
  if (job.status === "done") return json({ status: "done", content: job.content });
  return json({ status: "error", message: job.message || "Generation failed. Please try again." });
};
