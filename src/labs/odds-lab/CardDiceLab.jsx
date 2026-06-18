import { useMemo, useState } from 'react'
import {
  BarChart3,
  BookOpen,
  Brain,
  Calculator,
  Dices,
  Eye,
  EyeOff,
  GraduationCap,
  Layers3,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react'

const SUITS = ['S', 'H', 'D', 'C']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const HI_LO = { A: -1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 0, 8: 0, 9: 0, 10: -1, J: -1, Q: -1, K: -1 }

const MODULES = [
  { id: 'guided', label: 'Guided Game', icon: GraduationCap, subtitle: 'step-by-step tutor' },
  { id: 'dice', label: 'Dice Lab', icon: Dices, subtitle: 'sample spaces' },
  { id: 'cards', label: 'Card Lab', icon: Layers3, subtitle: 'without replacement' },
  { id: 'blackjack', label: 'Blackjack Tutor', icon: Calculator, subtitle: 'EV decisions' },
  { id: 'counting', label: 'Counting Trainer', icon: Brain, subtitle: 'Hi-Lo memory' },
]

const JOURNEY = [
  ['Foundations', 'Count outcomes before calculating percentages.'],
  ['Distributions', 'Watch repeated rolls form a shape instead of trusting a hunch.'],
  ['Conditioning', 'Update probabilities after cards leave the deck.'],
  ['Strategy', 'Compare decisions by expected value and risk.'],
  ['The 21 Lens', 'Use deck composition and counts to see hidden structure.'],
]

const CARD_EVENTS = [
  { id: 'heart', label: 'Next card is a heart', test: (c) => c.suit === 'H', formula: '13 hearts / 52 cards' },
  { id: 'ace', label: 'Next card is an ace', test: (c) => c.rank === 'A', formula: '4 aces / 52 cards' },
  { id: 'ten', label: 'Next card is ten-value', test: (c) => ['10', 'J', 'Q', 'K'].includes(c.rank), formula: '16 ten-value cards / 52 cards' },
  { id: 'redFace', label: 'Next card is a red face card', test: (c) => ['H', 'D'].includes(c.suit) && ['J', 'Q', 'K'].includes(c.rank), formula: '6 red face cards / 52 cards' },
]

const BLACKJACK_SCENARIOS = [
  { id: 'hard16v10', title: 'Hard 16 vs dealer 10', player: ['10S', '6D'], dealer: '10H', best: 'Hit', lesson: 'A bad hit is still often better than waiting for a strong dealer upcard to finish the hand.' },
  { id: 'hard12v6', title: 'Hard 12 vs dealer 6', player: ['8C', '4H'], dealer: '6S', best: 'Stand', lesson: 'The dealer is forced to draw. Your weak total can become valuable because the dealer bust risk is high.' },
  { id: 'soft18v9', title: 'Soft 18 vs dealer 9', player: ['AH', '7C'], dealer: '9D', best: 'Hit', lesson: 'Soft hands have a safety valve: the ace can drop from 11 to 1, so drawing is less dangerous.' },
  { id: 'hard11v6', title: 'Hard 11 vs dealer 6', player: ['5D', '6C'], dealer: '6H', best: 'Double', lesson: 'When many draws improve you and the dealer is weak, increasing the stake has positive expected value.' },
]

const GUIDED_MISSIONS = [
  {
    id: 'dice-seven',
    title: 'The first parlor trick: why seven feels common',
    concept: 'Sample spaces',
    setup: 'A friend says: roll two dice. If the sum is 7, you win. Anything else, they win.',
    question: 'Before seeing any formulas, would you take this bet if both sides paid the same?',
    choices: ['Take the bet', 'Pass'],
    goodChoice: 'Pass',
    teacher: 'There are 36 equally likely dice pairs, but only 6 make a 7. That is 1/6. Seven is the most common sum, but it is still not common enough for an even-money bet.',
  },
  {
    id: 'blackjack-sixteen',
    title: 'The movie-21 moment: a terrible hand can still have a best move',
    concept: 'Expected value',
    setup: 'You have hard 16. The dealer shows 10. Every instinct says standing feels safer.',
    question: 'What move gives you the best long-run result?',
    choices: ['Hit', 'Stand'],
    goodChoice: 'Hit',
    teacher: 'This is the core lesson: probability is not about finding a comfortable move. It is about comparing bad options. Standing lets a strong dealer upcard finish you too often; hitting busts often, but still loses less in the long run.',
  },
  {
    id: 'counting-low-cards',
    title: 'Counting cards starts as simple bookkeeping',
    concept: 'Conditional probability',
    setup: 'Three low cards have appeared: 2, 5, and 6. In Hi-Lo, each low card is +1.',
    question: 'What should the running count be?',
    choices: ['-3', '0', '+3'],
    goodChoice: '+3',
    teacher: 'A positive count means low cards have been removed. That leaves the unseen deck richer in tens and aces than it was before, which changes future probabilities.',
  },
]

function makeDeck() {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ id: `${rank}${suit}`, rank, suit })))
}

function cardFromId(id) {
  const suit = id.slice(-1)
  const rank = id.slice(0, -1)
  return { id, rank, suit }
}

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

function fraction(n, d) {
  const g = gcd(n, d)
  return `${n / g}/${d / g}`
}

function pct(n, d = 1, digits = 1) {
  if (!d) return '0.0%'
  return `${((n / d) * 100).toFixed(digits)}%`
}

function shuffle(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function blackjackValue(cards) {
  let total = 0
  let aces = 0
  for (const card of cards) {
    if (card.rank === 'A') {
      total += 11
      aces += 1
    } else if (['10', 'J', 'Q', 'K'].includes(card.rank)) {
      total += 10
    } else {
      total += Number(card.rank)
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }
  return total
}

function CardFace({ card, mini = false, muted = false }) {
  const red = ['H', 'D'].includes(card.suit)
  const suitLabel = { S: 'spades', H: 'hearts', D: 'diamonds', C: 'clubs' }[card.suit]
  return (
    <div
      title={`${card.rank} of ${suitLabel}`}
      className={[
        'relative flex shrink-0 flex-col justify-between rounded-[8px] border bg-white dark:bg-slate-900 font-serif shadow-sm',
        mini ? 'h-16 w-11 p-1 text-[11px]' : 'h-24 w-16 p-2 text-sm',
        muted ? 'opacity-40' : '',
        red ? 'border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400' : 'border-slate-200 text-slate-950',
      ].join(' ')}
    >
      <span className="font-black leading-none">{card.rank}</span>
      <span className="self-center text-lg font-black leading-none">{card.suit}</span>
      <span className="self-end rotate-180 font-black leading-none">{card.rank}</span>
    </div>
  )
}

function StatTile({ label, value, detail, tone = 'cyan' }) {
  const tones = {
    cyan: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
    emerald: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
    amber: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
    rose: 'border-rose-300/25 bg-rose-300/10 text-rose-100',
  }
  return (
    <div className={`rounded-[8px] border p-3 ${tones[tone]}`}>
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-75">{label}</div>
      <div className="mt-1 text-2xl font-black text-white">{value}</div>
      {detail && <div className="mt-1 text-xs leading-5 opacity-80">{detail}</div>}
    </div>
  )
}

function Panel({ title, icon: Icon = Sparkles, children, className = '' }) {
  return (
    <section className={`rounded-[8px] border border-white/10 bg-slate-950/58 p-4 shadow-2xl shadow-black/20 ${className}`}>
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
        <Icon className="h-4 w-4 text-cyan-300" />
        {title}
      </div>
      {children}
    </section>
  )
}

function GuidedGameModule({ statsOn }) {
  const [missionIndex, setMissionIndex] = useState(0)
  const [step, setStep] = useState(0)
  const [choice, setChoice] = useState(null)
  const [roll, setRoll] = useState(null)
  const mission = GUIDED_MISSIONS[missionIndex]
  const isDice = mission.id === 'dice-seven'
  const isBlackjack = mission.id === 'blackjack-sixteen'
  const isCounting = mission.id === 'counting-low-cards'
  const playerCards = isBlackjack ? [cardFromId('10S'), cardFromId('6D')] : []
  const dealerCard = isBlackjack ? cardFromId('10H') : null
  const countingCards = isCounting ? [cardFromId('2C'), cardFromId('5H'), cardFromId('6S')] : []
  const answered = choice !== null
  const correct = choice === mission.goodChoice
  const stepNames = ['Setup', 'Your move', 'Play it', 'Math reveal', 'Checkpoint']

  function resetMission(nextIndex = missionIndex) {
    setMissionIndex(nextIndex)
    setStep(0)
    setChoice(null)
    setRoll(null)
  }

  function playRound() {
    if (isDice) {
      const a = 1 + Math.floor(Math.random() * 6)
      const b = 1 + Math.floor(Math.random() * 6)
      setRoll([a, b])
    }
    setStep(3)
  }

  function nextMission() {
    resetMission((missionIndex + 1) % GUIDED_MISSIONS.length)
  }

  const diceWins = roll && roll[0] + roll[1] === 7

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <Panel title="Guided Game Table" icon={GraduationCap}>
        <div className="mb-4 flex flex-wrap gap-2">
          {GUIDED_MISSIONS.map((item, index) => (
            <button
              key={item.id}
              onClick={() => resetMission(index)}
              className={`rounded-[8px] px-3 py-2 text-xs font-black ${
                index === missionIndex ? 'bg-cyan-400 text-slate-950' : 'border border-white/10 text-slate-200'
              }`}
            >
              {index + 1}. {item.concept}
            </button>
          ))}
        </div>

        <div className="rounded-[8px] border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Mission {missionIndex + 1}</div>
          <h3 className="mt-2 text-2xl font-black leading-tight text-white">{mission.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{mission.setup}</p>
        </div>

        <div className="mt-4 rounded-[8px] border border-white/10 bg-slate-900/80 p-4">
          {isDice && (
            <div>
              <div className="mb-3 text-sm font-black text-white">The table</div>
              <div className="grid max-w-sm grid-cols-6 gap-1.5">
                {Array.from({ length: 36 }, (_, i) => {
                  const a = Math.floor(i / 6) + 1
                  const b = (i % 6) + 1
                  const hit = a + b === 7
                  return (
                    <div key={`${a}-${b}`} className={`rounded-[6px] py-2 text-center font-mono text-xs font-black ${hit && step >= 3 ? 'bg-emerald-400 text-slate-950' : 'bg-white/8 text-slate-300'}`}>
                      {a},{b}
                    </div>
                  )
                })}
              </div>
              {roll && <div className={`mt-3 font-black ${diceWins ? 'text-emerald-200' : 'text-amber-200'}`}>You rolled {roll[0]} + {roll[1]} = {roll[0] + roll[1]}.</div>}
            </div>
          )}

          {isBlackjack && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Your hand</div>
                <div className="flex gap-2">{playerCards.map((card) => <CardFace key={card.id} card={card} />)}</div>
                <div className="mt-2 text-lg font-black text-white">Hard {blackjackValue(playerCards)}</div>
              </div>
              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Dealer shows</div>
                <CardFace card={dealerCard} />
              </div>
            </div>
          )}

          {isCounting && (
            <div>
              <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Cards that left the deck</div>
              <div className="flex gap-2">{countingCards.map((card) => <CardFace key={card.id} card={card} />)}</div>
              {step >= 3 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {countingCards.map((card) => (
                    <div key={card.id} className="rounded-[8px] bg-emerald-300/10 p-3 text-sm text-emerald-100">
                      {card.rank} counts +1
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Tutor Walkthrough" icon={BookOpen}>
        <div className="mb-4 grid grid-cols-5 gap-1">
          {stepNames.map((name, index) => (
            <button
              key={name}
              onClick={() => setStep(index)}
              className={`rounded-[6px] px-2 py-2 text-[11px] font-black ${index === step ? 'bg-cyan-400 text-slate-950' : index < step ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/8 text-slate-400'}`}
            >
              {name}
            </button>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="rounded-[8px] border border-cyan-300/20 bg-cyan-300/10 p-4">
              <div className="font-black text-white">What you are learning</div>
              <p className="mt-2 text-sm leading-6 text-slate-200">{mission.concept} means replacing a vague feeling with a countable structure.</p>
            </div>
            <button onClick={() => setStep(1)} className="rounded-[8px] bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950">Start the hand</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="text-xl font-black text-white">{mission.question}</div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {mission.choices.map((option) => (
                <button
                  key={option}
                  onClick={() => setChoice(option)}
                  className={`rounded-[8px] border p-4 text-left font-black ${
                    choice === option ? 'border-emerald-300 dark:border-emerald-700/50 bg-emerald-300/15 text-white' : 'border-white/10 bg-white/5 text-slate-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <button disabled={!answered} onClick={() => setStep(2)} className="mt-4 rounded-[8px] bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">Lock it in</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className={`rounded-[8px] border p-4 ${correct ? 'border-emerald-300/30 bg-emerald-300/10' : 'border-amber-300/30 bg-amber-300/10'}`}>
              <div className="font-black text-white">{correct ? 'Good instinct.' : 'Good experiment. Now we compare it to the math.'}</div>
              <p className="mt-2 text-sm leading-6 text-slate-200">You chose {choice}. The important move is not being right instantly; it is learning to ask what the possible worlds are.</p>
            </div>
            <button onClick={playRound} className="rounded-[8px] bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950">Play and reveal the math</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-[8px] border border-white/10 bg-white/5 p-4">
              <div className="font-black text-white">Math reveal</div>
              <p className="mt-2 text-sm leading-6 text-slate-200">{mission.teacher}</p>
            </div>
            {statsOn && (
              <div className="grid gap-3 sm:grid-cols-3">
                {isDice && (
                  <>
                    <StatTile label="All outcomes" value="36" detail="6 sides times 6 sides" />
                    <StatTile label="Ways to roll 7" value="6" detail="1,6 through 6,1" tone="emerald" />
                    <StatTile label="Chance" value="1/6" detail="about 16.7%" tone="amber" />
                  </>
                )}
                {isBlackjack && (
                  <>
                    <StatTile label="Your total" value="16" detail="danger zone" tone="rose" />
                    <StatTile label="Dealer upcard" value="10" detail="strong starting information" tone="amber" />
                    <StatTile label="EV move" value="Hit" detail="best long-run loss reduction" tone="emerald" />
                  </>
                )}
                {isCounting && (
                  <>
                    <StatTile label="Low cards seen" value="3" detail="2, 5, and 6" />
                    <StatTile label="Running count" value="+3" detail="+1 + +1 + +1" tone="emerald" />
                    <StatTile label="Meaning" value="richer deck" detail="more high cards remain" tone="amber" />
                  </>
                )}
              </div>
            )}
            <button onClick={() => setStep(4)} className="rounded-[8px] bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950">Checkpoint</button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-[8px] border border-emerald-300/25 bg-emerald-300/10 p-4">
              <div className="font-black text-white">Checkpoint</div>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Say it back: the trick is to name the possible outcomes, count the ones you care about, then update that count when new information appears.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => resetMission()} className="rounded-[8px] border border-white/10 px-4 py-2 text-sm font-bold text-slate-200">Replay this lesson</button>
              <button onClick={nextMission} className="rounded-[8px] bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950">Next guided game</button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}

function DiceModule({ statsOn }) {
  const [target, setTarget] = useState(7)
  const [rolls, setRolls] = useState([])

  const outcomes = useMemo(() => {
    const list = []
    for (let a = 1; a <= 6; a += 1) {
      for (let b = 1; b <= 6; b += 1) list.push({ a, b, sum: a + b, hit: a + b === target })
    }
    return list
  }, [target])

  const favorable = outcomes.filter((o) => o.hit).length
  const dist = Array.from({ length: 11 }, (_, i) => {
    const sum = i + 2
    return { sum, exact: outcomes.filter((o) => o.sum === sum).length, empirical: rolls.filter((r) => r === sum).length }
  })

  function runSimulation(count) {
    const next = Array.from({ length: count }, () => 2 + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6))
    setRolls((prev) => [...prev, ...next].slice(-5000))
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <Panel title="Two-Dice Sample Space" icon={Dices}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-bold text-slate-200">
            Target sum
            <select
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="ml-2 rounded-[8px] border border-white/10 bg-slate-900 px-3 py-2 text-white"
            >
              {Array.from({ length: 11 }, (_, i) => i + 2).map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <button onClick={() => runSimulation(100)} className="rounded-[8px] bg-cyan-400 px-3 py-2 text-sm font-black text-slate-950">Roll 100</button>
          <button onClick={() => runSimulation(1000)} className="rounded-[8px] bg-emerald-400 px-3 py-2 text-sm font-black text-slate-950">Roll 1000</button>
          <button onClick={() => setRolls([])} className="rounded-[8px] border border-white/10 px-3 py-2 text-sm font-bold text-slate-200">Clear</button>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {outcomes.map((o) => (
            <div
              key={`${o.a}-${o.b}`}
              className={`rounded-[6px] px-1 py-2 text-center font-mono text-xs font-black ${
                o.hit ? 'bg-emerald-400 text-slate-950' : 'bg-white/7 text-slate-300'
              }`}
            >
              {o.a},{o.b}
            </div>
          ))}
        </div>

        {statsOn && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatTile label="Favorable" value={`${favorable}/36`} detail="count the green cells" tone="emerald" />
            <StatTile label="Probability" value={pct(favorable, 36)} detail={`P(sum ${target}) = ${fraction(favorable, 36)}`} />
            <StatTile label="Expected hit rate" value={(rolls.length ? pct(rolls.filter((r) => r === target).length, rolls.length) : '0.0%')} detail={`${rolls.length} simulated rolls`} tone="amber" />
          </div>
        )}
      </Panel>

      <Panel title="Distribution Builder" icon={BarChart3}>
        <div className="space-y-2">
          {dist.map((row) => {
            const exactWidth = (row.exact / 6) * 100
            const empWidth = rolls.length ? (row.empirical / Math.max(...dist.map((d) => d.empirical), 1)) * 100 : 0
            return (
              <div key={row.sum}>
                <div className="mb-1 flex justify-between text-xs text-slate-300">
                  <span>sum {row.sum}</span>
                  <span>{statsOn ? `${row.exact}/36 ${rolls.length ? `| ${row.empirical}` : ''}` : 'hidden'}</span>
                </div>
                <div className="h-4 overflow-hidden rounded-[6px] bg-white/8">
                  <div className="h-full rounded-[6px] bg-cyan-300/80" style={{ width: `${statsOn ? exactWidth : 0}%` }} />
                  <div className="-mt-4 h-full rounded-[6px] bg-amber-300/60" style={{ width: `${statsOn ? empWidth : 0}%` }} />
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          The exact shape is triangular because middle sums have more paths. Simulation slowly reveals the same shape.
        </p>
      </Panel>
    </div>
  )
}

function CardsModule({ statsOn }) {
  const [eventId, setEventId] = useState('ten')
  const [drawn, setDrawn] = useState([cardFromId('AH'), cardFromId('10S'), cardFromId('5D')])
  const event = CARD_EVENTS.find((e) => e.id === eventId) ?? CARD_EVENTS[0]
  const deck = makeDeck()
  const remaining = deck.filter((card) => !drawn.some((d) => d.id === card.id))
  const favorable = remaining.filter(event.test).length

  function drawRandom() {
    if (!remaining.length) return
    const next = remaining[Math.floor(Math.random() * remaining.length)]
    setDrawn((prev) => [...prev, next])
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel title="Draw Without Replacement" icon={Layers3}>
        <label className="block text-sm font-bold text-slate-200">
          Event to track
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-slate-900 px-3 py-2 text-white"
          >
            {CARD_EVENTS.map((ev) => <option key={ev.id} value={ev.id}>{ev.label}</option>)}
          </select>
        </label>

        <div className="mt-4 flex gap-2">
          <button onClick={drawRandom} className="rounded-[8px] bg-cyan-400 px-3 py-2 text-sm font-black text-slate-950">Draw card</button>
          <button onClick={() => setDrawn([])} className="rounded-[8px] border border-white/10 px-3 py-2 text-sm font-bold text-slate-200">Reset deck</button>
        </div>

        {statsOn && (
          <div className="mt-4 grid gap-3">
            <StatTile label="Remaining deck" value={remaining.length} detail={`${drawn.length} cards observed`} />
            <StatTile label="Favorable remaining" value={favorable} detail={event.formula} tone="emerald" />
            <StatTile label="Updated probability" value={pct(favorable, remaining.length)} detail={`P = ${favorable}/${remaining.length || 1}`} tone="amber" />
          </div>
        )}
      </Panel>

      <Panel title="Evidence Trail" icon={BookOpen}>
        <div className="mb-4">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Drawn cards</div>
          <div className="flex min-h-24 flex-wrap gap-2">
            {drawn.length ? drawn.map((card) => <CardFace key={card.id} card={card} />) : <span className="text-sm text-slate-400">No cards drawn yet.</span>}
          </div>
        </div>
        <div className="rounded-[8px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
          Each observed card changes the denominator. If the card also belonged to your event, the numerator changes too. This is conditional probability with physical objects.
        </div>
      </Panel>
    </div>
  )
}

function BlackjackModule({ statsOn }) {
  const [scenarioId, setScenarioId] = useState('hard16v10')
  const [answer, setAnswer] = useState(null)
  const scenario = BLACKJACK_SCENARIOS.find((s) => s.id === scenarioId) ?? BLACKJACK_SCENARIOS[0]
  const player = scenario.player.map(cardFromId)
  const dealer = cardFromId(scenario.dealer)
  const deck = makeDeck().filter((c) => ![...player, dealer].some((x) => x.id === c.id))
  const total = blackjackValue(player)
  const bustCards = deck.filter((card) => blackjackValue([...player, card]) > 21)
  const tenValue = deck.filter((card) => ['10', 'J', 'Q', 'K'].includes(card.rank)).length
  const correct = answer && answer === scenario.best

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Panel title="Decision Table" icon={Calculator}>
        <div className="mb-4 flex flex-wrap gap-2">
          {BLACKJACK_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => { setScenarioId(s.id); setAnswer(null) }}
              className={`rounded-[8px] px-3 py-2 text-xs font-black ${s.id === scenarioId ? 'bg-cyan-400 text-slate-950' : 'border border-white/10 text-slate-200'}`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Your hand</div>
            <div className="flex gap-2">{player.map((card) => <CardFace key={card.id} card={card} />)}</div>
            <div className="mt-3 text-xl font-black text-white">Total: {total}</div>
          </div>
          <div>
            <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Dealer upcard</div>
            <CardFace card={dealer} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {['Hit', 'Stand', 'Double'].map((move) => (
            <button
              key={move}
              onClick={() => setAnswer(move)}
              className={`rounded-[8px] px-4 py-2 text-sm font-black ${
                answer === move ? 'bg-emerald-400 text-slate-950' : 'bg-white/8 text-white hover:bg-white/12'
              }`}
            >
              {move}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Tutor Overlay" icon={GraduationCap}>
        {statsOn ? (
          <div className="grid gap-3">
            <StatTile label="Bust if hit" value={pct(bustCards.length, deck.length)} detail={`${bustCards.length}/${deck.length} unseen cards bust`} tone={bustCards.length > deck.length / 2 ? 'rose' : 'emerald'} />
            <StatTile label="Ten-value density" value={pct(tenValue, deck.length)} detail={`${tenValue} cards help dealer make strong totals`} />
            <StatTile label="Basic strategy" value={scenario.best} detail="A rule table built from expected value simulations." tone="amber" />
          </div>
        ) : (
          <div className="rounded-[8px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Stats are off. Make the decision from intuition, then turn the overlay back on.</div>
        )}

        {answer && (
          <div className={`mt-4 rounded-[8px] border p-4 ${correct ? 'border-emerald-300/30 bg-emerald-300/10' : 'border-amber-300/30 bg-amber-300/10'}`}>
            <div className="font-black text-white">{correct ? 'Correct decision.' : `Interesting. The EV play is ${scenario.best}.`}</div>
            <p className="mt-2 text-sm leading-6 text-slate-200">{scenario.lesson}</p>
          </div>
        )}
      </Panel>
    </div>
  )
}

function CountingModule({ statsOn }) {
  const [stream, setStream] = useState(() => shuffle(makeDeck()).slice(0, 12))
  const [visible, setVisible] = useState(1)
  const seen = stream.slice(0, visible)
  const running = seen.reduce((sum, card) => sum + HI_LO[card.rank], 0)
  const decksRemaining = Math.max((52 - seen.length) / 52, 0.1)
  const trueCount = running / decksRemaining

  function nextCard() {
    setVisible((v) => Math.min(v + 1, stream.length))
  }

  function reset() {
    setStream(shuffle(makeDeck()).slice(0, 12))
    setVisible(1)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <Panel title="Hi-Lo Counting Drill" icon={Brain}>
        <div className="mb-4 flex flex-wrap gap-2">
          <button onClick={nextCard} className="rounded-[8px] bg-cyan-400 px-3 py-2 text-sm font-black text-slate-950">Flip next</button>
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-[8px] border border-white/10 px-3 py-2 text-sm font-bold text-slate-200"><RotateCcw className="h-4 w-4" /> New shoe</button>
        </div>
        <div className="flex min-h-28 flex-wrap gap-2">
          {stream.map((card, index) => (
            <CardFace key={`${card.id}-${index}`} card={card} muted={index >= visible} />
          ))}
        </div>
        <div className="mt-4 rounded-[8px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
          Low cards 2-6 count +1. Sevens through nines count 0. Tens and aces count -1. A positive count means more high cards remain than usual.
        </div>
      </Panel>

      <Panel title="Count Overlay" icon={BarChart3}>
        {statsOn ? (
          <div className="grid gap-3">
            <StatTile label="Running count" value={running > 0 ? `+${running}` : running} detail={`${seen.length} visible cards`} tone={running >= 0 ? 'emerald' : 'rose'} />
            <StatTile label="True count" value={trueCount > 0 ? `+${trueCount.toFixed(1)}` : trueCount.toFixed(1)} detail="running count divided by decks remaining" tone="amber" />
            <StatTile label="Edge intuition" value={trueCount >= 1 ? 'player-leaning' : trueCount <= -1 ? 'house-leaning' : 'neutral'} detail="This is educational, not a promise of profit." />
          </div>
        ) : (
          <div className="rounded-[8px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Overlay hidden. Try to hold the running count in your head.</div>
        )}
      </Panel>
    </div>
  )
}

export default function CardDiceLab({ fullPage = false, onBack }) {
  const [module, setModule] = useState('guided')
  const [statsOn, setStatsOn] = useState(true)
  const Active = { guided: GuidedGameModule, dice: DiceModule, cards: CardsModule, blackjack: BlackjackModule, counting: CountingModule }[module]

  return (
    <div className={`${fullPage ? 'min-h-screen' : 'rounded-[8px]'} overflow-hidden bg-slate-950 text-slate-100`}>
      <div className="relative border-b border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(45,212,191,0.20),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.14),transparent_24%),linear-gradient(135deg,#051923,#111827_52%,#1f172a)]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-[8px] border border-cyan-200/20 bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">
                <Trophy className="h-4 w-4" />
                Probability Casino Lab
              </div>
              <h2 className="max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl">
                Play the hand first. Then let the math explain what just happened.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base">
                Start with guided games that ask for a prediction, reveal the outcome, and walk through the probability one step at a time.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {onBack && (
                <button onClick={onBack} className="rounded-[8px] border border-white/10 px-3 py-2 text-sm font-bold text-slate-200">Labs</button>
              )}
              <button
                onClick={() => setStatsOn((v) => !v)}
                className="inline-flex items-center gap-2 rounded-[8px] bg-white dark:bg-slate-900 px-3 py-2 text-sm font-black text-slate-950"
              >
                {statsOn ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Stats {statsOn ? 'on' : 'off'}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {JOURNEY.map(([title, desc], index) => (
              <div key={title} className="rounded-[8px] border border-white/10 bg-white/7 p-3">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Level {index}</div>
                <div className="mt-1 font-black text-white">{title}</div>
                <div className="mt-1 text-xs leading-5 text-slate-300">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 grid gap-2 md:grid-cols-3 xl:grid-cols-5">
          {MODULES.map(({ id, label, icon: Icon, subtitle }) => (
            <button
              key={id}
              onClick={() => setModule(id)}
              className={`flex items-center gap-3 rounded-[8px] border p-3 text-left transition ${
                module === id ? 'border-cyan-300 dark:border-cyan-700/50 bg-cyan-300/15 shadow-lg shadow-cyan-950/30' : 'border-white/10 bg-white/5 hover:bg-white/8'
              }`}
            >
              <Icon className={`h-5 w-5 ${module === id ? 'text-cyan-200' : 'text-slate-400'}`} />
              <span>
                <span className="block text-sm font-black text-white">{label}</span>
                <span className="block text-xs text-slate-400">{subtitle}</span>
              </span>
            </button>
          ))}
        </div>

        <Active statsOn={statsOn} />
      </div>
    </div>
  )
}
