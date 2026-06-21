export default function MarkdownEditButton({ onClick, label = '📝 Edit + Preview' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors shrink-0"
    >
      {label}
    </button>
  )
}
