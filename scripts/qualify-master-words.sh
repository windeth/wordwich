#!/usr/bin/env bash
# Pre-qualify the master-word pool against the Free Dictionary API.
#
# A word is "qualified" only if api.dictionaryapi.dev returns a non-empty primary
# definition. Disqualified words must never be picked as the Master Word, since
# the Insight power-up would have nothing to display.
#
# Inputs:  src/data/words.json (dictionary)
# Outputs: src/data/qualified-master-words.json (sorted JSON array of qualified words)
#          scripts/.qualification-cache.json    (dev-only working cache; gitignored)
#
# The cache stores { word: definition_or_empty } for every word checked, so a
# re-run only fetches words that haven't been seen before. Safe to interrupt and
# resume.
#
# Required tools (no npm packages installed): bash, node, curl, jq.
# Env knobs: SLEEP_SECS (default 1) — pause between API calls.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORDS_JSON="$ROOT_DIR/src/data/words.json"
QUALIFIED_JSON="$ROOT_DIR/src/data/qualified-master-words.json"
CACHE_JSON="$SCRIPT_DIR/.qualification-cache.json"
WORDS_LIST="$(mktemp)"
SLEEP_SECS="${SLEEP_SECS:-1}"

trap 'rm -f "$WORDS_LIST"' EXIT

for cmd in node curl jq; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "missing required command: $cmd" >&2; exit 1; }
done
[ -f "$WORDS_JSON" ] || { echo "words.json not found at $WORDS_JSON" >&2; exit 1; }

echo "Computing master-word universe from words.json…"
node -e "
const words = require('$WORDS_JSON');
const SCI_SUF = ['itis','osis','emia','uria','pathy','plasty','ectomy','otomy','scopy','graphy','ology','arium','torium','phyte','cyte','lysis','genesis','mycin','cillin','azole','oxine','aldehyde','ketone'];
const SCI_PRE = ['glyco','amino','nucleo','leuko','erythro','cyto','dendro','litho','morpho','proto','xeno'];
const UNCOMMON = ['kn','gn','pn','pt','ph','rh','wr'];
const isSci = w => SCI_SUF.some(s => w.endsWith(s) && w.length > s.length + 3)
                || SCI_PRE.some(p => w.startsWith(p) && w.length > p.length + 2);
const isEasy = w => w.length <= 8 && !UNCOMMON.some(c => w.includes(c));
// For each (startLetter, endLetter) bucket, keep the longest word per pool.
const buckets = { easy: {}, medium: {}, hard: {} };
const keep = (b, k, w) => { if (!b[k] || w.length > b[k].length) b[k] = w; };
for (const w of words) {
  if (w.length < 4 || w.length > 15) continue;
  if (isSci(w)) continue;
  const k = w[0] + w[w.length - 1];
  if (isEasy(w)) keep(buckets.easy, k, w);
  if (w.length <= 12) keep(buckets.medium, k, w);
  keep(buckets.hard, k, w);
}
const seen = new Set();
for (const diff of ['easy','medium','hard']) {
  for (let i = 0; i < 26; i++) {
    for (let j = 0; j < 26; j++) {
      if (i === j) continue;
      const k = String.fromCharCode(97 + i) + String.fromCharCode(97 + j);
      const best = buckets[diff][k] || buckets.medium[k];
      if (best) seen.add(best);
    }
  }
}
process.stdout.write([...seen].sort().join('\n') + '\n');
" > "$WORDS_LIST"

TOTAL=$(wc -l < "$WORDS_LIST" | tr -d ' ')
echo "Found $TOTAL unique master-word candidates."

[ -f "$CACHE_JSON" ] || echo "{}" > "$CACHE_JSON"

i=0
fetched=0
while IFS= read -r word; do
  i=$((i + 1))
  [ -z "$word" ] && continue
  if jq -e --arg w "$word" 'has($w)' "$CACHE_JSON" >/dev/null; then
    continue
  fi
  resp=$(curl -s -m 15 "https://api.dictionaryapi.dev/api/v2/entries/en/$word" || true)
  def=""
  if [ -n "$resp" ]; then
    def=$(printf '%s' "$resp" | jq -r 'try .[0].meanings[0].definitions[0].definition // ""' 2>/dev/null || echo "")
  fi
  tmp=$(mktemp)
  jq --arg w "$word" --arg d "$def" '. + {($w): $d}' "$CACHE_JSON" > "$tmp" && mv "$tmp" "$CACHE_JSON"
  fetched=$((fetched + 1))
  if [ $((fetched % 25)) -eq 0 ]; then
    have=$(jq 'length' "$CACHE_JSON")
    qualified=$(jq '[.[] | select(. != "")] | length' "$CACHE_JSON")
    status=$([ -n "$def" ] && echo "✓" || echo "✗")
    echo "  [$i/$TOTAL] $status $word  (cache: $have, qualified: $qualified)"
  fi
  sleep "$SLEEP_SECS"
done < "$WORDS_LIST"

# Project to bundled deliverable: sorted array of qualified words only
jq '[to_entries[] | select(.value != "") | .key] | sort' "$CACHE_JSON" > "$QUALIFIED_JSON"

total=$(jq 'length' "$CACHE_JSON")
qualified=$(jq 'length' "$QUALIFIED_JSON")
echo "Done. $qualified/$total candidates qualified. Wrote $QUALIFIED_JSON."
