import { useGameStore } from '../../store/useGameStore'

const DIFFICULTIES = [
  { key: 'easy',   label: 'Easy'     },
  { key: 'medium', label: 'Moderate' },
  { key: 'hard',   label: 'Abstruse' },
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

      <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--on-surface)' }}>
        Choose Difficulty
      </h2>

      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        {DIFFICULTIES.map(({ key, label }) => (
          <button key={key} onClick={() => choose(key)}
            className="card type-title-md"
            style={{
              flex: 1, height: 56, padding: '0 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', textAlign: 'center',
              color: 'var(--on-surface)',
              transition: `transform var(--dur-medium1) var(--ease-standard), box-shadow var(--dur-medium1) var(--ease-standard)`,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = 'var(--shadow-2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseDown={e  => { e.currentTarget.style.transform = 'scale(0.98)' }}
            onMouseUp={e    => { e.currentTarget.style.transform = 'scale(1.02)' }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
