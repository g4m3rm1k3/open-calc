/**
 * Verify a Vue Studio lesson's code by running it through the REAL sandbox
 * inside the real, running open-calc app — same compiler pipeline
 * (@vue/compiler-sfc + sucrase from sandbox.js), same iframe, same postMessage
 * protocol a real student's click of ▶ Run triggers.
 *
 * Requires the dev server running (npm run dev) at http://localhost:5173.
 *
 * Usage: node scripts/verify-lesson.mjs <label> <path-to-App.vue-source>
 *        node scripts/verify-lesson.mjs <label> <path-to-files.json>   (multi-file)
 */
import { chromium } from 'playwright'
import { readFileSync } from 'fs'

const BASE = 'http://localhost:5173'
const label = process.argv[2]
const filePath = process.argv[3]

if (!label || !filePath) {
  console.error('Usage: node scripts/verify-lesson.mjs <label> <path-to-source-or-json>')
  process.exit(1)
}

const raw = readFileSync(filePath, 'utf8')
let files
if (filePath.endsWith('.json')) {
  files = JSON.parse(raw)
} else {
  files = {
    'src/App.vue': raw,
    'src/main.ts': `import { createApp } from 'vue'\nimport App from './App.vue'\ncreateApp(App).mount('#app')\n`,
  }
}

const browser = await chromium.launch()
const page = await browser.newPage()

const messages = []
page.on('console', (msg) => messages.push({ type: msg.type(), text: msg.text() }))
page.on('pageerror', (err) => messages.push({ type: 'pageerror', text: err.message }))

await page.goto(`${BASE}/#/lab/vue-studio`, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('iframe[title="Vue Studio Preview"]', { timeout: 15000 })

// Let the default lesson's initial auto-run settle before we inject our own.
await page.waitForTimeout(1500)
messages.length = 0

await page.evaluate((filesToRun) => {
  const iframe = document.querySelector('iframe[title="Vue Studio Preview"]')
  iframe.contentWindow.postMessage({ type: 'run', files: filesToRun }, '*')
}, files)

await page.waitForTimeout(2000)

const errBoxText = await page.evaluate(() => {
  const iframe = document.querySelector('iframe[title="Vue Studio Preview"]')
  const doc = iframe.contentDocument
  const box = doc?.getElementById('__err__')
  return box && box.style.display !== 'none' ? box.textContent : null
})

const NOISE = [
  'Download the Vue Devtools',
  'chorus.almostmachines.dev', // unrelated outer-app dev telemetry websocket
  'WebSocket connection',
]
const realErrors = messages.filter(m =>
  (m.type === 'error' || m.type === 'pageerror') &&
  !NOISE.some(n => m.text.includes(n))
)

const passed = realErrors.length === 0 && !errBoxText

console.log(`\n=== ${label} ===`)
if (passed) {
  console.log('PASS - no errors')
} else {
  console.log('FAIL')
  if (errBoxText) console.log(`  error box: ${errBoxText}`)
  realErrors.forEach(e => console.log(`  [${e.type}] ${e.text}`))
  messages.filter(m => m.type === 'log').slice(0, 5).forEach(m => console.log(`  [log] ${m.text}`))
}

await browser.close()
process.exit(passed ? 0 : 1)
