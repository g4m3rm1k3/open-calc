import { Settings, Check, Type, Baseline, ArrowRightLeft } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'

export const CODE_FONTS = [
  { id: 'jetbrains', label: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
  { id: 'victor', label: 'Victor Mono (Cursive)', family: "'Victor Mono', monospace" },
  { id: 'fira', label: 'Fira Code', family: "'Fira Code', monospace" },
  { id: 'cascadia', label: 'Cascadia Code', family: "'Cascadia Code', monospace" },
  { id: 'consolas', label: 'Consolas', family: "Consolas, monospace" },
  { id: 'hack', label: 'Hack', family: "Hack, monospace" },
  { id: 'source', label: 'Source Code Pro', family: "'Source Code Pro', monospace" },
  { id: 'mono', label: 'System Mono', family: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }
]

export const FONT_SIZES = [
  { id: 'xs', label: 'Extra Small', size: '12px' },
  { id: 'sm', label: 'Small', size: '13px' },
  { id: 'base', label: 'Base', size: '15px' },
  { id: 'lg', label: 'Large', size: '17px' },
  { id: 'xl', label: 'Extra Large', size: '19px' }
]

export function getCodeFontFamily(fontId) {
  const font = CODE_FONTS.find(f => f.id === fontId)
  return font ? font.family : CODE_FONTS[0].family
}

export function getCodeFontSize(sizeId) {
  const size = FONT_SIZES.find(s => s.id === sizeId)
  return size ? size.size : FONT_SIZES[1].size
}

export default function CodeSettingsModal({ isOpen, onClose }) {
  const { codeTypography, setCodeTypography, themeStyles } = useGlobalTheme()
  const modalRef = useRef(null)
  
  useEffect(() => {
    function handleClickOutside(e) {
      if (isOpen && modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const ui = themeStyles?.ui || {
    bg1: 'bg-white dark:bg-slate-900',
    border: 'border-slate-200 dark:border-slate-700',
    txt1: 'text-slate-800 dark:text-slate-100',
    txt2: 'text-slate-500 dark:text-slate-400',
    hoverBg: 'hover:bg-slate-50 dark:hover:bg-slate-800'
  }

  return (
    <div 
      ref={modalRef} 
      className={`absolute z-50 right-0 top-full mt-2 w-64 rounded-xl border border-brand-500/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-brand-900/10 overflow-hidden flex flex-col`}
      style={{
        animation: 'slideDownAndFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div className={`px-4 py-2 border-b border-brand-500/10 bg-brand-500/5 flex items-center gap-2`}>
        <Settings className={`w-4 h-4 text-brand-500`} />
        <span className={`text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400`}>Code Options</span>
      </div>

      <div className="p-3 space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar">
        
        {/* Font Family */}
        <div className="space-y-2">
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${ui.txt1}`}>
            <Type className="w-3.5 h-3.5" /> Font Family
          </div>
          <div className="space-y-1">
            {CODE_FONTS.map(font => (
              <button
                key={font.id}
                onClick={() => setCodeTypography({ font: font.id })}
                className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center justify-between transition-colors ${
                  codeTypography.font === font.id 
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium' 
                    : `${ui.txt2} ${ui.hoverBg} hover:text-brand-500`
                }`}
                style={{ fontFamily: font.family }}
              >
                <span>{font.label}</span>
                {codeTypography.font === font.id && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${ui.txt1}`}>
            <Baseline className="w-3.5 h-3.5" /> Size
          </div>
          <div className="flex flex-wrap gap-1">
            {FONT_SIZES.map(size => (
              <button
                key={size.id}
                onClick={() => setCodeTypography({ fontSize: size.id })}
                className={`flex-1 min-w-[30%] text-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  codeTypography.fontSize === size.id
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                    : `border ${ui.border} ${ui.txt2} ${ui.hoverBg} hover:border-brand-500/30`
                }`}
              >
                {size.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Ligatures */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${ui.txt1}`}>
            <ArrowRightLeft className="w-3.5 h-3.5" /> Ligatures
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCodeTypography({ ligatures: true })}
              className={`flex-1 text-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                codeTypography.ligatures
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                  : `border ${ui.border} ${ui.txt2} ${ui.hoverBg}`
              }`}
            >
              On (=&gt;)
            </button>
            <button
              onClick={() => setCodeTypography({ ligatures: false })}
              className={`flex-1 text-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                !codeTypography.ligatures
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                  : `border ${ui.border} ${ui.txt2} ${ui.hoverBg}`
              }`}
            >
              Off (= &gt;)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
