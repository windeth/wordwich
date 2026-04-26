import { BookOpen, Target, Zap, Clock } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'

const sections = [
  {
    icon: Target,
    title: 'The Sandwich Rule',
    content: [
      'You are given two letters — a Start letter and an End letter.',
      'Submit the longest valid English word that starts with the first letter and ends with the second.',
      'Words must be at least 4 letters long.',
      'Example: Start G, End Y → GALAXY (6 pts)',
    ],
  },
  {
    icon: BookOpen,
    title: 'Scoring',
    content: [
      'Points = the length of your word.',
      'Beat the Master Word (longest possible word for that prompt) and earn +1 bonus point per extra letter.',
      'Using The Bridge power-up deducts 2 points from your word score.',
    ],
  },
  {
    icon: Zap,
    title: 'Power-Ups',
    items: [
      { name: 'Insight', cost: '5 pts', desc: 'Reveals the Master Word’s definition as a hint — the word itself stays hidden.' },
      { name: 'The Bridge', cost: '2 pts', desc: 'Reveals 2 middle letters of a valid 8-letter word. These letters do not count toward your score.' },
      { name: 'Time Warp', cost: '5 pts', desc: 'Freezes the countdown timer for 30 seconds so you can think.' },
    ],
  },
  {
    icon: Clock,
    title: 'Beat the Clock',
    content: [
      'All players share a 5-minute time bank.',
      'Every second a player spends on their turn is deducted from the bank.',
      'Submit a valid word and add 5 seconds back to the bank.',
      'When the bank hits zero — the game ends.',
    ],
  },
]

export default function HowToPlayScreen() {
  const navigate = useGameStore(s => s.navigate)

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100svh', padding: '48px 24px 48px',
      maxWidth: 480, margin: '0 auto', width: '100%',
      gap: 28,
    }}>
      <button onClick={() => navigate('home')}
        className="label"
        style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', padding: '4px 0' }}>
        ← Back
      </button>

      <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--on-surface)' }}>
        How to Play
      </h2>

      {sections.map(({ icon: Icon, title, content, items }) => (
        <div key={title} className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--shape-sm)', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} style={{ color: 'var(--on-primary-container)' }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--on-surface)' }}>{title}</h3>
          </div>

          {content && (
            <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {content.map((line, i) => (
                <li key={i} className="type-body-md" style={{ color: 'var(--on-surface-variant)', display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>·</span>
                  {line}
                </li>
              ))}
            </ul>
          )}

          {items && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(({ name, cost, desc }) => (
                <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--on-surface)' }}>{name}</span>
                    <span className="label" style={{ color: 'var(--primary)' }}>{cost}</span>
                  </div>
                  <p className="type-body-md" style={{ color: 'var(--on-surface-variant)' }}>{desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
