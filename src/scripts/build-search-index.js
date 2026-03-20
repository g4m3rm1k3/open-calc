#!/usr/bin/env node
// Build the Fuse.js search index from all lesson content
// Run: node src/scripts/build-search-index.js
// Called automatically before dev/build via npm scripts

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../..')

// Dynamically import content
async function buildIndex() {
  const { CURRICULUM } = await import('../content/index.js')

  const documents = CURRICULUM.flatMap((chapter) =>
    chapter.lessons.map((lesson) => {
      // Flatten all prose text from all three layers
      const allProse = [
        ...(lesson.intuition?.prose ?? []),
        ...(lesson.math?.prose ?? []),
        ...(lesson.rigor?.prose ?? []),
        ...(lesson.examples ?? []).flatMap((e) => [
          e.title,
          e.conclusion ?? '',
          ...(e.steps ?? []).map((s) => s.annotation ?? ''),
        ]),
        ...(lesson.challenges ?? []).map((c) => c.problem ?? ''),
      ].join(' ')

      return {
        id: lesson.id,
        slug: lesson.slug,
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        title: lesson.title,
        subtitle: lesson.subtitle,
        tags: (lesson.tags ?? []).join(' '),
        content: allProse,
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
