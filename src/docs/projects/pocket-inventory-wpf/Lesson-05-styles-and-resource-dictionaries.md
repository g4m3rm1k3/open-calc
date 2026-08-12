# Lesson 5: DRY, Applied to Markup Instead of Code

*(Styles and Resource Dictionaries)*

**User Story**
> As a user, I want a consistent title, branding, and navigation
> experience.

**What you will build**
The brand color `#2E5945` is currently typed, literally, once, inside
`MainWindow.xaml`'s header `Border`. The title `TextBlock`'s `FontSize`,
`FontWeight`, and every button's `Padding` are each one-off, hand-typed
values too — correct today, purely because this project has exactly one
window and two buttons. The moment a second window's header needs the same
brand color, or a third button needs the same padding, those values have
to be retyped, by hand, correctly, everywhere they're needed — and nothing
stops them from silently drifting apart from each other over time. This
lesson extracts every repeated value into named, reusable resources,
closing Epic 1 by giving Pocket Inventory an actual, centrally-defined
visual identity instead of scattered literals that happen to currently
agree.

**What you need to know first**
Lesson 2: the header `Grid`, the `Border`'s `Background="#2E5945"`, the
title `TextBlock`'s font properties — every value this lesson extracts.
Lesson 4: the header's `Button`s (`BackButton`, and Lesson 3's Add Item
button), whose padding this lesson also centralizes.

**Terms introduced in this lesson:**
- **Resource** — a named value (a color, a `Style`, anything) declared
  once and made available, by name, to a whole subtree of elements.
- **`Style`** — a named bundle of property-value pairs (`Setter`s),
  applied to any element of a matching type that opts in; changing the
  `Style`'s own definition changes every element referencing it.
- **`Setter`** — one property-value pair inside a `Style` (which
  property to set, and what to set it to).
- **`x:Key`** (contrast `x:Name`) — a required unique name identifying
  a resource for lookup purposes only; unlike `x:Name`, it generates no
  C# code-behind field.
- **Prototype-based configuration** — every styled element derives its
  appearance from one shared definition, looked up by name, instead of
  each element independently declaring its own full set of values.
- **Markup extension** (`{...}` syntax, e.g. `{StaticResource ...}`) —
  curly braces inside an attribute value telling the XAML parser "this
  isn't a literal string, resolve it as an expression" instead.
- **`StaticResource`** — a markup extension that resolves a resource
  reference once, at the moment the XAML loads, by searching outward
  from the referencing element through each enclosing scope up to the
  application root, using the first match found.
- **Lexical scoping** — resolving a reference by searching outward
  through enclosing scopes until a match is found, stopping at the
  first one; the same shape a nested function's variable lookup uses
  in any language with closures.
- **`DynamicResource`** — the alternative to `StaticResource` that
  re-resolves a reference every time it's needed, for the rarer case
  where a resource's value can genuinely change while the app runs
  (not needed by this lesson).
- **`SolidColorBrush`** — the real object type underneath any WPF color
  property; a plain hex string like `"#2E5945"` is silently converted
  into one of these, which is why giving one an explicit `x:Key` makes
  it referenceable and reusable by name.
- **`XamlParseException`** — the error WPF throws at startup when a
  XAML file references something (like a misspelled resource key) that
  can't actually be resolved; the window never opens rather than
  silently falling back to a wrong default.

**Objects and methods used**
- **`Style` / `Setter`**
  - *What it is:* a named bundle of property-value pairs, applied to
    any element of a matching type that opts in — a `Setter` is one
    property-value pair inside it.
  - *Implementation:* `System.Windows.Style`, keyed with `x:Key` and
    restricted to one `TargetType`; each child `System.Windows.Setter`
    names one `Property` and the `Value` to assign it. Applying a
    `Style` to an element is opt-in — `Style="{StaticResource ...}"` —
    never automatic just because the `Style` exists somewhere in scope.
  - *Its use:* `HeaderTitleStyle`/`ToolbarButtonStyle`, defined once in
    `App.xaml`, replace every hand-typed `FontSize`/`FontWeight`/
    `Padding` this project had scattered across `MainWindow.xaml` and
    `HomePage.xaml`. Full lab, real output, and both lenses in this
    lesson's first Concept Unit — also available as a standalone,
    project-independent concept file, `wpf-styles-and-setters.md`.
- **`SolidColorBrush`**
  - *What it is:* the real object type underneath any WPF color
    property — a plain hex string like `"#2E5945"` is silently
    converted into one of these by XAML.
  - *Implementation:* `System.Windows.Media.SolidColorBrush`. Giving
    one an explicit `x:Key` (`<SolidColorBrush x:Key="BrandColorBrush"
    Color="#2E5945" />`) makes that same brush *object* referenceable
    and reusable by name, instead of an equivalent-but-separate one
    being silently created everywhere `#2E5945` was typed directly.
  - *Its use:* `BrandColorBrush`, this project's one, centrally-defined
    brand color, referenced from the header `Border`'s `Background`.
- **`StaticResource`**
  - *What it is:* a markup extension that resolves a resource
    reference once, at the moment the XAML loads.
  - *Implementation:* `{StaticResource KeyName}` — curly-brace **markup
    extension** syntax telling the XAML parser "resolve this as an
    expression," not a literal string. Searches outward from the
    referencing element through each enclosing scope, up to
    `Application`, using the first `x:Key` match found; "static" means
    this lookup happens once, not re-checked later.
  - *Its use:* every value this lesson extracted —
    `{StaticResource BrandColorBrush}`,
    `{StaticResource HeaderTitleStyle}`,
    `{StaticResource ToolbarButtonStyle}` — replacing every hardcoded
    equivalent in `MainWindow.xaml`/`HomePage.xaml`. Full lab, real
    output, and both lenses in this lesson's third Concept Unit — also
    available as a standalone, project-independent concept file,
    `wpf-resourcedictionary-and-staticresource.md`.
- **`XamlParseException`**
  - *What it is:* the error WPF throws at startup when a XAML file
    references something — like a misspelled resource key — that can't
    actually be resolved.
  - *Implementation:* `System.Windows.Markup.XamlParseException`,
    thrown before the window ever opens, naming the specific resource
    key it couldn't find.
  - *Its use:* triggered directly, on purpose, in this lesson's "What
    Breaks Without This" — misspelling `ToolbarButtonStyle` produces a
    real, captured instance of this exact exception.

---

## Concept Unit: `Style` — a Named Bundle of Property Values

### The Problem

`BackButton` has `Padding="8,4"`. The Add Item button has
`Padding="16,8"` — already inconsistent, purely by accident of two
different lessons choosing slightly different numbers with no shared
reference. A real application needs every button of the same *kind* to
look consistent, and needs that consistency enforced by something other
than "remembering to copy the same numbers correctly every time."

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-style
```

Replace the generated `MainWindow.xaml`'s `Grid` contents:

```xml
<Grid>
    <Grid.Resources>
        <Style x:Key="RoundedButton" TargetType="Button">
            <Setter Property="Padding" Value="16,8" />
            <Setter Property="Background" Value="LightBlue" />
        </Style>
    </Grid.Resources>
    <StackPanel>
        <Button Content="First" Style="{StaticResource RoundedButton}" Margin="8" />
        <Button Content="Second" Style="{StaticResource RoundedButton}" Margin="8" />
        <Button Content="Unstyled" Margin="8" />
    </StackPanel>
</Grid>
```

Run it:

```bash
dotnet run
```

Expected result, to verify yourself: "First" and "Second" both show the
same generous padding and light blue background; "Unstyled" keeps WPF's
plain default button appearance entirely — proof that applying a `Style`
is opt-in per element, never automatic just because a `Style` exists
somewhere in the file.

Now change *only* the `Style`'s `Value="16,8"` to `Value="24,12"` and
rerun — both styled buttons grow together, in one edit, while the
unstyled one is completely unaffected.

*What this proves:* a `Style` is a named bundle of property-value pairs
(`Setter`s), applied to any element of the matching `TargetType` that
opts in via `Style="{StaticResource ...}"`. Changing the `Style`'s
definition, once, changes every element referencing it — the exact DRY
guarantee direct, per-element attributes can never provide.

### Discard the Throwaway Example
Delete the `lab-style` folder. `Style` itself is not discarded — it's
about to define Pocket Inventory's real button and text styling.

### Mechanical Walkthrough
1. `<Grid.Resources>` — (first appearance) a property-element (the same
   pattern used before, reused) holding this `Grid`'s own **resources** — named
   values available to anything inside this `Grid`'s subtree.
2. `<Style x:Key="RoundedButton" TargetType="Button">` — (first
   appearance) `x:Key` — a required unique name identifying this specific
   resource among any others declared alongside it, distinct from
   `x:Name`: `x:Name` generates a C# field reference; `x:Key`
   only ever labels an entry in a resource lookup, with no code-behind
   field generated at all. `TargetType="Button"` restricts this `Style`
   to elements of exactly that type — a `Style` written for `Button`
   cannot be applied to a `TextBlock`.
3. `<Setter Property="Padding" Value="16,8" />` — (first appearance) one
   property-value pair inside the `Style` — `Property` names which
   property to set (using the plain property name, no quotes needed
   around it despite being an attribute value — it's read by name, not as
   arbitrary text), `Value` is what to set it to.
4. `Style="{StaticResource RoundedButton}"` — (first appearance) applies
   the named `Style` to this specific `Button`. `{StaticResource ...}` —
   (first appearance) **markup extension syntax** — curly braces inside
   an attribute value tell the XAML parser "this isn't a literal string,
   resolve it as an expression" — here, "look up the resource named
   `RoundedButton`" — covered in full in this lesson's final unit.

### CS Lens

A `Style` is a form of **prototype-based configuration**: rather than each
`Button` independently declaring its own full set of property values,
every styled `Button` derives its appearance from one shared definition,
looked up by name at the moment the element is constructed. Changing the
shared definition changes every element that derives from it, without
touching any of them individually.

### SE Lens

Why not just accept slightly different padding on different buttons,
since a few pixels of inconsistency is a minor visual issue, not a bug?
Because "minor" inconsistencies compound: this project's roadmap adds
buttons in nearly every remaining lesson — Edit, Delete, Save, Cancel,
Export, Import, and more — and without one shared definition, each new
button is a fresh chance to introduce a slightly different value, with
nothing to catch the drift. A `Style`, defined once, makes "every button
looks the same" a structural guarantee rather than a discipline every
future lesson has to remember to uphold by hand.

### Connection

The next unit applies this exact mechanism to Pocket Inventory's real
buttons and header text — no longer inside a throwaway `Grid.Resources`,
but somewhere every window in this project can reach.

---

## Concept Unit: `App.xaml` as the Application-Wide Resource Root

### The Problem

`Grid.Resources` from the lab only makes a `Style` available inside that
specific `Grid`'s own subtree. Pocket Inventory needs its brand color and
button style available to *every* window this project will ever have —
including ones that don't exist yet — which means the resources need to
live somewhere genuinely application-wide, not attached to one specific
`Grid` in one specific window.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `App.xaml`.
- **Change type:** Add.
- **Location:** `App.xaml`'s `<Application.Resources>` element — present,
  empty, since the project was first scaffolded (named in that
  file-anatomy walkthrough but never filled in until now).
- **Dependencies:** None beyond the scaffolded project.

### The New Code

```xml
<Application.Resources>
    <SolidColorBrush x:Key="BrandColorBrush" Color="#2E5945" />

    <Style x:Key="HeaderTitleStyle" TargetType="TextBlock">
        <Setter Property="FontSize" Value="24" />
        <Setter Property="FontWeight" Value="Bold" />
    </Style>

    <Style x:Key="ToolbarButtonStyle" TargetType="Button">
        <Setter Property="Padding" Value="12,6" />
    </Style>
</Application.Resources>
```

### The Updated Project

```xml
<Application x:Class="PocketInventory.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             StartupUri="MainWindow.xaml">
    <Application.Resources>
        <SolidColorBrush x:Key="BrandColorBrush" Color="#2E5945" /> <!-- ← new -->

        <Style x:Key="HeaderTitleStyle" TargetType="TextBlock">      <!-- ← new -->
            <Setter Property="FontSize" Value="24" />                 <!-- ← new -->
            <Setter Property="FontWeight" Value="Bold" />              <!-- ← new -->
        </Style>                                                       <!-- ← new -->

        <Style x:Key="ToolbarButtonStyle" TargetType="Button">          <!-- ← new -->
            <Setter Property="Padding" Value="12,6" />                   <!-- ← new -->
        </Style>                                                          <!-- ← new -->
    </Application.Resources>
</Application>
```

`Application.Resources` was already part of the file `dotnet new wpf`
generated at the very start — it just sat empty. `StartupUri` (also
generated then, unexplained until relevant, and still not the
subject of this lesson) is untouched.

### Mechanical Walkthrough
1. `<SolidColorBrush x:Key="BrandColorBrush" Color="#2E5945" />` — (first
   appearance) `Background="#2E5945"` used before set a color directly;
   this instantiates a real, named `SolidColorBrush` **object** — WPF
   colors used as a `Background`/`Foreground` are always actually
   `Brush` objects underneath, even when set as a plain hex string
   (which XAML silently converts into one for you); giving it an explicit
   `x:Key` here is what makes that same brush *object* referenceable and
   reusable by name, instead of a fresh, equivalent-but-separate one
   being created every place `#2E5945` was previously typed.
2. `<Style x:Key="HeaderTitleStyle" TargetType="TextBlock">` — (hard
   concept reappearing) same shape as the lab, extracting the
   title `TextBlock`'s `FontSize="24"`/`FontWeight="Bold"` values already
   used.
3. `<Style x:Key="ToolbarButtonStyle" TargetType="Button">` — (hard
   concept reappearing) one shared padding value, chosen as a single
   compromise between the Add Item button's `16,8` and the Back button's
   `8,4` — the actual
   moment this lesson's opening inconsistency gets resolved.

### CS Lens

Placing shared resources at the `Application` level rather than any one
`Window`'s level is choosing the **broadest scope that's actually
correct** for values meant to be truly global — the same reasoning that
governs where a variable or a constant should be declared in any
language: as narrowly as the problem allows, but no narrower than
correctness requires. A brand color meant for the *whole app* belongs at
the application root; a resource meant only for one specific screen would
belong on that screen's own root element instead, exactly as the lab's
`Grid.Resources` demonstrated.

### SE Lens

Why does WPF resolve resources by searching outward — checking the
element itself, then its parent, then *its* parent, all the way up to
`Application` — rather than requiring every resource to be declared
directly on `Application` regardless of how narrowly it's actually used?
Because a resource meant for one specific screen (a color used nowhere
else, say) shouldn't have to pollute the application-wide namespace and
risk a name collision with something else entirely unrelated. The lookup
chain lets each resource live at the narrowest scope that's actually
correct for it, while still allowing genuinely global ones, like this
lesson's brand color, to be found from anywhere.

### Connection

These three resources exist now but are used nowhere yet — the next unit
applies them to `MainWindow.xaml`'s real header and buttons.

---

## Concept Unit: `StaticResource` — Resolving a Reference

### The Problem

Time to actually replace `MainWindow.xaml`'s hardcoded values with
references to the resources just defined.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `MainWindow.xaml`.
- **Change type:** Replace.
- **Location:** The header `Border`'s `Background`, the title
  `TextBlock`'s `FontSize`/`FontWeight`, and both buttons' `Padding`.
- **Dependencies:** `App.xaml`'s resources, previous unit.

### The New Code

```xml
<Border Grid.Column="1"
        Background="{StaticResource BrandColorBrush}"
        Width="32" Height="32" />

<TextBlock Grid.Column="2"
           Text="Pocket Inventory"
           Style="{StaticResource HeaderTitleStyle}"
           Margin="12,0,0,0"
           VerticalAlignment="Center" />

<Button x:Name="BackButton"
        Grid.Column="0"
        Content="◀ Back"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="0,0,12,0"
        IsEnabled="False"
        Click="BackButton_Click" />
```

### The Updated Project

```xml
<Grid Grid.Row="0" Margin="16,16,16,8">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="*" />
    </Grid.ColumnDefinitions>

    <Button x:Name="BackButton"
            Grid.Column="0"
            Content="◀ Back"
            Style="{StaticResource ToolbarButtonStyle}"      <!-- ← changed (was Padding="8,4") -->
            Margin="0,0,12,0"
            IsEnabled="False"
            Click="BackButton_Click" />

    <Border Grid.Column="1"
            Background="{StaticResource BrandColorBrush}"    <!-- ← changed (was "#2E5945") -->
            Width="32" Height="32" />

    <TextBlock Grid.Column="2"
               Text="Pocket Inventory"
               Style="{StaticResource HeaderTitleStyle}"      <!-- ← changed (was FontSize/FontWeight) -->
               Margin="12,0,0,0"
               VerticalAlignment="Center" />
</Grid>
```

And `HomePage.xaml`'s Add Item button picks up the identical
style:

```xml
<Button Content="Add Item"
        Style="{StaticResource ToolbarButtonStyle}"  <!-- ← changed (was Padding="16,8") -->
        Margin="0,24,0,0"
        Click="AddItemButton_Click" />
```

No hardcoded `#2E5945`, no directly-set `FontSize`/`FontWeight` on the
title, and no per-button `Padding` remain anywhere in this project — every
one of those values now traces back to exactly one definition, in
`App.xaml`.

### Mechanical Walkthrough
1. `{StaticResource BrandColorBrush}` — (first appearance, full
   treatment) `StaticResource` is a **markup extension** that resolves,
   once, at the moment the XAML is loaded — it walks the resource lookup
   chain from this unit's previous concept unit (this element, its
   parent, its parent's parent, up to `App.xaml`), finds the first
   resource whose `x:Key` matches, and substitutes it in. "Static" here
   means the lookup happens once — if the resource's own value changed
   *after* this element already loaded, this reference would not
   automatically pick up the change (Lesson 39's `DynamicResource`
   exists precisely for the case where that matters — not this project's
   need yet, since nothing changes this brush at runtime today).
2. `Style="{StaticResource HeaderTitleStyle}"` /
   `Style="{StaticResource ToolbarButtonStyle}"` — (hard concept
   reappearing) the identical resolution mechanism, applied to a whole
   `Style` object instead of a single `Brush` — `Style` resources and
   `Brush` resources are looked up through the exact same chain, since
   both are simply named entries in the same kind of resource
   dictionary.

### CS Lens

`StaticResource`'s scope-chain lookup — check here, then the parent, then
the parent's parent, up to the root — is the identical shape as
**lexical scoping** in a programming language: a variable reference
resolves by searching outward through enclosing scopes until a match is
found, stopping at the first one. A `TextBlock` deep inside several
nested `Grid`s finding `HeaderTitleStyle`, defined all the way up at
`Application`, is doing exactly what a nested function accessing a
variable from an outer scope does in any language with closures.

### SE Lens

Why does `StaticResource` resolve once, at load time, instead of always
re-checking for the current value the way a data-bound property does
(a mechanism this project meets for real starting Lesson 7)? Because most
resources — colors, styles, fonts — are genuinely fixed for the life of
the application; re-checking them constantly would be wasted work for
values that, in the overwhelming majority of cases, never change after
the app starts. `StaticResource`'s one-time resolution is the cheaper,
correct default; `DynamicResource` exists as an explicit, deliberate
opt-in for the rarer case — like a runtime theme switch — where a
resource's value genuinely does need to change while the app is running.

### Commands needed

```bash
dotnet run
```

### Run it

On your Windows machine, the app looks visually identical to before —
this lesson's entire point is that *nothing about the running app
changed*, only where its values are defined. Prove the real payoff:
change `App.xaml`'s `BrandColorBrush` color to a different hex value and
rerun — the header icon updates, with zero changes to `MainWindow.xaml`
itself.

### Connection

Every future screen, button, and text element this project adds can reach
`BrandColorBrush`, `HeaderTitleStyle`, and `ToolbarButtonStyle` for free,
from any file, the moment it needs the same look — Epic 1 closes here with
an application shell that's not just visually consistent today, but
structurally guaranteed to stay that way as this project grows through
the next 45 lessons.

---

## Closing

### Connect the Pieces
One concrete trace: the header `Border` was hardcoded with `#2E5945`
directly; the Add Item and Back buttons each hand-typed their own button
padding, independently, already slightly inconsistent. This lesson's first unit
proved, with a throwaway `Grid.Resources` example, that a `Style` applied
via `StaticResource` lets many elements share one definition. The second
unit moved that idea to `App.xaml`'s `Application.Resources` — the
broadest scope that's actually correct for values meant to apply
everywhere. The third unit replaced every hardcoded value in
`MainWindow.xaml` and `HomePage.xaml` with a `{StaticResource ...}`
reference, resolved once, at load time, by walking outward from the
referencing element until a matching `x:Key` is found — the exact same
lexical-scoping shape any nested-function variable lookup uses in any
language.

### What Breaks Without This
Temporarily misspell `Style="{StaticResource ToolbarButtonStyle}"` as
`Style="{StaticResource ToolbarBtnStyle}"` on `BackButton` and run the
app. Real, representative failure: WPF cannot silently ignore a missing
resource reference the way a missing dictionary key sometimes fails
quietly in other contexts — the application throws an exception at
startup (a `XamlParseException`, naming the resource key it couldn't
resolve) and the window never opens at all. Restore the correct key name
and it opens again. This is a deliberate, load-bearing design choice worth
naming directly: WPF fails loudly and immediately on a missing resource,
rather than falling back to some default silently, precisely because a
silently-wrong visual style would be far harder to notice and debug than
an app that refuses to start at all.

### Exercises

- Add a fourth resource, `<Style x:Key="TaglineStyle" TargetType="TextBlock">`,
  extracting the footer's `FontSize="12"`/`Foreground="Gray"` values, and
  apply it — connecting this lesson's mechanism to a third, independent
  place it applies.
- Temporarily remove `TargetType="Button"` from `ToolbarButtonStyle`
  entirely and try applying it to a `TextBlock` — read the real compiler
  or runtime error and connect it back to what `TargetType` actually
  restricts.
- In a scratch file, declare two `Style`s with the *same* `x:Key` inside
  the same `Application.Resources` block, and observe what WPF does —
  research (or predict, then verify) whether this is a compile error, a
  runtime error, or silently uses one and ignores the other.

### Definition of Done
- [ ] `App.xaml` defines `BrandColorBrush`, `HeaderTitleStyle`, and
      `ToolbarButtonStyle`; no hardcoded equivalents remain anywhere in
      `MainWindow.xaml` or `HomePage.xaml`.
- [ ] Changing `BrandColorBrush`'s color in one place visibly changes the
      header icon with no other file edited.
- [ ] You can explain, in your own words, the difference between
      `x:Key` and `x:Name`, and why a `Style` resource uses the former.
- [ ] You triggered the real `XamlParseException` from a misspelled
      resource key yourself, and restored the correct one.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Extract brand color, header style, and button style into App.xaml resources, closing Epic 1 with a consistent, centrally-defined visual identity"`.
