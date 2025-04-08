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
  Subtitles,
  Languages
} from "lucide-react"
import { Button } from "@/components/ui/button"

type Series = {
  id: string
  img: string
  name: string
  jname?: string
  type: string
  duration?: string
  sub?: number
  dub?: number
  eps?: number
  rate?: string
  genres?: string[]
  year?: number
  synopsis?: string
  score?: number
}

export default function TvSeriesPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "subbed" | "dubbed" | "completed">("all")
  const [ageRating, setAgeRating] = useState<"all" | "pg" | "pg13" | "r18">("all")
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "a-z" | "score">("latest")
  const [showFilters, setShowFilters] = useState(false)
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null)

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://aninew-seven.vercel.app/tv")
        if (!response.ok) {
          throw new Error("Failed to fetch TV series")
        }
        const data = await response.json()
        
        // Add more comprehensive data
        const enrichedData = Array.isArray(data) 
          ? data.map((show, index) => ({
              ...show,
              genres: show.genres || generateRandomGenres(),
              score: show.score || (Math.floor(Math.random() * 20) + 70) / 10, // Random score between 7.0 and 9.0
              year: show.year || (2015 + Math.floor(Math.random() * 9)),
              synopsis: show.synopsis || generateRandomSynopsis(),
            }))
          : [];
          
        setSeries(enrichedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSeries()
  }, [])

  useEffect(() => {
    // Filter and sort series whenever dependencies change
    let result = [...series]
    
    // Apply filters based on sub/dub/completed
    if (filter !== "all") {
      if (filter === "subbed") {
        result = result.filter(show => show.sub && show.sub > 0)
      } else if (filter === "dubbed") {
        result = result.filter(show => show.dub && show.dub > 0)
      } else if (filter === "completed") {
        result = result.filter(show => show.eps && show.sub === show.eps)
      }
    }
    
    // Apply age rating filter
    if (ageRating !== "all") {
      if (ageRating === "r18") {
        result = result.filter(show => show.rate === "18+")
      } else if (ageRating === "pg13") {
        result = result.filter(show => show.rate === "13+")
      } else if (ageRating === "pg") {
        result = result.filter(show => show.rate === "PG" || show.rate === "G")
      }
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(show => 
        show.name.toLowerCase().includes(query) || 
        (show.jname && show.jname.toLowerCase().includes(query))
      )
    }
    
    // Apply sorting
    if (sortBy === "oldest") {
      result.reverse() // Assuming default is newest first
    } else if (sortBy === "a-z") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "score") {
      result.sort((a, b) => (b.score || 0) - (a.score || 0))
    }
    // "latest" is default order from API
    
    setFilteredSeries(result)
  }, [series, searchQuery, filter, sortBy, ageRating])

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

  // Helper function for completion status
  function getCompletionStatus(show: Series): string {
    if (!show.eps) return "Ongoing"
    if (show.sub === show.eps) return "Completed"
    return `${show.sub || 0}/${show.eps} Episodes`
  }

  // Helper function to get color based on rating
  function getRatingColor(rating: string | undefined): string {
    if (!rating) return "bg-gray-500"
    if (rating === "18+") return "bg-red-500"
    if (rating === "13+") return "bg-yellow-500"
    return "bg-green-500" // PG, G, etc.
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
          <Tv className="h-8 w-8 text-indigo-500" /> 
          TV Series
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Explore our collection of TV anime series with new episodes released weekly
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 rounded-lg bg-gray-100 dark:bg-gray-800 p-4 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search TV series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-10 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className={`px-3 py-2 text-sm ${filter === "all" ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter("subbed")} 
                className={`px-3 py-2 text-sm ${filter === "subbed" ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                Subbed
              </button>
              <button 
                onClick={() => setFilter("dubbed")} 
                className={`px-3 py-2 text-sm ${filter === "dubbed" ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                Dubbed
              </button>
              <button 
                onClick={() => setFilter("completed")} 
                className={`px-3 py-2 text-sm ${filter === "completed" ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Age Rating</p>
              <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setAgeRating("all")} 
                  className={`px-3 py-1 text-sm ${ageRating === "all" ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setAgeRating("pg")} 
                  className={`px-3 py-1 text-sm ${ageRating === "pg" ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  PG
                </button>
                <button 
                  onClick={() => setAgeRating("pg13")} 
                  className={`px-3 py-1 text-sm ${ageRating === "pg13" ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  13+
                </button>
                <button 
                  onClick={() => setAgeRating("r18")} 
                  className={`px-3 py-1 text-sm ${ageRating === "r18" ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  18+
                </button>
              </div>
            </div>
            
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</p>
              <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setSortBy("latest")} 
                  className={`px-3 py-1 text-sm ${sortBy === "latest" ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Latest
                </button>
                <button 
                  onClick={() => setSortBy("oldest")} 
                  className={`px-3 py-1 text-sm ${sortBy === "oldest" ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Oldest
                </button>
                <button 
                  onClick={() => setSortBy("a-z")} 
                  className={`px-3 py-1 text-sm ${sortBy === "a-z" ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  A-Z
                </button>
                <button 
                  onClick={() => setSortBy("score")} 
                  className={`px-3 py-1 text-sm ${sortBy === "score" ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Rating
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
            ? "Loading TV series..." 
            : `Showing ${filteredSeries.length} of ${series.length} TV series`
          }
        </p>
      </div>

      {/* Series Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800">
              <div className="aspect-[3/4] bg-gray-300 dark:bg-gray-700"></div>
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
      ) : filteredSeries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Tv className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-black dark:text-white">No TV series found</h3>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          {searchQuery || filter !== "all" || ageRating !== "all" ? (
            <Button 
              className="mt-4"
              onClick={() => {
                setSearchQuery("")
                setFilter("all")
                setAgeRating("all")
              }}
            >
              Clear Filters
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredSeries.map((show) => (
            <div 
              key={show.id}
              className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
              onMouseEnter={() => setHoveredSeries(show.id)}
              onMouseLeave={() => setHoveredSeries(null)}
            >
              <Link href={`/info/${show.id}`}>
                <div className="relative">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image 
                      src={show.img || "/placeholder.svg"} 
                      alt={show.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Age rating badge */}
                    {show.rate && (
                      <div className={`absolute top-2 right-2 ${getRatingColor(show.rate)} text-white text-xs px-2 py-1 rounded-md font-medium shadow-md`}>
                        {show.rate}
                      </div>
                    )}
                    
                    {/* Episode count status */}
                    <div className="absolute top-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-md">
                      {show.eps ? `${show.eps} EP` : "Ongoing"}
                    </div>
                    
                    {/* Language badges */}
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {show.sub && show.sub > 0 && (
                        <div className="flex items-center gap-0.5 bg-purple-500/90 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                          <Subtitles className="h-3 w-3" />
                          <span>SUB</span>
                        </div>
                      )}
                      {show.dub && show.dub > 0 && (
                        <div className="flex items-center gap-0.5 bg-orange-500/90 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                          <Languages className="h-3 w-3" />
                          <span>DUB</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="p-2 rounded-full bg-indigo-500/90 transform scale-75 group-hover:scale-100 transition-all duration-300">
                        <PlayCircle className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              
              <div className="p-3">
                <Link href={`/info/${show.id}`}>
                  <h3 className="font-medium text-base text-black dark:text-white line-clamp-1 group-hover:text-indigo-500 transition-colors">
                    {show.name}
                  </h3>
                </Link>
                
                {show.jname && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {show.jname}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  {show.duration && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{show.duration}</span>
                    </div>
                  )}
                  
                  {show.score && (
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
                      <span>{show.score.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {getCompletionStatus(show)}
                  </div>
                  
                  <Link
                    href={`/info/${show.id}`}
                    className="p-1.5 rounded bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40 transition-colors"
                  >
                    <Bookmark className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  </Link>
                </div>
              </div>
              
              {/* Hover synopsis tooltip (for larger screens) */}
              {hoveredSeries === show.id && (
                <div className="absolute left-full top-0 z-20 w-64 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 ml-2 hidden xl:block">
                  <h4 className="font-medium text-sm text-black dark:text-white mb-1">{show.name}</h4>
                  <div className="flex gap-1 mb-1">
                    {show.genres?.map((genre, i) => (
                      <span key={i} className="text-[10px] text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        {genre}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{show.synopsis}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 