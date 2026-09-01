# Curriculum: Three.js / D3 Machining Viewer Masterclass

A roadmap, not a lesson — this file is a planning document and is not
written under the lesson schema's own rules (no Concept Units, no CRC
breakdowns here). It exists so lesson sequencing and prerequisites stay
consistent across sessions. See `HANDOFF.md` for project state and
conventions.

**Where this is headed:** a real app that loads *your* exported models
(from the `diff3d`-style script you shared), animates through a
machining sequence, toggles stock/fixtures, shows the real transform
matrices behind each operation, and draws a custom gnomon — plus a D3
panel for the statistics your Python script already computes.

Modules are ordered so nothing is used before it's taught. Lesson
numbers inside a module are provisional — a module may split further
once actually drafted, per the schema's own splitting rules.

---

## Module A — Foundations: getting a real frame on screen

Nothing here is specific to your pipeline yet — this is the vocabulary
everything later depends on.

1. **The Scene, the Camera, the Renderer, and the Render Loop** —
   `THREE.Scene`, `THREE.PerspectiveCamera`, `THREE.WebGLRenderer`,
   `requestAnimationFrame`. Ends with a rotating cube on screen. *(this
   session's deliverable — see `lessons/lesson-01-*.md`)*
2. **Geometry and Material, Not the Same Thing** — `BufferGeometry`
   vs. `Material` vs. `Mesh` as the thing that joins them; why Three.js
   splits shape from appearance instead of one "3D object" class.
3. **Light and Why Nothing Is Visible Without It (Usually)** —
   `AmbientLight`, `DirectionalLight`, and why `MeshBasicMaterial`
   ignores lights entirely while `MeshStandardMaterial` doesn't —
   directly relevant, because your diff colors need to read correctly
   regardless of lighting.
4. **Orbiting a Scene: `OrbitControls`** — camera control as a
   separate, addable behavior, not a built-in camera feature.
5. **Vertex Color, Not Texture Color** — rendering per-vertex color
   data (`vertexColors: true`), the exact feature your
   `save_vertex_colored_obj` function is producing data for.

## Module B — Loading Your Own Models

6. **What an OBJ File Actually Is, Plain-Text and All** — reading the
   format by hand before trusting a loader with it; directly reads a
   real file your script produces.
7. **`OBJLoader` and Its Real Limits** — where Three.js's own loader
   supports vertex color, and where your script's exact convention
   (6-number `v` lines) needs a small custom parse step instead of
   trusting the stock loader blindly.
8. **Loading From the User's Own Disk — `<input type="file">` and
   `FileReader`** — no server, no fixed filename: this is the "upload
   your own models" requirement, taught as its own concept.
9. **Multiple Meshes, One Scene — Groups and Naming** — `THREE.Group`,
   why stock and fixtures need to be separate, addressable objects
   instead of one flattened mesh.

## Module C — Transforms and Matrices (the "parse matrices for
## operations" requirement)

10. **Position, Rotation, Scale — and the Matrix Underneath All Three**
    — `Object3D.position/.rotation/.scale` as a friendly face on a real
    `Matrix4`; `updateMatrix()`, `matrix.elements`.
11. **Local vs. World: `matrixWorld` and the Scene Graph** — why a
    child's real position depends on every parent above it, and how to
    read that chain back out.
12. **Reading a Real Transform Out of a File** — parsing an actual
    4×4 (or 3×4) matrix your CAM/CNC tooling would emit for an
    operation, applying it via `Matrix4.fromArray`/`.decompose`, and
    displaying the decomposed translation/rotation/scale numbers, not
    just applying them silently.
13. **Composing Operations — Matrix Multiplication in Practice** —
    chaining more than one operation's transform, in the correct order,
    and why order changes the result (non-commutativity, shown, not
    just asserted).

## Module D — A Custom Gnomon

14. **Why `THREE.AxesHelper` Isn't the Answer** — what the built-in
    helper actually is (three colored `LineSegments`, nothing more),
    read from its real source, and why that's insufficient for a
    readable orientation indicator (no labels, no depth cue, no
    consistent on-screen size regardless of zoom).
15. **Sprites That Always Face the Camera — Billboarding** —
    `THREE.Sprite`, used for axis labels (X/Y/Z) that stay legible from
    any angle.
16. **A Second, Fixed-Size Viewport-Corner Camera** — rendering the
    gnomon as its own small scene with its own camera, in a corner of
    the canvas, decoupled from the main scene's zoom — the actual
    technique behind every CAD app's corner gnomon.
17. **Assembling the Real Gnomon** — combining Units 14–16 into one
    reusable, addressable object: colored axes, billboarded labels, a
    fixed on-screen size, correct interaction with the main camera's
    orientation.

## Module E — Toggling Stock and Fixtures

18. **Visibility Isn't Deletion — `Object3D.visible`** — toggling
    without destroying and re-loading geometry.
19. **A Real UI, Not `console.log`** — checkboxes wired to your groups
    from Module B; DOM events meeting the render loop.
20. **Per-Stage Toggling** — extending the toggle system to the
    machining-stage sequence itself (show stage 3 only, show stages 1–3
    overlaid, etc.) — sets up Module F's animation directly.

## Module F — Animating Through the Machining Sequence

21. **Discrete Mesh Swapping vs. Interpolated Animation — Which One
    Your Data Actually Wants** — your pipeline exports **discrete**
    stage meshes (`complete1.obj` … `completeN.obj`), not a
    continuously-deforming single mesh with keyframes; this unit makes
    the real case for why mesh-swap-on-a-timer is the correct technique
    here, not `AnimationMixer`, and what `AnimationMixer` is actually
    for instead (so it isn't a mystery, just the wrong tool for this
    particular data shape).
22. **A Timeline: Play, Pause, Scrub, Step** — building real transport
    controls over the discrete stage sequence.
23. **Cross-Fading Between Stages** — opacity-based blending between
    consecutive stage meshes so a scrub doesn't pop harshly, using
    `Material.opacity` and `transparent`.

## Module G — D3 for the Statistics Panel

24. **Why D3 Here and Three.js Nowhere Near It** — SVG/DOM-based 2D
    data visualization as a genuinely different rendering model from
    WebGL, and why that's the right split rather than trying to draw
    charts in the 3D scene.
25. **A Real Histogram of Point-to-Surface Distance** — the exact
    numbers your Python script already computes
    (`abs_dist`, percentiles) turned into a D3 histogram in the browser
    from a JSON export of that same data.
26. **Linking Selection Between the 3D View and the D3 Panel** —
    clicking a bar in the histogram highlights the corresponding
    surface region in the 3D scene (raycasting meets a D3 selection).

## Module H — Architecture and Growing Room

27. **Why This App Needs a State Object, Not Scattered Globals** —
    naming the actual state (current stage, visible groups, camera
    mode) once, in one place, before more features make "which
    variable is the source of truth" a real bug.
28. **A Real Loading/Error Story for File Upload** — what happens when
    the user's own `.obj` doesn't parse; not a happy-path-only app.
29. **Where the Next Feature Goes** — a short capstone lesson on the
    app's own architecture as it now stands, so "lots more" has an
    obvious, un-guessed-at place to land.

---

## Sequencing notes

- Module C (matrices) is placed *before* Module D (gnomon) on purpose:
  the gnomon lessons lean on `Object3D`/matrix vocabulary Module C
  establishes, and per the Repetition Rule that vocabulary still gets
  fully re-explained at each reuse — but it reads better taught once,
  cleanly, first.
- Module F (animation) is placed *after* Module E (toggling) because
  the timeline's per-stage step control is a direct extension of the
  toggle system, not a separate mechanism invented from scratch.
- Module G (D3) is deliberately late — it has a real, earned reason to
  exist (your script's own diagnostic output) rather than being
  introduced as a tech-stack checkbox early on.

## Next action

Draft `lessons/lesson-01-scene-camera-renderer.md` in full, under the
schema. Then return here and check off Module A, Lesson 1 before
starting Lesson 2.
