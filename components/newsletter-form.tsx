"use client"

import { useState, FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error")
      setMessage("Please enter a valid email address")
      return
    }
    
    setStatus("loading")
    
    // Simulate API call
    try {
      // In a real application, you would make an API call to your server
      // Example: await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) })
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStatus("success")
      setMessage("Thanks for subscribing!")
      setEmail("")
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        if (setStatus) { // Check if component is still mounted
          setStatus("idle")
          setMessage("")
        }
      }, 5000)
      
    } catch (error) {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`pr-10 ${status === "error" ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            disabled={status === "loading" || status === "success"}
          />
          {status === "success" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Subscription successful!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          {status === "error" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{message}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        <Button 
          type="submit" 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={status === "loading" || status === "success"}
        >
          {status === "loading" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Button>
      </div>
      {message && status !== "error" && (
        <p className="text-xs text-green-500">{message}</p>
      )}
    </form>
  )
} 