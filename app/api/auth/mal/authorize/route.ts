import { NextResponse } from 'next/server';
import crypto from 'crypto';

const MAL_CLIENT_ID = "5105b8eb05adcc56e3c1eff800c98a30";

// Function to create a PKCE code verifier
function generateCodeVerifier(length = 128) {
  return crypto.randomBytes(length)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .slice(0, length);
}

// Function to create a PKCE code challenge from the verifier
function generateCodeChallenge(verifier: string) {
  const hash = crypto.createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
    
  return hash;
}

export async function GET(request: Request) {
  try {
    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    
    // Determine the correct redirect URI based on environment
    const url = new URL(request.url);
    const redirectUri = process.env.NODE_ENV === 'production'
      ? 'https://aninew-seven.vercel.app/api/auth/mal/callback'
      : 'http://localhost:3000/api/auth/mal/callback';
      
    // Generate state parameter to prevent CSRF
    const state = crypto.randomBytes(16).toString('hex');
    
    // Create the authorization URL
    const authorizeUrl = new URL('https://myanimelist.net/v1/oauth2/authorize');
    authorizeUrl.searchParams.append('response_type', 'code');
    authorizeUrl.searchParams.append('client_id', MAL_CLIENT_ID);
    authorizeUrl.searchParams.append('redirect_uri', redirectUri);
    authorizeUrl.searchParams.append('code_challenge', codeChallenge);
    authorizeUrl.searchParams.append('code_challenge_method', 'S256');
    authorizeUrl.searchParams.append('state', state);
    
    // Add optional parameters
    // MAL-specific scopes
    authorizeUrl.searchParams.append('scope', 'list write');
    
    // Return the authorization URL and code verifier
    return NextResponse.json({
      authUrl: authorizeUrl.toString(),
      codeVerifier,
      state
    });
  } catch (error) {
    console.error('Error generating MAL authorization URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
} 