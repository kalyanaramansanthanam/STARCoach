import { useState, useRef, useCallback, useEffect } from 'react'

export default function useTimer(initialSeconds = 120, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const start = useCallback(() => {
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
          onExpireRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
  }, [])

  const reset = useCallback((newSeconds) => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setSecondsLeft(newSeconds ?? initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  const color = secondsLeft <= 15 ? 'text-red-500' : secondsLeft <= 30 ? 'text-yellow-400' : 'text-green-400'

  return { secondsLeft, isRunning, start, stop, reset, color }
}
