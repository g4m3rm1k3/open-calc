# Lesson 23: Validation and Debugging WPF

**What you will build:** a real, deliberately typo'd binding, proven to
fail silently in the UI while logging its exact cause to the Output
window — then real `IDataErrorInfo` validation, proven to drive WPF's
own built-in red-border feedback with zero manual styling.

**What you need to know first:** [Lesson 14](lesson-14-data-binding-fundamentals.md)
(`{Binding}`, `INotifyPropertyChanged`).

**Terms introduced in this lesson:**
- **`IDataErrorInfo`** — a real interface exposing a per-property
  validation-error indexer, connected to a binding via
  `ValidatesOnDataErrors=True`.
- **Indexer** — a special member (`this[string columnName]`) letting an
  object be used with `[ ]` bracket syntax, the mechanism
  `IDataErrorInfo` uses to ask "what's wrong with this specific
  property."

**Objects and methods used:**

**`IDataErrorInfo`**
- *What it is:* a real interface in `System.ComponentModel`.
- *Implementation:* `string Error { get; } string this[string
  columnName] { get; }` — confirmed against the real .NET interface
  declaration.
- *Its use:* implemented directly on `Item` in this lesson's second
  unit, proven to drive real, visible validation feedback.

---

## Concept Unit: A Broken Binding Fails Silently — and Logs Loudly

### The Problem

Lesson 14 proved `{Binding Name}` resolves correctly against a real
`DataContext`. Does a **typo'd** binding path — `{Binding Naem}` — throw
a compile error, a runtime crash, or something else entirely?

### Introduce the Concept in Isolation

```xml
<TextBlock Text="{Binding Naem}" />
```

Running this app under the debugger (F5), against an `Item`
`DataContext` (Lesson 14's own class, with a real `Name` property):
**the application does not crash, and compiles cleanly.** The
`TextBlock` simply renders blank — no visible error anywhere on screen.
Opening Visual Studio's **Debug → Windows → Output** panel while the app
is running shows a real, specific line:

```
System.Windows.Data Error: 40 : BindingExpression path error:
'Naem' property not found on 'object' ''Item' (HashCode=...)'.
BindingExpression:Path=Naem; DataItem='Item' (HashCode=...);
target element is 'TextBlock' (Name=''); target property is 'Text' (type 'String')
```

This proves the real, actionable fact this lesson exists to establish:
a broken binding never crashes and never shows an on-screen error — it
fails **silently in the UI** and logs its real cause to the Output
window, every single time, whether anyone is watching it or not.
Reading this specific line names the exact wrong property text
(`'Naem' property not found`), the real object it was evaluated against
(`DataItem='Item'`), and the exact control it belongs to
(`target element is 'TextBlock'`) — enough to fix the real bug directly,
without guessing.

### Discard

This typo'd binding is disposable; correcting `Naem` back to `Name`
resolves it, confirmed by the blank `TextBlock` correctly showing real
text and the Output window producing no further error line.

### Mechanical Walkthrough

- `{Binding Naem}` — **(b) hard concept reappearing** as binding syntax
  itself (Lesson 14); the typo and its real, observed consequence —
  silent UI failure plus a specific logged line — is this unit's entire
  point.

### SE Lens

The real alternative to reading the Output window — guessing at which
binding is broken by staring at blank controls, or adding temporary
`Console.WriteLine` calls throughout the ViewModel — works eventually,
at real cost in time; the Output window already contains the exact
answer, every time, for free, the moment the app runs under the
debugger. This is genuinely the single highest-leverage debugging habit
for any real WPF codebase, proven directly by how specific and
actionable the logged line above already was, with zero extra
instrumentation written.

## Concept Unit: `IDataErrorInfo` — Validation That Drives Real UI Feedback

### The Problem

Lesson 11's `What Breaks Without This` proved removing a hand-written
`if` check silently let invalid data through with no compiler warning.
Is there a real, structured way to validate a bound property that also
gives the user visible feedback, rather than relying on a
developer-remembered `if` check somewhere?

### Introduce the Concept in Isolation

```csharp
public class Item : INotifyPropertyChanged, IDataErrorInfo
{
    public string Name { get; set; } = "";

    public string Error => string.Empty;

    public string this[string columnName]
    {
        get
        {
            return columnName switch
            {
                nameof(Name) when string.IsNullOrWhiteSpace(Name) => "Name is required.",
                _ => string.Empty
            };
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;
}
```

```xml
<TextBox Text="{Binding Name, ValidatesOnDataErrors=True, UpdateSourceTrigger=PropertyChanged}" />
```

Clearing the `TextBox` entirely (deleting all typed text) produces a
real, visible effect with **zero styling code written anywhere**: WPF
draws a red border around the `TextBox` automatically. Typing any
non-blank character removes it, live. This is real, structured
validation, connected directly to the UI, with no manual
`Trigger`/`Style` (Lesson 16) written by hand for this specific case.

### Discard

Nothing here is disposable — this is the real, standard shape for
bound-property validation for the rest of this series.

### Mechanical Walkthrough

- `: INotifyPropertyChanged, IDataErrorInfo` — **(b) hard concept
  reappearing** for `INotifyPropertyChanged` (Lesson 14); `IDataErrorInfo`
  — **(a) first appearance**, the real interface named in this lesson's
  Header.
- `public string Error => string.Empty;` — **(b) hard concept
  reappearing**, expression-bodied property (Lesson 02); `Error` itself
  is a whole-object validation message, genuinely rare to use in
  practice — returning an empty string here is correct and complete for
  this lesson's own scope.
- `public string this[string columnName]` — **(a) first appearance** of
  an **indexer**: a special member letting `Item` be used with `[ ]`
  bracket syntax — `item["Name"]` — the same bracket syntax already
  familiar from indexing into an array or a `Dictionary<K,V>`, defined
  here to mean "give me the validation error for this specific property
  name," not array element access.
- `columnName switch { nameof(Name) when string.IsNullOrWhiteSpace(Name)
  => "Name is required.", _ => string.Empty }` — **(a) first appearance**
  of a **switch expression**: unlike an older `switch` *statement*
  (`case`/`break` blocks), this produces a value directly. `nameof(Name)`
  — **(b) hard concept reappearing** from Lesson 02, matching this arm
  only when `columnName` equals the literal text `"Name"`, generated
  safely rather than hardcoded. `when string.IsNullOrWhiteSpace(Name)` —
  **(a) first appearance** of a **`when` clause**: an extra condition
  attached to a match arm, only matching when both the pattern *and*
  this condition hold. `_ => string.Empty` — **(a) first appearance** of
  the **discard pattern** `_` as a trailing default arm: matches
  anything not already matched above, here meaning "no error."
- `ValidatesOnDataErrors=True` — **(a) first appearance.** The real
  binding property that activates this whole mechanism: WPF calls
  `item["Name"]` automatically whenever the bound value changes, and a
  non-empty return string is what triggers the real, built-in red-border
  visual proven above — no manual `Style`/`Trigger` required to get
  *some* visible feedback, though customizing what that feedback looks
  like beyond the default red border does use exactly that mechanism
  from Lesson 16.

### CS Lens

Not a hard CS concept in the design-pattern sense — this is boundary
validation (already named generically in this codebase's own prior
material) with a real, structured connection point into WPF's own
rendering, rather than validation logic living disconnected from any
visible feedback at all.

## Connect the pieces

One trace: a typo'd binding path never crashes and shows nothing on
screen — proven directly, and its real cause found, specifically and
actionably, in the Output window every single time. `IDataErrorInfo`'s
indexer, connected via `ValidatesOnDataErrors=True`, gives bound-property
validation a real, structured shape that WPF itself renders feedback
for automatically — proven by a live red border with zero manual
styling — closing the exact silent-failure risk Lesson 11's own `What
Breaks` section demonstrated for a hand-written, easily-forgotten `if`
check.

## What breaks without this

Remove `ValidatesOnDataErrors=True` from the `TextBox`'s binding,
leaving `IDataErrorInfo` fully implemented on `Item` otherwise unchanged.
Real, observed result: clearing the `TextBox` produces **no red border
at all** — `Item`'s indexer is real and correct, but nothing is asking
it anything, since `ValidatesOnDataErrors=True` is the actual switch
connecting a binding to this validation mechanism at all. Direct,
provable proof that implementing `IDataErrorInfo` alone is necessary but
not sufficient; the binding itself has to opt in.

## Exercises

1. Add a second validated property (`Value`, rejecting a negative
   number) to `Item`'s indexer, following the same `switch`-expression
   shape. Confirm both properties validate independently — an invalid
   `Name` doesn't spuriously flag `Value`, and vice versa.
2. Deliberately cause a *second* kind of silent binding failure — bind a
   `Slider`'s `Value` (a real `double`-typed property) directly to a
   `string`-typed source property with no converter (Lesson 17) — and
   read the real Output window error this specific mismatch produces,
   confirming it names the type mismatch rather than a missing-property
   error.

## Definition of Done

- [ ] You reproduced the real silent binding failure and found its exact
      cause in the Output window.
- [ ] You implemented `IDataErrorInfo` and confirmed the real, built-in
      red-border feedback with zero manual styling.
- [ ] You reproduced the missing-`ValidatesOnDataErrors` failure and
      understood why implementing the interface alone wasn't enough.
- [ ] You completed both exercises.

## Series complete

Every construct from Arc 1's C# foundations through Arc 2's full WPF
arc — XAML syntax, every layout panel, core controls, routed events,
data binding, MVVM, resources/styles, templates/converters, dependency
properties, collections, `DataGrid`, dialogs, async/`Dispatcher`, and
validation/debugging — now has full, isolated, proven treatment, with
nothing left unexplained. Jump back to any lesson by topic via this
series' [README](README.md) as you hit it in real work.
