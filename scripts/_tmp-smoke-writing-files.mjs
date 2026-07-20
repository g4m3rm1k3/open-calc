import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(60000)
const errors = []
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))

await page.goto('http://localhost:5173/#/chapter/command-line-interface-1/writing-files', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(2000)
for (let i = 0; i < 15; i++) {
  await page.mouse.wheel(0, 500)
  await page.waitForTimeout(100)
}
await page.waitForTimeout(500)

const termInput = page.locator('input.caret-white').first()
console.log('terminal input count:', await page.locator('input.caret-white').count())

async function runCmd(cmd) {
  await termInput.click({ force: true })
  await termInput.fill(cmd)
  await termInput.press('Enter')
  await page.waitForTimeout(250)
}

await runCmd('echo "hello" > notes.txt')
await runCmd('cat notes.txt')
await runCmd('echo "more" >> notes.txt')
await runCmd('cat notes.txt')
await runCmd('mkdir project')
await runCmd('touch project/readme.md')
await runCmd('ls project')

const bodyText = await page.evaluate(() => document.body.innerText)
const idx = bodyText.indexOf('notes.txt')
console.log('--- TRANSCRIPT ---')
console.log(bodyText.slice(Math.max(0, idx - 100), idx + 1000))
console.log('Errors:', errors)
await browser.close()
