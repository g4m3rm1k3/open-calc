import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
page.on('pageerror', e => console.log('PAGE ERROR:', e.message))
page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()) })

await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(2000)

const buttons = await page.locator('button').all()
console.log('Total buttons found:', buttons.length)
for (const b of buttons) {
  const title = await b.getAttribute('title')
  if (title) console.log(' -', title)
}

await browser.close()
