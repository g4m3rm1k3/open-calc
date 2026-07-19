import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ timeout: 60000 })
page.setDefaultTimeout(60000)
const logs = []
page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`))

// Navigate to a lesson known to use PythonNotebook
await page.goto('http://localhost:5173/#/chapter/applied-statistics-7/correlation', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(4000)
const bodyText = await page.evaluate(() => document.body.innerText)
console.log('has notebook UI:', bodyText.includes('Pearson') || bodyText.includes('Run'))
console.log(logs.slice(-20).join('\n'))
await browser.close()
