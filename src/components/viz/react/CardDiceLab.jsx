import { useMemo, useState } from 'react'

const CARD_EVENTS = [
  { id: 'ace', label: 'Ace', favorable: 4, total: 52 },
  { id: 'heart', label: 'Heart', favorable: 13, total: 52 },
  { id: 'face', label: 'Face Card (J,Q,K)', favorable: 12, total: 52 },
  { id: 'red', label: 'Red Card', favorable: 26, total: 52 },
  { id: 'heartGivenRed', label: 'Heart given Red', favorable: 13, total: 26 },
  { id: 'aceOrHeart', label: 'Ace OR Heart', favorable: 16, total: 52 },
]

function gcd(a, b) {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const t = x % y
    x = y
    y = t
  }
  return x || 1
}

function simplifyFraction(n, d) {
  const g = gcd(n, d)
  return `${n / g}/${d / g}`
}

export default function CardDiceLab() {
  const [mode, setMode] = useState('dice')
  const [targetSum, setTargetSum] = useState(7)
  const [requireDouble, setRequireDouble] = useState(false)
  const [cardEvent, setCardEvent] = useState('ace')

  const diceStats = useMemo(() => {
    const outcomes = []
    let favorable = 0

    for (let a = 1; a <= 6; a += 1) {
      for (let b = 1; b <= 6; b += 1) {
        const isFav = requireDouble ? (a === b && a + b === targetSum) : (a + b === targetSum)
        outcomes.push({ a, b, isFav })
        if (isFav) favorable += 1
      }
    }

    return {
      favorable,
      total: 36,
      probability: favorable / 36,
      outcomes,
    }
  }, [targetSum, requireDouble])

  const cardStats = useMemo(() => {
    const selected = CARD_EVENTS.find((e) => e.id === cardEvent) ?? CARD_EVENTS[0]
    return {
      ...selected,
      probability: selected.favorable / selected.total,
    }
  }, [cardEvent])

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-2">Cards and Dice Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Practice sample-space thinking: count outcomes first, then convert to probabilities.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setMode('dice')}
          className={`px-3 py-1 rounded text-sm ${mode === 'dice' ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          Dice
        </button>
        <button
          onClick={() => setMode('cards')}
          className={`px-3 py-1 rounded text-sm ${mode === 'cards' ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          Cards
        </button>
      </div>

      {mode === 'dice' && (
        <div>
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <label className="text-sm font-medium">
              Target sum
              <select
                value={targetSum}
                onChange={(e) => setTargetSum(Number(e.target.value))}
                className="ml-2 p-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              >
                {Array.from({ length: 11 }, (_, i) => i + 2).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium flex items-center gap-2">
              <input
                type="checkbox"
                checked={requireDouble}
                onChange={(e) => setRequireDouble(e.target.checked)}
              />
              Require double
            </label>
          </div>

          <div className="grid grid-cols-6 gap-1 mb-4">
            {diceStats.outcomes.map((o, idx) => (
              <div
                key={idx}
                className={`text-xs rounded p-1 text-center ${o.isFav ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                ({o.a},{o.b})
              </div>
            ))}
          </div>

          <p className="text-sm font-semibold">
            Favorable: {diceStats.favorable}/36 = {simplifyFraction(diceStats.favorable, 36)} = {(diceStats.probability * 100).toFixed(2)}%
          </p>
        </div>
      )}

      {mode === 'cards' && (
        <div>
          <label className="text-sm font-medium">
            Event
            <select
              value={cardEvent}
              onChange={(e) => setCardEvent(e.target.value)}
              className="ml-2 p-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            >
              {CARD_EVENTS.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.label}</option>
              ))}
            </select>
          </label>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 rounded bg-slate-200 dark:bg-slate-700">Favorable: {cardStats.favorable}</div>
            <div className="p-2 rounded bg-slate-200 dark:bg-slate-700">Total: {cardStats.total}</div>
            <div className="p-2 rounded bg-emerald-100 dark:bg-emerald-900/30 col-span-2 font-semibold">
              P(event) = {cardStats.favorable}/{cardStats.total} = {simplifyFraction(cardStats.favorable, cardStats.total)} = {(cardStats.probability * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
