# Lesson 12: Grid Layout

**What you will build:** A structured, multi-section data entry form using rows and columns. You will prove that WPF controls can be aligned in a precise, spreadsheet-like layout that adapts fluidly to window resizing, unlike primitive top-down or left-to-right stacking.

**What you need to know first:** Lesson 02: XAML Basics, Lesson 11: StackPanel and Alignment.

**Terms introduced in this lesson:**
- **Attached Property** — A property defined by one class (like `Grid`) that is set on a completely different class (like `Button`). *Why it exists:* It allows container-specific layout instructions to be attached directly to the children, rather than forcing the container to manage a separate dictionary of layout settings for every child.
- **Proportional Sizing (Star Sizing)** — A layout mechanism where available space is divided as fractions. *Why it exists:* It allows a UI to distribute extra screen real estate dynamically when a window resizes, without hardcoding exact pixel widths.

**Objects and methods used:**
- **Grid**
  - *What it is:* A layout control that positions child elements in rows and columns.
  - *Implementation:* `<Grid> ... </Grid>`
  - *Its use:* The primary container for complex, structured, or form-like user interfaces.
- **ColumnDefinition / RowDefinition**
  - *What it is:* Objects that define the sizing characteristics of a single column or row within a `Grid`.
  - *Implementation:* `<ColumnDefinition Width="Auto" />`
  - *Its use:* Defines the grid's blueprint before any controls are placed into it.
- **Grid.Row / Grid.Column**
  - *What it is:* Attached properties used to place a control into a specific grid cell.
  - *Implementation:* `<Button Grid.Row="1" Grid.Column="2" />`
  - *Its use:* Tells the `Grid` exactly where a child element belongs.
- **Grid.RowSpan / Grid.ColumnSpan**
  - *What it is:* Attached properties that allow a control to stretch across multiple adjacent cells.
  - *Implementation:* `<Button Grid.ColumnSpan="2" />`
  - *Its use:* Creates wide or tall controls that break the strict grid boundaries, like a "Submit" button at the bottom of a two-column form.

---

## Concept Unit: The Default Grid

### The Problem
You need a container to hold multiple controls, but if you put them in a plain `Grid` without defining any structure, you need to understand how the container behaves by default.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Grid Default" Height="200" Width="300">
    <Grid>
        <TextBlock Text="Background Text" FontSize="24" Foreground="Gray" HorizontalAlignment="Center" VerticalAlignment="Center"/>
        <TextBlock Text="Foreground Text" FontSize="24" Foreground="Black" HorizontalAlignment="Center" VerticalAlignment="Center"/>
    </Grid>
</Window>
```

### Mechanical Walkthrough
- `<Grid>` creates the layout container. Because no rows or columns are explicitly defined, the `Grid` creates a single invisible cell spanning the entire container (Row 0, Column 0).
- The first `<TextBlock>` is added to the `Grid`. It occupies the single cell and is centered.
- The second `<TextBlock>` is also added to the `Grid`. Since no location is specified, it also defaults to the single cell.
- Because both text blocks are in the exact same cell, the `Grid` renders them stacked on top of each other in the Z-axis, in the order they appear in the XAML. The second one is drawn over the first one.

### CS Lens
A `Grid` without definitions is a 1x1 matrix. Rendering multiple items into a single matrix cell requires a compositing rule; WPF uses painter's algorithm, drawing later elements on top of earlier ones.

### SE Lens
Relying on the single-cell default is mostly useful for overlapping elements intentionally (like placing a text label directly over an image). For actual layout, failing to define rows and columns defeats the purpose of using a `Grid`.

### Run It Yourself
1. Create a new WPF project (`dotnet new wpf -n WpfApp`).
2. Replace `MainWindow.xaml` with the code above.
3. Run `dotnet run`.
4. Observe that the text "Foreground Text" obscures "Background Text" because they occupy the exact same default cell.

---

## Concept Unit: Defining Rows and Columns

### The Problem
You want a layout that reserves specific amounts of space for different sections: a fixed-size header, a column that shrinks to fit a label, and an area that expands to fill whatever space is left.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Definitions" Height="300" Width="400">
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="100" />
            <ColumnDefinition Width="Auto" />
            <ColumnDefinition Width="2*" />
            <ColumnDefinition Width="*" />
        </Grid.ColumnDefinitions>

        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" />
            <RowDefinition Height="*" />
        </Grid.RowDefinitions>
    </Grid>
</Window>
```

### Mechanical Walkthrough
- `<Grid.ColumnDefinitions>` holds the collection of column blueprints.
- `<ColumnDefinition Width="100" />` creates Column 0. It is exactly 100 pixels wide, regardless of window size or what is placed inside it.
- `<ColumnDefinition Width="Auto" />` creates Column 1. It will measure the width of whatever controls are placed inside it, and shrink to fit exactly that content.
- `<ColumnDefinition Width="2*" />` and `<ColumnDefinition Width="*" />` create Columns 2 and 3. After the fixed 100 pixels and the `Auto` width are subtracted from the window's total width, the remaining space is divided into 3 equal shares (2 + 1). Column 2 gets two shares, and Column 3 gets one share.
- `<RowDefinition Height="Auto" />` creates Row 0, which shrinks vertically to fit its contents.
- `<RowDefinition Height="*" />` creates Row 1, which takes all remaining vertical space in the window.

### CS Lens
Star sizing (`*`) is a system of linear equations solving for layout constraint distribution. It calculates `AvailableSpace = TotalSpace - Sum(Fixed) - Sum(Auto)`, then allocates `(Weight / TotalWeight) * AvailableSpace` to each proportional element.

### SE Lens
Using `Auto` and `*` is the cornerstone of responsive design in WPF. Hardcoding pixel sizes (`100`) is brittle and breaks when text is translated to other languages or user display scaling changes. Use fixed sizes only for things that truly never change, like a standard 16x16 icon column.

### Run It Yourself
1. Paste the code into `MainWindow.xaml`.
2. Run `dotnet run`.
3. The window will be blank because we defined the skeleton but added no controls to make the cells visible. (You would use a tool like Visual Studio or XAML Designer to see the grid lines, or add colored borders).

---

## Concept Unit: Placing Controls

### The Problem
Now that you have a grid structure, you need to place specific UI controls into specific cells to create a data entry form.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Form Layout" Height="200" Width="300">
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="Auto" />
            <ColumnDefinition Width="*" />
        </Grid.ColumnDefinitions>

        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" />
            <RowDefinition Height="Auto" />
            <RowDefinition Height="*" />
        </Grid.RowDefinitions>

        <TextBlock Text="First Name:" Grid.Row="0" Grid.Column="0" Margin="5"/>
        <TextBox Text="Jane" Grid.Row="0" Grid.Column="1" Margin="5"/>

        <TextBlock Text="Last Name:" Grid.Row="1" Grid.Column="0" Margin="5"/>
        <TextBox Text="Doe" Grid.Row="1" Grid.Column="1" Margin="5"/>
    </Grid>
</Window>
```

### Mechanical Walkthrough
- `<ColumnDefinition Width="Auto" />` makes Column 0 just wide enough to fit "First Name:" and "Last Name:".
- `<ColumnDefinition Width="*" />` makes Column 1 take up the rest of the window width for the TextBoxes.
- `Grid.Row="0" Grid.Column="0"` on the first `TextBlock` places it in the top-left cell. These are attached properties—they are defined by the `Grid` class, but applied directly to the `TextBlock`.
- `Grid.Row="0" Grid.Column="1"` on the first `TextBox` places it to the right of the first label.
- `Grid.Row="1" Grid.Column="0"` and `Grid.Row="1" Grid.Column="1"` place the second label and input box on the next row down.
- If a control omits `Grid.Row` or `Grid.Column`, WPF assumes a value of `0`.

### CS Lens
Attached properties solve an inheritance problem. A `TextBox` shouldn't inherit `Row` and `Column` properties because it might not be inside a `Grid` (it could be in a `StackPanel`). By making the property "attached," the parent container can query the child for layout metadata without polluting the child's class definition.

### SE Lens
Separating the structural definitions (`ColumnDefinitions`) from the placement data (`Grid.Row`) makes the XAML robust. If you want to insert a new row in the middle, you just add a `RowDefinition` and update the `Grid.Row` integers on the controls below it.

### Run It Yourself
1. Paste the code into `MainWindow.xaml`.
2. Run `dotnet run`.
3. Observe a clean two-column form. Resize the window horizontally. The labels stay the same width, but the text boxes stretch to fill the space.

---

## Concept Unit: Spanning Multiple Cells

### The Problem
You have a two-column form, but you want a single "Submit" button at the bottom that stretches across the entire width of the form, ignoring the column dividing line.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Spanning" Height="200" Width="300">
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="Auto" />
            <ColumnDefinition Width="*" />
        </Grid.ColumnDefinitions>

        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" />
            <RowDefinition Height="Auto" />
        </Grid.RowDefinitions>

        <TextBlock Text="Email:" Grid.Row="0" Grid.Column="0" Margin="5"/>
        <TextBox Text="test@example.com" Grid.Row="0" Grid.Column="1" Margin="5"/>

        <Button Content="Submit" Grid.Row="1" Grid.Column="0" Grid.ColumnSpan="2" Margin="5"/>
    </Grid>
</Window>
```

### Mechanical Walkthrough
- The grid is set up with 2 columns and 2 rows.
- The `TextBlock` and `TextBox` occupy Row 0, Columns 0 and 1.
- The `<Button>` is placed in `Grid.Row="1" Grid.Column="0"`.
- `Grid.ColumnSpan="2"` tells the `Grid` that this control should consume the space of its starting cell (Column 0) *and* the cell immediately to its right (Column 1). It breaks the wall between the two columns.
- The button stretches to fill the combined width of the label column and the input column.

### CS Lens
This is identical in concept to `colspan` and `rowspan` in HTML tables. It allows an irregular shape to be mapped onto a regular matrix by merging adjacent coordinate spaces for a specific element.

### SE Lens
`ColumnSpan` prevents you from having to create complex nested layouts just to have a full-width footer. However, if a spanned element dictates an `Auto` width or height, the layout engine has to do complex negotiations to decide how to distribute that size requirement across the spanned columns. Keep spanned elements simple.

### Run It Yourself
1. Paste the code into `MainWindow.xaml`.
2. Run `dotnet run`.
3. Notice how the Submit button is as wide as both the Email label and the textbox combined.

---

## Concept Unit: Nested Grids

### The Problem
You have a complex UI where one part is a strict form, but another part requires an entirely different alignment (like a toolbar with buttons). Trying to force both into one massive `Grid` requires defining too many tiny columns that conflict with each other.

### The New Code
```xml
<Window x:Class="WpfApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Nested Grids" Height="300" Width="400">
    <Grid>
        <!-- Outer Grid Structure -->
        <Grid.RowDefinitions>
            <RowDefinition Height="*" />
            <RowDefinition Height="50" />
        </Grid.RowDefinitions>

        <!-- Main Content Area -->
        <TextBlock Text="Main Content Here" Grid.Row="0" Background="LightGray" />

        <!-- Inner Grid in the Footer -->
        <Grid Grid.Row="1" Background="DarkGray">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="Auto" />
                <ColumnDefinition Width="*" />
                <ColumnDefinition Width="Auto" />
            </Grid.ColumnDefinitions>

            <Button Content="Cancel" Grid.Column="0" Width="80" Margin="5" />
            <!-- Column 1 is empty space (*) -->
            <Button Content="Save" Grid.Column="2" Width="80" Margin="5" />
        </Grid>
    </Grid>
</Window>
```

### Mechanical Walkthrough
- The outer `<Grid>` has two rows. Row 0 takes remaining space (`*`), and Row 1 is a fixed footer of 50 pixels.
- The inner `<Grid>` is placed in `Grid.Row="1"` of the outer grid. It acts as a single child element to the outer grid.
- The inner grid defines its own entirely independent set of columns.
- `<ColumnDefinition Width="Auto" />`, `*`, and `Auto` push the Cancel button to the far left and the Save button to the far right, because the middle empty `*` column consumes all the leftover space in the footer.
- The column definitions of the inner grid have absolutely no effect on the outer grid, and vice versa.

### CS Lens
Composition. A `Grid` is just an `UIElement` that can contain other `UIElement`s. By nesting them, you create a tree of independent layout solvers. The outer solver calculates the bounding box for the inner `Grid`, and then hands off that box to the inner solver to distribute among its own children.

### SE Lens
Nesting grids is vastly superior to creating a monolithic grid with 20 columns. It encapsulates layout concerns. The main content area doesn't need to know that the footer has buttons aligned to the edges. However, deeply nesting many grids can impact rendering performance, though this is rarely an issue in modern business applications.

### Run It Yourself
1. Paste the code into `MainWindow.xaml`.
2. Run `dotnet run`.
3. Resize the window. The outer grid handles the vertical proportions, while the inner grid handles the horizontal separation of the buttons.

---

## Connect the Pieces
A `Grid` operates through a sequence of rules: First, it defines a spatial matrix via `ColumnDefinitions` and `RowDefinitions`. Next, it reads the `Grid.Row` and `Grid.Column` attached properties on its child elements to map them to coordinates. It then processes `ColumnSpan` and `RowSpan` to merge coordinate bounds. Finally, it calculates the space required by `Auto` elements, solves the fractional shares for `*` elements, and renders the layout. If an entire `Grid` is placed into the cell of another, the process simply recurses downward.

## What Breaks Without This
If you specify a `Grid.Row` or `Grid.Column` index that does not exist in your definitions, WPF fails silently at compile time, but throws a runtime layout exception or misbehaves depending on the exact context (often defaulting back to 0, or throwing an `ArgumentOutOfRangeException` during arrange).

**The Code:**
```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="*" />
    </Grid.RowDefinitions>
    <TextBlock Text="Oops" Grid.Row="5" />
</Grid>
```

If you specify `Grid.Row="5"` but only defined one row, the element will just be clamped to row 0 or omitted from proper rendering. To fix it, ensure your zero-based index in `Grid.Row` corresponds to a defined `<RowDefinition>`.

## Exercises
1. Modify the Form Layout example to add a third row for "Phone Number". Ensure the labels and text boxes align correctly.
2. Create a 3x3 grid (like a tic-tac-toe board) where all rows and columns use `*` sizing so they form 9 equal squares that grow and shrink with the window.
3. Take the 3x3 grid and add a single button that spans the entire middle row (spanning 3 columns).

## Definition of Done
- [ ] You understand that a `Grid` with no definitions places everything in one cell.
- [ ] You can explain the difference between `Auto`, `*`, and fixed sizing.
- [ ] You know how to use attached properties to place a control in a specific row and column.
- [ ] You can make an element span multiple columns or rows.
- [ ] You can explain Grid layout out loud, in your own words, to someone who hasn't read this lesson.
