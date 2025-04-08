"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Clock, Calendar, Film, Filter, Sparkles, AlertCircle } from "lucide-react"

type EpisodeItem = {
  id: string
  img: string
  name: string
  type: string
  duration: string
  sub: number | null
  dub: number | null
  eps: number
  releaseDate?: string
  raw?: boolean
}

export default function LatestEpisodes() {
  const [latestEpisodes, setLatestEpisodes] = useState<EpisodeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'sub' | 'dub'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 16

  useEffect(() => {
    const fetchLatestEpisodes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://aninew-seven.vercel.app/recently-updated")
        if (!response.ok) {
          throw new Error("Failed to fetch latest episodes")
        }
        const data = await response.json()
        
        // Add mock release dates if not provided
        const enhancedData = Array.isArray(data) ? data.map(episode => ({
          ...episode,
          releaseDate: episode.releaseDate || `${new Date().getMonth() + 1}/${new Date().getDate()}/${new Date().getFullYear()}`
        })) : []
        
        setLatestEpisodes(enhancedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setLatestEpisodes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLatestEpisodes()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-800 dark:bg-gray-800 bg-gray-300"></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-video animate-pulse rounded-lg bg-gray-800 dark:bg-gray-800 bg-gray-300"></div>
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-800 dark:bg-gray-800 bg-gray-300"></div>
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-800 dark:bg-gray-800 bg-gray-300"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || latestEpisodes.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <h2 className="mb-2 text-xl md:text-2xl font-bold text-black dark:text-white transition-colors duration-300">Latest Episodes</h2>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 transition-colors duration-300">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p>Failed to load latest episodes</p>
        </div>
      </div>
    )
  }

  // Filter episodes based on selected filter
  const filteredEpisodes = latestEpisodes.filter(episode => {
    if (filter === 'all') return true
    if (filter === 'sub') return episode.sub !== null
    if (filter === 'dub') return episode.dub !== null
    return true
  })

  // Paginate the filtered episodes
  const paginatedEpisodes = filteredEpisodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculate total pages
  const totalPages = Math.ceil(filteredEpisodes.length / itemsPerPage)

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white transition-colors duration-300">Latest Episodes</h2>
        </div>
        
        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 dark:text-gray-400 text-gray-600 transition-colors duration-300">Filter:</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-800 dark:border-gray-800 border-gray-300 transition-colors duration-300">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                filter === 'all' ? 'bg-red-500 text-white' : 'dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('sub')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                filter === 'sub' ? 'bg-red-500 text-white' : 'dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sub
            </button>
            <button 
              onClick={() => setFilter('dub')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                filter === 'dub' ? 'bg-red-500 text-white' : 'dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Dub
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedEpisodes.map((episode) => (
          <div key={episode.id} className="relative group">
            <div className="overflow-visible"> {/* Wrapper to contain the tooltip */}
              <Link
                href={`/watch/${episode.id}?ep=${episode.sub || episode.dub || 1}`}
                className="block relative flex flex-col overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:translate-y-[-4px]"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-900">
                  <Image
                    src={episode.img || "/placeholder.svg?height=200&width=300"}
                    alt={episode.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  
                  {/* Overlay gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 transition-opacity group-hover:opacity-80"></div>
                  
                  {/* Episode type badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className={`rounded px-2 py-0.5 text-xs font-bold text-white ${
                      episode.raw ? 'bg-red-500' :
                      episode.dub ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}>
                      {episode.raw ? 'RAW' :
                       episode.dub ? 'DUB' : 'SUB'}
                    </span>
                  </div>
                  
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/80 opacity-0 transform scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
                      <Play className="h-6 w-6 text-white" fill="white" />
                    </div>
                  </div>
                  
                  {/* Episode number */}
                  <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    EP {episode.sub || episode.dub || 1}
                  </div>
                </div>
                
                {/* Basic info - always visible */}
                <div className="mt-2 space-y-1">
                  <h3 className="font-medium text-black dark:text-white line-clamp-2 group-hover:text-red-400 transition-colors duration-300">
                    {episode.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    <div className="flex items-center gap-1">
                      <Film className="h-3 w-3 text-gray-500" />
                      <span>{episode.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-500" />
                      <span>{episode.duration}</span>
                    </div>
                    {episode.releaseDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span>{episode.releaseDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
              
              {/* Tooltip popup - bottom left corner aligns with card's top right */}
              <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute z-50 w-72 bg-gray-900/95 backdrop-blur-md rounded-lg p-4 border border-gray-800 shadow-lg shadow-black/30 transition-all duration-200 origin-bottom-left"
                   style={{
                     bottom: 'calc(100% - 5px)',  /* Adjusted since we removed the NEW badge */
                     left: 'calc(100% - 5px)'      /* Slight overlap for visual connection */
                   }}>
                {/* Arrow pointing to the card */}
                <div className="absolute bottom-[-8px] left-[8px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-gray-900/95"></div>
                
                {/* Status indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-[10px] text-gray-400 font-medium">LATEST</span>
                </div>
                
                <div className="flex gap-3">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 shadow-md">
                    <Image
                      src={episode.img || "/placeholder.svg?height=80&width=80"}
                      alt={episode.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-1 right-1 bg-red-600/90 text-[10px] text-white px-1 rounded-sm font-medium">HD</div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white line-clamp-1">{episode.name}</h4>
                    <div className="mt-1 flex items-center flex-wrap gap-1 text-xs">
                      <span className="inline-block px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded text-[10px] font-medium">{episode.type}</span>
                      <span className="text-gray-400">EP {episode.sub || episode.dub || 1}</span>
                    </div>
                    
                    {/* Additional info rows */}
                    <div className="mt-2 space-y-1 text-[11px]">
                      <div className="flex justify-between text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {episode.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {episode.releaseDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded-sm text-[10px]">Action</span>
                  <span className="px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded-sm text-[10px]">Adventure</span>
                  <span className="px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded-sm text-[10px]">Fantasy</span>
                </div>
                
                {/* Synopsis */}
                <div className="mt-2 text-[11px] text-gray-400 line-clamp-2">
                  Follow the incredible adventures as our hero discovers hidden powers and faces formidable enemies in this epic tale.
                </div>
                
                {/* Buttons */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/info/${episode.id}`;
                    }}
                    className="w-full py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-xs font-medium text-white transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/watch/${episode.id}?ep=${episode.sub || episode.dub || 1}`;
                    }}
                    className="w-full py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-xs font-medium text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <Play className="h-3 w-3" /> Watch
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4L6 8L10 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentPage === page 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4L10 8L6 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

