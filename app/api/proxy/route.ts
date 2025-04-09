import { NextResponse } from 'next/server';

// In-memory cache for quick responses
const CACHE_TTL = 60 * 1000; // 1 minute TTL
interface CacheEntry {
  data: Uint8Array;
  contentType: string;
  etag?: string;
  lastModified?: string;
  expires: number;
}
const cache = new Map<string, CacheEntry>();

// Helper to determine if content should be cached
function isCacheableContent(contentType: string | null, url: string): boolean {
  if (!contentType) return false;
  
  // Cache m3u8 manifests for a short time
  if (contentType.includes('application/vnd.apple.mpegurl') || 
      contentType.includes('application/x-mpegurl')) {
    return true;
  }
  
  // Cache video segments and subtitles
  if (url.endsWith('.ts') || 
      url.endsWith('.mp4') || 
      url.endsWith('.vtt') || 
      url.endsWith('.srt')) {
    return true;
  }
  
  return false;
}

// Process and cache buffers
function processBuffer(buffer: ArrayBuffer, url: string, headers: Headers): CacheEntry {
  // Store in cache if it's cacheable
  const contentType = headers.get('content-type');
  const etag = headers.get('etag') || undefined;
  const lastModified = headers.get('last-modified') || undefined;
  
  return {
    data: new Uint8Array(buffer),
    contentType: contentType || 'application/octet-stream',
    etag,
    lastModified,
    expires: Date.now() + CACHE_TTL
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let url = searchParams.get('url');
    
    // Cache cleanup - clear expired items periodically
    if (Math.random() < 0.1) { // 10% chance to clean on each request
      for (const [key, entry] of cache.entries()) {
        if (entry.expires < Date.now()) {
          cache.delete(key);
        }
      }
    }

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Decode URL if it's encoded (handle potential double encoding)
    while (url.includes('%')) {
      url = decodeURIComponent(url);
    }
    
    // Check if we have a valid cached response
    const cachedEntry = cache.get(url);
    if (cachedEntry && cachedEntry.expires > Date.now()) {
      const headers = new Headers();
      headers.set('Content-Type', cachedEntry.contentType);
      headers.set('Cache-Control', 'public, max-age=60');
      if (cachedEntry.etag) {
        headers.set('ETag', cachedEntry.etag);
      }
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      headers.set('Access-Control-Allow-Headers', '*');
      
      return new NextResponse(cachedEntry.data, {
        status: 200,
        headers
      });
    }

    // Set up request with appropriate headers
    const fetchOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Origin': 'https://gogoanime.cl',
        'Referer': 'https://gogoanime.cl/',
      },
    };

    const response = await fetch(url, fetchOptions);

    // If it's an m3u8 file, we need to rewrite the URLs
    const contentType = response.headers.get('content-type');
    
    // Handle HLS manifest processing 
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
      
      // Create response with properly processed manifest
      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      headers.set('Access-Control-Allow-Headers', '*');
      headers.set('Cache-Control', 'public, max-age=5'); // Short TTL for manifests
      
      // Cache the response
      if (isCacheableContent(contentType, url)) {
        const encoder = new TextEncoder();
        const data = encoder.encode(modifiedText);
        cache.set(url, {
          data,
          contentType,
          etag: response.headers.get('etag') || undefined,
          lastModified: response.headers.get('last-modified') || undefined,
          expires: Date.now() + 5000 // Short 5s cache for manifests
        });
      }
      
      return new NextResponse(modifiedText, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }
    
    // For binary data (video segments, etc.)
    const arrayBuffer = await response.arrayBuffer();
    const responseHeaders = new Headers(response.headers);
    
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    
    // Add caching headers for video segments
    if (url.endsWith('.ts') || url.endsWith('.mp4')) {
      responseHeaders.set('Cache-Control', 'public, max-age=3600'); // 1 hour
    }
    
    // Cache if appropriate
    if (isCacheableContent(contentType, url)) {
      const entry = processBuffer(arrayBuffer, url, responseHeaders);
      cache.set(url, entry);
    }

    // Create response with the processed body and headers
    return new NextResponse(arrayBuffer, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
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
