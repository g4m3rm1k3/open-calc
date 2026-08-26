# Lesson 19: Naming the Gap Lesson 18 Left Open

**What you will build.** `Browser_WebMessageReceived` (Lesson 18) becomes
a real `async void` method, properly `await`-ing `ExecuteScriptAsync`
instead of discarding its own `Task` — Lesson 18's own real, honest,
left-open gap, closed now rather than left as a hypothetical. A real
`try`/`catch` around that same method surfaces a genuine failure back into
the browser itself, through a new `showError` function, instead of
letting it vanish. `local.html` gains a real fix for a genuine, latent
bug that has existed since Lesson 7: reading `tools[0]` when `tools` is
empty. The transferable problem underneath the feature: this project has
used `Task`-returning methods since Lesson 14 without ever naming what
`async`/`await` actually *are* — real C# language keywords, not merely
something `ExecuteScriptAsync` happens to return. Naming them properly is
what finally lets this project fix, rather than merely acknowledge, the
one real gap Lesson 18 left open.

**What you need to know first.** Lesson 14 — `SqliteTransaction`, and this
project's own first real encounter with a `Task`-returning call
(`ExecuteScriptAsync`, Lesson 18), left un-awaited. Lesson 18 — the real,
verified fact that `CS4014` only fires for callees actually declared
`async`, and the real, silent JSON case-sensitivity bug this project
already fixed once.

**Terms used in this lesson**

- **`async`** — a real C# method modifier marking a method as containing
  `await` expressions (below), and signaling to the compiler to
  transform its body into a real state machine that can pause and
  resume. Per Microsoft's own official documentation (fetched this
  session), "when you apply the `async` modifier... the code suspends
  the calling method and yields control back to its caller until the
  task completes" — a real, different thing from simply returning a
  `Task` by hand, this project's own real, verified Lesson 18 finding
  about `CS4014` already proved.
- **`await`** — a real C# operator, usable only inside an `async` method,
  applied to a real `Task`/`Task<T>`. Per that same documentation, it
  "provides a nonblocking way to start a task, then continue execution
  when the task completes" — the calling method's own execution genuinely
  pauses at that point and resumes only once the awaited task finishes,
  proven directly, for real, this lesson's own first unit.
- **`async void`** — a real, narrow exception to `async` methods
  otherwise returning `Task`/`Task<T>`. Per that same official
  documentation, "event handlers must declare `void` return types" —
  `async void` is the *only* real, sanctioned use of this shape; every
  other `async void` method "can present challenges: exceptions thrown
  in an `async void` method can't be caught outside of that method" — a
  real, load-bearing fact this lesson's own second unit proves directly,
  not just quotes.
- **loading state** — real, deliberate UI feedback shown *while* an
  asynchronous operation is still in flight, rather than a blank or
  frozen-looking screen. This project's own real `#output` element
  already showed one, unnamed, since Lesson 5 ("Waiting for tool data
  from C#...") — this lesson is the first to name what that already was.
- **empty state** — real, deliberate UI feedback shown when an operation
  completes successfully but returns *no* real data, distinct from
  either still loading or having genuinely failed. This project has
  never actually shown one; a real, latent bug (this lesson's own third
  unit) meant it would have crashed instead.
- **error state** — real, deliberate UI feedback shown when an operation
  genuinely fails, telling a real user something went wrong rather than
  leaving them looking at stale or frozen data with no explanation.

**Objects and methods used**

- **`Task.Delay`**
  - *What it is:* a real, `static` method returning a `Task` that
    completes after a given real delay — used only in this lesson's own
    throwaway isolated labs, never in real project code.
  - *Implementation:* per real, standard .NET behavior (already
    implicitly relied on by this project's own established guidance,
    Lesson 18's own citation table, "continue after some amount of time
    → `await Task.Delay`, replacing `Thread.Sleep`"), it returns a real
    `Task` that completes once the given millisecond delay elapses,
    without blocking any real thread while waiting.
  - *Its use:* `await Task.Delay(200);`, this lesson's own first unit's
    isolated lab — standing in for any real, slow operation
    (`ExecuteScriptAsync`, a real network call, a real file read) whose
    exact duration doesn't matter, only that it genuinely takes real
    time.
  - *Type:* a real `static` method on `System.Threading.Tasks.Task`.
  - *Responsibility:* produce a real `Task` a caller can `await`, that
    completes on its own, on a real timer, needing no other real work to
    finish it.
  - *Depends on:* nothing beyond a real millisecond count.
  - *Connects to:* `await`ed directly inside this lesson's own throwaway
    `DoWorkAsync` method, standing in for `ExecuteScriptAsync`'s own real
    but variable-duration real work.
  - *Shape:* a real, minimal, deterministic stand-in for "some asynchronous
    work that takes real time," used here only to prove ordering, never
    to accomplish anything itself.
- **`Browser.CoreWebView2.ExecuteScriptAsync` (now properly awaited)**
  - *What it is:* reappearing from Lesson 18 — runs real JavaScript inside
    the WebView, returning a real `Task<string>`.
  - *Implementation:* established Lesson 18, unchanged — only how this
    lesson's own code *treats* its return value changes.
  - *Its use:* `await Browser.CoreWebView2.ExecuteScriptAsync(...)`, both
    real call sites this project has (`RefreshBrowserTableAsync`, and
    this lesson's own new error-reporting call) — no longer discarded, a
    direct, real fix for Lesson 18's own left-open gap.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`CoreWebView2WebMessageReceivedEventArgs`, `EditRequest`,
  `ToolRepository.UpdateTool`**
  - *What it is:* reappearing from Lesson 18 — the real event args this
    lesson's own handler still reads, the real class its own JSON still
    deserializes into, and the real method that still persists an edit.
  - *Implementation:* established Lesson 18, unchanged.
  - *Its use:* every real line of `Browser_WebMessageReceived`'s own body
    this lesson doesn't specifically change still does exactly what
    Lesson 18 already established — this lesson only changes the method's
    own real signature and adds a real `try`/`catch` around all of it.

---

## Concept Unit: `async`/`await` — Proving the Pause, Not Just Naming It

### The Problem

This project has called `ExecuteScriptAsync` — a real, `Task<string>`-
returning method — twice now (Lesson 18) without ever explaining what
`async`/`await` themselves actually do, only that Lesson 18's own real
code happened to discard the result of one call and properly needed to
`await` it eventually.

> **Try this first:** Lesson 18's own real, verified finding was that
> `CS4014` only fires for a callee genuinely declared `async`. Given
> `await`'s own real job (Header, above) is pausing the *calling* method
> until the awaited `Task` completes — what real, concrete difference in
> *output order* would you predict between calling a real, slow `async`
> method with `await` in front of it, versus calling the identical method
> with no `await` at all, if both the callee and the caller each print a
> real message before and after the slow part?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml.cs`, modified.
- **Change type** — replace (`RefreshBrowserTable` becomes `RefreshBrowserTableAsync`,
  returning `Task` and awaited by its own caller).
- **Location** — `Browser_WebMessageReceived` (established Lesson 18) and
  its own, renamed helper.
- **Dependencies** — none beyond this project's own existing real code.

### The New Code

```csharp
await RefreshBrowserTableAsync();
```

```csharp
private async Task RefreshBrowserTableAsync()
{
    // ...
    await Browser.CoreWebView2.ExecuteScriptAsync($"renderTools({json})");
}
```

### The Updated Project

`MainWindow.xaml.cs`'s own `Browser_WebMessageReceived` and
`RefreshBrowserTableAsync`, in full, changed lines marked:

```csharp
 1  private async void Browser_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)  // ← changed
 2  {
 3      var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
 4      var request = JsonSerializer.Deserialize<EditRequest>(e.WebMessageAsJson, options);
 5      if (request is null || request.Action != "edit")
 6      {
 7          return;
 8      }
 9
10      Tool? tool = FindToolById(request.Id);
11      if (tool is null)
12      {
13          return;
14      }
15
16      var dialog = new ToolEditDialog(tool);
17      dialog.Owner = this;
18      bool? result = dialog.ShowDialog();
19
20      if (result == true)
21      {
22          using var connection = new SqliteConnection("Data Source=tools.db");
23          connection.Open();
24
25          using (var transaction = connection.BeginTransaction())
26          {
27              ToolRepository.UpdateTool(
28                  connection,
29                  transaction,
30                  tool.Id,
31                  dialog.ViewModel.Name,
32                  dialog.ViewModel.OverallDiameter,
33                  dialog.ViewModel.OverallLength,
34                  dialog.ViewModel.FluteCount);
35              transaction.Commit();
36          }
37
38          await RefreshBrowserTableAsync();                                                                 // ← changed
39      }
40  }
41
42  private async Task RefreshBrowserTableAsync()                                                              // ← changed
43  {
44      using var connection = new SqliteConnection("Data Source=tools.db");
45      connection.Open();
46
47      using var selectCommand = new SqliteCommand(
48          "SELECT tools.id, tools.name, vendors.name, tools.overall_diameter, tools.overall_length, tools.flute_count FROM tools JOIN vendors ON tools.vendor_id = vendors.id",
49          connection);
50      using var reader = selectCommand.ExecuteReader();
51
52      List<Tool> tools = new List<Tool>();
53      while (reader.Read())
54      {
55          tools.Add(Tool.FromReader(reader));
56      }
57
58      string json = JsonSerializer.Serialize(tools);
59      await Browser.CoreWebView2.ExecuteScriptAsync($"renderTools({json})");                                 // ← changed
60  }
```

`RefreshBrowserTableAsync` (lines 42–60) is now itself a real `async
Task` method — its own real name carries the `Async` suffix, this
project's own first use of the real .NET convention Lesson 18's own
citation already named. `Browser_WebMessageReceived` (line 1) is now
`async void` — the one real, sanctioned shape for an event handler
(Header, above) — and `await`s `RefreshBrowserTableAsync()` (line 38)
directly, rather than calling a synchronous-looking method that silently
discarded a real `Task` inside.

### Proving It in Isolation

A minimal, unrelated throwaway pair of calls, isolating `await`'s own
real ordering guarantee, side by side with calling the identical method
without it:

```csharp
Console.WriteLine("--- WITH await ---");
await DoWorkAsync();
Console.WriteLine("Code after awaited call runs only now.");

Console.WriteLine("--- WITHOUT await ---");
DoWorkAsync();
Console.WriteLine("Code after un-awaited call runs immediately.");
await Task.Delay(300);

async Task DoWorkAsync()
{
    Console.WriteLine("DoWorkAsync: starting a 200ms delay...");
    await Task.Delay(200);
    Console.WriteLine("DoWorkAsync: delay finished.");
}
```

Run for real this session:

```
--- WITH await ---
DoWorkAsync: starting a 200ms delay...
DoWorkAsync: delay finished.
Code after awaited call runs only now.
--- WITHOUT await ---
DoWorkAsync: starting a 200ms delay...
Code after un-awaited call runs immediately.
DoWorkAsync: delay finished.
```

**Execution trace** (a control-flow/timing trace, per this schema's own
distinct shape for "when things run" rather than "what values change"):

1. `await DoWorkAsync();` — the calling code's own execution genuinely
   pauses right here; `DoWorkAsync`'s own first line runs
   (`"starting a 200ms delay..."`), then it hits its own `await
   Task.Delay(200)` and pauses too.
2. After a real 200ms, `DoWorkAsync`'s own body resumes and prints
   `"delay finished."` — only now does control return to the original
   caller.
3. `"Code after awaited call runs only now."` prints — proving `await`
   genuinely held the calling code back until the entire awaited method,
   including its own internal delay, had completely finished.
4. `DoWorkAsync();`, called a second time with no `await` at all — its
   own first line runs immediately (`"starting a 200ms delay..."`), then
   it hits its own internal `await Task.Delay(200)` and pauses — but
   because nothing here is `await`ing *this* call, control returns to the
   caller immediately, without waiting for that pause to end at all.
5. `"Code after un-awaited call runs immediately."` prints right away —
   proving the caller's own code kept running while `DoWorkAsync`'s own
   internal delay was still in progress, unlike step 3.
6. Only after the caller's own final `await Task.Delay(300)` (added
   purely so the process doesn't exit before the background work
   finishes) does `DoWorkAsync`'s own second, un-awaited call finally
   print `"delay finished."` — genuinely last, proving it really was
   still running in the background the whole time.

This is called **asynchronous execution** — real work that starts, yields
control back to its own caller, and finishes independently, rather than
blocking that caller until it's done.

### Discard the Throwaway Example

The `DoWorkAsync` example above is discarded now — it never appears in
this project again. What's proven is `await`'s own real, load-bearing
ordering guarantee, and the real, opposite consequence of omitting it —
not this specific 200-millisecond delay.

### Mechanical Walkthrough

- `private async void Browser_WebMessageReceived(...)` — the `async`
  modifier (Header, above), first appearing in this project on a real
  method declaration — required here because this method's own body now
  contains a real `await` expression; `void`, not `Task`, because this is
  a real event handler (Header, above), the one shape where that's the
  correct, sanctioned real choice.
- `await RefreshBrowserTableAsync();` — `await` (Header, above), applied
  to a real `Task` this project's own code now returns — the calling
  method's own execution genuinely pauses here until
  `RefreshBrowserTableAsync`'s own entire body, including its own
  internal `await`, finishes.
- `private async Task RefreshBrowserTableAsync()` — `async` again, this
  time on a method returning a real `Task` (not `void`) — the correct,
  general-purpose real shape per this project's own cited guidance, used
  whenever a method isn't itself a real event handler.
- `await Browser.CoreWebView2.ExecuteScriptAsync($"renderTools({json})");`
  — `ExecuteScriptAsync` (Header, above), reappearing, now genuinely
  `await`ed — the real fix this lesson's own first unit exists to make.

### CS Lens

Pausing one piece of code and resuming it later, exactly where it left
off, once some other real work finishes — without blocking the thread
that's waiting — is the same real idea as a **coroutine**: a function
that can suspend its own execution and be resumed later, as opposed to an
ordinary function that always runs start-to-finish uninterrupted once
called. Also recognized in: a recipe's own real instructions (Microsoft's
own cited breakfast example — start the toast, then tend to the eggs
while it toasts, rather than staring at the toaster), a customer-service
phone system placing a caller on hold and serving other callers rather
than one agent handling exactly one call start-to-finish, and generator
functions in other languages (Python's own `yield`, not yet taught in
this curriculum, but a real, structurally similar idea) that also pause
and resume rather than running straight through.

### SE Lens

Why does `RefreshBrowserTableAsync` need the real `Async` suffix in its
own name at all — couldn't it just be called `RefreshBrowserTable`,
exactly as Lesson 18 already had it? The alternative not chosen —
leaving the name unchanged — was rejected because this project's own
cited, official convention exists specifically so a reader can tell, from
a method's own name alone, whether calling it requires `await` — a real,
meaningful signal Lesson 18's own original name didn't carry, even though
the method's own real behavior (calling `ExecuteScriptAsync`) hadn't
changed at all yet at that point. The honest cost: this project's own
event handlers (`Browser_WebMessageReceived` itself) are real, deliberate
exceptions to this same convention — they're genuinely asynchronous
underneath, per this lesson's own first unit, but keep their own
established, event-handler-shaped names rather than gaining the suffix,
per that same official guidance's own real, stated exception for methods
"not explicitly called by your code."

### Run It

A real `dotnet build` was run this session against the actual, modified
file: build succeeded, 0 Warnings, 0 Errors — confirmed, specifically,
that no `CS4014` warning remains anywhere in this project's own real
code, since every real `Task`-returning call is now genuinely `await`ed.
The throwaway `DoWorkAsync` example was run for real this session with
`dotnet run`, real output shown and quoted above; its own real behavior
is proven a second time, permanently, by two new, real, passing tests in
`ToolDB.Tests/AsyncOrderingTests.cs`, saved alongside the throwaway
example's own source in this project's own `verification/lesson-19/`
folder (`lab1-await-vs-no-await.cs`).

### Connecting Back

Lesson 18's own real, left-open gap is closed — every real asynchronous
call in this project is now genuinely awaited, proven by a real, clean
build and two real, passing tests. The next unit uses this exact real
change to finally do something Lesson 18 couldn't: catch a real failure.

---

## Concept Unit: Error State — Catching What `async void` Can't Let Escape

### The Problem

Nothing in this project has ever caught a real failure inside
`Browser_WebMessageReceived` — if `FindToolById`, `ToolRepository
.UpdateTool`, or `ExecuteScriptAsync` itself ever threw a real exception,
nothing would show the user anything at all; the method would simply
stop, silently, mid-operation.

> **Try this first:** the Header's own `async void` entry states plainly,
> from real, official documentation, that "exceptions thrown in an
> `async void` method can't be caught outside of that method." Given
> `Browser_WebMessageReceived` is itself `async void` (this lesson's own
> first unit), and given a real `try`/`catch` wrapped *around a call to
> it* would therefore never catch anything it throws — where, concretely,
> would a real `try`/`catch` actually have to live for this specific
> method's own real failures to ever be caught at all?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml.cs`, modified.
  `ToolDB/local.html`, modified.
- **Change type** — add (a real `try`/`catch` wrapping the entire method
  body); add (one new JS function, `showError`).
- **Location** — `Browser_WebMessageReceived`'s own entire body
  (established this lesson's own first unit); `local.html`'s own
  `<script>` block.
- **Dependencies** — `ExecuteScriptAsync`, now properly `await`ed (this
  lesson's own first unit).

### The New Code

```csharp
catch (Exception ex)
{
    string errorJson = JsonSerializer.Serialize(ex.Message);
    await Browser.CoreWebView2.ExecuteScriptAsync($"showError({errorJson})");
}
```

```javascript
function showError(message) {
    $('#output').text(`Error: ${message}`);
}
```

### The Updated Project

`MainWindow.xaml.cs`'s own `Browser_WebMessageReceived`, in full, new
lines marked:

```csharp
 1  private async void Browser_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
 2  {
 3      try                                                                                                    // ← new
 4      {                                                                                                      // ← new
 5          var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
 6          var request = JsonSerializer.Deserialize<EditRequest>(e.WebMessageAsJson, options);
 7          if (request is null || request.Action != "edit")
 8          {
 9              return;
10          }
11
12          Tool? tool = FindToolById(request.Id);
13          if (tool is null)
14          {
15              return;
16          }
17
18          var dialog = new ToolEditDialog(tool);
19          dialog.Owner = this;
20          bool? result = dialog.ShowDialog();
21
22          if (result == true)
23          {
24              using var connection = new SqliteConnection("Data Source=tools.db");
25              connection.Open();
26
27              using (var transaction = connection.BeginTransaction())
28              {
29                  ToolRepository.UpdateTool(
30                      connection,
31                      transaction,
32                      tool.Id,
33                      dialog.ViewModel.Name,
34                      dialog.ViewModel.OverallDiameter,
35                      dialog.ViewModel.OverallLength,
36                      dialog.ViewModel.FluteCount);
37                  transaction.Commit();
38              }
39
40              await RefreshBrowserTableAsync();
41          }
42      }                                                                                                      // ← new
43      catch (Exception ex)                                                                                   // ← new
44      {                                                                                                       // ← new
45          string errorJson = JsonSerializer.Serialize(ex.Message);                                            // ← new
46          await Browser.CoreWebView2.ExecuteScriptAsync($"showError({errorJson})");                           // ← new
47      }                                                                                                       // ← new
48  }
```

`local.html`'s own `<script>` block, new function marked (the rest,
established Lesson 18, unchanged):

```html
1  function showError(message) {                        <!-- ← new -->
2      $('#output').text(`Error: ${message}`);           <!-- ← new -->
3  }                                                      <!-- ← new -->
```

The `try` (line 3) now wraps this entire method's own real body —
exactly the placement this unit's own Socratic question predicted, since
it's the *only* place inside `Browser_WebMessageReceived` itself, given
`async void`'s own real, documented limit.

### Proving It in Isolation

A minimal, unrelated throwaway pair, proving directly that a real
exception thrown inside an `async void` method genuinely cannot be
caught by a `try`/`catch` around the *call site*, before this project's
own real handler relies on catching it from *inside* instead:

```csharp
try
{
    DoSomethingRiskyAsyncVoid();
    Console.WriteLine("Returned normally — the exception did NOT surface here.");
}
catch (Exception ex)
{
    Console.WriteLine($"Caught here (should NOT happen): {ex.Message}");
}

async void DoSomethingRiskyAsyncVoid()
{
    await Task.Delay(50);
    throw new InvalidOperationException("Real exception thrown inside an async void method");
}
```

Run for real this session (with a real, top-level
`AppDomain.CurrentDomain.UnhandledException` handler added purely to
observe where the exception actually surfaces, since otherwise it would
simply crash the process):

```
Returned from DoSomethingRiskyAsyncVoid normally — the exception did NOT surface here.
Waiting briefly for the async void method's own real exception to actually throw...
UnhandledException caught at AppDomain level: Real exception thrown inside an async void method
```

This real, captured output proves the Header's own cited claim directly:
the `try`/`catch` around the *call* to `DoSomethingRiskyAsyncVoid()`
never ran its own `catch` block at all — the method returned normally
from the caller's own point of view, well before its own internal
`await` even finished — and the real exception, once it did throw,
surfaced as a genuine, process-level unhandled exception instead,
entirely bypassing the caller's own `try`/`catch`.

### Discard the Throwaway Example

The `DoSomethingRiskyAsyncVoid` example above is discarded now — it never
appears in this project again. What's proven is exactly where a real
`try`/`catch` has to live to catch an `async void` method's own failures
— inside it, never around a call to it — not this specific exception
message.

### Mechanical Walkthrough

- `try { ... }` — a real `try` block (established this project's own
  earlier lessons' exception handling, Lesson 3 onward), now wrapping
  this entire method's own body — the only real placement, per this
  unit's own isolated proof, that can ever catch a failure this specific
  `async void` method produces.
- `catch (Exception ex)` — a real, broad `catch` clause, first appearing
  in this project catching the general `Exception` base type rather than
  a specific one (`SqliteException`, Lesson 3) — deliberate here, since
  this one real block needs to catch *any* real failure from several
  genuinely different real sources (JSON parsing, database access, the
  dialog itself, `ExecuteScriptAsync`), not just one.
- `JsonSerializer.Serialize(ex.Message)` — `JsonSerializer.Serialize`
  (established Lesson 7), reappearing — called here on a plain `string`
  (`ex.Message`) specifically so any real, unpredictable character an
  exception message might contain (a quote, a backslash) is safely
  escaped before being embedded into a literal JavaScript call, the
  identical real defense-in-depth reasoning Lesson 7 already established
  for tool data generally.
- `await Browser.CoreWebView2.ExecuteScriptAsync($"showError({errorJson})");`
  — the identical real pattern this lesson's own first unit already
  fixed, applied to a second, new real JS function call.
- `function showError(message) { $('#output').text(...); }` — a real,
  new JavaScript function, the same real shape `renderTools` (Lesson 18)
  already established — `$('#output').text(...)` reuses the identical
  real jQuery call (Lesson 10) already used for this project's own
  summary line, now repurposed to show a real error instead.

### CS Lens

Placing a `try`/`catch` at the one real boundary where a method's own
internal failures can actually be observed — rather than at whatever
location looks, syntactically, like it "wraps" the risky call — is a
specific instance of **exception boundary placement**: correctness here
depends on real, structural knowledge of *where* an exception can
propagate to, not just visual proximity to the code that might throw.
Also recognized in: this project's own real `RefreshBrowserTableAsync`
(this lesson's own first unit) — a real exception thrown inside it now
*does* propagate normally to its own `await`ing caller, the ordinary,
expected real behavior `async void`'s own narrow exception deliberately
breaks — and a building's own real fire-suppression system triggering
at the point smoke is actually detected, not wherever a fire door happens
to be installed.

### SE Lens

Why catch the broad `Exception` type here, rather than several specific
`catch` clauses — one for `SqliteException` (Lesson 3), one for JSON
errors, one for anything `ExecuteScriptAsync` itself might throw? The
alternative not chosen — several specific `catch` clauses — was rejected
because this one real method's own job, from this unit's own real
Socratic question, is simply "show the user *something* went wrong,"
regardless of which real subsystem actually failed; several separate
`catch` blocks would each need nearly identical real bodies (serialize a
message, call `showError`), a real, meaningless duplication for the
actual value this method provides. The honest cost: catching broad
`Exception` also catches real, unexpected bugs this project never
anticipated, potentially masking a real programming mistake behind a
generic "Error: ..." message rather than a specific, actionable one — a
real tradeoff this project accepts here, for a user-facing dialog, that a
future lesson focused specifically on error diagnostics might reasonably
revisit.

### Run It

A real `dotnet build` was run this session against the actual, modified
files: build succeeded, 0 Warnings, 0 Errors. The throwaway
`DoSomethingRiskyAsyncVoid` example above was run for real this session
with `dotnet run`, real output shown and quoted above; source and output
are saved in this project's own `verification/lesson-19/` folder
(`lab2-async-void-exception-escapes.cs`). This project's own standing
constraint (no live WPF window observed this session) still applies to
watching a real error message actually appear in `#output` inside a
running browser.

### Connecting Back

A real failure anywhere inside this project's own edit-and-save flow now
reaches the user, through the one real path `async void`'s own
documented limit actually allows, instead of vanishing silently. The
final unit fixes a second, real, and entirely different kind of gap —
one this project has been carrying since its very first table row.

---

## Concept Unit: Empty State — What Zero Tools Actually Does

### The Problem

`local.html`'s own `message` handler has read `tools[0].Name` since
Lesson 7 — every real session this project has ever run has had at least
one real row in `tools.db` (Lesson 2 onward), so this line has never
actually been tested against zero real tools.

> **Try this first:** given `tools[0]` on a real, empty JavaScript array
> is `undefined` — a real, ordinary JavaScript value, not an error on its
> own — what would you predict happens, specifically, the moment code then
> tries to read `.Name` *off of* that real `undefined` value?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/local.html`, modified.
- **Change type** — replace (the `message` handler's own summary-line
  logic gains a real conditional).
- **Location** — `local.html`'s own `message` handler, established
  Lesson 7, already modified by Lessons 10, 11, 18.
- **Dependencies** — `renderTools` (Lesson 11/18), unchanged by this
  unit.

### The New Code

```javascript
if (tools.length > 0) {
    $('#output').text(
        `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})`
    );
} else {
    $('#output').text('No tools yet.');
}
```

### The Updated Project

`local.html`'s own `<script>` block, in full, changed lines marked:

```html
 1  <script>
 2      let tools = [];
 3
 4      function renderTools(newTools) {
 5          tools = newTools;
 6
 7          const rows = [];
 8          for (const tool of tools) {
 9              rows.push(`<tr><td>${tool.Name}</td><td>${tool.Manufacturer}</td><td>${tool.OverallDiameter}</td><td>${tool.OverallLength}</td><td>${tool.FluteCount}</td><td><button class="edit-tool" data-id="${tool.Id}">Edit</button></td></tr>`);
10          }
11          $('#tools-table tbody').html(rows.join(''));
12
13          $('#tools-table').DataTable({ destroy: true });
14      }
15
16      function showError(message) {
17          $('#output').text(`Error: ${message}`);
18      }
19
20      window.chrome.webview.addEventListener('message', event => {
21          renderTools(event.data);
22          if (tools.length > 0) {                                                                          // ← changed
23              $('#output').text(                                                                            // ← changed
24                  `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})`  // ← changed
25              );                                                                                            // ← changed
26          } else {                                                                                          // ← changed
27              $('#output').text('No tools yet.');                                                           // ← changed
28          }                                                                                                 // ← changed
29      });
30
31      $('#show-count').on('click', () => {
32          $('#output').text(`${tools.length} tool(s) loaded.`);
33      });
34
35      $('#tools-table tbody').on('click', 'button.edit-tool', function () {
36          const id = $(this).data('id');
37          window.chrome.webview.postMessage({ action: 'edit', id: id });
38      });
39  </script>
```

### Proving It in Isolation

A minimal, unrelated throwaway pair of functions, isolating the real bug
before, and the real fix after, against a genuinely empty array:

```javascript
function oldSummary(tools) {
    return `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})`;
}

function newSummary(tools) {
    if (tools.length > 0) {
        return `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})`;
    } else {
        return 'No tools yet.';
    }
}

try {
    console.log(oldSummary([]));
} catch (e) {
    console.log(`${e.name}: ${e.message}`);
}

console.log(newSummary([]));
```

Run for real this session:

```
TypeError: Cannot read properties of undefined (reading 'Name')
No tools yet.
```

This real, captured output proves the Socratic question's own prediction
exactly: `tools[0]` on a real, empty array genuinely is `undefined`, and
JavaScript itself throws a real `TypeError` the instant `.Name` is read
off of it — not a quiet `undefined` value propagating harmlessly, the way
it sometimes does elsewhere in JavaScript. The real, fixed version avoids
ever reading `tools[0]` at all when `tools.length` is `0`.

### Discard the Throwaway Example

The `oldSummary`/`newSummary` pair above is discarded now — it never
appears in this project again. What's proven is the real, exact
`TypeError` this bug would produce, and that a plain `tools.length > 0`
check avoids it entirely — not this specific throwaway pair of function
names.

### Mechanical Walkthrough

- `if (tools.length > 0) { ... } else { ... }` — a real, ordinary
  JavaScript `if`/`else` (established this project's own earliest
  JavaScript lessons) — first real conditional guarding this specific
  summary line since it was written, Lesson 7.
- `` $('#output').text('No tools yet.'); `` — `$()`/`.text()` (established
  Lesson 10), reappearing — a real, plain string this time, this
  project's own first genuine **empty state** (Terms, above) message.

### CS Lens

Checking a real collection's own size before assuming it has a first
element is a specific instance of a **boundary condition** — the exact
edge case (zero elements) that a piece of logic written only with the
*typical* case in mind (at least one element) silently fails to handle.
Also recognized in: this project's own real `if (reader.Read())` guard in
`FindToolById` (Lesson 18) — the identical real shape, in C#, already
protecting against a query returning zero rows — a real, off-by-one class
of bug in general (an empty list, a string's own last character, a loop
run zero times), and a physical vending machine correctly handling "this
slot is empty" as a distinct real case from "here is your item."

### SE Lens

Why did this exact real bug survive since Lesson 7 without ever actually
failing? The honest answer, stated directly rather than glossed over:
because `tools.db` has held at least one real row since Lesson 2, this
exact code path — `tools.length === 0` — was never once exercised for
real, in any earlier lesson's own verification, despite being reachable
real code the whole time. The alternative not chosen here — leaving it
unfixed, since it "hasn't caused a problem yet" — was rejected because
"hasn't failed yet" and "can't fail" are genuinely different real claims;
this project's own real roadmap already plans a future real `Delete`
action reaching the browser (Lesson 14's own `ToolRepository.Delete`, not
yet wired to WebView2), which would make an empty `tools.db` a real,
reachable state for the first time. The honest cost of fixing it now,
before it's strictly forced: this exact real bug had to be found by
deliberately reasoning about a case this project's own real data has
simply never hit, not by an actual, observed failure.

### Run It

The throwaway example above was run for real this session with `node`,
real output shown and quoted above; source is saved in this project's
own `verification/lesson-19/` folder (`lab3-empty-state.js`). This
project's own standing constraint (no live WPF window observed this
session) still applies to watching this real message actually render in
a running browser against a genuinely empty `tools.db`.

### Connecting Back

A real, latent bug that has existed, unnoticed, since this project's very
first message handler is fixed — not because it ever crashed, but because
this lesson's own real scope (naming loading/empty/error states
explicitly) made checking for it the honest, deliberate thing to do.

---

## Connect the Pieces

One concrete trace, start to finish, through everything this lesson built:

1. `RefreshBrowserTable` became `RefreshBrowserTableAsync`, a real
   `async Task` method, properly `await`ed by `Browser_WebMessageReceived`
   — itself made `async void`, the one real, sanctioned shape for an
   event handler — closing the exact real gap Lesson 18 named and left
   open; a real, side-by-side throwaway comparison proved `await`'s own
   ordering guarantee directly, down to the exact real order of six
   printed lines (Unit 1).
2. A real `try`/`catch`, wrapped around `Browser_WebMessageReceived`'s
   own entire body — the only real placement that can ever catch its own
   failures, proven directly by a real, isolated example showing an
   identical exception escape a `try`/`catch` placed around the call site
   instead — now surfaces any real failure to the user through a new
   `showError` JavaScript function, rather than letting it vanish (Unit
   2).
3. A real, latent bug in `local.html`'s own `message` handler — reading
   `tools[0].Name` on a genuinely empty array, proven for real to throw a
   real `TypeError` — was fixed with a plain `tools.length > 0` check,
   giving this project its first real, deliberate empty-state message
   (Unit 3).

**Slice 3 is complete.** **Next lesson:** 20 — Indexes & Query Planning
(`EXPLAIN QUERY PLAN`) — the start of Slice 4.
