# Roadmap: Rebuilding `diff3d.py` From Scratch, No Libraries

**Target artifact:** your uploaded `diff3d.py` — a tool that loads two STL
meshes (a raw casting and a machined part), aligns them, computes
point-to-surface distances, colors the machined surfaces, and exports a
vertex-colored OBJ.

**Constraint:** the finished rebuild uses none of `pyvista`, `numpy`, or
`scipy` — every piece of what they're doing gets built by hand, and taught
as the OOP concept it actually is. Your stated gap is OOP specifically
(not general Python), so every lesson is built around a class this project
genuinely needs — never a toy example unrelated to the real script.

Each lesson lives in `lessons/lesson-NN-<slug>.md` and follows
`LESSON_SCHEMA.md` (the document you uploaded) exactly: Header with full
Terms/Objects+CRC treatment, Concept Units with a Socratic prompt, an
isolated throwaway lab (run for real, saved under `verification/`), the
real project code, and CS/SE lenses. You type every New Code block
yourself — nothing here is meant to be read passively.

Work through lessons at your own pace; nothing here assumes a live
back-and-forth. Come back and ask for "the next lesson" whenever you're
ready — I'll pick up from `HANDOFF.md`.

## Phase A — OOP foundations, built as the math the script needs
Replaces: bare `np.array([x,y,z])` triples used everywhere in `diff3d.py`.

1. **The Blueprint Problem** — `class`, `__init__`, `self`, instantiation.
   Builds `Vector3`. *(done — see lessons/lesson-01-the-blueprint-problem.md)*
2. **Teaching `+` to a Vector3** — operator overloading (`__add__`,
   `__sub__`), why `center1 - center2` fails without it.
3. **`__repr__` and Equality** — why `print(v)` is useless right now,
   `__eq__`, the difference between identity and equality.
4. **Vector Methods** — `dot()`, `cross()`, `length()`, `normalize()` as
   instance methods; replaces `np.linalg.norm`, `np.cross`.
5. **Composition: `Triangle`** — a class *made of* three `Vector3`s
   (has-a), `.centroid()`, `.normal()`. Replaces mesh face rows.
6. **Composition: `Mesh`** — a class holding a list of `Triangle`s,
   `.bounds()`, `.center` as a computed property. Replaces
   `mesh.bounds` / `mesh.center` / `mesh.area`.

## Phase B — Reading real files without a library
Replaces: `pyvista.read(path)`.

7. **Binary File Reading** — `open(path, "rb")`, the `struct` module,
   byte offsets — building `STLReader`.
8. **Parsing Binary STL** — the actual 80-byte header + triangle-count +
   50-byte-record format, turning bytes into `Triangle` objects.

## Phase C — Spatial search without a library
Replaces: `mesh.find_closest_cell(...)`.

9. **Brute-Force Nearest Neighbor** — why looping every triangle works
   but doesn't scale; a `NearestSurfaceFinder` class.
10. **Point-to-Triangle Distance** — the actual closest-point-on-a-triangle
    geometry algorithm (barycentric clamping).
11. **Spatial Partitioning: `SpatialGrid`** — bucketing triangles into a
    grid so nearest-neighbor stops being O(n). Replaces the speed
    `find_closest_cell` gets from pyvista's internal BSP tree.

## Phase D — Sampling and normals
Replaces: `sample_points()`, `compute_normals()`.

12. **Grid Sampling a Surface** — rebuilding `sample_points()`'s logic
    (`np.meshgrid`, filtering by distance) as a `SurfaceSampler` class.
13. **Vertex Normals** — averaging face normals per vertex by hand.

## Phase E — Optimization without scipy
Replaces: `scipy.optimize.minimize(..., method="L-BFGS-B")`.

14. **What Minimization Actually Does** — a from-scratch
    `GradientDescentOptimizer` class, gradients by finite differences.
15. **Multi-Pass Alignment** — rebuilding `align3d()`'s coarse-to-fine
    `width_pcts` loop on top of your own optimizer.

## Phase F — The diff and the coloring logic
Replaces: `compute_implicit_distance`, the threshold/coloring block.

16. **Signed Distance** — using vertex normals to turn your Phase C
    distance into a signed value.
17. **Classification and Statistics** — rebuilding the percentile /
    threshold reporting block as a `DiffReport` class.

## Phase G — Export and assembly
Replaces: `save_vertex_colored_obj`, `run_diff`, the `__main__` block.

18. **Writing a Colored OBJ by Hand** — `ObjWriter`, formatted output.
19. **Assembling `run_diff`** — composing every class built so far into
    the same pipeline the original script runs.
20. **Command-Line Assembly** — rebuilding the `argv`-driven `__main__`
    block against your own classes.

---
Progress and the exact resume point live in `HANDOFF.md`.
