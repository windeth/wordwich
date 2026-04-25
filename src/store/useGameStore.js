import { create } from 'zustand'
import { generatePrompt, findMasterWord, findBridgeWord, validateWord } from '../game/engine'
import { calculateScore } from '../game/scoring'

const POWERUP_COSTS = { insight: 5, bridge: 2, timeWarp: 5 }
const CLASSIC_TURN_SECONDS = 60
const BEAT_BANK_SECONDS = 300
const CORRECT_WORD_BONUS = 5
const TIME_WARP_DURATION = 30

const initialRoundState = {
  prompt: null,
  masterWord: null,
  bridgeData: null,
  insightUsed: false,
  bridgeUsed: false,
  timeWarpActive: false,
  timeWarpRemaining: 0,
  timeRemaining: CLASSIC_TURN_SECONDS,
  timeBank: BEAT_BANK_SECONDS,
  roundHistory: [],
  currentPlayerIndex: 0,
  currentRound: 1,
  isLastRound: false,
}

export const useGameStore = create((set, get) => ({
  screen: 'home',
  players: [],
  gameMode: 'beatTheClock',
  roundLimit: null,
  difficulty: 'medium',
  multiplayerType: null, // null = single player | 'local' | 'host'

  ...initialRoundState,

  // ── Navigation ─────────────────────────────────────────────────────────────
  navigate: (screen) => set({ screen }),
  setMultiplayerType: (type) => set({ multiplayerType: type }),

  // ── Setup ──────────────────────────────────────────────────────────────────
  setPlayers: (players) => set({ players }),
  setRoundLimit: (roundLimit) => set({ roundLimit }),
  setDifficulty: (difficulty) => set({ difficulty }),

  // ── Game start ─────────────────────────────────────────────────────────────
  startGame: () => {
    const { difficulty, multiplayerType } = get()
    // local multiplayer = classic (turn-based), everything else = beat the clock
    const gameMode = multiplayerType === 'local' ? 'classic' : 'beatTheClock'
    const prompt = generatePrompt(difficulty)
    const masterWord = findMasterWord(prompt.startLetter, prompt.endLetter, difficulty)
    const bridgeData = findBridgeWord(prompt.startLetter, prompt.endLetter)
    set({
      ...initialRoundState,
      screen: 'game',
      gameMode,
      prompt,
      masterWord,
      bridgeData,
      timeRemaining: CLASSIC_TURN_SECONDS,
      timeBank: BEAT_BANK_SECONDS,
      currentRound: 1,
      currentPlayerIndex: 0,
    })
  },

  // ── Timer ─────────────────────────────────────────────────────────────────
  tickTimer: () => {
    const { gameMode, timeWarpActive, timeRemaining, timeBank } = get()
    if (timeWarpActive) return
    if (gameMode === 'classic') {
      if (timeRemaining <= 0) { get().advancePlayer(); return }
      set(s => ({ timeRemaining: s.timeRemaining - 1 }))
    } else {
      if (timeBank <= 0) { get().endGame(); return }
      set(s => ({ timeBank: s.timeBank - 1 }))
    }
  },

  tickTimeWarp: () => {
    set(s => {
      const next = s.timeWarpRemaining - 1
      if (next <= 0) return { timeWarpActive: false, timeWarpRemaining: 0 }
      return { timeWarpRemaining: next }
    })
  },

  // ── Word submission ────────────────────────────────────────────────────────
  submitWord: (word) => {
    const { prompt, bridgeUsed, players, currentPlayerIndex, roundHistory, gameMode, masterWord } = get()
    const result = validateWord(word, prompt.startLetter, prompt.endLetter)
    const player = players[currentPlayerIndex]

    if (!result.valid) {
      const updated = players.map((p, i) =>
        i === currentPlayerIndex ? { ...p, streak: 0 } : p
      )
      set({ players: updated })
      get().advancePlayer()
      return { valid: false, reason: result.reason }
    }

    const w = word.trim().toLowerCase()
    const masterLen = masterWord?.length ?? 0
    const pts = calculateScore(w, bridgeUsed, masterLen)
    const beatMaster = masterLen > 0 && w.length > masterLen
    const bonus = beatMaster ? w.length - masterLen : 0

    const updated = players.map((p, i) => {
      if (i !== currentPlayerIndex) return p
      return {
        ...p,
        score: p.score + pts,
        streak: p.streak + 1,
        longestWord: w.length > (p.longestWord?.length || 0) ? w : p.longestWord,
      }
    })

    const entry = { playerId: player.id, playerName: player.name, word: w, score: pts, wasValid: true, beatMaster, bonus }
    const newHistory = [...roundHistory, entry]

    if (gameMode === 'beatTheClock') {
      set(s => ({ players: updated, roundHistory: newHistory, timeBank: s.timeBank + CORRECT_WORD_BONUS }))
    } else {
      set({ players: updated, roundHistory: newHistory })
    }

    get().advancePlayer()
    return { valid: true, score: pts, beatMaster, bonus }
  },

  // ── Player/Round advancement ───────────────────────────────────────────────
  advancePlayer: () => {
    const { players, currentPlayerIndex, currentRound, roundLimit, gameMode } = get()
    const nextIndex = (currentPlayerIndex + 1) % players.length

    if (nextIndex === 0) {
      const roundWinner = [...get().players].sort((a, b) => b.score - a.score)[0]
      const updatedPlayers = get().players.map(p =>
        p.id === roundWinner.id ? { ...p, roundsWon: p.roundsWon + 1 } : p
      )
      const isLastRound = gameMode === 'classic' && roundLimit && currentRound >= roundLimit
      set({ players: updatedPlayers, screen: 'recap', isLastRound: !!isLastRound })
    } else {
      set({
        currentPlayerIndex: nextIndex,
        timeRemaining: CLASSIC_TURN_SECONDS,
        bridgeUsed: false,
        insightUsed: false,
      })
    }
  },

  // ── Next round ─────────────────────────────────────────────────────────────
  nextRound: () => {
    const { difficulty } = get()
    const prompt = generatePrompt(difficulty)
    const masterWord = findMasterWord(prompt.startLetter, prompt.endLetter, difficulty)
    const bridgeData = findBridgeWord(prompt.startLetter, prompt.endLetter)
    set(s => ({
      screen: 'game',
      prompt,
      masterWord,
      bridgeData,
      insightUsed: false,
      bridgeUsed: false,
      timeWarpActive: false,
      timeWarpRemaining: 0,
      timeRemaining: CLASSIC_TURN_SECONDS,
      roundHistory: [],
      currentPlayerIndex: 0,
      currentRound: s.currentRound + 1,
    }))
  },

  endGame: () => set({ screen: 'halloffame' }),

  // ── Power-ups ─────────────────────────────────────────────────────────────
  usePowerUp: (type) => {
    const { players, currentPlayerIndex } = get()
    const player = players[currentPlayerIndex]
    const cost = POWERUP_COSTS[type]

    if (player.score < cost) return { ok: false, reason: 'Not enough points.' }

    const updated = players.map((p, i) =>
      i === currentPlayerIndex ? { ...p, score: p.score - cost } : p
    )

    if (type === 'insight') set({ players: updated, insightUsed: true })
    else if (type === 'bridge') set({ players: updated, bridgeUsed: true })
    else if (type === 'timeWarp') set({ players: updated, timeWarpActive: true, timeWarpRemaining: TIME_WARP_DURATION })

    return { ok: true }
  },

  // ── Surrender ─────────────────────────────────────────────────────────────
  surrender: () => get().resetGame(),

  resetGame: () => set({
    screen: 'home',
    players: [],
    gameMode: 'beatTheClock',
    roundLimit: null,
    difficulty: 'medium',
    multiplayerType: null,
    ...initialRoundState,
  }),
}))
