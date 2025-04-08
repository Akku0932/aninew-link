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
    const savedProgress = localStorage.getItem('watchProgress')
    if (savedProgress) {
      setContinueWatching(JSON.parse(savedProgress))
    }
  }, [])

  return (
    <div className="flex flex-col">
      {/* Spotlight Carousel */}
      <SpotlightCarousel />
      
      {/* Recently Watched - now positioned right below the spotlight */}
      <RecentlyWatched />
      
      {/* Trending Anime */}
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
