declare interface ImportMetaEnv {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
  VITE_GOOGLE_CLIENT_ID?: string
  VITE_SENTRY_DSN?: string
  VITE_API_BASE_URL?: string
  VITE_DEBUG?: string
  VITE_SOURCE_MAP?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '@react-pdf/renderer'
declare module 'html2canvas'
declare module 'jspdf'
declare module 'date-fns'
declare module 'html2canvas'
declare module 'chart.js'
declare module '@sentry/react'

declare module '@/components/Modal' {
  const Modal: any
  export default Modal
}

declare module '@/lib/supabase' {
  // supabase client typed as any to avoid DB typing overhead in this iteration
  export const supabase: any
  export default supabase
}

declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.webp'

// allow using process.env in browser code without Node types
declare const process: any
