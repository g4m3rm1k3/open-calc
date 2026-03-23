import { useState } from 'react'
import VizFrame from '../viz/VizFrame.jsx'
import Callout from '../ui/Callout.jsx'
import DynamicProof from './DynamicProof.jsx'
import { parseProse } from '../math/parseProse.jsx'

const TABS = [
  { id: 'intuition', label: '🧠 Intuition', description: 'Build the concept from first principles' },
  { id: 'math', label: '📐 Mathematics', description: 'Formal notation and theorems' },
  { id: 'rigor', label: '∴ Rigor', description: 'Proofs and epsilon-delta' },
]

function ProseParagraph({ text }) {
  return <p className="mb-4 leading-relaxed last:mb-0">{parseProse(text)}</p>
}

function normalizeProseParagraphs(paragraphs = []) {
  const merged = []

  for (const raw of paragraphs) {
    const current = String(raw ?? '').trim()
    if (!current) continue

    const isListLike = /^(?:\d+\.|[•*-])\s/.test(current)
    const isHeadingLike = current.startsWith('**')
    const words = current.split(/\s+/).filter(Boolean)
    const isTinyFragment = words.length <= 2 && current.length <= 18

    if (!isListLike && !isHeadingLike && isTinyFragment && merged.length > 0) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${current}`
      continue
    }

    merged.push(current)
  }

  return merged
}

function normalizeVideoTopic(title = '') {
  return String(title)
    .toLowerCase()
    .replace(/\btr-?\d+[a-z]?\b/g, ' ')
    .replace(/\b(calculus\s*i|kimberly|kim|dennis\s*f\.?\s*davis|3blue1brown|3b1b)\b/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function collectLegacyVizBlocks(data) {
  const visualizations = []

  if (data.visualizationId && !data.proofSteps?.length) {
    visualizations.push({ type: 'viz', id: data.visualizationId, props: data.visualizationProps ?? {} })
  }

  for (const v of data.visualizations ?? []) {
    const id = v.id ?? v.vizId
    if (!id) continue
    visualizations.push({ type: 'viz', ...v, id })
  }

  const grouped = []
  const topicBuckets = new Map()

  for (const v of visualizations) {
    if (v.id !== 'VideoEmbed') {
      grouped.push(v)
      continue
    }

    const title = v.title ?? 'Video'
    const url = v?.props?.url
    if (!url) {
      grouped.push(v)
      continue
    }

    const key = normalizeVideoTopic(title) || title.toLowerCase()
    if (!topicBuckets.has(key)) {
      topicBuckets.set(key, {
        title,
        caption: v.caption,
        mathBridge: v.mathBridge,
        videos: [],
      })
    }

    topicBuckets.get(key).videos.push({ title, url })
  }

  for (const bucket of topicBuckets.values()) {
    if (bucket.videos.length === 1) {
      grouped.push({
        type: 'viz',
        id: 'VideoEmbed',
        title: bucket.videos[0].title,
        props: { url: bucket.videos[0].url },
        caption: bucket.caption,
        mathBridge: bucket.mathBridge,
      })
      continue
    }

    grouped.push({
      type: 'viz',
      id: 'VideoCarousel',
      title: bucket.title,
      props: { videos: bucket.videos },
      caption: bucket.caption,
      mathBridge: bucket.mathBridge,
    })
  }

  return grouped
}

function buildLegacyFlowBlocks(data) {
  const paragraphs = normalizeProseParagraphs(data.prose ?? [])
  const callouts = [...(data.callouts ?? [])]
  const visualizations = collectLegacyVizBlocks(data)
  const blocks = []

  const slotCount = Math.max(paragraphs.length, 1)
  const vizBuckets = Array.from({ length: slotCount }, () => [])
  visualizations.forEach((viz, index) => {
    vizBuckets[index % slotCount].push(viz)
  })

  paragraphs.forEach((paragraph, idx) => {
    blocks.push({ type: 'prose', paragraphs: [paragraph] })

    if ((idx + 1) % 2 === 0 && callouts.length > 0) {
      blocks.push({ type: 'callout', ...callouts.shift() })
    }

    if (vizBuckets[idx]?.length) {
      blocks.push(vizBuckets[idx].shift())
    }
  })

  while (callouts.length > 0) {
    blocks.push({ type: 'callout', ...callouts.shift() })
  }

  for (const bucket of vizBuckets) {
    while (bucket.length > 0) {
      blocks.push(bucket.shift())
    }
  }

  return blocks
}

function SectionContent({ data }) {
  if (!data) return null

  // Build an ordered list of content blocks: prose paragraphs, then callouts, then vizzes.
  // If data.blocks is provided, use that ordering directly. Otherwise use legacy fields.
  const blocks = data.blocks ?? buildBlocks(data)

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.type === 'prose') {
          const normalized = normalizeProseParagraphs(block.paragraphs)
          return (
            <div key={i} className="prose-content text-slate-700 dark:text-slate-300">
              {normalized.map((p, j) => <ProseParagraph key={j} text={p} />)}
            </div>
          )
        }
        if (block.type === 'callout') return <Callout key={i} {...block} />
        if (block.type === 'proof') {
          return (
            <div key={i} className="my-6">
              <DynamicProof
                steps={block.steps ?? []}
                visualizationId={block.visualizationId}
                visualizationProps={block.visualizationProps ?? {}}
                title={block.title}
              />
            </div>
          )
        }
        if (block.type === 'viz') {
          return (
            <div key={i} className="my-6">
              {block.title && (
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{block.title}</p>
              )}
              <VizFrame id={block.id} initialProps={block.props ?? {}} />
              {block.caption && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic text-center">{block.caption}</p>
              )}
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

// Legacy: convert old-style {prose, callouts, visualizationId, visualizations} to blocks
function buildBlocks(data) {
  const blocks = []

  if (data.proofSteps?.length) {
    blocks.push({
      type: 'proof',
      title: data.title,
      steps: data.proofSteps,
      visualizationId: data.visualizationId,
      visualizationProps: data.visualizationProps ?? {},
    })
  }

  const legacyFlowBlocks = buildLegacyFlowBlocks(data)
  blocks.push(...legacyFlowBlocks)

  return blocks
}

function hasTabContent(section) {
  if (!section) return false
  if (Array.isArray(section.blocks) && section.blocks.length > 0) return true
  if (Array.isArray(section.proofSteps) && section.proofSteps.length > 0) return true
  if (Array.isArray(section.prose) && section.prose.length > 0) return true
  if (Array.isArray(section.callouts) && section.callouts.length > 0) return true
  if (Array.isArray(section.visualizations) && section.visualizations.length > 0) return true
  if (section.visualizationId) return true
  return false
}

export default function LayeredTabs({ lesson, activeTab, onTabChange }) {
  const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0]

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const hasContent = hasTabContent(lesson[tab.id])
          if (!hasContent) return null
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`tab-btn flex-shrink-0 ${activeTab === tab.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-4">{currentTab.description}</p>

      {/* Content */}
      <SectionContent data={lesson[activeTab]} />
    </div>
  )
}
