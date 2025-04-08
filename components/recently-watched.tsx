"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

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

export default function RecentlyWatched() {
  const [watchedAnime, setWatchedAnime] = useState<WatchedAnime[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    loadWatchHistory()

    // Listen for storage events to update the component when watch history changes
    const handleStorageChange = () => {
      loadWatchHistory()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const loadWatchHistory = () => {
    try {
      const savedHistory = localStorage.getItem("animeWatchHistory")
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory) as WatchedAnime[]
        // Sort by most recently watched
        const sortedHistory = parsedHistory.sort((a, b) => b.timestamp - a.timestamp)
        setWatchedAnime(sortedHistory)
      }
    } catch (error) {
      console.error("Error loading watch history:", error)
    }
  }

  if (!isClient || watchedAnime.length === 0) {
    return null
  }

  return (
    <section className="mb-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recently Watched</h2>
          <Link href="/history" className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {watchedAnime.slice(0, 7).map((anime) => (
            <Link
              key={anime.id}
              href={`/watch/${anime.id}?ep=${anime.episodeId}`}
              className="group relative block"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-900">
                <Image 
                  src={anime.image || "/placeholder.svg"} 
                  alt={anime.title} 
                  fill 
                  className="object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-sm font-medium text-white line-clamp-1 mb-1">{anime.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">EP {anime.episode}</span>
                    <div className="h-1 w-14 overflow-hidden rounded-full bg-gray-700">
                      <div className="h-full rounded-full bg-red-500" 
                           style={{ width: `${anime.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

