# WPF Foundations — C# and WPF, Full Depth, No Gaps

## What this is, and how it differs from the other two WPF series

This repo has three WPF-adjacent series now, each with a different job:

- [`pocket-inventory-wpf`](../pocket-inventory-wpf/) — a 60-lesson narrative
  curriculum building one real app, assuming **zero prior OOP** (its own
  floor is basic Python only — no `class`, no inheritance, nothing).
- [`wpf-quick-reference`](../wpf-quick-reference/) — a fast, topic-indexed
  series for a Java/Kotlin developer who needs to get productive in an
  existing WPF project *this week*. Deliberately condensed: real code,
  real reasoning, but not every construct gets its own isolated lab.
  Left in place on purpose — it's genuinely useful for exactly that
  situation, and this is an open-source app; other readers in that same
  spot benefit from it too.
- **This series** — full [`LESSON SCHEMA.md`](../../reference/LESSON%20SCHEMA.md)
  rigor. Every construct, including ones that look Java/Kotlin-familiar,
  gets its own throwaway isolated lab before it's used for real, per the
  schema's Concept Isolation Rule ("familiar-sounding is a trap, not a
  reason to skip the lab"). Nothing appears in a real code block without
  having been taught first. This is the direct fix for a real problem:
  `wpf-quick-reference` used some C# syntax (a `switch` expression with
  `when`, `[CallerMemberName]`, LINQ chains) inline, in service of moving
  fast, without giving each one its own isolated first-appearance
  treatment — exactly what this schema's Concept Isolation Rule exists to
  prevent.

## Who this is for

Real, working knowledge of OOP from Java and/or Kotlin — classes, objects,
constructors, inheritance, interfaces, polymorphism. That ground is
**not** re-taught here; every lesson below assumes it's solid and spends
zero time re-explaining what a class or a constructor is. Nothing about
C#, .NET, or WPF is assumed — every C#-specific and WPF-specific
construct, no matter how familiar it looks coming from Java/Kotlin, gets
full first-appearance treatment: an isolated lab, a mechanical
walkthrough of every token, a CS lens and an SE lens where those apply.

## How the lessons are ordered

Two arcs. The C# arc closes every real gap a Java/Kotlin developer hits
reading C# for the first time — properties as a language feature, value
vs. reference semantics, lambdas, delegates, `event`, LINQ — each of
which either doesn't exist in Java/Kotlin at all or is spelled
differently enough to need its own real treatment. The WPF arc only
starts once that ground is solid, because WPF's own idioms (`{Binding}`,
`ICommand`, dependency properties) all lean on C# features from the first
arc.

### Arc 1 — C#, the parts Java/Kotlin doesn't prepare you for

| # | Lesson | Covers |
|---|---|---|
| 01 | [Namespaces and `using`](lesson-01-namespaces-and-using.md) | `namespace`, `using`, the file-scoped form, how this differs from Java's package/import |
| 02 | [Properties as a Real Language Feature](lesson-02-properties.md) | auto-properties, full properties, why C# has this and Java doesn't |
| 03 | [`var`, String Interpolation, and Nullable Reference Types](lesson-03-var-interpolation-nullable.md) | real static typing inferred, `$"..."`, `string?` and compiler-tracked null-safety |
| 04 | [Value vs. Reference Semantics — `struct`, `record`, `class`](lesson-04-struct-record-class.md) | three kinds of type, proven by a real copy that does or doesn't share state |
| 05 | [Lambda Expressions](lesson-05-lambda-expressions.md) | `=>`, inline unnamed functions, first appearance in isolation |
| 06 | [Delegates, `Func<>`, and `Action<>`](lesson-06-delegates-func-action.md) | a method as a value, the real mechanism a lambda plugs into |
| 07 | [The `event` Keyword](lesson-07-the-event-keyword.md) | a hardened delegate field, the Observer pattern, real proof via `+=` |
| 08 | [LINQ — `Where`, `Select`, and Deferred Execution](lesson-08-linq.md) | query methods over any collection, and the one timing gotcha that trips everyone once |

### Arc 2 — WPF, once the C# ground is solid

| # | Lesson | Covers |
|---|---|---|
| 09 | *(see note below)* A WPF Window Is a Class Split in Two | `partial class`, the `.csproj`, how XAML compiles into C# |
| 10 | [XAML: Property-Element Syntax and Markup Extensions](lesson-10-xaml-property-elements-and-markup-extensions.md) | `<Type.Property>` syntax, `{StaticResource}`/`{Binding}` as a distinct third syntax, `x:Name` |
| 11 | [Layout Panels](lesson-11-layout-panels.md) | `StackPanel`, `Grid` (rows/columns, star sizing), `DockPanel`, `WrapPanel`, `Canvas`, `UniformGrid` |
| 12 | [Core Controls Tour](lesson-12-core-controls-tour.md) | `TextBox`, `CheckBox`, `RadioButton` (and the `GroupName` gotcha), `ComboBox` |
| 13 | [Events and Routed Events](lesson-13-events-and-routed-events.md) | `Click` proven to be Lesson 07's `event`, bubbling, `e.Handled` |
| 14 | [Data Binding Fundamentals](lesson-14-data-binding-fundamentals.md) | `DataContext`, `{Binding}`, binding modes, `INotifyPropertyChanged` proven against a real stale-UI bug |
| 15 | [Commands and MVVM](lesson-15-commands-and-mvvm.md) | `ICommand`, a hand-written `RelayCommand`, MVVM proven by running real logic with zero `Window` |
| 16 | [Resources and Styles](lesson-16-resources-and-styles.md) | `ResourceDictionary` scoping, `Style`/`Setter`, `Trigger` proven against real `IsMouseOver`/`IsEnabled` |
| 17 | [Templates and Converters](lesson-17-templates-and-converters.md) | `DataTemplate` proven against a real `.ToString()` fallback, `ControlTemplate`, `IValueConverter` proven against a real type-mismatch failure |
| 18 | [Dependency Properties](lesson-18-dependency-properties.md) | a plain property proven to fail against `{Binding}`/`Trigger`, fixed with a real `DependencyProperty` |
| 19 | [Collections and `ICollectionView`](lesson-19-collections-and-icollectionview.md) | `List<T>` proven stale, fixed with `ObservableCollection<T>`; live filter/sort proven not to touch the source data |
| 20 | [`DataGrid` In Depth](lesson-20-datagrid-in-depth.md) | `AutoGenerateColumns` vs. explicit columns, exactly when a cell edit commits |
| 21 | [Dialogs and Windows](lesson-21-dialogs-and-windows.md) | `MessageBox`, `OpenFileDialog`, modal vs. modeless, `DialogResult` proven necessary beyond reference semantics alone |
| 22 | [Async/Await and the Dispatcher](lesson-22-async-await-and-the-dispatcher.md) | a real frozen window fixed with `async`/`await`, a real cross-thread crash fixed with `Dispatcher.Invoke` |
| 23 | [Validation and Debugging WPF](lesson-23-validation-and-debugging-wpf.md) | a real silent binding failure read from the Output window, `IDataErrorInfo` proven against real UI feedback |

**Lesson 09 already exists, written to this exact schema, and is reused
here rather than duplicated:** [`wpf-lessons/lesson-01-a-window-is-a-class-split-in-two.md`](../wpf-lessons/lesson-01-a-window-is-a-class-split-in-two.md).
Its own stated floor ("nothing about C# or WPF... what a `class` is and
does... nothing else assumed") matches this series exactly. Read it as
Lesson 09 in this sequence — the concepts it teaches (`partial`, the
`.csproj`, XAML→C# compilation) don't depend on which toy app the lesson
happens to build.

## Status

Complete — all 23 lessons written: Arc 1's 8 C# foundation lessons, and
Arc 2's full WPF arc, Lesson 09 (reused from `wpf-lessons`) through
Lesson 23. Every lesson follows the full Lesson Schema: an isolated
throwaway lab (or a real, deliberately caused failure where that's the
clearer proof) before any construct is used for real, a full mechanical
walkthrough sorting every token as first-appearance/reappearing/basic,
CS/SE lenses, a real caused-failure section, exercises, and a Definition
of Done.

- [x] Lesson 01 — Namespaces and `using`
- [x] Lesson 02 — Properties as a Real Language Feature
- [x] Lesson 03 — `var`, String Interpolation, and Nullable Reference Types
- [x] Lesson 04 — Value vs. Reference Semantics
- [x] Lesson 05 — Lambda Expressions
- [x] Lesson 06 — Delegates, `Func<>`, and `Action<>`
- [x] Lesson 07 — The `event` Keyword
- [x] Lesson 08 — LINQ
- [x] Lesson 09 — A WPF Window Is a Class Split in Two *(reused from `wpf-lessons`)*
- [x] Lesson 10 — XAML: Property-Element Syntax and Markup Extensions
- [x] Lesson 11 — Layout Panels
- [x] Lesson 12 — Core Controls Tour
- [x] Lesson 13 — Events and Routed Events
- [x] Lesson 14 — Data Binding Fundamentals
- [x] Lesson 15 — Commands and MVVM
- [x] Lesson 16 — Resources and Styles
- [x] Lesson 17 — Templates and Converters
- [x] Lesson 18 — Dependency Properties
- [x] Lesson 19 — Collections and `ICollectionView`
- [x] Lesson 20 — `DataGrid` In Depth
- [x] Lesson 21 — Dialogs and Windows
- [x] Lesson 22 — Async/Await and the Dispatcher
- [x] Lesson 23 — Validation and Debugging WPF
