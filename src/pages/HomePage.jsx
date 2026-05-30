import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { COURSES, CURRICULUM } from '../content/index.js'
import { useProgress } from '../hooks/useProgress.js'
import UniverseBackground from '../components/home/UniverseBackground.jsx'

// ── Course icons ──────────────────────────────────────────────────────────────
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
  'javascript-core':      'JS',
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
  'three-js-2':           '∇²',
  'ai-engineering':       '⟁',
  'canvas-1':             '⬤',
  'gcode-parser-1':       'G0',
  'sql-0':                'SQL',
  'sql-1':                'SQL+',
  'nosql-1':              '{}',
  'applied-statistics':   'μσ',
  'cli-0':                '$_',
  'cpp':                  'C++',
}

// ── Glass-card visual tokens ──────────────────────────────────────────────────
const GLASS_META = {
  indigo:  { border:'border-indigo-500/30',  header:'from-indigo-600 to-violet-700',   glow:'0 0 32px rgba(99,102,241,0.50)',  bar:'bg-indigo-400',  dim:'text-indigo-300'  },
  blue:    { border:'border-blue-500/30',    header:'from-blue-600 to-indigo-700',     glow:'0 0 32px rgba(59,130,246,0.50)',  bar:'bg-blue-400',    dim:'text-blue-300'    },
  emerald: { border:'border-emerald-500/30', header:'from-emerald-600 to-teal-700',    glow:'0 0 32px rgba(16,185,129,0.50)', bar:'bg-emerald-400', dim:'text-emerald-300' },
  red:     { border:'border-red-500/30',     header:'from-red-600 to-rose-700',        glow:'0 0 32px rgba(239,68,68,0.50)',   bar:'bg-red-400',     dim:'text-red-300'     },
  purple:  { border:'border-purple-500/30',  header:'from-purple-600 to-violet-800',   glow:'0 0 32px rgba(168,85,247,0.50)', bar:'bg-purple-400',  dim:'text-purple-300'  },
  orange:  { border:'border-orange-500/30',  header:'from-orange-500 to-red-600',      glow:'0 0 32px rgba(249,115,22,0.50)', bar:'bg-orange-400',  dim:'text-orange-300'  },
  teal:    { border:'border-teal-500/30',    header:'from-teal-600 to-cyan-700',       glow:'0 0 32px rgba(20,184,166,0.50)', bar:'bg-teal-400',    dim:'text-teal-300'    },
  amber:   { border:'border-amber-500/30',   header:'from-amber-500 to-orange-600',    glow:'0 0 32px rgba(245,158,11,0.50)', bar:'bg-amber-400',   dim:'text-amber-300'   },
  sky:     { border:'border-sky-500/30',     header:'from-sky-500 to-blue-600',        glow:'0 0 32px rgba(14,165,233,0.50)', bar:'bg-sky-400',     dim:'text-sky-300'     },
  cyan:    { border:'border-cyan-500/30',    header:'from-cyan-500 to-blue-600',       glow:'0 0 32px rgba(6,182,212,0.50)',  bar:'bg-cyan-400',    dim:'text-cyan-300'    },
  rose:    { border:'border-rose-500/30',    header:'from-rose-600 to-pink-700',       glow:'0 0 32px rgba(244,63,94,0.50)',  bar:'bg-rose-400',    dim:'text-rose-300'    },
  violet:  { border:'border-violet-500/30',  header:'from-violet-600 to-purple-800',   glow:'0 0 32px rgba(139,92,246,0.50)', bar:'bg-violet-400',  dim:'text-violet-300'  },
  lime:    { border:'border-lime-500/30',    header:'from-lime-600 to-green-700',      glow:'0 0 32px rgba(132,204,22,0.50)', bar:'bg-lime-400',    dim:'text-lime-300'    },
  slate:   { border:'border-slate-500/30',   header:'from-slate-500 to-slate-700',     glow:'0 0 32px rgba(100,116,139,0.50)',bar:'bg-slate-400',   dim:'text-slate-300'   },
  fuchsia: { border:'border-fuchsia-500/30', header:'from-fuchsia-600 to-purple-700',  glow:'0 0 32px rgba(217,70,239,0.50)', bar:'bg-fuchsia-400', dim:'text-fuchsia-300' },
  green:   { border:'border-green-500/30',   header:'from-green-600 to-emerald-700',   glow:'0 0 32px rgba(34,197,94,0.50)',  bar:'bg-green-400',   dim:'text-green-300'   },
  pink:    { border:'border-pink-500/30',    header:'from-pink-600 to-rose-700',       glow:'0 0 32px rgba(236,72,153,0.50)', bar:'bg-pink-400',    dim:'text-pink-300'    },
}
const GLASS_FALLBACK = GLASS_META.slate

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

// ── Course domains ────────────────────────────────────────────────────────────
const DOMAINS = [
  {
    key:'math', label:'Mathematics', icon:'∑',
    desc:'From pre-calculus through calculus, geometry, discrete math, linear algebra & statistics',
    headCol:'text-indigo-300 border-indigo-500/35',
    courses:['precalc','geometry','calc','discrete','linear-algebra','applied-statistics'],
  },
  {
    key:'science', label:'Natural Sciences', icon:'⚛',
    desc:'Physics mechanics, waves, electricity · Chemistry elements, reactions & molecular structure',
    headCol:'text-cyan-300 border-cyan-500/35',
    courses:['physics-1','chemistry-1'],
  },
  {
    key:'cs', label:'Computer Science & Programming', icon:'⌨',
    desc:'Python, JavaScript, web systems, algorithms, data structures & computational thinking',
    headCol:'text-emerald-300 border-emerald-500/35',
    courses:['python-1','javascript-core','web-1','cs-1','dsa-1','dp-1'],
  },
  {
    key:'engineering', label:'Engineering & Hardware', icon:'⚙',
    desc:'Digital logic, CNC machining, G-code, C++ from zero to software engineer',
    headCol:'text-amber-300 border-amber-500/35',
    courses:['digital-fundamentals','cnc-logic','gcode-parser-1','cpp'],
  },
  {
    key:'data', label:'Data, AI & Databases', icon:'⟁',
    desc:'NumPy, Pandas, ML foundations, LLMs, SQL, NoSQL & applied statistics',
    headCol:'text-violet-300 border-violet-500/35',
    courses:['data-science-1','ai-engineering','sql-0','sql-1','nosql-1'],
  },
  {
    key:'creative', label:'Creative Technology', icon:'∇',
    desc:'3D graphics & WebGL, game dev, HTML Canvas, design systems, Git & command line',
    headCol:'text-rose-300 border-rose-500/35',
    courses:['three-js-1','three-js-2','canvas-1','design-1','tetris','git-0','cli-0'],
  },
]

// ── Labs ──────────────────────────────────────────────────────────────────────
const LABS = [
  { key:'openmat',        label:'OpenMAT',        emoji:'⚛️',  color:'indigo',  desc:'Full-featured math computation engine — symbolic algebra, 3D graphing, matrix tools.',       path:'/openmat',        tags:['Math','Platform']     },
  { key:'cnc-sim',        label:'CNC Simulator',  emoji:'🔧',  color:'amber',   desc:'Program and simulate CNC toolpaths with a live 3D backplot and fixture management.',         path:'/cnc-sim',        tags:['Engineering','CAD']   },
  { key:'logic-sim',      label:'Logic Suite',    emoji:'⚡',  color:'violet',  desc:'Design and simulate digital logic circuits gate-by-gate with truth tables.',                 path:'/logic-sim',      tags:['CS','Engineering']    },
  { key:'chemistry',      label:'Chemistry Lab',  emoji:'🧪',  color:'cyan',    desc:'Explore chemical reactions, periodic table data, and molecular structures interactively.',  event:'chemistry',      tags:['Chemistry','Lab']     },
  { key:'physics',        label:'Physics Engine', emoji:'🌌',  color:'fuchsia', desc:'Simulate rigid body dynamics, forces, springs, pendulums, and wave mechanics.',             event:'physics',        tags:['Physics','Simulation']},
  { key:'cad-pro',        label:'CAD Pro',        emoji:'📐',  color:'slate',   desc:'Parametric 3D modelling with constraint-based design tools.',                                path:'/cad-pro',        tags:['Engineering','Design']},
  { key:'universal-calc', label:'Universal Calc', emoji:'🧮',  color:'emerald', desc:'One calculator for everything — unit conversion, constants, formulas & numerical methods.', path:'/universal-calc', tags:['Math','Tools']        },
]

// ── Games ─────────────────────────────────────────────────────────────────────
const GAMES = [
  { key:'rubiks',     label:"Rubik's Cube",        emoji:'🎲',  color:'emerald', desc:"Group theory, permutations & non-commutativity through the world's most famous puzzle.",    path:'/rubiks-cube',    tags:['Group Theory','3D']        },
  { key:'matrix',     label:'Linear Algebra Game', emoji:'λ',   color:'cyan',    desc:'Seven interactive lessons — vectors, transforms, determinants & eigenvectors.',             path:'/matrix-game',    tags:['Linear Algebra','Interactive']},
  { key:'tetris',     label:'STEM Tetris',          emoji:'🟦',  color:'fuchsia', desc:'Classic Tetris with six STEM lenses: matrix ops, 2×2 transforms, probability distributions.',path:'/stem-tetris',    tags:['Math','CS']                },
  { key:'cards',      label:'STEM Card Academy',    emoji:'🃏',  color:'indigo',  desc:'Five card games teaching probability, statistics & neuroscience through play.',             path:'/card-academy',   tags:['Probability','Stats']      },
  { key:'asteroids',  label:'Vector Asteroids',     emoji:'🌀',  color:'violet',  desc:'Blast rocks through 10 waves — velocity, dot products, matrix transforms via gameplay.',    path:'/asteroids-la',   tags:['Linear Algebra','Arcade']  },
  { key:'arkanoid',   label:'Arkanoid Learn',        emoji:'🎮',  color:'rose',    desc:'Break bricks by answering math questions. Miss one and the wall fights back.',             path:'/arkanoid-learn', tags:['Arcade','Math']            },
  { key:'stemquest',  label:'STEM Quest',            emoji:'🗺️',  color:'amber',   desc:'An interactive adventure map packed with multi-subject STEM challenges.',                  path:'/stem-quest',     tags:['Adventure','Multi-subject'] },
  { key:'opencraft',  label:'OpenCraft',             emoji:'⛏️',  color:'teal',    desc:'Build and explore in a physics-based voxel sandbox.',                                       path:'/open-craft',     tags:['Sandbox','Physics']        },
  { key:'runner',     label:'Reality Runner',        emoji:'🏃',  color:'sky',     desc:'Run through physics simulations and dodge equations in real time.',                         path:'/reality-runner', tags:['Runner','Physics']         },
  { key:'basketball', label:'Basketball Lab',        emoji:'🏀',  color:'orange',  desc:'Apply trajectory and calculus to perfect your arc and sink every shot.',                   event:'basketball',     tags:['Physics','Calculus']       },
  { key:'pool',       label:'Physics Pool',          emoji:'🎱',  color:'purple',  desc:'Explore collision physics and bank angles on the felt.',                                    event:'pool',           tags:['Physics','Geometry']       },
  { key:'golf',       label:'Mini Golf',             emoji:'⛳',  color:'green',   desc:'Apply geometry and projectile motion to sink every putt.',                                  event:'golf',           tags:['Geometry','Physics']       },
  { key:'football',   label:'Football Calculus',     emoji:'🏈',  color:'amber',   desc:'Use integration and optimization to analyse routes and trajectories.',                      event:'football',       tags:['Calculus','Sports']        },
]

// ── Pre-built course → chapters lookup ───────────────────────────────────────
const COURSE_MAP = Object.fromEntries(
  COURSES
    .map(course => [course.key, { course, chapters: CURRICULUM.filter(ch => ch.course === course.key) }])
    .filter(([, v]) => v.chapters.length > 0)
)

// ── Course glass card ─────────────────────────────────────────────────────────
function CourseCard({ course, chapters, getLessonStatus }) {
  const ref = useRef(null)
  const meta = GLASS_META[course.color] ?? GLASS_FALLBACK
  const icon = COURSE_ICONS[course.key] ?? '∑'
  const total = chapters.reduce((s, ch) => s + ch.lessons.length, 0)
  const done  = chapters.reduce((s, ch) =>
    s + ch.lessons.filter(l => getLessonStatus(l.id, l.checkpoints?.length ?? 1) === 'complete').length, 0)
  const pct = total > 0 ? done / total : 0

  return (
    <Link
      ref={ref}
      to={course.path}
      className={`group block rounded-xl border ${meta.border} bg-white/5 backdrop-blur-sm transition-all duration-300 overflow-hidden hover:bg-white/[0.08] hover:scale-[1.025] hover:-translate-y-0.5`}
      onMouseEnter={() => { if (ref.current) ref.current.style.boxShadow = meta.glow }}
      onMouseLeave={() => { if (ref.current) ref.current.style.boxShadow = '' }}
    >
      <div className={`bg-gradient-to-r ${meta.header} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono font-black text-white/90 text-base leading-none shrink-0">{icon}</span>
          <span className="font-bold text-white text-sm truncate">{course.label}</span>
        </div>
        <span className="text-white/50 text-xs shrink-0 ml-2 group-hover:text-white/90 group-hover:translate-x-0.5 transition-all">→</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{course.desc}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{chapters.length} ch · {total} lessons</span>
            {done > 0 && <span className={meta.dim}>{done}/{total} done</span>}
          </div>
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div className={`h-full rounded-full ${meta.bar} transition-all`}
              style={{ width: `${pct > 0 ? Math.max(4, pct * 100) : 0}%` }} />
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Lab / Game feature card ───────────────────────────────────────────────────
const FEATURE_GLOW = {
  indigo:'rgba(99,102,241,0.45)',  blue:'rgba(59,130,246,0.45)',   emerald:'rgba(16,185,129,0.45)',
  red:'rgba(239,68,68,0.45)',      purple:'rgba(168,85,247,0.45)', orange:'rgba(249,115,22,0.45)',
  teal:'rgba(20,184,166,0.45)',    amber:'rgba(245,158,11,0.45)',  sky:'rgba(14,165,233,0.45)',
  cyan:'rgba(6,182,212,0.45)',     rose:'rgba(244,63,94,0.45)',    violet:'rgba(139,92,246,0.45)',
  fuchsia:'rgba(217,70,239,0.45)',slate:'rgba(100,116,139,0.45)', green:'rgba(34,197,94,0.45)',
}

function FeatureCard({ item }) {
  const ref = useRef(null)
  const glow = `0 0 30px ${FEATURE_GLOW[item.color] ?? 'rgba(100,116,139,0.45)'}`

  const inner = (
    <div
      ref={ref}
      className="group relative h-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 overflow-hidden hover:border-white/20 hover:scale-[1.025] hover:-translate-y-0.5"
      onMouseEnter={() => { if (ref.current) ref.current.style.boxShadow = glow }}
      onMouseLeave={() => { if (ref.current) ref.current.style.boxShadow = '' }}
    >
      <div className="p-4">
        <div className="text-3xl mb-2 leading-none">{item.emoji}</div>
        <h4 className="font-bold text-white/90 text-sm mb-1.5">{item.label}</h4>
        <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-3">{item.desc}</p>
        <div className="flex flex-wrap gap-1">
          {item.tags.map(t => (
            <span key={t} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500">{t}</span>
          ))}
        </div>
      </div>
      <div className="absolute bottom-3 right-3 text-white/25 text-xs group-hover:text-white/60 transition-colors">→</div>
    </div>
  )

  if (item.event) {
    return (
      <button className="block w-full text-left h-full"
        onClick={() => window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: item.event } }))}>
        {inner}
      </button>
    )
  }
  return <Link to={item.path} className="block h-full">{inner}</Link>
}

// ── Domain section ────────────────────────────────────────────────────────────
function DomainSection({ domain, getLessonStatus }) {
  const [iconColor, borderColor] = domain.headCol.split(' ')
  const entries = domain.courses.map(key => COURSE_MAP[key]).filter(Boolean)
  if (entries.length === 0) return null
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
          <CourseCard key={course.key} course={course} chapters={chapters} getLessonStatus={getLessonStatus} />
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { getLessonStatus } = useProgress()
  const totalLessons     = CURRICULUM.reduce((s, ch) => s + ch.lessons.length, 0)
  const completedLessons = CURRICULUM.reduce(
    (s, ch) => s + ch.lessons.filter(l => getLessonStatus(l.id, l.checkpoints?.length ?? 1) === 'complete').length, 0)

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
              {COURSES.length}+ courses across every domain
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
            {LABS.map(item => <FeatureCard key={item.key} item={item} />)}
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
            {GAMES.map(item => <FeatureCard key={item.key} item={item} />)}
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
