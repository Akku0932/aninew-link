"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

export default function Logo({ 
  size = 'md', 
  animated = true,
  className 
}: LogoProps) {
  const [loaded, setLoaded] = useState(false)
  
  useEffect(() => {
    setLoaded(true)
  }, [])
  
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl"
  }
  
  const letterVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  }
  
  const glowVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: [0.5, 1, 0.5], 
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      }
    }
  }
  
  const renderStatic = () => (
    <div className={cn("font-bold flex items-center", sizeClasses[size], className)}>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
        ANI
      </span>
      <span className="text-red-500">NEW</span>
    </div>
  )
  
  const renderAnimated = () => (
    <div className={cn("font-bold flex items-center", sizeClasses[size], className)}>
      <motion.div 
        className="relative"
        initial="initial"
        animate={loaded ? "animate" : "initial"}
      >
        {/* Glow effect */}
        <motion.div 
          className="absolute inset-0 blur-lg rounded-full bg-gradient-to-r from-blue-500/50 to-purple-600/50 -z-10"
          variants={glowVariants}
          initial="initial"
          animate={loaded ? "animate" : "initial"}
        />
        
        {/* Letters */}
        <div className="flex">
          {['A', 'N', 'I'].map((letter, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {letter}
            </motion.span>
          ))}
          {['N', 'E', 'W'].map((letter, i) => (
            <motion.span
              key={i + 3}
              custom={i + 3}
              variants={letterVariants}
              className="text-red-500"
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  )
  
  return (
    <Link href="/" className="hover:opacity-90 transition-opacity">
      {animated ? renderAnimated() : renderStatic()}
    </Link>
  )
} 