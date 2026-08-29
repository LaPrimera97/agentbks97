#!/usr/bin/env node
/* ═══════════════════════════════════════════════════
   AGENT BKS97 — CLI agent.js
   Core job, end to end:
     1. Take a one-line business description
     2. Ask an LLM (via OpenRouter) to generate a full
        landing page
     3. Save the result to a real file on disk
   The file write on step 3 is the live tool/data
   connection this checkpoint requires.
═══════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');
const CONFIG = require('./config');
const { buildSystemPrompt } = require('./systemPrompt');

const TIMEOUT_MS = 45000;

function extractHTML(raw) {
  raw = raw.trim()
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '')
    .trim();
  const idx = raw.indexOf('<!DOCTYPE');
  return idx > 0 ? raw.slice(idx) : raw;
}

async function callOpenRouter(description) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // heartbeat so a slow response doesn't look identical to a frozen terminal
  const heartbeat = setInterval(() => process.stdout.write('.'), 5000);

  let res;
  try {
    res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.API_KEY}`,
        'HTTP-Referer': 'https://github.com/LaPrimera97/agentbks97',
        'X-Title': 'Agent BKS97',
      },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        max_tokens: CONFIG.MAX_TOKENS,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: `Create a landing page for this South African business:\n\n${description}` },
        ],
      }),
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`No response after ${TIMEOUT_MS / 1000}s — "${CONFIG.MODEL}" is likely overloaded. Try again, or set OPENROUTER_MODEL to a different slug from openrouter.ai/models.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
    clearInterval(heartbeat);
    process.stdout.write('\n');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `OpenRouter error ${res.status}`;
    if (res.status === 401) throw new Error('Invalid OpenRouter key. Set OPENROUTER_API_KEY.');
    if (res.status === 429) throw new Error('Rate limited by OpenRouter. Wait a moment and retry, or switch OPENROUTER_MODEL.');
    throw new Error(msg);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function main() {
  const description = process.argv.slice(2).join(' ').trim();
  if (!description) {
    console.error('Usage: node agent/agent.js "A landing page for my hair salon in Soweto..."');
    process.exit(1);
  }
  if (!CONFIG.API_KEY) {
    console.error('Missing OPENROUTER_API_KEY. Run: export OPENROUTER_API_KEY=sk-or-v1-...');
    process.exit(1);
  }

  console.log('→ Reading description...');
  console.log('→ Calling OpenRouter (' + CONFIG.MODEL + ')...');

  try {
    const raw = await callOpenRouter(description);
    const html = extractHTML(raw);

    if (!html.startsWith('<!DOCTYPE')) {
      throw new Error('Model did not return a valid HTML document.');
    }

    const outPath = path.resolve(process.cwd(), CONFIG.OUTPUT_FILE);
    fs.writeFileSync(outPath, html, 'utf8');

    console.log('✓ Landing page saved to ' + outPath);
    console.log('  Open it in a browser to view it.');
  } catch (err) {
    console.error('✗ Failed: ' + err.message);
    process.exit(1);
  }
}

main();
