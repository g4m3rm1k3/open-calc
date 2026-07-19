import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(120000)
await page.goto('http://localhost:5173/#/notebook-lab', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(2000)
await page.click('text=New Notebook')
await page.waitForFunction(() => !document.body.innerText.includes('Loading Python runtime'), { timeout: 60000 })
await page.waitForTimeout(1500)

await page.locator('.monaco-editor .view-lines').first().click()
await page.keyboard.press('Control+a')
await page.keyboard.press('Delete')
await page.waitForTimeout(200)
let cur = await page.evaluate(() => document.querySelector('.monaco-editor .view-lines')?.innerText)
console.log('after clear:', JSON.stringify(cur))

const code = `import micropip
await micropip.install("pycryptodome")
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
key = get_random_bytes(16)
cipher = AES.new(key, AES.MODE_ECB)
data = b"YELLOW SUBMARINE"
ct = cipher.encrypt(data)
print("ciphertext:", ct.hex())
print("OK - pycryptodome AES works in pyodide")`
await page.keyboard.insertText(code)
await page.waitForTimeout(200)
cur = await page.evaluate(() => document.querySelector('.monaco-editor .view-lines')?.innerText)
console.log('after insert:', JSON.stringify(cur))

await page.keyboard.press('Shift+Enter')
await page.waitForTimeout(20000)
const bodyText = await page.evaluate(() => document.body.innerText)
console.log('--- OUTPUT ---')
const idx = bodyText.indexOf('Out [')
console.log(bodyText.slice(idx, idx + 800))
await browser.close()
