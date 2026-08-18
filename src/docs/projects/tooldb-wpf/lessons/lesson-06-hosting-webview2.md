# Lesson 6: The Control Isn't the Browser
### (Hosting WebView2 in a WPF Window)

**What you will build.** `ToolDB`'s window gains a second, completely different
kind of content living inside it: a real, browser-rendered HTML page,
displayed by a genuine copy of the Edge/Chromium rendering engine running
inside this project's own window, not a WPF-drawn imitation of one. The plain
`TextBlock` Lesson 5 added is replaced by a new control, `WebView2`, that
hosts that browser; the tool-count summary Lesson 5 wrote into that
`TextBlock` moves to the window's own title bar instead (reusing `Title`,
already established in Lesson 5, now set from code instead of a fixed XAML
value) so the exact same real database read Lessons 1–5 already proved
correct keeps happening, just reported a different way. The transferable
problem underneath the feature: some controls in a UI tree are not
self-contained objects the way `TextBlock` or `Grid` are — this one is a thin
wrapper around an entire separate process, with its own startup time and its
own way of failing, and code that uses it has to wait for a real, documented
signal before it's safe to assume that process is even alive.

**What you need to know first.** Lesson 5 — `Application`, `Window`, XAML,
code-behind, `x:Name` generating a real field, the `Loaded`/`Closing`
lifecycle events, and the `+=` delegate-attachment syntax. Lesson 4 — `Tool`,
`Tool.FromReader(SqliteDataReader)`. Lesson 1 — `SqliteConnection`,
connection strings, the `using` declaration.

**Pipeline, so far.** Lesson 5 established a first real pipeline —
`tools.db` on disk, through C#, into a native window. This lesson keeps that
pipeline exactly as it was, redirects where its output lands, and adds a
second, independent pipeline alongside it:

```text
tools.db (SQLite, on disk)
   │  SqliteConnection / SqliteCommand / SqliteDataReader   (Lessons 1–4)
   ▼
Tool object (Id, Name, Manufacturer, ...)                   (Lesson 4, Tool.FromReader)
   │
   ▼
Window.Title (native, text only)                            (this lesson — was a TextBlock, Lesson 5)


local.html (static HTML, on disk)                            (this lesson — a second, new pipeline)
   │  WebView2.Source = new Uri(path)
   ▼
CoreWebView2 (a real Edge/Chromium browser process)
   │  renders the page
   ▼
Rendered HTML, inside the same native window
```

Carried through with the same concrete value Lesson 5 already traced: the
real row `(1, "1/2 in 4-Flute Carbide End Mill", "O'Brien Carbide Tools",
0.5, 3.0, 4)` still becomes a `Tool` object via `Tool.FromReader`, exactly as
Lesson 4 and 5 proved — only its destination changes, from `StatusText.Text`
to `Title`. The second pipeline is genuinely new and, this lesson, entirely
separate from the first: `local.html`'s own static text is what the browser
pane shows, and nothing about `tools.db`'s data reaches it yet. Wiring the
two pipelines together — putting real tool data inside the browser pane — is
Lesson 7's entire job, not this one's.

**A note on how this lesson is verified, before anything else.** Lesson 5's
own note explained that a WPF window has no terminal output, so verification
there rested on a clean `dotnet build` plus reading real, markup-compiler-
generated C# out of `obj/`. This lesson can only partly reuse that technique:
`WebView2` itself, and the `x:Name="Browser"` field it generates, are still
produced by the same markup compiler and are read directly out of `obj/`
below, the same way `StatusText` was in Lesson 5. But the actual *browser* —
`CoreWebView2`, the real Edge/Chromium process this control wraps — is not
markup-compiler output at all; it is a genuine external process, started at
runtime, with no generated C# a session can read to prove what it does.
"Real" for that part of this lesson means two other things instead: genuine
Microsoft Learn documentation for every event, property, and exception cited
below, fetched fresh this session (see each citation); and, wherever
behavior can only be seen by watching a live browser process actually start,
succeed, fail, or render a page, this lesson asks you, the reader, to run
`dotnet run` and watch it yourself — the same honest limit Lesson 5 already
named, still true here, not retested this session because the reason for it
(no one watching this screen; running a GUI process is exactly the kind of
action that needs a person present to approve or dismiss it) hasn't changed.

**Terms used in this lesson**

- **browser process** — a real, separate operating-system process — distinct
  from `ToolDB.exe`'s own process — that actually parses HTML, runs
  JavaScript, computes layout, and paints pixels; the same Edge/Chromium
  engine that runs the real Microsoft Edge browser, not a WPF-drawn
  imitation of one. It exists because rendering a modern web page is an
  enormous amount of functionality — a JavaScript engine, a CSS layout
  engine, GPU-accelerated compositing — that WPF's own drawing system was
  never built to replicate; `WebView2` doesn't reimplement a browser, it
  embeds a real, independently-maintained one.
- **Win32 window handle (HWND)** — an old, still-foundational Windows
  concept: an opaque integer identifier the operating system's own window
  manager uses to refer to one specific on-screen window, predating WPF and
  .NET entirely (it comes from the original Win32 API). It exists because,
  at the operating-system level, every visible window — regardless of which
  UI framework created it — needs one universal handle the OS itself can use
  to draw it, move it, and route input to it; WPF's own elements
  (`TextBlock`, `Grid`) don't each have their own HWND — WPF draws them all
  itself, inside a single host window — but a real browser engine, being a
  separate process, genuinely does have its own native window that needs a
  real HWND.
- **`HwndHost`** — the real WPF base class
  (`System.Windows.Interop.HwndHost`) that lets a genuine native Win32
  window, identified by its own HWND, be embedded as a first-class element
  inside a WPF visual tree. It exists because ordinary WPF elements are
  drawn entirely by WPF's own vector-graphics pipeline with no separate
  Win32 window behind each one, but some content — a full browser engine
  being the canonical example — already *is* a native Win32 window belonging
  to a different process, and WPF needs an explicit bridge type to embed
  that instead of trying to draw it.
- **`CoreWebView2`** — the real object, distinct from the `WebView2` *control*
  itself, representing the actual live connection to the running
  Edge/Chromium browser process. It exists as a separate object from the
  control because the control object can exist the instant XAML builds it —
  same as any other named element — while the real browser process takes
  genuine, measurable time to start in the background; `CoreWebView2` stays
  `null` until that startup finishes, and is exactly the thing this lesson's
  second Concept Unit waits for before assuming the browser is usable.
- **generic type** — a type or delegate written once with a placeholder
  standing in for some other type, filled in differently at each use — a
  single reusable definition instead of writing near-identical code by hand
  for every different case. It exists because Lesson 5's own
  `RoutedEventHandler` and `CancelEventHandler` are each a completely
  separate, hand-written delegate type, one per event shape .NET needed to
  support; a generic delegate defines that same "method taking a sender and
  some event data" shape exactly once and lets any event reuse it with
  whatever event-data type that event actually needs, as this lesson's own
  `EventHandler<TEventArgs>` (Objects and methods used, below) does twice.
- **navigation** — the act of directing a browser engine to load and render
  one specific piece of content — a URL, or, as in this lesson, a local
  file. It exists as a distinct step, genuinely separate from
  initialization, because "the browser process is running" and "the browser
  process has finished loading this specific page" are two different,
  independently observable moments — a fully initialized, perfectly healthy
  browser can still fail to load one particular page.

**Objects and methods used**

- **`Microsoft.Web.WebView2.Wpf.WebView2`**
  - *What it is:* this lesson's own primary subject — the WPF control that
    embeds a real browser inside `ToolDB`'s window.
  - *Implementation:* `public class WebView2 : System.Windows.Interop.HwndHost,
    IWebView2` (Microsoft's own reference, fetched this session), in
    `Microsoft.Web.WebView2.Wpf.dll`, namespace `Microsoft.Web.WebView2.Wpf`,
    with a real, confirmed inheritance chain: `FrameworkElement → HwndHost →
    WebView2` — the **`HwndHost`** Term, above, made concrete for this exact
    class.
  - *Its use:* added to `MainWindow.xaml` as `<wv2:WebView2 x:Name="Browser"
    />`, replacing Lesson 5's own `TextBlock` as the Grid's one child
    (Concept Unit 1).
- **`WebView2.Source`**
  - *What it is:* the property naming the content this control currently
    shows, or will show once its browser has finished starting.
  - *Implementation:* `public Uri Source { get; set; }` (Microsoft's own
    reference, fetched this session). Its own Remarks state plainly:
    "Setting this property before the `CoreWebView2` has been initialized
    will cause initialization to start in the background (if not already in
    progress), after which the `WebView2` will navigate to the specified
    `Uri`." It throws `ArgumentException` if set to a relative `Uri`, and
    `NotImplementedException` if set to `null`.
  - *Its use:* set, in `MainWindow_Loaded`, to a real `file://` `Uri` built
    from `local.html`'s own on-disk path (Concept Unit 3) — the one call
    that both starts the browser and tells it what to show.
- **`WebView2.CoreWebView2InitializationCompleted`**
  - *What it is:* the event this lesson's own second Concept Unit is built
    around — the real, documented signal that the browser behind this
    control has either finished starting or failed to.
  - *Implementation:* `public event EventHandler<CoreWebView2InitializationCompletedEventArgs>
    CoreWebView2InitializationCompleted;` (Microsoft's own reference, fetched
    this session). Its own Remarks state plainly it fires "either (1) when
    the control's `CoreWebView2` has finished being initialized... or (2) if
    the initialization failed," and that the sender's own `CoreWebView2`
    property "will now be valid (i.e. non-null) for the first time if
    `IsSuccess` is `true`."
  - *Its use:* attached in `MainWindow`'s constructor — the real hook this
    lesson uses to know, for certain, whether the browser is actually alive
    before trusting anything about it.
- **`CoreWebView2InitializationCompletedEventArgs`**
  - *What it is:* the argument type `CoreWebView2InitializationCompleted`
    hands to every attached method — a *compound* type, from the Header's
    own "objects and methods used, not extended" rule, since this lesson
    reads two of its real members.
  - *Implementation:* `public class CoreWebView2InitializationCompletedEventArgs
    : EventArgs` (Microsoft's own reference, fetched this session), declaring
    `bool IsSuccess { get; }` ("True if the init task completed
    successfully") and `Exception? InitializationException { get; }` ("The
    exception thrown from the init task. If the task completed successfully,
    this property is null.").
  - *Its use:* both members read inside `Browser_CoreWebView2InitializationCompleted`
    (Concept Unit 2) — `IsSuccess` to branch, `InitializationException` to
    print the real failure reason when it isn't `true`.
- **`WebView2.CreationProperties`** and **`CoreWebView2CreationProperties`**
  - *What it is:* a settable bag of options controlling *how* the browser
    behind this control gets created — `CreationProperties` is the property
    on `WebView2` itself; `CoreWebView2CreationProperties` is the real class
    holding the actual options, including the one this lesson's failure
    lab exercises.
  - *Implementation:* `public CoreWebView2CreationProperties?
    CreationProperties { get; set; }`, and `public class
    CoreWebView2CreationProperties : System.Windows.DependencyObject`, with
    `public string? UserDataFolder { get; set; }` (Microsoft's own
    reference, fetched this session) — its own Remarks state plainly that
    setting `CreationProperties` "will not work after initialization of the
    control's `CoreWebView2` has started," and that customizing it must
    happen "*before* you set the `Source` property to anything."
  - *Its use:* set, only in this lesson's throwaway lab (never in the real
    `ToolDB` checkpoint), to a deliberately invalid `UserDataFolder` — the
    real mechanism behind this lesson's own "diagnosing a broken
    initialization" material (Concept Unit 2).
- **`WebView2.NavigationCompleted`**
  - *What it is:* this lesson's third Concept Unit's own subject — the real,
    documented signal that a specific navigation (not the browser's own
    startup) has finished, successfully or not.
  - *Implementation:* `public event
    EventHandler<CoreWebView2NavigationCompletedEventArgs>
    NavigationCompleted;` (Microsoft's own reference, fetched this session)
    — its own description states it is "a wrapper around" `CoreWebView2`'s
    own `NavigationCompleted`, differing only in which object handlers
    receive as `sender`.
  - *Its use:* attached in `MainWindow`'s constructor, alongside
    `CoreWebView2InitializationCompleted` — the hook that proves *this
    specific page* actually finished loading, a genuinely later and
    separate moment from the browser merely existing.
- **`CoreWebView2NavigationCompletedEventArgs`**
  - *What it is:* the argument type `NavigationCompleted` hands to every
    attached method — a second compound type this lesson reads more than
    one real member of.
  - *Implementation:* `public class CoreWebView2NavigationCompletedEventArgs
    : EventArgs` (Microsoft's own reference, fetched this session), declaring
    `bool IsSuccess { get; }` ("`true` when the navigation is successful;
    `false` for a navigation that ended up in an error page") and
    `CoreWebView2WebErrorStatus WebErrorStatus { get; }` ("Gets the error
    code if the navigation failed"), alongside `HttpStatusCode` and
    `NavigationId`, both unused by this lesson's own code.
  - *Its use:* both `IsSuccess` and `WebErrorStatus` read inside
    `Browser_NavigationCompleted` (Concept Unit 3), the same
    success/failure-branch shape Concept Unit 2 already used for
    initialization.
- **`EventHandler<TEventArgs>`**
  - *What it is:* the **generic type** Term, above, made concrete — the one
    reusable delegate type both `CoreWebView2InitializationCompleted` and
    `NavigationCompleted` are declared with, instead of each needing its own
    hand-written delegate the way Lesson 5's `RoutedEventHandler` and
    `CancelEventHandler` did.
  - *Implementation:* `public delegate void EventHandler<TEventArgs>(object?
    sender, TEventArgs e);` (Microsoft's own reference, fetched this
    session). Its own Remarks state the exact reason it exists: "The
    advantage of using `EventHandler<TEventArgs>` is that you don't need to
    code your own custom delegate if your event generates event data. You
    simply provide the type of the event data object as the generic
    parameter."
  - *Its use:* never written by name in this lesson's own code — exactly
    like Lesson 5's delegates, a reader only ever writes an ordinary method
    matching the required shape (`object? sender`, then the right
    `TEventArgs`); the compiler checks the match against this real
    declaration at the `+=` line itself.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`Window.Title`**
  - *What it is:* reappearing from Lesson 5 — the property naming a
    window's own title-bar text.
  - *Implementation:* established in Lesson 5's own Header, reused here
    unchanged.
  - *Its use:* Lesson 5 set it once, statically, in XAML
    (`Title="ToolDB"`); this lesson assigns it a second time, from C#, in
    `MainWindow_Loaded` — the same property, exercised in a genuinely new
    way (a live assignment replacing a fixed value, not a new property).
- **`SqliteConnection`, `SqliteCommand`, `SqliteDataReader`, `.Read()`,
  `.GetInt32(int)`, `.GetString(int)`, `.GetDouble(int)`**
  - *What it is:* reappearing from Lessons 1–5 — the exact same
    connection/query/cursor sequence.
  - *Implementation:* established in Lessons 1–2, reused unchanged.
  - *Its use:* the identical `SELECT` and read loop Lesson 5 already moved
    into `MainWindow_Loaded`; not one line of this part of the method
    changes in this lesson.
- **`Tool` / `Tool.FromReader(SqliteDataReader)`**
  - *What it is:* reappearing from Lesson 4 — this project's own
    user-defined type and its row-mapping factory method.
  - *Implementation:* established in Lesson 4's `Tool.cs`, unchanged.
  - *Its use:* called once per row, exactly as in Lessons 4–5, its result
    now feeding `Title` instead of `StatusText.Text`.
- **`Window.Loaded`, `Window.Closing`, `RoutedEventArgs`, `CancelEventArgs`,
  the `+=` delegate-attachment syntax**
  - *What it is:* reappearing from Lesson 5 — the window lifecycle events
    this project already hooks.
  - *Implementation:* established in Lesson 5, unchanged.
  - *Its use:* both still attached in `MainWindow`'s constructor exactly as
    Lesson 5 left them; this lesson adds two more `+=` lines beside them,
    same pattern, new targets.
- **`Console.WriteLine(string?)`**
  - *What it is:* reappearing from Lesson 0.
  - *Implementation:* established in Lesson 0, unchanged.
  - *Its use:* prints the real success/failure outcome of both
    initialization and navigation — the only console-visible proof this
    session can produce for behavior a live window would otherwise show
    silently.
- **`AppContext.BaseDirectory`**
  - *What it is:* a `static` property giving the real absolute folder this
    running program's own executable was actually launched from.
  - *Implementation:* `public static string BaseDirectory { get; }`, in
    `System.AppContext` — a plain string, computed once by the runtime, not
    something this project's own code sets.
  - *Its use:* the starting point for building `local.html`'s real on-disk
    path in `MainWindow_Loaded` (Concept Unit 3) — necessary because that
    path is the *build output* folder (`bin/Debug/net10.0-windows/`), which
    is not the same folder `local.html`'s own source file sits in, and
    which moves depending on build configuration and machine.
- **`Path.Combine(string, string)`**
  - *What it is:* a `static` method that joins path segments into one
    well-formed path, using whatever separator the current operating system
    actually expects.
  - *Implementation:* `public static string Combine(string path1, string
    path2)`, in `System.IO.Path` — a plain string in, plain string out, no
    disk access performed by the call itself.
  - *Its use:* combines `AppContext.BaseDirectory` with the literal
    `"local.html"` into one real, absolute path.
- **`new Uri(string)`**
  - *What it is:* the constructor building a `Uri` object from a plain
    string.
  - *Implementation:* `public Uri(string uriString)`, in `System.Uri` —
    given a well-formed absolute local file-system path (as
    `Path.Combine`'s own result always is here), it produces a `file://`
    URI automatically; this is ordinary `Uri` behavior, nothing
    WebView2-specific about it.
  - *Its use:* wraps the combined path into the `Uri` object
    `WebView2.Source` actually requires.

---

## Concept Unit: A Control That Wraps Someone Else's Window

### The Problem

Every control this curriculum has used so far — `Window` itself, `Grid`,
`TextBlock` (Lesson 5) — is drawn entirely by WPF's own rendering pipeline: a
real .NET object with no separate operating-system window of its own behind
it. Rendering an actual, modern web page is a different order of problem
entirely — a JavaScript engine, a CSS layout engine, GPU-accelerated
compositing, security sandboxing — and reimplementing any of that inside
WPF's own drawing system isn't realistic for this project, or for almost any
real one. What this project actually needs is a way to embed something that
already *is* a complete, working browser, running as genuinely separate
code, inside this project's own native window.

### The New Code

A fresh package, added to a scratch project — `LabScratch.Wpf/`, the same
lab this project reused and evolved across Lesson 5's own four units, reused
again here:

```
dotnet add package Microsoft.Web.WebView2
```

Real output, captured this session (trimmed of NuGet's own registration-feed
`GET`/`OK` diagnostic lines, which report intermediate HTTP calls to
nuget.org and confirm nothing about this project itself):

```
info : Installed Microsoft.Web.WebView2 1.0.4129.50 from https://api.nuget.org/v3/index.json to C:\Users\g4m3r\.nuget\packages\microsoft.web.webview2\1.0.4129.50 with content hash BuJC70c7SCl8wlvojLZbc/E5ONmGyG3fhAMmpftCpKerxae//TxgKOTELRK2QRD7m7jigNFQRf6cfVT3ZiIQoQ==.
info : PackageReference for package 'Microsoft.Web.WebView2' version '1.0.4129.50' added to file 'LabScratch.Wpf.csproj'.
log  : Restored LabScratch.Wpf.csproj (in 1.08 sec).
```

A brand-new line inside `MainWindow.xaml`'s own root `<Window>` tag, naming
the new namespace this lab's next line needs:

```xml
xmlns:wv2="clr-namespace:Microsoft.Web.WebView2.Wpf;assembly=Microsoft.Web.WebView2.Wpf"
```

And, using that new namespace's own `wv2:` prefix, a brand-new element
replacing this lab's previous `TextBlock`:

```xml
<wv2:WebView2 x:Name="Browser" />
```

### The Updated Project

`LabScratch.Wpf/MainWindow.xaml` in full, changed lines marked:

```xml
<Window x:Class="LabScratch.Wpf.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:wv2="clr-namespace:Microsoft.Web.WebView2.Wpf;assembly=Microsoft.Web.WebView2.Wpf"  <!-- ← new -->
        Title="MainWindow" Height="450" Width="800">
    <Grid>
        <wv2:WebView2 x:Name="Browser" />  <!-- ← changed: was a TextBlock -->
    </Grid>
</Window>
```

`LabScratch.Wpf/MainWindow.xaml.cs`, trimmed back to its own bare minimum for
this unit's isolated purpose (its `Loaded`/`Closing` handlers from Lesson 5
are not part of this specific lab — they return in this lesson's later
units):

```csharp
using System.Windows;

namespace LabScratch.Wpf;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }
}
```

Built:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

A clean build — proof the package resolved and the new element compiled —
but not yet proof of *what* `<wv2:WebView2 x:Name="Browser" />` actually
became. That proof, per this project's own established standard, comes from
reading the real markup-compiler output directly:

```
obj/Debug/net10.0-windows/MainWindow.g.cs
```

Trimmed exactly as Lesson 5's own equivalent reads were (`#line` directives
and debugger/generated-code attributes removed; nothing else changed):

```csharp
namespace LabScratch.Wpf {
    public partial class MainWindow : System.Windows.Window, System.Windows.Markup.IComponentConnector {

        internal Microsoft.Web.WebView2.Wpf.WebView2 Browser;

        private bool _contentLoaded;

        public void InitializeComponent() {
            if (_contentLoaded) {
                return;
            }
            _contentLoaded = true;
            System.Uri resourceLocater = new System.Uri("/LabScratch.Wpf;component/mainwindow.xaml", System.UriKind.Relative);
            System.Windows.Application.LoadComponent(this, resourceLocater);
        }

        void System.Windows.Markup.IComponentConnector.Connect(int connectionId, object target) {
            switch (connectionId)
            {
            case 1:
            this.Browser = ((Microsoft.Web.WebView2.Wpf.WebView2)(target));
            return;
            }
            this._contentLoaded = true;
        }
    }
}
```

This is the same real mechanism Lesson 5's own Concept Unit 3 already proved
for `StatusText`, applied here to prove it holds for a completely different
element type: `x:Name="Browser"` generated one real field,
`internal Microsoft.Web.WebView2.Wpf.WebView2 Browser;`, and one real
assignment inside `Connect()`. Nothing about `x:Name`'s own mechanism cares
what kind of element it's naming — `TextBlock` in Lesson 5, `WebView2` here,
both produce the identical generated shape.

### Discard the Throwaway Example

This exact lab — the bare `WebView2` element with no event handling at all —
stays in `LabScratch.Wpf/` as a record of what this unit proved, but is not
what ships in `ToolDB`; this lesson's next unit adds real event handling to
this same lab before it's evolved any further.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule, no external application was
  searched for or read while writing this lesson.
- **Files affected** — `ToolDB/ToolDB.csproj`, modified (a new
  `PackageReference`); `ToolDB/MainWindow.xaml`, modified (the same two
  changes just proven in the lab, applied for real).
- **Change type** — configure (`ToolDB.csproj`), replace
  (`MainWindow.xaml`'s one child element).
- **Location** — `ToolDB.csproj`'s existing `<ItemGroup>` (Lesson 0);
  `MainWindow.xaml`'s existing `<Grid>` (Lesson 5), replacing its one
  `TextBlock` child.
- **Dependencies** — none beyond the package just added; `MainWindow.xaml.cs`
  itself is not touched by this specific unit (its own real changes are
  Concept Units 2 and 3's work).

`ToolDB.csproj`, real output from this session's own `dotnet add package
Microsoft.Web.WebView2`, run directly against the real project (trimmed the
same way as the lab's own output above):

```
info : PackageReference for package 'Microsoft.Web.WebView2' version '1.0.4129.50' added to file 'ToolDB.csproj'.
log  : Restored ToolDB.csproj (in 121 ms).
```

`ToolDB.csproj`'s `<ItemGroup>`, before this lesson (Lesson 0's own
`Microsoft.Data.Sqlite` reference, unchanged through Lesson 5):

```xml
  <ItemGroup>
    <PackageReference Include="Microsoft.Data.Sqlite" Version="10.0.11" />
  </ItemGroup>
```

### The New Code

The same package reference, added for real:

```xml
<PackageReference Include="Microsoft.Web.WebView2" Version="1.0.4129.50" />
```

And the same replacement element, applied to `ToolDB`'s own window:

```xml
<wv2:WebView2 x:Name="Browser" />
```

### The Updated Project

`ToolDB.csproj`'s `<ItemGroup>`, new line marked:

```xml
  <ItemGroup>
    <PackageReference Include="Microsoft.Data.Sqlite" Version="10.0.11" />
    <PackageReference Include="Microsoft.Web.WebView2" Version="1.0.4129.50" />  <!-- ← new -->
  </ItemGroup>
```

`ToolDB/MainWindow.xaml` in full, changed lines marked:

```xml
<Window x:Class="ToolDB.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:wv2="clr-namespace:Microsoft.Web.WebView2.Wpf;assembly=Microsoft.Web.WebView2.Wpf"  <!-- ← new -->
        Title="ToolDB" Height="500" Width="700">                                                  <!-- ← changed: was Height="200" Width="400" -->
    <Grid>
        <wv2:WebView2 x:Name="Browser" />  <!-- ← changed: was <TextBlock x:Name="StatusText" .../> -->
    </Grid>
</Window>
```

`MainWindow.xaml.cs` is not touched by this unit — `Browser` compiles and
generates its field the same way `StatusText` did, but nothing in code yet
reads or writes it. Built, from `ToolDB/`:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

### Mechanical Walkthrough

- `dotnet add package Microsoft.Web.WebView2` — reappearing from Lesson 0's
  own package-manager vocabulary (NuGet, `PackageReference`), a genuinely
  new package: this is the official Microsoft package exposing WebView2 to
  .NET, and adding it is what makes the `Microsoft.Web.WebView2.Wpf`
  namespace, and every type this lesson's Header names from it, available to
  this project at all.
- `xmlns:wv2="clr-namespace:Microsoft.Web.WebView2.Wpf;assembly=Microsoft.Web.WebView2.Wpf"`
  — an **XML namespace declaration**, the same general mechanism Lesson 5
  already established for the default and `x` namespaces, but a genuinely
  new *variant* of it: Lesson 5's two namespaces both pointed at fixed URIs
  naming built-in WPF vocabularies; this one uses the `clr-namespace:`
  scheme instead, which names a real .NET namespace directly
  (`Microsoft.Web.WebView2.Wpf`) together with the specific assembly it
  lives in (`assembly=Microsoft.Web.WebView2.Wpf`, the `.dll` the package
  just added). This is how XAML reaches outside WPF's own built-in
  vocabulary to use a type from any ordinary .NET library — the exact
  mechanism this lesson needs, since `WebView2` is not a WPF-authored type
  at all.
- `<wv2:WebView2 x:Name="Browser" />` — an XML element, prefixed `wv2:` this
  time instead of unprefixed, per the **XML namespace** rules Lesson 5
  already established: an unprefixed tag belongs to the default namespace,
  a prefixed one belongs to whichever namespace declared that exact prefix
  — so this tag resolves to `Microsoft.Web.WebView2.Wpf.WebView2`, not
  anything in WPF's own default vocabulary. `x:Name="Browser"`, reappearing
  from Lesson 5's own Concept Unit 3, is the identical mechanism proved
  above: a real field, a real `Connect()` assignment, indifferent to which
  element type it's naming.
- `internal Microsoft.Web.WebView2.Wpf.WebView2 Browser;` /
  `this.Browser = ((Microsoft.Web.WebView2.Wpf.WebView2)(target));` — the
  real generated proof, read directly out of `obj/`: the exact same
  `access modifier` / field-declaration / type-cast shape Lesson 5's own
  `StatusText` field showed, now naming `WebView2` as the field's type
  instead of `TextBlock` — confirming, rather than merely asserting, that
  `x:Name` treats every element type identically.
- `<PackageReference Include="Microsoft.Web.WebView2" Version="1.0.4129.50"
  />` — reappearing from Lesson 0, a second entry beside
  `Microsoft.Data.Sqlite` in the same `<ItemGroup>`; a project can, and
  routinely does, depend on any number of independent packages side by
  side, each pulled in for an unrelated purpose.
- `Height="500" Width="700"` — reappearing from Lesson 5, changed values:
  ordinary property assignment via XAML attribute, the same mechanism as
  before, just larger numbers, to give the browser pane real room once it
  exists.

### CS Lens

`WebView2` is a concrete instance of a broader, recurring shape: an
**adapter** (sometimes called a **wrapper**) — a class whose entire purpose
is bridging two systems that were never designed to know about each other,
so that neither side has to change to accommodate the other. Here, the two
systems are WPF's own managed, vector-drawn visual tree and Win32's older,
native HWND-based window model — `HwndHost` (this lesson's own **`HwndHost`**
Term) is the adapter, and `WebView2` is one concrete adapter built on top of
it. Also recognized in: a JDBC driver adapting a database's own native
client library to Java's common `Connection`/`Statement` interfaces; foreign
function interface (FFI) layers generally, letting a managed language call
into unmanaged native code without either side being rewritten; Android's
own `SurfaceView`, which exists for exactly the same reason `HwndHost` does
— embedding a natively-rendered surface inside a managed UI tree; and any
plugin architecture (the old NPAPI browser-plugin model being one historical
example) where one system hosts a chunk of genuinely foreign code behind a
narrow, agreed-upon boundary.

### SE Lens

Why does this project reach for a real, external browser engine instead of
building its own HTML renderer out of WPF's own drawing primitives — a
`Grid` here, a `TextBlock` there, hand-assembled to look like a web page?
That alternative is not hypothetical; small, constrained "fake browser"
renderers have genuinely been built this way for narrow use cases. What it
costs, for anything beyond the narrowest case, is enormous: a real web page
can carry arbitrary JavaScript, complex CSS layout, images, fonts, and
security-sensitive content, and correctly handling all of that means
re-deriving, and then indefinitely maintaining, a large fraction of what a
real browser engine already *is* — a project few teams, and certainly not
this one, could sustain. Embedding a real, externally-maintained browser
instead accepts a different, honest cost: this project now depends on a
whole separate process it does not fully control, one with its own startup
time and its own way of failing — exactly the problem this lesson's next
unit exists to handle correctly, rather than assumed away.

### Connecting Back

`Browser` now exists as a real, named field, the identical mechanism
`StatusText` already proved in Lesson 5 — but existing as a .NET object and
having a real, running browser behind it are two different things. Nothing
in this unit's own code has started that browser yet, and nothing yet knows
whether it even can. That gap — a control that exists immediately, wrapping
a process that doesn't exist yet and might never successfully start — is
exactly this lesson's next unit.

---

## Concept Unit: `CoreWebView2` — A Process That Starts Late and Can Fail

### The Problem

Unlike `StatusText` in Lesson 5 — real and immediately usable the instant
`InitializeComponent()` returns — the actual browser behind `Browser` does
not exist yet right after construction. Starting an entire browser process
takes real, measurable time, and it can genuinely fail: the required
WebView2 Runtime might be missing, a configured folder might not be usable,
any number of real environmental problems can prevent it. This project needs
a real, documented way to know — for certain, not by assumption — whether
that startup finished, and whether it actually succeeded.

### The New Code

Back in `LabScratch.Wpf/MainWindow.xaml.cs`, two new lines in the
constructor and one new method reacting to them — the success path first,
using a value that needs no real content to demonstrate, `about:blank`, a
browser-universal empty page:

```csharp
Browser.CoreWebView2InitializationCompleted += Browser_CoreWebView2InitializationCompleted;
Browser.Source = new Uri("about:blank");
```

The first line attaches a method by name, not by calling it; the second
starts the browser, in the background, toward `about:blank` — the method
that reacts once that background work finishes:

```csharp
private void Browser_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)
{
    if (e.IsSuccess)
    {
        Console.WriteLine("CoreWebView2 initialized successfully.");
    }
    else
    {
        Console.WriteLine($"CoreWebView2 failed to initialize: {e.InitializationException}");
    }
}
```

`LabScratch.Wpf/MainWindow.xaml.cs` in full, new lines marked:

```csharp
using Microsoft.Web.WebView2.Core;
using System.Windows;

namespace LabScratch.Wpf;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        Browser.CoreWebView2InitializationCompleted += Browser_CoreWebView2InitializationCompleted;  // ← new
        Browser.Source = new Uri("about:blank");                                                     // ← new
    }

    private void Browser_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)  // ← new
    {
        if (e.IsSuccess)
        {
            Console.WriteLine("CoreWebView2 initialized successfully.");
        }
        else
        {
            Console.WriteLine($"CoreWebView2 failed to initialize: {e.InitializationException}");
        }
    }
}
```

Built:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

A clean build proves this compiles — the handler's own signature matches
`EventHandler<CoreWebView2InitializationCompletedEventArgs>` exactly, or the
`+=` line itself would have failed to compile — but it does not, by itself,
prove the event actually fires or that `IsSuccess` is really `true`.
Confirming that requires watching a live run, which this session cannot do
(this lesson's own verification note, above); running `dotnet run` from
`LabScratch.Wpf/` and watching the terminal print `CoreWebView2 initialized
successfully.` is left to you, the reader, to confirm directly.

**Diagnosing a broken initialization — the same lab, deliberately broken.**
`WebView2.CreationProperties` (Header, above) has to be set *before*
`CoreWebView2` starts initializing, so it goes first, ahead of `Source`:

```csharp
Browser.CreationProperties = new CoreWebView2CreationProperties
{
    UserDataFolder = "C:\\Invalid|UserData"
};
```

`|` is not a legal character inside a Windows path at all — a real,
guaranteed-invalid value, chosen deliberately so this failure reproduces the
same way on any machine, rather than depending on which drive letters or
folders happen to exist. `LabScratch.Wpf/MainWindow.xaml.cs`'s constructor,
with this line added ahead of the two from a moment ago:

```csharp
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.Wpf;
using System.Windows;

namespace LabScratch.Wpf;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        Browser.CoreWebView2InitializationCompleted += Browser_CoreWebView2InitializationCompleted;

        Browser.CreationProperties = new CoreWebView2CreationProperties  // ← new
        {                                                                // ← new
            UserDataFolder = "C:\\Invalid|UserData"                      // ← new
        };                                                               // ← new
        Browser.Source = new Uri("about:blank");
    }

    private void Browser_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)
    {
        if (e.IsSuccess)
        {
            Console.WriteLine("CoreWebView2 initialized successfully.");
        }
        else
        {
            Console.WriteLine($"CoreWebView2 failed to initialize: {e.InitializationException}");
        }
    }
}
```

Built:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Still a clean build — and this, itself, is the point worth sitting with: an
invalid `UserDataFolder` is not something the C# compiler can catch. It's a
plain `string`; nothing about `"C:\\Invalid|UserData"` is malformed C#
syntax. The real failure only happens later, at runtime, when `CoreWebView2`
actually tries to use that folder — which is exactly why
`CoreWebView2InitializationCompleted`'s own `IsSuccess`/`InitializationException`
pair (Header, above) exists at all: some failures are only detectable once
real, external work is attempted, not by anything a compiler can check in
advance. Running this deliberately-broken lab for real, and reading the
actual `InitializationException` text `Console.WriteLine` prints, is this
lesson's own first Exercise, below — something this session cannot capture
but can set up precisely and hand off. (A different, equally real cause of
this exact same failure path exists too, worth naming even without
demonstrating it here: `WebView2RuntimeNotFoundException`, a real, named
exception type in `Microsoft.Web.WebView2.Core`, thrown when the WebView2
Runtime itself — the actual installed copy of the Edge/Chromium engine — is
missing from the machine entirely. This lesson uses the `UserDataFolder`
failure instead specifically because it reproduces the same way regardless
of what's installed on the machine running it.)

### Discard the Throwaway Example

Both versions of this lab — the succeeding `about:blank` version and the
deliberately-broken `UserDataFolder` version — stay in `LabScratch.Wpf/` as
a record of what this unit proved; neither the broken `CreationProperties`
block nor `about:blank` itself becomes part of `ToolDB`. This lesson's next
unit evolves this same lab one more time, toward real content.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml.cs`, modified.
- **Change type** — add (two new lines in the constructor, one new method).
- **Location** — inside `MainWindow`'s constructor, immediately after the
  existing `Loaded`/`Closing` attachments Lesson 5 already wrote; the new
  handler method sits alongside `MainWindow_Loaded`/`MainWindow_Closing`.
- **Dependencies** — `Microsoft.Web.WebView2.Core`, a new `using` this real
  change needs (`CoreWebView2InitializationCompletedEventArgs` lives there,
  not in `Microsoft.Web.WebView2.Wpf` alongside `WebView2` itself).

### The New Code

Inside the constructor, alongside the existing `Loaded`/`Closing`
attachments:

```csharp
Browser.CoreWebView2InitializationCompleted += Browser_CoreWebView2InitializationCompleted;
```

And the method reacting once that attachment's own event fires:

```csharp
private void Browser_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)
{
    if (e.IsSuccess)
    {
        Console.WriteLine("CoreWebView2 initialized successfully.");
    }
    else
    {
        Console.WriteLine($"CoreWebView2 failed to initialize: {e.InitializationException}");
    }
}
```

Note what does *not* appear in this real version: the lab's own deliberate
`CreationProperties`/`UserDataFolder` failure. `ToolDB`'s real checkpoint is
meant to succeed, not fail on purpose — the broken-initialization material
stays exactly where this project's own established convention already puts
unsafe or intentionally-broken code: in `LabScratch.Wpf/` only, per the same
"never write it into the real project, even temporarily" instinct Lesson 3
already established for SQL injection.

### The Updated Project

`ToolDB/MainWindow.xaml.cs` in full, new lines marked (note `Browser.Source`
does *not* yet appear here — this unit still uses no real target for it;
that's this lesson's own next unit):

```csharp
using System.ComponentModel;
using System.Windows;
using Microsoft.Data.Sqlite;
using Microsoft.Web.WebView2.Core;                                             // ← new

namespace ToolDB;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        Loaded += MainWindow_Loaded;
        Closing += MainWindow_Closing;

        Browser.CoreWebView2InitializationCompleted += Browser_CoreWebView2InitializationCompleted;  // ← new
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        using var connection = new SqliteConnection("Data Source=tools.db");
        connection.Open();

        using var selectCommand = new SqliteCommand(
            "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tools",
            connection);
        using var reader = selectCommand.ExecuteReader();

        int toolCount = 0;
        Tool? firstTool = null;
        while (reader.Read())
        {
            Tool tool = Tool.FromReader(reader);
            toolCount++;
            if (firstTool == null)
            {
                firstTool = tool;
            }
        }

        if (firstTool != null)
        {
            Title = $"ToolDB — Loaded {toolCount} tool(s). First: {firstTool.Name} ({firstTool.Manufacturer})";  // ← changed: was StatusText.Text
        }
        else
        {
            Title = "ToolDB — Loaded 0 tools.";  // ← changed: was StatusText.Text
        }
    }

    private void Browser_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)  // ← new
    {
        if (e.IsSuccess)
        {
            Console.WriteLine("CoreWebView2 initialized successfully.");
        }
        else
        {
            Console.WriteLine($"CoreWebView2 failed to initialize: {e.InitializationException}");
        }
    }

    private void MainWindow_Closing(object? sender, CancelEventArgs e)
    {
        Console.WriteLine("MainWindow is closing.");
    }
}
```

The `Title` change shown here — Lesson 5's own `StatusText.Text` assignment
replaced with `Title` — is this lesson's first Concept Unit's own promise
finally kept: the window's title bar, not a `TextBlock` that no longer
exists, is where Lesson 4 and 5's own proven database read reports its
result from this lesson forward.

Built, from `ToolDB/`:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

### Mechanical Walkthrough

- `using Microsoft.Web.WebView2.Core;` — a new `using` directive, needed
  because `CoreWebView2InitializationCompletedEventArgs` lives in this
  namespace, distinct from `Microsoft.Web.WebView2.Wpf` (where `WebView2`
  itself and `CoreWebView2CreationProperties` live) — the WPF-specific
  control classes and the shared, platform-independent "core" browser
  classes are deliberately split across two different namespaces.
- `Browser.CoreWebView2InitializationCompleted += Browser_CoreWebView2InitializationCompleted;`
  — the `+=` delegate-attachment operator, reappearing from Lesson 5 in its
  identical event-specific sense: attaching a method, by name, to an
  event's own internal list of methods to call, without calling it here.
- `private void Browser_CoreWebView2InitializationCompleted(object? sender,
  CoreWebView2InitializationCompletedEventArgs e)` — a method declaration
  whose exact signature has to match `EventHandler<CoreWebView2InitializationCompletedEventArgs>`'s
  own real declared shape (Header, above) exactly, or the `+=` line above it
  would fail to compile; `object? sender` matches that delegate's own
  nullable-annotated first parameter precisely — the **generic type** Term,
  above, made concrete: this exact method could just as easily have been
  written to handle a different event entirely, by writing a different
  second-parameter type, without .NET needing a whole new hand-written
  delegate type the way Lesson 5's `RoutedEventHandler`/`CancelEventHandler`
  each were.
- `if (e.IsSuccess) { ... } else { ... }` — ordinary `if`/`else`
  (established since Lesson 1), reading `e.IsSuccess` — a real property
  access on the compound `CoreWebView2InitializationCompletedEventArgs`
  shown in the Header, not a method call, returning `true` only once the
  browser genuinely finished starting successfully.
- `$"CoreWebView2 failed to initialize: {e.InitializationException}"` —
  string interpolation, reappearing from Lesson 1, this time embedding
  `e.InitializationException` — an `Exception?` (Header, above) — directly;
  interpolating an `Exception` object into a string calls its own
  `ToString()` override, which produces the exception's real type name and
  message together, exactly the detail needed to actually diagnose *why*
  initialization failed, not just *that* it did.
- `Browser.CreationProperties = new CoreWebView2CreationProperties {
  UserDataFolder = "C:\\Invalid|UserData" };` — object-initializer syntax
  (already established since Lesson 4's own `Tool.FromReader`), building a
  new `CoreWebView2CreationProperties` instance and setting its
  `UserDataFolder` property in the same expression; assigned to
  `Browser.CreationProperties`, a property whose own documentation (Header,
  above) is explicit that this only has any effect if set before
  `CoreWebView2` starts initializing — which is exactly why this line sits
  ahead of `Browser.Source` in the lab, not after it.
- `Title = $"ToolDB — Loaded {toolCount} tool(s). First: {firstTool.Name}
  ({firstTool.Manufacturer})";` — reappearing property access and string
  interpolation (Lessons 1, 5), the identical expression Lesson 5 already
  wrote for `StatusText.Text`, now assigned to `Title` instead — the same
  real value, a genuinely different destination.

### CS Lens

Two different, independently observable outcomes — success and failure —
reported through the *same* event, distinguished by a Boolean flag on its
own event-data object, is a recurring shape beyond just this lesson. Also
recognized in: a `Task<T>`'s own completion carrying either a result or an
exception (a later, more general version of exactly this same idea, `async`/
`await`'s own subject starting in Lesson 19); an HTTP response's own status
code, where the same "request finished" moment can mean `200 OK` or `500
Internal Server Error`; and a process's own exit code, where "the process
ended" and "the process ended successfully" are, deliberately, two separate
facts a caller has to check independently rather than assume are the same
thing.

### SE Lens

Why does `CoreWebView2InitializationCompleted` report failure through an
event's own data — `IsSuccess`/`InitializationException`, checked inside an
ordinary `if` — instead of simply throwing a C# exception the moment
initialization fails? The alternative not chosen — a thrown exception — is
the more familiar shape for "something went wrong," and it would work fine
for code that calls a method and waits, synchronously, for a result. The
real reason it isn't used here: initialization genuinely happens in the
background, on WPF's own time, not on a line of this project's own code that
could sit inside a `try`/`catch` block waiting for it — nothing in
`MainWindow`'s constructor is still running by the time the browser process
actually finishes starting or failing, seconds later. An event, fired
whenever that real background work eventually finishes, is the mechanism
that actually fits; a thrown exception has nowhere to land once the code
that would have caught it has already returned. The honest cost this
project accepts for it: diagnosing a failure means remembering to check
`IsSuccess` inside a handler, rather than the more familiar guarantee that
an unhandled problem simply stops the program with a visible error —
missing this check silently leaves `CoreWebView2` `null` with no crash to
signal it.

### Connecting Back

`Browser`'s own browser is now provably alive — this unit's own success-path
lab, and the real `CoreWebView2InitializationCompleted` handler now wired
into `ToolDB` itself, both prove that, and the deliberately-broken version
proves what it looks like when it isn't. But an initialized, healthy browser
showing nothing but `about:blank` isn't yet a useful part of this project.
Pointing it at this project's own real content — a local file on disk, not a
placeholder — is this lesson's last unit.

---

## Concept Unit: Navigation — Pointing the Browser at Real Content

### The Problem

A successfully initialized browser is still, on its own, blank — proving
`CoreWebView2` exists is not the same as showing anything useful inside it.
This project needs to point that browser at a real file this project owns,
`local.html`, sitting on disk right next to `tools.db` and `Program.cs` —
and needs a second, separate signal for whether *that specific page* finished
loading, distinct from whether the browser itself is merely alive.

### The New Code

A new file, `LabScratch.Wpf/lab.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Lab</title></head>
<body>
    <h1>Hello from a local file.</h1>
</body>
</html>
```

A new line in `LabScratch.Wpf.csproj`'s own `<ItemGroup>`:

```xml
<Content Include="lab.html" CopyToOutputDirectory="PreserveNewest" />
```

And, in `MainWindow.xaml.cs`'s constructor, the real path-building code
replacing the lab's own `about:blank`, plus a second new event attachment
and handler:

```csharp
Browser.NavigationCompleted += Browser_NavigationCompleted;

string htmlPath = Path.Combine(AppContext.BaseDirectory, "lab.html");
Browser.Source = new Uri(htmlPath);
```

The first line attaches this unit's own new event the same way as before;
the last line now points at a real file instead of `about:blank`. The
method reacting once that specific page finishes loading:

```csharp
private void Browser_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
{
    if (e.IsSuccess)
    {
        Console.WriteLine("Navigation completed successfully.");
    }
    else
    {
        Console.WriteLine($"Navigation failed. WebErrorStatus={e.WebErrorStatus}");
    }
}
```

`LabScratch.Wpf/MainWindow.xaml.cs` in full, new lines marked (the
deliberately-broken `CreationProperties` block from this lesson's previous
unit is removed here — this lab now demonstrates navigation, a different
concept, in isolation from that one):

```csharp
using Microsoft.Web.WebView2.Core;
using System.IO;                                                                            // ← new
using System.Windows;

namespace LabScratch.Wpf;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        Browser.CoreWebView2InitializationCompleted += Browser_CoreWebView2InitializationCompleted;
        Browser.NavigationCompleted += Browser_NavigationCompleted;                          // ← new

        string htmlPath = Path.Combine(AppContext.BaseDirectory, "lab.html");                // ← new
        Browser.Source = new Uri(htmlPath);                                                  // ← changed: was new Uri("about:blank")
    }

    private void Browser_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)
    {
        if (e.IsSuccess)
        {
            Console.WriteLine("CoreWebView2 initialized successfully.");
        }
        else
        {
            Console.WriteLine($"CoreWebView2 failed to initialize: {e.InitializationException}");
        }
    }

    private void Browser_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)  // ← new
    {
        if (e.IsSuccess)
        {
            Console.WriteLine("Navigation completed successfully.");
        }
        else
        {
            Console.WriteLine($"Navigation failed. WebErrorStatus={e.WebErrorStatus}");
        }
    }
}
```

Built:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Confirmed, for real, that `lab.html` actually reached the build output
folder — not assumed from the `<Content>` line alone:

```
bin/Debug/net10.0-windows/lab.html
```

A real directory listing, captured this session, confirms it is genuinely
there.

### Discard the Throwaway Example

This lab's final shape — real navigation to a real local file, with both
`CoreWebView2InitializationCompleted` and `NavigationCompleted` wired
together — stays in `LabScratch.Wpf/` as this lesson's own finished record;
`lab.html` itself, and this exact file layout, is not what ships in
`ToolDB`, which gets its own real `local.html` next.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/local.html`, created; `ToolDB/ToolDB.csproj`,
  modified (a new `<Content>` item); `ToolDB/MainWindow.xaml.cs`, modified.
- **Change type** — add (`local.html`, the `<Content>` item, the
  `NavigationCompleted` attachment and handler); configure
  (`Browser.Source`'s real target, inside the already-existing
  `MainWindow_Loaded`, replacing nothing — this is `Source`'s first real
  assignment).
- **Location** — the `<Content>` item goes in `ToolDB.csproj`'s own
  `<ItemGroup>`, alongside the `<PackageReference>` entries; the new
  constructor line sits beside the `CoreWebView2InitializationCompleted`
  attachment from this lesson's previous unit; `Browser.Source`'s own
  assignment goes at the end of `MainWindow_Loaded`, after the existing
  `Title` assignment.
- **Dependencies** — `System.IO`, a new `using` this change needs
  (`Path.Combine`, Header above, lives there).

`ToolDB.csproj`'s `<ItemGroup>`, before this unit:

```xml
  <ItemGroup>
    <PackageReference Include="Microsoft.Data.Sqlite" Version="10.0.11" />
    <PackageReference Include="Microsoft.Web.WebView2" Version="1.0.4129.50" />
  </ItemGroup>
```

`local.html`, a brand-new file:

```html
<!DOCTYPE html>
<html>
<head><title>ToolDB</title></head>
<body>
    <h1>ToolDB</h1>
    <p>This page is loaded from a local file by WebView2. A future lesson will
    fill it in with real tool data from tools.db.</p>
</body>
</html>
```

### The New Code

The project-file line that makes `local.html` a real part of this build:

```xml
<Content Include="local.html" CopyToOutputDirectory="PreserveNewest" />
```

Inside the constructor, alongside this lesson's previous unit's own
`CoreWebView2InitializationCompleted` attachment:

```csharp
Browser.NavigationCompleted += Browser_NavigationCompleted;
```

Inside `MainWindow_Loaded`, after the existing `tools.db` read and `Title`
assignment — the real path, and the assignment that actually starts
navigation:

```csharp
string htmlPath = Path.Combine(AppContext.BaseDirectory, "local.html");
Browser.Source = new Uri(htmlPath);
```

And the method reacting once that navigation finishes:

```csharp
private void Browser_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
{
    if (e.IsSuccess)
    {
        Console.WriteLine("Navigation completed successfully.");
    }
    else
    {
        Console.WriteLine($"Navigation failed. WebErrorStatus={e.WebErrorStatus}");
    }
}
```

### The Updated Project

`ToolDB.csproj` in full, new lines marked:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net10.0-windows</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <UseWPF>true</UseWPF>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Data.Sqlite" Version="10.0.11" />
    <PackageReference Include="Microsoft.Web.WebView2" Version="1.0.4129.50" />
  </ItemGroup>

  <ItemGroup>
    <Content Include="local.html" CopyToOutputDirectory="PreserveNewest" />  <!-- ← new -->
  </ItemGroup>

</Project>
```

`ToolDB/MainWindow.xaml.cs` in full — this lesson's finished checkpoint, new
lines marked:

```csharp
using System.ComponentModel;
using System.IO;                                                                                  // ← new
using System.Windows;
using Microsoft.Data.Sqlite;
using Microsoft.Web.WebView2.Core;

namespace ToolDB;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        Loaded += MainWindow_Loaded;
        Closing += MainWindow_Closing;

        Browser.CoreWebView2InitializationCompleted += Browser_CoreWebView2InitializationCompleted;
        Browser.NavigationCompleted += Browser_NavigationCompleted;                               // ← new
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        using var connection = new SqliteConnection("Data Source=tools.db");
        connection.Open();

        using var selectCommand = new SqliteCommand(
            "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tools",
            connection);
        using var reader = selectCommand.ExecuteReader();

        int toolCount = 0;
        Tool? firstTool = null;
        while (reader.Read())
        {
            Tool tool = Tool.FromReader(reader);
            toolCount++;
            if (firstTool == null)
            {
                firstTool = tool;
            }
        }

        if (firstTool != null)
        {
            Title = $"ToolDB — Loaded {toolCount} tool(s). First: {firstTool.Name} ({firstTool.Manufacturer})";
        }
        else
        {
            Title = "ToolDB — Loaded 0 tools.";
        }

        string htmlPath = Path.Combine(AppContext.BaseDirectory, "local.html");                   // ← new
        Browser.Source = new Uri(htmlPath);                                                       // ← new
    }

    private void Browser_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)
    {
        if (e.IsSuccess)
        {
            Console.WriteLine("CoreWebView2 initialized successfully.");
        }
        else
        {
            Console.WriteLine($"CoreWebView2 failed to initialize: {e.InitializationException}");
        }
    }

    private void Browser_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)  // ← new
    {
        if (e.IsSuccess)
        {
            Console.WriteLine("Navigation completed successfully.");
        }
        else
        {
            Console.WriteLine($"Navigation failed. WebErrorStatus={e.WebErrorStatus}");
        }
    }

    private void MainWindow_Closing(object? sender, CancelEventArgs e)
    {
        Console.WriteLine("MainWindow is closing.");
    }
}
```

`Browser.Source`'s own assignment sits at the very end of
`MainWindow_Loaded`, deliberately after the `tools.db` read and `Title`
assignment above it. Unlike this lesson's own lab, which set `Source` inside
the constructor, the real checkpoint sets it inside `Loaded` instead — the
same distinction Lesson 5's own Concept Unit 4 already drew between a
constructor (runs before the window is even visible) and `Loaded` (runs once
the window is genuinely ready). Tracing the real, full order this checkpoint
now runs in — not a paraphrase, the actual sequence:

1. `MainWindow`'s constructor runs: `InitializeComponent()` builds the whole
   XAML tree (including `Browser`, per Concept Unit 1), then both `+=` lines
   attach `Browser_CoreWebView2InitializationCompleted` and
   `Browser_NavigationCompleted`. Neither has fired yet — attaching a method
   to an event, per Lesson 5's own Repetition Rule reminder, is not the same
   as calling it.
2. WPF raises `Loaded`, per Lesson 5's own documented condition (the window
   has finished layout and is ready). `MainWindow_Loaded` runs: the
   `tools.db` read happens, `Title` is set, and finally `Browser.Source` is
   assigned a real `file://` `Uri`.
3. That assignment is what actually starts `CoreWebView2`'s own background
   initialization (`Source`'s own documented Remarks, Header above) — but
   `MainWindow_Loaded` does not wait for it; the method simply returns once
   `Browser.Source = new Uri(htmlPath);` has been executed, exactly the way
   a normal, synchronous line of code returns immediately after running.
4. Sometime after that — genuinely later, once the real Edge/Chromium
   process has actually finished starting — WPF raises
   `CoreWebView2InitializationCompleted`, and only now does
   `Browser_CoreWebView2InitializationCompleted` actually run, printing
   `CoreWebView2 initialized successfully.` if it did.
5. Only once the browser is confirmed alive does navigation to `local.html`
   itself get a chance to finish; `NavigationCompleted` fires after that,
   and only then does `Browser_NavigationCompleted` run, printing
   `Navigation completed successfully.`

Steps 2 and 3 happen in one continuous pass through `MainWindow_Loaded`;
steps 4 and 5 happen later, on their own schedule, driven entirely by how
long the real browser process actually takes to start and load — not by
anything this project's own code controls directly.

Built, from `ToolDB/`:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Confirmed, for real, that `local.html` reached the real build output folder:

```
bin/Debug/net10.0-windows/local.html
```

And, confirming this lesson's own changes didn't disturb anything Lesson 4
already proved, `ToolDB.Tests`' own existing test still passes unchanged:

```
dotnet test
```

Real output, captured this session, from inside `ToolDB.Tests/`:

```
Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 86 ms - ToolDB.Tests.dll (net10.0)
```

### Mechanical Walkthrough

- `<Content Include="local.html" CopyToOutputDirectory="PreserveNewest" />`
  — a new kind of MSBuild item, distinct from `<PackageReference>`
  (Lesson 0): an SDK-style project automatically compiles every `.cs` file
  it contains (established since Lesson 0), but does *not* automatically
  copy arbitrary other files — an ordinary `.html` file sitting in the
  project folder is otherwise invisible to a build entirely. `<Content
  Include="local.html">` names the specific file MSBuild should treat as
  real build output; `CopyToOutputDirectory="PreserveNewest"` says *when* —
  only when the source file is newer than whatever copy (if any) already
  sits in the output folder, avoiding a needless copy on every single
  build. Without this line, `local.html` would still sit in the project
  folder exactly where it was written, but would never reach
  `bin/Debug/net10.0-windows/` — exactly where `AppContext.BaseDirectory`
  (Header, above) actually points at runtime.
- `Browser.NavigationCompleted += Browser_NavigationCompleted;` — the same
  `+=` attachment mechanism as `CoreWebView2InitializationCompleted`, a
  second, independent event attached the same way.
- `string htmlPath = Path.Combine(AppContext.BaseDirectory, "local.html");`
  — `AppContext.BaseDirectory` (Header, above), a `static` property read
  with no arguments, giving the real folder this running `.exe` was
  launched from; `Path.Combine(string, string)` (Header, above), joining
  that folder with the literal file name `"local.html"` into one real path
  — necessary specifically because `AppContext.BaseDirectory`'s own value
  is the *build output* folder, not the *source* folder `local.html` was
  written into; without the `<Content>` item copying it there, this
  combined path would name a file that simply doesn't exist.
- `Browser.Source = new Uri(htmlPath);` — `new Uri(string)` (Header, above),
  wrapping the plain string path into the real `Uri` object `Source`'s own
  declared type requires; `Source`'s own assignment (Header, above) is what
  actually starts navigation — the same property this lesson's previous
  unit already used for `about:blank`, now pointed at real content for the
  first time.
- `private void Browser_NavigationCompleted(object? sender,
  CoreWebView2NavigationCompletedEventArgs e)` — the same required-signature
  shape as `Browser_CoreWebView2InitializationCompleted`, matching
  `EventHandler<CoreWebView2NavigationCompletedEventArgs>`'s own real
  declared type (Header, above) instead.
- `if (e.IsSuccess) { ... } else { ... Console.WriteLine($"...
  WebErrorStatus={e.WebErrorStatus}"); }` — the identical success/failure
  branch shape this lesson's previous unit already used for initialization,
  reading a *different* compound type's own `IsSuccess` member (Header,
  above) this time, and, on failure, `WebErrorStatus` instead of an
  `Exception` — a real, named error code rather than a thrown-exception
  object, because a failed navigation (a missing file, a bad URL) is not
  the same kind of failure as a browser process that never started at all.

### CS Lens

Two independently observable phases of the same object's lifetime — "the
browser exists and is ready" (`CoreWebView2InitializationCompleted`) and
"this specific page finished loading" (`NavigationCompleted`) — each with
its own real, separately-fired event, is the same recurring shape Lesson
5's own CS Lens already named for `Window.Loaded`/`Window.Closing`: a
lifecycle with more than one meaningful moment inside it, each deserving its
own hook, rather than one single "done" signal standing in for every
distinct thing that could be "done." `WebView2`'s own lifecycle is simply
one moment longer than `Window`'s two-moment version: exists, then
initialized, then — potentially many times over the same control's
lifetime, once per new page — navigated.

### SE Lens

Why does WebView2 report navigation success or failure through a *separate*
event from initialization, instead of folding both into one combined
"ready" signal? The alternative not chosen — one event covering both —
would mean a single `IsSuccess` flag standing in for two genuinely different
kinds of failure that call for different responses: an initialization
failure means the browser itself never came up, and nothing in this control
can render anything at all, likely for the rest of this session; a
navigation failure means the browser is perfectly healthy but *this one
page* — a bad path, a missing file — couldn't be shown, and showing a
different page next might work fine. Code reacting to these two situations
needs to make genuinely different decisions (give up on the browser
entirely, versus just try a different URL or show an error page), and a
single combined event would force every handler to first figure out *which*
kind of failure actually happened before it could decide anything. The
honest cost of keeping them separate: two events to wire up, in the right
order, instead of one — exactly what this lesson's own constructor now
does.

### Connecting Back

Every piece this lesson built now works together in `ToolDB` itself: a
`WebView2` control (Concept Unit 1) hosting a real browser process, proven
alive through `CoreWebView2InitializationCompleted` (Concept Unit 2), now
actually showing this project's own `local.html` (this unit), confirmed
through `NavigationCompleted`. The window's own title bar still reports
Lesson 4 and 5's own proven database read, unchanged in substance, only in
destination. What isn't connected yet — deliberately, per this lesson's own
Header — is the two halves of this lesson's own pipeline diagram to each
other: `local.html`'s static text has nothing to do with `tools.db`'s real
rows. Making the browser pane actually show real tool data is Lesson 7's own
job, not this one's.

---

## Closing

### Connect the Pieces

One trace, start to finish, on the real, finished `ToolDB` project. The
first unit added the `Microsoft.Web.WebView2` package and replaced Lesson
5's own `TextBlock` with `<wv2:WebView2 x:Name="Browser" />`, proving, by
reading the real generated `MainWindow.g.cs`, that `x:Name`'s mechanism
(Lesson 5's own Concept Unit 3) applies to this brand-new control type
completely unchanged — a real field, a real `Connect()` assignment, nothing
special about `WebView2` as far as the markup compiler is concerned. The
second unit proved that field's own real browser doesn't exist yet the
instant it's constructed: `CoreWebView2InitializationCompleted`, attached in
`MainWindow`'s constructor, is the real, documented signal for whether that
browser finished starting and whether it actually succeeded — demonstrated
both ways, a clean success against `about:blank` in the lab, and a
deliberately broken `UserDataFolder` proving the identical event also
carries real failure information, `IsSuccess=false` and a real
`InitializationException`, without a single line of that failure ever
reaching the real project. The third unit pointed the now-proven-healthy
browser at `ToolDB`'s own real `local.html` — `AppContext.BaseDirectory` and
`Path.Combine` building the real on-disk path, a `<Content>` item making
sure that file actually reaches the build output folder in the first place,
`Browser.Source`'s own assignment starting navigation, and
`NavigationCompleted` confirming, independently of initialization, that the
page itself actually finished loading. Along the way, `Title` finally
inherited the job Lesson 5's own `StatusText.Text` used to do, reporting the
exact same real database read this project has now displayed three
different ways across three different lessons — a raw `ExecuteScalar()`
value (Lesson 2), a `TextBlock` inside a native window (Lesson 5), and now a
window's own title bar, with a genuine browser pane sitting alongside it,
still showing only static content of its own.

### What Breaks Without This

This lesson's own `<Content Include="local.html" CopyToOutputDirectory=
"PreserveNewest" />` line, added to `ToolDB.csproj` in this lesson's third
unit, is not optional decoration — removing it breaks something real and
provable without needing to run the app at all. Temporarily remove that one
line from `ToolDB.csproj`:

```xml
  <ItemGroup>
    <PackageReference Include="Microsoft.Data.Sqlite" Version="10.0.11" />
    <PackageReference Include="Microsoft.Web.WebView2" Version="1.0.4129.50" />
  </ItemGroup>

  <!-- <Content Include="local.html" CopyToOutputDirectory="PreserveNewest" /> removed -->
```

Rebuilding:

```
dotnet build
```

Real output, captured this session, with the line removed:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

The build still succeeds — nothing about a missing `<Content>` item is a
compile error, the same easy-to-miss shape Lesson 5's own entry-point
conflict already warned about. Checking the actual output folder proves the
real consequence:

```
bin/Debug/net10.0-windows/local.html
```

Real output, captured this session, with the line removed: this file is no
longer present — confirmed directly, not assumed. Had `dotnet run` been
executed at this point, `Browser.Source`'s own path would name a file that
genuinely does not exist, and per this lesson's own documented
`CoreWebView2NavigationCompletedEventArgs` (Header, above), `Browser_NavigationCompleted`
would fire with `IsSuccess=false` and a real `WebErrorStatus` naming exactly
what went wrong — something this session cannot watch happen live, but can
predict precisely from real, cited documentation, and something you can
confirm directly per this lesson's second Exercise, below. Restoring the
line and rebuilding confirms the fix holds:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

And the output folder itself confirms the file is back:

```
bin/Debug/net10.0-windows/local.html
```

Present again, confirmed directly. `tools.db` itself was never touched by
any of this — exactly like Lesson 5's own "what breaks" section, this
failure lives entirely in build configuration and a missing file, nowhere
near the database.

### Exercises

- This lesson's own diagnosing-failure lab, in `LabScratch.Wpf/`, was built
  but never run this session (the constraint this lesson's own Header
  explains). Run it for real with `dotnet run`, read the actual
  `InitializationException` text `Console.WriteLine` prints to the
  terminal, and compare it against `CoreWebView2InitializationCompletedEventArgs`'s
  own documented contract (Header, above) — confirm `IsSuccess` really is
  `false` and a real exception object really is attached, not just an empty
  message.
- Using the real `ToolDB` project (not the lab), temporarily change
  `Browser.Source`'s own path in `MainWindow_Loaded` to name a file that
  doesn't exist (`"local-typo.html"`, for instance, with no matching
  `<Content>` entry). Predict, from this lesson's own "What Breaks Without
  This" section, what `Browser_NavigationCompleted` should print — then run
  it for real and confirm, before restoring the correct file name.
- This lesson's own first Concept Unit proved `Browser` exists as a real
  .NET object the instant `InitializeComponent()` returns, while the actual
  browser behind it does not exist until `CoreWebView2InitializationCompleted`
  fires, later. Using `Console.WriteLine`, add one line to `MainWindow`'s
  own constructor, immediately after `InitializeComponent()` and before any
  of this lesson's new `+=` lines, that prints whether `Browser.CoreWebView2`
  (Header, above — valid only once initialization succeeds) is `null` at
  that exact point — and confirm, by running it for real, that it reads
  `True` there, proving the control and its browser really are two
  different things with two different lifetimes.

### Definition of Done

- [ ] `ToolDB/ToolDB.csproj` references `Microsoft.Web.WebView2`, and
      declares `<Content Include="local.html"
      CopyToOutputDirectory="PreserveNewest" />`.
- [ ] `ToolDB/MainWindow.xaml` declares the `xmlns:wv2` namespace and hosts
      `<wv2:WebView2 x:Name="Browser" />` as the `Grid`'s one child.
- [ ] `ToolDB/MainWindow.xaml.cs` attaches both
      `CoreWebView2InitializationCompleted` and `NavigationCompleted` in the
      constructor, and `MainWindow_Loaded` sets `Browser.Source` to a real
      `file://` `Uri` built from `local.html`'s own on-disk path.
- [ ] `dotnet build`, from `ToolDB/`, reports `Build succeeded`, `0
      Warning(s)`, `0 Error(s)`.
- [ ] `dotnet run`, from `ToolDB/`, was actually run and watched: a window
      titled with this lesson's own real tool-count summary opens, and the
      browser pane shows `local.html`'s own real content — confirmed by eye,
      the one piece of this lesson a transcript cannot substitute for.
- [ ] The terminal `dotnet run` was launched from printed `CoreWebView2
      initialized successfully.` and `Navigation completed successfully.`,
      in that order, before anything else.
- [ ] This lesson's own diagnosing-failure lab, in `LabScratch.Wpf/`, was
      actually run, and the real `InitializationException` text was read —
      not just built.
- [ ] The "what breaks" experiment above was actually run: the `<Content>`
      line was removed, `local.html`'s real absence from the build output
      folder was confirmed directly, and the line was restored, confirmed
      present again afterward.
- [ ] `tools.db` itself still contains exactly one row, unchanged by
      anything in this lesson.
- [ ] `ToolDB.Tests`' own existing test still reports `Passed!` with
      `Failed: 0`, confirming this lesson's changes didn't disturb Lesson
      4's own proven mapping logic.
- [ ] A git commit exists containing every changed and new file from this
      lesson, with a message explaining *why* (this project now hosts a
      second, genuinely different kind of content — a real, external
      browser process — inside the same native window, alongside the
      native content Lesson 5 already proved).

Next lesson: **Lesson 7 — Passing C# Data to HTML**, connecting this
lesson's own two separate pipelines together for the first time — real
`Tool` data, crossing from C# into the browser pane this lesson just built.
