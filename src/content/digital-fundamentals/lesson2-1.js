// Digital Fundamentals · Chapter 2 · Lesson 1
// Binary Numbers
// ScienceNotebook format — visuals + challenges

export const LESSON_DF_2_1 = {
  title: 'Binary Numbers',
  subtitle: 'Base-2 counting, bit widths, and converting between binary and decimal.',
  sequential: true,

  cells: [

    // ── Section 1 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why Base 2?

Our familiar decimal system uses base 10 — ten distinct digit symbols (0–9). A digital circuit has two stable states: low voltage (0) and high voltage (1). Using two symbols is therefore the natural choice for digital computation.

**Positional notation** works identically in any base. In base 10:

$345 = 3 \\times 10^2 + 4 \\times 10^1 + 5 \\times 10^0$

In base 2, each position's weight is a power of 2:

$1011_2 = 1 \\times 2^3 + 0 \\times 2^2 + 1 \\times 2^1 + 1 \\times 2^0 = 8 + 0 + 2 + 1 = 11_{10}$

The rightmost bit (weight $2^0 = 1$) is the **Least Significant Bit (LSB)**. The leftmost bit (highest weight) is the **Most Significant Bit (MSB)**.

**Terminology**:

| Term | Definition |
|------|-----------|
| Bit | A single binary digit: 0 or 1 |
| Nibble | 4 bits — represents values 0–15 |
| Byte | 8 bits — represents values 0–255 |
| Word | Processor-defined width: 16, 32, or 64 bits |

**Range of an N-bit unsigned integer**:
$0 \\text{ to } 2^N - 1$

Adding one bit doubles the range. An 8-bit byte holds 256 distinct values (0–255), a 16-bit word holds 65,536 (0–65535), and a 32-bit word holds over 4 billion values.`,
    },

    // ── Visual 1 — Bit weight explorer ────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Bit weights and positional notation

Click any bit to toggle it. Watch how each bit's contribution to the total changes based on its position. The weight doubles for every step to the left — this is the essence of base-2 positional notation.`,
      html: `<div style="padding:14px">
  <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px">Click a bit to toggle it</div>
  <canvas id="cv" width="560" height="260" style="cursor:pointer"></canvas>
  <div id="valRow" style="margin-top:10px;display:flex;gap:16px;flex-wrap:wrap;align-items:baseline"></div>
  <div id="expDesc" style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}canvas{border-radius:8px;display:block;width:100%}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var bits=new Array(8).fill(0);
bits[0]=0;bits[3]=1;bits[5]=1;bits[7]=1; // default: 10101000 = 168

var COLS=['#38bdf8','#38bdf8','#38bdf8','#38bdf8','#a78bfa','#a78bfa','#4ade80','#4ade80'];
// bit 7=MSB (index 0), bit 0=LSB (index 7)
// bits[i] = bit at weight 2^(7-i)

function weight(i){return Math.pow(2,7-i);}
function value(){return bits.reduce(function(s,b,i){return s+b*weight(i);},0);}

function refresh(){
  var v=value();
  var parts=bits.map(function(b,i){return b?weight(i):0;}).filter(function(x){return x>0;});
  document.getElementById('valRow').innerHTML=
    '<span style="font-size:16px;color:#4ade80;font-weight:700">'+v+'</span>'+
    '<span style="font-size:12px;color:rgba(255,255,255,0.4)">decimal</span>'+
    '<span style="font-size:13px;color:#38bdf8">'+(v.toString(16).toUpperCase().padStart(2,'0'))+'</span>'+
    '<span style="font-size:12px;color:rgba(255,255,255,0.4)">hex</span>';
  document.getElementById('expDesc').textContent=
    bits.join('')+' = '+(parts.length?parts.join(' + '):'0');
  draw();
}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var cw=Math.floor(W/8),pad=4,btH=56;
  var btY=16;

  bits.forEach(function(b,i){
    var x=i*cw+pad/2;
    var w=cw-pad;
    var col=COLS[i];
    var barH=Math.floor(btH*0.8);

    // Bit cell
    ctx.fillStyle=b?col+'44':'rgba(255,255,255,0.04)';
    ctx.fillRect(x,btY,w,btH);
    ctx.strokeStyle=b?col:'rgba(255,255,255,0.12)';ctx.lineWidth=b?2:1;
    ctx.strokeRect(x,btY,w,btH);

    // Bit value
    ctx.fillStyle=b?col:'rgba(255,255,255,0.35)';
    ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(b,x+w/2,btY+btH/2);
    ctx.textBaseline='alphabetic';

    // Bit index
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText('b'+(7-i),x+w/2,btY+btH+12);

    // Weight label
    ctx.fillStyle=b?col:'rgba(255,255,255,0.2)';
    ctx.font='bold 10px monospace';
    ctx.fillText('2\u207F'.replace('\u207F',String.fromCharCode(0x2070+(7-i))),x+w/2,btY+btH+26);

    // Contribution bar
    var maxBar=140;
    var contribH=b?Math.max(4,Math.round(maxBar*(weight(i)/128))):0;
    var barY=btY+btH+36;
    ctx.fillStyle=b?col+'55':'rgba(255,255,255,0.04)';
    ctx.fillRect(x+pad,barY+maxBar-contribH,w-pad*2,contribH);
    ctx.strokeStyle=b?col:'rgba(255,255,255,0.06)';ctx.lineWidth=1;
    ctx.strokeRect(x+pad,barY,w-pad*2,maxBar);

    // Contribution value
    if(b){
      ctx.fillStyle=col;ctx.font='bold 10px monospace';ctx.textAlign='center';
      ctx.fillText(weight(i),x+w/2,barY+maxBar-contribH-4);
    }
  });

  // Nibble grouping brackets
  [[0,3,'#a78bfa','HIGH nibble'],[4,7,'#38bdf8','LOW nibble']].forEach(function(g){
    var x1=g[0]*cw+pad/2,x2=g[1]*cw+cw-pad/2;
    var by=btY-4;
    ctx.strokeStyle=g[2];ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x1,by);ctx.lineTo(x1,by-8);ctx.lineTo(x2,by-8);ctx.lineTo(x2,by);ctx.stroke();
    ctx.fillStyle=g[2];ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText(g[3],(x1+x2)/2,by-12);
  });
}

canvas.onclick=function(e){
  var rect=canvas.getBoundingClientRect();
  var mx=(e.clientX-rect.left)*(W/rect.width);
  var cw=Math.floor(W/8);
  var i=Math.floor(mx/cw);
  if(i>=0&&i<8){bits[i]=bits[i]?0:1;refresh();}
};

refresh();`,
      outputHeight: 380,
    },

    // ── Section 2 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Counting in Binary

Counting in binary follows the same rule as decimal: when a digit reaches its maximum value, it wraps to 0 and carries 1 to the next position.

In decimal the maximum single digit is 9; in binary the maximum is 1.

| Decimal | Binary | Pattern |
|---------|--------|---------|
| 0 | 0000 | |
| 1 | 0001 | LSB flips every step |
| 2 | 0010 | |
| 3 | 0011 | |
| 4 | 0100 | bit 2 flips every 4 steps |
| 5 | 0101 | |
| 6 | 0110 | |
| 7 | 0111 | |
| 8 | 1000 | bit 3 flips every 8 steps |
| 15 | 1111 | max for 4 bits |
| 16 | 10000 | requires a 5th bit |

**Key pattern**: bit $n$ changes state every $2^n$ count steps. The LSB (bit 0) alternates 0, 1, 0, 1... Bit 1 alternates in pairs: 0, 0, 1, 1, 0, 0, 1, 1... Bit 2 alternates in groups of 4, and so on.

This pattern is directly visible in clock dividers: feeding a clock signal into a D flip-flop divides its frequency by 2. Chain eight flip-flops and you have an 8-bit binary counter where each output divides by a further factor of 2.`,
    },

    // ── Visual 2 — Binary counter ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Binary counter: stepping through values

Use the buttons to increment or decrement a 4-bit counter. The pattern of bits changing shows the doubling step-period of each bit position. Watch how the LSB flips every step while higher bits change less and less frequently.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:10px;margin-bottom:16px;align-items:center;flex-wrap:wrap">
    <button id="decBtn">&#8722; Decrement</button>
    <button id="incBtn">+ Increment</button>
    <button id="rstBtn">Reset</button>
    <span id="stepCount" style="font-size:11px;color:rgba(255,255,255,0.35);margin-left:8px"></span>
  </div>
  <canvas id="cv" width="560" height="240"></canvas>
  <div id="histRow" style="margin-top:10px;font-size:11px;color:rgba(255,255,255,0.35);font-family:monospace;line-height:1.8;max-height:80px;overflow:hidden;border-left:2px solid rgba(255,255,255,0.08);padding-left:10px"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%}
button{padding:6px 16px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.6);font-family:monospace;font-size:12px;cursor:pointer}
button:hover{color:#e2e8f0;border-color:rgba(255,255,255,0.35)}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var count=0,BITS=4,MAX=Math.pow(2,BITS)-1;
var history=[],steps=0;

function toBits(n){
  var b=[];
  for(var i=BITS-1;i>=0;i--) b.push((n>>i)&1);
  return b;
}

function refresh(){
  var b=toBits(count);
  document.getElementById('stepCount').textContent='Steps taken: '+steps;
  history.unshift(count.toString().padStart(2)+' = '+b.join(''));
  if(history.length>6) history.pop();
  document.getElementById('histRow').innerHTML=history.map(function(h,i){
    return '<span style="opacity:'+(1-i*0.14)+'">'+h+'</span>';
  }).join('<br>');
  draw(b);
}

document.getElementById('incBtn').onclick=function(){count=(count+1)&MAX;steps++;refresh();};
document.getElementById('decBtn').onclick=function(){count=(count-1+MAX+1)&MAX;steps++;refresh();};
document.getElementById('rstBtn').onclick=function(){count=0;steps=0;history=[];refresh();};

function draw(bits){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var COLS=['#a78bfa','#38bdf8','#4ade80','#fbbf24'];
  var CX=W/2,bitGap=90,startX=CX-(BITS-1)*bitGap/2;
  var bitY=H/2-20;

  bits.forEach(function(b,i){
    var x=startX+i*bitGap;
    var col=COLS[i];

    // Circle
    ctx.beginPath();ctx.arc(x,bitY,30,0,Math.PI*2);
    ctx.fillStyle=b?col+'33':'rgba(255,255,255,0.04)';ctx.fill();
    ctx.strokeStyle=b?col:'rgba(255,255,255,0.18)';ctx.lineWidth=b?2.5:1.5;ctx.stroke();

    // Bit value
    ctx.fillStyle=b?col:'rgba(255,255,255,0.4)';
    ctx.font='bold 22px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(b,x,bitY);ctx.textBaseline='alphabetic';

    // Bit index and weight
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText('bit '+(BITS-1-i),x,bitY+42);
    ctx.fillStyle=b?col:'rgba(255,255,255,0.2)';ctx.font='bold 10px monospace';
    ctx.fillText('w='+Math.pow(2,BITS-1-i),x,bitY+55);

    // Period label
    var period=Math.pow(2,BITS-1-i);
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';
    ctx.fillText('flips every '+period,x,bitY-42);
  });

  // Decimal display
  ctx.fillStyle='#4ade80';ctx.font='bold 36px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(count,CX,bitY-90);ctx.textBaseline='alphabetic';
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='12px monospace';
  ctx.fillText('decimal',CX,bitY-58);

  // Binary string
  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='13px monospace';ctx.textAlign='center';
  ctx.fillText(bits.join('')+'  ('+count+')',CX,H-10);

  // Overflow / max indicator
  if(count===MAX){
    ctx.fillStyle='#fbbf24';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText('MAX (next increment wraps to 0)',CX,bitY-72);
  }
}

refresh();`,
      outputHeight: 360,
    },

    // ── Section 3 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Converting Between Binary and Decimal

**Binary → Decimal**: Sum the weights of all positions where the bit is 1.

$1101_2 = 1 \\times 8 + 1 \\times 4 + 0 \\times 2 + 1 \\times 1 = 13_{10}$

**Decimal → Binary**: Use the **divide-by-two algorithm**. Repeatedly divide by 2 and write down each remainder. Read the remainders from bottom to top.

Example: convert 45 to binary.

| Step | Quotient | Remainder |
|------|----------|-----------|
| 45 ÷ 2 | 22 | **1** ← LSB |
| 22 ÷ 2 | 11 | **0** |
| 11 ÷ 2 | 5 | **1** |
| 5 ÷ 2 | 2 | **1** |
| 2 ÷ 2 | 1 | **0** |
| 1 ÷ 2 | 0 | **1** ← MSB |

Read remainders bottom→top: **101101₂** = 45₁₀

Verification: 32 + 8 + 4 + 1 = 45 ✓

An alternative for memorising: subtract the largest power of 2 that fits, set that bit to 1, repeat with the remainder. Both methods give the same result.`,
    },

    // ── Visual 3 — Decimal → binary converter ─────────────────────────────────
    {
      type: 'js',
      instruction: `### Decimal to binary: step-by-step

Enter a decimal number (0–255) and click Convert to see each divide-by-2 step laid out. The remainders build the binary number from LSB to MSB.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <input id="decInput" type="number" min="0" max="255" value="45"
      style="width:80px;padding:6px 10px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.2);background:#0d1527;color:#e2e8f0;font-family:monospace;font-size:14px">
    <button id="convBtn">Convert</button>
    <span id="convResult" style="font-size:14px;font-weight:600"></span>
  </div>
  <canvas id="cv" width="560" height="280"></canvas>
  <div id="convDesc" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;padding:8px 12px;border-left:2px solid rgba(255,255,255,0.1)"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%}
input{outline:none}input:focus{border-color:#38bdf8 !important}
button{padding:6px 18px;border-radius:8px;border:1.5px solid #38bdf8;background:rgba(56,189,248,0.08);color:#38bdf8;font-family:monospace;font-size:12px;cursor:pointer}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var steps=[];

function convert(){
  var n=parseInt(document.getElementById('decInput').value)||0;
  n=Math.max(0,Math.min(255,n));
  steps=[];
  var q=n;
  if(n===0){steps=[{q:0,r:0,orig:0}];}
  else{
    while(q>0){
      steps.push({q:Math.floor(q/2),r:q%2,orig:q});
      q=Math.floor(q/2);
    }
  }
  var binStr=n.toString(2);
  document.getElementById('convResult').textContent='= '+binStr+'\\u2082 ('+binStr.length+' bits)';
  document.getElementById('convResult').style.color='#4ade80';
  buildDesc(n,binStr);
  draw(n);
}

function buildDesc(n,bin){
  var parts=bin.split('').map(function(b,i){return b==='1'?Math.pow(2,bin.length-1-i):null;}).filter(Boolean);
  document.getElementById('convDesc').textContent=
    n+' in binary is '+bin+'. Verification: '+parts.join(' + ')+(parts.length?' = '+parts.reduce(function(a,b){return a+b;},0)+' \\u2713':'none (zero)');
}

function draw(n){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  if(steps.length===0){return;}

  var rowH=Math.min(32,Math.floor((H-20)/steps.length));
  var colDiv=120,colQ=220,colR=320,colArrow=380;
  var startY=Math.floor((H-steps.length*rowH)/2);

  // Headers
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='bold 10px monospace';ctx.textAlign='left';
  ctx.fillText('Dividend',colDiv,startY-8);ctx.fillText('Quotient',colQ,startY-8);
  ctx.fillText('Remainder',colR,startY-8);ctx.fillText('Bit',colArrow,startY-8);

  steps.forEach(function(s,i){
    var y=startY+i*rowH+rowH/2;
    var isLSB=i===0,isMSB=i===steps.length-1;

    // Division expression
    ctx.fillStyle=isMSB?'#fbbf24':isLSB?'#4ade80':'rgba(255,255,255,0.6)';
    ctx.font='12px monospace';ctx.textAlign='left';
    ctx.fillText(s.orig+' \\u00f7 2',colDiv,y+4);

    // Arrow
    ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(colDiv+70,y);ctx.lineTo(colQ-6,y);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.2)';
    ctx.beginPath();ctx.moveTo(colQ-6,y-4);ctx.lineTo(colQ,y);ctx.lineTo(colQ-6,y+4);ctx.fill();

    // Quotient
    ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='12px monospace';ctx.textAlign='left';
    ctx.fillText(s.q,colQ,y+4);

    // Remainder
    ctx.fillStyle=s.r?'#38bdf8':'rgba(255,255,255,0.3)';
    ctx.font='bold 12px monospace';
    ctx.fillText('r = '+s.r,colR,y+4);

    // Bit cell
    var bitX=colArrow+30;
    ctx.beginPath();ctx.arc(bitX,y,10,0,Math.PI*2);
    ctx.fillStyle=s.r?'rgba(56,189,248,0.2)':'rgba(255,255,255,0.04)';ctx.fill();
    ctx.strokeStyle=s.r?'#38bdf8':'rgba(255,255,255,0.15)';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle=s.r?'#38bdf8':'rgba(255,255,255,0.3)';
    ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s.r,bitX,y);
    ctx.textBaseline='alphabetic';

    // LSB/MSB label
    if(isLSB||isMSB){
      ctx.fillStyle=isMSB?'#fbbf24':'#4ade80';ctx.font='9px monospace';ctx.textAlign='left';
      ctx.fillText(isMSB?'\\u2190 MSB':'\\u2190 LSB',bitX+14,y+4);
    }
  });

  // Read direction arrow (bottom to top)
  var ax=W-22;
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
  [startY+steps.length*rowH,startY].forEach(function(yy,end){
    if(end===0){
      ctx.beginPath();ctx.moveTo(ax,yy);ctx.lineTo(ax,startY+12);ctx.stroke();
    } else {
      ctx.beginPath();ctx.moveTo(ax-4,yy+8);ctx.lineTo(ax,yy);ctx.lineTo(ax+4,yy+8);ctx.fill();
    }
  });
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(ax,startY+steps.length*rowH);ctx.lineTo(ax,startY+12);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.2)';
  ctx.beginPath();ctx.moveTo(ax-4,startY+12);ctx.lineTo(ax,startY+2);ctx.lineTo(ax+4,startY+12);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText('read',ax,(startY+startY+steps.length*rowH)/2);
  ctx.fillText('\\u2191 MSB',ax,startY-4);
  ctx.fillText('\\u2193 LSB',ax,startY+steps.length*rowH+12);
}

document.getElementById('convBtn').onclick=convert;
document.getElementById('decInput').onkeydown=function(e){if(e.key==='Enter')convert();};
convert();`,
      outputHeight: 360,
    },

    // ── Challenge 1 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `What is the decimal value of the 8-bit binary number 0110 1010?`,
      options: [
        { label: 'A', text: '96 — adding the four set bits: 64 + 32 = 96' },
        { label: 'B', text: '106 — 64 + 32 + 8 + 2 = 106' },
        { label: 'C', text: '136 — 128 + 8 = 136' },
        { label: 'D', text: '102 — counting the positions from 1' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! 0110 1010: bits set are at positions 6, 5, 3, and 1 (from right, 0-indexed). Weights: 2⁶=64, 2⁵=32, 2³=8, 2¹=2. Sum: 64 + 32 + 8 + 2 = 106.',
      failMessage: 'Read off the positions of the 1 bits from right (position 0) to left (position 7). 0110 1010: from right the set bits are at positions 1, 3, 5, 6. Weights: 2¹=2, 2³=8, 2⁵=32, 2⁶=64. Total: 2 + 8 + 32 + 64 = 106.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Challenge 2 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `How many distinct values can a 10-bit unsigned integer represent, and what is its maximum value?`,
      options: [
        { label: 'A', text: '1,000 values, maximum 999 — because 10 bits suggests base-10 thinking' },
        { label: 'B', text: '512 values, maximum 511 — because 2⁹ = 512' },
        { label: 'C', text: '1,024 values, maximum 1,023 — because 2¹⁰ = 1,024' },
        { label: 'D', text: '2,048 values, maximum 2,047 — because 10 bits doubled twice' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct! An N-bit unsigned integer represents 2^N distinct values (0 through 2^N − 1). For N = 10: 2¹⁰ = 1,024 values, range 0–1,023. This is the reason "kilo" in digital storage means 1,024 (2¹⁰) rather than exactly 1,000.',
      failMessage: 'An N-bit number has 2^N possible combinations: each bit is independently 0 or 1. For N = 10: 2¹⁰ = 1,024 distinct values, spanning 0 to 1,023 (= 2¹⁰ − 1). Adding one more bit would double the count to 2¹¹ = 2,048.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: Binary Numbers

- **Positional notation** in base 2: each bit position has weight $2^n$ doubling to the left.
- **LSB** = rightmost bit (weight $2^0$). **MSB** = leftmost bit (highest weight).
- **Range**: an N-bit unsigned integer represents values $0$ to $2^N - 1$ ($2^N$ distinct values).
- **Bit → Nibble (4) → Byte (8) → Word (16/32/64)**: each doubling of bit count squares the range.
- **Binary → Decimal**: sum the weights at set-bit positions.
- **Decimal → Binary**: repeatedly divide by 2; collect remainders from bottom (LSB) to top (MSB).

These foundations underpin two's complement negation and binary arithmetic — the next two lessons in this chapter.`,
    },
  ],
};

export default {
  id: 'df-2-1-binary-numbers',
  slug: 'binary-numbers',
  chapter: 'df.2',
  order: 1,
  title: 'Binary Numbers',
  subtitle: 'Base-2 counting, bit widths, and converting between binary and decimal.',
  tags: ['digital', 'binary', 'number-system', 'base-2', 'positional-notation', 'LSB', 'MSB', 'conversion', 'bit', 'byte'],
  hook: {
    question: 'If a computer uses only 0s and 1s, how does it store the number 200 — let alone a billion?',
    realWorldContext: 'Every integer, pixel colour, memory address, and network packet number is stored as a binary pattern in hardware. Understanding the encoding is the first step to understanding arithmetic, overflow, and everything built on top.',
  },
  intuition: {
    prose: [
      'Binary is base-2: each bit doubles the weight of the bit to its right.',
      'N bits → 2^N values (0 to 2^N − 1).',
      'Decimal → binary: divide by 2, collect remainders bottom-up.',
      'Binary → decimal: sum the weights of all 1-bit positions.',
    ],
    callouts: [
      { type: 'tip', title: 'Memory trick', body: 'Memorise powers of 2 up to 2¹⁰ = 1024. From there each doubling is straightforward. Know: 2⁸ = 256 (1-byte range), 2¹⁶ = 65536, 2³² ≈ 4 billion.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Binary Numbers', props: { lesson: LESSON_DF_2_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Each column\'s weight is 2× the column to its right.',
    'To read binary: spot the 1s and add their column weights.',
    'To write binary: find the largest power of 2 that fits, mark that bit 1, subtract, repeat.',
    '8-bit byte: 256 values. 16-bit short: 65,536. 32-bit int: ~4 billion. Each extra bit doubles the range.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
