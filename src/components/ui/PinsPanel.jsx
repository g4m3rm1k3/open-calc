import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePins } from '../../context/PinsContext.jsx'

export default function PinsPanel() {
  const [open, setOpen] = useState(false)
  const { pins, removePin } = usePins()
  const navigate = useNavigate()

  function go(pin) {
    navigate(pin.path)
    setOpen(false)
    if (!pin.elementId) return

    // Give the new page time to mount, then scroll down in chunks until the element appears.
    // We use a max-attempts counter instead of an "at bottom" check because the page may
    // still be rendering when we start (scrollHeight is tiny), which would falsely trigger
    // the bottom check and abort before any content has loaded.
    let attempts = 0
    const maxAttempts = 80 // ~13 seconds of trying at 160ms intervals

    setTimeout(() => {
      window.scrollTo(0, 0)
      const chunk = Math.max(window.innerHeight * 0.6, 400)

      function step() {
        const el = document.getElementById(pin.elementId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return
        }
        attempts++
        if (attempts >= maxAttempts) return
        window.scrollTo(0, window.scrollY + chunk)
        setTimeout(step, 160)
      }

      step()
    }, 600)
  }

  return (
    // Desktop only
    <div className="hidden lg:block fixed right-0 top-[60px] bottom-0 z-40 pointer-events-none">
      {/* Slide-in panel */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-[260px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 pointer-events-auto shadow-xl ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base">📌</span>
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">Pinned</span>
            {pins.length > 0 && (
              <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                {pins.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Pin list */}
        <div className="flex-1 overflow-y-auto py-2">
          {pins.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="text-2xl mb-2">📌</div>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                Pin any visualization by hovering over it and clicking the pin icon.
              </p>
            </div>
          ) : (
            pins.map(pin => (
              <div
                key={pin.id}
                className="group flex items-start gap-2 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50 last:border-0"
              >
                <button
                  onClick={() => go(pin)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug truncate">
                    {pin.title}
                  </div>
                  {pin.subtitle && (
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      {pin.subtitle}
                    </div>
                  )}
                </button>
                <button
                  onClick={() => removePin(pin.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-red-400 transition-all"
                  title="Remove pin"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tab trigger — always visible on the right edge */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`pointer-events-auto absolute top-6 flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-l-lg border border-r-0 shadow-md transition-all duration-200 ${
          open
            ? 'right-[260px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            : 'right-0 bg-amber-50 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60'
        }`}
      >
        <span>📌</span>
        <span>Pins</span>
        {pins.length > 0 && (
          <span className="bg-amber-400 dark:bg-amber-500 text-white text-[10px] font-bold px-1 rounded-full leading-none py-0.5">
            {pins.length}
          </span>
        )}
      </button>
    </div>
  )
}
