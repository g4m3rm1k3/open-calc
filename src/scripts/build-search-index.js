#!/usr/bin/env node
// Build the Fuse.js search index from all lesson content
// Run: node src/scripts/build-search-index.js
// Called automatically before dev/build via npm scripts

import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'fs'
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

// Dynamically import content
async function buildIndex() {
  const { CURRICULUM } = await import('../content/index.js')

  const documents = CURRICULUM.flatMap((chapter) =>
    chapter.lessons.map((lesson) => {
      const proofsText = [
        ...(lesson.rigor?.prose ?? []),
        ...(lesson.rigor?.callouts ?? []).flatMap((c) => [toText(c.title), toText(c.body)]),
      ]

      const applicationsText = [
        toText(lesson.hook?.realWorldContext),
        ...(lesson.intuition?.callouts ?? []).flatMap((c) => [toText(c.title), toText(c.body)]),
      ]

      const assignmentText = [
        ...flattenStepLikeItems(lesson.examples),
        ...flattenStepLikeItems(lesson.challenges),
      ]

      const aliasTerms = inferAliasTerms(lesson, chapter)

      const searchableText = [
        toText(lesson.hook?.question),
        toText(lesson.hook?.realWorldContext),
        ...(lesson.intuition?.prose ?? []),
        ...(lesson.math?.prose ?? []),
        ...proofsText,
        ...(lesson.intuition?.callouts ?? []).flatMap((c) => [toText(c.title), toText(c.body)]),
        ...(lesson.math?.callouts ?? []).flatMap((c) => [toText(c.title), toText(c.body)]),
        ...(lesson.intuition?.visualizations ?? []).flatMap((viz) => [toText(viz.title), toText(viz.caption)]),
        ...(lesson.math?.visualizations ?? []).flatMap((viz) => [toText(viz.title), toText(viz.caption)]),
        ...(lesson.rigor?.visualizations ?? []).flatMap((viz) => [toText(viz.title), toText(viz.caption)]),
        ...assignmentText,
        ...(lesson.crossRefs ?? []).flatMap((ref) => [toText(ref.label), toText(ref.context)]),
        ...(lesson.searchKeywords ?? []),
        ...ASSIGNMENT_TERMS,
        ...aliasTerms,
      ]

      const content = searchableText
        .filter((part) => typeof part === 'string' && part.trim().length > 0)
        .join(' ')

      return {
        id: lesson.id,
        slug: lesson.slug,
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        title: lesson.title,
        subtitle: lesson.subtitle,
        tags: (lesson.tags ?? []).join(' '),
        aliases: aliasTerms.join(' '),
        assignment: assignmentText.join(' '),
        proofs: proofsText.join(' '),
        applications: applicationsText.join(' '),
        content,
      }
    })
  )

  const publicDir = resolve(root, 'public')
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true })

  const outPath = resolve(publicDir, 'search-index.json')
  const tmpPath = outPath + '.tmp'
  writeFileSync(tmpPath, JSON.stringify({ documents }, null, 0))
  renameSync(tmpPath, outPath)

  console.log(`✓ Search index built: ${documents.length} lessons indexed`)
}

buildIndex().catch((e) => {
  console.error('Failed to build search index:', e.message)
  process.exit(1)
})
