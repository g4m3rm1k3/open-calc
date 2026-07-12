import { useMemo, useState } from 'react'
import { LearnBox, Stat } from '../atoms.jsx'
import { computeGradient, luminanceAt, pixelAt, rgbToHsv, rgbToLab } from '../imageMath.js'
import type { ImgData, Inspect } from '../types.js'

const TABS = [
  { id: 'rgb', label: 'RGB' },
  { id: 'hsv', label: 'HSV' },
  { id: 'lab', label: 'L*a*b*' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'neighbor', label: '3×3' },
] as const

type TabId = typeof TABS[number]['id']

export function PixelInspectorPanel({ image, inspect }: { image: ImgData; inspect: Inspect | null }) {
  const [tab, setTab] = useState<TabId>('rgb')
  const px = inspect ?? pixelAt(image, Math.floor(image.width / 2), Math.floor(image.height / 2))
  const hsv = rgbToHsv(px.r, px.g, px.b)
  const lab = rgbToLab(px.r, px.g, px.b)
  const grad = computeGradient(image, px.x, px.y)
  const lum = Math.round(0.299 * px.r + 0.587 * px.g + 0.114 * px.b)

  const neighborhood = useMemo(() => (
    [-1, 0, 1].map((dy) => [-1, 0, 1].map((dx) => pixelAt(image, px.x + dx, px.y + dy)))
  ), [image, px.x, px.y])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200/50 bg-white/40 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <div className="h-12 w-12 shrink-0 rounded-lg border-2 border-white shadow-lg dark:border-white/20"
          style={{ background: `rgb(${px.r},${px.g},${px.b})` }} />
        <div>
          <div className="font-mono text-lg font-bold text-slate-900 dark:text-slate-100">Pixel ({px.x}, {px.y})</div>
          <div className="font-mono text-xs font-semibold text-slate-500">Luminance = {lum}</div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200/50 pb-2 dark:border-white/10">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all duration-300 ${
              tab === t.id ? 'bg-brand-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/5'
            }`}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'rgb' && (
        <div className="space-y-3">
          {([['Red', px.r, 'bg-red-500'], ['Green', px.g, 'bg-emerald-500'], ['Blue', px.b, 'bg-blue-500']] as const).map(([label, val, color]) => (
            <div key={label} className="space-y-1.5">
              <div className="flex justify-between font-mono text-[11px] font-bold"><span className="text-slate-500">{label}</span><span className="text-slate-900 dark:text-white">{val}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div className={`h-full ${color} shadow-sm`} style={{ width: `${val / 255 * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="R" value={px.r} /><Stat label="G" value={px.g} /><Stat label="B" value={px.b} />
            <Stat label="Hex" value={`#${px.r.toString(16).padStart(2, '0')}${px.g.toString(16).padStart(2, '0')}${px.b.toString(16).padStart(2, '0')}`} />
            <Stat label="Alpha" value={px.a} />
            <Stat label="Lum" value={lum} highlight />
          </div>
        </div>
      )}

      {tab === 'hsv' && (
        <div className="space-y-4">
          <LearnBox>
            <strong>HSV</strong> (Hue, Saturation, Value) is a human-perceptual color space. Hue is the color angle (0°–360°). Saturation is how vivid. Value is brightness.
          </LearnBox>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Hue" value={`${hsv.h}°`} />
            <Stat label="Saturation" value={`${hsv.s}%`} />
            <Stat label="Value" value={`${hsv.v}%`} />
          </div>
          <div className="h-8 w-full overflow-hidden rounded-xl shadow-inner" style={{ background: 'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))' }}>
            <div className="h-full w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ marginLeft: `${hsv.h / 360 * 100}%` }} />
          </div>
        </div>
      )}

      {tab === 'lab' && (
        <div className="space-y-4">
          <LearnBox>
            <strong>L*a*b*</strong> is a perceptually uniform color space designed to match human vision. L* = lightness (0=black, 100=white). a* = green↔red axis. b* = blue↔yellow axis. Distances in L*a*b* correspond to perceived color differences.
          </LearnBox>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="L*" value={lab.L} />
            <Stat label="a*" value={lab.a} />
            <Stat label="b*" value={lab.b} />
          </div>
        </div>
      )}

      {tab === 'gradient' && (
        <div className="space-y-4">
          <LearnBox>
            The <strong>gradient</strong> measures how rapidly the image is changing. Gx = horizontal change, Gy = vertical change. Magnitude = √(Gx² + Gy²). High magnitude = sharp edge. Direction = the angle the edge runs.
          </LearnBox>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Gx (horizontal)" value={grad.gx} />
            <Stat label="Gy (vertical)" value={grad.gy} />
            <Stat label="Magnitude" value={grad.magnitude} highlight />
            <Stat label="Direction" value={`${grad.direction}°`} />
          </div>
        </div>
      )}

      {tab === 'neighbor' && (
        <div className="space-y-4">
          <LearnBox>
            The <strong>3×3 neighborhood</strong> is the pixel and its 8 surrounding pixels. Convolution kernels operate on this patch. The center pixel is the one you clicked.
          </LearnBox>
          <div className="grid max-w-sm grid-cols-3 gap-2 font-mono text-[10px]">
            {neighborhood.flatMap((row, r) => row.map((p, c) => (
              <div key={`${r}-${c}`}
                className={`flex h-20 flex-col items-center justify-center rounded-xl border gap-1 shadow-sm transition-transform hover:scale-105 ${r === 1 && c === 1 ? 'border-brand-400 bg-gradient-to-b from-brand-500/20 to-brand-500/5' : 'border-slate-200/50 bg-white/40 dark:border-white/10 dark:bg-white/5'}`}
              >
                <div className="h-5 w-5 rounded shadow-sm" style={{ background: `rgb(${p.r},${p.g},${p.b})` }} />
                <div className="font-bold text-slate-700 dark:text-slate-200">{Math.round(luminanceAt(image, p.x, p.y))}</div>
                <div className="text-[9px] text-slate-400">({p.x},{p.y})</div>
              </div>
            )))}
          </div>
        </div>
      )}
    </div>
  )
}
