import { Brain, Timer } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'

export default function SinglePlayerScreen() {
  const navigate    = useGameStore(s => s.navigate)
  const setGameMode = useGameStore(s => s.setGameMode)
  const setPlayers  = useGameStore(s => s.setPlayers)
  const startGame   = useGameStore(s => s.startGame)

  function pickClassic() {
    setGameMode('classic')
    navigate('soloclassicsetup')
  }

  function pickBTC() {
    // BTC has auto-progressing difficulty — no picker, jump straight in.
    setGameMode('beatTheClock')
    setPlayers([{ id: 0, name: 'Player 1', score: 0, streak: 0, longestWord: '', roundsWon: 0 }])
    startGame()
  }

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100svh', padding: '48px 24px 40px',
      maxWidth: 480, margin: '0 auto', width: '100%',
      gap: 32,
    }}>
      <button onClick={() => navigate('home')}
        className="label"
        style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', padding: '4px 0' }}>
        ← Back
      </button>

      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--on-surface)' }}>
          Single Player
        </h2>
        <p className="type-body-md" style={{ marginTop: 6, color: 'var(--on-surface-variant)' }}>
          Pick a mode to play.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={pickClassic}
          className="card"
          style={{
            width: '100%', padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 20,
            border: 'none', cursor: 'pointer', textAlign: 'left',
            transition: `transform var(--dur-medium1) var(--ease-standard)`,
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e    => e.currentTarget.style.transform = 'scale(1.02)'}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--shape-md)', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Brain size={22} style={{ color: 'var(--on-primary-container)' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--on-surface)' }}>Classic</p>
            <p className="type-body-md" style={{ marginTop: 2, color: 'var(--on-surface-variant)' }}>No timer. Pick rounds, beat the Master Word.</p>
          </div>
        </button>

        <button onClick={pickBTC}
          className="card"
          style={{
            width: '100%', padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 20,
            border: 'none', cursor: 'pointer', textAlign: 'left',
            transition: `transform var(--dur-medium1) var(--ease-standard)`,
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e    => e.currentTarget.style.transform = 'scale(1.02)'}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--shape-md)', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Timer size={22} style={{ color: 'var(--on-primary-container)' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--on-surface)' }}>Beat the Clock</p>
            <p className="type-body-md" style={{ marginTop: 2, color: 'var(--on-surface-variant)' }}>Survive the countdown. Each word adds a minute.</p>
          </div>
        </button>
      </div>
    </div>
  )
}
