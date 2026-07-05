# async and await: Writing Code That Waits Without Blocking

Most programs do things that take time: reading a file from disk, fetching data from a website, querying a database. If you write that code the normal (synchronous) way, your entire program **freezes** while it waits for the result. The user sees a locked screen. The server stops handling other requests. Nothing else can happen.

**Asynchronous programming** solves this. It lets your program say "start this operation and come back to me when it's done" — freeing it to do other things in the meantime. In C#, this is done with the keywords `async` and `await`.

## The Problem: Blocking Code

Imagine a restaurant where there is only one waiter. A customer orders food. The waiter walks to the kitchen, stands there watching the food cook for 20 minutes, then brings it out. While waiting, they serve nobody else. That's **blocking** — the thread sits idle, doing nothing, while the work happens.

```csharp
// Synchronous (blocking) — simulating slow work with Thread.Sleep
static string FetchDataFromServer()
{
    Console.WriteLine("Starting download...");
    System.Threading.Thread.Sleep(3000);  // Pretend this takes 3 seconds
    Console.WriteLine("Download complete.");
    return "{ \"data\": 42 }";
}

// The program stops here for 3 full seconds
string data = FetchDataFromServer();
Console.WriteLine($"Got: {data}");
Console.WriteLine("This line had to wait 3 seconds to run.");
```

During those 3 seconds, the thread that runs your program is completely blocked. In a desktop app, the UI freezes. In a web server, that thread can't handle any other requests.

## The Solution: async and await

The same restaurant, reimagined: the waiter takes the order, gives it to the kitchen, then goes to serve other tables. When the kitchen calls out "order up!", the waiter comes back and delivers it. The waiter's time is never wasted waiting.

`async` and `await` work the same way. `await` says "start this work and let the thread go do something else. Resume here when it's done." No thread is blocked:

```csharp
// Task.Delay is the async version of Thread.Sleep
// It waits without blocking the thread
static async Task<string> FetchDataFromServerAsync()
{
    Console.WriteLine("Starting download...");

    // await here: this method pauses and releases the thread.
    // When 3 seconds pass, execution resumes from this exact point.
    await Task.Delay(3000);

    Console.WriteLine("Download complete.");
    return "{ \"data\": 42 }";
}

// To call an async method, you also use await
// The method that does the awaiting must itself be marked async
static async Task Main(string[] args)
{
    string data = await FetchDataFromServerAsync();
    Console.WriteLine($"Got: {data}");
    Console.WriteLine("This line runs after the download finishes.");
}
```

Two things changed:
1. The method is marked `async` — this tells C# it's allowed to use `await` inside
2. The return type changed from `string` to `Task<string>` — a `Task<T>` represents "a promise to deliver a `T` value in the future"

## Understanding `Task`

A **`Task`** is an object that represents an ongoing operation. It's like a receipt: you hand it to the cashier, get a receipt (Task), go sit down. When your name is called, you present the receipt and get your order (the result).

```csharp
// Task     = "this operation will complete, but returns nothing"
// Task<T>  = "this operation will complete and return a value of type T"

// These are the three possible return types for async methods:
static async Task DoSomethingAsync()
{
    await Task.Delay(100);
    // No return value — like a void method, but async
}

static async Task<int> GetNumberAsync()
{
    await Task.Delay(100);
    return 42;   // Will be delivered as the Task's result
}

static async Task<string> GetNameAsync()
{
    await Task.Delay(100);
    return "Alice";
}

// Calling them:
await DoSomethingAsync();             // Wait for it to finish
int number = await GetNumberAsync();  // Wait and get the int
string name = await GetNameAsync();   // Wait and get the string
```

## A Realistic Example: Simulating an API Call

In real code, you'd use `HttpClient` to fetch data from a web API. Here we'll simulate that to show the pattern:

```csharp
using System.Net.Http;

static async Task<string> GetWeatherAsync(string city)
{
    // HttpClient is the standard way to make HTTP requests in C#
    // 'using' ensures it's properly disposed when done
    using var client = new HttpClient();

    // GetStringAsync is an async method — it starts the HTTP request
    // and 'await' suspends this method until the response arrives
    // Your program can do other things while waiting for the server
    string response = await client.GetStringAsync($"https://wttr.in/{city}?format=3");

    return response;
}

// Calling it:
static async Task Main(string[] args)
{
    Console.WriteLine("Fetching weather...");

    // Both of these start at the same time — we're not waiting for
    // London before we start fetching Paris
    Task<string> londonTask = GetWeatherAsync("London");
    Task<string> parisTask  = GetWeatherAsync("Paris");

    // Now wait for both to finish
    string london = await londonTask;
    string paris  = await parisTask;

    Console.WriteLine($"London: {london}");
    Console.WriteLine($"Paris: {paris}");
}
```

Notice: we started both tasks before awaiting either. This means both HTTP requests run concurrently — you don't wait for London to finish before Paris starts. This halves the total wait time.

## Running Multiple Tasks at Once with `Task.WhenAll`

`Task.WhenAll` is a cleaner way to run many tasks in parallel and wait for all of them:

```csharp
static async Task<int> SlowAddAsync(int a, int b)
{
    // Simulate a slow calculation (e.g., calling a remote service)
    await Task.Delay(1000);
    return a + b;
}

static async Task Main(string[] args)
{
    Console.WriteLine("Starting three calculations simultaneously...");

    // Create all three tasks — they all start running right now
    Task<int> task1 = SlowAddAsync(1, 2);
    Task<int> task2 = SlowAddAsync(10, 20);
    Task<int> task3 = SlowAddAsync(100, 200);

    // Wait for ALL of them to finish — total wait is ~1 second, not ~3 seconds
    int[] results = await Task.WhenAll(task1, task2, task3);

    // results[0] = 3, results[1] = 30, results[2] = 300
    foreach (int r in results)
        Console.WriteLine(r);

    Console.WriteLine("All done!");
}
```

Without async, this would take 3 seconds (1 second × 3 sequential calls). With async + `Task.WhenAll`, it takes just 1 second because all three run at the same time.

## Exception Handling in Async Code

Exceptions in async methods work exactly the same way as in normal methods — you use `try/catch` in the same place. The exception is stored in the `Task` and re-thrown when you `await` it:

```csharp
static async Task<string> DownloadFileAsync(string url)
{
    using var client = new HttpClient();

    // If the URL is invalid or the server is unreachable, an exception is thrown
    string content = await client.GetStringAsync(url);
    return content;
}

static async Task Main(string[] args)
{
    try
    {
        // If DownloadFileAsync throws, the exception appears right here at the await
        string data = await DownloadFileAsync("https://invalid-site-that-does-not-exist.xyz");
        Console.WriteLine(data);
    }
    catch (HttpRequestException ex)
    {
        // HttpRequestException covers network failures, timeouts, bad responses
        Console.WriteLine($"Download failed: {ex.Message}");
    }
}
```

## async All the Way Down

One rule you must follow: **if a method uses `await`, it must be marked `async`.** And if you want to `await` that method, the calling method must also be `async`. This is called "async all the way up":

```csharp
// Level 3: does the actual async work
static async Task<byte[]> ReadFileBytesAsync(string path)
{
    return await System.IO.File.ReadAllBytesAsync(path);
}

// Level 2: calls the async method, must itself be async
static async Task<string> ProcessFileAsync(string path)
{
    byte[] bytes = await ReadFileBytesAsync(path);     // await here
    return System.Text.Encoding.UTF8.GetString(bytes);
}

// Level 1: calls level 2, must itself be async
static async Task ShowFileAsync(string path)
{
    string content = await ProcessFileAsync(path);     // await here
    Console.WriteLine(content);
}

// Entry point — in modern C# (9+), Main can be async
static async Task Main(string[] args)
{
    await ShowFileAsync("readme.txt");                 // await here
}
```

The `async` keyword propagates through your call stack. That's fine — it's how async is supposed to work.

## `async void`: The One Exception (and Why to Avoid It)

`async void` exists for one specific use: **event handlers**. Avoid it everywhere else. Unlike `Task`-returning async methods, you cannot `await` an `async void` method, and any exceptions it throws will crash your program in hard-to-debug ways:

```csharp
// Acceptable use of async void — event handlers require void return type
button.Click += async (sender, e) =>
{
    string data = await FetchDataAsync();
    DisplayData(data);
};

// Never do this for regular methods — use Task instead
async void BadMethod()   // BAD — exceptions can't be caught by callers
{
    await Task.Delay(100);
    throw new Exception("This will crash the whole program!");
}

async Task GoodMethod()  // GOOD — exceptions surface properly
{
    await Task.Delay(100);
    throw new Exception("This can be caught with try/catch at the await site.");
}
```

## `Task.Run`: Running CPU-Heavy Work Asynchronously

`await` by itself doesn't create a new thread — it just frees the current thread to do other things while waiting for I/O. But if you have **CPU-intensive** work (heavy calculations, image processing, large sorting), you should explicitly push it onto a background thread with `Task.Run`:

```csharp
static int HeavyCalculation(int n)
{
    // Simulates an expensive CPU computation — takes a long time
    long sum = 0;
    for (long i = 0; i < n * 1_000_000L; i++)
        sum += i;
    return (int)(sum % int.MaxValue);
}

static async Task Main(string[] args)
{
    Console.WriteLine("Starting heavy calculation in background...");

    // Task.Run puts HeavyCalculation on a thread pool thread
    // So the current thread is free — UI stays responsive
    int result = await Task.Run(() => HeavyCalculation(100));

    Console.WriteLine($"Result: {result}");
    Console.WriteLine("Main thread was never blocked.");
}
```

**Rule of thumb**:
- I/O operations (network, disk, database) — just `await` them directly, they're already async
- CPU-heavy operations — wrap in `Task.Run` to offload to a background thread

## The Naming Convention

By C# convention, async methods that return `Task` or `Task<T>` should have names ending in `Async`:

```csharp
// ✅ Good naming
Task<string> GetUserAsync(int id) { ... }
Task SaveOrderAsync(Order order)  { ... }
Task<bool> ValidateTokenAsync(string token) { ... }

// ❌ Missing the convention — confusing
Task<string> GetUser(int id) { ... }
```

This convention makes it obvious at a glance which methods are asynchronous, helping you remember to `await` them rather than calling them as regular methods.
