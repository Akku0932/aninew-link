"use client"

import LoginForm from "@/components/auth/login-form"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Logo from "@/components/logo"
import Link from "next/link"

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to home if already authenticated
    if (isAuthenticated && !isLoading) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="mb-6">
        <Link href="/">
          <Logo size="lg" animated={true} />
        </Link>
      </div>
      <LoginForm />
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Demo credentials: <span className="font-semibold">demo@example.com</span> / <span className="font-semibold">password</span>
        </p>
      </div>
    </div>
  )
} 