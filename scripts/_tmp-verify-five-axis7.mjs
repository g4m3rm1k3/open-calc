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

const calcPanel = page.locator('div.overflow-y-auto.h-full.box-border:has-text("Compound tilt needed")')
const numInputs = calcPanel.locator('input[type="number"]')
await numInputs.nth(0).fill('40')
await numInputs.nth(1).fill('-30')
await numInputs.nth(3).fill('30')
await numInputs.nth(4).fill('35')
await page.waitForTimeout(300)

// Capture "this side" outcome + screenshot showing the fixture plate under the block.
const outcomeText1 = await calcPanel.locator('text=Outcome').locator('..').innerText().catch(() => '')
const bText1 = await calcPanel.locator('div:has-text("2nd — B")').last().innerText()
console.log('Primary posture B card:', bText1)
await page.screenshot({ path: `${OUT}/5axis-fixture-primary.png` })

// Flip to opposite posture.
await page.locator('button:has-text("Opposite side (flip)")').click()
await page.waitForTimeout(300)
const bText2 = await calcPanel.locator('div:has-text("2nd — B")').last().innerText()
console.log('Alt posture B card:', bText2)
await page.screenshot({ path: `${OUT}/5axis-posture-flip.png` })

// Play the whole derivation on the flipped posture and confirm final B is now positive-ish (opposite sign region).
await page.locator('button:has-text("Play the whole derivation")').click()
await page.waitForTimeout(3500)
await page.screenshot({ path: `${OUT}/5axis-fixture-final.png` })
const bSlider = await page.locator('input[type="range"]').nth(3).inputValue()
const cSlider = await page.locator('input[type="range"]').nth(4).inputValue()
console.log('Final B/C axis slider values after playing alt posture:', bSlider, cSlider)

console.log('errors:', errors.length ? errors : 'none')
await browser.close()
