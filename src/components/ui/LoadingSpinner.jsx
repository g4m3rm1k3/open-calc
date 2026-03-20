export default function LoadingSpinner({ size = 'md' }) {
  const s = size === 'lg' ? 'w-10 h-10 border-4' : 'w-5 h-5 border-2'
  return (
    <div className={`${s} border-brand-200 dark:border-brand-800 border-t-brand-500 rounded-full animate-spin`} />
  )
}
