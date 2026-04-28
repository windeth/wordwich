import { useGameStore } from '../store/useGameStore'

export default function PlayerList() {
  const players            = useGameStore(s => s.players)
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex)

  if (players.length <= 1) return null

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
        <span className="label">Players</span>
      </div>
      {players.map((p, i) => {
        const isActive = i === currentPlayerIndex
        return (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: i < players.length - 1 ? '1px solid var(--outline-variant)' : 'none',
            background: isActive ? 'var(--primary-container)' : 'transparent',
            transition: `background var(--dur-medium1) var(--ease-standard)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isActive && (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%',
                  background: 'var(--primary)', flexShrink: 0 }} />
              )}
              <span className="type-label-lg" style={{
                color: isActive ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {p.name}
              </span>
              {p.streak >= 2 && (
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  padding: '2px 7px', borderRadius: 'var(--shape-full)',
                  background: 'var(--warning-container)', color: 'var(--warning)',
                }}>
                  🔥{p.streak}
                </span>
              )}
            </div>
            <span className="type-label-lg" style={{ color: 'var(--on-surface)', fontWeight: 800 }}>
              {p.score}<span style={{ fontSize: '10px', fontWeight: 500, marginLeft: '2px', color: 'var(--on-surface-variant)' }}>pts</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
