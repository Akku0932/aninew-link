import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const url = request.nextUrl.searchParams.get('url');
        
        if (!url) {
            return new NextResponse('URL parameter is required', { status: 400 });
        }

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            return new NextResponse('Invalid URL', { status: 400 });
        }

        // Don't proxy localhost URLs
        if (url.startsWith('http://localhost')) {
            return NextResponse.redirect(url);
        }

        // Clone the request headers to forward
        const headers = new Headers({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Origin': request.headers.get('origin') || '',
            'Referer': request.headers.get('referer') || '',
        });

        // Forward the request
        const response = await fetch(url, {
            headers,
            redirect: 'follow',
        });

        if (!response.ok) {
            console.error(`Proxy error: Non-OK response ${response.status} for ${url}`);
            return new NextResponse(`Error ${response.status}: ${response.statusText}`, { 
                status: response.status 
            });
        }

        // Get the content type
        const contentType = response.headers.get('content-type') || '';

        // Create response headers
        const responseHeaders = new Headers();
        responseHeaders.set('Content-Type', contentType);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Range');
        responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
        
        // Copy important headers from the original response
        const headersToCopy = [
            'content-length',
            'cache-control',
            'expires',
            'accept-ranges',
            'content-range',
            'date',
            'etag',
            'last-modified'
        ];
        
        headersToCopy.forEach(header => {
            const value = response.headers.get(header);
            if (value) {
                responseHeaders.set(header, value);
            }
        });

        // Process m3u8 files to correct segment URLs
        if (contentType.includes('application/vnd.apple.mpegurl') || 
            contentType.includes('application/x-mpegurl') || 
            url.includes('.m3u8')) {
            
            const text = await response.text();
            const baseUrl = new URL(url);
            baseUrl.search = ''; // Remove query params
            baseUrl.hash = '';   // Remove hash
            const baseUrlPath = baseUrl.href.substring(0, baseUrl.href.lastIndexOf('/') + 1);
            
            // Replace relative URLs with proxied absolute ones
            const modifiedText = text.replace(/^(?!#)(?!https?:\/\/)([^#][^\r\n]*)/gm, (match) => {
                // Convert relative URL to absolute
                const absoluteUrl = new URL(match, baseUrlPath).href;
                // Use proxy for non-localhost absolute URLs
                return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
            });
            
            return new NextResponse(modifiedText, { 
                headers: responseHeaders
            });
        }

        // Handle video segments (ts files)
        if (url.includes('.ts') || contentType.includes('video/mp2t')) {
            const stream = response.body;
            if (!stream) {
                return new NextResponse('Stream not available', { status: 500 });
            }
            return new NextResponse(stream, {
                headers: responseHeaders
            });
        }

        // Handle range requests for video streaming
        const range = request.headers.get('range');
        if (range && (contentType.includes('video/') || contentType.includes('audio/'))) {
            const contentLength = response.headers.get('content-length');
            if (!contentLength) {
                return new NextResponse('Content-Length header missing', { status: 500 });
            }

            const size = parseInt(contentLength, 10);
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
            const chunksize = end - start + 1;

            responseHeaders.set('Content-Range', `bytes ${start}-${end}/${size}`);
            responseHeaders.set('Content-Length', chunksize.toString());
            responseHeaders.set('Accept-Ranges', 'bytes');

            const stream = response.body;
            if (!stream) {
                return new NextResponse('Stream not available', { status: 500 });
            }

            return new NextResponse(stream, {
                status: 206,
                headers: responseHeaders,
            });
        }

        // For non-range requests, stream the response
        const stream = response.body;
        if (!stream) {
            return new NextResponse('Stream not available', { status: 500 });
        }

        return new NextResponse(stream, { headers: responseHeaders });
    } catch (error) {
        console.error('Proxy error:', error);
        return new NextResponse(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
}

export async function OPTIONS(request: NextRequest) {
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Range');
    headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
    headers.set('Access-Control-Max-Age', '86400');

    return new NextResponse(null, { status: 204, headers });
}
