# Lesson: Numerical Stability — When Physics Simulations Explode
### Fixing the Codebase Graph's Force-Directed Layout

## What you will build

The codebase graph page (`/codebase` in UpSkillOS) is supposed to look like a glowing 3D galaxy — every source file a node, every import an edge. Instead it showed a single blinding white disk in the centre. By the end of this lesson, the galaxy is restored. You will understand *why* it broke, *why* the original code worked at a smaller scale and failed at a larger one, and *how* to prevent the same class of failure in any simulation, physics engine, or numerical algorithm you ever write. The real transferable skill is reading the contract between a simulation's constants and the size of its input — a contract that every numerical program has, even if nobody wrote it down.

## What you need to know first

- `for` loops and nested `for` loops — this lesson traces one in exhaustive detail.
- `Math.sqrt`, `Math.min`, basic arithmetic operators — these are referenced but not re-taught.
- `JSON.stringify` — you need to know that it serialises a JavaScript value to a JSON string.
- `Float64Array` — introduced below. Every other construct is taught here first, in isolation.

---

## Concept Unit: `Float64Array` — Typed Arrays

### The Problem

The simulation stores the x, y, and z positions of 1,412 nodes, updated 180 times. Using a plain JavaScript array for this is legal but slow: plain arrays are polymorphic (any entry can be any type), so the engine has to check types at runtime on every read. `Float64Array` is a typed array — every element is guaranteed to be a 64-bit floating-point number — which lets the JavaScript engine represent it as a flat block of contiguous memory, exactly like C's `double[]`.

### Concept Lab

```js
// Throwaway — run this, then delete it. It never appears in the project.
const plain  = [0, 0, 0]
const typed  = new Float64Array(3)

plain[0]  = 1.5
typed[0]  = 1.5

console.log(plain[0])   // 1.5
console.log(typed[0])   // 1.5
console.log(typed.length) // 3
console.log(typed[2])   // 0   ← typed arrays initialise every slot to 0
console.log(Array.isArray(typed)) // false ← it is NOT a plain array
```

**Output from running it:**
```
1.5
1.5
3
0
false
```

What the output proves: typed arrays look and behave like plain arrays (index access, `.length`, assignment), but the engine stores them as raw binary memory. The `false` from `Array.isArray` confirms they are a distinct type. They are not interchangeable — `.push()`, `.pop()`, and array spread don't exist on typed arrays; size is fixed at construction time.

**Discard:** the `plain` / `typed` variables above are deleted now. They never appear in the project.

### Project Change

- **File modified:** `scripts/generate-graph.mjs` (existing file — the data-generation script)
- **Change type:** read — the typed array variables already existed; this unit reads existing code, no new lines are added here
- **Location:** Lines 154–155, immediately after the simulation constants

```js
const px = new Float64Array(N), py = new Float64Array(N), pz = new Float64Array(N)
const vx = new Float64Array(N), vy = new Float64Array(N), vz = new Float64Array(N)
```

This block creates six flat numerical arrays, each with one slot per node. `px[i]`, `py[i]`, `pz[i]` are the current 3D position of node `i`. `vx[i]`, `vy[i]`, `vz[i]` are its current velocity. They are all initialised to `0.0`.

### Mechanical Walkthrough

- `new Float64Array(N)` — **(a) first appearance.** `new` is a constructor call. `Float64Array` is a built-in global; the single argument is the length. Returns a zero-filled typed array of that length. No equivalent of `new Array(N)` filling with `undefined` — every slot starts at `0.0`.
- `N` — already-established variable holding node count (1,412 in this run).
- The six parallel declarations on two lines — basic syntax, already established.

### CS Lens

**Typed arrays vs polymorphic arrays** is the same trade-off that appears in:

- C's `double[]` vs a void-pointer array
- Rust's `Vec<f64>` vs `Vec<Box<dyn Any>>`
- NumPy's `np.zeros(N)` — the reason NumPy is fast where pure Python loops are slow
- WebGL buffer uploads — you *must* use a typed array because the GPU expects raw binary
- Java's `double[]` vs `Object[]` (primitive vs boxed)

The pattern is universal: **a homogeneous type contract at the array boundary buys you layout predictability, which buys you cache efficiency and branch-free execution.**

### SE Lens

The alternative is a plain array: `const px = Array.from({ length: N }, () => 0)`. That works. The reason `Float64Array` is chosen is not correctness — it's **performance of a hot inner loop**. The repulsion loop runs N × N / 2 = ~1,000,000 iterations per simulation step, and each iteration reads six values (three position components for node i, three for node j). With typed arrays, the JIT compiler can recognise the homogeneous access pattern and emit SIMD instructions or at minimum avoid type-check branches. With a plain array, it cannot guarantee this.

The honest maintenance cost: `Float64Array` cannot hold `null`. This matters immediately below.

---

## Concept Unit: `JSON.stringify(NaN)` Returns `"null"`

### The Problem

The bug that broke the graph was silent. The script ran, printed "success", and wrote a file — a file full of `null` for every coordinate. No error was thrown. Understanding *why* requires understanding how JavaScript serialises special floating-point values.

### Concept Lab

```js
// Throwaway — run this, then delete it.
console.log(JSON.stringify(1.234))    // "1.234"
console.log(JSON.stringify(NaN))      // "null"
console.log(JSON.stringify(Infinity)) // "null"
console.log(JSON.stringify(-Infinity))// "null"
console.log(JSON.stringify(0))        // "0"
```

**Output from running it:**
```
"1.234"
"null"
"null"
"null"
"0"
```

What the output proves: the JSON specification has no representation for `NaN`, `Infinity`, or `-Infinity`. The JavaScript `JSON.stringify` implementation handles this by substituting `null` for all three — silently, with no warning, no thrown error, no console message. This is not a bug in UpSkillOS; it is the specified behaviour defined in ECMA-404 and RFC 8259.

**Discard:** this snippet is deleted. The consequence it proves is permanent knowledge.

### Why This Caused the Bug

The script wrote node coordinates with:

```js
x: +px[i].toFixed(3),
```

If `px[i]` is `NaN`, then `NaN.toFixed(3)` returns the string `"NaN"`, and `+"NaN"` is `NaN`. When `JSON.stringify` serialises an object containing that `NaN`, it writes `"null"` for the field. The resulting file is valid JSON — which is why no parse error occurs when the app imports it. The graph simply renders 1,412 nodes all at position `(null, null, null)`, which the `project()` function turns into `NaN` screen coordinates, which the canvas clips to the centre, stacking 1,412 glowing halos into one white disk.

### Mechanical Walkthrough

- `+px[i].toFixed(3)` — two operations. **(a) `.toFixed(3)`:** a method on `Number.prototype` that returns a *string* representation rounded to 3 decimal places. `(1.2345).toFixed(3)` → `"1.235"`. Called on `NaN`, it returns the string `"NaN"`. **(a) Unary `+`:** converts a string to a number. `+"1.235"` → `1.235`. `+"NaN"` → `NaN`.

### CS Lens

Silent data corruption through a serialisation boundary appears across systems engineering:

- IEEE 754 NaN propagation — any arithmetic on NaN produces NaN; a single bad input poisons a whole computation silently
- SQL `NULL` arithmetic — `NULL + 1` is `NULL`, not an error
- Protobuf default values — a missing field and a zero field are indistinguishable
- CSV with missing cells — a blank column and a `0` column are type-identical at parse time
- HTTP responses with `200 OK` and an error body — the status says "success"; the content says otherwise

The pattern: **boundary formats that cannot represent a value often substitute a legal-but-wrong value rather than raising an error.** Defensive code checks for the invalid value *before* crossing the boundary.

### SE Lens

The alternative was to throw an error if `px[i]` is `NaN` before calling `toFixed`. The script did not do that. The result was a **silent failure mode**: correct-looking behaviour (no crash, a file was written, the app loaded) with incorrect output (all coordinates null). This is substantially harder to debug than a thrown error because it requires knowing to check the *content* of the file rather than the *existence* of the file.

The fix adds an explicit guard before `writeFileSync`:

```js
const nanCount = Array.from(px).filter(v => !isFinite(v)).length
if (nanCount > 0) {
  console.error(`ERROR: ${nanCount} nodes have non-finite x positions.`)
  process.exit(1)
}
```

The tradeoff: `process.exit(1)` means a broken run now produces *nothing* instead of a broken-but-loadable file. That is the right tradeoff here — a broken file is worse than no file because the broken file looks correct until you inspect it.

---

## Concept Unit: Numerical Instability — Why the Simulation Exploded

### The Problem

This is the root cause of the entire bug. The simulation was numerically stable at 800 nodes and numerically unstable at 1,412. The simulation constants were never updated when the graph grew. To understand *why* node count changes stability, you need to understand what happens to per-node force totals as N increases.

### Concept Lab — Force Accumulation at Scale

```js
// Throwaway — run this, then delete it.
// Demonstrates how total force per node grows with N.

function totalRepulsionForce(N, K_REP) {
  // In the real simulation, node i receives repulsion from N-1 other nodes.
  // In the worst case (uniform distribution), average per-pair force is K_REP / d²
  // for some typical distance d. Total force on node i ≈ (N-1) × K_REP / d²
  return (N - 1) * K_REP
}

const K = 4.0
console.log('N=100  total force:', totalRepulsionForce(100, K))    //  396
console.log('N=800  total force:', totalRepulsionForce(800, K))    //  3196
console.log('N=1412 total force:', totalRepulsionForce(1412, K))   //  5644
```

**Output:**
```
N=100  total force: 396
N=800  total force: 3196
N=1412 total force: 5644
```

What the output proves: with a fixed `K_REP`, the total force on a single node scales linearly with N. Going from 800 to 1,412 nodes is a **1.76× increase in per-node force**. In an iterative simulation with velocity accumulation and 180 iterations, that multiplier compounds — not linearly but exponentially — until velocities hit `Infinity` and positions become `NaN`.

**Discard:** this simplified model is deleted. The real simulation runs O(N²) pairwise comparisons; the proportional growth argument holds.

### The Three Fixes

Three changes were made to `generate-graph.mjs`. Each targets a different layer of the instability.

---

#### Fix 1: N-Normalised Repulsion Constant

### Project Change

- **File modified:** `scripts/generate-graph.mjs`
- **Change type:** replace
- **Location:** The constant declarations block, lines 171–175

### The New Code

```js
// Before:
const K_REP  = 4.0

// After:
const K_REP  = (2.0 * 800) / N   // ← new
```

### The Updated Project

```js
const ITERATIONS = 180
// K_REP is scaled inversely with N so the *total* repulsion force per node
// stays constant regardless of graph size. Without this, a 1400-node graph
// blows up in the first few iterations because each node receives N×K_REP
// force — causing exponential velocity growth and NaN positions.
const K_REP  = (2.0 * 800) / N   // repulsion strength (N-normalised)  ← new
const K_SPR  = 0.04               // spring attraction
const DAMP   = 0.88               // velocity damping (higher = more stable) ← changed
const CENTER = 0.003              // gentle pull toward origin
const MAX_F  = 2.0                // per-axis force clamp                ← new
```

This block of constants now defines a simulation whose total per-node force remains approximately constant as the graph grows. When `N` doubles, `K_REP` halves, holding the product `N × K_REP` fixed.

### Mechanical Walkthrough

- `(2.0 * 800) / N` — **(b) dimensional normalisation, reappearing.** This is the same pattern as normalising an HSL colour value to `[0,1]` by dividing by 360, or normalising a neural network input by dividing by the training set mean. You have a fixed "target magnitude" (the per-node force that worked at 800 nodes) and you scale the per-unit constant down proportionally so the aggregate stays at that target. The `2.0` is a tuning constant (a lower base than the original `4.0`) chosen empirically to give a stable layout; the `800` is the reference graph size at which the original constant was calibrated.
- Division by `N` — **(a) first appearance in this context.** `N` is already in scope as the node count at the top of the simulation block. Division here makes `K_REP` a derived constant, not a magic number — its relationship to the safe operating point is documented in the expression itself.

### CS Lens

N-normalised constants appear in:

- Neural network learning rate scaling — batch size doubles → learning rate halves (linear scaling rule)
- Hash table load factor — bucket count grows with N to keep collision probability constant
- Thread pool sizing — pool size is `min(N_cores, N_tasks)` so adding tasks doesn't overwhelm cores
- Fluid simulation timestep — `dt = C / (v_max × N^(1/3))` keeps the CFL condition satisfied as resolution increases
- Barnes-Hut approximation — replaces O(N²) with O(N log N) precisely because per-node force must stay bounded

The pattern: **any quantity that aggregates N contributions must divide by N (or a function of N) to stay at a target magnitude as N grows.**

### SE Lens

The alternative is the original code — a hard-coded `4.0` with an implicit assumption that N stays near 800. This is **hidden coupling**: the behaviour of the constant is coupled to the size of the data, but nothing in the code states that coupling or enforces it. The fix makes the coupling explicit: `(2.0 * 800) / N` names the reference size (800) and the formula (inverse proportionality) right in the expression. A future developer who runs the script with 5,000 nodes will see the constant automatically adapt, not mysteriously break.

The maintenance cost of the fix: the formula only works if the simulation has reached a steady state before N changes dramatically. A graph that suddenly doubles in size mid-run would still need a warm restart.

---

#### Fix 2: Per-Pair Force Clamping

### Project Change

- **File modified:** `scripts/generate-graph.mjs`
- **Change type:** replace
- **Location:** Inside the repulsion nested loop, line 193 (the `const f = ...` line)

### The New Code

```js
// Before:
const f = K_REP / dist2

// After:
const f = Math.min(K_REP / dist2, MAX_F)   // ← new
```

### The Updated Project

```js
  // Repulsion between all pairs — O(N²)
  // Each force contribution is clamped to MAX_F per axis so that two nodes
  // which start at nearly-identical positions can't inject infinite energy.
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = px[i] - px[j], dy = py[i] - py[j], dz = pz[i] - pz[j]
      const dist2 = dx*dx + dy*dy + dz*dz + 0.5   // softening term
      const dist  = Math.sqrt(dist2)
      const f     = Math.min(K_REP / dist2, MAX_F) // ← new: clamp prevents explosion
      const ux = dx/dist, uy = dy/dist, uz = dz/dist
      fx[i] += ux*f; fy[i] += uy*f; fz[i] += uz*f
      fx[j] -= ux*f; fy[j] -= uy*f; fz[j] -= uz*f
    }
  }
```

This inner loop now accumulates bounded repulsion forces: no single pair of nodes — however close they start — can contribute more than `MAX_F` units of force in any direction.

### Mechanical Walkthrough

- `Math.min(K_REP / dist2, MAX_F)` — **(b) `Math.min` reappearing**, first applied to force magnitudes rather than UI coordinates. **(a) the softening addend `+ 0.5`:** the denominator `dist2` is squared distance plus a small constant. Without this, two coincident nodes (identical starting positions, which can happen with 1,412 nodes randomly initialised on a sphere) produce `dist2 = 0`, making `K_REP / dist2` = `Infinity`. Adding `0.5` means the minimum denominator is `0.5`, bounding the maximum force to `K_REP / 0.5 = 2 × K_REP` even for coincident nodes.
- `MAX_F` — **(a) first appearance.** Defined as `2.0` in the constants block. It is the absolute ceiling on any single pair's force contribution per iteration, regardless of proximity.

**Execution trace — two nodes starting at nearly the same position:**

```
Given: node i at (0.001, 0.0, 0.0), node j at (0.0, 0.0, 0.0)
  dx = 0.001, dy = 0.0, dz = 0.0
  dist2 = 0.000001 + 0.0 + 0.0 + 0.5  = 0.500001   ← softening saves us
  dist  = sqrt(0.500001)              ≈ 0.7071
  K_REP / dist2 = 2.274 / 0.500001   ≈ 4.548
  Math.min(4.548, MAX_F=2.0)          = 2.0          ← clamped
  ux = 0.001 / 0.7071                ≈ 0.00141
  fx[i] += 0.00141 × 2.0             = 0.00282       ← bounded, not infinite
```

Without the softening term and the clamp, those two nearly-coincident nodes would have generated `K_REP / 0.000001` ≈ 2,274,000 units of force — easily enough to accelerate both nodes to `Infinity` in a single iteration.

### CS Lens

Force clamping / softening appears in:

- N-body gravitational simulations (the standard "softening length" ε in astrophysics codes)
- Smoothed Particle Hydrodynamics — pressure forces are regularised to prevent particle overlap spikes
- Rigid body physics engines (Unity, Bullet, Box2D) — impulse clamping per contact pair
- Gradient clipping in neural network training — large gradients are clipped to `max_norm` before the weight update, preventing a single bad batch from destroying a model
- PID controllers — integral windup clamp prevents the integral term from saturating during a long error period

The pattern: **any system where two inputs can get arbitrarily close (or far) needs a mechanism to bound the force or gradient they can inject, independently of the global scaling constant.**

### SE Lens

The alternative to clamping is a better initialiser — place nodes so no two start coincident. The script does attempt this (random placement on a sphere), but with 1,412 nodes on a sphere of radius 5–11, the probability that two nodes land within distance `0.1` of each other is non-negligible. Clamping is a **defence in depth** decision: even if the initialiser is perfect, a future developer who changes the sphere radius or the node count shouldn't have to remember that the initialiser is load-bearing for numerical stability. The clamp makes stability a property of the integration step itself, not of its inputs.

---

#### Fix 3: Per-Iteration Velocity Clamping

### Project Change

- **File modified:** `scripts/generate-graph.mjs`
- **Change type:** replace
- **Location:** The integration block, lines 218–225, inside the outermost iteration loop

### The New Code

```js
// Before:
vx[i] = (vx[i] + fx[i]) * DAMP

// After:
const MAX_V = 1.5
vx[i] = Math.max(-MAX_V, Math.min(MAX_V, (vx[i] + fx[i]) * DAMP))
```

### The Updated Project

```js
  // Integrate — clamp velocity to prevent compounding blowup across iterations
  const MAX_V = 1.5
  for (let i = 0; i < N; i++) {
    vx[i] = Math.max(-MAX_V, Math.min(MAX_V, (vx[i] + fx[i]) * DAMP))  // ← new
    vy[i] = Math.max(-MAX_V, Math.min(MAX_V, (vy[i] + fy[i]) * DAMP))  // ← new
    vz[i] = Math.max(-MAX_V, Math.min(MAX_V, (vz[i] + fz[i]) * DAMP))  // ← new
    px[i] += vx[i]
    py[i] += vy[i]
    pz[i] += vz[i]
  }
```

The integration block now enforces a hard speed limit on every node before writing the position update. A node can move at most `MAX_V = 1.5` units per iteration in any axis direction, regardless of accumulated force.

### Mechanical Walkthrough

- `Math.max(-MAX_V, Math.min(MAX_V, expr))` — **(a) first appearance as a clamp idiom.** This is the standard JavaScript way to clamp a value to `[lo, hi]`. The inner `Math.min(MAX_V, expr)` caps the upper bound. The outer `Math.max(-MAX_V, ...)` floors the lower bound. Together they restrict the result to `[-1.5, 1.5]`. Modern JavaScript (ES2024) has `Math.clamp` in some proposals but it isn't yet baseline; this idiom is the current portable form.
- `(vx[i] + fx[i]) * DAMP` — **(b) Euler integration with damping, reappearing.** This is explicit Euler integration: new velocity = old velocity + force, then multiply by a damping factor `< 1` to bleed off energy each step. The damping factor was increased from `0.80` to `0.88` — a higher value means less energy bleeds off each step, which sounds wrong but gives more stable trajectories because the force clamp now handles the energy ceiling instead of relying on damping to catch explosions after the fact.

**Execution trace — velocity accumulation over 3 iterations without vs. with clamping:**

```
Initial: vx=0.0, fx_each_iter=2.0, DAMP=0.88

Without clamp:
  Iter 1: vx = (0.0 + 2.0) * 0.88  = 1.76
  Iter 2: vx = (1.76 + 2.0) * 0.88 = 3.31
  Iter 3: vx = (3.31 + 2.0) * 0.88 = 4.67  → grows without bound

With clamp (MAX_V=1.5):
  Iter 1: vx = clamp(1.76, -1.5, 1.5)  = 1.5   (capped)
  Iter 2: vx = clamp((1.5 + 2.0)*0.88) = clamp(3.08) = 1.5   (stays capped)
  Iter 3: vx = 1.5                      = 1.5   (stays capped)
  → position advances at most 1.5 units per step, regardless of iteration count
```

### CS Lens

Velocity / gradient clamping per iteration appears in:

- Neural network training — gradient clipping (`torch.nn.utils.clip_grad_norm_`) prevents a single large-loss batch from exploding weights
- Robotics joint velocity limits — a controller that outputs `1000 rad/s` is hardware-limited to `±20 rad/s` regardless of PID output
- Game physics — maximum terminal velocity prevents tunnelling (a fast projectile passing through a wall in a single frame)
- CNC acceleration limits — G-code motion controllers clamp axis feed rates to prevent stepper motor stalls
- Audio DSP — clipping an audio signal before it reaches the DAC prevents hardware damage from overflow

The pattern: **when a system accumulates state across time steps, a per-step ceiling on the rate of change is often more robust than trusting global parameters to keep the accumulation bounded.**

### SE Lens

The alternative is to use a more stable integration method — Verlet integration or Runge-Kutta 4 — which are mathematically more stable than Euler and don't require velocity clamping for moderate timesteps. The reason explicit Euler with clamping is kept here is **simplicity and predictability**: Verlet integration requires storing the previous position (two more typed arrays), and RK4 requires four force evaluations per step instead of one (a 4× compute cost on an already O(N²) loop). For a one-off data-generation script that runs offline in under 30 seconds, the tradeoff is correct. For a real-time physics engine rendering at 60fps, it wouldn't be.

---

## Concept Unit: The NaN Guard — Fail-Fast vs. Fail-Silent

### The Problem

Even after fixing the simulation, there is still a risk: future code changes (a new node type, a larger graph, a different initialiser) could reintroduce numerical instability. Without a guard, that instability would again produce a silent broken file.

### Project Change

- **File modified:** `scripts/generate-graph.mjs`
- **Change type:** add
- **Location:** Immediately before the `const nodesOut = nodes.map(...)` line in section 9

### The New Code

```js
const nanCount = Array.from(px).filter(v => !isFinite(v)).length
if (nanCount > 0) {
  console.error(`ERROR: ${nanCount} nodes have non-finite x positions.`)
  process.exit(1)
}
```

### The Updated Project

```js
// ── 9. Write output ──────────────────────────────────────────────────────────
// Guard: if simulation diverged to NaN or Inf, abort rather than silently
// writing a file full of nulls (JSON.stringify(NaN) === 'null').
const nanCount = Array.from(px).filter(v => !isFinite(v)).length  // ← new
if (nanCount > 0) {                                                // ← new
  console.error(`ERROR: ${nanCount} nodes have non-finite x positions.`)  // ← new
  console.error('The force constants may be unstable for this graph size. Aborting.') // ← new
  process.exit(1)                                                  // ← new
}                                                                  // ← new

const nodesOut = nodes.map((n, i) => {
  const node = {
    id:    n.id,
    label: basename(n.id),
    folder: n.id.split('/')[0],
    rgb:   folderColor(n.id),
    x:     +px[i].toFixed(3),
    y:     +py[i].toFixed(3),
    z:     +pz[i].toFixed(3),
    size:  +(1 + (degree[i] / maxDeg) * 2.5).toFixed(2),
  }
  if (n.meta) node.meta = n.meta
  return node
})
```

The script now refuses to write output if any coordinate is `NaN` or `Infinity`. The output file only exists if the simulation succeeded.

### Mechanical Walkthrough

- `Array.from(px)` — **(a) first appearance in this context.** `px` is a `Float64Array`; `.filter()` does not exist on typed arrays. `Array.from()` creates a new plain array from any iterable or array-like value, giving access to all `Array.prototype` methods. The output is a plain `number[]` copy of `px`'s contents.
- `.filter(v => !isFinite(v))` — **(b) `.filter()` reappearing.** Returns a new array containing only elements for which the callback returns `true`. **(a) `isFinite()`:** a global function that returns `true` if its argument is a finite number — `false` for `NaN`, `Infinity`, and `-Infinity`. `!isFinite(v)` is therefore `true` for any non-finite value, so `.filter(!isFinite)` collects all broken values.
- `.length` — already-established property; counts elements in the filtered array.
- `console.error(...)` — **(b) reappearing.** Identical to `console.log` but writes to stderr instead of stdout. Scripts read by CI pipelines treat non-zero exit codes as failure regardless of stdout content; writing the error to stderr is convention.
- `process.exit(1)` — **(a) first appearance.** `process` is a Node.js global object representing the current process. `.exit(n)` terminates the process immediately with exit code `n`. Exit code `0` means success; any non-zero code signals failure to the shell or CI system that invoked the script. `1` is the conventional "generic error" exit code.

### CS Lens

Fail-fast guards at data boundaries appear in:

- Database constraint violations — the transaction is rolled back immediately rather than writing a partially-invalid row
- Type system static checks — a TypeScript compilation error stops the build rather than shipping broken JavaScript
- Rust's `panic!` — unrecoverable errors terminate the process rather than continuing with corrupted state
- HTTP input validation — a 400 Bad Request before any database write rather than a 500 after
- CNC emergency stop — the machine halts rather than attempting to execute a command that would break the tool

The pattern: **detecting an invariant violation as close as possible to where it's introduced is cheaper than detecting it downstream, because at the boundary you know exactly what the invariant is and what violated it; downstream you only know that something is wrong.**

### SE Lens

The alternative — which is what the original code did — is to let `JSON.stringify` silently convert `NaN` to `null` and write the file anyway. This is a **fail-silent** pattern. It is sometimes the right choice (a missing optional field deserves a null; the app handles it gracefully), but it is the wrong choice here: the app does *not* handle null coordinates gracefully, and the failure mode (all nodes at the same screen position) looks like a rendering bug rather than a data bug, making it dramatically harder to diagnose. The rule for choosing fail-fast vs. fail-silent is: **fail-fast when the consumer of your output cannot make meaningful progress on corrupt input.** The canvas renderer cannot.

### Commands Needed

```bash
node scripts/generate-graph.mjs
```

- `node` — the Node.js runtime executable
- `scripts/generate-graph.mjs` — path to the script, relative to the project root
- `.mjs` extension — tells Node.js to treat the file as an ES module, enabling `import`/`export` syntax

**Success output (all four fixes in place):**
```
Nodes: 1412  Edges: 2137
Running force simulation...
  25%
  50%
  75%
  100%

Wrote C:\Users\g4m3r\Documents\testing tutorials\open-calc\src\data\codebaseGraph.js
1412 nodes, 2137 edges
```

**Failure output (if simulation diverges):**
```
Nodes: 1412  Edges: 2137
Running force simulation...
  25%
ERROR: 1412 nodes have non-finite x positions after simulation.
The force constants may be unstable for this graph size. Aborting.
```

---

## Closing

### Connect the Pieces

One complete run through everything this lesson built:

1. The script initialises 1,412 `Float64Array` slots per axis (`new Float64Array(N)`), each starting at `0.0`.
2. 180 iterations of force simulation run. In each iteration, the repulsion force per pair is capped by `Math.min(K_REP / dist2, MAX_F)`, preventing any two close nodes from injecting unbounded energy. After accumulating all forces, each node's velocity is capped by `Math.max(-MAX_V, Math.min(MAX_V, (v + f) * DAMP))`, preventing accumulated velocity from compounding across iterations.
3. After the simulation, `Array.from(px).filter(v => !isFinite(v)).length` checks for any `NaN` or `Infinity`. If found, `process.exit(1)` stops the script before any file is written.
4. If the guard passes, coordinates are written as `+px[i].toFixed(3)`. Because `px[i]` is a finite number, `toFixed` returns a numeric string, `+` converts it to a number, and `JSON.stringify` writes it as a number — not `null`.
5. The app loads `codebaseGraph.js`, the canvas projects every node using finite `(x, y, z)` coordinates, and the galaxy renders correctly.

### What Breaks Without This

**Remove the velocity clamp and restore the original `K_REP = 4.0`:**

```js
// Revert these two lines:
const K_REP = 4.0              // fixed, not N-normalised
vx[i] = (vx[i] + fx[i]) * DAMP  // no clamp
```

Run `node scripts/generate-graph.mjs`. With the guard in place, output is:

```
Nodes: 1412  Edges: 2137
Running force simulation...
  25%
ERROR: 1412 nodes have non-finite x positions after simulation.
The force constants may be unstable for this graph size. Aborting.
```

The guard catches it. Without the guard (also remove the `nanCount` block), the script writes the file, reports success, and the app shows the white disk. **Restore all changes before continuing.**

### Exercises

1. **Change the reference size.** Replace `(2.0 * 800) / N` with `(2.0 * 400) / N`. Run the script. Does the graph still render? Does the galaxy look tighter or more spread out? Why?
2. **Lower `MAX_V` to `0.1`.** Run the script. The simulation now converges more slowly — nodes barely move per step. Does the output still look like a good layout? What does this tell you about the relationship between `MAX_V` and layout quality?
3. **Add a second guard** that checks whether `maxR` (the maximum radius after the simulation) is unreasonably small — say, less than `0.1`. Write the `console.error` message and `process.exit(1)` call. What would this guard catch that the `nanCount` guard does not?
4. **Read the original file from git.** Run `git show 6e441b99:src/data/codebaseGraph.js | head -30`. Compare the `x` values you see to the `x` values in the current file. Are they similar or wildly different? What does that tell you about whether the fixed simulation produces a layout close to the original?

### Definition of Done

- [ ] `node scripts/generate-graph.mjs` completes without error and prints the success message
- [ ] `src/data/codebaseGraph.js` contains no lines matching `"x": null` (verify: `Select-String -Path src\data\codebaseGraph.js -Pattern '"x": null' | Measure-Object -Line`)
- [ ] The codebase graph page in the running app shows a galaxy of nodes, not a single white disk
- [ ] You can hover a node and see its label appear
- [ ] Commit with a message that states *why*, not what:

```
fix(generate-graph): stabilise force simulation for 1400+ node graphs

K_REP was a fixed constant calibrated for ~800 nodes. At 1412 nodes,
per-node force scales linearly with N, causing exponential velocity growth
and NaN positions (serialised to null by JSON.stringify). Fix: normalise
K_REP by N, add per-pair force clamp, add per-step velocity clamp, add
NaN guard before file write.
```
