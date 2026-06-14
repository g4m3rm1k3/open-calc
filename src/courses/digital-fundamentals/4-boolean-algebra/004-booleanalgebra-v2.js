// Digital Fundamentals · Unit 4 · Lesson 1
// Boolean Algebra: Laws and Identities
// ScienceNotebook format — prose cells, JS visuals, challenges

export const LESSON_DF_4_1 = {
  title: 'Boolean Algebra: Laws and Identities',
  subtitle: 'The mathematical rules that let you simplify any logic expression — and why fewer gates means faster, cheaper circuits.',
  sequential: true,
  cells: [

    // ── Section 1 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why Simplification Matters

In Unit 3 you learned to read logic diagrams and extract Boolean expressions. The expressions you extract are often not minimal — they describe the circuit as it was designed, not as it could be.

Consider a circuit derived from a truth table by writing one AND term per output-1 row and ORing them all together. For a 4-input function this might give an expression with 8 AND terms and 7 OR operations — potentially 30+ gates. After applying Boolean algebra, the same function might reduce to 3 gates. The savings in silicon area, power consumption, and propagation delay are direct.

**Boolean algebra** provides a set of identities — provably true equations — that can be applied to any Boolean expression. Each application transforms the expression into an equivalent one (same truth table) that may be simpler.

The key identities fall into groups:

| Group | Identities |
|-------|-----------|
| Identity laws | $A + 0 = A$ &nbsp;&nbsp; $A \\cdot 1 = A$ |
| Null laws | $A + 1 = 1$ &nbsp;&nbsp; $A \\cdot 0 = 0$ |
| Idempotent laws | $A + A = A$ &nbsp;&nbsp; $A \\cdot A = A$ |
| Complement laws | $A + \\bar{A} = 1$ &nbsp;&nbsp; $A \\cdot \\bar{A} = 0$ |
| Double negation | $\\overline{\\bar{A}} = A$ |
| Commutative | $A + B = B + A$ &nbsp;&nbsp; $A \\cdot B = B \\cdot A$ |
| Associative | $(A+B)+C = A+(B+C)$ &nbsp;&nbsp; $(AB)C = A(BC)$ |
| Distributive | $A(B+C) = AB+AC$ &nbsp;&nbsp; $A+BC = (A+B)(A+C)$ |
| De Morgan's | $\\overline{AB} = \\bar{A}+\\bar{B}$ &nbsp;&nbsp; $\\overline{A+B} = \\bar{A}\\bar{B}$ |
| Absorption | $A+AB = A$ &nbsp;&nbsp; $A(A+B) = A$ |
| Consensus | $AB+\\bar{A}C+BC = AB+\\bar{A}C$ |

Every one of these can be verified by truth table. The power comes from applying them in sequence to reduce a complex expression.`,
    },

    // ── Visual 1 — Law explorer ────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Verify any law by truth table

Select a law from the list. The table on the right evaluates both sides of the identity for all input combinations, proving they are always equal. Toggle variables to highlight specific rows.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start">
    <div style="min-width:200px;flex:0 0 auto">
      <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em">Select a law</div>
      <div id="lawList" style="display:flex;flex-direction:column;gap:3px"></div>
    </div>
    <div style="flex:1;min-width:260px">
      <div id="lawTitle" style="font-size:14px;font-weight:600;color:#818cf8;margin-bottom:8px"></div>
      <canvas id="cv" width="340" height="280"></canvas>
      <div id="lawNote" style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.4);line-height:1.7"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%}
.law-btn{padding:5px 10px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.45);font-family:monospace;font-size:11px;cursor:pointer;text-align:left;width:100%}
.law-btn:hover{background:rgba(255,255,255,0.04)}
.law-btn.sel{border-color:#818cf8;background:rgba(99,102,241,0.12);color:#818cf8}`,
      startCode: `
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

var LAWS=[
  {name:'Identity: A+0=A',    vars:['A'],   lhs:function(r){return r[0];},    rhs:function(r){return r[0];},        lhsStr:'A + 0', rhsStr:'A',         note:'Adding 0 to anything leaves it unchanged. OR with constant 0 = identity.'},
  {name:'Identity: A·1=A',    vars:['A'],   lhs:function(r){return r[0];},    rhs:function(r){return r[0];},        lhsStr:'A · 1', rhsStr:'A',         note:'ANDing with 1 leaves A unchanged. Both sides equal A for all inputs.'},
  {name:'Null: A+1=1',        vars:['A'],   lhs:function(r){return 1;},        rhs:function(r){return 1;},           lhsStr:'A + 1', rhsStr:'1',         note:'OR with constant 1 always gives 1 regardless of A. A is irrelevant.'},
  {name:'Null: A·0=0',        vars:['A'],   lhs:function(r){return 0;},        rhs:function(r){return 0;},           lhsStr:'A · 0', rhsStr:'0',         note:'AND with 0 always gives 0 regardless of A.'},
  {name:'Idempotent: A+A=A',  vars:['A'],   lhs:function(r){return r[0];},    rhs:function(r){return r[0];},        lhsStr:'A + A', rhsStr:'A',         note:'ORing a value with itself gives the same value. Duplicate inputs add nothing.'},
  {name:'Complement: A+Ā=1', vars:['A'],   lhs:function(r){return 1;},        rhs:function(r){return 1;},           lhsStr:'A + Ā', rhsStr:'1',         note:'A variable and its complement together cover all cases — always 1.'},
  {name:'Complement: A·Ā=0', vars:['A'],   lhs:function(r){return 0;},        rhs:function(r){return 0;},           lhsStr:'A · Ā', rhsStr:'0',         note:'A variable AND its complement is impossible — always 0.'},
  {name:'Absorption: A+AB=A', vars:['A','B'],lhs:function(r){return r[0]|(r[0]&r[1]);}, rhs:function(r){return r[0];}, lhsStr:'A + AB', rhsStr:'A',      note:'If A is 1, the whole expression is 1 regardless of AB. If A is 0, AB is 0 too. A dominates.'},
  {name:'Distributive: A(B+C)',vars:['A','B','C'],lhs:function(r){return r[0]&(r[1]|r[2]);},rhs:function(r){return (r[0]&r[1])|(r[0]&r[2]);},lhsStr:'A(B+C)',rhsStr:'AB+AC', note:'AND distributes over OR — exactly like multiplication distributes over addition.'},
  {name:'De Morgan: ̄(AB)=Ā+B̄',vars:['A','B'],lhs:function(r){return (r[0]&r[1])?0:1;},rhs:function(r){return (!r[0]?1:0)|(!r[1]?1:0);},lhsStr:'̄(AB)',rhsStr:'Ā + B̄',  note:'NAND equals OR of complements. Invert both inputs and flip AND↔OR.'},
  {name:'De Morgan: ̄(A+B)=ĀB̄',vars:['A','B'],lhs:function(r){return (r[0]|r[1])?0:1;},rhs:function(r){return (!r[0]?1:0)&(!r[1]?1:0);},lhsStr:'̄(A+B)',rhsStr:'Ā · B̄', note:'NOR equals AND of complements. Invert both inputs and flip OR↔AND.'},
  {name:'Consensus: AB+ĀC+BC',  vars:['A','B','C'],
    lhs:function(r){return (r[0]&r[1])|((r[0]?0:1)&r[2])|(r[1]&r[2]);},
    rhs:function(r){return (r[0]&r[1])|((r[0]?0:1)&r[2]);},
    lhsStr:'AB + ĀC + BC', rhsStr:'AB + ĀC',
    note:'The BC term is redundant — it is always covered by either AB or ĀC. Removing it does not change the truth table.'},
];

var sel=0;

function inputCombinations(n){
  var rows=[];
  for(var i=0;i<Math.pow(2,n);i++){
    var row=[];
    for(var b=n-1;b>=0;b--) row.push((i>>b)&1);
    rows.push(row);
  }
  return rows;
}

function buildList(){
  var list=document.getElementById('lawList');
  list.innerHTML='';
  LAWS.forEach(function(law,i){
    var btn=document.createElement('button');
    btn.className='law-btn'+(sel===i?' sel':'');
    btn.textContent=law.name;
    btn.onclick=function(){sel=i;buildList();drawTable();};
    list.appendChild(btn);
  });
}

function drawTable(){
  var law=LAWS[sel];
  var vars=law.vars;
  var combos=inputCombinations(vars.length);
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  var nCols=vars.length+3; // vars + LHS + = + RHS
  var colW=Math.floor(W/nCols);
  var rowH=Math.min(28, Math.floor((H-32)/combos.length));
  var headerY=20;

  // Title
  document.getElementById('lawTitle').textContent=law.name;
  document.getElementById('lawNote').textContent=law.note;

  // Headers
  var hdrs=vars.concat([law.lhsStr,'=',law.rhsStr]);
  hdrs.forEach(function(h,i){
    var col=i<vars.length?'rgba(255,255,255,0.4)':i===vars.length?'#818cf8':i===vars.length+1?'rgba(255,255,255,0.2)':'#4ade80';
    ctx.fillStyle=col; ctx.font='bold 10px monospace'; ctx.textAlign='center';
    ctx.fillText(h,i*colW+colW/2,headerY);
  });
  ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(0,headerY+6);ctx.lineTo(W,headerY+6);ctx.stroke();

  // Rows
  combos.forEach(function(row,ri){
    var y=headerY+14+ri*rowH;
    var lhsVal=law.lhs(row);
    var rhsVal=law.rhs(row);
    var match=lhsVal===rhsVal;

    ctx.fillStyle=match?'rgba(74,222,128,0.04)':'rgba(239,68,68,0.1)';
    ctx.fillRect(0,y-rowH*0.6,W,rowH);

    // Input columns
    row.forEach(function(v,ci){
      ctx.fillStyle=v?'#4ade80':'rgba(255,255,255,0.4)';
      ctx.font='12px monospace'; ctx.textAlign='center';
      ctx.fillText(v,ci*colW+colW/2,y);
    });

    // LHS
    ctx.fillStyle=lhsVal?'#818cf8':'rgba(99,102,241,0.4)';
    ctx.font='bold 12px monospace'; ctx.textAlign='center';
    ctx.fillText(lhsVal,(vars.length)*colW+colW/2,y);

    // =
    ctx.fillStyle=match?'rgba(74,222,128,0.4)':'rgba(239,68,68,0.6)';
    ctx.font='11px monospace';
    ctx.fillText(match?'✓':'✗',(vars.length+1)*colW+colW/2,y);

    // RHS
    ctx.fillStyle=rhsVal?'#4ade80':'rgba(74,222,128,0.3)';
    ctx.font='bold 12px monospace';
    ctx.fillText(rhsVal,(vars.length+2)*colW+colW/2,y);

    // Row divider
    if(ri<combos.length-1){
      ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=0.5;
      ctx.beginPath();ctx.moveTo(0,y+rowH*0.4);ctx.lineTo(W,y+rowH*0.4);ctx.stroke();
    }
  });

  // Column divider before LHS
  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(vars.length*colW,headerY-8);ctx.lineTo(vars.length*colW,H);ctx.stroke();
}

buildList(); drawTable();`,
      outputHeight: 480,
    },

    // ── Challenge 1 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Simplify: $F = A \\cdot B + A \\cdot \\bar{B}$. Which law applies directly?`,
      options: [
        { label: 'A', text: 'F = A·B — absorption law removes the second term' },
        { label: 'B', text: 'F = A — factor out A, then use complement law: A(B+B̄) = A·1 = A' },
        { label: 'C', text: 'F = B — the A terms cancel by complement law' },
        { label: 'D', text: 'F = A + B — OR distributes the AND terms' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Factor A from both terms: A·B + A·B̄ = A(B + B̄). Apply the complement law: B + B̄ = 1. Then identity: A·1 = A. So F = A. This is a fundamental simplification pattern — whenever you see a variable ANDed with both a term and its complement, the variable alone is the result.',
      failMessage: 'Factor out the common A: A·B + A·B̄ = A(B + B̄). Now apply the complement law: B + B̄ = 1 (a variable ORed with its complement is always 1). Then A·1 = A by the identity law. F = A.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 2 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Applying the Laws: A Simplification Walkthrough

Boolean simplification is not mechanical — there is no single algorithm that always finds the minimum expression. It requires recognising patterns and choosing the right law to apply. With practice, common patterns become automatic.

**General strategy**:
1. Look for **complement pairs**: $A$ and $\\bar{A}$ appearing in adjacent terms — use $A\\bar{A}=0$ to eliminate, or $A+\\bar{A}=1$ to collapse terms.
2. **Factor out** common variables using distributive law.
3. Apply **absorption**: if you see $A + AB$, replace with $A$.
4. Apply **De Morgan** to remove double negations or convert between AND-OR forms.
5. Look for **redundant terms** (consensus theorem).

**Worked example**: simplify $F = AB + A\\bar{B} + \\bar{A}B$

$$F = AB + A\\bar{B} + \\bar{A}B$$

Step 1 — Factor the first two terms (both contain A):
$$= A(B + \\bar{B}) + \\bar{A}B$$

Step 2 — Complement law: $B + \\bar{B} = 1$:
$$= A \\cdot 1 + \\bar{A}B = A + \\bar{A}B$$

Step 3 — Distributive law (OR form): $A + \\bar{A}B = (A + \\bar{A})(A + B) = 1 \\cdot (A+B)$:
$$= A + B$$

The original expression had 3 AND gates and 2 OR gates. The simplified form needs only 1 OR gate. Same truth table, radically fewer gates.

**Verify**: check the output column of $AB + A\\bar{B} + \\bar{A}B$ against $A+B$ — they are identical.`,
    },

    // ── Visual 2 — Step-by-step simplification ─────────────────────────────────
    {
      type: 'js',
      instruction: `### Simplification step-by-step

Work through the simplification of three different expressions. Click **Next step** to apply each law in sequence. The truth table on the right confirms the expression is equivalent at every step.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
    <button class="tab-btn active" id="ex0" onclick="setEx(0)">Example 1</button>
    <button class="tab-btn"        id="ex1" onclick="setEx(1)">Example 2</button>
    <button class="tab-btn"        id="ex2" onclick="setEx(2)">Example 3</button>
  </div>
  <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
    <div style="flex:1;min-width:220px">
      <div id="stepNum"  style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:6px"></div>
      <div id="exprBox"  style="font-size:17px;font-weight:600;color:#e2e8f0;min-height:28px;margin-bottom:8px"></div>
      <div id="lawBox"   style="font-size:12px;color:#fbbf24;min-height:18px;margin-bottom:10px"></div>
      <div id="noteBox"  style="font-size:12px;color:rgba(255,255,255,0.4);line-height:1.7;min-height:40px"></div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button id="btnBack" class="nav-btn">← Back</button>
        <button id="btnNext2" class="nav-btn act">Next step →</button>
      </div>
      <div id="stepDots" style="display:flex;gap:5px;margin-top:10px"></div>
    </div>
    <div style="flex:0 0 auto">
      <div style="font-size:10px;color:rgba(255,255,255,0.25);margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em">Truth table (current expression)</div>
      <canvas id="cv" width="200" height="220"></canvas>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
.tab-btn{padding:5px 12px;border-radius:16px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.45);font-family:monospace;font-size:12px;cursor:pointer}
.tab-btn.active{border-color:#818cf8;background:rgba(99,102,241,0.12);color:#818cf8}
.nav-btn{padding:7px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:12px;cursor:pointer}
.nav-btn.act{border-color:#6366f1;background:rgba(99,102,241,0.15);color:#818cf8}`,
      startCode: `
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var exIdx=0, stepIdx=0;

var EXAMPLES=[
  {
    vars:['A','B'],
    finalFn:function(r){return r[0]|r[1];},
    steps:[
      {expr:'AB + AB̄ + ĀB', law:'', note:'Starting expression — 3 product terms.', fn:function(r){return (r[0]&r[1])|(r[0]&(r[1]^1))|((r[0]^1)&r[1]);}},
      {expr:'A(B + B̄) + ĀB', law:'Distributive: factor A', note:'Factor A from the first two terms AB + AB̄ = A(B+B̄).', fn:function(r){return r[0]|(( r[0]^1)&r[1]);}},
      {expr:'A·1 + ĀB', law:'Complement: B+B̄ = 1', note:'B + B̄ = 1 always. So A(1) = A.', fn:function(r){return r[0]|((r[0]^1)&r[1]);}},
      {expr:'A + ĀB', law:'Identity: A·1 = A', note:'A·1 = A. Now apply distributive in OR form.', fn:function(r){return r[0]|((r[0]^1)&r[1]);}},
      {expr:'A + B', law:'Dist. OR form: A+ĀB = (A+Ā)(A+B) = A+B', note:'Final result: just one OR gate. Same truth table as the original 5-gate expression.', fn:function(r){return r[0]|r[1];}},
    ]
  },
  {
    vars:['A','B','C'],
    finalFn:function(r){return r[0]|(r[1]&r[2]);},
    steps:[
      {expr:'ABC + AB̄C + ĀBC + ABC', law:'', note:'Four product terms — contains a duplicate.', fn:function(r){return (r[0]&r[1]&r[2])|(r[0]&(r[1]^1)&r[2])|((r[0]^1)&r[1]&r[2])|(r[0]&r[1]&r[2]);}},
      {expr:'ABC + AB̄C + ĀBC', law:'Idempotent: X+X=X (remove duplicate)', note:'ABC appears twice — the duplicate adds nothing. Remove it.', fn:function(r){return (r[0]&r[1]&r[2])|(r[0]&(r[1]^1)&r[2])|((r[0]^1)&r[1]&r[2]);}},
      {expr:'AC(B + B̄) + ĀBC', law:'Distributive: factor AC from first two terms', note:'ABC + AB̄C = AC(B + B̄). Now apply complement law to B+B̄.', fn:function(r){return (r[0]&r[2])|((r[0]^1)&r[1]&r[2]);}},
      {expr:'AC + ĀBC', law:'Complement: B+B̄=1, Identity: AC·1=AC', note:'AC(1) = AC. Now factor C from both terms.', fn:function(r){return (r[0]&r[2])|((r[0]^1)&r[1]&r[2]);}},
      {expr:'C(A + ĀB)', law:'Distributive: factor C', note:'AC + ĀBC = C(A + ĀB). Now simplify A + ĀB.', fn:function(r){return r[2]&(r[0]|((r[0]^1)&r[1]));}},
      {expr:'C(A + B)', law:'A + ĀB = A + B (dist. OR form)', note:'A + ĀB simplifies to A+B by the OR-distributive law. Final: C(A+B) = AC+BC.', fn:function(r){return r[2]&(r[0]|r[1]);}},
    ]
  },
  {
    vars:['A','B'],
    finalFn:function(r){return (r[0]|r[1])?0:1;},
    steps:[
      {expr:'Ā·B̄', law:'', note:'Starting expression — AND of two complements.', fn:function(r){return ((r[0]^1)&(r[1]^1));}},
      {expr:'̄(A + B) by De Morgan', law:"De Morgan: Ā·B̄ = ̄(A+B)", note:"De Morgan's theorem: the AND of complements equals the complement of the OR. This is a NOR gate.", fn:function(r){return (r[0]|r[1])?0:1;}},
      {expr:'NOR(A, B)', law:'Final form', note:'One NOR gate implements the same function as two NOTs and an AND. De Morgan lets you choose the simplest implementation.', fn:function(r){return (r[0]|r[1])?0:1;}},
    ]
  },
];

function inputCombinations(n){
  var rows=[];
  for(var i=0;i<Math.pow(2,n);i++){
    var row=[];
    for(var b=n-1;b>=0;b--) row.push((i>>b)&1);
    rows.push(row);
  }
  return rows;
}

function drawTable(){
  var ex=EXAMPLES[exIdx];
  var step=ex.steps[stepIdx];
  var vars=ex.vars;
  var combos=inputCombinations(vars.length);
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  var nCols=vars.length+2; // vars + current F + final F
  var colW=Math.floor(W/nCols);
  var rowH=Math.min(26,Math.floor((H-30)/combos.length));
  var hY=20;

  var hdrs=vars.concat(['F now','F final']);
  hdrs.forEach(function(h,i){
    var col=i<vars.length?'rgba(255,255,255,0.35)':i===vars.length?'#818cf8':'rgba(74,222,128,0.5)';
    ctx.fillStyle=col; ctx.font='bold 10px monospace'; ctx.textAlign='center';
    ctx.fillText(h,i*colW+colW/2,hY);
  });
  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(0,hY+6);ctx.lineTo(W,hY+6);ctx.stroke();

  combos.forEach(function(row,ri){
    var y=hY+14+ri*rowH;
    var fNow=step.fn(row);
    var fFinal=ex.finalFn(row);
    var match=fNow===fFinal;

    if(!match){ctx.fillStyle='rgba(239,68,68,0.1)';ctx.fillRect(0,y-rowH*0.6,W,rowH);}

    row.forEach(function(v,ci){
      ctx.fillStyle=v?'#4ade80':'rgba(255,255,255,0.35)';
      ctx.font='12px monospace'; ctx.textAlign='center';
      ctx.fillText(v,ci*colW+colW/2,y);
    });
    ctx.fillStyle=fNow?'#818cf8':'rgba(99,102,241,0.35)';
    ctx.font='bold 12px monospace'; ctx.textAlign='center';
    ctx.fillText(fNow,vars.length*colW+colW/2,y);

    ctx.fillStyle=fFinal?'rgba(74,222,128,0.7)':'rgba(74,222,128,0.2)';
    ctx.font='12px monospace';
    ctx.fillText(fFinal,(vars.length+1)*colW+colW/2,y);
  });
}

function setEx(i){
  exIdx=i; stepIdx=0;
  ['ex0','ex1','ex2'].forEach(function(id,k){
    document.getElementById(id).className='tab-btn'+(exIdx===k?' active':'');
  });
  update();
}

function update(){
  var ex=EXAMPLES[exIdx];
  var step=ex.steps[stepIdx];
  var n=ex.steps.length;
  document.getElementById('stepNum').textContent='Step '+(stepIdx+1)+' of '+n;
  document.getElementById('exprBox').textContent=step.expr;
  document.getElementById('lawBox').textContent=step.law?('Law applied: '+step.law):'';
  document.getElementById('noteBox').textContent=step.note;
  document.getElementById('btnBack').disabled=stepIdx===0;
  document.getElementById('btnNext2').disabled=stepIdx===n-1;
  document.getElementById('btnBack').style.opacity=stepIdx===0?'0.3':'1';
  document.getElementById('btnNext2').style.opacity=stepIdx===n-1?'0.3':'1';

  // Step dots
  var dots=document.getElementById('stepDots');
  dots.innerHTML='';
  ex.steps.forEach(function(_,i){
    var d=document.createElement('div');
    d.style.cssText='width:8px;height:8px;border-radius:50%;background:'+(i<=stepIdx?'#818cf8':'#2a3a50');
    dots.appendChild(d);
  });
  drawTable();
}

document.getElementById('btnBack').onclick=function(){if(stepIdx>0){stepIdx--;update();}};
document.getElementById('btnNext2').onclick=function(){var n=EXAMPLES[exIdx].steps.length;if(stepIdx<n-1){stepIdx++;update();}};
window.setEx=setEx;
update();`,
      outputHeight: 440,
    },

    // ── Challenge 2 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Which Boolean algebra law justifies: $A + AB = A$?`,
      options: [
        { label: 'A', text: 'Distributive law — factor A from both terms' },
        { label: 'B', text: 'Absorption law — A absorbs any product that contains A' },
        { label: 'C', text: 'Complement law — AB and A cancel each other' },
        { label: 'D', text: 'Consensus theorem — AB is a redundant term' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. A + AB = A is the absorption law. You can verify it: factor A → A(1+B) → A·1 → A, using null law (1+B=1) and identity. But the direct name is absorption — any OR term that contains A is absorbed by A itself.',
      failMessage: 'This is the absorption law: A + AB = A. The AB term is "absorbed" into A because whenever A is 1 (making the whole expression 1), AB is also 1 — it adds no new information. Proof: A + AB = A(1+B) = A·1 = A.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### De Morgan's Theorem in Simplification

De Morgan's theorems are among the most useful tools in Boolean simplification because they let you convert between the two fundamental forms — Sum of Products (AND-OR) and Product of Sums (OR-AND).

**Applying De Morgan to an expression with a bar over multiple variables**:

The key rule: push the bar inside and flip every AND↔OR.

$$\\overline{AB + CD} = \\overline{AB} \\cdot \\overline{CD} = (\\bar{A}+\\bar{B})(\\bar{C}+\\bar{D})$$

$$\\overline{(A+B)(C+D)} = \\overline{A+B} + \\overline{C+D} = \\bar{A}\\bar{B} + \\bar{C}\\bar{D}$$

**Removing double negation**: whenever you apply De Morgan twice or find $\\overline{\\bar{X}} = X$, simplify immediately.

**Converting NAND/NOR chains**: a two-level NAND-NAND network implements Sum of Products. To find its expression:
- Each first-level NAND output = $\\overline{AB}$ etc.
- Second-level NAND: $\\overline{\\overline{AB} \\cdot \\overline{CD}} = AB + CD$ (by De Morgan twice)

This is the proof that NAND-NAND implements AND-OR — which is why NAND gates dominate real synthesis.

**Practical pattern**: when you see a complicated expression under a large negation bar, always apply De Morgan first to push the bar inward, then simplify the resulting expression without bars.`,
    },

    // ── Visual 3 — De Morgan simplification engine ─────────────────────────────
    {
      type: 'js',
      instruction: `### De Morgan: push the bar inward

Select an expression and apply De Morgan's theorem step by step. Each click pushes the negation one level deeper — flipping AND↔OR and distributing the bar to individual variables.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
    <button class="tab-btn active" id="dm0" onclick="setDM(0)">̄(AB+CD)</button>
    <button class="tab-btn"        id="dm1" onclick="setDM(1)">̄((A+B)(C+D))</button>
    <button class="tab-btn"        id="dm2" onclick="setDM(2)">̄(̄(AB)·̄(CD))</button>
  </div>
  <canvas id="cv" width="560" height="300"></canvas>
  <div style="margin-top:10px;display:flex;gap:8px">
    <button id="btnDMBack" class="nav-btn">← Back</button>
    <button id="btnDMNext" class="nav-btn act">Apply De Morgan →</button>
  </div>
  <div id="dmNote" style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.4);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.tab-btn{padding:5px 12px;border-radius:16px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.45);font-family:monospace;font-size:12px;cursor:pointer}
.tab-btn.active{border-color:#f472b6;background:rgba(219,39,119,0.1);color:#f472b6}
.nav-btn{padding:7px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:12px;cursor:pointer}
.nav-btn.act{border-color:#6366f1;background:rgba(99,102,241,0.15);color:#818cf8}`,
      startCode: `
var dmIdx=0,dmStep=0;
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

var DM_EXAMPLES=[
  {
    steps:[
      {expr:'̄(AB + CD)',        law:'',                     note:'Starting expression — negation bar over an OR of two AND terms.'},
      {expr:'̄(AB) · ̄(CD)',    law:'De Morgan: ̄(X+Y) = ̄X·̄Y — flip OR→AND, push bar to each term.', note:'The outer bar splits at the OR — it becomes AND, and each AND-term gets its own bar.'},
      {expr:'(Ā+B̄) · (C̄+D̄)',  law:'De Morgan: ̄(XY) = X̄+Ȳ on each remaining bar.',               note:'Each inner bar splits at the AND — it becomes OR, and each variable gets its own bar. Final form: Product of Sums.'},
    ]
  },
  {
    steps:[
      {expr:'̄((A+B)(C+D))',     law:'',                     note:'Starting expression — negation bar over a Product of Sums.'},
      {expr:'̄(A+B) + ̄(C+D)',  law:'De Morgan: ̄(XY) = ̄X+̄Y — flip AND→OR, push bar to each factor.', note:'The outer bar splits at the AND — it becomes OR, each OR-factor gets its own bar.'},
      {expr:'ĀB̄ + C̄D̄',        law:'De Morgan: ̄(X+Y) = X̄·Ȳ on each remaining bar.',               note:'Each inner bar splits at the OR — it becomes AND. Final form: Sum of Products (ĀB̄ + C̄D̄).'},
    ]
  },
  {
    steps:[
      {expr:'̄(̄(AB) · ̄(CD))',   law:'',                     note:'NAND-NAND circuit: output of two NAND gates fed into a third NAND. What does it compute?'},
      {expr:'̄(̄(AB)) + ̄(̄(CD))',law:'De Morgan: ̄(X·Y) = ̄X+̄Y — outer NAND becomes OR of inverted inputs.', note:'Push the outer bar inward — AND becomes OR, each NAND term gets complemented.'},
      {expr:'AB + CD',             law:'Double negation: ̄(̄X) = X — cancel double bars.', note:'Each double bar cancels. ̄(̄(AB)) = AB. The NAND-NAND circuit implements AB+CD — Sum of Products. This proves NAND-NAND = AND-OR.'},
    ]
  },
];

function setDM(i){
  dmIdx=i; dmStep=0;
  ['dm0','dm1','dm2'].forEach(function(id,k){
    document.getElementById(id).className='tab-btn'+(dmIdx===k?' active':'');
  });
  draw();
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  var ex=DM_EXAMPLES[dmIdx];
  var n=ex.steps.length;

  // Show all completed steps as a chain
  ex.steps.forEach(function(step,si){
    if(si>dmStep) return;
    var y=40+si*80;
    var isCurrent=si===dmStep;
    var isLast=si===n-1;

    // Step box
    ctx.fillStyle=isCurrent?'rgba(99,102,241,0.1)':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=isCurrent?'#6366f1':'rgba(255,255,255,0.06)';
    ctx.lineWidth=isCurrent?1.5:0.5;
    ctx.beginPath(); ctx.roundRect(20,y-16,W-40,60,6); ctx.fill(); ctx.stroke();

    // Expression
    var col=isLast?'#4ade80':isCurrent?'#e2e8f0':'rgba(255,255,255,0.45)';
    ctx.fillStyle=col; ctx.font=(isCurrent?'bold ':'')+'16px monospace'; ctx.textAlign='left';
    ctx.fillText(step.expr,36,y+6);

    // Law label
    if(step.law&&si>0){
      ctx.fillStyle='#fbbf24'; ctx.font='10px monospace';
      ctx.fillText('\u2192 '+step.law,36,y+24);
    }

    // Arrow to next
    if(si<dmStep&&si<n-1){
      ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(W/2,y+44);ctx.lineTo(W/2,y+62);ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.15)';
      ctx.beginPath();ctx.moveTo(W/2-5,y+58);ctx.lineTo(W/2+5,y+58);ctx.lineTo(W/2,y+66);ctx.fill();
    }
  });

  document.getElementById('btnDMBack').disabled=dmStep===0;
  document.getElementById('btnDMNext').disabled=dmStep===n-1;
  document.getElementById('btnDMBack').style.opacity=dmStep===0?'0.3':'1';
  document.getElementById('btnDMNext').style.opacity=dmStep===n-1?'0.3':'1';
  document.getElementById('dmNote').textContent=ex.steps[dmStep].note;
}

document.getElementById('btnDMBack').onclick=function(){if(dmStep>0){dmStep--;draw();}};
document.getElementById('btnDMNext').onclick=function(){var n=DM_EXAMPLES[dmIdx].steps.length;if(dmStep<n-1){dmStep++;draw();}};
window.setDM=setDM;
draw();`,
      outputHeight: 420,
    },

    // ── Challenge 3 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Apply De Morgan's theorem to simplify $\\overline{\\bar{A} + \\bar{B}}$.`,
      options: [
        { label: 'A', text: 'A + B — De Morgan flips the OR to AND and removes bars' },
        { label: 'B', text: 'A · B — the outer bar distributes, flipping OR→AND and complementing each variable' },
        { label: 'C', text: 'Ā · B̄ — the outer bar just moves inside without change' },
        { label: 'D', text: 'A ⊕ B — complement of OR is XOR' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. De Morgan: ̄(X+Y) = X̄·Ȳ. Here X=Ā and Y=B̄, so ̄(Ā+B̄) = ̄(Ā)·̄(B̄) = A·B (double negation cancels). The complement of (NOT A OR NOT B) is (A AND B).',
      failMessage: 'Apply De Morgan: ̄(Ā+B̄). De Morgan on OR: ̄(X+Y) = X̄·Ȳ. So ̄(Ā+B̄) = ̄(Ā)·̄(B̄). Double negation: ̄(Ā)=A and ̄(B̄)=B. Result: A·B.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Standard Forms: SOP and POS

Boolean algebra can represent any logic function in two standard forms. Knowing these forms is essential because logic synthesis tools, K-maps, and hardware description languages all work with them.

**Sum of Products (SOP)**: an OR of AND terms. Each AND term is called a **minterm** when it includes every variable (either true or complemented). Example:
$$F = AB\\bar{C} + A\\bar{B}C + \\bar{A}BC$$

**Product of Sums (POS)**: an AND of OR terms. Each OR term is called a **maxterm** when it includes every variable. Example:
$$F = (A+B+\\bar{C})(A+\\bar{B}+C)(\\bar{A}+B+C)$$

**Canonical forms**: the fully expanded SOP with one minterm per output-1 row, and the POS with one maxterm per output-0 row. Every function has a unique canonical SOP and a unique canonical POS.

**Converting between SOP and POS**: apply De Morgan to an SOP expression — the complement of the SOP is the POS of the complement function. Or simply: where SOP has minterms for 1-rows, POS has maxterms for 0-rows.

**Why standard forms matter**:
- SOP maps directly to a two-level AND-OR (or NAND-NAND) implementation
- POS maps directly to a two-level OR-AND (or NOR-NOR) implementation
- K-maps (next lesson) start from canonical SOP and find the minimal SOP by grouping minterms
- Logic synthesis tools convert any HDL description to SOP before optimising

Understanding canonical forms makes K-map simplification in Lesson 4.2 immediate — the K-map is just a visual arrangement of the minterm numbers.`,
    },

    // ── Visual 4 — SOP / POS builder ───────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Build SOP and POS from a truth table

Click output cells to toggle between 0 and 1. The SOP expression (sum of minterms for 1-rows) and POS expression (product of maxterms for 0-rows) update automatically.`,
      html: `<div style="padding:14px">
  <div style="margin-bottom:10px;font-size:11px;color:rgba(255,255,255,0.35)">Click the F column cells to set the output. SOP and POS update instantly.</div>
  <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
    <div>
      <canvas id="cv" width="240" height="260"></canvas>
    </div>
    <div style="flex:1;min-width:220px">
      <div style="margin-bottom:12px">
        <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Sum of Products (SOP)</div>
        <div id="sopExpr" style="font-size:13px;font-weight:600;color:#818cf8;line-height:1.8;word-break:break-all;min-height:24px"></div>
        <div id="sopNote" style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:2px"></div>
      </div>
      <div>
        <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Product of Sums (POS)</div>
        <div id="posExpr" style="font-size:13px;font-weight:600;color:#4ade80;line-height:1.8;word-break:break-all;min-height:24px"></div>
        <div id="posNote" style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:2px"></div>
      </div>
      <div style="margin-top:12px;padding:10px;border-radius:8px;background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.08)">
        <div style="font-size:10px;color:rgba(255,255,255,0.25);margin-bottom:6px">Presets</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap" id="presets"></div>
      </div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;cursor:pointer}
.pre-btn{padding:4px 10px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;cursor:pointer}
.pre-btn:hover{background:rgba(255,255,255,0.06)}`,
      startCode: `
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
// 3-variable truth table, 8 rows
var outputs=[0,0,0,1,0,1,1,1]; // default: majority

var VARS=['A','B','C'];
var PRESETS=[
  {name:'AND',    vals:[0,0,0,0,0,0,0,1]},
  {name:'OR',     vals:[0,1,1,1,1,1,1,1]},
  {name:'XOR-maj',vals:[0,0,0,1,0,1,1,0]},
  {name:'Majority',vals:[0,0,0,1,0,1,1,1]},
  {name:'All 1',  vals:[1,1,1,1,1,1,1,1]},
];

function minterm(row,vars){
  return row.map(function(v,i){return v?vars[i]:vars[i]+'\u0305';}).join('');
}
function maxterm(row,vars){
  return '('+row.map(function(v,i){return v?vars[i]+'\u0305':vars[i];}).join('+')+')';
}
function inputRow(i,n){
  var row=[];
  for(var b=n-1;b>=0;b--) row.push((i>>b)&1);
  return row;
}

function buildExpressions(){
  var sops=[],poss=[];
  for(var i=0;i<8;i++){
    var row=inputRow(i,3);
    if(outputs[i]===1) sops.push(minterm(row,VARS));
    else poss.push(maxterm(row,VARS));
  }
  var ones=outputs.filter(function(v){return v;}).length;
  var zeros=8-ones;

  if(ones===0){
    document.getElementById('sopExpr').textContent='F = 0  (never true)';
    document.getElementById('sopNote').textContent='No 1-rows — SOP has no terms.';
  } else if(ones===8){
    document.getElementById('sopExpr').textContent='F = 1  (always true)';
    document.getElementById('sopNote').textContent='All rows are 1 — no minterms needed.';
  } else {
    document.getElementById('sopExpr').textContent='F = '+sops.join(' + ');
    document.getElementById('sopNote').textContent=ones+' minterm'+(ones>1?'s':'')+' (one per 1-row)';
  }

  if(zeros===0){
    document.getElementById('posExpr').textContent='F = 1  (no 0-rows)';
    document.getElementById('posNote').textContent='No 0-rows — POS has no factors.';
  } else if(zeros===8){
    document.getElementById('posExpr').textContent='F = 0  (all rows are 0)';
    document.getElementById('posNote').textContent='';
  } else {
    document.getElementById('posExpr').textContent='F = '+poss.join('\u00b7');
    document.getElementById('posNote').textContent=zeros+' maxterm'+(zeros>1?'s':'')+' (one per 0-row)';
  }
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  var colW=[28,28,28,14,44], startX=10;
  var rowH=Math.floor((H-30)/8);
  var hY=20;
  var hdrs=['A','B','C','','F'];
  var cols=['rgba(255,255,255,0.35)','rgba(255,255,255,0.35)','rgba(255,255,255,0.35)','rgba(255,255,255,0.15)','#818cf8'];

  hdrs.forEach(function(h,ci){
    var x=startX+colW.slice(0,ci).reduce(function(a,b){return a+b;},0);
    ctx.fillStyle=cols[ci]; ctx.font='bold 10px monospace'; ctx.textAlign='center';
    ctx.fillText(h,x+colW[ci]/2,hY);
  });
  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(startX,hY+6);ctx.lineTo(startX+colW.reduce(function(a,b){return a+b;}),hY+6);ctx.stroke();

  for(var ri=0;ri<8;ri++){
    var y=hY+14+ri*rowH;
    var row=inputRow(ri,3);
    var out=outputs[ri];

    if(out){ctx.fillStyle='rgba(99,102,241,0.06)';ctx.fillRect(startX,y-rowH*0.6,W-startX*2,rowH);}

    // Input vars
    row.forEach(function(v,ci){
      var x=startX+colW.slice(0,ci).reduce(function(a,b){return a+b;},0);
      ctx.fillStyle=v?'#4ade80':'rgba(255,255,255,0.35)';
      ctx.font='12px monospace'; ctx.textAlign='center';
      ctx.fillText(v,x+colW[ci]/2,y);
    });

    // Minterm number
    var numX=startX+colW.slice(0,3).reduce(function(a,b){return a+b;},0);
    ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText('m'+ri,numX+colW[3]/2,y);

    // Output cell (clickable)
    var fX=startX+colW.slice(0,4).reduce(function(a,b){return a+b;},0);
    ctx.fillStyle=out?'rgba(99,102,241,0.25)':'rgba(255,255,255,0.04)';
    ctx.strokeStyle=out?'#818cf8':'rgba(255,255,255,0.1)'; ctx.lineWidth=out?1.5:0.5;
    ctx.beginPath();ctx.roundRect(fX+3,y-rowH*0.55,colW[4]-6,rowH*0.9,3);ctx.fill();ctx.stroke();
    ctx.fillStyle=out?'#818cf8':'rgba(255,255,255,0.25)';
    ctx.font='bold 13px monospace'; ctx.textAlign='center';
    ctx.fillText(out,fX+colW[4]/2,y);
  }
}

canvas.onclick=function(e){
  var rect=canvas.getBoundingClientRect();
  var my=(e.clientY-rect.top)*(canvas.height/rect.height);
  var hY=20, rowH=Math.floor((canvas.height-30)/8);
  var ri=Math.floor((my-hY-8)/rowH);
  if(ri>=0&&ri<8){outputs[ri]^=1;draw();buildExpressions();}
};

// Presets
var prow=document.getElementById('presets');
PRESETS.forEach(function(p){
  var b=document.createElement('button');
  b.className='pre-btn'; b.textContent=p.name;
  b.onclick=function(){outputs=p.vals.slice();draw();buildExpressions();};
  prow.appendChild(b);
});

draw(); buildExpressions();`,
      outputHeight: 420,
    },

    // ── Challenge 4 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 2-variable function has the truth table: A=0,B=0→0; A=0,B=1→1; A=1,B=0→1; A=1,B=1→0. Which canonical SOP expression is correct?`,
      options: [
        { label: 'A', text: 'F = ĀB + AB̄  (one minterm per 1-row)' },
        { label: 'B', text: 'F = AB + ĀB̄  (one minterm per 0-row)' },
        { label: 'C', text: 'F = (Ā+B)(A+B̄)  — this is POS, not SOP' },
        { label: 'D', text: 'F = A + B  — simplified version, not canonical SOP' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Canonical SOP has one minterm per row where output is 1. Row A=0,B=1 (output=1): minterm is ĀB. Row A=1,B=0 (output=1): minterm is AB̄. SOP = ĀB + AB̄. This is also the XOR function — it can be simplified to A⊕B, but the canonical SOP is the expanded form.',
      failMessage: 'Canonical SOP: one AND minterm per 1-row. The 1-rows are A=0,B=1 (minterm ĀB) and A=1,B=0 (minterm AB̄). So canonical SOP = ĀB + AB̄. Option B uses 0-rows (those are POS maxterms). Option D is the simplified form — canonical SOP is the full un-simplified expression.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: Boolean Algebra

**The laws** — eleven groups of identities, each verifiable by truth table:
- Complement: $A + \\bar{A} = 1$, $A\\bar{A} = 0$
- Absorption: $A + AB = A$
- De Morgan: $\\overline{AB} = \\bar{A}+\\bar{B}$; $\\overline{A+B} = \\bar{A}\\bar{B}$
- Distributive (OR form): $A + BC = (A+B)(A+C)$
- Consensus: $AB + \\bar{A}C + BC = AB + \\bar{A}C$ (BC is redundant)

**Simplification strategy**: look for complement pairs to eliminate, factor common variables, apply absorption to remove redundant terms, use De Morgan to convert forms.

**Standard forms**:
- **SOP**: OR of AND minterms — one per 1-row in the truth table. Maps to AND-OR (NAND-NAND) implementation.
- **POS**: AND of OR maxterms — one per 0-row in the truth table. Maps to OR-AND (NOR-NOR) implementation.

**What comes next**: applying these laws manually to a 4-variable function with many minterms is tedious and error-prone. The **Karnaugh map** (K-map) in Lesson 4.2 provides a visual method that applies absorption and adjacency rules automatically — finding the minimal SOP without algebraic manipulation.`,
    },
  ],
};

export default {
  id: 'df-4-1-boolean-algebra',
  slug: 'boolean-algebra-laws-identities',
  chapter: 'df.4',
  order: 1,
  title: 'Boolean Algebra: Laws and Identities',
  subtitle: 'The mathematical rules that let you simplify any logic expression — and why fewer gates means faster, cheaper circuits.',
  tags: ['digital', 'boolean-algebra', 'simplification', 'de-morgan', 'absorption', 'SOP', 'POS', 'minterms', 'maxterms'],
  hook: {
    question: 'A logic circuit extracted from a truth table might need 30 gates. The same function after Boolean algebra might need 3. How do you get from one to the other?',
    realWorldContext: 'Every logic synthesis tool — from Quartus to Vivado to Yosys — applies Boolean algebra as its first optimisation step before any other technique. Knowing the laws tells you what the tool is doing and why the synthesis report shows fewer gates than your original design.',
  },
  intuition: {
    prose: [
      'Eleven law groups, all verifiable by truth table. Complement, absorption, and De Morgan are the most useful.',
      'Simplification: factor common variables, eliminate complement pairs, absorb redundant terms.',
      'De Morgan: push bars inward, flip AND↔OR. Double negation cancels.',
      'SOP = OR of minterms (one per 1-row). POS = AND of maxterms (one per 0-row).',
    ],
    callouts: [
      { type: 'tip',       title: 'Absorption shortcut', body: 'A + AB = A always. If you see a term that contains all variables of another term, the shorter term absorbs the longer one.' },
      { type: 'important', title: 'De Morgan direction', body: 'Push bars inward: flip the operation (AND↔OR) and put a bar on each operand. Never move a bar without flipping the operation.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Boolean Algebra: Laws and Identities', props: { lesson: LESSON_DF_4_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Every Boolean identity can be proved by truth table — both sides have identical output columns.',
    'Simplification order: remove duplicates → factor → complement pairs → absorption → De Morgan.',
    'SOP canonical form: Σm(minterm numbers). POS canonical form: ΠM(maxterm numbers).',
    'NAND-NAND = AND-OR (proved by applying De Morgan twice to the second NAND).',
    'K-map (next lesson) is just a visual way to find which minterms can be absorbed into others.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};