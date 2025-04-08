import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    console.log(`Proxying request to: ${decodedUrl.substring(0, 100)}${decodedUrl.length > 100 ? '...' : ''}`);
    
    // Add caching headers for HLS segments
    const isM3u8 = decodedUrl.includes('.m3u8') || decodedUrl.includes('.ts');
    const cacheControl = isM3u8 ? 'public, max-age=60' : 'no-cache';
    
    // Fetch with timeout and retry
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    let response;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        response = await fetch(decodedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': new URL(decodedUrl).origin,
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aninew.link',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'Connection': 'keep-alive',
          },
          signal: controller.signal,
          cache: isM3u8 ? 'no-store' : 'default'
        });
        break; // If successful, exit the retry loop
      } catch (error: any) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        // Wait before retrying (exponential backoff)
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries)));
      }
    }
    
    clearTimeout(timeoutId);
    
    if (!response || !response.ok) {
      throw new Error(`Failed to fetch from origin: ${response?.status || 'No response'}`);
    }
    
    // Handle different content types appropriately
    const contentType = response.headers.get('content-type') || '';
    let responseBody;
    
    if (contentType.includes('application/json')) {
      responseBody = await response.json();
      return NextResponse.json(responseBody, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': cacheControl
        }
      });
    } else if (contentType.includes('text/plain') || contentType.includes('application/x-mpegURL') || contentType.includes('text/html')) {
      let text = await response.text();
      
      // If it's an M3U8 file, ensure relative URLs are made absolute
      if (contentType.includes('application/x-mpegURL') || decodedUrl.includes('.m3u8')) {
        const baseUrl = new URL(decodedUrl);
        const basePath = baseUrl.href.substring(0, baseUrl.href.lastIndexOf('/') + 1);
        
        // Fix relative URLs in M3U8 file
        text = text.replace(/(#EXT-X-STREAM-INF:[^\n]*\n)([^#][^:][^\n]*)/g, (match, p1, p2) => {
          const absoluteUrl = new URL(p2.trim(), basePath).href;
          return `${p1}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
        });
        
        // Fix relative segment URLs
        text = text.replace(/(#EXTINF:[^\n]*\n)([^#][^:][^\n]*)/g, (match, p1, p2) => {
          const absoluteUrl = new URL(p2.trim(), basePath).href;
          return `${p1}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
        });
      }
      
      return new NextResponse(text, {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': cacheControl
        }
      });
    } else {
      // For binary data like video segments
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': buffer.byteLength.toString(),
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': cacheControl
        }
      });
    }
  } catch (error: any) {
    console.error('Proxy error:', error.message);
    return NextResponse.json(
      { error: `Proxy fetch failed: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
