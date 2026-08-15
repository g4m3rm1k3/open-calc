# Lesson 10: A Window Split in Two

**What you will build:** A foundational desktop application containing a text display and a button, constructed by splitting the program's definition into two linked pieces: a visual structure file and a behavior code file. This separation solves the problem of writing thousands of lines of nested object creation code just to draw a basic user interface.

**What you need to know first:** Lessons 01 through 09.

**Terms introduced in this lesson:**
- **XAML (eXtensible Application Markup Language)** — an XML-based language used to instantiate .NET objects. *Why it exists:* writing C# code to create, configure, and attach dozens of user interface elements becomes deeply nested and unreadable; XAML represents this object hierarchy declaratively.
- **Code-behind** — a C# file that pairs directly with a specific XAML file to provide its runtime behavior. *Why it exists:* XAML can create objects and set their initial states, but it cannot express logic like "what to do when a user clicks."
- **partial class** — a C# class whose definition is split across multiple physical files that the compiler stitches together. *Why it exists:* it allows human-written code-behind to live in one file while machine-generated code (created from the XAML) lives in another, without overwriting each other.

**Objects and methods used:**
- **System.Windows.Window**
  - *What it is:* The root element of a standard desktop window.
  - *Implementation:* `public class Window : ContentControl`
  - *Its use:* Acts as the visible container for all other user interface elements in the application.
- **System.Windows.Controls.TextBlock**
  - *What it is:* A lightweight control for displaying text.
  - *Implementation:* `public class TextBlock : FrameworkElement`
  - *Its use:* Showing readable string data to the user on screen.
- **System.Windows.Application / Run()**
  - *What it is:* The method that starts the WPF message loop.
  - *Implementation:* `public int Run(Window window)`
  - *Its use:* Keeps the application alive and listening for operating system events like mouse clicks and keyboard presses.

---

## Concept Unit: Creating a WPF Project

### The Problem
Writing a desktop application requires a specific set of base files, compiler instructions, and references to the Windows presentation libraries. Building these by hand for every new program is error-prone and tedious.

### The New Code
```bash
dotnet new wpf -n HelloWpf
cd HelloWpf
```

After running this, the resulting directory contains:
```text
HelloWpf.csproj
App.xaml
App.xaml.cs
MainWindow.xaml
MainWindow.xaml.cs
```

### Mechanical Walkthrough
- `dotnet new wpf` instructs the .NET command-line tool to generate files using the built-in Windows Presentation Foundation template, because without it you would have to manually author the MSBuild XML and bootstrapping code.
- `-n HelloWpf` names the project, which determines the namespace and the resulting output executable name.
- `HelloWpf.csproj` tells the compiler this is a desktop application (`<UseWPF>true</UseWPF>`), because without this flag the C# compiler will not understand how to process XAML files into executable code.
- `App.xaml` and `App.xaml.cs` represent the application itself, handling startup and global resources.
- `MainWindow.xaml` and `MainWindow.xaml.cs` represent the primary visual window the user interacts with.

### CS Lens
Bootstrapping. A runtime environment (like WPF) requires a very specific initialization sequence to bind to the host operating system's window manager. The template provides the boilerplate code that acts as the bridge between standard C# execution and the OS's event loop.

### SE Lens
Convention over configuration. By generating a standardized project structure, tooling can make assumptions about where things live. The alternative is requiring developers to explicitly wire up the entry point and window lifecycle every time, which costs time and creates subtle bugs if done incorrectly.

### Run It Yourself
1. Open a terminal.
2. Run `dotnet new wpf -n HelloWpf`.
3. Run `cd HelloWpf`.
4. Run `dotnet run`.
A blank white window titled "MainWindow" will appear. Close the window to stop the program.

---

## Concept Unit: XAML as Object Instantiation

### The Problem
Defining a visual interface entirely in C# requires declaring objects, setting properties, and adding them to parent containers one by one. This creates verbose, deeply nested code that is difficult to read and maintain.

### The New Code
```xml
<Window x:Class="HelloWpf.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="200" Width="400">
    <TextBlock Text="Hello from XAML" HorizontalAlignment="Center" VerticalAlignment="Center" />
</Window>
```

The C# equivalent of this inner element is:

```csharp
TextBlock textBlock = new TextBlock();
textBlock.Text = "Hello from XAML";
textBlock.HorizontalAlignment = HorizontalAlignment.Center;
textBlock.VerticalAlignment = VerticalAlignment.Center;
this.Content = textBlock;
```

### Mechanical Walkthrough
- `<Window ...>` instructs the XAML parser to instantiate a `System.Windows.Window` object, because without a root element the parser has no primary object to construct.
- `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"` maps default XML tags to WPF namespaces, because without it the parser would not know that `<TextBlock>` refers to `System.Windows.Controls.TextBlock`.
- `<TextBlock Text="Hello from XAML" ... />` tells the system to instantiate a `TextBlock` and assign the string to its `Text` property, because without the XML attributes we would just get an empty control.
- The nesting of `<TextBlock>` inside `<Window>` tells the parser to assign the `TextBlock` to the `Window`'s content, because without hierarchical nesting the objects would exist independently in memory but never appear on screen.

### CS Lens
Serialization format. XAML is not a dynamic templating engine that executes logic; it is a static serialization language. It is a way of writing down an object graph (a tree of objects in memory) so that a machine can reliably reconstruct that exact graph at runtime.

### SE Lens
Declarative vs Imperative UI. XAML lets you describe *what* the interface should look like (declarative), rather than writing the step-by-step instructions of *how* to build it (imperative). The alternative is writing pure C# UI code. While possible, declarative UI separates visual design from business logic, at the cost of having to learn a second syntax (XML) and losing direct compile-time type checking for some complex bindings.

### Run It Yourself
1. Open `MainWindow.xaml` in your `HelloWpf` project.
2. Replace its contents entirely with the XML code block above.
3. Run `dotnet run`.
The window will display the text centered on the screen.

---

## Concept Unit: The Partial Keyword and InitializeComponent

### The Problem
If XAML creates objects, and C# provides logic, these two systems must connect. If we write C# logic in a class, how does that class gain access to the objects defined in the XAML file without manually finding and assigning them?

### The New Code
```csharp
using System.Windows;

namespace HelloWpf;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }
}
```

### Mechanical Walkthrough
- `public partial class MainWindow` declares that this class definition is incomplete, because without `partial` the compiler would reject the class when it finds the second half generated by the XAML compiler.
- `: Window` makes this class inherit all capabilities of a standard window, because without inheritance this class cannot act as the root visual element of the application.
- `InitializeComponent();` executes the hidden, auto-generated code that reads the XAML and instantiates the UI tree, because without calling this method, the C# class exists but remains completely empty and blind to anything defined in the XAML file.

### CS Lens
Code generation. The compiler parses the XAML file and generates a hidden C# file containing a class also named `public partial class MainWindow`. This generated file contains the actual `InitializeComponent()` method. The compiler then fuses your code-behind file and the generated file into a single class. This is a form of metaprogramming where the tooling writes boilerplate code on your behalf.

### SE Lens
Separation of concerns via tooling. By splitting the class into two files via `partial`, humans edit the behavior in one file, and machines update the UI wiring in the other. The alternative is maintaining a single file where developers might accidentally delete or modify the fragile, machine-generated wiring code.

### Run It Yourself
1. Open `MainWindow.xaml.cs`.
2. Notice the `InitializeComponent();` call in the constructor.
3. Try duplicating it so it reads:
   ```csharp
   InitializeComponent();
   InitializeComponent();
   ```
4. Run `dotnet run`. If your XAML contained controls that register themselves in specific ways, you may see errors or duplicated logic, proving that `InitializeComponent()` is actively running code that constructs the UI. Remove the duplicate call.

---

## Concept Unit: Code-behind vs XAML Ownership

### The Problem
We have a visual structure, but it is entirely static. We need a way to execute C# logic in response to a user interacting with the visual elements defined in the XAML.

### The New Code
In `MainWindow.xaml`:
```xml
<Window x:Class="HelloWpf.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="200" Width="400">
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center">
        <TextBlock x:Name="MessageText" Text="Waiting..." Margin="0,0,0,10" />
        <Button Content="Click Me" Click="HandleClick" />
    </StackPanel>
</Window>
```

In `MainWindow.xaml.cs`:
```csharp
using System.Windows;

namespace HelloWpf;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void HandleClick(object sender, RoutedEventArgs e)
    {
        MessageText.Text = "Button was clicked!";
    }
}
```

### Mechanical Walkthrough
- `<StackPanel ...>` organizes multiple child elements vertically, because without a container control, a `Window` can only hold exactly one child element.
- `x:Name="MessageText"` assigns a field name to the `TextBlock` during XAML compilation, because without it, the code-behind would have no variable name to reference the object in memory.
- `Click="HandleClick"` instructs the generated code to subscribe the `HandleClick` C# method to the button's click event, because without this wiring, the button pushes visually but triggers no logic.
- `MessageText.Text = ...` manipulates the text property of the object created by the XAML, because without the `x:Name` bridge, the C# compiler would throw an error stating that `MessageText` does not exist in the current context.

### CS Lens
Event-driven programming. The program does not execute in a linear sequence from top to bottom. Instead, it enters an idle state (the message loop) and waits for the operating system to signal that an event has occurred. The method `HandleClick` is a callback — a piece of code handed to the system to be executed later when specific conditions are met.

### SE Lens
Coupling. The XAML explicitly names the method `HandleClick`. If you rename the method in C# but forget to update the XAML, the program will crash. This is tight coupling between the two files. The alternative, explored in later lessons (MVVM), avoids this by relying on indirect data binding, reducing the fragility of hardcoded method names at the cost of higher initial complexity.

### Run It Yourself
1. Update your `MainWindow.xaml` and `MainWindow.xaml.cs` with the code above.
2. Run `dotnet run`.
3. Click the button and watch the text change.

---

## Connect the Pieces
When you run the program, the .NET runtime instantiates `MainWindow` (C#). The constructor immediately calls `InitializeComponent()` (partial class logic), which parses the `MainWindow.xaml` file. It reads `<TextBlock x:Name="MessageText" />` and creates a `TextBlock` object in memory, assigning it to a hidden C# variable named `MessageText`. It reads `<Button Click="HandleClick" />`, finds your `HandleClick` method in the code-behind, and wires them together. When the user eventually clicks the button, the event fires, invoking your code-behind logic, which updates the `TextBlock` instance that was originally created by the XAML parser.

## What Breaks Without This
If you remove the `x:Class` attribute from the root of your XAML file, the compiler loses the link between the visual definition and the code-behind file.

Change the top of `MainWindow.xaml` to remove `x:Class`:
```xml
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        ...
```

Run `dotnet run`. You will receive a compile error like `The name 'InitializeComponent' does not exist in the current context`. This happens because without `x:Class`, the XAML compiler does not generate the other half of the `partial` class, leaving your code-behind constructor trying to call a method that was never generated. Put `x:Class="HelloWpf.MainWindow"` back to fix it.

## Exercises
1. Add a second `Button` to the `StackPanel` in XAML, give it a different `Content`, and wire its `Click` event to a new method in the code-behind that changes `MessageText.Text` to something else.
2. Remove `InitializeComponent();` from the `MainWindow` constructor and run the program. Observe that the window appears, but is completely blank, proving that XAML parsing is an active process that must be invoked.
3. Change the `x:Name` of the `TextBlock` in XAML to `StatusDisplay`, but do not change the code-behind. Observe the exact compiler error you receive when building.

## Definition of Done
- [ ] You have successfully run `dotnet new wpf` and executed the default project.
- [ ] You have manipulated text and layout using raw XAML.
- [ ] You have connected a XAML button click to a C# method.
- [ ] You have triggered and resolved the compiler error for a missing `InitializeComponent` generation link.
- [ ] You can explain the relationship between a XAML file, its code-behind file, and the `partial` keyword out loud, in your own words, to someone who hasn't read this lesson.
