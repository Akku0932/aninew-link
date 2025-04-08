"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  name: string
  email: string
  avatarUrl?: string
  provider?: "email" | "anilist"
  favorites?: AnimeItem[]
}

type AnimeItem = {
  id: string
  anilistId?: string
  title: string
  image: string
  type?: string
  addedAt: number
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginWithAniList: (code: string) => Promise<void>
  logout: () => void
  addToFavorites: (anime: Omit<AnimeItem, "addedAt">) => void
  removeFromFavorites: (animeId: string) => void
  isFavorite: (animeId: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ANILIST_CLIENT_ID = "25870"
const ANILIST_CLIENT_SECRET = "doXAkby3ijsCpI5zCeLyg164KK0stGvmJdoshmAF"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user data:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  // Check for AniList auth code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    
    if (code) {
      // Remove code from URL to prevent issues on refresh
      window.history.replaceState({}, document.title, window.location.pathname)
      loginWithAniList(code).catch(console.error)
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Note: In a real app, this would make an API request
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Mock login validation
        if (email === "demo@example.com" && password === "password") {
          const userData: User = {
            id: "user-1",
            name: "Demo User",
            email: "demo@example.com",
            provider: "email",
            favorites: []
          }
          
          localStorage.setItem("user", JSON.stringify(userData))
          setUser(userData)
          resolve()
        } else {
          // Check if user exists in localStorage (for registration testing)
          const storedUsers = localStorage.getItem("users")
          if (storedUsers) {
            try {
              const users = JSON.parse(storedUsers)
              const foundUser = users.find((u: any) => u.email === email)
              
              if (foundUser && foundUser.password === password) {
                const userData: User = {
                  id: foundUser.id,
                  name: foundUser.name,
                  email: foundUser.email,
                  provider: "email",
                  favorites: foundUser.favorites || []
                }
                
                localStorage.setItem("user", JSON.stringify(userData))
                setUser(userData)
                resolve()
                return
              }
            } catch (error) {
              console.error("Failed to parse stored users:", error)
            }
          }
          
          reject(new Error("Invalid email or password"))
        }
      }, 500) // Simulating network delay
    })
  }

  const loginWithAniList = async (code: string) => {
    // In a real app, exchange the code for a token with AniList API
    setIsLoading(true)
    
    return new Promise<void>((resolve, reject) => {
      // In a real implementation, you would make an API call to AniList to exchange the code for a token
      // Example API call:
      // POST https://anilist.co/api/v2/oauth/token
      // {
      //   grant_type: "authorization_code",
      //   client_id: ANILIST_CLIENT_ID,
      //   client_secret: ANILIST_CLIENT_SECRET,
      //   redirect_uri: "https://aninew-link.vercel.app/auth/callback",
      //   code: code
      // }
      
      setTimeout(() => {
        try {
          // Mock AniList user data
          const userData: User = {
            id: `anilist-${Date.now()}`,
            name: "AniList User",
            email: `user${Date.now()}@anilist.co`,
            avatarUrl: "https://i.imgur.com/q0OhA.png",
            provider: "anilist",
            favorites: []
          }
          
          localStorage.setItem("user", JSON.stringify(userData))
          setUser(userData)
          setIsLoading(false)
          resolve()
        } catch (error) {
          setIsLoading(false)
          reject(new Error("Failed to authenticate with AniList"))
        }
      }, 1000)
    })
  }

  const register = async (name: string, email: string, password: string) => {
    // Note: In a real app, this would make an API request
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Check if the email is already taken
        const storedUsers = localStorage.getItem("users")
        let users = []
        
        if (storedUsers) {
          try {
            users = JSON.parse(storedUsers)
            if (users.some((user: any) => user.email === email)) {
              reject(new Error("Email is already taken"))
              return
            }
          } catch (error) {
            console.error("Failed to parse stored users:", error)
          }
        }
        
        // Create new user
        const newUser = {
          id: `user-${Date.now()}`,
          name,
          email,
          password, // In a real app, this would be hashed
          provider: "email",
          favorites: []
        }
        
        users.push(newUser)
        localStorage.setItem("users", JSON.stringify(users))
        
        // Automatically log in the user after registration
        // (Uncomment this if you want to auto-login)
        // const userData: User = {
        //   id: newUser.id,
        //   name: newUser.name,
        //   email: newUser.email,
        //   favorites: []
        // };
        // localStorage.setItem("user", JSON.stringify(userData));
        // setUser(userData);
        
        resolve()
      }, 500) // Simulating network delay
    })
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  const addToFavorites = (anime: Omit<AnimeItem, "addedAt">) => {
    if (!user) return;

    const animeItem: AnimeItem = {
      ...anime,
      addedAt: Date.now()
    };

    // Create a new user object with the updated favorites
    const updatedUser = {
      ...user,
      favorites: [
        ...(user.favorites || []).filter(item => item.id !== anime.id),
        animeItem
      ]
    };

    // Update state and localStorage
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // If user was registered (not via AniList), also update in users array
    if (user.provider === "email") {
      const storedUsers = localStorage.getItem("users");
      if (storedUsers) {
        try {
          const users = JSON.parse(storedUsers);
          const updatedUsers = users.map((u: any) => 
            u.id === user.id ? { ...u, favorites: updatedUser.favorites } : u
          );
          localStorage.setItem("users", JSON.stringify(updatedUsers));
        } catch (error) {
          console.error("Failed to update user favorites in users storage:", error);
        }
      }
    }
  };

  const removeFromFavorites = (animeId: string) => {
    if (!user) return;

    // Create a new user object without the removed anime
    const updatedUser = {
      ...user,
      favorites: (user.favorites || []).filter(item => item.id !== animeId)
    };

    // Update state and localStorage
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // If user was registered (not via AniList), also update in users array
    if (user.provider === "email") {
      const storedUsers = localStorage.getItem("users");
      if (storedUsers) {
        try {
          const users = JSON.parse(storedUsers);
          const updatedUsers = users.map((u: any) => 
            u.id === user.id ? { ...u, favorites: updatedUser.favorites } : u
          );
          localStorage.setItem("users", JSON.stringify(updatedUsers));
        } catch (error) {
          console.error("Failed to update user favorites in users storage:", error);
        }
      }
    }
  };

  const isFavorite = (animeId: string) => {
    if (!user || !user.favorites) return false;
    return user.favorites.some(item => item.id === animeId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithAniList,
        logout,
        addToFavorites,
        removeFromFavorites,
        isFavorite
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 