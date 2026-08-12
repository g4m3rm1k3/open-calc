# Lesson 49: From `dotnet run` to a Real `.exe`

*(`dotnet publish`, self-contained vs. framework-dependent deployment,
a modal `Window`)*

**User Story**
> As a user, I want to publish Pocket Inventory as a real desktop
> application.

**What you will build**
Every previous lesson ended with `dotnet run` — a command that only
works on a machine with the .NET SDK installed, which is true of this
project's own development machine and essentially no one else's. This
lesson produces a real, standalone `.exe`, run directly, outside
`dotnet run` entirely, and adds a small **About** window so a shipped
build can actually say which version of itself it is.

**What you need to know first:** Lesson 0: the project file
(`.csproj`), `TargetFramework`. Lesson 22: `MessageBox`, the only prior
example of a popup window in this project.

**Terms introduced in this lesson:**
- **`dotnet publish`** — produces a deployable build of a project, as
  opposed to `dotnet run`, which builds and runs in one step for
  development only.
- **Framework-dependent deployment** — a published build that expects
  the correct .NET Desktop Runtime to already be installed on the
  target machine; small, but not standalone.
- **Self-contained deployment** — a published build that includes its
  own private copy of the .NET runtime; large, but runs on a machine
  with no .NET installed at all.
- **RID (Runtime Identifier)** — a string naming a specific target
  platform (`win-x64`), required by `dotnet publish` so it knows which
  runtime binaries to fetch or which native host to build.
- **`PublishSingleFile`** — an MSBuild property that bundles a
  self-contained publish's many managed `.dll`s into one `.exe`,
  leaving any native (non-managed) dependencies as separate files
  alongside it.
- **`ShowDialog`** — opens a `Window` modally: blocks the calling
  code until that window closes, unlike `Show`, which returns
  immediately.
- **`Window.Owner`** — associates a secondary `Window` with the one
  that opened it, for taskbar grouping, z-ordering, and later lookup.

**Objects and methods used**
- **`Window.GetWindow(DependencyObject)`**
  - *What it is:* finds the real top-level `Window` a given element is
    actually hosted inside — even if that element sits several layers
    deep, inside a `Page` inside a `Frame`.
  - *Implementation:* a `static` method on `System.Windows.Window`,
    walking up the visual tree from the given element until it finds a
    `Window`.
  - *Its use:* `Window.GetWindow(this)`, called from inside a real
    `Page`, proven this lesson to return the exact same object as
    `Application.Current.MainWindow` — the real owner this lesson's
    About window needs. Full lab, real output, and both lenses in this
    lesson's own Concept Unit.
- **`ShowDialog()` / `Window.Owner`**
  - *What they are:* opens a `Window` modally (blocking the calling
    code until it closes, unlike `Show()`, which returns immediately),
    and the property associating a secondary `Window` with the one
    that opened it.
  - *Implementation:* `ShowDialog()` is a method on `Window`, returning
    once the dialog is closed; `Owner` is a settable property, read by
    Windows itself for taskbar grouping, z-ordering, and disabling the
    owner while the dialog is open.
  - *Its use:* the real About window this lesson adds — opened with
    `ShowDialog()`, `Owner` set to the result of `Window.GetWindow(this)`
    — proven, with real output ordering, to genuinely block, and
    `Owner.IsEnabled` proven to stay `True` throughout (this project's
    About dialog deliberately doesn't disable its owner).

**Everything else in the file, not this lesson's subject but still
explained**
- **`Window`**
  - *What it is:* the C# class a WPF application's top-level screen
    actually is.
  - *Implementation:* full treatment already given in
    `Lesson-00-developer-environment.md`.
  - *Its use:* the base class every window in this project, including
    `MainWindow`, has extended since Lesson 0/1 — and the base class
    this lesson's new `AboutWindow` extends too.

---

## Concept Unit: Framework-Dependent vs. Self-Contained — a Real, Measured Difference

### The Problem

`dotnet run` has been this entire course's only way to launch the app —
and it silently requires the .NET SDK, a multi-hundred-megabyte
developer tool, to be installed on whatever machine runs it. A real
user installing "Pocket Inventory" has no SDK and no reason to want
one. Worth seeing directly what `dotnet publish` actually produces
before deciding which shape to ship.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-publish
cd lab-publish
```

Publish framework-dependent first:

```bash
dotnet publish -c Release -r win-x64 --self-contained false
```

Real output (paths shortened):

```text
lab-publish -> ...\bin\Release\net10.0-windows\win-x64\lab-publish.dll
lab-publish -> ...\bin\Release\net10.0-windows\win-x64\publish\
```

List what actually landed in `publish\`:

```bash
ls -la bin/Release/net10.0-windows/win-x64/publish/
```

Real output:

```text
lab-publish.deps.json        481 bytes
lab-publish.dll             6656 bytes
lab-publish.exe           162304 bytes
lab-publish.pdb            14332 bytes
lab-publish.runtimeconfig.json  519 bytes

5 files, 190K total
```

Now publish self-contained instead:

```bash
dotnet publish -c Release -r win-x64 --self-contained true
```

Real output:

```text
257 files, 141M total
```

(sample of the 257 — `PresentationCore.dll`, `PresentationFramework.dll`,
and dozens of other real .NET runtime and WPF binaries, none of which
existed in the framework-dependent folder above)

#### Execution Trace

1. `dotnet publish -c Release -r win-x64 --self-contained false` builds
   a **framework-dependent** deployment: `5` real files, `190K` total —
   `lab-publish.exe` itself is a small native launcher (a
   "apphost"), and `lab-publish.dll` holds this app's own compiled code.
   Nothing here is the .NET runtime itself.
2. `--self-contained true` builds a completely different shape: `257`
   real files, `141M` total — the same `lab-publish.dll`, but now
   accompanied by a full, private copy of the .NET runtime and every
   WPF assembly this app depends on.
3. The size difference — `190K` vs. `141M`, roughly `740`× larger — is
   the real, measured cost of "runs on a machine with nothing installed"
   versus "runs on a machine that already has the right runtime."

*What this proves:* `--self-contained false` (the default) produces a
**framework-dependent** build — real, measured at `190K` across `5`
files — that will fail to launch on a machine without the matching
.NET Desktop Runtime already installed. `--self-contained true`
produces a **self-contained** build — real, measured at `141M` across
`257` files — that carries its own runtime and needs nothing
preinstalled, at the real, measured cost of being roughly `740`× larger
on disk.

### Discard the Throwaway Example
Keep the `lab-publish` folder for one more real check before deleting
it — the next step proves the framework-dependent `.exe` is genuinely
standalone, not just smaller.

### Prove the Published `.exe` Actually Runs, Outside `dotnet run`

Add a `Loaded` handler to `MainWindow.xaml` that writes a real proof
file and exits immediately (so this check can run unattended):

```csharp
private void Window_Loaded(object sender, RoutedEventArgs e)
{
    File.WriteAllText(
        Path.Combine(Path.GetTempPath(), "lab-publish-ran.txt"),
        $"Ran at {DateTime.Now:O} from {System.Reflection.Assembly.GetExecutingAssembly().Location}");
    Application.Current.Shutdown();
}
```

Republish (`--self-contained false`), then run the `.exe` file
**directly** — not `dotnet run`, not `dotnet lab-publish.dll`, the raw
executable itself:

```bash
./bin/Release/net10.0-windows/win-x64/publish/lab-publish.exe
```

Real content of the proof file afterward:

```text
Ran at 2026-07-31T19:06:03.0528884-04:00 from ...\bin\Release\net10.0-windows\win-x64\publish\lab-publish.dll
```

*What this proves:* the published `.exe`, launched directly by
double-clicking or by a shell with zero knowledge of this project's
source, ran real C# code — wrote a real file with a real timestamp —
with no `dotnet run`, no project file, no source code present at all in
the `publish\` folder it ran from. This is the actual, concrete meaning
of "a real, deployable build."

Delete the `lab-publish` folder now.

### Mechanical Walkthrough

- `dotnet publish` — **first appearance.** Distinct from `dotnet run`:
  publish produces a folder meant to be *copied elsewhere and run
  without the SDK*; run is for the machine already holding the source.
- `-c Release` — (first appearance of the `Release` configuration in
  this project) — every prior `dotnet run` implicitly used `Debug`;
  `Release` turns on compiler optimizations and strips debug-only
  behavior, the configuration real, shipped software uses.
- `-r win-x64` — **first appearance of a RID (Runtime Identifier).**
  Required here because publishing needs to know which concrete
  platform's native host and runtime binaries to produce — `dotnet run`
  never needed one because it always targets "the machine currently
  running it."
- `--self-contained` — **first appearance.** The one flag controlling
  which of this unit's two real, measured shapes gets produced —
  `false` for framework-dependent, `true` for self-contained.
- `lab-publish.deps.json` / `lab-publish.runtimeconfig.json` — (first
  appearance of these two files) — `.deps.json` lists every dependency
  this app needs at runtime; `.runtimeconfig.json` records which .NET
  version to load. Both are read by the runtime host the moment the
  `.exe` launches, before any of this project's own code runs.

### CS Lens

This unit is the concrete, measured answer to **the dev/production
gap**: `dotnet run` compiles and launches in one step, against
whatever SDK happens to be on the development machine, and was never
meant to leave it. `dotnet publish` produces an artifact meant to
*outlive* the machine that built it — copied to a different computer,
run days or months later, by someone who never installed anything
related to .NET development. The `190K`-vs-`141M` gap this unit
measured is the real, physical cost of closing that gap one way
(self-contained) versus leaving it open and documented (framework-
dependent, which simply requires the runtime be present).

### SE Lens

Which should this project actually ship? Framework-dependent is
tempting — `190K` is nothing — but it silently fails on a machine
without the exact matching .NET Desktop Runtime, and "install .NET
first" is a real barrier for a casual user who just wants to track
their garage inventory. Self-contained's `141M` is a real cost (a slow
download, more disk space), but it is the only one of the two that
actually satisfies this project's own roadmap requirement: "a `.exe`
that runs on a machine with no .NET SDK installed." Self-contained is
the honest choice for a real, shipped desktop app aimed at non-
developers — the size cost is the price of that guarantee, not a flaw
to work around.

### Connection

`141M` and `257` files is a lot to call "one `.exe`." The next unit
checks whether `dotnet publish` can actually deliver on that promise.

---

## Concept Unit: `PublishSingleFile` — Smaller, Not Actually Single

### The Problem

Handing someone `257` files and asking them to keep the folder intact
is a poor real-world experience compared to "here's one `.exe`, run
it." `dotnet publish` has a real option that claims to produce exactly
that — worth testing directly what it actually delivers.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-single
cd lab-single
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
```

```bash
ls -la bin/Release/net10.0-windows/win-x64/publish/
```

Real output:

```text
D3DCompiler_47_cor3.dll        4741488 bytes
PenImc_cor3.dll                 158032 bytes
PresentationNative_cor3.dll    1235240 bytes
lab-single.exe              131355255 bytes
lab-single.pdb                   14332 bytes
vcruntime140_cor3.dll           124544 bytes
wpfgfx_cor3.dll                1956176 bytes

7 files
```

*What this proves:* `PublishSingleFile=true` genuinely shrinks the
folder from `257` files down to `7` — real, measured — and
`lab-single.exe` itself, at roughly `131`MB, now embeds the entire
managed runtime and every WPF assembly that previously stood alone as
separate `.dll`s. But it is not, in fact, a single file: `5` native
`.dll`s remain external (`D3DCompiler_47_cor3.dll`,
`PenImc_cor3.dll`, `PresentationNative_cor3.dll`, `vcruntime140_cor3.dll`,
`wpfgfx_cor3.dll`) — this is called **native interop**: code the .NET
runtime loads directly as platform-native libraries (for text
rendering, pen/touch input, and 3D graphics compilation), which
single-file bundling cannot embed the way it embeds managed `.dll`s.

### Discard the Throwaway Example
Delete the `lab-single` folder.

### Mechanical Walkthrough

- `-p:PublishSingleFile=true` — **first appearance.** An MSBuild
  property, passed with `-p:`, distinct from the `-c`/`-r`/
  `--self-contained` flags used directly by `dotnet publish` itself.
- `lab-single.exe` at `~131`MB — the entire self-contained payload
  (previously `141`MB spread across `257` files) compressed into one
  executable that extracts itself into memory at startup.
- The five surviving `_cor3.dll` files — **first appearance of native
  interop DLLs in this project.** Their `_cor3` suffix marks them as
  native (non-managed) components WPF specifically depends on; nothing
  about `PublishSingleFile` is capable of folding platform-native code
  into a managed single-file bundle.

### CS Lens

**Native interop** is code living outside the CLR's own managed world
entirely — real machine code, not IL, loaded through P/Invoke rather
than the ordinary assembly-loading mechanism `.deps.json` governs.
Single-file publishing works by packing managed assemblies into one
bundle the runtime host unpacks on demand; it has no equivalent
mechanism for native libraries, because the OS loader that ultimately
loads a native `.dll` has no concept of "a bundle" at all — it expects
a real file at a real path.

### SE Lens

Given it's not truly one file, is `PublishSingleFile` worth using at
all? Yes — `7` files is a real, meaningful improvement over `257` for
anyone actually distributing this app (a `.zip` with a handful of files
next to the `.exe` is a normal thing to hand someone; a `.zip` with
`257` scattered `.dll`s inviting one to go missing is not). The honest
framing for a user is "here's the app and a few files it needs
alongside it," not "here's the one file, ever" — a claim
`PublishSingleFile`'s own name invites but this project's real,
measured output doesn't support for a WPF app specifically.

### Connection

The published build is ready. One thing is still missing: a way for a
user (or this project's own developer, comparing a bug report against
a specific build) to see which version they're actually running.

---

## Concept Unit: An About Window — This Project's First Real Secondary `Window`

### The Problem

Every screen in this project so far has been a `Page`, navigated inside
`MainWindow`'s one `Frame` (Lesson 3). Nothing shows the app's own
version — meaningless in development, where the source is right there,
but genuinely useful the moment a real `.exe` exists, separate from the
source that built it.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-about
```

The real project opens `AboutWindow` from inside a `Page` (`InventoryPage`,
hosted in `MainWindow`'s `Frame`), not from `MainWindow` directly — this
lab matches that shape exactly, rather than a simpler one that wouldn't
prove the same thing. Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<Frame x:Name="MainFrame" NavigationUIVisibility="Hidden" />
```

```csharp
using System.Windows;

namespace lab_about;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        MainFrame.Navigate(new SomePage());
    }
}
```

Add `SomePage.xaml`, standing in for `InventoryPage`:

```xml
<Page x:Class="lab_about.SomePage"
      xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
      xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
      Title="SomePage" Loaded="Page_Loaded">
    <Grid />
</Page>
```

```csharp
using System.Windows;
using System.Windows.Controls;

namespace lab_about;

public partial class SomePage : Page
{
    public SomePage()
    {
        InitializeComponent();
    }

    private void Page_Loaded(object sender, RoutedEventArgs e)
    {
        Window? owningWindow = Window.GetWindow(this);
        Console.WriteLine($"Window.GetWindow(this) returned null: {owningWindow == null}");
        Console.WriteLine($"Window.GetWindow(this) is MainWindow: {owningWindow is MainWindow}");
        Console.WriteLine($"ReferenceEquals to Application.Current.MainWindow: {ReferenceEquals(owningWindow, Application.Current.MainWindow)}");

        AboutWindow about = new AboutWindow
        {
            Owner = owningWindow
        };
        about.ShowDialog();

        Console.WriteLine("Back in SomePage after ShowDialog returned.");

        Application.Current.Shutdown();
    }
}
```

Add a second window, `AboutWindow.xaml`:

```xml
<Window x:Class="lab_about.AboutWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="About" Height="150" Width="300" Loaded="Window_Loaded">
    <StackPanel Margin="16">
        <TextBlock x:Name="VersionText" Text="Version" />
    </StackPanel>
</Window>
```

```csharp
using System.Reflection;
using System.Windows;

namespace lab_about;

public partial class AboutWindow : Window
{
    public AboutWindow()
    {
        InitializeComponent();
    }

    private void Window_Loaded(object sender, RoutedEventArgs e)
    {
        Version? version = Assembly.GetExecutingAssembly().GetName().Version;
        VersionText.Text = $"Version {version}";

        Console.WriteLine($"AboutWindow.Owner is MainWindow: {Owner is MainWindow}");
        Console.WriteLine($"Owner.IsEnabled while this dialog is open: {Owner!.IsEnabled}");
        Console.WriteLine($"Assembly version read: {version}");

        Close();
    }
}
```

Set `<Version>1.2.0</Version>` in the `.csproj`'s `<PropertyGroup>`. Run
it on your Windows machine:

```bash
dotnet run
```

Real output:

```text
Window.GetWindow(this) returned null: False
Window.GetWindow(this) is MainWindow: True
ReferenceEquals to Application.Current.MainWindow: True
AboutWindow.Owner is MainWindow: True
Owner.IsEnabled while this dialog is open: True
Assembly version read: 1.2.0.0
Back in SomePage after ShowDialog returned.
```

#### Execution Trace

1. `MainWindow`'s constructor navigates `MainFrame` to a real `SomePage`
   — the exact `Window`-containing-a-`Frame`-containing-a-`Page`
   structure `InventoryPage` actually lives inside.
2. `SomePage`'s `Loaded` fires and calls `Window.GetWindow(this)` —
   `this` is the `Page`, which has no `Owner` property of its own.
   `owningWindow == null` prints `False` — it found something — and
   `owningWindow is MainWindow` prints `True`: `Window.GetWindow`
   correctly walked up from a `Page` with no window of its own to the
   real, containing `MainWindow`. The third line,
   `ReferenceEquals(owningWindow, Application.Current.MainWindow)`,
   prints `True` — not just *a* `MainWindow`, the *exact same instance*
   the application itself considers its main window.
3. `AboutWindow` is constructed with `Owner = owningWindow`, and
   `about.ShowDialog()` blocks — `"Back in SomePage after ShowDialog
   returned."` does **not** print yet.
4. `AboutWindow`'s own `Loaded` fires while `ShowDialog()` is still
   blocking its caller — reads a real `Version` from
   `Assembly.GetExecutingAssembly()`, prints `Owner is MainWindow: True`
   (proving the `Owner` relationship, set from a value `Window.GetWindow`
   produced, round-trips correctly), and — worth checking directly
   rather than assuming — prints `Owner.IsEnabled: True`, not `False`.
   `ShowDialog()`'s modal blocking is real (proven by the ordering in
   the next step) but is **not** implemented by toggling the owner's
   `IsEnabled` property; that assumption would have been wrong.
5. `Close()` ends the dialog, `ShowDialog()` finally returns, and only
   now does `"Back in SomePage after ShowDialog returned."` print —
   real, ordered proof that everything in `AboutWindow` ran to
   completion before `SomePage`'s code resumed.

*What this proves:* `Window.GetWindow(this)`, called from inside a
`Page`, correctly finds the real, containing `MainWindow` instance —
not a guess, not a new window, the exact same object
`Application.Current.MainWindow` already knows about. `ShowDialog()`
genuinely blocks the calling code until the dialog closes — real,
ordered console output proves it, not an assumption about what "modal"
is supposed to mean. `Owner`, set from that `Window.GetWindow` result,
correctly links the two windows, and
`Assembly.GetExecutingAssembly().GetName().Version` correctly reads
back the exact `1.2.0` this lab's own `.csproj` set, now including a
real, implicit `.0` revision component (`1.2.0.0`).

### Discard the Throwaway Example
Delete the `lab-about` folder. `Window.GetWindow`/`ShowDialog`/`Owner`
are not discarded — the real `AboutWindow` uses exactly this next.

### Mechanical Walkthrough

- `Window.GetWindow(this)` — **first appearance.** Called from inside a
  `Page`, which has no `Owner` property of its own — this unit's own
  lab proved it correctly walks up to the real, containing `Window`,
  the identical instance `Application.Current.MainWindow` already
  knows about.
- `AboutWindow` itself, declared as a second, real top-level `Window`
  — **first appearance of a second `Window` in this project's
  pattern** — distinct from every `Page` shown so far (Lesson 3
  onward), which only ever exists inside `MainWindow`'s single `Frame`.
- `ShowDialog` — **first appearance.** Opens `AboutWindow` modally —
  blocking, as this unit's own execution trace proved — unlike
  `Frame.Navigate` (Lesson 3), which changes what the one existing
  window shows without creating a second window at all.
- `Window.Owner` — **first appearance.** Associates the dialog with
  the window that opened it — used by Windows itself for taskbar
  grouping and z-ordering, and readable back afterward (proven above:
  `AboutWindow.Owner is MainWindow: True`).
- `Assembly.GetExecutingAssembly().GetName().Version` — **first
  appearance.** Reads the version number the `.csproj`'s own
  `<Version>` element compiled into this exact assembly — the same
  number a build script or CI pipeline would bump before each real
  release.

### CS Lens

A `Window` shown via `ShowDialog()` is **modal** — it blocks its
caller's control flow until closed, exactly like `MessageBox.Show`
(Lesson 22) already has been the entire time; `MessageBox` was always a
modal `Window` under the hood, just one this project never had to build
itself. `AboutWindow` is the first case where this project builds that
same modal shape from scratch, with its own real XAML and code-behind,
instead of using a system-provided one.

### SE Lens

Why isn't `AboutWindow` opened through a `Command`, the way every other
toolbar button in this project has worked since Lesson 23's MVVM
refactor? Because MVVM's actual purpose — keeping business logic
testable and free of direct UI references — has nothing to do with
this button. Opening a window has no state to verify, no data to
mutate, nothing a unit test would ever want to assert against; routing
it through `InventoryViewModel` would mean the ViewModel constructing a
real `Window` object directly, which is exactly the coupling MVVM
exists to prevent. A plain code-behind `Click` handler, kept in
`InventoryPage.xaml.cs`, is the more architecturally honest choice
here — not every button belongs in the ViewModel just because most do.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `AboutWindow.xaml` (new), `AboutWindow.xaml.cs`
  (new), `InventoryPage.xaml`, `InventoryPage.xaml.cs`,
  `PocketInventory.csproj`.
- **Change type:** Add.
- **Dependencies:** `Window`/`ShowDialog`/`Owner`, previous unit.

### The New Code — the Version

```xml
<Version>1.0.0</Version>
```

### The New Code — the Button

```xml
<Button Content="About"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Click="AboutButton_Click" />
```

### The New Code — the Handler

```csharp
private void AboutButton_Click(object sender, RoutedEventArgs e)
{
    AboutWindow about = new AboutWindow
    {
        Owner = Window.GetWindow(this)
    };
    about.ShowDialog();
}
```

### The Updated Project — the Project File

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net10.0-windows</TargetFramework>
    <RootNamespace>PocketInventory</RootNamespace>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UseWPF>true</UseWPF>
    <Version>1.0.0</Version>                                                                        <!-- ← new -->
  </PropertyGroup>

</Project>
```

### The Updated Project — `AboutWindow`

```xml
<Window x:Class="PocketInventory.AboutWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="About Pocket Inventory" Height="180" Width="320" Loaded="Window_Loaded">
    <StackPanel Margin="16">
        <TextBlock Text="Pocket Inventory" FontWeight="Bold" FontSize="16" />
        <TextBlock x:Name="VersionText" Margin="0,8,0,0" />
        <TextBlock Text="A personal inventory tracker." Margin="0,8,0,0" TextWrapping="Wrap" />
    </StackPanel>
</Window>
```

```csharp
using System.Reflection;
using System.Windows;

namespace PocketInventory;

public partial class AboutWindow : Window
{
    public AboutWindow()
    {
        InitializeComponent();
    }

    private void Window_Loaded(object sender, RoutedEventArgs e)
    {
        Version? version = Assembly.GetExecutingAssembly().GetName().Version;
        VersionText.Text = $"Version {version}";
    }
}
```

### The Updated Project — `InventoryPage`'s Toolbar Addition

```xml
<Button Content="Restore Backup"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Command="{Binding RestoreBackupCommand}" />
<Button Content="About"                                                                              <!-- ← new -->
        Style="{StaticResource ToolbarButtonStyle}"                                                  <!-- ← new -->
        Margin="12,0,0,0"                                                                            <!-- ← new -->
        Click="AboutButton_Click" />                                                                 <!-- ← new -->
```

```csharp
// In InventoryPage.xaml.cs, alongside ItemsGrid_SelectionChanged:
private void AboutButton_Click(object sender, RoutedEventArgs e)     // ← new
{
    AboutWindow about = new AboutWindow                              // ← new
    {
        Owner = Window.GetWindow(this)                               // ← new
    };
    about.ShowDialog();                                               // ← new
}
```

### Mechanical Walkthrough

- `<Version>1.0.0</Version>` — reappearing (this lesson's own isolated
  lab already set `<Version>1.2.0</Version>` the same way), now landing
  in the real project's `.csproj` for the first time. Everything before
  this lesson built with an implicit, unset version; this line makes
  "which build is this" answerable for the first time.
- `Window.GetWindow(this)` — reappearing exactly (this lesson's own
  isolated lab already proved it, called from a `Page` inside a
  `Frame`, the identical shape `InventoryPage` has). `InventoryPage` is
  a `Page`, not a `Window` — it has no `Owner` property of its own;
  `Window.GetWindow` walks up to find the real containing `Window`
  (`MainWindow`) at runtime, which `AboutWindow.Owner` needs.
- `Click="AboutButton_Click"` — reappearing shape (a plain code-behind
  event handler, the pattern every lesson before Lesson 23 used
  exclusively) — deliberately *not* `Command="{Binding ...}"`, for the
  reason named in this unit's own SE Lens.

### CS Lens

This unit is the concrete proof of Lesson 23's own MVVM boundary, seen
from the other side: MVVM separates *what changes application state*
from *how it's displayed*, not "every single interaction must go
through a `Command`." `AboutButton_Click` touches zero application
state — no `InventoryItem`, no `Items`, no database call — and so it
correctly lives entirely in the view layer, exactly where Lesson 23
left the view-only concerns that never moved into
`InventoryViewModel` in the first place.

### Commands Needed

```bash
dotnet publish -c Release -r win-x64 --self-contained true
```

### Run It

On your Windows machine, publish the real project self-contained, then
run the resulting `.exe` directly from the `publish\` folder — not
`dotnet run`. Click **About**: a real, modal window appears, showing
`Version 1.0.0.0`, and the main window is unresponsive until it's
closed. Close it — control returns immediately. Bump
`<Version>` to `1.0.1`, republish, and confirm the About window now
shows the new number — the version shown always reflects what was
actually compiled, not something typed once and forgotten.

### Connection

Pocket Inventory now runs as a real, standalone `.exe`, versioned and
self-identifying. The final lesson steps back from new features
entirely — a capstone reviewing the architecture built across all 49
lessons, and closing the one honest question this unit's own SE Lens
raised: *are* all the boundaries this project drew — MVVM's, and every
other one — still in the right place, now that the whole thing is
finished?

---

## Closing

### Connect the Pieces

`dotnet publish -c Release -r win-x64 --self-contained true` produces
the real, standalone build this lesson's first two units measured
directly (`141M`/`257` files, or `131M`/`7` files with
`PublishSingleFile`) — a `.exe` proven, by actually running it outside
`dotnet run`, to work with zero SDK or source code present.
`<Version>1.0.0</Version>`, compiled into that same build, is read back
by `AboutWindow` through `Assembly.GetExecutingAssembly().GetName().Version`
the moment a user clicks **About** — wired through a plain code-behind
`Click` handler, deliberately outside `InventoryViewModel`, because
nothing about showing a version number is application state MVVM was
ever meant to guard.

### What Breaks Without This

Publish framework-dependent (`--self-contained false`) instead, copy
only the `publish\` folder to a real, different machine that has never
had the .NET SDK or Desktop Runtime installed, and try to run the
`.exe`. Real, representative failure: Windows reports it cannot run the
app and offers to open the Microsoft Store to install a missing
runtime — the app never starts at all, silently failing this project's
own roadmap requirement of running on a machine with nothing
preinstalled. This is the real, concrete cost framework-dependent
deployment carries that this lesson's self-contained choice avoids.

### Exercises

- In a throwaway `dotnet new wpf` lab, compare `dotnet publish`'s
  output size for `-r win-x64` against `-r win-x86` (a different RID) —
  confirm, with real measured output, that the RID genuinely changes
  which binaries get produced.
- Predict, in your own words, why `AboutWindow.Owner.IsEnabled` stayed
  `True` throughout this lesson's own modal-dialog lab, given that
  `ShowDialog()` demonstrably did block — what does that gap suggest
  about *how* WPF actually enforces modality, if not through this
  familiar property?
- Add a "Copyright" or "Build Date" line to the real `AboutWindow`,
  sourced from `Assembly.GetExecutingAssembly()`'s other real metadata
  (for example `AssemblyInfo`'s file write time), rather than a
  hand-typed string that could drift from the truth.

### Definition of Done

- [ ] `dotnet publish -c Release -r win-x64 --self-contained true`
      produces a real `.exe` you ran directly, outside `dotnet run`,
      and confirmed it launches correctly.
- [ ] You measured, for real, the size/file-count difference between
      framework-dependent and self-contained publishes on your own
      machine.
- [ ] `<Version>` is set in the real project's `.csproj`.
- [ ] `AboutWindow` shows the real, compiled-in version number, opened
      modally from a plain code-behind `Click` handler, not a `Command`.
- [ ] You can explain, from memory, why this one button deliberately
      doesn't go through `InventoryViewModel`.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add self-contained publish support and an About window showing the real build version"`.
