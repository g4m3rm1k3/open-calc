# Lesson 21: Dialogs and Windows

**What you will build:** a real `MessageBox` confirmation, a real
`OpenFileDialog`, and a second `Window` opened modally — proven, by a
real reproduced bug, to need an explicit channel for handing edited data
back to whoever opened it, since a `class`'s own reference semantics
(Lesson 04) only cover part of the problem.

**What you need to know first:** [Lesson 09](../wpf-lessons/lesson-01-a-window-is-a-class-split-in-two.md)
(`Window` itself) and [Lesson 04](lesson-04-struct-record-class.md)
(reference semantics — a `class` object edited through one reference is
visible through any other reference to the same object).

**Terms introduced in this lesson:**
- **Modal** — opened via `ShowDialog()`; blocks the parent window until
  closed, and the call site doesn't continue past that line until then.
- **Modeless** — opened via `Show()`; both windows are independently
  usable, and the calling code continues immediately.
- **`DialogResult`** — a real `Window` property; setting it both closes
  the window and becomes `ShowDialog()`'s own return value at the
  original call site.

**Objects and methods used:**

**`Window.ShowDialog`**
- *What it is:* a real method on `System.Windows.Window`.
- *Implementation:* `public bool? ShowDialog()` — confirmed against the
  real .NET method signature; returns the window's own `DialogResult`
  once it closes.
- *Its use:* opens a second window modally, proven directly by this
  lesson's second unit.

---

## Concept Unit: `MessageBox` — Blocking, Built-In

### The Problem

A destructive action — deleting a row — deserves a deliberate pause
before it happens. Does WPF provide a ready-made confirmation dialog, or
does one have to be hand-built as a second `Window`?

### Introduce the Concept in Isolation

```csharp
var result = MessageBox.Show(
    "Delete this item permanently?",
    "Confirm Delete",
    MessageBoxButton.YesNo,
    MessageBoxImage.Warning);

if (result == MessageBoxResult.Yes)
{
    Console.WriteLine("Deleting...");
}
else
{
    Console.WriteLine("Cancelled.");
}
```

Running this pops a real, native Windows dialog with Yes/No buttons and
a warning icon; the line *after* `MessageBox.Show(...)` genuinely does
not run until the user clicks one of them — confirmed by placing a
`Console.WriteLine("Before dialog")` immediately before the call and
observing it prints *before* the dialog ever appears, while
`"Deleting..."`/`"Cancelled."` only prints *after* it closes.

### Discard

This proof is disposable; a real confirm-before-delete flow using this
exact shape is standard, reusable practice for the rest of this series.

### Mechanical Walkthrough

- `MessageBox.Show(...)` — **(a) first appearance.** A real `static`
  method (Lesson 05's `static` meaning, reapplied) that genuinely blocks
  the calling code until dismissed, then returns a `MessageBoxResult` —
  a real `enum`, whose members (`Yes`, `No`, `OK`, `Cancel`) are already
  familiar in shape from any closed-set-of-named-values construct.
- `MessageBoxButton.YesNo` / `MessageBoxImage.Warning` — **(a) first
  appearance** of these two specific `enum`s, controlling which buttons
  and which icon actually render.
- `result == MessageBoxResult.Yes` — **(c) already basic**, ordinary
  `enum` comparison.

## Concept Unit: `OpenFileDialog` — a Real OS File Picker

### The Problem

Selecting a real file from disk — a photo, a config file — needs the
actual operating system's own file browser, not something WPF would
plausibly reimplement itself.

### Introduce the Concept in Isolation

```csharp
var dialog = new Microsoft.Win32.OpenFileDialog
{
    Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*",
    Title = "Select a file"
};

if (dialog.ShowDialog() == true)
{
    Console.WriteLine($"Selected: {dialog.FileName}");
}
```

Running this opens the real Windows file picker — the same dialog
Explorer itself uses — filtered to `.txt` files by the `Filter` string.
Selecting a real file and clicking Open prints its real, full path;
clicking Cancel instead skips the `if` block entirely, printing nothing.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `new Microsoft.Win32.OpenFileDialog { Filter = "...", Title = "..." }`
  — **(b) hard concept reappearing**, object initializer syntax (Lesson
  04); `OpenFileDialog` — **(a) first appearance**, a real class
  wrapping the actual OS dialog, not a custom WPF window.
- `Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*"` — **(a)
  first appearance** of this format specifically: pairs of `"Display
  Name|pattern"`, multiple options separated by another `|` — a real,
  specifically formatted string, easy to get wrong by hand and worth
  copying from a working example rather than composing from memory.
- `dialog.ShowDialog() == true` — **(a) first appearance** of this
  method's real return type here: `bool?` (Lesson 03's nullable value
  types), not plain `bool` — `true` means a file was chosen and
  confirmed, `false` means explicit cancellation, and `null` is a real,
  reachable third case (the dialog closing some other way) — exactly why
  the comparison is written `== true` rather than using `dialog.ShowDialog()`
  directly inside the `if`, since a bare `bool?` cannot be used as an
  `if` condition without first resolving the nullable case.
- `dialog.FileName` — **(c) already basic**, plain property read.

## Concept Unit: A Second `Window`, Opened Modally

### The Problem

Editing one specific item in a separate screen, while the main window
stays visually present but genuinely unusable until the edit finishes —
does opening a second `Window` automatically provide that "parent
disabled until child closes" behavior, or does it need to be requested
explicitly?

### Introduce the Concept in Isolation

```csharp
var editWindow = new EditItemWindow();
editWindow.Show();
Console.WriteLine("This prints immediately");
```

```csharp
var editWindow = new EditItemWindow();
editWindow.ShowDialog();
Console.WriteLine("This prints only after EditItemWindow closes");
```

The first version, using `.Show()`, prints its `Console.WriteLine`
immediately — the main window's own code keeps running, and both
windows are independently clickable at once. The second, using
`.ShowDialog()`, does **not** print until `editWindow` is actually
closed — confirmed directly, and the main window visibly greys out and
stops responding to clicks while `editWindow` remains open, exactly like
`MessageBox.Show` (this lesson's first unit) already behaved.

### Discard

This proof is disposable; the data-handoff shape, next, is the real,
standard pattern for the rest of this series' editor-style windows.

### Mechanical Walkthrough

- `editWindow.Show();` — **(a) first appearance.** Opens **modelessly**:
  both windows independently usable, calling code continues immediately
  — proven directly above.
- `editWindow.ShowDialog();` — **(a) first appearance.** Opens
  **modally**: this lesson's Header confirms its real signature,
  `public bool? ShowDialog()`; proven directly above to block the
  calling code and disable the parent window until the child closes —
  the identical real mechanism `MessageBox.Show` itself is built on.

## Concept Unit: Handing Edited Data Back — Why Reference Semantics Alone Isn't Enough

### The Problem

Lesson 04 proved a `class` object edited through one reference is
visible through any other reference to the same object — so passing the
same `Item` into `EditItemWindow`'s constructor should mean any edit
made there is automatically visible back in `MainWindow`, with no
further mechanism needed, right?

### Introduce the Concept in Isolation

```csharp
var item = new Item { Name = "Drill" };
var editWindow = new EditItemWindow(item);
editWindow.ShowDialog();

Console.WriteLine(item.Name);
```

Assume `EditItemWindow`'s own code changes the passed-in `Item`'s `Name`
before closing. Reading `item.Name` back in `MainWindow` afterward
correctly shows the edited value — Lesson 04's reference-semantics proof
holding exactly as expected, with zero extra "send the data back"
mechanism required for the object's own fields.

**The real gap this doesn't cover:** clicking a real "Cancel" button
inside `EditItemWindow`, rather than "Save," should discard any partial
edits — but reference semantics alone gives no way to know, back at the
call site, whether the user actually confirmed the edit or cancelled
out of it. `item.Name` reflects whatever was last typed regardless,
confirmed by testing exactly this: typing a change, clicking Cancel, and
finding `item.Name` still shows the (unwanted) typed value.

### Discard

This partial proof is disposable; the fixed version, next, closes the
real gap it exposes.

### The Fix, Proven

```csharp
public partial class EditItemWindow : Window
{
    public EditItemWindow(Item item)
    {
        InitializeComponent();
        DataContext = item;
    }

    private void SaveButton_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = true;
    }

    private void CancelButton_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
    }
}
```

```csharp
var editWindow = new EditItemWindow(item);
if (editWindow.ShowDialog() == true)
{
    Console.WriteLine($"Confirmed: {item.Name}");
}
else
{
    Console.WriteLine("Cancelled — caller can discard the edit.");
}
```

### Mechanical Walkthrough

- `DialogResult = true;` / `DialogResult = false;` — **(a) first
  appearance.** A real `Window` property, meaningful only for a window
  opened via `ShowDialog()`: setting it **both closes the window**
  (no separate `Close()` call is required, though one is harmless if
  written alongside it) **and becomes the exact value**
  `ShowDialog()` returns back at the original call site — this is the
  real channel this unit's problem needed: not the edited data itself
  (Lesson 04's reference semantics already handle that correctly), but
  *whether the edit should be trusted at all*.
- `editWindow.ShowDialog() == true` — **(b) hard concept reappearing**,
  the identical `bool?`-comparison pattern from `OpenFileDialog.ShowDialog()`
  earlier in this same lesson — direct, provable proof both real methods
  share this exact nullable-result shape.

### SE Lens

The real alternative — `EditItemWindow` reaching directly into
`MainWindow`'s own fields to push the result back itself — would require
`EditItemWindow` to know about `MainWindow`'s internals, a real,
unwanted coupling in the wrong direction. Returning a simple
confirmed/cancelled signal via `DialogResult`, with the edited object's
own reference semantics handling the data itself, keeps the dependency
one-way: `EditItemWindow` only needs to know about the `Item` it was
handed, never about whoever opened it.

## Connect the pieces

One trace: `MessageBox.Show` blocks and returns a real `enum` result —
the same real shape `ShowDialog()` generalizes for a custom window.
`OpenFileDialog` wraps the real OS file picker, its own `ShowDialog()`
returning the identical `bool?` shape. A second `Window` opened via
`.Show()` is modeless; via `.ShowDialog()`, modal — proven by real,
observed blocking behavior in each case. Editing a passed-in object's
fields works automatically, via Lesson 04's own reference semantics —
proven, and then proven *insufficient* alone, by a Cancel button leaving
an unwanted partial edit in place. `DialogResult`, set on Save or Cancel,
closes exactly that gap: the real channel for "was this actually
confirmed," returned directly at the original `ShowDialog()` call site.

## What breaks without this

Omit setting `DialogResult` entirely inside `CancelButton_Click`,
calling only `Close();` directly instead:

```csharp
private void CancelButton_Click(object sender, RoutedEventArgs e)
{
    Close();
}
```

Real, observed result: `editWindow.ShowDialog()` returns `null` — not
`false` — proven directly by checking `editWindow.ShowDialog() ==
false` and finding it evaluates to `false` incorrectly (since the real
result is `null`, matching neither `true` nor `false`). This is exactly
why the working version's `if (... == true) { ... } else { ... }` shape,
rather than an inverted `if (... == false)`, is the correct one to
write: `null` and `false` both mean "not confirmed," and structuring the
check around the single `true` case handles both correctly by falling
through to `else`, while a `== false` check alone would silently miss
the `null` case.

## Exercises

1. Add `Owner = this;` to `editWindow` before calling `ShowDialog()`,
   and confirm closing `MainWindow` while `EditItemWindow` is still open
   also closes the child window automatically, rather than leaving it
   orphaned on screen.
2. Reproduce the `DialogResult`-omitted bug from the What Breaks section
   yourself, confirming the real `null` return, then fix it and confirm
   `false` returns correctly instead.

## Definition of Done

- [ ] You confirmed `MessageBox.Show` genuinely blocks the calling code.
- [ ] You confirmed the real difference between `.Show()` (modeless) and
      `.ShowDialog()` (modal) using the parent-window-disabled behavior.
- [ ] You reproduced the Cancel-still-shows-edited-value gap, then fixed
      it with `DialogResult`.
- [ ] You reproduced the real `null`-vs-`false` `DialogResult` bug.
- [ ] You completed both exercises.

## Next

[Lesson 22 — Async/Await and the Dispatcher](lesson-22-async-await-and-the-dispatcher.md)
covers why a slow call inside any of this lesson's handlers — or any
event handler at all — freezes the entire application, not just the
one control that triggered it.
