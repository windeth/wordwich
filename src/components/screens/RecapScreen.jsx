import { useState, useEffect } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'
import { fetchDefinition } from '../../game/engine'
import Leaderboard from '../Leaderboard'

export default function RecapScreen() {
  const masterWord = useGameStore(s => s.masterWord)
  const players = useGameStore(s => s.players)
  const nextRound = useGameStore(s => s.nextRound)
  const endGame = useGameStore(s => s.endGame)
  const isLastRound = useGameStore(s => s.isLastRound)
  const roundHistory = useGameStore(s => s.roundHistory)
  const gameMode = useGameStore(s => s.gameMode)

  const [revealedLetters, setRevealedLetters] = useState(0)
  const [definition, setDefinition] = useState(null)
  const [defLoading, setDefLoading] = useState(false)
  const [defShown, setDefShown] = useState(false)

  const word = masterWord || '—'

  useEffect(() => {
    setRevealedLetters(0)
    setDefinition(null)
    setDefShown(false)
  }, [masterWord])

  useEffect(() => {
    if (revealedLetters >= word.length) return
    const t = setTimeout(() => setRevealedLetters(r => r + 1), 130)
    return () => clearTimeout(t)
  }, [revealedLetters, word.length])

  async function handleShowDefinition() {
    if (!masterWord) return
    setDefShown(true)
    setDefLoading(true)
    const def = await fetchDefinition(masterWord)
    setDefinition(def)
    setDefLoading(false)
  }

  const roundWinner = roundHistory.length
    ? [...players].sort((a, b) => {
        const aScore = roundHistory.filter(r => r.playerId === a.id).reduce((s, r) => s + r.score, 0)
        const bScore = roundHistory.filter(r => r.playerId === b.id).reduce((s, r) => s + r.score, 0)
        return bScore - aScore
      })[0]
    : null

  const isEndCondition = isLastRound || gameMode === 'beatTheClock'

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 gap-5 animate-fade-slide max-w-md mx-auto w-full">

      <h2 className="text-2xl font-black" style={{ color: 'var(--text)' }}>The Reveal</h2>

      {/* Master Word */}
      <div className="card-elevated w-full p-6 space-y-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>Master Word</p>

        <div className="flex items-center justify-center gap-1 flex-wrap min-h-[3rem]">
          {word.split('').map((letter, i) => (
            <span
              key={i}
              className={i < revealedLetters ? 'animate-reveal' : 'opacity-0'}
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                display: 'inline-block',
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {word !== '—' && (
          <p className="text-xs font-medium" style={{ color: 'var(--text3)' }}>
            {word.length} letters
          </p>
        )}

        {/* Definition on demand */}
        {!defShown && masterWord && revealedLetters >= word.length && (
          <button onClick={handleShowDefinition}
            className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm mx-auto">
            <BookOpen size={14} />
            Show Definition
          </button>
        )}

        {defShown && (
          <div className="text-sm rounded-xl p-3 text-left animate-fade-slide"
            style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
            {defLoading ? (
              <div className="flex items-center gap-2 justify-center">
                <Loader2 size={14} className="animate-spin" style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--text3)' }}>Fetching definition…</span>
              </div>
            ) : definition ? (
              <p className="italic leading-relaxed">{definition}</p>
            ) : (
              <p style={{ color: 'var(--text3)' }}>No definition available.</p>
            )}
          </div>
        )}
      </div>

      {/* Round winner */}
      {roundWinner && (
        <div className="card w-full p-4 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>Round Winner</p>
            <p className="text-base font-black" style={{ color: 'var(--success)' }}>{roundWinner.name}</p>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="w-full">
        <Leaderboard players={players} />
      </div>

      {/* Round submissions */}
      {roundHistory.length > 0 && (
        <div className="card w-full overflow-hidden">
          <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
              This Round
            </span>
          </div>
          {roundHistory.map((entry, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0"
              style={{ borderColor: 'var(--border)' }}>
              <div>
                <span className="text-xs" style={{ color: 'var(--text3)' }}>{entry.playerName} · </span>
                <span className="text-sm font-bold uppercase" style={{ color: 'var(--text)' }}>{entry.word}</span>
                {entry.beatMaster && (
                  <span className="ml-1.5 text-xs font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: '#fef3c7', color: '#d97706' }}>
                    🏆 Beat Master!
                  </span>
                )}
              </div>
              <span className="text-sm font-black" style={{ color: 'var(--success)' }}>+{entry.score}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={isEndCondition ? endGame : nextRound}
        className="btn-primary w-full py-4 text-base rounded-2xl">
        {isEndCondition ? 'See Final Results →' : 'Next Round →'}
      </button>
    </div>
  )
}
