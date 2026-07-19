import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(120000)
const errors = []
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))

await page.goto('http://localhost:5173/#/chapter/cyber-lab-1/symmetric-encryption', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(1500)
for (let i = 0; i < 20; i++) {
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(150)
}
await page.waitForTimeout(1500)

const runBtn = page.getByRole('button', { name: '▶ Run', exact: true })
await runBtn.click()
console.log('clicked, waiting up to 45s...')
await page.waitForTimeout(45000)

const bodyText = await page.evaluate(() => document.body.innerText)
const outIdx = bodyText.indexOf('Out [')
console.log('Out[] index:', outIdx)
if (outIdx >= 0) {
  console.log(bodyText.slice(outIdx, outIdx + 1500))
} else {
  console.log('No "Out [" found. Searching for key terms:')
  console.log('has ModuleNotFoundError:', bodyText.includes('ModuleNotFoundError'))
  console.log('has Rejected, as expected:', bodyText.includes('Rejected, as expected'))
  console.log('has Loading Pyodide / runtime text:', bodyText.includes('Loading') )
  const idx2 = bodyText.indexOf('await micropip')
  console.log('code text idx:', idx2)
  console.log(bodyText.slice(Math.max(0,idx2-200), idx2+1800))
}
console.log('Errors:', errors)
await browser.close()
