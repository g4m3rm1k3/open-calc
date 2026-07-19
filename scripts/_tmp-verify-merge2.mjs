import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto('http://localhost:5173/#/chapter/cyber-lab-1/what-is-hashing', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(2500)
const bodyText = await page.evaluate(() => document.body.innerText)
console.log('--- length', bodyText.length)
console.log(bodyText.includes('Challenge') ? 'HAS Challenge substring' : 'NO Challenge substring anywhere')
console.log(bodyText.slice(0, 300))
console.log('...')
console.log(bodyText.slice(-1500))
console.log('Errors:', errors.slice(0, 10))
await browser.close()
