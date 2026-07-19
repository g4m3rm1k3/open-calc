import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(90000)
const errors = []
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))

await page.goto('http://localhost:5173/#/chapter/cyber-lab-1/symmetric-encryption', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(1500)

// Scroll down gradually so any IntersectionObserver-based lazy mounting fires
for (let i = 0; i < 20; i++) {
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(150)
}
await page.waitForTimeout(1500)

const buttons = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'))
  return btns.filter(b => b.innerText?.includes('Run')).map(b => ({ text: JSON.stringify(b.innerText), disabled: b.disabled }))
})
console.log('Run buttons found:', JSON.stringify(buttons, null, 2))
const bodyText = await page.evaluate(() => document.body.innerText)
console.log('Python Lab present:', bodyText.includes('Python Lab'))
console.log('Errors:', errors)
await browser.close()
