import { useGameStore } from '../store/useGameStore'

export default function PlayerList() {
  const players = useGameStore(s => s.players)
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex)

  if (players.length <= 1) return null

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>Players</span>
      </div>
      {players.map((p, i) => {
        const isActive = i === currentPlayerIndex
        return (
          <div
            key={p.id}
            className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 transition-colors"
            style={{
              borderColor: 'var(--border)',
              background: isActive ? 'var(--primary-l)' : 'transparent',
            }}
          >
            <div className="flex items-center gap-2.5">
              {isActive && (
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
              )}
              <span
                className="text-sm font-bold truncate max-w-[130px]"
                style={{ color: isActive ? 'var(--primary)' : 'var(--text2)' }}
              >
                {p.name}
              </span>
              {p.streak >= 2 && (
                <span className="text-xs font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: '#fff3e0', color: '#ea580c', fontSize: '11px' }}>
                  🔥{p.streak}
                </span>
              )}
            </div>
            <span className="text-sm font-black tabular-nums" style={{ color: 'var(--text)' }}>
              {p.score}<span className="text-xs font-medium ml-0.5" style={{ color: 'var(--text3)' }}>pt</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
