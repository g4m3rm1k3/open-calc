import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('http://localhost:5173/#/', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(1200)
// find and click the COMPUTER SCIENCE tab button
const clicked = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('button, a, div'))
  const target = els.find(el => el.textContent.trim() === 'COMPUTER SCIENCE' && el.children.length === 0 || el.textContent === 'COMPUTER SCIENCE')
  // fallback: find any element whose direct text includes it and is clickable-ish
  const candidates = els.filter(el => el.innerText && el.innerText.trim() === 'COMPUTER SCIENCE')
  if (candidates.length) { candidates[0].click(); return true }
  return false
})
console.log('clicked COMPUTER SCIENCE tab:', clicked)
await page.waitForTimeout(1000)
const bodyText = await page.evaluate(() => document.body.innerText)
console.log('mentions Security:', bodyText.includes('Security'))
console.log('mentions Cyber Lab:', bodyText.includes('Cyber Lab'))
console.log(bodyText.slice(0, 2500))
console.log('Errors:', errors)
await browser.close()
