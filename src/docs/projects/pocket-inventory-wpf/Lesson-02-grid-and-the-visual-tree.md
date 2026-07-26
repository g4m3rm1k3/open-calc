# Lesson 2: A Layout Is a System, Not a Sequence

*(Grid and the Visual Tree)*

**User Story**
> As a user, I want the application to have a professional-looking layout.

**What you will build**
Lesson 1's `StackPanel` stacked three lines of text, one after another, with
no independent regions — a home screen for a hobby project, not a
professional-looking application. This lesson replaces it with a real
`Grid`: a header band with a small icon and the app title, a content area
that fills whatever space is left, and a footer, each one a genuinely
independent region rather than an item in a sequence. The transferable
problem underneath "make it look professional" is the difference between a
layout system that *reasons about available space* (rows and columns, sized
by rule) and one that simply places things one after another with no
concept of regions at all.

**What you need to know first**
Lesson 0: XAML as a declarative object tree, `x:Name`, static typing.
Lesson 1: `StackPanel`, string interpolation, and the `WelcomeMessage`
field this lesson keeps and relocates — you need the exact `MainWindow.xaml`
and `MainWindow.xaml.cs` Lesson 1 left behind, since this lesson edits both.

**Terms introduced in this lesson:**
- **Property element** (`<Grid.RowDefinitions>`) — XAML's tag syntax
  for setting a property whose value is too complex for a plain
  `name="value"` attribute (here, a list of rows), as opposed to
  writing it as an attribute directly on the tag.
- **`RowDefinition`** / **`ColumnDefinition`**, with **`Auto`** (as
  tall/wide as its content needs) and **`*`** (take all space not
  claimed by any other row/column) sizing — the rules a `Grid` uses to
  divide space, computed fresh every time the window resizes.
- **Constraint satisfaction** — declaring *rules* about how space
  should be divided (row/column sizes) and letting the layout system
  compute the actual pixel values, rather than computing and hardcoding
  those numbers yourself.
- **Attached property** (`Grid.Row`, `Grid.Column`) — a property owned
  by a parent (`Grid`) but set directly on a child (any element placed
  inside it); the storage genuinely lives with the parent, not the
  child, which is why it's meaningless outside that specific parent.
- **`Border`** — a simple control whose job is drawing a background
  and/or outline behind whatever it holds (or nothing, if used alone as
  a plain rectangle).
- **Hex color code** (`#2E5945`) — a color specified as three pairs of
  hexadecimal digits (red, green, blue), giving access to any color
  rather than only a fixed set of named ones.
- **Composition of independent coordinate systems** — nesting one
  layout container inside another so each one solves its own, local
  arrangement problem with zero knowledge of the other; the results
  combine automatically without either container needing to know the
  other exists.
- **Tree** — a data structure of **nodes**, where every node has
  exactly one **parent** except one special **root** node (which has
  none), and any number of **children**; a node with no children is a
  **leaf**. No node can (directly or indirectly) contain itself.
- **Visual tree** — WPF's own real name for the tree of nested elements
  a XAML file describes (`Window` → `Grid` → its children, and so on);
  not an analogy — the literal term WPF's own tooling (Visual Studio's
  Live Visual Tree window) uses for it.

---

## Concept Unit: `Grid.RowDefinitions` and Row Sizing

### The Problem

`StackPanel` has no idea what "a header" or "a footer" even means — it just
places children in order, each one taking exactly the height its own
content needs. A real header/content/footer layout needs the opposite
guarantee: the header takes only the space its content needs, the footer
does the same, and the content area gets *everything left over*, no matter
what size the window is resized to. `StackPanel` cannot express "give this
one region all the remaining space" at all; `Grid` can, but only once you
tell it how many rows exist and how each one should be sized.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-grid-rows
```

Replace the generated `MainWindow.xaml`'s `Grid` contents:

```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="80" />
        <RowDefinition Height="*" />
        <RowDefinition Height="80" />
    </Grid.RowDefinitions>

    <Border Background="LightBlue" />
    <Border Background="LightGreen" Grid.Row="1" />
    <Border Background="LightPink" Grid.Row="2" />
</Grid>
```

Run it:

```bash
dotnet run
```

Expected result, to verify yourself: a blue band exactly 80 pixels tall at
the top, a pink band exactly 80 pixels tall at the bottom, and a green band
filling every pixel of space in between — resize the window, and the blue
and pink bands stay exactly 80 pixels while the green band grows or shrinks
to absorb the difference.

*What this proves:* a fixed number (`80`) means exactly that many pixels,
always. `*` (the **star**, or "remaining space," size) means "take whatever
space is left over after every other row has taken what it asked for" —
this is a rule the `Grid` applies every time it's resized, not a value
computed once. `Grid.Row="1"` on the middle `Border` (unexplained here on
purpose — the next unit is entirely about what this line means) is what
told the `Grid` which row each child belongs to; nothing about a `Border`'s
own declaration order in the file determined that on its own.

### Discard the Throwaway Example
Delete the `lab-grid-rows` folder. `RowDefinition` and `*` sizing are not
discarded — they're about to build Pocket Inventory's real header/content/
footer layout.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  layout replacing Lesson 1's `StackPanel`.
- **Files affected:** `MainWindow.xaml`.
- **Change type:** Replace.
- **Location:** The `<Grid>` element's contents, currently holding Lesson
  1's `StackPanel`.
- **Dependencies:** None beyond Lesson 1's completed project.

### The New Code

```xml
<Grid.RowDefinitions>
    <RowDefinition Height="Auto" />
    <RowDefinition Height="*" />
    <RowDefinition Height="Auto" />
</Grid.RowDefinitions>
```

### The Updated Project

```xml
<Window x:Class="PocketInventory.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Pocket Inventory" Height="450" Width="800">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" /> <!-- ← new -->
            <RowDefinition Height="*" />    <!-- ← new -->
            <RowDefinition Height="Auto" /> <!-- ← new -->
        </Grid.RowDefinitions>
    </Grid>
</Window>
```

Lesson 1's `StackPanel` and its three `TextBlock`s are gone entirely — the
`Grid` now declares three rows and has no children placed in them yet. This
is intentionally a visibly empty window for one step; the next two units
put real content back, row by row.

### Mechanical Walkthrough
1. `<Grid.RowDefinitions>` — (first appearance) a **property element**, not
   an attribute this time — some XAML properties are too complex to fit as
   `name="value"` text (a *list* of rows can't be one attribute string), so
   XAML lets you write `<ParentElement.PropertyName>` as its own tag,
   containing whatever child elements that property actually needs. This is
   still setting the `Grid`'s `RowDefinitions` property — just with tag
   syntax instead of attribute syntax, because the value is a collection,
   not a single value.
2. `<RowDefinition Height="Auto" />` — (first appearance) declares one row.
   `Auto` sizing means "exactly as tall as the tallest thing placed in this
   row needs to be" — the direct `Grid` equivalent of `StackPanel`'s default
   per-child behavior from Lesson 1, but scoped to one specific row instead
   of applying to everything.
3. `<RowDefinition Height="*" />` — (hard concept reappearing from the lab)
   star sizing: "take all space not claimed by `Auto` or fixed-pixel rows."
4. Three `RowDefinition`s, in order — the `Grid` now has exactly three rows,
   numbered `0`, `1`, and `2` from top to bottom, in the order they're
   declared — row numbering is positional, not something you name yourself.

### CS Lens

Row sizing values (`Auto`, `*`, and a fixed number) are a small **constraint
satisfaction** problem, the same category of idea this project's sibling
Android curriculum names explicitly for `ConstraintLayout`: you declare
*rules* about how space should be divided, and the `Grid` — not you —
computes the actual pixel heights every time the window's size changes.
Nothing in this file computes "80 pixels" or "270 pixels" directly; the
`Grid` solves for those numbers at layout time, from the rules you gave it.

### SE Lens

Why does `Grid` require you to declare rows up front instead of just
inferring them from how many children exist, the way `StackPanel` needs no
row count at all? Because a `Grid` supports children being placed
*anywhere* — two children in the same row, one row entirely empty, a child
spanning multiple rows (not used yet, arriving when this project needs it)
— none of which has one obvious, inferable row count. `StackPanel`'s
simplicity comes directly from refusing all of that flexibility; `Grid`'s
flexibility comes directly from requiring you to be explicit about the
structure first. This is the same tradeoff Lesson 1's SE Lens already
named from the other direction — and this lesson is exactly the moment that
tradeoff tips toward `Grid`, because "three independent, differently-sized
regions" is precisely the shape `StackPanel` cannot express.

### Connection

Every row this unit declared is still empty. The next unit puts Lesson 1's
actual content back — the title, the welcome message, and the tagline —
each one assigned to a specific row.

---

## Concept Unit: Attached Properties — `Grid.Row` and `Grid.Column`

### The Problem

The lab above used `Grid.Row="1"` on a `Border` with no explanation. Read
that line literally and it looks wrong: `Border` is a completely different
class from `Grid`, and nothing about `Border` itself has a property called
`Row`. So what is `Grid.Row="1"` actually doing, and why does it compile at
all?

### Introduce the Concept in Isolation
Create a throwaway console project — this concept has a real C# mechanism
underneath the XAML syntax, worth seeing in plain code first:

```bash
dotnet new console -o lab-attached
cd lab-attached
```

Replace `Program.cs`:

```csharp
class GridRowRegistry
{
    private static readonly Dictionary<object, int> rowsByChild = new();

    public static void SetRow(object child, int row)
    {
        rowsByChild[child] = row;
    }

    public static int GetRow(object child)
    {
        return rowsByChild.TryGetValue(child, out int row) ? row : 0;
    }
}

class Widget { }

Widget button = new Widget();
GridRowRegistry.SetRow(button, 1);
Console.WriteLine(GridRowRegistry.GetRow(button));
```

Run it:

```bash
dotnet run
```

Real output:

```text
1
```

*What this proves:* `Widget` never declared a `Row` property, and never
needed to. `GridRowRegistry` — a completely unrelated class — keeps its own
private lookup table mapping *any* object to an `int`, keyed by the object
itself. `GetRow(button)` works because `SetRow` was called with that exact
`button` reference earlier, not because `Widget` has any awareness that
rows exist. This is, structurally, exactly what `Grid.Row="1"` on a
`Border` does — `Grid` (not `Border`) owns the storage for "which row does
this child belong to," and XAML's `Grid.Row="..."` syntax is a compiler-
recognized shorthand for calling `Grid`'s own `SetRow(theBorder, 1)`
underneath.

### Discard the Throwaway Example
Delete the `lab-attached` folder and the hand-written `GridRowRegistry` —
real WPF's actual mechanism (`DependencyProperty`, a genuine .NET feature
this lab only imitates with a plain dictionary) is more capable than this,
but the core idea — the *owner* of the property, not the *element* wearing
it, holds the lookup — is exactly what carries forward.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `MainWindow.xaml`.
- **Change type:** Add.
- **Location:** Inside the `<Grid>` from the previous unit, after
  `</Grid.RowDefinitions>`.
- **Dependencies:** The three rows the previous unit declared.

### The New Code

```xml
<TextBlock x:Name="WelcomeMessage"
           Grid.Row="1"
           FontSize="16"
           HorizontalAlignment="Center"
           VerticalAlignment="Center" />

<TextBlock Grid.Row="2"
           Text="Your inventory, organized."
           FontSize="12"
           Foreground="Gray"
           HorizontalAlignment="Center"
           Margin="0,0,0,16" />
```

### The Updated Project

```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto" />
        <RowDefinition Height="*" />
        <RowDefinition Height="Auto" />
    </Grid.RowDefinitions>

    <TextBlock x:Name="WelcomeMessage"           <!-- ← new -->
               Grid.Row="1"                      <!-- ← new -->
               FontSize="16"                     <!-- ← new -->
               HorizontalAlignment="Center"       <!-- ← new -->
               VerticalAlignment="Center" />      <!-- ← new -->

    <TextBlock Grid.Row="2"                       <!-- ← new -->
               Text="Your inventory, organized."  <!-- ← new -->
               FontSize="12"                      <!-- ← new -->
               Foreground="Gray"                  <!-- ← new -->
               HorizontalAlignment="Center"        <!-- ← new -->
               Margin="0,0,0,16" />                <!-- ← new -->
</Grid>
```

Row 1 (the `*`-sized middle row) now holds the same `WelcomeMessage`
`TextBlock` from Lesson 1, centered within whatever space that row actually
has. Row 2 holds the gray tagline. Row 0 — the header — is still empty;
the next unit fills it in, and it needs both rows *and* columns to hold
what a real header needs.

### Mechanical Walkthrough
1. `Grid.Row="1"` — (hard concept reappearing from the lab, first real use)
   an **attached property**: `Row` is not a property `TextBlock` declares —
   it's a property `Grid` declares, that any child of a `Grid` can carry,
   read and written through the `Owner.PropertyName` syntax XAML recognizes
   specifically for this. No row was specified means row `0` by default —
   which is exactly why nothing needs `Grid.Row="0"` written explicitly
   anywhere.
2. `x:Name="WelcomeMessage"` — (hard concept reappearing, Lesson 1) unchanged
   from before — this `TextBlock` is still the exact field
   `MainWindow.xaml.cs` sets in its constructor; moving it into a `Grid` row
   doesn't touch that connection at all.
3. Every other attribute on both `TextBlock`s — `FontSize`,
   `HorizontalAlignment`, `VerticalAlignment`, `Foreground`, `Margin` — is
   **reappearing**, unchanged from Lesson 1, moved onto their new parent.

### CS Lens

An attached property is a **property owned by the parent, expressed on the
child** — the storage genuinely lives with `Grid`, not with `TextBlock`,
which is exactly why the lab's `GridRowRegistry` (an external map, not a
field on `Widget`) is a faithful, if simplified, model of the real
mechanism. This inverts the usual object-oriented assumption that a
property must be declared by the type it appears to belong to.

Also recognized in: CSS's `grid-row`/`grid-column` (set *on* a child
element, but only meaningful because its *parent* has `display: grid`),
HTML's `data-*` attributes (arbitrary key-value storage attached to an
element by something other than the element's own type definition), and
any plugin system where a host application lets a loaded plugin attach
metadata to objects it doesn't own or control the definition of.

### SE Lens

Why does `Grid` need this unusual mechanism instead of just giving `TextBlock`
(and every other WPF control) a `Row` and `Column` property directly? Because
`Row`/`Column` are only meaningful *inside a `Grid`* — a `TextBlock` placed
inside a `StackPanel` has no use for them at all. Baking `Row`/`Column`
directly into every control's own class would mean every single WPF control,
whether or not it's ever placed in a `Grid`, permanently carries properties
that are meaningless most of the time. Attached properties let `Grid` alone
own that concept, and any element — regardless of its own type — can
optionally participate in it only when it's actually relevant.

### Connection

The header row (`Grid.Row="0"`) is still empty. It needs more than one row
can express on its own — an icon and a title, side by side — which is
exactly what the next unit's columns are for.

---

## Concept Unit: `Grid.ColumnDefinitions` and a Nested `Grid`

### The Problem

The header needs two things side by side: a small square icon on the left,
and the app title next to it — not stacked, not centered as one block, but
two genuinely independent regions sharing one row. Rows alone only divide
space top-to-bottom; this needs the same idea applied left-to-right, inside
the header row specifically, without affecting the content or footer rows
at all.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `MainWindow.xaml`.
- **Change type:** Add.
- **Location:** Inside the outer `<Grid>`, before the `WelcomeMessage`
  `TextBlock` added in the previous unit — this becomes the content of
  `Grid.Row="0"`.
- **Dependencies:** `Grid.RowDefinitions` from the first unit;
  `Grid.Row`/attached properties from the second.

### The New Code

```xml
<Grid Grid.Row="0" Margin="16,16,16,8">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="*" />
    </Grid.ColumnDefinitions>

    <Border Grid.Column="0"
            Background="#2E5945"
            Width="32"
            Height="32" />

    <TextBlock Grid.Column="1"
               Text="Pocket Inventory"
               FontSize="24"
               FontWeight="Bold"
               Margin="12,0,0,0"
               VerticalAlignment="Center" />
</Grid>
```

### The Updated Project

```xml
<Window x:Class="PocketInventory.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Pocket Inventory" Height="450" Width="800">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" />
            <RowDefinition Height="*" />
            <RowDefinition Height="Auto" />
        </Grid.RowDefinitions>

        <Grid Grid.Row="0" Margin="16,16,16,8">                <!-- ← new -->
            <Grid.ColumnDefinitions>                            <!-- ← new -->
                <ColumnDefinition Width="Auto" />                <!-- ← new -->
                <ColumnDefinition Width="*" />                   <!-- ← new -->
            </Grid.ColumnDefinitions>                            <!-- ← new -->

            <Border Grid.Column="0"                              <!-- ← new -->
                    Background="#2E5945"                         <!-- ← new -->
                    Width="32"                                    <!-- ← new -->
                    Height="32" />                                 <!-- ← new -->

            <TextBlock Grid.Column="1"                           <!-- ← new -->
                       Text="Pocket Inventory"                   <!-- ← new -->
                       FontSize="24"                              <!-- ← new -->
                       FontWeight="Bold"                          <!-- ← new -->
                       Margin="12,0,0,0"                          <!-- ← new -->
                       VerticalAlignment="Center" />               <!-- ← new -->
        </Grid>

        <TextBlock x:Name="WelcomeMessage"
                   Grid.Row="1"
                   FontSize="16"
                   HorizontalAlignment="Center"
                   VerticalAlignment="Center" />

        <TextBlock Grid.Row="2"
                   Text="Your inventory, organized."
                   FontSize="12"
                   Foreground="Gray"
                   HorizontalAlignment="Center"
                   Margin="0,0,0,16" />
    </Grid>
</Window>
```

The outer `Grid`'s row `0` no longer holds a bare control directly — it
holds a **second, independent `Grid`**, itself divided into two columns,
holding the icon and the title. The outer `Grid`'s three rows and this
inner `Grid`'s two columns are completely separate layout systems that
happen to be nested inside one another; changing the inner `Grid`'s columns
has no effect on the outer `Grid`'s rows, and vice versa.

### Mechanical Walkthrough
1. `<Grid Grid.Row="0" ...>` — (hard concepts reappearing, combined for the
   first time) this inner `Grid` is itself a child of the outer `Grid`, so
   it carries `Grid.Row="0"` exactly the way the `TextBlock`s in the
   previous unit did — an element being a layout container itself does not
   exempt it from also being *positioned* by whatever contains it.
2. `<Grid.ColumnDefinitions>` / `<ColumnDefinition Width="Auto" />` /
   `<ColumnDefinition Width="*" />` — (hard concept reappearing, new axis)
   the exact same property-element syntax and `Auto`/`*` sizing rules from
   the first unit's `RowDefinitions`, applied left-to-right instead of
   top-to-bottom. Column `0` is `Auto`-sized (exactly as wide as the icon
   needs); column `1` takes all remaining width.
3. `<Border ... Width="32" Height="32" />` — (first appearance of `Border`)
   a simple container control whose main job is drawing a background and/or
   an outline behind whatever it holds (nothing, here — an empty `Border`
   with an explicit size is just a solid rectangle). `Background="#2E5945"`
   — (first appearance) a color specified as a **hex code** rather than a
   named color like Lesson 1's `Foreground="Gray"` — `#` followed by three
   pairs of hexadecimal digits for red, green, and blue, giving access to
   any color rather than only WPF's fixed set of named ones.
4. `Grid.Column="0"` / `Grid.Column="1"` — (hard concept reappearing) the
   column axis's version of `Grid.Row` from the previous unit — same
   attached-property mechanism, owned by `Grid`, this time storing which
   *column* rather than which *row* a child belongs to.
5. `Margin="16,16,16,8"` on the inner `Grid` itself — (hard concept
   reappearing) space around the whole header block, keeping it from
   touching the window's edges; note the bottom value (`8`) is deliberately
   smaller than the other three, leaving less gap directly above the
   content row that follows it.

### CS Lens

Nesting one `Grid` inside a cell of another `Grid` is **composition of
independent coordinate systems** — the inner `Grid`'s columns have no
knowledge of, and no effect on, the outer `Grid`'s rows; each layout
container solves its own, local arrangement problem, and the results
compose automatically because WPF measures and positions a parent only
after every descendant has been measured. This is the same idea, at a
smaller scale, as function composition: each `Grid` is a self-contained
unit that can be reasoned about, tested, and changed without touching the
one containing it.

### SE Lens

Why nest a second `Grid` instead of giving the *outer* `Grid` both row and
column definitions at once, and placing the icon and title directly with
`Grid.Row="0" Grid.Column="0"` / `Grid.Row="0" Grid.Column="1"`? That
would work, but it would mean the content row (`WelcomeMessage`) and footer
row also exist inside a grid with two columns they have no use for — every
future row would need to remember to span both columns explicitly, real,
avoidable complexity leaking into rows that were never supposed to care
about columns at all. Nesting keeps each `Grid`'s structure scoped
precisely to the region that actually needs it — the outer `Grid` only
ever reasons about three vertical bands; the column split is a fact that's
true *only* inside the header, and only the header's markup needs to know
it.

### Connection

The header now genuinely has two independent regions sharing one row —
exactly the "professional-looking layout" the User Story asked for, and
something no single `StackPanel` could have expressed at all. The next
unit steps back and names, formally, the actual data structure every
`Grid`/`Border`/`TextBlock` nesting decision in this lesson has been
building.

---

## Concept Unit: The Visual Tree

### The Problem

This lesson has now nested elements inside elements inside elements:
`Window` contains a `Grid`, which contains another `Grid` (among other
children), which contains a `Border` and a `TextBlock`. Lesson 0's CS Lens
mentioned "the visual tree" in passing. This unit names, precisely, what
kind of structure that actually is — because "tree" here is not a loose
metaphor, it's an exact computer science term with a precise shape, and
this lesson's markup is now complex enough to draw it for real.

### The concept, precisely

A **tree** is a data structure made of **nodes**, where every node has
exactly one **parent** (except one special node, the **root**, which has
none), and any number of **children**. A node with no children is called a
**leaf**. Every node in a tree is reachable from the root by following
exactly one path of parent-to-child links — there are no cycles, and no
node has two different parents.

Draw the exact structure this lesson's `MainWindow.xaml` now describes:

```
Window (root)
└── Grid (outer)
    ├── Grid (inner, header)
    │   ├── Border (icon)
    │   └── TextBlock ("Pocket Inventory")
    ├── TextBlock (WelcomeMessage)
    └── TextBlock ("Your inventory, organized.")
```

`Window` is the root — it has no parent. The outer `Grid` is `Window`'s
only child. The outer `Grid` has three children: the inner header `Grid`,
and the two `TextBlock`s from the second unit. The inner `Grid` itself has
two children: the `Border` and the title `TextBlock`. `Border`, the title
`TextBlock`, `WelcomeMessage`, and the footer `TextBlock` are all **leaves**
— none of them have any children of their own.

This exact structure is WPF's real, official term: the **visual tree** —
not an analogy, the actual name WPF's own documentation and debugging
tools (Visual Studio's **Live Visual Tree** window, viewable while the app
is running) use for this structure. Every property this lesson set
(`Grid.Row`, `Width`, `Margin`) is a property on one specific node in this
exact tree, and every layout decision (`RowDefinition`, `ColumnDefinition`)
is a rule one specific `Grid` node applies only to its own direct children.

### Mechanical Walkthrough

No code fence to enumerate — this unit names vocabulary, not syntax:

- **node** — **first appearance.** One element in the tree; every XAML
  element you've placed (`Window`, `Grid`, `Border`, `TextBlock`) is a
  node.
- **root** — **first appearance.** The one node with no parent —
  `Window`, here — every other node is reachable from it.
- **parent** / **children** — **first appearance.** Every node except
  the root has exactly one parent; a node can have any number of
  children, including zero.
- **leaf** — **first appearance.** A node with no children — `Border`
  and every `TextBlock` in this lesson's tree.
- **visual tree** — **first appearance of WPF's own name for this
  structure.** Not this lesson's analogy — the literal term WPF's own
  tooling (Live Visual Tree) uses for it.

### CS Lens

**This is a hard concept — tree data structures — and it recurs
constantly, well beyond WPF.** A tree is one of the most common ways
computer science represents anything with a natural "contains" or "made
of" relationship, specifically because it forbids cycles: nothing in a
tree can (directly or indirectly) contain itself, which is exactly the
guarantee that makes recursive operations over trees (measuring every
element's size, or repainting the screen) always eventually terminate.

Also recognized in: the DOM (a web page's element structure — WPF's
visual tree and a browser's DOM tree are the same idea, arrived at
independently, for the same reason); a computer's file system (a folder
contains files and other folders, never itself); this curriculum's sibling
CAD/CAM project's abstract syntax tree (an expression like `sin(30) + 2`
is a tree with `+` as the root and `sin(30)` and `2` as its children); a
company's organizational chart; and this project's own sibling Android
curriculum, which independently arrives at the identical idea under its
own name — Android's "view hierarchy."

### SE Lens

Why does WPF organize the screen as a tree instead of, say, a flat list of
every visible element with explicit x/y coordinates? Because a tree lets a
change to one node — moving, resizing, or hiding the inner header `Grid`,
for instance — automatically carry every one of its descendants along with
it, without anything needing to separately update the `Border`'s and
title `TextBlock`'s positions by hand. A flat list of absolutely-positioned
elements would require exactly that manual bookkeeping every time a parent
region's size changes — the tree structure is what makes "move the header,
and everything in it moves too" free, structurally, rather than something
your code has to implement.

### Commands needed

```bash
dotnet run
```

### Run it

On your Windows machine, this now opens a window showing a header band
with a small dark green square and "Pocket Inventory" in large bold text
beside it, a centered welcome message with today's date filling the middle
of the window, and a small gray tagline at the bottom — resize the window
and confirm the header and footer stay their natural heights while the
middle region grows and shrinks, the direct visible proof of this lesson's
`Auto`/`*` row sizing from the first unit.

### Connection

Every screen this project builds from here forward is a **subtree** grafted
onto this same visual tree, rooted at `Window`. Lesson 3's navigation
between screens is, precisely, WPF replacing one entire branch of this
tree with another, while the root and the rest of the structure stay
exactly where they are — a direct, concrete use of the "changing a node
carries its descendants" property this unit's SE Lens just named.

---

## Closing

### Connect the Pieces
One concrete trace: the outer `Grid`'s three `RowDefinition`s (Concept Unit
1) divide the window into header, content, and footer bands, sized `Auto`,
`*`, and `Auto`. `Grid.Row` attached properties (Concept Unit 2) tell each
top-level child which band it belongs to — a mechanism that works precisely
because `Grid`, not the child, owns that storage. Row `0` doesn't hold a
plain control at all; it holds a second, nested `Grid` with its own
`ColumnDefinition`s (Concept Unit 3), placing an icon and a title side by
side using the identical row-sizing rules turned sideways. Every one of
those elements — nested three levels deep in places — is one node in a
single tree rooted at `Window` (Concept Unit 4), and every layout decision
this lesson made is a rule that applies to exactly one `Grid` node's own
direct children, never further.

### What Breaks Without This
Delete just the `<Grid.ColumnDefinitions>` block from the inner header
`Grid` (leave the `Border` and `TextBlock` with their `Grid.Column="0"`/
`Grid.Column="1"` attributes untouched) and run the app. Real,
representative failure: with no columns declared at all, `Grid.Column="1"`
refers to a column that doesn't exist — WPF does not throw an error for
this; it silently treats any undeclared column index the same as column
`0`. Both the `Border` and the title `TextBlock` render stacked directly on
top of each other in the same space, the icon square hidden behind — or
mixed with — the text. Restore the `ColumnDefinitions` block and they
separate correctly again. This is the concrete, hands-on proof that a
`Grid`'s columns (or rows) must be declared before `Grid.Column`/`Grid.Row`
values referencing them mean anything at all — the attached property
alone, with nothing declaring what it indexes into, silently does nothing
useful.

### Exercises

- Change the outer `Grid`'s middle `RowDefinition` from `Height="*"` to a
  fixed number like `Height="150"`, resize the window, and observe that the
  content row now clips or leaves dead space instead of adapting — then
  restore `*` and explain, in your own words, exactly what broke.
- Add a fourth `RowDefinition` to the outer `Grid` and a new `TextBlock` in
  it, positioned with `Grid.Row="3"`, without changing anything else —
  confirm it appears, and connect this back to the fact that row count is
  never inferred, only ever declared.
- Open Visual Studio's **Live Visual Tree** window (Debug → Windows → Live
  Visual Tree, while the app is running) and find this lesson's exact
  four-level nesting — `Window` → outer `Grid` → inner `Grid` → `Border`/
  `TextBlock` — rendered as a real, browsable tree, matching the diagram
  this lesson drew by hand.

### Definition of Done
- [ ] `MainWindow.xaml`'s outer `Grid` has three rows (`Auto`, `*`, `Auto`)
      holding a nested header `Grid`, the welcome message, and the footer,
      matching the Updated Project shown above.
- [ ] Resizing the window keeps the header and footer their natural height
      while only the middle region grows or shrinks.
- [ ] You can draw, from memory, the visual tree this lesson built — every
      node, correctly nested.
- [ ] You triggered the real "undeclared column silently collapses to
      column 0" failure yourself, not just read about it.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Replace the single stacked layout with a real Grid-based header/content/footer, so each region can be sized and resized independently"`.
