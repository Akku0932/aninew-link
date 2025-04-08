"use client"

import React, { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

// Check if HLS is supported by the browser
const hlsSupported = typeof window !== 'undefined' && Hls.isSupported();

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

// Create a separate HLS loader function with error handling
const loadHlsSource = (video: HTMLVideoElement, url: string, art: any) => {
    if (hlsSupported) {
        const hls = new Hls({
            // Basic configuration
            autoStartLoad: true,
            startLevel: -1,
            debug: false,
            
            // Enhanced settings for better reliability
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            maxBufferSize: 60 * 1000 * 1000, // 60MB
            fragLoadingMaxRetry: 6,
            manifestLoadingMaxRetry: 6,
            levelLoadingMaxRetry: 6,
            fragLoadingRetryDelay: 1000,
            manifestLoadingRetryDelay: 1000,
            levelLoadingRetryDelay: 1000,
            
            // More lenient error handling
            fragLoadingMaxRetryTimeout: 10000,
            manifestLoadingMaxRetryTimeout: 10000,
            levelLoadingMaxRetryTimeout: 10000
        });
        
        // Add error handling
        hls.on(Hls.Events.ERROR, function(event, data) {
            console.warn('HLS error:', data.type, data.details);
            
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error('Fatal network error', data);
                        hls.startLoad(); // Try to recover
                        break;
                        
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error('Fatal media error', data);
                        hls.recoverMediaError(); // Try to recover
                        break;
                        
                    default:
                        // For parsing errors or other fatal issues, fall back to direct playback
                        console.error('Unrecoverable HLS error, falling back to direct playback', data);
                        hls.destroy();
                        
                        // Try direct playback as fallback
                        video.src = url;
                        video.play().catch(e => {
                            console.error('Direct playback failed too:', e);
                            
                            // Notify the player about the error
                            if (art && art.notice) {
                                art.notice.show('Video playback error. Please try another server or episode.');
                            }
                        });
                        break;
                }
            }
        });
        
        // Setup HLS
        hls.loadSource(url);
        hls.attachMedia(video);
        
        // Clean up on destroy
        video.addEventListener('destroy', () => {
            hls.destroy();
        });
        
        return hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // For Safari which has built-in HLS support
        video.src = url;
        return null;
    } else {
        // Fallback for browsers without HLS support
        video.src = url;
        return null;
    }
};

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
                    hls = loadHlsSource(video, url, art);
                    if (hls) {
                        // Store HLS instance for quality switching
                        art.hls = hls;
                        
                        // Add quality levels after manifest is loaded
                        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                            if (data.levels.length > 1) {
                                const qualities = data.levels.map((level, index) => ({
                                    html: `${level.height || index + 1}p`,
                                    value: index,
                                    desc: `${((level.bitrate / 1000) | 0)}kbps`
                                }));
                                
                                // Update quality options in the player
                                art.setting.update({
                                    html: 'Quality',
                                    selector: [
                                        { html: 'Auto', value: 'auto', default: true },
                                        ...qualities
                                    ],
                                    onSelect: function(item) {
                                        if (hls) {
                                            if (item.value === 'auto') {
                                                hls.currentLevel = -1; // Auto quality
                                            } else {
                                                hls.currentLevel = item.value; // Specific quality
                                            }
                                        }
                                        return item.html;
                                    }
                                });
                            }
                        });
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
