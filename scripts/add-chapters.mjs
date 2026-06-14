// For each course in src/courses/, if lesson files are flat (no chapter sub-folders),
// read each file's chapter/order fields and move them into chapter sub-folders.
// Chapter folder format: {N}-{slug}

import fs from 'fs'
import path from 'path'
import vm from 'vm'

const COURSES_DIR = new URL('../src/courses', import.meta.url).pathname

function extractLesson(filePath) {
  try {
    let src = fs.readFileSync(filePath, 'utf8')
    // Normalise export
    src = src.replace(/^export\s+const\s+\w+\s*=\s*/m, '__lesson = ')
             .replace(/^export\s+default\s+\{/m, '__lesson = {')
    const varRef = src.match(/export\s+default\s+(\w+)\s*;?\s*$/m)
    if (varRef) {
      src = src.replace(new RegExp(`^(const|let|var)\\s+${varRef[1]}\\s*=\\s*`, 'm'), '__lesson = ')
               .replace(/export\s+default\s+\w+\s*;?\s*$/m, '')
    }
    src = src.replace(/^export\s+/gm, '')
    const ctx = { __lesson: null }
    vm.runInNewContext(src, ctx, { timeout: 2000 })
    return ctx.__lesson
  } catch { return null }
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

for (const courseDir of fs.readdirSync(COURSES_DIR)) {
  const coursePath = path.join(COURSES_DIR, courseDir)
  if (!fs.statSync(coursePath).isDirectory()) continue

  // Get immediate children
  const entries = fs.readdirSync(coursePath)
  const jsFiles = entries.filter(f => f.endsWith('.js') && f !== 'index.js')
  const subDirs = entries.filter(f => fs.statSync(path.join(coursePath, f)).isDirectory())

  // If there are already chapter sub-folders AND no flat js files, skip
  if (subDirs.length > 0 && jsFiles.length === 0) {
    console.log(`skip (already has chapters): ${courseDir}`)
    continue
  }

  if (jsFiles.length === 0) {
    console.log(`skip (no js files): ${courseDir}`)
    continue
  }

  // Group flat files by chapter
  const chapters = {}  // chapterNum → { title, lessons: [{order, file, lesson}] }

  for (const file of jsFiles) {
    const filePath = path.join(coursePath, file)
    const lesson = extractLesson(filePath)

    // Determine chapter number and order
    let chapterNum = 1
    let order = 999
    let chapterTitle = courseDir

    if (lesson) {
      if (typeof lesson.chapter === 'number') chapterNum = lesson.chapter + 1  // 0-indexed → 1-indexed
      else if (typeof lesson.chapter === 'string') {
        // e.g. 'sim1' or 'ch1' — extract trailing digit
        const m = lesson.chapter.match(/(\d+)$/)
        if (m) chapterNum = parseInt(m[1], 10) + 1
      }
      order = lesson.order ?? 999
      if (lesson.chapterTitle) chapterTitle = lesson.chapterTitle
    }

    if (!chapters[chapterNum]) chapters[chapterNum] = { title: chapterTitle, lessons: [] }
    else if (lesson?.chapterTitle) chapters[chapterNum].title = lesson.chapterTitle
    chapters[chapterNum].lessons.push({ order, file })
  }

  // Move files into chapter sub-folders
  const chNums = Object.keys(chapters).map(Number).sort((a, b) => a - b)
  for (const num of chNums) {
    const ch = chapters[num]
    const folderSlug = slugify(ch.title) || `chapter-${num}`
    const folderName = `${num}-${folderSlug}`
    const folderPath = path.join(coursePath, folderName)
    fs.mkdirSync(folderPath, { recursive: true })

    for (const { file } of ch.lessons) {
      fs.renameSync(path.join(coursePath, file), path.join(folderPath, file))
    }
    console.log(`  ${courseDir}/${folderName}: ${ch.lessons.length} lessons`)
  }

  // Remove stray index.js if still there
  const strayIndex = path.join(coursePath, 'index.js')
  if (fs.existsSync(strayIndex)) fs.unlinkSync(strayIndex)
}
