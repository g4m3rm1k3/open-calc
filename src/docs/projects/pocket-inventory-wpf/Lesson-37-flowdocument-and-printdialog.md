# Lesson 37: The Same Data, a Completely Different Output

*(`FlowDocument`, `PrintDialog`, `DocumentPaginator`)*

**User Story**
> As a user, I want to print my inventory.

**What you will build**
A real printed page — or a real print preview — built from the exact
same `Items` this project has read, filtered, and displayed since
Lesson 6. Nothing about `Items` changes for this lesson; a `FlowDocument`
is a second, independent *presentation* of data this project already
has, the same "one data source, many presentations" idea `ICollectionView`
(Lesson 17) and the CSV/JSON exports (Lessons 34, 36) have each
represented in their own way — this time, the destination is paper, not
a screen or a file.

**What you need to know first:** Lesson 16: building UI structure in
code (`DataGridTextColumn`s, constructed in C#). Lesson 34/36:
reading `Items` to build a second, independent representation of the
same data.

**Terms introduced in this lesson:**
- **`FlowDocument`** — a WPF document type describing content by its
  logical structure (paragraphs, tables) rather than fixed pixel
  positions, letting WPF handle line-wrapping and page breaks
  automatically.
- **`PrintDialog`** — the real, modal Windows print dialog; choosing a
  printer and confirming triggers actual printing.
- **`DocumentPaginator`** — the object responsible for splitting a
  `FlowDocument`'s content into real, discrete pages.

**Objects and methods used**
- No supporting cast beyond this lesson's own subject —
  `FlowDocument`, `PrintDialog`, and `DocumentPaginator` are given full
  treatment in the Concept Units below.

---

## Concept Unit: Building and Really Printing a `FlowDocument`

### The Problem

Nothing in this project can currently produce a printed page. A
`FlowDocument`, built entirely in C# from real `Items`, needs to exist
and be provably real — not just constructed in memory, but actually
sent through WPF's real printing pipeline.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-flowdoc
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel Loaded="StackPanel_Loaded" />
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.IO;
using System.Windows;
using System.Windows.Documents;
using System.Windows.Media;
using System.Windows.Xps;
using System.Windows.Xps.Packaging;

namespace lab_flowdoc
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            (string Name, string Category, decimal Value)[] items =
            {
                ("Hex Bolts", "Tools", 49.99m),
                ("USB Cable", "Electronics", 12.50m),
                ("Shop Rags", "Consumables", 5.00m),
            };

            FlowDocument document = new FlowDocument
            {
                PagePadding = new Thickness(40),
                ColumnWidth = double.PositiveInfinity
            };

            document.Blocks.Add(new Paragraph(new Run("Pocket Inventory")) { FontSize = 20, FontWeight = FontWeights.Bold });

            Table table = new Table();
            table.Columns.Add(new TableColumn());
            table.Columns.Add(new TableColumn());
            table.Columns.Add(new TableColumn());
            TableRowGroup rowGroup = new TableRowGroup();
            table.RowGroups.Add(rowGroup);

            foreach (var item in items)
            {
                TableRow row = new TableRow();
                row.Cells.Add(new TableCell(new Paragraph(new Run(item.Name))));
                row.Cells.Add(new TableCell(new Paragraph(new Run(item.Category))));
                row.Cells.Add(new TableCell(new Paragraph(new Run(item.Value.ToString("C")))));
                rowGroup.Rows.Add(row);
            }
            document.Blocks.Add(table);

            Console.WriteLine($"FlowDocument built: {document.Blocks.Count} top-level blocks");
            Console.WriteLine($"Table has {rowGroup.Rows.Count} real rows");

            string path = Path.Combine(Path.GetTempPath(), "lab-flowdoc-output.xps");
            if (File.Exists(path)) File.Delete(path);

            IDocumentPaginatorSource paginatorSource = document;
            using (XpsDocument xpsDocument = new XpsDocument(path, FileAccess.Write))
            {
                XpsDocumentWriter writer = XpsDocument.CreateXpsDocumentWriter(xpsDocument);
                writer.Write(paginatorSource.DocumentPaginator);
            }

            Console.WriteLine($"Real printed file exists: {File.Exists(path)}, size {new FileInfo(path).Length} bytes");
            Console.WriteLine($"DocumentPaginator reports {paginatorSource.DocumentPaginator.PageCount} page(s)");

            File.Delete(path);
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
FlowDocument built: 2 top-level blocks
Table has 3 real rows
Real printed file exists: True, size 63658 bytes
DocumentPaginator reports 1 page(s)
```

#### Execution Trace

1. `new Paragraph(new Run("Pocket Inventory"))` runs once, adding a
   real title block — `document.Blocks.Count` becomes `1` after this
   line alone.
2. `new Table()` and its three `new TableColumn()` calls build the
   table's structure — no rows yet, zero content.
3. The `foreach` visits `("Hex Bolts", "Tools", 49.99m)` first,
   constructing one real `TableRow` with three `TableCell`s and adding
   it to `rowGroup.Rows` — one real row now exists.
4. The loop visits `("USB Cable", "Electronics", 12.50m)` next, adding a
   second, independent row the same way.
5. The loop visits `("Shop Rags", "Consumables", 5.00m)` last, adding a
   third row, then stops — `rowGroup.Rows.Count` correctly reports `3`,
   matching the original array exactly.
6. `document.Blocks.Add(table)` runs once more, bringing
   `document.Blocks.Count` to `2` — the title paragraph and the
   fully-built table, confirmed by the real printed output afterward.

*What this proves:* the `FlowDocument` genuinely contains a real
`Table` with three real rows, built entirely from a plain C# array —
nothing about `Table`/`TableRow`/`TableCell` came from XAML. Writing it
through `XpsDocument`/`XpsDocumentWriter` — the *exact* underlying
pipeline `PrintDialog.PrintDocument` uses internally, not a simulation
of it — produced a real, 63,658-byte file on disk. `DocumentPaginator`,
the object responsible for splitting content into pages, correctly
reports `1` page for this small table — real pagination, computed by
WPF, not something this project tracks by hand.

### Discard the Throwaway Example
Delete the `lab-flowdoc` folder. `FlowDocument`/`Table`/`DocumentPaginator`
are not discarded — the real print feature builds exactly this from
`Items` next.

### Mechanical Walkthrough

- `new FlowDocument { PagePadding = ..., ColumnWidth = ... }` — **first
  appearance of `FlowDocument`.** Describes content by logical
  structure — paragraphs, tables — letting WPF compute line breaks and
  page breaks itself; `ColumnWidth = double.PositiveInfinity` (a plain
  property, not a term of its own) disables `FlowDocument`'s default
  newspaper-style multi-column layout, more appropriate for a simple
  inventory listing than magazine-style columns.
- `Table`/`TableRowGroup`/`TableRow`/`TableCell` — **first appearance.**
  A real, structured table inside a `FlowDocument` — `Columns` declared
  once, rows added one at a time, each cell holding its own `Paragraph`.
- `IDocumentPaginatorSource paginatorSource = document;` — (first
  appearance) — `FlowDocument` implements this interface directly;
  `.DocumentPaginator` is the real object both this lab and
  `PrintDialog` itself ultimately use to turn content into pages.
- `XpsDocument`/`XpsDocumentWriter` — (first appearance) — the real,
  underlying document-writing machinery; used here directly, bypassing
  `PrintDialog`'s own modal picker, specifically to make this proof
  runnable without a real interactive print dialog to click through.

### CS Lens

A `FlowDocument` is **declarative content**, the identical underlying
idea XAML itself represents (Lesson 1) — describe *what* the content
is, structurally, and let WPF figure out *how* to lay it out, page by
page, at whatever size the eventual output actually needs. This is
directly different from a fixed-pixel-position document (a `Canvas`
laid out for one specific paper size) the same way this project's own
responsive `Grid` layouts (Lesson 2) differ from hardcoded pixel
coordinates.

### SE Lens

Why build the `Table` in C# instead of writing it directly in XAML,
the way most of this project's own UI has been built since Lesson 1?
Because the table's actual *content* — which items, how many rows —
depends entirely on `Items` at the moment printing happens; XAML can
describe fixed structure, but it can't loop over a live collection the
way a real `foreach` can. This is the same reason `DataGridTextColumn`s
were declared in XAML (Lesson 16) while their *rows* come from a live
binding — structure in XAML, dynamic content from real code.

### Connection

The real Print command, building this exact structure from `Items` and
showing a real `PrintDialog`, is wired next.

---

## Concept Unit: A Real Print Command

### The Problem

`FlowDocument`/`Table` construction is proven in isolation; nothing
connects it to this project's real `Items`, or to an actual,
interactive `PrintDialog` a user can act on.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `FlowDocument`/`Table`, previous unit.

### The New Code — the Button

```xml
<Button Content="Print"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Click="PrintButton_Click" />
```

### The New Code — Printing

```csharp
private void PrintButton_Click(object sender, RoutedEventArgs e)
{
    InventoryViewModel viewModel = (InventoryViewModel)DataContext;

    FlowDocument document = new FlowDocument
    {
        PagePadding = new Thickness(40),
        ColumnWidth = double.PositiveInfinity
    };

    document.Blocks.Add(new Paragraph(new Run("Pocket Inventory"))
    {
        FontSize = 20,
        FontWeight = FontWeights.Bold
    });

    Table table = new Table();
    table.Columns.Add(new TableColumn());
    table.Columns.Add(new TableColumn());
    table.Columns.Add(new TableColumn());
    TableRowGroup rowGroup = new TableRowGroup();
    table.RowGroups.Add(rowGroup);

    foreach (InventoryItem item in viewModel.Items)
    {
        if (item.IsArchived)
        {
            continue;
        }

        TableRow row = new TableRow();
        row.Cells.Add(new TableCell(new Paragraph(new Run(item.Name))));
        row.Cells.Add(new TableCell(new Paragraph(new Run(item.Category.ToString()))));
        row.Cells.Add(new TableCell(new Paragraph(new Run(item.Value.ToString("C")))));
        rowGroup.Rows.Add(row);
    }
    document.Blocks.Add(table);

    PrintDialog printDialog = new PrintDialog();
    if (printDialog.ShowDialog() == true)
    {
        IDocumentPaginatorSource paginatorSource = document;
        printDialog.PrintDocument(paginatorSource.DocumentPaginator, "Pocket Inventory");
    }
}
```

### Mechanical Walkthrough

- `if (item.IsArchived) { continue; }` — reappearing (`continue`,
  assumed known from this project's stated floor) — the printed report
  excludes archived items, the same "current inventory only" rule
  `TotalValue` and `CategoryTotals` (Lessons 30, 31) already apply.
- `PrintDialog printDialog = new PrintDialog();` — **first appearance
  of `PrintDialog`.** A real, modal Windows dialog — `ShowDialog()`
  returns `bool?`, the same nullable pattern `OpenFileDialog`/
  `SaveFileDialog` (Lessons 25, 34) already established.
- `printDialog.PrintDocument(paginatorSource.DocumentPaginator, "Pocket Inventory")`
  — (first appearance) — actually sends the document to the chosen
  printer; the string is the job's display name, shown in the printer's
  own queue.

### CS Lens

This entire unit is a direct demonstration of the roadmap's own SE
principle: **reusing the existing model to drive a completely different
output.** `Items` — the same collection `ItemsGrid`, `TotalValue`,
`CategoryTotals`, CSV export, and JSON export have all already read —
is read one more time here, for a genuinely different destination
(paper), with zero changes to `InventoryItem`, `InventoryViewModel`'s
persistence methods, or the database. Nothing about this project needed
a special "printable" copy of anything.

### SE Lens

Why build a fresh `FlowDocument` from scratch inside `PrintButton_Click`
rather than somehow reusing `ItemsGrid`'s own visual tree directly for
printing? Because a `DataGrid`'s on-screen visual tree is built for
interactive display — scrollbars, selection highlighting, fixed pixel
sizing tied to the current window — none of which belongs on a printed
page. A `FlowDocument`, built specifically for print/reflow, is the
right tool for genuinely different output, the same reasoning already
behind keeping `ItemExport`/`CategoryTotal` as separate shapes (Lessons
31, 36) rather than reusing `InventoryItem` or `ItemsGrid` directly for
every purpose they're superficially similar to.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: click Print — a real `PrintDialog` appears.
Choose "Microsoft Print to PDF" (or any real printer) and confirm — a
real document prints, listing every non-archived item, its category,
and its value, correctly paginated if the list is long enough to need
more than one page.

### Connection

Epic 9 is complete: export, import, and print all reuse the same
underlying `Items`, each shaped for its own real destination. Epic 10
turns to genuine desktop polish — settings that persist across restarts,
starting with where they actually live on a real Windows machine.

---

## Closing

### Connect the Pieces

Clicking Print builds a real `FlowDocument`/`Table` from
`viewModel.Items` — the exact structure proven, with real output, in
this lesson's own lab — skipping archived items the same way every
other summary view already does. A real `PrintDialog.ShowDialog()`
lets the user choose a printer; confirming calls `PrintDocument`,
handing WPF's real `DocumentPaginator` (the identical object this
lesson's lab wrote directly to an `.xps` file) to the chosen printer.

### What Breaks Without This

Temporarily remove the `if (item.IsArchived) { continue; }` check and
reprint after archiving at least one item. Real, representative result:
the printed report includes the archived item anyway — every other
summary in this project (the dashboard, the totals, the category
breakdown) correctly excludes it, but the printed report silently
doesn't, a real, easy-to-miss inconsistency between two views of what
should be the identical "current inventory" concept. Restore the real
`continue` check afterward.

### Exercises

- In the `lab-flowdoc` throwaway pattern, add enough rows (30 or more)
  to force the real `DocumentPaginator` to report more than one page —
  confirm with real output.
- Predict, in your own words, what `printDialog.ShowDialog()` returns
  if a user opens the dialog and clicks Cancel — then confirm against
  `Microsoft.Win32`'s established `bool?` pattern already proven for
  `OpenFileDialog`/`SaveFileDialog`.
- Add a page header showing the current date (`DateTime.Now`) to the
  `FlowDocument`, using a second `Paragraph` before the table — confirm
  it appears on a real printed/exported page.

### Definition of Done

- [ ] Print builds a real `FlowDocument`/`Table` from `viewModel.Items`,
      excluding archived items.
- [ ] A real, modal `PrintDialog` appears; confirming it sends the
      document to a real printer.
- [ ] `Items`, `InventoryViewModel`, and the database were not modified
      at all to support printing.
- [ ] You reproduced the archived-items-still-printed inconsistency on
      purpose, confirmed it, and restored the real `continue` check.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add printing via FlowDocument/PrintDialog, reusing Items unmodified — Epic 9 complete"`.
