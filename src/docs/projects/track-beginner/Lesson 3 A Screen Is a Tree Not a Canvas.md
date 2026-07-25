# Lesson 3: A Screen Is a Tree, Not a Canvas

> **Revised 2026-07-25** — added `android:id="@+id/main"` to the root
> layout (needed by Lesson 2c's code). Headings marked `(revised
> 07/25)` below (check "On This Page" in the sidebar) are exactly what
> changed — no need to reread the rest. Full detail in `CHANGELOG.md`
> in this folder.

**What you will build:** A real home screen for Pocket Inventory — a
title and a button — replacing the wizard's placeholder "Hello World"
text. The transferable problem: Android doesn't let you draw at
arbitrary x/y pixel coordinates the way a `<canvas>` or a game engine
does. Every screen is a **tree of nested view objects**, each one's
size and position defined *relative to* its siblings and parent, never
as an absolute point. Today you learn why that constraint exists and
how to work with it instead of against it.

**What you need to know first:** Lesson 2c — specifically,
`setContentView(R.layout.activity_main)`, which calls into a layout
file. Lesson 2e — `R.layout.activity_main` is a generated reference to
that same file. You haven't yet opened `activity_main.xml` itself —
that's this lesson. No new Java concepts appear in this lesson at
all — it's an entirely different file format (XML, first explained in
Lesson 2b) describing a screen as data instead of code.

---

## Concept Unit: XML Layouts Are Declarative View Trees

### The Problem

`setContentView` takes a reference to a *layout resource*, not a
function that draws pixels. What is actually inside that resource, and
why is a UI described as data (XML) instead of code?

### Project Change

- **Reference Source:** No reference counterpart — inspecting the
  wizard-generated file.
- **Files affected:** `app/src/main/res/layout/activity_main.xml`.
- **Change type:** Inspect, then modify.

### The New Code (revised 07/25 — root now has an id)

Open `activity_main.xml`. Depending on your Android Studio version
you'll see either a design preview or raw XML — click the **Code** tab
if it opens in Design view. You'll see something close to:

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/main"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <TextView
        android:id="@+id/textView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello World!"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

(`android:id="@+id/main"` on the root — newer Android Studio versions
add this by default. It's what lets `MainActivity.java`'s
`findViewById(R.id.main)` find this exact layout, covered fully back in
Lesson 2c's edge-to-edge Concept Unit. If your generated file doesn't
have it, you don't need it either — it's only there to support code
your version of the wizard also generated.)

### The Updated Project

That's the complete file as generated — nothing larger it sits inside,
so there's no bigger structure to show yet. As a whole, this file
describes: one `ConstraintLayout` filling the entire screen, containing
one `TextView`, positioned by four constraints that each say "align
this edge to the matching edge of my parent."

### Mechanical Walkthrough

- `<androidx.constraintlayout.widget.ConstraintLayout>` — **first
  appearance.** The root of the tree. Notice it's referenced by a full
  class path, exactly like the Manifest's `.MainActivity` — this is
  the same Java package-naming concept from Lesson 1, just inside XML
  now: this tag literally instantiates a real Java class from the
  ConstraintLayout library (Lesson 2a's "class is a blueprint, `new`
  builds an object from it" — this tag is XML's way of asking Android
  to build one, without you writing `new ConstraintLayout()` yourself).
- `android:layout_width="match_parent"`, `android:layout_height="match_parent"`
  — **first appearance, as a pair.** Every view *must* specify both.
  `match_parent` means "be exactly as large as whatever contains me."
  There is no way to say "be at position (50px, 100px)" — size and
  position are these relative declarations, never absolute pixels.
- `<TextView ...>` — **first appearance.** A view that displays text —
  the XML-declared equivalent of a label.
- `android:id="@+id/textView"` — **first appearance.** The `+` (as
  opposed to plain `@id/...`) means "this ID doesn't exist yet in `R`
  — generate it." This is the mechanism by which new entries appear in
  the generated `R.java` file from Lesson 2e: every `@+id/` you write
  becomes a new constant Android Studio adds to `R.id`.
- `android:layout_width="wrap_content"`, `android:layout_height="wrap_content"`
  — **reappearing concept** (same width/height pair idea as the
  parent), new value: `wrap_content` means "be exactly as large as my
  own content needs, no larger."
- `android:text="Hello World!"` — **first appearance.** Directly sets
  the displayed string. (You'll later learn why hardcoding a string
  literal like this, instead of a `@string/` resource reference the
  way the Manifest did with `app_name` back in Lesson 2b, is considered
  bad practice — flagged for a later lesson, not explained here to
  avoid a second new concept riding along with this one.)
- `app:layout_constraintBottom_toBottomOf="parent"` (and its three
  siblings: `Left`, `Right`, `Top`) — **first appearance, as a group.**
  This is the actual concept the lesson is named for. Each line reads
  as a sentence: "constrain *my* bottom edge to *parent's* bottom
  edge." All four together, each anchored to the opposite edge of the
  parent, is what centers the TextView — not by computing a coordinate,
  but by describing four independent relationships and letting the
  layout engine solve for a position that satisfies all of them
  simultaneously.

### CS Lens

This is a **constraint satisfaction system** — you declare relationships
that must hold, and a solver (not you) computes concrete values that
satisfy them. Also recognized in: CSS Flexbox/Grid layout, spreadsheet
formula recalculation, SAT solvers, and physics engine constraint
solvers (a hinge joint declared, not manually animated frame-by-frame).

### SE Lens

**Why constraints instead of just letting you set `x` and `y`
directly** (which Android technically *can* do, via absolute
positioning APIs, but actively discourages for whole-screen layouts)?
The alternative — fixed pixel coordinates — breaks the instant your
layout runs on a different screen size, which on Android is
guaranteed: phones range from small budget devices to large tablets,
in both portrait and landscape. A coordinate that looks right on your
emulator can put a button off-screen entirely on someone else's phone.
Constraints describe *relationships* that remain valid regardless of
the actual screen dimensions, at the cost of a steeper mental model —
you're not placing things, you're describing rules and trusting a
solver, which is genuinely less intuitive at first than "put it at
(100, 200)."

---

## Concept Unit: `dp` and `sp` — Density-Independent Units

### The Problem

You'll see `dp` used for sizes elsewhere in Android (not yet in this
minimal file, but you'll add it shortly) and `sp` for text. Why not
just use pixels, like `width="24px"`?

### Introduce the Concept in Isolation

No code lab needed here — this is a conceptual unit, not a syntax one.
Two real phones can have wildly different physical pixel densities for
the *same physical screen size* — one might pack 400 pixels into an
inch, another 550. A view defined as `"48px"` wide would look
noticeably smaller, in real-world terms, on the higher-density phone.

`dp` ("density-independent pixels") is a unit that Android
automatically scales per-device so the same `dp` value produces
roughly the same *physical* size on screen, regardless of pixel
density. `sp` ("scale-independent pixels") does the same thing but
additionally respects the user's system-wide font size accessibility
setting — which is exactly why text sizes use `sp` and everything else
uses `dp`, never the reverse.

### Mechanical Walkthrough

No code fence to enumerate here — this unit introduces two unit
*suffixes*, not new syntax, so the walkthrough is the two of them,
each on its own:

- `dp` — **first appearance.** Attached to a size value (`android:layout_width`,
  `android:layout_marginTop`, and similar attributes) — Android scales
  the physical size it renders to per-device, so the same `dp` number
  looks the same real-world size on a low-density and a high-density
  screen.
- `sp` — **first appearance.** Same per-device scaling as `dp`, plus
  one more factor: the user's OS-level "text size" accessibility
  setting. Used specifically for `android:textSize`, never for
  anything else — a margin or width scaling with the user's font-size
  preference would be a layout bug, not an accessibility feature.

### CS Lens

This is **resolution independence via a virtual unit layer** — the
same idea as vector graphics (SVG) scaling cleanly versus raster
images pixelating, or "points" in print/PDF layout being resolution-
independent of a specific printer's DPI.

### SE Lens

**Why not let every device just report its native pixels and have
developers do the math themselves?** That's literally what early
mobile UI toolkits sometimes did, and it produced constant per-device
bug reports ("looks fine on my phone, broken on yours"). Baking the
density conversion into the unit itself, at the OS level, moves that
correction out of application code entirely — the cost is one more
unit system to keep straight (`px` vs `dp` vs `sp`), and genuine bugs
happen when a developer accidentally hardcodes `px` out of habit from
web development.

---

## Concept Unit: Building the Real Home Screen

### The Problem

Time to replace the placeholder with your actual home screen: a title
and a button to open the inventory (the button won't do anything
yet — that's Lesson 4, Intents).

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `app/src/main/res/layout/activity_main.xml`
  (replace contents).
- **Change type:** Replace.
- **Dependencies:** none new.

### The New Code (revised 07/25 — root now has an id)

Replace the entire file with:

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/main"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <TextView
        android:id="@+id/titleText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="64dp"
        android:text="Pocket Inventory"
        android:textSize="28sp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <Button
        android:id="@+id/openInventoryButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Open Inventory"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginBottom="64dp" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### The Updated Project

This replaces the file wholesale, so there's no larger surrounding
structure — this file *is* the whole layout resource, same as before,
just with real content: two children (`titleText`, `openInventoryButton`)
instead of the placeholder `TextView`, each independently constrained
to the parent's edges.

### Mechanical Walkthrough (revised 07/25 — one bullet added)

- `android:id="@+id/main"` on the root — **reappearing**, carried over
  unchanged from the placeholder file's own root (earlier in this
  lesson) — replacing the whole file doesn't mean starting the root's
  attributes from nothing; this one specifically has to survive the
  replacement, since `MainActivity.java`'s edge-to-edge code (Lesson
  2c) looks it up by this exact id.
- `android:layout_marginTop="64dp"` — **first appearance.** A margin
  pushes a view *away* from whatever it's constrained to, using the
  `dp` unit from the previous unit — this is that concept's first real
  use.
- `android:textSize="28sp"` — **reappearing concept** (`sp` from the
  unit above), first real use.
- `app:layout_constraintStart_toStartOf="parent"` /
  `...End_toEndOf="parent"` — **reappearing concept** (same constraint
  idea as `Left`/`Right` in the placeholder file), new terms worth a
  clause: `Start`/`End` mean the same as `Left`/`Right` in
  left-to-right languages, but automatically flip in right-to-left
  languages (like Arabic or Hebrew) — preferred over `Left`/`Right` for
  exactly that reason.
- `<Button ...>` — **first appearance.** A tappable view; structurally
  declared the same way as `TextView`, just a different view class
  with built-in tap-visual-feedback behavior you get for free.
- Only constraining `titleText`'s *top* to parent, and only
  constraining the button's *bottom* to parent (rather than every
  edge, like the placeholder did) — **first appearance of a real
  design decision**: each view is pinned to one edge and centered
  horizontally, letting `wrap_content` handle the other dimension
  naturally, instead of over-constraining every edge the way the
  auto-generated placeholder did.

### SE Lens

**Why constrain only one edge of `titleText` and one edge of the
button, when the placeholder file constrained all four?** More
constraints aren't automatically safer — they can actively fight each
other. `titleText` only needs a top anchor and horizontal centering;
its height and width are already handled by `wrap_content` sizing to
the text itself, so adding a bottom constraint too would either be
redundant (agreeing with what `wrap_content` already produces) or, if
the numbers ever disagreed, would force the solver to satisfy two
competing demands on the same edge at once — genuinely unsatisfiable,
and a real source of `ConstraintLayout` build warnings in practice.
The engineering rule that falls out of this: constrain exactly the
edges a view's position actually depends on, and let `wrap_content`
own the rest — over-constraining trades a small amount of apparent
extra "safety" for a real, recurring category of layout conflicts.

### Run It

Build and run. You should see "Pocket Inventory" near the top and an
"Open Inventory" button near the bottom, both horizontally centered.
Rotate the emulator to landscape (Ctrl+F11 on most setups) and confirm
both elements re-center correctly without you writing any
orientation-specific code — this is the constraint system doing
exactly the job described in the SE Lens above, live.

---

## Connect the Pieces

Trace: `MainActivity.onCreate()` (Lesson 2c) calls
`setContentView(R.layout.activity_main)` → `R.layout.activity_main`
resolves to this XML file (Lesson 2e) → the `ConstraintLayout` inflates
as a tree with two children → each child's constraints get solved
against the parent's actual on-screen size (whatever phone or emulator
it happens to be) → the same XML you wrote once produces a correctly
centered layout on every device, in both orientations, because you
described relationships, not coordinates.

## What Breaks Without This

Delete just the button's `app:layout_constraintBottom_toBottomOf="parent"`
line and run the app. Read the actual error Android Studio's build
gives you (ConstraintLayout requires enough constraints to determine
position — an unconstrained view is a build-time or layout-time
problem, not a silent visual bug). Restore the line afterward.

## Exercises

1. Add a third view — an `ImageView` for a placeholder logo — between
   the title and the button, constrained below the title and above the
   button (`app:layout_constraintTop_toBottomOf="@id/titleText"` and
   `app:layout_constraintBottom_toTopOf="@id/openInventoryButton"`).
   You'll need an actual drawable; use
   `android:src="@android:drawable/ic_menu_gallery"` as a
   system-provided placeholder for now.
2. Change every `dp`/`sp` value in the file to raw numbers with no
   unit and see what Android Studio's editor does (it should flag
   this) — confirming for yourself that the unit isn't optional
   decoration.

## Definition of Done

- [ ] Your home screen shows a real title and a real button, not the
      wizard placeholder.
- [ ] You rotated the emulator and watched the layout re-center itself
      with no code changes.
- [ ] You broke the button's constraint on purpose and read the real
      error before fixing it.
- [ ] You can explain, in your own words, why `dp` isn't just "Android's
      word for pixels."
- [ ] Commit: message explaining why (e.g. "Replace placeholder layout
      with real home screen title and button, using ConstraintLayout
      relative positioning for cross-device consistency").

Lesson 4 is next: wiring the button to actually navigate to a second
screen — Intents, a second Activity, and the back stack.
