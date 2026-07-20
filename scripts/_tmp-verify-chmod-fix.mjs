import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(60000)
const errors = []
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))

await page.goto('http://localhost:5173/#/chapter/command-line-interface-1/first-commands', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForTimeout(2000)
for (let i = 0; i < 15; i++) {
  await page.mouse.wheel(0, 500)
  await page.waitForTimeout(100)
}
await page.waitForTimeout(500)

const termInput = page.locator('input.caret-white')
console.log('terminal input count:', await termInput.count())

async function runCmd(cmd) {
  await termInput.click({ force: true })
  await termInput.fill(cmd)
  await termInput.press('Enter')
  await page.waitForTimeout(300)
}

await runCmd('echo "secret data" > secret.txt')
await runCmd('ls -l secret.txt')
await runCmd('chmod 600 secret.txt')
await runCmd('ls -l secret.txt')
await runCmd('cat secret.txt')
await runCmd('chmod 000 secret.txt')
await runCmd('cat secret.txt')
await runCmd('chmod 644 secret.txt')
await runCmd('cat secret.txt')
await runCmd('echo "int main(){}" > a.cpp')
await runCmd('g++ a.cpp -o a.out')
await runCmd('./a.out')
await runCmd('chmod -x a.out')
await runCmd('./a.out')

const bodyText = await page.evaluate(() => document.body.innerText)
const idx = bodyText.indexOf('secret.txt')
console.log('--- TERMINAL TRANSCRIPT ---')
console.log(bodyText.slice(Math.max(0, idx - 200), idx + 1800))
console.log('Errors:', errors)
await browser.close()
