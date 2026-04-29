import { Clock, Pause } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'

export default function Timer() {
  const gameMode          = useGameStore(s => s.gameMode)
  const timeRemaining     = useGameStore(s => s.timeRemaining)
  const timeWarpActive    = useGameStore(s => s.timeWarpActive)
  const timeWarpRemaining = useGameStore(s => s.timeWarpRemaining)

  const warningOn = gameMode === 'beatTheClock'
    ? timeRemaining <= 30 && !timeWarpActive
    : (gameMode === 'classic' && timeRemaining <= 10 && !timeWarpActive)
  const mins = Math.floor(timeRemaining / 60)
  const secs = timeRemaining % 60
  const display = gameMode === 'beatTheClock'
    ? `${mins}:${String(secs).padStart(2, '0')}`
    : String(timeRemaining)

  if (timeWarpActive) {
    return (
      <div style={{
        height: 48,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        padding: '0 18px',
        borderRadius: 'var(--shape-full)',
        background: 'var(--primary-container)',
        border: '1px solid var(--primary)',
        color: 'var(--on-primary-container)',
      }}>
        <Pause size={16} />
        <span style={{
          fontSize: '1.125rem', fontWeight: 800,
          letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          Frozen · {timeWarpRemaining}s
        </span>
      </div>
    )
  }

  return (
    <div
      className={warningOn ? 'animate-pulsate' : ''}
      style={{
        height: 48,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        padding: '0 20px',
        borderRadius: 'var(--shape-full)',
        background: warningOn ? 'var(--error-container)' : 'var(--surface-container-high)',
        border: `1px solid ${warningOn ? 'var(--error)' : 'var(--outline-variant)'}`,
        transition: `background var(--dur-medium2) var(--ease-standard), border-color var(--dur-medium2) var(--ease-standard)`,
      }}
    >
      <Clock size={18} style={{ color: warningOn ? 'var(--error)' : 'var(--on-surface-variant)' }} />
      <span style={{
        fontSize: '1.5rem', fontWeight: 900,
        letterSpacing: '-0.03em',
        fontVariantNumeric: 'tabular-nums',
        color: warningOn ? 'var(--error)' : 'var(--on-surface)',
        transition: `color var(--dur-medium2) var(--ease-standard)`,
      }}>
        {display}
      </span>
    </div>
  )
}
