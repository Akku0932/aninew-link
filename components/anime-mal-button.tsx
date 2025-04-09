"use client";

import { useState } from "react";
import { ThumbsUp, BookmarkPlus, Save } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";

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
  const { user, isAuthenticated, addToFavorites, removeFromFavorites, isFavorite, addToMAL } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const router = useRouter();
  
  const isFavorited = user ? isFavorite(animeId) : false;
  
  // Function to handle liking the anime on MyAnimeList
  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    setIsLiking(true);
    
    try {
      // Toggle favorite status
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
      console.error("Error toggling like status:", error);
    } finally {
      setIsLiking(false);
    }
  };
  
  // Function to add anime to MyAnimeList collection (watching, completed, etc.)
  const handleAddToList = async (status: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    setIsAddingToList(true);
    
    try {
      if (malId) {
        // Use the addToMAL function
        const success = await addToMAL(animeId, malId, status);
        
        if (success) {
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
      } else {
        // If no MyAnimeList ID, just add to local favorites
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
      console.error("Error adding to list:", error);
    } finally {
      setIsAddingToList(false);
    }
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
                onClick={handleLike}
                disabled={isLiking}
                className="h-8 w-8"
              >
                <ThumbsUp 
                  className={`h-4 w-4 ${isFavorited ? "fill-primary text-primary" : ""}`} 
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFavorited ? "Unlike" : "Like"} on MyAnimeList</p>
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
                    disabled={isAddingToList}
                    className="h-8 w-8"
                  >
                    <BookmarkPlus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleAddToList("plan_to_watch")}>
                  Plan to Watch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddToList("watching")}>
                  Watching
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddToList("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddToList("on_hold")}>
                  On Hold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddToList("dropped")}>
                  Dropped
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipContent>
              <p>Add to MyAnimeList</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
  
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={handleLike}
        variant={isFavorited ? "default" : "outline"}
        size="sm"
        disabled={isLiking}
        className="gap-2"
      >
        <ThumbsUp 
          className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} 
        />
        {isFavorited ? "Liked" : "Like"}
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isAddingToList}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Add to List
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleAddToList("plan_to_watch")}>
            Plan to Watch
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddToList("watching")}>
            Watching
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddToList("completed")}>
            Completed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddToList("on_hold")}>
            On Hold
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddToList("dropped")}>
            Dropped
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 