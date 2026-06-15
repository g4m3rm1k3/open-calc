import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'

// ═══════════════════════════════════════════════
//  CONSTANTS & HELPERS
// ═══════════════════════════════════════════════
const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']
const RANK_VALUES = { A:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10, J:11, Q:12, K:13 }
const RANK_VALUES_ACE_HIGH = { A:14, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10, J:11, Q:12, K:13 }
const BJ_VALUES = { A:11, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10, J:10, Q:10, K:10 }

const makeDeck = () => {
  const deck = []
  for (const suit of SUITS)
    for (const rank of RANKS) deck.push({ suit, rank, id: `${rank}${suit}` })
  return deck
}

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const bjHandValue = (hand) => {
  let val = 0, aces = 0
  for (const c of hand) { val += BJ_VALUES[c.rank]; if (c.rank === 'A') aces++ }
  while (val > 21 && aces > 0) { val -= 10; aces-- }
  return val
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Hi-Lo card counting value
const hiLoValue = (rank) => {
  if (['2','3','4','5','6'].includes(rank)) return +1
  if (['7','8','9'].includes(rank)) return 0
  return -1 // 10,J,Q,K,A
}

// Basic strategy: returns 'HIT', 'STAND', 'DOUBLE' for hard totals
const basicStrategy = (playerTotal, dealerUpcard) => {
  const d = RANK_VALUES[dealerUpcard] || 10
  if (playerTotal >= 17) return 'STAND'
  if (playerTotal <= 8) return 'HIT'
  if (playerTotal === 9) return (d >= 3 && d <= 6) ? 'DOUBLE' : 'HIT'
  if (playerTotal === 10) return (d >= 2 && d <= 9) ? 'DOUBLE' : 'HIT'
  if (playerTotal === 11) return 'DOUBLE'
  if (playerTotal === 12) return (d >= 4 && d <= 6) ? 'STAND' : 'HIT'
  if (playerTotal >= 13 && playerTotal <= 16) return (d >= 2 && d <= 6) ? 'STAND' : 'HIT'
  return 'HIT'
}

// ═══════════════════════════════════════════════
//  SHARED BUTTON STYLE
// ═══════════════════════════════════════════════
const btnStyle = (bg, disabled = false) => ({
  background: disabled ? '#333' : bg,
  color: disabled ? '#666' : '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 20px',
  fontWeight: 700,
  fontSize: 14,
  cursor: disabled ? 'not-allowed' : 'pointer',
  letterSpacing: 0.5,
  transition: 'filter 0.15s, transform 0.1s',
  fontFamily: 'inherit',
  opacity: disabled ? 0.6 : 1,
})

// ═══════════════════════════════════════════════
//  CARD COMPONENT
// ═══════════════════════════════════════════════
const Card = ({ card, faceDown = false, small = false, selected = false, onClick, style = {} }) => {
  const sz = small
    ? { w: 52, h: 74, font: 13, center: 28 }
    : { w: 72, h: 100, font: 17, center: 38 }
  const isRed = card && (card.suit === '♥' || card.suit === '♦')
  return (
    <div
      onClick={onClick}
      style={{
        width: sz.w, height: sz.h, borderRadius: 8,
        background: faceDown
          ? 'linear-gradient(135deg, #1a1a3e 0%, #2d2d6e 50%, #1a1a3e 100%)'
          : '#fefefe',
        border: selected ? '2.5px solid #f0a500' : '1.5px solid #ccc',
        boxShadow: selected ? '0 0 12px #f0a50088' : '0 3px 10px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: faceDown ? 4 : 6,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative', flexShrink: 0,
        transform: selected ? 'translateY(-10px)' : 'none',
        transition: 'transform 0.18s, box-shadow 0.18s',
        userSelect: 'none', ...style,
      }}
    >
      {faceDown ? (
        <div style={{
          width: '100%', height: '100%', borderRadius: 4,
          background: 'repeating-linear-gradient(45deg,#2a2a5e,#2a2a5e 4px,#1a1a3e 4px,#1a1a3e 8px)',
          opacity: 0.8,
        }} />
      ) : (
        <>
          <div style={{ fontSize: sz.font, fontWeight: 700, color: isRed ? '#c0392b' : '#1a1a2e', lineHeight: 1 }}>
            {card.rank}<br /><span style={{ fontSize: sz.font - 2 }}>{card.suit}</span>
          </div>
          <div style={{ fontSize: sz.font + 4, color: isRed ? '#c0392b' : '#1a1a2e', textAlign: 'center', lineHeight: 1 }}>
            {card.suit}
          </div>
          <div style={{ fontSize: sz.font, fontWeight: 700, color: isRed ? '#c0392b' : '#1a1a2e', lineHeight: 1, alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>
            {card.rank}<br /><span style={{ fontSize: sz.font - 2 }}>{card.suit}</span>
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════
//  MATH PANEL WRAPPER
// ═══════════════════════════════════════════════
const MathPanel = ({ children }) => (
  <div style={{
    width: 320, flexShrink: 0,
    background: '#060c18',
    borderLeft: '1px solid rgba(77,208,255,0.2)',
    padding: '16px 14px',
    overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 16,
  }}>
    <div style={{
      fontFamily: 'monospace',
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: 2,
      color: '#4dd0ff',
      borderBottom: '1px solid rgba(77,208,255,0.25)',
      paddingBottom: 10,
    }}>
      MATH PANEL
    </div>
    {children}
  </div>
)

// ═══════════════════════════════════════════════
//  MATH PANEL SECTION
// ═══════════════════════════════════════════════
const MPSection = ({ title, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#4dd0ff', textTransform: 'uppercase', opacity: 0.7 }}>
      {title}
    </div>
    {children}
  </div>
)

// ═══════════════════════════════════════════════
//  HORIZONTAL BAR CHART (inline divs)
// ═══════════════════════════════════════════════
const HBar = ({ label, value, max, color = '#4dff91', subtitle = '' }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 11, color: '#aaa' }}>
        <span style={{ color: '#ddd' }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value} {subtitle && <span style={{ color: '#666', fontWeight: 400 }}>({subtitle})</span>}</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
//  BIG NUMBER DISPLAY
// ═══════════════════════════════════════════════
const BigNum = ({ value, label, color = '#fff', formula = '' }) => (
  <div style={{ textAlign: 'center', padding: '8px 0' }}>
    <div style={{ fontSize: 42, fontWeight: 900, color, lineHeight: 1, fontFamily: 'monospace' }}>{value}</div>
    <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{label}</div>
    {formula && <div style={{ fontSize: 10, color: '#555', marginTop: 3, fontFamily: 'monospace' }}>{formula}</div>}
  </div>
)

// ═══════════════════════════════════════════════
//  BADGE
// ═══════════════════════════════════════════════
const Badge = ({ label, color = '#4dff91', bg }) => (
  <div style={{
    display: 'inline-block',
    background: bg || (color + '22'),
    border: `1.5px solid ${color}88`,
    borderRadius: 8,
    padding: '5px 14px',
    fontSize: 14,
    fontWeight: 800,
    color,
    letterSpacing: 1,
    textAlign: 'center',
  }}>
    {label}
  </div>
)

// ═══════════════════════════════════════════════
//  FORMULA LINE
// ═══════════════════════════════════════════════
const Formula = ({ text }) => (
  <div style={{
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#888',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 6,
    padding: '5px 8px',
    lineHeight: 1.6,
  }}>
    {text}
  </div>
)

// ═══════════════════════════════════════════════
//  GAME LAYOUT WRAPPER (two-column)
// ═══════════════════════════════════════════════
const GameLayout = ({ left, right }) => (
  <div style={{ display: 'flex', alignItems: 'stretch', flex: 1, overflow: 'hidden' }}>
    <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', minWidth: 0 }}>
      {left}
    </div>
    <MathPanel>
      {right}
    </MathPanel>
  </div>
)

// ═══════════════════════════════════════════════
//  GAME: BLACKJACK
// ═══════════════════════════════════════════════

// ─── Scenarios ─────────────────────────────────────────────────────────────
const BJ_SCENARIOS = [
  {
    id: 'hard16',
    badge: 'A',
    name: 'Hard 16 vs Dealer 10',
    desc: 'The most misplayed hand. You have 10+6 vs a dealer 10.',
    lesson: 'Hard 16 vs dealer 10 is a losing hand either way. HIT because the dealer must draw to 17+ and will make it most of the time. Standing also loses 77% of the time — but basic strategy says HIT. Never let "fear of busting" make you deviate from the math.',
    player: [{ rank: '10', suit: '♠', id: 'sc10s' }, { rank: '6', suit: '♥', id: 'sc6h' }],
    dealer: [{ rank: '10', suit: '♦', id: 'sc10d' }, { rank: '7', suit: '♣', id: 'sc7c' }],
    preCount: 0,
  },
  {
    id: 'soft18',
    badge: 'B',
    name: 'Soft 18 vs Dealer 6',
    desc: 'Ace+7 = soft 18. Dealer shows 6 — the worst card for the house.',
    lesson: "Soft 18 vs dealer 6 is a DOUBLE DOWN opportunity. The dealer busts ~42% showing a 6. You're already winning — maximize it. Most beginners STAND and leave money on the table. Always double soft totals against dealer 4–6.",
    player: [{ rank: 'A', suit: '♠', id: 'scAs' }, { rank: '7', suit: '♥', id: 'sc7h' }],
    dealer: [{ rank: '6', suit: '♦', id: 'sc6d' }, { rank: '5', suit: '♣', id: 'sc5c' }],
    preCount: 0,
  },
  {
    id: 'hotdeck',
    badge: 'C',
    name: 'True Count +4 — Bet Big?',
    desc: 'Running count is +8. True count ≈ +4. This is when MIT bet the table max.',
    lesson: 'A true count of +4 gives the player ~2% edge over the house. Each +1 in true count ≈ 0.5% extra player edge. At a $5–$500 table, the MIT team would go to max bet here. This is the entire point of counting — waiting for moments like this.',
    player: [{ rank: '9', suit: '♠', id: 'sc9s' }, { rank: '8', suit: '♥', id: 'sc8h' }],
    dealer: [{ rank: '7', suit: '♦', id: 'sc7d' }, { rank: '4', suit: '♣', id: 'sc4c' }],
    preCount: 8,
  },
]

// ─── Tutor Modal ────────────────────────────────────────────────────────────
const TutorModal = ({ interrupt, onRevise, onForce }) => {
  if (!interrupt) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: '#0f172a', border: '2px solid #f59e0b', borderRadius: 16, maxWidth: 460, width: '100%', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1c1002', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🤔</div>
          <div>
            <h3 style={{ margin: '0 0 6px', color: '#f59e0b', fontSize: 18 }}>Tutor Advice</h3>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: 14, lineHeight: 1.5 }}>
              You want to <strong style={{ color: '#ff4455' }}>{interrupt.intendedAction}</strong>, but basic strategy says to <strong style={{ color: '#4dff91' }}>{interrupt.advice}</strong>.
            </p>
          </div>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 20, color: '#a5b4fc', fontSize: 13, lineHeight: 1.6 }}>{interrupt.reason}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onRevise} style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Change to {interrupt.advice}</button>
          <button onClick={onForce} style={{ background: '#475569', color: '#cbd5e1', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Force {interrupt.intendedAction}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Count Quiz Modal ───────────────────────────────────────────────────────
const CountQuizModal = ({ active, correctCount, onDone }) => {
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState(null)
  useEffect(() => { if (active) { setGuess(''); setFeedback(null) } }, [active])
  if (!active) return null

  const submit = () => {
    const g = parseInt(guess, 10)
    if (isNaN(g)) return
    const correct = g === correctCount
    setFeedback({ correct, guess: g })
    if (correct) setTimeout(() => onDone(true), 900)
    else setTimeout(() => onDone(false), 2200)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: '#0f172a', border: '2px solid #818cf8', borderRadius: 16, maxWidth: 400, width: '100%', padding: '24px' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#1e1b4b', border: '2px solid #818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🧠</div>
          <div>
            <h3 style={{ margin: '0 0 6px', color: '#818cf8', fontSize: 17 }}>Count Check!</h3>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: 14, lineHeight: 1.5 }}>
              Without looking at the panel — what is the <strong>running count</strong> right now?
            </p>
          </div>
        </div>
        {!feedback ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="number" value={guess} onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} autoFocus
              placeholder="+3 or −2"
              style={{ flex: 1, background: '#0d1525', border: '1.5px solid #818cf866', borderRadius: 8, color: '#fff', fontSize: 22, padding: '8px 14px', fontFamily: 'monospace', outline: 'none' }}
            />
            <button onClick={submit} disabled={guess === ''}
              style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: guess !== '' ? '#818cf8' : '#333', color: guess !== '' ? '#0f172a' : '#555', fontWeight: 700, cursor: guess !== '' ? 'pointer' : 'default', fontSize: 14 }}>
              Submit
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 4 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: feedback.correct ? '#4dff91' : '#ff4455', marginBottom: 8 }}>
              {feedback.correct ? '✓ Correct!' : '✗ Wrong'}
            </div>
            {!feedback.correct && (
              <div style={{ fontSize: 14, color: '#a0c0ff' }}>
                The count was <strong style={{ color: '#4dff91', fontSize: 20 }}>{correctCount >= 0 ? `+${correctCount}` : correctCount}</strong>
                <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Watch each card value as it's played: 2–6 = +1, 10/A = −1</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Scenario Panel ─────────────────────────────────────────────────────────
const ScenarioPanel = ({ onSelect, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}>
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 16, maxWidth: 520, width: '100%', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Guided Scenarios</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Deal specific, notoriously difficult hands to learn the right play</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', padding: 4 }}>✕</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {BJ_SCENARIOS.map(sc => (
          <button key={sc.id} onClick={() => onSelect(sc)} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid #1e293b', borderRadius: 10,
            padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1d6fa422', border: '1px solid #1d6fa466', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#4dd0ff', flexShrink: 0 }}>
              {sc.badge}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{sc.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{sc.desc}</div>
            </div>
          </button>
        ))}
        <button onClick={() => onSelect(null)} style={{
          background: 'rgba(77,208,255,0.06)', border: '1px solid rgba(77,208,255,0.2)',
          borderRadius: 10, padding: '10px 16px', cursor: 'pointer', color: '#4dd0ff', fontSize: 13, fontWeight: 700,
        }}>
          Random Deal (no scenario)
        </button>
      </div>
    </div>
  </div>
)

const BlackjackGame = () => {
  const [deck, setDeck] = useState([])
  const [playerHand, setPlayerHand] = useState([])
  const [dealerHand, setDealerHand] = useState([])
  const [phase, setPhase] = useState('idle')
  const [message, setMessage] = useState('')
  const [score, setScore] = useState({ player: 0, dealer: 0 })
  const [busy, setBusy] = useState(false)
  const [runningCount, setRunningCount] = useState(0)
  const [seenCards, setSeenCards] = useState([])
  const [tutorMode, setTutorMode] = useState(true)
  const [tutorInterrupt, setTutorInterrupt] = useState(null)
  // New state
  const [scenario, setScenario] = useState(null)
  const [showScenarios, setShowScenarios] = useState(false)
  const [handCount, setHandCount] = useState(0)
  const [quizActive, setQuizActive] = useState(false)
  const [correctStrategies, setCorrectStrategies] = useState(0)
  const [correctQuizzes, setCorrectQuizzes] = useState(0)
  const [playerLevel, setPlayerLevel] = useState(0) // 0=beginner 1=intermediate 2=advanced
  const [levelUpMsg, setLevelUpMsg] = useState('')

  const checkLevelUp = useCallback((strategies, quizzes, currentLevel) => {
    if (currentLevel < 1 && strategies >= 5) {
      setPlayerLevel(1)
      setLevelUpMsg('Level Up! Running Count unlocked — watch the count update as cards are played.')
      setTimeout(() => setLevelUpMsg(''), 4000)
      return 1
    }
    if (currentLevel < 2 && quizzes >= 3) {
      setPlayerLevel(2)
      setLevelUpMsg('Level Up! True Count + EV Indicator unlocked. You think like the MIT team now.')
      setTimeout(() => setLevelUpMsg(''), 4000)
      return 2
    }
    return currentLevel
  }, [])

  const deal = useCallback(() => {
    let ph, dh, d, initSeen, initCount
    if (scenario) {
      const full = shuffle(makeDeck().filter(c =>
        !scenario.player.some(sc => sc.rank === c.rank && sc.suit === c.suit) &&
        !scenario.dealer.some(sc => sc.rank === c.rank && sc.suit === c.suit)
      ))
      ph = scenario.player
      dh = scenario.dealer
      d = full
      initSeen = [ph[0], ph[1], dh[0]]
      initCount = (scenario.preCount || 0) + initSeen.reduce((sum, c) => sum + hiLoValue(c.rank), 0)
    } else {
      const full = shuffle(makeDeck())
      ph = [full[0], full[2]]; dh = [full[1], full[3]]; d = full.slice(4)
      initSeen = [ph[0], ph[1], dh[0]]
      initCount = initSeen.reduce((sum, c) => sum + hiLoValue(c.rank), 0)
    }
    setDeck(d); setPlayerHand(ph); setDealerHand(dh); setPhase('playing')
    setMessage(''); setSeenCards(initSeen); setRunningCount(initCount)
    setHandCount(h => h + 1)
    const pv = bjHandValue(ph)
    if (pv === 21) { setMessage('Blackjack! You win!'); setScore(s => ({ ...s, player: s.player + 1 })); setPhase('done') }
  }, [scenario])

  const dealOrQuiz = () => {
    // Every 3 hands: count quiz before the next deal
    if (handCount > 0 && handCount % 3 === 0) { setQuizActive(true); return }
    deal()
  }

  const handleQuizDone = useCallback((wasCorrect) => {
    setQuizActive(false)
    setCorrectQuizzes(q => {
      const next = wasCorrect ? q + 1 : q
      checkLevelUp(correctStrategies, next, playerLevel)
      return next
    })
    deal()
  }, [deal, correctStrategies, playerLevel, checkLevelUp])

  const executeHit = useCallback(async () => {
    if (phase !== 'playing' || busy) return
    setBusy(true)
    const [card, ...rest] = deck
    const newHand = [...playerHand, card]
    const newSeen = [...seenCards, card]
    const newCount = runningCount + hiLoValue(card.rank)
    setPlayerHand(newHand); setDeck(rest); setSeenCards(newSeen); setRunningCount(newCount)
    if (bjHandValue(newHand) > 21) {
      setMessage(`Bust! ${bjHandValue(newHand)} — Dealer wins.`)
      setScore(s => ({ ...s, dealer: s.dealer + 1 })); setPhase('done')
    }
    setBusy(false)
  }, [deck, playerHand, phase, busy, seenCards, runningCount])

  const executeStand = useCallback(async () => {
    if (phase !== 'playing' || busy) return
    setBusy(true); setPhase('dealer')
    let dh = [...dealerHand], d = [...deck], seen = [...seenCards], rc = runningCount
    seen = [...seen, dealerHand[1]]; rc += hiLoValue(dealerHand[1].rank)
    while (bjHandValue(dh) < 17) {
      await sleep(600)
      const card = d.shift()
      dh = [...dh, card]; seen = [...seen, card]; rc += hiLoValue(card.rank)
      setDealerHand([...dh]); setDeck([...d]); setSeenCards([...seen]); setRunningCount(rc)
    }
    const dv = bjHandValue(dh), pv = bjHandValue(playerHand)
    await sleep(400)
    let msg, winner
    if (dv > 21) { msg = 'Dealer busts! You win!'; winner = 'player' }
    else if (dv > pv) { msg = `Dealer wins: ${dv} vs your ${pv}.`; winner = 'dealer' }
    else if (pv > dv) { msg = `You win! ${pv} beats ${dv}!`; winner = 'player' }
    else { msg = `Push — both ${pv}.`; winner = 'tie' }
    setMessage(msg)
    if (winner === 'player') setScore(s => ({ ...s, player: s.player + 1 }))
    else if (winner === 'dealer') setScore(s => ({ ...s, dealer: s.dealer + 1 }))
    setPhase('done'); setBusy(false)
  }, [dealerHand, deck, playerHand, phase, busy, seenCards, runningCount])

  const executeDouble = useCallback(async () => {
    if (phase !== 'playing' || busy) return
    setBusy(true)
    const [card, ...rest] = deck
    const newHand = [...playerHand, card]
    const newSeen = [...seenCards, card]
    let newCount = runningCount + hiLoValue(card.rank)
    setPlayerHand(newHand)
    if (bjHandValue(newHand) > 21) {
      setDeck(rest); setSeenCards(newSeen); setRunningCount(newCount)
      setMessage(`Double Down — Bust! ${bjHandValue(newHand)}`)
      setScore(s => ({ ...s, dealer: s.dealer + 1 })); setPhase('done'); setBusy(false); return
    }
    // Auto-stand
    setPhase('dealer')
    let dh = [...dealerHand], d = [...rest], seen = [...newSeen, dealerHand[1]]
    newCount += hiLoValue(dealerHand[1].rank)
    while (bjHandValue(dh) < 17) {
      await sleep(600)
      const c = d.shift()
      dh = [...dh, c]; seen = [...seen, c]; newCount += hiLoValue(c.rank)
      setDealerHand([...dh]); setDeck([...d]); setSeenCards([...seen]); setRunningCount(newCount)
    }
    const dv = bjHandValue(dh), pv = bjHandValue(newHand)
    await sleep(400)
    let msg, winner
    if (dv > 21) { msg = 'Double Down — Dealer busts! You win 2×!'; winner = 'player' }
    else if (dv > pv) { msg = `Double Down — Dealer wins: ${dv} vs ${pv}.`; winner = 'dealer' }
    else if (pv > dv) { msg = `Double Down — You win 2×! ${pv} beats ${dv}!`; winner = 'player' }
    else { msg = `Double Down — Push. Both ${pv}.`; winner = 'tie' }
    setMessage(msg)
    if (winner === 'player') setScore(s => ({ ...s, player: s.player + 1 }))
    else if (winner === 'dealer') setScore(s => ({ ...s, dealer: s.dealer + 1 }))
    setPhase('done'); setBusy(false)
  }, [deck, playerHand, phase, busy, seenCards, runningCount, dealerHand])

  const handleAction = (action) => {
    if (phase !== 'playing' || busy) return
    const pv = bjHandValue(playerHand)
    const dealerUpcard = dealerHand[0]
    const strat = basicStrategy(pv, dealerUpcard.rank)

    if (tutorMode && action !== strat) {
      let reason = ''
      if (strat === 'DOUBLE' && action !== 'DOUBLE') {
        reason = `${pv} vs dealer ${dealerUpcard.rank} is a DOUBLE opportunity. The dealer is vulnerable. Double your bet to maximise EV — you're in a winning position.`
      } else if (action === 'DOUBLE' && strat !== 'DOUBLE') {
        reason = `Doubling here is not basic strategy. You'd be committing more money where ${strat} is the mathematically correct play.`
      } else if (action === 'HIT' && strat === 'STAND') {
        reason = `You have ${pv} against dealer ${dealerUpcard.rank} — a weak card for the house. The dealer is likely to bust. STAND and collect when they do.`
      } else if (action === 'STAND' && strat === 'HIT') {
        reason = `You only have ${pv} vs dealer's strong ${dealerUpcard.rank}. The dealer will make 17+ most of the time. HIT to improve — the risk of busting is worth it.`
      } else {
        reason = `Basic strategy says ${strat} here. It has higher EV than ${action} in this exact situation.`
      }
      setTutorInterrupt({ intendedAction: action, advice: strat, reason })
      return
    }

    // Correct move — track for progression
    setCorrectStrategies(n => {
      const next = n + 1
      checkLevelUp(next, correctQuizzes, playerLevel)
      return next
    })
    if (action === 'HIT') executeHit()
    else if (action === 'STAND') executeStand()
    else if (action === 'DOUBLE') executeDouble()
  }

  const dispatch = (action) => {
    const strat = basicStrategy(bjHandValue(playerHand), dealerHand[0]?.rank)
    setTutorInterrupt(null)
    setCorrectStrategies(n => {
      const next = n + 1
      checkLevelUp(next, correctQuizzes, playerLevel)
      return next
    })
    if (action === 'HIT') executeHit()
    else if (action === 'STAND') executeStand()
    else if (action === 'DOUBLE') executeDouble()
    void strat
  }

  const pv = bjHandValue(playerHand)
  const dv = bjHandValue(dealerHand)
  const dealerUpcard = dealerHand[0]
  const remaining = deck.length
  const countPerGroup = (group, d) => d.filter(c => group.includes(c.rank)).length
  const low = countPerGroup(['2','3','4','5','6'], deck)
  const mid = countPerGroup(['7','8','9'], deck)
  const high = countPerGroup(['10','J','Q','K'], deck)
  const ace = countPerGroup(['A'], deck)

  const bustIfHit = () => {
    if (pv === 0 || deck.length === 0) return 0
    const bust = deck.filter(c => {
      let v = pv + BJ_VALUES[c.rank]
      let a = playerHand.filter(h => h.rank === 'A').length
      while (v > 21 && a > 0) { v -= 10; a-- }
      return v > 21
    })
    return Math.round((bust.length / deck.length) * 100)
  }
  const bustPct = bustIfHit()
  const decksRemaining = Math.max(deck.length / 52, 0.1)
  const trueCount = (runningCount / decksRemaining).toFixed(1)
  const strategy = (phase === 'playing' && dealerUpcard) ? basicStrategy(pv, dealerUpcard.rank) : null
  const stratColor = strategy === 'STAND' ? '#4dff91' : strategy === 'HIT' ? '#ff4455' : '#ffe040'
  const evFavors = parseFloat(trueCount) >= 1 ? 'PLAYER +EV' : parseFloat(trueCount) <= -1 ? 'HOUSE +EV' : 'NEUTRAL'
  const evColor = parseFloat(trueCount) >= 1 ? '#4dff91' : parseFloat(trueCount) <= -1 ? '#ff4455' : '#ffe040'

  const mathPanel = (
    <>
      {/* Progression indicator — only before level 1 */}
      {playerLevel < 1 && (
        <MPSection title="Your Progress">
          <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.6, marginBottom: 6 }}>
            Make <strong style={{ color: '#4dff91' }}>{Math.max(0, 5 - correctStrategies)}</strong> more correct strategy calls to unlock the <strong style={{ color: '#818cf8' }}>Running Count</strong>.
          </div>
          <HBar label="Correct moves" value={correctStrategies} max={5} color="#818cf8" />
          <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>Hint: trust the Basic Strategy recommendation below.</div>
        </MPSection>
      )}

      {playerLevel >= 1 && (
        <MPSection title="Deck Composition">
          <HBar label="Low (2-6)" value={low} max={20} color="#ff4455" subtitle={`${Math.round(low/Math.max(remaining,1)*100)}%`} />
          <HBar label="Mid (7-9)" value={mid} max={12} color="#ffe040" subtitle={`${Math.round(mid/Math.max(remaining,1)*100)}%`} />
          <HBar label="High (10-K)" value={high} max={16} color="#4dff91" subtitle={`${Math.round(high/Math.max(remaining,1)*100)}%`} />
          <HBar label="Ace" value={ace} max={4} color="#4dd0ff" subtitle={`${Math.round(ace/Math.max(remaining,1)*100)}%`} />
          <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{remaining} cards remaining</div>
        </MPSection>
      )}

      {playerLevel >= 1 && (
        <MPSection title="Hi-Lo Card Count">
          <BigNum
            value={runningCount >= 0 ? `+${runningCount}` : runningCount}
            label="Running Count"
            color={runningCount > 0 ? '#4dff91' : runningCount < 0 ? '#ff4455' : '#ffe040'}
          />
          <Formula text={`+1 = low (2-6)  |  0 = neutral (7-9)  |  −1 = high (10,A)`} />
          {playerLevel >= 2 && (
            <>
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>True Count = RC ÷ Decks Left</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#cc44ff', fontFamily: 'monospace' }}>{runningCount >= 0 ? `+${trueCount}` : trueCount}</div>
                <Formula text={`TC = ${runningCount} / ${decksRemaining.toFixed(2)} decks`} />
              </div>
              {playerLevel < 2 && (
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, textAlign: 'center' }}>
                  Pass {Math.max(0, 3 - correctQuizzes)} more count quizzes to unlock True Count.
                </div>
              )}
            </>
          )}
          {playerLevel < 2 && (
            <div style={{ fontSize: 10, color: '#475569', marginTop: 6, textAlign: 'center' }}>
              Pass {Math.max(0, 3 - correctQuizzes)} count quiz{correctQuizzes < 2 ? 'zes' : ''} to unlock True Count &amp; EV
            </div>
          )}
          <div style={{ fontSize: 11, color: runningCount > 0 ? '#4dff91' : runningCount < 0 ? '#ff4455' : '#ffe040', textAlign: 'center', marginTop: 6, lineHeight: 1.5 }}>
            {runningCount > 0 ? 'HOT deck — more 10s, favors player' : runningCount < 0 ? 'COLD deck — favors house' : 'Neutral deck'}
          </div>
        </MPSection>
      )}

      {phase === 'playing' && (
        <MPSection title="If You Hit Now">
          <HBar label="Bust probability" value={bustPct} max={100} color={bustPct > 50 ? '#ff4455' : '#ffe040'} subtitle={`${bustPct}%`} />
          <Formula text={`P(bust) = bust_cards / remaining`} />
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>At total {pv}: {bustPct}% bust risk if you hit.</div>
        </MPSection>
      )}

      {strategy && (
        <MPSection title="Basic Strategy">
          <div style={{ textAlign: 'center', padding: '6px 0' }}>
            <Badge label={strategy} color={stratColor} />
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 8, lineHeight: 1.5 }}>
              Your total: <strong style={{ color: '#fff' }}>{pv}</strong><br />
              Dealer shows: <strong style={{ color: '#fff' }}>{dealerUpcard?.rank}</strong>
            </div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 6 }}>Hard-total basic strategy table</div>
          </div>
        </MPSection>
      )}

      {playerLevel >= 2 && (
        <MPSection title="EV Indicator">
          <div style={{ textAlign: 'center' }}>
            <Badge label={evFavors} color={evColor} />
            <div style={{ fontSize: 10, color: '#555', marginTop: 6, lineHeight: 1.5 }}>
              TC ≥ +2: player +EV &nbsp;|&nbsp; TC ≤ −1: house +EV<br />Base house edge: ~0.5%
            </div>
          </div>
        </MPSection>
      )}
    </>
  )

  return (
    <>
      <CountQuizModal active={quizActive} correctCount={runningCount} onDone={handleQuizDone} />
      <TutorModal
        interrupt={tutorInterrupt}
        onRevise={() => dispatch(tutorInterrupt.advice)}
        onForce={() => dispatch(tutorInterrupt.intendedAction)}
      />
      {showScenarios && (
        <ScenarioPanel
          onSelect={(sc) => { setScenario(sc); setShowScenarios(false) }}
          onClose={() => setShowScenarios(false)}
        />
      )}
      {levelUpMsg && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 2000, background: '#0f172a', border: '2px solid #818cf8', borderRadius: 12, padding: '12px 20px', color: '#818cf8', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', maxWidth: 420, textAlign: 'center' }}>
          ⬆️ {levelUpMsg}
        </div>
      )}
      <GameLayout
        left={
          <div>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ color: '#a0c0ff', fontSize: 14 }}>
                <span style={{ color: '#ffd700', fontWeight: 700 }}>Player:</span> {score.player}&nbsp;
                <span style={{ color: '#ff8080' }}>Dealer:</span> {score.dealer}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {phase !== 'idle' && (
                  <div style={{ color: '#e0e0ff', fontSize: 14 }}>
                    Total: <strong style={{ color: pv > 21 ? '#ff4455' : pv === 21 ? '#4dff91' : '#fff' }}>{pv}</strong>
                  </div>
                )}
                <button onClick={() => setShowScenarios(true)} style={{ background: scenario ? 'rgba(77,208,255,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${scenario ? '#4dd0ff55' : '#33415566'}`, borderRadius: 6, padding: '4px 10px', fontSize: 11, color: scenario ? '#4dd0ff' : '#64748b', fontWeight: 700, cursor: 'pointer' }}>
                  {scenario ? `Scenario ${scenario.badge}` : 'Scenarios'}
                </button>
                <div onClick={() => setTutorMode(t => !t)} style={{ background: tutorMode ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.07)', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', border: `1px solid ${tutorMode ? '#4ade8055' : '#33415566'}` }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: tutorMode ? '#4ade80' : '#475569' }} />
                  <span style={{ fontSize: 11, color: tutorMode ? '#4ade80' : '#64748b', fontWeight: 700 }}>TUTOR</span>
                </div>
              </div>
            </div>

            {/* Scenario banner */}
            {scenario && (
              <div style={{ background: 'rgba(77,208,255,0.06)', border: '1px solid rgba(77,208,255,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4dd0ff', letterSpacing: 1, marginBottom: 4 }}>SCENARIO {scenario.badge} — {scenario.name.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{scenario.desc}</div>
              </div>
            )}

            {/* Dealer */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: '#a0c0ff', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>DEALER</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 100 }}>
                {dealerHand.map((c, i) => <Card key={c.id} card={c} faceDown={i === 1 && phase === 'playing'} />)}
              </div>
              {phase !== 'idle' && phase !== 'playing' && (
                <div style={{ color: '#ff8080', fontSize: 13, marginTop: 4 }}>Value: {dv}</div>
              )}
            </div>

            {/* Player hand */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: '#a0c0ff', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>YOUR HAND</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 100 }}>
              {playerHand.map((c) => <Card key={c.id} card={c} />)}
            </div>
          </div>

          {message && (
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#ffd700', fontWeight: 700, fontSize: 16, marginBottom: 16, textAlign: 'center' }}>
              {message}
            </div>
          )}

          {scenario && phase === 'done' && (
            <div style={{ background: 'rgba(77,208,255,0.06)', border: '1px solid rgba(77,208,255,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#4dd0ff', fontWeight: 700, marginBottom: 6 }}>LESSON TAKEAWAY</div>
              <div style={{ fontSize: 13, color: '#a0c0ff', lineHeight: 1.6 }}>{scenario.lesson}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {phase === 'idle' || phase === 'done' ? (
              <button onClick={dealOrQuiz} style={btnStyle('#0f9960')}>{phase === 'done' ? 'Deal Again' : 'Deal Cards'}</button>
            ) : (
              <>
                <button onClick={() => handleAction('HIT')} disabled={busy} style={btnStyle('#1d6fa4', busy)}>Hit</button>
                <button onClick={() => handleAction('STAND')} disabled={busy} style={btnStyle('#7c3aed', busy)}>Stand</button>
                {pv >= 9 && pv <= 11 && (
                  <button onClick={() => handleAction('DOUBLE')} disabled={busy} style={btnStyle('#d97706', busy)}>Double Down</button>
                )}
              </>
            )}
          </div>

          {phase === 'idle' && (
            <div style={{ marginTop: 24, color: '#7070aa', fontSize: 13, lineHeight: 1.7 }}>
              Beat the dealer to 21 without going over. Watch the math panel on the right update live as cards are played.
            </div>
          )}
        </div>
      }
      right={mathPanel}
    />
    </>
  )
}

// ═══════════════════════════════════════════════
//  GAME: CARD COUNTER — MIT Method
// ═══════════════════════════════════════════════
const HILO_TABLE = [
  { ranks: ['2','3','4','5','6'], value: +1, label: '2 – 6', color: '#ff4455', why: 'Low cards removed = deck gets richer in 10s → good for you' },
  { ranks: ['7','8','9'],         value:  0, label: '7 – 9', color: '#ffe040', why: 'Neutral cards — no meaningful shift in deck composition' },
  { ranks: ['10','J','Q','K','A'], value: -1, label: '10, J, Q, K, A', color: '#4dff91', why: 'High cards removed = deck gets poorer in 10s → bad for you' },
]

const CardCounterGame = () => {
  const [phase, setPhase] = useState('story')  // story | learn | practice | check | done
  const [deck, setDeck] = useState([])
  const [cardIndex, setCardIndex] = useState(0)
  const [visibleCard, setVisibleCard] = useState(null)
  const [seenCards, setSeenCards] = useState([])
  const [correctCount, setCorrectCount] = useState(0)
  const [userGuess, setUserGuess] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [speed, setSpeed] = useState('normal') // slow | normal | fast
  const autoRef = useRef(null)
  const CHECK_EVERY = 8

  const startPractice = () => {
    const d = shuffle(makeDeck())
    setDeck(d)
    setCardIndex(0)
    setVisibleCard(d[0])
    setSeenCards([])
    setCorrectCount(0)
    setUserGuess('')
    setFeedback(null)
    setScore({ correct: 0, total: 0 })
    setPhase('practice')
  }

  const advanceCard = useCallback((currentIndex, currentDeck, currentSeen) => {
    const card = currentDeck[currentIndex]
    const newSeen = [...currentSeen, card]
    const newCount = newSeen.reduce((s, c) => s + hiLoValue(c.rank), 0)
    setSeenCards(newSeen)
    setCorrectCount(newCount)
    const nextIdx = currentIndex + 1
    if (nextIdx >= currentDeck.length) {
      setVisibleCard(null)
      setPhase('check')
      return
    }
    setCardIndex(nextIdx)
    setVisibleCard(currentDeck[nextIdx])
    if (newSeen.length % CHECK_EVERY === 0) {
      setPhase('check')
    }
  }, [])

  useEffect(() => {
    if (phase !== 'practice') { clearInterval(autoRef.current); return }
    const delay = speed === 'slow' ? 1800 : speed === 'fast' ? 600 : 1100
    autoRef.current = setInterval(() => {
      setCardIndex(ci => {
        setDeck(d => {
          setSeenCards(s => {
            advanceCard(ci, d, s)
            return s
          })
          return d
        })
        return ci
      })
    }, delay)
    return () => clearInterval(autoRef.current)
  }, [phase, speed, advanceCard])

  const submitGuess = () => {
    const guess = parseInt(userGuess, 10)
    if (isNaN(guess)) return
    const isCorrect = guess === correctCount
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }))
    setFeedback({ correct: isCorrect, guess, correctCount })
    setUserGuess('')
    setTimeout(() => {
      setFeedback(null)
      if (cardIndex >= deck.length) { setPhase('done'); return }
      setPhase('practice')
    }, 1400)
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : null
  const trueCount = seenCards.length > 0 ? (correctCount / Math.max(1, (52 - seenCards.length) / 52)).toFixed(1) : '0'
  const countColor = correctCount > 2 ? '#4dff91' : correctCount < -2 ? '#ff4455' : '#ffe040'
  const lastCard = seenCards[seenCards.length - 1]

  const mathPanel = (
    <>
      <MPSection title="Hi-Lo Counting System">
        {HILO_TABLE.map(row => (
          <div key={row.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '7px 10px', marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#ddd', fontFamily: 'monospace', fontWeight: 700 }}>{row.label}</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: row.color, fontFamily: 'monospace' }}>
                {row.value > 0 ? '+1' : row.value < 0 ? '−1' : '0'}
              </span>
            </div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 3, lineHeight: 1.4 }}>{row.why}</div>
          </div>
        ))}
      </MPSection>

      {seenCards.length > 0 && (
        <>
          <MPSection title="Running Count">
            <BigNum
              value={correctCount >= 0 ? `+${correctCount}` : correctCount}
              label={correctCount > 2 ? '🔥 Deck is HOT — bet more' : correctCount < -2 ? '❄️ Deck is COLD — bet less' : '😐 Neutral deck'}
              color={countColor}
              formula={`True Count = ${trueCount} (RC ÷ decks left)`}
            />
          </MPSection>

          <MPSection title="What This Means">
            <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.7 }}>
              {correctCount >= 3 && <>
                <div style={{ color: '#4dff91', fontWeight: 700, marginBottom: 4 }}>Raise your bet!</div>
                The deck has more 10s and Aces than usual. You're more likely to hit 21 and the dealer is more likely to bust on forced hits.
              </>}
              {correctCount <= -3 && <>
                <div style={{ color: '#ff4455', fontWeight: 700, marginBottom: 4 }}>Bet minimum.</div>
                The deck has been stripped of high cards. 10s and Aces are scarce — blackjacks are unlikely.
              </>}
              {correctCount > -3 && correctCount < 3 && <>
                <div style={{ color: '#ffe040', fontWeight: 700, marginBottom: 4 }}>Neutral — play basic strategy.</div>
                The deck composition is roughly even. No significant edge either way.
              </>}
            </div>
          </MPSection>

          {lastCard && (
            <MPSection title="Last Card Seen">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 900, color: '#fff' }}>
                  {lastCard.rank}{lastCard.suit}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: hiLoValue(lastCard.rank) > 0 ? '#ff4455' : hiLoValue(lastCard.rank) < 0 ? '#4dff91' : '#ffe040' }}>
                  {hiLoValue(lastCard.rank) > 0 ? '+1' : hiLoValue(lastCard.rank) < 0 ? '−1' : '0'}
                </div>
              </div>
            </MPSection>
          )}

          <MPSection title="Progress">
            <HBar label="Cards seen" value={seenCards.length} max={52} color="#4dd0ff" />
            {accuracy !== null && <HBar label="Count accuracy" value={score.correct} max={score.total} color="#4dff91" subtitle={`${accuracy}%`} />}
          </MPSection>
        </>
      )}
    </>
  )

  // ── STORY SCREEN ──
  if (phase === 'story') return (
    <GameLayout
      left={
        <div style={{ maxWidth: 580 }}>
          <div style={{ background: 'rgba(77,208,255,0.06)', border: '1px solid rgba(77,208,255,0.2)', borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4dd0ff', letterSpacing: 2, marginBottom: 10 }}>THE TRUE STORY</div>
            <div style={{ fontSize: 14, color: '#c0d8f0', lineHeight: 1.8 }}>
              In the 1990s, a group of MIT students and a maths professor formed a secret blackjack team.
              They trained obsessively in card counting — a legal but casino-banned technique — and took
              Las Vegas casinos for <strong style={{ color: '#ffe040' }}>millions of dollars</strong>.
              Their story became the book <em>"Bringing Down the House"</em> and the 2008 film <strong style={{ color: '#4dff91' }}>21</strong>.
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>How did they do it?</div>
          <div style={{ fontSize: 13, color: '#a0b8d0', lineHeight: 1.8, marginBottom: 20 }}>
            They used the <strong style={{ color: '#4dd0ff' }}>Hi-Lo counting system</strong> — the same one you'll learn here.
            The idea is simple: a deck rich in 10s and Aces favours the <em>player</em>, not the house.
            By tracking which cards have been played, you know when the remaining deck is in your favour
            and you raise your bet. When it's not, you bet the minimum.
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>The three rules:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {HILO_TABLE.map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: row.color, fontFamily: 'monospace', width: 36, textAlign: 'center' }}>
                  {row.value > 0 ? '+1' : row.value < 0 ? '−1' : '0'}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{row.label}</div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{row.why}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 1.7 }}>
            You start at <strong style={{ color: '#fff' }}>0</strong>. Every card you see, adjust your count.
            At the end of each batch, you'll be asked: <em>"What is your count?"</em>
            <br />Count above <strong style={{ color: '#4dff91' }}>+3</strong>? The MIT team would bet big.
            Below <strong style={{ color: '#ff4455' }}>−3</strong>? Bet the table minimum and wait.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setPhase('learn')} style={btnStyle('#1d6fa4')}>Study the System First</button>
            <button onClick={startPractice} style={btnStyle('#0f9960')}>I Got It — Start Counting</button>
          </div>
        </div>
      }
      right={mathPanel}
    />
  )

  // ── LEARN SCREEN ──
  if (phase === 'learn') return (
    <GameLayout
      left={
        <div style={{ maxWidth: 560 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#4dd0ff', marginBottom: 16 }}>Quick Reference — memorise this</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
            {['2','3','4','5','6','7','8','9','10','J','Q','K','A'].map(r => {
              const v = hiLoValue(r)
              const col = v > 0 ? '#ff4455' : v < 0 ? '#4dff91' : '#ffe040'
              return (
                <div key={r} style={{ background: col + '18', border: `1px solid ${col}55`, borderRadius: 8, padding: '10px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{r}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: col, marginTop: 4 }}>{v > 0 ? '+1' : v < 0 ? '−1' : '0'}</div>
                </div>
              )
            })}
          </div>

          <div style={{ background: 'rgba(255,224,64,0.08)', border: '1px solid rgba(255,224,64,0.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffe040', marginBottom: 8 }}>The MIT betting rule:</div>
            <div style={{ fontSize: 13, color: '#c0d0a0', lineHeight: 1.8 }}>
              Running Count &gt; +3 → <strong style={{ color: '#4dff91' }}>Bet big</strong> (deck favours you)<br />
              Running Count &lt; −3 → <strong style={{ color: '#ff4455' }}>Bet minimum</strong> (house has edge)<br />
              True Count = Running Count ÷ Decks remaining
            </div>
          </div>

          <button onClick={startPractice} style={btnStyle('#0f9960')}>Start Counting Practice →</button>
        </div>
      }
      right={mathPanel}
    />
  )

  // ── PRACTICE / CHECK / DONE SCREENS ──
  return (
    <GameLayout
      left={
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ color: '#a0c0ff', fontSize: 13 }}>
              Card <strong style={{ color: '#fff' }}>{seenCards.length}</strong> / 52
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['slow','normal','fast'].map(s => (
                <button key={s} onClick={() => setSpeed(s)}
                  style={{ ...btnStyle(speed === s ? '#7c3aed' : '#1a1a3e'), padding: '5px 10px', fontSize: 11, border: speed === s ? 'none' : '1px solid #333' }}>
                  {s}
                </button>
              ))}
              <button onClick={() => setPhase('story')} style={{ ...btnStyle('#333'), padding: '5px 10px', fontSize: 11 }}>
                Rules
              </button>
            </div>
          </div>

          {/* Card display */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140, marginBottom: 16 }}>
            {visibleCard
              ? <Card card={visibleCard} />
              : <div style={{ width: 72, height: 100, borderRadius: 8, border: '2px dashed #333', opacity: 0.3 }} />
            }
          </div>

          {/* Recent cards trail */}
          {seenCards.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
              {seenCards.slice(-12).map((c, i) => {
                const v = hiLoValue(c.rank)
                const col = v > 0 ? '#ff4455' : v < 0 ? '#4dff91' : '#ffe040'
                return (
                  <div key={i} style={{ fontSize: 11, fontFamily: 'monospace', color: col, background: col + '18', borderRadius: 4, padding: '2px 5px' }}>
                    {c.rank} <span style={{ opacity: 0.5 }}>{v > 0 ? '+1' : v < 0 ? '−1' : '0'}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* CHECK phase */}
          {phase === 'check' && (
            <div style={{ background: 'rgba(255,224,64,0.08)', border: '1px solid rgba(255,224,64,0.3)', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ color: '#ffe040', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                🎲 Count check — what is your running count?
              </div>
              {feedback ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: feedback.correct ? '#4dff91' : '#ff4455' }}>
                    {feedback.correct ? '✓ Correct!' : '✗ Wrong'}
                  </div>
                  {!feedback.correct && (
                    <div style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>
                      You said <strong style={{ color: '#ff4455' }}>{feedback.guess}</strong> — correct was <strong style={{ color: '#4dff91' }}>{feedback.correctCount > 0 ? `+${feedback.correctCount}` : feedback.correctCount}</strong>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="number"
                    value={userGuess}
                    onChange={e => setUserGuess(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitGuess()}
                    autoFocus
                    placeholder="e.g. +3 or −2"
                    style={{
                      background: '#0d1525', border: '1.5px solid #4dd0ff66', borderRadius: 8,
                      color: '#fff', fontSize: 20, padding: '8px 14px', width: 140,
                      fontFamily: 'monospace', outline: 'none',
                    }}
                  />
                  <button onClick={submitGuess} disabled={userGuess === ''} style={btnStyle('#7c3aed', userGuess === '')}>
                    Submit
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 'done' && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#4dff91', marginBottom: 8 }}>Full deck complete!</div>
              <div style={{ fontSize: 14, color: '#a0c0ff', marginBottom: 6 }}>
                Accuracy: <strong style={{ color: accuracy >= 80 ? '#4dff91' : '#ff4455', fontSize: 22 }}>{accuracy}%</strong>
              </div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 1.7 }}>
                {accuracy >= 90 && 'Casino-level counting. The MIT team would recruit you.'}
                {accuracy >= 70 && accuracy < 90 && 'Solid. Keep practicing — speed comes with repetition.'}
                {accuracy < 70 && 'Keep at it. Focus on 10s and Aces pulling the count down.'}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={startPractice} style={btnStyle('#0f9960')}>Practice Again</button>
                <button onClick={() => setPhase('learn')} style={btnStyle('#1d6fa4')}>Review Rules</button>
              </div>
            </div>
          )}
        </div>
      }
      right={mathPanel}
    />
  )
}

// ═══════════════════════════════════════════════
//  GAME: HIGHER / LOWER
// ═══════════════════════════════════════════════
const HigherLowerGame = () => {
  const [deck, setDeck] = useState([])
  const [current, setCurrent] = useState(null)
  const [next, setNext] = useState(null)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [phase, setPhase] = useState('idle')
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState([])
  const [rankCounts, setRankCounts] = useState({})

  const start = () => {
    const d = shuffle(makeDeck())
    // remaining deck counts
    const counts = {}
    for (const c of d) counts[c.rank] = (counts[c.rank] || 0) + 1
    setRankCounts(counts)
    setCurrent(d[0])
    setNext(d[1])
    setDeck(d.slice(2))
    setStreak(0)
    setPhase('playing')
    setMessage('Higher or Lower than the current card?')
    setHistory([])
  }

  const guess = (dir) => {
    if (phase !== 'playing' || !current || !next) return
    const cv = RANK_VALUES_ACE_HIGH[current.rank]
    const nv = RANK_VALUES_ACE_HIGH[next.rank]
    const isHigher = nv > cv, isLower = nv < cv, isSame = nv === cv
    const correct = (dir === 'higher' && isHigher) || (dir === 'lower' && isLower)

    // update rank counts (remove next card which is now revealed)
    const newCounts = { ...rankCounts }
    if (newCounts[next.rank]) newCounts[next.rank] = Math.max(0, newCounts[next.rank] - 1)
    setRankCounts(newCounts)

    setHistory(h => [...h, { card: current, correct, dir }])

    if (isSame) {
      setMessage(`Same rank (${current.rank})! Push.`)
      setCurrent(next)
      if (deck.length > 0) { const [nc, ...rest] = deck; setNext(nc); setDeck(rest) }
      return
    }

    if (correct) {
      const ns = streak + 1
      setStreak(ns)
      setBest(b => Math.max(b, ns))
      setMessage(`Correct! ${next.rank} was ${isHigher ? 'higher' : 'lower'}. Streak: ${ns}`)
    } else {
      setMessage(`Wrong! ${next.rank} was ${isHigher ? 'higher' : 'lower'}. Streak of ${streak} ends.`)
      setStreak(0)
    }

    setCurrent(next)
    if (deck.length > 0) { const [nc, ...rest] = deck; setNext(nc); setDeck(rest) }
    else { setPhase('done'); setMessage(`Game over! Best streak: ${best} `) }
  }

  // Probability calculations
  const allRemaining = next ? [...deck, next] : deck
  const cv = current ? RANK_VALUES_ACE_HIGH[current.rank] : 0
  const higherCards = allRemaining.filter(c => RANK_VALUES_ACE_HIGH[c.rank] > cv)
  const lowerCards = allRemaining.filter(c => RANK_VALUES_ACE_HIGH[c.rank] < cv)
  const equalCards = allRemaining.filter(c => RANK_VALUES_ACE_HIGH[c.rank] === cv)
  const total = allRemaining.length || 1
  const pHigher = Math.round((higherCards.length / total) * 100)
  const pLower = Math.round((lowerCards.length / total) * 100)
  const pEqual = Math.round((equalCards.length / total) * 100)

  const optimal = pHigher > pLower ? 'HIGHER' : pLower > pHigher ? 'LOWER' : 'EITHER'
  const optimalColor = optimal === 'HIGHER' ? '#4dff91' : optimal === 'LOWER' ? '#ff4455' : '#ffe040'

  // Streak probability: P(N more correct) = (best_prob/100)^N
  const streakProbs = [1, 2, 3, 5].map(n => ({
    n,
    p: Math.round(Math.pow(Math.max(pHigher, pLower) / 100, n) * 100),
  }))

  // Deck histogram
  const histRanks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']

  const mathPanel = (
    <>
      <MPSection title="Next Card Probability">
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, textAlign: 'center', background: '#4dff9122', borderRadius: 8, padding: '8px 4px', border: '1px solid #4dff9144' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#4dff91', fontFamily: 'monospace' }}>{pHigher}%</div>
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>Higher</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: '#ffe04022', borderRadius: 8, padding: '8px 4px', border: '1px solid #ffe04044' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#ffe040', fontFamily: 'monospace' }}>{pEqual}%</div>
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>Equal</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: '#ff445522', borderRadius: 8, padding: '8px 4px', border: '1px solid #ff455544' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#ff4455', fontFamily: 'monospace' }}>{pLower}%</div>
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>Lower</div>
          </div>
        </div>
        <HBar label="Higher" value={pHigher} max={100} color="#4dff91" />
        <HBar label="Lower" value={pLower} max={100} color="#ff4455" />
        <div style={{ textAlign: 'center', marginTop: 6 }}>
          <div style={{ fontSize: 10, color: '#aaa', marginBottom: 4 }}>Optimal choice</div>
          <Badge label={optimal} color={optimalColor} />
        </div>
        <Formula text={`P(higher) = ${higherCards.length} / ${total} cards remaining`} />
      </MPSection>

      <MPSection title="Remaining Deck Histogram">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {histRanks.map(r => {
            const cnt = rankCounts[r] || 0
            return (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 22, fontSize: 10, color: '#aaa', textAlign: 'right', fontFamily: 'monospace' }}>{r}</div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${(cnt / 4) * 100}%`, height: '100%', background: '#4dd0ff', borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
                <div style={{ width: 12, fontSize: 10, color: '#555', fontFamily: 'monospace' }}>{cnt}</div>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>Each rank starts with 4 copies</div>
      </MPSection>

      <MPSection title="Streak Probability">
        {streakProbs.map(sp => (
          <HBar key={sp.n} label={`${sp.n} more correct`} value={sp.p} max={100} color="#cc44ff" subtitle={`${sp.p}%`} />
        ))}
        <Formula text={`P(N correct) = (best_pct/100)^N`} />
      </MPSection>

      <MPSection title="Session">
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#4dff91', fontFamily: 'monospace' }}>{streak}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>Current streak</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#ffd700', fontFamily: 'monospace' }}>{best}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>Best streak</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 6, flexWrap: 'wrap' }}>
          {history.slice(-16).map((h, i) => (
            <span key={i} style={{ fontSize: 13 }}>{h.correct ? '✓' : '✗'}</span>
          ))}
        </div>
      </MPSection>
    </>
  )

  return (
    <GameLayout
      left={
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ color: '#4dff91', fontSize: 14 }}>Streak: <strong>{streak}</strong></div>
            <div style={{ color: '#ffd700', fontSize: 14 }}>Best: <strong>{best}</strong></div>
            <div style={{ color: '#a0c0ff', fontSize: 14 }}>Cards left: <strong>{deck.length}</strong></div>
          </div>

          {phase !== 'idle' && current && (
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ color: '#888', fontSize: 11, marginBottom: 8, letterSpacing: 1 }}>CURRENT CARD</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Card card={current} />
              </div>
              <div style={{ fontSize: 12, color: '#a0c0ff', marginTop: 8 }}>
                Value: {RANK_VALUES_ACE_HIGH[current.rank]} (Ace high)
              </div>
            </div>
          )}

          {message && (
            <div style={{ textAlign: 'center', color: '#ffd700', fontSize: 14, margin: '10px 0 16px', fontWeight: 600 }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {phase === 'idle' || phase === 'done' ? (
              <button onClick={start} style={btnStyle('#0f9960')}>{phase === 'done' ? 'Play Again' : 'Start Game'}</button>
            ) : (
              <>
                <button onClick={() => guess('higher')} style={btnStyle('#0f9960')}>Higher</button>
                <button onClick={() => guess('lower')} style={btnStyle('#c0392b')}>Lower</button>
              </>
            )}
          </div>

          {phase === 'idle' && (
            <div style={{ marginTop: 24, color: '#7070aa', fontSize: 13, lineHeight: 1.7 }}>
              Guess whether the next card is higher or lower. The math panel shows live probabilities and the remaining deck — use them to make optimal decisions.
            </div>
          )}
        </div>
      }
      right={mathPanel}
    />
  )
}

// ═══════════════════════════════════════════════
//  GAME: WAR
// ═══════════════════════════════════════════════
const WarGame = () => {
  const [playerDeck, setPlayerDeck] = useState([])
  const [aiDeck, setAiDeck] = useState([])
  const [playerCard, setPlayerCard] = useState(null)
  const [aiCard, setAiCard] = useState(null)
  const [warPile, setWarPile] = useState([])
  const [message, setMessage] = useState('')
  const [phase, setPhase] = useState('idle')
  const [roundNum, setRoundNum] = useState(0)
  const [playerWins, setPlayerWins] = useState(0)
  const [aiWins, setAiWins] = useState(0)
  const [tieCount, setTieCount] = useState(0)
  const [winHistory, setWinHistory] = useState([]) // 'p' | 'a' | 't'

  const startGame = () => {
    const d = shuffle(makeDeck())
    setPlayerDeck(d.slice(0, 26))
    setAiDeck(d.slice(26))
    setPlayerCard(null); setAiCard(null); setWarPile([])
    setMessage("Click 'Flip Card' to battle!")
    setPhase('playing'); setRoundNum(0)
    setPlayerWins(0); setAiWins(0); setTieCount(0)
    setWinHistory([])
  }

  const flip = () => {
    if (phase !== 'playing') return
    if (playerDeck.length === 0 || aiDeck.length === 0) {
      setMessage(playerDeck.length === 0 ? 'AI wins the war!' : 'You win the war!')
      setPhase('done'); return
    }
    const [pc, ...pd] = playerDeck, [ac, ...ad] = aiDeck
    setPlayerCard(pc); setAiCard(ac); setRoundNum(r => r + 1)
    const pv = RANK_VALUES[pc.rank], av = RANK_VALUES[ac.rank]

    if (pv > av) {
      const won = [...warPile, pc, ac]
      setPlayerDeck([...pd, ...shuffle(won)]); setAiDeck(ad); setWarPile([])
      setMessage(`You win! ${pc.rank} beats ${ac.rank}. +${won.length} cards`)
      setPlayerWins(w => w + 1)
      setWinHistory(h => [...h, 'p'])
    } else if (av > pv) {
      const won = [...warPile, pc, ac]
      setAiDeck([...ad, ...shuffle(won)]); setPlayerDeck(pd); setWarPile([])
      setMessage(`AI wins! ${ac.rank} beats ${pc.rank}. AI +${won.length} cards`)
      setAiWins(w => w + 1)
      setWinHistory(h => [...h, 'a'])
    } else {
      setWarPile(w => [...w, pc, ac])
      setMessage(`WAR! Both played ${pc.rank}. ${warPile.length + 2} cards at stake!`)
      setPlayerDeck(pd); setAiDeck(ad)
      setTieCount(t => t + 1)
      setWinHistory(h => [...h, 't'])
    }
  }

  const totalRounds = playerWins + aiWins + tieCount
  const pWinPct = totalRounds > 0 ? Math.round((playerWins / totalRounds) * 100) : 50
  const aWinPct = totalRounds > 0 ? Math.round((aiWins / totalRounds) * 100) : 50

  // Theoretical win probability based on card counts
  const playerCardShare = Math.round(((playerDeck.length) / Math.max(playerDeck.length + aiDeck.length, 1)) * 100)

  const mathPanel = (
    <>
      <MPSection title="Win Probability Curve">
        <HBar label="Your card share" value={playerCardShare} max={100} color="#4dff91" subtitle={`${playerCardShare}%`} />
        <HBar label="AI card share" value={100 - playerCardShare} max={100} color="#ff4455" subtitle={`${100 - playerCardShare}%`} />
        <Formula text={`P(you win) ≈ your_cards / total_cards`} />
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 4, lineHeight: 1.5 }}>
          In War, your win probability is directly proportional to your card share.
        </div>
      </MPSection>

      <MPSection title="Round Statistics">
        <HBar label="You won" value={playerWins} max={Math.max(totalRounds, 1)} color="#4dff91" subtitle={`${pWinPct}%`} />
        <HBar label="AI won" value={aiWins} max={Math.max(totalRounds, 1)} color="#ff4455" subtitle={`${aWinPct}%`} />
        <HBar label="Wars (ties)" value={tieCount} max={Math.max(totalRounds, 1)} color="#ffe040" subtitle={tieCount.toString()} />
        <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>
          P(tie on any flip) = 3/51 ≈ 5.9% (3 matching ranks remain)
        </div>
      </MPSection>

      <MPSection title="Card Balance">
        <div style={{ position: 'relative', height: 18, borderRadius: 6, overflow: 'hidden', background: '#ff445544' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0,
            width: `${playerCardShare}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4dff91, #00c4ff)',
            borderRadius: '6px 0 0 6px',
            transition: 'width 0.4s',
          }} />
          <div style={{
            position: 'absolute', width: '100%', top: 0, left: 0, height: '100%',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0 8px', fontSize: 10, fontWeight: 700, color: '#000',
          }}>
            <span>You: {playerDeck.length}</span>
            <span>AI: {aiDeck.length}</span>
          </div>
        </div>
      </MPSection>

      {warPile.length > 0 && (
        <MPSection title="War Pile">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#ff6b35', fontFamily: 'monospace' }}>{warPile.length}</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>cards at stake</div>
          </div>
          <Formula text={`P(war) = remaining_matches / remaining_cards`} />
        </MPSection>
      )}

      <MPSection title="Recent Rounds">
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {winHistory.slice(-20).map((r, i) => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: 3,
              background: r === 'p' ? '#4dff91' : r === 'a' ? '#ff4455' : '#ffe040',
              opacity: 0.8,
            }} />
          ))}
        </div>
        <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>
          Green=you won, Red=AI won, Yellow=war
        </div>
      </MPSection>

      <MPSection title="Gambler's Ruin">
        <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.6 }}>
          Even with exactly 50/50 odds, one player always eventually wins all cards. Expected game length scales as O(n²) — with 26 cards each, expect ~676 rounds. The initial shuffle determines the entire outcome.
        </div>
        <Formula text={`E[rounds] ≈ n² where n = cards/player`} />
      </MPSection>
    </>
  )

  return (
    <GameLayout
      left={
        <div>
          {phase !== 'idle' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ color: '#a0c0ff', fontSize: 13 }}>Your cards: <strong style={{ color: '#4dff91' }}>{playerDeck.length}</strong></div>
              <div style={{ color: '#e0e0ff', fontSize: 13 }}>Round {roundNum}</div>
              <div style={{ color: '#a0c0ff', fontSize: 13 }}>AI cards: <strong style={{ color: '#ff8080' }}>{aiDeck.length}</strong></div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, minHeight: 120, margin: '16px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#a0c0ff', fontSize: 11, marginBottom: 6, letterSpacing: 1 }}>YOU</div>
              {playerCard ? <Card card={playerCard} /> : <div style={{ width: 72, height: 100, borderRadius: 8, border: '2px dashed #444', opacity: 0.4 }} />}
            </div>
            <div style={{ color: '#ffd700', fontSize: 24, fontWeight: 700 }}>VS</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#ff8080', fontSize: 11, marginBottom: 6, letterSpacing: 1 }}>AI</div>
              {aiCard ? <Card card={aiCard} /> : <div style={{ width: 72, height: 100, borderRadius: 8, border: '2px dashed #444', opacity: 0.4 }} />}
            </div>
          </div>

          {warPile.length > 0 && (
            <div style={{ textAlign: 'center', color: '#ff6b35', fontWeight: 700, marginBottom: 8 }}>
              WAR — {warPile.length} cards at stake!
            </div>
          )}

          {message && (
            <div style={{ textAlign: 'center', color: '#ffd700', fontSize: 14, margin: '8px 0 14px', minHeight: 20 }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            {phase === 'idle' || phase === 'done' ? (
              <button onClick={startGame} style={btnStyle('#0f9960')}>{phase === 'done' ? 'Play Again' : 'Start Game'}</button>
            ) : (
              <button onClick={flip} style={btnStyle('#1d6fa4')}>Flip Card</button>
            )}
          </div>
        </div>
      }
      right={mathPanel}
    />
  )
}

// ═══════════════════════════════════════════════
//  GAME: GO FISH
// ═══════════════════════════════════════════════
const GoFishGame = () => {
  const [playerHand, setPlayerHand] = useState([])
  const [aiHand, setAiHand] = useState([])
  const [pond, setPond] = useState([])
  const [playerBooks, setPlayerBooks] = useState([])
  const [aiBooks, setAiBooks] = useState([])
  const [turn, setTurn] = useState('player')
  const [log, setLog] = useState([])
  const [phase, setPhase] = useState('idle')
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)

  const addLog = (msg) => setLog(l => [msg, ...l].slice(0, 8))

  const checkBooks = (hand) => {
    const counts = {}
    for (const c of hand) counts[c.rank] = (counts[c.rank] || 0) + 1
    const books = Object.keys(counts).filter(r => counts[r] === 4)
    const filtered = hand.filter(c => !books.includes(c.rank))
    return { books, filtered }
  }

  const startGame = () => {
    const d = shuffle(makeDeck())
    const ph = d.slice(0, 7), ah = d.slice(7, 14), p = d.slice(14)
    const { books: pb, filtered: pf } = checkBooks(ph)
    const { books: ab, filtered: af } = checkBooks(ah)
    setPlayerHand(pf); setAiHand(af); setPond(p)
    setPlayerBooks(pb); setAiBooks(ab); setTurn('player')
    setLog(['Game started! Select a rank and ask the AI.']); setPhase('playing')
    setSelected(null); setBusy(false)
  }

  const askAI = async () => {
    if (!selected || turn !== 'player' || busy) return
    setBusy(true)
    const aiHasCard = aiHand.filter(c => c.rank === selected)
    let ph = [...playerHand], ah = [...aiHand], p = [...pond]

    if (aiHasCard.length > 0) {
      ph = [...ph, ...aiHasCard]; ah = ah.filter(c => c.rank !== selected)
      addLog(`AI had ${aiHasCard.length}x ${selected}! You got them.`)
    } else {
      if (p.length > 0) {
        const [drawn, ...rest] = p; ph = [...ph, drawn]; p = rest
        addLog(`Go Fish! You drew ${drawn.rank}${drawn.suit}.`)
      } else addLog('Go Fish! Pond is empty.')
    }

    const { books: pb, filtered: pf } = checkBooks(ph)
    const newPBooks = [...playerBooks, ...pb]
    setPlayerBooks(newPBooks); setPlayerHand(pf); setAiHand(ah); setPond(p); setSelected(null)

    if (pf.length === 0 && ah.length === 0) {
      setPhase('done')
      addLog(`Game over! You: ${newPBooks.length} books, AI: ${aiBooks.length} books.`)
      setBusy(false); return
    }

    setTurn('ai'); setBusy(false)
    await sleep(800)
    if (ah.length === 0) { setTurn('player'); return }
    const aiTarget = ah[Math.floor(Math.random() * ah.length)].rank
    const playerHas = pf.filter(c => c.rank === aiTarget)
    let newPh = [...pf], newAh = [...ah]

    if (playerHas.length > 0) {
      newAh = [...newAh, ...playerHas]; newPh = newPh.filter(c => c.rank !== aiTarget)
      addLog(`AI asks for ${aiTarget} — you had ${playerHas.length}! AI took them.`)
    } else {
      if (p.length > 0) {
        const [drawn, ...rest] = p; newAh = [...newAh, drawn]; setPond(rest)
        addLog(`AI asks for ${aiTarget} — Go Fish! AI drew.`)
      } else addLog(`AI asks for ${aiTarget} — Go Fish! Pond empty.`)
    }

    const { books: ab, filtered: af } = checkBooks(newAh)
    setAiBooks(prev => [...prev, ...ab]); setPlayerHand(newPh); setAiHand(af); setTurn('player')
  }

  // Rank counts: how many of each rank are in the pond (unknown)
  const pondRankProbs = () => {
    if (!selected) return {}
    // P(AI has ≥1 of rank) based on known info
    const inMyHand = playerHand.filter(c => c.rank === selected).length
    const inBooks = (playerBooks.includes(selected) ? 4 : 0) + (aiBooks.includes(selected) ? 4 : 0)
    const knownOut = inMyHand + inBooks
    const remaining = Math.max(4 - knownOut, 0)
    const unknownCards = aiHand.length + pond.length
    // Hypergeometric: P(AI has ≥1) = 1 - C(unknownCards-remaining, aiHand.length)/C(unknownCards, aiHand.length)
    // Approximate with binomial
    const pNone = unknownCards > 0 ? Math.pow(1 - remaining / unknownCards, aiHand.length) : 1
    return { remaining, pAtLeastOne: Math.round((1 - pNone) * 100) }
  }

  const rankInfo = pondRankProbs()

  // Count each rank in player hand for display
  const playerRankCounts = {}
  for (const c of playerHand) playerRankCounts[c.rank] = (playerRankCounts[c.rank] || 0) + 1

  const mathPanel = (
    <>
      <MPSection title="AI Has Your Rank?">
        {selected ? (
          <>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 13, color: '#aaa', marginBottom: 6 }}>P(AI has at least 1 <strong style={{ color: '#ffd700' }}>{selected}</strong>)</div>
              <BigNum
                value={`${rankInfo.pAtLeastOne ?? 0}%`}
                label="probability"
                color={rankInfo.pAtLeastOne > 50 ? '#4dff91' : '#ff4455'}
              />
            </div>
            <Formula text={`${4 - (playerHand.filter(c=>c.rank===selected).length)} cards of ${selected} not in your hand\nDistributed among AI (${aiHand.length} cards) + pond`} />
          </>
        ) : (
          <div style={{ fontSize: 11, color: '#555', textAlign: 'center' }}>
            Select a rank from your hand to see AI probability
          </div>
        )}
      </MPSection>

      <MPSection title="Your Hand Analysis">
        {Object.entries(playerRankCounts).sort((a,b) => b[1]-a[1]).map(([rank, cnt]) => {
          const total4 = 4
          const color = cnt >= 3 ? '#4dff91' : cnt === 2 ? '#ffe040' : '#a0c0ff'
          return (
            <HBar key={rank} label={`${rank}s`} value={cnt} max={total4} color={color} subtitle={`${cnt}/4`} />
          )
        })}
      </MPSection>

      <MPSection title="Pond & Books">
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#4dd0ff', fontFamily: 'monospace' }}>{pond.length}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>Pond cards</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#4dff91', fontFamily: 'monospace' }}>{playerBooks.length}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>Your books</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#ff4455', fontFamily: 'monospace' }}>{aiBooks.length}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>AI books</div>
          </div>
        </div>
      </MPSection>

      <MPSection title="Strategy Tip">
        <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.6 }}>
          Ask for ranks where you already hold 2-3 copies — fewer cards of that rank remain, concentrated in fewer unknown locations, so P(AI has one) is higher.
        </div>
        <Formula text={`P(AI has rank) ∝ remaining_of_rank / unknown_cards`} />
      </MPSection>
    </>
  )

  return (
    <GameLayout
      left={
        <div>
          {phase !== 'idle' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#a0c0ff', fontSize: 13 }}>
              <span>Your books: <strong style={{ color: '#4dff91' }}>{playerBooks.length}</strong> [{playerBooks.join(', ')}]</span>
              <span>AI books: <strong style={{ color: '#ff8080' }}>{aiBooks.length}</strong></span>
            </div>
          )}

          <div style={{ color: '#a0c0ff', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>
            YOUR HAND ({playerHand.length} cards)
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 80, marginBottom: 14 }}>
            {playerHand.map(c => (
              <Card key={c.id} card={c} small selected={selected === c.rank}
                onClick={() => phase === 'playing' && turn === 'player' && setSelected(c.rank)} />
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#a0c0ff', fontSize: 12, marginBottom: 6 }}>POND: {pond.length} cards</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: Math.min(pond.length, 8) }).map((_, i) => (
                <Card key={i} card={{ suit: '♠', rank: 'A' }} faceDown small style={{ opacity: 0.5 + i * 0.05 }} />
              ))}
              {pond.length > 8 && <span style={{ color: '#666', fontSize: 12, alignSelf: 'center' }}>+{pond.length - 8} more</span>}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 10, marginBottom: 12, minHeight: 80 }}>
            {log.map((l, i) => (
              <div key={i} style={{ color: i === 0 ? '#ffd700' : '#666', fontSize: 12, marginBottom: 2 }}>{l}</div>
            ))}
          </div>

          {selected && turn === 'player' && (
            <div style={{ marginBottom: 10, color: '#e0e0ff', fontSize: 13 }}>
              Asking for: <strong style={{ color: '#ffd700' }}>{selected}</strong>
              <button onClick={() => setSelected(null)} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>x</button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            {phase === 'idle' || phase === 'done' ? (
              <button onClick={startGame} style={btnStyle('#0f9960')}>{phase === 'done' ? 'Play Again' : 'Start Game'}</button>
            ) : (
              <button onClick={askAI} disabled={!selected || turn !== 'player' || busy}
                style={btnStyle(selected && turn === 'player' ? '#1d6fa4' : '#333', !selected || turn !== 'player' || busy)}>
                {turn === 'player' ? (selected ? `Ask for ${selected}s` : 'Select a rank') : 'AI thinking...'}
              </button>
            )}
          </div>
        </div>
      }
      right={mathPanel}
    />
  )
}

// ═══════════════════════════════════════════════
//  GAME: SNAP!
// ═══════════════════════════════════════════════
const SnapGame = () => {
  const [deck, setDeck] = useState([])
  const [pile, setPile] = useState([])
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [phase, setPhase] = useState('idle')
  const [message, setMessage] = useState('')
  const [canSnap, setCanSnap] = useState(false)
  const [reactionTimes, setReactionTimes] = useState([])
  const snapTime = useRef(null)
  const aiTimer = useRef(null)
  const canSnapRef = useRef(false)

  const setCanSnapSynced = (val) => {
    canSnapRef.current = val
    setCanSnap(val)
  }

  const start = () => {
    setDeck(shuffle(makeDeck())); setPile([])
    setPlayerScore(0); setAiScore(0); setPhase('playing')
    setMessage("Click 'Flip' to reveal cards!")
    setCanSnapSynced(false); setReactionTimes([])
  }

  const flip = () => {
    if (phase !== 'playing' || deck.length === 0) return
    const [card, ...rest] = deck
    const newPile = [...pile, card]
    setPile(newPile); setDeck(rest)

    const isSnap = newPile.length >= 2 && newPile[newPile.length - 1].rank === newPile[newPile.length - 2].rank
    if (isSnap) {
      setCanSnapSynced(true)
      snapTime.current = Date.now()
      setMessage('SNAP! Quick, click SNAP!')
      const aiDelay = 800 + Math.random() * 1200
      aiTimer.current = setTimeout(() => {
        if (canSnapRef.current) {
          setAiScore(s => s + 1)
          setMessage('AI snapped first!')
          setCanSnapSynced(false)
        }
      }, aiDelay)
    } else {
      setMessage(deck.length === 0 ? 'Deck empty! Game over.' : `Flipped: ${card.rank}${card.suit}`)
      if (deck.length === 0) setPhase('done')
    }
  }

  const snap = () => {
    if (!canSnapRef.current) {
      setPlayerScore(s => Math.max(0, s - 1))
      setMessage('False snap! -1 point'); return
    }
    if (aiTimer.current) clearTimeout(aiTimer.current)
    const rt = Date.now() - snapTime.current
    setReactionTimes(r => [...r, rt])
    setPlayerScore(s => s + 1)
    setCanSnapSynced(false)
    setMessage(`You snapped in ${rt}ms! +1`)
  }

  const top = pile[pile.length - 1]
  const second = pile[pile.length - 2]

  const avgRT = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : null
  const bestRT = reactionTimes.length > 0 ? Math.min(...reactionTimes) : null
  const maxRT = reactionTimes.length > 0 ? Math.max(...reactionTimes) : null

  // Snap probability: given rank distribution
  const deckSize = deck.length
  const topRank = top?.rank
  const topCount = topRank ? deck.filter(c => c.rank === topRank).length : 0
  const pNextSnap = deckSize > 0 && topRank ? Math.round((topCount / deckSize) * 100) : 0

  const mathPanel = (
    <>
      <MPSection title="Snap Probability">
        <HBar label={`P(next = ${topRank || '?'})`} value={pNextSnap} max={100} color="#ffe040" subtitle={`${pNextSnap}%`} />
        <Formula text={`P(snap) = same_rank_remaining / deck_remaining`} />
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 4, lineHeight: 1.5 }}>
          {topRank
            ? `${topCount} more ${topRank}s in the ${deckSize}-card deck`
            : 'Flip a card to see snap probability'}
        </div>
      </MPSection>

      <MPSection title="Reaction Time Chart">
        {reactionTimes.length > 0 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {reactionTimes.slice(-8).map((rt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 16, fontSize: 10, color: '#555', textAlign: 'right' }}>{i + Math.max(0, reactionTimes.length - 8) + 1}</div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 10, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min((rt / 2000) * 100, 100)}%`,
                      height: '100%',
                      background: rt < 250 ? '#4dff91' : rt < 500 ? '#ffe040' : '#ff4455',
                      borderRadius: 3,
                    }} />
                  </div>
                  <div style={{ width: 36, fontSize: 10, color: '#aaa', fontFamily: 'monospace' }}>{rt}ms</div>
                </div>
              ))}
            </div>
            {avgRT && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: 6 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#4dff91', fontFamily: 'monospace' }}>{bestRT}ms</div>
                  <div style={{ fontSize: 10, color: '#aaa' }}>Best</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: 6 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#ffe040', fontFamily: 'monospace' }}>{avgRT}ms</div>
                  <div style={{ fontSize: 10, color: '#aaa' }}>Average</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 11, color: '#555', textAlign: 'center' }}>
            No snaps yet — flip cards to play
          </div>
        )}
      </MPSection>

      <MPSection title="Human Benchmarks">
        <HBar label="Elite athlete" value={190} max={500} color="#4dff91" subtitle="~190ms" />
        <HBar label="Average human" value={250} max={500} color="#ffe040" subtitle="~250ms" />
        {avgRT && <HBar label="Your average" value={avgRT} max={500} color="#cc44ff" subtitle={`${avgRT}ms`} />}
        <div style={{ fontSize: 10, color: '#555', marginTop: 4, lineHeight: 1.5 }}>
          Visual stimulus → neural processing → motor response. ~100ms visual cortex, ~50ms motor cortex, ~100ms nerve-to-muscle.
        </div>
      </MPSection>

      <MPSection title="Score">
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, textAlign: 'center', background: '#4dff9122', borderRadius: 8, padding: 8, border: '1px solid #4dff9144' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#4dff91', fontFamily: 'monospace' }}>{playerScore}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>You</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: '#ff445522', borderRadius: 8, padding: 8, border: '1px solid #ff455544' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#ff4455', fontFamily: 'monospace' }}>{aiScore}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>AI</div>
          </div>
        </div>
      </MPSection>
    </>
  )

  return (
    <GameLayout
      left={
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ color: '#4dff91', fontSize: 16, fontWeight: 700 }}>You: {playerScore}</div>
            <div style={{ color: '#a0c0ff', fontSize: 13 }}>Deck: {deck.length}</div>
            <div style={{ color: '#ff8080', fontSize: 16, fontWeight: 700 }}>AI: {aiScore}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '16px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#666', fontSize: 11, marginBottom: 6 }}>PREVIOUS</div>
              {second ? <Card card={second} /> : <div style={{ width: 72, height: 100, borderRadius: 8, border: '2px dashed #333' }} />}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#a0c0ff', fontSize: 11, marginBottom: 6 }}>CURRENT</div>
              {top ? <Card card={top} /> : <div style={{ width: 72, height: 100, borderRadius: 8, border: '2px dashed #333' }} />}
            </div>
          </div>

          {message && (
            <div style={{
              textAlign: 'center', padding: '10px 16px', borderRadius: 10,
              background: canSnap ? 'rgba(255,200,0,0.15)' : 'rgba(255,255,255,0.05)',
              border: canSnap ? '1px solid #ffd700' : '1px solid transparent',
              color: canSnap ? '#ffd700' : '#a0c0ff', fontSize: 14, marginBottom: 14,
            }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            {phase === 'idle' || phase === 'done' ? (
              <button onClick={start} style={btnStyle('#0f9960')}>{phase === 'done' ? 'Play Again' : 'Start Snap!'}</button>
            ) : (
              <>
                <button onClick={flip} style={btnStyle('#1d6fa4')}>Flip Card</button>
                <button onClick={snap} style={btnStyle(canSnap ? '#ff6b35' : '#444')}>SNAP!</button>
              </>
            )}
          </div>
        </div>
      }
      right={mathPanel}
    />
  )
}

// ═══════════════════════════════════════════════
//  GAME: CRIBBAGE
// ═══════════════════════════════════════════════

// Card value for cribbage (A=1, 2-9=face, 10/J/Q/K=10)
const cribbageValue = (rank) => {
  if (rank === 'A') return 1
  if (['J','Q','K'].includes(rank)) return 10
  return parseInt(rank, 10) || 10
}

// Rank order for run detection (A=1 low only)
const cribbageRankOrder = (rank) => RANK_VALUES[rank] // A=1..K=13

// Get all combinations of size k from array
const getCombinations = (arr, k) => {
  if (k === 0) return [[]]
  if (arr.length < k) return []
  const [first, ...rest] = arr
  const withFirst = getCombinations(rest, k - 1).map(combo => [first, ...combo])
  const withoutFirst = getCombinations(rest, k)
  return [...withFirst, ...withoutFirst]
}

// Score a cribbage hand (4 cards + starter). isCrib affects flush rules.
const scoreCribbageHand = (hand, starter, isCrib = false) => {
  const allCards = starter ? [...hand, starter] : [...hand]
  const breakdown = []
  let total = 0

  // --- 15s ---
  for (let size = 2; size <= allCards.length; size++) {
    for (const combo of getCombinations(allCards, size)) {
      const sum = combo.reduce((s, c) => s + cribbageValue(c.rank), 0)
      if (sum === 15) {
        breakdown.push({ name: '15', points: 2, cards: combo.map(c => c.id) })
        total += 2
      }
    }
  }

  // --- Pairs ---
  for (const combo of getCombinations(allCards, 2)) {
    if (combo[0].rank === combo[1].rank) {
      breakdown.push({ name: `Pair (${combo[0].rank}s)`, points: 2, cards: combo.map(c => c.id) })
      total += 2
    }
  }

  // --- Runs: find maximum non-overlapping runs ---
  // Check for runs of length 5 down to 3
  const foundRunCards = new Set()
  for (let runLen = allCards.length; runLen >= 3; runLen--) {
    for (const combo of getCombinations(allCards, runLen)) {
      const sorted = [...combo].sort((a, b) => cribbageRankOrder(a.rank) - cribbageRankOrder(b.rank))
      const vals = sorted.map(c => cribbageRankOrder(c.rank))
      // Check all unique
      const unique = new Set(vals)
      if (unique.size !== vals.length) continue
      // Check consecutive
      let isRun = true
      for (let i = 1; i < vals.length; i++) {
        if (vals[i] !== vals[i - 1] + 1) { isRun = false; break }
      }
      if (isRun) {
        // Only count if no card in this combo was already part of a longer run
        const ids = combo.map(c => c.id)
        const alreadyCounted = ids.some(id => foundRunCards.has(id))
        if (!alreadyCounted) {
          for (const id of ids) foundRunCards.add(id)
          breakdown.push({ name: `Run of ${runLen}`, points: runLen, cards: ids })
          total += runLen
        }
      }
    }
  }

  // --- Flush ---
  if (starter) {
    const handSuits = hand.map(c => c.suit)
    const allSameSuit = handSuits.every(s => s === handSuits[0])
    if (allSameSuit) {
      if (!isCrib) {
        // 4-card flush (hand only) or 5-card flush
        if (starter.suit === handSuits[0]) {
          breakdown.push({ name: 'Flush (5)', points: 5, cards: allCards.map(c => c.id) })
          total += 5
        } else {
          breakdown.push({ name: 'Flush (4)', points: 4, cards: hand.map(c => c.id) })
          total += 4
        }
      } else {
        // Crib: only 5-card flush counts
        if (starter.suit === handSuits[0]) {
          breakdown.push({ name: 'Flush (5)', points: 5, cards: allCards.map(c => c.id) })
          total += 5
        }
      }
    }
  } else {
    // No starter (discard preview): just check 4-card flush
    if (!isCrib) {
      const handSuits = hand.map(c => c.suit)
      if (hand.length >= 4 && handSuits.every(s => s === handSuits[0])) {
        breakdown.push({ name: 'Flush (4)', points: 4, cards: hand.map(c => c.id) })
        total += 4
      }
    }
  }

  // --- Nobs (Jack matching starter suit) ---
  if (starter) {
    const nobs = hand.find(c => c.rank === 'J' && c.suit === starter.suit)
    if (nobs) {
      breakdown.push({ name: 'Nobs (J matches starter)', points: 1, cards: [nobs.id] })
      total += 1
    }
  }

  return { total, breakdown }
}

// CribbageBoard SVG
const CribbageBoard = ({ humanScore, aiScore }) => {
  const HOLES = 121
  const TRACK_W = 480
  const TRACK_H = 20
  const HOLE_R = 3.5
  const GROUP_GAP = 6
  const HOLES_PER_GROUP = 5
  const GROUPS = Math.ceil(HOLES / HOLES_PER_GROUP) // 25 groups (holes 0..120)

  // Calculate x position for hole index 0..120
  const holeX = (idx) => {
    const group = Math.floor(idx / HOLES_PER_GROUP)
    const pos = idx % HOLES_PER_GROUP
    const usableW = TRACK_W - (GROUPS - 1) * GROUP_GAP
    const holeSpacing = usableW / (HOLES - 1 + (GROUPS - 1) * (GROUP_GAP / ((TRACK_W - GROUP_GAP * (GROUPS - 1)) / (HOLES - 1))))
    // Simpler: distribute evenly with slight gap every 5
    const totalSlots = HOLES + (GROUPS - 1) * 0.8
    const slotW = TRACK_W / totalSlots
    return group * (HOLES_PER_GROUP * slotW + GROUP_GAP * 0.3) + pos * slotW + slotW / 2
  }

  // Simpler uniform distribution
  const hx = (idx) => {
    if (idx <= 0) return 10
    if (idx >= 120) return TRACK_W - 10
    const group = Math.floor(idx / HOLES_PER_GROUP)
    const pos = idx % HOLES_PER_GROUP
    const cellW = (TRACK_W - 20) / (HOLES - 1)
    return 10 + idx * cellW + group * 1.5
  }

  const SVG_W = TRACK_W + 20
  const SVG_H = 110

  const PEG_Y_FRONT = 30
  const PEG_Y_BACK = 50
  const AI_Y_FRONT = 75
  const AI_Y_BACK = 93

  return (
    <div style={{ margin: '12px 0', overflowX: 'auto' }}>
      <svg width={SVG_W} height={SVG_H} style={{ display: 'block' }}>
        {/* Track labels */}
        <text x={10} y={20} fill="#4dff91" fontSize={10} fontFamily="monospace">YOU</text>
        <text x={10} y={68} fill="#ff4455" fontSize={10} fontFamily="monospace">AI</text>

        {/* Holes - human track */}
        {Array.from({ length: HOLES }).map((_, i) => (
          <circle
            key={`h${i}`}
            cx={hx(i) + 10}
            cy={PEG_Y_FRONT}
            r={HOLE_R}
            fill={i <= humanScore ? '#1a3d1a' : '#1a2a1a'}
            stroke={i % 5 === 0 ? '#2a5a2a' : '#1a3a1a'}
            strokeWidth={0.8}
          />
        ))}
        {/* Holes - AI track */}
        {Array.from({ length: HOLES }).map((_, i) => (
          <circle
            key={`a${i}`}
            cx={hx(i) + 10}
            cy={AI_Y_FRONT}
            r={HOLE_R}
            fill={i <= aiScore ? '#3d1a1a' : '#2a1a1a'}
            stroke={i % 5 === 0 ? '#5a2a2a' : '#3a1a1a'}
            strokeWidth={0.8}
          />
        ))}

        {/* Milestone markers every 10 */}
        {[10,20,30,40,50,60,70,80,90,100,110,120].map(m => (
          <g key={m}>
            <line x1={hx(m)+10} y1={22} x2={hx(m)+10} y2={62} stroke="#333" strokeWidth={0.5} />
            <text x={hx(m)+10} y={61} fill="#555" fontSize={8} fontFamily="monospace" textAnchor="middle">{m}</text>
          </g>
        ))}

        {/* Human front peg */}
        {humanScore > 0 && (
          <circle cx={hx(Math.min(humanScore, 120))+10} cy={PEG_Y_FRONT} r={5.5} fill="#4dff91" stroke="#fff" strokeWidth={1.5} />
        )}
        {/* Human back peg (previous position) */}
        {humanScore > 0 && (
          <circle cx={hx(Math.max(0, humanScore - 1))+10} cy={PEG_Y_BACK - 8} r={3.5} fill="#26a050" stroke="#4dff91" strokeWidth={1} opacity={0.7} />
        )}

        {/* AI front peg */}
        {aiScore > 0 && (
          <circle cx={hx(Math.min(aiScore, 120))+10} cy={AI_Y_FRONT} r={5.5} fill="#ff4455" stroke="#fff" strokeWidth={1.5} />
        )}
        {/* AI back peg */}
        {aiScore > 0 && (
          <circle cx={hx(Math.max(0, aiScore - 1))+10} cy={AI_Y_FRONT + 12} r={3.5} fill="#a02626" stroke="#ff4455" strokeWidth={1} opacity={0.7} />
        )}

        {/* Score labels */}
        <text x={SVG_W - 6} y={PEG_Y_FRONT + 4} fill="#4dff91" fontSize={11} fontFamily="monospace" fontWeight="bold" textAnchor="end">{humanScore}</text>
        <text x={SVG_W - 6} y={AI_Y_FRONT + 4} fill="#ff4455" fontSize={11} fontFamily="monospace" fontWeight="bold" textAnchor="end">{aiScore}</text>
      </svg>
    </div>
  )
}

// Tutorial tips per phase
const CRIB_TIPS = {
  intro: null,
  deal: "Each player gets 6 cards. You'll keep 4 and send 2 to the 'crib' — the bonus hand.",
  discard: "Pick exactly 2 cards to discard to the crib. The crib belongs to the dealer — it scores for them at the end. Keep cards that make 15s and pairs.",
  cut: "The starter card applies to everyone's hand. A Jack starter scores 2 pts for the dealer ('His Heels').",
  peg: "Take turns playing cards. The running total resets after 31. Score 2 pts for hitting 15 or 31 exactly, 1 pt for 'Go' (opponent can't play).",
  count: "Count your hand + the starter card. Every combo summing to 15 = 2 pts. Pairs = 2 pts. Runs = 1 pt per card.",
  gameover: null,
}

const CribbageGame = () => {
  const [phase, setPhase] = useState('intro')
  const [tutorialOn, setTutorialOn] = useState(true)
  const [humanScore, setHumanScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [humanHand, setHumanHand] = useState([])
  const [aiHand, setAiHand] = useState([])
  const [humanCrib, setHumanCrib] = useState([]) // cards human discarded
  const [aiCrib, setAiCrib] = useState([])       // cards AI discarded
  const [crib, setCrib] = useState([])            // combined crib
  const [starter, setStarter] = useState(null)
  const [dealer, setDealer] = useState('ai') // 'ai' | 'human'
  const [humanDiscards, setHumanDiscards] = useState([]) // selected indices
  const [pegState, setPegState] = useState({
    humanPlayed: [], aiPlayed: [], runningTotal: 0,
    turn: 'human', goCount: 0, lastPlayer: null,
  })
  const [scorePopup, setScorePopup] = useState(null)
  const [countPhase, setCountPhase] = useState(null) // 'human_hand' | 'ai_hand' | 'crib'
  const [countResult, setCountResult] = useState(null)
  const [log, setLog] = useState([])
  const [handNum, setHandNum] = useState(1)

  const addLog = (msg) => setLog(l => [msg, ...l].slice(0, 10))

  // ── SCORING HELPER ──
  const addPoints = (who, pts, reason) => {
    if (pts <= 0) return
    if (who === 'human') setHumanScore(s => Math.min(121, s + pts))
    else setAiScore(s => Math.min(121, s + pts))
    addLog(`${who === 'human' ? 'You' : 'AI'} score ${pts} for ${reason}`)
  }

  // ── DEAL ──
  const dealCards = () => {
    const d = shuffle(makeDeck())
    setHumanHand(d.slice(0, 6))
    setAiHand(d.slice(6, 12))
    setStarter(null)
    setCrib([])
    setHumanDiscards([])
    setHumanCrib([])
    setAiCrib([])
    setPegState({ humanPlayed: [], aiPlayed: [], runningTotal: 0, turn: dealer === 'human' ? 'human' : 'human', goCount: 0, lastPlayer: null })
    setScorePopup(null)
    setCountResult(null)
    setCountPhase(null)
    setLog([])
    setPhase('discard')
  }

  // ── AI DISCARD STRATEGY: keep the 4-card combo with highest score ──
  const aiChooseDiscards = (hand) => {
    let best = -1, bestKeep = null
    for (const keep of getCombinations(hand, 4)) {
      const { total } = scoreCribbageHand(keep, null, false)
      if (total > best) { best = total; bestKeep = keep }
    }
    const keepIds = new Set(bestKeep.map(c => c.id))
    const discarded = hand.filter(c => !keepIds.has(c.id))
    return { kept: bestKeep, discarded }
  }

  // ── HANDLE HUMAN DISCARD TOGGLE ──
  const toggleDiscard = (idx) => {
    if (humanDiscards.includes(idx)) {
      setHumanDiscards(humanDiscards.filter(i => i !== idx))
    } else if (humanDiscards.length < 2) {
      setHumanDiscards([...humanDiscards, idx])
    }
  }

  // ── CONFIRM DISCARD ──
  const confirmDiscard = () => {
    if (humanDiscards.length !== 2) return
    const discardedCards = humanDiscards.map(i => humanHand[i])
    const keptCards = humanHand.filter((_, i) => !humanDiscards.includes(i))
    const { kept: aiKept, discarded: aiDiscarded } = aiChooseDiscards(aiHand)
    setHumanCrib(discardedCards)
    setAiCrib(aiDiscarded)
    setCrib([...discardedCards, ...aiDiscarded])
    setHumanHand(keptCards)
    setAiHand(aiKept)
    setPhase('cut')
  }

  // ── CUT STARTER ──
  const cutStarter = () => {
    const usedIds = new Set([
      ...humanHand.map(c => c.id),
      ...aiHand.map(c => c.id),
      ...crib.map(c => c.id),
    ])
    const remaining = makeDeck().filter(c => !usedIds.has(c.id))
    const s = remaining[Math.floor(Math.random() * remaining.length)]
    setStarter(s)
    addLog(`Starter: ${s.rank}${s.suit}`)
    // His Heels
    if (s.rank === 'J') {
      addPoints(dealer, 2, "His Heels (Jack starter)")
      setScorePopup({ msg: "His Heels! 2 pts for dealer", color: '#ffe040' })
      setTimeout(() => setScorePopup(null), 2000)
    }
    // Pegging turn: non-dealer goes first
    setPegState(ps => ({ ...ps, turn: dealer === 'human' ? 'ai' : 'human' }))
    setPhase('peg')
  }

  // ── PEGGING HELPERS ──
  const pegCardValue = (card) => cribbageValue(card.rank)

  const scorePegPlay = (played, newCard, runningTotal, playerId) => {
    const points = []
    const newTotal = runningTotal + pegCardValue(newCard)

    if (newTotal === 15) points.push({ pts: 2, label: '15 for 2!' })
    if (newTotal === 31) points.push({ pts: 2, label: '31 for 2!' })

    // Pairs / triples / quads on last N cards of same rank
    const lastSameRank = []
    for (let i = played.length - 1; i >= 0; i--) {
      if (played[i].card.rank === newCard.rank) lastSameRank.push(played[i])
      else break
    }
    if (lastSameRank.length === 1) points.push({ pts: 2, label: 'Pair!' })
    else if (lastSameRank.length === 2) points.push({ pts: 6, label: 'Three of a kind!' })
    else if (lastSameRank.length === 3) points.push({ pts: 12, label: 'Four of a kind!' })

    // Runs: check if last N cards form a run (any order)
    const sequence = [...played.map(p => p.card), newCard]
    for (let len = Math.min(sequence.length, 7); len >= 3; len--) {
      const seg = sequence.slice(-len)
      const vals = seg.map(c => cribbageRankOrder(c.rank)).sort((a, b) => a - b)
      const unique = new Set(vals)
      if (unique.size === vals.length) {
        let isRun = true
        for (let i = 1; i < vals.length; i++) {
          if (vals[i] !== vals[i - 1] + 1) { isRun = false; break }
        }
        if (isRun) {
          points.push({ pts: len, label: `Run of ${len}!` })
          break
        }
      }
    }

    return points
  }

  // ── PLAY PEG CARD ──
  const playPegCard = (card) => {
    if (pegState.turn !== 'human' || phase !== 'peg') return
    if (pegState.runningTotal + pegCardValue(card) > 31) return

    const newTotal = pegState.runningTotal + pegCardValue(card)
    const newPlayed = [...pegState.humanPlayed, card]
    const newFullPlayed = [
      ...pegState.humanPlayed.map(c => ({ card: c, player: 'human' })),
      ...pegState.aiPlayed.map(c => ({ card: c, player: 'ai' })),
      { card, player: 'human' }
    ].sort((a, b) => 0) // keep insertion order — use a sequence array instead

    // Use a shared play sequence
    const playSeq = (pegState.playSequence || [])
    const newSeq = [...playSeq, { card, player: 'human' }]

    const scorePts = scorePegPlay(playSeq, card, pegState.runningTotal, 'human')
    let gained = 0
    scorePts.forEach(({ pts, label }) => {
      addPoints('human', pts, label)
      gained += pts
    })
    if (gained > 0) {
      setScorePopup({ msg: scorePts.map(s => s.label).join(' + '), color: '#4dff91' })
      setTimeout(() => setScorePopup(null), 1500)
    }

    const newHumanHand = humanHand.filter(c => c.id !== card.id)
    setHumanHand(newHumanHand)

    const reset = newTotal === 31
    setPegState(ps => ({
      ...ps,
      humanPlayed: newPlayed,
      playSequence: reset ? [] : newSeq,
      runningTotal: reset ? 0 : newTotal,
      turn: 'ai',
      lastPlayer: 'human',
      goCount: reset ? 0 : ps.goCount,
    }))
    addLog(`You played ${card.rank}${card.suit} — total: ${reset ? 31 : newTotal}${reset ? ' (reset)' : ''}`)

    if (reset) {
      addPoints('human', 2, '31!')
      // slight pause then AI turn
      setTimeout(() => setPegState(ps => ({ ...ps, turn: 'ai' })), 600)
    }
  }

  // ── AI PEG TURN ──
  useEffect(() => {
    if (phase !== 'peg' || pegState.turn !== 'ai') return
    const timeout = setTimeout(() => {
      const playable = aiHand.filter(c => pegState.runningTotal + pegCardValue(c) <= 31)
      if (playable.length === 0) {
        // AI says Go
        addLog('AI says Go!')
        const newGoCount = pegState.goCount + 1
        // If both have said Go, score and reset
        if (newGoCount >= 2 || humanHand.every(c => pegState.runningTotal + pegCardValue(c) > 31)) {
          addPoints('human', 1, 'Go!')
          setScorePopup({ msg: 'Go! +1', color: '#4dff91' })
          setTimeout(() => setScorePopup(null), 1500)
          setPegState(ps => ({
            ...ps, runningTotal: 0, goCount: 0, turn: 'human',
            playSequence: [],
          }))
        } else {
          setPegState(ps => ({ ...ps, goCount: newGoCount, turn: 'human' }))
        }
        return
      }

      // AI picks best scoring card
      let best = null, bestPts = -1
      const seqSoFar = pegState.playSequence || []
      for (const c of playable) {
        const pts = scorePegPlay(seqSoFar, c, pegState.runningTotal, 'ai')
          .reduce((s, p) => s + p.pts, 0)
        if (pts > bestPts) { bestPts = pts; best = c }
      }
      // If no scoring play, prefer mid-range cards
      if (bestPts === 0) {
        const midCards = playable.filter(c => {
          const v = pegCardValue(c)
          return v >= 4 && v <= 7
        })
        best = midCards.length > 0
          ? midCards[Math.floor(Math.random() * midCards.length)]
          : playable.sort((a, b) => pegCardValue(a) - pegCardValue(b))[0]
      }

      const newTotal = pegState.runningTotal + pegCardValue(best)
      const newSeq = [...seqSoFar, { card: best, player: 'ai' }]
      const scorePts = scorePegPlay(seqSoFar, best, pegState.runningTotal, 'ai')
      let gained = 0
      scorePts.forEach(({ pts, label }) => {
        addPoints('ai', pts, label)
        gained += pts
      })
      if (gained > 0) {
        setScorePopup({ msg: `AI: ${scorePts.map(s => s.label).join(' + ')}`, color: '#ff4455' })
        setTimeout(() => setScorePopup(null), 1500)
      }

      const reset = newTotal === 31
      const newAiHand = aiHand.filter(c => c.id !== best.id)
      setAiHand(newAiHand)
      setPegState(ps => ({
        ...ps,
        aiPlayed: [...ps.aiPlayed, best],
        playSequence: reset ? [] : newSeq,
        runningTotal: reset ? 0 : newTotal,
        turn: 'human',
        lastPlayer: 'ai',
        goCount: reset ? 0 : ps.goCount,
      }))
      addLog(`AI played ${best.rank}${best.suit} — total: ${reset ? 31 : newTotal}${reset ? ' (reset)' : ''}`)
      if (reset) addPoints('ai', 2, '31!')
    }, 900)
    return () => clearTimeout(timeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, pegState.turn, pegState.runningTotal])

  // ── CHECK IF PEGGING IS DONE ──
  useEffect(() => {
    if (phase !== 'peg') return
    if (humanHand.length === 0 && aiHand.length === 0) {
      // Last card gets 1 pt
      if (pegState.lastPlayer) {
        addPoints(pegState.lastPlayer, 1, 'Last card')
      }
      setTimeout(() => {
        setCountPhase('human_hand')
        setPhase('count')
      }, 800)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [humanHand.length, aiHand.length, phase])

  // ── CHECK WIN ──
  useEffect(() => {
    if (humanScore >= 121) { setPhase('gameover') }
    else if (aiScore >= 121) { setPhase('gameover') }
  }, [humanScore, aiScore])

  // ── HUMAN CAN'T PLAY ──
  const humanCanPlay = humanHand.some(c => pegState.runningTotal + pegCardValue(c) <= 31)

  const humanSayGo = () => {
    if (phase !== 'peg' || pegState.turn !== 'human') return
    addLog('You say Go!')
    const newGoCount = pegState.goCount + 1
    const aiCanPlay = aiHand.some(c => pegState.runningTotal + pegCardValue(c) <= 31)
    if (!aiCanPlay) {
      addPoints('ai', 1, 'Go!')
      setScorePopup({ msg: 'AI gets Go! +1', color: '#ff4455' })
      setTimeout(() => setScorePopup(null), 1500)
      setPegState(ps => ({ ...ps, runningTotal: 0, goCount: 0, turn: 'human', playSequence: [] }))
    } else {
      setPegState(ps => ({ ...ps, goCount: newGoCount, turn: 'ai' }))
    }
  }

  // ── COUNTING PHASE ──
  const countNext = () => {
    if (countPhase === 'human_hand') {
      const result = scoreCribbageHand(humanHand.length > 0 ? humanHand : pegState.humanPlayed, starter, false)
      setCountResult({ who: 'Your hand', result, cards: humanHand.length > 0 ? humanHand : pegState.humanPlayed })
      addPoints('human', result.total, 'hand count')
    } else if (countPhase === 'ai_hand') {
      const result = scoreCribbageHand(aiHand.length > 0 ? aiHand : pegState.aiPlayed, starter, false)
      setCountResult({ who: "AI's hand", result, cards: aiHand.length > 0 ? aiHand : pegState.aiPlayed })
      addPoints('ai', result.total, 'hand count')
    } else if (countPhase === 'crib') {
      const result = scoreCribbageHand(crib, starter, true)
      setCountResult({ who: `${dealer === 'human' ? 'Your' : "AI's"} crib`, result, cards: crib })
      addPoints(dealer, result.total, 'crib count')
    }
  }

  const advanceCount = () => {
    if (countPhase === 'human_hand') setCountPhase('ai_hand')
    else if (countPhase === 'ai_hand') setCountPhase('crib')
    else {
      // End of hand — next deal
      setDealer(d => d === 'ai' ? 'human' : 'ai')
      setHandNum(n => n + 1)
      setCountPhase(null)
      setCountResult(null)
      setPhase('deal')
    }
    setCountResult(null)
  }

  // ── LIVE HAND SCORE (for discard phase math panel) ──
  const keptCards = humanHand.filter((_, i) => !humanDiscards.includes(i))
  const liveHandScore = phase === 'discard' && keptCards.length === 4
    ? scoreCribbageHand(keptCards, null, false)
    : null

  // ── MATH PANEL ──
  const mathPanel = (
    <>
      <MPSection title="Scores">
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, textAlign: 'center', background: '#4dff9122', borderRadius: 8, padding: 8, border: '1px solid #4dff9144' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#4dff91', fontFamily: 'monospace' }}>{humanScore}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>You</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: '#ff445522', borderRadius: 8, padding: 8, border: '1px solid #ff455544' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#ff4455', fontFamily: 'monospace' }}>{aiScore}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>AI</div>
          </div>
        </div>
        <HBar label="You" value={humanScore} max={121} color="#4dff91" subtitle={`${humanScore}/121`} />
        <HBar label="AI" value={aiScore} max={121} color="#ff4455" subtitle={`${aiScore}/121`} />
        <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>First to 121 wins</div>
      </MPSection>

      {phase === 'discard' && (
        <MPSection title="Your Hand Value">
          {liveHandScore ? (
            <>
              <BigNum value={liveHandScore.total} label="pts (no starter)" color="#ffe040" />
              {liveHandScore.breakdown.map((b, i) => (
                <div key={i} style={{ fontSize: 11, color: '#a0c0ff', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{b.name}</span><span style={{ color: '#4dff91', fontWeight: 700 }}>+{b.points}</span>
                </div>
              ))}
              {liveHandScore.breakdown.length === 0 && <div style={{ fontSize: 11, color: '#555' }}>No score yet</div>}
            </>
          ) : (
            <div style={{ fontSize: 11, color: '#555' }}>
              {2 - humanDiscards.length > 0
                ? `Select ${2 - humanDiscards.length} more card${2 - humanDiscards.length > 1 ? 's' : ''} to discard`
                : 'Select 2 to discard'}
            </div>
          )}
          <Formula text="Keep cards that pair + sum to 15" />
        </MPSection>
      )}

      {phase === 'peg' && (
        <MPSection title="Pegging">
          <BigNum value={pegState.runningTotal} label="Running total" color={pegState.runningTotal === 15 || pegState.runningTotal === 31 ? '#ffe040' : '#fff'} />
          <Formula text="15 = 2 pts | 31 = 2 pts | Go = 1 pt\nPair = 2 | 3-kind = 6 | Run of N = N pts" />
        </MPSection>
      )}

      {phase === 'count' && countResult && (
        <MPSection title={countResult.who}>
          <BigNum value={countResult.result.total} label="points" color="#ffe040" />
          {countResult.result.breakdown.map((b, i) => (
            <div key={i} style={{ fontSize: 11, color: '#a0c0ff', display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>{b.name}</span><span style={{ color: '#4dff91', fontWeight: 700 }}>+{b.points}</span>
            </div>
          ))}
        </MPSection>
      )}

      <MPSection title="Crib Math">
        <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.6 }}>
          <div style={{ color: '#4dd0ff', fontWeight: 700, marginBottom: 4 }}>Dealer: <span style={{ color: '#fff' }}>{dealer === 'human' ? 'You' : 'AI'}</span></div>
          The crib scores extra points for the dealer. Average crib value ~4-5 pts.
        </div>
        <Formula text="Good discard to own crib: 5s, pairs\nBad discard to opponent crib: 5s" />
      </MPSection>

      <MPSection title="Scoring Formula">
        <Formula text={
          "15s: every combo = 2 pts\nPairs: 2 pts / pair\nRuns: 1 pt per card\nFlush: 4 (hand) or 5\nNobs: J matching starter = 1"
        } />
      </MPSection>
    </>
  )

  // ── INTRO ──
  if (phase === 'intro') return (
    <GameLayout
      left={
        <div style={{ maxWidth: 560 }}>
          <div style={{ background: 'rgba(15,153,96,0.08)', border: '1px solid rgba(15,153,96,0.25)', borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f9960', letterSpacing: 2, marginBottom: 10 }}>WHAT IS CRIBBAGE?</div>
            <div style={{ fontSize: 14, color: '#c0d8f0', lineHeight: 1.8 }}>
              Cribbage is one of the oldest card games still widely played — invented in the 17th century by poet Sir John Suckling.
              It combines <strong style={{ color: '#ffe040' }}>combinatorics</strong>, <strong style={{ color: '#4dff91' }}>probability</strong>, and
              strategic card play. Two players race to <strong style={{ color: '#fff' }}>121 points</strong> scored by pegging (playing cards) and
              counting combinations of 15, pairs, and runs.
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Key scoring rules:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {[
              ['15s', '2 pts each — any combo of cards summing to 15'],
              ['Pairs', '2 pts — two cards of the same rank'],
              ['Runs', '1 pt per card — three or more in sequence'],
              ['Flush', '4 pts (hand) or 5 pts (with starter)'],
              ['Nobs', '1 pt — Jack matching the starter suit'],
              ['His Heels', '2 pts — starter is a Jack (for dealer)'],
              ['15 / 31 in pegging', '2 pts when running total hits exactly'],
              ['Go', '1 pt — opponent cannot play without exceeding 31'],
            ].map(([rule, desc]) => (
              <div key={rule} style={{ display: 'flex', gap: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0f9960', width: 100, flexShrink: 0 }}>{rule}</div>
                <div style={{ fontSize: 12, color: '#a0b8d0' }}>{desc}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setTutorialOn(true); setPhase('deal') }} style={btnStyle('#1d6fa4')}>
              Start with Tutorial
            </button>
            <button onClick={() => { setTutorialOn(false); setPhase('deal') }} style={btnStyle('#0f9960')}>
              Play (skip tutorial)
            </button>
          </div>
        </div>
      }
      right={mathPanel}
    />
  )

  // ── DEAL ──
  if (phase === 'deal') return (
    <GameLayout
      left={
        <div style={{ maxWidth: 560 }}>
          {tutorialOn && (
            <div style={{ background: 'rgba(29,111,164,0.15)', border: '1px solid rgba(29,111,164,0.4)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#a0d0ff', lineHeight: 1.6 }}>
              <strong style={{ color: '#4dd0ff' }}>Tutorial:</strong> {CRIB_TIPS.deal}
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Hand {handNum}</div>
            <div style={{ color: '#a0c0ff', fontSize: 13, lineHeight: 1.7 }}>
              Dealer this hand: <strong style={{ color: dealer === 'human' ? '#4dff91' : '#ff8080' }}>{dealer === 'human' ? 'You' : 'AI'}</strong>
              <br />The dealer also owns the crib — extra hand scored at the end.
            </div>
          </div>
          <button onClick={dealCards} style={btnStyle('#0f9960')}>Deal Cards</button>
        </div>
      }
      right={mathPanel}
    />
  )

  // ── DISCARD ──
  if (phase === 'discard') return (
    <GameLayout
      left={
        <div>
          {tutorialOn && (
            <div style={{ background: 'rgba(29,111,164,0.15)', border: '1px solid rgba(29,111,164,0.4)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#a0d0ff', lineHeight: 1.6 }}>
              <strong style={{ color: '#4dd0ff' }}>Tutorial:</strong> {CRIB_TIPS.discard}
            </div>
          )}
          <div style={{ color: '#a0c0ff', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>
            YOUR HAND — click 2 cards to discard to crib
            <span style={{ marginLeft: 10, background: humanDiscards.length === 2 ? '#0f996044' : '#33333388', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: humanDiscards.length === 2 ? '#4dff91' : '#666', border: `1px solid ${humanDiscards.length === 2 ? '#4dff9166' : '#333'}` }}>
              {humanDiscards.length}/2 selected
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {humanHand.map((c, i) => (
              <Card
                key={c.id} card={c} small
                selected={humanDiscards.includes(i)}
                onClick={() => toggleDiscard(i)}
              />
            ))}
          </div>
          <div style={{ color: '#666', fontSize: 12, marginBottom: 6 }}>
            Crib belongs to: <span style={{ color: dealer === 'human' ? '#4dff91' : '#ff8080' }}>{dealer === 'human' ? 'You' : 'AI'}</span>
          </div>
          <button
            onClick={confirmDiscard}
            disabled={humanDiscards.length !== 2}
            style={btnStyle('#0f9960', humanDiscards.length !== 2)}
          >
            Discard to Crib
          </button>
        </div>
      }
      right={mathPanel}
    />
  )

  // ── CUT ──
  if (phase === 'cut') return (
    <GameLayout
      left={
        <div style={{ maxWidth: 560 }}>
          {tutorialOn && (
            <div style={{ background: 'rgba(29,111,164,0.15)', border: '1px solid rgba(29,111,164,0.4)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#a0d0ff', lineHeight: 1.6 }}>
              <strong style={{ color: '#4dd0ff' }}>Tutorial:</strong> {CRIB_TIPS.cut}
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#a0c0ff', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>YOUR KEPT HAND</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {humanHand.map(c => <Card key={c.id} card={c} small />)}
            </div>
          </div>
          {scorePopup && (
            <div style={{ background: 'rgba(255,224,64,0.15)', border: '1px solid rgba(255,224,64,0.4)', borderRadius: 10, padding: '10px 16px', marginBottom: 12, color: '#ffe040', fontWeight: 700, textAlign: 'center' }}>
              {scorePopup.msg}
            </div>
          )}
          <button onClick={cutStarter} style={btnStyle('#0f9960')}>Cut Starter Card</button>
        </div>
      }
      right={mathPanel}
    />
  )

  // ── PEG ──
  if (phase === 'peg') {
    const playSeq = pegState.playSequence || []
    return (
      <GameLayout
        left={
          <div>
            {tutorialOn && (
              <div style={{ background: 'rgba(29,111,164,0.15)', border: '1px solid rgba(29,111,164,0.4)', borderRadius: 10, padding: '12px 16px', marginBottom: 12, fontSize: 13, color: '#a0d0ff', lineHeight: 1.6 }}>
                <strong style={{ color: '#4dd0ff' }}>Tutorial:</strong> {CRIB_TIPS.peg}
              </div>
            )}

            {/* Score banner */}
            {scorePopup && (
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 14px', marginBottom: 8, color: scorePopup.color, fontWeight: 700, fontSize: 14, textAlign: 'center' }}>
                {scorePopup.msg}
              </div>
            )}

            {/* Running total + turn + Go button — always visible together */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '6px 16px', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: 10, color: '#aaa', marginBottom: 1 }}>Running Total</div>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color: pegState.runningTotal >= 15 ? '#ffe040' : '#fff', lineHeight: 1 }}>
                  {pegState.runningTotal}
                </div>
              </div>
              {starter && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>STARTER</div>
                  <Card card={starter} small />
                </div>
              )}
              <div style={{ flex: 1, fontSize: 12, color: pegState.turn === 'human' ? '#4dff91' : '#ff8080' }}>
                {pegState.turn === 'human' ? '▶ Your turn' : '⏳ AI thinking...'}
              </div>
              {/* Say Go — shown whenever it's human's turn, disabled if they can still play */}
              {pegState.turn === 'human' && humanHand.length > 0 && (
                <button
                  onClick={humanSayGo}
                  disabled={humanCanPlay}
                  title={humanCanPlay ? 'You still have playable cards' : "None of your cards can play without exceeding 31 — say Go!"}
                  style={{
                    ...btnStyle(humanCanPlay ? '#1a1a3e' : '#7c3aed', humanCanPlay),
                    border: humanCanPlay ? '1px solid #333' : 'none',
                    fontSize: 13, padding: '8px 16px',
                  }}
                >
                  Say Go {!humanCanPlay && '⚠️'}
                </button>
              )}
            </div>

            {/* Play sequence */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 4, letterSpacing: 1 }}>PLAY SEQUENCE</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', minHeight: 36 }}>
                {playSeq.map((p, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <Card card={p.card} small />
                    <div style={{ position: 'absolute', top: -5, right: -3, fontSize: 9, fontWeight: 700, color: p.player === 'human' ? '#4dff91' : '#ff4455', background: '#0d1525', borderRadius: 3, padding: '1px 3px' }}>
                      {p.player === 'human' ? 'Y' : 'A'}
                    </div>
                  </div>
                ))}
                {playSeq.length === 0 && <span style={{ color: '#444', fontSize: 11, alignSelf: 'center' }}>No cards played yet</span>}
              </div>
            </div>

            {/* Human hand */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: '#a0c0ff', fontSize: 11, marginBottom: 6, letterSpacing: 1 }}>
                YOUR HAND — click a card to play
                {pegState.turn === 'human' && !humanCanPlay && humanHand.length > 0 && (
                  <span style={{ color: '#ff8080', marginLeft: 8 }}>↑ None playable — use "Say Go"</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 60 }}>
                {humanHand.map(c => {
                  const canPlay = pegState.runningTotal + pegCardValue(c) <= 31
                  return (
                    <Card
                      key={c.id} card={c} small
                      onClick={() => canPlay && pegState.turn === 'human' && playPegCard(c)}
                      style={{ opacity: canPlay ? 1 : 0.3, cursor: canPlay && pegState.turn === 'human' ? 'pointer' : 'not-allowed' }}
                    />
                  )
                })}
                {humanHand.length === 0 && <div style={{ color: '#555', fontSize: 12, alignSelf: 'center' }}>All cards played</div>}
              </div>
            </div>

            {/* AI hand (face down) */}
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 4, letterSpacing: 1 }}>AI HAND ({aiHand.length} remaining)</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {aiHand.map((_, i) => <Card key={i} card={{ suit: '♠', rank: 'A' }} faceDown small />)}
              </div>
            </div>

            {/* Log */}
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: 8, maxHeight: 80, overflowY: 'auto' }}>
              {log.slice(0, 5).map((l, i) => (
                <div key={i} style={{ color: i === 0 ? '#ffd700' : '#555', fontSize: 11, marginBottom: 2 }}>{l}</div>
              ))}
            </div>
          </div>
        }
        right={mathPanel}
      />
    )
  }

  // ── COUNT ──
  if (phase === 'count') return (
    <GameLayout
      left={
        <div style={{ maxWidth: 560 }}>
          {tutorialOn && (
            <div style={{ background: 'rgba(29,111,164,0.15)', border: '1px solid rgba(29,111,164,0.4)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#a0d0ff', lineHeight: 1.6 }}>
              <strong style={{ color: '#4dd0ff' }}>Tutorial:</strong> {CRIB_TIPS.count}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: '#fff', fontWeight: 700, marginBottom: 6 }}>
              Counting: <span style={{ color: '#0f9960' }}>
                {countPhase === 'human_hand' ? 'Your hand' : countPhase === 'ai_hand' ? "AI's hand" : `${dealer === 'human' ? 'Your' : "AI's"} crib`}
              </span>
            </div>
            {starter && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#aaa' }}>STARTER:</div>
                <Card card={starter} small />
              </div>
            )}
          </div>

          {/* Show the hand being counted */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 6, letterSpacing: 1 }}>
              {countPhase === 'human_hand' ? 'YOUR' : countPhase === 'ai_hand' ? "AI'S" : 'CRIB'} CARDS
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(countPhase === 'human_hand'
                ? (humanHand.length > 0 ? humanHand : pegState.humanPlayed)
                : countPhase === 'ai_hand'
                ? (aiHand.length > 0 ? aiHand : pegState.aiPlayed)
                : crib
              ).map(c => <Card key={c.id} card={c} small />)}
            </div>
          </div>

          {!countResult ? (
            <button onClick={countNext} style={btnStyle('#0f9960')}>Count This Hand</button>
          ) : (
            <div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#ffe040', marginBottom: 10 }}>
                  {countResult.who}: {countResult.result.total} pts
                </div>
                {countResult.result.breakdown.map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#a0c0ff', marginBottom: 4 }}>
                    <span>{b.name}</span>
                    <span style={{ color: '#4dff91', fontWeight: 700 }}>+{b.points}</span>
                  </div>
                ))}
                {countResult.result.breakdown.length === 0 && (
                  <div style={{ color: '#555', fontSize: 12 }}>No score</div>
                )}
              </div>
              <button onClick={advanceCount} style={btnStyle('#1d6fa4')}>
                {countPhase === 'crib' ? 'Next Hand' : 'Next Count'}
              </button>
            </div>
          )}

          <div style={{ marginTop: 14, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 8, maxHeight: 100, overflowY: 'auto' }}>
            {log.map((l, i) => (
              <div key={i} style={{ color: i === 0 ? '#ffd700' : '#555', fontSize: 11, marginBottom: 2 }}>{l}</div>
            ))}
          </div>
        </div>
      }
      right={mathPanel}
    />
  )

  // ── GAME OVER ──
  if (phase === 'gameover') {
    const winner = humanScore >= 121 ? 'human' : 'ai'
    return (
      <GameLayout
        left={
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: winner === 'human' ? '#4dff91' : '#ff4455', marginBottom: 12 }}>
              {winner === 'human' ? 'You Win!' : 'AI Wins!'}
            </div>
            <div style={{ fontSize: 15, color: '#a0c0ff', marginBottom: 24 }}>
              Final score — You: <strong style={{ color: '#4dff91' }}>{humanScore}</strong> &nbsp; AI: <strong style={{ color: '#ff4455' }}>{aiScore}</strong>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => {
                setHumanScore(0); setAiScore(0); setHandNum(1); setDealer('ai'); setPhase('deal')
              }} style={btnStyle('#0f9960')}>Play Again</button>
              <button onClick={() => { setHumanScore(0); setAiScore(0); setHandNum(1); setDealer('ai'); setPhase('intro') }} style={btnStyle('#1d6fa4')}>Back to Intro</button>
            </div>
          </div>
        }
        right={mathPanel}
      />
    )
  }

  return null
}

// ═══════════════════════════════════════════════
//  GAME MENU CONFIG
// ═══════════════════════════════════════════════
const CARD_GAMES = [
  {
    id: 'blackjack',
    name: 'Blackjack',
    emoji: '21',
    stem: 'Probability & Card Counting',
    desc: 'Beat the dealer to 21. Live deck composition, Hi-Lo count, bust probabilities, and basic strategy.',
    color: '#1d6fa4',
    component: BlackjackGame,
  },
  {
    id: 'cardcounter',
    name: 'Card Counter',
    emoji: '#',
    stem: 'Hi-Lo System Training',
    desc: 'Cards flip one at a time. Maintain your running count and submit it for scoring. Track accuracy over time.',
    color: '#cc44ff',
    component: CardCounterGame,
  },
  {
    id: 'hilo',
    name: 'Higher / Lower',
    emoji: '%',
    stem: 'Statistics & Bayesian Reasoning',
    desc: 'Guess if the next card is higher or lower. Live probabilities, deck histogram, streak odds.',
    color: '#7c3aed',
    component: HigherLowerGame,
  },
  {
    id: 'war',
    name: 'War',
    emoji: 'W',
    stem: "Gambler's Ruin",
    desc: "Battle the AI round by round. Watch the win probability curve shift as the card balance changes.",
    color: '#c0392b',
    component: WarGame,
  },
  {
    id: 'gofish',
    name: 'Go Fish',
    emoji: 'G',
    stem: 'Conditional Probability',
    desc: 'Collect sets of 4. Math panel shows P(AI has your rank) in real time based on remaining cards.',
    color: '#0f9960',
    component: GoFishGame,
  },
  {
    id: 'snap',
    name: 'Snap!',
    emoji: 'S',
    stem: 'Reaction Time & Neuroscience',
    desc: 'Match cards before the AI. Reaction time chart updates live. See how you compare to human benchmarks.',
    color: '#f39c12',
    component: SnapGame,
  },
  {
    id: 'cribbage',
    name: 'Cribbage',
    emoji: '📊',
    stem: 'Combinatorics & Scoring',
    desc: 'The classic 2-player card game built on combinatorics — count 15s, pairs, runs, and race to 121 on the board.',
    color: '#0f9960',
    component: CribbageGame,
  },
]

// ═══════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════
export default function CardAcademy() {
  const [activeGame, setActiveGame] = useState(null)
  const game = CARD_GAMES.find(g => g.id === activeGame)
  const GameComponent = game?.component

  useEffect(() => {
    document.title = activeGame ? `${game?.name} — Card Academy` : 'Card Academy — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [activeGame, game?.name])

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#e0e0ff',
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, #1d6fa4, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'monospace',
        }}>
          CA
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.5, color: '#fff' }}>
            The Mathematician's Guide to Cards
          </div>
          <div style={{ fontSize: 12, color: '#7070aa', letterSpacing: 1 }}>LEARN PROBABILITY & MATH THROUGH PLAY</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {activeGame && (
            <button onClick={() => setActiveGame(null)} style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
              color: '#a0c0ff', cursor: 'pointer', padding: '8px 14px', fontSize: 13, fontWeight: 600,
            }}>
              Menu
            </button>
          )}
          <Link to="/games" style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, color: '#a0c0ff', textDecoration: 'none',
            padding: '8px 14px', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
          }}>
            Games
          </Link>
        </div>
      </div>

      {!activeGame ? (
        /* GAME MENU */
        <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '32px 24px', maxWidth: 920, margin: '0 auto' }}>
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Choose Your Game</div>
            <div style={{ color: '#7070aa', fontSize: 15 }}>
              Every game has a live math panel — watch probability update in real time as you play
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {CARD_GAMES.map(g => (
              <div
                key={g.id}
                onClick={() => setActiveGame(g.id)}
                style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.1)', padding: '22px 20px',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.borderColor = g.color
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: g.color + '33', border: `1px solid ${g.color}66`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 900, color: g.color, fontFamily: 'monospace',
                  marginBottom: 12,
                }}>
                  {g.emoji}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{g.name}</div>
                <div style={{
                  display: 'inline-block', background: g.color + '33', border: `1px solid ${g.color}66`,
                  borderRadius: 6, padding: '3px 10px', fontSize: 11, color: g.color, fontWeight: 700,
                  letterSpacing: 0.5, marginBottom: 10,
                }}>
                  {g.stem}
                </div>
                <div style={{ color: '#8080aa', fontSize: 13, lineHeight: 1.5 }}>{g.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', padding: '20px 24px' }}>
            <div style={{ color: '#4dd0ff', fontWeight: 700, fontSize: 14, marginBottom: 14, fontFamily: 'monospace', letterSpacing: 1 }}>
              MATH CONCEPTS COVERED
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {[
                ['Probability Theory', 'blackjack/higher-lower'],
                ['Expected Value', 'blackjack'],
                ['Conditional Probability', 'go fish/card counter'],
                ['Bayesian Reasoning', 'higher-lower'],
                ['Hi-Lo Card Counting', 'blackjack/counter'],
                ["Gambler's Ruin", 'war'],
                ['Hypergeometric Distribution', 'go fish'],
                ['Reaction Time Analysis', 'snap'],
                ['Running & True Count', 'blackjack/counter'],
                ['Sampling Without Replacement', 'all games'],
              ].map(([concept, game]) => (
                <div key={concept} style={{ color: '#a0c0ff', fontSize: 12, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: '#4dff91', marginTop: 1 }}>+</span>
                  <span>
                    {concept}
                    <span style={{ color: '#444', fontSize: 10, display: 'block' }}>{game}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      ) : (
        /* ACTIVE GAME — flex column filling remaining height */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: game.color + '33', border: `1px solid ${game.color}66`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 900, color: game.color, fontFamily: 'monospace',
            }}>
              {game.emoji}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{game.name}</div>
              <div style={{
                display: 'inline-block', background: game.color + '33', border: `1px solid ${game.color}66`,
                borderRadius: 6, padding: '1px 8px', fontSize: 10, color: game.color, fontWeight: 700,
              }}>
                {game.stem}
              </div>
            </div>
          </div>
          <GameComponent />
        </div>
      )}
    </div>
  )
}
