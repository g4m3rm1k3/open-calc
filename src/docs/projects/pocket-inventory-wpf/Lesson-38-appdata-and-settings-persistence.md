# Lesson 38: Where an App Is Actually Allowed to Write

*(`Environment.SpecialFolder`, a settings file separate from the
inventory database)*

**User Story**
> As a user, I want application settings — like a low-stock warning
> threshold — that stick between sessions.

**What you will build**
A real settings file, living in the correct, real Windows location for
per-user application data — not next to the `.exe`, and not inside
`pocketinventory.db`. The transferable problem underneath this lesson:
user *preferences* (how this app behaves) and user *data* (the actual
inventory) are genuinely different things, and mixing them into one
file or one database would make each harder to reason about, back up,
or reset independently.

**What you need to know first:** Lesson 36: `JsonSerializer`, a small,
dedicated class shaped for one purpose. Lesson 25: `AppContext.BaseDirectory`
— the contrast this lesson deliberately draws against.

**Terms introduced in this lesson:**
- **`Environment.SpecialFolder`** — an enum naming real, standard
  Windows folders (`ApplicationData`, `MyDocuments`, and others);
  `Environment.GetFolderPath(...)` resolves one to a real path on the
  current machine.
- **`%AppData%`** — the informal, common name for
  `Environment.SpecialFolder.ApplicationData` — the per-user folder
  Windows itself designates for exactly this: an application's own
  settings and data, separate from its installed program files.

**Objects and methods used**
- **`Environment.SpecialFolder` / `Environment.GetFolderPath`**
  - *What they are:* the enum naming real, standard Windows folders,
    and the method that resolves one to a real path on the current
    machine.
  - *Implementation:* `System.Environment.SpecialFolder` (an `enum` —
    `ApplicationData`, `MyDocuments`, and others);
    `Environment.GetFolderPath(SpecialFolder)` is a `static` method
    returning the real, current-user path for the requested folder —
    the actual value behind the informal name `%AppData%`.
  - *Its use:* `Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData)`
    — resolves this project's real settings-file location, correctly
    per-user and per-machine, without hardcoding a path. Full lab,
    real output, and both lenses in this lesson's own Concept Unit.

**Everything else in the file, not this lesson's subject but still
explained**
- **`JsonSerializer`**
  - *What it is:* converts between real C# objects and JSON text.
  - *Implementation:* full treatment already given in
    `Lesson-36-system-text-json.md`.
  - *Its use:* serializes this lesson's own small `AppSettings` class,
    the same mechanism as the inventory export, applied to a much
    smaller object.

---

## Concept Unit: Resolving a Real, Correct Settings Location

### The Problem

Lesson 25 already put photos in a `Photos` folder next to the `.exe`
(`AppContext.BaseDirectory`) — deliberately fine for files that belong
*with* the application's own data. Settings are different: they need to
survive even if the application itself is reinstalled to a new folder,
and multiple users on the same machine each need their own copy.
`AppContext.BaseDirectory` can't provide either guarantee.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-settings
cd lab-settings
```

Replace `Program.cs`:

```csharp
using System.Text.Json;

string appDataFolder = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
Console.WriteLine($"%AppData% resolves to: {appDataFolder}");

string pocketInventoryFolder = Path.Combine(appDataFolder, "PocketInventory");
Directory.CreateDirectory(pocketInventoryFolder);
string settingsPath = Path.Combine(pocketInventoryFolder, "settings.json");

AppSettings settings = new AppSettings { LowStockThreshold = 5, DarkMode = true };
string json = JsonSerializer.Serialize(settings);
File.WriteAllText(settingsPath, json);
Console.WriteLine($"Settings file exists: {File.Exists(settingsPath)}");

string readBack = File.ReadAllText(settingsPath);
AppSettings? loaded = JsonSerializer.Deserialize<AppSettings>(readBack);
Console.WriteLine($"Loaded: LowStockThreshold={loaded?.LowStockThreshold}, DarkMode={loaded?.DarkMode}");

class AppSettings
{
    public int LowStockThreshold { get; set; } = 5;
    public bool DarkMode { get; set; }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
%AppData% resolves to: C:\Users\g4m3r\AppData\Roaming
Settings file exists: True
Loaded: LowStockThreshold=5, DarkMode=True
```

*What this proves:* `Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData)`
resolves to a real, existing, per-user Windows folder —
`C:\Users\<username>\AppData\Roaming` — genuinely different from
wherever this project's own `.exe` happens to live, and different for
every user account on the same machine. Writing a real JSON settings
file there (the exact `JsonSerializer` pattern already proven in Lesson
36) and reading it back correctly reconstructs both values — proof this
project can persist a preference completely independently of
`pocketinventory.db`.

### Discard the Throwaway Example
Delete the `lab-settings` folder. `Environment.SpecialFolder.ApplicationData`
is not discarded — the real `AppSettings` file uses exactly this next.

### Mechanical Walkthrough

- `Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData)`
  — **first appearance.** Asks Windows itself where per-user application
  data belongs, rather than this project guessing or hardcoding a path
  — the correct location is different on every machine, every Windows
  version, and every user account, and this call always resolves it
  correctly regardless.
- `Path.Combine(appDataFolder, "PocketInventory")` — reappearing
  (`Path.Combine`, familiar since Lesson 25), creating this project's
  own subfolder inside the shared `%AppData%\Roaming` location — real
  applications each get their own named folder there, never writing
  directly into the shared root.
- `JsonSerializer.Serialize(settings)` / `Deserialize<AppSettings>(...)`
  — reappearing exactly (Lesson 36), applied to a genuinely different
  kind of data — preferences, not inventory records.

### CS Lens

`AppSettings` is a third example (after `CategoryTotal`, Lesson 31, and
`ItemExport`, Lesson 36) of a small class existing purely to shape one
specific kind of data — here, application preferences, structurally
similar to `InventoryItem` in form (plain properties) but living in a
completely separate file, at a completely separate real-world location,
for a completely different reason.

### SE Lens

Why keep settings in a *separate* file from `pocketinventory.db`,
rather than adding a `Settings` table to the same SQLite database this
project already has open? Because the two have genuinely different
lifecycles: a user might reasonably want to back up or reset their
*inventory data* without touching their *preferences*, or vice versa —
reinstalling the app, or starting fresh with a new database, shouldn't
silently reset a low-stock threshold someone carefully tuned. Keeping
them as two independent files makes each operation (backup, reset,
inspect) cleanly possible without accidentally affecting the other.

### Connection

The real `AppSettings` file, loaded once at startup and updated when
changed, is wired into the project next.

---

## Concept Unit: A Real, Persisted Low-Stock Threshold

### The Problem

Nothing in this project currently has any settings at all — a real,
useful one (a low-stock warning threshold) gives this lesson's
persistence mechanism something genuine to actually store.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New `AppSettings.cs`, `InventoryViewModel.cs`,
  `InventoryPage.xaml`.
- **Change type:** Add.
- **Dependencies:** Every piece from this lesson's first unit.

### The New Code — `AppSettings.cs`

```csharp
using System.Text.Json;

namespace PocketInventory
{
    public class AppSettings
    {
        public int LowStockThreshold { get; set; } = 5;

        private static string SettingsPath
        {
            get
            {
                string folder = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                    "PocketInventory");
                Directory.CreateDirectory(folder);
                return Path.Combine(folder, "settings.json");
            }
        }

        public static AppSettings Load()
        {
            if (!File.Exists(SettingsPath))
            {
                return new AppSettings();
            }

            string json = File.ReadAllText(SettingsPath);
            return JsonSerializer.Deserialize<AppSettings>(json) ?? new AppSettings();
        }

        public void Save()
        {
            string json = JsonSerializer.Serialize(this);
            File.WriteAllText(SettingsPath, json);
        }
    }
}
```

### The New Code — Wiring It Into the ViewModel

```csharp
public AppSettings Settings { get; }

// In the constructor:
Settings = AppSettings.Load();
```

```xml
<TextBox Width="60"
         Margin="12,0,0,0"
         Text="{Binding Settings.LowStockThreshold, UpdateSourceTrigger=PropertyChanged}" />
```

```csharp
private void LowStockThresholdBox_LostFocus(object sender, RoutedEventArgs e)
{
    InventoryViewModel viewModel = (InventoryViewModel)DataContext;
    viewModel.Settings.Save();
}
```

### Mechanical Walkthrough

- `if (!File.Exists(SettingsPath)) { return new AppSettings(); }` —
  reappearing (the "first run has no saved state yet" reasoning already
  established for `LoadItemsFromDatabase` returning an empty list on a
  fresh database, Lesson 10) — a brand-new install correctly gets the
  default threshold (`5`), not a crash from a missing file.
- `Directory.CreateDirectory(folder)` inside `SettingsPath`'s own
  getter — reappearing (`Directory.CreateDirectory`, Lesson 25),
  guarantees the folder genuinely exists every single time `SettingsPath`
  is read, whether that's the very first run or the hundredth.
- `Settings.Save()` called from `LostFocus`, not from every keystroke —
  (first appearance of `LostFocus` as a save trigger) — a deliberate
  choice: writing a real file on every single keystroke while a user is
  still typing a number would be wasteful disk activity for a value
  that only matters once they're done editing it.

### CS Lens

`AppSettings.Load()`/`.Save()` being `static`/instance methods on the
settings class itself, rather than logic living inside
`InventoryViewModel`, keeps the *concept* of "how settings persist"
entirely self-contained — `InventoryViewModel` just calls `AppSettings.Load()`
and trusts it, the same way it trusts `SqliteConnection` to handle the
actual mechanics of talking to a database file.

### SE Lens

Why save on `LostFocus` instead of providing an explicit "Save Settings"
button, the way this project's inventory data always requires a
deliberate Save/Add click? Because a setting like this is low-stakes and
reversible — typing a new threshold and clicking elsewhere is a natural,
complete gesture, unlike adding an inventory item (a real, permanent
database row) or deleting one (Lesson 22's genuinely destructive,
confirmed action). Different kinds of changes warrant different amounts
of ceremony; a text box holding a preference doesn't need the same
weight as a form creating a real, permanent record.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: change the low-stock threshold, click
elsewhere to move focus away from the box, fully quit the app, and
reopen it — the new value is still there. Check
`%AppData%\PocketInventory\settings.json` directly (paste that path
into File Explorer's address bar) — a real, readable JSON file exists
with the exact value you set.

### Connection

Real, correctly located, correctly persisted settings now exist,
completely independent of the inventory database. The next lesson adds
the first setting that actually changes something visible — a dark mode
toggle — using `DynamicResource` instead of the `StaticResource` this
project has used for every style since Lesson 5.

---

## Closing

### Connect the Pieces

`InventoryViewModel`'s constructor calls `AppSettings.Load()` once,
which checks whether a real `settings.json` already exists at the
correct, real `%AppData%\PocketInventory` location — proven, with real
output, in this lesson's own first unit — returning either the saved
values or sensible defaults. The threshold `TextBox`'s `LostFocus` event
calls `Settings.Save()`, writing the current in-memory `AppSettings`
back to that same file, using the identical `JsonSerializer` pattern
already proven correct for inventory export back in Lesson 36.

### What Breaks Without This

Temporarily change `AppSettings.Load()` to skip the
`File.Exists(SettingsPath)` check, calling
`JsonSerializer.Deserialize<AppSettings>(File.ReadAllText(SettingsPath))`
unconditionally. Delete any existing `settings.json` (or run on a truly
fresh machine) and start the app. Real, representative failure: the app
crashes on startup — `File.ReadAllText` throws a real
`FileNotFoundException` the moment it tries to read a file that's never
been created yet, exactly the first-run scenario this lesson's own
`if` check exists to handle gracefully. Restore the real existence
check afterward.

### Exercises

- In the `lab-settings` throwaway pattern, delete the settings file
  between runs and confirm, with real output, that `Environment.GetFolderPath`
  still resolves correctly and a fresh file gets created with default
  values.
- Predict, in your own words, what would happen if two different
  Windows user accounts on the same machine both ran this project — do
  they share one `settings.json`, or does each get their own? Reason
  from what `Environment.SpecialFolder.ApplicationData` actually
  resolves to before checking.
- Add a second, real setting (for example, a default `Category` for new
  items) to `AppSettings`, wire it into the Add form, and confirm it
  persists correctly across a full quit and reopen, using the exact
  `Load`/`Save` pattern already proven for `LowStockThreshold`.

### Definition of Done

- [ ] `AppSettings` persists to a real, correct
      `%AppData%\PocketInventory\settings.json` file, not next to the
      `.exe` and not inside `pocketinventory.db`.
- [ ] `LowStockThreshold` survives a full quit and reopen of the app.
- [ ] A first run, with no existing settings file, starts with sensible
      defaults instead of crashing.
- [ ] You reproduced the missing-file crash on purpose (skipping the
      `File.Exists` check), confirmed the real exception, and restored
      the correct handling.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add persisted app settings via %AppData%, separate from inventory data — Epic 10 begins"`.
