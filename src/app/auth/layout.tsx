"use client"

import type React from "react"
import { PawPrint } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import GuestGuard from "@/components/auth/GuestGuard"

// Blur Text Animation Component (React Bits style)
const BlurText = ({ 
  text, 
  delay = 0,
  className = "",
  animateBy = "words" // "words" or "characters"
}: {
  text: string
  delay?: number
  className?: string
  animateBy?: "words" | "characters"
}) => {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setInView(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const segments = animateBy === "words" ? text.split(" ") : text.split("")

  return (
    <span className={className}>
      {segments.map((segment, index) => (
        <motion.span
          key={index}
          initial={{ filter: "blur(10px)", opacity: 0 }}
          animate={inView ? { filter: "blur(0px)", opacity: 1 } : {}}
          transition={{
            duration: 0.1,
            delay: index * 0.05,
            ease: "easeOut"
          }}
          className={animateBy === "words" ? "inline-block mr-1" : "inline-block"}
        >
          {animateBy === "words" 
            ? segment
            : segment === " " ? "\u00A0" : segment
          }
        </motion.span>
      ))}
    </span>
  )
}

// Aurora Background Component (React Bits style)
const Aurora = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Primary Aurora Layer */}
      <motion.div
        className="absolute inset-0 opacity-40"
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, #14b8a6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #06b6d4 0%, transparent 50%), radial-gradient(circle at 40% 40%, #0891b2 0%, transparent 50%)",
            "radial-gradient(circle at 60% 70%, #06b6d4 0%, transparent 50%), radial-gradient(circle at 30% 30%, #14b8a6 0%, transparent 50%), radial-gradient(circle at 70% 60%, #0891b2 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, #0891b2 0%, transparent 50%), radial-gradient(circle at 20% 60%, #14b8a6 0%, transparent 50%), radial-gradient(circle at 50% 80%, #06b6d4 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, #14b8a6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #06b6d4 0%, transparent 50%), radial-gradient(circle at 40% 40%, #0891b2 0%, transparent 50%)"
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {/* Secondary Aurora Layer with Purple/Pink */}
      <motion.div
        className="absolute inset-0 opacity-35"
        animate={{
          background: [
            "radial-gradient(circle at 70% 30%, #a855f7 0%, transparent 40%), radial-gradient(circle at 30% 70%, #ec4899 0%, transparent 40%)",
            "radial-gradient(circle at 40% 60%, #ec4899 0%, transparent 40%), radial-gradient(circle at 80% 40%, #a855f7 0%, transparent 40%)",
            "radial-gradient(circle at 60% 80%, #a855f7 0%, transparent 40%), radial-gradient(circle at 20% 30%, #ec4899 0%, transparent 40%)",
            "radial-gradient(circle at 70% 30%, #a855f7 0%, transparent 40%), radial-gradient(circle at 30% 70%, #ec4899 0%, transparent 40%)"
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      {/* Tertiary Aurora Layer with Orange/Yellow */}
      <motion.div
        className="absolute inset-0 opacity-25"
        animate={{
          background: [
            "radial-gradient(circle at 50% 20%, #f59e0b 0%, transparent 35%), radial-gradient(circle at 80% 80%, #f97316 0%, transparent 35%)",
            "radial-gradient(circle at 20% 50%, #f97316 0%, transparent 35%), radial-gradient(circle at 70% 60%, #f59e0b 0%, transparent 35%)",
            "radial-gradient(circle at 60% 90%, #f59e0b 0%, transparent 35%), radial-gradient(circle at 30% 20%, #f97316 0%, transparent 35%)",
            "radial-gradient(circle at 50% 20%, #f59e0b 0%, transparent 35%), radial-gradient(circle at 80% 80%, #f97316 0%, transparent 35%)"
          ]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}

// Particles Background Component (React Bits style)
const Particles = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate consistent particles using a seed-based approach
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: 2 + (i % 3) + 1, // Deterministic size based on index
    initialX: (i * 37) % 100, // Deterministic X position
    initialY: (i * 73) % 100, // Deterministic Y position
    duration: 10 + (i % 10) // Deterministic duration
  }))

  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden" />
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-white rounded-full opacity-20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.initialX}%`,
            top: `${particle.initialY}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, (particle.id % 5) * 10 - 25, 0], // Deterministic X movement
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (particle.id % 5) * 1 // Deterministic delay
          }}
        />
      ))}
    </div>
  )
}

// Rotating Text Animation Component (React Bits style)
const RotatingText = ({
  words,
  delay = 0,
  interval = 2000,
  className = ""
}: {
  words: string[]
  delay?: number
  interval?: number
  className?: string
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(delayTimer)
  }, [delay])

  useEffect(() => {
    if (!isVisible) return

    const rotationTimer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, interval)

    return () => clearInterval(rotationTimer)
  }, [isVisible, words.length, interval])

  return (
    <span className={`relative inline-block ${className}`}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20, rotateX: 90 }}
          animate={{
            opacity: currentIndex === index ? 1 : 0,
            y: currentIndex === index ? 0 : 20,
            rotateX: currentIndex === index ? 0 : 90
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut"
          }}
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "center bottom"
          }}
        >
          {word}
        </motion.span>
      ))}
      {/* Invisible placeholder to maintain consistent height */}
      <span className="opacity-0 whitespace-nowrap">
        {words[0]}
      </span>
    </span>
  )
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center items-center h-full w-full px-12 text-white">
          <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-lg">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <PawPrint className="h-12 w-12" />
              </motion.div>
              <BlurText 
                text="Penang Pet Pals" 
                delay={1000}
                animateBy="characters"
                className="text-3xl font-bold"
              />
            </motion.div>
            
            <div className="text-center">
              <BlurText 
                text="Find Your Perfect"
                delay={2000}
                animateBy="characters"
                className="text-4xl font-bold block mb-2"
              />
              <RotatingText 
                words={["Fluffy Friend", "Tail-wagging Buddy", "Whiskered Companion", "Furry Friend"]}
                delay={2500}
                interval={2500}
                className="text-4xl font-bold block"
              />
            </div>
            
            <div className="text-center">
              <BlurText 
                text="Join thousands of happy pet owners across Penang who found their companions through our platform."
                delay={3500}
                animateBy="words"
                className="text-xl text-teal-100 leading-relaxed break-words hyphens-none"
              />
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <Aurora />
        <Particles />
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center min-h-screen p-8 bg-gray-50">
        <div className="w-full max-w-md mx-auto">
          <GuestGuard>
            {children}
          </GuestGuard>
        </div>
      </div>
    </div>
  )
}
