# Lesson 18: ObservableCollection<T>

**What you will build:** You will build a set of isolated, temporary WPF interfaces that prove how UI controls respond to data collections that change at runtime. You will prove that standard collections fail to update the UI when items are added, and you will solve this transferable problem by implementing a collection that actively broadcasts its structural changes to the framework.

**What you need to know first:** Lesson 16: Data Binding, Lesson 17: INotifyPropertyChanged.

**Terms introduced in this lesson:**
- **CollectionChanged** — an event fired when a collection has items added, removed, or is cleared. *Why it exists:* UI controls need a standardized signal to know when to redraw the items they are displaying without constantly re-scanning the data in a loop.

**Objects and methods used:**
- **System.Collections.ObjectModel.ObservableCollection<T>**
  - *What it is:* A dynamic data collection that provides notifications when items get added, removed, or when the whole list is refreshed.
  - *Implementation:* `public class ObservableCollection<T> : Collection<T>, INotifyCollectionChanged, INotifyPropertyChanged`
  - *Its use:* Replacing `List<T>` as the data source for `ItemsControl` derivatives like `ListBox` or `DataGrid` when the collection size changes at runtime.

---

## Concept Unit: The Problem with List<T>

### The Problem
When you bind a collection of items to a UI control like a `ListBox`, the control reads the collection once to draw the initial elements. If you subsequently add a new item to that collection in code, the user interface remains completely unchanged. The underlying memory holds the new item, but the screen does not reflect it because the standard `List<T>` has no mechanism to inform anyone that its contents have changed.

### The New Code
```csharp
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;

namespace Lesson18;

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        List<string> logs = new List<string> { "System booted." };

        ListBox displayList = new ListBox();
        displayList.ItemsSource = logs;

        Button addLogButton = new Button { Content = "Add Log" };
        addLogButton.Click += (sender, args) =>
        {
            logs.Add("New log entry.");
        };

        StackPanel layout = new StackPanel();
        layout.Children.Add(addLogButton);
        layout.Children.Add(displayList);

        Window window = new Window
        {
            Title = "Failing List Binding",
            Content = layout,
            Width = 300,
            Height = 200
        };

        window.Show();
    }
}
```

### Mechanical Walkthrough
- `List<string> logs = new List<string> { "System booted." };` sets up the initial data structure in memory. It holds exactly one string, providing the baseline state that the UI will read upon initialization; without it, the `ListBox` would be completely empty at startup.
- `displayList.ItemsSource = logs;` tells the `ListBox` where to find the data it should display. It iterates over the collection once to build the visual rows; without this assignment, the `ListBox` has no connection to the data and displays nothing.
- `logs.Add("New log entry.");` inserts a new string into the underlying data structure when the button is clicked. It modifies the memory state but performs no secondary actions; without it, the list size never grows, but because it raises no events, the UI is unaware the memory changed.

### CS Lens
This embodies the problem of "Polling vs. Push". Because the data structure does not "push" a notification out when it changes, the only way the UI could know about the change would be to "poll" (constantly check the list size on a timer). Polling wastes CPU cycles, so WPF controls wait for a push notification instead. Since `List<T>` never pushes, the systems are desynchronized.

### SE Lens
The engineering principle here is separation of concerns. The `List<T>` is heavily optimized for fast memory manipulation and minimal overhead. The alternative not chosen by the .NET designers was to force all lists to broadcast events. The tradeoff is that standard lists are extremely fast and memory-efficient, at the cost of being useless for live UI synchronization.

### Run It Yourself
1. Create a new WPF project: `dotnet new wpf -n Lesson18`
2. Open `App.xaml.cs` and replace its contents with the code above.
3. Open `App.xaml` and remove the `StartupUri="MainWindow.xaml"` property.
4. Run the application: `dotnet run`
5. Click the "Add Log" button repeatedly. Observe that the list on screen never grows beyond "System booted.", even though the memory array is growing.

---

## Concept Unit: ObservableCollection<T>

### The Problem
To fix the synchronization failure, we need a data structure that implements `INotifyCollectionChanged`. When a control like `ListBox` is given an `ItemsSource`, it checks if the source implements this interface. If it does, the `ListBox` silently subscribes to the `CollectionChanged` event. We must swap `List<T>` for `ObservableCollection<T>`.

### The New Code
```csharp
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;

namespace Lesson18;

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        ObservableCollection<string> logs = new ObservableCollection<string> { "System booted." };

        ListBox displayList = new ListBox();
        displayList.ItemsSource = logs;

        Button addLogButton = new Button { Content = "Add Log" };
        addLogButton.Click += (sender, args) =>
        {
            logs.Add("New log entry.");
        };

        StackPanel layout = new StackPanel();
        layout.Children.Add(addLogButton);
        layout.Children.Add(displayList);

        Window window = new Window
        {
            Title = "Working Observable Binding",
            Content = layout,
            Width = 300,
            Height = 200
        };

        window.Show();
    }
}
```

### Mechanical Walkthrough
- `ObservableCollection<string> logs = ...` initializes a specialized collection that implements event broadcasting. It sets up internal event handlers alongside the underlying data array; without this specific type, the framework cannot detect when items are added or removed.
- `displayList.ItemsSource = logs;` assigns the data source to the control. Under the hood, WPF detects that `logs` is an `INotifyCollectionChanged` and hooks an event listener to it; without this explicit interface implementation on the collection, WPF would just read the data once and disconnect.
- `logs.Add("New log entry.");` appends the string and immediately fires a `CollectionChanged` event detailing exactly what index was added. This event routes to the `ListBox`, which generates exactly one new visual row; without this event firing from the `Add` method, the UI would remain stagnant.

### CS Lens
This embodies the Observer Pattern. The collection is the "subject" whose state changes, and the `ListBox` is the "observer" that registers interest. The subject maintains a list of observers and notifies them automatically of any state changes.

### SE Lens
The engineering principle is explicit boundaries. The alternative not chosen is having the UI directly manage the data structure. The tradeoff is that using `ObservableCollection` introduces slight processing overhead when modifying the list, because it must generate and dispatch event arguments, making it inappropriate for high-frequency algorithmic processing but perfect for human-speed UI updates.

### Run It Yourself
1. Replace the previous code in `App.xaml.cs` with the code above.
2. Run the application: `dotnet run`
3. Click the "Add Log" button. Observe that a new row appears instantly in the `ListBox` on every single click.

---

## Concept Unit: What ObservableCollection Does Not Do

### The Problem
A common trap is assuming `ObservableCollection` makes the *contents* of the items observable. If you have an `ObservableCollection<Server>`, and you change `Server.Status`, the collection itself has not shrunk or grown. No items were added or removed, so the collection fires no events. The UI will not update the modified item.

### The New Code
```csharp
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;

namespace Lesson18;

public class Server
{
    public string Name { get; set; } = "Server 1";
    public string Status { get; set; } = "Offline";
}

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        ObservableCollection<Server> servers = new ObservableCollection<Server>
        {
            new Server()
        };

        ListBox displayList = new ListBox();
        displayList.ItemsSource = servers;
        
        // Set up how each Server object should be rendered as text
        FrameworkElementFactory textFactory = new FrameworkElementFactory(typeof(TextBlock));
        textFactory.SetBinding(TextBlock.TextProperty, new Binding("Status"));
        displayList.ItemTemplate = new DataTemplate { VisualTree = textFactory };

        Button mutateButton = new Button { Content = "Turn On" };
        mutateButton.Click += (sender, args) =>
        {
            servers[0].Status = "Online";
        };

        StackPanel layout = new StackPanel();
        layout.Children.Add(mutateButton);
        layout.Children.Add(displayList);

        Window window = new Window
        {
            Title = "Shallow Notification",
            Content = layout,
            Width = 300,
            Height = 200
        };

        window.Show();
    }
}
```

### Mechanical Walkthrough
- `public string Status { get; set; }` defines a standard auto-property on the object. It holds data but raises no `PropertyChanged` events; without `INotifyPropertyChanged` on this class, property assignments are strictly silent memory operations.
- `ObservableCollection<Server> servers = ...` creates the collection. It is configured to monitor the count and structure of the list; without an item actually entering or leaving the list, it will not fire its `CollectionChanged` event.
- `servers[0].Status = "Online";` reaches inside the existing item and changes its data. The `ListBox` continues to read "Offline" on the screen because neither the class nor the collection broadcasted an alert; without explicit `INotifyPropertyChanged` on the `Server` class itself, deep mutations are invisible to WPF.

### CS Lens
This embodies "Shallow Observation" versus "Deep Observation". The collection only observes its own structural shell (the array of object references). It is not deeply traversing every property of every object inside it. Operating systems use this same concept when monitoring file directories: the OS watches for new files being created in a folder (shallow), but doesn't necessarily watch inside every text file for line edits (deep).

### SE Lens
The engineering principle is minimizing cascading performance penalties. The alternative not chosen would be an `ObservableCollection` that subscribes to every property of every object it contains. The tradeoff is that developers must manually combine `ObservableCollection` (for structural changes) with `INotifyPropertyChanged` (for internal item changes), but this prevents massive CPU spikes that would occur if the collection forcefully monitored a 10,000-item deep hierarchy for single byte changes.

### Run It Yourself
1. Replace the code in `App.xaml.cs` with the code above.
2. Run the application: `dotnet run`
3. Click the "Turn On" button. Note that the text remains "Offline". The item did not trigger a UI update because the collection did not change size.

---

## Concept Unit: Initializing with Data

### The Problem
Often, you retrieve a `List<T>` or array from a database or a file parsing operation. You need to convert this static batch of data into an `ObservableCollection` so the UI can manage it dynamically. You cannot cast a `List<T>` to an `ObservableCollection<T>`, but you can pass the existing collection directly into the constructor to seed it.

### The New Code
```csharp
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;

namespace Lesson18;

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        // Simulating data retrieved from a database
        List<string> databaseResults = new List<string> { "Row 1", "Row 2", "Row 3" };

        // Seeding the observable collection
        ObservableCollection<string> activeData = new ObservableCollection<string>(databaseResults);

        ListBox displayList = new ListBox();
        displayList.ItemsSource = activeData;

        Button clearButton = new Button { Content = "Clear Data" };
        clearButton.Click += (sender, args) =>
        {
            activeData.Clear();
        };

        StackPanel layout = new StackPanel();
        layout.Children.Add(clearButton);
        layout.Children.Add(displayList);

        Window window = new Window
        {
            Title = "Initialization and Clearing",
            Content = layout,
            Width = 300,
            Height = 200
        };

        window.Show();
    }
}
```

### Mechanical Walkthrough
- `List<string> databaseResults = ...` acts as the raw, static data source. It represents data that comes from external operations that do not know or care about WPF; without it, we would have to manually loop and call `Add` for every retrieved row.
- `new ObservableCollection<string>(databaseResults);` executes the constructor overload that accepts an `IEnumerable<T>`. It loops over the provided sequence and copies the references into its internal structure before the UI binds to it; without this copy mechanism, migrating flat data into a UI-ready structure would require verbose boilerplate code.
- `activeData.Clear();` empties the collection. This immediately fires a single `CollectionChanged` event with a `Reset` action, which instructs the `ListBox` to wipe all visuals at once; without it, you would have to loop backward and remove items one by one, firing an event for every single removal.

### CS Lens
This embodies State Transfer. Data frequently moves across system boundaries in "dumb" transport formats (like arrays or JSON) and must be transformed into "smart" runtime structures (like objects with event listeners) upon arrival.

### SE Lens
The engineering principle is constructor dependency injection. The alternative not chosen is forcing developers to instantiate an empty collection and manually populate it. The tradeoff is that this constructor creates a shallow copy in memory; memory usage briefly doubles because both the `List` and the `ObservableCollection` now hold references to the data until the original `List` falls out of scope and is garbage collected.

### Run It Yourself
1. Replace the code in `App.xaml.cs` with the code above.
2. Run the application: `dotnet run`
3. Observe the window starts populated with three rows.
4. Click "Clear Data" and observe all rows instantly vanish because `Clear()` correctly broadcasts a reset notification.

---

## Connect the Pieces
A `string` represents a log entry. Initially, this string is hardcoded or fetched into a standard `List<string>`, which acts as silent memory. Because the UI requires active notifications to redraw itself without polling, that string is transferred into an `ObservableCollection<string>` via the constructor. When a new string is generated by user input, `Add()` places it into the collection. The collection instantly packages the new string's index into a `CollectionChanged` event and fires it. The `ListBox`, having secretly subscribed to this event when `ItemsSource` was set, receives the index, retrieves the string, and renders the new visual row.

## What Breaks Without This
If you reassign the `ItemsSource` entirely every time you add an item, instead of using an `ObservableCollection`, you destroy UI state.

```csharp
// Terrible approach
logs.Add("New log");
displayList.ItemsSource = null;
displayList.ItemsSource = logs;
```
This technically causes the UI to refresh, but it forces the `ListBox` to destroy and recreate every single row from scratch. If the user had scrolled down to row 500, or selected row 2, all of that state is completely lost and reset to the top. `ObservableCollection` prevents this catastrophic reset by surgically telling the control exactly which single item was added.

## Exercises
1. Modify the final code block so the button removes the first item (`activeData.RemoveAt(0)`) instead of clearing the list. Observe how the remaining items shift up in the UI.
2. Create a small interface with two buttons. Bind an `ObservableCollection<string>` to a `ListBox`. Have one button add an item, and the other button assign a completely new instance of `ObservableCollection<string>` to the `ListBox.ItemsSource`. Notice the difference between updating the collection and replacing the collection.
3. Implement `INotifyPropertyChanged` on the `Server` class from the third concept unit. Prove that doing so makes the "Turn On" button correctly update the `ListBox` text to "Online", thereby solving the shallow observation problem.

## Definition of Done
- [ ] You have compiled and run the failing `List<T>` example.
- [ ] You have observed the success of `ObservableCollection<T>`.
- [ ] You have modified item properties and proven that the collection itself ignores internal state changes.
- [ ] You can explain `ObservableCollection` out loud, in your own words, to someone who hasn't read this lesson.
