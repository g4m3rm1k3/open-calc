import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(120000)
page.on('console', m => console.log('[console]', m.text()))
await page.goto('http://localhost:5173/#/notebook-lab', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(2000)
await page.click('text=New Notebook')
await page.waitForFunction(() => !document.body.innerText.includes('Loading Python runtime'), { timeout: 60000 })
await page.waitForTimeout(1000)

const code = `import micropip
await micropip.install("pycryptodome")
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
key = get_random_bytes(16)
cipher = AES.new(key, AES.MODE_ECB)
data = b"YELLOW SUBMARINE"
ct = cipher.encrypt(data)
print("ciphertext:", ct.hex())
print("OK - pycryptodome AES works in pyodide")
`
await page.locator('textarea').first().click()
await page.locator('textarea').first().fill(code)
await page.waitForTimeout(300)
await page.keyboard.press('Shift+Enter')
await page.waitForTimeout(15000)
const bodyText = await page.evaluate(() => document.body.innerText)
console.log('--- BODY AFTER RUN ---')
console.log(bodyText.slice(bodyText.indexOf('Python Notebook')))
await browser.close()
