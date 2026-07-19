import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto('http://localhost:5173/#/chapter/cyber-lab-1/symmetric-encryption', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(3000)
const bodyText = await page.evaluate(() => document.body.innerText)
const idx = bodyText.indexOf('ECB vs. CBC')
console.log('idx of "ECB vs. CBC":', idx)
console.log(bodyText.slice(Math.max(0, idx - 200), idx + 800))
console.log('--- ALL ERRORS ---')
console.log(errors)
await browser.close()
