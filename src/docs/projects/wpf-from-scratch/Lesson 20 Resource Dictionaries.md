# Lesson 20: Resource Dictionaries

**What you will build:** You will extract hardcoded colors into an independent configuration file, merge them globally so the entire application can access them, and update them dynamically at runtime. This solves the problem of code duplication when defining common aesthetics across multiple windows, and introduces the foundation for runtime theming. No running project is kept; each example is discarded after it proves its point.

**What you need to know first:** Lesson 19: Styles and Triggers

**Terms introduced in this lesson:**
- **Resource Dictionary** — a dedicated XAML file that contains only WPF resources (like styles, templates, and brushes), separate from any user interface layout. *Why it exists:* To centralize shared styling configurations so they can be reused across multiple windows without duplication.
- **Merged Dictionaries** — a collection of external resource dictionaries imported into a parent resource collection. *Why it exists:* To allow large applications to split their resources across multiple manageable files but combine them for the application to evaluate as one.
- **StaticResource** — a markup extension that resolves a resource key exactly once when the XAML is loaded. *Why it exists:* For fast performance when a resource is known and will never change during the lifespan of the window.
- **DynamicResource** — a markup extension that looks up a resource key and maintains a continuous subscription to it. *Why it exists:* To allow runtime visual changes, such as switching from a light theme to a dark theme.

**Objects and methods used:**
- **ResourceDictionary / MergedDictionaries**
  - *What it is:* A collection of resources, and a property that allows importing other dictionaries.
  - *Implementation:* `<ResourceDictionary><ResourceDictionary.MergedDictionaries><ResourceDictionary Source="..."/></ResourceDictionary.MergedDictionaries></ResourceDictionary>`
  - *Its use:* To load and combine external configuration files into the current scope.
- **Application / Current.Resources**
  - *What it is:* The global object representing the running WPF application, which holds the top-level resource collection.
  - *Implementation:* `Application.Current.Resources["Key"]`
  - *Its use:* To globally apply, read, or swap resources at runtime from C#.

---

## Concept Unit: What a Resource Dictionary Is

### The Problem
When you define a style or a color brush in a window's `Resources`, it is only available to elements inside that specific window. If your application has five windows that all need the exact same button style and brand colors, copying and pasting the definitions into each window creates a maintenance liability. If you want to change a brand color, you must find and update it in five different places. We need a way to define resources in one authoritative file and use them everywhere.

### The New Code
```xml
<!-- Resources/Brushes.xaml -->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    
    <SolidColorBrush x:Key="BrandPrimaryBrush" Color="#007ACC" />
    <SolidColorBrush x:Key="BrandSecondaryBrush" Color="#F3F3F3" />
    
</ResourceDictionary>
```

### Mechanical Walkthrough
- `ResourceDictionary` is the root element. It tells WPF that this file does not contain a visual layout tree (like a `Window` or `Grid`), but rather a dictionary of shared objects.
- `xmlns` and `xmlns:x` are the standard XML namespaces required for WPF XAML. They must be present so the parser understands tags like `SolidColorBrush` and the `x:Key` attribute.
- `<SolidColorBrush x:Key="BrandPrimaryBrush" Color="#007ACC" />` defines a single resource with a unique key. It is stored in the dictionary and sits completely inert in memory until something explicitly requests it by its key.

### CS Lens
A resource dictionary is a key-value store, fundamentally identical to a hash map or `Dictionary<TKey, TValue>` in standard programming. The keys are the `x:Key` strings, and the values are the instantiated objects (like brushes or styles).

### SE Lens
The engineering principle is separation of concerns and the DRY (Don't Repeat Yourself) principle. By extracting raw values (colors, margins, shapes) into an independent configuration file, you decouple the visual identity of the app from its layout structure. The tradeoff is indirection: when looking at a window's code, you can no longer see exactly what a color is; you only see its name and must open another file to find the actual hexadecimal value.

### Run It Yourself
Create a .NET 8 WPF project. In the Solution Explorer, create a new folder named `Resources`. Right-click the folder, select Add > New Item, and choose "Resource Dictionary (WPF)". Name it `Brushes.xaml`. Replace its contents with the code above. The project will compile, but running it produces no visible change because these resources are not yet loaded or used by the application.

---

## Concept Unit: Merging into App.xaml

### The Problem
Even if you define a standalone resource dictionary, WPF does not automatically know it exists or where to find it. To make the resources available everywhere, they must be imported into the global scope. The highest level of scope in a WPF application is the `App.xaml` file.

### The New Code
```xml
<!-- App.xaml -->
<Application x:Class="WpfApp.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             StartupUri="MainWindow.xaml">
    <Application.Resources>
        <ResourceDictionary>
            <ResourceDictionary.MergedDictionaries>
                <ResourceDictionary Source="Resources/Brushes.xaml" />
            </ResourceDictionary.MergedDictionaries>
        </ResourceDictionary>
    </Application.Resources>
</Application>
```

With the global state configured, you can now consume the resources from any window in the application.

```xml
<!-- MainWindow.xaml -->
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="200" Width="300">
    <Grid Background="{StaticResource BrandSecondaryBrush}">
        <Button Background="{StaticResource BrandPrimaryBrush}" 
                Content="Click Me" 
                Width="100" Height="40" />
    </Grid>
</Window>
```

### Mechanical Walkthrough
- `<Application.Resources>` accesses the global resource dictionary that spans the entire lifecycle of the application.
- `<ResourceDictionary>` creates a new dictionary specifically to hold our merged files.
- `<ResourceDictionary.MergedDictionaries>` is a collection property. Any dictionaries added here are absorbed into the parent dictionary.
- `<ResourceDictionary Source="Resources/Brushes.xaml" />` tells WPF to locate the external file at the specified relative path, parse its contents, and dump all of its key-value pairs into the global application resources.
- `{StaticResource BrandPrimaryBrush}` in `MainWindow.xaml` asks WPF to find the object keyed `BrandPrimaryBrush`. Because it is merged at the `App` level, the lookup successfully resolves.

### CS Lens
This is environment variable inheritance. Just as an operating system passes global environment variables down to all child processes, the `Application` passes its resources down to all windows and controls instantiated within it.

### SE Lens
The principle is composition. Rather than having one massive `App.xaml` file containing hundreds of colors, styles, and templates, you compose the global state by merging multiple smaller, specialized files (e.g., `Brushes.xaml`, `Fonts.xaml`, `ButtonStyles.xaml`). This minimizes version control conflicts on large teams and keeps the architecture organized. The cost is parse time: at startup, the framework must open, parse, and combine all these files before showing the first window.

### Run It Yourself
Update your `App.xaml` and `MainWindow.xaml` with the code above. Run the application. You will see a window with a light gray background and a blue button. The colors are successfully resolved from the standalone `Brushes.xaml` file.

---

## Concept Unit: StaticResource vs DynamicResource

### The Problem
Sometimes resources change while the application is running. The most common scenario is toggling between a light theme and a dark theme. If you change the underlying color associated with a key, a control using `StaticResource` will not update, because it only looked up the color once when it was first created. We need a way to tell controls to listen for changes to a resource.

### The New Code
```xml
<!-- MainWindow.xaml -->
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="200" Width="300">
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center">
        <Button Background="{StaticResource BrandPrimaryBrush}" Content="Static" Width="100" Height="40" Margin="5" />
        <Button Background="{DynamicResource BrandPrimaryBrush}" Content="Dynamic" Width="100" Height="40" Margin="5" />
        <Button Content="Swap Theme" Click="SwapTheme_Click" Width="100" Height="40" Margin="5" />
    </StackPanel>
</Window>
```

To demonstrate the difference, we need to alter the resource from code-behind during runtime.

```csharp
// MainWindow.xaml.cs
using System.Windows;
using System.Windows.Media;

namespace WpfApp;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void SwapTheme_Click(object sender, RoutedEventArgs e)
    {
        Application.Current.Resources["BrandPrimaryBrush"] = new SolidColorBrush(Colors.Red);
    }
}
```

### Mechanical Walkthrough
- `{StaticResource BrandPrimaryBrush}` fetches the blue color once during window initialization. It never checks the dictionary again.
- `{DynamicResource BrandPrimaryBrush}` fetches the blue color, but also registers an event listener on the dictionary. If the resource mapped to that key ever changes, it will re-evaluate and update the button.
- `Application.Current.Resources` accesses the global resource dictionary from C# code.
- `["BrandPrimaryBrush"] = new SolidColorBrush(Colors.Red)` overwrites the existing value at that key with a completely new brush object.
- Because the dynamic resource is listening, replacing the dictionary entry causes it to immediately update its target. The static resource remains completely unaware.

### CS Lens
`StaticResource` is a one-time memory fetch. `DynamicResource` implements the observer pattern (publish-subscribe). When you use a dynamic resource, the dependency property of the control subscribes to change notifications from the resource dictionary.

### SE Lens
The engineering choice is between performance and flexibility. `StaticResource` requires almost zero overhead after the initial lookup. `DynamicResource` incurs memory and CPU overhead to maintain subscriptions and listen for changes. You should always default to `StaticResource` unless you explicitly require runtime swapping.

### Run It Yourself
Replace your `MainWindow.xaml` and its code-behind with the code above. Run the application. Both the "Static" and "Dynamic" buttons will be blue. Click the "Swap Theme" button. Only the "Dynamic" button will turn red; the "Static" button remains blue permanently.

---

## Concept Unit: Resource Lookup Order

### The Problem
When you ask for a resource by key, where exactly does WPF look for it? If you have multiple dictionaries or nested controls, you might accidentally reuse a key. We need to understand the exact path WPF walks to find a resource, which allows us to deliberately override global resources locally without affecting the rest of the application.

### The New Code
```xml
<!-- MainWindow.xaml -->
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="200" Width="300">
    <Window.Resources>
        <!-- Overriding the global brush locally -->
        <SolidColorBrush x:Key="BrandPrimaryBrush" Color="Green" />
    </Window.Resources>
    
    <Grid>
        <StackPanel>
            <Button Background="{DynamicResource BrandPrimaryBrush}" Content="Window Level" Height="40" Margin="5" />
            <StackPanel>
                <StackPanel.Resources>
                    <SolidColorBrush x:Key="BrandPrimaryBrush" Color="Purple" />
                </StackPanel.Resources>
                <Button Background="{DynamicResource BrandPrimaryBrush}" Content="Control Level" Height="40" Margin="5" />
            </StackPanel>
        </StackPanel>
    </Grid>
</Window>
```

### Mechanical Walkthrough
- `x:Key="BrandPrimaryBrush"` is now defined three times in total: once globally in `App.xaml` (Blue), once in `Window.Resources` (Green), and once inside the inner `StackPanel.Resources` (Purple).
- The first `<Button>` asks for `BrandPrimaryBrush`. WPF checks the button's own resources (none), then walks up to the `StackPanel` (none), then the `Grid` (none), then the `Window`. It finds the Green brush in the Window and stops searching immediately. It never reaches the global Blue brush.
- The second `<Button>` asks for `BrandPrimaryBrush`. WPF checks the button's own resources, then walks up to the inner `StackPanel`. It finds the Purple brush there and stops searching.

### CS Lens
This is lexical scoping and shadowing. Variables defined in a closer scope shadow variables of the same name in an outer scope. WPF walks the logical tree upwards, much like a compiler resolving a variable by looking in the current block, then the enclosing block, up to global scope.

### SE Lens
The principle is overriding global defaults. This lookup behavior is incredibly useful. You can define a global style for all buttons in `App.xaml`, but if one specific window needs a slightly different variation, you can redefine the style with the identical key in that `Window.Resources`. The rest of the app remains unaffected, but that specific window gets the customized version.

### Run It Yourself
Update your `MainWindow.xaml` with the code above. Make sure `App.xaml` still has the global dictionary merged. Run the application. The first button will be green. The second button will be purple. The global blue brush is successfully shadowed and ignored.

---

## Connect the Pieces
The `BrandPrimaryBrush` resource starts as an isolated entry in a standalone `Brushes.xaml` dictionary. It is then merged into the global scope in `App.xaml`, making it available everywhere. We fetch it once using `StaticResource`, then again using `DynamicResource` to watch it change at runtime. Finally, we completely shadow it by redefining the same key lower in the logical tree, taking advantage of WPF's hierarchical lookup order.

## What Breaks Without This
If you attempt to use a `StaticResource` for a key that does not exist, or you forget to merge the dictionary containing that key, the application will crash during initialization.

In `MainWindow.xaml`, add:
```xml
<Button Background="{StaticResource NonExistentBrush}" />
```

Run it. The application crashes immediately with a `System.Windows.Markup.XamlParseException`. The inner exception reveals the truth: "Resource 'NonExistentBrush' could not be resolved." Because it is static, WPF demands resolution at load time and halts execution if it fails. If you use a `DynamicResource` instead, it fails silently and falls back to the default property value without crashing.

## Exercises
1. Create a second dictionary called `Styles.xaml` containing a custom button style. Merge it into `App.xaml` alongside `Brushes.xaml` and apply it to a button.
2. In C#, write a method that removes the `BrandPrimaryBrush` from `Application.Current.Resources` completely using the `.Remove("BrandPrimaryBrush")` method. Observe what happens to a button using a `DynamicResource` when its resource is deleted.
3. Define a resource in `Window.Resources` and attempt to use it in `App.xaml`. Verify that scoping works bottom-up, not top-down.

## Definition of Done
- [ ] You understand that a Resource Dictionary is just a XAML file storing key-value pairs.
- [ ] You can merge an external dictionary into `App.xaml` or another dictionary.
- [ ] You know when to use `StaticResource` for performance and `DynamicResource` for runtime changes.
- [ ] You understand that WPF searches for resources starting from the element, moving up the tree to the Window, and finally the Application.
- [ ] You can explain resource dictionaries out loud, in your own words, to someone who hasn't read this lesson.
