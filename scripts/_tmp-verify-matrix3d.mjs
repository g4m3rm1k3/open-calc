import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = '/private/tmp/claude-501/-Users-michaelmclean-Testing-open-calc/e18d4d39-2322-491e-a16c-81ab12ee1cd6/scratchpad'

const browser = await chromium.launch()

async function run(theme) {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('chorus.almostmachines') && !m.text().includes('relay.damus')) errors.push(m.text()) })

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)

  if (theme === 'light') {
    // Force light mode via the app's own theme toggle if present, else set localStorage directly.
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('oc-theme', 'light')
    })
  }

  await page.goto(`${BASE}/#/lab/matrix-3d-lab`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)

  await page.screenshot({ path: `${OUT}/m3d-${theme}-default.png` })

  // Functional check: read a slider's live value display before/after dragging,
  // and confirm the matrix readout updates.
  const beforeText = await page.locator('body').innerText()

  await page.locator('button[title="Maximize"]').click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/m3d-${theme}-maximized.png` })

  const monacoLikeWidth = await page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    return canvas ? { w: canvas.width, h: canvas.height, cssW: canvas.clientWidth, cssH: canvas.clientHeight } : null
  })

  console.log(`[${theme}] canvas size after maximize:`, monacoLikeWidth)
  console.log(`[${theme}] errors:`, errors.length ? errors : 'none')

  await context.close()
}

await run('dark')
await run('light')

await browser.close()
