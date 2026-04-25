import { useGameStore } from '../store/useGameStore'

export default function Timer() {
  const gameMode          = useGameStore(s => s.gameMode)
  const timeRemaining     = useGameStore(s => s.timeRemaining)
  const timeBank          = useGameStore(s => s.timeBank)
  const timeWarpActive    = useGameStore(s => s.timeWarpActive)
  const timeWarpRemaining = useGameStore(s => s.timeWarpRemaining)

  const seconds   = gameMode === 'classic' ? timeRemaining : timeBank
  const isWarning = gameMode === 'classic' && timeRemaining <= 10 && !timeWarpActive
  const mins      = Math.floor(seconds / 60)
  const secs      = seconds % 60
  const display   = gameMode === 'beatTheClock'
    ? `${mins}:${String(secs).padStart(2, '0')}`
    : String(seconds)

  if (timeWarpActive) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{
        padding: '10px 20px', borderRadius: 'var(--shape-full)',
        background: 'var(--primary-container)',
        border: '1px solid var(--primary)',
        color: 'var(--on-primary-container)',
        fontSize: '0.875rem', fontWeight: 700,
      }}>
        ⏸ Frozen — {timeWarpRemaining}s
      </div>
      <span className="label">Time Warp active</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <span
        className={isWarning ? 'animate-pulsate' : ''}
        style={{
          fontSize: '5rem', fontWeight: 900,
          letterSpacing: '-0.04em', lineHeight: 1,
          tabularNums: 'tabular-nums',
          color: isWarning ? 'var(--error)' : 'var(--on-surface)',
          transition: `color var(--dur-medium2) var(--ease-standard)`,
        }}
      >
        {display}
      </span>
      <span className="label">{gameMode === 'beatTheClock' ? 'Time Bank' : 'Seconds Left'}</span>
    </div>
  )
}
