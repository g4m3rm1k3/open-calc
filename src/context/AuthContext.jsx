import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithCredential,
  signOut as fbSignOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Keys synced to Firestore — only meaningful user data, no caches or UI ephemera.
const SYNC_KEYS = [
  'oc-progress',      // course lesson progress (checkpoints, quiz scores, reading %)
  'oc-sticky-notes',  // user notes
  'oc-health-v1',     // health tracker logs
  'rfl-completed-v2', // robot arm lab mission completions
  'oc-pins',          // pinned lessons/tools
  'oc-theme',         // dark/light preference
]

// All app-owned localStorage keys — cleared on sign-out so shared computers stay clean.
// Wider than SYNC_KEYS: includes caches, ephemeral state, and game scores we don't sync.
const ALL_APP_KEYS_PREFIX = 'oc-'
const ALL_APP_KEYS_EXACT = [
  'open-calc-pinned-videos', 'open-calc-custom-videos', 'open-calc-video-progress',
  'openmat-documents', 'openmat-active-document-id',
  'oc_memory', 'oc_formulas',
  'cnc_tool_libraries_v1', 'csv4',
  'tetrisHighScore', 'ARKANOID_CUSTOM_LEVELS',
  'rfl-completed-v2', 'rfl-intro-seen',
  'universal-calc-recent-inputs',
]

function clearAllAppData() {
  // Clear everything with the oc- prefix (covers progress, wiki cache, notes, etc.)
  const toRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(ALL_APP_KEYS_PREFIX)) toRemove.push(key)
  }
  toRemove.forEach(k => localStorage.removeItem(k))
  ALL_APP_KEYS_EXACT.forEach(k => localStorage.removeItem(k))
}

function snapshotLocalStorage() {
  const data = {}
  for (const key of SYNC_KEYS) {
    const raw = localStorage.getItem(key)
    if (raw !== null) {
      try { data[key] = JSON.parse(raw) } catch { data[key] = raw }
    }
  }
  return data
}

function restoreToLocalStorage(data) {
  for (const [key, value] of Object.entries(data)) {
    if (key === '_syncedAt') continue
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    } catch {}
  }
}

async function pushToFirestore(uid) {
  const data = snapshotLocalStorage()
  if (Object.keys(data).length === 0) return
  const ref = doc(db, 'users', uid, 'appData', 'snapshot')
  await setDoc(ref, { ...data, _syncedAt: Date.now() }, { merge: true })
}

async function syncOnSignIn(uid) {
  const ref = doc(db, 'users', uid, 'appData', 'snapshot')
  const snap = await getDoc(ref)
  if (snap.exists()) {
    restoreToLocalStorage(snap.data())
  } else {
    const data = snapshotLocalStorage()
    if (Object.keys(data).length > 0) {
      await setDoc(ref, { ...data, _syncedAt: Date.now() })
      for (const key of SYNC_KEYS) localStorage.removeItem(key)
      restoreToLocalStorage(data)
    }
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading, null = signed out
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setSyncing(true)
        try { await syncOnSignIn(fbUser.uid) }
        catch (e) { console.warn('[AuthContext] sync error:', e) }
        finally { setSyncing(false) }
        setUser(fbUser)
      } else {
        setUser(null)
      }
    })
    return unsub
  }, [])

  // Push to Firestore when the tab is hidden or the page is closed
  useEffect(() => {
    if (!user) return
    const push = () => pushToFirestore(user.uid).catch(() => {})
    const onVisibility = () => { if (document.visibilityState === 'hidden') push() }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('beforeunload', push)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('beforeunload', push)
    }
  }, [user])

  const signInWithGoogle   = () => signInWithPopup(auth, new GoogleAuthProvider())
  const signInWithFacebook = () => signInWithPopup(auth, new FacebookAuthProvider())
  const signInWithGithub   = () => signInWithPopup(auth, new GithubAuthProvider())
  const signInWithApple    = () => signInWithPopup(auth, new OAuthProvider('apple.com'))

  const signInWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const signUpWithEmail = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password)

  const signOut = async () => {
    if (user) await pushToFirestore(user.uid).catch(() => {})
    await fbSignOut(auth)
    clearAllAppData()
  }

  return (
    <AuthContext.Provider value={{
      user, syncing,
      signInWithGoogle, signInWithFacebook, signInWithGithub, signInWithApple,
      signInWithEmail, signUpWithEmail,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
