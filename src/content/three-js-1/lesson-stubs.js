// ============================================================
// STUB FILES — Lessons 2-1 through 6-4
// Each lesson is exported individually below.
// This file is intentionally a single module for remaining stubs.
// Split into individual files if lesson content gets large.
// ============================================================

// ─── Chapter 2: Rendering Fundamentals ───────────────────────────────────────

// LESSON 2-1: Multiple Textures & Blending
// CONCEPT: Most real surfaces need more than one texture: diffuse colour,
//   metalness, roughness, ambient occlusion, emissive — all in separate samplers.
//   Blending two textures in GLSL with mix() is the foundation of almost all
//   material systems.
// HISTORY: Multitexturing in hardware arrived with Voodoo2 (1998). OpenGL 1.3
//   introduced GL_TEXTURE0–GL_TEXTURE31 texture units. Today's GPUs support 32+.
// MATHEMATICS:
//   mix(a, b, t) = a*(1-t) + b*t   [GLSL linear blend between two textures]
//   Alpha blending: result = src.rgb * src.a + dst.rgb * (1 - src.a)
//   Multiply blend: result = a * b  [darkens — used for AO maps]
//   Add blend: result = clamp(a + b, 0, 1)  [used for emissive/glow overlays]
// CELL PLAN (9 cells):
//   C1: markdown — Why multiple textures? Material layers: colour + detail + AO
//   C2: js — Two texture loaders, mix slider combining diffuse + detail texture
//   C3: challenge — Q: mix(redTex, blueTex, 0.0) = ? vs mix(red, blue, 1.0)?
//   C4: markdown — Texture units (gl.TEXTURE0–N), binding multiple samplers
//   C5: js — Four-texture PBR setup: colour, roughness, metalness, AO combined
//   C6: challenge — Q: AO map darkens corners. What blend mode achieves this? (multiply)
//   C7: markdown — Alpha textures: cutout opacity vs true transparency
//   C8: js — Cutout foliage demo: discard if alpha < 0.5 vs smooth alpha blend
//   C9: challenge — Q: When does "discard" beat alpha blending for performance?
// THREE.JS PARALLEL:
//   material.map (diffuse), material.roughnessMap, material.metalnessMap, material.aoMap
//   In ShaderMaterial: uniform sampler2D uDiffuse, uRoughness;
//   gl.activeTexture(gl.TEXTURE1) + gl.bindTexture + gl.uniform1i(loc, 1)

// LESSON 2-2: Coordinate Systems Deep Dive
// CONCEPT: Revisit coordinate spaces from Lesson 0-4 but now with actual shader code.
//   Students see exactly which space world-space normals, view-space positions, and
//   screen-space UVs live in — and write shaders that use each correctly.
// HISTORY: The separation of model/world/view/clip spaces was formalised in the
//   1970s. Normal maps (tangent space) added a 5th operative space in the late 1990s.
// MATHEMATICS:
//   World-space normal: (normalMatrix * normal) — normalMatrix = inverse-transpose of modelView
//   View-space position: (modelViewMatrix * vec4(position, 1.0)).xyz
//   Screen-space UV from position: gl_FragCoord.xy / resolution
//   TBN matrix for tangent space to world: mat3(tangent, bitangent, normal)
// CELL PLAN (9 cells):
//   C1: markdown — Five spaces, which data lives where, common confusion sources
//   C2: js — "Space Visualiser" showing a colour-coded normal in each space
//   C3: challenge — Q: Why can't you use modelMatrix (not normalMatrix) for normals?
//   C4: markdown — Deriving normalMatrix: why inverse-transpose is needed for non-uniform scale
//   C5: js — Live: non-uniform scale breaks normals without normalMatrix (show the bug)
//   C6: challenge — Q: Object scaled (2,1,1). Normal at (0,1,0). Transform with normal matrix vs model matrix. Which is correct?
//   C7: markdown — Tangent space: the space inside each triangle, used for normal maps
//   C8: js — TBN matrix visualiser: shows T, B, N axes on a quad surface
//   C9: challenge — Q: A normal map stores (0.5, 0.5, 1.0) in RGB. What direction in tangent space?

// LESSON 2-3: Camera System — FPS Camera
// CONCEPT: An FPS camera converts mouse delta input into a view matrix that
//   represents where the player is looking. This requires Euler angles or quaternions
//   for rotation, and handles the full gimbal-lock free constraint of yaw+pitch only.
// HISTORY: Wolfenstein 3D (1992) introduced the FPS perspective. Quake (1996)
//   made the fully 3D mouselook camera iconic. The "look-at" math dates to 1965.
// MATHEMATICS:
//   Yaw (horizontal rotation): rotate around world Y axis
//   Pitch (vertical rotation): rotate around camera's local X axis (not world X!)
//   Pitch clamped to ±89° to prevent flip
//   Camera direction: dir.x = cos(yaw)*cos(pitch), dir.y = sin(pitch), dir.z = sin(yaw)*cos(pitch)
//   Move forward: position += normalize(dir) * speed * dt
//   Strafe: position += normalize(cross(dir, worldUp)) * speed * dt
// CELL PLAN (9 cells):
//   C1: markdown — Yaw and pitch: degrees of freedom for a camera, not roll
//   C2: js — "Camera Angle Visualiser": polar coordinate diagram of yaw+pitch → direction vector
//   C3: challenge — Q: Pitch is 89°. Player looks up further. What prevents the camera from flipping?
//   C4: markdown — Computing the View matrix from position + direction (lookAt approach vs manual)
//   C5: js — FPS camera demo: click-to-lock mouse, WASD walk, mouse look
//   C6: challenge — Q: Strafe left at 45° yaw. What direction does the player actually move?
//   C7: markdown — Orbit camera vs FPS camera vs top-down camera: the three archetypes
//   C8: js — Camera type switcher: same scene, three camera modes with transitions
//   C9: challenge — Q: An orbit camera rotates AROUND a target. FPS camera rotates AT a target. How does the view matrix math differ?
// THREE.JS PARALLEL:
//   THREE.PointerLockControls — wraps FPS camera logic
//   camera.rotation.order = 'YXZ'  — correct Euler order for FPS (yaw first)
//   camera.quaternion.setFromEuler(euler)
//   new THREE.OrbitControls(camera, renderer.domElement)

// LESSON 2-4: Colors, Materials & Phong Preview
// CONCEPT: Colour in computer graphics is not intuitive: sRGB vs linear RGB,
//   gamma correction, the split between geometry (mesh) and appearance (material).
//   This lesson introduces the Phong material model as a prelude to Chapter 3.
// HISTORY: Bui Tuong Phong (1975) published the per-pixel specular model in his Utah thesis.
//   It remained the dominant real-time model for 30 years until PBR (2012).
//   sRGB was standardised by HP/Microsoft in 1996, widely misunderstood to this day.
// MATHEMATICS:
//   Linear → sRGB: C_srgb ≈ C_linear^(1/2.2)  [gamma encoding]
//   sRGB → linear: C_linear ≈ C_srgb^2.2        [gamma decoding — must do before lighting!]
//   Phong: colour = ambient + diffuse + specular
//     ambient  = Ka * lightColour
//     diffuse  = Kd * lightColour * max(0, dot(N, L))
//     specular = Ks * lightColour * pow(max(0, dot(R, V)), shininess)
//       where R = 2*dot(N,L)*N - L  (reflection vector)
//             V = normalize(cameraPos - fragPos)
// CELL PLAN (9 cells):
//   C1: markdown — Colour channels in graphics: 0–1 floats, not 0–255 integers.
//                  sRGB vs linear: why uploading an sRGB image and not correcting it = incorrect lighting.
//   C2: js — "Gamma Comparator": side-by-side image rendering with/without gamma correction
//   C3: challenge — Q: You mix(red, blue, 0.5) in linear RGB and in sRGB. Which looks more "correct"? Why?
//   C4: markdown — The Phong model: ambient, diffuse, specular components. Each controlled separately.
//   C5: js — Phong material playground: sliders for Ka, Kd, Ks, shininess. Live 3D sphere.
//   C6: challenge — Q: Shininess = 4 vs 128. What changes about the specular highlight?
//   C7: markdown — Material vs Geometry: the same mesh with 10 different materials = 10 different objects
//   C8: js — Material gallery: same sphere mesh with 8 different material configs (matte, shiny, metallic preview)
//   C9: challenge — Q: Ambient term prevents the dark side from being pure black. Is this physically accurate?
// THREE.JS PARALLEL:
//   renderer.outputColorSpace = THREE.SRGBColorSpace  [gamma correction output]
//   texture.colorSpace = THREE.SRGBColorSpace          [decode sRGB on load]
//   MeshPhongMaterial({ shininess: 100, specular: 0xffffff })
//   MeshStandardMaterial({ roughness, metalness })   [PBR — see Chapter 5]

// ─── Chapter 3: Lighting ─────────────────────────────────────────────────────

// LESSON 3-0: The Lighting Equation
// CONCEPT: The Phong lighting equation, derived from scratch. Every term has
//   a geometric meaning. Students build the equation piece by piece by adding
//   each component and observing its visual contribution.
// HISTORY: Phong (1975) proposed the model as an approximation of real light.
//   Blinn (1977) proposed the half-vector variant (Blinn-Phong) that's almost
//   universally used instead. Neither is physically accurate but both are fast.
// MATHEMATICS:
//   Full Phong:
//     I = Ia*Ka + Id*Kd*max(0,N·L) + Is*Ks*pow(max(0,R·V), α)
//   Blinn-Phong (more common):
//     H = normalize(L + V)   (half-vector between light and view)
//     I = Ia*Ka + Id*Kd*max(0,N·L) + Is*Ks*pow(max(0,N·H), α)
//   Energy conservation violation: Kd + Ks > 1 is physically impossible but Phong doesn't enforce it.
// CELL PLAN (9 cells):
//   C1: markdown — "The problem light solves": a flat-colour triangle vs a shaded sphere
//   C2: js — Build-up animation: start with ambient only → add diffuse → add specular
//   C3: challenge — Q: Ambient contributes even when N·L < 0. Is this a hack or a feature?
//   C4: markdown — Normal vectors: per-face vs per-vertex (smooth shading). Gouraud vs Phong shading.
//   C5: js — "Shading Mode Comparator": flat (per-face) vs Gouraud (per-vertex) vs Phong (per-pixel)
//   C6: challenge — Q: Gouraud shading interpolates the COLOUR, Phong shading interpolates the NORMAL. Why does this matter for specular highlights?
//   C7: markdown — Light attenuation: 1/(a + b*d + c*d²). Why inverse-square isn't always correct.
//   C8: js — Attenuation explorer: point light with adjustable linear/quadratic constants
//   C9: challenge — Q: Physical light follows inverse-square law I ∝ 1/d². Phong uses 1/(1+0.09d+0.032d²). When and why does the physical law break down for graphics?
// THREE.JS PARALLEL:
//   MeshPhongMaterial — implements Phong per-pixel automatically
//   AmbientLight, DirectionalLight, PointLight, SpotLight — all Three.js light types

// LESSON 3-1: Phong & Blinn-Phong Shading
// CONCEPT: Implementing the full lighting equation in GLSL. The lesson goes
//   line-by-line through the shader code, deriving each term geometrically.
// MATHEMATICS:
//   Normal transformation: N_view = normalize(normalMatrix * normal)
//   Light direction (from fragment, not to fragment!): L = normalize(lightPos - fragPos)
//   View direction: V = normalize(cameraPos - fragPos)
//   Reflection: R = reflect(-L, N)  [or: 2*dot(N,L)*N - L]
//   Half vector: H = normalize(L + V)
//   Diffuse: max(0.0, dot(N, L)) * lightColor * diffuseColor
//   Specular (Phong):      pow(max(0.0, dot(R, V)), shininess) * specularColor
//   Specular (Blinn-Phong): pow(max(0.0, dot(N, H)), shininess) * specularColor
// CELL PLAN (9 cells):
//   C1: markdown — Full GLSL implementation walkthrough, line by line
//   C2: js — Live GLSL editor: Phong shader on a sphere, moveable light
//   C3: challenge — Q: dot(N, L) is -.0.3 (light behind surface). You use max(0, dot(N,L)). Result?
//   C4: markdown — Blinn vs Phong: the half-vector is more efficient AND more physically plausible
//   C5: js — Side-by-side: same scene with Phong vs Blinn-Phong at extreme grazing angles
//   C6: challenge — Q: At 90° between L and V, Phong specular = 0. Blinn-Phong specular may not = 0. Why?
//   C7: markdown — Multiple lights: just sum contributions. Watch for performance (N lights = N calculations per fragment)
//   C8: js — Multi-light scene: 1, 2, 4 lights with individually toggleable colours
//   C9: challenge — Q: 8 point lights, 1M fragments. How many dot() ops per frame?
// THREE.JS PARALLEL:
//   MeshPhongMaterial auto-generates Phong GLSL (inspectable via material.onBeforeCompile)
//   To write your own: ShaderMaterial + manual Phong GLSL (valuable exercise)

// LESSON 3-2: Materials & Surface Properties
// CONCEPT: Material parameters control the visual response of a surface to light.
//   Ka (ambient), Kd (diffuse), Ks (specular), shininess — these four values define
//   the appearance of any non-metallic surface under Phong shading.
// MATHEMATICS:
//   Matte surface:   Ka=0.2, Kd=0.8, Ks=0.0, shininess=n/a
//   Plastic surface: Ka=0.1, Kd=0.5, Ks=0.4, shininess=32
//   Metal (approx):  Ka=0.1, Kd=0.2, Ks=0.8, shininess=128
//   Physically: Ka+Kd+Ks ≤ 1 (energy conservation). Phong doesn't enforce this.
//   Real materials: shininess 2 (rough chalk) to 300 (polished metal).
// CELL PLAN (9 cells):
//   C1: markdown — Material as a surface "personality" under light.
//   C2: js — Material preset gallery: wood, plastic, rubber, gold, chrome
//   C3: challenge — Q: Gold reflects yellow. Is this the diffuse or specular term?
//   C4: markdown — Shininess / exponent: the mathematical meaning (width of specular lobe)
//   C5: js — Shininess slider from 1 to 512: show how highlight shrinks and brightens
//   C6: challenge — Q: You need a velvet material. Velvet has light that scatters BACK toward the viewer at grazing angles. What Phong term approximates this?
//   C7: markdown — PBR teaser: why Phong's non-physical parameters lead to inconsistent looks under environment lighting
//   C8: js — PBR roughness vs Phong shininess: interactive side-by-side with IBL (teaser for Ch5)
//   C9: challenge — Q: In PBR, roughness=0.0 = perfect mirror. shininess=512 in Phong also looks mirror-like. Are they the same material?
// THREE.JS PARALLEL:
//   MeshPhongMaterial({ color, specular, shininess, emissive })
//   MeshLambertMaterial — diffuse only (no specular) for performance
//   MeshStandardMaterial — PBR (Chapter 5)

// LESSON 3-3: Directional, Point & Spot Lights
// CONCEPT: Three light types cover 95% of real-time lighting scenarios.
//   Each has different geometric formulas, attenuation behaviour, and performance cost.
// HISTORY:
//   - Directional: models the sun — infinite distance, parallel rays, no attenuation
//   - Point: models a light bulb — omnidirectional, inverse-square falloff
//   - Spot: models a flashlight — directional cone with inner/outer angle falloff
//   Spot lights date to Phong's 1975 paper. Area lights came later (harder, slower).
// MATHEMATICS:
//   Directional: L = normalize(-lightDir)  [no position, just direction. No attenuation.]
//   Point:       L = normalize(lightPos - fragPos). attenuation = 1/(a+b*d+c*d²)
//   Spot:        L = normalize(lightPos - fragPos)
//                theta = dot(L, normalize(-spotDir))  [cosine of angle]
//                epsilon = cos(innerAngle) - cos(outerAngle)
//                intensity = clamp((theta - cos(outerAngle)) / epsilon, 0, 1)
// CELL PLAN (9 cells):
//   C1: markdown — The three archetypes. When to use each. Performance tradeoffs.
//   C2: js — Scene with all three lights independently toggleable
//   C3: challenge — Q: Should a street lamp be directional, point, or spot? Why?
//   C4: markdown — Attenuation constants: constant, linear, quadratic terms and their physical meaning
//   C5: js — Attenuation explorer: drag sliders for a, b, c. Shows the distance-vs-brightness curve.
//   C6: challenge — Q: Physical inverse-square = 1/d². But 1/d² → infinity at d=0. How do games fix this?
//   C7: markdown — Spot light angle formula: the cosine trick for smooth edges (no branching needed)
//   C8: js — Spot light demo with inner/outer angle sliders (hard vs soft edge)
//   C9: challenge — Q: spot inner=30°, outer=45°. Fragment at angle=40°. What is the intensity?
// THREE.JS PARALLEL:
//   new THREE.DirectionalLight(color, intensity)
//   new THREE.PointLight(color, intensity, distance, decay)
//   new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay)

// ─── Chapter 4: Intermediate Graphics ────────────────────────────────────────

// LESSON 4-0: Model Loading — glTF & OBJ
// CONCEPT: Real projects use external 3D models (characters, environments, props)
//   created in Blender, Maya, or ZBrush. glTF is the modern standard "JPEG of 3D".
// HISTORY:
//   - 1988: Wavefront .obj — first widely used interchange format (text-based)
//   - 2015: Khronos introduces glTF 1.0 ("GL Transmission Format")
//   - 2017: glTF 2.0 — adds PBR materials, morph targets, skeleton rigging
//   - 2022: glTF becomes ISO standard (ISO 12113). Now the universal 3D interchange format.
// KEY CONCEPTS: GLTFLoader, binary .glb, embedded images, draco compression, LOD
// MATHEMATICS:
//   Morph targets: V_final = V_base + w1*V_delta1 + w2*V_delta2
//   Skeletal skinning: V_final = sum_i(weight_i * boneMatrix_i * restPoseInverse_i * V)
//   Draco geometry compression: predicitive encoding reduces 3D mesh by 10×
// CELL PLAN (9 cells):
//   C1: markdown — Why external formats? The mesh pipeline: model → export → import → render
//   C2: js — "Format Comparator": Obj (text), glTF (JSON+bin), glb (binary blob) size comparison
//   C3: challenge — Q: A glTF contains material properties AND geometry. What's the advantage?
//   C4: markdown — GLTFLoader step-by-step: loading, traversal, extracting meshes and materials
//   C5: js — Live Three.js glTF scene: a model with animated traversal inspector
//   C6: challenge — Q: You load a GLTF but textures appear grey. What's the likely cause?
//   C7: markdown — LOD (Level of Detail): swap mesh complexity by camera distance
//   C8: js — LOD demo: sphere with 5 LOD levels, visualise active level by distance
//   C9: challenge — Q: A game has 100 identical trees. GLTFLoader loads 100 copies. What's the right approach?
// THREE.JS PARALLEL:
//   new THREE.GLTFLoader()
//   gltf.scene.traverse(child => ...) — walk the scene graph
//   child.isMesh, child.geometry, child.material — access node data
//   new THREE.LOD() — manage LOD switching
//   new THREE.InstancedMesh(geo, mat, count) — 100 trees with ONE draw call

// LESSON 4-1: Depth Testing & the Z-Buffer
// CONCEPT: The Z-buffer (depth buffer) solves the hidden-surface problem: which
//   triangle is in front of which? Without it, the last-drawn object always wins.
// HISTORY:
//   - 1974: Ed Catmull invents the Z-buffer in his PhD thesis (same thesis as texture mapping!)
//   - 1977: First hardware Z-buffer in graphics workstations at Stanford
//   - 1996: Consumer GPUs ship with hardware Z-buffer for the first time (Voodoo)
//   - Reverse-Z buffer: modern approach — inverts depth precision distribution for better results
// MATHEMATICS:
//   Z-buffer stores depth in [0,1] for each pixel.
//   Perspective-correct depth: non-linear! Close to camera = high precision, far = low.
//   Linear vs perspective depth:
//     z_linear = 2*near*far / (far + near - z_ndc*(far-near))
//     z_ndc ∈ [-1,1] maps to z_buffer ∈ [0,1]
//   Depth fighting: two surfaces at nearly the same depth get the same z_buffer value → fighting.
//   Remedy: polygon offset (gl.polygonOffset) or different near/far values.
// CELL PLAN (9 cells):
//   C1: markdown — The painter's algorithm (draw back-to-front) and why it fails for intersecting surfaces
//   C2: js — "Painter's Algorithm Failure": two intersecting quads showing the sorting bug
//   C3: challenge — Q: You sort objects front-to-back. The front object overwrites the back. Does Z-buffer still need to do work?
//   C4: markdown — How the Z-buffer works: per-pixel depth comparison
//   C5: js — "Z-buffer Visualiser": toggle depth buffer display. Show depth as greyscale.
//   C6: challenge — Q: Near=0.01, far=1000. A flat surface at z=-5 and z=-5.001. Do they z-fight?
//   C7: markdown — Depth testing modes: LESS, LEQUAL, GREATER, ALWAYS — and when to use each
//   C8: js — Demo: z-prepass technique (render opaque geo first for early-z rejection)
//   C9: challenge — Q: You enable gl.GREATER depth test. What visual effect does this create?
// THREE.JS PARALLEL:
//   material.depthTest = true/false
//   material.depthWrite = true/false
//   material.depthFunc = THREE.LessEqualDepth  [default]
//   renderer.setRenderTarget(renderTarget) — framebuffer with depth attachment
//   camera near/far: the most impactful Z precision tuning

// LESSON 4-2: Blending & Transparency
// CONCEPT: Alpha blending makes transparent and semi-transparent surfaces possible.
//   The GPU blends the fragment's colour with the existing framebuffer colour using
//   configurable source and destination blend factors.
// HISTORY: Alpha channel was invented by Thomas Porter and Tom Duff at Lucasfilm in 1984.
//   Their Porter-Duff compositing algebra is still the basis of modern alpha blending.
//   "Premultiplied alpha" (alpha already baked into RGB) reduces colour fringing.
// MATHEMATICS:
//   Porter-Duff "over" operator (standard alpha blend):
//     result = src.rgb * src.a + dst.rgb * (1 - src.a)
//   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA) — this formula
//   Additive blending: result = src.rgb + dst.rgb  — used for particles/glow
//   Transparency sorting: alpha objects MUST be drawn back-to-front after opaques.
//   Why: the formula requires correct dst.rgb — it must already be written.
// CELL PLAN (9 cells):
//   C1: markdown — The compositing problem: how do we show something "behind" something transparent?
//   C2: js — "Blend Mode Explorer": two overlapping coloured quads with blend mode dropdown
//   C3: challenge — Q: src.a = 0.5, src.rgb = (1,0,0), dst.rgb = (0,0,1). What is result.rgb?
//   C4: markdown — Transparency sorting: why order matters (and when it doesn't with additive blending)
//   C5: js — "Sort Bug Demo": 3 transparent planes in wrong draw order vs correct order
//   C6: challenge — Q: You use additive blending for 1000 particle sprites. Do you need to sort them?
//   C7: markdown — Premultiplied alpha vs straight alpha. OIT (Order-Independent Transparency) teaser.
//   C8: js — Side-by-side: premultiplied vs straight alpha at partially transparent borders
//   C9: challenge — Q: You use discardif(alpha < 0.5) instead of blending. What are the visual trade-offs?
// THREE.JS PARALLEL:
//   material.transparent = true  (enables blending)
//   material.opacity = 0.5        (alpha value)
//   material.depthWrite = false   (transparent objects shouldn't write to depth)
//   material.blending = THREE.AdditiveBlending / THREE.NormalBlending
//   renderOrder — override automatic sorting for specific objects

// LESSON 4-3: Framebuffers & Render Targets
// CONCEPT: A framebuffer is a collection of attachments (colour, depth, stencil)
//   that the GPU renders into. By rendering to a texture (off-screen render), you
//   can use the result as input for a later rendering pass. This is the foundation
//   of all post-processing effects.
// HISTORY:
//   - 1988: Shadow mapping (Williams 1978) was the first major use of render-to-texture
//   - 2000: Framebuffer Objects (FBOs) introduced in OpenGL via EXT_framebuffer_object
//   - 2007: Multiple Render Targets (MRT) — write to multiple colour textures in one pass
//   - Modern engines: deferred rendering uses 4–8 bound render targets simultaneously
// MATHEMATICS:
//   Render target = texture used as framebuffer attachment.
//   Post-process shader: reads from the render target texture and writes to screen.
//   Screen-space UV for reading: gl_FragCoord.xy / resolution → sample the render texture.
//   Gaussian blur: weighted sum of neighbours, σ controls spread.
//     weight[i] = (1/sqrt(2π)σ) * e^(-i²/2σ²)
// CELL PLAN (9 cells):
//   C1: markdown — The concept: render to texture, then use that texture as a post-process pass
//   C2: js — "Double Buffer Demo": render a bouncing ball to a texture, then display with colour adjustment
//   C3: challenge — Q: Why do post-process shaders run on a full-screen quad, not on the 3D mesh?
//   C4: markdown — FBO setup: createFramebuffer, createTexture (colour attachment), createRenderbuffer (depth)
//   C5: js — Live: render scene to FBO, then 3 chained post-process passes (brightness, contrast, blur)
//   C6: challenge — Q: You render to a 512×512 texture. The display canvas is 1920×1080. Describe the quality difference.
//   C7: markdown — MRT (Multiple Render Targets): write albedo, normal, position in one pass (G-buffer preview for lesson 5-3)
//   C8: js — MRT demo: 3 attachment textures displayed side by side (G-buffer teaser)
//   C9: challenge — Q: Post-process blur at screen resolution is expensive. How would you optimise it? (downscale → blur → upscale)
// THREE.JS PARALLEL:
//   new THREE.WebGLRenderTarget(w, h)
//   renderer.setRenderTarget(target) → renderer.render(scene, cam)
//   renderer.setRenderTarget(null)   → back to screen
//   EffectComposer (three/examples) — chains multiple post-processes
//   THREE.ShaderPass(shader) — custom post-process in EffectComposer chain

// LESSON 4-4: Cubemaps & Skyboxes
// CONCEPT: A cubemap is 6 textures arranged as a cube face — one per direction (±X, ±Y, ±Z).
//   Looking up a direction in a cubemap gives sky colour, environment reflections, or
//   surrounding scene illumination (Image-Based Lighting, IBL).
// HISTORY:
//   - 1976: Blinn & Newell propose environment mapping (sphere map approach)
//   - 1986: Greene proposes cubic environment mapping (the cubemap we use today)
//   - 1999: Hardware cube map support in GeForce256 and ATI Radeon
//   - 2012: IBL (Image-Based Lighting) using cubemaps revolutionises PBR materials
// MATHEMATICS:
//   Cubemap lookup: textureCube(samplerCube, direction_vec3)
//                   direction doesn't need normalisation — only direction matters, not magnitude
//   Skybox trick: the sky mesh must render AFTER opaques, with depth test set to LEQUAL at z=1.
//                 Vertex shader: gl_Position = (proj * view * pos).xyww  [force z=w → z/w=1]
//   Environment reflection:
//     R = reflect(normalize(fragPos - cameraPos), N)
//     colour = textureCube(envMap, R)
//   Refraction: T = refract(I, N, ratio)  ratio = n1/n2  (Snell's law)
// CELL PLAN (9 cells):
//   C1: markdown — Cubemap: 6-sided texture, sampled by direction vector
//   C2: js — "Cubemap Unfolded" diagram: shows the 6 faces, demonstrates direction → face mapping
//   C3: challenge — Q: Direction (0, 1, 0) samples which face of the cubemap?
//   C4: markdown — Skybox rendering trick: depth write disabled, force z=1 via xyww trick
//   C5: js — Interactive skybox: HDRI panorama in a Three.js scene with orbit camera
//   C6: challenge — Q: Why does the skybox vertex shader write pos.xyww instead of pos.xyzw?
//   C7: markdown — Reflections using environment map: reflect() GLSL function
//   C8: js — Reflection explorer: metallic sphere sampling the environment. Roughness slider blurs reflections.
//   C9: challenge — Q: You replace reflect() with refract(I, N, 0.9). In physics, what ior does this approximate?
// THREE.JS PARALLEL:
//   new THREE.CubeTextureLoader().load([px,nx,py,ny,pz,nz])
//   scene.background = cubeTexture                   — skybox
//   scene.environment = pmremTexture                 — IBL (RGBELoader + PMREMGenerator)
//   MeshStandardMaterial auto-uses scene.environment for IBL reflections

// ─── Chapter 5: Advanced Techniques ──────────────────────────────────────────

// LESSON 5-0: Shadow Mapping
// CONCEPT: Shadow mapping is a two-pass technique: first render the scene from the
//   light's point of view to get a depth map; second render the scene from the camera
//   and compare each fragment's depth against the shadow map.
// HISTORY: Frank Williams (1978) invented shadow maps at Lucasfilm.
//   "A Cached and Warped Shadow Map" — still the foundational algorithm.
//   PCF (1987), SSM (1997), VSM (2006), PCSS (2007): progressively softer shadows.
// MATHEMATICS:
//   Pass 1 (shadow map): render from light. Store depth in a depth texture.
//   Pass 2 (shading):
//     fragPosLightSpace = lightSpaceMatrix * fragPos
//     projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w  (NDC)
//     shadowUV = projCoords.xy * 0.5 + 0.5                     (0→1 range)
//     closestDepth = texture(shadowMap, shadowUV).r
//     currentDepth = projCoords.z
//     shadow = currentDepth - bias > closestDepth ? 0.0 : 1.0
//   Bias prevents "shadow acne": self-shadowing due to depth precision limits.
//   PCF (Percentage Closer Filtering): average multiple shadow map samples for soft edges.
// CELL PLAN (9 cells):
//   C1: markdown — The two-pass algorithm: light camera → depth map → compare
//   C2: js — "Shadow Pass Visualiser": shows the depth texture from the light's perspective
//   C3: challenge — Q: Shadow acne: the surface shadows itself. What causes it and how is bias applied?
//   C4: markdown — Light space matrix: orthographic for directional light, perspective for spot/point
//   C5: js — Live: directional shadow with bias slider. Show acne vs peter-panning trade-off.
//   C6: challenge — Q: You increase shadow bias too much. What artefact appears?
//   C7: markdown — PCF: softening shadows by sampling a kernel of shadow map texels
//   C8: js — Shadow softness slider: PCF kernel 1×1 (hard) vs 5×5 (soft) vs 9×9 (very soft)
//   C9: challenge — Q: A point light casts shadows in all directions. How many shadow maps do you need?
// THREE.JS PARALLEL:
//   light.castShadow = true
//   mesh.castShadow = true / mesh.receiveShadow = true
//   renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap
//   light.shadow.mapSize.set(2048, 2048)  — shadow map resolution
//   light.shadow.bias = -0.0005           — bias tuning
//   light.shadow.camera.near/far          — shadow frustum

// LESSON 5-1: Normal Mapping
// CONCEPT: Normal mapping stores per-pixel surface normals in a texture.
//   Instead of needing hundreds of thousands of geometry triangles to express
//   surface detail, you paint the normals onto a low-poly mesh. The lighting
//   responds as if the surface has the full detail.
// HISTORY: James Blinn (1978) invented bump mapping (then height-based).
//   Normal mapping (tangent-space normals) was popularised by Quake III Arena (1999)
//   via John Carmack's work. It is now the standard in all real-time rendering.
// MATHEMATICS:
//   Normal map RGB → direction in tangent space:
//     N_tangent = normalize(texture(normalMap, vUv).rgb * 2.0 - 1.0)
//     (maps [0,1] RGB back to [-1,1] direction)
//   TBN matrix: built from tangent, bitangent, normal attributes:
//     TBN = mat3(T, B, N)
//   Transform normal to world space:
//     N_world = normalize(TBN * N_tangent)
//   Flat (128,128,255) in the normal map = (0,0,1) in tangent space = no perturbation.
// CELL PLAN (9 cells):
//   C1: markdown — The problem: 100K polygon head vs. 500 polygon head + normal map
//   C2: js — Side-by-side: high-poly vs low-poly + normal map highlight comparison
//   C3: challenge — Q: A normal map texel is (128, 128, 255). What surface normal does this encode?
//   C4: markdown — The TBN matrix: deriving T and B from geometry + UV gradient
//   C5: js — TBN visualiser on a flat quad: show how T, B, N axes sit on the surface
//   C6: challenge — Q: You forget to load the normal map. What do you see? (flat Phong shading)
//   C7: markdown — Baking normal maps: the high-poly → low-poly workflow in Blender/Substance
//   C8: js — Normal map intensity slider: lerp between flat normal and full bumpiness
//   C9: challenge — Q: Normal mapping changes normals but not geometry. What visual effect does it fail to produce? (silhouette)
// THREE.JS PARALLEL:
//   material.normalMap = normalTexture
//   material.normalScale = new THREE.Vector2(1, 1) — intensity control
//   Three.js computes TBN if geometry has uv + tangent attributes
//   geometry.computeTangents()  — auto-computes tangent attribute

// LESSON 5-2: HDR & Bloom
// CONCEPT: Real light exists in values far exceeding the [0,1] range of an 8-bit display.
//   HDR rendering captures the full range internally, then applies tone mapping to
//   compress the scene luminance to the display's output range. Bloom is the optical
//   phenomenon where bright light "bleeds" into surrounding pixels.
// HISTORY:
//   - 1984: Reinhard et al. study human visual system dynamic range adaptation
//   - 2002: Reinhard tone mapping operator published — simple, effective
//   - 2004: Half-Life 2 popularises HDR in games with eye adaptation
//   - 2010: ACES (Academy Color Encoding System) developed for film production
//   - 2018: ACES film tone map becomes the default in Unreal Engine 4.15
// MATHEMATICS:
//   Reinhard tone mapping: L_mapped = L / (1 + L)
//   Extended Reinhard: L_mapped = L * (1 + L/L_white²) / (1 + L)
//   ACES approximation (Unreal): (L*(2.51L+0.03)) / (L*(2.43L+0.59)+0.14)
//   Exposure: L_exposed = L * 2^EV  [EV = exposure value, each +1 = doubles brightness]
//   Bloom: extract bright pixels (threshold) → blur → add back to scene
//     Bloom = blur(max(scene - threshold, 0))
//     Final = tonemap(scene + bloom_intensity * Bloom)
// CELL PLAN (9 cells):
//   C1: markdown — The problem: real light is unbounded. Display is [0,1]. What do we do?
//   C2: js — "Linear vs HDR": two identical scenes, one with clamping [0,1], one with tone-map
//   C3: challenge — Q: A bright light source at value 5.0. Without tone mapping: (1,1,1) white blown out. With Reinhard: what value?
//   C4: markdown — Tone mapping operators: Reinhard, ACES, Filmic. Trade-offs.
//   C5: js — Tone mapper comparator: Reinhard vs ACES vs Filmic on an HDR scene. Dropdown + slider for exposure.
//   C6: challenge — Q: You set exposure to +3 EV. The scene is 8× brighter internally. Describe the visual effect.
//   C7: markdown — Bloom: the optical effect, the two-pass algorithm (threshold → blur → composite)
//   C8: js — Bloom explorer: threshold slider + intensity slider on a scene with bright lights
//   C9: challenge — Q: Why is bloom applied BEFORE tone mapping in the correct order?
// THREE.JS PARALLEL:
//   renderer.toneMapping = THREE.ACESFilmicToneMapping
//   renderer.toneMappingExposure = 1.0
//   new THREE.UnrealBloomPass(resolution, strength, radius, threshold)
//   EffectComposer with BloomPass — TWO render passes
//   renderer.outputColorSpace = THREE.SRGBColorSpace — final gamma encoding

// LESSON 5-3: Deferred Rendering
// CONCEPT: In deferred rendering, geometry data (position, normal, albedo, material)
//   is rendered into a G-buffer in a first pass. Lighting is computed in a second pass
//   that reads from the G-buffer — decoupling scene complexity from lighting complexity.
// HISTORY:
//   - 1988: Early deferred shading concept in academic papers
//   - 2004: Stalker (Crytek) — first major commercial use of deferred shading
//   - 2007: Killzone 2 deferred lighting paper at GDC — popularised the technique
//   - Today: Almost every AAA game uses deferred or hybrid deferred+forward rendering
// MATHEMATICS:
//   Pass 1 (G-buffer): write to 3 or 4 render targets simultaneously:
//     RT0: albedo.rgb + roughness.a      (RGBA8)
//     RT1: normal.rgb encoded + metalness.a (RGBA16F)
//     RT2: position.xyz (or reconstruct from depth)  (RGB32F or depth)
//   Pass 2 (lighting): for each light, read G-buffer textures:
//     albedo = texture(gAlbedo, texCoord)
//     normal = decodeNormal(texture(gNormal, texCoord))
//     position = texture(gPosition, texCoord) or reproject from depth
//     Apply Phong/PBR lighting equation using these values.
//   Cost: O(geometry) for G-buffer pass + O(lights × screenPixels) for lighting pass
//   vs Forward: O(geometry × lights) — deferred wins when lights >> 1.
// CELL PLAN (9 cells):
//   C1: markdown — Forward vs deferred: the scalability problem with many lights
//   C2: js — "Forward vs Deferred Cost Calculator": slider for light count, shows ops per frame
//   C3: challenge — Q: 100 lights, 1M visible fragments. Forward: 100M lighting ops. Deferred: ? (depends on screen coverage of light volumes)
//   C4: markdown — G-buffer layout: what data to store, what precision needed (RGB8 vs RGB16F)
//   C5: js — G-buffer viewer: a Three.js scene with 4 RT textures shown simultaneously (albedo/normal/position/depth)
//   C6: challenge — Q: You store position in RGB32F (12 bytes/pixel). Alternative: reconstruct from depth buffer. What's the advantage of reconstruction?
//   C7: markdown — Deferred trade-offs: MSAA is hard, transparency is hard, memory cost
//   C8: js — Transparent object handling in deferred: forward+ technique preview
//   C9: challenge — Q: Deferred rendering cannot use hardware MSAA directly. Why not, and what are common alternatives?
// THREE.JS PARALLEL:
//   WebGLMultipleRenderTargets — write to multiple colour buffers   
//   renderer.setRenderTarget(mrt) with attachments array
//   Custom G-buffer material: gl_FragData[0], gl_FragData[1]... in GLSL
//   Three.js has no built-in deferred path — this is custom shader territory

// LESSON 5-4: PBR — Physically Based Rendering
// CONCEPT: PBR replaces Phong's ad-hoc parameters with physically-grounded
//   metalness and roughness values that produce consistent, correct appearances
//   under all lighting conditions — including environment lighting.
// HISTORY:
//   - 1982: Cook-Torrance microfacet BRDF published
//   - 2012: Disney's "Physically Based Shading at Disney" (SIGGRAPH 2012) — the paper that changed the industry
//   - 2013: Epic Games' "Real Shading in Unreal Engine 4" implements GGX + Smith + Schlick approximations
//   - 2015: glTF 2.0 standardises metalness-roughness PBR as THE interchange material model
// MATHEMATICS (Cook-Torrance BRDF):
//   Lo(v) = ∫ (kd * c/π + ks * DFG / (4(n·l)(n·v))) * Li(l) * (n·l) dl
//   where:
//     D = GGX Normal Distribution: D(h) = α²/(π((n·h)²(α²-1)+1)²)
//     F = Fresnel (Schlick approx): F(v,h) = F0 + (1-F0)*pow(1 - v·h, 5)
//     G = Smith Geometry/Shadow: G = G1(n·v) * G1(n·l)
//   F0 (reflectance at normal incidence): 0.04 for dielectrics; tinted from albedo for metals
//   metalness = 0 → dielectric (plastic/wood). metalness = 1 → conductor (iron/gold).
//   roughness: α = roughness². GGX distribution widens with α.
// CELL PLAN (9 cells):
//   C1: markdown — Why Phong fails: scene-invariant look, non-physical energy creation
//   C2: js — "Phong vs PBR": same sphere, same light, side-by-side as roughness changes
//   C3: challenge — Q: PBR metalness=0 means dielectric. Fresnel F0=0.04. What does this number mean physically?
//   C4: markdown — The microfacet model: a surface as billions of tiny perfect mirrors
//   C5: js — "GGX Lobe Visualiser": interactive roughness slider showing the NDF distribution shape
//   C6: challenge — Q: Roughness=0 in PBR. What is the GGX NDF shape? (infinitely sharp = perfect mirror)
//   C7: markdown — IBL (Image-Based Lighting): precomputed split-sum from a cubemap environment
//   C8: js — PBR material matrix: 5×5 grid (metalness 0→1 × roughness 0→1) under environment lighting
//   C9: challenge — Q: Gold has coloured Fresnel at normal incidence (F0 ≈ (1.00, 0.71, 0.29)). How does the BRDF use this?
// THREE.JS PARALLEL:
//   MeshStandardMaterial — full Cook-Torrance PBR
//   MeshPhysicalMaterial — adds clearcoat, transmission, sheen, iridescence
//   roughness, metalness, roughnessMap, metalnessMap
//   scene.environment = pmremGenerator.fromEquirectangular(hdrTexture).texture
//   new THREE.RGBELoader().load('env.hdr', ...) — HDRI environment map

// ─── Chapter 6: Engine & Architecture ────────────────────────────────────────

// LESSON 6-0: The Scene Graph
// CONCEPT: A scene graph is a tree (DAG in complex cases) where each node has a
//   local transform. Children inherit their parent's world transform. This elegant
//   structure makes hierarchical objects (arms connected to a body, wheels to a car)
//   trivial to build and animate.
// HISTORY:
//   - 1983: PHIGS (Programmer's Hierarchical Interactive Graphics System) — first standard scene graph
//   - 1988: OpenInventor (SGI) — the first practical scene graph API
//   - 1994: VRML — web-based scene graph (ancestor of glTF scene format)
//   - 2000–present: Every major game engine (Unity, Unreal, Godot) uses hierarchical scene graphs
//   Three.js Object3D is a direct descendant of this 40-year lineage.
// MATHEMATICS:
//   World matrix of a child node = parent.worldMatrix × child.localMatrix
//   And recursively up the tree. For n levels of nesting:
//     worldMatrix_child = M_root × M_level1 × ... × M_child
//   Efficient traversal: multiply matrices during a depth-first walk (O(n) nodes total).
//   Dirty flag optimisation: only recompute world matrices for nodes whose local transforms changed.
// CELL PLAN (9 cells):
//   C1: markdown — The parent-child concept: a hand moves with the arm, the arm with the torso
//   C2: js — "Scene Graph Editor": add/remove nodes, drag to set parent. Watch world positions update.
//   C3: challenge — Q: A cube at local position (1,0,0) inside a parent at world position (3,0,0). What is the cube's world position?
//   C4: markdown — Matrix propagation: depth-first traversal computes world matrices
//   C5: js — "Matrix Propagation Visualiser": tree diagram. Click a node → shows local and world matrix.
//   C6: challenge — Q: You rotate the parent 90°. A child at (1,0,0) local was at (4,0,0) world. Where is it now?
//   C7: markdown — Scene graph uses: hierarchical animation, instancing, grouping, cameras/lights as nodes
//   C8: js — Articulated arm demo: 5-joint arm where each segment's rotation affects all children
//   C9: challenge — Q: How many matrix multiplications are needed to compute world matrices for a flat scene of 1000 objects vs a 10-deep hierarchy of 1000 objects?
// THREE.JS PARALLEL:
//   Object3D — base class for all scene graph nodes
//   group.add(mesh) — parent-child relationship
//   object.position / rotation / scale — local transform
//   object.matrixWorld — world transform (updated via updateMatrixWorld())
//   scene.traverse(fn) — depth-first traversal
//   object.parent / object.children — tree navigation

// LESSON 6-1: ECS vs OOP Architecture
// CONCEPT: Two dominant paradigms for organising game/3D app code:
//   OOP (Object-Oriented): Objects have both data AND behaviour. Inheritance hierarchies.
//   ECS (Entity-Component-System): Entities are just IDs. Components are pure data.
//   Systems process arrays of components. Cache-friendly, composable, testable.
// HISTORY: ECS introduced in Dungeon Siege (2002) by Scott Bilas. Popularised by Unity's DOTS (2018).
//   The Archetypal ECS (used by Unreal, Unity DOTS, Bevy) is the modern consensus approach.
// MATHEMATICS: None specific (architectural pattern). But ECS gets cache performance wins
//   through Structure of Arrays (SoA) layout:
//   OOP layout:  [x,y,z,mass,health,team] [x,y,z,mass,health,team] ...
//   SoA layout:  [x,x,x...] [y,y,y...] [z,z,z...] [mass,mass...] ...
//   SoA: when a system only needs x,y,z (physics), it reads a contiguous array → cache line is full.
//   OOP: physics skips mass, health, team per object → cache inefficient for single-type access.
// CELL PLAN (9 cells):
//   C1: markdown — OOP inheritance hell: BaseObject → MovableObject → AnimatedObject → Character
//   C2: js — "Inheritance Diamond Problem" visualiser: a problem that OOP can't solve cleanly
//   C3: challenge — Q: You need an object that can fly AND swim but NOT both from the same base class. Which paradigm handles this better?
//   C4: markdown — ECS: Entity = ID. Component = data struct. System = function over matching entities.
//   C5: js — "ECS Simulator": add/remove components from entities. Watch systems react.
//   C6: challenge — Q: A "Render System" processes all entities with Position + Mesh + Material. 300 entities match. What is the Systems loop?
//   C7: markdown — Cache performance: why SoA beats AoS for component iteration
//   C8: js — "Cache Line Visualiser": animated CPU cache line loading for AoS vs SoA
//   C9: challenge — Q: Three.js uses an OOP scene graph. For 10,000 animated objects, what performance issue will eventually emerge?
// THREE.JS PARALLEL:
//   Three.js = OOP scene graph (Object3D hierarchy)
//   For performance at scale: InstancedMesh + custom update loop (bypasses scene graph)
//   THREE.InstancedMesh(geo, mat, 10000) — 10,000 objects, one draw call
//   setMatrixAt(i, matrix) — update individual instance transforms

// LESSON 6-2: Resource Management
// CONCEPT: GPU resources (textures, buffers, shaders) must be explicitly allocated
//   and deallocated. Forgetting to dispose causes memory leaks. Loading the same
//   asset twice wastes memory. Caching and lazy loading are essential patterns.
// HISTORY: GPU memory leaks became critical as texture resolutions grew:
//   2001: 256MB GPU → 2010: 1GB → 2024: 24GB+. Resource management maturity followed.
//   Three.js added dispose() calls in r100 (2018) and ResourceTracker patterns emerged.
// MATHEMATICS:
//   GPU memory budget: 8K texture = 8192² × 4 bytes (RGBA) = 256MB. For one texture!
//   MIP memory overhead: level 0 + 1/4 + 1/16 + ... = 4/3 × original size (33% more)
//   Texture compression (DXT, ASTC): 4–8× reduction, hardware decompression at no cost
// CELL PLAN (9 cells):
//   C1: markdown — GPU memory is finite. What gets allocated (buffers, textures, render targets, shaders).
//   C2: js — "Memory Leak Simulator": load → create → no dispose → repeat → show growing memory counter
//   C3: challenge — Q: You create a texture in a render loop every frame. What happens over 10 minutes?
//   C4: markdown — Three.js dispose() pattern: geometry.dispose(), material.dispose(), texture.dispose()
//   C5: js — "Dispose Clinic": a test scene with a "before" (leaking) and "after" (disposing) version. Show renderer.info.memory.
//   C6: challenge — Q: You load the same texture at two paths. Three.js creates two copies. How would you fix this?
//   C7: markdown — Asset caching / registry pattern: reference counting, lazy loading, hot unloading
//   C8: js — "Cache System": a simple key→asset map with reference counting and automatic disposal
//   C9: challenge — Q: A level has 50 unique textures. You unload 30 objects that used those textures. How do you know which textures can now be freed?
// THREE.JS PARALLEL:
//   geometry.dispose(), material.dispose(), texture.dispose()
//   renderer.dispose()
//   renderer.info.memory.geometries, .textures — live memory stats
//   renderer.info.render.triangles, .calls — draw call stats
//   new THREE.LoadingManager() — tracks all load completion for progress UI

// LESSON 6-3: Render Pipeline Abstraction
// CONCEPT: As a project grows, the render loop becomes unmanageable (300 lines of:
//   bind this, set that, render, restore state). A render pass system abstracts the
//   "what gets rendered with what state in what order" into composable pass objects.
// HISTORY: RenderMan (1988) introduced ordered rendering with shading networks.
//   Halo 3 (2007) popularised explicit render pass systems in console games.
//   Vulkan (2016) and WebGPU (2023) bake render passes into the API itself.
// MATHEMATICS: None core — this is software architecture. But render order matters:
//   Rough order: clear → opaque front-to-back (early-z) → skybox → transparent back-to-front → UI
// CELL PLAN (9 cells):
//   C1: markdown — The problem: the spaghetti render loop and why it fails at scale
//   C2: js — "Render Spaghetti": show a complex 200-line render loop, identify anti-patterns
//   C3: challenge — Q: You add shadow mapping to an existing render loop. Where in the loop order must it go?
//   C4: markdown — Render pass design: each pass = state + draw list + framebuffer target
//   C5: js — "Pass Graph Visualiser": draw boxes for each pass with arrows showing dependencies
//   C6: challenge — Q: Shadow map pass MUST run before the main pass. Bloom pass MUST run after. How do you enforce this ordering?
//   C7: markdown — Scene culling: frustum cull (don't render what camera can't see) + occlusion cull
//   C8: js — "Frustum Culling Demo": top-down view showing frustum cone, objects inside (rendered) vs outside (ghosted)
//   C9: challenge — Q: 10,000 objects, 50 in frustum. Without culling: 10,000 draw calls. With: 50 draw calls. What's the expected fps ratio?
// THREE.JS PARALLEL:
//   EffectComposer — ordered post-process pass chain
//   renderOrder property — controls draw order within Three.js
//   layers — visibility masking per camera
//   Frustum culling: built-in (object.frustumCulled = true, default)
//   Custom pass: THREE.Pass subclass with .render(renderer, writeBuffer, readBuffer) method

// LESSON 6-4: Debugging & Performance
// CONCEPT: GPU debugging is hard — no exceptions, no stack traces, silent wrong outputs.
//   This lesson teaches systematic debugging methodology: isolate, visualise, measure,
//   then act. Also covers GPU profiling and common performance bottlenecks.
// HISTORY:
//   - 2011: RenderDoc released — the first widely-used GPU frame debugger
//   - 2012: Spector.js browser WebGL inspector (based on WebGL Inspector 2011)
//   - 2014: Chrome/Firefox DevTools add WebGL context inspection
//   - 2022: WebGPU timestamp queries enable precise GPU timing in browsers
// MATHEMATICS: Performance budgets:
//   At 60fps: 16.67ms per frame.
//   At 30fps: 33.33ms per frame.
//   Typical budget breakdown: game logic 2ms, draw calls 4ms, GPU render 10ms, ~0.67ms slack
//   Draw call cost: each gl.draw* call = CPU overhead. ~500µs on CPU each. Batch to reduce.
// CELL PLAN (9 cells):
//   C1: markdown — The GPU debugger's toolbox: Spector.js, RenderDoc, Chrome DevTools
//   C2: js — "Debug Output Technique": output normals as colour, output UVs as colour, output depth as grey
//   C3: challenge — Q: Your scene renders black. List 5 things to check in order of likelihood.
//   C4: markdown — Performance profiling: renderer.info, frame time budget, draw call analysis
//   C5: js — "Performance Dashboard": live renderer.info display + frame time meter + draw call counter
//   C6: challenge — Q: Your scene has 10,000 meshes each with a unique material. What is the primary performance bottleneck?
//   C7: markdown — Common GPU bottlenecks: vertex throughput, fragment throughput, memory bandwidth, draw call CPU overhead
//   C8: js — "Bottleneck Identifier": toggle between overdraw visualisation, wireframe, shader complexity heatmap
//   C9: challenge — Q: Reducing a fragment shader from 200 instructions to 100 instructions doubles its speed. But the scene fps doesn't change. What is the bottleneck?
// THREE.JS PARALLEL:
//   renderer.info.render.calls — draw call count
//   renderer.info.memory.geometries / .textures — GPU object count
//   stats.js — fps + ms + mb overlay (external library)
//   material.wireframe = true — debug geometry
//   renderer.setSize(width/2, height/2) — temporary half-res for GPU budget check

// ─── Now export each lesson ───────────────────────────────────────────────────

const makeComingSoon = (lessonNum, title, subtitle, teaser) => ({
  title,
  subtitle,
  sequential: true,
  cells: [{
    type: 'markdown',
    instruction: `## 🚧 Coming Soon — Lesson ${lessonNum}\n\n### ${title}\n*${subtitle}*\n\n---\n\n${teaser}`,
  }],
});

export const LESSON_3JS_2_1 = makeComingSoon('2-1', 'Multiple Textures & Blending', 'Combining diffuse, roughness, metalness maps — and the blend modes that power every visual effect.',
`**🎯 What you'll master:** mixing multiple texture samplers, the Porter-Duff alpha compositing equation, additive blending for particles, transparent cutout vs alpha blend trade-offs.\n\n**🔬 Interactive:** Four-layer material builder (colour + roughness + AO + emissive), live blend mode explorer, animated texture mixer.\n\n**⚡ Three.js:** material.map, roughnessMap, metalnessMap, aoMap, emissiveMap — and the sampler2D uniform pattern for custom multi-texture shaders.`);

export const LESSON_3JS_2_2 = makeComingSoon('2-2', 'Coordinate Systems Deep Dive', 'Which space your data lives in — and why confusing them causes the most common shader bugs.',
`**🎯 What you'll master:** the normal matrix (inverse-transpose) derivation, why normalMatrix not modelMatrix transforms normals, tangent space TBN matrix for normal maps.\n\n**🔬 Interactive:** Space comparator showing normals in object/world/view space; non-uniform scale that breaks naive normal transformation live.\n\n**⚡ Three.js:** normalMatrix built-in uniform, matrixWorld, matrixWorldInverse — Three.js provides all of these to your ShaderMaterial automatically.`);

export const LESSON_3JS_2_3 = makeComingSoon('2-3', 'Camera System — FPS Camera', 'From mouse delta to a view matrix: the mathematics of yaw, pitch, and look direction.',
`**🎯 What you'll master:** polar-to-Cartesian camera direction, yaw/pitch construction, why pitch must be clamped to ±89°, strafe direction via cross product.\n\n**🔬 Interactive:** FPS camera demo with click-to-lock pointer lock, WASD walking, orbit vs FPS camera mode toggle.\n\n**⚡ Three.js:** PointerLockControls, OrbitControls, camera.lookAt(), camera.rotation.order = 'YXZ' for correct FPS Euler order.`);

export const LESSON_3JS_2_4 = makeComingSoon('2-4', 'Colors, Materials & Phong Preview', 'sRGB vs linear colour, gamma correction, and the Phong model — the bridge to Chapter 3 lighting.',
`**🎯 What you'll master:** why texture images must be decoded from sRGB before lighting, the Phong equation (ambient + diffuse + specular), how shininess controls the specular lobe size.\n\n**🔬 Interactive:** gamma comparison on the same scene with/without correction, Phong material sliders (Ka, Kd, Ks, shininess) on a lit sphere.\n\n**⚡ Three.js:** renderer.outputColorSpace, texture.colorSpace, MeshPhongMaterial({ shininess, specular }).`);

export const LESSON_3JS_3_0 = makeComingSoon('3-0', 'The Lighting Equation', 'Building the Phong equation piece by piece until the 3D scene comes alive.',
`**🎯 What you'll master:** each Phong term added progressively (ambient → diffuse → specular), Gouraud vs Phong shading mode comparison, per-face vs per-vertex normals.\n\n**🔬 Interactive:** Build-up animation adding each lighting component, shading mode comparator (flat/Gouraud/Phong), light attenuation explorer.\n\n**⚡ Three.js:** AmbientLight, DirectionalLight, MeshPhongMaterial — and writing your own Phong in ShaderMaterial from scratch.`);

export const LESSON_3JS_3_1 = makeComingSoon('3-1', 'Phong & Blinn-Phong Shading', 'Implementing the full lighting equation in GLSL — line by line, term by term.',
`**🎯 What you'll master:** translating the Phong equation into working GLSL, the half-vector Blinn-Phong shortcut, managing multiple lights without branching.\n\n**🔬 Interactive:** Live GLSL shader editor with Phong on a sphere, moveable light source, Blinn vs Phong specular comparison at grazing angles.\n\n**⚡ Three.js:** ShaderMaterial implementing Phong manually to understand what MeshPhongMaterial does automatically.`);

export const LESSON_3JS_3_2 = makeComingSoon('3-2', 'Materials & Surface Properties', 'Ka, Kd, Ks, shininess — the four numbers that define any surface under light.',
`**🎯 What you'll master:** how the four Phong material coefficients map to visual surface types (matte, plastic, metal), energy conservation violation in Phong, PBR as the principled solution.\n\n**🔬 Interactive:** Material preset gallery (wood/plastic/chrome), shininess slider showing specular lobe width, Phong vs PBR side-by-side preview.\n\n**⚡ Three.js:** MeshPhongMaterial → MeshStandardMaterial as the evolutionary path from Phong to PBR.`);

export const LESSON_3JS_3_3 = makeComingSoon('3-3', 'Directional, Point & Spot Lights', 'The three light archetypes, their geometry, attenuation math, and performance cost.',
`**🎯 What you'll master:** how each light type computes the L (light direction) vector differently, inverse-square attenuation vs game-style polynomial attenuation, spot light cone angle formula using cosine.\n\n**🔬 Interactive:** Three light types independently togglable in a live scene, attenuation curve explorer, spot angle (inner/outer) soft-edge demo.\n\n**⚡ Three.js:** DirectionalLight, PointLight(intensity, distance, decay), SpotLight(angle, penumbra).`);

export const LESSON_3JS_4_0 = makeComingSoon('4-0', 'Model Loading — glTF & OBJ', 'Loading external 3D models and understanding the modern "JPEG of 3D": glTF 2.0.',
`**🎯 What you'll master:** glTF 2.0 format (JSON + binary buffer), GLTFLoader traversal, skeleton/morph target support, LOD (Level of Detail) switching, InstancedMesh for repeated objects.\n\n**🔬 Interactive:** Live Three.js GLTF viewer with scene graph inspector, LOD demo with distance slider, instance count performance comparison.\n\n**⚡ Three.js:** GLTFLoader, gltf.scene.traverse(), THREE.LOD, THREE.InstancedMesh for 1000+ copies in one draw call.`);

export const LESSON_3JS_4_1 = makeComingSoon('4-1', 'Depth Testing & the Z-Buffer', 'How the GPU decides which surface is in front — and the precision tricks to avoid z-fighting.',
`**🎯 What you'll master:** the painter's algorithm (and why it fails), the Z-buffer algorithm, non-linear depth precision distribution, z-fighting causes and remedies (bias, polygon offset, logarithmic depth).\n\n**🔬 Interactive:** Z-fighting demo with proximity slider, depth buffer visualiser (greyscale display), painter's algorithm failure with intersecting geometry.\n\n**⚡ Three.js:** material.depthTest, material.depthWrite, material.depthFunc, camera near/far ratio for precision control.`);

export const LESSON_3JS_4_2 = makeComingSoon('4-2', 'Blending & Transparency', 'The Porter-Duff compositing operators — and why sorting order determines visual correctness.',
`**🎯 What you'll master:** the alpha blend equation (SRC_ALPHA, ONE_MINUS_SRC_ALPHA), additive blending for particles/glow, why transparent objects must be drawn back-to-front, premultiplied alpha.\n\n**🔬 Interactive:** Blend mode explorer (normal/additive/multiply/screen), transparent sorting demo (correct vs wrong order), premultiplied vs straight alpha comparison.\n\n**⚡ Three.js:** material.transparent, material.opacity, material.blending, material.depthWrite=false, renderOrder.`);

export const LESSON_3JS_4_3 = makeComingSoon('4-3', 'Framebuffers & Render Targets', 'Render to texture — the foundation of every post-processing effect in real-time graphics.',
`**🎯 What you'll master:** FBO (Framebuffer Object) setup, off-screen rendering, chained post-process passes, screen-space UV reconstruction, Gaussian blur implementation.\n\n**🔬 Interactive:** Three-pass post-process chain (render → brightness → blur → display), G-buffer preview with 4 colour attachments, downsample-blur-upscale optimisation demo.\n\n**⚡ Three.js:** WebGLRenderTarget, EffectComposer, ShaderPass for custom post-processing.`);

export const LESSON_3JS_4_4 = makeComingSoon('4-4', 'Cubemaps & Skyboxes', 'The six-faced texture that captures the entire horizon — and powers reflections and IBL.',
`**🎯 What you'll master:** cubemap direction → face → texel lookup, skybox depth trick (gl_Position.xyww), environment reflections via GLSL reflect(), refraction via refract() and Snell's Law.\n\n**🔬 Interactive:** Cubemap face diagram with direction→face mapping, interactive skybox with orbit camera, metallic sphere reflection slider (roughness blurs reflections).\n\n**⚡ Three.js:** CubeTextureLoader, scene.background, scene.environment (IBL), PMREMGenerator for pre-filtered cubemaps.`);

export const LESSON_3JS_5_0 = makeComingSoon('5-0', 'Shadow Mapping', 'Render from the light. Compare depths. The 1978 algorithm still powering all real-time shadows.',
`**🎯 What you'll master:** two-pass algorithm (light camera → depth texture → compare), shadow bias (prevents acne vs introduces peter-panning), PCF soft shadows, cascaded shadow maps for directional lights.\n\n**🔬 Interactive:** Live shadow with bias slider (watch acne vs peter-pan), depth texture visualiser from light's view, PCF kernel size → shadow softness comparison.\n\n**⚡ Three.js:** light.castShadow, shadow.mapSize, shadow.bias, THREE.PCFSoftShadowMap.`);

export const LESSON_3JS_5_1 = makeComingSoon('5-1', 'Normal Mapping', 'Per-pixel surface detail without extra geometry — Quake III\'s secret that changed game graphics forever.',
`**🎯 What you'll master:** tangent-space normal maps (RGB → direction decoding), TBN matrix construction (tangent, bitangent computed from UV gradient), baking workflow from high-poly to low-poly mesh.\n\n**🔬 Interactive:** High-poly vs low-poly + normal map comparison with rotating light, TBN axes visualiser on a flat quad, baking workflow diagram.\n\n**⚡ Three.js:** material.normalMap, material.normalScale, geometry.computeTangents() for the tangent attribute.`);

export const LESSON_3JS_5_2 = makeComingSoon('5-2', 'HDR & Bloom', 'Beyond [0,1]: capturing the full luminance range of the real world and tone-mapping it to screen.',
`**🎯 What you'll master:** why lights need values > 1.0, Reinhard and ACES tone mapping operators, exposure value (EV), the bloom algorithm (threshold → Gaussian blur → composite), correct ordering.\n\n**🔬 Interactive:** Reinhard vs ACES vs Filmic tone mapper comparison, exposure slider (+/- EV), bloom threshold + intensity + radius sliders on a scene with bright lights.\n\n**⚡ Three.js:** renderer.toneMapping = ACES, renderer.toneMappingExposure, UnrealBloomPass, EffectComposer.`);

export const LESSON_3JS_5_3 = makeComingSoon('5-3', 'Deferred Rendering', 'Decouple geometry rendering from lighting — scale to 100+ lights with no per-object cost.',
`**🎯 What you'll master:** G-buffer (albedo + normal + position rendered to 3 colour targets), deferred lighting pass (one light = one screen-space quad or sphere), forward vs deferred performance scaling.\n\n**🔬 Interactive:** G-buffer viewer (4 RTs simultaneously), forward vs deferred cost calculator (light count slider), light volume visualiser.\n\n**⚡ Three.js:** WebGLMultipleRenderTargets, custom G-buffer material, custom lighting pass — this is fully custom shader territory.`);

export const LESSON_3JS_5_4 = makeComingSoon('5-4', 'PBR — Physically Based Rendering', 'The Cook-Torrance BRDF: metalness, roughness, and Fresnel — the 2012 revolution that unified game and film rendering.',
`**🎯 What you'll master:** the microfacet BRDF (GGX distribution, Smith geometry term, Schlick Fresnel), metalness workflow vs specular workflow, IBL (split-sum approximation for environment lighting).\n\n**🔬 Interactive:** 5×5 metalness×roughness material sphere grid under IBL, GGX lobe visualiser, HDRI environment loader with sky/ground separation.\n\n**⚡ Three.js:** MeshStandardMaterial (full PBR), MeshPhysicalMaterial (clearcoat, transmission), RGBELoader + PMREMGenerator for IBL.`);

export const LESSON_3JS_6_0 = makeComingSoon('6-0', 'The Scene Graph', 'The 40-year data structure at the heart of every 3D engine: the hierarchical transform tree.',
`**🎯 What you'll master:** parent-child world matrix propagation, depth-first traversal, dirty flag optimisation, scene graph vs entity-component-system trade-offs.\n\n**🔬 Interactive:** Visual tree editor (add/remove/reparent nodes), matrix propagation visualiser, articulated 5-joint arm demo.\n\n**⚡ Three.js:** Object3D.add(), traverse(), matrixWorld, updateMatrixWorld(), position/rotation/scale as local transform.`);

export const LESSON_3JS_6_1 = makeComingSoon('6-1', 'ECS vs OOP Architecture', 'The two paradigms for organising a 3D application — and why cache layout determines which wins at scale.',
`**🎯 What you'll master:** OOP composition/inheritance trade-offs, ECS (entity = ID, component = data, system = function over components), Structure of Arrays vs Array of Structures memory layout, archetypal ECS queries.\n\n**🔬 Interactive:** Inheritance diamond problem demo, ECS component editor (add/remove components, watch system reactions), cache line visualiser (AoS vs SoA access pattern).\n\n**⚡ Three.js:** InstancedMesh for ECS-style rendering of thousands of objects in a single draw call.`);

export const LESSON_3JS_6_2 = makeComingSoon('6-2', 'Resource Management', 'Allocate once, share everywhere, dispose when done — avoiding the GPU memory leak that grows until your tab crashes.',
`**🎯 What you'll master:** what the GPU allocates (buffers, textures, shaders, framebuffers), dispose() patterns, asset caching with reference counting, texture compression (DXT, ASTC, KTX2).\n\n**🔬 Interactive:** Memory leak simulator (allocate without dispose, watch memory counter grow), dispose clinic showing renderer.info.memory, asset cache reference counter diagram.\n\n**⚡ Three.js:** geometry.dispose(), material.dispose(), texture.dispose(), renderer.info.memory, LoadingManager.`);

export const LESSON_3JS_6_3 = makeComingSoon('6-3', 'Render Pipeline Abstraction', 'From spaghetti render loops to composable render pass systems — architecture that scales.',
`**🎯 What you'll master:** render pass abstraction (state + draw list + target + dependencies), correct render ordering (shadow → opaque front-to-back → skybox → transparent → UI), frustum culling implementation.\n\n**🔬 Interactive:** Pass dependency graph builder (boxes + arrows), frustum culling demo (top-down view, objects outside frustum greyed out), render order visualiser.\n\n**⚡ Three.js:** EffectComposer render pass chain, renderOrder, layers, frustumCulled — and writing a custom THREE.Pass.`);

export const LESSON_3JS_6_4 = makeComingSoon('6-4', 'Debugging & Performance', 'GPU debugging methodology, performance profiling, and the techniques to find and fix every category of rendering bug.',
`**🎯 What you'll master:** systematic debug methodology (normals-as-colour, UV-as-colour, depth visualisation), reading renderer.info, identifying bottlenecks (CPU draw-call overhead, fragment ALU, memory bandwidth), overdraw visualisation.\n\n**🔬 Interactive:** Debug visualisation mode switcher (normals/UVs/depth/overdraw), performance dashboard with live renderer.info, draw call cost simulator.\n\n**⚡ Three.js:** renderer.info.render, material.wireframe, stats.js integration, Spector.js for WebGL frame capture.`);
