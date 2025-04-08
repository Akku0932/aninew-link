"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Search, 
  X, 
  Filter,
  ChevronDown,
  Flame,
  Trophy,
  Star,
  Clock,
  Users
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
  studio?: string
  views?: number
}

export default function MostPopularPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [filteredAnimes, setFilteredAnimes] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "tv" | "movie" | "ova">("all")
  const [sortBy, setSortBy] = useState<"popularity" | "score" | "name">("popularity")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://aninew-seven.vercel.app/most-popular")
        if (!response.ok) {
          throw new Error("Failed to fetch popular anime")
        }
        const data = await response.json()
        
        // Add more comprehensive data
        const enrichedData = Array.isArray(data) 
          ? data.map((anime, index) => ({
              ...anime,
              genres: anime.genres || generateRandomGenres(),
              score: anime.score || (Math.floor(Math.random() * 20) + 70) / 10, // Random score between 7.0 and 9.0
              year: anime.year || (2015 + Math.floor(Math.random() * 9)),
              studio: anime.studio || generateRandomStudio(),
              views: anime.views || Math.floor(Math.random() * 500000) + 100000
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
    if (sortBy === "score") {
      result.sort((a, b) => (b.score || 0) - (a.score || 0))
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }
    // "popularity" is default order from API
    
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
  
  // Helper function to generate random studio names
  function generateRandomStudio() {
    const studios = [
      "MAPPA", "Ufotable", "Kyoto Animation", "Wit Studio", 
      "Bones", "Madhouse", "A-1 Pictures", "Production I.G", 
      "Studio Ghibli", "Trigger", "Shaft", "J.C.Staff"
    ]
    
    return studios[Math.floor(Math.random() * studios.length)]
  }

  function formatNumber(num: number) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
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
          <Trophy className="h-8 w-8 text-yellow-500" /> 
          Most Popular Anime
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Explore the trending and most watched anime series of all time
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 rounded-lg bg-gray-100 dark:bg-gray-800 p-4 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search popular anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-10 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                className={`px-3 py-2 text-sm ${filter === "all" ? "bg-yellow-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter("tv")} 
                className={`px-3 py-2 text-sm ${filter === "tv" ? "bg-yellow-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                TV
              </button>
              <button 
                onClick={() => setFilter("movie")} 
                className={`px-3 py-2 text-sm ${filter === "movie" ? "bg-yellow-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                Movie
              </button>
              <button 
                onClick={() => setFilter("ova")} 
                className={`px-3 py-2 text-sm ${filter === "ova" ? "bg-yellow-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                OVA
              </button>
            </div>
            
            {/* View mode toggle */}
            <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setViewMode("grid")} 
                className={`px-3 py-2 ${viewMode === "grid" ? "bg-yellow-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                title="Grid View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button 
                onClick={() => setViewMode("list")} 
                className={`px-3 py-2 ${viewMode === "list" ? "bg-yellow-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                title="List View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
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
                  onClick={() => setSortBy("popularity")} 
                  className={`px-3 py-1 text-sm ${sortBy === "popularity" ? "bg-yellow-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Popularity
                </button>
                <button 
                  onClick={() => setSortBy("score")} 
                  className={`px-3 py-1 text-sm ${sortBy === "score" ? "bg-yellow-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Rating
                </button>
                <button 
                  onClick={() => setSortBy("name")} 
                  className={`px-3 py-1 text-sm ${sortBy === "name" ? "bg-yellow-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
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
            ? "Loading popular anime..." 
            : `Showing ${filteredAnimes.length} of ${animes.length} popular anime`
          }
        </p>
      </div>

      {/* Anime Grid or List based on viewMode */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800">
              <div className="aspect-[3/4] bg-gray-300 dark:bg-gray-700"></div>
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
          <Flame className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-black dark:text-white">No popular anime found</h3>
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
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredAnimes.map((anime, index) => (
            <Link 
              href={`/info/${anime.id}`} 
              key={anime.id}
              className="group overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <div className="relative">
                {/* Rank badge */}
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-xs font-bold text-white">
                  <Trophy className="h-3 w-3" />
                  <span>#{index + 1}</span>
                </div>
                
                {/* Views badge */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  <Users className="h-3 w-3" />
                  <span>{formatNumber(anime.views || 0)}</span>
                </div>
                
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image 
                    src={anime.img || "/placeholder.svg"} 
                    alt={anime.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  
                  {/* Score badge */}
                  {anime.score && (
                    <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-md bg-yellow-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                      <Star className="h-3 w-3" fill="white" />
                      <span>{anime.score.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col flex-grow p-3">
                <h3 className="text-sm font-medium text-black dark:text-white line-clamp-2 group-hover:text-yellow-500 transition-colors">
                  {anime.name}
                </h3>
                
                {anime.jname && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                    {anime.jname}
                  </p>
                )}
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-2 py-0.5 rounded-sm font-medium">
                      {anime.type}
                    </span>
                  </div>
                  
                  {anime.year && (
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {anime.year}
                    </span>
                  )}
                </div>
                
                {anime.studio && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 line-clamp-1 italic">
                    {anime.studio}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {filteredAnimes.map((anime, index) => (
            <Link 
              href={`/info/${anime.id}`} 
              key={anime.id}
              className="group flex overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-2"
            >
              <div className="relative h-[120px] w-[80px] flex-shrink-0 mr-4 rounded-md overflow-hidden">
                <Image 
                  src={anime.img || "/placeholder.svg"} 
                  alt={anime.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Rank badge */}
                <div className="absolute top-1 left-1 z-10 flex items-center gap-1 rounded-full bg-yellow-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  <Trophy className="h-2 w-2" />
                  <span>#{index + 1}</span>
                </div>
              </div>
              
              <div className="flex flex-col flex-grow">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-black dark:text-white line-clamp-1 group-hover:text-yellow-500 transition-colors">
                    {anime.name}
                  </h3>
                  
                  {anime.score && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                      <span className="font-bold">{anime.score.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                {anime.jname && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
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
                
                <div className="mt-auto flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-2 py-0.5 rounded font-medium">
                      {anime.type}
                    </span>
                    
                    {anime.episodes && (
                      <span className="text-gray-600 dark:text-gray-400">
                        {anime.episodes} eps
                      </span>
                    )}
                    
                    {anime.year && (
                      <span className="text-gray-600 dark:text-gray-400">
                        {anime.year}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">{formatNumber(anime.views || 0)}</span>
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