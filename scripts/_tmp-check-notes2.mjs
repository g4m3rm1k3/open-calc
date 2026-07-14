import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })

const errors = []
page.on('pageerror', (err) => errors.push(err.message))
page.on('console', (msg) => { if (msg.type() === 'error' && !msg.text().includes('chorus.almostmachines.dev') && !msg.text().includes('WebSocket')) errors.push(msg.text()) })

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2000)

// Open Notes list
await page.locator('button[title="Notes"]').click()
await page.waitForTimeout(400)
await page.screenshot({ path: '/tmp/notes2-list.png' })

// Click somewhere else on the page (outside the panel) -- it should NOT close
await page.mouse.click(200, 200)
await page.waitForTimeout(300)
const stillOpen = await page.locator('button[title="Create note"]').isVisible()
console.log('List still open after outside click (should be true):', stillOpen)

// Click "Create note" -- should open a SEPARATE draggable FloatingWindow
await page.locator('button[title="Create note"]').click()
await page.waitForTimeout(500)
await page.screenshot({ path: '/tmp/notes2-both-open.png' })

console.log('errors so far:', errors.length ? errors : 'none')
await browser.close()
