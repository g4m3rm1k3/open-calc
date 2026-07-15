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

// Test 1: X slider should now move the rendered spindle.
const canvas = page.locator('canvas')
const before = await canvas.screenshot()
const xSlider = page.locator('input[type="range"]').nth(0) // X is first in Machine Axes list
await xSlider.evaluate((el) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(el, '80')
  el.dispatchEvent(new Event('input', { bubbles: true }))
})
await page.waitForTimeout(300)
const after = await canvas.screenshot()
console.log('Canvas pixels changed after moving X slider:', Buffer.compare(before, after) !== 0)
await page.screenshot({ path: `${OUT}/5axis-x-moved.png` })

// Test 2: resizable panels — drag the left divider.
const dividers = page.locator('div.cursor-col-resize')
const box = await dividers.first().boundingBox()
await page.mouse.move(box.x + 1, box.y + box.height / 2)
await page.mouse.down()
await page.mouse.move(box.x + 120, box.y + box.height / 2, { steps: 8 })
await page.mouse.up()
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/5axis-resized.png` })

// Test 3: Calculator "align" animation.
await page.locator('button:has-text("Calculator")').click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: 'calc', exact: true }).click()
await page.waitForTimeout(300)
const calcPanel = page.locator('div.overflow-y-auto.h-full.box-border:has-text("Target normal")')
const numInputs = calcPanel.locator('input[type="number"]')
await numInputs.nth(0).fill('1')
await numInputs.nth(1).fill('0.3')
await numInputs.nth(2).fill('0.5')
await page.waitForTimeout(200)
await page.locator('button:has-text("Rotate table to align")').click()
await page.waitForTimeout(150)
await page.screenshot({ path: `${OUT}/5axis-aligning-mid.png` })
await page.waitForTimeout(800)
await page.screenshot({ path: `${OUT}/5axis-aligning-done.png` })

console.log('errors:', errors.length ? errors : 'none')
await browser.close()
