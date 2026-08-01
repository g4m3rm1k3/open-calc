# Lesson 39: A Resource That Keeps Watching, Not Just Looking Once

*(`DynamicResource` vs. `StaticResource`, swapping a `ResourceDictionary` at runtime)*

**User Story**
> As a user, I want dark mode, switchable instantly, with no restart.

**What you will build**
A real dark mode toggle. The transferable problem underneath this
lesson: `StaticResource`, used for every shared style since Lesson 5,
resolves once, at load time, and never looks again — exactly wrong for
a theme a user expects to change live, right now, while the app is
already running. `DynamicResource` is the real, mechanically different
alternative, proven here with a genuine, contrasting, side-by-side test
before it's trusted for the real theme switch.

**What you need to know first:** Lesson 5: `Style`,
`ResourceDictionary`, `StaticResource`. Lesson 38: `AppSettings`,
persisted preferences — dark mode is the setting this lesson finally
gives real, visible effect.

**Terms introduced in this lesson:**
- **`DynamicResource`** — a resource reference that stays "live" —
  re-resolved every time the underlying resource actually changes,
  instead of once, at load time.
- **`ResourceDictionary`** (as a swappable unit) — Lesson 5 already used
  one for shared styles; this lesson adds a second, alternate one (a
  dark theme) and swaps which is active at runtime.

---

## Concept Unit: Proving `StaticResource` Doesn't Update, and `DynamicResource` Does

### The Problem

Before trusting `DynamicResource` for a real theme switch, it's worth
proving directly — not assuming from the name alone — that
`StaticResource` genuinely doesn't react to a resource changing at
runtime, and that `DynamicResource` genuinely does.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-dynres
```

Replace `MainWindow.xaml`'s contents:

```xml
<Window x:Class="lab_dynres.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="450" Width="800">
    <Window.Resources>
        <SolidColorBrush x:Key="AppBackground" Color="White" />
    </Window.Resources>
    <StackPanel Loaded="StackPanel_Loaded">
        <Border x:Name="StaticBorder" Width="100" Height="40" Background="{StaticResource AppBackground}" />
        <Border x:Name="DynamicBorder" Width="100" Height="40" Background="{DynamicResource AppBackground}" />
    </StackPanel>
</Window>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Windows;
using System.Windows.Media;

namespace lab_dynres
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            Console.WriteLine($"Before swap - StaticBorder background: {((SolidColorBrush)StaticBorder.Background).Color}");
            Console.WriteLine($"Before swap - DynamicBorder background: {((SolidColorBrush)DynamicBorder.Background).Color}");

            Resources["AppBackground"] = new SolidColorBrush(Colors.Black);

            Console.WriteLine($"After swap - StaticBorder background: {((SolidColorBrush)StaticBorder.Background).Color}");
            Console.WriteLine($"After swap - DynamicBorder background: {((SolidColorBrush)DynamicBorder.Background).Color}");
        }
    }
}
```

Run it on your Windows machine:

```bash
dotnet run
```

Real output:

```text
Before swap - StaticBorder background: #FFFFFFFF
Before swap - DynamicBorder background: #FFFFFFFF
After swap - StaticBorder background: #FFFFFFFF
After swap - DynamicBorder background: #FF000000
```

*What this proves:* both borders start white, both referencing the
identical `AppBackground` resource. `Resources["AppBackground"] = new SolidColorBrush(Colors.Black);`
replaces that resource entirely, at runtime — and only `DynamicBorder`
notices: its background is genuinely re-resolved and becomes black
(`#FF000000`). `StaticBorder`'s background stays exactly `#FFFFFFFF`,
completely unaffected — `{StaticResource}` looked up `AppBackground`
exactly once, when the window first loaded, and never looks again for
the rest of that `Border`'s lifetime, no matter what changes afterward.

### Discard the Throwaway Example
Delete the `lab-dynres` folder. `DynamicResource` is not discarded —
the real theme-relevant resources use exactly this next.

### Mechanical Walkthrough

- `Background="{StaticResource AppBackground}"` — reappearing
  (`StaticResource`, used for every style since Lesson 5), the specific
  limitation proven directly here for the first time: resolved once, at
  load, permanently.
- `Background="{DynamicResource AppBackground}"` — **first appearance
  of `DynamicResource`.** Looks identical in XAML, resolves completely
  differently — re-checked every time the resource it names actually
  changes.
- `Resources["AppBackground"] = new SolidColorBrush(Colors.Black);` —
  (first appearance of replacing a resource dictionary entry directly,
  in code) — the exact operation that proves the difference: one
  assignment, two completely different observed outcomes depending on
  which resource-reference syntax each `Border` used.

### CS Lens

This is a real, concrete instance of **push vs. pull** (or, equivalently,
live vs. snapshot) evaluation — `StaticResource` takes a snapshot once;
`DynamicResource` keeps a live, re-checked reference, conceptually
similar to the difference between a plain `int` field (a snapshot) and a
property whose `get` re-computes something live (`TotalValue`, Lesson
30, re-querying the database on every read rather than caching a stale
number).

### SE Lens

Given `DynamicResource` is strictly more capable — it does everything
`StaticResource` does, plus reacting to change — why does this project
keep using `StaticResource` for most styles (`ToolbarButtonStyle`,
Lesson 5) instead of switching everything to `DynamicResource`?
Because that capability isn't free: `DynamicResource` requires WPF to
keep a live reference and re-check it, a small, real, ongoing cost
`StaticResource`'s one-time lookup doesn't pay. Using `DynamicResource`
everywhere, out of habit, would cost real (if individually tiny)
overhead for the vast majority of resources that never actually change
after load — the right call is `DynamicResource` specifically where
something might genuinely change live, `StaticResource` everywhere else.

### Connection

The real theme brushes — swapped live when dark mode toggles — use
`DynamicResource` exactly this way next.

---

## Concept Unit: A Real Dark Mode Toggle

### The Problem

`AppSettings.DarkMode` (Lesson 38) exists but changes nothing visible
yet — toggling it needs to actually re-theme the running application,
instantly, with no restart.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New `LightTheme.xaml`, `DarkTheme.xaml`,
  `App.xaml`, `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add/Modify.
- **Dependencies:** `DynamicResource`, previous unit; `AppSettings`,
  Lesson 38.

### The New Code — `LightTheme.xaml` and `DarkTheme.xaml`

```xml
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                     xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <SolidColorBrush x:Key="WindowBackgroundBrush" Color="White" />
    <SolidColorBrush x:Key="WindowForegroundBrush" Color="Black" />
</ResourceDictionary>
```

```xml
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                     xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <SolidColorBrush x:Key="WindowBackgroundBrush" Color="#FF1E1E1E" />
    <SolidColorBrush x:Key="WindowForegroundBrush" Color="White" />
</ResourceDictionary>
```

### The New Code — Applying the Theme

```csharp
public void ApplyTheme(bool darkMode)
{
    string themeFile = darkMode ? "DarkTheme.xaml" : "LightTheme.xaml";
    ResourceDictionary theme = new ResourceDictionary
    {
        Source = new Uri($"pack://application:,,,/{themeFile}")
    };

    Application.Current.Resources.MergedDictionaries.Clear();
    Application.Current.Resources.MergedDictionaries.Add(theme);
}
```

```csharp
// In the constructor, after Settings = AppSettings.Load():
ApplyTheme(Settings.DarkMode);
```

### The New Code — the Toggle

```xml
<CheckBox Content="Dark Mode"
          Margin="12,0,0,0"
          VerticalAlignment="Center"
          IsChecked="{Binding Settings.DarkMode}"
          Checked="DarkModeBox_Changed"
          Unchecked="DarkModeBox_Changed" />
```

```csharp
private void DarkModeBox_Changed(object sender, RoutedEventArgs e)
{
    InventoryViewModel viewModel = (InventoryViewModel)DataContext;
    viewModel.ApplyTheme(viewModel.Settings.DarkMode);
    viewModel.Settings.Save();
}
```

### The New Code — Using the Theme

```xml
<Grid Background="{DynamicResource WindowBackgroundBrush}">
```

### Mechanical Walkthrough

- `new ResourceDictionary { Source = new Uri("pack://application:,,,/DarkTheme.xaml") }`
  — (first appearance of a `pack://` URI) — WPF's own scheme for
  referencing a resource file bundled inside the compiled application
  itself, rather than a real filesystem path — needed here because
  `DarkTheme.xaml`/`LightTheme.xaml` are compiled into the `.exe`, not
  loose files sitting next to it.
- `Application.Current.Resources.MergedDictionaries.Clear(); ... .Add(theme);`
  — **first appearance of swapping a whole `ResourceDictionary` at
  runtime.** Removes whichever theme was previously active and installs
  the new one — every `{DynamicResource WindowBackgroundBrush}`
  reference anywhere in the running app re-resolves immediately, the
  exact mechanism this lesson's first unit already proved works.
- `Background="{DynamicResource WindowBackgroundBrush}"` — **changed**
  from what a `StaticResource` reference would have been — this is the
  one line that actually needs to be `Dynamic`; every other, non-theme
  resource in this project stays `StaticResource`, per this lesson's
  own SE Lens.
- `IsChecked="{Binding Settings.DarkMode}"` — reappearing (two-way
  `CheckBox` binding, Lesson 15), now bound to a real, persisted setting
  instead of an `InventoryItem`'s own field.

### CS Lens

`MergedDictionaries.Clear()`/`.Add(theme)` is the real mechanism behind
"swap an entire theme," and it only *works* because every themed
element references its brush via `DynamicResource` — if `Grid.Background`
had used `StaticResource`, this exact swap would silently do nothing
visible, the same failure this lesson's own first unit already proved
directly, just applied for real this time.

### SE Lens

Why keep `LightTheme.xaml`/`DarkTheme.xaml` as two separate files rather
than one file with an `if (darkMode)` branch choosing colors in C#?
Because resource dictionaries are declarative and inspectable — a
designer, or a future contributor, can open either file and see the
complete, real set of colors a theme uses, with no code to trace through
to find out. This is the same "structure belongs in XAML, behavior in
code-behind" separation this project has followed since Lesson 1's
`Window`/code-behind split.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: check "Dark Mode" — every element bound via
`DynamicResource` re-themes instantly, with no restart, no flicker of
the old theme first. Fully quit and reopen the app: dark mode is still
on, `AppSettings` (Lesson 38) correctly persisting the choice.

### Connection

Epic 10's theming is real, instant, and mechanically proven correct.
The next lesson adds keyboard shortcuts, reusing the `ICommand`s already
built since Lesson 23 through a second, independent trigger.

---

## Closing

### Connect the Pieces

Checking "Dark Mode" calls `ApplyTheme(true)`, which loads
`DarkTheme.xaml` via a real `pack://` URI and replaces
`Application.Current.Resources.MergedDictionaries`' contents entirely.
Every `{DynamicResource WindowBackgroundBrush}` reference across the
running app — proven, with real, contrasting output, to actually react
to this kind of change in this lesson's own first unit — re-resolves
immediately, giving the whole app its new theme with no restart. The
choice persists via `Settings.Save()`, the exact `AppSettings` mechanism
already proven correct in Lesson 38.

### What Breaks Without This

Temporarily change `Grid`'s `Background="{DynamicResource WindowBackgroundBrush}"`
back to `Background="{StaticResource WindowBackgroundBrush}"` and
rerun. Toggle Dark Mode. Real, representative failure: nothing visibly
changes — the `Grid`'s background was resolved once, at startup,
against whichever theme was active then, and never looks again,
exactly this lesson's own first unit's proof, now silently breaking a
real feature instead of a lab. The checkbox itself still toggles and
still saves correctly; only the visible effect is missing, which — with
no error anywhere — could easily look like a completely different bug
if you didn't already know exactly where to look. Restore
`DynamicResource` afterward.

### Exercises

- In the `lab-dynres` throwaway pattern, add a third `Border` also using
  `{DynamicResource AppBackground}` and confirm, with real output, that
  it updates in sync with `DynamicBorder` — proving the fix isn't
  per-element but genuinely dictionary-wide.
- Predict, in your own words, what happens to a *third* theme (say, a
  high-contrast mode) added later — does `ApplyTheme` need any real
  structural change, or just a new `.xaml` file and one more `if`/`switch`
  branch?
- Add a second themed brush (for example, a border or accent color) to
  both theme files and one more `DynamicResource` reference using it —
  confirm it switches correctly alongside the background.

### Definition of Done

- [ ] `LightTheme.xaml`/`DarkTheme.xaml` both exist, each defining the
      same set of resource keys with different colors.
- [ ] Toggling Dark Mode re-themes the running app instantly, with no
      restart.
- [ ] The choice persists via `AppSettings`, surviving a full quit and
      reopen.
- [ ] Every themed element uses `DynamicResource`; every other resource
      in this project still uses `StaticResource`.
- [ ] You reproduced the silent StaticResource-in-a-theme regression on
      purpose, confirmed the toggle stops visibly doing anything, and
      restored `DynamicResource`.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add live dark mode via DynamicResource and a swappable ResourceDictionary"`.
