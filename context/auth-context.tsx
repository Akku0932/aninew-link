"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  name: string
  email: string
  avatarUrl?: string
  provider?: "email" | "anilist"
  favorites?: AnimeItem[]
  anilistToken?: string
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
  addToAniList: (animeId: string, anilistId: string, status: string) => Promise<boolean>
  callAniListAPI: (query: string, variables?: Record<string, any>) => Promise<any>
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

  // Function to make AniList GraphQL API calls
  const callAniListAPI = async (query: string, variables: Record<string, any> = {}) => {
    if (!user?.anilistToken) {
      throw new Error("No AniList token available");
    }

    try {
      // Use our server-side proxy instead of direct GraphQL calls
      const response = await fetch("/api/auth/anilist/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: user.anilistToken,
          query,
          variables
        })
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }
      
      return data.data;
    } catch (error) {
      console.error("AniList API error:", error);
      throw error;
    }
  };

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
    // Exchange the code for a token with AniList API via our proxy endpoint
    setIsLoading(true)
    
    try {
      console.log("Starting AniList authentication with code:", code);
      
      // Instead of calling AniList directly, call our proxy API
      const response = await fetch("/api/auth/anilist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code })
      });

      console.log("AniList token response status:", response.status);
      
      // Check if the response is not ok and log the error
      if (!response.ok) {
        const errorData = await response.text();
        console.error("AniList token error response:", errorData);
        throw new Error(`AniList token exchange failed: ${response.status} ${response.statusText}`);
      }
      
      // Try to parse the response
      let tokenData;
      try {
        tokenData = await response.json();
        console.log("AniList token response data:", tokenData);
      } catch (parseError) {
        console.error("Failed to parse AniList token response:", parseError);
        throw new Error("Invalid response from AniList");
      }
      
      // Use the actual token from the response
      const token = tokenData?.access_token;
      
      if (!token) {
        throw new Error("No access token received from AniList");
      }
      
      // Get the user's profile from AniList using the token
      // For a real implementation, we would make a GraphQL query to get user data
      // let userData: User;
      // 
      // try {
      //   const anilistUserResponse = await fetch("https://graphql.anilist.co", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       "Authorization": `Bearer ${token}`
      //     },
      //     body: JSON.stringify({
      //       query: `
      //         query {
      //           Viewer {
      //             id
      //             name
      //             avatar {
      //               large
      //             }
      //           }
      //         }
      //       `
      //     })
      //   });
      //   
      //   const anilistUserData = await anilistUserResponse.json();
      //   const viewer = anilistUserData.data.Viewer;
      //   
      //   userData = {
      //     id: `anilist-${viewer.id}`,
      //     name: viewer.name,
      //     email: `user${viewer.id}@anilist.co`, // AniList doesn't provide email
      //     avatarUrl: viewer.avatar?.large,
      //     provider: "anilist",
      //     favorites: [],
      //     anilistToken: token
      //   };
      // } catch (error) {
      //   console.error("Failed to fetch AniList user profile:", error);
      
      // For demo, mock user data
      const userData: User = {
        id: `anilist-${Date.now()}`,
        name: "AniList User",
        email: `user${Date.now()}@anilist.co`,
        avatarUrl: "https://i.imgur.com/q0OhA.png",
        provider: "anilist",
        favorites: [],
        anilistToken: token
      };
      
      console.log("Created user data:", userData.id);
      
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsLoading(false);
      return;
    } catch (error) {
      console.error("Failed to authenticate with AniList:", error);
      setIsLoading(false);
      throw error;
    }
  };

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

  const addToFavorites = async (anime: Omit<AnimeItem, "addedAt">) => {
    if (!user) return;

    const animeItem: AnimeItem = {
      ...anime,
      addedAt: Date.now()
    };

    // If user is connected to AniList and we have an AniList ID for the anime
    if (user.provider === "anilist" && user.anilistToken && anime.anilistId) {
      try {
        // In a real implementation, we'd make a GraphQL mutation to toggle favorite
        // const result = await callAniListAPI(`
        //   mutation {
        //     ToggleFavourite(animeId: ${anime.anilistId}) {
        //       anime { id }
        //     }
        //   }
        // `);
        console.log(`Toggled favorite status for anime with AniList ID: ${anime.anilistId}`);
      } catch (error) {
        console.error("Error toggling AniList favorite:", error);
      }
    }

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

  const removeFromFavorites = async (animeId: string) => {
    if (!user) return;

    // Find the anime in favorites to get the AniList ID
    const animeToRemove = user.favorites?.find(item => item.id === animeId);
    
    // If user is connected to AniList and we have an AniList ID for the anime
    if (user.provider === "anilist" && user.anilistToken && animeToRemove?.anilistId) {
      try {
        // In a real implementation, we'd make a GraphQL mutation to toggle favorite
        // const result = await callAniListAPI(`
        //   mutation {
        //     ToggleFavourite(animeId: ${animeToRemove.anilistId}) {
        //       anime { id }
        //     }
        //   }
        // `);
        console.log(`Toggled favorite status for anime with AniList ID: ${animeToRemove.anilistId}`);
      } catch (error) {
        console.error("Error toggling AniList favorite:", error);
      }
    }

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

  // Function to add anime to AniList with a specific status
  const addToAniList = async (animeId: string, anilistId: string, status: string): Promise<boolean> => {
    if (!user || !user.anilistToken) return false;
    
    try {
      // In a real implementation, we'd make a GraphQL mutation to update the anime status
      // const result = await callAniListAPI(`
      //   mutation {
      //     SaveMediaListEntry(mediaId: ${anilistId}, status: ${status}) {
      //       id
      //       status
      //     }
      //   }
      // `);
      
      console.log(`Added anime with AniList ID: ${anilistId} to list with status: ${status}`);
      return true;
    } catch (error) {
      console.error("Error adding to AniList:", error);
      return false;
    }
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
        isFavorite,
        addToAniList,
        callAniListAPI
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