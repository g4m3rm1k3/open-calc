import { useState } from 'react'
import SVDTab from './SVDTab.jsx'
import LeastSquaresTab from './LeastSquaresTab.jsx'
import { Tag } from './atoms.jsx'
import { GLASS_META } from '../../styles/courseColors.js'

const MAIN_TABS = [
  {
    id: 'svd', label: 'Image Compression', sub: 'Singular Value Decomposition', color: 'violet',
    desc: 'A grayscale image is a matrix. SVD decomposes it into ranked layers — fewer layers = more compression.',
    intro: 'Every image is a matrix of pixel brightnesses. SVD breaks it into ranked "layers" — keep the strongest few and you get a compressed approximation of the original. Drag the k slider to see the tradeoff, or drop in your own photo to try it on real data.',
  },
  {
    id: 'ls', label: 'Curve Fitting', sub: 'Least Squares & Projection', color: 'cyan',
    desc: 'Least squares finds the polynomial that best fits noisy data — pick a preset or click the plot.',
    intro: 'Real data never lies on a perfect line. Least squares finds the polynomial that comes closest anyway, by projecting your data onto the space of possible curves. Click the plot to add points, pick a preset dataset, or import your own x,y data.',
  },
]

const INTRO_DISMISSED_KEY = 'oc-decomp-lab-intro-dismissed'

export default function DecompLab({ onBack, onClose }) {
  const [mainTab, setMainTab] = useState('svd')
  const [introDismissed, setIntroDismissed] = useState(
    () => localStorage.getItem(INTRO_DISMISSED_KEY) === '1'
  )
  const activeTab = MAIN_TABS.find((t) => t.id === mainTab)
  const meta = GLASS_META[activeTab.color]
  const close = onBack ?? onClose

  function dismissIntro() {
    setIntroDismissed(true)
    localStorage.setItem(INTRO_DISMISSED_KEY, '1')
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-white dark:bg-[#0b0f19] text-slate-800 dark:text-slate-200">
      {/* NAV */}
      <div className="h-12 flex items-center px-4 gap-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03] flex-shrink-0">
        {close && (
          <button
            onClick={close}
            className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wide border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex-shrink-0"
          >
            ← Labs
          </button>
        )}
        <span className={`text-[13px] font-black tracking-wide bg-gradient-to-r ${meta.header} bg-clip-text text-transparent flex-shrink-0`}>
          DECOMP LAB
        </span>
        <span className="hidden md:inline text-[9px] tracking-widest text-slate-400 dark:text-slate-500 flex-shrink-0">
          LINEAR ALGEBRA · REAL-WORLD APPLICATIONS
        </span>
        <div className="flex-1" />
        <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-0.5 gap-0.5 flex-shrink-0">
          {MAIN_TABS.map((t) => {
            const m = GLASS_META[t.color]
            const active = t.id === mainTab
            return (
              <button
                key={t.id}
                onClick={() => setMainTab(t.id)}
                className={`px-3.5 py-1.5 rounded-md text-[9px] font-mono tracking-widest uppercase transition-colors ${
                  active ? `${m.text} font-bold bg-white dark:bg-white/10 shadow-sm` : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* SUBHEADER */}
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-white/10 flex items-center gap-3 flex-wrap flex-shrink-0">
        <Tag color={activeTab.color}>{activeTab.sub}</Tag>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">{activeTab.desc}</span>
      </div>

      {/* ONBOARDING — dismissed once, persisted */}
      {!introDismissed && (
        <div className={`mx-4 mt-3 mb-1 p-3.5 rounded-xl border ${meta.border} bg-white/70 dark:bg-white/[0.03] flex items-start gap-3 flex-shrink-0`}>
          <span className="text-lg leading-none mt-0.5">💡</span>
          <p className="flex-1 text-[12px] leading-relaxed text-slate-700 dark:text-slate-200">{activeTab.intro}</p>
          <button
            onClick={dismissIntro}
            className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0 px-2 py-1"
          >
            Got it ✕
          </button>
        </div>
      )}

      {/* CONTENT */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {mainTab === 'svd' ? <SVDTab /> : <LeastSquaresTab />}
      </div>
    </div>
  )
}
