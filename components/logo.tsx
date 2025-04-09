"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "small" | "medium" | "large";
  animated?: boolean;
  className?: string;
  withLink?: boolean;
}

export default function Logo({ size = "medium", animated = true, className, withLink = true }: LogoProps) {
  const [gradientPos, setGradientPos] = useState(0);

  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      setGradientPos((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 50);
    
    return () => clearInterval(interval);
  }, [animated]);

  const sizeClasses = {
    small: "text-xl",
    medium: "text-2xl",
    large: "text-4xl"
  };

  const gradientStyle = {
    backgroundImage: `linear-gradient(90deg, 
      rgba(59,130,246,1) ${gradientPos - 50}%, 
      rgba(236,72,153,1) ${gradientPos}%, 
      rgba(59,130,246,1) ${gradientPos + 50}%)`,
    backgroundSize: "200% auto",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: animated ? "transparent" : "initial",
    color: animated ? "transparent" : "initial"
  };

  const logoContent = (
    <span 
      style={animated ? gradientStyle : {}}
      className={animated ? "" : "text-blue-500 dark:text-blue-400"}
    >
      Ani
      <span className={animated ? "" : "text-pink-500 dark:text-pink-400"}>
        new
      </span>
    </span>
  );

  if (withLink) {
    return (
      <Link 
        href="/" 
        className={cn(
          "font-bold tracking-tighter transition-all duration-200 hover:scale-105",
          sizeClasses[size],
          className
        )}
      >
        {logoContent}
      </Link>
    );
  }

  return (
    <span 
      className={cn(
        "font-bold tracking-tighter",
        sizeClasses[size],
        className
      )}
    >
      {logoContent}
    </span>
  );
} 