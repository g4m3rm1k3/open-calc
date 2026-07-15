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

const skipBtn = page.locator('button:has-text("Skip")')
if (await skipBtn.count() > 0) await skipBtn.click()
await page.waitForTimeout(200)

await page.locator('button:has-text("Calculator")').click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: 'calc', exact: true }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/5axis-primitive-default.png` })

const calcPanel = page.locator('div.overflow-y-auto.h-full.box-border:has-text("Compound tilt needed")')
const numInputs = calcPanel.locator('input[type="number"]')
await numInputs.nth(3).fill('30')
await numInputs.nth(4).fill('35')
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/5axis-primitive-tilted.png` })

// Switch to Block primitive
await page.locator('button:has-text("Block")').click()
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/5axis-primitive-block.png` })

// Move origin
await numInputs.nth(0).fill('40')
await numInputs.nth(1).fill('-20')
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/5axis-primitive-moved.png` })

// Play the whole derivation and check final state
await page.locator('button:has-text("Play the whole derivation")').click()
await page.waitForTimeout(3500)
await page.screenshot({ path: `${OUT}/5axis-primitive-final.png` })

console.log('errors:', errors.length ? errors : 'none')
await browser.close()
