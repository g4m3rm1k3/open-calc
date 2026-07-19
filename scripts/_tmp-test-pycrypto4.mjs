import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(120000)
await page.goto('http://localhost:5173/#/notebook-lab', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(2000)
await page.click('text=New Notebook')
await page.waitForFunction(() => !document.body.innerText.includes('Loading Python runtime'), { timeout: 60000 })
await page.waitForTimeout(2000)
const info = await page.evaluate(() => {
  const textareas = document.querySelectorAll('textarea')
  const editables = document.querySelectorAll('[contenteditable="true"]')
  const cmContent = document.querySelectorAll('.cm-content')
  return { textareas: textareas.length, editables: editables.length, cmContent: cmContent.length }
})
console.log(info)
await browser.close()
