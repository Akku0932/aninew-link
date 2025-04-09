"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Define the MyAnimeList status types
type AnimeStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

interface AnimeMALStatusProps {
  animeId: string;
  malId?: string;
  title: string;
  currentStatus?: AnimeStatus | null;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export default function AnimeMALStatus({
  animeId,
  malId,
  title,
  currentStatus,
  className = "",
  showLabel = true,
  compact = false
}: AnimeMALStatusProps) {
  const { user, isAuthenticated, callMALAPI } = useAuth();
  const [status, setStatus] = useState<AnimeStatus | null>(currentStatus || null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Reset status display after showing success/error
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Fetch current status if not provided and user is authenticated
  useEffect(() => {
    const fetchCurrentStatus = async () => {
      if (!isAuthenticated || !user?.malToken || !malId || currentStatus) return;
      
      try {
        setIsLoading(true);
        const data = await callMALAPI(`anime/${malId}`, {
          fields: 'my_list_status'
        });
        
        if (data.my_list_status) {
          setStatus(data.my_list_status.status);
        }
      } catch (err) {
        console.error("Failed to fetch anime status:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurrentStatus();
  }, [isAuthenticated, user, malId, callMALAPI, currentStatus]);

  const updateStatus = async (newStatus: AnimeStatus) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    if (!malId) {
      setError("No MyAnimeList ID found");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update the status in MyAnimeList
      const result = await callMALAPI(`anime/${malId}/my_list_status`, {
        status: newStatus
      }, 'PUT');
      
      // Update local state with the new status
      if (result) {
        setStatus(newStatus);
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error updating anime status:", error);
      setError("Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (value: string) => {
    updateStatus(value as AnimeStatus);
  };

  // Helper to get status label for display
  const getStatusLabel = (status: AnimeStatus): string => {
    const statusMap: Record<AnimeStatus, string> = {
      watching: "Watching",
      completed: "Completed",
      on_hold: "On Hold",
      dropped: "Dropped",
      plan_to_watch: "Plan to Watch"
    };
    
    return statusMap[status] || status;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && !compact && (
        <Label htmlFor="anime-status">MAL Status</Label>
      )}
      
      <div className="flex items-center gap-2">
        <Select 
          disabled={isLoading} 
          value={status || undefined} 
          onValueChange={handleStatusChange}
        >
          <SelectTrigger 
            id="anime-status"
            className={cn(
              "w-full", 
              compact ? "h-8 text-xs" : "",
              success ? "border-green-500" : error ? "border-red-500" : ""
            )}
          >
            <SelectValue placeholder="Set Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="watching">Watching</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
            <SelectItem value="plan_to_watch">Plan to Watch</SelectItem>
          </SelectContent>
        </Select>
        
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        
        {success && !isLoading && (
          <Check className="h-4 w-4 text-green-500" />
        )}
        
        {error && !isLoading && (
          <X className="h-4 w-4 text-red-500" />
        )}
      </div>
    </div>
  );
} 