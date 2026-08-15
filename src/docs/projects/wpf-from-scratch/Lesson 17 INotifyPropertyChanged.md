# Lesson 17: INotifyPropertyChanged

**What you will build:** A minimal WPF window that displays a user's name and updates it on a timer. This proves how the user interface can automatically react to changes made to data in the background. The problem this solves is keeping the UI and the underlying data synchronized without manually writing code to update every individual control.

**What you need to know first:** Lesson 15: Data Binding, Lesson 16: Timers.

**Terms introduced in this lesson:**
- **Notification** — A signal sent from one part of a program to another indicating that a specific event has occurred. *Why it exists:* So that decoupled systems (like data and UI) can react to changes without needing direct references to each other.
- **Backing Field** — A private variable that stores the actual data for a public property. *Why it exists:* To allow the property's `set` accessor to execute logic (like raising an event) before or after storing the value.

**Objects and methods used:**
- **System.ComponentModel.INotifyPropertyChanged / PropertyChanged**
  - *What it is:* An interface defining a single event that broadcasts when a property's value changes.
  - *Implementation:* `public event PropertyChangedEventHandler? PropertyChanged;`
  - *Its use:* Implemented by data classes so WPF's binding system can listen for changes and update the UI.
- **System.Runtime.CompilerServices.CallerMemberNameAttribute**
  - *What it is:* An attribute applied to an optional string parameter in a method.
  - *Implementation:* `public void RaiseEvent([CallerMemberName] string? propertyName = null)`
  - *Its use:* Tells the compiler to automatically inject the name of the method or property that called it, preventing typos in strings.

---

## Concept Unit: The Binding Refresh Problem

### The Problem
When you bind a WPF control to a standard C# property, the control reads the property's value exactly once when the binding is established. If the property's value changes later in the code, the UI remains oblivious. The connection is one-way and one-time, meaning your data changes but the screen does not.

### The New Code
```csharp
using System.Windows;
using System.Threading.Tasks;

namespace WpfApp;

public class Person
{
    public string Name { get; set; } = "Alice";
}

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        
        var person = new Person();
        this.DataContext = person;

        // Change the name after a short delay
        Task.Delay(2000).ContinueWith(_ => 
        {
            person.Name = "Bob";
        });
    }
}
```
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Binding Problem" Height="200" Width="300">
    <Grid>
        <TextBlock Text="{Binding Name}" HorizontalAlignment="Center" VerticalAlignment="Center" FontSize="24" />
    </Grid>
</Window>
```

### Mechanical Walkthrough
- `var person = new Person();` creates the data object with `Name` initially set to "Alice".
- `this.DataContext = person;` tells the Window where to look for data bindings.
- `<TextBlock Text="{Binding Name}" />` finds the `DataContext` (the `person`), reads its `Name` property ("Alice"), and displays it.
- `Task.Delay(2000)` waits for 2 seconds on a background thread.
- `person.Name = "Bob";` updates the value in memory. The UI does not change. It remains "Alice" because there is no mechanism telling the `TextBlock` to read the property again.

### CS Lens
This is the classic Polling vs. Interrupt problem. WPF does not continuously poll the `Name` property in a loop to see if it changed (which would burn CPU cycles). Instead, it expects an interrupt—a signal that something has changed. Because standard properties do not emit signals, the UI assumes the value is static.

### SE Lens
The alternative not chosen is requiring the background task to hold a direct reference to the `TextBlock` and explicitly write `MyTextBlock.Text = "Bob"`. The tradeoff of the data-binding approach is that it requires an agreed-upon contract (an interface) for communication, costing slightly more code in the data class to keep the UI completely decoupled from the logic.

### Run It Yourself
1. Create a new WPF project: `dotnet new wpf -n BindingProblem`
2. Replace the contents of `MainWindow.xaml` and `MainWindow.xaml.cs` with the code above. Add the `Person` class to the C# file.
3. Run with `dotnet run`.
4. Observe that the window opens showing "Alice". Wait 2 seconds. The text does not change to "Bob", proving that bindings do not automatically detect property changes.

---

## Concept Unit: INotifyPropertyChanged

### The Problem
To fix the silence of standard properties, we need a standardized way for an object to shout "My data changed!" WPF needs to know exactly what event to listen to. We must implement a specific interface that WPF is hardcoded to look for.

### The New Code
```csharp
using System.ComponentModel;
using System.Windows;
using System.Threading.Tasks;

namespace WpfApp;

public class Person : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    private string _name = "Alice";
    public string Name
    {
        get { return _name; }
        set
        {
            _name = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs("Name"));
        }
    }
}

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        var person = new Person();
        this.DataContext = person;

        Task.Delay(2000).ContinueWith(_ => 
        {
            person.Name = "Bob";
        });
    }
}
```

### Mechanical Walkthrough
- `: INotifyPropertyChanged` declares that the `Person` class agrees to the contract expected by WPF's binding engine.
- `public event PropertyChangedEventHandler? PropertyChanged;` provides the actual event. WPF silently subscribes a listener to this event when the binding is evaluated.
- `private string _name` is the backing field storing the actual string.
- `get { return _name; }` returns the value to whoever asks (like the UI).
- `set { _name = value; ... }` takes the incoming new value and stores it.
- `PropertyChanged?.Invoke(this, new PropertyChangedEventArgs("Name"));` fires the event. The `?` prevents a crash if no one is listening. It passes the exact name of the property that changed ("Name") as a string.
- When the background task sets `person.Name = "Bob"`, the setter runs, updates the field, and fires the event. WPF hears the event, checks the string, sees it matches the binding `{Binding Name}`, and re-reads the `get` block.

### CS Lens
This is the Observer pattern. The `Person` is the subject being observed; the `TextBlock` (via WPF's binding engine) is the observer. The subject maintains a list of dependents (the event delegates) and notifies them automatically of any state changes. This pattern appears in publish-subscribe messaging systems, DOM event listeners, and newsletter mailing lists.

### SE Lens
The alternative not chosen is a massive global event bus where all changes are broadcast to everything. By putting the event directly on the object itself, only UI elements bound to this specific object receive the notification. The cost is that every observable property must be expanded from a simple `{ get; set; }` into a verbose block with a backing field.

### Run It Yourself
1. Update the `Person` class in your project with the code above.
2. Run with `dotnet run`.
3. Observe that the window opens showing "Alice". Wait 2 seconds. The text automatically updates to "Bob". The data and UI are synchronized.

---

## Concept Unit: The SetProperty Helper

### The Problem
Writing a backing field and explicitly invoking `PropertyChanged` for every single property is repetitive. Furthermore, if you assign the same value to a property (`person.Name = "Bob"` when it is already "Bob"), it fires the event, causing WPF to needlessly redraw the UI. We need to centralize this logic.

### The New Code
```csharp
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace WpfApp;

public class ObservableObject : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    protected void SetProperty<T>(ref T storage, T value, [CallerMemberName] string? propertyName = null)
    {
        if (Equals(storage, value))
        {
            return;
        }

        storage = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}

public class Person : ObservableObject
{
    private string _name = "Alice";
    public string Name
    {
        get { return _name; }
        set { SetProperty(ref _name, value); }
    }
}
```

### Mechanical Walkthrough
- `public class ObservableObject : INotifyPropertyChanged` moves the interface implementation to a base class, so any data class can inherit it.
- `protected void SetProperty<T>` defines a generic method available to derived classes.
- `ref T storage` takes a reference to the backing field (e.g., `_name`). This allows the method to modify the actual field directly.
- `if (Equals(storage, value)) return;` checks if the old value and the new value are identical. If they are, it exits early, preventing pointless UI updates.
- `storage = value;` actually assigns the new value to the backing field.
- `set { SetProperty(ref _name, value); }` inside the `Person` class is now a clean one-liner. It passes the backing field and the new value to the helper.

### CS Lens
This is an abstraction of the State Transition lifecycle. Before changing state, we perform an identity check. If the state is not actually transitioning to a new value, we short-circuit the operation. This avoids cascading updates in reactive systems, similar to virtual DOM diffing in web frameworks where unchanged nodes are skipped.

### SE Lens
The alternative not chosen is relying on code generation (like source generators) or weaving tools (like Fody) to inject the property changed logic during compilation. The helper method approach keeps the code visible, debuggable, and within the C# language rules, but at the cost of still requiring manual backing fields.

### Run It Yourself
1. Add the `ObservableObject` class to your file.
2. Modify `Person` to inherit from `ObservableObject` and use `SetProperty`.
3. Run the application to verify it still functions exactly as before, successfully updating from "Alice" to "Bob".

---

## Concept Unit: [CallerMemberName]

### The Problem
In the previous unit's `SetProperty` method, we used `[CallerMemberName] string? propertyName = null`. If we hadn't used this, the caller would have to write `SetProperty(ref _name, value, "Name")`. Passing property names as hardcoded string literals is dangerous: if you rename the property to `FullName` later, but forget to update the string to `"FullName"`, WPF will look for an event for "FullName" but receive an event for "Name", breaking the UI silently.

### The New Code
```csharp
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System;

namespace WpfApp;

public class MagicStringDemo
{
    public void LogChange([CallerMemberName] string? callerName = null)
    {
        Console.WriteLine($"The property that called this was: {callerName}");
    }

    public int Age
    {
        get { return 0; }
        set { LogChange(); } 
    }
}
```

### Mechanical Walkthrough
- `string? callerName = null` provides a default parameter value. This is required for the compiler attribute to work.
- `[CallerMemberName]` instructs the C# compiler to intervene during the build process.
- `set { LogChange(); }` makes a method call without providing the argument.
- When the compiler reads this, it sees that `LogChange` was invoked from inside the `Age` property's setter. It silently rewrites the code at compile time to `LogChange("Age")`.
- When `PropertyChanged?.Invoke` fires in our helper method, it uses the compiler-injected string, ensuring the event name perfectly matches the property name.

### CS Lens
This is compile-time metaprogramming. Instead of relying on runtime reflection (which is slow) to figure out who called the method, the compiler analyzes the Abstract Syntax Tree (AST) during the build and hardcodes the constant string.

### SE Lens
The alternative not chosen is using the `nameof` operator at the call site: `SetProperty(ref _name, value, nameof(Name))`. `nameof` is refactor-safe, but it still requires the developer to manually type it every time. `[CallerMemberName]` moves the responsibility entirely to the compiler, eliminating human error at the cost of slightly hiding the magic from the reader.

### Run It Yourself
1. Create a console application: `dotnet new console -n CallerDemo`
2. Paste the `MagicStringDemo` class above.
3. In `Program.cs`, write: `var demo = new MagicStringDemo(); demo.Age = 5;`
4. Run the program. You will see "The property that called this was: Age" printed to the console, proving the compiler injected the string.

---

## Connect the Pieces
When `person.Name = "Bob"` is executed, execution enters the `Name` property's `set` block. It calls `SetProperty(ref _name, "Bob")`. The compiler secretly turns this into `SetProperty(ref _name, "Bob", "Name")`. The `SetProperty` method compares "Bob" against the old value "Alice". Finding them different, it updates `_name` to "Bob". It then raises the `PropertyChanged` event, attaching the string `"Name"`. WPF hears this event, sees the string matches its `{Binding Name}` instruction, calls the `Name` property's `get` block to retrieve "Bob", and paints the new text onto the `TextBlock`.

## What Breaks Without This
If you rename a property but misspell the string passed to `PropertyChangedEventArgs`, the UI update fails silently.

```csharp
public string FullName
{
    get { return _name; }
    set
    {
        _name = value;
        // The property is FullName, but we broadcast "Name"
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs("Name"));
    }
}
```
**Failure:** The compiler accepts this. The program runs without crashing. But when `FullName` changes, the `TextBlock` (bound to `FullName`) ignores the event because it is listening for "FullName" and only hears "Name". The UI freezes with stale data. Restoring it by using `[CallerMemberName]` guarantees the string always matches the property name.

## Exercises
1. Add a second property, `Age` (an `int`), to the `Person` class. Bind a second `TextBlock` to `{Binding Age}`. Use `Task.Delay` to update the age and confirm both the name and age update in the UI.
2. Modify the `SetProperty` method to log a message to the console every time it is called. Observe what happens if you assign `person.Name = "Alice"` repeatedly inside a loop. Does it spam the console?

## Definition of Done
- [ ] You have verified that WPF bindings read a property once unless notified otherwise.
- [ ] You have implemented `INotifyPropertyChanged` and manually invoked the event.
- [ ] You have centralized the boilerplate into a generic `SetProperty` helper method.
- [ ] You can explain out loud, in your own words, to someone who hasn't read this lesson, why `[CallerMemberName]` is safer than typing string literals.
