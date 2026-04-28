import { Sun, Moon } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'
import { useTheme } from '../../hooks/useTheme'
import logo from '../../assets/logo.svg'

export default function HomeScreen() {
  const navigate         = useGameStore(s => s.navigate)
  const setMultiplayerType = useGameStore(s => s.setMultiplayerType)
  const { theme, toggle } = useTheme()

  function goSinglePlayer() {
    setMultiplayerType(null)
    navigate('singleplayer')
  }

  function goMultiplayer() {
    navigate('multiplayer')
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100svh',
    }}>

      {/* ── TOP THIRD — title + theme toggle ─────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 24px 0', position: 'relative',
      }}>
        <button
          onClick={toggle}
          className="btn-outlined"
          style={{
            position: 'absolute', top: 20, right: 20,
            minHeight: '40px', padding: '0 12px',
            borderRadius: 'var(--shape-sm)',
          }}
          title="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun size={16} style={{ color: 'var(--primary)' }} />
            : <Moon size={16} style={{ color: 'var(--primary)' }} />}
        </button>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 10vw, 4rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: 'var(--primary)',
          textAlign: 'center',
        }}>
          Wordwich
        </h1>
        <p className="type-body-md" style={{ marginTop: 8, color: 'var(--on-surface-variant)', textAlign: 'center' }}>
          Sandwich word game
        </p>
      </div>

      {/* ── MIDDLE THIRD — logo centred ───────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}>
        <img
          src={logo}
          alt="Wordwich logo"
          style={{
            width: 'min(55vw, 280px)',
            height: 'min(55vw, 280px)',
            borderRadius: 'var(--shape-lg)',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* ── BOTTOM THIRD — navigation buttons ────────────────────────────── */}
      <div style={{
        flex: 1.2, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '8px 24px 32px',
      }}>
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={goSinglePlayer}
            className="btn-primary"
            style={{ width: '100%', borderRadius: 'var(--shape-md)', height: 48, fontSize: '1rem', fontWeight: 700 }}>
            Single Player
          </button>

          <button
            onClick={goMultiplayer}
            className="btn-outlined"
            style={{ width: '100%', borderRadius: 'var(--shape-md)', height: 48, fontSize: '1rem' }}>
            Multiplayer
          </button>

          <button
            onClick={() => navigate('highscores')}
            className="btn-outlined"
            style={{ width: '100%', borderRadius: 'var(--shape-md)', height: 48, fontSize: '1rem' }}>
            High Scores
          </button>

          <button
            onClick={() => navigate('howtoplay')}
            className="btn-outlined"
            style={{ width: '100%', borderRadius: 'var(--shape-md)', height: 48, fontSize: '1rem' }}>
            How to Play
          </button>

          <button
            onClick={() => navigate('settings')}
            className="btn-outlined"
            style={{ width: '100%', borderRadius: 'var(--shape-md)', height: 48, fontSize: '1rem' }}>
            Settings
          </button>
        </div>
      </div>

    </div>
  )
}
