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

await page.locator('button:has-text("Calculator")').click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: 'calc', exact: true }).click()
await page.waitForTimeout(300)

// Move origin off-center so the primitive isn't occluded by the spindle assembly.
const calcPanel = page.locator('div.overflow-y-auto.h-full.box-border:has-text("Compound tilt needed")')
const numInputs = calcPanel.locator('input[type="number"]')
await numInputs.nth(0).fill('40')
await numInputs.nth(1).fill('-30')
await page.waitForTimeout(300)

// Reset construction to 0 (start of derivation) by re-entering the angles (triggers useEffect reset).
await numInputs.nth(3).fill('30')
await numInputs.nth(4).fill('35')
await page.waitForTimeout(300)

const canvas = page.locator('canvas')
const before = await canvas.screenshot()
await page.screenshot({ path: `${OUT}/5axis-step-before.png` })

const step2Btn = page.locator('button:has-text("Play this rotation")').nth(0)
await step2Btn.click()
await page.waitForTimeout(300)
const mid = await canvas.screenshot()
await page.screenshot({ path: `${OUT}/5axis-step-mid.png` })
await page.waitForTimeout(700)
const after = await canvas.screenshot()
await page.screenshot({ path: `${OUT}/5axis-step-after.png` })

console.log('pixels changed before->mid:', Buffer.compare(before, mid) !== 0)
console.log('pixels changed mid->after:', Buffer.compare(mid, after) !== 0)
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
