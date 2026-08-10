# Lesson 34: A Comma Doesn't Know It's Supposed to Be Special

*(`StreamWriter`, manual CSV quoting/escaping rules)*

**User Story**
> As a user, I want to export my inventory as a CSV file I can open in
> Excel.

**What you will build**
A real `.csv` file, correct even for an item whose name itself contains
a comma. The transferable problem underneath this lesson: CSV's whole
format is "values separated by commas," which sounds simple until real
data contains a comma of its own — the exact moment "just join every
field with `,`" silently produces a broken file that looks fine until
someone opens it and finds fields split in the wrong place.

**What you need to know first:** Lesson 13: culture-aware formatting
(the same display-vs-storage distinction this lesson's escaping rules
echo). Lesson 30–33: reading `InventoryItem`s back out with `SELECT`.

**Terms introduced in this lesson:**
- **`StreamWriter`** — a .NET type for writing text to a file, one line
  or one chunk at a time, without building the entire file's content as
  one giant string in memory first.
- **CSV escaping** — the real rule (from the informal but
  near-universally followed RFC 4180 convention) for handling a field
  that itself contains a comma, a quote, or a newline: wrap it in double
  quotes, and double any literal quote inside it.

**Objects and methods used**
- No supporting cast beyond this lesson's own subject — `StreamWriter`
  and CSV escaping are given full treatment in the Concept Units below.

---

## Concept Unit: Why "Just Join With Commas" Breaks

### The Problem

An item named `"Hex Bolts, 1/4in"` — a real, plausible name, a comma
included on purpose — would, if simply joined with every other field
using `,`, produce a CSV row that looks like it has one extra field.
Nothing crashes; the file just becomes silently wrong.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-csv
cd lab-csv
```

Replace `Program.cs`:

```csharp
string naive = string.Join(",", "Hex Bolts, 1/4in", "Tools", "49.99");
Console.WriteLine("Naive join (broken):");
Console.WriteLine(naive);

string EscapeCsvField(string field)
{
    bool needsQuoting = field.Contains(',') || field.Contains('"') || field.Contains('\n');
    if (!needsQuoting)
    {
        return field;
    }
    return "\"" + field.Replace("\"", "\"\"") + "\"";
}

string name = "Hex Bolts, 1/4in";
string notes = "Says \"fragile\" on the box";
string escapedName = EscapeCsvField(name);
string escapedNotes = EscapeCsvField(notes);

Console.WriteLine("Escaped fields:");
Console.WriteLine(escapedName);
Console.WriteLine(escapedNotes);

string realRow = string.Join(",", escapedName, "Tools", "49.99", escapedNotes);
Console.WriteLine("Real CSV row:");
Console.WriteLine(realRow);
```

Run it:

```bash
dotnet run
```

Real output:

```text
Naive join (broken):
Hex Bolts, 1/4in,Tools,49.99
Escaped fields:
"Hex Bolts, 1/4in"
"Says ""fragile"" on the box"
Real CSV row:
"Hex Bolts, 1/4in",Tools,49.99,"Says ""fragile"" on the box"
```

*What this proves:* the naive join produces
`Hex Bolts, 1/4in,Tools,49.99` — genuinely four comma-separated pieces,
even though it was only ever meant to represent three fields; any real
CSV reader (Excel included) would parse `"Hex Bolts"` and `" 1/4in"` as
two separate columns, silently shifting every field after it one column
to the right. `EscapeCsvField` wraps a field in double quotes the
moment it contains a comma, a quote, or a newline — and, critically, a
literal `"` inside the field becomes `""` (two quote characters), the
standard way CSV distinguishes "a quote that's part of the data" from
"the quote marking where the field ends." The resulting row,
`"Hex Bolts, 1/4in",Tools,49.99,"Says ""fragile"" on the box"`, is
genuinely four fields, correctly, regardless of what punctuation any of
them contain.

### Discard the Throwaway Example
Keep `lab-csv` — the next unit adds real file writing to it.

### Mechanical Walkthrough

- `string.Join(",", "Hex Bolts, 1/4in", "Tools", "49.99")` — reappearing
  (`string.Join`, familiar since earlier lessons' string work),
  deliberately shown broken first — proof, not assertion, that naive
  joining fails the moment real data contains the separator character.
- `field.Contains(',') || field.Contains('"') || field.Contains('\n')`
  — **first appearance of the actual escaping *decision*.** A field
  needs quoting if and only if it contains one of exactly three
  characters — anything else can be written as-is, unquoted, which is
  why most fields in a typical export (`"Tools"`, `"49.99"`) come
  through completely unchanged.
- `field.Replace("\"", "\"\"")` — (first appearance of escaping a quote
  *within* an already-quoted field) — every literal `"` becomes two
  `""` — the reader (Excel, or this project's own future CSV parser,
  Lesson 35) knows a doubled `""` inside a quoted field means "one real
  quote character here," not "the field just ended."

### CS Lens

This is **serialization**, the same term Lesson 12 first used for
converting `Category` into `TEXT` for SQLite — applied here to a
different target format (CSV, meant for a human or Excel to read,
not SQLite) with different, format-specific escaping rules. Every
serialization format has its own answer to "what if the data itself
contains a character the format uses structurally" — CSV's answer is
quoting and doubled quotes; SQLite's parameterized queries (Lesson 12
onward) solved an analogous problem (a value containing SQL-meaningful
characters) an entirely different way.

### SE Lens

Why not just replace every comma in a field with something else — a
semicolon, say — instead of the more complex quote-and-double-up rule?
Because that would silently *corrupt* real data: an item genuinely named
`"Hex Bolts, 1/4in"` would export as `"Hex Bolts; 1/4in"`, permanently
losing the actual comma the user typed. Proper escaping preserves the
exact original data — reading the exported file back (Lesson 35) must
reconstruct `"Hex Bolts, 1/4in"` exactly, not a corrupted approximation
of it.

### Connection

A real file, written with `StreamWriter`, using exactly this escaping,
is built next.

---

## Concept Unit: Writing a Real Export File

### The Problem

Escaped fields exist only as strings in memory — nothing writes them to
a real `.csv` file a user could actually open in Excel.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `EscapeCsvField`, previous unit; `Microsoft.Win32.SaveFileDialog`
  (the export counterpart to Lesson 25's `OpenFileDialog`).

### The New Code — the Button

```xml
<Button Content="Export CSV"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Command="{Binding ExportCsvCommand}" />
```

### The New Code — the Export

```csharp
public RelayCommand ExportCsvCommand { get; }

// In the constructor:
ExportCsvCommand = new RelayCommand(
    execute: _ => ExportCsv(),
    canExecute: _ => Items.Count > 0);

private static string EscapeCsvField(string field)
{
    bool needsQuoting = field.Contains(',') || field.Contains('"') || field.Contains('\n');
    if (!needsQuoting)
    {
        return field;
    }
    return "\"" + field.Replace("\"", "\"\"") + "\"";
}

private void ExportCsv()
{
    Microsoft.Win32.SaveFileDialog dialog = new Microsoft.Win32.SaveFileDialog
    {
        Filter = "CSV files (*.csv)|*.csv",
        FileName = "inventory.csv"
    };

    if (dialog.ShowDialog() != true)
    {
        return;
    }

    using StreamWriter writer = new StreamWriter(dialog.FileName);
    writer.WriteLine("Name,Category,Location,Value,Notes");

    foreach (InventoryItem item in Items)
    {
        string row = string.Join(",",
            EscapeCsvField(item.Name),
            EscapeCsvField(item.Category.ToString()),
            EscapeCsvField(item.Location),
            item.Value.ToString(CultureInfo.InvariantCulture),
            EscapeCsvField(item.Notes));
        writer.WriteLine(row);
    }
}
```

### Mechanical Walkthrough

- `Microsoft.Win32.SaveFileDialog` — (first appearance) — the real
  counterpart to `OpenFileDialog` (Lesson 25); a real, modal Windows
  dialog for choosing *where to save* instead of *what to open*.
  `dialog.ShowDialog() != true` — reappearing exactly (Lesson 25's own
  `bool?` handling).
- `using StreamWriter writer = new StreamWriter(dialog.FileName);` —
  **first appearance of `StreamWriter`.** Opens a real file for writing;
  the `using` declaration (Lesson 9's `SqliteConnection` pattern,
  reused) guarantees it's closed and flushed to disk, even if an error
  occurs partway through writing.
- `writer.WriteLine(...)` — reappearing shape (string formatting,
  familiar throughout this project), writing one real line at a time
  rather than building the entire file as one giant string first — a
  real, if usually invisible, memory efficiency for a large export.
- `item.Value.ToString(CultureInfo.InvariantCulture)` — reappearing
  exactly (Lesson 13's storage-formatting choice) — CSV, like SQLite
  storage, needs a fixed, unambiguous number format, not
  culture-dependent display formatting; unescaped here deliberately,
  since a plain number like `49.99` can never contain a comma, quote, or
  newline.

### CS Lens

Writing one `WriteLine` per row, rather than accumulating the whole
file's text in a single giant `string` and writing it once at the end,
is the same **streaming vs. buffering** tradeoff `SqliteDataReader`
(Lesson 10) already represented for reading — process one unit at a
time, never holding the entire dataset in memory simultaneously, a habit
that stays cheap for ten items and stays *correct* for a hundred
thousand.

### SE Lens

Why does `EscapeCsvField` skip escaping `item.Value.ToString(...)`
entirely, unlike every `string` field? Because a `decimal`'s
`InvariantCulture`-formatted text (`"49.99"`) can, by construction,
never contain a comma, a quote, or a newline — the escaping check would
always return `false` for it, so calling it anyway would just be
wasted, misleading-looking work implying a real risk that doesn't
actually exist for this specific field's type.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: add an item named something with a comma in it
(for example, `"Hex Bolts, 1/4in"`), click Export CSV, save the file,
then open it in Excel (or any text editor). The comma-containing name
appears in exactly one cell/column, not split across two — real,
visible proof the escaping worked. Open the raw file in a plain text
editor too: the name appears wrapped in `"..."`, exactly as this
lesson's own lab predicted.

### Connection

Export is real and correct, even for data that would break a naive
approach. The next lesson closes the loop: reading a CSV file back in,
defensively, since an imported file — possibly hand-edited, possibly
malformed — can never be trusted the way this project's own export
output can.

---

## Closing

### Connect the Pieces

Clicking Export CSV opens a real `SaveFileDialog`; a confirmed save
opens a real `StreamWriter` and writes a header row, then one row per
item, each field passed through `EscapeCsvField` — the exact function
proven, with real, contrasting output, in this lesson's own lab to turn
a would-be-broken comma-containing field into a correctly quoted one.
`Value` alone skips escaping, deliberately, because its
`InvariantCulture`-formatted text structurally can never need it.

### What Breaks Without This

Temporarily replace every `EscapeCsvField(...)` call in `ExportCsv`
with the raw field value, unescaped (the naive `string.Join` this
lesson's first unit already proved broken). Add an item named
`"Hex Bolts, 1/4in"`, export, and open the file in Excel. Real,
representative failure: Excel shows `"Hex Bolts"` and `" 1/4in"` as two
separate cells, and every column after `Name` is shifted one to the
right — `Category` now sits where `Name`'s second half spilled into it,
and the file's last column is simply missing data entirely. Nothing
about the export process itself errored; the file looks like a normal
CSV right up until a human actually reads it. Restore the real
`EscapeCsvField` calls afterward.

### Exercises

- In the `lab-csv` throwaway pattern, add a field containing an actual
  newline character (`"Line one\nLine two"`) and confirm, with real
  output, that `EscapeCsvField` correctly wraps it in quotes (a raw,
  unescaped newline inside an unquoted CSV field would be read as the
  start of a new row entirely).
- Predict, in your own words, what `EscapeCsvField("plain text")` (no
  comma, quote, or newline at all) returns — then confirm it's returned
  completely unchanged, not wrapped in quotes it doesn't need.
- Export a real inventory containing at least one item with a comma in
  its name, a note containing a double quote, and a plain item with
  neither — open the resulting file in a plain text editor and manually
  verify every row matches this lesson's escaping rule exactly.

### Definition of Done

- [ ] Export CSV opens a real `SaveFileDialog` and writes a real `.csv`
      file via `StreamWriter`.
- [ ] Every text field is passed through `EscapeCsvField` before being
      written.
- [ ] An item whose name contains a comma exports correctly, verified by
      opening the file in Excel or a text editor.
- [ ] `Value` is written using `InvariantCulture` formatting, matching
      this project's established storage-format convention.
- [ ] You reproduced the broken, unescaped export on purpose, confirmed
      real column-shifting in Excel, and restored the real
      `EscapeCsvField` calls.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add CSV export with real RFC-4180-style escaping — Epic 9 begins"`.
