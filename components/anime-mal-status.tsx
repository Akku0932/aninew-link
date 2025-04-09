"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, X, Plus, ListPlus, BookmarkPlus } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Define the MyAnimeList status types
type AnimeStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

interface AnimeMALStatusProps {
  animeId: string;
  malId?: string | number;
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
  const [extractedMalId, setExtractedMalId] = useState<string | null>(null);
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

  // Try to extract MAL ID if not provided
  useEffect(() => {
    const fetchAnimeInfo = async () => {
      if (malId) {
        setExtractedMalId(String(malId));
        return;
      }
      
      try {
        const response = await fetch(`https://aninew-seven.vercel.app/info/${animeId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.info && data.info.malID) {
            setExtractedMalId(String(data.info.malID));
          }
        }
      } catch (error) {
        console.error("Error fetching anime info for MAL ID:", error);
      }
    };
    
    fetchAnimeInfo();
  }, [animeId, malId]);

  // Fetch current status if not provided and user is authenticated
  useEffect(() => {
    const fetchCurrentStatus = async () => {
      if (!isAuthenticated || !user?.malToken || !extractedMalId || currentStatus) return;
      
      try {
        setIsLoading(true);
        const data = await callMALAPI(`anime/${extractedMalId}`, {
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
  }, [isAuthenticated, user, extractedMalId, callMALAPI, currentStatus]);

  const updateStatus = async (newStatus: AnimeStatus) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    if (!extractedMalId) {
      setError("No MyAnimeList ID found");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update the status in MyAnimeList
      const result = await callMALAPI(`anime/${extractedMalId}/my_list_status`, {
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

  // Helper to get status color
  const getStatusColor = (status: AnimeStatus): string => {
    const colorMap: Record<AnimeStatus, string> = {
      watching: "bg-blue-500 hover:bg-blue-600",
      completed: "bg-green-500 hover:bg-green-600",
      on_hold: "bg-yellow-500 hover:bg-yellow-600",
      dropped: "bg-red-500 hover:bg-red-600",
      plan_to_watch: "bg-purple-500 hover:bg-purple-600"
    };
    
    return colorMap[status] || "bg-gray-500 hover:bg-gray-600";
  };

  if (compact) {
    return (
      <div className={className}>
        <TooltipProvider>
          <Tooltip>
            <DropdownMenu>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    disabled={isLoading}
                    className={cn(
                      "h-8 w-8 rounded-full relative",
                      status ? getStatusColor(status) : "bg-gray-700 hover:bg-gray-600",
                      "text-white border-0"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : status ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ListPlus className="h-4 w-4" />
                    )}
                    {success && !isLoading && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border border-white"></span>
                    )}
                    {error && !isLoading && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border border-white"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{status ? "Update status" : "Add to list"}</p>
              </TooltipContent>
              <DropdownMenuContent align="end" className="w-48">
                {status && (
                  <>
                    <DropdownMenuItem className="text-xs opacity-70" disabled>
                      Current: {getStatusLabel(status)}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => updateStatus("watching")} className="text-blue-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                  Watching
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("completed")} className="text-green-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("plan_to_watch")} className="text-purple-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                  Plan to Watch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("on_hold")} className="text-yellow-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                  On Hold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("dropped")} className="text-red-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                  Dropped
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <Label htmlFor="anime-status" className="text-sm text-gray-500 dark:text-gray-400">Add to MyAnimeList</Label>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={status ? "default" : "outline"}
            className={cn(
              "w-full gap-2 relative",
              status && getStatusColor(status)
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status ? (
              <>
                <Check className="h-4 w-4" />
                {getStatusLabel(status)}
              </>
            ) : (
              <>
                <ListPlus className="h-4 w-4" />
                Add to List
              </>
            )}
            {success && !isLoading && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-300"></span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          {status && (
            <>
              <DropdownMenuItem className="text-xs opacity-70" disabled>
                Current: {getStatusLabel(status)}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => updateStatus("watching")} className="text-blue-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
            Watching
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus("completed")} className="text-green-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            Completed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus("plan_to_watch")} className="text-purple-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
            Plan to Watch
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus("on_hold")} className="text-yellow-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
            On Hold
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus("dropped")} className="text-red-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
            Dropped
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 