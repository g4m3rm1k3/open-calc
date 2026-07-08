import { Link } from 'react-router-dom'
import { getAllCourses, getChapters } from '../courses/courseLoader.js'
import { useProgress } from '../hooks/useProgress.js'
import { buildProgressKey } from '../context/progressMigration.ts'
import UniverseBackground from '../components/backgrounds/UniverseBackground.jsx'
import AppCard from '../components/ui/AppCard.jsx'
import { LABS } from '../labs/registry.js'
import { GAMES } from '../games/registry.js'
import { usePins } from '../context/PinsContext.jsx'
import { usePinLauncher } from '../hooks/usePinLauncher.js'
import { GLASS_META } from '../styles/courseColors.js'

// ── Favourite pin card — pins are a slimmer shape than AppCard expects, so
// render them with the same glass palette rather than forcing them through AppCard.
function FavouriteCard({ pin, onOpen, onRemove }) {
  const meta = GLASS_META[pin.color] ?? GLASS_META.slate
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }}
      className={`group relative flex flex-col items-start gap-2 p-4 rounded-2xl text-left cursor-pointer transition-all hover:-translate-y-1 bg-gradient-to-br ${meta.header} border ${meta.border} text-white shadow-md hover:shadow-lg dark:shadow-none overflow-hidden`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        title="Remove from Favourites"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/60 hover:text-white transition-all text-xs leading-none w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 z-10"
      >
        ✕
      </button>
      <span className="text-2xl leading-none">{pin.emoji}</span>
      <span className="text-sm font-bold leading-tight drop-shadow-sm pr-4">{pin.label}</span>
    </div>
  )
}

// ── Labs registry split by kind ──────────────────────────────────────────────
const LAB_SUBJECTS = ['Math', 'Science', 'Engineering', 'CS Theory', 'Data Science', 'Web Dev', 'Creative']
const LABS_BY_KIND = {
  lab:        LABS.filter(l => l.kind === 'lab'),
  lesson:     LABS.filter(l => l.kind === 'lesson'),
  builder:    LABS.filter(l => l.kind === 'builder'),
  visualizer: LABS.filter(l => l.kind === 'visualizer'),
}

// ── Discipline pills ──────────────────────────────────────────────────────────
const DISCIPLINES_ROW1 = [
  { label:'Mathematics',  emoji:'∫',  col:'border-indigo-200 text-indigo-700 bg-indigo-50 dark:border-indigo-400/40 dark:text-indigo-200 dark:bg-indigo-900/30'   },
  { label:'Physics',      emoji:'Φ',  col:'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-400/40 dark:text-blue-200 dark:bg-blue-900/30'         },
  { label:'Chemistry',    emoji:'⚗', col:'border-cyan-200 text-cyan-700 bg-cyan-50 dark:border-cyan-400/40 dark:text-cyan-200 dark:bg-cyan-900/30'         },
  { label:'Biology',      emoji:'🧬', col:'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-400/40 dark:text-emerald-200 dark:bg-emerald-900/30'},
  { label:'Robotics',     emoji:'🤖', col:'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-400/40 dark:text-orange-200 dark:bg-orange-900/30'   },
  { label:'Astronomy',    emoji:'🔭', col:'border-violet-200 text-violet-700 bg-violet-50 dark:border-violet-400/40 dark:text-violet-200 dark:bg-violet-900/30'   },
]
const DISCIPLINES_ROW2 = [
  { label:'Computer Science',       emoji:'⊕',  col:'border-purple-200 text-purple-700 bg-purple-50 dark:border-purple-400/40 dark:text-purple-200 dark:bg-purple-900/30'   },
  { label:'Data Science',           emoji:'Σ',  col:'border-sky-200 text-sky-700 bg-sky-50 dark:border-sky-400/40 dark:text-sky-200 dark:bg-sky-900/30'            },
  { label:'AI & Machine Learning',  emoji:'⟁',  col:'border-rose-200 text-rose-700 bg-rose-50 dark:border-rose-400/40 dark:text-rose-200 dark:bg-rose-900/30'         },
  { label:'Engineering',            emoji:'⚙', col:'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-400/40 dark:text-amber-200 dark:bg-amber-900/30'      },
  { label:'Linear Algebra',         emoji:'Ax', col:'border-teal-200 text-teal-700 bg-teal-50 dark:border-teal-400/40 dark:text-teal-200 dark:bg-teal-900/30'         },
  { label:'3D & Graphics',          emoji:'∇',  col:'border-fuchsia-200 text-fuchsia-700 bg-fuchsia-50 dark:border-fuchsia-400/40 dark:text-fuchsia-200 dark:bg-fuchsia-900/30'},
]

// ── Domain visual config ──────────────────────────────────────────────────────
const DOMAIN_META = {
  math:        { label:'Mathematics',                    icon:'∑',  desc:'From pre-calculus through calculus, geometry, discrete math, linear algebra & statistics', headCol:'text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/35' },
  science:     { label:'Natural Sciences',               icon:'⚛',  desc:'Physics mechanics, waves, electricity · Chemistry elements, reactions & molecular structure', headCol:'text-cyan-600 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/35' },
  cs:          { label:'Computer Science & Programming', icon:'⌨',  desc:'Python, JavaScript, web systems, algorithms, data structures & computational thinking', headCol:'text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/35' },
  engineering: { label:'Engineering & Hardware',         icon:'⚙',  desc:'Digital logic, CNC machining, G-code, C++ from zero to software engineer', headCol:'text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-500/35' },
  data:        { label:'Data, AI & Databases',           icon:'⟁',  desc:'NumPy, Pandas, ML foundations, LLMs, SQL, NoSQL & applied statistics', headCol:'text-violet-600 dark:text-violet-300 border-violet-200 dark:border-violet-500/35' },
  creative:    { label:'Creative Technology',            icon:'∇',  desc:'3D graphics & WebGL, game dev, HTML Canvas, design systems, Git & command line', headCol:'text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-500/35' },
}
const DOMAIN_ORDER = ['math', 'science', 'cs', 'engineering', 'data', 'creative']

// ── Build course entries from loader ─────────────────────────────────────────
const ALL_COURSES = getAllCourses()
const COURSE_ENTRIES = ALL_COURSES
  .map(course => ({ course, chapters: getChapters(course.key) }))
  .filter(({ chapters }) => chapters.length > 0)

const DOMAINS = DOMAIN_ORDER
  .map(key => ({
    key,
    ...DOMAIN_META[key],
    entries: COURSE_ENTRIES.filter(({ course }) => course.domain === key),
  }))
  .filter(d => d.entries.length > 0)

// ── Domain section ────────────────────────────────────────────────────────────
function DomainSection({ domain, getLessonStatus }) {
  const [iconColor, borderColor] = domain.headCol.split(' ')
  const { entries } = domain
  if (!entries?.length) return null
  return (
    <div className="mb-14">
      <div className={`flex items-center gap-3 mb-5 pb-3 border-b ${borderColor}`}>
        <span className={`text-3xl font-mono font-black leading-none ${iconColor}`}>{domain.icon}</span>
        <div>
          <h3 className={`text-lg font-bold leading-tight ${iconColor}`}>{domain.label}</h3>
          <p className="text-slate-500 text-xs mt-0.5">{domain.desc}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {entries.map(({ course, chapters }) => (
          <AppCard key={course.key} item={course} variant="course" chapters={chapters} getLessonStatus={getLessonStatus} />
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { getLessonStatus } = useProgress()
  const { pins, removePin } = usePins()
  const { openPin } = usePinLauncher()
  const totalLessons     = COURSE_ENTRIES.reduce((s, { chapters }) => s + chapters.reduce((n, ch) => n + ch.lessons.length, 0), 0)
  const completedLessons = COURSE_ENTRIES.reduce((s, { course, chapters }) =>
    s + chapters.reduce((n, ch) =>
      n + ch.lessons.filter(l => getLessonStatus(buildProgressKey(course.key, l), 1) === 'complete').length, 0), 0)

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />

      <div className="relative z-10">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="min-h-[88vh] flex flex-col items-center justify-center text-center px-4 py-20">
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {DISCIPLINES_ROW1.map(d => (
              <span key={d.label} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${d.col}`}>
                <span className="text-sm leading-none">{d.emoji}</span>{d.label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {DISCIPLINES_ROW2.map(d => (
              <span key={d.label} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${d.col}`}>
                <span className="text-sm leading-none">{d.emoji}</span>{d.label}
              </span>
            ))}
          </div>

          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tight leading-none mb-5">
            <span
              className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-violet-500 dark:from-indigo-300 dark:via-cyan-200 dark:to-violet-300 bg-clip-text text-transparent"
              style={{ filter:'drop-shadow(0 0 40px rgba(99,102,241,0.45))' }}
            >
              UpSkillOS
            </span>
          </h1>

          <p className="text-slate-700 dark:text-slate-300 text-xl sm:text-2xl font-light max-w-3xl leading-relaxed mb-3">
            Master the universe of human knowledge.
          </p>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
            Calculus → Quantum Mechanics · Python → AI Systems · Chemistry → Molecular Biology ·
            C++ → Robotics. Built in your browser. Free forever.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['Free Forever','Open Source','Runs in Browser','No Install Required','MIT License'].map(b => (
              <span key={b} className="rounded-full border border-slate-200 bg-white/40 dark:border-white/10 dark:bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 backdrop-blur-md">{b}</span>
            ))}
          </div>

          {completedLessons > 0 && (
            <div className="group relative inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 dark:border-emerald-400/20 dark:bg-emerald-400/10 backdrop-blur-xl px-6 py-3 text-sm mb-10 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:scale-105 cursor-default">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <div className="relative flex items-center gap-3 z-10">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                </div>
                <span className="font-bold text-emerald-800 dark:text-emerald-200 tracking-wide">
                  <span className="text-emerald-600 dark:text-emerald-400 text-base">{completedLessons}</span> / {totalLessons} LESSONS COMPLETED
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-1 text-slate-600 animate-bounce">
            <span className="text-xs tracking-widest uppercase">Explore</span>
            <span className="text-xl">↓</span>
          </div>
        </section>

        {/* ── FAVOURITES ───────────────────────────────────────────────────── */}
        {pins.length > 0 && (
          <section className="px-4 pb-6">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-amber-200 dark:border-amber-500/30">
              <span className="text-3xl leading-none">⭐</span>
              <div>
                <h3 className="text-lg font-bold text-amber-600 dark:text-amber-300">Favourites</h3>
                <p className="text-slate-500 text-xs">Pinned from the Start Menu — right-click any item there to pin or unpin</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pins.map(pin => (
                <FavouriteCard key={pin.id} pin={pin} onOpen={() => openPin(pin)} onRemove={() => removePin(pin.id)} />
              ))}
            </div>
          </section>
        )}

        {/* ── COURSES ──────────────────────────────────────────────────────── */}
        <section className="px-4 pb-6">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 dark:border-indigo-500/30 dark:bg-indigo-900/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300 backdrop-blur-sm mb-4">
              <span>📚</span> Curriculum
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {ALL_COURSES.length}+ courses across every domain
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base mt-2">Structured paths from first principles to mastery</p>
          </div>
          {DOMAINS.map(domain => (
            <DomainSection key={domain.key} domain={domain} getLessonStatus={getLessonStatus} />
          ))}
        </section>

        {/* ── LESSONS ──────────────────────────────────────────────────────── */}
        <section className="px-4 pb-6 mt-4">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-emerald-200 dark:border-emerald-500/30">
            <span className="text-3xl leading-none">🎓</span>
            <div>
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-300">Guided Lessons</h3>
              <p className="text-slate-500 text-xs">Narrated, checkpointed walkthroughs — follow along step by step</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {LABS_BY_KIND.lesson.map(item => <AppCard key={item.key} item={item} variant="lab" />)}
          </div>
        </section>

        {/* ── LABS ─────────────────────────────────────────────────────────── */}
        <section className="px-4 pb-6 mt-4">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-cyan-200 dark:border-cyan-500/30">
            <span className="text-3xl leading-none">🔬</span>
            <div>
              <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-300">Interactive Labs</h3>
              <p className="text-slate-500 text-xs">Full simulation & computation environments — experiment and explore</p>
            </div>
          </div>
          {LAB_SUBJECTS.map(subject => {
            const items = LABS_BY_KIND.lab.filter(l => l.subject === subject)
            if (items.length === 0) return null
            return (
              <div key={subject} className="mb-8 last:mb-0">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{subject}</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map(item => <AppCard key={item.key} item={item} variant="lab" />)}
                </div>
              </div>
            )
          })}
        </section>

        {/* ── BUILDERS ─────────────────────────────────────────────────────── */}
        <section className="px-4 pb-6 mt-4">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-orange-200 dark:border-orange-500/30">
            <span className="text-3xl leading-none">🏗️</span>
            <div>
              <h3 className="text-lg font-bold text-orange-600 dark:text-orange-300">Builders</h3>
              <p className="text-slate-500 text-xs">Creative tools for making something real — drag, draw, and compose</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {LABS_BY_KIND.builder.map(item => <AppCard key={item.key} item={item} variant="lab" />)}
          </div>
        </section>

        {/* ── VISUALIZERS ──────────────────────────────────────────────────── */}
        <section className="px-4 pb-6 mt-4">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-violet-200 dark:border-violet-500/30">
            <span className="text-3xl leading-none">🔍</span>
            <div>
              <h3 className="text-lg font-bold text-violet-600 dark:text-violet-300">Visualizers</h3>
              <p className="text-slate-500 text-xs">Point these at code or a mechanism and watch it run, step by step</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {LABS_BY_KIND.visualizer.map(item => <AppCard key={item.key} item={item} variant="lab" />)}
          </div>
        </section>

        {/* ── GAMES ────────────────────────────────────────────────────────── */}
        <section className="px-4 pt-6 pb-10 mt-4">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-fuchsia-200 dark:border-fuchsia-500/30">
            <span className="text-3xl leading-none">🎮</span>
            <div>
              <h3 className="text-lg font-bold text-fuchsia-600 dark:text-fuchsia-300">STEM Games</h3>
              <p className="text-slate-500 text-xs">Learn through play — real math and science behind every mechanic</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {GAMES.map(item => <AppCard key={item.key} item={item} variant="game" />)}
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-slate-200 dark:border-white/5 px-4 py-8 text-center text-xs text-slate-600 mt-4">
          <p>
            UpSkillOS is free, open source, and runs entirely in your browser.{' '}
            <Link to="/about" className="text-indigo-400 hover:text-indigo-300 hover:underline">Learn more</Link>
            {' · '}
            <Link to="/reference" className="text-indigo-400 hover:text-indigo-300 hover:underline">Formula Atlas</Link>
            {' · '}
            <Link to="/search" className="text-indigo-400 hover:text-indigo-300 hover:underline">Search</Link>
          </p>
        </footer>

      </div>
    </div>
  )
}
