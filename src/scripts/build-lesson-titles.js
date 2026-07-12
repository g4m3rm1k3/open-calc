#!/usr/bin/env node
// Builds src/data/lessonTitles.json — a "chapterId/lessonSlug" -> real title
// map so courseLoader.js can show hand-authored lesson titles without
// eager-loading every lesson's full content.
// Run: node src/scripts/build-lesson-titles.js
// Called automatically before dev/build via npm scripts

import { writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../..')

function isDir(p) {
  try { return statSync(p).isDirectory() } catch { return false }
}

function titleFromSlug(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

async function buildTitles(root) {
  const coursesDir = resolve(root, 'src/courses')
  const titles = {}
  let lessonCount = 0

  const courseIds = readdirSync(coursesDir).filter(name => {
    if (name === 'courseLoader.js') return false
    return isDir(resolve(coursesDir, name))
  }).sort()

  for (const courseId of courseIds) {
    const courseDir = resolve(coursesDir, courseId)
    const chapterDirs = readdirSync(courseDir)
      .filter(name => /^\d+-.+$/.test(name) && isDir(resolve(courseDir, name)))
      .sort()

    for (const chapterDir of chapterDirs) {
      const chm = chapterDir.match(/^(\d+)-(.+)$/)
      if (!chm) continue
      const chapterId = `${courseId}-${parseInt(chm[1], 10)}`

      const lessonFiles = readdirSync(resolve(courseDir, chapterDir))
        .filter(f => /^\d+-.+\.js$/.test(f))
        .sort()

      for (const lessonFile of lessonFiles) {
        const fm = lessonFile.replace(/\.js$/, '').match(/^(\d+)-(.+)$/)
        if (!fm) continue
        const lessonSlug = fm[2]
        const lessonPath = resolve(courseDir, chapterDir, lessonFile)

        let lesson = {}
        try {
          // Dynamic import() requires a file:// URL, not a bare filesystem
          // path — a raw Windows path (C:\...) is not a valid ESM specifier
          // and silently threw here, meaning this loop's `continue` skipped
          // every single lesson and the title map came out empty.
          const mod = await import(pathToFileURL(lessonPath).href)
          lesson = mod?.default ?? mod?.lesson ?? {}
        } catch { continue }

        titles[`${chapterId}/${lessonSlug}`] = lesson.title ?? titleFromSlug(lessonSlug)
        lessonCount++
      }
    }
  }

  return { titles, lessonCount }
}

async function main() {
  const { titles, lessonCount } = await buildTitles(root)

  const dataDir = resolve(root, 'src/data')
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
  writeFileSync(resolve(dataDir, 'lessonTitles.json'), JSON.stringify(titles))

  console.log(`✓ Lesson titles built: ${lessonCount} lessons`)
}

main().catch((e) => {
  console.error('Failed to build lesson titles:', e.message)
  process.exit(1)
})
