"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, BookmarkPlus, Save, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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
type MALStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

// Define the list status type from MAL API
interface MALListStatus {
  status: MALStatus;
  score: number;
  num_episodes_watched: number;
  is_rewatching: boolean;
  updated_at: string;
}

interface AnimeMALButtonProps {
  animeId: string;
  malId?: string; // The MyAnimeList ID if known
  title: string;
  image: string;
  type?: string;
  className?: string;
  variant?: "icon" | "button";
}

export default function AnimeMALButton({
  animeId,
  malId,
  title,
  image,
  type,
  className = "",
  variant = "button"
}: AnimeMALButtonProps) {
  const { user, isAuthenticated, addToFavorites, removeFromFavorites, isFavorite, addToMAL, callMALAPI } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [listStatus, setListStatus] = useState<MALListStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const isFavorited = user ? isFavorite(animeId) : false;
  
  // Fetch the current list status when component mounts or malId changes
  useEffect(() => {
    const fetchListStatus = async () => {
      if (!isAuthenticated || !user?.malToken || !malId) return;
      
      try {
        setIsLoading(true);
        const data = await callMALAPI(`anime/${malId}`, {
          fields: 'my_list_status'
        });
        
        if (data.my_list_status) {
          setListStatus(data.my_list_status);
        }
      } catch (err) {
        console.error("Failed to fetch anime list status:", err);
        setError("Failed to get current list status");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListStatus();
  }, [isAuthenticated, user, malId, callMALAPI]);
  
  // Function to update the anime status in MAL
  const updateStatus = async (status: MALStatus) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    if (!malId) {
      setError("No MyAnimeList ID found for this anime");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update the status in MyAnimeList
      const result = await callMALAPI(`anime/${malId}/my_list_status`, {
        status
      }, 'PUT');
      
      // Update local state with the new status
      if (result) {
        setListStatus(result);
        
        // Also add to local favorites if not already there
        if (!isFavorited) {
          await addToFavorites({
            id: animeId,
            malId,
            title,
            image,
            type
          });
        }
      }
    } catch (error) {
      console.error("Error updating anime status:", error);
      setError("Failed to update anime status");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle liking/unliking the anime
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFavorited) {
        await removeFromFavorites(animeId);
      } else {
        await addToFavorites({
          id: animeId,
          malId,
          title,
          image,
          type
        });
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      setError("Failed to update favorite status");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to remove from list
  const removeFromList = async () => {
    if (!isAuthenticated || !malId) return;
    
    setIsLoading(true);
    
    try {
      // Delete from MAL list
      await callMALAPI(`anime/${malId}/my_list_status`, {}, 'DELETE');
      setListStatus(null);
    } catch (error) {
      console.error("Error removing from list:", error);
      setError("Failed to remove from list");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to get status label
  const getStatusLabel = (status: MALStatus): string => {
    const statusMap: Record<MALStatus, string> = {
      watching: "Watching",
      completed: "Completed",
      on_hold: "On Hold",
      dropped: "Dropped",
      plan_to_watch: "Plan to Watch"
    };
    return statusMap[status] || status;
  };
  
  if (variant === "icon") {
    return (
      <div className={`flex gap-1 ${className}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleFavoriteToggle}
                disabled={isLoading}
                className="h-8 w-8"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsUp 
                    className={`h-4 w-4 ${isFavorited ? "fill-primary text-primary" : ""}`} 
                  />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFavorited ? "Unlike" : "Like"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <DropdownMenu>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    disabled={isLoading}
                    className="h-8 w-8"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : listStatus ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <BookmarkPlus className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <DropdownMenuContent>
                {listStatus && (
                  <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                    Current: {getStatusLabel(listStatus.status)}
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={() => updateStatus("plan_to_watch")}>
                  Plan to Watch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("watching")}>
                  Watching
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("on_hold")}>
                  On Hold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("dropped")}>
                  Dropped
                </DropdownMenuItem>
                
                {listStatus && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={removeFromList}
                    >
                      Remove from List
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipContent>
              <p>{listStatus ? "Update List Status" : "Add to MyAnimeList"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {error && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="text-xs text-red-500">!</TooltipTrigger>
              <TooltipContent>
                <p className="text-red-500">{error}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }
  
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={handleFavoriteToggle}
        variant={isFavorited ? "default" : "outline"}
        size="sm"
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsUp className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
        )}
        {isFavorited ? "Liked" : "Like"}
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={listStatus ? "default" : "outline"}
            size="sm"
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {listStatus ? getStatusLabel(listStatus.status) : "Add to List"}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => updateStatus("plan_to_watch")}>
            Plan to Watch
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus("watching")}>
            Watching
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus("completed")}>
            Completed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus("on_hold")}>
            On Hold
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus("dropped")}>
            Dropped
          </DropdownMenuItem>
          
          {listStatus && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={removeFromList}
              >
                Remove from List
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {error && (
        <p className="text-xs text-red-500 self-center">{error}</p>
      )}
    </div>
  );
} 