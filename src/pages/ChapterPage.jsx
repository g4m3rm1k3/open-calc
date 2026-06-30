export const meta = {
  title: 'Chapter Page',
  description: 'Lists all lessons in a chapter with live progress badges — showing quiz scores, partial credit, and completion. Entry point for navigating into individual lessons.',
  concept: 'Progressive Disclosure',
  conceptDetail: 'Lessons are revealed in sequence. Progress badges give learners a clear sense of where they are without overwhelming them with the full course structure at once.',
}

import { useParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { getAllChapters, getCourseMeta } from '../courses/courseLoader.js'
import { useProgress } from '../hooks/useProgress.js'
import { buildProgressKey } from '../context/progressMigration.ts'
import { LessonProgressBadge } from '../components/ui/LessonProgressBadge.jsx'
import { GLASS_META } from '../styles/courseColors.js'
import { motion } from 'framer-motion'

const ALL_CHAPTERS = getAllChapters()

export default function ChapterPage() {
  const { chapterId } = useParams()
  const chapter = ALL_CHAPTERS.find((c) => String(c.number) === chapterId)
  const { getLessonProgress } = useProgress()

  useEffect(() => {
    if (chapter) {
      document.title = `${chapter.title} — UpSkillOS`
    }
    return () => { document.title = 'UpSkillOS' }
  }, [chapter?.id])

  if (!chapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">Chapter not found</h2>
        <p className="text-slate-500 mb-8 max-w-md">The chapter you're looking for doesn't exist or might have been moved.</p>
        <Link to="/" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-full transition-colors">
          Back to home
        </Link>
      </div>
    )
  }

  const courseMeta = chapter.course ? getCourseMeta(chapter.course) : null
  const courseColor = courseMeta?.color || 'slate'
  const theme = GLASS_META[courseColor] || GLASS_META['slate']

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-10">
        <Link
          to={chapter.course ? `/course/${chapter.course}` : '/'}
          className={`text-sm ${theme.text} hover:underline mb-6 inline-block font-medium`}
        >
          ← {chapter.course ? `All ${courseMeta?.label || 'course'} chapters` : 'All courses'}
        </Link>
        <div className={`p-8 md:p-12 rounded-[2rem] bg-gradient-to-br ${theme.header} text-white shadow-xl relative overflow-hidden`} style={{ boxShadow: theme.glow }}>
          {/* Decorative background blur/circle */}
          <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-sm">{chapter.title}</h1>
            <p className="text-white/90 text-lg md:text-xl max-w-3xl leading-relaxed">{chapter.description}</p>
          </div>
        </div>
      </div>

      {chapter.comingSoon ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 text-4xl shadow-sm">
            🚧
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Coming Soon</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">We are hard at work building this chapter. Check back later!</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 gap-4"
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
          {chapter.lessons.map((lesson, i) => {
            const { percent, status, correct, total } = getLessonProgress(buildProgressKey(chapter.course, lesson))
            
            return (
              <motion.div
                key={lesson.slug}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Link
                  to={`/chapter/${chapter.number}/${lesson.slug}`}
                  className={`group flex items-center justify-between p-5 md:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition-all duration-300 relative overflow-hidden block`}
                >
                  {/* Subtle hover background block using the safelisted color */}
                  <div className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-current opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.05] transition-opacity duration-300 pointer-events-none ${theme.text}`} />

                  <div className="flex items-start gap-5 md:gap-6 relative z-10 flex-1">
                    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 ${theme.text} font-bold font-mono text-xl group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-100 dark:border-slate-700/50`}>
                      {i + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-4 mt-0.5">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1.5 group-hover:text-slate-800 dark:group-hover:text-white transition-colors truncate">{lesson.title}</h2>
                      <p className="text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 text-sm leading-relaxed">{lesson.subtitle}</p>
                      
                      {lesson.tags && lesson.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {lesson.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-lg border border-slate-200/50 dark:border-slate-700/50">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 relative z-10 ml-4 hidden sm:block">
                    <LessonProgressBadge 
                      status={status} 
                      percent={percent} 
                      correct={correct} 
                      total={total}
                      courseColorMeta={theme}
                    />
                  </div>
                  
                  {/* Mobile Badge Container */}
                  <div className="absolute top-5 right-5 sm:hidden scale-[0.8] origin-top-right">
                     <LessonProgressBadge 
                      status={status} 
                      percent={percent} 
                      correct={correct} 
                      total={total}
                      courseColorMeta={theme}
                    />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
