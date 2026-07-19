import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto('http://localhost:5173/#/chapter/cyber-lab-1/symmetric-encryption', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(3000)
const bodyText = await page.evaluate(() => document.body.innerText)
console.log('Title renders:', bodyText.includes('Symmetric Encryption'))
console.log('AES demo renders:', bodyText.includes('Encrypt, Decrypt, Then Try to Cheat'))
console.log('Block diagram renders:', bodyText.toUpperCase().includes('ECB (UNCHAINED)'))
console.log('ECB pattern leak renders:', bodyText.includes('Encrypt this striped image'))
console.log('Challenges render:', bodyText.includes('CHALLENGE PROBLEMS'))
console.log('Quiz renders:', bodyText.includes('UNDERSTANDING CHECK'))
console.log('Python notebook renders:', bodyText.includes('Python Lab') || bodyText.includes('Real AES-256-GCM'))
console.log('Errors:', errors.slice(0, 10))
await browser.close()
