# Lesson 30: Down, Up, and Never Sideways

**What you will build:** No new `project/` code this lesson — Lesson
29's own real layout (`Padding`, `Row`, `Expanded`, `Align`) already
exists and was already measured; this lesson explains, mechanically and
for real, *why* it behaved exactly the way it was measured to, and
deliberately triggers the two most common real Flutter layout errors —
a genuine `RenderFlex overflowed by 60 pixels` and a genuine unbounded-
height assertion — to make the underlying mechanism impossible to
mistake for a vague rule of thumb. Curriculum's own three-line mental
model, verbatim: **constraints go down, sizes go up, parents set
positions.** Lesson 29 already found two real, honest false starts that
were secretly this exact mechanism, encountered before it had a name —
this lesson gives it one, and the real, quoted source that proves it.

**What you need to know first:**
- Lesson 4 — distinguishing symptom from cause, reused as the real
  principle behind both of this lesson's own triggered errors failing
  loud with exact data rather than silently.
- Lesson 5 — `final`, `const`.
- Lesson 6 — comparison operators, reused in this lesson's own real,
  quoted assertion text (`<=`, `<`).
- Lesson 12 — `extends`.
- Lesson 13 — named-constructor syntax (`BoxConstraints.tight`),
  reappearing from enhanced enums.
- Lesson 19 — the real, honestly-reported false start, reused directly
  as the same standard this lesson's own two triggered errors are held
  to.
- Lesson 25 — `RenderObject` and the real, quoted **layout** stage of
  the render pipeline — this lesson gives that one word its full,
  mechanical treatment for the first time.
- Lesson 26 — the `as` cast operator.
- Lesson 29 — `Padding`/`RenderPadding` (used there as a `Widget`;
  read here as the real `RenderObject` underneath it), the real,
  measured 16-pixel inset that unit already proved, and this lesson's
  own two direct debts: Lesson 29's own real "tight vs. loose
  constraints" false start (the 800×600 test-surface discovery) and its
  own real "global vs. local coordinates" false start — both explained
  here by name and mechanism, not just described.

**Pipeline diagram.** This curriculum's own widget pipeline, established
across Lessons 25-29:

```
Widget
  ↓ createElement() / canUpdate()
Element
  ↓ createRenderObject() / updateRenderObject()
RenderObject
  ↓ layout → paint → composite
Pixels
```

This lesson gives the **layout** stage its own full, dedicated
treatment — not just "the pass where size and position get decided"
(Lesson 25's own summary) but the exact, real, three-part protocol every
single `RenderObject` in this diagram follows, without exception:
receive real constraints from above, decide a real size within them,
report that size back up, and have your own position decided *for* you
by whichever `RenderObject` sits one level up. Concrete value carried
through: `project/`'s own real `RenderPadding` (Lesson 29's own
`Padding` widget, inflated) is this lesson's own single, central,
real-quoted example of all three parts happening in one method.

**Terms used in this lesson:**
- **Tight constraints** — reappearing (Lesson 29): a real constraint
  where minimum and maximum are equal, leaving no real choice about
  size. This lesson gives the real, mechanical reason: `BoxConstraints
  .tight(size)`, a real, named constructor, is what actually produces
  one.
- **Loose constraints** — reappearing (Lesson 29): a real constraint
  with a real minimum of `0` and a separately-set maximum. This lesson's
  own real, quoted `BoxConstraints`'s own default constructor confirms
  it directly: `minWidth = 0.0`, `maxWidth = double.infinity` unless
  told otherwise.
- **Unbounded constraint** — new: a real constraint whose own maximum is
  literally `double.infinity` — not "very large," a real, specific
  floating-point value meaning "no upper limit at all." It exists
  because some real contexts (an infinitely scrollable list) genuinely
  have no fixed size to report, and Flutter needs a real, distinct way
  to say so rather than picking an arbitrary large number.
- **`RenderFlex` overflow** — new: a real, specific failure mode where a
  `Row`/`Column`'s own real children, laid out at their own natural
  sizes, together need more real space along the main axis than the
  `Row`/`Column` itself was actually given. It exists as a real,
  detectable, specific error (not a silent visual bug) because
  Flutter's own real layout protocol has no other way to represent
  "this doesn't fit" — every `RenderObject` must report *some* real
  size, even when its children's own combined demands exceed it.
- **`ParentData`** — new: real, extra data a parent `RenderObject`
  attaches to each of its own children — not stored on the child's own
  `RenderObject` at all. It exists as the real, concrete mechanism
  behind "parents set positions": a child's own position is never a
  field the child owns or can report about itself.

**Objects and methods used:**

- **`BoxConstraints`**
  - *What it is:* the real, concrete value every `RenderObject` in this
    curriculum's own 2D widget tree receives before it's allowed to
    decide its own size.
  - *Implementation:* real, verbatim, from
    `C:\flutter\packages\flutter\lib\src\rendering\box.dart`, lines
    100-114:
    ```dart
    class BoxConstraints extends Constraints {
      const BoxConstraints({
        this.minWidth = 0.0,
        this.maxWidth = double.infinity,
        this.minHeight = 0.0,
        this.maxHeight = double.infinity,
      });

      BoxConstraints.tight(Size size)
        : minWidth = size.width,
          maxWidth = size.width,
          minHeight = size.height,
          maxHeight = size.height;
    }
    ```
  - *Its use:* this lesson's own real, triggered unbounded-constraints
    error directly prints one: `BoxConstraints(0.0<=w<=800.0,
    0.0<=h<=Infinity)` — real, live confirmation that "unbounded" is
    exactly this class's own real `maxHeight` field holding
    `double.infinity`.
  - *Type:* a concrete class extending the real, abstract `Constraints`.
  - *Responsibility:* to carry four real numbers — `minWidth`,
    `maxWidth`, `minHeight`, `maxHeight` — down from a parent
    `RenderObject` to a child, bounding what real size that child is
    even allowed to report back.
  - *Depends on:* nothing to construct the default, real, loose
    constructor; a `Size` for the real, named `.tight` constructor.
  - *Connects to:* handed to every `RenderObject`'s own real `layout`
    call; `RenderPadding`'s own real, quoted `performLayout` narrows one
    before handing it to its own child.
  - *Shape:* a small, public, real, immutable value type — not a
    `Widget` — the actual real currency this whole lesson is about.

- **`RenderPadding`**
  - *What it is:* the real, concrete `RenderObject` Lesson 29's own
    `Padding` widget inflates into — the same real class already
    responsible for that lesson's own real, measured 16-pixel inset.
  - *Implementation:* real, verbatim, from
    `C:\flutter\packages\flutter\lib\src\rendering\shifted_box.dart`,
    lines 253-268:
    ```dart
    @override
    void performLayout() {
      final BoxConstraints constraints = this.constraints;
      final EdgeInsets padding = _resolvedPadding;
      if (child == null) {
        size = constraints.constrain(Size(padding.horizontal, padding.vertical));
        return;
      }
      final BoxConstraints innerConstraints = constraints.deflate(padding);
      child!.layout(innerConstraints, parentUsesSize: true);
      final childParentData = child!.parentData! as BoxParentData;
      childParentData.offset = Offset(padding.left, padding.top);
      size = constraints.constrain(
        Size(padding.horizontal + child!.size.width, padding.vertical + child!.size.height),
      );
    }
    ```
  - *Its use:* this lesson's own single, central, real, quoted proof of
    all three parts of curriculum's own mental model at once — the
    exact real object behind Lesson 29's own already-measured
    `EdgeInsets.all(16)` result.
  - *Type:* a concrete class extending `RenderShiftedBox` extending
    `RenderBox`.
  - *Responsibility:* to shrink the real constraints it hands its own
    child by exactly its own real padding, position that child at a
    real, fixed offset, and report its own real size as the child's
    size plus that same padding added back.
  - *Depends on:* `this.constraints` (handed down by whatever
    `RenderObject` is this one's own parent) and, optionally, one real
    child.
  - *Connects to:* `child!.layout(innerConstraints, ...)` hands
    constraints *down*; `child!.size`, read immediately after, is that
    child's own size coming back *up*; `childParentData.offset =
    ...` is this `RenderObject` — never the child — deciding position.
  - *Shape:* internal rendering-layer machinery — real, and already
    quoted once, in part, back in Lesson 25's own broader `RenderObject`
    introduction; this lesson reads its own `performLayout` body in
    full for the first time.

- **`BoxParentData`**
  - *What it is:* the real, minimal class holding the one real piece of
    information a parent decides about a child that the child itself
    never stores: where to paint it.
  - *Implementation:* real, verbatim, from `box.dart`, lines 963-969:
    ```dart
    class BoxParentData extends ParentData {
      Offset offset = Offset.zero;

      @override
      String toString() => 'offset=$offset';
    }
    ```
  - *Its use:* `RenderPadding`'s own real, quoted `performLayout`
    writes directly to `childParentData.offset` — this lesson's own
    direct, concrete proof that a child's real position is data the
    *parent* attaches to it, not a field the child owns about itself.
  - *Type:* a concrete class extending the real, abstract `ParentData`.
  - *Responsibility:* to hold exactly one real value, `offset`,
    defaulting to `Offset.zero` until some parent `RenderObject`
    explicitly sets it.
  - *Depends on:* nothing — a real, simple, mutable value holder.
  - *Connects to:* every real `RenderBox` has one, reachable via its
    own real `parentData` field; only ever written to by that
    `RenderBox`'s own parent, during the parent's own `performLayout`.
  - *Shape:* small, internal, real rendering-layer plumbing.

- **`Container`**
  - *What it is:* a real, general-purpose Flutter widget, used in this
    lesson's own two triggered-error labs purely as a plain, resizable
    box — its own full treatment is not this lesson's subject.
  - *Implementation:* real shape used here: `Container({super.key, this.width, this.height, ...})`.
  - *Its use:* stands in for "some real widget with no opinion of its
    own about size," in both this lesson's own overflow and
    unbounded-constraint labs.
  - *Type:* a concrete class, itself built from several smaller real
    widgets underneath (not detailed here).
  - *Responsibility:* narrowly, for this lesson: occupy real space
    according to whatever real constraints it's given, with no
    additional real behavior relevant here.
  - *Depends on:* nothing required.
  - *Connects to:* used as `Expanded`'s own real child in this lesson's
    unbounded-constraint lab.
  - *Shape:* a small, public, extremely commonly used real widget.

---

## Concept Unit: `BoxConstraints` — Four Real Numbers, Handed Down

### The Problem

Lesson 29's own real, honest false start named the real cause of its
first failure only informally: "the root of a pumped tree receives
tight constraints matching the real, fixed test surface." What,
concretely, *is* a constraint — a real object, a convention, a
metaphor?

> **Pause and think:** Lesson 25's own real, quoted `RenderObject`
> never explained what its own `layout` method actually receives as an
> argument — given this curriculum's own established pattern of always
> reading real source rather than guessing, what would you expect that
> argument's own real type to be named, given everything this lesson's
> own subject is called? Given Lesson 29's own real, exact numbers
> (a `SizedBox(width: 200)` forced to `800`), what would you predict a
> real "tight" constraint and a real "loose" one actually store
> differently?

### Project Change

No reference counterpart — this unit is conceptual, reading real,
already-installed Flutter SDK source, not touching `project/`.

### The New Code

Real, verbatim, from `C:\flutter\packages\flutter\lib\src\rendering\
box.dart`, lines 100-114 (already shown in full in this lesson's own
Header).

### The Updated Project

Not applicable — no `project/` files change this unit.

### Isolate and Discard

Not applicable — this is real, quoted framework source, read fresh this
session, not a throwaway lab.

### Mechanical Walkthrough

- `class BoxConstraints extends Constraints` — `extends`, reappearing
  in full from Lesson 12: a real, concrete class, not an abstract
  contract like `Widget`/`Element` — this is a real, plain value object
  passed around, never subclassed by application code.
- `const BoxConstraints({this.minWidth = 0.0, this.maxWidth = double.infinity, this.minHeight = 0.0, this.maxHeight = double.infinity})`
  — `const`, reappearing from Lesson 5; four real, named, optional
  fields, each with a real default — `minWidth`/`minHeight` default to
  `0.0`, `maxWidth`/`maxHeight` default to `double.infinity` — this is
  the real, concrete confirmation of Lesson 29's own **loose
  constraints** Header term: build a plain `BoxConstraints()` with no
  arguments at all, and every real `RenderObject` receiving it is told
  "be anywhere from zero to infinitely large," genuinely unconstrained
  unless something narrows it.
- `BoxConstraints.tight(Size size) : minWidth = size.width, maxWidth = size.width, minHeight = size.height, maxHeight = size.height;`
  — a real, named constructor (reappearing named-constructor syntax
  from Lesson 13's own enhanced enums), setting `min` equal to `max` on
  both axes — the real, concrete confirmation of this lesson's own
  **tight constraints** Header term: no real choice at all, `min`
  and `max` are the identical real number.

### CS Lens

`BoxConstraints` — a real range on each axis, not a single fixed number
— is a real, working instance of **constraint propagation** — passing
down a real, bounded *range* of acceptable answers rather than dictating
one exact answer, letting each real participant make its own best real
choice within that range.

```
Also recognized in: a CSS `min-width`/`max-width` pair, a database
column's own `CHECK` constraint bounding acceptable values rather than
fixing one, a type system's own bounded generic (`<T extends Number>`)
narrowing what's acceptable without naming one specific real type,
a physical tolerance range on a manufactured part's own real dimensions
```

### SE Lens

The alternative — a parent handing its child one single, exact real
number instead of a real range — was rejected because it would remove
every child's own ability to decide anything about its own real size at
all, turning every widget into a rigid, unconfigurable box. The real
cost of the range-based approach instead: a child can genuinely receive
constraints it cannot satisfy in any reasonable way (this lesson's own
real, triggered `RenderFlex` overflow is exactly this — the real
children's combined natural size exceeds the real max they were given),
and Flutter's own real answer is not to silently pick something, but to
report a real, specific, debuggable error instead.

### Commands Needed

None — real, quoted source, already read this session.

### Run It

Not applicable in the run-a-file sense — real, quoted source is this
unit's own evidence, per the Verification Rule's own exemption for
evidence that is itself the artifact being examined.

### Connect

Every `RenderObject` in this curriculum's own real tree receives one of
these, every single time it's asked to lay itself out. The next unit
shows, in one real method, exactly what happens with it.

---

## Concept Unit: The Three-Part Mechanism, in One Real Method

### The Problem

Curriculum's own three-line mental model — constraints go down, sizes
go up, parents set positions — is a real, load-bearing claim, not a
slogan. Where, concretely, in real Flutter source, could all three parts
actually be *seen* happening, in order, in one place?

> **Pause and think:** Lesson 29's own real `Padding` widget already
> proved, by measurement, that its own child ends up inset by exactly
> its own real padding amount — given that a `Widget` itself (Lesson 25)
> never does any actual measuring, which real object from this
> curriculum's own established architecture would you expect to contain
> the actual, real arithmetic behind that measurement? Given Lesson
> 29's own real, quoted `Padding` constructor took a `padding:` value
> and, separately, an optional `child:` — would you expect the *child*
> to know its own final on-screen position, or would you expect that to
> live somewhere else entirely?

### Project Change

No reference counterpart — conceptual, reading real, already-installed
SDK source.

### The New Code

Real, verbatim, `RenderPadding.performLayout()` (already shown in full
in this lesson's own Header) plus `BoxParentData` (also shown in full).

### The Updated Project

Not applicable — no `project/` files change.

### Isolate and Discard

Not applicable — real, quoted source.

### Mechanical Walkthrough

- `final BoxConstraints constraints = this.constraints;` — reads the
  real constraints *this* `RenderPadding` itself already received from
  whatever `RenderObject` is its own real parent — **constraints go
  down**, already complete by the time this line runs; this line just
  names what already arrived.
- `final BoxConstraints innerConstraints = constraints.deflate(padding);`
  — a real method call, `deflate`, shrinking every one of the four real
  numbers in `constraints` by this `RenderPadding`'s own real padding
  amount — the real, concrete construction of the smaller constraint
  this `RenderObject` is about to hand onward.
- `child!.layout(innerConstraints, parentUsesSize: true);` — this is
  **constraints go down**, literally: `innerConstraints`, just
  computed, is handed to the child's own real `layout` call; the child
  has no say over receiving it. `parentUsesSize: true` is a real,
  necessary flag (not explained further here) telling the framework
  this parent intends to read `child!.size` immediately after, which
  the very next lines do.
- `final childParentData = child!.parentData! as BoxParentData;
  childParentData.offset = Offset(padding.left, padding.top);` — this is
  **parents set positions**, literally: this `RenderPadding` reaches
  into data *about* its child (`BoxParentData`, this lesson's own Header
  entry) and writes a real `Offset` directly — the child's own
  `RenderBox` never participates in choosing this value at all; `as`,
  reappearing from Lesson 26, casts the generic `parentData` field to
  the real, specific `BoxParentData` type this method needs.
- `size = constraints.constrain(Size(padding.horizontal + child!.size.width, padding.vertical + child!.size.height));`
  — this is **sizes go up**, literally: `child!.size`, read here, is the
  real value the *child* decided and reported back, one line after its
  own `layout` call returned; this `RenderPadding` adds its own real
  padding back on top of that child-reported size, then reports *that*
  combined real number as its own size to whatever `RenderObject` is
  waiting one level further up — the exact same real pattern, one level
  removed.

### CS Lens

This one real method is a working instance of **bottom-up size
computation constrained by top-down bounds** — a real, two-pass
information flow (bounds down, then results up) rather than either
direction alone, which is exactly why neither "parents just tell
children their size" nor "children just decide their own size" describes
Flutter's own real behavior on its own.

```
Also recognized in: a compiler's own type inference (expected type flows
down into an expression; the expression's own inferred type flows back
up), a spreadsheet's own dependency-ordered recalculation (inputs flow
down a formula chain; results flow back up to dependents), recursive
descent parsing's own top-down grammar rules producing bottom-up parse
tree nodes
```

### SE Lens

The alternative — letting a child `RenderObject` set its own position
directly, the way it sets its own size — was rejected because a
child, laid out in isolation, has no real way to know where its own
siblings ended up; only the parent, which lays out every child in turn,
has that real, complete picture. The real cost of the split: a child's
own `RenderObject` genuinely cannot answer "where am I on screen" by
itself at all — Lesson 29's own real, honest false start (measuring a
child's position relative to the wrong origin) is exactly this cost,
made concrete: position is never local information a `RenderObject` can
introspect about itself.

### Commands Needed

None — real, quoted source.

### Run It

Not applicable — same exemption as the previous unit.

### Connect

Every real pixel Lesson 29 ever measured — the 16-pixel padding inset,
the centered placeholder, the side-by-side status text — was this exact
three-part protocol running, once per `RenderObject`, all the way down
this project's own real tree. The next two units show what happens when
the protocol's own real constraints genuinely cannot be satisfied.

---

## Concept Unit: When Children Want More Than They're Given

### The Problem

`RenderPadding`'s own real `performLayout` always has *some* real
number to report as its own size, however large. But `Row`/`Column`'s
own real children (Lesson 29) each have their own real, natural size —
what happens when those real sizes, added together along the main
axis, genuinely exceed the real maximum the `Row`/`Column` itself was
given?

> **Pause and think:** Given this lesson's own real, quoted
> `BoxConstraints`, a `Row`'s own maximum width is a real, specific
> number — if two children each want 80 real pixels, but the `Row`
> itself was only given a maximum of 100, what real options does the
> `Row` actually have: shrink the children without being asked to,
> silently let them draw past its own edge, or something else? Given
> this curriculum's own established preference (Lesson 4) for a real,
> loud, specific error over a silent wrong result, which would you
> expect Flutter's own real behavior to be?

### Project Change

No reference counterpart — this unit's own real evidence is a
deliberately-triggered failure in a throwaway lab, not a `project/`
change.

### The New Code

```dart
await tester.pumpWidget(
  Directionality(
    textDirection: TextDirection.ltr,
    child: Center(
      child: SizedBox(
        width: 100,
        child: Row(
          children: const [
            SizedBox(width: 80, height: 10),
            SizedBox(width: 80, height: 10),
          ],
        ),
      ),
    ),
  ),
);

final exception = tester.takeException();
```

### The Updated Project

Not applicable — no `project/` files change.

### Isolate and Discard

This *is* the isolated case — the smallest real structure that forces
this exact failure. Discarded after this unit.

### Execution Trace

Real, run this session, via `flutter test test\overflow_probe_test.dart`:

1. The outer `SizedBox(width: 100)` hands the `Row` a real
   `BoxConstraints` with `maxWidth: 100`.
2. The `Row`'s own real layout logic asks each child its own natural
   size — both real `SizedBox(width: 80)` children report `80`.
3. `80 + 80 = 160`, and `160 > 100` — the real children's own combined
   real demand genuinely exceeds the real maximum the `Row` itself was
   given.
4. Flutter's own real behavior: not a silent visual glitch, and not a
   crash that halts the whole app — a real, specific, caught error.

Real, captured exception, this session:

```
FlutterError
   A RenderFlex overflowed by 60 pixels on the right.
```

`160 - 100 = 60` — the real error's own real number, exactly matching
the real, computed excess, confirmed, not approximated.

### CS Lens

A real, specific, computed overflow amount, rather than a generic
"doesn't fit" message, is a real instance of **failing loud, with
exact diagnostic data** — the same principle Lesson 4's own curriculum
bullet ("distinguishing symptom from cause") already valued, applied
here by the framework itself rather than by this curriculum's own
authored content.

```
Also recognized in: a compiler's own "expected type X, got Y" error
naming both real types instead of just "type error," a database's own
constraint-violation error naming the exact real row and column,
an HTTP 413 "Payload Too Large" response naming the real limit exceeded
```

### SE Lens

The alternative — Flutter silently clipping or squishing overflowing
children with no error at all — was rejected because it would hide a
real, genuine layout mistake behind an accidentally-plausible-looking
result, the same class of risk this curriculum has already named more
than once (Lesson 6's own real, corrected wrong assumption; Lesson 19's
own honestly-reported false start). The real cost of failing loud
instead: a real, if initially unfamiliar-looking, yellow-and-black
striped overflow indicator and console error every beginner Flutter
developer eventually meets — this lesson's own real, triggered example
being the exact first appearance of it in this curriculum.

### Commands Needed

- `flutter test test\overflow_probe_test.dart` — no new flags; standard
  invocation, already explained.

### Run It

Real, captured output, this session — shown above in the Execution
Trace, not paraphrased.

### Connect

Real children can want more space than they're given, along a
`Row`/`Column`'s own main axis. The last unit shows a different, second
real failure mode: constraints that never resolve to a real number at
all.

---

## Concept Unit: When Constraints Never Resolve

### The Problem

This lesson's own real, quoted `BoxConstraints` default constructor
allows `maxHeight: double.infinity` — a real, unbounded upper limit.
Lesson 29's own `Expanded` (real, quoted: `fit: FlexFit.tight`) forces
its own child to fill the *exact* real space available. What happens
when `Expanded` is asked to fill a real space whose own upper limit is
genuinely infinite?

> **Pause and think:** Given `Expanded`'s own real job — force a child
> to be *exactly* as large as the real space available — what real
> number would "exactly as large as infinity" actually mean? Given this
> lesson's own real, quoted `BoxConstraints`, is `double.infinity` a
> real, usable number a `RenderObject` could actually report as its own
> concrete size?

### Project Change

No reference counterpart — a second, separately deliberately-triggered
failure in a throwaway lab.

### The New Code

```dart
await tester.pumpWidget(
  Directionality(
    textDirection: TextDirection.ltr,
    child: Column(
      children: [
        Column(children: [Expanded(child: Container())]),
      ],
    ),
  ),
);

final exception = tester.takeException();
```

### The Updated Project

Not applicable — no `project/` files change.

### Isolate and Discard

This *is* the isolated case. Discarded after this unit.

### Execution Trace

Real, run this session, via `flutter test test\unbounded_probe_test.dart`:

1. The outer `Column` hands its own real child (the inner `Column`) a
   real `BoxConstraints` — real, quoted from the actual captured error:
   `BoxConstraints(0.0<=w<=800.0, 0.0<=h<=Infinity)` — this lesson's
   own new **unbounded constraint** Header term, confirmed directly:
   `maxHeight` really is `Infinity`, a real, literal value, not a
   figure of speech.
2. The inner `Column` contains an `Expanded`, whose own real job — per
   this lesson's own already-quoted `Flexible`/`Expanded` distinction
   (Lesson 29) — is to force its child to be *exactly* the real,
   available height.
3. There is no real, finite "exactly" to compute — the available height
   is genuinely unbounded.

Real, captured exception, this session (trimmed to its own real,
load-bearing sentences):

```
RenderFlex children have non-zero flex but incoming height constraints are unbounded.
When a column is in a parent that does not provide a finite height constraint, ...
Setting a flex on a child (e.g. using Expanded) indicates that the child is to expand
to fill the remaining space in the vertical direction.
These two directives are mutually exclusive.
```

This real error message is, itself, a direct restatement of this
lesson's own central mechanism: `Expanded`'s own real job requires a
real, finite maximum to fill exactly; an unbounded constraint has no
such real number, so the two real requirements — "shrink to fit your
own children" (what an unconstrained `Column` does) and "expand to fill
exactly" (what `Expanded` demands) — are genuinely, mutually impossible
to satisfy for the same real `RenderObject` at once.

### CS Lens

An assertion naming the *actual conflicting real requirements*, rather
than a generic "invalid layout," is a real instance of **precise error
attribution** — the same real principle the previous unit's own exact
`60`-pixel overflow number already demonstrated, here applied to a
structural impossibility rather than a numeric excess.

```
Also recognized in: a constraint solver reporting exactly which two real
constraints in a system are mutually unsatisfiable, a type checker
naming the specific two real types it cannot unify, a build system
reporting a real, specific circular dependency rather than just failing
to build
```

### SE Lens

The alternative — `Expanded` silently doing nothing, or picking an
arbitrary real number, when its own available space is unbounded — was
rejected for the same real reason the previous unit's overflow wasn't
silently clipped: a widget appearing to work by accident, with a real,
undefined actual size, is a worse outcome than a real, loud, immediately
diagnosable error. The real cost this project already carries, worth
naming honestly: none of `project/`'s own current, real layout
(Lesson 29) actually nests `Expanded` this way — this failure mode is
proved here, in isolation, precisely so it's recognized on sight if
Lesson 31's real Sudoku board ever produces it by accident.

### Commands Needed

- `flutter test test\unbounded_probe_test.dart` — standard invocation.

### Run It

Real, captured output, this session — shown above in the Execution
Trace.

### Connect

Both of curriculum's own most common real beginner failures —
children wanting too much space, and a parent unable to say how much
space there even is — are now real, seen, and named, not abstract
warnings.

---

## Connect the Pieces

Follow one real `BoxConstraints` value — `BoxConstraints(0.0<=w<=800.0,
0.0<=h<=Infinity)`, this lesson's own real, captured evidence — through
every unit this lesson built:

1. Some real parent `RenderObject` — in this lesson's own lab, the test
   framework's own real root — hands this real value **down** to
   whatever `RenderObject` is beneath it. This is Concept Unit 1's own
   real subject: a real, bounded range, `minWidth`/`maxWidth`/
   `minHeight`/`maxHeight`, `0.0`/`800.0`/`0.0`/`Infinity` here
   specifically.
2. Concept Unit 2's own real, quoted `RenderPadding.performLayout`
   showed the general shape every `RenderObject` follows with whatever
   real constraints it receives: narrow them (`deflate`), hand the
   narrowed version further down, read the child's own real size back
   **up**, and — never the child's own choice — decide that child's
   real position via `BoxParentData.offset`.
3. Concept Unit 3's own real, triggered failure showed what happens
   when real children's own combined natural size exceeds a real,
   *finite* maximum: a real, exact, computed overflow — `60` pixels,
   not approximate.
4. Concept Unit 4's own real, triggered failure showed the different
   real failure when the maximum itself is this exact, real,
   `Infinity` value this walk started with: `Expanded`'s own real job —
   fill *exactly* the available space — has no real, finite answer to
   compute at all.
5. Every one of Lesson 29's own real, measured results — the 16-pixel
   padding inset, the centered placeholder, the side-by-side status
   row — was this same real, three-part protocol, running without
   incident, precisely because none of `project/`'s own real widgets
   ever asked for more space than was really available, and nothing
   ever received a genuinely unbounded maximum it couldn't satisfy.

Curriculum's own three-line mental model is no longer a slogan to
memorize — it's the literal, real, quoted body of one method
(`RenderPadding.performLayout`) this project already depends on, and the
literal, real cause of two error messages this lesson deliberately,
honestly triggered rather than merely described.
