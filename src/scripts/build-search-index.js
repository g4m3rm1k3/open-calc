#!/usr/bin/env node
// Build the Fuse.js search index from all lesson content
// Run: node src/scripts/build-search-index.js
// Called automatically before dev/build via npm scripts

import { writeFileSync, existsSync, mkdirSync, unlinkSync, readdirSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../..')

const CONCEPT_ALIASES = {
  limits: ['approach', 'approaching value', 'as x approaches', 'end behavior'],
  continuity: ['continuous', 'discontinuous', 'jump discontinuity', 'removable discontinuity'],
  derivative: ['instantaneous rate of change', 'slope', 'dy/dx', 'velocity', 'marginal change'],
  integral: ['antiderivative', 'accumulation', 'area under curve', 'net area', 'total change'],
  optimization: ['maximize', 'minimize', 'maxima', 'minima', 'best value'],
  related: ['related rates', 'word problem', 'changing over time'],
  epsilon: ['epsilon-delta', 'formal limit proof', 'proof of limit'],
  trigonometric: ['trig', 'sine', 'cosine', 'tangent', 'unit circle'],
  exponential: ['growth', 'decay', 'e^x', 'logarithm', 'ln'],
  parametric: ['parametric equations', 'x(t)', 'y(t)', 'parameterized curve'],
  polar: ['r(theta)', 'polar coordinates', 'rose curve', 'cardioid'],
  proof: ['rigor', 'formal proof', 'show that', 'theorem proof', 'geometric proof', 'visual proof'],
  application: ['real world', 'engineering', 'physics', 'economics', 'biology', 'computer science'],
  series: ['sequence', 'convergence', 'power series', 'taylor', 'maclaurin'],
  vectors: ['vector-valued', 'velocity', 'acceleration', 'trajectory'],
}

const ASSIGNMENT_TERMS = [
  'assignment',
  'homework',
  'quiz',
  'exam',
  'practice problems',
  'worked example',
  'step by step',
]

function toText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function flattenStepLikeItems(items = []) {
  return items.flatMap((item) => {
    if (!item || typeof item !== 'object') return []

    return [
      toText(item.title),
      toText(item.problem),
      toText(item.hint),
      toText(item.answer),
      toText(item.conclusion),
      ...(item.steps ?? []).flatMap((step) => [toText(step.expression), toText(step.annotation)]),
      ...(item.walkthrough ?? []).flatMap((step) => [toText(step.expression), toText(step.annotation)]),
      ...(item.visualizations ?? []).flatMap((viz) => [toText(viz.title), toText(viz.caption)]),
      ...(item.searchKeywords ?? []),
    ]
  })
}

function inferAliasTerms(lesson, chapter) {
  const haystack = [
    toText(chapter.title),
    toText(lesson.title),
    toText(lesson.subtitle),
    ...(lesson.tags ?? []),
    ...(lesson.searchKeywords ?? []),
  ]
    .join(' ')
    .toLowerCase()

  return Object.entries(CONCEPT_ALIASES)
    .filter(([key]) => haystack.includes(key))
    .flatMap(([, aliases]) => aliases)
}

function isDir(p) {
  try { return statSync(p).isDirectory() } catch { return false }
}

function titleFromSlug(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// Scan src/courses/ and build search docs for all courseLoader-style lessons
async function buildCourseLoaderDocs(root) {
  const coursesDir = resolve(root, 'src/courses')
  const docs = []

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
      const chapterNum = parseInt(chm[1], 10)
      const chapterId = `${courseId}-${chapterNum}`
      const chapterTitle = titleFromSlug(chm[2])

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
          const mod = await import(lessonPath)
          lesson = mod?.default ?? mod?.lesson ?? {}
        } catch { continue }

        const proofsText = [
          ...(lesson.rigor?.prose ?? []),
          ...(lesson.rigor?.callouts ?? []).flatMap(c => [toText(c.title), toText(c.body)]),
        ]
        const applicationsText = [
          toText(lesson.hook?.realWorldContext),
          ...(lesson.intuition?.callouts ?? []).flatMap(c => [toText(c.title), toText(c.body)]),
        ]
        const assignmentText = [
          ...flattenStepLikeItems(lesson.examples),
          ...flattenStepLikeItems(lesson.challenges),
        ]
        const content = [
          toText(lesson.hook?.question),
          toText(lesson.hook?.realWorldContext),
          ...(lesson.intuition?.prose ?? []),
          ...(lesson.math?.prose ?? []),
          ...proofsText,
          ...assignmentText,
          ...(lesson.searchKeywords ?? []),
        ].filter(s => typeof s === 'string' && s.trim()).join(' ')

        docs.push({
          id: `${chapterId}/${lessonSlug}`,
          slug: lessonSlug,
          chapterNumber: chapterId,
          chapterTitle,
          title: lesson.title ?? titleFromSlug(lessonSlug),
          subtitle: lesson.subtitle ?? '',
          tags: (lesson.tags ?? []).join(' '),
          aliases: Array.isArray(lesson.aliases) ? lesson.aliases.join(' ') : (lesson.aliases ?? ''),
          assignment: assignmentText.join(' '),
          proofs: proofsText.join(' '),
          applications: applicationsText.join(' '),
          content,
        })
      }
    }
  }

  return docs
}

async function buildIndex() {
  // courseLoader is the single source of truth — content/index.js is being retired
  const documents = await buildCourseLoaderDocs(root)

  const publicDir = resolve(root, 'public')
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true })

  const outPath = resolve(publicDir, 'search-index.json')
  const tmpPath = outPath + '.tmp'
  if (existsSync(tmpPath)) try { unlinkSync(tmpPath) } catch {}
  writeFileSync(outPath, JSON.stringify({ documents }, null, 0))

  // Write lesson title map so courseLoader can show real titles without
  // eager-loading full lesson content.  Key: "chapterId/lessonSlug"
  const titles = {}
  for (const d of documents) {
    titles[d.id] = d.title   // id is already "chapterId/lessonSlug"
  }
  const dataDir = resolve(root, 'src/data')
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
  writeFileSync(resolve(dataDir, 'lessonTitles.json'), JSON.stringify(titles))

  console.log(`✓ Search index built: ${documents.length} lessons indexed`)
}

buildIndex().catch((e) => {
  console.error('Failed to build search index:', e.message)
  process.exit(1)
})
