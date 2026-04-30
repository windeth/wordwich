import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'

export default function PlayerSetupScreen() {
  const navigate        = useGameStore(s => s.navigate)
  const setPlayers      = useGameStore(s => s.setPlayers)
  const startGame       = useGameStore(s => s.startGame)
  const multiplayerType = useGameStore(s => s.multiplayerType)

  const [names, setNames] = useState(['', ''])

  const addPlayer    = () => names.length < 10 && setNames([...names, ''])
  const removePlayer = i  => names.length > 2 && setNames(names.filter((_, idx) => idx !== i))
  const updateName   = (i, v) => setNames(names.map((n, idx) => idx === i ? v : n))

  const validNames = names.map(n => n.trim()).filter(Boolean)
  const canStart   = validNames.length >= 2

  function handleStart() {
    if (!canStart) return
    setPlayers(validNames.map((name, i) => ({
      id: i, name, score: 0, streak: 0, longestWord: '', roundsWon: 0,
      insightUsed: false, bridgeUsed: false, timeWarpUsed: false,
    })))
    startGame()
  }

  const backScreen = multiplayerType === 'local' ? 'multiplayer' : 'difficulty'

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100svh', padding: '48px 24px 40px',
      maxWidth: 480, margin: '0 auto', width: '100%',
      gap: 32,
    }}>
      <button onClick={() => navigate(backScreen)}
        className="label"
        style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', padding: '4px 0' }}>
        ← Back
      </button>

      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--on-surface)' }}>
          Who's Playing?
        </h2>
        <p className="type-body-md" style={{ marginTop: 6, color: 'var(--on-surface-variant)' }}>
          {multiplayerType === 'local' ? 'Pass-and-play — up to 10 players on this device.' : 'Add all players before the game starts.'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="label">Players · {names.length}/10</span>
          <button onClick={addPlayer} disabled={names.length >= 10}
            className="btn-tonal"
            style={{ minHeight: 32, padding: '0 12px', fontSize: 12, borderRadius: 'var(--shape-full)', opacity: names.length >= 10 ? 0.38 : 1 }}>
            <Plus size={12} style={{ display: 'inline', marginRight: 4 }} />Add
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {names.map((name, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={name}
                onChange={e => updateName(i, e.target.value)}
                placeholder={`Player ${i + 1}`}
                maxLength={20}
                className="input-field"
                style={{ padding: '14px 16px' }}
              />
              {names.length > 2 && (
                <button onClick={() => removePlayer(i)}
                  style={{
                    padding: '0 12px', borderRadius: 'var(--shape-sm)',
                    border: 'none', background: 'transparent',
                    color: 'var(--on-surface-variant)', cursor: 'pointer', minHeight: 48,
                    transition: `color var(--dur-medium1) var(--ease-standard)`,
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

      <button onClick={handleStart} disabled={!canStart}
        className="btn-primary"
        style={{ width: '100%', borderRadius: 'var(--shape-lg)', height: 56, fontSize: '1rem', fontWeight: 700, marginTop: 'auto' }}>
        Start Game
      </button>
    </div>
  )
}
