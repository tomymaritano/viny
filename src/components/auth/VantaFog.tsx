import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { logger } from '../../utils/logger'

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
  zoom = 0.6,
}) => {
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)
  const [webGLAvailable, setWebGLAvailable] = useState(true)

  useEffect(() => {
    if (!vantaRef.current) return

    // Check WebGL availability first
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        return !!gl
      } catch (e) {
        return false
      }
    }

    if (!checkWebGL()) {
      logger.warn('WebGL not available, using fallback background')
      setWebGLAvailable(false)
      return
    }

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
          zoom,
        })
      } catch (error) {
        logger.error('Error loading Vanta FOG effect:', error)
        setWebGLAvailable(false)
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
    zoom,
  ])

  // Fallback gradient when WebGL is not available
  if (!webGLAvailable) {
    return (
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          zIndex: 0,
          background: 'linear-gradient(135deg, #1a1c2e 0%, #2d1b69 50%, #0f0c29 100%)',
          animation: 'gradientShift 10s ease infinite',
        }}
      />
    )
  }

  return (
    <div
      ref={vantaRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}

export default VantaFog
