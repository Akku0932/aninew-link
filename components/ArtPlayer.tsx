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

        // Ensure all external URLs go through our proxy
        let videoUrl = options.url;
        if (videoUrl && videoUrl.startsWith('http') && !videoUrl.includes('localhost') && !videoUrl.startsWith('/api/proxy')) {
            videoUrl = `/api/proxy?url=${encodeURIComponent(videoUrl)}`;
            console.log('Proxying video URL:', videoUrl);
        }

        const art = new Artplayer({
            ...option,
            container: artRef.current,
            type: options.url.includes('.m3u8') ? 'customHls' : 'auto',
            url: videoUrl, // Use the potentially proxied URL here
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
                            maxBufferSize: 60 * 1000 * 1000, // 60MB
                            maxBufferLength: 60,
                            maxMaxBufferLength: 600,
                            maxLoadingDelay: 4,
                            manifestLoadingTimeOut: 20000,
                            manifestLoadingMaxRetry: 6,
                            manifestLoadingRetryDelay: 1000,
                            fragLoadingTimeOut: 30000,
                            fragLoadingMaxRetry: 8,
                            fragLoadingRetryDelay: 1000,
                            levelLoadingTimeOut: 20000,
                            levelLoadingMaxRetry: 6,
                            startFragPrefetch: false,
                            testBandwidth: true,
                            progressive: true,
                            lowLatencyMode: false,
                            backBufferLength: 60,
                            appendErrorMaxRetry: 5,
                            // Use no-cors mode for fetch requests
                            fetchSetup: function(context, initParams) {
                                if (initParams) {
                                    initParams.mode = 'cors';
                                    initParams.credentials = 'same-origin';
                                }
                                return new Request(context.url, initParams);
                            },
                            debug: false
                        });

                        // Handle HLS loading with CORS protection
                        console.log('Loading HLS source:', url);
                        hls.loadSource(url);
                        hls.attachMedia(video);

                        // Handle duration and currentTime through the video element
                        video.addEventListener('loadedmetadata', () => {
                            // Only set currentTime if it's provided and valid
                            if (option.currentTime && !isNaN(option.currentTime)) {
                                art.currentTime = option.currentTime;
                            }

                            // Enable subtitles by default if available
                            if (options.subtitles?.length) {
                                const defaultSub = options.subtitles.find(sub => 
                                    (typeof sub.default === 'boolean' && sub.default) || 
                                    (typeof sub.language === 'string' && sub.language.toLowerCase().includes('english'))
                                );
                                if (defaultSub) {
                                    art.subtitle.show = true;
                                    art.subtitle.switch(defaultSub.url, {
                                        name: defaultSub.html || defaultSub.language,
                                        type: 'vtt',
                                    });
                                }
                            }
                        });

                        // Handle specific events
                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            console.log('HLS manifest parsed successfully');
                            if (option.autoplay) {
                                video.play().catch(e => console.error('Autoplay failed:', e));
                            }
                        });

                        hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
                            console.log('Loading fragment:', data.frag.url);
                        });

                        // Add error handling
                        hls.on(Hls.Events.ERROR, function(event, data) {
                            console.error('HLS error:', data.type, data);
                            
                            if (data.details === 'fragLoadError' || data.details === 'fragLoadTimeOut') {
                                console.warn('Fragment load error, retrying...');
                                if (data.frag && data.frag.url) {
                                    console.log('Fragment URL that failed:', data.frag.url);
                                }
                            }
                            
                            if (data.fatal) {
                                switch (data.type) {
                                    case Hls.ErrorTypes.NETWORK_ERROR:
                                        console.error('Fatal network error', data);
                                        setTimeout(() => {
                                            console.log('Attempting to recover from network error...');
                                            hls?.startLoad();
                                        }, 2000);
                                        break;
                                    case Hls.ErrorTypes.MEDIA_ERROR:
                                        console.error('Fatal media error', data);
                                        setTimeout(() => {
                                            console.log('Attempting to recover from media error...');
                                            hls?.recoverMediaError();
                                        }, 2000);
                                        break;
                                    default:
                                        console.error('Fatal error, cannot recover', data);
                                        // Try to fallback to native video if possible
                                        if (video.canPlayType('application/vnd.apple.mpegurl')) {
                                            console.log('Attempting fallback to native HLS playback');
                                            video.src = url;
                                        }
                                        break;
                                }
                            }
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
