"use client"

import { useState } from "react"
import Logo from "@/components/logo"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleAniListLogin = () => {
    setIsLoading(true)
    // Redirect to AniList OAuth flow with the provided client ID
    window.location.href = "https://anilist.co/api/v2/oauth/authorize?client_id=25870&redirect_uri=https://aninew-link.vercel.app/auth/callback&response_type=code"
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <Logo size="large" />
        <h1 className="text-2xl font-bold">Welcome to AniNew</h1>
        <p className="text-sm text-muted-foreground">
          Sign in with your AniList account to sync your favorites
        </p>
      </div>
      
      <div className="rounded-lg border border-border bg-secondary/20 p-4 text-sm">
        <p className="mb-2 font-medium">Why AniList?</p>
        <p className="text-muted-foreground">
          AniList login enables you to sync your anime favorites across devices and get personalized recommendations.
        </p>
      </div>
      
      <button
        type="button"
        onClick={handleAniListLogin}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-[#02A9FF] py-3 text-sm font-medium text-white transition-colors hover:bg-[#0299E5] focus:outline-none focus:ring-2 focus:ring-[#02A9FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.36 0L0 12.93V24H6.36V12.93L12.72 0H6.36Z" fill="white"/>
          <path d="M17.52 6.3H23.88L17.52 19.41L11.34 6.3H17.52Z" fill="white"/>
          <path d="M17.52 24H23.88V6.3H17.52V24Z" fill="white"/>
        </svg>
        <span>{isLoading ? "Connecting to AniList..." : "Continue with AniList"}</span>
      </button>
      
      <div className="text-center text-xs text-muted-foreground">
        By continuing, you agree to our <a href="/terms" className="underline hover:text-foreground">Terms of Service</a> and <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
      </div>
    </div>
  )
} 