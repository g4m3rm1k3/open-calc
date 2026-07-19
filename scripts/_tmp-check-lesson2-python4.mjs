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
console.log('found run button count:', await runBtn.count())
await runBtn.click()
console.log('clicked, waiting up to 40s for micropip install + pycryptodome execution...')
await page.waitForTimeout(40000)

const bodyText = await page.evaluate(() => document.body.innerText)
const idx = bodyText.search(/Real AES-256-GCM|Ciphertext:|ModuleNotFoundError|Rejected, as expected/)
console.log('--- relevant output ---')
console.log(bodyText.slice(Math.max(0, idx - 100), idx + 1500))
console.log('Errors:', errors)
await browser.close()
