# WPF From Scratch

A concept-based C# and WPF series. No project. No app being built across
lessons. Each lesson teaches one thing in isolation using throwaway code —
so you can read every lesson in order as a complete course, or open any
single lesson cold as a reference when you need it.

No comparisons to other languages. Everything is explained on its own terms.

---

## C# Fundamentals — Lessons 01–09

These come first because WPF depends on them heavily. You cannot read a
binding error without understanding properties. You cannot fix a UI that
won't update without understanding `INotifyPropertyChanged`. You cannot
write a `RelayCommand` without understanding delegates.

| # | Topic |
|---|-------|
| 01 | [Types and Variables](./Lesson%2001%20Types%20and%20Variables.md) — `int`, `string`, `bool`, `double`, `var`, type safety |
| 02 | [Classes and Objects](./Lesson%2002%20Classes%20and%20Objects.md) — `class`, `new`, constructors, `public`/`private` |
| 03 | [Properties](./Lesson%2003%20Properties.md) — `get`/`set`, auto-properties, read-only properties |
| 04 | [Null and Nullable Types](./Lesson%2004%20Null%20and%20Nullable%20Types.md) — `null`, `int?`, `?.`, `??` |
| 05 | [Inheritance and Polymorphism](./Lesson%2005%20Inheritance%20and%20Polymorphism.md) — `: BaseClass`, `virtual`, `override`, `sealed` |
| 06 | [Interfaces](./Lesson%2006%20Interfaces.md) — `interface`, implementing multiple, coding to the interface |
| 07 | [Delegates and Events](./Lesson%2007%20Delegates%20and%20Events.md) — `Action`, `Func`, `event`, `EventHandler<T>` |
| 08 | [Generics](./Lesson%2008%20Generics.md) — `List<T>`, `Dictionary<K,V>`, type parameters |
| 09 | [LINQ](./Lesson%2009%20LINQ.md) — `Where`, `Select`, `OrderBy`, `FirstOrDefault`, `IEnumerable<T>` |

---

## WPF Core — Lessons 10–30

| # | Topic |
|---|-------|
| 10 | [A Window Split in Two](./Lesson%2010%20A%20Window%20Split%20in%20Two.md) — XAML, code-behind, `partial`, `InitializeComponent` |
| 11 | [The Visual Tree](./Lesson%2011%20The%20Visual%20Tree.md) — logical tree, visual tree, event bubbling, `x:Name` |
| 12 | [Grid Layout](./Lesson%2012%20Grid%20Layout.md) — rows, columns, `*`/`Auto`/fixed, `ColumnSpan` |
| 13 | [Other Layout Panels](./Lesson%2013%20Other%20Layout%20Panels.md) — `StackPanel`, `DockPanel`, `WrapPanel`, `Canvas` |
| 14 | [Common Controls](./Lesson%2014%20Common%20Controls.md) — `TextBox`, `Label`, `Button`, `CheckBox`, `ComboBox` |
| 15 | [Routed Events](./Lesson%2015%20Routed%20Events.md) — bubbling, tunneling, direct, `Handled` |
| 16 | [Data Binding Basics](./Lesson%2016%20Data%20Binding%20Basics.md) — `Binding`, `DataContext`, `Mode`, `UpdateSourceTrigger` |
| 17 | [INotifyPropertyChanged](./Lesson%2017%20INotifyPropertyChanged.md) — why bindings don't update, `PropertyChanged`, `[CallerMemberName]` |
| 18 | [ObservableCollection\<T\>](./Lesson%2018%20ObservableCollection.md) — why `List<T>` fails for UI, `CollectionChanged` |
| 19 | [Styles and Setters](./Lesson%2019%20Styles%20and%20Setters.md) — `Style`, `Setter`, `TargetType`, `BasedOn` |
| 20 | [Resource Dictionaries](./Lesson%2020%20Resource%20Dictionaries.md) — `ResourceDictionary`, `MergedDictionaries`, `StaticResource` vs `DynamicResource` |
| 21 | [Data Templates](./Lesson%2021%20Data%20Templates.md) — `DataTemplate`, `ItemTemplate`, `ContentTemplate` |
| 22 | [Value Converters](./Lesson%2022%20Value%20Converters.md) — `IValueConverter`, `Convert`, `ConvertBack`, `ConverterParameter` |
| 23 | [Commands and ICommand](./Lesson%2023%20Commands%20and%20ICommand.md) — `ICommand`, `RelayCommand`, `CanExecute` |
| 24 | [MVVM](./Lesson%2024%20MVVM.md) — Model, View, ViewModel, the tradeoffs |
| 25 | [CollectionViewSource](./Lesson%2025%20CollectionViewSource.md) — sorting, grouping, filtering without touching the data |
| 26 | [Frame and Page Navigation](./Lesson%2026%20Frame%20and%20Page%20Navigation.md) — `Frame`, `Page`, navigation stack, passing data |
| 27 | [Dialogs](./Lesson%2027%20Dialogs.md) — `MessageBox`, file dialogs, custom modal windows |
| 28 | [Triggers](./Lesson%2028%20Triggers.md) — `Trigger`, `DataTrigger`, `MultiTrigger`, `EventTrigger` |
| 29 | [Control Templates](./Lesson%2029%20Control%20Templates.md) — `ControlTemplate`, `ContentPresenter`, `TemplateBinding` |
| 30 | [async/await in WPF](./Lesson%2030%20async%20and%20await%20in%20WPF.md) — UI thread, `Task`, `Dispatcher.InvokeAsync` |
