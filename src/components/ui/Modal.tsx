import React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  className,
}: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative z-10 w-11/12 max-w-lg rounded-lg border border-white/20 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl shadow-2xl',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
