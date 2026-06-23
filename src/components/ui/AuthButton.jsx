import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
)

function SignInModal({ onClose }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(null)

  const handleGoogle = async () => {
    setError(''); setLoading('google')
    try { await signInWithGoogle(); onClose() }
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
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">✕</button>

        <div className="text-center mb-6">
          <div className="text-2xl font-black text-brand-600 dark:text-brand-400 mb-1">∂ UpSkillOS</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to sync your progress across devices</p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={!!loading}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm border disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-4"
          style={{ background: '#fff', color: '#1f1f1f', border: '1.5px solid #dadce0' }}
        >
          <span className="w-5 flex-shrink-0 flex items-center justify-center">{GOOGLE_ICON}</span>
          <span className="flex-1 text-left">{loading === 'google' ? 'Signing in…' : 'Continue with Google'}</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
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
              type="submit" disabled={!!loading} onClick={() => setMode('signin')}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold disabled:opacity-50 transition-colors"
            >
              {loading === 'email' && mode === 'signin' ? 'Signing in…' : 'Sign in'}
            </button>
            <button
              type="submit" disabled={!!loading} onClick={() => setMode('signup')}
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
        <Link
          to="/profile"
          onClick={onClose}
          className="block w-full text-left text-sm px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
        >
          View profile
        </Link>
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
  const [failedPhotoURL, setFailedPhotoURL] = useState(null)

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
        ) : user.photoURL && user.photoURL !== failedPhotoURL ? (
          <img
            src={user.photoURL}
            alt=""
            className="w-7 h-7 rounded-full ring-2 ring-brand-500/60"
            onError={() => setFailedPhotoURL(user.photoURL)}
          />
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
