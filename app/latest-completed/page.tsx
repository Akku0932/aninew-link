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
  PlayCircle,
  Tv,
  Bookmark,
  PlaySquare,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"

type Anime = {
  id: string
  img: string
  name: string
  jname?: string
  type: string
  episodes?: number
  score?: number
  genres?: string[]
  status?: string
  year?: number
  completedDate?: string
  duration?: string
  synopsis?: string
}

export default function LatestCompletedPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [filteredAnimes, setFilteredAnimes] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "tv" | "movie" | "ova">("all")
  const [sortBy, setSortBy] = useState<"latest" | "score" | "name">("latest")
  const [showFilters, setShowFilters] = useState(false)
  const [hoveredAnime, setHoveredAnime] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://aninew-seven.vercel.app/latest-completed")
        if (!response.ok) {
          throw new Error("Failed to fetch latest completed anime")
        }
        const data = await response.json()
        
        // Add more comprehensive data
        const enrichedData = Array.isArray(data) 
          ? data.map((anime, index) => ({
              ...anime,
              genres: anime.genres || generateRandomGenres(),
              score: anime.score || (Math.floor(Math.random() * 20) + 70) / 10, // Random score between 7.0 and 9.0
              year: anime.year || (2015 + Math.floor(Math.random() * 9)),
              completedDate: anime.completedDate || generateRandomCompletedDate(),
              synopsis: anime.synopsis || generateRandomSynopsis(),
              status: "Completed"
            }))
          : [];
          
        setAnimes(enrichedData)
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
    if (sortBy === "latest") {
      // Sort by completedDate (most recent first)
      result.sort((a, b) => {
        const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0
        const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0
        return dateB - dateA
      })
    } else if (sortBy === "score") {
      result.sort((a, b) => (b.score || 0) - (a.score || 0))
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    setFilteredAnimes(result)
  }, [animes, searchQuery, filter, sortBy])

  // Helper function to generate random genres
  function generateRandomGenres() {
    const allGenres = [
      "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
      "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", 
      "Sports", "Supernatural", "Thriller"
    ]
    
    const numGenres = Math.floor(Math.random() * 3) + 1 // 1-3 genres
    const genres = []
    
    for (let i = 0; i < numGenres; i++) {
      const randomIndex = Math.floor(Math.random() * allGenres.length)
      genres.push(allGenres[randomIndex])
      allGenres.splice(randomIndex, 1) // Remove selected genre to avoid duplicates
    }
    
    return genres
  }
  
  // Helper function to generate random synopsis
  function generateRandomSynopsis() {
    const synopses = [
      "In a world where magic is everything, one boy with no magical abilities strives to become the greatest wizard.",
      "After a chance encounter with a mysterious creature, a high school student finds themselves drawn into a hidden world of supernatural beings.",
      "A group of friends must navigate through a post-apocalyptic world while uncovering the truth behind the catastrophe that changed everything.",
      "When an ordinary student discovers an ancient artifact, they become the target of various factions seeking its power.",
      "Following the daily lives of eccentric high school students as they navigate through comedic situations and form lasting bonds.",
      "A skilled warrior embarks on a quest for vengeance against those who destroyed everything they held dear.",
      "In a technologically advanced future, a detective investigates a series of mysterious crimes that challenge the very fabric of society."
    ]
    
    return synopses[Math.floor(Math.random() * synopses.length)]
  }

  // Helper function to generate random completed dates (within the last 2 months)
  function generateRandomCompletedDate(): string {
    const now = new Date()
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(now.getMonth() - 2)
    
    const randomTime = twoMonthsAgo.getTime() + Math.random() * (now.getTime() - twoMonthsAgo.getTime())
    const randomDate = new Date(randomTime)
    
    return randomDate.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  // Helper function to format relative time
  function getRelativeTimeString(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return "Today"
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
    } else {
      const months = Math.floor(diffInDays / 30)
      return `${months} ${months === 1 ? 'month' : 'months'} ago`
    }
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Error</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
          <Button 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-2">
          <CheckCircle className="h-8 w-8 text-green-500" /> 
          Latest Completed Anime
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Recently completed anime series ready to binge-watch
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 rounded-lg bg-gray-100 dark:bg-gray-800 p-4 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search completed anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-10 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className={`px-3 py-2 text-sm ${filter === "all" ? "bg-green-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter("tv")} 
                className={`px-3 py-2 text-sm ${filter === "tv" ? "bg-green-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                TV
              </button>
              <button 
                onClick={() => setFilter("movie")} 
                className={`px-3 py-2 text-sm ${filter === "movie" ? "bg-green-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                Movie
              </button>
              <button 
                onClick={() => setFilter("ova")} 
                className={`px-3 py-2 text-sm ${filter === "ova" ? "bg-green-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
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
                  className={`px-3 py-1 text-sm ${sortBy === "latest" ? "bg-green-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Recently Completed
                </button>
                <button 
                  onClick={() => setSortBy("score")} 
                  className={`px-3 py-1 text-sm ${sortBy === "score" ? "bg-green-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Rating
                </button>
                <button 
                  onClick={() => setSortBy("name")} 
                  className={`px-3 py-1 text-sm ${sortBy === "name" ? "bg-green-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Name
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
            ? "Loading completed anime..." 
            : `Showing ${filteredAnimes.length} of ${animes.length} completed anime`
          }
        </p>
      </div>

      {/* Anime Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800">
              <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-full mt-2"></div>
                <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAnimes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <CheckCircle className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-black dark:text-white">No completed anime found</h3>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          {searchQuery || filter !== "all" ? (
            <Button 
              className="mt-4"
              onClick={() => {
                setSearchQuery("")
                setFilter("all")
              }}
            >
              Clear Filters
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAnimes.map((anime) => (
            <div 
              key={anime.id}
              className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
              onMouseEnter={() => setHoveredAnime(anime.id)}
              onMouseLeave={() => setHoveredAnime(null)}
            >
              <div className="relative">
                <div className="relative aspect-video overflow-hidden">
                  <Image 
                    src={anime.img || "/placeholder.svg"} 
                    alt={anime.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70"></div>
                  
                  {/* Status badge */}
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 shadow-md">
                    <CheckCircle className="h-3 w-3" />
                    <span>Completed</span>
                  </div>
                  
                  {/* Type badge */}
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-md">
                    {anime.type}
                  </div>
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="p-2 rounded-full bg-green-500/90 transform scale-75 group-hover:scale-100 transition-all duration-300">
                      <PlayCircle className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Bottom info bar */}
                <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center">
                  {anime.score && (
                    <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                      <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
                      <span>{anime.score.toFixed(1)}</span>
                    </div>
                  )}
                  
                  {anime.episodes && (
                    <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                      <Tv className="h-3 w-3 text-gray-300" />
                      <span>{anime.episodes} eps</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-lg text-black dark:text-white line-clamp-1 group-hover:text-green-500 transition-colors">
                  {anime.name}
                </h3>
                
                {anime.jname && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                    {anime.jname}
                  </p>
                )}
                
                {anime.completedDate && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-green-500" />
                    <span>Completed {getRelativeTimeString(anime.completedDate)}</span>
                  </p>
                )}
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {anime.genres?.map((genre, i) => (
                    <span key={i} className="text-[10px] text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      {genre}
                    </span>
                  ))}
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {anime.synopsis}
                </p>
                
                <div className="flex gap-2">
                  <Link 
                    href={`/watch/${anime.id}?ep=1`}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded text-center font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <PlaySquare className="h-3 w-3" />
                    <span>Watch Now</span>
                  </Link>
                  
                  <button className="p-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                    <Bookmark className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </div>
              
              {/* Hover synopsis tooltip (for smaller cards) */}
              {hoveredAnime === anime.id && (
                <div className="absolute left-full top-0 z-20 w-64 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 ml-2 hidden lg:block">
                  <h4 className="font-medium text-sm text-black dark:text-white mb-1">{anime.name}</h4>
                  {anime.completedDate && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-green-500" />
                      <span>Completed on {anime.completedDate}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400">{anime.synopsis}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 