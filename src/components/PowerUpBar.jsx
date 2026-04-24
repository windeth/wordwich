import { useState } from 'react'
import { Lightbulb, Link2, Clock } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'

const POWERUPS = [
  { key: 'insight', label: 'Insight', cost: 5, icon: Lightbulb, desc: 'Reveal the Master Word' },
  { key: 'bridge', label: 'Bridge', cost: 2, icon: Link2, desc: 'Reveal 2 middle letters (not scored)' },
  { key: 'timeWarp', label: 'Time Warp', cost: 5, icon: Clock, desc: 'Freeze timer for 30s' },
]

export default function PowerUpBar() {
  const [confirming, setConfirming] = useState(null)
  const [error, setError] = useState(null)
  const usePowerUp = useGameStore(s => s.usePowerUp)
  const players = useGameStore(s => s.players)
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex)
  const insightUsed = useGameStore(s => s.insightUsed)
  const bridgeUsed = useGameStore(s => s.bridgeUsed)
  const timeWarpActive = useGameStore(s => s.timeWarpActive)
  const currentScore = players[currentPlayerIndex]?.score ?? 0

  function confirm(key) {
    const result = usePowerUp(key)
    if (!result.ok) {
      setError(result.reason)
      setTimeout(() => setError(null), 2000)
    }
    setConfirming(null)
  }

  const isUsed = { insight: insightUsed, bridge: bridgeUsed, timeWarp: timeWarpActive }

  return (
    <div className="space-y-2 w-full">
      <p className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: 'var(--text3)' }}>
        Power-Ups
      </p>
      <div className="flex gap-2">
        {POWERUPS.map(({ key, label, cost, icon: Icon }) => {
          const used = isUsed[key]
          const canAfford = currentScore >= cost
          const disabled = used || !canAfford
          return (
            <button
              key={key}
              onClick={() => !disabled && setConfirming(key)}
              disabled={disabled}
              className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all active:scale-95"
              style={{
                background: disabled ? 'var(--surface2)' : 'var(--surface)',
                borderColor: disabled ? 'var(--border)' : 'var(--primary)',
                opacity: disabled ? 0.4 : 1,
                boxShadow: disabled ? 'none' : 'var(--shadow-sm)',
              }}
            >
              <Icon size={16} style={{ color: disabled ? 'var(--text3)' : 'var(--primary)' }} />
              <span className="text-xs font-bold leading-none" style={{ color: 'var(--text)' }}>{label}</span>
              <span className="text-xs font-black leading-none" style={{ color: 'var(--primary)' }}>{cost}pt</span>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="text-center text-xs font-bold py-1.5 rounded-xl"
          style={{ color: 'var(--danger)', background: 'var(--danger-l)' }}>
          {error}
        </div>
      )}

      {confirming && (() => {
        const pu = POWERUPS.find(p => p.key === confirming)
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="card-elevated w-full max-w-sm p-6 space-y-4 animate-fade-slide">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black" style={{ color: 'var(--text)' }}>Use {pu.label}?</h3>
                <p className="text-sm" style={{ color: 'var(--text2)' }}>{pu.desc}</p>
                <p className="text-sm font-black" style={{ color: 'var(--danger)' }}>Costs {pu.cost} pts</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirming(null)} className="btn-ghost flex-1 py-3 text-sm">
                  Cancel
                </button>
                <button onClick={() => confirm(confirming)} className="btn-primary flex-1 py-3 text-sm">
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
