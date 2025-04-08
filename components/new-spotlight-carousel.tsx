"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Info, Play, Tv, Clock, Calendar, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"

// Import necessary CSS for Swiper
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-fade"

// Define gradient colors for different slides
const gradients = [
  "from-red-600 to-purple-600",
  "from-blue-600 to-teal-600",
  "from-orange-600 to-pink-600",
  "from-green-600 to-blue-600",
  "from-purple-600 to-indigo-600"
];

type SpotlightAnime = {
  id: string
  name: string
  jname: string
  description: string
  img: string
  type: string
  duration: string
  releaseDate?: string
  rank?: number
  episodeCount?: number
  status?: string
  score?: number
}

export default function SpotlightCarousel() {
  const [spotlightAnimes, setSpotlightAnimes] = useState<SpotlightAnime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [language, setLanguage] = useState<"EN" | "JP">("EN")
  const swiperRef = useRef<SwiperType | null>(null)

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage?.getItem("preferredLanguage")
    if (savedLanguage === "JP" || savedLanguage === "EN") {
      setLanguage(savedLanguage)
    }
  }, [])

  // Listen for language change events
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<"EN" | "JP">) => {
      setLanguage(event.detail)
    }

    window.addEventListener('languageChange', handleLanguageChange as EventListener)

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener)
    }
  }, [])

  useEffect(() => {
    const fetchSpotlightAnimes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://aninew-seven.vercel.app/spotlight")
        if (!response.ok) {
          throw new Error("Failed to fetch spotlight anime")
        }
        const data = await response.json()
        
        // Enhance anime data with more information
        const enhancedData = Array.isArray(data) ? await Promise.all(
          data.map(async (anime) => {
            try {
              // Try to fetch additional details for each anime
              const detailsResponse = await fetch(`https://aninew-seven.vercel.app/meta/info/${anime.id}`)
              if (detailsResponse.ok) {
                const details = await detailsResponse.json()
                return {
                  ...anime,
                  episodeCount: details.totalEpisodes || "Unknown",
                  status: details.status || "Ongoing",
                  score: details.score || anime.rank || 7.5,
                }
              }
            } catch (e) {
              // If details fetch fails, return original anime data
              console.error(`Failed to fetch details for ${anime.name}:`, e)
            }
            return anime
          })
        ) : []
        
        setSpotlightAnimes(enhancedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setSpotlightAnimes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpotlightAnimes()
  }, [])

  // Handle swiper navigation
  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev()
    }
  }

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext()
    }
  }

  if (isLoading) {
    return (
      <div className="relative h-[500px] w-full animate-pulse bg-gray-800">
        <div className="absolute bottom-16 left-8 space-y-2">
          <div className="h-8 w-64 rounded bg-gray-700"></div>
          <div className="h-4 w-96 rounded bg-gray-700"></div>
        </div>
      </div>
    )
  }

  if (error || spotlightAnimes.length === 0) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center bg-gray-900">
        <p className="text-lg text-gray-400">Failed to load spotlight anime</p>
      </div>
    )
  }

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-xl scrollbar-hide">
      {/* Blur background for extra depth */}
      <div className="absolute -inset-5 z-0 opacity-50 blur-xl">
        {spotlightAnimes[activeIndex] && (
          <Image
            src={spotlightAnimes[activeIndex].img || "/placeholder.svg"}
            alt="Background"
            fill
            className="object-cover"
          />
        )}
      </div>
      
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        spaceBetween={0}
        centeredSlides={true}
        effect="fade"
        fadeEffect={{
          crossFade: true
        }}
        speed={800}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          el: '.spotlight-pagination',
          renderBullet: function (index, className) {
            return `<span class="${className} w-2 h-2 bg-gray-500 inline-block rounded-full mx-2 transition-all duration-300 ease-in-out ${index === (this as any).realIndex ? "bg-white w-6" : ""}" style="box-shadow: 0 0 5px rgba(255,255,255,0.5);"></span>`;
          },
        }}
        navigation={false} // We'll use custom navigation
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        className="h-full w-full rounded-xl"
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
      >
        {spotlightAnimes.map((anime, index) => (
          <SwiperSlide key={anime.id} className="relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 z-0">
              <Image
                src={anime.img || "/placeholder.svg?height=500&width=1200"}
                alt={anime.name}
                fill
                className="object-cover transform transition-transform duration-[15000ms] ease-linear hover:scale-110"
                priority
              />
              {/* Enhanced gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90"></div>
              
              {/* Animated particle overlay */}
              <div className="absolute inset-0 z-1 bg-[url('/noise.svg')] opacity-5 mix-blend-overlay"></div>
            </div>

            {/* Extra details box */}
            <div className="absolute top-14 right-8 z-10 flex items-center space-x-4">
              {anime.score && (
                <div className="flex items-center gap-1 rounded-full bg-yellow-500/80 px-3 py-1 backdrop-blur-sm">
                  <Star className="h-4 w-4 text-white" fill="white" />
                  <span className="text-sm font-bold text-white">{anime.score.toFixed(1)}</span>
                </div>
              )}
              {anime.status && (
                <div className="rounded-full bg-green-500/80 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                  {anime.status}
                </div>
              )}
            </div>

            {/* Bottom left content */}
            <div className="absolute bottom-16 left-8 z-10 max-w-3xl">
              <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-white">
                <div className="flex items-center gap-1">
                  <Tv className="h-4 w-4 text-red-500" />
                  <span>{anime.type || "TV"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="rounded-md bg-red-500 px-2 py-0.5 text-xs font-medium">
                    {anime.episodeCount ? `${anime.episodeCount} EP` : "NEW"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-300" />
                  <span className="text-gray-300">{anime.duration}</span>
                </div>
                {anime.releaseDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-300" />
                    <span className="text-gray-300">{anime.releaseDate}</span>
                  </div>
                )}
              </div>
              
              {/* Animated subtitle */}
              <div className="mb-1 animate-fade-in opacity-80">
                <span className="text-sm font-medium text-red-400">#{index + 1} SPOTLIGHT</span>
                {language === "JP" && anime.jname && 
                  <span className="ml-2 text-sm text-gray-400">{anime.jname}</span>
                }
                {language === "EN" && anime.jname && 
                  <span className="ml-2 text-sm text-gray-400">{anime.jname}</span>
                }
              </div>
              
              {/* Title with gradient that changes per slide */}
              <h2 className={`mb-2 text-4xl font-bold bg-gradient-to-r ${gradients[index % gradients.length]} bg-clip-text text-transparent transition-all duration-700 drop-shadow-lg animate-slide-up`}>
                {language === "JP" && anime.jname ? anime.jname : anime.name}
              </h2>
              
              {/* Description with animated fade-in */}
              <div className="animate-fade-in-delay">
                <p className="mb-6 text-sm text-gray-300 line-clamp-3 max-w-2xl">
                  {anime.description || `Watch ${anime.name} online for free.`}
                </p>
              </div>
            </div>

            {/* Round buttons in bottom right */}
            <div className="absolute bottom-16 right-8 z-10 flex gap-3">
              <Link href={`/info/${anime.id}`} className="group">
                <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30 transition-all group-hover:bg-white/20 group-hover:scale-110">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <span className="mt-1 text-xs text-white/70 block text-center">Details</span>
              </Link>
              <Link href={`/watch/${anime.id}?ep=1`} className="group">
                <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center transition-all group-hover:bg-red-600 group-hover:scale-110">
                  <Play className="h-5 w-5 text-white" />
                </div>
                <span className="mt-1 text-xs text-white/70 block text-center">Watch</span>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20">
        <button 
          onClick={handlePrev}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20">
        <button 
          onClick={handleNext}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Premium sliding dots at bottom center */}
      <div className="spotlight-pagination absolute bottom-4 left-0 right-0 z-20 flex justify-center items-center"></div>
      
      {/* Counter indicator */}
      <div className="absolute bottom-4 right-4 z-20 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        {activeIndex + 1}/{spotlightAnimes.length}
      </div>
    </div>
  )
} 