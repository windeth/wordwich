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

  const players            = useGameStore(s => s.players)
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex)
  const prompt             = useGameStore(s => s.prompt)
  const masterWord         = useGameStore(s => s.masterWord)
  const insightUsed        = useGameStore(s => s.insightUsed)
  const bridgeData         = useGameStore(s => s.bridgeData)
  const bridgeUsed         = useGameStore(s => s.bridgeUsed)
  const currentRound       = useGameStore(s => s.currentRound)
  const roundLimit         = useGameStore(s => s.roundLimit)
  const gameMode           = useGameStore(s => s.gameMode)
  const surrender          = useGameStore(s => s.surrender)
  const currentPlayer      = players[currentPlayerIndex]

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100svh', padding: '24px 24px 40px',
      gap: '20px', maxWidth: '480px', margin: '0 auto', width: '100%',
    }}>

      {/* ── Header — Apple: minimal chrome */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="label">
          Round {currentRound}{roundLimit ? ` of ${roundLimit}` : ''} · {gameMode === 'beatTheClock' ? 'Beat the Clock' : 'Classic'}
        </span>
        {/* Airbnb: progressive disclosure — surrender is barely visible */}
        <button onClick={() => setShowSurrender(true)}
          className="type-label-md"
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--on-surface-variant)', padding: '8px',
            transition: `color var(--dur-medium1) var(--ease-standard)` }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}>
          Surrender
        </button>
      </div>

      {/* ── Prompt card — M3 Level 2 elevation, Apple generous padding */}
      <div className="card-elevated" style={{ padding: '40px 32px', textAlign: 'center' }}>
        <span className="label" style={{ display: 'block', marginBottom: '24px' }}>Your word</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
          {[
            { letter: prompt?.startLetter, role: 'starts with' },
            { letter: prompt?.endLetter,   role: 'ends with'   },
          ].map(({ letter, role }) => (
            <div key={role} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '96px', height: '96px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--primary-container)',
                color: 'var(--on-primary-container)',
                borderRadius: 'var(--shape-lg)',  /* 16dp */
                fontSize: '3.5rem', fontWeight: 900,
                textTransform: 'uppercase', lineHeight: 1,
                letterSpacing: '-0.02em',
              }}>
                {letter}
              </div>
              <span className="label">{role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bridge hint */}
      {bridgeUsed && bridgeData && (
        <div className="card animate-enter" style={{ padding: '16px 20px', textAlign: 'center' }}>
          <span className="label" style={{ display: 'block', marginBottom: '12px' }}>
            Bridge — middle letters (not scored)
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span className="type-title-md" style={{ color: 'var(--on-surface-variant)' }}>
              {prompt?.startLetter?.toUpperCase()}…
            </span>
            {bridgeData.letters.map((l, i) => (
              <span key={i} style={{
                fontSize: '1.5rem', fontWeight: 800,
                padding: '6px 12px', borderRadius: 'var(--shape-sm)',
                background: 'var(--primary-container)',
                color: 'var(--on-primary-container)',
                letterSpacing: '-0.01em',
              }}>
                {l.toUpperCase()}
              </span>
            ))}
            <span className="type-title-md" style={{ color: 'var(--on-surface-variant)' }}>
              …{prompt?.endLetter?.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* ── Insight reveal */}
      {insightUsed && masterWord && (
        <div className="animate-enter" style={{
          padding: '16px 20px', textAlign: 'center',
          background: 'var(--primary-container)',
          border: '1px solid var(--primary)',
          borderRadius: 'var(--shape-md)',
        }}>
          <span className="label" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-primary-container)' }}>
            Master Word
          </span>
          <p style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em',
            textTransform: 'uppercase', color: 'var(--on-primary-container)' }}>
            {masterWord}
          </p>
        </div>
      )}

      {/* ── Active player card */}
      <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="label" style={{ display: 'block', marginBottom: '6px' }}>Now Playing</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="type-title-lg" style={{ color: 'var(--on-surface)' }}>
              {currentPlayer?.name}
            </span>
            {currentPlayer?.streak >= 2 && (
              <span style={{
                fontSize: '12px', fontWeight: 700,
                padding: '3px 8px', borderRadius: 'var(--shape-full)',
                background: 'var(--warning-container)', color: 'var(--warning)',
              }}>
                🔥 {currentPlayer.streak}
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="label" style={{ display: 'block', marginBottom: '4px' }}>Score</span>
          <span style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em',
            color: 'var(--primary)', lineHeight: 1 }}>
            {currentPlayer?.score}
          </span>
        </div>
      </div>

      {/* ── Timer */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
        <Timer />
      </div>

      {/* ── Word input */}
      <WordInput />

      {/* ── Power-ups */}
      <PowerUpBar />

      {/* ── Player list */}
      <PlayerList />

      {/* ── Surrender modal — M3 dialog: bottom sheet on mobile */}
      {showSurrender && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0 16px 32px',
          background: 'rgba(0,0,0,0.4)',
        }}>
          <div className="card-elevated animate-enter" style={{
            width: '100%', maxWidth: '480px',
            padding: '32px', borderRadius: 'var(--shape-xl)',
            display: 'flex', flexDirection: 'column', gap: '24px',
          }}>
            <div>
              <h3 className="type-title-lg" style={{ color: 'var(--on-surface)', marginBottom: '8px' }}>
                Quit to main menu?
              </h3>
              <p className="type-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                All progress will be lost.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowSurrender(false)}
                className="btn-outlined"
                style={{ flex: 1, borderRadius: 'var(--shape-sm)' }}>
                Keep Playing
              </button>
              <button onClick={surrender}
                className="btn-danger"
                style={{ flex: 1, borderRadius: 'var(--shape-sm)' }}>
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
