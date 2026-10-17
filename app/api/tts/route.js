import { NextResponse } from 'next/server';
import { requireSession } from '../../../lib/session';
import { rateLimit } from '../../../lib/rate-limit';
import { TTS_MAX_CHARS as MAX_CHARS } from '../../../lib/limits';

const RESEMBLE_API_TOKEN = process.env.RESEMBLE_API_TOKEN;
const RESEMBLE_VOICE_UUID = process.env.RESEMBLE_VOICE_UUID;
const MAX_REQUESTS_PER_HOUR = parseInt(process.env.MAX_REQUESTS_PER_IP || '10', 10);

export async function POST(request) {
  const { session, response: unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  if (!rateLimit(`tts:${session.u}`, { limit: MAX_REQUESTS_PER_HOUR, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ success: false, message: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }

  const { text } = await request.json().catch(() => ({}));
  if (typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ success: false, message: 'Text is required.' }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return NextResponse.json({ success: false, message: `Text must be ${MAX_CHARS} characters or fewer.` }, { status: 400 });
  }

  if (!RESEMBLE_API_TOKEN || !RESEMBLE_VOICE_UUID) {
    console.error('RESEMBLE_API_TOKEN and RESEMBLE_VOICE_UUID must be set.');
    return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const resembleResponse = await fetch('https://f.cluster.resemble.ai/synthesize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEMBLE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voice_uuid: RESEMBLE_VOICE_UUID,
        data: text,
        output_format: 'mp3',
        sample_rate: 44100,
      }),
    });

    if (!resembleResponse.ok) {
      const errorData = await resembleResponse.json().catch(() => ({}));
      console.error('Resemble API Error:', resembleResponse.status, errorData);
      return NextResponse.json(
        { success: false, message: `Resemble API Error: ${errorData.message || resembleResponse.statusText}` },
        { status: 502 }
      );
    }

    const responseData = await resembleResponse.json();

    if (responseData.success && responseData.audio_content) {
      return NextResponse.json({
        success: true,
        audio_content: responseData.audio_content,
        audio_timestamps: responseData.audio_timestamps,
      });
    }
    return NextResponse.json(
      { success: false, message: 'Failed to synthesize audio.', issues: responseData.issues },
      { status: 502 }
    );
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
