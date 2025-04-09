"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Play, Info, Star, Calendar, Clock, List, ChevronDown, Bookmark, Users, Heart, ExternalLink, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import AnimeMALButton from "@/components/anime-mal-button"
import AnimeMALStatus from "@/components/anime-mal-status"
import AnimeFavoriteButton from "@/components/anime-favorite-button"

// Update the types to match the API responses
type AnimeInfo = {
  info: {
    id?: string
    title?: string
    name?: string
    jname?: string
    image?: string
    img?: string
    cover?: string
    description?: string
    type?: string
    duration?: string
    sub?: number
    dub?: number
    eps?: number
    pg?: string
    quality?: string
    status?: string
    views?: number
    favorites?: number
    rate?: string
    anilistId?: string
    malId?: string
  }
  otherInfo: {
    japanese?: string
    synonyms?: string
    aired?: string
    premiered?: string
    duration?: string
    status?: string
    malScore?: string
    genres?: string[]
    studios?: string[]
    producers?: string[]
  }
  charactersAndVoiceActors?: any[]
}

type Episode = {
  title: string
  jtitle?: string
  episodeId: string
  number: number
  isFiller: boolean
}

type EpisodeResponse = {
  totalEpisodes: number
  episodes: Episode[]
}

type RelatedAnime = {
  id: string
  img: string
  name: string
  jname?: string
  type: string
  duration: string
  sub?: number
  dub?: number
  eps?: number
  rate?: number
}

type Season = {
  id: string
  img: string
  title: string
  otherTitle: string
}

// Update the component to fetch all required data
export default function AnimeInfoPage() {
  const { id } = useParams<{ id: string }>()

  const [animeInfo, setAnimeInfo] = useState<AnimeInfo | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [relatedAnime, setRelatedAnime] = useState<RelatedAnime[]>([])
  const [recommendedAnime, setRecommendedAnime] = useState<RelatedAnime[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("episodes")
  const [language, setLanguage] = useState<"EN" | "JP">("EN")
  const [showAllEpisodes, setShowAllEpisodes] = useState(false)

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem("preferredLanguage")
    if (savedLanguage === "JP" || savedLanguage === "EN") {
      setLanguage(savedLanguage)
    }
  }, [])

  // Add a separate effect for the language change listener
  useEffect(() => {
    // Listen for language change events from the header
    const handleLanguageChange = (event: CustomEvent<"EN" | "JP">) => {
      setLanguage(event.detail)
    }

    window.addEventListener('languageChange', handleLanguageChange as EventListener)

    // Clean up event listener
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener)
    }
  }, [])

  useEffect(() => {
    const fetchAnimeInfo = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`https://aninew-seven.vercel.app/info/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch anime info")
        }
        const data = await response.json()
        setAnimeInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    const fetchEpisodes = async () => {
      try {
        const response = await fetch(`https://aninew-seven.vercel.app/episodes/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch episodes")
        }
        const data = await response.json()
        if (data && data.episodes && Array.isArray(data.episodes)) {
          setEpisodes(data.episodes)
        } else {
          setEpisodes([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setEpisodes([])
      }
    }

    const fetchRelatedAnime = async () => {
      try {
        const response = await fetch(`http://aninew-seven.vercel.app/related/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch related anime")
        }
        const data = await response.json()
        setRelatedAnime(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching related anime:", err)
        setRelatedAnime([])
      }
    }

    const fetchRecommendedAnime = async () => {
      try {
        const response = await fetch(`https://aninew-seven.vercel.app/recommended/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch recommended anime")
        }
        const data = await response.json()
        setRecommendedAnime(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching recommended anime:", err)
        setRecommendedAnime([])
      }
    }

    const fetchSeasons = async () => {
      try {
        const response = await fetch(`https://aninew-seven.vercel.app/seasons/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch seasons")
        }
        const data = await response.json()
        setSeasons(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching seasons:", err)
        setSeasons([])
      }
    }

    fetchAnimeInfo()
    fetchEpisodes()
    fetchRelatedAnime()
    fetchRecommendedAnime()
    fetchSeasons()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6 dark:bg-gray-900 bg-gray-50 animate-pulse">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-[300px] h-[450px] rounded-lg dark:bg-gray-800 bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-8 w-3/4 rounded dark:bg-gray-800 bg-gray-200 mb-4"></div>
              <div className="h-4 w-1/2 rounded dark:bg-gray-800 bg-gray-200 mb-6"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 rounded dark:bg-gray-800 bg-gray-200"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !animeInfo) {
    return (
      <div className="min-h-screen p-4 md:p-6 dark:bg-gray-900 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-lg dark:bg-gray-800 bg-white p-8 text-center border dark:border-gray-700 border-gray-200">
            <Info className="h-12 w-12 mx-auto mb-4 dark:text-gray-400 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2 dark:text-white text-gray-900">
              {error || 'Anime not found'}
            </h2>
            <p className="dark:text-gray-400 text-gray-600 mb-6">
              We couldn't find the anime you're looking for.
            </p>
            <Button asChild variant="outline">
              <Link href="/search">Back to Search</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Normalize the data structure to handle different API response formats
  const info = animeInfo.info || {}
  const otherInfo = animeInfo.otherInfo || {}

  const title = language === "JP" && info.jname ? info.jname : info.name || info.title || "Unknown Anime"
  const image = info.img || info.image || "/placeholder.svg"
  const cover = info.cover || info.img || info.image || "/placeholder.svg"
  const description = info.description || ""
  const type = info.type || "TV"
  const status = otherInfo.status || info.status || "Unknown"
  const releaseDate = otherInfo.aired || otherInfo.premiered || "Unknown"
  const totalEpisodes = info.eps || episodes.length || 0
  const duration = info.duration || otherInfo.duration || "Unknown"
  const score = otherInfo.malScore ? Number.parseFloat(otherInfo.malScore) : 0
  const genres = otherInfo.genres || []

  // Limit episodes to 20 initially
  const displayedEpisodes = showAllEpisodes ? episodes : episodes.slice(0, 20)
  const hasMoreEpisodes = episodes.length > 20

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500'
    if (score >= 6) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="min-h-screen p-4 md:p-6 dark:bg-gray-900 bg-gray-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Left Column - Image and Quick Stats */}
          <div className="w-full md:w-[300px] space-y-4">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden border dark:border-gray-700 border-gray-200">
              <Image
                src={cover || "/placeholder.svg"}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
                priority
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/watch/${id}?ep=${episodes.length > 0 ? episodes[0]?.episodeId.split("?ep=")[1] : "1"}`}>
                      <Button variant="outline" className="w-full dark:bg-gray-800 bg-white">
                        <Play className="h-4 w-4 mr-2" />
                        Watch
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Start watching</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <AnimeFavoriteButton
                animeId={id as string}
                anilistId={info.anilistId}
                title={info.title || info.name || ""}
                image={info.image || info.img || ""}
                type={info.type}
                className="w-full"
              />
            </div>

            {/* Enhanced MyAnimeList Integration Panel */}
            <div className="rounded-lg dark:bg-gray-800 bg-white p-4 border dark:border-gray-700 border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 72 72"
                    className="mr-2"
                  >
                    <path fill="#1100ff" d="M48 16H24a8 8 0 0 0-8 8v24a8 8 0 0 0 8 8h24a8 8 0 0 0 8-8V24a8 8 0 0 0-8-8Z"/>
                    <path fill="#fff" d="M34 52h-6V20h6zm4-32h6v20l-6-3zm0 20 6 3v9h-6z"/>
                  </svg>
                  <h3 className="font-semibold dark:text-white text-gray-900">MyAnimeList</h3>
                </div>
                
                {info.malId && (
                  <a
                    href={`https://myanimelist.net/anime/${info.malId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-500 hover:underline flex items-center"
                  >
                    View on MAL
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                )}
              </div>
              
              {info.malId ? (
                <div className="space-y-3">
                  <AnimeMALStatus
                    animeId={id as string}
                    malId={info.malId}
                    title={info.title || ""}
                    showLabel={false}
                    className="w-full"
                    totalEpisodes={info.eps ? parseInt(info.eps) : 0}
                  />
                </div>
              ) : (
                <div className="text-sm dark:text-gray-400 text-gray-600 text-center py-2">
                  No MyAnimeList ID available for this anime
                </div>
              )}
            </div>

            <div className="rounded-lg dark:bg-gray-800 bg-white p-4 border dark:border-gray-700 border-gray-200">
              <h3 className="font-semibold mb-3 dark:text-white text-gray-900">Information</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="dark:text-gray-400 text-gray-600">Type</dt>
                  <dd className="dark:text-white text-gray-900">{type}</dd>
                </div>
                {info.eps && (
                  <div>
                    <dt className="dark:text-gray-400 text-gray-600">Episodes</dt>
                    <dd className="dark:text-white text-gray-900">{info.eps}</dd>
                  </div>
                )}
                {status && (
                  <div>
                    <dt className="dark:text-gray-400 text-gray-600">Status</dt>
                    <dd className="dark:text-white text-gray-900">{status}</dd>
                  </div>
                )}
                {releaseDate && (
                  <div>
                    <dt className="dark:text-gray-400 text-gray-600">Aired</dt>
                    <dd className="dark:text-white text-gray-900">{releaseDate}</dd>
                  </div>
                )}
                {info.duration && (
                  <div>
                    <dt className="dark:text-gray-400 text-gray-600">Duration</dt>
                    <dd className="dark:text-white text-gray-900">{info.duration}</dd>
                  </div>
                )}
                {otherInfo.studios && Array.isArray(otherInfo.studios) && otherInfo.studios.length > 0 && (
                  <div>
                    <dt className="dark:text-gray-400 text-gray-600">Studios</dt>
                    <dd className="dark:text-white text-gray-900">{otherInfo.studios.join(', ')}</dd>
                  </div>
                )}
              </dl>
            </div>

            {genres.length > 0 && (
              <div className="rounded-lg dark:bg-gray-800 bg-white p-4 border dark:border-gray-700 border-gray-200">
                <h3 className="font-semibold mb-3 dark:text-white text-gray-900">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white text-gray-900">
                {title}
              </h1>
              {language === "JP" && info.jname && (
                <p className="text-lg dark:text-gray-400 text-gray-600 mb-4">{info.jname}</p>
              )}

              {/* Description Section */}
              {info.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2 dark:text-white text-gray-900">Description</h2>
                  <p className="text-base dark:text-gray-300 text-gray-700 whitespace-pre-line">
                    {info.description}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-6 mb-6">
                {score > 0 && (
                  <div className="flex items-center">
                    <Star className={cn("h-5 w-5 mr-1", getScoreColor(score))} />
                    <span className="font-semibold dark:text-white text-gray-900">{score}</span>
                  </div>
                )}
                {info.views && (
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-1 dark:text-gray-400 text-gray-600" />
                    <span className="dark:text-white text-gray-900">{formatNumber(info.views)} views</span>
                  </div>
                )}
                {info.favorites && (
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 mr-1 text-pink-500" />
                    <span className="dark:text-white text-gray-900">{formatNumber(info.favorites)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mb-8">
                {info.sub !== null && (
                  <Badge variant="secondary" className="text-sm">SUB: EP {info.sub}</Badge>
                )}
                {info.dub !== null && (
                  <Badge variant="secondary" className="text-sm">DUB: EP {info.dub}</Badge>
                )}
                {info.rate && (
                  <Badge variant="outline" className="text-sm">{info.rate}</Badge>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b dark:border-gray-700 border-gray-200 mb-6">
              <div className="flex space-x-8">
                {(['episodes', 'related', 'recommended'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "pb-4 text-sm font-medium capitalize transition-colors relative",
                      activeTab === tab
                        ? "dark:text-white text-gray-900 border-b-2 dark:border-white border-gray-900"
                        : "dark:text-gray-400 text-gray-600 hover:dark:text-gray-300 hover:text-gray-700"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'episodes' && (
                <>
                  <div className="rounded-lg dark:bg-gray-800 bg-white p-6 border dark:border-gray-700 border-gray-200">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {displayedEpisodes.length > 0 ? (
                        displayedEpisodes.map((episode) => (
                          <Link
                            key={episode.episodeId}
                            href={`/watch/${id}?ep=${episode.episodeId.split("?ep=")[1]}`}
                            className="flex flex-col overflow-hidden rounded-lg border border-gray-800 bg-gray-900 transition-transform hover:scale-[1.02] hover:bg-gray-800"
                          >
                            <div className="p-3 text-center">
                              <div className="text-lg font-bold text-white">{episode.number}</div>
                              <div className="mt-1 text-xs text-gray-400 line-clamp-1">
                                {episode.title || `Episode ${episode.number}`}
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="col-span-full rounded-lg bg-gray-900 p-4 text-center">
                          <p className="text-gray-400">No episodes found</p>
                        </div>
                      )}
                    </div>

                    {hasMoreEpisodes && (
                      <div className="mt-4 flex justify-center">
                        <Button variant="outline" onClick={() => setShowAllEpisodes(!showAllEpisodes)} className="gap-2">
                          {showAllEpisodes ? "Show Less" : "Load More"}
                          <ChevronDown className={`h-4 w-4 transition-transform ${showAllEpisodes ? "rotate-180" : ""}`} />
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'related' && (
                <div className="rounded-lg dark:bg-gray-800 bg-white p-6 border dark:border-gray-700 border-gray-200">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {relatedAnime.length > 0 ? (
                      relatedAnime.map((anime, index) => (
                        <Link
                          key={`related-${anime.id}-${index}`}
                          href={`/info/${anime.id}`}
                          className="group flex flex-col overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
                        >
                          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                            <Image
                              src={anime.img || "/placeholder.svg?height=300&width=200"}
                              alt={anime.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                          </div>
                          <div className="mt-2">
                            <h3 className="font-medium text-white line-clamp-2">{anime.name}</h3>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                              <span>{anime.type}</span>
                              {anime.eps && (
                                <>
                                  <span>•</span>
                                  <span>{anime.eps} Episodes</span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="col-span-full rounded-lg bg-gray-900 p-4 text-center">
                        <p className="text-gray-400">No related anime found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'recommended' && (
                <div className="rounded-lg dark:bg-gray-800 bg-white p-6 border dark:border-gray-700 border-gray-200">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {recommendedAnime.length > 0 ? (
                      recommendedAnime.map((anime, index) => (
                        <Link
                          key={`recommended-${anime.id}-${index}`}
                          href={`/info/${anime.id}`}
                          className="group flex flex-col overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
                        >
                          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                            <Image
                              src={anime.img || "/placeholder.svg?height=300&width=200"}
                              alt={anime.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                          </div>
                          <div className="mt-2">
                            <h3 className="font-medium text-white line-clamp-2">{anime.name}</h3>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                              <span>{anime.type}</span>
                              {anime.eps && (
                                <>
                                  <span>•</span>
                                  <span>{anime.eps} Episodes</span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="col-span-full rounded-lg bg-gray-900 p-4 text-center">
                        <p className="text-gray-400">No recommended anime found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

