# Lesson 25: CollectionViewSource

**What you will build:** You will build small, isolated examples that take a standard list of data in C# and manipulate how it is presented in the UI—sorting it, grouping it by category, and filtering out items—all without modifying the underlying list itself. This solves the problem of keeping your core data intact while providing dynamic, user-driven views of that data.

**What you need to know first:** Lesson 14 (Data Binding), Lesson 15 (ObservableCollection), Lesson 20 (DataTemplates).

**Terms introduced in this lesson:**
- **View (of a collection)** — a layer sitting between your raw data and the UI control. It determines which items from the data are visible, in what order, and how they are grouped. *Why it exists:* To allow multiple different UI representations of the exact same data simultaneously without duplicating or modifying the original data.

**Objects and methods used:**
- **CollectionViewSource**
  - *What it is:* A XAML-friendly wrapper that creates and manages a view over any collection.
  - *Implementation:* `<CollectionViewSource x:Key="Name" Source="{Binding Collection}"/>`
  - *Its use:* You place it in your XAML resources, point it to your raw data, and then bind your UI controls to it instead of directly to the data.
- **SortDescription**
  - *What it is:* An instruction that tells a view to order items by a specific property name.
  - *Implementation:* `new SortDescription("PropertyName", ListSortDirection.Ascending)`
  - *Its use:* Placed inside a `CollectionViewSource.SortDescriptions` collection to define sorting rules.
- **PropertyGroupDescription**
  - *What it is:* An instruction that tells a view to group items together if they share the same value for a specific property.
  - *Implementation:* `new PropertyGroupDescription("PropertyName")`
  - *Its use:* Placed inside a `CollectionViewSource.GroupDescriptions` collection to define grouping rules.
- **FilterEventArgs**
  - *What it is:* The event data provided when a view is evaluating whether an item should be visible.
  - *Implementation:* `void OnFilter(object sender, FilterEventArgs e)`
  - *Its use:* You read the `e.Item` property to inspect the data item, and set `e.Accepted = true` or `false` to show or hide it.

---

## Concept Unit: What CollectionViewSource Is

### The Problem
When you bind a `ListBox` directly to an `ObservableCollection<Person>`, the UI displays exactly what is in the list, in the exact order it was added. If you want to change the order or hide items, your only option is to actually move or remove items in the `ObservableCollection`. This permanently alters your data. You need a way to change how the data is *presented* without changing the data itself.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="300" Width="300">
    <Window.Resources>
        <CollectionViewSource x:Key="PeopleView" Source="{Binding People}" />
    </Window.Resources>
    <Grid>
        <ListBox ItemsSource="{Binding Source={StaticResource PeopleView}}" DisplayMemberPath="LastName" />
    </Grid>
</Window>
```

```csharp
using System.Collections.ObjectModel;
using System.Windows;

namespace WpfApp;

public partial class MainWindow : Window
{
    public ObservableCollection<Person> People { get; } = new();

    public MainWindow()
    {
        InitializeComponent();
        DataContext = this;
        
        People.Add(new Person { LastName = "Smith" });
        People.Add(new Person { LastName = "Adams" });
    }
}

public class Person
{
    public string LastName { get; set; } = string.Empty;
}
```

### Mechanical Walkthrough
- `ObservableCollection<Person> People { get; } = new();`: The raw data. This list dictates what exists in memory.
- `<CollectionViewSource x:Key="PeopleView" Source="{Binding People}" />`: This is created in the Window's Resources so it exists independently of any single visual control. It takes the `People` collection as its `Source`. It acts as a middleman.
- `ItemsSource="{Binding Source={StaticResource PeopleView}}"`: The `ListBox` no longer binds directly to `People`. Instead, it binds to the `CollectionViewSource` resource. The `ListBox` will ask this middleman for the items to display.

### CS Lens
This is an implementation of the Proxy pattern. The `CollectionViewSource` intercepts requests from the UI for the data. By controlling this interception point, the proxy can apply transformations (like sorting or filtering) before handing the data to the UI, while leaving the authoritative source of truth untouched.

### SE Lens
The alternative is manipulating the `ObservableCollection` directly—clearing it, sorting it, and re-adding items. This is computationally expensive, triggers UI updates for every single change, and destroys the original ordering. The proxy approach costs a small amount of memory to maintain the view indices, but separates the concern of "what the data is" from "how it looks."

### Run It Yourself
1. Create a new .NET 8 WPF Application named `WpfApp`.
2. Replace `MainWindow.xaml` with the XAML code above.
3. Replace `MainWindow.xaml.cs` with the C# code above.
4. Run the application. You will see "Smith" then "Adams". The middleman is currently passing the data straight through unmodified.

---

## Concept Unit: Sorting

### The Problem
You want the data in the UI to be sorted alphabetically by a specific property, like last name, and then by first name for any ties. You do not want to write sorting algorithms in your C# code or rearrange the items in your list.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:scm="clr-namespace:System.ComponentModel;assembly=WindowsBase"
        Title="MainWindow" Height="300" Width="300">
    <Window.Resources>
        <CollectionViewSource x:Key="PeopleView" Source="{Binding People}">
            <CollectionViewSource.SortDescriptions>
                <scm:SortDescription PropertyName="LastName" Direction="Ascending" />
                <scm:SortDescription PropertyName="FirstName" Direction="Ascending" />
            </CollectionViewSource.SortDescriptions>
        </CollectionViewSource>
    </Window.Resources>
    <Grid>
        <ListBox ItemsSource="{Binding Source={StaticResource PeopleView}}">
            <ListBox.ItemTemplate>
                <DataTemplate>
                    <TextBlock Text="{Binding StringFormat='{}{0}, {1}', Path=LastName, Path=FirstName}" />
                </DataTemplate>
            </ListBox.ItemTemplate>
        </ListBox>
    </Grid>
</Window>
```

```csharp
using System.Collections.ObjectModel;
using System.Windows;

namespace WpfApp;

public partial class MainWindow : Window
{
    public ObservableCollection<Person> People { get; } = new();

    public MainWindow()
    {
        InitializeComponent();
        DataContext = this;
        
        People.Add(new Person { FirstName = "John", LastName = "Smith" });
        People.Add(new Person { FirstName = "Zack", LastName = "Adams" });
        People.Add(new Person { FirstName = "Alice", LastName = "Adams" });
    }
}

public class Person
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}
```

### Mechanical Walkthrough
- `xmlns:scm="clr-namespace:System.ComponentModel;assembly=WindowsBase"`: The `SortDescription` class lives in the `System.ComponentModel` namespace. We map this namespace to the `scm` prefix in XAML so we can access it.
- `<CollectionViewSource.SortDescriptions>`: This collection holds the rules for sorting. The view applies these rules to the raw data before handing it to the UI.
- `<scm:SortDescription PropertyName="LastName" Direction="Ascending" />`: The primary sort rule. The view uses reflection to look at the `LastName` property of each item and orders them alphabetically A to Z. Without this, the view defaults to the insertion order.
- `<scm:SortDescription PropertyName="FirstName" Direction="Ascending" />`: The tiebreaker rule. Because it is second in the list, it only applies when the primary rule results in a tie (e.g., two people with the last name "Adams").

### CS Lens
Sorting is a foundational algorithmic task. By moving it to a declarative layer (XAML), you are instructing the framework *what* you want (sorted data) rather than *how* to do it (loops, comparisons, and swaps). The framework uses optimized internal sorting mechanisms to achieve the result.

### SE Lens
Sorting in XAML using magic strings for property names (`PropertyName="LastName"`) is brittle. If you rename the property in C#, the compiler will not catch the error in XAML, and it will fail at runtime. The alternative is configuring `SortDescriptions` in C# code where you can use the `nameof()` operator, providing compile-time safety at the cost of moving presentation logic out of the presentation file.

### Run It Yourself
1. Replace `MainWindow.xaml` and `MainWindow.xaml.cs` with the new code.
2. Run the application. 
3. The output order is: "Adams, Alice", "Adams, Zack", "Smith, John". The original list remains unsorted in memory.

---

## Concept Unit: Grouping

### The Problem
You have items that belong to distinct categories. You want the UI to visually cluster them together based on a shared property and render a header above each cluster, making it easier to read.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="300" Width="300">
    <Window.Resources>
        <CollectionViewSource x:Key="PeopleView" Source="{Binding People}">
            <CollectionViewSource.GroupDescriptions>
                <PropertyGroupDescription PropertyName="Department" />
            </CollectionViewSource.GroupDescriptions>
        </CollectionViewSource>
    </Window.Resources>
    <Grid>
        <ListBox ItemsSource="{Binding Source={StaticResource PeopleView}}" DisplayMemberPath="LastName">
            <ListBox.GroupStyle>
                <GroupStyle>
                    <GroupStyle.HeaderTemplate>
                        <DataTemplate>
                            <TextBlock Text="{Binding Name}" FontWeight="Bold" Background="LightGray" />
                        </DataTemplate>
                    </GroupStyle.HeaderTemplate>
                </GroupStyle>
            </ListBox.GroupStyle>
        </ListBox>
    </Grid>
</Window>
```

```csharp
using System.Collections.ObjectModel;
using System.Windows;

namespace WpfApp;

public partial class MainWindow : Window
{
    public ObservableCollection<Person> People { get; } = new();

    public MainWindow()
    {
        InitializeComponent();
        DataContext = this;
        
        People.Add(new Person { LastName = "Smith", Department = "IT" });
        People.Add(new Person { LastName = "Jones", Department = "HR" });
        People.Add(new Person { LastName = "Davis", Department = "IT" });
    }
}

public class Person
{
    public string LastName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
}
```

### Mechanical Walkthrough
- `<CollectionViewSource.GroupDescriptions>`: Holds the rules for bucketing items.
- `<PropertyGroupDescription PropertyName="Department" />`: Instructs the view to examine the `Department` property of each item. Every unique value it finds becomes a new group.
- `<ListBox.GroupStyle>`: Instructs the `ListBox` on how to visually render groups. Without this, the `ListBox` receives grouped data but renders it identically to a flat list, defeating the purpose.
- `Text="{Binding Name}"`: When styling a group header, the `DataContext` is automatically set to a special framework object representing the group. This object has a `Name` property containing the value that formed the group (e.g., "IT" or "HR").

### CS Lens
This is similar to the `GROUP BY` operation in SQL. It transforms a flat list of records into a hierarchical structure, where a single key maps to a collection of values.

### SE Lens
Grouping adds significant visual overhead. The UI framework must generate container visuals for the headers and calculate layouts differently. For small lists, this is trivial; for thousands of items, it can cause severe UI lag. The alternative is standard sorting without headers, relying on the user to visually parse where groups begin and end.

### Run It Yourself
1. Replace `MainWindow.xaml` and `MainWindow.xaml.cs` with the new code.
2. Run the application.
3. You will see an "IT" header in bold gray, followed by Smith and Davis, then an "HR" header, followed by Jones.

---

## Concept Unit: Filtering in Code

### The Problem
You want to hide certain items based on user input, like a search box, without deleting those items from your underlying list.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="300" Width="300">
    <Window.Resources>
        <CollectionViewSource x:Key="PeopleView" Source="{Binding People}" Filter="CollectionViewSource_Filter" />
    </Window.Resources>
    <StackPanel>
        <TextBox x:Name="SearchBox" TextChanged="SearchBox_TextChanged" Margin="5" />
        <ListBox ItemsSource="{Binding Source={StaticResource PeopleView}}" DisplayMemberPath="LastName" Height="200" />
    </StackPanel>
</Window>
```

```csharp
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;

namespace WpfApp;

public partial class MainWindow : Window
{
    public ObservableCollection<Person> People { get; } = new();

    public MainWindow()
    {
        InitializeComponent();
        DataContext = this;
        
        People.Add(new Person { LastName = "Smith" });
        People.Add(new Person { LastName = "Adams" });
        People.Add(new Person { LastName = "Anderson" });
    }

    private void CollectionViewSource_Filter(object sender, FilterEventArgs e)
    {
        if (e.Item is Person person)
        {
            string searchText = SearchBox.Text;
            e.Accepted = person.LastName.Contains(searchText, System.StringComparison.OrdinalIgnoreCase);
        }
    }

    private void SearchBox_TextChanged(object sender, TextChangedEventArgs e)
    {
        if (Resources["PeopleView"] is CollectionViewSource cvs)
        {
            cvs.View?.Refresh();
        }
    }
}

public class Person
{
    public string LastName { get; set; } = string.Empty;
}
```

### Mechanical Walkthrough
- `Filter="CollectionViewSource_Filter"`: Wires up an event handler. Unlike sorting and grouping, filtering requires custom logic, so it must be done in C#. The view fires this event for every single item in the source collection.
- `e.Item is Person person`: `e.Item` holds the raw object. We must safely cast it to our `Person` type to read its properties.
- `e.Accepted = ...`: This boolean determines visibility. If `true`, the item passes the filter and is shown. If `false`, it is hidden. If the search box is empty, `Contains` returns `true` for everything, effectively clearing the filter.
- `cvs.View?.Refresh()`: The view does not automatically know when to re-evaluate the filter. We must manually force it to re-run the filter logic across all items whenever the search text changes.

### CS Lens
This is a predicate function. It takes an input and returns true or false. The view iterates over the data, applies the predicate to each item, and builds a new list of references to only those items that passed. 

### SE Lens
Running filter logic on every keystroke (`TextChanged`) across a large collection will lock up the main UI thread, making typing feel unresponsive. The alternative is "debouncing"—starting a timer on each keystroke and only refreshing the view if the user stops typing for 300 milliseconds. This trades immediate filtering for a smooth typing experience.

### Run It Yourself
1. Replace `MainWindow.xaml` and `MainWindow.xaml.cs` with the new code.
2. Run the application. You will see all three names.
3. Type "A" in the text box. "Smith" will disappear.
4. Delete the "A". All three names will reappear.

---

## Connect the Pieces
Consider the `Person` object representing "Smith". When the application starts, it is added to the `ObservableCollection`. The `CollectionViewSource` takes notice. First, it checks the `Filter` event; "Smith" contains an empty string, so `e.Accepted` is true. Next, it looks at `SortDescriptions`; "Smith" is compared to the other objects and placed at the end. Finally, it looks at `GroupDescriptions`; it notes "Smith" belongs to the "IT" department. It then passes this sorted, grouped, and filtered instruction to the `ListBox`, which renders the final visual representation of "Smith".

## What Breaks Without This
If you try to declare a `SortDescription` without mapping the namespace in XAML, the application will not compile.
In `MainWindow.xaml` from the Sorting unit, remove `xmlns:scm="clr-namespace:System.ComponentModel;assembly=WindowsBase"`.
Change `<scm:SortDescription...>` to just `<SortDescription...>`.

Compile the program. You will receive an exact error:
`The type 'SortDescription' was not found. Verify that you are not missing an assembly reference and that all referenced assemblies have been built.`

Restore the namespace and the `scm:` prefixes to fix it.

## Exercises
1. In the Sorting unit, change the first `SortDescription` direction to `Descending`. Run it and observe the change.
2. In the Filtering unit, modify the C# code so that if the `SearchBox.Text` is empty, it bypasses the `Contains` check entirely and just sets `e.Accepted = true`.
3. In the Grouping unit, add a `SortDescription` to sort by `LastName` inside the `CollectionViewSource`. Run it to see that the view can group and sort simultaneously.

## Definition of Done
- [ ] You can explain what a view is in relation to a collection.
- [ ] You can sort a `ListBox` without changing the source list.
- [ ] You can render grouped headers over clustered data.
- [ ] You can write C# logic to filter items in or out of a view.
- [ ] You can explain CollectionViewSource out loud, in your own words, to someone who hasn't read this lesson.
