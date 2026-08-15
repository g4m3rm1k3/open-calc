# Lesson 5: Local and Global Coordinates

**What you will build:** A three-level version of Lesson 4's two-frame
scene — a robot positioned somewhere in a shared world, a part fixtured
somewhere on the robot, and a feature somewhere on the part — each level
described the easy way, relative only to whatever it's directly attached
to. You'll walk the whole chain to find the feature's true position in the
one frame everyone ultimately has to agree on, then prove two different
ways of walking that chain agree with each other. The transferable problem:
Lesson 4 handled exactly two coordinate systems and one offset between
them. Real scenes, assemblies, and robots are rarely that shallow — they
nest, level inside level — and something has to explain why that nesting is
worth the extra bookkeeping instead of just measuring everything from one
giant global origin.

**What you need to know first:** Lesson 4's origin/coordinate-system idea
and its `to_machine_coordinates`-style conversion, which was really just
Lesson 2's `add_vector_to_point` applied to a new problem. This lesson
reuses that exact pattern, twice in a row.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–4.

**Terms introduced in this lesson:**

- **Local coordinates** — coordinates measured relative to an object's own
  immediate parent, not the ultimate shared frame. Why: describing a
  feature's position relative to the part it's actually cut into is far
  simpler than describing it relative to an entire factory floor — "local"
  is the name for that simpler, closer-to-home description.
- **Global coordinates** — coordinates measured relative to one shared,
  fixed frame that every object in a scene ultimately relates back to. Why:
  local coordinates alone can't answer questions that span two unrelated
  objects (does this tool crash into that fixture?) — those questions need
  everything expressed in one common frame first.
- **Coordinate chain** — the ordered sequence of local-to-parent offsets
  that has to be applied, one after another, to convert an object's local
  coordinates all the way up to global coordinates. Why: Lesson 4 only ever
  needed one offset; a name is needed once there's more than one link to
  walk.

**Objects and methods used:**

None. This lesson reuses Lesson 2's `add_vector_to_point` exactly as
written, called twice instead of once.

---

## Concept Unit: One Offset Isn't Enough

### The Problem

Lesson 4 handled exactly two coordinate systems — machine and work —
related by exactly one offset. A real robotic work cell usually has more
levels than that: the robot itself sits somewhere on the factory floor (its
own offset from the shared **world** frame); a fixture is bolted to the
robot's own mounting point (an offset from the robot's frame); and a
feature is cut into whatever part sits in that fixture (an offset from the
part's frame). Each level is easy to describe *relative to the level right
above it* — the person who designed the fixture doesn't need to know where
the robot happens to be parked on the floor. But eventually, something
needs the feature's *true* position, in the one frame the entire factory
shares, to actually check for a collision or generate a real toolpath.

*A note on method:* like every prior lesson's taxonomy unit, this is a
modeling idea, not a new Python construct — this unit's code is nothing but
two calls to a function Lesson 2 already built. No throwaway syntax lab is
needed here.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–4.
- **Files affected:** `geometry_lesson_05.py` — created, as a new file for
  this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


robot_offset_in_world = (100, 50)
part_offset_in_robot = (20, 10)

feature_in_part = (3, 4)

feature_in_robot = add_vector_to_point(part_offset_in_robot, feature_in_part)
feature_in_world = add_vector_to_point(robot_offset_in_world, feature_in_robot)

print(feature_in_robot)
print(feature_in_world)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has been
in so far.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `def add_vector_to_point(point, vector): ...` — Lesson 2's own function,
  retyped unchanged. Per the Repetition Rule, no re-explanation of its
  mechanics is owed.
- `robot_offset_in_world = (100, 50)` and `part_offset_in_robot = (20, 10)`
  — two plain tuple assignments, already basic. Each represents one link in
  this scene's chain: how far the robot sits from the world origin, and how
  far the part sits from the robot's own origin.
- `feature_in_part = (3, 4)` — the feature's position, described the easy
  way, relative only to the part it's actually cut into.
- `feature_in_robot = add_vector_to_point(part_offset_in_robot,
  feature_in_part)` — the first link in the chain: treating the feature's
  local coordinates as a displacement from the part's own origin, then
  adding the part's offset from the robot, exactly the way Lesson 4 turned
  work coordinates into machine coordinates.
- `feature_in_world = add_vector_to_point(robot_offset_in_world,
  feature_in_robot)` — the second link: the same operation again, this time
  walking from the robot's frame up to the world frame. This is the new
  idea in this unit — not a new function, but *calling the same conversion
  twice in a row*, once per level of the chain, to walk all the way from
  the feature's easiest description up to the one frame the whole factory
  shares.

### CS Lens

Describing each object relative only to its immediate parent, then walking
the chain of parents to find a true global position, is a **hierarchical
coordinate frame** — the same structure behind almost every 3D scene, CAD
assembly, and robot arm ever built.

```
Also recognized in: file systems (a file's full path is built by walking
up through parent directories, the same way this lesson walks up through
parent frames), object-oriented inheritance chains (a method lookup
walking up from an object to its class to its parent class), and
organizational charts (an employee's position in a company is easiest to
describe relative to their direct manager, not relative to the CEO)
```

### SE Lens

The design principle is **letting each level of a hierarchy stay ignorant
of everything above it**. The alternative not chosen: require every
object's designer to know, and hand-enter, that object's position in the
one shared global frame directly — the part's designer would have to know
exactly where the robot sits on the factory floor, even though that has
nothing to do with the part itself.

That alternative isn't unworkable for a single fixed setup — plenty of
early CNC programs really were written entirely in one global frame. The
real cost shows up the moment the robot gets relocated to a different spot
on the floor: under the global-only approach, every feature on every part
that robot ever touches needs its global coordinates recalculated by hand.
Under the local-chain approach this lesson builds, only
`robot_offset_in_world` changes — `part_offset_in_robot` and
`feature_in_part` stay exactly as they were, because neither one ever knew
or cared where the robot itself happened to be standing.

### Commands Needed

Same command as every prior lesson — `python geometry_lesson_05.py`.
Nothing new here.

### Run It

```
(23, 14)
(123, 64)
```

Verified by actually running the file above.

### Connection

The feature now has a real position in the world frame, reached by walking
two links of a chain, one call at a time. The next unit asks whether that
chain has to be walked one link at a time every time, or whether the whole
chain can be collapsed into a single step done once.

---

## Concept Unit: Two Ways to Walk the Same Chain

### The Problem

`feature_in_world` was computed by calling `add_vector_to_point` twice —
once to climb from the part's frame to the robot's frame, once more to
climb from the robot's frame to the world frame. If this conversion needs
to run for *every* feature on the part, calling two functions per feature
is wasteful compared to combining the robot's and the part's offsets into
one single "part to world" offset, computed exactly once, and applying that
one combined offset to every feature.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_05.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(feature_in_world)` line added in
  Concept Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
def to_world_direct(point_in_part, part_offset_in_robot, robot_offset_in_world):
    total_offset = add_vector_to_point(robot_offset_in_world, part_offset_in_robot)
    return add_vector_to_point(total_offset, point_in_part)


feature_in_world_direct = to_world_direct(feature_in_part, part_offset_in_robot, robot_offset_in_world)
print(feature_in_world_direct)
```

### The Updated Project

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


robot_offset_in_world = (100, 50)
part_offset_in_robot = (20, 10)

feature_in_part = (3, 4)

feature_in_robot = add_vector_to_point(part_offset_in_robot, feature_in_part)
feature_in_world = add_vector_to_point(robot_offset_in_world, feature_in_robot)

print(feature_in_robot)
print(feature_in_world)


def to_world_direct(point_in_part, part_offset_in_robot, robot_offset_in_world):  # ← new
    total_offset = add_vector_to_point(robot_offset_in_world, part_offset_in_robot)  # ← new
    return add_vector_to_point(total_offset, point_in_part)                       # ← new


feature_in_world_direct = to_world_direct(feature_in_part, part_offset_in_robot, robot_offset_in_world)  # ← new
print(feature_in_world_direct)                                                    # ← new
```

The file as a whole now computes the same feature's world position two
independent ways: one link at a time (Concept Unit 1), and once, using a
single pre-combined offset (this unit) — and prints both, so the next
section can check that they actually agree.

### Mechanical Walkthrough

Every syntactic element in this unit's new code, in order:

- `def to_world_direct(point_in_part, part_offset_in_robot,
  robot_offset_in_world):` — a function definition with three parameters,
  already basic syntax. The name and parameters together describe its
  contract: given a point in the part's own frame and the two offsets
  needed to reach the world frame, produce the world position directly,
  with no intermediate `feature_in_robot` step visible to the caller.
- `total_offset = add_vector_to_point(robot_offset_in_world,
  part_offset_in_robot)` — this is the new idea: combining two *offsets*
  (not a point and a vector describing a real object's position, but the
  two links of the chain themselves) using the exact same
  `add_vector_to_point` function. Nothing in `add_vector_to_point` cares
  whether its arguments represent "a point" or "an offset" — both are just
  tuples of two numbers, and adding them component-by-component is the same
  operation either way.
- `return add_vector_to_point(total_offset, point_in_part)` — the combined
  offset, applied once, directly to the feature's local coordinates.
- `feature_in_world_direct = to_world_direct(feature_in_part,
  part_offset_in_robot, robot_offset_in_world)` — a function call, already
  basic, producing a second, independently-computed answer to the same
  question Concept Unit 1 already answered.

### Proving the Two Paths Agree

```
(23, 14)
(123, 64)
(123, 64)
```

Verified by actually running the file above. The third line —
`feature_in_world_direct` — matches the second line — `feature_in_world` —
exactly. Walking the chain one link at a time and collapsing the chain into
one combined offset first produce the identical answer. This isn't a
coincidence of these particular numbers: adding `part_offset_in_robot` and
then `robot_offset_in_world`, in either order or combined first, is just
addition — and addition doesn't care how its terms get grouped. Formalizing
exactly why this always holds, for chains of any length, is Lesson 15,
Transformation Composition.

### CS Lens

Precomputing one combined offset instead of re-walking every link of a
chain each time is **caching a composed result** — doing repeated work once
instead of on every call.

```
Also recognized in: compiler optimization (constant folding — combining
several fixed operations into one at compile time instead of computing
them fresh at every run), CSS transforms (a browser combines nested
translate/rotate/scale operations into one matrix rather than replaying
the whole ancestor chain every frame), and 3D engines (a scene graph
caches each object's combined "world transform" instead of climbing the
parent chain every time an object's position is needed)
```

### SE Lens

The design principle is **paying a composition cost once instead of a
walking cost repeatedly**. The alternative not chosen: always call
`add_vector_to_point` once per link, for every feature, every time a world
coordinate is needed — exactly what Concept Unit 1 did.

For one feature, computed once, the two approaches cost about the same —
this lesson's own file proves both take one line to write. The real
tradeoff appears at scale: a part with a thousand features, converted
repeatedly as a robot moves through a production run, pays the two-call
chain-walk a thousand times over under the first approach, but only pays
the combination cost *once* under `to_world_direct`, then reuses
`total_offset` for every feature after that. The honest cost of the
second approach: it only stays correct as long as `total_offset` gets
recomputed the moment `robot_offset_in_robot` or `part_offset_in_robot`
actually changes — a cached combined value that silently goes stale after
the robot moves is a worse bug than never caching at all, because nothing
about a stale `total_offset` looks wrong.

### Commands Needed

Same command as Concept Unit 1 — `python geometry_lesson_05.py`. Nothing
new here.

### Run It

```
(23, 14)
(123, 64)
(123, 64)
```

Verified by actually running the updated file above.

### Connection

This lesson now has both a correct way to walk a coordinate chain link by
link and a correct way to collapse it into one step — and proof that they
agree. Lesson 6, Basis Vectors, picks up the half of "a coordinate system"
this lesson still hasn't touched: everything so far has assumed the x-axis
always points the same direction in every frame, and that assumption is
about to stop being true.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `feature_in_part = (3, 4)` — the feature's position, in the frame
   easiest to describe it in.
2. `add_vector_to_point(part_offset_in_robot, feature_in_part)` computes
   `(20 + 3, 10 + 4) = (23, 14)` — the feature's position relative to the
   robot.
3. `add_vector_to_point(robot_offset_in_world, feature_in_robot)` computes
   `(100 + 23, 50 + 14) = (123, 64)` — the feature's position relative to
   the world, reached by walking both links.
4. Separately, `add_vector_to_point(robot_offset_in_world,
   part_offset_in_robot)` computes `(100 + 20, 50 + 10) = (120, 60)` — the
   two offsets combined into one, before ever touching the feature itself.
5. `add_vector_to_point((120, 60), feature_in_part)` computes
   `(120 + 3, 60 + 4) = (123, 64)` — the same final answer as step 3,
   reached by applying one combined offset instead of two separate ones.

## What Breaks Without This

Skip a link in the chain — a completely realistic mistake once a scene has
more than one level, easy to make by reaching for whichever offset variable
is closest at hand:

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


robot_offset_in_world = (100, 50)
feature_in_part = (3, 4)

skipped_link_result = add_vector_to_point(robot_offset_in_world, feature_in_part)
print(skipped_link_result)
```

```
(103, 54)
```

Verified by actually running this broken version. `(103, 54)` isn't a
crash, and it isn't obviously wrong the way an empty tuple would be — it's
a perfectly plausible-looking world coordinate. It's simply the wrong one:
it skips `part_offset_in_robot` entirely, silently treating the feature as
if it were attached directly to the robot with nothing in between. The
correct answer, `(123, 64)`, differs from this one by exactly
`part_offset_in_robot`, `(20, 10)` — precisely the link that got left out.

## Exercises

1. Add a fourth level to the chain: a `vise_offset_in_part = (5, 2)`,
   representing a part held in a vise that is itself positioned on the
   part... (reframe: a small sub-fixture positioned relative to the part).
   Extend `to_world_direct` — or write a new function — to walk all three
   links and confirm it agrees with combining all three offsets first.
2. Predict, then verify: if `robot_offset_in_world` were `(0, 0)` — the
   robot parked exactly at the world origin — what would
   `feature_in_world` equal? Explain why in one sentence.
3. `to_world_direct`'s two internal steps could be written in the opposite
   order: combine `part_offset_in_robot` with `point_in_part` first, then
   add `robot_offset_in_world` to that result. Try it, and confirm it still
   produces `(123, 64)`. Explain why this reordering is safe here, given
   what Concept Unit 2 already proved about how addition doesn't care how
   its terms are grouped.

## Definition of Done

- [ ] `geometry_lesson_05.py` exists and runs with no errors via
      `python geometry_lesson_05.py`.
- [ ] Running it prints `(23, 14)`, `(123, 64)`, then `(123, 64)` again —
      matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why
      `feature_in_world` and `feature_in_world_direct` come out identical
      despite being computed by two different-looking pieces of code.
- [ ] You can explain what goes silently wrong, and why it isn't a crash,
      when one link of a coordinate chain gets skipped.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add coordinate chains: local frames nest, and walking them link by link matches combining them first"`,
      not `git commit -m "add local and global coordinate functions"`.

Next: Lesson 6 — Basis Vectors, where the direction each axis actually
points stops being assumed and starts being something a coordinate system
has to specify explicitly.
