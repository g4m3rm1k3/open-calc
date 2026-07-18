import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'

const browser = await chromium.launch()

// Context A: opens chat, sends a message
const ctxA = await browser.newContext()
const pageA = await ctxA.newPage()
const errorsA = []
pageA.on('pageerror', e => errorsA.push(e.message))

// Context B: NEVER opens chat — simulates "another user online, chat closed"
const ctxB = await browser.newContext()
const pageB = await ctxB.newPage()
const errorsB = []
pageB.on('pageerror', e => errorsB.push(e.message))

console.log('Loading both browser contexts...')
await Promise.all([
  pageA.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 }),
  pageB.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 }),
])
await pageA.waitForTimeout(1500)
await pageB.waitForTimeout(1500)

console.log('\n=== Context B: check badge BEFORE any message (should be absent, not a static dot) ===')
const badgeBefore = await pageB.locator('[title="Study Chat"] span').first().isVisible().catch(() => false)
console.log('Badge visible before any message (expected: false):', badgeBefore)

console.log('\n=== Context A: opening chat, sending a message ===')
await pageA.locator('[title*="Chat" i]').first().click({ timeout: 5000 })
await pageA.waitForTimeout(2000)

const testMessage = `test-${Date.now()}`
const input = pageA.locator('input[placeholder*="Lovelace" i]')
await input.fill(testMessage)
await input.press('Enter')
await pageA.waitForTimeout(1500)

console.log('Message sent from Context A:', testMessage)

console.log('\n=== Waiting for Nostr relay round-trip to Context B (chat stays closed) ===')
await pageB.waitForTimeout(5000)

const badgeAfter = await pageB.locator('[title="Study Chat"] span').first().isVisible().catch(() => false)
const badgeText = badgeAfter ? await pageB.locator('[title="Study Chat"] span').first().innerText().catch(() => '?') : null
console.log('Badge visible in Context B after message sent while chat closed (expected: true):', badgeAfter, 'text:', badgeText)

console.log('\n=== Now opening Context B chat panel — badge should clear, message should be visible ===')
await pageB.locator('[title*="Chat" i]').first().click({ timeout: 5000 })
await pageB.waitForTimeout(2500)

const messageVisibleInB = await pageB.locator(`text=${testMessage}`).first().isVisible().catch(() => false)
console.log(`Message "${testMessage}" visible in Context B after opening chat:`, messageVisibleInB)

const badgeAfterOpen = await pageB.locator('[title="Study Chat"] span').first().isVisible().catch(() => false)
console.log('Badge visible in Context B after opening chat (expected: false, markAllRead clears it):', badgeAfterOpen)

// ── Fresh "newly logged in" context — simulates someone opening the app for
// the first time AFTER the message was already sent, to check history load.
console.log('\n=== Context C: brand new context (simulating a newly-joined user), opening chat ===')
const ctxC = await browser.newContext()
const pageC = await ctxC.newPage()
await pageC.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 })
await pageC.waitForTimeout(1500)
await pageC.locator('[title*="Chat" i]').first().click({ timeout: 5000 })
await pageC.waitForTimeout(2500)

const messageVisibleInC = await pageC.locator(`text=${testMessage}`).first().isVisible().catch(() => false)
console.log(`Message "${testMessage}" visible in brand-new Context C's history:`, messageVisibleInC)

await browser.close()

console.log('\nContext A errors:', errorsA.length, errorsA.slice(0, 5))
console.log('Context B errors:', errorsB.length, errorsB.slice(0, 5))
