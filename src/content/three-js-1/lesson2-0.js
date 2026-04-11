// Three.js · Chapter 2 · Lesson 0 — Textures & UV Mapping
// ============================================================
// LESSON PLAN
// ============================================================
//
// CONCEPT:
//   A texture is an image stored on the GPU. UV coordinates (ranging 0→1 on each axis)
//   map each surface point on a triangle to a location in the texture image.
//   This is how flat triangles acquire the appearance of complex, detailed surfaces.
//
// HISTORY:
//   - 1974: Ed Catmull invents texture mapping in his PhD thesis at the University of Utah
//   - 1983: Atari introduces the first hardware texture mapping in their arcade games
//   - 1986: Pixar's REYES renderer uses sophisticated texture filtering
//   - 1996: 3dfx Voodoo ships bilinear texture filtering in consumer hardware
//   - 1999: DirectX 7 introduces mipmapping in hardware — a critical performance feature
//   - 2007: OpenGL 3.2 adds array textures, buffer textures, integer textures
//   Catmull's insight (unwrap 3D surface → 2D image → color lookup) remains unchanged after 50 years.
//
// MATHEMATICS:
//   UV coordinates: (u, v) ∈ [0,1]×[0,1]. u=horizontal, v=vertical (v may flip between APIs!)
//   In OpenGL/WebGL: (0,0) = bottom-left, (1,1) = top-right of the texture.
//   In Three.js default: same as OpenGL.
//   Texture lookup: colour = texture(uTexture, vUv)  [GLSL fragment shader]
//   Wrapping modes:
//     REPEAT:      (1.3, 0.7) → (0.3, 0.7)   — tiles
//     CLAMP_EDGE:  (1.3, 0.7) → (1.0, 0.7)   — stretches border
//     MIRRORED:    (1.3, 0.7) → (0.7, 0.7)   — mirror-tiles
//   Filtering:
//     Nearest: pick the closest texel    — pixelated look (Minecraft style)
//     Bilinear: average 4 nearest texels — smooth for magnification
//     Mipmap (Trilinear): precomputed half-resolution levels for minification
//
// CELL PLAN (9 cells):
//   Cell 1: markdown — What is a texture? Analogy: decal stickers on 3D objects.
//                      UVs: the "flattening" of a 3D surface to 2D coordinates.
//   Cell 2: js       — "UV Unwrap Visualiser": a cube drawn in 2D alongside its UV layout
//                      (a cross-shaped unwrap). Hover a face → highlight in both views.
//                      Drag a UV point → watch the texture distort on the 3D face.
//   Cell 3: challenge— Q: "A vertex has UV (0.5, 1.0). Wrapping is CLAMP_TO_EDGE.
//                           You scale UVs by 2.0 → UV becomes (1.0, 2.0). What colour samples?"
//   Cell 4: markdown — Uploading a texture to the GPU: gl.createTexture → gl.texImage2D.
//                      Mipmaps: gl.generateMipmap(). The 4-texel alignment requirement.
//   Cell 5: js       — LIVE: a quad with a draggable uOffset/vOffset uniform
//                      The texture scrolls (used for water, conveyor belts, cloud effects).
//                      Dropdown: switch wrapping mode REPEAT → CLAMP → MIRROR
//   Cell 6: challenge— Q: "You display a 512×512 texture on a 64×64 screen area.
//                           Without mipmapping, what visual artefact appears?"
//   Cell 7: markdown — Filtering deep dive: aliasing explained mathematically.
//                      Nyquist theorem applied to textures: minification needs < 0.5 texel/pixel.
//                      Anisotropic filtering: corrects blurring on surfaces viewed at steep angles.
//   Cell 8: js       — "Filter Comparator": same scene with Nearest / Linear / Mipmap / Aniso
//                      Side-by-side at an oblique camera angle to exaggerate the difference.
//                      Slider for camera tilt to find the exact angle where each method fails.
//   Cell 9: challenge— Q: "When would you intentionally use NEAREST filtering? (Pixel art, etc.)"
//
// THREE.JS PARALLEL:
//   new THREE.TextureLoader().load('path.jpg')             — async load
//   texture.wrapS = THREE.RepeatWrapping                   — horizontal wrapping
//   texture.wrapT = THREE.RepeatWrapping                   — vertical wrapping
//   texture.repeat.set(2, 2)                               — UV scale
//   texture.offset.set(0.5, 0)                             — UV offset
//   texture.anisotropy = renderer.capabilities.getMaxAnisotropy()  — max quality
//   In ShaderMaterial: uniform sampler2D uTexture; + texture(uTexture, vUv)
//
// STUDENT TASKS:
//   - Implement UV scrolling on a water plane using uTime uniform + fragUv offset
//   - Apply a 2×2 tile repeat to a floor texture
//   - Compare NEAREST vs LINEAR filtering on a pixel-art sprite
//   - Load two textures and blend between them using mix(texture1, texture2, t)

const LESSON_3JS_2_0 = {
  title: 'Textures & UV Mapping',
  subtitle: 'How images are mapped to 3D surfaces — and the mathematics of wrapping, filtering, and mipmaps.',
  sequential: true,
  cells: [
    {
      type: 'markdown',
      instruction: `## 🚧 Coming Soon — Lesson 2-0

### Textures & UV Mapping
*A flat triangle has no detail. A UV-mapped texture gives it infinite complexity.*

---

**🎯 What you'll master:**
- UV coordinates: the 2D "address" on a texture image (0→1 range on each axis)
- How UV unwrapping works: "flattening" a 3D surface to 2D (like unfolding a cardboard box)
- Texture upload pipeline: \`gl.createTexture\` → \`gl.texImage2D\` → \`gl.generateMipmap\`
- Wrapping modes: REPEAT (tiles), CLAMP_TO_EDGE (stretches border), MIRRORED_REPEAT
- Filtering: NEAREST (pixel-art), LINEAR (smooth), Trilinear Mipmap (correct minification), Anisotropic (steep angles)
- UV animation: scrolling, scaling, and rotating UVs in the fragment shader for water/fire effects

**🔬 Interactive experiments you'll run:**
- Hover faces on a UV-unwrapped cube and see correspondence between 3D face and 2D UV layout
- Animating UV offset in real time with wrapping mode toggle — build a scrolling water effect
- Compare all four filtering modes side-by-side at an oblique camera angle

**📐 Mathematics you'll derive:**
- Why mipmapping requires power-of-2 textures (historical: now relaxed in WebGL 2)
- Aliasing: a 512×512 texture on a 64×64 screen requires 8:1 minification — without mipmaps, most texels are skipped = shimmer

**⚡ Three.js connection:**
\`TextureLoader\`, \`texture.wrapS/T\`, \`texture.repeat\`, \`texture.offset\`, \`texture.anisotropy\`. In ShaderMaterial: \`uniform sampler2D uTexture; vec4 col = texture(uTexture, vUv);\``,
    },
  ],
};

export default {
  id: 'three-js-2-0-textures',
  slug: 'textures-and-uv-mapping',
  chapter: 'three-js.2',
  order: 0,
  title: 'Textures & UV Mapping',
  subtitle: 'How images are mapped to 3D surfaces — and the mathematics of wrapping, filtering, and mipmaps.',
  tags: ['three-js', 'webgl', 'textures', 'uv-mapping', 'mipmaps', 'filtering', 'sampler2d'],
  hook: {
    question: 'A triangle has 3 vertices. A texture has 4 million pixels. How does the GPU decide which pixel colour appears at any given point inside the triangle — without reading all 4 million pixels?',
    realWorldContext: 'Ed Catmull invented texture mapping for his 1974 PhD thesis so that computer-generated hands would have knuckle creases. The same technique now makes every photorealistic surface in games, films, and AR.',
  },
  intuition: {
    prose: [
      'UV = a 2D coordinate pair (u,v) ∈ [0,1] per vertex that addresses a point in the texture.',
      'The rasteriser interpolates UV across the triangle exactly like any other varying.',
      'Fragment shader: texture(uTexture, vUv) returns the texel colour at the interpolated UV.',
      'Mipmaps = precomputed half-scale levels. GPU picks the right level based on screen-space footprint.',
    ],
    callouts: [],
    visualizations: [],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'UV (0,0) = bottom-left of texture (in WebGL). UV (1,1) = top-right.',
    'Wrapping: REPEAT tiles, CLAMP_TO_EDGE stretches the edge pixel, MIRRORED_REPEAT mirrors.',
    'Filtering: NEAREST = pixelated. LINEAR = smooth. MIPMAP = correct for minification.',
    'Upload: createTexture → bindTexture → texImage2D(imageElement) → generateMipmap',
    'Three.js: TextureLoader().load() → sampler2D uniform → texture(u, vUv) in GLSL',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_2_0 };
