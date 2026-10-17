import { NextResponse } from 'next/server';
import { requireSession } from '../../../lib/session';

export async function GET() {
  const { response: unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${process.env.NEXT_PUBLIC_AGENT_ID}`,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs responded ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (error) {
    console.error('get-signed-url failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}
