"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, ChevronRight, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

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

  const clearWatchHistory = () => {
    try {
      localStorage.removeItem("animeWatchHistory")
      setWatchedAnime([])
    } catch (error) {
      console.error("Error clearing watch history:", error)
    }
  }

  const removeFromHistory = (animeId: string) => {
    try {
      const updatedHistory = watchedAnime.filter((anime) => anime.id !== animeId)
      localStorage.setItem("animeWatchHistory", JSON.stringify(updatedHistory))
      setWatchedAnime(updatedHistory)
    } catch (error) {
      console.error("Error removing anime from history:", error)
    }
  }

  if (!isClient || watchedAnime.length === 0) {
    return null
  }

  return (
    <div className="col-span-12 xl:col-span-3 mb-6 xl:mb-0">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black dark:text-white transition-colors duration-300">
            Continue Watching
          </h2>
          <Link href="/history" className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-300">
            View All
            <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-h-[500px] overflow-y-auto scrollbar-glow pr-2">
          {watchedAnime.map((anime) => (
            <div key={anime.id} className="group relative">
              <Link
                href={`/watch/${anime.id}?ep=${anime.episodeId}`}
                className="group relative flex overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900 transition-transform hover:scale-[1.02] transition-colors duration-300"
              >
                <div className="relative h-24 w-16 shrink-0">
                  <Image src={anime.image || "/placeholder.svg"} alt={anime.title} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between p-3">
                  <div className="flex flex-col ml-2">
                    <h3 className="font-medium text-black dark:text-white line-clamp-1 transition-colors duration-300">{anime.title}</h3>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Episode {anime.episode}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-gray-300 dark:bg-gray-800 transition-colors duration-300">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${anime.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => removeFromHistory(anime.id)}
                className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-800 text-gray-600 dark:text-gray-400 opacity-0 transition-opacity hover:bg-red-600 hover:text-white dark:hover:text-white group-hover:opacity-100 transition-colors duration-300"
                aria-label={`Remove ${anime.title} from watch history`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

