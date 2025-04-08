import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    const ANILIST_CLIENT_ID = "25870";
    const ANILIST_REDIRECT_URI = "https://aninew-link.vercel.app/auth/callback";

    // Server-to-server request to AniList token endpoint
    const response = await fetch("https://anilist.co/api/v2/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: ANILIST_CLIENT_ID,
        redirect_uri: ANILIST_REDIRECT_URI,
        code: code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('AniList token error:', errorData || response.statusText);
      return NextResponse.json(
        { error: 'Failed to exchange token with AniList' }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return new NextResponse(null, {
    status: 204,
    headers
  });
} 