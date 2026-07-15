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

// Type an exact value directly into the X axis number input.
const machineAxesSection = page.locator('div:has-text("Machine Axes")').first()
const numInputs = page.locator('div.p-5 input[type="number"]')
await numInputs.nth(0).fill('63.4')
await page.waitForTimeout(200)
console.log('X value after typing 63.4:', await numInputs.nth(0).inputValue())

await numInputs.nth(3).fill('27.25')
await page.waitForTimeout(200)
console.log('B value after typing 27.25:', await numInputs.nth(3).inputValue())

await page.screenshot({ path: `${OUT}/5axis-numinput-set.png` })

// Now hit "Zero all" and confirm every axis (sliders + number inputs) resets to 0.
await page.locator('button:has-text("Zero all")').click()
await page.waitForTimeout(200)
const vals = []
for (let i = 0; i < 5; i++) vals.push(await numInputs.nth(i).inputValue())
console.log('All axis values after Zero all:', vals)
await page.screenshot({ path: `${OUT}/5axis-zeroed.png` })

console.log('errors:', errors.length ? errors : 'none')
await browser.close()
