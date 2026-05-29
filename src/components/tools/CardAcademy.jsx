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

  const deal = () => {
    const d = shuffle(makeDeck())
    const ph = [d[0], d[2]], dh = [d[1], d[3]]
    const newDeck = d.slice(4)
    const initSeen = [d[0], d[2], d[1]]  // player cards + dealer upcard (face up)
    const initCount = initSeen.reduce((sum, c) => sum + hiLoValue(c.rank), 0)
    setDeck(newDeck)
    setPlayerHand(ph)
    setDealerHand(dh)
    setPhase('playing')
    setMessage('')
    setSeenCards(initSeen)
    setRunningCount(initCount)
    const pv = bjHandValue(ph)
    if (pv === 21) {
      setMessage('Blackjack! You win!')
      setScore((s) => ({ ...s, player: s.player + 1 }))
      setPhase('done')
    }
  }

  const hit = useCallback(async () => {
    if (phase !== 'playing' || busy) return
    setBusy(true)
    const [card, ...rest] = deck
    const newHand = [...playerHand, card]
    const newSeen = [...seenCards, card]
    const newCount = runningCount + hiLoValue(card.rank)
    setPlayerHand(newHand)
    setDeck(rest)
    setSeenCards(newSeen)
    setRunningCount(newCount)
    const val = bjHandValue(newHand)
    if (val > 21) {
      setMessage(`Bust! ${val} — Dealer wins.`)
      setScore((s) => ({ ...s, dealer: s.dealer + 1 }))
      setPhase('done')
    }
    setBusy(false)
  }, [deck, playerHand, phase, busy, seenCards, runningCount])

  const stand = useCallback(async () => {
    if (phase !== 'playing' || busy) return
    setBusy(true)
    setPhase('dealer')
    let dh = [...dealerHand], d = [...deck]
    let seen = [...seenCards]
    let rc = runningCount
    // reveal hole card
    seen = [...seen, dealerHand[1]]
    rc += hiLoValue(dealerHand[1].rank)
    while (bjHandValue(dh) < 17) {
      await sleep(600)
      const card = d.shift()
      dh = [...dh, card]
      seen = [...seen, card]
      rc += hiLoValue(card.rank)
      setDealerHand([...dh])
      setDeck([...d])
      setSeenCards([...seen])
      setRunningCount(rc)
    }
    const dv = bjHandValue(dh), pv = bjHandValue(playerHand)
    await sleep(400)
    let msg, winner
    if (dv > 21) { msg = 'Dealer busts! You win!'; winner = 'player' }
    else if (dv > pv) { msg = `Dealer wins: ${dv} vs your ${pv}.`; winner = 'dealer' }
    else if (pv > dv) { msg = `You win! ${pv} beats ${dv}!`; winner = 'player' }
    else { msg = `Push — both ${pv}.`; winner = 'tie' }
    setMessage(msg)
    if (winner === 'player') setScore((s) => ({ ...s, player: s.player + 1 }))
    else if (winner === 'dealer') setScore((s) => ({ ...s, dealer: s.dealer + 1 }))
    setPhase('done')
    setBusy(false)
  }, [dealerHand, deck, playerHand, phase, busy, seenCards, runningCount])

  const pv = bjHandValue(playerHand)
  const dv = bjHandValue(dealerHand)
  const dealerUpcard = dealerHand[0]

  // Deck composition math
  const remaining = deck.length
  const totalCards = 52
  const countPerGroup = (group, d) => d.filter(c => group.includes(c.rank)).length
  const low = countPerGroup(['2','3','4','5','6'], deck)
  const mid = countPerGroup(['7','8','9'], deck)
  const high = countPerGroup(['10','J','Q','K'], deck)
  const ace = countPerGroup(['A'], deck)

  // Bust probability if player hits
  const bustIfHit = () => {
    if (pv === 0 || deck.length === 0) return 0
    const bustCards = deck.filter(c => {
      const testVal = BJ_VALUES[c.rank]
      let newVal = pv + testVal
      if (newVal > 21) {
        // check if an ace can save it
        const aces = playerHand.filter(h => h.rank === 'A').length
        let v2 = newVal
        let a2 = aces
        while (v2 > 21 && a2 > 0) { v2 -= 10; a2-- }
        if (v2 > 21) return true
        return false
      }
      return false
    })
    return Math.round((bustCards.length / deck.length) * 100)
  }
  const bustPct = bustIfHit()

  // True count
  const decksRemaining = Math.max(deck.length / 52, 0.1)
  const trueCount = (runningCount / decksRemaining).toFixed(1)

  // Strategy
  const strategy = (phase === 'playing' && dealerUpcard)
    ? basicStrategy(pv, dealerUpcard.rank)
    : null
  const stratColor = strategy === 'STAND' ? '#4dff91' : strategy === 'HIT' ? '#ff4455' : '#ffe040'

  // EV indicator
  const evFavors = parseFloat(trueCount) >= 1 ? 'PLAYER +EV' : parseFloat(trueCount) <= -1 ? 'HOUSE +EV' : 'NEUTRAL'
  const evColor = parseFloat(trueCount) >= 1 ? '#4dff91' : parseFloat(trueCount) <= -1 ? '#ff4455' : '#ffe040'

  const mathPanel = (
    <>
      <MPSection title="Deck Composition">
        <HBar label="Low (2-6)" value={low} max={20} color="#ff4455" subtitle={`${Math.round(low/Math.max(remaining,1)*100)}%`} />
        <HBar label="Mid (7-9)" value={mid} max={12} color="#ffe040" subtitle={`${Math.round(mid/Math.max(remaining,1)*100)}%`} />
        <HBar label="High (10-K)" value={high} max={16} color="#4dff91" subtitle={`${Math.round(high/Math.max(remaining,1)*100)}%`} />
        <HBar label="Ace" value={ace} max={4} color="#4dd0ff" subtitle={`${Math.round(ace/Math.max(remaining,1)*100)}%`} />
        <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{remaining} cards remaining</div>
      </MPSection>

      <MPSection title="Hi-Lo Card Count">
        <BigNum
          value={runningCount >= 0 ? `+${runningCount}` : runningCount}
          label="Running Count"
          color={runningCount > 0 ? '#4dff91' : runningCount < 0 ? '#ff4455' : '#ffe040'}
        />
        <Formula text={`+1 = low card (2-6)\n 0 = neutral (7-9)\n-1 = high card (10,J,Q,K,A)`} />
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>
            True Count = Running / Decks Left
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#cc44ff', fontFamily: 'monospace' }}>
            {runningCount >= 0 ? `+${trueCount}` : trueCount}
          </div>
          <Formula text={`TC = ${runningCount} / ${decksRemaining.toFixed(2)} decks`} />
        </div>
        <div style={{ fontSize: 11, color: runningCount > 0 ? '#4dff91' : '#ff4455', textAlign: 'center', marginTop: 4, lineHeight: 1.5 }}>
          {runningCount > 0
            ? 'Deck is HOT — more 10s remain, favors player'
            : runningCount < 0
            ? 'Deck is COLD — low cards remain, favors house'
            : 'Deck is neutral'}
        </div>
      </MPSection>

      {phase === 'playing' && (
        <MPSection title="If You Hit Now">
          <HBar label="Bust probability" value={bustPct} max={100} color={bustPct > 50 ? '#ff4455' : '#ffe040'} subtitle={`${bustPct}%`} />
          <Formula text={`P(bust) = bust_cards / remaining`} />
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
            At total {pv}: {bustPct}% chance of busting if you hit.
          </div>
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
            <div style={{ fontSize: 10, color: '#555', marginTop: 6 }}>
              Based on standard basic strategy table (hard totals)
            </div>
          </div>
        </MPSection>
      )}

      <MPSection title="EV Indicator">
        <div style={{ textAlign: 'center' }}>
          <Badge label={evFavors} color={evColor} />
          <div style={{ fontSize: 10, color: '#555', marginTop: 6, lineHeight: 1.5 }}>
            True count &gt;= +2: player +EV<br />
            True count &lt;= -1: house +EV<br />
            Base house edge: ~0.5%
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
            <div style={{ color: '#a0c0ff', fontSize: 14 }}>
              <span style={{ color: '#ffd700', fontWeight: 700 }}>Player:</span> {score.player} &nbsp;
              <span style={{ color: '#ff8080' }}>Dealer:</span> {score.dealer}
            </div>
            {phase !== 'idle' && (
              <div style={{ color: '#e0e0ff', fontSize: 14 }}>
                Your total: <strong style={{ color: pv > 21 ? '#ff4455' : pv === 21 ? '#4dff91' : '#fff' }}>{pv}</strong>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ color: '#a0c0ff', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>DEALER</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 100 }}>
              {dealerHand.map((c, i) => <Card key={c.id} card={c} faceDown={i === 1 && phase === 'playing'} />)}
            </div>
            {phase !== 'idle' && phase !== 'playing' && (
              <div style={{ color: '#ff8080', fontSize: 13, marginTop: 4 }}>Value: {dv}</div>
            )}
          </div>

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

          <div style={{ display: 'flex', gap: 10 }}>
            {phase === 'idle' || phase === 'done' ? (
              <button onClick={deal} style={btnStyle('#0f9960')}>{phase === 'done' ? 'Deal Again' : 'Deal Cards'}</button>
            ) : (
              <>
                <button onClick={hit} disabled={busy} style={btnStyle('#1d6fa4', busy)}>Hit</button>
                <button onClick={stand} disabled={busy} style={btnStyle('#7c3aed', busy)}>Stand</button>
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
