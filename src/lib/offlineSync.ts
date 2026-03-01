import { supabase } from '@/lib/supabase'

interface QueuedRequest {
  id: string
  method: string
  table: string
  data: any
  timestamp: number
  retries: number
}

const STORAGE_KEY = 'offline_queue'
const MAX_RETRIES = 3

class OfflineQueue {
  private queue: QueuedRequest[] = []

  constructor() {
    this.loadQueue()
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      this.queue = stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load offline queue:', error)
      this.queue = []
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }

  add(method: string, table: string, data: any) {
    const request: QueuedRequest = {
      id: `${Date.now()}-${Math.random()}`,
      method,
      table,
      data,
      timestamp: Date.now(),
      retries: 0,
    }
    this.queue.push(request)
    this.saveQueue()
    return request.id
  }

  async processQueue(): Promise<number> {
    let processed = 0

    for (let i = this.queue.length - 1; i >= 0; i--) {
      const request = this.queue[i]

      try {
        const success = await this.processRequest(request)
        if (success) {
          this.queue.splice(i, 1)
          processed++
        } else if (request.retries >= MAX_RETRIES) {
          console.error(`Max retries reached for request ${request.id}`)
          this.queue.splice(i, 1)
        } else {
          request.retries++
        }
      } catch (error) {
        console.error(`Error processing request ${request.id}:`, error)
        if (request.retries >= MAX_RETRIES) {
          this.queue.splice(i, 1)
        } else {
          request.retries++
        }
      }
    }

    this.saveQueue()
    return processed
  }

  private async processRequest(request: QueuedRequest): Promise<boolean> {
    const { method, table, data } = request

    try {
      let query = supabase.from(table)

      switch (method) {
        case 'insert':
          await query.insert(data)
          break
        case 'update':
          await query.update(data).eq('id', data.id)
          break
        case 'delete':
          await query.delete().eq('id', data.id)
          break
        default:
          return false
      }

      return true
    } catch (error) {
      throw error
    }
  }

  getQueueSize() {
    return this.queue.length
  }

  clearQueue() {
    this.queue = []
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const offlineQueue = new OfflineQueue()

// Monitor connection status
export function initializeOfflineSync() {
  let isOnline = navigator.onLine

  const handleOnline = async () => {
    if (!isOnline) {
      isOnline = true
      console.log('Back online, processing queue...')
      try {
        const processed = await offlineQueue.processQueue()
        console.log(`Processed ${processed} queued requests`)
      } catch (error) {
        console.error('Error processing offline queue:', error)
      }
    }
  }

  const handleOffline = () => {
    isOnline = false
    console.log('Offline mode enabled')
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Cleanup
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

// Hook for using offline queue in components
export function useOfflineSync() {
  return {
    addToQueue: (method: string, table: string, data: any) => offlineQueue.add(method, table, data),
    processQueue: () => offlineQueue.processQueue(),
    getQueueSize: () => offlineQueue.getQueueSize(),
    clearQueue: () => offlineQueue.clearQueue(),
  }
}
