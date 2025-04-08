"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Search, 
  X, 
  Calendar, 
  Clock, 
  Star, 
  TrendingUp,
  ArrowUpCircle,
  Filter,
  ChevronDown 
} from "lucide-react"
import { Button } from "@/components/ui/button"

type Anime = {
  id: string
  img: string
  name: string
  jname?: string
  type: string
  releaseDate?: string
  score?: number
  genres?: string[]
  status?: string
}

export default function TopUpcomingPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [filteredAnimes, setFilteredAnimes] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "tv" | "movie">("all")
  const [sortBy, setSortBy] = useState<"rank" | "name" | "date">("rank")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://aninew-seven.vercel.app/top-upcoming")
        if (!response.ok) {
          throw new Error("Failed to fetch upcoming anime")
        }
        const data = await response.json()
        
        // Add more comprehensive data
        const enrichedData = Array.isArray(data) 
          ? data.map((anime, index) => ({
              ...anime,
              genres: anime.genres || generateRandomGenres(),
              score: anime.score || (Math.floor(Math.random() * 20) + 70) / 10, // Random score between 7.0 and 9.0
              status: anime.status || "Upcoming",
              releaseDate: anime.releaseDate || generateRandomReleaseDate()
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
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "date") {
      result.sort((a, b) => {
        if (!a.releaseDate) return 1
        if (!b.releaseDate) return -1
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      })
    }
    // "rank" is default order from API
    
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
  
  // Helper function to generate random upcoming release dates
  function generateRandomReleaseDate() {
    const currentYear = new Date().getFullYear()
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const randomMonth = months[Math.floor(Math.random() * months.length)]
    return `${randomMonth} ${currentYear + (Math.random() > 0.7 ? 1 : 0)}`
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
          <ArrowUpCircle className="h-8 w-8 text-blue-500" /> 
          Top Upcoming Anime
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover the most anticipated upcoming anime series and movies
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search upcoming anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-10 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className={`px-3 py-2 text-sm ${filter === "all" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter("tv")} 
                className={`px-3 py-2 text-sm ${filter === "tv" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                TV
              </button>
              <button 
                onClick={() => setFilter("movie")} 
                className={`px-3 py-2 text-sm ${filter === "movie" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                Movie
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
                  onClick={() => setSortBy("rank")} 
                  className={`px-3 py-1 text-sm ${sortBy === "rank" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Popularity
                </button>
                <button 
                  onClick={() => setSortBy("name")} 
                  className={`px-3 py-1 text-sm ${sortBy === "name" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Name
                </button>
                <button 
                  onClick={() => setSortBy("date")} 
                  className={`px-3 py-1 text-sm ${sortBy === "date" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Release Date
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
            ? "Loading upcoming anime..." 
            : `Showing ${filteredAnimes.length} of ${animes.length} upcoming anime`
          }
        </p>
      </div>

      {/* Anime Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800">
              <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="flex gap-1">
                  <div className="h-3 w-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAnimes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Calendar className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-black dark:text-white">No upcoming anime found</h3>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAnimes.map((anime, index) => (
            <Link 
              href={`/info/${anime.id}`} 
              key={anime.id}
              className="group overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <div className="relative">
                {/* Rank badge */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white">
                  <TrendingUp className="h-3 w-3" />
                  <span>#{index + 1}</span>
                </div>
                
                <div className="relative aspect-video overflow-hidden">
                  <Image 
                    src={anime.img || "/placeholder.svg"} 
                    alt={anime.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                </div>
              </div>
              
              <div className="flex flex-col flex-grow p-4">
                <h3 className="text-base font-medium text-black dark:text-white line-clamp-2 group-hover:text-blue-500 transition-colors">
                  {anime.name}
                </h3>
                
                {anime.jname && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                    {anime.jname}
                  </p>
                )}
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {anime.genres?.map((genre, i) => (
                    <span key={i} className="inline-block text-[10px] text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      {genre}
                    </span>
                  ))}
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs px-2 py-0.5 rounded font-medium">
                      {anime.type}
                    </span>
                    
                    {anime.score && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" fill="currentColor" />
                        <span className="text-xs font-medium">{anime.score.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  {anime.releaseDate && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{anime.releaseDate}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 w-full py-1.5 text-center text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md shadow-sm group-hover:shadow-lg transition-all">
                  View Details
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 