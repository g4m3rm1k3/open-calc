# Lesson 3: One Window, Many Interchangeable Screens

*(Frame and Page Navigation)*

**User Story**
> As a user, I want to navigate to an Add Inventory screen.

**What you will build**
Right now, everything Pocket Inventory shows lives inside one file,
`MainWindow.xaml`, forever. A real application needs more than one screen —
a home screen, a form to add an item, eventually a details view — and
opening a brand-new `Window` for each one would mean juggling several
separate windows, each with its own title bar, each capable of being moved,
resized, or closed independently of the others, none of which is what a
single-window desktop app should feel like. This lesson introduces `Page`
and `Frame`: a way to swap *what's currently showing* inside one window's
content area, without that window itself ever closing or reopening.
Clicking "Add Item" on the home screen will replace the home screen's
content with a real (if mostly empty, for now) Add Item screen — same
window, same title bar, genuinely different content.

**What you need to know first**
Lesson 2: the `Grid` this lesson's `Frame` gets placed inside, row `1`
specifically — the `*`-sized content region. Lesson 1: `x:Name`, string
interpolation, and the `WelcomeMessage` field, which this lesson relocates
out of `MainWindow.xaml.cs` into a new file entirely.

---

## Concept Unit: `Page` — Content That Isn't a Window

### The Problem

`MainWindow.xaml`'s root element is `Window` — and a `Window` is
inherently a top-level, independently-movable, closable thing; you cannot
put one `Window` "inside" another the way this lesson needs a home screen
and an Add Item screen to both live inside the *same* window's content
area. Something has to represent "a swappable unit of screen content" that
is explicitly *not* its own window.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-page
cd lab-page
```

Right-click the project in Visual Studio (or, from the command line,
create the file directly) and add a new file, `SamplePage.xaml`:

```xml
<Page x:Class="lab_page.SamplePage"
      xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
      xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <TextBlock Text="I am a Page, not a Window."
               FontSize="20"
               HorizontalAlignment="Center"
               VerticalAlignment="Center" />
</Page>
```

Try running this project's `Program`-equivalent entry point directly against
`SamplePage` the way you would a `Window` — there is no way to do this;
`Page` has no `Show()` method and no `.NET` project template ever generates
one as a startup target. This is the point to notice, not a mistake to
fix: a `Page`, unlike a `Window`, has genuinely no way to appear on screen
by itself. It requires a **host** — something else, with an actual window
and an actual `Show()`, willing to display it. `Frame`, the next unit,
is that host.

### Discard the Throwaway Example
Delete the `lab-page` folder. `Page` itself is not discarded — it's the
exact base class Pocket Inventory's home screen and Add Item screen are
about to be built from.

### Mechanical Walkthrough

- `<Page x:Class="lab_page.SamplePage" ...>` — **first appearance.**
  Same `x:Class` code-behind pairing as `<Window x:Class="...">`
  (Lesson 0/1), just a different root element — `Page` describes
  content meant to be hosted, not a standalone top-level window.
- `<TextBlock Text="..." FontSize="20" HorizontalAlignment="Center"
  VerticalAlignment="Center" />` — **reappearing**, ordinary XAML
  element and attributes already established in earlier lessons.
- The missing `Show()` method — **first appearance by omission.**
  `Window` has one; `Page` genuinely does not, at the type level —
  there is no way to display a `Page` on its own, which is the exact
  fact this unit exists to establish before `Frame` (next) supplies
  the missing host.

### CS Lens

`Page` versus `Window` is an instance of **restricting a type's
capability on purpose, to force a specific usage pattern**: `Page`
deliberately lacks anything a top-level window needs (a title bar, its own
`Show()`), which makes it *impossible* to accidentally show a `Page` as if
it were a standalone window — the compiler and the type system rule that
mistake out, rather than relying on a convention or a comment saying "don't
do this."

### SE Lens

Why does WPF bother with a separate `Page` type at all, instead of just
letting any `UserControl` (a general-purpose reusable chunk of UI, not
introduced yet) serve this role? `Page` specifically integrates with WPF's
navigation system — the back/forward history this lesson's final unit
names, and Lesson 4 builds a real Back button for — in a way a generic
`UserControl` does not automatically get. Choosing `Page` here is choosing
into that navigation behavior deliberately, not an arbitrary type pick.

### Connection

Pocket Inventory's home screen, built in the next unit, is the first real
`Page` in this project.

---

## Concept Unit: `Frame` — Hosting a `Page` Inside a `Window`

### The Problem

`MainWindow.xaml`'s content row (`Grid.Row="1"`, from Lesson 2) currently
holds `WelcomeMessage` directly. That has to become a real host capable of
showing one `Page` now and a completely different `Page` later, without
`MainWindow.xaml` itself changing every time.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `HomePage.xaml` (and its code-behind,
  `HomePage.xaml.cs`); `MainWindow.xaml`; `MainWindow.xaml.cs`.
- **Change type:** Create, then replace.
- **Location:** `MainWindow.xaml`'s `Grid.Row="1"` — currently holding the
  `WelcomeMessage` `TextBlock` from Lesson 2.
- **Dependencies:** Lesson 2's three-row `Grid`; Lesson 1's string
  interpolation and `WelcomeMessage` logic, both relocated here.

### The New Code — `HomePage.xaml`

```xml
<Page x:Class="PocketInventory.HomePage"
      xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
      xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <StackPanel VerticalAlignment="Center" HorizontalAlignment="Center">
        <TextBlock x:Name="WelcomeMessage"
                   FontSize="16"
                   HorizontalAlignment="Center" />
    </StackPanel>
</Page>
```

Every piece of this is **reappearing**: `x:Class` follows the identical
pattern `MainWindow.xaml`'s own root tag has used since Lesson 0 (naming
the code-behind class this markup pairs with); `StackPanel` is Lesson 1's
control, reused for a genuinely appropriate case — one column of centered
content, no rows or columns needed; `x:Name="WelcomeMessage"` is the exact
field name Lesson 1 already gave this `TextBlock`, moved into its new home.

### The New Code — Wiring the `Frame`

```xml
<Frame x:Name="ContentFrame"
       Grid.Row="1"
       Source="HomePage.xaml"
       NavigationUIVisibility="Hidden" />
```

### The Updated Project

`MainWindow.xaml`:

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

        <Grid Grid.Row="0" Margin="16,16,16,8">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="Auto" />
                <ColumnDefinition Width="*" />
            </Grid.ColumnDefinitions>
            <Border Grid.Column="0" Background="#2E5945" Width="32" Height="32" />
            <TextBlock Grid.Column="1"
                       Text="Pocket Inventory"
                       FontSize="24"
                       FontWeight="Bold"
                       Margin="12,0,0,0"
                       VerticalAlignment="Center" />
        </Grid>

        <Frame x:Name="ContentFrame"              <!-- ← new -->
               Grid.Row="1"                        <!-- ← changed (was WelcomeMessage directly) -->
               Source="HomePage.xaml"               <!-- ← new -->
               NavigationUIVisibility="Hidden" />    <!-- ← new -->

        <TextBlock Grid.Row="2"
                   Text="Your inventory, organized."
                   FontSize="12"
                   Foreground="Gray"
                   HorizontalAlignment="Center"
                   Margin="0,0,0,16" />
    </Grid>
</Window>
```

Row `1` no longer holds `WelcomeMessage` directly at all — it holds a
`Frame`, and `WelcomeMessage` now lives one level deeper, inside
`HomePage.xaml`, which the `Frame` displays. The outer three-row structure
Lesson 2 built (header, content, footer) is completely unchanged; only
*what fills the content row* changed from a single control to a navigable
container.

`MainWindow.xaml.cs` loses the line it gained in Lesson 1 — setting
`WelcomeMessage.Text` no longer belongs here at all, since `MainWindow`
doesn't own that field anymore:

```csharp
using System.Windows;

namespace PocketInventory
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }
    }
}
```

And the exact line that moved, now living in the new `HomePage.xaml.cs`:

```csharp
using System;
using System.Windows.Controls;

namespace PocketInventory
{
    public partial class HomePage : Page
    {
        public HomePage()
        {
            InitializeComponent();
            WelcomeMessage.Text = $"Welcome — today is {DateTime.Now:MMMM d, yyyy}.";
        }
    }
}
```

### Mechanical Walkthrough
1. `<Frame x:Name="ContentFrame" ...>` — (first appearance) instantiates
   `System.Windows.Controls.Frame`, the control whose entire job is
   hosting and displaying a `Page` — the concrete answer to the previous
   unit's "a `Page` needs a host."
2. `Grid.Row="1"` — (hard concept reappearing, Lesson 2) the `Frame`
   itself is positioned in the content row exactly the way any other
   control would be; a `Frame` is, from the outer `Grid`'s point of view,
   just another child to place.
3. `Source="HomePage.xaml"` — (first appearance) tells the `Frame` which
   `Page` to display immediately, the moment the window loads — set
   declaratively, in markup, rather than requiring a line of C# in
   `MainWindow.xaml.cs`'s constructor to trigger the first navigation.
4. `NavigationUIVisibility="Hidden"` — (first appearance) `Frame` has a
   built-in default appearance that includes its own small Back/Forward
   toolbar, browser-style — `Hidden` turns that off. This project builds
   its own, deliberately-designed Back button in Lesson 4 instead of
   relying on `Frame`'s generic default one.
5. `public partial class HomePage : Page` — (hard concept reappearing,
   Lesson 0's `MainWindow : Window`) the identical inheritance pattern,
   `: Page` instead of `: Window` — `HomePage` **is a** `Page`, in exactly
   the sense Lesson 0's `MainWindow : Window` line meant "`MainWindow`
   **is a** `Window`."
6. `using System.Windows.Controls;` — (first appearance) `Page` (and
   `Frame`) live in this namespace, distinct from `System.Windows`, which
   is where `Window` itself lives — a real, correct distinction: `Window`
   is fundamental enough to sit in the top-level `System.Windows`
   namespace, while `Page`, `Frame`, and most actual controls sit one
   level deeper, in `System.Windows.Controls`.

### CS Lens

The `Frame`/`Page` relationship is **composition through a host/content
split**: `MainWindow` doesn't know or care what specific `Page` is
currently showing inside its `Frame` — it only knows it has a `Frame`,
sitting in row `1`. Swapping `HomePage` for a completely different `Page`
(coming in the next unit) requires zero changes to `MainWindow.xaml` at
all — the exact same "the outer structure doesn't need to know about the
specific thing inside it" idea Lesson 2's SE Lens already named for the
outer `Grid` not caring what fills its rows.

### SE Lens

Why relocate `WelcomeMessage` and its date-computing logic out of
`MainWindow.xaml.cs` and into a brand-new `HomePage.xaml.cs`, rather than
leaving that logic where it already was and just wrapping it in a `Frame`?
Because `MainWindow`'s actual responsibility, from this lesson forward, is
narrower than it used to be: it owns the header, the footer, and *which*
`Page` is currently hosted — never the specific content or behavior of any
one screen. If the welcome-message logic stayed in `MainWindow.xaml.cs`,
`MainWindow` would still be reaching into content that conceptually
belongs to the home screen specifically, the exact kind of responsibility
blur this lesson's `Frame`/`Page` split exists to prevent.

### Connection

`HomePage` now shows the same welcome message Lesson 1 built, hosted
inside `MainWindow`'s `Frame` instead of directly inside `MainWindow`
itself. The next unit gives `HomePage` something to actually *do* —
navigating to a second `Page` when its button is clicked.

---

## Concept Unit: Click Events and `NavigationService.Navigate`

### The Problem

`HomePage` shows a welcome message and nothing else. The User Story asks
for a button that takes the user to an Add Item screen — which needs two
new things this project hasn't used yet: a way to run C# code in response
to a button click at all, and a way for a `Page`, once running, to tell its
hosting `Frame` to show a *different* `Page`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `AddItemPage.xaml` (and code-behind);
  `HomePage.xaml`; `HomePage.xaml.cs`.
- **Change type:** Create, add.
- **Dependencies:** `HomePage`, `Frame`, from the previous unit.

### The New Code — a Placeholder Destination

```xml
<Page x:Class="PocketInventory.AddItemPage"
      xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
      xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <StackPanel VerticalAlignment="Center" HorizontalAlignment="Center">
        <TextBlock Text="Add Item"
                   FontSize="24"
                   FontWeight="Bold"
                   HorizontalAlignment="Center" />
        <TextBlock Text="(The real form arrives in Epic 2.)"
                   FontSize="14"
                   Foreground="Gray"
                   Margin="0,8,0,0"
                   HorizontalAlignment="Center" />
    </StackPanel>
</Page>
```

`AddItemPage.xaml.cs` needs nothing beyond the generated default — no new
logic yet, only a real, navigable `Page`:

```csharp
using System.Windows.Controls;

namespace PocketInventory
{
    public partial class AddItemPage : Page
    {
        public AddItemPage()
        {
            InitializeComponent();
        }
    }
}
```

**Why a placeholder, honestly:** this page has no fields, no `TextBox`, no
way to actually add anything yet — Epic 2 builds that, starting with
Lesson 6. Shipping an intentionally minimal, honest placeholder here — a
real, navigable screen that says exactly what it is — satisfies Agile
Delivery's "something you can run and see, now" without pretending to be
more finished than it is.

### The New Code — the Button and Its Handler

```xml
<Button Content="Add Item"
        Margin="0,24,0,0"
        Padding="16,8"
        Click="AddItemButton_Click" />
```

```csharp
private void AddItemButton_Click(object sender, RoutedEventArgs e)
{
    NavigationService.Navigate(new AddItemPage());
}
```

### The Updated Project

`HomePage.xaml`:

```xml
<Page x:Class="PocketInventory.HomePage"
      xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
      xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <StackPanel VerticalAlignment="Center" HorizontalAlignment="Center">
        <TextBlock x:Name="WelcomeMessage"
                   FontSize="16"
                   HorizontalAlignment="Center" />
        <Button Content="Add Item"                  <!-- ← new -->
                Margin="0,24,0,0"                     <!-- ← new -->
                Padding="16,8"                         <!-- ← new -->
                Click="AddItemButton_Click" />          <!-- ← new -->
    </StackPanel>
</Page>
```

`HomePage.xaml.cs`:

```csharp
using System;
using System.Windows;
using System.Windows.Controls;

namespace PocketInventory
{
    public partial class HomePage : Page
    {
        public HomePage()
        {
            InitializeComponent();
            WelcomeMessage.Text = $"Welcome — today is {DateTime.Now:MMMM d, yyyy}.";
        }

        private void AddItemButton_Click(object sender, RoutedEventArgs e)  // ← new
        {                                                                     // ← new
            NavigationService.Navigate(new AddItemPage());                    // ← new
        }                                                                     // ← new
    }
}
```

`HomePage`'s `StackPanel` now holds a second child — the button — beneath
the welcome message, and the class gains its first method beyond the
constructor: a handler that runs specifically when that button is clicked,
nothing else.

### Mechanical Walkthrough
1. `<Button Content="Add Item" ... />` — (first appearance) instantiates
   `System.Windows.Controls.Button`. `Content` — (first appearance) sets
   what's displayed *inside* the button — named `Content` rather than
   `Text` (contrast `TextBlock.Text`) because a `Button` can hold far more
   than plain text (an image, another whole layout) as its content; a
   string is simply the most common case.
2. `Padding="16,8"` — (first appearance) space *inside* the button's own
   border, between its edge and its content — contrast `Margin`, already
   used since Lesson 1, which is space *outside* an element, between it
   and whatever surrounds it. Two numbers here (`16,8`) set horizontal and
   vertical padding together, rather than all four sides independently the
   way `Margin="0,12,0,0"` did in Lesson 1.
3. `Click="AddItemButton_Click"` — (first appearance) wires this button's
   `Click` **event** to a specific C# method by name. `Click` is an
   **event** — a signal a control raises when something specific happens
   to it (here, a completed mouse click) — and this attribute is XAML's
   way of saying "when that signal fires, call this method." The method
   name itself is not required to be `AddItemButton_Click` — that's a
   convention (`ElementName_EventName`) this project follows for
   readability, not a language rule.
4. `private void AddItemButton_Click(object sender, RoutedEventArgs e)` —
   (first appearance) an **event handler**: a method matching the exact
   signature every `Click` handler must have — `void` (it returns nothing
   back to whatever raised the event), taking exactly two parameters.
   `object sender` — (first appearance) a reference to whatever control
   actually raised the event — here, the `Button` itself, though this
   handler doesn't use it. `RoutedEventArgs e` — (first appearance) extra
   information about the event itself; `RoutedEventArgs` specifically
   because WPF events *route* through the visual tree (a click on a child
   element can be observed by ancestors too — full routing behavior isn't
   needed by this project yet, only the type signature is).
5. `NavigationService` — (first appearance) a property every `Page`
   inherits automatically once it's actually hosted inside a `Frame` — it
   is `null` if the `Page` isn't currently hosted anywhere, and refers to
   *this specific `Frame`*'s navigation system once it is. `HomePage`
   never declared this property itself; it comes free from `: Page`.
6. `.Navigate(new AddItemPage())` — (first appearance) tells the hosting
   `Frame` — `ContentFrame`, from the previous unit — to replace its
   currently-displayed `Page` with a brand-new `AddItemPage` instance.
   `new AddItemPage()` constructs one, exactly the way `new Widget()`
   constructed an object back in this lesson's very first throwaway lab.

### CS Lens

`Click="AddItemButton_Click"` wiring a markup-declared event to a
hand-written method is the **Observer pattern**: `Button` doesn't know or
care what `AddItemButton_Click` actually does — it only knows "call this
when a click happens." This project's sibling Android curriculum
(`../track/`) reaches the identical pattern independently, calling it
`setOnClickListener` — same underlying idea, expressed as markup here and
as a method call there, because both are solving the identical problem: a
UI element needing to notify arbitrary, unrelated code that something
happened, without that element needing to know anything about what that
code will do in response.

### SE Lens

Why does WPF let events be wired directly in XAML (`Click="..."`) instead
of requiring every handler to be attached from C#, the way `NavigationService.Navigate`
is called from C#? Because a click handler is fundamentally tied to *this
specific button, in this specific screen* — writing it right next to the
button's own markup keeps the connection visible at a glance, in the same
file, rather than requiring a reader to hunt through a constructor for a
separate `AddItemButton.Click += ...` line elsewhere. This is a real,
different tradeoff from `NavigationService.Navigate`, which had to be C#
because *what* to navigate to, and *when*, is genuine logic — not a fixed,
one-time wiring decision the way "this button calls this method" is.

### Commands needed

```bash
dotnet run
```

### Run it

On your Windows machine: the home screen looks identical to Lesson 2's,
plus a new "Add Item" button beneath the welcome message. Click it — the
window's content area (row `1` only; the header and footer stay exactly
where they are) is replaced entirely by the new Add Item placeholder
screen. No new window opened. No title bar changed. This is the concrete,
visible proof of this lesson's central claim: one window, genuinely
interchangeable content.

### Connection

Tapping "Add Item" now works, but there is, so far, no way back to the
home screen at all — closing the window is the only option. The final
unit names exactly what's already been quietly built by every `.Navigate(...)`
call so far, which is precisely what makes a Back button possible without
this project inventing any new mechanism for it.

---

## Concept Unit: The Navigation Stack

### The Problem

Every `.Navigate(...)` call so far has moved *forward* — from `HomePage`
to `AddItemPage`. Nothing has asked "how would the app ever know how to
get back?" Answering that requires understanding what, precisely,
`Frame.Navigate` has actually been doing underneath, every single time it
ran.

### The concept, precisely

Every time `Frame.Navigate(...)` runs, the `Frame` doesn't just discard
whatever `Page` was showing before — it records it, in order, in an
internal structure called the **back stack**: a list where new entries are
always added to one specific end (the *top*), and the *only* entry ever
removed is that same top one. This ordering rule — the newest thing added
is always the first thing removed — is called **LIFO**: Last In, First
Out.

Trace the exact stack state through every navigation this lesson has
caused so far:

```
App launches, Frame.Source="HomePage.xaml" loads:
    Back stack: [ ]                     (nothing to go back to yet)
    Currently showing: HomePage

User clicks "Add Item" → Navigate(new AddItemPage()):
    Back stack: [ HomePage ]            (HomePage pushed on top)
    Currently showing: AddItemPage
```

If a second navigation happened right now — say, `AddItemPage` had its own
button navigating somewhere else — `AddItemPage` itself would be pushed
onto the stack too, on top of `HomePage`, and the stack would read
`[ HomePage, AddItemPage ]` with the newest destination shown, not stored.
Nothing in this lesson has removed anything from this stack yet — that's
exactly what Lesson 4's Back button does: pop the top entry off, and
navigate to it.

### Mechanical Walkthrough

- **back stack** — **first appearance.** The internal structure a
  `Frame` maintains, recording every `Page` navigated away from, in
  order.
- **LIFO** (Last In, First Out) — **first appearance.** The rule
  governing that structure: the most recently pushed entry is always
  the first one removed.
- `Frame.Navigate(...)` pushing the *previous* page, not the new one
  — **first appearance of this specific mechanic.** Each call records
  whatever was on screen *before* the navigation, then shows the new
  destination — the stack holds history, not the current page.

### CS Lens

**This is a hard concept — the stack data structure — and it recurs
constantly, including inside this exact project already.** A stack
enforces exactly one rule: additions and removals both happen at the same
end. `Frame`'s back stack is a real, live stack existing right now, in
memory, even though nothing in this project has read from it yet.

Also recognized in: your own computer's call stack (every function call
this project's own C# methods make is pushed onto a stack, popped when
that method returns — this is *why* a stack overflow, from infinite
recursion, is named after this exact structure); the undo history in any
text editor; a browser's own Back button (the browser you might be reading
this lesson in has one, doing precisely this); and — deepened from this
project's own later roadmap — Lesson 45's undo/redo feature, which builds
a second, independent stack of exactly this shape for a completely
different purpose.

### SE Lens

Why does `Frame` maintain this automatically, rather than requiring
`HomePage.xaml.cs` to manually remember "the user came from the home
screen" and pass that information along to `AddItemPage` itself? Because
navigation history is a property of the *`Frame`* — of the fact that
navigation happened at all — not a property of any individual `Page`.
`AddItemPage` doesn't need to know, or store, that `HomePage` came before
it; the `Frame` already knows, structurally, and any `Page` hosted inside
it can ask. This is the same "the owner holds the bookkeeping, not the
thing being tracked" shape Lesson 2's attached properties already
introduced, in a completely different context.

### Connection

This stack already exists, right now, with one entry in it the moment
"Add Item" is clicked — nothing further needs to be built for it to keep
working correctly. Lesson 4 adds exactly one thing: a visible Back button
that calls `GoBack()`, popping this exact stack.

---

## Closing

### Connect the Pieces
One concrete trace: `MainWindow.xaml`'s `Frame` (Concept Unit 2) loads
`HomePage.xaml.cs`'s `Page` (Concept Unit 1) via its `Source` attribute the
moment the window opens, showing the welcome message relocated from
Lesson 1. Clicking the "Add Item" button raises a `Click` event
(Concept Unit 3), wired in `HomePage.xaml`, running the
`AddItemButton_Click` handler, which calls
`NavigationService.Navigate(new AddItemPage())` — a property every `Page`
inherits for free once it's hosted. That single call does two things at
once: it shows `AddItemPage` inside the same `Frame`, and it silently
pushes `HomePage` onto the `Frame`'s own back stack (Concept Unit 4) — a
structure that already exists and is already correct, waiting for
Lesson 4 to give it a visible way back.

### What Breaks Without This
Temporarily delete `NavigationUIVisibility="Hidden"` from the `Frame` in
`MainWindow.xaml` and run the app. Real, representative result: `Frame`'s
own default browser-style navigation toolbar (Back/Forward arrows and an
address-style bar) appears directly above the home screen's content, a
visibly unpolished, out-of-place strip this project never designed. Click
"Add Item" and that same default toolbar's own Back arrow *does* work,
correctly, right now, using exactly the stack Concept Unit 4 described —
concrete proof the stack was real and functioning even before this
project ever wrote a line of Back-button code of its own. Restore
`NavigationUIVisibility="Hidden"` afterward; Lesson 4 replaces this
default toolbar with a deliberately designed one instead of leaving it
enabled.

### Exercises

- Add a second placeholder `Page`, `SettingsPage.xaml`, and a second button
  on `HomePage` that navigates to it — confirm both destinations work
  independently from the same home screen.
- Temporarily re-enable `NavigationUIVisibility` (set it to `Visible`),
  navigate forward twice in a row (Home → Add Item → your new Settings
  page, if you built the previous exercise), and click the default Back
  arrow twice — count how many clicks it takes to return all the way to
  `HomePage`, and connect that count directly to how many entries the
  back stack actually holds at that point.
- In `AddItemPage.xaml.cs`, temporarily add a button of its own that also
  calls `NavigationService.Navigate(new AddItemPage())` — navigating to a
  *new instance* of the same page type it's already showing. Run it and
  observe that the back stack now contains two separate `AddItemPage`
  entries, not one reused one — connect this to the fact that `Navigate`
  always constructs and pushes whatever `Page` object you hand it, with no
  awareness of what type it already is.

### Definition of Done
- [ ] `MainWindow.xaml`'s content row holds a `Frame`, not a bare
      `TextBlock`; `HomePage.xaml` holds the relocated welcome message.
- [ ] Clicking "Add Item" swaps in a real `AddItemPage`, in the same
      window, with the header and footer unchanged.
- [ ] You can explain, in your own words, why `Page` cannot be shown
      without a host, and what specifically `Frame` provides.
- [ ] You observed the default navigation toolbar's Back arrow working
      correctly before writing any Back-button code yourself, connecting
      it to the back stack this lesson described.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Introduce Frame/Page navigation so the home and Add Item screens share one window instead of requiring separate ones"`.
