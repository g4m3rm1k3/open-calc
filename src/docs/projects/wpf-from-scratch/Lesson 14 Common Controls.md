# Lesson 14: Common Controls

**What you will build:** One paragraph explaining we'll create isolated, throwaway windows demonstrating WPF's foundational user interface elements. You will see how to capture user text, offer choices, and trigger actions, proving how data moves between the visual layer and C# code. 

**What you need to know first:** Lesson 11 (Events), Lesson 12 (Layouts), Lesson 13 (ContentControl).

**Terms introduced in this lesson:**
- **Indeterminate** — a third state for a checkbox, meaning neither strictly checked nor unchecked, often used when a selection partially applies. *Why it exists:* To represent mixed or unknown boolean states visually.
- **Selection** — the item currently chosen by the user in a list or dropdown. *Why it exists:* To isolate the user's active choice from the complete list of available options.

**Objects and methods used:**
- **TextBox / Text**
  - *What it is:* A control for reading and writing plain text.
  - *Implementation:* `public string Text { get; set; }`
  - *Its use:* Capturing string input from the user or displaying editable text.
- **Label / Target**
  - *What it is:* A `ContentControl` that supports access keys and focus forwarding.
  - *Implementation:* `public UIElement Target { get; set; }`
  - *Its use:* Providing accessible text labels that transfer keyboard focus to an associated input control when clicked or activated.
- **TextBlock / Text**
  - *What it is:* A lightweight text rendering element, not a `ContentControl`.
  - *Implementation:* `public string Text { get; set; }`
  - *Its use:* Displaying read-only text as cheaply as possible.
- **Button / Click**
  - *What it is:* A `ContentControl` that triggers an action when pressed.
  - *Implementation:* `public event RoutedEventHandler Click;`
  - *Its use:* Executing methods in response to user interaction.
- **CheckBox / IsChecked**
  - *What it is:* A control representing a boolean or nullable boolean choice.
  - *Implementation:* `public bool? IsChecked { get; set; }`
  - *Its use:* Toggling a discrete option on, off, or indeterminate.
- **ComboBox / SelectedItem**
  - *What it is:* A drop-down list of items.
  - *Implementation:* `public object SelectedItem { get; set; }`
  - *Its use:* Allowing the user to select exactly one option from a constrained list.

---

## Concept Unit: TextBox

### The Problem
You need the user to type in information—a name, an email, or a search query. You must capture this input dynamically, restrict how much they can type, or sometimes make the text read-only while preserving its formatting.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="TextBox Example" Height="200" Width="300">
    <StackPanel Margin="10">
        <TextBox Name="InputBox" 
                 TextWrapping="Wrap" 
                 MaxLength="50" 
                 TextChanged="InputBox_TextChanged" />
        <Button Content="Read Text" Click="ReadButton_Click" Margin="0,10,0,0"/>
        <TextBox Name="OutputBox" 
                 IsReadOnly="True" 
                 Margin="0,10,0,0" />
    </StackPanel>
</Window>
```

```csharp
using System.Windows;
using System.Windows.Controls;

namespace WpfApp;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void InputBox_TextChanged(object sender, TextChangedEventArgs e)
    {
        // Fires every time a single keystroke changes the text
        if (InputBox.Text.Length > 40)
        {
            OutputBox.Text = "Warning: approaching limit.";
        }
    }

    private void ReadButton_Click(object sender, RoutedEventArgs e)
    {
        OutputBox.Text = $"You typed: {InputBox.Text}";
    }
}
```

### Mechanical Walkthrough
- `Name="InputBox"` exposes this specific element to the C# code-behind as a variable named `InputBox`. Without it, C# cannot read the user's input.
- `TextWrapping="Wrap"` forces the text to flow to a new line when it hits the right edge of the control. Without it, text scrolls infinitely to the right, hiding earlier words.
- `MaxLength="50"` prevents the user from typing more than 50 characters. The control physically rejects the 51st keystroke.
- `TextChanged="InputBox_TextChanged"` wires an event handler that executes every time the `Text` property changes, character by character.
- `IsReadOnly="True"` makes `OutputBox` visually look like a text box, and allows the text to be selected and copied, but rejects user typing.
- `InputBox.Text` retrieves the exact string currently sitting inside the text box.

### CS Lens
The `TextBox` is a state container holding a mutating string. The `TextChanged` event represents the Observer pattern—the `TextBox` notifies subscribers (your code-behind) immediately upon state mutation, allowing for real-time validation or synchronization.

### SE Lens
Validating on `TextChanged` gives immediate feedback, but it is expensive if validation requires network calls or complex math. The alternative is validating only on `Click`, which is cheaper but forces the user to wait until they attempt submission to find out they made a mistake.

### Run It Yourself
1. Create a .NET 8 WPF Application project: `dotnet new wpf -n WpfApp`.
2. Replace `MainWindow.xaml` with the XML above.
3. Replace `MainWindow.xaml.cs` with the C# above.
4. Run with `dotnet run`.
5. Type in the top box. Notice the bottom box updates when you exceed 40 characters. Click the button to copy the exact text down.

---

## Concept Unit: Label vs TextBlock

### The Problem
You need to place descriptive text next to an input control. You could just draw the text, but users who rely on keyboards expect to press a shortcut key (like `Alt+N`) to jump straight to the input box.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Label Example" Height="150" Width="300">
    <StackPanel Margin="10">
        <Label Content="_Name:" Target="{Binding ElementName=NameBox}" />
        <TextBox Name="NameBox" />
        
        <TextBlock Text="This is just plain text. It cannot hold focus." Margin="0,10,0,0"/>
    </StackPanel>
</Window>
```

```csharp
using System.Windows;

namespace WpfApp;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }
}
```

### Mechanical Walkthrough
- `Label` is a `ContentControl`. It wraps its content (the string "_Name:") and adds functionality.
- `Content="_Name:"` defines what the label displays. The underscore `_` tells WPF to underline the 'N' and create an access key (`Alt+N`).
- `Target="{Binding ElementName=NameBox}"` wires the label to the textbox. When the access key is pressed, or the label is clicked (in some accessibility contexts), WPF physically moves the keyboard cursor into `NameBox`. Without this, the access key does nothing.
- `TextBlock` is a primitive element. It has no `Content` property, only `Text`. It has no `Target` property. It simply draws text on the screen.

### CS Lens
This is delegation of responsibility. The input control (`TextBox`) focuses on capturing data. The descriptive element (`Label`) focuses on accessibility mapping, delegating the actual focus acquisition to its `Target`.

### SE Lens
A `TextBlock` is vastly cheaper in memory and rendering time than a `Label`. The engineering principle is "pay for what you use." If you do not need access keys or focus forwarding, use `TextBlock`. If you use `Label` everywhere just to display text, your application will render slower and consume more memory unnecessarily.

### Run It Yourself
1. Replace `MainWindow.xaml` and `MainWindow.xaml.cs` with the code above.
2. Run with `dotnet run`.
3. Press `Alt` on your keyboard. The 'N' in Name will underline.
4. Press `Alt+N`. The blinking cursor will immediately jump inside the TextBox.

---

## Concept Unit: Button

### The Problem
You need a clickable area to trigger an action, but you want it to look like more than just a grey rectangle with text. You need an icon, or formatted text, inside the clickable area.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Button Example" Height="200" Width="300">
    <StackPanel Margin="10">
        <Button Name="SubmitButton" Click="SubmitButton_Click" Height="50">
            <StackPanel Orientation="Horizontal">
                <TextBlock Text="🚀" FontSize="24" Margin="0,0,10,0"/>
                <TextBlock Text="LAUNCH" VerticalAlignment="Center" FontWeight="Bold"/>
            </StackPanel>
        </Button>
    </StackPanel>
</Window>
```

```csharp
using System.Windows;
using System.Windows.Controls;

namespace WpfApp;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void SubmitButton_Click(object sender, RoutedEventArgs e)
    {
        SubmitButton.IsEnabled = false;
        
        // Simulating a delay, then we would re-enable it.
        // For this code, we just leave it disabled to prove it works.
        MessageBox.Show("Launched!");
    }
}
```

### Mechanical Walkthrough
- `Button` tags surround a `StackPanel`. Because `Button` is a `ContentControl`, it accepts exactly one child object. Here, the child is the `StackPanel`.
- `<TextBlock Text="🚀"... />` and `<TextBlock Text="LAUNCH"... />` are nested inside the `StackPanel`. This proves the `Button`'s interior can be as complex as an entire layout.
- `SubmitButton.IsEnabled = false;` physically disables the button. It turns grey, stops accepting clicks, and stops firing the `Click` event. Without this, a user could double-click rapidly and trigger the event twice before the first one finishes.

### CS Lens
Composition. A `Button` does not need specialized properties like `IconImage` or `SubtitleText`. By composing primitive visual elements (like `StackPanel` and `TextBlock`) inside a behavioral container (`Button`), the API remains small but infinitely flexible.

### SE Lens
Disabling buttons upon click is defensive programming. The alternative is tracking whether an operation is running using a boolean flag in your code. Disabling the UI physically prevents the input at the source, which is structurally safer than trusting your logic to ignore overlapping events.

### Run It Yourself
1. Replace `MainWindow.xaml` and `MainWindow.xaml.cs` with the code above.
2. Run with `dotnet run`.
3. Click the button.
4. A message box appears. When you dismiss it, the button is greyed out and cannot be clicked again.

---

## Concept Unit: CheckBox

### The Problem
You need the user to make a binary (yes/no) choice, but sometimes the concept applies to a group where some items are yes and some are no, requiring a "mixed" or "indeterminate" state.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="CheckBox Example" Height="150" Width="300">
    <StackPanel Margin="10">
        <CheckBox Name="AgreeCheckBox" 
                  Content="I agree to the terms" 
                  IsThreeState="True"
                  Checked="CheckBox_Toggled"
                  Unchecked="CheckBox_Toggled"
                  Indeterminate="CheckBox_Toggled" />
        <TextBlock Name="StatusText" Margin="0,10,0,0" />
    </StackPanel>
</Window>
```

```csharp
using System.Windows;

namespace WpfApp;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void CheckBox_Toggled(object sender, RoutedEventArgs e)
    {
        bool? currentState = AgreeCheckBox.IsChecked;

        if (currentState == true)
        {
            StatusText.Text = "Status: Agreed";
        }
        else if (currentState == false)
        {
            StatusText.Text = "Status: Declined";
        }
        else if (currentState == null)
        {
            StatusText.Text = "Status: Undecided";
        }
    }
}
```

### Mechanical Walkthrough
- `IsThreeState="True"` allows the checkbox to enter the indeterminate state when clicked. Without it, clicking only toggles between checked and unchecked.
- `bool? currentState` declares a nullable boolean. It can hold `true`, `false`, or `null`. This maps exactly to the three states of the checkbox.
- `Checked`, `Unchecked`, and `Indeterminate` all point to the exact same method `CheckBox_Toggled`. This proves you can route multiple distinct events to one centralized handler if the logic relies on reading the current state anyway.
- `currentState == null` checks for the indeterminate state.

### CS Lens
This is ternary logic. Traditional computing relies on binary states (0 or 1). Three-state logic introduces a null or unknown state, essential for data aggregation. If you select five files, and three are read-only, the "Is Read Only" checkbox for the group cannot be true or false. It must be indeterminate.

### SE Lens
Mapping three states requires a nullable type (`bool?`). The alternative is using an enumeration (`enum State { True, False, Mixed }`). Nullable types integrate cleanly with databases that support NULL columns, but can cause `NullReferenceException`s if you force them into standard booleans without checking first (`if ((bool)IsChecked)` will crash if it is null).

### Run It Yourself
1. Replace `MainWindow.xaml` and `MainWindow.xaml.cs` with the code above.
2. Run with `dotnet run`.
3. Click the checkbox repeatedly. Watch it cycle through checked (check mark), indeterminate (solid box), and unchecked (empty). The text updates accordingly.

---

## Concept Unit: ComboBox

### The Problem
You have a predefined list of options, and the user must select exactly one. A text box invites typos, and ten radio buttons take up too much screen space.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="ComboBox Example" Height="150" Width="300">
    <StackPanel Margin="10">
        <ComboBox Name="ColorDropdown" SelectionChanged="ColorDropdown_SelectionChanged">
            <ComboBoxItem Content="Red" />
            <ComboBoxItem Content="Green" />
            <ComboBoxItem Content="Blue" />
        </ComboBox>
        <TextBlock Name="SelectionText" Margin="0,10,0,0" />
    </StackPanel>
</Window>
```

```csharp
using System.Windows;
using System.Windows.Controls;

namespace WpfApp;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void ColorDropdown_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        int index = ColorDropdown.SelectedIndex;
        
        // SelectedItem returns an object, which we cast to ComboBoxItem
        ComboBoxItem? selectedItem = ColorDropdown.SelectedItem as ComboBoxItem;
        
        if (selectedItem != null)
        {
            string value = selectedItem.Content.ToString() ?? "";
            SelectionText.Text = $"Index: {index}, Value: {value}";
        }
    }
}
```

### Mechanical Walkthrough
- `<ComboBoxItem>` defines a single, selectable row within the dropdown.
- `SelectionChanged="ColorDropdown_SelectionChanged"` fires the moment the user clicks a new item in the list, or navigates to it with the keyboard.
- `ColorDropdown.SelectedIndex` gets the zero-based integer of the chosen item. If nothing is selected, this is `-1`.
- `ColorDropdown.SelectedItem` returns the actual `ComboBoxItem` object. Because it returns a generic `object`, you must cast it using `as ComboBoxItem` to access its properties.
- `selectedItem.Content.ToString()` retrieves the string (e.g., "Red") stored inside the chosen item.

### CS Lens
The `ComboBox` separates the concept of the *collection* (the items available) from the *pointer* (the selected item). `SelectedIndex` is a memory offset (an integer index in an array), while `SelectedItem` is a direct reference to the object at that offset.

### SE Lens
Hardcoding `<ComboBoxItem>` in XAML is fast for static lists. The alternative is using the `ItemsSource` property in C# to bind to a dynamic `List<string>`. Hardcoding fails if the options change based on database data, but is perfectly acceptable for immutable choices like "Left, Center, Right".

### Run It Yourself
1. Replace `MainWindow.xaml` and `MainWindow.xaml.cs` with the code above.
2. Run with `dotnet run`.
3. Open the dropdown. Select "Green".
4. The text block immediately reads "Index: 1, Value: Green".

---

## Connect the Pieces
Imagine a user registration form. The user types their name in a `TextBox`. A `Label` ensures screen readers understand what the box is for. They choose their country from a `ComboBox`. They click a `CheckBox` to accept the terms of service. Finally, they click the `Button`. In the `Button.Click` event, your C# code reads `TextBox.Text`, `ComboBox.SelectedItem`, and `CheckBox.IsChecked`. All visual elements resolve to simple C# data types (strings, objects, and nullable booleans) right at the moment the action executes.

## What Breaks Without This
If you try to read the boolean value of a `CheckBox` without handling the null state when `IsThreeState="True"`, your program will crash.

Change the CheckBox C# code to this:
```csharp
bool currentState = (bool)AgreeCheckBox.IsChecked;
```
Run the application and click the CheckBox until it reaches the indeterminate state. The program will immediately throw an `System.InvalidOperationException: Nullable object must have a value`. You must use `bool?` or explicitly check for `null`. Restore it to `bool? currentState = AgreeCheckBox.IsChecked;` to fix the crash.

## Exercises
1. Modify the `TextBox` example. Add a second `TextBox` that is read-only. In the `TextChanged` event of the first, update the second one so it always shows exactly what the user is typing, instantly.
2. Modify the `Button` example. Instead of disabling the button, change the text of the `TextBlock` inside it from "LAUNCH" to "WORKING..." when clicked.
3. Modify the `ComboBox` example. Add a button that, when clicked, reads `ColorDropdown.SelectedIndex`. If it is `-1` (nothing selected), display an error message. Otherwise, display the selection.

## Definition of Done
- You can explain the difference between `TextBlock` and `Label`.
- You can retrieve text from a `TextBox` in code.
- You understand why a CheckBox uses a nullable boolean (`bool?`).
- You can wire an event handler to a button click.
- You can explain how to retrieve the active choice from a `ComboBox` out loud, in your own words, to someone who hasn't read this lesson.
