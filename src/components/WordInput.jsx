import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { ArrowRight } from 'lucide-react'

export default function WordInput() {
  const [value, setValue]       = useState('')
  const [feedback, setFeedback] = useState(null)
  const submitWord     = useGameStore(s => s.submitWord)
  const timeRemaining  = useGameStore(s => s.timeRemaining)
  const gameMode       = useGameStore(s => s.gameMode)
  const timeWarpActive = useGameStore(s => s.timeWarpActive)
  const multiplayerType = useGameStore(s => s.multiplayerType)
  const prompt         = useGameStore(s => s.prompt)

  // Solo Classic has no timer; mp Classic + BTC do.
  const isDisabled = gameMode === 'beatTheClock'
    ? timeRemaining <= 0
    : multiplayerType !== null
      ? (timeRemaining <= 0 && !timeWarpActive)
      : false

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim() || isDisabled) return
    const result = submitWord(value)
    if (result.valid) {
      const msg = result.beatMaster
        ? `+${result.score} pts · 🏆 Beat the Master (+${result.bonus} bonus)`
        : result.score !== undefined ? `+${result.score} pts` : 'Nice!'
      setFeedback({ ok: true, msg })
      setValue('')
      setTimeout(() => setFeedback(null), 2500)
    } else {
      // Consolidated reminder of all the rules
      const start = prompt?.startLetter?.toUpperCase() ?? '?'
      const end   = prompt?.endLetter?.toUpperCase() ?? '?'
      setFeedback({
        ok: false,
        msg: `Try again — must be a real English word, at least 4 letters, starting with ${start} and ending with ${end}.`,
      })
      // Clear input so the player can retry from scratch.
      setValue('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
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
