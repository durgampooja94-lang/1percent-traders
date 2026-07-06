'use client'
// components/course/VideoWatermark.tsx
import { useEffect, useState } from 'react'

interface VideoWatermarkProps {
  label: string
}

// Preset grid positions (percent from edges) so the watermark stays fully on-screen
const POSITIONS = [
  { top: '8%', left: '8%' },
  { top: '8%', right: '8%' },
  { bottom: '12%', left: '8%' },
  { bottom: '12%', right: '8%' },
  { top: '45%', left: '8%' },
  { top: '45%', right: '8%' },
  { top: '8%', left: '40%' },
  { bottom: '12%', left: '40%' },
] as const

function randomPosition() {
  return POSITIONS[Math.floor(Math.random() * POSITIONS.length)]
}

function randomInterval() {
  return 10000 + Math.random() * 5000 // 10-15s
}

export default function VideoWatermark({ label }: VideoWatermarkProps) {
  const [position, setPosition] = useState(randomPosition)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        setPosition(randomPosition())
        schedule()
      }, randomInterval())
    }
    schedule()
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="absolute z-10 pointer-events-none select-none px-3 py-1.5 rounded-md bg-black/20 text-white text-xs sm:text-sm font-medium tracking-wide transition-all duration-1000 ease-in-out"
      style={{ ...position, opacity: 0.25, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
    >
      {label}
    </div>
  )
}
