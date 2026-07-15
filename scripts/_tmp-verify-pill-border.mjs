import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 500 } })
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)

// Click the "Programming" top-level topic (holds Python/JS/TS/C++/Web Dev/Canvas/CLI subtopics)
await page.locator('button', { hasText: 'Programming' }).first().click()
await page.waitForTimeout(300)
// Python should already be the default active subtopic; screenshot the pill row
await page.screenshot({ path: '/private/tmp/claude-501/-Users-michaelmclean-Testing-open-calc/e18d4d39-2322-491e-a16c-81ab12ee1cd6/scratchpad/pills-after-fix.png' })
await browser.close()
