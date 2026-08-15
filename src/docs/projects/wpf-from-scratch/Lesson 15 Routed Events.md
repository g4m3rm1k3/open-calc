# Lesson 15: Routed Events

**What you will build:** You will build a set of simple, single-window layouts that prove how events travel through a hierarchy of UI elements. You will see how an event raised by a child element can be caught by its parent, how an event can be intercepted before it reaches its destination, and how you can stop an event from continuing its journey. This solves the problem of having to attach identical event handlers to dozens of individual child elements when a single handler on their shared parent could do the job.

**What you need to know first:** Lesson 01 (getting started), Lesson 02 (XAML), Lesson 14 (basic events).

**Terms introduced in this lesson:**
- **Routed Event** — an event designed to travel up or down the visual tree of elements, rather than just firing on the object that raised it. *Why it exists:* to decouple the element that triggers an action from the element that handles it, especially in deeply nested UI structures.
- **Bubbling** — a routing strategy where the event travels upwards from the source element to the root of the tree. *Why it exists:* to let parent elements handle actions triggered by their descendants.
- **Tunneling** — a routing strategy where the event travels downwards from the root of the tree to the source element. These events are always prefixed with `Preview`. *Why it exists:* to let parent elements intercept and potentially cancel an action before the child element processes it.
- **Direct** — a routing strategy where the event fires only on the source element and does not travel. *Why it exists:* to provide standard event behavior within the routed event system.

**Objects and methods used:**
- **RoutedEventArgs**
  - *What it is:* The base class for state information and event data associated with a routed event.
  - *Implementation:* `public class RoutedEventArgs : EventArgs`
  - *Its use:* Provides properties to determine where the event came from and to control its routing.
- **RoutedEventArgs.Source**
  - *What it is:* A property containing a reference to the object that raised the event.
  - *Implementation:* `public object Source { get; set; }`
  - *Its use:* Used to identify the logical element that triggered the routing.
- **RoutedEventArgs.OriginalSource**
  - *What it is:* A property containing a reference to the exact object the user interacted with, before any logical tree adjustments.
  - *Implementation:* `public object OriginalSource { get; }`
  - *Its use:* Used when you need to know exactly which visual primitive (like a text block inside a button) was clicked.
- **RoutedEventArgs.Handled**
  - *What it is:* A boolean property that indicates the present state of the event route.
  - *Implementation:* `public bool Handled { get; set; }`
  - *Its use:* Set to `true` to stop the event from traveling any further along its route.

---

## Concept Unit: What a Routed Event Is

### The Problem
In standard C#, an event fires only on the specific object that raised it. If you have ten buttons, you must attach ten event handlers, or attach the same handler ten times. If a button is inside a border, which is inside a grid, clicking the button fires the button's event, but the border and grid are oblivious. A routed event solves this by traveling through the element tree, allowing an ancestor to listen for the events of its descendants.

### The New Code
```xml
<Window x:Class="RoutedEvents.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Routed Events" Height="200" Width="300">
    <Grid ButtonBase.Click="Grid_Click">
        <Border BorderBrush="Blue" BorderThickness="2" Padding="20">
            <Button Content="Click Me" />
        </Border>
    </Grid>
</Window>
```

```csharp
using System.Windows;
using System.Windows.Controls.Primitives;

namespace RoutedEvents;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void Grid_Click(object sender, RoutedEventArgs e)
    {
        MessageBox.Show("The Grid heard the button click!");
    }
}
```

### Mechanical Walkthrough
- `ButtonBase.Click="Grid_Click"` on the `<Grid>`: This attaches an event handler to the `Grid`. We specify `ButtonBase.Click` because the `Grid` itself does not define a `Click` event. This syntax tells the `Grid` to listen for `Click` events bubbling up from any `ButtonBase` descendant. Without this, the `Grid` would ignore the button's click.
- `<Button Content="Click Me" />`: The actual source of the event. Note that it has no `Click` handler of its own. When clicked, it raises the `Click` event, which then begins its journey up the tree.
- `private void Grid_Click(object sender, RoutedEventArgs e)`: The handler method in the code-behind. It executes when the `Click` event reaches the `Grid`.

### CS Lens
This is the Chain of Responsibility design pattern. A request (the event) is passed along a chain of potential handlers (the UI elements) until one or more of them handle it. It also mirrors event propagation (bubbling) in the HTML/DOM model.

### SE Lens
The alternative is strong coupling: manually wiring every button to a central controller, or having the grid traverse its children to attach handlers. Routed events reduce boilerplate and decouple the visual structure from the event handling logic, at the cost of a slight performance overhead during event traversal and the risk of unexpected ancestors catching events accidentally.

### Run It Yourself
1. Create a new .NET 8 WPF Application named `RoutedEvents`.
2. Replace `MainWindow.xaml` with the XAML above.
3. Replace `MainWindow.xaml.cs` with the C# above.
4. Run the application and click the button.
5. Expected output: A message box appears saying "The Grid heard the button click!".

---

## Concept Unit: Three Routing Strategies

### The Problem
Events sometimes need to be intercepted before they happen, handled after they happen, or isolated to the source. A single behavior is not enough for complex interactions like keystrokes, where an entire window might want to preview a key press before a specific text box processes it.

### The New Code
```xml
<Window x:Class="RoutingStrategies.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Routing Strategies" Height="200" Width="300"
        PreviewKeyDown="Window_PreviewKeyDown"
        KeyDown="Window_KeyDown">
    <StackPanel>
        <TextBox Name="InputBox" 
                 PreviewKeyDown="TextBox_PreviewKeyDown" 
                 KeyDown="TextBox_KeyDown" />
    </StackPanel>
</Window>
```

```csharp
using System.Diagnostics;
using System.Windows;
using System.Windows.Input;

namespace RoutingStrategies;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void Window_PreviewKeyDown(object sender, KeyEventArgs e)
    {
        Debug.WriteLine("1. Window PreviewKeyDown (Tunneling)");
    }

    private void TextBox_PreviewKeyDown(object sender, KeyEventArgs e)
    {
        Debug.WriteLine("2. TextBox PreviewKeyDown (Tunneling)");
    }

    private void TextBox_KeyDown(object sender, KeyEventArgs e)
    {
        Debug.WriteLine("3. TextBox KeyDown (Bubbling)");
    }

    private void Window_KeyDown(object sender, KeyEventArgs e)
    {
        Debug.WriteLine("4. Window KeyDown (Bubbling)");
    }
}
```

### Mechanical Walkthrough
- `PreviewKeyDown` events (Tunneling): These fire first, starting at the `Window` and tunneling down the tree to the `TextBox`. They provide an opportunity for parents to inspect the event before the child receives it.
- `KeyDown` events (Bubbling): These fire after tunneling completes, starting at the `TextBox` (the source) and bubbling up the tree to the `Window`. They allow parents to react to events that the child has already processed.
- `Debug.WriteLine`: Used here instead of `MessageBox` because displaying a modal dialog would steal focus and interrupt the event routing.
- (Direct routing is not explicitly coded here, but events like `MouseEnter` use direct routing, firing only on the element the mouse entered.)

### CS Lens
This is a two-phase traversal of a tree data structure: a pre-order traversal (tunneling) down to a specific node, followed by a post-order traversal (bubbling) back up to the root.

### SE Lens
The alternative is relying solely on bubbling. If only bubbling existed, a window could not easily stop a text box from receiving a prohibited keystroke, because the text box would receive the event first. Tunneling enables pre-emptive interception. The cost is a more complex event pipeline where developers must carefully track which phase they are handling.

### Run It Yourself
1. Create a new .NET 8 WPF Application named `RoutingStrategies`.
2. Replace `MainWindow.xaml` and `MainWindow.xaml.cs` with the code above.
3. Run the application.
4. Click inside the text box to focus it, then press the 'A' key.
5. Look at the Output window in Visual Studio (or your IDE's debug console).
6. Expected output: The numbers 1 through 4 print in exact order, showing the tunneling down, then the bubbling up.

---

## Concept Unit: Source vs OriginalSource

### The Problem
When a parent handles a bubbling event from its children, it often needs to know which specific child triggered it. Furthermore, WPF controls are composed of smaller primitive elements. A button is not a solid block; it contains a border, a content presenter, and perhaps a text block. You must distinguish between the logical control and the visual primitive.

### The New Code
```xml
<Window x:Class="SourceProperties.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Source vs OriginalSource" Height="200" Width="300">
    <StackPanel ButtonBase.Click="Panel_Click">
        <Button Name="ButtonOne">
            <TextBlock Text="First Button Text" />
        </Button>
        <Button Name="ButtonTwo">
            <TextBlock Text="Second Button Text" />
        </Button>
    </StackPanel>
</Window>
```

```csharp
using System.Windows;
using System.Windows.Controls;

namespace SourceProperties;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void Panel_Click(object sender, RoutedEventArgs e)
    {
        Button sourceButton = (Button)e.Source;
        TextBlock originalVisual = (TextBlock)e.OriginalSource;

        MessageBox.Show($"Source: {sourceButton.Name}\nOriginalSource Text: {originalVisual.Text}");
    }
}
```

### Mechanical Walkthrough
- `ButtonBase.Click="Panel_Click"`: The `StackPanel` catches the click from either button.
- `(Button)e.Source`: The `Source` property holds the logical element that raised the event—in this case, the `Button`. We cast it to a `Button` to access properties like `Name`.
- `(TextBlock)e.OriginalSource`: The `OriginalSource` property holds the exact visual element the mouse pointer was over when clicked. Because the text fills the button, the user actually clicked the `TextBlock` inside the `Button`.
- `<TextBlock Text="..." />`: Placed explicitly inside the button to ensure it is the visual target.

### CS Lens
This demonstrates the difference between logical abstraction and physical implementation. The logical tree represents the application's semantic structure (Window -> StackPanel -> Button), while the visual tree represents the rendering primitives (Button -> Border -> ContentPresenter -> TextBlock).

### SE Lens
The alternative is only providing the exact physical element. If you only had `OriginalSource`, every click handler on a button would have to manually search up the visual tree to find the actual `Button` object, because the event would report coming from a `TextBlock` or a `Border`. WPF provides both to give you the abstraction (`Source`) when you want it, and the raw truth (`OriginalSource`) when you need it.

### Run It Yourself
1. Create a new .NET 8 WPF Application named `SourceProperties`.
2. Replace `MainWindow.xaml` and `MainWindow.xaml.cs` with the code above.
3. Run the application and click the first button.
4. Expected output: A message box showing "Source: ButtonOne" and "OriginalSource Text: First Button Text".

---

## Concept Unit: Marking Events Handled

### The Problem
If an event tunnels down and bubbles up through every element in the tree, multiple elements might react to the same action. Often, once an element processes an event, you want to stop the routing to prevent ancestor elements from taking redundant or conflicting actions.

### The New Code
```xml
<Window x:Class="HandledEvents.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Handled Events" Height="200" Width="300"
        KeyDown="Window_KeyDown">
    <StackPanel>
        <TextBox Name="InputBox" PreviewKeyDown="InputBox_PreviewKeyDown" />
    </StackPanel>
</Window>
```

```csharp
using System.Windows;
using System.Windows.Input;

namespace HandledEvents;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void InputBox_PreviewKeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Enter)
        {
            MessageBox.Show("Enter key intercepted and stopped.");
            e.Handled = true;
        }
    }

    private void Window_KeyDown(object sender, KeyEventArgs e)
    {
        MessageBox.Show($"Window saw key: {e.Key}");
    }
}
```

### Mechanical Walkthrough
- `PreviewKeyDown="InputBox_PreviewKeyDown"`: The text box intercepts the key press during the tunneling phase.
- `if (e.Key == Key.Enter)`: We check if the specific key pressed was the Enter key.
- `e.Handled = true;`: This is the critical mechanism. By setting `Handled` to true, we inform the WPF routing engine that the event has been completely dealt with. The engine will stop routing this specific event occurrence.
- `Window_KeyDown`: This bubbling event handler is meant to catch keys. However, if Enter is pressed, this method will *never* execute because the event was marked handled during the earlier tunneling phase.

### CS Lens
This is a short-circuit evaluation mechanism applied to event dispatching. It prevents unnecessary processing and provides a mechanism for a localized rule (the text box's logic) to override a generalized rule (the window's logic).

### SE Lens
The alternative is tracking state externally. Without `e.Handled`, the window's `KeyDown` handler would have to check some global or shared state variable to see if the text box had already processed the Enter key. `e.Handled` encapsulates the state of the event resolution within the event argument itself. The cost is that a poorly written component deep in the tree can silently swallow events, making bugs difficult to track.

### Run It Yourself
1. Create a new .NET 8 WPF Application named `HandledEvents`.
2. Replace `MainWindow.xaml` and `MainWindow.xaml.cs` with the code above.
3. Run the application.
4. Focus the text box and press the 'A' key. You will see "Window saw key: A".
5. Focus the text box and press the Enter key.
6. Expected output: You will see "Enter key intercepted and stopped." You will *not* see the Window message box.

---

## Connect the Pieces
Consider a user clicking a `Button` inside a `StackPanel` inside a `Window`. The `MouseDown` action occurs. First, a `PreviewMouseDown` event tunnels from the Window down to the Button. If no element sets `e.Handled = true`, the physical `TextBlock` inside the button receives the click. The logical `Button` raises the `Click` event. The `e.Source` is set to the Button, and `e.OriginalSource` is set to the TextBlock. The `Click` event then bubbles up to the `StackPanel`, which catches it, processes it, and sets `e.Handled = true`, ensuring the Window never sees the bubbling `Click` event.

## What Breaks Without This
If you try to capture an event on a parent container but use a standard .NET event instead of a routed event syntax, the compiler will reject it.

```xml
<Grid Click="Grid_Click"> <!-- Error -->
    <Button Content="Click Me" />
</Grid>
```
**Failure:** `The member "Click" is not recognized or is not accessible.`
**Why:** The `Grid` class does not have a `Click` event. Standard events require the object to actually possess the event member. You must use the routed event attachment syntax `ButtonBase.Click` to tell the grid to listen for an event defined by another class.

## Exercises
1. Modify the `RoutingStrategies` code to handle `PreviewKeyDown` and `KeyDown` on the `StackPanel` as well. Run it and observe the exact 6-step sequence in the debug output.
2. In the `SourceProperties` code, replace the `TextBlock` inside the first button with a `Rectangle` (e.g., `<Rectangle Fill="Red" Width="50" Height="20" />`). Run the app, click the red rectangle, and observe what `e.OriginalSource` becomes.
3. In the `HandledEvents` code, change `e.Handled = true` to `e.Handled = false`. Run the app, press Enter, and observe what happens when the event is not stopped.

## Definition of Done
- [ ] You have run all four code examples.
- [ ] You can identify which phase (tunneling or bubbling) occurs first.
- [ ] You know the naming convention for tunneling events.
- [ ] You understand the difference between the logical element that raised an event and the physical element the mouse touched.
- [ ] You can explain what a routed event is out loud, in your own words, to someone who hasn't read this lesson.
