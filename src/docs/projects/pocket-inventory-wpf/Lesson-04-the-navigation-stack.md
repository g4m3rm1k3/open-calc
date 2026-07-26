# Lesson 4: Every Forward Step Implies a Way Back

*(The Navigation Stack, Made Clickable)*

**User Story**
> As a user, I want to return to the Home screen from anywhere.

**What you will build**
The app currently has a one-way door: clicking "Add Item" replaces the home
screen with the Add Item screen, permanently, with no way back except
closing the entire application. This lesson adds a real, deliberately
designed Back button to the header — the same header that's visible on
every screen — that correctly returns to whatever screen came before, and
correctly disables itself the moment there's nowhere left to go back to.
Nothing about the underlying mechanism is new; the back stack was already
proven to exist and work by tracing it by hand. This lesson is entirely
about giving it a real, visible, correctly-behaving control.

**What you need to know first**
Lesson 3: `Frame`, `Page`, `NavigationService.Navigate`, and specifically
its closing unit's back-stack trace — this lesson picks up exactly where
that trace left off. Lesson 2: the header `Grid`'s columns, which this
lesson adds a third one to.

**Terms introduced in this lesson:**
- **`event`** — declares a member other code subscribes to, not a
  value read directly.
- **`+=` on an event** — subscribes an additional handler to run when
  the event fires, without replacing any existing subscriber.
- **`?.Invoke()`** — fires an event, using `?.` to skip invocation
  safely when no subscriber exists yet.
- **`IsEnabled`** — a property every WPF control has; `false` renders
  it visually dimmed and unclickable.
- **Single source of truth** — deriving a value live from the one real
  place it's tracked (here, `CanGoBack` from the actual stack), instead
  of maintaining a second, separate copy by hand that could drift out
  of sync with reality.
- **Symmetry** (as a design principle) — every action that changes
  state (`Navigate`, pushing forward) has a matching, working way to
  undo it (`GoBack`, popping) — a structural promise, not something
  left to be added later if needed.
- **`Frame.Navigated`** — an event every `Frame` raises automatically
  whenever a navigation, forward or backward, finishes.
- **`NavigationEventArgs`** — carries details about the navigation
  that just occurred.
- **`Frame.CanGoBack`** — a read-only `bool` property, `true` exactly
  when the back stack has at least one entry.
- **`Frame.GoBack()`** — pops the top entry off the back stack and
  navigates to it.

---

## Concept Unit: Subscribing to an Event From C#, With `+=`

### The Problem

The `Click="AddItemButton_Click"` attribute wired an event entirely inside
XAML. The Back button's behavior needs something XAML's `Click="..."`
attribute cannot express on its own: the button must start out
**disabled** (there's nothing to go back to when the app first opens) and
then become enabled or disabled again *every single time* navigation
happens anywhere in the app — not just once, at startup. That requires
C# code that runs in response to an event, but subscribes to it from
`MainWindow.xaml.cs`, not from a XAML attribute.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-events
cd lab-events
```

Replace `Program.cs`:

```csharp
class DoorAlarm
{
    public event Action? DoorOpened;

    public void Open()
    {
        Console.WriteLine("Door physically opened.");
        DoorOpened?.Invoke();
    }
}

DoorAlarm alarm = new DoorAlarm();
alarm.DoorOpened += () => Console.WriteLine("Alarm: someone opened the door!");
alarm.Open();
```

Run it:

```bash
dotnet run
```

Real output:

```text
Door physically opened.
Alarm: someone opened the door!
```

*What this proves:* `event Action? DoorOpened;` declares `DoorOpened` as
something other code can subscribe to — not a value to read, an occurrence
to be notified about. `alarm.DoorOpened += () => ...` — the `+=` operator,
here, does not mean "add to a number"; on an event, it means "run this
code too, in addition to anything else already subscribed, whenever this
event fires." `DoorOpened?.Invoke()` inside `Open()` is what actually
fires the event — `?.` (covered fully once this project needs nullable
value types, Lesson 14; here it just means "only invoke if at least one
subscriber exists, otherwise do nothing and don't crash"). Nothing about
`DoorAlarm` needed to know, when it was written, what any subscriber would
actually do — the exact same "notify without knowing who's listening"
shape as the `Click` event before, just written from C# instead of XAML.

### Discard the Throwaway Example
Delete the `lab-events` folder. `+=` event subscription itself is not
discarded — it's the exact mechanism the next unit uses to listen for
every navigation `Frame` performs.

### Mechanical Walkthrough

- `public event Action? DoorOpened;` — **first appearance.** Declares
  `DoorOpened` as an event — something other code subscribes to, not a
  value to read directly.
- `alarm.DoorOpened += () => Console.WriteLine(...)` — **first
  appearance of `+=` on an event.** Not numeric addition — "run this
  code too, whenever `DoorOpened` fires," in addition to any other
  existing subscriber. `() => ...` is a lambda (reappearing — the
  `Click` handler earlier used the same shape).
- `DoorOpened?.Invoke()` — **first appearance.** What actually fires
  the event, from inside `DoorAlarm` itself. `?.` here means "only
  invoke if at least one subscriber exists" — full nullable-operator
  treatment comes in Lesson 14; for now, it's just what prevents a
  crash when nothing has subscribed yet.
- `alarm.Open()` — **reappearing** method call (basic) — triggers the
  `Console.WriteLine` inside `Open()` first, then `DoorOpened?.Invoke()`
  second, which is why "Door physically opened." prints before "Alarm:
  someone opened the door!" — the subscriber runs exactly where
  `Invoke()` sits in `Open()`'s own code, not before or after it.

### CS Lens

This is the **Observer pattern**, reappearing from the `Click`
event before — the same underlying idea, now seen from its second possible
syntax. WPF (and .NET generally) offers two ways to subscribe to the same
kind of notification: declaratively, in markup (`Click="..."`), or
imperatively, in code (`+=`). Both attach a method to be called later; they
differ only in *where* that attachment is written, not in what actually
happens when the event fires.

### SE Lens

Why does this lesson's Back button need the `+=` form instead of another
XAML `Click="..."` attribute, the way the Add Item button used before?
Because this lesson also needs to subscribe to a *second*, different
event — `Frame.Navigated`, covered next — purely to update the Back
button's enabled state, with no XAML attribute available for that
specific purpose at all; `Navigated` isn't a button click, it's the
`Frame` announcing "navigation just finished," and subscribing to it has
to happen from code. Once C# is already needed for one subscription, using
`+=` for the Back button's own `Click` too keeps both pieces of related
logic together in one file, rather than splitting one button's full
behavior across a XAML attribute and a separate code file.

### Connection

The next unit uses this exact `+=` syntax to subscribe to `Frame.Navigated`
inside `MainWindow`'s constructor.

---

## Concept Unit: `Frame.Navigated` and `CanGoBack`

### The Problem

The Back button needs to know, at every moment, whether going back is
currently even possible — disabled when the back stack is
empty, enabled the instant it isn't. That state changes every time
navigation happens anywhere in the app, which means something needs to
run *after every single navigation*, not just once.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `MainWindow.xaml`; `MainWindow.xaml.cs`.
- **Change type:** Add.
- **Location:** A new column in the header `Grid` (`Grid.Row="0"`,
  already established); `MainWindow`'s constructor.
- **Dependencies:** `ContentFrame`, already built.

### The New Code — the Button

```xml
<Button x:Name="BackButton"
        Grid.Column="0"
        Content="◀ Back"
        Padding="8,4"
        Margin="0,0,12,0"
        IsEnabled="False"
        Click="BackButton_Click" />
```

### The Updated Project

`MainWindow.xaml`'s header `Grid` gains a third column, inserted before
the icon:

```xml
<Grid Grid.Row="0" Margin="16,16,16,8">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto" /> <!-- ← new: Back button -->
        <ColumnDefinition Width="Auto" /> <!-- icon -->
        <ColumnDefinition Width="*" />     <!-- title -->
    </Grid.ColumnDefinitions>

    <Button x:Name="BackButton"                     <!-- ← new -->
            Grid.Column="0"                          <!-- ← new -->
            Content="◀ Back"                          <!-- ← new -->
            Padding="8,4"                              <!-- ← new -->
            Margin="0,0,12,0"                           <!-- ← new -->
            IsEnabled="False"                            <!-- ← new -->
            Click="BackButton_Click" />                   <!-- ← new -->

    <Border Grid.Column="1"                          <!-- ← changed from Grid.Column="0" -->
            Background="#2E5945" Width="32" Height="32" />

    <TextBlock Grid.Column="2"                       <!-- ← changed from Grid.Column="1" -->
               Text="Pocket Inventory"
               FontSize="24"
               FontWeight="Bold"
               Margin="12,0,0,0"
               VerticalAlignment="Center" />
</Grid>
```

Every other column's `Grid.Column` value shifts up by one — the icon
moves from column `0` to column `1`, the title from `1` to `2` — since a
new column was inserted before both.

`MainWindow.xaml.cs`:

```csharp
using System.Windows;
using System.Windows.Navigation;

namespace PocketInventory
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            ContentFrame.Navigated += ContentFrame_Navigated;  // ← new
        }

        private void ContentFrame_Navigated(object sender, NavigationEventArgs e)  // ← new
        {                                                                            // ← new
            BackButton.IsEnabled = ContentFrame.CanGoBack;                           // ← new
        }                                                                            // ← new
    }
}
```

### Mechanical Walkthrough
1. `IsEnabled="False"` — (first appearance) a property every WPF control
   has; `False` means the button renders visually dimmed and cannot be
   clicked at all — set here as the *starting* state, matching the real
   fact that the back stack is empty the moment the app opens.
2. `ContentFrame.Navigated += ContentFrame_Navigated;` — (hard concept
   reappearing from the lab) subscribes `MainWindow`'s own
   `ContentFrame_Navigated` method to `Frame`'s built-in `Navigated`
   event, which every `Frame` raises automatically, every single time a
   navigation — forward *or* backward — finishes.
3. `private void ContentFrame_Navigated(object sender, NavigationEventArgs e)`
   — (first appearance of this specific event's signature, hard concept
   reappearing overall) same event-handler shape as `AddItemButton_Click`
   before, different parameter type:
   `NavigationEventArgs` — (first appearance) carries details about the
   navigation that just occurred (which `Page` it navigated to, among
   other things this project doesn't need yet).
4. `ContentFrame.CanGoBack` — (first appearance) a read-only `bool`
   property on `Frame`, `true` exactly when its back stack has at least
   one entry — the live, queryable answer to "is there anything to go
   back to," computed from the same stack traced by hand before.
5. `BackButton.IsEnabled = ContentFrame.CanGoBack;` — reads that live
   `bool` and writes it directly into the button's own `IsEnabled`
   property, every time this handler runs — which, because it's
   subscribed to `Navigated`, is every time navigation happens anywhere
   in the app, for the entire life of the window.

### CS Lens

Re-deriving `BackButton.IsEnabled` from `ContentFrame.CanGoBack` after
*every* navigation, rather than trying to manually track "is there
something to go back to" as a separate flag this project maintains by
hand, is choosing a **single source of truth** over a **derived, cached
copy that can drift out of sync**. `CanGoBack` is never wrong, because it
is computed directly from the real stack, live, every time it's read —
there is no second variable anywhere that could disagree with it.

### SE Lens

Why not just set `BackButton.IsEnabled = true` directly, once, inside
`BackButton_Click` itself (built next), instead of a separate
`Navigated`-driven handler? Because the button also needs to become
**disabled** again under a real, specific condition this project hasn't
hit yet but will: navigating *back* to the very first screen the back
stack ever had leaves nothing left to go back to, and `BackButton_Click`
alone — which only ever runs when the button is clicked forward-going
navigation cannot reach it. Subscribing to `Navigated` instead means one
piece of logic correctly handles every case — forward navigation,
backward navigation, and the moment the stack empties out — without this
project needing to enumerate those cases by hand.

### Connection

`BackButton` now correctly disables itself, live, but clicking it — while
enabled — doesn't do anything yet. The final unit gives it real behavior.

---

## Concept Unit: `GoBack()` — Popping the Stack, For Real

### The Problem

`BackButton_Click` doesn't exist yet. Wiring it needs exactly one new
method call: the operation that actually pops the back stack already
described, and this lesson has been tracking the state of.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `MainWindow.xaml.cs`.
- **Change type:** Add.
- **Location:** A new method on `MainWindow`, alongside
  `ContentFrame_Navigated`.
- **Dependencies:** `ContentFrame.CanGoBack`, `ContentFrame.Navigated`,
  the previous unit.

### The New Code

```csharp
private void BackButton_Click(object sender, RoutedEventArgs e)
{
    if (ContentFrame.CanGoBack)
    {
        ContentFrame.GoBack();
    }
}
```

### The Updated Project

```csharp
using System.Windows;
using System.Windows.Navigation;

namespace PocketInventory
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            ContentFrame.Navigated += ContentFrame_Navigated;
        }

        private void ContentFrame_Navigated(object sender, NavigationEventArgs e)
        {
            BackButton.IsEnabled = ContentFrame.CanGoBack;
        }

        private void BackButton_Click(object sender, RoutedEventArgs e)  // ← new
        {                                                                  // ← new
            if (ContentFrame.CanGoBack)                                   // ← new
            {                                                              // ← new
                ContentFrame.GoBack();                                     // ← new
            }                                                              // ← new
        }                                                                  // ← new
    }
}
```

`MainWindow` now has two event handlers working together: one that keeps
`BackButton.IsEnabled` truthful at all times, and one, wired via the
`Click="BackButton_Click"` XAML attribute, that actually performs the
navigation — but only ever does anything at all when going back is
genuinely possible.

### Mechanical Walkthrough
1. `if (ContentFrame.CanGoBack)` — (hard concept reappearing) checking the
   same property the previous unit already used, here as a **guard**
   before acting rather than to set another property. Worth noting
   directly: because `IsEnabled` already keeps the button disabled
   whenever `CanGoBack` is `false`, this check should, in ordinary use,
   never actually fail — WPF does not raise `Click` for a disabled
   button. This `if` is a small, deliberate piece of defensive
   programming: correct behavior should never depend on trusting that a
   *different* piece of code (the enabling/disabling logic) never has a
   bug.
2. `ContentFrame.GoBack();` — (first appearance) pops the top entry off
   the `Frame`'s back stack and navigates to it — the exact operation
   predicted earlier, now real.

### Execution trace

Continuing the earlier trace, now with the Back button in play:

```
App launches:
    Back stack: [ ]
    Currently showing: HomePage
    BackButton.IsEnabled: False        (CanGoBack is false)

User clicks "Add Item" → Navigate(new AddItemPage()):
    Back stack: [ HomePage ]
    Currently showing: AddItemPage
    Navigated fires → BackButton.IsEnabled: True   (CanGoBack is true)

User clicks "Back" → GoBack():
    Back stack: [ ]                    (HomePage popped off)
    Currently showing: HomePage
    Navigated fires → BackButton.IsEnabled: False  (CanGoBack is false again)
```

The last line is worth sitting with: `GoBack()` itself *also* raises
`Navigated` — it's still a navigation, just a backward one — which is
exactly why `ContentFrame_Navigated`, written once, correctly re-disables
the button the moment the stack genuinely empties, with no special case
written anywhere for "this specific navigation happened to be a Back."

### CS Lens

**Stack semantics, deepened.** The stack was already proven to
exist, traced by hand from the outside, using the browser-style
default toolbar as evidence. This lesson closes the loop: `GoBack()` is
the actual **pop** operation, `CanGoBack` is a live **is-empty** check,
and both are now driven entirely by this project's own, deliberately
designed control — not a borrowed default toolbar. The push already happens
inside `Navigate(...)`; the pop happens inside `GoBack()`
(this lesson) — together, the complete push/pop pair that defines a stack
as a data structure, both now directly wired to real, visible buttons.

### SE Lens

**Symmetry, this lesson's named principle.** Every `Navigate(...)` call
this project will ever write, for the rest of this curriculum, is a
promise: something pushed a step forward, and something must be able to
undo it. This lesson makes that promise structural rather than
incidental — `GoBack()`/`CanGoBack` aren't features `HomePage` or
`AddItemPage` had to individually opt into; every current and future
`Page` in this project gets a correctly-behaving Back button for free, the
moment it's reachable through `ContentFrame` at all, purely because the
stack lives on the `Frame`, not on any individual screen.

### Commands needed

```bash
dotnet run
```

### Run it

On your Windows machine: the header now shows a "◀ Back" button, dimmed
and unclickable on launch. Click "Add Item" — the Back button becomes
clickable immediately. Click it — you return to the home screen, and the
Back button dims itself again, automatically, with no code written
specifically for "the stack is now empty" as its own case.

### Connection

Every future `Page` this project adds — Item Detail, Settings, and
everything after — automatically gets a correctly-behaving Back button
the instant it's reachable through `ContentFrame`, with zero additional
code, because the mechanism lives entirely on `MainWindow`'s single
`Frame`, not on any individual screen.

---

## Closing

### Connect the Pieces
One concrete trace, extending the earlier one: `MainWindow`'s constructor
subscribes to `ContentFrame.Navigated` using `+=` (Concept Unit 1) —
imperative C# subscription, chosen specifically because this behavior
needs to run after *every* navigation, not just one button's click.
Every time navigation happens anywhere — a forward `Navigate`
call, or this lesson's backward `GoBack()` — `ContentFrame_Navigated`
fires and re-reads `ContentFrame.CanGoBack` (Concept Unit 2), keeping
`BackButton.IsEnabled` truthful at all times with no manual bookkeeping.
Clicking the button, once enabled, calls `ContentFrame.GoBack()`
(Concept Unit 3) — the literal pop half of the push/pop pair this
project's back stack has had, correctly, since the very first
`Navigate(...)` call.

### What Breaks Without This
Temporarily remove the `ContentFrame.Navigated += ContentFrame_Navigated;`
line from `MainWindow`'s constructor, leaving `BackButton_Click` and the
`IsEnabled="False"` starting state untouched. Run the app and click "Add
Item." Real, representative result: the Back button stays visibly
disabled forever, even though the back stack genuinely has an entry in it
now — `ContentFrame.CanGoBack` would correctly report `true` if anything
ever asked it, but nothing does anymore, since the one piece of code that
used to ask was this deleted subscription. The feature doesn't crash; it
just silently stops updating, a real, easy-to-miss category of bug
distinct from an exception. Restore the line and the button starts
tracking state correctly again.

### Exercises

- Add a temporary `Console.WriteLine` (or a WPF-appropriate equivalent —
  research `System.Diagnostics.Debug.WriteLine`, which prints to Visual
  Studio's Output window instead of a nonexistent console in a `WinExe`
  project) inside `ContentFrame_Navigated`, printing `ContentFrame.CanGoBack`.
  Navigate forward twice and back twice in a row, and confirm the printed
  sequence matches this lesson's execution trace exactly.
- Change `BackButton_Click`'s guard from `if (ContentFrame.CanGoBack)` to
  no guard at all — just call `ContentFrame.GoBack()` unconditionally —
  and try to trigger a failure by clicking Back when the stack is
  provably empty (you'll need another way to invoke the method directly,
  since the disabled button itself won't raise `Click`). Research what
  `GoBack()` actually does when the stack is empty, and reconcile that
  with this lesson's SE Lens characterizing the `if` guard as defensive
  rather than strictly load-bearing.
- Draw, on paper, the exact back-stack state after this sequence: Home →
  Add Item → Home (via Back) → Add Item again. Then verify your drawing
  against the app's real behavior.

### Definition of Done
- [ ] The header shows a Back button, disabled on launch.
- [ ] Clicking "Add Item" enables it immediately; clicking it returns to
      Home and disables it again.
- [ ] You can explain, from memory, why `ContentFrame_Navigated` is
      subscribed with `+=` in C# rather than a `Click`-style XAML
      attribute.
- [ ] You reproduced the "button silently stops updating" failure by
      removing the subscription, and restored it.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a Back button driven by Frame.CanGoBack, so every screen gets correct backward navigation for free"`.
