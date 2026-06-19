export const meta = {
  title: 'Calendar',
  description: 'Full task and event tracker built on FullCalendar. Creates, edits, and deletes user events. Shows lesson completions as read-only progress overlays. Syncs to Firebase.',
  concept: 'Feature Module',
  conceptDetail: 'Self-contained feature with its own types, hook, modal, and notification system. The rest of the app only knows the /calendar route — internal wiring is invisible outside.',
  jumpTo: '/calendar',
}

import { useState, useRef, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateSelectArg, EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core'
import { useNavigate } from 'react-router-dom'
import { useCalendar } from './useCalendar'
import EventModal from './EventModal'
import type { CalendarEvent } from './types'
import { EVENT_COLORS } from './types'

type ModalState =
  | { mode: 'closed' }
  | { mode: 'create'; start: string; end: string }
  | { mode: 'edit'; event: CalendarEvent }
  | { mode: 'detail'; event: CalendarEvent }

function toFCEvent(ev: CalendarEvent): EventInput {
  return {
    id: ev.id,
    title: ev.title,
    start: ev.start,
    end: ev.end,
    allDay: ev.allDay,
    backgroundColor: ev.color ?? EVENT_COLORS[ev.type],
    borderColor: ev.color ?? EVENT_COLORS[ev.type],
    textColor: '#fff',
    extendedProps: { completed: ev.completed, type: ev.type, description: ev.description },
    classNames: ev.completed ? ['fc-event-completed'] : [],
  }
}

function DetailPanel({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const start = new Date(event.start)
  const end = new Date(event.end)
  const fmt = (d: Date) => d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <circle cx="5" cy="5" r="5" fill={event.color ?? EVENT_COLORS[event.type]} />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {event.type}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{event.title}</h2>

        {event.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{event.description}</p>
        )}

        <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1">
          {event.allDay ? (
            <p>{start.toLocaleDateString([], { dateStyle: 'full' })}</p>
          ) : (
            <>
              <p>{fmt(start)}</p>
              <p>→ {fmt(end)}</p>
            </>
          )}
        </div>

        {event.lessonRef && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">Lesson: <span className="font-medium text-slate-600 dark:text-slate-300">{event.lessonRef}</span></p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const calendarRef = useRef<FullCalendar>(null)
  const { events, progressEvents, addEvent, updateEvent, deleteEvent } = useCalendar()
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })

  const closeModal = useCallback(() => setModal({ mode: 'closed' }), [])

  const handleDateSelect = useCallback((info: DateSelectArg) => {
    setModal({ mode: 'create', start: info.startStr, end: info.endStr })
    calendarRef.current?.getApi().unselect()
  }, [])

  const handleEventClick = useCallback((info: EventClickArg) => {
    const id = info.event.id
    // Auto-tracked progress events → read-only detail view
    if (id.startsWith('progress-')) {
      const ev = progressEvents.find(e => e.id === id)
      if (ev) setModal({ mode: 'detail', event: ev })
      return
    }
    // User events → edit modal
    const ev = events.find(e => e.id === id)
    if (ev) setModal({ mode: 'edit', event: ev })
  }, [events, progressEvents])

  const handleEventDrop = useCallback((info: EventDropArg) => {
    // Progress events are not draggable — reject the drop
    if (info.event.id.startsWith('progress-')) { info.revert(); return }
    updateEvent(info.event.id, {
      start: info.event.startStr,
      end: info.event.endStr ?? info.event.startStr,
    })
  }, [updateEvent])

  // Progress events as compact regular events (interactive, clickable)
  const progressFCEvents: EventInput[] = progressEvents.map(ev => ({
    ...toFCEvent(ev),
    // Show a short pill — just the percentage so it doesn't crowd the cell
    title: `📚 ${ev.title.match(/(\d+%)$/)?.[1] ?? '?'}`,
    backgroundColor: EVENT_COLORS.progress + 'bb',
    borderColor: 'transparent',
    classNames: ['fc-progress-event'],
  }))

  const allFCEvents: EventInput[] = [
    ...events.map(toFCEvent),
    ...progressFCEvents,
  ]

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title="Back"
        >
          ←
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
          Calendar
        </h1>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => {
            const now = new Date().toISOString()
            setModal({ mode: 'create', start: now, end: new Date(Date.now() + 3600000).toISOString() })
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors"
        >
          + New Event
        </button>
      </div>

      {/* Calendar — overflow-y-auto on the wrapper, height="auto" on FC so cells never collapse */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5">
        <style>{`
          /* Base */
          .fc { font-family: inherit; }
          .fc .fc-toolbar { flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
          .fc .fc-toolbar-title { font-size: 1rem; font-weight: 800; letter-spacing: -0.02em; }

          /* Buttons */
          .fc .fc-button {
            background: transparent !important;
            border: 1px solid #e2e8f0 !important;
            color: #475569 !important;
            font-size: 0.7rem !important;
            font-weight: 700 !important;
            padding: 4px 10px !important;
            border-radius: 8px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.06em !important;
            box-shadow: none !important;
          }
          .fc .fc-button:hover { background: #f1f5f9 !important; }
          .fc .fc-button-primary:not(:disabled).fc-button-active,
          .fc .fc-button-primary:not(:disabled):active {
            background: #6366f1 !important;
            border-color: #6366f1 !important;
            color: #fff !important;
          }

          /* Events */
          .fc .fc-event { border-radius: 5px; font-size: 0.72rem; font-weight: 600; cursor: pointer; }
          .fc .fc-daygrid-event { padding: 1px 4px; margin-top: 1px; }
          .fc-event-completed { opacity: 0.5; text-decoration: line-through; }
          .fc-progress-event { opacity: 0.8; font-size: 0.68rem !important; }

          /* Day cells */
          .fc .fc-daygrid-day { min-height: 80px; }
          .fc .fc-daygrid-day.fc-day-today { background: rgba(99,102,241,0.05); }
          .fc .fc-highlight { background: rgba(99,102,241,0.12); }

          /* Grid lines */
          .fc td, .fc th { border-color: #f1f5f9; }
          .fc .fc-scrollgrid { border-color: #e2e8f0; }

          /* List view */
          .fc .fc-list-event:hover td { background: #f8fafc; cursor: pointer; }

          /* ── Dark mode ── */
          .dark .fc .fc-toolbar-title { color: #f1f5f9; }
          .dark .fc .fc-button { border-color: #334155 !important; color: #94a3b8 !important; }
          .dark .fc .fc-button:hover { background: #1e293b !important; }
          .dark .fc .fc-col-header-cell-cushion { color: #94a3b8; }
          .dark .fc .fc-daygrid-day-number { color: #94a3b8; }
          .dark .fc td, .dark .fc th { border-color: #1e293b; }
          .dark .fc .fc-scrollgrid { border-color: #1e293b; }
          .dark .fc .fc-timegrid-slot { border-color: #1e293b; }
          .dark .fc .fc-daygrid-day.fc-day-today { background: rgba(99,102,241,0.08); }
          .dark .fc .fc-list-day-cushion { background: #0f172a; color: #94a3b8; }
          .dark .fc .fc-list-event:hover td { background: #1e293b; }
          .dark .fc .fc-list-event-title { color: #e2e8f0; }
          .dark .fc .fc-list-empty { color: #64748b; }
          .dark .fc .fc-timegrid-now-indicator-line { border-color: #f43f5e; }
          .dark .fc-theme-standard .fc-popover { background: #1e293b; border-color: #334155; }
          .dark .fc-theme-standard .fc-popover-header { background: #0f172a; color: #e2e8f0; }
          .dark .fc .fc-non-business { background: rgba(255,255,255,0.01); }
        `}</style>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          buttonText={{ today: 'Today', month: 'Month', week: 'Week', day: 'Day', list: 'Agenda' }}
          events={allFCEvents}
          selectable
          selectMirror
          editable
          dayMaxEvents={3}
          moreLinkContent={({ num }) => `+${num} more`}
          weekends
          nowIndicator
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
          height="auto"
        />
      </div>

      {/* Create modal */}
      {modal.mode === 'create' && (
        <EventModal
          defaultStart={modal.start}
          defaultEnd={modal.end}
          onSave={(data) => { addEvent(data); closeModal() }}
          onClose={closeModal}
        />
      )}

      {/* Edit modal */}
      {modal.mode === 'edit' && (
        <EventModal
          event={modal.event}
          onSave={(data) => { updateEvent(modal.event.id, data); closeModal() }}
          onDelete={() => { deleteEvent(modal.event.id); closeModal() }}
          onClose={closeModal}
        />
      )}

      {/* Read-only detail view (progress / auto events) */}
      {modal.mode === 'detail' && (
        <DetailPanel event={modal.event} onClose={closeModal} />
      )}
    </div>
  )
}
