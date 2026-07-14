import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const LANG_LABELS = { javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python', java: 'Java', csharp: 'C#', cpp: 'C++' }
const langLabel = (lang) => LANG_LABELS[lang.replace(/-program$/, '')] ?? lang

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })

const consoleErrors = []
page.on('pageerror', (err) => consoleErrors.push(err.message))

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)

// Pull the actual challenge data straight from the loader running in the app —
// single source of truth, no hand-duplicated language/solution lists to drift.
const files = await page.evaluate(async () => {
  const mod = await import('/src/practice/loader.ts')
  return mod.getAvailablePracticeIds().map((id) => mod.getPracticeFile(id))
})

console.log(`Loaded ${files.length} practice files from the app`)

const filter = process.argv[2]
const filesToRun = filter ? files.filter((f) => f.id.includes(filter)) : files
if (filter) console.log(`Filtering to ids containing "${filter}": ${filesToRun.map((f) => f.id).join(', ')}`)

await page.locator('button[title="Practice"]').click()
await page.waitForTimeout(600)

// Monaco's normal typing path (real keystrokes, and — it turns out —
// Playwright's keyboard.insertText too) runs auto-indent-on-newline and
// auto-close-brackets, which corrupts multi-line code with its own embedded
// indentation/braces (doubled indentation breaks Python, stray extra closing
// braces break C-family languages). A real paste event skips all of that —
// exactly like pasting into a real editor — and inserts the text verbatim.
async function pasteIntoEditor(text) {
  await page.locator('.monaco-editor').first().click()
  await page.keyboard.press('Meta+A')
  await page.keyboard.press('Backspace')
  await page.evaluate((value) => {
    const el = document.activeElement
    const dt = new DataTransfer()
    dt.setData('text/plain', value)
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }))
  }, text)
}

const failures = []
let total = 0

async function waitForRunToFinish() {
  await page.waitForFunction(
    () => {
      const btn = [...document.querySelectorAll('button')].find((b) => /Run Tests|Re-run Tests|…/.test(b.textContent || ''))
      return !!btn && !/…/.test(btn.textContent || '')
    },
    { timeout: 30000 },
  )
}

for (const file of filesToRun) {
  await page.getByTestId(`practice-concept-${file.id}`).click()
  await page.waitForTimeout(200)

  for (const challenge of file.challenges) {
    await page.getByTestId(`practice-level-${challenge.level}`).click()
    await page.waitForTimeout(150)

    for (const variant of challenge.variants) {
      total++
      const label = `${file.id} L${challenge.level} [${variant.lang}]`
      try {
        if (challenge.variants.length > 1) {
          await page.getByTestId(`practice-lang-${variant.lang}`).click()
          await page.waitForTimeout(150)
        }

        await pasteIntoEditor(variant.solution)
        await page.waitForTimeout(150)

        await page.locator('button:has-text("Run Tests"), button:has-text("Re-run Tests")').first().click()
        await waitForRunToFinish()
        await page.waitForTimeout(250)

        const text = await page.locator('body').innerText()
        const m = text.match(/(\d+)\s*\/\s*(\d+)\s*passing/)
        if (!m) {
          failures.push({ label, reason: 'no "N / M passing" text found', snippet: text.slice(0, 400) })
          continue
        }
        const passed = Number(m[1])
        const totalAsserts = Number(m[2])
        if (totalAsserts === 0 || passed !== totalAsserts) {
          // Grab the failing assertion lines for a useful report.
          const failLines = [...text.matchAll(/✗\s*(.+)/g)].map((mm) => mm[1].trim()).slice(0, 5)
          failures.push({ label, reason: `${passed}/${totalAsserts} passing`, failLines })
        } else {
          console.log(`OK  ${label} — ${passed}/${totalAsserts}`)
        }
      } catch (e) {
        failures.push({ label, reason: e.message })
      }
    }
  }
}

console.log(`\n=== Ran ${total} variant checks, ${failures.length} failed ===`)
for (const f of failures) console.log(JSON.stringify(f, null, 2))
if (consoleErrors.length) console.log('Page errors seen:', consoleErrors)

await browser.close()
process.exit(failures.length > 0 ? 1 : 0)
