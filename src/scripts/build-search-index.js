#!/usr/bin/env node
// Build the Fuse.js search index from all lesson content
// Run: node src/scripts/build-search-index.js
// Called automatically before dev/build via npm scripts

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../..')

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

// Dynamically import content
async function buildIndex() {
  const { CURRICULUM } = await import('../content/index.js')

  const documents = CURRICULUM.flatMap((chapter) =>
    chapter.lessons.map((lesson) => {
      const searchableText = [
        toText(lesson.hook?.question),
        toText(lesson.hook?.realWorldContext),
        ...(lesson.intuition?.prose ?? []),
        ...(lesson.math?.prose ?? []),
        ...(lesson.rigor?.prose ?? []),
        ...(lesson.intuition?.callouts ?? []).flatMap((c) => [toText(c.title), toText(c.body)]),
        ...(lesson.math?.callouts ?? []).flatMap((c) => [toText(c.title), toText(c.body)]),
        ...(lesson.rigor?.callouts ?? []).flatMap((c) => [toText(c.title), toText(c.body)]),
        ...(lesson.intuition?.visualizations ?? []).flatMap((viz) => [toText(viz.title), toText(viz.caption)]),
        ...(lesson.math?.visualizations ?? []).flatMap((viz) => [toText(viz.title), toText(viz.caption)]),
        ...(lesson.rigor?.visualizations ?? []).flatMap((viz) => [toText(viz.title), toText(viz.caption)]),
        ...flattenStepLikeItems(lesson.examples),
        ...flattenStepLikeItems(lesson.challenges),
        ...(lesson.crossRefs ?? []).flatMap((ref) => [toText(ref.label), toText(ref.context)]),
        ...(lesson.searchKeywords ?? []),
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
        content,
      }
    })
  )

  const publicDir = resolve(root, 'public')
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true })

  writeFileSync(
    resolve(publicDir, 'search-index.json'),
    JSON.stringify({ documents }, null, 0)
  )

  console.log(`✓ Search index built: ${documents.length} lessons indexed`)
}

buildIndex().catch((e) => {
  console.error('Failed to build search index:', e.message)
  process.exit(1)
})
