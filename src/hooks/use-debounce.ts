import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A hook that returns a debounced version of the provided value
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Update debounced value after specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: clear timeout if value changes or component unmounts
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Creates a debounced version of a callback function
 * @param callback The function to debounce
 * @param delay The delay in milliseconds (default: 300ms)
 * @returns A debounced version of the callback
 */
export function useDebouncedCallback<T extends (...args: Array<any>) => any>(
  callback: T,
  delay = 300,
): (...args: Parameters<T>) => void {
  // Store the timeout reference
  const timeoutRef = useRef<number | null>(null)

  // Return a memoized version of the debounced function
  return useCallback(
    (...args: Parameters<T>) => {
      // Clear the previous timeout if it exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay],
  )
}
