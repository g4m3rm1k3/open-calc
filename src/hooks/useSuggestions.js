import { useCallback, useEffect, useState } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext.jsx'
import { containsProfanity } from '../utils/profanityFilter.js'

// Public, live-updating feed of ideas/feature requests — separate from the
// private `bugReports` collection behind ReportBugButton (admin-only read,
// see firestore.rules), which stays exactly as it was.
export function useSuggestions() {
  const [items, setItems] = useState(null) // null = loading

  useEffect(() => {
    const q = query(collection(db, 'suggestions'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => setItems([]))
    return unsub
  }, [])

  return items
}

export function useSubmitSuggestion() {
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const submit = useCallback(async ({ title, description }) => {
    if (!user) throw new Error('Sign in to submit this.')
    const trimmedTitle = title?.trim() ?? ''
    const trimmedDesc = description?.trim() ?? ''
    if (!trimmedTitle) throw new Error('Please add a short title.')
    if (!trimmedDesc) throw new Error('Please describe it.')
    if (containsProfanity(trimmedTitle) || containsProfanity(trimmedDesc)) {
      throw new Error('Please remove inappropriate language before submitting.')
    }

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'suggestions'), {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        title: trimmedTitle.slice(0, 120),
        description: trimmedDesc.slice(0, 2000),
        status: 'open',
        createdAt: serverTimestamp(),
      })
    } finally {
      setSubmitting(false)
    }
  }, [user])

  return { submit, submitting, canSubmit: !!user }
}
