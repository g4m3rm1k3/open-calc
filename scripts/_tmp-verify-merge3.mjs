import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:5173/#/chapter/cyber-lab-1/what-is-hashing', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(2500)
const bodyText = await page.evaluate(() => document.body.innerText)
const idx = bodyText.indexOf('Why 1')
console.log(bodyText.slice(2000, 7000))
await browser.close()
