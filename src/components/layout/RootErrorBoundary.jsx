import { Component, useState } from 'react'
import { useReportBug } from '../../hooks/useReportBug.js'

// Wraps the whole route tree in App.jsx. Before this, a crash anywhere in a
// page component (not caught by one of the narrower boundaries like
// VizErrorBoundary or LabErrorBoundary) blanked the entire app to a white
// screen — same severity for a typo in one lesson's viz as for something
// actually serious. This always shows what broke and offers to report it.
export default class RootErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
    console.error('[RootErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          componentStack={this.state.info?.componentStack}
          onReset={() => this.setState({ error: null, info: null })}
        />
      )
    }
    return this.props.children
  }
}

function ErrorFallback({ error, componentStack, onReset }) {
  const { submit, submitting, canSubmit } = useReportBug()
  const [reportStatus, setReportStatus] = useState('idle') // idle | done | error

  const report = async () => {
    try {
      await submit({
        title: `Crash: ${error.message}`.slice(0, 120),
        description: `${error.message}\n\nComponent stack:\n${componentStack ?? '(unavailable)'}`,
        category: 'bug',
      })
      setReportStatus('done')
    } catch {
      setReportStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-slate-950">
      <div className="max-w-md w-full text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Something broke
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
          This page hit an error and couldn't render. Your other tabs and data are fine.
        </p>
        <p className="text-xs font-mono text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 mt-4 mb-6 break-words text-left">
          {error.message}
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            Reload the page
          </button>
          <button
            onClick={onReset}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Try to continue without reloading
          </button>

          {reportStatus === 'done' ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 pt-1">✓ Reported — thanks for flagging it.</p>
          ) : canSubmit ? (
            <button
              onClick={report}
              disabled={submitting}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors pt-1 disabled:opacity-50"
            >
              {submitting ? 'Reporting…' : reportStatus === 'error' ? "Couldn't report — try again?" : 'Report this'}
            </button>
          ) : (
            <p className="text-xs text-slate-400 pt-1">Sign in to report this error.</p>
          )}
        </div>
      </div>
    </div>
  )
}
