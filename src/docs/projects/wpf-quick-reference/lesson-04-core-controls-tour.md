# Lesson 04: Core Controls Tour

**What this covers:** the small set of controls that make up nearly every
WPF screen — `TextBlock`, `Label`, `TextBox`, `Button`, `CheckBox`,
`RadioButton`, `ComboBox`, `ListBox` — their real, distinct jobs, and the
one-line gotcha each has that isn't obvious from the name.

**What you need to know first:** [Lesson 03](lesson-03-layout-panels.md).

## `TextBlock` vs. `Label` — both show text, real difference underneath

```xml
<TextBlock Text="Read-only text" FontWeight="Bold" />
<Label Content="Also text" Target="{Binding ElementName=NameBox}" />
```

`TextBlock.Text` is a plain `string` property — lightweight, the right
default for displaying text that's just text. `Label.Content` is typed as
`object`, not `string` — a `Label` can hold arbitrary content (an image,
another control) the same way `Button.Content` can (Lesson 02's
`<Button.Content>` example). `Label` also understands **access keys**
(an underlined letter, `_Name` in XAML renders as an underlined "N" you
can Alt-jump to) and a `Target` property linking it to the input it
labels — real accessibility behavior `TextBlock` doesn't have. **Pick
`TextBlock`** for plain display text (the common case); **pick `Label`**
specifically when you need that accessibility/access-key behavior or
non-string content.

## `TextBox` — editable text, and the property that trips people up

```xml
<TextBox Text="{Binding ItemName, UpdateSourceTrigger=PropertyChanged}" />
```

The standard single-line (or, with `TextWrapping="Wrap"` and
`AcceptsReturn="True"`, multi-line) editable text field. The gotcha: a
`{Binding}` on `Text` defaults to updating its source only when the
`TextBox` **loses focus** (`LostFocus`), not on every keystroke — a
common source of "why doesn't my live search/character-count update as I
type" confusion. `UpdateSourceTrigger=PropertyChanged` (shown above)
switches it to update on every keystroke instead. Full binding mechanism:
[Lesson 06](lesson-06-data-binding-fundamentals.md).

## `Button` — one control, several ways to trigger it

```xml
<Button Content="Save" Click="SaveButton_Click" />
<Button Content="Save" Command="{Binding SaveCommand}" IsDefault="True" />
```

Two real, valid wiring styles: `Click="SaveButton_Click"` is a code-behind
event handler (Lesson 05); `Command="{Binding SaveCommand}"` is the MVVM
style (Lesson 07) — never both on the same button in idiomatic code, but
you will see both styles across different windows in the same real
project, often because different lessons/authors touched different
screens. `IsDefault="True"` makes this button fire on **Enter** anywhere
in the window, not just on click — the real mechanism behind "hit Enter
to submit a form," worth knowing when a form's Enter-key behavior looks
unexplained.

## `CheckBox` and `RadioButton` — independent toggles vs. mutually exclusive groups

```xml
<CheckBox Content="Include tax" IsChecked="True" />
<CheckBox Content="Gift wrap" />

<StackPanel>
    <RadioButton GroupName="Shipping" Content="Standard" IsChecked="True" />
    <RadioButton GroupName="Shipping" Content="Express" />
</StackPanel>
```

`CheckBox`es are independent — any number can be checked at once.
`RadioButton`s sharing the same `GroupName` are mutually exclusive —
checking one automatically unchecks the others in that group. The
grouping gotcha: with no `GroupName` set, WPF groups radio buttons by
their *shared parent container* instead — two separate `StackPanel`s each
containing ungrouped `RadioButton`s behave as two independent groups even
with no `GroupName` written anywhere, which is easy to mistake for a bug
when it's actually the default behavior. `IsChecked` is `bool` for
`CheckBox`, and technically `bool?` (nullable) for both — a `null`
"indeterminate" state exists for `CheckBox` (`IsThreeState="True"`),
rarely used but real.

## `ComboBox` — a dropdown, real `ItemsSource` binding

```xml
<ComboBox ItemsSource="{Binding Categories}"
          SelectedItem="{Binding SelectedCategory}"
          DisplayMemberPath="Name" />
```

`ItemsSource` — bound to any collection (an `ObservableCollection<T>`
in real MVVM code, Lesson 11) — populates the dropdown's entries.
`SelectedItem` — two-way bound (Lesson 06) to whichever object the user
picked. `DisplayMemberPath="Name"` — when each item in the collection is
a full object (not a plain string), this names which property to actually
show in the dropdown text, without changing what `SelectedItem` actually
holds (still the whole object, not just the displayed string). Binding a
`ComboBox` directly to a C# `enum` (a closed, fixed set of named values)
is a specific, common pattern worth recognizing — covered in depth
alongside `enum` itself in
[`pocket-inventory-wpf`'s Lesson 12](../pocket-inventory-wpf/Lesson-12-enums-and-combobox.md)
if your assignment uses one.

## `ListBox` — the simplest real item list

```xml
<ListBox ItemsSource="{Binding Items}"
         SelectedItem="{Binding SelectedItem}"
         DisplayMemberPath="Name" />
```

Same `ItemsSource`/`SelectedItem`/`DisplayMemberPath` shape as `ComboBox`
— worth noticing that this pattern (a collection in, a selection out) is
shared across nearly every WPF "list of things" control, not something to
relearn per control. `ListBox` shows every item at once (scrollable) with
one selectable at a time by default (`SelectionMode="Multiple"` or
`"Extended"` changes that). For anything resembling a real table — sortable
columns, inline editing, multiple visible fields per row — that's
`DataGrid`, covered in full in
[Lesson 12](lesson-12-datagrid-and-listview.md); `ListBox` is the right
choice specifically when each row is genuinely one simple display value,
not tabular data.

## `Image` — displaying a picture, one real gotcha

```xml
<Image Source="/Assets/logo.png" Width="120" Stretch="Uniform" />
```

`Source` accepts a file path, but a bare relative path like
`"/Assets/logo.png"` only resolves correctly when that file is set to
**Build Action: Resource** in its file properties (or embedded as a
`pack://` URI) — a plain file sitting in the folder with no build action
set will fail to load silently at runtime with no compile error, one of
the more confusing "why is my image blank" traps in WPF. `Stretch`
controls how the image fills its allotted space: `Uniform` (default,
keeps aspect ratio, may letterbox), `UniformToFill` (keeps aspect ratio,
crops instead of letterboxing), `Fill` (stretches to exactly fit,
distorting aspect ratio if the box doesn't match).

## Mechanical walkthrough, a real small form

```xml
<StackPanel>
    <Label Content="_Name" Target="{Binding ElementName=NameBox}" />
    <TextBox x:Name="NameBox" Text="{Binding ItemName, UpdateSourceTrigger=PropertyChanged}" />
    <CheckBox Content="Mark as favorite" IsChecked="{Binding IsFavorite}" />
    <Button Content="Save" Command="{Binding SaveCommand}" IsDefault="True" />
</StackPanel>
```

- `Label` with `_Name` — the underscore before `N` makes Alt+N focus
  whatever `Target` names.
- `TextBox` bound with `PropertyChanged` — updates the view model on
  every keystroke, not just on blur.
- `CheckBox` two-way bound to a `bool` property.
- `Button` wired via `Command`, not `Click` — MVVM style — and marked
  `IsDefault`, so pressing Enter anywhere in this form saves.

## What to check first in your assigned project

- For every `TextBox` bound to something, check whether it needs
  `UpdateSourceTrigger=PropertyChanged` — if a feature is supposed to
  react live as the user types and doesn't, this is usually why.
- For any `RadioButton` group behaving oddly (two groups that should be
  one, or vice versa), check `GroupName` first, container nesting second.
- Any `Image` failing to show with no error in the Output window — check
  the file's Build Action before suspecting the `Source` path itself.

## Next

[Lesson 05 — Events and Routed Events](lesson-05-events-and-routed-events.md)
covers what `Click="SaveButton_Click"` actually wires up, and the routed
event system underneath every control interaction you just saw.
