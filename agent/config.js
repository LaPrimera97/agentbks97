/* ═══════════════════════════════════════════════════
   AGENT BKS97 — CLI config.js
   Reads the OpenRouter key from the environment so it
   never gets committed to git.
   Set it before running:
     export OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
═══════════════════════════════════════════════════ */

const CONFIG = {
  API_KEY: process.env.OPENROUTER_API_KEY || '',
  MODEL: process.env.OPENROUTER_MODEL || 'openrouter/free',
  MAX_TOKENS: 8000,
  OUTPUT_FILE: 'landing-page.html',
};

module.exports = CONFIG;
