"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AnimeFavoriteButtonProps {
  animeId: string;
  title: string;
  image: string;
  type?: string;
  anilistId?: string;
  className?: string;
}

export default function AnimeFavoriteButton({
  animeId,
  title,
  image,
  type,
  anilistId,
  className
}: AnimeFavoriteButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, isAuthenticated, isFavorite, addToFavorites, removeFromFavorites } = useAuth();
  const router = useRouter();
  
  const isFavorited = isFavorite(animeId);
  
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push("/auth/callback?returnUrl=" + encodeURIComponent(`/info/${animeId}`));
      return;
    }
    
    setIsProcessing(true);
    try {
      if (isFavorited) {
        await removeFromFavorites(animeId);
      } else {
        await addToFavorites({
          id: animeId,
          title,
          image,
          type,
          anilistId
        });
      }
    } catch (error) {
      console.error("Failed to toggle favorite status:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Button
      variant={isFavorited ? "default" : "outline"}
      className={cn(
        "relative",
        isFavorited && "bg-pink-600 hover:bg-pink-700 text-white border-pink-600",
        isProcessing && "opacity-70 pointer-events-none",
        className
      )}
      onClick={handleToggleFavorite}
      disabled={isProcessing}
    >
      <Heart 
        className={cn(
          "h-4 w-4 mr-2",
          isFavorited ? "fill-white" : "fill-none"
        )} 
      />
      {isFavorited ? "Saved" : "Save"}
    </Button>
  );
} 