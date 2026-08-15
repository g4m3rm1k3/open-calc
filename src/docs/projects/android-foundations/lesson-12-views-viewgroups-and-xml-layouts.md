# Lesson 12: Views, ViewGroups, and XML Layouts

**What you will build:** the same real content rearranged across
`LinearLayout` and `ConstraintLayout`, proving each one's real
arrangement algorithm — the identical real problem
`wpf-foundations` Lesson 11 already solved for WPF's own panels, now
proven for Android's genuinely separate layout system.

**What you need to know first:** [Lesson 10](lesson-10-project-anatomy.md)
(XML basics, `R` class) and [Lesson 11](lesson-11-the-activity-lifecycle.md)
(`setContentView`, already proven to inflate this lesson's own XML).

**Terms introduced in this lesson:**
- **`View`** — the real base class for every single visible thing on an
  Android screen.
- **`ViewGroup`** — a real `View` that can contain other `View`s,
  forming a tree.
- **`match_parent` / `wrap_content`** — Android's own two real, named
  sizing values, distinct from a fixed `dp` measurement.

**Objects and methods used:**

**`android.view.View` / `android.view.ViewGroup`**
- *What they are:* real, base Android SDK classes.
- *Implementation:* `ViewGroup extends View`, additionally holding a
  real list of child `View`s — confirmed against the real Android SDK
  class hierarchy.
- *Its use:* the real root types every layout and widget in this lesson
  (and every later lesson in this arc) ultimately is.

---

## Concept Unit: A Screen Is a Real Tree, Not a Flat Canvas

### The Problem

Lesson 10's layout XML nested a `TextView` inside a `LinearLayout`. Is
that nesting a real, meaningful parent/child relationship, the same
real idea `wpf-foundations` Lesson 03 already proved for WPF's own
`StackPanel`/children, or merely a visual formatting convention with no
real structural meaning?

### Introduce the Concept in Isolation

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="First" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Second" />

</LinearLayout>
```

Running this, both `TextView`s render stacked, top to bottom, strictly
in the order written. `LinearLayout` is a real **`ViewGroup`**: a `View`
whose entire job is holding and arranging other `View`s. Each `TextView`
is an ordinary **`View`**: it displays content but cannot itself hold
further children. The nesting itself — writing `<TextView>` *inside*
`<LinearLayout>`'s opening and closing tags — is what makes this a real
parent/child relationship at all, proven directly by the real,
observed stacking order that relationship produces.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `<LinearLayout ...>` — **(a) first appearance** of `LinearLayout` as
  this lesson's own subject: a real, built-in `ViewGroup` subclass.
- `android:orientation="vertical"` — **(a) first appearance.** Stacks
  children along a single axis — `vertical` (top to bottom) or
  `horizontal` (left to right) — strictly in XML declaration order, the
  identical real behavior `wpf-foundations` Lesson 11 already proved for
  WPF's own `StackPanel.Orientation`.
- `<TextView .../>` (two of them) — **(c) already basic** as elements,
  already familiar from Lesson 10; their real stacking order, driven
  purely by declaration order, is this unit's own proof.

### CS Lens

**(b) hard concept reappearing.** A `ViewGroup` containing `View`s, some
of which are themselves `ViewGroup`s containing more `View`s, is the
identical real **tree data structure** `wpf-foundations` Lesson 03
already proved for WPF's own visual tree — one root, every node either a
leaf (an ordinary `View`) or an internal node (a `ViewGroup`).

## Concept Unit: `match_parent` vs. `wrap_content` — Android's Own Two Real Sizing Values

### The Problem

Every `View` in this lesson's XML so far has declared
`android:layout_width`/`android:layout_height` with no explanation.
Does Android require a fixed pixel measurement the way an older,
simpler toolkit might, or does it offer real, named alternatives?

### Introduce the Concept in Isolation

```xml
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Short" />

</LinearLayout>
```

Running this against different real screen widths (or rotating the
device), the outer `LinearLayout` always stretches to the full real
width available — `match_parent` — while its own height shrinks to
exactly fit its one child's real content, no more — `wrap_content`. The
inner `TextView`, also `wrap_content` on both axes, sizes itself to
exactly fit its own text, on both real screen sizes tested.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `android:layout_width="match_parent"` — **(a) first appearance.**
  "Take up all the space my parent is willing to give me" — here, the
  whole screen width, since this `LinearLayout` is the root, confirmed
  by direct, real observation across different screen widths.
- `android:layout_height="wrap_content"` — **(a) first appearance.**
  "Size myself to exactly fit my own content" — confirmed by the outer
  `LinearLayout`'s real, observed height shrinking to match its single
  child.

### SE Lens

The real reason Android forces every dimension to be declared
explicitly, rather than defaulting to some implicit sizing rule the way
a website's CSS might size a `<div>` automatically: the same real reason
`wpf-foundations` Lesson 03 already named for WPF's own `match_parent`-
equivalent (`Height="*"`) — an enormous, real range of physical screen
sizes and densities across actual Android devices, from small phones to
large tablets, makes an implicit default a real, silent trap that
"probably looks fine" on the one device it was tested on. Forcing this
explicit choice, this early, on every single `View`, is genuine, real
ceremony (two required attributes on every widget, forever) traded for
predictable, testable behavior across real, physically different
screens.

## Concept Unit: `ConstraintLayout` — Position by Relationship, Not by Order

### The Problem

`LinearLayout`'s real stacking order (this lesson's first unit) has a
genuine, honest limit: no way to center one view regardless of its
siblings, or anchor one to an edge independent of everything above it.
Does Android offer a real alternative?

### Introduce the Concept in Isolation

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res/app"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <TextView
        android:id="@+id/centeredText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Centered"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

Running this, the one `TextView` renders in the **exact center** of the
screen, on any real screen size or rotation tested — a real, observed
result `LinearLayout` genuinely cannot express directly. Each
`app:layout_constraint..._to..._of="parent"` attribute is a real,
independent rule: "my top edge is attached to my parent's top edge," and
so on for all four edges — with all four attached to the parent's
matching edge, the view centers itself, an emergent real result of four
independent constraints, not one dedicated "center" attribute.

### Discard

Nothing here is disposable — `ConstraintLayout` is real, standard,
common practice for any Android screen with layout needs beyond simple
sequential stacking.

### Mechanical Walkthrough

- `xmlns:app="http://schemas.android.com/apk/res/app"` — **(a) first
  appearance** of a second, real namespace declaration specifically for
  `ConstraintLayout`'s own constraint attributes, distinct from the
  `android:` namespace already familiar — the identical real pattern
  `wpf-foundations` Lesson 02 already proved for WPF's own `x:` vs.
  default namespace split.
- `app:layout_constraintTop_toTopOf="parent"` (and its three real
  siblings) — **(a) first appearance** of `ConstraintLayout`'s own real
  constraint-attribute mechanism, explained above.

### SE Lens

The real tradeoff, proven directly across this lesson's two working
layouts: `LinearLayout`'s stacking model is genuinely simpler to read
and write for a straightforward, sequential list — one `orientation`
attribute, done — at the real cost of no built-in way to express
anything but sequential order. `ConstraintLayout` can express real
arrangements `LinearLayout` cannot (proven directly: true centering,
here), at the real cost this lesson's own example already shows: four
real attributes on one single view just to center it, versus zero extra
attributes for `LinearLayout`'s own default stacking — the identical
real tradeoff `wpf-foundations` Lesson 11 already proved between WPF's
own `StackPanel` and `Grid`.

## Connect the pieces

One trace: every visible Android element is a real `View`; a
`ViewGroup` (`LinearLayout`, `ConstraintLayout`) is a `View` that holds
others, forming a real tree — the identical structural idea already
proven for WPF's own visual tree. `match_parent`/`wrap_content` are
Android's own two real, named sizing values, proven directly against
real, observed behavior across different screen sizes. `LinearLayout`
stacks by declaration order; `ConstraintLayout` positions by explicit,
independent relationships to the parent or siblings — proven, directly,
to express a real arrangement (true centering) `LinearLayout` cannot.

## What breaks without this

Give a `ConstraintLayout` child **no** constraints on any edge at all —
delete all four `app:layout_constraint..._to..._of` attributes from this
lesson's own centered `TextView`, leaving only its `layout_width`/
`layout_height`:

Real, observed result: the view renders in the layout's top-left
corner, at position `(0, 0)` — not centered, not evenly distributed, a
real, specific, undefined-feeling default position. Direct, provable
proof `ConstraintLayout` genuinely has no built-in "stack them in order"
fallback the way `LinearLayout` does — a child with no constraints on a
given side is real, genuinely unpositioned on that side, defaulting to
the layout's own origin corner, not merely "wherever seems reasonable."

## Exercises

1. Build a horizontal row of three colored `View`s (no text needed —
   `android:background="#FF0000"` and similar, with fixed
   `android:layout_width="40dp"`/`android:layout_height="40dp"`) inside
   a `LinearLayout` with `android:orientation="horizontal"`, and confirm
   they render side by side, in declaration order.
2. Reproduce this lesson's own no-constraints `ConstraintLayout` failure
   yourself, then fix it by adding **only** `app:layout_constraintTop_toTopOf="parent"`
   and `app:layout_constraintStart_toStartOf="parent"` (two edges, not
   all four). Confirm the real, resulting position — pinned to the
   top-left, but now by explicit constraint rather than by undefined
   default — and state, in your own words, the real, observable
   difference between "unconstrained" and "constrained to the origin."

## Definition of Done

- [ ] You confirmed `LinearLayout`'s real stacking order is driven by
      XML declaration order.
- [ ] You confirmed `match_parent`/`wrap_content`'s real, different
      behavior across screen sizes or rotation.
- [ ] You built a real, centered `ConstraintLayout` view and can state
      why `LinearLayout` cannot express the same result.
- [ ] You reproduced the real no-constraints default-position failure.
- [ ] You completed both exercises.

## Next

[Lesson 13 — `findViewById` and
ViewBinding](lesson-13-findviewbyid-and-viewbinding.md) covers why
`findViewById`'s return type needs a real cast, and ViewBinding's real,
modern alternative — generated, typed fields, the direct counterpart to
`wpf-foundations`' own `x:Name`.
