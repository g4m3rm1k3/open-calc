import { useState, useEffect } from 'react'
import type { CalendarEvent, UserEventType, NotificationOffset } from './types'
import {
  EVENT_COLORS, USER_EVENT_TYPE_LABELS, ALL_NOTIFICATION_OFFSETS, NOTIFICATION_LABELS,
} from './types'
import { requestPermission, getPermissionStatus } from './notifications'

interface Props {
  event?: CalendarEvent | null
  defaultStart?: string
  defaultEnd?: string
  onSave: (data: Omit<CalendarEvent, 'id'>) => void
  onDelete?: () => void
  onClose: () => void
}

const TYPE_OPTIONS = Object.entries(USER_EVENT_TYPE_LABELS) as [UserEventType, string][]

function toLocalInput(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(val: string): string {
  return new Date(val).toISOString()
}

// Color dot rendered via a tiny inline SVG so we avoid inline style on a div
function ColorDot({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="6" fill={color} />
    </svg>
  )
}

export default function EventModal({ event, defaultStart, defaultEnd, onSave, onDelete, onClose }: Props) {
  const isEdit = !!event

  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [type, setType] = useState<UserEventType>(
    (event?.type && event.type in USER_EVENT_TYPE_LABELS ? event.type as UserEventType : null) ?? 'task'
  )
  const [start, setStart] = useState(
    event ? toLocalInput(event.start) : (defaultStart ?? toLocalInput(new Date().toISOString()))
  )
  const [end, setEnd] = useState(
    event ? toLocalInput(event.end) : (defaultEnd ?? toLocalInput(new Date(Date.now() + 3600000).toISOString()))
  )
  const [allDay, setAllDay] = useState(event?.allDay ?? false)
  const [notifications, setNotifications] = useState<NotificationOffset[]>(event?.notifications ?? [60])
  const [notifStatus, setNotifStatus] = useState(getPermissionStatus())

  useEffect(() => {
    setNotifStatus(getPermissionStatus())
  }, [])

  const color = EVENT_COLORS[type]

  const handleNotifToggle = (offset: NotificationOffset) => {
    setNotifications(prev =>
      prev.includes(offset) ? prev.filter(o => o !== offset) : [...prev, offset]
    )
  }

  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    setNotifStatus(granted ? 'granted' : 'denied')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      start: allDay ? start.split('T')[0] : fromLocalInput(start),
      end: allDay ? end.split('T')[0] : fromLocalInput(end),
      allDay,
      color,
      notifications: allDay ? [] : notifications,
      completed: event?.completed ?? false,
      lessonRef: event?.lessonRef,
      labRef: event?.labRef,
    })
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <ColorDot color={color} />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
              {isEdit ? 'Edit Event' : 'New Event'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none w-7 h-7 flex items-center justify-center rounded"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor="event-title"
              className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
            >
              Title *
            </label>
            <input
              id="event-title"
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What's happening?"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-brand-400 dark:focus:border-brand-500"
            />
          </div>

          {/* Type */}
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Type
            </p>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map(([t, label]) => {
                const active = type === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    aria-pressed={active ? 'true' : 'false'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      active
                        ? 'text-white border-transparent'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                    }`}
                    /* dynamic color — no Tailwind equivalent for arbitrary hex */
                    {...(active ? { style: { backgroundColor: EVENT_COLORS[t] } } : {})}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* All day toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={allDay ? 'true' : 'false'}
              aria-label="All day event"
              onClick={() => setAllDay(v => !v)}
              className={`w-10 h-5 rounded-full transition-colors shrink-0 relative ${
                allDay ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform ${
                  allDay ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className="text-sm text-slate-700 dark:text-slate-300 select-none">All day</span>
          </div>

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="event-start"
                className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
              >
                Start
              </label>
              <input
                id="event-start"
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? start.split('T')[0] : start}
                onChange={e => setStart(e.target.value)}
                title="Event start"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <label
                htmlFor="event-end"
                className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
              >
                End
              </label>
              <input
                id="event-end"
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? end.split('T')[0] : end}
                onChange={e => setEnd(e.target.value)}
                title="Event end"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-brand-400"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="event-notes"
              className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
            >
              Notes
            </label>
            <textarea
              id="event-notes"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional notes…"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-brand-400 resize-none"
            />
          </div>

          {/* Notifications */}
          {!allDay && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Notifications
                </p>
                {notifStatus === 'default' && (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="text-xs text-brand-600 dark:text-brand-400 underline"
                  >
                    Enable notifications
                  </button>
                )}
                {notifStatus === 'denied' && (
                  <span className="text-xs text-red-500">Blocked in browser settings</span>
                )}
                {notifStatus === 'granted' && (
                  <span className="text-xs text-emerald-500">✓ Enabled</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {ALL_NOTIFICATION_OFFSETS.map(offset => (
                  <label key={offset} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.includes(offset)}
                      onChange={() => handleNotifToggle(offset)}
                      className="rounded accent-brand-500"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {NOTIFICATION_LABELS[offset]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {isEdit && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="text-xs text-red-500 hover:text-red-600 font-semibold underline underline-offset-2"
              >
                Delete event
              </button>
            ) : <span />}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-semibold"
              >
                {isEdit ? 'Save changes' : 'Create event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
