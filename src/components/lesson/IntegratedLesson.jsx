import React, { useState } from 'react'
import VizFrame from '../viz/VizFrame.jsx'
import Callout from '../ui/Callout.jsx'
import KatexInline from '../math/KatexInline.jsx'

function isLikelyInlineMath(expr) {
  const t = expr.trim()
  if (!t) return false
  if (/^\d+(?:[.,]\d+)?$/.test(t)) return false
  if (/^[\d,]+(?:\.\d+)?$/.test(t)) return false
  return /[\\^_{}=<>+\-*/()|]|\b(?:lim|sin|cos|tan|log|ln|sqrt|frac|Delta|varepsilon|theta|pi|int|sum|prod)\b/i.test(t)
}

function parseProse(text) {
  const parts = []
  let i = 0
  let keyIdx = 0;

  while (i < text.length) {
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2)
      if (end !== -1) {
        const boldText = text.slice(i + 2, end)
        parts.push(<strong key={`b${keyIdx++}`}>{boldText}</strong>)
        i = end + 2
        continue
      }
    }

    if (text[i] === '$') {
      const end = text.indexOf('$', i + 1)
      if (end !== -1) {
        const candidate = text.slice(i + 1, end)
        if (isLikelyInlineMath(candidate)) {
          parts.push(
            <span key={`k${keyIdx++}`} className="math-hover-trigger inline-block transition-colors hover:text-brand-600 cursor-default">
              <KatexInline expr={candidate} />
            </span>
          )
          i = end + 1
          continue
        }
      }
      parts.push('$')
      i += 1
      continue
    }

    const nextBold = text.indexOf('**', i)
    const nextDollar = text.indexOf('$', i)
    const next = [nextBold, nextDollar].filter((v) => v !== -1)
    const stop = next.length ? Math.min(...next) : text.length
    if (stop > i) {
      parts.push(<span key={`t${keyIdx++}`}>{text.slice(i, stop)}</span>)
    }
    i = stop
  }

  return parts.length > 0 ? parts : [text]
}

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

function buildBlocks(data) {
  const blocks = []
  if (data?.prose?.length) blocks.push({ type: 'prose', paragraphs: normalizeProseParagraphs(data.prose) })
  for (const c of data?.callouts ?? []) blocks.push({ type: 'callout', ...c })
  return blocks
}

function SectionContent({ data }) {
  if (!data) return null
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
        return null
      })}
    </div>
  )
}

function extractVizzes(lesson) {
  const vizzes = [];
  // Function to safely extract from a section
  const extractFromSection = (section) => {
    if (!section) return;
    if (section.visualizationId) {
       vizzes.push({ id: section.visualizationId, props: section.visualizationProps ?? {} });
    }
    if (section.visualizations) {
       vizzes.push(...section.visualizations);
    }
  };

  extractFromSection(lesson.hook);
  extractFromSection(lesson.intuition);
  extractFromSection(lesson.math);
  extractFromSection(lesson.rigor);

  // De-duplicate by ID
  const unique = [];
  const ids = new Set();
  for (const v of vizzes) {
    if (!ids.has(v.id)) {
      unique.push(v);
      ids.add(v.id);
    }
  }
  return unique;
}

export default function IntegratedLesson({ lesson }) {
  const [showMath, setShowMath] = useState(false);
  const [showRigor, setShowRigor] = useState(false);

  const allVizzes = extractVizzes(lesson);

  const hasMath = lesson.math?.prose?.length > 0;
  const hasRigor = lesson.rigor?.prose?.length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative">
      
      {/* Left Column: Flowing Text */}
      <div className="w-full lg:w-1/2 order-2 lg:order-1 flex flex-col gap-6 pb-20">
        
        {/* Intuition Block */}
        <div className="bg-surface rounded-xl p-6 border border-border shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🧠</span> Concept Intuition
          </h2>
          <SectionContent data={lesson.intuition} />
        </div>

        {/* Mathematics Stepped Disclosure */}
        {hasMath && (
          <div className="border border-brand-200 dark:border-brand-900 overflow-hidden rounded-xl shadow-sm transition-all">
            <button 
              onClick={() => setShowMath(!showMath)}
              className="w-full p-4 flex items-center justify-between bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors text-left"
            >
              <div className="font-bold flex items-center gap-2 text-brand-800 dark:text-brand-300">
                <span>📐</span> Level Up: Mathematics
              </div>
              <span className="text-xl text-brand-600">{showMath ? '↑' : '↓'}</span>
            </button>
            {showMath && (
              <div className="p-6 bg-surface border-t border-brand-100 dark:border-brand-900/50">
                <SectionContent data={lesson.math} />
              </div>
            )}
          </div>
        )}

        {/* Rigor Stepped Disclosure */}
        {hasRigor && (
          <div className="border border-purple-200 dark:border-purple-900 overflow-hidden rounded-xl shadow-sm transition-all">
            <button 
              onClick={() => setShowRigor(!showRigor)}
              className="w-full p-4 flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors text-left"
            >
              <div className="font-bold flex items-center gap-2 text-purple-800 dark:text-purple-300">
                <span>∴</span> Deep Dive: Formal Rigor
              </div>
              <span className="text-xl text-purple-600">{showRigor ? '↑' : '↓'}</span>
            </button>
            {showRigor && (
              <div className="p-6 bg-surface border-t border-purple-100 dark:border-purple-900/50">
                <SectionContent data={lesson.rigor} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Sticky Anchor Interactives */}
      <div className="w-full lg:w-1/2 order-1 lg:order-2 lg:sticky lg:top-8 flex flex-col gap-8">
        {allVizzes.length === 0 ? (
           <div className="p-8 border-2 border-dashed border-border rounded-xl text-center text-text-muted italic">
             No interactive visualizer available for this lesson.
           </div>
        ) : (
          allVizzes.map((viz, idx) => (
            <div key={idx} className="viz-anchor group relative">
              {viz.title && (
                <div className="absolute -top-3 left-4 bg-surface px-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 z-10 border border-brand-200 dark:border-brand-800 rounded">
                  {viz.title}
                </div>
              )}
              <div className="border border-border rounded-xl overflow-hidden bg-surface shadow-md">
                 <VizFrame id={viz.id} initialProps={viz.props ?? {}} />
              </div>
              {viz.caption && (
                <p className="text-xs text-text-muted mt-2 text-center px-4 leading-relaxed font-medium">
                  {viz.caption}
                </p>
              )}
            </div>
          ))
        )}
      </div>
      
    </div>
  )
}
