import { useState, useEffect } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'
import { fetchDefinition } from '../../game/engine'
import Leaderboard from '../Leaderboard'

export default function RecapScreen() {
  const masterWord   = useGameStore(s => s.masterWord)
  const players      = useGameStore(s => s.players)
  const nextRound    = useGameStore(s => s.nextRound)
  const endGame      = useGameStore(s => s.endGame)
  const isLastRound  = useGameStore(s => s.isLastRound)
  const roundHistory = useGameStore(s => s.roundHistory)
  const gameMode     = useGameStore(s => s.gameMode)

  const [revealed, setRevealed]     = useState(0)
  const [definition, setDefinition] = useState(null)
  const [defLoading, setDefLoading] = useState(false)
  const [defShown, setDefShown]     = useState(false)

  const word = masterWord || '—'

  useEffect(() => { setRevealed(0); setDefinition(null); setDefShown(false) }, [masterWord])
  useEffect(() => {
    if (revealed >= word.length) return
    const t = setTimeout(() => setRevealed(r => r + 1), 110)
    return () => clearTimeout(t)
  }, [revealed, word.length])

  async function showDef() {
    if (!masterWord) return
    setDefShown(true); setDefLoading(true)
    const def = await fetchDefinition(masterWord)
    setDefinition(def); setDefLoading(false)
  }

  const roundWinner = roundHistory.length
    ? [...players].sort((a, b) => {
        const score = p => roundHistory.filter(r => r.playerId === p.id).reduce((s, r) => s + r.score, 0)
        return score(b) - score(a)
      })[0]
    : null

  const isEnd = isLastRound || gameMode === 'beatTheClock'

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: '100svh', padding: '48px 24px 40px',
      gap: '24px', maxWidth: '480px', margin: '0 auto', width: '100%',
    }}>

      {/* Apple Display type — large, bold, tight */}
      <h2 style={{
        alignSelf: 'flex-start',
        fontSize: '2.5rem', fontWeight: 800,
        letterSpacing: '-0.04em', lineHeight: 1.1,
        color: 'var(--on-surface)',
      }}>
        The Reveal
      </h2>

      {/* ── Master Word — M3 Level 2 card, generous Airbnb padding */}
      <div className="card-elevated" style={{
        width: '100%', padding: '40px 32px',
        textAlign: 'center', borderRadius: 'var(--shape-xl)',
        display: 'flex', flexDirection: 'column', gap: '20px',
      }}>
        <span className="label">Master Word</span>

        {/* Letter-by-letter reveal */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px', minHeight: '56px', alignItems: 'center' }}>
          {word.split('').map((letter, i) => (
            <span key={i} className={i < revealed ? 'animate-reveal' : ''}
              style={{
                fontSize: '2.75rem', fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '-0.02em', lineHeight: 1,
                color: 'var(--primary)',
                opacity: i < revealed ? 1 : 0,
                display: 'inline-block',
              }}>
              {letter}
            </span>
          ))}
        </div>

        {word !== '—' && (
          <span className="label">{word.length} letters</span>
        )}

        {/* Definition — Airbnb: progressive disclosure, show only on tap */}
        {!defShown && masterWord && revealed >= word.length && (
          <button onClick={showDef}
            className="btn-outlined"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              margin: '0 auto', padding: '0 20px', minHeight: '40px',
              borderRadius: 'var(--shape-full)', fontSize: '13px',
            }}>
            <BookOpen size={13} />
            Show Definition
          </button>
        )}

        {defShown && (
          <div className="card-inset animate-enter" style={{ padding: '16px', textAlign: 'left' }}>
            {defLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <Loader2 size={14} className="animate-pulse-soft" style={{ color: 'var(--primary)' }} />
                <span className="type-body-md" style={{ color: 'var(--on-surface-variant)' }}>Looking it up…</span>
              </div>
            ) : definition ? (
              <p className="type-body-md" style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic', lineHeight: 1.6 }}>
                {definition}
              </p>
            ) : (
              <p className="type-body-md" style={{ color: 'var(--on-surface-variant)' }}>No definition found.</p>
            )}
          </div>
        )}
      </div>

      {/* ── Round winner */}
      {roundWinner && (
        <div className="card" style={{
          width: '100%', padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <span style={{ fontSize: '2rem' }}>🏆</span>
          <div>
            <span className="label" style={{ display: 'block', marginBottom: '4px' }}>Round Winner</span>
            <span className="type-title-lg" style={{ color: 'var(--success)' }}>{roundWinner.name}</span>
          </div>
        </div>
      )}

      {/* ── Leaderboard */}
      <div style={{ width: '100%' }}>
        <Leaderboard players={players} />
      </div>

      {/* ── Round submissions */}
      {roundHistory.length > 0 && (
        <div className="card" style={{ width: '100%', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
            <span className="label">This Round</span>
          </div>
          {roundHistory.map((entry, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: i < roundHistory.length - 1 ? '1px solid var(--outline-variant)' : 'none',
            }}>
              <div>
                <p className="label" style={{ marginBottom: '3px' }}>{entry.playerName}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="type-label-lg" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface)' }}>
                    {entry.word}
                  </span>
                  {entry.beatMaster && (
                    <span style={{
                      fontSize: '11px', fontWeight: 700,
                      padding: '2px 8px', borderRadius: 'var(--shape-full)',
                      background: 'var(--warning-container)', color: 'var(--warning)',
                    }}>
                      🏆 Beat Master
                    </span>
                  )}
                </div>
              </div>
              <span className="type-title-md" style={{ color: 'var(--success)', fontWeight: 800 }}>
                +{entry.score}
              </span>
            </div>
          ))}
        </div>
      )}

      <button onClick={isEnd ? endGame : nextRound}
        className="btn-primary"
        style={{ width: '100%', borderRadius: 'var(--shape-lg)', height: '56px', fontSize: '1rem', fontWeight: 700 }}>
        {isEnd ? 'See Final Results →' : 'Next Round →'}
      </button>

    </div>
  )
}
