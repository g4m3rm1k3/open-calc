# track-foundations

A prerequisite curriculum for `../track/` (34-lesson Android/Java "Pocket
Inventory" course, written for a reader who already knows Java and
Android). `track/`'s lesson files are immutable capstones — never
rewritten, reordered, or edited by this project, under any framing.
`track-foundations/` is a separate, new set of lessons that teach the
concepts `track/` assumes, so a true beginner can read straight through
both in order.

## How this was built

1. **`CONCEPT-GRAPH.md`** — every concept `track/` relies on, extracted
   lesson by lesson into one canonical, validated dependency graph (189
   nodes). See its own header for the full governing rules.
2. **`dependency-resolution/`** — six generated analysis artifacts derived
   mechanically from the graph (canonical topological order, dependency
   levels, concept clusters, cross-cluster edges, a concept "pressure"
   ranking, and curriculum validation with 3-tier severity), plus a
   read-only lesson-by-lesson audit of `track/` itself
   (`LESSON-AUDIT.md`), plus the Lesson Design Specification
   (`LESSON-DESIGN-SPEC.md`) — 69 generated lesson units with proven
   dependency closure, each citing which `track/` lesson(s) motivated it.
   Regenerate with `node scripts/concept-graph-resolve.mjs`,
   `node scripts/concept-graph-audit.mjs`, and
   `node scripts/concept-graph-design.mjs` after any change to the graph.
3. **`lessons/`** — the actual lesson prose, one file per unit in
   `LESSON-DESIGN-SPEC.md`, in dependency-safe order (numbered flat, not
   partitioned into category folders — the units are cross-category by
   design, e.g. the Room lesson mixes OOP/Patterns/SE/Android concepts, so
   a category-folder structure would force splitting cohesive subsystems).
   Every lesson follows `src/docs/reference/LESSON_CONTRACT.md` and
   `LESSON SCHEMA.md` exactly. Linted with
   `node scripts/check-narrative-lessons.mjs src/docs/projects/track-foundations/lessons`
   after every batch.

## Status

All 69 lesson units designed and written, passing the linter (Lesson 01
carries 1 reviewed-and-accepted soft `dense-concept-unit` false positive
— 7 necessarily-cohesive first-appearance terms for one primary concept,
matching the checker's own documented false-positive expectation. Lesson
46 carries 6 reviewed-and-accepted soft `note-unverified-hidden-behavior`
flags — real `javap -p` disassembly output is present in the same unit
backing every flagged claim; the checker's own regex can't tell
"asserted before proof" from "restated after proof already shown").

| # | Unit ID | Title | Status |
| ---: | --- | --- | --- |
| 1 | `L0a-1-classes-and-objects` | The Blueprint and the Instance | ✅ written |
| 2 | `L0a-2-members` | Behavior, Construction, and This | ✅ written |
| 3 | `L0a-3-class-level-state` | Class-Level State | ✅ written |
| 4 | `L0a-4-access-and-encapsulation` | Access Control and Encapsulation | ✅ written |
| 5 | `L0a-5-inheritance-and-polymorphism` | Inheritance and Polymorphism | ✅ written |
| 6 | `L0a-6-interfaces-and-contracts` | Interfaces and Contracts | ✅ written |
| 7 | `L0a-7-generics-and-collections` | Generics and Collections | ✅ written |
| 8 | `L0a-8-annotations-and-override-checking` | Annotations and Override Checking | ✅ written |
| 9 | `L0b` | Exception Handling | ✅ written |
| 10 | `L2a` | Inversion of Control and the Activity | ✅ written |
| 11 | `L2b` | XML, the Manifest, and Resources | ✅ written |
| 12 | `L25a` | The Proxy Pattern and ContentProvider | ✅ written |
| 13 | `L26b` | The Application Class and Notification Channels | ✅ written |
| 14 | `L27a` | BroadcastReceiver and Registration | ✅ written |
| 15 | `L30a` | Dependency Injection and Test Doubles | ✅ written |
| 16 | `L34a` | Build Variants, Signing, and Shrinking | ✅ written |
| 17 | `L4a` | Reference and Aliasing | ✅ written |
| 18 | `L0-memory-dependent` | Identity, Equality, and Primitives | ✅ written |
| 19 | `L4b` | Message Passing and Intent | ✅ written |
| 20 | `L10a` | Activity Results | ✅ written |
| 21 | `L24a` | Runtime Permissions | ✅ written |
| 22 | `L5b` | The Stack and the Activity Back Stack | ✅ written |
| 23 | `L8a` | Serialization and Parcelable | ✅ written |
| 24 | `L28a` | JSON and Retrofit | ✅ written |
| 25 | `SUPPL-L0` | Immutability | ✅ written |
| 26 | `SUPPL-L1` | Namespaces, SDK Versions, and the UI Fork | ✅ written |
| 27 | `SUPPL-L10` | Async Results, Field Lifetime, and Incremental Updates | ✅ written |
| 28 | `SUPPL-L11` | Refresh on Resume | ✅ written |
| 29 | `SUPPL-L12` | Manual Resource Cleanup | ✅ written |
| 30 | `SUPPL-L16` | Read-Only Interface Exposure | ✅ written |
| 31 | `SUPPL-L17` | Delegation, Layering, and the Repository Pattern | ✅ written |
| 32 | `SUPPL-L18` | Two-Phase Construction | ✅ written |
| 33 | `SUPPL-L2` | Logging, Signatures, Super, and Bundle | ✅ written |
| 34 | `L5a` | Configuration Change and Instance State | ✅ written |
| 35 | `L11a` | Process Death and SharedPreferences | ✅ written |
| 36 | `L15a` | Lifecycle-Scoped Cache and ViewModel | ✅ written |
| 37 | `SUPPL-L21` | Dispatch Tables, Projections, and Single Source of Truth | ✅ written |
| 38 | `SUPPL-L24` | Query Before Command | ✅ written |
| 39 | `SUPPL-L25` | Implicit Intent | ✅ written |
| 40 | `SUPPL-L29` | Interface Segregation Tension | ✅ written |
| 41 | `SUPPL-L3` | The View Tree, Constraints, and Density Units | ✅ written |
| 42 | `SUPPL-L30` | Unit Testing and Pure Functions | ✅ written |
| 43 | `SUPPL-L32` | State Hoisting | ✅ written |
| 44 | `SUPPL-L33` | Resource Qualifiers and Feature Detection | ✅ written |
| 45 | `SUPPL-L4` | Class Objects, Context, and the Observer Pattern | ✅ written |
| 46 | `L6a` | RecyclerView, ViewHolder, and View Recycling | ✅ written |
| 47 | `L23a` | Event Stream Classification and ItemTouchHelper | ✅ written |
| 48 | `SUPPL-L13` | Application Context and Synchronous vs. Asynchronous Execution | ✅ written |
| 49 | `SUPPL-L28` | Runtime vs. Compile-Time Code Generation | ✅ written |
| 50 | `SUPPL-L34` | Static Analysis vs. Runtime Reflection Blind Spot | ✅ written |
| 51 | `SUPPL-L6` | Build Dependency Management and Template/Instance Separation | ✅ written |
| 52 | `SUPPL-L7` | Equals/HashCode Contract, Accessors, and Illegal States | ✅ written |
| 53 | `SUPPL-L8` | Anonymous Classes and Single Responsibility | ✅ written |
| 54 | `SUPPL-L9` | EditText, Toast, and Boundary Validation | ✅ written |
| 55 | `L12a` | Relational Databases, SQL, and the Iterator Pattern | ✅ written |
| 56 | `L13a` | Room, Annotation-Driven Persistence, and Builder/Singleton Database Access | ✅ written |
| 57 | `SUPPL-L22` | Destructive Action Confirmation and AlertDialog | ✅ written |
| 58 | `SUPPL-L23` | Snackbar, Capability/Policy Separation, and Compensating Actions | ✅ written |
| 59 | `SUPPORT-L14` | Threads, the Event Loop, and the Object Pool Pattern | ✅ written |
| 60 | `L13b` | ExecutorService, the Main Thread Constraint, and runOnUiThread | ✅ written |
| 61 | `L16a` | LiveData and Lifecycle-Aware Observation | ✅ written |
| 62 | `L18a` | Fragment, Fragment Transactions, and the View Lifecycle Mismatch | ✅ written |
| 63 | `L19a` | Directed Graphs, Navigation Graph, and Safe Args | ✅ written |
| 64 | `L20a` | Minimal Edit Distance Diffing, DiffUtil, and ListAdapter | ✅ written |
| 65 | `L21a` | Toolbar and the Options Menu | ✅ written |
| 66 | `L26a` | Service, Background Execution Limits, and WorkManager | ✅ written |
| 67 | `L31a` | Test Pyramid, Instrumented UI Testing, and IdlingResource | ✅ written |
| 68 | `L32a` | Declarative UI and Jetpack Compose | ✅ written |
| 69 | `SUPPL-L14` | ANR (Application Not Responding) | ✅ written |

Full unit list, prerequisites, and primary mental model for every unit is
in `dependency-resolution/LESSON-DESIGN-SPEC.md` — this table is not a
duplicate source of truth, just a progress tracker.
