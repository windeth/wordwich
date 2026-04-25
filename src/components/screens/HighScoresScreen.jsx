import { Trophy } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'

export default function HighScoresScreen() {
  const navigate = useGameStore(s => s.navigate)

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100svh', padding: '48px 24px 48px',
      maxWidth: 480, margin: '0 auto', width: '100%',
      gap: 28,
    }}>
      <button onClick={() => navigate('home')}
        className="label"
        style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', padding: '4px 0' }}>
        ← Back
      </button>

      <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--on-surface)' }}>
        High Scores
      </h2>

      <div className="card" style={{
        padding: '48px 24px', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--shape-lg)',
          background: 'var(--primary-container)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Trophy size={28} style={{ color: 'var(--on-primary-container)' }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--on-surface)' }}>
            No scores yet
          </p>
          <p className="type-body-md" style={{ marginTop: 6, color: 'var(--on-surface-variant)' }}>
            Play a game to get on the board!
          </p>
        </div>
        <button onClick={() => navigate('difficulty')}
          className="btn-primary"
          style={{ borderRadius: 'var(--shape-sm)', height: 48, padding: '0 28px', marginTop: 8, fontSize: '0.9rem', fontWeight: 700 }}>
          Play Now
        </button>
      </div>
    </div>
  )
}
