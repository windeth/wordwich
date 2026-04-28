import { useGameStore } from '../../store/useGameStore'

const DIFFICULTIES = [
  { key: 'easy',   emoji: '😊', label: 'Easy',   desc: 'More starting time' },
  { key: 'medium', emoji: '🧠', label: 'Medium',  desc: 'Balanced challenge' },
  { key: 'hard',   emoji: '🔥', label: 'Hard',    desc: 'Faster time drain'  },
]

export default function DifficultyScreen() {
  const navigate         = useGameStore(s => s.navigate)
  const setDifficulty    = useGameStore(s => s.setDifficulty)
  const setPlayers       = useGameStore(s => s.setPlayers)
  const startGame        = useGameStore(s => s.startGame)
  const multiplayerType  = useGameStore(s => s.multiplayerType)

  const backScreen = multiplayerType ? 'multiplayer' : 'soloclassicsetup'

  function choose(key) {
    setDifficulty(key)
    if (multiplayerType === null) {
      // Single player — Player 1 already created (Solo Classic setup) OR ensure created (BTC)
      const existing = useGameStore.getState().players
      if (!existing.length) {
        setPlayers([{ id: 0, name: 'Player 1', score: 0, streak: 0, longestWord: '', roundsWon: 0 }])
      }
      startGame()
    } else {
      navigate('playersetup')
    }
  }

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
          Choose Difficulty
        </h2>
        <p className="type-body-md" style={{ marginTop: 6, color: 'var(--on-surface-variant)' }}>
          {multiplayerType === null ? 'Affects word rarity and letter combos.' : 'Affects word rarity and letter combos for all players.'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {DIFFICULTIES.map(({ key, emoji, label, desc }) => (
          <button key={key} onClick={() => choose(key)}
            className="card"
            style={{
              width: '100%', padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 20,
              border: 'none', cursor: 'pointer', textAlign: 'left',
              transition: `transform var(--dur-medium1) var(--ease-standard), box-shadow var(--dur-medium1) var(--ease-standard)`,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = 'var(--shadow-2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseDown={e  => { e.currentTarget.style.transform = 'scale(0.98)' }}
            onMouseUp={e    => { e.currentTarget.style.transform = 'scale(1.02)' }}>
            <span style={{ fontSize: 36 }}>{emoji}</span>
            <div>
              <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)' }}>{label}</p>
              <p className="type-body-md" style={{ marginTop: 2, color: 'var(--on-surface-variant)' }}>{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
