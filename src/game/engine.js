import wordsRaw from '../data/words.json'
import qualifiedRaw from '../data/qualified-master-words.json'
import masterDefs from '../data/master-word-definitions.json'

// ── Scientific/technical suffix filter ────────────────────────────────────
const SCIENTIFIC_SUFFIXES = [
  'itis', 'osis', 'emia', 'uria', 'pathy', 'plasty', 'ectomy', 'otomy',
  'scopy', 'graphy', 'ology', 'arium', 'torium', 'phyte', 'cyte', 'lysis',
  'genesis', 'mycin', 'cillin', 'azole', 'oxine', 'aldehyde', 'ketone',
]
const SCIENTIFIC_PREFIXES = [
  'glyco', 'amino', 'nucleo', 'leuko', 'erythro', 'cyto', 'dendro',
  'litho', 'morpho', 'proto', 'xeno',
]

function isScientific(word) {
  for (const s of SCIENTIFIC_SUFFIXES) {
    if (word.endsWith(s) && word.length > s.length + 3) return true
  }
  for (const p of SCIENTIFIC_PREFIXES) {
    if (word.startsWith(p) && word.length > p.length + 2) return true
  }
  return false
}

// Validated word set (all valid submissions)
export const wordsSet = new Set(wordsRaw)

// ── Difficulty tiers ──────────────────────────────────────────────────────
// 6-tier ladder used by BTC (auto-progresses every 5 words) and unlimited
// Solo Classic (auto-progresses every 5 rounds). The fixed-round Solo Classic
// flow still uses the legacy easy/medium/hard tiers via the difficulty picker.
export const DIFFICULTY_TIERS = ['veryEasy', 'easy', 'medium', 'difficult', 'veryDifficult', 'einstein']
export const DIFFICULTY_LABELS = {
  veryEasy:      'Very Easy',
  easy:          'Easy',
  medium:        'Medium',
  difficult:     'Difficult',
  veryDifficult: 'Very Difficult',
  einstein:      'Einstein 🧠',
  hard:          'Hard', // legacy alias
}

// Einstein mode: weight prompts toward letter pairs that contain at least one
// of these "difficult" letters as the start or end letter.
const EINSTEIN_LETTERS = new Set(['j', 'q', 'v', 'x', 'z'])

// ── Master word pool by difficulty ────────────────────────────────────────
// Master words must have a dictionary definition (so the Insight power-up has
// something to reveal). The qualified list is built offline by
// scripts/qualify-master-words.sh against api.dictionaryapi.dev.
// If the qualified list is empty (e.g. the script hasn't been run yet), we fall
// back to the unfiltered pool so dev still works.
const qualifiedMasterWords = new Set(qualifiedRaw)
const filterByQualified = qualifiedMasterWords.size > 0

const masterPoolEasy = []   // 9–12 letters
const masterPoolMedium = [] // 10–13 letters
const masterPoolHard = []   // 12–15 letters

for (const word of wordsRaw) {
  if (word.length < 9 || word.length > 15) continue
  if (isScientific(word)) continue
  if (filterByQualified && !qualifiedMasterWords.has(word)) continue
  if (word.length <= 12) masterPoolEasy.push(word)
  if (word.length >= 10 && word.length <= 13) masterPoolMedium.push(word)
  if (word.length >= 12) masterPoolHard.push(word)
}

// ── Prompt difficulty pools (by letter-pair word count) ───────────────────
const pairCounts = {}
for (const word of wordsRaw) {
  const key = word[0] + word[word.length - 1]
  pairCounts[key] = (pairCounts[key] || 0) + 1
}

// Six-tier ladder by letter-pair word count.
const promptPools = {
  veryEasy:      [],
  easy:          [],
  medium:        [],
  difficult:     [],
  veryDifficult: [],
  einstein:      [],
}
for (const [key, count] of Object.entries(pairCounts)) {
  const [s, e] = key.split('')
  if (s === e) continue
  const pair = { startLetter: s, endLetter: e }
  if (count >= 1500)      promptPools.veryEasy.push(pair)
  else if (count >= 500)  promptPools.easy.push(pair)
  else if (count >= 150)  promptPools.medium.push(pair)
  else if (count >= 40)   promptPools.difficult.push(pair)
  else                    promptPools.veryDifficult.push(pair)
  // Einstein: any pair containing a difficult letter (J/Q/V/X/Z) at start or end.
  if (EINSTEIN_LETTERS.has(s) || EINSTEIN_LETTERS.has(e)) {
    promptPools.einstein.push(pair)
  }
}

// Drop prompt pairs that have no qualified Master Word at the tier's master pool.
function pairHasMaster(s, e, pool) {
  for (const w of pool) if (w[0] === s && w[w.length - 1] === e) return true
  if (pool !== masterPoolMedium) {
    for (const w of masterPoolMedium) if (w[0] === s && w[w.length - 1] === e) return true
  }
  return false
}
const masterPoolByTier = {
  veryEasy:      masterPoolEasy,
  easy:          masterPoolEasy,
  medium:        masterPoolMedium,
  difficult:     masterPoolHard,
  veryDifficult: masterPoolHard,
  einstein:      masterPoolHard,
}
for (const tier of Object.keys(promptPools)) {
  const masterPool = masterPoolByTier[tier] ?? masterPoolMedium
  promptPools[tier] = promptPools[tier].filter(({ startLetter, endLetter }) =>
    pairHasMaster(startLetter, endLetter, masterPool)
  )
}

// Legacy 3-tier names map onto the new ladder for the difficulty picker
// (multiplayer Classic + fixed-round Solo Classic).
const LEGACY_DIFFICULTY_ALIAS = { hard: 'difficult' }

export function generatePrompt(difficulty = 'medium') {
  const tier = LEGACY_DIFFICULTY_ALIAS[difficulty] ?? difficulty
  const pool = promptPools[tier] ?? promptPools.medium
  if (!pool.length) return promptPools.medium[Math.floor(Math.random() * promptPools.medium.length)]
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── Auto-progressive difficulty ───────────────────────────────────────────
// Bumps one tier every `step` correct words/rounds, capped at Einstein.
export function difficultyForProgress(step) {
  const idx = Math.min(step, DIFFICULTY_TIERS.length - 1)
  return DIFFICULTY_TIERS[idx]
}

export function validateWord(word, startLetter, endLetter) {
  const w = word.trim().toLowerCase()
  if (w.length < 4) return { valid: false, reason: 'Word must be at least 4 letters.' }
  if (w[0] !== startLetter.toLowerCase()) return { valid: false, reason: `Word must start with "${startLetter.toUpperCase()}".` }
  if (w[w.length - 1] !== endLetter.toLowerCase()) return { valid: false, reason: `Word must end with "${endLetter.toUpperCase()}".` }
  if (!wordsSet.has(w)) return { valid: false, reason: 'Not a valid English word.' }
  return { valid: true }
}

export function findMasterWord(startLetter, endLetter, difficulty = 'medium') {
  const s = startLetter.toLowerCase()
  const e = endLetter.toLowerCase()
  const tier = LEGACY_DIFFICULTY_ALIAS[difficulty] ?? difficulty
  const pool = (tier === 'veryEasy' || tier === 'easy') ? masterPoolEasy
    : (tier === 'difficult' || tier === 'veryDifficult' || tier === 'einstein') ? masterPoolHard
    : masterPoolMedium

  const pickFrom = (p) => {
    const matches = p.filter(w => w[0] === s && w[w.length - 1] === e)
    if (!matches.length) return null
    matches.sort((a, b) => b.length - a.length)
    const top = matches.slice(0, 3)
    return top[Math.floor(Math.random() * top.length)]
  }

  return pickFrom(pool) ?? pickFrom(masterPoolMedium)
}

export function findBridgeWord(startLetter, endLetter) {
  const s = startLetter.toLowerCase()
  const e = endLetter.toLowerCase()
  const candidates = masterPoolMedium.filter(w => w.length === 8 && w[0] === s && w[w.length - 1] === e)
  if (!candidates.length) {
    const fallback = masterPoolMedium.filter(w => w.length >= 6 && w[0] === s && w[w.length - 1] === e)
    if (!fallback.length) return null
    const w = fallback[Math.floor(Math.random() * fallback.length)]
    const mid = Math.floor(w.length / 2)
    return { word: w, letters: [w[mid - 1], w[mid]] }
  }
  const w = candidates[Math.floor(Math.random() * candidates.length)]
  return { word: w, letters: [w[3], w[4]] }
}

export function fetchDefinition(word) {
  return masterDefs[word?.toLowerCase()] ?? null
}
