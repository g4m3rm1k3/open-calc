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
await search.fill('todo_series')
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/docs-search-results.png` })

// Print all visible text matches for "todo_series" to see the actual result labels.
const matches = await page.getByText(/todo_series/i).allTextContents()
console.log('Matches for todo_series:', matches)

await browser.close()
