"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronDown, Play, Settings, SkipForward, ChevronLeft, ChevronRight, List, Search, X, MonitorPlay, Volume2, Keyboard, Lightbulb, Download, Share2, Monitor, Subtitles, Grid, LayoutGrid, List as ListIcon, Image as ImageIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "lucide-react"
import ArtPlayer from '@/components/ArtPlayer';
import { useRouter } from 'next/navigation';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import Link from "next/link"
import AnimeMALButton from "@/components/anime-mal-button"
import AnimeMALStatus from "@/components/anime-mal-status"
import AnimeFavoriteButton from "@/components/anime-favorite-button"

type Episode = {
  title: string
  jtitle?: string
  episodeId: string
  number: number
  isFiller: boolean
}

type AnimeInfo = {
  info: {
    id?: string
    img: string
    name: string
    jname: string
    description: string
    type: string
    duration: string
    sub: number | null
    dub: number | null
    raw?: number | null
    eps: number
    pg?: string
    quality?: string
    anilistId?: string
    malId?: number
  }
  otherInfo?: {
    genres?: string[]
    status?: string
    recommendations?: { id: string; img: string; name: string; type: string }[]
  }
}

type VideoSource = {
  url: string
  type: string
  quality?: string
  intro?: {
    start: number
    end: number
  }
  outro?: {
    start: number
    end: number
  }
  isM3U8: boolean
  subtitles?: Array<{
    url: string
    language: string
    label: string
    default?: boolean
  }>
  audio: string
}

type VideoTrack = {
  file: string
  label: string
  kind: string
  default?: boolean
}

type VideoResponse = {
  sources: VideoSource[]
  tracks?: VideoTrack[]
  intro?: { start: number; end: number }
  outro?: { start: number; end: number }
  anilistID?: number
  malID?: number
}

type WatchedAnime = {
  id: string
  title: string
  image: string
  episode: number
  episodeId: string
  progress: number
  totalEpisodes: number
  timestamp: number
}

interface AnimeEpisode {
  episodeId: string;
  number: number;
  title?: string;
  isFiller?: boolean;
}

interface Subtitle {
  language: string;
  url: string;
}

interface WatchProgress {
  animeId: string;
  episodeId: string;
  timestamp: number;
  title: string;
  image: string;
  episodeNumber: number;
}

// Add HLS.js type definition
interface HLSLevel {
  height: number;
  width: number;
  bitrate: number;
  url: string[];
}

interface HLSInstance {
  loadSource: (url: string) => void;
  attachMedia: (element: HTMLVideoElement) => void;
  destroy: () => void;
  on: (event: string, callback: (event: string, data: any) => void) => void;
  levels: HLSLevel[];
  currentLevel: number;
  loadLevel: number;
}

// Add these new types
type GridViewMode = "thumbnail" | "box" | "horizontal";

export default function WatchPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const episodeParam = searchParams?.get("ep")
  const router = useRouter();

  const [animeInfo, setAnimeInfo] = useState<AnimeInfo | null>(null);
  const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string>(episodeParam || "");
  const [videoSrc, setVideoSrc] = useState<VideoSource | null>(null);
  const [videoTracks, setVideoTracks] = useState<VideoTrack[]>([]);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [recommendedAnime, setRecommendedAnime] = useState<{id: string; img: string; name: string; type: string}[]>([]);
  const [category, setCategory] = useState<"sub" | "dub" | "raw">(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage?.getItem('category');
      return (saved === 'dub' ? 'dub' : saved === 'raw' ? 'raw' : 'sub');
    }
    return "sub";
  });
  const [selectedServer, setSelectedServer] = useState<"vidcloud" | "vidstreaming" | "zoro" | "kiwi" | "arc">(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage?.getItem('selectedServer');
      return (saved === 'vidstreaming' ? 'vidstreaming' : saved === 'zoro' ? 'zoro' : saved === 'kiwi' ? 'kiwi' : saved === 'arc' ? 'arc' : 'vidcloud');
    }
    return 'vidcloud';
  });
  const [server, setServer] = useState<"vidstreaming" | "vidcloud">("vidcloud");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [language, setLanguage] = useState<"EN" | "JP">("EN");

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const playerRef = useRef<any>(null);
  const artRef = useRef<any>(null);

  const [watchProgress, setWatchProgress] = useState<WatchProgress[]>([]);
  const [autoskip, setAutoskip] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoskip');
      return saved === null ? true : saved === 'true'; // Default to true if not set
    }
    return true; // Default to true
  });
  const [autoNext, setAutoNext] = useState<boolean>(true);
  const [skipNotification, setSkipNotification] = useState<'intro' | 'outro' | null>(null);
  const skipNotificationTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const [showEpisodes, setShowEpisodes] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [lightsOff, setLightsOff] = useState(false)
  const [autoplay, setAutoplay] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoplay');
      return saved === null ? true : saved === 'true';
    }
    return true;
  });

  const [gridViewMode, setGridViewMode] = useState<GridViewMode>("thumbnail");
  const [episodePage, setEpisodePage] = useState(1);
  const episodesPerPage = 100;

  const serverOptions = [
    { id: 'zoro', name: 'ZORO' },
    { id: 'kiwi', name: 'KIWI' },
    { id: 'arc', name: 'ARC' }
  ]

  const [availableCategories, setAvailableCategories] = useState<("sub" | "dub" | "raw")[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Load language preference
    const savedLanguage = localStorage?.getItem("preferredLanguage");
    if (savedLanguage === "JP" || savedLanguage === "EN") {
      setLanguage(savedLanguage);
    }
  }, []);

  // Add separate useEffect for language change listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Listen for language change events from the header
    const handleLanguageChange = (event: CustomEvent<"EN" | "JP">) => {
      setLanguage(event.detail);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);

    // Clean up event listener
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchAnimeInfo = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`https://aninew-seven.vercel.app/info/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch anime info")
        }
        const data = await response.json()
        setAnimeInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    const fetchEpisodes = async () => {
      try {
        const response = await fetch(`https://aninew-seven.vercel.app/episodes/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch episodes")
        }
        const data = await response.json()
        if (data && data.episodes && Array.isArray(data.episodes)) {
          setEpisodes(data.episodes)

          // If we have episodes and no current episode is set, set the first one
          if (data.episodes.length > 0) {
            if (!episodeParam) {
              // No episode specified, use first episode
              const firstEpisode = data.episodes[0];
              // Extract just the episode number from the ID
              const episodeNumber = firstEpisode.episodeId.split('?ep=')[1];
              setCurrentEpisodeId(episodeNumber);
              
              // Update URL with just the episode number
              const url = new URL(window.location.href);
              url.searchParams.set("ep", episodeNumber);
              window.history.pushState({}, "", url);
            } else {
              // Episode number specified, find matching episode
              const targetEpisode = data.episodes.find((ep: AnimeEpisode) => ep.number === Number(episodeParam));
              if (targetEpisode) {
                // Extract just the episode number from the ID
                const episodeNumber = targetEpisode.episodeId.split('?ep=')[1];
                setCurrentEpisodeId(episodeNumber);
                
                // Update URL with just the episode number
                const url = new URL(window.location.href);
                url.searchParams.set("ep", episodeNumber);
                window.history.pushState({}, "", url);
              }
            }
          }
        } else {
          setEpisodes([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setEpisodes([])
      }
    }

    const fetchRecommendedAnime = async () => {
      try {
        const response = await fetch(`https://aninew-seven.vercel.app/recommended/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch recommended anime")
        }
        const data = await response.json()
        setRecommendedAnime(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching recommended anime:", err)
        setRecommendedAnime([])
      }
    }

    fetchAnimeInfo()
    fetchEpisodes()
    fetchRecommendedAnime()
  }, [id, episodeParam])

  // Load user preferences from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedWatchProgress = localStorage.getItem('watchProgress');
    const savedAutoskip = localStorage.getItem('autoskip');
    const savedAutoNext = localStorage.getItem('autoNext');

    if (savedWatchProgress) {
      setWatchProgress(JSON.parse(savedWatchProgress));
    }
    if (savedAutoskip) {
      setAutoskip(savedAutoskip === 'true');
    }
    if (savedAutoNext) {
      setAutoNext(savedAutoNext === 'true');
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('autoskip', autoskip.toString());
    localStorage.setItem('autoNext', autoNext.toString());
  }, [autoskip, autoNext]);

  // Save category preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('category', category);
    }
  }, [category]);

  // Fetch video source for an episode
  const fetchVideoSource = async (episodeId: string) => {
      setIsLoading(true);
      setError(null);
      
    try {
      const animeId = typeof id === "string" ? id.split("?")[0] : id;
      
      console.log('Fetching video source:', {
        animeId,
        episodeId,
        category,
        server: selectedServer
      });
      
      // Check all categories availability
      const categoriesToCheck: ("sub" | "dub" | "raw")[] = ["raw", "sub", "dub"];
      const availableCats: ("sub" | "dub" | "raw")[] = [];
      
      for (const cat of categoriesToCheck) {
        try {
          const response = await fetch(
            `https://aninew-seven.vercel.app/episode-srcs?id=${animeId}&ep=${episodeId}&category=${cat}&server=${selectedServer}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.sources?.length) {
              availableCats.push(cat);
            }
          }
        } catch (error) {
          console.log(`Error checking ${cat} availability:`, error);
        }
      }
      
      setAvailableCategories(availableCats);
      
      // If raw is available, select it by default
      if (availableCats.includes("raw")) {
        setCategory("raw");
      } else if (!availableCats.includes(category) && availableCats.length > 0) {
        setCategory(availableCats[0]);
      }
      
      // Fetch the selected category's source
      const response = await fetch(
        `https://aninew-seven.vercel.app/episode-srcs?id=${animeId}&ep=${episodeId}&category=${category}&server=${selectedServer}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${category} source`);
      }
      
      const data = await response.json();
      
      if (!data.sources?.length) {
        throw new Error(`No video sources found for ${category}`);
      }

      // Set video source with all available data
      const videoSource = {
        url: data.sources[0].url,
        type: data.sources[0].type || 'hls',
        isM3U8: true,
        intro: data.intro || data.sources[0].intro,
        outro: data.outro || data.sources[0].outro,
        subtitles: data.tracks?.filter((track: VideoTrack) => track.kind === "captions").map((track: VideoTrack) => ({
        url: track.file,
        language: track.label.toLowerCase(),
        label: track.label,
        default: track.default || track.label.toLowerCase().includes('english')
        })) || [],
        audio: category === 'raw' ? 'raw' : category === 'sub' ? 'jpn' : 'eng',
        quality: data.sources[0].quality
      };

      setVideoSrc(videoSource);
      setVideoTracks(data.tracks?.filter((track: VideoTrack) => track.kind !== "thumbnails") || []);
      setSubtitles(data.tracks?.filter((track: VideoTrack) => track.kind === "captions").map((track: VideoTrack) => ({
        url: track.file,
        language: track.label.toLowerCase(),
        label: track.label,
        default: track.default || track.label.toLowerCase().includes('english')
      })) || []);

    } catch (error) {
      console.error('Error fetching video source:', error);
      setError('Failed to load video source');
      toast({
        title: "Error",
        description: "Failed to load video source. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to call fetchVideoSource when currentEpisodeId changes
  useEffect(() => {
    if (currentEpisodeId) {
      fetchVideoSource(currentEpisodeId);
    }
  }, [currentEpisodeId, category])

  // Handle time update for saving progress
  const handleProgressUpdate = () => {
    if (!playerRef.current) return
    const timestamp = playerRef.current.currentTime
    // Save progress every 5 seconds
    if (Math.floor(timestamp) % 5 === 0) {
      saveWatchProgress(timestamp)
    }
  }

  // Handle episode end and autoplay
  const handleVideoEnded = (event?: Event) => {
    if (!episodes || !currentEpisodeId) return;
    
    if (autoNext) {
      handleNextEpisode();
    }
  }

  // Setup HLS.js when video source changes
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc?.url) return

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    console.log("Setting up video with source:", videoSrc)

    // Check if the URL is valid
    if (!videoSrc.url.startsWith("http")) {
      setError(`Invalid video URL: ${videoSrc.url}`)
      return
    }

    // Check if the browser supports HLS natively (like Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("Using native HLS support")
      video.src = videoSrc.url
      video.onerror = (e) => {
        console.error("Video error with native playback:", e)
        setError("Error playing video: The video might be unavailable or in an unsupported format")
      }
    } else {
      // Load HLS.js from CDN with integrity check disabled
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js'
      script.async = true
      
      script.onload = () => {
        const Hls = (window as any).Hls
        if (Hls && Hls.isSupported()) {
          console.log("Using HLS.js for playback")
          try {
            // Try with a direct video element first as a fallback
            if (videoSrc.url.includes(".mp4")) {
              video.src = videoSrc.url
              video.load()
            } else {
              const hls = new Hls({
                autoStartLoad: true,
                startLevel: -1,
                capLevelToPlayerSize: true,
                maxBufferLength: 30,
                maxMaxBufferLength: 600,
                maxBufferSize: 60 * 1000 * 1000,
                maxBufferHole: 0.5,
                lowLatencyMode: false,
                debug: false
              })
              hls.loadSource(videoSrc.url)
              hls.attachMedia(video)
              hlsRef.current = hls
            }
          } catch (e) {
            console.error("Error initializing HLS:", e)
            setError("Failed to initialize video player. Please try a different server or episode.")
          }
        } else {
          console.error("HLS is not supported in this browser and no native support")
          setError("Your browser doesn't support HLS playback. Please try a different browser like Chrome or Safari.")
        }
      }

      script.onerror = (err) => {
        console.error("Failed to load HLS.js:", err)
        setError("Failed to load video player library. Please refresh the page.")
      }

      document.head.appendChild(script)
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [videoSrc])

  // Track video progress and save to watch history
  useEffect(() => {
    const video = videoRef.current
    if (!video || !animeInfo) return

    const updateProgress = () => {
      const currentTime = video.currentTime
      const duration = video.duration

      if (duration > 0) {
        const progress = Math.floor((currentTime / duration) * 100)
        setVideoProgress(progress)

        // Save to watch history
        if (progress > 0 && currentEpisodeId) {
          const currentEpisodeObj = episodes.find((ep) => {
            const epIdParts = ep.episodeId.split("?ep=")
            const epId = epIdParts.length > 1 ? epIdParts[1] : epIdParts[0]
            return epId === currentEpisodeId
          })
          const episodeNumber = currentEpisodeObj ? currentEpisodeObj.number : 1

          saveToWatchHistory({
            id: id as string,
            title: animeInfo.info.name,
            image: animeInfo.info.img,
            episode: episodeNumber,
            episodeId: currentEpisodeId,
            progress: progress,
            totalEpisodes: animeInfo.info.eps || episodes.length,
            timestamp: Date.now(),
          })
        }
      }
    }

    // Update every 5 seconds and on timeupdate
    const interval = setInterval(updateProgress, 5000)
    video.addEventListener("timeupdate", updateProgress)

    return () => {
      clearInterval(interval)
      video.removeEventListener("timeupdate", updateProgress)
    }
  }, [videoSrc, animeInfo, id, currentEpisodeId, episodes])

  // Handle video time update for intro/outro skipping
  const handleTimeUpdate = () => {
    if (!artRef.current || !videoSrc) return;
    
    const currentTime = artRef.current.currentTime;
    
    // Skip intro if enabled and available
    if (autoskip && videoSrc.intro && 
        currentTime >= videoSrc.intro.start && 
        currentTime < videoSrc.intro.end) {
      console.log('Auto-skipping intro:', videoSrc.intro);
      artRef.current.currentTime = videoSrc.intro.end;
      setSkipNotification('intro');
      if (skipNotificationTimeout.current) {
        clearTimeout(skipNotificationTimeout.current);
      }
      skipNotificationTimeout.current = setTimeout(() => {
        setSkipNotification(null);
      }, 2000);
    }
    
    // Skip outro if enabled and available
    if (autoskip && videoSrc.outro && 
        currentTime >= videoSrc.outro.start && 
        currentTime < videoSrc.outro.end) {
      console.log('Auto-skipping outro:', videoSrc.outro);
      if (autoNext) {
        handleVideoEnded();
      } else {
        artRef.current.currentTime = videoSrc.outro.end;
        setSkipNotification('outro');
        if (skipNotificationTimeout.current) {
          clearTimeout(skipNotificationTimeout.current);
        }
        skipNotificationTimeout.current = setTimeout(() => {
          setSkipNotification(null);
        }, 2000);
      }
    }
  };

  const handleSkipIntro = () => {
    if (artRef.current && videoSrc?.intro) {
      console.log('Manual Skip Intro:', videoSrc.intro);
      artRef.current.currentTime = videoSrc.intro.end;
      setSkipNotification('intro');
      if (skipNotificationTimeout.current) {
        clearTimeout(skipNotificationTimeout.current);
      }
      skipNotificationTimeout.current = setTimeout(() => {
        setSkipNotification(null);
      }, 2000);
    }
  };

  const handleSkipOutro = () => {
    if (artRef.current && videoSrc?.outro) {
      console.log('Manual Skip Outro:', videoSrc.outro);
      if (autoNext) {
        handleVideoEnded();
      } else {
        artRef.current.currentTime = videoSrc.outro.end;
        setSkipNotification('outro');
        if (skipNotificationTimeout.current) {
          clearTimeout(skipNotificationTimeout.current);
        }
        skipNotificationTimeout.current = setTimeout(() => {
          setSkipNotification(null);
        }, 2000);
      }
    }
  };

  const handleNextEpisode = () => {
    if (!episodes.length || !currentEpisodeId) return;
    
    const currentIndex = episodes.findIndex(ep => ep.episodeId === currentEpisodeId);
    if (currentIndex === -1 || currentIndex === episodes.length - 1) return;
    
    const nextEpisode = episodes[currentIndex + 1];
    if (nextEpisode) {
      setCurrentEpisodeId(nextEpisode.episodeId);
      router.push(`/watch/${id}?ep=${nextEpisode.episodeId}`);
    }
  };

  const handlePreviousEpisode = () => {
    if (!episodes.length || !currentEpisodeId) return;
    
    const currentIndex = episodes.findIndex(ep => ep.episodeId === currentEpisodeId);
    if (currentIndex <= 0) return;
    
    const prevEpisode = episodes[currentIndex - 1];
    if (prevEpisode) {
      setCurrentEpisodeId(prevEpisode.episodeId);
      router.push(`/watch/${id}?ep=${prevEpisode.episodeId}`);
    }
  };

  useEffect(() => {
    if (!videoSrc || !artRef.current) return;

    const art = artRef.current;

    const handleEnded = () => {
      if (autoNext) {
        handleNextEpisode();
      }
    };

    art.on('ended', handleEnded);
    
    return () => {
      art.off('ended', handleEnded);
    };
  }, [videoSrc, autoNext, handleNextEpisode]);

  // Render video player
  const renderVideoPlayer = () => {
    if (!videoSrc) {
      return (
        <div className="flex h-full items-center justify-center bg-gray-900">
          <p className="text-gray-400">Video source not available</p>
        </div>
      );
    }

    const playerOptions = {
      url: videoSrc.url,
      type: 'm3u8', // Always use m3u8 for HLS streams
      title: `${animeInfo?.info?.name} - Episode ${currentEpisodeId.split('?ep=')[1]}`,
      poster: animeInfo?.info?.img || "",
      volume: 1,
      isLive: false,
      muted: false,
      autoplay: true,
      pip: true,
      autoSize: false,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: autoNext,
      airplay: true,
      theme: "#23ade5",
      lang: language.toLowerCase(),
      whitelist: ["*"],
      moreVideoAttr: {
        crossOrigin: "anonymous",
      },
      subtitle: videoSrc.subtitles?.length ? {
        url: videoSrc.subtitles[0].url,
        type: 'vtt',
        style: {
          color: '#fff',
          fontSize: '20px',
          textShadow: '0 0 2px #000'
        },
        encoding: 'utf-8'
      } : undefined,
      settings: [
        {
          html: "Quality",
          icon: '<i class="art-icon art-icon-settings"></i>',
          selector: [
            {
              html: 'Auto',
              value: 'auto',
              default: true
            },
            ...(videoTracks
              .filter(track => track.kind === "quality")
              .map((track) => ({
                html: track.label,
                value: track.file,
              })) || [])
          ],
          onSelect: handleQualityChange,
        },
        {
          html: "Subtitles",
          icon: '<i class="art-icon art-icon-subtitle"></i>',
          selector: [
            { html: 'Off', value: 'off' },
            ...(videoSrc.subtitles?.map(sub => ({
              html: sub.label,
              value: sub.url,
              default: sub.default
            })) || [])
          ],
          onSelect: (item: { html: string; value: string }) => {
            const art = artRef.current;
            if (!art) return item.value;

            if (item.value === 'off') {
              art.subtitle.show = false;
            } else {
              art.subtitle.switch(item.value);
              art.subtitle.show = true;
            }
            return item.value;
          }
        }
      ],
      customType: {
        m3u8: function (video: HTMLVideoElement, url: string) {
          // Dynamically import HLS.js
          import('hls.js').then(({ default: Hls }) => {
            if (Hls.isSupported()) {
              const hls = new Hls({
                autoStartLoad: true,
                startLevel: -1, // Auto quality by default
                capLevelToPlayerSize: true, // Adapt quality to player size
                maxBufferLength: 30,
                maxMaxBufferLength: 600,
                maxBufferSize: 60 * 1000 * 1000, // 60MB max buffer size
                maxBufferHole: 0.5,
                lowLatencyMode: false,
                debug: false
              });
              
              hls.loadSource(url);
              hls.attachMedia(video);
              hlsRef.current = hls;

              // Handle quality levels after manifest is loaded
              hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                const qualities = data.levels.map(level => ({
                  html: `${level.height}p`,
                  value: level.url[0],
                  bitrate: level.bitrate
                }));

                // Update quality options
                const art = artRef.current;
                if (art) {
                  art.setting.update({
                    html: 'Quality',
                    selector: [
                      { html: 'Auto', value: 'auto', default: true },
                      ...qualities
                    ],
                  });
                }

                console.log('Available qualities:', qualities);
              });
              
              // Clean up HLS on destroy
              video.addEventListener('destroy', () => {
                if (hlsRef.current) {
                  hlsRef.current.destroy();
                  hlsRef.current = null;
                }
              });
            }
          }).catch(err => {
            console.error("Failed to load HLS.js:", err);
          });
        }
      }
    };

    return (
      <div className="relative aspect-video w-full bg-black">
          <ArtPlayer
            options={playerOptions}
            style={{
              width: '100%',
              height: '100%',
            }}
            getInstance={(art) => {
              artRef.current = art;
            playerRef.current = art;

            // Set up time update listener for skip detection
            art.on('video:timeupdate', () => {
              if (!videoSrc) return;
              
              const currentTime = art.currentTime;
              const video = art.template.$video;
              
              // Handle intro skip
              if (autoskip && videoSrc.intro && 
                  currentTime >= videoSrc.intro.start && 
                  currentTime <= videoSrc.intro.end) {
                console.log('Skipping intro:', {
                  currentTime,
                  intro: videoSrc.intro
                });
                if (video) {
                  video.currentTime = videoSrc.intro.end;
                  toast({
                    title: "Intro Skipped",
                    description: "Automatically skipped the intro",
                    duration: 2000,
                  });
                }
              }
              
              // Handle outro skip
              if (autoskip && videoSrc.outro && 
                  currentTime >= videoSrc.outro.start && 
                  currentTime <= videoSrc.outro.end) {
                console.log('Skipping outro:', {
                  currentTime,
                  outro: videoSrc.outro,
                  autoNext
                });
                if (autoNext) {
                  const nextEp = episodes.find(ep => ep.number === currentEpisodeNumber + 1);
                  if (nextEp) {
                    const nextEpId = nextEp.episodeId.split('?ep=')[1];
                    setCurrentEpisodeId(nextEpId);
                    router.push(`/watch/${id}?ep=${nextEpId}`);
                    toast({
                      title: "Next Episode",
                      description: `Playing episode ${nextEp.number}`,
                      duration: 3000,
                    });
                  }
                } else if (video) {
                  video.currentTime = videoSrc.outro.end;
                  toast({
                    title: "Outro Skipped",
                    description: "Automatically skipped the outro",
                    duration: 2000,
                  });
                }
              }
            });

            // Set up ended event for auto-next
            art.on('video:ended', () => {
              console.log('Video ended, checking for next episode');
              if (autoNext) {
                const nextEp = episodes.find(ep => ep.number === currentEpisodeNumber + 1);
                if (nextEp) {
                  console.log('Found next episode:', nextEp);
                  const nextEpId = nextEp.episodeId.split('?ep=')[1];
                  setCurrentEpisodeId(nextEpId);
                  router.push(`/watch/${id}?ep=${nextEpId}`);
                  toast({
                    title: "Next Episode",
                    description: `Playing episode ${nextEp.number}`,
                    duration: 3000,
                  });
                } else {
                  console.log('No next episode found');
                  toast({
                    title: "Last Episode",
                    description: "No more episodes available",
                    variant: "destructive",
                    duration: 3000,
                  });
                }
              }
            });

            // Initialize subtitles if available
            if (videoSrc.subtitles?.length) {
              const defaultSub = videoSrc.subtitles.find(sub => 
                sub.language.toLowerCase() === 'english'
              ) || videoSrc.subtitles[0];
              art.subtitle.switch(defaultSub.url);
              art.subtitle.show = true;
            }

            // Clean up event listeners
            return () => {
              art.off('video:timeupdate');
              art.off('video:ended');
            };
          }}
        />

        {/* Skip notification */}
        {skipNotification && (
          <div className="absolute top-8 right-8 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-right-5">
            <div className="flex items-center gap-2">
              <SkipForward className="h-4 w-4" />
              <span>Skipping {skipNotification}...</span>
            </div>
          </div>
        )}

        {/* Auto-skip controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => {
              setAutoskip(!autoskip);
              localStorage.setItem('autoskip', (!autoskip).toString());
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
              autoskip 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-800/75 hover:bg-gray-700/75 text-gray-200'
            } backdrop-blur-md shadow-lg`}
          >
            <SkipForward className="h-4 w-4" />
            Auto Skip {autoskip ? 'On' : 'Off'}
          </button>
          <button
            onClick={() => {
              setAutoNext(!autoNext);
              localStorage.setItem('autoNext', (!autoNext).toString());
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
              autoNext 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-800/75 hover:bg-gray-700/75 text-gray-200'
            } backdrop-blur-md shadow-lg`}
          >
            <MonitorPlay className="h-4 w-4" />
            Auto Next {autoNext ? 'On' : 'Off'}
          </button>
        </div>

        {/* Manual skip buttons when auto-skip is off */}
        {!autoskip && videoSrc?.intro && (
          <button
            onClick={handleSkipIntro}
            className="absolute bottom-4 right-4 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-2 shadow-lg"
          >
            <SkipForward className="h-4 w-4" />
            Skip Intro
          </button>
        )}
      </div>
    );
  };

  // Save watch progress
  const saveWatchProgress = (timestamp: number) => {
    if (!animeInfo?.info || !currentEpisodeId || !currentEpisodeNumber) return

    const progress: WatchProgress = {
      animeId: id as string,
      episodeId: currentEpisodeId,
      timestamp,
      title: animeInfo.info.name,
      image: animeInfo.info.img,
      episodeNumber: typeof currentEpisodeNumber === 'string' ? 
        parseInt(currentEpisodeNumber, 10) : 
        currentEpisodeNumber
    }

    const newProgress = [
      progress,
      ...watchProgress.filter(p => 
        p.animeId !== id || p.episodeId !== currentEpisodeId).slice(0, 19)
    ]

    setWatchProgress(newProgress)
    localStorage.setItem('watchProgress', JSON.stringify(newProgress))
  }

  const saveToWatchHistory = (watchData: WatchedAnime) => {
    try {
      // Get existing history
      const savedHistory = localStorage.getItem("animeWatchHistory")
      let history: WatchedAnime[] = []

      if (savedHistory) {
        history = JSON.parse(savedHistory)
      }

      // Check if this anime is already in history
      const existingIndex = history.findIndex((item) => item.id === watchData.id)

      // Update or add to history
      if (existingIndex >= 0) {
        history[existingIndex] = watchData
      } else {
        history.push(watchData)
      }

      // Limit history to 20 items
      if (history.length > 20) {
        history = history.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20)
      }

      // Save back to localStorage
      localStorage.setItem("animeWatchHistory", JSON.stringify(history))

      // Trigger storage event for other components to update
      window.dispatchEvent(new Event("storage"))
    } catch (error) {
      console.error("Error saving to watch history:", error)
    }
  }

  // Handle navigation to next/previous episode
  const navigateToEpisode = (direction: 'next' | 'prev') => {
    if (!episodes.length || !currentEpisodeId) return;
    
    const currentIndex = episodes.findIndex(ep => ep.episodeId === currentEpisodeId);
    if (direction === 'next' && currentIndex < episodes.length - 1) {
      const nextEpisode = episodes[currentIndex + 1];
      handleNextEpisode();
    } else if (direction === 'prev' && currentIndex > 0) {
      const prevEpisode = episodes[currentIndex - 1];
      handlePreviousEpisode();
    }
  };

  // Handle episode change
  const handleEpisodeChange = (episodeId: string) => {
    if (!episodeId) return;
    
    setCurrentEpisodeId(episodeId);
    // Update URL to include the episode ID
    const url = new URL(window.location.href);
    url.searchParams.set("ep", episodeId);
    window.history.pushState({}, "", url);
  };

  // Add a direct video fallback function
  const tryDirectVideoPlayback = () => {
    const video = videoRef.current
    if (!video || !videoSrc) return

    // Clean up HLS if it exists
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Try direct video playback
    video.src = videoSrc.url
    video.load()
    video.play().catch((e) => {
      console.error("Direct playback failed:", e)
      setError("Failed to play video directly. The stream might be unavailable.")
    })
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedProgress = localStorage.getItem('watchProgress');
    if (savedProgress) {
      setWatchProgress(JSON.parse(savedProgress));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('watchProgress', JSON.stringify(watchProgress));
  }, [watchProgress]);

  // Add this new function for filtering episodes
  const filteredEpisodes = episodes.filter(episode => {
    const searchStr = searchQuery.toLowerCase()
    return (
      episode.number.toString().includes(searchStr) ||
      (episode.title && episode.title.toLowerCase().includes(searchStr))
    )
  })

  // Add lights off effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const body = document.body;
    if (lightsOff) {
      body.style.backgroundColor = '#000000';
      body.style.transition = 'background-color 0.3s ease';
    } else {
      body.style.backgroundColor = '#0a0a0a';
    }
    
    return () => {
      body.style.backgroundColor = '#0a0a0a';
    };
  }, [lightsOff]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoplay', autoplay.toString());
    }
  }, [autoplay]);

  // Update the quality selection handler
  const handleQualityChange = (item: { html: string; value: string }) => {
    const art = artRef.current;
    if (!art) return item.value;

    if (item.value === 'auto') {
      // Enable HLS automatic quality selection
      if (hlsRef.current) {
        hlsRef.current.loadLevel = -1; // -1 means auto
        toast({
          title: "Quality",
          description: "Auto quality enabled",
          duration: 2000,
        });
      }
    } else {
      // Set specific quality level
      if (hlsRef.current) {
        const levels = hlsRef.current.levels;
        const levelIndex = levels.findIndex((level: HLSLevel) => 
          level.height === parseInt(item.html.replace('p', ''))
        );
        if (levelIndex !== -1) {
          hlsRef.current.currentLevel = levelIndex;
          toast({
            title: "Quality",
            description: `Quality set to ${item.html}`,
            duration: 2000,
          });
        }
      }
    }
    return item.value;
  };

  // Add this function to handle grid view mode change
  const handleGridViewModeChange = (mode: GridViewMode) => {
    setGridViewMode(mode);
    localStorage.setItem('episodeGridViewMode', mode);
  };

  // Add this function to handle episode page change
  const handleEpisodePageChange = (page: number) => {
    setEpisodePage(page);
  };

  // Add this to load grid view mode from localStorage
  useEffect(() => {
    const savedGridViewMode = localStorage.getItem('episodeGridViewMode') as GridViewMode;
    if (savedGridViewMode) {
      setGridViewMode(savedGridViewMode);
    }
  }, []);

  // Modify the filtered episodes to include pagination
  const paginatedEpisodes = filteredEpisodes.slice(
    (episodePage - 1) * episodesPerPage,
    episodePage * episodesPerPage
  );
  
  const totalPages = Math.ceil(filteredEpisodes.length / episodesPerPage);

  if (isLoading && !animeInfo) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-800 border-t-red-600"></div>
      </div>
    )
  }

  if (error || !animeInfo) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Error</h2>
          <p className="text-gray-400">{error || "Failed to load anime"}</p>
        </div>
      </div>
    )
  }

  // Find current episode number from episodes array
  const currentEpisodeObj = episodes.find((ep) => {
    const epIdParts = ep.episodeId.split("?ep=")
    const epId = epIdParts.length > 1 ? epIdParts[1] : epIdParts[0]
    return epId === currentEpisodeId
  })
  const currentEpisodeNumber = currentEpisodeObj ? currentEpisodeObj.number : 1
  const currentEpisodeTitle = currentEpisodeObj ? currentEpisodeObj.title : `Episode ${currentEpisodeNumber}`

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto p-4">
        {/* Player and Episodes Container */}
        <div className="flex gap-4">
          {/* Video Player Section */}
          <div className="flex-1">
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
              {renderVideoPlayer()}
            </div>
            
            {/* Bottom Controls Bar - Moved below player */}
            <div className="mt-4 bg-[#141414] rounded-lg border border-white/[0.08] p-4">
              <div className="flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoskip}
                      onChange={() => setAutoskip(!autoskip)}
                      className="w-4 h-4 accent-yellow-400 bg-transparent border-white/20"
                    />
                    <span className="text-sm text-white/90">Auto Skip</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoNext}
                      onChange={() => setAutoNext(!autoNext)}
                      className="w-4 h-4 accent-white bg-transparent border-white/20"
                    />
                    <span className="text-sm text-white/90">Auto Next</span>
                  </label>
                </div>

                {/* Center Controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePreviousEpisode()}
                    disabled={!episodes.find(ep => ep.number === currentEpisodeNumber - 1)}
                    className="flex items-center gap-1 text-white/80 hover:text-white disabled:opacity-50 disabled:hover:text-white/80"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="text-sm">Prev</span>
                  </button>

                  <button
                    onClick={() => handleNextEpisode()}
                    disabled={!episodes.find(ep => ep.number === currentEpisodeNumber + 1)}
                    className="flex items-center gap-1 text-white/80 hover:text-white disabled:opacity-50 disabled:hover:text-white/80"
                  >
                    <span className="text-sm">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowShortcuts(!showShortcuts)}
                    className="flex items-center gap-1.5 text-white/80 hover:text-white"
                  >
                    <Keyboard className="h-5 w-5" />
                    <span className="text-sm">Shortcuts</span>
                  </button>

                  <button
                    onClick={() => setLightsOff(!lightsOff)}
                    className={cn(
                      "flex items-center gap-1.5",
                      lightsOff ? "text-white" : "text-white/80 hover:text-white"
                    )}
                  >
                    <Lightbulb className="h-5 w-5" />
                    <span className="text-sm">Lights Off</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Episode List Sidebar */}
          <div className="w-[350px] bg-[#141414] rounded-lg border border-white/[0.08]">
            <div className="p-4 border-b border-white/[0.08]">
              <div className="flex items-center justify-between mb-3">
                <select 
                  value={`EPS ${(episodePage - 1) * episodesPerPage + 1}-${Math.min(episodePage * episodesPerPage, episodes.length)}`}
                  onChange={(e) => {
                    const range = e.target.value;
                    const start = parseInt(range.split('-')[0].replace('EPS ', ''));
                    const newPage = Math.ceil(start / episodesPerPage);
                    setEpisodePage(newPage);
                  }}
                  className="bg-[#1a1a1a] text-white/90 text-sm rounded px-3 py-1.5 border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-white/20"
                >
                  {Array.from({ length: Math.ceil(episodes.length / episodesPerPage) }, (_, i) => {
                    const start = i * episodesPerPage + 1;
                    const end = Math.min((i + 1) * episodesPerPage, episodes.length);
                    return (
                      <option key={i} value={`EPS ${start}-${end}`}>
                        EPS {start}-{end}
                      </option>
                    );
                  })}
                </select>
                <Input
                  type="search"
                  placeholder="Search episodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[140px] h-8 bg-[#1a1a1a] border-white/[0.08] text-sm"
                />
              </div>
              
              {/* Grid View Toggle */}
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-white/60">View Mode:</div>
                <div className="flex items-center gap-1 bg-[#1a1a1a] rounded p-1">
                  <button
                    onClick={() => handleGridViewModeChange("thumbnail")}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      gridViewMode === "thumbnail" ? "bg-white/10" : "hover:bg-white/5"
                    )}
                    title="Thumbnail View"
                  >
                    <ImageIcon className="h-4 w-4 text-white/80" />
                  </button>
                  <button
                    onClick={() => handleGridViewModeChange("box")}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      gridViewMode === "box" ? "bg-white/10" : "hover:bg-white/5"
                    )}
                    title="Box View"
                  >
                    <Grid className="h-4 w-4 text-white/80" />
                  </button>
                  <button
                    onClick={() => handleGridViewModeChange("horizontal")}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      gridViewMode === "horizontal" ? "bg-white/10" : "hover:bg-white/5"
                    )}
                    title="List View"
                  >
                    <ListIcon className="h-4 w-4 text-white/80" />
                  </button>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[calc(5*88px)]">
              <div className="p-2">
                {/* Thumbnail View */}
                {gridViewMode === "thumbnail" && (
                  <div className="grid grid-cols-1 gap-2">
                    {paginatedEpisodes.map((episode) => {
                const episodeNumber = episode.episodeId.split('?ep=')[1];
                  const isCurrentEpisode = currentEpisodeId === episodeNumber;
                
                return (
                  <button
                    key={episode.episodeId}
                    onClick={() => handleEpisodeChange(episodeNumber)}
                      className={cn(
                        "group w-full p-2 flex gap-3 rounded transition-colors h-[80px]",
                        isCurrentEpisode 
                          ? "bg-red-500/10" 
                          : "hover:bg-white/[0.02]"
                      )}
                    >
                      <div className="relative w-[120px] aspect-video rounded overflow-hidden bg-black/20">
                        <img 
                          src={animeInfo.info.img} 
                          alt={`Episode ${episode.number}`}
                          className="w-full h-full object-cover"
                        />
                        {isCurrentEpisode && (
                          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                      )}
                    </div>

                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-sm font-medium",
                            isCurrentEpisode ? "text-red-500" : "text-white/90"
                          )}>
                        Episode {episode.number}
                          </span>
                          {episode.isFiller && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/40">
                              FILLER
                            </span>
                          )}
                        </div>
                        {episode.title && (
                          <p className="text-xs text-white/60 line-clamp-2">
                            {episode.title}
                          </p>
                        )}
                    </div>
                  </button>
                  );
              })}
                  </div>
                )}

                {/* Box View */}
                {gridViewMode === "box" && (
                  <div className="grid grid-cols-4 gap-2">
                    {paginatedEpisodes.map((episode) => {
                      const episodeNumber = episode.episodeId.split('?ep=')[1];
                      const isCurrentEpisode = currentEpisodeId === episodeNumber;
                    
                      return (
                        <button
                          key={episode.episodeId}
                          onClick={() => handleEpisodeChange(episodeNumber)}
                          className={cn(
                            "aspect-square flex flex-col items-center justify-center rounded transition-colors p-2",
                            isCurrentEpisode 
                              ? "bg-red-500/10" 
                              : "hover:bg-white/[0.02]"
                          )}
                        >
                          <div className="text-lg font-medium mb-1">
                            {episode.number}
                          </div>
                          {episode.isFiller && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/40">
                              FILLER
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Horizontal List View */}
                {gridViewMode === "horizontal" && (
                  <div className="flex flex-col gap-1">
                    {paginatedEpisodes.map((episode) => {
                      const episodeNumber = episode.episodeId.split('?ep=')[1];
                      const isCurrentEpisode = currentEpisodeId === episodeNumber;
                    
                      return (
                        <button
                          key={episode.episodeId}
                          onClick={() => handleEpisodeChange(episodeNumber)}
                          className={cn(
                            "w-full p-2 flex items-center gap-2 rounded transition-colors",
                            isCurrentEpisode 
                              ? "bg-red-500/10" 
                              : "hover:bg-white/[0.02]"
                          )}
                        >
                          <span className={cn(
                            "text-sm font-medium min-w-[40px]",
                            isCurrentEpisode ? "text-red-500" : "text-white/90"
                          )}>
                            {episode.number}
                          </span>
                          <div className="flex-1 min-w-0 text-left">
                            {episode.title ? (
                              <p className="text-xs text-white/60 truncate">
                                {episode.title}
                              </p>
                            ) : (
                              <p className="text-xs text-white/60 truncate">
                                Episode {episode.number}
                              </p>
                            )}
                          </div>
                          {episode.isFiller && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/40">
                              FILLER
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <button
                      onClick={() => handleEpisodePageChange(episodePage - 1)}
                      disabled={episodePage === 1}
                      className={cn(
                        "p-1 rounded transition-colors",
                        episodePage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"
                      )}
                    >
                      <ChevronLeft className="h-4 w-4 text-white/80" />
                    </button>
                    <span className="text-xs text-white/60">
                      Page {episodePage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handleEpisodePageChange(episodePage + 1)}
                      disabled={episodePage === totalPages}
                      className={cn(
                        "p-1 rounded transition-colors",
                        episodePage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"
                      )}
                    >
                      <ChevronRight className="h-4 w-4 text-white/80" />
                    </button>
                  </div>
                )}
            </div>
            </ScrollArea>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="mt-4 bg-[#141414] rounded-lg border border-white/[0.08] p-4">
          <div className="flex gap-6">
            {/* Left Side - Title and Description */}
            <div className="flex-1">
              <h1 className="text-xl font-medium mb-2">
                {animeInfo.info.name}
              </h1>
              <p className="text-sm text-white/60 line-clamp-2">
                {animeInfo.info.description}
              </p>
            </div>

            {/* Right Side - Server Selection */}
            <div className="w-[300px] space-y-4">
              {/* Audio Selection */}
              <div className="space-y-2">
                <Label className="text-sm text-white/60">Audio</Label>
                <div className="grid grid-cols-3 gap-1">
                  {availableCategories.includes("raw") && (
                    <button
                      onClick={() => setCategory("raw")}
                      className={cn(
                        "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                        category === "raw" ? "bg-red-500" : "bg-white/5 hover:bg-white/10"
                      )}
                    >
                      RAW
                    </button>
                  )}
                  {availableCategories.includes("sub") && (
                  <button
                    onClick={() => setCategory("sub")}
                    className={cn(
                      "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      category === "sub" ? "bg-red-500" : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    SUB
                  </button>
                  )}
                  {availableCategories.includes("dub") && (
                  <button
                    onClick={() => setCategory("dub")}
                    className={cn(
                      "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      category === "dub" ? "bg-red-500" : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    DUB
                  </button>
                  )}
                </div>
              </div>

              {/* Server Selection */}
              <div className="space-y-2">
                <Label className="text-sm text-white/60">Server</Label>
                <div className="grid grid-cols-1 gap-1">
                  <button
                    onClick={() => setServer("vidcloud")}
                    className={cn(
                      "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      server === "vidcloud" ? "bg-red-500" : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    VIDCLOUD
                  </button>
                  <button
                    onClick={() => setServer("vidstreaming")}
                    className={cn(
                      "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      server === "vidstreaming" ? "bg-red-500" : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    VIDSTREAMING
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Info Details Box */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          {/* Anime Details Box */}
          <div className="col-span-3 bg-[#141414] rounded-lg border border-white/[0.08] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white/80">Anime Details</h3>
              <Link 
                href={`/info/${id}`}
                className="text-xs text-white/60 hover:text-white/90 transition-colors flex items-center gap-1"
              >
                <span>View Full Info</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-4">
              {/* Anime Image, Title and Description */}
              <div className="flex gap-4">
                <Link href={`/info/${id}`} className="relative w-32 h-44 rounded overflow-hidden hover:opacity-90 transition-opacity">
                  <Image 
                    src={animeInfo?.info?.img || "/placeholder.svg"} 
                    alt={animeInfo?.info?.name || "Anime"}
                    fill
                    className="object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/info/${id}`}>
                    <h4 className="text-lg font-medium text-white/90 mb-2 line-clamp-1 hover:text-white transition-colors">
                      {animeInfo?.info?.name || "Unknown Anime"}
                    </h4>
                  </Link>
                  <p className="text-sm text-white/60 line-clamp-3">
                    {animeInfo?.info?.description || "No description available"}
                  </p>
                  
                  {/* Add MAL buttons */}
                  <div className="flex sm:mt-0 mt-2 items-center gap-2">
                    <AnimeFavoriteButton
                      animeId={id as string}
                      anilistId={animeInfo?.info?.anilistId}
                      title={animeInfo?.info?.name || ""}
                      image={animeInfo?.info?.img || ""}
                      type={animeInfo?.info?.type}
                      className="mr-1"
                    />
                    
                    <AnimeMALButton
                      animeId={id as string}
                      malId={animeInfo?.info?.malId?.toString()}
                      title={animeInfo?.info?.name || ""}
                      image={animeInfo?.info?.img || ""}
                      type="TV"
                      variant="icon"
                    />
                    
                    <AnimeMALStatus
                      animeId={id as string}
                      malId={animeInfo?.info?.malId?.toString()}
                      title={animeInfo?.info?.name || ""}
                      compact={true}
                      showLabel={false}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-white/60">Basic Info</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">Type:</span>
                    <span className="text-sm text-white/90">{animeInfo?.info?.type || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">Duration:</span>
                    <span className="text-sm text-white/90">{animeInfo?.info?.duration || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">Episodes:</span>
                    <span className="text-sm text-white/90">{animeInfo?.info?.eps || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">Status:</span>
                    <span className="text-sm text-white/90">{animeInfo?.otherInfo?.status || "Unknown"}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-white/60">Genres</h4>
                <div className="flex flex-wrap gap-1.5">
                  {animeInfo?.otherInfo?.genres?.map((genre, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/80"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-white/60">Audio</h4>
                <div className="flex gap-1.5">
                  {animeInfo?.info?.sub && (
                    <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300">
                      SUB
                    </span>
                  )}
                  {animeInfo?.info?.dub && (
                    <span className="px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-300">
                      DUB
                    </span>
                  )}
                  {animeInfo?.info?.raw && (
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-300">
                      RAW
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Recommended Anime Box */}
          <div className="col-span-1 bg-[#141414] rounded-lg border border-white/[0.08] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white/80">Recommended Anime</h3>
              <Link 
                href={`/info/${id}?tab=recommended`}
                className="text-xs text-white/60 hover:text-white/90 transition-colors flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {recommendedAnime.length > 0 ? (
                recommendedAnime.slice(0, 4).map((rec, index) => (
                  <Link 
                    key={index} 
                    href={`/watch/${rec.id}`}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 transition-colors group"
                  >
                    <div className="relative w-12 h-16 rounded overflow-hidden">
                      <Image 
                        src={rec.img} 
                        alt={rec.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">{rec.name}</h4>
                      <p className="text-xs text-white/60 truncate">{rec.type}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors" />
                  </Link>
                ))
              ) : (
                <p className="text-sm text-white/60 text-center py-4">No recommendations available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
