import { create } from 'zustand'
import { generatePrompt, findMasterWord, findBridgeWord, validateWord, difficultyForProgress } from '../game/engine'
import { calculateScore } from '../game/scoring'
import { saveBTCRun, getBTCBest } from '../lib/highScores'

const POWERUP_COSTS = { insight: 5, bridge: 2, timeWarp: 5 }
const CLASSIC_TURN_SECONDS = 60
const BTC_START_SECONDS = 60
const BTC_WORD_BONUS = 20
const TIME_WARP_DURATION = 30
const PROGRESS_STEP = 5 // every N words/rounds, bump to the next difficulty tier

// Milestone thresholds (BTC only for words/time; length applies to BTC + Solo Classic)
const WORD_MILESTONES = [10, 50, 100]
const TIME_MILESTONES = [120, 300, 600] // seconds
const LENGTH_MILESTONE_MIN = 5 // skip celebrating the first 4-letter word

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
  // Per-game state (resets on startGame)
  usedWords: [],            // every valid word submitted in this game (reuse guard)
  runLongestLen: 0,         // longest valid word submitted this run (length milestones)
  milestonesShown: [],      // ids of milestones already fired this run
  currentMilestone: null,   // { id, kind, title, subtitle } | null
  btcPreviousBest: null,    // { words, timeSurvived } captured at run start
}

function pushMilestone(set, get, milestone) {
  const { milestonesShown } = get()
  if (milestonesShown.includes(milestone.id)) return
  set({
    milestonesShown: [...milestonesShown, milestone.id],
    currentMilestone: milestone,
  })
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
    const { gameMode, roundLimit } = get()

    if (gameMode === 'beatTheClock') {
      // BTC: auto-progressing difficulty starting at very easy. No picker.
      const startDifficulty = difficultyForProgress(0)
      const prompt = generatePrompt(startDifficulty)
      set({
        ...initialRoundState,
        screen: 'game',
        difficulty: startDifficulty,
        prompt,
        masterWord: null,
        bridgeData: null,
        timeRemaining: BTC_START_SECONDS,
        wordsCompleted: 0,
        currentRound: 1,
        currentPlayerIndex: 0,
        btcPreviousBest: getBTCBest(),
      })
      return
    }

    // Solo Classic with unlimited rounds also auto-progresses difficulty.
    const isSoloUnlimited = get().multiplayerType === null && !roundLimit
    const startDifficulty = isSoloUnlimited ? difficultyForProgress(0) : get().difficulty

    // Classic (solo or multiplayer)
    const prompt = generatePrompt(startDifficulty)
    const masterWord = findMasterWord(prompt.startLetter, prompt.endLetter, startDifficulty)
    const bridgeData = findBridgeWord(prompt.startLetter, prompt.endLetter)
    set({
      ...initialRoundState,
      screen: 'game',
      difficulty: startDifficulty,
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
      // Time milestones: fire when total elapsed crosses 2 / 5 / 10 minutes
      const { wordsCompleted, btcPreviousBest, timeRemaining } = get()
      const startPool = BTC_START_SECONDS + wordsCompleted * BTC_WORD_BONUS
      const elapsed = Math.max(0, startPool - timeRemaining)
      for (const target of TIME_MILESTONES) {
        if (elapsed >= target) {
          const mins = target / 60
          pushMilestone(set, get, {
            id: `time_${target}`,
            kind: 'time',
            title: `${mins} minute${mins === 1 ? '' : 's'} survived!`,
            subtitle: 'Keep the streak going',
          })
        }
      }
      // Time new-record (first time we exceed previous best survival time)
      if (btcPreviousBest && elapsed > btcPreviousBest.timeSurvived && btcPreviousBest.timeSurvived > 0) {
        pushMilestone(set, get, {
          id: 'time_new_record',
          kind: 'newRecord',
          title: 'New time record!',
          subtitle: 'You beat your personal best',
        })
      }
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
    const { prompt, bridgeUsed, players, currentPlayerIndex, roundHistory, gameMode, multiplayerType, masterWord, usedWords, runLongestLen, btcPreviousBest } = get()
    const result = validateWord(word, prompt.startLetter, prompt.endLetter)
    const w = word.trim().toLowerCase()

    // Reuse guard — applies to all modes once the word would otherwise be valid.
    if (result.valid && usedWords.includes(w)) {
      if (gameMode === 'beatTheClock' || multiplayerType === null) {
        set(s => ({ failedAttempts: s.failedAttempts + 1 }))
        return { valid: false, reason: 'Already used this game.' }
      }
      // Multiplayer: treat as a failed attempt and advance the player.
      const updated = players.map((p, i) => i === currentPlayerIndex ? { ...p, streak: 0 } : p)
      set({ players: updated })
      get().advancePlayer()
      return { valid: false, reason: 'Already used this game.' }
    }

    // ── BTC: pure survival ───────────────────────────────────────────────────
    if (gameMode === 'beatTheClock') {
      if (!result.valid) {
        set(s => ({ failedAttempts: s.failedAttempts + 1 }))
        return { valid: false, reason: result.reason }
      }
      const newWordsCompleted = get().wordsCompleted + 1
      const newDifficulty = difficultyForProgress(Math.floor(newWordsCompleted / PROGRESS_STEP))
      const newPrompt = generatePrompt(newDifficulty)
      set(s => ({
        wordsCompleted: newWordsCompleted,
        timeRemaining: s.timeRemaining + BTC_WORD_BONUS,
        prompt: newPrompt,
        difficulty: newDifficulty,
        failedAttempts: 0,
        usedWords: [...s.usedWords, w],
      }))
      // Word count milestones
      if (WORD_MILESTONES.includes(newWordsCompleted)) {
        pushMilestone(set, get, {
          id: `words_${newWordsCompleted}`,
          kind: 'words',
          title: `${newWordsCompleted} words!`,
          subtitle: 'Streak unlocked',
        })
      }
      // Word-count new record
      if (btcPreviousBest && newWordsCompleted === btcPreviousBest.words + 1 && btcPreviousBest.words > 0) {
        pushMilestone(set, get, {
          id: 'words_new_record',
          kind: 'newRecord',
          title: 'New word record!',
          subtitle: `Most words ever (${newWordsCompleted})`,
        })
      }
      // Word-length milestone (run-best)
      if (w.length >= LENGTH_MILESTONE_MIN && w.length > runLongestLen) {
        pushMilestone(set, get, {
          id: `len_${w.length}`,
          kind: 'length',
          title: 'New longest word!',
          subtitle: `${w.length} letters`,
        })
        set({ runLongestLen: w.length })
      }
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
    set({ players: updated, roundHistory: newHistory, usedWords: [...usedWords, w] })

    // Solo Classic: word-length milestone (run-best across rounds)
    if (multiplayerType === null && w.length >= LENGTH_MILESTONE_MIN && w.length > runLongestLen) {
      pushMilestone(set, get, {
        id: `len_${w.length}`,
        kind: 'length',
        title: 'New longest word!',
        subtitle: `${w.length} letters`,
      })
      set({ runLongestLen: w.length })
    }

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
    const { players, currentPlayerIndex, currentRound, roundLimit, gameMode } = get()
    const nextIndex = (currentPlayerIndex + 1) % players.length

    if (nextIndex === 0) {
      // End of round
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
        failedAttempts: 0,
      })
    }
  },

  // ── Next round ─────────────────────────────────────────────────────────────
  nextRound: () => {
    const { difficulty, multiplayerType, roundLimit, currentRound } = get()
    // Unlimited Solo Classic auto-progresses difficulty every PROGRESS_STEP rounds.
    const isSoloUnlimited = multiplayerType === null && !roundLimit
    const nextDifficulty = isSoloUnlimited
      ? difficultyForProgress(Math.floor(currentRound / PROGRESS_STEP))
      : difficulty
    const prompt = generatePrompt(nextDifficulty)
    const masterWord = findMasterWord(prompt.startLetter, prompt.endLetter, nextDifficulty)
    const bridgeData = findBridgeWord(prompt.startLetter, prompt.endLetter)
    set(s => ({
      screen: 'game',
      difficulty: nextDifficulty,
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

  // Clear the active milestone toast (called by MilestoneToast after fade).
  clearMilestone: () => set({ currentMilestone: null }),

  // ── End-of-game flows ──────────────────────────────────────────────────────
  endGame: () => {
    const { multiplayerType } = get()
    set({ screen: multiplayerType === null ? 'soloclassicend' : 'halloffame' })
  },

  endBTCRun: () => {
    const { wordsCompleted, btcPreviousBest } = get()
    // Total elapsed = (start + bonuses) - timeRemaining; clamp ≥ 0
    const startPool = BTC_START_SECONDS + wordsCompleted * BTC_WORD_BONUS
    const remaining = Math.max(0, get().timeRemaining)
    const timeSurvived = Math.max(0, startPool - remaining)
    const top = saveBTCRun({ words: wordsCompleted, timeSurvived })
    const isNewBest = !btcPreviousBest
      || top.timeSurvived > btcPreviousBest.timeSurvived
      || (top.timeSurvived === btcPreviousBest.timeSurvived && top.words > btcPreviousBest.words)
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
