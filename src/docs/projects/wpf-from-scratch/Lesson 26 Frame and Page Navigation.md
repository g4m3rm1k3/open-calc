# Lesson 26: Frame and Page Navigation

**What you will build:** You will build a multi-screen application using a single main window that hosts swapable content pages. Instead of opening multiple windows, you will navigate between pages within a frame, passing data between them and utilizing the built-in back and forward history stack. Every example is discarded after it proves its point.

**What you need to know first:** Lesson 01, Lesson 03.

**Terms introduced in this lesson:**
- **Navigation Stack** — a historical record of visited locations kept in memory. *Why it exists:* To allow users to retrace their steps or move forward again without the application having to manually recreate or remember previous states.

**Objects and methods used:**
- **Frame / Navigate**
  - *What it is:* A method that loads a new page into the frame and records the transition in the navigation history.
  - *Implementation:* `public bool Navigate(object content)`
  - *Its use:* To change the currently displayed content inside a Frame container.
- **Page**
  - *What it is:* A root element for content that is intended to be hosted inside a Frame or navigation window.
  - *Implementation:* `public class Page : FrameworkElement, IWindowService, ...`
  - *Its use:* To encapsulate a distinct screen or view within a navigable application.
- **NavigationService / GoBack**
  - *What it is:* A service that manages the navigation history and operations for a Page.
  - *Implementation:* `public void GoBack()`
  - *Its use:* To return to the previous page in the navigation stack.

---

## Concept Unit: Frame

### The Problem
Applications often require multiple distinct screens. Opening a new physical operating system window for every screen is jarring and clutters the taskbar. We need a way to swap out large blocks of content within a single, static main window.

### The New Code
```xml
<Window x:Class="NavigationApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Main Window" Height="450" Width="800">
    <Grid>
        <Frame x:Name="mainFrame" NavigationUIVisibility="Visible" />
    </Grid>
</Window>
```

### Mechanical Walkthrough
- `<Frame x:Name="mainFrame">`: This declares a control that acts as a container. It reserves space in the window layout where other content will be injected dynamically. Without it, you have nowhere to load navigable content.
- `NavigationUIVisibility="Visible"`: This instructs the `Frame` to display a built-in toolbar at the top with back and forward navigation arrows. If omitted, the default is `Automatic` (which hides the UI if there is no navigation history), making it harder to verify navigation visually when starting out.

### CS Lens
A `Frame` acts as a view port into a state machine. The state machine (the navigation service) tracks the current state (the loaded page) and the history of states. The `Frame` simply renders whatever the current state dictates.

### SE Lens
The `Frame` is an implementation of the Composite pattern. It is a single control that seamlessly hosts complex, independent trees of UI elements. The alternative is manually managing the visibility of different `Grid` panels. Manual visibility management quickly becomes unmaintainable as the number of screens grows.

### Run It Yourself
1. Create a new .NET 8 WPF Application project named `NavigationApp`.
2. Open `MainWindow.xaml` and replace its contents with the XAML above.
3. Run the application.
4. You will see an empty window with a navigation bar at the top containing disabled back and forward arrows.

---

## Concept Unit: Page

### The Problem
If the `Frame` is the container, we need something to put inside it. A `Window` cannot be placed inside another `Window`. We need a distinct container type that holds UI elements and code, but is designed specifically to be hosted.

### The New Code
```xml
<Page x:Class="NavigationApp.HomePage"
      xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
      xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
      Title="Home Page">
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center">
        <TextBlock Text="Welcome to the Home Page!" FontSize="24" />
    </StackPanel>
</Page>
```

To display this page, the main window requests navigation to it in the code-behind:

```csharp
using System.Windows;

namespace NavigationApp
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            mainFrame.Navigate(new HomePage());
        }
    }
}
```

### Mechanical Walkthrough
- `<Page ...>`: The root element of the XAML file. This signifies that the file defines a `Page` object rather than a `Window` or a custom `UserControl`. A `Page` provides properties like `Title` which the `Frame` can read.
- `mainFrame.Navigate(new HomePage())`: This line instantiates a new instance of the `HomePage` class and tells the `Frame` to display it. Without this call, the `Frame` remains empty.

### CS Lens
A `Page` is an isolated module of execution and rendering. Like a plug-in in a modular architecture, it fulfills a contract that the host (`Frame`) understands, allowing the host to load it without needing to know its internal contents.

### SE Lens
Separating screens into `Page` classes enforces the Single Responsibility Principle. The `MainWindow` is responsible only for hosting and window chrome; the `HomePage` is responsible only for its own layout and logic. The alternative is dumping all UI for all screens into `MainWindow.xaml`, creating a massive, tightly coupled file.

### Run It Yourself
1. Right-click the project, select Add -> Page (WPF). Name it `HomePage.xaml`.
2. Replace its contents with the `HomePage` XAML above.
3. Open `MainWindow.xaml.cs` and replace its constructor with the code above.
4. Run the application.
5. The `Frame` in the main window will now display "Welcome to the Home Page!".

---

## Concept Unit: The Navigation Stack

### The Problem
When users navigate to a new screen, they often want to go back. If we manually instantiate and load pages, we must manually track where the user came from. We need a system that remembers the trail of visited pages.

### The New Code
```xml
<Page x:Class="NavigationApp.PageOne"
      xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
      xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
      Title="Page One">
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center">
        <TextBlock Text="This is Page One" FontSize="24" />
        <Button Content="Go to Page Two" Click="GoNext_Click" Margin="0,10,0,0" />
    </StackPanel>
</Page>
```

The code-behind for Page One handles the forward navigation:

```csharp
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;

namespace NavigationApp
{
    public partial class PageOne : Page
    {
        public PageOne()
        {
            InitializeComponent();
        }

        private void GoNext_Click(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new PageTwo());
        }
    }
}
```

The code-behind for Page Two handles the backward navigation:

```csharp
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;

namespace NavigationApp
{
    public partial class PageTwo : Page
    {
        public PageTwo()
        {
            InitializeComponent();
        }

        private void GoBack_Click(object sender, RoutedEventArgs e)
        {
            if (NavigationService.CanGoBack)
            {
                NavigationService.GoBack();
            }
        }
    }
}
```

### Mechanical Walkthrough
- `NavigationService`: A property available on every `Page` that gives access to the navigation engine of the hosting `Frame`. It acts as the bridge between the page and its container.
- `NavigationService.Navigate(new PageTwo())`: Pushes a new instance of `PageTwo` onto the navigation stack and displays it.
- `NavigationService.CanGoBack`: A boolean property that checks if there is a previous entry in the history stack. Without this check, calling `GoBack()` when the stack is empty will throw an exception.
- `NavigationService.GoBack()`: Pops the current page off the stack and restores the previous page instance.

### CS Lens
The navigation history is a classic implementation of a Stack data structure (LIFO: Last-In, First-Out). When you navigate forward, you push onto the stack. When you navigate backward, you pop from the stack. The same structure underlies compiler call stacks and undo/redo systems.

### SE Lens
Relying on `NavigationService` decouples the pages. `PageTwo` does not need a reference to `PageOne` or the `MainWindow` to return; it simply asks the service to go backward. The cost is that the navigation stack holds strong references to previous page instances, which consumes memory until they fall off the bottom of the stack or the history is cleared.

### Run It Yourself
1. Add `PageOne.xaml` and `PageTwo.xaml` to the project.
2. Add a button in `PageTwo.xaml` wired to `GoBack_Click`.
3. Set `mainFrame.Navigate(new PageOne())` in `MainWindow.xaml.cs`.
4. Run the application. Click the button to go to Page Two.
5. Click your custom Back button on Page Two, or the built-in back arrow on the Frame. You will return to Page One.

---

## Concept Unit: Passing Data Between Pages

### The Problem
A user selects an item on a list page, and the application must navigate to a detail page to show that specific item. The detail page needs to know which item was selected.

### The New Code
```csharp
// In the source page
private void ViewDetails_Click(object sender, RoutedEventArgs e)
{
    string selectedData = "Item 42";
    NavigationService.Navigate(new DetailPage(selectedData));
}
```

The destination page defines a constructor that expects the data:

```csharp
using System.Windows;
using System.Windows.Controls;

namespace NavigationApp
{
    public partial class DetailPage : Page
    {
        private readonly string _itemData;

        public DetailPage(string itemData)
        {
            InitializeComponent();
            _itemData = itemData;
            DetailsText.Text = $"Details for: {_itemData}";
        }
    }
}
```

### Mechanical Walkthrough
- `new DetailPage(selectedData)`: We pass the data directly into the constructor of the destination page when we instantiate it. This guarantees the page has the required data the moment it is created.
- `public DetailPage(string itemData)`: The constructor of the target page is modified to accept a parameter. This parameter is used to configure the page's state before the page is rendered.

### CS Lens
This is parameter passing. We are treating the navigation transition like a method call. The source page is the caller, the destination page is the callee, and the data is the argument passed to fulfill the callee's requirements.

### SE Lens
Passing data via a constructor explicitly defines the dependencies of the `DetailPage`. It is impossible to create a `DetailPage` without providing the required string. The alternative is storing `selectedData` in a global static variable. Global state is simpler to write but fragile: if you navigate to the detail page, then navigate back, the global variable still holds the stale data. If another part of the app reads it, it receives incorrect information.

### Run It Yourself
1. Create a `DetailPage.xaml` with a `TextBlock` named `DetailsText`.
2. Implement the `DetailPage.xaml.cs` constructor as shown.
3. In `PageOne.xaml.cs`, change the button click to navigate to `DetailPage` and pass a string.
4. Run the application. When you navigate, the detail page will display the specific string passed from the first page.

---

## Connect the Pieces
A user clicks a button on `HomePage`. The event handler captures a specific string value and calls `Navigate(new DetailPage(value))`. The `Frame` creates the `DetailPage`, pushing the `HomePage` onto the navigation stack. The `DetailPage` constructor runs, storing the passed string and updating its UI. Later, the user clicks the back button. The `Frame` calls `GoBack()`, dropping the `DetailPage` and restoring the `HomePage` from the stack exactly as it was left.

## What Breaks Without This
If you try to call `GoBack()` when there are no pages in the history, the application will crash.

In `MainWindow.xaml.cs`, add this line immediately after `InitializeComponent();`:
`mainFrame.NavigationService.GoBack();`

**The Error:**
`System.InvalidOperationException: 'Cannot go back when CanGoBack is false.'`

**The Fix:**
Always check `if (NavigationService.CanGoBack)` before calling `GoBack()`, or ensure the user interface is disabled when `CanGoBack` is false.

## Exercises
1. Modify `PageOne` to contain a `TextBox`. Pass the text typed by the user into the `DetailPage` constructor and display it.
2. Navigate from `PageOne` to `PageTwo`, then from `PageTwo` to `PageThree`. Check if calling `GoBack()` on `PageThree` returns you to `PageTwo`.
3. In `PageTwo`, check `NavigationService.CanGoForward`. Since you just arrived, it should be false.

## Definition of Done
- [ ] You have a main window hosting a `Frame`.
- [ ] You have created at least two `Page` objects.
- [ ] You can navigate between the pages using code.
- [ ] You can pass data from one page to another via the constructor.
- [ ] You can explain frame and page navigation out loud, in your own words, to someone who hasn't read this lesson.
