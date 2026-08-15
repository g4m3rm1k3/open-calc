# Lesson 19: Styles and Setters

**What you will build:** A set of isolated UI examples demonstrating how to centralize the appearance of elements. This proves that you can extract repetitive property assignments into a single, reusable definition, solving the problem of updating the visual design of an application without touching every single control. Every example is discarded after it proves its point.

**What you need to know first:** Lesson 16: Logical Resources, Lesson 18: Resource Dictionaries.

**Terms introduced in this lesson:**
- **Style** — a collection of property values that can be applied to elements. *Why it exists:* to decouple the appearance of a control from its structure and to enforce consistency.
- **Setter** — an instruction within a style that assigns a specific value to a specific property. *Why it exists:* to bridge the generic concept of a style with the concrete properties of a target object.
- **Implicit Style** — a style applied automatically to all elements of a specific type within its scope, because it lacks an explicit key. *Why it exists:* to define global themes for controls without requiring every instance to reference the style by name.

**Objects and methods used:**
- **Style**
  - *What it is:* A XAML element that groups Setters.
  - *Implementation:* `<Style TargetType="ControlTypeName" x:Key="OptionalKey">`
  - *Its use:* Placed in a `Resources` collection to be referenced by UI elements.
- **Setter**
  - *What it is:* A XAML element defining a single property-value pair.
  - *Implementation:* `<Setter Property="PropertyName" Value="PropertyValue" />`
  - *Its use:* Placed inside a `Style` to dictate what changes when the style is applied.

---

## Concept Unit: The Problem

### The Problem
Imagine an application with fifty buttons. You want them all to have a dark blue background, a specific font size, and consistent padding. You set these properties on every single button. Later, the design requirements change: the font size needs to be larger. You now have to find and edit fifty different XAML elements. This repetition violates the principle of keeping definitions in one place, making the code brittle and tedious to maintain.

---

## Concept Unit: Style and Setter

### The Problem
How do we extract repetitive property assignments into a named bundle, and apply that bundle to a specific control?

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="200" Width="300">
    <Window.Resources>
        <Style x:Key="MyButtonStyle" TargetType="Button">
            <Setter Property="Background" Value="LightBlue" />
            <Setter Property="FontSize" Value="16" />
            <Setter Property="Padding" Value="10" />
        </Style>
    </Window.Resources>
    
    <StackPanel Margin="20">
        <Button Style="{StaticResource MyButtonStyle}" Content="Styled Button" />
        <Button Content="Unstyled Button" Margin="0,10,0,0" />
    </StackPanel>
</Window>
```

### Mechanical Walkthrough
- `<Style x:Key="MyButtonStyle" TargetType="Button">`: Defines a style in the window's resources. `x:Key` gives it a unique name so it can be retrieved. `TargetType="Button"` restricts this style to only work on `Button` elements; without it, the compiler wouldn't know if the properties inside actually exist on the target.
- `<Setter Property="Background" Value="LightBlue" />`: An instruction inside the style. It tells the style to set the `Background` property of the target to `LightBlue`. If `TargetType` wasn't `Button`, this might fail if the target didn't have a `Background` property.
- `Style="{StaticResource MyButtonStyle}"`: The button asks the resource dictionary for the resource named `MyButtonStyle` and assigns it to its own `Style` property. This triggers the button to apply all the `Setter` instructions.
- The second `<Button>` has no style set, so it remains the default system appearance.

### CS Lens
This is fundamentally a macro or a template expansion at the object level. It is a configuration object containing key-value pairs that are injected into another object at runtime. In database terms, it is a schema definition dictating the default values for a record.

### SE Lens
The principle here is DRY (Don't Repeat Yourself) applied to UI. The alternative is inline styling on every element. The cost of using styles is a layer of indirection: when looking at a button in XAML, you can no longer instantly see its color; you must follow the key to find the style definition.

### Run It Yourself
1. Create a new .NET 8 WPF Application (`dotnet new wpf -n StyleDemo`).
2. Replace `MainWindow.xaml` with the code above.
3. Run the application.
4. Observe two buttons: the first is light blue, large, and padded. The second is standard gray and small.

---

## Concept Unit: TargetType without a key

### The Problem
Referencing `{StaticResource MyButtonStyle}` on every single button is still repetitive if we want *every* button to look identical. How do we apply a style to all controls of a type automatically?

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="200" Width="300">
    <Window.Resources>
        <Style TargetType="Button">
            <Setter Property="Background" Value="MediumPurple" />
            <Setter Property="Foreground" Value="White" />
            <Setter Property="Margin" Value="5" />
        </Style>
    </Window.Resources>
    
    <StackPanel Margin="20">
        <Button Content="First Button" />
        <Button Content="Second Button" />
        <Button Content="Third Button" />
    </StackPanel>
</Window>
```

### Mechanical Walkthrough
- `<Style TargetType="Button">`: Defines a style in the resources, but omits the `x:Key` attribute. By omitting the key, WPF automatically assigns the type itself (`typeof(Button)`) as the key. 
- When the XAML parser encounters a `<Button>` element, it looks up the resource tree for a resource keyed by `typeof(Button)`. 
- Because it finds this style in `Window.Resources`, it applies the setters to all three buttons automatically. Without the key, the style acts as a global default for that type within its scope.

### CS Lens
This is similar to CSS tag selectors (e.g., `button { background: purple; }`). It is a form of aspect-oriented programming or dependency injection by type mapping. The system intercepts the creation of the object and applies configuration based on the object's class.

### SE Lens
This minimizes code drastically and enforces absolute consistency. The tradeoff is that overriding it requires explicit action. If you want one button to *not* look like this, you must explicitly clear its style by setting `Style="{x:Null}"` or assigning a different specific style. 

### Run It Yourself
1. Replace `MainWindow.xaml` with the code above.
2. Run the application.
3. Observe that all three buttons are purple with white text and spaced apart, even though none of them contain a `Style` attribute.

---

## Concept Unit: BasedOn

### The Problem
You have a base design for all buttons, but you need one specific button to look slightly different (e.g., a red "Delete" button), while keeping the rest of the base design intact. Redefining the entire style duplicates the base setters. How do we make one style inherit from another?

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="200" Width="300">
    <Window.Resources>
        <Style x:Key="BaseButtonStyle" TargetType="Button">
            <Setter Property="FontSize" Value="18" />
            <Setter Property="Padding" Value="15" />
            <Setter Property="Background" Value="LightGray" />
        </Style>

        <Style x:Key="DangerButtonStyle" TargetType="Button" BasedOn="{StaticResource BaseButtonStyle}">
            <Setter Property="Background" Value="Salmon" />
            <Setter Property="Foreground" Value="White" />
        </Style>
    </Window.Resources>
    
    <StackPanel Margin="20">
        <Button Style="{StaticResource BaseButtonStyle}" Content="Save" Margin="0,0,0,10" />
        <Button Style="{StaticResource DangerButtonStyle}" Content="Delete" />
    </StackPanel>
</Window>
```

### Mechanical Walkthrough
- `<Style x:Key="BaseButtonStyle" TargetType="Button">`: A standard style defining the core geometry and default color.
- `BasedOn="{StaticResource BaseButtonStyle}"`: The `DangerButtonStyle` declares that it inherits from `BaseButtonStyle`. WPF copies all setters from the base style into the derived style.
- `<Setter Property="Background" Value="Salmon" />`: The derived style defines its own setter for `Background`. Because it appears in the derived style, it overrides the `Background="LightGray"` setter from the base style.
- The `Delete` button gets the `FontSize` and `Padding` from the base style, but the `Background` and `Foreground` from the derived style.

### CS Lens
This is class inheritance applied to configuration dictionaries. The derived dictionary merges with the base dictionary, resolving key collisions in favor of the derived dictionary. 

### SE Lens
Inheritance reduces duplication and ensures that core design metrics (like standard padding) remain centralized. The tradeoff is the same as class inheritance: fragile base class problem. If you change `BaseButtonStyle` to include a thick border, *all* derived styles get that border, which might visually break the `DangerButtonStyle`.

### Run It Yourself
1. Replace `MainWindow.xaml` with the code above.
2. Run the application.
3. Observe that both buttons are large and padded, but the Delete button has a salmon background and white text.

---

## Connect the Pieces
A single property, like `Background`, moves from being hardcoded inline, to being extracted into a named dictionary (`Style x:Key`), to being applied implicitly by type (`Style TargetType`), and finally being inherited and overridden (`BasedOn`). Throughout this progression, the underlying mechanism is identical: a collection of property-value pairs (`Setter`) is mapped to a target object by the framework during rendering.

## What Breaks Without This
If you attempt to apply a style to a control of the wrong type, the application will crash.

Change the first concept unit's style to point to a different type while still setting a button property:
```xml
<Style x:Key="MyButtonStyle" TargetType="TextBox">
    <Setter Property="Background" Value="LightBlue" />
</Style>
```
Compile and run. If the target type is `TextBox` but you try to apply the style to a `Button`, WPF throws an exception at runtime, or the designer throws an error: `TargetType 'TextBox' does not match type of element 'Button'.` The framework strictly enforces that the type declaring the contract matches the instance using it.

## Exercises
1. Create a `Window` with three `TextBlock` elements. Create an implicit style targeting `TextBlock` that sets `FontWeight` to `Bold`.
2. Add a specific style keyed `HeaderStyle` based on the implicit `TextBlock` style, adding an `FontSize` setter of `24`. Apply it to only one `TextBlock`.
3. Try adding a `Setter` to a `Button` style for a property that doesn't exist on `Button` (like `MaxLength`). Observe the specific compilation error.

## Definition of Done
- [ ] You can extract inline properties into a `<Style>` with an `x:Key`.
- [ ] You can use `<Setter>` to assign values inside a style.
- [ ] You can apply a style globally by omitting the `x:Key` and relying entirely on `TargetType`.
- [ ] You can inherit styles using `BasedOn`.
- [ ] You can explain Styles, Setters, and Implicit Styles out loud, in your own words, to someone who hasn't read this lesson.
