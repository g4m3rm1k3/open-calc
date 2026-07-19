import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(60000)
const errors = []
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))

await page.goto('http://localhost:5173/#/chapter/cyber-lab-1/symmetric-encryption', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(2000)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(1000)

const buttons = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'))
  return btns.filter(b => b.innerText?.includes('Run')).map(b => ({ text: JSON.stringify(b.innerText), disabled: b.disabled }))
})
console.log(JSON.stringify(buttons, null, 2))
await browser.close()
