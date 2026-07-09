// ─── Concept Panel ────────────────────────────────────────────────────────────
// Shows the CS concept behind a selected block and how it connects to others.
// This is the "how code goes together" layer.

import { useMemo } from 'react'
import { blockDefinition, BLOCK_COLORS, summarizeBlock } from './blocks.ts'
import { findBlock } from './transpiler.ts'
import type { Block, GeneratedOutput, Project } from './types.ts'

interface Props {
  project: Project
  selectedBlockId: string | null
  generated: GeneratedOutput
}

// Walk all blocks in a file and return those whose concept.connects mentions the given type
function findRelated(blocks: Block[], targetType: string, result: Block[] = []): Block[] {
  for (const b of blocks) {
    if (b.id !== undefined) {
      const def = blockDefinition(b.type)
      if (def?.concept.connects.includes(targetType) && b.type !== targetType) {
        if (!result.find(r => r.id === b.id)) result.push(b)
      }
    }
    findRelated(b.children ?? [], targetType, result)
  }
  return result
}

// Collect all blocks of a specific type in a file
function blocksOfType(blocks: Block[], type: string, result: Block[] = []): Block[] {
  for (const b of blocks) {
    if (b.type === type) result.push(b)
    blocksOfType(b.children ?? [], type, result)
  }
  return result
}

// Find all child blocks and their first-level parents that reference selected block's class/function name
function findCallers(blocks: Block[], targetName: string, result: Block[] = []): Block[] {
  for (const b of blocks) {
    const fieldText = Object.values(b.fields ?? {}).join(' ')
    if (fieldText.includes(targetName) && b.type !== 'class' && b.type !== 'interface') {
      if (!result.find(r => r.id === b.id)) result.push(b)
    }
    findCallers(b.children ?? [], targetName, result)
  }
  return result
}

export default function ConceptPanel({ project, selectedBlockId, generated }: Props) {
  const allBlocks = project.files.flatMap(f => f.blocks)
  const block = useMemo(() => {
    for (const file of project.files) {
      const found = findBlock(file.blocks, selectedBlockId)
      if (found) return found
    }
    return null
  }, [project, selectedBlockId])

  const def = block ? blockDefinition(block.type) : null
  const concept = def?.concept
  const color = def ? BLOCK_COLORS[def.category] : '#475569'

  // Source map lines for this block
  const lines = block?.id ? generated.sourceMap[block.id] : undefined

  // Blocks that conceptually connect to this one
  const related = useMemo(() => {
    if (!def) return []
    return def.concept.connects.flatMap(type => blocksOfType(allBlocks, type))
  }, [def, allBlocks])

  // Blocks that reference this block's name (callers/users)
  const callers = useMemo(() => {
    if (!block) return []
    const name = block.fields?.name
    if (!name) return []
    return findCallers(allBlocks, name).filter(b => b.id !== block.id)
  }, [block, allBlocks])

  // Related conceptual types not yet in the project (suggestions)
  const missingTypes = useMemo(() => {
    if (!def) return []
    return def.concept.connects.filter(type =>
      blocksOfType(allBlocks, type).length === 0 && type !== block?.type
    )
  }, [def, allBlocks, block])

  if (!block || !def || !concept) {
    return (
      <div className="p-6 text-center">
        <div className="text-sm text-slate-400 mb-2 font-semibold">How Code Goes Together</div>
        <div className="text-xs text-slate-500 leading-relaxed">
          Select any block in the Program panel to see its concept, why it exists, and how it connects to the rest of your code.
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          {['class', 'interface', 'method', 'variable'].map(type => {
            const d = blockDefinition(type)
            if (!d) return null
            return (
              <div key={type} className="text-left p-2.5 rounded-lg border border-slate-700/50 bg-slate-800/30">
                <div className="text-[11px] font-bold mb-1" style={{ color: BLOCK_COLORS[d.category] }}>{d.label}</div>
                <div className="text-[10px] text-slate-500 leading-relaxed">{d.concept.summary}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0 overflow-y-auto">

      {/* Block header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ background: `${color}22`, color }}
          >
            {def.label}
          </span>
          {def.tsOnly && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
              TS only
            </span>
          )}
        </div>
        <code className="text-xs text-slate-300 font-mono">{summarizeBlock(block)}</code>
      </div>

      {/* Concept explanation */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">What it is</div>
        <p className="text-xs text-slate-300 leading-relaxed">{concept.summary}</p>
      </div>

      <div className="px-4 py-3 border-b border-slate-700/50">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Why it exists</div>
        <p className="text-xs text-slate-400 leading-relaxed">{concept.why}</p>
      </div>

      {/* Code example */}
      {concept.example && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Example</div>
          <pre className="text-[11px] font-mono text-sky-300 bg-slate-900/60 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
            {concept.example}
          </pre>
        </div>
      )}

      {/* Generated code location */}
      {lines && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Generated code</div>
          <div className="text-[11px] font-mono text-slate-400">
            Lines {lines[0] + 1}–{lines[1] + 1} in the output
          </div>
          <pre className="mt-2 text-[11px] font-mono text-emerald-400 bg-slate-900/60 rounded-lg p-3 whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {generated.code.split('\n').slice(lines[0], lines[1] + 1).join('\n')}
          </pre>
        </div>
      )}

      {/* Blocks in this project that connect to it */}
      {(related.length > 0 || callers.length > 0) && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Connections in your project</div>
          <div className="flex flex-wrap gap-1.5">
            {[...related, ...callers].filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i).map(b => {
              const bd = blockDefinition(b.type)
              const bc = bd ? BLOCK_COLORS[bd.category] : '#475569'
              return (
                <span
                  key={b.id}
                  className="text-[10px] font-mono px-2 py-1 rounded-lg border"
                  style={{ background: `${bc}15`, color: bc, borderColor: `${bc}30` }}
                >
                  {summarizeBlock(b)}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Suggestions — concept types not yet in project */}
      {missingTypes.length > 0 && (
        <div className="px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">You could also add</div>
          <div className="space-y-1.5">
            {missingTypes.map(type => {
              const bd = blockDefinition(type)
              if (!bd) return null
              const bc = BLOCK_COLORS[bd.category]
              return (
                <div key={type} className="flex items-start gap-2">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                    style={{ background: `${bc}20`, color: bc }}
                  >
                    {bd.label}
                  </span>
                  <span className="text-[11px] text-slate-500 leading-relaxed">{bd.concept.summary}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
