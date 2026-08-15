# Lesson 29: Control Templates

**What you will build:** A complete structural replacement for a standard WPF control. You will strip a button down to its bare behaviors—clicking and states—while discarding its default rectangular appearance. You will build a completely new visual structure for it from scratch, ensuring it still displays its content and responds to user interaction correctly.

**What you need to know first:** Lesson 28: Styles, Lesson 12: Data Binding, Lesson 18: Triggers.

**Terms introduced in this lesson:**
- **Control Template** — a defined tree of visual elements that dictates exactly what a control looks like. *Why it exists:* To decouple a control's behavior (its events and logic) from its visual appearance, allowing developers to completely redesign built-in controls without writing new C# classes.

**Objects and methods used:**
- **ControlTemplate**
  - *What it is:* A class that defines the element tree used to render a control.
  - *Implementation:* `<ControlTemplate TargetType="Button"> ... </ControlTemplate>`
  - *Its use:* Assigned to the `Template` property of any WPF `Control`.
- **ContentPresenter**
  - *What it is:* A special placeholder element used exclusively inside a `ControlTemplate`.
  - *Implementation:* `<ContentPresenter />`
  - *Its use:* It marks the exact location where the control's `Content` (like text or an image) should be drawn inside the template.
- **TemplateBinding**
  - *What it is:* A specialized, lightweight data binding markup extension.
  - *Implementation:* `Background="{TemplateBinding Background}"`
  - *Its use:* Used inside a template to link a visual element's property to a property on the control being templated.

---

## Concept Unit: What a ControlTemplate Is

### The Problem
Every WPF control has a default look. A `Button` looks like a rectangle with text inside it. But a `Button` is conceptually just a thing that fires a `Click` event when pressed. If you want a circular button, setting the `Background` or `BorderBrush` on a standard button is not enough. You must completely replace the default visual structure. 

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/schemas/markup-compatibility/2006"
        Title="ControlTemplate Demo" Height="200" Width="300">
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center">
        <Button Width="100" Height="100" Click="Button_Click">
            <Button.Template>
                <ControlTemplate TargetType="Button">
                    <Ellipse Fill="DodgerBlue" Stroke="Black" StrokeThickness="2" />
                </ControlTemplate>
            </Button.Template>
        </Button>
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

    private void Button_Click(object sender, RoutedEventArgs e)
    {
        MessageBox.Show("Clicked the circle!");
    }
}
```

### Mechanical Walkthrough
- `<Button.Template>` assigns a new value to the `Template` property of the `Button`. This overrides the default visual structure completely.
- `<ControlTemplate TargetType="Button">` declares a new visual tree specifically for a `Button`. The `TargetType` tells WPF what properties will be available.
- `<Ellipse Fill="DodgerBlue" ... />` is the entire visual tree for this button. There is no `Border`, no text, just an ellipse. When rendered, the button is exactly this blue circle. Because it is assigned to a `Button`, clicking the ellipse fires the button's `Click` event.

### CS Lens
The Separation of Concerns principle. The C# class `Button` implements the behavior (event routing, state management). The `ControlTemplate` implements the view (shapes, colors, layout). The class does not know what shape it is.

### SE Lens
The Open-Closed Principle applied to UI. You can extend the visual appearance of a control infinitely without modifying its source code. The alternative not chosen is creating a custom `CircleButton` class that overrides the `OnRender` method and manually draws circles with graphics APIs. That approach costs massive amounts of code and makes XAML integration rigid.

### Run It Yourself
Create a new .NET 8 WPF Application project. Paste the XAML into `MainWindow.xaml` and the C# into `MainWindow.xaml.cs`. Run the application. You will see a blue circle. Click anywhere inside the blue circle, and the message box will appear. Click outside the circle, and nothing happens.

---

## Concept Unit: ContentPresenter

### The Problem
If you ran the previous code, you might have noticed something missing: the button's content. If you write `<Button>Hello</Button>`, the word "Hello" is the `Content` property. But our ellipse template did not draw it. A template dictates exactly what is rendered. If you don't explicitly tell the template where to put the `Content`, it will not be displayed.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/schemas/markup-compatibility/2006"
        Title="ContentPresenter Demo" Height="200" Width="300">
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center">
        <Button Width="100" Height="100" Content="Click Me!">
            <Button.Template>
                <ControlTemplate TargetType="Button">
                    <Grid>
                        <Ellipse Fill="MediumSeaGreen" />
                        <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center" />
                    </Grid>
                </ControlTemplate>
            </Button.Template>
        </Button>
    </StackPanel>
</Window>
```

### Mechanical Walkthrough
- `<Grid>` is used as the root of the template because an `Ellipse` cannot contain child elements. We need the text to float on top of the shape.
- `<ContentPresenter ... />` acts as a placeholder. When WPF applies this template to the `Button`, it looks for a `ContentPresenter`. When it finds one, it automatically injects the `Button`'s `Content` ("Click Me!") into that exact spot in the visual tree.
- `HorizontalAlignment="Center" VerticalAlignment="Center"` on the `ContentPresenter` ensures the injected content is centered over the ellipse. Without this, the text would default to the top-left corner of the grid.

### CS Lens
A macro or a placeholder variable in text rendering. The `ContentPresenter` is a specialized token (`{ContentGoesHere}`) that the layout engine replaces with the actual payload of the control at runtime.

### SE Lens
Composition over inheritance. Instead of creating specific classes for buttons containing text, buttons containing images, and buttons containing panels, WPF provides a single `Button` class that can hold any `Content`. The `ContentPresenter` is the mechanism that makes this loose coupling work visually. The cost is that templates can become deeply nested and complex to debug if the `ContentPresenter` is placed incorrectly.

### Run It Yourself
Update `MainWindow.xaml` with the new code. Run the application. You will see a green circle with the text "Click Me!" perfectly centered inside it.

---

## Concept Unit: TemplateBinding

### The Problem
A template defines the visual structure, but it usually needs to respect the properties set on the control itself. If a developer writes `<Button Background="Red" ...>`, but your template hardcodes `<Ellipse Fill="MediumSeaGreen" />`, the button will always be green. The red background requested by the developer is ignored. The template must actively pull values from the control it is templating.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/schemas/markup-compatibility/2006"
        Title="TemplateBinding Demo" Height="200" Width="300">
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center" Spacing="10">
        
        <Button Width="150" Height="50" Content="Button 1" Background="Tomato">
            <Button.Template>
                <ControlTemplate TargetType="Button">
                    <Border Background="{TemplateBinding Background}" CornerRadius="10">
                        <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
                    </Border>
                </ControlTemplate>
            </Button.Template>
        </Button>

        <Button Width="150" Height="50" Content="Button 2" Background="Plum">
            <Button.Template>
                <ControlTemplate TargetType="Button">
                    <Border Background="{Binding RelativeSource={RelativeSource TemplatedParent}, Path=Background}" CornerRadius="10">
                        <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
                    </Border>
                </ControlTemplate>
            </Button.Template>
        </Button>

    </StackPanel>
</Window>
```

### Mechanical Walkthrough
- `Background="{TemplateBinding Background}"` tells the `Border` inside the template to read its `Background` value from the `Background` property of the `Button` that owns the template. When applied to Button 1, it becomes Tomato.
- `{Binding RelativeSource={RelativeSource TemplatedParent}, Path=Background}` does the exact same thing for Button 2. It finds the parent control that applied the template (`TemplatedParent`) and binds to its `Background` path.
- `TemplateBinding` is a specialized, optimized version of `RelativeSource TemplatedParent`. It evaluates faster but only works inside a `ControlTemplate` and only supports one-way binding.

### CS Lens
Parameter passing. The `TemplateBinding` acts as an argument passed from the outer context (the specific button instance) into the inner context (the template definition).

### SE Lens
API contract mapping. The control exposes properties (`Background`, `Foreground`, `BorderBrush`) as its public API. The template maps those API values to specific visual elements. The alternative is requiring developers to reach inside the template to change colors, which breaks encapsulation. The tradeoff of `TemplateBinding` is that it fails silently if you misspell the property name, and it cannot handle two-way data flow.

### Run It Yourself
Update `MainWindow.xaml` with the new code. Run the application. You will see two rounded rectangular buttons. The first is Tomato (red-orange) and the second is Plum (purple). Both use the exact same logic to pull their colors from the outer control definition.

---

## Concept Unit: Triggers Inside a ControlTemplate

### The Problem
A static template makes the control look the same at all times. A standard WPF button reacts to user input: it lights up when the mouse hovers over it, and it visually depresses when clicked. To build a complete template, you must define how the visual tree changes when the control's state properties (`IsMouseOver`, `IsPressed`) change.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/schemas/markup-compatibility/2006"
        Title="Template Triggers Demo" Height="200" Width="300">
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center">
        <Button Width="120" Height="40" Content="Hover &amp; Click" Background="LightGray">
            <Button.Template>
                <ControlTemplate TargetType="Button">
                    <Border x:Name="RootBorder" 
                            Background="{TemplateBinding Background}" 
                            BorderBrush="Black" 
                            BorderThickness="1"
                            Padding="0,0,3,3">
                        <Border x:Name="InnerBorder" Background="WhiteSmoke" BorderBrush="Gray" BorderThickness="1">
                            <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
                        </Border>
                    </Border>
                    <ControlTemplate.Triggers>
                        <Trigger Property="IsMouseOver" Value="True">
                            <Setter TargetName="InnerBorder" Property="Background" Value="LightSkyBlue" />
                        </Trigger>
                        <Trigger Property="IsPressed" Value="True">
                            <Setter TargetName="RootBorder" Property="Padding" Value="3,3,0,0" />
                            <Setter TargetName="InnerBorder" Property="Background" Value="DeepSkyBlue" />
                        </Trigger>
                    </ControlTemplate.Triggers>
                </ControlTemplate>
            </Button.Template>
        </Button>
    </StackPanel>
</Window>
```

### Mechanical Walkthrough
- `x:Name="RootBorder"` and `x:Name="InnerBorder"` assign names to specific elements inside the template. This allows the triggers below to target them directly.
- `<ControlTemplate.Triggers>` begins the section where state changes are defined. These triggers are evaluated entirely within the context of the templated control.
- `<Trigger Property="IsMouseOver" Value="True">` listens to the `Button.IsMouseOver` property.
- `<Setter TargetName="InnerBorder" Property="Background" Value="LightSkyBlue" />` tells the trigger: "When `IsMouseOver` is true, reach out to the element named `InnerBorder` and change its `Background`." 
- `Property="IsPressed"` triggers when the user holds the mouse button down on the control. Changing the `Padding` on `RootBorder` creates a visual shifting effect, making the inner border look like it is physically pressing down into the screen.

### CS Lens
A state machine controlling a scene graph. The button's C# code transitions the control between states (Normal -> Hover -> Pressed). The `ControlTemplate.Triggers` act as the rendering rules for each specific state.

### SE Lens
Declarative state management. By defining state responses in XAML, the UI logic is separated from the application logic. The alternative not chosen is wiring up `MouseEnter` and `MouseLeave` event handlers in C# and manually updating colors in code. The cost of the declarative approach is verbosity; XAML triggers require many lines of code for simple visual shifts.

### Run It Yourself
Update `MainWindow.xaml` with the new code. Run the application. 
1. The button appears flat with a shadow effect created by padding.
2. Move your mouse over it. The inner background turns light blue.
3. Click and hold the mouse button. The inner background turns deeper blue, and the text physically shifts down and to the right, simulating a mechanical button press.

---

## Connect the Pieces
Consider the `Button`'s `Background` property. The developer sets it to `LightGray` in the outer `<Button>` tag. The `TemplateBinding` inside the `ControlTemplate` reads this value and applies it to the `RootBorder`. When the user interacts with the control, the `ControlTemplate.Triggers` evaluate properties like `IsMouseOver`. Because the triggers use `TargetName` to modify the `InnerBorder`, the outer `LightGray` background remains intact, but the inner appearance updates dynamically in response to state, all while the `ContentPresenter` ensures the text remains visible on top.

## What Breaks Without This
If you attempt to target an element inside a `ControlTemplate` without giving it an `x:Name`, the trigger cannot find it.
Change the hover setter from:
`<Setter TargetName="InnerBorder" Property="Background" Value="LightSkyBlue" />`
to:
`<Setter Property="Background" Value="LightSkyBlue" />`

When you compile and run, hovering over the button no longer changes the inner background. Instead, the trigger applies the `Background` change to the *outer* `Button` control itself. Because the `InnerBorder` has its own hardcoded `Background="WhiteSmoke"`, it covers up the button's background. The visual state change fails because the trigger targeted the wrong element in the tree.

## Exercises
1. Modify the `TemplateBinding` example so the `BorderThickness` and `BorderBrush` of the template are bound to the `Button`'s `BorderThickness` and `BorderBrush` properties.
2. Add a trigger to the final example that listens to the `IsEnabled` property. When `IsEnabled="False"`, change the text color (the `Foreground` property on the `Button`) to `Gray` and the inner background to `DarkGray`. Test it by adding `IsEnabled="False"` to the `<Button>` declaration.
3. Remove the `ContentPresenter` from the final example entirely. Note how the text vanishes, but the hover and press animations still work flawlessly.

## Definition of Done
- [ ] You have built a custom `ControlTemplate` that replaces a control's visual structure.
- [ ] You have used a `ContentPresenter` to display control content inside a template.
- [ ] You have used `TemplateBinding` to pass property values from a control into its template.
- [ ] You have used `ControlTemplate.Triggers` to change the appearance of specific named elements within the template based on control state.
- [ ] You can explain what a `ControlTemplate` is out loud, in your own words, to someone who hasn't read this lesson.
