import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })

const errors = []
page.on('pageerror', (err) => errors.push(err.message))
page.on('console', (msg) => { if (msg.type() === 'error' && !msg.text().includes('chorus.almostmachines.dev') && !msg.text().includes('WebSocket')) errors.push(msg.text()) })

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2000)

await page.locator('button[title="Practice"]').click()
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/practice1-open.png' })
console.log('open errors:', errors.length ? errors : 'none')

// Select the "Function" concept (should be first or findable by search)
await page.fill('input[placeholder="Search topics..."]', 'function')
await page.waitForTimeout(300)
await page.locator('button:has-text("Function")').first().click()
await page.waitForTimeout(500)
await page.screenshot({ path: '/tmp/practice2-function.png' })

// Type a WRONG solution for level 1 (double)
await page.locator('.monaco-editor').first().click()
await page.keyboard.type('function double(n) { return n + 1; }')
await page.waitForTimeout(300)
// Click "Run Tests"
await page.locator('button:has-text("Run Tests")').click()
await page.waitForTimeout(800)
await page.screenshot({ path: '/tmp/practice3-wrong.png' })

const wrongText = await page.locator('body').innerText()
const hasFailMarker = wrongText.includes('✗')
console.log('Shows a failing test for wrong solution:', hasFailMarker)

// Clear and type the CORRECT solution -- must re-focus the editor first,
// since clicking "Run Tests" moved focus to that button.
await page.locator('.monaco-editor').first().click()
await page.keyboard.press('Meta+A')
await page.keyboard.press('Backspace')
await page.keyboard.type('function double(n) { return n * 2; }')
await page.waitForTimeout(300)
await page.locator('button:has-text("Run Tests")').click()
await page.waitForTimeout(800)
await page.screenshot({ path: '/tmp/practice4-correct.png' })

const correctText = await page.locator('body').innerText()
const hasPass = correctText.includes('3 / 3 passing')
console.log('Shows all-passing for correct solution:', hasPass)

console.log('errors total:', errors.length ? errors : 'none')
await browser.close()
