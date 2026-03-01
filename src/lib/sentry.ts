/**
 * Sentry Configuration and Integration
 * 
 * To enable Sentry:
 * 1. Install: npm install @sentry/react @sentry/tracing
 * 2. Create a Sentry account and project
 * 3. Set VITE_SENTRY_DSN in .env.local
 * 4. Call initializeSentry() in App.tsx
 */

export type SentryLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug'

export interface SentryConfig {
  enabled: boolean
  dsn: string
  environment: string
  tracesSampleRate: number
  debug: boolean
}

/**
 * Initialize Sentry if configured
 */
export async function initializeSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.MODE

  if (!dsn) {
    console.info('Sentry not configured (VITE_SENTRY_DSN not set)')
    return null
  }

  try {
    const Sentry = await import('@sentry/react')

    Sentry.init({
      dsn,
      environment,
      integrations: [
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter out certain errors in development
        if (environment === 'development' && hint.originalException) {
          return null
        }
        return event
      },
    })

    console.info('Sentry initialized successfully')
    return Sentry
  } catch (error) {
    console.error('Failed to initialize Sentry:', error)
    return null
  }
}

/**
 * Capture exception with Sentry
 */
export function captureException(
  error: Error | string,
  level: SentryLevel = 'error',
  context?: Record<string, any>
) {
  try {
    // Dynamically import Sentry if needed
    if (typeof window !== 'undefined' && (window as any).__SENTRY_RELEASE__) {
      const Sentry = (window as any).Sentry
      if (Sentry) {
        if (context) {
          Sentry.setContext('additional', context)
        }
        Sentry.captureException(error, { level })
      }
    }
  } catch (err) {
    console.error('Failed to capture exception with Sentry:', err)
  }
}

/**
 * Capture message with Sentry
 */
export function captureMessage(
  message: string,
  level: SentryLevel = 'info',
  context?: Record<string, any>
) {
  try {
    if (typeof window !== 'undefined' && (window as any).__SENTRY_RELEASE__) {
      const Sentry = (window as any).Sentry
      if (Sentry) {
        if (context) {
          Sentry.setContext('additional', context)
        }
        Sentry.captureMessage(message, level)
      }
    }
  } catch (err) {
    console.error('Failed to capture message with Sentry:', err)
  }
}

/**
 * Set user context in Sentry
 */
export function setSentryUser(userId: string, email?: string, username?: string) {
  try {
    if (typeof window !== 'undefined' && (window as any).__SENTRY_RELEASE__) {
      const Sentry = (window as any).Sentry
      if (Sentry) {
        Sentry.setUser({
          id: userId,
          email,
          username,
        })
      }
    }
  } catch (err) {
    console.error('Failed to set Sentry user:', err)
  }
}

/**
 * Clear user context in Sentry
 */
export function clearSentryUser() {
  try {
    if (typeof window !== 'undefined' && (window as any).__SENTRY_RELEASE__) {
      const Sentry = (window as any).Sentry
      if (Sentry) {
        Sentry.setUser(null)
      }
    }
  } catch (err) {
    console.error('Failed to clear Sentry user:', err)
  }
}

/**
 * Manually trigger a breadcrumb in Sentry
 */
export function addSentryBreadcrumb(
  message: string,
  category: string = 'user',
  data?: Record<string, any>
) {
  try {
    if (typeof window !== 'undefined' && (window as any).__SENTRY_RELEASE__) {
      const Sentry = (window as any).Sentry
      if (Sentry) {
        Sentry.addBreadcrumb({
          message,
          category,
          data,
        })
      }
    }
  } catch (err) {
    console.error('Failed to add Sentry breadcrumb:', err)
  }
}
