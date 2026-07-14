import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })

const errors = []
page.on('pageerror', (err) => errors.push(err.message))
page.on('console', (msg) => { if (msg.type() === 'error' && !msg.text().includes('chorus.almostmachines.dev') && !msg.text().includes('WebSocket')) errors.push(msg.text()) })

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2500)
console.log('home page load errors:', errors.length ? errors : 'none')
await page.screenshot({ path: '/tmp/home-taskbar.png' })

// Click the Notes button in the taskbar
const notesBtn = page.locator('button[title="Notes"]')
await notesBtn.waitFor({ timeout: 10000 })
await notesBtn.click()
await page.waitForTimeout(500)
await page.screenshot({ path: '/tmp/notes-list.png' })

// Click "Create note"
const createBtn = page.locator('button:has-text("Create note")')
if (await createBtn.count() > 0) {
  await createBtn.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: '/tmp/notes-create.png' })
}

console.log('errors after interacting with notes:', errors.length ? errors : 'none')

// Confirm no "Pin" titled button remains in the taskbar
const pinBtnCount = await page.locator('button[title="Pins"]').count()
console.log('Pin button count in taskbar (should be 0):', pinBtnCount)

await browser.close()
