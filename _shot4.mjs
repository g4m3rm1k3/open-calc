import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
const out = 'C:\\Users\\g4m3r\\AppData\\Local\\Temp\\claude\\c--Users-g4m3r-Documents-testing-tutorials-open-calc\\ca9d979c-3db7-4c31-ab9a-6007b8a26b0f\\scratchpad\\border-fixed-bg-back.png'
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 })
await page.waitForSelector('text=Explore by Topic', { timeout: 15000 })
await page.locator('text=Explore by Topic').scrollIntoViewIfNeeded()
await page.waitForTimeout(700)
await page.screenshot({ path: out })
console.log('saved')
await browser.close()
