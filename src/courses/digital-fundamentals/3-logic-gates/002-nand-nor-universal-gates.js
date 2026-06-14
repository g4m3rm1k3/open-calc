// Digital Fundamentals · Unit 3 · Lesson 2
// NAND and NOR: The Universal Gates
// ScienceNotebook format — prose cells, JS visuals, challenges

export const LESSON_DF_3_2 = {
  title: 'NAND and NOR: The Universal Gates',
  subtitle: 'Why two gates are more powerful than seven — and how every logic function reduces to one.',
  sequential: true,
  cells: [

    // ── Section 1 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### From Seven Gates to One

In the previous lesson you learned seven logic gates: NOT, AND, OR, NAND, NOR, XOR, XNOR. That is the full vocabulary of combinational logic. But here is a surprising fact: **you only need one**.

Both NAND and NOR are **universal gates** — each one, used alone, can implement any logic function that any combination of the other six gates can implement. NOT, AND, OR, XOR, XNOR — all of them — can be built entirely from NAND gates. Or entirely from NOR gates.

This matters for three reasons:

**Manufacturing**: A chip fab only needs to perfect one cell type. Every logic family (TTL, CMOS) optimises its NAND or NOR gate, then builds everything else from it. The original 7400 IC was a quad NAND — not AND, not OR — because NAND is the primitive.

**Circuit minimisation**: Knowing that NAND is universal means any Sum-of-Products expression (AND terms ORed together) can be converted to an all-NAND circuit by a simple two-level transformation — no mixed gate types needed.

**Theoretical completeness**: Boolean algebra has a proof that AND + OR + NOT is functionally complete. NAND alone is also complete. This is not obvious — it is a theorem. The proof is that you can build NOT, AND, and OR from NAND alone, so anything they can do, NAND can do.`,
    },

    // ── Visual 1 — NAND and NOR truth tables side by side ────────────────────
    {
      type: 'js',
      instruction: `### NAND and NOR: Truth Tables

NAND is NOT-AND: the output is LOW only when **all** inputs are HIGH — the exact opposite of AND.
NOR is NOT-OR: the output is HIGH only when **all** inputs are LOW — the exact opposite of OR.

Toggle the inputs. Notice: NAND produces 0 in exactly one row (where AND produces 1). NOR produces 1 in exactly one row (where OR produces 0).`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">
    <button id="btnA" class="inp-btn">A = 0</button>
    <button id="btnB" class="inp-btn">B = 0</button>
    <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
      <div id="outNAND" class="out-badge" style="border-color:#d97706">NAND = <span id="vNAND" style="color:#d97706">1</span></div>
      <div id="outNOR"  class="out-badge" style="border-color:#7c3aed">NOR  = <span id="vNOR"  style="color:#7c3aed">1</span></div>
    </div>
  </div>
  <canvas id="cv" width="560" height="260"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.inp-btn{padding:8px 22px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.2);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.out-badge{padding:6px 14px;border-radius:8px;border:1.5px solid;background:rgba(255,255,255,0.04);font-size:13px;font-weight:600}`,
      startCode: `
var A=0, B=0;
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

function nand(a,b){return (a&&b)?0:1;}
function nor(a,b){return (a||b)?0:1;}

function drawGateAND(ctx,x,y,w,h,col,active){
  var mx=x+w/2,my=y+h/2;
  ctx.fillStyle=active?col+'33':'#0d1527';
  ctx.strokeStyle=active?col:'#334155';
  ctx.lineWidth=active?2:1.5;
  ctx.beginPath();
  ctx.moveTo(x+4,y+4); ctx.lineTo(mx-4,y+4);
  ctx.arc(mx-4,my,h/2-4,-Math.PI/2,Math.PI/2);
  ctx.lineTo(x+4,y+h-4); ctx.closePath();
  ctx.fill(); ctx.stroke();
  var iy1=y+h*0.3,iy2=y+h*0.7;
  ctx.strokeStyle=active?col:'#334155'; ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(x-20,iy1);ctx.lineTo(x+4,iy1);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-20,iy2);ctx.lineTo(x+4,iy2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+w-4,my);ctx.lineTo(x+w+20,my);ctx.stroke();
}
function drawGateOR(ctx,x,y,w,h,col,active){
  var mx=x+w/2,my=y+h/2;
  ctx.fillStyle=active?col+'33':'#0d1527';
  ctx.strokeStyle=active?col:'#334155';
  ctx.lineWidth=active?2:1.5;
  ctx.beginPath();
  ctx.moveTo(x+4,y+4);
  ctx.quadraticCurveTo(mx-10,my,x+4,y+h-4);
  ctx.quadraticCurveTo(mx,y+h,x+w-14,my);
  ctx.quadraticCurveTo(mx,y,x+4,y+4);
  ctx.fill(); ctx.stroke();
  var iy1=y+h*0.3,iy2=y+h*0.7;
  ctx.strokeStyle=active?col:'#334155'; ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(x-20,iy1);ctx.lineTo(x+12,iy1);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-20,iy2);ctx.lineTo(x+12,iy2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+w-4,my);ctx.lineTo(x+w+20,my);ctx.stroke();
}
function bubble(ctx,x,y,col){
  ctx.beginPath();ctx.arc(x,y,5,0,2*Math.PI);
  ctx.fillStyle=col+'33'; ctx.strokeStyle=col; ctx.lineWidth=1.5;
  ctx.fill(); ctx.stroke();
}

function draw(){
  var W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  var nandOut=nand(A,B), norOut=nor(A,B);
  var colA=A?'#4ade80':'#475569';
  var colB=B?'#4ade80':'#475569';
  var colNAND=nandOut?'#d97706':'#475569';
  var colNOR=norOut?'#7c3aed':'#475569';

  // ── NAND gate (left half) ─────────────────────────────────────────────
  var gx=60, gy=40, gw=90, gh=80;
  drawGateAND(ctx,gx,gy,gw,gh,'#d97706',nandOut===0);
  bubble(ctx,gx+gw+5,gy+gh/2,'#d97706');

  // Input wires NAND
  ctx.strokeStyle=colA; ctx.lineWidth=A?2.5:1.5;
  ctx.beginPath();ctx.moveTo(20,gy+gh*0.3);ctx.lineTo(gx,gy+gh*0.3);ctx.stroke();
  ctx.strokeStyle=colB; ctx.lineWidth=B?2.5:1.5;
  ctx.beginPath();ctx.moveTo(20,gy+gh*0.7);ctx.lineTo(gx,gy+gh*0.7);ctx.stroke();
  // Output wire NAND
  ctx.strokeStyle=colNAND; ctx.lineWidth=nandOut?2.5:1.5;
  ctx.beginPath();ctx.moveTo(gx+gw+10,gy+gh/2);ctx.lineTo(gx+gw+40,gy+gh/2);ctx.stroke();

  // Labels NAND
  ctx.fillStyle=colA; ctx.font='500 12px monospace'; ctx.textAlign='right';
  ctx.fillText('A='+A, 18, gy+gh*0.3+4);
  ctx.fillStyle=colB;
  ctx.fillText('B='+B, 18, gy+gh*0.7+4);
  ctx.fillStyle=colNAND; ctx.textAlign='left';
  ctx.fillText('='+nandOut, gx+gw+52, gy+gh/2+4);
  ctx.fillStyle='#d97706'; ctx.font='bold 13px monospace'; ctx.textAlign='center';
  ctx.fillText('NAND', gx+gw/2, gy+gh+18);
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='10px monospace';
  ctx.fillText('F = \u0305A\u0305\u0305\u00b7\u0305B\u0305', gx+gw/2, gy+gh+32);

  // ── NOR gate (right half) ─────────────────────────────────────────────
  var gx2=320, gy2=40;
  drawGateOR(ctx,gx2,gy2,gw,gh,'#7c3aed',norOut===1);
  bubble(ctx,gx2+gw+5,gy2+gh/2,'#7c3aed');

  // Input wires NOR
  ctx.strokeStyle=colA; ctx.lineWidth=A?2.5:1.5;
  ctx.beginPath();ctx.moveTo(280,gy2+gh*0.3);ctx.lineTo(gx2,gy2+gh*0.3);ctx.stroke();
  ctx.strokeStyle=colB; ctx.lineWidth=B?2.5:1.5;
  ctx.beginPath();ctx.moveTo(280,gy2+gh*0.7);ctx.lineTo(gx2,gy2+gh*0.7);ctx.stroke();
  // Output wire NOR
  ctx.strokeStyle=colNOR; ctx.lineWidth=norOut?2.5:1.5;
  ctx.beginPath();ctx.moveTo(gx2+gw+10,gy2+gh/2);ctx.lineTo(gx2+gw+40,gy2+gh/2);ctx.stroke();

  ctx.fillStyle=colA; ctx.font='500 12px monospace'; ctx.textAlign='right';
  ctx.fillText('A='+A, 278, gy2+gh*0.3+4);
  ctx.fillStyle=colB;
  ctx.fillText('B='+B, 278, gy2+gh*0.7+4);
  ctx.fillStyle=colNOR; ctx.textAlign='left';
  ctx.fillText('='+norOut, gx2+gw+52, gy2+gh/2+4);
  ctx.fillStyle='#7c3aed'; ctx.font='bold 13px monospace'; ctx.textAlign='center';
  ctx.fillText('NOR', gx2+gw/2, gy2+gh+18);
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='10px monospace';
  ctx.fillText('F = \u0305A\u0305\u0305+\u0305B\u0305', gx2+gw/2, gy2+gh+32);

  // ── Combined truth table ───────────────────────────────────────────────
  var tbX=60, tbY=160, colW=80;
  var headers=['A','B','AND','NAND','OR','NOR'];
  var rows2=[
    [0,0, 0,1, 0,1],
    [0,1, 0,1, 1,0],
    [1,0, 0,1, 1,0],
    [1,1, 1,0, 1,0],
  ];
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
  headers.forEach(function(h,i){ctx.fillText(h,tbX+i*colW+40,tbY+12);});
  ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(tbX,tbY+16);ctx.lineTo(tbX+colW*6,tbY+16);ctx.stroke();

  rows2.forEach(function(row,ri){
    var y=tbY+28+ri*22;
    var isActive=(row[0]===A && row[1]===B);
    if(isActive){
      ctx.fillStyle='rgba(255,255,255,0.06)';
      ctx.fillRect(tbX,y-14,colW*6,20);
    }
    row.forEach(function(v,ci){
      var col2=ci===3?(v?'#d97706':'rgba(255,255,255,0.35)'):ci===5?(v?'#7c3aed':'rgba(255,255,255,0.35)'):'rgba(255,255,255,0.5)';
      if(isActive) col2=ci===3?'#fbbf24':ci===5?'#a78bfa':ci<=1?'#e2e8f0':'rgba(255,255,255,0.6)';
      ctx.fillStyle=col2; ctx.font=(isActive&&ci>=2?'bold ':'')+'12px monospace'; ctx.textAlign='center';
      ctx.fillText(v, tbX+ci*colW+40, y);
    });
  });
}

function refresh(){
  var nandOut=nand(A,B), norOut=nor(A,B);
  document.getElementById('btnA').textContent='A = '+A;
  document.getElementById('btnA').className='inp-btn'+(A?' hi':'');
  document.getElementById('btnB').textContent='B = '+B;
  document.getElementById('btnB').className='inp-btn'+(B?' hi':'');
  document.getElementById('vNAND').textContent=nandOut;
  document.getElementById('vNOR').textContent=norOut;
  draw();
}

document.getElementById('btnA').onclick=function(){A=A?0:1;refresh();};
document.getElementById('btnB').onclick=function(){B=B?0:1;refresh();};
refresh();`,
      outputHeight: 380,
    },

    // ── Challenge 1 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 2-input NAND gate has inputs A=1 and B=1. What is the output, and why?`,
      options: [
        { label: 'A', text: '1 — NAND always outputs 1' },
        { label: 'B', text: '0 — both inputs are HIGH, so AND would give 1, and NOT of 1 is 0' },
        { label: 'C', text: '1 — the inputs are the same, so NAND outputs 1 like XOR' },
        { label: 'D', text: '0 — NAND outputs 0 whenever any input is 1' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. NAND = NOT(A AND B). When A=1 and B=1, AND gives 1, and NOT(1) = 0. This is the one and only input combination where NAND outputs 0. Every other combination gives 1.',
      failMessage: 'NAND is NOT-AND. With A=1 and B=1: first evaluate AND(1,1) = 1, then apply NOT: NOT(1) = 0. NAND outputs 0 in exactly one row of its truth table — when all inputs are HIGH.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 2 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Building NOT, AND, and OR from NAND

If NAND is universal, it must be able to impersonate every other gate. Here are the three fundamental constructions:

**NOT from NAND**: Tie both inputs together. NAND(A, A) = NOT(A AND A) = NOT(A). A NAND gate with its inputs shorted is an inverter.

**AND from NAND**: AND(A, B) = NOT(NAND(A, B)). Two NAND gates: first gate computes NAND(A,B), second gate (with inputs tied) inverts it. Total: 2 NAND gates.

**OR from NAND**: By De Morgan's theorem, A OR B = NOT(NOT(A) AND NOT(B)) = NAND(NOT(A), NOT(B)) = NAND(NAND(A,A), NAND(B,B)). Three NAND gates: one per input inversion, one NAND of the results.

The same three constructions exist for NOR: NOT from NOR (tie inputs), OR from NOR (invert with NOR), AND from NOR (three NOR gates).

This is why chip designers work almost exclusively in NAND gates — they never need to mix gate types in the pull-down network.`,
    },

    // ── Visual 2 — NAND constructions ────────────────────────────────────────
    {
      type: 'js',
      instruction: `### NAND-only implementations

Select which gate you want to see implemented using only NAND gates. Toggle the input(s) to verify the output matches the original gate's truth table.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
    <button class="tab-btn active" id="tab-NOT" onclick="setMode('NOT')">NOT from NAND</button>
    <button class="tab-btn" id="tab-AND" onclick="setMode('AND')">AND from NAND</button>
    <button class="tab-btn" id="tab-OR"  onclick="setMode('OR')">OR from NAND</button>
  </div>
  <div style="display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap">
    <button id="btnA" class="inp-btn">A = 0</button>
    <button id="btnB" class="inp-btn" style="display:none">B = 0</button>
    <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
      <span style="font-size:11px;color:rgba(255,255,255,0.35)">Expected:</span>
      <div id="expected" class="out-badge" style="border-color:#4ade80">— = <span id="vExp">—</span></div>
      <span style="font-size:11px;color:rgba(255,255,255,0.35)">NAND circuit:</span>
      <div id="actual" class="out-badge" style="border-color:#fbbf24">out = <span id="vAct">—</span></div>
    </div>
  </div>
  <canvas id="cv" width="560" height="200"></canvas>
  <div id="desc" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.tab-btn{padding:6px 14px;border-radius:20px;border:0.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.5);font-family:monospace;font-size:12px;cursor:pointer}
.tab-btn.active{border-color:#fbbf24;background:rgba(251,191,36,0.12);color:#fbbf24}
.inp-btn{padding:7px 20px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.out-badge{padding:5px 12px;border-radius:8px;border:1.5px solid;background:rgba(255,255,255,0.04);font-size:12px;font-weight:600;color:rgba(255,255,255,0.7)}`,
      startCode: `
var A=0, B=0, mode='NOT';
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

function nand(a,b){return (a&&b)?0:1;}

function setMode(m){
  mode=m;
  ['NOT','AND','OR'].forEach(function(k){
    document.getElementById('tab-'+k).className='tab-btn'+(mode===k?' active':'');
  });
  document.getElementById('btnB').style.display=(m==='OR'||m==='AND')?'':'none';
  refresh();
}

function drawNAND(cx,cy,w,h,colActive){
  var mx=cx+w/2,my=cy+h/2;
  ctx.fillStyle=colActive?'rgba(251,191,36,0.15)':'#0d1527';
  ctx.strokeStyle=colActive?'#fbbf24':'#334155';
  ctx.lineWidth=colActive?2:1.5;
  ctx.beginPath();
  ctx.moveTo(cx+4,cy+4); ctx.lineTo(mx-4,cy+4);
  ctx.arc(mx-4,my,h/2-4,-Math.PI/2,Math.PI/2);
  ctx.lineTo(cx+4,cy+h-4); ctx.closePath();
  ctx.fill(); ctx.stroke();
  // bubble
  ctx.beginPath(); ctx.arc(cx+w+5,my,5,0,2*Math.PI);
  ctx.fillStyle=colActive?'rgba(251,191,36,0.2)':'#0d1527';
  ctx.strokeStyle=colActive?'#fbbf24':'#334155';
  ctx.lineWidth=1.5; ctx.fill(); ctx.stroke();
}

function wire(x1,y1,x2,y2,val){
  ctx.strokeStyle=val?'#4ade80':'#475569';
  ctx.lineWidth=val?2.5:1.5;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
}
function dot(x,y,val){
  ctx.beginPath(); ctx.arc(x,y,4,0,2*Math.PI);
  ctx.fillStyle=val?'#4ade80':'#475569'; ctx.fill();
}
function label(x,y,txt,col,align){
  ctx.fillStyle=col||'rgba(255,255,255,0.5)';
  ctx.font='12px monospace'; ctx.textAlign=align||'center';
  ctx.fillText(txt,x,y);
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);
  var gw=80,gh=64;

  if(mode==='NOT'){
    // One NAND with both inputs tied to A
    var out=nand(A,A);
    var gx=220,gy=H/2-gh/2;
    // Tie wire
    wire(40,H/2,gx,gy+gh*0.3,A);
    wire(40,H/2,gx,gy+gh*0.7,A);
    dot(40,H/2,A);
    // fork
    ctx.strokeStyle=A?'#4ade80':'#475569'; ctx.lineWidth=A?2.5:1.5;
    ctx.beginPath();ctx.moveTo(gx,gy+gh*0.3);ctx.lineTo(gx,gy+gh*0.7);ctx.stroke();
    drawNAND(gx,gy,gw,gh,out);
    wire(gx+gw+10,gy+gh/2,480,gy+gh/2,out);
    label(34,H/2+4,'A='+A,A?'#4ade80':'#f87171','right');
    label(486,gy+gh/2+4,'NOT A = '+out,out?'#4ade80':'#f87171','left');
    label(gx+gw/2,gy+gh+18,'A tied to both inputs','rgba(255,255,255,0.35)','center');
    label(gx+gw/2,gy-10,'NAND(A,A) = NOT A','#fbbf24','center');

  } else if(mode==='AND'){
    // Two NANDs: first = NAND(A,B), second = NOT(first) i.e. NAND(first,first)
    var mid=nand(A,B), out2=nand(mid,mid);
    var g1x=80,g1y=H/2-gh/2;
    var g2x=310,g2y=H/2-gh/2;
    // Input wires to gate 1
    wire(20,g1y+gh*0.3,g1x,g1y+gh*0.3,A);
    wire(20,g1y+gh*0.7,g1x,g1y+gh*0.7,B);
    label(18,g1y+gh*0.3+4,'A='+A,A?'#4ade80':'#f87171','right');
    label(18,g1y+gh*0.7+4,'B='+B,B?'#4ade80':'#f87171','right');
    drawNAND(g1x,g1y,gw,gh,mid===0);
    // Wire between gates
    wire(g1x+gw+10,g1y+gh/2,g2x,g2y+gh*0.3,mid);
    wire(g1x+gw+10,g1y+gh/2,g2x,g2y+gh*0.7,mid);
    dot(g1x+gw+10,g1y+gh/2,mid);
    ctx.strokeStyle=mid?'#4ade80':'#475569'; ctx.lineWidth=mid?2.5:1.5;
    ctx.beginPath();ctx.moveTo(g2x,g2y+gh*0.3);ctx.lineTo(g2x,g2y+gh*0.7);ctx.stroke();
    drawNAND(g2x,g2y,gw,gh,out2);
    wire(g2x+gw+10,g2y+gh/2,520,g2y+gh/2,out2);
    label(526,g2y+gh/2+4,'AND = '+out2,out2?'#4ade80':'#f87171','left');
    label(g1x+gw/2,g1y-10,'Stage 1: NAND(A,B)='+mid,'#fbbf24','center');
    label(g2x+gw/2,g2y-10,'Stage 2: NAND(mid,mid)='+out2,'#fbbf24','center');
    label(g2x+gw/2,g2y+gh+18,'= NOT(mid) = AND(A,B)','rgba(255,255,255,0.35)','center');

  } else {
    // OR from NAND: NAND(NAND(A,A), NAND(B,B))
    var notA=nand(A,A), notB=nand(B,B), out3=nand(notA,notB);
    var g1x=70,g1y=40;
    var g3x=70,g3y=H-40-gh;
    var g2x=340,g2y=H/2-gh/2;
    // Gate 1: NOT A
    wire(18,g1y+gh*0.3,g1x,g1y+gh*0.3,A);
    wire(18,g1y+gh*0.7,g1x,g1y+gh*0.7,A);
    dot(18,g1y+gh/2,A);
    ctx.strokeStyle=A?'#4ade80':'#475569'; ctx.lineWidth=A?2.5:1.5;
    ctx.beginPath();ctx.moveTo(g1x,g1y+gh*0.3);ctx.lineTo(g1x,g1y+gh*0.7);ctx.stroke();
    label(16,g1y+gh/2+4,'A='+A,A?'#4ade80':'#f87171','right');
    drawNAND(g1x,g1y,gw,gh,notA);
    // Gate 3: NOT B
    wire(18,g3y+gh*0.3,g3x,g3y+gh*0.3,B);
    wire(18,g3y+gh*0.7,g3x,g3y+gh*0.7,B);
    dot(18,g3y+gh/2,B);
    ctx.strokeStyle=B?'#4ade80':'#475569'; ctx.lineWidth=B?2.5:1.5;
    ctx.beginPath();ctx.moveTo(g3x,g3y+gh*0.3);ctx.lineTo(g3x,g3y+gh*0.7);ctx.stroke();
    label(16,g3y+gh/2+4,'B='+B,B?'#4ade80':'#f87171','right');
    drawNAND(g3x,g3y,gw,gh,notB);
    // Gate 2: NAND of the two NOTs
    wire(g1x+gw+10,g1y+gh/2,g2x,g2y+gh*0.3,notA);
    wire(g3x+gw+10,g3y+gh/2,g2x,g2y+gh*0.7,notB);
    drawNAND(g2x,g2y,gw,gh,out3);
    wire(g2x+gw+10,g2y+gh/2,520,g2y+gh/2,out3);
    label(526,g2y+gh/2+4,'OR = '+out3,out3?'#4ade80':'#f87171','left');
    label(g1x+gw/2,g1y-8,'\u0305A\u0305','#fbbf24','center');
    label(g3x+gw/2,g3y+gh+14,'\u0305B\u0305','#fbbf24','center');
    label(g2x+gw/2,g2y-8,'NAND(\u0305A\u0305,\u0305B\u0305) = A+B','#fbbf24','center');
  }
}

function refresh(){
  document.getElementById('btnA').textContent='A = '+A;
  document.getElementById('btnA').className='inp-btn'+(A?' hi':'');
  document.getElementById('btnB').textContent='B = '+B;
  document.getElementById('btnB').className='inp-btn'+(B?' hi':'');

  var exp, act, expLabel;
  if(mode==='NOT'){ exp=A?0:1; act=nand(A,A); expLabel='NOT A'; }
  else if(mode==='AND'){ exp=(A&&B)?1:0; act=nand(nand(A,B),nand(A,B)); expLabel='AND'; }
  else { exp=(A||B)?1:0; act=nand(nand(A,A),nand(B,B)); expLabel='OR'; }

  document.getElementById('vExp').textContent=exp;
  document.getElementById('expected').style.borderColor=exp?'#4ade80':'#475569';
  document.getElementById('expected').querySelector('span').textContent=exp;
  document.querySelector('#expected').childNodes[0].textContent=expLabel+' = ';
  document.getElementById('vAct').textContent=act;

  var descs={
    'NOT':'NAND(A, A) — tying both inputs to A turns the NAND into an inverter. When A=0: NAND(0,0)=1. When A=1: NAND(1,1)=0.',
    'AND':'NAND(A,B) followed by NAND(out,out). The second NAND inverts the first output, giving NOT(NAND(A,B)) = AND(A,B). Cost: 2 NAND gates vs 1 AND gate (which itself contains a NAND + inverter internally).',
    'OR':'NAND(NAND(A,A), NAND(B,B)). Invert both inputs, then NAND them. By De Morgan: NOT(NOT(A) AND NOT(B)) = A OR B. Cost: 3 NAND gates.',
  };
  document.getElementById('desc').textContent=descs[mode];
  draw();
}

document.getElementById('btnA').onclick=function(){A=A?0:1;refresh();};
document.getElementById('btnB').onclick=function(){B=B?0:1;refresh();};
window.setMode=setMode;
refresh();`,
      outputHeight: 400,
    },

    // ── Challenge 2 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `How many NAND gates are needed to build a 2-input OR gate?`,
      options: [
        { label: 'A', text: '1 — a single NAND gate implements OR' },
        { label: 'B', text: '2 — one to invert each input, combined' },
        { label: 'C', text: '3 — one NAND per input inversion, plus one final NAND' },
        { label: 'D', text: '4 — you need a full adder circuit' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. OR(A,B) = NAND(NOT A, NOT B) by De Morgan\'s theorem. NOT A = NAND(A,A) — 1 gate. NOT B = NAND(B,B) — 1 gate. Final NAND of the two inverted inputs — 1 gate. Total: 3 NAND gates.',
      failMessage: 'By De Morgan\'s theorem: A OR B = NOT(NOT A AND NOT B) = NAND(NOT A, NOT B). You need NOT A and NOT B first — each requires one NAND with tied inputs. Then one more NAND combining them. That\'s 3 NAND gates total.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### De Morgan's Theorems: The Key to Converting Gates

Augustus De Morgan gave us the two theorems that make NAND and NOR interchangeable with AND and OR:

$\\overline{A \\cdot B} = \\bar{A} + \\bar{B}$
$\\overline{A + B} = \\bar{A} \\cdot \\bar{B}$

In English:
- **Theorem 1**: NOT(A AND B) = NOT(A) OR NOT(B). A NAND gate equals an OR gate with inverted inputs.
- **Theorem 2**: NOT(A OR B) = NOT(A) AND NOT(B). A NOR gate equals an AND gate with inverted inputs.

The practical consequence: **a NAND gate has two equivalent symbols**. Draw it as a NAND (AND body with a bubble at output) or draw it as an OR body with bubbles on both inputs — they are the same device. Which symbol you use depends on the logic context: use the symbol whose "active state" (the bubble positions) matches the signal's active level.

This dual-symbol notation is used extensively in professional schematics. When you see an OR gate with bubbled inputs on a real PCB schematic, it is physically a NAND gate. When you see an AND gate with bubbled inputs, it is physically a NOR gate.`,
    },

    // ── Visual 3 — De Morgan interactive ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### De Morgan's dual symbols

Each row shows two equivalent circuit symbols that implement the same logic function. Toggle the inputs — both symbols give identical outputs, proving they are the same gate. This is the basis of "mixed-logic" design used in professional schematics.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">
    <button id="btnA" class="inp-btn">A = 0</button>
    <button id="btnB" class="inp-btn">B = 0</button>
  </div>
  <canvas id="cv" width="560" height="280"></canvas>
  <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div class="eq-card" style="border-color:#d97706">
      <div style="font-size:11px;color:#d97706;font-weight:600;margin-bottom:4px">NAND = OR with inverted inputs</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5)">De Morgan: <span style="color:#fbbf24">NOT(A·B) = NOT(A) + NOT(B)</span></div>
    </div>
    <div class="eq-card" style="border-color:#7c3aed">
      <div style="font-size:11px;color:#7c3aed;font-weight:600;margin-bottom:4px">NOR = AND with inverted inputs</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5)">De Morgan: <span style="color:#a78bfa">NOT(A+B) = NOT(A) · NOT(B)</span></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.inp-btn{padding:7px 20px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.eq-card{padding:10px 14px;border-radius:8px;border:1px solid;background:rgba(255,255,255,0.03)}`,
      startCode: `
var A=0, B=0;
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

function nandOut(){return (A&&B)?0:1;}
function norOut(){return (A||B)?0:1;}

function drawANDbody(ctx,x,y,w,h,col,active){
  ctx.fillStyle=active?col+'22':'#0d1527';
  ctx.strokeStyle=active?col:'#334155'; ctx.lineWidth=active?2:1.5;
  ctx.beginPath();
  ctx.moveTo(x+4,y+4); ctx.lineTo(x+w/2-4,y+4);
  ctx.arc(x+w/2-4,y+h/2,h/2-4,-Math.PI/2,Math.PI/2);
  ctx.lineTo(x+4,y+h-4); ctx.closePath();
  ctx.fill(); ctx.stroke();
}
function drawORbody(ctx,x,y,w,h,col,active){
  ctx.fillStyle=active?col+'22':'#0d1527';
  ctx.strokeStyle=active?col:'#334155'; ctx.lineWidth=active?2:1.5;
  ctx.beginPath();
  ctx.moveTo(x+4,y+4);
  ctx.quadraticCurveTo(x+w/2-10,y+h/2,x+4,y+h-4);
  ctx.quadraticCurveTo(x+w/2,y+h,x+w-14,y+h/2);
  ctx.quadraticCurveTo(x+w/2,y,x+4,y+4);
  ctx.fill(); ctx.stroke();
}
function bub(x,y,col,filled){
  ctx.beginPath(); ctx.arc(x,y,5,0,2*Math.PI);
  ctx.fillStyle=filled?col+'44':'#0d1527';
  ctx.strokeStyle=col; ctx.lineWidth=1.5;
  ctx.fill(); ctx.stroke();
}
function wire(x1,y1,x2,y2,v,col){
  ctx.strokeStyle=col||(v?'#4ade80':'#475569');
  ctx.lineWidth=v?2.5:1.5;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}
function lbl(x,y,t,col,align){
  ctx.fillStyle=col||'rgba(255,255,255,0.45)';
  ctx.font='11px monospace'; ctx.textAlign=align||'center';
  ctx.fillText(t,x,y);
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  var no=nandOut(), ro=norOut();
  var colA=A?'#4ade80':'#475569', colB=B?'#4ade80':'#475569';

  // ─── Row 1: NAND (AND+bubble) vs OR with input bubbles ─────────────────
  var gy=20, gw=80, gh=60, rowLbl=gy+gh/2+4;

  // Symbol 1a: NAND (standard)
  var g1x=30;
  wire(ctx,g1x-24,gy+gh*0.3,g1x,gy+gh*0.3,A); lbl(g1x-26,gy+gh*0.3+4,'A',colA,'right');
  wire(ctx,g1x-24,gy+gh*0.7,g1x,gy+gh*0.7,B); lbl(g1x-26,gy+gh*0.7+4,'B',colB,'right');
  drawANDbody(ctx,g1x,gy,gw,gh,'#d97706',no);
  bub(g1x+gw+5,gy+gh/2,'#d97706',no);
  wire(ctx,g1x+gw+10,gy+gh/2,g1x+gw+38,gy+gh/2,no);
  lbl(g1x+gw+50,rowLbl,no.toString(),no?'#d97706':'#475569','left');
  lbl(g1x+gw/2,gy+gh+14,'NAND','#d97706');

  // Equals sign
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='bold 16px monospace'; ctx.textAlign='center';
  ctx.fillText('=', 185, rowLbl);

  // Symbol 1b: OR with bubbled inputs
  var g2x=210;
  wire(ctx,g2x-14,gy+gh*0.3,g2x,gy+gh*0.3,A);
  bub(g2x-10,gy+gh*0.3,'#d97706',!A);  // inverted input bubble
  wire(ctx,g2x-14,gy+gh*0.7,g2x,gy+gh*0.7,B);
  bub(g2x-10,gy+gh*0.7,'#d97706',!B);
  lbl(g2x-24,gy+gh*0.3+4,'A',colA,'right');
  lbl(g2x-24,gy+gh*0.7+4,'B',colB,'right');
  drawORbody(ctx,g2x,gy,gw,gh,'#d97706',no);
  wire(ctx,g2x+gw-4,gy+gh/2,g2x+gw+28,gy+gh/2,no);
  lbl(g2x+gw+40,rowLbl,no.toString(),no?'#d97706':'#475569','left');
  lbl(g2x+gw/2,gy+gh+14,'OR (inverted inputs)','#d97706');

  lbl(W/2,gy+gh+30,'Same physical gate — same output: '+no,'#d97706');

  // ─── Row 2: NOR (OR+bubble) vs AND with input bubbles ──────────────────
  var gy2=155, rowLbl2=gy2+gh/2+4;

  var g3x=30;
  wire(ctx,g3x-24,gy2+gh*0.3,g3x,gy2+gh*0.3,A); lbl(g3x-26,gy2+gh*0.3+4,'A',colA,'right');
  wire(ctx,g3x-24,gy2+gh*0.7,g3x,gy2+gh*0.7,B); lbl(g3x-26,gy2+gh*0.7+4,'B',colB,'right');
  drawORbody(ctx,g3x,gy2,gw,gh,'#7c3aed',ro);
  bub(g3x+gw+5,gy2+gh/2,'#7c3aed',ro);
  wire(ctx,g3x+gw+10,gy2+gh/2,g3x+gw+38,gy2+gh/2,ro);
  lbl(g3x+gw+50,rowLbl2,ro.toString(),ro?'#7c3aed':'#475569','left');
  lbl(g3x+gw/2,gy2+gh+14,'NOR','#7c3aed');

  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='bold 16px monospace'; ctx.textAlign='center';
  ctx.fillText('=', 185, rowLbl2);

  var g4x=210;
  wire(ctx,g4x-14,gy2+gh*0.3,g4x,gy2+gh*0.3,A);
  bub(g4x-10,gy2+gh*0.3,'#7c3aed',!A);
  wire(ctx,g4x-14,gy2+gh*0.7,g4x,gy2+gh*0.7,B);
  bub(g4x-10,gy2+gh*0.7,'#7c3aed',!B);
  lbl(g4x-24,gy2+gh*0.3+4,'A',colA,'right');
  lbl(g4x-24,gy2+gh*0.7+4,'B',colB,'right');
  drawANDbody(ctx,g4x,gy2,gw,gh,'#7c3aed',ro);
  wire(ctx,g4x+gw-4,gy2+gh/2,g4x+gw+28,gy2+gh/2,ro);
  lbl(g4x+gw+40,rowLbl2,ro.toString(),ro?'#7c3aed':'#475569','left');
  lbl(g4x+gw/2,gy2+gh+14,'AND (inverted inputs)','#7c3aed');

  lbl(W/2,gy2+gh+30,'Same physical gate — same output: '+ro,'#7c3aed');
}

function refresh(){
  ['A','B'].forEach(function(k){
    var v=k==='A'?A:B;
    var btn=document.getElementById('btn'+k);
    btn.textContent=k+' = '+v;
    btn.className='inp-btn'+(v?' hi':'');
  });
  draw();
}
document.getElementById('btnA').onclick=function(){A=A?0:1;refresh();};
document.getElementById('btnB').onclick=function(){B=B?0:1;refresh();};
refresh();`,
      outputHeight: 440,
    },

    // ── Challenge 3 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A schematic shows an AND gate symbol with bubbles on both input pins and no bubble on the output. What physical gate is this, and what Boolean function does it implement?`,
      options: [
        { label: 'A', text: 'It is an AND gate — the bubbles are just decorative indicators' },
        { label: 'B', text: 'It is a NOR gate, implementing NOT(A + B) = NOT(A) · NOT(B)' },
        { label: 'C', text: 'It is a NAND gate — AND with input bubbles equals NAND' },
        { label: 'D', text: 'It is an XNOR gate implementing equality detection' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. By De Morgan\'s theorem, NOT(A+B) = NOT(A) · NOT(B). An AND gate that inverts both inputs before combining them is equivalent to a NOR gate. The physical chip on the PCB is a NOR. Engineers draw the AND-with-bubbles symbol when the signal context makes that representation clearer.',
      failMessage: 'Apply De Morgan\'s theorem: AND with inverted inputs = NOT(A) · NOT(B). De Morgan says NOT(A) · NOT(B) = NOT(A + B) = NOR(A, B). So AND-body with input bubbles is physically a NOR gate. Remember: NAND = AND-body + output bubble = OR-body + input bubbles. NOR = OR-body + output bubble = AND-body + input bubbles.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why NAND is Preferred Over NOR in Practice

Both NAND and NOR are universal. But real chips overwhelmingly use NAND. The reason is transistor physics.

In CMOS, an N-channel MOSFET (NMOS) is faster than a P-channel MOSFET (PMOS) of the same size because electrons have higher mobility than holes — roughly 2× faster for the same gate dimensions.

A NAND gate's pull-down network uses NMOS transistors **in series** (both must conduct to pull output LOW). A NOR gate's pull-down network uses NMOS transistors **in parallel** (either can pull output LOW).

The NOR gate's pull-up network uses PMOS transistors **in series** — this is the slow path. Two slow PMOS transistors in series means the output rises slowly when inputs go LOW.

The NAND gate's pull-up network uses PMOS transistors **in parallel** — either can pull the output HIGH quickly.

Result: **NAND gates are faster than NOR gates at equal transistor sizes**. To make a NOR gate as fast as a NAND gate, you would need to make the PMOS transistors physically larger, consuming more chip area.

This is why standard cell libraries contain many NAND variants (2-input, 3-input, 4-input, with various drive strengths) and fewer NOR variants. The 7400 IC — the NAND gate — was the first and most widely manufactured logic IC in history.`,
    },

    // ── Visual 4 — NAND vs NOR speed comparison ───────────────────────────────
    {
      type: 'js',
      instruction: `### NAND vs NOR: transistor count and speed

The table below compares NAND and NOR gate implementations across key metrics. Click any gate to highlight its transistor arrangement.`,
      html: `<div style="padding:14px">
  <canvas id="cv" width="560" height="300"></canvas>
  <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap" id="btnRow"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.g-btn{padding:6px 14px;border-radius:16px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.5);font-family:monospace;font-size:12px;cursor:pointer}
.g-btn.sel{border-color:#fbbf24;background:rgba(251,191,36,0.12);color:#fbbf24}`,
      startCode: `
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var sel=0;

var data=[
  {name:'NOT',    n:1, pmos:'1 parallel', nmos:'1 series', pdnType:'series',  punType:'parallel', speed:'Fast',    area:'1×',  note:'Simplest CMOS gate'},
  {name:'NAND 2', n:4, pmos:'2 parallel',nmos:'2 series', pdnType:'series',  punType:'parallel', speed:'Fast',    area:'2×',  note:'PMOS parallel = fast rise'},
  {name:'NAND 3', n:6, pmos:'3 parallel',nmos:'3 series', pdnType:'series',  punType:'parallel', speed:'Medium', area:'3×',  note:'Series NMOS slows fall'},
  {name:'NOR 2',  n:4, pmos:'2 series',  nmos:'2 parallel',pdnType:'parallel',punType:'series',  speed:'Slow',   area:'2×+', note:'Series PMOS = slow rise'},
  {name:'NOR 3',  n:6, pmos:'3 series',  nmos:'3 parallel',pdnType:'parallel',punType:'series',  speed:'Slower', area:'3×+', note:'Slowest — 3 PMOS in series'},
];

var cols=['#059669','#d97706','#d97706','#7c3aed','#7c3aed'];
var speedCol={'Fast':'#4ade80','Medium':'#fbbf24','Slow':'#f87171','Slower':'#ef4444'};

function buildBtns(){
  var row=document.getElementById('btnRow');row.innerHTML='';
  data.forEach(function(d,i){
    var b=document.createElement('button');
    b.className='g-btn'+(sel===i?' sel':'');
    b.textContent=d.name;
    b.onclick=function(){sel=i;buildBtns();draw();};
    row.appendChild(b);
  });
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  // Table header
  var cols2=['Gate','Transistors','PMOS (pull-up)','NMOS (pull-down)','Speed'];
  var widths=[80,90,130,130,80];
  var startX=10, headerY=24;
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='bold 10px monospace';
  var cx=startX;
  cols2.forEach(function(h,i){
    ctx.textAlign='center';
    ctx.fillText(h,cx+widths[i]/2,headerY);
    cx+=widths[i];
  });
  ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(startX,headerY+6);ctx.lineTo(startX+widths.reduce(function(a,b){return a+b;},0),headerY+6);ctx.stroke();

  // Rows
  data.forEach(function(d,i){
    var y=headerY+18+i*44;
    var isSel=sel===i;
    if(isSel){
      ctx.fillStyle='rgba(255,255,255,0.05)';
      ctx.fillRect(startX,y-14,widths.reduce(function(a,b){return a+b;}),42);
    }
    var rowData=[d.name,d.n+' total',d.pmos,d.nmos,d.speed];
    var rcx=startX;
    rowData.forEach(function(v,j){
      var col='rgba(255,255,255,0.5)';
      if(j===0) col=isSel?'#fbbf24':cols[i];
      if(j===4) col=speedCol[d.speed]||'#94a3b8';
      if(j===2) col=d.punType==='series'?'#f87171':'#4ade80';
      if(j===3) col=d.pdnType==='series'?'#f87171':'#4ade80';
      ctx.fillStyle=isSel?col:(col==='rgba(255,255,255,0.5)'?col:col+'99');
      ctx.font=(isSel?'bold ':'')+((j===0?'12':'11')+'px monospace');
      ctx.textAlign='center';
      ctx.fillText(v,rcx+widths[j]/2,y);
      rcx+=widths[j];
    });
    // Note below row
    if(isSel){
      ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='10px monospace'; ctx.textAlign='left';
      ctx.fillText('\u2192 '+d.note, startX+8, y+16);
    }
    // Row divider
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(startX,y+22);ctx.lineTo(startX+widths.reduce(function(a,b){return a+b;}),y+22);ctx.stroke();
  });

  // Legend
  var legY=H-20;
  [[0,'#4ade80','Parallel = fast'],[120,'#f87171','Series = slow']].forEach(function(item){
    ctx.fillStyle=item[1]; ctx.fillRect(item[0]+10,legY-8,10,8);
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText(item[2],item[0]+24,legY);
  });
  ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='9px monospace'; ctx.textAlign='right';
  ctx.fillText('Click a row to highlight',W-10,legY);
}

buildBtns(); draw();`,
      outputHeight: 380,
    },

    // ── Challenge 4 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A chip designer needs to choose between building a logic block from 2-input NAND gates or 2-input NOR gates. Both are available. For the fastest circuit, which should they prefer and why?`,
      options: [
        { label: 'A', text: 'NOR gates — their parallel NMOS pull-down network switches faster' },
        { label: 'B', text: 'NAND gates — their parallel PMOS pull-up network switches faster than NOR\'s series PMOS pull-up' },
        { label: 'C', text: 'They are identical in speed — both use the same transistors' },
        { label: 'D', text: 'NOR gates — they use fewer transistors per gate' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. In CMOS, PMOS transistors are the slow path (holes have lower mobility than electrons). NAND gates put PMOS in parallel — either transistor can pull the output HIGH, so the slow PMOS transistors don\'t stack their delays. NOR gates put PMOS in series — both must conduct to pull HIGH, doubling the effective resistance and slowing the rising edge significantly.',
      failMessage: 'The critical path in CMOS involves PMOS transistors, which are slower than NMOS. NAND gates use PMOS in parallel (fast — any one can drive the output). NOR gates use PMOS in series (slow — both must conduct). This makes NAND gates systematically faster than NOR gates at equal transistor dimensions, which is why NAND dominates in standard cell libraries.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: NAND and NOR

**NAND** outputs 0 only when all inputs are 1. **NOR** outputs 1 only when all inputs are 0. Both are inverting gates — they naturally produce the complement of AND or OR.

**Both are universal** — every logic function can be implemented using only NAND gates or only NOR gates:
- NOT from NAND: tie both inputs together
- AND from NAND: two NAND gates (NAND then invert)
- OR from NAND: three NAND gates (invert each input, then NAND)

**De Morgan's theorems** give every inverting gate a dual symbol:
- NAND = AND-body + output bubble = OR-body + input bubbles
- NOR = OR-body + output bubble = AND-body + input bubbles

**NAND is preferred** in practice because its PMOS pull-up transistors are in parallel (fast), while NOR's series PMOS pull-up is slow. The 7400 NAND IC was the foundation of the entire TTL logic family.

In the next lesson: XOR and XNOR — the gates that detect difference and equality, and form the building blocks of adders.`,
    },
  ],
};

export default {
  id: 'df-3-2-nand-nor',
  slug: 'nand-nor-universal-gates',
  chapter: 'df.3',
  order: 1,
  title: 'NAND and NOR: The Universal Gates',
  subtitle: 'Why two gates are more powerful than seven — and how every logic function reduces to one.',
  tags: ['digital', 'NAND', 'NOR', 'universal-gates', 'de-morgan', 'boolean-algebra', 'CMOS', 'logic-gates'],
  hook: {
    question: 'If you could only keep one type of logic gate, which would it be — and could you really build everything from just that?',
    realWorldContext: 'The 7400 series NAND gate was the first commercially successful logic IC. Intel\'s original 4004 processor was built almost entirely from NAND gates. Every standard cell library today optimises NAND first. Universality isn\'t a theoretical curiosity — it\'s the reason chip fabs only need to perfect one gate.',
  },
  intuition: {
    prose: [
      'NAND: 0 only when both inputs are 1. NOR: 1 only when both inputs are 0.',
      'Universal: any logic function can be built from NAND alone (or NOR alone).',
      'De Morgan: NAND = OR with inverted inputs. NOR = AND with inverted inputs.',
      'NAND preferred: parallel PMOS pull-up is faster than NOR\'s series PMOS.',
    ],
    callouts: [
      { type: 'tip', title: 'De Morgan shortcut', body: 'To apply De Morgan: flip AND↔OR, then invert all inputs and the output. NAND(A,B) becomes OR(NOT A, NOT B). NOR(A,B) becomes AND(NOT A, NOT B).' },
      { type: 'important', title: 'Universality proof', body: 'NOT, AND, OR are functionally complete. Build all three from NAND alone → NAND is complete. Same argument applies to NOR.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'NAND and NOR: The Universal Gates', props: { lesson: LESSON_DF_3_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'NAND = NOT AND. Output LOW only when all inputs HIGH. One failing input saves the output.',
    'NOR = NOT OR. Output HIGH only when all inputs LOW. One HIGH input kills the output.',
    'Universal gate: NOT = NAND(A,A). AND = NOT(NAND). OR = NAND(NOT A, NOT B).',
    'De Morgan: bubble absorption — a bubble on an output can be pushed through the gate and splits into two input bubbles, changing AND↔OR.',
    'NAND > NOR speed: parallel PMOS (NAND) is faster than series PMOS (NOR).',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};