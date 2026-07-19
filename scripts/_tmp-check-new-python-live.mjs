import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
page.setDefaultTimeout(120000)
const errors = []
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))

async function checkLesson(url, label, expectedCellCount) {
  console.log(`\n=== ${label} ===`)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.waitForTimeout(1500)
  for (let i = 0; i < 25; i++) {
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(1500)

  const runButtons = await page.locator('button', { hasText: '▶ Run' }).all()
  // "▶ Run" matches both "▶ Run all" and "▶ Run" — filter to exact single-cell buttons
  let exactRunCount = 0
  for (const b of runButtons) {
    const t = (await b.innerText()).trim()
    if (t === '▶ Run') exactRunCount++
  }
  console.log(`Cell "Run" buttons found: ${exactRunCount} (expected ${expectedCellCount})`)

  // Run every single cell's Run button in order, waiting between each for pyodide/micropip
  const buttons = page.getByRole('button', { name: '▶ Run', exact: true })
  const count = await buttons.count()
  for (let i = 0; i < count; i++) {
    await buttons.nth(i).click()
    await page.waitForTimeout(20000)
  }

  const bodyText = await page.evaluate(() => document.body.innerText)
  console.log('has ModuleNotFoundError:', bodyText.includes('ModuleNotFoundError'))
  console.log('has AttributeError:', bodyText.includes('AttributeError'))
  console.log('has PythonError:', bodyText.includes('PythonError'))
  return bodyText
}

const t1 = await checkLesson('http://localhost:5173/#/chapter/cyber-lab-1/what-is-hashing', 'Lesson 1: What Is Hashing', 2)
const idx1 = t1.indexOf('Out [')
console.log(t1.slice(idx1, idx1 + 2500))

const t2 = await checkLesson('http://localhost:5173/#/chapter/cyber-lab-1/symmetric-encryption', 'Lesson 2: Symmetric Encryption', 2)
const idx2 = t2.indexOf('Out [')
console.log(t2.slice(idx2, idx2 + 2500))

console.log('\nErrors:', errors)
await browser.close()
