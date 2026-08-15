# Lesson 24: MVVM

**What you will build:** A complete structural separation of user interface from application logic using the Model-View-ViewModel pattern. You will build a three-layer counter application where the visual buttons and text blocks know nothing about the counting logic, and the counting logic knows nothing about the screen, connected only by data binding.

**What you need to know first:** Lesson 21 (Data Binding), Lesson 22 (INotifyPropertyChanged), Lesson 23 (ICommand).

**Terms introduced in this lesson:**
- **MVVM (Model-View-ViewModel)** — A structural pattern that separates an application into three specific layers. *Why it exists:* To allow UI code and logic code to evolve, compile, and be tested independently.
- **Model** — The pure data and domain logic of an application. *Why it exists:* To hold the fundamental state of the application without caring how it is displayed or manipulated.
- **View** — The visual elements of an application, typically written in XAML. *Why it exists:* To present information to the user and capture user input.
- **ViewModel** — An intermediary object that wraps the Model, exposes data for the View to bind to, and provides Commands for the View to execute. *Why it exists:* To translate internal application state into a format suitable for presentation, without referencing UI components directly.

**Objects and methods used:**
- **DataContext**
  - *What it is:* A property on `FrameworkElement` that serves as the default source for all data bindings within that element and its children.
  - *Implementation:* `public object DataContext { get; set; }`
  - *Its use:* Assigning a ViewModel instance to the View's `DataContext` to establish the MVVM connection.

---

## Concept Unit: What MVVM Is

### The Problem
When application logic (like calculating a total) and UI logic (like turning a text block red) live in the same file (the code-behind), they become tangled. You cannot test the calculation without also launching the window. You cannot change the visual layout without risking breaking the calculation. You need a formal boundary between the visual components and the computational components.

### The New Code
```csharp
// The Model: Pure data, no UI dependency.
public class CounterModel
{
    public int Value { get; set; } = 0;
}
```

This represents the raw domain.

```csharp
// The ViewModel: Formats data for binding, exposes actions, implements INotifyPropertyChanged.
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using System;

public class CounterViewModel : INotifyPropertyChanged
{
    private readonly CounterModel _model = new CounterModel();
    
    public int Count
    {
        get => _model.Value;
        set
        {
            if (_model.Value != value)
            {
                _model.Value = value;
                OnPropertyChanged();
            }
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;
    protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
```

This acts as the bridge.

```xml
<!-- The View: Only visuals and bindings. -->
<Window x:Class="MvvmDemo.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MVVM" Height="200" Width="300">
    <StackPanel>
        <TextBlock Text="{Binding Count}" FontSize="48" HorizontalAlignment="Center"/>
    </StackPanel>
</Window>
```

### Mechanical Walkthrough
- `public class CounterModel` defines a class that knows nothing about `INotifyPropertyChanged` or WPF. It is just C# data.
- `CounterViewModel` wraps the model. It reads from and writes to `_model.Value`. Because the UI needs to know when the value changes, the ViewModel implements `INotifyPropertyChanged`.
- `public int Count` exposes the model's value to the View. The setter updates the model and fires the change notification. This isolates the model from the notification mechanics.
- `<TextBlock Text="{Binding Count}" />` creates a data binding. The View knows it expects an object with a `Count` property, but it does not know what a `CounterViewModel` is.

### CS Lens
This is the principle of Separation of Concerns applied to architecture. By slicing the system into layers with strict rules about who can talk to whom (View knows about ViewModel, ViewModel knows about Model, Model knows about nothing else), you restrict the blast radius of changes. Similar layering occurs in network protocols (the OSI model), where the physical transmission layer knows nothing about the HTTP application layer on top of it.

### SE Lens
The architectural principle at work is the Dependency Rule. Dependencies must point inward toward the core logic. The View depends on the ViewModel, but the ViewModel does not depend on the View. This prevents circular references and allows the inner layers to outlive the outer layers. You could replace the WPF View with a console interface, and the ViewModel and Model would not need to change. The cost is boilerplate: you must create three files instead of one, and write pass-through properties.

### Run It Yourself
You cannot run this isolated snippet yet, as it lacks a command to change the state and the glue to connect the View to the ViewModel. We will assemble the complete running application in the next concept unit.

---

## Concept Unit: A Complete Example

### The Problem
You have a Model, a ViewModel, and a View. To make them function as an application, you must provide a way for the user to trigger actions (without writing click handlers in the code-behind) and you must inject the ViewModel into the View so the bindings resolve.

### The New Code
```csharp
using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Input;

namespace MvvmDemo;

// 1. The Model
public class CounterModel
{
    public int Value { get; set; } = 0;
}

// 2. A simple ICommand implementation for the ViewModel
public class RelayCommand : ICommand
{
    private readonly Action _execute;
    public RelayCommand(Action execute) => _execute = execute;
    public event EventHandler? CanExecuteChanged;
    public bool CanExecute(object? parameter) => true;
    public void Execute(object? parameter) => _execute();
}

// 3. The ViewModel
public class CounterViewModel : INotifyPropertyChanged
{
    private readonly CounterModel _model = new CounterModel();
    
    public int Count
    {
        get => _model.Value;
        set
        {
            if (_model.Value != value)
            {
                _model.Value = value;
                OnPropertyChanged();
            }
        }
    }

    public ICommand IncrementCommand { get; }

    public CounterViewModel()
    {
        IncrementCommand = new RelayCommand(() =>
        {
            Count++;
        });
    }

    public event PropertyChangedEventHandler? PropertyChanged;
    protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}

// 4. The View Code-Behind
public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        this.DataContext = new CounterViewModel();
    }
}
```

The corresponding XAML file (`MainWindow.xaml`):
```xml
<Window x:Class="MvvmDemo.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MVVM Counter" Height="200" Width="300">
    <StackPanel VerticalAlignment="Center" HorizontalAlignment="Center">
        <TextBlock Text="{Binding Count}" FontSize="48" HorizontalAlignment="Center" Margin="0,0,0,20"/>
        <Button Content="Increment" Command="{Binding IncrementCommand}" Padding="20,10"/>
    </StackPanel>
</Window>
```

### Mechanical Walkthrough
- `public ICommand IncrementCommand { get; }` declares an action the View can trigger. It is initialized in the constructor.
- `Count++` inside the command executes the logic. This updates the `Count` property, which updates `_model.Value`, which fires `OnPropertyChanged`, which notifies the View to update the screen.
- `this.DataContext = new CounterViewModel();` in the `MainWindow` constructor is the glue. It creates the ViewModel and assigns it to the window. Now, every binding in the XAML resolves against this specific ViewModel instance.
- `Command="{Binding IncrementCommand}"` in the XAML connects the button click directly to the ViewModel's command, entirely bypassing the code-behind events.

### CS Lens
This is the Observer pattern combined with the Command pattern. The View observes the ViewModel for state changes. The View executes Commands on the ViewModel to mutate state. The flow of data is unidirectional at any given moment: user input flows inward via commands, state changes flow outward via notifications.

### SE Lens
We have achieved zero logic in the View's code-behind. The `MainWindow.xaml.cs` file contains only the auto-generated `InitializeComponent()` and the assignment of the `DataContext`. If you delete the XAML file entirely, the application logic (`CounterViewModel` and `CounterModel`) still compiles and functions perfectly in memory.

### Run It Yourself
1. Create a new WPF project: `dotnet new wpf -n MvvmDemo`.
2. Replace `MainWindow.xaml.cs` with the C# code provided.
3. Replace `MainWindow.xaml` with the XAML code provided.
4. Run with `dotnet run`.
5. Click the "Increment" button. The number will increase.

---

## Concept Unit: Why the Separation Matters

### The Problem
You have separated the code, but you paid a price in boilerplate. Why is this separation valuable enough to justify the extra files and command implementations?

### The New Code
```csharp
using System;

namespace MvvmDemo.Tests;

public class ViewModelTests
{
    public static void RunTest()
    {
        // Arrange: Create the ViewModel in memory. No Window is opened.
        var vm = new CounterViewModel();
        
        // Act: Simulate the user clicking the button by executing the command directly.
        vm.IncrementCommand.Execute(null);
        
        // Assert: Verify the logic worked.
        if (vm.Count != 1)
        {
            throw new Exception($"Test failed! Expected 1, got {vm.Count}");
        }
        
        Console.WriteLine("Test passed: Increment logic is correct.");
    }
}
```

### Mechanical Walkthrough
- `var vm = new CounterViewModel();` creates the core application object. Because `CounterViewModel` does not inherit from `Window` or `UserControl`, we can instantiate it without starting the WPF rendering engine.
- `vm.IncrementCommand.Execute(null);` triggers the exact same logic that the button triggers in the UI.
- `if (vm.Count != 1)` reads the exact property the XAML `TextBlock` binds to.
- This code tests the entire interaction flow—from action to state update—without requiring a mouse, a screen, or a UI framework.

### CS Lens
This demonstrates decoupled architecture. By removing the hard dependency on a specific runtime environment (the graphical desktop), the module becomes portable. You are running UI logic in a headless state. This is identical to how web backend frameworks allow you to test HTTP endpoints by sending raw request objects without spinning up an actual network server.

### SE Lens
Unit testing UI code-behind is notoriously difficult, often requiring specialized UI automation tools that are slow and flaky. MVVM allows you to test 95% of your application's behavior using standard, lightning-fast unit tests. You only leave the View (the XAML) untested, relying on the assumption that if the ViewModel exposes the right properties, the bindings will render correctly.

### Run It Yourself
1. In the same project, add this class to a new file or at the bottom of your C# file.
2. Temporarily change your `App.xaml` to not set a StartupUri, or define a `static void Main` method in a Console project that references your ViewModel.
3. Call `ViewModelTests.RunTest();`.
4. The console will output `Test passed: Increment logic is correct.`.

---

## Concept Unit: What MVVM Does Not Solve

### The Problem
Architectural patterns are often treated as silver bullets. MVVM is powerful, but it has boundaries, limitations, and failure modes.

### The New Code
```csharp
// BAD PRACTICE: Violating MVVM principles
public class BadCounterViewModel
{
    public void Reset()
    {
        // This ViewModel knows about UI classes!
        var result = System.Windows.MessageBox.Show("Are you sure?");
        if (result == System.Windows.MessageBoxResult.Yes)
        {
            // Reset logic
        }
    }
}
```

### Mechanical Walkthrough
- `System.Windows.MessageBox.Show` directly invokes a visual, blocking window from the OS.
- Because this ViewModel now references `MessageBox`, it cannot be unit tested headlessly. A test runner executing this code will literally halt and display a pop-up window waiting for a user to click "OK".
- This code defeats the entire purpose of MVVM, even though the file is named "ViewModel".

### CS Lens
A pattern is a set of constraints. When you violate the constraints, you lose the guarantees of the pattern. MVVM guarantees UI-independence *if and only if* you do not import UI libraries into the ViewModel.

### SE Lens
MVVM adds structural overhead. For a two-screen utility application that will never be unit tested and will only be maintained by one person for a week, MVVM is often unnecessary engineering. The honest tradeoff is that MVVM pays off when testability matters, when teams scale (one person designs the XAML, another writes the C#), and when applications grow complex. Do not blindly apply MVVM to every project; weigh the cost of boilerplate against the need for decoupled testing.

### Run It Yourself
You do not need to run this code; it exists to demonstrate a structural violation. If you did run it in a unit test, the test would hang indefinitely.

---

## Connect the Pieces
Consider the flow of data when a user clicks the "Increment" button in our complete example:
1. The user's mouse click is intercepted by the WPF `Button` (View).
2. The `Button` inspects its `Command` binding and calls `Execute(null)` on the `RelayCommand`.
3. The `RelayCommand` invokes the lambda function defined in `CounterViewModel`.
4. The lambda executes `Count++`, hitting the `Count` property setter.
5. The setter updates `_model.Value` (Model) to `1`.
6. The setter calls `OnPropertyChanged("Count")`.
7. The `TextBlock` (View), listening to that event, reads the new `Count` value (`1`) and updates the screen.
The View triggered the action and displayed the result, but the logic happened entirely in the ViewModel and Model layers.

## What Breaks Without This
If you attempt to write logic directly in the code-behind without MVVM, your code becomes tightly coupled to the UI framework.
If you write `public void Button_Click(object sender, RoutedEventArgs e)` in your `MainWindow.xaml.cs`, and you want to test that logic, you cannot easily create a `RoutedEventArgs` or instantiate a `MainWindow` in a background test runner. Your tests will fail with threading exceptions or COM errors, because WPF windows must run on specific UI threads. MVVM extracts the logic so it can run safely on any thread.

## Exercises
1. Add a `DecrementCommand` to the `CounterViewModel` that decreases the count by 1. Add a second button to the XAML bound to this command.
2. Add a `ResetCommand` that sets the value to 0.
3. Write a unit test method that executes `IncrementCommand` twice and `DecrementCommand` once, then asserts the `Count` is 1.

## Definition of Done
- [ ] You understand that the Model holds raw data.
- [ ] You understand that the ViewModel wraps the Model and provides formatting and Commands.
- [ ] You understand that the View is just visuals, bound to the ViewModel via `DataContext`.
- [ ] You understand that MVVM exists primarily to decouple logic from the UI framework for testability and separation of concerns.
- [ ] You can explain MVVM out loud, in your own words, to someone who hasn't read this lesson.
