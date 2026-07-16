import { chromium } from 'playwright'
import path from 'path'

const BASE = 'http://localhost:5173'
const OUT = '/private/tmp/claude-501/-Users-michaelmclean-Testing-open-calc/e18d4d39-2322-491e-a16c-81ab12ee1cd6/scratchpad'
const CSV_PATH = path.resolve('scripts/_tmp-test-data.csv')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto(`${BASE}/#/notebook-lab`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)

await page.locator('button:has-text("New Notebook")').first().click()
await page.waitForTimeout(500)

// Wait for Pyodide to finish loading (loading screen text disappears).
await page.waitForSelector('text=Loading Python runtime', { state: 'detached', timeout: 60000 }).catch(() => {})
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/notebook-loaded.png` })

// Upload the CSV via the hidden file input.
await page.locator('input[type="file"][accept*=".csv"]').setInputFiles(CSV_PATH)
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/notebook-uploaded.png` })

// Click the "insert load code" chip.
await page.locator('button:has-text("_tmp-test-data.csv")').click()
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/notebook-cell-inserted.png` })

// Run all cells.
await page.locator('button:has-text("Run all")').click()
await page.waitForTimeout(5000)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(200)
await page.screenshot({ path: `${OUT}/notebook-ran.png`, fullPage: true })

const bodyText = await page.locator('body').innerText()
console.log('Contains Alice:', bodyText.includes('Alice'))
console.log('Contains score column header render (score):', bodyText.includes('score'))
console.log('Contains Error:', bodyText.includes('Error'))
const idx = bodyText.indexOf('read_csv')
console.log('Context around read_csv:', bodyText.slice(idx, idx + 600))

console.log('errors:', errors.length ? errors.slice(0, 10) : 'none')
await browser.close()
