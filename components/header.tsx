"use client"

import type React from "react"

import { Search, Moon, Sun, X, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useTheme } from "@/components/theme-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import Logo from "@/components/logo"
import { useAuth } from "@/context/auth-context"

type SearchResult = {
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
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState<"EN" | "JP">("EN")
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    setMounted(true)

    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem("preferredLanguage")
    if (savedLanguage === "JP" || savedLanguage === "EN") {
      setLanguage(savedLanguage)
    }
  }, [])

  // Custom hook for click outside
  const handleClickOutside = () => setShowResults(false)
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        handleClickOutside()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        fetchSearchResults(searchQuery)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) return

    try {
      setIsSearching(true)
      const response = await fetch(`https://aninew-seven.vercel.app/search?keyword=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error("Failed to fetch search results")
      }
      const data = await response.json()
      setSearchResults(data.results ? data.results.slice(0, 5) : [])
      setShowResults(true)
    } catch (error) {
      console.error("Error fetching search results:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchQuery)}`)
      setShowResults(false)
    }
  }

  const handleResultClick = (id: string) => {
    router.push(`/info/${id}`)
    setShowResults(false)
    setSearchQuery("")
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowResults(false)
    inputRef.current?.focus()
  }

  const toggleLanguage = () => {
    const newLanguage = language === "EN" ? "JP" : "EN"
    setLanguage(newLanguage)
    localStorage.setItem("preferredLanguage", newLanguage)
    // Dispatch a custom event that other components can listen for
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLanguage }))
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    // Dispatch a custom event that other components can listen for
    window.dispatchEvent(new CustomEvent('themeChange', { detail: newTheme }))
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-300 dark:border-gray-800 bg-white dark:bg-black transition-colors duration-300 px-4 md:px-6">
      <div className="flex items-center">
        <Link href="/" className="mr-6 flex items-center">
          <Logo size="medium" withLink={false} className="hover:scale-105 transition-transform duration-200" />
        </Link>
      </div>

      <div ref={searchRef} className="relative flex-1 max-w-md mx-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            placeholder="Search anime..."
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-900 pl-9 pr-8 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-gray-700 dark:focus-visible:ring-gray-700 focus-visible:ring-0 transition-colors duration-300"
            onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-200 dark:hover:text-gray-200 hover:text-gray-700 transition-colors duration-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {showResults && (
          <div className="absolute mt-1 w-full rounded-md bg-gray-900 dark:bg-gray-900 bg-white shadow-lg z-50 transition-colors duration-300">
            {isSearching ? (
              <div className="p-4 text-center text-gray-400 dark:text-gray-400 text-gray-600 transition-colors duration-300">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-500 border-t-white dark:border-gray-500 dark:border-t-white border-gray-300 border-t-black transition-colors duration-300"></div>
                <span className="ml-2">Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="max-h-96 overflow-auto py-2 scrollbar-thin">
                {searchResults.map((result) => (
                  <li key={result.id} className="px-2">
                    <button
                      className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-gray-800 dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors duration-300"
                      onClick={() => handleResultClick(result.id)}
                    >
                      <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded">
                        <Image
                          src={result.img}
                          alt={result.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white line-clamp-1 transition-colors duration-300">{result.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">{result.type}</p>
                      </div>
                    </button>
                  </li>
                ))}
                <li className="mt-2 border-t border-gray-200 dark:border-gray-800 pt-2 transition-colors duration-300">
                  <button
                    className="flex w-full items-center justify-center gap-1 p-2 text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors duration-300"
                    onClick={handleSearch}
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>View all results for "{searchQuery}"</span>
                  </button>
                </li>
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-400 dark:text-gray-400 text-gray-600 transition-colors duration-300">No results found for "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={toggleLanguage}
          title={`Switch to ${language === "EN" ? "Japanese" : "English"}`}
        >
          <div className="flex items-center justify-center rounded-md border border-gray-800 dark:border-gray-800 border-gray-300 px-2 py-1 transition-colors duration-300">
            <span className="text-sm font-medium text-red-500">{language}</span>
          </div>
          <span className="sr-only">Toggle language</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={toggleTheme}
        >
          {mounted && theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors duration-300">
                <span className="flex h-full w-full items-center justify-center">
                  <span className="text-sm font-medium text-primary">{user?.name.charAt(0).toUpperCase()}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="default" size="sm" className="text-sm bg-primary">
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
