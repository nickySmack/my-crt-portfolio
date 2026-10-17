# herrewyn — CRT portfolio

Personal portfolio of Nicholas Herrewyn, styled as a retro green-phosphor terminal.

- **Home (`/`)** — server-rendered portfolio with a skippable boot + typewriter intro
  (first visit per session; disabled under `prefers-reduced-motion`), followed by an
  interactive terminal: `help`, `about`, `skills`, `projects`, `resume`, `ask`, `agent`,
  `theme`, `clear` (↑/↓ history, Tab completion, Ctrl+C cancels `ask`, Ctrl+L clears).
- **`ask <question>`** — "nickbot", a streaming AI assistant grounded in `lib/content.js`,
  via the AI SDK + Vercel AI Gateway. Protected by Vercel BotID and a best-effort rate limit.
- **`/agent`** — real-time ElevenLabs voice agent with live audio visualizer and transcript.
- **`/tts`** — Resemble AI text-to-speech kiosk.

`/agent` and `/tts` sit behind a login that issues a signed, httpOnly session cookie.
Their API routes reject requests without a valid session.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 · AI SDK 7 · ElevenLabs React SDK · Vercel BotID

## Content

All portfolio copy lives in [`lib/content.js`](lib/content.js). The home page, the terminal
commands, and nickbot's knowledge all read from it, so edit it in one place.

## Environment variables

| Name | Required for | Notes |
| --- | --- | --- |
| `APP_USERNAME`, `APP_PASSWORD` | `/agent`, `/tts` login | No defaults; login is disabled if unset |
| `SESSION_SECRET` | session cookie | 32+ random characters. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `ELEVENLABS_API_KEY`, `NEXT_PUBLIC_AGENT_ID` | `/agent` | |
| `RESEMBLE_API_TOKEN`, `RESEMBLE_VOICE_UUID` | `/tts` | |
| `MAX_REQUESTS_PER_IP` | `/tts` | Requests per session per hour (default 10) |
| `AI_GATEWAY_API_KEY` | `ask` (local dev) | On Vercel, OIDC is used automatically — run `vercel env pull` locally instead |

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

To replay the intro, clear session storage (or open a new tab).
