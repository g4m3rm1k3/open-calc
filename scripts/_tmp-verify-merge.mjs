import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

// Cyber Lab spot-check
await page.goto('http://localhost:5173/#/chapter/cyber-lab-1/what-is-hashing', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForSelector('input', { timeout: 5000 })
await page.waitForTimeout(1000)
let bodyText = await page.evaluate(() => document.body.innerText)
console.log('Cyber Lab: title renders:', bodyText.includes('What Is Hashing'))
console.log('Cyber Lab: challenges render:', bodyText.includes('Challenge Problems'))

// Canvas Notes spot-check (post theme-color merge)
await page.goto('http://localhost:5173/#/lab/canvas-notes', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForSelector('button[title="Pen"]', { timeout: 5000 })
await page.waitForTimeout(800)
bodyText = await page.evaluate(() => document.body.innerText)
console.log('Canvas Notes: opens and toolbar renders:', bodyText.includes('Welcome') || bodyText.includes('Getting Started'))
const hasCanvas = !!(await page.$('canvas'))
console.log('Canvas Notes: canvas element present:', hasCanvas)

console.log('Errors:', errors.slice(0, 5))
await browser.close()
