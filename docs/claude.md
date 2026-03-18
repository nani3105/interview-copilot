# Interview Copilot — Design Document

**Status:** Planning
**Date:** 2026-03-17
**Team:** Senior Architect + Senior Software Architect

---

## 1. Executive Summary

**Interview Copilot** is a cross-platform desktop application (macOS + Windows) that acts as a real-time AI-powered assistant during live job interviews. It listens to both the interviewer and the candidate, sends the interviewer's questions to an LLM enriched with the candidate's resume and job context, and surfaces concise answers — invisibly to anyone watching the candidate's screen via Zoom, Google Meet, or any screen-share tool.

The core value proposition is a **stealth, elegant, real-time AI assistant** that lives outside the interview window and requires zero context-switching from the candidate.

---

## 2. Problem Statement

Job interviews are high-pressure, time-constrained, and test both knowledge and recall simultaneously. Candidates often know the answer but struggle under pressure to articulate it concisely. Coding interviews compound this with visual problem-solving expectations.

This app solves:
- Recall failure under stress
- Inability to quickly summarize deep knowledge
- Coding challenge blind spots (LeetCode-style problems)
- Post-interview review and improvement

---

## 3. Key Requirements

### Functional
| # | Requirement |
|---|-------------|
| F1 | Onboarding: collect candidate name and parse uploaded resume via LLM |
| F2 | Job context screen: job URL, title, and description ingested as LLM context |
| F3 | Session start: begin recording audio from all input sources |
| F4 | Auto-mode: auto-detect interviewer questions and send to LLM |
| F5 | Manual mode: user explicitly clicks record, then send |
| F6 | LLM responses: concise by default, verbose on request |
| F7 | Screenshot capture: send screenshot to LLM for visual context (coding challenges) |
| F8 | Opacity slider: adjust window transparency from 100% to ~10% |
| F9 | Session transcript: save all interviewer Q, candidate replies, LLM answers to backend |
| F10 | Screen-share stealth: window must be invisible to screen capture / screen share |

### Non-Functional
| # | Requirement |
|---|-------------|
| NF1 | Cross-platform: macOS (Intel + Apple Silicon) and Windows 10/11 |
| NF2 | Low latency: LLM response within 2–4 seconds of question detection |
| NF3 | Offline-graceful: queue requests if network drops |
| NF4 | Elegant UI: non-distracting, minimal, dark/light theme |
| NF5 | Anti-capture: pass screen-recording protection at OS level |

---

## 4. Technology Stack

### 4.1 Desktop Framework
**Choice: Electron (TypeScript + React)**

Rationale:
- `win.setContentProtection(true)` works on both macOS and Windows, making the window invisible to screen capture natively
- Full access to system audio APIs and native OS APIs
- Large ecosystem (audio, STT, hotkeys)
- Proven cross-platform distribution (auto-update via electron-updater)

Alternative considered: **Tauri (Rust + Webview)**
- Lighter, but `setContentProtection` support is less mature
- Audio capture requires more Rust FFI work
- Rejected for now; revisit if bundle size becomes a concern

### 4.2 Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.x | UI rendering and component model |
| TypeScript | 5.x | Type safety across entire codebase |
| Tailwind CSS | 3.x | Utility-first styling |
| Framer Motion | 11.x | Smooth transitions and animations |
| Zustand | 4.x | Lightweight global state management |
| React Query | 5.x | Async data fetching + caching |
| React Hook Form | 7.x | Form handling (onboarding, job context) |
| Radix UI | latest | Accessible headless UI components (sliders, toggles) |
| Lucide React | latest | Icon set |
| react-markdown | 9.x | Render LLM markdown responses |

### 4.3 Electron / Desktop Layer
| Package | Purpose |
|---------|---------|
| `electron` | Desktop shell |
| `electron-builder` | Package + distribute for macOS (.dmg) and Windows (.exe) |
| `electron-updater` | Auto-update with code-signed releases |
| `electron-store` | Persist user settings locally (encrypted) |
| `node-audiorecorder` | Cross-platform mic recording |
| `@paulhershner/desktop-audio` or `soundio-node` | System loopback audio capture |
| `screenshot-desktop` | Cross-platform screenshot capture |
| `robotjs` | Global hotkeys (even when app not focused) |

### 4.4 Audio & Speech
| Component | Choice | Reason |
|-----------|--------|--------|
| Mic capture | `node-audiorecorder` | Cross-platform, battle-tested |
| System audio (interviewer) | macOS: `CoreAudio loopback`, Windows: `WASAPI loopback` | Capture Zoom/Meet audio without extra hardware |
| Loopback helper (macOS) | BlackHole (free) or Loopback (paid) — user installs | macOS doesn't natively expose system audio |
| Speech-to-Text | **OpenAI Whisper API** (cloud) or **faster-whisper** (local Python sidecar) | Accurate, multilingual |
| STT streaming | Deepgram Nova-2 (real-time streaming alternative to Whisper) | 300ms latency vs 1-2s for Whisper batch |
| Speaker diarization | Two-stream approach (mic = candidate, loopback = interviewer) | Zero ambiguity, no ML needed |

> **macOS loopback note:** macOS does not expose system audio to apps directly. The user must install a virtual audio device (BlackHole — free, open source) that creates a loopback. The app detects BlackHole and guides the user through setup on first run.

> **Windows loopback note:** Windows WASAPI natively supports loopback capture from the default render device. No user action needed.

### 4.5 LLM Providers (Multi-Provider Architecture)

The app implements a **unified LLM gateway** internally. Users can select their preferred provider and model in Settings. The gateway normalizes the API differences.

#### Supported Providers

| Provider | Models | Strengths | Vision |
|----------|--------|-----------|--------|
| **Anthropic (Claude)** | claude-sonnet-4-6, claude-opus-4-6, claude-haiku-4-5 | Best instruction-following, fast streaming | Yes (Sonnet+) |
| **OpenAI** | gpt-4o, gpt-4o-mini, gpt-4-turbo | Widely known, reliable | Yes (4o) |
| **Google Gemini** | gemini-2.0-flash, gemini-2.5-pro | Fast, large context window | Yes |
| **Groq** | llama-3.3-70b, mixtral-8x7b | Ultra-low latency (inference on custom HW) | No |
| **Ollama (local)** | llama3.2, mistral, phi-4, gemma3 | 100% offline, no API cost, privacy | Some (llava) |
| **OpenRouter** | 100+ models via one API key | Model flexibility without managing keys | Varies |

#### Provider Selection UI (Settings Screen)
```
┌─────────────────────────────────────────┐
│  AI Provider Settings                   │
│                                         │
│  Primary Provider                       │
│  [ Anthropic ▼ ]  Model: [Sonnet 4.6▼] │
│  API Key: [ sk-ant-... ••••••••• ]      │
│                                         │
│  Fallback Provider                      │
│  [ OpenAI   ▼ ]  Model: [gpt-4o    ▼]  │
│  API Key: [ sk-...    ••••••••• ]       │
│                                         │
│  Screenshot / Vision Provider           │
│  [ Auto (same as primary) ▼ ]           │
│                                         │
│  Use Local Model (Ollama)               │
│  [○] Enable offline mode               │
│  Ollama URL: [ http://localhost:11434 ] │
│  Model: [ llama3.2 ▼ ]                  │
│                                         │
│  [ Test Connection ]  [ Save ]          │
└─────────────────────────────────────────┘
```

#### LLM Gateway Interface (TypeScript)
```typescript
interface LLMProvider {
  name: string
  sendMessage(context: InterviewContext, question: string): AsyncIterable<string>
  analyzeScreenshot(context: InterviewContext, imageBase64: string): AsyncIterable<string>
  isAvailable(): Promise<boolean>
}

// Implementations: AnthropicProvider, OpenAIProvider,
//                  GeminiProvider, GroqProvider,
//                  OllamaProvider, OpenRouterProvider
```

Routing logic:
- Primary provider is called first
- If primary fails or times out (3s), automatically falls back to secondary
- Vision tasks are routed to the vision-capable model of the selected provider
- Groq is auto-selected for responses when latency is critical and question is simple

### 4.6 Backend
| Component | Choice | Reason |
|-----------|--------|--------|
| Framework | **FastAPI** (Python 3.12) | Fast async, auto-generates OpenAPI docs |
| Database | **PostgreSQL 16** | Relational, JSONB for transcript storage |
| ORM | **SQLAlchemy 2.0** + Alembic | Type-safe queries, migrations |
| Auth | **JWT** + **Google OAuth 2.0** | Simple, standard |
| File storage | **AWS S3** or **Cloudflare R2** | Screenshots, audio recordings |
| Cache | **Redis** | Session state, rate limiting |
| Deployment | **Docker** + **docker-compose** | Local dev parity with prod |
| Hosting | **Fly.io** or **Railway** | Simple PaaS, low ops overhead |

### 4.7 Local Storage (Electron)
| Component | Choice | Purpose |
|-----------|--------|---------|
| `electron-store` | Encrypted JSON | API keys, user preferences |
| `better-sqlite3` | Local SQLite | Offline queue for transcript sync |
| File system | `app.getPath('userData')` | Screenshots, local audio cache |

---

## 5. Application Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    Electron Main Process                              │
│                                                                       │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│  │ Window Manager  │  │  Audio Capture   │  │ Screenshot Capture │  │
│  │ - stealth mode  │  │  - mic stream    │  │ - atomic toggle    │  │
│  │ - opacity ctrl  │  │  - loopback strm │  │ - base64 encode    │  │
│  │ - always-on-top │  │  - chunk/buffer  │  │                    │  │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬───────────┘  │
│           │                    │                       │              │
│           └────────────────────┴───────────────────────┘             │
│                                      │ Electron IPC                  │
└──────────────────────────────────────┼───────────────────────────────┘
                                       │
┌──────────────────────────────────────▼───────────────────────────────┐
│                    Renderer Process (React App)                       │
│                                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │
│  │ Onboarding │  │Job Context │  │  Session   │  │   Settings    │  │
│  │ Screen     │  │ Screen     │  │  Screen    │  │   Screen      │  │
│  └────────────┘  └────────────┘  └────────────┘  └───────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                     LLM Gateway (client-side)                 │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │    │
│  │  │Anthropic │ │ OpenAI   │ │ Gemini   │ │ Groq / Ollama  │  │    │
│  │  │Provider  │ │ Provider │ │ Provider │ │ OpenRouter     │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                  STT Gateway (client-side)                    │    │
│  │     ┌────────────┐  ┌───────────┐  ┌──────────────────┐     │    │
│  │     │ Whisper API│  │ Deepgram  │  │ faster-whisper   │     │    │
│  │     │ (OpenAI)   │  │ Nova-2    │  │ (local sidecar)  │     │    │
│  │     └────────────┘  └───────────┘  └──────────────────┘     │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
                    │                            │
           ┌────────┘                            └──────────────┐
           ▼                                                     ▼
┌────────────────────┐                          ┌───────────────────────┐
│   External APIs    │                          │   Backend Service     │
│                    │                          │                       │
│  Anthropic API     │                          │  FastAPI              │
│  OpenAI API        │                          │  PostgreSQL           │
│  Gemini API        │                          │  Redis                │
│  Groq API          │                          │  S3 / R2              │
│  Deepgram API      │                          │                       │
│  Ollama (local)    │                          │  /sessions            │
│  OpenRouter API    │                          │  /transcripts         │
└────────────────────┘                          │  /screenshots         │
                                                └───────────────────────┘
```

---

## 6. Screen Flow

### Screen 1 — Onboarding
```
┌─────────────────────────────────────┐
│  Interview Copilot                  │
│                                     │
│  Your Name                          │
│  [ _________________________ ]      │
│                                     │
│  Upload Your Resume                 │
│  [ Drop PDF/DOCX here or Browse ]   │
│                                     │
│  [   Parsing...  ✓ Resume loaded ]  │
│                                     │
│              [ Next → ]             │
└─────────────────────────────────────┘
```
- Resume is parsed by LLM into a structured JSON: skills, experience, education, projects
- Parsed resume stored in app state as `resumeContext`

### Screen 2 — Job Context
```
┌─────────────────────────────────────┐
│  Job Details                        │
│                                     │
│  Job URL (optional)                 │
│  [ _________________________ ]      │
│  [ Auto-fetch JD ]                  │
│                                     │
│  Job Title                          │
│  [ _________________________ ]      │
│                                     │
│  Job Description                    │
│  [ _________________________ ]      │
│  [                            ]     │
│                                     │
│  [ ← Back ]         [ Start → ]     │
└─────────────────────────────────────┘
```
- If Job URL is provided, app scrapes and parses the JD automatically
- JD + Title stored as `jobContext`

### Screen 3 — Interview Session
```
┌──────────────────────────────────────────────┐
│  ● LIVE  |  Software Engineer @ Acme Corp    │  ← top bar
│  ─────────────────────────────────────────── │
│                                              │
│  INTERVIEWER                                 │
│  "Tell me about a time you scaled a         │
│   system to handle 10x traffic..."          │  ← live transcript
│                                              │
│  ─────────────────────────────────────────── │
│  AI ANSWER                                   │
│                                              │
│  At my previous role at [Company], we       │  ← LLM response
│  faced a similar challenge...               │
│  • Key point 1                              │
│  • Key point 2                              │
│                                              │
│  ─────────────────────────────────────────── │
│                                              │
│  [📸 Screenshot]  [🎙 Record]  [⏹ Stop]     │  ← controls
│                                              │
│  Auto-Listen: [●────────────] ON            │  ← toggle
│  Opacity:     [─────●──────] 70%            │  ← opacity
│                                              │
└──────────────────────────────────────────────┘
```

---

## 7. LLM Context Architecture

### Context Composition
Every LLM call is assembled from multiple context layers:

```
SYSTEM PROMPT
├── Role definition: "You are an expert interview coach..."
├── Behavior rules (concise by default, deep on request)
├── Resume Context (parsed structured JSON)
└── Job Context (title + description)

USER MESSAGE
└── Interviewer's question (transcribed)
```

### System Prompt Design
```
You are a real-time interview assistant helping a candidate in a live job interview.

CANDIDATE PROFILE:
{resumeContext}

JOB CONTEXT:
Title: {jobTitle}
Description: {jobDescription}

RESPONSE RULES:
1. Be concise and direct. Answer the question in 3-5 sentences max.
2. Use the candidate's actual experience from their resume where relevant.
3. Use bullet points only when listing multiple distinct items.
4. If the question asks to "elaborate", "go deeper", or "explain more", expand your answer.
5. Highlight the 1-2 most important points with **bold text**.
6. Never say "As an AI..." or break character.
7. Respond as if the candidate is speaking in first person.
```

### Screenshot / Visual Context
For coding or whiteboard questions:
- Screenshot is captured and encoded as base64
- Sent to a vision-capable model endpoint
- System prompt is extended with: "The candidate has shared a screenshot of a coding problem. Analyze it and provide a solution approach."

---

## 8. Audio Pipeline

### Dual-Stream Recording
```
System Audio (loopback)  ──→  "Interviewer stream"
Microphone               ──→  "Candidate stream"
```

Both streams are:
1. Recorded continuously in 3-second rolling chunks
2. Each chunk sent to Whisper STT for transcription
3. Transcriptions are labeled by source
4. Interviewer transcriptions are analyzed for question detection

### Auto-Listen Mode (Toggle ON)
```
[Audio chunk] → [Whisper STT] → [Question detection heuristic]
    → if ends with "?" or matches question pattern
    → [Build LLM context] → [Claude API] → [Stream response to UI]
```

Question detection heuristic:
- Sentence ends with `?`
- Starts with: "Tell me", "Can you", "What", "How", "Why", "Describe", "Walk me through"
- Pause after sentence (>1.5s silence = question complete)

### Manual Mode (Toggle OFF)
- User presses `Record` button
- Records until user releases (push-to-talk) or presses Stop
- User then presses `Send` to forward transcription to LLM

---

## 9. Stealth / Screen-Share Invisibility

### macOS
- Electron: `mainWindow.setContentProtection(true)`
- Sets `NSWindowSharingNone` at OS level
- Window appears black/invisible in all screen capture tools, Zoom, Google Meet, OBS, QuickTime

### Windows
- Electron: `mainWindow.setContentProtection(true)`
- Calls `SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)` under the hood
- Supported from Windows 10 build 2004+

### Opacity / Transparency
- Electron: `mainWindow.setOpacity(value)` where `value` is 0.0–1.0
- UI slider maps 10%–100% to 0.1–1.0
- At low opacity, the window becomes nearly invisible on screen while still being interactive
- This is the "human stealth" layer — the OS protection is the "capture stealth" layer

### Proctoring / Anti-Cheat Consideration
- The app window is excluded from screen capture at the OS level
- Proctoring tools that capture the screen (e.g., Respondus, ProctorU, HackerRank's proctoring) will not capture this window
- Network traffic monitoring is out of scope — the LLM API calls will be visible in network logs if the proctor has that level of access (this is an acceptable risk; the app does not attempt to hide network calls)
- The app does not interfere with the browser or other running applications

---

## 10. Session Persistence & Backend

### Data Saved Per Session
```json
{
  "sessionId": "uuid",
  "userId": "uuid",
  "candidateName": "...",
  "jobTitle": "...",
  "jobDescription": "...",
  "resumeSummary": "...",
  "startedAt": "ISO timestamp",
  "endedAt": "ISO timestamp",
  "transcript": [
    {
      "timestamp": "...",
      "speaker": "interviewer | candidate | llm",
      "text": "..."
    }
  ],
  "screenshots": [
    {
      "timestamp": "...",
      "s3Key": "...",
      "llmResponse": "..."
    }
  ]
}
```

### Backend API (FastAPI / Express)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/sessions` | Create new session |
| PUT | `/sessions/:id/transcript` | Append transcript entries (streaming) |
| POST | `/sessions/:id/screenshots` | Upload screenshot + response |
| GET | `/sessions` | List past sessions |
| GET | `/sessions/:id` | Retrieve full session |

### Sync Strategy
- Transcript entries are batched and synced every 10 seconds
- Screenshots are uploaded immediately
- If offline: queue in local SQLite, sync when reconnected

---

## 11. UI/UX Design Principles

### Aesthetic
- **Theme:** Dark by default (reduces distraction in interview setting), Light mode available
- **Typography:** Inter or SF Pro — clean, readable at small sizes
- **Colors:** Muted palette — deep navy, soft white, accent in teal/green for LLM responses
- **Density:** Compact — the window should be small enough to live in a corner of the screen

### Window Behavior
- Always-on-top toggle (so it stays above the interview window)
- Resizable and repositionable
- Minimum size: 320×480px
- Default position: top-right corner

### Response Display
- LLM responses stream in (token by token) for real-time feel
- Key points are auto-bolded
- Response area is scrollable
- "Copy to clipboard" button on each response
- Soft fade-in animation for new responses

### Non-Distraction Features
- No notification sounds during session
- No popups or modals during session
- Collapse mode: shrink window to just the top bar, expand on hover

---

## 12. Open Questions & Risks

| # | Question / Risk | Priority |
|---|----------------|----------|
| Q1 | Which STT provider? Cloud (Whisper API) has latency; local (faster-whisper) needs bundled model (~1.5GB) | HIGH |
| Q2 | Speaker diarization accuracy — two-mic approach vs single-mic + diarization | HIGH |
| Q3 | `setContentProtection` breaks screenshotting within the app itself — need to temporarily disable for screenshot feature | HIGH |
| Q4 | LLM latency — streaming helps UX but first-token latency still ~800ms on Claude | MEDIUM |
| Q5 | Resume parsing quality — PDF parsing is messy; need to handle edge cases (image-based PDFs) | MEDIUM |
| Q6 | Job URL scraping — many job boards (LinkedIn, Greenhouse) block scrapers | MEDIUM |
| Q7 | Windows loopback audio capture — requires WASAPI loopback, more complex than macOS | MEDIUM |
| Q8 | Auto-update distribution — need code signing for both macOS (notarization) and Windows | LOW |
| Q9 | Privacy & legal — recording audio in an interview may be subject to consent laws by jurisdiction | HIGH |

---

## 13. Phased Roadmap

### Phase 1 — Core (MVP)
- [ ] Electron app skeleton (macOS + Windows)
- [ ] Onboarding: name + resume upload + LLM parse
- [ ] Job context screen
- [ ] Manual record → STT → LLM → display response
- [ ] setContentProtection stealth mode
- [ ] Opacity slider

### Phase 2 — Intelligence
- [ ] Auto-listen mode with question detection
- [ ] Dual-stream audio (mic + system loopback)
- [ ] Screenshot → vision LLM
- [ ] Streaming LLM responses

### Phase 3 — Persistence
- [ ] Backend API (FastAPI)
- [ ] Session transcript storage
- [ ] Past sessions viewer in app
- [ ] User accounts (Google OAuth)

### Phase 4 — Polish
- [ ] Collapse/expand mode
- [ ] Auto-fetch JD from URL
- [ ] Light/dark theme
- [ ] Keyboard shortcuts for all actions
- [ ] Auto-update (electron-updater)

---

## 14. Complete API Reference

### 14.1 LLM APIs

| Provider | API Endpoint Base | Auth | Streaming | Docs |
|----------|------------------|------|-----------|------|
| Anthropic (Claude) | `https://api.anthropic.com/v1` | `x-api-key` header | Yes (SSE) | anthropic.com/docs |
| OpenAI | `https://api.openai.com/v1` | `Authorization: Bearer` | Yes (SSE) | platform.openai.com/docs |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta` | `?key=` query param | Yes | ai.google.dev/docs |
| Groq | `https://api.groq.com/openai/v1` | `Authorization: Bearer` | Yes (OpenAI-compatible) | console.groq.com/docs |
| OpenRouter | `https://openrouter.ai/api/v1` | `Authorization: Bearer` | Yes (OpenAI-compatible) | openrouter.ai/docs |
| Ollama (local) | `http://localhost:11434/api` | None | Yes (NDJSON) | ollama.com/docs |

### 14.2 Speech-to-Text APIs

| Provider | Endpoint | Latency | Format | Best For |
|----------|----------|---------|--------|----------|
| OpenAI Whisper | `POST /v1/audio/transcriptions` | ~1–2s | multipart audio file | Batch, accurate |
| Deepgram Nova-2 | WebSocket `wss://api.deepgram.com/v1/listen` | ~300ms | real-time streaming | Auto-listen mode |
| AssemblyAI | WebSocket streaming | ~400ms | real-time streaming | Alternative to Deepgram |
| faster-whisper | Local Python sidecar, HTTP `POST /transcribe` | ~200ms (GPU) / ~800ms (CPU) | local file | Offline mode |

**Recommended combo:** Deepgram for auto-listen mode (real-time streaming); Whisper API for manual mode (post-recording batch).

### 14.3 Document Parsing APIs

| Purpose | Service | API | Reason |
|---------|---------|-----|--------|
| PDF text extraction | **pdf-parse** (npm, local) | None — local | Zero latency, no API cost |
| Complex/scanned PDFs | **Adobe PDF Services API** | REST | Handles image-based PDFs |
| DOCX extraction | **mammoth** (npm, local) | None — local | Converts DOCX → clean HTML/text |
| Job URL scraping | **Firecrawl API** | `POST /v1/scrape` | Bypasses JS-heavy job boards |
| Job URL scraping (free) | **Cheerio** + fetch (local) | None | Works on simple HTML job pages |

### 14.4 Authentication APIs

| Provider | Protocol | SDK |
|----------|----------|-----|
| Google OAuth 2.0 | OAuth 2.0 | `google-auth-library` |
| GitHub OAuth | OAuth 2.0 | `@octokit/auth-oauth-app` |
| Supabase Auth | JWT + OAuth | `@supabase/supabase-js` (optional full-stack alternative) |

### 14.5 Storage APIs

| Type | Service | SDK | Purpose |
|------|---------|-----|---------|
| Object storage | AWS S3 | `@aws-sdk/client-s3` | Screenshots, audio files |
| Object storage (alt) | Cloudflare R2 | S3-compatible API | Cheaper egress than S3 |
| Database | PostgreSQL | `asyncpg` (FastAPI) | Sessions, transcripts |
| Local encrypted store | electron-store | Built-in | API keys, settings |
| Offline queue | better-sqlite3 | Built-in | Transcript sync buffer |

### 14.6 macOS-Specific APIs

| API | Purpose |
|-----|---------|
| `CoreAudio` (via BlackHole) | System audio loopback capture |
| `NSWindowSharingNone` (via Electron setContentProtection) | Screen-share stealth |
| `NSWindow.setOpacity` (via Electron setOpacity) | Transparency control |
| `NSRunningApplication` | Detect active Zoom/Meet process |
| `AVFoundation` | Alternative mic capture |

### 14.7 Windows-Specific APIs

| API | Purpose |
|-----|---------|
| `WASAPI loopback` (via node addon) | System audio loopback capture |
| `SetWindowDisplayAffinity / WDA_EXCLUDEFROMCAPTURE` (via Electron) | Screen-share stealth |
| `SetLayeredWindowAttributes` (via Electron setOpacity) | Transparency control |

### 14.8 Backend API (Internal — FastAPI)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/google` | None | Exchange Google code for JWT |
| GET | `/users/me` | JWT | Get current user profile |
| POST | `/sessions` | JWT | Create a new interview session |
| GET | `/sessions` | JWT | List all sessions for user |
| GET | `/sessions/:id` | JWT | Get full session with transcript |
| DELETE | `/sessions/:id` | JWT | Delete a session |
| POST | `/sessions/:id/transcript` | JWT | Append transcript entries (batch) |
| POST | `/sessions/:id/screenshots` | JWT | Upload screenshot + LLM response |
| GET | `/sessions/:id/export` | JWT | Export session as PDF/Markdown |
| POST | `/resumes/parse` | JWT | Parse uploaded resume via LLM |
| GET | `/health` | None | Health check |

---

## 15. Key Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Desktop framework | Electron | Best cross-platform audio + setContentProtection support |
| UI | React + Tailwind | Fast iteration, elegant results |
| LLM (default) | Claude claude-sonnet-4-6 | Best instruction-following, fast, vision support |
| LLM (multi-provider) | Unified gateway: Claude, GPT-4o, Gemini, Groq, Ollama | User choice, offline support, cost flexibility |
| STT (real-time) | Deepgram Nova-2 streaming | 300ms latency for auto-listen mode |
| STT (batch) | OpenAI Whisper API | Accuracy for manual mode |
| STT (offline) | faster-whisper local sidecar | No API cost, privacy |
| Audio strategy | Two streams (loopback + mic) | Cleanest speaker separation |
| Stealth | setContentProtection(true) | Native OS-level, no hacks needed |
| Transparency | Electron setOpacity() | Cross-platform, simple |
| Resume parsing | pdf-parse (local) + LLM summarization | No external dependency for common PDFs |
| Backend | FastAPI + PostgreSQL | Fast to build, scalable |
| Storage | S3/R2 | Screenshots and audio files |
| Offline queue | better-sqlite3 | Lightweight, built into Electron |

---

## 16. Architect Notes

> **Senior Architect:** The two biggest technical risks are (1) real-time audio diarization and (2) the screenshot stealth conflict. For diarization, the two-stream approach is strongly preferred — it removes all algorithmic uncertainty. For screenshots, Electron allows temporarily toggling `setContentProtection` off, capturing, then re-enabling — this must be done atomically and quickly (~100ms window).

> **Senior Software Architect:** The LLM context window is precious. The resume should be distilled into a ~500-token structured summary before being injected — not the raw resume text. This keeps every LLM call lean and ensures the job description gets sufficient weight. We should also build a context manager that trims the conversation history if it grows too long during a multi-hour interview.

> **AI/Voice Systems:** For the auto-listen feature, do not rely solely on `?` detection. Build a small sentence-completion detector using a lightweight local model (e.g., sentence-transformers) that classifies whether a spoken segment is a question vs. a statement. This will have far lower false-positive rate than punctuation detection alone.

---

*This document is the living design record for Interview Copilot. All implementation decisions should be cross-referenced here.*

---

## 17. Execution Strategy — 1-Week Build with Claude Code Agents

### 17.1 Core Philosophy

> **Build in vertical slices, not horizontal layers.** Each day delivers a working, demonstrable feature — not half-finished infrastructure. Agents work in parallel on independent slices. You integrate and verify daily.

Three rules for agent-driven development at this pace:
1. **One CLAUDE.md per module** — each agent gets its exact context, no hallucination about project structure
2. **Tests before features** — every agent runs TDD; broken builds are caught in minutes, not at the end of the week
3. **Merge daily** — never let agent branches diverge more than 1 day from main

---

### 17.2 Repository Structure (pre-plan before any agent touches code)

```
interview-copilot/
├── CLAUDE.md                  ← global agent context (project rules, stack, patterns)
├── apps/
│   ├── desktop/               ← Electron + React app
│   │   ├── CLAUDE.md          ← desktop-specific agent context
│   │   ├── src/
│   │   │   ├── main/          ← Electron main process
│   │   │   ├── renderer/      ← React app
│   │   │   │   ├── screens/   ← Onboarding, JobContext, Session, Settings
│   │   │   │   ├── components/
│   │   │   │   ├── providers/ ← LLM gateway, STT gateway
│   │   │   │   ├── store/     ← Zustand state
│   │   │   │   └── hooks/
│   │   │   └── shared/        ← types shared between main + renderer
│   └── backend/               ← FastAPI service
│       ├── CLAUDE.md          ← backend-specific agent context
│       ├── app/
│       │   ├── api/           ← route handlers
│       │   ├── models/        ← SQLAlchemy models
│       │   ├── services/      ← business logic
│       │   └── providers/     ← LLM, STT integrations
│       └── tests/
├── docs/
│   └── claude.md              ← this file (design record)
└── .github/
    └── workflows/             ← CI: lint, test, build check
```

---

### 17.3 CLAUDE.md Strategy (Critical for Agent Quality)

Create these files **before starting any agent work**. They are the agent's operating manual.

**Root `CLAUDE.md`** — global rules:
```markdown
# Interview Copilot — Agent Context

## Stack
- Desktop: Electron + React 18 + TypeScript + Tailwind + Zustand
- Backend: FastAPI + PostgreSQL + SQLAlchemy

## Rules
- NEVER mutate state directly — use Zustand actions
- ALWAYS handle errors — no silent catches
- ALL LLM calls go through src/renderer/providers/llm-gateway.ts
- ALL STT calls go through src/renderer/providers/stt-gateway.ts
- Write tests first. Min 80% coverage.
- Files max 400 lines. Functions max 50 lines.

## Architecture Decisions
- See docs/claude.md for full design record
```

**`apps/desktop/CLAUDE.md`** — Electron-specific:
```markdown
# Desktop App Agent Context

## Electron IPC channels
- audio:start-capture / audio:stop-capture
- screenshot:capture
- window:set-opacity
- window:set-always-on-top

## State shape (Zustand)
- onboarding: { name, resume, resumeContext }
- jobContext: { url, title, description }
- session: { id, status, transcript[], currentAnswer }
- settings: { llmProvider, sttProvider, apiKeys }
```

---

### 17.4 Day-by-Day Execution Plan

#### Day 1 — Foundation (Monday)
**Goal:** Running Electron + React app on both macOS and Windows with navigation between all 3 screens.

| Agent Task | Claude Code Command | Parallelizable? |
|-----------|---------------------|-----------------|
| Scaffold Electron + React + TypeScript + Tailwind | `claude "scaffold electron app with react 18, typescript, tailwind, zustand. Use electron-builder for packaging."` | N (must be first) |
| Set up CI (GitHub Actions — lint + build check) | `claude "add github actions workflow: eslint, typescript check, electron build on push"` | Y (after scaffold) |
| Implement 3-screen navigation shell | `claude "implement screen navigation: Onboarding → JobContext → Session using react-router in renderer"` | Y (after scaffold) |
| Electron window: stealth mode + opacity | `claude "implement setContentProtection(true) and setOpacity IPC channel in electron main process"` | Y (after scaffold) |

**End of Day 1 check:** App opens, you can click Next through all 3 screens, window is invisible in screen share, opacity slider works.

---

#### Day 2 — Onboarding + Job Context + LLM Gateway
**Goal:** Resume parsed, job context loaded, first LLM call working.

| Agent Task | Notes |
|-----------|-------|
| Build Onboarding screen (name + resume upload) | pdf-parse local, drag-drop file input |
| Build LLM Gateway with 3 providers | Anthropic, OpenAI, Ollama — unified interface |
| Resume → LLM parse → structured JSON context | System prompt to extract skills, experience, education |
| Build Job Context screen + URL auto-scrape | Cheerio for simple pages, Firecrawl for complex |
| Build Settings screen (API key entry, provider selector) | electron-store for encrypted key storage |

**Parallel agent launch example:**
```bash
# Terminal 1
claude "build onboarding screen with resume upload. Use pdf-parse. Store parsed text in Zustand onboarding slice."

# Terminal 2
claude "build LLM gateway in src/renderer/providers/llm-gateway.ts supporting Anthropic, OpenAI, Ollama. Unified AsyncIterable streaming interface."

# Terminal 3
claude "build settings screen: API key inputs for Anthropic/OpenAI/Groq/Gemini/OpenRouter. Save to electron-store encrypted. Include provider selector dropdown."
```

---

#### Day 3 — Audio Pipeline + STT
**Goal:** Mic and system audio captured; live transcript appearing on screen.

| Agent Task | Risk | Mitigation |
|-----------|------|------------|
| Mic capture via node-audiorecorder | Low | Well-documented |
| macOS loopback via BlackHole detection | HIGH | Auto-detect BlackHole; show setup guide if missing |
| Windows WASAPI loopback via native addon | HIGH | Use `naudiodon` package — pre-built binaries |
| Deepgram WebSocket streaming STT | Medium | Mock Deepgram in tests with recorded audio |
| STT Gateway (Deepgram + Whisper + local) | Low | Same unified interface pattern as LLM gateway |
| Live transcript display component | Low | Simple React state updates |

> **Architect note:** This is the hardest day. If Windows WASAPI hits a wall, fall back to: ask the user to route audio through a virtual cable (VB-Audio on Windows — free). Ship the guide, not the native code. Don't block the week on this.

---

#### Day 4 — Interview Session Screen
**Goal:** Full interview session working end-to-end — audio in, LLM answer out.

| Agent Task | Notes |
|-----------|-------|
| Auto-listen mode: question detection | Silence detection (1.5s) + question heuristic on transcript |
| Manual record button (push-to-talk) | IPC: start/stop recording on button press |
| LLM call assembly: resume + JD + question | Context builder function |
| Streaming response display | Token-by-token render with react-markdown |
| Session transcript state management | Append interviewer/candidate/llm entries to Zustand |

```bash
# Run these agents in parallel (they own different files):
claude "implement auto-listen mode in session screen. Detect questions from interviewer stream using silence threshold and heuristic patterns."

claude "implement streaming LLM response display. Use AsyncIterable from llm-gateway. Render markdown token by token with fade-in animation."

claude "build session transcript panel: scrollable list of interviewer/candidate/llm entries, color-coded by speaker."
```

---

#### Day 5 — Screenshot Feature + Session Persistence (Local)
**Goal:** Screenshot to LLM working. Session saved to local SQLite.

| Agent Task | Notes |
|-----------|-------|
| Screenshot capture with stealth toggle | Atomic: setContentProtection(false) → capture → re-enable |
| Screenshot → vision LLM call | Extend LLM gateway with `analyzeScreenshot()` method |
| Local session persistence (SQLite) | better-sqlite3, save every 10s |
| Session history screen | List past sessions, open to view transcript |
| Export session as Markdown | Simple formatter, save to Downloads folder |

---

#### Day 6 — Backend Service
**Goal:** Sessions syncing to cloud. Auth working.

```bash
# These are fully independent — run all in parallel:
claude "scaffold FastAPI backend with PostgreSQL. Models: User, Session, TranscriptEntry, Screenshot. Alembic migrations."

claude "implement auth endpoints: POST /auth/google (OAuth exchange), JWT middleware."

claude "implement session endpoints: POST /sessions, GET /sessions, PUT /sessions/:id/transcript, POST /sessions/:id/screenshots."

claude "add S3 upload for screenshots. Pre-signed URLs for retrieval."
```

Desktop: wire up background sync — batch transcript entries every 10s, upload to backend. Fall back to SQLite queue if offline.

---

#### Day 7 — Polish, Packaging, Testing
**Goal:** Shippable build on macOS and Windows.

| Task | Tool |
|------|------|
| Run full test suite | `claude "run all tests, fix any failures"` |
| Code review pass | Launch `code-reviewer` agent across all changed files |
| Electron packaging | `electron-builder` — macOS .dmg + Windows .exe |
| macOS notarization | Apple Developer account required |
| Windows code signing | Signtool or self-signed for dev |
| Final UX pass | Opacity, animations, responsiveness |
| Write basic README | Setup guide, API key instructions |

---

### 17.5 Project Monitoring Tools

#### Task & Progress Tracking

| Tool | Use Case | Why |
|------|----------|-----|
| **GitHub Projects (Kanban)** | Daily task board | Free, lives with the repo, agents can reference issue numbers |
| **Linear** | If you want more power (sprints, estimates, priorities) | Better UX than GitHub Projects for solo or small team |
| **Notion** | Heavier documentation + task hybrid | Use if you already have a Notion workspace |

**Recommendation:** GitHub Projects for a 1-week build. Create one board with columns: `Backlog → In Progress → In Review → Done`. Each agent task = one card. Move them as agents complete work.

#### Build & Quality Monitoring

| Tool | Purpose | Setup |
|------|---------|-------|
| **GitHub Actions** | CI: lint + typecheck + test on every push | Set up Day 1 |
| **Codecov** | Track test coverage across the week | Free for public repos |
| **ESLint + TypeScript strict** | Catch errors before agents introduce them | Add to pre-commit hook |
| **Sentry** | Runtime error tracking in the desktop app | `@sentry/electron` — errors surface immediately |

#### Agent Work Monitoring

| Practice | How |
|----------|-----|
| **Daily branch review** | Each morning: `git log --oneline --all` to see what agents committed |
| **Claude Code `/review-pr`** | After each agent finishes, run `/review-pr` to get a code review |
| **Build status badge** | Add to README — instant visual on whether the build is green |
| **`claude-mem` memory** | Use `claude-mem` MCP to persist agent decisions across sessions |

#### Performance & Latency Monitoring (runtime)

| Tool | What it tracks |
|------|---------------|
| **Sentry Performance** | LLM call latency, STT latency, time-to-first-token |
| **Custom telemetry** | Log `{ provider, model, latency_ms, token_count }` for every LLM call locally |
| **Electron DevTools** | Memory usage, renderer performance (open with Ctrl+Shift+I) |

---

### 17.6 Agent Orchestration Cheatsheet

#### Starting a new feature
```bash
# 1. Create a git worktree so agent has isolated branch
git worktree add ../copilot-feature-audio feature/audio-pipeline

# 2. Give agent full context
claude --context apps/desktop/CLAUDE.md "implement audio pipeline..."

# 3. Review, merge, delete worktree
git merge feature/audio-pipeline
git worktree remove ../copilot-feature-audio
```

#### Parallel agents (independent modules)
```bash
# Open 3 terminal tabs, launch simultaneously:
# Tab 1: Frontend feature
# Tab 2: Backend feature
# Tab 3: Tests for yesterday's work
```

#### When an agent gets stuck
1. Check `CLAUDE.md` — is the context missing something the agent needs?
2. Use `build-error-resolver` agent if it's a build failure
3. Narrow the task — give the agent one file at a time, not a whole feature
4. If a third-party API is the issue, mock it and move on

#### Daily agent wrap-up
```bash
# End of each day, run:
claude "review all changes since yesterday, identify any TODOs, missing error handling, or incomplete implementations. Write a summary."
```

---

### 17.7 Risk Register for the 1-Week Timeline

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Windows WASAPI loopback is complex | HIGH | High | Ship macOS first; use VB-Audio cable workaround for Windows |
| macOS BlackHole setup friction | MEDIUM | Medium | Auto-detect + in-app setup wizard |
| LLM latency too high for auto-listen UX | MEDIUM | High | Use Groq (fastest) as default for auto-listen; Claude for manual |
| Resume parsing fails on image PDFs | MEDIUM | Low | Fall back to asking user to paste text manually |
| Week is too short for backend + auth | MEDIUM | Low | Skip backend entirely for MVP — use local SQLite only; backend is Phase 3 |
| Electron build fails on Windows CI | LOW | Medium | Test Windows build locally Day 1, not Day 7 |

> **Senior Architect's honest take:** In one week with heavy agent use, you can reliably ship: Electron shell + stealth + opacity + onboarding + LLM gateway (multi-provider) + manual interview mode + screenshot feature. Auto-listen (Day 3) and backend sync (Day 6) are stretch goals. Plan for those to slip to Week 2. The core value — seeing LLM answers invisibly during an interview — is achievable in 3 days.

---

### 17.8 Suggested Week-1 MVP Scope (De-risked)

Cut these for Week 1, ship in Week 2:
- ❌ Backend service (use SQLite only)
- ❌ Google OAuth / user accounts
- ❌ Auto-listen mode (ship manual mode first)
- ❌ Windows build (macOS first)
- ❌ Deepgram real-time streaming (Whisper batch is fine for manual mode)

Keep these for Week 1:
- ✅ Electron app (macOS)
- ✅ Onboarding (name + resume → LLM parse)
- ✅ Job context screen
- ✅ Multi-provider LLM gateway (Claude, OpenAI, Ollama)
- ✅ Manual record → Whisper STT → LLM answer
- ✅ Screenshot → vision LLM
- ✅ Stealth mode (setContentProtection)
- ✅ Opacity slider
- ✅ Local session save (SQLite)
- ✅ Streaming response display
