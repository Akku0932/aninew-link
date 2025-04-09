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

        // Optimize HLS configuration based on device capabilities
        const isLowEndDevice = () => {
            const memory = (navigator as any).deviceMemory;
            const hardwareConcurrency = navigator.hardwareConcurrency;
            return (memory && memory <= 4) || (hardwareConcurrency && hardwareConcurrency <= 4);
        };

        // Configure HLS options based on device capabilities and network
        const getHlsConfig = () => {
            const lowEnd = isLowEndDevice();
            return {
                maxBufferLength: lowEnd ? 30 : 60,           // Maximum buffer length in seconds
                maxMaxBufferLength: lowEnd ? 60 : 120,       // Maximum buffer ahead
                maxBufferSize: lowEnd ? 30 * 1000000 : 60 * 1000000, // 30-60MB buffer size
                maxBufferHole: 0.5,                          // Maximum buffer holes
                highBufferWatchdogPeriod: 2,                 // Faster recovery from buffer stalls
                nudgeOffset: 0.2,                            // Smaller nudge for faster recovery
                liveSyncDurationCount: 3,                    // Sync to live with 3 segments
                liveMaxLatencyDurationCount: 10,             // Maximum acceptable latency
                enableWorker: true,                          // Enable web workers for parsing
                lowLatencyMode: false,                       // Standard latency for better buffering
                backBufferLength: lowEnd ? 30 : 90,          // Keep 30-90s of backward buffer

                // Improved ABR (Adaptive Bitrate) algorithm settings
                abrEwmaFastLive: 3.0,
                abrEwmaSlowLive: 9.0,
                abrEwmaFastVoD: 3.0,
                abrEwmaSlowVoD: 9.0,
                abrBandWidthFactor: 0.95,                    // Conservative bandwidth estimation
                abrBandWidthUpFactor: 0.7,                   // Conservative upscaling
                abrMaxWithRealBitrate: true,                 // Use real bitrate for ABR decisions

                // Faster startup and lower latency
                manifestLoadingTimeOut: 10000,               // 10 seconds timeout for manifest
                manifestLoadingMaxRetry: 4,                  // More retries for manifest
                manifestLoadingRetryDelay: 500,              // Start retry sooner
                manifestLoadingMaxRetryTimeout: 64000,       // Max retry timeout

                // Level loading and error handling
                levelLoadingTimeOut: 10000,                  // 10 seconds timeout for levels
                levelLoadingMaxRetry: 4,                     // More retries for levels
                levelLoadingRetryDelay: 500,                 // Start retry sooner
                levelLoadingMaxRetryTimeout: 64000,          // Max retry timeout
                
                // XHR setup
                xhrSetup: function(xhr: XMLHttpRequest, url: string) {
                    xhr.withCredentials = false;
                    xhr.timeout = 30000;                     // 30 second timeout
                    // Add cache busting only for manifests to prevent proxy caching issues
                    if (url.includes('.m3u8') && !url.includes('?_cb=')) {
                        const cbParam = `_cb=${Date.now()}`;
                        const separator = url.includes('?') ? '&' : '?';
                        url = `${url}${separator}${cbParam}`;
                    }
                    if (!url.startsWith('/api/proxy') && !url.startsWith('data:')) {
                        const absoluteUrl = url.startsWith('http') ? url : new URL(url, window.location.href).href;
                        xhr.open('GET', `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`, true);
                    }
                },
                
                startLevel: -1,                             // Auto-select starting level
                debug: false                                // Disable debug logs in production
            };
        };

        const art = new Artplayer({
            ...option,
            container: artRef.current,
            type: options.url.includes('.m3u8') ? 'customHls' : 'auto',
            customType: {
                customHls: function (video: HTMLVideoElement, url: string) {
                    if (Hls.isSupported()) {
                        // Create and configure HLS
                        hls = new Hls(getHlsConfig());
                        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
                        
                        // Add load error handler
                        hls.on(Hls.Events.ERROR, function(event, data) {
                            if (data.fatal && hls) {
                                switch (data.type) {
                                    case Hls.ErrorTypes.NETWORK_ERROR:
                                        console.warn('HLS network error, attempting recovery');
                                        hls.startLoad();
                                        break;
                                    case Hls.ErrorTypes.MEDIA_ERROR:
                                        console.warn('HLS media error, attempting recovery');
                                        hls.recoverMediaError();
                                        break;
                                    default:
                                        console.error('Fatal HLS error', data);
                                        if (hls) {
                                            hls.destroy();
                                            // Try to recreate HLS after a delay
                                            setTimeout(() => {
                                                if (hls) return;
                                                hls = new Hls(getHlsConfig());
                                                hls.loadSource(proxyUrl);
                                                hls.attachMedia(video);
                                            }, 1000);
                                        }
                                        break;
                                }
                            }
                        });

                        // Add level switch handler to show quality info
                        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
                            const level = hls?.levels[data.level];
                            if (level) {
                                art.notice.show(`Quality: ${level.height}p`, 2000);
                            }
                        });

                        // Add manifest parsed handler for quality selection
                        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
                            const qualityLevels = data.levels.map((level, index) => ({
                                html: `${level.height}p`,
                                value: index,
                                default: index === hls?.currentLevel,
                            }));

                            if (qualityLevels.length > 1) {
                                // Add quality selector only if multiple levels
                                art.setting.add({
                                    name: 'Quality',
                                    position: 'right',
                                    html: 'Quality',
                                    tooltip: 'Quality',
                                    selector: [
                                        { html: 'Auto', value: -1, default: true },
                                        ...qualityLevels
                                    ],
                                    onSelect: function(item: any) {
                                        if (hls) {
                                            hls.nextLevel = item.value;
                                        }
                                        return item.html;
                                    },
                                });
                            }

                            // Auto-preload chunks for smoother playback
                            if (!art.playing) {
                                setTimeout(() => {
                                    if (hls) {
                                        hls.loadLevel = hls.currentLevel || 0;
                                    }
                                    // Start preloading video data
                                    video.load();
                                }, 200);
                            }
                        });

                        // Load source and attach media
                        hls.loadSource(proxyUrl);
                        hls.attachMedia(video);

                        // Handle video events
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
                                    art.subtitle.show();
                                    art.subtitle.switch(defaultSub.url, {
                                        name: defaultSub.html || defaultSub.language,
                                        type: 'vtt',
                                    });
                                }
                            }
                        });

                        // Add stalled event handler to help with buffering
                        video.addEventListener('stalled', () => {
                            console.warn('Video stalled, attempting recovery');
                            // Try to nudge playback forward
                            if (video.readyState >= 2) {
                                video.currentTime = video.currentTime + 0.1;
                            }
                        });

                        // Add waiting handler to help with buffering
                        video.addEventListener('waiting', () => {
                            // Show buffer progress
                            const buffered = video.buffered;
                            if (buffered.length > 0) {
                                const bufferedEnd = buffered.end(buffered.length - 1);
                                const duration = video.duration;
                                const bufferPercentage = (bufferedEnd / duration) * 100;
                                art.notice.show(`Buffering... ${Math.round(bufferPercentage)}%`, 0);
                            } else {
                                art.notice.show('Buffering...', 0);
                            }
                        });

                        // Clear buffering notice when playback resumes
                        video.addEventListener('playing', () => {
                            if (typeof art.notice.close === 'function') {
                                art.notice.close();
                            } else {
                                art.notice.show('', 0);
                            }
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = `/api/proxy?url=${encodeURIComponent(url)}`;
                    } else {
                        console.error('HLS is not supported in this browser.');
                        art.notice.show('HLS playback not supported in this browser', 5000);
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
                preload: 'auto',  // Preload metadata
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

        // Expose the player instance via callback
        if (getInstance && typeof getInstance === 'function') {
            getInstance(art);
        }

        // Add buffer bar display
        let bufferTimer: NodeJS.Timeout | null = null;
        function updateBufferBar() {
            if (!art.playing) return;
            
            const video = art.video;
            if (!video) return;
            
            const buffered = video.buffered;
            if (buffered.length > 0) {
                const currentTime = video.currentTime;
                const duration = video.duration;
                let bufferedAhead = 0;
                
                // Find the correct buffered range containing current time
                for (let i = 0; i < buffered.length; i++) {
                    if (buffered.start(i) <= currentTime && currentTime <= buffered.end(i)) {
                        bufferedAhead = buffered.end(i) - currentTime;
                        break;
                    }
                }
                
                // Update buffer info if very low
                if (bufferedAhead < 5 && art.playing) {
                    art.notice.show(`Low buffer: ${Math.round(bufferedAhead)}s`, 2000);
                }
            }
            
            // Check again every 2 seconds
            bufferTimer = setTimeout(updateBufferBar, 2000);
        }
        
        // Start buffer monitoring
        updateBufferBar();

        // Cleanup function for useEffect
        return () => {
            if (hls) {
                hls.destroy();
            }
            if (artPlayerRef.current) {
                artPlayerRef.current.destroy();
                artPlayerRef.current = null;
            }
            if (bufferTimer) {
                clearTimeout(bufferTimer);
            }
        };
    }, [options, getInstance]);

    return (
        <div ref={artRef} className={className} style={style}></div>
    );
}
