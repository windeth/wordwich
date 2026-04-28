import { Trophy, Timer as TimerIcon, BookOpen } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'
import { getBTCBest } from '../../lib/highScores'

function fmtTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function BTCGameOverScreen() {
  const lastResult = useGameStore(s => s.lastBTCResult)
  const startGame  = useGameStore(s => s.startGame)
  const resetGame  = useGameStore(s => s.resetGame)

  const words        = lastResult?.words ?? 0
  const timeSurvived = lastResult?.timeSurvived ?? 0
  const isNewBest    = lastResult?.isNewBest ?? false
  const best         = getBTCBest()

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: '100svh', padding: '48px 24px 40px',
      gap: 28, maxWidth: 480, margin: '0 auto', width: '100%',
    }}>
      <div style={{ alignSelf: 'flex-start' }}>
        <h1 style={{
          fontSize: '3rem', fontWeight: 800,
          letterSpacing: '-0.04em', lineHeight: 1,
          color: 'var(--on-surface)',
        }}>
          Game Over
        </h1>
        <p className="type-body-md" style={{ marginTop: 8, color: 'var(--on-surface-variant)' }}>
          Beat the Clock
        </p>
      </div>

      {isNewBest && (
        <div className="animate-enter" style={{
          width: '100%', padding: '14px 20px',
          background: 'var(--warning-container)',
          color: 'var(--warning)',
          borderRadius: 'var(--shape-md)',
          fontWeight: 800, fontSize: '0.95rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          🏆 New Best!
        </div>
      )}

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--shape-md)', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={22} style={{ color: 'var(--on-primary-container)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <span className="label" style={{ display: 'block', marginBottom: 4 }}>Words completed</span>
            <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--on-surface)', letterSpacing: '-0.02em', lineHeight: 1 }}>{words}</p>
          </div>
        </div>

        <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--shape-md)', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TimerIcon size={22} style={{ color: 'var(--on-primary-container)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <span className="label" style={{ display: 'block', marginBottom: 4 }}>Time survived</span>
            <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--on-surface)', letterSpacing: '-0.02em', lineHeight: 1 }}>{fmtTime(timeSurvived)}</p>
          </div>
        </div>

        {best && !isNewBest && (
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface-container-high)' }}>
            <Trophy size={18} style={{ color: 'var(--on-surface-variant)' }} />
            <div style={{ flex: 1 }}>
              <span className="label">Personal best</span>
              <p className="type-body-md" style={{ color: 'var(--on-surface)', fontWeight: 700 }}>
                {fmtTime(best.timeSurvived)} · {best.words} words
              </p>
            </div>
          </div>
        )}
      </div>

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
