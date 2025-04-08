'use client';

import SpotlightCarousel from "@/components/new-spotlight-carousel"
import RecentlyWatched from "@/components/recently-watched"
import TrendingAnime from "@/components/trending-anime"
import LatestEpisodes from "@/components/latest-episodes"
import TopTenAnime from "@/components/top-ten-anime"
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface WatchProgress {
  animeId: string;
  episodeId: string;
  image: string;
  title: string;
  episodeNumber: number;
  timestamp: number;
}

export default function Home() {
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([])

  // Load continue watching data
  useEffect(() => {
    const loadWatchProgress = () => {
      try {
        const savedProgress = localStorage.getItem('watchProgress')
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress)
          setContinueWatching(Array.isArray(parsed) ? parsed : [])
        }
      } catch (error) {
        console.error("Error loading watch progress:", error)
        setContinueWatching([])
      }
    }

    // Initial load
    loadWatchProgress()

    // Listen for storage events to update when changes occur
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'watchProgress') {
        loadWatchProgress()
      }
    }

    // Also listen for custom storage event for cross-tab updates
    const handleCustomStorageChange = () => {
      loadWatchProgress()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('watchProgressUpdated', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('watchProgressUpdated', handleCustomStorageChange)
    }
  }, [])

  return (
    <div className="flex flex-col">
      <SpotlightCarousel />
      {continueWatching.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Continue Watching</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {continueWatching.map((item) => (
              <Link
                key={`${item.animeId}-${item.episodeId}`}
                href={`/watch/${item.animeId}?ep=${item.episodeId}`}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="aspect-[2/3]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-sm font-medium line-clamp-2 mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-300">Episode {item.episodeNumber}</p>
                  <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600"
                      style={{ width: `${Math.min((item.timestamp / 1400) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      <RecentlyWatched />
      <TrendingAnime />
      <div className="grid grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <LatestEpisodes />
        </div>
        <div>
          <TopTenAnime />
        </div>
      </div>
    </div>
  )
}
