import { NextResponse } from 'next/server';

const MAL_CLIENT_ID = "5105b8eb05adcc56e3c1eff800c98a30";
const MAL_CLIENT_SECRET = "eea5c9902db45b3e7fb543a9f81c7a3784a8d23c7836cd76a0bb89531e0fbe88";

export async function POST(request: Request) {
  try {
    // Get the authorization code and code verifier from the request body
    const { code, code_verifier } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Update the redirect URI to match your application's URL
    // This MUST match exactly what you registered with MyAnimeList
    const redirectUri = process.env.NODE_ENV === 'production' 
      ? 'https://aninew-seven.vercel.app/api/auth/mal/callback'  // Production URL
      : 'http://localhost:3000/api/auth/mal/callback';  // Development URL

    console.log('Using redirect URI:', redirectUri);
    console.log('Auth code:', code.substring(0, 10) + '...');
    console.log('Code verifier length:', code_verifier ? code_verifier.length : 'none');

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
        code_verifier: code_verifier || 'default_verifier', // Fallback for compatibility
      }).toString(),
    });

    if (!tokenResponse.ok) {
      // Forward the error from MyAnimeList
      const errorText = await tokenResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { raw: errorText };
      }
      
      console.error('MyAnimeList token error:', errorData);
      return NextResponse.json(
        { 
          error: 'Failed to exchange token with MyAnimeList',
          details: errorData
        },
        { status: tokenResponse.status }
      );
    }

    // Get the token data
    const tokenData = await tokenResponse.json();
    console.log('Received token data. Access token length:', tokenData.access_token?.length || 0);

    // Return the token data to the client
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('Error in MyAnimeList token exchange:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 