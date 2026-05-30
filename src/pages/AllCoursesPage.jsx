import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { COURSES, CURRICULUM } from '../content/index.js'
import { useProgress } from '../hooks/useProgress.js'
import StemOrbBackground from '../components/courses/StemOrbBackground.jsx'

// Math / science unicode symbols for each course cover
const COURSE_ICONS = {
  'precalc':              'ƒ(x)',
  'geometry':             '△',
  'calc':                 '∫',
  'physics-1':            'Φ',
  'discrete':             '∧',
  'web-1':                '</>',
  'linear-algebra':       'Ax',
  'python-1':             'λ',
  'data-science-1':       'Σ',
  'javascript-core':      '⟨/⟩',
  'tetris':               '⊞',
  'cs-1':                 '⊕',
  'chemistry-1':          '⚗',
  'digital-fundamentals': '01',
  'cnc-logic':            '⚙',
  'git-0':                '⑂',
  'dsa-1':                'Ω',
  'dp-1':                 '◈',
  'design-1':             '⬡',
  'three-js-1':           '∇',
  'three-js-2':           '∇',
  'ai-engineering':       '⟁',
  'canvas-1':             '⬤',
  'gcode-parser-1':       'G0',
  'sql-0':                'SELECT',
  'sql-1':                'SQL',
  'nosql-1':              '{}',
  'applied-statistics':   'μ',
  'cli-0':                '$_',
  'cpp':                  'C++',
}

const CARD_META = {
  indigo:  { cover: 'from-indigo-600 via-indigo-700 to-violet-800',    glow: '0 20px 50px -8px rgba(99,102,241,0.55)',   accent: '#818cf8' },
  blue:    { cover: 'from-blue-600 via-blue-700 to-indigo-800',         glow: '0 20px 50px -8px rgba(59,130,246,0.55)',   accent: '#60a5fa' },
  emerald: { cover: 'from-emerald-600 via-emerald-700 to-teal-800',     glow: '0 20px 50px -8px rgba(16,185,129,0.55)',   accent: '#34d399' },
  red:     { cover: 'from-red-500 via-red-600 to-rose-800',             glow: '0 20px 50px -8px rgba(239,68,68,0.55)',    accent: '#f87171' },
  purple:  { cover: 'from-purple-600 via-purple-700 to-violet-900',     glow: '0 20px 50px -8px rgba(168,85,247,0.55)',   accent: '#c084fc' },
  orange:  { cover: 'from-orange-500 via-orange-600 to-red-700',        glow: '0 20px 50px -8px rgba(249,115,22,0.55)',   accent: '#fb923c' },
  teal:    { cover: 'from-teal-500 via-teal-600 to-cyan-700',           glow: '0 20px 50px -8px rgba(20,184,166,0.55)',   accent: '#2dd4bf' },
  amber:   { cover: 'from-amber-500 via-amber-600 to-orange-700',       glow: '0 20px 50px -8px rgba(245,158,11,0.55)',   accent: '#fbbf24' },
  sky:     { cover: 'from-sky-500 via-sky-600 to-blue-700',             glow: '0 20px 50px -8px rgba(14,165,233,0.55)',   accent: '#38bdf8' },
  cyan:    { cover: 'from-cyan-500 via-cyan-600 to-blue-700',           glow: '0 20px 50px -8px rgba(6,182,212,0.55)',    accent: '#22d3ee' },
  rose:    { cover: 'from-rose-500 via-rose-600 to-pink-800',           glow: '0 20px 50px -8px rgba(244,63,94,0.55)',    accent: '#fb7185' },
  pink:    { cover: 'from-pink-500 via-pink-600 to-rose-800',           glow: '0 20px 50px -8px rgba(236,72,153,0.55)',   accent: '#f472b6' },
  violet:  { cover: 'from-violet-600 via-violet-700 to-purple-900',     glow: '0 20px 50px -8px rgba(124,58,237,0.55)',   accent: '#a78bfa' },
  lime:    { cover: 'from-lime-500 via-lime-600 to-green-700',          glow: '0 20px 50px -8px rgba(132,204,22,0.55)',   accent: '#a3e635' },
  slate:   { cover: 'from-slate-500 via-slate-600 to-slate-800',        glow: '0 20px 50px -8px rgba(100,116,139,0.55)',  accent: '#94a3b8' },
  fuchsia: { cover: 'from-fuchsia-500 via-fuchsia-600 to-purple-800',   glow: '0 20px 50px -8px rgba(217,70,239,0.55)',   accent: '#e879f9' },
  green:   { cover: 'from-green-600 via-green-700 to-emerald-800',      glow: '0 20px 50px -8px rgba(34,197,94,0.55)',    accent: '#4ade80' },
}

const GRID_TEXTURE = 'repeating-linear-gradient(0deg,transparent,transparent 11px,rgba(255,255,255,0.8) 11px,rgba(255,255,255,0.8) 12px),repeating-linear-gradient(90deg,transparent,transparent 11px,rgba(255,255,255,0.8) 11px,rgba(255,255,255,0.8) 12px)'

export default function AllCoursesPage() {
  const { getLessonStatus } = useProgress()

  useEffect(() => {
    document.title = 'All Courses — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  return (
    <div className="relative min-h-screen">
      <StemOrbBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-[8px] border border-indigo-400/30 bg-indigo-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-indigo-200 backdrop-blur-md">
            Curriculum
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 text-white">All Courses</h1>
          <p className="text-slate-300/80 max-w-xl leading-relaxed">
            {COURSES.length} courses across math, science &amp; engineering.{' '}
            <span className="text-indigo-300 font-semibold">Pick up where you left off.</span>
          </p>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {COURSES.map((course) => {
            const chapters = CURRICULUM.filter(ch => ch.course === course.key)
            const totalLessons = chapters.reduce((s, ch) => s + ch.lessons.length, 0)
            const completedLessons = chapters.reduce((s, ch) =>
              s + ch.lessons.filter(l =>
                getLessonStatus(l.id, l.checkpoints?.length ?? 1) === 'complete'
              ).length
            , 0)
            const pct  = totalLessons > 0 ? completedLessons / totalLessons : 0
            const meta = CARD_META[course.color] ?? CARD_META.slate
            const icon = COURSE_ICONS[course.key] ?? '◈'

            return (
              <Link
                key={course.key}
                to={course.path}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = meta.glow }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '' }}
                className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-300
                  shadow-[0_4px_20px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.2)]
                  hover:-translate-y-2"
              >
                {/* Book cover — gradient top */}
                <div className={`relative bg-gradient-to-br ${meta.cover} px-5 pt-5 pb-5 overflow-hidden`}>
                  {/* Gloss sheen */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/12 to-transparent pointer-events-none" />
                  {/* Subtle grid emboss */}
                  <div className="absolute inset-0 opacity-[0.055] pointer-events-none" style={{ backgroundImage: GRID_TEXTURE }} />
                  <div className="relative">
                    <div className="text-3xl font-black text-white/65 mb-2 font-mono leading-none tracking-tight">
                      {icon}
                    </div>
                    <div className="font-bold text-[17px] text-white leading-tight drop-shadow">
                      {course.label}
                    </div>
                  </div>
                </div>

                {/* Spine edge */}
                <div className="h-[3px] bg-gradient-to-r from-black/30 via-black/10 to-black/30" />

                {/* Page body */}
                <div
                  className="flex-1 flex flex-col bg-[#e8e2d5] dark:bg-[#0d0d18] px-4 pt-4 pb-4"
                  style={{ boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.09)' }}
                >
                  <p className="text-sm text-stone-600 dark:text-slate-400 leading-snug flex-1 mb-3">
                    {course.desc}
                  </p>

                  {/* Progress */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center text-[10px] text-stone-400 dark:text-slate-500 mb-1.5">
                      <span>
                        {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
                        {totalLessons > 0 && ` · ${totalLessons} lessons`}
                      </span>
                      {completedLessons > 0 && (
                        <span className="font-bold" style={{ color: meta.accent }}>
                          {Math.round(pct * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 rounded-full bg-stone-300/60 dark:bg-slate-700/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${meta.cover} transition-all`}
                        style={{ width: pct > 0 ? `${Math.max(4, pct * 100)}%` : '0%' }}
                      />
                    </div>
                  </div>

                  {/* CTA arrow */}
                  <div className="flex justify-end mt-1">
                    <span
                      className="text-[11px] font-black opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0"
                      style={{ color: meta.accent }}
                    >
                      {pct > 0 ? 'Continue →' : 'Start →'}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

