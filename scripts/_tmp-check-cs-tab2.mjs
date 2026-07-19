import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:5173/#/', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(1200)
const info = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('button'))
  const matches = all.filter(b => b.innerText && b.innerText.includes('COMPUTER SCIENCE'))
  return matches.map(m => ({ tag: m.tagName, text: m.innerText.slice(0,50), cls: m.className }))
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
