"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ChevronLeft, ChevronRight, Star, Flame, TrendingUp } from "lucide-react"
import "swiper/css"
import "swiper/css/pagination"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay, Pagination } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"

type AnimeItem = {
  id: string
  img: string
  name: string
  type: string
  rating?: number
}

export default function TrendingAnime() {
  const [trendingAnime, setTrendingAnime] = useState<AnimeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")
  const swiperRef = useRef<SwiperType | null>(null)

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

  useEffect(() => {
    const fetchTrendingAnime = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://aninew-seven.vercel.app/trending")
        if (!response.ok) {
          throw new Error("Failed to fetch trending anime")
        }
        const data = await response.json()
        
        // Add mock ratings if not provided by API
        const enhancedData = Array.isArray(data) 
          ? data.map((anime, index) => ({
              ...anime,
              rating: anime.rating || (Math.floor(Math.random() * 20) + 70) / 10 // Random rating between 7.0 and 9.0
            }))
          : []
        
        setTrendingAnime(enhancedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setTrendingAnime([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingAnime()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-300 dark:bg-gray-800"></div>
        <div className="h-4 w-full md:w-96 animate-pulse rounded bg-gray-300 dark:bg-gray-800"></div>
        <div className="flex gap-4 overflow-hidden py-4">
          {[...Array(isMobile ? 2 : 5)].map((_, i) => (
            <div key={i} className="h-[280px] w-[180px] shrink-0 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-800"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error || trendingAnime.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <h2 className="mb-2 text-xl md:text-2xl font-bold text-black dark:text-white transition-colors duration-300">Trending</h2>
        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Failed to load trending anime</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 rounded-xl bg-gradient-to-r from-gray-100/50 via-gray-200/30 to-gray-100/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 backdrop-blur-sm transition-colors duration-300">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-400" />
            <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white transition-colors duration-300">Trending Now</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">The hottest anime everyone's watching</p>
        </div>
        
        {/* Custom navigation buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{activeIndex + 1}/{trendingAnime.length}</span>
          <div className="hidden md:flex gap-2">
            <button 
              onClick={handlePrev} 
              className="h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors duration-300"
            >
              <ChevronLeft className="h-5 w-5 text-gray-800 dark:text-white transition-colors duration-300" />
            </button>
            <button 
              onClick={handleNext} 
              className="h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors duration-300"
            >
              <ChevronRight className="h-5 w-5 text-gray-800 dark:text-white transition-colors duration-300" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          slidesPerView={isMobile ? 2 : isTablet ? 4 : 6}
          spaceBetween={16}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            el: '.trending-pagination',
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={false}
          modules={[Navigation, Autoplay, Pagination]}
          className="trending-swiper scrollbar-thin"
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {trendingAnime.map((anime, index) => (
            <SwiperSlide key={anime.id}>
              <Link
                href={`/info/${anime.id}`}
                className="group/card relative flex flex-col overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl w-full"
              >
                {/* Rank badge */}
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  <TrendingUp className="h-3 w-3 text-gray-400" />
                  <span>#{index + 1}</span>
                </div>
                
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                  <Image
                    src={anime.img || "/placeholder.svg?height=300&width=200"}
                    alt={anime.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  />
                  
                  {/* Overlay and details on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-4 opacity-0 transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-black dark:text-white bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded transition-colors duration-300">
                        {anime.type}
                      </span>
                      
                      {anime.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
                          <span className="text-xs font-bold text-black dark:text-white transition-colors duration-300">{anime.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center justify-center">
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-black dark:text-white backdrop-blur-sm transition-colors duration-300">
                        View Details
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 transition-colors duration-300">
                  <h3 className="font-medium text-black dark:text-white line-clamp-2 transition-colors duration-300">
                    {anime.name}
                  </h3>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Custom pagination */}
        <div className="trending-pagination mt-4 flex justify-center"></div>
      </div>
    </div>
  )
}

