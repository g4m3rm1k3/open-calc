import { useState } from 'react'

const VISIBLE_ROOMS = 12

export default function HilbertHotelSimulator() {
  // rooms[i] = guest label occupying room i+1, or null
  const [rooms, setRooms] = useState(() => Array.from({ length: VISIBLE_ROOMS }, (_, i) => `G${i + 1}`))
  const [guestsWelcomed, setGuestsWelcomed] = useState(VISIBLE_ROOMS)
  const [lastAction, setLastAction] = useState('Hotel starts completely full — every room 1, 2, 3, ... has a guest.')

  const newGuestArrives = () => {
    setRooms((prev) => {
      const shifted = [null, ...prev.slice(0, VISIBLE_ROOMS - 1)]
      return shifted
    })
    setGuestsWelcomed((n) => n + 1)
    setLastAction('One new guest arrived. Every guest in room n moved to room n+1 — room 1 is now free.')
    // fill room 1 with the new guest label on next tick
    setTimeout(() => {
      setRooms((prev) => {
        const copy = [...prev]
        copy[0] = `New!`
        return copy
      })
    }, 400)
  }

  const infiniteBusArrives = () => {
    setRooms((prev) => {
      const doubled = Array.from({ length: VISIBLE_ROOMS }, (_, i) => {
        // room i+1 (1-indexed) — even rooms (2n) get old guest from room n; odd rooms get a bus passenger
        const roomNum = i + 1
        if (roomNum % 2 === 0) {
          const originalRoom = roomNum / 2
          return prev[originalRoom - 1]
        }
        return null
      })
      return doubled
    })
    setGuestsWelcomed((n) => n + VISIBLE_ROOMS / 2)
    setLastAction('An infinite bus arrived. Every guest in room n moved to room 2n — every odd room is now free for a bus passenger.')
    setTimeout(() => {
      setRooms((prev) => prev.map((r, i) => (i % 2 === 0 ? `Bus${i / 2 + 1}` : r)))
    }, 400)
  }

  const reset = () => {
    setRooms(Array.from({ length: VISIBLE_ROOMS }, (_, i) => `G${i + 1}`))
    setGuestsWelcomed(VISIBLE_ROOMS)
    setLastAction('Reset. Hotel starts completely full again.')
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-1">Hilbert's Hotel Simulator</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Every room is always occupied — and the hotel can still always make room. That's the whole paradox, animated.
      </p>

      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 mb-4">
        {rooms.map((guest, i) => (
          <div
            key={i}
            className={`aspect-square flex flex-col items-center justify-center rounded text-[10px] font-semibold border transition-colors duration-300 ${
              guest === null
                ? 'bg-slate-100 dark:bg-slate-950 border-dashed border-slate-300 dark:border-slate-700 text-slate-300 dark:text-slate-700'
                : guest.startsWith('New') || guest.startsWith('Bus')
                ? 'bg-amber-400 text-white border-amber-500'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'
            }`}
          >
            <span className="opacity-60">#{i + 1}</span>
            <span>{guest ?? '—'}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Rooms 1–{VISIBLE_ROOMS} shown; the hotel continues infinitely to the right (room {VISIBLE_ROOMS + 1}, {VISIBLE_ROOMS + 2}, ...) with the same pattern.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={newGuestArrives} className="px-3 py-1.5 rounded text-sm font-medium bg-emerald-600 text-white">
          New Guest Arrives
        </button>
        <button onClick={infiniteBusArrives} className="px-3 py-1.5 rounded text-sm font-medium bg-indigo-600 text-white">
          Infinite Bus Arrives
        </button>
        <button onClick={reset} className="px-3 py-1.5 rounded text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
          Reset
        </button>
      </div>

      <p className="text-sm">{lastAction}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total guests ever welcomed: <span className="font-mono font-semibold">{guestsWelcomed}</span> — and room 1 always finds room for one more.</p>
    </div>
  )
}
