import wordsRaw from '../data/words.json'

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

// Easy mode: words ≤8 letters that read as everyday English
// Proxy: no uncommon double-consonant clusters, no very long Latin-root words
const UNCOMMON_CLUSTERS = ['kn', 'gn', 'pn', 'pt', 'ph', 'rh', 'wr']
function isEasyFamiliar(word) {
  if (word.length > 8) return false
  for (const c of UNCOMMON_CLUSTERS) {
    if (word.includes(c)) return false
  }
  return true
}

// Validated word set (all valid submissions)
export const wordsSet = new Set(wordsRaw)

// ── Master word pool by difficulty ────────────────────────────────────────
const masterPoolEasy = []
const masterPoolMedium = []
const masterPoolHard = []

for (const word of wordsRaw) {
  if (word.length < 4 || word.length > 15) continue
  if (isScientific(word)) continue
  if (isEasyFamiliar(word)) masterPoolEasy.push(word)
  if (word.length <= 12) masterPoolMedium.push(word)
  masterPoolHard.push(word) // all non-scientific words up to 15 letters
}

// ── Prompt difficulty pools (by letter-pair word count) ───────────────────
const pairCounts = {}
for (const word of wordsRaw) {
  const key = word[0] + word[word.length - 1]
  pairCounts[key] = (pairCounts[key] || 0) + 1
}

const promptPools = { easy: [], medium: [], hard: [] }
for (const [key, count] of Object.entries(pairCounts)) {
  const [s, e] = key.split('')
  if (s === e) continue
  const pair = { startLetter: s, endLetter: e }
  if (count >= 200) promptPools.easy.push(pair)
  else if (count >= 50) promptPools.medium.push(pair)
  else promptPools.hard.push(pair)
}

export function generatePrompt(difficulty = 'medium') {
  const pool = promptPools[difficulty]
  return pool[Math.floor(Math.random() * pool.length)]
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
  const pool = difficulty === 'easy' ? masterPoolEasy
    : difficulty === 'hard' ? masterPoolHard
    : masterPoolMedium

  let best = null
  for (const word of pool) {
    if (word[0] === s && word[word.length - 1] === e) {
      if (!best || word.length > best.length) best = word
    }
  }
  // Fallback: if no word found in the difficulty pool, search all non-scientific words
  if (!best) {
    for (const word of masterPoolMedium) {
      if (word[0] === s && word[word.length - 1] === e) {
        if (!best || word.length > best.length) best = word
      }
    }
  }
  return best
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

export async function fetchDefinition(word) {
  const cacheKey = `wordible_def_${word}`
  const cached = localStorage.getItem(cacheKey)
  if (cached !== null) return cached || null

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    if (!res.ok) { localStorage.setItem(cacheKey, ''); return null }
    const data = await res.json()
    const def = data[0]?.meanings[0]?.definitions[0]?.definition ?? ''
    localStorage.setItem(cacheKey, def)
    return def || null
  } catch {
    return null
  }
}
