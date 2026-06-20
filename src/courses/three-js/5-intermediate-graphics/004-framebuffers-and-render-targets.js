// Three.js · Chapter 4 · Lesson 3
// Framebuffers & Render Targets

const LESSON_3JS_4_3 = {
  title: 'Framebuffers & Render Targets',
  subtitle: 'Render to texture — the fundamental primitive behind every post-processing effect.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Render to Texture: the universal post-process primitive

Bloom. Motion blur. Depth of field. SSAO. Shadow mapping. Screen-space reflections. Chromatic aberration. Fog of war. Minimap cameras.

What do all these have in common? They each require **rendering the scene to a texture** — then using that texture in a second pass to produce the final image.

The API primitive that enables this is the **Framebuffer Object (FBO)**. Instead of rendering to the screen, you attach a texture, render into it, then sample from it. This is "render to texture" (RTT), and it's the backbone of modern real-time visual effects.`,
    },

    // ── 1. FBO anatomy ───────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Framebuffer Object (FBO) Anatomy

A framebuffer has three possible attachments:
- **Colour attachment** — a texture where pixel colours are written
- **Depth attachment** — a renderbuffer or texture for depth testing
- **Stencil attachment** — optional masking buffer

\`\`\`javascript
// Raw WebGL FBO creation
const fbo = gl.createFramebuffer()
gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)

// 1. Create colour texture
const colourTex = gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D, colourTex)
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
              gl.RGBA, gl.UNSIGNED_BYTE, null)   // null = empty
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                        gl.TEXTURE_2D, colourTex, 0)

// 2. Create depth renderbuffer
const depthRB = gl.createRenderbuffer()
gl.bindRenderbuffer(gl.RENDERBUFFER, depthRB)
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
                           gl.RENDERBUFFER, depthRB)

// 3. Check completeness
console.log(gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE)

// 4. Restore screen framebuffer
gl.bindFramebuffer(gl.FRAMEBUFFER, null)
\`\`\``,
    },

    // ── 2. Render loop with FBO ───────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Two-Pass Render Loop

\`\`\`javascript
function renderFrame() {
  // ── Pass 1: Render scene to FBO ──────────────────────────────────
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.viewport(0, 0, fboWidth, fboHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  renderScene()   // draw all 3D objects

  // ── Pass 2: Post-process to screen ───────────────────────────────
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)  // back to screen
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // Use the FBO's colour texture as input
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, colourTex)
  gl.uniform1i(uSamplerLoc, 0)

  // Draw a full-screen quad with the post-process shader
  renderFullScreenQuad()
}
\`\`\`

**The full-screen quad trick:** A quad covering the entire screen (\`[-1,-1] to [1,1]\` in NDC) with UV \`[0,0] to [1,1]\`. Sampling the FBO texture at each UV gives the previous frame's output. The post-process shader transforms it.`,
    },

    // ── 3. FBO data flow diagram ──────────────────────────────────────────
    {
      type: 'js',
      id: 'fbo-diagram',
      html: `<canvas id="c-fbo" width="560" height="280" style="width:560px;height:280px;border-radius:8px;background:#0d0d12;display:block;margin:auto"></canvas>`,
      startCode: `const c=document.getElementById('c-fbo');
const ctx=c.getContext('2d');
ctx.fillStyle='#0d0d12';ctx.fillRect(0,0,560,280);

function box(x,y,w,h,label,sub,col,tc='#fff'){
  ctx.fillStyle=col+'22';ctx.strokeStyle=col;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(x,y,w,h,8);ctx.fill();ctx.stroke();
  ctx.fillStyle=tc;ctx.font='bold 13px monospace';
  ctx.fillText(label,x+10,y+20);
  if(sub){ctx.fillStyle='#888';ctx.font='11px monospace';
    sub.forEach((s,i)=>ctx.fillText(s,x+10,y+38+i*14));}
}
function arrow(x1,y1,x2,y2,label='',col='#446'){
  ctx.strokeStyle=col;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  const ux=dx/len,uy=dy/len;
  ctx.lineTo(x2-10*ux-5*uy,y2-10*uy+5*ux);
  ctx.moveTo(x2,y2);ctx.lineTo(x2-10*ux+5*uy,y2-10*uy-5*ux);
  ctx.stroke();
  if(label){ctx.fillStyle='#666';ctx.font='11px monospace';
    ctx.fillText(label,(x1+x2)/2+4,(y1+y2)/2-4);}
}

// Scene
box(20,100,110,80,'3D Scene',['geometry','materials','lights'],'#7bf');
// FBO
box(160,60,130,160,'FBO',['colour texture','depth buffer'],'#f7a');
// Color texture
box(185,90,100,40,'colour tex',null,'#fa7','#fa7');
box(185,145,100,40,'depth RB',null,'#aaf','#aaf');
// Post shader
box(320,100,110,80,'Post Shader',['sample tex','transform'],'#7f9');
// Screen
box(460,100,80,80,'Screen',['canvas','display'],'#ff7');

// Arrows
arrow(130,140,158,140,'render to','#7bf');
arrow(295,140,318,140,'read tex','#7f9');
arrow(432,140,458,140,'display','#ff7');

// Pass labels
ctx.fillStyle='#7bf';ctx.font='bold 11px monospace';
ctx.fillText('Pass 1: Render scene to FBO',20,55);
ctx.fillStyle='#7f9';
ctx.fillText('Pass 2: Post-process to screen',318,55);

// Bottom note
ctx.fillStyle='#555';ctx.font='11px monospace';
ctx.fillText('bindFramebuffer(fbo) → render → bindFramebuffer(null) → fullscreen quad',20,255);`,
    },

    // ── 4. Post-process effects ───────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Common Post-Process Effects

All implemented as full-screen quad shaders reading from an FBO texture:

### Grayscale / Colour Grading
\`\`\`glsl
vec3 col = texture2D(uScene, vUV).rgb;
float lum = dot(col, vec3(0.299, 0.587, 0.114));
gl_FragColor = vec4(vec3(lum), 1.0);
\`\`\`

### Chromatic Aberration
\`\`\`glsl
vec2 offset = (vUV - 0.5) * 0.01;
float r = texture2D(uScene, vUV - offset).r;
float g = texture2D(uScene, vUV).g;
float b = texture2D(uScene, vUV + offset).b;
gl_FragColor = vec4(r, g, b, 1.0);
\`\`\`

### Screen-Space UV Access
\`\`\`glsl
vec2 uv = gl_FragCoord.xy / uResolution;  // [0,1] screen UV
\`\`\`

### Three.js EffectComposer
\`\`\`javascript
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))      // pass 1: render scene
composer.addPass(new UnrealBloomPass(...))           // pass 2: bloom
// composer.addPass(...more passes...)

// In animation loop: composer.render() instead of renderer.render()
\`\`\``,
    },

    // ── 5. Live post-process demo ──────────────────────────────────────────
    {
      type: 'js',
      id: 'postprocess-demo',
      html: `<canvas id="c-pp" width="480" height="260" style="width:480px;height:260px;border-radius:8px;display:block;margin:auto;background:#111"></canvas>
<div style="display:flex;gap:10px;justify-content:center;margin-top:8px;flex-wrap:wrap">
  <button id="pp-none" style="background:#7bf3;color:#fff;border:1px solid #7bf;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:monospace">None</button>
  <button id="pp-gray" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:monospace">Grayscale</button>
  <button id="pp-chro" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:monospace">Chromatic Ab.</button>
  <button id="pp-vign" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:monospace">Vignette</button>
  <button id="pp-pixe" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:monospace">Pixelate</button>
</div>`,
      startCode: `const c=document.getElementById('c-pp');
const gl=c.getContext('webgl');
const W=480,H=260;

// Simple colored scene drawn to an offscreen canvas, then used as texture
const offC=document.createElement('canvas');
offC.width=W;offC.height=H;
const offCtx=offC.getContext('2d');

let mode='none';
const btns=['none','gray','chro','vign','pixe'];
btns.forEach(b=>{
  document.getElementById('pp-'+b).onclick=()=>{
    mode=b;
    btns.forEach(x=>{
      document.getElementById('pp-'+x).style.background=x===b?'#7bf3':'#222';
      document.getElementById('pp-'+x).style.borderColor=x===b?'#7bf':'#444';
    });
  };
});

const vs=\`attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0,1);}\`;
const fs=\`precision mediump float;
varying vec2 vUV;
uniform sampler2D uTex;
uniform int uMode;
uniform float uTime;
void main(){
  if(uMode==0){
    gl_FragColor=texture2D(uTex,vUV);
  } else if(uMode==1){
    vec3 c=texture2D(uTex,vUV).rgb;
    float l=dot(c,vec3(.299,.587,.114));
    gl_FragColor=vec4(vec3(l),1);
  } else if(uMode==2){
    vec2 off=(vUV-.5)*.03;
    float r=texture2D(uTex,vUV-off).r;
    float g=texture2D(uTex,vUV).g;
    float b=texture2D(uTex,vUV+off).b;
    gl_FragColor=vec4(r,g,b,1);
  } else if(uMode==3){
    vec3 col=texture2D(uTex,vUV).rgb;
    float d=length(vUV-.5)*2.;
    col*=1.-d*d*.7;
    gl_FragColor=vec4(col,1);
  } else {
    vec2 px=floor(vUV*vec2(60.,34.))/vec2(60.,34.);
    gl_FragColor=texture2D(uTex,px);
  }
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
const uTex=gl.getUniformLocation(prog,'uTex');

const tex=gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D,tex);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);

let t=0;
function drawScene(){
  t+=0.02;
  offCtx.fillStyle='#0d0d18';offCtx.fillRect(0,0,W,H);
  for(let i=0;i<8;i++){
    const x=80+i*50+Math.sin(t+i)*20;
    const y=H/2+Math.cos(t*0.7+i*0.9)*50;
    const r=18+Math.sin(t*0.5+i)*6;
    offCtx.beginPath();offCtx.arc(x,y,r,0,Math.PI*2);
    offCtx.fillStyle=\`hsl(\${i*45+t*10},70%,55%)\`;offCtx.fill();
  }
  offCtx.fillStyle='rgba(255,255,255,0.6)';offCtx.font='bold 14px monospace';
  offCtx.fillText('3D Scene (rendered to FBO texture)',12,22);
}
function frame(){
  drawScene();
  gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,offC);
  const modeMap={none:0,gray:1,chro:2,vign:3,pixe:4};
  gl.uniform1i(uMode,modeMap[mode]);
  gl.uniform1i(uTex,0);
  gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  requestAnimationFrame(frame);
}
frame();`,
    },

    // ── 6. Three.js WebGLRenderTarget ─────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Three.js WebGLRenderTarget

\`\`\`javascript
// Create a render target
const renderTarget = new THREE.WebGLRenderTarget(width, height, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  type: THREE.UnsignedByteType,  // or HalfFloatType for HDR
})

// Render to it
renderer.setRenderTarget(renderTarget)
renderer.render(scene, camera)
renderer.setRenderTarget(null)   // restore screen

// Use the texture
const screenMaterial = new THREE.MeshBasicMaterial({
  map: renderTarget.texture,  // the rendered image as a texture
})

// Minimap / security camera
const miniCam = new THREE.PerspectiveCamera(90, 1, 0.1, 100)
renderer.setRenderTarget(minimapTarget)
renderer.render(scene, miniCam)
renderer.setRenderTarget(null)
// Display minimapTarget.texture on a plane in the scene
\`\`\``,
    },

    // ── 7. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-fbo-init',
      instruction: 'Why is the colour texture attached to the FBO created with null pixel data?',
      options: [
        { label: 'A', text: 'Null is required to trigger GPU memory allocation without specifying initial values — the GPU will fill it with zeros' },
        { label: 'B', text: 'Null data means the texture will be rendered to and does not need initial content — the GPU allocates the memory, the render fills it' },
        { label: 'C', text: 'Null data creates a write-only texture, which is required for FBO colour attachments' },
        { label: 'D', text: 'This is a WebGL 1 quirk — WebGL 2 requires non-null initial data for FBO textures' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-posteffect',
      instruction: 'A bloom effect needs to isolate bright pixels, blur them, then add back to the scene. What is the minimum number of render passes required?',
      options: [
        { label: 'A', text: '1 pass — all operations happen in a single fragment shader' },
        { label: 'B', text: '2 passes — one to render the scene, one to apply bloom' },
        { label: 'C', text: '3 passes — render scene, extract bright + blur, composite' },
        { label: 'D', text: '4+ passes — render scene, extract bright, horizontal blur, vertical blur, composite' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 9. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-screen-uv',
      instruction: 'In a post-process fragment shader, how do you get the UV coordinate of the current pixel relative to the full screen?',
      options: [
        { label: 'A', text: 'vTexCoord — automatically passed from the vertex shader with no setup' },
        { label: 'B', text: 'gl_FragCoord.xy / uResolution — divide screen-space coords by viewport size' },
        { label: 'C', text: 'gl_Position.xy — available in fragment shaders as the clip-space position' },
        { label: 'D', text: 'texture2D(uScene, gl_FragCoord.xy) — pass raw pixel coords to the sampler' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: Grayscale post-process ──────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Grayscale Post-Process Pass

Complete the fullscreen fragment shader that reads a texture and outputs greyscale using the luminance formula:

\`L = 0.299*r + 0.587*g + 0.114*b\`

**Requirements:**
1. \`vec4 col = texture2D(uTex, vUV)\`
2. \`float L = 0.299*col.r + 0.587*col.g + 0.114*col.b\`
3. \`gl_FragColor = vec4(L, L, L, 1.0)\``,
      html: `<canvas id="c" width="400" height="260" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c=document.getElementById('c'),gl=c.getContext('webgl'),W=c.width,H=c.height
gl.viewport(0,0,W,H)
const fbo=gl.createFramebuffer(),tex=gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D,tex)
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)
gl.bindFramebuffer(gl.FRAMEBUFFER,fbo)
gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0)
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
function mkprog(v,f){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,v));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);return p}
const quad=new Float32Array([-1,-1,1,-1,-1,1,1,1])
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,quad,gl.STATIC_DRAW)
const p1=mkprog(\\\`attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}\\\`,\\\`precision mediump float;void main(){vec2 uv=gl_FragCoord.xy/vec2(400.,260.);gl_FragColor=vec4(uv.x,uv.y,0.5,1.);}\\\`)
gl.useProgram(p1);gl.enableVertexAttribArray(gl.getAttribLocation(p1,'p'));gl.vertexAttribPointer(gl.getAttribLocation(p1,'p'),2,gl.FLOAT,false,0,0)
gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
gl.bindFramebuffer(gl.FRAMEBUFFER,null)
const fsP=\\\`precision mediump float;
uniform sampler2D uTex;varying vec2 vUV;
void main(){
  // TODO 1: vec4 col = texture2D(uTex, vUV)
  // TODO 2: float L  = 0.299*col.r + 0.587*col.g + 0.114*col.b
  // TODO 3: gl_FragColor = vec4(L, L, L, 1.0)
  gl_FragColor=vec4(.5,.5,.5,1.); // placeholder
}\\\`
const p2=mkprog(\\\`attribute vec2 p;varying vec2 vUV;void main(){vUV=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`,fsP)
gl.useProgram(p2);gl.enableVertexAttribArray(gl.getAttribLocation(p2,'p'));gl.vertexAttribPointer(gl.getAttribLocation(p2,'p'),2,gl.FLOAT,false,0,0)
gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(gl.getUniformLocation(p2,'uTex'),0)
gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      solutionCode: `const c=document.getElementById('c'),gl=c.getContext('webgl'),W=c.width,H=c.height
gl.viewport(0,0,W,H)
const fbo=gl.createFramebuffer(),tex=gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D,tex)
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)
gl.bindFramebuffer(gl.FRAMEBUFFER,fbo)
gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0)
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
function mkprog(v,f){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,v));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);return p}
const quad=new Float32Array([-1,-1,1,-1,-1,1,1,1])
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,quad,gl.STATIC_DRAW)
const p1=mkprog(\\\`attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}\\\`,\\\`precision mediump float;void main(){vec2 uv=gl_FragCoord.xy/vec2(400.,260.);gl_FragColor=vec4(uv.x,uv.y,0.5,1.);}\\\`)
gl.useProgram(p1);gl.enableVertexAttribArray(gl.getAttribLocation(p1,'p'));gl.vertexAttribPointer(gl.getAttribLocation(p1,'p'),2,gl.FLOAT,false,0,0)
gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
gl.bindFramebuffer(gl.FRAMEBUFFER,null)
const fsP=\\\`precision mediump float;
uniform sampler2D uTex;varying vec2 vUV;
void main(){
  vec4 col=texture2D(uTex,vUV);
  float L=0.299*col.r+0.587*col.g+0.114*col.b;
  gl_FragColor=vec4(L,L,L,1.);
}\\\`
const p2=mkprog(\\\`attribute vec2 p;varying vec2 vUV;void main(){vUV=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`,fsP)
gl.useProgram(p2);gl.enableVertexAttribArray(gl.getAttribLocation(p2,'p'));gl.vertexAttribPointer(gl.getAttribLocation(p2,'p'),2,gl.FLOAT,false,0,0)
gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(gl.getUniformLocation(p2,'uTex'),0)
gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      check: (code) => /texture2D\(uTex/.test(code) && /0\.299/.test(code) && /0\.587/.test(code) && /vec4\(L,\s*L,\s*L/.test(code),
    },
  ],
}

export default {
  id: 'three-js-4-3-framebuffers',
  slug: 'framebuffers-and-render-targets',
  chapter: 'three-js.4',
  order: 3,
  title: 'Framebuffers & Render Targets',
  subtitle: 'Render to texture — the fundamental primitive behind every post-processing effect.',
  tags: ['three-js', 'framebuffer', 'render-target', 'post-processing', 'fbo'],
  hook: {
    question: 'You render 3D scene twice: first to texture A, then full-screen quad reading A and outputting to screen. What visual transformations can you apply between the two passes that are impossible in a single pass?',
    realWorldContext: 'Every post-process effect (bloom, motion blur, SSAO, SSGI, DoF, chromatic aberration) requires at least one render-to-texture pass. Framebuffers are the backbone of modern visual fidelity.',
  },
  intuition: {
    prose: 'FBO = colour texture + depth renderbuffer. Bind FBO → render scene → bind null → draw full-screen quad sampling the texture. Every post-process is a variation of this pattern.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Framebuffers & Render Targets', props: { lesson: LESSON_3JS_4_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['FBO: createFramebuffer → attach colourTex + depthRB → render → bind null → fullscreen quad reads colourTex → screen. Three.js: WebGLRenderTarget + EffectComposer.'],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"FBO: render to texture, then read it on a fullscreen quad." What does rendering to a framebuffer object (FBO) enable that rendering directly to the screen does not?',
      options: [
        'Faster rendering — FBOs bypass the GPU pipeline',
        'The rendered image becomes a texture that subsequent passes can read and process — enabling post-processing effects like blur, bloom, or colour grading',
        'FBOs support higher resolutions than the screen',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Attach colourTex + depthRB." Why does a framebuffer typically need both a colour texture and a depth renderbuffer?',
      options: [
        'Colour stores the pixel values; depth stores the shadow map',
        'Colour captures the final rendered image; depth enables correct depth testing during the render pass so geometry is drawn in the right order',
        'Both are required by the WebGL specification regardless of use',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Bind null to render to screen." What happens if you forget to unbind the FBO after your off-screen render pass?',
      options: [
        'Nothing — the renderer detects when it should switch to the screen',
        'Subsequent draw calls continue writing into the FBO texture instead of the screen, and the screen shows the previous frame or nothing',
        'The FBO texture is automatically displayed',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Three.js: WebGLRenderTarget + EffectComposer." You want to add a blur post-process effect. At what point in the rendering sequence should the blur pass run?',
      options: [
        'Before the main scene render, on an empty buffer',
        'After the main scene is rendered into a RenderTarget — the blur pass reads that texture and outputs the blurred result, which can then feed the next pass or the screen',
        'During the scene render, one object at a time',
      ],
      correct: 1,
    },
  ],
}

export { LESSON_3JS_4_3 }
