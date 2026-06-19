import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

// ── Localhost guard ───────────────────────────────────────────────────────────
// Never write to production Firestore from a dev machine.
// Developers can comment this out intentionally if they need to test sync.
const IS_LOCAL_ENV =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.endsWith('.local'))

// ── Keys that should follow the user across devices ───────────────────────────
// Keep this list small — only data that is meaningful to restore on a new device.
// Workspace files, scratch pads, and caches stay local only.
const SYNC_KEYS = [
  'oc-progress',    // course lesson progress (checkpoints, quiz scores, reading %)
  'oc-calendar',    // calendar events + notification config
  'oc-health-v1',   // health tracker logs and profile
  'oc-rpg-data',    // RPG fitness progression, workout history
  'oc-pins',        // pinned lessons / tools
  'oc-theme',       // dark / light preference
]

// Timestamp we write to localStorage after every successful Firestore restore,
// so we can detect if the user has made local changes since their last sync.
const TS_KEY = '_oc_synced_ts'

// ── All app-owned keys — cleared on sign-out ──────────────────────────────────
const ALL_APP_KEYS_PREFIX = 'oc-'
const ALL_APP_KEYS_EXACT = [
  'open-calc-pinned-videos', 'open-calc-custom-videos', 'open-calc-video-progress',
  'openmat-documents', 'openmat-active-document-id',
  'oc_memory', 'oc_formulas',
  'cnc_tool_libraries_v1', 'csv4',
  'tetrisHighScore', 'ARKANOID_CUSTOM_LEVELS',
  'rfl-completed-v2', 'rfl-intro-seen',
  'universal-calc-recent-inputs',
  TS_KEY,
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function safeJSON(raw) {
  if (raw == null) return null
  try { return JSON.parse(raw) } catch { return null }
}

function clearAllAppData() {
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
      data[key] = safeJSON(raw) ?? raw
    }
  }
  return data
}

function restoreToLocalStorage(data) {
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('_')) continue // skip metadata fields like _syncedAt
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    } catch {}
  }
}

// ── Progress merge ────────────────────────────────────────────────────────────
// Course progress is accumulative — checkpoints are never un-done.
// Union both versions so no work is ever lost, regardless of which device was newer.
function mergeProgress(local, remote) {
  if (!local && !remote) return null
  if (!local) return remote
  if (!remote) return local
  const merged = { ...remote }
  for (const [id, localLesson] of Object.entries(local)) {
    if (!merged[id]) {
      merged[id] = localLesson
      continue
    }
    const r = merged[id]
    merged[id] = {
      ...r,
      completedCheckpoints: [
        ...new Set([...(r.completedCheckpoints ?? []), ...(localLesson.completedCheckpoints ?? [])]),
      ],
      readingProgress: Math.max(r.readingProgress ?? 0, localLesson.readingProgress ?? 0),
      // Keep whichever quiz attempt is more recent
      quiz: ((localLesson.quiz?.attemptedAt ?? 0) > (r.quiz?.attemptedAt ?? 0))
        ? localLesson.quiz
        : r.quiz,
    }
  }
  return merged
}

// ── Firestore operations ──────────────────────────────────────────────────────
async function pushToFirestore(uid) {
  if (IS_LOCAL_ENV) return // never write dev data to production
  const data = snapshotLocalStorage()
  if (Object.keys(data).length === 0) return
  const ref = doc(db, 'users', uid, 'appData', 'snapshot')
  await setDoc(ref, { ...data, _syncedAt: Date.now() }, { merge: true })
}

async function syncOnSignIn(uid) {
  if (IS_LOCAL_ENV) {
    if (import.meta.env.DEV) {
      console.info('[Auth] Localhost — Firestore sync skipped to protect production data.')
    }
    return
  }

  const ref = doc(db, 'users', uid, 'appData', 'snapshot')
  const snap = await getDoc(ref)
  const localTs = parseInt(localStorage.getItem(TS_KEY) ?? '0')

  if (snap.exists()) {
    const remote = snap.data()
    const remoteTs = remote._syncedAt ?? 0

    // Always merge progress — accumulative data, take the union
    const localProgress = safeJSON(localStorage.getItem('oc-progress'))
    const merged = mergeProgress(localProgress, remote['oc-progress'] ?? null)

    if (remoteTs >= localTs) {
      // Firestore is the authority for most keys
      restoreToLocalStorage(remote)
    }

    // Apply merged progress (may be better than what Firestore had)
    if (merged) {
      localStorage.setItem('oc-progress', JSON.stringify(merged))
    }

    localStorage.setItem(TS_KEY, String(remoteTs))

    // If merged progress is richer than what Firestore had, push the improvement up
    const remoteProgressStr = JSON.stringify(remote['oc-progress'] ?? null)
    if (merged && JSON.stringify(merged) !== remoteProgressStr) {
      await setDoc(ref, { 'oc-progress': merged, _syncedAt: Date.now() }, { merge: true })
    }

  } else {
    // First sign-in for this account — upload whatever local data exists
    const local = snapshotLocalStorage()
    if (Object.keys(local).length > 0) {
      await setDoc(ref, { ...local, _syncedAt: Date.now() })
      localStorage.setItem(TS_KEY, String(Date.now()))
    }
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(undefined) // undefined = loading, null = signed out
  const [syncing, setSyncing] = useState(false)
  const userRef = useRef(null) // stable ref for interval / event callbacks

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      userRef.current = fbUser
      if (fbUser) {
        setSyncing(true)
        try { await syncOnSignIn(fbUser.uid) }
        catch (e) { console.warn('[Auth] sync error:', e) }
        finally { setSyncing(false) }
        setUser(fbUser)
      } else {
        setUser(null)
      }
    })
    return unsub
  }, [])

  // Save on tab hide / page unload + every 5 minutes while signed in
  useEffect(() => {
    if (!user || IS_LOCAL_ENV) return

    const push = () => pushToFirestore(user.uid).catch(() => {})
    const onVisibility = () => { if (document.visibilityState === 'hidden') push() }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('beforeunload', push)
    const interval = setInterval(push, 5 * 60 * 1000) // every 5 minutes

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('beforeunload', push)
      clearInterval(interval)
    }
  }, [user])

  // Immediate save — call this from ProgressContext after a checkpoint / quiz completes
  const pushNow = useCallback(() => {
    if (userRef.current && !IS_LOCAL_ENV) {
      pushToFirestore(userRef.current.uid).catch(() => {})
    }
  }, [])

  const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider())
  const signInWithEmail  = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const signUpWithEmail  = (email, password) => createUserWithEmailAndPassword(auth, email, password)

  // GitHub's OAuth access token is only returned on the popup result itself —
  // Firebase does not restore it on session refresh — so callers must request
  // it fresh right before they need it (e.g. right before opening a PR) and
  // hold it in memory only, never persist it alongside the synced app keys.
  const signInWithGithubForContribution = async () => {
    const provider = new GithubAuthProvider()
    provider.addScope('public_repo')
    const result = await signInWithPopup(auth, provider)
    const credential = GithubAuthProvider.credentialFromResult(result)
    return { user: result.user, token: credential?.accessToken ?? null }
  }

  const signOut = async () => {
    if (user && !IS_LOCAL_ENV) await pushToFirestore(user.uid).catch(() => {})
    await fbSignOut(auth)
    clearAllAppData()
  }

  return (
    <AuthContext.Provider value={{ user, syncing, signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithGithubForContribution, signOut, pushNow }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
