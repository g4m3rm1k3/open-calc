---
series: csharp-fundamentals
level: 23
title: Async & Await
lang: csharp
---

# Async & Await

Every method so far has run to completion before returning — the calling code waits, doing nothing else, for however long the method takes. A method reading a file, calling a web service, or waiting on any real-world delay doesn't need to block the entire program while it waits. `async`/`await` let a method pause at the exact point it's genuinely waiting on something, without blocking whatever called it.

## A Method That Awaits

```csharp
using System;
using System.Threading.Tasks;

class Program
{
    static async Task<int> FetchValueAsync()
    {
        await Task.Delay(100);
        return 42;
    }

    static void Main()
    {
        int result = FetchValueAsync().GetAwaiter().GetResult();
        Console.WriteLine(result);
    }
}
```

```text
42
```

`static async Task<int> FetchValueAsync()` — `async` marks the method as one that can `await` inside it. `Task<int>` — not a plain `int` — is the real return type: a `Task<int>` represents "an `int`, eventually, once the work finishes," not the number itself.

`await Task.Delay(100);` — pauses `FetchValueAsync` for `100` milliseconds, standing in for any real wait (a network call, a disk read). This is `Task.Delay`, not `Thread.Sleep` — the real, structural difference the next example makes visible.

`FetchValueAsync().GetAwaiter().GetResult();` — calls the async method and blocks until its `Task<int>` actually completes, extracting the real `int` result. This project's own `Main` cannot itself be `async` — `.GetAwaiter().GetResult()` is the real, correct way to call into async code from a method that isn't.

**CS lens:** `Task<T>` is the concrete meaning of "a value that doesn't exist yet." Code holding a `Task<int>` has a real, live handle to eventually-available work — genuinely different from holding an `int` directly, which always already has its value.

## await Doesn't Block the Thread It Runs On

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

class Program
{
    static async Task<int> SlowCalculationAsync()
    {
        await Task.Delay(50);
        return 7 * 6;
    }

    static void Main()
    {
        Console.WriteLine("Starting");
        var task = SlowCalculationAsync();
        Console.WriteLine("Calculation started, not finished yet");

        int result = task.GetAwaiter().GetResult();
        Console.WriteLine("Result: " + result);
    }
}
```

```text
Starting
Calculation started, not finished yet
Result: 42
```

`var task = SlowCalculationAsync();` — starts the async method running, but does **not** wait for it here. The very next line, `Console.WriteLine("Calculation started, not finished yet")`, runs immediately — proof that starting an async call and waiting for its result are two genuinely separate steps.

`task.GetAwaiter().GetResult();` — only *this* line actually waits for `SlowCalculationAsync` to finish, and only right here does the real result become available.

**SE lens:** This is the entire real point of `async`/`await`: a caller can start a slow operation, go do other real work in the meantime (in a genuine, real UI application: keep the window responsive, exactly the way Lesson 51 of the WPF curriculum proved with a real, measured `DispatcherTimer`), and only actually wait for the result at the exact point it's genuinely needed.

## Awaiting Multiple Tasks

```csharp
using System;
using System.Threading.Tasks;

class Program
{
    static async Task<int> ComputeAsync(int x)
    {
        await Task.Delay(20);
        return x * x;
    }

    static async Task<int> SumSquaresAsync(int a, int b)
    {
        int squareA = await ComputeAsync(a);
        int squareB = await ComputeAsync(b);
        return squareA + squareB;
    }

    static void Main()
    {
        int result = SumSquaresAsync(3, 4).GetAwaiter().GetResult();
        Console.WriteLine(result);
    }
}
```

```text
25
```

`int squareA = await ComputeAsync(a);` — inside an `async` method, `await` reads almost like ordinary, synchronous code: "run this, and give me the real result" — even though, underneath, `ComputeAsync` genuinely paused and resumed. This is the real value `async`/`await` adds over the raw `Task` machinery alone: code that *waits for* several async steps in sequence reads top-to-bottom, the same as any other method, instead of needing explicit callback-passing.

`SumSquaresAsync(3, 4)` — itself `async`, `await`s two separate calls to `ComputeAsync` in turn, then returns their sum once both are done: `3² + 4² = 9 + 16 = 25`.

## Challenge: async_max

Write a `static async System.Threading.Tasks.Task<int> MaxAsync(int a, int b)` method that awaits `System.Threading.Tasks.Task.Delay(10)` and then returns the larger of `a` and `b`. The fully-qualified name is required here the same way `System.IO.File` was in the previous lesson — nothing brings `System.Threading.Tasks` into scope automatically.

```challenge
static async System.Threading.Tasks.Task<int> MaxAsync(int a, int b)
{
    // TODO
}
```

```test
assert MaxAsync(3, 7).GetAwaiter().GetResult() == 7
assert MaxAsync(10, 2).GetAwaiter().GetResult() == 10
assert MaxAsync(5, 5).GetAwaiter().GetResult() == 5
assert MaxAsync(-1, -10).GetAwaiter().GetResult() == -1
```
