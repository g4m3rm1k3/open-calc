import { useState } from 'react'
import BlockShell from '../BlockShell.jsx'

function TagInput({ value, onChange }) {
  const [raw, setRaw] = useState(value.join(', '))
  return (
    <input
      value={raw}
      onChange={e => { setRaw(e.target.value); onChange(e.target.value.split(',').map(t => t.trim()).filter(Boolean)) }}
      placeholder="comma separated tags"
      className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 outline-none"
    />
  )
}

export default function IdentityBlock({ meta, dispatch }) {
  const [editing, setEditing] = useState(false)
  const set = (key, value) => dispatch({ type: 'SET_META', key, value })

  const preview = (
    <div className="space-y-2">
      <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
        {meta.title || <span className="text-slate-300 dark:text-slate-600 italic">No title yet</span>}
      </h1>
      {meta.subtitle && <p className="text-slate-500 dark:text-slate-400 text-base">{meta.subtitle}</p>}
      <div className="flex flex-wrap gap-2 pt-1">
        {(meta.tags ?? []).map(t => (
          <span key={t} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs text-slate-600 dark:text-slate-300">{t}</span>
        ))}
        <span className="text-xs text-slate-400">⏱ {meta.timeToComplete} min</span>
        <span className="text-xs text-slate-400 font-mono">id: {meta.id || '—'} · slug: {meta.slug || '—'}</span>
      </div>
      {meta.coreConcept && <p className="text-sm text-slate-500 dark:text-slate-400 italic border-l-4 border-brand-200 dark:border-brand-800 pl-3">{meta.coreConcept}</p>}
    </div>
  )

  const editor = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title *</span>
          <input value={meta.title} onChange={e => set('title', e.target.value)} placeholder="What is a Vector?" className="field" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Subtitle</span>
          <input value={meta.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="A gentle introduction to..." className="field" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</span>
          <input value={meta.id} onChange={e => set('id', e.target.value)} placeholder="la1-001" className="field font-mono" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Slug</span>
          <input value={meta.slug} onChange={e => set('slug', e.target.value)} placeholder="what-is-a-vector" className="field font-mono" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Chapter (course id)</span>
          <input value={meta.chapter} onChange={e => set('chapter', e.target.value)} placeholder="la1" className="field font-mono" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Order</span>
          <input type="number" min={1} value={meta.order} onChange={e => set('order', Number(e.target.value))} className="field" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Time to complete (min)</span>
          <input type="number" min={1} value={meta.timeToComplete} onChange={e => set('timeToComplete', Number(e.target.value))} className="field" />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags (comma separated)</span>
        <TagInput value={meta.tags ?? []} onChange={v => set('tags', v)} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Core Concept</span>
        <input value={meta.coreConcept} onChange={e => set('coreConcept', e.target.value)} placeholder="One-sentence summary of the core idea" className="field" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Prerequisites (comma separated slugs)</span>
        <input
          value={(meta.prerequisites ?? []).join(', ')}
          onChange={e => set('prerequisites', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="what-is-a-vector, scalars-vs-vectors"
          className="field font-mono"
        />
      </label>
      <button
        onClick={() => setEditing(false)}
        className="mt-1 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg"
      >
        Done
      </button>
    </div>
  )

  return (
    <BlockShell label="Identity" icon="🪪" rigid isEditing={editing} onEdit={() => setEditing(true)}>
      <div onClick={!editing ? () => setEditing(true) : undefined} className={!editing ? 'cursor-pointer' : ''}>
        {editing ? editor : preview}
      </div>
    </BlockShell>
  )
}
