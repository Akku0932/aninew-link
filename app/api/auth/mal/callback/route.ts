import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Get the authorization code from the URL
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  if (!code) {
    // Redirect to error page if no code is provided
    return NextResponse.redirect(new URL('/auth/error?error=no_code', url.origin));
  }
  
  // Redirect to the front-end with the code
  // The front-end will handle the token exchange
  const redirectUrl = new URL('/', url.origin);
  redirectUrl.searchParams.append('code', code);
  if (state) {
    redirectUrl.searchParams.append('state', state);
  }
  
  console.log('Redirecting from MAL callback to:', redirectUrl.toString());
  
  return NextResponse.redirect(redirectUrl);
} 