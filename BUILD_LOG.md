# Build Log — Agent BKS97 (Checkpoint 1)

## Platform
Built on the existing agentbks97 repo (browser-based landing-page builder from
FL-06). For this checkpoint the core job was narrowed to a CLI flow rather than
extending the full browser UI.

## Core job (narrowest version)
Business description in → OpenRouter call → HTML extracted from the response →
saved to landing-page.html on disk.

## Tool / data connection
File system write. The agent's output is a real file (landing-page.html) that
can be opened and verified in a browser — this is the live tool connection for
this checkpoint.

## Provider switch
Originally the agentbks97 browser app called the Claude API directly from the
client. For this checkpoint the CLI agent calls OpenRouter instead
(https://openrouter.ai/api/v1/chat/completions), using the OpenAI-compatible
chat completions schema. Model set via OPENROUTER_MODEL, defaulting to
openrouter/free.

## What broke / what changed
- First real run: openrouter/free hung for 90+ seconds with no response and no
  error message. The original fetch call had no timeout, so the script waited
  indefinitely with zero feedback — indistinguishable from a frozen terminal.
- Fix: added an AbortController with a 45s timeout, plus a heartbeat ("...")
  printed every 5 seconds so a slow-but-working call is visibly different from
  a dead one. A timeout now surfaces a clear error naming the model instead of
  hanging silently.
- Re-ran the same command after the fix: openrouter/free responded normally
  and completed well under the timeout. This confirmed the underlying script
  was fine — the free auto-router has real variance in which backend model it
  lands on per request, not a bug in the agent.
- Verified the generated landing-page.html against the description given:
  correct business name, services, WhatsApp button linking to the right
  number, prices in Rands, matched design spec (dark theme, gold accents).

## What was cut from the FL-06 spec, and why
- The full browser UI (builder.html) — palette/font/style pickers, live
  preview, download button — was not wired into this checkpoint. The brief
  calls for the narrowest version of the core job first; the richer UI is
  planned to fold back in once the CLI core is confirmed solid.
- Netlify auto-deploy and other "live" service integrations (stock photos,
  address lookup) were considered but not built for this checkpoint — the
  file-write connection alone satisfies the "your files" tool requirement
  without adding scope before the core loop was proven.

## End-to-end run confirmation
Command:
  node agent/agent.js "<business description>"

Output:
  → Reading description...
  → Calling OpenRouter (openrouter/free)...
  ✓ Landing page saved to /workspaces/agentbks97/landing-page.html
    Open it in a browser to view it.

Verified by opening landing-page.html directly (not the repo's index.html) in
the browser via the Codespaces port URL, confirming full page render.

## Raw run capture
Screen recording of a full run: export key → clear terminal → run agent →
file appears → open in browser → page renders. Unedited, single take.
