import { useGameStore } from '../store/useGameStore'

export default function Timer() {
  const gameMode = useGameStore(s => s.gameMode)
  const timeRemaining = useGameStore(s => s.timeRemaining)
  const timeBank = useGameStore(s => s.timeBank)
  const timeWarpActive = useGameStore(s => s.timeWarpActive)
  const timeWarpRemaining = useGameStore(s => s.timeWarpRemaining)

  const seconds = gameMode === 'classic' ? timeRemaining : timeBank
  const isWarning = gameMode === 'classic' && timeRemaining <= 10 && !timeWarpActive
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = gameMode === 'beatTheClock'
    ? `${mins}:${String(secs).padStart(2, '0')}`
    : String(seconds)

  if (timeWarpActive) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className="px-5 py-2 rounded-2xl font-black text-lg tracking-wider"
          style={{ background: 'var(--primary-l)', color: 'var(--primary)', border: '2px solid var(--primary)' }}
        >
          ⏸ FROZEN — {timeWarpRemaining}s
        </div>
        <span className="text-xs" style={{ color: 'var(--text3)' }}>Time Warp active</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`text-6xl font-black tabular-nums ${isWarning ? 'animate-pulsate' : ''}`}
        style={isWarning
          ? { color: 'var(--danger)' }
          : { color: 'var(--text)' }
        }
      >
        {display}
      </span>
      <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
        {gameMode === 'beatTheClock' ? 'Time Bank' : 'Seconds'}
      </span>
    </div>
  )
}
