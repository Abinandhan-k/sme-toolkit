import { useRef, useCallback, useEffect, useState } from 'react'

interface UseInfiniteScrollOptions {
  threshold?: number
  onLoadMore?: () => void
}

export function useInfiniteScroll({
  threshold = 200,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && onLoadMore) {
          setIsLoading(true)
          onLoadMore()
          setIsLoading(false)
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [isLoading, onLoadMore, threshold])

  return {
    observerTarget,
    isLoading,
  }
}
