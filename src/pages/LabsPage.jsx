import { useEffect } from 'react'
import { FlaskConical, Sparkles } from 'lucide-react'
import LabWorkbenchBackground from '../components/labs/LabWorkbenchBackground.jsx'
import LabCard from '../components/cards/LabCard.jsx'
import { LABS } from '../data/labs.js'

export default function LabsPage() {
  useEffect(() => {
    document.title = 'Labs — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  return (
    <div className="relative min-h-[calc(100vh-9rem)] text-white">
      <LabWorkbenchBackground />

      <div className="relative z-10 mx-auto max-w-5xl pt-6 sm:pt-10">
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-[8px] border border-emerald-200/20 bg-emerald-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-100 backdrop-blur-md">
            <FlaskConical className="h-4 w-4" />
            Labs
          </div>
          <h1 className="mb-4 text-4xl font-black leading-tight text-white sm:text-6xl">
            Live simulations with the engine humming underneath.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-100/76 sm:text-lg">
            Hands-on simulations and interactive tools for experimenting, modeling, and building.
          </p>
        </div>

        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-emerald-100/80">
          <Sparkles className="h-4 w-4" />
          <span>Interactive 3D lab backdrop active</span>
        </div>

        <div className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {LABS.map(lab => (
            <LabCard key={lab.key} item={lab} />
          ))}
        </div>
      </div>
    </div>
  )
}
