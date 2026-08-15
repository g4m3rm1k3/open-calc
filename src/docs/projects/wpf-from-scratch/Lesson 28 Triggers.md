# Lesson 28: Triggers

**What you will build:** You will build a set of interactive UI elements that change their appearance and animate automatically based on their state, their data, or user actions. You will prove that WPF can handle complex visual state changes entirely in markup, eliminating the need to write manual event handlers in C# code-behind.

**What you need to know first:** Lesson 27: Styles, Lesson 18: Data Binding.

**Terms introduced in this lesson:**
- **Trigger** — a declarative rule inside a Style or ControlTemplate that applies property changes or actions when a specific condition is met. *Why it exists:* To allow UI components to react to state changes without writing procedural C# event handler code.
- **Storyboard** — a container object that orchestrates one or more animations over time. *Why it exists:* To coordinate multiple animations and provide a targetable object that can be started, stopped, or paused by a trigger.

**Objects and methods used:**
- **Trigger**
  - *What it is:* A style rule that evaluates a single dependency property on the control.
  - *Implementation:* `<Trigger Property="string" Value="object">`
  - *Its use:* Applying setters when a control's property (like `IsMouseOver`) matches the `Value`.
- **DataTrigger**
  - *What it is:* A style rule that evaluates a data binding expression instead of a direct property.
  - *Implementation:* `<DataTrigger Binding="{Binding string}" Value="object">`
  - *Its use:* Altering UI appearance based on underlying view model data, rather than control state.
- **MultiTrigger / MultiDataTrigger**
  - *What it is:* A trigger that requires multiple conditions to all evaluate to true simultaneously.
  - *Implementation:* `<MultiTrigger><MultiTrigger.Conditions>...</MultiTrigger.Conditions>`
  - *Its use:* Handling complex states, like being both hovered and enabled.
- **EventTrigger**
  - *What it is:* A trigger that fires when a specific routed event occurs, rather than when a property changes state.
  - *Implementation:* `<EventTrigger RoutedEvent="string">`
  - *Its use:* Starting storyboards and animations in response to events like `MouseEnter`.
- **DoubleAnimation**
  - *What it is:* An animation that transitions a `double` property between two values over a specified duration.
  - *Implementation:* `<DoubleAnimation To="double" Duration="TimeSpan" />`
  - *Its use:* Smoothly changing properties like `Opacity` or `Width`.

---

## Concept Unit: Property Triggers

### The Problem
When a user interacts with a control, such as hovering a mouse over a button, the button should provide visual feedback. Historically, this required writing an event handler for the mouse enter event to change the background color, and another handler for the mouse leave event to change it back. This clutters the C# code-behind with purely visual concerns.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Property Triggers" Height="200" Width="300">
    <Window.Resources>
        <Style TargetType="Button">
            <Setter Property="Background" Value="LightGray" />
            <Setter Property="Padding" Value="20,10" />
            <Style.Triggers>
                <Trigger Property="IsMouseOver" Value="True">
                    <Setter Property="Background" Value="LightBlue" />
                    <Setter Property="Foreground" Value="DarkBlue" />
                </Trigger>
            </Style.Triggers>
        </Style>
    </Window.Resources>
    <Grid>
        <Button Content="Hover Me" HorizontalAlignment="Center" VerticalAlignment="Center" />
    </Grid>
</Window>
```

### Mechanical Walkthrough
- `<Style.Triggers>`: The collection property on a `Style` where all trigger definitions reside. A style can have many triggers.
- `<Trigger Property="IsMouseOver" Value="True">`: The condition. WPF monitors the `IsMouseOver` dependency property of the `Button`. When it becomes `True`, the trigger activates.
- `<Setter Property="Background" Value="LightBlue" />`: The action taken when the trigger is active. It overrides the default `Background` setter defined earlier in the style.
- Reversal: There is no code to change the color back. When `IsMouseOver` becomes `False`, WPF automatically deactivates the trigger and reverts the button's properties to their pre-trigger values.

### CS Lens
This is declarative state management. Instead of writing imperative instructions (transitions), you define the target state corresponding to a condition. The framework handles the state transitions and reversions. This is functionally equivalent to CSS pseudo-classes (like `:hover`).

### SE Lens
The principle is Separation of Concerns. By moving visual interaction logic into XAML, C# code is reserved for actual business logic. The tradeoff is that complex logical conditions can become verbose and difficult to debug in XAML compared to a step-through C# debugger.

### Run It Yourself
1. Create a new WPF project: `dotnet new wpf -n TriggersApp`.
2. Open `MainWindow.xaml` and replace its contents with the code above.
3. Run the application: `dotnet run`.
4. Hover your mouse over the button. The background turns light blue and the text turns dark blue. Move the mouse away, and it reverts immediately.

---

## Concept Unit: Data Triggers

### The Problem
A standard `Trigger` only watches dependency properties on the control itself. If you want a UI element to change appearance based on the *data* it is displaying—for example, making text bold if a user is an administrator—a standard trigger cannot evaluate the bound data object.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Data Triggers" Height="300" Width="300">
    <Window.Resources>
        <Style TargetType="TextBlock" x:Key="UserItemStyle">
            <Setter Property="FontSize" Value="14" />
            <Setter Property="Margin" Value="5" />
            <Style.Triggers>
                <DataTrigger Binding="{Binding IsAdmin}" Value="True">
                    <Setter Property="FontWeight" Value="Bold" />
                    <Setter Property="Foreground" Value="Red" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Window.Resources>
    <StackPanel Margin="10">
        <TextBlock Text="Alice (Standard)" Style="{StaticResource UserItemStyle}">
            <TextBlock.DataContext>
                <local:User Name="Alice" IsAdmin="False" xmlns:local="clr-namespace:WpfApp" />
            </TextBlock.DataContext>
        </TextBlock>
        <TextBlock Text="Bob (Admin)" Style="{StaticResource UserItemStyle}">
            <TextBlock.DataContext>
                <local:User Name="Bob" IsAdmin="True" xmlns:local="clr-namespace:WpfApp" />
            </TextBlock.DataContext>
        </TextBlock>
    </StackPanel>
</Window>
```

To make this run, replace the contents of `MainWindow.xaml.cs` with this:

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

public class User
{
    public string Name { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
}
```

### Mechanical Walkthrough
- `<DataTrigger Binding="{Binding IsAdmin}" Value="True">`: Instead of evaluating a UI property, `DataTrigger` evaluates a standard data binding expression. It checks if the `IsAdmin` property on the current `DataContext` equals `True`.
- `<Setter Property="FontWeight" Value="Bold" />`: Applied only to elements where the bound data matches the condition.
- `<TextBlock.DataContext>`: We inject the data directly in XAML for this demonstration. The second `TextBlock` has a data context where `IsAdmin` is true, so the `DataTrigger` activates for that element only.

### CS Lens
This is an evaluation projection. The framework projects the state of an external domain object (the `User`) onto the visual tree, bridging the gap between data representation and visual representation.

### SE Lens
DataTriggers enforce the MVVM (Model-View-ViewModel) pattern. The ViewModel exposes purely logical state (`IsAdmin`), and the View decides entirely on its own how to represent that state visually (bold red text). The alternative is having the ViewModel expose a `Color` property, which couples the ViewModel to the presentation technology.

### Run It Yourself
1. Use the same project from the previous unit.
2. Replace `MainWindow.xaml` and `MainWindow.xaml.cs` with the code above.
3. Run the application.
4. Note that "Bob" is bold and red, while "Alice" is standard text, driven entirely by the data object properties.

---

## Concept Unit: Multi-Conditions

### The Problem
Sometimes a state depends on more than one factor. For example, a button should only show a hover effect if it is actually enabled. If it is disabled, hovering over it should do nothing. A single `Trigger` cannot evaluate two properties at once.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Multi Triggers" Height="200" Width="300">
    <Window.Resources>
        <Style TargetType="Button">
            <Setter Property="Background" Value="LightGray" />
            <Setter Property="Padding" Value="20,10" />
            <Style.Triggers>
                <MultiTrigger>
                    <MultiTrigger.Conditions>
                        <Condition Property="IsMouseOver" Value="True" />
                        <Condition Property="IsEnabled" Value="True" />
                    </MultiTrigger.Conditions>
                    <MultiTrigger.Setters>
                        <Setter Property="Background" Value="LightGreen" />
                    </MultiTrigger.Setters>
                </MultiTrigger>
            </Style.Triggers>
        </Style>
    </Window.Resources>
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center" Spacing="10">
        <Button Content="Enabled Button" IsEnabled="True" />
        <Button Content="Disabled Button" IsEnabled="False" />
    </StackPanel>
</Window>
```

### Mechanical Walkthrough
- `<MultiTrigger>`: A trigger type designed to evaluate an array of conditions using a logical AND operation.
- `<MultiTrigger.Conditions>`: The collection holding the individual requirements.
- `<Condition Property="..." Value="..." />`: An individual requirement. Both the mouse must be over the element, AND the element must be enabled.
- `<MultiTrigger.Setters>`: Unlike a single `Trigger` which implicitly holds setters in its body, `MultiTrigger` requires you to explicitly wrap the setters in this element.

### CS Lens
This is a boolean AND gate. All inputs (conditions) must be true for the output (setters) to be applied. There is no `OrTrigger`; to achieve a logical OR, you define multiple separate `Trigger` elements that apply the same setters.

### SE Lens
XAML logic is intentionally limited. By forcing complex conditions into strict AND gates, WPF encourages keeping intricate boolean logic in the C# domain model (where it can be unit tested) rather than embedding spaghetti logic in the UI markup. If you need a complex OR/AND/NOT evaluation, you should expose a single boolean property on your ViewModel and bind to it with a `DataTrigger`.

### Run It Yourself
1. Replace `MainWindow.xaml` with the code above.
2. Run the application.
3. Hover over the "Enabled Button". It turns green.
4. Hover over the "Disabled Button". It remains gray, because the `IsEnabled="True"` condition is not met.

---

## Concept Unit: Event Triggers and Animation

### The Problem
Property triggers and data triggers are state-based: while condition X is true, apply setter Y. But some visual changes are continuous transitions over time, or reactions to transient events (like a click or the moment the mouse enters). You cannot assign an animation to a property using a simple setter.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Event Triggers" Height="200" Width="300">
    <Grid Background="White">
        <Border Width="100" Height="100" Background="Purple" Opacity="0.2">
            <Border.Style>
                <Style TargetType="Border">
                    <Style.Triggers>
                        <EventTrigger RoutedEvent="MouseEnter">
                            <BeginStoryboard>
                                <Storyboard>
                                    <DoubleAnimation Storyboard.TargetProperty="Opacity"
                                                     To="1.0" Duration="0:0:0.5" />
                                </Storyboard>
                            </BeginStoryboard>
                        </EventTrigger>
                        <EventTrigger RoutedEvent="MouseLeave">
                            <BeginStoryboard>
                                <Storyboard>
                                    <DoubleAnimation Storyboard.TargetProperty="Opacity"
                                                     To="0.2" Duration="0:0:0.5" />
                                </Storyboard>
                            </BeginStoryboard>
                        </EventTrigger>
                    </Style.Triggers>
                </Style>
            </Border.Style>
        </Border>
    </Grid>
</Window>
```

### Mechanical Walkthrough
- `<EventTrigger RoutedEvent="MouseEnter">`: This trigger does not check a boolean state. It listens for the moment the `MouseEnter` event fires.
- `<BeginStoryboard>`: An action that starts an animation sequence when the event fires.
- `<Storyboard>`: A timeline container that groups one or more animations.
- `<DoubleAnimation>`: Instructs WPF to gradually change a `double` property.
- `Storyboard.TargetProperty="Opacity"`: Identifies which property to animate.
- `To="1.0" Duration="0:0:0.5"`: The animation target value and how long it should take (0 hours, 0 minutes, 0.5 seconds).
- The `MouseLeave` event trigger is required because, unlike property triggers, event triggers do not automatically reverse their actions. The animation permanently changes the property unless another animation changes it back.

### CS Lens
This is an event-driven side effect. The trigger maps a discrete event in time to a continuous mathematical interpolation function. The framework handles the rapid timer ticks required to update the `Opacity` value on every frame.

### SE Lens
Animations in XAML keep the UI thread clear. WPF executes `Storyboard` animations using the composition engine on a separate rendering thread whenever possible. If you attempted to implement this with a `Thread.Sleep` loop in C#, it would block the UI thread and freeze the application.

### Run It Yourself
1. Replace `MainWindow.xaml` with the code above.
2. Run the application.
3. Move your mouse into the purple square. It will smoothly fade from mostly transparent to solid over half a second.
4. Move your mouse out. It will smoothly fade back.

---

## Connect the Pieces
A user interaction traces through the system: The user's physical mouse movement generates a Windows message. WPF translates this into a `MouseEnter` routed event and sets the `IsMouseOver` dependency property to true. A `Style` on the control contains a `Trigger` monitoring `IsMouseOver`. The trigger evaluates to true and pushes new values from its `Setter` collection into the control's dependency property system. The layout engine detects the property change, recalculates the visual representation, and the render thread draws the new visual state to the screen.

## What Breaks Without This
If you attempt to use an `EventTrigger` to simply set a property without a Storyboard, it fails.

```xml
<EventTrigger RoutedEvent="MouseEnter">
    <!-- This will not compile -->
    <Setter Property="Background" Value="Red" />
</EventTrigger>
```

**Compiler Error:** `The property 'Actions' does not support values of type 'Setter'.`
**Why:** Event triggers represent a point in time, not a duration of state. Setters require a duration of state to know when to revert. Event triggers only support actions (like `BeginStoryboard`), which execute and complete.

## Exercises
1. Modify the Data Triggers example to use a `MultiDataTrigger`. Make the text bold and red only if the user `IsAdmin` AND their `Name` is exactly "Bob".
2. Modify the Event Triggers example to animate the `Width` of the border from 100 to 200 at the same time as the `Opacity` changes, within the same `Storyboard`.
3. Create a `Trigger` that changes a TextBox's background to yellow when it is focused (`IsKeyboardFocused`). Observe how it reverts when you click elsewhere.

## Definition of Done
- [ ] You have run every code example and verified the visual changes.
- [ ] You understand the difference between a state evaluating to true (`Trigger`) and an event firing (`EventTrigger`).
- [ ] You understand why `DataTrigger` is essential for the MVVM pattern.
- [ ] You can explain triggers out loud, in your own words, to someone who hasn't read this lesson.
