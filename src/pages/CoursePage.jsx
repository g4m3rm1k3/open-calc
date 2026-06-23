import { useParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { getCourseMeta, getChapters } from '../courses/courseLoader.js'
import { useProgress } from '../hooks/useProgress.js'
import { buildProgressKey } from '../context/progressMigration.js'
import { GLASS_META } from '../styles/courseColors.js'
import { motion } from 'framer-motion'
import { CheckCircle2, Play, BookOpen } from 'lucide-react'

export default function CoursePage() {
  const { courseKey } = useParams()
  const { getLessonProgress } = useProgress()

  const meta     = getCourseMeta(courseKey)
  const chapters = getChapters(courseKey)

  useEffect(() => {
    if (meta?.label) document.title = `${meta.label} — UpSkillOS`
    return () => { document.title = 'UpSkillOS' }
  }, [meta?.label])

  if (!meta || chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">Course not found</h2>
        <p className="text-slate-500 mb-8 max-w-md">We couldn't find the course you're looking for.</p>
        <Link to="/" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-full transition-colors">
          Back to home
        </Link>
      </div>
    )
  }

  const courseColor = meta?.color || 'slate'
  const theme = GLASS_META[courseColor] || GLASS_META['slate']
  
  const totalLessons = chapters.reduce((s, ch) => s + ch.lessons.length, 0)
  const completedLessons = chapters.reduce((s, ch) =>
    s + ch.lessons.filter(l => getLessonProgress(buildProgressKey(courseKey, l)).status === 'complete').length
  , 0)

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-10">
        <Link to="/" className={`text-sm ${theme.text} hover:underline mb-6 inline-block font-medium`}>
          ← All courses
        </Link>

        <div className={`p-8 md:p-12 rounded-[2rem] bg-gradient-to-br ${theme.header} text-white shadow-xl relative overflow-hidden`} style={{ boxShadow: theme.glow }}>
          {/* Decorative background blur/circle */}
          <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="hidden md:flex items-center justify-center w-24 h-24 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-inner text-5xl">
              {meta.icon || '📚'}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-sm">{meta.label}</h1>
              <p className="text-white/90 text-lg md:text-xl max-w-3xl leading-relaxed mb-6">{meta.description}</p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3 text-sm font-medium bg-black/20 py-2 px-4 rounded-full backdrop-blur-md w-fit border border-white/10">
                  <div className="flex items-center gap-1.5"><BookOpen size={16} /> <span>{chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}</span></div>
                  <span className="opacity-50">·</span>
                  <span>{totalLessons} lessons</span>
                  {completedLessons > 0 && (
                    <>
                      <span className="opacity-50">·</span>
                      <span className="text-emerald-300">{completedLessons}/{totalLessons} complete</span>
                    </>
                  )}
                </div>
                
                {totalLessons > 0 && completedLessons > 0 && (
                  <div className="flex-1 max-w-xs flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-black/30 overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-1000 ease-out"
                        style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{Math.round((completedLessons / totalLessons) * 100)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 gap-5"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
          }
        }}
      >
        {chapters.map((chapter) => {
          const chLessons = chapter.lessons.length
          const chCompleted = chapter.lessons.filter(l =>
            getLessonProgress(buildProgressKey(courseKey, l)).status === 'complete'
          ).length
          const pct = chLessons > 0 ? chCompleted / chLessons : 0

          return (
            <motion.div
              key={chapter.number}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <Link
                to={`/chapter/${chapter.number}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle hover background block */}
                <div className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-current opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.05] transition-opacity duration-300 pointer-events-none ${theme.text}`} />

                <div className="flex-1 min-w-0 pr-6 relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 ${theme.text}`}>
                      Chapter {chapter.number.replace(/^.*-/, '')}
                    </span>
                    {pct === 1 && <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md"><CheckCircle2 size={14} /> Mastered</span>}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">{chapter.title}</h2>
                  
                  {chLessons > 0 && (
                    <div className="mt-4 max-w-md">
                      <div className="flex items-center justify-between text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                        <span>{chLessons} {chLessons === 1 ? 'Lesson' : 'Lessons'}</span>
                        {chCompleted > 0 && <span>{chCompleted} / {chLessons} Complete</span>}
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full ${pct === 1 ? 'bg-emerald-500' : theme.bar} transition-all duration-1000 ease-out relative`}
                          style={{ width: `${pct > 0 ? Math.max(2, pct * 100) : 0}%` }}
                        >
                           {pct > 0 && pct < 1 && (
                              <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
                           )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 mt-6 sm:mt-0 relative z-10 flex items-center gap-4">
                   {pct > 0 && pct < 1 && (
                      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-full text-xs font-bold">
                        <Play size={12} className="fill-amber-500" /> Resume
                      </div>
                   )}
                   {pct === 0 && (
                      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-bold group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                        <Play size={12} className="fill-slate-400" /> Start
                      </div>
                   )}
                   <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-all">
                     <span className="text-xl leading-none translate-x-px">→</span>
                   </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
