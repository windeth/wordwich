import { Brain, Timer, WifiOff } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'

export default function MultiplayerScreen() {
  const navigate           = useGameStore(s => s.navigate)
  const setMultiplayerType = useGameStore(s => s.setMultiplayerType)
  const setGameMode        = useGameStore(s => s.setGameMode)
  const setRoundLimit      = useGameStore(s => s.setRoundLimit)

  function handleClassic() {
    setMultiplayerType('local')
    setGameMode('classic')
    navigate('difficulty')
  }

  function handleBeatTheClock() {
    setMultiplayerType('local')
    setGameMode('beatTheClock')
    setRoundLimit(10)
    navigate('playersetup')
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
          Multiplayer
        </h2>
        <p className="type-body-md" style={{ marginTop: 6, color: 'var(--on-surface-variant)' }}>
          Pick a mode. Each player gets a unique prompt every turn.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Classic Multiplayer */}
        <button onClick={handleClassic}
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
            <p className="type-body-md" style={{ marginTop: 2, color: 'var(--on-surface-variant)' }}>Pass-and-play. Submit a word or skip; pick rounds &amp; difficulty.</p>
          </div>
        </button>

        {/* Beat the Clock Multiplayer */}
        <button onClick={handleBeatTheClock}
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
            <p className="type-body-md" style={{ marginTop: 2, color: 'var(--on-surface-variant)' }}>10 prompts per player. 60s each — miss it, score 0 and pass.</p>
          </div>
        </button>

        {/* Multi-device — coming soon */}
        <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, opacity: 0.45 }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--shape-md)', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <WifiOff size={22} style={{ color: 'var(--on-surface-variant)' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--on-surface)' }}>Multi-device</p>
            <p className="type-body-md" style={{ marginTop: 2, color: 'var(--on-surface-variant)' }}>Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
