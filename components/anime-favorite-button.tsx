"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AnimeFavoriteButtonProps {
  animeId: string;
  anilistId?: string;
  title: string;
  image: string;
  type?: string;
  className?: string;
}

export default function AnimeFavoriteButton({
  animeId,
  anilistId,
  title,
  image,
  type,
  className
}: AnimeFavoriteButtonProps) {
  const { user, isAuthenticated, addToFavorites, removeFromFavorites, isFavorite } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  
  const isFavorited = user ? isFavorite(animeId) : false;
  
  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      if (isFavorited) {
        removeFromFavorites(animeId);
      } else {
        addToFavorites({
          id: animeId,
          anilistId,
          title,
          image,
          type
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Button
      onClick={handleToggleFavorite}
      variant={isFavorited ? "default" : "outline"}
      size="sm"
      className={className}
      disabled={isProcessing}
    >
      <Heart 
        className={`mr-2 h-4 w-4 ${isFavorited ? "fill-current" : ""}`} 
      />
      {isFavorited ? "Saved" : "Save"}
    </Button>
  );
} 