import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:5173/#/chapter/command-line-interface-1/first-commands', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(2000)
for (let i = 0; i < 15; i++) {
  await page.mouse.wheel(0, 500)
  await page.waitForTimeout(100)
}
await page.waitForTimeout(1000)
const info = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('input')).map(el => ({
    placeholder: el.placeholder,
    className: el.className,
    type: el.type,
    visible: el.offsetParent !== null,
  }))
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
