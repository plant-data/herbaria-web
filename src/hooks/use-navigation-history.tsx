import { useState, useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'

// Module-level store for navigation history
let historyStack: Array<string> = []
const subscribers = new Set<() => void>()

// Function to update the history stack and notify subscribers
function updateHistoryStack(newPath: string) {
  // Don't add the same path twice in a row
  if (
    historyStack.length > 0 &&
    historyStack[historyStack.length - 1] === newPath
  ) {
    return
  }
  // Keep only the last 10 entries to prevent memory issues
  historyStack = [...historyStack, newPath].slice(-10)
  subscribers.forEach((callback) => callback())
}

export function useNavigationHistory() {
  const currentPathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  // This effect ensures the global history stack is updated when the pathname changes.
  // It will run in every component instance using this hook.
  // updateHistoryStack has a check to prevent duplicate entries or excessive processing.
  useEffect(() => {
    updateHistoryStack(currentPathname)
  }, [currentPathname])

  // Local state to trigger re-render in the consuming component when the shared historyStack changes.
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const callback = () => {
      setVersion((v) => v + 1) // Increment version to trigger re-render
    }
    subscribers.add(callback)
    // It's possible the history stack was updated by another component instance
    // between this component's render and this effect running.
    // A re-check/re-render might be beneficial if exact sync is critical on mount,
    // but previousRoute is derived directly from historyStack on render, so it should be up-to-date.
    return () => {
      subscribers.delete(callback)
    }
  }, []) // Subscribe on mount, unsubscribe on unmount

  const previousRoute =
    historyStack.length > 1 ? historyStack[historyStack.length - 2] : null

  return {
    history: [...historyStack], // Return a copy to prevent direct mutation from outside
    previousRoute,
    currentRoute: currentPathname, // currentPathname from useRouterState is the most reliable for current
  }
}
