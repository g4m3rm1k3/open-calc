import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(120000)
await page.goto('http://localhost:5173/#/notebook-lab', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(2000)
await page.click('text=New Notebook')
await page.waitForFunction(() => !document.body.innerText.includes('Loading Python runtime'), { timeout: 60000 })
await page.waitForTimeout(1500)

const count = await page.locator('.monaco-editor').count()
console.log('monaco-editor count:', count)
const initialText = await page.evaluate(() => {
  const els = document.querySelectorAll('.monaco-editor .view-lines')
  return Array.from(els).map(e => e.innerText)
})
console.log('initial view-lines text:', JSON.stringify(initialText))
await browser.close()
