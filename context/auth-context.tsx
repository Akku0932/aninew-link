"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
        }
        
        users.push(newUser)
        localStorage.setItem("users", JSON.stringify(users))
        
        // Automatically log in the user after registration
        // (Uncomment this if you want to auto-login)
        // const userData: User = {
        //   id: newUser.id,
        //   name: newUser.name,
        //   email: newUser.email,
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
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