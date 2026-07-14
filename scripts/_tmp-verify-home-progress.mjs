import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })

const errors = []
page.on('pageerror', (err) => errors.push(err.message))
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)

// Seed fake progress for the 4 labs before reload.
await page.evaluate(() => {
  localStorage.setItem('oc-lesson-progress', JSON.stringify(['python-fundamentals:1', 'python-fundamentals:2']))
  localStorage.setItem('vue-studio-v3:milestone-idx', '2') // 3rd of 12 milestones
  localStorage.setItem('rfl-completed-v2', JSON.stringify(['m1', 'm2', 'm3']))
  localStorage.setItem('oc-backend-lab', JSON.stringify({ activeLessonId: '05', files: [], savedRequests: [] }))
})

await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)

console.log('Console/page errors after reload:', errors.length ? errors : 'none')

// Click the "In Progress" topic pill if present.
const inProgressBtn = page.locator('button, a').filter({ hasText: 'In Progress' }).first()
const hasBtn = await inProgressBtn.count()
console.log('In Progress filter button found:', hasBtn > 0)
if (hasBtn > 0) {
  await inProgressBtn.click()
  await page.waitForTimeout(500)
  const bodyText = await page.locator('body').innerText()
  console.log('Contains "Lesson Engine":', bodyText.includes('Lesson Engine'))
  console.log('Contains "2 of ... levels":', /\d+ of \d+ levels complete/.test(bodyText))
  console.log('Contains "Vue Studio":', bodyText.includes('Vue Studio'))
  console.log('Contains "milestones complete":', /\d+ of \d+ milestones complete/.test(bodyText))
  console.log('Contains "Robot Arm":', bodyText.includes('Robot Arm'))
  console.log('Contains "missions complete":', /\d+ of \d+ missions complete/.test(bodyText))
  console.log('Contains "Backend Lab":', bodyText.includes('Backend Lab'))
  console.log('Contains "lessons complete":', /\d+ of \d+ lessons complete/.test(bodyText))
  await page.screenshot({ path: '/private/tmp/claude-501/-Users-michaelmclean-Testing-open-calc/e18d4d39-2322-491e-a16c-81ab12ee1cd6/scratchpad/home-in-progress.png', fullPage: true })
}

await browser.close()
