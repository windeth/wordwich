export default function Leaderboard({ players }) {
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>Leaderboard</span>
      </div>
      {sorted.map((p, i) => (
        <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
          style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs font-black w-5 text-center rounded-full"
            style={{
              color: i === 0 ? '#d97706' : i === 1 ? '#6b7280' : i === 2 ? '#92400e' : 'var(--text3)',
            }}>
            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
          </span>
          <div className="flex-1">
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{p.name}</span>
            {p.streak >= 2 && (
              <span className="ml-2 text-xs font-black" style={{ color: '#ea580c' }}>🔥{p.streak}</span>
            )}
          </div>
          <span className="text-sm font-black tabular-nums" style={{ color: 'var(--text)' }}>{p.score}pts</span>
        </div>
      ))}
    </div>
  )
}
