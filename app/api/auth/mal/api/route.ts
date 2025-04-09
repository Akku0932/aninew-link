import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the token, endpoint, and query params from the request body
    const { token, endpoint, params } = await request.json();

    if (!token || !endpoint) {
      return NextResponse.json(
        { error: 'Token and endpoint are required' },
        { status: 400 }
      );
    }

    // Base URL for MyAnimeList API
    const baseUrl = 'https://api.myanimelist.net/v2';
    const url = new URL(`${baseUrl}/${endpoint}`);
    
    // Add query parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Make the request to MyAnimeList API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Get the response data
    const data = await response.json();

    // Return the data to the client
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in MyAnimeList API proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 