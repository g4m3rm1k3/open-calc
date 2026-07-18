import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
page.on('pageerror', e => console.log('PAGE ERROR:', e.message))
page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()) })
page.on('websocket', ws => {
  console.log('WS OPEN:', ws.url())
  ws.on('framesent', f => console.log('WS SENT:', String(f.payload).slice(0, 200)))
  ws.on('framereceived', f => console.log('WS RECV:', String(f.payload).slice(0, 200)))
})

await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(1500)

console.log('\n=== Opening chat ===')
await page.locator('[title="Study Chat"]').click({ timeout: 5000 })
await page.waitForTimeout(2500)

console.log('\n=== Inspecting chat panel DOM ===')
const inputs = await page.locator('input[type="text"], textarea').all()
console.log('Text inputs/textareas found:', inputs.length)
for (const i of inputs) {
  const ph = await i.getAttribute('placeholder')
  console.log(' - placeholder:', ph)
}

const testMessage = `hello-${Date.now()}`
console.log('\n=== Sending message:', testMessage, '===')
const input = page.locator('input[placeholder*="Lovelace" i]')
await input.fill(testMessage)
await input.press('Enter')
await page.waitForTimeout(2000)

const visible = await page.locator(`text=${testMessage}`).first().isVisible().catch(() => false)
console.log('Message visible in own window after send:', visible)

await browser.close()
