# Lesson 15: Validation and Debugging WPF

**What this covers:** catching bad input before it reaches your data
(`IDataErrorInfo`), and the specific, WPF-only debugging skill of reading
binding failures out of Visual Studio's Output window — the single
highest-leverage skill for working in an unfamiliar WPF codebase under
time pressure.

**What you need to know first:** [Lesson 06](lesson-06-data-binding-fundamentals.md).

## Binding failures fail silently in the UI — and loudly in the Output window

This is the fact this whole lesson exists to make actionable: a broken
`{Binding}` — a typo'd property name, a `null` `DataContext`, a missing
converter — never throws an exception and never crashes the app. The
bound control just shows blank, or its default value, with no visible
error anywhere in the running window. **The real error is written to
Visual Studio's Output window, every time, while debugging.** With the
app running under the debugger (F5, not `dotnet run` from a plain
terminal), open **Debug → Windows → Output**, and a typo'd binding path
shows something close to:

```
System.Windows.Data Error: 40 : BindingExpression path error:
'Naem' property not found on 'object' ''Item' (HashCode=... )'.
BindingExpression:Path=Naem; DataItem='Item' (HashCode=...);
target element is 'TextBlock' (Name=''); target property is 'Text' (type 'String')
```

Reading this line, in order: `'Naem' property not found` — the exact
misspelled property name, the actual bug. `DataItem='Item'` — confirms
what object the binding was actually evaluated against, useful for
catching a `DataContext` set to the wrong object entirely, not just a
typo. `target element is 'TextBlock'` — which specific control on screen
this failure belongs to, useful when several bindings could plausibly be
the broken one. **This single skill — actually reading this window
instead of guessing — resolves the majority of "why is this blank"
confusion faster than any other debugging approach**, and it costs
nothing extra: it's already being written, every time, whether you're
looking or not.

## The most common real causes, in order of likelihood

1. **A typo in the binding path** (`{Binding Naem}`) — the Output window
   names the exact wrong property text directly, as shown above.
2. **`DataContext` is `null` or the wrong object** — every binding on that
   element fails at once, all reporting the same `DataItem='(null)'` (or
   the unexpected type) rather than one isolated property.
3. **A property that isn't `public`** — bindings only see `public`
   members (Lesson 00's access modifiers); a binding path pointing at a
   `private`/`internal` property fails exactly like a typo does.
4. **Case mismatch** — `{Binding itemName}` against a real `ItemName`
   property (C# convention capitalizes property names) fails; binding
   paths are case-sensitive.
5. **A missing converter, or a converter throwing** — an exception
   thrown *inside* an `IValueConverter.Convert` (Lesson 09) also shows up
   in the Output window, usually with the real .NET exception message
   attached, not just a generic binding-path complaint.

## `IDataErrorInfo` — validation at the boundary, shown in the UI

```csharp
public class Item : INotifyPropertyChanged, IDataErrorInfo
{
    public string Name { get; set; } = "";
    public decimal Value { get; set; }

    public string Error => string.Empty; // object-level error, rarely used

    public string this[string columnName]
    {
        get
        {
            return columnName switch
            {
                nameof(Name) when string.IsNullOrWhiteSpace(Name) => "Name is required.",
                nameof(Value) when Value < 0 => "Value cannot be negative.",
                _ => string.Empty
            };
        }
    }
}
```

```xml
<TextBox Text="{Binding Name, ValidatesOnDataErrors=True, UpdateSourceTrigger=PropertyChanged}" />
```

`IDataErrorInfo` — a real interface, two members: `Error` (a whole-object
validation message, rarely used in practice) and an **indexer**,
`this[string columnName]` — first appearance: a special C# member that
lets an object be used with `[ ]` syntax, `item["Name"]`, the same
bracket syntax as indexing into an array or a `Dictionary<K,V>`, defined
here to mean "give me the validation error for this specific property
name" rather than array element access. `columnName switch { ... }` —
C#'s **switch expression** (distinct from Java's older `switch`
statement — this is an expression, it produces a value directly rather
than requiring `case`/`break` blocks), with `when` clauses (first
appearance: an extra condition attached to a specific `case`-like arm,
only matching when both the pattern *and* the `when` condition hold) and
a trailing `_ =>` default arm (`_` meaning "anything else, no error").
`ValidatesOnDataErrors=True` on the binding — this is the flag that
actually connects a `TextBox` to this mechanism: WPF calls
`item["Name"]` automatically whenever the bound value changes, and a
non-empty return string makes WPF apply a real, built-in visual — a red
border by default — around that specific control, with no manual styling
required to get *some* visible feedback (a `Style`'s `Trigger` on
`Validation.HasError`, not shown here, is the real way to customize
*what* that feedback looks like beyond the default red border).

`INotifyDataErrorInfo` is the newer, `async`-friendly cousin of
`IDataErrorInfo` (supports multiple errors per property, and validation
that itself takes time — a uniqueness check against a database, say) —
real, and worth knowing exists, but `IDataErrorInfo` above covers the
large majority of real validation needs with substantially less
ceremony, and is the one worth reaching for first.

## Reading a real exception's stack trace in WPF specifically

A genuine unhandled exception (not a silent binding failure) in WPF
often surfaces from `Application.Run` or deep inside WPF's own dispatcher
loop rather than pointing cleanly at your code — the real, practical
approach: read the stack trace **from the top down**, and find the first
line that names a file in your own project (not `PresentationFramework.dll`
or another WPF assembly) — that's almost always the real point of
failure, with everything above it being WPF's own internal call chain
getting there.

```csharp
private void App_DispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e)
{
    MessageBox.Show($"Unexpected error: {e.Exception.Message}");
    e.Handled = true; // prevents the whole app from crashing
}
```

Wiring `Application.DispatcherUnhandledException` (in `App.xaml.cs`) to a
handler like this — real, and the standard place a shipped WPF app
catches anything that slipped through — turns an otherwise-fatal
unhandled exception into a message box the user can dismiss, with the app
continuing to run afterward. `e.Handled = true;` is the specific line
doing that; leaving it unset means the exception still terminates the
process even after this handler runs.

## What to check first in your assigned project

- Any control showing unexpectedly blank — open the Output window before
  touching a single line of code; the exact broken binding is very
  likely already logged there.
- Search the project for `IDataErrorInfo`/`INotifyDataErrorInfo` — if
  present, that names exactly which model classes have real, structured
  validation already; if absent entirely on a form that clearly needs
  input validation, that's a concrete "make it better" candidate.
- Check `App.xaml.cs` for a `DispatcherUnhandledException` handler — its
  absence means a genuine unhandled exception anywhere in the app closes
  the whole process immediately with just a default Windows crash
  dialog, worth knowing before you're debugging a crash under deadline
  pressure and wondering why there's no useful in-app message.

## You've now touched every piece

Lessons 00–15 cover the full path from an empty project to a real,
validated, MVVM-structured, async-safe WPF application — everything a
typical assignment project's own code is built from. Jump back to any
lesson by topic as you hit it in your real assignment; the
[README](README.md) index is the fastest way back in.
