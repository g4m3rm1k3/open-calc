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
await page.screenshot({ path: `${OUT}/5axis-default.png` })

// Confirm B (not A) labeling shows up, and toolpath playback still works.
const bodyText1 = await page.locator('body').innerText()
console.log('Shows "B & C on table" header:', /b\s*&\s*c\s*on\s*table/i.test(bodyText1))
console.log('Shows B axis slider label (not A):', /\bB\b[\s\S]{0,20}°/.test(bodyText1))

await page.locator('button:has-text("▶ Play")').click()
await page.waitForTimeout(1500)
const bodyText2 = await page.locator('body').innerText()
console.log('Toolpath advanced (text changed after Play):', bodyText1 !== bodyText2)
await page.screenshot({ path: `${OUT}/5axis-playing.png` })

// Open Calculator panel (toggle it on in the header, then switch the tab to it)
await page.locator('button:has-text("Calculator")').click()
await page.waitForTimeout(300)
await page.getByRole('button', { name: 'calc', exact: true }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/5axis-calculator.png` })

// Fill in a target normal and read B/C — scope to the Calculator panel
// specifically (the left "IK Solution" panel also shows a B/C pair for the
// scrubbed toolpath position, so a page-wide text search is ambiguous).
const calcPanel = page.locator('div.overflow-y-auto.h-full.box-border:has-text("Target normal")')
const numInputs = calcPanel.locator('input[type="number"]')
await numInputs.nth(0).fill('0')   // nx
await numInputs.nth(1).fill('0')   // ny
await numInputs.nth(2).fill('1')   // nz
await page.waitForTimeout(300)
let calcText = await calcPanel.innerText()
let bMatch = calcText.match(/B\n([\-\d.]+)°/)
let cMatch = calcText.match(/C\n([\-\d.]+)°/)
console.log('For normal [0,0,1] -> B,C:', bMatch?.[1], cMatch?.[1], '(expect both ~0)')

await numInputs.nth(0).fill('1')
await numInputs.nth(1).fill('0')
await numInputs.nth(2).fill('0')
await page.waitForTimeout(300)
calcText = await calcPanel.innerText()
bMatch = calcText.match(/B\n([\-\d.]+)°/)
cMatch = calcText.match(/C\n([\-\d.]+)°/)
console.log('For normal [1,0,0] -> B,C:', bMatch?.[1], cMatch?.[1], '(expect B~-90, C~0)')
await page.screenshot({ path: `${OUT}/5axis-calculator-filled.png` })

// Switch to Verify (forward) mode
await page.locator('button:has-text("Verify (B/C")').click()
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/5axis-verify.png` })

console.log('errors:', errors.length ? errors : 'none')
await browser.close()
