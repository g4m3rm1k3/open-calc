import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = '/private/tmp/claude-501/-Users-michaelmclean-Testing-open-calc/e18d4d39-2322-491e-a16c-81ab12ee1cd6/scratchpad'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('chorus.almostmachines') && !m.text().includes('relay.damus')) errors.push(m.text()) })

await page.goto(`${BASE}/#/five-axis`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2000)

// X/Y/Z motion check
const canvas = page.locator('canvas')
const before = await canvas.screenshot()
const xSlider = page.locator('input[type="range"]').nth(0)
await xSlider.evaluate((el) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(el, '80')
  el.dispatchEvent(new Event('input', { bubbles: true }))
})
await page.waitForTimeout(300)
const after = await canvas.screenshot()
console.log('X slider moves rendered spindle:', Buffer.compare(before, after) !== 0)

// Resizable panels check
const dividers = page.locator('div.cursor-col-resize')
console.log('Number of resize dividers found:', await dividers.count())
const box = await dividers.first().boundingBox()
await page.mouse.move(box.x + 1, box.y + box.height / 2)
await page.mouse.down()
await page.mouse.move(box.x + 100, box.y + box.height / 2, { steps: 8 })
await page.mouse.up()
await page.waitForTimeout(300)

// Open Calculator
await page.locator('button:has-text("Calculator")').click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: 'calc', exact: true }).click()
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/5axis-new-calc.png` })

// Set origin + angles
const calcPanel = page.locator('div.overflow-y-auto.h-full.box-border:has-text("Compound tilt needed")')
const numInputs = calcPanel.locator('input[type="number"]')
// origin X,Y,Z (0,1,2), then angleX, angleY (3,4)
await numInputs.nth(3).fill('30')
await numInputs.nth(4).fill('35')
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/5axis-new-calc-filled.png` })

const text = await calcPanel.innerText()
const bMatch = text.match(/Solve B = ([\-\d.]+)/)
const cMatch = text.match(/Solve C = ([\-\d.]+)/)
console.log('Computed B:', bMatch?.[1], 'C:', cMatch?.[1])

// Play step 1 (construction)
await page.locator('button:has-text("Play this rotation")').first().click()
await page.waitForTimeout(900)
await page.screenshot({ path: `${OUT}/5axis-step1-played.png` })

// Dismiss the Delta onboarding popup, which otherwise intercepts clicks.
const skipBtn = page.locator('button:has-text("Skip")')
if (await skipBtn.count() > 0) await skipBtn.click()
await page.waitForTimeout(200)

// Play the whole derivation
await page.locator('button:has-text("Play the whole derivation")').click()
await page.waitForTimeout(3500)
await page.screenshot({ path: `${OUT}/5axis-full-derivation-done.png` })

const finalText = await calcPanel.innerText()
console.log('IK Solution panel after full play:', (await page.locator('div:has-text("IK SOLUTION")').first().innerText()).slice(0, 30))
const bSlider = await page.locator('input[type="range"]').nth(3).inputValue()
const cSlider = await page.locator('input[type="range"]').nth(4).inputValue()
console.log('Final B slider value:', bSlider, '(expect ~', bMatch?.[1], ') Final C slider value:', cSlider, '(expect ~', cMatch?.[1], ')')

console.log('errors:', errors.length ? errors : 'none')
await browser.close()
