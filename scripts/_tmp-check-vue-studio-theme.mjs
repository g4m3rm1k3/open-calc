import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })

const errors = []
page.on('pageerror', (err) => errors.push(err.message))
page.on('console', (msg) => { if (msg.type() === 'error' && !msg.text().includes('chorus.almostmachines.dev') && !msg.text().includes('WebSocket')) errors.push(msg.text()) })

// Default theme first
await page.goto(`${BASE}/#/lab/vue-studio`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2000)
await page.screenshot({ path: '/tmp/vue-studio-default.png' })
console.log('default theme errors:', errors.length ? errors : 'none')

// Switch to Dracula studio theme + dark mode, then navigate fresh (reload can
// drop hash-route lab selection depending on how the shell restores state)
await page.evaluate(() => {
  localStorage.setItem('studio_theme', 'dracula')
  localStorage.setItem('oc-theme', 'dark')
  document.documentElement.classList.add('dark')
})
await page.goto(`${BASE}/#/lab/vue-studio`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2000)
await page.screenshot({ path: '/tmp/vue-studio-dracula.png' })
console.log('dracula theme errors:', errors.slice())

// Switch to vue-light (forceLight) theme, then navigate fresh -- also strip
// the 'dark' class ourselves, since ThemeContext.jsx only does that inside
// its setStudioTheme() setter (real UI click path), not on localStorage-only
// initial read, which is all a fresh page load does.
await page.evaluate(() => {
  localStorage.setItem('studio_theme', 'vue-light')
  localStorage.setItem('oc-theme', 'light')
  document.documentElement.classList.remove('dark')
})
await page.goto(`${BASE}/#/lab/vue-studio`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2000)
await page.screenshot({ path: '/tmp/vue-studio-vue-light.png' })
console.log('vue-light theme errors:', errors.slice())

await browser.close()
