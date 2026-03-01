import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white/10 group-[.toaster]:text-white group-[.toaster]:border-white/20 group-[.toaster]:backdrop-blur-lg',
          description: 'group-[.toast]:text-white/70',
          actionButton: 'group-[.toast]:bg-blue-600 group-[.toast]:text-white',
          cancelButton: 'group-[.toast]:bg-white/10 group-[.toast]:text-white',
        },
      }}
    />
  )
}
