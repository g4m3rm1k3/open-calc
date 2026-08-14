# Lesson 13: Dialogs and Windows

**What this covers:** `MessageBox`, file pickers (`OpenFileDialog`/
`SaveFileDialog`), and secondary application windows — modal vs. modeless,
and how a child window hands data back to whoever opened it.

**What you need to know first:** [Lesson 01](lesson-01-anatomy-of-a-wpf-project.md)
(what a `Window` fundamentally is).

## `MessageBox` — the built-in, zero-setup dialog

```csharp
MessageBox.Show("Item saved successfully.");

var result = MessageBox.Show(
    "Delete this item permanently?",
    "Confirm Delete",
    MessageBoxButton.YesNo,
    MessageBoxImage.Warning);

if (result == MessageBoxResult.Yes)
{
    Items.Remove(selectedItem);
}
```

`MessageBox.Show(...)` — a real `static` method (Lesson 10's `static`
meaning: called on the type itself, `MessageBox.Show(...)`, never
`new MessageBox().Show(...)`) that blocks the calling code until the user
dismisses it, then returns a `MessageBoxResult` — a real `enum` (a closed,
named set of values, same idea as any enum you've seen) whose members
include `Yes`, `No`, `OK`, `Cancel`. The four-argument overload —
message, title, which buttons (`MessageBoxButton.YesNo`, `OKCancel`,
`YesNoCancel`, plain `OK`), and which icon (`Warning`, `Error`,
`Information`, `Question`) — is the real, standard shape for a
confirmation prompt. **This blocks the whole UI thread while shown** —
covered fully in [Lesson 14](lesson-14-async-await-and-the-dispatcher.md)
— nothing else in the app responds until the user answers, which is
exactly the point for a confirmation the user must resolve before
anything continues.

## `OpenFileDialog` / `SaveFileDialog` — real OS file pickers

```csharp
var dialog = new Microsoft.Win32.OpenFileDialog
{
    Filter = "Image files (*.png;*.jpg)|*.png;*.jpg|All files (*.*)|*.*",
    Title = "Select a photo"
};

if (dialog.ShowDialog() == true)
{
    string path = dialog.FileName;
    LoadPhoto(path);
}
```

`Microsoft.Win32.OpenFileDialog` — a real class wrapping the actual
Windows file-picker dialog (not a custom WPF window — the same dialog
Explorer and every other Windows app uses). `Filter` — a specifically
formatted string: pairs of `"Display Name|pattern"` separated by `|`,
multiple filter options separated by another `|` — a real, easy-to-typo
format worth copying from a working example rather than writing from
memory. `dialog.ShowDialog()` returns `bool?` (nullable `bool`, Lesson
00) — `true` if the user picked a file and clicked OK, `false` if they
explicitly cancelled, and `null` is genuinely possible too (the dialog
closed some other way) — which is why the check above is
`== true` rather than just `if (dialog.ShowDialog())`, since a plain
`bool?` can't be used directly in an `if` condition. `SaveFileDialog`
mirrors this exactly for choosing where to write a file, `dialog.FileName`
returning the chosen destination path instead.

## Modal vs. modeless — does the parent window keep responding?

```csharp
var editWindow = new EditItemWindow(selectedItem);
editWindow.ShowDialog();   // MODAL — blocks MainWindow until closed
```

```csharp
var editWindow = new EditItemWindow(selectedItem);
editWindow.Show();          // MODELESS — both windows usable at once
```

`ShowDialog()` — opens the window **modally**: the calling code doesn't
continue past this line, and the parent window is disabled (visibly
greyed/unresponsive to clicks) until the new window closes — the real
mechanism `MessageBox.Show` itself uses underneath. `Show()` — opens
**modelessly**: both windows are independently usable at the same time,
and the calling code continues immediately without waiting. Real
tradeoff: modal is the right choice whenever the parent window's state
genuinely shouldn't change while the child is open (editing one specific
item — letting the user click around the main grid mid-edit invites real
data inconsistency); modeless is right for a tool window meant to stay
open alongside the main one (a floating properties panel, a live log
viewer).

## Getting data back out of a closed window

```csharp
public partial class EditItemWindow : Window
{
    public Item EditedItem { get; private set; }

    public EditItemWindow(Item item)
    {
        InitializeComponent();
        EditedItem = item;
        DataContext = EditedItem;
    }

    private void SaveButton_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = true;
        Close();
    }

    private void CancelButton_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }
}
```

```csharp
var editWindow = new EditItemWindow(selectedItem);
if (editWindow.ShowDialog() == true)
{
    RefreshGrid();
}
```

`EditedItem` — a real `public` property (Lesson 00), the actual channel
data flows back through: because `Item` is a reference type (Lesson 00),
edits made to its bound properties inside `EditItemWindow` are already
visible to whoever holds the same reference in `MainWindow` — no explicit
"send the data back" step is needed for the object's own fields, only for
learning *whether the edit was actually confirmed*. `DialogResult = true;`
— a real `Window` property, specifically meaningful only for a window
opened via `ShowDialog()`: setting it **both** closes the window and
becomes the return value `ShowDialog()` produces back at the call site —
`editWindow.ShowDialog() == true` above is reading exactly this. Setting
`DialogResult` implicitly calls `Close()`, so the explicit `Close();` line
after it is technically redundant here but common and harmless — shown
explicitly for clarity about what's actually happening.

## `Owner` — telling a child window which window opened it

```csharp
var editWindow = new EditItemWindow(selectedItem)
{
    Owner = this,
    WindowStartupLocation = WindowStartupLocation.CenterOwner
};
editWindow.ShowDialog();
```

`Owner = this` — sets the real `Owner` property (`this` referring to
`MainWindow` inside its own code-behind), which does two concrete
things: the child window minimizes/restores/closes together with its
owner (closing `MainWindow` while `EditItemWindow` is open closes it too,
rather than leaving an orphaned window behind), and
`WindowStartupLocation.CenterOwner` can then center the new window over
its owner rather than the screen. Skipping `Owner` on a window meant to
be a child of another is a real, common source of "a stray window is
left open after the main one closes" bugs.

## SE Lens

Passing data back via a `public` property read after `ShowDialog()`
returns (rather than, say, the child window reaching into `MainWindow`'s
fields directly to update them itself) keeps the dependency direction
one-way: `EditItemWindow` doesn't need to know anything about
`MainWindow`'s internals to do its job, only about the `Item` it was
handed and whether it was confirmed — the same "logic that doesn't reach
into named controls it doesn't own" principle Lesson 07 named for
ViewModels, applied here to window-to-window communication instead of
view-to-viewmodel.

## What to check first in your assigned project

- Every `ShowDialog()` call — confirm `Owner` is set; an unset `Owner` on
  a real child window is a common, low-risk "make it better" fix.
- A `MessageBox.Show` used for something that isn't actually a yes/no/ok
  confirmation (displaying a large block of read-only info, say) is
  often better replaced by a real small custom `Window` — `MessageBox`'s
  layout is fixed and not stylable via the app's own `Style`s (Lesson 08).
- Any window returning data via public mutable fields set directly by
  the parent (instead of the `DialogResult` + property pattern above) —
  both work, but the pattern above is the more standard, more testable
  shape worth recognizing as the convention.

## Next

[Lesson 14 — Async/Await and the Dispatcher](lesson-14-async-await-and-the-dispatcher.md)
covers why a slow operation (a database call, a network request) freezes
every window in the app — including any dialog — and the real fix.
