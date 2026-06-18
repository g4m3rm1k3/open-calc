import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAllChapters } from '../../courses/courseLoader.js'

const ALL_CHAPTERS = getAllChapters()

export default function ChapterNavigator({ onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const ref = useRef(null)

  const m = location.pathname.match(/^\/chapter\/([^/]+)\/(.+)$/)
  const currentChapterId = m?.[1]
  const currentSlug = m?.[2]

  // courseId is everything before the trailing -N in the chapterId
  const courseMatch = currentChapterId?.match(/^(.+)-(\d+)$/)
  const courseId = courseMatch?.[1]
  const chapters = courseId ? ALL_CHAPTERS.filter(ch => ch.course === courseId) : []

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('mousedown', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  if (!courseId || chapters.length === 0) return null

  return (
    <div
      ref={ref}
      className="fixed bottom-11 right-2 z-[1900] w-[300px] max-h-[72vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/[0.1] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl"
    >
      <div className="flex-shrink-0 px-4 py-3 border-b border-black/[0.08] dark:border-white/[0.07]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Course</p>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">
          {courseId.replace(/-/g, ' ')}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain py-1">
        {chapters.map(ch => {
          const isCurrentChapter = String(ch.number) === String(currentChapterId)
          return (
            <div key={ch.number}>
              <div className={`px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider ${
                isCurrentChapter
                  ? 'text-indigo-500 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}>
                {ch.title}
              </div>
              {ch.lessons.map(l => {
                const isActive = isCurrentChapter && l.slug === currentSlug
                return (
                  <button
                    key={l.slug}
                    onClick={() => {
                      navigate(`/chapter/${ch.number}/${l.slug}`)
                      onClose()
                    }}
                    className={`w-full text-left px-6 py-1.5 text-xs transition-colors ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {l.title}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
