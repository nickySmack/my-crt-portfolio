# Portfolio Modernization Plan

Branch: `modernize-portfolio`

Goal: take the CRT portfolio from "great" to "outstanding" by (1) locking down the AI
endpoints, (2) server-rendering real content with the typewriter as an enhancement, and
(3) turning the page into an interactive terminal with an "Ask Nick" agent.

Status legend: `[ ]` todo · `[x]` done · `[~]` needs input from Nick (account / env / decision)

---

## Phase 0 — Foundation

- [x] 0.1 Upgrade Next.js 15.3 → 16.4 (React 19.3, `eslint-config-next` 16, ESLint flat config, `next lint` → `eslint .`)
- [x] 0.2 Replace unused Geist fonts with VT323 via `next/font`
- [x] 0.3 Rewrite `globals.css`: Tailwind v4 theme + utilities imports (the old `@tailwind utilities`
      left theme-based classes like `text-red-500`/`p-24` without values), theme tokens, no duplicates

## Phase 1 — Secure the AI endpoints

- [x] 1.1 Signed, httpOnly session cookie (HMAC via `SESSION_SECRET`) issued by `/api/login` — `lib/session.js`
- [x] 1.2 Constant-time credential comparison; no default `"user"`/`"pass"`; fails closed if env is missing
- [x] 1.3 `/api/get-signed-url` and `/api/tts` require a valid session (verified: 401 without / with forged cookie)
- [x] 1.4 `/agent` and `/tts` check the session server-side (survives refresh); `/api/logout` + log out button
- [x] 1.5 TTS input validated server-side (type, empty, 3000-char cap)
- [x] 1.6 `/tts` crash fixed (`setText` was undefined); per-render `console.log` removed
- [x] 1.6b Login attempts rate-limited (10 / 15 min / IP, best effort)
- [~] 1.7 Durable rate limiting — `lib/rate-limit.js` is per-instance memory. Needs a shared store
      (e.g. Upstash Redis via Vercel Marketplace) or Vercel Firewall rate-limit rules
- [~] 1.8 Decision: make the voice agent public behind BotID + rate limits instead of a password

## Phase 2 — Server-rendered content, accessibility, SEO

- [x] 2.1 Portfolio copy moved to `lib/content.js`; home page is a Server Component with full HTML
- [x] 2.2 Typewriter is progressive enhancement (`components/Typewriter.js`): text is in the HTML,
      blanked and re-typed after hydration with height reserved (no layout shift); failsafe reveals
      content if JS never claims the intro
- [x] 2.3 Respects `prefers-reduced-motion`; any key / click skips; plays once per session
- [x] 2.4 Content container is `aria-busy` while typing; full text otherwise
- [x] 2.5 Real metadata: title template, description, Open Graph / Twitter, `metadataBase`
- [x] 2.6 Generated Open Graph image (`app/opengraph-image.js`)

## Phase 3 — Interactive terminal

- [x] 3.1 Global CRT overlay: drifting scanlines, rolling refresh bar, vignette (reduced-motion aware)
- [x] 3.2 Skippable BIOS-style boot sequence (~1.5s)
- [x] 3.3 Terminal: `help`, `about`, `skills`, `projects`, `resume`, `agent`, `theme`, `clear`
      (+ hidden easter eggs), ↑/↓ history, Tab completion, Ctrl+L, type-anywhere-to-focus
- [x] 3.4 `ask <question>` — streaming nickbot (`/api/ask`, AI SDK 7 + AI Gateway, Claude Haiku 5.5),
      grounded in `lib/content.js`, follow-up context, Ctrl+C to cancel, BotID-protected
- [~] 3.5 AI Gateway credentials for `ask`: enable on the Vercel project (OIDC); locally `vercel env pull`
      or set `AI_GATEWAY_API_KEY`. Until then `ask` replies "nickbot is offline"
- [x] 3.6 Voice agent rebuilt for `@elevenlabs/react` v1 (`ConversationProvider`), CRT-styled with
      live frequency visualizer, mute, transcript; TTS kiosk gets a waveform scope

## Phase 4 — Polish

- [x] 4.1 Agent/TTS errors shown in the UI (mic denied, session expired, connection lost)
- [x] 4.2 README rewritten with features, stack, env vars
- [x] 4.3 `npm run lint` clean, `npm run build` clean, curl checks of auth gates, browser pass of intro + terminal
- [ ] 4.4 Manual pass by Nick: sign in to `/agent` and place a call; generate audio on `/tts`; try `ask` once
      the gateway is enabled; check on a phone

---

## Env vars

| Name | Used by | Notes |
| --- | --- | --- |
| `APP_USERNAME` / `APP_PASSWORD` | login | required; no defaults |
| `SESSION_SECRET` | session cookie | **new** — 32+ random chars (added to local `.env.local`; add to Vercel) |
| `ELEVENLABS_API_KEY`, `NEXT_PUBLIC_AGENT_ID` | voice agent | existing |
| `RESEMBLE_API_TOKEN`, `RESEMBLE_VOICE_UUID` | TTS | existing; voice UUID no longer has a hardcoded fallback |
| `AI_GATEWAY_API_KEY` | `ask` command | **new** — local only; Vercel uses OIDC |
