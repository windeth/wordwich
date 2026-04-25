import { useGameStore } from '../../store/useGameStore'
import { Trophy, Flame, Crown } from 'lucide-react'

export default function HallOfFame() {
  const players   = useGameStore(s => s.players)
  const resetGame = useGameStore(s => s.resetGame)

  const longestWordPlayer = players.reduce((b, p) =>
    (!b || (p.longestWord?.length || 0) > (b.longestWord?.length || 0)) ? p : b, null)
  const streakMaster = players.reduce((b, p) =>
    (!b || p.streak > b.streak) ? p : b, null)
  const dominator = players.reduce((b, p) =>
    (!b || p.roundsWon > b.roundsWon) ? p : b, null)
  const champion = [...players].sort((a, b) => b.score - a.score)[0]

  const awards = [
    {
      icon: Trophy, bg: 'var(--warning-container)', color: 'var(--warning)',
      title: 'Longest Word',
      value: longestWordPlayer?.longestWord?.toUpperCase() || '—',
      player: longestWordPlayer?.name,
      detail: longestWordPlayer?.longestWord ? `${longestWordPlayer.longestWord.length} letters` : null,
    },
    {
      icon: Flame, bg: '#FFF3E0', color: '#E65100',
      title: 'Streak Master',
      value: streakMaster?.streak ? `${streakMaster.streak}` : '—',
      suffix: streakMaster?.streak ? ' in a row' : '',
      player: streakMaster?.name,
      detail: 'consecutive valid words',
    },
    {
      icon: Crown, bg: 'var(--primary-container)', color: 'var(--on-primary-container)',
      title: 'The Dominator',
      value: dominator?.roundsWon ? `${dominator.roundsWon}` : '—',
      suffix: dominator?.roundsWon ? ` round${dominator.roundsWon > 1 ? 's' : ''} won` : '',
      player: dominator?.name,
      detail: null,
    },
  ]

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: '100svh', padding: '48px 24px 48px',
      gap: '28px', maxWidth: '480px', margin: '0 auto', width: '100%',
    }}>

      {/* ── Header — Apple Display scale */}
      <div style={{ alignSelf: 'flex-start' }}>
        <h1 style={{
          fontSize: '3rem', fontWeight: 800,
          letterSpacing: '-0.04em', lineHeight: 1,
          color: 'var(--on-surface)',
        }}>
          Hall of Fame
        </h1>
        {champion && (
          <p className="type-body-md" style={{ marginTop: '8px', color: 'var(--on-surface-variant)' }}>
            🏆 Champion:{' '}
            <span style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{champion.name}</span>
            {' '}· {champion.score} pts
          </p>
        )}
      </div>

      {/* ── Awards — M3 Level 1 cards, Airbnb card-first layout */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {awards.map(({ icon: Icon, bg, color, title, value, suffix, player, detail }) => (
          <div key={title} className="card" style={{
            padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: '20px',
          }}>
            <div style={{
              width: '48px', height: '48px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: bg, borderRadius: 'var(--shape-md)',
            }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="label" style={{ display: 'block', marginBottom: '4px' }}>{title}</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', color, lineHeight: 1.2 }}>
                {value}<span style={{ fontSize: '1rem', fontWeight: 600 }}>{suffix}</span>
              </p>
              {player && (
                <p className="type-body-md" style={{ marginTop: '2px', color: 'var(--on-surface-variant)' }}>{player}</p>
              )}
              {detail && (
                <p className="label" style={{ marginTop: '2px' }}>{detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Final scores */}
      <div className="card" style={{ width: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <span className="label">Final Scores</span>
        </div>
        {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: i < players.length - 1 ? '1px solid var(--outline-variant)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px', width: '24px' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
              </span>
              <span className="type-label-lg" style={{ color: 'var(--on-surface)' }}>{p.name}</span>
            </div>
            <span className="type-title-md" style={{ color: 'var(--on-surface)', fontWeight: 800 }}>
              {p.score} pts
            </span>
          </div>
        ))}
      </div>

      <button onClick={resetGame}
        className="btn-primary"
        style={{ width: '100%', borderRadius: 'var(--shape-lg)', height: '56px', fontSize: '1rem', fontWeight: 700 }}>
        Main Menu
      </button>

    </div>
  )
}
