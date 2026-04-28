import { useState } from 'react'
import { Infinity as InfinityIcon } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'

const ROUND_OPTIONS = [
  { value: 3,    label: '3' },
  { value: 5,    label: '5' },
  { value: 10,   label: '10' },
  { value: null, label: '∞', subtitle: 'Unlimited' },
]

export default function SoloClassicSetupScreen() {
  const navigate      = useGameStore(s => s.navigate)
  const setRoundLimit = useGameStore(s => s.setRoundLimit)
  const setPlayers    = useGameStore(s => s.setPlayers)
  const [selected, setSelected] = useState(5)

  function handleContinue() {
    setRoundLimit(selected)
    setPlayers([{ id: 0, name: 'Player 1', score: 0, streak: 0, longestWord: '', roundsWon: 0 }])
    navigate('difficulty')
  }

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100svh', padding: '48px 24px 40px',
      maxWidth: 480, margin: '0 auto', width: '100%',
      gap: 32,
    }}>
      <button onClick={() => navigate('singleplayer')}
        className="label"
        style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', padding: '4px 0' }}>
        ← Back
      </button>

      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--on-surface)' }}>
          How many rounds?
        </h2>
        <p className="type-body-md" style={{ marginTop: 6, color: 'var(--on-surface-variant)' }}>
          Each round is a fresh prompt and a fresh Master Word.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {ROUND_OPTIONS.map(opt => {
          const active = selected === opt.value
          return (
            <button key={String(opt.value)} onClick={() => setSelected(opt.value)}
              className="card"
              style={{
                padding: '16px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 4, minHeight: 72, cursor: 'pointer',
                border: active ? '2px solid var(--primary)' : '2px solid transparent',
                background: active ? 'var(--primary-container)' : 'var(--surface-container-high)',
                transition: `transform var(--dur-medium1) var(--ease-standard), border-color var(--dur-medium1) var(--ease-standard)`,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
              {opt.value === null ? (
                <InfinityIcon size={28} style={{ color: active ? 'var(--on-primary-container)' : 'var(--on-surface)' }} />
              ) : (
                <span style={{
                  fontSize: '1.75rem', fontWeight: 900,
                  color: active ? 'var(--on-primary-container)' : 'var(--on-surface)',
                  letterSpacing: '-0.02em', lineHeight: 1,
                }}>{opt.label}</span>
              )}
              {opt.subtitle && (
                <span className="label" style={{ color: active ? 'var(--on-primary-container)' : 'var(--on-surface-variant)' }}>
                  {opt.subtitle}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <button onClick={handleContinue}
        className="btn-primary"
        style={{ width: '100%', borderRadius: 'var(--shape-lg)', height: 56, fontSize: '1rem', fontWeight: 700, marginTop: 'auto' }}>
        Continue →
      </button>
    </div>
  )
}
