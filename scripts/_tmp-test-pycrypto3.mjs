import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(120000)
const logs = []
page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`))

await page.goto('http://localhost:5173/#/notebook-lab', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(2000)
await page.click('text=New Notebook')
await page.waitForTimeout(2000)
// Wait for pyodide runtime to finish loading
await page.waitForFunction(() => !document.body.innerText.includes('Loading Python runtime'), { timeout: 60000 })
console.log('pyodide ready')
const bodyText = await page.evaluate(() => document.body.innerText)
console.log(bodyText.slice(0, 2000))
await browser.close()
