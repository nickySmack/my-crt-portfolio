import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'crt_session';
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error('SESSION_SECRET must be set to at least 32 characters.');
  }
  return value;
}

function sign(payload) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

// Hash both sides first so timingSafeEqual always compares equal-length buffers.
function safeEqual(a, b) {
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

export function isConfigured() {
  return Boolean(
    process.env.APP_USERNAME &&
      process.env.APP_PASSWORD &&
      process.env.SESSION_SECRET?.length >= 32
  );
}

export function checkCredentials(username, password) {
  if (!isConfigured()) return false;
  // Evaluate both comparisons so timing doesn't reveal which one failed.
  const userOk = safeEqual(username ?? '', process.env.APP_USERNAME);
  const passOk = safeEqual(password ?? '', process.env.APP_PASSWORD);
  return userOk && passOk;
}

export function createSessionToken(username) {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + MAX_AGE_SECONDS * 1000 })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token) {
  if (!token || !isConfigured()) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  if (!safeEqual(signature, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export async function setSessionCookie(username) {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

// For route handlers: returns a 401 response when there's no valid session.
export async function requireSession() {
  const session = await getSession();
  if (session) return { session };
  return {
    response: NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    ),
  };
}
