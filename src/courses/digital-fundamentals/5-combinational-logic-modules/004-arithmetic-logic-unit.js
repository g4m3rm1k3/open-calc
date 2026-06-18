// Digital Fundamentals · Unit 5 · Lesson 5
// The Arithmetic Logic Unit (ALU)
// ScienceNotebook format

export const LESSON_DF_5_5 = {
  title: 'The Arithmetic Logic Unit (ALU)',
  subtitle: 'How adders, comparators, and logic gates combine into the computing heart of every processor.',
  sequential: true,
  cells: [

    // ── Section 1 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What an ALU Does

Every lesson in Unit 5 has built toward this one. The **Arithmetic Logic Unit (ALU)** is a combinational circuit that performs a selectable set of arithmetic and logic operations on two N-bit operands and produces an N-bit result along with status flags.

The ALU is the computational core of every CPU, microcontroller, and DSP. When you write \`a + b\` or \`a & b\` or \`a == b\` in any programming language, the compiled code eventually issues an instruction that configures the ALU to perform that operation.

**Inputs**:
- **A, B**: two N-bit operands
- **Op**: an M-bit operation select code (like a MUX select)
- **Cᵢₙ**: carry-in (for chaining multiple ALU slices)

**Outputs**:
- **Result**: N-bit output
- **Z** (Zero): 1 when Result = 0
- **C** (Carry): carry-out from the MSB
- **N** (Negative): MSB of the Result (sign bit in 2's complement)
- **V** (oVerflow): signed overflow — carry into MSB ≠ carry out of MSB

**Typical operations** (controlled by Op bits):
| Op | Operation | Notes |
|----|-----------|-------|
| 000 | A + B | Addition |
| 001 | A + B + 1 | Add with carry |
| 010 | A − B | Subtraction (add 2's complement) |
| 011 | A − B − 1 | Subtract with borrow |
| 100 | A AND B | Bitwise AND |
| 101 | A OR B | Bitwise OR |
| 110 | A XOR B | Bitwise XOR |
| 111 | NOT A | Bitwise complement |

A real ALU (like the one inside an ARM Cortex-M0) supports 16–32 operations. The select lines are the opcode bits decoded from the instruction word.`,
    },

    // ── Visual 1 — ALU operation explorer ────────────────────────────────────
    {
      type: 'js',
      instruction: `### ALU operation explorer

Set operands A and B, then select the operation. The result and all four flags update instantly. Try subtraction and watch the carry flag indicate borrow. Try operations that produce zero to see the Z flag.`,
      html: `<div style="padding:14px">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">A = <strong id="lA" style="color:#38bdf8">0</strong></div>
      <input type="range" id="slA" min="0" max="255" value="170" style="width:100%;accent-color:#38bdf8">
    </div>
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">B = <strong id="lB" style="color:#a78bfa">0</strong></div>
      <input type="range" id="slB" min="0" max="255" value="85" style="width:100%;accent-color:#a78bfa">
    </div>
  </div>
  <div style="margin-bottom:12px">
    <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:6px">Operation (Op code):</div>
    <div id="opBtns" style="display:flex;gap:5px;flex-wrap:wrap"></div>
  </div>
  <canvas id="alucv" width="520" height="200"></canvas>
  <div id="aluNote" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.8"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:520px}
.op-btn{padding:5px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;cursor:pointer;text-align:left}
.op-btn.sel{border-color:#fbbf24;background:rgba(251,191,36,0.1);color:#fbbf24}`,
      startCode: `
var A=170,B=85,op=0;
var cv=document.getElementById('alucv'),ctx=cv.getContext('2d');

var OPS=[
  {code:'000',name:'A + B',     fn:function(){var r=(A+B);  return {r:r&0xFF,c:r>255?1:0,cIn:0};}},
  {code:'001',name:'A + B + 1', fn:function(){var r=(A+B+1);return {r:r&0xFF,c:r>255?1:0,cIn:1};}},
  {code:'010',name:'A - B',     fn:function(){var r=(A-B+256); return {r:r&0xFF,c:A<B?1:0,cIn:0};}},
  {code:'011',name:'A - B - 1', fn:function(){var r=(A-B-1+256);return {r:r&0xFF,c:(A-B-1)<0?1:0,cIn:1};}},
  {code:'100',name:'A AND B',   fn:function(){return {r:A&B,c:0,cIn:0};}},
  {code:'101',name:'A OR B',    fn:function(){return {r:A|B,c:0,cIn:0};}},
  {code:'110',name:'A XOR B',   fn:function(){return {r:A^B,c:0,cIn:0};}},
  {code:'111',name:'NOT A',     fn:function(){return {r:(~A)&0xFF,c:0,cIn:0};}},
];

function toBin(n,b){return(n>>>0).toString(2).padStart(b,'0');}
function toSigned(n){return n<128?n:n-256;}

function buildOps(){
  var d=document.getElementById('opBtns');d.innerHTML='';
  OPS.forEach(function(o,i){
    var b=document.createElement('button');
    b.className='op-btn'+(op===i?' sel':'');
    b.textContent=o.code+': '+o.name;
    b.onclick=function(){op=i;refresh();};
    d.appendChild(b);
  });
}

function draw(res){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var r=res.r,c=res.c;
  var Z=r===0?1:0, N=(r>>7)&1;
  var sA=toSigned(A),sB=toSigned(B),sR=toSigned(r);
  var cIn=( A>>7)&1, cOut=(r>>7)&1;
  var V=(OPS[op].name.indexOf('+')+OPS[op].name.indexOf('-')>-2)?((sA>=0&&sB>=0&&sR<0)||(sA<0&&sB<0&&sR>=0))?1:0:0;

  // ALU box
  var bx=160,by=20,bw=140,bh=H-40;
  ctx.fillStyle='rgba(251,191,36,0.06)';ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(bx,by,bw,bh,10);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fbbf24';ctx.font='bold 13px monospace';ctx.textAlign='center';
  ctx.fillText('ALU',bx+bw/2,by+20);
  ctx.font='10px monospace';ctx.fillStyle='rgba(255,255,255,0.4)';
  ctx.fillText(OPS[op].code+': '+OPS[op].name,bx+bw/2,by+34);

  function inputWire(label,val,y,col){
    ctx.strokeStyle=col;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(14,y);ctx.lineTo(bx,y);ctx.stroke();
    ctx.fillStyle=col;ctx.font='500 11px monospace';ctx.textAlign='right';
    ctx.fillText(label+'='+val,12,y+4);
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';
    ctx.fillText(toBin(val,8),12,y+14);
  }
  inputWire('A',A,by+50,'#38bdf8');
  inputWire('B',B,by+80,'#a78bfa');

  // Op code line (bottom of ALU box)
  ctx.strokeStyle='rgba(251,191,36,0.5)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(bx+bw/2,by+bh);ctx.lineTo(bx+bw/2,by+bh+16);ctx.stroke();
  ctx.fillStyle='#fbbf24';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Op='+OPS[op].code,bx+bw/2,by+bh+28);

  // Result wire
  var resY=by+bh/2;
  var resCol=r>0?'#4ade80':'rgba(255,255,255,0.3)';
  ctx.strokeStyle=resCol;ctx.lineWidth=r?2.5:1.5;
  ctx.beginPath();ctx.moveTo(bx+bw,resY);ctx.lineTo(W-14,resY);ctx.stroke();
  ctx.fillStyle=resCol;ctx.font='bold 13px monospace';ctx.textAlign='left';
  ctx.fillText('R='+r,W-12,resY+4);
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';
  ctx.fillText(toBin(r,8),W-12,resY+15);

  // Flags row
  var flags=[
    {name:'Z',val:Z,col:'#4ade80',desc:'Zero'},
    {name:'C',val:c,col:'#ef4444',desc:'Carry'},
    {name:'N',val:N,col:'#a78bfa',desc:'Negative'},
    {name:'V',val:V,col:'#fbbf24',desc:'oVerflow'},
  ];
  var fW=50,fX=bx+bw+16;
  flags.forEach(function(f,i){
    var fy=by+10+i*46;
    ctx.fillStyle=f.val?f.col+'22':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=f.val?f.col:'rgba(255,255,255,0.08)'; ctx.lineWidth=f.val?1.5:0.5;
    ctx.beginPath();ctx.roundRect(fX,fy,fW,38,5);ctx.fill();ctx.stroke();
    ctx.fillStyle=f.val?f.col:'rgba(255,255,255,0.2)';
    ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText(f.name,fX+fW/2,fy+13);
    ctx.font='bold 18px monospace';
    ctx.fillText(f.val,fX+fW/2,fy+31);
  });

  document.getElementById('lA').textContent=A;
  document.getElementById('lB').textContent=B;
  var note=A+' '+OPS[op].name.replace('A',A).replace('B',B)+' = '+r;
  if(OPS[op].name.indexOf('-')>=0||OPS[op].name.indexOf('+')>=0){
    note+='  (signed: '+toSigned(A)+' → '+toSigned(r)+')';
  }
  note+='\nFlags: Z='+Z+' C='+c+' N='+N+' V='+V;
  if(Z) note+=' | Result is zero';
  if(c&&OPS[op].code<'100') note+=' | Carry/borrow out';
  if(V) note+=' | Signed overflow!';
  document.getElementById('aluNote').textContent=note;
}

function refresh(){
  buildOps();
  var res=OPS[op].fn();
  draw(res);
}
document.getElementById('slA').oninput=function(){A=parseInt(this.value);refresh();};
document.getElementById('slB').oninput=function(){B=parseInt(this.value);refresh();};
refresh();`,
      outputHeight: 420,
    },

    // ── Challenge 1 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `An 8-bit ALU performs A − B with A=50 and B=80. What is the result byte and what does the Carry flag indicate?`,
      options: [
        { label: 'A', text: 'Result=226, Carry=1 — the subtraction required a borrow, indicating A < B (unsigned)' },
        { label: 'B', text: 'Result=30, Carry=0 — straightforward subtraction with no borrow' },
        { label: 'C', text: 'Result=0, Carry=1 — operands cancel' },
        { label: 'D', text: 'Result=226, Carry=0 — the result wraps but no carry is generated' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. 50−80 = −30. In 8-bit 2\'s complement, −30 = 256−30 = 226 = 0b11100010. Since A < B (50 < 80), a borrow was required, setting Carry=1. The negative sign is also indicated by N=1 (MSB of 226 is 1). No signed overflow since both operands are small positive numbers.',
      failMessage: '50−80 = −30. In unsigned 8-bit arithmetic, −30 wraps to 256−30 = 226. Since 50 < 80, a borrow occurred → Carry=1 (borrow flag). Result byte = 226 = 0b11100010.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 2 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Inside an ALU: The Bit Slice

A practical N-bit ALU is built from N identical **bit-slice** circuits connected in a carry chain. Each slice processes one bit of A, one bit of B, and a carry-in, producing one bit of the result and a carry-out.

The key insight is that both arithmetic and logic operations can be unified in a single circuit:

**The 74181 ALU** (1970) was the first ALU on a single chip. It is a 4-bit slice implementing 16 arithmetic and 16 logic functions, selected by four function-select inputs (S3–S0) and one mode input (M):
- **M=1**: logic mode — performs bitwise operations (AND, OR, XOR, NOT, etc.)
- **M=0**: arithmetic mode — performs addition-based operations

In logic mode the carry chain is disabled (no carry propagation). In arithmetic mode the carry chain is active, with carry-lookahead outputs (G, P) for fast cascading.

**Unifying arithmetic and logic**: the 74181 uses a clever trick — it routes the operands through a configurable pre-processing stage (controlled by S3–S0) before feeding them into a full adder. By choosing different preprocessing for each bit, you get OR, AND, XOR, NOT from the same adder hardware. This is the principle in all modern ALUs: logic is performed on the adder's inputs, not with separate gates.

**Carry-lookahead**: the 74181 exposes group-generate (G) and group-propagate (P) outputs that connect to the 74182 carry-lookahead unit, enabling fast 16-bit, 32-bit, or wider addition without ripple delay.`,
    },

    // ── Visual 2 — Bit-slice ALU ──────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### The bit-slice ALU: one stage of an 8-bit ALU

Each bit position processes its slice of A, B, and the carry chain. Toggle the individual input bits and observe how each slice independently computes its result bit and passes the carry to the next. The operation selector configures all slices simultaneously.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center">
    <span style="font-size:11px;color:rgba(255,255,255,0.35)">Operation:</span>
    <select id="bsOp" style="padding:5px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:#0d1527;color:#e2e8f0;font-family:monospace;font-size:12px">
      <option value="add">ADD (A+B)</option>
      <option value="sub">SUB (A-B)</option>
      <option value="and">AND</option>
      <option value="or">OR</option>
      <option value="xor">XOR</option>
    </select>
    <span style="font-size:11px;color:rgba(255,255,255,0.35);margin-left:8px">C₀ in:</span>
    <button id="bsCin" class="cin-btn">Cᵢₙ=0</button>
  </div>
  <div style="margin-bottom:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
    <span style="font-size:11px;color:#38bdf8;min-width:12px">A:</span>
    <div id="aBits" style="display:flex;gap:3px"></div>
    <span style="font-size:11px;color:rgba(255,255,255,0.3)" id="aVal"></span>
  </div>
  <div style="margin-bottom:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
    <span style="font-size:11px;color:#a78bfa;min-width:12px">B:</span>
    <div id="bBits" style="display:flex;gap:3px"></div>
    <span style="font-size:11px;color:rgba(255,255,255,0.3)" id="bVal"></span>
  </div>
  <canvas id="bscv" width="520" height="200"></canvas>
  <div id="bsResult" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.8"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:520px}
.bit-cell{width:30px;height:30px;border-radius:5px;border:1.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.25);font-family:monospace;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center}
.bit-cell.hi{border-color:#4ade80;background:rgba(74,222,128,0.12);color:#4ade80}
.cin-btn{padding:5px 12px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:12px;cursor:pointer}
.cin-btn.hi{border-color:#fbbf24;background:rgba(251,191,36,0.1);color:#fbbf24}`,
      startCode: `
var BITS=8;
var aBits=Array.from({length:BITS},function(_,i){return (0b10101010>>(BITS-1-i))&1;});
var bBits=Array.from({length:BITS},function(_,i){return (0b01010101>>(BITS-1-i))&1;});
var bsOp='add',cin0=0;
var cv=document.getElementById('bscv'),ctx=cv.getContext('2d');

function computeSlices(){
  var carries=new Array(BITS+1).fill(0);
  carries[BITS]=cin0;
  // For subtract, complement B and set cin=1
  var bEff=bBits.slice();
  var c0=cin0;
  if(bsOp==='sub'){bEff=bBits.map(function(b){return b^1;});c0=1;carries[BITS]=1;}
  var results=new Array(BITS).fill(0);
  for(var i=BITS-1;i>=0;i--){
    var a=aBits[i],b=bEff[i];
    if(bsOp==='and'){results[i]=a&b;carries[i]=0;}
    else if(bsOp==='or'){results[i]=a|b;carries[i]=0;}
    else if(bsOp==='xor'){results[i]=a^b;carries[i]=0;}
    else{ // add or sub
      var s=a+b+carries[i+1];
      results[i]=s%2;carries[i]=Math.floor(s/2);
    }
  }
  return {results:results,carries:carries,bEff:bEff};
}

function draw(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var d=computeSlices();
  var PAD={l:10,r:10,t:16,b:36};
  var iW=W-PAD.l-PAD.r;
  var sliceW=Math.floor(iW/BITS);
  var sliceH=H-PAD.t-PAD.b-10;

  // Column headers
  for(var i=0;i<BITS;i++){
    var x=PAD.l+i*sliceW;
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='8px monospace';ctx.textAlign='center';
    ctx.fillText('b'+(BITS-1-i),x+sliceW/2,PAD.t-2);
  }

  for(var i=0;i<BITS;i++){
    var x=PAD.l+i*sliceW;
    var a=aBits[i],b=bBits[i],r=d.results[i];
    var cin=d.carries[i+1], cout=d.carries[i];
    var isArith=(bsOp==='add'||bsOp==='sub');

    // Slice box
    var hasCarry=isArith&&(cin||cout);
    ctx.fillStyle=r?'rgba(74,222,128,0.08)':'rgba(255,255,255,0.02)';
    ctx.strokeStyle=r?'rgba(74,222,128,0.3)':'rgba(255,255,255,0.06)'; ctx.lineWidth=r?1.5:0.5;
    ctx.beginPath();ctx.roundRect(x+2,PAD.t,sliceW-4,sliceH,3);ctx.fill();ctx.stroke();

    // A bit
    ctx.fillStyle=a?'#38bdf8':'rgba(56,189,248,0.3)';ctx.font='bold 12px monospace';ctx.textAlign='center';
    ctx.fillText(a,x+sliceW/2,PAD.t+14);
    // B bit
    ctx.fillStyle=b?'#a78bfa':'rgba(167,139,250,0.3)';
    ctx.fillText(b,x+sliceW/2,PAD.t+26);

    // Operation symbol
    ctx.fillStyle='rgba(251,191,36,0.5)';ctx.font='9px monospace';
    ctx.fillText({add:'+',sub:'-',and:'&',or:'|',xor:'^'}[bsOp],x+sliceW/2,PAD.t+38);

    // Carry-in indicator (arithmetic only)
    if(isArith&&cin){
      ctx.fillStyle='rgba(239,68,68,0.6)';ctx.font='bold 9px monospace';
      ctx.fillText('C→',x+sliceW/2,PAD.t+50);
    }

    // Divider
    ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(x+sliceW/2-6,PAD.t+54);ctx.lineTo(x+sliceW/2+6,PAD.t+54);ctx.stroke();

    // Result bit
    ctx.fillStyle=r?'#4ade80':'rgba(255,255,255,0.2)';ctx.font='bold 15px monospace';
    ctx.fillText(r,x+sliceW/2,PAD.t+68);

    // Carry-out (arithmetic)
    if(isArith&&cout){
      ctx.fillStyle='rgba(239,68,68,0.8)';ctx.font='bold 9px monospace';
      ctx.fillText('C↑',x+sliceW/2,PAD.t+82);
    }
  }

  // Labels on left
  var lblX=PAD.l+2;
  ctx.fillStyle='#38bdf8';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('A',lblX,PAD.t+14);
  ctx.fillStyle='#a78bfa';ctx.fillText('B',lblX,PAD.t+26);
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillText('op',lblX,PAD.t+38);
  ctx.fillStyle='#4ade80';ctx.fillText('R',lblX,PAD.t+68);

  // Bottom: result value
  var rVal=parseInt(d.results.join(''),2);
  var aVal2=parseInt(aBits.join(''),2), bVal2=parseInt(bBits.join(''),2);
  var Z=rVal===0?1:0, C=d.carries[0], N=(rVal>>7)&1;
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='11px monospace';ctx.textAlign='left';
  ctx.fillText('Result: '+d.results.join('')+'b = '+rVal+
    '  |  Z='+Z+' C='+C+' N='+N,PAD.l,H-PAD.b+14);

  document.getElementById('aVal').textContent='= '+aVal2;
  document.getElementById('bVal').textContent='= '+bVal2;
  document.getElementById('bsResult').textContent=
    aVal2+' '+{add:'+',sub:'-',and:'AND',or:'OR',xor:'XOR'}[bsOp]+' '+bVal2+' = '+rVal+
    (bsOp==='sub'?'  ('+aVal2+'-'+bVal2+'='+( aVal2-bVal2)+' signed)':'')+
    '   Flags: Z='+Z+' C='+C+' N='+N;
}

function buildBitRows(){
  ['a','b'].forEach(function(which){
    var arr=which==='a'?aBits:bBits;
    var div=document.getElementById(which+'Bits');div.innerHTML='';
    arr.forEach(function(v,i){
      var cell=document.createElement('div');
      cell.className='bit-cell'+(v?' hi':'');
      cell.textContent=v;
      (function(idx,a){cell.onclick=function(){a[idx]^=1;refresh2();};})(i,arr);
      div.appendChild(cell);
    });
  });
}

function refresh2(){
  buildBitRows();draw();
  var cb=document.getElementById('bsCin');
  cb.textContent='C\u1d62\u2099='+cin0;cb.className='cin-btn'+(cin0?' hi':'');
}

document.getElementById('bsOp').onchange=function(){bsOp=this.value;refresh2();};
document.getElementById('bsCin').onclick=function(){cin0^=1;refresh2();};
refresh2();`,
      outputHeight: 400,
    },

    // ── Challenge 2 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In an ALU bit-slice for subtraction (A−B), why is the B input complemented and the initial carry-in set to 1?`,
      options: [
        { label: 'A', text: 'To save gates — complementing B is cheaper than building a separate subtractor' },
        { label: 'B', text: 'Because A−B = A + (NOT B) + 1, which is A plus the 2\'s complement of B. The adder performs subtraction by adding the negative of B.' },
        { label: 'C', text: 'Because the carry chain runs in reverse for subtraction' },
        { label: 'D', text: 'To set the Zero flag correctly when A equals B' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct. 2's complement negation: −B = NOT(B) + 1. So A − B = A + (−B) = A + NOT(B) + 1. The adder hardware is reused for subtraction by inverting B before the adder and setting C₀=1. This is why there is no separate subtractor in the ALU — the adder handles both operations.",
      failMessage: "A − B = A + (−B). In 2's complement: −B = NOT(B) + 1. So A − B = A + NOT(B) + 1. The ALU inverts B's bits (complementing) and sets the carry-in to 1 to add the +1. This reuses the same adder hardware for subtraction without any additional gates.",
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 3 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Flags and Condition Codes

The four flags — Z, C, N, V — are the bridge between the ALU and the control flow of a program. They are stored in a **status register** (also called the condition code register or flags register) after each ALU operation.

**Zero flag (Z)**:
$$Z = \\overline{R_7 + R_6 + R_5 + R_4 + R_3 + R_2 + R_1 + R_0}$$
One large NOR gate across all result bits. Z=1 only when every result bit is 0.

**Carry flag (C)**: The carry-out from the MSB full adder. For addition: C=1 means unsigned overflow (result > 255 for 8-bit). For subtraction: C=1 means borrow (A < B unsigned).

**Negative flag (N)**: Simply the MSB of the result — $N = R_7$. In 2's complement, the MSB is the sign bit. N=1 means the result is negative.

**Overflow flag (V)**: Signed overflow — the result is too large for the signed range.
$$V = C_{in,MSB} \\oplus C_{out,MSB}$$
When carry into the sign bit ≠ carry out of the sign bit, the sign changed unexpectedly. Two positive numbers produced a negative, or two negative numbers produced a positive.

**Condition codes and branching**: conditional branch instructions test flag combinations:

| Condition | Flags tested | Meaning |
|-----------|-------------|---------|
| EQ (Equal) | Z=1 | Last result was zero |
| NE (Not Equal) | Z=0 | Last result was non-zero |
| LT (signed less) | N≠V | Signed underflow |
| GE (signed greater-eq) | N=V | No signed underflow |
| LO (unsigned lower) | C=1 | Unsigned borrow |
| HS (unsigned higher-eq) | C=0 | No borrow |
| VS (overflow set) | V=1 | Signed overflow occurred |

This is why languages distinguish signed and unsigned comparison — they compile to different branch instructions that test different flag combinations.`,
    },

    // ── Visual 3 — Flag logic and condition codes ─────────────────────────────
    {
      type: 'js',
      instruction: `### Flags: how they are generated and what they mean

Step through different A and B values and operations. The flag logic is shown explicitly — exactly which circuit computes each flag. Select a condition code to see which flags it tests.`,
      html: `<div style="padding:14px">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">A = <strong id="fA2">0</strong></div>
      <input type="range" id="sfA2" min="0" max="255" value="200" style="width:100%;accent-color:#38bdf8">
    </div>
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">B = <strong id="fB2">0</strong></div>
      <input type="range" id="sfB2" min="0" max="255" value="100" style="width:100%;accent-color:#a78bfa">
    </div>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <select id="flagOp" style="padding:5px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:#0d1527;color:#e2e8f0;font-family:monospace;font-size:12px">
      <option value="add">ADD A+B</option>
      <option value="sub" selected>SUB A-B</option>
      <option value="and">AND A&amp;B</option>
    </select>
    <span style="font-size:11px;color:rgba(255,255,255,0.35)">Test condition:</span>
    <select id="condSel" style="padding:5px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:#0d1527;color:#e2e8f0;font-family:monospace;font-size:12px">
      <option value="eq">EQ — Z=1</option>
      <option value="ne">NE — Z=0</option>
      <option value="lt">LT (signed) — N≠V</option>
      <option value="ge">GE (signed) — N=V</option>
      <option value="lo">LO (unsigned) — C=1</option>
      <option value="hs">HS (unsigned) — C=0</option>
    </select>
  </div>
  <canvas id="flagcv" width="520" height="240"></canvas>
  <div id="flagNote" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.8"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:520px}
select{outline:none}`,
      startCode: `
var fA=200,fB=100,flagOp2='sub',cond='lt';
var cv=document.getElementById('flagcv'),ctx=cv.getContext('2d');

function compute(){
  var r,c,borrow=0;
  if(flagOp2==='add'){r=(fA+fB)&0xFF;c=fA+fB>255?1:0;}
  else if(flagOp2==='sub'){r=(fA-fB+256)&0xFF;c=fA<fB?1:0;}
  else{r=fA&fB;c=0;}
  var Z=r===0?1:0, N=(r>>7)&1;
  var sA=fA<128?fA:fA-256, sB=fB<128?fB:fB-256, sR=r<128?r:r-256;
  var V=0;
  if(flagOp2==='add'||flagOp2==='sub'){
    V=(sA>=0&&sB>=0&&sR<0)||(sA<0&&sB<0&&sR>=0)?1:0;
    if(flagOp2==='sub')V=(sA>=0&&sB<0&&sR<0)||(sA<0&&sB>=0&&sR>=0)?1:0;
  }
  return{r:r,Z:Z,C:c,N:N,V:V};
}

var CONDS={
  eq:{name:'EQ',rule:'Z=1',test:function(f){return f.Z===1;},color:'#4ade80'},
  ne:{name:'NE',rule:'Z=0',test:function(f){return f.Z===0;},color:'#4ade80'},
  lt:{name:'LT (signed)',rule:'N\u2260V (N XOR V = 1)',test:function(f){return (f.N^f.V)===1;},color:'#a78bfa'},
  ge:{name:'GE (signed)',rule:'N=V (N XOR V = 0)',test:function(f){return (f.N^f.V)===0;},color:'#a78bfa'},
  lo:{name:'LO (unsigned)',rule:'C=1',test:function(f){return f.C===1;},color:'#ef4444'},
  hs:{name:'HS (unsigned)',rule:'C=0',test:function(f){return f.C===0;},color:'#38bdf8'},
};

function draw2(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var f=compute();
  var flags=[
    {name:'Z',val:f.Z,col:'#4ade80',logic:'NOR of all result bits'},
    {name:'C',val:f.C,col:'#ef4444',logic:'Carry-out of MSB adder'},
    {name:'N',val:f.N,col:'#a78bfa',logic:'MSB of result (R\u2087)'},
    {name:'V',val:f.V,col:'#fbbf24',logic:'C\u1d62\u2099,MSB \u2295 C\u2092\u1d64\u209c,MSB'},
  ];

  var fw=90,fgap=14,fY=20,fH=68;
  var totalW=flags.length*(fw+fgap)-fgap;
  var fStartX=(W-totalW)/2;

  flags.forEach(function(f2,i){
    var fx=fStartX+i*(fw+fgap);
    ctx.fillStyle=f2.val?f2.col+'22':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=f2.val?f2.col:'rgba(255,255,255,0.08)'; ctx.lineWidth=f2.val?2:0.5;
    ctx.beginPath();ctx.roundRect(fx,fY,fw,fH,6);ctx.fill();ctx.stroke();
    ctx.fillStyle=f2.val?f2.col:'rgba(255,255,255,0.2)';
    ctx.font='bold 12px monospace';ctx.textAlign='center';
    ctx.fillText(f2.name,fx+fw/2,fY+16);
    ctx.font='bold 24px monospace';
    ctx.fillText(f2.val,fx+fw/2,fY+44);
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='8px monospace';
    // Wrap logic text
    var words=f2.logic.split(' ');var line='',lY=fY+fH+12;
    words.forEach(function(w){
      if((line+w).length>12){ctx.fillText(line.trim(),fx+fw/2,lY);line=w+' ';lY+=10;}else line+=w+' ';
    });
    if(line.trim()) ctx.fillText(line.trim(),fx+fw/2,lY);
  });

  // Condition test
  var selC=CONDS[cond];
  var taken=selC.test(f);
  var condY=fY+fH+46;
  ctx.fillStyle=taken?selC.color+'22':'rgba(255,255,255,0.03)';
  ctx.strokeStyle=taken?selC.color:'rgba(255,255,255,0.1)'; ctx.lineWidth=taken?2:0.5;
  ctx.beginPath();ctx.roundRect(20,condY,W-40,52,8);ctx.fill();ctx.stroke();
  ctx.fillStyle=taken?selC.color:'rgba(255,255,255,0.3)';
  ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('Condition '+selC.name+' ('+selC.rule+'): '+(taken?'TAKEN ✓':'NOT TAKEN ✗'),W/2,condY+20);

  // Context
  var opStr=flagOp2==='add'?fA+'+'+fB+'='+f.r:flagOp2==='sub'?fA+'-'+fB+'='+(fA-fB)+'(→'+f.r+')':fA+'&'+fB+'='+f.r;
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';
  ctx.fillText(opStr+' → Z='+f.Z+' C='+f.C+' N='+f.N+' V='+f.V,W/2,condY+38);

  document.getElementById('fA2').textContent=fA;
  document.getElementById('fB2').textContent=fB;
  document.getElementById('flagNote').textContent=
    'Operation: '+flagOp2.toUpperCase()+' '+fA+(flagOp2==='add'?'+':flagOp2==='sub'?'-':'&')+fB+' = '+f.r+
    '. Signed: '+(fA<128?fA:fA-256)+(flagOp2==='add'?'+':'-')+(fB<128?fB:fB-256)+'='+(fA<128?fA:fA-256)+(flagOp2==='add'?fB:-fB)+(flagOp2!=='and'?'='+(((fA<128?fA:fA-256)+(flagOp2==='add'?1:-1)*(fB<128?fB:fB-256))):'')+'.\n'+
    'Condition '+selC.name+': '+selC.rule+' → '+(taken?'branch taken (condition true)':'branch not taken (condition false)')+'.';
}

document.getElementById('sfA2').oninput=function(){fA=parseInt(this.value);draw2();};
document.getElementById('sfB2').oninput=function(){fB=parseInt(this.value);draw2();};
document.getElementById('flagOp').onchange=function(){flagOp2=this.value;draw2();};
document.getElementById('condSel').onchange=function(){cond=this.value;draw2();};
draw2();`,
      outputHeight: 420,
    },

    // ── Challenge 3 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `After SUB A, B an 8-bit ALU, the flags are Z=0, C=0, N=0, V=0. Which of the following correctly describes the relationship between A and B?`,
      options: [
        { label: 'A', text: 'A = B — Z=0 means they are not equal but the other flags are ambiguous' },
        { label: 'B', text: 'A > B (unsigned) — C=0 means no borrow, so A ≥ B; Z=0 means A ≠ B, so A > B' },
        { label: 'C', text: 'A < B (signed) — N=0 and V=0 means N XOR V = 0 which means GE condition' },
        { label: 'D', text: 'Cannot determine — need to know the actual values' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. C=0 after SUB means no borrow → A ≥ B (unsigned). Z=0 means the result is not zero → A ≠ B. Combining: A > B (unsigned). Also: N=0 and V=0 means N XOR V = 0 → signed GE condition holds, so A > B signed as well in this case.',
      failMessage: 'For SUB A−B: C=0 means no borrow was needed → A ≥ B (unsigned). Z=0 means result ≠ 0 → A ≠ B. Combined: A > B (unsigned). N=0 means result is positive. V=0 means no overflow. All flags consistent with A > B.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 4 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The ALU in a Datapath

A standalone ALU is not yet a CPU — it needs a **datapath** connecting it to registers and memory. The datapath is the collection of registers, buses, and MUXes that move data to and from the ALU.

**A minimal datapath** for a single-cycle CPU:

1. **Register file**: a bank of N registers (e.g., 16 × 32-bit registers in ARM). Two read ports output operands A and B; one write port stores the result.
2. **Operand MUXes**: select between register values and immediate constants (embedded in the instruction word).
3. **ALU**: receives A and B, performs the selected operation, outputs Result and flags.
4. **Result routing**: the result goes back to the register file write port, or to the memory address bus (for load/store instructions).
5. **PC (Program Counter)**: a special register holding the address of the next instruction. The ALU is often reused to compute the next PC (PC + 4 for normal flow, PC + offset for branches).

**Control signals**: every MUX and functional unit is controlled by signals decoded from the instruction opcode. In a single-cycle design, the control logic is entirely combinational — it decodes the instruction and sets all control signals simultaneously.

**Pipelining**: a pipelined CPU divides the datapath into stages (Fetch, Decode, Execute, Memory, Write-back) separated by registers. Each stage processes a different instruction simultaneously — five instructions in flight at once for a 5-stage pipeline. The ALU sits in the Execute stage. Pipeline hazards (data dependencies, control flow) require stalls or forwarding paths.`,
    },

    // ── Visual 4 — Simple datapath diagram ────────────────────────────────────
    {
      type: 'js',
      instruction: `### A single-cycle datapath

Click an instruction type to highlight the active data path. Each path shows which components are engaged and what data flows where.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
    <button class="dp-btn active" id="dpR" onclick="setDP('R')">R-type (ADD/AND)</button>
    <button class="dp-btn"        id="dpI" onclick="setDP('I')">I-type (ADDI)</button>
    <button class="dp-btn"        id="dpLd" onclick="setDP('LD')">Load</button>
    <button class="dp-btn"        id="dpBr" onclick="setDP('BR')">Branch (BEQ)</button>
  </div>
  <canvas id="dpcv" width="520" height="280"></canvas>
  <div id="dpNote" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.8"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:520px}
.dp-btn{padding:5px 12px;border-radius:16px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;cursor:pointer}
.dp-btn.active{border-color:#fbbf24;background:rgba(251,191,36,0.1);color:#fbbf24}`,
      startCode: `
var dp='R';
var cv=document.getElementById('dpcv'),ctx=cv.getContext('2d');

var DP_INFO={
  R:  {color:'#4ade80', desc:'R-type instruction (e.g. ADD R3, R1, R2): Read R1→A, R2→B. ALU performs operation. Result→R3. PC→PC+4.'},
  I:  {color:'#38bdf8', desc:'I-type instruction (e.g. ADDI R3, R1, #5): Read R1→A. Immediate constant→B (not register). ALU adds. Result→R3.'},
  LD: {color:'#a78bfa', desc:'Load instruction (e.g. LW R3, 8(R1)): Read R1→A. Immediate offset→B. ALU computes address. Memory[address]→R3.'},
  BR: {color:'#f472b6', desc:'Branch instruction (e.g. BEQ R1, R2, label): Read R1→A, R2→B. ALU subtracts → Z flag. If Z=1: PC = PC + offset. Else: PC = PC+4.'},
};

function box(x,y,w,h,label,col,active){
  ctx.fillStyle=active?col+'22':'rgba(255,255,255,0.03)';
  ctx.strokeStyle=active?col:'rgba(255,255,255,0.12)'; ctx.lineWidth=active?2:0.5;
  ctx.beginPath();ctx.roundRect(x,y,w,h,6);ctx.fill();ctx.stroke();
  ctx.fillStyle=active?col:'rgba(255,255,255,0.35)';
  ctx.font=(active?'bold ':'')+'11px monospace';ctx.textAlign='center';
  ctx.fillText(label,x+w/2,y+h/2+4);
}
function arrow(x1,y1,x2,y2,active,col,dashed){
  ctx.strokeStyle=active?col:'rgba(255,255,255,0.08)';
  ctx.lineWidth=active?2.5:1;
  if(dashed){ctx.setLineDash([4,3]);}else{ctx.setLineDash([]);}
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  ctx.setLineDash([]);
  if(active){
    var angle=Math.atan2(y2-y1,x2-x1);
    ctx.fillStyle=col;
    ctx.beginPath();
    ctx.moveTo(x2,y2);
    ctx.lineTo(x2-8*Math.cos(angle-0.4),y2-8*Math.sin(angle-0.4));
    ctx.lineTo(x2-8*Math.cos(angle+0.4),y2-8*Math.sin(angle+0.4));
    ctx.closePath();ctx.fill();
  }
}

function draw3(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var col=DP_INFO[dp].color;
  var isR=dp==='R',isI=dp==='I',isLd=dp==='LD',isBr=dp==='BR';
  var isALU=true;
  var useImm=isI||isLd||isBr;
  var writeReg=isR||isI||isLd;
  var useMem=isLd;
  var isBranch=isBr;

  // PC
  box(10,H/2-20,50,40,'PC','#94a3b8',true);
  // Instruction Memory
  box(80,H/2-25,70,50,'IMEM','#94a3b8',true);
  // Register File
  box(180,H/2-40,80,80,'Reg\nFile',col,true);
  // MUX (B operand select)
  box(290,H/2+5,30,30,'MUX',col,useImm);
  // ALU
  box(350,H/2-30,70,60,'ALU',col,isALU);
  // Data Memory
  box(450,H/2-20,58,40,'DMEM',col,useMem);

  // PC → IMEM
  arrow(60,H/2,80,H/2,true,'#94a3b8',false);
  // IMEM → RegFile
  arrow(150,H/2,180,H/2-10,true,col,false);
  // IMEM → Imm
  if(useImm){
    arrow(150,H/2+10,290,H/2+15,isI||isLd||isBr,col,true);
    ctx.fillStyle=col;ctx.font='8px monospace';ctx.textAlign='center';
    ctx.fillText('imm',220,H/2+8);
  }
  // RegFile A → ALU
  arrow(260,H/2-20,350,H/2-12,true,col,false);
  ctx.fillStyle=col;ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText('A',305,H/2-22);
  // RegFile B or Imm → MUX → ALU
  arrow(260,H/2+20,290,H/2+20,true,col,false);
  ctx.fillStyle=col;ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText('B',275,H/2+14);
  arrow(320,H/2+20,350,H/2+4,true,col,false);
  // ALU → DMEM or RegFile
  if(useMem){
    arrow(420,H/2,450,H/2,true,col,false);
    ctx.fillStyle=col;ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText('addr',435,H/2-6);
    arrow(508,H/2,508,H/2-60,true,col,false);
    ctx.beginPath();ctx.moveTo(508,H/2-60);ctx.lineTo(260,H/2-60);ctx.lineTo(260,H/2-30);ctx.stroke();
    ctx.fillStyle=col;ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText('data→R',350,H/2-66);
  } else if(writeReg){
    arrow(420,H/2,420,H/2-80,true,col,false);
    ctx.beginPath();ctx.moveTo(420,H/2-80);ctx.lineTo(220,H/2-80);ctx.lineTo(220,H/2-40);
    ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.stroke();
    ctx.fillStyle=col;ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText('result',320,H/2-86);
  }
  // Branch: Z flag → PC MUX
  if(isBranch){
    ctx.strokeStyle=col;ctx.lineWidth=2;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(385,H/2-30);ctx.lineTo(385,14);ctx.lineTo(35,14);ctx.lineTo(35,H/2-20);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle=col;ctx.font='8px monospace';ctx.textAlign='center';
    ctx.fillText('Z flag → branch?',210,10);
    ctx.fillText('PC + offset',210,22);
  }
  // PC+4 normal flow
  ctx.strokeStyle='rgba(148,163,184,0.4)';ctx.lineWidth=1;ctx.setLineDash([3,2]);
  ctx.beginPath();ctx.moveTo(35,H/2-20);ctx.lineTo(35,H-12);ctx.lineTo(60,H-12);
  ctx.fillStyle='rgba(148,163,184,0.3)';ctx.font='8px monospace';ctx.textAlign='left';
  ctx.fillText('PC+4',62,H-8);
  ctx.setLineDash([]);

  document.getElementById('dpNote').textContent=DP_INFO[dp].desc;
}

function setDP(d){
  dp=d;
  ['R','I','LD','BR'].forEach(function(k){
    document.getElementById('dp'+k).className='dp-btn'+(dp===k?' active':'');
  });
  draw3();
}
window.setDP=setDP;
draw3();`,
      outputHeight: 420,
    },

    // ── Challenge 4 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In a single-cycle CPU datapath, a Load instruction (LW R3, 8(R1)) uses the ALU to compute the memory address. What operation does the ALU perform, and what are its two inputs?`,
      options: [
        { label: 'A', text: 'ALU performs AND; inputs are R1 and R3 (the destination register)' },
        { label: 'B', text: 'ALU performs ADD; inputs are R1 (base register) and 8 (immediate offset from the instruction)' },
        { label: 'C', text: 'ALU performs SUB; inputs are R1 and the memory address 8' },
        { label: 'D', text: 'ALU is bypassed for Load — it goes directly to memory' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. LW R3, 8(R1) means: load the word at memory address (R1 + 8) into R3. The ALU computes R1 + 8 (base + offset) to form the effective memory address. Input A = R1 from the register file. Input B = 8, the immediate offset extracted from the instruction word, routed through the immediate MUX.',
      failMessage: 'LW R3, 8(R1): the address is R1+8. The ALU adds the base register R1 and the immediate offset 8. Input A = R1 (from register file read port). Input B = 8 (immediate field from instruction, selected by the B-operand MUX). Result feeds the data memory address port.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: The ALU

**Structure**: two N-bit operand inputs (A, B), an M-bit operation select (Op), carry-in (Cᵢₙ), N-bit result output, and four status flags (Z, C, N, V).

**Operations**: arithmetic (add, subtract with carry/borrow) and logic (AND, OR, XOR, NOT) selected by Op bits. Subtraction reuses the adder: $A - B = A + \\overline{B} + 1$.

**Flags**:
- $Z = \\overline{R_7 + \\cdots + R_0}$ — NOR of all result bits
- $C$ — carry/borrow out of MSB
- $N = R_7$ — sign bit (MSB) of result
- $V = C_{in,MSB} \\oplus C_{out,MSB}$ — signed overflow

**Condition codes**: conditional branch instructions test flag combinations to implement signed/unsigned comparisons. JL (signed less-than) tests N⊕V. JB (unsigned below) tests C. JE (equal) tests Z.

**In a datapath**: the ALU sits between the register file and memory. Operand MUXes select between register values and immediates. Control signals decoded from the instruction word configure the ALU and routing MUXes. In pipelined designs, the ALU occupies the Execute stage.

This completes Unit 5: Combinational Building Blocks. Unit 6 begins sequential logic — flip-flops, latches, and the circuits that hold state across clock cycles.`,
    },
  ],
};

export default {
  id: 'df-5-5-alu',
  slug: 'arithmetic-logic-unit',
  chapter: 'df.5',
  order: 5,
  title: 'The Arithmetic Logic Unit (ALU)',
  subtitle: 'How adders, comparators, and logic gates combine into the computing heart of every processor.',
  tags: ['digital','ALU','arithmetic','flags','datapath','carry','overflow','condition-codes','74181','pipeline'],
  hook: {
    question: 'When your CPU executes a + b in nanoseconds, what is actually happening inside the silicon — and how does if (a > b) know which path to take?',
    realWorldContext: 'Every program instruction that manipulates data passes through an ALU. The flags it sets control every conditional branch. The 74181 4-bit ALU IC was a landmark achievement in 1970. Modern CPUs contain dozens of ALU units executing in parallel, but they all implement the same fundamental Z/C/N/V flag logic described in this lesson.',
  },
  intuition: {
    prose: [
      'ALU = configurable combinational circuit: adder + logic gates + flag generation, all in one.',
      'A−B = A + NOT(B) + 1. No separate subtractor — the adder handles it.',
      'Z = NOR all result bits. C = carry out. N = MSB. V = carry_in_MSB XOR carry_out_MSB.',
      'Branch tests flag combos: EQ→Z, LT→N⊕V, LO→C. Signed vs unsigned = different flags.',
    ],
    callouts: [
      {type:'tip', title:'Subtraction trick', body:'NOT(B)+1 is the 2\'s complement negation of B. A−B = A+NOT(B)+1. Set B-input inverters and Cᵢₙ=1. One hardware unit does both add and subtract.'},
      {type:'important', title:'Overflow vs carry', body:'Carry (C) is unsigned overflow — the result exceeded the unsigned range. Overflow (V) is signed overflow — the result exceeded the signed range. They are completely independent and test different scenarios.'},
    ],
    visualizations:[{id:'ScienceNotebook',title:'The ALU',props:{lesson:LESSON_DF_5_5}}],
  },
  math:{prose:[],callouts:[],visualizations:[]},
  rigor:{prose:[],callouts:[],visualizations:[]},
  examples:[],challenges:[],
  mentalModel:[
    'ALU op select = MUX select for which operation to perform. Op bits come from decoded instruction.',
    'A−B: invert all B bits, set Cᵢₙ=1. Same adder, different inputs.',
    'Z flag: one big NOR gate. If any result bit is 1, Z=0.',
    'V flag: carry into sign bit XOR carry out of sign bit. Pos+Pos=Neg or Neg+Neg=Pos.',
    'Datapath: RegFile → operand MUXes → ALU → result MUX → RegFile/Memory.',
  ],
  checkpoints:['read-intuition'],
  quiz:[],
};