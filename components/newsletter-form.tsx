"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address")
      return
    }
    
    setError(null)
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Success!
      setIsSuccess(true)
      setEmail("")
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    } catch (err) {
      setError("Failed to subscribe. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex space-x-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className={cn(
            "max-w-[220px]",
            error ? "border-red-500 focus-visible:ring-red-500" : ""
          )}
          disabled={isLoading || isSuccess}
        />
        <Button 
          type="submit" 
          variant="default"
          disabled={isLoading || isSuccess}
          className={cn(
            "transition-all",
            isSuccess && "bg-green-600 hover:bg-green-700"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSuccess ? (
            <Check className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      
      {isSuccess && (
        <p className="text-xs text-green-500">Subscribed successfully!</p>
      )}
    </form>
  )
} 