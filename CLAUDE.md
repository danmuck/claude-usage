# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Does

`claude-spend` is a local token usage analyzer for Claude Code. It reads session files from `~/.claude/projects/` and `~/.claude/history.jsonl`, parses them, and serves an interactive dashboard at `http://localhost:3456`. All data stays on the user's machine.

## Commands

```bash
# Run the app
node src/index.js
node src/index.js --port 8080   # custom port (default: 3456)
node src/index.js --no-open     # skip auto-opening browser
npm start                       # alias for node src/index.js

# Install dependencies
npm install
```

There are no build steps, tests, or linting configured.

## Architecture

**Data flow:** `index.js` (CLI) → `server.js` (Express) → `parser.js` (data) → `public/index.html` (SPA dashboard)

### `src/parser.js`
The core of the app (~550 lines). Key functions:
- `parseJSONLFile()` — streams a JSONL file line-by-line
- `extractSessionData()` — pulls user prompts and token counts from session entries
- `parseAllSessions()` — orchestrates reading `~/.claude/projects/*/*.jsonl` and `~/.claude/history.jsonl`, then builds aggregations by session, day, model, and project, plus generates 10 insight types

### `src/server.js`
Express server with two API routes:
- `GET /api/data` — returns parsed data (cached in memory after first parse)
- `GET /api/refresh` — clears cache and re-parses

### `src/public/index.html`
A single-file SPA (~1,235 lines) with embedded CSS and JS. Charts are drawn with raw HTML5 Canvas (no charting library). Key render functions: `renderStats`, `renderInsights`, `renderDailyChart`, `renderModelChart`, `renderProjectBreakdown`, `renderTopPrompts`, `renderSessions`.

Utility functions used throughout the frontend: `fmt(n)` (number formatting), `modelShort(m)` (model name parsing), `projectShort(p)` (path stripping), `escapeHtml()` (XSS prevention).

### Caching
Parsed data is cached in `server.js` module scope. The `/api/refresh` endpoint clears it. There is no persistent storage — every restart re-parses from disk.
