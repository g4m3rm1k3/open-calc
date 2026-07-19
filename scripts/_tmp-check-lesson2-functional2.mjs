import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(60000)
await page.goto('http://localhost:5173/#/chapter/cyber-lab-1/symmetric-encryption', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(2000)

await page.click('text=Generate key & encrypt')
await page.waitForTimeout(500)
await page.click('text=Decrypt')
await page.waitForTimeout(500)

const bodyText = await page.evaluate(() => document.body.innerText)
const idx = bodyText.indexOf('Encrypt, Decrypt, Then Try to Cheat')
console.log(bodyText.slice(idx, idx + 900))
await browser.close()
