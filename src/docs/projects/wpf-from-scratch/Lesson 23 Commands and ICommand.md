# Lesson 23: Commands and ICommand

**What you will build:** You will build a sequence of isolated Windows Presentation Foundation (WPF) interfaces that replace direct event handlers with objects that represent actions. This solves the problem of distributing the same behavior across multiple UI controls, such as a button, a menu item, and a keyboard shortcut, while automatically disabling those controls when the action is not allowed. 

**What you need to know first:** Lesson 14: Delegates and Lambdas, Lesson 17: Interfaces, Lesson 21: Data Context and Basic Bindings.

**Terms introduced in this lesson:**
- **Command** — An object that encapsulates a single action and the logic determining whether that action is currently allowed. *Why it exists:* To decouple the intention to do something (a command) from the visual element that triggers it (a button), allowing multiple UI elements to share the same behavior and state.
- **Relay (or Delegate) Command** — A generalized command implementation that accepts external methods or lambdas to define its execution and validation logic. *Why it exists:* To prevent the need to write a brand new class for every single action in an application.

**Objects and methods used:**
- **ICommand**
  - *What it is:* The interface defining the contract for all commands in WPF.
  - *Implementation:* `public interface ICommand { bool CanExecute(object? parameter); void Execute(object? parameter); event EventHandler? CanExecuteChanged; }`
  - *Its use:* Implemented by classes to define standardized actions that WPF controls can bind to.
- **Button.Command**
  - *What it is:* A property on `Button` (and other controls like `MenuItem`) that accepts an `ICommand`.
  - *Implementation:* `public ICommand Command { get; set; }`
  - *Its use:* When set, the button will automatically call the command's `Execute` method when clicked, and will automatically disable itself if the command's `CanExecute` method returns false.
- **CommandManager.InvalidateRequerySuggested()**
  - *What it is:* A static method that forces WPF to re-evaluate the execution status of all active commands.
  - *Implementation:* `public static void InvalidateRequerySuggested();`
  - *Its use:* Called when internal state changes that might affect whether a command should be enabled or disabled, prompting WPF to update the UI accordingly.

---

## Concept Unit: The Problem with Click Handlers

### The Problem
When you wire a method directly to a button's click event, you tightly bind that specific visual button to that specific logic. If your application needs to trigger the exact same save logic from a menu item and a keyboard shortcut, you must manually wire all of those events to the same method. Furthermore, if the save action is currently invalid (for example, if there is no data to save), you must write code that manually disables the button, the menu item, and the keyboard shortcut, and then manually re-enables all of them when data is entered.

### The New Code
```csharp
using System;
using System.Windows;
using System.Windows.Controls;

class Program
{
    [STAThread]
    static void Main()
    {
        var app = new Application();
        var window = new Window { Title = "The Event Handler Problem", Width = 300, Height = 200 };
        var stack = new StackPanel { Margin = new Thickness(10) };

        void SaveData()
        {
            MessageBox.Show("Data Saved!");
        }

        var saveButton = new Button { Content = "Save via Button", Margin = new Thickness(0, 0, 0, 10) };
        saveButton.Click += (sender, args) => SaveData();

        var saveMenu = new MenuItem { Header = "Save via Menu" };
        saveMenu.Click += (sender, args) => SaveData();
        
        var menu = new Menu();
        menu.Items.Add(saveMenu);

        stack.Children.Add(menu);
        stack.Children.Add(saveButton);
        window.Content = stack;

        app.Run(window);
    }
}
```

### Mechanical Walkthrough
- `void SaveData()`: A local method containing the core logic we want to perform.
- `saveButton.Click += (sender, args) => SaveData();`: The button's event handler requires a delegate matching the exact signature `void(object, RoutedEventArgs)`. We use a lambda to discard the arguments and call our method.
- `saveMenu.Click += (sender, args) => SaveData();`: The menu item requires the exact same setup. The logic is duplicated purely because WPF requires these events to be wired individually. If we wanted to disable the save feature, we would need to manually set `saveButton.IsEnabled = false` and `saveMenu.IsEnabled = false`.

### CS Lens
This is an instance of the "M to N" wiring problem. When `M` visual triggers must orchestrate `N` logical actions, hardcoding the connections scales poorly. Decoupling the concept of an "action" into a standalone entity allows triggers to reference the entity, reducing the complexity of state management.

### SE Lens
The direct event handler approach is simple and immediately understandable. The cost is high maintenance. Changing the rules for when an action is allowed requires finding every piece of UI that triggers the action and manually updating its state.

### Run It Yourself
1. Create a new .NET 8 Console App.
2. Edit the `.csproj` file. Change `<Project Sdk="Microsoft.NET.Sdk">` to `<Project Sdk="Microsoft.NET.Sdk.WindowsDesktop">`. Add `<UseWPF>true</UseWPF>` inside the `<PropertyGroup>`.
3. Replace the contents of `Program.cs` with the code above.
4. Run the program. You will see both UI elements fire the same method, but they are entirely independent objects that know nothing about each other.

---

## Concept Unit: ICommand

### The Problem
To decouple an action from the control that invokes it, WPF provides the `ICommand` interface. Instead of controls firing their own distinct events, they invoke methods on an `ICommand` instance. This allows a single command object to be handed to a button, a menu item, and a key binding. The control interacts entirely with the interface.

### The New Code
```csharp
using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

class SaveCommand : ICommand
{
    public event EventHandler? CanExecuteChanged;

    public bool CanExecute(object? parameter)
    {
        return true; 
    }

    public void Execute(object? parameter)
    {
        MessageBox.Show("Executing SaveCommand via ICommand!");
    }
}

class Program
{
    [STAThread]
    static void Main()
    {
        var app = new Application();
        var window = new Window { Title = "ICommand Example", Width = 300, Height = 200 };
        
        var commandInstance = new SaveCommand();
        
        var button = new Button { Content = "Save" };
        button.Command = commandInstance;
        
        window.Content = button;
        app.Run(window);
    }
}
```

### Mechanical Walkthrough
- `class SaveCommand : ICommand`: We define a specific class that implements the interface.
- `public event EventHandler? CanExecuteChanged;`: The interface requires this event. WPF listens to it. If it fires, WPF knows it needs to re-evaluate whether the command can still execute. We leave it unused for now.
- `public bool CanExecute(object? parameter)`: WPF calls this method before allowing the user to click the button. Returning `true` tells the button it should be enabled. The `parameter` allows passing arbitrary data to the command.
- `public void Execute(object? parameter)`: When the button is clicked, this method runs. It holds the actual logic.
- `button.Command = commandInstance;`: Instead of wiring up the `Click` event, we assign our object to the `Command` property. The `Button` natively understands `ICommand` and wires itself to the interface methods automatically.

### CS Lens
This is the Command Pattern. An operation is encapsulated as an object. This allows operations to be passed around as variables, executed at will, and associated with rules that dictate their validity independently of the environment that triggers them.

### SE Lens
Creating a new class for every single command strictly adheres to single responsibility principles, but the overhead of creating dozens of small command classes in a large application is tedious and clutters the codebase.

### Run It Yourself
Paste the code into your configured .NET 8 WPF project and run it. The button executes the command.

---

## Concept Unit: RelayCommand

### The Problem
Writing a distinct class for every action in an application is inefficient. We can solve this by writing a single, reusable `ICommand` implementation that takes two lambdas in its constructor: one for the execution logic, and an optional one for the validation logic. This is conventionally called a `RelayCommand` or `DelegateCommand`.

### The New Code
```csharp
using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

public class RelayCommand : ICommand
{
    private readonly Action<object?> _execute;
    private readonly Func<object?, bool>? _canExecute;

    public RelayCommand(Action<object?> execute, Func<object?, bool>? canExecute = null)
    {
        _execute = execute;
        _canExecute = canExecute;
    }

    public event EventHandler? CanExecuteChanged;

    public bool CanExecute(object? parameter)
    {
        if (_canExecute == null) return true;
        return _canExecute(parameter);
    }

    public void Execute(object? parameter)
    {
        _execute(parameter);
    }
}

public class ViewModel
{
    public ICommand SaveCommand { get; }

    public ViewModel()
    {
        SaveCommand = new RelayCommand(
            execute: _ => MessageBox.Show("Saved via RelayCommand!"),
            canExecute: _ => true
        );
    }
}

class Program
{
    [STAThread]
    static void Main()
    {
        var app = new Application();
        var window = new Window { Title = "RelayCommand Example", Width = 300, Height = 200 };
        
        var vm = new ViewModel();
        var button = new Button { Content = "Save", Command = vm.SaveCommand };
        
        window.Content = button;
        app.Run(window);
    }
}
```

### Mechanical Walkthrough
- `Action<object?> _execute`: A delegate field holding the logic to run. We accept a lambda via the constructor and store it here.
- `Func<object?, bool>? _canExecute`: A delegate field holding a method that returns a boolean. It is optional.
- `if (_canExecute == null) return true;`: If no validation lambda was provided, we assume the command can always execute. Otherwise, we execute the lambda to get the boolean result.
- `execute: _ => MessageBox.Show(...)`: The ViewModel constructs the command, providing a lambda. The underscore `_` discards the incoming parameter object, as we don't need it.

### CS Lens
This is a classic application of higher-order functions. The `RelayCommand` acts as an adapter, taking raw functions and wrapping them in an interface boundary so that the WPF framework can interact with them.

### SE Lens
The `RelayCommand` is universally used in WPF development. The tradeoff is that the command logic is now housed inside the ViewModel rather than in an isolated class, which can lead to bloated ViewModels if the logic is complex.

### Run It Yourself
Paste the code and run it. The behavior is identical to the previous unit, but the architecture allows defining commands in a single line of code.

---

## Concept Unit: CanExecute and Button Auto-Disabling

### The Problem
If a command's validity changes (for instance, a save button should only be enabled when there is text to save), the button needs to know when to ask `CanExecute` again. WPF's `CommandManager` can automatically manage this by firing the `CanExecuteChanged` event whenever global input occurs, or we can manually force a re-evaluation when we know state has changed.

### The New Code
```csharp
using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

public class RelayCommand : ICommand
{
    private readonly Action<object?> _execute;
    private readonly Func<object?, bool> _canExecute;

    public RelayCommand(Action<object?> execute, Func<object?, bool> canExecute)
    {
        _execute = execute;
        _canExecute = canExecute;
    }

    public event EventHandler? CanExecuteChanged
    {
        add { CommandManager.RequerySuggested += value; }
        remove { CommandManager.RequerySuggested -= value; }
    }

    public bool CanExecute(object? parameter) => _canExecute(parameter);
    public void Execute(object? parameter) => _execute(parameter);
}

public class ViewModel
{
    public string DocumentText { get; set; } = "";
    public ICommand SaveCommand { get; }

    public ViewModel()
    {
        SaveCommand = new RelayCommand(
            execute: _ => MessageBox.Show("Document Saved!"),
            canExecute: _ => !string.IsNullOrWhiteSpace(DocumentText)
        );
    }
}

class Program
{
    [STAThread]
    static void Main()
    {
        var app = new Application();
        var window = new Window { Title = "Auto Disable", Width = 300, Height = 200 };
        var stack = new StackPanel { Margin = new Thickness(10) };
        
        var vm = new ViewModel();
        
        var textBox = new TextBox { Margin = new Thickness(0, 0, 0, 10) };
        textBox.TextChanged += (sender, args) => 
        {
            vm.DocumentText = textBox.Text;
            CommandManager.InvalidateRequerySuggested();
        };
        
        var button = new Button { Content = "Save", Command = vm.SaveCommand };
        
        stack.Children.Add(textBox);
        stack.Children.Add(button);
        window.Content = stack;
        
        app.Run(window);
    }
}
```

### Mechanical Walkthrough
- `add { CommandManager.RequerySuggested += value; }`: We map the `CanExecuteChanged` event to WPF's global `CommandManager.RequerySuggested` event. When a UI control subscribes to our command's event, it is actually subscribing to the global manager.
- `_canExecute: _ => !string.IsNullOrWhiteSpace(DocumentText)`: The command is only valid if `DocumentText` is not null or empty.
- `CommandManager.InvalidateRequerySuggested()`: When the text changes, we update the ViewModel and then explicitly tell the global `CommandManager` to force every command in the application to re-evaluate itself. WPF will call `CanExecute` on our command, receive the new boolean, and automatically enable or disable the button.

### CS Lens
This is a reactive dependency system. The UI reacts to changes in state. Hooking into a global event bus (`CommandManager`) is a broad way to ensure everything stays synchronized without having to manually track which commands rely on which properties.

### SE Lens
Binding command validation to `CommandManager.RequerySuggested` is extremely convenient but can be a performance hazard in enormous applications, because every keystroke and mouse click can trigger a global re-evaluation of every command. 

### Run It Yourself
Paste the code and run it. The Save button will be visibly greyed out and unclickable. Type any character into the TextBox, and the button will immediately become enabled.

---

## Connect the Pieces
A user clicks a Button that has its `Command` property set to a `RelayCommand`. WPF checks the `Button.Command` property and retrieves the `ICommand` reference. It then invokes the `CanExecute` method on that interface. The `RelayCommand` runs its internal validation lambda, which checks the current state of the ViewModel. If the lambda returns `true`, the button is enabled, and WPF invokes the `Execute` method on the interface. The `RelayCommand` routes this invocation to the execution lambda, executing the underlying business logic.

## What Breaks Without This
If a UI control attempts to bind to an object that does not implement `ICommand`, the compiler rejects the assignment. If you try to bypass the interface and pass a raw method to the `Command` property:

```csharp
var button = new Button();
button.Command = SaveData; 
```

**Compiler Error:**
`CS0029: Cannot implicitly convert type 'method group' to 'System.Windows.Input.ICommand'`

The `Command` property demands an object that fulfills the specific interface contract. 

## Exercises
1. Modify the `ViewModel` in the final Concept Unit to include a `ClearCommand` that erases the text in the `DocumentText` property and the `TextBox`. Set its `canExecute` lambda to only allow clearing if text exists.
2. Create a second `Button` in the window and bind it to the exact same `SaveCommand`. Verify that typing in the `TextBox` enables and disables both buttons simultaneously without writing any code directly interacting with either button.

## Definition of Done
- [ ] You can instantiate a `RelayCommand` with execution and validation logic.
- [ ] You can assign an `ICommand` to a `Button.Command` property.
- [ ] You can trigger a UI refresh of command states using `CommandManager.InvalidateRequerySuggested()`.
- [ ] You can explain what an `ICommand` is and why it replaces click handlers out loud, in your own words, to someone who hasn't read this lesson.
