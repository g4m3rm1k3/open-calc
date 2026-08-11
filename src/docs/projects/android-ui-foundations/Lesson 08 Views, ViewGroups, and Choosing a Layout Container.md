# Lesson 08: Views, ViewGroups, and Choosing a Layout Container

**What you will build:** The real login screen begins here — replacing
the wizard's default generated layout with an empty container you chose
deliberately, understanding what a "layout container" actually is and
why there's more than one kind. The transferable problem: every UI
toolkit needs some way to arrange multiple visible things on screen
relative to each other, and the specific data structure used to do that
— a tree — shapes almost everything else about how you'll write layouts
from here on.

**What you need to know first:** Milestone 1 (Lessons 01–07) — a real
running project, `onCreate`, `setContentView`, and the Manifest.

**Terms introduced in this lesson:**
- **`View`** — the base class for every single visible thing on an
  Android screen; a button, a line of text, and an image are all,
  underneath, a `View`.
- **`ViewGroup`** — a `View` that can contain other `View`s (including
  other `ViewGroup`s), forming a tree rather than a flat list.
- **Layout container** — informal term for a specific `ViewGroup`
  subclass whose whole job is arranging its children a particular way
  (stacked, constrained, gridded, etc.).
- **`LinearLayout`** — a real, built-in `ViewGroup` subclass that stacks
  its children along a single axis, in the exact order they're declared.
- **`ConstraintLayout` (recognition, real alternative)** — the wizard's
  own default root container, and a more flexible `ViewGroup` subclass
  where each child declares its own position via constraints rather than
  relying on declaration order.
- **XML namespace declaration (`xmlns:`)** — an attribute on a layout's
  root element that makes a prefix like `android:` resolve to a specific,
  real set of attribute definitions, rather than being an arbitrary,
  undefined label.
- **`R.layout` / layout XML resource** — an XML file under
  `res/layout/`, compiled into a reference (`R.layout.<filename>`) that
  `setContentView` can turn into real on-screen `View` objects.
- **`android:id` / `@+id/`** — an attribute assigning a lookup name to a
  specific `View` in a layout, so Java code can find it later.
- **`dp` (density-independent pixel)** — a unit of measurement that scales
  with a screen's physical pixel density, so a size specified in `dp`
  looks the same physical size across different devices.

**Objects and methods used:**

**`View`**
- *What it is:* the base class for every single visible thing on an
  Android screen.
- *Implementation:* a real Android class; a button, a line of text, and
  an image are all, underneath, a `View`.
- *Its use:* the root type every widget and container this lesson builds
  ultimately is.

**`ViewGroup`**
- *What it is:* a `View` that can contain other `View`s.
- *Implementation:* extends `View`, additionally holding a list of child
  `View`s (including other `ViewGroup`s), forming a tree rather than a
  flat list.
- *Its use:* the category every layout container below belongs to.

**`LinearLayout`**
- *What it is:* a real, built-in `ViewGroup` subclass.
- *Implementation:* stacks its children along a single axis —
  `vertical` or `horizontal`, set by `android:orientation` — strictly in
  the order they appear in the XML.
- *Its use:* the container this project's login screen is built on,
  chosen over `ConstraintLayout` for this lesson's simple vertical form.

**`ConstraintLayout`**
- *What it is:* the wizard's own default root container (Lesson 05).
- *Implementation:* a `ViewGroup` subclass with no built-in stacking
  behavior; each child instead declares its own constraints relative to
  its parent or siblings.
- *Its use:* the rejected alternative here — more expressive than this
  project's simple form needs, at the cost of per-child constraint
  bookkeeping `LinearLayout` doesn't require.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`setContentView(int)`**
  - *What it is:* the `Activity` method that puts a layout on screen.
  - *Implementation:* inherited from `Activity`; takes a compiled layout
    resource reference (`R.layout.<filename>`), parses that XML file's
    tree, and builds real `View` objects from it in memory.
  - *Its use:* called once, at the top of `onCreate`, pointing at this
    lesson's own new `activity_main.xml` — the line that turns the XML
    this lesson writes into a real, visible screen.

---

## Concept Unit: Views Form a Tree, Not a Flat Canvas

### The Problem

A raw drawing canvas (like an HTML `<canvas>` or a game's render surface)
has no idea what shapes exist on it — you draw pixels, and remembering
"there's a button around x=40,y=100" is entirely your own responsibility.
Android's UI system is not built this way. Every visible thing on an
Android screen is a real object, and those objects are arranged in a
**tree**: some objects can contain other objects, which can themselves
contain more objects. Before placing a single widget, you need to
understand this tree structure, because every layout decision you make
from here on is really a decision about *where in this tree* something
lives.

### Introduce the Concept in Isolation

This isn't a bare-Java lab — the tree concept only really exists once
XML enters the picture, so the isolation here is conceptual, using the
generated file the wizard already produced for you back in Lesson 05:
open `res/layout/activity_main.xml`. Real content, exactly as generated:

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res/app"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello World!"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

Read this as a tree, not a list: `ConstraintLayout` is the root — one
`ViewGroup` that can hold children. `TextView` is its one child, a plain
`View` with no children of its own (a `TextView` only ever displays text;
it can't contain other views). If you added a second `TextView` inside
the same `ConstraintLayout`, you would have one parent with two children,
siblings to each other — the same parent/child vocabulary Lesson 06 used
for Java class inheritance, now describing a runtime object tree instead
of a compile-time class relationship. **Don't confuse the two:** `extends`
is about one class borrowing another class's code; this parent/child tree
is about one *object* physically containing other objects on screen at
runtime. Same words, two unrelated relationships.

This XML is not throwaway — it's the real file the project already has.
Nothing to discard here; the next unit edits it directly.

### Mechanical Walkthrough

- `<androidx.constraintlayout.widget.ConstraintLayout>` — the root
  **`ViewGroup`**: a `View` whose entire job is holding and arranging
  other `View`s. Being the root means it has no parent of its own within
  this file — it *is* the top of the tree.
- `<TextView ... />` — the one child, an ordinary **`View`**: it
  displays content but, unlike a `ViewGroup`, cannot itself hold further
  children — the self-closing `/>` reflects that directly.
- The nesting itself — `TextView` written *inside* `ConstraintLayout`'s
  opening and closing tags — is what makes this a parent/child
  relationship at all, not a naming convention or a separate
  configuration step.

### SE Lens

Why structure the screen as a tree at all, instead of a flat list of
"here's every view and its absolute position," the way a raw drawing
canvas would? A tree lets a `ViewGroup` own the layout logic for
everything inside it, once, rather than every individual `View` needing
to know its own absolute screen position — move or resize the parent,
and every child's effective position updates automatically, with zero
per-child recalculation written by hand. The cost is exactly what the
next unit weighs directly: choosing *which* `ViewGroup` arranges a given
set of children is a real design decision, not a default to accept
blindly.

### CS Lens

A `ViewGroup` containing `View`s, some of which are themselves
`ViewGroup`s containing more `View`s, is a **tree data structure**: one
root, and every node either a leaf (an ordinary `View`, no children) or
an internal node (a `ViewGroup`, one or more children).

Also recognized in: the HTML DOM (an `<div>` containing more elements is
exactly this same shape), a filesystem's folders and files, an
organization's reporting chart, and any parser's abstract syntax tree.

---

## Concept Unit: Choosing a Layout Container — `LinearLayout` vs. `ConstraintLayout`

### The Problem

`ConstraintLayout` is the root `ViewGroup` the wizard chose for you by
default. It is not the only option, and understanding *why* there's more
than one kind of container — and what each one is actually good at — is
real engineering judgment, not trivia. This project's login screen needs
several rows stacked vertically: a title, a username field, a password
field, and two buttons. Two real, commonly used containers can do this,
and they solve the "where does each child go" problem in genuinely
different ways.

### Option 1: `LinearLayout`

```xml
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp">

    <!-- children placed here stack top-to-bottom, in the exact order written -->

</LinearLayout>
```

`LinearLayout` arranges its children along a single axis — either
`vertical` (top to bottom) or `horizontal` (left to right), set by the
`android:orientation` attribute — strictly in the order they appear in
the XML. Each child's position is entirely determined by what came before
it: child 3 sits directly below wherever child 2 ended. There is no way
to say "put this view in the exact center" or "anchor this to the
right edge regardless of what's above it" — `LinearLayout` doesn't have a
concept of arbitrary positioning, only sequential stacking.

**`android:padding="24dp"`** — **first appearance.** Padding is space
reserved *inside* a `ViewGroup`'s own edge, pushing all its children
inward from the boundary. `24dp` uses **`dp`** (density-independent
pixel) — a unit that scales with a screen's actual pixel density, so a
size specified in `dp` renders as roughly the same physical size on a
low-density and a high-density screen, unlike a raw pixel count which
would look tiny on a dense screen and huge on a sparse one.

### Option 2: `ConstraintLayout`

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res/app"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <!-- each child declares its own constraints, independent of sibling order -->

</androidx.constraintlayout.widget.ConstraintLayout>
```

`ConstraintLayout` has no built-in "stack them in order" behavior at all.
Instead, every child must declare **constraints**: rules like "my left
edge is attached to my parent's left edge" or "my top edge is attached to
this other view's bottom edge." A child with no constraints on one side
is genuinely undefined on that side — nothing stacks automatically. This
is more verbose per-child, but it can express layouts `LinearLayout`
cannot: two views centered relative to each other regardless of their
size, a view anchored to the exact center of the screen, or a view whose
position depends on a sibling that isn't its immediate predecessor in the
XML.

### The Tradeoff

`LinearLayout`'s stacking model is simpler to read and write for a
straightforward vertical form — which is exactly what a login screen is —
at the cost of no built-in way to express relationships other than
sequential order. `ConstraintLayout` can express any arrangement,
including ones `LinearLayout` genuinely cannot, at the cost of every
child needing explicit constraint attributes even for the simple "stack
these vertically" case `LinearLayout` gives you for free via one
`orientation` attribute.

**This series builds the login screen with `LinearLayout`,** because a
simple vertical form is exactly the case it's built for, and the constant
per-child constraint bookkeeping `ConstraintLayout` requires would be
pure overhead here with no expressive benefit. If your own app's login
screen needs a more elaborate arrangement later — overlapping elements, a
logo positioned independent of the form fields below it — `ConstraintLayout`
is the real tool for that job, and the shape above is a genuine, complete
starting point for it.

### Project Change

- **Reference Source:** No reference counterpart to cite — this is a
  standard layout file the project's own build already expects at this
  path; there's no external framework source to quote for a file you're
  authoring yourself, only for the built-in classes (`LinearLayout`) it
  references.
- **Files affected:** `app/src/main/res/layout/activity_main.xml`
  (already exists, generated by the wizard).
- **Change type:** Replace the entire contents.
- **Location:** Whole-file replacement — the wizard's `ConstraintLayout`
  root and its one `TextView` are both removed.
- **Dependencies:** None new.

### The New Code

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp"
    android:id="@+id/loginRoot">

</LinearLayout>
```

### The Updated Project

This is the entire new contents of `activity_main.xml` — nothing else in
the file yet; the next lesson adds the actual title, fields, and buttons
inside this empty container.

### Mechanical Walkthrough

- `<?xml version="1.0" encoding="utf-8"?>` — **first appearance.** Every
  XML file opens with this declaration, stating the XML version and text
  encoding in use; Android Studio generates it automatically and it's
  never edited by hand.
- `<LinearLayout ...>` — **first appearance**, the container just chosen
  above.
- `xmlns:android="..."` — **first appearance.** An XML namespace
  declaration — it's what makes the `android:` prefix on every following
  attribute resolve to Android's own attribute definitions, rather than
  being an arbitrary, undefined prefix. Every Android layout file needs
  this exact line, once, on its root element.
- `android:layout_width="match_parent"`, `android:layout_height="match_parent"`
  — **first appearance.** Every `View` must declare how much space it
  wants along each axis. `match_parent` means "take up all the space my
  parent is willing to give me" — here, the whole screen, since this
  `LinearLayout` is the root.
- `android:orientation="vertical"` — as explained above: children stack
  top to bottom.
- `android:padding="24dp"` — as explained above: reserves 24 density-
  independent pixels of space inside every edge.
- `android:id="@+id/loginRoot"` — **first appearance.** `@+id/` is
  special XML syntax meaning "generate a new, unique identifier named
  `loginRoot` for this specific `View`." The `+` specifically means "this
  ID doesn't exist yet — create it" (referencing an *existing* ID later
  uses `@id/loginRoot` without the `+`). This ID isn't used by anything
  yet — it exists so a later lesson's Java code can look this specific
  `View` up by name, the same way `System.out` in Lesson 01 was a
  specific, findable object rather than an anonymous one.

### Run It Yourself

Run the app on an emulator or device. Real result: a blank white screen
— no crash, no visible content, because this `LinearLayout` has no
children yet. This is the expected, correct state: proof the empty
container itself compiles and inflates without error before the next
lesson adds real content inside it. Compare it directly against the
wizard's original `ConstraintLayout` + `TextView` from Lesson 05 — the
one visible difference right now is that the placeholder text is gone,
confirming the whole-file replacement really did take effect.

### SE Lens

**Why does Android force every dimension to be declared explicitly
(`match_parent`, or a fixed size, or `wrap_content`) instead of just
picking a sensible default the way a website's CSS might size a
`<div>` to its content automatically?** The alternative — implicit
sizing — works fine for a single screen size, and becomes a real problem
across the enormous range of physical screen sizes and pixel densities
Android devices actually ship in, from small phones to large tablets.
Forcing an explicit sizing decision on every `View`, this early, means a
layout's behavior is predictable and testable on any device, rather than
"probably fine, but no one checked it on a 4-inch screen." The cost is
exactly what you just typed: two extra attributes on every single view,
forever.

---

## Connect the Pieces

One trace: `setContentView(R.layout.activity_main)` — a line you've
already read since Lesson 05, and now understand fully — takes this XML
file, parses its tree (`LinearLayout` as root, currently no children),
and builds real `View` objects from it, handing the finished tree to the
Activity to display. Right now that tree has exactly one node.

## What Breaks Without This

Delete `android:layout_width` from the `LinearLayout` element (leave
`layout_height` in place) and run the app. Real result: the build fails
before the app even installs, with an XML validation error naming
`layout_width` as a required attribute missing from `LinearLayout`.
Restore the attribute before moving on.

## Exercises

1. Change `android:orientation` from `vertical` to `horizontal`, add two
   plain `<View android:layout_width="40dp" android:layout_height="40dp"
   android:background="#FF0000" />` elements as children (a `View` with no
   content, just a colored rectangle), and run the app. Confirm they sit
   side by side rather than stacked, proving orientation's effect
   directly rather than by description alone.
2. Swap the root back to `ConstraintLayout` temporarily, add the same two
   colored `View`s with no constraints at all, and run the app. Observe
   that with no constraints, their position is genuinely undefined — this
   is the concrete cost of `ConstraintLayout`'s flexibility discussed
   above. Revert back to the `LinearLayout` version afterward.

## Definition of Done

- [ ] You can explain the difference between `View` and `ViewGroup` in
      your own words.
- [ ] You can state, concretely, one thing `ConstraintLayout` can express
      that `LinearLayout` cannot, and one reason `LinearLayout` is
      simpler for this project's login screen specifically.
- [ ] You ran the app with the missing `layout_width` and saw the real
      build failure.
- [ ] You ran the horizontal-orientation exercise and saw two views sit
      side by side.
- [ ] `activity_main.xml` now contains the empty `LinearLayout` shown
      above, and the app still builds and runs (showing a blank screen —
      expected, since it has no children yet).
- [ ] Commit: `git commit -m "Replace generated ConstraintLayout with an
      empty vertical LinearLayout for the login form"` — explaining the
      layout choice, not just the file change.

Next: filling this container with the real title, username field,
password field, and buttons the login screen needs.
