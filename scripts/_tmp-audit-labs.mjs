import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const routes = [
  { key: 'physics', path: '/physics' },
  { key: 'drone-lab', path: '/lab/drone-lab' },
  { key: 'matrix-lab', path: '/lab/matrix-lab' },
  { key: 'odds-lab', path: '/lab/odds-lab' },
  { key: 'plc-lab', path: '/lab/plc-lab' },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })

for (const r of routes) {
  const errors = []
  const onErr = (e) => errors.push(e.message ?? e.text?.())
  page.on('pageerror', onErr)
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })

  await page.goto(`${BASE}/#${r.path}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `/private/tmp/claude-501/-Users-michaelmclean-Testing-open-calc/e18d4d39-2322-491e-a16c-81ab12ee1cd6/scratchpad/lab-${r.key}.png`, fullPage: false })
  console.log(`\n=== ${r.key} (${r.path}) ===`)
  console.log('errors:', errors.length ? errors.slice(0, 8) : 'none')

  page.removeListener('pageerror', onErr)
  page.removeAllListeners('console')
}

await browser.close()
