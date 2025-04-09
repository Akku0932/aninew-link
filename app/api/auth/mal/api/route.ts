import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the token, endpoint, params, and method from the request body
    const { token, endpoint, params, method = 'GET' } = await request.json();

    if (!token || !endpoint) {
      return NextResponse.json(
        { error: 'Token and endpoint are required' },
        { status: 400 }
      );
    }

    // Base URL for MyAnimeList API
    const baseUrl = 'https://api.myanimelist.net/v2';
    const url = new URL(`${baseUrl}/${endpoint}`);
    
    // For GET requests, add query parameters
    if (method === 'GET' && params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    // For POST, PUT, DELETE requests with a body
    if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && params) {
      // Check if we need to use form data for specific endpoints like my_list_status
      if (endpoint.includes('my_list_status')) {
        // Use x-www-form-urlencoded for my_list_status endpoints
        requestOptions.headers = {
          ...requestOptions.headers,
          'Content-Type': 'application/x-www-form-urlencoded'
        };
        
        // Convert params to URLSearchParams for form encoding
        const formData = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        
        requestOptions.body = formData.toString();
      } else {
        // Use JSON for other endpoints
        requestOptions.headers = {
          ...requestOptions.headers,
          'Content-Type': 'application/json'
        };
        requestOptions.body = JSON.stringify(params);
      }
    }

    console.log(`Making ${method} request to MAL API:`, url.toString());

    // Make the request to MyAnimeList API
    const response = await fetch(url.toString(), requestOptions);

    // Check if the response is not OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error('MAL API error:', response.status, errorText);
      return NextResponse.json(
        { 
          error: `MAL API returned ${response.status}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    // Parse response - handle empty responses for DELETE/PUT
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : { success: true };
    }

    // Return the data to the client
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in MyAnimeList API proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 