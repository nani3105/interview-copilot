# Interview Copilot — Agent Context

## Project Overview
Cross-platform (macOS + Windows) stealth AI interview assistant. Electron + React desktop app.
Full design doc: `docs/claude.md`

## Stack
- **Desktop:** Electron 31 + React 18 + TypeScript 5 + Tailwind CSS 3 + Zustand 4
- **Build:** Vite (renderer) + tsc (main process)
- **Test:** Vitest + React Testing Library (80% coverage required)
- **Backend:** FastAPI + PostgreSQL (Phase 3 — not yet started)

## Directory Layout
```
apps/desktop/src/
  main/          ← Electron main process (Node.js/CommonJS)
  renderer/      ← React app (ESM)
    screens/     ← OnboardingScreen, JobContextScreen, SessionScreen, SettingsScreen
    components/  ← Shared UI components
    providers/   ← LLM gateway, STT gateway
    store/       ← Zustand slices
    hooks/       ← Custom React hooks
  shared/        ← Types shared between main + renderer (types.ts)
```

## Critical Rules
1. NEVER mutate Zustand state directly — always use store actions
2. ALL LLM calls go through `src/renderer/providers/llm-gateway.ts`
3. ALL STT calls go through `src/renderer/providers/stt-gateway.ts`
4. ALL Electron IPC calls are defined in `src/main/index.ts` and exposed via `src/main/preload.ts`
5. Write tests FIRST (TDD). Min 80% coverage.
6. Files max 400 lines. Functions max 50 lines.
7. No hardcoded API keys — always use electron-store
8. Immutable data patterns throughout

## IPC Channels (Electron main ↔ renderer)
| Channel | Direction | Description |
|---------|-----------|-------------|
| `window:set-opacity` | renderer → main | Set window opacity (0.1–1.0) |
| `window:set-always-on-top` | renderer → main | Toggle always-on-top |
| `screenshot:capture` | renderer → main | Trigger screenshot (atomic stealth toggle) |
| `audio:start-capture` | renderer → main | Begin mic + loopback recording |
| `audio:stop-capture` | renderer → main | Stop recording, return audio buffer |

## LLM Providers (to implement in llm-gateway.ts)
Anthropic, OpenAI, Google Gemini, Groq, Ollama, OpenRouter.
Each must implement the `LLMProvider` interface with `sendMessage()` and `analyzeScreenshot()`.

## Key Design Decisions
- `setContentProtection(true)` makes the window invisible to Zoom/Meet screen share
- Two audio streams: mic = candidate, system loopback = interviewer
- Resume parsed to ~500 token structured JSON before LLM injection
- See `docs/claude.md` for full rationale

## Running Locally
```bash
cd apps/desktop
npm install
npm run dev          # starts Vite + Electron
npm run test         # run tests
npm run test:coverage # run with coverage
npm run lint         # ESLint
npm run typecheck    # TypeScript check
```
