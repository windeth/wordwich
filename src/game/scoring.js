export function calculateScore(word, bridgeUsed, masterWordLength = 0) {
  const base = word.length - (bridgeUsed ? 2 : 0)
  const bonus = masterWordLength > 0 && word.length > masterWordLength
    ? word.length - masterWordLength
    : 0
  return Math.max(0, base) + bonus
}
