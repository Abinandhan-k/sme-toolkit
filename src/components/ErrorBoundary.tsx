import React, { ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo)
    }

    // Call optional error handler (e.g., Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="w-16 h-16 text-red-400" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
                <p className="text-white/70 mb-6">
                  An unexpected error occurred. Please try again or contact support if the problem persists.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
                    <p className="text-xs font-mono text-red-300 break-words">
                      {this.state.error.toString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={this.reset}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
