import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(90000)
const logs = []
page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`))

await page.goto('http://localhost:5173/#/notebook-lab', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(2000)
await page.click('text=New Notebook')
await page.waitForTimeout(2000)
const html = await page.content()
console.log('has CodeMirror:', html.includes('CodeMirror') || html.includes('cm-editor'))
console.log('has monaco:', html.includes('monaco'))
const bodyText = await page.evaluate(() => document.body.innerText)
console.log(bodyText.slice(0, 1500))
await browser.close()
