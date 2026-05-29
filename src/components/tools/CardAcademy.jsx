import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'

// ═══════════════════════════════════════════════
//  CONSTANTS & HELPERS
// ═══════════════════════════════════════════════
const SUITS = ['♠', '♥', '♦', '♣']
const SUIT_COLORS = { '♠': '#1a1a2e', '♣': '#1a1a2e', '♥': '#c0392b', '♦': '#c0392b' }
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

// ═══════════════════════════════════════════════
//  SHARED BUTTON STYLE
// ═══════════════════════════════════════════════
const btnStyle = (bg) => ({
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 20px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  letterSpacing: 0.5,
  transition: 'filter 0.15s, transform 0.1s',
  fontFamily: 'inherit',
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
//  STEM INSIGHT PANEL
// ═══════════════════════════════════════════════
const STEMPanel = ({ insight, onClose }) => (
  <div style={{
    background: 'linear-gradient(135deg,#0f3460,#16213e)', borderRadius: 14,
    padding: '20px 24px', margin: '12px 0', color: '#e0e0ff',
    border: '1px solid #4a4aaa', position: 'relative',
    boxShadow: '0 4px 20px rgba(0,0,140,0.4)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 22 }}>🔬</span>
      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: '#a0d0ff', textTransform: 'uppercase' }}>
        STEM Insight
      </span>
      {onClose && (
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#a0d0ff', cursor: 'pointer', fontSize: 18 }}>
          ×
        </button>
      )}
    </div>
    <div style={{ fontSize: 14.5, lineHeight: 1.7, color: '#d0e8ff' }}>{insight}</div>
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
  const [insight, setInsight] = useState(null)
  const [busy, setBusy] = useState(false)

  const deal = () => {
    const d = shuffle(makeDeck())
    const ph = [d[0], d[2]], dh = [d[1], d[3]]
    setDeck(d.slice(4)); setPlayerHand(ph); setDealerHand(dh)
    setPhase('playing'); setMessage(''); setInsight(null)
    const pv = bjHandValue(ph)
    if (pv === 21) {
      setMessage('Blackjack! You win! 🎉')
      setScore((s) => ({ ...s, player: s.player + 1 }))
      setPhase('done')
      setInsight('Blackjack (Natural 21) pays 3:2 in most casinos. The probability of being dealt a natural blackjack is about 4.83%, or roughly 1 in 21 hands. This comes from P(Ace) × P(10-value | Ace dealt) = (4/52) × (16/51) × 2 ≈ 0.0483.')
    }
  }

  const hit = useCallback(async () => {
    if (phase !== 'playing' || busy) return
    setBusy(true)
    const [card, ...rest] = deck
    const newHand = [...playerHand, card]
    setPlayerHand(newHand); setDeck(rest)
    const val = bjHandValue(newHand)
    if (val > 21) {
      setMessage('Bust! Dealer wins. 💔')
      setScore((s) => ({ ...s, dealer: s.dealer + 1 }))
      setPhase('done')
      setInsight(`You busted with ${val}. Each hit when you're at 12-16 risks busting. At 16, there are 20 "bust cards" (any 6+) out of ~52 cards in a fresh deck, giving a ~38% bust probability. Basic strategy says stand on 17+ and consider the dealer's up-card.`)
    }
    setBusy(false)
  }, [deck, playerHand, phase, busy])

  const stand = useCallback(async () => {
    if (phase !== 'playing' || busy) return
    setBusy(true); setPhase('dealer')
    let dh = [...dealerHand], d = [...deck]
    while (bjHandValue(dh) < 17) {
      await sleep(600)
      dh = [...dh, d.shift()]
      setDealerHand([...dh]); setDeck([...d])
    }
    const dv = bjHandValue(dh), pv = bjHandValue(playerHand)
    await sleep(400)
    let msg, winner
    if (dv > 21) { msg = 'Dealer busts! You win! 🎉'; winner = 'player' }
    else if (dv > pv) { msg = `Dealer wins with ${dv} vs your ${pv}. 💔`; winner = 'dealer' }
    else if (pv > dv) { msg = `You win! ${pv} beats ${dv}! 🎉`; winner = 'player' }
    else { msg = `Push! Both ${pv} — it's a tie.`; winner = 'tie' }
    setMessage(msg)
    if (winner === 'player') setScore((s) => ({ ...s, player: s.player + 1 }))
    else if (winner === 'dealer') setScore((s) => ({ ...s, dealer: s.dealer + 1 }))
    setPhase('done')
    setInsight('Dealer must hit until reaching 17+. This "hard 17 rule" is a house constraint rooted in expected value. The house edge in standard blackjack is ~0.5% when using basic strategy — one of the lowest of any casino game. Expected Value = Σ(outcome × probability). Knowing when to hit vs stand is applied probability theory.')
    setBusy(false)
  }, [dealerHand, deck, playerHand, phase, busy])

  const pv = bjHandValue(playerHand), dv = bjHandValue(dealerHand)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ color: '#a0c0ff', fontSize: 14 }}>
          <span style={{ color: '#ffd700', fontWeight: 700 }}>Player:</span> {score.player} &nbsp;
          <span style={{ color: '#ff8080' }}>Dealer:</span> {score.dealer}
        </div>
        {phase !== 'idle' && (
          <div style={{ color: '#e0e0ff', fontSize: 14 }}>
            Your hand: <strong style={{ color: pv > 21 ? '#ff4444' : pv === 21 ? '#4dff91' : '#fff' }}>{pv}</strong>
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
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#ffd700', fontWeight: 700, fontSize: 16, marginBottom: 12, textAlign: 'center' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {phase === 'idle' || phase === 'done' ? (
          <button onClick={deal} style={btnStyle('#0f9960')}>{phase === 'done' ? 'Deal Again' : 'Deal Cards'}</button>
        ) : (
          <>
            <button onClick={hit} disabled={busy} style={btnStyle('#1d6fa4')}>Hit</button>
            <button onClick={stand} disabled={busy} style={btnStyle('#7c3aed')}>Stand</button>
          </>
        )}
      </div>

      {insight && <STEMPanel insight={insight} onClose={() => setInsight(null)} />}
      <STEMPanel insight="🎲 Probability Lab: Blackjack is a perfect game for studying Expected Value and conditional probability. The more cards dealt, the more the deck composition shifts — this is why card counting works! A 10-rich deck favors the player by ~0.5–1%." />
    </div>
  )
}

// ═══════════════════════════════════════════════
//  GAME: WAR (AI Opponent)
// ═══════════════════════════════════════════════
const WarGame = () => {
  const [playerDeck, setPlayerDeck] = useState([])
  const [aiDeck, setAiDeck] = useState([])
  const [playerCard, setPlayerCard] = useState(null)
  const [aiCard, setAiCard] = useState(null)
  const [warPile, setWarPile] = useState([])
  const [message, setMessage] = useState('')
  const [phase, setPhase] = useState('idle')
  const [insight, setInsight] = useState(null)
  const [roundNum, setRoundNum] = useState(0)

  const startGame = () => {
    const d = shuffle(makeDeck())
    setPlayerDeck(d.slice(0, 26)); setAiDeck(d.slice(26))
    setPlayerCard(null); setAiCard(null); setWarPile([])
    setMessage("Click 'Flip Card' to battle!"); setPhase('playing'); setRoundNum(0); setInsight(null)
  }

  const flip = () => {
    if (phase !== 'playing') return
    if (playerDeck.length === 0 || aiDeck.length === 0) {
      setMessage(playerDeck.length === 0 ? 'AI wins the war! 🤖' : 'You win the war! 🏆')
      setPhase('done'); return
    }
    const [pc, ...pd] = playerDeck, [ac, ...ad] = aiDeck
    setPlayerCard(pc); setAiCard(ac); setRoundNum((r) => r + 1)
    const pv = RANK_VALUES[pc.rank], av = RANK_VALUES[ac.rank]

    if (pv > av) {
      const won = [...warPile, pc, ac]
      setPlayerDeck([...pd, ...shuffle(won)]); setAiDeck(ad); setWarPile([])
      setMessage(`You win this round! ${pc.rank} beats ${ac.rank}. You gain ${won.length} cards.`)
      if ((roundNum + 1) % 5 === 0) {
        setInsight(`After ${roundNum + 1} rounds — You: ${pd.length + won.length} cards, AI: ${ad.length}. In a perfectly random War game, each round is a 50/50 flip (ignoring ties). The game illustrates the Gambler's Ruin problem: even with equal probability, one player will eventually hold all cards. Expected game length ≈ n² where n is number of cards per player!`)
      }
    } else if (av > pv) {
      const won = [...warPile, pc, ac]
      setAiDeck([...ad, ...shuffle(won)]); setPlayerDeck(pd); setWarPile([])
      setMessage(`AI wins this round! ${ac.rank} beats ${pc.rank}. AI gains ${won.length} cards.`)
    } else {
      setWarPile((w) => [...w, pc, ac])
      setMessage(`⚔️ WAR! Both played ${pc.rank}! Cards go to the war pile (${warPile.length + 2} cards at stake)!`)
      setPlayerDeck(pd); setAiDeck(ad)
      setInsight(`WAR occurs when both cards have equal rank. The probability of a tie on any given flip is 3/51 ≈ 5.9% (3 remaining cards of that rank out of 51). War adds exciting variance — it can rapidly shift the card distribution between players, demonstrating how rare events can have outsized impact on outcomes!`)
    }
  }

  return (
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
          <div style={{ color: '#ff8080', fontSize: 11, marginBottom: 6, letterSpacing: 1 }}>AI 🤖</div>
          {aiCard ? <Card card={aiCard} /> : <div style={{ width: 72, height: 100, borderRadius: 8, border: '2px dashed #444', opacity: 0.4 }} />}
        </div>
      </div>

      {warPile.length > 0 && (
        <div style={{ textAlign: 'center', color: '#ff6b35', fontWeight: 700, marginBottom: 8 }}>
          ⚔️ War pile: {warPile.length} cards at stake!
        </div>
      )}

      {message && <div style={{ textAlign: 'center', color: '#ffd700', fontSize: 14, margin: '8px 0 14px', minHeight: 20 }}>{message}</div>}

      {phase !== 'idle' && (
        <div style={{ margin: '10px 0 14px' }}>
          <div style={{ background: '#1a1a3e', borderRadius: 6, height: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 6, background: 'linear-gradient(90deg, #4dff91, #00c4ff)', width: `${(playerDeck.length / 52) * 100}%`, transition: 'width 0.4s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666', marginTop: 3 }}>
            <span>You: {playerDeck.length}</span><span>AI: {aiDeck.length}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {phase === 'idle' || phase === 'done' ? (
          <button onClick={startGame} style={btnStyle('#0f9960')}>{phase === 'done' ? 'Play Again' : 'Start Game'}</button>
        ) : (
          <button onClick={flip} style={btnStyle('#1d6fa4')}>Flip Card ⚔️</button>
        )}
      </div>

      {insight && <STEMPanel insight={insight} onClose={() => setInsight(null)} />}
      <STEMPanel insight="📊 Math Concept: War demonstrates the Gambler's Ruin theorem. With equal probability p=0.5, starting with n cards, the expected number of rounds before one player wins scales as O(n²). With 26 cards each, expect ~676 rounds on average — and the outcome is entirely determined by the initial shuffle!" />
    </div>
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
  const [insight, setInsight] = useState(null)
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)

  const addLog = (msg) => setLog((l) => [msg, ...l].slice(0, 6))

  const checkBooks = (hand) => {
    const counts = {}
    for (const c of hand) counts[c.rank] = (counts[c.rank] || 0) + 1
    const books = Object.keys(counts).filter((r) => counts[r] === 4)
    const filtered = hand.filter((c) => !books.includes(c.rank))
    return { books, filtered }
  }

  const startGame = () => {
    const d = shuffle(makeDeck())
    const ph = d.slice(0, 7), ah = d.slice(7, 14), p = d.slice(14)
    const { books: pb, filtered: pf } = checkBooks(ph)
    const { books: ab, filtered: af } = checkBooks(ah)
    setPlayerHand(pf); setAiHand(af); setPond(p)
    setPlayerBooks(pb); setAiBooks(ab); setTurn('player')
    setLog(['Game started! Ask the AI for a rank.']); setPhase('playing')
    setSelected(null); setInsight(null); setBusy(false)
  }

  const askAI = async () => {
    if (!selected || turn !== 'player' || busy) return
    setBusy(true)
    const aiHasCard = aiHand.filter((c) => c.rank === selected)
    let ph = [...playerHand], ah = [...aiHand], p = [...pond]

    if (aiHasCard.length > 0) {
      ph = [...ph, ...aiHasCard]; ah = ah.filter((c) => c.rank !== selected)
      addLog(`AI had ${aiHasCard.length} × ${selected}! You got them!`)
      setInsight(`You successfully fished! You asked for ${selected} and the AI had ${aiHasCard.length} cards. This is conditional probability — you had information about your own hand to deduce what others might have. The more of a rank you hold, the less likely others have it.`)
    } else {
      if (p.length > 0) {
        const [drawn, ...rest] = p; ph = [...ph, drawn]; p = rest
        addLog(`Go Fish! You drew a ${drawn.rank}${drawn.suit}.`)
      } else addLog('Go Fish! Pond is empty.')
    }

    const { books: pb, filtered: pf } = checkBooks(ph)
    setPlayerBooks((prev) => [...prev, ...pb]); setPlayerHand(pf); setAiHand(ah); setPond(p); setSelected(null)

    const gameOver = pf.length === 0 && ah.length === 0
    if (gameOver || playerBooks.length + pb.length + aiBooks.length >= 13) {
      setPhase('done')
      const winner = playerBooks.length + pb.length > aiBooks.length ? 'You win!'
        : aiBooks.length > playerBooks.length + pb.length ? 'AI wins!' : 'Tie!'
      addLog(`Game over! ${winner} You: ${playerBooks.length + pb.length} books, AI: ${aiBooks.length} books.`)
      setBusy(false); return
    }

    setTurn('ai'); setBusy(false)
    await sleep(800)
    if (ah.length === 0) { setTurn('player'); return }
    const aiTarget = ah[Math.floor(Math.random() * ah.length)].rank
    const playerHas = pf.filter((c) => c.rank === aiTarget)
    let newPh = [...pf], newAh = [...ah]

    if (playerHas.length > 0) {
      newAh = [...newAh, ...playerHas]; newPh = newPh.filter((c) => c.rank !== aiTarget)
      addLog(`AI asked for ${aiTarget} — you had ${playerHas.length}! AI took them.`)
    } else {
      if (p.length > 0) {
        const [drawn, ...rest] = p; newAh = [...newAh, drawn]; setPond(rest)
        addLog(`AI asked for ${aiTarget} — Go Fish! AI drew a card.`)
      } else addLog(`AI asked for ${aiTarget} — Go Fish! Pond empty.`)
    }

    const { books: ab, filtered: af } = checkBooks(newAh)
    setAiBooks((prev) => [...prev, ...ab]); setPlayerHand(newPh); setAiHand(af); setTurn('player')
  }

  return (
    <div>
      {phase !== 'idle' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#a0c0ff', fontSize: 13 }}>
          <span>📚 Your books: <strong style={{ color: '#4dff91' }}>{playerBooks.length}</strong> [{playerBooks.join(', ')}]</span>
          <span>🤖 AI books: <strong style={{ color: '#ff8080' }}>{aiBooks.length}</strong></span>
        </div>
      )}

      <div style={{ color: '#a0c0ff', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>
        YOUR HAND ({playerHand.length} cards)
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 80, marginBottom: 14 }}>
        {playerHand.map((c) => (
          <Card key={c.id} card={c} small selected={selected === c.rank}
            onClick={() => phase === 'playing' && turn === 'player' && setSelected(c.rank)} />
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ color: '#a0c0ff', fontSize: 12, marginBottom: 6 }}>🎣 POND: {pond.length} cards remaining</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: Math.min(pond.length, 8) }).map((_, i) => (
            <Card key={i} card={{ suit: '♠', rank: 'A' }} faceDown small style={{ opacity: 0.5 + i * 0.05 }} />
          ))}
          {pond.length > 8 && <span style={{ color: '#666', fontSize: 12, alignSelf: 'center' }}>+{pond.length - 8} more</span>}
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 10, marginBottom: 12, minHeight: 80 }}>
        {log.map((l, i) => <div key={i} style={{ color: i === 0 ? '#ffd700' : '#888', fontSize: 12, marginBottom: 2 }}>{l}</div>)}
      </div>

      {selected && turn === 'player' && (
        <div style={{ marginBottom: 10, color: '#e0e0ff', fontSize: 13 }}>
          Asking for: <strong style={{ color: '#ffd700' }}>{selected}</strong>
          <button onClick={() => setSelected(null)} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {phase === 'idle' || phase === 'done' ? (
          <button onClick={startGame} style={btnStyle('#0f9960')}>{phase === 'done' ? 'Play Again' : 'Start Game'}</button>
        ) : (
          <button onClick={askAI} disabled={!selected || turn !== 'player' || busy}
            style={btnStyle(selected && turn === 'player' ? '#1d6fa4' : '#333')}>
            {turn === 'player' ? (selected ? `Ask for ${selected}s` : 'Select a rank first') : 'AI is thinking...'}
          </button>
        )}
      </div>

      {insight && <STEMPanel insight={insight} onClose={() => setInsight(null)} />}
      <STEMPanel insight="🧮 Probability & Strategy: Go Fish teaches conditional probability and deduction. If you hold 2 Kings, there are only 2 more in the deck. P(AI has ≥1 King) = 1 - (C(50,7)/C(52,7)) ≈ 35% with a 7-card hand. Asking for ranks you already hold maximizes your completion probability!" />
    </div>
  )
}

// ═══════════════════════════════════════════════
//  GAME: SNAP (Reaction Speed + Pattern Matching)
// ═══════════════════════════════════════════════
const SnapGame = () => {
  const [deck, setDeck] = useState([])
  const [pile, setPile] = useState([])
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [phase, setPhase] = useState('idle')
  const [message, setMessage] = useState('')
  const [canSnap, setCanSnap] = useState(false)
  const [insight, setInsight] = useState(null)
  const [reactionTimes, setReactionTimes] = useState([])
  const snapTime = useRef(null)
  const aiTimer = useRef(null)
  // Ref so AI timer callback always sees current canSnap without stale closure
  const canSnapRef = useRef(false)

  const setCanSnapSynced = (val) => {
    canSnapRef.current = val
    setCanSnap(val)
  }

  const start = () => {
    setDeck(shuffle(makeDeck())); setPile([])
    setPlayerScore(0); setAiScore(0); setPhase('playing')
    setMessage("Click 'Flip' to reveal cards!")
    setCanSnapSynced(false); setReactionTimes([]); setInsight(null)
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
      setMessage('SNAP opportunity! Quick, click SNAP! 👆')
      const aiDelay = 800 + Math.random() * 1200
      aiTimer.current = setTimeout(() => {
        if (canSnapRef.current) {
          setAiScore((s) => s + 1)
          setMessage('🤖 AI snapped first!')
          setCanSnapSynced(false)
        }
      }, aiDelay)
    } else {
      setMessage(deck.length === 0 ? 'Deck empty! Game over.' : `Card flipped: ${card.rank}${card.suit}`)
      if (deck.length === 0) setPhase('done')
    }
  }

  const snap = () => {
    if (!canSnapRef.current) {
      setPlayerScore((s) => Math.max(0, s - 1))
      setMessage('False snap! -1 point ⚠️'); return
    }
    if (aiTimer.current) clearTimeout(aiTimer.current)
    const rt = Date.now() - snapTime.current
    setReactionTimes((r) => {
      const next = [...r, rt]
      const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length)
      if (next.length > 1) {
        setInsight(`Your reaction times: [${next.map((t) => t + 'ms').join(', ')}]. Your average: ${avg}ms. Human average reaction time is ~250ms for visual stimuli. Elite athletes average ~190ms. Your neural signal travels from eye → brain → hand in this time. Repeated practice literally changes neural pathway efficiency through neuroplasticity!`)
      }
      return next
    })
    setPlayerScore((s) => s + 1)
    setCanSnapSynced(false)
    setMessage(`You snapped in ${rt}ms! +1 point 🎉`)
  }

  const top = pile[pile.length - 1], second = pile[pile.length - 2]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ color: '#4dff91', fontSize: 16, fontWeight: 700 }}>You: {playerScore}</div>
        <div style={{ color: '#a0c0ff', fontSize: 13 }}>Deck: {deck.length} cards</div>
        <div style={{ color: '#ff8080', fontSize: 16, fontWeight: 700 }}>AI 🤖: {aiScore}</div>
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
          animation: canSnap ? 'pulse 0.5s infinite alternate' : 'none',
        }}>
          {message}
        </div>
      )}

      {reactionTimes.length > 0 && (
        <div style={{ color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 10 }}>
          Avg reaction: {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms &nbsp;|&nbsp; Best: {Math.min(...reactionTimes)}ms
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {phase === 'idle' || phase === 'done' ? (
          <button onClick={start} style={btnStyle('#0f9960')}>{phase === 'done' ? 'Play Again' : 'Start Snap!'}</button>
        ) : (
          <>
            <button onClick={flip} style={btnStyle('#1d6fa4')}>Flip Card</button>
            <button onClick={snap} style={btnStyle(canSnap ? '#ff6b35' : '#444')}>SNAP! 👆</button>
          </>
        )}
      </div>

      <style>{`@keyframes pulse { from { opacity: 0.8; } to { opacity: 1; transform: scale(1.02); } }`}</style>
      {insight && <STEMPanel insight={insight} onClose={() => setInsight(null)} />}
      <STEMPanel insight="⚡ Neuroscience: Snap measures your reaction time — the time for visual stimulus → neural processing → motor response. The visual cortex processes a match in ~100ms, then signals travel to motor cortex (~50ms), then nerve impulses reach your hand muscles (~100ms). Total: ~250ms average. Pattern recognition in snap also uses parallel processing across multiple brain regions simultaneously!" />
    </div>
  )
}

// ═══════════════════════════════════════════════
//  GAME: HIGHER OR LOWER (Statistics)
// ═══════════════════════════════════════════════
const HigherLowerGame = () => {
  const [deck, setDeck] = useState([])
  const [current, setCurrent] = useState(null)
  const [next, setNext] = useState(null)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [phase, setPhase] = useState('idle')
  const [message, setMessage] = useState('')
  const [insight, setInsight] = useState(null)
  const [history, setHistory] = useState([])

  const start = () => {
    const d = shuffle(makeDeck())
    setCurrent(d[0]); setNext(d[1]); setDeck(d.slice(2))
    setStreak(0); setPhase('playing')
    setMessage('Higher or Lower than the current card?')
    setInsight(null); setHistory([])
  }

  const guess = (dir) => {
    if (phase !== 'playing') return
    const cv = RANK_VALUES_ACE_HIGH[current.rank]
    const nv = RANK_VALUES_ACE_HIGH[next.rank]
    const isHigher = nv > cv, isLower = nv < cv, isSame = nv === cv
    const correct = (dir === 'higher' && isHigher) || (dir === 'lower' && isLower)

    const cardsLeft = deck.length + 2
    const higherCount = [...deck, next].filter((c) => RANK_VALUES_ACE_HIGH[c.rank] > cv).length
    const lowerCount = [...deck, next].filter((c) => RANK_VALUES_ACE_HIGH[c.rank] < cv).length
    const probHigher = Math.round((higherCount / (cardsLeft - 1)) * 100)
    const probLower = Math.round((lowerCount / (cardsLeft - 1)) * 100)

    setHistory((h) => [...h, { card: current, correct, dir }])

    if (isSame) {
      setMessage(`Same value (${current.rank} = ${next.rank})! Push — try again.`)
      setCurrent(next)
      if (deck.length > 0) { const [nc, ...rest] = deck; setNext(nc); setDeck(rest) }
      setInsight(`Equal ranks! Both cards were ${current.rank}. The probability of the next card exactly equaling the current rank is 3/(52-cardsDealt) — it gets smaller as the deck depletes. This is sampling without replacement.`)
      return
    }

    if (correct) {
      const ns = streak + 1; setStreak(ns); setBest((b) => Math.max(b, ns))
      setMessage(`✅ Correct! ${next.rank} was ${isHigher ? 'higher' : 'lower'}! Streak: ${ns}`)
      if (ns % 3 === 0) {
        setInsight(`Streak of ${ns}! The probability of ${ns} correct guesses in a row depends on each guess. For mid-range cards (~7-8), each guess is ~50/50. For extreme cards (2 or Ace), one direction has >85% probability. This is why knowledge of the current card value matters — it's Bayesian reasoning in action!`)
      }
    } else {
      setMessage(`❌ Wrong! ${next.rank} was ${isHigher ? 'higher' : 'lower'}. Streak of ${streak} lost.`)
      setInsight(`The card was ${next.rank} (value ${nv}). Given ${current.rank} (value ${cv}), there were ${higherCount} higher cards (${probHigher}%) and ${lowerCount} lower cards (${probLower}%) remaining. You chose ${dir} — the ${dir === 'higher' ? probHigher : probLower}% option. Optimal play always picks the more probable direction!`)
      setStreak(0)
    }

    setCurrent(next)
    if (deck.length > 0) { const [nc, ...rest] = deck; setNext(nc); setDeck(rest) }
    else { setPhase('done'); setMessage(`Game over! Best streak: ${best} 🏆`) }
  }

  const cv = current ? RANK_VALUES_ACE_HIGH[current.rank] : 0
  const remaining = deck.length
  const hProb = current ? Math.round(([...deck, next].filter((c) => RANK_VALUES_ACE_HIGH[c.rank] > cv).length / Math.max(remaining, 1)) * 100) : 0
  const lProb = current ? Math.round(([...deck, next].filter((c) => RANK_VALUES_ACE_HIGH[c.rank] < cv).length / Math.max(remaining, 1)) * 100) : 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ color: '#4dff91', fontSize: 14 }}>Streak: <strong>{streak}</strong></div>
        <div style={{ color: '#ffd700', fontSize: 14 }}>Best: <strong>{best}</strong></div>
        <div style={{ color: '#a0c0ff', fontSize: 14 }}>Cards left: <strong>{remaining}</strong></div>
      </div>

      {phase !== 'idle' && current && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', color: '#a0c0ff', fontSize: 11, width: 80 }}>
              Higher: {hProb}%
              <div style={{ background: '#1a3a5e', borderRadius: 4, height: 6, marginTop: 3 }}>
                <div style={{ width: `${hProb}%`, height: '100%', background: '#4dff91', borderRadius: 4 }} />
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#888', fontSize: 10, marginBottom: 4 }}>CURRENT CARD</div>
              {current && <Card card={current} />}
            </div>
            <div style={{ textAlign: 'center', color: '#a0c0ff', fontSize: 11, width: 80 }}>
              Lower: {lProb}%
              <div style={{ background: '#1a3a5e', borderRadius: 4, height: 6, marginTop: 3 }}>
                <div style={{ width: `${lProb}%`, height: '100%', background: '#ff8080', borderRadius: 4 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {message && <div style={{ textAlign: 'center', color: '#ffd700', fontSize: 13, margin: '10px 0' }}>{message}</div>}

      {history.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
          {history.slice(-10).map((h, i) => <span key={i} style={{ fontSize: 16 }}>{h.correct ? '✅' : '❌'}</span>)}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {phase === 'idle' || phase === 'done' ? (
          <button onClick={start} style={btnStyle('#0f9960')}>{phase === 'done' ? 'Play Again' : 'Start Game'}</button>
        ) : (
          <>
            <button onClick={() => guess('higher')} style={btnStyle('#0f9960')}>⬆ Higher</button>
            <button onClick={() => guess('lower')} style={btnStyle('#c0392b')}>⬇ Lower</button>
          </>
        )}
      </div>

      {insight && <STEMPanel insight={insight} onClose={() => setInsight(null)} />}
      <STEMPanel insight="📈 Statistics: Higher/Lower is a perfect study of probability with known information. Ace high = 14, and there are 4 of each rank. If current card = 7, then 28/51 remaining cards are higher (≈55%) and 20/51 are lower (≈39%) — slight edge to guessing higher! As cards are revealed, these probabilities update. This is the foundation of card counting and statistical inference." />
    </div>
  )
}

// ═══════════════════════════════════════════════
//  GAME MENU CONFIG
// ═══════════════════════════════════════════════
const CARD_GAMES = [
  { id: 'blackjack', name: 'Blackjack', emoji: '🃏', stem: 'Probability & Expected Value', desc: 'Beat the dealer to 21. Learn probability, expected value, and basic strategy.', color: '#1d6fa4', component: BlackjackGame },
  { id: 'war', name: 'War', emoji: '⚔️', stem: "Gambler's Ruin & Statistics", desc: "Battle the AI in a game of chance. Explore the Gambler's Ruin theorem.", color: '#c0392b', component: WarGame },
  { id: 'gofish', name: 'Go Fish', emoji: '🐟', stem: 'Conditional Probability & Logic', desc: 'Collect sets of 4. Practice conditional probability and deductive reasoning.', color: '#0f9960', component: GoFishGame },
  { id: 'snap', name: 'Snap!', emoji: '⚡', stem: 'Neuroscience & Reaction Time', desc: 'Match cards before the AI! Measure your reaction time and neural processing.', color: '#f39c12', component: SnapGame },
  { id: 'hilo', name: 'Higher/Lower', emoji: '📈', stem: 'Statistics & Bayesian Reasoning', desc: 'Guess if the next card is higher or lower. Live probability calculations.', color: '#7c3aed', component: HigherLowerGame },
]

// ═══════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════
export default function CardAcademy() {
  const [activeGame, setActiveGame] = useState(null)
  const game = CARD_GAMES.find((g) => g.id === activeGame)
  const GameComponent = game?.component

  useEffect(() => {
    document.title = activeGame ? `${game?.name} — Card Academy` : 'Card Academy — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [activeGame, game?.name])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a0a1e 0%, #0f1635 50%, #0a0a1e 100%)',
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
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #1d6fa4, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          🃏
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.5, color: '#fff' }}>STEM Card Academy</div>
          <div style={{ fontSize: 12, color: '#7070aa', letterSpacing: 1 }}>LEARN SCIENCE & MATH THROUGH PLAY</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {activeGame && (
            <button onClick={() => setActiveGame(null)} style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
              color: '#a0c0ff', cursor: 'pointer', padding: '8px 14px', fontSize: 13, fontWeight: 600,
            }}>
              ← Menu
            </button>
          )}
          <Link to="/games" style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, color: '#a0c0ff', textDecoration: 'none',
            padding: '8px 14px', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
          }}>
            ← Games
          </Link>
        </div>
      </div>

      {!activeGame ? (
        // GAME MENU
        <div style={{ padding: '32px 24px', maxWidth: 860, margin: '0 auto' }}>
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Choose Your Game</div>
            <div style={{ color: '#7070aa', fontSize: 15 }}>Each game teaches real STEM concepts while you play</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {CARD_GAMES.map((g) => (
              <div
                key={g.id}
                onClick={() => setActiveGame(g.id)}
                style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: '22px 20px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = g.color; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>{g.emoji}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{g.name}</div>
                <div style={{ display: 'inline-block', background: g.color + '33', border: `1px solid ${g.color}66`, borderRadius: 6, padding: '3px 10px', fontSize: 11, color: g.color, fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }}>
                  {g.stem}
                </div>
                <div style={{ color: '#8080aa', fontSize: 13, lineHeight: 1.5 }}>{g.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', padding: '20px 24px' }}>
            <div style={{ color: '#ffd700', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>🎓 STEM Concepts Covered</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
              {['Probability Theory', 'Expected Value', 'Conditional Probability', 'Bayesian Reasoning', 'Statistics', "Gambler's Ruin", 'Neural Processing', 'Pattern Recognition', 'Combinatorics', 'Sampling Theory'].map((t) => (
                <div key={t} style={{ color: '#a0c0ff', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#4dff91' }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // ACTIVE GAME
        <div style={{ padding: '20px 24px', maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 28 }}>{game.emoji}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{game.name}</div>
              <div style={{ display: 'inline-block', background: game.color + '33', border: `1px solid ${game.color}66`, borderRadius: 6, padding: '2px 10px', fontSize: 11, color: game.color, fontWeight: 700 }}>
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
