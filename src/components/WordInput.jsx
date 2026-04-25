import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { ArrowRight } from 'lucide-react'

export default function WordInput() {
  const [value, setValue]       = useState('')
  const [feedback, setFeedback] = useState(null)
  const submitWord     = useGameStore(s => s.submitWord)
  const timeRemaining  = useGameStore(s => s.timeRemaining)
  const gameMode       = useGameStore(s => s.gameMode)
  const timeBank       = useGameStore(s => s.timeBank)
  const timeWarpActive = useGameStore(s => s.timeWarpActive)

  const isDisabled = gameMode === 'classic'
    ? (timeRemaining <= 0 && !timeWarpActive)
    : timeBank <= 0

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim() || isDisabled) return
    const result = submitWord(value)
    if (result.valid) {
      const msg = result.beatMaster
        ? `+${result.score} pts · 🏆 Beat the Master (+${result.bonus} bonus)`
        : `+${result.score} pts`
      setFeedback({ ok: true, msg })
    } else {
      setFeedback({ ok: false, msg: result.reason })
    }
    setValue('')
    setTimeout(() => setFeedback(null), 2500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        {/* M3 outlined text field — Airbnb: input is sacred */}
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value.toLowerCase())}
          disabled={isDisabled}
          placeholder="Type your word…"
          autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck="false"
          className="input-field"
          style={{ padding: '14px 18px', fontSize: '1.125rem', flex: 1 }}
        />
        <button type="submit" disabled={isDisabled || !value.trim()}
          className="btn-primary"
          style={{ borderRadius: 'var(--shape-sm)', padding: '0 18px', minWidth: '56px' }}>
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </form>

      {feedback && (
        <div className="animate-enter" style={{
          padding: '12px 16px', borderRadius: 'var(--shape-sm)',
          textAlign: 'center', fontSize: '0.875rem', fontWeight: 600,
          color:      feedback.ok ? 'var(--success)' : 'var(--error)',
          background: feedback.ok ? 'var(--success-container)' : 'var(--error-container)',
        }}>
          {feedback.msg}
        </div>
      )}
    </div>
  )
}
