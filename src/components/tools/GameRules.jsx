import { useState, useRef } from "react";

/* ─────────────────────────────────────────────
   CARD + DICE SVG COMPONENTS
───────────────────────────────────────────── */
const SUIT_SYMBOLS = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RED_SUITS = new Set(["H", "D"]);

function PlayingCard({ rank = "A", suit = "S", faceDown = false }) {
  const isRed = RED_SUITS.has(suit);
  const sym = SUIT_SYMBOLS[suit] || suit;
  if (faceDown) {
    return (
      <svg width="80" height="112" viewBox="0 0 80 112" style={{ filter: "drop-shadow(2px 3px 6px rgba(0,0,0,0.5))", flexShrink: 0 }}>
        <defs>
          <pattern id="backpat" patternUnits="userSpaceOnUse" width="10" height="10">
            <rect width="10" height="10" fill="#1a3a6e" />
            <path d="M0 0L10 10M10 0L0 10" stroke="#2855a0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="2" y="2" width="76" height="108" rx="8" fill="url(#backpat)" stroke="#c0a840" strokeWidth="2" />
        <rect x="6" y="6" width="68" height="100" rx="5" fill="none" stroke="#c0a840" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg width="80" height="112" viewBox="0 0 80 112" style={{ filter: "drop-shadow(2px 3px 6px rgba(0,0,0,0.5))", flexShrink: 0 }}>
      <rect x="2" y="2" width="76" height="108" rx="8" fill="#fffef5" stroke="#c8b060" strokeWidth="1.5" />
      <text x="8" y="22" fontSize="15" fontFamily="Georgia,serif" fontWeight="bold" fill={isRed ? "#c0131a" : "#0f1014"}>{rank}</text>
      <text x="8" y="36" fontSize="13" fontFamily="Georgia,serif" fill={isRed ? "#c0131a" : "#0f1014"}>{sym}</text>
      <text x="40" y="64" fontSize="30" fontFamily="Georgia,serif" fill={isRed ? "#c0131a" : "#0f1014"} textAnchor="middle" dominantBaseline="middle">{sym}</text>
      <text x="72" y="95" fontSize="15" fontFamily="Georgia,serif" fontWeight="bold" fill={isRed ? "#c0131a" : "#0f1014"} textAnchor="middle" transform="rotate(180,72,95)">{rank}</text>
    </svg>
  );
}

function DieComponent({ value, size = 64 }) {
  const pips = {
    1: [[.5,.5]],
    2: [[.28,.28],[.72,.72]],
    3: [[.28,.28],[.5,.5],[.72,.72]],
    4: [[.28,.28],[.72,.28],[.28,.72],[.72,.72]],
    5: [[.28,.28],[.72,.28],[.5,.5],[.28,.72],[.72,.72]],
    6: [[.28,.22],[.72,.22],[.28,.5],[.72,.5],[.28,.78],[.72,.78]],
  }[value] || [];
  const r = size * 0.075;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "drop-shadow(2px 3px 5px rgba(0,0,0,0.5))", flexShrink: 0 }}>
      <rect x="3" y="3" width={size-6} height={size-6} rx={size*0.15} fill="#fffef5" stroke="#c8b060" strokeWidth="1.5" />
      {pips.map(([cx,cy],i) => <circle key={i} cx={cx*size} cy={cy*size} r={r} fill="#1a1a1a" />)}
    </svg>
  );
}

function Chip({ color="red", label="5" }) {
  const C = { white:["#f0f0f0","#aaa","#222"], red:["#d32f2f","#8b0000","#fff"], blue:["#1565c0","#003c8f","#fff"], green:["#2e7d32","#1b5e20","#fff"], black:["#212121","#000","#fff"], purple:["#6a1b9a","#38006b","#fff"], yellow:["#f9a825","#c17900","#222"] };
  const [fill,stroke,text] = C[color]||C.red;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" style={{ filter: "drop-shadow(1px 2px 4px rgba(0,0,0,0.5))", flexShrink: 0 }}>
      <circle cx="24" cy="24" r="22" fill={fill} stroke={stroke} strokeWidth="2" />
      <circle cx="24" cy="24" r="16" fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="24" y="29" textAnchor="middle" fontSize="12" fontWeight="bold" fontFamily="Georgia,serif" fill={text}>{label}</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   SHARED UI PIECES
───────────────────────────────────────────── */
const G = "#c8a940"; // gold
const FELT = "#1a5c38";
const DARK = "#0f1e0f";

function TableWrap({ children, style={} }) {
  return (
    <div style={{ background: FELT, borderRadius: 18, padding: "28px 24px", border: `5px solid #3d2b1f`, boxShadow: "inset 0 2px 12px rgba(0,0,0,0.4)", ...style }}>
      {children}
    </div>
  );
}

function TableLabel({ children }) {
  return <div style={{ textAlign:"center", color:G, fontFamily:"Georgia,serif", fontSize:10, letterSpacing:2.5, marginBottom:14, opacity:.85 }}>{children}</div>;
}

function CardRow({ cards, label, score }) {
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <TableLabel>{label}{score != null ? ` — ${score}` : ""}</TableLabel>}
      <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
        {cards.map((c,i) => <PlayingCard key={i} rank={c.rank} suit={c.suit} faceDown={c.faceDown} />)}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height:1, background:"rgba(200,169,64,.25)", margin:"16px 0" }} />;
}

/* ─────────────────────────────────────────────
   TABLE VISUALS
───────────────────────────────────────────── */
function BlackjackVisual() {
  return (
    <TableWrap>
      <CardRow label="DEALER" cards={[{rank:"7",suit:"D"},{faceDown:true}]} />
      <Divider />
      <CardRow label="PLAYER — BLACKJACK!" score={21} cards={[{rank:"A",suit:"S"},{rank:"K",suit:"H"}]} />
      <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:14 }}>
        <Chip color="green" label="25" /><Chip color="black" label="100" />
      </div>
    </TableWrap>
  );
}

function PokerVisual() {
  return (
    <TableWrap>
      <CardRow label="COMMUNITY CARDS" cards={[{rank:"A",suit:"C"},{rank:"K",suit:"D"},{rank:"7",suit:"H"},{faceDown:true},{faceDown:true}]} />
      <div style={{ textAlign:"center", marginTop:10, marginBottom:10 }}>
        <div style={{ display:"inline-flex", gap:8 }}><Chip color="red" label="5"/><Chip color="blue" label="25"/><Chip color="green" label="25"/></div>
        <div style={{ color:G, fontSize:12, opacity:.8, fontFamily:"Georgia,serif", marginTop:4 }}>Pot: $180</div>
      </div>
      <Divider />
      <CardRow label="YOUR HOLE CARDS" cards={[{rank:"A",suit:"H"},{rank:"A",suit:"D"}]} />
    </TableWrap>
  );
}

function RouletteVisual() {
  const rows = [[3,6,9,12,15,18,21,24,27,30,33,36],[2,5,8,11,14,17,20,23,26,29,32,35],[1,4,7,10,13,16,19,22,25,28,31,34]];
  const reds = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
  return (
    <TableWrap style={{ padding:"20px 14px" }}>
      <div style={{ overflowX:"auto" }}>
        <div style={{ minWidth:520 }}>
          <div style={{ display:"grid", gridTemplateColumns:"36px repeat(12, 1fr) 36px", gap:3, marginBottom:4 }}>
            <div style={{ background:"#198754", borderRadius:5, display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"bold",fontSize:13,fontFamily:"Georgia,serif",gridRow:"1/4",padding:"4px 2px" }}>0</div>
            {rows.map((row,ri) => row.map(n => (
              <div key={n} style={{ background:reds.has(n)?"#c0131a":"#1a1a1a", borderRadius:3, color:"white", textAlign:"center", fontSize:10, fontFamily:"Georgia,serif", fontWeight:"bold", padding:"5px 0" }}>{n}</div>
            )))}
            <div style={{ background:"#198754", borderRadius:5, display:"flex",flexDirection:"column",justifyContent:"space-around",alignItems:"center",color:"white",fontSize:9,gridRow:"1/4",padding:"4px 2px",gap:2 }}>
              <span>2:1</span><span>2:1</span><span>2:1</span>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"36px repeat(3, 1fr) 36px", gap:3, marginBottom:3 }}>
            <div/>{["1st 12","2nd 12","3rd 12"].map(d=>(
              <div key={d} style={{ background:"#1d8a4c",borderRadius:3,color:G,textAlign:"center",fontSize:10,fontFamily:"Georgia,serif",padding:"5px 0",border:"1px solid rgba(200,169,64,.3)" }}>{d}</div>
            ))}<div/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"36px repeat(6, 1fr) 36px", gap:3 }}>
            <div/>{["1-18","Even","Red","Black","Odd","19-36"].map((b,i)=>(
              <div key={b} style={{ background:i===2?"#c0131a":i===3?"#1a1a1a":"#1d8a4c",borderRadius:3,color:G,textAlign:"center",fontSize:10,fontFamily:"Georgia,serif",padding:"5px 0",border:"1px solid rgba(200,169,64,.3)" }}>{b}</div>
            ))}<div/>
          </div>
        </div>
      </div>
    </TableWrap>
  );
}

function CrapsVisual() {
  return (
    <TableWrap>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8 }}>
        {["Don't Pass Bar","Pass Line"].map(b=>(
          <div key={b} style={{ background:"#1d8a4c",border:"1px solid rgba(200,169,64,.35)",borderRadius:6,color:G,textAlign:"center",fontSize:11,fontFamily:"Georgia,serif",padding:"8px 4px" }}>{b}</div>
        ))}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:8 }}>
        {[4,5,6,8,9,10].map(n=>(
          <div key={n} style={{ background:"#164d2e",border:"1px solid rgba(200,169,64,.25)",borderRadius:6,color:G,textAlign:"center",fontFamily:"Georgia,serif",fontWeight:"bold",fontSize:18,padding:"10px 0" }}>{n}</div>
        ))}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:16 }}>
        {["Come","Field","Don't Come"].map(b=>(
          <div key={b} style={{ background:"#1d8a4c",border:"1px solid rgba(200,169,64,.3)",borderRadius:6,color:G,textAlign:"center",fontSize:10,fontFamily:"Georgia,serif",padding:"7px 4px" }}>{b}</div>
        ))}
      </div>
      <div style={{ display:"flex",justifyContent:"center",gap:24 }}>
        <DieComponent value={5}/><DieComponent value={3}/>
      </div>
      <div style={{ textAlign:"center",color:G,fontSize:12,fontFamily:"Georgia,serif",marginTop:10,opacity:.9 }}>Point: 8</div>
    </TableWrap>
  );
}

function BaccaratVisual() {
  return (
    <TableWrap>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:16 }}>
        <CardRow label="PLAYER — 7" cards={[{rank:"5",suit:"H"},{rank:"2",suit:"C"}]} />
        <CardRow label="BANKER — 6" cards={[{rank:"3",suit:"S"},{rank:"3",suit:"D"}]} />
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
        {[["Player","1.24%","#1d8a4c"],["Tie","14.4%","#6d2e1a"],["Banker","1.06%","#1d8a4c"]].map(([l,e,bg])=>(
          <div key={l} style={{ background:bg,borderRadius:6,border:"1px solid rgba(200,169,64,.3)",color:G,textAlign:"center",fontFamily:"Georgia,serif",padding:"8px 4px" }}>
            <div style={{ fontSize:12,fontWeight:"bold" }}>{l}</div>
            <div style={{ fontSize:9,opacity:.7 }}>HE: {e}</div>
          </div>
        ))}
      </div>
    </TableWrap>
  );
}

function ThreeCardVisual() {
  return (
    <TableWrap>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:12 }}>
        <CardRow label="DEALER" cards={[{rank:"Q",suit:"S"},{rank:"8",suit:"H"},{rank:"4",suit:"C"}]} />
        <CardRow label="PLAYER — FLUSH" cards={[{rank:"A",suit:"D"},{rank:"K",suit:"D"},{rank:"J",suit:"D"}]} />
      </div>
      <div style={{ background:"rgba(200,169,64,.12)",border:"1px solid rgba(200,169,64,.3)",borderRadius:8,padding:"10px",textAlign:"center" }}>
        <div style={{ color:G,fontFamily:"Georgia,serif",fontSize:13,fontWeight:"bold" }}>Player wins! Pair Plus pays 3:1</div>
      </div>
    </TableWrap>
  );
}

function SolitaireVisual() {
  const foundations = [{rank:"A",suit:"S"},{rank:"A",suit:"H"},{rank:"A",suit:"D"},{rank:"A",suit:"C"}];
  return (
    <TableWrap>
      <TableLabel>FOUNDATION PILES (build Ace → King)</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:12,marginBottom:16 }}>
        {foundations.map((c,i)=><PlayingCard key={i} rank={c.rank} suit={c.suit}/>)}
      </div>
      <Divider/>
      <TableLabel>TABLEAU (alternating colors, descending rank)</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:10 }}>
        <PlayingCard rank="K" suit="S"/>
        <PlayingCard rank="Q" suit="H"/>
        <PlayingCard rank="J" suit="C"/>
        <PlayingCard faceDown/>
      </div>
    </TableWrap>
  );
}

function YahtzeeVisual() {
  return (
    <TableWrap>
      <TableLabel>FULL HOUSE — 3+2</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:12,marginBottom:16 }}>
        <DieComponent value={5}/><DieComponent value={5}/><DieComponent value={5}/>
        <DieComponent value={3}/><DieComponent value={3}/>
      </div>
      <Divider/>
      <TableLabel>KEEP ALL — SCORE 25 PTS</TableLabel>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6 }}>
        {["Ones","Twos","Threes","Fours","Fives","Sixes"].map(s=>(
          <div key={s} style={{ background:"#164d2e",border:"1px solid rgba(200,169,64,.25)",borderRadius:5,color:G,textAlign:"center",fontSize:10,fontFamily:"Georgia,serif",padding:"5px 0" }}>{s}</div>
        ))}
      </div>
    </TableWrap>
  );
}

function FarkleVisual() {
  return (
    <TableWrap>
      <TableLabel>SIX-DICE ROLL</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap",marginBottom:16 }}>
        {[1,5,3,3,2,4].map((v,i)=><DieComponent key={i} value={v}/>)}
      </div>
      <Divider/>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
        {[["1 = 100 pts","keep"],["5 = 50 pts","keep"],["Three 3s = 300","keep? bank?"],["2,4 = 0 pts","cannot keep"]].map(([l,s])=>(
          <div key={l} style={{ background:"rgba(200,169,64,.08)",border:"1px solid rgba(200,169,64,.2)",borderRadius:6,padding:"8px 10px" }}>
            <div style={{ color:G,fontSize:11,fontFamily:"Georgia,serif",fontWeight:"bold" }}>{l}</div>
            <div style={{ color:"#8a7a55",fontSize:10,fontFamily:"Georgia,serif" }}>{s}</div>
          </div>
        ))}
      </div>
    </TableWrap>
  );
}

function RummyVisual() {
  return (
    <TableWrap>
      <TableLabel>YOUR HAND</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap",marginBottom:16 }}>
        <PlayingCard rank="3" suit="H"/><PlayingCard rank="4" suit="H"/><PlayingCard rank="5" suit="H"/>
        <PlayingCard rank="7" suit="S"/><PlayingCard rank="7" suit="D"/><PlayingCard rank="7" suit="C"/>
        <PlayingCard rank="K" suit="S"/>
      </div>
      <Divider/>
      <div style={{ display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:8 }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:"#1d8a4c",fontSize:10,fontFamily:"Georgia,serif",letterSpacing:1,marginBottom:6 }}>SEQUENCE (RUN)</div>
          <div style={{ display:"flex",gap:6 }}><PlayingCard rank="3" suit="H"/><PlayingCard rank="4" suit="H"/><PlayingCard rank="5" suit="H"/></div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:"#c8a940",fontSize:10,fontFamily:"Georgia,serif",letterSpacing:1,marginBottom:6 }}>SET (GROUP)</div>
          <div style={{ display:"flex",gap:6 }}><PlayingCard rank="7" suit="S"/><PlayingCard rank="7" suit="D"/><PlayingCard rank="7" suit="C"/></div>
        </div>
      </div>
    </TableWrap>
  );
}

function GenericCardVisual({ cards }) {
  return (
    <TableWrap>
      <TableLabel>EXAMPLE HAND</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap" }}>
        {cards.map((c,i)=><PlayingCard key={i} rank={c.rank} suit={c.suit} faceDown={c.faceDown}/>)}
      </div>
    </TableWrap>
  );
}

function GenericDiceVisual({ dice }) {
  return (
    <TableWrap>
      <TableLabel>DICE ROLL</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap" }}>
        {dice.map((v,i)=><DieComponent key={i} value={v}/>)}
      </div>
    </TableWrap>
  );
}

function GameVisual({ game }) {
  const map = {
    blackjack: <BlackjackVisual/>,
    poker_texas: <PokerVisual/>,
    roulette: <RouletteVisual/>,
    craps: <CrapsVisual/>,
    baccarat: <BaccaratVisual/>,
    three_card_poker: <ThreeCardVisual/>,
    solitaire: <SolitaireVisual/>,
    yahtzee: <YahtzeeVisual/>,
    farkle: <FarkleVisual/>,
    rummy: <RummyVisual/>,
    gin_rummy: <RummyVisual/>,
  };
  if (map[game.id]) return map[game.id];
  if (game.visualCards) return <GenericCardVisual cards={game.visualCards}/>;
  if (game.visualDice) return <GenericDiceVisual dice={game.visualDice}/>;
  return null;
}

/* ─────────────────────────────────────────────
   GAME DATA
───────────────────────────────────────────── */
const GAMES = [
  /* ── CASINO CARD GAMES ── */
  {
    id:"blackjack", name:"Blackjack", emoji:"🃏", category:"Casino — Cards",
    players:"1–7 vs. Dealer", difficulty:"Easy", type:"card",
    tagline:"Beat the dealer without going over 21.",
    overview:"Blackjack is the most popular casino card game in the world. You play against the dealer — not other players. Get a hand value closer to 21 than the dealer without exceeding it (\"busting\"). A two-card total of 21 — an Ace plus any 10-value card — is a \"Blackjack\" and pays 3:2.",
    terminology:[
      {term:"Hit",def:"Draw another card from the dealer."},
      {term:"Stand",def:"Keep your current hand and end your turn."},
      {term:"Bust",def:"Exceed 21 — you lose immediately."},
      {term:"Blackjack",def:"Ace + 10-value card on the first two cards. Pays 3:2."},
      {term:"Double Down",def:"Double your bet and receive exactly one more card."},
      {term:"Split",def:"When dealt two equal-value cards, split them into two separate hands."},
      {term:"Soft Hand",def:"A hand containing an Ace counted as 11 (e.g., Ace+6 = Soft 17)."},
      {term:"Push",def:"A tie with the dealer — your bet is returned."},
      {term:"Surrender",def:"Fold your hand, losing only half your bet (if the casino allows it)."},
    ],
    setup:["Shuffle a standard 52-card deck (casinos often use 4–8 decks).","Each player places their bet in the designated betting circle.","Dealer gives every player two cards face-up.","Dealer receives two cards: one face-up (upcard), one face-down (hole card).","Card values: 2–10 = face value; J, Q, K = 10; Ace = 1 or 11."],
    howToPlay:["If the dealer's upcard is an Ace, players may buy Insurance (a 2:1 side bet against dealer Blackjack).","Players act left to right: Hit, Stand, Double Down, Split, or Surrender.","If you bust (exceed 21), you lose immediately regardless of what the dealer does.","After all players act, the dealer reveals their hole card.","Dealer must Hit on 16 or less, Stand on 17 or more.","If the dealer busts, all remaining players win."],
    strategy:["Always Stand on hard 17+. Always Hit on hard 8 or less.","Double Down on 11 (almost always), and on 10 unless dealer shows 10 or Ace.","Always Split Aces and 8s. Never Split 10s or 5s.","Soft 17 or less: Hit. Soft 19+: Stand.","Assume the dealer's hole card is a 10 — it's the most common value.","Insurance is a bad bet unless you are counting cards."],
    mistakes:["Standing on 16 when dealer shows 7–Ace (usually Hit).","Never using Double Down — it's one of your biggest advantages.","Splitting 10s — a 20 is one of the best hands in the game.","Taking Insurance without counting cards."],
    payouts:[{bet:"Winning hand",pays:"1:1"},{bet:"Blackjack (natural)",pays:"3:2"},{bet:"Insurance (dealer has BJ)",pays:"2:1"},{bet:"Push (tie)",pays:"Returned"}],
  },
  {
    id:"poker_texas", name:"Texas Hold'em", emoji:"♠", category:"Casino — Cards",
    players:"2–10", difficulty:"Medium", type:"card",
    tagline:"Make the best 5-card hand using hole cards and community cards.",
    overview:"Texas Hold'em is the world's most popular poker variant. Each player receives two private hole cards, and five community cards are dealt face-up to the center. Players combine their hole cards with community cards to make the best possible five-card hand.",
    terminology:[
      {term:"Hole Cards",def:"Your two private cards dealt face-down."},
      {term:"Flop",def:"The first three community cards dealt face-up."},
      {term:"Turn",def:"The fourth community card."},
      {term:"River",def:"The fifth and final community card."},
      {term:"Blinds",def:"Forced bets posted by the two players left of the dealer button."},
      {term:"Check",def:"Pass the action without betting (only when no bet is open)."},
      {term:"All-In",def:"Bet all your remaining chips."},
      {term:"The Nuts",def:"The best possible hand given the community cards."},
    ],
    setup:["Standard 52-card deck.","Determine the dealer (Dealer Button).","Player left of dealer posts Small Blind; next player posts Big Blind.","Each player is dealt two hole cards face-down.","Action starts left of the Big Blind."],
    howToPlay:["Pre-Flop: Players Call, Raise, or Fold.","Flop: Three community cards revealed. Betting round left of dealer.","Turn: Fourth card revealed. Another betting round.","River: Fifth card revealed. Final betting round.","Showdown: Remaining players reveal hands. Best 5-card hand wins.","You may use 0, 1, or both hole cards with the community cards."],
    handRankings:[
      {rank:"Royal Flush",example:"A K Q J 10 suited",tier:1},
      {rank:"Straight Flush",example:"9 8 7 6 5 suited",tier:1},
      {rank:"Four of a Kind",example:"Q Q Q Q 3",tier:2},
      {rank:"Full House",example:"J J J 4 4",tier:2},
      {rank:"Flush",example:"A J 9 5 2 suited",tier:3},
      {rank:"Straight",example:"10 9 8 7 6",tier:3},
      {rank:"Three of a Kind",example:"7 7 7 K 2",tier:4},
      {rank:"Two Pair",example:"A A 8 8 Q",tier:4},
      {rank:"One Pair",example:"K K 7 4 2",tier:5},
      {rank:"High Card",example:"A J 8 5 2",tier:5},
    ],
    strategy:["Position is everything — acting last is a massive advantage.","Play tight in early position; loosen up on the button.","Tight-aggressive (TAG) is the most profitable beginner style.","Pot odds: if your cost to call is less than your equity, call.","Bluff selectively on boards that fit your story."],
    mistakes:["Playing too many hands pre-flop.","Calling when you should raise or fold.","Ignoring position — it's the most important factor in the game.","Overvaluing top pair on connected boards."],
    payouts:[{bet:"Win the pot",pays:"Entire pot"},{bet:"Side pot (all-in)",pays:"Proportional pot"}],
  },
  {
    id:"baccarat", name:"Baccarat", emoji:"👑", category:"Casino — Cards",
    players:"1–14 vs. Dealer", difficulty:"Easy", type:"card",
    tagline:"The simplest casino game — just pick Player or Banker.",
    overview:"Baccarat requires virtually no decisions — bet on Player, Banker, or Tie before the hand is dealt. Two hands are dealt and the hand closest to 9 wins. Ace = 1; 2–9 = face value; 10/J/Q/K = 0. Only the units digit counts (so 15 = 5).",
    terminology:[
      {term:"Player",def:"One of the two hands dealt — a betting option, not your hand."},
      {term:"Banker",def:"The other hand — a betting option, not the house."},
      {term:"Natural",def:"A two-card total of 8 or 9. No more cards are drawn."},
      {term:"Tie",def:"Both hands have the same total. Pays 8:1 but poor odds."},
      {term:"Commission",def:"Banker wins typically carry a 5% commission to offset Banker's edge."},
    ],
    setup:["6–8 decks in a shoe.","Players bet on Player, Banker, or Tie.","Two cards dealt to both Player and Banker hands."],
    howToPlay:["If either hand totals 8 or 9 (Natural), the game ends immediately.","Player draws a third card if their total is 0–5; stands on 6–7.","Banker's draw depends on their total and the Player's third card — handled automatically.","Hand closest to 9 wins."],
    strategy:["Always bet Banker — 1.06% house edge after commission.","Player bet is 1.24% house edge — also excellent.","Never bet Tie — 14.4% house edge.","Avoid all side bets. Scorecards don't predict future hands."],
    mistakes:["Betting Tie for the 8:1 payout — terrible expected value.","Following bead plates as if they predict future outcomes.","Ignoring the 5% commission when planning bets."],
    payouts:[{bet:"Player wins",pays:"1:1"},{bet:"Banker wins",pays:"1:1 minus 5%"},{bet:"Tie",pays:"8:1"}],
  },
  {
    id:"three_card_poker", name:"Three Card Poker", emoji:"♦", category:"Casino — Cards",
    players:"1–7 vs. Dealer", difficulty:"Easy", type:"card",
    tagline:"Fast poker against the dealer using only three cards.",
    overview:"Three Card Poker combines casino simplicity with poker hand rankings. You receive three cards and choose to play or fold. The Pair Plus side bet pays regardless of the dealer's hand.",
    terminology:[
      {term:"Ante",def:"The mandatory bet to see your three cards."},
      {term:"Play",def:"A second bet equal to the Ante — you must make this or fold."},
      {term:"Fold",def:"Surrender your Ante and sit out the hand."},
      {term:"Pair Plus",def:"Side bet paying if you hold a pair or better."},
      {term:"Dealer Qualifies",def:"Dealer needs Queen-high or better to compete against your Play bet."},
    ],
    setup:["Standard 52-card deck.","Place an Ante bet and optional Pair Plus side bet.","Each player and the dealer receive three cards face-down."],
    howToPlay:["Look at your cards. Place a Play bet equal to your Ante, or fold.","If dealer doesn't qualify (below Queen-high): Ante pays 1:1; Play pushes.","If dealer qualifies and you win: Ante and Play both pay 1:1.","If dealer qualifies and you lose: Both bets are lost.","Pair Plus and Ante Bonus pay independently of dealer's hand."],
    handRankings:[
      {rank:"Straight Flush",example:"Q J 10 suited",tier:1},
      {rank:"Three of a Kind",example:"8 8 8",tier:1},
      {rank:"Straight",example:"9 8 7 offsuit",tier:2},
      {rank:"Flush",example:"K 7 3 suited",tier:2},
      {rank:"Pair",example:"J J 4",tier:3},
      {rank:"High Card",example:"A 8 4",tier:4},
    ],
    strategy:["Play any hand Queen-6-4 or higher. Fold anything worse.","The Pair Plus side bet has ~3.4% house edge — reasonable.","Never fold a pair or better."],
    mistakes:["Playing hands below Q-6-4.","Overlooking the Ante Bonus — it pays even if you lose to the dealer."],
    payouts:[{bet:"Ante/Play win",pays:"1:1"},{bet:"Pair Plus — Pair",pays:"1:1"},{bet:"Pair Plus — Flush",pays:"3:1"},{bet:"Pair Plus — Straight",pays:"6:1"},{bet:"Pair Plus — Three of a Kind",pays:"30:1"},{bet:"Pair Plus — Straight Flush",pays:"40:1"}],
  },
  /* ── CASINO TABLE GAMES ── */
  {
    id:"roulette", name:"Roulette", emoji:"🎡", category:"Casino — Table",
    players:"1–8", difficulty:"Easy", type:"table",
    tagline:"Bet on where the ball lands on the spinning wheel.",
    overview:"A croupier spins a wheel and drops a ball in the opposite direction. The ball lands in a numbered pocket — 0–36 (plus 00 in American). You bet before the spin on which number, color, or group of numbers will win. Always choose European (single zero) for better odds.",
    terminology:[
      {term:"Inside Bets",def:"Bets placed directly on numbers — higher risk, higher reward."},
      {term:"Outside Bets",def:"Bets on groups of numbers (Red/Black, Odd/Even) — lower risk."},
      {term:"Straight Up",def:"Bet on a single number. Pays 35:1."},
      {term:"Split",def:"Bet on two adjacent numbers. Pays 17:1."},
      {term:"Street",def:"Bet on three numbers in a row. Pays 11:1."},
      {term:"Corner",def:"Bet on four numbers sharing a corner. Pays 8:1."},
      {term:"En Prison",def:"European rule: ball lands on 0, even-money bets held for one more spin."},
    ],
    setup:["Buy colored chips at the table (each player gets a unique color).","Place bets on the layout before the dealer calls \"No more bets.\"","The croupier spins the wheel and releases the ball."],
    howToPlay:["You can place multiple bets simultaneously.","Outside bets (Red/Black, Odd/Even, 1–18/19–36) pay 1:1.","Dozen and Column bets cover 12 numbers each and pay 2:1.","Inside bets on individual numbers pay up to 35:1.","After the ball lands, winning bets are paid and losing bets are collected."],
    strategy:["Always play European roulette — 2.7% house edge vs. 5.26% American.","Even-money bets with En Prison or La Partage cut house edge to 1.35%.","No betting system (Martingale etc.) overcomes the house edge long-term.","Flat betting same amount each spin extends your session most effectively."],
    mistakes:["Playing American roulette when European is available.","Believing the Gambler's Fallacy — past results don't influence future spins.","Using Martingale — table limits will eventually stop you."],
    payouts:[{bet:"Straight Up (1 number)",pays:"35:1"},{bet:"Split (2 numbers)",pays:"17:1"},{bet:"Street (3 numbers)",pays:"11:1"},{bet:"Corner (4 numbers)",pays:"8:1"},{bet:"Line (6 numbers)",pays:"5:1"},{bet:"Dozen / Column",pays:"2:1"},{bet:"Red/Black, Odd/Even, 1–18",pays:"1:1"}],
  },
  {
    id:"craps", name:"Craps", emoji:"🎲", category:"Casino — Dice",
    players:"1–20", difficulty:"Medium", type:"dice",
    tagline:"The most social and exciting table in the casino.",
    overview:"Players take turns rolling two dice (the \"shooter\"). Everyone bets on the outcome. Complex-looking layout, but you only need to understand Pass Line and Free Odds to play very well.",
    terminology:[
      {term:"Come-Out Roll",def:"The first roll of a new round."},
      {term:"Point",def:"If the come-out roll is 4,5,6,8,9,10 that number becomes the Point."},
      {term:"Seven Out",def:"Rolling a 7 after a Point is set — Pass Line loses; dice pass."},
      {term:"Pass Line",def:"Fundamental bet. Wins on 7/11 come-out; loses on 2,3,12."},
      {term:"Free Odds",def:"A bet behind the Pass Line with ZERO house edge."},
      {term:"Come Bet",def:"Like a Pass Line bet but placed after the Point is established."},
    ],
    setup:["Players place chips on the layout.","Shooter selects two dice.","Dice must hit the far wall of the table on each roll."],
    howToPlay:["Come-Out: 7 or 11 = Pass Line wins. 2, 3, or 12 = Pass Line loses.","Any other number (4,5,6,8,9,10) becomes the Point.","Shooter keeps rolling. Hit the Point again = Pass Line wins. Roll a 7 = Pass Line loses.","After the Point is set, take Free Odds: place chips directly behind your Pass Line bet.","Come Bets work like mini-Pass Lines for any subsequent roll."],
    strategy:["Pass Line + maximum Free Odds: house edge under 0.5%.","Place 6 and 8 are the next-best bets — 1.52% house edge.","Avoid center bets (Hardways, Any Seven, Big 6/8) — house edges 9–16%."],
    mistakes:["Not taking Free Odds — it's the only zero-edge bet in the casino.","Betting Field or Any Seven — looks tempting, terrible value.","Betting Hardways as a primary strategy."],
    payouts:[{bet:"Pass / Come",pays:"1:1"},{bet:"Free Odds on 4 or 10",pays:"2:1"},{bet:"Free Odds on 5 or 9",pays:"3:2"},{bet:"Free Odds on 6 or 8",pays:"6:5"},{bet:"Place 6 or 8",pays:"7:6"},{bet:"Place 5 or 9",pays:"7:5"}],
    visualDice:[5,3],
  },
  /* ── CLASSIC CARD GAMES ── */
  {
    id:"rummy", name:"Rummy", emoji:"🎴", category:"Classic — Cards",
    players:"2–6", difficulty:"Easy", type:"card",
    tagline:"Form sets and sequences to meld all your cards first.",
    overview:"Rummy is one of the most widely played card games in the world. The objective is to arrange all cards in your hand into valid combinations — either Sets (three or more cards of the same rank) or Sequences/Runs (three or more consecutive cards of the same suit) — and then \"go out\" by discarding your final card.",
    terminology:[
      {term:"Meld",def:"A valid combination of cards laid face-up: a Set or a Sequence."},
      {term:"Set (Group)",def:"Three or four cards of the same rank (e.g., 7♠ 7♥ 7♦)."},
      {term:"Sequence (Run)",def:"Three or more consecutive cards of the same suit (e.g., 4♥ 5♥ 6♥)."},
      {term:"Deadwood",def:"Unmelded cards remaining in your hand — each counts against your score."},
      {term:"Discard Pile",def:"Face-up pile that players may draw from instead of the stock."},
      {term:"Stock",def:"The face-down draw pile."},
      {term:"Going Out",def:"Melding your remaining cards and discarding your final card to end the round."},
      {term:"Knock",def:"Ending the round even with some unmatched deadwood (variant rule)."},
    ],
    setup:["Standard 52-card deck. 2 players: deal 10 cards each. 3–4 players: 7 cards. 5–6 players: 6 cards.","Place remaining cards face-down as the stock.","Turn the top card face-up beside the stock to start the discard pile.","Youngest player goes first (or cut for high card)."],
    howToPlay:["On your turn: draw the top card from the stock OR the top card from the discard pile.","Optionally lay down any valid melds face-up on the table.","Optionally add cards to existing melds (your own or other players').","Discard one card face-up to end your turn.","First player to meld all cards and discard wins the round.","Remaining players score penalty points equal to their deadwood (face cards = 10; Ace = 1)."],
    strategy:["Watch the discard pile — it reveals what opponents are building.","Don't draw from the discard pile unless it completes a meld.","Hold on to high-value cards (face cards) only if they're nearly melded.","Going out quickly, even with small deadwood in some variants, prevents opponents from building.","Flexible cards (middle-rank cards like 6, 7, 8) can form melds in more directions."],
    mistakes:["Drawing from the discard pile too liberally — you're showing opponents what you need.","Hoarding high-value unmatched cards — they hurt your score when someone goes out.","Forgetting you can add cards to other players' existing melds."],
    payouts:[{bet:"Winner",pays:"0 points"},{bet:"Loser penalty",pays:"Sum of deadwood"},{bet:"First to 100 pts loses",pays:"(or wins — varies by variant)"}],
    visualCards:[{rank:"3",suit:"H"},{rank:"4",suit:"H"},{rank:"5",suit:"H"},{rank:"7",suit:"S"},{rank:"7",suit:"D"},{rank:"7",suit:"C"},{rank:"K",suit:"S"}],
  },
  {
    id:"gin_rummy", name:"Gin Rummy", emoji:"🥃", category:"Classic — Cards",
    players:"2", difficulty:"Easy", type:"card",
    tagline:"Two-player Rummy with knocking and the special Gin bonus.",
    overview:"Gin Rummy is a two-player refinement of Rummy. Players are dealt 10 cards and race to form melds. The key difference: you can \"knock\" to end the round even with some unmatched deadwood, or go \"Gin\" by melding every single card for a bonus.",
    terminology:[
      {term:"Gin",def:"Melding all 10 cards with zero deadwood. Earns a 25-point bonus."},
      {term:"Knock",def:"Ending the round with 10 or fewer points of deadwood."},
      {term:"Undercut",def:"If the non-knocker's deadwood is ≤ the knocker's, non-knocker wins and gets a 25-pt bonus."},
      {term:"Layoff",def:"After a knock, the non-knocker may add their unmatched cards to the knocker's melds."},
      {term:"Deadwood",def:"Unmelded cards in your hand — Ace=1, face cards=10, numbered=face value."},
    ],
    setup:["Standard 52-card deck; Aces are low.","Deal 10 cards to each player.","Place remaining cards as the stock. Turn one card up to start discard pile.","The non-dealer may take the upcard; if they decline, dealer may take it. If both decline, non-dealer draws from stock and play begins."],
    howToPlay:["Draw one card (stock or discard). Form melds in your hand. Discard one card.","When your deadwood is 10 or less, you may Knock by discarding face-down.","After a Knock: both players reveal hands. Non-knocker may lay off cards onto knocker's melds.","Score = knocker's deadwood minus non-knocker's remaining deadwood.","If knocker wins: they score the difference. If non-knocker ties or beats knocker: undercut! Non-knocker scores difference plus 25-pt bonus.","Gin (zero deadwood): score opponent's deadwood plus 25-pt bonus.","Game ends when a player reaches 100 points. Line bonus (+25) and box bonuses are added."],
    strategy:["Aim for Gin when you're close — the 25-point bonus is significant.","Knock early with low deadwood rather than risking an undercut.","Watch the discard pile carefully — if you see your opponent drawing specific suits or ranks, stop discarding those.","A 10-point knock is only worth it if your opponent has high deadwood.","Middle-rank cards (5,6,7,8) are the most versatile for melds."],
    mistakes:["Knocking with too much deadwood — opponent may undercut you.","Drawing from the discard pile when it reveals your meld strategy.","Discarding without thinking about what your opponent needs."],
    payouts:[{bet:"Knock win",pays:"Deadwood difference"},{bet:"Gin",pays:"Opponent deadwood + 25 bonus"},{bet:"Undercut",pays:"Difference + 25 bonus to non-knocker"},{bet:"Game win (100 pts)",pays:"+25 line bonus"}],
    visualCards:[{rank:"J",suit:"D"},{rank:"Q",suit:"D"},{rank:"K",suit:"D"},{rank:"7",suit:"H"},{rank:"7",suit:"S"},{rank:"7",suit:"C"},{rank:"4",suit:"S"},{rank:"9",suit:"H"},{rank:"2",suit:"C"},{rank:"A",suit:"S"}],
  },
  {
    id:"crazy_eights", name:"Crazy Eights", emoji:"8️⃣", category:"Classic — Cards",
    players:"2–5", difficulty:"Easy", type:"card",
    tagline:"Be the first to empty your hand by matching suit or rank.",
    overview:"Crazy Eights is one of the most popular shedding card games and the direct ancestor of Uno. Match the top card of the discard pile by suit or rank, or play an Eight (wild card) to change the suit. First to empty their hand wins.",
    terminology:[
      {term:"Wild Card",def:"An Eight — can be played on anything, and lets you call a new suit."},
      {term:"Skip / Draw",def:"Certain cards cause the next player to skip a turn or draw cards (variant rules)."},
      {term:"Knocking",def:"Some variants let you knock if you can't play, instead of drawing."},
    ],
    setup:["Standard 52-card deck.","Deal 5 cards to each player (7 cards for 2-player).","Place remaining cards face-down as the draw pile.","Turn the top card face-up to start the discard pile. If it's an Eight, bury it and flip another."],
    howToPlay:["On your turn, play a card that matches the top discard's suit OR rank.","If you play an Eight, announce the new suit that must be followed.","If you cannot play, draw from the stock until you can play (or draw 1 in some variants).","In standard rules: 2 = next player draws 2; Q = skip; A = reverse direction (4+ players).","First player to play all their cards wins.","Other players score the cards remaining in their hands (Eights = 50, face cards = 10, numbered = face value)."],
    strategy:["Save Eights for emergencies — when you're stuck and need a lifeline.","Change suit to one where opponents are likely to get stuck.","Pay attention to what suit opponents are holding based on their draws.","Try to empty your hand of one suit to open up plays."],
    mistakes:["Playing Eights too early just because you can.","Ignoring what suit opponents might need."],
    payouts:[{bet:"Winner",pays:"0 points"},{bet:"8",pays:"50 points against"},{bet:"Face card",pays:"10 points against"},{bet:"Numbered card",pays:"Face value against"}],
    visualCards:[{rank:"8",suit:"H"},{rank:"Q",suit:"H"},{rank:"Q",suit:"S"},{rank:"Q",suit:"D"},{rank:"3",suit:"C"}],
  },
  {
    id:"go_fish", name:"Go Fish", emoji:"🐠", category:"Classic — Cards",
    players:"2–6", difficulty:"Easy", type:"card",
    tagline:"Ask opponents for cards to collect the most four-of-a-kind sets.",
    overview:"Go Fish is a classic and simple card game, especially beloved by younger players. Collect sets of four cards of the same rank by asking opponents for specific cards. If they don't have it, they say \"Go Fish\" and you draw from the pond.",
    terminology:[
      {term:"Book",def:"A complete set of four cards of the same rank (all four 7s, all four Queens, etc.)."},
      {term:"Go Fish",def:"The response when an opponent asks for a card you don't have — they draw from the deck."},
      {term:"The Pond",def:"The face-down draw pile in the center of the table."},
    ],
    setup:["Standard 52-card deck.","Deal 7 cards to each player (5 cards if 4+ players).","Remaining cards go face-down in the center as the pond.","Sort your hand and check for any immediate Books."],
    howToPlay:["On your turn, ask any one opponent for a specific rank you hold at least one of (e.g., \"Do you have any 7s?\").","If they do: they must hand over ALL cards of that rank. You get another turn.","If they don't: they say \"Go Fish!\" and you draw the top card from the pond.","If you draw the card you asked for, show it and take another turn.","When you complete a Book (all four of a rank), lay it face-up in front of you.","The game ends when all cards are in Books. Most Books wins."],
    strategy:["Remember what others have asked for — they must hold at least one of what they ask.","Ask for ranks you have three of — completing a Book is the priority.","Keep track of what each player picks up from the pond.","Ask the player most likely to have the card (based on observed draws/asks)."],
    mistakes:["Asking for a rank you don't hold yourself (not allowed).","Forgetting to lay down a completed Book immediately.","Not paying attention to opponents' questions (they reveal what they hold)."],
    payouts:[{bet:"Most Books",pays:"Winner"},{bet:"Tie",pays:"Shared win"}],
    visualCards:[{rank:"7",suit:"S"},{rank:"7",suit:"H"},{rank:"7",suit:"D"},{rank:"7",suit:"C"}],
  },
  {
    id:"war", name:"War", emoji:"⚔️", category:"Classic — Cards",
    players:"2", difficulty:"Easy", type:"card",
    tagline:"The simplest card game ever — flip and compare.",
    overview:"War is arguably the simplest card game there is — virtually no decisions, pure luck, and beloved by children everywhere. Split the deck and flip cards simultaneously. Higher card takes both. If they tie, it's War.",
    terminology:[
      {term:"War",def:"When both players flip cards of equal rank — each player plays three face-down cards and one face-up."},
      {term:"Battle",def:"Each simultaneous flip of cards."},
    ],
    setup:["Standard 52-card deck.","Split the deck evenly — 26 cards each, face-down.","Aces are high (beat all other cards)."],
    howToPlay:["Simultaneously, both players flip the top card of their pile.","Higher card wins both cards (place them at the bottom of the winner's pile).","If cards are equal rank: War! Each player places 3 cards face-down, then flips a 4th card up. Higher face-up card wins all 10 cards.","If the War cards also tie, repeat the War procedure.","The player who collects all 52 cards wins."],
    strategy:["There is no strategy — War is entirely luck-based. Enjoy the chaos!"],
    mistakes:["Looking at your cards — they should always stay face-down until played.","Shuffling poorly before splitting — this can create lopsided games."],
    payouts:[{bet:"Win all 52 cards",pays:"Victory"}],
    visualCards:[{rank:"A",suit:"S"},{rank:"A",suit:"H"}],
  },
  {
    id:"solitaire", name:"Klondike Solitaire", emoji:"🂡", category:"Solo — Cards",
    players:"1", difficulty:"Easy", type:"card",
    tagline:"The classic solo card game — build four foundation piles Ace to King.",
    overview:"Klondike Solitaire (commonly called simply \"Solitaire\") is the most played card game in history — largely due to its inclusion in Windows. The goal is to move all 52 cards to four Foundation piles, one per suit, built up from Ace to King.",
    terminology:[
      {term:"Tableau",def:"The seven columns of cards you build and manipulate during play."},
      {term:"Foundation",def:"Four piles (one per suit) built Ace → King. Filling all four wins the game."},
      {term:"Stock",def:"The remaining draw pile after the Tableau is dealt."},
      {term:"Waste Pile",def:"Cards drawn from the Stock go here. Top card is available to play."},
      {term:"Sequence",def:"Cards in the Tableau must be placed in descending rank, alternating Red/Black."},
    ],
    setup:["Shuffle 52 cards.","Deal 7 columns: column 1 gets 1 card, column 2 gets 2, … column 7 gets 7 cards.","Top card of each column is face-up; rest are face-down.","Remaining 24 cards form the Stock (draw pile)."],
    howToPlay:["Move cards between Tableau columns: place a card on one that is one rank higher and opposite color.","You may move face-up sequences of cards together as a unit.","When a face-down card is uncovered, flip it face-up.","An empty column can only be filled with a King (or a sequence starting with a King).","Draw from the Stock (1 or 3 cards at a time depending on variant).","Ace → Foundation: move any Ace to a Foundation. Then build 2, 3, 4… up to King on that Foundation.","Win by getting all 52 cards onto the Foundations."],
    strategy:["Prioritize uncovering face-down Tableau cards over moving to Foundations early.","Move Kings to empty columns only if they free important face-down cards.","In draw-3 variant, plan your Stock cycling carefully.","Avoid stacking too many cards on one column — spread them out."],
    mistakes:["Moving cards to Foundations too eagerly — you may need them in the Tableau.","Filling empty columns with small cards instead of Kings.","Not thinking ahead when there are multiple valid moves."],
    payouts:[{bet:"All 52 to Foundation",pays:"Victory"},{bet:"Win rate (Vegas draw-1)",pays:"~34%"}],
  },
  {
    id:"golf_card", name:"Golf (Card Game)", emoji:"⛳", category:"Classic — Cards",
    players:"2–4", difficulty:"Easy", type:"card",
    tagline:"Like golf — lowest score wins after 9 holes (rounds).",
    overview:"Golf is a delightful low-luck card game where each player has a 2x3 grid of six cards, most face-down. You swap cards trying to get the lowest score. Pairs in a column cancel each other out (score zero). After 9 rounds (\"holes\"), the lowest total wins — just like golf.",
    terminology:[
      {term:"Hole",def:"One complete round of play (drawing/swapping until someone knocks)."},
      {term:"Column Pair",def:"Two cards of the same rank in the same column — they cancel out and score 0."},
      {term:"Knock",def:"A player reveals their last face-down card, signaling the end of the hole."},
      {term:"Score",def:"Numbered cards = face value; Ace = 1; J/Q = 10; K = 0; Joker = -2 (optional)."},
    ],
    setup:["Standard 52-card deck (add 2 Jokers optional).","Deal 6 cards face-down to each player in a 2-wide, 3-tall grid.","Each player turns 2 of their 6 cards face-up at the start.","Remaining cards form the draw pile; top card starts the discard pile."],
    howToPlay:["On your turn: draw from the stock OR take the top discard.","Swap the drawn card with any face-down or face-up card in your grid (discard the replaced card).","Or discard the drawn card and flip any one face-down card in your grid face-up (if drawing from stock).","If two cards in the same column are the same rank, they form a pair and score 0.","When a player has all 6 cards face-up, they knock. All other players get one final turn.","Total all face-up cards; pairs in same column = 0; unpaired cards score as listed.","After 9 holes, lowest cumulative score wins."],
    strategy:["Prioritize revealing unknown face-down cards early to have information.","Always try to make column pairs — reducing your score by pairing is very powerful.","Kings (0 points) are the most valuable cards — swap them in for face cards.","If your score is already very low, knock as soon as possible before opponents catch up."],
    mistakes:["Keeping high cards hoping for a pair — swap them out if they don't pair quickly.","Not knocking soon enough when you have a great hand.","Forgetting that Jokers score -2 (if used) — they're extremely valuable."],
    payouts:[{bet:"Lowest 9-hole total",pays:"Winner"},{bet:"Column pair",pays:"0 points each card"}],
    visualCards:[{rank:"K",suit:"S"},{rank:"K",suit:"H"},{rank:"2",suit:"C"},{rank:"A",suit:"D"},{faceDown:true},{faceDown:true}],
  },
  /* ── DICE GAMES ── */
  {
    id:"yahtzee", name:"Yahtzee", emoji:"🎲", category:"Dice Games",
    players:"2–10", difficulty:"Easy", type:"dice",
    tagline:"Roll five dice up to three times to complete your scorecard.",
    overview:"Yahtzee is the quintessential dice game. On each turn you roll five dice up to three times, keeping any dice you want between rolls. Your goal is to fill in all 13 scoring categories on your scorecard over 13 rounds. Highest total score wins.",
    terminology:[
      {term:"Yahtzee",def:"All five dice showing the same face — scores 50 points. Subsequent Yahtzees score 100 bonus points each."},
      {term:"Full House",def:"Three of one kind + two of another. Scores 25 points."},
      {term:"Large Straight",def:"Five sequential dice (1-2-3-4-5 or 2-3-4-5-6). Scores 40 points."},
      {term:"Small Straight",def:"Four sequential dice. Scores 30 points."},
      {term:"Chance",def:"Any five dice — score is just the sum. Your safety net category."},
      {term:"Upper Section Bonus",def:"Score 63+ in the upper section (aces through sixes) to earn a 35-point bonus."},
    ],
    setup:["Each player gets a scorecard.","Decide who goes first (highest single die roll).","Each turn consists of up to 3 rolls of all 5 dice."],
    howToPlay:["Roll all 5 dice.","Set aside any dice you want to keep. Re-roll the rest (or all if you choose).","After up to 3 rolls, you must choose a scoring category to fill in.","Each category can only be used once per game.","If you can't score anywhere useful, take a \"0\" in any unfilled category.","After 13 rounds (all categories filled), tally scores. Highest wins."],
    strategy:["Prioritize Yahtzee — it's the highest single-category score and yields bonuses.","Fill upper section with at least 3 of each number to hit the 63-point bonus (equivalent to three of each 1–6).","Use Chance for a bad roll rather than wasting a good category.","Large Straight is hard — go for it early when you have 4 of 5.","Keep Yahtzee opportunities open — even a pair of 6s is worth re-rolling for."],
    mistakes:["Using Chance too early — save it for a genuinely bad roll.","Scoring low amounts in upper section hoping to hit 63 bonus later.","Wasting Yahtzee bonus by not having prepared the bonus slot.","Forgetting that Yahtzee can be used as a joker for lower-section categories."],
    payouts:[{bet:"Three of a Kind",pays:"Sum of all dice"},{bet:"Four of a Kind",pays:"Sum of all dice"},{bet:"Full House",pays:"25 pts"},{bet:"Small Straight",pays:"30 pts"},{bet:"Large Straight",pays:"40 pts"},{bet:"Yahtzee",pays:"50 pts"},{bet:"Yahtzee Bonus",pays:"+100 pts each"}],
    visualDice:[5,5,5,3,3],
  },
  {
    id:"farkle", name:"Farkle", emoji:"💥", category:"Dice Games",
    players:"2–8", difficulty:"Easy", type:"dice",
    tagline:"Keep rolling for points — but know when to bank before you Farkle!",
    overview:"Farkle is a press-your-luck dice game. On your turn, roll all six dice and set aside any scoring dice. Then choose: bank your points, or roll the remaining dice to try to add more. If you roll and score nothing — you've Farkled, losing all accumulated points for that turn.",
    terminology:[
      {term:"Farkle",def:"A roll where none of the dice score — you lose all turn points and your turn ends."},
      {term:"Hot Dice",def:"When all six dice score in a single roll — you may roll all six again and keep accumulating."},
      {term:"Banking",def:"Choosing to stop rolling and add your current turn points to your total score."},
      {term:"Opening Score",def:"Most variants require 500 points in one turn to \"get on the board.\""},
    ],
    setup:["Six standard dice.","Agree on a winning score (most common: 10,000 points).","Each player needs a score sheet."],
    howToPlay:["Roll all six dice.","Set aside at least one scoring die (you must set aside something if any scoring dice exist).","Scoring dice: 1 = 100 pts; 5 = 50 pts; three 1s = 1,000 pts; three 2s = 200 pts; three of any number = that number × 100 pts.","Bank your points, or roll the remaining dice for more.","If all 6 dice score (Hot Dice), roll all 6 again with your running total intact.","If a roll yields no scoring dice: Farkle! Turn ends, all turn points lost.","First player to reach the target score (e.g., 10,000) triggers the final round — all others get one more turn."],
    strategy:["Always bank if you have accumulated a large number (500+) with few dice remaining.","Rolling 2 dice: Farkle probability is about 44% — be cautious.","Rolling 1 die: 67% Farkle chance — almost never worth it unless you're close to a milestone.","Straight (1-2-3-4-5-6) = 1,500 pts — extremely valuable, bank it.","Three pairs = 1,500 pts — bank it."],
    mistakes:["Always rolling all 6 dice without considering remaining die count.","Banking 50 points when you have 5 dice left — too conservative.","Never banking anything over 300 — greed leads to Farkles."],
    payouts:[{bet:"Single 1",pays:"100 pts"},{bet:"Single 5",pays:"50 pts"},{bet:"Three 1s",pays:"1,000 pts"},{bet:"Three of a kind (2–6)",pays:"100× the number"},{bet:"Straight 1–6",pays:"1,500 pts"},{bet:"Three pairs",pays:"1,500 pts"},{bet:"Hot Dice",pays:"Keep all, re-roll all 6"}],
    visualDice:[1,5,3,3,2,4],
  },
  {
    id:"liar_dice", name:"Liar's Dice", emoji:"🎭", category:"Dice Games",
    players:"2–6", difficulty:"Medium", type:"dice",
    tagline:"Bluff and call out bluffs in this classic deception dice game.",
    overview:"Liar's Dice (also called Perudo or Dudo) is a bluffing game where all players roll their dice secretly under a cup. Players take turns bidding on how many dice of a certain face value exist across ALL players' cups. Call someone's bluff if you think they're lying — and lose a die if you're wrong.",
    terminology:[
      {term:"Bid",def:"A claim about the total quantity of a certain face value across all cups (e.g., \"four 3s\")."},
      {term:"Call",def:"Challenge the previous player's bid (\"Liar!\"). Reveal all dice to check."},
      {term:"Ace / Wildcard",def:"In many variants, 1s are wild and count as any face value."},
      {term:"Palafico",def:"Special rule when a player has one die left — aces are no longer wild."},
    ],
    setup:["Each player gets 5 dice and a cup.","All players roll their dice secretly and look at their own dice only.","Youngest or randomly chosen player bids first."],
    howToPlay:["The opening player makes a bid: a quantity and face value (e.g., \"three 4s\" — meaning at least three 4s exist across all players' hidden dice).","Each player must either raise the bid OR call \"Liar!\"","Raising the bid: increase quantity, or keep quantity and increase face value, or both.","Calling \"Liar!\": all players reveal dice. Count total dice of the bid face (plus wild 1s if using that rule).","If the bid was valid (enough or more dice exist): the caller loses one die.","If the bid was invalid: the bidder loses one die.","A player who loses all their dice is eliminated. Last player with dice wins."],
    strategy:["Use your own dice to anchor bids — if you have two 3s, bidding \"three 3s\" is likely safe.","Watch who bids confidently and who raises hesitantly — it reveals information.","Lowball bids early in the game to force opponents to overcommit.","Call quickly when a bid requires more dice than exist (e.g., \"ten 6s\" with only 15 total dice)."],
    mistakes:["Being too predictable — always bidding based on what you hold makes you easy to read.","Calling too often — you should only call when the math is against the bidder.","Ignoring wild aces — they significantly expand what's likely."],
    payouts:[{bet:"Last player with dice",pays:"Winner"}],
    visualDice:[3,3,5,1,2],
  },
  {
    id:"bunco", name:"Bunco", emoji:"🎊", category:"Dice Games",
    players:"12 (or any multiple of 4)", difficulty:"Easy", type:"dice",
    tagline:"Fast and social — roll three dice trying to match the target number.",
    overview:"Bunco is a social, luck-based dice game played in teams of two across six rounds. No skill required — just roll three dice and count how many match the round number. It's all about speed, noise, and fun.",
    terminology:[
      {term:"Bunco",def:"Rolling three dice all matching the current round number in one roll — 21 points!"},
      {term:"Round",def:"Six rounds total, numbered 1–6. Each round's target number matches the round number."},
      {term:"Set",def:"A set is won by the first team to reach 21 points (or whoever leads when time is called)."},
    ],
    setup:["12 players seated at 3 tables of 4 (2 teams of 2 at each table).","Designate a Head Table.","Each table has 3 dice and a score sheet.","A bell signals start/stop."],
    howToPlay:["Round 1: target number is 1. Players roll three dice as fast as possible.","Count any die showing a 1 — score that many points.","If all three dice show 1: Bunco! Score 21 points and ring the bell immediately.","If none match: nothing scored; pass dice to partner who rolls immediately.","The round ends when the Head Table hits 21 (or Bunco). Bell rings.","Winning team stays at Head Table; losing team rotates down. Partners reshuffle.","After 6 rounds, tally wins, losses, and Buncos. Prizes often awarded for most wins, most Buncos, and most losses."],
    strategy:["There is virtually no strategy in Bunco — it's pure luck and speed.","Roll fast — speed matters when rounds end by the Head Table bell."],
    mistakes:["Slowing down to count carefully — just roll and count quickly.","Forgetting to ring the bell on a Bunco."],
    payouts:[{bet:"Most wins",pays:"Main prize"},{bet:"Most Buncos",pays:"Secondary prize"},{bet:"Most losses",pays:"Consolation prize (traditional)"}],
    visualDice:[1,1,1],
  },
  /* ── SOLITAIRE / SOLO ── */
  {
    id:"freecell", name:"FreeCell", emoji:"🗂️", category:"Solo — Cards",
    players:"1", difficulty:"Medium", type:"card",
    tagline:"Nearly every deal is winnable — pure logic and planning.",
    overview:"FreeCell is a Solitaire variant where all 52 cards are dealt face-up. There are no hidden cards — the game is entirely about strategy. Four Free Cells act as temporary parking spots. Nearly every deal (99.99%) is mathematically winnable if played correctly.",
    terminology:[
      {term:"Free Cell",def:"One of four temporary holding spots above the Tableau. Each holds exactly one card."},
      {term:"Foundation",def:"Four piles (one per suit) built Ace → King. Fill all four to win."},
      {term:"Tableau",def:"Eight columns of face-up cards — the main playing area."},
      {term:"Supermove",def:"Moving multiple cards as a group — only possible if enough empty Free Cells and columns exist."},
    ],
    setup:["Deal all 52 cards into 8 columns face-up: first 4 columns get 7 cards; last 4 get 6 cards.","Four Free Cells and four Foundation piles are empty at start."],
    howToPlay:["Move cards one at a time (or groups via supermoves).","Tableau columns: play cards in descending rank, alternating red/black.","Free Cells can hold any single card — but using them all is dangerous.","Move Aces to Foundation immediately. Build up by suit.","Win by moving all 52 cards to Foundations."],
    strategy:["Plan 5–10 moves ahead — FreeCell rewards lookahead.","Never fill all four Free Cells — you'll lock yourself out of moves.","Prioritize freeing up columns — an empty column is powerful.","Don't move a card to a Free Cell unless you have a clear plan to use it.","Work on multiple foundation suits simultaneously."],
    mistakes:["Using Free Cells as permanent parking — they're temporary only.","Moving Kings to empty columns without a clear purpose.","Focusing on one suit without advancing others."],
    payouts:[{bet:"All 52 to Foundation",pays:"Victory"},{bet:"No moves left",pays:"Loss (~0.01% of deals)"}],
  },
  {
    id:"spider", name:"Spider Solitaire", emoji:"🕷️", category:"Solo — Cards",
    players:"1", difficulty:"Hard", type:"card",
    tagline:"Build eight complete suit sequences to remove all cards from the Tableau.",
    overview:"Spider Solitaire uses two full decks (104 cards). The objective is to build eight complete sequences from King to Ace within the Tableau. Completed sequences are automatically removed. Spider is widely considered the hardest popular Solitaire variant.",
    terminology:[
      {term:"Sequence",def:"13 cards of the same suit from King down to Ace — completing one removes it."},
      {term:"Tableau",def:"Ten columns of face-down cards with face-up cards on top."},
      {term:"Deal",def:"Pressing the deal button deals one card face-up to each of the 10 columns from the stock."},
      {term:"One-Suit / Two-Suit / Four-Suit",def:"Difficulty modes. One-Suit uses one suit repeated; Four-Suit uses all four (hardest)."},
    ],
    setup:["Two 52-card decks (104 cards total).","Deal: 4 columns of 6 cards, 6 columns of 5 cards — all face-down except the top card.","Remaining 50 cards are the stock (5 deals of 10 cards remain)."],
    howToPlay:["Move cards or sequences between Tableau columns. Sequences must be consecutive and same-suit to move as a group.","You can stack cards of mixed suits — but they can't move as a group.","If a column is empty, any card or valid sequence can go there.","When stuck, deal 10 more cards from the stock (one to each column). You must deal if any column is empty.","Complete a King-to-Ace sequence of the same suit — it's removed. Do this 8 times to win."],
    strategy:["Keep at least one empty column as a maneuvering space.","Focus on one or two suits first — try to clear a full sequence quickly.","Don't deal from the stock if you can still make progress on the Tableau.","Keep sequences same-suited even if mixed-suit stacks are available."],
    mistakes:["Building mixed-suit stacks extensively — they block powerful moves.","Dealing from stock too soon.","Filling all empty columns with kings too early."],
    payouts:[{bet:"8 complete sequences removed",pays:"Victory"}],
  },
  /* ── CLASSIC FAMILY GAMES ── */
  {
    id:"uno", name:"Uno", emoji:"🎨", category:"Family & Party",
    players:"2–10", difficulty:"Easy", type:"card",
    tagline:"Shed your cards and call 'Uno' when one remains.",
    overview:"Uno is the world's best-selling commercial card game. Players race to discard all their cards by matching color or number. Special action cards add chaos: Skip, Reverse, Draw Two, and the feared Wild Draw Four.",
    terminology:[
      {term:"Uno",def:"Call this when you play your second-to-last card. Forgetting = draw 4 penalty."},
      {term:"Wild",def:"Can be played on anything. You choose the next color."},
      {term:"Wild Draw Four",def:"Opponent draws 4 and loses their turn. Must challenge if you suspect the player could have played a color card."},
      {term:"Stack",def:"House rule (official in 2019+ rules): Draw 2s can be stacked onto Draw 2s."},
      {term:"Bluffing",def:"Playing a Wild Draw Four when you actually have a matching color card — illegal but unchallenged often."},
    ],
    setup:["108-card Uno deck (19 of each color 1–9, plus action cards).","Deal 7 cards to each player.","Place remaining cards face-down as draw pile.","Flip top card to start the discard pile."],
    howToPlay:["Match the top discard by color OR by number/symbol.","If you can't play, draw one card. If playable, play it; otherwise keep it.","Special cards: Skip = next player loses turn. Reverse = direction flips. Draw Two = next player draws 2 and loses turn.","Wild = choose any color. Wild Draw Four = next player draws 4 and loses turn.","When you have one card left, say \"Uno!\" before playing your second-to-last card.","First player to empty their hand wins the round. Others score penalties."],
    strategy:["Hold Wild cards for moments when you truly need a color change.","Use Draw 2 and Skip cards to slow down the leader.","Pay attention to hand sizes — target players close to winning.","Change color to one opponents are short on.","Challenge Wild Draw Fours when you suspect bluffing."],
    mistakes:["Forgetting to say \"Uno!\" — you'll be forced to draw 4.","Playing Wilds too early when a color match is available.","Ignoring hand sizes of other players."],
    payouts:[{bet:"Round win",pays:"0 pts"},{bet:"Numbered card in others' hands",pays:"Face value against loser"},{bet:"Action card",pays:"20 pts against loser"},{bet:"Wild / Wild Draw Four",pays:"50 pts against loser"}],
    visualCards:[{rank:"7",suit:"H"},{rank:"7",suit:"D"},{rank:"S",suit:"S"}],
  },
  {
    id:"old_maid", name:"Old Maid", emoji:"👵", category:"Family & Party",
    players:"2–8", difficulty:"Easy", type:"card",
    tagline:"Don't be left holding the Old Maid at the end.",
    overview:"Old Maid is a classic matching game for all ages. Remove three of the four Queens from a standard deck (leaving one \"Old Maid\"). Players pair up cards and try to avoid being the one holding the unmatched Old Maid at the end.",
    terminology:[
      {term:"Old Maid",def:"The single unmatched Queen (the odd one out when one Queen is removed)."},
      {term:"Pair",def:"Two cards of the same rank — when matched, discard them."},
    ],
    setup:["Remove three Queens from a 52-card deck, leaving one (the Old Maid).","Deal all cards to players (some may have one more than others).","Players examine their hands and discard any pairs they hold immediately."],
    howToPlay:["Starting with the dealer, spread your hand face-down to the player on your left.","That player draws one card blind. If it pairs something in their hand, discard the pair.","Continue clockwise — each player draws blindly from the player to their right.","As pairs are made and discarded, hands shrink. Eventually one card remains — the Old Maid.","The player left holding the Old Maid loses (or \"is\" the Old Maid)."],
    strategy:["In some variants, you can try to make the Old Maid obvious to bluff your opponent.","Draw from the edges of an opponent's hand — some players involuntarily shift the unwanted card."],
    mistakes:["Looking at opponents' cards (not allowed).","Not discarding pairs immediately."],
    payouts:[{bet:"Last player holding Old Maid",pays:"Loses"}],
    visualCards:[{rank:"Q",suit:"S"},{rank:"5",suit:"H"},{rank:"5",suit:"C"},{rank:"9",suit:"D"},{rank:"9",suit:"S"}],
  },
  {
    id:"snap", name:"Snap", emoji:"👏", category:"Family & Party",
    players:"2–6", difficulty:"Easy", type:"card",
    tagline:"Slap the pile and shout Snap when two cards match!",
    overview:"Snap is a fast-reaction card game perfect for kids and adults who want quick fun. Players take turns flipping cards onto a central pile. When two consecutive face-up cards match in rank, the first person to shout \"Snap!\" and slap the pile wins all the cards.",
    terminology:[
      {term:"Snap",def:"Called when the top two face-up cards in the center match in rank."},
      {term:"Snap Pool",def:"When two players call Snap simultaneously, cards go to a central pool won by the next Snap."},
      {term:"False Snap",def:"Calling Snap when cards don't match — you must give each player one card as a penalty."},
    ],
    setup:["Standard 52-card deck.","Deal all cards face-down equally to each player.","Players hold their piles without looking."],
    howToPlay:["Players take turns flipping the top card of their pile onto a central face-up pile.","Cards must be flipped away from yourself so you can't see them before others.","When two face-up cards on the pile match in rank: shout \"Snap!\" and slap the pile.","First to slap takes all the cards in the central pile.","A player who runs out of cards is eliminated. Last player holding cards wins."],
    strategy:["Watch the cards carefully — don't just focus on the one being flipped.","Stay alert and keep your hand hovering near the pile as the deck runs low."],
    mistakes:["False Snap penalty — look carefully before calling.","Flipping too quickly without giving others a chance to see (considered poor form)."],
    payouts:[{bet:"Collect all 52 cards",pays:"Winner"}],
    visualCards:[{rank:"8",suit:"S"},{rank:"8",suit:"H"}],
  },
  {
    id:"spades", name:"Spades", emoji:"♠️", category:"Classic — Cards",
    players:"4 (2 teams)", difficulty:"Medium", type:"card",
    tagline:"A trick-taking team game where Spades are always trump.",
    overview:"Spades is a beloved trick-taking game played in fixed partnerships. Partners sit across from each other. Before each hand, both partners bid how many tricks they expect to win. Spades always serve as the trump suit. Hit your bid exactly for bonus points; overbid and collect \"bags\" that can cost you later.",
    terminology:[
      {term:"Trick",def:"One round of four played cards — the highest card (or highest spade) wins."},
      {term:"Trump",def:"Spades. Always beat any other suit."},
      {term:"Bid",def:"Before play, each player declares how many tricks they expect to win."},
      {term:"Nil",def:"Bidding zero tricks — if successful, earns 100 bonus points. Fail and lose 100."},
      {term:"Blind Nil",def:"Bidding zero tricks without seeing your cards (200 point swing — very risky)."},
      {term:"Bags",def:"Overtricks (winning more tricks than you bid). Every 10 bags = -100 pts."},
      {term:"Breaking Spades",def:"Spades can't be led until they've been played on another suit (or you have only spades)."},
    ],
    setup:["Standard 52-card deck. No Jokers.","Deal 13 cards to each player.","Players bid starting left of the dealer. Bids range from 0 (Nil) to 13.","Team bid = sum of the two partners' individual bids."],
    howToPlay:["Player left of dealer leads first.","Players must follow the lead suit if possible. If not, play any card (including spades).","Highest card of the lead suit wins unless a spade was played — highest spade wins.","Spades cannot be led until broken (unless you have nothing but spades).","After 13 tricks, score the hand.","If team meets or exceeds their bid: 10× bid + 1 per overtrick.","If team fails to meet bid: -10× bid.","Nil bidders: +100 if they take 0 tricks; -100 if they take even 1 (partner covers)."],
    strategy:["Count your guaranteed tricks (aces, guarded kings, spades) when bidding.","Don't over-bid — bags accumulate and cost you 100 pts at every 10th bag.","Communication with partner: bid honestly so the team's combined bid is achievable.","Use high spades to capture important tricks late in the hand.","If partner bids Nil, help them avoid tricks — lead low cards and cover their dangerous cards."],
    mistakes:["Overbidding consistently — bags will penalize you eventually.","Bidding too conservatively and leaving points on the table.","Leading high cards early when saving them would be more valuable.","Not covering your partner's Nil bid."],
    payouts:[{bet:"Meet bid",pays:"10× bid pts"},{bet:"Overtrick (bag)",pays:"+1 pt each"},{bet:"10 bags accumulated",pays:"-100 pts"},{bet:"Successful Nil",pays:"+100 pts"},{bet:"Failed Nil",pays:"-100 pts"},{bet:"Game win (typically 500 pts)",pays:"Victory"}],
    visualCards:[{rank:"A",suit:"S"},{rank:"K",suit:"S"},{rank:"Q",suit:"H"},{rank:"J",suit:"D"},{rank:"2",suit:"C"}],
  },
  {
    id:"hearts", name:"Hearts", emoji:"♥️", category:"Classic — Cards",
    players:"4", difficulty:"Medium", type:"card",
    tagline:"Avoid Hearts and the Queen of Spades — unless you Shoot the Moon.",
    overview:"Hearts is a classic trick-avoidance game. Hearts and the Queen of Spades carry penalty points — the goal is to avoid them. But if one player takes ALL the Hearts and the Queen of Spades (\"Shoot the Moon\"), everyone else gets 26 points instead. First to 100 loses.",
    terminology:[
      {term:"Shoot the Moon",def:"Take all 13 Hearts plus the Queen of Spades. All other players get 26 pts. Extremely risky."},
      {term:"Queen of Spades",def:"The most feared card — worth 13 points on its own."},
      {term:"Blood",def:"Hearts — the penalty suit. Each heart = 1 point."},
      {term:"Bleeding Spades",def:"Leading spades to force out the Queen of Spades."},
      {term:"Passing",def:"Before each hand, pass 3 cards to an opponent (direction rotates)."},
    ],
    setup:["Standard 52-card deck.","Deal all 13 cards to each player.","Before play: pass 3 cards left (hand 1), right (hand 2), across (hand 3), no pass (hand 4). Repeat cycle."],
    howToPlay:["Player with 2♣ leads it. Players must follow suit; if unable, play any card.","No penalty cards (hearts or Q♠) can be played on the first trick unless that's all you have.","Highest card of the lead suit wins the trick.","Play continues until all 13 tricks are played.","Count penalty points: 1 per heart, 13 for the Queen of Spades.","When any player reaches 100, the player with the lowest score wins."],
    strategy:["Pass the Queen of Spades, Ace and King of Spades (she needs protection), and high hearts.","Void a suit early — this lets you ditch penalty cards when that suit is led.","Watch for Shoot the Moon attempts — if someone is collecting all hearts, start giving them the Queen of Spades too (or stop giving them hearts).","Keep the Ace or King of Spades only if you have mid-spades to protect them."],
    mistakes:["Holding the Queen of Spades without low spades to protect her.","Ignoring that an opponent may be attempting Shoot the Moon.","Leading high cards in hearts early — gift others their penalty avoidance."],
    payouts:[{bet:"Win trick with hearts/QS",pays:"-1/-13 pts per card"},{bet:"Shoot the Moon",pays:"All others get 26 pts"},{bet:"Lowest score at 100-pt cap",pays:"Winner"}],
    visualCards:[{rank:"Q",suit:"S"},{rank:"A",suit:"H"},{rank:"K",suit:"H"},{rank:"2",suit:"C"}],
  },
];

/* ─────────────────────────────────────────────
   HAND RANKINGS, PAYOUTS, STEP LIST
───────────────────────────────────────────── */
function HandRankings({ rankings }) {
  const tc = {1:"#c0131a",2:"#b87d12",3:"#1d6e3c",4:"#143a72",5:"#555"};
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
      {rankings.map((h,i) => (
        <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"8px 12px",background:"rgba(255,255,255,.03)",borderRadius:8,border:"1px solid rgba(200,169,64,.12)" }}>
          <div style={{ width:24,height:24,borderRadius:"50%",background:tc[h.tier],display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:"bold",flexShrink:0 }}>{i+1}</div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#e8d5a0",fontFamily:"Georgia,serif",fontWeight:"bold",fontSize:13 }}>{h.rank}</div>
            <div style={{ color:"#8a7a55",fontSize:11,fontFamily:"Georgia,serif" }}>{h.example}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PayoutsTable({ payouts }) {
  return (
    <div style={{ background:"rgba(200,169,64,.05)",border:"1px solid rgba(200,169,64,.2)",borderRadius:10,overflow:"hidden" }}>
      <div style={{ display:"flex",justifyContent:"space-between",padding:"8px 14px",background:"rgba(200,169,64,.1)",borderBottom:"1px solid rgba(200,169,64,.2)" }}>
        <span style={{ color:"#7a6030",fontSize:10,letterSpacing:2 }}>BET / OUTCOME</span>
        <span style={{ color:"#7a6030",fontSize:10,letterSpacing:2 }}>PAYS</span>
      </div>
      {payouts.map((p,i) => (
        <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",background:i%2===0?"rgba(255,255,255,.04)":"transparent" }}>
          <span style={{ color:"#b0a070",fontFamily:"Georgia,serif",fontSize:13 }}>{p.bet}</span>
          <span style={{ color:G,fontFamily:"Georgia,serif",fontWeight:"bold",fontSize:13 }}>{p.pays}</span>
        </div>
      ))}
    </div>
  );
}

function StepList({ items, accent="gold" }) {
  const ac = accent==="red" ? "#c0131a" : G;
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
      {items.map((item,i) => (
        <div key={i} style={{ display:"flex",gap:12,alignItems:"flex-start",padding:"10px 14px",background:"rgba(255,255,255,.03)",borderRadius:8,border:"1px solid rgba(200,169,64,.1)" }}>
          <div style={{ width:24,height:24,borderRadius:"50%",background:ac,color:accent==="red"?"white":"#1a1200",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:"bold",flexShrink:0,fontFamily:"Georgia,serif" }}>{i+1}</div>
          <span style={{ color:"#c4b07a",fontFamily:"Georgia,serif",fontSize:13,lineHeight:1.7 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function TermGrid({ terms }) {
  return (
    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))",gap:10 }}>
      {terms.map((t,i) => (
        <div key={i} style={{ padding:"10px 14px",background:"rgba(200,169,64,.06)",borderRadius:8,border:"1px solid rgba(200,169,64,.18)" }}>
          <div style={{ color:G,fontFamily:"Georgia,serif",fontWeight:"bold",fontSize:12,marginBottom:4 }}>{t.term}</div>
          <div style={{ color:"#a09060",fontFamily:"Georgia,serif",fontSize:12,lineHeight:1.5 }}>{t.def}</div>
        </div>
      ))}
    </div>
  );
}

function RuleSection({ title, children, accent="gold" }) {
  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
        <div style={{ width:3,height:20,background:accent==="red"?"#c0131a":G,borderRadius:2,flexShrink:0 }}/>
        <h3 style={{ margin:0,fontFamily:"Georgia,serif",color:"#e8d5a0",fontSize:16,fontWeight:"bold",letterSpacing:.5 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function GameRules({ onClose }) {
  const [selectedId, setSelectedId] = useState("blackjack");
  const [search, setSearch] = useState("");
  const contentRef = useRef(null);

  const filtered = GAMES.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase())
  );

  const game = GAMES.find(g => g.id === selectedId) || GAMES[0];

  const diffColor = { Easy:"#1d8a4c", Medium:"#b87d12", Hard:"#c0131a" };

  const select = (id) => {
    setSelectedId(id);
    setTimeout(() => contentRef.current?.scrollTo({ top:0, behavior:"smooth" }), 0);
  };

  const cats = filtered.reduce((acc,g) => {
    if (!acc[g.category]) acc[g.category] = [];
    acc[g.category].push(g);
    return acc;
  }, {});

  return (
    <div style={{ display:"flex", height:"100vh", background:"#0d1f0d", fontFamily:"Georgia,serif", overflow:"hidden" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width:220, flexShrink:0, background:"#090f09", borderRight:"1px solid rgba(200,169,64,.18)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"16px 14px 12px", borderBottom:"1px solid rgba(200,169,64,.15)" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:8 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:30,height:30,borderRadius:"50%",background:"#c8a940",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>♠</div>
              <div>
                <div style={{ color:G,fontWeight:"bold",fontSize:13,letterSpacing:1.5 }}>CASINO</div>
                <div style={{ color:"#4a4020",fontSize:9,letterSpacing:2 }}>RULEBOOK</div>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} style={{ background:"rgba(200,169,64,.12)",border:"1px solid rgba(200,169,64,.25)",borderRadius:6,color:"#c8a940",cursor:"pointer",fontSize:14,padding:"3px 7px",lineHeight:1,fontFamily:"Georgia,serif" }}>✕</button>
            )}
          </div>
        </div>

        <div style={{ padding:"10px 10px 6px" }}>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search games..."
            style={{ width:"100%",background:"rgba(200,169,64,.08)",border:"1px solid rgba(200,169,64,.22)",borderRadius:7,padding:"7px 9px",color:G,fontSize:12,fontFamily:"Georgia,serif",outline:"none",boxSizing:"border-box" }}
          />
        </div>

        <div style={{ flex:1,overflowY:"auto",padding:"0 6px 12px" }}>
          {Object.entries(cats).map(([cat,games]) => (
            <div key={cat}>
              <div style={{ color:"#4a4020",fontSize:8,letterSpacing:2,padding:"10px 8px 4px",textTransform:"uppercase" }}>{cat}</div>
              {games.map(g => {
                const active = g.id === selectedId;
                return (
                  <button key={g.id} onClick={()=>select(g.id)}
                    style={{ width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:7,border:"none",cursor:"pointer",
                      background:active?"rgba(200,169,64,.15)":"transparent",
                      borderLeft:active?"3px solid "+G:"3px solid transparent",
                      marginBottom:1,display:"flex",alignItems:"center",gap:7,transition:"all .12s" }}>
                    <span style={{ fontSize:12 }}>{g.emoji}</span>
                    <div>
                      <div style={{ color:active?G:"#6a5a35",fontSize:11,fontWeight:active?"bold":"normal" }}>{g.name}</div>
                      <div style={{ color:diffColor[g.difficulty]||"#5a5a3a",fontSize:8,letterSpacing:1 }}>{g.difficulty}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ padding:"8px 14px",borderTop:"1px solid rgba(200,169,64,.12)",color:"#2a2010",fontSize:8,letterSpacing:1 }}>
          {GAMES.length} GAMES IN LIBRARY
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main ref={contentRef} style={{ flex:1,overflowY:"auto",background:"#0f1e0f" }}>

        {/* Hero */}
        <div style={{ background:"#0a140a",borderBottom:"1px solid rgba(200,169,64,.18)",padding:"28px 40px 20px" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12 }}>
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
                <span style={{ fontSize:28 }}>{game.emoji}</span>
                <div>
                  <div style={{ color:"#5a4520",fontSize:9,letterSpacing:2.5,textTransform:"uppercase",marginBottom:2 }}>{game.category}</div>
                  <h1 style={{ margin:0,color:"#e8d5a0",fontSize:32,fontWeight:"bold",letterSpacing:.5 }}>{game.name}</h1>
                </div>
              </div>
              <p style={{ color:"#6a5a35",fontSize:14,margin:0,fontStyle:"italic",maxWidth:520 }}>{game.tagline}</p>
            </div>
            <div style={{ display:"flex",gap:20,alignItems:"center" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ color:"#4a3a20",fontSize:8,letterSpacing:1.5,marginBottom:3 }}>PLAYERS</div>
                <div style={{ color:G,fontSize:14,fontWeight:"bold" }}>{game.players}</div>
              </div>
              <div style={{ width:1,height:32,background:"rgba(200,169,64,.18)" }}/>
              <div style={{ textAlign:"center" }}>
                <div style={{ color:"#4a3a20",fontSize:8,letterSpacing:1.5,marginBottom:3 }}>DIFFICULTY</div>
                <div style={{ color:diffColor[game.difficulty]||"#888",fontSize:14,fontWeight:"bold" }}>{game.difficulty}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding:"32px 40px 60px", maxWidth:"100%" }}>

          {/* Overview + Visual side by side */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 380px",gap:32,marginBottom:36,alignItems:"start" }}>
            <RuleSection title="Overview">
              <p style={{ color:"#a09060",fontFamily:"Georgia,serif",fontSize:14,lineHeight:1.85,margin:0 }}>{game.overview}</p>
            </RuleSection>
            <div>
              <div style={{ color:"#5a4520",fontSize:8,letterSpacing:2.5,textTransform:"uppercase",marginBottom:10 }}>TABLE / EXAMPLE LAYOUT</div>
              <GameVisual game={game}/>
            </div>
          </div>

          <RuleSection title="Terminology">
            <TermGrid terms={game.terminology}/>
          </RuleSection>

          <RuleSection title="Setup">
            <StepList items={game.setup}/>
          </RuleSection>

          <RuleSection title="How to Play" accent="red">
            <StepList items={game.howToPlay} accent="red"/>
          </RuleSection>

          {game.handRankings && (
            <RuleSection title="Hand Rankings">
              <HandRankings rankings={game.handRankings}/>
            </RuleSection>
          )}

          <RuleSection title="Strategy & Tips">
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {game.strategy.map((s,i) => (
                <div key={i} style={{ display:"flex",gap:10,alignItems:"flex-start",padding:"10px 14px",background:"rgba(29,110,60,.12)",border:"1px solid rgba(29,110,60,.25)",borderRadius:8 }}>
                  <span style={{ color:"#1d8a4c",fontSize:14,flexShrink:0,marginTop:1 }}>✦</span>
                  <span style={{ color:"#b0c090",fontFamily:"Georgia,serif",fontSize:13,lineHeight:1.65 }}>{s}</span>
                </div>
              ))}
            </div>
          </RuleSection>

          {game.mistakes && (
            <RuleSection title="Common Mistakes" accent="red">
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {game.mistakes.map((m,i) => (
                  <div key={i} style={{ display:"flex",gap:10,alignItems:"flex-start",padding:"10px 14px",background:"rgba(192,19,26,.08)",border:"1px solid rgba(192,19,26,.2)",borderRadius:8 }}>
                    <span style={{ color:"#c0131a",fontSize:14,flexShrink:0,marginTop:1 }}>✗</span>
                    <span style={{ color:"#c09090",fontFamily:"Georgia,serif",fontSize:13,lineHeight:1.65 }}>{m}</span>
                  </div>
                ))}
              </div>
            </RuleSection>
          )}

          {game.payouts && (
            <RuleSection title="Payouts & Scoring">
              <PayoutsTable payouts={game.payouts}/>
            </RuleSection>
          )}
        </div>
      </main>
    </div>
  );
}