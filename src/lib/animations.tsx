/**
 * Global animation and hover effect utilities
 * These can be applied to components using Framer Motion
 */

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

/**
 * Hover lift effect wrapper component
 * Lifts element on hover with smooth animation
 */
interface HoverLiftProps {
  children: ReactNode
  scale?: number
  y?: number
  className?: string
}

export function HoverLift({
  children,
  scale = 1.05,
  y = -8,
  className = '',
}: HoverLiftProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale,
        y,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Framer Motion variants for common animations
 */
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const slideInVariants = {
  hidden: { x: -50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
  exit: { x: -50, opacity: 0, transition: { duration: 0.3 } },
}

export const scaleInVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4 },
  },
  exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } },
}

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

/**
 * Tailwind utility classes for hover lift effects
 * Add to any element for lift effect
 */
export const HOVER_LIFT_CLASSES =
  'transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1'

export const HOVER_SCALE_CLASSES =
  'transition-all duration-300 hover:scale-110'

export const HOVER_GLOW_CLASSES =
  'transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'

/**
 * Combination of hover effects
 */
export const HOVER_CARD_CLASSES = `
  transition-all duration-300
  hover:shadow-xl hover:shadow-blue-500/20
  hover:scale-105 hover:-translate-y-2
  cursor-pointer
`

export const HOVER_BUTTON_CLASSES = `
  transition-all duration-200
  hover:scale-105
  active:scale-95
`

/**
 * Tailwind animation classes for shimmer effect
 */
export const SHIMMER_ANIMATION = `
  animate-pulse
  opacity-100 transition-opacity
`

/**
 * Create hover effect using just Tailwind and Framer Motion
 * Usage: className={applyHoverEffect()}
 */
export function applyHoverEffect(
  type: 'lift' | 'scale' | 'glow' | 'card' | 'button' = 'card'
): string {
  const effects = {
    lift: HOVER_LIFT_CLASSES,
    scale: HOVER_SCALE_CLASSES,
    glow: HOVER_GLOW_CLASSES,
    card: HOVER_CARD_CLASSES,
    button: HOVER_BUTTON_CLASSES,
  }
  return effects[type]
}

/**
 * SpringConfig for common animations
 */
export const SPRING_CONFIG = {
  gentle: { stiffness: 100, damping: 10 },
  snappy: { stiffness: 300, damping: 20 },
  bouncy: { stiffness: 200, damping: 10 },
  stiff: { stiffness: 400, damping: 30 },
}
