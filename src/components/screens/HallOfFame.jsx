import { useGameStore } from '../../store/useGameStore'
import { Trophy, Flame, Crown } from 'lucide-react'

export default function HallOfFame() {
  const players = useGameStore(s => s.players)
  const resetGame = useGameStore(s => s.resetGame)

  const longestWordPlayer = players.reduce((best, p) =>
    (!best || (p.longestWord?.length || 0) > (best.longestWord?.length || 0)) ? p : best, null)

  const streakMaster = players.reduce((best, p) =>
    (!best || p.streak > best.streak) ? p : best, null)

  const dominator = players.reduce((best, p) =>
    (!best || p.roundsWon > best.roundsWon) ? p : best, null)

  const champion = [...players].sort((a, b) => b.score - a.score)[0]

  const awards = [
    {
      icon: Trophy, color: '#d97706', bg: '#fef3c7',
      title: 'Longest Word',
      value: longestWordPlayer?.longestWord?.toUpperCase() || '—',
      player: longestWordPlayer?.name,
      detail: longestWordPlayer?.longestWord ? `${longestWordPlayer.longestWord.length} letters` : null,
    },
    {
      icon: Flame, color: '#ea580c', bg: '#fff3e0',
      title: 'Streak Master',
      value: streakMaster?.streak ? `🔥 ${streakMaster.streak}` : '—',
      player: streakMaster?.name,
      detail: streakMaster?.streak ? 'consecutive valid words' : null,
    },
    {
      icon: Crown, color: 'var(--primary)', bg: 'var(--primary-l)',
      title: 'The Dominator',
      value: dominator?.roundsWon ? `${dominator.roundsWon} round${dominator.roundsWon > 1 ? 's' : ''}` : '—',
      player: dominator?.name,
      detail: 'most rounds won',
    },
  ]

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-10 gap-5 animate-fade-slide max-w-md mx-auto w-full">

      <div className="text-center space-y-1">
        <h1 className="text-4xl font-black" style={{ color: 'var(--primary)' }}>Hall of Fame</h1>
        {champion && (
          <p className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
            🏆 Champion: <span className="font-black" style={{ color: 'var(--text)' }}>{champion.name}</span>
            <span style={{ color: 'var(--text3)' }}> · {champion.score}pts</span>
          </p>
        )}
      </div>

      <div className="w-full space-y-3">
        {awards.map(({ icon: Icon, color, bg, title, value, player, detail }) => (
          <div key={title} className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: bg }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text3)' }}>
                {title}
              </p>
              <p className="text-lg font-black truncate" style={{ color }}>{value}</p>
              {player && (
                <p className="text-sm font-semibold" style={{ color: 'var(--text2)' }}>{player}</p>
              )}
              {detail && (
                <p className="text-xs" style={{ color: 'var(--text3)' }}>{detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Final scores */}
      <div className="card w-full overflow-hidden">
        <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
            Final Scores
          </span>
        </div>
        {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
          <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0"
            style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <span className="text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{p.name}</span>
            </div>
            <span className="text-sm font-black" style={{ color: 'var(--text)' }}>{p.score}pts</span>
          </div>
        ))}
      </div>

      <button onClick={resetGame} className="btn-primary w-full py-4 text-base rounded-2xl">
        Main Menu
      </button>

    </div>
  )
}
