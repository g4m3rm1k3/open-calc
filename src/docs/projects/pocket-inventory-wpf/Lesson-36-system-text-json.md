# Lesson 36: A Tree, Not a Table

*(`System.Text.Json`, `JsonSerializer.Serialize`/`Deserialize`)*

**User Story**
> As a user, I want to export and import my inventory as JSON, including
> full supplier information CSV can't represent per row without
> repeating it.

**What you will build**
A real `.json` export that round-trips perfectly, including a genuinely
*nested* `Supplier` object per item — not just a `SupplierId` number the
way CSV (Lesson 34) was limited to. The transferable problem underneath
this lesson: CSV is fundamentally flat, one row, one fixed set of
columns; JSON can represent real hierarchy — an object containing
another object — something this project's own relational data (`Items`
related to `Suppliers`, Lesson 24) genuinely has and CSV genuinely
can't express without either repeating supplier data on every row or
leaving it out entirely.

**What you need to know first:** Lesson 24: `Supplier`, the
`Items`/`Suppliers` relationship. Lesson 34: CSV's flat, one-row-per-item
shape, the direct contrast this lesson draws against.

**Terms introduced in this lesson:**
- **`System.Text.Json`** — .NET's built-in JSON library;
  `JsonSerializer.Serialize`/`Deserialize` convert between real C#
  objects and JSON text automatically, using reflection over public
  properties.
- **`[JsonIgnore]`** — an attribute excluding a specific property from
  serialization entirely.
- **Tree-shaped vs. flat data** — JSON naturally represents nested
  structure (an object containing another object, arbitrarily deep);
  CSV represents only a flat table, one fixed row shape, no nesting at
  all.

---

## Concept Unit: `JsonSerializer` — Nesting, Attributes, and Real Round-Trips

### The Problem

Exporting an item's full supplier information — not just a bare
`SupplierId` — as CSV would mean either repeating the supplier's name on
every single row that uses it, or leaving supplier data out of the
export entirely. Neither is a real nested representation of the actual
relationship this project's data has.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-json
cd lab-json
```

Replace `Program.cs`:

```csharp
using System.Text.Json;
using System.Text.Json.Serialization;

ItemExport export = new ItemExport
{
    Name = "Hex Bolts",
    Category = Category.Tools,
    Value = 49.99m,
    PurchaseDate = new DateTime(2026, 3, 15),
    Supplier = new SupplierExport { Name = "Acme Tools" }
};

ItemExport noDate = new ItemExport
{
    Name = "Old Item",
    Category = Category.Consumables,
    Value = 5.00m,
    PurchaseDate = null,
    Supplier = null
};

var options = new JsonSerializerOptions
{
    WriteIndented = true,
    Converters = { new JsonStringEnumConverter() }
};

string json1 = JsonSerializer.Serialize(export, options);
Console.WriteLine(json1);
string json2 = JsonSerializer.Serialize(noDate, options);
Console.WriteLine(json2);

ItemExport? back = JsonSerializer.Deserialize<ItemExport>(json1, options);
Console.WriteLine($"Round-trip: {back?.Name}, {back?.Category}, {back?.Value}, {back?.PurchaseDate}, {back?.Supplier?.Name}");

enum Category { Tools, Hardware, Electronics, Consumables, Safety }

class ItemExport
{
    public string Name { get; set; } = string.Empty;
    public Category Category { get; set; }
    public decimal Value { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public SupplierExport? Supplier { get; set; }
}

class SupplierExport
{
    public string Name { get; set; } = string.Empty;
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
{
  "Name": "Hex Bolts",
  "Category": "Tools",
  "Value": 49.99,
  "PurchaseDate": "2026-03-15T00:00:00",
  "Supplier": {
    "Name": "Acme Tools"
  }
}
{
  "Name": "Old Item",
  "Category": "Consumables",
  "Value": 5.00,
  "PurchaseDate": null,
  "Supplier": null
}
Round-trip: Hex Bolts, Tools, 49.99, 3/15/2026 12:00:00 AM, Acme Tools
```

*What this proves:* `Supplier` appears in the JSON as a real, nested
object — `"Supplier": { "Name": "Acme Tools" }` — not a flat column;
CSV has no way to represent this at all without a separate file or
repeated data. `decimal` serializes as a genuine JSON number
(`49.99`), exact, with no floating-point artifact — a real, different
outcome from Lesson 30's `SUM()` finding, because `System.Text.Json`
converts a C# `decimal` directly, never routing it through `double` the
way SQLite's own `SUM()` does internally. `DateTime?` serializes to a
real ISO-8601 string when present, and literal JSON `null` when absent —
`PurchaseDate` on `noDate` prints exactly `null`, not a missing field or
a placeholder date. `JsonStringEnumConverter` makes `Category` serialize
as `"Tools"`, a readable name, instead of the underlying `0` — the exact
"store the name, not the number" reasoning Lesson 12 already established
for SQLite, chosen again here for the identical reason: reordering the
`enum`'s members later would silently corrupt a number-based export,
but never a name-based one.

### Discard the Throwaway Example
Delete the `lab-json` folder. `JsonSerializer`/`JsonStringEnumConverter`
are not discarded — the real export DTOs use exactly this next.

### Mechanical Walkthrough

- `JsonSerializer.Serialize(export, options)` — **first appearance of
  `System.Text.Json`.** Uses reflection over `ItemExport`'s public
  properties to build JSON automatically — no manual string-building the
  way CSV's `EscapeCsvField` required.
- `Supplier` being a real, separate `SupplierExport` object — **first
  appearance of nested serialization.** `JsonSerializer` recurses into
  any reference-typed property automatically, the same way it handled
  `ItemExport`'s own top-level properties.
- `new JsonStringEnumConverter()` — (first appearance) — without it,
  `Category` would serialize as its underlying `int` (`0` for `Tools`);
  registering this converter changes that for every `enum` the
  serializer encounters.
- `JsonSerializer.Deserialize<ItemExport>(json1, options)` — the
  reverse operation, reconstructing a real `ItemExport` (with its real,
  nested `SupplierExport`) from JSON text — the same `options`
  (including the enum converter) must be passed to both directions, or
  a name-based enum string would fail to parse back correctly.

### CS Lens

This is **tree-shaped vs. flat data**, named directly: `ItemExport`'s
own shape — an object with a property that's itself another object — is
a small tree, two levels deep. CSV (Lesson 34) can only ever represent a
flat table: one row, one fixed set of scalar columns, no nesting
possible at all without inventing an ad-hoc convention (a second file, a
delimiter-within-a-delimiter) that JSON already solves natively.

### SE Lens

Given JSON can represent this project's real relational structure and
CSV can't, why does this project keep CSV export at all, instead of
JSON being the only format? Because they serve genuinely different real
needs: CSV opens directly in Excel, sortable and filterable by anyone
who's never heard of JSON — the right choice when a spreadsheet is
literally what's wanted. JSON is the right choice when the data's real
structure — nesting, in this case — matters more than spreadsheet
compatibility, or when the file is meant to be read back into *this*
project (or another program) rather than a human skimming rows in
Excel. Neither format is simply better; this project offers both because
the two real use cases are genuinely different.

### Connection

The real Export/Import JSON commands, using exactly this nested shape,
are built next.

---

## Concept Unit: Wiring Real JSON Export and Import

### The Problem

`ItemExport`/`SupplierExport` exist only in a throwaway lab; nothing
connects them to this project's real `Items` and `Suppliers`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New `ItemExport.cs`, `InventoryPage.xaml`,
  `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** Every piece from this lesson's first unit;
  `SaveFileDialog`/`OpenFileDialog`, Lessons 25/34.

### The New Code — `ItemExport.cs`

```csharp
using System.Text.Json.Serialization;

namespace PocketInventory
{
    public class ItemExport
    {
        public string Name { get; set; } = string.Empty;
        public Category Category { get; set; }
        public string Location { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public bool IsFavorite { get; set; }
        public string? PhotoPath { get; set; }
        public SupplierExport? Supplier { get; set; }
    }

    public class SupplierExport
    {
        public string Name { get; set; } = string.Empty;
    }
}
```

### The New Code — Export

```csharp
public RelayCommand ExportJsonCommand { get; }

// In the constructor:
ExportJsonCommand = new RelayCommand(
    execute: _ => ExportJson(),
    canExecute: _ => Items.Count > 0);

private void ExportJson()
{
    Microsoft.Win32.SaveFileDialog dialog = new Microsoft.Win32.SaveFileDialog
    {
        Filter = "JSON files (*.json)|*.json",
        FileName = "inventory.json"
    };

    if (dialog.ShowDialog() != true)
    {
        return;
    }

    List<ItemExport> exports = new List<ItemExport>();
    foreach (InventoryItem item in Items)
    {
        exports.Add(new ItemExport
        {
            Name = item.Name,
            Category = item.Category,
            Location = item.Location,
            Value = item.Value,
            PurchaseDate = item.PurchaseDate,
            Notes = item.Notes,
            IsFavorite = item.IsFavorite,
            PhotoPath = string.IsNullOrEmpty(item.PhotoPath) ? null : item.PhotoPath,
            Supplier = new SupplierExport { Name = item.SupplierName }
        });
    }

    JsonSerializerOptions options = new JsonSerializerOptions
    {
        WriteIndented = true,
        Converters = { new JsonStringEnumConverter() }
    };

    string json = JsonSerializer.Serialize(exports, options);
    File.WriteAllText(dialog.FileName, json);
}
```

### Mechanical Walkthrough

- `foreach (InventoryItem item in Items) { exports.Add(new ItemExport { ... }); }`
  — reappearing (a plain loop building a new list, the same shape
  `LoadItemsFromDatabase` has used since Lesson 10) — projects each real
  `InventoryItem` into its own, separate `ItemExport` shape, one at a
  time, with no new vocabulary needed.
- `PhotoPath = string.IsNullOrEmpty(item.PhotoPath) ? null : item.PhotoPath`
  — reappearing (the conditional operator, familiar since Lesson 1a),
  turning this project's own "no photo" convention (an empty `string`,
  Lesson 25) into JSON's own, more natural "no photo" representation
  (`null`) — the two formats' different conventions for absence,
  translated deliberately rather than left to leak through unchanged.
- `Supplier = new SupplierExport { Name = item.SupplierName }` — uses
  `SupplierName` (populated by the `JOIN`, Lesson 24), not `SupplierId`
  — the export is meant to be human-readable JSON, and a bare `Id`
  number would be meaningless outside this project's own database.

### CS Lens

`ItemExport` is a second, deliberate example (after Lesson 31's
`CategoryTotal`) of a class that exists purely to shape data for one
specific purpose — here, external interchange — genuinely different
from `InventoryItem`'s own shape even though many property names match.
Keeping them as two separate classes, rather than serializing
`InventoryItem` directly, means this project's internal representation
(`SupplierId`, an `int`) and its external, human-facing representation
(a nested `Supplier` object with a real name) can each be exactly what
they need to be, independently.

### SE Lens

Why not just add `[JsonIgnore]` to `InventoryItem`'s own internal-only
properties (`Id`, `SupplierId`) and serialize `InventoryItem` directly,
skipping `ItemExport` entirely? Because `InventoryItem` would still be
missing the one thing this lesson's entire point requires — a real,
nested `Supplier` object; `SupplierId` alone, even hidden from the
casual reader by `[JsonIgnore]`, still isn't a name-plus-structure the
way a genuine export needs. A dedicated export shape, built deliberately
for this one purpose, is simpler and more honest than trying to make one
class serve two genuinely different roles by selectively hiding pieces
of it.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: export to JSON, then open the file in a text
editor. Each item's `Supplier` appears as a real, nested object with a
readable name — confirm this directly against the same item's row in a
CSV export (Lesson 34), where only a bare `SupplierId` number would ever
have been possible. `Category` reads as `"Tools"`, not `0`.
`PurchaseDate` reads as `null` for an item that never had one set, not a
placeholder string.

### Connection

Structured, nested export is real and correct. The next lesson turns
from data interchange to a different kind of output entirely: a real,
printed page.

---

## Closing

### Connect the Pieces

`ExportJson` projects every real `InventoryItem` into an `ItemExport` —
a deliberately separate shape, built specifically to carry a real,
nested `Supplier` object (using `SupplierName`, not the internal-only
`SupplierId`) the way CSV never could. `JsonSerializer.Serialize`, with
`JsonStringEnumConverter` registered, turns that list into real,
readable JSON — every choice (name-based enums, `null` for absent
values, nested objects) proven directly, with real output, in this
lesson's own first unit before ever touching the real project.

### What Breaks Without This

Temporarily remove `new JsonStringEnumConverter()` from `options` and
re-export. Real, representative result: the file still opens, still
parses as valid JSON, but every `Category` value now reads as a bare
integer (`0`, `1`, `2`, and so on) instead of a real name — meaningless
to anyone reading the exported file without also knowing `enum Category`'s
exact declaration order, and silently wrong forever the moment that
`enum`'s member order ever changes (the identical fragility Lesson 12
already proved for a hypothetical integer-based SQLite column, now real
in a shipped export file). Restore the real converter afterward.

### Exercises

- In the `lab-json` throwaway pattern, add a `List<string> Tags`
  property to `ItemExport` and confirm, with real output, that
  `JsonSerializer` serializes it as a real JSON array — a shape CSV has
  no native representation for at all.
- Predict, in your own words, what `JsonSerializer.Deserialize<ItemExport>(...)`
  does with a JSON file that's missing a property entirely (for example,
  no `"Notes"` key at all) — does it throw, or does `Notes` just keep
  its default value? Confirm by hand-editing an exported file to remove
  one property before importing it.
- Write a real `ImportJsonCommand`, mirroring `ImportCsvCommand`'s
  per-row error isolation (Lesson 35) — one item's import failing
  (malformed JSON for a single array entry, if you construct one by
  hand) shouldn't stop every other valid item in the same file from
  importing successfully.

### Definition of Done

- [ ] `ItemExport`/`SupplierExport` exist as dedicated, separate export
      shapes — not `InventoryItem` serialized directly.
- [ ] Export produces real, nested JSON — a `Supplier` object per item,
      not a bare ID.
- [ ] `Category` serializes by name, not by number.
- [ ] An item's absent `PhotoPath`/`PurchaseDate` serializes as JSON
      `null`, not an empty string or placeholder.
- [ ] You reproduced the number-based-enum regression on purpose
      (removing `JsonStringEnumConverter`), confirmed it, and restored
      the real converter.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add nested JSON export via System.Text.Json, distinct from CSV's flat shape"`.
