# Lesson 16: Data Binding Basics

**What you will build:** You will write C# and XAML that automatically syncs data between a background object and the user interface. This proves that you can separate the state of your application from the visual elements that display it, solving the problem of manually writing code to push data into UI controls or read data out of them.

**What you need to know first:** Lesson 01 (XAML Basics), Lesson 02 (The Window), Lesson 05 (Properties and Fields).

**Terms introduced in this lesson:**
- **Data Binding** — a declarative connection between a UI element property (target) and a data source property. *Why it exists:* It eliminates the tedious, error-prone boilerplate of manually copying data between the UI and backend logic.
- **DataContext** — a property on every UI element that acts as the default source object for all bindings on that element or its children. *Why it exists:* It allows a single tree of UI elements to automatically look up their data source without you having to explicitly wire every single binding to a specific object instance.

**Objects and methods used:**
- **FrameworkElement.DataContext**
  - *What it is:* An object property representing the data source for bindings.
  - *Implementation:* `public object DataContext { get; set; }`
  - *Its use:* You assign an instance of your data model to this property so the XAML bindings can find and read from it.
- **Binding**
  - *What it is:* A markup extension in XAML used to define a binding connection.
  - *Implementation:* `{Binding Path=PropertyName}`
  - *Its use:* Placed inside a XAML attribute value to tell WPF to retrieve the property's value from the current `DataContext`.

---

## Concept Unit: What a binding is

### The Problem
If you have a `Person` object in C# with a `Name` property, and a `TextBlock` in XAML to display that name, you usually have to write C# code like `MyTextBlock.Text = myPerson.Name;`. If the `TextBlock` is a `TextBox` and the user types a new name, you have to write an event handler to read `MyTextBox.Text` and update `myPerson.Name`. This manual copying of data back and forth is brittle and clutters your logic. We need a way to tell the UI to look at an object and get its value automatically.

### The New Code

```csharp
// Program.cs
using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;

public class Person
{
    public string Name { get; set; } = "Alice";
}

public class MainWindow : Window
{
    public MainWindow()
    {
        Person p = new Person();
        
        TextBlock textBlock = new TextBlock();
        
        // This is what {Binding Path=Name} does in XAML
        Binding binding = new Binding();
        binding.Source = p;
        binding.Path = new PropertyPath("Name");
        
        textBlock.SetBinding(TextBlock.TextProperty, binding);
        
        this.Content = textBlock;
    }
}

class Program
{
    [STAThread]
    static void Main()
    {
        Application app = new Application();
        app.Run(new MainWindow());
    }
}
```

### Mechanical Walkthrough
- `Person p = new Person();` — creates the actual object holding the data. It has a property `Name` set to `"Alice"`.
- `TextBlock textBlock = new TextBlock();` — creates the UI element that will display text on the screen.
- `Binding binding = new Binding();` — creates a binding configuration object. This represents the connection rules.
- `binding.Source = p;` — tells the binding exactly which C# object instance holds the data it needs to read.
- `binding.Path = new PropertyPath("Name");` — tells the binding which specific property on the `Source` object to look at.
- `textBlock.SetBinding(TextBlock.TextProperty, binding);` — applies the connection. It tells WPF: "Whenever you need the value for `TextBlock.Text`, evaluate this binding."

### CS Lens
This is an implementation of the Observer pattern and declarative programming. Instead of writing imperative statements (do this, then do that), you declare relationships (this property is inextricably linked to that property). The framework takes on the responsibility of querying the value when the UI renders.

### SE Lens
The alternative not chosen is direct imperative assignment (e.g., `textBlock.Text = person.Name;`). Direct assignment is cheaper computationally, but bindings scale much better as application complexity grows. The tradeoff is that bindings introduce reflection and runtime evaluation overhead, meaning binding errors often fail silently or at runtime rather than at compile time.

### Run It Yourself
1. Create a .NET 8 Console app: `dotnet new console -n BindingBasics`.
2. Edit `BindingBasics.csproj`: Change `<Project Sdk="Microsoft.NET.Sdk">` to `<Project Sdk="Microsoft.NET.Sdk.WindowsDesktop">` and add `<UseWPF>true</UseWPF>`.
3. Replace `Program.cs` with the code above.
4. Run with `dotnet run`.
5. Observe a window displaying "Alice".

---

## Concept Unit: DataContext

### The Problem
Setting `binding.Source` explicitly on every single `TextBlock`, `TextBox`, and `CheckBox` in a complex window is just as tedious as setting their values manually. We need a way to set the source object once for an entire section of the UI, allowing the individual bindings to automatically discover their data source.

### The New Code

```xml
<!-- MainWindow.xaml -->
<Window x:Class="DataContextExample.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="DataContext Demo" Height="200" Width="300">
    <StackPanel>
        <TextBlock Text="{Binding Name}" />
        <TextBlock Text="{Binding Age}" />
    </StackPanel>
</Window>
```

```csharp
// MainWindow.xaml.cs
using System.Windows;

namespace DataContextExample;

public class Person
{
    public string Name { get; set; } = "Bob";
    public int Age { get; set; } = 42;
}

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        
        Person bob = new Person();
        this.DataContext = bob;
    }
}
```

### Mechanical Walkthrough
- `{Binding Name}` — in XAML, this is a markup extension that creates a `Binding` object. It omits the `Source`. Because there is no explicit `Source`, WPF searches up the visual tree for the first inherited `DataContext`.
- `this.DataContext = bob;` — assigns the `Person` instance to the `Window`'s `DataContext` property.
- The `StackPanel` inherits the `DataContext` from the `Window`.
- The two `TextBlock` elements inherit the `DataContext` from the `StackPanel`. When `{Binding Name}` executes, it uses `bob` as the implicit source, finding `bob.Name` and `bob.Age`.

### CS Lens
This is environment propagation or lexical scoping applied to a UI tree. Just as a variable defined in an outer block of code is accessible to inner blocks, a data context applied to an outer container is accessible to all nested children.

### SE Lens
The alternative not chosen is passing the data object to the constructor of every single UI control. The `DataContext` approach drastically reduces coupling; the `StackPanel` has no idea what a `Person` is, it merely acts as a conduit for passing the context downward. The cost is that looking at the XAML alone does not guarantee what type of object `DataContext` holds, requiring developers to trace back to the code-behind to understand what `{Binding Name}` actually means.

### Run It Yourself
1. Create a WPF project: `dotnet new wpf -n DataContextDemo`.
2. Replace `MainWindow.xaml` and `MainWindow.xaml.cs` with the code above.
3. Run with `dotnet run`.
4. Observe a window displaying "Bob" and "42" on separate lines.

---

## Concept Unit: Binding Modes

### The Problem
Bindings can be unidirectional or bidirectional. A `TextBlock` only displays data; it never modifies it. But a `TextBox` accepts user input. If the user types in the `TextBox`, we want the underlying C# object to update automatically. We need a way to dictate the direction of data flow in a binding.

### The New Code

```xml
<!-- MainWindow.xaml -->
<Window x:Class="BindingModes.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Binding Modes" Height="200" Width="300">
    <StackPanel>
        <!-- OneWay: Object -> UI -->
        <TextBlock Text="{Binding Name, Mode=OneWay}" />
        
        <!-- TwoWay: Object <-> UI -->
        <TextBox Text="{Binding Name, Mode=TwoWay}" />
        
        <Button Content="Show Object State" Click="Button_Click" />
    </StackPanel>
</Window>
```

```csharp
// MainWindow.xaml.cs
using System.Windows;

namespace BindingModes;

public class Person
{
    public string Name { get; set; } = "Charlie";
}

public partial class MainWindow : Window
{
    private Person _person;

    public MainWindow()
    {
        InitializeComponent();
        _person = new Person();
        this.DataContext = _person;
    }

    private void Button_Click(object sender, RoutedEventArgs e)
    {
        MessageBox.Show($"The object's Name is: {_person.Name}");
    }
}
```

### Mechanical Walkthrough
- `Mode=OneWay` — forces data to flow only from the C# object to the UI. If the UI changes (which `TextBlock` cannot do anyway), the object is untouched. (This is the default mode for `TextBlock.Text`).
- `Mode=TwoWay` — forces data to flow from the C# object to the UI initially, and then from the UI back to the C# object whenever the user modifies the UI control. (This is the default mode for `TextBox.Text`).
- `TextBox Text="{Binding Name, Mode=TwoWay}"` — because it is `TwoWay`, typing into the text box writes the new string into `_person.Name`.
- `MessageBox.Show(...)` — proves that the background C# object was actually modified by the `TextBox`, bypassing any manual event wiring.

### CS Lens
This is state synchronization. You have two representations of data (memory and pixel display) that must be kept consistent. `OneWay` enforces a single source of truth. `TwoWay` allows mutations from multiple boundaries, requiring synchronization logic beneath the hood to keep them aligned.

### SE Lens
The alternative not chosen is wiring a `TextChanged` event on the `TextBox` to manually update `_person.Name`. `TwoWay` binding avoids the boilerplate. The tradeoff is implicit side effects; merely typing in a box modifies a C# object, which might trigger unintended logic if property setters have validation or side effects.

### Run It Yourself
1. Create a WPF project: `dotnet new wpf -n ModesDemo`.
2. Replace the XAML and C# code as shown.
3. Run with `dotnet run`.
4. Type "Charles" into the `TextBox`. Note that the `TextBlock` above it *does not* update (we will cover property change notifications in a future lesson).
5. Click the button. Observe the message box shows "Charles", proving the C# object was modified.

---

## Concept Unit: UpdateSourceTrigger

### The Problem
When using a `TwoWay` binding on a `TextBox`, WPF must decide *when* to write the data back to the C# object. If it writes on every single keystroke, it might trigger expensive calculations prematurely. If it waits until the user clicks away, the underlying object is stale while the user is typing. We need to control this timing.

### The New Code

```xml
<!-- MainWindow.xaml -->
<Window x:Class="Triggers.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Triggers Demo" Height="200" Width="300">
    <StackPanel>
        <!-- Updates object when focus is lost (the default) -->
        <TextBox Text="{Binding Name, UpdateSourceTrigger=LostFocus}" />
        
        <!-- Updates object immediately on every keystroke -->
        <TextBox Text="{Binding Name, UpdateSourceTrigger=PropertyChanged}" />
        
        <Button Content="Show Object State" Click="Button_Click" />
    </StackPanel>
</Window>
```

```csharp
// MainWindow.xaml.cs
using System.Windows;

namespace Triggers;

public class Person
{
    public string Name { get; set; } = "Diana";
}

public partial class MainWindow : Window
{
    private Person _person;

    public MainWindow()
    {
        InitializeComponent();
        _person = new Person();
        this.DataContext = _person;
    }

    private void Button_Click(object sender, RoutedEventArgs e)
    {
        MessageBox.Show($"The object's Name is: {_person.Name}");
    }
}
```

### Mechanical Walkthrough
- `UpdateSourceTrigger=LostFocus` — tells the binding to wait until the `TextBox` loses input focus (e.g., the user clicks a different control) before updating `_person.Name`. This is the default for `TextBox.Text`.
- `UpdateSourceTrigger=PropertyChanged` — tells the binding to update `_person.Name` instantaneously every time the UI property changes (which for a `TextBox` means every single keystroke).
- The behavior difference is observed by typing in the box and clicking the button without changing focus (though clicking the button changes focus, so testing requires care — use a shortcut key or a timer to verify, or simply rely on the understanding of the timing).

### CS Lens
This is buffering versus streaming. `LostFocus` buffers the input state in the UI until a logical break in interaction, committing the batch. `PropertyChanged` streams the state mutations instantly.

### SE Lens
The alternative not chosen is fixing the behavior in the framework. WPF makes it configurable because immediate updates (`PropertyChanged`) provide snappy UI feedback (like live search filters) but cause performance drops if the object setter triggers database saves. `LostFocus` is safer for heavy operations but causes bugs if a user clicks a "Save" toolbar button that doesn't steal focus from the text box, resulting in the object saving its old stale value.

### Run It Yourself
1. Create a WPF project: `dotnet new wpf -n TriggersDemo`.
2. Replace code with the above.
3. Run it. Type in the first box. The object updates when you click away. Type in the second box, it updates constantly (hard to see without breakpoints on a setter, but conceptually verifiable).

---

## Connect the Pieces
When the application starts, `Person p` is instantiated. `DataContext` is set to `p`. The framework parses the XAML. It finds a `TextBox` with `{Binding Name, Mode=TwoWay, UpdateSourceTrigger=PropertyChanged}`. It walks up the tree, finds `p` as the `DataContext`, reads `p.Name`, and renders it. The user presses a key. Because the trigger is `PropertyChanged` and the mode is `TwoWay`, WPF immediately takes the character, reflection-calls `p.Name = newString`, updating the underlying object.

## What Breaks Without This
If you specify a binding path that does not exist on the `DataContext`, the application will compile, run, and display nothing.

To see this failure:
Change `<TextBlock Text="{Binding Name}" />` to `<TextBlock Text="{Binding FirstName}" />` where `Person` only has a `Name` property.

Compile and run.
**Failure:** No error is thrown. The UI simply appears blank. If you look at the Output window in Visual Studio (or attach a debugger), you will see a silent warning:
`System.Windows.Data Error: 40 : BindingExpression path error: 'FirstName' property not found on 'object' ''Person' ...`

Restore it by fixing the property name back to `Name`.

## Exercises
1. Add a second property `public string Title { get; set; }` to the `Person` class. Add a `TextBlock` to the XAML bound to `Title`. Verify it displays when you set the value in the constructor.
2. Change the `TextBox` binding mode to `OneWay`. Run the program, type into the `TextBox`, and click the button to show the state. Verify that the C# object no longer updates.
3. Create a `CheckBox` and bind its `IsChecked` property to a `public bool IsAdmin { get; set; }` property. Observe how data binding works for non-string properties automatically.

## Definition of Done
- You have created a .NET 8 WPF project demonstrating `DataContext`.
- You have bound a `TextBox` to a string property using `TwoWay` mode.
- You have observed a silent binding failure in the Output window by misspelling a property path.
- You can explain data binding, `DataContext`, and `UpdateSourceTrigger` out loud, in your own words, to someone who hasn't read this lesson.
