// Digital Fundamentals · Chapter 2 · Lesson 2
// Hexadecimal
// ScienceNotebook format — visuals + challenges

export const LESSON_DF_1_2 = {
  title: 'Hexadecimal',
  subtitle: 'The shorthand that makes binary readable — every hex digit is exactly 4 bits.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### Why hex exists

Binary is the native language of digital electronics, but it is painful to read. The number **10110100** is easy to miscount. The same value in decimal is **180** — but converting back to binary in your head is tedious. Programmers needed a third option.

**Hexadecimal** (base 16) fills that role. Instead of 10 symbols (decimal) or 2 symbols (binary), it uses **16 symbols**: the digits 0–9 plus letters A–F.

| Decimal | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Hex | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | A | B | C | D | E | F |

The reason 16 is the perfect base for digital work: **16 = 2⁴**, so every hex digit maps to exactly **4 bits** (a nibble). An 8-bit byte is always exactly 2 hex digits. A 16-bit value is always 4 hex digits. You never have to worry about partial digits or misaligned boundaries.

To write hex in code, programmers prefix it with \`0x\`: the byte 180 is written \`0xB4\`. In some contexts you see a \`#\` prefix — CSS colors like \`#FF8800\` are just three hex bytes: red, green, blue.`,
    },

    // ── Visual 1 — Three-way converter with nibble grouping ───────────────────
    {
      type: 'js',
      instruction: `**Enter a number** in any of the three boxes — binary, decimal, or hex. The other two update instantly, and the nibble breakdown shows exactly how the bits group into hex digits.

Notice that each group of 4 bits maps to exactly one hex digit. This is why hex is so useful: you can read it off from binary mechanically, four bits at a time.`,
      html: `<div class="scene">
  <div class="trio">
    <div class="inp-col">
      <label class="lbl">Binary (8-bit)</label>
      <input id="bin" type="text" maxlength="8" placeholder="00000000" class="inp mono" value="10110100">
    </div>
    <div class="inp-col">
      <label class="lbl">Decimal</label>
      <input id="dec" type="number" min="0" max="255" class="inp" value="180">
    </div>
    <div class="inp-col">
      <label class="lbl">Hexadecimal</label>
      <input id="hex" type="text" maxlength="2" placeholder="00" class="inp mono" value="B4">
    </div>
  </div>
  <div class="nibble-row" id="nib"></div>
  <div class="breakdown" id="bkd"></div>
</div>`,
      css: `body{margin:0;padding:12px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:14px}
.trio{display:flex;gap:12px}
.inp-col{display:flex;flex-direction:column;gap:5px;flex:1}
.lbl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text-secondary,#64748b)}
.inp{padding:9px 12px;border-radius:8px;border:1.5px solid var(--color-border-secondary,#e2e8f0);background:var(--color-background-secondary,#f8fafc);color:var(--color-text-primary,#1e293b);font-size:16px;width:100%;box-sizing:border-box}
.inp.mono{font-family:monospace;letter-spacing:.15em}
.inp:focus{outline:none;border-color:#3b82f6}
.inp.err{border-color:#ef4444;background:#fef2f2}
.nibble-row{display:flex;gap:8px;align-items:flex-end;justify-content:center;padding:8px 0}
.nib-group{display:flex;flex-direction:column;align-items:center;gap:4px}
.nib-bits{display:flex;gap:3px}
.nib-bit{width:30px;height:40px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;font-family:monospace;border:1.5px solid;transition:all .1s}
.nib-bit.on{background:#eff6ff;border-color:#3b82f6;color:#1d4ed8}
.nib-bit.off{background:var(--color-background-secondary,#f8fafc);border-color:var(--color-border-tertiary,#e2e8f0);color:var(--color-text-tertiary,#94a3b8)}
.nib-hex{font-size:20px;font-weight:700;font-family:monospace;color:#7c3aed;padding:4px 12px;background:#f5f3ff;border-radius:6px;border:1.5px solid #c4b5fd;min-width:32px;text-align:center}
.nib-label{font-size:9px;color:var(--color-text-secondary,#64748b);text-transform:uppercase;letter-spacing:.06em}
.nib-sep{font-size:22px;color:var(--color-border-secondary,#e2e8f0);align-self:center;padding-bottom:8px}
.breakdown{font-size:12px;color:var(--color-text-secondary,#64748b);line-height:1.75;padding:10px 14px;background:var(--color-background-secondary,#f8fafc);border-radius:8px;border:1px solid var(--color-border-tertiary,#e2e8f0);min-height:20px}`,
      startCode: `var binEl=document.getElementById('bin'),decEl=document.getElementById('dec'),hexEl=document.getElementById('hex');

function clamp(n){return Math.max(0,Math.min(255,n));}
function safeBin(s){var c=s.replace(/[^01]/g,'').padStart(8,'0').slice(-8);return c;}
function safeHex(s){var c=s.replace(/[^0-9a-fA-F]/g,'').toUpperCase().padStart(2,'0').slice(-2);return c;}

function render(n){
  n=clamp(n);
  var bits=n.toString(2).padStart(8,'0');
  var hx=n.toString(16).toUpperCase().padStart(2,'0');
  binEl.value=bits; decEl.value=n; hexEl.value=hx;
  binEl.classList.remove('err'); decEl.classList.remove('err'); hexEl.classList.remove('err');

  // Nibble display
  var nib=document.getElementById('nib');nib.innerHTML='';

  [bits.slice(0,4), bits.slice(4,8)].forEach(function(nibble, gi){
    var val=parseInt(nibble,2);
    var hd=val.toString(16).toUpperCase();
    var grp=document.createElement('div');grp.className='nib-group';

    var bitsRow=document.createElement('div');bitsRow.className='nib-bits';
    for(var i=0;i<4;i++){
      var bd=document.createElement('div');
      bd.className='nib-bit '+(nibble[i]==='1'?'on':'off');
      bd.textContent=nibble[i];
      bitsRow.appendChild(bd);
    }
    var hexDiv=document.createElement('div');hexDiv.className='nib-hex';hexDiv.textContent=hd;
    var lbl=document.createElement('div');lbl.className='nib-label';lbl.textContent='nibble '+(gi+1);
    grp.appendChild(lbl);grp.appendChild(bitsRow);grp.appendChild(hexDiv);
    nib.appendChild(grp);
    if(gi===0){var sep=document.createElement('div');sep.className='nib-sep';sep.textContent='→';nib.appendChild(sep);}
  });

  var hibits=bits.slice(0,4),lobits=bits.slice(4,8);
  var hiVal=parseInt(hibits,2),loVal=parseInt(lobits,2);
  var hexStr='0x'+hx;
  var parts=[];
  for(var i=7;i>=0;i--){if((n>>i)&1)parts.push('2<sup>'+i+'</sup>');}
  document.getElementById('bkd').innerHTML=
    '<strong>'+hx+'</strong> in hex = <strong>'+n+'</strong> in decimal<br>'+
    'High nibble: <code style="color:#7c3aed">'+hibits+'</code> ('+hiVal+') = '+hiVal.toString(16).toUpperCase()+
    ' &nbsp;·&nbsp; Low nibble: <code style="color:#7c3aed">'+lobits+'</code> ('+loVal+') = '+loVal.toString(16).toUpperCase()+
    (parts.length ? '<br>Bit weights: '+parts.join(' + ')+' = '+n : '');
}

binEl.oninput=function(){
  var clean=binEl.value.replace(/[^01]/g,'');
  if(clean.length>8)clean=clean.slice(-8);
  if(/^[01]{1,8}$/.test(clean))render(parseInt(clean.padStart(8,'0'),2));
  else binEl.classList.add('err');
};
decEl.oninput=function(){
  var n=parseInt(decEl.value);
  if(!isNaN(n))render(n); else decEl.classList.add('err');
};
hexEl.oninput=function(){
  var clean=hexEl.value.replace(/[^0-9a-fA-F]/g,'');
  if(clean.length>0)render(parseInt(clean.padStart(2,'0'),16));
  else hexEl.classList.add('err');
};
render(180);`,
      outputHeight: 380,
    },

    // ── Visual 2 — Hex color picker ───────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Hex in the real world: CSS colors

The most common place most people encounter hex without knowing it is in **HTML/CSS colors**. A color like \`#FF8800\` is three back-to-back hex bytes: **R**=\`FF\` (255), **G**=\`88\` (136), **B**=\`00\` (0) — a bright orange.

This makes colors easy to reason about in the same mental model: max red is \`FF\` (11111111 in binary), no red is \`00\` (00000000). An 8-bit channel gives you 256 levels per colour, and 3 channels give you 256³ = 16,777,216 possible colours.

**Drag the sliders** to mix any colour. Watch the hex code update and see exactly which byte controls which channel.`,
      html: `<div class="scene">
  <div class="preview-row">
    <div class="swatch" id="sw"></div>
    <div class="hex-display">
      <div class="hex-prefix">#</div>
      <div class="hex-byte" id="hr" style="color:#f87171"></div>
      <div class="hex-byte" id="hg" style="color:#4ade80"></div>
      <div class="hex-byte" id="hb" style="color:#60a5fa"></div>
    </div>
  </div>
  <div class="sliders">
    <div class="sl-row">
      <span class="ch-lbl" style="color:#f87171">R</span>
      <input type="range" id="sr" min="0" max="255" value="255" class="sl-r">
      <span class="ch-val" id="rv">255 = 0xFF</span>
    </div>
    <div class="sl-row">
      <span class="ch-lbl" style="color:#4ade80">G</span>
      <input type="range" id="sg" min="0" max="255" value="136" class="sl-r">
      <span class="ch-val" id="gv">136 = 0x88</span>
    </div>
    <div class="sl-row">
      <span class="ch-lbl" style="color:#60a5fa">B</span>
      <input type="range" id="sb" min="0" max="255" value="0" class="sl-r">
      <span class="ch-val" id="bv">0 = 0x00</span>
    </div>
  </div>
  <div class="bit-row" id="bitrow"></div>
</div>`,
      css: `body{margin:0;padding:12px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:14px}
.preview-row{display:flex;align-items:center;gap:16px}
.swatch{width:90px;height:90px;border-radius:14px;border:2px solid rgba(0,0,0,.12);transition:background .1s;flex-shrink:0}
.hex-display{display:flex;align-items:center;gap:4px;font-size:44px;font-weight:700;font-family:monospace;line-height:1}
.hex-prefix{color:var(--color-text-secondary,#64748b);font-size:32px}
.hex-byte{letter-spacing:.04em}
.sliders{display:flex;flex-direction:column;gap:8px}
.sl-row{display:flex;align-items:center;gap:10px}
.ch-lbl{font-size:14px;font-weight:700;font-family:monospace;width:16px;flex-shrink:0}
.sl-r{flex:1;height:6px;accent-color:#64748b}
.ch-val{font-size:12px;font-family:monospace;color:var(--color-text-secondary,#64748b);min-width:110px}
.bit-row{display:flex;gap:12px;flex-wrap:wrap}
.bit-group{display:flex;flex-direction:column;gap:4px;align-items:center}
.bg-lbl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em}
.bg-bits{display:flex;gap:2px}
.bgb{width:22px;height:28px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:monospace;border:1.5px solid;transition:all .1s}`,
      startCode: `function h2(n){return n.toString(16).toUpperCase().padStart(2,'0');}
function makeBits(n,color){
  var bits=n.toString(2).padStart(8,'0');
  return bits.split('').map(function(b){
    var on=b==='1';
    return '<div class="bgb" style="background:'+(on?color+'22':'transparent')+';border-color:'+(on?color:'rgba(148,163,184,0.3)')+';color:'+(on?color:'rgba(148,163,184,0.5)')+'">'+b+'</div>';
  }).join('');
}
function render(){
  var r=+document.getElementById('sr').value;
  var g=+document.getElementById('sg').value;
  var b=+document.getElementById('sb').value;
  document.getElementById('sw').style.background='rgb('+r+','+g+','+b+')';
  document.getElementById('hr').textContent=h2(r);
  document.getElementById('hg').textContent=h2(g);
  document.getElementById('hb').textContent=h2(b);
  document.getElementById('rv').textContent=r+' = 0x'+h2(r);
  document.getElementById('gv').textContent=g+' = 0x'+h2(g);
  document.getElementById('bv').textContent=b+' = 0x'+h2(b);
  document.getElementById('bitrow').innerHTML=
    '<div class="bit-group"><div class="bg-lbl" style="color:#f87171">Red ('+h2(r)+')</div><div class="bg-bits">'+makeBits(r,'#f87171')+'</div></div>'+
    '<div class="bit-group"><div class="bg-lbl" style="color:#4ade80">Green ('+h2(g)+')</div><div class="bg-bits">'+makeBits(g,'#4ade80')+'</div></div>'+
    '<div class="bit-group"><div class="bg-lbl" style="color:#60a5fa">Blue ('+h2(b)+')</div><div class="bg-bits">'+makeBits(b,'#60a5fa')+'</div></div>';
}
['sr','sg','sb'].forEach(function(id){document.getElementById(id).oninput=render;});
render();`,
      outputHeight: 420,
    },

    // ── Visual 3 — Hex memory dump ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### How hex is used in practice: memory dumps

When a programmer inspects raw memory, network packets, or binary files, the tool displays data as a **hex dump**: rows of bytes in hex, with their decimal addresses on the left and an ASCII interpretation on the right.

Each byte is exactly 2 hex digits. **Click any byte** to see its binary breakdown and what character it represents in ASCII.`,
      html: `<div class="scene">
  <div class="dump-wrap" id="dump"></div>
  <div class="detail-panel" id="detail">Click any byte above to inspect it.</div>
</div>`,
      css: `body{margin:0;padding:12px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:12px}
.dump-wrap{font-family:monospace;font-size:12px;line-height:1.9;background:var(--color-background-secondary,#f8fafc);border:1px solid var(--color-border-tertiary,#e2e8f0);border-radius:10px;padding:12px 14px;overflow-x:auto}
.dump-row{display:flex;gap:8px;align-items:center}
.dump-addr{color:var(--color-text-tertiary,#94a3b8);min-width:44px;user-select:none}
.dump-bytes{display:flex;gap:4px;flex-wrap:wrap}
.dump-byte{padding:1px 5px;border-radius:4px;cursor:pointer;border:1.5px solid transparent;transition:all .1s}
.dump-byte:hover{background:#eff6ff;border-color:#93c5fd}
.dump-byte.sel{background:#eff6ff;border-color:#3b82f6;color:#1d4ed8}
.dump-sep{color:var(--color-border-secondary,#e2e8f0);user-select:none}
.dump-ascii{color:#64748b;letter-spacing:.05em;padding-left:8px;border-left:1px solid var(--color-border-tertiary,#e2e8f0)}
.dump-dot{color:#cbd5e1}
.detail-panel{padding:12px 14px;border-radius:8px;background:var(--color-background-secondary,#f8fafc);border:1px solid var(--color-border-tertiary,#e2e8f0);font-size:13px;color:var(--color-text-primary,#1e293b);line-height:1.75;font-family:monospace}`,
      startCode: `var DATA=[72,101,108,108,111,44,32,119,111,114,108,100,33,10,0,255,
              0x3C,0x62,0x72,0x3E,0x41,0x4C,0x4F,0x48,0x41,0x00,
              0xDE,0xAD,0xBE,0xEF,0x01,0x02];

var BYTES_PER_ROW=16,selected=null;

function isprint(n){return n>=32&&n<127;}
function h2(n){return n.toString(16).toUpperCase().padStart(2,'0');}

function build(){
  var dump=document.getElementById('dump');dump.innerHTML='';
  for(var row=0;row*BYTES_PER_ROW<DATA.length;row++){
    var chunk=DATA.slice(row*BYTES_PER_ROW,(row+1)*BYTES_PER_ROW);
    var div=document.createElement('div');div.className='dump-row';
    var addr=document.createElement('div');addr.className='dump-addr';addr.textContent=h2(row*BYTES_PER_ROW)+':';
    div.appendChild(addr);
    var bytes=document.createElement('div');bytes.className='dump-bytes';
    chunk.forEach(function(val,ci){
      var idx=row*BYTES_PER_ROW+ci;
      var bd=document.createElement('span');bd.className='dump-byte'+(selected===idx?' sel':'');
      bd.setAttribute('data-idx',idx);bd.textContent=h2(val);
      bd.onclick=function(){selected=+this.getAttribute('data-idx');build();showDetail(DATA[selected],selected);};
      bytes.appendChild(bd);
      if(ci===7){var sep=document.createElement('span');sep.className='dump-sep';sep.textContent=' ';bytes.appendChild(sep);}
    });
    div.appendChild(bytes);
    var sep=document.createElement('div');sep.className='dump-sep';sep.textContent='|';div.appendChild(sep);
    var ascii=document.createElement('div');ascii.className='dump-ascii';
    chunk.forEach(function(val){
      var sp=document.createElement('span');
      sp.className=isprint(val)?'':'dump-dot';sp.textContent=isprint(val)?String.fromCharCode(val):'.';
      ascii.appendChild(sp);
    });
    div.appendChild(ascii);
    dump.appendChild(div);
  }
}

function showDetail(val,idx){
  var bits=val.toString(2).padStart(8,'0');
  var ascii=isprint(val)?'"'+String.fromCharCode(val)+'" (ASCII)':'(non-printable)';
  var hibits=bits.slice(0,4),lobits=bits.slice(4,8);
  document.getElementById('detail').innerHTML=
    'Byte at offset 0x'+h2(idx)+' ('+idx+'):<br>'+
    'Hex: <strong>0x'+h2(val)+'</strong>  &nbsp;·&nbsp;  '+
    'Decimal: <strong>'+val+'</strong>  &nbsp;·&nbsp;  '+
    'Binary: <strong>'+bits+'</strong>  &nbsp;·&nbsp;  '+ascii+'<br>'+
    'High nibble: '+hibits+' = '+parseInt(hibits,2)+' = '+h2(val)[0]+
    '  &nbsp;·&nbsp;  Low nibble: '+lobits+' = '+parseInt(lobits,2)+' = '+h2(val)[1];
}
build();`,
      outputHeight: 390,
    },

    // ── Challenges ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Check your understanding`,
    },

    {
      type: 'challenge',
      instruction: `What is the decimal value of the hexadecimal number **0xFF**?`,
      options: [
        { label: 'A', text: '15 — F is the 15th hex digit (0-indexed), so 0xFF = 15.' },
        { label: 'B', text: '255 — 0xFF = F×16 + F = 15×16 + 15 = 240 + 15 = 255.' },
        { label: 'C', text: '16 — there are 16 symbols in hexadecimal, so 0xFF = 16.' },
        { label: 'D', text: '256 — 0xFF is the 256th hex value.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. 0xFF = F×16¹ + F×16⁰ = 15×16 + 15×1 = 240 + 15 = 255. This is the maximum value of 1 byte (8 bits), which makes 0xFF a very commonly seen value — it represents "all bits on" for any byte.',
      failMessage: 'Work out the place values: the leftmost F is in the 16s place (16¹), the rightmost is in the 1s place (16⁰). F = 15 in decimal. So 0xFF = 15×16 + 15×1 = 240 + 15 = 255.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 250,
    },

    {
      type: 'challenge',
      instruction: `Convert the binary number **10110100** to hexadecimal.`,
      options: [
        { label: 'A', text: '0xB4 — split into nibbles: 1011 = 11 = B, 0100 = 4.' },
        { label: 'B', text: '0xA4 — 1011 = A in hex, 0100 = 4.' },
        { label: 'C', text: '0xC4 — the first nibble 1011 rounds up to C.' },
        { label: 'D', text: '0xB5 — add 1 to 4 because the carry bit was set.' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Split 10110100 into two nibbles: 1011 and 0100. Compute each: 1011 = 8+2+1 = 11 = B; 0100 = 4. Combined: 0xB4. This nibble-splitting trick is why hex is so much faster to work with than converting all the way through decimal.',
      failMessage: 'Split the 8-bit value into two groups of 4: 1011 | 0100. Convert each independently. 1011 = 8+2+1 = 11 = B (not A=10, not C=12). 0100 = 4. Result: 0xB4.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 250,
    },

    {
      type: 'challenge',
      instruction: `The CSS color **#1A2BFF** is made up of three bytes. What are the decimal values of red, green, and blue?`,
      options: [
        { label: 'A', text: 'R=1, G=2, B=255 — reading each digit directly.' },
        { label: 'B', text: 'R=26, G=43, B=255 — 0x1A=26, 0x2B=43, 0xFF=255.' },
        { label: 'C', text: 'R=10, G=11, B=255 — 1A means 1 then A=10, 2B means 2 then B=11.' },
        { label: 'D', text: 'R=16, G=32, B=255 — 1A means 1×16, 2B means 2×16.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. 0x1A = 1×16 + 10 = 26. 0x2B = 2×16 + 11 = 43. 0xFF = 255. The color has very little red (26/255), a small amount of green (43/255), and full blue — a deep blue-violet.',
      failMessage: 'Each pair of hex digits is one byte: 1A, 2B, FF. Convert each: 0x1A = 1×16 + A(10) = 26. 0x2B = 2×16 + B(11) = 43. 0xFF = 15×16 + 15 = 255.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `How many hexadecimal digits are needed to represent a **32-bit** value (like a standard integer or memory address)?`,
      options: [
        { label: 'A', text: '4 digits — a 32-bit value is 4 bytes, and each byte is 1 hex digit.' },
        { label: 'B', text: '8 digits — a 32-bit value is 4 bytes, and each byte needs 2 hex digits.' },
        { label: 'C', text: '16 digits — 32 bits divided by 2 bits per hex digit.' },
        { label: 'D', text: '32 digits — one digit per bit.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. One hex digit represents 4 bits (one nibble). 32 bits ÷ 4 bits/digit = 8 hex digits. This is why 32-bit memory addresses are typically written as 8 hex digits, e.g. 0x004AF3C2. A 64-bit address would be 16 hex digits.',
      failMessage: 'Each hex digit represents exactly 4 bits. 32 bits ÷ 4 bits/digit = 8 digits. Or think of it as bytes: 32 bits = 4 bytes, and each byte takes 2 hex digits → 4 × 2 = 8 digits.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 250,
    },

  ],
}

export default {
  id: 'df-1-2-hexadecimal',
  slug: 'hexadecimal',
  chapter: 'df.2',
  order: 2,
  title: 'Hexadecimal',
  subtitle: 'The shorthand that makes binary readable — every hex digit is exactly 4 bits.',
  tags: ['digital', 'hexadecimal', 'binary', 'nibble', 'byte', 'memory', 'css-colors'],
  hook: {
    question: 'Why do programmers use hex instead of decimal — and why does every CSS color start with a #?',
    realWorldContext: 'Memory addresses, color codes, network packets, and file offsets are all written in hex. It is the lingua franca of low-level computing.',
  },
  intuition: {
    prose: [
      'Hex is base 16: digits 0–9 then A–F. One hex digit = exactly 4 bits (one nibble).',
      'An 8-bit byte is always exactly 2 hex digits — no partial digits, no ambiguity.',
      'Binary → hex: split into groups of 4 bits and convert each group independently.',
      'CSS colors (#RRGGBB) are three consecutive hex bytes — red, green, blue, each 0–255.',
    ],
    callouts: [{ type: 'important', title: 'The key insight', body: '16 = 2⁴, so every hex digit maps perfectly to exactly 4 binary bits. This alignment is why hex is the standard shorthand for binary data.' }],
    visualizations: [{ id: 'ScienceNotebook', title: 'Hexadecimal', props: { lesson: LESSON_DF_1_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Hex is base 16: 0–9, A=10, B=11, C=12, D=13, E=14, F=15.',
    'One nibble (4 bits) = one hex digit. One byte (8 bits) = two hex digits.',
    'Binary → hex: group 4 bits, convert each group. Hex → binary: expand each digit to 4 bits.',
    '0xFF = 255 (max byte value). 0x00 = 0. 0x80 = 128 (the MSB).',
    'Memory addresses, file offsets, color codes, and opcodes are all written in hex.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
