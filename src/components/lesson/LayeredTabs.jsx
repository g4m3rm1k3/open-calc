import { useState } from 'react'
import VizFrame from '../viz/VizFrame.jsx'
import Callout from '../ui/Callout.jsx'
import KatexBlock from '../math/KatexBlock.jsx'

const TABS = [
  { id: 'intuition', label: '🧠 Intuition', description: 'Build the concept from first principles' },
  { id: 'math', label: '📐 Mathematics', description: 'Formal notation and theorems' },
  { id: 'rigor', label: '∴ Rigor', description: 'Proofs and epsilon-delta' },
]

function ProseParagraph({ text }) {
  // Detect inline LaTeX: text between $ ... $
  if (!text.includes('\\') && !text.includes('$')) {
    return <p className="mb-4 leading-relaxed last:mb-0">{text}</p>
  }
  // Simple rendering: just show as text (inline LaTeX is already embedded in content as plain text)
  return <p className="mb-4 leading-relaxed last:mb-0">{text}</p>
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
          return (
            <div key={i} className="prose-content text-slate-700 dark:text-slate-300">
              {block.paragraphs.map((p, j) => <ProseParagraph key={j} text={p} />)}
            </div>
          )
        }
        if (block.type === 'callout') return <Callout key={i} {...block} />
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
  if (data.prose?.length) blocks.push({ type: 'prose', paragraphs: data.prose })
  for (const c of data.callouts ?? []) blocks.push({ type: 'callout', ...c })
  // Single legacy visualizationId
  if (data.visualizationId) blocks.push({ type: 'viz', id: data.visualizationId, props: data.visualizationProps ?? {} })
  // New visualizations array: [{id, props, title, caption}]
  for (const v of data.visualizations ?? []) blocks.push({ type: 'viz', ...v })
  return blocks
}

export default function LayeredTabs({ lesson, activeTab, onTabChange }) {
  const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0]

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const hasContent = lesson[tab.id]?.prose?.length > 0
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
