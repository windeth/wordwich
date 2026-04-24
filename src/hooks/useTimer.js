import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'

export function useTimer() {
  const screen = useGameStore(s => s.screen)
  const gameMode = useGameStore(s => s.gameMode)
  const timeWarpActive = useGameStore(s => s.timeWarpActive)
  const tickTimer = useGameStore(s => s.tickTimer)
  const tickTimeWarp = useGameStore(s => s.tickTimeWarp)

  const timerRef = useRef(null)
  const warpRef = useRef(null)

  useEffect(() => {
    if (screen !== 'game') {
      clearInterval(timerRef.current)
      clearInterval(warpRef.current)
      return
    }
    timerRef.current = setInterval(tickTimer, 1000)
    return () => clearInterval(timerRef.current)
  }, [screen, gameMode, tickTimer])

  useEffect(() => {
    if (!timeWarpActive) {
      clearInterval(warpRef.current)
      return
    }
    warpRef.current = setInterval(tickTimeWarp, 1000)
    return () => clearInterval(warpRef.current)
  }, [timeWarpActive, tickTimeWarp])
}
