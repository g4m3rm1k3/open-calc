import { chromium } from 'playwright'
import path from 'path'

const BASE = 'http://localhost:5173'
const OUT = '/private/tmp/claude-501/-Users-michaelmclean-Testing-open-calc/e18d4d39-2322-491e-a16c-81ab12ee1cd6/scratchpad'
const XLSX_PATH = path.resolve('scripts/_tmp-test-data.xlsx')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(`${BASE}/#/notebook-lab`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)
await page.locator('button:has-text("New Notebook")').first().click()
await page.waitForTimeout(500)
await page.waitForSelector('text=Loading Python runtime', { state: 'detached', timeout: 60000 }).catch(() => {})
await page.waitForTimeout(500)

await page.locator('input[type="file"][accept*=".csv"]').setInputFiles(XLSX_PATH)
await page.waitForTimeout(1500) // openpyxl loadPackage takes a moment
await page.screenshot({ path: `${OUT}/notebook-xlsx-uploaded.png` })

await page.locator('button:has-text("_tmp-test-data.xlsx")').click()
await page.waitForTimeout(300)
await page.locator('button:has-text("Run all")').click()
await page.waitForTimeout(6000)

const text = await page.locator('body').innerText()
console.log('Contains Dave:', text.includes('Dave'))
console.log('Contains Eve:', text.includes('Eve'))
const idx = text.indexOf('read_excel')
console.log(text.slice(idx, idx + 400))
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
