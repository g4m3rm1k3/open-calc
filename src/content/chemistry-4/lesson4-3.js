// Chemistry · Chapter 4 · Lesson 3
// Equilibrium

const LESSON_CHEM_4_3 = {
  title: 'Equilibrium',
  subtitle: 'When reactions run both ways — and how to shift the balance.',
  sequential: true,

  cells: [

    // ── Section 1 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Not All Reactions Go to Completion

So far we have treated reactions as one-way streets: reactants become products, and eventually the reactants run out. But many reactions don't work that way.

Put nitrogen and hydrogen gas together at 400°C with an iron catalyst and they react to form ammonia. But the ammonia also decomposes back into nitrogen and hydrogen. The reaction runs in both directions simultaneously.

Dissolve acetic acid in water: some molecules donate a proton to water, forming acetate and H₃O⁺. But H₃O⁺ can also donate a proton back to acetate, regenerating acetic acid. At any moment, both processes are happening.

Heat calcium carbonate: it decomposes to calcium oxide and carbon dioxide. But CO₂ can react with CaO to regenerate CaCO₃. In a closed container, neither direction goes to completion.

These are **reversible reactions** — reactions that can proceed in both the forward and reverse directions. We write them with a double arrow:

$$N_2 + 3H_2 \\rightleftharpoons 2NH_3$$

When the forward and reverse reaction rates become equal — when the system reaches a balance point where concentrations stop changing — we say the system is at **chemical equilibrium**.

Equilibrium is not static. Molecules are still reacting in both directions at equilibrium; it's just that the forward rate equals the reverse rate, so the net concentrations don't change. It is a dynamic balance, not a frozen state. Understanding equilibrium is essential to understanding almost all of chemistry: the chemistry of solutions, of biological systems, of industrial processes, and of the atmosphere.`,
    },

    // ── Section 2 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Equilibrium Constant K

At equilibrium, the concentrations of reactants and products are related by a fixed mathematical expression called the **equilibrium constant**, symbol K (or Keq).

For the general reaction:
$$aA + bB \\rightleftharpoons cC + dD$$

The equilibrium constant expression is:
$$K = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$$

where the brackets denote equilibrium molar concentrations and the exponents are the stoichiometric coefficients from the balanced equation.

Some critical features:

**K is a constant at a given temperature.** No matter what initial concentrations you start with, the system will always reach the same ratio of products to reactants at equilibrium. Change the initial amounts and the final concentrations shift, but their ratio — the K expression — stays the same.

**K tells you the position of equilibrium:**
- K >> 1: Products strongly favoured. At equilibrium, mostly products present.
- K << 1: Reactants strongly favoured. At equilibrium, mostly reactants present.
- K ≈ 1: Reactants and products present in comparable amounts.

**Only temperature changes K.** Concentration, pressure, catalysts — these change rates and the time to reach equilibrium, but not K itself. Only temperature can shift the value of K.

**Pure solids and liquids are omitted from K.** Their concentrations don't change meaningfully (they are essentially constant), so they are absorbed into the constant. Only dissolved species and gases appear in K expressions.

For reactions involving gases, we sometimes use Kp (using partial pressures instead of concentrations). Kc and Kp are related by the ideal gas law: Kp = Kc(RT)^Δn, where Δn is the change in moles of gas.`,
    },

    // ── Visual 1 — Dynamic equilibrium animation ────────────────────────────────
    {
      type: 'js',
      instruction: `### Equilibrium is dynamic: forward rate = reverse rate

The simulation shows a reversible reaction reaching equilibrium. Blue particles (reactants) convert to red (products) and back. Watch the concentration bars on the right — they start far from equilibrium and settle to fixed values as the forward and reverse rates equalise. The rate graph at the bottom shows the rates converging.`,
      html: `<canvas id="cv" width="700" height="360"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

var K_EQ=2.5; // equilibrium constant [P]/[R]
var kf=0.03,kr=kf/K_EQ;

var NUM=40;
var particles=[];
for(var i=0;i<NUM;i++){
  particles.push({
    x:20+Math.random()*380,y:20+Math.random()*(H-120),
    vx:(Math.random()-0.5)*1.5,vy:(Math.random()-0.5)*1.5,
    isProduct:false,
    convertTimer:0
  });
}

var concHistory=[];
var rateHistory=[];
var MAX_HIST=180;

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Reaction box
  ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
  ctx.strokeRect(10,10,400,H-110);

  // Update particles
  var nReactant=0,nProduct=0;
  particles.forEach(function(p){
    p.x+=p.vx;p.y+=p.vy;
    p.vx+=(Math.random()-0.5)*0.08;p.vy+=(Math.random()-0.5)*0.08;
    var maxS=1.8;
    var spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
    if(spd>maxS){p.vx*=maxS/spd;p.vy*=maxS/spd;}
    if(p.x<18){p.x=18;p.vx=Math.abs(p.vx);}
    if(p.x>402){p.x=402;p.vx=-Math.abs(p.vx);}
    if(p.y<18){p.y=18;p.vy=Math.abs(p.vy);}
    if(p.y>H-112){p.y=H-112;p.vy=-Math.abs(p.vy);}

    // Conversion attempt
    p.convertTimer--;
    if(p.convertTimer<=0){
      var convertProb=p.isProduct?kr:kf;
      if(Math.random()<convertProb){
        p.isProduct=!p.isProduct;
        // Flash
        p.flash=12;
      }
      p.convertTimer=20+Math.floor(Math.random()*40);
    }
    if(p.flash>0)p.flash--;

    if(p.isProduct)nProduct++;else nReactant++;
  });

  // Draw particles
  particles.forEach(function(p){
    var color=p.isProduct?'#f87171':'#38bdf8';
    if(p.flash>0){
      ctx.beginPath();ctx.arc(p.x,p.y,14*(p.flash/12),0,Math.PI*2);
      ctx.fillStyle=color+'33';ctx.fill();
    }
    ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=color;ctx.font='bold 7px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.isProduct?'P':'R',p.x,p.y);
  });

  // Store history
  if(t%2===0){
    concHistory.push({r:nReactant/NUM,p:nProduct/NUM});
    var fwdRate=kf*(nReactant/NUM);
    var revRate=kr*(nProduct/NUM);
    rateHistory.push({fwd:fwdRate,rev:revRate});
    if(concHistory.length>MAX_HIST){concHistory.shift();rateHistory.shift();}
  }

  // ── Right panel: concentration bars ──
  var bx=430,by=20,bw=120,bh=H-130;
  ctx.fillStyle='rgba(255,255,255,0.05)';ctx.fillRect(bx,by,bw,bh);
  ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;ctx.strokeRect(bx,by,bw,bh);

  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('Concentrations',bx+bw/2,by+14);

  var rFrac=nReactant/NUM,pFrac=nProduct/NUM;
  var barH=(bh-40)/2-8;

  // Reactant bar
  ctx.fillStyle='rgba(56,189,248,0.15)';ctx.fillRect(bx+10,by+26,bw-20,barH);
  ctx.fillStyle='#38bdf8';ctx.fillRect(bx+10,by+26+(1-rFrac)*barH,bw-20,rFrac*barH);
  ctx.fillStyle='#38bdf8';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('[R] = '+nReactant,bx+bw/2,by+26+barH+13);

  // Product bar
  ctx.fillStyle='rgba(248,113,113,0.15)';ctx.fillRect(bx+10,by+26+barH+22,bw-20,barH);
  ctx.fillStyle='#f87171';ctx.fillRect(bx+10,by+26+barH+22+(1-pFrac)*barH,bw-20,pFrac*barH);
  ctx.fillStyle='#f87171';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('[P] = '+nProduct,bx+bw/2,by+26+barH*2+35);

  // K display
  var kObserved=rFrac>0?(pFrac/rFrac).toFixed(2):'—';
  ctx.fillStyle='rgba(250,204,21,0.15)';ctx.beginPath();ctx.roundRect(bx+4,by+bh-38,bw-8,30,5);ctx.fill();
  ctx.strokeStyle='rgba(250,204,21,0.4)';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(bx+4,by+bh-38,bw-8,30,5);ctx.stroke();
  ctx.fillStyle='#facc15';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('K = '+kObserved,bx+bw/2,by+bh-26);
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='9px monospace';
  ctx.fillText('(target: '+K_EQ.toFixed(1)+')',bx+bw/2,by+bh-14);

  // ── Bottom: rate graph ──
  var gx=430,gy=H-90,gw=250,gh=78;
  ctx.fillStyle='rgba(255,255,255,0.04)';ctx.fillRect(gx,gy,gw,gh);
  ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;ctx.strokeRect(gx,gy,gw,gh);
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='bold 10px monospace';ctx.textAlign='left';
  ctx.fillText('Reaction rates',gx+6,gy+12);

  if(rateHistory.length>2){
    var maxRate=0;
    rateHistory.forEach(function(r){if(r.fwd>maxRate)maxRate=r.fwd;if(r.rev>maxRate)maxRate=r.rev;});
    maxRate=Math.max(maxRate,0.001);
    ['fwd','rev'].forEach(function(key,ki){
      var color=ki===0?'#38bdf8':'#f87171';
      ctx.beginPath();
      rateHistory.forEach(function(r,i){
        var rx=gx+(i/MAX_HIST)*gw;
        var ry=gy+gh-(r[key]/maxRate)*gh*0.85;
        if(i===0)ctx.moveTo(rx,ry);else ctx.lineTo(rx,ry);
      });
      ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.stroke();
    });
  }

  ctx.fillStyle='#38bdf8';ctx.font='9px monospace';ctx.textAlign='left';ctx.fillText('fwd',gx+gw-38,gy+20);
  ctx.fillStyle='#f87171';ctx.fillText('rev',gx+gw-38,gy+32);

  // Equilibrium label
  var atEq=Math.abs(nReactant/NUM-1/(1+K_EQ))<0.08;
  if(atEq&&t>80){
    ctx.fillStyle='rgba(74,222,128,0.8)';ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText('\u2713 Equilibrium reached',gx+gw/2,gy+gh+14);
  } else {
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText('Approaching equilibrium...',gx+gw/2,gy+gh+14);
  }

  // Labels
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('R \u21cc P  (reversible reaction)',215,H-94);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 390,
    },

    // ── Challenge 1 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `For the reaction H₂(g) + I₂(g) ⇌ 2HI(g), the equilibrium constant K = 49 at a certain temperature. If you start with only H₂ and I₂ (no HI), which statement correctly describes the equilibrium state?`,
      options: [
        { label: 'A', text: 'K = 49 means the reaction goes to completion — essentially all reactants are converted to HI' },
        { label: 'B', text: 'K = 49 means products are favoured at equilibrium — mostly HI is present, but significant amounts of H₂ and I₂ remain' },
        { label: 'C', text: 'K = 49 means reactants are favoured — mostly H₂ and I₂ remain' },
        { label: 'D', text: 'K = 49 tells us nothing about concentrations — only about the rate of reaction' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! K = 49 means [HI]²/([H₂][I₂]) = 49 at equilibrium. Since K > 1, products are favoured — HI is the dominant species. But K = 49 is not enormous (K > 10⁶ would indicate near-complete conversion), so appreciable amounts of H₂ and I₂ remain. For example, starting with 1 M each of H₂ and I₂, you'd reach roughly 0.78 M HI with 0.11 M each of H₂ and I₂.",
      failMessage: "K = 49 means [HI]²/([H₂][I₂]) = 49. Since K > 1, products (HI) are favoured — HI concentration is higher than the reactants at equilibrium. But K = 49 is not so large that the reaction goes essentially to completion (that requires K >> 10⁶). Significant amounts of H₂ and I₂ remain at equilibrium.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Le Chatelier's Principle: Shifting the Balance

One of the most practically useful ideas in chemistry is **Le Chatelier's principle**, formulated by Henri Le Chatelier in 1884:

> **If a system at equilibrium is subjected to a stress, the system will shift in the direction that partially counteracts the stress and re-establishes equilibrium.**

"Stress" means any change that disturbs the equilibrium: adding or removing a reactant or product, changing pressure (for gas reactions), or changing temperature.

The principle doesn't tell you by how much the system shifts — it tells you the direction. To understand why each stress causes the observed shift, think about what happens to the reaction quotient Q and how the system adjusts to bring Q back to K.

**Adding a reactant:** The system shifts forward (toward products) to consume the added reactant and re-establish K. Adding more N₂ to an N₂/H₂/NH₃ equilibrium produces more NH₃.

**Removing a product:** The system shifts forward to replace the lost product. This is used industrially — continuously removing a product drives a reaction to near-complete conversion even when K is only moderate.

**Increasing pressure (gas reactions):** The system shifts toward the side with fewer moles of gas, reducing the total moles and thus the pressure. N₂ + 3H₂ ⇌ 2NH₃ has 4 moles of gas on the left and 2 on the right — increased pressure shifts it right, toward NH₃. This is exploited in the Haber process.

**Increasing temperature:** The system shifts in the endothermic direction. For an exothermic reaction like N₂ + 3H₂ ⇌ 2NH₃ (ΔH = −92 kJ/mol), the forward reaction is exothermic — adding heat favours the reverse reaction, reducing NH₃ yield. This is the cruel dilemma of the Haber process: the reaction needs high temperature for reasonable rate but high temperature reduces equilibrium yield.`,
    },

    // ── Visual 2 — Le Chatelier interactive ────────────────────────────────────
    {
      type: 'js',
      instruction: `### Le Chatelier's principle — apply stresses and watch the shift

The simulation shows N₂ + 3H₂ ⇌ 2NH₃ at equilibrium. Apply stresses using the buttons and watch the system shift. The bars track concentrations in real time. Notice that K (temperature permitting) is always restored after the shift.`,
      html: `<div style="padding:10px 14px 0;background:#0a0f1e">
  <div style="display:flex;gap:8px;flex-wrap:wrap" id="stress-btns"></div>
  <div style="color:rgba(255,255,255,0.35);font-size:10px;font-family:monospace;margin-top:6px" id="stress-desc">System at equilibrium. Apply a stress.</div>
</div>
<canvas id="cv" width="700" height="280"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

// N2 + 3H2 <-> 2NH3
// At equilibrium: [N2]=0.5, [H2]=0.5, [NH3]=1.0  => K=[NH3]^2/([N2][H2]^3) = 1/(0.5*0.125)=16
var K_BASE=16.0;
var K_HOT=2.0; // K at higher temperature (exothermic, so K decreases)

var state={
  N2:0.5,H2:0.5,NH3:1.0,
  T:'normal', // normal or hot
  K:K_BASE,
  shifting:false,
  shiftDir:0, // +1 forward, -1 reverse
  shiftRate:0.008
};

var stressDescs={
  'add-N2':'Added N₂ — system shifts forward (right) to consume excess N₂, producing more NH₃.',
  'remove-NH3':'Removed NH₃ — system shifts forward to replace it.',
  'increase-P':'Increased pressure — shifts toward fewer gas moles (right: 2 mol vs left: 4 mol). More NH₃.',
  'increase-T':'Increased temperature — shifts endothermic (reverse) direction. Less NH₃. K decreases.',
  'reset':'System reset to original equilibrium.'
};

var stresses=[
  {id:'add-N2',   label:'Add N₂',        color:'#4ade80'},
  {id:'remove-NH3',label:'Remove NH₃',   color:'#38bdf8'},
  {id:'increase-P',label:'↑ Pressure',   color:'#a78bfa'},
  {id:'increase-T',label:'↑ Temperature',color:'#f87171'},
  {id:'reset',    label:'Reset',          color:'#94a3b8'},
];

var btnContainer=document.getElementById('stress-btns');
var stressDesc=document.getElementById('stress-desc');
stresses.forEach(function(s){
  var btn=document.createElement('button');
  btn.textContent=s.label;
  btn.style.cssText='padding:6px 12px;border-radius:7px;border:1.5px solid '+s.color+'88;background:'+s.color+'15;color:'+s.color+';font-family:monospace;font-size:11px;font-weight:700;cursor:pointer;';
  btn.onclick=function(){
    stressDesc.textContent=stressDescs[s.id];
    if(s.id==='add-N2'){state.N2+=0.4;state.shifting=true;state.shiftDir=1;}
    else if(s.id==='remove-NH3'){state.NH3=Math.max(0.1,state.NH3-0.5);state.shifting=true;state.shiftDir=1;}
    else if(s.id==='increase-P'){state.N2*=1.4;state.H2*=1.4;state.NH3*=1.4;state.shifting=true;state.shiftDir=1;}
    else if(s.id==='increase-T'){state.T=state.T==='hot'?'normal':'hot';state.K=state.T==='hot'?K_HOT:K_BASE;state.shifting=true;state.shiftDir=state.T==='hot'?-1:1;btn.textContent=state.T==='hot'?'↓ Temperature':'↑ Temperature';}
    else if(s.id==='reset'){state.N2=0.5;state.H2=0.5;state.NH3=1.0;state.T='normal';state.K=K_BASE;state.shifting=false;state.shiftDir=0;}
  };
  btnContainer.appendChild(btn);
});

function getQ(){return(state.NH3*state.NH3)/(state.N2*state.H2*state.H2*state.H2);}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Nudge concentrations toward equilibrium
  if(state.shifting){
    var Q=getQ();
    var ratio=Q/state.K;
    if(ratio<0.98){
      // Shift forward
      var dn=state.shiftRate;
      state.N2=Math.max(0.01,state.N2-dn);
      state.H2=Math.max(0.01,state.H2-3*dn);
      state.NH3+=2*dn;
    } else if(ratio>1.02){
      // Shift reverse
      var dn2=state.shiftRate;
      state.N2+=dn2;
      state.H2+=3*dn2;
      state.NH3=Math.max(0.01,state.NH3-2*dn2);
    } else {
      state.shifting=false;state.shiftDir=0;
    }
  }

  // Equation display
  var eqColor=state.T==='hot'?'#f87171':'#4ade80';
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 14px monospace';ctx.textAlign='center';
  ctx.fillText('N\u2082 + 3H\u2082  \u21cc  2NH\u2083',W/2,28);
  ctx.fillStyle=eqColor;ctx.font='11px monospace';
  ctx.fillText(state.T==='hot'?'\u0394H = \u221292 kJ/mol (exothermic \u2192 \u2190 shifts at high T)':'K = '+state.K.toFixed(1)+' | \u0394H = \u221292 kJ/mol (exothermic)',W/2,44);

  // Three concentration bars
  var species=[
    {name:'N\u2082',val:state.N2,color:'#38bdf8',max:2.0},
    {name:'H\u2082',val:state.H2,color:'#a78bfa',max:3.0},
    {name:'NH\u2083',val:state.NH3,color:'#4ade80',max:3.0},
  ];

  var barAreaX=60,barAreaW=W-120,barH=50,barGap=18;
  var startY=68;

  species.forEach(function(sp,i){
    var by=startY+i*(barH+barGap);
    var frac=Math.min(sp.val/sp.max,1);

    // Background
    ctx.fillStyle='rgba(255,255,255,0.04)';ctx.fillRect(barAreaX,by,barAreaW,barH);
    // Fill
    var barColor=sp.color;
    if(state.shifting){
      // Flash if changing
      var pulse=0.6+0.4*Math.sin(t*0.3);
      barColor=sp.color+(Math.round(pulse*255)).toString(16).padStart(2,'0');
    }
    ctx.fillStyle=sp.color;ctx.fillRect(barAreaX,by,frac*barAreaW,barH);
    ctx.fillStyle=sp.color+'33';ctx.fillRect(barAreaX+frac*barAreaW,by,(1-frac)*barAreaW,barH);

    // Label
    ctx.fillStyle='rgba(255,255,255,0.85)';ctx.font='bold 12px monospace';ctx.textAlign='left';
    ctx.fillText(sp.name,barAreaX-48,by+barH/2+5);
    ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 12px monospace';ctx.textAlign='right';
    ctx.fillText(sp.val.toFixed(3)+' M',barAreaX+barAreaW+52,by+barH/2+5);
  });

  // Q and K display
  var Q=getQ();
  var atEq=Math.abs(Q/state.K-1)<0.05;
  var qColor=atEq?'#4ade80':Q<state.K?'#38bdf8':'#f87171';

  ctx.fillStyle='rgba(255,255,255,0.06)';ctx.beginPath();ctx.roundRect(W/2-160,H-42,320,34,6);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(W/2-160,H-42,320,34,6);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Q = '+(isFinite(Q)?Q.toFixed(2):'...'),W/2-70,H-22);
  ctx.fillStyle='#facc15';ctx.fillText('K = '+state.K.toFixed(1),W/2+20,H-22);
  ctx.fillStyle=qColor;ctx.font='bold 11px monospace';
  ctx.fillText(atEq?'\u2713 Equilibrium':(Q<state.K?'\u2192 Shifting forward':'\u2190 Shifting reverse'),W/2+100,H-22);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 370,
    },

    // ── Challenge 2 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `The Haber process makes ammonia: N₂ + 3H₂ ⇌ 2NH₃, ΔH = −92 kJ/mol. Industrial plants operate at ~200 atm and ~400°C — seemingly contradictory conditions. What is the correct explanation for using high temperature despite it reducing the equilibrium yield?`,
      options: [
        { label: 'A', text: 'High temperature increases K and shifts equilibrium toward NH₃' },
        { label: 'B', text: 'High temperature is needed for an acceptable reaction rate despite reducing equilibrium yield — the rate gain outweighs the yield loss at industrial scales, especially with continuous product removal' },
        { label: 'C', text: 'Temperature has no effect on K for gas-phase reactions' },
        { label: 'D', text: 'The catalyst only works at high temperature, so 400°C is required for the catalyst, not for rate' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! This is the central compromise of the Haber process. Since ΔH < 0 (exothermic), increasing T shifts equilibrium left (Le Chatelier) and reduces K — the theoretical yield drops. But at lower temperatures, the activation energy is barely surmounted and the rate is so slow the process is economically impractical. The 400°C compromise gives a tolerable rate with a moderate yield (~15%). Continuous removal of NH₃ and recycling of unreacted gases compensates for the incomplete conversion.",
      failMessage: "High temperature actually hurts equilibrium yield for this exothermic reaction — Le Chatelier says heat shifts the equilibrium in the endothermic (reverse) direction, reducing K. The reason for 400°C is kinetic: without high temperature, the rate over the iron catalyst is too slow for industrial production. It's a compromise between rate (needs high T) and yield (wants low T). Continuous NH₃ removal compensates for the moderate yield.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Reaction Quotient Q: Where Are You Relative to Equilibrium?

The equilibrium constant K tells you where the system ends up. The **reaction quotient Q** tells you where the system is right now — and which direction it needs to move.

Q has the same mathematical form as K, but uses current concentrations (not equilibrium concentrations):

$$Q = \\frac{[C]^c[D]^d}{[A]^a[B]^b} \\quad \\text{(current concentrations)}$$

Comparing Q to K tells you the direction of spontaneous change:

- **Q < K:** The numerator (products) is too small relative to the denominator (reactants). The reaction proceeds **forward** to increase products and decrease reactants until Q = K.
- **Q > K:** Too much product relative to reactant. The reaction proceeds **reverse** to decrease products and increase reactants until Q = K.
- **Q = K:** The system is at equilibrium. No net change.

This is enormously useful. Given any set of concentrations, you can instantly predict which direction the reaction will proceed. You don't need to run the experiment — just calculate Q, compare to K, and you know.

**Example:** For N₂ + 3H₂ ⇌ 2NH₃, K = 16 at a certain temperature. You mix N₂ at 1.0 M, H₂ at 2.0 M, and NH₃ at 0.5 M. What happens?

Q = [NH₃]²/([N₂][H₂]³) = (0.5)²/(1.0 × 2.0³) = 0.25/8.0 = 0.031

Q = 0.031 < K = 16, so the reaction shifts forward — more NH₃ forms until Q = 16.

This Q vs K framework is the quantitative heart of Le Chatelier's principle.`,
    },

    // ── Visual 3 — Q vs K number line ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Q versus K: predicting reaction direction

The interactive shows a number line where K is fixed. Drag the Q slider to different positions and see how the system responds. Q < K means forward reaction; Q > K means reverse reaction; Q = K means equilibrium.`,
      html: `<div style="padding:12px 14px 0;background:#0a0f1e">
  <div style="display:flex;align-items:center;gap:12px">
    <span style="color:rgba(255,255,255,0.5);font-size:12px;font-family:monospace;white-space:nowrap">Q value: <span id="Q-lbl" style="color:#38bdf8;font-weight:700;font-size:15px">2.0</span></span>
    <input type="range" id="Q-sl" min="0.1" max="40" value="2" step="0.1" style="flex:1">
    <span style="color:rgba(255,255,255,0.3);font-size:11px;font-family:monospace">K = 16 (fixed)</span>
  </div>
</div>
<canvas id="cv" width="700" height="240"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var QSl=document.getElementById('Q-sl');
var QLbl=document.getElementById('Q-lbl');
var K_VAL=16;

function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var Q=parseFloat(QSl.value);
  QLbl.textContent=Q.toFixed(1);

  // Number line
  var lx=60,ly=H/2-10,lw=W-120;
  // Log scale: 0.01 to 1000
  var logMin=-2,logMax=3; // log10
  function toX(val){return lx+(Math.log10(val)-logMin)/(logMax-logMin)*lw;}

  // Background gradient
  var grad=ctx.createLinearGradient(lx,0,lx+lw,0);
  grad.addColorStop(0,'rgba(56,189,248,0.15)');
  grad.addColorStop(0.5,'rgba(74,222,128,0.08)');
  grad.addColorStop(1,'rgba(248,113,113,0.15)');
  ctx.fillStyle=grad;ctx.fillRect(lx,ly-28,lw,56);

  // Region labels
  var kX=toX(K_VAL);
  ctx.fillStyle='rgba(56,189,248,0.4)';ctx.fillRect(lx,ly-28,kX-lx,56);
  ctx.fillStyle='rgba(248,113,113,0.4)';ctx.fillRect(kX,ly-28,lw-(kX-lx),56);

  ctx.fillStyle='rgba(56,189,248,0.8)';ctx.font='bold 13px monospace';ctx.textAlign='center';
  ctx.fillText('Q < K',lx+(kX-lx)/2,ly-8);
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='10px monospace';
  ctx.fillText('Reaction shifts \u2192 FORWARD',lx+(kX-lx)/2,ly+8);
  ctx.fillText('(more product forms)',lx+(kX-lx)/2,ly+22);

  ctx.fillStyle='rgba(248,113,113,0.8)';ctx.font='bold 13px monospace';
  ctx.fillText('Q > K',kX+(lx+lw-kX)/2,ly-8);
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='10px monospace';
  ctx.fillText('Reaction shifts \u2190 REVERSE',kX+(lx+lw-kX)/2,ly+8);
  ctx.fillText('(more reactant forms)',kX+(lx+lw-kX)/2,ly+22);

  // Line
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(lx,ly-28);ctx.lineTo(lx,ly+28);ctx.moveTo(lx+lw,ly-28);ctx.lineTo(lx+lw,ly+28);ctx.stroke();
  ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+lw,ly);ctx.stroke();

  // Tick marks (log scale)
  [0.01,0.1,1,10,100,1000].forEach(function(v){
    var x=toX(v);
    if(x<lx||x>lx+lw)return;
    ctx.beginPath();ctx.moveTo(x,ly+28);ctx.lineTo(x,ly+36);
    ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText(v,x,ly+48);
  });
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText('Q (log scale)',lx+lw/2,ly+62);

  // K marker
  ctx.strokeStyle='#facc15';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(kX,ly-38);ctx.lineTo(kX,ly+38);ctx.stroke();
  ctx.fillStyle='#facc15';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('K = '+K_VAL,kX,ly-48);
  ctx.fillStyle='rgba(74,222,128,0.8)';ctx.font='bold 10px monospace';
  ctx.fillText('\u2193 EQUILIBRIUM',kX,ly+52);

  // Q marker
  var qX=Math.max(lx+6,Math.min(lx+lw-6,toX(Q)));
  var qColor=Q<K_VAL*0.97?'#38bdf8':Q>K_VAL*1.03?'#f87171':'#4ade80';
  // Arrow toward K
  if(Math.abs(Q-K_VAL)/K_VAL>0.04){
    var arrowDir=Q<K_VAL?1:-1;
    var ax=qX+arrowDir*30,ay=ly-4;
    ctx.beginPath();ctx.moveTo(qX,ly);ctx.lineTo(ax,ay);
    ctx.strokeStyle=qColor+'cc';ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.moveTo(ax-arrowDir*10,ay-5);ctx.lineTo(ax,ay);ctx.lineTo(ax-arrowDir*10,ay+5);
    ctx.strokeStyle=qColor+'cc';ctx.stroke();
  }

  ctx.beginPath();ctx.arc(qX,ly,10,0,Math.PI*2);
  ctx.fillStyle=qColor;ctx.shadowColor=qColor;ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#000';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Q',qX,ly);ctx.textBaseline='alphabetic';

  ctx.fillStyle=qColor;ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('Q = '+Q.toFixed(1),qX,ly-18);

  // Bottom conclusion
  var msg=Q<K_VAL*0.97?'Q < K: reaction proceeds FORWARD until Q = K':
          Q>K_VAL*1.03?'Q > K: reaction proceeds REVERSE until Q = K':
          'Q \u2248 K: system is at EQUILIBRIUM';
  ctx.fillStyle=qColor;ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText(msg,W/2,H-12);
}

QSl.oninput=render;
render();`,
      outputHeight: 300,
    },

    // ── Section 5 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Equilibrium in Biology and Industry

Equilibrium is not an abstraction — it runs through everything from your bloodstream to fertiliser production.

**Haemoglobin and oxygen transport.** Haemoglobin (Hb) in red blood cells reversibly binds oxygen:

Hb + O₂ ⇌ HbO₂

In the lungs, where pO₂ is high (≈100 mmHg), Q < K → equilibrium shifts right → Hb loads up with O₂. In working muscles, where pO₂ is low (≈20 mmHg), Q > K → equilibrium shifts left → Hb releases O₂. The same equilibrium, shifting in opposite directions in two different locations, precisely delivering oxygen where it is needed. Le Chatelier's principle running your metabolism.

**Blood pH buffering.** The carbonate buffer system:

CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻

This equilibrium system resists changes in blood pH. If H⁺ increases (acid added), the equilibrium shifts left, consuming H⁺. If H⁺ decreases, it shifts right, producing more H⁺. Blood pH is maintained at 7.35–7.45; deviations of 0.2 units cause serious physiological effects.

**The Haber process.** N₂ + 3H₂ ⇌ 2NH₃ is responsible for producing ammonia for virtually all nitrogen fertilisers — which feed about half the world's population. The process conditions (high pressure, moderate temperature, iron catalyst, continuous product removal) are an optimised solution to the equilibrium-rate dilemma we discussed.

**Stalactites and stalagmites.** CaCO₃(s) + CO₂(g) + H₂O(l) ⇌ Ca²⁺(aq) + 2HCO₃⁻(aq). Rainwater picks up CO₂ from the atmosphere and soil, shifting equilibrium right, dissolving limestone. In caves where CO₂ concentrations are lower, equilibrium shifts left, depositing CaCO₃ as calcite crystals — slowly, over millions of years, building the spectacular formations we call stalactites.`,
    },

    // ── Visual 4 — Haemoglobin oxygen binding ───────────────────────────────────
    {
      type: 'js',
      instruction: `### Haemoglobin: Le Chatelier's principle in your blood

The simulation shows haemoglobin molecules at two locations — lungs (high O₂ pressure) and muscles (low O₂ pressure). Watch how the same equilibrium shifts in opposite directions depending on the local oxygen concentration, loading and unloading O₂ as haemoglobin circulates.`,
      html: `<canvas id="cv" width="700" height="320"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

// Left = Lungs (high pO2), Right = Muscles (low pO2)
// Hb molecules travel between them
var HB_NUM=8;
var hbMolecules=[];

// In lungs: Hb loads O2 (shifts right: Hb + O2 -> HbO2)
// In muscles: HbO2 releases O2 (shifts left: HbO2 -> Hb + O2)

for(var i=0;i<HB_NUM;i++){
  hbMolecules.push({
    x:100+Math.random()*120,
    y:80+Math.random()*(H-160),
    bound:i<6, // most start bound (in lungs)
    phase:Math.random()*Math.PI*2,
    traveling:false,
    travelDir:1, // 1=toward muscles, -1=toward lungs
    travelProgress:0
  });
}

var o2Particles=[];
// Free O2 in lungs
for(var j=0;j<14;j++){
  o2Particles.push({
    x:30+Math.random()*240,
    y:30+Math.random()*(H-60),
    vx:(Math.random()-0.5)*1.2,vy:(Math.random()-0.5)*1.2,
    loc:'lungs', // lungs or muscles
    phase:Math.random()*Math.PI*2
  });
}
// Released O2 in muscles (fewer)
for(var k=0;k<4;k++){
  o2Particles.push({
    x:420+Math.random()*240,y:30+Math.random()*(H-60),
    vx:(Math.random()-0.5)*1.2,vy:(Math.random()-0.5)*1.2,
    loc:'muscles',phase:Math.random()*Math.PI*2
  });
}

function drawHb(x,y,bound,size){
  size=size||18;
  var color=bound?'#f97316':'#94a3b8';
  // Hb body
  ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);
  ctx.fillStyle='#1e293b';ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.stroke();
  ctx.fillStyle=color;ctx.font='bold '+(size>15?'9':'7')+'px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(bound?'HbO\u2082':'Hb',x,y);
  // O2 attached indicator
  if(bound){
    ctx.beginPath();ctx.arc(x+size*0.7,y-size*0.7,7,0,Math.PI*2);
    ctx.fillStyle='#f87171';ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 6px monospace';
    ctx.fillText('O\u2082',x+size*0.7,y-size*0.7);
  }
}

function drawO2(x,y){
  ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);
  ctx.fillStyle='#f87171';ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 6px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('O\u2082',x,y);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Panel backgrounds
  ctx.fillStyle='rgba(56,189,248,0.07)';ctx.fillRect(4,4,310,H-8);
  ctx.fillStyle='rgba(248,113,113,0.07)';ctx.fillRect(W-314,4,310,H-8);
  ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;
  ctx.strokeRect(4,4,310,H-8);ctx.strokeRect(W-314,4,310,H-8);

  // Panel labels
  ctx.fillStyle='#38bdf8';ctx.font='bold 13px monospace';ctx.textAlign='center';
  ctx.fillText('\ud83e\udec1 LUNGS',160,24);
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';
  ctx.fillText('High pO\u2082 (\u2248100 mmHg)',160,38);
  ctx.fillText('Q < K \u2192 Hb + O\u2082 \u2192 HbO\u2082',160,52);

  ctx.fillStyle='#f87171';ctx.font='bold 13px monospace';ctx.textAlign='center';
  ctx.fillText('\ud83d\udcaa MUSCLES',W-160,24);
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';
  ctx.fillText('Low pO\u2082 (\u224820 mmHg)',W-160,38);
  ctx.fillText('Q > K \u2192 HbO\u2082 \u2192 Hb + O\u2082',W-160,52);

  // Central arrow (circulation)
  var arrY=H/2;
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=2;ctx.setLineDash([6,4]);
  ctx.beginPath();ctx.moveTo(320,arrY-14);ctx.lineTo(380,arrY-14);ctx.stroke();
  ctx.beginPath();ctx.moveTo(380,arrY+14);ctx.lineTo(320,arrY+14);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText('blood',W/2,arrY-20);ctx.fillText('circulation',W/2,arrY-8);
  // Arrowheads
  ctx.beginPath();ctx.moveTo(376,arrY-20);ctx.lineTo(382,arrY-14);ctx.lineTo(376,arrY-8);ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.stroke();
  ctx.beginPath();ctx.moveTo(324,arrY+8);ctx.lineTo(318,arrY+14);ctx.lineTo(324,arrY+20);ctx.stroke();

  // Update O2 particles
  o2Particles.forEach(function(p){
    p.x+=p.vx;p.y+=p.vy;
    p.vx+=(Math.random()-0.5)*0.06;p.vy+=(Math.random()-0.5)*0.06;
    var maxS=1.5;var spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
    if(spd>maxS){p.vx*=maxS/spd;p.vy*=maxS/spd;}
    var bounds=p.loc==='lungs'?{x1:10,x2:308,y1:10,y2:H-10}:{x1:W-308,x2:W-10,y1:10,y2:H-10};
    if(p.x<bounds.x1){p.x=bounds.x1;p.vx=Math.abs(p.vx);}
    if(p.x>bounds.x2){p.x=bounds.x2;p.vx=-Math.abs(p.vx);}
    if(p.y<bounds.y1){p.y=bounds.y1;p.vy=Math.abs(p.vy);}
    if(p.y>bounds.y2){p.y=bounds.y2;p.vy=-Math.abs(p.vy);}
    drawO2(p.x,p.y);
  });

  // Update Hb molecules
  hbMolecules.forEach(function(hb){
    hb.phase+=0.03;
    if(!hb.traveling){
      var jitter=Math.sin(hb.phase)*3;
      // In lungs: load O2
      if(hb.x<320&&!hb.bound&&Math.random()<0.005){
        hb.bound=true;
        // Remove an O2 particle from lungs
        var idx=o2Particles.findIndex(function(p){return p.loc==='lungs';});
        if(idx>=0)o2Particles.splice(idx,1);
      }
      // In muscles: release O2
      if(hb.x>380&&hb.bound&&Math.random()<0.008){
        hb.bound=false;
        o2Particles.push({x:hb.x+20,y:hb.y,vx:1,vy:(Math.random()-0.5),loc:'muscles',phase:Math.random()*Math.PI*2});
      }
      // Travel between
      if(Math.random()<0.003){hb.traveling=true;hb.travelDir=hb.x<320?1:-1;hb.travelProgress=0;hb.startX=hb.x;hb.startY=hb.y;}
      drawHb(hb.x+jitter*0.5,hb.y+jitter*0.5,hb.bound);
    } else {
      hb.travelProgress+=0.015;
      var destX=hb.travelDir===1?W-160:160;
      var destY=H/2+Math.sin(hb.travelProgress*Math.PI)*60*(hb.travelDir===1?-1:1);
      hb.x=hb.startX+(destX-hb.startX)*hb.travelProgress;
      hb.y=hb.startY+(destY-hb.startY)*hb.travelProgress;
      drawHb(hb.x,hb.y,hb.bound,15);
      if(hb.travelProgress>=1){
        hb.traveling=false;
        hb.x=destX+(Math.random()-0.5)*60;
        hb.y=80+Math.random()*(H-160);
      }
    }
  });

  // Occasional O2 replenishment in lungs
  if(t%90===0&&o2Particles.filter(function(p){return p.loc==='lungs';}).length<10){
    o2Particles.push({x:20+Math.random()*260,y:60+Math.random()*(H-120),vx:(Math.random()-0.5)*1,vy:(Math.random()-0.5)*1,loc:'lungs',phase:Math.random()*Math.PI*2});
  }

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 340,
    },

    // ── Challenge 3 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Carbon monoxide (CO) poisoning works because CO binds to haemoglobin about 200× more strongly than O₂. The equilibrium Hb + CO ⇌ HbCO has a much larger K than Hb + O₂ ⇌ HbO₂. How does this explain why CO is so toxic?`,
      options: [
        { label: 'A', text: 'CO reacts with O₂ in the blood, removing oxygen before it can reach haemoglobin' },
        { label: 'B', text: 'CO has a much larger K for binding haemoglobin than O₂ does. At even low CO concentrations, Q < K(CO) drives near-complete conversion to HbCO, displacing O₂ and preventing oxygen delivery to tissues' },
        { label: 'C', text: 'CO increases blood temperature, denaturing haemoglobin' },
        { label: 'D', text: 'CO blocks the lungs from absorbing O₂' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Because K(HbCO) >> K(HbO₂), even small partial pressures of CO shift the HbCO equilibrium far to the right. The CO outcompetes O₂ for haemoglobin binding sites — even at CO concentrations 200× lower than O₂, roughly half the haemoglobin is tied up as HbCO. HbCO cannot carry oxygen, so tissue oxygen delivery collapses. Treatment is 100% O₂ (shifting the equilibrium back) or hyperbaric oxygen (further increasing pO₂).",
      failMessage: "CO doesn't react with O₂ in blood or block the lungs. Its toxicity is entirely an equilibrium competition at the haemoglobin binding site. K(HbCO) is about 200× larger than K(HbO₂), so at equilibrium, CO occupies binding sites preferentially over O₂. Even low CO concentrations shift Q < K(HbCO), driving haemoglobin to bind CO instead of O₂ — preventing oxygen transport.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Challenge 4 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `For the gas-phase equilibrium PCl₅(g) ⇌ PCl₃(g) + Cl₂(g), K = 0.025 at 250°C. A student starts with only PCl₅ at 2.0 M. Which statement correctly describes what happens?`,
      options: [
        { label: 'A', text: 'Q = 0 < K = 0.025, so the reaction shifts forward. Since K << 1, only a small amount of PCl₅ decomposes before equilibrium is reached' },
        { label: 'B', text: 'K < 1 means the reaction cannot proceed forward at all' },
        { label: 'C', text: 'Starting with only reactants means the reaction will go to completion because there are no products to drive the reverse reaction' },
        { label: 'D', text: 'Q = K from the start, so no reaction occurs' },
      ],
      check: (label) => label === 'A',
      successMessage: "Correct! Initially Q = [PCl₃][Cl₂]/[PCl₅] = (0)(0)/(2.0) = 0. Since Q = 0 < K = 0.025, the system shifts forward. But K = 0.025 << 1 means equilibrium strongly favours reactants — only a small fraction of PCl₅ decomposes. At equilibrium, mostly PCl₅ remains with small amounts of PCl₃ and Cl₂. Starting with no products always gives Q = 0 < K (for any K > 0), so some forward reaction always occurs.",
      failMessage: "When you start with only reactants, Q = 0 (since [products] = 0 in the numerator). Since Q = 0 < K (for any positive K), the reaction always shifts forward initially. K = 0.025 < 1 doesn't mean no forward reaction — it means the equilibrium position strongly favours reactants. Some PCl₅ decomposes (the reaction shifts forward) but stops well short of completion because K is small.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ──────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Equilibrium: The Balance That Runs the World

Chemical equilibrium is not a curiosity or a special case — it is the default state of chemistry. Most reactions are reversible under some conditions. Almost all biological chemistry operates via coupled equilibria. Industrial chemistry exists largely to manipulate equilibria productively.

The key ideas form a coherent framework:

**K** quantifies the position of equilibrium. Large K: products favoured. Small K: reactants favoured. K depends only on temperature — not on how you got there.

**Q** tells you where you are right now. Q < K: shift forward. Q > K: shift reverse. Q = K: equilibrium.

**Le Chatelier's principle** tells you how the system responds to stress. Add reactant → shifts forward. Remove product → shifts forward. Increase pressure on a gas reaction → shifts toward fewer moles. Change temperature → shifts in the endothermic direction (for exothermic reactions, heating shifts reverse; cooling shifts forward).

**Kinetics and thermodynamics are independent.** K tells you where equilibrium lies (thermodynamics). The rate tells you how fast you get there (kinetics). A catalyst speeds up approach to equilibrium without moving the equilibrium position.

The next lesson — the final one in this course — covers acids and bases: the most important equilibrium chemistry for biology, medicine, and everyday life. Acid-base reactions are proton transfer equilibria, and the same K, Q, and Le Chatelier framework applies directly.`,
    },

  ],
};

export default {
  id: 'chem-4-3-equilibrium',
  slug: 'equilibrium',
  chapter: 'chem.4',
  order: 3,
  title: 'Equilibrium',
  subtitle: 'When reactions run both ways — and how to shift the balance.',
  tags: ['chemistry', 'equilibrium', 'equilibrium-constant', 'Le-Chatelier', 'reaction-quotient', 'Haber-process', 'haemoglobin', 'reversible-reactions', 'K', 'Q'],
  hook: {
    question: 'Why does the same haemoglobin molecule load oxygen in your lungs and release it in your muscles — using the same reaction in opposite directions?',
    realWorldContext: 'Chemical equilibrium governs blood chemistry, industrial ammonia production, cave formation, CO poisoning, and drug pharmacology. Understanding K and Le Chatelier\'s principle gives you a single framework that predicts the outcome of all of them.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Reversible reactions reach equilibrium when forward rate = reverse rate. Concentrations stop changing but both directions keep occurring.',
      'K = [products]^coeff / [reactants]^coeff at equilibrium. K > 1: products favoured; K < 1: reactants favoured. K depends only on temperature.',
      'Q uses current concentrations. Q < K → shift forward; Q > K → shift reverse; Q = K → at equilibrium.',
      'Le Chatelier: any stress shifts the equilibrium to partially counteract it. Add reactant → forward. Remove product → forward. Increase P (gas) → fewer moles side. Increase T → endothermic direction.',
    ],
    callouts: [
      { type: 'important', title: 'K vs. rate', body: 'K is thermodynamic — it tells you where equilibrium lies. Rate is kinetic — it tells you how fast you get there. A catalyst changes the rate without changing K. Only temperature changes K.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Equilibrium', props: { lesson: LESSON_CHEM_4_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Equilibrium: forward rate = reverse rate. Dynamic — both directions occur. Concentrations constant.',
    'K = Π[products]^n / Π[reactants]^n. Only gases and dissolved species. Pure solids/liquids omitted.',
    'K tells direction: K >> 1 products favoured, K << 1 reactants favoured. Temperature is the only thing that changes K.',
    'Q = same form as K but with current concentrations. Q < K → forward, Q > K → reverse, Q = K → equilibrium.',
    'Le Chatelier: stress → shift counteracts stress. Add reactant → forward. Remove product → forward. ↑P → fewer gas moles side. ↑T → endothermic direction.',
    'Haber process: ↑P favours NH₃ (fewer gas moles), ↑T hurts yield (exothermic) but needed for rate. Continuous removal compensates.',
    'Haemoglobin: same Hb + O₂ ⇌ HbO₂ equilibrium shifts right in lungs (high pO₂, Q < K) and left in muscles (low pO₂, Q > K).',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_CHEM_4_3 };
