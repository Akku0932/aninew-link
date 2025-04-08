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

        // Log the request
        console.log(`Proxy request for: ${url}`);

        // Don't proxy localhost URLs
        if (url.startsWith('http://localhost') || url.includes('localhost')) {
            console.log('Redirecting localhost URL');
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

        // Forward the request with longer timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
        
        const response = await fetch(url, {
            headers,
            redirect: 'follow',
            signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        if (!response.ok) {
            console.error(`Proxy error: Non-OK response ${response.status} for ${url}`);
            return new NextResponse(`Error ${response.status}: ${response.statusText}`, { 
                status: response.status 
            });
        }

        // Get the content type
        const contentType = response.headers.get('content-type') || '';
        console.log(`Content type: ${contentType} for ${url}`);

        // Create response headers with strong CORS headers
        const responseHeaders = new Headers();
        
        // Set proper content type based on file extension if not detected correctly
        let detectedContentType = contentType;
        if (!contentType || contentType === 'application/octet-stream') {
            if (url.toLowerCase().includes('.m3u8')) {
                detectedContentType = 'application/vnd.apple.mpegurl';
                console.log('Content type not specified, using m3u8 based on URL extension');
            } else if (url.toLowerCase().includes('.ts')) {
                detectedContentType = 'video/mp2t';
                console.log('Content type not specified, using ts based on URL extension');
            }
        }
        
        responseHeaders.set('Content-Type', detectedContentType);
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
        if (detectedContentType.includes('application/vnd.apple.mpegurl') || 
            detectedContentType.includes('application/x-mpegurl') || 
            url.toLowerCase().includes('.m3u8')) {
            
            console.log('Processing m3u8 file from URL:', url);
            const text = await response.text();
            const baseUrl = new URL(url);
            baseUrl.search = ''; // Remove query params
            baseUrl.hash = '';   // Remove hash
            const baseUrlPath = baseUrl.href.substring(0, baseUrl.href.lastIndexOf('/') + 1);
            
            // Add better error handling for empty or invalid playlists
            if (!text || text.trim().length === 0) {
                console.error('Empty m3u8 playlist received');
                return new Response('Empty playlist received', { status: 400 });
            }
            
            // Process alternative segment format indication (sometimes servers use custom extensions)
            let modifiedText = text;
            
            // Check if the playlist uses non-standard extensions for TS segments
            // Common examples: .ts?someparam=value, .m4s, .segment, etc.
            const segmentExtensions = ['.ts', '.m4s', '.aac', '.m4a', '.mp4', '.m4v', '.segment'];
            const hasKnownSegmentTypes = segmentExtensions.some(ext => text.includes(ext));
            
            // If this is a segment playlist with no recognized segment types, try to detect segments
            if (!hasKnownSegmentTypes && !text.includes('#EXT-X-STREAM-INF')) {
                console.log('No standard segments detected, attempting to identify segment format');
                
                // Look for segment lines (non-comment lines) and add .ts extension if missing
                modifiedText = modifiedText.replace(/^(?!#)([^\r\n]+)$/gm, (match) => {
                    // Skip if it already has a known extension
                    if (segmentExtensions.some(ext => match.includes(ext))) {
                        return match;
                    }
                    console.log('Adding .ts extension to segment:', match);
                    return match + '.ts';
                });
            }
            
            // Validate the playlist
            const lines = modifiedText.split(/\r?\n/);
            let hasExtM3U = false;
            let hasTargetDuration = false;
            let hasExtInf = false;
            let hasMasterTags = false;
            let isMasterPlaylist = false;
            
            // Check for required HLS tags
            for (const line of lines) {
                if (line.includes('#EXTM3U')) {
                    hasExtM3U = true;
                }
                if (line.includes('#EXT-X-TARGETDURATION')) {
                    hasTargetDuration = true;
                }
                if (line.includes('#EXTINF:')) {
                    hasExtInf = true;
                }
                // Check if this is a master playlist (contains stream info)
                if (line.includes('#EXT-X-STREAM-INF') || line.includes('#EXT-X-MEDIA')) {
                    hasMasterTags = true;
                }
            }

            // Determine if this is a master playlist
            isMasterPlaylist = hasMasterTags && !hasExtInf;
            console.log('Playlist analysis:', { 
                isMasterPlaylist, 
                hasExtM3U, 
                hasTargetDuration, 
                hasExtInf, 
                hasMasterTags 
            });
            
            // Fix common issues with the playlist
            if (!hasExtM3U) {
                console.log('Adding missing #EXTM3U tag');
                modifiedText = '#EXTM3U\n' + modifiedText;
            }
            
            // Only add target duration to segment playlists, not master playlists
            if (!hasTargetDuration && !isMasterPlaylist) {
                console.log('Adding missing #EXT-X-TARGETDURATION tag');
                // Add a reasonable target duration if missing (10 seconds is common)
                modifiedText = modifiedText.replace('#EXTM3U', '#EXTM3U\n#EXT-X-TARGETDURATION:10');
            }

            // Add version if missing - many players need this
            if (!modifiedText.includes('#EXT-X-VERSION')) {
                console.log('Adding missing #EXT-X-VERSION tag');
                modifiedText = modifiedText.replace('#EXTM3U', '#EXTM3U\n#EXT-X-VERSION:3');
            }
            
            // Special fixes for malformed EXTINF entries
            if (hasExtInf) {
                // Fix EXTINF entries that are missing the duration
                modifiedText = modifiedText.replace(/#EXTINF:/g, (match) => {
                    // If the EXTINF doesn't have a duration, add a default of 10 seconds
                    if (match === '#EXTINF:') {
                        return '#EXTINF:10.0,';
                    }
                    return match;
                });
                
                // Fix EXTINF entries that are missing the comma after duration
                modifiedText = modifiedText.replace(/#EXTINF:(\d+\.?\d*)([^\s,])/g, '#EXTINF:$1,$2');
            }

            // Replace relative URLs with proxied absolute ones
            // This regex matches non-comment, non-absolute URL lines in the m3u8 file
            modifiedText = modifiedText.replace(/^(?!#)(?!https?:\/\/)([^#][^\r\n]*)/gm, (match) => {
                try {
                    // Convert relative URL to absolute
                    const absoluteUrl = new URL(match, baseUrlPath).href;
                    console.log('Rewriting segment URL:', match, 'to', absoluteUrl);
                    
                    // If this is an m3u8 variant, make sure we add proxy
                    const isVariant = match.toLowerCase().endsWith('.m3u8');
                    
                    // Use proxy for the absolute URL
                    return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
                } catch (error) {
                    console.error('Error processing m3u8 line:', match, error);
                    return match; // Return original if we can't process it
                }
            });
            
            // Also rewrite absolute URLs in the file to use our proxy 
            // Handle both m3u8 and ts files
            modifiedText = modifiedText.replace(/(https?:\/\/[^\s"'\r\n]+\.(?:ts|m3u8))/g, (match) => {
                console.log('Rewriting absolute URL:', match);
                return `/api/proxy?url=${encodeURIComponent(match)}`;
            });
            
            // Make sure the playlist ends with a blank line (HLS spec requirement)
            if (!modifiedText.endsWith('\n')) {
                modifiedText += '\n';
            }
            
            console.log('Processed m3u8 playlist. Length:', modifiedText.length);
            
            // For debugging, log the first few lines of the processed playlist
            const processedLines = modifiedText.split('\n').slice(0, 10); 
            console.log('Processed playlist preview:', processedLines.join('\n'));
            
            return new NextResponse(modifiedText, { 
                headers: responseHeaders
            });
        }

        // Handle video segments (ts files) - use streaming and cache them
        if (url.toLowerCase().includes('.ts') || detectedContentType.includes('video/mp2t')) {
            console.log('Processing TS segment from URL:', url);
            
            // For TS segments, we need to ensure they're properly formatted
            // Get the binary data first
            const buffer = await response.arrayBuffer();
            
            // Verify this is actually a valid TS segment (should start with specific sync byte)
            // TS segments should start with 0x47 (71 in decimal, 'G' in ASCII)
            const firstByte = new Uint8Array(buffer)[0];
            const isValidTSSegment = firstByte === 0x47;
            
            console.log('TS segment analysis:', {
                size: buffer.byteLength,
                firstByte: firstByte,
                isValidTSSegment,
                contentType: detectedContentType
            });
            
            if (!isValidTSSegment) {
                console.warn('Invalid TS segment detected, attempting repair');
                
                // If it's not a valid TS segment but supposed to be one,
                // try to determine if it's a different format
                const fourCCBytes = buffer.byteLength > 8 ? new Uint8Array(buffer, 0, 8) : new Uint8Array(buffer);
                const fourCCString = Array.from(fourCCBytes)
                    .map(byte => String.fromCharCode(byte))
                    .join('');
                    
                console.log('Potential format signature:', fourCCString);
                
                // Check for MP4 signature (ftyp...)
                if (fourCCString.includes('ftyp')) {
                    console.log('Detected MP4 container instead of TS, adjusting content type');
                    responseHeaders.set('Content-Type', 'video/mp4');
                } 
                // Check for WebM signature (it usually starts with 0x1A 0x45 0xDF 0xA3)
                else if (fourCCBytes[0] === 0x1A && fourCCBytes[1] === 0x45 && fourCCBytes[2] === 0xDF && fourCCBytes[3] === 0xA3) {
                    console.log('Detected WebM container instead of TS, adjusting content type');
                    responseHeaders.set('Content-Type', 'video/webm');
                } 
                // Fallback - force the content type to be mp2t anyway
                else {
                    console.log('Unknown format, forcing video/mp2t content type');
                    responseHeaders.set('Content-Type', 'video/mp2t');
                }
            } else {
                // It's a valid TS segment - ensure proper content type
                responseHeaders.set('Content-Type', 'video/mp2t');
            }
            
            // Add caching headers for better performance regardless of format
            responseHeaders.set('Cache-Control', 'public, max-age=31536000');
            
            return new NextResponse(buffer, {
                headers: responseHeaders
            });
        }

        // Handle range requests for video streaming
        const range = request.headers.get('range');
        if (range && (detectedContentType.includes('video/') || detectedContentType.includes('audio/'))) {
            console.log('Processing range request:', range);
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
        console.log('Streaming regular response');
        const stream = response.body;
        if (!stream) {
            return new NextResponse('Stream not available', { status: 500 });
        }

        return new NextResponse(stream, { headers: responseHeaders });
    } catch (error: unknown) {
        console.error('Proxy error:', error);
        // More detailed error message
        const errorMessage = error instanceof Error 
            ? `Proxy error: ${error.name}: ${error.message}` 
            : 'Unknown proxy error';
            
        if (error instanceof Error && error.name === 'AbortError') {
            return new NextResponse('Request timeout - the server took too long to respond', { 
                status: 504 // Gateway Timeout
            });
        }
            
        return new NextResponse(errorMessage, { status: 500 });
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
