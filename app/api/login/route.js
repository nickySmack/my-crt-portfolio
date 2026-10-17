import { NextResponse } from 'next/server';
import { checkCredentials, isConfigured, setSessionCookie } from '../../../lib/session';
import { clientIp, rateLimit } from '../../../lib/rate-limit';

export async function POST(request) {
  if (!isConfigured()) {
    console.error('Login disabled: APP_USERNAME, APP_PASSWORD and SESSION_SECRET must be set.');
    return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
  }

  if (!rateLimit(`login:${clientIp(request)}`, { limit: 10, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json({ success: false, message: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const { username, password } = await request.json().catch(() => ({}));

  if (!checkCredentials(username, password)) {
    return NextResponse.json({ success: false, message: 'Access Denied: Invalid Credentials' }, { status: 401 });
  }

  await setSessionCookie(username);
  return NextResponse.json({ success: true });
}
