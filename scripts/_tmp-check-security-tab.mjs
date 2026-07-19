import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:5173/#/', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(1200)
await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('button'))
  const btn = all.find(b => b.innerText && b.innerText.includes('COMPUTER SCIENCE'))
  btn.click()
})
await page.waitForTimeout(800)
const subtopics = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('button'))
  return all.filter(b => b.innerText && /^Security$|^Security\b/.test(b.innerText.trim())).map(b => b.innerText)
})
console.log('security buttons found:', subtopics)
const clicked = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('button'))
  const btn = all.find(b => b.innerText && b.innerText.trim() === 'Security')
  if (btn) { btn.click(); return true }
  return false
})
console.log('clicked security subtopic:', clicked)
await page.waitForTimeout(1000)
const bodyText = await page.evaluate(() => document.body.innerText)
console.log('mentions Cyber Lab:', bodyText.includes('Cyber Lab'))
console.log(bodyText.slice(1200, 3500))
await browser.close()
