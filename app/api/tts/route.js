// app/api/tts/route.js
import { NextRequest, NextResponse } from 'next/server';

// Environment variables for credentials
const RESEMBLE_API_TOKEN = process.env.RESEMBLE_API_TOKEN;
const RESEMBLE_VOICE_UUID = process.env.RESEMBLE_VOICE_UUID || "55592656"; // Default if not set
const VALID_USERNAME = process.env.APP_USERNAME || "user";
const VALID_PASSWORD = process.env.APP_PASSWORD || "pass";

// --- Rate Limiting (optional but recommended) ---
const MAX_REQUESTS_PER_IP = parseInt(process.env.MAX_REQUESTS_PER_IP || "10");
const ipRequestCounts = new Map();
const rateLimitWindowMs = 60 * 60 * 1000; // 1 hour window

export async function POST(request) {
  const { username, password, text } = await request.json();

  // --- Authentication ---
  if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
    return NextResponse.json({ success: false, message: "Unauthorized: Invalid credentials." }, { status: 401 });
  }

  // --- Rate Limiting ---
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, []);
  }
  const userRequests = ipRequestCounts.get(ip).filter(timestamp => now - timestamp < rateLimitWindowMs);
  if (userRequests.length >= MAX_REQUESTS_PER_IP) {
    ipRequestCounts.set(ip, userRequests);
    return NextResponse.json({ success: false, message: "Rate limit exceeded. Please try again later." }, { status: 429 });
  }
  ipRequestCounts.get(ip).push(now);

  // --- Resemble API Call ---
  if (!RESEMBLE_API_TOKEN) {
    console.error("RESEMBLE_API_TOKEN is not set.");
    return NextResponse.json({ success: false, message: "Server configuration error." }, { status: 500 });
  }

  try {
    // Correct API endpoint and request structure based on user-provided documentation
    const resembleResponse = await fetch("https://f.cluster.resemble.ai/synthesize", {
      method: 'POST',
      headers: {
        // Corrected Authentication Header
        'Authorization': `Bearer ${RESEMBLE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      // Corrected Request Body
      body: JSON.stringify({
        voice_uuid: RESEMBLE_VOICE_UUID,
        data: text,
        output_format: "mp3",
        sample_rate: 44100 // Common sample rate, supported by Resemble
      }),
    });

    if (!resembleResponse.ok) {
      const errorData = await resembleResponse.json().catch(() => ({}));
      console.error("Resemble API Error:", resembleResponse.status, errorData);
      return NextResponse.json({ success: false, message: `Resemble API Error: ${errorData.message || resembleResponse.statusText}` }, { status: resembleResponse.status });
    }

    const responseData = await resembleResponse.json();
    
    // Correctly handle the flat response structure
    if (responseData.success && responseData.audio_content) {
      return NextResponse.json({
        success: true,
        audio_content: responseData.audio_content,
        audio_timestamps: responseData.audio_timestamps, // Pass the timestamps to the frontend
      });
    } else {
      // Pass along any issues reported by the API
      return NextResponse.json({ success: false, message: "Failed to synthesize audio.", issues: responseData.issues });
    }

  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}