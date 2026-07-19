import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(60000)
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto('http://localhost:5173/#/chapter/cyber-lab-1/symmetric-encryption', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(2000)

// AESEncryptDemo: generate key & encrypt, decrypt, tamper
await page.click('text=Generate key & encrypt')
await page.waitForTimeout(500)
let bodyText = await page.evaluate(() => document.body.innerText)
console.log('Ciphertext appeared after encrypt:', /Ciphertext/.test(bodyText))

await page.click('text=Decrypt')
await page.waitForTimeout(500)
bodyText = await page.evaluate(() => document.body.innerText)
console.log('Decrypted matches original:', bodyText.includes("that's what \"symmetric\" means"))

await page.click('text=Flip 1 bit, then try to decrypt')
await page.waitForTimeout(500)
bodyText = await page.evaluate(() => document.body.innerText)
console.log('Tamper rejected message shown:', bodyText.includes('GCM\'s auth tag caught'))

// BlockCipherModeDiagram: toggle CBC
await page.click('text=CBC (chained)')
await page.waitForTimeout(300)
bodyText = await page.evaluate(() => document.body.innerText)
console.log('CBC diagram note shown:', bodyText.includes('no longer means identical C'))

// ECBPatternLeak: run real encryption
await page.click('text=Encrypt this striped image, both ways')
await page.waitForTimeout(1500)
bodyText = await page.evaluate(() => document.body.innerText)
console.log('ECB/CBC explanation shown after run:', bodyText.includes('disappears into noise'))

console.log('Errors:', errors)
await browser.close()
