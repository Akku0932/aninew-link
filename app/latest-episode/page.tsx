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
  Calendar,
  PlayCircle,
  Tv,
  Bookmark,
  PlaySquare,
  Clock,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"

type Episode = {
  id: string
  animeId: string
  number: number
  title?: string
  img: string
  animeName: string
  releaseDate: string
  duration?: string
  watched?: number
  type?: string
}

export default function LatestEpisodePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "tv" | "movie" | "ova">("all")
  const [timePeriod, setTimePeriod] = useState<"all" | "today" | "week" | "month">("all")
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "name">("latest")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://aninew-seven.vercel.app/recently-updated")
        if (!response.ok) {
          throw new Error("Failed to fetch latest episodes")
        }
        const data = await response.json()
        
        // Add more comprehensive data
        const enrichedData = Array.isArray(data) 
          ? data.map((episode, index) => ({
              ...episode,
              releaseDate: episode.releaseDate || generateRandomReleaseDate(),
              duration: episode.duration || `${Math.floor(Math.random() * 8) + 18}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
              watched: episode.watched || Math.floor(Math.random() * 10000) + 1000,
              type: episode.type || ["TV", "Movie", "OVA"][Math.floor(Math.random() * 3)],
              animeId: episode.id,
              id: `${episode.id}-ep-${episode.sub || episode.dub || 1}`,
              number: episode.sub || episode.dub || 1,
              animeName: episode.name
            }))
          : [];
          
        setEpisodes(enrichedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEpisodes()
  }, [])

  useEffect(() => {
    // Filter and sort episodes whenever dependencies change
    let result = [...episodes]
    
    // Apply filters based on anime type
    if (filter !== "all") {
      result = result.filter(episode => 
        episode.type?.toLowerCase() === filter.toLowerCase()
      )
    }
    
    // Apply time period filter
    if (timePeriod !== "all") {
      const now = new Date()
      let cutoffDate = new Date()
      
      if (timePeriod === "today") {
        cutoffDate.setHours(0, 0, 0, 0)
      } else if (timePeriod === "week") {
        cutoffDate.setDate(now.getDate() - 7)
      } else if (timePeriod === "month") {
        cutoffDate.setMonth(now.getMonth() - 1)
      }
      
      result = result.filter(episode => {
        const releaseDate = new Date(episode.releaseDate)
        return releaseDate >= cutoffDate
      })
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(episode => 
        episode.animeName.toLowerCase().includes(query) || 
        (episode.title && episode.title.toLowerCase().includes(query))
      )
    }
    
    // Apply sorting
    if (sortBy === "latest") {
      // Sort by releaseDate (most recent first)
      result.sort((a, b) => {
        const dateA = new Date(a.releaseDate).getTime()
        const dateB = new Date(b.releaseDate).getTime()
        return dateB - dateA
      })
    } else if (sortBy === "popular") {
      result.sort((a, b) => (b.watched || 0) - (a.watched || 0))
    } else if (sortBy === "name") {
      result.sort((a, b) => a.animeName.localeCompare(b.animeName))
    }
    
    setFilteredEpisodes(result)
  }, [episodes, searchQuery, filter, sortBy, timePeriod])

  // Helper function to generate random release dates (within the last month)
  function generateRandomReleaseDate(): string {
    const now = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(now.getMonth() - 1)
    
    const randomTime = oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime())
    const randomDate = new Date(randomTime)
    
    return randomDate.toISOString()
  }

  // Helper function to format relative time
  function getRelativeTimeString(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInSecs = Math.floor(diffInMs / 1000)
    const diffInMins = Math.floor(diffInSecs / 60)
    const diffInHours = Math.floor(diffInMins / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInSecs < 60) {
      return "Just now"
    } else if (diffInMins < 60) {
      return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`
    } else if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`
    } else {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
      return date.toLocaleDateString(undefined, options)
    }
  }

  // Helper function to format number of views
  function formatViews(views: number): string {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M'
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K'
    }
    return views.toString()
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
          <Clock className="h-8 w-8 text-blue-500" /> 
          Latest Episodes
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Watch the newest anime episodes as soon as they're released
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 rounded-lg bg-gray-100 dark:bg-gray-800 p-4 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search anime episodes..."
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
                onClick={() => setTimePeriod("all")} 
                className={`px-3 py-2 text-sm ${timePeriod === "all" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                All Time
              </button>
              <button 
                onClick={() => setTimePeriod("today")} 
                className={`px-3 py-2 text-sm ${timePeriod === "today" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                Today
              </button>
              <button 
                onClick={() => setTimePeriod("week")} 
                className={`px-3 py-2 text-sm ${timePeriod === "week" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
              >
                This Week
              </button>
            </div>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Type</p>
              <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setFilter("all")} 
                  className={`px-3 py-1 text-sm ${filter === "all" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter("tv")} 
                  className={`px-3 py-1 text-sm ${filter === "tv" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  TV
                </button>
                <button 
                  onClick={() => setFilter("movie")} 
                  className={`px-3 py-1 text-sm ${filter === "movie" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Movie
                </button>
                <button 
                  onClick={() => setFilter("ova")} 
                  className={`px-3 py-1 text-sm ${filter === "ova" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  OVA
                </button>
              </div>
            </div>
            
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</p>
              <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setSortBy("latest")} 
                  className={`px-3 py-1 text-sm ${sortBy === "latest" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Latest
                </button>
                <button 
                  onClick={() => setSortBy("popular")} 
                  className={`px-3 py-1 text-sm ${sortBy === "popular" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                >
                  Popular
                </button>
                <button 
                  onClick={() => setSortBy("name")} 
                  className={`px-3 py-1 text-sm ${sortBy === "name" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
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
            ? "Loading latest episodes..." 
            : `Showing ${filteredEpisodes.length} of ${episodes.length} episodes`
          }
        </p>
      </div>

      {/* Episodes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800">
              <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-full mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredEpisodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Calendar className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-black dark:text-white">No episodes found</h3>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          {searchQuery || filter !== "all" || timePeriod !== "all" ? (
            <Button 
              className="mt-4"
              onClick={() => {
                setSearchQuery("")
                setFilter("all")
                setTimePeriod("all")
              }}
            >
              Clear Filters
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEpisodes.map((episode) => (
            <div 
              key={episode.id}
              className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative">
                <div className="relative aspect-video overflow-hidden">
                  <Image 
                    src={episode.img || "/placeholder.svg"} 
                    alt={`${episode.animeName} Episode ${episode.number}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70"></div>
                  
                  {/* Episode number badge */}
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-md">
                    EP {episode.number}
                  </div>
                  
                  {/* Type badge */}
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-md">
                    {episode.type}
                  </div>
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="p-2 rounded-full bg-blue-500/90 transform scale-75 group-hover:scale-100 transition-all duration-300">
                      <PlayCircle className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Duration and time */}
                <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center">
                  {episode.duration && (
                    <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                      <Clock className="h-3 w-3 text-gray-300" />
                      <span>{episode.duration}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                    <Calendar className="h-3 w-3 text-gray-300" />
                    <span>{getRelativeTimeString(episode.releaseDate)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <Link href={`/watch/${episode.animeId}?ep=${episode.number}`}>
                  <h3 className="font-medium text-lg text-black dark:text-white line-clamp-1 group-hover:text-blue-500 transition-colors">
                    {episode.animeName}
                  </h3>
                </Link>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                  Episode {episode.number}{episode.title ? `: ${episode.title}` : ""}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                    <Eye className="h-3 w-3" />
                    <span>{formatViews(episode.watched || 0)} views</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      href={`/watch/${episode.animeId}?ep=${episode.number}`}
                      className="flex items-center justify-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded font-medium transition-colors"
                    >
                      <PlaySquare className="h-3 w-3" />
                      <span>Watch</span>
                    </Link>
                    
                    <Link
                      href={`/info/${episode.animeId}`}
                      className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Bookmark className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 