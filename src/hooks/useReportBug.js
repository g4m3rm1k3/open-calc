import { useCallback, useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext.jsx'

// Optional Discord / Slack webhook — set VITE_BUG_WEBHOOK_URL in your .env file.
// Leave it unset to skip notifications (reports still save to Firestore).
const WEBHOOK_URL = import.meta.env.VITE_BUG_WEBHOOK_URL

async function sendWebhook(report) {
  if (!WEBHOOK_URL) return
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `🐛 ${report.title || 'Bug Report'}`,
          color: 0xe74c3c,
          fields: [
            { name: 'Category',    value: report.category,    inline: true },
            { name: 'From',        value: report.email || 'anonymous', inline: true },
            { name: 'Page',        value: report.page,        inline: false },
            { name: 'Description', value: report.description || '(no description)', inline: false },
            { name: 'Browser',     value: report.userAgent.slice(0, 120), inline: false },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: `uid: ${report.uid}` },
        }],
      }),
    })
  } catch {
    // Webhook failure is non-fatal — report is already in Firestore
  }
}

// Shared submission logic behind ReportBugButton's manual form and the root
// error boundary's automatic "Report this" action — one place that knows how
// to write a bugReports doc, so both stay consistent with what
// firestore.rules actually requires (a signed-in user; see "canSubmit").
export function useReportBug() {
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const submit = useCallback(async ({ title = '', description, category = 'bug' }) => {
    if (!user) throw new Error('Sign in to report this.')
    if (!description?.trim()) throw new Error('Please describe the issue.')

    const report = {
      uid: user.uid,
      email: user.email ?? 'unknown',
      title: title.trim() || '(no title)',
      description: description.trim(),
      category,
      page: window.location.href,
      userAgent: navigator.userAgent,
      status: 'new',
      createdAt: serverTimestamp(),
    }

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'bugReports'), report)
      // Sanitized public copy — title/description/category only, never the
      // email or userAgent above — so anyone can see what's been reported
      // without exposing anything from the private triage record.
      await addDoc(collection(db, 'bugs'), {
        uid: report.uid,
        displayName: user.displayName || 'Anonymous',
        title: report.title,
        description: report.description,
        category: report.category,
        status: 'open',
        createdAt: serverTimestamp(),
      })
      await sendWebhook(report)
    } finally {
      setSubmitting(false)
    }
  }, [user])

  return { submit, submitting, canSubmit: !!user }
}
