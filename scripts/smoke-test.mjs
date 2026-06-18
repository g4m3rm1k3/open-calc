/**
 * Smoke test — visits key routes, collects console errors, screenshots failures.
 * Usage:  node scripts/smoke-test.mjs [base-url]
 * Default base-url: http://localhost:5173
 *
 * Exit code 0 = all clean, 1 = at least one route had real errors.
 */

import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5173'

// Routes to visit. Use hash-router format (#/...) — the app uses HashRouter.
const ROUTES = [
  '/',
  '/#/about',
  '/#/reference',
  '/#/linear-algebra',
  '/#/studio',
  '/#/health',
  '/#/rpg-workout',
  '/#/brain',
  '/#/openmat',
  '/#/chemistry',
  '/#/codelens',
  // Lesson routes — one per major course
  '/#/chapter/calculus-1/calc1-001-limits',
  '/#/chapter/python-1/py1-001-intro',
  '/#/chapter/physics-1/phys1-001-kinematics',
  '/#/chapter/linear-algebra-1/la1-001-vectors',
  '/#/chapter/ai-engineering-1/ai1-001-intro',
]

// Errors we know are noisy but not real bugs
const IGNORED = [
  /ERR_CONNECTION_REFUSED/,
  /relay failure/i,
  /WebSocket connection.*failed/,
  /Context Lost/,          // WebGL — environment-specific, not a code bug
  /No such subscription/i,
  /AbortError/,
  /net::ERR_/,
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
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15_000 })
    // Brief wait for any deferred effects
    await page.waitForTimeout(800)
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

  // Suppress unhandled page errors from being thrown (we collect them via console)
  page.on('pageerror', () => {})

  let failed = 0
  const results = []

  for (const route of ROUTES) {
    process.stdout.write(`  ${route.padEnd(55)}`)
    const errors = await visitRoute(page, route)
    if (errors.length === 0) {
      console.log('✓')
      results.push({ route, ok: true })
    } else {
      console.log(`✗  (${errors.length} error${errors.length > 1 ? 's' : ''})`)
      for (const e of errors) console.log(`     → ${e.slice(0, 120)}`)
      await page.screenshot({ path: `smoke-fail-${route.replace(/[/#]/g, '_')}.png` })
      results.push({ route, ok: false, errors })
      failed++
    }
  }

  await browser.close()

  console.log(`\n${ROUTES.length - failed}/${ROUTES.length} routes clean`)
  if (failed > 0) {
    console.log(`${failed} route(s) had errors — screenshots saved as smoke-fail-*.png`)
    process.exit(1)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
