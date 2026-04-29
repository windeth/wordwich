import { useState } from 'react'
import { Lightbulb, Link2, Clock } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'

const ALL_POWERUPS = [
  { key: 'insight',  label: 'Insight',   cost: 5, icon: Lightbulb, desc: 'Hint: see the Master Word’s definition' },
  { key: 'bridge',   label: 'Bridge',    cost: 2, icon: Link2,     desc: 'Middle 2 letters (not scored)' },
  { key: 'timeWarp', label: 'Time Warp', cost: 5, icon: Clock,     desc: 'Freeze timer for 30s' },
]

export default function PowerUpBar() {
  const [confirming, setConfirming] = useState(null)
  const [error, setError]           = useState(null)
  const applyPowerUp       = useGameStore(s => s.usePowerUp)
  const players            = useGameStore(s => s.players)
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex)
  const insightUsed        = useGameStore(s => s.insightUsed)
  const bridgeUsed         = useGameStore(s => s.bridgeUsed)
  const timeWarpActive     = useGameStore(s => s.timeWarpActive)
  const multiplayerType    = useGameStore(s => s.multiplayerType)
  const gameMode           = useGameStore(s => s.gameMode)
  const currentScore       = players[currentPlayerIndex]?.score ?? 0
  const isUsed             = { insight: insightUsed, bridge: bridgeUsed, timeWarp: timeWarpActive }

  // Solo Classic has no timer — Time Warp would have nothing to freeze.
  const isSoloClassic = multiplayerType === null && gameMode === 'classic'
  const POWERUPS = isSoloClassic ? ALL_POWERUPS.filter(p => p.key !== 'timeWarp') : ALL_POWERUPS

  function confirm(key) {
    const result = applyPowerUp(key)
    if (!result.ok) { setError(result.reason); setTimeout(() => setError(null), 2000) }
    setConfirming(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {POWERUPS.map(({ key, label, cost, icon: Icon }) => {
          const used     = isUsed[key]
          const canAfford= currentScore >= cost
          const disabled = used || !canAfford
          return (
            /* M3 compact pill — single-row, ~44px tall, always visible */
            <button key={key}
              onClick={() => !disabled && setConfirming(key)}
              disabled={disabled}
              style={{
                flex: 1, height: 44,
                display: 'inline-flex', flexDirection: 'row',
                alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '0 10px',
                background: disabled ? 'var(--surface-container)' : 'var(--surface-container-high)',
                border: `1px solid ${disabled ? 'var(--outline-variant)' : 'var(--primary)'}`,
                borderRadius: 'var(--shape-full)',
                opacity: disabled ? 0.38 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: `transform var(--dur-medium1) var(--ease-standard), opacity var(--dur-medium1) var(--ease-standard)`,
              }}
              onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              onMouseDown={e  => { if (!disabled) e.currentTarget.style.transform = 'scale(0.98)' }}
              onMouseUp={e    => { if (!disabled) e.currentTarget.style.transform = 'scale(1.02)' }}>
              <Icon size={16} style={{ color: disabled ? 'var(--on-surface-variant)' : 'var(--primary)', flexShrink: 0 }} />
              <span className="type-label-md" style={{ color: 'var(--on-surface)', whiteSpace: 'nowrap' }}>{label}</span>
              <span style={{
                fontSize: '11px', fontWeight: 700,
                color: 'var(--primary)',
                padding: '2px 6px',
                borderRadius: 'var(--shape-full)',
                background: 'var(--primary-container)',
                lineHeight: 1,
              }}>
                {cost}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="animate-enter" style={{
          padding: '10px 16px', borderRadius: 'var(--shape-sm)', textAlign: 'center',
          fontSize: '12px', fontWeight: 600,
          color: 'var(--error)', background: 'var(--error-container)',
        }}>
          {error}
        </div>
      )}

      {/* M3 dialog — bottom sheet */}
      {confirming && (() => {
        const pu = POWERUPS.find(p => p.key === confirming)
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 16px 32px',
            background: 'rgba(0,0,0,0.4)',
          }}>
            <div className="card-elevated animate-enter" style={{
              width: '100%', maxWidth: '480px',
              padding: '32px', borderRadius: 'var(--shape-xl)',
              display: 'flex', flexDirection: 'column', gap: '20px',
            }}>
              <div>
                <h3 className="type-title-lg" style={{ color: 'var(--on-surface)', marginBottom: '6px' }}>
                  Use {pu.label}?
                </h3>
                <p className="type-body-md" style={{ color: 'var(--on-surface-variant)' }}>{pu.desc}</p>
                <p className="type-label-lg" style={{ marginTop: '8px', color: 'var(--error)', fontWeight: 700 }}>
                  Costs {pu.cost} pts
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setConfirming(null)}
                  className="btn-outlined"
                  style={{ flex: 1, borderRadius: 'var(--shape-sm)' }}>
                  Cancel
                </button>
                <button onClick={() => confirm(confirming)}
                  className="btn-primary"
                  style={{ flex: 1, borderRadius: 'var(--shape-sm)' }}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
