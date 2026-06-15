import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class LabErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error(`[${this.props.label ?? 'Lab'}] render error:`, error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      const { backTo = '/', backLabel = 'Go back', label = 'This lab' } = this.props
      return (
        <div className="py-20 px-6 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {label} failed to load
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-mono">
            {this.state.error.message}
          </p>
          <Link to={backTo} className="text-brand-600 hover:underline dark:text-brand-400">
            {backLabel}
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}
