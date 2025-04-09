import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the token, query, and variables from the request body
    const { token, query, variables } = await request.json();

    if (!token || !query) {
      return NextResponse.json(
        { error: 'Token and query are required' },
        { status: 400 }
      );
    }

    // Make the GraphQL request to AniList
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query,
        variables: variables || {}
      })
    });

    // Get the response data
    const data = await response.json();

    // Return the data to the client
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in AniList GraphQL proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 