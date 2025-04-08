"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export interface AnimeItem {
  id: string
  title: string
  image: string
  type?: string
  anilistId?: string
}

export interface UserSettings {
  theme: "light" | "dark" | "system"
  autoplay: boolean
  quality: "auto" | "360p" | "480p" | "720p" | "1080p"
  notifications: boolean
  hideSpoilers: boolean
  language: string
}

export interface User {
  id: string
  username: string
  avatar?: string
  favorites: AnimeItem[]
  anilistToken?: string
  anilistId?: string
  settings: UserSettings
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loginWithAnilist: () => void
  loginWithAniList: (code: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isFavorite: (animeId: string) => boolean
  addToFavorites: (anime: AnimeItem) => Promise<void>
  removeFromFavorites: (animeId: string) => Promise<void>
  updateUserSettings: (settings: Partial<UserSettings>) => void
  updateUserProfile: (profile: Partial<Pick<User, "username" | "avatar">>) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  loginWithAnilist: () => {},
  loginWithAniList: async () => {},
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isFavorite: () => false,
  addToFavorites: async () => {},
  removeFromFavorites: async () => {},
  updateUserSettings: () => {},
  updateUserProfile: () => {}
})

export const useAuth = () => useContext(AuthContext)

const defaultSettings: UserSettings = {
  theme: "system",
  autoplay: true,
  quality: "auto",
  notifications: true,
  hideSpoilers: false,
  language: "en"
}

interface AniListAnime {
  id: number
  title: {
    english: string | null
    romaji: string
  }
  coverImage: {
    large: string
  }
  type: string
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if we have a token in the URL (AniList callback)
    const checkAniListAuth = () => {
      if (typeof window === "undefined") return
      
      const urlParams = new URLSearchParams(window.location.search)
      const accessToken = urlParams.get("access_token")
      const tokenType = urlParams.get("token_type")
      const expiresIn = urlParams.get("expires_in")
      
      if (accessToken && tokenType && expiresIn) {
        // We have a successful AniList auth
        fetchAniListUser(accessToken)
          .then(userData => {
            if (userData) {
              // Get existing user data from localStorage if it exists
              const existingUserData = localStorage.getItem("user")
              let existingUser: User | null = null
              
              if (existingUserData) {
                try {
                  existingUser = JSON.parse(existingUserData)
                } catch (e) {
                  console.error("Failed to parse existing user data:", e)
                }
              }
              
              // Create or update user
              const newUser: User = {
                id: userData.id.toString(),
                username: userData.name,
                avatar: userData.avatar?.large,
                favorites: existingUser?.favorites || [],
                anilistToken: accessToken,
                anilistId: userData.id.toString(),
                settings: existingUser?.settings || defaultSettings
              }
              
              setUser(newUser)
              localStorage.setItem("user", JSON.stringify(newUser))
              
              // Sync favorites with AniList
              syncFavoritesWithAniList(newUser)
              
              // Clear URL parameters
              const returnUrl = urlParams.get("returnUrl") || "/"
              window.history.replaceState({}, document.title, returnUrl)
            }
          })
          .catch(error => {
            console.error("Error fetching AniList user:", error)
          })
          .finally(() => {
            setIsLoading(false)
          })
      } else {
        // Try to load user from localStorage
        const userData = localStorage.getItem("user")
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
            
            // If we have an AniList token, verify it's still valid
            if (parsedUser.anilistToken) {
              verifyAniListToken(parsedUser.anilistToken)
                .then(isValid => {
                  if (!isValid) {
                    // Token is invalid, remove it
                    const updatedUser = {
                      ...parsedUser,
                      anilistToken: undefined,
                      anilistId: undefined
                    }
                    setUser(updatedUser)
                    localStorage.setItem("user", JSON.stringify(updatedUser))
                  }
                })
                .catch(() => {
                  // On error, assume token is invalid
                  const updatedUser = {
                    ...parsedUser,
                    anilistToken: undefined,
                    anilistId: undefined
                  }
                  setUser(updatedUser)
                  localStorage.setItem("user", JSON.stringify(updatedUser))
                })
            }
          } catch (e) {
            console.error("Failed to parse user data:", e)
          }
        }
        setIsLoading(false)
      }
    }
    
    checkAniListAuth()
  }, [])

  const fetchAniListUser = async (token: string) => {
    const query = `
      query {
        Viewer {
          id
          name
          avatar {
            large
            medium
          }
        }
      }
    `
    
    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      })
      
      const data = await response.json()
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }
      
      return data.data.Viewer
    } catch (error) {
      console.error("Error fetching AniList user:", error)
      return null
    }
  }
  
  const verifyAniListToken = async (token: string) => {
    try {
      const userData = await fetchAniListUser(token)
      return !!userData
    } catch (error) {
      return false
    }
  }
  
  const syncFavoritesWithAniList = async (user: User) => {
    if (!user.anilistToken || !user.anilistId) return
    
    try {
      // Fetch favorites from AniList
      const anilistFavorites = await fetchAniListFavorites(user.anilistToken)
      
      // Merge favorites with local favorites
      if (anilistFavorites && anilistFavorites.length > 0) {
        const mergedFavorites = [...user.favorites]
        
        anilistFavorites.forEach((anilistAnime: AniListAnime) => {
          // Check if this AniList favorite exists in our local list
          const existingIndex = mergedFavorites.findIndex(
            local => local.anilistId === anilistAnime.id.toString()
          )
          
          if (existingIndex === -1) {
            // Add this AniList favorite to our local list
            mergedFavorites.push({
              id: `al-${anilistAnime.id}`, // Prefix for AniList-sourced IDs
              anilistId: anilistAnime.id.toString(),
              title: anilistAnime.title.english || anilistAnime.title.romaji,
              image: anilistAnime.coverImage.large,
              type: anilistAnime.type
            })
          }
        })
        
        // Update user
        const updatedUser = {
          ...user,
          favorites: mergedFavorites
        }
        
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error("Error syncing favorites with AniList:", error)
    }
  }
  
  const fetchAniListFavorites = async (token: string) => {
    const query = `
      query {
        Viewer {
          favourites {
            anime {
              nodes {
                id
                title {
                  english
                  romaji
                }
                coverImage {
                  large
                }
                type
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
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      })
      
      const data = await response.json()
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }
      
      return data.data.Viewer.favourites.anime.nodes
    } catch (error) {
      console.error("Error fetching AniList favorites:", error)
      return []
    }
  }
  
  const toggleAniListFavorite = async (anilistId: string, add: boolean) => {
    if (!user?.anilistToken) return
    
    const query = `
      mutation ($animeId: Int, $add: Boolean) {
        ToggleFavourite(animeId: $animeId, add: $add) {
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
          "Accept": "application/json",
          "Authorization": `Bearer ${user.anilistToken}`
        },
        body: JSON.stringify({
          query,
          variables: {
            animeId: parseInt(anilistId),
            add
          }
        })
      })
      
      const data = await response.json()
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }
      
      return true
    } catch (error) {
      console.error(`Error ${add ? "adding" : "removing"} AniList favorite:`, error)
      return false
    }
  }

  const loginWithAnilist = () => {
    const clientId = "25870" // Match the client ID used in the login form
    const redirectUri = `${window.location.origin}/auth/callback`
    
    // AniList OAuth URL - use response_type=code to match the callback handler
    const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`
    
    window.location.href = authUrl
  }
  
  const loginWithAniList = async (code: string) => {
    setIsLoading(true)
    
    try {
      // Exchange the authorization code for a token
      // This would typically be done on a backend service to keep the client secret secure
      // For this frontend-only implementation, we'll simulate a successful exchange
      
      // Simulate a token response
      const tokenResponse = {
        access_token: `simulated_token_${Date.now()}`,
        token_type: "Bearer",
        expires_in: 3600
      }
      
      // Now use this token to fetch the user's profile
      const userData = await fetchAniListUser(tokenResponse.access_token)
      
      if (userData) {
        // Get existing user data from localStorage if it exists
        const existingUserData = localStorage.getItem("user")
        let existingUser: User | null = null
        
        if (existingUserData) {
          try {
            existingUser = JSON.parse(existingUserData)
          } catch (e) {
            console.error("Failed to parse existing user data:", e)
          }
        }
        
        // Create or update user
        const newUser: User = {
          id: userData.id.toString(),
          username: userData.name,
          avatar: userData.avatar?.large,
          favorites: existingUser?.favorites || [],
          anilistToken: tokenResponse.access_token,
          anilistId: userData.id.toString(),
          settings: existingUser?.settings || defaultSettings
        }
        
        setUser(newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
        
        // Sync favorites with AniList
        await syncFavoritesWithAniList(newUser)
      } else {
        throw new Error("Failed to fetch user data from AniList")
      }
    } catch (error) {
      console.error("Error in AniList authentication:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    // In a real application, this would validate against a backend
    // For this demo, we'll accept any credentials and create a local user
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Create a user ID from the email
      const userId = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`
      
      // Load existing user if this email has been used before
      const existingUsers = JSON.parse(localStorage.getItem('users') || '{}')
      
      if (existingUsers[email]) {
        // Validate password
        if (existingUsers[email].password !== password) {
          throw new Error("Invalid password")
        }
        
        // Create user object from stored data
        const userData = existingUsers[email]
        const user: User = {
          id: userId,
          username: userData.name,
          avatar: userData.avatar,
          favorites: userData.favorites || [],
          settings: userData.settings || defaultSettings
        }
        
        setUser(user)
        localStorage.setItem("user", JSON.stringify(user))
      } else {
        throw new Error("User not found. Please register first.")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }
  
  const register = async (name: string, email: string, password: string) => {
    // In a real application, this would register with a backend
    // For this demo, we'll store the user in localStorage
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Check if the email is already registered
      const existingUsers = JSON.parse(localStorage.getItem('users') || '{}')
      
      if (existingUsers[email]) {
        throw new Error("Email already registered")
      }
      
      // Create user ID from email
      const userId = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`
      
      // Store the new user
      existingUsers[email] = {
        name,
        password,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
        favorites: [],
        settings: { ...defaultSettings }
      }
      
      localStorage.setItem('users', JSON.stringify(existingUsers))
      
      // Return success but don't login automatically
      return
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/")
  }

  const isFavorite = (animeId: string) => {
    if (!user) return false
    return user.favorites.some(anime => anime.id === animeId)
  }

  const addToFavorites = async (anime: AnimeItem) => {
    if (!user) return
    
    // First check if this anime is already in favorites
    if (isFavorite(anime.id)) return
    
    // If this anime has an AniList ID and user is connected to AniList
    if (anime.anilistId && user.anilistToken) {
      // Add to AniList favorites
      const success = await toggleAniListFavorite(anime.anilistId, true)
      if (!success) {
        throw new Error("Failed to add to AniList favorites")
      }
    }
    
    // Update local state
    const updatedFavorites = [...user.favorites, anime]
    const updatedUser = { ...user, favorites: updatedFavorites }
    
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  const removeFromFavorites = async (animeId: string) => {
    if (!user) return
    
    const animeToRemove = user.favorites.find(a => a.id === animeId)
    if (!animeToRemove) return
    
    // If this anime has an AniList ID and user is connected to AniList
    if (animeToRemove.anilistId && user.anilistToken) {
      // Remove from AniList favorites
      const success = await toggleAniListFavorite(animeToRemove.anilistId, false)
      if (!success) {
        throw new Error("Failed to remove from AniList favorites")
      }
    }
    
    // Update local state
    const updatedFavorites = user.favorites.filter(anime => anime.id !== animeId)
    const updatedUser = { ...user, favorites: updatedFavorites }
    
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }
  
  const updateUserSettings = (settings: Partial<UserSettings>) => {
    if (!user) return
    
    const updatedSettings = { ...user.settings, ...settings }
    const updatedUser = { ...user, settings: updatedSettings }
    
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }
  
  const updateUserProfile = (profile: Partial<Pick<User, "username" | "avatar">>) => {
    if (!user) return
    
    const updatedUser = { ...user, ...profile }
    
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
        isLoading,
        loginWithAnilist,
        loginWithAniList,
        login,
        register,
        logout,
        isFavorite,
        addToFavorites,
        removeFromFavorites,
        updateUserSettings,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
} 