const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ players }) {
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
        <span className="label">Leaderboard</span>
      </div>
      {sorted.map((p, i) => (
        <div key={p.id} style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '14px 20px',
          borderBottom: i < sorted.length - 1 ? '1px solid var(--outline-variant)' : 'none',
        }}>
          <span style={{ fontSize: '16px', width: '24px', textAlign: 'center', flexShrink: 0 }}>
            {MEDALS[i] ?? <span className="label" style={{ textTransform: 'none' }}>#{i + 1}</span>}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="type-label-lg" style={{ color: 'var(--on-surface)' }}>{p.name}</span>
            {p.streak >= 2 && (
              <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--warning)' }}>
                🔥{p.streak}
              </span>
            )}
          </div>
          <span className="type-label-lg" style={{ color: 'var(--on-surface)', fontWeight: 800 }}>
            {p.score}<span style={{ fontSize: '10px', fontWeight: 500, marginLeft: '2px', color: 'var(--on-surface-variant)' }}>pts</span>
          </span>
        </div>
      ))}
    </div>
  )
}
