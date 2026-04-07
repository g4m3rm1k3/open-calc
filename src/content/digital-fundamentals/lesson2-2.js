// Digital Fundamentals · Chapter 2 · Lesson 2 (order 3)
// Codes: BCD, Gray Code, and ASCII
// ScienceNotebook format — visuals + challenges

export const LESSON_DF_2_2 = {
  title: 'Codes: BCD, Gray Code, and ASCII',
  subtitle: "Why pure binary isn't always best — and three alternatives that solve real problems.",
  sequential: true,

  cells: [

    // ── Section 1 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Beyond Pure Binary: Why We Need Codes

Pure binary is the most efficient way to represent numbers in hardware — a single bit carries the maximum possible information. But efficiency isn't the only criterion. Three situations demand a different approach:

**1. Human-decimal interfaces** — When a person enters "47" on a keypad or reads "47" on a display, converting to and from binary introduces error risk and complexity. **BCD (Binary Coded Decimal)** stores each decimal digit independently as 4 bits, making decimal-to-display conversion trivial.

**2. Mechanical reliability** — When a physical sensor (like a rotary shaft encoder) transitions between positions, multiple signal lines can change state at slightly different times. If regular binary is used, a transition from 7 (0111) to 8 (1000) changes all four bits — during the transition, the encoder might briefly read any value from 0 to 15. **Gray code** guarantees only one bit changes at a time, making intermediate states impossible.

**3. Text storage** — Numbers aren't the only things computers store. **ASCII** (American Standard Code for Information Interchange) defines a 7-bit mapping from numbers to characters, so that the letter 'A', a digit '5', or a newline can be stored as bit patterns and processed by the same hardware.

Each of these codes is still binary at the physical level — they're just different conventions for interpreting bit patterns.`,
    },

    // ── Visual 1 — BCD Explorer ───────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### BCD: Binary Coded Decimal

Each decimal digit (0–9) is stored as a 4-bit binary pattern. The patterns 1010–1111 (10–15) are unused — they're called **invalid BCD**. Click the 4-bit cells to toggle individual bits, or click a digit from the row below. The 7-segment display shows the result when the pattern is valid.`,
      html: `<div style="padding:12px">
  <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:6px">Click bit cells or digit buttons to change the code</div>
  <div id="digitRow" style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap"></div>
  <div id="bitRow" style="display:flex;gap:6px;margin-bottom:10px"></div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <canvas id="cv" width="380" height="220"></canvas>
    <div style="flex:1;min-width:160px">
      <div id="status" style="font-size:13px;font-weight:600;margin-bottom:8px"></div>
      <div id="multiEx" style="font-size:12px;line-height:1.8;color:rgba(255,255,255,0.5)"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
.dbt{width:38px;height:38px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.5);font-family:monospace;font-size:16px;font-weight:700;cursor:pointer}
.dbt.sel{border-color:#d97706;background:rgba(217,119,6,0.2);color:#d97706}
.bcel{width:56px;height:54px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.04);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.bcel.on{border-color:#d97706;background:rgba(217,119,6,0.15)}
.bcel .w{font-size:9px;color:rgba(255,255,255,0.3)}.bcel.on .w{color:#d97706}
.bcel .bv{font-size:20px;font-weight:700;color:rgba(255,255,255,0.35)}.bcel.on .bv{color:#d97706}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var bits=[0,1,0,1];var activeDigit=5;

var SEG={0:[1,1,1,1,1,1,0],1:[0,1,1,0,0,0,0],2:[1,1,0,1,1,0,1],
  3:[1,1,1,1,0,0,1],4:[0,1,1,0,0,1,1],5:[1,0,1,1,0,1,1],
  6:[1,0,1,1,1,1,1],7:[1,1,1,0,0,0,0],8:[1,1,1,1,1,1,1],9:[1,1,1,1,0,1,1]};

function drawSeg(cx,cy,digit,size){
  var p=(digit!==null&&SEG.hasOwnProperty(digit))?SEG[digit]:[0,0,0,0,0,0,0];
  var t=Math.max(4,Math.round(size*0.09)),l=Math.round(size*0.4);
  var g=2,ox=cx-(l+t*2)/2,oy=cy-(l*2+t*3)/2;
  var ON='#fbbf24',OFF='#1a2438';
  function seg(x,y,w,h){ctx.fillRect(ox+x+g,oy+y+g,w-g*2,h-g*2);}
  ctx.fillStyle=p[0]?ON:OFF;seg(t,0,l,t);
  ctx.fillStyle=p[1]?ON:OFF;seg(t+l,t,t,l);
  ctx.fillStyle=p[2]?ON:OFF;seg(t+l,t*2+l,t,l);
  ctx.fillStyle=p[3]?ON:OFF;seg(t,t*2+l*2,l,t);
  ctx.fillStyle=p[4]?ON:OFF;seg(0,t*2+l,t,l);
  ctx.fillStyle=p[5]?ON:OFF;seg(0,t,t,l);
  ctx.fillStyle=p[6]?ON:OFF;seg(t,t+l,l,t);
}

function buildDigitRow(){
  var row=document.getElementById('digitRow');
  row.innerHTML='';
  for(var d=0;d<=9;d++){
    var b=document.createElement('button');
    b.className='dbt'+(activeDigit===d?' sel':'');
    b.textContent=d;
    (function(dv){b.onclick=function(){activeDigit=dv;bits=dv.toString(2).padStart(4,'0').split('').map(Number);refresh();};})(d);
    row.appendChild(b);
  }
  var lbl=document.createElement('span');
  lbl.style='font-size:10px;color:rgba(255,255,255,0.25);align-self:center;margin-left:6px';
  lbl.textContent='click to select';
  row.appendChild(lbl);
}

function buildBitRow(){
  var row=document.getElementById('bitRow');
  row.innerHTML='';
  var weights=['2\u00b3=8','2\u00b2=4','2\u00b9=2','2\u2070=1'];
  bits.forEach(function(b,i){
    var cell=document.createElement('div');
    cell.className='bcel'+(b?' on':'');
    cell.innerHTML='<div class=w>'+weights[i]+'</div><div class=bv>'+b+'</div>';
    (function(idx){cell.onclick=function(){bits[idx]^=1;activeDigit=null;refresh();};})(i);
    row.appendChild(cell);
  });
}

function refresh(){
  buildDigitRow();buildBitRow();
  var val=parseInt(bits.join(''),2);
  var valid=val<=9;
  document.getElementById('status').textContent=val+(valid?' \u2014 valid BCD digit':' \u2014 INVALID (not a decimal digit)');
  document.getElementById('status').style.color=valid?'#4ade80':'#ef4444';
  if(valid){
    var ex=[2,4,7];
    document.getElementById('multiEx').innerHTML=
      'Multi-digit BCD example \u2014 247:<br>'+
      ex.map(function(d){return '<span style="color:#d97706">'+d+'</span>=<span style="color:rgba(255,255,255,0.6)">'+d.toString(2).padStart(4,'0')+'</span>';}).join(' | ')+
      '<br><span style="color:rgba(255,255,255,0.4)">247 in BCD = 0010 0100 0111 (12 bits).<br>247 in pure binary = 11110111 (8 bits).</span>';
  } else {
    document.getElementById('multiEx').textContent='Patterns 1010\u20131111 have no decimal meaning and are never generated by a BCD circuit.';
  }
  draw(val,valid);
}

function draw(val,valid){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // 7-seg panel
  var panW=90,panH=H-20;
  ctx.fillStyle='#0d1424';ctx.fillRect(10,10,panW,panH);
  ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;ctx.strokeRect(10,10,panW,panH);
  drawSeg(10+panW/2,10+panH/2,valid?val:null,60);
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText('7-segment',10+panW/2,H-4);

  // 4x4 grid
  var gStartX=115,gStartY=10,gCW=64,gCH=50;
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='bold 9px monospace';ctx.textAlign='center';
  ctx.fillText('All 16 BCD patterns',gStartX+gCW*2,gStartY-4);

  for(var i=0;i<16;i++){
    var gx=gStartX+(i%4)*gCW,gy=gStartY+Math.floor(i/4)*gCH;
    var isValid=i<=9,isSel=(val===i);
    ctx.fillStyle=isSel?'#d9770644':(isValid?'rgba(74,222,128,0.08)':'rgba(239,68,68,0.07)');
    ctx.fillRect(gx+2,gy+2,gCW-4,gCH-4);
    ctx.strokeStyle=isSel?'#d97706':(isValid?'rgba(74,222,128,0.4)':'rgba(239,68,68,0.35)');
    ctx.lineWidth=isSel?2:1;ctx.strokeRect(gx+2,gy+2,gCW-4,gCH-4);
    ctx.fillStyle=isSel?'#fbbf24':(isValid?'#4ade80':'rgba(239,68,68,0.7)');
    ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(i.toString(2).padStart(4,'0'),gx+gCW/2,gy+gCH/2-7);
    ctx.font='11px monospace';
    ctx.fillText(isValid?i.toString():'\u00d7',gx+gCW/2,gy+gCH/2+9);
    ctx.textBaseline='alphabetic';
  }

  // Column legend
  var legY=H-18;
  ctx.fillStyle='rgba(74,222,128,0.5)';ctx.fillRect(gStartX+2,legY,14,10);
  ctx.fillStyle='rgba(74,222,128,0.8)';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('valid (0\u20139)',gStartX+18,legY+9);
  ctx.fillStyle='rgba(239,68,68,0.4)';ctx.fillRect(gStartX+110,legY,14,10);
  ctx.fillStyle='rgba(239,68,68,0.8)';ctx.fillText('invalid (10\u201315)',gStartX+126,legY+9);
}

refresh();`,
      outputHeight: 380,
    },

    // ── Section 2 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### BCD Addition and the Correction Factor

Adding two BCD digits uses ordinary binary addition, but requires a correction step when the result is invalid:

1. Add the two 4-bit BCD values as normal binary.
2. **If the sum is 0–9**: the result is a valid BCD digit. Done.
3. **If the sum is 10–15** (or generates a carry out): add **6** to the sum.

**Why +6?** BCD skips codes 1010–1111 (decimal 10–15) — there are exactly **6** of them. Adding 6 jumps over these invalid patterns and lands in the correct range for the next digit position, simultaneously generating the right carry.

**Example**: BCD 8 + BCD 7
- Binary: 1000 + 0111 = 1111 (15) → invalid (> 9)
- Add correction: 1111 + 0110 = 1 0101
- Carry-out = 1, lower nibble = 0101 = 5
- Result: carry digit **1**, units digit **5** → BCD result is **15** ✓

This is exactly how the x86 **DAA** (Decimal Adjust after Addition) instruction works.`,
    },

    // ── Visual 2 — BCD Addition ───────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### BCD addition: step by step

Adjust the sliders for digits A and B (each 0–9). Watch the column addition, the correction step when the raw sum exceeds 9, and the final BCD result on the 7-segment displays.`,
      html: `<div style="padding:12px">
  <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px">
    <div style="flex:1;min-width:120px">
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">A = <strong id="aVal" style="color:#38bdf8">5</strong></div>
      <input type="range" id="slA" min="0" max="9" value="5" style="width:100%;accent-color:#38bdf8">
    </div>
    <div style="flex:1;min-width:120px">
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">B = <strong id="bVal" style="color:#a78bfa">8</strong></div>
      <input type="range" id="slB" min="0" max="9" value="8" style="width:100%;accent-color:#a78bfa">
    </div>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <canvas id="cv" width="300" height="260"></canvas>
    <div style="flex:1;min-width:200px">
      <div id="segRow" style="display:flex;gap:8px;align-items:center;margin-bottom:10px"></div>
      <div id="stepList" style="font-size:12px;line-height:2;color:rgba(255,255,255,0.6)"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var A=5,B=8;

var SEG={0:[1,1,1,1,1,1,0],1:[0,1,1,0,0,0,0],2:[1,1,0,1,1,0,1],
  3:[1,1,1,1,0,0,1],4:[0,1,1,0,0,1,1],5:[1,0,1,1,0,1,1],
  6:[1,0,1,1,1,1,1],7:[1,1,1,0,0,0,0],8:[1,1,1,1,1,1,1],9:[1,1,1,1,0,1,1]};

function drawSeg(cx,cy,digit,size,col){
  var p=(digit!==null&&SEG.hasOwnProperty(digit))?SEG[digit]:[0,0,0,0,0,0,0];
  var t=Math.max(3,Math.round(size*0.09)),l=Math.round(size*0.4);
  var g=2,ox=cx-(l+t*2)/2,oy=cy-(l*2+t*3)/2;
  var ON=col||'#fbbf24',OFF='#1a2438';
  function seg(x,y,w,h){ctx.fillRect(ox+x+g,oy+y+g,w-g*2,h-g*2);}
  ctx.fillStyle=p[0]?ON:OFF;seg(t,0,l,t);ctx.fillStyle=p[1]?ON:OFF;seg(t+l,t,t,l);
  ctx.fillStyle=p[2]?ON:OFF;seg(t+l,t*2+l,t,l);ctx.fillStyle=p[3]?ON:OFF;seg(t,t*2+l*2,l,t);
  ctx.fillStyle=p[4]?ON:OFF;seg(0,t*2+l,t,l);ctx.fillStyle=p[5]?ON:OFF;seg(0,t,t,l);
  ctx.fillStyle=p[6]?ON:OFF;seg(t,t+l,l,t);
}

function pad4(n){return ((n>>>0).toString(2)).padStart(5,'0');}

function buildSegRow(carry,lower){
  var row=document.getElementById('segRow');row.innerHTML='';
  var cv=document.createElement('canvas');cv.width=200;cv.height=90;cv.style.marginRight='8px';
  row.appendChild(cv);
  var c=cv.getContext('2d');
  c.fillStyle='#0d1424';c.fillRect(0,0,200,90);
  if(carry>0) drawSegOnCtx(c,35,45,carry,55,'#f87171');
  drawSegOnCtx(c,carry>0?115:70,45,lower<=9?lower:null,55,'#4ade80');
  var lbl=document.createElement('div');
  lbl.style='font-size:13px;color:rgba(255,255,255,0.5);align-self:center';
  lbl.textContent=A+' + '+B+' = '+(A+B);
  row.appendChild(lbl);
}
function drawSegOnCtx(c,cx,cy,digit,size,col){
  var SEG2={0:[1,1,1,1,1,1,0],1:[0,1,1,0,0,0,0],2:[1,1,0,1,1,0,1],3:[1,1,1,1,0,0,1],4:[0,1,1,0,0,1,1],5:[1,0,1,1,0,1,1],6:[1,0,1,1,1,1,1],7:[1,1,1,0,0,0,0],8:[1,1,1,1,1,1,1],9:[1,1,1,1,0,1,1]};
  var p=(digit!==null&&SEG2.hasOwnProperty(digit))?SEG2[digit]:[0,0,0,0,0,0,0];
  var t=Math.max(3,Math.round(size*0.09)),l=Math.round(size*0.4);
  var g=2,ox=cx-(l+t*2)/2,oy=cy-(l*2+t*3)/2;
  var ON=col||'#fbbf24',OFF='#1a2438';
  function seg(x,y,w,h){c.fillRect(ox+x+g,oy+y+g,w-g*2,h-g*2);}
  c.fillStyle=p[0]?ON:OFF;seg(t,0,l,t);c.fillStyle=p[1]?ON:OFF;seg(t+l,t,t,l);
  c.fillStyle=p[2]?ON:OFF;seg(t+l,t*2+l,t,l);c.fillStyle=p[3]?ON:OFF;seg(t,t*2+l*2,l,t);
  c.fillStyle=p[4]?ON:OFF;seg(0,t*2+l,t,l);c.fillStyle=p[5]?ON:OFF;seg(0,t,t,l);
  c.fillStyle=p[6]?ON:OFF;seg(t,t+l,l,t);
}

function refresh(){
  document.getElementById('aVal').textContent=A;
  document.getElementById('bVal').textContent=B;
  var rawSum=A+B;
  var needsCorr=rawSum>9;
  var corrected=rawSum+(needsCorr?6:0);
  var carry=(corrected>15)?1:0;
  var lower=corrected&0xF;

  buildSegRow(carry,lower);

  var steps=document.getElementById('stepList');
  var html='';
  html+='<div><span style="color:#38bdf8">A = '+A+'</span> BCD: <span style="color:#38bdf8">'+A.toString(2).padStart(4,'0')+'</span></div>';
  html+='<div><span style="color:#a78bfa">B = '+B+'</span> BCD: <span style="color:#a78bfa">'+B.toString(2).padStart(4,'0')+'</span></div>';
  html+='<div style="border-top:1px solid rgba(255,255,255,0.1);margin:4px 0;padding-top:4px">Raw sum = <span style="color:'+(needsCorr?'#ef4444':'#4ade80')+'">'+rawSum+' ('+rawSum.toString(2).padStart(5,'0')+')</span></div>';
  if(needsCorr){
    html+='<div style="color:#fbbf24">'+rawSum+' &gt; 9 \u2192 add correction +6</div>';
    html+='<div>'+rawSum+' + 6 = <span style="color:#4ade80">'+corrected+' ('+corrected.toString(2).padStart(5,'0')+')</span></div>';
  } else {
    html+='<div style="color:#4ade80">'+rawSum+' \u2264 9 \u2014 no correction needed</div>';
  }
  html+='<div style="border-top:1px solid rgba(255,255,255,0.1);margin:4px 0;padding-top:4px">';
  if(carry>0) html+='Carry = <span style="color:#f87171">'+carry+'</span>, ';
  html+='Result digit = <span style="color:#4ade80">'+lower+'</span></div>';
  steps.innerHTML=html;

  draw(rawSum,needsCorr,corrected,carry,lower);
}

function row(y,label,bitsStr,col,note){
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText(label,52,y+4);
  bitsStr.split('').forEach(function(b,i){
    var bx=60+i*32;
    var on=b==='1';
    ctx.fillStyle=on?col+'44':'rgba(255,255,255,0.04)';ctx.fillRect(bx,y-14,28,20);
    ctx.strokeStyle=on?col:'rgba(255,255,255,0.1)';ctx.lineWidth=on?1.5:1;ctx.strokeRect(bx,y-14,28,20);
    ctx.fillStyle=on?col:'rgba(255,255,255,0.3)';ctx.font='bold 13px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b,bx+14,y-4);ctx.textBaseline='alphabetic';
  });
  if(note){ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='left';ctx.fillText(note,230,y+4);}
}

function draw(rawSum,needsCorr,corrected,carry,lower){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var y=30;
  row(y,'A =',A.toString(2).padStart(5,'0').replace(/^0/,'0'),'#38bdf8','');
  y+=30;
  row(y,'B =',B.toString(2).padStart(5,'0'),'#a78bfa','');
  y+=30;
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(56,y-6);ctx.lineTo(220,y-6);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText('+',40,y-2);
  row(y,'sum =',rawSum.toString(2).padStart(5,'0'),needsCorr?'#ef4444':'#4ade80','');
  if(needsCorr){
    y+=30;
    row(y,'+6 =','00110','#fbbf24','\u2190 correction');
    y+=30;
    ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(56,y-6);ctx.lineTo(220,y-6);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='10px monospace';ctx.textAlign='right';ctx.fillText('+',40,y-2);
    row(y,'=',corrected.toString(2).padStart(5,'0'),'#4ade80','');
    y+=34;
    // Annotate carry nibble vs result nibble
    ctx.strokeStyle='#f87171';ctx.lineWidth=1;ctx.setLineDash([3,2]);
    ctx.beginPath();ctx.moveTo(60,y-6);ctx.lineTo(90,y-6);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#f87171';ctx.font='9px monospace';ctx.textAlign='center';ctx.fillText('carry',75,y+6);
    ctx.strokeStyle='#4ade80';ctx.lineWidth=1;ctx.setLineDash([3,2]);
    ctx.beginPath();ctx.moveTo(94,y-6);ctx.lineTo(220,y-6);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#4ade80';ctx.font='9px monospace';ctx.textAlign='center';ctx.fillText('digit',155,y+6);
  }
  // Bit index row
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';ctx.textAlign='center';
  ['C4','b3','b2','b1','b0'].forEach(function(lbl,i){ctx.fillText(lbl,60+i*32+14,H-4);});
}

document.getElementById('slA').oninput=function(){A=parseInt(this.value);refresh();};
document.getElementById('slB').oninput=function(){B=parseInt(this.value);refresh();};
refresh();`,
      outputHeight: 380,
    },

    // ── Challenge 1 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `When adding BCD digits 6 + 7 in a BCD adder, the binary sum is 1101 (13). What is the corrected BCD result?`,
      options: [
        { label: 'A', text: '1101 — 13 is the final answer, no correction needed' },
        { label: 'B', text: '0011 with carry 1 — 1101 + 0110 = 1 0011, carry digit = 1, units digit = 3' },
        { label: 'C', text: '0111 — just take the lower 4 bits of 13' },
        { label: 'D', text: '1001 with carry 1 — 13 is treated as 9 with a carry' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! 6 + 7 = 13 (binary 1101). Since 13 > 9, add the correction +6: 1101 + 0110 = 1 0011. Carry = 1, lower nibble = 0011 = 3. BCD result: carry digit 1, units digit 3 → the decimal answer 13. The digit pair (1,3) is exactly 6+7=13.',
      failMessage: '13 in binary is 1101, which is an invalid BCD digit (BCD only goes to 9). Apply the correction: 1101 + 0110 = 1 0011. The carry-out bit is 1 (the tens digit). The lower 4 bits 0011 = 3 (the units digit). Result: 1 and 3 → 13. The +6 correction skips the 6 invalid patterns (10–15) in the 4-bit range.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Gray Code: One Bit at a Time

Standard binary has a glitch problem. When counting from 7 (0111) to 8 (1000), all four bits change. If a mechanical encoder transitions between these positions, the four signal lines don't all switch at exactly the same instant — during the transition, the encoder outputs garbage for a brief moment.

**Gray code** solves this by ensuring **every consecutive pair of values differs in exactly one bit**. Only one signal line can be wrong during a transition, so there's no ambiguous intermediate state.

**Converting Binary → Gray**:
$G_{MSB} = B_{MSB}$
$G_i = B_{i+1} \\oplus B_i \\quad \\text{(each other bit = XOR with the bit above)}$

Or equivalently: $G = B \\oplus (B \\gg 1)$

**Converting Gray → Binary**:
$B_{MSB} = G_{MSB}$
$B_i = B_{i+1} \\oplus G_i \\quad \\text{(cascade XOR from MSB downward)}$

**Key property**: the Hamming distance between any two consecutive Gray code values is exactly 1. The code is also called a **unit distance code** for this reason.

Gray codes are used in:
- Rotary shaft encoders (motors, CNC, mice)
- Karnaugh maps (the row/column ordering that groups minterms correctly)
- Some error-correcting codes
- Flash memory wear-levelling`,
    },

    // ── Visual 3 — Gray Code ──────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Gray code vs standard binary

Move the slider to step through values 0–15. For each step, the **Bits changed** column shows how many bits flip in standard binary vs Gray code. Standard binary can flip up to 4 bits at once (at 7→8). Gray code always flips exactly 1.`,
      html: `<div style="padding:12px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap">
    <span style="font-size:12px;color:rgba(255,255,255,0.5)">Position:</span>
    <strong id="posLabel" style="font-size:16px;color:#a78bfa;min-width:26px">6</strong>
    <input type="range" id="posSl" min="0" max="15" value="6" style="flex:1;min-width:140px;accent-color:#a78bfa">
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <canvas id="cv" width="340" height="360"></canvas>
    <div style="flex:1;min-width:180px">
      <div id="convPanel" style="font-size:12px;line-height:2;color:rgba(255,255,255,0.6)"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}canvas{border-radius:8px;display:block}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var pos=6;

function toGray(n){return n^(n>>1);}
function bin4(n){return n.toString(2).padStart(4,'0');}
function popcount(n){var c=0;while(n){c+=n&1;n>>>=1;}return c;}

function refresh(){
  document.getElementById('posLabel').textContent=pos;
  var g=toGray(pos);
  var prev=(pos-1+16)%16, prevGray=toGray(prev);
  var binDiff=pos>0?popcount(pos^(pos-1)):0;
  var grayDiff=pos>0?popcount(g^prevGray):0;

  var html='<div style="font-size:13px;margin-bottom:8px;color:#e2e8f0">Position <strong style="color:#a78bfa">'+pos+'</strong></div>';
  html+='<div>Binary:&nbsp;&nbsp;&nbsp;<span style="color:#38bdf8;font-size:14px">'+bin4(pos)+'</span></div>';
  html+='<div>Gray code: <span style="color:#a78bfa;font-size:14px">'+bin4(g)+'</span></div>';
  if(pos>0){
    html+='<div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:6px;padding-top:6px">';
    html+='From '+prev+'\u2192'+pos+':<br>';
    html+='Binary bits changed: <span style="color:'+(binDiff>1?'#ef4444':'#4ade80')+'">'+binDiff+'</span><br>';
    html+='Gray bits changed: <span style="color:#4ade80">'+grayDiff+'</span>';
    html+='</div>';
  }
  html+='<div style="margin-top:8px;font-size:10px;color:rgba(255,255,255,0.3)">Binary\u2192Gray formula:<br>G = B XOR (B &gt;&gt; 1)<br>'+pos+' XOR '+Math.floor(pos/2)+' = '+g+'</div>';
  document.getElementById('convPanel').innerHTML=html;
  draw();
}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var rowH=Math.floor((H-24)/16);
  var colDec=28,colBin=80,colGray=180,colDiff=272;

  // Headers
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('Dec',colDec,14);ctx.fillText('Binary',colBin+24,14);
  ctx.fillText('Gray',colGray+24,14);ctx.fillText('\u0394bits',colDiff+14,14);

  for(var i=0;i<16;i++){
    var y=20+i*rowH;
    var isSel=(i===pos);
    var g=toGray(i);
    var prev=(i-1+16)%16, prevGray=toGray(prev);
    var binChange=i>0?popcount(i^(i-1)):0;
    var grayChange=i>0?popcount(g^prevGray):0;

    // Row background
    if(isSel){
      ctx.fillStyle='rgba(167,139,250,0.12)';
      ctx.fillRect(0,y,W,rowH);
    }

    // Decimal
    ctx.fillStyle=isSel?'#a78bfa':'rgba(255,255,255,0.45)';
    ctx.font=(isSel?'bold ':'')+'11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(i,colDec,y+rowH/2);

    // Binary bits
    bin4(i).split('').forEach(function(b,ci){
      var bx=colBin+ci*16;
      var on=b==='1';
      // Highlight changed bit vs previous
      var bitChanged=i>0&&(((i^(i-1))>>(3-ci))&1)===1;
      ctx.fillStyle=on?'#38bdf8':'rgba(255,255,255,0.12)';
      if(bitChanged&&i>0) ctx.fillStyle=on?'#ef4444':'rgba(239,68,68,0.3)';
      ctx.font=(on?'bold ':'')+'11px monospace';ctx.textAlign='center';
      ctx.fillText(b,bx+7,y+rowH/2);
    });

    // Gray bits
    bin4(g).split('').forEach(function(b,ci){
      var bx=colGray+ci*16;
      var on=b==='1';
      var bitChanged=i>0&&(((g^prevGray)>>(3-ci))&1)===1;
      ctx.fillStyle=on?'#a78bfa':'rgba(255,255,255,0.12)';
      if(bitChanged&&i>0) ctx.fillStyle=on?'#fbbf24':'rgba(251,191,36,0.2)';
      ctx.font=(on?'bold ':'')+'11px monospace';ctx.textAlign='center';
      ctx.fillText(b,bx+7,y+rowH/2);
    });

    // Bits changed column
    if(i>0){
      // Binary delta
      ctx.fillStyle=binChange>1?'#ef4444':'#4ade80';
      ctx.font='bold 10px monospace';ctx.textAlign='center';
      ctx.fillText(binChange,colDiff,y+rowH/2);
      // Gray delta
      ctx.fillStyle='#4ade80';
      ctx.fillText(grayChange,colDiff+28,y+rowH/2);
    } else {
      ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='10px monospace';
      ctx.fillText('\u2014',colDiff+10,y+rowH/2);
    }
    ctx.textBaseline='alphabetic';
  }

  // Delta column sub-headers
  ctx.fillStyle='#38bdf8';ctx.font='8px monospace';ctx.textAlign='center';
  ctx.fillText('bin',colDiff,14);
  ctx.fillStyle='#a78bfa';ctx.fillText('gray',colDiff+28,14);

  // Column dividers
  ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;
  [colBin-6,colGray-6,colDiff-6].forEach(function(x){
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();
  });
}

document.getElementById('posSl').oninput=function(){pos=parseInt(this.value);refresh();};
refresh();`,
      outputHeight: 420,
    },

    // ── Challenge 2 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A rotary encoder is at position 7 (standard binary: 0111). It moves one step to position 8 (standard binary: 1000). Why is this dangerous without Gray code?`,
      options: [
        { label: 'A', text: 'The encoder draws more current during the transition, which can damage the circuit' },
        { label: 'B', text: 'All four signal bits must change simultaneously, but mechanical tolerances mean they switch at slightly different times — during the transition the encoder may briefly output any value from 0 to 15, causing a spurious position reading' },
        { label: 'C', text: 'Standard binary cannot represent the value 8, so the encoder must reset to 0 first' },
        { label: 'D', text: 'The encoder would output 15 (1111) permanently after exceeding 7' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! 7→8 in standard binary flips all 4 bits (0111→1000). Mechanically, each bit is a separate optical or magnetic track; they do not all switch at exactly the same instant. During the transition, any of the 16 intermediate combinations (0000–1111) can appear momentarily. Gray code avoids this entirely — the 7→8 transition in Gray code is 0100→1100 (only bit 3 changes), so there is no ambiguous intermediate state.',
      failMessage: 'The electrical hazard isn\'t the issue. The problem is that going from 0111 to 1000 requires flipping all 4 bits. In a physical encoder, each bit corresponds to a separate track on the disc. Due to mechanical tolerances and switching speeds, these tracks don\'t all transition simultaneously — for a few microseconds, some bits have already changed while others haven\'t. This can generate phantom readings of any 4-bit value. Gray code prevents this by guaranteeing a single-bit change per step.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### ASCII: Mapping Characters to Numbers

Computers only store numbers. To store text, we need an agreed-upon mapping from characters to numbers — a **character encoding**.

**ASCII** (American Standard Code for Information Interchange, 1963) defines 128 characters using 7 bits:

| Range | Codes | Content |
|-------|-------|---------|
| 0–31 | 0000000–0011111 | Control characters (non-printable) |
| 32–126 | 0100000–1111110 | Printable characters |
| 127 | 1111111 | DEL (delete) |

**Control characters** (0–31) include: 9 = Tab, 10 = Line Feed (\\n), 13 = Carriage Return (\\r), 27 = Escape.

**The case bit trick**: The uppercase letters A–Z are codes 65–90. The lowercase letters a–z are codes 97–122. The difference is exactly 32 — **bit 5** (value 2⁵ = 32). Toggle bit 5 to flip case without any lookup:

$\\text{lowercase} = \\text{uppercase} \\,|\\, 32$
$\\text{uppercase} = \\text{lowercase} \\,\\&\\sim 32$

This elegant alignment was intentional in the original ASCII design.

**UTF-8**: ASCII is 7-bit and only covers 128 characters. Modern text uses **UTF-8**, which encodes the full Unicode set (149,000+ characters). UTF-8 stores ASCII characters as single bytes identical to their ASCII values — fully backward-compatible. Characters beyond ASCII use 2–4 bytes.`,
    },

    // ── Visual 4 — ASCII Explorer ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### ASCII character explorer

Click any character to see its 7-bit encoding, decimal code, and hex value. The bit-5 (case) relationship is highlighted for letters. Type text in the input to see how each character is stored as a byte in memory.`,
      html: `<div style="padding:12px">
  <div id="charGrid" style="display:flex;flex-wrap:wrap;gap:2px;margin-bottom:10px;max-height:130px;overflow:hidden"></div>
  <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start">
    <canvas id="cv" width="300" height="180"></canvas>
    <div style="flex:1;min-width:180px">
      <div id="charDetail" style="font-size:12px;line-height:2;margin-bottom:10px;min-height:60px"></div>
      <input id="textIn" type="text" value="Hello!" maxlength="12" placeholder="Type text..."
        style="width:100%;padding:6px 10px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.15);background:#0d1527;color:#e2e8f0;font-size:13px;font-family:monospace;box-sizing:border-box">
      <div id="bytesRow" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
input{outline:none}input:focus{border-color:#7c3aed !important}
.cchar{width:22px;height:22px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);background:transparent;font-family:monospace;font-size:11px;cursor:pointer;color:rgba(255,255,255,0.5);padding:0;display:flex;align-items:center;justify-content:center}
.cchar:hover,.cchar.sel{border-color:#7c3aed;background:rgba(124,58,237,0.2);color:#a78bfa}
.cchar.isup{border-color:rgba(8,145,178,0.5);color:#38bdf8}.cchar.islo{border-color:rgba(5,150,105,0.4);color:#4ade80}
.cchar.isdig{border-color:rgba(217,119,6,0.4);color:#fbbf24}
.cchar.sel{border-color:#7c3aed !important;color:#a78bfa !important;background:rgba(124,58,237,0.2) !important}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var sel=65;

function charClass(c){
  if(c>=65&&c<=90)return'isup';if(c>=97&&c<=122)return'islo';
  if(c>=48&&c<=57)return'isdig';return'';
}

function buildGrid(){
  var g=document.getElementById('charGrid');g.innerHTML='';
  for(var c=32;c<=126;c++){
    var btn=document.createElement('button');
    btn.className='cchar '+charClass(c)+(c===sel?' sel':'');
    btn.textContent=String.fromCharCode(c);
    btn.title='Code '+c;
    (function(code){btn.onclick=function(){sel=code;refresh();};})(c);
    g.appendChild(btn);
  }
}

function bin7(n){return n.toString(2).padStart(7,'0');}

function refresh(){
  buildGrid();
  var c=sel;
  var ch=String.fromCharCode(c);
  var isUp=c>=65&&c<=90,isLo=c>=97&&c<=122;
  var b=bin7(c);

  var detail=document.getElementById('charDetail');
  var col=isUp?'#38bdf8':isLo?'#4ade80':(c>=48&&c<=57)?'#fbbf24':'#a78bfa';
  var html='<span style="font-size:28px;font-weight:700;color:'+col+'">'+ch+'</span> ';
  html+='<span style="color:rgba(255,255,255,0.5)">code </span><span style="color:'+col+'">'+c+'</span>';
  html+=' <span style="color:rgba(255,255,255,0.3)">0x'+c.toString(16).toUpperCase().padStart(2,'0')+'</span><br>';
  html+='<span style="color:rgba(255,255,255,0.4)">7-bit: '+b+'</span><br>';
  if(isUp){
    var lo=c|32;
    html+='<span style="color:#4ade80">Lowercase: '+String.fromCharCode(lo)+' ('+lo+' = '+c+' | 32)</span>';
  } else if(isLo){
    var up=c&~32;
    html+='<span style="color:#38bdf8">Uppercase: '+String.fromCharCode(up)+' ('+up+' = '+c+' &amp; ~32)</span>';
  }
  detail.innerHTML=html;

  draw(c,b);
  buildBytesRow();
}

function buildBytesRow(){
  var txt=document.getElementById('textIn').value;
  var row=document.getElementById('bytesRow');row.innerHTML='';
  txt.split('').forEach(function(ch){
    var code=ch.charCodeAt(0);
    var col=code>=65&&code<=90?'#38bdf8':code>=97&&code<=122?'#4ade80':code>=48&&code<=57?'#fbbf24':'#a78bfa';
    var cell=document.createElement('div');
    cell.style='text-align:center;cursor:pointer';
    cell.innerHTML='<div style="font-size:15px;font-weight:700;color:'+col+'">'+ch+'</div>'+
      '<div style="font-size:9px;color:'+col+'">'+code+'</div>'+
      '<div style="font-size:8px;color:rgba(255,255,255,0.3)">0x'+code.toString(16).toUpperCase().padStart(2,'0')+'</div>';
    (function(c2){cell.onclick=function(){sel=c2;refresh();};})(code);
    row.appendChild(cell);
  });
}

function draw(code,b){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var isUp=code>=65&&code<=90,isLo=code>=97&&code<=122;

  // 7-bit breakdown
  var startX=20,cellW=36,cellH=48,topY=20;
  var COLORS=['#059669','#059669','#7c3aed','#0891b2','#0891b2','#0891b2','#0891b2'];
  // bits 6-0: bit 6=MSB, bit 5=case bit, bits 4-0=character position

  b.split('').forEach(function(bit,i){
    var x=startX+i*cellW;
    var on=bit==='1';
    var col=COLORS[i];
    var isCaseBit=(i===2); // bit 5 is index 2 in the 7-bit string (b6 b5 b4 b3 b2 b1 b0, index 0=b6, index2=b5? 
    // Actually bin7 pads from MSB (bit6) first. bit index from string: b[0]=bit6, b[1]=bit5, b[2]=bit4, b[3]=bit3, b[4]=bit2, b[5]=bit1, b[6]=bit0
    // bit 5 (value 32) is b[1] in the string
    var isCaseBit2=(i===1&&(isUp||isLo));

    ctx.fillStyle=on?(isCaseBit2?'rgba(124,58,237,0.4)':col+'33'):'rgba(255,255,255,0.04)';
    ctx.fillRect(x,topY,cellW-2,cellH-2);
    ctx.strokeStyle=on?(isCaseBit2?'#7c3aed':col):'rgba(255,255,255,0.12)';
    ctx.lineWidth=on?(isCaseBit2?2.5:1.5):1;
    ctx.strokeRect(x,topY,cellW-2,cellH-2);

    ctx.fillStyle=on?(isCaseBit2?'#a78bfa':col):'rgba(255,255,255,0.3)';
    ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(bit,x+(cellW-2)/2,topY+(cellH-2)/2);ctx.textBaseline='alphabetic';

    // Bit value label below
    var bitVal=Math.pow(2,6-i);
    ctx.fillStyle=on?(isCaseBit2?'#a78bfa':col):'rgba(255,255,255,0.2)';
    ctx.font='8px monospace';ctx.textAlign='center';
    ctx.fillText(bitVal<64?bitVal.toString():'64',x+(cellW-2)/2,topY+cellH+6);
    ctx.fillText('b'+(6-i),x+(cellW-2)/2,topY-6);
  });

  // Case bit annotation
  if(isUp||isLo){
    var caseBitX=startX+1*cellW+(cellW-2)/2;
    ctx.fillStyle='#7c3aed';ctx.font='bold 9px monospace';ctx.textAlign='center';
    ctx.fillText('case',caseBitX,topY+cellH+18);
  }

  // Legend
  var legY=H-36;
  [[0,'#059669','bit 6–4 (group)'],[2,'#7c3aed','bit 5 (case)'],[4,'#0891b2','bit 4–0 (offset)']].forEach(function(item,i){
    ctx.fillStyle=item[1];ctx.fillRect(20+i*90,legY,10,8);
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='8px monospace';ctx.textAlign='left';
    ctx.fillText(item[2],34+i*90,legY+8);
  });

  // Decimal + hex summary
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='11px monospace';ctx.textAlign='left';
  ctx.fillText('Dec: '+code+'  Hex: 0x'+code.toString(16).toUpperCase().padStart(2,'0')+'  Char: '+String.fromCharCode(code),20,H-8);
}

document.getElementById('textIn').oninput=function(){buildBytesRow();};
refresh();`,
      outputHeight: 420,
    },

    // ── Challenge 3 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `The ASCII code for 'A' is 65 (0100 0001). Using only a single bitwise operation, what is the ASCII code for 'a' (lowercase)?`,
      options: [
        { label: 'A', text: '65 + 1 = 66 — add 1 to get the next character' },
        { label: 'B', text: '65 | 32 = 97 — set bit 5 (the case bit) to convert uppercase to lowercase' },
        { label: 'C', text: '65 ^ 97 = 32 — XOR with 97 reveals the difference' },
        { label: 'D', text: '65 & 32 = 0 — mask bit 5 to test for uppercase' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! 65 | 32 = 97 = 'a'. Bit 5 (value 32) is the case bit in ASCII. OR-ing with 32 forces bit 5 to 1 → lowercase. AND-ing with ~32 (bitwise NOT of 32 = -33) forces bit 5 to 0 → uppercase. This works for every letter A–Z ↔ a–z. Example in C: char lower = upper | 32;",
      failMessage: "A (65) and a (97) differ by exactly 32, which is 2⁵ — bit 5. Setting bit 5 turns uppercase to lowercase: 65 | 32 = 01000001 | 00100000 = 01100001 = 97 = 'a'. Clearing bit 5 does the reverse: 97 & ~32 = 01100001 & 11011111 = 01000001 = 65 = 'A'. This works for all 26 letters.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: BCD, Gray Code, and ASCII

All three codes are binary at the hardware level. What differs is the **convention used to interpret the bit patterns**:

**BCD** — encode each decimal digit as 4 bits (0000–1001). Simplifies decimal display and avoids binary/decimal conversion errors in financial systems. The +6 correction in BCD addition skips the 6 invalid 4-bit patterns (1010–1111) and generates the correct carry.

**Gray code** — a unit-distance binary sequence where every consecutive pair of values differs in exactly one bit. Eliminates transition glitches in mechanical encoders and switch arrays. Convert with: $G = B \\oplus (B \\gg 1)$.

**ASCII** — 7-bit character encoding mapping 128 symbols to codes 0–127. The case bit (bit 5 = 32) is the only difference between uppercase and lowercase letters. UTF-8 extends ASCII to the full Unicode character set while maintaining backward compatibility for the original 128 codes.

**What all three teach**: the same physical bit patterns can mean very different things depending on the encoding convention. Hardware doesn't care — it stores and moves bits. The meaning comes from the software convention agreed upon at design time.`,
    },
  ],
};

export default {
  id: 'df-2-2-codes',
  slug: 'codes-bcd-gray-ascii',
  chapter: 'df.2',
  order: 3,
  title: 'Codes: BCD, Gray Code, and ASCII',
  subtitle: "Why pure binary isn't always best — and three alternatives that solve real problems.",
  tags: ['digital', 'BCD', 'binary-coded-decimal', 'gray-code', 'ASCII', 'encoding', 'character-encoding', '7-segment', 'rotary-encoder', 'UTF-8'],
  hook: {
    question: 'If binary is so efficient, why does your calculator use BCD, your motor encoder use Gray code, and your text editor use ASCII?',
    realWorldContext: "Every character on this screen is an ASCII (or Unicode) byte. Every 7-segment display on an old clock or calculator uses BCD. Every industrial servo motor encoder uses Gray code. These aren't theoretical exercises — they're in hardware you use every day.",
  },
  intuition: {
    prose: [
      'BCD: each decimal digit = 4 bits. Valid range 0000–1001 only. +6 correction in addition.',
      'Gray code: only 1 bit changes between consecutive values. Prevents encoder glitches.',
      'ASCII: 7-bit character map. Bit 5 = case bit for letters.',
      'Same physical bits, different conventions = different meanings.',
    ],
    callouts: [
      { type: 'tip', title: 'The +6 rule', body: 'BCD skips exactly 6 codes (10–15). When a BCD sum lands there, +6 corrects it and automatically generates the carry for the next digit position.' },
      { type: 'important', title: 'Gray code invariant', body: 'Hamming distance between any two consecutive Gray code values = exactly 1. This is the Unit Distance property. Any transition through a physical encoder can only misread by ±1 position, not by an arbitrary amount.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Codes: BCD, Gray Code, and ASCII', props: { lesson: LESSON_DF_2_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'BCD: 4 bits per decimal digit. Max valid = 9 (1001). Sum > 9 → add 6 correction.',
    'Gray code: G = B XOR (B >> 1). Always 1-bit transition. Used in encoders and Karnaugh maps.',
    'ASCII: 7 bits, 128 chars. Uppercase A=65, lowercase a=97. Toggle bit 5 to switch case.',
    'Encoding is a convention. The same 8-bit pattern 0100 0001 can mean: BCD digit 4 then 1, ASCII \'A\', binary 65, or Gray code position 55 — depending on which encoding is in use.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
