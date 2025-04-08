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

        const art = new Artplayer({
            ...option,
            container: artRef.current,
            type: options.url.includes('.m3u8') ? 'customHls' : 'auto',
            customType: {
                customHls: function (video: HTMLVideoElement, url: string) {
                    if (Hls.isSupported()) {
                        hls = new Hls({
                            xhrSetup: function(xhr, url) {
                                // Skip proxying for URLs that are already proxied or local
                                if (url.startsWith('/api/proxy') || url.startsWith('data:') || url.includes('localhost')) {
                                    return;
                                }
                                
                                // Always proxy external URLs to avoid CORS issues
                                if (url.startsWith('http')) {
                                    console.log('Proxying HLS request:', url);
                                    xhr.open('GET', `/api/proxy?url=${encodeURIComponent(url)}`, true);
                                }
                            },
                            // Set configuration for better segment loading
                            maxBufferSize: 30 * 1000 * 1000, // 30MB - reduced to avoid memory issues
                            maxBufferLength: 30,           // reduced buffer length
                            maxMaxBufferLength: 60,        // reduced max buffer
                            startLevel: -1,                // auto start quality level
                            autoStartLoad: true,
                            // Better error recovery
                            fragLoadingMaxRetry: 5,
                            manifestLoadingMaxRetry: 4,
                            levelLoadingMaxRetry: 4,       // Add retry for level loading
                            // Add timeouts and delays
                            manifestLoadingTimeOut: 20000,  // 20 seconds
                            levelLoadingTimeOut: 20000,     // 20 seconds
                            fragLoadingTimeOut: 20000,      // 20 seconds
                            // Add retry delays
                            manifestLoadingRetryDelay: 1000,
                            levelLoadingRetryDelay: 1000,
                            fragLoadingRetryDelay: 1000,
                            // Improve segment parsing
                            enableWorker: false,           // Disable workers to avoid threading issues
                            lowLatencyMode: false,         // Disable low latency mode
                            backBufferLength: 30,          // Reduce back buffer length
                            // Disable debugging to improve performance
                            debug: false
                        });

                        // Store original URL for fallbacks
                        const originalUrl = url;
                        let hasAttemptedFallback = false;
                        let hasAttemptedDirectPlay = false;
                        
                        // Handle HLS loading with CORS protection
                        console.log('Loading HLS source:', url);
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        
                        // Handle specific events
                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            console.log('HLS manifest parsed successfully');
                            
                            if (option.autoplay) {
                                video.play().catch(e => console.error('Autoplay failed:', e));
                            }
                        });

                        hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
                            console.log('Loading fragment:', data.frag?.url);
                        });

                        // Variables for error recovery
                        let mediaErrorRecoveryAttempts = 0;
                        const MAX_MEDIA_ERROR_RECOVERY_ATTEMPTS = 5;

                        // Add error handling with better recovery
                        hls.on(Hls.Events.ERROR, function(event, data) {
                            if (!data) return;
                            
                            console.error('HLS error:', data.type, data.details, data);
                            
                            // Check if this is a playlist parsing error
                            if (data.details === 'manifestParsingError' || data.details === 'levelParsingError') {
                                console.error('Playlist parsing error:', data.error?.message || 'Unknown parsing error');
                                
                                if (!hasAttemptedDirectPlay) {
                                    console.log('Attempting direct playback without HLS.js');
                                    hasAttemptedDirectPlay = true;
                                    
                                    // Try with a different approach - go straight to a direct URL
                                    // Step 1: Extract the actual direct URL from our proxy
                                    let directUrl = originalUrl;
                                    try {
                                        // If URL is proxied, extract the original URL
                                        if (originalUrl.includes('/api/proxy?url=')) {
                                            const urlParam = new URLSearchParams(originalUrl.split('/api/proxy?')[1]).get('url');
                                            if (urlParam) {
                                                directUrl = decodeURIComponent(urlParam);
                                                console.log('Extracted direct URL from proxy:', directUrl);
                                            }
                                        }
                                    } catch (e) {
                                        console.error('Error extracting direct URL:', e);
                                    }
                                    
                                    // Step 2: Find specific direct stream URL without using m3u8 master
                                    // This is a common pattern in HLS streams - just fix the URL
                                    if (directUrl.includes('master.m3u8')) {
                                        // Try index-v1-a1.m3u8 pattern which is common
                                        const alternateUrl = directUrl.replace('master.m3u8', 'index-v1-a1.m3u8');
                                        console.log('Trying alternate direct stream URL:', alternateUrl);
                                        
                                        const proxyAlternateUrl = `/api/proxy?url=${encodeURIComponent(alternateUrl)}`;
                                        
                                        if (hls) {
                                            hls.destroy();
                                        }
                                        
                                        // Try the alternate URL directly
                                        const newHls = new Hls({
                                            enableWorker: false, 
                                            lowLatencyMode: false,
                                            debug: false
                                        });
                                        
                                        newHls.loadSource(proxyAlternateUrl);
                                        newHls.attachMedia(video);
                                        hls = newHls;
                                        
                                        return;
                                    }
                                    
                                    // Step 3: If alternate URLs didn't work, try native playback
                                    if (hasAttemptedDirectPlay && !hasAttemptedFallback) {
                                        hasAttemptedFallback = true;
                                        
                                        // Destroy current HLS instance
                                        if (hls) {
                                            hls.destroy();
                                            hls = null;
                                        }
                                        
                                        // Some browsers can play HLS natively
                                        if (video.canPlayType('application/vnd.apple.mpegurl')) {
                                            video.src = originalUrl;
                                            video.addEventListener('loadedmetadata', () => {
                                                video.play().catch(e => console.error('Playback failed:', e));
                                            });
                                        } else {
                                            // Try to load an MP4 version if available
                                            let mp4Url = directUrl.replace(/\.(m3u8|m3u)/, '.mp4');
                                            if (mp4Url !== directUrl) {
                                                mp4Url = `/api/proxy?url=${encodeURIComponent(mp4Url)}`;
                                                console.log('Attempting to load MP4 version:', mp4Url);
                                                video.src = mp4Url;
                                                video.load();
                                                video.play().catch(e => {
                                                    console.error('MP4 fallback failed:', e);
                                                    art.notice.show = 'Video playback error. Please try a different server.';
                                                });
                                            } else {
                                                art.notice.show = 'HLS stream not supported in this browser.';
                                            }
                                        }
                                    }
                                    return;
                                }
                            }
                            
                            // Demuxer errors require special handling
                            if (data.details === 'fragParsingError') {
                                console.error('Fragment parsing error:', data.error?.message || 'Unknown parsing error');
                                
                                // Try to recover by letting HLS.js handle it internally first
                                if (!hasAttemptedFallback && data.frag) {
                                    console.log('Attempting to recover from fragment parsing error');
                                    hasAttemptedFallback = true;
                                    
                                    // Try to directly access alternative formats based on the URL
                                    const tryAlternativeFormat = () => {
                                        // Extract the base URL
                                        let directUrl = originalUrl;
                                        try {
                                            if (originalUrl.includes('/api/proxy?url=')) {
                                                const urlParam = new URLSearchParams(originalUrl.split('/api/proxy?')[1]).get('url');
                                                if (urlParam) directUrl = decodeURIComponent(urlParam);
                                            }
                                        } catch (e) {
                                            console.error('Error extracting URL:', e);
                                        }
                                        
                                        // Try different format patterns
                                        // Sometimes .m3u8 can be replaced with direct segment path patterns
                                        const possibleFormats = [
                                            // Direct segment access bypassing playlist
                                            directUrl.replace(/\/(playlist|master|index)\.m3u8/, '/index-v1-a1.m3u8'),
                                            directUrl.replace(/\/(playlist|master|index)\.m3u8/, '/segments/1.ts'),
                                            directUrl.replace(/\/(playlist|master|index)\.m3u8/, '/media_0.ts'),
                                            directUrl.replace(/\.m3u8/, '.mp4'),
                                            directUrl.replace(/\.m3u8/, '.webm'),
                                            // Modify quality/resolution in URL
                                            directUrl.replace(/\/[0-9]+p\//, '/480p/'),
                                        ];
                                        
                                        // Also try removing URL parameters
                                        const urlWithoutParams = directUrl.split('?')[0];
                                        if (urlWithoutParams !== directUrl) {
                                            possibleFormats.push(urlWithoutParams);
                                        }
                                        
                                        console.log('Trying alternative formats:', possibleFormats);
                                        
                                        // Try each alternative format
                                        const tryNextFormat = (index = 0) => {
                                            if (index >= possibleFormats.length) {
                                                console.log('All alternative formats failed, falling back to emergency player');
                                                switchToEmergencyPlayer(directUrl);
                                                return;
                                            }
                                            
                                            const formatUrl = possibleFormats[index];
                                            console.log(`Trying format ${index+1}/${possibleFormats.length}:`, formatUrl);
                                            
                                            // Proxy the URL if it's external
                                            const proxyUrl = formatUrl.startsWith('http') 
                                                ? `/api/proxy?url=${encodeURIComponent(formatUrl)}`
                                                : formatUrl;
                                            
                                            // Use fetch to check if this URL is valid
                                            fetch(proxyUrl, { method: 'HEAD' })
                                                .then(response => {
                                                    if (response.ok) {
                                                        console.log('Alternative format available:', formatUrl);
                                                        
                                                        // Format appears valid, try to use it
                                                        if (formatUrl.endsWith('.m3u8')) {
                                                            // Try new HLS instance with this URL
                                                            if (hls) hls.destroy();
                                                            
                                                            const newHls = new Hls({
                                                                enableWorker: false,
                                                                lowLatencyMode: false,
                                                                startLevel: 0,
                                                                fragLoadingMaxRetry: 2,
                                                                manifestLoadingMaxRetry: 2,
                                                            });
                                                            
                                                            newHls.loadSource(proxyUrl);
                                                            newHls.attachMedia(video);
                                                            hls = newHls;
                                                        } else {
                                                            // For non-m3u8 formats, try direct playback
                                                            if (hls) {
                                                                hls.destroy();
                                                                hls = null;
                                                            }
                                                            
                                                            video.src = proxyUrl;
                                                            video.play().catch(e => {
                                                                console.error('Alternative format playback failed:', e);
                                                                tryNextFormat(index + 1);
                                                            });
                                                        }
                                                    } else {
                                                        console.log('Alternative format not available:', formatUrl);
                                                        tryNextFormat(index + 1);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error('Error checking alternative format:', error);
                                                    tryNextFormat(index + 1);
                                                });
                                        };
                                        
                                        // Start trying formats
                                        tryNextFormat();
                                    };
                                    
                                    // Create emergency direct player as a last resort
                                    const switchToEmergencyPlayer = (directUrl: string) => {
                                        console.log('Creating emergency direct player');
                                        
                                        // Clean up existing player
                                        if (hls) {
                                            hls.destroy();
                                            hls = null;
                                        }
                                        
                                        // Create a simple video element to replace the current player
                                        if (video) {
                                            // Attempt to play through our proxy
                                            const fallbackUrl = directUrl.startsWith('http')
                                                ? `/api/proxy?url=${encodeURIComponent(directUrl)}`
                                                : directUrl;
                                                
                                            video.src = fallbackUrl;
                                            video.load();
                                            
                                            // Try to play
                                            video.play().catch(e => {
                                                console.error('Emergency player failed:', e);
                                                art.notice.show = 'Unable to play this video. Please try a different server.';
                                            });
                                        }
                                    };
                                    
                                    // Start the fallback process
                                    tryAlternativeFormat();
                                    return;
                                }
                                
                                return;
                            }
                            
                            // Handle media errors specifically - these are the most common in playback
                            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                                console.error('Media error:', data.type, data.details, data);
                                
                                if (mediaErrorRecoveryAttempts < MAX_MEDIA_ERROR_RECOVERY_ATTEMPTS) {
                                    mediaErrorRecoveryAttempts++;
                                    console.log(`Media error recovery attempt ${mediaErrorRecoveryAttempts}/${MAX_MEDIA_ERROR_RECOVERY_ATTEMPTS}`);
                                    
                                    // First try to recover with simple recoverMediaError
                                    if (mediaErrorRecoveryAttempts <= 2) {
                                        console.log('Attempting to recover media error');
                                        setTimeout(() => {
                                            hls?.recoverMediaError();
                                        }, 1000);
                                    } 
                                    // If that doesn't work, try the more aggressive approach
                                    else {
                                        console.log('Attempting aggressive media error recovery - swapping audio codec');
                                        setTimeout(() => {
                                            // Swap audio codec
                                            hls?.swapAudioCodec();
                                            hls?.recoverMediaError();
                                        }, 1000);
                                    }
                                } else {
                                    console.error('Max media error recovery attempts reached, cannot recover');
                                    
                                    // Try a complete reload as a last resort
                                    console.log('Attempting last resort recovery - reloading player');
                                    if (hls) {
                                        hls.destroy();
                                        // Small delay before re-init
                                        setTimeout(() => {
                                            try {
                                                // Reload the video with native playback as fallback
                                                video.src = originalUrl;
                                                video.load();
                                                video.play().catch(e => console.log('Playback failed', e));
                                            } catch (e) {
                                                console.error('Final recovery attempt failed', e);
                                                // Show error to user
                                                art.notice.show = 'Video playback error. Please try a different server.';
                                            }
                                        }, 2000);
                                    }
                                }
                            }
                            // Handle other fatal errors
                            else if (data.fatal) {
                                switch (data.type) {
                                    case Hls.ErrorTypes.NETWORK_ERROR:
                                        console.error('Fatal network error', data);
                                        setTimeout(() => {
                                            console.log('Attempting to recover from network error');
                                            hls?.startLoad();
                                        }, 2000);
                                        break;
                                    default:
                                        console.error('Fatal error, cannot recover', data);
                                        // Try to fallback to native video if possible
                                        if (video.canPlayType('application/vnd.apple.mpegurl')) {
                                            console.log('Attempting fallback to native HLS playback');
                                            video.src = originalUrl;
                                        } else {
                                            // Show error to user
                                            art.notice.show = 'Video playback error. Please try a different server.';
                                        }
                                        break;
                                }
                            }
                        });
                        
                        // Reset media error recovery counter when a level is loaded successfully
                        hls.on(Hls.Events.LEVEL_LOADED, () => {
                            mediaErrorRecoveryAttempts = 0;
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        // For Safari, use direct URL
                        video.src = url;
                        console.log('Using native HLS playback');
                    } else {
                        console.error('HLS is not supported in this browser.');
                    }
                },
            },
            volume: 1,
            autoplay: false,
            pip: true,
            screenshot: true,
            fastForward: true,
            lock: true,
            playbackRate: true,
            aspectRatio: true,
            fullscreen: true,
            fullscreenWeb: true,
            subtitleOffset: true,
            miniProgressBar: true,
            mutex: true,
            backdrop: true,
            playsInline: true,
            autoPlayback: false,
            airplay: true,
            theme: '#23ade5',
            hotkey: true,
            moreVideoAttr: {
                crossOrigin: 'anonymous',
            },
            subtitle: {
                style: {
                    color: '#FFFFFF',
                    fontSize: '20px',
                    textShadow: '0 2px 2px rgba(0, 0, 0, 0.5)',
                    fontFamily: 'Arial, sans-serif',
                    background: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '4px'
                },
                encoding: 'utf-8',
                escape: false
            },
            controls: [
                ...(options.subtitles?.length ? [{
                    name: 'subtitle',
                    position: 'right',
                    html: 'Subtitle',
                    selector: options.subtitles.map(sub => ({
                        html: sub.html,
                        url: sub.url,
                        default: sub.default,
                    })),
                }] : []),
                {
                    name: 'mobile-play',
                    position: 'right',
                    html: 'Play',
                    click: function () {
                        art.toggle();
                    },
                },
            ],
            settings: [
                {
                    html: 'Play Speed',
                    width: 150,
                    tooltip: 'Play Speed',
                    selector: [
                        { html: '0.5x', value: 0.5 },
                        { html: '0.75x', value: 0.75 },
                        { html: 'Normal', value: 1, default: true },
                        { html: '1.25x', value: 1.25 },
                        { html: '1.5x', value: 1.5 },
                        { html: '2x', value: 2 },
                    ],
                },
                {
                    html: 'Aspect Ratio',
                    width: 150,
                    tooltip: 'Aspect Ratio',
                    selector: [
                        { html: 'Default', value: 'default', default: true },
                        { html: '4:3', value: '4:3' },
                        { html: '16:9', value: '16:9' },
                    ],
                },
                {
                    html: 'Video Flip',
                    width: 150,
                    tooltip: 'Video Flip',
                    selector: [
                        { html: 'Normal', value: 'normal', default: true },
                        { html: 'Horizontal', value: 'horizontal' },
                        { html: 'Vertical', value: 'vertical' },
                    ],
                },
            ],
        });

        // Store the instance
        artPlayerRef.current = art;

        // Add keyboard shortcuts
        const shortcuts: { [key: string]: () => void } = {
            ' ': () => art.toggle(),
            ArrowLeft: () => {
                const currentTime = parseFloat(art.currentTime.toFixed(3));
                const newTime = currentTime - 5;
                art.currentTime = newTime >= 0 ? newTime : 0;
            },
            ArrowRight: () => {
                const currentTime = parseFloat(art.currentTime.toFixed(3));
                const duration = parseFloat(art.duration.toFixed(3));
                const newTime = currentTime + 5;
                art.currentTime = newTime <= duration ? newTime : duration;
            },
            ArrowUp: () => {
                const volume = art.volume;
                const newVolume = volume + 0.1;
                art.volume = newVolume <= 1 ? newVolume : 1;
            },
            ArrowDown: () => {
                const volume = art.volume;
                const newVolume = volume - 0.1;
                art.volume = newVolume >= 0 ? newVolume : 0;
            },
            'f': () => art.fullscreen = !art.fullscreen,
            'm': () => art.muted = !art.muted,
        };

        Object.entries(shortcuts).forEach(([key, callback]) => {
            art.hotkey.add(key, callback);
        });

        // Mobile touch controls
        const container = art.template.$container;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let isSeeking = false;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            isSeeking = false;
        });

        container.addEventListener('touchmove', (e) => {
            if (Date.now() - touchStartTime > 500) {
                const deltaX = e.touches[0].clientX - touchStartX;
                if (Math.abs(deltaX) > 30 && !isSeeking) {
                    isSeeking = true;
                    const currentTime = parseFloat(art.currentTime.toFixed(3));
                    const duration = parseFloat(art.duration.toFixed(3));
                    const newTime = currentTime + (deltaX > 0 ? 10 : -10);
                    art.currentTime = newTime >= 0 && newTime <= duration ? newTime : currentTime;
                    touchStartX = e.touches[0].clientX;
                }
            }
        });

        container.addEventListener('touchend', () => {
            if (!isSeeking && Date.now() - touchStartTime < 300) {
                art.toggle();
            }
        });

        if (getInstance && typeof getInstance === 'function') {
            getInstance(art);
        }

        return () => {
            if (artPlayerRef.current) {
                artPlayerRef.current.destroy();
                artPlayerRef.current = null;
            }
            if (hls) {
                hls.destroy();
            }
        };
    }, [options.url, options.subtitles]);

    return <div ref={artRef} className={className} style={style} />;
}
