# Lesson 21: Data Templates

**What you will build:** You will build a set of isolated WPF views that prove how WPF transforms raw C# objects into visual elements. Instead of accepting WPF's default behavior of printing the type name of your data objects, you will construct custom visual templates that define exactly how a `Person` object should be rendered, whether in a list or as a standalone piece of content.

**What you need to know first:** Lesson 19 (Data Binding), Lesson 20 (Items Controls).

**Terms introduced in this lesson:**
- **Data Templating** — the mechanism by which raw data objects are mapped to a tree of visual elements. *Why it exists:* UI frameworks need a way to bridge the gap between arbitrary business logic objects (like a `Person`) and visual controls (like a `TextBlock`) without forcing the data objects to inherit from visual classes.

**Objects and methods used:**
- **DataTemplate**
  - *What it is:* A recipe describing a tree of WPF controls to instantiate when presenting a specific piece of data.
  - *Implementation:* `<DataTemplate DataType="{x:Type local:Person}"> ... </DataTemplate>`
  - *Its use:* Tells WPF how to draw an object that isn't a visual control.
- **ContentControl.ContentTemplate**
  - *What it is:* A property that holds a `DataTemplate` for rendering a single object.
  - *Implementation:* `<ContentControl ContentTemplate="{StaticResource MyTemplate}" />`
  - *Its use:* Controls the visual presentation of a single data item bound to the `Content` property.
- **ItemsControl.ItemTemplate**
  - *What it is:* A property that holds a `DataTemplate` for rendering each item in a collection.
  - *Implementation:* `<ListBox ItemTemplate="{StaticResource MyTemplate}" />`
  - *Its use:* Controls the visual presentation of elements generated within a list.

---

## Concept Unit: The Problem with Raw Data

### The Problem
When you bind a collection of custom C# objects (like a `Person` class) directly to a list control, WPF must figure out how to draw them. Because a `Person` is not a visual element, WPF does not inherently know what properties to display or how to arrange them. Its fallback behavior is to simply call the `ToString()` method on the object and display the resulting string in a standard text block. Unless overridden, `ToString()` returns the fully qualified type name of the object.

### The New Code
```xml
<!-- MainWindow.xaml -->
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="The Problem" Height="200" Width="300">
    <Grid>
        <ListBox Name="PeopleList" />
    </Grid>
</Window>
```

```csharp
// MainWindow.xaml.cs
using System.Windows;
using System.Collections.Generic;

namespace WpfApp;

public class Person
{
    public required string Name { get; set; }
    public int Age { get; set; }
}

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        PeopleList.ItemsSource = new List<Person>
        {
            new Person { Name = "Alice", Age = 30 },
            new Person { Name = "Bob", Age = 45 }
        };
    }
}
```

### Mechanical Walkthrough
- `public class Person`: Defines a raw data object with no visual information.
- `PeopleList.ItemsSource = ...`: Binds a list of `Person` objects to the `ListBox`.
- `<ListBox Name="PeopleList" />`: The visual control that receives the data items. Because no instructions are given on how to draw a `Person`, it generates an internal `TextBlock` and sets its text to `Alice.ToString()` and `Bob.ToString()`, resulting in the display of "WpfApp.Person" for both entries.

### CS Lens
This is the default string representation of an object. In strongly typed systems, when a generic rendering engine encounters an opaque pointer or reference to an unknown type, it falls back to the most universal interface available—in C#, the `Object.ToString()` virtual method inherited by all types.

### SE Lens
The framework chooses safety and visibility over failure. The alternative is crashing when handed a non-visual object, which would force developers to manually map every object to a UI element in code-behind. By falling back to `ToString()`, WPF guarantees something appears on screen, giving the developer a clear signal that the data is bound correctly but lacks a rendering definition.

### Run It Yourself
1. Create a new .NET 8 WPF Application named `WpfApp`.
2. Replace `MainWindow.xaml` and `MainWindow.xaml.cs` with the code above.
3. Run the application.
4. You will see a list with two items, both displaying "WpfApp.Person".

---

## Concept Unit: Creating a DataTemplate

### The Problem
We need to explicitly instruct WPF on how to transform a `Person` object into a set of visual controls, extracting specific properties like `Name` and `Age` and arranging them in a layout.

### The New Code
```xml
<!-- MainWindow.xaml -->
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:local="clr-namespace:WpfApp"
        Title="Data Template" Height="200" Width="300">
    <Window.Resources>
        <DataTemplate x:Key="PersonTemplate" DataType="{x:Type local:Person}">
            <StackPanel Orientation="Horizontal">
                <TextBlock Text="{Binding Name}" FontWeight="Bold" Margin="0,0,10,0" />
                <TextBlock Text="{Binding Age}" />
            </StackPanel>
        </DataTemplate>
    </Window.Resources>

    <Grid>
        <ListBox Name="PeopleList" ItemTemplate="{StaticResource PersonTemplate}" />
    </Grid>
</Window>
```

```csharp
// MainWindow.xaml.cs
// (Keep the same C# code as the previous unit)
```

### Mechanical Walkthrough
- `xmlns:local="clr-namespace:WpfApp"`: Maps the C# namespace to a XAML prefix so the XAML parser can locate the `Person` class.
- `<DataTemplate x:Key="PersonTemplate" DataType="{x:Type local:Person}">`: Defines the reusable recipe for drawing the object. `DataType` informs the design-time tools what type of object this template is for, enabling Intellisense for bindings.
- `<StackPanel Orientation="Horizontal">`: The root visual element that WPF will stamp out for each `Person` in the list.
- `{Binding Name}` and `{Binding Age}`: Because the `DataTemplate` implicitly receives the specific `Person` instance as its `DataContext`, these bindings resolve directly against the properties of that instance.
- `ItemTemplate="{StaticResource PersonTemplate}"`: Tells the `ListBox` to stop using `ToString()` and instead use this specific recipe to construct the visual tree for every item in its `ItemsSource`.

### CS Lens
This is the separation of Model from View. The `Person` class (Model) knows nothing about UI. The `DataTemplate` (View definition) knows how to interpret the Model. The `ListBox` acts as the engine that stamps out the View, wiring the specific Model instance into the View's data context at runtime.

### SE Lens
The alternative is tightly coupling data and UI by creating a `PersonViewModel` that inherits from `UIElement`, or manually generating `StackPanel` objects in C# and adding them to the list. Templating keeps your UI definitions declarative and contained entirely in XAML, making them trivial to swap out or restyle without recompiling business logic.

### Run It Yourself
1. Update `MainWindow.xaml` with the new XAML.
2. Run the application.
3. You will see "Alice 30" and "Bob 45", with the names in bold.

---

## Concept Unit: Implicit Templates vs Explicit ItemTemplates

### The Problem
If you have multiple lists of `Person` objects across different windows, explicitly assigning `ItemTemplate="{StaticResource PersonTemplate}"` to every single list becomes repetitive and brittle. We need a way to declare a universal rule: "Whenever you encounter a `Person` anywhere, render it like this."

### The New Code
```xml
<!-- MainWindow.xaml -->
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:local="clr-namespace:WpfApp"
        Title="Implicit Templates" Height="300" Width="300">
    <Window.Resources>
        <!-- Notice there is no x:Key -->
        <DataTemplate DataType="{x:Type local:Person}">
            <Border BorderBrush="Blue" BorderThickness="1" Margin="2" Padding="5">
                <TextBlock Text="{Binding Name}" />
            </Border>
        </DataTemplate>
    </Window.Resources>

    <StackPanel>
        <TextBlock Text="List 1:" />
        <!-- Notice there is no ItemTemplate assigned -->
        <ListBox Name="List1" Height="100" />
        
        <TextBlock Text="List 2:" />
        <ListBox Name="List2" Height="100" />
    </StackPanel>
</Window>
```

```csharp
// MainWindow.xaml.cs
using System.Windows;
using System.Collections.Generic;

namespace WpfApp;

// (Keep the Person class the same)

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        var people = new List<Person>
        {
            new Person { Name = "Alice", Age = 30 },
            new Person { Name = "Bob", Age = 45 }
        };
        
        List1.ItemsSource = people;
        List2.ItemsSource = people;
    }
}
```

### Mechanical Walkthrough
- `<DataTemplate DataType="{x:Type local:Person}">`: We removed the `x:Key` property. When a template in a Resource Dictionary has a `DataType` but no `x:Key`, it becomes an *implicit data template*.
- `<ListBox Name="List1" ... />`: The `ListBox` receives `Person` objects but has no `ItemTemplate` specified.
- WPF's Resolution Engine: When WPF needs to draw a `Person`, it searches up the visual tree for an implicit template matching that exact type. It finds our template in `Window.Resources` and applies it automatically to both `List1` and `List2`.

### CS Lens
This is type-based polymorphic rendering. The framework maintains a dictionary keyed by system types (`System.Type`), mapped to rendering instructions. This is analogous to how dynamic dispatch resolves method implementations at runtime based on the actual type of an object.

### SE Lens
Implicit templates (no `x:Key`) are best for globally consistent domain objects—ensuring a `User` looks the same everywhere in the app. Explicit templates (with `x:Key` and `ItemTemplate`) are necessary when the same data must be visualized differently depending on context, such as a detailed list view vs a compact dropdown view of the same objects. The tradeoff of implicit templates is that the binding between data and UI becomes invisible in the local XAML, making it slightly harder for new developers to track down where the UI is defined.

### Run It Yourself
1. Update `MainWindow.xaml` and `MainWindow.xaml.cs`.
2. Run the application.
3. Both lists will automatically render the items inside blue borders, proving the implicit template applied globally.

---

## Concept Unit: Templating Single Objects with ContentControl

### The Problem
`DataTemplate`s are not just for lists. Sometimes you have a single object property on your view model (like a `SelectedPerson`) and you want to render it using a specific template. You cannot use a `ListBox` for a single item.

### The New Code
```xml
<!-- MainWindow.xaml -->
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:local="clr-namespace:WpfApp"
        Title="Content Control" Height="200" Width="300">
    <Window.Resources>
        <DataTemplate x:Key="DetailedPersonTemplate" DataType="{x:Type local:Person}">
            <StackPanel Background="LightGray" Padding="10">
                <TextBlock Text="USER PROFILE" FontSize="10" Foreground="Gray" />
                <TextBlock Text="{Binding Name}" FontSize="20" />
                <TextBlock Text="{Binding Age, StringFormat=Age: \{0\}}" />
            </StackPanel>
        </DataTemplate>
    </Window.Resources>

    <Grid>
        <!-- ContentControl is used for single items -->
        <ContentControl Name="SinglePersonViewer" 
                        ContentTemplate="{StaticResource DetailedPersonTemplate}" 
                        HorizontalAlignment="Center" 
                        VerticalAlignment="Center"/>
    </Grid>
</Window>
```

```csharp
// MainWindow.xaml.cs
using System.Windows;

namespace WpfApp;

// (Keep the Person class the same)

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        
        // Assign a single object to Content, not a list to ItemsSource
        SinglePersonViewer.Content = new Person { Name = "Charlie", Age = 25 };
    }
}
```

### Mechanical Walkthrough
- `ContentControl`: The base class for controls that display a single piece of arbitrary content. (A `Window` and a `Button` are actually `ContentControl`s).
- `SinglePersonViewer.Content = ...`: We assign a single `Person` object to the `Content` property.
- `ContentTemplate="{StaticResource DetailedPersonTemplate}"`: We explicitly tell the `ContentControl` how to render its single `Content` object. It uses the `DataTemplate` exactly as a list would, wiring Charlie into the `DataContext` of the `StackPanel`.

### CS Lens
This is the Strategy Pattern applied to rendering. The `ContentControl` handles layout, alignment, and container logic, but delegates the actual structural rendering of the payload to an injected strategy (the `DataTemplate`).

### SE Lens
Using a `ContentControl` with a `DataTemplate` is how large WPF applications implement navigation and modularity. Instead of putting massive grids of UI into the main window, the main window contains a `ContentControl` bound to a "CurrentViewModel" property. Implicit templates automatically swap out the entire UI on screen whenever the underlying ViewModel object changes.

### Run It Yourself
1. Update `MainWindow.xaml` and `MainWindow.xaml.cs`.
2. Run the application.
3. You will see a single gray box displaying Charlie's profile.

---

## Connect the Pieces
A `Person` object is instantiated in C#. It is assigned either to an `ItemsSource` (list) or `Content` (single). The WPF rendering engine encounters the raw object. It checks if an explicit template (`ItemTemplate` or `ContentTemplate`) was provided. If not, it checks the resource dictionary for an implicit template matching the `DataType`. Once a `DataTemplate` is found, WPF constructs the visual tree defined inside the template, sets the `DataContext` of that new tree to the specific `Person` instance, and evaluates all `{Binding}` statements against it.

## What Breaks Without This
If you specify a `DataType` on a `DataTemplate`, but the bindings inside the template ask for properties that don't exist on that type, it will fail silently at runtime.

Modify the template in the second unit to bind to a non-existent property:
```xml
<TextBlock Text="{Binding FavoriteColor}" />
```

Run the application. The application will not crash, nor will the compiler complain (XAML is loosely bound). The text block will simply be empty. If you look at the Output window in Visual Studio while debugging, you will see a data binding error:
`System.Windows.Data Error: 40 : BindingExpression path error: 'FavoriteColor' property not found on 'object' ''Person' (HashCode=...)'`

Change it back to `{Binding Name}` to restore the UI.

## Exercises
1. Modify the `ContentControl` example so that it does not use the explicit `ContentTemplate="{StaticResource DetailedPersonTemplate}"` property, but instead relies on an implicit data template to render Charlie.
2. Add a `bool IsActive` property to the `Person` class. Update the `DataTemplate` to include a `CheckBox` bound to `IsActive`. Prove that changing the checkbox updates the underlying object (you may need to review two-way binding or click handlers to prove the data changed).
3. Bind a `ListBox` and a `ContentControl` to the same list of people, but assign different explicit templates to each.

## Definition of Done
- [ ] You have run all four concept units and verified their outputs.
- [ ] You have seen WPF's default `ToString()` behavior.
- [ ] You understand the difference between an explicit template (assigned by `x:Key`) and an implicit template (resolved by `DataType`).
- [ ] You understand that `ItemTemplate` is for collections, and `ContentTemplate` is for single objects.
- [ ] You can explain Data Templates out loud, in your own words, to someone who hasn't read this lesson.
