"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Search, 
  X, 
  Film, 
  Clock, 
  Star, 
  Eye, 
  Calendar,
  Filter,
  ChevronDown 
} from "lucide-react"
import { Button } from "@/components/ui/button"

type Movie = {
  id: string
  img: string
  name: string
  jname: string
  type: string
  duration: string
  sub: number | null
  dub: number | null
  eps: number | null
  rate: string | null
  raw: boolean
}

export default function MoviePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "raw" | "sub" | "dub">("all")
  const [sortBy, setSortBy] = useState<"newest" | "name" | "duration">("newest")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://aninew-seven.vercel.app/movie")
        if (!response.ok) {
          throw new Error("Failed to fetch movies")
        }
        const data = await response.json()
        setMovies(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [])

  useEffect(() => {
    // Filter and sort movies whenever dependencies change
    let result = [...movies]
    
    // Apply filters
    if (filter !== "all") {
      result = result.filter(movie => 
        filter === "raw" ? movie.raw :
        filter === "sub" ? movie.sub !== null : 
        filter === "dub" ? movie.dub !== null : true
      )
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(movie => 
        movie.name.toLowerCase().includes(query) || 
        (movie.jname && movie.jname.toLowerCase().includes(query))
      )
    }
    
    // Apply sorting
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "duration") {
      result.sort((a, b) => {
        // Convert duration strings (e.g., "120m") to minutes for comparison
        const getMinutes = (duration: string) => {
          const match = duration.match(/(\d+)m/)
          return match ? parseInt(match[1]) : 0
        }
        return getMinutes(b.duration) - getMinutes(a.duration)
      })
    }
    // "newest" is default order from API
    
    setFilteredMovies(result)
  }, [movies, searchQuery, filter, sortBy])

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
        <h1 className="text-3xl font-bold text-black dark:text-white">Anime Movies</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Browse our collection of {movies.length} anime movies
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search anime movies..."
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
                onClick={() => setFilter("raw")} 
                className={`px-3 py-2 text-sm ${filter === "raw" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                Raw
              </button>
              <button 
                onClick={() => setFilter("sub")} 
                className={`px-3 py-2 text-sm ${filter === "sub" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                Sub
              </button>
              <button 
                onClick={() => setFilter("dub")} 
                className={`px-3 py-2 text-sm ${filter === "dub" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                Dub
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
                  onClick={() => setSortBy("newest")} 
                  className={`px-3 py-1 text-sm ${sortBy === "newest" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Newest
                </button>
                <button 
                  onClick={() => setSortBy("name")} 
                  className={`px-3 py-1 text-sm ${sortBy === "name" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Name
                </button>
                <button 
                  onClick={() => setSortBy("duration")} 
                  className={`px-3 py-1 text-sm ${sortBy === "duration" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Duration
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
            ? "Loading movies..." 
            : `Showing ${filteredMovies.length} of ${movies.length} movies`
          }
        </p>
      </div>

      {/* Movie Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="mt-2 h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="mt-1 h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Film className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-black dark:text-white">No movies found</h3>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <Link 
              href={`/info/${movie.id}`} 
              key={movie.id}
              className="group flex flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <Image 
                  src={movie.img || "/placeholder.svg"} 
                  alt={movie.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                
                {/* Bottom details */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-white" />
                      <span className="text-xs text-white">{movie.duration}</span>
                    </div>
                    {movie.rate && (
                      <span className="px-1.5 py-0.5 bg-gray-900/80 rounded text-xs font-medium text-white">{movie.rate}</span>
                    )}
                  </div>
                </div>
                
                {/* Top badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {movie.raw && movie.sub && movie.dub ? (
                    <span className="inline-block bg-red-500 text-xs text-white px-2 py-0.5 rounded-sm font-medium">RAW/SUB/DUB</span>
                  ) : movie.raw && movie.sub ? (
                    <span className="inline-block bg-red-500 text-xs text-white px-2 py-0.5 rounded-sm font-medium">RAW/SUB</span>
                  ) : movie.raw && movie.dub ? (
                    <span className="inline-block bg-red-500 text-xs text-white px-2 py-0.5 rounded-sm font-medium">RAW/DUB</span>
                  ) : movie.sub && movie.dub ? (
                    <span className="inline-block bg-purple-500 text-xs text-white px-2 py-0.5 rounded-sm font-medium">SUB/DUB</span>
                  ) : movie.raw ? (
                    <span className="inline-block bg-red-500 text-xs text-white px-2 py-0.5 rounded-sm font-medium">RAW</span>
                  ) : movie.sub ? (
                    <span className="inline-block bg-blue-500 text-xs text-white px-2 py-0.5 rounded-sm font-medium">SUB</span>
                  ) : movie.dub ? (
                    <span className="inline-block bg-yellow-500 text-xs text-white px-2 py-0.5 rounded-sm font-medium">DUB</span>
                  ) : null}
                </div>
                
                {/* Play button overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="rounded-full bg-red-600/90 p-3">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col flex-grow p-3">
                <h3 className="text-sm font-medium text-black dark:text-white line-clamp-2 group-hover:text-red-500 transition-colors">
                  {movie.name}
                </h3>
                
                {movie.jname && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                    {movie.jname}
                  </p>
                )}
                
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-0.5 rounded">
                    {movie.type}
                  </span>
                  
                  <div className="flex items-center">
                    <button className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
                      <span>Watch</span>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 