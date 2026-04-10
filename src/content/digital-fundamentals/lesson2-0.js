// Digital Fundamentals · Chapter 2 · Lesson 0
// Binary Arithmetic
// ScienceNotebook format — visuals + challenges

export const LESSON_DF_2_0 = {
  title: 'Binary Arithmetic',
  subtitle: 'Addition, two\'s complement, and why subtraction is just addition in disguise.',
  sequential: true,

  cells: [

    // ── Section 1 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Adding in Binary

Binary addition follows exactly four rules — one for each possible pair of single bits:

| A | B | Sum | Carry |
|---|---|-----|-------|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

The last rule is the key one: **1 + 1 = 10 in binary** (decimal 2), giving a sum bit of 0 and a carry bit of 1. The carry propagates to the next column, exactly as it does in long addition with decimal numbers.

A **full adder** handles three inputs: bit A, bit B, and a carry-in from the previous column. It produces a Sum bit and a Carry-out:

$\\text{Sum} = A \\oplus B \\oplus C_{in}$
$\\text{Carry}_{out} = (A \\cdot B) + (C_{in} \\cdot (A \\oplus B))$

Chaining eight full adders gives an **8-bit ripple-carry adder**. The carry propagates (ripples) from bit 0 through to bit 7. If the final carry-out is 1 and there is nowhere for it to go, the result has overflowed the 8-bit range (0–255 for unsigned integers).`,
    },

    // ── Visual 1 — 8-bit adder ────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### 8-bit ripple-carry adder

Click any bit of A or B to toggle it between 0 and 1. The carry chain propagates from the rightmost bit (bit 0) to the left. Each carry dot lights up when a bit-position carry is generated. If the result overflows 255, the carry-out indicator turns red.`,
      html: `<div style="padding:14px">
  <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:6px">Click any bit to toggle it</div>
  <canvas id="cv" width="560" height="240" style="cursor:pointer"></canvas>
  <div style="margin-top:10px;display:flex;gap:20px;flex-wrap:wrap;align-items:center">
    <div id="decResult" style="font-size:14px;font-weight:600"></div>
    <div id="overflow" style="font-size:12px;padding:4px 10px;border-radius:6px;display:none"></div>
  </div>
  <div id="addDesc" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}canvas{border-radius:8px;display:block;width:100%}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var A=[0,1,0,0,0,0,1,1]; // bit7..bit0 left to right in UI, index 0=MSB
var B=[0,0,1,1,0,1,0,1];

var BITS=8;
var cellW=56,cellH=36;
var startX=Math.floor((W-BITS*cellW)/2);

function bitValue(arr){return arr.reduce(function(s,b,i){return s+(b<<(7-i));},0);}

function computeAdd(){
  var carries=new Array(9).fill(0);
  var sums=new Array(8);
  for(var i=7;i>=0;i--){
    var ai=A[i],bi=B[i],ci=carries[i+1];
    var s=ai^bi^ci;
    var co=(ai&bi)|(ci&(ai^bi));
    sums[i]=s;
    carries[i]=co;
  }
  return {sums:sums,carries:carries,overflow:carries[0]===1};
}

function refresh(){
  var r=computeAdd();
  var aVal=bitValue(A),bVal=bitValue(B),sVal=bitValue(r.sums);
  var total=aVal+bVal;
  document.getElementById('decResult').textContent='A ('+aVal+') + B ('+bVal+') = '+total+(r.overflow?' [OVERFLOW]':'');
  document.getElementById('decResult').style.color=r.overflow?'#ef4444':'#4ade80';
  var ov=document.getElementById('overflow');
  if(r.overflow){
    ov.style.display='block';
    ov.textContent='Carry-out = 1 \u2192 OVERFLOW: result '+total+' exceeds 8-bit range (0\u2013255). Stored result = '+sVal;
    ov.style.background='rgba(239,68,68,0.15)';ov.style.color='#ef4444';ov.style.border='1px solid rgba(239,68,68,0.3)';
  } else {
    ov.style.display='none';
  }
  document.getElementById('addDesc').textContent=
    'Binary: '+A.join('')+' + '+B.join('')+' = '+r.sums.join('')+(r.overflow?' (carry-out: 1)':'');
  draw(r);
}

function draw(r){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var rowY=[20,70,120,175]; // carries, A, B, Sum rows
  var labels=['C','A','B','\u03a3'];
  var labelColors=['#fbbf24','#38bdf8','#a78bfa','#4ade80'];

  // Carry-in at bit0 (right) position shows C[8]=0 always
  // carries[0..8]: carries[i] is carry OUT from bit i going to bit i-1
  // carries[8] = 0 (initial carry-in at LSB)
  // Let's show: for each column i, carry_in = carries[i+1], carry_out = carries[i]

  // Row labels
  labels.forEach(function(l,ri){
    ctx.fillStyle=labelColors[ri];ctx.font='bold 11px monospace';
    ctx.textAlign='right';
    ctx.fillText(l,startX-8,rowY[ri]+22);
  });

  // Draw bits in each row
  function drawBitCell(col,ri,val,isCarry){
    var x=startX+col*cellW;
    var y=rowY[ri];
    var w=isCarry?20:cellW-6;
    var h=isCarry?20:cellH-4;
    var cx2=x+(isCarry?(cellW/2):(cellW-6)/2);
    var cy2=y+(isCarry?10:(cellH-4)/2);
    if(!isCarry){cx2=x+(cellW-6)/2;cy2=y+(cellH-4)/2;}
    var on=val===1;
    var col2=on?labelColors[ri]:'rgba(255,255,255,0.07)';
    if(isCarry){
      ctx.beginPath();ctx.arc(x+cellW/2,y+10,8,0,Math.PI*2);
      ctx.fillStyle=on?'rgba(251,191,36,0.25)':'rgba(255,255,255,0.04)';ctx.fill();
      ctx.strokeStyle=on?'#fbbf24':'rgba(255,255,255,0.1)';ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle=on?'#fbbf24':'rgba(255,255,255,0.2)';ctx.font='bold 9px monospace';
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(val,x+cellW/2,y+10);
      ctx.textBaseline='alphabetic';
    } else {
      ctx.fillStyle=on?labelColors[ri]+'22':'rgba(255,255,255,0.04)';
      ctx.fillRect(x,y,cellW-6,cellH-4);
      ctx.strokeStyle=on?labelColors[ri]:'rgba(255,255,255,0.1)';ctx.lineWidth=1;
      ctx.strokeRect(x,y,cellW-6,cellH-4);
      ctx.fillStyle=on?labelColors[ri]:'rgba(255,255,255,0.3)';ctx.font='bold 14px monospace';
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(val,x+(cellW-6)/2,y+(cellH-4)/2);
      ctx.textBaseline='alphabetic';
    }
  }

  // Carry row (carries[0..8]; carries[8]=0 is first C_in at LSB=col7)
  for(var i=0;i<8;i++){
    drawBitCell(i,0,r.carries[i],true);
  }
  // Carry-out label
  if(r.overflow){
    ctx.fillStyle='#ef4444';ctx.font='bold 10px monospace';ctx.textAlign='left';
    ctx.fillText('C_out=1!',startX+BITS*cellW+4,rowY[0]+14);
  }

  // A, B, Sum rows
  for(var i=0;i<8;i++){
    drawBitCell(i,1,A[i],false);
    drawBitCell(i,2,B[i],false);
    drawBitCell(i,3,r.sums[i],false);
  }

  // Divider line above Sum
  ctx.strokeStyle='rgba(74,222,128,0.25)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(startX-4,rowY[3]-3);ctx.lineTo(startX+BITS*cellW,rowY[3]-3);ctx.stroke();

  // Plus sign
  ctx.fillStyle='#a78bfa';ctx.font='bold 16px monospace';ctx.textAlign='right';
  ctx.fillText('+',startX-12,rowY[2]+22);

  // Bit indices at top
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';ctx.textAlign='center';
  for(var i=0;i<8;i++){
    ctx.fillText(7-i,startX+i*cellW+(cellW-6)/2,H-6);
  }
}

canvas.onclick=function(e){
  var rect=canvas.getBoundingClientRect();
  var mx=(e.clientX-rect.left)*(W/rect.width);
  var my=(e.clientY-rect.top)*(H/rect.height);
  for(var i=0;i<8;i++){
    var bx=startX+i*cellW;
    // Row A: y=70
    if(mx>=bx&&mx<=bx+cellW-6&&my>=70&&my<=70+cellH-4){A[i]=A[i]?0:1;refresh();return;}
    // Row B: y=120
    if(mx>=bx&&mx<=bx+cellW-6&&my>=120&&my<=120+cellH-4){B[i]=B[i]?0:1;refresh();return;}
  }
};

refresh();`,
      outputHeight: 340,
    },

    // ── Challenge 1 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In binary, what is 1 + 1?`,
      options: [
        { label: 'A', text: '11 — because you write both 1s side by side' },
        { label: 'B', text: '10 — sum bit is 0, carry bit is 1 (decimal value: 2)' },
        { label: 'C', text: '2 — binary uses the same digits as decimal' },
        { label: 'D', text: '01 — because one plus one equals one in binary logic' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! 1 + 1 in binary = 10. The sum of the ones column is 0; the carry column gets 1. This gives binary 10, which is decimal 2. This is the XOR (sum) and AND (carry) gate combination — the heart of the half-adder.',
      failMessage: '1 and 1 in binary add to 10 — note that binary has only two symbols, 0 and 1. When the single-bit sum would be 2, that exceeds the maximum single bit value (1), so we write 0 here and carry 1 to the next column, giving 10 in binary (= decimal 2).',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 2 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Two's Complement: Representing Negative Numbers

Unsigned binary has no negatives. To store negative integers we need a **signed representation**. Modern computers use **two's complement** because it lets the same addition hardware handle both positive and negative numbers.

**The rule**: To negate a number N in two's complement:
1. Invert all bits (one's complement: flip every 0→1 and 1→0)
2. Add 1 to the result

**Example** — negate 5 in 8-bit two's complement:
- 5 = \`0000 0101\`
- Invert: \`1111 1010\`
- Add 1: \`1111 1011\` → this represents −5

**Verification**: 5 + (−5) should give 0.
\`0000 0101\` + \`1111 1011\` = \`1 0000 0000\`
The carry-out is 1, but in 8-bit arithmetic it is discarded → **result = 0000 0000** ✓

**Key properties of two's complement**:
- Range for N-bit: from $-2^{N-1}$ to $2^{N-1}-1$   (e.g. 8-bit: −128 to +127)
- If the MSB (most significant bit) is 1, the number is negative
- Only one representation of zero (unlike one's complement)
- Addition hardware works identically for signed and unsigned — the CPU doesn't need separate circuits`,
    },

    // ── Visual 2 — Two's complement step-by-step ──────────────────────────────
    {
      type: 'js',
      instruction: `### Two's complement: step by step

Use the slider to choose a positive integer (1–127). Watch the four steps: original binary → invert all bits → add 1 → verification that the sum equals zero (mod 256). The range table shows the complete representation map for 8-bit two's complement.`,
      html: `<div style="padding:14px">
  <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:12px">
    <span style="font-size:12px;color:rgba(255,255,255,0.5)">Negate:</span>
    <strong id="posNum" style="font-size:16px;color:#38bdf8;min-width:36px">5</strong>
    <input type="range" id="numSlider" min="1" max="127" value="5" style="flex:1;min-width:140px;accent-color:#38bdf8">
  </div>
  <canvas id="cv" width="560" height="260"></canvas>
  <div id="tc_verify" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.55);line-height:1.7;padding:8px 12px;border-left:2px solid rgba(74,222,128,0.3)"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}canvas{border-radius:8px;display:block;width:100%}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var num=5;

document.getElementById('numSlider').oninput=function(){
  num=parseInt(this.value);
  document.getElementById('posNum').textContent=num;
  draw();verify();
};

function toBin8(n){
  return ((n+256)&255).toString(2).padStart(8,'0');
}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var orig=toBin8(num);
  var inv=orig.split('').map(function(b){return b==='0'?'1':'0';}).join('');
  var neg=(~num+1)&0xFF;
  var negBin=toBin8(neg);

  var steps=[
    {label:'Original (+'+num+')',bits:orig,color:'#38bdf8',note:'Positive '+num+' in 8-bit binary'},
    {label:'Invert all bits',bits:inv,color:'#fbbf24',note:'Flip every 0\u21921 and 1\u21920'},
    {label:'Add 1',bits:negBin,color:'#a78bfa',note:'Adding 1 to the inverted value gives \u2212'+num+' in two\'s complement'},
    {label:'Result = \u2212'+num,bits:negBin,color:'#4ade80',note:'MSB = 1 confirms this is negative. Decimal value: \u2212'+num},
  ];

  var rowH=Math.floor((H-20)/4);
  var colW=Math.floor((W-120)/8);
  var startX=80;

  steps.forEach(function(s,ri){
    var y=10+ri*rowH;
    ctx.fillStyle=s.color+'33';ctx.fillRect(2,y+2,W-4,rowH-4);
    ctx.fillStyle=s.color;ctx.font='bold 10px monospace';ctx.textAlign='left';
    ctx.fillText(s.label,6,y+16);

    s.bits.split('').forEach(function(bit,ci){
      var bx=startX+ci*colW;
      var isOne=bit==='1';
      ctx.fillStyle=isOne?s.color+'55':'rgba(255,255,255,0.04)';
      ctx.fillRect(bx,y+4,colW-4,rowH-8);
      ctx.strokeStyle=isOne?s.color:'rgba(255,255,255,0.12)';ctx.lineWidth=1;
      ctx.strokeRect(bx,y+4,colW-4,rowH-8);
      ctx.fillStyle=isOne?s.color:'rgba(255,255,255,0.35)';
      ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(bit,bx+(colW-4)/2,y+4+(rowH-8)/2);
      ctx.textBaseline='alphabetic';
    });

    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='9px monospace';ctx.textAlign='left';
    ctx.fillText(s.note,6,y+rowH-6);

    // Step connector
    if(ri<3){
      ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='12px monospace';ctx.textAlign='center';
      var nextLabel=ri===0?'\u2193 flip all bits':ri===1?'\u2193 + 1':'\u2193 = result';
      ctx.fillText(nextLabel,W/2,y+rowH+1);
    }
  });

  // Bit indices
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';ctx.textAlign='center';
  for(var i=0;i<8;i++){
    ctx.fillText(7-i+'',startX+i*colW+(colW-4)/2,H-4);
  }
}

function verify(){
  var neg=(~num+1)&0xFF;
  var sum=(num+neg)&0xFF;
  var carry=(num+neg)>255?1:0;
  document.getElementById('tc_verify').innerHTML=
    'Verification: '+num+' + (\u2212'+num+') = ?<br>'+
    toBin8(num)+' + '+toBin8(neg)+' = '+(carry?'1 ':'')+toBin8(sum)+
    (carry?' (carry-out discarded)':'')+
    ' = 0 \u2713<br>The carry-out in 8-bit addition is discarded, leaving 0000\u20090000. Two\'s complement addition works identically with the same unsigned adder circuit.';
}

draw();verify();`,
      outputHeight: 340,
    },

    // ── Challenge 2 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In 8-bit two's complement, what is the two's complement (negation) of \`0000 0001\` (which represents +1)?`,
      options: [
        { label: 'A', text: '0000 0000 — because −1 + 1 = 0 and zero has no bits set' },
        { label: 'B', text: '1111 1111 — invert gives 1111 1110, then add 1 gives 1111 1111, representing −1' },
        { label: 'C', text: '1000 0001 — just set the MSB to 1 to make a number negative' },
        { label: 'D', text: '0111 1111 — invert just the lowest bit' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! 0000 0001 → invert → 1111 1110 → add 1 → 1111 1111 = −1 in 8-bit two\'s complement. Verification: 0000 0001 + 1111 1111 = 1 0000 0000; discard carry-out → 0000 0000 = 0. ✓',
      failMessage: 'Apply the two-step rule: (1) invert all bits of 0000 0001 → 1111 1110; (2) add 1 → 1111 1111. This represents −1 in 8-bit two\'s complement. Setting only the MSB (option C) is sign-magnitude representation — a different (less common) encoding.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Subtraction is Addition in Disguise

Once you have two's complement, **subtraction requires no new hardware**:

$A - B = A + (-B) = A + (\\overline{B} + 1)$

where $\\overline{B}$ is the bitwise NOT (one's complement) of B.

A standard ALU does this with a single control signal:
- When **SUB = 0**: compute A + B (pass B through)
- When **SUB = 1**: compute A + (¬B) + 1 = A − B

The +1 is provided by setting the carry-in of the LSB to 1 when SUB = 1. No extra adder, no extra circuit — the same 8 full adders perform both addition and subtraction.

**Overflow detection for signed arithmetic**:

Overflow occurs when the result cannot be represented in the available bits with the correct sign. For 8-bit two's complement:
- Adding two positives (both MSB = 0) that give a result with MSB = 1 → overflow
- Adding two negatives (both MSB = 1) that give a result with MSB = 0 → overflow
- Adding numbers of different signs can never overflow

Formal rule: **overflow = carry into MSB XOR carry out of MSB**

If the two carry bits differ, the sign bit was corrupted — overflow occurred.`,
    },

    // ── Visual 3 — Subtraction as addition ────────────────────────────────────
    {
      type: 'js',
      instruction: `### A − B using the same adder

Toggle bits for A and B (A is always treated as positive; B will be negated). Watch the ALU subtract B by computing A + (¬B + 1). The step-by-step column shows exactly how the complement is formed before the addition hardware runs.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;margin-bottom:12px">
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">A (click to toggle)</div>
      <div id="aRow" style="display:flex;gap:4px"></div>
    </div>
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">B (click to toggle)</div>
      <div id="bRow" style="display:flex;gap:4px"></div>
    </div>
  </div>
  <canvas id="cv" width="560" height="220"></canvas>
  <div id="subResult" style="margin-top:10px;font-size:13px;font-weight:600"></div>
  <div id="subDesc" style="margin-top:6px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%}
.bit{width:28px;height:28px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:13px;font-weight:600;cursor:pointer;user-select:none;transition:background 0.1s}
.bit.on{background:rgba(56,189,248,0.2);border-color:#38bdf8;color:#38bdf8}
.bit.off{background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4)}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var A=[0,0,1,0,1,0,0,0]; // 40
var B=[0,0,0,1,0,0,1,1]; // 19

function val(arr){return arr.reduce(function(s,b,i){return s+(b<<(7-i));},0);}
function toBin8(n){return ((n+256)&255).toString(2).padStart(8,'0');}
function invertArr(arr){return arr.map(function(b){return b^1;});}

function buildBitRow(id,arr,clickCb){
  var row=document.getElementById(id);row.innerHTML='';
  arr.forEach(function(b,i){
    var d=document.createElement('div');
    d.className='bit '+(b?'on':'off');
    d.textContent=b;
    d.onclick=function(){arr[i]^=1;refresh();};
    row.appendChild(d);
  });
}

function refresh(){
  buildBitRow('aRow',A);
  buildBitRow('bRow',B);

  var aVal=val(A),bVal=val(B);
  var negB=(~bVal+1)&0xFF;

  // Perform A + negB (= A - B for unsigned)
  var carries=new Array(9).fill(0);carries[8]=1; // C_in=1 (equivalent to +1)
  var negBArr=invertArr(B); // inverted B, +1 comes from C_in
  var sums=new Array(8);
  for(var i=7;i>=0;i--){
    var ai=A[i],bi=negBArr[i],ci=carries[i+1];
    sums[i]=ai^bi^ci;
    carries[i]=(ai&bi)|(ci&(ai^bi));
  }
  var result=sums.reduce(function(s,b,i){return s+(b<<(7-i));},0);

  // Signed interpretation: if MSB=1, it's negative
  var signedResult=result>=128?result-256:result;
  var true_diff=aVal-bVal;

  // Overflow: carry_in_msb != carry_out_msb  => overflow
  var cin_msb=carries[1],cout_msb=carries[0];
  var ovf=(cin_msb^cout_msb)===1;

  document.getElementById('subResult').textContent=
    'A='+aVal+' \u2212 B='+bVal+' = '+true_diff+(ovf?' [OVERFLOW \u26a0]':'');
  document.getElementById('subResult').style.color=ovf?'#ef4444':'#4ade80';

  document.getElementById('subDesc').innerHTML=
    'Step 1 \u2014 Invert B: '+toBin8(bVal)+' \u2192 '+invertArr(B).join('')+'<br>'+
    'Step 2 \u2014 Set C_in = 1 (the +1 from two\'s complement negation)<br>'+
    'Step 3 \u2014 Add: '+toBin8(aVal)+' + '+invertArr(B).join('')+' + C_in(1)<br>'+
    'Result: '+sums.join('')+' = '+result+' (signed: '+signedResult+')<br>'+
    (ovf?'<span style="color:#ef4444">OVERFLOW: carry-into-MSB='+cin_msb+', carry-out-of-MSB='+cout_msb+' \u2014 they differ, so sign bit is wrong.</span>':'No overflow (carry-in and carry-out of MSB match: '+cin_msb+')');

  draw(negBArr,sums,carries,ovf);
}

function draw(negBArr,sums,carries,ovf){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var colW=54,startX=Math.floor((W-8*colW)/2);
  var rows=[
    {arr:A,label:'A',color:'#38bdf8'},
    {arr:negBArr,label:'\u00acB',color:'#fbbf24'},
    {arr:sums,label:'\u03a3',color:'#4ade80'},
  ];
  var rowH=56;

  rows.forEach(function(r,ri){
    ctx.fillStyle=r.color;ctx.font='bold 10px monospace';ctx.textAlign='right';
    ctx.fillText(r.label,startX-6,(ri+1)*rowH-12);
    r.arr.forEach(function(b,ci){
      var x=startX+ci*colW;
      var y=ri*rowH+12;
      var isOne=b===1;
      ctx.fillStyle=isOne?r.color+'33':'rgba(255,255,255,0.04)';
      ctx.fillRect(x,y,colW-4,30);
      ctx.strokeStyle=isOne?r.color:'rgba(255,255,255,0.1)';ctx.lineWidth=1;
      ctx.strokeRect(x,y,colW-4,30);
      ctx.fillStyle=isOne?r.color:'rgba(255,255,255,0.25)';
      ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(b,x+(colW-4)/2,y+15);ctx.textBaseline='alphabetic';
    });
    if(ri===0){
      ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(startX-4,ri*rowH+12+34);ctx.lineTo(startX+8*colW,ri*rowH+12+34);ctx.stroke();
    }
  });

  // Carry dots
  for(var i=0;i<8;i++){
    var cx2=startX+i*colW+(colW-4)/2;
    var cy2=rowH*3+6;
    var on=carries[i]===1;
    ctx.beginPath();ctx.arc(cx2,cy2,6,0,Math.PI*2);
    ctx.fillStyle=on?'rgba(251,191,36,0.25)':'rgba(255,255,255,0.04)';ctx.fill();
    ctx.strokeStyle=on?'#fbbf24':'rgba(255,255,255,0.1)';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle=on?'#fbbf24':'rgba(255,255,255,0.2)';ctx.font='bold 8px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(carries[i],cx2,cy2);
    ctx.textBaseline='alphabetic';
  }

  // Divider above Sum
  ctx.strokeStyle='rgba(74,222,128,0.3)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(startX-4,rowH*2+10);ctx.lineTo(startX+8*colW,rowH*2+10);ctx.stroke();

  // C_in = 1 note
  ctx.fillStyle='#fbbf24';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('C_in=1 (\u22121 trick)',startX+8*colW+4,rowH-12);

  // Overflow indicator
  if(ovf){
    ctx.fillStyle='#ef4444';ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText('\u26a0 OVERFLOW',W/2,H-4);
  }

  // Bit indices
  ctx.fillStyle='rgba(255,255,255,0.18)';ctx.font='9px monospace';ctx.textAlign='center';
  for(var i=0;i<8;i++) ctx.fillText(7-i,startX+i*colW+(colW-4)/2,H-16);
}

refresh();`,
      outputHeight: 360,
    },

    // ── Challenge 3 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In 8-bit signed two's complement arithmetic, adding +100 (0110 0100) and +100 (0110 0100) gives 1100 1000. What does this indicate?`,
      options: [
        { label: 'A', text: 'The result is correct: 1100 1000 = 200 in two\'s complement' },
        { label: 'B', text: 'Overflow: both operands are positive but the result\'s MSB is 1 (indicating negative), so the true result (200) does not fit in 8-bit signed range (−128 to +127)' },
        { label: 'C', text: 'Underflow: the result is too small for 8-bit representation' },
        { label: 'D', text: 'Carry-out: the 8th bit overflowed but the stored result is still correct' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! +100 + +100 = +200, but 8-bit signed two\'s complement only goes to +127. The result 1100 1000 has MSB = 1, which in signed representation means negative (specifically −56). The carry-in to the MSB and the carry-out of the MSB differ (overflow rule), confirming the sign bit was corrupted. Hardware detects this as a signed overflow.',
      failMessage: '1100 1000 has MSB = 1. In 8-bit two\'s complement, MSB = 1 means the value is negative. Since both inputs were positive (+100, +100), arriving at a negative result means the 8-bit signed range was exceeded. True sum is 200, but the valid signed 8-bit range is −128 to +127. Overflow detection: carry-into-MSB XOR carry-out-of-MSB = 0 XOR 1 = 1 → overflow.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: Binary Arithmetic

You can now reason clearly about how hardware performs arithmetic:

**Addition** — four single-bit rules, carry propagates left. An N-bit ripple-carry adder chains N full adders.

**Two's complement negation** — invert all bits, add 1. This is the universal standard for representing signed integers in hardware. Properties:
- Range: $-2^{N-1}$ to $2^{N-1} - 1$
- MSB = 1 → negative
- One representation of zero
- The same adder circuit handles both signed and unsigned numbers

**Subtraction** — A − B = A + (¬B) + 1. The ALU uses the inversion and sets C_in = 1. No additional circuitry required.

**Overflow** — carry-into-MSB ≠ carry-out-of-MSB for signed arithmetic. Set the Overflow (V) flag in the CPU status register.

These ideas feed directly into the ALU design covered in the next chapter: a real ALU combines an adder, overflow detection, a zero flag, and control signals for pass-through, negate, and logical operations.`,
    },
  ],
};

export default {
  id: 'df-2-0-binary-arithmetic',
  slug: 'binary-arithmetic',
  chapter: 'df.2',
  order: 2,
  title: 'Binary Arithmetic',
  subtitle: 'Addition, two\'s complement, and why subtraction is just addition in disguise.',
  tags: ['digital', 'binary', 'arithmetic', 'two\'s-complement', 'addition', 'subtraction', 'overflow', 'full-adder', 'ALU'],
  hook: {
    question: 'How does a CPU subtract when its hardware only knows how to add?',
    realWorldContext: 'Every integer operation in every running program — whether in C, Python, JavaScript, or assembly — ultimately becomes ripple-carry addition over two\'s complement bit patterns in hardware.',
  },
  intuition: {
    prose: [
      'Binary addition: 4 cases. 1+1 = 10 (0 with carry). Carry ripples left.',
      'Two\'s complement negation: invert all bits, then add 1.',
      'Subtraction A−B = A + (¬B) + 1. Same hardware, same clock cycle.',
      'Overflow: carry-in to MSB ≠ carry-out of MSB.',
    ],
    callouts: [
      { type: 'important', title: 'Why two\'s complement', body: 'One\'s complement has two zeros (+0 and −0) and requires end-around carry in addition. Two\'s complement avoids both: one zero, no special-case carry. That\'s why every modern processor uses it.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Binary Arithmetic', props: { lesson: LESSON_DF_2_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    '1+1=10 in binary. Always. Carry the 1.',
    'Negate: flip all bits, add 1. Then A−B = A + negative(B).',
    'Signed 8-bit range: −128 to +127. MSB is the sign bit.',
    'Overflow: when two positives produce a negative, or two negatives produce a positive.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
