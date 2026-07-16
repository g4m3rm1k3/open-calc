import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = '/private/tmp/claude-501/-Users-michaelmclean-Testing-open-calc/e18d4d39-2322-491e-a16c-81ab12ee1cd6/scratchpad'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(`${BASE}/#/studio`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)

const search = page.locator('input[placeholder*="Search docs"]')

async function openDocAndReadFirstCodeLine(label) {
  await search.fill(label)
  await page.waitForTimeout(400)
  await page.getByText(label, { exact: true }).first().click()
  await page.waitForTimeout(600)
  const monaco = page.locator('.md-code-monaco').first()
  const text = await monaco.locator('.view-line').first().innerText().catch(() => '(no editor found)')
  return text
}

const textA = await openDocAndReadFirstCodeLine('Todo Series')
console.log('Todo Series -> first code line:', JSON.stringify(textA))
await page.screenshot({ path: `${OUT}/docs-fileA-v2.png` })

const textB = await openDocAndReadFirstCodeLine('Todo Series2')
console.log('Todo Series2 -> first code line:', JSON.stringify(textB))
await page.screenshot({ path: `${OUT}/docs-fileB-v2.png` })

// Go back to Todo Series to confirm it still shows ITS OWN code (round trip).
const textA2 = await openDocAndReadFirstCodeLine('Todo Series')
console.log('Todo Series (2nd visit) -> first code line:', JSON.stringify(textA2))

console.log('STALE BUG (B shows A\'s code):', textB === textA)
console.log('ROUND TRIP OK (A still shows its own code after visiting B):', textA2 === textA)
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
