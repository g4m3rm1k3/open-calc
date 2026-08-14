# WPF Quick Reference — C# and WPF, Every Piece, Fast

## What this is

Not a narrative curriculum like [`pocket-inventory-wpf`](../pocket-inventory-wpf/)
(60 lessons building one app, one feature at a time, over weeks). This is a
**topic-indexed reference**: each lesson stands alone, covers one real piece
of C# or WPF end to end, and assumes you'll jump straight to the topic you
need rather than reading front to back. Built for one specific situation:
you were handed an existing WPF project to modify, you know real OOP (Java,
Kotlin, Python — from this curriculum's Android tracks) but have never
touched C# or WPF, and you don't have weeks — you need to open the project,
recognize every file and every piece of XAML in it, and start improving it
this week.

Every lesson still follows [`LESSON SCHEMA.md`](../../reference/LESSON%20SCHEMA.md)'s
real rules — real code, real output, explanations that say *why*, not just
*what* — but topics are scoped to be read in one sitting, not spread across
throwaway labs and multi-page execution traces. If you later want the full,
slower treatment of any of this, `pocket-inventory-wpf` covers almost all of
it again in that deeper form — this series links to it where that's true.

## Two tracks, read in this order once, then jump around

### C# — the language, fast, for someone who already knows OOP

| # | Lesson | Covers |
|---|---|---|
| 00 | [C# for Java/Kotlin/Python Developers](lesson-00-csharp-for-java-kotlin-developers.md) | `namespace`/`using`, properties vs getters/setters, access modifiers, `var`, string interpolation, nullable reference types, `record`/`struct` vs `class`, LINQ at a glance |
| 00b | [Delegates, Events, and Lambdas](lesson-00b-delegates-events-and-lambdas.md) | `delegate`, `event`, lambda syntax, why WPF's whole event/binding model rests on this |

### WPF — the framework, one real piece per lesson

| # | Lesson | Covers |
|---|---|---|
| 01 | [Anatomy of a WPF Project](lesson-01-anatomy-of-a-wpf-project.md) | `.csproj`, `App.xaml`, `MainWindow.xaml`/`.xaml.cs`, `partial class`, how XAML compiles into C# |
| 02 | [XAML Syntax Itself](lesson-02-xaml-syntax-itself.md) | elements as classes, attribute vs. property-element syntax, `xmlns`, markup extensions (`{Binding}`, `{StaticResource}`) |
| 03 | [Layout Panels](lesson-03-layout-panels.md) | `Grid`, `StackPanel`, `DockPanel`, `WrapPanel`, `Canvas` — when each is the right tool |
| 04 | [Core Controls Tour](lesson-04-core-controls-tour.md) | `Button`, `TextBox`, `TextBlock`, `Label`, `CheckBox`, `RadioButton`, `ComboBox`, `ListBox` |
| 05 | [Events and Routed Events](lesson-05-events-and-routed-events.md) | code-behind `Click` handlers, the routed event system, bubbling vs. tunneling |
| 06 | [Data Binding Fundamentals](lesson-06-data-binding-fundamentals.md) | `{Binding}`, `DataContext`, binding modes, `INotifyPropertyChanged` |
| 07 | [Commands and MVVM](lesson-07-commands-and-mvvm.md) | `ICommand`, a hand-written `RelayCommand`, why MVVM exists, what it actually buys you |
| 08 | [Resources and Styles](lesson-08-resources-and-styles.md) | `ResourceDictionary`, `Style`, `Setter`, `Trigger`, `StaticResource` vs `DynamicResource` |
| 09 | [Templates and Converters](lesson-09-templates-and-converters.md) | `DataTemplate`, `ControlTemplate`, `IValueConverter` |
| 10 | [Dependency Properties](lesson-10-dependency-properties.md) | what a DP actually is, why WPF needs its own property system, writing one |
| 11 | [Collections and ICollectionView](lesson-11-collections-and-icollectionview.md) | `ObservableCollection<T>`, live sort/filter/group without touching the underlying data |
| 12 | [DataGrid and ListView In Depth](lesson-12-datagrid-and-listview.md) | columns, `SelectedItem`, editing, the control most assignment projects lean on |
| 13 | [Dialogs and Windows](lesson-13-dialogs-and-windows.md) | `MessageBox`, `OpenFileDialog`, secondary windows, modal vs. modeless |
| 14 | [Async/Await and the Dispatcher](lesson-14-async-await-and-the-dispatcher.md) | why a slow call freezes the whole UI, `async`/`await`, the UI thread rule |
| 15 | [Validation and Debugging WPF](lesson-15-validation-and-debugging-wpf.md) | `IDataErrorInfo`, reading binding failures out of the Output window, the mistakes that eat the most time |

## How to actually use this under a deadline

1. Read 00, 00b, 01, and 02 once, in order — those four are the floor
   everything else stands on (you can't read any later lesson's code without
   them).
2. Open your assigned project. For every file type and every XAML tag you
   don't recognize, find the matching lesson above and read *that one*.
3. Lesson 07 (Commands/MVVM) is the one worth reading even if nothing in
   your assignment forces it yet — it's the difference between "I patched
   the file I was given" and "I can see how to make this better," which is
   what you said you actually want.

## Status

All 17 lessons are written.

- [x] Lesson 00 — C# for Java/Kotlin/Python Developers
- [x] Lesson 00b — Delegates, Events, and Lambdas
- [x] Lesson 01 — Anatomy of a WPF Project
- [x] Lesson 02 — XAML Syntax Itself
- [x] Lesson 03 — Layout Panels
- [x] Lesson 04 — Core Controls Tour
- [x] Lesson 05 — Events and Routed Events
- [x] Lesson 06 — Data Binding Fundamentals
- [x] Lesson 07 — Commands and MVVM
- [x] Lesson 08 — Resources and Styles
- [x] Lesson 09 — Templates and Converters
- [x] Lesson 10 — Dependency Properties
- [x] Lesson 11 — Collections and ICollectionView
- [x] Lesson 12 — DataGrid and ListView In Depth
- [x] Lesson 13 — Dialogs and Windows
- [x] Lesson 14 — Async/Await and the Dispatcher
- [x] Lesson 15 — Validation and Debugging WPF
