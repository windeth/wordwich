import { useState } from 'react'
import { Plus, Trash2, Users, Monitor, Sun, Moon } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'
import { useTheme } from '../../hooks/useTheme'

export default function SetupScreen() {
  const setPlayers = useGameStore(s => s.setPlayers)
  const setGameMode = useGameStore(s => s.setGameMode)
  const setRoundLimit = useGameStore(s => s.setRoundLimit)
  const setDifficulty = useGameStore(s => s.setDifficulty)
  const startGame = useGameStore(s => s.startGame)
  const gameMode = useGameStore(s => s.gameMode)
  const roundLimit = useGameStore(s => s.roundLimit)
  const difficulty = useGameStore(s => s.difficulty)
  const { theme, toggle } = useTheme()

  const [names, setNames] = useState([''])
  const [sessionView, setSessionView] = useState(null)

  function addPlayer() { if (names.length < 10) setNames([...names, '']) }
  function removePlayer(i) { setNames(names.filter((_, idx) => idx !== i)) }
  function updateName(i, val) { setNames(names.map((n, idx) => idx === i ? val : n)) }

  function handleStart() {
    const validNames = names.map(n => n.trim()).filter(Boolean)
    if (!validNames.length) return
    const players = validNames.map((name, i) => ({
      id: i, name, score: 0, streak: 0, longestWord: '', roundsWon: 0
    }))
    setPlayers(players)
    startGame()
  }

  const canStart = names.some(n => n.trim())

  if (sessionView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 py-10 animate-fade-slide">
        <div className="w-full max-w-sm space-y-5">
          <button onClick={() => setSessionView(null)}
            className="text-sm font-semibold flex items-center gap-1"
            style={{ color: 'var(--text2)' }}>
            ← Back
          </button>
          <h2 className="text-2xl font-black" style={{ color: 'var(--text)' }}>
            {sessionView === 'host' ? 'Host a Session' : 'Join a Session'}
          </h2>
          <div className="card p-6 text-center space-y-3">
            <Monitor size={36} style={{ color: 'var(--text3)', margin: '0 auto' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text2)' }}>Multi-device play is coming soon.</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>Use Local Play to play up to 10 players on this device.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 py-10 animate-fade-slide">
      <div className="w-full max-w-sm space-y-7">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-tight leading-none" style={{ color: 'var(--primary)' }}>
              WORDIBLE
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text3)' }}>
              Sandwich word game
            </p>
          </div>
          <button onClick={toggle}
            className="btn-ghost p-2.5 rounded-xl"
            title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Players */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
              Players ({names.length}/10)
            </label>
            <button onClick={addPlayer} disabled={names.length >= 10}
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-opacity disabled:opacity-30"
              style={{ color: 'var(--primary)', background: 'var(--primary-l)' }}>
              <Plus size={12} /> Add Player
            </button>
          </div>
          <div className="space-y-2">
            {names.map((name, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => updateName(i, e.target.value)}
                  placeholder={`Player ${i + 1}`}
                  maxLength={20}
                  className="input-field px-4 py-3.5 text-base"
                />
                {names.length > 1 && (
                  <button onClick={() => removePlayer(i)}
                    className="p-3 rounded-xl transition-colors"
                    style={{ color: 'var(--text3)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Game Mode */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
            Game Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'classic', label: 'Classic', sub: '60s per turn' },
              { key: 'beatTheClock', label: 'Beat the Clock', sub: '5-min shared bank' },
            ].map(({ key, label, sub }) => (
              <button key={key} onClick={() => setGameMode(key)}
                className={`p-4 rounded-2xl text-left transition-all active:scale-95 ${gameMode === key ? 'chip-active' : 'chip-inactive'}`}
                style={{ boxShadow: gameMode === key ? 'var(--shadow-sm)' : 'none' }}>
                <div className="text-sm font-black" style={{ color: gameMode === key ? 'var(--primary)' : 'var(--text)' }}>
                  {label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Round Limit */}
        {gameMode === 'classic' && (
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
              Rounds
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 10, null].map(r => (
                <button key={r ?? 'unlimited'} onClick={() => setRoundLimit(r)}
                  className={`py-3 rounded-xl text-sm font-black transition-all active:scale-95 ${roundLimit === r ? 'chip-active' : 'chip-inactive'}`}>
                  {r ?? '∞'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
            Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'easy', label: '😊 Easy', sub: 'Short, familiar' },
              { key: 'medium', label: '🧠 Medium', sub: 'Balanced' },
              { key: 'hard', label: '🔥 Hard', sub: 'Long & rare' },
            ].map(({ key, label, sub }) => (
              <button key={key} onClick={() => setDifficulty(key)}
                className={`p-3 rounded-2xl text-center transition-all active:scale-95 ${difficulty === key ? 'chip-active' : 'chip-inactive'}`}>
                <div className="text-sm font-black" style={{ color: difficulty === key ? 'var(--primary)' : 'var(--text)' }}>
                  {label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Start */}
        <button onClick={handleStart} disabled={!canStart}
          className="btn-primary w-full py-4 text-lg rounded-2xl">
          Start Game
        </button>

        {/* Session */}
        <div className="grid grid-cols-2 gap-2">
          {['host', 'join'].map(type => (
            <button key={type} onClick={() => setSessionView(type)}
              className="btn-ghost flex items-center justify-center gap-2 py-3 text-sm rounded-xl">
              <Users size={14} />
              {type === 'host' ? 'Host Session' : 'Join Session'}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
