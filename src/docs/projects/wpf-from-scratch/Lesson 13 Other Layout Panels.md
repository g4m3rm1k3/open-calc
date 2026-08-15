# Lesson 13: Other Layout Panels

**What you will build:** You will build four isolated user interfaces, each proving a distinct layout strategy. You will prove that `StackPanel` stacks elements in a single line, `DockPanel` glues elements to the edges of the window, `WrapPanel` flows elements across multiple lines as space permits, and `Canvas` locks elements to exact coordinates. These examples demonstrate the transferable problem of arranging user interface controls predictably across different screen sizes.

**What you need to know first:** Lesson 12: The Grid Panel.

**Terms introduced in this lesson:**
- **Attached Property** — a property that a parent layout panel defines, but is set on the child element itself (e.g., `DockPanel.Dock`). *Why it exists:* It allows a generic child control (like a `Button`) to carry layout instructions meant specifically for the panel containing it, without the `Button` needing to know anything about the panel.
- **Reflow** — the process where elements rearrange themselves automatically when the available window space changes. *Why it exists:* Windows are resizable; reflow ensures the interface remains usable rather than stretching controls disproportionately or cutting them off.
- **Absolute Positioning** — placing elements at exact X and Y coordinates. *Why it exists:* Drawing surfaces, games, and graphical tools require exact spatial relationships where elements must not move automatically.

**Objects and methods used:**
- **StackPanel**
  - *What it is:* A layout control that arranges its child elements into a single line that can be oriented horizontally or vertically.
  - *Implementation:* `<StackPanel Orientation="Vertical"> ... </StackPanel>`
  - *Its use:* Placing items in a simple sequence, like a vertical list of form fields or a horizontal row of action buttons.
- **DockPanel**
  - *What it is:* A layout control that aligns its child elements against its edges (Top, Bottom, Left, Right).
  - *Implementation:* `<DockPanel> ... </DockPanel>`
  - *Its use:* Building application shells, such as a window with a fixed toolbar at the top and a status bar at the bottom.
- **WrapPanel**
  - *What it is:* A layout control that positions child elements sequentially from left to right, breaking to a new line when it runs out of horizontal space.
  - *Implementation:* `<WrapPanel> ... </WrapPanel>`
  - *Its use:* Displaying collections of items, like a gallery of images or a dynamic toolbar, where the number of visible items per row depends on the window width.
- **Canvas**
  - *What it is:* A layout control that allows absolute positioning of child elements.
  - *Implementation:* `<Canvas> ... </Canvas>`
  - *Its use:* Creating drawing applications, interactive maps, or any scenario where elements must remain at fixed coordinates regardless of window size.

---

## Concept Unit: StackPanel

### The Problem
When building a user interface, you frequently need to place items next to or below one another, such as a list of buttons or a sequence of text fields. If you place them in a standard container without layout rules, they will overlap. You need a way to declare a linear sequence that automatically computes the necessary placement for each consecutive item.

### The New Code

```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="StackPanel Example" Height="200" Width="200">
    <StackPanel Orientation="Vertical">
        <Button Content="First Button" Height="40" />
        <Button Content="Second Button" Height="40" />
        <Button Content="Third Button" Height="40" />
        <Button Content="Fourth Button" Height="40" />
        <Button Content="Fifth Button" Height="40" />
    </StackPanel>
</Window>
```

### Mechanical Walkthrough
- `<Window ...>` — establishes the root operating system window for the application. Without this, there is no frame to render the controls inside.
- `<StackPanel>` — declares the layout container that forces its children into a sequential line. Without this, WPF only permits the Window to have a single direct child, and multiple buttons would result in a compilation error or runtime crash.
- `Orientation="Vertical"` — instructs the panel to stack elements from top to bottom. Without this, the elements would stack top to bottom anyway because `Vertical` is the default, but specifying it makes the intent explicit.
- `<Button Content="First Button" Height="40" />` — creates an interactive control containing text, explicitly sizing it to 40 device-independent pixels tall. Without this specific height, the `StackPanel` would shrink the button vertically to barely fit the text, making it harder to click.
- *The Fifth Button* — demonstrates a critical limitation. If the total height of the buttons (5 * 40 = 200 pixels) exceeds the available internal height of the window, the StackPanel does not automatically scroll. Without a separate `ScrollViewer` control wrapped around the `StackPanel`, the overflowing buttons are simply clipped and rendered invisible.

### CS Lens
The `StackPanel` embodies a linear sequence, computationally identical to a 1-dimensional array or list structure. It iterates through its child collection in order, accumulating a single running total (an offset) along one axis. It assigns each subsequent child a coordinate based on the size of the previous child plus that running offset.

### SE Lens
The engineering principle here is simplicity versus capability. The `StackPanel` is highly efficient because calculating a 1D layout is mathematically trivial. The tradeoff is rigidity. You cannot use a `StackPanel` to align an element specifically to the bottom right of the screen; it only knows how to append elements to the end of a single line.

### Run It Yourself
1. Open a terminal and run `dotnet new wpf -n WpfLayouts`.
2. Navigate into the new folder: `cd WpfLayouts`.
3. Open `MainWindow.xaml` in a text editor.
4. Replace the entire contents of the file with the XAML code above.
5. Run the command `dotnet run`.
6. Observe the five buttons stacked vertically. Resize the window to make it shorter; observe that the bottom buttons disappear rather than causing a scrollbar to appear.

---

## Concept Unit: DockPanel

### The Problem
Many application windows require structural regions: a menu fixed to the top edge, a status message fixed to the bottom edge, a navigation tree fixed to the left edge, and a main workspace that fills whatever space is left over in the center. A linear stack cannot do this, because it does not stretch a specific item to fill the remaining space while pushing other items to the extreme edges.

### The New Code

```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="DockPanel Example" Height="300" Width="400">
    <DockPanel LastChildFill="True">
        <Button DockPanel.Dock="Top" Content="Toolbar" Height="30" />
        <Button DockPanel.Dock="Bottom" Content="Status Bar" Height="30" />
        <Button DockPanel.Dock="Left" Content="Navigation" Width="100" />
        <Button Content="Main Workspace" />
    </DockPanel>
</Window>
```

### Mechanical Walkthrough
- `<DockPanel>` — initiates the layout container that measures the available window area and subtracts space as items are glued to the edges. Without this, edge-based anchoring is not available.
- `LastChildFill="True"` — instructs the panel that whichever element is defined last in the XAML file should expand to consume 100% of the unallocated interior space. Without this, the final element would only take up as much room as its content requires, leaving empty void space in the window.
- `DockPanel.Dock="Top"` — an attached property that tells the `DockPanel` to push this specific `Button` against the upper edge of the window. Without this, the default behavior is to dock to the `Left`.
- `Height="30"` — restricts the vertical size of the Top and Bottom docked buttons. Without this, an element docked to the Top will stretch vertically to fill the entire window.
- `<Button Content="Main Workspace" />` — the final child element declared. It has no explicit `Dock` property. Because `LastChildFill` is true, it stretches horizontally and vertically to fill the remaining area left over after the Top, Bottom, and Left elements claimed their space.

### CS Lens
The `DockPanel` represents a spatial subtraction algorithm. It starts with a rectangular bounding box. As it processes the first child, it removes a slice of that rectangle (e.g., the top 30 pixels) and passes the smaller, remaining rectangle to the next calculation step. This order of operations matters: if you dock to the Left *before* docking to the Top, the left panel extends all the way to the top edge, pushing the top panel to the right.

### SE Lens
The principle here is delegating layout logic to the container. The alternative is writing manual resize-event handlers in C# to calculate absolute pixel coordinates every time the user drags the window corner. The `DockPanel` approach is declarative and automatic, though the cost is that you must carefully order your child elements in the XML to achieve the correct overlapping behavior at the corners.

### Run It Yourself
1. In your `WpfLayouts` project, open `MainWindow.xaml`.
2. Replace the contents with the DockPanel XAML above.
3. Run `dotnet run`.
4. Observe the layout. Resize the window aggressively. Notice how the Toolbar and Status Bar maintain their height, the Navigation maintains its width, and only the Main Workspace expands or shrinks to accommodate the changing window size.

---

## Concept Unit: WrapPanel

### The Problem
When presenting a dynamic list of items—like thumbnail images or a row of tags—the available width might change. If you put them in a `StackPanel`, they will stay on one line and clip off the edge of the window. You need a container that behaves like text in a word processor: flowing items left to right, and automatically dropping down to a new line when the current line hits the right margin.

### The New Code

```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="WrapPanel Example" Height="200" Width="300">
    <WrapPanel>
        <Button Content="Item 1" Width="80" Height="40" />
        <Button Content="Item 2" Width="80" Height="40" />
        <Button Content="Item 3" Width="80" Height="40" />
        <Button Content="Item 4" Width="80" Height="40" />
        <Button Content="Item 5" Width="80" Height="40" />
    </WrapPanel>
</Window>
```

### Mechanical Walkthrough
- `<WrapPanel>` — creates the layout container that measures the available horizontal space and calculates how many children can fit before breaking to a new row. Without this, the elements would not automatically reflow.
- `<Button Content="Item 1" ... />` — defines a child control.
- `Width="80"` and `Height="40"` — explicitly defines the size of the items. Without this uniform sizing, the `WrapPanel` determines the height of a row based on the tallest element within that specific row, which can create uneven, jagged vertical spacing.

### CS Lens
The `WrapPanel` behaves as a 2-dimensional bin-packing algorithm, specifically a simple shelf algorithm. It maintains a cursor (X, Y). It adds the item's width to X. If X exceeds the container's max width, it resets X to 0, adds the tallest item's height from the previous row to Y, and starts a new row. 

### SE Lens
The principle is responsive design. The alternative is a fixed layout that requires horizontal scrolling on small screens and leaves massive empty whitespace on large screens. The tradeoff of the `WrapPanel` is unpredictability; you cannot guarantee which items will end up next to each other, meaning it is entirely inappropriate for structural forms where "Submit" must always appear strictly below "Password".

### Run It Yourself
1. In your `WpfLayouts` project, open `MainWindow.xaml`.
2. Replace the contents with the WrapPanel XAML above.
3. Run `dotnet run`.
4. Click and drag the right edge of the window to make it wider and narrower. Watch the buttons reflow, jumping between rows automatically as the available space crosses the 80-pixel thresholds.

---

## Concept Unit: Canvas

### The Problem
Sometimes, automatic layout is explicitly the wrong choice. If you are building a mapping tool, a vector graphics editor, or a game board, elements must be placed exactly where you tell them to be. A tree placed at coordinate (150, 200) must stay exactly there, regardless of whether the user resizes the window. 

### The New Code

```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Canvas Example" Height="300" Width="300">
    <Canvas>
        <Button Canvas.Left="50" Canvas.Top="50" Content="Origin (50,50)" />
        <Button Canvas.Left="150" Canvas.Top="150" Content="Lower Right" />
    </Canvas>
</Window>
```

### Mechanical Walkthrough
- `<Canvas>` — initializes the layout surface that disables all automatic layout logic. Without this, child elements would be resized or repositioned based on the container's rules.
- `Canvas.Left="50"` — an attached property that sets the exact horizontal distance from the left edge of the Canvas to the left edge of the Button. Without this, the value defaults to 0.
- `Canvas.Top="50"` — an attached property that sets the exact vertical distance from the top edge of the Canvas to the top edge of the Button. Without this, the value defaults to 0.
- `Content="Origin (50,50)"` — defines the visual payload. Because no width or height is provided, the Canvas allows the Button to render at exactly the minimum size required to fit this text.

### CS Lens
The `Canvas` represents a standard Cartesian coordinate system, with the origin (0,0) situated at the top-left corner. The X-axis extends positively to the right, and the Y-axis extends positively downward. It completely bypasses the recursive measurement and arrangement algorithms used by the other layout panels, executing in constant time O(1) for placement.

### SE Lens
The engineering principle is absolute control versus maintainability. Absolute positioning guarantees visual exactness. The alternative—using standard panels—protects your application against changing screen resolutions and font scaling. The tradeoff is severe: if you build a data-entry form using a `Canvas`, and the user's system font size increases, the text will overflow the buttons and the fields will overlap permanently, rendering the application unusable. Never use a `Canvas` for standard application forms.

### Run It Yourself
1. In your `WpfLayouts` project, open `MainWindow.xaml`.
2. Replace the contents with the Canvas XAML above.
3. Run `dotnet run`.
4. Resize the window. Observe that the buttons never move relative to the top-left corner, and never resize themselves. If you shrink the window smaller than 150 pixels, the second button simply vanishes outside the visible bounds.

---

## Connect the Pieces
Consider the concept of "Positioning Data". 
1. In a `StackPanel`, positioning data is implicit; it is determined entirely by the element's index in the list.
2. In a `WrapPanel`, positioning data is fluid; it is a mathematical derivative of the element's size, its index, and the current width of the window.
3. In a `DockPanel`, positioning data is categorical; an element states its semantic intent (`Top`, `Left`), and the panel handles the math.
4. In a `Canvas`, positioning data is explicit and hardcoded; the element declares exact X and Y numerical coordinates.

## What Breaks Without This
If you attempt to use an attached layout property on an element that is inside the wrong type of panel, the instruction is silently ignored.

1. Open `MainWindow.xaml`.
2. Write this code:
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Broken Attached Property" Height="200" Width="200">
    <StackPanel>
        <Button Canvas.Left="50" Content="I want to be indented" />
    </StackPanel>
</Window>
```
3. Run `dotnet run`.
4. **The Failure:** The button will stretch across the entire top of the window. The `Canvas.Left="50"` instruction is physically attached to the Button, but the `StackPanel` does not look for it and does not know what it means. It only knows how to stack. To fix this, you must use properties the parent understands (like `Margin="50,0,0,0"` in a StackPanel) or change the parent to a `Canvas`.

## Exercises
1. **DockPanel Order:** Create a `DockPanel` with two buttons. Dock the first to the `Top`, and the second to the `Left`. Run it. Now reverse their order in the XAML (put the `Left` button above the `Top` button). Run it again. Note how the corners overlap differently based entirely on declaration order.
2. **Nested Panels:** Layout panels can contain other layout panels. Create a `DockPanel`. Assign a button to the `Top` and a button to the `Bottom`. For the center area (the last child), insert a `WrapPanel` containing 10 small buttons. Observe how the application shell remains stable while the center content reflows.

## Definition of Done
- [ ] You can write a `StackPanel` that arranges items side-by-side instead of vertically.
- [ ] You can build a basic application shell using a `DockPanel`.
- [ ] You can demonstrate elements moving automatically to new rows using a `WrapPanel`.
- [ ] You know why you should not use a `Canvas` to build a login screen.
- [ ] You can explain the concept of different layout panels out loud, in your own words, to someone who hasn't read this lesson.
