import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Decode URL if it's encoded (handle potential double encoding)
    while (url.includes('%')) {
      url = decodeURIComponent(url);
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Origin': 'https://gogoanime.cl',
        'Referer': 'https://gogoanime.cl/',
      },
    });

    // If it's an m3u8 file, we need to rewrite the URLs
    const contentType = response.headers.get('content-type');
    let body = response.body;

    if (contentType?.includes('application/vnd.apple.mpegurl') || contentType?.includes('application/x-mpegurl')) {
      const text = await response.text();
      // Get the base URL from the original URL
      const baseUrl = new URL(url);
      baseUrl.search = ''; // Remove query parameters
      baseUrl.hash = '';  // Remove hash

      // Replace relative URLs with absolute ones and proxy them
      const modifiedText = text.replace(/^(?!#)(?!https?:\/\/)([^#][^\r\n]*)/gm, (match) => {
        const absoluteUrl = new URL(match, baseUrl.href).href;
        return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
      });

      // Create a new readable stream from the modified text
      body = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(modifiedText));
          controller.close();
        }
      });
    }

    // Copy all headers from the original response
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');

    // Create response with the processed body and headers
    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 });
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', '*');
  
  return new NextResponse(null, {
    status: 204,
    headers
  });
}
