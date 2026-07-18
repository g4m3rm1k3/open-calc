import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', msg => { if (msg.type() === 'error' || msg.text().includes('[nostrChat]') || msg.text().includes('[ChatContext]')) console.log('LOG:', msg.text()) })

await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(1500)
await page.locator('[title="Study Chat"]').click({ timeout: 5000 })
await page.waitForTimeout(2500)

// Dump the panel's HTML structure
const panelHtml = await page.evaluate(() => {
  const els = document.querySelectorAll('input, textarea, [contenteditable]')
  return Array.from(els).map(el => ({
    tag: el.tagName,
    type: el.type,
    placeholder: el.placeholder,
    disabled: el.disabled,
    contenteditable: el.getAttribute('contenteditable'),
    visible: el.offsetParent !== null,
    outerHTML: el.outerHTML.slice(0, 200),
  }))
})
console.log(JSON.stringify(panelHtml, null, 2))

await browser.close()
