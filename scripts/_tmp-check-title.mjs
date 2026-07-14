import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })

const errors = []
page.on('pageerror', (err) => errors.push(err.message))
page.on('console', (msg) => { if (msg.type() === 'error' && !msg.text().includes('chorus.almostmachines.dev') && !msg.text().includes('WebSocket')) errors.push(msg.text()) })

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2000)

await page.locator('button[title="Notes"]').click()
await page.waitForTimeout(400)
await page.locator('button[title="Create note"]').click()
await page.waitForTimeout(500)

// Type a title and some body text
const titleInput = page.locator('input[placeholder="Untitled note"]')
await titleInput.fill('My Test Note Title')
await page.locator('.monaco-editor').first().click()
await page.keyboard.type('Some body content here')
await page.waitForTimeout(600)

await page.screenshot({ path: '/tmp/title-editor.png' })

console.log('errors:', errors.length ? errors : 'none')
await browser.close()
