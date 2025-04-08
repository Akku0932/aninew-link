"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Search, 
  X, 
  Filter,
  ChevronDown,
  Star,
  Clock,
  Tv,
  Film,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AnimeItem = {
  id: string
  name: string
  jname?: string
  img: string
  type: string
  duration: string
  sub: number | null
  dub: number | null
  eps: number | null
  rate: string | null
}

export default function TopAiringPage() {
  const [animes, setAnimes] = useState<AnimeItem[]>([])
  const [filteredAnimes, setFilteredAnimes] = useState<AnimeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "tv" | "movie" | "ova">("all")
  const [sortBy, setSortBy] = useState<"latest" | "name" | "score">("latest")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://aninew-seven.vercel.app/top-airing")
        if (!response.ok) {
          throw new Error("Failed to fetch top airing anime")
        }
        const data = await response.json()
        setAnimes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnimes()
  }, [])

  useEffect(() => {
    // Filter and sort animes whenever dependencies change
    let result = [...animes]
    
    // Apply filters
    if (filter !== "all") {
      result = result.filter(anime => 
        anime.type.toLowerCase().includes(filter.toLowerCase())
      )
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(anime => 
        anime.name.toLowerCase().includes(query) || 
        (anime.jname && anime.jname.toLowerCase().includes(query))
      )
    }
    
    // Apply sorting
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "score") {
      result.sort((a, b) => {
        const scoreA = a.rate ? parseFloat(a.rate) : 0
        const scoreB = b.rate ? parseFloat(b.rate) : 0
        return scoreB - scoreA
      })
    }
    // "latest" is default order from API
    
    setFilteredAnimes(result)
  }, [animes, searchQuery, filter, sortBy])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-red-500" /> 
          Top Airing Anime
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover the most popular anime currently airing
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search top airing anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-10 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex gap-2 items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            
            <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setFilter("all")} 
                className={`px-3 py-2 text-sm ${filter === "all" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter("tv")} 
                className={`px-3 py-2 text-sm ${filter === "tv" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                TV
              </button>
              <button 
                onClick={() => setFilter("movie")} 
                className={`px-3 py-2 text-sm ${filter === "movie" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                Movie
              </button>
              <button 
                onClick={() => setFilter("ova")} 
                className={`px-3 py-2 text-sm ${filter === "ova" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                OVA
              </button>
            </div>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</p>
              <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setSortBy("latest")} 
                  className={`px-3 py-1 text-sm ${sortBy === "latest" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Latest
                </button>
                <button 
                  onClick={() => setSortBy("name")} 
                  className={`px-3 py-1 text-sm ${sortBy === "name" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Name
                </button>
                <button 
                  onClick={() => setSortBy("score")} 
                  className={`px-3 py-1 text-sm ${sortBy === "score" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Score
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading 
            ? "Loading top airing anime..." 
            : `Showing ${filteredAnimes.length} of ${animes.length} anime`
          }
        </p>
      </div>

      {/* Anime Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] rounded-lg bg-gray-200 dark:bg-gray-800"></div>
              <div className="mt-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="mt-1 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-8 text-center">
          <p className="text-red-500">{error}</p>
          <Button
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredAnimes.map((anime) => (
            <Link
              key={anime.id}
              href={`/info/${anime.id}`}
              className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={anime.img}
                  alt={anime.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Type badge */}
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-md">
                  {anime.type}
                </div>
                
                {/* Language badges */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {anime.sub !== null && (
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-md">
                      SUB
                    </div>
                  )}
                  {anime.dub !== null && (
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-md">
                      DUB
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-black dark:text-white line-clamp-2 group-hover:text-red-500 transition-colors">
                  {anime.name}
                </h3>
                
                {anime.jname && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                    {anime.jname}
                  </p>
                )}
                
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{anime.duration}</span>
                  </div>
                  
                  {anime.eps && (
                    <div className="flex items-center gap-1">
                      <Tv className="h-4 w-4" />
                      <span>{anime.eps} eps</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 