import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = '/private/tmp/claude-501/-Users-michaelmclean-Testing-open-calc/e18d4d39-2322-491e-a16c-81ab12ee1cd6/scratchpad'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(`${BASE}/#/studio`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)

// Use the doc search box to jump straight to each file (avoids fiddly tree expansion).
const search = page.locator('input[placeholder*="Search docs"]')
await search.fill('todo_series')
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/docs-search.png` })

// Click the todo_series (v1) result first.
await page.getByText('todo_series', { exact: false }).first().click().catch(() => {})
await page.waitForTimeout(600)

async function firstEditorText() {
  // Monaco renders each line as a .view-line div; grab the first code block's editor.
  const monaco = page.locator('.md-code-monaco').first()
  return monaco.locator('.view-line').first().innerText().catch(() => '(no editor found)')
}

const textA = await firstEditorText()
console.log('Doc A (first match) first-line of first code block:', JSON.stringify(textA))
await page.screenshot({ path: `${OUT}/docs-fileA.png` })

// Now search + open the OTHER todo_series file (todo_series2).
await search.fill('todo_series2')
await page.waitForTimeout(400)
await page.getByText('todo_series2', { exact: false }).first().click().catch(() => {})
await page.waitForTimeout(600)

const textB = await firstEditorText()
console.log('Doc B (todo_series2) first-line of first code block:', JSON.stringify(textB))
await page.screenshot({ path: `${OUT}/docs-fileB.png` })

console.log('STALE BUG PRESENT (A === B):', textA === textB)
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
