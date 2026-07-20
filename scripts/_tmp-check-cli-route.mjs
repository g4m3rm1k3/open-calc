import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:5173/#/chapter/command-line-interface-1/first-commands', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(2500)
console.log('URL:', page.url())
const bodyText = await page.evaluate(() => document.body.innerText)
console.log(bodyText.slice(0, 1500))
await browser.close()
