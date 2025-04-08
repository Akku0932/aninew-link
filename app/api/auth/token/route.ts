import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    console.log("Received code for token exchange");

    const ANILIST_CLIENT_ID = "25870";
    // Some OAuth providers require a client secret - check your AniList developer settings
    const ANILIST_CLIENT_SECRET = process.env.ANILIST_CLIENT_SECRET || "";
    const ANILIST_REDIRECT_URI = "https://aninew-link.vercel.app/auth/callback";

    // Prepare token request body with TypeScript interface
    interface TokenRequestBody {
      grant_type: string;
      client_id: string;
      redirect_uri: string;
      code: string;
      client_secret?: string; // Optional client secret
    }
    
    const tokenRequestBody: TokenRequestBody = {
      grant_type: "authorization_code",
      client_id: ANILIST_CLIENT_ID,
      redirect_uri: ANILIST_REDIRECT_URI,
      code: code
    };

    // Add client_secret if it exists
    if (ANILIST_CLIENT_SECRET) {
      tokenRequestBody.client_secret = ANILIST_CLIENT_SECRET;
    }

    console.log(`Making token request to AniList with redirect URI: ${ANILIST_REDIRECT_URI}`);

    // Server-to-server request to AniList token endpoint
    const response = await fetch("https://anilist.co/api/v2/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(tokenRequestBody),
    });

    if (!response.ok) {
      let errorDetails = `Status: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        console.error('AniList token error data:', errorData);
        errorDetails += `, Error data: ${JSON.stringify(errorData)}`;
      } catch (parseError) {
        const textBody = await response.text().catch(() => "(empty response)");
        console.error('AniList token error body:', textBody);
        errorDetails += `, Raw response: ${textBody}`;
      }
      
      console.error(`AniList token exchange failed: ${errorDetails}`);
      
      return NextResponse.json(
        { error: 'Failed to exchange token with AniList', details: errorDetails }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Successfully obtained token from AniList");
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
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