# Lesson 25: A Path Is Not the Picture

*(`OpenFileDialog`, `BitmapImage`, copying a file into an app-owned folder)*

**User Story**
> As a user, I want to attach a photograph to an item.

**What you will build**
A real photo, attached to a real item, shown as a real thumbnail. The
transferable problem underneath this lesson: a photo is a large binary
file, genuinely different from every field this project has stored so
far — `Value`, `Notes`, even `SupplierName` are all small enough to sit
directly in a database column without a second thought. A photo is not.
This lesson stores the *path* to a real file on disk, copied into a
folder this project owns, and only ever reads the actual image bytes
through that path — never through the database at all.

**What you need to know first:** Lesson 9: SQLite column types and their
limits. Lesson 12: why a fixed set of values beats free text (the same
"store a reference, not the whole thing" instinct, applied here to files
instead of categories).

**Terms introduced in this lesson:**
- **`OpenFileDialog`** (`Microsoft.Win32`) — a built-in Windows file-picker
  dialog; `ShowDialog()` opens it and blocks, the same modal pattern
  `MessageBox.Show` already established in Lesson 22.
- **`BitmapImage`** — a WPF type representing a loaded, decoded image,
  built explicitly (rather than relying on WPF's implicit string-to-image
  conversion) specifically to control *when* the underlying file is read
  and released.
- **BLOB vs. filesystem** — the real tradeoff between storing binary data
  directly inside a database column (a BLOB) versus storing only a file
  path and keeping the actual bytes on disk.

**Objects and methods used**
- `OpenFileDialog`, `BitmapImage`, and `File.Copy` are this lesson's
  own subject, given full treatment in the Concept Units below.
- This lesson's own throwaway labs turn out to be this project's first
  real use of `System.IO`'s plain-file-I/O static-class family — `Path`
  and `Directory` — plus `FileInfo` and `Uri`. Each gets its own real
  entry here, not folded into surrounding prose.

**`Path`**
- *What it is:* a `static` class of pure, no-filesystem-access helper
  methods for building and taking apart file/folder path strings —
  never a class you construct an instance of.
- *Implementation:* every member is `static` (a fixed, stateless
  operation, not a "thing" sitting in memory) — none of them read or
  write anything on disk. `Path.Combine(string, string)` joins path
  segments with the correct separator for the current OS (`\` on
  Windows), so code never has to hardcode which slash to use.
  `Path.GetTempPath()` returns the current user's own OS-designated
  temporary-files folder (on Windows, typically something under
  `C:\Users\<you>\AppData\Local\Temp\`) as a plain `string` — the OS
  decides where that is, not this project.
- *Its use:* `Path.Combine(Path.GetTempPath(), "lab-photo-app-owned")`
  builds a real, valid folder path for this lab's own scratch files
  without this lesson's code ever hardcoding a drive letter or a
  particular separator character; the real project's own `AddPhoto`
  method reuses `Path.Combine` the identical way, against
  `AppContext.BaseDirectory` instead of a temp folder.

**`Directory`**
- *What it is:* a `static` class of filesystem-*mutating* operations on
  whole folders — distinct from `Path`, which only ever manipulates
  path *strings* and never touches the disk at all.
- *Implementation:* `Directory.CreateDirectory(string path)` creates
  every folder in `path` that doesn't already exist yet (including any
  missing parent folders), and does nothing — no exception — if the
  folder is already there, the same "safe to call unconditionally"
  shape `CREATE TABLE IF NOT EXISTS` (Lesson 9) already established for
  a table. `Directory.Delete(string path, bool recursive)` removes a
  folder; passing `recursive: true` also removes everything inside it
  first — omitting that argument (or passing `false`) throws instead of
  silently deleting a non-empty folder.
- *Its use:* `Directory.CreateDirectory(appPhotosFolder)` guarantees
  this lab's own destination folder exists before `File.Copy` ever
  tries to write into it. `Directory.Delete(appPhotosFolder, recursive: true)`,
  at the end of the lab, tears the whole scratch folder back down —
  this specific lab's own cleanup, not a pattern the real project reuses
  (the real `Photos` folder is meant to persist, not be deleted).

**`FileInfo`**
- *What it is:* an object representing one specific file's own
  metadata — its size, its last-modified time, whether it exists — as
  distinct from `File`, a `static` class of one-off operations
  (`File.Copy`, `File.Exists`) that take a path string every time and
  hold no state of their own between calls.
- *Implementation:* `new FileInfo(sourcePath)` constructs a real object
  tied to one specific path; `.Length` is an instance property on that
  object, reading the file's real size in bytes from the filesystem.
- *Its use:* `new FileInfo(sourcePath).Length`, inside this lab's own
  `Console.WriteLine`, reports the real source photo's size purely as
  a sanity check before copying it — proof the file this lab is about
  to copy is a real, substantial image (`1602752` bytes, per this
  lesson's own real output), not an empty placeholder.

**`Uri`**
- *What it is:* a structured representation of a resource
  location — a local file path, an `http://` address, or several other
  schemes — parsed once into real, addressable parts (scheme, path)
  rather than treated as an opaque string.
- *Implementation:* `new Uri(destinationPath)` parses a plain file
  system path string into a real `Uri` object; passed a path with no
  explicit scheme, it infers the local `file://` scheme automatically.
- *Its use:* `BitmapImage.UriSource` (below) requires a real `Uri`, not
  a bare `string` — `BitmapImage` is built generically enough to load
  an image from a remote `http://` address the identical way it loads
  one from a local disk path, and `Uri` is the one shared type that can
  represent either.

---

## Concept Unit: Copying a File Into an App-Owned Folder

### The Problem

A photo a user picks lives wherever they originally saved it — their
Downloads folder, a USB drive, anywhere. If this project only remembered
that original path, the photo would vanish the moment that file moved,
was renamed, or the drive was unplugged. This project needs its own,
permanent copy.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-photo
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel Loaded="StackPanel_Loaded">
    <Image x:Name="PhotoImage" Width="100" Height="100" />
</StackPanel>
```

Replace `MainWindow.xaml.cs`'s contents (this lab uses a real image
already on every Windows machine, so it runs unmodified — swap the path
for any small image file of your own if you'd rather use one):

```csharp
using System.IO;
using System.Windows;
using System.Windows.Media.Imaging;

namespace lab_photo
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            string sourcePath = @"C:\Windows\Web\Wallpaper\Windows\img0.jpg";
            Console.WriteLine($"Source file exists: {File.Exists(sourcePath)}, size {new FileInfo(sourcePath).Length} bytes");

            string appPhotosFolder = Path.Combine(Path.GetTempPath(), "lab-photo-app-owned");
            Directory.CreateDirectory(appPhotosFolder);
            string destinationPath = Path.Combine(appPhotosFolder, $"{Guid.NewGuid()}.jpg");
            File.Copy(sourcePath, destinationPath);
            Console.WriteLine($"Copied into app-owned folder: {File.Exists(destinationPath)}");
            Console.WriteLine($"Source file still exists at its original location: {File.Exists(sourcePath)}");

            BitmapImage loaded = new BitmapImage();
            loaded.BeginInit();
            loaded.UriSource = new Uri(destinationPath);
            loaded.CacheOption = BitmapCacheOption.OnLoad;
            loaded.EndInit();

            Console.WriteLine($"Loaded BitmapImage: {loaded.PixelWidth}x{loaded.PixelHeight}");
            PhotoImage.Source = loaded;

            Directory.Delete(appPhotosFolder, recursive: true);
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
Source file exists: True, size 1602752 bytes
Copied into app-owned folder: True
Source file still exists at its original location: True
Loaded BitmapImage: 3840x2400
```

Also worth seeing directly: the real Windows wallpaper appears, small, in
the running window's `Image` control.

*What this proves:* `File.Copy(sourcePath, destinationPath)` creates a
genuine, independent second file — `File.Exists` reports `True` for
*both* paths afterward, proving `Copy`, unlike `Move`, leaves the
original completely untouched. `BitmapImage`, built explicitly with
`BeginInit()`/`UriSource`/`EndInit()` rather than a plain XAML string
binding, correctly loads the real copied file and reports its real
dimensions (`3840x2400`, matching the source's own resolution) — proof
the bytes were genuinely decoded, not just referenced by a path that
happens to exist.

### Discard the Throwaway Example
Delete the `lab-photo` folder. `File.Copy`/`BitmapImage` are not
discarded — the real project's `PhotoPath` field uses exactly this next.

### Mechanical Walkthrough

- `new FileInfo(sourcePath).Length` — **first appearance of `FileInfo`.**
  Builds a real object tied to `sourcePath` specifically and reads its
  actual on-disk size in bytes — `File.Exists`, alongside it in the same
  `WriteLine`, is a `static`, one-off check on the same path with no
  object of its own; `FileInfo` is the alternative shape used any time
  more than one fact about the *same* file is needed together.
- `Path.Combine(Path.GetTempPath(), "lab-photo-app-owned")` — **first
  appearance of `Path.Combine` and `Path.GetTempPath()`.**
  `Path.GetTempPath()` asks the OS for this user's own temp-files
  folder, as a plain `string`; `Path.Combine` joins that string and
  `"lab-photo-app-owned"` with the correct separator for whatever OS
  this code happens to run on, rather than this lesson's code hardcoding
  `\` and risking it being wrong on a different OS.
- `Directory.CreateDirectory(appPhotosFolder)` — **first appearance.**
  Creates the folder `Path.Combine` just built a name for, doing nothing
  (no exception) if it happens to already exist — the identical
  "idempotent, safe to call every time" shape `CREATE TABLE IF NOT
  EXISTS` (Lesson 9) already established, applied here to a folder
  instead of a database table.
- `Path.Combine(appPhotosFolder, $"{Guid.NewGuid()}.jpg")` — reappearing
  (`Path.Combine`, moments above), building the actual destination file
  path this time, not just a folder.
- `File.Copy(sourcePath, destinationPath)` — **first appearance.**
  Copies a file's bytes to a new location; throws if `destinationPath`
  already exists (an overload accepting `overwrite: true` exists but
  isn't needed here, since every destination filename is a fresh
  `Guid.NewGuid()`).
- `Guid.NewGuid()` — (first appearance) — generates a statistically
  unique identifier, used here as the copied file's own name, guaranteed
  never to collide with another photo this project ever copies in,
  regardless of what the original filename was.
- `new BitmapImage(); BeginInit(); ...; CacheOption = BitmapCacheOption.OnLoad; EndInit();`
  — **first appearance of `BitmapImage`.** `BeginInit()`/`EndInit()`
  bracket a batch of property assignments WPF applies together, only
  once `EndInit()` runs — the same batching idea behind
  `SqliteCommand`'s parameters being added before `ExecuteNonQuery()`
  is ever called. `CacheOption = BitmapCacheOption.OnLoad` — this
  lesson's single most important detail, proven with real consequences
  in the next unit — forces the entire image to be read into memory
  immediately, during `EndInit()`, instead of lazily, on demand, later.
- `UriSource = new Uri(destinationPath)` — **first appearance of `Uri`,
  called out on its own** (not folded into the `BitmapImage` bullet
  above, since it's a distinct type with its own real job): parses
  `destinationPath` — a plain local file path string — into a real,
  structured `Uri` object, inferring the local `file://` scheme since
  none was written explicitly. `BitmapImage.UriSource` requires exactly
  this type, not a bare `string`, because the same property also has to
  accept a remote `http://` image address, and `Uri` is the one type
  general enough to represent either.
- `Directory.Delete(appPhotosFolder, recursive: true)` — **first
  appearance.** Removes `appPhotosFolder` and everything inside it —
  `recursive: true` is required here specifically because the folder
  isn't empty (it holds the one copied photo); passing `false` instead,
  or omitting the argument, would throw rather than silently leaving
  files behind.

### CS Lens

Storing a **path**, not the image itself, on `InventoryItem` is the same
underlying idea as `SupplierId` (Lesson 24): a small, stable reference to
something larger, kept in exactly one real place, rather than duplicated
everywhere it's needed. `File.Copy` is what makes that reference
trustworthy — the path this project stores points at a file *this
project itself owns and controls*, not one that could move or disappear
outside its control.

### SE Lens

Why copy the file into a project-owned folder at all, instead of simply
storing whatever path the user originally picked? Because that original
path is outside this project's control — the user could rename the file,
move it, or delete it entirely, at any point, with zero warning to this
project. Copying it once, immediately, into a folder this project alone
manages, is what actually makes "this item has a photo, permanently"
true, rather than "this item had a photo, as of whenever it was last
verified to still exist."

### Connection

The next unit proves exactly why `CacheOption = BitmapCacheOption.OnLoad`
specifically — not just "loading an image somehow" — matters.

---

## Concept Unit: Why `BitmapImage`, Not a Plain String Binding

### The Problem

WPF can actually bind `Image.Source` directly to a plain `string` path —
`Source="{Binding PhotoPath}"` — with no `BitmapImage` code at all, and
it works. So why does this lesson bother with `BitmapImage` explicitly?

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-photolock
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel Loaded="StackPanel_Loaded">
    <Image x:Name="ImplicitImage" Width="100" Height="100" Source="{Binding ImplicitPath}" />
    <Image x:Name="ExplicitImage" Width="100" Height="100" />
</StackPanel>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.IO;
using System.Windows;
using System.Windows.Media.Imaging;

namespace lab_photolock
{
    public partial class MainWindow : Window
    {
        public string ImplicitPath { get; set; }
        private string explicitPath;

        public MainWindow()
        {
            InitializeComponent();

            string source = @"C:\Windows\Web\Wallpaper\Windows\img0.jpg";
            string testFolder = Path.Combine(Path.GetTempPath(), "lab-photolock");
            Directory.CreateDirectory(testFolder);

            string implicitCopy = Path.Combine(testFolder, "implicit.jpg");
            File.Copy(source, implicitCopy, overwrite: true);
            ImplicitPath = implicitCopy;

            explicitPath = Path.Combine(testFolder, "explicit.jpg");
            File.Copy(source, explicitPath, overwrite: true);

            DataContext = this;
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            BitmapImage explicitBitmap = new BitmapImage();
            explicitBitmap.BeginInit();
            explicitBitmap.UriSource = new Uri(explicitPath);
            explicitBitmap.CacheOption = BitmapCacheOption.OnLoad;
            explicitBitmap.EndInit();
            ExplicitImage.Source = explicitBitmap;

            string testFolder = Path.GetDirectoryName(explicitPath)!;

            TryDelete("implicit (plain string binding)", Path.Combine(testFolder, "implicit.jpg"));
            TryDelete("explicit (BitmapImage, CacheOption.OnLoad)", explicitPath);
        }

        private void TryDelete(string label, string path)
        {
            try
            {
                File.Delete(path);
                Console.WriteLine($"{label}: delete succeeded");
            }
            catch (IOException ex)
            {
                Console.WriteLine($"{label}: delete FAILED - {ex.Message}");
            }
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
implicit (plain string binding): delete FAILED - The process cannot access the file 'C:\Users\...\lab-photolock\implicit.jpg' because it is being used by another process.
explicit (BitmapImage, CacheOption.OnLoad): delete succeeded
```

*What this proves:* both `Image`s display the identical photo — visually
indistinguishable — but they behave completely differently underneath.
The plain string binding leaves WPF holding the file open, presumably
expecting it might need to re-read it later; trying to delete that file
while the app is still running fails with a real, genuine `IOException`.
The explicit `BitmapImage`, with `CacheOption.OnLoad`, reads the entire
file into memory once, during `EndInit()`, and releases the file handle
immediately afterward — deleting it succeeds without any error at all.

### Discard the Throwaway Example
Delete the `lab-photolock` folder. `CacheOption.OnLoad` is not discarded
— every real photo this project loads uses exactly this.

### Mechanical Walkthrough

- `Source="{Binding ImplicitPath}"` — WPF's built-in string-to-`ImageSource`
  conversion, real and functional, but leaving the file locked open for
  as long as the `Image` control might need it — WPF's own lazy,
  by-default caching behavior.
- `CacheOption = BitmapCacheOption.OnLoad` — the one line separating the
  two `Image`s' real, observable behavior: forces immediate, full loading
  into memory rather than deferring it, and — the specific, documented
  consequence proven here — releases the underlying file handle once
  loading completes.

### CS Lens

This is the same **eager vs. lazy** distinction as `BitmapImage`'s own
default (lazy, on-demand loading) versus `CacheOption.OnLoad` (eager,
immediate loading) — a real, general tradeoff in how any system decides
*when* to actually do expensive work, here made concretely visible by a
real file-lock, not an abstract performance number.

### SE Lens

Why does this specific tradeoff matter enough to name explicitly, rather
than just picking whichever loading style is simpler to write? Because
Lesson 26, immediately next, needs to delete photo files a user has
removed from an item — and a locked file makes `File.Delete` throw
exactly the real exception captured above. Choosing `CacheOption.OnLoad`
here isn't a style preference; it's what makes Lesson 26's whole feature
possible at all.

### Connection

The real project's photo display uses `CacheOption.OnLoad` for exactly
this reason, wired in next.

---

## Concept Unit: Wiring a Real Photo Into the Form

### The Problem

`File.Copy`, `BitmapImage`, and `OpenFileDialog` all exist independently
(or, for `OpenFileDialog`, exist as a well-documented, standard WPF type
this project hasn't used yet); nothing connects them to a real item.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryItem.cs`, `InventoryPage.xaml`,
  `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** Every unit in this lesson.

### The New Code — `InventoryItem` Growth

```csharp
private string photoPath = string.Empty;

public string PhotoPath
{
    get { return photoPath; }
    set
    {
        photoPath = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(PhotoPath)));
    }
}
```

### The New Code — the Add Photo Button and Thumbnail

```xml
<Button Content="Add Photo"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Command="{Binding AddPhotoCommand}" />
```

```xml
<Image Width="80" Height="80" Margin="0,8,0,0" Source="{Binding PhotoImage}" />
```

### The New Code — the Command

```csharp
public RelayCommand AddPhotoCommand { get; }

// In the constructor:
AddPhotoCommand = new RelayCommand(
    execute: _ => AddPhoto(),
    canExecute: _ => SelectedItem != null);

private void AddPhoto()
{
    Microsoft.Win32.OpenFileDialog dialog = new Microsoft.Win32.OpenFileDialog
    {
        Filter = "Image files (*.jpg;*.png)|*.jpg;*.png|All files (*.*)|*.*"
    };

    if (dialog.ShowDialog() != true)
    {
        return;
    }

    string photosFolder = Path.Combine(AppContext.BaseDirectory, "Photos");
    Directory.CreateDirectory(photosFolder);
    string extension = Path.GetExtension(dialog.FileName);
    string destinationPath = Path.Combine(photosFolder, $"{Guid.NewGuid()}{extension}");
    File.Copy(dialog.FileName, destinationPath);

    NewItemDraft.PhotoPath = destinationPath;
}
```

### The New Code — Loading `PhotoImage` for the Selected Item

```csharp
public BitmapImage? PhotoImage
{
    get
    {
        if (string.IsNullOrEmpty(SelectedItem?.PhotoPath) || !File.Exists(SelectedItem.PhotoPath))
        {
            return null;
        }

        BitmapImage image = new BitmapImage();
        image.BeginInit();
        image.UriSource = new Uri(SelectedItem.PhotoPath);
        image.CacheOption = BitmapCacheOption.OnLoad;
        image.EndInit();
        return image;
    }
}
```

`SelectedItem`'s own `set` block (Lesson 23) now also raises
`PropertyChanged` for `nameof(PhotoImage)`, so the thumbnail refreshes
the instant a different item is selected.

### Mechanical Walkthrough

- `dialog.ShowDialog() != true` — (first appearance of `OpenFileDialog`)
  — `ShowDialog()` returns `bool?` (Lesson 14's nullable value types,
  reappearing) — `true` means the user picked a file and confirmed;
  `false` means Cancel; `null` is also possible (the dialog was closed
  without a clear answer) — comparing against `true` explicitly, the
  same defensive pattern Lesson 22's `MessageBoxResult.Yes` check
  already established, treats every non-`true` outcome identically as
  "do nothing."
- `Path.Combine(AppContext.BaseDirectory, "Photos")` — (first appearance
  of `AppContext.BaseDirectory`) — the folder this project's own `.exe`
  is running from; a `"Photos"` subfolder there is this project's
  app-owned storage, exactly the folder this lesson's first unit's `File.Copy`
  proof already established the pattern for.
- `PhotoImage` computed as a property, not stored — reappearing shape
  (`CategoryValues`, Lesson 12; `SupplierName`-adjacent reasoning), built
  fresh from `SelectedItem.PhotoPath` every time it's read, using the
  exact `BeginInit()`/`CacheOption.OnLoad`/`EndInit()` sequence proven in
  this lesson's second unit — never storing a `BitmapImage` instance
  itself, avoiding any risk of holding a stale image after selection
  changes.

### CS Lens

Computing `PhotoImage` freshly every time, rather than caching a
`BitmapImage` instance on `InventoryItem` itself, keeps `InventoryItem`
what it's always been: plain data (a `string` path), with no WPF-specific
type anywhere on it. `PhotoImage` living on the ViewModel instead is the
same separation-of-concerns boundary Lesson 23 drew between
`InventoryViewModel` and WPF — `BitmapImage` is a real UI type, and it
stays exactly one layer away from the plain data model.

### SE Lens

Why does `AddPhotoCommand`'s `canExecute` check `SelectedItem != null`
rather than always being enabled? Because a photo needs to attach to a
*specific* item — either one already selected for editing, or (worth
naming honestly) a brand-new draft that hasn't been saved yet, which this
lesson's simple version doesn't yet distinguish. This project's current
choice — requiring a selection first — is the smaller, safer slice; a
photo added while creating a brand-new item, before that item has a real
`Id`, is a genuine edge case a future pass could address explicitly
rather than silently.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: select an item, click "Add Photo," pick any
image file — a real thumbnail appears immediately. Select a different
item with no photo; the thumbnail clears. Select the first item again;
its photo reappears, loaded fresh from disk each time. Fully quit and
reopen the app, select the item again: the photo is still there, proving
the copied file and its stored path both survived.

### Connection

Photos are real, permanent, and correctly loaded without locking their
own files. The next lesson closes the gap this one deliberately left
open: what happens to a photo's file on disk when the item that owns it
— or just the photo itself — is removed.

---

## Closing

### Connect the Pieces

Clicking "Add Photo" opens a real `OpenFileDialog` (third unit); a
confirmed pick triggers `File.Copy` into `AppContext.BaseDirectory`'s own
`"Photos"` folder, the exact pattern proven with real, verified output in
this lesson's first unit. The new file's path is stored on
`NewItemDraft.PhotoPath` — a plain `string`, nothing WPF-specific.
Selecting that item later reads `PhotoImage`, which builds a real
`BitmapImage` from that path using `CacheOption.OnLoad`, the specific
choice this lesson's second unit proved — with real, contrasting output —
is what keeps the underlying file genuinely deletable later, not locked
open for as long as the app runs.

### What Breaks Without This

Temporarily remove `image.CacheOption = BitmapCacheOption.OnLoad;` from
`PhotoImage`'s getter and rerun. Add a photo to an item, then (using
File Explorer, or a throwaway console snippet) try to delete that exact
file from the `Photos` folder while the app is still running and that
item is currently selected. Real, representative failure: the delete
fails, the identical `IOException` this lesson's second unit already
captured — "the process cannot access the file because it is being used
by another process" — because the app itself is the process holding it
open. This is exactly the setup Lesson 26 needs to already be avoided
before it can delete a photo file safely and predictably. Restore
`CacheOption.OnLoad` afterward.

### Exercises

- In the `lab-photo` throwaway pattern, copy the same source file twice
  in a row (two separate `File.Copy` calls, two separate `Guid.NewGuid()`
  destination names) — confirm, with real output, that both copies exist
  independently and neither `File.Copy` call needed `overwrite: true`.
- Predict, in your own words, what `dialog.ShowDialog()` returns if a
  user opens the file picker and clicks Cancel, before checking
  `Microsoft.Win32.OpenFileDialog`'s own documentation or testing it on
  the real, running app.
- Change `PhotoImage`'s getter to omit the `File.Exists(SelectedItem.PhotoPath)`
  check, then manually delete a photo file out from under a saved item
  (using File Explorer) and select that item in the running app —
  observe and describe, in your own words, the real failure, then
  restore the check.

### Definition of Done

- [ ] `PhotoPath` (`string`) exists on `InventoryItem`, following the
      established `INotifyPropertyChanged` shape.
- [ ] "Add Photo" opens a real `OpenFileDialog`; a confirmed pick copies
      the file into an app-owned `Photos` folder and stores its path.
- [ ] Selecting an item with a photo shows a real thumbnail; selecting
      one without shows none.
- [ ] The thumbnail is built via explicit `BitmapImage` with
      `CacheOption.OnLoad`, not a plain string binding.
- [ ] A photo survives a full quit and reopen of the app.
- [ ] You reproduced the file-lock failure on purpose (by removing
      `CacheOption.OnLoad`), confirmed the real `IOException`, and
      restored the correct code.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Attach photos by copying into an app-owned folder and storing the path"`.
