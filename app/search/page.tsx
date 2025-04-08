"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
  Film,
  Bookmark,
  PlaySquare,
  Subtitles,
  Languages,
  SlidersHorizontal,
  Sparkles
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

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
  genres?: string[]
  year?: number
  synopsis?: string
  score?: number
  status?: string
  studio?: string
  season?: string
}

// Predefined genres list with proper categorization
const PREDEFINED_GENRES = [
  // Action & Adventure
  "Action", "Adventure", "Martial Arts", "Military", "Samurai", "Space",
  // Comedy & Drama
  "Comedy", "Drama", "Parody", "Slice of Life",
  // Fantasy & Supernatural
  "Fantasy", "Supernatural", "Vampire", "Isekai",
  // Horror & Mystery
  "Horror", "Mystery", "Psychological", "Thriller",
  // Romance & Harem
  "Romance", "Harem", "Yaoi", "Yuri",
  // Sci-Fi & Technology
  "Sci-Fi", "Mecha", "Cyberpunk",
  // Sports & Music
  "Sports", "Music",
  // Demographics
  "Shounen", "Shoujo", "Seinen", "Josei",
  // School & Work
  "School", "Work Life",
  // Other
  "Ecchi", "Police", "Historical"
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get("keyword") || ""

  const [searchResults, setSearchResults] = useState<AnimeItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(keyword)
  const [filter, setFilter] = useState<"all" | "subbed" | "dubbed" | "completed">("all")
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "a-z" | "score">("latest")
  const [ageRating, setAgeRating] = useState<"all" | "r18" | "pg13" | "pg">("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [status, setStatus] = useState<"all" | "ongoing" | "completed" | "upcoming">("all")
  const [season, setSeason] = useState<"all" | "winter" | "spring" | "summer" | "fall">("all")
  const [year, setYear] = useState<string>("all")
  const [type, setType] = useState<"all" | "tv" | "movie" | "ova" | "ona" | "special">("all")
  const [minScore, setMinScore] = useState<number>(0)
  const [maxScore, setMaxScore] = useState<number>(10)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save recent searches to localStorage
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem("recentSearches", JSON.stringify(recentSearches))
    }
  }, [recentSearches])

  useEffect(() => {
    if (keyword) {
      searchAnime(keyword)
    }
  }, [keyword])

  const searchAnime = async (query: string) => {
    try {
      setIsLoading(true)
      setError(null)
      // Normalize the search query by removing spaces and converting to lowercase
      const normalizedQuery = query.toLowerCase().replace(/\s+/g, '')
      const response = await fetch(`https://aninew-seven.vercel.app/search?keyword=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error("Failed to fetch search results")
      }
      const data = await response.json()
      
      // Filter results to include matches without spaces
      const filteredResults = (data.results || []).filter((anime: AnimeItem) => {
        const normalizedName = anime.name.toLowerCase().replace(/\s+/g, '')
        const normalizedJName = (anime.jname || '').toLowerCase().replace(/\s+/g, '')
        return normalizedName.includes(normalizedQuery) || normalizedJName.includes(normalizedQuery)
      })
      
      setSearchResults(filteredResults)

      // Add to recent searches if not already present
      if (query && !recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev].slice(0, 5))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      toast({
        title: "Error",
        description: "Failed to fetch search results. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Update URL without refreshing the page
      const url = new URL(window.location.href)
      url.searchParams.set("keyword", searchQuery)
      window.history.pushState({}, "", url)
      searchAnime(searchQuery)
      setSearchQuery("") // Clear search input after search
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setError(null)
  }

  const clearFilters = () => {
    setFilter("all")
    setSortBy("latest")
    setAgeRating("all")
    setSelectedGenres([])
    setStatus("all")
    setSeason("all")
    setYear("all")
    setType("all")
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  // Filter and sort results
  const filteredResults = searchResults
    .filter(anime => {
      // Filter by type (subbed/dubbed/completed)
      if (filter !== "all") {
        if (filter === "subbed" && !anime.sub) return false
        if (filter === "dubbed" && !anime.dub) return false
        if (filter === "completed" && anime.eps && anime.sub !== anime.eps) return false
      }

      // Filter by age rating
      if (ageRating !== "all") {
        if (ageRating === "r18" && anime.rate !== "18+") return false
        if (ageRating === "pg13" && anime.rate !== "13+") return false
        if (ageRating === "pg" && !["PG", "G"].includes(anime.rate || "")) return false
      }

      // Filter by selected genres
      if (selectedGenres.length > 0) {
        const animeGenres = anime.genres?.map(g => g.toLowerCase()) || []
        if (!selectedGenres.some(genre => animeGenres.includes(genre.toLowerCase()))) {
          return false
        }
      }

      // Filter by status
      if (status !== "all") {
        const animeStatus = anime.status?.toLowerCase() || ""
        if (status === "ongoing" && !animeStatus.includes("ongoing")) return false
        if (status === "completed" && !animeStatus.includes("completed")) return false
        if (status === "upcoming" && !animeStatus.includes("upcoming")) return false
      }

      // Filter by season
      if (season !== "all") {
        const animeSeason = anime.season?.toLowerCase() || ""
        if (!animeSeason.includes(season)) {
          return false
        }
      }

      // Filter by year
      if (year !== "all" && anime.year?.toString() !== year) {
        return false
      }

      // Filter by type
      if (type !== "all") {
        const animeType = anime.type?.toLowerCase() || ""
        if (!animeType.includes(type)) return false
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (a.year || 0) - (b.year || 0)
        case "a-z":
          return a.name.localeCompare(b.name)
        case "score":
          return (b.score || 0) - (a.score || 0)
        default: // latest
          return (b.year || 0) - (a.year || 0)
      }
    })

  // Get years for filter (last 10 years)
  const years = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - i).toString())

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Search className="h-8 w-8 text-red-500" />
            Search Results
          </h1>
          <p className="mt-2 text-gray-400">
            {searchResults.length} results found for "{keyword}"
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search anime..."
              className="w-full bg-[#141414] pl-12 pr-12 text-white placeholder:text-gray-400 focus-visible:ring-red-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </form>

          {/* Recent Searches */}
          {recentSearches.length > 0 && !searchQuery && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-400">Recent:</span>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(search)
                    searchAnime(search)
                  }}
                  className="text-sm text-gray-300 hover:text-white"
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-[#141414] border-white/10 text-white hover:bg-[#1a1a1a]"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#141414] border-white/10 text-white hover:bg-[#1a1a1a]"
              >
                Sort by: {sortBy === "latest" ? "Latest" : sortBy === "oldest" ? "Oldest" : sortBy === "a-z" ? "A-Z" : "Score"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#141414] border-white/10">
              <DropdownMenuItem onClick={() => setSortBy("latest")}>Latest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("a-z")}>A-Z</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("score")}>Score</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="bg-[#141414] border-white/10 text-white hover:bg-[#1a1a1a]"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Advanced Search
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mb-8 rounded-lg bg-[#141414] p-4 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <Tabs value={status} onValueChange={(value) => setStatus(value as any)}>
                  <TabsList className="bg-[#1a1a1a]">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Type Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Type</h3>
                <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                  <TabsList className="bg-[#1a1a1a]">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="subbed">Subbed</TabsTrigger>
                    <TabsTrigger value="dubbed">Dubbed</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Age Rating Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Age Rating</h3>
                <Tabs value={ageRating} onValueChange={(value) => setAgeRating(value as any)}>
                  <TabsList className="bg-[#1a1a1a]">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pg">PG</TabsTrigger>
                    <TabsTrigger value="pg13">PG-13</TabsTrigger>
                    <TabsTrigger value="r18">R18+</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Season Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Season</h3>
                <div className="grid grid-cols-5 gap-1">
                  <button
                    onClick={() => setSeason("all")}
                    className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                      season === "all"
                        ? "bg-red-500 text-white"
                        : "bg-[#1a1a1a] text-gray-300 hover:bg-[#242424]"
                    }`}
                  >
                    <span className="text-xs">All</span>
                  </button>
                  <button
                    onClick={() => setSeason("winter")}
                    className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                      season === "winter"
                        ? "bg-blue-500 text-white"
                        : "bg-[#1a1a1a] text-gray-300 hover:bg-[#242424]"
                    }`}
                  >
                    <span className="text-xs">Winter</span>
                  </button>
                  <button
                    onClick={() => setSeason("spring")}
                    className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                      season === "spring"
                        ? "bg-pink-500 text-white"
                        : "bg-[#1a1a1a] text-gray-300 hover:bg-[#242424]"
                    }`}
                  >
                    <span className="text-xs">Spring</span>
                  </button>
                  <button
                    onClick={() => setSeason("summer")}
                    className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                      season === "summer"
                        ? "bg-yellow-500 text-white"
                        : "bg-[#1a1a1a] text-gray-300 hover:bg-[#242424]"
                    }`}
                  >
                    <span className="text-xs">Summer</span>
                  </button>
                  <button
                    onClick={() => setSeason("fall")}
                    className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                      season === "fall"
                        ? "bg-orange-500 text-white"
                        : "bg-[#1a1a1a] text-gray-300 hover:bg-[#242424]"
                    }`}
                  >
                    <span className="text-xs">Fall</span>
                  </button>
                </div>
              </div>

              {/* Year Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Year</h3>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-[#1a1a1a] text-white rounded-md border border-white/10 p-2"
                >
                  <option value="all">All Years</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Anime Type Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Anime Type</h3>
                <Tabs value={type} onValueChange={(value) => setType(value as any)}>
                  <TabsList className="bg-[#1a1a1a]">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="tv">TV</TabsTrigger>
                    <TabsTrigger value="movie">Movie</TabsTrigger>
                    <TabsTrigger value="ova">OVA</TabsTrigger>
                    <TabsTrigger value="ona">ONA</TabsTrigger>
                    <TabsTrigger value="special">Special</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Genres Filter */}
              <div className="md:col-span-2 lg:col-span-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Genres</h3>
                  {selectedGenres.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedGenres([])}
                      className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {PREDEFINED_GENRES.map((genre) => (
                    <Badge
                      key={genre}
                      variant={selectedGenres.includes(genre) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors text-xs py-1 px-2 ${
                        selectedGenres.includes(genre)
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "hover:bg-[#1a1a1a] text-gray-300"
                      }`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
                {selectedGenres.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    {selectedGenres.length} genres selected
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="bg-[#1a1a1a] border-white/10 text-white hover:bg-[#242424]"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] rounded-lg bg-[#141414]"></div>
                <div className="mt-2 h-4 w-3/4 rounded bg-[#141414]"></div>
                <div className="mt-1 h-3 w-1/2 rounded bg-[#141414]"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg bg-[#141414] p-8 text-center">
            <p className="text-red-500">{error}</p>
            <Button
              className="mt-4"
              onClick={() => searchAnime(keyword)}
            >
              Try Again
            </Button>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="rounded-lg bg-[#141414] p-8 text-center">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">No results found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            {(searchQuery || filter !== "all" || ageRating !== "all" || selectedGenres.length > 0) && (
              <Button
                onClick={clearFilters}
                className="bg-red-500 hover:bg-red-600"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredResults.map((anime) => (
              <Link
                key={anime.id}
                href={`/info/${anime.id}`}
                className="group relative overflow-hidden rounded-lg bg-[#141414] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/10"
              >
                <div className="aspect-[3/4] relative">
                  <Image
                    src={anime.img}
                    alt={anime.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-medium text-white group-hover:text-red-500 transition-colors duration-300">
                    {anime.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {anime.score?.toFixed(1) || "N/A"}
                    </span>
                    <span>•</span>
                    <span>{anime.type}</span>
                    {anime.eps && (
                      <>
                        <span>•</span>
                        <span>{anime.eps} eps</span>
                      </>
                    )}
                  </div>
                  {anime.genres && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {anime.genres.slice(0, 2).map((genre) => (
                        <Badge
                          key={genre}
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 bg-[#1a1a1a] border-white/10"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
