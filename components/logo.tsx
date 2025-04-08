"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "small" | "default" | "large";
  animated?: boolean;
  className?: string;
}

export default function Logo({ size = "default", animated = true, className }: LogoProps) {
  const [gradientPos, setGradientPos] = useState(0);

  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      setGradientPos((prev) => (prev + 1) % 200);
    }, 50);
    
    return () => clearInterval(interval);
  }, [animated]);

  const sizeClasses = {
    small: "text-xl",
    default: "text-2xl",
    large: "text-3xl"
  };

  const gradientStyle = {
    backgroundImage: 'linear-gradient(90deg, #4776E6, #8E54E9, #4776E6)',
    backgroundSize: '200% 100%',
    backgroundPosition: `${gradientPos}% 0%`,
  };

  return (
    <Link href="/">
      <span 
        className={cn(
          "font-bold bg-clip-text text-transparent transition-all duration-300 hover:opacity-80",
          sizeClasses[size],
          className
        )}
        style={gradientStyle}
      >
        AniNew
      </span>
    </Link>
  );
} 