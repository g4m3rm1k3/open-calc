import { useState } from 'react'
import { useContributorMode } from '../../hooks/useContributorMode'
import CloneProgressModal from './CloneProgressModal'

export default function ContributorGate({ children, label = 'editing' }) {
  const { isElectron, isCloned, devFsAvailable, loading } = useContributorMode()
  const [cloning, setCloning] = useState(false)
  const [cloneError, setCloneError] = useState(null)
  const [justCloned, setJustCloned] = useState(false)

  if (loading) return null

  if (devFsAvailable || justCloned) return children

  if (cloning) {
    return (
      <CloneProgressModal
        onComplete={() => { setCloning(false); setJustCloned(true) }}
        onError={(err) => { setCloning(false); setCloneError(err) }}
      />
    )
  }

  if (isElectron && !isCloned) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
        <div style={{ fontSize: 40 }}>📦</div>
        <div>
          <p className="text-sm font-semibold text-slate-200 mb-1">Contributor mode</p>
          <p className="text-xs text-slate-400 max-w-xs">
            {label} requires a local copy of the repository (~30 MB one-time download).
          </p>
        </div>
        {cloneError && (
          <p className="text-xs text-red-400 max-w-xs">{cloneError}</p>
        )}
        <button
          onClick={() => { setCloneError(null); setCloning(true) }}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#238636' }}
        >
          Download & enable →
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
      <div style={{ fontSize: 36 }}>🖥️</div>
      <div>
        <p className="text-sm font-semibold text-slate-200 mb-1">Desktop app required</p>
        <p className="text-xs text-slate-400 max-w-xs">
          Contributing lessons and diagrams requires the OpenCalc desktop app.
          The web version is read-only.
        </p>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        <a
          href="https://github.com/g4m3rm1k3/upskillos/releases/latest"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
          style={{ background: '#238636' }}
        >
          Download desktop app →
        </a>
        <a
          href="https://github.com/g4m3rm1k3/upskillos"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300"
          style={{ border: '1px solid #30363d', background: 'transparent' }}
        >
          Run locally
        </a>
      </div>
    </div>
  )
}
