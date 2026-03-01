import { useEffect } from 'react'

interface HotKeyBindings {
  [key: string]: (e: KeyboardEvent) => void
}

export function useHotkeys(bindings: HotKeyBindings, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      const isShift = e.shiftKey
      const isAlt = e.altKey

      // Build key combination string
      const parts = []
      if (isCtrlOrCmd) parts.push('ctrl')
      if (isShift) parts.push('shift')
      if (isAlt) parts.push('alt')
      parts.push(key)
      const combo = parts.join('+')

      // Check for simple key or combination
      if (bindings[combo]) {
        e.preventDefault()
        bindings[combo](e)
      } else if (bindings[key] && !isCtrlOrCmd && !isShift && !isAlt) {
        e.preventDefault()
        bindings[key](e)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [bindings, enabled])
}

// Predefined common hotkeys
export const COMMON_HOTKEYS = {
  NEW: 'ctrl+n',
  SAVE: 'ctrl+s',
  SEARCH: 'ctrl+f',
  ESCAPE: 'escape',
  ENTER: 'enter',
  DELETE: 'delete',
}
