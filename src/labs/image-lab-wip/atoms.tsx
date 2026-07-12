import type { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function Button({ children, active, className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${
        active
          ? 'border-transparent bg-gradient-to-r from-brand-500 to-sky-500 text-white shadow-lg shadow-brand-500/40'
          : 'border-slate-200/50 bg-white/40 text-slate-600 hover:bg-white/80 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string
  active?: boolean
}

export function IconButton({ title, active, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300 ${
        active
          ? 'border-transparent bg-gradient-to-r from-brand-500 to-sky-500 text-white shadow-lg shadow-brand-500/40'
          : 'border-slate-200/50 bg-white/40 text-slate-500 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Stat({ label, value, highlight }: { label: string; value: ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 transition-all duration-300 backdrop-blur-md ${
      highlight
        ? 'border-brand-400/50 bg-brand-500/10 shadow-md shadow-brand-500/15'
        : 'border-slate-200/50 bg-white/40 dark:border-white/10 dark:bg-white/5'
    }`}>
      <div className={`font-mono text-sm font-bold tracking-tight ${
        highlight
          ? 'bg-gradient-to-r from-brand-400 to-sky-400 bg-clip-text text-transparent'
          : 'text-slate-900 dark:text-slate-100'
      }`}>
        {value}
      </div>
      <div className="mt-1 text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400/80">{label}</div>
    </div>
  )
}

interface RangeProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  suffix?: string
}

export function Range({ label, value, min, max, step = 1, onChange, suffix = '' }: RangeProps) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="text-brand-600 dark:text-brand-400">{value}{suffix}</span>
      </div>
      <input
        className="w-full accent-brand-500"
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

export function SectionHeader({ icon: Icon, label, children }: { icon?: ComponentType<{ className?: string }>; label: string; children?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
      {Icon && <Icon className="h-4 w-4 text-brand-500" />}
      {label}
      {children}
    </div>
  )
}

export function LearnBox({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border border-brand-400/30 bg-gradient-to-br from-brand-500/10 to-sky-500/5 p-4 text-[11px] leading-relaxed text-brand-900 shadow-inner backdrop-blur-sm dark:text-brand-100">
      {children}
    </div>
  )
}
