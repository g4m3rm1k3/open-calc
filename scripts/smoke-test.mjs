/**
 * Smoke test — visits all lab, game, and lesson routes, collects console errors.
 * Usage:  node scripts/smoke-test.mjs [base-url]
 * Default base-url: http://localhost:5173
 *
 * Exit code 0 = all clean, 1 = at least one route had real errors.
 */

import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5173'

const ROUTES = [
  // ── Static pages ──────────────────────────────────────────────────────────
  '/',
  '/#/about',
  '/#/reference',
  '/#/linear-algebra',
  '/#/studio',

  // ── Hardcoded lab/feature routes ──────────────────────────────────────────
  '/#/health',
  '/#/rpg-workout',
  '/#/brain',
  '/#/openmat',
  '/#/cnc-sim',
  '/#/logic-sim',
  '/#/chemistry',
  '/#/physics',
  '/#/cad-pro',
  '/#/universal-calc',
  '/#/five-axis',
  '/#/codelens',
  '/#/web-learn/css-mastery',
  '/#/web-learn/react-mastery',
  '/#/learn/sicp',
  '/#/learn/dsa-patterns',

  // ── Labs via /lab/:key ─────────────────────────────────────────────────────
  '/#/lab/music-lab',
  '/#/lab/html-lab',
  '/#/lab/sim-lab',
  '/#/lab/drone-lab',
  '/#/lab/robot-arm-sim',
  '/#/lab/matrix-lab',
  '/#/lab/matrix-3d-lab',
  '/#/lab/decomp-lab',
  '/#/lab/cmm-lab',
  '/#/lab/odds-lab',
  '/#/lab/plc-lab',
  '/#/lab/dsa-arrays-lab',
  '/#/lab/dsa-linked-lists-lab',

  // ── Games via /game/:key ───────────────────────────────────────────────────
  '/#/game/rubiks-cube',
  '/#/game/matrix-game',
  '/#/game/stem-tetris',
  '/#/game/card-quest',
  '/#/game/card-academy',
  '/#/game/asteroids-la',
  '/#/game/vector-command',
  '/#/game/arkanoid',
  '/#/game/stem-quest',
  '/#/game/open-craft',
  '/#/game/reality-runner',
  '/#/game/basketball',
  '/#/game/pool',
  '/#/game/golf',
  '/#/game/football',

  // ── Lessons — first lesson from every course ──────────────────────────────
  '/#/chapter/calculus-1/00-rosetta-stone',
  '/#/chapter/calculus-2/00a-one-sided-limits',
  '/#/chapter/python-1/lesson0-1',
  '/#/chapter/physics-1/p0-001-what-is-physics',
  '/#/chapter/linear-algebra-1/la1-001-vectors',
  '/#/chapter/ai-engineering-1/ae0-01-dev-environment',
  '/#/chapter/javascript-1/lesson0-0',
  '/#/chapter/web-1/w1-001-what-is-a-web-page',
  '/#/chapter/data-structures-and-algorithms-1/dsa0-001-execution-model',
  '/#/chapter/c-plus-plus-1/cpp0-001-hello-world',
  '/#/chapter/discrete-math-1/00-logic-puzzles',
  '/#/chapter/precalculus-1/01-graphs-foundations',
  '/#/chapter/geometry-1/intro-geometry',
  '/#/chapter/design-1/lesson1-1',
  '/#/chapter/digital-fundamentals-1/lesson1-0',
  '/#/chapter/canvas-1/lesson1',
  '/#/chapter/cnc-1/00-what-is-cnc',
  '/#/chapter/three-js-1/lesson0-0',
  '/#/chapter/sql-1/sql0-007-what-is-data',
  '/#/chapter/nosql-1/nosql1-001-why-nosql',
  '/#/chapter/command-line-interface-1/cli0-001-what-is-the-terminal',
  '/#/chapter/git-1/git0-001-why-version-control',
  '/#/chapter/simulation-1/sim1-001-how-the-lab-works',
  '/#/chapter/electronics-1/elec0-001-voltage-current-resistance',
  '/#/chapter/programmable-logic-controllers-1/plc0-001-what-is-a-plc',
  '/#/chapter/gcode-parser-1/01-coordinate-frames',
  '/#/chapter/dynamic-programming-1/dp1-001-what-is-dp',
  '/#/chapter/applied-statistics-1/stat1-001-what-is-statistics',
  '/#/chapter/data-science-1/A01_WhatIsAProgram',
  '/#/chapter/logic-1/logic0-001-boolean-algebra',
  '/#/chapter/tetris-1/lesson1',
]

// Errors we know are noisy but not real bugs
const IGNORED = [
  /ERR_CONNECTION_REFUSED/,
  /relay failure/i,
  /WebSocket connection.*failed/,
  /Context Lost/,          // WebGL — environment-specific
  /No such subscription/i,
  /AbortError/,
  /net::ERR_/,
  /favicon/i,
  /Failed to fetch dynamically imported module/,  // lazy-load flake under test
]

function isIgnored(msg) {
  return IGNORED.some(re => re.test(msg))
}

async function visitRoute(page, route) {
  const errors = []
  const handler = (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!isIgnored(text)) errors.push(text)
    }
  }
  page.on('console', handler)

  const url = BASE + route
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20_000 })
    await page.waitForTimeout(1000)
  } catch (e) {
    errors.push(`Navigation failed: ${e.message}`)
  }

  page.off('console', handler)
  return errors
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()
  page.on('pageerror', () => {})

  let failed = 0
  const results = []

  console.log(`Testing ${ROUTES.length} routes against ${BASE}\n`)

  for (const route of ROUTES) {
    process.stdout.write(`  ${route.padEnd(65)}`)
    const errors = await visitRoute(page, route)
    if (errors.length === 0) {
      console.log('✓')
      results.push({ route, ok: true })
    } else {
      console.log(`✗  (${errors.length} error${errors.length > 1 ? 's' : ''})`)
      for (const e of errors) console.log(`     → ${e.slice(0, 140)}`)
      await page.screenshot({ path: `smoke-fail-${route.replace(/[/#]/g, '_').replace(/\//g, '-')}.png` })
      results.push({ route, ok: false, errors })
      failed++
    }
  }

  await browser.close()

  console.log(`\n${ROUTES.length - failed}/${ROUTES.length} routes clean`)
  if (failed > 0) {
    console.log(`\nFailed routes:`)
    for (const r of results.filter(r => !r.ok)) {
      console.log(`  ${r.route}`)
      for (const e of r.errors) console.log(`    → ${e.slice(0, 140)}`)
    }
    console.log(`\nScreenshots saved as smoke-fail-*.png`)
    process.exit(1)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
