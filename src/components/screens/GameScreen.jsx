import { useState, useEffect } from 'react'
import { Lightbulb, Loader2, Flag, SkipForward } from 'lucide-react'
import { useTimer } from '../../hooks/useTimer'
import { useGameStore } from '../../store/useGameStore'
import { fetchDefinition, DIFFICULTY_LABELS } from '../../game/engine'
import Timer from '../Timer'
import WordInput from '../WordInput'
import PowerUpBar from '../PowerUpBar'
import PlayerList from '../PlayerList'
import MilestoneToast from '../MilestoneToast'

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
  const multiplayerType    = useGameStore(s => s.multiplayerType)
  const wordsCompleted     = useGameStore(s => s.wordsCompleted)
  const surrender          = useGameStore(s => s.surrender)
  const passRound          = useGameStore(s => s.passRound)
  const difficulty         = useGameStore(s => s.difficulty)
  const currentPlayer      = players[currentPlayerIndex]

  const isSolo = multiplayerType === null
  const isBTC  = gameMode === 'beatTheClock'
  const isSoloClassic = isSolo && !isBTC

  const [insightHint, setInsightHint] = useState(null)
  const [insightLoading, setInsightLoading] = useState(false)

  useEffect(() => {
    if (!insightUsed || !masterWord) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInsightHint(null)
      setInsightLoading(false)
      return
    }
    let cancelled = false
    setInsightLoading(true)
    fetchDefinition(masterWord).then(def => {
      if (cancelled) return
      setInsightLoading(false)
      setInsightHint(def)
    })
    return () => { cancelled = true }
  }, [insightUsed, masterWord])

  const headerLabel = isBTC
    ? 'Beat the Clock'
    : roundLimit
      ? `Round ${currentRound} of ${roundLimit} · Classic`
      : `Round ${currentRound} · Classic`

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100svh', padding: '24px 24px 40px',
      gap: '20px', maxWidth: '480px', margin: '0 auto', width: '100%',
    }}>

      {/* ── Header */}
      {isBTC ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '8px', padding: '8px 0 4px',
        }}>
          <h1 style={{
            fontSize: '2rem', fontWeight: 900,
            letterSpacing: '0.04em', lineHeight: 1,
            color: 'var(--on-surface)',
          }}>
            BEAT THE CLOCK
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '10px' }}>
            <span className="label" style={{ fontSize: '0.875rem' }}>Score:</span>
            <span style={{
              fontSize: '3.25rem', fontWeight: 900,
              letterSpacing: '-0.03em', lineHeight: 1,
              color: 'var(--primary)',
            }}>
              {wordsCompleted}
            </span>
          </div>
          <span className="label">{DIFFICULTY_LABELS[difficulty] ?? difficulty}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="label">{headerLabel}</span>
          {!isSolo && (
            <button onClick={() => setShowSurrender(true)}
              className="type-label-md"
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--on-surface-variant)', padding: '8px',
                transition: `color var(--dur-medium1) var(--ease-standard)` }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}>
              Surrender
            </button>
          )}
        </div>
      )}

      {/* ── Prompt card */}
      <div className="card-elevated" style={{ padding: '40px 32px', textAlign: 'center' }}>
        <span className="label" style={{ display: 'block', marginBottom: '24px' }}>Your word should</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
          {[
            { letter: prompt?.startLetter, role: 'start with' },
            { letter: prompt?.endLetter,   role: 'end with'   },
          ].map(({ letter, role }) => (
            <div key={role} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '96px', height: '96px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--primary-container)',
                color: 'var(--on-primary-container)',
                borderRadius: 'var(--shape-lg)',
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

      {/* ── Insight hint */}
      {insightUsed && masterWord && (
        <div className="animate-enter" style={{
          padding: '16px 20px',
          background: 'var(--primary-container)',
          border: '1px solid var(--primary)',
          borderRadius: 'var(--shape-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Lightbulb size={14} style={{ color: 'var(--on-primary-container)' }} />
            <span className="label" style={{ color: 'var(--on-primary-container)' }}>
              Hint — Master Word definition
            </span>
          </div>
          {insightLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={14} className="animate-pulse-soft" style={{ color: 'var(--on-primary-container)' }} />
              <span className="type-body-md" style={{ color: 'var(--on-primary-container)' }}>Looking up hint…</span>
            </div>
          ) : insightHint ? (
            <p className="type-body-md" style={{
              color: 'var(--on-primary-container)', fontStyle: 'italic', lineHeight: 1.5,
            }}>
              {insightHint}
            </p>
          ) : (
            <p className="type-body-md" style={{ color: 'var(--on-primary-container)' }}>
              No hint available for this word.
            </p>
          )}
        </div>
      )}

      {/* ── Active player card (multiplayer only) */}
      {!isSolo && (
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
      )}

      {/* ── Solo Classic score chip (compact) */}
      {isSoloClassic && (
        <div className="card" style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="label">Score</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {currentPlayer?.score ?? 0}
          </span>
        </div>
      )}

      {/* ── Timer (BTC + multiplayer Classic) */}
      {(isBTC || !isSolo) && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <Timer />
        </div>
      )}

      {/* ── Word input */}
      <WordInput />

      {/* ── Power-ups (hide in BTC) */}
      {!isBTC && <PowerUpBar />}

      {/* ── Player list (multiplayer only) */}
      {!isSolo && <PlayerList />}

      {/* ── Skip + Surrender (solo Classic) */}
      {isSoloClassic && (
        <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 'auto' }}>
          <button onClick={passRound}
            className="btn-outlined"
            style={{
              flex: 1, borderRadius: 'var(--shape-md)', height: 44,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface-variant)',
            }}>
            <SkipForward size={14} />
            Skip
          </button>
          <button onClick={() => setShowSurrender(true)}
            className="btn-outlined"
            style={{
              flex: 1, borderRadius: 'var(--shape-md)', height: 44,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface-variant)',
            }}>
            <Flag size={14} />
            Surrender
          </button>
        </div>
      )}

      {/* ── Surrender (BTC bottom) */}
      {isBTC && (
        <button onClick={() => setShowSurrender(true)}
          className="btn-outlined"
          style={{
            width: '100%', borderRadius: 'var(--shape-md)', height: 44,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface-variant)',
            marginTop: 'auto',
          }}>
          <Flag size={14} />
          Surrender
        </button>
      )}

      {/* ── Milestone toast (top of viewport) */}
      <MilestoneToast />

      {/* ── Surrender modal */}
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
                {isSolo ? 'Surrender and end the game?' : 'Quit to main menu?'}
              </h3>
              <p className="type-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                {isSolo
                  ? (isBTC
                      ? 'Your run will end and your score will be saved.'
                      : 'You’ll see your final cumulative score.')
                  : 'All progress will be lost.'}
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
                {isSolo ? 'End Game' : 'Quit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
