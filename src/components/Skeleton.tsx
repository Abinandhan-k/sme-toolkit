import { motion } from 'framer-motion'

interface SkeletonProps {
  width?: string
  height?: string
  circle?: boolean
  count?: number
  className?: string
}

export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  circle = false,
  count = 1,
  className = '',
}: SkeletonProps) {
  const skeletons = Array.from({ length: count })

  return (
    <div className="space-y-3">
      {skeletons.map((_, i) => (
        <div
          key={i}
          className={`
            ${width} ${height}
            ${circle ? 'rounded-full' : 'rounded-lg'}
            bg-gradient-to-r from-white/10 to-white/5
            overflow-hidden
            ${className}
          `}
        >
          <motion.div
            className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: ['0%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      ))}
    </div>
  )
}

// Skeleton variants for common patterns
export function SkeletonCard() {
  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
      <Skeleton height="h-6" width="w-3/4" />
      <Skeleton height="h-4" width="w-full" count={3} />
      <Skeleton height="h-10" width="w-1/3" />
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      <Skeleton height="h-12" width="w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} height="h-10" width="w-full" />
      ))}
    </div>
  )
}

export function SkeletonAvatar() {
  return <Skeleton width="w-10" height="h-10" circle />
}

export function SkeletonText() {
  return (
    <div className="space-y-2">
      <Skeleton height="h-4" width="w-full" />
      <Skeleton height="h-4" width="w-5/6" />
      <Skeleton height="h-4" width="w-4/6" />
    </div>
  )
}
