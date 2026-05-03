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
WEBSTER_JSON="$SCRIPT_DIR/webster-1913-words.json"
QUALIFIED_JSON="$ROOT_DIR/src/data/qualified-master-words.json"
CACHE_JSON="$SCRIPT_DIR/.qualification-cache.json"
WORDS_LIST="$(mktemp)"
SLEEP_SECS="${SLEEP_SECS:-1}"

trap 'rm -f "$WORDS_LIST"' EXIT

for cmd in node curl jq; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "missing required command: $cmd" >&2; exit 1; }
done
[ -f "$WORDS_JSON" ]   || { echo "words.json not found at $WORDS_JSON" >&2; exit 1; }
[ -f "$WEBSTER_JSON" ] || { echo "webster-1913-words.json not found at $WEBSTER_JSON — run: curl -s ... | jq ... > $WEBSTER_JSON" >&2; exit 1; }

echo "Computing master-word universe (Webster-filtered, top-3 per pair/tier)…"
node -e "
const words   = require('$WORDS_JSON');
const webster = new Set(require('$WEBSTER_JSON'));
const SCI_SUF = ['itis','osis','emia','uria','pathy','plasty','ectomy','otomy','scopy','graphy','ology','arium','torium','phyte','cyte','lysis','genesis','mycin','cillin','azole','oxine','aldehyde','ketone'];
const SCI_PRE = ['glyco','amino','nucleo','leuko','erythro','cyto','dendro','litho','morpho','proto','xeno'];
const isSci = w => SCI_SUF.some(s => w.endsWith(s) && w.length > s.length + 3)
              || SCI_PRE.some(p => w.startsWith(p) && w.length > p.length + 2);
// Length tiers: easy 9-12, medium 10-13, hard 12-15
const buckets = { easy: {}, medium: {}, hard: {} };
for (const w of words) {
  if (w.length < 9 || w.length > 15) continue;
  if (isSci(w)) continue;
  if (!webster.has(w)) continue;
  const k = w[0] + w[w.length-1];
  const add = (b) => { if (!b[k]) b[k] = []; b[k].push(w); };
  if (w.length <= 12) add(buckets.easy);
  if (w.length >= 10 && w.length <= 13) add(buckets.medium);
  if (w.length >= 12) add(buckets.hard);
}
// Keep top 3 per (pair, tier) by descending length
const TOP_N = 3;
const seen = new Set();
for (const diff of ['easy','medium','hard']) {
  const b = buckets[diff];
  for (const k of Object.keys(b)) {
    b[k].sort((a, z) => z.length - a.length);
    b[k].slice(0, TOP_N).forEach(w => seen.add(w));
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

# Project to bundled deliverable: only current candidates that have a definition
QUALIFIED_LIST="$(mktemp)"
jq -r 'to_entries[] | select(.value != "") | .key' "$CACHE_JSON" | sort > "$QUALIFIED_LIST"
comm -12 <(sort "$WORDS_LIST") "$QUALIFIED_LIST" | jq -R -s 'split("\n") | map(select(length > 0)) | sort' > "$QUALIFIED_JSON"
rm -f "$QUALIFIED_LIST"

total=$(jq 'length' "$CACHE_JSON")
qualified=$(jq 'length' "$QUALIFIED_JSON")
echo "Done. $qualified/$total candidates qualified. Wrote $QUALIFIED_JSON."

echo "Regenerating src/data/master-word-definitions.json…"
node -e "
const cache = require('$CACHE_JSON');
const words = require('$QUALIFIED_JSON');
const out = {};
for (const w of words) { const d = cache[w]; if (d) out[w] = d; }
require('fs').writeFileSync('$ROOT_DIR/src/data/master-word-definitions.json', JSON.stringify(out, null, 2));
console.log('Wrote', Object.keys(out).length, 'definitions to src/data/master-word-definitions.json');
"
