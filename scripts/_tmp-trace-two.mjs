import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const browser = await chromium.launch()

const ctxA = await browser.newContext()
const pageA = await ctxA.newPage()
pageA.on('pageerror', e => console.log('A PAGE ERROR:', e.message))
pageA.on('websocket', ws => {
  if (!/relay\.damus|nos\.lol|relay\.nostr\.place|purplerelay|relay\.snort/.test(ws.url())) return
  ws.on('framesent', f => { const p = String(f.payload); if (p.includes('"kind":1,')) console.log('A SENT kind1:', p.slice(0, 300)) })
  ws.on('framereceived', f => { const p = String(f.payload); if (p.includes('"kind":1,')) console.log('A RECV kind1:', p.slice(0, 300)) })
})

const ctxB = await browser.newContext()
const pageB = await ctxB.newPage()
pageB.on('pageerror', e => console.log('B PAGE ERROR:', e.message))
pageB.on('websocket', ws => {
  if (!/relay\.damus|nos\.lol|relay\.nostr\.place|purplerelay|relay\.snort/.test(ws.url())) return
  console.log('B relay WS open:', ws.url())
  ws.on('framesent', f => console.log('B SENT:', String(f.payload).slice(0, 200)))
  ws.on('framereceived', f => { const p = String(f.payload); if (p.includes('"kind":1,') || p.includes('EOSE')) console.log('B RECV:', p.slice(0, 300)) })
})

await Promise.all([
  pageA.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 }),
  pageB.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 }),
])
await pageA.waitForTimeout(1500)
await pageB.waitForTimeout(1500)

console.log('\n=== A: opening chat, sending message ===')
await pageA.locator('[title="Study Chat"]').click({ timeout: 5000 })
await pageA.waitForTimeout(2000)
const testMessage = `trace-${Date.now()}`
const input = pageA.locator('input[type="text"], textarea').last()
await input.fill(testMessage)
await input.press('Enter')
console.log('sent:', testMessage)

await pageA.waitForTimeout(5000)

console.log('\n=== Checking Context B DOM for badge/message (chat stays closed) ===')
const badgeAfter = await pageB.locator('[title="Study Chat"] span').first().isVisible().catch(() => false)
console.log('B badge visible:', badgeAfter)

await browser.close()
