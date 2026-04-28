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

export function saveBTCRun({ difficulty, words, timeSurvived }) {
  const all = load()
  const bucket = `btc_${difficulty}`
  const entry = { words, timeSurvived, date: Date.now() }
  all[bucket] = [...(all[bucket] ?? []), entry]
    .sort((a, b) => b.timeSurvived - a.timeSurvived || b.words - a.words)
    .slice(0, 10)
  save(all)
  return all[bucket][0]
}

export function getBTCBest(difficulty) {
  return (load()[`btc_${difficulty}`] ?? [])[0] ?? null
}

export function getAllRuns() {
  return load()
}
