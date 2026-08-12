# Lesson 02a: Choosing a Layout Panel for the Shape You Actually Have

*(Prepended after Lesson 2 — see `CURRICULUM_NOTES.md`'s 2026-08-10
audit. Every lesson in this course after this point uses `Grid` and
`StackPanel` exclusively, which teaches those two panels deeply but
never once mentions that WPF ships several other standard layout
panels, each solving a real layout shape `Grid`/`StackPanel` solve
awkwardly or not at all. A professional needs to recognize all of them
and choose deliberately, not default to `Grid` for every shape out of
never having learned the alternatives.)*

**Developer Story**
> As a developer, I want to know every standard tool in WPF's own
> layout toolbox — not just the two this course happens to use — so
> that reaching for `Grid` everywhere is a deliberate choice, not the
> only shape I know how to build.

**What you will build**
Four small, throwaway labs — one per panel — each discarded once
proven, the same way Lesson 05a's `enum` lab was. Nothing here becomes
part of Pocket Inventory's real code; this project's own screens keep
using `Grid` and `StackPanel`, and each lab ends by naming exactly why,
for that panel, `Grid`/`StackPanel` was the right choice all along, or
would not have been.

**What you need to know first**
Lesson 2: `Grid`, rows/columns, and the visual tree. Lesson 4 (`StackPanel`
is used from Lesson 1 onward, per the Repetition Rule already
established by this course's own Terms sections).

**Terms introduced in this lesson:**
- **Layout panel selection** — the professional practice of naming the
  actual shape a layout needs (edges-plus-fill, flowing/wrapping,
  absolute coordinates, forced-equal cells) before writing markup,
  instead of reaching for whichever panel was used most recently.

**Objects and methods used**
- **`DockPanel`** — arranges children against the edges of its own
  space, in declaration order, with the last child filling whatever
  remains. Full lab, real output, mechanical walkthrough, both lenses:
  `wpf-dockpanel.md`.
- **`WrapPanel`** — flows children in a line that wraps onto a new row
  (or column) once it runs out of room, unlike `Grid`/`StackPanel`.
  Full lab, real output, mechanical walkthrough, both lenses:
  `wpf-wrappanel.md`.
- **`Canvas`** — places children at exact, explicit `(Left, Top)`
  coordinates instead of computing a position, the deliberate exception
  among WPF's layout panels. Full lab, real output, mechanical
  walkthrough, both lenses: `wpf-canvas.md`.
- **`UniformGrid`** — divides its space into `Rows × Columns`
  equal-sized cells and fills them in declaration order automatically,
  with no `RowDefinitions`/`ColumnDefinitions` block. Full lab, real
  output, mechanical walkthrough, both lenses: `wpf-uniformgrid.md`.
- None of these four are used by this project's own real screens —
  `Grid`/`StackPanel` remain what Pocket Inventory actually builds
  with; this lesson exists so that choice stays deliberate, not
  default.

---

## Concept Unit: `DockPanel` — Edges, Then Whatever's Left

### The Problem

Pocket Inventory's own header (Lesson 2) is a `Grid` with three explicit
columns: Back button, brand icon, title. That works because exactly
three fixed-width-or-star pieces sit in one row, permanently. A window
shaped instead like "toolbar pinned to the top, status bar pinned to
the bottom, content filling everything left over" — an extremely common
application shell shape — is possible in a `Grid`, but only by manually
computing row heights that add up correctly; a purpose-built tool for
exactly this shape exists.

### Introduce the Concept in Isolation

Full lab, real output, and mechanical walkthrough:
`wpf-dockpanel.md`.

Run it yourself before continuing — the rest of this unit assumes you
have.

### Discard the Throwaway Example

Delete the `ConceptDemo` project. Nothing about it enters Pocket
Inventory.

### Mechanical Walkthrough

Rebuilt as a `DockPanel`, Pocket Inventory's real `MainWindow.xaml` outer
shell (Lesson 2) would read:

```xml
<DockPanel>
    <Border DockPanel.Dock="Top" Background="{StaticResource BrandColorBrush}">
        <!-- header content -->
    </Border>
    <Frame x:Name="MainFrame" />
</DockPanel>
```

- `<DockPanel>` — (hard concept reappearing, per this unit's own
  isolated lab in `wpf-dockpanel.md`) replaces the real project's outer
  `Grid` with two `RowDefinitions`.
- `DockPanel.Dock="Top"` — (hard concept reappearing) the same attached
  property from the lab, now docking the *header* rather than a labeled
  `TextBlock`.
- `<Frame x:Name="MainFrame" />` — this project's real, already-existing
  navigation host (Lesson 3), unchanged — it becomes `DockPanel`'s
  automatic last-child-fills element with no `DockPanel.Dock` of its own,
  the same role the real project's second `RowDefinition` currently
  plays.

This is a real, buildable alternative to Lesson 2's actual markup — not
executed against the real project, since Lesson 2's own `Grid` already
works and nothing downstream depends on switching it.

### CS Lens

Per `wpf-dockpanel.md`: `DockPanel`'s edge-then-fill arrangement is a
greedy, order-dependent allocation, the same shape as CSS's
`float: left`/`float: right` or Java Swing's `BorderLayout`.

### SE Lens

Pocket Inventory's own header (Lesson 2) needs `Grid.Column`-precise
placement of three specific pieces side by side — Back button, brand
icon, title — which is exactly the shape `Grid` is built for and
`DockPanel` is not (`DockPanel` arranges by edge, not by an explicit
column index). The real professional judgment call here isn't "which
panel is better" in the abstract — it's recognizing "I have three fixed
pieces in one row" (→ `Grid`) versus "I have edges plus a filling
middle" (→ `DockPanel`) as two different shapes needing two different
tools. The outer shell shown above (header docked top, `Frame` filling
the rest) is a case where `DockPanel` genuinely would have worked just
as well as the `Grid` Lesson 2 actually used — a real example of two
valid tools for the same job, not every panel choice being a hard
constraint.

### Connection

The next unit covers a shape neither `Grid` nor `DockPanel` handles
well: an unknown, resizable number of same-sized items that need to
flow and wrap.

---

## Concept Unit: `WrapPanel` — Flowing and Wrapping

### The Problem

Epic 4 (Lesson 12 onward) adds category filtering to Pocket Inventory.
Imagine, instead of this project's actual `ComboBox` dropdown, a row of
category filter buttons — Electronics, Furniture, Kitchenware, and
however many more categories a user's real inventory ends up needing.
`StackPanel` would just keep growing wider forever, off the edge of the
window; `Grid` would need to know the exact category count ahead of
time to divide columns correctly. Neither shape fits "an unknown number
of same-sized items that should flow and wrap."

### Introduce the Concept in Isolation

Full lab, real output, and mechanical walkthrough: `wpf-wrappanel.md`.

### Discard the Throwaway Example

Delete the `ConceptDemo` project.

### Mechanical Walkthrough

A `WrapPanel`-based alternative to Pocket Inventory's real `ComboBox`
category filter (Lesson 12) would read:

```xml
<WrapPanel>
    <ToggleButton Content="Electronics" Margin="4" />
    <ToggleButton Content="Furniture" Margin="4" />
    <ToggleButton Content="Kitchenware" Margin="4" />
</WrapPanel>
```

- `<WrapPanel>` — (hard concept reappearing, per `wpf-wrappanel.md`'s
  own lab) hosting one child per category, generated from the real
  project's own category list (the same `Enum.GetValues` source Lesson
  12's real `ComboBox` binds to) instead of a hand-typed, fixed count.
- `<ToggleButton Content="Electronics" .../>` — a real WPF control
  (not covered by this unit — a checkbox-shaped button that stays
  visually pressed once clicked) standing in for what an actual
  multi-select filter row would use instead of `ComboBox`'s
  single-selection dropdown item.

Not built against the real project: Lesson 12's `ComboBox` already
implements category filtering, and nothing later in this course depends
on replacing it.

### CS Lens

Per `wpf-wrappanel.md`: `WrapPanel` is a greedy line-breaking algorithm,
the same shape a word processor or browser uses wrapping text onto a
new line — computed fresh against currently-available width, never a
fixed, precomputed count.

### SE Lens

Pocket Inventory's actual category filter (built starting Lesson 12)
uses a `ComboBox` instead of a row of buttons — a deliberate, different
tradeoff (one selection at a time, via a dropdown, instead of several
simultaneously-visible toggle buttons), not a `WrapPanel` left out by
oversight. A `WrapPanel`-based filter bar is a completely reasonable
alternative design for the exact same feature; naming that alternative,
concretely, is the point of this unit — recognizing when a design
decision (`ComboBox` vs. a flowing button row) was made, versus assuming
whatever this course actually built was the only option.

### Connection

Both `DockPanel` and `WrapPanel` still compute a child's position
relative to the others. The next unit covers the deliberate opposite:
a panel that computes nothing at all.

---

## Concept Unit: `Canvas` — When Nothing Should Be Computed

### The Problem

Every panel this course has used, including the two just covered,
computes each child's actual on-screen position from some rule — rows,
docked edges, flow order. Some content — a hand-drawn diagram, a map
marker, a custom chart — needs the opposite: placing something at an
exact coordinate, with no panel logic recomputing that position ever.

### Introduce the Concept in Isolation

Full lab, real output, and mechanical walkthrough: `wpf-canvas.md`.

### Discard the Throwaway Example

Delete the `ConceptDemo` project.

### Mechanical Walkthrough

Epic 8's dashboard (Lesson 33) shows category totals as plain text rows.
A `Canvas`-based bar chart for that same data — a real, if speculative,
use `Canvas` would actually fit — would place one `Rectangle` per
category:

```xml
<Canvas>
    <Rectangle Canvas.Left="0"  Canvas.Bottom="0" Width="40" Height="120" Fill="CornflowerBlue" />
    <Rectangle Canvas.Left="50" Canvas.Bottom="0" Width="40" Height="80"  Fill="IndianRed" />
</Canvas>
```

- `<Canvas>` — (hard concept reappearing, per `wpf-canvas.md`'s own lab)
  hosting bars whose height would come from each category's real
  computed total (Lesson 30's `SUM()` query), not a hand-typed number.
- `Canvas.Left`/`Canvas.Bottom` — (hard concept reappearing) each bar's
  horizontal position and its height both need to be *computed from
  data*, in C#, before the `Rectangle` is created — the exact opposite
  of `Grid.Row`, which only ever takes a small, fixed, hand-typed index.

Not built against the real project: this course's dashboard (Lesson 33)
uses plain text, and no later lesson depends on a chart existing.

### CS Lens

Per `wpf-canvas.md`: `Canvas` is absolute, coordinate-based positioning
— the same model as HTML/CSS's `position: absolute`, or any raw
pixel-buffer graphics API.

### SE Lens

Nothing in Pocket Inventory's current 54-lesson scope needs absolute
coordinates — every screen this project builds is ordinary application
UI (forms, lists, a grid), which is exactly the case `Canvas`'s own SE
Lens names as the wrong fit for it. A bar chart is the one plausible
place in this project's own roadmap `Canvas` would earn its keep — every
bar's position is genuinely data-computed, not a fixed layout a
constraint-based panel could express more easily. That's the real
distinguishing question for reaching for `Canvas` at all: not "is this
a picture," but "does placing this thing require a number my own code
computed, rather than a row, a column, or a docked edge."

### Connection

The last unit returns to computed positioning, for the specific case of
equal-sized cells filled in a fixed, predictable order.

---

## Concept Unit: `UniformGrid` — Equal Cells, Inferred

### The Problem

A calculator's keypad, a photo grid, or a fixed toolbar of same-sized
icon buttons all share one shape: N children, all the same size,
filling a grid of equal cells in reading order — a real `Grid` can do
this, but only by writing an explicit `RowDefinitions`/`ColumnDefinitions`
block and a `Grid.Row`/`Grid.Column` pair on every single child, for a
layout with no genuinely irregular cells anywhere in it.

### Introduce the Concept in Isolation

Full lab, real output, and mechanical walkthrough: `wpf-uniformgrid.md`.

### Discard the Throwaway Example

Delete the `ConceptDemo` project.

### Mechanical Walkthrough

A `UniformGrid`-based alternative to Epic 11's real bulk-action toolbar
(Lesson 43) would read:

```xml
<UniformGrid Rows="1" Columns="3">
    <Button Content="Edit" Margin="4" />
    <Button Content="Delete" Margin="4" />
    <Button Content="Duplicate" Margin="4" />
</UniformGrid>
```

- `<UniformGrid Rows="1" Columns="3">` — (hard concept reappearing, per
  `wpf-uniformgrid.md`'s own lab) forcing all three buttons to the exact
  same width — the widest label's width, applied to every cell.
- `<Button Content="Edit" .../>` — this project's real, already-taught
  `Button`, unchanged; only the parent panel differs from the real
  project's actual `StackPanel`-based version.

Not built against the real project: this course's real toolbar (Lesson
43) already ships with `StackPanel`, for the reason named below.

### CS Lens

Per `wpf-uniformgrid.md`: `UniformGrid` is grid layout with the
structure inferred from child count instead of declared explicitly — a
specialization of the same divide-space-first idea `Grid` itself uses.

### SE Lens

Epic 11's bulk-action toolbar (Lesson 43 onward) is a small row of
same-sized action buttons — Edit, Delete, Duplicate — a real candidate
for `UniformGrid` instead of the `StackPanel` this course actually
builds it with. The tradeoff named in `wpf-uniformgrid.md`'s own SE Lens
applies directly: `StackPanel` was the right choice here specifically
*because* this toolbar never needs forced-equal cell widths — each
button sizing to its own content (as `StackPanel` allows and
`UniformGrid` would not) is exactly the behavior wanted for buttons with
different label lengths ("Edit" and "Duplicate" are not the same width,
and forcing them to be would only waste space around the shorter one).

### Connection

Four panels, four genuinely different shapes: edges-plus-fill
(`DockPanel`), flow-and-wrap (`WrapPanel`), absolute coordinate
(`Canvas`), and forced-equal cells inferred from count (`UniformGrid`) —
alongside `Grid` (explicit structure) and `StackPanel` (one dimension,
unbounded), the two this course actually builds with. Six real tools,
not two.

---

## Closing

### Connect the Pieces

Every layout decision in this course so far — the header's three-column
`Grid`, every screen's `StackPanel`-stacked form fields — was a real
choice among alternatives, even where this course never named the
alternatives explicitly until now. `DockPanel` would have fit the
header's outer shell (if it weren't for the header's own precise
column-by-column layout); `WrapPanel` would fit an unbounded, flowing
category filter; `Canvas` would fit a future hand-drawn visualization;
`UniformGrid` would fit a fixed, equal-sized action toolbar. Naming all
six, and which shape each one actually solves, is what turns "I used a
`Grid` because that's what I know" into "I used a `Grid` because I have
three fixed pieces in a row, and I know what I'd reach for if I didn't."

### What Breaks Without This

Build the `DockPanel` lab from this lesson but set
`LastChildFill="False"` and remove every child's own `DockPanel.Dock`
value. Real, observable result: every child stacks at `(0, 0)`, sized to
its own content, heavily overlapping — proof that a panel's automatic
placement behavior is a real, specific mechanism that stops working the
instant its actual conditions (an edge assignment, or `LastChildFill`)
aren't met, not a general "make it look right" fallback.

### Exercises

- For each of the four panels covered here, name one additional
  real-world UI (outside Pocket Inventory) that shape fits well — not
  the example already given in that panel's own concept file.
- Rebuild Pocket Inventory's actual header (Lesson 2's three-column
  `Grid`) as a `DockPanel` in a scratch project, and confirm whether the
  result actually looks identical or reveals a real limitation the
  `Grid` version didn't have.
- `UniformGrid`'s and `WrapPanel`'s labs both arrange multiple
  same-sized buttons — run both side by side and write, in your own
  words, the one-sentence rule for choosing between them.

### Definition of Done

- [ ] You ran all four labs (`wpf-dockpanel.md`, `wpf-wrappanel.md`,
      `wpf-canvas.md`, `wpf-uniformgrid.md`) yourself and got their real,
      documented output.
- [ ] You can name, without re-reading this lesson, which of the six
      layout panels this course now covers fits: edges-plus-fill,
      flow-and-wrap, absolute coordinates, forced-equal-cells,
      explicit-structure, and one-dimension-unbounded.
- [ ] You completed the three Exercises above.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add Lesson 02a: survey WPF's full layout-panel toolbox, not just the two this course builds with"`.
