import { useGameStore } from '../../store/useGameStore'
import Leaderboard from '../Leaderboard'

export default function RecapScreen() {
  const players         = useGameStore(s => s.players)
  const nextRound       = useGameStore(s => s.nextRound)
  const endGame         = useGameStore(s => s.endGame)
  const isLastRound     = useGameStore(s => s.isLastRound)
  const roundHistory    = useGameStore(s => s.roundHistory)
  const multiplayerType = useGameStore(s => s.multiplayerType)
  const isSolo = multiplayerType === null

  const roundWinner = (!isSolo && roundHistory.length)
    ? [...players].sort((a, b) => {
        const score = p => roundHistory.filter(r => r.playerId === p.id).reduce((s, r) => s + r.score, 0)
        return score(b) - score(a)
      })[0]
    : null

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: '100svh', padding: '48px 24px 40px',
      gap: '24px', maxWidth: '480px', margin: '0 auto', width: '100%',
    }}>

      <h2 style={{
        alignSelf: 'flex-start',
        fontSize: '2.5rem', fontWeight: 800,
        letterSpacing: '-0.04em', lineHeight: 1.1,
        color: 'var(--on-surface)',
      }}>
        Round Recap
      </h2>

      {/* ── Round winner (multiplayer only) */}
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

      {/* ── Leaderboard (multiplayer only) */}
      {!isSolo && (
        <div style={{ width: '100%' }}>
          <Leaderboard players={players} />
        </div>
      )}

      {/* ── Word list */}
      {roundHistory.length > 0 ? (
        <div className="card" style={{ width: '100%', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
            <span className="label">Words This Round</span>
          </div>
          {roundHistory.map((entry, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: i < roundHistory.length - 1 ? '1px solid var(--outline-variant)' : 'none',
            }}>
              <div>
                {!isSolo && (
                  <p className="label" style={{ marginBottom: '3px' }}>{entry.playerName}</p>
                )}
                {entry.passed ? (
                  <span className="type-label-lg" style={{
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: 'var(--on-surface-variant)', fontStyle: 'italic',
                  }}>
                    — passed
                  </span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span className="type-label-lg" style={{
                      textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface)',
                    }}>
                      {entry.word}
                    </span>
                    <span className="label">{entry.word?.length} letters</span>
                  </div>
                )}
              </div>
              <span className="type-title-md" style={{
                color: entry.score > 0 ? 'var(--success)' : 'var(--on-surface-variant)',
                fontWeight: 800,
              }}>
                {entry.score > 0 ? `+${entry.score}` : '—'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ width: '100%', padding: '32px 24px', textAlign: 'center' }}>
          <p className="type-body-md" style={{ color: 'var(--on-surface-variant)' }}>No words submitted this round.</p>
        </div>
      )}

      <button onClick={isLastRound ? endGame : nextRound}
        className="btn-primary"
        style={{ width: '100%', borderRadius: 'var(--shape-lg)', height: '56px', fontSize: '1rem', fontWeight: 700 }}>
        {isLastRound ? 'See Final Results →' : 'Next Round →'}
      </button>

    </div>
  )
}
