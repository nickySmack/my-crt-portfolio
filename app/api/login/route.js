// app/api/login/route.js

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Securely access server-side environment variables
    const validUsername = process.env.APP_USERNAME;
    const validPassword = process.env.APP_PASSWORD;

    // Check if the provided credentials match the environment variables
    if (username === validUsername && password === validPassword) {
      // If they match, send a success response
      return NextResponse.json({ success: true });
    } else {
      // If they don't match, send a failure response
      return NextResponse.json({ success: false }, { status: 401 }); // 401 Unauthorized
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'An internal error occurred' }, { status: 500 });
  }
}