import { NextResponse } from 'next/server';

const MAL_CLIENT_ID = "5105b8eb05adcc56e3c1eff800c98a30";
const MAL_CLIENT_SECRET = "eea5c9902db45b3e7fb543a9f81c7a3784a8d23c7836cd76a0bb89531e0fbe88";
const REDIRECT_URI = "http://localhost:3000/profile";

export async function POST(request: Request) {
  try {
    const { code, code_verifier } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    console.log("Received MyAnimeList auth code:", code);
    console.log("Code verifier:", code_verifier || "None provided");

    // Exchange authorization code for token
    const tokenResponse = await fetch('https://myanimelist.net/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: MAL_CLIENT_ID,
        client_secret: MAL_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: code_verifier || '' // Include code_verifier if provided
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('MyAnimeList token error response:', tokenResponse.status, errorText);
      return NextResponse.json(
        { error: `Token exchange failed: ${tokenResponse.status}`, details: errorText },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log("Token successfully obtained from MyAnimeList");

    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('Error in MyAnimeList auth:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 