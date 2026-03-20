export default function ProgressDot({ status }) {
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
