import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const routes = [
  { key: 'drone-lab', path: '/lab/drone-lab', hasWindow: true },
  { key: 'matrix-lab', path: '/lab/matrix-lab', hasWindow: true },
  { key: 'odds-lab', path: '/lab/odds-lab', hasWindow: true },
  { key: 'plc-lab', path: '/lab/plc-lab', hasWindow: true },
]

const browser = await chromium.launch()

for (const r of routes) {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } })
  const page = await context.newPage()
  await page.goto(`${BASE}/#${r.path}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1800)

  if (r.hasWindow) {
    // Click the green (maximize) dot in the window title bar, if present.
    const greenDot = page.locator('.bg-green-500, [class*="green-5"]').first()
    if (await greenDot.count() > 0) {
      await greenDot.click().catch(() => {})
      await page.waitForTimeout(500)
    }
  }
  await page.screenshot({ path: `/private/tmp/claude-501/-Users-michaelmclean-Testing-open-calc/e18d4d39-2322-491e-a16c-81ab12ee1cd6/scratchpad/lab2-${r.key}.png`, fullPage: false })
  console.log(`captured ${r.key}`)
  await context.close()
}

await browser.close()
