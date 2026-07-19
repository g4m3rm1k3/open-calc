import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(60000)
const errors = []
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()) })

await page.goto('http://localhost:5173/#/chapter/cyber-lab-1/symmetric-encryption', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(2000)

await page.getByRole('button', { name: 'Generate key & encrypt' }).click()
await page.waitForTimeout(700)

const decryptBtn = page.getByRole('button', { name: 'Decrypt', exact: true })
console.log('decrypt button count:', await decryptBtn.count())
console.log('decrypt button disabled:', await decryptBtn.isDisabled())
await decryptBtn.click()
await page.waitForTimeout(700)

const bodyText = await page.evaluate(() => document.body.innerText)
const idx = bodyText.indexOf('Encrypt, Decrypt, Then Try to Cheat')
console.log(bodyText.slice(idx, idx + 1000))
console.log('Errors:', errors)
await browser.close()
