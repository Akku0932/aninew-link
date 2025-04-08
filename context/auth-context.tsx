"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type AnimeItem = {
  id: string
  title: string
  image: string
  anilistId?: number
}

export type User = {
  id: string
  name: string
  avatar?: string
  provider: "anilist"
  anilistToken: string
  favorites: AnimeItem[]
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loginWithAniList: (code: string) => Promise<void>
  logout: () => void
  addToFavorites: (anime: AnimeItem) => Promise<void>
  removeFromFavorites: (animeId: string) => Promise<void>
  isFavorite: (animeId: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ANILIST_CLIENT_ID = "25870"
const ANILIST_REDIRECT_URI = "https://aninew-link.vercel.app/auth/callback"

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  // Function to exchange authorization code for access token
  const getAccessToken = async (code: string): Promise<string> => {
    try {
      const response = await fetch("https://anilist.co/api/v2/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: ANILIST_CLIENT_ID,
          redirect_uri: ANILIST_REDIRECT_URI,
          code: code,
        }),
      })

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`)
      }

      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error("Error getting access token:", error)
      throw error
    }
  }

  // Function to get user profile from AniList
  const getUserProfile = async (token: string): Promise<any> => {
    const query = `
      query {
        Viewer {
          id
          name
          avatar {
            large
          }
        }
      }
    `

    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error(`Profile request failed: ${response.status}`)
      }

      const data = await response.json()
      return data.data.Viewer
    } catch (error) {
      console.error("Error getting user profile:", error)
      throw error
    }
  }

  // Function to get user's favorite anime from AniList
  const getUserFavorites = async (token: string): Promise<AnimeItem[]> => {
    const query = `
      query {
        Viewer {
          favourites {
            anime {
              nodes {
                id
                title {
                  romaji
                  english
                }
                coverImage {
                  large
                }
              }
            }
          }
        }
      }
    `

    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error(`Favorites request failed: ${response.status}`)
      }

      const data = await response.json()
      const favoriteAnime = data.data.Viewer.favourites.anime.nodes

      return favoriteAnime.map((anime: any) => ({
        id: anime.id.toString(),
        title: anime.title.english || anime.title.romaji,
        image: anime.coverImage.large,
        anilistId: parseInt(anime.id),
      }))
    } catch (error) {
      console.error("Error getting user favorites:", error)
      return []
    }
  }

  // Function to toggle favorite status on AniList
  const toggleAniListFavorite = async (
    mediaId: number,
    add: boolean,
    token: string
  ): Promise<boolean> => {
    const query = `
      mutation ($mediaId: Int) {
        ToggleFavourite(animeId: $mediaId) {
          anime {
            nodes {
              id
            }
          }
        }
      }
    `

    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query,
          variables: {
            mediaId,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Favorite toggle failed: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error(`Error ${add ? "adding" : "removing"} favorite:`, error)
      return false
    }
  }

  const loginWithAniList = async (code: string): Promise<void> => {
    setIsLoading(true)
    try {
      // Exchange code for token
      const token = await getAccessToken(code)
      
      // Get user profile
      const profile = await getUserProfile(token)
      
      // Get user favorites
      const favorites = await getUserFavorites(token)

      // Create user object
      const newUser: User = {
        id: profile.id.toString(),
        name: profile.name,
        avatar: profile.avatar?.large,
        provider: "anilist",
        anilistToken: token,
        favorites,
      }

      // Update state and save to localStorage
      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
    } catch (error) {
      console.error("AniList login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = (): void => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const addToFavorites = async (anime: AnimeItem): Promise<void> => {
    if (!user || !anime.anilistId) return

    try {
      // First update AniList if possible
      if (anime.anilistId) {
        const success = await toggleAniListFavorite(
          anime.anilistId,
          true,
          user.anilistToken
        )
        
        if (!success) {
          throw new Error("Failed to add to AniList favorites")
        }
      }

      // Then update local state
      const updatedFavorites = [...user.favorites, anime]
      const updatedUser = { ...user, favorites: updatedFavorites }
      
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Error adding to favorites:", error)
    }
  }

  const removeFromFavorites = async (animeId: string): Promise<void> => {
    if (!user) return

    try {
      const animeToRemove = user.favorites.find(item => item.id === animeId)
      
      // First update AniList if possible
      if (animeToRemove?.anilistId) {
        const success = await toggleAniListFavorite(
          animeToRemove.anilistId,
          false,
          user.anilistToken
        )
        
        if (!success) {
          throw new Error("Failed to remove from AniList favorites")
        }
      }

      // Then update local state
      const updatedFavorites = user.favorites.filter(
        (item) => item.id !== animeId
      )
      const updatedUser = { ...user, favorites: updatedFavorites }
      
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Error removing from favorites:", error)
    }
  }

  const isFavorite = (animeId: string): boolean => {
    return user?.favorites.some((item) => item.id === animeId) || false
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    loginWithAniList,
    logout,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}