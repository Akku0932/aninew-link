"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react"
import Logo from "@/components/logo"
import { useAuth } from "@/context/auth-context"

export default function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }
    
    setIsLoading(true)
    
    try {
      await register(name, email, password)
      router.push("/login")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to register. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAniListSignup = () => {
    setIsLoading(true)
    // Redirect to AniList OAuth flow with the provided client ID
    window.location.href = "https://anilist.co/api/v2/oauth/authorize?client_id=25870&redirect_uri=http://localhost:3000/auth/callback&response_type=code"
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <Logo size="large" />
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to get started
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-950/50">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <User size={18} />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Mail size={18} />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <LockKeyhole size={18} />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <LockKeyhole size={18} />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="terms" className="text-xs text-muted-foreground">
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-primary hover:text-primary/80">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-primary hover:text-primary/80">
              Privacy Policy
            </Link>
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      
      <button
        type="button"
        onClick={handleAniListSignup}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.36 0L0 12.93V24H6.36V12.93L12.72 0H6.36Z" fill="#02A9FF"/>
          <path d="M17.52 6.3H23.88L17.52 19.41L11.34 6.3H17.52Z" fill="#02A9FF"/>
          <path d="M17.52 24H23.88V6.3H17.52V24Z" fill="#02A9FF"/>
        </svg>
        <span>Sign up with AniList</span>
      </button>
      
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
          Sign in
        </Link>
      </div>
    </div>
  )
} 