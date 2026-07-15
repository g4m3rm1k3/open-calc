import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = '/private/tmp/claude-501/-Users-michaelmclean-Testing-open-calc/e18d4d39-2322-491e-a16c-81ab12ee1cd6/scratchpad'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(`${BASE}/#/five-axis`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)
const skipBtn = page.locator('button:has-text("Skip")')
if (await skipBtn.count() > 0) await skipBtn.click()
await page.waitForTimeout(200)

// Enable Calculator (workpiece) mode.
await page.locator('button:has-text("Calculator")').click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: 'calc', exact: true }).click()
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/5axis-toggle-calc-on.png` })

// Now click "Bell" — should hide the workpiece and show the Bell toolpath shape.
await page.locator('button:has-text("Bell")').click()
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/5axis-toggle-bell.png` })

// Click "Cam" — should show Cam.
await page.locator('button:has-text("Cam")').click()
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/5axis-toggle-cam.png` })

// Confirm the "Calculator" toggle pill itself is now visually inactive.
const calcPill = page.locator('div.flex.gap-1\\.5 button:has-text("Calculator")')
console.log('Calculator pill class after switching to Cam:', await calcPill.getAttribute('style'))

console.log('errors:', errors.length ? errors : 'none')
await browser.close()
