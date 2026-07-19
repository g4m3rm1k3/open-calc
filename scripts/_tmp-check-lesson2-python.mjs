import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(120000)
const errors = []
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))

await page.goto('http://localhost:5173/#/chapter/cyber-lab-1/symmetric-encryption', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(2000)

// Scroll to the Python Lab section
await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('*'))
  const el = all.find(e => e.textContent?.trim() === 'Python Lab' && e.children.length === 0)
  el?.scrollIntoView()
})
await page.waitForTimeout(1000)

let bodyText = await page.evaluate(() => document.body.innerText)
console.log('Python Lab section present:', bodyText.includes('Python Lab'))
console.log('Waiting for pyodide runtime inside this cell to be ready...')
await page.waitForFunction(() => !document.body.innerText.includes('Loading Python runtime'), { timeout: 60000 }).catch(() => console.log('(no "Loading Python runtime" text found/timed out - continuing)'))
await page.waitForTimeout(2000)

// Click Run on the first Run button inside the Python Lab area (there should be exactly one cell)
const runButtons = await page.locator('button', { hasText: 'Run' }).all()
console.log('Run-ish buttons found:', runButtons.length)

// Click the last "Run" button matching exactly (avoid "Run all")
const runBtn = page.getByRole('button', { name: 'Run', exact: true }).last()
await runBtn.click()
console.log('Clicked Run, waiting for pycryptodome install + execution (can take 10-20s)...')
await page.waitForTimeout(25000)

bodyText = await page.evaluate(() => document.body.innerText)
const idx = bodyText.indexOf('Real AES-256-GCM in Python')
console.log('--- OUTPUT AREA ---')
console.log(bodyText.slice(idx, idx + 2500))
console.log('--- ERRORS ---')
console.log(errors)
await browser.close()
