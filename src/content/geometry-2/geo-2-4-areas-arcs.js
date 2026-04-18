// Geometry · Chapter 2 · Lesson 4
// Area Formulas and Circle Arcs

const LESSON_GEO_2_4 = {
  title: 'Area Formulas and Circle Arcs',
  subtitle: 'Why every polygon area traces back to one rectangle — and why π is the only honest way to measure a circle.',
  sequential: true,

  cells: [

    // ── Opening ────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Everything Comes from the Rectangle

Here is a striking fact: there is essentially one area formula in all of two-dimensional geometry. Everything else — triangles, parallelograms, trapezoids, regular polygons — is derived from it. That formula is:

$$\\text{Area of rectangle} = \\text{base} \\times \\text{height}$$

This seems obvious. But think about what it actually claims. It says that a two-dimensional quantity (area, measured in square units) is computed by multiplying two one-dimensional quantities (length and width). Why should that work? Why does 4 cm × 3 cm = 12 cm²?

The answer is unit analysis: 1 cm × 1 cm = 1 cm² by definition of the square unit. A 4 × 3 rectangle contains exactly 12 unit squares, arranged in a 4 × 3 grid. The formula is not an approximation or a convention — it is the definition of area for rectangles, and from it everything else follows.

The method used to derive all other area formulas from this one is called **decomposition and rearrangement**: cut the shape into pieces, rearrange them into a rectangle (or subtract from a rectangle), and compare. This approach is ancient — it appears in Euclid, in Chinese mathematics of the Han dynasty, and in Babylonian clay tablets from 2000 BCE.

Once you understand this method, you will never need to memorize another area formula. You can derive each one from scratch in under a minute.`,
    },

    // ── Parallelogram ─────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Parallelogram: Shearing Without Changing Area

A **parallelogram** has two pairs of parallel sides. Its area formula is:

$$A = \\text{base} \\times \\text{height}$$

Here, "height" means the perpendicular distance between the two parallel sides — not the length of the slanted side.

**Proof by rearrangement (shearing):** Take a parallelogram with base b and height h. Cut a right triangle from one end — the triangle formed by dropping a perpendicular from one of the top vertices to the base. Slide that triangle to the other end of the parallelogram. The result is a rectangle with base b and height h.

The cut-and-slide operation (called **shearing**) preserves area, because you are rearranging the same material. So:

$$A_{\\text{parallelogram}} = A_{\\text{rectangle}} = b \\times h$$

**Key insight:** Two parallelograms with the same base and height have equal area, even if they look completely different. A very slanted parallelogram and a nearly rectangular one are different in shape but identical in area, provided base and height are the same. This is the **Cavalieri's Principle** in two dimensions: figures with equal cross-sections at every height have equal area.

**Common mistake:** Students often multiply the base by the slant height (the actual side length of the parallelogram). This is wrong. The formula uses the perpendicular height — the altitude — not the side length.`,
    },

    // ── Triangle area ─────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Triangle: Half a Parallelogram

**Triangle area formula:**
$$A = \\frac{1}{2} \\times \\text{base} \\times \\text{height}$$

**Proof:** Every triangle is half of a parallelogram. Given triangle △ABC with base b and height h, duplicate it and rotate 180° around the midpoint of one side. The two triangles form a parallelogram with base b and height h. So:

$$A_{\\text{parallelogram}} = b \\times h = 2 \\times A_{\\text{triangle}}$$
$$\\therefore A_{\\text{triangle}} = \\frac{1}{2} b h$$

The height is again the perpendicular distance — the altitude from the vertex to the base (or its extension, for obtuse triangles).

**Alternative: Three Different Bases.** A triangle has three sides, any one of which can serve as the base — and for each choice of base, there is a corresponding height. All three give the same area:

$$\\frac{1}{2} a h_a = \\frac{1}{2} b h_b = \\frac{1}{2} c h_c$$

This isn't a coincidence — it's a consequence of the uniqueness of area.

**Heron's Formula** — area from three sides alone, without needing a height:

$$A = \\sqrt{s(s-a)(s-b)(s-c)} \\quad \\text{where } s = \\frac{a+b+c}{2}$$

Here s is the **semi-perimeter**. Heron of Alexandria proved this in the 1st century CE. It requires no angles and no heights — only the three side lengths. This is useful when heights are hard to measure but side lengths are known.`,
    },

    // ── Visual 1 — Area derivation interactive ────────────────────────────────
    {
      type: 'js',
      instruction: `### Area Formulas by Decomposition

Watch each area formula derived by rearranging pieces. Select a shape, then animate the rearrangement to see how it traces back to the rectangle.`,
      html: `<div style="padding:8px 14px 0;background:#fafaf8;display:flex;gap:8px;flex-wrap:wrap" id="shape-btns"></div>
<canvas id="cv" width="700" height="300"></canvas>
<div id="area-panel" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:#fafaf8;border-top:1px solid #e2e8f0;line-height:1.7"></div>`,
      css: `body{margin:0;background:#fafaf8}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var t=0,animating=false,selected=0;
var shapes=[
  {name:'Parallelogram',color:'#1e3a5f',
   formula:'A = base × height',
   note:'Cut the right triangle from one end, slide to the other end → rectangle b×h.'},
  {name:'Triangle',color:'#1a3a2a',
   formula:'A = ½ × base × height',
   note:'Duplicate the triangle, rotate 180° → parallelogram b×h. Triangle is half.'},
  {name:'Trapezoid',color:'#92400e',
   formula:'A = ½(a+b) × height',
   note:'Two trapezoids form a parallelogram with base (a+b). Each trapezoid is half.'},
];

var btnContainer=document.getElementById('shape-btns');
var btns=[];
shapes.forEach(function(s,i){
  var btn=document.createElement('button');
  btn.textContent=s.name;
  btn.style.cssText='padding:6px 14px;border-radius:7px;border:1.5px solid '+s.color+';'+(i===0?'background:'+s.color+'22;color:'+s.color:'background:transparent;color:rgba(55,65,81,0.5)')+';font-family:Georgia,serif;font-size:12px;font-weight:700;cursor:pointer;';
  btn.onclick=function(){
    selected=i;t=0;animating=true;
    btns.forEach(function(b,j){b.style.background=j===i?shapes[j].color+'22':'transparent';b.style.color=j===i?shapes[j].color:'rgba(55,65,81,0.5)';});
    if(!animating)requestAnimationFrame(loop);
  };
  btnContainer.appendChild(btn);btns.push(btn);
});

var b=220,h=90,slant=50;
var ox=100,oy=H/2;

function drawParallelogram(progress){
  var cutX=ox+slant; // where the triangle is cut
  var moveX=progress*b; // how far the triangle has moved

  // Original parallelogram positions
  var P1={x:ox+slant,y:oy-h};
  var P2={x:ox+slant+b,y:oy-h};
  var P3={x:ox+b,y:oy};
  var P4={x:ox,y:oy};

  // Fill parallelogram body (rectangle part)
  ctx.fillStyle=shapes[0].color+'22';
  ctx.beginPath();ctx.moveTo(ox+slant,oy-h);ctx.lineTo(ox+slant+b,oy-h);ctx.lineTo(ox+b,oy);ctx.lineTo(ox+slant,oy);ctx.closePath();ctx.fill();
  ctx.strokeStyle=shapes[0].color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ox+slant,oy-h);ctx.lineTo(ox+slant+b,oy-h);ctx.lineTo(ox+b,oy);ctx.lineTo(ox+slant,oy);ctx.closePath();ctx.stroke();

  // Moving triangle
  var triOx=progress<1?ox-moveX:ox+b;
  ctx.fillStyle=shapes[0].color+'44';
  ctx.beginPath();ctx.moveTo(triOx,oy);ctx.lineTo(triOx+slant,oy-h);ctx.lineTo(triOx+slant,oy);ctx.closePath();ctx.fill();
  ctx.strokeStyle=shapes[0].color;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(triOx,oy);ctx.lineTo(triOx+slant,oy-h);ctx.lineTo(triOx+slant,oy);ctx.closePath();ctx.stroke();

  // Arrow showing direction of movement
  if(progress>0&&progress<1){
    ctx.strokeStyle=shapes[0].color;ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(ox,oy-h/2);ctx.lineTo(ox+slant+b,oy-h/2);ctx.stroke();ctx.setLineDash([]);
  }

  // Height annotation
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1;ctx.setLineDash([3,3]);
  ctx.beginPath();ctx.moveTo(ox+slant,oy-h);ctx.lineTo(ox+slant,oy);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#64748b';ctx.font='12px Georgia';ctx.textAlign='center';ctx.fillText('h='+h,ox+slant-18,oy-h/2);
  ctx.fillText('b='+b,ox+slant+b/2,oy+18);

  // Formula result
  ctx.fillStyle=shapes[0].color;ctx.font='bold 14px Georgia';ctx.textAlign='left';
  ctx.fillText('A = b × h = '+b+' × '+h+' = '+(b*h),ox,H-10);
}

function drawTriangle(progress){
  var tx=ox+60,ty=oy-h,tb=b;
  // Original triangle
  ctx.fillStyle=shapes[1].color+'22';
  ctx.beginPath();ctx.moveTo(tx-tb/2,oy);ctx.lineTo(tx+tb/2,oy);ctx.lineTo(tx,ty);ctx.closePath();ctx.fill();
  ctx.strokeStyle=shapes[1].color;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(tx-tb/2,oy);ctx.lineTo(tx+tb/2,oy);ctx.lineTo(tx,ty);ctx.closePath();ctx.stroke();

  // Duplicate triangle, rotating in
  var angle=-Math.PI*progress;
  ctx.save();ctx.translate(tx+tb/2,oy);ctx.rotate(angle);
  ctx.fillStyle=shapes[1].color+'44';
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-tb,0);ctx.lineTo(-tb/2,-h);ctx.closePath();ctx.fill();
  ctx.strokeStyle=shapes[1].color;ctx.lineWidth=2;ctx.setLineDash([5,4]);
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-tb,0);ctx.lineTo(-tb/2,-h);ctx.closePath();ctx.stroke();ctx.setLineDash([]);
  ctx.restore();

  // Height
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1;ctx.setLineDash([3,3]);
  ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx,oy);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#64748b';ctx.font='12px Georgia';ctx.textAlign='right';ctx.fillText('h='+h,tx-5,oy-h/2);
  ctx.textAlign='center';ctx.fillText('b='+b,tx,oy+18);

  ctx.fillStyle=shapes[1].color;ctx.font='bold 14px Georgia';ctx.textAlign='left';
  ctx.fillText('A = ½ × b × h = ½ × '+b+' × '+h+' = '+(b*h/2),ox,H-10);
}

function drawTrapezoid(progress){
  var a=160,bb=240,th=h;
  var tx=ox+20,ty=oy;
  // First trapezoid
  var off=(bb-a)/2;
  ctx.fillStyle=shapes[2].color+'22';
  ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+bb,ty);ctx.lineTo(tx+bb-off,ty-th);ctx.lineTo(tx+off,ty-th);ctx.closePath();ctx.fill();
  ctx.strokeStyle=shapes[2].color;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+bb,ty);ctx.lineTo(tx+bb-off,ty-th);ctx.lineTo(tx+off,ty-th);ctx.closePath();ctx.stroke();

  // Second trapezoid, flipped
  var angle=Math.PI*progress;
  ctx.save();ctx.translate(tx+bb,ty-th);ctx.rotate(angle);
  ctx.fillStyle=shapes[2].color+'44';
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-bb,0);ctx.lineTo(-bb+off,th);ctx.lineTo(-off,th);ctx.closePath();ctx.fill();
  ctx.strokeStyle=shapes[2].color;ctx.lineWidth=2;ctx.setLineDash([5,4]);
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-bb,0);ctx.lineTo(-bb+off,th);ctx.lineTo(-off,th);ctx.closePath();ctx.stroke();ctx.setLineDash([]);
  ctx.restore();

  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1;ctx.setLineDash([3,3]);
  ctx.beginPath();ctx.moveTo(tx+off,ty-th);ctx.lineTo(tx+off,ty);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#64748b';ctx.font='12px Georgia';ctx.textAlign='center';
  ctx.fillText('h='+th,tx+off-22,ty-th/2);
  ctx.fillText('b₁='+a,tx+off+a/2,ty-th-10);
  ctx.fillText('b₂='+bb,tx+bb/2,ty+18);

  ctx.fillStyle=shapes[2].color;ctx.font='bold 14px Georgia';ctx.textAlign='left';
  ctx.fillText('A = ½(b₁+b₂)×h = ½('+a+'+'+bb+')×'+th+' = '+(0.5*(a+bb)*th),ox,H-10);
}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);
  var progress=Math.min(t/80,1);
  if(selected===0)drawParallelogram(progress);
  else if(selected===1)drawTriangle(progress);
  else drawTrapezoid(progress);
  var s=shapes[selected];
  document.getElementById('area-panel').innerHTML='<strong>'+s.name+':</strong> <em>'+s.formula+'</em><br>'+s.note;
}

function loop(){draw();t++;if(t<100)requestAnimationFrame(loop);else animating=false;}

// Auto-animate first shape
t=0;animating=true;requestAnimationFrame(loop);`,
      outputHeight: 420,
    },

    // ── Trapezoid, regular polygon ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Trapezoid, Regular Polygon, and the General Approach

**Trapezoid.** A trapezoid has one pair of parallel sides with lengths a and b, and height h.

$$A = \\frac{1}{2}(a + b) \\times h$$

**Derivation:** Two congruent trapezoids form a parallelogram with base (a + b) and height h. The parallelogram's area is (a+b)h; each trapezoid is half.

Note that the triangle formula is a special case of the trapezoid formula: if one parallel side shrinks to zero (a = 0), we get A = ½bh.

**Regular polygon.** A regular n-gon (n equal sides, n equal angles) can be divided into n isosceles triangles from the center. Each triangle has base s (the side length) and height a (the **apothem** — the perpendicular distance from the center to the midpoint of a side).

$$A = \\frac{1}{2} \\times \\text{perimeter} \\times \\text{apothem} = \\frac{1}{2} P a$$

**Why?** Each of the n triangles has area ½ × s × a. Total area = n × ½sa = ½ × (ns) × a = ½Pa.

This formula is important because it connects to the circle area formula: as n → ∞, the regular n-gon approaches a circle. The perimeter approaches the circumference 2πr, and the apothem approaches the radius r. Substituting:

$$A_{\\text{circle}} = \\frac{1}{2} \\times 2\\pi r \\times r = \\pi r^2$$

This is not just a mnemonic — it is a derivation of the circle area formula by taking the limiting case of the regular polygon formula. Archimedes used exactly this argument, squeezing the circle between inscribed and circumscribed polygons, around 250 BCE.`,
    },

    // ── Pi and radians ─────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### π, Radians, and Why Degrees Are the Wrong Unit

The number π is defined as the ratio of a circle's circumference to its diameter:

$$\\pi = \\frac{C}{d} = \\frac{C}{2r}$$

So circumference C = 2πr and diameter d = 2r.

This ratio is the same for every circle — a remarkable fact that requires proof (which uses similar circles and the parallel postulate). The numerical value is approximately 3.14159265..., and π is irrational (proven by Johann Lambert in 1761) and in fact transcendental (proven by Lindemann in 1882, which also proved it is impossible to "square the circle" with compass and straightedge).

**Why radians are the natural unit for angles:**

Degrees are a convention from Babylonian astronomy — 360° because it's close to the number of days in a year and has many divisors. But for mathematics, degrees are awkward.

A **radian** is defined as the angle subtended at the center of a circle by an arc equal in length to the radius. Since the full circumference is 2πr, the full angle is 2π radians. Converting: 360° = 2π radians, so:

$$1 \\text{ radian} = \\frac{180°}{\\pi} \\approx 57.3°$$

**Why radians are better:**

Arc length formula: s = rθ (radians). With degrees: s = (π/180)rθ — an ugly conversion factor appears everywhere.

Area of sector: A = ½r²θ (radians). With degrees: A = (π/360)r²θ.

Calculus: the derivative of sin(x) is cos(x) — but only when x is in radians. In degrees, you get (π/180)cos(x°). Every calculus formula for trigonometric functions assumes radians.

Radians are not a convention — they are the natural unit arising from the geometry of the circle itself. Every formula simplifies when you use them.`,
    },

    // ── Visual 2 — Arc length and sector ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### Arc Length, Sector Area, and the Radian

Drag the angle slider. Watch arc length and sector area update using the radian formulas. Toggle between radians and degrees to see why the radian formulas are simpler.`,
      html: `<div style="padding:10px 14px 0;background:#fafaf8;display:flex;gap:14px;flex-wrap:wrap;align-items:center">
  <span style="font-family:Georgia,serif;font-size:13px">Angle: <strong id="ang-lbl">1.00 rad (57.3°)</strong></span>
  <input type="range" id="ang-sl" min="0.1" max="6.28" value="1.0" step="0.01" style="flex:1;min-width:120px">
  <span style="font-family:Georgia,serif;font-size:13px">Radius: <strong id="r-lbl">120</strong></span>
  <input type="range" id="r-sl" min="60" max="150" value="120" style="width:100px">
</div>
<canvas id="cv" width="700" height="300"></canvas>
<div id="arc-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:#fafaf8;border-top:1px solid #e2e8f0;line-height:1.8"></div>`,
      css: `body{margin:0;background:#fafaf8}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var angSl=document.getElementById('ang-sl'),rSl=document.getElementById('r-sl');
var angLbl=document.getElementById('ang-lbl'),rLbl=document.getElementById('r-lbl');

function draw(){
  var theta=parseFloat(angSl.value);
  var r=parseInt(rSl.value);
  angLbl.textContent=theta.toFixed(2)+' rad ('+(theta*180/Math.PI).toFixed(1)+'°)';
  rLbl.textContent=r;

  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  var cx=220,cy=H/2;

  // Full circle outline
  ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(cx,cy,r,0,2*Math.PI);ctx.stroke();

  // Sector fill
  ctx.fillStyle='rgba(30,58,95,0.12)';
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,0,theta);ctx.closePath();ctx.fill();

  // Sector outline
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.arc(cx,cy,r,0,theta);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+r,cy);ctx.stroke();
  var ex=cx+r*Math.cos(theta),ey=cy+r*Math.sin(theta);
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);ctx.stroke();

  // Arc highlight
  ctx.strokeStyle='#dc2626';ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(cx,cy,r,0,theta);ctx.stroke();

  // Arc = r annotation
  if(theta>=0.9&&theta<=1.1){
    ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(cx+r,cy);ctx.lineTo(cx+r+30,cy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex+30*Math.cos(theta),ey+30*Math.sin(theta));ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#dc2626';ctx.font='bold 11px Georgia';ctx.textAlign='center';
    ctx.fillText('arc = r (by def. of radian)',cx+r/2,cy-r-14);
  }

  // Radius label
  ctx.fillStyle='#1e3a5f';ctx.font='12px Georgia';ctx.textAlign='center';
  ctx.fillText('r='+r,cx+r/2,cy+14);

  // Computations
  var arcLen=r*theta;
  var sectorArea=0.5*r*r*theta;
  var fullCirc=2*Math.PI*r;
  var fullArea=Math.PI*r*r;
  var fracCirc=(theta/(2*Math.PI)*100).toFixed(1);

  // Right panel - formula display
  var px=420,py=30,pw=260;
  ctx.fillStyle='rgba(255,255,255,0.8)';ctx.beginPath();ctx.roundRect(px,py,pw,H-60,10);ctx.fill();
  ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(px,py,pw,H-60,10);ctx.stroke();

  ctx.fillStyle='#1e3a5f';ctx.font='bold 14px Georgia';ctx.textAlign='center';
  ctx.fillText('Arc Length',px+pw/2,py+22);
  ctx.font='13px Georgia';ctx.fillStyle='#dc2626';
  ctx.fillText('s = r·θ',px+pw/2,py+42);
  ctx.fillStyle='#374151';
  ctx.fillText('= '+r+' × '+theta.toFixed(2),px+pw/2,py+60);
  ctx.fillStyle='#1e3a5f';ctx.font='bold 14px Georgia';
  ctx.fillText('= '+arcLen.toFixed(1)+' units',px+pw/2,py+80);

  ctx.fillStyle='#e2e8f0';ctx.fillRect(px+20,py+92,pw-40,1);

  ctx.fillStyle='#1a3a2a';ctx.font='bold 14px Georgia';
  ctx.fillText('Sector Area',px+pw/2,py+114);
  ctx.font='13px Georgia';ctx.fillStyle='#1a3a2a';
  ctx.fillText('A = ½r²·θ',px+pw/2,py+134);
  ctx.fillStyle='#374151';
  ctx.fillText('= ½ × '+r+'² × '+theta.toFixed(2),px+pw/2,py+152);
  ctx.fillStyle='#1a3a2a';ctx.font='bold 14px Georgia';
  ctx.fillText('= '+sectorArea.toFixed(1)+' sq units',px+pw/2,py+172);

  ctx.fillStyle='#e2e8f0';ctx.fillRect(px+20,py+184,pw-40,1);

  ctx.fillStyle='#92400e';ctx.font='12px Georgia';
  ctx.fillText('Full circle (2π rad):',px+pw/2,py+204);
  ctx.fillText('C = 2πr = '+fullCirc.toFixed(1),px+pw/2,py+220);
  ctx.fillText('A = πr² = '+fullArea.toFixed(1),px+pw/2,py+237);
  ctx.fillStyle='#64748b';ctx.font='11px Georgia';
  ctx.fillText('This sector = '+fracCirc+'% of circle',px+pw/2,py+255);

  // Center dot
  ctx.beginPath();ctx.arc(cx,cy,4,0,2*Math.PI);ctx.fillStyle='#374151';ctx.fill();
  ctx.fillStyle='#374151';ctx.font='12px Georgia';ctx.textAlign='center';ctx.fillText('O',cx,cy+16);

  document.getElementById('arc-info').innerHTML=
    '<strong>Key formulas (θ in radians):</strong>'
    +' Arc length: <strong>s = rθ</strong> = '+r+'×'+theta.toFixed(3)+' = '+arcLen.toFixed(2)+'.'
    +' Sector area: <strong>A = ½r²θ</strong> = ½×'+r+'²×'+theta.toFixed(3)+' = '+sectorArea.toFixed(2)+'.'
    +'<br>When θ = 1 radian exactly, the arc length equals the radius. This is the definition of a radian — not a formula, a definition.'
    +'<br><span style="color:#9ca3af;font-size:11px">Compare: in degrees, arc = (π/180)rθ and sector = (π/360)r²θ. The π/180 conversion factor appears in every formula — radians eliminate it entirely.</span>';
}
angSl.oninput=draw;rSl.oninput=draw;
draw();`,
      outputHeight: 420,
    },

    // ── Circle area derivation ─────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Circle Area Formula: Archimedes' Argument

The formula A = πr² looks like magic until you see where it comes from.

**Archimedes' method (250 BCE):** Imagine cutting a circle into very thin sectors (like pizza slices) and rearranging them alternating point-up and point-down. The result is approximately a rectangle. As the slices get thinner:
- The height of the rectangle approaches r (the radius)
- The total width approaches half the circumference = ½ × 2πr = πr

So the circle's area approaches r × πr = πr².

**The limiting polygon argument** (as mentioned in the regular polygon section): A regular n-gon inscribed in a circle has area ½Pa (perimeter × apothem). As n → ∞, perimeter → 2πr and apothem → r, so area → ½(2πr)(r) = πr².

**Formal calculus derivation:** Integrate the area element dA = 2πr dr from r=0 to r=R:
$$A = \\int_0^R 2\\pi r \\, dr = \\pi R^2$$

All three methods confirm the same formula. Together they show that πr² is not an arbitrary formula — it is the inevitable consequence of the circle's symmetry and the definition of π.

**Summary of circle formulas:**
| Quantity | Formula |
|---|---|
| Circumference | C = 2πr = πd |
| Area | A = πr² |
| Arc length (angle θ radians) | s = rθ |
| Sector area (angle θ radians) | A = ½r²θ |`,
    },

    // ── Visual 3 — Circle area via unrolling ─────────────────────────────────
    {
      type: 'js',
      instruction: `### Archimedes' Pizza Slice Argument

The animation shows the circle cut into increasingly thin sectors and rearranged into a near-rectangle. As the number of slices increases, the shape approaches a rectangle with dimensions r × πr — proving A = πr².`,
      html: `<div style="padding:10px 14px 0;background:#fafaf8;display:flex;gap:14px;align-items:center;flex-wrap:wrap">
  <span style="font-family:Georgia,serif;font-size:13px">Slices: <strong id="n-lbl">8</strong></span>
  <input type="range" id="n-sl" min="4" max="64" value="8" step="4" style="flex:1;min-width:120px">
</div>
<canvas id="cv" width="700" height="280"></canvas>`,
      css: `body{margin:0;background:#fafaf8}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var nSl=document.getElementById('n-sl'),nLbl=document.getElementById('n-lbl');

function draw(){
  var n=parseInt(nSl.value);
  nLbl.textContent=n;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  var r=90;
  // Left: original circle
  var lcx=120,lcy=H/2;
  var theta=2*Math.PI/n;
  for(var i=0;i<n;i++){
    var a=i*theta-Math.PI/2;
    ctx.fillStyle=i%2===0?'rgba(30,58,95,0.3)':'rgba(30,58,95,0.12)';
    ctx.strokeStyle='#1e3a5f';ctx.lineWidth=0.8;
    ctx.beginPath();ctx.moveTo(lcx,lcy);ctx.arc(lcx,lcy,r,a,a+theta);ctx.closePath();ctx.fill();ctx.stroke();
  }
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(lcx,lcy,r,0,2*Math.PI);ctx.stroke();
  ctx.fillStyle='#1e3a5f';ctx.font='bold 12px Georgia';ctx.textAlign='center';
  ctx.fillText('Circle: A = πr²',lcx,H-10);

  // Arrow
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(lcx+r+10,lcy);ctx.lineTo(lcx+r+35,lcy);ctx.stroke();
  ctx.beginPath();ctx.moveTo(lcx+r+28,lcy-6);ctx.lineTo(lcx+r+35,lcy);ctx.lineTo(lcx+r+28,lcy+6);ctx.stroke();
  ctx.fillStyle='#94a3b8';ctx.font='10px Georgia';ctx.fillText('rearrange',lcx+r+22,lcy-10);

  // Right: rearranged sectors into near-rectangle
  var rx=270,ry=H/2;
  var sw=Math.PI*r/n; // half-width of each triangle base
  var totalW=n*sw*2;
  var startX=rx;

  for(var j=0;j<n;j++){
    var isEven=j%2===0;
    var bx=startX+j*sw*2;
    var by=isEven?ry:ry;
    var topY=isEven?ry-r:ry;
    var botY=isEven?ry:ry+r;

    ctx.fillStyle=isEven?'rgba(30,58,95,0.3)':'rgba(30,58,95,0.12)';
    ctx.strokeStyle='#1e3a5f';ctx.lineWidth=0.8;
    ctx.beginPath();
    ctx.moveTo(bx,botY);
    ctx.lineTo(bx+sw*2,botY);
    ctx.lineTo(bx+sw,topY);
    ctx.closePath();
    ctx.fill();ctx.stroke();
  }

  // Dimension annotations
  ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(rx,ry-r-18);ctx.lineTo(rx+totalW,ry-r-18);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#dc2626';ctx.font='12px Georgia';ctx.textAlign='center';
  ctx.fillText('≈ πr (half circumference)',rx+totalW/2,ry-r-25);

  ctx.strokeStyle='#1a3a2a';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(rx+totalW+10,ry-r);ctx.lineTo(rx+totalW+10,ry);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#1a3a2a';ctx.font='12px Georgia';ctx.textAlign='left';
  ctx.fillText('≈ r',rx+totalW+14,ry-r/2);

  // Near-rectangle outline
  ctx.strokeStyle='rgba(0,0,0,0.15)';ctx.lineWidth=1;
  ctx.strokeRect(rx,ry-r,totalW,r);

  ctx.fillStyle='#1e3a5f';ctx.font='bold 12px Georgia';ctx.textAlign='center';
  ctx.fillText('Near-rectangle: area ≈ r × πr = πr²',rx+totalW/2,ry+r+16);

  // Formula
  var accuracy=100*(1-1/(n*n));
  ctx.fillStyle='#92400e';ctx.font='bold 13px Georgia';ctx.textAlign='right';
  ctx.fillText('n='+n+' slices: ~'+accuracy.toFixed(1)+'% accurate',W-10,H-10);
}
nSl.oninput=draw;
draw();`,
      outputHeight: 320,
    },

    // ── Challenges ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A triangle has vertices at (0,0), (8,0), and (3,5). What is its area? Use the formula A = ½bh, identifying the base and height carefully.`,
      options: [
        { label: 'A', text: 'A = 20 square units. Base = 8 (along x-axis), height = 5 (perpendicular from (3,5) to the x-axis). A = ½ × 8 × 5 = 20.' },
        { label: 'B', text: 'A = 15 square units.' },
        { label: 'C', text: 'A = 40 square units.' },
        { label: 'D', text: 'A = 24 square units.' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Take the base as the segment from (0,0) to (8,0) — length 8, lying along the x-axis. The height is the perpendicular distance from the third vertex (3,5) to this base: since the base is on the x-axis, the height is simply the y-coordinate = 5. A = ½ × 8 × 5 = 20 square units.',
      failMessage: 'Choose base = segment (0,0) to (8,0), length = 8. The height is the perpendicular distance from the opposite vertex (3,5) to the base. Since the base lies on the x-axis (y=0), the perpendicular distance from (3,5) to the x-axis is just 5. A = ½ × 8 × 5 = 20.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },

    {
      type: 'challenge',
      instruction: `A sector of a circle has radius 6 cm and central angle 2.5 radians. What is the arc length and sector area? Leave answers in exact form where possible.`,
      options: [
        { label: 'A', text: 'Arc = 15 cm; Area = 45 cm².' },
        { label: 'B', text: 'Arc = 15 cm; Area = 45 cm². s = rθ = 6×2.5 = 15. A = ½r²θ = ½×36×2.5 = 45.' },
        { label: 'C', text: 'Arc = 9.42 cm; Area = 28.27 cm².' },
        { label: 'D', text: 'Arc = 2.5π cm; Area = 3π cm².' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct and clear. Arc length: s = rθ = 6 × 2.5 = 15 cm. Sector area: A = ½r²θ = ½ × 36 × 2.5 = 45 cm². These clean integer answers are one of the beauties of radians — if the angle were in degrees, both formulas would require multiplying by π/180 and π/360 respectively.',
      failMessage: 'Use the radian formulas: s = rθ = 6 × 2.5 = 15 cm. A = ½r²θ = ½ × 6² × 2.5 = ½ × 36 × 2.5 = 45 cm². The radian formulas give clean answers here precisely because no π/180 conversion factor is needed — the angle is already in the natural unit.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },

    {
      type: 'challenge',
      instruction: `A regular hexagon has side length 8 cm. What is its area? (Recall: a regular hexagon can be split into 6 equilateral triangles, and the apothem of a regular hexagon with side s is s√3/2.)`,
      options: [
        { label: 'A', text: 'A = 96√3 cm² ≈ 166.3 cm². Using A = ½Pa: P = 6×8 = 48, a = 8√3/2 = 4√3. A = ½×48×4√3 = 96√3.' },
        { label: 'B', text: 'A = 192 cm²' },
        { label: 'C', text: 'A = 48√3 cm²' },
        { label: 'D', text: 'A = 192√3 cm²' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. A regular hexagon splits into 6 equilateral triangles with side 8. Each equilateral triangle has area ½ × 8 × (8√3/2) = 16√3. Six of them: 96√3 ≈ 166.3 cm². Equivalently, using A = ½Pa: perimeter = 48, apothem = 4√3, so A = ½ × 48 × 4√3 = 96√3. Both methods agree.',
      failMessage: 'A regular hexagon = 6 equilateral triangles with side s. Each equilateral triangle has height h = s√3/2 = 4√3. Each triangle area = ½ × 8 × 4√3 = 16√3. Total: 6 × 16√3 = 96√3 cm². Or use A = ½Pa: P = 48, apothem = 4√3, A = ½ × 48 × 4√3 = 96√3.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },
  ],
};

export default {
  id: 'geo-2-4',
  slug: 'areas-arcs',
  chapter: 'geometry-2',
  order: 4,
  title: 'Area Formulas and Circle Arcs',
  subtitle: 'Why every polygon area traces back to one rectangle — and why π is the only honest way to measure a circle.',
  tags: ['geometry', 'area', 'circles', 'radians', 'pi', 'arc-length', 'sector-area', 'parallelogram', 'trapezoid'],
  hook: {
    question: 'Why does every area formula for polygons trace back to a rectangle — and why are radians better than degrees?',
    realWorldContext: 'Every area calculation in architecture, engineering, and design is a decomposition back to the rectangle. Radians eliminate the π/180 conversion factor from every arc and sector formula — they are the natural unit of angle measurement.',
    previewVisualizationId: 'G2_5_AreaFormulas',
  },
  intuition: {
    prose: [
      'All polygon area formulas derive from A = base × height (rectangle) by decomposition and rearrangement.',
      'Parallelogram = shear a rectangle (same base, same height, same area). Triangle = half a parallelogram. Trapezoid = two triangles or half a parallelogram with base (a+b).',
      'Regular polygon: A = ½ × perimeter × apothem. As n→∞ this becomes A = πr² (circle).',
      'Radian: the angle where arc = radius. In radians: arc = rθ, sector area = ½r²θ. No conversion factors.',
      'Circle area = πr² derived by Archimedes by unrolling sectors into a near-rectangle of dimensions r × πr.',
    ],
    callouts: [
      { type: 'important', title: 'Height ≠ side length', body: 'In every polygon area formula, "height" means perpendicular distance — the altitude — not the slant side length. The most common error in area calculations is using the side length instead of the perpendicular height.' },
      { type: 'definition', title: 'Radian', body: 'The angle subtended at the center by an arc equal in length to the radius. 2π radians = 360°. Arc length = rθ; sector area = ½r²θ. These formulas only work with θ in radians.' },
    ],
    visualizations: [
      { id: 'ScienceNotebook', title: 'Areas, Arcs, and Archimedes', props: { lesson: LESSON_GEO_2_4 } },
      { id: 'G2_5_AreaFormulas', title: 'Polygonal Area Formula Derivations' },
      { id: 'G2_6_ArcSectorPi', title: 'Arc Lengths and Radian Efficiency' }
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Rectangle: A = bh. Everything else is a rearrangement of this.',
    'Parallelogram: A = bh (shear). Triangle: A = ½bh (half parallelogram). Trapezoid: A = ½(a+b)h.',
    'Regular polygon: A = ½Pa. Circle (limit): A = ½(2πr)r = πr².',
    'Radian = arc/radius. Arc length s = rθ. Sector A = ½r²θ. Degrees need × π/180 everywhere.',
    'Heron\'s formula: A = √(s(s-a)(s-b)(s-c)) where s = (a+b+c)/2. Area from sides alone.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_GEO_2_4 };
