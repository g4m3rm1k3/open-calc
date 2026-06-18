// Three.js · Chapter 5 · Lesson 2
// HDR & Bloom

const LESSON_3JS_5_2 = {
  title: 'HDR & Bloom',
  subtitle: 'Tone mapping the unbounded luminance of real light into the [0,1] display range.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The problem of infinite light

The sun is about 10,000× brighter than an overcast sky. Your monitor can display values from 0.0 to 1.0. How do you represent "10,000× brighter" in a buffer that only stores [0, 1]?

Standard rendering clamps at 1.0. A bright sky is white. A lamp is white. The sun is white. Everything above 1.0 is the same colour — **all detail is lost**.

**HDR rendering** keeps the full range in a 16-bit float render target. Colours stay unclamped. Then **tone mapping** maps the full range back into [0, 1] in a perceptually correct way — the way your eye adapts to different brightness levels.

**Bloom** adds glow around bright areas — simulating the lens flare and scattering that occurs in the human eye and camera lenses for very bright sources.`,
    },

    // ── 1. HDR rendering pipeline ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The HDR Pipeline

\`\`\`
┌─────────────────────────────────────────────────┐
│  Render to 16-bit float FBO (colours > 1 allowed) │
│  Light intensity: sun=10000, lamp=100, candle=1   │
└─────────────────────────────┬───────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Extract brights   │  threshold > 1.0
                    │  (for bloom)       │
                    └─────────┬─────────┘
                              │ Gaussian blur
                    ┌─────────▼─────────┐
                    │  Bloom texture     │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────▼───────────────────┐
│  Tone mapping: HDR [0,∞] → LDR [0,1]            │
│  Add bloom texture                               │
│  Apply sRGB gamma correction                     │
└─────────────────────────────────────────────────┘
\`\`\`

**Key:** Bloom must happen **before** tone mapping — otherwise bright values are already clamped to 1.0 and there's nothing to bloom.`,
    },

    // ── 2. Tone mapping operators ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Tone Mapping Operators

All tone mapping operators compress \`[0, ∞)\` into \`[0, 1)\`:

### Reinhard (2002)
\`\`\`glsl
vec3 toneMap(vec3 x) {
  return x / (1.0 + x);  // asymptotically approaches 1
}
\`\`\`
Simple, but loses colour saturation at high luminance. Whites look desaturated.

### ACES (Academy Color Encoding System, 2014)
\`\`\`glsl
vec3 acesToneMap(vec3 x) {
  float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}
\`\`\`
The film industry standard. Preserves saturation, produces a "filmic" look with rich shadows and bright highlights. Used in Unreal Engine 4, Three.js default.

### Exposure Adjustment
Before tone mapping, scale by exposure:
\`\`\`glsl
vec3 color = texture2D(uHDRBuffer, vUV).rgb;
color *= uExposure;          // 1.0 = normal, 2.0 = brighter, 0.5 = darker
color = acesToneMap(color);  // then compress
\`\`\``,
    },

    // ── 3. Tone mapping comparator ────────────────────────────────────────
    {
      type: 'js',
      id: 'tonemap-demo',
      html: `<canvas id="c-tm" width="480" height="260" style="width:480px;height:260px;border-radius:8px;display:block;margin:auto;background:#0d0d12"></canvas>
<div style="display:flex;gap:12px;justify-content:center;margin-top:8px;flex-wrap:wrap">
  <button id="tm-linear" style="background:#7bf3;color:#fff;border:1px solid #7bf;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:monospace">Linear (clamp)</button>
  <button id="tm-reinhard" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:monospace">Reinhard</button>
  <button id="tm-aces" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:monospace">ACES</button>
</div>
<div style="text-align:center;margin-top:6px;font-family:monospace;color:#aaa;font-size:13px">
  Exposure: <input id="exp" type="range" min="10" max="400" value="100" style="width:120px"> <span id="exp-v">1.00</span>
</div>`,
      startCode: `const c=document.getElementById('c-tm');
const gl=c.getContext('webgl');
const vs=\`attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0,1);}\`;
const fs=\`precision mediump float;
varying vec2 vUV;
uniform int uMode;
uniform float uExp;

vec3 aces(vec3 x){
  float a=2.51,b=.03,c=2.43,d=.59,e=.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.,1.);
}
vec3 reinhard(vec3 x){ return x/(1.+x); }

void main(){
  // Generate HDR scene: gradient + bright sun + orb
  vec2 uv=vUV*2.-1.;
  vec3 hdr=mix(vec3(.1,.15,.3),vec3(.4,.6,1.),vUV.y*.5); // sky
  if(vUV.y<.4) hdr=mix(vec3(.1,.2,.05),vec3(.3,.5,.15),(vUV.y/.4)); // ground
  // Sun (very bright)
  float sunD=length(vUV-vec2(.75,.82));
  hdr+=vec3(8.,7.,4.)*max(0.,1.-sunD*12.);
  // Lamp
  float lampD=length(vUV-vec2(.3,.55));
  hdr+=vec3(3.,2.5,1.5)*max(0.,1.-lampD*8.);
  // Sphere highlights
  vec2 sc=vUV-vec2(.5,.45);
  float sr=length(sc);
  if(sr<.12){ vec3 N=normalize(vec3(sc,sqrt(.0144-dot(sc,sc))));
    float l=max(0.,dot(N,normalize(vec3(.5,.5,.7))));
    hdr+=vec3(2.)*pow(l,4.); }

  hdr*=uExp;

  vec3 col;
  if(uMode==0) col=clamp(hdr,0.,1.);
  else if(uMode==1) col=reinhard(hdr);
  else col=aces(hdr);

  // Gamma
  col=pow(max(col,vec3(0.)),vec3(1./2.2));
  gl_FragColor=vec4(col,1);
}\`;
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x;}
const prog=gl.createProgram();
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));
gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));
gl.linkProgram(prog);gl.useProgram(prog);
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const al=gl.getAttribLocation(prog,'aPos');
gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
const uMode=gl.getUniformLocation(prog,'uMode');
const uExp=gl.getUniformLocation(prog,'uExp');
let mode=0;
['linear','reinhard','aces'].forEach((b,i)=>{
  document.getElementById('tm-'+b).onclick=()=>{
    mode=i;
    ['linear','reinhard','aces'].forEach((x,j)=>{
      document.getElementById('tm-'+x).style.background=j===i?'#7bf3':'#222';
      document.getElementById('tm-'+x).style.borderColor=j===i?'#7bf':'#444';
    });draw();
  };
});
const expEl=document.getElementById('exp');
function draw(){
  const e=expEl.value/100;
  document.getElementById('exp-v').textContent=e.toFixed(2);
  gl.uniform1i(uMode,mode);gl.uniform1f(uExp,e);
  gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
expEl.addEventListener('input',draw);
draw();`,
    },

    // ── 4. Bloom algorithm ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Bloom — Glow From Bright Sources

Bloom simulates how bright light scatters in the eye and lens:

**Algorithm:**
1. Extract pixels above a threshold (brightness > 1.0 in HDR)
2. Blur the extracted bright pixels (Gaussian blur, multiple passes)
3. Add the blurred result back to the original HDR image
4. Then tone map

\`\`\`glsl
// Pass 1: Extract brights
vec3 hdrColor = texture2D(uHDRBuffer, vUV).rgb;
float brightness = dot(hdrColor, vec3(0.2126, 0.7152, 0.0722)); // luminance
vec3 brightColor = brightness > 1.0 ? hdrColor : vec3(0.0);

// Pass 2-3: Gaussian blur (horizontal then vertical)
// ...sample multiple texels with Gaussian weights...

// Pass 4: Composite
vec3 hdr = texture2D(uHDRBuffer, vUV).rgb;
vec3 bloom = texture2D(uBloomBlur, vUV).rgb;
vec3 combined = hdr + bloom * uBloomStrength;
gl_FragColor = vec4(acesToneMap(combined), 1.0);
\`\`\`

**Three.js UnrealBloomPass:**
\`\`\`javascript
const bloom = new THREE.UnrealBloomPass(
  new THREE.Vector2(width, height),
  1.5,    // strength
  0.4,    // radius
  0.85    // threshold (0=all bright, 1=only very bright)
)
composer.addPass(bloom)
\`\`\``,
    },

    // ── 5. Live bloom demo ────────────────────────────────────────────────
    {
      type: 'js',
      id: 'bloom-demo',
      html: `<canvas id="c-bloom" width="480" height="260" style="width:480px;height:260px;border-radius:8px;display:block;margin:auto;background:#0d0d12"></canvas>
<div style="display:flex;gap:20px;justify-content:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px;flex-wrap:wrap">
  <label>Bloom strength: <input id="bstr" type="range" min="0" max="100" value="50" style="width:100px"> <span id="bstr-v">0.50</span></label>
  <label>Threshold: <input id="bthr" type="range" min="0" max="100" value="70" style="width:100px"> <span id="bthr-v">0.70</span></label>
</div>`,
      startCode: `const c=document.getElementById('c-bloom');
const ctx=c.getContext('2d');
const W=480,H=260;
const bstrEl=document.getElementById('bstr');
const bthrEl=document.getElementById('bthr');
let t=0;

function gaussianBlur(imgData,radius,W,H){
  const src=new Float32Array(imgData.data);
  const dst=new Float32Array(imgData.data.length);
  const sigma=radius/2;
  const kernel=[];
  let sum=0;
  for(let i=-radius;i<=radius;i++){
    const v=Math.exp(-i*i/(2*sigma*sigma));
    kernel.push(v);sum+=v;
  }
  // Horizontal pass
  for(let y=0;y<H;y++){
    for(let x=0;x<W;x++){
      let r=0,g=0,b=0;
      for(let k=0;k<kernel.length;k++){
        const sx=Math.max(0,Math.min(W-1,x+k-radius));
        const i=(y*W+sx)*4;
        const w=kernel[k]/sum;
        r+=src[i]*w;g+=src[i+1]*w;b+=src[i+2]*w;
      }
      const i=(y*W+x)*4;
      dst[i]=r;dst[i+1]=g;dst[i+2]=b;dst[i+3]=255;
    }
  }
  return dst;
}

function draw(){
  t+=0.01;
  const bstr=bstrEl.value/100, bthr=bthrEl.value/100*2;
  document.getElementById('bstr-v').textContent=bstr.toFixed(2);
  document.getElementById('bthr-v').textContent=(bthr/2).toFixed(2);

  // Render "HDR" scene
  ctx.fillStyle='#0a0a10';ctx.fillRect(0,0,W,H);

  // Sky gradient
  for(let y=0;y<H/2;y++){
    const t2=y/(H/2);
    ctx.fillStyle=\`rgb(\${Math.round(10+t2*30)},\${Math.round(15+t2*50)},\${Math.round(30+t2*80)})\`;
    ctx.fillRect(0,y,W,1);
  }

  // Animated orbs (HDR bright)
  const orbs=[
    {x:W*.3+Math.sin(t)*60,y:H*.4,r:20,h:3.5,col:[1,.4,.1]},
    {x:W*.7+Math.sin(t*0.7+1)*40,y:H*.35,r:15,h:5,col:[.2,.6,1]},
    {x:W*.5,y:H*.6+Math.cos(t*0.5)*30,r:12,h:8,col:[1,.9,.3]},
  ];

  // Main render
  const mainData=ctx.createImageData(W,H);
  const md=mainData.data;
  // Background already in ctx, grab it
  const bg=ctx.getImageData(0,0,W,H);

  for(let py=0;py<H;py++){
    for(let px=0;px<W;px++){
      const i=(py*W+px)*4;
      let r=bg.data[i]/255,g=bg.data[i+1]/255,b=bg.data[i+2]/255;
      orbs.forEach(o=>{
        const d=Math.sqrt((px-o.x)**2+(py-o.y)**2);
        const intensity=o.h*Math.max(0,1-d/o.r);
        r+=o.col[0]*intensity;g+=o.col[1]*intensity;b+=o.col[2]*intensity;
      });
      // Tone map (ACES approx)
      const tm=v=>{const a=2.51,b2=.03,c=2.43,d=.59,e=.14;return Math.min(1,Math.max(0,(v*(a*v+b2))/(v*(c*v+d)+e)));};
      md[i]=Math.round(tm(r)*255);
      md[i+1]=Math.round(tm(g)*255);
      md[i+2]=Math.round(tm(b)*255);
      md[i+3]=255;
    }
  }

  // Extract brights for bloom
  const bloomData=ctx.createImageData(W,H);
  const bd=bloomData.data;
  for(let py=0;py<H;py++){
    for(let px=0;px<W;px++){
      const i=(py*W+px)*4;
      let r=bg.data[i]/255,g=bg.data[i+1]/255,b=bg.data[i+2]/255;
      orbs.forEach(o=>{
        const d=Math.sqrt((px-o.x)**2+(py-o.y)**2);
        const intensity=o.h*Math.max(0,1-d/o.r);
        r+=o.col[0]*intensity;g+=o.col[1]*intensity;b+=o.col[2]*intensity;
      });
      const lum=r*.299+g*.587+b*.114;
      if(lum>bthr){bd[i]=Math.round(r*255);bd[i+1]=Math.round(g*255);bd[i+2]=Math.round(b*255);}
      bd[i+3]=255;
    }
  }

  // Blur bloom
  const blurred=gaussianBlur(bloomData,8,W,H);

  // Composite: main + bloom
  for(let i=0;i<W*H*4;i+=4){
    const r=md[i]+blurred[i]*bstr;
    const g=md[i+1]+blurred[i+1]*bstr;
    const b=md[i+2]+blurred[i+2]*bstr;
    mainData.data[i]=Math.min(255,r);
    mainData.data[i+1]=Math.min(255,g);
    mainData.data[i+2]=Math.min(255,b);
  }

  ctx.putImageData(mainData,0,0);
  ctx.fillStyle='rgba(200,220,255,0.7)';ctx.font='bold 12px monospace';
  ctx.fillText('HDR Scene + ACES Tone Map + Bloom',10,20);
  requestAnimationFrame(draw);
}
bstrEl.addEventListener('input',()=>{});
bthrEl.addEventListener('input',()=>{});
draw();`,
    },

    // ── 6. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-hdr-buffer',
      instruction: 'Why is a 16-bit float render target required for HDR rendering instead of the standard 8-bit unsigned byte?',
      options: [
        { label: 'A', text: '8-bit can only store 256 levels of brightness — not enough for smooth gradients in low-light areas' },
        { label: 'B', text: '8-bit clamps at 1.0 — values above 1.0 (the sun, bright lights) cannot be stored, losing all HDR information before tone mapping' },
        { label: 'C', text: '8-bit cannot store negative colour values, which are required for subtractive colour operations in HDR' },
        { label: 'D', text: '16-bit renders faster because the GPU can process two 8-bit values simultaneously' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 7. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-bloom-order',
      instruction: 'Why must bloom be applied BEFORE tone mapping, not after?',
      options: [
        { label: 'A', text: 'After tone mapping, bright values have been clamped to [0,1] — there is nothing above the threshold to bloom' },
        { label: 'B', text: 'Tone mapping changes the blur kernel size, making bloom inaccurate if applied afterwards' },
        { label: 'C', text: 'The sRGB gamma correction in tone mapping inverts the bloom effect if applied first' },
        { label: 'D', text: 'Bloom and tone mapping cannot be combined in a single render pass, so order doesn\'t matter' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-reinhard-flaw',
      instruction: 'Reinhard tone mapping has a known weakness compared to ACES. What is it?',
      options: [
        { label: 'A', text: 'Reinhard produces blacks that are not fully black — there is always residual colour in shadows' },
        { label: 'B', text: 'Reinhard desaturates colours at high luminance — very bright colours lose their hue and appear whitish' },
        { label: 'C', text: 'Reinhard applies gamma correction, which ACES handles separately' },
        { label: 'D', text: 'Reinhard is not monotonically increasing, causing some bright values to become darker than expected' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: ACES tonemapping ───────────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Implement ACES Tonemapping

Without tonemapping, HDR values >1.0 clip to white. ACES rolls off highlights smoothly.

Implement the ACES approximation function and apply it:
\`\`\`glsl
vec3 aces(vec3 x){
  return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0);
}
\`\`\`

**Requirements:**
1. Define \`aces()\` with the formula above
2. Replace \`gl_FragColor = vec4(hdr, 1.0)\` with \`vec4(aces(hdr), 1.0)\``,
      html: `<canvas id="c" width="400" height="200" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c=document.getElementById('c'),gl=c.getContext('webgl')
gl.viewport(0,0,c.width,c.height)
const vs=\\\`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs=\\\`precision mediump float;
varying vec2 v;
// TODO 1: vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.,1.); }
void main(){
  vec3 hdr=vec3(v.x*3.,v.x*2.,v.x*1.5);
  // TODO 2: gl_FragColor=vec4(aces(hdr),1.)
  gl_FragColor=vec4(hdr,1.); // raw — clips to white
}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
const a=gl.getAttribLocation(prog,'p')
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      solutionCode: `const c=document.getElementById('c'),gl=c.getContext('webgl')
gl.viewport(0,0,c.width,c.height)
const vs=\\\`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs=\\\`precision mediump float;
varying vec2 v;
vec3 aces(vec3 x){return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.,1.);}
void main(){
  vec3 hdr=vec3(v.x*3.,v.x*2.,v.x*1.5);
  gl_FragColor=vec4(aces(hdr),1.);
}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
const a=gl.getAttribLocation(prog,'p')
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      check: (code) => /2\.51/.test(code) && /2\.43/.test(code) && /aces\(hdr\)/.test(code),
    },
  ],
}

export default {
  id: 'three-js-5-2-hdr-bloom',
  slug: 'hdr-and-bloom',
  chapter: 'three-js.5',
  order: 2,
  title: 'HDR & Bloom',
  subtitle: 'Tone mapping the unbounded luminance of real light into the [0,1] display range.',
  tags: ['three-js', 'hdr', 'tone-mapping', 'bloom', 'aces', 'exposure'],
  hook: {
    question: 'The sun is 10,000 times brighter than a lit room. Your display has a max value of 1.0. How do you represent "10,000 times brighter" inside a GPU buffer — and make it look right?',
    realWorldContext: 'HDR rendering is now the default in every modern game engine and film pipeline. ACES tone mapping (Academy of Motion Picture Arts and Sciences) maps infinite luminance to perceptually correct display output.',
  },
  intuition: {
    prose: 'HDR: 16-bit float FBO stores values >1. Tone mapping compresses to [0,1]. ACES: filmic, saturation-preserving. Bloom: extract brights → blur → add before tone mapping. Three.js: UnrealBloomPass.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'HDR & Bloom', props: { lesson: LESSON_3JS_5_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['HDR FBO → extract brights → blur (bloom) → add back → ACES tone map → gamma. Order: bloom before tonemap. Three.js: HalfFloatType RenderTarget + UnrealBloomPass.'],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_3JS_5_2 }
