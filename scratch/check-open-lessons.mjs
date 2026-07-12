import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5174'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', err => errors.push('pageerror: ' + err.message))

await page.goto(`${BASE}/#/`, { waitUntil: 'load', timeout: 30000 })
await page.waitForTimeout(2000)

const urlBefore = page.url()

await page.getByTitle('Contributor Docs').click()
await page.waitForTimeout(600)

await page.getByRole('button', { name: /Open the lessons/i }).click()
await page.waitForTimeout(1200)

const urlAfter = page.url()
const helpStillOpen = await page.getByRole('heading', { name: 'Feedback & Bugs' }).count()
const chooseSeriesVisible = await page.getByText('Choose a series').isVisible().catch(() => false)
const contributorTileVisible = await page.getByText('How to Contribute').isVisible().catch(() => false)

await page.screenshot({ path: 'scratch/lessons-window.png' })

console.log(JSON.stringify({
  urlBefore, urlAfter, sameUrl: urlBefore === urlAfter,
  helpStillOpenCount: helpStillOpen,
  chooseSeriesVisible, contributorTileVisible,
  errors,
}, null, 2))

await browser.close()
