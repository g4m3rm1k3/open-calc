# Lesson 12: Core Controls Tour

**What you will build:** a small, real form using `TextBox`, `CheckBox`,
`RadioButton`, and `ComboBox`, proving one real, non-obvious behavior per
control rather than just listing what each one is.

**What you need to know first:** [Lesson 11](lesson-11-layout-panels.md).

**Terms introduced in this lesson:**
- **`TextBox`** — an editable single- or multi-line text field.
- **`CheckBox`** — an independent boolean toggle.
- **`RadioButton`** — one of a mutually exclusive group of toggles.
- **`ComboBox`** — a dropdown selection control.
- **Three-state `bool?`** — `CheckBox.IsChecked`'s real type, allowing an
  "indeterminate" third state beyond plain `true`/`false`.

**Objects and methods used:** `System.Windows.Controls.TextBox`,
`CheckBox`, `RadioButton`, `ComboBox` — four real WPF classes, each this
lesson's own subject.

---

## Concept Unit: `TextBox` — Editable Text

### The Problem

Every element in this series so far has displayed static text
(`TextBlock`). Real user input needs an editable field.

### Introduce the Concept in Isolation

```xml
<StackPanel>
    <TextBox x:Name="NameBox" Text="Type here" />
    <Button Content="Show Value" Click="ShowButton_Click" />
</StackPanel>
```

```csharp
private void ShowButton_Click(object sender, RoutedEventArgs e)
{
    MessageBox.Show(NameBox.Text);
}
```

*(`Click`/`RoutedEventArgs`/`MessageBox` are flagged, not yet fully
taught — full treatment in Lessons 13 and this series' upcoming Dialogs
lesson; used here only as the simplest way to observe a `TextBox`'s live
value, and worth returning to once those lessons give the surrounding
mechanism its own full explanation.)*

Typing over "Type here" and clicking the button shows exactly what was
typed — proof `TextBox.Text` reflects live user edits, read directly as
a plain `string` property (Lesson 02), the same property mechanism every
other control in this series already uses.

### Discard

This proof is disposable; real `TextBox` usage returns properly, with
data binding, in Lesson 14.

### Mechanical Walkthrough

- `<TextBox x:Name="NameBox" Text="Type here" />` — **(b) hard concept
  reappearing**, `x:Name` (Lesson 10) and attribute syntax (Lesson 09).
  `TextBox` itself — **(a) first appearance** as this unit's subject: an
  editable text field; `Text` is its real, plain `string` property,
  editable by the user at runtime, not just settable from XAML/code.
- `NameBox.Text` — **(b) hard concept reappearing**, ordinary property
  read via a generated `x:Name` field (Lesson 10).

## Concept Unit: `CheckBox` — an Independent, Three-State Toggle

### The Problem

A real form often needs several independent yes/no choices — "include
tax," "gift wrap" — each one true or false regardless of the others.

### Introduce the Concept in Isolation

```xml
<StackPanel>
    <CheckBox x:Name="TaxBox" Content="Include tax" IsChecked="True" />
    <CheckBox x:Name="GiftBox" Content="Gift wrap" />
</StackPanel>
```

Checking or unchecking either box has zero effect on the other — proof
each `CheckBox` is genuinely independent, unlike `RadioButton` (next
unit).

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `<CheckBox x:Name="TaxBox" Content="Include tax" IsChecked="True" />`
  — **(a) first appearance.** `IsChecked` — its real type is `bool?`
  (Lesson 03's nullable value types, applied here to a value type rather
  than a reference type — `bool?` follows the identical `?`-suffix
  mechanism), not plain `bool`: a third, `null` state is real and
  reachable via `IsThreeState="True"` (not exercised here), representing
  "indeterminate" — worth knowing before a `bool`-typed comparison
  against `IsChecked` fails to compile without first handling the
  nullable case.

## Concept Unit: `RadioButton` — Mutually Exclusive, Grouped by `GroupName`

### The Problem

Some choices are genuinely exclusive — pick exactly one shipping speed,
not several. `CheckBox`'s independence is the wrong tool; something that
enforces "only one of these can be checked" is needed.

### Introduce the Concept in Isolation

```xml
<StackPanel>
    <RadioButton GroupName="Shipping" Content="Standard" IsChecked="True" />
    <RadioButton GroupName="Shipping" Content="Express" />
</StackPanel>
<StackPanel>
    <RadioButton GroupName="Payment" Content="Card" IsChecked="True" />
    <RadioButton GroupName="Payment" Content="Cash" />
</StackPanel>
```

Checking "Express" automatically unchecks "Standard" — but checking
"Cash" has **no effect** on the Shipping group at all, even though all
four `RadioButton`s sit in the same window. This proves the real
grouping rule: exclusivity is scoped by `GroupName`, not by "every
`RadioButton` in the window" — two radio buttons sharing a `GroupName`
are mutually exclusive regardless of which panel each happens to sit in.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `GroupName="Shipping"` — **(a) first appearance.** Explicitly scopes
  exclusivity to only `RadioButton`s sharing this exact string, proven
  above by the two independent groups not interfering with each other.
- `IsChecked="True"` — **(b) hard concept reappearing**, same `bool?`
  property as `CheckBox`.

### SE Lens

The real, easy-to-miss gotcha, honestly worth stating: **omitting**
`GroupName` entirely doesn't mean "no grouping" — it means WPF falls
back to grouping by *shared immediate parent container* instead. Two
`RadioButton`s in the same `StackPanel` with no `GroupName` set are
still mutually exclusive, purely because they share a parent — which
looks identical to explicit `GroupName` grouping until a `RadioButton`
is later moved to a different container and silently stops being part
of the same group, a real, confusing bug if the grouping mechanism isn't
understood.

## Concept Unit: `ComboBox` — a Dropdown, `ItemsSource` and `DisplayMemberPath`

### The Problem

A fixed or long list of choices, shown only when the user actually opens
it rather than taking up permanent space, needs a different control than
either `CheckBox` or `RadioButton`.

### Introduce the Concept in Isolation

```xml
<ComboBox x:Name="ColorBox">
    <ComboBoxItem Content="Red" />
    <ComboBoxItem Content="Green" />
    <ComboBoxItem Content="Blue" />
</ComboBox>
```

This is real, working XAML — a dropdown offering three literal choices,
each hand-declared as a `ComboBoxItem`. It also does not scale: a
`ComboBox` backed by a real collection of data (a list of `Item` objects,
say) built this way would require one hand-written `ComboBoxItem` per
element, rebuilt by hand every time the underlying data changes.

```xml
<ComboBox ItemsSource="{Binding Colors}" DisplayMemberPath="Name" />
```

*(`{Binding}` is flagged, not yet fully taught — full treatment in
Lesson 14; shown here only to name the real, scalable alternative to
hand-declared `ComboBoxItem`s, which this series' Data Binding lesson
will make fully concrete.)* `ItemsSource` accepts any collection,
populating the dropdown automatically from whatever it currently
contains; `DisplayMemberPath="Name"` names which property of each
element to actually display, when each element is a full object rather
than a plain string.

### Discard

This proof is disposable; real `ComboBox`/`ItemsSource` binding returns
properly in Lesson 14.

### Mechanical Walkthrough

- `<ComboBoxItem Content="Red" />` — **(a) first appearance.** A real,
  individual dropdown entry, hand-declared; `Content` — **(b) hard
  concept reappearing** from Lesson 10's property-syntax discussion of
  `Button.Content`.
- `ItemsSource` / `DisplayMemberPath` — **(a) first appearance**,
  explained above; full mechanical treatment of what `{Binding Colors}`
  itself does is deferred to Lesson 14 by design, per the Repetition
  Rule's forward-reference requirement — Lesson 14 must and will deliver
  it.

## Connect the pieces

One trace: `TextBox` accepts free-form text, read as a live `string`
property. `CheckBox` toggles one independent `bool?` value per box.
`RadioButton` enforces exclusivity, scoped by `GroupName` — or silently,
by shared parent container when `GroupName` is omitted. `ComboBox` picks
one value from a set, either hand-declared (`ComboBoxItem`, fine for a
truly fixed, short list) or, the real scalable path, populated from a
live collection via `ItemsSource` — the exact mechanism Lesson 14 gives
full treatment to next.

## What breaks without this

Give two `RadioButton`s in *different* `StackPanel`s the *same*
`GroupName`, expecting them to behave independently because they're
visually separated. Real, observed result: checking one still unchecks
the other — `GroupName` alone determines the group, with the panel
structure having no effect once `GroupName` is explicitly set. This is
the direct proof that `GroupName`, when present, always wins over
container-based grouping, not merely a suggestion alongside it.

## Exercises

1. Build the two-group `RadioButton` example from this lesson's third
   unit with **no** `GroupName` set on any of the four buttons, relying
   entirely on container-based grouping instead. Confirm the two groups
   still behave independently, purely because they sit in separate
   `StackPanel`s.
2. Add `IsThreeState="True"` to a `CheckBox`, and click it three times in
   a row. Observe the real third state it cycles through, and state, in
   your own words, what value `IsChecked` actually holds during that
   third state.

## Definition of Done

- [ ] You confirmed `TextBox.Text` reflects live typed input.
- [ ] You confirmed two `CheckBox`es are independent.
- [ ] You reproduced the `GroupName`-wins-over-container-grouping
      behavior described above.
- [ ] You completed both exercises.

## Next

[Lesson 13 — Events and Routed Events](lesson-13-events-and-routed-events.md)
gives `Click="ShowButton_Click"` (used without full explanation in this
lesson's first unit) its real, full treatment — including the routed
event system with no equivalent in a plain C# `event` (Lesson 07).
