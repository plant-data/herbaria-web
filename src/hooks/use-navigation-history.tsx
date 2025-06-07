import { useEffect, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'

export function useNavigationHistory() {
  const [history, setHistory] = useState<Array<string>>([])

  const currentPathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  useEffect(() => {
    setHistory((prev) => {
      // Don't add the same path twice in a row
      if (prev[prev.length - 1] === currentPathname) {
        return prev
      }
      // Keep only the last 10 entries to prevent memory issues
      const newHistory = [...prev, currentPathname].slice(-10)
      return newHistory
    })
  }, [currentPathname])

  const previousRoute = history.length > 1 ? history[history.length - 2] : null

  return {
    history,
    previousRoute,
    currentRoute: currentPathname,
  }
}
