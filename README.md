# Interview Copilot

> AI-powered stealth interview assistant — real-time answers, invisible to screen share.

[![CI](https://github.com/YOUR_USERNAME/interview-copilot/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/interview-copilot/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/interview-copilot/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/interview-copilot)

## Features

- **Stealth mode** — invisible to Zoom, Google Meet, and all screen-share tools (OS-level)
- **Multi-provider LLM** — Claude, GPT-4o, Gemini, Groq, Ollama (offline)
- **Real-time answers** — auto-detect interviewer questions or manual record mode
- **Screenshot analysis** — capture coding problems and get LLM solutions
- **Opacity control** — adjust window transparency with a slider
- **Session history** — all transcripts and answers saved locally

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### macOS Audio Setup
For interviewer audio capture, install [BlackHole](https://existential.audio/blackhole/) (free virtual audio device).

### Development

```bash
cd apps/desktop
npm install
npm run dev
```

### Build

```bash
npm run package:mac    # macOS .dmg
npm run package:win    # Windows .exe
```

### Tests

```bash
npm run test              # run once
npm run test:watch        # watch mode
npm run test:coverage     # with coverage report
```

## Architecture

See [`docs/claude.md`](docs/claude.md) for the full design document.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Electron 31 |
| UI | React 18 + TypeScript + Tailwind CSS |
| State | Zustand |
| LLM | Claude / GPT-4o / Gemini / Groq / Ollama |
| STT | Deepgram / Whisper / local faster-whisper |
| Tests | Vitest + React Testing Library |
| CI/CD | GitHub Actions + Codecov |

## Contributing

1. Branch from `develop`
2. Follow conventional commits (`feat:`, `fix:`, `chore:` etc.)
3. Maintain 80% test coverage
4. PRs require CI to pass

## License

MIT
