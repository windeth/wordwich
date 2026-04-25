import { Users, Wifi, WifiOff } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'

export default function MultiplayerScreen() {
  const navigate           = useGameStore(s => s.navigate)
  const setMultiplayerType = useGameStore(s => s.setMultiplayerType)

  function handleLocalPlay() {
    setMultiplayerType('local')
    navigate('difficulty')
  }

  function handleHostGame() {
    setMultiplayerType('host')
    navigate('difficulty')
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
          Choose how you want to play with others.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Local Play */}
        <button onClick={handleLocalPlay}
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
            <Users size={22} style={{ color: 'var(--on-primary-container)' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--on-surface)' }}>Local Play</p>
            <p className="type-body-md" style={{ marginTop: 2, color: 'var(--on-surface-variant)' }}>Pass-and-play on this device</p>
          </div>
        </button>

        {/* Host Game */}
        <button onClick={handleHostGame}
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
            <Wifi size={22} style={{ color: 'var(--on-primary-container)' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--on-surface)' }}>Host Game</p>
            <p className="type-body-md" style={{ marginTop: 2, color: 'var(--on-surface-variant)' }}>Start a Beat the Clock session</p>
          </div>
        </button>

        {/* Join Game — coming soon */}
        <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, opacity: 0.45 }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--shape-md)', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <WifiOff size={22} style={{ color: 'var(--on-surface-variant)' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--on-surface)' }}>Join Game</p>
            <p className="type-body-md" style={{ marginTop: 2, color: 'var(--on-surface-variant)' }}>Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
