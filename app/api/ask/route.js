import { streamText } from 'ai';
import { checkBotId } from 'botid/server';
import { NextResponse } from 'next/server';
import { portfolioAsText, profile } from '../../../lib/content';
import { ASK_MAX_CHARS } from '../../../lib/limits';
import { clientIp, rateLimit } from '../../../lib/rate-limit';

const MODEL = 'anthropic/claude-haiku-5.5';
const MAX_TURNS = 8;

const instructions = `You are nickbot, a small assistant living in the retro terminal on ${profile.name}'s portfolio site.
Visitors (often recruiters or other developers) ask you about Nick. Answer in the third person, using ONLY the dossier below.
If the dossier doesn't cover something, say you don't know and suggest reading his resume (the "resume" command).
Keep answers under 120 words. Plain text only: no markdown, no bullet symbols, no headings.
A little dry humor fits the terminal vibe, but stay accurate. Politely decline requests unrelated to Nick or this site.

<dossier>
${portfolioAsText()}
</dossier>`;

function parseMessages(body) {
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const recent = messages.slice(-MAX_TURNS);
  for (const m of recent) {
    if (m?.role !== 'user' && m?.role !== 'assistant') return null;
    if (typeof m.content !== 'string' || !m.content.trim()) return null;
    if (m.role === 'user' && m.content.length > ASK_MAX_CHARS) return null;
  }
  if (recent.at(-1).role !== 'user') return null;
  return recent.map(({ role, content }) => ({ role, content: content.slice(0, 2000) }));
}

export async function POST(request) {
  // BotID is a Vercel service; it throws when run elsewhere (e.g. local `next start`).
  if (process.env.VERCEL) {
    const verification = await checkBotId();
    if (verification.isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  }

  if (!rateLimit(`ask:${clientIp(request)}`, { limit: 20, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  const messages = parseMessages(await request.json().catch(() => null));
  if (!messages) {
    return NextResponse.json({ error: `Questions must be 1-${ASK_MAX_CHARS} characters.` }, { status: 400 });
  }

  // Off Vercel there's no OIDC token, so an API key is required.
  if (!process.env.VERCEL && !process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    return NextResponse.json({ error: 'nickbot is offline (AI Gateway not configured).' }, { status: 503 });
  }

  const result = streamText({
    model: MODEL,
    instructions,
    messages,
    maxOutputTokens: 400,
    abortSignal: request.signal,
    onError: ({ error }) => console.error('ask stream error:', error),
  });

  return result.toTextStreamResponse();
}
