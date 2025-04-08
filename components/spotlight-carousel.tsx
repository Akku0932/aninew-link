"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Info, Play, Tv, Clock } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation } from "swiper/modules"

// Import necessary CSS for Swiper
import "swiper/css/bundle"

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
}

export default function SpotlightCarousel() {
  const [spotlightAnimes, setSpotlightAnimes] = useState<SpotlightAnime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpotlightAnimes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://aninew-seven.vercel.app/spotlight")
        if (!response.ok) {
          throw new Error("Failed to fetch spotlight anime")
        }
        const data = await response.json()
        // Limit to 5 spotlight items
        setSpotlightAnimes(Array.isArray(data) ? data.slice(0, 5) : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setSpotlightAnimes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpotlightAnimes()
  }, [])

  if (isLoading) {
    return (
      <div className="relative h-[450px] w-full animate-pulse bg-gray-800">
        <div className="absolute bottom-16 left-8 space-y-2">
          <div className="h-8 w-64 rounded bg-gray-700"></div>
          <div className="h-4 w-96 rounded bg-gray-700"></div>
        </div>
      </div>
    )
  }

  if (error || spotlightAnimes.length === 0) {
    return (
      <div className="flex h-[450px] w-full items-center justify-center bg-gray-900">
        <p className="text-lg text-gray-400">Failed to load spotlight anime</p>
      </div>
    )
  }

  return (
    <div className="relative h-[450px] w-full overflow-hidden">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
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
        navigation={{
          nextEl: '.spotlight-next',
          prevEl: '.spotlight-prev',
        }}
        modules={[Autoplay, Pagination, Navigation]}
        className="h-full w-full"
      >
        {spotlightAnimes.map((anime, index) => (
          <SwiperSlide key={anime.id} className="relative">
            <div className="absolute inset-0 z-0">
              <Image
                src={anime.img || "/placeholder.svg?height=450&width=1200"}
                alt={anime.name}
                fill
                className="object-cover"
                priority
              />
              {/* Darker overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
            </div>

            {/* Navigation buttons top right */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button className="spotlight-prev h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <button className="spotlight-next h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>

            {/* Bottom left content */}
            <div className="absolute bottom-16 left-8 z-10 max-w-3xl">
              <div className="mb-2 flex items-center gap-4 text-sm text-white">
                <div className="flex items-center gap-1">
                  <Tv className="h-4 w-4 text-red-500" />
                  <span>TV</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 bg-red-500 rounded-sm text-xs font-medium">EP {index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-300" />
                  <span className="text-gray-300">{anime.duration}</span>
                </div>
              </div>
              
              {/* Title with gradient that changes per slide */}
              <h2 className={`mb-2 text-4xl font-bold bg-gradient-to-r ${gradients[index % gradients.length]} bg-clip-text text-transparent transition-all drop-shadow-lg`}>
                {anime.name}
              </h2>
              
              <p className="mb-6 text-sm text-gray-300 line-clamp-3 max-w-2xl">
                {anime.description || `Watch ${anime.name} online for free.`}
              </p>
            </div>

            {/* Round buttons in bottom right */}
            <div className="absolute bottom-16 right-8 z-10 flex gap-3">
              <Link href={`/info/${anime.id}`} className="group">
                <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30 transition-all group-hover:bg-white/20">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <span className="mt-1 text-xs text-white/70 block text-center">Details</span>
              </Link>
              <Link href={`/watch/${anime.id}?ep=1`} className="group">
                <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center transition-all group-hover:bg-red-600">
                  <Play className="h-5 w-5 text-white" />
                </div>
                <span className="mt-1 text-xs text-white/70 block text-center">Watch</span>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Premium sliding dots at bottom center */}
      <div className="spotlight-pagination absolute bottom-4 left-0 right-0 z-20 flex justify-center items-center"></div>
    </div>
  )
}

