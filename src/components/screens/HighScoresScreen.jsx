import { Trophy } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'
import { getAllRuns } from '../../lib/highScores'

function fmtTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

function fmtDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function HighScoresScreen() {
  const navigate = useGameStore(s => s.navigate)
  const runs = getAllRuns()

  const progressive = (runs.btc_progressive ?? []).slice(0, 10)
  const buckets = progressive.length > 0
    ? [{ key: 'progressive', label: 'Beat the Clock', entries: progressive }]
    : []

  const hasAny = buckets.length > 0

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100svh', padding: '48px 24px 48px',
      maxWidth: 480, margin: '0 auto', width: '100%',
      gap: 24,
    }}>
      <button onClick={() => navigate('home')}
        className="label"
        style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', padding: '4px 0' }}>
        ← Back
      </button>

      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--on-surface)' }}>
          High Scores
        </h2>
        <p className="type-body-md" style={{ marginTop: 6, color: 'var(--on-surface-variant)' }}>
          Beat the Clock — your best runs, ranked by time survived.
        </p>
      </div>

      {!hasAny ? (
        <div className="card" style={{
          padding: '48px 24px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--shape-lg)',
            background: 'var(--primary-container)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trophy size={28} style={{ color: 'var(--on-primary-container)' }} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--on-surface)' }}>
              No scores yet
            </p>
            <p className="type-body-md" style={{ marginTop: 6, color: 'var(--on-surface-variant)' }}>
              Play Beat the Clock to get on the board.
            </p>
          </div>
          <button onClick={() => navigate('singleplayer')}
            className="btn-primary"
            style={{ borderRadius: 'var(--shape-sm)', height: 48, padding: '0 28px', marginTop: 8, fontSize: '0.9rem', fontWeight: 700 }}>
            Play Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {buckets.map(({ key, label, entries }) => (
            <div key={key} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="label">{label}</span>
                <span className="label" style={{ color: 'var(--on-surface-variant)' }}>{entries.length} run{entries.length === 1 ? '' : 's'}</span>
              </div>
              {entries.map((e, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: i < entries.length - 1 ? '1px solid var(--outline-variant)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                        {fmtTime(e.timeSurvived)}
                      </p>
                      <span className="label">{e.words} word{e.words === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                  <span className="label" style={{ color: 'var(--on-surface-variant)' }}>{fmtDate(e.date)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
