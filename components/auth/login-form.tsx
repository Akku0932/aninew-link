"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import Logo from "@/components/logo"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }
    
    setIsLoading(true)
    
    try {
      await login(email, password)
      router.push("/")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to login. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleMALLogin = async () => {
    try {
      setIsLoading(true);
      
      // Call our authorization API to get the auth URL and code verifier
      const response = await fetch('/api/auth/mal/authorize');
      
      if (!response.ok) {
        throw new Error('Failed to start MyAnimeList authentication');
      }
      
      const { authUrl, codeVerifier, state } = await response.json();
      
      if (!authUrl || !codeVerifier) {
        throw new Error('Invalid authentication data received');
      }
      
      // Store the code verifier and state in localStorage to use later
      localStorage.setItem('mal_code_verifier', codeVerifier);
      localStorage.setItem('mal_state', state);
      
      // Redirect to the MyAnimeList OAuth flow
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error starting MyAnimeList authentication:', error);
      setError('Failed to start MyAnimeList authentication. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <Logo size="large" />
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-950/50">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="remember-me" className="text-xs text-muted-foreground">
              Remember me
            </label>
          </div>
          <div className="text-xs">
            <Link
              href="/forgot-password"
              className="font-medium text-primary hover:text-primary/80"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign in"}
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
      
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-px bg-border"></div>
        <div className="text-sm text-muted-foreground">OR</div>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="flex items-center justify-center gap-2"
        onClick={handleMALLogin}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 72 72"
          className="h-5 w-5"
        >
          <path fill="#1100ff" d="M48 16H24a8 8 0 0 0-8 8v24a8 8 0 0 0 8 8h24a8 8 0 0 0 8-8V24a8 8 0 0 0-8-8Z"/>
          <path fill="#fff" d="M34 52h-6V20h6zm4-32h6v20l-6-3zm0 20 6 3v9h-6z"/>
        </svg>
        <span>Continue with MyAnimeList</span>
      </Button>
      
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:text-primary/80">
          Sign up
        </Link>
      </div>
    </div>
  )
} 