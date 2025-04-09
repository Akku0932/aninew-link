import { NextResponse } from 'next/server';

const MAL_CLIENT_ID = "5105b8eb05adcc56e3c1eff800c98a30";
const MAL_CLIENT_SECRET = "eea5c9902db45b3e7fb543a9f81c7a3784a8d23c7836cd76a0bb89531e0fbe88";

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

    const redirectUri = 'https://aninew-link.vercel.app/auth/callback';

    // Exchange the code for a token with MyAnimeList
    const tokenResponse = await fetch('https://myanimelist.net/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        client_id: MAL_CLIENT_ID,
        client_secret: MAL_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      // Forward the error from MyAnimeList
      const errorData = await tokenResponse.text();
      console.error('MyAnimeList token error:', errorData);
      return NextResponse.json(
        { error: 'Failed to exchange token with MyAnimeList' },
        { status: tokenResponse.status }
      );
    }

    // Get the token data
    const tokenData = await tokenResponse.json();

    // Return the token data to the client
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('Error in MyAnimeList token exchange:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 