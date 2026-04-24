import { useState } from 'react'
import { useTimer } from '../../hooks/useTimer'
import { useGameStore } from '../../store/useGameStore'
import Timer from '../Timer'
import WordInput from '../WordInput'
import PowerUpBar from '../PowerUpBar'
import PlayerList from '../PlayerList'

export default function GameScreen() {
  useTimer()

  const [showSurrender, setShowSurrender] = useState(false)
  const players = useGameStore(s => s.players)
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex)
  const prompt = useGameStore(s => s.prompt)
  const masterWord = useGameStore(s => s.masterWord)
  const insightUsed = useGameStore(s => s.insightUsed)
  const bridgeData = useGameStore(s => s.bridgeData)
  const bridgeUsed = useGameStore(s => s.bridgeUsed)
  const currentRound = useGameStore(s => s.currentRound)
  const roundLimit = useGameStore(s => s.roundLimit)
  const gameMode = useGameStore(s => s.gameMode)
  const surrender = useGameStore(s => s.surrender)
  const currentPlayer = players[currentPlayerIndex]

  return (
    <div className="flex flex-col min-h-screen px-4 py-5 gap-4 animate-fade-slide max-w-md mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="card px-3 py-1.5">
          <span className="text-xs font-bold" style={{ color: 'var(--text2)' }}>
            Round {currentRound}{roundLimit ? ` / ${roundLimit}` : ''} · {gameMode === 'beatTheClock' ? 'Beat the Clock' : 'Classic'}
          </span>
        </div>
        <button onClick={() => setShowSurrender(true)}
          className="text-xs font-semibold py-1.5 px-3 rounded-lg"
          style={{ color: 'var(--text3)' }}>
          Surrender
        </button>
      </div>

      {/* Prompt card */}
      <div className="card-elevated p-6 text-center space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
          Start → End
        </p>
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl font-black uppercase"
              style={{ background: 'var(--primary-l)', color: 'var(--primary)' }}>
              {prompt?.startLetter}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text3)' }}>START</span>
          </div>
          <span className="text-2xl" style={{ color: 'var(--text3)' }}>→</span>
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl font-black uppercase"
              style={{ background: 'var(--primary-l)', color: 'var(--primary)' }}>
              {prompt?.endLetter}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text3)' }}>END</span>
          </div>
        </div>
      </div>

      {/* Bridge reveal */}
      {bridgeUsed && bridgeData && (
        <div className="card p-4 text-center space-y-2 animate-fade-slide">
          <p className="text-xs font-bold" style={{ color: 'var(--text3)' }}>Bridge hint — middle letters (not scored)</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-black" style={{ color: 'var(--text3)' }}>
              {prompt?.startLetter?.toUpperCase()}…
            </span>
            {bridgeData.letters.map((l, i) => (
              <span key={i} className="text-2xl font-black px-2 py-1 rounded-xl"
                style={{ background: 'var(--primary-l)', color: 'var(--primary)' }}>
                {l.toUpperCase()}
              </span>
            ))}
            <span className="text-lg font-black" style={{ color: 'var(--text3)' }}>
              …{prompt?.endLetter?.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Insight reveal */}
      {insightUsed && masterWord && (
        <div className="card p-4 text-center space-y-1.5 animate-fade-slide"
          style={{ border: '1.5px solid var(--primary)', background: 'var(--primary-l)' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Master Word</p>
          <p className="text-2xl font-black uppercase" style={{ color: 'var(--primary)' }}>{masterWord}</p>
        </div>
      )}

      {/* Active player */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text3)' }}>Now Playing</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black" style={{ color: 'var(--text)' }}>{currentPlayer?.name}</span>
            {currentPlayer?.streak >= 2 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{ background: '#fff3e0', color: '#ea580c' }}>
                🔥{currentPlayer.streak}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black" style={{ color: 'var(--primary)' }}>{currentPlayer?.score}</span>
          <span className="text-xs font-medium ml-1" style={{ color: 'var(--text3)' }}>pts</span>
        </div>
      </div>

      {/* Timer */}
      <div className="flex justify-center py-1">
        <Timer />
      </div>

      {/* Word input */}
      <WordInput />

      {/* Power-ups */}
      <PowerUpBar />

      {/* Player list */}
      <PlayerList />

      {/* Surrender modal */}
      {showSurrender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="card-elevated w-full max-w-sm p-6 space-y-4 animate-fade-slide">
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black" style={{ color: 'var(--text)' }}>Quit to main menu?</h3>
              <p className="text-sm" style={{ color: 'var(--text2)' }}>All progress will be lost.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSurrender(false)} className="btn-ghost flex-1 py-3 text-sm">
                Keep Playing
              </button>
              <button
                onClick={surrender}
                className="flex-1 py-3 rounded-xl text-sm font-black transition-all active:scale-97"
                style={{ background: 'var(--danger-l)', color: 'var(--danger)', border: '1.5px solid var(--danger)' }}>
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
