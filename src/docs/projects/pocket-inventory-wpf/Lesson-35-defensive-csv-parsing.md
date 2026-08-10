# Lesson 35: An Imported File Is Not This Project's Own Handwriting

*(Splitting respecting quotes, per-row `try`/`catch`)*

**User Story**
> As a user, I want to import inventory from a CSV file — including one
> I've hand-edited — and be told exactly which rows failed, instead of
> the import crashing or silently corrupting my data.

**What you will build**
Real CSV import, defended the way Lesson 11 first defended the Add
form: never trust the input, because this time the input isn't typed
through this project's own careful, validated form at all — it's a
plain text file, possibly hand-edited, possibly wrong in ways this
project's own export (Lesson 34) would never actually produce.

**What you need to know first:** Lesson 34: CSV escaping,
`EscapeCsvField`. Lesson 11: "never trust input, even your own UI's" —
now applied to a file instead of a `TextBox`.

**Terms introduced in this lesson:**
- **Tokenizing** — breaking a line of text into its meaningful pieces
  (here, CSV fields) according to real rules, rather than a naive
  `Split` that ignores context (like whether a comma is inside quotes).
- **Per-row error isolation** — one malformed row failing doesn't stop
  the rest of the file from importing; each row succeeds or fails
  independently.

**Objects and methods used**
- CSV escaping rules (Lesson 34) reappear here, already given full
  treatment — brief reminder only, per the Repetition Rule. The
  quote-aware parser itself is this lesson's own subject, given full
  treatment below.

---

## Concept Unit: Parsing a CSV Line for Real

### The Problem

`line.Split(',')` — the obvious first approach — breaks the moment a
field itself contains a comma, exactly the case Lesson 34's own export
deliberately quotes and escapes. Reading that same file back needs the
inverse: a parser that understands quotes, not just commas.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-csvparse
cd lab-csvparse
```

Replace `Program.cs`:

```csharp
List<string> ParseCsvLine(string line)
{
    List<string> fields = new List<string>();
    bool inQuotes = false;
    System.Text.StringBuilder current = new System.Text.StringBuilder();

    for (int i = 0; i < line.Length; i++)
    {
        char c = line[i];
        if (inQuotes)
        {
            if (c == '"' && i + 1 < line.Length && line[i + 1] == '"')
            {
                current.Append('"');
                i++;
            }
            else if (c == '"')
            {
                inQuotes = false;
            }
            else
            {
                current.Append(c);
            }
        }
        else
        {
            if (c == '"')
            {
                inQuotes = true;
            }
            else if (c == ',')
            {
                fields.Add(current.ToString());
                current.Clear();
            }
            else
            {
                current.Append(c);
            }
        }
    }
    fields.Add(current.ToString());
    return fields;
}

string escapedRow = "\"Hex Bolts, 1/4in\",Tools,49.99,\"Says \"\"fragile\"\" on the box\"";

Console.WriteLine("Naive Split(','):");
foreach (string field in escapedRow.Split(','))
{
    Console.WriteLine($"  [{field}]");
}

Console.WriteLine("Real quote-aware parse:");
foreach (string field in ParseCsvLine(escapedRow))
{
    Console.WriteLine($"  [{field}]");
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Naive Split(','):
  ["Hex Bolts]
  [ 1/4in"]
  [Tools]
  [49.99]
  ["Says ""fragile"" on the box"]
Real quote-aware parse:
  [Hex Bolts, 1/4in]
  [Tools]
  [49.99]
  [Says "fragile" on the box]
```

#### Execution Trace

1. `"Hex Bolts` prints first from the naive `Split(',')` — the comma
   inside the quoted name field is treated identically to any other
   comma, cutting the field in half right there.
2. `` 1/4in"`` prints next — the second half of the same original name,
   now a completely separate piece with no way to reunite it with the
   first.
3. `Tools` and `49.99` print third and fourth, shifted one position
   later than they should be relative to the original four-field
   intent.
4. `` "Says ""fragile"" on the box"`` prints last, still carrying its
   raw, un-interpreted quote characters — five pieces total from what
   was only ever four real fields.
5. `Hex Bolts, 1/4in` prints first from `ParseCsvLine`'s own `foreach` —
   the `inQuotes` flag correctly kept the embedded comma inside one
   field.
6. `Tools`, `49.99`, and `Says "fragile" on the box` print next, in
   order — four fields total, matching the original data exactly, the
   doubled `""` correctly collapsed to one real `"`.

*What this proves:* `Split(',')` on Lesson 34's own correctly-escaped
output produces *five* pieces from a row that only ever represented
four real fields — it has no idea a comma inside quotes doesn't count.
`ParseCsvLine`, tracking `inQuotes` as it walks the line character by
character, correctly produces exactly four fields — the comma inside
`"Hex Bolts, 1/4in"` stays part of that one field, and the doubled `""`
inside the notes field correctly becomes a single literal `"` — the
exact reverse of Lesson 34's `EscapeCsvField`, proven to round-trip
correctly on real, escaped data.

### Discard the Throwaway Example
Keep `lab-csvparse` — the next unit adds real, per-row error handling
to it.

### Mechanical Walkthrough

- `bool inQuotes` — **first appearance of tokenizing with state.**
  Tracks whether the parser is currently *inside* a quoted field — the
  one piece of context a plain `Split` has no way to maintain, since it
  looks at each comma in complete isolation.
- `c == '"' && i + 1 < line.Length && line[i + 1] == '"'` — (first
  appearance of one-character lookahead) — checking the *next*
  character before deciding what the current one means; the doubled-quote
  escape (Lesson 34) is only detectable by looking one character ahead
  of a `"` encountered while already inside quotes.
- `fields.Add(current.ToString()); current.Clear();` — reappearing
  (`StringBuilder`, general-purpose text-building), a field boundary
  only gets recorded on an *unquoted* comma — the entire reason `inQuotes`
  exists.

### CS Lens

This is **tokenizing** — breaking a stream of characters into
meaningful pieces according to real rules, rather than a naive split
that ignores context. The identical underlying task any real parser
performs (a programming language's own compiler tokenizes source code
the same conceptual way, character by character, tracking context like
"am I inside a string literal right now") — CSV parsing is a small, real,
approachable instance of a much more general idea.

### SE Lens

Why write this parser by hand instead of using a third-party CSV
library? For a project at this stage, writing it once, understanding
every rule directly, is worth more than a dependency — the same
"understand what you'd otherwise not see" reasoning that's driven raw
ADO.NET over an ORM since Lesson 9. A production system handling
genuinely complex CSV (embedded newlines inside quoted fields, multiple
encodings, enormous files) would reasonably reach for a well-tested
library instead — a real, honest tradeoff between learning value and
production robustness, not a claim that hand-written parsing is always
the right call.

### Connection

Real, per-row error handling — so one malformed line doesn't stop the
whole import — is added next.

---

## Concept Unit: Per-Row Error Isolation

### The Problem

A hand-edited CSV file might have a row with too few fields, or a
`Value` that isn't a valid number — real, plausible mistakes a person
editing a text file could make. One bad row shouldn't crash the entire
import or silently corrupt every row after it.

### Introduce the Concept in Isolation
Continuing in `lab-csvparse`, replace `Program.cs`:

```csharp
using System.Globalization;

List<string> ParseCsvLine(string line)
{
    List<string> fields = new List<string>();
    bool inQuotes = false;
    System.Text.StringBuilder current = new System.Text.StringBuilder();
    for (int i = 0; i < line.Length; i++)
    {
        char c = line[i];
        if (inQuotes)
        {
            if (c == '"' && i + 1 < line.Length && line[i + 1] == '"') { current.Append('"'); i++; }
            else if (c == '"') { inQuotes = false; }
            else { current.Append(c); }
        }
        else
        {
            if (c == '"') { inQuotes = true; }
            else if (c == ',') { fields.Add(current.ToString()); current.Clear(); }
            else { current.Append(c); }
        }
    }
    fields.Add(current.ToString());
    return fields;
}

string[] rows =
{
    "Hex Bolts,Tools,49.99",
    "Broken Row,Tools,NOT_A_NUMBER",
    "Missing Fields,Tools",
    "Good Item,Electronics,19.99",
};

int successCount = 0;
List<string> errors = new List<string>();

for (int rowNumber = 0; rowNumber < rows.Length; rowNumber++)
{
    try
    {
        List<string> fields = ParseCsvLine(rows[rowNumber]);
        string name = fields[0];
        string category = fields[1];
        decimal value = decimal.Parse(fields[2], CultureInfo.InvariantCulture);
        Console.WriteLine($"Row {rowNumber + 1}: imported '{name}' ({category}, {value:C})");
        successCount++;
    }
    catch (Exception ex)
    {
        errors.Add($"Row {rowNumber + 1}: {ex.GetType().Name} - {ex.Message}");
    }
}

Console.WriteLine($"\nImported {successCount} of {rows.Length} rows.");
Console.WriteLine("Errors:");
foreach (string error in errors)
{
    Console.WriteLine($"  {error}");
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Row 1: imported 'Hex Bolts' (Tools, $49.99)
Row 4: imported 'Good Item' (Electronics, $19.99)

Imported 2 of 4 rows.
Errors:
  Row 2: FormatException - The input string 'NOT_A_NUMBER' was not in a correct format.
  Row 3: ArgumentOutOfRangeException - Index was out of range. Must be non-negative and less than the size of the collection. (Parameter 'index')
```

#### Execution Trace

1. `Row 1` parses cleanly — three real fields, `decimal.Parse` succeeds
   — `successCount` becomes `1`, and the row prints immediately.
2. `Row 2` reaches `decimal.Parse("NOT_A_NUMBER", ...)`, which throws a
   real `FormatException` — caught immediately, recorded in `errors`,
   and the loop moves on without `successCount` changing.
3. `Row 3` reaches `fields[2]`, but `fields` only has two elements —
   indexing a nonexistent third one throws a real
   `ArgumentOutOfRangeException`, caught the same way, `successCount`
   still unchanged.
4. `Row 4` parses cleanly, exactly like row 1 — `successCount` becomes
   `2`, proving the two earlier failures never stopped the loop from
   reaching and correctly processing every row after them.

*What this proves:* row 2 (an unparseable `Value`) and row 3 (too few
fields, so `fields[2]` doesn't exist) both fail — with real, specific,
different exception types — while row 1 and row 4, both genuinely
valid, import successfully regardless of the two failures between and
around them. The loop never stops; each row's `try`/`catch` is
completely independent of every other row's outcome. `successCount`
correctly reports `2`, matching exactly which rows actually succeeded.

### Discard the Throwaway Example
Delete the `lab-csvparse` folder. `ParseCsvLine` and the per-row
`try`/`catch` pattern are not discarded — the real Import command uses
exactly this next.

### Mechanical Walkthrough

- `for (int rowNumber = 0; rowNumber < rows.Length; rowNumber++)` —
  reappearing (indexed `for`, assumed known from this project's stated
  floor), needed here specifically to report *which* row number failed
  — a plain `foreach` would lose that information.
- `try { ... } catch (Exception ex) { errors.Add(...); }` inside the
  loop — **first appearance of per-row error isolation** in this
  project. The `try`/`catch` wraps only one row's work; an exception
  thrown there is caught immediately, recorded, and the loop's very next
  iteration begins completely unaffected.
- `fields[2]` throwing `ArgumentOutOfRangeException` for row 3 — a real,
  natural consequence of `fields` only having two elements when the code
  assumes three; caught by the same generic `catch (Exception ex)` as
  row 2's `FormatException`, without needing to anticipate every
  specific way a row could be malformed in advance.

### CS Lens

This is the **boundary-validation principle** Lesson 11 first named,
reapplied to a fundamentally less trustworthy boundary: Lesson 11's
`TextBox` input came through this project's own `IDataErrorInfo`-checked
form, one character at a time, live; a CSV file arrives as a finished,
possibly hand-edited document this project had no chance to guide or
correct as it was written. The general principle — never trust data
crossing into this project from outside it — is identical; the specific
defenses (`IDataErrorInfo` versus per-row `try`/`catch`) differ because
the two boundaries are genuinely different shapes.

### SE Lens

Why catch the broad `Exception` type here, rather than specifically
`FormatException` and `ArgumentOutOfRangeException` (the two this
lesson's own lab actually observed)? Because a hand-edited file could
fail in ways not yet anticipated — a category name that doesn't match
any real `Category` member (`Enum.Parse` throwing a third exception
type), for instance. The goal is "this row failed, tell me why, keep
going" for *any* real failure, not an exhaustive, brittle list of every
specific exception type a bad row might theoretically produce.

### Connection

The real Import command, reading a real file and reporting real
per-row results to the user, is built next.

---

## Concept Unit: Wiring a Real Import Command

### The Problem

`ParseCsvLine` and per-row error isolation both exist independently;
nothing connects them to reading a real file or adding real items to
this project.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `ParseCsvLine`, first unit; per-row `try`/`catch`,
  second unit; `OpenFileDialog`, Lesson 25.

### The New Code — the Button

```xml
<Button Content="Import CSV"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Command="{Binding ImportCsvCommand}" />
```

### The New Code — the Import

```csharp
public RelayCommand ImportCsvCommand { get; }

// In the constructor:
ImportCsvCommand = new RelayCommand(
    execute: _ => ImportCsv(),
    canExecute: _ => true);

private void ImportCsv()
{
    Microsoft.Win32.OpenFileDialog dialog = new Microsoft.Win32.OpenFileDialog
    {
        Filter = "CSV files (*.csv)|*.csv"
    };

    if (dialog.ShowDialog() != true)
    {
        return;
    }

    string[] lines = File.ReadAllLines(dialog.FileName);
    int successCount = 0;
    List<string> errors = new List<string>();

    for (int rowNumber = 1; rowNumber < lines.Length; rowNumber++)
    {
        try
        {
            List<string> fields = ParseCsvLine(lines[rowNumber]);
            InventoryItem item = new InventoryItem
            {
                Name = fields[0],
                Category = Enum.Parse<Category>(fields[1]),
                Location = fields[2],
                Value = decimal.Parse(fields[3], CultureInfo.InvariantCulture)
            };
            Items.Add(item);
            SaveItemToDatabase(item);
            successCount++;
        }
        catch (Exception ex)
        {
            errors.Add($"Row {rowNumber + 1}: {ex.Message}");
        }
    }

    string summary = $"Imported {successCount} of {lines.Length - 1} rows.";
    if (errors.Count > 0)
    {
        summary += "\n\nErrors:\n" + string.Join("\n", errors);
    }
    MessageBox.Show(summary, "Import Complete", MessageBoxButton.OK, MessageBoxImage.Information);
}
```

### Mechanical Walkthrough

- `for (int rowNumber = 1; rowNumber < lines.Length; rowNumber++)` —
  reappearing (this lesson's second unit), starting at `1` instead of
  `0` specifically to skip the header row (`Name,Category,Location,Value,Notes`,
  Lesson 34) — real data starts on the second line of the file.
- `Items.Add(item); SaveItemToDatabase(item);` — reappearing exactly
  (Lesson 6/9's own add-and-persist pattern), run inside the `try`
  block, so a row that fails to parse never reaches the database at all
  — only successfully parsed rows are ever added.
- `MessageBox.Show(summary, ...)` — reappearing (Lesson 22), used here
  for a genuinely different purpose than a destructive-action
  confirmation: a real, honest report of what actually happened,
  including every row that failed and why.

### CS Lens

Every successful row commits immediately, independently — there's no
single, all-or-nothing transaction wrapping the whole import. A file
with 100 valid rows and 3 malformed ones ends with exactly 100 real
items added, not zero (an all-or-nothing import would have to discard
everything over three bad rows) and not 103 with three broken ones
smuggled in. This is a real, deliberate choice about what "the import
succeeded" should mean for this project.

### SE Lens

Why report every error at the end, in one summary dialog, rather than
stopping at the very first malformed row and asking the user to fix it
before continuing? Because a hand-edited file might have several
independent mistakes, and discovering them one at a time — fix one,
re-import, hit the next — would be a genuinely worse experience than
seeing every problem at once and fixing them all before the next
attempt. This is the same underlying reasoning behind showing every
`IDataErrorInfo` validation error at once, rather than one field at a
time (Lesson 11), applied here to a whole file instead of a whole form.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: export a real CSV (Lesson 34), then hand-edit
it in a text editor — break one row's `Value` field, delete a field
from another, leave the rest untouched. Import it back: a real summary
appears reporting exactly how many rows succeeded and listing every
failure with its row number and reason. Check `ItemsGrid`: every
successfully imported row is really there; the broken ones are not,
and the app never crashed.

### Connection

Epic 9's core round trip — export, then import back — is complete and
genuinely defensive. The next lesson adds a second export/import format,
`System.Text.Json`, for data CSV's flat, row-based shape can't represent
cleanly — nested supplier and photo data included.

---

## Closing

### Connect the Pieces

Clicking Import CSV opens a real `OpenFileDialog`; a confirmed file is
read with `File.ReadAllLines`, and every line past the header is parsed
with `ParseCsvLine` — the exact quote-aware tokenizer proven, with real
output, to correctly reverse Lesson 34's own escaping — inside a
per-row `try`/`catch`, the identical error-isolation pattern proven in
this lesson's second unit. Every row that parses cleanly becomes a real
`InventoryItem`, added to `Items` and persisted via the already-proven
`SaveItemToDatabase`; every row that doesn't is recorded, by number and
reason, in a summary `MessageBox` — real, honest reporting, not a
silent partial failure.

### What Breaks Without This

Temporarily remove the `try`/`catch` from `ImportCsv`'s loop entirely,
letting any exception propagate straight out of the method. Import a
file with one malformed row (for instance, a non-numeric `Value`) sitting
before several otherwise-valid rows. Real, representative failure: the
import throws on the first bad row and stops completely — every valid
row *after* it in the file is silently never even attempted, with no
indication to the user that anything after the crash point was ever
skipped. This is a real, serious regression from this lesson's own
design: a single mistake in a 100-row file would silently discard
however many good rows happened to follow it. Restore the real
`try`/`catch` afterward.

### Exercises

- In the `lab-csvparse` throwaway pattern, add a row with a `Category`
  value that doesn't match any real `enum Category` member (for
  example, `"Vehicles"`) and confirm, with real output, which specific
  exception type `Enum.Parse` throws for it, caught by the same generic
  `catch (Exception ex)`.
- Predict, in your own words, what happens if the imported file's
  header row itself is missing or different from what this project
  expects — does skipping row `0` (`rowNumber = 1`) still make sense in
  that case? Reason through it before testing.
- Extend `ImportCsv` to also parse `Notes` (the CSV's fifth column),
  applying `EscapeCsvField`'s reverse — the quote-aware parser already
  handles the unescaping; only the field-mapping code needs to grow.

### Definition of Done

- [ ] `ParseCsvLine` correctly reverses Lesson 34's own escaping,
      verified against a row containing a comma and an embedded quote.
- [ ] Import CSV opens a real file, skips the header row, and parses
      every remaining row independently.
- [ ] A malformed row is reported by number and reason, without
      stopping the rest of the import.
- [ ] Only successfully parsed rows are actually added to `Items` and
      the database.
- [ ] You reproduced the whole-import-crashes regression on purpose
      (removing the `try`/`catch`), confirmed valid rows after a bad one
      get silently skipped, and restored the real error isolation.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add defensive CSV import with per-row error isolation"`.
