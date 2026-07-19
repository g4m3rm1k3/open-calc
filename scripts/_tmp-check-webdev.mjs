import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('http://localhost:5173/#/', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(1200)
await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('button'))
  all.find(b => b.innerText && b.innerText.includes('PROGRAMMING')).click()
})
await page.waitForTimeout(800)
await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('button'))
  const btn = all.find(b => b.innerText && b.innerText.trim() === 'Web Development')
  if (btn) btn.click()
})
await page.waitForTimeout(1000)
const bodyText = await page.evaluate(() => document.body.innerText)
console.log('mentions Cyber Lab under Programming/Web Dev:', bodyText.includes('Cyber Lab'))
console.log('Errors:', errors)
await browser.close()
