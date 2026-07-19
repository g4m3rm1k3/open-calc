import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:5173/#/chapter/cyber-lab-1/what-is-hashing', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(2500)
const bodyText = await page.evaluate(() => document.body.innerText)
console.log(bodyText.slice(7000, 12000))
await browser.close()
