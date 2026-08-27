# Lesson 34: The Bridge Doesn't Care Who's Listening (Wiring React Into the Same Bridge)

**What you will build.** `react-demo.html`'s own `App` component,
connected for real to this project's own existing C#↔JS bridge —
real, live tool data pushed from C#, and a real `Edit` button posting
back to C#, reusing `window.chrome.webview`'s own real
`addEventListener`/`postMessage` exactly as established in Passing C#
Data to HTML and Two-Way Communication Across the Split. `MainWindow.xaml.cs`
now loads `react-demo.html` instead of `local.html` as its own real,
active page. The transferable problem underneath the feature: proving
this project's own Architecture section right — "swapping a WebView2
screen's presentation layer... doesn't change the bridge contract or the
persistence layer underneath it" — by actually doing the swap, for real,
and watching what does and doesn't have to change.

**What you need to know first.** What React Buys You — `App`/`ToolRow`,
this lesson's own real, unmodified starting point. Passing C# Data to
HTML — `PostWebMessageAsJson`, reused, unchanged, on the C# side.
Two-Way Communication Across the Split — the real JS→host
`postMessage`/`WebMessageReceived` direction, reused unchanged on the C#
side; `EditRequest`, unmodified.

**Terms used in this lesson**

- **side effect** — in React's own real vocabulary, anything a
  component does that reaches *outside* of simply computing what it
  should render — subscribing to a real, external event source, for
  instance, rather than just returning JSX. It exists as a named concept
  because React's own real rendering process expects components to be
  predictable, repeatable computations; reaching outside that (to a real
  browser API like `window.chrome.webview`) needs its own, explicit, real
  mechanism, kept clearly separate from rendering itself.
- **`useEffect`** — a real React Hook letting a component perform a
  side effect (above). Per React's own real, fetched documentation
  (`react.dev/reference/react/useEffect`), it "lets you synchronize a
  component with an external system," and, critically, "an Effect with
  empty dependencies doesn't re-run when any of your component's props
  or state change" — used here with a real, empty dependency array,
  `[]`, meaning it runs exactly once, when `App` first mounts. It exists
  so a real, external subscription — here, to
  `window.chrome.webview`'s own real `message` event — has an explicit,
  real place to start (and, via its own real cleanup function, to stop),
  tied to the component's own real lifetime rather than scattered
  through render logic.
- **cleanup function** — the real, optional function a `useEffect`
  callback can return, which React calls before the effect runs again,
  or when the component is removed entirely. It exists so a real
  subscription started by an effect (here, `addEventListener`) has a
  real, matching place to be undone (`removeEventListener`), preventing
  a real, orphaned listener from outliving the component that created
  it.

**Objects and methods used**

- **`React.useEffect(setup, dependencies)`**
  - *What it is:* the real React Hook (Terms, above) this lesson's own
    real bridge subscription is built on.
  - *Implementation:* per React's own real, fetched documentation, its
    real shape is `useEffect(setup, dependencies?)`, where `setup` "may
    optionally return a *cleanup* function"; used here as
    `React.useEffect(() => { ...; return () => ...; }, []);`.
  - *Its use:* the one real place `App` subscribes to
    `window.chrome.webview`'s own real `message` event, exactly once,
    for its own entire real lifetime.
  - *Type:* a real, top-level React function (a Hook).
  - *Responsibility:* its full real charter is running the given real
    `setup` function once real rendering has committed, and, given a
    real, empty dependency array, never running it again — plus calling
    the real, returned cleanup function if `App` is ever removed.
  - *Depends on:* being called directly inside a real function
    component, the same real rule `useState` (What React Buys You)
    already follows.
  - *Connects to:* its own real `setup` function calls
    `window.chrome.webview.addEventListener` (below); its own real
    cleanup function calls the matching `removeEventListener`.
  - *Shape:* the real, standard React seam for anything a component
    needs to do that isn't purely "compute what to render" —
    `useState` (What React Buys You) is for real, remembered values;
    `useEffect` is for real, external side effects.

- **`window.chrome.webview.addEventListener('message', ...)` /
  `.removeEventListener('message', ...)`**
  - *What it is:* `addEventListener` is reappearing, established Passing
    C# Data to HTML; `removeEventListener` is its real, first-used
    exact-opposite counterpart, unsubscribing a previously-added real
    listener.
  - *Implementation:* real, standard `EventTarget`-family shape,
    established via genuine, fetched WebView2 documentation; used here
    as `window.chrome.webview.addEventListener('message', handleMessage);`
    inside `useEffect`'s own real setup, and
    `window.chrome.webview.removeEventListener('message', handleMessage);`
    inside its own real cleanup function.
  - *Its use:* the real, direct replacement for `local.html`'s own
    former, identically-purposed top-level `addEventListener` call
    (Passing C# Data to HTML) — now scoped inside `App`'s own real
    `useEffect` instead of sitting as loose, top-level script code.
  - *Type:* real, standard `EventTarget` instance methods.
  - *Responsibility:* unchanged from their own real, established
    meaning — registering, and later removing, a real callback for a
    named real event.
  - *Depends on:* `window.chrome.webview` existing at all — true only
    inside a real WebView2-hosted page, established Hosting WebView2 in
    a WPF Window.
  - *Connects to:* `handleMessage`'s own real body calls `setTools`
    (What React Buys You), the one real place incoming C# data reaches
    React's own state.
  - *Shape:* the real, unmodified host↔JS contract this project
    established in Slice 1 — this lesson changes *where* it's called
    from, never *what* it does.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`PostWebMessageAsJson(string)` / `ExecuteScriptAsync(string)`**
  - *What it is:* reappearing, established Passing C# Data to HTML and
    Two-Way Communication Across the Split.
  - *Implementation:* unchanged real shapes.
  - *Its use:* this lesson's own real, second unit removes every real
    `ExecuteScriptAsync($"renderTools(...)")` call from
    `MainWindow.xaml.cs`, replacing each with `PostWebMessageAsJson`
    instead — explained directly in that unit's own real content, since
    it's the actual real code change this lesson makes to the C# side.
  - *Type:* unchanged.
  - *Responsibility:* unchanged.
  - *Depends on:* unchanged.
  - *Connects to:* unchanged.
  - *Shape:* unchanged.
- **`EditRequest` / `Browser_WebMessageReceived` / `ToolRepository.UpdateTool`**
  - *What it is:* reappearing, established Two-Way Communication Across
    the Split and Updating and Deleting Safely.
  - *Implementation:* unchanged.
  - *Its use:* `App`'s own new, real `Edit` button posts the identical
    real `{ action: 'edit', id }` shape this project's own C# side
    already deserializes and acts on — no change needed on the C# side
    of this real flow at all.
  - *Type:* unchanged.
  - *Responsibility:* unchanged.
  - *Depends on:* unchanged.
  - *Connects to:* unchanged.
  - *Shape:* unchanged.

---

## Concept Unit: `useEffect` — Subscribing to the Real Bridge From Inside React

### The Problem

`App` (What React Buys You) currently renders a fixed, real, throwaway
array — nothing connects it to `tools.db`'s own real, live data at all.
`local.html`'s own former, real, top-level `window.chrome.webview
.addEventListener('message', ...)` call (Passing C# Data to HTML) shows
exactly how this project already receives real, live data from C# — but
that real code sat outside of any component, free to run whenever the
script loaded. Where does that same real subscription belong once a
component, not a plain script, owns the page?

> **Try this first:** `useState` (What React Buys You) already proved a
> component can hold a real, persistent value across renders. Given that
> `setTools` (a real function returned by `useState`) is the one real way
> to *update* that value, and given `window.chrome.webview`'s own real
> `message` event is a real, external thing happening outside of
> React's own control entirely, what real mechanism would let an
> incoming real message actually call `setTools` — and why might calling
> `addEventListener` directly inside `App`'s own function body, every
> single time it renders, be the wrong real place to put it?

### Introduce the Concept in Isolation

`React.useEffect`, added directly to the real, permanent `App`
component — this lesson's own real, isolated proof is this exact real
code, run through the identical real Babel/SSR technique already
established (What React Buys You), confirming it transpiles and
evaluates without error, before trusting it against a real WebView2 host:

```jsx
React.useEffect(() => {
    function handleMessage(event) {
        setTools(event.data);
    }
    window.chrome.webview.addEventListener('message', handleMessage);
    return () => window.chrome.webview.removeEventListener('message', handleMessage);
}, []);
```

Real, captured proof (via a minimal, real `window.chrome.webview` shim,
since Node has no real implementation of it): the real Babel transpile
succeeds, and a real, static render with `tools` simulated as
already-populated (standing in for what a genuine `message` event would
have produced, since `useEffect` itself never runs during
`react-dom/server`'s own real static rendering) produces the correct
real table, `Edit` buttons included.

This real, captured evidence proves the Socratic question's own answer
directly: `useEffect`'s own real, empty dependency array (Terms, above)
means this real subscription happens exactly once — not on every real
render, the way calling `addEventListener` directly inside `App`'s own
body would, which would silently pile up a new, real, duplicate listener
every single time `App` re-rendered.

### Discard the Throwaway Example

Not applicable — `useEffect` is added directly to `App`, this project's
own real, permanent component (Concept Isolation Rule; this unit's own
Babel/SSR check is itself the isolated proof, run against the real code
before it's trusted).

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — `ToolDB/react-demo.html`, modified (`tools`
  becomes real state; real `useEffect` subscription added; a real `Edit`
  button and an empty-state message added).
- **Change type** — refactor.
- **Location** — `react-demo.html`'s own `App` component, established
  What React Buys You.
- **Dependencies** — `window.chrome.webview` (established Passing C#
  Data to HTML).

### The New Code

```jsx
const [tools, setTools] = React.useState([]);

React.useEffect(() => {
    function handleMessage(event) {
        setTools(event.data);
    }
    window.chrome.webview.addEventListener('message', handleMessage);
    return () => window.chrome.webview.removeEventListener('message', handleMessage);
}, []);
```

### The Updated Project

`react-demo.html`'s own `App` component, with the real, throwaway
`tools` array replaced by real state, and the real subscription added
directly after it:

```jsx
29  function App() {
30      const [tools, setTools] = React.useState([]);                                       // ← changed
31      const [filter, setFilter] = React.useState("");
32
33      React.useEffect(() => {                                                              // ← new
34          function handleMessage(event) {                                                  // ← new
35              setTools(event.data);                                                         // ← new
36          }                                                                                  // ← new
37          window.chrome.webview.addEventListener('message', handleMessage);                 // ← new
38          return () => window.chrome.webview.removeEventListener('message', handleMessage); // ← new
39      }, []);                                                                               // ← new
40
41      const filteredTools = tools.filter(tool => tool.Name.toLowerCase().includes(filter.toLowerCase()));
42
43      return (
44          <div>
45              <input
46                  value={filter}
47                  onChange={e => setFilter(e.target.value)}
48                  placeholder="Filter by name"
49              />
50              {tools.length === 0 ? (                                                       // ← new
51                  <p>No tools yet.</p>                                                       // ← new
52              ) : (                                                                          // ← new
53                  <table>
54                      <thead>
55                          <tr>
56                              <th>Name</th>
57                              <th>Manufacturer</th>
58                              <th>Overall Diameter</th>
59                              <th>Overall Length</th>
60                              <th>Flute Count</th>
61                              <th>Actions</th>                                               // ← new
62                          </tr>
63                      </thead>
64                      <tbody>
65                          {filteredTools.map(tool => <ToolRow key={tool.Id} tool={tool} />)}
66                      </tbody>
67                  </table>
68              )}                                                                             // ← new
69          </div>
70      );
71  }
```

`ToolRow` itself also gained a real `Edit` button, posting back to C#
directly:

```jsx
17  function ToolRow({ tool }) {
18      return (
19          <tr>
20              <td>{tool.Name}</td>
21              <td>{tool.Manufacturer}</td>
22              <td>{tool.OverallDiameter}</td>
23              <td>{tool.OverallLength}</td>
24              <td>{tool.FluteCount}</td>
25              <td>                                                                          // ← new
26                  <button onClick={() => window.chrome.webview.postMessage({ action: 'edit', id: tool.Id })}>  // ← new
27                      Edit                                                                   // ← new
28                  </button>                                                                  // ← new
29              </td>                                                                          // ← new
30          </tr>
31      );
32  }
```

### Mechanical Walkthrough

- `const [tools, setTools] = React.useState([]);` — `useState`
  (established What React Buys You, reappearing) — the real, initial
  value is now `[]` (empty), not the previous unit's own throwaway array
  — `App` starts knowing nothing, waiting for the real bridge to tell it
  something.
- `React.useEffect(() => { ... }, []);` — `useEffect` (Header, above),
  called with a real, inline arrow-function `setup` and a real, empty
  `[]` dependency array.
- `function handleMessage(event) { setTools(event.data); }` — an
  ordinary real, named function (not anonymous, so it can be referenced
  again by `removeEventListener` below); `event.data` (reappearing,
  established Passing C# Data to HTML — WebView2 itself already parses
  the incoming real JSON, no `JSON.parse` needed) is handed straight to
  `setTools`, requesting a real re-render with the real, current tool
  list.
- `window.chrome.webview.addEventListener('message', handleMessage);` —
  Header, above — the real subscription itself, run once.
- `return () => window.chrome.webview.removeEventListener('message',
  handleMessage);` — the real cleanup function (Terms, above) — `App`
  never actually unmounts in this project's own real, single-page
  WebView2 host, but supplying it is still the real, correct React
  discipline, matching this project's own established habit of real,
  correct resource cleanup (`IDisposable`, established Connecting to a
  Database File) even where a specific real run might not strictly need
  it.
- `onClick={() => window.chrome.webview.postMessage({ action: 'edit', id:
  tool.Id })}` — a real, inline arrow function (reappearing) fired on a
  real, native `click` — `postMessage` (established Two-Way
  Communication Across the Split, reappearing) sends the identical real
  `{ action, id }` shape `Browser_WebMessageReceived` (established Two-Way
  Communication Across the Split) already expects, with no C#-side
  change required at all.

### CS Lens

Scoping a real, external subscription to a component's own real
lifetime, with an explicit, matching real teardown, is a concrete
instance of **resource acquisition tied to a scope** — the same real
principle behind this project's own `using` statement (established
Connecting to a Database File), just expressed through React's own real
`useEffect`/cleanup-function convention instead of a language keyword.
Also recognized in: a real file handle, opened and closed within the
same real block; a real database connection pool's own "borrow, then
return" discipline; a real event-driven GUI toolkit's own "connect a
signal, remember to disconnect it" convention, in any language that
doesn't automate it away.

### SE Lens

Why does `handleMessage` need to be a real, named function, rather than
an inline arrow function passed directly to `addEventListener`, the
same real style this lesson's own `onClick` handler uses? The real
alternative — an inline arrow function — was rejected here for a real,
concrete reason: `removeEventListener` (Header, above) can only remove a
listener it can recognize as the *same* real function reference that was
added; a fresh, inline arrow function passed to `removeEventListener`
would be a real, different function object, and the real, original
listener would never actually be removed. Naming `handleMessage`
explicitly gives both calls the identical real reference to work with.
The real, honest cost stated plainly: this exact real subtlety is easy
to miss, and getting it wrong wouldn't produce a real, loud error —
`removeEventListener` (Header, above) silently does nothing at all if
given a function it doesn't recognize, per real, standard
`EventTarget` behavior, matching this project's own already-noted
`json_valid` finding (JSON Functions in SQLite) that not every real,
incorrect call fails loudly.

### Run It

A real Babel transpile and a real `react-dom/server` static render were
both run this session, for both the default (empty) state and a real,
simulated post-message state, via a real, minimal
`window.chrome.webview` shim. This project's own standing "no live
browser" constraint applies: a genuine WebView2 `message` event was
never actually dispatched to this real code this session. Real source
and captured output saved in
`verification/lesson-34/lab1-bridge-wired-react-real-babel-and-ssr.md`.

### Connecting Back

`App` now genuinely listens for real, live tool data over this
project's own existing bridge, and can post a real edit request back
through it — reusing, unchanged, exactly the same real host↔JS contract
DataTables-based `local.html` already used. The next unit updates the C#
side to actually send it there, and shows one real simplification this
change makes possible.

---

## Concept Unit: One Real Channel Instead of Two

### The Problem

`MainWindow.xaml.cs` currently uses two real, different mechanisms to
reach `local.html`: `PostWebMessageAsJson`, once, right after navigation
completes (Passing C# Data to HTML), and `ExecuteScriptAsync($"renderTools(...)")`,
repeated, for every later real update (Two-Way Communication Across the
Split, Aggregating Many Users' Files Automatically). `App`'s own new,
real `useEffect` subscribes to the real `message` event exactly once,
for its own entire real lifetime — does that change how many real,
different ways C# actually needs to reach it?

> **Try this first:** a real `addEventListener` subscription
> (established Passing C# Data to HTML), once registered, keeps
> receiving every real, subsequent event fired on that same real target
> — it isn't a one-time, single-use subscription. Given that `App`'s own
> real `useEffect` registers exactly one such real, ongoing subscription,
> would a *second*, later real call to `PostWebMessageAsJson` reach it
> just as well as the first one did — and if so, is there still a real
> reason to keep `ExecuteScriptAsync`'s own separate, real
> `renderTools(...)` call around at all?

### Introduce the Concept in Isolation

Not applicable as a separate throwaway lab — this unit's own real
change is a direct, provable consequence of `addEventListener`'s own
already-established, standard, real, ongoing-subscription behavior
(Header, above), not a new mechanism requiring its own isolated proof.

### Discard the Throwaway Example

Not applicable, for the identical real reason.

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml.cs`, modified
  (`MainWindow_Loaded`'s own `Browser.Source`; `FileWatcher_FilesChanged`;
  `RefreshBrowserTableAsync`).
- **Change type** — replace.
- **Location** — `MainWindow.xaml.cs`, established across Passing C#
  Data to HTML, Two-Way Communication Across the Split, and Wiring Live
  Data Into Both UIs.
- **Dependencies** — `react-demo.html` (this lesson's own first unit).

### The New Code

```csharp
string htmlPath = Path.Combine(AppContext.BaseDirectory, "react-demo.html");
Browser.Source = new Uri(htmlPath);
```

```csharp
string json = JsonSerializer.Serialize(tools);
Browser.CoreWebView2.PostWebMessageAsJson(json);
```

### The Updated Project

`MainWindow_Loaded`, now pointing `Browser.Source` at the real React
page instead of the real DataTables one:

```csharp
57  _toolsJson = JsonSerializer.Serialize(tools);
58  _toolCount = tools.Count;
59
60  foreach (Tool tool in tools)
61  {
62      Tools.Add(tool);
63  }
64
65  string htmlPath = Path.Combine(AppContext.BaseDirectory, "react-demo.html");  // ← changed
66  Browser.Source = new Uri(htmlPath);
```

`FileWatcher_FilesChanged` (established Wiring Live Data Into Both
UIs), with its own former `ExecuteScriptAsync` call replaced:

```csharp
72  private async void FileWatcher_FilesChanged(object? sender, EventArgs e)
73  {
74      try
75      {
76          (List<Tool> tools, List<string> errors) = await ToolRepository.FindAllToolsInFolderAsync(AppContext.BaseDirectory);
77
78          Dispatcher.Invoke(() =>
79          {
80              Tools.Clear();
81              foreach (Tool tool in tools)
82              {
83                  Tools.Add(tool);
84              }
85          });
86
87          string json = JsonSerializer.Serialize(tools);
88          Browser.CoreWebView2.PostWebMessageAsJson(json);                        // ← changed
89
90          foreach (string error in errors)
91          {
92              Console.WriteLine($"FindAllToolsInFolderAsync reported: {error}");
93          }
94      }
95      catch (Exception ex)
96      {
97          Console.WriteLine($"FileWatcher_FilesChanged failed: {ex.Message}");
98      }
99  }
```

`RefreshBrowserTableAsync` (established Two-Way Communication Across the
Split), with the identical real change, and no longer genuinely
asynchronous, since `PostWebMessageAsJson` is a real, synchronous call
(unlike `ExecuteScriptAsync`, which returns a real `Task`):

```csharp
1  private Task RefreshBrowserTableAsync()                                          // ← changed
2  {
3      using var connection = new SqliteConnection("Data Source=tools.db");
4      connection.Open();
5
6      using var selectCommand = new SqliteCommand(
7          "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tool_details",
8          connection);
9      using var reader = selectCommand.ExecuteReader();
10
11     List<Tool> tools = new List<Tool>();
12     while (reader.Read())
13     {
14         tools.Add(Tool.FromReader(reader));
15     }
16
17     string json = JsonSerializer.Serialize(tools);
18     Browser.CoreWebView2.PostWebMessageAsJson(json);                             // ← changed
19     return Task.CompletedTask;                                                   // ← new
20 }
```

Every real path that used to call `ExecuteScriptAsync($"renderTools(...)")`
now calls the identical real `PostWebMessageAsJson` call
`Browser_NavigationCompleted` (established Passing C# Data to HTML,
completely unchanged by this lesson) already used for the very first
real load — one real channel, reused for every real update, instead of
two.

### Mechanical Walkthrough

- `string htmlPath = Path.Combine(AppContext.BaseDirectory,
  "react-demo.html");` — `Path.Combine` (established Hosting WebView2 in
  a WPF Window, reappearing) — the one real string literal changed,
  swapping which real file this project's own window actually loads.
- `Browser.CoreWebView2.PostWebMessageAsJson(json);` (in both
  `FileWatcher_FilesChanged` and `RefreshBrowserTableAsync`) —
  `PostWebMessageAsJson` (established Passing C# Data to HTML,
  reappearing) — the identical real method call `Browser_NavigationCompleted`
  already uses for the initial real load, now reused for every real,
  later update too.
- `private Task RefreshBrowserTableAsync()` / `return
  Task.CompletedTask;` — `Task`/`Task.CompletedTask` (established UI/UX
  for Async State, reappearing) — since `PostWebMessageAsJson` is a real,
  synchronous call (unlike the real, `await`-requiring `ExecuteScriptAsync`
  it replaces), this method no longer needs to be `async` at all; it
  still returns a real `Task` — `Task.CompletedTask`, a real, pre-built,
  already-finished `Task` — so its own real caller,
  `Browser_WebMessageReceived`'s own `await RefreshBrowserTableAsync();`
  (established Two-Way Communication Across the Split), needs no change
  at all.

### CS Lens

Collapsing two real, separate mechanisms for "tell the JS side something
changed" into one, once the underlying real subscription model no longer
needs the distinction, is a concrete instance of **removing accidental
complexity** — complexity that existed only because of *how* something
was built (a plain script needing a fresh, imperative call to redraw
itself, versus a one-time-registered listener), not because of anything
genuinely, essentially different about the two real update scenarios
themselves. Also recognized in: a real database migration collapsing two
historically-separate tables into one, once the real business reason for
keeping them apart no longer applies; a real API consolidating two
endpoints that always returned the same real shape into one; this
project's own real
`ToolRepository.FindAllToolsInFolder` (Aggregating Many Users' Files
Automatically) itself, replacing what could have been per-file, hand
-written special cases with one, real, uniform loop.

### SE Lens

Why does this project keep `local.html` and its own DataTables-based
code sitting in the repository at all, rather than deleting it now that
`react-demo.html` is the real, active page? The real alternative —
delete it — was rejected here because `local.html` is not dead, unused
code by accident; it's this project's own real, working record of every
lesson from jQuery Basics through Wiring Live Data Into Both UIs, still
fully correct on its own terms, simply no longer the file
`MainWindow.xaml.cs` happens to load. Deleting it would erase real,
already-verified project history for no real benefit — this project's
own established rm-avoidance convention (Environment & Project Setup
onward) applies here for the identical real reason. The real, honest
cost of keeping it: two real HTML files now exist in this project, and a
future reader has to know which one is actually live (`react-demo.html`)
without being told by the file system itself — mitigated only by this
lesson's own real, written record of exactly when and why the switch
happened.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. `ToolDB.Tests`'s own full suite still passes,
unchanged: **37 tests, 0 failures** — this lesson's own real changes are
entirely inside `MainWindow.xaml.cs`'s own UI-wiring code and
`react-demo.html`, neither covered by this project's own existing,
real, permanent automated tests, consistent with this project's own
standing "no live browser"/"no live WPF window" constraints already
applied to every earlier lesson touching this exact same real code path.

### Connecting Back

`MainWindow` now loads `react-demo.html` as its own real, active page,
reaching it through exactly one real channel —
`PostWebMessageAsJson` — for both the initial real load and every real,
later update, where two separate real mechanisms existed before. The
real bridge itself, and the real persistence layer beneath it, needed no
change at all to make this real swap work.

---

## Connect the Pieces

The same real bridge, traced through both units, and through the real
swap this lesson performs:

1. `App` gained a real `useEffect` subscription to
   `window.chrome.webview`'s own real `message` event, replacing its own
   throwaway static array with genuine, real, live state — and a real
   `Edit` button, posting back through the identical real channel
   Two-Way Communication Across the Split already established (Unit 1).
2. `MainWindow.xaml.cs` was updated to load `react-demo.html` instead of
   `local.html`, and every real path that used to call
   `ExecuteScriptAsync($"renderTools(...)")` now reuses the same real
   `PostWebMessageAsJson` call the initial load already relied on — one
   real channel instead of two, made possible by React's own real,
   persistent event subscription, not by any change to the bridge itself
   (Unit 2).

**Slice 8 is complete.** This project's own real Architecture claim —
"swapping a WebView2 screen's presentation layer... doesn't change the
bridge contract or the persistence layer underneath it" — has now been
proven directly, not just stated: `ToolRepository`, `EditRequest`, and
every real C# method `Browser_WebMessageReceived` calls are completely
unchanged from before this slice began. **Next lesson:** 35 — Window &
App Lifecycle, Packaging (`dotnet publish`, WebView2 runtime
distribution) — the start of Slice 9.
