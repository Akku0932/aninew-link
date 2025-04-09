"use client"

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  variant?: "default" | "pink";
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function Logo({ 
  variant = "default", 
  size = "medium", 
  className = "" 
}: LogoProps) {
  // Calculate height/width based on size
  const sizeMap = {
    small: { height: 30, width: 110 },
    medium: { height: 40, width: 150 },
    large: { height: 60, width: 220 }
  };
  
  const { height, width } = sizeMap[size];
  
  const logoSource = variant === "pink" 
    ? "/branding/logo-pink.svg" 
    : "/branding/logo.svg";

  return (
    <Link href="/" className={`inline-block ${className}`}>
      <Image 
        src={logoSource} 
        alt="AniNew" 
        width={width} 
        height={height} 
        className="transition-opacity hover:opacity-90"
        priority
      />
    </Link>
  );
} 