import { NextResponse } from 'next/server';

const ANILIST_CLIENT_ID = "25870";
const ANILIST_CLIENT_SECRET = "doXAkby3ijsCpI5zCeLyg164KK0stGvmJdoshmAF";

export async function POST(request: Request) {
  try {
    // Get the authorization code from the request body
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange the code for a token with AniList
    const tokenResponse = await fetch('https://anilist.co/api/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: ANILIST_CLIENT_ID,
        client_secret: ANILIST_CLIENT_SECRET,
        redirect_uri: 'https://aninew-link.vercel.app/auth/callback',
        code,
      }),
    });

    if (!tokenResponse.ok) {
      // Forward the error from AniList
      const errorData = await tokenResponse.text();
      console.error('AniList token error:', errorData);
      return NextResponse.json(
        { error: 'Failed to exchange token with AniList' },
        { status: tokenResponse.status }
      );
    }

    // Get the token data
    const tokenData = await tokenResponse.json();

    // Return the token data to the client
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('Error in AniList token exchange:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 