"use client"

import { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

interface ArtPlayerProps {
    options: {
        url: string;
        title?: string;
        subtitles?: Array<{
            html: string;
            url: string;
            encoding: string;
            language: string;
            default?: boolean;
        }>;
        [key: string]: any;
    };
    style?: React.CSSProperties;
    getInstance?: (art: Artplayer) => void;
    className?: string;
}

export default function ArtPlayer({ options, getInstance, className, style }: ArtPlayerProps) {
    const artRef = useRef<HTMLDivElement>(null);
    const artPlayerRef = useRef<Artplayer | null>(null);

    useEffect(() => {
        if (!artRef.current || !options?.url) return;

        let hls: Hls | null = null;

        // Clean up previous instance if it exists
        if (artPlayerRef.current) {
            artPlayerRef.current.destroy();
            artPlayerRef.current = null;
        }

        // Convert string values to numbers using parseFloat
        const option = { ...options };
        if (typeof option.currentTime === 'string') {
            option.currentTime = parseFloat(option.currentTime);
        }
        if (typeof option.volume === 'string') {
            option.volume = parseFloat(option.volume);
        }
        if (typeof option.playbackRate === 'string') {
            option.playbackRate = parseFloat(option.playbackRate);
        }
        if (typeof option.aspectRatio === 'string') {
            option.aspectRatio = parseFloat(option.aspectRatio);
        }

        // Pre-process the URL - always proxy m3u8 files if they're external
        let sourceUrl = options.url;
        const isM3u8 = sourceUrl.includes('.m3u8');
        
        // Always proxy external m3u8 URLs that aren't already proxied
        if (isM3u8 && 
            sourceUrl.startsWith('http') && 
            !sourceUrl.startsWith('/api/proxy') && 
            !sourceUrl.includes('localhost')) {
            console.log('Pre-proxying m3u8 URL:', sourceUrl);
            sourceUrl = `/api/proxy?url=${encodeURIComponent(sourceUrl)}&t=${Date.now()}`;
        }

        const art = new Artplayer({
            ...option,
            url: sourceUrl, // Use possibly proxied source URL
            container: artRef.current,
            type: isM3u8 ? 'customHls' : 'auto',
            customType: {
                customHls: function (video: HTMLVideoElement, url: string) {
                    if (Hls.isSupported()) {
                        hls = new Hls({
                            xhrSetup: function(xhr, url) {
                                // Skip proxying for URLs that are already proxied or local
                                if (url.startsWith('/api/proxy') || url.startsWith('data:') || 
                                    url.includes('localhost') || url.startsWith('blob:')) {
                                    return;
                                }
                                
                                // Always proxy external URLs to avoid CORS issues
                                if (url.startsWith('http')) {
                                    console.log('Proxying HLS request:', url);
                                    // Use our proxy with a cache buster to avoid cached errors
                                    const cacheBuster = Date.now();
                                    xhr.open('GET', `/api/proxy?url=${encodeURIComponent(url)}&t=${cacheBuster}`, true);
                                }
                            },
                            // Set configuration for better segment loading
                            maxBufferSize: 30 * 1000 * 1000, // 30MB
                            maxBufferLength: 30,            // 30 seconds buffer
                            maxMaxBufferLength: 60,         // 60 seconds max buffer
                            startLevel: -1,                // auto start quality level
                            autoStartLoad: true,
                            // Better error recovery
                            fragLoadingMaxRetry: 8,
                            manifestLoadingMaxRetry: 8,
                            levelLoadingMaxRetry: 8,       
                            // Add longer timeouts
                            manifestLoadingTimeOut: 30000,  // 30 seconds
                            levelLoadingTimeOut: 30000,     // 30 seconds
                            fragLoadingTimeOut: 30000,      // 30 seconds
                            // Shorter retry delays for faster recovery
                            manifestLoadingRetryDelay: 1000,
                            levelLoadingRetryDelay: 1000,
                            fragLoadingRetryDelay: 1000,
                            // Improve segment parsing
                            enableWorker: true,            // Enable workers for better performance
                            lowLatencyMode: false,         // Disable low latency mode
                            // Disable debugging to improve performance
                            debug: false
                        });

                        console.log('Loading HLS source:', url);
                        
                        // Store original URL for fallbacks
                        const originalUrl = url;
                        
                        // Load the source and attach to video element
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        
                        // Handle HLS events
                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            console.log('HLS manifest parsed successfully');
                            
                            if (option.autoplay) {
                                video.play().catch(e => console.error('Autoplay failed:', e));
                            }
                        });

                        // Log fragment loading for diagnostics
                        hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
                            if (data.frag?.sn === 1) {
                                console.log('Loading first fragment:', data.frag?.url);
                            }
                        });

                        // Handle errors with improved recovery
                        hls.on(Hls.Events.ERROR, function(event, data) {
                            if (!data) return;
                            
                            console.error('HLS error:', data.type, data.details, data.error?.message);
                            
                            // Handle specific error: Missing Target Duration
                            if (data.details === 'manifestParsingError' && 
                                data.error?.message?.includes('Missing Target Duration')) {
                                console.warn('Missing Target Duration error, manually fixing playlist');
                                
                                // Try to get the direct URL
                                let directUrl = originalUrl;
                                if (originalUrl.includes('/api/proxy?url=')) {
                                    try {
                                        const urlParams = new URLSearchParams(originalUrl.split('/api/proxy?')[1]);
                                        const urlParam = urlParams.get('url');
                                        if (urlParam) {
                                            directUrl = decodeURIComponent(urlParam);
                                        }
                                    } catch (e) {
                                        console.error('Error extracting direct URL:', e);
                                    }
                                }
                                
                                // Fetch the playlist content directly
                                fetch(directUrl, {
                                    headers: {
                                        'Origin': window.location.origin,
                                        'Referer': window.location.origin
                                    }
                                })
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error(`HTTP error ${response.status}`);
                                    }
                                    return response.text();
                                })
                                .then(text => {
                                    // Fix the playlist content
                                    let fixedText = text;
                                    
                                    // Ensure it has EXTM3U tag
                                    if (!fixedText.includes('#EXTM3U')) {
                                        fixedText = '#EXTM3U\n' + fixedText;
                                    }
                                    
                                    // Add target duration if missing
                                    if (!fixedText.includes('#EXT-X-TARGETDURATION')) {
                                        fixedText = fixedText.replace('#EXTM3U', '#EXTM3U\n#EXT-X-TARGETDURATION:10');
                                    }
                                    
                                    // Add version if missing
                                    if (!fixedText.includes('#EXT-X-VERSION')) {
                                        fixedText = fixedText.replace('#EXTM3U', '#EXTM3U\n#EXT-X-VERSION:3');
                                    }
                                    
                                    // Create a blob URL with the fixed content
                                    const blob = new Blob([fixedText], { type: 'application/vnd.apple.mpegurl' });
                                    const blobUrl = URL.createObjectURL(blob);
                                    
                                    // Destroy old HLS instance
                                    if (hls) {
                                        hls.destroy();
                                    }
                                    
                                    // Create new HLS instance with the fixed content
                                    const newHls = new Hls({
                                        enableWorker: true,
                                        debug: false
                                    });
                                    
                                    newHls.loadSource(blobUrl);
                                    newHls.attachMedia(video);
                                    hls = newHls;
                                    
                                    // Clean up blob URL when done
                                    newHls.on(Hls.Events.MANIFEST_PARSED, () => {
                                        URL.revokeObjectURL(blobUrl);
                                    });
                                })
                                .catch(error => {
                                    console.error('Error fixing playlist:', error);
                                    
                                    // Try to load directly through our proxy to fix it server-side
                                    const proxyUrl = `/api/proxy?url=${encodeURIComponent(directUrl)}&t=${Date.now()}`;
                                    
                                    if (hls) {
                                        hls.destroy();
                                    }
                                    
                                    const newHls = new Hls({
                                        enableWorker: true,
                                        debug: false
                                    });
                                    
                                    newHls.loadSource(proxyUrl);
                                    newHls.attachMedia(video);
                                    hls = newHls;
                                });
                                
                                return;
                            }
                            
                            // Handle fatal errors
                            if (data.fatal) {
                                switch (data.type) {
                                    case Hls.ErrorTypes.NETWORK_ERROR:
                                        // For network errors, try reloading
                                        console.log('Fatal network error, trying to recover');
                                        if (hls) {
                                            hls.startLoad();
                                        }
                                        break;
                                    case Hls.ErrorTypes.MEDIA_ERROR:
                                        console.log('Fatal media error, trying to recover');
                                        if (hls) {
                                            hls.recoverMediaError();
                                        }
                                        break;
                                    default:
                                        // For other fatal errors, if not already proxied, try proxying
                                        if (!url.includes('/api/proxy') && url.startsWith('http')) {
                                            console.log('Fatal error, trying proxied URL');
                                            
                                            // Destroy current instance
                                            if (hls) {
                                                hls.destroy();
                                            }
                                            
                                            // Create new instance with proxied URL
                                            const proxiedUrl = `/api/proxy?url=${encodeURIComponent(url)}&t=${Date.now()}`;
                                            
                                            const newHls = new Hls({
                                                enableWorker: true,
                                                debug: false
                                            });
                                            
                                            newHls.loadSource(proxiedUrl);
                                            newHls.attachMedia(video);
                                            hls = newHls;
                                        } else {
                                            console.error('Fatal error and recovery failed');
                                        }
                                        break;
                                }
                            }
                        });
                    } else {
                        // For browsers with native HLS support
                        video.src = url;
                    }
                }
            },
            controls: option.controls || true,
            poster: option.poster || '',
            setting: true,
            loop: option.loop || false,
            muted: option.muted || false,
            autoplay: option.autoplay || false,
            autoSize: option.autoSize || false,
            autoMini: option.autoMini || false,
            screenshot: true,
            volume: typeof option.volume === 'number' ? option.volume : 0.5,
            flip: true,
            playbackRate: true,
            aspectRatio: option.aspectRatio !== undefined ? option.aspectRatio : true,
            fullscreen: true,
            fullscreenWeb: option.fullscreenWeb !== undefined ? option.fullscreenWeb : false,
            subtitleOffset: true,
            miniProgressBar: true,
            playsInline: true,
            quality: option.quality || [],
            plugins: option.plugins || [],
            // Use the whitelist property if it exists in options
            whitelist: option.whitelist || [],
            lock: option.lock !== undefined ? option.lock : false,
            fastForward: option.fastForward !== undefined ? option.fastForward : false,
            hotkey: option.hotkey !== undefined ? option.hotkey : true,
            autoOrientation: option.autoOrientation !== undefined ? option.autoOrientation : true,
            ready: function(art: Artplayer) {
                console.log('ArtPlayer is ready');
                
                // Execute getInstance callback if defined
                if (getInstance) {
                    getInstance(art);
                }
                
                // Save ref to current instance
                artPlayerRef.current = art;
            }
        });

        // Clean up
        return () => {
            if (artPlayerRef.current) {
                artPlayerRef.current.destroy();
                artPlayerRef.current = null;
            }
            
            if (hls) {
                hls.destroy();
                hls = null;
            }
        };
    }, [options, getInstance]);

    return <div ref={artRef} className={className} style={style} />;
}
