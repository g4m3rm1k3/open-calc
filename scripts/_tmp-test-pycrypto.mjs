import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(90000)
const logs = []
page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`))

await page.goto('http://localhost:5173/#/notebook-lab', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(5000)
const bodyText = await page.evaluate(() => document.body.innerText)
console.log('page loaded, length', bodyText.length)
console.log(bodyText.slice(0, 1000))
await browser.close()
