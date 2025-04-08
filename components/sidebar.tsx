"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, Menu, X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"

type CategoryProps = {
  title: string
  items: { name: string; href: string }[]
  defaultOpen?: boolean
}

function Category({ title, items, defaultOpen = false }: CategoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-black dark:text-white transition-colors duration-300"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="mt-1 space-y-1">
          {items.map((item) => (
            <Link key={item.name} href={item.href} className="block px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-800 text-black dark:text-white transition-colors duration-300">
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // For mobile: show a button to toggle the sidebar
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full bg-red-600 shadow-lg hover:bg-red-700"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {isOpen && (
          <aside className="fixed inset-0 z-40 w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-y-auto transition-colors duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-black dark:text-white transition-colors duration-300">Menu</h2>
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="h-full overflow-y-auto py-4 scrollbar-cool">
              <Category
                title="DISCOVER"
                defaultOpen={true}
                items={[
                  { name: "Home", href: "/" },
                  { name: "Movie", href: "/category/movie" },
                  { name: "TV Series", href: "/category/tv" },
                  { name: "Schedule", href: "/schedule" },
                  { name: "Read Manga", href: "/manga" },
                ]}
              />
              <div className="mx-4 my-2 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300"></div>
              <Category
                title="CATEGORY"
                defaultOpen={true}
                items={[
                  { name: "Latest Episodes", href: "/latest-episode" },
                  { name: "New on ANINEW", href: "/new" },
                  { name: "Subbed Anime", href: "/subbed" },
                  { name: "Dubbed Anime", href: "/dubbed" },
                  { name: "Most Popular", href: "/most-popular" },
                  { name: "Most Favorite", href: "/most-favorite" },
                  { name: "Latest Completed", href: "/latest-completed" },
                  { name: "Top Airing", href: "/top-airing" },
                  { name: "Top Upcoming", href: "/top-upcoming" },
                ]}
              />
            </div>
          </aside>
        )}
      </>
    )
  }

  // For desktop: show the sidebar normally
  return (
    <aside className="hidden md:block w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black transition-colors duration-300">
      <div className="h-full overflow-y-auto py-4 scrollbar-cool">
        <Category
          title="DISCOVER"
          defaultOpen={true}
          items={[
            { name: "Home", href: "/" },
            { name: "Movie", href: "/category/movie" },
            { name: "TV Series", href: "/category/tv" },
            { name: "Schedule", href: "/schedule" },
            { name: "Read Manga", href: "/manga" },
          ]}
        />
        <div className="mx-4 my-2 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300"></div>
        <Category
          title="CATEGORY"
          defaultOpen={true}
          items={[
            { name: "Latest Episodes", href: "/latest-episode" },
            { name: "New on ANINEW", href: "/new" },
            { name: "Subbed Anime", href: "/subbed" },
            { name: "Dubbed Anime", href: "/dubbed" },
            { name: "Most Popular", href: "/most-popular" },
            { name: "Most Favorite", href: "/most-favorite" },
            { name: "Latest Completed", href: "/latest-completed" },
            { name: "Top Airing", href: "/top-airing" },
            { name: "Top Upcoming", href: "/top-upcoming" },
          ]}
        />
      </div>
    </aside>
  )
}

