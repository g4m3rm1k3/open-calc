# Lesson 30: async/await in WPF

**What you will build:** You will build a series of buttons that simulate or perform long-running operations, such as delaying execution or downloading data from the internet. This proves that you can run time-consuming tasks without freezing the application window, solving the problem of keeping the user interface responsive while work happens in the background.

**What you need to know first:** Lesson 02 (Buttons and Click Handlers), Lesson 15 (Tasks and Background Work).

**Terms introduced in this lesson:**
- **UI Thread** — the single primary thread in a WPF application that creates the window, processes input, and draws controls. *Why it exists:* GUI frameworks require single-threaded access to UI components to avoid race conditions when updating the screen.
- **Message Loop** — an infinite loop running on the UI thread that takes events from the operating system (mouse clicks, repaints) and dispatches them to your code. *Why it exists:* It is the mechanism that keeps an application alive and listening for user interaction.
- **Continuation** — the remaining portion of a method that executes after an `await` completes. *Why it exists:* It allows a method to pause and later resume its execution without permanently tying up a thread.

**Objects and methods used:**
- **System.Threading.Thread / Sleep**
  - *What it is:* A method that halts the current thread for a specified number of milliseconds.
  - *Implementation:* `public static void Sleep(int millisecondsTimeout);`
  - *Its use:* Simulating a blocking, long-running operation.
- **System.Threading.Tasks.Task / Delay**
  - *What it is:* A method that creates a task that completes after a specified time delay.
  - *Implementation:* `public static Task Delay(int millisecondsDelay);`
  - *Its use:* Simulating a long-running operation without blocking the thread.
- **System.Net.Http.HttpClient / GetStringAsync**
  - *What it is:* A method that sends an HTTP GET request to a URI and returns the response body as a string.
  - *Implementation:* `public Task<string> GetStringAsync(string? requestUri);`
  - *Its use:* Downloading data over the network asynchronously.
- **System.Windows.Threading.Dispatcher / InvokeAsync**
  - *What it is:* A method that queues a delegate to be executed on the UI thread.
  - *Implementation:* `public DispatcherOperation InvokeAsync(Action action);`
  - *Its use:* Updating WPF controls from a background thread.

---

## Concept Unit: The UI Thread Problem

### The Problem
WPF processes all visual updates and user interactions on a single thread, known as the UI thread or dispatcher thread. When you click a button, the operating system posts a message to the UI thread's message loop, which then invokes your event handler. If your event handler takes a long time to finish — for instance, by waiting for a database query or pausing execution — the message loop cannot process any further messages. The window stops drawing, buttons cannot be clicked, and the application appears to freeze.

### The New Code
```csharp
using System.Threading;
using System.Windows;
using System.Windows.Controls;

namespace WpfAsyncAwait;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        Button blockButton = new Button { Content = "Freeze Window (3 Seconds)" };
        blockButton.Click += BlockButton_Click;
        Content = blockButton;
    }

    private void BlockButton_Click(object sender, RoutedEventArgs e)
    {
        Thread.Sleep(3000);
        ((Button)sender).Content = "Finished!";
    }
}
```

### Mechanical Walkthrough
- `Thread.Sleep(3000)` halts the execution of the current thread (the UI thread) for 3,000 milliseconds. Because the thread is sleeping, it cannot return to the message loop to process repaints or new clicks.
- `((Button)sender).Content = "Finished!"` updates the button's text, but this change will not be visible on screen until the method finishes and the UI thread is free to redraw the window.

### CS Lens
The UI thread problem is a manifestation of synchronous, blocking I/O on an event-driven system. It is similar to a single checkout cashier at a grocery store stopping to read a book while a customer searches their car for payment; the line halts entirely until the cashier resumes their job.

### SE Lens
The immediate alternative is forcing the developer to manually spawn threads for every slow operation. This approach costs enormous complexity, as the developer must orchestrate thread lifecycles and safely marshal data back to the UI. The synchronous model shown here is simpler to write but renders the software unusable during processing.

### Run It Yourself
1. Create a new WPF project: `dotnet new wpf -n WpfAsyncAwait`
2. Replace `MainWindow.xaml.cs` with the code above (remove `InitializeComponent();` and the XAML file if necessary, or put the code in the constructor).
3. Run the application: `dotnet run`
4. Click the button. Try to drag the window or click the button again immediately. The window will not respond until 3 seconds pass and the text updates.

---

## Concept Unit: async and await

### The Problem
To keep the application responsive, we need a way to start a time-consuming operation, temporarily return control of the UI thread back to the message loop, and then resume execution of our method once the operation completes, all without writing manual thread management code.

### The New Code
```csharp
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

namespace WpfAsyncAwait;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        Button awaitButton = new Button { Content = "Wait Responsively (3 Seconds)" };
        awaitButton.Click += AwaitButton_Click;
        Content = awaitButton;
    }

    private async void AwaitButton_Click(object sender, RoutedEventArgs e)
    {
        await Task.Delay(3000);
        ((Button)sender).Content = "Finished!";
    }
}
```

### Mechanical Walkthrough
- `async void AwaitButton_Click(...)` adds the `async` modifier to the method signature. This instructs the C# compiler to rewrite the method into a state machine, allowing it to pause and resume. It is required if the method body uses `await`.
- `await Task.Delay(3000)` starts a task that will complete in 3 seconds. The `await` keyword immediately returns control of the thread to the caller (the WPF message loop). The UI remains fully responsive.
- `((Button)sender).Content = "Finished!"` is the continuation. When the 3-second delay finishes, the compiler ensures this line runs. Crucially, in a WPF application, `await` captures the current synchronization context, meaning the continuation automatically resumes on the UI thread, making it safe to interact with the button.

### CS Lens
This embodies cooperative multitasking and coroutines. The method yields execution back to the system (`await`) and registers a callback (the continuation) to be invoked upon completion, acting like a state machine transitioning between suspended and running states.

### SE Lens
The alternative not chosen is using raw callbacks or `.ContinueWith(...)`. While callbacks avoid blocking, they lead to deeply nested, unreadable code ("callback hell"). `async` and `await` cost compiler overhead to generate the state machine, but provide the enormous benefit of writing asynchronous code that looks sequential.

### Run It Yourself
1. Replace the `MainWindow` class contents with the new code.
2. Run the application: `dotnet run`
3. Click the button. Drag the window around while waiting. The window remains perfectly smooth and responsive, and the text updates after 3 seconds.

---

## Concept Unit: await with Real I/O

### The Problem
`Task.Delay` is a synthetic wait. The real utility of `async`/`await` is performing true input/output operations, like disk reads or network requests, which inherently take unpredictable amounts of time and should never block the UI thread.

### The New Code
```csharp
using System.Net.Http;
using System.Windows;
using System.Windows.Controls;

namespace WpfAsyncAwait;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        Button downloadButton = new Button { Content = "Download Data" };
        downloadButton.Click += DownloadButton_Click;
        Content = downloadButton;
    }

    private async void DownloadButton_Click(object sender, RoutedEventArgs e)
    {
        Button b = (Button)sender;
        b.Content = "Downloading...";
        b.IsEnabled = false;

        using HttpClient client = new HttpClient();
        string result = await client.GetStringAsync("https://example.com");
        
        b.Content = $"Downloaded {result.Length} characters";
        b.IsEnabled = true;
    }
}
```

### Mechanical Walkthrough
- `b.Content = "Downloading..."; b.IsEnabled = false;` updates the UI before the asynchronous work begins, providing immediate visual feedback and preventing the user from clicking the button multiple times while the request is in flight.
- `await client.GetStringAsync(...)` dispatches a network request. The UI thread is released back to the message loop. The operating system handles the network I/O in the background.
- `b.Content = $"Downloaded {result.Length} characters";` executes after the data arrives. Because `await` resumed on the UI thread, we can safely modify the button's content and re-enable it.

### CS Lens
This demonstrates asynchronous I/O. Instead of a thread idling while waiting for network packets (which wastes system resources), the thread is freed. The network hardware interrupts the CPU when data arrives, which eventually signals the task to complete.

### SE Lens
The alternative is using synchronous equivalents like `WebClient.DownloadString`. This blocks the thread, requiring either an unresponsive UI or manually creating a background thread specifically to block on the network call. `async`/`await` scales far better because it frees threads rather than consuming them.

### Run It Yourself
1. Replace the `MainWindow` class contents with the new code.
2. Run the application: `dotnet run`
3. Click the button. The text changes to "Downloading..." and the button disables. A moment later, the downloaded character count appears, all without a single hiccup in the window's responsiveness.

---

## Concept Unit: Dispatcher.InvokeAsync

### The Problem
Sometimes you have a CPU-intensive calculation (like processing an image or parsing a massive file) that *must* be pushed to a background thread using `Task.Run`. If that background thread tries to modify a WPF control, the application will crash. WPF enforces thread affinity: only the UI thread can touch UI controls.

### The New Code
```csharp
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

namespace WpfAsyncAwait;

public partial class MainWindow : Window
{
    private Button _calcButton;

    public MainWindow()
    {
        _calcButton = new Button { Content = "Calculate on Background Thread" };
        _calcButton.Click += CalcButton_Click;
        Content = _calcButton;
    }

    private void CalcButton_Click(object sender, RoutedEventArgs e)
    {
        Task.Run(() =>
        {
            // Simulating heavy CPU work on a background thread
            System.Threading.Thread.Sleep(2000); 

            // We are on a background thread here. We must ask the UI thread to update the button.
            Application.Current.Dispatcher.InvokeAsync(() =>
            {
                _calcButton.Content = "Calculation Done!";
            });
        });
    }
}
```

### Mechanical Walkthrough
- `Task.Run(...)` queues the provided delegate to run on a ThreadPool thread, which is a background thread entirely separate from the UI thread.
- `System.Threading.Thread.Sleep(2000)` safely blocks the background thread. The UI thread is unaffected and continues running.
- `Application.Current.Dispatcher.InvokeAsync(...)` marshals execution back to the UI thread. It packages the provided delegate and posts it to the UI thread's message loop. When the UI thread gets to this message, it executes the delegate, safely updating `_calcButton.Content`.

### CS Lens
This is thread marshaling and message passing. The background thread communicates with the UI thread by placing a message (the delegate) in a shared queue (the dispatcher queue). The UI thread dequeues and executes it, ensuring mutual exclusion.

### SE Lens
The alternative is disabling cross-thread exception checking, which leads to race conditions, memory corruption, and unpredictable rendering behavior. Using the `Dispatcher` costs a slight performance overhead for queuing and dequeuing the message, but it strictly guarantees thread safety for the UI framework.

### Run It Yourself
1. Replace the `MainWindow` class contents with the new code.
2. Run the application: `dotnet run`
3. Click the button. The UI stays responsive for 2 seconds, and then the text updates. 

---

## Connect the Pieces
A button click creates an event routed to the message loop on the UI thread. When handled by an `async` method, the UI thread executes the code until it hits an `await` on an I/O operation. Control immediately returns to the message loop, keeping the window responsive. When the I/O finishes, the continuation is queued on the message loop via the synchronization context, and the UI thread eventually picks it up to update the visual controls. If work is manually pushed to a background thread via `Task.Run`, the developer must manually queue the UI update onto the message loop using `Dispatcher.InvokeAsync`.

## What Breaks Without This
If a background thread attempts to directly modify a WPF control without using the `Dispatcher`, WPF will throw an exception.

Modify the `CalcButton_Click` method to remove the `Dispatcher`:
```csharp
    private void CalcButton_Click(object sender, RoutedEventArgs e)
    {
        Task.Run(() =>
        {
            System.Threading.Thread.Sleep(2000); 
            _calcButton.Content = "Calculation Done!"; // Direct access from background thread
        });
    }
```
When you run the application and click the button, it crashes after 2 seconds with an `InvalidOperationException`: "The calling thread cannot access this object because a different thread owns it."

Restore the code by wrapping the update in `Dispatcher.InvokeAsync`.

## Exercises
1. Modify the download example to download the HTML from two different URLs sequentially (one `await` after another), updating the button text to show the sum of their lengths.
2. Modify the `Task.Run` example to make the event handler `async`. Inside the handler, `await Task.Run(...)` and have the `Task.Run` delegate return a string result instead of updating the UI directly. Then, update the button using that string on the line after the `await`. This avoids needing `Dispatcher.InvokeAsync` entirely.

## Definition of Done
- [ ] You can explain why `Thread.Sleep` freezes a WPF application.
- [ ] You understand that `await` releases the UI thread and resumes execution on it later.
- [ ] You know why WPF throws an exception when a background thread touches a control.
- [ ] You can explain how to safely update the UI from a background thread using the `Dispatcher`.
- [ ] You can explain async/await in WPF out loud, in your own words, to someone who hasn't read this lesson.
