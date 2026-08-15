# Lesson 22: Value Converters

**What you will build:** You will build a mechanism that translates a simple true/false value in your data into a specific user interface state (visible or hidden). This proves that the data layer and the visual layer do not have to share the exact same data types to communicate. This solves the transferable problem of adapting pure application logic to specific user interface requirements without polluting the logic with interface-specific concepts.

**What you need to know first:** Lesson 19 (Data Binding), Lesson 20 (INotifyPropertyChanged), Lesson 21 (Resources).

**Terms introduced in this lesson:**
- **Value Converter** — A class that intercepts data as it flows through a binding and transforms it from one type to another. *Why it exists:* Data models use pure types (like `bool` or `int`), while interfaces use specialized types (like `Visibility` or `Brush`). Converters bridge this gap without requiring the data model to know about interface types.

**Objects and methods used:**
- **IValueConverter**
  - *What it is:* An interface defining the contract for converting data during a binding operation.
  - *Implementation:* `public interface IValueConverter { object Convert(object value, Type targetType, object parameter, CultureInfo culture); object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture); }`
  - *Its use:* Implemented by classes that translate data passing between a binding source and a binding target.

---

## Concept Unit: The Type Mismatch Problem

### The Problem
When binding a data property to a user interface property, the types must align. If you have a boolean property indicating whether a user is an administrator, you might want to use it to control whether a settings panel is visible. However, the data property is a `bool` (`true` or `false`), while the interface property is a `Visibility` enum (`Visible`, `Hidden`, or `Collapsed`). WPF does not automatically know how to turn `true` into `Visibility.Visible`. If you attempt to bind them directly, the binding fails silently or produces a conversion error at runtime, and the interface does not update.

### The New Code
```xml
<Window x:Class="ConverterDemo.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Type Mismatch" Height="200" Width="300">
    <StackPanel Margin="20">
        <CheckBox x:Name="AdminCheckBox" Content="Is Administrator" IsChecked="True" />
        
        <!-- This binding will fail because IsChecked is bool?, and Visibility is an enum -->
        <TextBlock Text="Settings Panel" 
                   Visibility="{Binding ElementName=AdminCheckBox, Path=IsChecked}" 
                   Background="LightGray" Padding="10" Margin="0,10,0,0"/>
    </StackPanel>
</Window>
```

### Mechanical Walkthrough
- `<TextBlock ... Visibility="{Binding ElementName=AdminCheckBox, Path=IsChecked}">`: The target property is `Visibility`, which expects a value of type `System.Windows.Visibility`. The source property is `IsChecked`, which returns a `bool?` (nullable boolean). 
- Because there is no implicit translation from a boolean to the `Visibility` enumeration, the binding system cannot assign the source value to the target. The default value for `Visibility` (`Visible`) remains active, and checking or unchecking the box does nothing to the `TextBlock`.

### CS Lens
The computational concept here is strong static typing. Systems enforce strict boundaries between different types of data to prevent invalid states. A boolean simply represents binary truth; it contains no semantic information about visual rendering. 

### SE Lens
The engineering principle is separation of concerns. The alternative not chosen is adding a `Visibility SettingsVisibility { get; }` property directly to the data model. While that avoids the binding mismatch, the tradeoff is that the data model is now contaminated with WPF-specific user interface elements. This makes the data model impossible to reuse in a non-WPF application and violates the principle that data should not dictate how it is drawn.

### Run It Yourself
1. Create a new .NET 8 WPF Application named `ConverterDemo`.
2. Replace the contents of `MainWindow.xaml` with the code above.
3. Run the application.
4. Toggle the "Is Administrator" checkbox. 
5. Observe the output: The "Settings Panel" text remains visible regardless of the checkbox state. Check the Visual Studio Output window (View -> Output) and look at the "Data Binding" messages; you will see an error stating that a `System.Boolean` cannot be converted to `System.Windows.Visibility`.

---

## Concept Unit: Implementing IValueConverter

### The Problem
To resolve the type mismatch, we must intervene in the binding pipeline. We need a piece of code that catches the boolean value as it leaves the source, translates it into the appropriate `Visibility` value, and hands that translated value to the target.

### The New Code
```csharp
using System;
using System.Globalization;
using System.Windows;
using System.Windows.Data;

namespace ConverterDemo
{
    public class BoolToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool isVisible && isVisible)
            {
                return Visibility.Visible;
            }
            
            return Visibility.Collapsed;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
```

### Mechanical Walkthrough
- `public class BoolToVisibilityConverter : IValueConverter`: The class implements the `IValueConverter` interface, which is required for WPF to recognize it as a converter.
- `public object Convert(...)`: This method is called when data flows from the source to the target. It takes the original `value` and must return the converted value.
- `if (value is bool isVisible && isVisible)`: We use pattern matching to safely check if the incoming `value` is a boolean. If it is, and if it is `true`, we return `Visibility.Visible`.
- `return Visibility.Collapsed`: If the value is `false`, or if it is not a boolean at all, we fall back to returning `Visibility.Collapsed`, which hides the element and reclaims its layout space.
- `public object ConvertBack(...)`: This method is called when data flows backwards from the target to the source (in a TwoWay binding). Because a UI element's visibility rarely dictates the underlying data, we leave it unimplemented. Throwing a `NotImplementedException` is standard practice for one-way converters.

### CS Lens
This embodies the Adapter pattern. An adapter wraps an incompatible interface so it can be used by a client that expects a different interface. Real-world parallels include travel power adapters that physically translate a US plug into a European socket without changing the electricity flowing through it.

### SE Lens
The engineering principle is extensibility. By forcing conversions through a standard interface (`IValueConverter`), the WPF binding engine does not need to be hardcoded with knowledge of every possible conversion. The framework provides the hook, and you provide the specific logic. The tradeoff is verbosity; you must create an entire class and implement an interface just to execute a simple `if` statement.

### Run It Yourself
1. In the `ConverterDemo` project, right-click the project in Solution Explorer and choose Add -> Class.
2. Name it `BoolToVisibilityConverter.cs`.
3. Paste the code above into the file.
4. Build the project (Ctrl+Shift+B) so the XAML designer becomes aware of the new class.

---

## Concept Unit: Registering and Using a Converter

### The Problem
The converter class exists in C#, but XAML does not know about it. To use the converter in a binding, we must instantiate the converter object and instruct the binding to pass data through it.

### The New Code
```xml
<Window x:Class="ConverterDemo.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:local="clr-namespace:ConverterDemo"
        Title="Using a Converter" Height="200" Width="300">
    
    <Window.Resources>
        <local:BoolToVisibilityConverter x:Key="BoolToVisibility" />
    </Window.Resources>

    <StackPanel Margin="20">
        <CheckBox x:Name="AdminCheckBox" Content="Is Administrator" IsChecked="True" />
        
        <TextBlock Text="Settings Panel" 
                   Visibility="{Binding ElementName=AdminCheckBox, Path=IsChecked, Converter={StaticResource BoolToVisibility}}" 
                   Background="LightGray" Padding="10" Margin="0,10,0,0"/>
    </StackPanel>
</Window>
```

### Mechanical Walkthrough
- `xmlns:local="clr-namespace:ConverterDemo"`: Maps the XML namespace `local` to the C# namespace where the converter class lives.
- `<local:BoolToVisibilityConverter x:Key="BoolToVisibility" />`: Creates an instance of the converter and stores it in the Window's resource dictionary under the key `BoolToVisibility`. Without this, XAML has no object to attach to the binding.
- `Converter={StaticResource BoolToVisibility}`: Inside the binding expression, this tells the binding engine to retrieve the converter instance from resources and use its `Convert` method every time the `IsChecked` value changes.

### CS Lens
This embodies dependency injection via a resource locator. The binding does not create its own converter; it relies on a shared instance provided by the environment (the resource dictionary). This conserves memory, as a single converter instance can be reused by hundreds of bindings across the application.

### SE Lens
The engineering principle is decoupling instantiation from usage. The alternative is writing `<Binding.Converter><local:BoolToVisibilityConverter/></Binding.Converter>` directly inside every binding. That approach creates a new object allocation for every single binding, wasting memory. By declaring it as a resource, the cost is paid once.

### Run It Yourself
1. Open `MainWindow.xaml` and replace its contents with the new XAML above.
2. Run the application.
3. Toggle the "Is Administrator" checkbox.
4. Observe the exact output: The "Settings Panel" dynamically appears and disappears in exact synchronization with the checkbox state.

---

## Concept Unit: ConverterParameter

### The Problem
Sometimes you need the exact opposite behavior. For example, a "Loading" spinner should be visible when `IsLoading` is `true`, but a "Submit" button should be visible when `IsLoading` is `false`. Writing a `TrueToVisibleConverter` and a separate `FalseToVisibleConverter` duplicates logic. We need a way to pass an instruction to the converter to alter its behavior dynamically from XAML.

### The New Code

**The updated converter:**
```csharp
using System;
using System.Globalization;
using System.Windows;
using System.Windows.Data;

namespace ConverterDemo
{
    public class BoolToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            bool isVisible = value is bool b && b;

            if (parameter is string paramString && paramString == "Invert")
            {
                isVisible = !isVisible;
            }

            return isVisible ? Visibility.Visible : Visibility.Collapsed;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
```

**The updated XAML:**
```xml
<Window x:Class="ConverterDemo.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:local="clr-namespace:ConverterDemo"
        Title="Converter Parameter" Height="200" Width="300">
    
    <Window.Resources>
        <local:BoolToVisibilityConverter x:Key="BoolToVisibility" />
    </Window.Resources>

    <StackPanel Margin="20">
        <CheckBox x:Name="LoadingCheckBox" Content="Is Loading" IsChecked="True" />
        
        <TextBlock Text="Loading Data..." 
                   Visibility="{Binding ElementName=LoadingCheckBox, Path=IsChecked, Converter={StaticResource BoolToVisibility}}" 
                   Background="Yellow" Padding="10" Margin="0,10,0,0"/>
                   
        <Button Content="Submit Data"
                Visibility="{Binding ElementName=LoadingCheckBox, Path=IsChecked, Converter={StaticResource BoolToVisibility}, ConverterParameter=Invert}"
                Padding="10" Margin="0,10,0,0"/>
    </StackPanel>
</Window>
```

### Mechanical Walkthrough
- `ConverterParameter=Invert`: In the XAML binding for the button, we pass the literal string `"Invert"` into the binding.
- `object parameter`: In the `Convert` method, this argument receives whatever was specified in the `ConverterParameter` XAML property.
- `if (parameter is string paramString && paramString == "Invert")`: We check if a parameter was provided and if it equals `"Invert"`. If it does, we flip the `isVisible` boolean before resolving it to a `Visibility` state. Without this check, the parameter is ignored, and normal conversion applies.

### CS Lens
This embodies parameterized behavior. Functions can accept configuration arguments that alter their control flow. Real-world parallels include command-line flags (`ls -l` vs `ls`) that modify the execution of a single program rather than requiring separate programs for every variation.

### SE Lens
The engineering principle is code reuse through parameterization. The alternative is writing a dedicated `InverseBoolToVisibilityConverter` class. The tradeoff of using a parameter is lack of type safety; `ConverterParameter` is passed as an `object` and parsed as a string at runtime. If you typo `ConverterParameter="Invrrt"`, the compiler will not catch it, and the conversion will silently default to the non-inverted logic.

### Run It Yourself
1. Update `BoolToVisibilityConverter.cs` with the new logic.
2. Update `MainWindow.xaml` with the new XAML.
3. Run the application.
4. Toggle the "Is Loading" checkbox.
5. Observe the exact output: When checked, the yellow "Loading Data..." text is visible, and the button is hidden. When unchecked, the text vanishes, and the "Submit Data" button appears.

---

## Connect the Pieces
A single user interaction (unchecking a checkbox) updates a `bool` property. The binding detects the change, retrieves the `bool` value, and routes it through the `Convert` method of the `BoolToVisibilityConverter` instance found in the Window's resources. The converter evaluates the boolean against the optional `ConverterParameter`, translates the final logic into a `Visibility` enum, and hands that enum to the target `TextBlock` or `Button`, causing the layout to physically render or collapse the element.

## What Breaks Without This
If you remove the implementation of `IValueConverter` from the class declaration:
`public class BoolToVisibilityConverter`

The code will fail to compile. You will receive the compiler error:
`CS0266: Cannot implicitly convert type 'ConverterDemo.BoolToVisibilityConverter' to 'System.Windows.Data.IValueConverter'.`
The XAML binding engine absolutely requires the converter object to guarantee the presence of the `Convert` and `ConvertBack` methods via the interface contract. Restore `: IValueConverter` to fix the compilation.

## Exercises
1. Create an `IntToBrushConverter` that takes an integer. If the integer is less than 0, return `Brushes.Red`. Otherwise, return `Brushes.Black`. Bind it to a `TextBox`'s foreground color.
2. Modify the `BoolToVisibilityConverter` so that it accepts a `ConverterParameter` of `"Hidden"`. When this parameter is passed, a `false` value should return `Visibility.Hidden` instead of `Visibility.Collapsed` (preserving the layout space).
3. Implement `ConvertBack` in the `BoolToVisibilityConverter`. It should take a `Visibility` enum and return `true` if it is `Visible`, and `false` otherwise. Bind a CheckBox's `IsChecked` property to a Window's `Visibility` property using `Mode=TwoWay` and test it.

## Definition of Done
- [ ] You have run the code that proves type mismatch failures in direct bindings.
- [ ] You have implemented a class inheriting `IValueConverter`.
- [ ] You have declared a converter as a static resource and applied it in a XAML binding.
- [ ] You have used `ConverterParameter` to reuse a single converter for opposite logical states.
- [ ] You can explain a value converter out loud, in your own words, to someone who hasn't read this lesson.
