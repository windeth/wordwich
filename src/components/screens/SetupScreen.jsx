import { useState } from 'react'
import { Plus, Trash2, Users, Monitor, Sun, Moon } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'
import { useTheme } from '../../hooks/useTheme'
import logo from '../../assets/logo.svg'

export default function SetupScreen() {
  const setPlayers    = useGameStore(s => s.setPlayers)
  const setGameMode   = useGameStore(s => s.setGameMode)
  const setRoundLimit = useGameStore(s => s.setRoundLimit)
  const setDifficulty = useGameStore(s => s.setDifficulty)
  const startGame     = useGameStore(s => s.startGame)
  const gameMode      = useGameStore(s => s.gameMode)
  const roundLimit    = useGameStore(s => s.roundLimit)
  const difficulty    = useGameStore(s => s.difficulty)
  const { theme, toggle } = useTheme()

  const [names, setNames]         = useState([''])
  const [sessionView, setSessionView] = useState(null)

  const addPlayer    = () => names.length < 10 && setNames([...names, ''])
  const removePlayer = i  => setNames(names.filter((_, idx) => idx !== i))
  const updateName   = (i, v) => setNames(names.map((n, idx) => idx === i ? v : n))

  function handleStart() {
    const valid = names.map(n => n.trim()).filter(Boolean)
    if (!valid.length) return
    setPlayers(valid.map((name, i) => ({
      id: i, name, score: 0, streak: 0, longestWord: '', roundsWon: 0,
      insightUsed: false, bridgeUsed: false, timeWarpUsed: false,
    })))
    startGame()
  }

  const canStart = names.some(n => n.trim())

  if (sessionView) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-enter">
      <div className="w-full max-w-sm" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <button onClick={() => setSessionView(null)}
          className="label flex items-center gap-1.5"
          style={{ cursor: 'pointer', width: 'fit-content' }}>
          ← Back
        </button>
        <h2 className="type-headline" style={{ color: 'var(--on-surface)' }}>
          {sessionView === 'host' ? 'Host a Session' : 'Join a Session'}
        </h2>
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Monitor size={40} style={{ color: 'var(--on-surface-variant)', margin: '0 auto' }} />
          <p className="type-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Multi-device play is coming soon.
          </p>
          <p className="type-body-md" style={{ color: 'var(--on-surface-variant)' }}>
            Use Local Play for up to 10 players on one device.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col items-center justify-center min-h-screen animate-enter"
      style={{ padding: '48px 24px' }}>
      <div className="w-full max-w-sm" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* ── Wordmark + theme toggle ─── Apple: content-first, minimal chrome */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div>
              <h1 style={{
                fontSize: '3rem', fontWeight: 800,
                letterSpacing: '-0.04em', lineHeight: 1,
                color: 'var(--primary)',
              }}>
                Wordwich
              </h1>
              <p className="type-body-md" style={{ marginTop: '4px', color: 'var(--on-surface-variant)' }}>
                Sandwich word game
              </p>
            </div>
            <img
              src={logo}
              alt="Wordwich logo"
              style={{ width: 95, height: 95, borderRadius: 'var(--shape-md)', flexShrink: 0 }}
            />
          </div>
          <button onClick={toggle}
            className="btn-outlined"
            style={{ minHeight: '40px', padding: '0 12px', borderRadius: 'var(--shape-sm)', flexShrink: 0 }}
            title="Toggle theme">
            {theme === 'dark'
              ? <Sun size={16} style={{ color: 'var(--primary)' }} />
              : <Moon size={16} style={{ color: 'var(--primary)' }} />}
          </button>
        </div>

        {/* ── Players ─── Airbnb: input is sacred, generous space */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="label">Players · {names.length}/10</span>
            <button onClick={addPlayer} disabled={names.length >= 10}
              className="btn-tonal"
              style={{ minHeight: '32px', padding: '0 12px', fontSize: '12px', borderRadius: 'var(--shape-full)', opacity: names.length >= 10 ? 0.38 : 1 }}>
              <Plus size={12} style={{ display: 'inline', marginRight: '4px' }} />Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {names.map((name, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={name}
                  onChange={e => updateName(i, e.target.value)}
                  placeholder={`Player ${i + 1}`}
                  maxLength={20}
                  className="input-field"
                  style={{ padding: '14px 16px' }}
                />
                {names.length > 1 && (
                  <button onClick={() => removePlayer(i)}
                    style={{
                      padding: '0 12px', borderRadius: 'var(--shape-sm)',
                      border: 'none', background: 'transparent',
                      color: 'var(--on-surface-variant)', cursor: 'pointer',
                      minHeight: '48px', transition: `color var(--dur-medium1) var(--ease-standard)`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Game Mode */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="label">Mode</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { key: 'classic',      label: 'Classic',        sub: '60s per turn' },
              { key: 'beatTheClock', label: 'Beat the Clock', sub: '5-min bank'   },
            ].map(({ key, label, sub }) => (
              <button key={key} onClick={() => setGameMode(key)}
                className="chip"
                data-active={gameMode === key ? 'true' : 'false'}
                style={{ padding: '16px', textAlign: 'left' }}>
                <div className="type-label-lg" style={{ color: gameMode === key ? 'var(--on-primary-container)' : 'var(--on-surface)' }}>{label}</div>
                <div className="type-body-md" style={{ marginTop: '4px', color: 'var(--on-surface-variant)' }}>{sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Rounds (Classic only) */}
        {gameMode === 'classic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span className="label">Rounds</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[3, 5, 10, null].map(r => (
                <button key={r ?? '∞'} onClick={() => setRoundLimit(r)}
                  className="chip type-label-lg"
                  data-active={roundLimit === r ? 'true' : 'false'}
                  style={{ padding: '14px 8px', textAlign: 'center' }}>
                  {r ?? '∞'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Difficulty */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="label">Difficulty</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { key: 'easy',   emoji: '😊', label: 'Easy',   sub: 'Familiar' },
              { key: 'medium', emoji: '🧠', label: 'Medium',  sub: 'Balanced' },
              { key: 'hard',   emoji: '🔥', label: 'Hard',    sub: 'Rare'     },
            ].map(({ key, emoji, label, sub }) => (
              <button key={key} onClick={() => setDifficulty(key)}
                className="chip"
                data-active={difficulty === key ? 'true' : 'false'}
                style={{ padding: '16px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '20px' }}>{emoji}</span>
                <span className="type-label-lg" style={{ color: difficulty === key ? 'var(--on-primary-container)' : 'var(--on-surface)' }}>{label}</span>
                <span className="type-body-md" style={{ color: 'var(--on-surface-variant)' }}>{sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Primary CTA — Airbnb: one CTA per screen */}
        <button onClick={handleStart} disabled={!canStart}
          className="btn-primary"
          style={{ width: '100%', borderRadius: 'var(--shape-lg)', fontSize: '1rem', fontWeight: 700, height: '56px' }}>
          Start Game
        </button>

        {/* ── Session — Airbnb: progressive disclosure, secondary = invisible */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
          {['host', 'join'].map(type => (
            <button key={type} onClick={() => setSessionView(type)}
              className="type-label-lg"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--on-surface-variant)',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: `color var(--dur-medium1) var(--ease-standard)`,
                padding: '8px 0',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}>
              <Users size={12} />
              {type === 'host' ? 'Host Session' : 'Join Session'}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
