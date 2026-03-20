export default function SliderControl({ label, min, max, step = 0.01, value, onChange, format }) {
  const display = format ? format(value) : (Number.isInteger(step) ? value : value.toFixed(2))
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-slate-600 dark:text-slate-400 min-w-[120px]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-brand-500"
      />
      <span className="font-mono text-brand-600 dark:text-brand-400 min-w-[50px] text-right">
        {display}
      </span>
    </div>
  )
}
