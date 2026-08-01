# Lesson 26: A File Nobody Points to Anymore

*(`File.Delete`, cleanup as part of the same operation)*

**User Story**
> As a user, I want removing a photo — or deleting the item it belongs
> to — to actually remove the photo file, not just forget where it was.

**What you will build**
Lesson 25 made photos permanent by copying them into an app-owned
folder. That same permanence has a real cost this lesson exists to pay
off: nothing currently deletes a photo file when it's no longer needed.
Remove a photo from an item, or delete the item entirely, and the actual
`.jpg` sitting in the `Photos` folder stays there forever — an
**orphaned file**, real bytes on disk with nothing in the database
pointing at them anymore.

**What you need to know first:** Lesson 22: `DeleteButton_Click`,
`DeleteCommand`. Lesson 23: `RemoveItem`. Lesson 25: `File.Copy`,
`PhotoPath`, why `CacheOption.OnLoad` keeps a photo file unlocked.

**Terms introduced in this lesson:**
- **Orphaned file** — a file on disk that nothing in the application's
  own data still references; harmless individually, but real, wasted,
  invisibly accumulating storage over time.
- **`File.Delete`** — removes a file; silently does nothing if the path
  doesn't already exist, a real, useful, and worth-confirming difference
  from most of this project's other operations, which fail loudly on a
  missing target.

---

## Concept Unit: `File.Delete` — What It Actually Does on a Missing Path

### The Problem

Deleting a photo file needs to handle a case this project hasn't hit
yet: what should happen if the file this project *thinks* exists is
already gone — deleted by hand outside the app, or never successfully
copied in the first place?

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-orphan
cd lab-orphan
```

Replace `Program.cs`:

```csharp
string testFolder = Path.Combine(Path.GetTempPath(), "lab-orphan");
Directory.CreateDirectory(testFolder);
string realFile = Path.Combine(testFolder, "real.txt");
File.WriteAllText(realFile, "hello");

Console.WriteLine($"Real file exists before delete: {File.Exists(realFile)}");
File.Delete(realFile);
Console.WriteLine($"Real file exists after delete: {File.Exists(realFile)}");

string missingFile = Path.Combine(testFolder, "does-not-exist.txt");
Console.WriteLine($"Missing file exists: {File.Exists(missingFile)}");
try
{
    File.Delete(missingFile);
    Console.WriteLine("File.Delete on a nonexistent path: no exception thrown");
}
catch (Exception ex)
{
    Console.WriteLine($"File.Delete on a nonexistent path threw: {ex.GetType().Name}");
}

Directory.Delete(testFolder, recursive: true);
```

Run it:

```bash
dotnet run
```

Real output:

```text
Real file exists before delete: True
Real file exists after delete: False
Missing file exists: False
File.Delete on a nonexistent path: no exception thrown
```

*What this proves:* `File.Delete` on a file that genuinely exists removes
it — `File.Exists` confirms `True` before, `False` after. `File.Delete`
on a path that *doesn't* exist does not throw at all — a real, deliberate
difference from, say, `File.Copy` on a missing source (which does throw)
or `SqliteCommand.ExecuteNonQuery()` against a broken connection.
`File.Delete`'s own documented contract is specifically "make sure this
path doesn't exist afterward," which is already true if it never existed
— nothing to do, nothing to report.

### Discard the Throwaway Example
Delete the `lab-orphan` folder. This `File.Delete` behavior is not
discarded — the real cleanup code relies on it next.

### Mechanical Walkthrough

- `File.Delete(realFile)` — reappearing (`File.Delete` was named but not
  yet used directly in Lesson 25's own lab), confirmed here to actually
  remove a real file.
- `File.Delete(missingFile)` throwing nothing — **first appearance of
  this specific, real contract.** Worth confirming directly rather than
  assuming: many file operations in .NET throw `FileNotFoundException`
  on a missing target; `File.Delete` deliberately does not.

### CS Lens

This is **idempotency**, the same property `CREATE TABLE IF NOT EXISTS`
(Lesson 9) and `INSERT OR IGNORE` (Lesson 24) already gave this project's
own SQL — an operation safe to repeat, or to call when its effect is
already true, without needing a separate check first. `File.Delete`
being idempotent on a missing path means cleanup code never needs an
`if (File.Exists(...))` guard purely to avoid a crash — only if it
actually needs to distinguish the two cases for some other reason.

### SE Lens

Why does this matter specifically for *this* project's cleanup code,
rather than being a minor .NET trivia fact? Because the exact scenario
this lesson's next units handle — a photo file that might already be
gone, might never have existed (an item with no photo at all,
`PhotoPath == string.Empty`), or might be sitting there waiting to be
removed — all collapse into the same one line of code, with no branching
needed to tell them apart first.

### Connection

The real "Remove Photo" flow and item-deletion cleanup both rely on
exactly this next.

---

## Concept Unit: Removing a Photo From an Item

### The Problem

Once a photo is attached (Lesson 25), nothing lets a user remove it — and
even if `PhotoPath` were simply cleared in memory, the real file copied
into the `Photos` folder would stay there forever, unreferenced.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `PhotoPath`, `PhotoImage`, Lesson 25; `File.Delete`,
  previous unit.

### The New Code — the Button

```xml
<Button Content="Remove Photo"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Command="{Binding RemovePhotoCommand}" />
```

### The New Code — the Command

```csharp
public RelayCommand RemovePhotoCommand { get; }

// In the constructor:
RemovePhotoCommand = new RelayCommand(
    execute: _ => RemovePhoto(),
    canExecute: _ => !string.IsNullOrEmpty(NewItemDraft.PhotoPath));

private void RemovePhoto()
{
    File.Delete(NewItemDraft.PhotoPath);
    NewItemDraft.PhotoPath = string.Empty;
    PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(PhotoImage)));
}
```

### Mechanical Walkthrough

- `canExecute: _ => !string.IsNullOrEmpty(NewItemDraft.PhotoPath)` —
  reappearing (`RelayCommand`'s `canExecute` delegate, Lesson 23) — the
  button visibly disables itself the moment there's genuinely no photo to
  remove, the same automatic-`IsEnabled` payoff `AddCommand` already
  demonstrated.
- `File.Delete(NewItemDraft.PhotoPath)` — direct application of this
  lesson's first unit: called unconditionally, with no `File.Exists`
  check first, relying on `File.Delete`'s own safe, idempotent behavior
  on a path that might already be gone.
- `NewItemDraft.PhotoPath = string.Empty;` — reappearing (property
  assignment through the established `INotifyPropertyChanged` shape),
  clearing the reference *after* the file itself is actually gone —
  worth naming the order deliberately: deleting the file first means a
  crash between the two lines would leave a real file with no reference
  (an orphan, the exact problem this lesson exists to prevent) rather
  than a reference to a file that's already gone (a broken photo,
  `PhotoImage`'s own `File.Exists` check from Lesson 25 already handles
  that second case safely).

### CS Lens

Deleting the real file *before* clearing the in-memory reference is a
small, deliberate ordering choice with a real consequence: it means this
project's failure mode, if something ever went wrong mid-operation, is
"a photo that's already gone but the item still thinks it has one" —
safely handled already — rather than "a real file with nothing pointing
at it," the actual bug this lesson exists to prevent. Ordering operations
so failure leans toward the *recoverable* outcome, not just "some
outcome," is a real, general engineering habit worth naming explicitly.

### SE Lens

Why does `RemovePhotoCommand` operate on `NewItemDraft` rather than
`SelectedItem` directly? Because — the same reasoning Lesson 21
established for editing any other field — changes made through the Add
form are meant to be staged until Save commits them, not applied
instantly to the object still shown, unconfirmed, in `ItemsGrid`. A
future, more complete version of this feature might ask "are you sure?"
the way deleting an entire item already does (Lesson 22); this lesson's
simpler version treats photo removal as low-stakes enough not to need
that pause, a real, honest scope decision worth naming rather than
hiding.

### Connection

The next unit closes the second, larger gap: deleting an entire item
still leaves its photo file behind.

---

## Concept Unit: Cleaning Up a Photo When Its Item Is Deleted

### The Problem

`RemoveItem` (Lesson 23) deletes an item's database row and removes it
from `Items` — but never touches that item's `PhotoPath`, if it had one.
Every item deleted with a photo attached leaves a real, permanent orphan.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryViewModel.cs` — `RemoveItem`.
- **Change type:** Modify.
- **Dependencies:** `RemoveItem`, Lesson 23; `File.Delete`, this
  lesson's first unit.

### The New Code

```csharp
public void RemoveItem(InventoryItem item)
{
    DeleteItemFromDatabase(item.Id);
    Items.Remove(item);

    if (!string.IsNullOrEmpty(item.PhotoPath))
    {
        File.Delete(item.PhotoPath);
    }

    if (editingItemId == item.Id)
    {
        editingItemId = null;
        NewItemDraft = new InventoryItem();
    }
}
```

### Mechanical Walkthrough

- `if (!string.IsNullOrEmpty(item.PhotoPath)) { File.Delete(item.PhotoPath); }`
  — (first appearance of cleanup logic inside `RemoveItem`) — worth
  noting this check *is* redundant with `File.Delete`'s own safe behavior
  on a missing path (this lesson's first unit) — included here purely to
  skip the call entirely for the common case (most items have no photo),
  not because it's required for correctness.

### CS Lens

This is the concrete meaning of this lesson's own SE-principle name:
**referential integrity isn't just a database concept.** Lesson 24's
`FOREIGN KEY` enforces that `Items.SupplierId` can never point at a
nonexistent supplier — a guarantee the *database itself* provides. Nothing
equivalent exists for `Items.PhotoPath` pointing at a real file — SQLite
has no idea the filesystem exists at all. Keeping that reference honest
is entirely this project's own responsibility, enforced by code like this,
not by any database constraint.

### SE Lens

Why clean up the photo file *inside* `RemoveItem` itself, rather than as
a separate, manual "clean up orphaned photos" maintenance step run
occasionally? Because deleting the item is the exact moment this project
*knows* the photo is no longer needed — deferring cleanup to some later,
separate process means correctly identifying which files in `Photos` are
still referenced and which aren't, a strictly harder problem than simply
acting at the one moment the answer is already known for certain.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: attach a photo to an item, note the real
filename in the `Photos` folder (visible in File Explorer), then delete
the item through the normal Delete-with-confirmation flow (Lesson 22).
Check the `Photos` folder again: the file is gone. Attach a photo to a
different item, click "Remove Photo" instead of deleting the whole item:
the thumbnail disappears, the button itself disables (nothing left to
remove), and the file is gone from `Photos` too — while the item itself
remains, fully intact.

### Connection

Every file this project creates now has a real, traceable lifetime,
matched to the data that owns it. The next lesson addresses a different
kind of copying problem — not files, but objects — starting with
duplicating an item and the real difference between copying a reference
and copying the data itself.

---

## Closing

### Connect the Pieces

Clicking "Remove Photo" calls `RemovePhoto` (second unit), which deletes
the real file via `File.Delete` — safe to call even if the file were
somehow already gone, per this lesson's first unit's own proof — then
clears `NewItemDraft.PhotoPath`, in that specific order, so a failure
between the two steps never produces a real orphan. Deleting an entire
item calls the same `File.Delete`, now added directly inside `RemoveItem`
(third unit), the moment before that item's own row and in-memory
presence are gone — the one point in this project's whole lifecycle where
"this photo is no longer needed" is unambiguously, permanently true.

### What Breaks Without This

Temporarily remove the new `File.Delete` block from `RemoveItem`
(restoring Lesson 23's original version) and rerun. Attach a photo to an
item, note its real filename in the `Photos` folder, then delete that
item. Real, representative failure: the item disappears from `ItemsGrid`
completely, and the app shows no error at all — but the photo file is
still sitting in the `Photos` folder, exactly where it was, now truly
orphaned: nothing in the database, and nothing in this project's own UI,
references it anymore. Only direct inspection of the `Photos` folder
reveals the leak — this is precisely why this bug is easy to ship
unnoticed, and why this lesson's own "Run It" step explicitly checks the
folder by hand rather than trusting the UI alone. Restore the real
cleanup code afterward.

### Exercises

- In the `lab-orphan` throwaway pattern, write a small method
  `int CountOrphans(string folder, IEnumerable<string> referencedPaths)`
  that counts files in `folder` not present in `referencedPaths` — run it
  against a folder with three files, two of them "referenced," and
  confirm real output showing `1`.
- Predict, in your own words, what happens if `RemovePhotoCommand` is
  clicked twice in a row, quickly, before the first click's effects are
  visible — does the second `File.Delete` call cause a problem? Reason
  from this lesson's first unit before testing it.
- Add a real, permanent "clean up any orphaned files already sitting in
  Photos" pass that runs once at startup (comparing every file in
  `Photos` against every `PhotoPath` currently in the database) — a
  genuine defense against orphans created before this lesson's fix
  existed. This is real, optional extra work, not required for Definition
  of Done.

### Definition of Done

- [ ] A "Remove Photo" button exists, disabling itself automatically when
      the current draft has no photo.
- [ ] Removing a photo deletes the real file from the `Photos` folder,
      not just the in-memory reference.
- [ ] Deleting an item with a photo also deletes that photo's real file.
- [ ] Deleting an item with *no* photo still works correctly, with no
      error from the added cleanup code.
- [ ] You reproduced the orphaned-file bug on purpose (removing the
      cleanup line from `RemoveItem`), confirmed the leak by checking the
      `Photos` folder directly, and restored the real cleanup code.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Delete orphaned photo files when a photo or its item is removed"`.
