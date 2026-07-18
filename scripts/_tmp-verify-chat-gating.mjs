import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'

const browser = await chromium.launch()
const page = await browser.newPage()

// Detect actual navigator.gpu.requestAdapter() calls (getGpuScore) — this is a
// browser API call, not a network request, so intercept it directly.
await page.addInitScript(() => {
  window.__gpuAdapterCalls = 0
  if (navigator.gpu) {
    const orig = navigator.gpu.requestAdapter.bind(navigator.gpu)
    navigator.gpu.requestAdapter = (...args) => {
      window.__gpuAdapterCalls++
      return orig(...args)
    }
  }
})

const errors = []
page.on('pageerror', err => errors.push(err.message))

// Separate: module CODE being loaded (expected always, ChatContext.jsx
// statically imports trystero at the top) vs an ACTUAL WebSocket connection
// to the P2P signaling relay or the 5 Nostr chat relays.
let trysteroSignalingSocket = false
let nostrRelaySocket = false
page.on('websocket', ws => {
  const url = ws.url()
  if (/chorus\.almostmachines\.dev|nostr-relay\.trystero|trystero/i.test(url)) trysteroSignalingSocket = true
  if (/relay\.damus\.io|nos\.lol|relay\.nostr\.place|purplerelay\.com|relay\.snort\.social/.test(url)) nostrRelaySocket = true
})

console.log('Navigating to app...')
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(2500)

const gpuCallsBeforeChat = await page.evaluate(() => window.__gpuAdapterCalls)
console.log('\n=== BEFORE opening chat ===')
console.log('Nostr relay WebSocket opened (expected: true, always-on):', nostrRelaySocket)
console.log('Trystero P2P signaling WebSocket opened (expected: false, gated on chat open):', trysteroSignalingSocket)
console.log('navigator.gpu.requestAdapter() calls (expected: 0, gated on chat open):', gpuCallsBeforeChat)

console.log('\n=== Opening chat panel ===')
const chatBtn = page.locator('[title*="Chat" i]').first()
await chatBtn.click({ timeout: 5000 })
await page.waitForTimeout(2500)

const gpuCallsAfterOpen = await page.evaluate(() => window.__gpuAdapterCalls)
console.log('Trystero P2P signaling WebSocket opened after opening chat (expected: true):', trysteroSignalingSocket)
console.log('navigator.gpu.requestAdapter() calls after opening chat (expected: 1):', gpuCallsAfterOpen)

const panelVisible = await page.locator('input[placeholder], textarea').first().isVisible().catch(() => false)
console.log('Chat panel input visible:', panelVisible)

console.log('\n=== Closing chat panel ===')
await chatBtn.click({ timeout: 5000 })
await page.waitForTimeout(1500)

// Reopen to confirm GPU score re-announces (fresh election each open, not stuck)
console.log('\n=== Reopening chat panel ===')
await chatBtn.click({ timeout: 5000 })
await page.waitForTimeout(2000)
const gpuCallsAfterReopen = await page.evaluate(() => window.__gpuAdapterCalls)
console.log('navigator.gpu.requestAdapter() calls after reopening (expected: 2, one per open):', gpuCallsAfterReopen)

await browser.close()

console.log('\nPage errors captured:', errors.length)
errors.slice(0, 15).forEach(e => console.log(' -', e))
