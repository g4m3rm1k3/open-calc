// Digital Fundamentals · Unit 4 · Lesson 2
// Karnaugh Maps
// ScienceNotebook format — prose cells, JS visuals, challenges

export const LESSON_DF_4_2 = {
  title: 'Karnaugh Maps',
  subtitle: 'A visual method for finding the minimum Sum-of-Products expression from any truth table — without algebraic manipulation.',
  sequential: true,
  cells: [

    // ── Section 1 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What a K-map Is and Why It Works

In Lesson 4.1 you simplified Boolean expressions by applying laws algebraically. That works, but it requires recognising which law to apply and in what order — a skill that takes time to develop and is easy to get wrong for complex functions.

The **Karnaugh map** (K-map), invented by Maurice Karnaugh in 1953, provides a completely visual approach. You arrange the truth table in a 2D grid where **adjacent cells differ in exactly one variable** — the same property as Gray code. When two adjacent cells both contain a 1, they can be combined into a single product term that eliminates the differing variable. This is just the absorption/complement law made visual:

$$AB + A\\bar{B} = A(B + \\bar{B}) = A$$

In the K-map this appears as two adjacent 1-cells in the A=1 row — you circle them and read off A (the variable that doesn't change).

**The K-map rules**:
1. Fill the map from the truth table — one cell per minterm.
2. Group adjacent 1-cells into rectangles of size 1, 2, 4, 8, or 16 (powers of 2 only).
3. Groups must be as large as possible. Cells can be reused across multiple groups.
4. Groups wrap around edges (top wraps to bottom, left wraps to right).
5. For each group, read off the variables that are **constant** across all cells in the group — those form the product term.
6. OR all group terms together for the final SOP expression.

The result is the **minimal SOP expression** — the fewest gates possible for a two-level AND-OR implementation.`,
    },

    // ── Visual 1 — 2-variable K-map ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### 2-variable K-map

A 2×2 K-map for variables A and B. Click cells to toggle between 0 and 1. Pairs of adjacent 1-cells automatically highlight and the simplified expression appears. Notice: every pair of adjacent cells differs in exactly one variable.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
    <div>
      <canvas id="cv2" width="220" height="220"></canvas>
      <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
        <button class="pre-btn" onclick="setPreset2([0,0,0,0])">All 0</button>
        <button class="pre-btn" onclick="setPreset2([1,1,1,1])">All 1</button>
        <button class="pre-btn" onclick="setPreset2([0,1,1,0])">XOR</button>
        <button class="pre-btn" onclick="setPreset2([0,0,0,1])">AND</button>
        <button class="pre-btn" onclick="setPreset2([0,1,1,1])">OR</button>
      </div>
    </div>
    <div style="flex:1;min-width:180px">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Groups found</div>
      <div id="groups2" style="font-size:13px;line-height:2;min-height:40px"></div>
      <div style="margin-top:10px;padding:10px 14px;border-radius:8px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2)">
        <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:4px">Minimal SOP</div>
        <div id="sop2" style="font-size:16px;font-weight:700;color:#818cf8;min-height:22px"></div>
      </div>
      <div id="note2" style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.6"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;cursor:pointer}
.pre-btn{padding:4px 10px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;cursor:pointer}
.pre-btn:hover{background:rgba(255,255,255,0.06)}`,
      startCode: `
// 2-var K-map: indices [AB=00, AB=01, AB=10, AB=11] → cells [0,1,2,3]
// Layout: row = A (0=top,1=bottom), col = B (0=left,1=right)
// Cell order: (A=0,B=0)=0, (A=0,B=1)=1, (A=1,B=0)=2, (A=1,B=1)=3
var cells2=[0,1,1,0];
var canvas2=document.getElementById('cv2');
var ctx2=canvas2.getContext('2d');

// Group colors
var GRP_COLORS=['#818cf8','#4ade80','#f472b6','#fbbf24'];

function getGroups2(c){
  // Returns list of {cells:[indices], term:string, color}
  var groups=[];
  var used=[false,false,false,false];
  // Check quad (all 1s)
  if(c[0]&&c[1]&&c[2]&&c[3]){
    return [{cells:[0,1,2,3],term:'1',color:GRP_COLORS[0]}];
  }
  // Check pairs: horizontal (same row), vertical (same col), wrap
  var pairs=[
    {cells:[0,1],term:'Ā'},   // top row → A=0
    {cells:[2,3],term:'A'},    // bottom row → A=1
    {cells:[0,2],term:'B\u0305'},  // left col → B=0
    {cells:[1,3],term:'B'},    // right col → B=1
  ];
  pairs.forEach(function(p){
    if(c[p.cells[0]]&&c[p.cells[1]]){
      groups.push(Object.assign({},p,{color:GRP_COLORS[groups.length%4]}));
      p.cells.forEach(function(i){used[i]=true;});
    }
  });
  // Singletons
  [0,1,2,3].forEach(function(i){
    if(c[i]&&!used[i]){
      var r=Math.floor(i/2), col2=i%2;
      var term=(r?'A':'Ā')+(col2?'B':'B\u0305');
      groups.push({cells:[i],term:term,color:GRP_COLORS[groups.length%4]});
    }
  });
  return groups;
}

function draw2(){
  var W=canvas2.width,H=canvas2.height;
  ctx2.clearRect(0,0,W,H); ctx2.fillStyle='#0a0f1e'; ctx2.fillRect(0,0,W,H);

  var ox=50,oy=50,cw=80,ch=80;
  var groups=getGroups2(cells2);

  // Variable labels
  ctx2.fillStyle='rgba(255,255,255,0.5)'; ctx2.font='bold 12px monospace'; ctx2.textAlign='center';
  ctx2.fillText('B=0',ox+cw/2,oy-18);
  ctx2.fillText('B=1',ox+cw+cw/2,oy-18);
  ctx2.textAlign='right';
  ctx2.fillText('A=0',ox-8,oy+ch/2+4);
  ctx2.fillText('A=1',ox-8,oy+ch+ch/2+4);
  ctx2.font='bold 11px monospace'; ctx2.fillStyle='rgba(255,255,255,0.25)';ctx2.textAlign='left';
  ctx2.fillText('B →',ox,oy-32); ctx2.fillText('A ↓',2,oy-14);

  // Draw group highlights (before cells)
  groups.forEach(function(g,gi){
    ctx2.fillStyle=g.color+'22';
    ctx2.strokeStyle=g.color+'88'; ctx2.lineWidth=2;
    if(g.cells.length===4){
      ctx2.beginPath(); ctx2.roundRect(ox+2,oy+2,cw*2-4,ch*2-4,8); ctx2.fill(); ctx2.stroke();
    } else if(g.cells.length===2){
      var r0=Math.floor(g.cells[0]/2),c0=g.cells[0]%2;
      var r1=Math.floor(g.cells[1]/2),c1=g.cells[1]%2;
      if(r0===r1){ // horizontal
        ctx2.beginPath(); ctx2.roundRect(ox+2,oy+r0*ch+2,cw*2-4,ch-4,8); ctx2.fill(); ctx2.stroke();
      } else { // vertical
        ctx2.beginPath(); ctx2.roundRect(ox+c0*cw+2,oy+2,cw-4,ch*2-4,8); ctx2.fill(); ctx2.stroke();
      }
    } else {
      var ri=Math.floor(g.cells[0]/2),ci2=g.cells[0]%2;
      ctx2.beginPath(); ctx2.roundRect(ox+ci2*cw+4,oy+ri*ch+4,cw-8,ch-8,6); ctx2.fill(); ctx2.stroke();
    }
  });

  // Cells
  for(var r=0;r<2;r++) for(var col=0;col<2;col++){
    var idx=r*2+col;
    var x=ox+col*cw, y=oy+r*ch;
    ctx2.fillStyle=cells2[idx]?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.3)';
    ctx2.strokeStyle='rgba(255,255,255,0.12)'; ctx2.lineWidth=1;
    ctx2.beginPath(); ctx2.rect(x,y,cw,ch); ctx2.fill(); ctx2.stroke();
    ctx2.fillStyle=cells2[idx]?'#e2e8f0':'rgba(255,255,255,0.2)';
    ctx2.font='bold 26px monospace'; ctx2.textAlign='center';
    ctx2.fillText(cells2[idx],x+cw/2,y+ch/2+10);
    ctx2.fillStyle='rgba(255,255,255,0.15)'; ctx2.font='9px monospace';
    ctx2.fillText('m'+idx,x+cw-18,y+14);
  }

  // Update groups panel
  var grpDiv=document.getElementById('groups2');
  if(groups.length===0){grpDiv.innerHTML='<span style="color:rgba(255,255,255,0.2)">No 1-cells — F = 0</span>';}
  else{grpDiv.innerHTML=groups.map(function(g){return '<span style="color:'+g.color+'">● '+g.term+' (cells '+g.cells.join(',')+')</span>';}).join('<br>');}

  var allZero=cells2.every(function(v){return!v;});
  var allOne=cells2.every(function(v){return v;});
  var sop=allZero?'0':allOne?'1':groups.map(function(g){return g.term;}).join(' + ');
  document.getElementById('sop2').textContent='F = '+sop;

  var ones=cells2.filter(Boolean).length;
  document.getElementById('note2').textContent=
    ones+' one'+(ones!==1?'s':'')+', '+(4-ones)+' zero'+(4-ones!==1?'s':'')+
    '. Groups of '+groups.map(function(g){return g.cells.length;}).join(', ')+'.';
}

canvas2.onclick=function(e){
  var rect=canvas2.getBoundingClientRect();
  var mx=(e.clientX-rect.left)*(canvas2.width/rect.width);
  var my=(e.clientY-rect.top)*(canvas2.height/rect.height);
  var ox=50,oy=50,cw=80,ch=80;
  var col=Math.floor((mx-ox)/cw), row=Math.floor((my-oy)/ch);
  if(col>=0&&col<2&&row>=0&&row<2){cells2[row*2+col]^=1; draw2();}
};

window.setPreset2=function(v){cells2=v.slice();draw2();};
draw2();`,
      outputHeight: 380,
    },

    // ── Challenge 1 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `On a 2-variable K-map, cells m0 (A=0,B=0) and m2 (A=1,B=0) both contain 1. What product term do they produce when grouped?`,
      options: [
        { label: 'A', text: 'AB — both variables must be present since two cells are used' },
        { label: 'B', text: 'B̄ — both cells have B=0; A varies, so A is eliminated' },
        { label: 'C', text: 'Ā — both cells are in the A=0 region' },
        { label: 'D', text: 'A+B̄ — OR of the two changing variables' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. m0 has A=0,B=0 and m2 has A=1,B=0. B is constant at 0 in both cells. A changes (0→1) so A is eliminated. The product term is B̄ — the only variable that stays constant. This group of 2 saves one variable compared to writing both minterms ĀB̄ + AB̄.',
      failMessage: 'Compare the two cells: m0=(A=0,B=0) and m2=(A=1,B=0). B=0 in both cells — B is constant. A=0 in one cell and A=1 in the other — A varies and is eliminated. The term keeps only the constant variable: B=0 → B̄.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 2 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### 3-Variable K-maps

With three variables (A, B, C) the K-map becomes a 2×4 grid. The rows represent one variable (A) and the columns represent the two-variable Gray code ordering: 00, 01, 11, 10.

The column ordering **must** follow Gray code — this is what guarantees adjacency. The columns for BC=01 and BC=11 are adjacent (differ only in B). The columns for BC=10 and BC=00 are also adjacent (wrap-around — the rightmost column is adjacent to the leftmost). This wrapping is not intuitive but is essential.

**Groups in a 3-variable K-map**:
- **Size 1**: one cell — 3-variable product term (all three variables present)
- **Size 2**: two adjacent cells — 2-variable product term (one variable eliminated)
- **Size 4**: four adjacent cells — 1-variable product term (two variables eliminated)
- **Size 8**: all 8 cells — F = 1 (all variables eliminated)

**The prime implicant rule**: always form the largest possible groups. A smaller group that is completely covered by a larger group is never used. Every 1-cell must be covered by at least one group, but groups can overlap.

**Essential prime implicants**: a prime implicant is essential if it is the only group covering at least one 1-cell. Essential prime implicants must be in the final expression. Non-essential prime implicants are selected only if needed to cover remaining 1-cells.`,
    },

    // ── Visual 2 — 3-variable K-map interactive ────────────────────────────────
    {
      type: 'js',
      instruction: `### 3-variable K-map

Click cells to set 1s. Groups form automatically and the minimal SOP expression updates. Try the presets to see how different functions look on the map — notice how wrap-around groups work.`,
      html: `<div style="padding:14px">
  <div style="margin-bottom:10px;display:flex;gap:6px;flex-wrap:wrap">
    <button class="pre-btn" onclick="setPreset3([0,0,0,1,0,1,1,1])">Majority</button>
    <button class="pre-btn" onclick="setPreset3([0,1,1,1,1,1,1,1])">OR(A,B,C)</button>
    <button class="pre-btn" onclick="setPreset3([1,0,0,1,1,0,0,1])">XNOR(A,B)</button>
    <button class="pre-btn" onclick="setPreset3([0,1,0,1,0,1,0,1])">C only</button>
    <button class="pre-btn" onclick="setPreset3([1,1,0,0,1,1,0,0])">Ā</button>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <div>
      <canvas id="cv3" width="360" height="200"></canvas>
      <div id="note3" style="margin-top:6px;font-size:11px;color:rgba(255,255,255,0.3)"></div>
    </div>
    <div style="flex:1;min-width:180px">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Groups</div>
      <div id="groups3" style="font-size:12px;line-height:2;min-height:40px"></div>
      <div style="margin-top:10px;padding:10px 14px;border-radius:8px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2)">
        <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:4px">Minimal SOP</div>
        <div id="sop3" style="font-size:15px;font-weight:700;color:#818cf8;min-height:22px;line-height:1.7"></div>
      </div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;cursor:pointer}
.pre-btn{padding:4px 10px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;cursor:pointer}
.pre-btn:hover{background:rgba(255,255,255,0.06)}`,
      startCode: `
// 3-var K-map
// Rows: A=0 (top), A=1 (bottom)
// Cols: BC = 00,01,11,10  (Gray code)
// Cell index: row*4+colIdx, colIdx=0,1,2,3 for BC=00,01,11,10
// Minterm numbers: BC=00→m=0,m=4; BC=01→m=1,m=5; BC=11→m=3,m=7; BC=10→m=2,m=6
// colIdx to BC: 0→00,1→01,2→11,3→10
// minterm from (rowA, colBC): A*4 + (colIdx===0?0:colIdx===1?1:colIdx===2?3:2)

var COLS_BC=[0,1,3,2]; // BC values for col 0,1,2,3
var cells3=[0,0,0,1,0,1,1,1]; // indexed by minterm number 0-7
var canvas3=document.getElementById('cv3');
var ctx3=canvas3.getContext('2d');
var GC=['#818cf8','#4ade80','#f472b6','#fbbf24','#38bdf8','#fb923c'];

function cellToMinterm(row,col){ return row*4+COLS_BC[col]; }
function mintermToCell(m){ var row=m>>2; var bc=m&3; var col=COLS_BC.indexOf(bc); return {row:row,col:col}; }

// Simple greedy grouper for 3-var map
function getGroups3(c){
  // Adjacency: (row,col) neighbors include wrap-around col 3↔0
  function adj(r1,co1,r2,co2){
    var dr=Math.abs(r1-r2); var dc=(co2-co1+4)%4;
    return (dr===0&&(dc===1||dc===3))||(dr===1&&co1===co2)||(dr===0&&dc===0&&r1!==r2);
  }
  var ones=[];
  for(var m=0;m<8;m++) if(c[m]) ones.push(m);
  if(ones.length===0) return [];
  if(ones.length===8) return [{cells:[0,1,2,3,4,5,6,7],term:'1',color:GC[0],size:8}];

  var groups=[];
  var covered=new Array(8).fill(false);

  // Check groups of 4
  var quads=[
    {cells:[0,1,4,5],term:'B\u0305'},   // BC=00,01 cols → B=0 both rows
    {cells:[2,3,6,7],term:'B'},           // BC=10,11 → B=1
    {cells:[0,2,4,6],term:'C\u0305'},   // BC=00,10 → C=0
    {cells:[1,3,5,7],term:'C'},           // BC=01,11 → C=1
    {cells:[0,4,1,5],term:'B\u0305'},   // same as first (already covered)
    {cells:[4,5,6,7],term:'A'},           // bottom row
    {cells:[0,1,2,3],term:'Ā'},          // top row
  ];
  // dedup
  var seenQuads={};
  quads.forEach(function(q){
    var key=q.cells.slice().sort().join(',');
    if(!seenQuads[key]&&q.cells.every(function(m){return c[m];})){
      seenQuads[key]=true;
      groups.push(Object.assign({},q,{size:4,color:GC[groups.length%GC.length]}));
      q.cells.forEach(function(m){covered[m]=true;});
    }
  });

  // Pairs
  var pairsSpec=[
    // Horizontal pairs (same row, adjacent cols including wrap)
    {cells:[0,1],term:'ĀC\u0305'},{cells:[1,3],term:'ĀB'},{cells:[3,2],term:'ĀC'},{cells:[2,0],term:'ĀB\u0305'},
    {cells:[4,5],term:'AC\u0305'},{cells:[5,7],term:'AB'},{cells:[7,6],term:'AC'},{cells:[6,4],term:'AB\u0305'},
    // Vertical pairs (same col, rows 0-1)
    {cells:[0,4],term:'B\u0305C\u0305'},{cells:[1,5],term:'B\u0305C'},{cells:[3,7],term:'BC'},{cells:[2,6],term:'BC\u0305'},
    // Wrap horizontal pairs (col 0 & col 3 adjacent)
    {cells:[0,2],term:'ĀC\u0305'},{cells:[4,6],term:'AC\u0305'},
  ];
  var seenPairs={};
  pairsSpec.forEach(function(p){
    var key=p.cells.slice().sort().join(',');
    if(!seenPairs[key]&&p.cells.every(function(m){return c[m]&&!covered[m];})){
      seenPairs[key]=true;
      groups.push(Object.assign({},p,{size:2,color:GC[groups.length%GC.length]}));
      p.cells.forEach(function(m){covered[m]=true;});
    }
  });

  // Singletons
  ones.forEach(function(m){
    if(!covered[m]){
      var row=m>>2; var bc=m&3;
      var A=row?'A':'Ā'; var B=(bc&2)?'B':'B\u0305'; var C=(bc&1)?'C':'C\u0305';
      groups.push({cells:[m],term:A+B+C,size:1,color:GC[groups.length%GC.length]});
    }
  });
  return groups;
}

function draw3(){
  var W=canvas3.width,H=canvas3.height;
  ctx3.clearRect(0,0,W,H); ctx3.fillStyle='#0a0f1e'; ctx3.fillRect(0,0,W,H);

  var ox=56,oy=44,cw=68,ch=70;
  var groups=getGroups3(cells3);

  // Labels
  ctx3.fillStyle='rgba(255,255,255,0.5)'; ctx3.font='bold 11px monospace'; ctx3.textAlign='center';
  ['BC=00','BC=01','BC=11','BC=10'].forEach(function(lbl,i){ctx3.fillText(lbl,ox+i*cw+cw/2,oy-22);});
  ctx3.textAlign='right'; ctx3.font='bold 11px monospace';
  ctx3.fillText('A=0',ox-8,oy+ch/2+4); ctx3.fillText('A=1',ox-8,oy+ch+ch/2+4);
  ctx3.fillStyle='rgba(255,255,255,0.2)'; ctx3.font='10px monospace'; ctx3.textAlign='left';
  ctx3.fillText('BC →',2,oy-22); ctx3.fillText('A ↓',2,oy-8);

  // Group highlights
  groups.forEach(function(g){
    var cells=g.cells.map(function(m){return mintermToCell(m);});
    ctx3.fillStyle=g.color+'1A'; ctx3.strokeStyle=g.color+'66'; ctx3.lineWidth=2;
    if(g.size===8){
      ctx3.beginPath();ctx3.roundRect(ox+2,oy+2,cw*4-4,ch*2-4,8);ctx3.fill();ctx3.stroke();
    } else if(g.size===4){
      // Could be a row or a column
      var rows=cells.map(function(c2){return c2.row;}); var cols=cells.map(function(c2){return c2.col;});
      var minR=Math.min.apply(null,rows), maxR=Math.max.apply(null,rows);
      var minC=Math.min.apply(null,cols), maxC=Math.max.apply(null,cols);
      // wrap detection for column groups
      if(maxC-minC===3&&cols.indexOf(0)>=0&&cols.indexOf(3)>=0){
        // wrap-around col group — draw two rects
        ctx3.beginPath();ctx3.roundRect(ox+3*cw+2,oy+2,cw-4,ch*2-4,6);ctx3.fill();ctx3.stroke();
        ctx3.beginPath();ctx3.roundRect(ox+2,oy+2,cw-4,ch*2-4,6);ctx3.fill();ctx3.stroke();
      } else {
        ctx3.beginPath();ctx3.roundRect(ox+minC*cw+2,oy+minR*ch+2,(maxC-minC+1)*cw-4,(maxR-minR+1)*ch-4,8);ctx3.fill();ctx3.stroke();
      }
    } else if(g.size===2){
      cells.forEach(function(ci){
        ctx3.beginPath();ctx3.roundRect(ox+ci.col*cw+3,oy+ci.row*ch+3,cw-6,ch-6,6);ctx3.fill();
      });
      // Connect them
      if(cells[0].row===cells[1].row){ // horizontal
        var minco=Math.min(cells[0].col,cells[1].col),maxco=Math.max(cells[0].col,cells[1].col);
        if(maxco-minco===1){
          ctx3.beginPath();ctx3.roundRect(ox+minco*cw+3,oy+cells[0].row*ch+3,(maxco-minco+1)*cw-6,ch-6,6);ctx3.fill();ctx3.stroke();
        } else {
          // wrap
          ctx3.stroke();
        }
      } else {
        ctx3.beginPath();ctx3.roundRect(ox+cells[0].col*cw+3,oy+Math.min(cells[0].row,cells[1].row)*ch+3,cw-6,ch*2-6,6);ctx3.fill();ctx3.stroke();
      }
    } else {
      ctx3.beginPath();ctx3.roundRect(ox+cells[0].col*cw+4,oy+cells[0].row*ch+4,cw-8,ch-8,6);ctx3.fill();ctx3.stroke();
    }
  });

  // Draw cells
  for(var row=0;row<2;row++) for(var col=0;col<4;col++){
    var m=cellToMinterm(row,col);
    var x=ox+col*cw, y=oy+row*ch;
    ctx3.fillStyle=cells3[m]?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.25)';
    ctx3.strokeStyle='rgba(255,255,255,0.1)'; ctx3.lineWidth=1;
    ctx3.beginPath();ctx3.rect(x,y,cw,ch);ctx3.fill();ctx3.stroke();
    ctx3.fillStyle=cells3[m]?'#e2e8f0':'rgba(255,255,255,0.18)';
    ctx3.font='bold 22px monospace'; ctx3.textAlign='center';
    ctx3.fillText(cells3[m],x+cw/2,y+ch/2+8);
    ctx3.fillStyle='rgba(255,255,255,0.15)'; ctx3.font='9px monospace';
    ctx3.fillText('m'+m,x+cw-22,y+14);
  }

  // Groups panel
  var gd=document.getElementById('groups3');
  if(groups.length===0) gd.innerHTML='<span style="color:rgba(255,255,255,0.2)">No 1s — F=0</span>';
  else gd.innerHTML=groups.map(function(g){
    return '<span style="color:'+g.color+'">● '+g.term+' (size '+g.size+')</span>';
  }).join('<br>');

  var allZ=cells3.every(function(v){return!v;});
  var allO=cells3.every(function(v){return v;});
  document.getElementById('sop3').textContent='F = '+(allZ?'0':allO?'1':groups.map(function(g){return g.term;}).join(' + '));
  document.getElementById('note3').textContent='Click any cell to toggle. Gray-code column order ensures adjacency.';
}

canvas3.onclick=function(e){
  var rect=canvas3.getBoundingClientRect();
  var mx=(e.clientX-rect.left)*(canvas3.width/rect.width);
  var my=(e.clientY-rect.top)*(canvas3.height/rect.height);
  var ox=56,oy=44,cw=68,ch=70;
  var col=Math.floor((mx-ox)/cw), row=Math.floor((my-oy)/ch);
  if(col>=0&&col<4&&row>=0&&row<2){
    var m=cellToMinterm(row,col); cells3[m]^=1; draw3();
  }
};
window.setPreset3=function(v){cells3=v.slice();draw3();};
draw3();`,
      outputHeight: 400,
    },

    // ── Challenge 2 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `On a 3-variable K-map, the following cells contain 1: m1 (A=0,BC=01), m3 (A=0,BC=11), m5 (A=1,BC=01), m7 (A=1,BC=11). These four cells form one group. What is the product term?`,
      options: [
        { label: 'A', text: 'BC — the group covers all values of A, and B=1,C=1 throughout' },
        { label: 'B', text: 'AC — A and C are both 1 in all four cells' },
        { label: 'C', text: 'B — only B is constant across all four cells' },
        { label: 'D', text: 'ABC — all three variables must appear in a group of 4' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Check each variable: A takes both 0 and 1 → eliminated. B=1 in all four cells (BC=01 and BC=11 both have B=1) → kept as B. C=1 in all four cells (BC=01 and BC=11 both have C=1) → kept as C. Product term: BC. A group of 4 eliminates one variable, leaving a 2-variable term.',
      failMessage: 'For each variable, check if it is constant across all four cells. A: 0 in m1,m3 and 1 in m5,m7 → varies → eliminated. B: BC=01 has B=1, BC=11 has B=1 → constant at 1 → kept. C: BC=01 has C=1, BC=11 has C=1 → constant at 1 → kept. Term: BC.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### 4-Variable K-maps

With four variables (A, B, C, D) the K-map is a 4×4 grid — 16 cells. The rows follow the Gray code AB = 00, 01, 11, 10 and the columns follow CD = 00, 01, 11, 10.

All four edges wrap around: top↔bottom, left↔right, and crucially the **four corners wrap together** — the top-left, top-right, bottom-left, and bottom-right cells all form a valid group of 4.

**Group sizes and terms eliminated**:
- Size 1 → 4-variable term (0 eliminated)
- Size 2 → 3-variable term (1 eliminated)
- Size 4 → 2-variable term (2 eliminated)
- Size 8 → 1-variable term (3 eliminated)
- Size 16 → F = 1 (all eliminated)

**The systematic approach** for a 4-variable K-map:
1. Plot all 1-cells from the truth table (or minterm list).
2. Identify all prime implicants — the largest possible groups.
3. Mark essential prime implicants — those covering at least one cell no other group covers.
4. Select additional non-essential prime implicants to cover any remaining uncovered 1-cells, choosing the largest available.
5. Write the SOP expression: one term per selected group.

**Don't-care conditions** (marked as X): some input combinations never occur (e.g. invalid BCD patterns) or the output is irrelevant. X-cells can be included in groups as 1s or ignored as 0s — whichever makes larger groups possible.`,
    },

    // ── Visual 3 — 4-variable K-map ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### 4-variable K-map

Click cells to toggle 0/1/X (don't-care). The K-map finder identifies prime implicants and shows the minimal SOP. Use the presets to explore classic 4-variable functions.`,
      html: `<div style="padding:14px">
  <div style="margin-bottom:10px;display:flex;gap:6px;flex-wrap:wrap">
    <button class="pre-btn" onclick="setPreset4('and4'  )">ABCD</button>
    <button class="pre-btn" onclick="setPreset4('corners')">4 corners</button>
    <button class="pre-btn" onclick="setPreset4('col0')">CD=00 col</button>
    <button class="pre-btn" onclick="setPreset4('bcd')">Invalid BCD X</button>
    <button class="pre-btn" onclick="setPreset4('all1')">All ones</button>
  </div>
  <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
    <div>
      <canvas id="cv4" width="340" height="280"></canvas>
      <div style="margin-top:6px;font-size:10px;color:rgba(255,255,255,0.25)">Click: 0→1→X→0. X = don't-care.</div>
    </div>
    <div style="flex:1;min-width:180px">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Prime implicants</div>
      <div id="groups4" style="font-size:12px;line-height:1.9;min-height:40px"></div>
      <div style="margin-top:10px;padding:10px 14px;border-radius:8px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2)">
        <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:4px">Minimal SOP</div>
        <div id="sop4" style="font-size:14px;font-weight:700;color:#818cf8;min-height:22px;line-height:1.7"></div>
      </div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;cursor:pointer}
.pre-btn{padding:4px 10px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;cursor:pointer}
.pre-btn:hover{background:rgba(255,255,255,0.06)}`,
      startCode: `
// 4-var K-map: 16 cells, indexed by minterm 0-15
// Rows: AB Gray code: 00=row0,01=row1,11=row2,10=row3
// Cols: CD Gray code: 00=col0,01=col1,11=col2,10=col3
var ROWS_AB=[0,1,3,2]; // AB values for row 0,1,2,3
var COLS_CD=[0,1,3,2]; // CD values for col 0,1,2,3
// 0=zero,1=one,2=don't-care
var cells4=new Array(16).fill(0);
cells4[15]=1; // ABCD

var canvas4=document.getElementById('cv4');
var ctx4=canvas4.getContext('2d');
var GC4=['#818cf8','#4ade80','#f472b6','#fbbf24','#38bdf8','#fb923c','#a78bfa','#86efac'];

function mToRC(m){
  var AB=m>>2, CD=m&3;
  var row=ROWS_AB.indexOf(AB), col=COLS_CD.indexOf(CD);
  return {row:row,col:col};
}
function rcToM(row,col){ return (ROWS_AB[row]<<2)|COLS_CD[col]; }

// Simplified prime implicant finder
function getPIs4(c){
  var pis=[];
  var covered=new Array(16).fill(false);

  // Groups of 16
  if([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].every(function(m){return c[m]>=1;})){
    return [{cells:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],term:'1',size:16,color:GC4[0]}];
  }

  // Pre-defined groups of 8 (half the map)
  var g8=[
    {cells:[0,1,2,3,4,5,6,7],term:'Ā'},  // AB=00,01 rows
    {cells:[4,5,6,7,8,9,10,11],term:'B'}, // AB=01,11
    {cells:[8,9,10,11,12,13,14,15],term:'A'}, // AB=11,10
    {cells:[0,1,2,3,12,13,14,15],term:'B\u0305'}, // AB=00,10 (wrap)
    {cells:[0,1,4,5,8,9,12,13],term:'D\u0305'}, // CD=00,01 cols -- wait
    // Actually easier: cols
    {cells:[0,4,8,12,1,5,9,13],term:'C\u0305'}, // CD=00,01 → C=0
    {cells:[2,6,10,14,3,7,11,15],term:'C'},     // CD=10,11 → C=1
    {cells:[1,5,9,13,3,7,11,15],term:'D'},       // CD=01,11 → D=1
    {cells:[0,4,8,12,2,6,10,14],term:'D\u0305'}, // CD=00,10 → D=0
  ];
  g8.forEach(function(g){
    var key=g.cells.slice().sort().join(',');
    if(g.cells.every(function(m){return c[m]>=1;})){
      pis.push(Object.assign({},g,{size:8,color:GC4[pis.length%GC4.length]}));
      g.cells.forEach(function(m){covered[m]=covered[m]||c[m]===1;});
    }
  });

  // Groups of 4 — rows, cols, 2x2 blocks, wrap
  var g4=[
    // Full rows
    {cells:[0,1,2,3],  term:'ĀB\u0305'}, {cells:[4,5,6,7],term:'ĀB'},
    {cells:[8,9,10,11],term:'AB'},       {cells:[12,13,14,15],term:'AB\u0305'},
    // Full cols
    {cells:[0,4,8,12], term:'C\u0305D\u0305'},{cells:[1,5,9,13],term:'C\u0305D'},
    {cells:[2,6,10,14],term:'CD\u0305'}, {cells:[3,7,11,15],term:'CD'},
    // 2×2 blocks
    {cells:[0,1,4,5],  term:'ĀC\u0305'},{cells:[1,2,5,6],term:'ĀC'}, // hmm need recalc
    {cells:[4,5,8,9],  term:'BC\u0305'},{cells:[5,6,9,10],term:'BC'},
    {cells:[8,9,12,13],term:'AB\u0305\u2020'},{cells:[0,1,12,13],term:'B\u0305C\u0305'},
    // wrap rows
    {cells:[0,4,8,12].concat([]), term:''},// placeholder
    // Corners
    {cells:[0,2,8,10], term:'B\u0305D\u0305'}, // wrap
    {cells:[1,3,9,11], term:'B\u0305D'},
    {cells:[4,6,12,14],term:'BD\u0305'},
    {cells:[5,7,13,15],term:'BD'},
    // row wrap (top+bottom)
    {cells:[0,1,2,3,12,13,14,15].slice(0,4), term:''}, // handled by g8
  ];

  // Simpler: enumerate all valid 4-cell groups properly
  var valid4=[
    // 1×4 rows
    [0,1,3,2],[4,5,7,6],[12,13,15,14],[8,9,11,10],
    // 1×4 cols
    [0,4,12,8],[1,5,13,9],[3,7,15,11],[2,6,14,10],
    // 2×2 in-grid
    [0,1,4,5],[1,3,5,7],[3,2,7,6],[2,0,6,4],
    [4,5,8,9],[5,7,9,11],[7,6,11,10],[6,4,10,8],
    [8,9,12,13],[9,11,13,15],[11,10,15,14],[10,8,14,12],
    // wrap top-bottom
    [0,1,12,13],[1,3,13,15],[3,2,15,14],[2,0,14,12],
    // corners
    [0,2,8,10],[1,3,9,11],[4,6,12,14],[5,7,13,15],
  ];

  // Generate terms for each valid4 group
  function termFor(ms){
    var As=ms.map(function(m){return(m>>3)&1;}),
        Bs=ms.map(function(m){return(m>>2)&1;}),
        Cs=ms.map(function(m){return(m>>1)&1;}),
        Ds=ms.map(function(m){return m&1;});
    function part(vals,name){
      var allZ=vals.every(function(v){return v===0;});
      var allO=vals.every(function(v){return v===1;});
      if(allZ) return name+'\u0305'; if(allO) return name; return '';
    }
    return (part(As,'A')+part(Bs,'B')+part(Cs,'C')+part(Ds,'D'))||'1';
  }

  var used4={};
  valid4.forEach(function(g){
    var key=g.slice().sort().join(',');
    if(used4[key]) return; used4[key]=true;
    if(g.every(function(m){return c[m]>=1;})){
      var t=termFor(g);
      pis.push({cells:g,term:t,size:4,color:GC4[pis.length%GC4.length]});
      g.forEach(function(m){if(c[m]===1)covered[m]=true;});
    }
  });

  // Pairs
  var valid2=[];
  for(var r=0;r<4;r++) for(var co=0;co<4;co++){
    var m=rcToM(r,co);
    [[r,(co+1)%4],[( r+1)%4,co]].forEach(function(nb){
      var m2=rcToM(nb[0],nb[1]);
      var key=[m,m2].sort().join(',');
      valid2.push({cells:[m,m2],key:key});
    });
  }
  var used2={};
  valid2.forEach(function(p){
    if(used2[p.key]) return; used2[p.key]=true;
    if(p.cells.every(function(m){return c[m]>=1&&!covered[m];})){
      var t=termFor(p.cells);
      pis.push({cells:p.cells,term:t,size:2,color:GC4[pis.length%GC4.length]});
      p.cells.forEach(function(m){if(c[m]===1)covered[m]=true;});
    }
  });

  // Singletons
  for(var m2=0;m2<16;m2++){
    if(c[m2]===1&&!covered[m2]){
      var t2=termFor([m2]);
      pis.push({cells:[m2],term:t2,size:1,color:GC4[pis.length%GC4.length]});
    }
  }
  return pis;
}

function draw4(){
  var W=canvas4.width,H=canvas4.height;
  ctx4.clearRect(0,0,W,H); ctx4.fillStyle='#0a0f1e'; ctx4.fillRect(0,0,W,H);

  var ox=56,oy=52,cw=68,ch=54;
  var pis=getPIs4(cells4);

  // Labels
  ctx4.fillStyle='rgba(255,255,255,0.45)'; ctx4.font='bold 11px monospace'; ctx4.textAlign='center';
  ['CD=00','CD=01','CD=11','CD=10'].forEach(function(lbl,i){ctx4.fillText(lbl,ox+i*cw+cw/2,oy-26);});
  ctx4.textAlign='right';
  ['AB=00','AB=01','AB=11','AB=10'].forEach(function(lbl,i){ctx4.fillText(lbl,ox-6,oy+i*ch+ch/2+4);});

  // Group highlights
  pis.forEach(function(g){
    ctx4.fillStyle=g.color+'1A'; ctx4.strokeStyle=g.color+'66'; ctx4.lineWidth=2;
    if(g.size>=8||g.size===16){
      ctx4.beginPath();ctx4.roundRect(ox+2,oy+2,cw*4-4,ch*4-4,8);ctx4.fill();ctx4.stroke();
    } else {
      g.cells.forEach(function(m){
        var rc=mToRC(m);
        ctx4.beginPath();ctx4.roundRect(ox+rc.col*cw+3,oy+rc.row*ch+3,cw-6,ch-6,5);
        ctx4.fill();
      });
      // Try to draw a single rect if contiguous
      var rcs=g.cells.map(mToRC);
      var minR=Math.min.apply(null,rcs.map(function(r){return r.row;}));
      var maxR=Math.max.apply(null,rcs.map(function(r){return r.row;}));
      var minC=Math.min.apply(null,rcs.map(function(r){return r.col;}));
      var maxC=Math.max.apply(null,rcs.map(function(r){return r.col;}));
      if((maxR-minR+1)*(maxC-minC+1)===g.size&&maxR-minR<4&&maxC-minC<4){
        ctx4.beginPath();ctx4.roundRect(ox+minC*cw+2,oy+minR*ch+2,(maxC-minC+1)*cw-4,(maxR-minR+1)*ch-4,8);
        ctx4.fill();ctx4.stroke();
      } else {
        ctx4.stroke();
      }
    }
  });

  // Cells
  for(var row=0;row<4;row++) for(var col=0;col<4;col++){
    var m=rcToM(row,col);
    var v=cells4[m];
    var x=ox+col*cw, y=oy+row*ch;
    ctx4.fillStyle=v===1?'rgba(255,255,255,0.05)':v===2?'rgba(251,191,36,0.06)':'rgba(0,0,0,0.2)';
    ctx4.strokeStyle='rgba(255,255,255,0.08)'; ctx4.lineWidth=1;
    ctx4.beginPath();ctx4.rect(x,y,cw,ch);ctx4.fill();ctx4.stroke();
    ctx4.fillStyle=v===1?'#e2e8f0':v===2?'#fbbf24':'rgba(255,255,255,0.15)';
    ctx4.font='bold 20px monospace'; ctx4.textAlign='center';
    ctx4.fillText(v===2?'X':v,x+cw/2,y+ch/2+8);
    ctx4.fillStyle='rgba(255,255,255,0.12)'; ctx4.font='8px monospace';
    ctx4.fillText('m'+m,x+cw-20,y+12);
  }

  // Groups panel
  var gd=document.getElementById('groups4');
  if(pis.length===0) gd.innerHTML='<span style="color:rgba(255,255,255,0.2)">No 1s — F=0</span>';
  else gd.innerHTML=pis.map(function(g){
    return '<span style="color:'+g.color+'">● '+g.term+' (size '+g.size+')</span>';
  }).join('<br>');

  var has1=cells4.some(function(v){return v===1;});
  var allOne=cells4.every(function(v){return v>=1;});
  document.getElementById('sop4').textContent='F = '+(has1?( allOne?'1':pis.map(function(g){return g.term;}).join(' + ')):'0');
}

canvas4.onclick=function(e){
  var rect=canvas4.getBoundingClientRect();
  var mx=(e.clientX-rect.left)*(canvas4.width/rect.width);
  var my=(e.clientY-rect.top)*(canvas4.height/rect.height);
  var ox=56,oy=52,cw=68,ch=54;
  var col=Math.floor((mx-ox)/cw),row=Math.floor((my-oy)/ch);
  if(col>=0&&col<4&&row>=0&&row<4){
    var m=rcToM(row,col); cells4[m]=(cells4[m]+1)%3; draw4();
  }
};

var PRESETS4={
  and4:   function(){cells4=new Array(16).fill(0);cells4[15]=1;},
  corners:function(){cells4=new Array(16).fill(0);[0,2,8,10].forEach(function(m){cells4[m]=1;});},
  col0:   function(){cells4=new Array(16).fill(0);[0,4,8,12].forEach(function(m){cells4[m]=1;});},
  bcd:    function(){cells4=new Array(16).fill(0);for(var m=0;m<10;m++)cells4[m]=0;for(var m=10;m<16;m++)cells4[m]=2;[2,3,4,5].forEach(function(m){cells4[m]=1;});},
  all1:   function(){cells4=new Array(16).fill(1);},
};
window.setPreset4=function(k){PRESETS4[k]();draw4();};
draw4();`,
      outputHeight: 430,
    },

    // ── Challenge 3 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `On a 4-variable K-map, the four corner cells (m0, m2, m8, m10) all contain 1. What product term do they produce?`,
      options: [
        { label: 'A', text: 'ABCD — all four variables are needed for four corner cells' },
        { label: 'B', text: 'B̄D̄ — B=0 and D=0 in all four corners; A and C vary' },
        { label: 'C', text: 'ĀC̄ — A and C are both 0 in the corners' },
        { label: 'D', text: 'AC — A and C are constant in the corners' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Check each variable in the corners: m0=0000, m2=0010, m8=1000, m10=1010. A: 0,0,1,1 → varies → eliminated. B: 0,0,0,0 → constant at 0 → B̄. C: 0,1,0,1 → varies → eliminated. D: 0,0,0,0 → constant at 0 → D̄. Term: B̄D̄. The four corners form a valid group because of wrap-around adjacency.',
      failMessage: 'The four corners are m0=ABCD=0000, m2=0010, m8=1000, m10=1010. A: varies (0 and 1) → drop. B: always 0 → keep as B̄. C: varies (0 and 1) → drop. D: always 0 → keep as D̄. Term: B̄D̄. The corners form a group because left↔right and top↔bottom both wrap around.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### K-map to Gate Count: Completing the Design Flow

Once you have the minimal SOP expression from the K-map, the rest of the design flow is mechanical.

**Step 1 — K-map → SOP expression**
Group 1-cells, read product terms, write the OR of all groups.

**Step 2 — SOP → Gate circuit**
- Each product term becomes an AND gate (or wire if single literal)
- The OR of all terms becomes an OR gate at the output
- Complement inputs with NOT gates as needed

**Step 3 — SOP → NAND-NAND (optional)**
Replace every AND gate with NAND, replace the OR gate with NAND (De Morgan). Same function, all NAND gates — single-family implementation.

**Example**: K-map gives $F = AB + \\bar{A}C$
- AND1: A, B → AB
- AND2: Ā, C → ĀC
- OR: AB, ĀC → F
- Total: 2 AND gates, 1 NOT gate, 1 OR gate = 4 gates

NAND equivalent:
- NAND1: A, B → $\\overline{AB}$
- NAND2: Ā, C → $\\overline{\\bar{A}C}$
- NAND3: NAND1, NAND2 → $\\overline{\\overline{AB} \\cdot \\overline{\\bar{A}C}} = AB + \\bar{A}C$
- Total: 2 NAND gates + 1 NOT + 1 NAND = 4 gates (same count, but all NAND family)

**Gate count comparison** — why K-map matters:
The canonical SOP (one minterm per 1-row) may have 8 three-variable AND gates and 1 seven-input OR gate. After K-map simplification the same function might need 2 two-input AND gates and 1 two-input OR gate. That is a reduction from ~25 transistors to ~10.`,
    },

    // ── Visual 4 — K-map to circuit ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### From K-map to gates

Enter minterms for a 3-variable function. The K-map groups them, derives the minimal SOP, and draws the AND-OR gate circuit. Compare the canonical (un-simplified) gate count to the minimised count.`,
      html: `<div style="padding:14px">
  <div style="margin-bottom:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <span style="font-size:11px;color:rgba(255,255,255,0.35)">Minterms (click to toggle):</span>
    <div id="mintermBtns" style="display:flex;gap:4px;flex-wrap:wrap"></div>
  </div>
  <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
    <div>
      <div style="font-size:10px;color:rgba(255,255,255,0.25);margin-bottom:4px">K-map</div>
      <canvas id="km" width="260" height="160"></canvas>
    </div>
    <div>
      <div style="font-size:10px;color:rgba(255,255,255,0.25);margin-bottom:4px">AND-OR Circuit</div>
      <canvas id="circ" width="300" height="240"></canvas>
    </div>
  </div>
  <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
    <div style="padding:8px 12px;border-radius:8px;background:rgba(239,68,68,0.08);border:0.5px solid rgba(239,68,68,0.2)">
      <div style="font-size:10px;color:rgba(239,68,68,0.7);margin-bottom:2px">Canonical SOP gates</div>
      <div id="canonical" style="font-size:13px;color:#f87171;font-weight:600"></div>
    </div>
    <div style="padding:8px 12px;border-radius:8px;background:rgba(74,222,128,0.08);border:0.5px solid rgba(74,222,128,0.2)">
      <div style="font-size:10px;color:rgba(74,222,128,0.7);margin-bottom:2px">Minimised SOP gates</div>
      <div id="minimal" style="font-size:13px;color:#4ade80;font-weight:600"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
.m-btn{width:32px;height:32px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.35);font-family:monospace;font-size:12px;cursor:pointer;font-weight:600}
.m-btn.on{border-color:#818cf8;background:rgba(99,102,241,0.2);color:#818cf8}`,
      startCode: `
var minterms3=new Array(8).fill(0);
minterms3[0]=1;minterms3[3]=1;minterms3[5]=1;minterms3[6]=1;minterms3[7]=1;

var ROWS_AB3=[0,1]; // A values for rows
var COLS_BC3=[0,1,3,2]; // BC values for cols

function mToRC3(m){ var A=m>>2,BC=m&3,row=A,col=COLS_BC3.indexOf(BC); return {row:row,col:col}; }

// Reuse grouper from vis2 logic (simplified inline)
function getGroups3v(c){
  var ones=[];for(var i=0;i<8;i++) if(c[i]) ones.push(i);
  if(!ones.length) return [];
  if(ones.length===8) return [{cells:[0,1,2,3,4,5,6,7],term:'1',color:'#818cf8',size:8}];
  var GC=['#818cf8','#4ade80','#f472b6','#fbbf24','#38bdf8','#fb923c'];
  var groups=[],covered=new Array(8).fill(false);
  var quads=[
    {cells:[0,1,2,3],term:'Ā'},{cells:[4,5,6,7],term:'A'},
    {cells:[0,2,4,6],term:'C\u0305'},{cells:[1,3,5,7],term:'C'},
    {cells:[0,1,4,5],term:'B\u0305'},{cells:[2,3,6,7],term:'B'},
  ];
  quads.forEach(function(q){
    var key=q.cells.sort().join(',');
    if(q.cells.every(function(m){return c[m];})){
      groups.push(Object.assign({},q,{size:4,color:GC[groups.length%GC.length]}));
      q.cells.forEach(function(m){covered[m]=true;});
    }
  });
  var pairs=[
    {cells:[0,1],term:'ĀC\u0305'},{cells:[1,3],term:'ĀB'},{cells:[3,2],term:'ĀC'},{cells:[2,0],term:'ĀB\u0305'},
    {cells:[4,5],term:'AC\u0305'},{cells:[5,7],term:'AB'},{cells:[7,6],term:'AC'},{cells:[6,4],term:'AB\u0305'},
    {cells:[0,4],term:'B\u0305C\u0305'},{cells:[1,5],term:'B\u0305C'},{cells:[3,7],term:'BC'},{cells:[2,6],term:'BC\u0305'},
    {cells:[0,2],term:'ĀC\u0305'},{cells:[4,6],term:'AC\u0305'},
  ];
  var seenP={};
  pairs.forEach(function(p){
    var key=p.cells.slice().sort().join(',');
    if(seenP[key]) return; seenP[key]=true;
    if(p.cells.every(function(m){return c[m]&&!covered[m];})){
      groups.push(Object.assign({},p,{size:2,color:GC[groups.length%GC.length]}));
      p.cells.forEach(function(m){covered[m]=true;});
    }
  });
  ones.forEach(function(m){
    if(!covered[m]){
      var A=m>>2,B=(m>>1)&1,C=m&1;
      groups.push({cells:[m],term:(A?'A':'Ā')+(B?'B':'B\u0305')+(C?'C':'C\u0305'),size:1,color:GC[groups.length%GC.length]});
    }
  });
  return groups;
}

var km=document.getElementById('km'),circ=document.getElementById('circ');
var kctx=km.getContext('2d'),cctx=circ.getContext('2d');

function drawKM(){
  var W=km.width,H=km.height;
  kctx.clearRect(0,0,W,H); kctx.fillStyle='#0a0f1e'; kctx.fillRect(0,0,W,H);
  var ox=42,oy=36,cw=52,ch=52;
  var groups=getGroups3v(minterms3);
  // Labels
  kctx.fillStyle='rgba(255,255,255,0.4)'; kctx.font='10px monospace'; kctx.textAlign='center';
  ['00','01','11','10'].forEach(function(l,i){kctx.fillText('BC='+l,ox+i*cw+cw/2,oy-16);});
  kctx.textAlign='right';
  kctx.fillText('A=0',ox-4,oy+ch/2+4); kctx.fillText('A=1',ox-4,oy+ch+ch/2+4);
  // Groups
  groups.forEach(function(g){
    kctx.fillStyle=g.color+'22'; kctx.strokeStyle=g.color+'88'; kctx.lineWidth=1.5;
    if(g.size===8){kctx.beginPath();kctx.roundRect(ox+1,oy+1,cw*4-2,ch*2-2,6);kctx.fill();kctx.stroke();}
    else if(g.size===4){
      var rcs=g.cells.map(mToRC3);
      var minR=Math.min.apply(null,rcs.map(function(r){return r.row;}));
      var maxR=Math.max.apply(null,rcs.map(function(r){return r.row;}));
      var minC=Math.min.apply(null,rcs.map(function(r){return r.col;}));
      var maxC=Math.max.apply(null,rcs.map(function(r){return r.col;}));
      kctx.beginPath();kctx.roundRect(ox+minC*cw+2,oy+minR*ch+2,(maxC-minC+1)*cw-4,(maxR-minR+1)*ch-4,6);kctx.fill();kctx.stroke();
    } else {
      g.cells.forEach(function(m){var rc=mToRC3(m);kctx.beginPath();kctx.roundRect(ox+rc.col*cw+3,oy+rc.row*ch+3,cw-6,ch-6,5);kctx.fill();kctx.stroke();});
    }
  });
  // Cells
  for(var r=0;r<2;r++) for(var c=0;c<4;c++){
    var m=r*4+COLS_BC3[c];
    var x=ox+c*cw,y=oy+r*ch;
    kctx.fillStyle=minterms3[m]?'rgba(255,255,255,0.05)':'#0a0f1e';
    kctx.strokeStyle='rgba(255,255,255,0.1)'; kctx.lineWidth=1;
    kctx.beginPath();kctx.rect(x,y,cw,ch);kctx.fill();kctx.stroke();
    kctx.fillStyle=minterms3[m]?'#e2e8f0':'rgba(255,255,255,0.15)';
    kctx.font='bold 18px monospace'; kctx.textAlign='center';
    kctx.fillText(minterms3[m],x+cw/2,y+ch/2+6);
    kctx.fillStyle='rgba(255,255,255,0.12)'; kctx.font='8px monospace';
    kctx.fillText('m'+m,x+cw-18,y+12);
  }
}

function drawCircuit(groups){
  var W=circ.width,H=circ.height;
  cctx.clearRect(0,0,W,H); cctx.fillStyle='#0a0f1e'; cctx.fillRect(0,0,W,H);
  if(!groups.length){cctx.fillStyle='rgba(255,255,255,0.2)';cctx.font='13px monospace';cctx.textAlign='center';cctx.fillText('F = 0',W/2,H/2);return;}
  if(groups.length===1&&groups[0].term==='1'){cctx.fillStyle='#4ade80';cctx.font='bold 16px monospace';cctx.textAlign='center';cctx.fillText('F = 1 (tie to VCC)',W/2,H/2);return;}

  var terms=groups.filter(function(g){return g.term!=='1';}).map(function(g){return g.term;});
  var n=terms.length;
  var gw=60,gh=36;
  var gateX=80, orX=210;
  var spacing=Math.min(56,(H-20)/Math.max(n,1));
  var startY=H/2-(n-1)*spacing/2;

  // Draw AND gates and wires
  terms.forEach(function(term,i){
    var y=startY+i*spacing;
    var col=groups[i]?groups[i].color:'#818cf8';
    // Gate body
    cctx.fillStyle=col+'22'; cctx.strokeStyle=col; cctx.lineWidth=1.5;
    if(term.length===1){
      // Single literal — just wire
      cctx.strokeStyle=col; cctx.lineWidth=2;
      cctx.beginPath();cctx.moveTo(30,y);cctx.lineTo(orX,y);cctx.stroke();
      cctx.fillStyle=col; cctx.font='bold 12px monospace'; cctx.textAlign='center';
      cctx.fillText(term,gateX,y-6);
    } else {
      // AND gate
      cctx.beginPath();cctx.moveTo(gateX,y-gh/2);cctx.lineTo(gateX+gw/2-4,y-gh/2);
      cctx.arc(gateX+gw/2-4,y,gh/2-0,-Math.PI/2,Math.PI/2);
      cctx.lineTo(gateX,y+gh/2);cctx.closePath();cctx.fill();cctx.stroke();
      // Label inside
      cctx.fillStyle=col; cctx.font='bold 10px monospace'; cctx.textAlign='center';
      cctx.fillText(term,gateX+gw/2,y+4);
      // Input wires
      cctx.strokeStyle=col+'66'; cctx.lineWidth=1;
      var nIn=term.replace(/[ĀB̄C̄]/g,'X').replace(/[ABC]/g,'X').length;
      for(var j=0;j<Math.min(nIn,3);j++){
        var iy=y+(j-(nIn-1)/2)*10;
        cctx.beginPath();cctx.moveTo(20,iy);cctx.lineTo(gateX,iy);cctx.stroke();
      }
      // Output wire
      cctx.strokeStyle=col; cctx.lineWidth=1.5;
      cctx.beginPath();cctx.moveTo(gateX+gw-4,y);cctx.lineTo(orX,y);cctx.stroke();
    }
  });

  // OR gate (if multiple terms)
  if(n>1){
    var orY=H/2, orH=Math.min(spacing*n-8,160), orW=64;
    cctx.fillStyle='rgba(124,58,237,0.15)'; cctx.strokeStyle='#7c3aed'; cctx.lineWidth=2;
    cctx.beginPath();
    cctx.moveTo(orX,orY-orH/2);
    cctx.quadraticCurveTo(orX+orW/2-10,orY,orX,orY+orH/2);
    cctx.quadraticCurveTo(orX+orW/2+4,orY+orH/2+10,orX+orW-14,orY);
    cctx.quadraticCurveTo(orX+orW/2+4,orY-orH/2-10,orX,orY-orH/2);
    cctx.fill(); cctx.stroke();
    // OR output
    cctx.strokeStyle='#4ade80'; cctx.lineWidth=2;
    cctx.beginPath();cctx.moveTo(orX+orW-14,orY);cctx.lineTo(W-16,orY);cctx.stroke();
    cctx.fillStyle='#4ade80'; cctx.font='bold 12px monospace'; cctx.textAlign='left';
    cctx.fillText('F',W-12,orY+4);
  } else {
    // Single term — direct output
    cctx.fillStyle='#4ade80'; cctx.font='bold 12px monospace'; cctx.textAlign='left';
    cctx.fillText('F',W-12,H/2+4);
  }
}

function updateStats(groups){
  var ones=minterms3.filter(Boolean).length;
  // Canonical: ones minterms, each with 3-var AND, plus a ones-input OR
  var canonGates=ones>1?ones+1:ones; // N AND gates + 1 OR
  var canonLiterals=ones*3;
  // Minimal: groups
  var minGates=groups.filter(function(g){return g.term.length>1;}).length;
  var minOr=groups.length>1?1:0;
  var totalMin=minGates+minOr;
  document.getElementById('canonical').textContent=ones+' AND gates + OR gate = '+(ones>0?canonGates:0)+' gates, '+canonLiterals+' literals';
  document.getElementById('minimal').textContent=minGates+' AND + '+minOr+' OR = '+totalMin+' gate'+(totalMin!==1?'s':'')+', '+(groups.map(function(g){return g.term.length;}).reduce(function(a,b){return a+b;},0))+' literals';
}

function refresh(){
  var groups=getGroups3v(minterms3);
  drawKM(); drawCircuit(groups); updateStats(groups);
  // Update minterm buttons
  for(var i=0;i<8;i++){
    var btn=document.getElementById('mb'+i);
    if(btn){btn.className='m-btn'+(minterms3[i]?' on':'');}
  }
}

// Build minterm buttons
var mb=document.getElementById('mintermBtns');
for(var i=0;i<8;i++){
  var btn=document.createElement('button');
  btn.id='mb'+i; btn.className='m-btn'+(minterms3[i]?' on':'');
  btn.textContent='m'+i;
  (function(idx){btn.onclick=function(){minterms3[idx]^=1;refresh();};})(i);
  mb.appendChild(btn);
}
refresh();`,
      outputHeight: 500,
    },

    // ── Challenge 4 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 3-variable K-map has 1s at minterms m0, m2, m4, m6 (A=0,B=0,C=0 / A=0,B=1,C=0 / A=1,B=0,C=0 / A=1,B=1,C=0). What is the minimal SOP expression?`,
      options: [
        { label: 'A', text: 'F = ĀB̄C̄ + ĀBC̄ + AB̄C̄ + ABC̄ — canonical SOP, one minterm each' },
        { label: 'B', text: 'F = C̄ — all four cells have C=0; A and B vary completely' },
        { label: 'C', text: 'F = ĀC̄ + AC̄ — two groups of 2' },
        { label: 'D', text: 'F = B̄C̄ + BC̄ — two groups by the B variable' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. All four minterms (m0, m2, m4, m6) have C=0. A takes both 0 and 1; B takes both 0 and 1. The entire left half of the K-map (C=0 column) is a group of 4. Only C is constant → C̄. Minimal SOP: F = C̄. One literal, one wire — no gates needed.',
      failMessage: 'm0=000, m2=010, m4=100, m6=110. Check each variable: A varies (0 and 1) → eliminated. B varies (0 and 1) → eliminated. C=0 in all four → kept as C̄. All four cells form a single group of 4 covering the entire C=0 region. Result: F = C̄.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: Karnaugh Maps

**The K-map** arranges the truth table in a 2D grid where adjacent cells differ in exactly one variable (Gray code ordering). Adjacent 1-cells can be grouped — each group eliminates the differing variable and produces a simpler product term.

**Rules**:
- Groups must be powers of 2 in size: 1, 2, 4, 8, 16
- Always form the largest possible groups
- Cells can be reused across groups
- The map wraps — edges are adjacent, corners form valid groups of 4
- Don't-care (X) cells can be treated as 1 to enlarge groups

**Reading a group**: the product term contains only variables that are **constant** throughout all cells in the group. Variables that change are eliminated.

**Design flow**: Truth table → K-map → group 1-cells → read terms → SOP expression → AND-OR circuit → (optionally) NAND-NAND circuit.

**Gate savings** are significant: a 4-variable function with 8 minterms might need 8 AND gates and 1 OR gate in canonical form. After K-map grouping, it might reduce to 2 AND gates and 1 OR gate — a 3× reduction in gates and a corresponding reduction in propagation delay.

K-maps handle up to 4 variables visually and 5–6 variables with some effort. Beyond 6 variables, software algorithms (Quine-McCluskey, ESPRESSO) automate the minimisation — but they use the same underlying logic as K-maps.`,
    },
  ],
};

export default {
  id: 'df-4-2-karnaugh-maps',
  slug: 'karnaugh-maps',
  chapter: 'df.4',
  order: 2,
  title: 'Karnaugh Maps',
  subtitle: 'A visual method for finding the minimum Sum-of-Products expression from any truth table.',
  tags: ['digital', 'karnaugh-map', 'k-map', 'boolean-simplification', 'SOP', 'prime-implicant', 'dont-care', 'minimisation'],
  hook: {
    question: 'How do you go from a truth table to the fewest possible gates, without pages of algebra — and be sure you got the minimum?',
    realWorldContext: 'K-maps are taught in every digital logic course because they make minimisation visual and auditable. Professional tools automate this for large functions, but the K-map gives you the intuition to understand what the tools are doing and to sanity-check their output.',
  },
  intuition: {
    prose: [
      'Adjacent cells on the K-map differ in exactly one variable — Gray code ordering ensures this.',
      'Grouping adjacent 1-cells eliminates the differing variable from the product term.',
      'Largest groups = fewest literals = fewest gates. Always maximise group size.',
      'Wrap-around: edges are adjacent, corners form a valid group of 4.',
    ],
    callouts: [
      { type: 'tip', title: 'How to read a group', body: 'For each variable, check if it is 0 in all cells, 1 in all cells, or mixed. If constant at 0 → variable-bar. If constant at 1 → variable. If mixed → eliminate.' },
      { type: 'important', title: "Don't-care cells", body: "X cells can be treated as 1 to enlarge groups, or 0 to ignore them. Always use X cells to make the largest possible group — the output value for don't-care inputs is irrelevant by definition." },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Karnaugh Maps', props: { lesson: LESSON_DF_4_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'K-map = truth table rearranged so adjacency = one-variable difference.',
    'Group size 2ᴺ eliminates N variables. Group of 4 in a 3-var map → 1-variable term.',
    'Find all prime implicants (largest groups). Select essential ones. Cover the rest.',
    'Wrap-around: col 0 and col 3 adjacent. Row 0 and row 3 adjacent. All 4 corners = one group.',
    'After K-map: each group → one AND gate. All groups → one OR gate.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"K-map = truth table rearranged so adjacency = one-variable difference." Why does grouping adjacent cells in a K-map simplify the expression?',
      options: [
        'Adjacent cells always represent the same minterm',
        'Adjacent cells differ in exactly one variable — when you group them, that variable cancels out, leaving a simpler term with one fewer variable',
        'Grouping adds cells to create a larger truth table',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Group size 2ᴺ eliminates N variables. Group of 4 → 1-variable term eliminated per pair." A group of 4 cells in a 3-variable K-map produces a term with how many literals?',
      options: [
        '3 literals',
        '1 literal',
        '2 literals',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Wrap-around: col 0 and col 3 adjacent. All 4 corners = one group." In a 4-variable K-map, the four corner cells can be grouped. What does this produce?',
      options: [
        'An invalid grouping — corners cannot be grouped',
        'A group of 4 adjacent cells (each corner is adjacent to its neighbours via wrap-around), yielding a 2-literal term',
        'A group of 4 that eliminates all variables',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Find prime implicants (largest groups). Select essential ones." Why should you always use the largest possible group?',
      options: [
        'Larger groups are harder to draw and more impressive',
        'Larger groups eliminate more variables — bigger group = simpler term = fewer gates in the final circuit',
        'Larger groups cover more 0-cells, which is required for correctness',
      ],
      correct: 1,
    },
  ],
};