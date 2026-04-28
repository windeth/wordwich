import { useState } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'
import { fetchDefinition } from '../../game/engine'

export default function SoloClassicEndScreen() {
  const players      = useGameStore(s => s.players)
  const currentRound = useGameStore(s => s.currentRound)
  const masterWord   = useGameStore(s => s.masterWord)
  const startGame    = useGameStore(s => s.startGame)
  const resetGame    = useGameStore(s => s.resetGame)

  const player = players[0] ?? null
  const score = player?.score ?? 0
  const longest = player?.longestWord ?? ''
  const roundsPlayed = currentRound

  const [definition, setDefinition] = useState(null)
  const [defLoading, setDefLoading] = useState(false)
  const [defShown, setDefShown]     = useState(false)

  async function showDef() {
    if (!masterWord) return
    setDefShown(true); setDefLoading(true)
    const def = await fetchDefinition(masterWord)
    setDefinition(def); setDefLoading(false)
  }

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100svh', padding: '48px 24px 40px',
      gap: 28, maxWidth: 480, margin: '0 auto', width: '100%',
    }}>
      <div>
        <h1 style={{
          fontSize: '3rem', fontWeight: 800,
          letterSpacing: '-0.04em', lineHeight: 1,
          color: 'var(--on-surface)',
        }}>
          Final Score
        </h1>
        <p className="type-body-md" style={{ marginTop: 8, color: 'var(--on-surface-variant)' }}>
          Classic · {roundsPlayed} round{roundsPlayed === 1 ? '' : 's'} played
        </p>
      </div>

      <div className="card-elevated" style={{
        width: '100%', padding: '32px 28px',
        textAlign: 'center', borderRadius: 'var(--shape-xl)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <span className="label">Total points</span>
        <p style={{
          fontSize: '4rem', fontWeight: 900,
          letterSpacing: '-0.04em', lineHeight: 1,
          color: 'var(--primary)',
        }}>
          {score}
        </p>
      </div>

      {longest && (
        <div className="card" style={{ width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--shape-md)', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={22} style={{ color: 'var(--on-primary-container)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <span className="label" style={{ display: 'block', marginBottom: 4 }}>Longest word</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--on-surface)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {longest}
            </p>
            <span className="label">{longest.length} letters</span>
          </div>
        </div>
      )}

      {masterWord && (
        <div className="card" style={{ width: '100%', padding: '20px 24px' }}>
          <span className="label" style={{ display: 'block', marginBottom: 8 }}>Last Master Word</span>
          <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--on-surface)', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 12 }}>
            {masterWord}
          </p>
          {!defShown ? (
            <button onClick={showDef}
              className="btn-outlined"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 18px', minHeight: 40, borderRadius: 'var(--shape-full)', fontSize: 13 }}>
              <BookOpen size={13} />
              View Definition
            </button>
          ) : (
            <div className="card-inset animate-enter" style={{ padding: 16, textAlign: 'left' }}>
              {defLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Loader2 size={14} className="animate-pulse-soft" style={{ color: 'var(--primary)' }} />
                  <span className="type-body-md" style={{ color: 'var(--on-surface-variant)' }}>Looking it up…</span>
                </div>
              ) : definition ? (
                <p className="type-body-md" style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic', lineHeight: 1.6 }}>
                  {definition}
                </p>
              ) : (
                <p className="type-body-md" style={{ color: 'var(--on-surface-variant)' }}>No definition found.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ width: '100%', display: 'flex', gap: 12, marginTop: 'auto' }}>
        <button onClick={resetGame}
          className="btn-outlined"
          style={{ flex: 1, borderRadius: 'var(--shape-lg)', height: 56, fontSize: '1rem', fontWeight: 700 }}>
          Home
        </button>
        <button onClick={startGame}
          className="btn-primary"
          style={{ flex: 1, borderRadius: 'var(--shape-lg)', height: 56, fontSize: '1rem', fontWeight: 700 }}>
          Play Again
        </button>
      </div>
    </div>
  )
}
