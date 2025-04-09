"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, List, Loader2, Plus } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"

type AnimeStatus = "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch"

interface AnimeMALStatusProps {
  malId: string
  className?: string
  showText?: boolean
  currentStatus?: AnimeStatus | null
}

const statusLabels: Record<AnimeStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  on_hold: "On Hold",
  dropped: "Dropped",
  plan_to_watch: "Plan to Watch",
}

export function AnimeMALStatus({ 
  malId, 
  className = "", 
  showText = true,
  currentStatus = null 
}: AnimeMALStatusProps) {
  const { user, callMALAPI, isAuthenticated } = useAuth()
  const [status, setStatus] = useState<AnimeStatus | null>(currentStatus)
  const [isLoading, setIsLoading] = useState(false)

  // Check if the user is logged in with MAL
  const isMALUser = isAuthenticated && user?.provider === "mal" && !!user?.malToken

  const handleStatusChange = async (newStatus: AnimeStatus) => {
    if (!isMALUser || !malId) return

    setIsLoading(true)
    try {
      // Call MAL API to update the status
      await callMALAPI(
        `anime/${malId}/my_list_status`,
        { status: newStatus },
        'PUT'
      )
      
      // Update local state
      setStatus(newStatus)
      toast.success(`Added to your ${statusLabels[newStatus].toLowerCase()} list`)
    } catch (error) {
      console.error("Failed to update anime status:", error)
      toast.error("Failed to update your list. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // If user is not logged in with MAL, show nothing or a disabled state
  if (!isMALUser) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={status ? "outline" : "default"} 
          size="sm" 
          className={`${className} gap-2`}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status ? (
            <Check className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {showText && (status ? statusLabels[status] : "Add to List")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(statusLabels).map(([key, label]) => (
          <DropdownMenuItem 
            key={key} 
            onClick={() => handleStatusChange(key as AnimeStatus)}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            {label}
            {status === key && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 