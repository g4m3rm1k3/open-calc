import { Suspense, Component } from 'react'
import VizFrame from '../viz/VizFrame.jsx'

class PreviewBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
          <span className="text-3xl">⚠️</span>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{this.props.vizId} failed to render</p>
          <p className="text-xs font-mono text-red-400">{this.state.error.message}</p>
          <button onClick={() => this.setState({ error: null })} className="text-xs text-brand-600 underline">Retry</button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function VizPreview({ vizId, title, props }) {
  if (!vizId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
        <span className="text-5xl">🔭</span>
        <p className="text-slate-400 text-sm max-w-xs">Pick a template, load a viz from the gallery, or type a vizId in Code mode to see a live preview here.</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {title && (
        <div className="px-5 pt-4 pb-2 border-b border-slate-200 dark:border-slate-700">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</p>
        </div>
      )}
      <div className="p-4">
        <PreviewBoundary vizId={vizId} key={vizId}>
          <Suspense fallback={
            <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl h-64 flex items-center justify-center">
              <span className="text-slate-400 text-sm">Loading {vizId}…</span>
            </div>
          }>
            <VizFrame id={vizId} initialProps={props ?? {}} title={title} />
          </Suspense>
        </PreviewBoundary>
      </div>
    </div>
  )
}
