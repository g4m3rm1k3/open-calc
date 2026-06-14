// Three.js · Chapter 5 · Lesson 1
// Normal Mapping

const LESSON_3JS_5_1 = {
  title: 'Normal Mapping',
  subtitle: 'Per-pixel surface detail without extra geometry — the technique that changed real-time 3D.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Fake geometry with real lighting

A rock mesh has 500 triangles. With normal mapping it appears to have the surface detail of 500,000 triangles — sharp edges, pitted surfaces, scratches. All at zero additional geometry cost.

Normal mapping works because **lighting depends on the surface normal**, not the actual geometry. If you change the normals per-pixel, the lighting changes per-pixel — and the surface appears to have geometry it doesn't actually have.

The normal map stores a direction at every pixel. The shader reads that direction, uses it for lighting instead of the interpolated vertex normal, and the surface appears richly detailed.`,
    },

    // ── 1. Tangent space ──────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Tangent Space — Where Normal Maps Live

Normal map textures store normals in **tangent space** — a local coordinate system relative to the surface at each point.

In tangent space:
- **Z axis** = surface normal direction (pointing "up" from the surface)
- **X axis** = tangent direction (along the surface, in U direction)
- **Y axis** = bitangent direction (along the surface, in V direction)

A flat surface in tangent space has normal \`(0, 0, 1)\`, which encodes as RGB \`(0.5, 0.5, 1.0)\` (the distinctive blue-purple of normal maps). Bumps deviate from this value.

**Decoding:**
\`\`\`glsl
vec3 normalTS = texture2D(uNormalMap, vUV).rgb;
normalTS = normalTS * 2.0 - 1.0;    // [0,1] → [-1,1]
// normalTS is now in tangent space: (0,0,1) = flat surface
\`\`\``,
    },

    // ── 2. TBN matrix ─────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The TBN Matrix

To use a tangent-space normal in world-space lighting, you need to transform it. The **TBN matrix** (Tangent, Bitangent, Normal) does this:

\`\`\`glsl
// In vertex shader:
vec3 T = normalize(vec3(uModel * vec4(aTangent, 0.0)));
vec3 N = normalize(vec3(uModel * vec4(aNormal, 0.0)));
// Gram-Schmidt re-orthogonalization:
T = normalize(T - dot(T, N) * N);
vec3 B = cross(N, T);
mat3 TBN = mat3(T, B, N);  // columns: T, B, N

// In fragment shader:
vec3 normalTS = texture2D(uNormalMap, vUV).rgb * 2.0 - 1.0;
vec3 worldNormal = normalize(TBN * normalTS);  // tangent → world space

// Then use worldNormal for lighting as usual
vec3 L = normalize(uLightPos - vFragPos);
float diff = max(0.0, dot(worldNormal, L));
\`\`\`

**Why re-orthogonalize?** Interpolating the TBN vectors across a triangle (as varyings) can lose orthogonality. Gram-Schmidt correction restores it per-fragment.`,
    },

    // ── 3. Normal map visual demo ──────────────────────────────────────────
    {
      type: 'js',
      id: 'normal-demo',
      html: `<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
  <div>
    <canvas id="c-flat" width="200" height="200" style="border-radius:8px;background:#111;display:block"></canvas>
    <p style="text-align:center;font-family:monospace;font-size:12px;color:#f87;margin:4px 0">Flat normals (200 tris)</p>
  </div>
  <div>
    <canvas id="c-norm" width="200" height="200" style="border-radius:8px;background:#111;display:block"></canvas>
    <p style="text-align:center;font-family:monospace;font-size:12px;color:#7f9;margin:4px 0">Normal mapped (same 200 tris)</p>
  </div>
</div>
<div style="text-align:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px">
  Light: <input id="nlx" type="range" min="-100" max="100" value="50" style="width:120px"> X
  <input id="nly" type="range" min="-100" max="100" value="60" style="width:120px"> Y
</div>`,
      startCode: `// Procedural normal map: brick pattern
function brickNormal(u,v){
  const row=Math.floor(v*8);
  const col=Math.floor(u*8+(row%2?0.5:0));
  const fu=(u*8+(row%2?0.5:0))%1;
  const fv=(v*8)%1;
  // Mortar gap: normal points up (away from surface)
  if(fu<0.05||fu>0.95||fv<0.05||fv>0.95) return [0,0,1];
  // Brick face: slight outward bulge
  const bx=(fu-.5)*2, by=(fv-.5)*2;
  const dx=-bx*.3, dy=-by*.3;
  const len=Math.sqrt(dx*dx+dy*dy+1);
  return [dx/len,dy/len,1/len];
}

function makeSphere(id, useNorm, lx, ly){
  const c=document.getElementById(id);
  const ctx=c.getContext('2d');
  const W=200,H=200;
  ctx.clearRect(0,0,W,H);
  const imgData=ctx.createImageData(W,H);
  const d=imgData.data;
  const R=90;
  const L=new Float32Array([lx/100,ly/100,0.8]);
  const ll=Math.sqrt(L[0]*L[0]+L[1]*L[1]+L[2]*L[2]);
  L[0]/=ll;L[1]/=ll;L[2]/=ll;

  for(let py=0;py<H;py++){
    for(let px=0;px<W;px++){
      const x=(px-W/2)/R, y=(py-H/2)/R;
      const r2=x*x+y*y;
      if(r2>1){continue;}
      const z=Math.sqrt(1-r2);
      // UV for normal map (spherical)
      const u=0.5+Math.atan2(x,z)/(2*Math.PI);
      const v=0.5-Math.asin(y)/Math.PI;
      let N;
      if(useNorm){
        const bn=brickNormal(u,v);
        // Transform: TBN for a sphere
        const nx=x,ny=y,nz=z;
        // Simple approximation: perturb geometric normal
        const tx=-nz/Math.sqrt(nx*nx+nz*nz||1);
        const tz=nx/Math.sqrt(nx*nx+nz*nz||1);
        const ty=0;
        const bx_=ny*tz-nz*ty, by_=nz*tx-nx*tz, bz_=nx*ty-ny*tx;
        const bl=Math.sqrt(bx_*bx_+by_*by_+bz_*bz_)||1;
        N=[
          tx*bn[0]+bx_/bl*bn[1]+nx*bn[2],
          ty*bn[0]+by_/bl*bn[1]+ny*bn[2],
          tz*bn[0]+bz_/bl*bn[2]+nz*bn[2]
        ];
        const nl=Math.sqrt(N[0]*N[0]+N[1]*N[1]+N[2]*N[2]);
        N=[N[0]/nl,N[1]/nl,N[2]/nl];
      } else {
        N=[x,y,z];
      }
      const diff=Math.max(0,N[0]*L[0]+N[1]*L[1]+N[2]*L[2]);
      // brick color
      const row=Math.floor(v*8);
      const col=Math.floor(u*8+(row%2?0.5:0));
      const fu=(u*8+(row%2?0.5:0))%1;
      const fv=(v*8)%1;
      const isMortar=fu<0.05||fu>0.95||fv<0.05||fv>0.95;
      const r=isMortar?0.6:0.78, g=isMortar?0.55:0.35, b_=isMortar?0.5:0.25;
      const ambient=0.12;
      const i=(py*W+px)*4;
      d[i]=Math.min(255,(ambient+diff*0.88)*r*255);
      d[i+1]=Math.min(255,(ambient+diff*0.88)*g*255);
      d[i+2]=Math.min(255,(ambient+diff*0.88)*b_*255);
      d[i+3]=255;
    }
  }
  ctx.putImageData(imgData,0,0);
}

const lxEl=document.getElementById('nlx');
const lyEl=document.getElementById('nly');
function draw(){
  const lx=parseFloat(lxEl.value),ly=parseFloat(lyEl.value);
  makeSphere('c-flat',false,lx,ly);
  makeSphere('c-norm',true,lx,ly);
}
lxEl.addEventListener('input',draw);
lyEl.addEventListener('input',draw);
draw();`,
    },

    // ── 4. Normal map texture ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Normal Map Texture Encoding

Normal maps store XYZ directions in RGB channels:

| Normal direction | RGB value | Meaning |
|-----------------|-----------|---------|
| (0, 0, 1) = flat | (0.5, 0.5, 1.0) | No perturbation, straight up |
| (1, 0, 0.7) | (1.0, 0.5, 0.85) | Tilted right |
| (-1, 0, 0.7) | (0.0, 0.5, 0.85) | Tilted left |
| (0, 1, 0.7) | (0.5, 1.0, 0.85) | Tilted up |

The characteristic **blue-purple colour** of normal maps comes from most normals being near (0,0,1) → (0.5, 0.5, 1.0) → perceptually blue-ish.

### OpenGL vs DirectX Normal Maps
Some tools export in **DirectX** convention where the Y axis is flipped:
\`\`\`glsl
// OpenGL: Y+ is up (common in Three.js, Blender)
vec3 normalTS = texture2D(uNormalMap, vUV).rgb * 2.0 - 1.0;

// DirectX: Y is flipped — common in Unreal/Unity DX assets
vec3 normalTS = texture2D(uNormalMap, vUV).rgb * 2.0 - 1.0;
normalTS.y = -normalTS.y;   // flip green channel
\`\`\``,
    },

    // ── 5. Three.js normal mapping ────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Three.js Normal Map Setup

\`\`\`javascript
const textureLoader = new THREE.TextureLoader()

const normalMap = textureLoader.load('/textures/brick_normal.jpg')

const material = new THREE.MeshStandardMaterial({
  map: textureLoader.load('/textures/brick_albedo.jpg'),
  normalMap: normalMap,
  normalScale: new THREE.Vector2(1, 1),  // intensity multiplier
  // normalScale: new THREE.Vector2(1, -1) for DX-convention maps
})

// Three.js automatically:
// 1. Computes tangent attributes from geometry
// 2. Passes TBN matrix to shader
// 3. Decodes normal map in tangent space
// 4. Transforms to world space for lighting

// For custom geometry, compute tangents:
geometry.computeTangents()  // requires indexed geometry with UVs
\`\`\``,
    },

    // ── 6. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-flat-normal',
      instruction: 'A normal map texel has RGB value (0.5, 0.5, 1.0). After decoding (rgb * 2 - 1), what tangent-space normal does this represent?',
      options: [
        { label: 'A', text: '(0.5, 0.5, 1.0) — the RGB value directly is the normal' },
        { label: 'B', text: '(0, 0, 1) — the flat surface normal pointing straight up in tangent space' },
        { label: 'C', text: '(1, 1, 2) — the raw decoded value before normalization' },
        { label: 'D', text: '(-0.5, -0.5, 0) — shifting by -1 makes the XY components negative' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 7. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-tbn-purpose',
      instruction: 'The TBN matrix transforms the tangent-space normal into world space. Why can\'t you just use the tangent-space normal directly in the lighting calculation?',
      options: [
        { label: 'A', text: 'Tangent-space normals are not unit vectors, so dot products give wrong results' },
        { label: 'B', text: 'The light position and camera position are in world space — the dot product requires both vectors in the same space' },
        { label: 'C', text: 'GLSL doesn\'t support vec3 dot products with tangent-space vectors' },
        { label: 'D', text: 'Tangent-space normals are always (0,0,1) so lighting would be constant across the surface' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-normal-scale',
      instruction: 'You set normalScale to (2.0, 2.0) in Three.js. What visual effect does this produce?',
      options: [
        { label: 'A', text: 'The normal map texels are sampled twice, doubling texture resolution' },
        { label: 'B', text: 'The normal map is tiled twice in UV space' },
        { label: 'C', text: 'The XY normal perturbation is amplified — bumps appear deeper/more pronounced' },
        { label: 'D', text: 'The normal map contributes 200% of its effect, causing the surface to appear double-lit' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: Decode normal map ───────────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Decode a Normal Map Texture

Normal maps store XYZ packed in RGB (0..1). To get the real normal:

1. Sample: \`vec4 raw = texture2D(uNmap, vUV * 4.0)\`
2. Unpack: \`vec3 N = raw.rgb * 2.0 - 1.0\`
3. Normalize: \`N = normalize(N)\`
4. Use in lighting: \`float NdL = max(0.0, dot(N, L))\`

The result should show a bumpy brick-like surface lit from the top-left.`,
      html: `<canvas id="c" width="400" height="300" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c=document.getElementById('c'),gl=c.getContext('webgl')
gl.viewport(0,0,c.width,c.height)
const S=64,data=new Uint8Array(S*S*4)
for(let y=0;y<S;y++)for(let x=0;x<S;x++){
  const bx=x%16,by=y%8,edge=bx<1||bx>14||by<1||by>6
  const nx=edge?.5:(bx-7.5)/16,ny=edge?.5:(by-3.5)/8
  const nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny))
  const i=(y*S+x)*4
  data[i]=Math.round((nx+1)*127.5);data[i+1]=Math.round((ny+1)*127.5)
  data[i+2]=Math.round(nz*127.5+127);data[i+3]=255
}
const nmTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,nmTex)
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,S,S,0,gl.RGBA,gl.UNSIGNED_BYTE,data)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT)
const vs=\\\`attribute vec2 p;varying vec2 vUV;void main(){vUV=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs=\\\`precision mediump float;
uniform sampler2D uNmap;varying vec2 vUV;
void main(){
  vec3 L=normalize(vec3(1.,1.,1.));
  // TODO 1: vec4 raw = texture2D(uNmap, vUV * 4.0)
  // TODO 2: vec3 N   = raw.rgb * 2.0 - 1.0
  // TODO 3: N = normalize(N)
  // TODO 4: float NdL = max(0.0, dot(N, L))
  float NdL=0.5; // placeholder
  gl_FragColor=vec4(vec3(.8,.75,.6)*(0.15+NdL),1.);
}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
const a=gl.getAttribLocation(prog,'p')
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.uniform1i(gl.getUniformLocation(prog,'uNmap'),0)
gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      solutionCode: `const c=document.getElementById('c'),gl=c.getContext('webgl')
gl.viewport(0,0,c.width,c.height)
const S=64,data=new Uint8Array(S*S*4)
for(let y=0;y<S;y++)for(let x=0;x<S;x++){
  const bx=x%16,by=y%8,edge=bx<1||bx>14||by<1||by>6
  const nx=edge?.5:(bx-7.5)/16,ny=edge?.5:(by-3.5)/8
  const nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny))
  const i=(y*S+x)*4
  data[i]=Math.round((nx+1)*127.5);data[i+1]=Math.round((ny+1)*127.5)
  data[i+2]=Math.round(nz*127.5+127);data[i+3]=255
}
const nmTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,nmTex)
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,S,S,0,gl.RGBA,gl.UNSIGNED_BYTE,data)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT)
const vs=\\\`attribute vec2 p;varying vec2 vUV;void main(){vUV=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs=\\\`precision mediump float;
uniform sampler2D uNmap;varying vec2 vUV;
void main(){
  vec3 L=normalize(vec3(1.,1.,1.));
  vec4 raw=texture2D(uNmap,vUV*4.);
  vec3 N=raw.rgb*2.-1.;
  N=normalize(N);
  float NdL=max(0.,dot(N,L));
  gl_FragColor=vec4(vec3(.8,.75,.6)*(0.15+NdL),1.);
}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
const a=gl.getAttribLocation(prog,'p')
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.uniform1i(gl.getUniformLocation(prog,'uNmap'),0)
gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      check: (code) => /texture2D\(uNmap/.test(code) && /\*\s*2\.\s*-\s*1\./.test(code) && /normalize\(N\)/.test(code),
    },
  ],
}

export default {
  id: 'three-js-5-1-normal-mapping',
  slug: 'normal-mapping',
  chapter: 'three-js.5',
  order: 1,
  title: 'Normal Mapping',
  subtitle: 'Per-pixel surface detail without extra geometry — the technique that changed real-time 3D.',
  tags: ['three-js', 'normal-map', 'tbn', 'tangent-space', 'bump-map'],
  hook: {
    question: 'A rock mesh has 500 triangles. A normal map gives it the apparent lighting detail of 500,000 triangles. How does a 2D image tell the GPU which way is "up" at every pixel?',
    realWorldContext: 'Normal mapping is the single highest-impact optimization in real-time game graphics. It was the primary reason game characters went from blocky polygons to believable surfaces without increasing geometry cost.',
  },
  intuition: {
    prose: 'Normal map stores per-pixel tangent-space normals as RGB. Decode: rgb*2-1. TBN matrix transforms to world space. Use world normal for lighting. Flat = (0.5,0.5,1.0) = blue-purple.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Normal Mapping', props: { lesson: LESSON_3JS_5_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['normalMap.rgb*2-1 = tangent-space normal. TBN=mat3(T,B,N) transforms to world. geometry.computeTangents(). material.normalMap + normalScale in Three.js.'],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_3JS_5_1 }
