import { Link } from 'react-router-dom'
import { getAllCourses, getChapters } from '../courses/courseLoader.js'
import { useProgress } from '../hooks/useProgress.js'
import UniverseBackground from '../components/home/UniverseBackground.jsx'
import AppCard from '../components/cards/AppCard.jsx'
import { LABS } from '../data/labs.js'
import { GAMES } from '../data/games.js'

// ── Discipline pills ──────────────────────────────────────────────────────────
const DISCIPLINES_ROW1 = [
  { label:'Mathematics',  emoji:'∫',  col:'border-indigo-400/40 text-indigo-200 bg-indigo-900/30'   },
  { label:'Physics',      emoji:'Φ',  col:'border-blue-400/40 text-blue-200 bg-blue-900/30'         },
  { label:'Chemistry',    emoji:'⚗', col:'border-cyan-400/40 text-cyan-200 bg-cyan-900/30'         },
  { label:'Biology',      emoji:'🧬', col:'border-emerald-400/40 text-emerald-200 bg-emerald-900/30'},
  { label:'Robotics',     emoji:'🤖', col:'border-orange-400/40 text-orange-200 bg-orange-900/30'   },
  { label:'Astronomy',    emoji:'🔭', col:'border-violet-400/40 text-violet-200 bg-violet-900/30'   },
]
const DISCIPLINES_ROW2 = [
  { label:'Computer Science',       emoji:'⊕',  col:'border-purple-400/40 text-purple-200 bg-purple-900/30'   },
  { label:'Data Science',           emoji:'Σ',  col:'border-sky-400/40 text-sky-200 bg-sky-900/30'            },
  { label:'AI & Machine Learning',  emoji:'⟁',  col:'border-rose-400/40 text-rose-200 bg-rose-900/30'         },
  { label:'Engineering',            emoji:'⚙', col:'border-amber-400/40 text-amber-200 bg-amber-900/30'      },
  { label:'Linear Algebra',         emoji:'Ax', col:'border-teal-400/40 text-teal-200 bg-teal-900/30'         },
  { label:'3D & Graphics',          emoji:'∇',  col:'border-fuchsia-400/40 text-fuchsia-200 bg-fuchsia-900/30'},
]

// ── Domain visual config ──────────────────────────────────────────────────────
const DOMAIN_META = {
  math:        { label:'Mathematics',                    icon:'∑',  desc:'From pre-calculus through calculus, geometry, discrete math, linear algebra & statistics', headCol:'text-indigo-300 border-indigo-500/35' },
  science:     { label:'Natural Sciences',               icon:'⚛',  desc:'Physics mechanics, waves, electricity · Chemistry elements, reactions & molecular structure', headCol:'text-cyan-300 border-cyan-500/35' },
  cs:          { label:'Computer Science & Programming', icon:'⌨',  desc:'Python, JavaScript, web systems, algorithms, data structures & computational thinking', headCol:'text-emerald-300 border-emerald-500/35' },
  engineering: { label:'Engineering & Hardware',         icon:'⚙',  desc:'Digital logic, CNC machining, G-code, C++ from zero to software engineer', headCol:'text-amber-300 border-amber-500/35' },
  data:        { label:'Data, AI & Databases',           icon:'⟁',  desc:'NumPy, Pandas, ML foundations, LLMs, SQL, NoSQL & applied statistics', headCol:'text-violet-300 border-violet-500/35' },
  creative:    { label:'Creative Technology',            icon:'∇',  desc:'3D graphics & WebGL, game dev, HTML Canvas, design systems, Git & command line', headCol:'text-rose-300 border-rose-500/35' },
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
  const totalLessons     = COURSE_ENTRIES.reduce((s, { chapters }) => s + chapters.reduce((n, ch) => n + ch.lessons.length, 0), 0)
  const completedLessons = COURSE_ENTRIES.reduce((s, { course, chapters }) =>
    s + chapters.reduce((n, ch) =>
      n + ch.lessons.filter(l => getLessonStatus(`${course.key}/${l.slug}`, 1) === 'complete').length, 0), 0)

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
              className="bg-gradient-to-r from-indigo-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent"
              style={{ filter:'drop-shadow(0 0 40px rgba(99,102,241,0.45))' }}
            >
              UpSkillOS
            </span>
          </h1>

          <p className="text-slate-300 text-xl sm:text-2xl font-light max-w-3xl leading-relaxed mb-3">
            Master the universe of human knowledge.
          </p>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
            Calculus → Quantum Mechanics · Python → AI Systems · Chemistry → Molecular Biology ·
            C++ → Robotics. Built in your browser. Free forever.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['Free Forever','Open Source','Runs in Browser','No Install Required','MIT License'].map(b => (
              <span key={b} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-400 backdrop-blur-sm">{b}</span>
            ))}
          </div>

          {totalLessons > 0 && (
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-2.5 text-sm mb-10">
              <div className="h-2 w-36 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all"
                  style={{ width:`${(completedLessons / totalLessons) * 100}%` }} />
              </div>
              <span className="text-slate-300 font-medium">
                {completedLessons} <span className="text-slate-500">/ {totalLessons} lessons</span>
              </span>
            </div>
          )}

          <div className="flex flex-col items-center gap-1 text-slate-600 animate-bounce">
            <span className="text-xs tracking-widest uppercase">Explore</span>
            <span className="text-xl">↓</span>
          </div>
        </section>

        {/* ── COURSES ──────────────────────────────────────────────────────── */}
        <section className="px-4 pb-6">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-900/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-300 backdrop-blur-sm mb-4">
              <span>📚</span> Curriculum
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">
              {ALL_COURSES.length}+ courses across every domain
            </h2>
            <p className="text-slate-400 text-base mt-2">Structured paths from first principles to mastery</p>
          </div>
          {DOMAINS.map(domain => (
            <DomainSection key={domain.key} domain={domain} getLessonStatus={getLessonStatus} />
          ))}
        </section>

        {/* ── LABS ─────────────────────────────────────────────────────────── */}
        <section className="px-4 pb-6 mt-4">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-cyan-500/30">
            <span className="text-3xl leading-none">🔬</span>
            <div>
              <h3 className="text-lg font-bold text-cyan-300">Interactive Labs</h3>
              <p className="text-slate-500 text-xs">Full simulation environments — experiment, build, and explore</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {LABS.map(item => <AppCard key={item.key} item={item} variant="lab" />)}
          </div>
        </section>

        {/* ── GAMES ────────────────────────────────────────────────────────── */}
        <section className="px-4 pt-6 pb-10 mt-4">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-fuchsia-500/30">
            <span className="text-3xl leading-none">🎮</span>
            <div>
              <h3 className="text-lg font-bold text-fuchsia-300">STEM Games</h3>
              <p className="text-slate-500 text-xs">Learn through play — real math and science behind every mechanic</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {GAMES.map(item => <AppCard key={item.key} item={item} variant="game" />)}
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 px-4 py-8 text-center text-xs text-slate-600 mt-4">
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
