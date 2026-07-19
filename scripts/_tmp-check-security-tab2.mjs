import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:5173/#/', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(1200)
await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('button'))
  all.find(b => b.innerText && b.innerText.includes('COMPUTER SCIENCE')).click()
})
await page.waitForTimeout(800)
await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('button'))
  all.find(b => b.innerText && b.innerText.trim() === 'Security').click()
})
await page.waitForTimeout(1000)
const bodyText = await page.evaluate(() => document.body.innerText)
const idx = bodyText.indexOf('Cyber Lab')
console.log(bodyText.slice(Math.max(0, idx - 300), idx + 500))
await browser.close()
