import { useState, useEffect } from 'react'

function todayBranch() {
  const d = new Date()
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 6)
  return `contrib/${ymd}-${rand}`
}

export default function CreatePRModal({ files = [], onClose }) {
  const [branch, setBranch]     = useState(todayBranch)
  const [title, setTitle]       = useState('')
  const [description, setDesc]  = useState('')
  const [token, setToken]       = useState(() => sessionStorage.getItem('oc-gh-token') || '')
  const [status, setStatus]     = useState(null) // null | 'loading' | { ok, prUrl } | { error }

  useEffect(() => {
    if (token) sessionStorage.setItem('oc-gh-token', token)
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setStatus('loading')
    try {
      const r = await fetch('/api/github/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          branchName: branch.trim(),
          files,
          githubToken: token.trim() || undefined,
        }),
      })
      const data = await r.json()
      if (data.ok) {
        setStatus({ ok: true, prUrl: data.prUrl })
      } else {
        setStatus({ error: data.error || 'Unknown error' })
      }
    } catch (err) {
      setStatus({ error: err.message })
    }
  }

  const inputStyle = {
    width: '100%', background: '#0d1117', border: '1px solid #30363d',
    borderRadius: 6, padding: '6px 10px', color: '#e6edf3', fontSize: 13,
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = { fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 4 }

  return (
    <div
      className="fixed inset-0 z-[700] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#161b22', border: '1px solid #30363d', borderRadius: 12,
          width: 520, maxWidth: '95vw', padding: 24,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <span style={{ color: '#e6edf3', fontWeight: 600, fontSize: 15 }}>Create Pull Request</span>
          <button onClick={onClose} style={{ color: '#8b949e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>

        {status === 'loading' ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#8b949e', fontSize: 14 }}>
            Creating PR…
          </div>
        ) : status?.ok ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ color: '#3fb950', fontSize: 28, marginBottom: 12 }}>✓</div>
            <p style={{ color: '#e6edf3', marginBottom: 16, fontSize: 14 }}>Pull request created!</p>
            <a
              href={status.prUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-block', background: '#238636', color: '#fff',
                padding: '8px 20px', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600,
              }}
            >
              Open on GitHub →
            </a>
            <br />
            <button onClick={onClose} style={{ marginTop: 12, color: '#8b949e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status?.error && (
              <div style={{ background: '#3d1515', border: '1px solid #f87171', borderRadius: 6, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#f87171' }}>
                {status.error}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Branch name</label>
              <input style={inputStyle} value={branch} onChange={e => setBranch(e.target.value)} required />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>PR title <span style={{ color: '#f87171' }}>*</span></label>
              <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Fix: …" required />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Description (optional)</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 72, fontFamily: 'inherit' }}
                value={description}
                onChange={e => setDesc(e.target.value)}
                placeholder="What did you change and why?"
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>
                GitHub token{' '}
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=OpenCalc+contributor"
                  target="_blank" rel="noreferrer"
                  style={{ color: '#58a6ff', fontSize: 11 }}
                >
                  generate one →
                </a>
              </label>
              <input
                style={inputStyle}
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="ghp_… (saved in sessionStorage for this session)"
              />
            </div>

            <div style={{ marginBottom: 16, background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: '8px 12px' }}>
              <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 6 }}>Files in this PR ({files.length})</div>
              {files.map(f => (
                <div key={f.path} style={{ fontSize: 11, fontFamily: 'monospace', color: '#3fb950' }}>+ {f.path}</div>
              ))}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button" onClick={onClose}
                style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid #30363d', background: 'transparent', color: '#8b949e', cursor: 'pointer', fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || files.length === 0}
                style={{
                  padding: '7px 20px', borderRadius: 6, border: 'none',
                  background: title.trim() && files.length > 0 ? '#238636' : '#21262d',
                  color: title.trim() && files.length > 0 ? '#fff' : '#484f58',
                  cursor: title.trim() && files.length > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: 600, fontSize: 13,
                }}
              >
                Create PR
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
