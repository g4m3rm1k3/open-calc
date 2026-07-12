import { useState, useRef } from "react";

/* ─────────────────────────────────────────────
   CARD + DICE SVG COMPONENTS
───────────────────────────────────────────── */
const SUIT_SYMBOLS = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RED_SUITS = new Set(["H", "D"]);

function PlayingCard({ rank = "A", suit = "S", faceDown = false }) {
  const isRed = RED_SUITS.has(suit);
  const sym = SUIT_SYMBOLS[suit] || suit;
  const color = isRed ? "#ef4444" : "#e2e8f0";
  if (faceDown) {
    return (
      <svg width="64" height="90" viewBox="0 0 72 100" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))", flexShrink: 0 }}>
        <defs>
          <linearGradient id="backGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e293b"/>
            <stop offset="100%" stopColor="#0f172a"/>
          </linearGradient>
          <pattern id="backpat" patternUnits="userSpaceOnUse" width="8" height="8">
            <path d="M0 8L8 0M-2 2L2 -2M6 10L10 6" stroke="#334155" strokeWidth="1" opacity="0.6" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="72" height="100" rx="6" fill="url(#backGrad)" stroke="#475569" strokeWidth="1" />
        <rect x="5" y="5" width="62" height="90" rx="4" fill="url(#backpat)" />
        <circle cx="36" cy="50" r="14" fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.8"/>
      </svg>
    );
  }
  return (
    <svg width="64" height="90" viewBox="0 0 72 100" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))", flexShrink: 0 }}>
      <rect x="0" y="0" width="72" height="100" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      <text x="8" y="22" fontSize="16" fontFamily="'Inter', sans-serif" fontWeight="700" fill={color}>{rank}</text>
      <text x="8" y="38" fontSize="14" fontFamily="'Inter', sans-serif" fill={color}>{sym}</text>
      <text x="36" y="56" fontSize="32" fontFamily="'Inter', sans-serif" fill={color} textAnchor="middle" dominantBaseline="middle" opacity="0.9">{sym}</text>
      <text x="64" y="86" fontSize="16" fontFamily="'Inter', sans-serif" fontWeight="700" fill={color} textAnchor="middle" transform="rotate(180,64,86)">{rank}</text>
    </svg>
  );
}

function DieComponent({ value, size = 48 }) {
  const pips = {
    1: [[.5,.5]],
    2: [[.25,.25],[.75,.75]],
    3: [[.25,.25],[.5,.5],[.75,.75]],
    4: [[.25,.25],[.75,.25],[.25,.75],[.75,.75]],
    5: [[.25,.25],[.75,.25],[.5,.5],[.25,.75],[.75,.75]],
    6: [[.25,.2],[.75,.2],[.25,.5],[.75,.5],[.25,.8],[.75,.8]],
  }[value] || [];
  const r = size * 0.08;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.6))", flexShrink: 0 }}>
      <rect x="0" y="0" width={size} height={size} rx={size*0.15} fill="#1e293b" stroke="#475569" strokeWidth="1" />
      {pips.map(([cx,cy],i) => <circle key={i} cx={cx*size} cy={cy*size} r={r} fill="#06b6d4" />)}
    </svg>
  );
}

function Chip({ color="cyan", label="5" }) {
  const C = { 
    cyan:["#0891b2","#06b6d4","#fff"], 
    pink:["#db2777","#ec4899","#fff"], 
    purple:["#7e22ce","#a855f7","#fff"], 
    gold:["#b45309","#f59e0b","#fff"], 
    slate:["#334155","#475569","#fff"]
  };
  const [fill,stroke,text] = C[color]||C.cyan;
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))", flexShrink: 0 }}>
      <circle cx="24" cy="24" r="22" fill="#0f172a" stroke={stroke} strokeWidth="2" />
      <circle cx="24" cy="24" r="18" fill={fill} opacity="0.2" />
      <circle cx="24" cy="24" r="16" fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
      <text x="24" y="29" textAnchor="middle" fontSize="13" fontWeight="bold" fontFamily="'Inter', sans-serif" fill={text}>{label}</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   SHARED UI PIECES
───────────────────────────────────────────── */
const NEON_CYAN = "#06b6d4";
const NEON_PURP = "#a855f7";
const NEON_PINK = "#ec4899";
const DARK_BG = "#020617";
const PANEL_BG = "rgba(15, 23, 42, 0.6)";

function TableWrap({ children, style={} }) {
  return (
    <div style={{ background: PANEL_BG, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 16, padding: "28px 24px", border: `1px solid rgba(6, 182, 212, 0.2)`, boxShadow: "inset 0 0 30px rgba(6,182,212,0.05), 0 8px 32px rgba(0,0,0,0.5)", ...style }}>
      {children}
    </div>
  );
}

function TableLabel({ children, color=NEON_CYAN }) {
  return <div style={{ textAlign:"center", color: color, fontFamily:"'Inter', sans-serif", fontSize:11, letterSpacing:2, fontWeight:"600", marginBottom:14, textTransform:"uppercase", textShadow:`0 0 10px ${color}60` }}>{children}</div>;
}

function CardRow({ cards, label, score, color=NEON_CYAN }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <TableLabel color={color}>{label}{score != null ? ` — ${score}` : ""}</TableLabel>}
      <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
        {cards.map((c,i) => <PlayingCard key={i} rank={c.rank} suit={c.suit} faceDown={c.faceDown} />)}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height:1, background:"linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)", margin:"20px 0" }} />;
}

/* ─────────────────────────────────────────────
   TABLE VISUALS
───────────────────────────────────────────── */
function BlackjackVisual() {
  return (
    <TableWrap>
      <CardRow color={NEON_PINK} label="DEALER" cards={[{rank:"7",suit:"D"},{faceDown:true}]} />
      <Divider />
      <CardRow label="PLAYER — BLACKJACK!" score={21} cards={[{rank:"A",suit:"S"},{rank:"K",suit:"H"}]} />
      <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:16 }}>
        <Chip color="cyan" label="25" /><Chip color="slate" label="100" />
      </div>
    </TableWrap>
  );
}

function PokerVisual() {
  return (
    <TableWrap>
      <CardRow color={NEON_PURP} label="COMMUNITY CARDS" cards={[{rank:"A",suit:"C"},{rank:"K",suit:"D"},{rank:"7",suit:"H"},{rank:"2",suit:"C"},{faceDown:true}]} />
      <div style={{ textAlign:"center", marginTop:14, marginBottom:14 }}>
        <div style={{ display:"inline-flex", gap:8 }}><Chip color="pink" label="5"/><Chip color="cyan" label="25"/><Chip color="cyan" label="25"/></div>
        <div style={{ color:NEON_CYAN, fontSize:12, opacity:.8, fontFamily:"'Inter', sans-serif", marginTop:8 }}>Pot: $180</div>
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
          <div style={{ display:"grid", gridTemplateColumns:"36px repeat(12, 1fr) 36px", gap:4, marginBottom:4 }}>
            <div style={{ background:"rgba(6,182,212,0.1)", border:"1px solid rgba(6,182,212,0.4)", borderRadius:6, display:"flex",alignItems:"center",justifyContent:"center",color:NEON_CYAN,fontWeight:"bold",fontSize:13,fontFamily:"'Inter', sans-serif",gridRow:"1/4" }}>0</div>
            {rows.map((row,ri) => row.map(n => (
              <div key={n} style={{ background:reds.has(n)?"rgba(236,72,153,0.1)":"rgba(30,41,59,0.5)", border:reds.has(n)?"1px solid rgba(236,72,153,0.3)":"1px solid rgba(148,163,184,0.2)", borderRadius:4, color:reds.has(n)?NEON_PINK:"#cbd5e1", textAlign:"center", fontSize:11, fontFamily:"'Inter', sans-serif", fontWeight:"600", padding:"6px 0" }}>{n}</div>
            )))}
            <div style={{ background:"rgba(6,182,212,0.05)", border:"1px solid rgba(6,182,212,0.2)", borderRadius:6, display:"flex",flexDirection:"column",justifyContent:"space-around",alignItems:"center",color:NEON_CYAN,fontSize:9,gridRow:"1/4",padding:"4px 2px",gap:2 }}>
              <span>2:1</span><span>2:1</span><span>2:1</span>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"36px repeat(3, 1fr) 36px", gap:4, marginBottom:4 }}>
            <div/>{["1st 12","2nd 12","3rd 12"].map(d=>(
              <div key={d} style={{ background:"rgba(6,182,212,0.05)",borderRadius:4,color:NEON_CYAN,textAlign:"center",fontSize:10,fontFamily:"'Inter', sans-serif",padding:"6px 0",border:"1px solid rgba(6,182,212,0.2)" }}>{d}</div>
            ))}<div/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"36px repeat(6, 1fr) 36px", gap:4 }}>
            <div/>{["1-18","Even","Red","Black","Odd","19-36"].map((b,i)=>(
              <div key={b} style={{ background:i===2?"rgba(236,72,153,0.1)":i===3?"rgba(30,41,59,0.5)":"rgba(6,182,212,0.05)",borderRadius:4,color:i===2?NEON_PINK:i===3?"#cbd5e1":NEON_CYAN,textAlign:"center",fontSize:10,fontFamily:"'Inter', sans-serif",padding:"6px 0",border:i===2?"1px solid rgba(236,72,153,0.3)":i===3?"1px solid rgba(148,163,184,0.2)":"1px solid rgba(6,182,212,0.2)" }}>{b}</div>
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
          <div key={b} style={{ background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.3)",borderRadius:8,color:NEON_PURP,textAlign:"center",fontSize:11,fontFamily:"'Inter', sans-serif",fontWeight:"600",padding:"8px 4px" }}>{b}</div>
        ))}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:8 }}>
        {[4,5,6,8,9,10].map(n=>(
          <div key={n} style={{ background:"rgba(6,182,212,0.05)",border:"1px solid rgba(6,182,212,0.2)",borderRadius:8,color:NEON_CYAN,textAlign:"center",fontFamily:"'Inter', sans-serif",fontWeight:"bold",fontSize:18,padding:"10px 0" }}>{n}</div>
        ))}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:20 }}>
        {["Come","Field","Don't Come"].map(b=>(
          <div key={b} style={{ background:"rgba(6,182,212,0.05)",border:"1px solid rgba(6,182,212,0.2)",borderRadius:8,color:NEON_CYAN,textAlign:"center",fontSize:10,fontFamily:"'Inter', sans-serif",padding:"7px 4px" }}>{b}</div>
        ))}
      </div>
      <div style={{ display:"flex",justifyContent:"center",gap:24 }}>
        <DieComponent value={5}/><DieComponent value={3}/>
      </div>
      <div style={{ textAlign:"center",color:NEON_CYAN,fontSize:12,fontFamily:"'Inter', sans-serif",fontWeight:"600",marginTop:14,opacity:.9 }}>Point: 8</div>
    </TableWrap>
  );
}

function BaccaratVisual() {
  return (
    <TableWrap>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20 }}>
        <CardRow color={NEON_CYAN} label="PLAYER — 7" cards={[{rank:"5",suit:"H"},{rank:"2",suit:"C"}]} />
        <CardRow color={NEON_PINK} label="BANKER — 6" cards={[{rank:"3",suit:"S"},{rank:"3",suit:"D"}]} />
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
        {[["Player","1.24%",NEON_CYAN,"rgba(6,182,212,0.1)"],["Tie","14.4%",NEON_PURP,"rgba(139,92,246,0.1)"],["Banker","1.06%",NEON_PINK,"rgba(236,72,153,0.1)"]].map(([l,e,tc,bg])=>(
          <div key={l} style={{ background:bg,borderRadius:8,border:`1px solid ${tc}40`,color:tc,textAlign:"center",fontFamily:"'Inter', sans-serif",padding:"10px 4px" }}>
            <div style={{ fontSize:12,fontWeight:"bold" }}>{l}</div>
            <div style={{ fontSize:10,opacity:.8,marginTop:2 }}>HE: {e}</div>
          </div>
        ))}
      </div>
    </TableWrap>
  );
}

function ThreeCardVisual() {
  return (
    <TableWrap>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
        <CardRow color={NEON_PINK} label="DEALER" cards={[{rank:"Q",suit:"S"},{rank:"8",suit:"H"},{rank:"4",suit:"C"}]} />
        <CardRow color={NEON_CYAN} label="PLAYER — FLUSH" cards={[{rank:"A",suit:"D"},{rank:"K",suit:"D"},{rank:"J",suit:"D"}]} />
      </div>
      <div style={{ background:"rgba(6,182,212,0.08)",border:"1px solid rgba(6,182,212,0.3)",borderRadius:10,padding:"12px",textAlign:"center",boxShadow:"0 0 15px rgba(6,182,212,0.1)" }}>
        <div style={{ color:NEON_CYAN,fontFamily:"'Inter', sans-serif",fontSize:13,fontWeight:"bold" }}>Player wins! Pair Plus pays 3:1</div>
      </div>
    </TableWrap>
  );
}

function SolitaireVisual() {
  const foundations = [{rank:"A",suit:"S"},{rank:"A",suit:"H"},{rank:"A",suit:"D"},{rank:"A",suit:"C"}];
  return (
    <TableWrap>
      <TableLabel color={NEON_PURP}>FOUNDATION PILES (build Ace → King)</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:8,marginBottom:20 }}>
        {foundations.map((c,i)=><PlayingCard key={i} rank={c.rank} suit={c.suit}/>)}
      </div>
      <Divider/>
      <TableLabel>TABLEAU (alternating colors, descending rank)</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:6 }}>
        <PlayingCard rank="K" suit="S"/>
        <PlayingCard rank="Q" suit="H"/>
        <PlayingCard rank="J" suit="C"/>
        <PlayingCard rank="10" suit="D"/>
        <PlayingCard faceDown/>
        <PlayingCard faceDown/>
        <PlayingCard faceDown/>
      </div>
    </TableWrap>
  );
}

function YahtzeeVisual() {
  return (
    <TableWrap>
      <TableLabel>FULL HOUSE — 3+2</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:12,marginBottom:20 }}>
        <DieComponent value={5}/><DieComponent value={5}/><DieComponent value={5}/>
        <DieComponent value={3}/><DieComponent value={3}/>
      </div>
      <Divider/>
      <TableLabel color={NEON_PURP}>KEEP ALL — SCORE 25 PTS</TableLabel>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
        {["Ones","Twos","Threes","Fours","Fives","Sixes"].map(s=>(
          <div key={s} style={{ background:"rgba(6,182,212,0.05)",border:"1px solid rgba(6,182,212,0.2)",borderRadius:6,color:NEON_CYAN,textAlign:"center",fontSize:11,fontWeight:"600",fontFamily:"'Inter', sans-serif",padding:"8px 0" }}>{s}</div>
        ))}
      </div>
    </TableWrap>
  );
}

function FarkleVisual() {
  return (
    <TableWrap>
      <TableLabel>SIX-DICE ROLL</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap",marginBottom:20 }}>
        {[1,5,3,3,2,4].map((v,i)=><DieComponent key={i} value={v}/>)}
      </div>
      <Divider/>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
        {[["1 = 100 pts","keep"],["5 = 50 pts","keep"],["Three 3s = 300","keep? bank?"],["2,4 = 0 pts","cannot keep"]].map(([l,s])=>(
          <div key={l} style={{ background:"rgba(6,182,212,0.05)",border:"1px solid rgba(6,182,212,0.2)",borderRadius:8,padding:"10px 12px" }}>
            <div style={{ color:NEON_CYAN,fontSize:12,fontFamily:"'Inter', sans-serif",fontWeight:"bold" }}>{l}</div>
            <div style={{ color:"#94a3b8",fontSize:11,fontFamily:"'Inter', sans-serif",marginTop:2 }}>{s}</div>
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
      <div style={{ display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap",marginBottom:20 }}>
        <PlayingCard rank="3" suit="H"/><PlayingCard rank="4" suit="H"/><PlayingCard rank="5" suit="H"/>
        <PlayingCard rank="7" suit="S"/><PlayingCard rank="7" suit="D"/><PlayingCard rank="7" suit="C"/>
        <PlayingCard rank="K" suit="S"/>
      </div>
      <Divider/>
      <div style={{ display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:12 }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:NEON_CYAN,fontSize:11,fontFamily:"'Inter', sans-serif",fontWeight:"bold",letterSpacing:1,marginBottom:8 }}>SEQUENCE (RUN)</div>
          <div style={{ display:"flex",gap:4 }}><PlayingCard rank="3" suit="H"/><PlayingCard rank="4" suit="H"/><PlayingCard rank="5" suit="H"/></div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:NEON_PURP,fontSize:11,fontFamily:"'Inter', sans-serif",fontWeight:"bold",letterSpacing:1,marginBottom:8 }}>SET (GROUP)</div>
          <div style={{ display:"flex",gap:4 }}><PlayingCard rank="7" suit="S"/><PlayingCard rank="7" suit="D"/><PlayingCard rank="7" suit="C"/></div>
        </div>
      </div>
    </TableWrap>
  );
}

function CribbageVisual() {
  return (
    <TableWrap>
      <TableLabel>CRIBBAGE HAND SCORING</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap",marginBottom:20 }}>
        <PlayingCard rank="5" suit="S"/><PlayingCard rank="5" suit="D"/><PlayingCard rank="J" suit="H"/><PlayingCard rank="4" suit="C"/>
        <div style={{ marginLeft: 16 }}>
          <PlayingCard rank="6" suit="H"/>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
        {[["Fifteens (5+10, etc.)","2 pts each"],["Pairs (5+5)","2 pts"],["Runs (4-5-6)","3 pts"],["Nobs (Jack of start suit)","1 pt"]].map(([l,s])=>(
          <div key={l} style={{ background:"rgba(139,92,246,0.05)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:8,padding:"10px 12px" }}>
            <div style={{ color:NEON_PURP,fontSize:12,fontFamily:"'Inter', sans-serif",fontWeight:"bold" }}>{l}</div>
            <div style={{ color:"#94a3b8",fontSize:11,fontFamily:"'Inter', sans-serif",marginTop:2 }}>{s}</div>
          </div>
        ))}
      </div>
    </TableWrap>
  );
}

function PaiGowVisual() {
  return (
    <TableWrap>
      <TableLabel>PAI GOW HAND SPLIT</TableLabel>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div>
          <div style={{ color:NEON_CYAN, fontSize:10, marginBottom:8, textAlign:"center", fontWeight:"bold" }}>5-CARD HAND (Must be higher)</div>
          <div style={{ display:"flex", gap:6 }}>
            <PlayingCard rank="A" suit="S"/><PlayingCard rank="K" suit="S"/><PlayingCard rank="Q" suit="S"/><PlayingCard rank="J" suit="S"/><PlayingCard rank="10" suit="S"/>
          </div>
        </div>
        <Divider />
        <div>
          <div style={{ color:NEON_PURP, fontSize:10, marginBottom:8, textAlign:"center", fontWeight:"bold" }}>2-CARD HAND</div>
          <div style={{ display:"flex", gap:6 }}>
            <PlayingCard rank="8" suit="H"/><PlayingCard rank="8" suit="D"/>
          </div>
        </div>
      </div>
    </TableWrap>
  );
}

function SicBoVisual() {
  return (
    <TableWrap>
      <TableLabel>SIC BO ROLL</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:16,marginBottom:20 }}>
        <DieComponent value={4}/><DieComponent value={4}/><DieComponent value={6}/>
      </div>
      <Divider/>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
        {[["Small (4-10)","Loses"],["Big (11-17)","Wins (14)"],["Double 4","Wins"]].map(([l,s])=>(
          <div key={l} style={{ background:"rgba(6,182,212,0.05)",border:"1px solid rgba(6,182,212,0.2)",borderRadius:8,padding:"10px 4px",textAlign:"center" }}>
            <div style={{ color:NEON_CYAN,fontSize:11,fontFamily:"'Inter', sans-serif",fontWeight:"bold" }}>{l}</div>
            <div style={{ color:"#94a3b8",fontSize:10,fontFamily:"'Inter', sans-serif",marginTop:2 }}>{s}</div>
          </div>
        ))}
      </div>
    </TableWrap>
  );
}

function LetItRideVisual() {
  return (
    <TableWrap>
      <CardRow color={NEON_PURP} label="COMMUNITY CARDS" cards={[{rank:"A",suit:"S"},{faceDown:true}]} />
      <div style={{ textAlign:"center", marginTop:14, marginBottom:14 }}>
        <div style={{ display:"inline-flex", gap:16 }}>
          <Chip color="cyan" label="$10"/><Chip color="cyan" label="$10"/><Chip color="cyan" label="$10"/>
        </div>
        <div style={{ color:"#94a3b8", fontSize:11, fontFamily:"'Inter', sans-serif", marginTop:8 }}>You can pull back up to 2 bets</div>
      </div>
      <Divider />
      <CardRow label="YOUR HAND" cards={[{rank:"K",suit:"S"},{rank:"Q",suit:"S"},{rank:"J",suit:"S"}]} />
    </TableWrap>
  );
}

function CaribbeanVisual() {
  return (
    <TableWrap>
      <CardRow color={NEON_PINK} label="DEALER HAND" cards={[{rank:"A",suit:"H"},{faceDown:true},{faceDown:true},{faceDown:true},{faceDown:true}]} />
      <div style={{ textAlign:"center", marginTop:14, marginBottom:14 }}>
        <div style={{ display:"inline-flex", gap:16 }}>
          <Chip color="cyan" label="ANTE"/><Chip color="pink" label="PLAY (2x)"/><Chip color="gold" label="JACKPOT"/>
        </div>
        <div style={{ color:"#94a3b8", fontSize:11, fontFamily:"'Inter', sans-serif", marginTop:8 }}>Dealer needs A-K or better to qualify</div>
      </div>
      <Divider />
      <CardRow label="YOUR HAND" cards={[{rank:"K",suit:"C"},{rank:"K",suit:"D"},{rank:"4",suit:"S"},{rank:"8",suit:"H"},{rank:"2",suit:"C"}]} />
    </TableWrap>
  );
}


function DominoesVisual() {
  return (
    <TableWrap>
      <TableLabel>DOMINOES (DOUBLE SIX)</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",alignItems:"center",gap:6,marginBottom:20 }}>
        <div style={{ width:24,height:48,background:"#f8fafc",borderRadius:4,border:"1px solid #94a3b8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-around",padding:"2px 0" }}>
          <div style={{ width:4,height:4,background:"#0f172a",borderRadius:"50%" }}/>
          <div style={{ width:20,height:1,background:"#94a3b8" }}/>
          <div style={{ width:4,height:4,background:"#0f172a",borderRadius:"50%" }}/>
        </div>
        <div style={{ width:48,height:24,background:"#f8fafc",borderRadius:4,border:"1px solid #94a3b8",display:"flex",alignItems:"center",justifyContent:"space-around",padding:"0 2px" }}>
          <div style={{ width:4,height:4,background:"#0f172a",borderRadius:"50%" }}/>
          <div style={{ width:1,height:20,background:"#94a3b8" }}/>
          <div style={{ display:"flex",gap:2 }}><div style={{ width:4,height:4,background:"#0f172a",borderRadius:"50%" }}/><div style={{ width:4,height:4,background:"#0f172a",borderRadius:"50%" }}/></div>
        </div>
        <div style={{ width:24,height:48,background:"#f8fafc",borderRadius:4,border:"1px solid #94a3b8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-around",padding:"2px 0" }}>
          <div style={{ display:"flex",gap:2 }}><div style={{ width:4,height:4,background:"#0f172a",borderRadius:"50%" }}/><div style={{ width:4,height:4,background:"#0f172a",borderRadius:"50%" }}/></div>
          <div style={{ width:20,height:1,background:"#94a3b8" }}/>
          <div style={{ display:"flex",gap:2,flexDirection:"column" }}><div style={{ width:4,height:4,background:"#0f172a",borderRadius:"50%" }}/><div style={{ width:4,height:4,background:"#0f172a",borderRadius:"50%" }}/><div style={{ width:4,height:4,background:"#0f172a",borderRadius:"50%" }}/></div>
        </div>
      </div>
      <div style={{ textAlign:"center",color:NEON_CYAN,fontSize:12,fontFamily:"'Inter', sans-serif" }}>Match ends to build the train.</div>
    </TableWrap>
  );
}

function MahjongVisual() {
  return (
    <TableWrap>
      <TableLabel>MAHJONG TILES</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:4,marginBottom:20 }}>
        {["🀙","🀚","🀛","🀇","🀇","🀇","🀄","🀄"].map((t,i)=>(
          <div key={i} style={{ width:32,height:44,background:"#f8fafc",borderRadius:4,borderBottom:"4px solid #10b981",borderRight:"2px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:"#0f172a" }}>{t}</div>
        ))}
      </div>
      <div style={{ display:"flex",justifyContent:"space-around" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:NEON_CYAN,fontSize:10,fontWeight:"bold",marginBottom:4 }}>CHOW (Sequence)</div>
          <div style={{ color:"#94a3b8",fontSize:10 }}>1-2-3 Dots</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:NEON_PURP,fontSize:10,fontWeight:"bold",marginBottom:4 }}>PUNG (Set)</div>
          <div style={{ color:"#94a3b8",fontSize:10 }}>Three 1-Characters</div>
        </div>
      </div>
    </TableWrap>
  );
}

function BackgammonVisual() {
  return (
    <TableWrap>
      <TableLabel>BACKGAMMON BOARD</TableLabel>
      <div style={{ background:"#854d0e",padding:8,borderRadius:8,display:"flex",gap:8,justifyContent:"center",marginBottom:20 }}>
        <div style={{ width:80,height:60,background:"#a16207",position:"relative" }}>
          <div style={{ position:"absolute",top:0,left:10,width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:"25px solid #fef08a" }}/>
          <div style={{ position:"absolute",top:0,left:30,width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:"25px solid #1e293b" }}/>
          <div style={{ position:"absolute",top:0,left:10,width:16,height:16,background:"#1e293b",borderRadius:"50%",border:"2px solid #334155" }}/>
          <div style={{ position:"absolute",top:8,left:10,width:16,height:16,background:"#1e293b",borderRadius:"50%",border:"2px solid #334155" }}/>
        </div>
        <div style={{ width:10,background:"#422006" }}/>
        <div style={{ width:80,height:60,background:"#a16207",position:"relative" }}>
          <div style={{ position:"absolute",bottom:0,left:10,width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderBottom:"25px solid #1e293b" }}/>
          <div style={{ position:"absolute",bottom:0,left:30,width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderBottom:"25px solid #fef08a" }}/>
          <div style={{ position:"absolute",bottom:0,left:30,width:16,height:16,background:"#f8fafc",borderRadius:"50%",border:"2px solid #cbd5e1" }}/>
        </div>
      </div>
      <div style={{ display:"flex",justifyContent:"center",gap:16 }}>
        <DieComponent value={4} size={32}/><DieComponent value={2} size={32}/>
      </div>
    </TableWrap>
  );
}

function CheckersVisual() {
  return (
    <TableWrap>
      <TableLabel>CHECKERS BOARD</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",marginBottom:16 }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(8, 30px)",gridTemplateRows:"repeat(8, 30px)",border:"2px solid #334155",boxShadow:"0 4px 15px rgba(0,0,0,0.3)" }}>
          {Array.from({length: 64}).map((_, i) => {
            const r = Math.floor(i / 8);
            const c = i % 8;
            const isLight = (r + c) % 2 === 0;
            
            let piece = null;
            if (!isLight) {
              if (r < 3) piece = <div style={{width:22,height:22,borderRadius:"50%",background:"#ef4444",border:"2px solid #b91c1c",boxShadow:"inset 0 2px 4px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.5)"}}/>;
              else if (r > 4) piece = <div style={{width:22,height:22,borderRadius:"50%",background:"#0f172a",border:"2px solid #020617",boxShadow:"inset 0 2px 4px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.5)"}}/>;
            }

            return (
              <div key={i} style={{ background:isLight?"#cbd5e1":"#475569",display:"flex",alignItems:"center",justifyContent:"center" }}>
                {piece}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ textAlign:"center",color:"#94a3b8",fontSize:11,fontFamily:"'Inter', sans-serif" }}>Pieces move and capture diagonally on dark squares.</div>
    </TableWrap>
  );
}

function ChessVisual() {
  const [activePiece, setActivePiece] = useState("Knight");

  const isValidMove = (piece, r, c) => {
    const dr = Math.abs(r - 4);
    const dc = Math.abs(c - 4);
    if (dr === 0 && dc === 0) return false;
    
    switch (piece) {
      case "Pawn": return c === 4 && (r === 3 || r === 2);
      case "Rook": return dr === 0 || dc === 0;
      case "Bishop": return dr === dc;
      case "Queen": return dr === 0 || dc === 0 || dr === dc;
      case "King": return dr <= 1 && dc <= 1;
      case "Knight": return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
      default: return false;
    }
  };

  const getSymbol = (piece) => {
    switch (piece) {
      case "Pawn": return "♙";
      case "Rook": return "♖";
      case "Knight": return "♘";
      case "Bishop": return "♗";
      case "Queen": return "♕";
      case "King": return "♔";
      default: return "";
    }
  };

  return (
    <TableWrap>
      <TableLabel color={NEON_PURP}>INTERACTIVE MOVEMENT TUTORIAL</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",marginBottom:16 }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(8, 30px)",gridTemplateRows:"repeat(8, 30px)",border:"2px solid #334155",boxShadow:"0 4px 15px rgba(0,0,0,0.3)" }}>
          {Array.from({length: 64}).map((_, i) => {
            const r = Math.floor(i / 8);
            const c = i % 8;
            const isLight = (r + c) % 2 === 0;
            const isCenter = r === 4 && c === 4;
            const isHighlight = isValidMove(activePiece, r, c);
            
            let bg = isLight ? "#cbd5e1" : "#475569";
            if (isHighlight) bg = "rgba(6,182,212,0.6)";
            if (isCenter) bg = "rgba(139,92,246,0.6)";

            return (
              <div key={i} style={{ background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,transition:"background 0.2s" }}>
                {isCenter ? getSymbol(activePiece) : (isHighlight ? <div style={{width:8,height:8,background:"#020617",borderRadius:"50%",opacity:0.5}}/> : "")}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap" }}>
        {["Pawn", "Knight", "Bishop", "Rook", "Queen", "King"].map(p => (
          <button 
            key={p} 
            onClick={() => setActivePiece(p)}
            style={{ background:activePiece===p?"rgba(139,92,246,0.2)":"rgba(30,41,59,0.5)", border:`1px solid ${activePiece===p?"#a855f7":"#475569"}`, color:activePiece===p?"#f8fafc":"#94a3b8", padding:"6px 12px", borderRadius:6, cursor:"pointer", fontFamily:"'Inter', sans-serif", fontSize:11, fontWeight:"600", transition:"all 0.2s" }}>
            {getSymbol(p)} {p}
          </button>
        ))}
      </div>
      <div style={{ textAlign:"center",color:"#94a3b8",fontSize:11,fontFamily:"'Inter', sans-serif",marginTop:12,lineHeight:1.5,height:32 }}>
        {activePiece === "Pawn" && "Pawns move straight forward 1 square (or 2 on their first move). They capture diagonally."}
        {activePiece === "Knight" && "Knights move in an L-shape (2 squares one direction, 1 square perpendicular). They can jump over other pieces."}
        {activePiece === "Bishop" && "Bishops move any number of squares diagonally."}
        {activePiece === "Rook" && "Rooks move any number of squares horizontally or vertically."}
        {activePiece === "Queen" && "Queens move any number of squares in any direction (combines Rook and Bishop)."}
        {activePiece === "King" && "Kings move exactly 1 square in any direction."}
      </div>
    </TableWrap>
  );
}

function PaiGowTilesVisual() {
  return (
    <TableWrap>
      <TableLabel>PAI GOW (TILES) HAND</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:24,marginBottom:20 }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:NEON_CYAN,fontSize:10,fontWeight:"bold",marginBottom:8 }}>HIGH HAND</div>
          <div style={{ display:"flex",gap:4 }}>
            <div style={{ width:24,height:48,background:"#1e293b",borderRadius:4,border:"1px solid #475569",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-around",padding:"2px 0" }}>
              <div style={{ display:"flex",gap:2 }}><div style={{ width:4,height:4,background:"#ef4444",borderRadius:"50%" }}/><div style={{ width:4,height:4,background:"#ef4444",borderRadius:"50%" }}/></div>
              <div style={{ width:20,height:1,background:"#475569" }}/>
              <div style={{ display:"flex",gap:2 }}><div style={{ width:4,height:4,background:"#ef4444",borderRadius:"50%" }}/><div style={{ width:4,height:4,background:"#ef4444",borderRadius:"50%" }}/></div>
            </div>
            <div style={{ width:24,height:48,background:"#1e293b",borderRadius:4,border:"1px solid #475569",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-around",padding:"2px 0" }}>
              <div style={{ display:"flex",gap:2 }}><div style={{ width:4,height:4,background:"#ef4444",borderRadius:"50%" }}/><div style={{ width:4,height:4,background:"#ef4444",borderRadius:"50%" }}/></div>
              <div style={{ width:20,height:1,background:"#475569" }}/>
              <div style={{ display:"flex",gap:2 }}><div style={{ width:4,height:4,background:"#ef4444",borderRadius:"50%" }}/><div style={{ width:4,height:4,background:"#ef4444",borderRadius:"50%" }}/></div>
            </div>
          </div>
          <div style={{ color:"#94a3b8",fontSize:10,marginTop:6 }}>"Gee Joon" (Supreme Pair)</div>
        </div>
      </div>
    </TableWrap>
  );
}


function GenericCardVisual({ cards }) {
  return (
    <TableWrap>
      <TableLabel>EXAMPLE HAND</TableLabel>
      <div style={{ display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap" }}>
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
    cribbage: <CribbageVisual/>,
    pai_gow: <PaiGowVisual/>,
    sic_bo: <SicBoVisual/>,
    let_it_ride: <LetItRideVisual/>,
    caribbean_stud: <CaribbeanVisual/>,
    dominoes: <DominoesVisual/>,
    mahjong: <MahjongVisual/>,
    backgammon: <BackgammonVisual/>,
    checkers: <CheckersVisual/>,
    chess: <ChessVisual/>,
    pai_gow_tiles: <PaiGowTilesVisual/>
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
  {
    id:"pai_gow", name:"Pai Gow Poker", emoji:"🀄", category:"Casino — Cards",
    players:"1–6 vs. Dealer", difficulty:"Medium", type:"card",
    tagline:"Split 7 cards into a high and low hand to beat the dealer.",
    overview:"Pai Gow Poker is a slower-paced casino game where you receive seven cards and must arrange them into two hands: a 5-card hand and a 2-card hand. You must beat both of the dealer's corresponding hands to win your bet.",
    terminology:[
      {term:"High Hand",def:"Your 5-card hand. Must rank higher than your 2-card hand."},
      {term:"Low Hand",def:"Your 2-card hand. Can only be a pair or high cards."},
      {term:"Copy",def:"A tie between hands. The dealer wins all copies."},
      {term:"Fouling",def:"Making your 2-card hand higher than your 5-card hand (an automatic loss)."},
      {term:"House Way",def:"The standardized set of rules the dealer must use to set their hand."},
    ],
    setup:["Played with a 53-card deck (standard deck plus one Joker).","The Joker acts as a bug: it can complete a straight or flush, otherwise it is an Ace.","Place your bet. You receive 7 cards."],
    howToPlay:["Arrange your 7 cards into a 5-card high hand and a 2-card low hand.","The 5-card hand MUST be stronger than the 2-card hand.","The dealer sets their hand according to strict 'House Way' rules.","Compare 5-card hands, then 2-card hands.","Win both = You win 1:1 (minus 5% commission).","Win one, lose one = Push (your bet is returned).","Lose both (or tie/copy) = You lose the bet."],
    strategy:["The optimal strategy is complex, but generally: if no pairs, put the highest card in the back and next two highest in the front.","With two pair: split them unless you have an Ace to play in the front.","You can ask the dealer to set your hand 'House Way' if unsure."],
    mistakes:["Fouling your hand by making the 2-card hand stronger.","Not utilizing the Joker properly (it's not fully wild)."],
    payouts:[{bet:"Win both hands",pays:"1:1 (minus 5% comm.)"},{bet:"Win 1, Lose 1",pays:"Push"},{bet:"Lose both",pays:"Loss"}],
  },
  {
    id:"let_it_ride", name:"Let It Ride", emoji:"🏇", category:"Casino — Cards",
    players:"1–7", difficulty:"Easy", type:"card",
    tagline:"Pull bets back if you don't like your cards.",
    overview:"Let It Ride flips the usual betting structure: you start with three bets and can pull two of them back as cards are revealed. You win based on a payout table for your final 5-card hand (no dealer hand to beat).",
    terminology:[
      {term:"Pull",def:"Taking back one of your three bets."},
      {term:"Let It Ride",def:"Leaving your bet on the table."},
      {term:"Community Cards",def:"Two face-down cards shared by all players."},
    ],
    setup:["Place three equal bets on circles marked 1, 2, and $ (or 3).","You are dealt three private cards; two community cards are dealt face-down."],
    howToPlay:["Look at your 3 cards. If you like them, 'Let It Ride'. If not, pull your bet back from circle 1.","The dealer reveals the first community card.","Look at your 4-card hand. Again, 'Let It Ride' or pull back the bet from circle 2.","The final community card is revealed. Your third bet ($) cannot be pulled back.","If your 5-card hand is a Pair of 10s or better, all remaining bets win according to the paytable."],
    strategy:["With 3 cards: Only let it ride if you have a paying pair (10s+), 3-to-a-Royal, or 3-to-a-Straight Flush (with high cards).","With 4 cards: Let it ride if you have a paying pair, two pair, 4-to-a-Flush, or an open-ended 4-to-a-Straight (with high cards).","Otherwise, always pull your bet back."],
    mistakes:["Letting it ride on weak draws just because you 'feel lucky'.","Pulling a bet when you already have a guaranteed paying hand (Pair of 10s or better)."],
    payouts:[{bet:"Pair of 10s or better",pays:"1:1"},{bet:"Two Pair",pays:"2:1"},{bet:"Three of a Kind",pays:"3:1"},{bet:"Straight",pays:"11:1"},{bet:"Flush",pays:"8:1"},{bet:"Full House",pays:"11:1"},{bet:"Four of a Kind",pays:"50:1"},{bet:"Straight Flush",pays:"200:1"},{bet:"Royal Flush",pays:"1000:1"}],
  },
  {
    id:"caribbean_stud", name:"Caribbean Stud Poker", emoji:"🌴", category:"Casino — Cards",
    players:"1–7 vs. Dealer", difficulty:"Easy", type:"card",
    tagline:"5-card stud against the house with a huge jackpot.",
    overview:"A casino table game based on 5-card stud poker. You play against the dealer, but the dealer must 'qualify' to play. There is also a progressive jackpot side bet for premium hands.",
    terminology:[
      {term:"Ante",def:"Initial mandatory bet."},
      {term:"Play",def:"A bet exactly 2x the Ante to stay in the hand."},
      {term:"Qualify",def:"The dealer needs at least an Ace and a King in their 5-card hand to qualify."},
      {term:"Progressive",def:"A $1 side bet that pays out for flushes, full houses, and straight/royal flushes."},
    ],
    setup:["Place your Ante bet. Optionally place a $1 chip for the progressive jackpot.","You receive 5 cards face-down.","The dealer receives 5 cards (4 face-down, 1 face-up)."],
    howToPlay:["Look at your hand and the dealer's upcard.","Decide to Fold (lose Ante) or Play (place bet 2x the Ante).","Dealer reveals their hand.","If dealer does NOT qualify (worse than A-K): You win 1:1 on Ante; Play bet pushes.","If dealer QUALIFIES and you win: Ante wins 1:1. Play bet wins based on a paytable (Pair 1:1, Two Pair 2:1, etc.).","If dealer QUALIFIES and you lose: You lose both bets."],
    strategy:["Always Play with a pair or higher.","Always Fold with less than Ace-King high.","If you hold Ace-King, Play if the dealer's upcard matches one of your other three cards (makes it less likely the dealer paired)."],
    mistakes:["Folding small pairs.","Playing weak Ace-high or King-high hands without the other."],
    payouts:[{bet:"Ante Win",pays:"1:1"},{bet:"Play - Pair/High Card",pays:"1:1"},{bet:"Play - Two Pair",pays:"2:1"},{bet:"Play - Three of a Kind",pays:"3:1"},{bet:"Play - Straight",pays:"4:1"},{bet:"Play - Flush",pays:"5:1"},{bet:"Play - Full House",pays:"7:1"},{bet:"Play - 4 of a Kind",pays:"20:1"}],
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
  },
  {
    id:"sic_bo", name:"Sic Bo", emoji:"🎲", category:"Casino — Dice",
    players:"1–10", difficulty:"Easy", type:"dice",
    tagline:"Predict the outcome of three shaking dice.",
    overview:"An ancient Chinese game of chance played with three dice. The dealer shakes them in a glass dome, and players bet on the massive table layout showing all possible combinations.",
    terminology:[
      {term:"Small",def:"Total score of the 3 dice is 4 to 10 (excluding triples)."},
      {term:"Big",def:"Total score of the 3 dice is 11 to 17 (excluding triples)."},
      {term:"Triple",def:"All three dice show the same number (e.g., 4-4-4)."},
    ],
    setup:["Buy chips and place them on the table layout before the dealer stops betting.","The dealer activates the shaker, rolling the 3 dice."],
    howToPlay:["Place your bets on any area of the board (Total sum, Small/Big, Doubles, Triples, specific numbers).","The dealer reveals the three dice.","Winning areas light up on the board, and payouts are made."],
    strategy:["Betting Small or Big offers the best odds (House edge ~2.78%), paying 1:1.","Avoid specific triples (House edge can be 16%+) unless just for fun.","Combination bets (two specific numbers) have decent odds (~2.77% edge)."],
    mistakes:["Chasing massive payouts like 'Specific Triple' (180:1) as a primary strategy.","Betting conflicting outcomes that cancel each other out."],
    payouts:[{bet:"Small / Big",pays:"1:1"},{bet:"Specific Double",pays:"10:1"},{bet:"Specific Triple",pays:"180:1"},{bet:"Any Triple",pays:"30:1"},{bet:"Two-Dice Combination",pays:"6:1"}],
  },
  /* ── CLASSIC CARD GAMES ── */
  {
    id:"cribbage", name:"Cribbage", emoji:"🧮", category:"Classic — Cards",
    players:"2", difficulty:"Medium", type:"card",
    tagline:"Score points with fifteens, pairs, and runs on a wooden board.",
    overview:"Cribbage is a beloved classic card game uniquely scored on a pegboard. Players create combinations of cards that sum to 15, form pairs, or make runs. A unique element is the 'Crib', a separate hand scored by the dealer.",
    terminology:[
      {term:"The Crib",def:"Four extra cards (two discarded by each player) that belong to the dealer."},
      {term:"Pegging",def:"Scoring points during the card-playing phase."},
      {term:"Fifteen",def:"Any combination of cards summing exactly to 15 (scores 2 points)."},
      {term:"Nobs",def:"Holding a Jack of the same suit as the starter card (scores 1 point)."},
      {term:"Muggins",def:"Stealing points an opponent forgot to claim (if playing with this optional rule)."},
    ],
    setup:["Standard 52-card deck and a Cribbage board.","Deal 6 cards to each player.","Each player chooses 2 cards to discard face-down into the 'Crib'.","Non-dealer cuts the deck; dealer flips the top card (the Starter). If it's a Jack, dealer pegs 2 points ('His Heels')."],
    howToPlay:["**The Play:** Players take turns laying down one card face-up, announcing the running total.","Total cannot exceed 31. If you can't play, say 'Go'. Opponent plays until they can't. Last player to play pegs 1 (or 2 if exactly 31).","Peg points during play for reaching 15, pairs, and runs.","**The Show:** After all cards are played, players score their hands using their 4 cards + the Starter card.","Score 2 pts for every combination of 15. Score pairs (2), triples (6), runs (1 pt/card), and flushes.","Non-dealer scores first, then dealer scores their hand, then dealer scores the Crib.","First to 121 points wins."],
    strategy:["When discarding to opponent's crib, break up 15s, 5s, and connected cards (e.g., 7-8).","When discarding to your own crib, give yourself 5s or connected cards.","During play, try not to make the count 21 (sets up opponent for an easy 31).","Leading a 4 is very safe; leading a 5 is very dangerous (opponent plays a 10-card for 15)."],
    mistakes:["Missing 15s during the Show (count methodically!).","Discarding a 5 to the opponent's crib (5s are the most valuable cards in cribbage)."],
    payouts:[{bet:"Fifteen",pays:"2 pts"},{bet:"Pair",pays:"2 pts"},{bet:"Run of 3+",pays:"1 pt per card"},{bet:"Flush (4 or 5)",pays:"1 pt per card"},{bet:"Nobs",pays:"1 pt"},{bet:"Target",pays:"121 pts to win"}],
  },
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
      {term:"Going Out",def:"Melding your remaining cards and discarding your final card to end the round."},
    ],
    setup:["Standard 52-card deck. 2 players: deal 10 cards each. 3–4 players: 7 cards. 5–6 players: 6 cards.","Place remaining cards face-down as the stock.","Turn the top card face-up beside the stock to start the discard pile."],
    howToPlay:["On your turn: draw the top card from the stock OR the top card from the discard pile.","Optionally lay down any valid melds face-up on the table.","Optionally add cards to existing melds (your own or other players').","Discard one card face-up to end your turn.","First player to meld all cards and discard wins the round."],
    strategy:["Watch the discard pile — it reveals what opponents are building.","Don't draw from the discard pile unless it completes a meld.","Flexible cards (middle-rank cards like 6, 7, 8) can form melds in more directions."],
    mistakes:["Drawing from the discard pile too liberally — you're showing opponents what you need.","Hoarding high-value unmatched cards — they hurt your score when someone goes out."],
    payouts:[{bet:"Winner",pays:"0 points"},{bet:"Loser penalty",pays:"Sum of deadwood"}],
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
    ],
    setup:["Standard 52-card deck; Aces are low.","Deal 10 cards to each player.","Turn one card up to start discard pile."],
    howToPlay:["Draw one card (stock or discard). Form melds in your hand. Discard one card.","When your deadwood is 10 or less, you may Knock by discarding face-down.","After a Knock: both players reveal hands. Non-knocker may lay off cards onto knocker's melds.","Score = knocker's deadwood minus non-knocker's remaining deadwood.","If knocker wins: they score the difference. If non-knocker ties or beats knocker: undercut! Non-knocker scores difference plus 25-pt bonus."],
    strategy:["Aim for Gin when you're close — the 25-point bonus is significant.","Knock early with low deadwood rather than risking an undercut."],
    mistakes:["Knocking with too much deadwood — opponent may undercut you.","Discarding without thinking about what your opponent needs."],
    payouts:[{bet:"Knock win",pays:"Deadwood difference"},{bet:"Gin",pays:"Opponent deadwood + 25 bonus"},{bet:"Undercut",pays:"Difference + 25 bonus to non-knocker"}],
    visualCards:[{rank:"J",suit:"D"},{rank:"Q",suit:"D"},{rank:"K",suit:"D"},{rank:"7",suit:"H"},{rank:"7",suit:"S"},{rank:"7",suit:"C"},{rank:"4",suit:"S"},{rank:"9",suit:"H"},{rank:"2",suit:"C"},{rank:"A",suit:"S"}],
  },
  {
    id:"solitaire", name:"Klondike Solitaire", emoji:"🂡", category:"Solo — Cards",
    players:"1", difficulty:"Easy", type:"card",
    tagline:"The classic solo card game — build four foundation piles Ace to King.",
    overview:"Klondike Solitaire (commonly called simply \"Solitaire\") is the most played card game in history. The goal is to move all 52 cards to four Foundation piles, one per suit, built up from Ace to King.",
    terminology:[
      {term:"Tableau",def:"The seven columns of cards you build and manipulate during play."},
      {term:"Foundation",def:"Four piles (one per suit) built Ace → King. Filling all four wins the game."},
      {term:"Stock",def:"The remaining draw pile after the Tableau is dealt."},
      {term:"Waste Pile",def:"Cards drawn from the Stock go here. Top card is available to play."},
    ],
    setup:["Shuffle 52 cards.","Deal 7 columns: column 1 gets 1 card, column 2 gets 2, … column 7 gets 7 cards.","Top card of each column is face-up; rest are face-down.","Remaining 24 cards form the Stock."],
    howToPlay:["Move cards between Tableau columns: place a card on one that is one rank higher and opposite color.","You may move face-up sequences of cards together as a unit.","When a face-down card is uncovered, flip it face-up.","An empty column can only be filled with a King.","Draw from the Stock (1 or 3 cards at a time depending on variant).","Ace → Foundation: move any Ace to a Foundation. Then build 2, 3, 4… up to King on that Foundation."],
    strategy:["Prioritize uncovering face-down Tableau cards over moving to Foundations early.","Move Kings to empty columns only if they free important face-down cards."],
    mistakes:["Emptying a column without a King ready to fill it.","Moving cards to Foundations too quickly, trapping cards you need for the Tableau."],
    payouts:[{bet:"Win",pays:"All cards in Foundations"}],
  },
  {
    id:"yahtzee", name:"Yahtzee", emoji:"🎲", category:"Classic — Dice",
    players:"1+", difficulty:"Easy", type:"dice",
    tagline:"Roll dice to fill scoring categories — aim for the elusive 5-of-a-kind.",
    overview:"Yahtzee is a classic dice game of probability and risk. Roll 5 dice up to three times per turn to achieve specific combinations (like poker hands) and fill your 13-category scorecard.",
    terminology:[
      {term:"Yahtzee",def:"Five of a kind. Worth 50 points."},
      {term:"Upper Section",def:"Categories for 1s, 2s, 3s, 4s, 5s, 6s."},
      {term:"Lower Section",def:"Poker-style combinations (3 of a kind, Full House, Straights)."},
    ],
    setup:["Each player gets a scorecard.","Determine who goes first."],
    howToPlay:["On your turn, roll 5 dice.","You may keep any number of dice and reroll the rest, up to 2 more times (3 rolls total).","After your 3rd roll (or sooner if you choose), you MUST enter a score or a zero in one of your 13 categories.","Once a category is filled, it cannot be used again.","Game ends after 13 rounds when scorecards are full."],
    strategy:["Always aim for the Upper Section bonus (63 points required, meaning an average of three-of-a-kind for every number).","Use 'Chance' as a garbage bin for terrible rolls.","Don't waste early rolls putting zeros in hard categories — you might hit them later."],
    mistakes:["Using Chance too early in the game.","Ignoring the 35-point Upper Section bonus."],
    payouts:[{bet:"Yahtzee",pays:"50 pts"},{bet:"Large Straight",pays:"40 pts"},{bet:"Small Straight",pays:"30 pts"},{bet:"Full House",pays:"25 pts"}],
  },
  {
    id:"farkle", name:"Farkle", emoji:"🎲", category:"Classic — Dice",
    players:"2+", difficulty:"Easy", type:"dice",
    tagline:"Push your luck rolling six dice, but don't Farkle!",
    overview:"A risk-taking dice game where you roll six dice to score points. You can keep rolling as long as you score, but if you roll and score nothing, you 'Farkle' and lose all points for that turn.",
    terminology:[
      {term:"Farkle",def:"Rolling the dice and getting zero scoring combinations. Turn ends, zero points."},
      {term:"Hot Dice",def:"Scoring with all six dice. You get to pick them all up and keep rolling!"},
      {term:"Bank",def:"Stopping your turn and adding your accumulated points to your total."},
    ],
    setup:["Six dice and a scorepad.","Decide on winning score (usually 10,000)."],
    howToPlay:["Roll all 6 dice.","Set aside at least one scoring die/combination (1s, 5s, three-of-a-kind).","Choose to Bank your points OR roll the remaining dice to push your luck.","If you roll and get no scoring dice, you Farkle. Turn over, no points.","If you score with all 6 dice, you have 'Hot Dice' and can reroll all 6 and keep accumulating."],
    strategy:["Bank your points! Risking 1000 points on 2 dice is almost never mathematically correct.","Three Farkles in a row usually carries a 1000-point penalty, so play safe if you have 2 Farkles."],
    mistakes:["Getting greedy and rolling 1 or 2 dice trying to hit a 1 or 5.","Not banking a large score when you have it."],
    payouts:[{bet:"1",pays:"100 pts"},{bet:"5",pays:"50 pts"},{bet:"Three 1s",pays:"1000 pts"},{bet:"Three 2s-6s",pays:"100 × face value"}],
  },
  {
    id:"spades", name:"Spades", emoji:"♠", category:"Classic — Cards",
    players:"4 (partners)", difficulty:"Medium", type:"card",
    tagline:"Bid how many tricks you can win, with Spades as the permanent trump.",
    overview:"Spades is a partnership trick-taking game. You and your partner sit across from each other. Before the hand starts, everyone 'bids' how many tricks they think they can take. Spades are always trump.",
    terminology:[
      {term:"Trick",def:"One round of cards (4 cards played). Highest card of led suit wins, unless trumped."},
      {term:"Trump",def:"The Spade suit. A spade beats any card of any other suit."},
      {term:"Bid",def:"Your prediction of how many tricks you will win."},
      {term:"Nil",def:"A bid of zero tricks. Very risky but carries a huge bonus (+100) or penalty (-100)."},
      {term:"Bags (Sandbags)",def:"Tricks you win over your combined bid. Accumulating 10 bags loses you 100 points."},
    ],
    setup:["Standard 52-card deck. Players across from each other are partners.","Deal all 13 cards to each player."],
    howToPlay:["**Bidding:** Starting left of dealer, each player bids 0 (Nil) to 13. Partners' bids are added together to form the team bid.","**Play:** Player left of dealer leads. Must follow suit. If void, you can play a Spade (trump) or slough another suit.","You cannot lead Spades until they have been 'broken' (played on a previous trick).","**Scoring:** If the team meets or exceeds their combined bid, they score 10x the bid. Extra tricks are 'bags' (1 pt each).","If the team fails to reach their bid, they lose 10x the bid."],
    strategy:["Don't bid nil if you have high spades or few cards in a suit.","Count the spades! There are 13 total. Keep track of how many have been played.","Lead your strong suits early to draw out opponents' trumps."],
    mistakes:["Bidding too many tricks without accounting for partner's bid.","Forgetting to track 'bags' and accidentally taking a 100-point penalty."],
    payouts:[{bet:"Meet bid",pays:"10× bid pts"},{bet:"Overtrick (bag)",pays:"+1 pt each"},{bet:"10 bags accumulated",pays:"-100 pts"},{bet:"Successful Nil",pays:"+100 pts"}],
    visualCards:[{rank:"A",suit:"S"},{rank:"K",suit:"S"},{rank:"Q",suit:"H"},{rank:"J",suit:"D"}],
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
    ],
    setup:["Standard 52-card deck. Deal all 13 cards to each player.","Before play: pass 3 cards left (hand 1), right (hand 2), across (hand 3), no pass (hand 4)."],
    howToPlay:["Player with 2♣ leads it. Must follow suit; if unable, play any card.","No penalty cards (hearts or Q♠) can be played on the first trick unless that's all you have.","Highest card of the lead suit wins the trick.","Count penalty points at end: 1 per heart, 13 for Q♠. First to 100 loses."],
    strategy:["Pass the Queen of Spades, Ace and King of Spades (she needs protection), and high hearts.","Void a suit early — this lets you ditch penalty cards when that suit is led."],
    mistakes:["Holding the Queen of Spades without low spades to protect her.","Leading high hearts early — gift others their penalty avoidance."],
    payouts:[{bet:"Win trick with hearts/QS",pays:"-1/-13 pts per card"},{bet:"Shoot the Moon",pays:"All others get 26 pts"}],
    visualCards:[{rank:"Q",suit:"S"},{rank:"A",suit:"H"},{rank:"K",suit:"H"},{rank:"2",suit:"C"}],
  },
  /* ── CLASSIC TILES & BOARDS ── */
  {
    id:"dominoes", name:"Dominoes (Draw)", emoji:"🁣", category:"Classic — Tiles",
    players:"2–4", difficulty:"Easy", type:"tile",
    tagline:"Match ends of tiles to empty your hand.",
    overview:"Dominoes is a classic tile-based game. In the popular 'Draw' variation, players try to empty their hands by matching the pip count on one end of a tile in their hand to the open ends of the layout on the table.",
    terminology:[
      {term:"Bone/Tile",def:"A domino piece, featuring two ends with 0-6 pips (dots)."},
      {term:"Boneyard",def:"The draw pile of face-down tiles."},
      {term:"Spinner",def:"The first double played, which can be played off of on all four sides."},
      {term:"Domino!",def:"Called out when a player plays their last tile, winning the hand."},
    ],
    setup:["Shuffle all 28 tiles face-down.","2 players: draw 7 tiles each. 3-4 players: draw 5 tiles each.","Remaining tiles form the boneyard."],
    howToPlay:["The player with the heaviest double (e.g., Double 6) plays it first to start the line.","Players take turns playing a tile that matches the number of pips on an open end of the layout.","If you cannot play, you must draw from the boneyard until you get a playable tile.","The round ends when one player plays their last tile, or the game is blocked (no one can play)."],
    strategy:["Play your heaviest (highest pip) tiles early to avoid getting stuck with them if the round ends.","If you know your opponent is blocked on a certain number, try to leave that number exposed on the ends.","Keep a variety of numbers in your hand to ensure you can always play."],
    mistakes:["Drawing unnecessarily when you misread the board.","Playing a double early without having other tiles of that number to back it up."],
    payouts:[{bet:"Winning hand",pays:"Sum of pips in opponents' hands"}],
  },
  {
    id:"mahjong", name:"Mahjong", emoji:"🀄", category:"Classic — Tiles",
    players:"4", difficulty:"Hard", type:"tile",
    tagline:"Draw and discard tiles to form matching sets and pairs.",
    overview:"Mahjong is a deeply strategic tile game similar to Rummy but played with 144 tiles based on Chinese characters and symbols. Players draw and discard tiles to complete a winning hand of four sets (Pung/Chow/Kong) and one pair.",
    terminology:[
      {term:"Chow",def:"A sequence of three tiles of the same suit (e.g., 1-2-3 of Bamboo)."},
      {term:"Pung",def:"A set of three identical tiles."},
      {term:"Kong",def:"A set of four identical tiles (requires drawing a replacement tile)."},
      {term:"Mahjong",def:"Calling out when you complete your 14-tile winning hand."},
    ],
    setup:["Shuffle 144 tiles face-down and build four walls, each 18 tiles long and 2 tiles high.","Roll dice to break the wall. Dealer takes 14 tiles, others take 13."],
    howToPlay:["On your turn, draw one tile from the wall.","If your hand isn't complete, discard one tile face-up.","Other players can claim your discard: 'Chow' (only the player to your right), 'Pung' (any player), or 'Kong' (any player).","If a discard is claimed, that player exposes the set, discards a tile, and play continues to their right.","Win by drawing or claiming a tile that completes your hand (4 sets + 1 pair)."],
    strategy:["Be flexible early on; don't commit to a specific hand too quickly.","Watch the discards to see what opponents are building and which tiles are dead (all 4 are played).","Keep pairs of honor tiles (Dragons/Winds) as they are easy to turn into Pungs for quick points."],
    mistakes:["Discarding a 'raw' (unseen) tile late in the game, risking someone calling Mahjong on it.","Claiming too many Chows/Pungs early, revealing your hand and limiting your defensive options."],
    payouts:[{bet:"Win",pays:"Varies by hand complexity and local scoring rules"}],
  },
  {
    id:"backgammon", name:"Backgammon", emoji:"🎲", category:"Classic — Board",
    players:"2", difficulty:"Medium", type:"board",
    tagline:"Race your checkers around the board using dice and strategy.",
    overview:"Backgammon is one of the oldest board games, combining the luck of dice with deep tactical positioning. You must move all 15 of your checkers around the board and bear them off before your opponent does.",
    terminology:[
      {term:"Blot",def:"A single checker sitting alone on a point, vulnerable to being hit."},
      {term:"Hit",def:"Landing on an opponent's blot, sending it to the bar."},
      {term:"The Bar",def:"The middle divider. Hit checkers go here and must enter the opponent's home board to return."},
      {term:"Prime",def:"Several consecutive points occupied by two or more of your checkers, blocking the opponent."},
      {term:"Bear Off",def:"Removing your checkers from the board once they are all in your home board."},
      {term:"Doubling Cube",def:"A die used to double the stakes of the game if you feel you have a strong advantage."},
    ],
    setup:["Each player has 15 checkers set up in a specific starting formation across 24 points.","Players roll one die each to determine who goes first (highest roll uses both dice for their first move)."],
    howToPlay:["Roll two dice. Move your checkers forward by the numbers shown (e.g., roll 4-2, move one checker 4 and another 2, or one checker 6).","If you roll doubles, you play the numbers four times.","You cannot land on a point occupied by 2 or more opponent checkers.","If you land on a blot (1 opponent checker), it is 'hit' and sent to the bar.","Once all 15 checkers are in your final quadrant (home board), you can start bearing them off. First to bear off all 15 wins."],
    strategy:["Build 'primes' (blocks of 2+ checkers) to trap your opponent's back checkers.","Avoid leaving blots in your home board or when your opponent has a strong board.","Hitting your opponent is usually the best move, especially if it traps them behind your prime."],
    mistakes:["Playing too passively and just racing without interacting.","Leaving blots carelessly when your opponent's home board is strong (meaning a hit will trap you on the bar)."],
    payouts:[{bet:"Standard win",pays:"1x stakes"},{bet:"Gammon (opp. bears off 0)",pays:"2x stakes"},{bet:"Backgammon (opp. checker stuck)",pays:"3x stakes"}],
  },
    {
    id:"checkers", name:"Checkers", emoji:"🔴", category:"Classic — Board",
    players:"2", difficulty:"Easy", type:"board",
    tagline:"Jump over your opponent's pieces to capture them all.",
    overview:"Checkers (or Draughts) is a classic strategy board game played on an 8x8 checkered board. Players move their pieces diagonally forward on the dark squares, jumping over opponent pieces to capture them. The goal is to capture all of your opponent's pieces or block them from moving.",
    terminology:[
      {term:"Jump",def:"Moving diagonally over an adjacent opponent piece into an empty square to capture it."},
      {term:"King / Crowning",def:"When a piece reaches the opponent's back row, it becomes a King and can move backwards."},
      {term:"Mandatory Jump",def:"If you have the opportunity to capture an opponent's piece, you MUST take the jump (in standard US rules)."},
      {term:"Double Jump",def:"Making multiple consecutive jumps with the same piece in a single turn."},
    ],
    setup:["Played on an 8x8 board (same as Chess).","Each player gets 12 pieces (Red and Black).","Pieces are placed only on the dark squares of the first three rows."],
    howToPlay:["Black moves first.","Pieces can only move one square diagonally forward into an empty dark square.","If an opponent's piece is diagonally in front of you and the space behind it is empty, you can jump it to capture.","If a piece reaches the farthest row, stack another piece on it to 'Crown' it as a King.","Kings can move diagonally both forward and backward.","The game ends when one player loses all pieces or cannot make a legal move."],
    strategy:["Keep your back row intact as long as possible to prevent your opponent from getting Kings.","Control the center of the board. Pieces on the edges are safe from capture but have limited mobility.","Force your opponent into a trap using the mandatory jump rule: sacrifice a piece to force them to move out of position."],
    mistakes:["Leaving gaps in your back row early in the game.","Forgetting about mandatory jumps, which a skilled opponent will use to force your pieces into bad positions."],
    payouts:[{bet:"Capture all pieces",pays:"Win"},{bet:"Opponent blocked",pays:"Win"}],
  },
  {
    id:"chess", name:"Chess", emoji:"♟️", category:"Classic — Board",
    players:"2", difficulty:"Hard", type:"board",
    tagline:"The ultimate game of pure strategy and tactics.",
    overview:"Chess is a deeply strategic two-player board game played on an 8x8 grid. Each player commands an army of 16 pieces, each with unique movement rules. The goal is to trap the opponent's King (Checkmate). There is no hidden information and no luck.",
    terminology:[
      {term:"Check",def:"The King is under direct attack but can escape."},
      {term:"Checkmate",def:"The King is under attack and has no legal escape. Game over."},
      {term:"Stalemate",def:"A player has no legal moves but is NOT in check. Game is a draw."},
      {term:"Castling",def:"A defensive move where the King moves two squares toward a Rook, and the Rook hops over the King. Can only be done if neither piece has moved."},
      {term:"En Passant",def:"If a pawn moves two squares forward past an opponent's pawn, the opponent can capture it as if it only moved one square."},
      {term:"Fork",def:"A tactic where one piece attacks two or more opponent pieces simultaneously."},
      {term:"Pin",def:"Attacking a piece that cannot move without exposing a more valuable piece behind it (like the King)."},
    ],
    setup:["Place pieces on the back rank: Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook.","Place 8 pawns on the second rank. White always moves first."],
    howToPlay:["White moves first. Players take turns moving one piece per turn.","Pawns move forward 1 (or 2 on first move) and capture diagonally.","Use the Interactive Board in this rulebook to see exactly how Knights, Bishops, Rooks, Queens, and Kings move.","Trap the opponent's King to win (Checkmate)."],
    strategy:[
      "Control the center four squares early to give your pieces maximum mobility.",
      "Develop your minor pieces (Knights and Bishops) before bringing out your Queen.",
      "Castle early! It protects your King and connects your Rooks on the back rank.",
      "The Italian Game (1. e4 e5 2. Nf3 Nc6 3. Bc4) is a great, aggressive opening for beginners.",
      "Look for tactical Forks (especially with Knights) to win material.",
    ],
    mistakes:["Bringing the Queen out too early, allowing it to be attacked by developing minor pieces.","Failing to see a 'Pin' and moving a piece that exposes your King.","Stalemating a winning endgame by carelessly trapping the opponent's King without checking it."],
    payouts:[{bet:"Checkmate",pays:"Win"},{bet:"Stalemate / Repetition",pays:"Draw"}],
  },
  {
    id:"pai_gow_tiles", name:"Pai Gow (Tiles)", emoji:"🀄", category:"Classic — Tiles",
    players:"1–7 vs. Dealer", difficulty:"Hard", type:"tile",
    tagline:"Ancient Chinese dominoes — balance your high and low hands.",
    overview:"Pai Gow is an ancient Chinese gambling game played with a set of 32 dominoes. It is the direct ancestor of Pai Gow Poker. Players are dealt 4 tiles and must split them into a High Hand and a Low Hand to beat the dealer.",
    terminology:[
      {term:"Gee Joon",def:"The Supreme Pair (the 1-2 and 2-4 tiles). The highest hand in the game."},
      {term:"Bo",def:"Pairs. The next highest ranking hands after Gee Joon."},
      {term:"Wong / Gong",def:"Special 9 or 8 point hands made with a 12 or 2 tile."},
      {term:"Points",def:"If no special hand, the total pips modulo 10 (e.g., 15 pips = 5 points)."},
    ],
    setup:["32 tiles are shuffled face-down ('washing' the tiles).","They are stacked into 8 stacks of 4 tiles (the Woodpile).","Dice are rolled to determine which player receives the first stack."],
    howToPlay:["You receive 4 tiles.","Split them into two pairs: a High Hand and a Low Hand.","Compare your hands against the dealer's High and Low hands.","Win both = Win 1:1 (minus 5% commission).","Win 1, Lose 1 = Push.","Lose both or Tie = Lose (dealer wins all exact ties)."],
    strategy:["The ranking of tiles and pairs is complex and must be memorized (it is not purely numerical).","Always balance your hands to avoid an automatic loss. A medium-high and medium-low hand is better than a huge high hand and a 0-point low hand."],
    mistakes:["Playing without knowing the tile rankings (Bo, Wong, Gong).","Putting too much power into the High Hand and leaving the Low Hand defenseless."],
    payouts:[{bet:"Win both",pays:"1:1 (minus 5%)"},{bet:"Win 1, Lose 1",pays:"Push"}],
  },

];

/* ─────────────────────────────────────────────
   HAND RANKINGS, PAYOUTS, STEP LIST
───────────────────────────────────────────── */
function HandRankings({ rankings }) {
  const tc = {1:"#ec4899",2:"#8b5cf6",3:"#06b6d4",4:"#3b82f6",5:"#64748b"};
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
      {rankings.map((h,i) => (
        <div key={i} style={{ display:"flex",alignItems:"center",gap:16,padding:"10px 16px",background:"rgba(30,41,59,0.4)",borderRadius:12,border:"1px solid rgba(148,163,184,0.1)",boxShadow:"0 2px 10px rgba(0,0,0,0.2)" }}>
          <div style={{ width:28,height:28,borderRadius:"50%",background:tc[h.tier],display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:"bold",flexShrink:0,boxShadow:`0 0 10px ${tc[h.tier]}80` }}>{i+1}</div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#f8fafc",fontFamily:"'Inter', sans-serif",fontWeight:"700",fontSize:14 }}>{h.rank}</div>
            <div style={{ color:"#94a3b8",fontSize:12,fontFamily:"'Inter', sans-serif",marginTop:2 }}>{h.example}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PayoutsTable({ payouts }) {
  return (
    <div style={{ background:"rgba(15,23,42,0.4)",border:"1px solid rgba(6,182,212,0.2)",borderRadius:12,overflow:"hidden",boxShadow:"0 4px 15px rgba(0,0,0,0.3)" }}>
      <div style={{ display:"flex",justifyContent:"space-between",padding:"10px 16px",background:"rgba(6,182,212,0.1)",borderBottom:"1px solid rgba(6,182,212,0.2)" }}>
        <span style={{ color:NEON_CYAN,fontSize:11,letterSpacing:1.5,fontWeight:"600",fontFamily:"'Inter', sans-serif" }}>BET / OUTCOME</span>
        <span style={{ color:NEON_CYAN,fontSize:11,letterSpacing:1.5,fontWeight:"600",fontFamily:"'Inter', sans-serif" }}>PAYS</span>
      </div>
      {payouts.map((p,i) => (
        <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",background:i%2===0?"rgba(30,41,59,0.3)":"transparent" }}>
          <span style={{ color:"#cbd5e1",fontFamily:"'Inter', sans-serif",fontSize:13 }}>{p.bet}</span>
          <span style={{ color:NEON_PINK,fontFamily:"'Inter', sans-serif",fontWeight:"bold",fontSize:13,textShadow:`0 0 8px ${NEON_PINK}60` }}>{p.pays}</span>
        </div>
      ))}
    </div>
  );
}

function StepList({ items, accent="cyan" }) {
  const ac = accent==="pink" ? NEON_PINK : NEON_CYAN;
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
      {items.map((item,i) => (
        <div key={i} style={{ display:"flex",gap:14,alignItems:"flex-start",padding:"12px 16px",background:"rgba(30,41,59,0.4)",borderRadius:12,border:`1px solid ${ac}30`,boxShadow:"0 2px 10px rgba(0,0,0,0.2)" }}>
          <div style={{ width:26,height:26,borderRadius:"50%",background:`${ac}20`,color:ac,border:`1px solid ${ac}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:"bold",flexShrink:0,fontFamily:"'Inter', sans-serif" }}>{i+1}</div>
          <span style={{ color:"#e2e8f0",fontFamily:"'Inter', sans-serif",fontSize:14,lineHeight:1.6 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function TermGrid({ terms }) {
  return (
    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))",gap:12 }}>
      {terms.map((t,i) => (
        <div key={i} style={{ padding:"14px 16px",background:"rgba(30,41,59,0.4)",borderRadius:12,border:"1px solid rgba(139,92,246,0.3)",boxShadow:"0 2px 10px rgba(0,0,0,0.2)",transition:"transform 0.2s",cursor:"default" }}>
          <div style={{ color:NEON_PURP,fontFamily:"'Inter', sans-serif",fontWeight:"bold",fontSize:13,marginBottom:6,textShadow:`0 0 8px ${NEON_PURP}60` }}>{t.term}</div>
          <div style={{ color:"#cbd5e1",fontFamily:"'Inter', sans-serif",fontSize:13,lineHeight:1.6 }}>{t.def}</div>
        </div>
      ))}
    </div>
  );
}

function RuleSection({ title, children, accent="cyan" }) {
  const ac = accent==="pink" ? NEON_PINK : NEON_CYAN;
  return (
    <div style={{ marginBottom:40 }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:18 }}>
        <div style={{ width:4,height:22,background:ac,borderRadius:2,flexShrink:0,boxShadow:`0 0 10px ${ac}` }}/>
        <h3 style={{ margin:0,fontFamily:"'Inter', sans-serif",color:"#f8fafc",fontSize:18,fontWeight:"700",letterSpacing:.5 }}>{title}</h3>
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

  const diffColor = { Easy:NEON_CYAN, Medium:NEON_PURP, Hard:NEON_PINK };

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
    <div style={{ display:"flex", height:"100%", background:DARK_BG, fontFamily:"'Inter', sans-serif", overflow:"hidden" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width:260, flexShrink:0, background:"rgba(15,23,42,0.95)", borderRight:"1px solid rgba(6,182,212,0.2)", display:"flex", flexDirection:"column", overflow:"hidden", backdropFilter:"blur(10px)", zIndex:10 }}>
        <div style={{ padding:"20px 16px 16px", borderBottom:"1px solid rgba(6,182,212,0.2)" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:8 }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:"8px",background:`${NEON_CYAN}20`,border:`1px solid ${NEON_CYAN}`,color:NEON_CYAN,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:`0 0 15px ${NEON_CYAN}40` }}>🎲</div>
              <div>
                <div style={{ color:"#f8fafc",fontWeight:"700",fontSize:15,letterSpacing:1.5 }}>CLASSIC GAMES</div>
                <div style={{ color:NEON_CYAN,fontSize:10,letterSpacing:2.5,fontWeight:"600" }}>RULEBOOK</div>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} style={{ background:"rgba(30,41,59,0.8)",border:"1px solid rgba(148,163,184,0.3)",borderRadius:8,color:"#cbd5e1",cursor:"pointer",fontSize:14,padding:"4px 8px",lineHeight:1,transition:"all 0.2s" }}>✕</button>
            )}
          </div>
        </div>

        <div style={{ padding:"16px 12px 8px" }}>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search games..."
            style={{ width:"100%",background:"rgba(30,41,59,0.5)",border:"1px solid rgba(6,182,212,0.3)",borderRadius:8,padding:"10px 12px",color:"#f8fafc",fontSize:13,fontFamily:"'Inter', sans-serif",outline:"none",boxSizing:"border-box",transition:"all 0.2s" }}
          />
        </div>

        <div style={{ flex:1,overflowY:"auto",padding:"0 8px 16px" }}>
          {Object.entries(cats).map(([cat,games]) => (
            <div key={cat}>
              <div style={{ color:"#64748b",fontSize:10,fontWeight:"600",letterSpacing:1.5,padding:"16px 10px 8px",textTransform:"uppercase" }}>{cat}</div>
              {games.map(g => {
                const active = g.id === selectedId;
                return (
                  <button key={g.id} onClick={()=>select(g.id)}
                    style={{ width:"100%",textAlign:"left",padding:"10px 12px",borderRadius:8,border:"none",cursor:"pointer",
                      background:active?"rgba(6,182,212,0.15)":"transparent",
                      borderLeft:active?`3px solid ${NEON_CYAN}`:"3px solid transparent",
                      marginBottom:2,display:"flex",alignItems:"center",gap:10,transition:"all .15s" }}>
                    <span style={{ fontSize:16 }}>{g.emoji}</span>
                    <div>
                      <div style={{ color:active?"#f8fafc":"#94a3b8",fontSize:13,fontWeight:active?"600":"500" }}>{g.name}</div>
                      <div style={{ color:diffColor[g.difficulty]||"#64748b",fontSize:10,fontWeight:"600",letterSpacing:0.5,marginTop:2 }}>{g.difficulty}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ padding:"12px 16px",borderTop:"1px solid rgba(6,182,212,0.2)",color:"#64748b",fontSize:10,letterSpacing:1.5,fontWeight:"600",textAlign:"center" }}>
          {GAMES.length} GAMES AVAILABLE
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main ref={contentRef} style={{ flex:1,overflowY:"auto",background:`radial-gradient(circle at 50% -20%, #1e293b, ${DARK_BG} 80%)` }}>

        {/* Hero */}
        <div style={{ background:"rgba(15,23,42,0.4)",borderBottom:"1px solid rgba(6,182,212,0.2)",padding:"40px 48px 30px",backdropFilter:"blur(5px)" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16 }}>
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:8 }}>
                <span style={{ fontSize:36,filter:"drop-shadow(0 0 10px rgba(255,255,255,0.2))" }}>{game.emoji}</span>
                <div>
                  <div style={{ color:NEON_CYAN,fontSize:11,fontWeight:"700",letterSpacing:3,textTransform:"uppercase",marginBottom:4 }}>{game.category}</div>
                  <h1 style={{ margin:0,color:"#f8fafc",fontSize:36,fontWeight:"800",letterSpacing:-0.5 }}>{game.name}</h1>
                </div>
              </div>
              <p style={{ color:"#94a3b8",fontSize:16,margin:0,fontWeight:"400",maxWidth:600,lineHeight:1.5 }}>{game.tagline}</p>
            </div>
            <div style={{ display:"flex",gap:24,alignItems:"center",background:"rgba(30,41,59,0.5)",padding:"16px 24px",borderRadius:12,border:"1px solid rgba(148,163,184,0.2)",boxShadow:"0 4px 15px rgba(0,0,0,0.2)" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ color:"#64748b",fontSize:10,fontWeight:"600",letterSpacing:1.5,marginBottom:4 }}>PLAYERS</div>
                <div style={{ color:"#f8fafc",fontSize:16,fontWeight:"700" }}>{game.players}</div>
              </div>
              <div style={{ width:1,height:40,background:"rgba(148,163,184,0.3)" }}/>
              <div style={{ textAlign:"center" }}>
                <div style={{ color:"#64748b",fontSize:10,fontWeight:"600",letterSpacing:1.5,marginBottom:4 }}>DIFFICULTY</div>
                <div style={{ color:diffColor[game.difficulty]||"#94a3b8",fontSize:16,fontWeight:"700",textShadow:`0 0 10px ${diffColor[game.difficulty]}60` }}>{game.difficulty}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding:"40px 48px 80px", maxWidth:1200, margin:"0 auto" }}>

          {/* Overview + Visual side by side */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 420px",gap:40,marginBottom:48,alignItems:"start" }}>
            <RuleSection title="Overview">
              <p style={{ color:"#cbd5e1",fontSize:15,lineHeight:1.8,margin:0,fontWeight:"400" }}>{game.overview}</p>
            </RuleSection>
            <div>
              <div style={{ color:NEON_PURP,fontSize:10,fontWeight:"700",letterSpacing:2.5,textTransform:"uppercase",marginBottom:12 }}>TABLE / EXAMPLE LAYOUT</div>
              <GameVisual game={game}/>
            </div>
          </div>

          <RuleSection title="Terminology" accent="pink">
            <TermGrid terms={game.terminology}/>
          </RuleSection>

          <RuleSection title="Setup">
            <StepList items={game.setup}/>
          </RuleSection>

          <RuleSection title="How to Play" accent="pink">
            <StepList items={game.howToPlay} accent="pink"/>
          </RuleSection>

          {game.handRankings && (
            <RuleSection title="Hand Rankings">
              <HandRankings rankings={game.handRankings}/>
            </RuleSection>
          )}

          <RuleSection title="Strategy & Tips">
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {game.strategy.map((s,i) => (
                <div key={i} style={{ display:"flex",gap:14,alignItems:"flex-start",padding:"12px 16px",background:"rgba(6,182,212,0.08)",border:"1px solid rgba(6,182,212,0.3)",borderRadius:12,boxShadow:"0 2px 10px rgba(0,0,0,0.1)" }}>
                  <span style={{ color:NEON_CYAN,fontSize:16,flexShrink:0,marginTop:0,textShadow:`0 0 8px ${NEON_CYAN}` }}>✦</span>
                  <span style={{ color:"#e2e8f0",fontSize:14,lineHeight:1.6 }}>{s}</span>
                </div>
              ))}
            </div>
          </RuleSection>

          {game.mistakes && (
            <RuleSection title="Common Mistakes" accent="pink">
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {game.mistakes.map((m,i) => (
                  <div key={i} style={{ display:"flex",gap:14,alignItems:"flex-start",padding:"12px 16px",background:"rgba(236,72,153,0.08)",border:"1px solid rgba(236,72,153,0.3)",borderRadius:12,boxShadow:"0 2px 10px rgba(0,0,0,0.1)" }}>
                    <span style={{ color:NEON_PINK,fontSize:16,flexShrink:0,marginTop:0,fontWeight:"bold",textShadow:`0 0 8px ${NEON_PINK}` }}>✕</span>
                    <span style={{ color:"#e2e8f0",fontSize:14,lineHeight:1.6 }}>{m}</span>
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