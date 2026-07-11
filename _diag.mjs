import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 })
await page.waitForSelector('text=Explore by Topic', { timeout: 15000 })

const result = await page.evaluate(() => {
  const legends = Array.from(document.querySelectorAll('legend'))
  const out = []
  for (const legend of legends) {
    const txt = legend.textContent.trim()
    if (!['LAB', 'GAME', 'COURSE'].includes(txt)) continue
    const tile = legend.closest('fieldset')
    if (!tile) continue
    const nameEl = tile.querySelector('h4')
    const cs = getComputedStyle(tile)
    out.push({
      name: nameEl ? nameEl.textContent.trim() : '?',
      className: tile.className,
      borderColor: cs.borderColor,
      borderTopColor: cs.borderTopColor,
    })
  }
  return out
})
console.log(JSON.stringify(result, null, 2))
await browser.close()
