import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface VantaFogProps {
  backgroundAlpha?: number
  baseColor?: string | number
  blurFactor?: number
  gyroControls?: boolean
  highlightColor?: string | number
  lowlightColor?: string | number
  midtoneColor?: string | number
  minHeight?: number
  minWidth?: number
  mouseControls?: boolean
  scale?: number
  scaleMobile?: number
  speed?: number
  touchControls?: boolean
  zoom?: number
}

const VantaFog: React.FC<VantaFogProps> = ({
  backgroundAlpha = 1,
  baseColor = 0xffffff,
  blurFactor = 0.9,
  gyroControls = false,
  highlightColor = 0xff6600,
  lowlightColor = 0x2d0007,
  midtoneColor = 0xff9900,
  minHeight = 200,
  minWidth = 200,
  mouseControls = true,
  scale = 2,
  scaleMobile = 4,
  speed = 1,
  touchControls = true,
  zoom = 0.6
}) => {
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)

  useEffect(() => {
    if (!vantaRef.current) return

    // Dynamically import Vanta FOG effect
    const loadVanta = async () => {
      try {
        const VANTA = await import('vanta/dist/vanta.fog.min.js')
        
        vantaEffect.current = VANTA.default({
          el: vantaRef.current,
          THREE,
          backgroundAlpha,
          baseColor,
          blurFactor,
          gyroControls,
          highlightColor,
          lowlightColor,
          midtoneColor,
          minHeight,
          minWidth,
          mouseControls,
          scale,
          scaleMobile,
          speed,
          touchControls,
          zoom
        })
      } catch (error) {
        console.error('Error loading Vanta FOG effect:', error)
      }
    }

    loadVanta()

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
      }
    }
  }, [
    backgroundAlpha,
    baseColor,
    blurFactor,
    gyroControls,
    highlightColor,
    lowlightColor,
    midtoneColor,
    minHeight,
    minWidth,
    mouseControls,
    scale,
    scaleMobile,
    speed,
    touchControls,
    zoom
  ])

  return (
    <div 
      ref={vantaRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}

export default VantaFog