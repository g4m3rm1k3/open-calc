import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../context/AuthContext'

const PROVIDERS = [
  {
    id: 'google',
    label: 'Continue with Google',
    bg: '#fff',
    color: '#1f1f1f',
    border: '#dadce0',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Continue with Facebook',
    bg: '#1877F2',
    color: '#fff',
    border: '#1877F2',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.03 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.67 4.533-4.67 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.093 24 18.103 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: 'apple',
    label: 'Continue with Apple',
    bg: '#000',
    color: '#fff',
    border: '#000',
    icon: (
      <svg width="18" height="18" viewBox="0 0 814 1000" fill="#fff">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-38.8-155.5-127.4C46 790.8 0 663.5 0 541.5 0 341.3 125.9 235.8 249.5 235.8c66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'Continue with GitHub',
    bg: '#24292e',
    color: '#fff',
    border: '#24292e',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
        <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
]

function SignInModal({ onClose }) {
  const { signInWithGoogle, signInWithFacebook, signInWithGithub, signInWithApple, signInWithEmail, signUpWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(null)

  const providerFns = {
    google: signInWithGoogle,
    facebook: signInWithFacebook,
    apple: signInWithApple,
    github: signInWithGithub,
  }

  const handleProvider = async (id) => {
    setError(''); setLoading(id)
    try { await providerFns[id](); onClose() }
    catch (e) { setError(e.message); setLoading(null) }
  }

  const handleEmail = async (e) => {
    e.preventDefault(); setError(''); setLoading('email')
    try {
      if (mode === 'signin') await signInWithEmail(email, password)
      else await signUpWithEmail(email, password)
      onClose()
    } catch (e) {
      setError(e.message); setLoading(null)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-2xl font-black text-brand-600 dark:text-brand-400 mb-1">∂ UpSkillOS</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to sync your progress across devices</p>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => handleProvider(p.id)}
              disabled={!!loading}
              style={{ background: p.bg, color: p.color, border: `1.5px solid ${p.border}` }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-50 hover:opacity-90"
            >
              <span className="w-5 flex-shrink-0 flex items-center justify-center">{p.icon}</span>
              <span className="flex-1 text-left">{loading === p.id ? 'Signing in…' : p.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <form onSubmit={handleEmail} className="flex flex-col gap-2">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" required
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500"
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password" required minLength={6}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button
              type="submit" disabled={!!loading}
              onClick={() => setMode('signin')}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold disabled:opacity-50 transition-colors"
            >
              {loading === 'email' && mode === 'signin' ? 'Signing in…' : 'Sign in'}
            </button>
            <button
              type="submit" disabled={!!loading}
              onClick={() => setMode('signup')}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {loading === 'email' && mode === 'signup' ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

function UserMenu({ user, syncing, signOut, onClose }) {
  return createPortal(
    <>
      <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={onClose} />
      <div
        className="fixed right-4 top-16 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3"
        style={{ zIndex: 9999 }}
      >
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate mb-1 px-1">
          {user.displayName || user.email}
        </div>
        <div className="text-[11px] text-slate-400 px-1 mb-3 leading-relaxed">
          {syncing ? 'Syncing…' : 'Data synced across devices'}
        </div>
        <button
          onClick={() => { onClose(); signOut() }}
          className="w-full text-left text-sm px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
        >
          Sign out
        </button>
      </div>
    </>,
    document.body
  )
}

export default function AuthButton() {
  const { user, syncing, signOut } = useAuth()
  const [showSignIn, setShowSignIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  if (user === undefined) return null

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowSignIn(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white transition-all whitespace-nowrap"
        >
          Sign in
        </button>
        {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
      </>
    )
  }

  return (
    <>
      <button onClick={() => setMenuOpen(o => !o)} className="flex items-center rounded-full focus:outline-none flex-shrink-0">
        {syncing ? (
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center animate-pulse">
            <span className="text-[10px] text-slate-400">…</span>
          </div>
        ) : user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full ring-2 ring-brand-500/60" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
            {(user.displayName || user.email || '?')[0].toUpperCase()}
          </div>
        )}
      </button>
      {menuOpen && <UserMenu user={user} syncing={syncing} signOut={signOut} onClose={() => setMenuOpen(false)} />}
    </>
  )
}
