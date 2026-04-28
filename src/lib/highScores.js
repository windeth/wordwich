const KEY = 'wordwich_highscores_v1'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? {} }
  catch { return {} }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // localStorage unavailable (private mode, quota exceeded) — silently skip
  }
}

// BTC is now a single progressive mode (no per-difficulty buckets).
const BTC_BUCKET = 'btc_progressive'

export function saveBTCRun({ words, timeSurvived }) {
  const all = load()
  const entry = { words, timeSurvived, date: Date.now() }
  all[BTC_BUCKET] = [...(all[BTC_BUCKET] ?? []), entry]
    .sort((a, b) => b.timeSurvived - a.timeSurvived || b.words - a.words)
    .slice(0, 10)
  save(all)
  return all[BTC_BUCKET][0]
}

export function getBTCBest() {
  return (load()[BTC_BUCKET] ?? [])[0] ?? null
}

export function getAllRuns() {
  return load()
}
