import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

// Read-only public feed backing the list inside ReportBugButton — sanitized
// copies written alongside the private `bugReports` doc in useReportBug.js.
// No submit path here; filing a bug still only ever happens through
// ReportBugButton's own form.
export function useBugBoard() {
  const [items, setItems] = useState(null) // null = loading

  useEffect(() => {
    const q = query(collection(db, 'bugs'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => setItems([]))
    return unsub
  }, [])

  return items
}
