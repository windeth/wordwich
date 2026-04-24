import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { ArrowRight } from 'lucide-react'

export default function WordInput() {
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState(null)
  const submitWord = useGameStore(s => s.submitWord)
  const timeRemaining = useGameStore(s => s.timeRemaining)
  const gameMode = useGameStore(s => s.gameMode)
  const timeBank = useGameStore(s => s.timeBank)
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
        ? `+${result.score} pts! 🏆 Beat the Master! (+${result.bonus} bonus)`
        : `+${result.score} pts!`
      setFeedback({ ok: true, msg })
    } else {
      setFeedback({ ok: false, msg: result.reason })
    }
    setValue('')
    setTimeout(() => setFeedback(null), 2500)
  }

  return (
    <div className="space-y-2 w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value.toLowerCase())}
          disabled={isDisabled}
          placeholder="Type your word…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
          className="input-field px-4 py-4 text-xl flex-1"
        />
        <button
          type="submit"
          disabled={isDisabled || !value.trim()}
          className="btn-primary px-5 rounded-xl"
        >
          <ArrowRight size={22} />
        </button>
      </form>

      {feedback && (
        <div
          className="text-center text-sm font-bold py-2 rounded-xl animate-fade-slide"
          style={feedback.ok
            ? { color: 'var(--success)', background: 'var(--success-l)' }
            : { color: 'var(--danger)', background: 'var(--danger-l)' }
          }
        >
          {feedback.msg}
        </div>
      )}
    </div>
  )
}
