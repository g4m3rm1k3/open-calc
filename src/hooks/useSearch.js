import Fuse from 'fuse.js'
import { useState, useEffect, useMemo, useRef } from 'react'
import { ALL_LESSONS } from '../content/index.js'

const QUERY_SYNONYMS = {
  'rate of change': ['derivative', 'slope', 'dy/dx'],
  slope: ['derivative', 'rate of change'],
  derivative: ['dy/dx', 'instantaneous rate of change', 'tangent line'],
  integral: ['antiderivative', 'area under curve', 'accumulation'],
  antiderivative: ['integral', 'reverse derivative'],
  continuity: ['continuous', 'discontinuous'],
  limit: ['approach', 'as x approaches'],
  'epsilon delta': ['formal limit proof', 'epsilon-delta'],
  optimization: ['maximize', 'minimize', 'best value'],
  'related rates': ['word problem', 'changing over time'],
  trig: ['trigonometric', 'sine', 'cosine', 'tangent'],
  exponential: ['growth', 'decay', 'logarithm', 'ln'],
  logarithm: ['log', 'ln', 'exponential'],
  parametric: ['x(t)', 'y(t)', 'parameterized curve'],
  polar: ['r(theta)', 'polar coordinates', 'cardioid', 'rose curve'],
  assignment: ['homework', 'quiz', 'exam', 'practice problems'],
  homework: ['assignment', 'practice problems'],
  proof: ['rigor', 'theorem', 'formal proof', 'show that'],
  'visual proof': ['geometric proof', 'diagram proof', 'proof by picture'],
  application: ['real world', 'engineering', 'physics', 'economics', 'biology', 'computer science'],
  'computer science': ['algorithm', 'numerical method', 'optimization', 'gradient'],
  biology: ['population growth', 'pharmacokinetics', 'logistic model', 'diffusion'],
  economics: ['marginal cost', 'consumer surplus', 'producer surplus', 'optimization'],
  engineering: ['work', 'signal', 'control', 'rate of change'],
  physics: ['velocity', 'acceleration', 'energy', 'motion', 'force'],
  exam: ['midterm', 'final', 'test prep', 'practice'],
  'step by step': ['worked example', 'walkthrough', 'show steps'],
}

function expandQuery(rawQuery) {
  const normalized = rawQuery.trim().toLowerCase().replace(/[^a-z0-9\s/()^.-]/g, ' ')
  if (!normalized) return ''

  const terms = new Set([normalized])
  const compact = normalized.replace(/\s+/g, ' ')
  terms.add(compact)

  Object.entries(QUERY_SYNONYMS).forEach(([needle, expansions]) => {
    if (compact.includes(needle)) {
      expansions.forEach((term) => terms.add(term))
    }
  })

  if (compact.includes('dy/dx') || compact.includes('dydx')) {
    terms.add('derivative')
    terms.add('slope')
  }

  if (compact.includes('u-sub') || compact.includes('u substitution')) {
    terms.add('substitution')
    terms.add('integral')
  }

  if (compact.includes('calc 2') || compact.includes('calculus 2')) {
    terms.add('series')
    terms.add('convergence')
    terms.add('power series')
    terms.add('taylor')
    terms.add('polar')
    terms.add('parametric')
  }

  return Array.from(terms).join(' ')
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [isReady, setIsReady] = useState(false)
  const fuseRef = useRef(null)
  const docsRef = useRef([])

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}search-index.json`)
      .then((r) => r.json())
      .then((data) => {
        docsRef.current = data.documents
        fuseRef.current = new Fuse(data.documents, {
          keys: [
            { name: 'title', weight: 4 },
            { name: 'subtitle', weight: 2 },
            { name: 'aliases', weight: 2 },
            { name: 'tags', weight: 2 },
            { name: 'assignment', weight: 2 },
            { name: 'proofs', weight: 1.5 },
            { name: 'applications', weight: 1.5 },
            { name: 'content', weight: 1 },
          ],
          includeMatches: true,
          threshold: 0.3,
          minMatchCharLength: 2,
          ignoreLocation: true,
        })
        setIsReady(true)
      })
      .catch(() => {
        // Search index not yet built — fall back to an in-memory index from ALL_LESSONS
        const fallbackDocs = ALL_LESSONS.map((l) => ({
          id: l.id,
          title: l.title ?? '',
          subtitle: l.subtitle ?? '',
          tags: l.tags ?? [],
          slug: l.slug ?? '',
          chapterNumber: l.chapterNumber ?? l.chapter,
          aliases: l.aliases ?? [],
          content: '',
        }))
        docsRef.current = fallbackDocs
        fuseRef.current = new Fuse(fallbackDocs, {
          keys: [
            { name: 'title', weight: 4 },
            { name: 'subtitle', weight: 2 },
            { name: 'aliases', weight: 2 },
            { name: 'tags', weight: 2 },
          ],
          includeMatches: true,
          threshold: 0.3,
          minMatchCharLength: 2,
          ignoreLocation: true,
        })
        setIsReady(true)
      })
  }, [])

  const results = useMemo(() => {
    if (!fuseRef.current || query.length < 2) return []
    return fuseRef.current.search(expandQuery(query)).slice(0, 15)
  }, [query, isReady])

  return { query, setQuery, results, isReady }
}
