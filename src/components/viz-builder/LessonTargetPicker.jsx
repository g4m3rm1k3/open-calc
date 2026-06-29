import { useState, useMemo } from 'react'
import { getAllChapters } from '../../courses/courseLoader.js'
import { VIZ_TARGET_SECTIONS } from './insertVizIntoLesson.js'

// Flat, searchable list of every lesson across every course — built once from
// the same structural tree the rest of the app uses (courseLoader.js), no
// content loading until a lesson is actually picked.
function useAllLessons() {
  return useMemo(() => {
    const chapters = getAllChapters()
    const out = []
    for (const ch of chapters) {
      for (const lesson of ch.lessons) {
        out.push({ chapterId: ch.number, chapterTitle: ch.title, course: ch.course, ...lesson })
      }
    }
    return out
  }, [])
}

export default function LessonTargetPicker({ onConfirm, onCancel }) {
  const allLessons = useAllLessons()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [sectionType, setSectionType] = useState('intuition')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allLessons.slice(0, 30)
    return allLessons
      .filter(l => l.title.toLowerCase().includes(q) || l.course.toLowerCase().includes(q) || l.slug.toLowerCase().includes(q))
      .slice(0, 30)
  }, [allLessons, query])

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setSelected(null) }}
        placeholder="Search lessons by title…"
        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-brand-400"
      />

      <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.length === 0 && (
          <p className="text-xs text-slate-400 px-3 py-3">No lessons match "{query}".</p>
        )}
        {filtered.map(l => (
          <button
            key={`${l.chapterId}/${l.slug}`}
            onClick={() => setSelected(l)}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              selected?.chapterId === l.chapterId && selected?.slug === l.slug
                ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="font-semibold">{l.title}</div>
            <div className="text-[11px] text-slate-400">{l.course} / {l.chapterTitle}</div>
          </button>
        ))}
      </div>

      {selected && (
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
            Insert into which section?
          </label>
          <div className="flex gap-2">
            {VIZ_TARGET_SECTIONS.map(s => (
              <button
                key={s.type}
                onClick={() => setSectionType(s.type)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  sectionType === s.type
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          disabled={!selected}
          onClick={() => selected && onConfirm(selected, sectionType)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
