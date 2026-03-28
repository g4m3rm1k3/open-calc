export default function ProgressDot({ status }) {
  if (status === 'quiz-pass') {
    return (
      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center" title="Mastered (≥80%)">
        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </span>
    )
  }
  if (status === 'quiz-partial') {
    return (
      <span
        className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center"
        title="Partial (50–79%)"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
      </span>
    )
  }
  if (status === 'quiz-fail') {
    return (
      <span
        className="flex-shrink-0 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
        title="Needs review (<50%)"
      >
        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    )
  }
  if (status === 'complete') {
    return (
      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </span>
    )
  }
  if (status === 'in-progress') {
    return <span className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-400 border-2 border-amber-200" />
  }
  return <span className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
}
