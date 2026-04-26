import React, { useState } from 'react'
import { X, Image as ImageIcon, Sparkles, Palette, Check } from 'lucide-react'

const PRESET_GRADIENTS = [
  { id: 'mesh', label: 'Cosmic Mesh', css: 'radial-gradient(at 0% 0%, rgb(59, 130, 246) 0, transparent 50%), radial-gradient(at 100% 0%, rgb(168, 85, 247) 0, transparent 50%), radial-gradient(at 50% 100%, rgb(236, 72, 153) 0, transparent 50%)' },
  { id: 'ocean', label: 'Ocean Depth', css: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  { id: 'sunset', label: 'Evening Sky', css: 'linear-gradient(180deg, #fef3c7 0%, #fbbf24 100%)' },
]

export default function BackgroundPicker({ config, onUpdate, onClose }) {
  const [localUrl, setLocalUrl] = useState(config?.url || '')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onUpdate({ type: 'image', url })
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">Course Atmosphere</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Options */}
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => onUpdate({ type: 'dynamic' })}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${config?.type === 'dynamic' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
            >
              <Sparkles className={`w-5 h-5 ${config?.type === 'dynamic' ? 'text-brand-600' : 'text-slate-400'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">3D Dynamic</span>
            </button>
            <button 
              onClick={() => onUpdate({ type: 'gradient', css: PRESET_GRADIENTS[0].css })}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${config?.type === 'gradient' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
            >
              <Palette className={`w-5 h-5 ${config?.type === 'gradient' ? 'text-brand-600' : 'text-slate-400'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Gradients</span>
            </button>
            <button 
              onClick={() => document.getElementById('bg-image-upload').click()}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${config?.type === 'image' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
            >
              <ImageIcon className={`w-5 h-5 ${config?.type === 'image' ? 'text-brand-600' : 'text-slate-400'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Custom</span>
            </button>
            <input id="bg-image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          {config?.type === 'gradient' && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Select Palette</p>
              <div className="grid grid-cols-1 gap-2">
                {PRESET_GRADIENTS.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => onUpdate({ type: 'gradient', css: p.css })}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg shadow-inner" style={{ background: p.css }} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{p.label}</span>
                    </div>
                    {config.css === p.css && <Check className="w-4 h-4 text-brand-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 text-center">
          <p className="text-[10px] text-slate-400 font-medium">Your selection is saved automatically</p>
        </div>
      </div>
    </div>
  )
}
