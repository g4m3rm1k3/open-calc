import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ChevronDown } from 'lucide-react'

// Matches the shape of the tutorial content files in ../tutorials/*.js —
// compact reference cards (title/icon/source + a few prose sections), not
// full interactive lessons. Keep new tutorials in that same format.
interface TutorialSection {
  heading: string
  prose: string[]
}
interface TutorialData {
  title: string
  icon: string
  source: string
  sections: TutorialSection[]
}

export default function TutorialCard({ data }: { data: TutorialData }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-semibold text-sm">
          <span className="text-lg">{data.icon}</span> {data.title}
        </span>
        <ChevronDown size={15} className={`text-slate-400 dark:text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-3">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">{data.source}</p>
          {data.sections.map((s) => (
            <div key={s.heading}>
              <h4 className="text-xs font-bold text-sky-500 dark:text-sky-400 mb-1">{s.heading}</h4>
              {s.prose.map((p, i) => (
                <div key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-1.5 [&_strong]:text-slate-900 dark:[&_strong]:text-slate-200">
                  <ReactMarkdown>{p}</ReactMarkdown>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
