import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = '/private/tmp/claude-501/-Users-michaelmclean-Testing-open-calc/e18d4d39-2322-491e-a16c-81ab12ee1cd6/scratchpad'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(`${BASE}/#/five-axis`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)
async function dismissDelta() {
  const skipBtn = page.locator('button:has-text("Skip")')
  if (await skipBtn.count() > 0 && await skipBtn.isVisible().catch(() => false)) {
    await skipBtn.click().catch(() => {})
    await page.waitForTimeout(200)
  }
}
await dismissDelta()

await page.locator('button:has-text("Calculator")').click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: 'calc', exact: true }).click()
await page.waitForTimeout(300)

const calcPanel = page.locator('div.overflow-y-auto.h-full.box-border:has-text("Compound tilt needed")')
const numInputs = calcPanel.locator('input[type="number"]')
await numInputs.nth(3).fill('30')
await numInputs.nth(4).fill('35')
await page.waitForTimeout(300)

await dismissDelta()
await page.locator('button:has-text("? How")').click()
await page.waitForTimeout(300)
await dismissDelta()
await page.screenshot({ path: `${OUT}/5axis-help-modal-1.png` })

// Scroll the modal down to see the practice section.
const modal = page.locator('div.fixed.inset-0.z-\\[2000\\]');
await modal.locator('div.max-h-\\[85vh\\]').evaluate((el) => el.scrollTo(0, el.scrollHeight));
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT}/5axis-help-modal-2.png` })

// Exercise the practice reveal flow.
await dismissDelta()
await page.locator('button:has-text("Reveal C")').click()
await page.waitForTimeout(150)
await page.locator('button:has-text("Reveal after-Rz")').click()
await page.waitForTimeout(150)
await page.locator('button:has-text("Reveal B")').click()
await page.waitForTimeout(150)
await page.screenshot({ path: `${OUT}/5axis-help-modal-practice.png` })

// Close and confirm it unmounts.
await page.locator('div.fixed.inset-0.z-\\[2000\\] button:has-text("×")').click()
await page.waitForTimeout(200)
console.log('Modal still present after close:', await page.locator('div.fixed.inset-0.z-\\[2000\\]').count())

console.log('errors:', errors.length ? errors : 'none')
await browser.close()
