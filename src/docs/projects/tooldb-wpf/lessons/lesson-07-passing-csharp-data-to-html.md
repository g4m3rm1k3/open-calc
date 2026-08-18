# Lesson 7: A Shared Language Across the Boundary
### (Passing C# Data to HTML)

**What you will build.** `ToolDB`'s browser pane stops showing `local.html`'s own
static placeholder text and starts showing this project's own real data — the
same `tools.db` row Lessons 1–6 already proved correct, now visible inside the
`WebView2` pane, right alongside the window's own title bar, which has
reported the same numbers since Lesson 5. The transferable problem underneath
the feature: `CoreWebView2` (Lesson 6) is a genuinely separate operating-system
process, running genuinely different code — JavaScript, not C# — with its own
private memory. A `List<Tool>` living on this project's own C# heap is not
something JavaScript on the other side of that process boundary can simply
reach into and read; there is no shared memory to reach into at all. Getting
real data across a boundary like that, between two different languages that
share nothing, requires three separate things: converting the data into a
plain-text format both sides can independently understand without agreeing on
anything custom, sending it through a real, documented channel, and getting
the *timing* right — send it too early, before the receiving side even exists
or is listening yet, and the data is simply lost, silently, with no error
raised on either side.

**What you need to know first.** Lesson 6 — `WebView2`, `CoreWebView2`,
`CoreWebView2InitializationCompleted`, `NavigationCompleted`, and the proven
fact that `Browser.CoreWebView2` stays `null` until initialization actually
succeeds. Lesson 4 — `Tool`, `Tool.FromReader(SqliteDataReader)`, `class`,
`object`, `property`. Lesson 1 — `SqliteConnection`, connection strings, the
`using` declaration.

**Pipeline, so far.** Lesson 6 built two separate pipelines side by side —
one carrying `tools.db`'s real data into `Window.Title`, the other loading
`local.html`'s own static text into the browser pane — and deliberately left
them unconnected. This lesson connects them for the first time, adding three
new stages in between:

```text
tools.db (SQLite, on disk)
   │  SqliteConnection / SqliteCommand / SqliteDataReader        (Lessons 1–4)
   ▼
List<Tool>                                                       (this lesson — Concept Unit 1)
   │
   ├──▶ Window.Title (native, text only)                         (Lesson 5–6, unchanged)
   │
   ▼
JSON string — JsonSerializer.Serialize(tools)                    (this lesson — Concept Unit 2)
   │
   ▼
Browser.CoreWebView2.PostWebMessageAsJson(json)                  (this lesson — Concept Unit 3)
   │  crosses the real process boundary Lesson 6 established
   ▼
CoreWebView2 (the real Edge/Chromium browser process)             (Lesson 6)
   │  fires a real 'message' event on window.chrome.webview
   ▼
local.html's own <script> — window.chrome.webview
   .addEventListener('message', ...)                              (this lesson — Concept Unit 4)
   ▼
Rendered HTML, inside the same native window — now showing
tools.db's own real data, not local.html's old placeholder text
```

Carried through with the same concrete row Lessons 1–6 already traced: `(1,
"1/2 in 4-Flute Carbide End Mill", "O'Brien Carbide Tools", 0.5, 3.0, 4)`
becomes a `Tool` object (Lesson 4), then, this lesson, the real JSON text
this session captured directly from this project's own data (Concept Unit
2, below):

```
[{"Id":1,"Name":"1/2 in 4-Flute Carbide End Mill","Manufacturer":"O'Brien Carbide Tools","OverallDiameter":0.5,"OverallLength":3,"FluteCount":4}]
```

(shown here with its literal apostrophe for readability — the real captured
terminal text instead escapes that one character as a Unicode escape
sequence naming code point U+0027, for reasons Concept Unit 2 explains) —
crosses into the browser pane and, once JavaScript parses it back into a
real apostrophe again, finally becomes real, readable visible text on
screen.

**Terms used in this lesson**

- **JSON (JavaScript Object Notation)** — a plain-text format for
  representing structured data (objects, arrays, strings, numbers, booleans,
  `null`) using a small, fixed grammar. It exists because two independently
  running programs — here, a C# process and the real Chromium/JavaScript
  process behind `CoreWebView2` — share no memory and cannot pass a live
  object reference between them; JSON gives both sides a text format neither
  one has to invent, since a JSON parser already ships inside both the .NET
  runtime and every JavaScript engine, including the one behind `WebView2`.
- **serialization** — the general act of converting an in-memory object —
  here, a `List<Tool>`, real objects living on this process's own .NET heap —
  into a flat, storable or transmittable representation; **deserialization**
  is the reverse. It exists because "the data" and "the specific in-memory
  representation one runtime happens to use for it" are two different
  things — anything crossing a process, network, or disk boundary has to
  travel as the former, never the latter.
- **process boundary** — reappearing from Lesson 6's own **browser process**
  Term: the real, hard line between two separate operating-system processes —
  here, `ToolDB.exe` and the Chromium process behind `CoreWebView2` — each
  with its own private memory the other cannot directly read or write. It
  exists because operating systems deliberately isolate one process's memory
  from another's, both for stability (one process crashing doesn't corrupt
  another's data) and security (one process can't casually read another's
  private state) — which is exactly why a `List<Tool>` object itself can
  never cross this lesson's own pipeline; only a text copy of it can.
- **field** — a variable declared directly inside a class, belonging to each
  object built from that class, distinct from a local variable (which exists
  only for the duration of one method call) and from a property (which wraps
  access to a field, or to computed data, behind `get`/`set` accessor
  methods). It exists because some state needs to outlive any single method
  call — this lesson's own new field, `_toolsJson`, is set inside
  `MainWindow_Loaded` and has to still be readable later, inside a
  *different* method call (`Browser_NavigationCompleted`), run at a
  genuinely later, separate time.
- **backing field** — the private field the C# compiler automatically
  creates and hides behind every auto-implemented property (`public string
  Name { get; set; }`, first used in `Tool.cs`, Lesson 4) — confirmed by
  genuine Microsoft documentation, not assumed (Concept Unit 2, below). It
  exists so a property author gets real storage for free, without writing a
  private field and two accessor methods by hand for the ordinary
  "just store and return a value" case; `Tool`'s five auto-implemented
  properties each quietly have one of these already. `_toolsJson`, this
  lesson's own field, is the identical underlying mechanism written out by
  hand, with no property wrapped around it, because nothing outside
  `MainWindow` ever needs to read or write it.
- **DOM (Document Object Model)** — the live, in-memory tree of objects a
  browser engine builds from an HTML document once it has loaded —
  every `<p>`, every `<script>`, every piece of text, each a real,
  queryable, modifiable object while the page stays open. It exists because
  a browser has to do far more with a page than display it once — JavaScript
  needs a structured way to find, read, and change any part of the page
  after it loads — and the DOM is that structure, standardized across every
  browser engine, including the real Chromium engine behind `CoreWebView2`
  (Lesson 6), so the same JavaScript works no matter which browser runs it.
- **event listener (JavaScript)** — a function registered, by name, to run
  later, whenever a specific named event occurs on a specific object —
  JavaScript's own version of the exact mechanism this project already knows
  from C#'s `+=` (Lesson 5's `Loaded += MainWindow_Loaded`, Lesson 6's
  `CoreWebView2InitializationCompleted += ...`). It exists for the identical
  reason C#'s events do: some code has to react to something that hasn't
  happened yet, at a moment the reacting code doesn't control, without
  blocking and waiting for it.
- **arrow function** — a compact JavaScript function-literal syntax (`param
  => expression`), used in this lesson as the actual listener function
  passed to `addEventListener`. It exists as a shorter alternative to
  JavaScript's older `function (param) { return expression; }` syntax for
  exactly this common case: a small, throwaway function passed directly as
  an argument, never intended to be called by name from anywhere else.
- **template literal** — a JavaScript string literal delimited by backticks
  (`` ` ``) instead of quotes, letting `${expression}` embed a real computed
  value directly inside the string's own text. It exists as JavaScript's own
  answer to the same problem C#'s string interpolation (`$"..."`, used since
  Lesson 1) already solves — building a string out of fixed text and
  computed values without hand-concatenating pieces with `+`.

**Objects and methods used**

- **`System.Collections.Generic.List<T>`**
  - *What it is:* this lesson's own Concept Unit 1 subject — a generic,
    growable collection, holding zero or more `Tool` objects, replacing the
    single nullable `Tool?` variable this project used through Lesson 6.
  - *Implementation:* `public class List<T> : ICollection<T>, IEnumerable<T>,
    IList<T>, IReadOnlyCollection<T>, IReadOnlyList<T>, ICollection,
    IEnumerable, IList` (Microsoft's own reference, fetched this session),
    namespace `System.Collections.Generic`, assembly
    `System.Collections.dll`. Its own description states plainly: "represents
    a strongly typed list of objects that can be accessed by index... It is
    the generic equivalent of the non-generic `ArrayList` class... implements
    the `IList<T>` generic interface by using an array whose size is
    dynamically increased as required."
  - *Its use:* declared as `List<Tool> tools = new List<Tool>();` inside
    `MainWindow_Loaded`, replacing the `toolCount`/`firstTool` variables
    Lesson 5–6 used (Concept Unit 1).
- **`List<T>.Add(T item)`**
  - *What it is:* the method that appends one more element to the end of a
    `List<T>`.
  - *Implementation:* `public void Add(T item);` (Microsoft's own reference,
    fetched this session) — "Adds an object to the end of the `List<T>`."
    Parameter `item`: "The object to be added to the end of the `List<T>`.
    The value can be `null` for reference types." Its own Remarks state: "If
    `Count` is less than `Capacity`, this method is an O(1) operation. If the
    capacity needs to be increased to accommodate the new element, this
    method becomes an O(*n*) operation, where *n* is `Count`."
  - *Its use:* called once per row, inside the existing `while
    (reader.Read())` loop, replacing the old `toolCount++`/`firstTool = tool`
    pair (Concept Unit 1).
- **`List<T>.Count` and the `List<T>` indexer**
  - *What it is:* `Count`, the real number of elements currently in the
    list; the indexer (`list[i]`), read access to one specific element by
    zero-based position.
  - *Implementation:* both are real, declared members of `List<T>`
    demonstrated directly in the same Microsoft reference page just cited —
    its own worked example reads `dinosaurs[3]` and calls it "accessing the
    list using the Item property," and separately prints `dinosaurs.Count`
    after a sequence of real `Add` calls.
  - *Its use:* `tools.Count > 0` replaces the old `firstTool != null` check;
    `tools[0]` replaces the old `firstTool` variable itself (Concept Unit 1).
- **`System.Text.Json.JsonSerializer.Serialize<TValue>(TValue value,
  JsonSerializerOptions? options = null)`**
  - *What it is:* this lesson's own Concept Unit 2 subject — the real .NET
    method that converts an object graph into a JSON-formatted string.
  - *Implementation:* `public static string Serialize<TValue>(TValue value,
    System.Text.Json.JsonSerializerOptions? options = default);`
    (Microsoft's own reference, fetched this session), namespace
    `System.Text.Json`, assembly `System.Text.Json.dll`. Its own description:
    "Converts the value of a type specified by a generic type parameter into
    a JSON string." Returns "A JSON string representation of the value." It
    throws `NotSupportedException` when "there is no compatible
    `JsonConverter` for `TValue` or its serializable members."
  - *Its use:* `_toolsJson = JsonSerializer.Serialize(tools);`, called once,
    immediately after the read loop finishes (Concept Unit 2).
- **`Microsoft.Web.WebView2.Wpf.WebView2.CoreWebView2`**
  - *What it is:* reappearing from Lesson 6's own Term of the same name —
    read for the first time this lesson as a real, live property, rather
    than only discussed conceptually.
  - *Implementation:* `[System.ComponentModel.Browsable(false)] public
    Microsoft.Web.WebView2.Core.CoreWebView2 CoreWebView2 { get; }`
    (Microsoft's own reference, fetched this session) — get-only, no
    setter. Its own description: "Accesses the complete functionality of the
    underlying `CoreWebView2` COM API. Returns `null` until initialization
    has completed." It can throw `InvalidOperationException` ("Thrown if the
    calling thread isn't the thread which created this object (usually the
    UI thread)... May also be thrown if the browser process has crashed
    unexpectedly") or `ObjectDisposedException`.
  - *Its use:* read as `Browser.CoreWebView2` inside
    `Browser_NavigationCompleted` — safe specifically because, by the time
    `NavigationCompleted` has fired at all, `CoreWebView2InitializationCompleted`
    (Lesson 6) has already fired successfully first; Lesson 6's own Concept
    Unit 3 already traced this exact ordering in full (Concept Unit 3).
- **`Microsoft.Web.WebView2.Core.CoreWebView2.PostWebMessageAsJson(string
  webMessageAsJson)`**
  - *What it is:* this lesson's own Concept Unit 3 subject — the real method
    that sends a JSON-formatted string across the process boundary, into the
    live page `CoreWebView2` is currently showing.
  - *Implementation:* `public void PostWebMessageAsJson(string
    webMessageAsJson);` (Microsoft's own reference, fetched this session),
    namespace `Microsoft.Web.WebView2.Core`. Its own Remarks state plainly:
    "The event arg's `data` property of the event arg is the
    `webMessageAsJson` string parameter parsed as a JSON string into a
    JavaScript object... The message is sent asynchronously. If a navigation
    occurs before the message is posted to the page, the message is not be
    sent." Its own Examples section shows the exact JavaScript-side
    counterpart: `window.chrome.webview.addEventListener('message',
    handler)`.
  - *Its use:* `Browser.CoreWebView2.PostWebMessageAsJson(_toolsJson);`,
    called inside `Browser_NavigationCompleted`'s success branch —
    deliberately not inside `MainWindow_Loaded` (Concept Unit 3).
- **`window.chrome.webview`**
  - *What it is:* this lesson's own Concept Unit 4 subject — a real
    JavaScript object, injected automatically by WebView2 into every page it
    hosts, existing only because this specific page is running inside a
    `WebView2` control (Lesson 6) rather than an ordinary browser tab.
  - *Implementation:* documented and demonstrated directly in Microsoft's
    own "Interop of native and web code" guide (fetched this session), whose
    own real sample code reads `window.chrome.webview.addEventListener(
    'message', arg => { ... })` — the same real object
    `PostWebMessageAsJson`'s own Remarks (above) name as the `source` of
    every message it posts.
  - *Its use:* `window.chrome.webview.addEventListener('message', ...)`,
    registered inside `local.html`'s own `<script>` block (Concept Unit 4).
- **`EventTarget.addEventListener(type, listener)`**
  - *What it is:* the real, standard JavaScript/DOM method that registers a
    function to run later, whenever a named event occurs on the object it's
    called on.
  - *Implementation:* part of the `EventTarget` interface, documented at MDN
    (fetched this session): "sets up a function that will be called whenever
    a specified event is delivered to the target... It's the recommended way
    to register event listeners because it allows multiple handlers per
    event." Signature: `target.addEventListener(type, listener)` — `type`,
    "a case-sensitive string representing the event type to listen for";
    `listener`, "a JavaScript function... called when the event occurs."
  - *Its use:* `window.chrome.webview.addEventListener('message', event =>
    { ... })` — `'message'` naming the specific event `PostWebMessageAsJson`
    fires (per its own Examples section, above), the arrow function (Terms,
    above) as the listener (Concept Unit 4).
- **`document.getElementById(id)`**
  - *What it is:* the real DOM method that looks up one specific element in
    the page's own DOM tree by its `id` attribute.
  - *Implementation:* part of the `Document` interface, documented at MDN
    (fetched this session): "returns an Element object matching a specified
    ID string. Since element IDs must be unique within a document, it
    provides quick access to specific elements." Returns "an Element object
    if found, or `null` if no matching element exists."
  - *Its use:* `document.getElementById('output')`, locating `local.html`'s
    own `<p id="output">` element from inside the `message` listener
    (Concept Unit 4).
- **`Node.textContent`**
  - *What it is:* the real DOM property that both reads and replaces an
    element's own text.
  - *Implementation:* part of the `Node` interface, documented at MDN
    (fetched this session): "represents the text content of the node and its
    descendants. When set, it removes all child nodes and replaces them with
    a single text node containing the given string value."
  - *Its use:* `document.getElementById('output').textContent = ...`,
    replacing the placeholder text `local.html` shows before any message has
    arrived (Concept Unit 4).

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteConnection`, `SqliteCommand`, `SqliteDataReader`, `.Open()`,
  `.ExecuteReader()`, `.Read()`**
  - *What it is:* reappearing from Lessons 1–6 — the exact same
    connection/query/cursor sequence this project has used every lesson
    since Lesson 1.
  - *Implementation:* established in Lessons 1–2, unchanged.
  - *Its use:* still opens `tools.db` and runs the same `SELECT` this
    project has run since Lesson 4; only what happens to each row afterward
    changes this lesson.
- **`Tool` / `Tool.FromReader(SqliteDataReader)`**
  - *What it is:* reappearing from Lesson 4 — this project's own
    user-defined type and its row-mapping factory method.
  - *Implementation:* established in Lesson 4's `Tool.cs`, unchanged — five
    auto-implemented properties (`Id`, `Name`, `Manufacturer`,
    `OverallDiameter`, `OverallLength`, `FluteCount`) plus the `static`
    factory method.
  - *Its use:* called once per row, its result now added to a `List<Tool>`
    instead of overwriting a single `Tool?` variable (Concept Unit 1).
- **`Window.Title`**
  - *What it is:* reappearing from Lessons 5–6 — the property naming a
    window's own title-bar text.
  - *Implementation:* established in Lesson 5, unchanged.
  - *Its use:* still assigned inside `MainWindow_Loaded`, its own string
    interpolation now reading from `tools.Count`/`tools[0]` instead of
    `toolCount`/`firstTool` (Concept Unit 1).
- **`WebView2.CoreWebView2InitializationCompleted`,
  `WebView2.NavigationCompleted`, `CoreWebView2InitializationCompletedEventArgs`,
  `CoreWebView2NavigationCompletedEventArgs`**
  - *What it is:* reappearing from Lesson 6 — the two real, documented
    signals this project already uses to know, for certain, whether the
    browser started and whether the page finished loading.
  - *Implementation:* established in Lesson 6's own Header, unchanged.
  - *Its use:* `Browser_NavigationCompleted`'s own success branch is where
    this lesson's new `PostWebMessageAsJson` call goes — the same handler
    Lesson 6 already wrote, now doing one more real thing once navigation
    genuinely succeeds (Concept Unit 3).
- **`AppContext.BaseDirectory`, `Path.Combine(string, string)`, `new
  Uri(string)`**
  - *What it is:* reappearing from Lesson 6 — the real path-building
    sequence that turns `local.html`'s source-folder location into the real,
    absolute build-output path `WebView2.Source` needs.
  - *Implementation:* established in Lesson 6, unchanged.
  - *Its use:* still the last three lines of `MainWindow_Loaded`, untouched
    by this lesson's own changes, which all land earlier in the same method.
- **`Console.WriteLine(string?)`**
  - *What it is:* reappearing from Lesson 0.
  - *Implementation:* established in Lesson 0, unchanged.
  - *Its use:* still prints the real success/failure outcome of
    initialization and navigation; unchanged by this lesson.

---

## Concept Unit: Keeping Every Row — `List<Tool>`

### The Problem

`MainWindow_Loaded` has read every row of `tools.db` since Lesson 4 — but
Lesson 5 and 6 both threw almost all of that data away the instant it was
read, keeping only a running `toolCount` and a single `Tool? firstTool`
holding whichever row happened to be read first. That was enough to build a
one-line title-bar summary, but it cannot be what crosses into the browser
pane: showing real data in `local.html` means showing every row `tools.db`
actually has, not just the first one. This project needs a way to hold onto
an unknown number of rows — unknown until the read loop actually finishes —
without knowing that count in advance.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml.cs`, modified.
- **Change type** — replace (the `toolCount`/`firstTool` tracking inside
  `MainWindow_Loaded`'s read loop, and the `if (firstTool != null)` check
  right after it).
- **Location** — inside `MainWindow_Loaded`, the same method Lesson 5
  introduced and Lesson 6 already extended; nothing outside this one method
  changes in this unit.
- **Dependencies** — none beyond `Tool` (Lesson 4). `List<Tool>` needs no new
  `using` directive: `ToolDB.csproj`'s own `<ImplicitUsings>enable</ImplicitUsings>`
  (set since Lesson 0) already generates a real `global using
  System.Collections.Generic;` line — confirmed this session by reading the
  actual compiler-generated file, `obj/Debug/net10.0-windows/ToolDB.GlobalUsings.g.cs`,
  directly, rather than assuming it:

  ```csharp
  // <auto-generated/>
  global using System;
  global using System.Collections.Generic;
  global using System.Linq;
  global using System.Threading;
  global using System.Threading.Tasks;
  ```

### The New Code

The declaration and the loop body, replacing the old `toolCount`/`firstTool`
pair:

```csharp
List<Tool> tools = new List<Tool>();
while (reader.Read())
{
    tools.Add(Tool.FromReader(reader));
}
```

And the check right after it, reading the list instead of a nullable
variable:

```csharp
if (tools.Count > 0)
{
    Title = $"ToolDB — Loaded {tools.Count} tool(s). First: {tools[0].Name} ({tools[0].Manufacturer})";
}
```

### The Updated Project

`MainWindow_Loaded`, in full, changed lines marked (the last two lines —
building `htmlPath` and assigning `Browser.Source` — are Lesson 6's own
unchanged code, still the last thing this method does):

```csharp
private void MainWindow_Loaded(object sender, RoutedEventArgs e)
{
    using var connection = new SqliteConnection("Data Source=tools.db");
    connection.Open();

    using var selectCommand = new SqliteCommand(
        "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tools",
        connection);
    using var reader = selectCommand.ExecuteReader();

    List<Tool> tools = new List<Tool>();                                                   // ← new
    while (reader.Read())                                                                  // ← changed
    {
        tools.Add(Tool.FromReader(reader));                                                 // ← changed
    }

    if (tools.Count > 0)                                                                    // ← changed
    {
        Title = $"ToolDB — Loaded {tools.Count} tool(s). First: {tools[0].Name} ({tools[0].Manufacturer})";  // ← changed
    }
    else
    {
        Title = "ToolDB — Loaded 0 tools.";
    }

    string htmlPath = Path.Combine(AppContext.BaseDirectory, "local.html");
    Browser.Source = new Uri(htmlPath);
}
```

The method still does exactly what it did in Lesson 6 — read `tools.db`,
build a title summarizing what it found, then start the browser pane
navigating — except now it does the first part by keeping every row it
reads, not just the first, which is what makes the rest of this lesson
possible at all.

### Proving It in Isolation

The real code above already shows `List<Tool>` doing real work, but it's
tangled together with SQL, a reader, and string interpolation all at once.
Isolated, with no unrelated code at all, in `LabScratch/Program.cs`:

```csharp
List<string> manufacturers = new List<string>();
manufacturers.Add("O'Brien Carbide Tools");
manufacturers.Add("Kennametal");

Console.WriteLine($"Count: {manufacturers.Count}");
Console.WriteLine($"First: {manufacturers[0]}");
Console.WriteLine($"Second: {manufacturers[1]}");
```

Run, from `LabScratch/` — a plain console program, no window, nothing this
session needed permission to run:

```
dotnet run
```

Real output, captured this session:

```
Count: 2
First: O'Brien Carbide Tools
Second: Kennametal
```

Two real strings went in through two separate `Add` calls, in order; `Count`
reports exactly how many are there right now, computed from the list's own
real internal state, not tracked by hand the way `toolCount` was; and
`manufacturers[0]`/`manufacturers[1]` read them back out by position,
zero-indexed, the same indexing this project has already used for arrays and
strings since Lesson 1. This is exactly what `tools.Add(Tool.FromReader(reader))`
and `tools[0]` in the real code above are doing, just with two hand-typed
strings standing in for two `Tool` objects read from a database. This kind of
type — one written once, with a placeholder (`T`) filled in differently at
each use (`List<string>` here, `List<Tool>` in the real project) — is called
a **generic collection type**.

### Discard the Throwaway Example

This lab's own `manufacturers` variable is discarded here — it exists only
to prove `List<T>`'s own behavior in isolation and does not appear in
`ToolDB` itself; `LabScratch/Program.cs` goes on to prove this lesson's next
concept in the next unit.

### Mechanical Walkthrough

- `List<Tool> tools = new List<Tool>();` — a **generic collection type**
  (Terms, above), instantiated the same way any other class is instantiated
  (`new` followed by a constructor call, established since Lesson 1) — the
  only new part is the `<Tool>` filling in `List<T>`'s own placeholder type
  parameter, telling the compiler this specific list will only ever hold
  `Tool` objects. Unlike a plain C# array (`Tool[]`), which has to be given
  a fixed length the moment it's created, `List<T>`'s own declared shape
  (Header, above) confirms it "implements the `IList<T>` generic interface
  by using an array whose size is dynamically increased as required" — this
  project doesn't know how many rows `tools.db` holds until the read loop
  below actually finishes, so a type that can grow one element at a time is
  the only one that fits.
- `tools.Add(Tool.FromReader(reader));` — `Tool.FromReader(reader)`
  (reappearing from Lesson 4, unchanged) still builds one real `Tool` object
  from the reader's current row; `Add(T item)` (Header, above) is a real
  method call on the `tools` object itself, appending that object to the end
  of the list. This single line replaces two separate Lesson 5/6 statements
  (`toolCount++` and the conditional `firstTool = tool`) with one call that
  keeps every row, not just the first.
- `if (tools.Count > 0)` — `Count` (Header, above), a real property read
  returning however many elements are actually in the list right now. This
  replaces Lesson 5/6's own `firstTool != null` check — the same underlying
  question ("did any rows come back?") asked a different way: a nullable
  reference type answers it with `null`/not-`null`; a collection answers it
  with a count of zero or more. Neither is more correct than the other in
  general, but `Count > 0` reads more directly once the data itself is a
  list rather than a single optional value.
- `tools[0].Name`, `tools[0].Manufacturer` — the **`List<T>` indexer**
  (Header, above), reading the element at position `0` — the same
  zero-based indexing this project has used for strings and arrays since
  Lesson 1, now working identically on a `List<T>`. `.Name`/`.Manufacturer`
  (reappearing from Lesson 4) are the same two `Tool` properties Lesson 5's
  own `Title` assignment already read; only where they're read from changed,
  from a variable named `firstTool` to an indexed element of `tools`.
- `tools.Count` (inside the string interpolation) — the same `Count`
  property already explained above, read a second time to report the real
  total in the title-bar text itself, replacing the old, separately-tracked
  `toolCount` variable — one real number, computed by the list, instead of
  two things (a variable and a list) that could in principle disagree.

### CS Lens

A collection that grows to fit however much data actually shows up, rather
than requiring its final size to be known in advance, is a language- and
library-independent idea, not something specific to C#. Also recognized in:
Python's `list` (this project's reader already knows this one directly),
Java's `ArrayList<T>`, JavaScript's `Array`, C++'s `std::vector<T>` — nearly
every general-purpose language ships some growable, indexable sequence type
as a core primitive, because "how many items will there be" is essentially
never known at compile time for data that comes from a file, a network
call, or, as here, a database query.

### SE Lens

Why `List<Tool>` here instead of a plain C# array, `Tool[]`? The alternative
not chosen — an array — requires its length the moment it's created
(`new Tool[n]`), which means this project would either have to run a
separate `SELECT COUNT(*) FROM tools` query first (an entire extra round
trip to the database, just to learn a number this lesson doesn't otherwise
need) or read every row into some other growable structure anyway and copy
it into an array afterward — at which point the array bought nothing.
`List<T>` accepts a real, honest cost in exchange for not needing that count
up front: per its own documented Remarks (Header, above), `Add` is usually
O(1), but "becomes an O(*n*) operation" whenever the list's internal array
has to be reallocated larger to fit a new element — a small amount of
copying overhead, and slightly more memory reserved than the data strictly
needs, spent specifically so this project's code never has to know
`tools.db`'s row count before it starts reading.

### Run It

Built, from `ToolDB/`:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

### Connecting Back

`tools` now holds every row `tools.db` returns, not just the first — the
exact gap this unit's own Problem named. `Window.Title` still reports the
same real numbers it always has, just sourced from the list instead of two
separately-tracked variables. But `tools` itself is still a real C# object,
living only in this process's own memory; nothing has tried to show it
anywhere but the title bar yet. Getting it into the browser pane — a
genuinely separate process, per Lesson 6 — is this lesson's next three
units.

---

## Concept Unit: Turning Objects Into Text Both Languages Can Read — JSON

### The Problem

`tools`, after the previous unit, is a real `List<Tool>` — real C# objects,
addressable directly by C# code, with real properties C# code can read with
a plain `.` — but that is exactly what `CoreWebView2`'s own separate
Chromium process, per this lesson's own Header, *cannot* reach into. Before
anything can cross that boundary, `tools` has to become something with no
C#-specific meaning at all: plain text, in a format a JavaScript engine
already knows how to read, with no custom parsing code this project would
otherwise have to write on either side.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml.cs`, modified.
- **Change type** — add (a new `using` directive, a new private field, and
  one new statement inside `MainWindow_Loaded`).
- **Location** — the `using` directive joins the existing block at the top
  of the file; the new field sits inside the class, immediately before the
  constructor; the new statement goes at the end of `MainWindow_Loaded`,
  after the `Title` assignment this unit's previous unit already covers, and
  before the existing `htmlPath`/`Browser.Source` lines Lesson 6 wrote.
- **Dependencies** — `System.Text.Json`, a new `using` this change needs;
  unlike `System.Collections.Generic` (previous unit), this namespace is
  *not* part of the real generated `GlobalUsings.g.cs` shown in the previous
  unit — it has to be written by hand.

### The New Code

The new field, holding the JSON text between the moment it's built and the
moment a later unit actually sends it:

```csharp
private string _toolsJson = "[]";
```

And the one new line inside `MainWindow_Loaded`, run immediately after the
read loop and `Title` assignment finish:

```csharp
_toolsJson = JsonSerializer.Serialize(tools);
```

### The Updated Project

`MainWindow.xaml.cs` in full, changed lines marked (this unit is the first
to add a field to `MainWindow`, so the class declaration and constructor are
shown here too, not just the method that changes):

```csharp
using System.ComponentModel;
using System.IO;
using System.Text.Json;                                                                     // ← new
using System.Windows;
using Microsoft.Data.Sqlite;
using Microsoft.Web.WebView2.Core;

namespace ToolDB;

public partial class MainWindow : Window
{
    private string _toolsJson = "[]";                                                       // ← new

    public MainWindow()
    {
        InitializeComponent();

        Loaded += MainWindow_Loaded;
        Closing += MainWindow_Closing;

        Browser.CoreWebView2InitializationCompleted += Browser_CoreWebView2InitializationCompleted;
        Browser.NavigationCompleted += Browser_NavigationCompleted;
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        using var connection = new SqliteConnection("Data Source=tools.db");
        connection.Open();

        using var selectCommand = new SqliteCommand(
            "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tools",
            connection);
        using var reader = selectCommand.ExecuteReader();

        List<Tool> tools = new List<Tool>();
        while (reader.Read())
        {
            tools.Add(Tool.FromReader(reader));
        }

        if (tools.Count > 0)
        {
            Title = $"ToolDB — Loaded {tools.Count} tool(s). First: {tools[0].Name} ({tools[0].Manufacturer})";
        }
        else
        {
            Title = "ToolDB — Loaded 0 tools.";
        }

        _toolsJson = JsonSerializer.Serialize(tools);                                        // ← new

        string htmlPath = Path.Combine(AppContext.BaseDirectory, "local.html");
        Browser.Source = new Uri(htmlPath);
    }

    private void Browser_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)
    {
        if (e.IsSuccess)
        {
            Console.WriteLine("CoreWebView2 initialized successfully.");
        }
        else
        {
            Console.WriteLine($"CoreWebView2 failed to initialize: {e.InitializationException}");
        }
    }

    private void Browser_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
    {
        if (e.IsSuccess)
        {
            Console.WriteLine("Navigation completed successfully.");
        }
        else
        {
            Console.WriteLine($"Navigation failed. WebErrorStatus={e.WebErrorStatus}");
        }
    }

    private void MainWindow_Closing(object? sender, CancelEventArgs e)
    {
        Console.WriteLine("MainWindow is closing.");
    }
}
```

`_toolsJson` starts every `MainWindow` object's life holding `"[]"` — valid
JSON for "an empty list" — and is overwritten with the real serialized data
by the time `MainWindow_Loaded` finishes; `Browser_NavigationCompleted`
(this lesson's next unit) is still the only place that will ever *read* it.

### Proving It in Isolation

The real code above calls `JsonSerializer.Serialize` on a whole `List<Tool>`
at once, with SQL and a database connection surrounding it. Isolated, and
run against a short escalating sequence — a single object first, then a
list of them, then, finally, this project's own real data — in
`LabScratch/Program.cs`:

```csharp
using System.Text.Json;

Widget single = new Widget { Name = "O'Brien Carbide Tools", Count = 1 };
Console.WriteLine(JsonSerializer.Serialize(single));

List<Widget> many = new List<Widget>();
many.Add(new Widget { Name = "O'Brien Carbide Tools", Count = 1 });
many.Add(new Widget { Name = "Kennametal", Count = 40 });
Console.WriteLine(JsonSerializer.Serialize(many));

class Widget
{
    public string Name { get; set; } = "";
    public int Count { get; set; }
}
```

Run, from `LabScratch/`:

```
dotnet run
```

Real output, captured this session (shown here with a literal apostrophe for
readability — see below for what the raw terminal text actually contains):

```
{"Name":"O'Brien Carbide Tools","Count":1}
[{"Name":"O'Brien Carbide Tools","Count":1},{"Name":"Kennametal","Count":40}]
```

This is called **JSON serialization**. Two real facts, both proven by this
real output rather than assumed: first, `Widget`'s own property names —
`Name`, `Count`, both auto-implemented properties (Lesson 4's own **backing
field** Term, above) — survive into the JSON exactly as declared, in
PascalCase; `JsonSerializer.Serialize` does not lowercase or rename them on
its own. Second, and genuinely surprising: `Widget.Name`'s real value,
`"O'Brien Carbide Tools"` — this project's own deliberately apostrophe-
bearing manufacturer name, chosen for exactly this reason back in Lesson 3
— the real terminal text does *not* show with a literal apostrophe
character at all. In its place, the actual captured output contains a
six-character Unicode escape sequence naming code point U+0027 — the
apostrophe, spelled out as an escape rather than written literally. This is
not a bug or a mistake in the lab: Microsoft's own
documentation on `System.Text.Json` character encoding (fetched this
session) confirms the serializer's default encoder deliberately treats the
apostrophe as one of a small set of "HTML-sensitive characters such as `<`,
`>`, `&`, and `'`" it escapes by default, as a real, stated defense against
script-injection if the JSON text ever ends up embedded directly inside an
HTML page or a `<script>` element — precisely the situation this project's
own pipeline diagram, above, is building toward. The escape is invisible
once the text is read back: `'` parses back into a real `'` character
on the JavaScript side, so nothing about the rendered result changes,
proven directly in this lesson's fourth unit, below.

One escalating step further — the same call, against this project's own
real `tools.db`, using the identical `SqliteConnection`/`SqliteCommand`/
`SqliteDataReader`/`Tool.FromReader` sequence Lessons 1–4 already proved,
appended to the same `LabScratch/Program.cs`:

```csharp
using var connection = new SqliteConnection("Data Source=../ToolDB/tools.db");
connection.Open();

using var selectCommand = new SqliteCommand(
    "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tools",
    connection);
using var reader = selectCommand.ExecuteReader();

List<Tool> tools = new List<Tool>();
while (reader.Read())
{
    tools.Add(Tool.FromReader(reader));
}

Console.WriteLine(JsonSerializer.Serialize(tools));
```

Real output, captured this session, reading the real, unchanged `tools.db`
row:

```
[{"Id":1,"Name":"1/2 in 4-Flute Carbide End Mill","Manufacturer":"O'Brien Carbide Tools","OverallDiameter":0.5,"OverallLength":3,"FluteCount":4}]
```

(shown above with a literal apostrophe for readability — the real captured
terminal text escapes that one character as a Unicode escape sequence
naming code point U+0027 instead, same as the single-`Widget` case just
above). This is otherwise the exact real string `MainWindow_Loaded`'s own new
`JsonSerializer.Serialize(tools)` call will produce once `ToolDB` itself
runs — one more real, escalating step, this time using the real project's
own data instead of a hand-typed `Widget`. One more real detail worth
naming here rather than glossing over: `OverallLength`, a C# `double` whose
real value is `3.0`, comes out as plain `3` in the JSON, with no trailing
`.0` — `JsonSerializer` writes the shortest text that still round-trips
back to the same number, not a fixed number of decimal places.

### Discard the Throwaway Example

`Widget`, `single`, and `many` are discarded here — real proof of how
`JsonSerializer.Serialize` behaves, never part of `ToolDB` itself. The real
`tools.db` read that follows it stays in `LabScratch/Program.cs` as this
lesson's own record of the exact real output `ToolDB` now produces, per this
project's own established convention for this file.

### Mechanical Walkthrough

- `using System.Text.Json;` — a `using` directive (established since Lesson
  1), reappearing here for a namespace this project has never referenced
  before — `JsonSerializer` (below) lives here, and, per this unit's own
  Project Change, it is not one of the namespaces `ImplicitUsings` already
  provides automatically.
- `private string _toolsJson = "[]";` — a **field** (Terms, above),
  declared with an access modifier (`private`, established since Lesson 4)
  restricting it to `MainWindow`'s own code, a declared type (`string`,
  established since Lesson 1), and an initializer (`= "[]"`, the same
  initializer syntax already used for auto-implemented properties like
  `Tool.Name`) giving it a real, valid starting value the instant any
  `MainWindow` object is constructed — before `MainWindow_Loaded` has even
  run once. The leading underscore is a plain naming convention, not special
  syntax: this project's own established style uses PascalCase for public
  properties (`Tool.Name`) and this leading-underscore style for private
  fields, so the two are visually distinguishable at a glance.
- `_toolsJson = JsonSerializer.Serialize(tools);` — `JsonSerializer`
  (Header, above) is a `static` class — nothing about it is instantiated
  with `new`, the same shape Lesson 4's own `Tool.FromReader` already
  established for a `static` factory method: `Serialize` is called directly
  on the type name, not on an object. `tools` (previous unit) is passed as
  the method's own generic `TValue` argument, inferred automatically from
  `tools`'s own declared type (`List<Tool>`) — nothing in this line spells
  out `<List<Tool>>` explicitly, because the compiler already knows it from
  the argument itself. The result, a real `string`, is assigned back into
  `_toolsJson` — not a local variable, because (this unit's own Problem)
  nothing needs this value except a different method, running at a later
  time this method has no control over.

### CS Lens

Converting a live, in-memory object graph into a flat, portable
representation — and, on the far side, reconstructing it — is a
general idea with a name far older and broader than any one language's own
JSON library: **serialization** (Terms, above). Also recognized in: Python's
own `json.dumps`/`pickle`, Java's Jackson/Gson libraries, Protocol Buffers,
XML — the general problem of two separately-compiled, separately-running
pieces of code needing to exchange structured data without ever sharing
memory shows up anywhere two independent processes, two machines, or a
process and a disk file need to agree on a shape neither one's own runtime
invented.

### SE Lens

Why JSON specifically, rather than some ToolDB-specific text format — a
single line per tool, fields separated by commas or pipes? This project has
already met the real cost of a hand-rolled delimited format: Lesson 3's own
injection lab showed exactly how a naive, hand-built text format breaks the
moment real data contains the same character used as a delimiter (there,
semicolons inside SQL text; here, a manufacturer name containing a comma or
a pipe character would silently corrupt a hand-rolled format the same way).
JSON's real advantage is not just that it's readable by both sides — it's
that *nothing on either side has to write its own parser at all*: this
lesson's own next unit shows `PostWebMessageAsJson`'s own documented Remarks
stating plainly that the JavaScript side receives an already-parsed object,
with no `JSON.parse` call anywhere in this project's own code. The honest
cost accepted in exchange: JSON carries no schema of its own. Nothing stops
a future rename of `Tool.Name` from silently breaking `local.html`'s own
`tools[0].Name` reference (this lesson's fourth unit) with no compiler error
on either side — the two sides are connected only by an unenforced, shared
naming convention, not by any contract either language's own compiler
checks.

### Run It

Built, from `ToolDB/`:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

### Connecting Back

`_toolsJson` now holds a real, valid JSON string — proven, not assumed, to
be exactly the text this project's own real data produces. It is still
sitting in a private field, inside this process's own memory, having gone
nowhere. Actually sending it across the process boundary this lesson's own
Header names is the next unit's entire job.

---

## Concept Unit: Crossing the Boundary — `PostWebMessageAsJson`

### The Problem

`Browser.CoreWebView2` (Lesson 6) is the real, live connection to the
Chromium process this lesson's data has to cross into — but *when* code
calls it matters here in a way it hasn't before. `PostWebMessageAsJson`'s
own real, documented Remarks (Header, above) state plainly: "The message is
sent asynchronously. If a navigation occurs before the message is posted to
the page, the message is not be sent." Lesson 6 already proved
`Browser.Source`'s own assignment is what *starts* a navigation — so calling
`PostWebMessageAsJson` anywhere near that assignment risks exactly the
failure this documentation names. Where this call goes inside
`MainWindow.xaml.cs` is not a free choice.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml.cs`, modified.
- **Change type** — add (one new line inside `Browser_NavigationCompleted`'s
  own success branch).
- **Location** — `Browser_NavigationCompleted`, the same handler Lesson 6
  wrote; the new line goes immediately after the existing
  `Console.WriteLine("Navigation completed successfully.");` call, still
  inside the `if (e.IsSuccess)` branch.
- **Dependencies** — `_toolsJson` (previous unit); `Browser.CoreWebView2InitializationCompleted`
  and `Browser.NavigationCompleted`, both already attached in the
  constructor since Lesson 6, which is what guarantees `Browser.CoreWebView2`
  is genuinely non-`null` by the time this new line runs at all.

### The New Code

One line, added to the success branch this project already had:

```csharp
Browser.CoreWebView2.PostWebMessageAsJson(_toolsJson);
```

### The Updated Project

`MainWindow.xaml.cs` in full — this lesson's finished C# checkpoint, new
line marked (every other line here matches the previous unit's own Updated
Project exactly, except this one addition):

```csharp
using System.ComponentModel;
using System.IO;
using System.Text.Json;
using System.Windows;
using Microsoft.Data.Sqlite;
using Microsoft.Web.WebView2.Core;

namespace ToolDB;

public partial class MainWindow : Window
{
    private string _toolsJson = "[]";

    public MainWindow()
    {
        InitializeComponent();

        Loaded += MainWindow_Loaded;
        Closing += MainWindow_Closing;

        Browser.CoreWebView2InitializationCompleted += Browser_CoreWebView2InitializationCompleted;
        Browser.NavigationCompleted += Browser_NavigationCompleted;
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        using var connection = new SqliteConnection("Data Source=tools.db");
        connection.Open();

        using var selectCommand = new SqliteCommand(
            "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tools",
            connection);
        using var reader = selectCommand.ExecuteReader();

        List<Tool> tools = new List<Tool>();
        while (reader.Read())
        {
            tools.Add(Tool.FromReader(reader));
        }

        if (tools.Count > 0)
        {
            Title = $"ToolDB — Loaded {tools.Count} tool(s). First: {tools[0].Name} ({tools[0].Manufacturer})";
        }
        else
        {
            Title = "ToolDB — Loaded 0 tools.";
        }

        _toolsJson = JsonSerializer.Serialize(tools);

        string htmlPath = Path.Combine(AppContext.BaseDirectory, "local.html");
        Browser.Source = new Uri(htmlPath);
    }

    private void Browser_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)
    {
        if (e.IsSuccess)
        {
            Console.WriteLine("CoreWebView2 initialized successfully.");
        }
        else
        {
            Console.WriteLine($"CoreWebView2 failed to initialize: {e.InitializationException}");
        }
    }

    private void Browser_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
    {
        if (e.IsSuccess)
        {
            Console.WriteLine("Navigation completed successfully.");
            Browser.CoreWebView2.PostWebMessageAsJson(_toolsJson);                          // ← new
        }
        else
        {
            Console.WriteLine($"Navigation failed. WebErrorStatus={e.WebErrorStatus}");
        }
    }

    private void MainWindow_Closing(object? sender, CancelEventArgs e)
    {
        Console.WriteLine("MainWindow is closing.");
    }
}
```

Every real value this project has traced since Lesson 1 now flows all the
way through this one file: `tools.db`'s real row, through `Tool.FromReader`,
into `tools`, into `_toolsJson`, and now, the instant navigation genuinely
finishes, out across the process boundary — the last C# line this lesson
needs.

### Proving It in Isolation

Back in `LabScratch.Wpf/MainWindow.xaml.cs` — the same evolving lab Lesson 6
already built `CoreWebView2InitializationCompleted`/`NavigationCompleted`
handling into — one new line inside the existing success branch:

```csharp
private void Browser_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
{
    if (e.IsSuccess)
    {
        Console.WriteLine("Navigation completed successfully.");
        Browser.CoreWebView2.PostWebMessageAsJson("\"hello from C#\"");
    }
    else
    {
        Console.WriteLine($"Navigation failed. WebErrorStatus={e.WebErrorStatus}");
    }
}
```

`"\"hello from C#\""` is a C# string literal whose real *content* is
`"hello from C#"` — quote characters included — valid JSON for a single JSON
string value, the smallest possible message this method could send. Built,
from `LabScratch.Wpf/`:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

A clean build proves this compiles — `Browser.CoreWebView2` really is
declared as a real, non-`null`-typed `CoreWebView2` at this point in the
code (Header, above), and `PostWebMessageAsJson(string)` really does accept
a plain string — but it does not, by itself, prove the message actually
arrives anywhere; that requires a real, running browser process this
session cannot launch (this project's own standing constraint), and is left
to you, the reader, in this lesson's own first Exercise, below. This is
called **crossing a process boundary via message passing**.

**Diagnosing a timing mistake — the same lab, deliberately broken.** This
unit's own Problem named a real hazard: sending too early. The most direct
way to send "too early" is trying to post the instant `Browser.Source` is
assigned, inside the constructor itself, before either
`CoreWebView2InitializationCompleted` or `NavigationCompleted` has had any
chance to fire:

```csharp
string htmlPath = Path.Combine(AppContext.BaseDirectory, "lab.html");
Browser.Source = new Uri(htmlPath);
Browser.CoreWebView2.PostWebMessageAsJson("\"too early\"");
```

Built, from `LabScratch.Wpf/`:

```
dotnet build
```

Real output, captured this session, with this line added:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Still a clean build — and this is the point worth sitting with, the same
shape Lesson 6's own deliberately-invalid `UserDataFolder` already proved:
nothing about calling `.PostWebMessageAsJson(...)` on `Browser.CoreWebView2`
is invalid C#, so the compiler has no way to catch this mistake. The real
failure is a `NullReferenceException`, thrown the instant this line
actually runs — not the "message not sent" behavior `PostWebMessageAsJson`'s
own Remarks describe (that specific wording covers a *different* mistake:
posting correctly, but racing a *subsequent* navigation away from the page).
`Browser.CoreWebView2`'s own real declared shape (Header, above) states
plainly it "Returns `null` until initialization has completed" — and
immediately after `Browser.Source = new Uri(htmlPath);` returns,
initialization has only just started in the background (Lesson 6's own
Concept Unit 2); it has not had time to finish. Calling a method on a
`null` reference is a real, ordinary C# runtime error, not anything specific
to WebView2 — the same category of mistake `Tool.cs`'s own nullable-typed
properties (Lesson 4) exist to help catch earlier, at compile time, when a
type is annotated `?` and actually checked before use, which
`Browser.CoreWebView2` here is not.

### Discard the Throwaway Example

Both versions of this lab — the correct, working version and the
deliberately early, broken one — stay in `LabScratch.Wpf/` as this unit's
own real record; neither the broken early call nor the placeholder
`"hello from C#"` message becomes part of `ToolDB`, which sends its own
real `_toolsJson` instead, from the one correct location this unit's own
Problem already justified.

### Mechanical Walkthrough

- `Browser.CoreWebView2` — reappearing from this lesson's own Header, read
  here for the first time in real, working code rather than only discussed:
  a real property access, returning the live `CoreWebView2` object Lesson 6
  proved exists by the time `NavigationCompleted` has fired at all.
- `.PostWebMessageAsJson(_toolsJson)` — `PostWebMessageAsJson(string)`
  (Header, above), a real instance method call, `_toolsJson` (previous unit)
  passed as its one `string` argument. The method itself returns nothing
  (`void`, per its own real declared signature) — this project has no way to
  ask it "did that succeed," only to trust its own documented behavior when
  called at the right moment, which this unit's own Problem and lab both
  exist to establish.

### CS Lens

Two independent processes, sharing no memory, exchanging only copied,
serialized messages across a defined boundary — never a direct reference —
is a shape far broader than this one WebView2 method. Also recognized in:
inter-process communication generally (named pipes, sockets), a web
browser's own `Worker.postMessage` (a different API, same underlying idea,
between a page and a background thread instead of a native host and a
browser), the actor model (Erlang processes, Akka actors, each with private
state, communicating only by message), and microservice architectures
communicating over HTTP or a message queue instead of a shared in-process
call.

### SE Lens

Why does `PostWebMessageAsJson` return immediately, sending "asynchronously"
per its own Remarks, instead of blocking until JavaScript has actually
received and processed the message? The alternative not chosen — a
synchronous call that waits for an acknowledgment — would require blocking
the WPF UI thread on a response from a genuinely separate process, one this
project does not control the timing of at all; if that other process were
ever slow, busy, or stuck, the entire window would freeze until it
answered, the exact category of problem this curriculum's own roadmap
names as a dedicated later topic (Slice 3, `async`/`await`, `Dispatcher`).
The honest cost accepted here in exchange: because posting is fire-and-
forget, `Browser_NavigationCompleted` has no way to know for certain the
message was actually received and rendered — only that it was *sent*
without a C#-side error. If `local.html`'s own JavaScript throws inside its
`message` listener, nothing in this lesson's own C# code would ever find
out; that gap is real, not glossed over, and stays open until a future
lesson gives WebView2 content a documented way to report problems back.

### Run It

Built, from `ToolDB/`:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

### Connecting Back

The real `_toolsJson` string, proven correct in the previous unit, now
genuinely crosses the process boundary this lesson's own Header opened
with — sent from the one place in this project's own code where doing so is
actually safe. Whether anything is listening on the other side of that
boundary at all is a question this unit's own C# code has no way to answer;
that is this lesson's final unit's entire job.

---

## Concept Unit: The Browser's Side of the Bridge

### The Problem

`PostWebMessageAsJson`'s own Remarks (Header, above) are specific about what
happens to a message once it's sent — it "runs the message event of the
`window.chrome.webview` of the top-level document" — but `local.html`, as
Lesson 6 left it, has no code of its own at all: it is a static file with no
`<script>` tag, nothing capable of reacting to any event, JavaScript or
otherwise. Everything this project has written until this exact moment has
been C#. Showing real data on screen means writing this project's first-ever
JavaScript, inside `local.html` itself, specifically built to receive
exactly what the previous unit now sends.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/local.html`, modified.
- **Change type** — replace (the old static placeholder paragraph) and add
  (a new `<script>` block).
- **Location** — inside `local.html`'s own `<body>`, Lesson 6's only file to
  ever touch this content.
- **Dependencies** — `window.chrome.webview`, which exists only because this
  page is hosted inside a `WebView2` control (Lesson 6); no new package, no
  new `using` — this is a plain HTML/JavaScript change, entirely on the
  browser side of the boundary.

### The New Code

An element with a real `id`, replacing the old static paragraph, so
JavaScript has something specific to find and change:

```html
<p id="output">Waiting for tool data from C#...</p>
```

And, immediately after it, this project's first `<script>` block:

```html
<script>
    window.chrome.webview.addEventListener('message', event => {
        const tools = event.data;
        document.getElementById('output').textContent =
            `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})`;
    });
</script>
```

### The Updated Project

`local.html` in full, changed lines marked:

```html
<!DOCTYPE html>
<html>
<head><title>ToolDB</title></head>
<body>
    <h1>ToolDB</h1>
    <p id="output">Waiting for tool data from C#...</p>                                     <!-- ← changed -->
    <script>                                                                                <!-- ← new -->
        window.chrome.webview.addEventListener('message', event => {                        <!-- ← new -->
            const tools = event.data;                                                       <!-- ← new -->
            document.getElementById('output').textContent =                                 <!-- ← new -->
                `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})`;  <!-- ← new -->
        });                                                                                  <!-- ← new -->
    </script>                                                                                <!-- ← new -->
</body>
</html>
```

Before this page ever loads, `<p id="output">` shows its own fixed waiting
text — the same static-content-only page Lesson 6 built. The moment
`window.chrome.webview` fires a real `message` event — which, per the
previous unit's own real code, only ever happens after this page has
already finished loading (`NavigationCompleted`, Lesson 6) — that placeholder
text is replaced with real data read directly out of the message itself.

### Proving It in Isolation

Back in `LabScratch.Wpf/lab.html` — evolving the same file Lesson 6 already
built and the previous unit's own lab already posts a message from — a
matching receiver, proven against that lab's own real
`"\"hello from C#\""` message rather than this project's real tool data:

```html
<p id="output">Waiting for a message from C#...</p>
<script>
    window.chrome.webview.addEventListener('message', event => {
        document.getElementById('output').textContent = `Received: ${event.data}`;
    });
</script>
```

This is exactly what `local.html`'s own `<script>` block above does,
isolated against the smallest possible message instead of a real tool list:
`event.data`, per `PostWebMessageAsJson`'s own real Remarks (Header, above),
is already the parsed JavaScript value — here, the plain string `"hello from
C#"` — not raw JSON text needing a separate parse step. Built, from
`LabScratch.Wpf/`:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Confirmed, for real, that this updated `lab.html` actually reached the build
output folder — not assumed from the file existing in the project folder
alone:

```
bin/Debug/net10.0-windows/lab.html
```

A real directory listing, and a real check for the literal text
`addEventListener` inside that copied file, both captured this session,
confirm it. This is called an **event listener**, JavaScript's own version
of the same registration idea this project already knows from C#'s `+=`.
Watching this lab's own `<p id="output">` actually change from "Waiting for
a message from C#..." to "Received: hello from C#" requires a real, running
browser window — left to you, the reader, in this lesson's own first
Exercise, below, alongside the previous unit's own C#-side proof.

### Discard the Throwaway Example

`LabScratch.Wpf/lab.html`'s own `<p id="output">`/`<script>` pair stays in
place as this lesson's own finished lab record, built against the trivial
`"hello from C#"` message; `local.html`'s own real script, built against
this project's actual tool data and a different message shape (an array of
objects, not a single string), is the version that ships.

### Mechanical Walkthrough

- `<p id="output">Waiting for tool data from C#...</p>` — an ordinary HTML
  element (already established since Lesson 6's own static `local.html`),
  now carrying an `id` attribute for the first time — a plain string
  identifier, unique within this one page, existing solely so
  `document.getElementById` (below) has something specific to find.
- `<script>` — a real HTML tag telling the browser engine behind
  `CoreWebView2` (Lesson 6) that everything between it and its own closing
  `</script>` is JavaScript source code to execute, not text to display —
  this project's first appearance of any JavaScript anywhere.
- `window.chrome.webview` — `window` is the browser's own top-level global
  object, standard to every web page, holding every other global name a
  page's own JavaScript can reach; `chrome.webview` (Header, above) is not
  part of that standard set at all — it exists on `window` specifically and
  only because `CoreWebView2` (Lesson 6) injected it, real, documented proof
  this exact page is running inside a native host, not an ordinary browser
  tab.
- `.addEventListener('message', event => { ... })` — `addEventListener`
  (Header, above), called with two arguments: `'message'`, the exact event
  name `PostWebMessageAsJson`'s own Remarks (Header, above) name as what it
  fires; and an **arrow function** (Terms, above), `event => { ... }` — a
  function literal taking one parameter, `event`, with no separate `function`
  keyword and no name of its own, matching this lesson's own **event
  listener** Term precisely: registered now, run later, exactly once per
  real message received.
- `const tools = event.data;` — `const`, a JavaScript variable declaration
  (this project's first) whose value, once assigned, cannot be reassigned —
  the JavaScript analogue of a plain local variable, used here because
  `tools` never needs to change after this one assignment. `event.data`,
  per `PostWebMessageAsJson`'s own real Remarks (Header, above), is already
  a real JavaScript value — here, a real JavaScript array of objects,
  automatically parsed from the JSON text `_toolsJson` carried across the
  boundary — not a string requiring any further parsing.
- `document.getElementById('output')` — `document` (Terms, above — the
  **DOM**'s own root object for this page), `.getElementById('output')`
  (Header, above), a real method call locating the exact `<p id="output">`
  element written above, returning the real element object itself, not a
  copy or a description of it.
- `.textContent = ...` — `textContent` (Header, above), assigned a new
  value, which per its own real documented behavior "removes all child
  nodes and replaces them with a single text node containing the given
  string value" — the mechanism that actually makes the placeholder text
  disappear and real data appear in its place.
- `` `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})` ``
  — a **template literal** (Terms, above), JavaScript's own string
  interpolation, the same general idea as C#'s `$"..."` (used since Lesson
  1) spelled with backticks and `${}` instead of a leading `$` and `{}`.
  `tools.length` is a real JavaScript `Array` property — analogous to
  `List<T>.Count` (this lesson's first unit), but named differently, since
  `tools` here is a plain JavaScript array, not a .NET `List<T>`.
  `tools[0]` is real JavaScript array indexing, zero-based, the identical
  concept `List<T>`'s own indexer already used in C#, just a different
  language's own syntax for the same idea. `.Name`/`.Manufacturer` read the
  exact same two `Tool` properties (Lesson 4) `Window.Title` already
  displays — PascalCase, because, per this lesson's second unit,
  `JsonSerializer.Serialize` never renamed them, and JSON's own object keys
  simply became this JavaScript object's own property names, unchanged.

### CS Lens

`window.chrome.webview.addEventListener('message', event => { ... })` is the
same **event listener** shape this project has used in C# since Lesson 5 —
`Loaded += MainWindow_Loaded;`, `CoreWebView2InitializationCompleted +=
Browser_CoreWebView2InitializationCompleted;` — expressed in a different
language's own idiom. Also recognized in: Python's own `bind()` calls in
`tkinter`, Java's `addActionListener`, and, more generally, the **Observer
pattern** — an object (here, `window.chrome.webview`) maintaining a list of
interested listeners and calling each one back whenever its own state
changes, rather than every interested party having to repeatedly ask
"has anything happened yet?"

### SE Lens

Why does WebView2 expose `window.chrome.webview` as a real `EventTarget`
supporting `addEventListener`, rather than something simpler — a single
global function, `onMessageFromHost(data) { ... }`, that C# could call by
name directly? `addEventListener`'s own real documentation (Header, above)
states plainly it "allows multiple handlers per event" — a real, structural
advantage a single named callback function does not have: more than one
independent piece of this page's own future JavaScript (a future jQuery
script, Slice 2's own DataTables integration, or, much later, a React
component, per this project's own roadmap) could each register its own
listener for the same `'message'` event without one silently overwriting
another's callback, which a single global function name would risk the
moment two different scripts both tried to define it. The honest cost
accepted for that flexibility: this indirection — register now, get called
back later, at a moment this page's own top-to-bottom code order doesn't
control — is genuinely harder to trace by reading top to bottom than a
direct function call would be, the same category of difficulty this
project's own C# event handlers (Lesson 5 onward) already carry.

### Run It

Built, from `ToolDB/`:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Confirmed, for real, that the updated `local.html` reached the real build
output folder, carrying its new script with it:

```
bin/Debug/net10.0-windows/local.html
```

A real directory listing, and a real check for the literal text
`addEventListener` inside that copied file, both captured this session,
confirm it. And, confirming this lesson's own changes didn't disturb
anything Lesson 4 already proved, `ToolDB.Tests`' own existing test still
passes unchanged:

```
dotnet test
```

Real output, captured this session, from inside `ToolDB.Tests/`:

```
Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 85 ms - ToolDB.Tests.dll (net10.0)
```

### Connecting Back

Every piece this lesson built now works together: a `List<Tool>` (first
unit) holding every real row, turned into real JSON text (second unit),
crossing the real process boundary at the one safe moment this project's
own code can guarantee (third unit), landing in real, this-project's-own
JavaScript that finds a real element and replaces its placeholder text with
real data (this unit). `tools.db`'s own single real row, unchanged since
Lesson 3, is now visible in two independent places inside the same native
window — the title bar (Lesson 5–6) and, for the first time, the browser
pane itself.

---

## Closing

### Connect the Pieces

One trace, start to finish, on the real, finished `ToolDB` project. The
first unit replaced Lesson 5–6's own `toolCount`/`firstTool` tracking with a
real `List<Tool>`, proving in an isolated lab that a generic collection
grows to fit however many real rows actually come back, with no row count
needed in advance. The second unit turned that list into real JSON text —
`JsonSerializer.Serialize(tools)` — proving, against this project's own
real `tools.db` data, the exact string `MainWindow_Loaded` now produces
(shown with a literal apostrophe for readability; the real captured
terminal text instead escapes it as a Unicode escape sequence naming code
point U+0027):
`[{"Id":1,"Name":"1/2 in 4-Flute Carbide End Mill","Manufacturer":"O'Brien
Carbide Tools","OverallDiameter":0.5,"OverallLength":3,"FluteCount":4}]` —
and surfaced a real, documented reason the project's own deliberately
apostrophe-bearing manufacturer name (Lesson 3) comes out escaped that way
rather than literal. The third unit sent that exact string across the real
process boundary Lesson 6 established, `Browser.CoreWebView2.PostWebMessageAsJson(_toolsJson)`
— proving, with a deliberately broken lab, that doing this even slightly too
early throws a real `NullReferenceException` the C# compiler has no way to
catch. The fourth and final unit gave `local.html` its first-ever
JavaScript, `window.chrome.webview.addEventListener('message', ...)`,
reading that same real message back out, PascalCase property names intact,
and writing it into the page's own visible text. What began, in Lesson 6, as
two disconnected pipelines — one real, one showing nothing but placeholder
text — is now one continuous path from `tools.db`'s own real disk file all
the way to real, on-screen browser content.

### What Breaks Without This

`_toolsJson = JsonSerializer.Serialize(tools);`, added to `MainWindow_Loaded`
in this lesson's second unit, is not optional — removing it breaks something
real and provable, most of it without needing to run the app at all.
Temporarily comment it out:

```csharp
// _toolsJson = JsonSerializer.Serialize(tools);
```

Rebuilding:

```
dotnet build
```

Real output, captured this session, with the line removed:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

The build still succeeds — nothing about a missing assignment is a compile
error, `_toolsJson` is still a perfectly valid `string`, just stuck holding
its own field initializer's value, `"[]"`, forever. Reasoning through the
real, documented consequence, the same way Lesson 6's own "what breaks"
section did for a missing `<Content>` item: `Browser_NavigationCompleted`
would still call `Browser.CoreWebView2.PostWebMessageAsJson(_toolsJson)`
exactly as before, sending the literal text `[]` — valid JSON for an empty
array. `local.html`'s own script would still receive a real `message` event
and still run `const tools = event.data;` without error — `tools` would
simply be a real, empty JavaScript array. `tools.length` would correctly
report `0`, but `tools[0]` — indexing an empty array — evaluates to
`undefined` in JavaScript, not an exception by itself; the actual failure
happens one property access later, at `tools[0].Name`, attempting to read a
property *of* `undefined`, which throws a real `TypeError` inside the
`message` listener: `Cannot read properties of undefined (reading
'Name')`. `local.html`'s own placeholder text would stay stuck on "Waiting
for tool data from C#..." forever, silently, since nothing in this
project's own code surfaces a JavaScript exception back to the C# side (this
lesson's third unit's own SE Lens already named this exact gap). Restoring
the line and rebuilding confirms the fix holds:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

`tools.db` itself was never touched by any of this — this lesson's own code
changes are entirely C#/JavaScript; no SQL statement anywhere in this lesson
writes to the database, confirmed directly by the real, unchanged query
output this lesson's own second unit already captured.

### Exercises

- This lesson's own message-passing lab, in `LabScratch.Wpf/`, was built but
  never run this session (the constraint this project's own Header notes,
  Lesson 5 onward). Run it for real with `dotnet run`, and confirm
  `lab.html`'s own `<p id="output">` really changes from "Waiting for a
  message from C#..." to "Received: hello from C#" — the one thing this
  session's own transcript cannot substitute for.
- Using the real `ToolDB` project (not the lab), temporarily move
  `_toolsJson = JsonSerializer.Serialize(tools);` to the very end of
  `MainWindow_Loaded`, *after* `Browser.Source = new Uri(htmlPath);` instead
  of before it — predict, from this lesson's third unit's own Problem and
  `PostWebMessageAsJson`'s own cited Remarks, whether the message will
  still arrive, then run it for real and confirm, before restoring the
  original order.
- This lesson's own "What Breaks Without This" section reasoned through what
  `tools[0].Name` does against an empty array without actually running it.
  Reproduce it for real: comment out the same `JsonSerializer.Serialize`
  line, run `dotnet run` from `ToolDB/`, open the browser pane's own
  DevTools (right-click inside it, if available, or F12), and read the
  actual `TypeError` text the JavaScript console reports — then restore the
  line and confirm the real page shows real tool data again.

### Definition of Done

- [ ] `ToolDB/MainWindow.xaml.cs` declares `private string _toolsJson =
      "[]";`, builds a `List<Tool>` inside `MainWindow_Loaded` (replacing
      `toolCount`/`firstTool`), assigns `_toolsJson =
      JsonSerializer.Serialize(tools);`, and calls
      `Browser.CoreWebView2.PostWebMessageAsJson(_toolsJson);` inside
      `Browser_NavigationCompleted`'s own success branch.
- [ ] `ToolDB/local.html` has a `<p id="output">` element and a `<script>`
      block calling `window.chrome.webview.addEventListener('message', ...)`,
      writing real tool data into that element's own `textContent`.
- [ ] `dotnet build`, from `ToolDB/`, reports `Build succeeded`, `0
      Warning(s)`, `0 Error(s)`.
- [ ] `dotnet run`, from `ToolDB/`, was actually run and watched: the browser
      pane shows real text built from `tools.db`'s own real row — "Loaded 1
      tool(s) from tools.db. First: 1/2 in 4-Flute Carbide End Mill (O'Brien
      Carbide Tools)" — not the old static placeholder, and not the "Waiting
      for tool data from C#..." text — confirmed by eye, the one piece of
      this lesson a transcript cannot substitute for.
- [ ] This lesson's own `LabScratch.Wpf/` message-passing lab was actually
      run, and `lab.html`'s own `<p id="output">` was watched changing from
      its own waiting text to "Received: hello from C#" — not just built.
- [ ] The "what breaks" experiment above was actually run: the
      `JsonSerializer.Serialize` line was commented out, the browser pane's
      own stuck placeholder text (or the real `TypeError` in DevTools, per
      this lesson's third Exercise) was confirmed directly, and the line was
      restored, confirmed working again afterward.
- [ ] `tools.db` itself still contains exactly one row, unchanged by
      anything in this lesson.
- [ ] `ToolDB.Tests`' own existing test still reports `Passed!` with
      `Failed: 0`, confirming this lesson's changes didn't disturb Lesson
      4's own proven mapping logic.
- [ ] A git commit exists containing every changed and new file from this
      lesson, with a message explaining *why* (this project's two, until now
      disconnected, pipelines — native title bar and browser pane — now
      share one real source of truth, `tools.db`, crossing a real process
      boundary as JSON to get there).

Next lesson: **Lesson 8 — Records & Strong Types**, the first lesson of
Slice 2, replacing `Tool`'s own plain mapped class with a real domain model
and asking why a `record` exists as something genuinely different from a
`class` in the first place.
