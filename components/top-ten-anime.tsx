"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Medal, Star, CalendarDays, TrendingUp, Trophy, Clock, ArrowUp } from "lucide-react"

type AnimeItem = {
  id: string
  img: string
  name: string
  type?: string
  rank?: number
  sub?: number
  dub?: number
  eps?: number
  score?: number
  views?: number
  releaseDate?: string
}

export default function TopTenAnime() {
  const [topAnime, setTopAnime] = useState<AnimeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("today")
  const [hover, setHover] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopAnime = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://aninew-seven.vercel.app/top-10")
        if (!response.ok) {
          throw new Error("Failed to fetch top anime")
        }
        const data = await response.json()

        // Handle the API response format which has "today", "week", "month" keys
        if (data && data[period] && Array.isArray(data[period])) {
          // Enhance data with mock scores, views, and release dates
          const enhancedData = data[period].map((anime: AnimeItem, index: number) => ({
            ...anime,
            rank: anime.rank || index + 1,
            score: anime.score || (Math.floor(Math.random() * 20) + 70) / 10, // Random score between 7.0 and 9.0
            views: anime.views || Math.floor(Math.random() * 90000) + 10000, // Random views between 10K and 100K
            releaseDate: anime.releaseDate || `${new Date().getFullYear()}`
          }))
          setTopAnime(enhancedData)
        } else {
          setTopAnime([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setTopAnime([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopAnime()
  }, [period])

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500' // Gold
    if (rank === 2) return 'bg-gray-300' // Silver
    if (rank === 3) return 'bg-amber-700' // Bronze
    return 'bg-gray-800'
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 rounded-xl bg-gradient-to-r from-gray-900/50 via-gray-800/30 to-gray-900/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 from-gray-100/50 via-gray-200/30 to-gray-100/50 backdrop-blur-sm transition-colors duration-300">
        <div className="mb-2 h-8 w-40 animate-pulse rounded bg-gray-800 dark:bg-gray-800 bg-gray-300"></div>
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex h-16 animate-pulse gap-2 rounded-lg bg-gray-800 dark:bg-gray-800 bg-gray-300"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error || topAnime.length === 0) {
    return (
      <div className="p-4 md:p-6 rounded-xl bg-gradient-to-r from-gray-100/50 via-gray-200/30 to-gray-100/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 backdrop-blur-sm transition-colors duration-300">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white transition-colors duration-300">TOP 10 ANIME</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Failed to load top anime</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 h-full rounded-xl bg-gradient-to-r from-gray-100/50 via-gray-200/30 to-gray-100/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 backdrop-blur-sm transition-colors duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white transition-colors duration-300">TOP 10 ANIME</h2>
      </div>
      
      <Tabs defaultValue="today" value={period} onValueChange={setPeriod} className="h-full">
        <TabsList className="mb-4 bg-gray-900 dark:bg-gray-900 bg-gray-100 w-full justify-between transition-colors duration-300">
          <TabsTrigger value="today" className="flex-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">TODAY</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="week" className="flex-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">
            <div className="flex items-center justify-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs">WEEK</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="month" className="flex-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">MONTH</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        {["today", "week", "month"].map((periodKey) => (
          <TabsContent 
            key={periodKey}
            value={periodKey} 
            className="mt-0 h-[calc(100%-60px)] overflow-y-auto pr-1 scrollbar-cool"
          >
            <div className="grid gap-2">
              {topAnime.slice(0, 10).map((anime, index) => (
                <Link
                  key={anime.id}
                  href={`/info/${anime.id}`}
                  className="group relative flex items-center gap-3 rounded-lg p-2 transition-all duration-300 hover:bg-gray-800 dark:hover:bg-gray-800 hover:bg-gray-200 hover:shadow-lg hover:shadow-red-500/5"
                  onMouseEnter={() => setHover(anime.id)}
                  onMouseLeave={() => setHover(null)}
                >
                  {/* Rank */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-white ${getRankColor(anime.rank || index + 1)}`}>
                    {anime.rank || index + 1}
                    {anime.rank === 1 && <Medal className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />}
                  </div>
                  
                  {/* Anime Image */}
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={anime.img || "/placeholder.svg?height=150&width=100"}
                      alt={anime.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                  </div>
                  
                  {/* Anime details */}
                  <div className="flex-1 min-w-0 transition-colors duration-300 group-hover:text-red-400">
                    <h3 className="font-medium text-black dark:text-white text-sm line-clamp-1 transition-colors duration-300 group-hover:text-red-400">
                      {anime.name}
                    </h3>
                    
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      <span className="rounded bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] group-hover:bg-gray-300 dark:group-hover:bg-gray-700 transition-colors duration-300">
                        {anime.type || "TV"}
                      </span>
                      
                      {anime.score && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" fill="currentColor" />
                          <span>{anime.score.toFixed(1)}</span>
                        </div>
                      )}
                      
                      {anime.releaseDate && (
                        <span>{anime.releaseDate}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Views count with animation on hover */}
                  {anime.views && (
                    <div className={`flex items-center gap-0.5 text-xs transition-all duration-300 ${
                      hover === anime.id ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      <ArrowUp className={`h-3 w-3 transition-transform duration-300 ${
                        hover === anime.id ? 'text-green-400 translate-y-[-2px]' : 'text-gray-400'
                      }`} />
                      <span>{formatViews(anime.views)}</span>
                    </div>
                  )}
                  
                  {/* Ranking change indicator */}
                  {index < 5 && (
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white z-10">
                      +{index + 1}
                    </div>
                  )}
                </Link>
              ))}
            </div>
            
            {/* View all button */}
            <div className="mt-4 flex justify-center">
              <button className="rounded-full bg-gray-800 dark:bg-gray-800 bg-gray-200 px-4 py-2 text-xs font-medium text-white dark:text-white text-gray-800 transition-colors dark:hover:bg-gray-700 hover:bg-gray-300">
                View All Rankings
              </button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

