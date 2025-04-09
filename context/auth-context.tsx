"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  name: string
  email: string
  avatarUrl?: string
  provider?: "email" | "mal"
  favorites?: AnimeItem[]
  malToken?: string
  bio?: string
}

type AnimeItem = {
  id: string
  malId?: string
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
  loginWithMAL: (code: string, codeVerifier?: string) => Promise<void>
  logout: () => void
  addToFavorites: (anime: Omit<AnimeItem, "addedAt">) => void
  removeFromFavorites: (animeId: string) => void
  isFavorite: (animeId: string) => boolean
  addToMAL: (animeId: string, malId: string, status: string) => Promise<boolean>
  callMALAPI: <T = any>(endpoint: string, params?: Record<string, any>, method?: 'GET' | 'POST' | 'PUT' | 'DELETE') => Promise<T>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MAL_CLIENT_ID = "5105b8eb05adcc56e3c1eff800c98a30"
const MAL_CLIENT_SECRET = "eea5c9902db45b3e7fb543a9f81c7a3784a8d23c7836cd76a0bb89531e0fbe88"

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

  // Check for MAL auth code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    
    if (code) {
      // Remove code from URL to prevent issues on refresh
      window.history.replaceState({}, document.title, window.location.pathname)
      // Get the code verifier we stored earlier
      const codeVerifier = localStorage.getItem('mal_code_verifier');
      loginWithMAL(code, codeVerifier || undefined).catch(console.error)
    }
  }, [])

  // Function to make MAL API calls
  const callMALAPI = async <T = any>(
    endpoint: string, 
    params: Record<string, any> = {}, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
  ): Promise<T> => {
    if (!user?.malToken) {
      throw new Error("No MyAnimeList token available");
    }

    try {
      // Use our server-side proxy instead of direct API calls
      const response = await fetch("/api/auth/mal/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: user.malToken,
          endpoint,
          params,
          method
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error("MyAnimeList API error:", error);
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

  const loginWithMAL = async (code: string, codeVerifier?: string) => {
    // Exchange the code for a token with MyAnimeList API via our proxy endpoint
    setIsLoading(true);
    
    try {
      console.log("[MAL Login] Starting MyAnimeList authentication with code:", code.substring(0, 10) + "...");
      console.log("[MAL Login] Code verifier available:", !!codeVerifier);
      
      // Call our proxy API
      const response = await fetch("/api/auth/mal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          code,
          code_verifier: codeVerifier || undefined // Send code verifier if available
        })
      });

      console.log("[MAL Login] Token response status:", response.status);
      
      // Check if the response is not ok and log the error
      if (!response.ok) {
        let errorMessage = `MyAnimeList token exchange failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error("[MAL Login] Token error response:", errorData);
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          const errorText = await response.text();
          console.error("[MAL Login] Token error text:", errorText);
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Try to parse the response
      let tokenData;
      try {
        tokenData = await response.json();
        console.log("[MAL Login] Token received, expires in:", tokenData.expires_in);
      } catch (parseError) {
        console.error("[MAL Login] Failed to parse token response:", parseError);
        throw new Error("Invalid response from MyAnimeList");
      }
      
      // Use the actual token from the response
      const token = tokenData?.access_token;
      
      if (!token) {
        throw new Error("No access token received from MyAnimeList");
      }
      
      console.log("[MAL Login] Successfully obtained access token");
      
      // Create base user data
      let userData: User = {
        id: `mal-${Date.now()}`,
        name: "MyAnimeList User",
        email: `user${Date.now()}@mal.net`,
        avatarUrl: "https://i.imgur.com/q0OhA.png",
        provider: "mal",
        favorites: [],
        malToken: token
      };
      
      // Get the user's profile from MyAnimeList
      try {
        // Fetch the user profile
        const userProfileResponse = await fetch("/api/auth/mal/api", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            endpoint: "users/@me",
            params: {
              fields: "name,picture"
            }
          })
        });

        if (userProfileResponse.ok) {
          const userProfileData = await userProfileResponse.json();
          console.log("MyAnimeList user profile data:", userProfileData);
          
          // Update user data with profile information
          userData = {
            ...userData,
            name: userProfileData.name || "MyAnimeList User",
            avatarUrl: userProfileData.picture || userData.avatarUrl,
            id: `mal-${userProfileData.id || Date.now()}`
          };
          
          // Fetch the user's anime list (favorites)
          try {
            const userAnimeListResponse = await fetch("/api/auth/mal/api", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                token,
                endpoint: "users/@me/animelist",
                params: {
                  status: "completed",
                  limit: 100,
                  fields: "list_status,title,main_picture,media_type"
                }
              })
            });
            
            if (userAnimeListResponse.ok) {
              const animeListData = await userAnimeListResponse.json();
              
              // Extract favorites from the anime list
              const favorites: AnimeItem[] = animeListData.data
                .filter((item: any) => item.list_status.is_rewatching || item.list_status.score >= 8)
                .map((item: any) => ({
                  id: `mal-anime-${item.node.id}`,
                  malId: String(item.node.id),
                  title: item.node.title,
                  image: item.node.main_picture?.medium || "",
                  type: item.node.media_type,
                  addedAt: Date.now()
                }));
              
              userData.favorites = favorites;
              
              console.log(`Fetched ${favorites.length} favorites from MyAnimeList`);
            }
          } catch (animeListError) {
            console.error("Error fetching MyAnimeList anime list:", animeListError);
          }
        } else {
          console.error("Failed to fetch MyAnimeList user profile:", await userProfileResponse.text());
        }
      } catch (profileError) {
        console.error("Error fetching MyAnimeList profile:", profileError);
      }
      
      // Save user data and update state
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      setIsLoading(false);
      
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to authenticate with MyAnimeList:", error);
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
    
    const animeWithTimestamp: AnimeItem = {
      ...anime,
      addedAt: Date.now()
    };
    
    // Update user state with the new favorite
    const updatedFavorites = [...(user.favorites || []), animeWithTimestamp];
    const updatedUser = { ...user, favorites: updatedFavorites };
    
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    // If user is connected to MAL and we have a MAL ID for the anime
    if (user.provider === "mal" && user.malToken && anime.malId) {
      try {
        // Update favorite status in MyAnimeList
        const response = await fetch("/api/auth/mal/api", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: user.malToken,
            endpoint: `anime/${anime.malId}/my_list_status`,
            method: "PUT",
            params: {
              status: "completed",
              is_favorite: true
            }
          })
        });
        
        const data = await response.json();
        
        console.log("MyAnimeList update status response:", data);
        
        if (data.error) {
          console.error("MyAnimeList update status errors:", data.error);
          return;
        }
        
        console.log(`Successfully updated status for anime with MyAnimeList ID: ${anime.malId}`);
      } catch (error) {
        console.error("Error updating MyAnimeList status:", error);
      }
    }
    
    // If user was registered (not via MyAnimeList), also update in users array
    if (user.provider === "email") {
      try {
        const storedUsers = localStorage.getItem("users");
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const updatedUsers = users.map((u: any) => 
            u.id === user.id ? { ...u, favorites: updatedFavorites } : u
          );
          localStorage.setItem("users", JSON.stringify(updatedUsers));
        }
      } catch (error) {
        console.error("Failed to update user favorites in stored users:", error);
      }
    }
  };

  const removeFromFavorites = async (animeId: string) => {
    if (!user) return;

    // Find the anime in favorites to get the MAL ID
    const animeToRemove = user.favorites?.find(item => item.id === animeId);
    
    // If user is connected to MAL and we have a MAL ID for the anime
    if (user.provider === "mal" && user.malToken && animeToRemove?.malId) {
      try {
        // Update favorite status in MyAnimeList
        const response = await fetch("/api/auth/mal/api", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: user.malToken,
            endpoint: `anime/${animeToRemove.malId}/my_list_status`,
            method: "PUT",
            params: {
              status: "completed",
              is_favorite: false
            }
          })
        });
        
        const data = await response.json();
        
        console.log("MyAnimeList update status response:", data);
        
        if (data.error) {
          console.error("MyAnimeList update status errors:", data.error);
        } else {
          console.log(`Successfully updated status for anime with MyAnimeList ID: ${animeToRemove.malId}`);
        }
      } catch (error) {
        console.error("Error updating MyAnimeList status:", error);
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

    // If user was registered (not via MyAnimeList), also update in users array
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

  // Function to add anime to MAL with a specific status
  const addToMAL = async (animeId: string, malId: string, status: string): Promise<boolean> => {
    if (!user || !user.malToken) return false;
    
    try {
      // Convert status to MAL format
      const malStatus = status.toLowerCase();
      
      // Update anime status in MyAnimeList
      const data = await callMALAPI(
        `anime/${malId}/my_list_status`, 
        { status: malStatus },
        'PUT'
      );
      
      console.log(`Added anime with MyAnimeList ID: ${malId} to list with status: ${status}`);
      return true;
      
    } catch (error) {
      console.error("Error adding to MyAnimeList:", error);
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
        loginWithMAL,
        logout,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        addToMAL,
        callMALAPI,
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