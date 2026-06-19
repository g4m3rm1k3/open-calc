import { motion } from 'framer-motion'
import { CheckCircle2, Play, CircleDashed } from 'lucide-react'

export function LessonProgressBadge({ status, percent = 0, correct = 0, total = 0, courseColorMeta }) {
  if (status === 'complete') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 font-medium text-sm shadow-[0_0_15px_rgba(16,185,129,0.15)]">
        <CheckCircle2 size={16} className="fill-emerald-500/20" />
        <span>Complete</span>
      </div>
    )
  }

  if (status === 'in-progress' && total > 0) {
    const radius = 14
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percent / 100) * circumference
    const activeColorClass = courseColorMeta?.text || 'text-brand-500'

    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r={radius}
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              className="text-slate-100 dark:text-slate-700"
            />
            <motion.circle
              cx="18"
              cy="18"
              r={radius}
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
              className={activeColorClass}
              style={{ filter: 'drop-shadow(0px 0px 2px currentColor)' }}
            />
          </svg>
          <span className="absolute text-[9px] font-bold text-slate-700 dark:text-slate-300">
            {percent}%
          </span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-none mb-0.5">In progress</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{correct}/{total} correct</span>
        </div>
      </div>
    )
  }

  if (status === 'in-progress' && total === 0) {
     return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-full border border-amber-500/20 font-medium text-sm shadow-[0_0_15px_rgba(245,158,11,0.1)]">
        <CircleDashed size={16} className="animate-[spin_4s_linear_infinite]" />
        <span>In progress</span>
      </div>
    )
  }

  // not-started
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 font-medium text-sm transition-all hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-sm">
      <Play size={14} className="fill-slate-400 dark:fill-slate-500" />
      <span>Start Lesson</span>
    </div>
  )
}
