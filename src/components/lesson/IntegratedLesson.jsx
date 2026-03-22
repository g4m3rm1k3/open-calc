import React, { useState } from 'react'
import VizFrame from '../viz/VizFrame.jsx'
import Callout from '../ui/Callout.jsx'
import StepThrough from './StepThrough.jsx'
export { parseProse } from '../math/parseProse.jsx'
import { parseProse } from '../math/parseProse.jsx'

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
        if (block.type === 'stepthrough') return <StepThrough key={i} {...block} />
        return null
      })}
    </div>
  )
}

// Normalize a visualization entry — supports both {id:...} and legacy {vizId:...} keys
function normalizeViz(v) {
  if (!v) return null
  const id = v.id ?? v.vizId
  if (!id) return null
  return { id, props: v.props ?? v.visualizationProps ?? {}, title: v.title, caption: v.caption }
}

function extractVizzes(lesson) {
  const vizzes = [];
  const extractFromSection = (section) => {
    if (!section) return;
    if (section.visualizationId) {
       vizzes.push({ id: section.visualizationId, props: section.visualizationProps ?? {} });
    }
    for (const v of section.visualizations ?? []) {
      const norm = normalizeViz(v)
      if (norm) vizzes.push(norm)
    }
  };

  extractFromSection(lesson.hook);
  extractFromSection(lesson.intuition);
  extractFromSection(lesson.math);
  extractFromSection(lesson.rigor);

  // De-duplicate by ID + props (allows multiple VideoEmbed with different URLs)
  const unique = [];
  const seen = new Set();
  for (const v of vizzes) {
    const key = `${v.id}:${JSON.stringify(v.props ?? {})}`;
    if (!seen.has(key)) {
      unique.push(v);
      seen.add(key);
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
      <div className="w-full lg:w-1/2 order-1 lg:order-2 lg:sticky lg:top-8 flex flex-col gap-8 min-w-0">
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
              <div className="border border-border rounded-xl overflow-x-auto bg-surface shadow-md w-full">
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
