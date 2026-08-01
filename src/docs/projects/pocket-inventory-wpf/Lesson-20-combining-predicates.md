# Lesson 20: Three Filters, One Predicate, No Branching Explosion

*(Combining predicates with `&&`)*

**User Story**
> As a user, I want to combine category, favorites-only, and name search
> all at once, narrowing the grid by everything I've set together.

**What you will build**
Lesson 19 built one filter — search by name. This lesson adds two more —
filter by `Category`, filter to favorites only — and combines all three
into `GroupedItems.Filter` at once, so a user can search *and* pick a
category *and* check favorites-only, all narrowing the same grid
together, not overriding each other.

**What you need to know first:** Lesson 19: `ICollectionView.Filter`,
`Predicate<T>`, closures over a method's local variables.

**Terms introduced in this lesson:**
- **Boolean composition** — combining several `true`/`false` conditions
  with `&&` (all must hold) or `||` (any must hold) into one larger
  condition, instead of writing separate, nested `if` branches for every
  combination.

---

## Concept Unit: Combining Conditions With `&&` Instead of Branching

### The Problem

Three independent filters — search text, category, favorites-only — each
either applies or doesn't. Writing separate code paths for every
*combination* of the three (search only; category only; search + category;
all three together; ...) would need up to eight distinct branches for
three toggles — and a ninth filter added later would double that again.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-combine
cd lab-combine
```

Replace `Program.cs`:

```csharp
List<(string Name, string Category, bool IsFavorite)> items = new()
{
    ("Hex Bolts", "Tools", true),
    ("Hammer", "Tools", false),
    ("USB Cable", "Electronics", true),
    ("Notebook", "Consumables", false)
};

bool Matches((string Name, string Category, bool IsFavorite) item, string searchText, string? categoryFilter, bool favoritesOnly)
{
    bool matchesSearch = item.Name.Contains(searchText, StringComparison.OrdinalIgnoreCase);
    bool matchesCategory = categoryFilter == null || item.Category == categoryFilter;
    bool matchesFavorite = !favoritesOnly || item.IsFavorite;
    return matchesSearch && matchesCategory && matchesFavorite;
}

void PrintMatches(string searchText, string? categoryFilter, bool favoritesOnly)
{
    foreach (var item in items)
    {
        if (Matches(item, searchText, categoryFilter, favoritesOnly))
        {
            Console.WriteLine($"  {item.Name}");
        }
    }
}

Console.WriteLine("Search '', category=null, favoritesOnly=false (everything):");
PrintMatches("", null, false);

Console.WriteLine("Search '', category='Tools', favoritesOnly=false:");
PrintMatches("", "Tools", false);

Console.WriteLine("Search '', category='Tools', favoritesOnly=true:");
PrintMatches("", "Tools", true);
```

Run it:

```bash
dotnet run
```

Real output:

```text
Search '', category=null, favoritesOnly=false (everything):
  Hex Bolts
  Hammer
  USB Cable
  Notebook
Search '', category='Tools', favoritesOnly=false:
  Hex Bolts
  Hammer
Search '', category='Tools', favoritesOnly=true:
  Hex Bolts
```

#### Execution Trace

`PrintMatches` is called three separate times, each time looping over
the same four-item `items` list with `foreach`, calling `Matches` with
a different combination of arguments and printing only the items where
it returns `true`:

1. `PrintMatches("", null, false)` — an empty search matches every
   `Name` (`Contains("")` is always `true`); `categoryFilter: null` and
   `favoritesOnly: false` both short-circuit their own `||` to `true`.
   All four items pass every condition; this call prints all four.
2. `PrintMatches("", "Tools", false)` — the search and favorites
   conditions still pass everything, but `matchesCategory` now actually
   compares `item.Category == "Tools"`. `Hex Bolts` and `Hammer` pass;
   `USB Cable` (Electronics) and `Notebook` (Consumables) fail this one
   condition and are excluded — this call prints two.
3. `PrintMatches("", "Tools", true)` — the same category restriction now
   combines with a real favorites check. `Hex Bolts` (`IsFavorite: true`)
   passes both; `Hammer` (`IsFavorite: false`) passes the category check
   but fails the favorites check, and `&&` means one failure is enough to
   exclude it. The third loop prints exactly one item.

*What this proves:* one `Matches` function, three independent
conditions, combined with `&&` — no branching, no separate function per
combination. Passing `categoryFilter: null, favoritesOnly: false` (both
"inactive") shows all four items — `matchesCategory` and `matchesFavorite`
both short-circuit to `true` via `categoryFilter == null ||` and
`!favoritesOnly ||`, contributing nothing to the `&&` chain when a filter
isn't actively narrowing anything. Turning on `category: "Tools"` alone
narrows to two; turning on `favoritesOnly: true` *as well*, on the exact
same call, narrows further to one — each additional active condition
narrows the result, composed automatically by `&&`, with the same three
lines of logic regardless of which combination of filters is currently
active.

### Discard the Throwaway Example
Delete the `lab-combine` folder. The `&&`-composition pattern itself is
not discarded — the real `GroupedItems.Filter` uses exactly this next.

### Mechanical Walkthrough

- `bool matchesCategory = categoryFilter == null || item.Category == categoryFilter;`
  — (first appearance of this "inactive filter passes everything"
  pattern) — when `categoryFilter` is `null` (no category chosen), the
  `||`'s left side is `true`, and C#'s `||` **short-circuits** — it never
  even evaluates `item.Category == categoryFilter` — meaning "no category
  filter" correctly behaves as "everything passes this condition."
- `bool matchesFavorite = !favoritesOnly || item.IsFavorite;` — the same
  pattern, inverted: when `favoritesOnly` is `false`, `!favoritesOnly` is
  `true`, short-circuiting `||` the same way.
- `return matchesSearch && matchesCategory && matchesFavorite;` — chains
  `&&` across three independent conditions for the first time in this
  project — an item passes only if every single one is `true` — the
  direct meaning of **Boolean composition** this unit's glossary entry
  names.

### CS Lens

This is the same **De Morgan's-style "inactive means always true"**
pattern used once already, informally — Lesson 1a's `TryGetValue`
ternary always had a fallback value; here, an "off" filter's fallback is
simply `true`, contributing nothing to an `&&` chain. Composing three
independent `bool`s with `&&` scales linearly — a fourth filter adds one
more `&&` clause, not a doubling of branches — the concrete mechanism
behind the SE Lens's "N filters, not 2^N branches" claim.

### SE Lens

Why not write this as nested `if` statements instead — `if (favoritesOnly) { if (item.IsFavorite) { ... } }`,
and so on? Because nesting scales *multiplicatively* with the number of
filters: three independent toggles nested this way produce up to eight
distinct code paths to reason about and test, and a fourth toggle would
double that to sixteen. Three flat `&&`-composed conditions stay three
conditions, however many are simultaneously active — this is the real,
concrete cost difference "composability" refers to, not just a stylistic
preference.

### Connection

`GroupedItems.Filter`, currently checking only `Name`, combines exactly
this way with `Category` and `IsFavorite` next.

---

## Concept Unit: Wiring Category and Favorites-Only Filters

### The Problem

`SearchBox_TextChanged` (Lesson 19) rebuilds `GroupedItems.Filter` from
scratch on every keystroke, checking only `Name` — adding a category
`ComboBox` or a favorites-only `CheckBox` needs their current state
combined into that same predicate, not a second, competing `Filter`
assignment that would silently discard the search text's own filter.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryPage.xaml.cs`.
- **Change type:** Add/Modify.
- **Dependencies:** `SearchBox_TextChanged`, Lesson 19;
  `CategoryValues`/`ComboBox`, Lesson 12.

### The New Code — the Filter Controls

```xml
<ComboBox x:Name="CategoryFilterBox"
          Width="140"
          Margin="12,0,0,0"
          ItemsSource="{Binding CategoryValues}"
          SelectionChanged="FilterControls_Changed" />
<CheckBox x:Name="FavoritesOnlyBox"
          Content="Favorites only"
          Margin="12,0,0,0"
          VerticalAlignment="Center"
          Checked="FilterControls_Changed"
          Unchecked="FilterControls_Changed" />
```

### The New Code — One Shared Filter Method

```csharp
private void FilterControls_Changed(object sender, RoutedEventArgs e)
{
    ApplyFilter();
}

private void SearchBox_TextChanged(object sender, TextChangedEventArgs e)
{
    ApplyFilter();
}

private void ApplyFilter()
{
    string searchText = SearchBox.Text;
    Category? categoryFilter = CategoryFilterBox.SelectedItem as Category?;
    bool favoritesOnly = FavoritesOnlyBox.IsChecked == true;

    GroupedItems.Filter = new Predicate<object>(entry =>
    {
        InventoryItem item = (InventoryItem)entry;
        bool matchesSearch = item.Name.Contains(searchText, StringComparison.OrdinalIgnoreCase);
        bool matchesCategory = categoryFilter == null || item.Category == categoryFilter;
        bool matchesFavorite = !favoritesOnly || item.IsFavorite;
        return matchesSearch && matchesCategory && matchesFavorite;
    });
}
```

### The Updated Project — the Add Row

```xml
<StackPanel Grid.Row="0" Orientation="Horizontal">
    <TextBox x:Name="NameInput"
             Width="240"
             Text="{Binding NewItemDraft.Name, ValidatesOnDataErrors=True, UpdateSourceTrigger=PropertyChanged}" />
    <ComboBox Width="140"
              Margin="12,0,0,0"
              ItemsSource="{Binding CategoryValues}"
              SelectedItem="{Binding NewItemDraft.Category}" />
    <TextBox Width="160"
             Margin="12,0,0,0"
             Text="{Binding NewItemDraft.Location, UpdateSourceTrigger=PropertyChanged}" />
    <TextBox Width="100"
             Margin="12,0,0,0"
             Text="{Binding NewItemDraft.Value, UpdateSourceTrigger=PropertyChanged}" />
    <DatePicker Width="130"
                Margin="12,0,0,0"
                SelectedDate="{Binding NewItemDraft.PurchaseDate}" />
    <Button Content="Add"
            Style="{StaticResource ToolbarButtonStyle}"
            Margin="12,0,0,0"
            Click="AddButton_Click" />
    <TextBox x:Name="SearchBox"                                                   <!-- ← changed (was unnamed) -->
             Width="200"
             Margin="12,0,0,0"
             TextChanged="SearchBox_TextChanged" />
    <ComboBox x:Name="CategoryFilterBox"                                          <!-- ← new -->
              Width="140"                                                          <!-- ← new -->
              Margin="12,0,0,0"                                                    <!-- ← new -->
              ItemsSource="{Binding CategoryValues}"                               <!-- ← new -->
              SelectionChanged="FilterControls_Changed" />                         <!-- ← new -->
    <CheckBox x:Name="FavoritesOnlyBox"                                            <!-- ← new -->
              Content="Favorites only"                                             <!-- ← new -->
              Margin="12,0,0,0"                                                    <!-- ← new -->
              VerticalAlignment="Center"                                           <!-- ← new -->
              Checked="FilterControls_Changed"                                     <!-- ← new -->
              Unchecked="FilterControls_Changed" />                                <!-- ← new -->
</StackPanel>
```

`SearchBox` needed a real `x:Name` for the first time — `ApplyFilter`
now reads its `Text` directly from a shared method, instead of the
`(TextBox)sender` cast Lesson 19's single-purpose handler used.

### Mechanical Walkthrough

- `CategoryFilterBox`'s `ItemsSource="{Binding CategoryValues}"` —
  reappearing exactly (Lesson 12's `CategoryValues` property), reused
  here for a *filter* control instead of the Add row's data-entry
  `ComboBox` — the same live, reflection-backed list of categories,
  serving two independent purposes with zero duplicated code.
- `CategoryFilterBox.SelectedItem as Category?` — (first appearance of
  `as` combined with a **nullable value type target**) — `SelectedItem`
  is `object` (Lesson 8 already established why); `as Category?` attempts
  the cast and produces `null` instead of throwing if nothing is
  selected, exactly the "no category filter active" state
  `matchesCategory`'s `categoryFilter == null ||` check (previous unit)
  expects.
- `FavoritesOnlyBox.IsChecked == true` — (first appearance of comparing
  a nullable `bool?` to `true` explicitly) — `CheckBox.IsChecked` is
  actually `bool?` (Lesson 15 mentioned its tri-state support, unused
  until now) — comparing to `true` explicitly treats both `false` and
  the rare indeterminate `null` state identically, as "not restricting to
  favorites," rather than letting a `null` accidentally propagate into
  the `bool favoritesOnly` this method needs.
- Three handlers (`SearchBox_TextChanged`, `FilterControls_Changed` ×2
  event names) all now call the same `ApplyFilter()` — **first
  appearance of multiple event handlers sharing one method body** — every
  filter control changing, regardless of which one, rebuilds the exact
  same combined predicate from all three controls' *current* state, not
  just whichever one just fired.

### CS Lens

`ApplyFilter()` reading all three controls' current values, every time,
regardless of which one triggered it, is what makes the combination
correct: if `SearchBox_TextChanged` only updated `matchesSearch` while
leaving a stale `matchesCategory` in place, checking the favorites box
while text was already typed would silently lose the search filter. One
shared method, reading fresh state every call, is the concrete
implementation of this lesson's first unit's proof: three independent
conditions, recombined completely, every time.

### SE Lens

Why give `FilterControls_Changed` one shared name for both the
`ComboBox`'s `SelectionChanged` and the `CheckBox`'s
`Checked`/`Unchecked`, rather than three separately named handlers that
each call `ApplyFilter()`? Because the three handlers would be
identical in every way except their name — pure duplication with zero
behavioral difference. One shared handler, wired to three different
events, says directly in the code what's actually true: these three
triggers all mean exactly one thing — "some filter changed, recompute."

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: type a search term, pick a category, and check
"Favorites only" — `ItemsGrid` narrows by all three at once. Clear any
one of the three; the other two stay in effect, narrowing by whatever's
still active. Set all three to their "off" state (empty search, no
category selected, favorites unchecked); every item reappears.

### Connection

Every filter in Epic 4's user stories — search, category, favorites — now
composes on one `ICollectionView`, alongside the grouping (Lesson 17) and
sorting (Lesson 18) already applied to the same `GroupedItems`. Epic 4 is
complete. Epic 5 turns to editing and deleting items for real, starting
with reusing this same Add form for updates, not just creation.

---

## Closing

### Connect the Pieces

A user interacts with any of three controls — typing in `SearchBox`,
picking a category in `CategoryFilterBox`, or toggling
`FavoritesOnlyBox` — and every one of them calls the same `ApplyFilter()`
(second unit), which reads all three controls' current state fresh and
builds one combined predicate using the exact `&&`-composition proven
with real, narrowing output in the first unit's isolated lab. That
predicate becomes `GroupedItems.Filter`, the same `ICollectionView`
property Lesson 19 already proved narrows a live view without touching
the underlying `Items` collection — now driven by three independent
conditions instead of one.

### What Breaks Without This

Temporarily give `SearchBox_TextChanged` its own separate body again
(Lesson 19's original version, setting `GroupedItems.Filter` directly
from only `searchText`, ignoring `CategoryFilterBox`/`FavoritesOnlyBox`
entirely) while leaving `FilterControls_Changed` calling the real
`ApplyFilter()`. Rerun: check "Favorites only," then type into the
search box. Real, representative failure: the moment you type a single
character, the favorites-only restriction silently disappears — typing
triggered the old, search-only handler, which overwrote
`GroupedItems.Filter` with a predicate that never checks `IsFavorite` at
all. This is exactly the "competing `Filter` assignment silently
discards the other" failure this unit's own Problem statement predicted.
Restore the shared `ApplyFilter()` call in `SearchBox_TextChanged`
afterward.

### Exercises

- In the `lab-combine` throwaway pattern, add a fourth independent
  condition (for example, `bool matchesInStock`) following the exact
  `&&`-composition pattern already used — confirm real output showing
  it narrows results correctly combined with the existing three.
- Predict, in your own words, what selecting "Tools" in
  `CategoryFilterBox` and then selecting it again (deselecting, if your
  `ComboBox` allows it) does to `ItemsGrid`, before testing it on the
  real, running app.
- Rewrite `ApplyFilter`'s three `bool` variables and final `return` as a
  single `return` expression, without intermediate variables — confirm
  the running app behaves identically, then decide, in your own words,
  which version you find easier to read and why.

### Definition of Done

- [ ] `CategoryFilterBox` (`ComboBox`) and `FavoritesOnlyBox`
      (`CheckBox`) both exist in the Add row, alongside the existing
      search box.
- [ ] All three filters combine correctly via `ApplyFilter()` — narrowing
      by any subset of the three, simultaneously, never overriding each
      other.
- [ ] Clearing all three filters restores every item.
- [ ] You reproduced the competing-handler regression (a separate
      search-only `Filter` assignment silently discarding the other
      filters), confirmed it, and restored the shared `ApplyFilter()`
      call.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Combine search, category, and favorites-only filters via && composition — Epic 4 complete"`.
