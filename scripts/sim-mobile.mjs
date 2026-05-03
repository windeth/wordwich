/**
 * Wordwich mobile layout simulation.
 * For each device profile (iPhone WebKit + Pixel Chromium), launches the app at
 * http://localhost:5174 in three game modes (solo classic, BTC, multiplayer),
 * captures default + keyboard-open screenshots, and verifies key elements stay
 * within the visible viewport.
 */
import { chromium, webkit, devices } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const URL = 'http://localhost:5174/'
const OUT = '/tmp/wordwich-sim/shots'
await mkdir(OUT, { recursive: true })

// Keyboard-open visual viewport heights — realistic measurements from iOS/Android.
// Playwright's `viewport` already excludes browser chrome; subtract real keyboard heights.
const PROFILES = [
  {
    name: 'iphone-se',
    label: 'iPhone SE 2nd/3rd gen (smallest in current use, 375x667)',
    browser: webkit,
    device: { ...devices['iPhone SE'], viewport: { width: 375, height: 667 } },
    keyboardOpenH: 320,                     // 667 - ~291 keyboard - ~56 chrome ≈ worst-case real device
  },
  {
    name: 'iphone-13',
    label: 'iPhone 13 (typical, 390x664 layout)',
    browser: webkit,
    device: devices['iPhone 13'],           // Playwright reports 390x664
    keyboardOpenH: 373,                     // 664 - ~291 keyboard
  },
  {
    name: 'pixel-7',
    label: 'Pixel 7 (Android Chrome, 412x839 layout)',
    browser: chromium,
    device: devices['Pixel 7'],             // Playwright reports 412x839
    keyboardOpenH: 540,                     // 839 - ~280 keyboard - ~20 toolbar
  },
]

const MODES = [
  {
    name: 'solo-classic',
    label: 'Solo Classic',
    setupFn: () => {
      const store = window.__zustand_store
      store.setState({
        screen: 'game',
        gameMode: 'classic',
        multiplayerType: null,
        roundLimit: null,
        difficulty: 'medium',
        players: [{ id: 'p1', name: 'Tester', score: 0, streak: 0, powerUpInventory: { insight: 1, bridge: 1, timeWarp: 1 } }],
        currentPlayerIndex: 0,
        prompt: { startLetter: 'b', endLetter: 'e' },
        masterWord: 'breeze',
        bridgeData: null,
        currentRound: 1,
        timeRemaining: 60,
        wordsCompleted: 0,
        usedWords: [],
      })
    },
  },
  {
    name: 'btc-solo',
    label: 'Beat the Clock (solo)',
    setupFn: () => {
      const store = window.__zustand_store
      store.setState({
        screen: 'game',
        gameMode: 'beatTheClock',
        multiplayerType: null,
        roundLimit: null,
        difficulty: 'medium',
        players: [{ id: 'p1', name: 'Tester', score: 0, streak: 0, powerUpInventory: { insight: 1, bridge: 1, timeWarp: 1 } }],
        currentPlayerIndex: 0,
        prompt: { startLetter: 't', endLetter: 'd' },
        masterWord: null,
        bridgeData: null,
        currentRound: 1,
        timeRemaining: 60,
        wordsCompleted: 7,
        usedWords: [],
      })
    },
  },
  {
    name: 'multiplayer-classic',
    label: 'Multiplayer Classic (2 players)',
    setupFn: () => {
      const store = window.__zustand_store
      store.setState({
        screen: 'game',
        gameMode: 'classic',
        multiplayerType: 'local',
        roundLimit: 5,
        difficulty: 'medium',
        players: [
          { id: 'p1', name: 'Alice', score: 8, streak: 1, powerUpInventory: { insight: 1, bridge: 1, timeWarp: 1 } },
          { id: 'p2', name: 'Bob',   score: 5, streak: 0, powerUpInventory: { insight: 1, bridge: 1, timeWarp: 1 } },
        ],
        currentPlayerIndex: 0,
        prompt: { startLetter: 'm', endLetter: 'n' },
        masterWord: 'mountain',
        bridgeData: null,
        currentRound: 2,
        timeRemaining: 60,
        usedWords: [],
      })
    },
  },
]

// main.jsx exposes window.__zustand_store in DEV — no dynamic import needed.

const checks = []

for (const profile of PROFILES) {
  const browser = await profile.browser.launch()
  const ctx = await browser.newContext({ ...profile.device })
  const page = await ctx.newPage()

  // Boot the app and wait for the store to be available
  await page.goto(URL)
  await page.waitForFunction(() => !!window.__zustand_store, null, { timeout: 10000 })

  for (const mode of MODES) {
    // Set up game state
    await page.evaluate(mode.setupFn)
    await page.waitForTimeout(300) // let React render

    const profileViewport = profile.device.viewport
    // ── Default (no keyboard) ────────────────────────────────────────────
    await page.setViewportSize(profileViewport)
    await page.waitForTimeout(200)
    const defaultPath = `${OUT}/${profile.name}_${mode.name}_default.png`
    await page.screenshot({ path: defaultPath, fullPage: false })

    const defaultMetrics = await page.evaluate(() => {
      const visualH = window.visualViewport?.height ?? window.innerHeight
      const score = document.querySelector('[class*="animate-score-pop"], .label')
      // Heuristic: look for the prompt letter boxes (they contain a single letter and have specific styling)
      const cards = Array.from(document.querySelectorAll('div')).filter(d => {
        const s = getComputedStyle(d)
        return s.background.includes('rgb') && parseFloat(s.fontSize) > 28
      })
      const inputEl = document.querySelector('input[type="text"]')
      return {
        visualH,
        innerH: window.innerHeight,
        inputBottom: inputEl?.getBoundingClientRect().bottom ?? null,
        inputTop:    inputEl?.getBoundingClientRect().top ?? null,
      }
    })

    // ── Keyboard-open ────────────────────────────────────────────────────
    await page.setViewportSize({ width: profileViewport.width, height: profile.keyboardOpenH })
    await page.waitForTimeout(300)
    // Focus input so it stays in DOM
    await page.click('input[type="text"]').catch(() => {})
    await page.waitForTimeout(200)
    const kbPath = `${OUT}/${profile.name}_${mode.name}_keyboard.png`
    await page.screenshot({ path: kbPath, fullPage: false })

    const kbMetrics = await page.evaluate(() => {
      const visualH = window.visualViewport?.height ?? window.innerHeight
      const innerH = window.innerHeight
      const inputEl = document.querySelector('input[type="text"]')
      const inputRect = inputEl?.getBoundingClientRect()
      // PowerUpBar — find a button with a sparkle/eye/lightbulb icon, OR by querying for the BOTTOM zone direct child
      const allDivs = Array.from(document.querySelectorAll('div'))
      // Find the prompt card by looking for a div with the letter boxes (children with single letter, large font)
      const promptCard = allDivs.find(d => {
        const labels = d.querySelectorAll('.label')
        if (labels.length < 2) return false
        const texts = Array.from(labels).map(l => l.textContent.trim())
        return texts.includes('start with') && texts.includes('end with')
      })
      const promptRect = promptCard?.getBoundingClientRect()
      // Score: find span with the score label nearby
      const scoreLabel = Array.from(document.querySelectorAll('.label')).find(l => l.textContent.trim() === 'Score')
      const scoreEl = scoreLabel?.parentElement
      const scoreRect = scoreEl?.getBoundingClientRect()
      // PowerUpBar: it's the sibling above WordInput in the BOTTOM zone
      const inputForm = inputEl?.closest('form')
      const wordInputContainer = inputForm?.parentElement
      const bottomZone = wordInputContainer?.parentElement
      const powerUpBar = bottomZone?.firstElementChild === wordInputContainer
        ? null
        : bottomZone?.firstElementChild
      const powerUpRect = powerUpBar?.getBoundingClientRect()

      const inViewport = (r) => r && r.top >= 0 && r.bottom <= visualH && r.bottom > 0
      return {
        visualH,
        innerH,
        // Returns null if element wasn't found
        score:    scoreRect    ? { top: scoreRect.top,    bottom: scoreRect.bottom,    inView: inViewport(scoreRect) }    : null,
        prompt:   promptRect   ? { top: promptRect.top,   bottom: promptRect.bottom,   inView: inViewport(promptRect) }   : null,
        powerUp:  powerUpRect  ? { top: powerUpRect.top,  bottom: powerUpRect.bottom,  inView: inViewport(powerUpRect) }  : null,
        input:    inputRect    ? { top: inputRect.top,    bottom: inputRect.bottom,    inView: inViewport(inputRect) }    : null,
        isCompactExpected: visualH < 620,
      }
    })

    checks.push({
      profile: profile.label,
      mode: mode.label,
      default: { visualH: defaultMetrics.visualH, screenshot: defaultPath },
      kb:      { ...kbMetrics, screenshot: kbPath },
    })
  }

  await browser.close()
}

// Print a structured report
console.log('\n══════════════════════════ SIMULATION REPORT ══════════════════════════\n')
for (const c of checks) {
  console.log(`▶ ${c.profile} — ${c.mode}`)
  console.log(`  Default state vh=${c.default.visualH}  →  ${c.default.screenshot}`)
  console.log(`  Keyboard open vh=${c.kb.visualH}  (compact mode expected: ${c.kb.isCompactExpected})`)
  console.log(`    Score visible:    ${c.kb.score?.inView}  ${c.kb.score ? `(top=${c.kb.score.top.toFixed(0)} bot=${c.kb.score.bottom.toFixed(0)})` : '(not found)'}`)
  console.log(`    Prompt visible:   ${c.kb.prompt?.inView}  ${c.kb.prompt ? `(top=${c.kb.prompt.top.toFixed(0)} bot=${c.kb.prompt.bottom.toFixed(0)})` : '(not found)'}`)
  console.log(`    PowerUpBar vis:   ${c.kb.powerUp?.inView} ${c.kb.powerUp ? `(top=${c.kb.powerUp.top.toFixed(0)} bot=${c.kb.powerUp.bottom.toFixed(0)})` : '(not found)'}`)
  console.log(`    Input visible:    ${c.kb.input?.inView}  ${c.kb.input ? `(top=${c.kb.input.top.toFixed(0)} bot=${c.kb.input.bottom.toFixed(0)})` : '(not found)'}`)
  console.log(`    Screenshot:       ${c.kb.screenshot}`)
  console.log('')
}

// Summary verdict
const failures = checks.flatMap(c => {
  const f = []
  if (c.kb.score    && !c.kb.score.inView)    f.push(`${c.profile} / ${c.mode}: Score cropped`)
  if (c.kb.prompt   && !c.kb.prompt.inView)   f.push(`${c.profile} / ${c.mode}: Prompt cropped`)
  if (c.kb.powerUp  && !c.kb.powerUp.inView)  f.push(`${c.profile} / ${c.mode}: PowerUpBar cropped`)
  if (c.kb.input    && !c.kb.input.inView)    f.push(`${c.profile} / ${c.mode}: WordInput cropped`)
  return f
})
console.log(`──────────────────── VERDICT ────────────────────`)
if (failures.length === 0) {
  console.log('✓ All key elements visible in all profile/mode combinations.')
} else {
  console.log(`✗ ${failures.length} cropping issue(s):`)
  failures.forEach(f => console.log(`  - ${f}`))
}
