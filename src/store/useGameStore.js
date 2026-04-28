import { create } from 'zustand'
import { generatePrompt, findMasterWord, findBridgeWord, validateWord } from '../game/engine'
import { calculateScore } from '../game/scoring'
import { saveBTCRun } from '../lib/highScores'

const POWERUP_COSTS = { insight: 5, bridge: 2, timeWarp: 5 }
const CLASSIC_TURN_SECONDS = 60
const BTC_START_SECONDS = 180
const BTC_WORD_BONUS = 60
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
  roundHistory: [],
  currentPlayerIndex: 0,
  currentRound: 1,
  isLastRound: false,
  wordsCompleted: 0,
  failedAttempts: 0,
  lastBTCResult: null, // { words, timeSurvived, isNewBest }
}

export const useGameStore = create((set, get) => ({
  screen: 'home',
  players: [],
  gameMode: 'classic',
  roundLimit: null,
  difficulty: 'medium',
  multiplayerType: null, // null = single player | 'local' | 'host'

  ...initialRoundState,

  // ── Navigation ─────────────────────────────────────────────────────────────
  navigate: (screen) => set({ screen }),
  setMultiplayerType: (type) => set({ multiplayerType: type }),
  setGameMode: (mode) => set({ gameMode: mode }),

  // ── Setup ──────────────────────────────────────────────────────────────────
  setPlayers: (players) => set({ players }),
  setRoundLimit: (roundLimit) => set({ roundLimit }),
  setDifficulty: (difficulty) => set({ difficulty }),

  // ── Game start ─────────────────────────────────────────────────────────────
  startGame: () => {
    const { difficulty, gameMode } = get()
    const prompt = generatePrompt(difficulty)

    if (gameMode === 'beatTheClock') {
      // Pure survival: just a prompt; no master word, no bridge.
      set({
        ...initialRoundState,
        screen: 'game',
        prompt,
        masterWord: null,
        bridgeData: null,
        timeRemaining: BTC_START_SECONDS,
        wordsCompleted: 0,
        currentRound: 1,
        currentPlayerIndex: 0,
      })
      return
    }

    // Classic (solo or multiplayer)
    const masterWord = findMasterWord(prompt.startLetter, prompt.endLetter, difficulty)
    const bridgeData = findBridgeWord(prompt.startLetter, prompt.endLetter)
    set({
      ...initialRoundState,
      screen: 'game',
      prompt,
      masterWord,
      bridgeData,
      timeRemaining: CLASSIC_TURN_SECONDS,
      currentRound: 1,
      currentPlayerIndex: 0,
    })
  },

  // ── Timer ─────────────────────────────────────────────────────────────────
  tickTimer: () => {
    const { gameMode, timeWarpActive, multiplayerType } = get()
    if (timeWarpActive) return
    if (gameMode === 'beatTheClock') {
      const t = get().timeRemaining
      if (t <= 0) { get().endBTCRun(); return }
      set(s => ({ timeRemaining: s.timeRemaining - 1 }))
      return
    }
    // Classic: solo has no timer; only multiplayer ticks per turn.
    if (multiplayerType === null) return
    const t = get().timeRemaining
    if (t <= 0) { get().advancePlayer(); return }
    set(s => ({ timeRemaining: s.timeRemaining - 1 }))
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
    const { prompt, bridgeUsed, players, currentPlayerIndex, roundHistory, gameMode, multiplayerType, masterWord } = get()
    const result = validateWord(word, prompt.startLetter, prompt.endLetter)

    // ── BTC: pure survival ───────────────────────────────────────────────────
    if (gameMode === 'beatTheClock') {
      if (!result.valid) {
        set(s => ({ failedAttempts: s.failedAttempts + 1 }))
        return { valid: false, reason: result.reason }
      }
      const newPrompt = generatePrompt(get().difficulty)
      set(s => ({
        wordsCompleted: s.wordsCompleted + 1,
        timeRemaining: s.timeRemaining + BTC_WORD_BONUS,
        prompt: newPrompt,
        failedAttempts: 0,
      }))
      return { valid: true }
    }

    // ── Classic: invalid attempt — solo retries; multiplayer advances ────────
    if (!result.valid) {
      if (multiplayerType === null) {
        // Solo Classic: stay on the prompt, increment fail count
        set(s => ({ failedAttempts: s.failedAttempts + 1 }))
        return { valid: false, reason: result.reason }
      }
      const updated = players.map((p, i) =>
        i === currentPlayerIndex ? { ...p, streak: 0 } : p
      )
      set({ players: updated })
      get().advancePlayer()
      return { valid: false, reason: result.reason }
    }

    // ── Classic: valid word ──────────────────────────────────────────────────
    const w = word.trim().toLowerCase()
    const masterLen = masterWord?.length ?? 0
    const pts = calculateScore(w, bridgeUsed, masterLen)
    const beatMaster = masterLen > 0 && w.length > masterLen
    const bonus = beatMaster ? 2 * (w.length - masterLen) : 0
    const player = players[currentPlayerIndex]

    const updated = players.map((p, i) => {
      if (i !== currentPlayerIndex) return p
      return {
        ...p,
        score: p.score + pts,
        streak: p.streak + 1,
        longestWord: w.length > (p.longestWord?.length || 0) ? w : p.longestWord,
      }
    })

    const entry = { playerId: player.id, playerName: player.name, word: w, score: pts, wasValid: true, beatMaster, bonus, passed: false }
    const newHistory = [...roundHistory, entry]
    set({ players: updated, roundHistory: newHistory })
    get().advancePlayer()
    return { valid: true, score: pts, beatMaster, bonus }
  },

  // ── Pass (solo Classic only) ───────────────────────────────────────────────
  passRound: () => {
    const { players, currentPlayerIndex, roundHistory } = get()
    const player = players[currentPlayerIndex]
    const updated = players.map((p, i) =>
      i === currentPlayerIndex ? { ...p, streak: 0 } : p
    )
    const entry = { playerId: player.id, playerName: player.name, word: '—', score: 0, wasValid: false, beatMaster: false, bonus: 0, passed: true }
    set({ players: updated, roundHistory: [...roundHistory, entry] })
    get().advancePlayer()
  },

  // ── Player/Round advancement ───────────────────────────────────────────────
  advancePlayer: () => {
    const { players, currentPlayerIndex, currentRound, roundLimit, gameMode, multiplayerType } = get()
    const nextIndex = (currentPlayerIndex + 1) % players.length

    if (nextIndex === 0) {
      // End of round
      const roundWinner = [...get().players].sort((a, b) => b.score - a.score)[0]
      const updatedPlayers = get().players.map(p =>
        p.id === roundWinner.id ? { ...p, roundsWon: p.roundsWon + 1 } : p
      )
      const isLastRound = gameMode === 'classic' && roundLimit && currentRound >= roundLimit
      // Solo Classic: skip recap on the last round and go straight to end screen
      if (multiplayerType === null && isLastRound) {
        set({ players: updatedPlayers, isLastRound: true })
        get().endSoloClassic()
        return
      }
      set({ players: updatedPlayers, screen: 'recap', isLastRound: !!isLastRound })
    } else {
      set({
        currentPlayerIndex: nextIndex,
        timeRemaining: CLASSIC_TURN_SECONDS,
        bridgeUsed: false,
        insightUsed: false,
        failedAttempts: 0,
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
      failedAttempts: 0,
    }))
  },

  // ── End-of-game flows ──────────────────────────────────────────────────────
  endGame: () => set({ screen: 'halloffame' }),

  endBTCRun: () => {
    const { difficulty, wordsCompleted } = get()
    // Total elapsed = (start + bonuses) - timeRemaining; clamp ≥ 0
    const startPool = BTC_START_SECONDS + wordsCompleted * BTC_WORD_BONUS
    const remaining = Math.max(0, get().timeRemaining)
    const timeSurvived = Math.max(0, startPool - remaining)
    const previousBest = (() => {
      try {
        const raw = JSON.parse(localStorage.getItem('wordwich_highscores_v1')) ?? {}
        return (raw[`btc_${difficulty}`] ?? [])[0] ?? null
      } catch { return null }
    })()
    const top = saveBTCRun({ difficulty, words: wordsCompleted, timeSurvived })
    const isNewBest = !previousBest
      || top.timeSurvived > previousBest.timeSurvived
      || (top.timeSurvived === previousBest.timeSurvived && top.words > previousBest.words)
    set({
      lastBTCResult: { words: wordsCompleted, timeSurvived, isNewBest },
      screen: 'btcgameover',
    })
  },

  endSoloClassic: () => {
    set({ screen: 'soloclassicend' })
  },

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
  surrender: () => {
    const { multiplayerType, gameMode } = get()
    if (multiplayerType !== null) {
      // Multiplayer: existing behavior (full reset to home)
      get().resetGame()
      return
    }
    if (gameMode === 'beatTheClock') {
      get().endBTCRun()
      return
    }
    // Solo Classic
    get().endSoloClassic()
  },

  resetGame: () => set({
    screen: 'home',
    players: [],
    gameMode: 'classic',
    roundLimit: null,
    difficulty: 'medium',
    multiplayerType: null,
    ...initialRoundState,
  }),
}))
