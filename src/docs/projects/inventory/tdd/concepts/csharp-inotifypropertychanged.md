# Concept: `INotifyPropertyChanged`

**What you'll understand by the end:** how a C# property can actively announce its own changes, and why that's exactly what a stale WPF binding is missing.

**Prerequisites:** `wpf-data-binding-and-datacontext.md` (this file fixes the exact staleness that file's own isolated example ends on).

## Setup

*(Full walkthrough of these mechanics: `../wpf-lessons/HOW-TO-RUN-EXAMPLES.md`.)*

```
dotnet new wpf -n ConceptDemo -o ConceptDemo
cd ConceptDemo
```
This continues directly from `wpf-data-binding-and-datacontext.md`'s own
`ConceptDemo` — same project, `Message`'s setter is the only change.

## The Problem

`wpf-data-binding-and-datacontext.md` proved a bound `TextBlock` reads a property's value once, but never learns about a later plain assignment to it. Something has to actively tell WPF "this specific property, on this specific object, just changed — go re-read it" — and that something has to be real code, not a hope that WPF is watching.

## The Isolated Example

`MainWindow.xaml` is unchanged from `wpf-data-binding-and-datacontext.md`
— this concept only touches `MainWindow.xaml.cs`. Replace that whole
file's `public partial class MainWindow : Window { ... }` — the entire
class, including its opening line — with this (note the added `,
INotifyPropertyChanged` after `Window`): `Message` becomes a full
property that raises a notification on every set, and the class
declares it supports this:

```csharp
public partial class MainWindow : Window, INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    private string _message = "Hello";
    public string Message
    {
        get => _message;
        set
        {
            _message = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Message)));
        }
    }

    public MainWindow()
    {
        InitializeComponent();
        DataContext = this;
        Loaded += MainWindow_Loaded;
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        Console.WriteLine($"BoundText.Text once the window is actually live: '{BoundText.Text}'");

        Message = "Changed after binding";
        Console.WriteLine($"Message property is now: '{Message}'");
        Console.WriteLine($"BoundText.Text with NO manual refresh: '{BoundText.Text}'");
    }
}
```

**Real output:**
```
BoundText.Text once the window is actually live: 'Hello'
Message property is now: 'Changed after binding'
BoundText.Text with NO manual refresh: 'Changed after binding'
```

**What this proves:** with no manual refresh call anywhere in this code — `BoundText.Text` really does follow `Message`'s new value, automatically, the moment it changes. Compared directly against `wpf-data-binding-and-datacontext.md`'s own identical scenario (same window, same click-free timeline, same assignment), the *only* difference is `Message`'s own setter now raises `PropertyChanged` — proof that one event, correctly raised, is the entire mechanism closing the gap.

## Mechanical Walkthrough

- `: Window, INotifyPropertyChanged` — **`INotifyPropertyChanged`** is a real, standard .NET **interface** (a contract naming members a class promises to provide, without saying how) with exactly one member. Implementing it is how a class advertises "I know how to announce my own property changes" to anything that cares — WPF's binding engine specifically checks for it.
- `public event PropertyChangedEventHandler? PropertyChanged;` — the interface's one required member: an **event** (already-familiar mechanism from `wpf-click-event-handling.md`, applied here to something a class raises about *itself* rather than something a control raises about user input). The `?` marks it nullable — genuinely `null` until at least one subscriber (WPF's binding engine, here) attaches.
- `private string _message` / `public string Message { get; set; }` — a **backing field** plus a full property with hand-written `get`/`set` bodies, replacing the auto-property from `wpf-data-binding-and-datacontext.md`; needed because the setter now has to *do* something beyond storing the value.
- `PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Message)));` — raises the event. `?.` (already-known null-conditional syntax) skips the call entirely if nothing has subscribed yet, avoiding a crash. `nameof(Message)` — **(a) first appearance** — produces the literal string `"Message"` from the property's own name, checked by the compiler (a typo'd string literal `"Mesage"` would compile silently and never notify correctly; `nameof(Message)` cannot be misspelled without the file failing to compile at all).

## CS Lens

This is the **Observer pattern** again — the same shape `wpf-click-event-handling.md` already named for `Button.Click` — but the roles are reversed: there, WPF's own control raised an event about *user input*; here, ordinary application code raises an event about *its own state changing*, and WPF is the subscriber reacting to it.

Also recognized in: reactive programming frameworks generally (RxJS, Kotlin Flow), Java's `PropertyChangeListener` (the direct historical ancestor of this exact .NET interface), spreadsheet engines internally re-evaluating dependent cells the instant a source cell's own value changes.

## SE Lens

Writing this by hand for every property in a real application is real, repetitive boilerplate — the backing field, the full property, the identical `PropertyChanged?.Invoke(...)` line, once per property. Production WPF code very commonly uses a source-generator or base-class helper to eliminate exactly this repetition (not introduced here, on purpose — the manual version is what actually explains *why* the shortcut works, once one is used). The `nameof(...)` discipline above is the same tradeoff `sql-parameterized-queries-injection.md`-style boundary-safety choices generally are: slightly more to type, in exchange for a whole class of silent, hard-to-spot bugs (a notification for the wrong property name) becoming a compile error instead.

## Connection

Directly closes the gap `wpf-data-binding-and-datacontext.md` leaves open. Reuses the `event` mechanism from `wpf-click-event-handling.md`, applied to a different kind of event (state change, not user input) with a different one-member interface providing the contract.

## Try It Yourself

1. Remove `: INotifyPropertyChanged` from the class declaration but leave the `PropertyChanged` event and its raise call in place. Rebuild and rerun — reason about (and confirm) whether the binding still updates, given WPF's binding engine specifically checks for the *interface*, not just the presence of a same-shaped event.
2. Change `nameof(Message)` to the literal string `"Wessage"` (a typo) and rerun — confirm the UI silently stops updating again, with no error anywhere, the exact bug class `nameof` exists to prevent.
3. Add a second bound `TextBlock` reading the same `Message` property. Confirm one `PropertyChanged` raise updates both, with no change to the raising code at all — the real payoff of one notification driving arbitrarily many listeners.
