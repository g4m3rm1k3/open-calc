# Lesson 18: The Bridge Was Only Ever One-Way

**What you will build.** `local.html`'s own table gains a real `Edit`
button per row; clicking it sends a real message *from* JavaScript *to*
C#, the exact direction this project has never used — every message so
far (Lesson 7 onward) has flowed the other way. C# receives it, looks up
the real tool, opens `ToolEditDialog` (Lesson 17), and — if saved —
persists the edit and calls back into JavaScript through
`ExecuteScriptAsync`, refreshing the real table with no page reload at
all. The transferable problem underneath the feature is a real promise
this project made and deferred twice already: Lesson 7's own Header
named `WebMessageReceived` directly and stated the reverse direction
"is deliberately deferred to Lesson 18." This lesson is where that
promise is kept — and, in building it for real, two genuine bugs surface
and get fixed, not invented for the occasion.

**What you need to know first.** Lesson 7 — `window.chrome.webview
.addEventListener('message', ...)`, `PostWebMessageAsJson`, JSON crossing
the C#↔JS boundary. Lesson 11 — DataTables, `$('#tools-table').DataTable()`.
Lesson 14 — `SqliteTransaction`. Lesson 17 — `ToolEditDialog`,
`ToolEditViewModel`, `ToolRepository.UpdateTool`.

**A real, still-open debt, named directly rather than quietly repeated:**
`WebMessageReceived` (below) is, like `CoreWebView2InitializationCompleted`
and `CoreWebView2NavigationCompletedEventArgs` before it, shaped
`EventHandler<TEventArgs>` — a generic type. Lesson 6's own real notes
already flagged that this project owes full, from-zero generics coverage
"whenever `TEventArgs`-shaped code reappears... don't treat this lesson's
light treatment as already covered." It reappears again here, still not
given that full treatment — this lesson names the debt again rather than
silently letting it look resolved.

**Terms used in this lesson**

- **event delegation (jQuery)** — attaching one real event handler to a
  stable, already-existing parent element, naming which of its own future
  descendants it should actually fire for, rather than attaching a
  separate handler to each individual descendant directly. It exists
  because `#tools-table`'s own `<tbody>` is rebuilt from scratch (Lesson
  11's own `renderTools`) every time real data arrives — a handler
  attached directly to one specific `<button>` would be destroyed and
  never reattached the moment that button's own row is replaced; a
  handler attached to `<tbody>` itself, naming `button.edit-tool` as the
  real selector to delegate to, keeps working no matter how many times
  the real rows underneath it are rebuilt.
- **host↔JS contract** — the real, agreed shape of data crossing the
  C#↔JS boundary in either direction — not enforced by any compiler on
  either side, since JSON is untyped from JavaScript's own perspective and
  C#'s own static types only apply after real deserialization succeeds.
  This lesson's own new contract, JS→host: a real JSON object with two
  real fields, `action` and `id`.
- **bridge round trip** — one complete, real cycle: a user's own real
  action in JavaScript causing a real change in C#, which is then
  reflected back into JavaScript again — this lesson's own first
  genuinely complete instance of this full cycle in either direction.

**Objects and methods used**

- **`.on()` with a delegated selector**
  - *What it is:* `.on()` (established Lesson 10) reappearing with a real,
    second argument this project hasn't used before — a selector string
    naming which future, not-yet-existing descendants the handler applies
    to.
  - *Implementation:* per jQuery's own official documentation (already
    cited in full, Lesson 10), `.on()`'s own real signature is `.on(
    events [, selector] [, data], handler)` — Lesson 10's own code used
    only `events`/`handler`; this lesson's own new code is the first to
    supply the optional, real `selector` parameter between them.
  - *Its use:* `` $('#tools-table tbody').on('click', 'button.edit-tool',
    function () { ... }); ``, this lesson's own first unit.
  - *Type:* the identical real jQuery instance method already established
    (Lesson 10).
  - *Responsibility:* watch for the named real event anywhere inside the
    element it's called on, but only actually invoke the handler when the
    real element the event happened on matches the given selector —
    including elements that didn't exist yet when `.on()` itself was
    called.
  - *Depends on:* a real, stable ancestor element (`#tools-table tbody`)
    that itself is never replaced, even though its own real children are,
    every time `renderTools` (Lesson 11) runs.
  - *Connects to:* fires for every real `<button class="edit-tool">`
    this lesson's own `renderTools` produces, present now or added later,
    with no additional binding step ever required again.
  - *Shape:* the real, general-purpose fix for exactly the problem
    directly-bound handlers have against dynamically-rebuilt content —
    the identical real content `renderTools` already rebuilds from
    scratch on every real data refresh (Lesson 11).
- **`window.chrome.webview.postMessage`**
  - *What it is:* this lesson's own new subject — sends a real message
    from JavaScript to the C# host, the reverse of `addEventListener
    ('message', ...)`'s own direction (Lesson 7).
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session, cited directly against the real event it triggers,
    below), calling it with any real object "supported by JSON
    conversion" causes that object to be converted to a real JSON string
    and delivered to the host's own `WebMessageReceived` event (below).
  - *Its use:* `` window.chrome.webview.postMessage({ action: 'edit', id:
    id }); ``, this lesson's own first unit — a real, two-field object,
    this lesson's own host↔JS contract (Terms, above).
  - *Type:* a real method on `window.chrome.webview` — the identical real
    object whose own `addEventListener` this project has called since
    Lesson 7, now used for its other real real capability.
  - *Responsibility:* hand a real JavaScript value across the process
    boundary to C#, converted to JSON — nothing about what the host does
    with it afterward.
  - *Depends on:* a real value JSON conversion can actually handle — the
    same real constraint `JsonSerializer.Serialize` already has on the C#
    side (Lesson 7).
  - *Connects to:* every real call raises `WebMessageReceived` (below) on
    the C# side, in the same real order calls were made, per that same
    documentation.
  - *Shape:* the JS→host half of the same real bridge Lesson 7 only ever
    built the host→JS half of.
- **`CoreWebView2.WebMessageReceived`**
  - *What it is:* this lesson's own new subject — the real, C#-side event
    `postMessage` raises.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), its real declared shape is `public event
    EventHandler<CoreWebView2WebMessageReceivedEventArgs>
    WebMessageReceived` — raised "when... the top-level document of the
    WebView runs `window.chrome.webview.postMessage`."
  - *Its use:* `Browser.CoreWebView2.WebMessageReceived +=
    Browser_WebMessageReceived;`, subscribed inside
    `Browser_CoreWebView2InitializationCompleted` (established Lesson 6) —
    only once `CoreWebView2` itself genuinely exists (Lesson 6's own real,
    proven timing lesson).
  - *Type:* a real, standard .NET event, `EventHandler<TEventArgs>`
    (Lesson 6's own still-owed generics debt, restated above).
  - *Responsibility:* invoke every subscribed handler, in order, each real
    time the WebView's own top-level document calls `postMessage`.
  - *Depends on:* `IsWebMessageEnabled` (a real `CoreWebView2Settings`
    property, on by default, not changed by this project) and a real,
    already-initialized `CoreWebView2`.
  - *Connects to:* its own real event args (below) is what
    `Browser_WebMessageReceived`, this lesson's own new handler, actually
    reads.
  - *Shape:* the exact real event Lesson 7's own Header named and
    deferred — this lesson is where that forward reference resolves.
- **`CoreWebView2WebMessageReceivedEventArgs.WebMessageAsJson`**
  - *What it is:* the real property carrying `postMessage`'s own real
    payload, already converted to JSON.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), it "gets the message posted from the WebView content
    to the host converted to a JSON string."
  - *Its use:* `JsonSerializer.Deserialize<EditRequest>(e.WebMessageAsJson,
    options)`, this lesson's own second unit.
  - *Type:* a real, read-only `string` property.
  - *Responsibility:* hand back the exact real JSON text `postMessage`'s
    own object was converted into — nothing about parsing or
    interpreting it further.
  - *Depends on:* a real `WebMessageReceived` event already having fired.
  - *Connects to:* read once, by this lesson's own handler, and passed
    directly into `JsonSerializer.Deserialize` (established Lesson 7).
  - *Shape:* the JS→host counterpart to `PostWebMessageAsJson`'s own
    string parameter (Lesson 7) — JSON text crossing the boundary in the
    opposite real direction.
- **`JsonSerializerOptions.PropertyNameCaseInsensitive`**
  - *What it is:* this lesson's own new subject — a real, settable option
    controlling whether `JsonSerializer.Deserialize` matches a real JSON
    property name to a C# property name regardless of letter case.
  - *Implementation:* proven directly, for real, this session (this
    lesson's own second unit) — with no options set at all,
    deserializing `{"action":"edit","id":5}` into a real `EditRequest`
    (below) leaves both fields at their real, unset defaults (`""`, `0`);
    setting `PropertyNameCaseInsensitive = true` on a real
    `JsonSerializerOptions` instance, passed as `Deserialize`'s own second
    argument, correctly populates both.
  - *Its use:* `new JsonSerializerOptions { PropertyNameCaseInsensitive =
    true }`, this lesson's own second unit.
  - *Type:* a real, settable `bool` property on `JsonSerializerOptions`
    (established Lesson 16, reappearing).
  - *Responsibility:* change exactly one thing about how
    `JsonSerializer.Deserialize` matches real JSON keys to real C#
    property names — nothing about value conversion itself.
  - *Depends on:* being set before `Deserialize` is called — it's read
    once, at deserialization time.
  - *Connects to:* every real JSON message this lesson's own `postMessage`
    call sends, since JavaScript's own real object-literal convention
    (lowercase `action`/`id`) will never match C#'s own real property-
    naming convention (`Action`/`Id`) without it.
  - *Shape:* the real, one-line fix for a genuine, silent bug this
    lesson's own second unit proves happened, not merely warns might.
- **`CoreWebView2.ExecuteScriptAsync`**
  - *What it is:* this lesson's own culminating subject — runs a real,
    literal string of JavaScript inside the WebView's own current
    document, from C#.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), its real declared shape is `public Task<string>
    ExecuteScriptAsync(string javaScript)`, returning "a JSON encoded
    string that represents the result of running the provided
    JavaScript."
  - *Its use:* `` Browser.CoreWebView2.ExecuteScriptAsync($"renderTools
    ({json})"); ``, this lesson's own third unit — calling a real, named
    JS function (`renderTools`, this lesson's own refactor of Lesson 11's
    own inline rendering logic) directly, by building a literal call
    expression as a string.
  - *Type:* a real instance method on `CoreWebView2`, returning a real
    `Task<string>`.
  - *Responsibility:* hand a literal string of real JavaScript to the
    WebView's own JavaScript engine and run it, whatever it contains —
    a single named function call, in this lesson's own case, but the
    method itself has no idea that's structurally any different from
    arbitrary script.
  - *Depends on:* a real, already-initialized `CoreWebView2`, and,
    implicitly, that the named function it calls (`renderTools`) already
    exists in the currently-loaded document.
  - *Connects to:* the real JSON this lesson's own code builds via
    `JsonSerializer.Serialize` (established Lesson 7) is embedded directly
    into the literal script string passed here — a real, second use of
    JSON crossing the boundary, host→JS, alongside `PostWebMessageAsJson`
    (Lesson 7)'s own, different mechanism for the identical direction.
  - *Shape:* a real, second host→JS channel, distinct from
    `PostWebMessageAsJson` — that one delivers data to a `message` event
    listener; this one runs an arbitrary, named function call directly,
    useful specifically because this lesson's own refresh needs to call
    *the same* rendering logic the initial `message` handler already
    uses, not fire a fresh `message` event a second time.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`EditRequest`**
  - *What it is:* a real, new, minimal class this lesson adds — the C#
    shape `postMessage`'s own real JSON is deserialized into.
  - *Implementation:* two real, plain, mutable properties, `Action`
    (`string`) and `Id` (`int`) — deliberately mutable (unlike `Tool`,
    Lesson 8), since `JsonSerializer.Deserialize` (established Lesson 7)
    needs real property setters to populate an object from real JSON.
  - *Its use:* the real target type for this lesson's own
    `JsonSerializer.Deserialize` call, this lesson's own second unit.
- **`renderTools`**
  - *What it is:* a real, new, named JavaScript function this lesson
    factors Lesson 11's own inline rendering logic into.
  - *Implementation:* the identical real loop, `.push()`/`.join()`, and
    `$('#tools-table').DataTable(...)` call Lesson 11 already established
    — moved into its own named function so it can be called from two real
    places instead of one.
  - *Its use:* called once from the existing `message` handler (Lesson
    7), and a second time, this lesson's own third unit, via
    `ExecuteScriptAsync`.

---

## Concept Unit: JS→Host — `postMessage` and Event Delegation

### The Problem

`#tools-table`'s own real rows (Lesson 11) show real data, but nothing on
them is clickable in a way that reaches C# — every real message this
project has ever sent has gone host→JS (Lesson 7); nothing has ever gone
the other way.

> **Try this first:** Lesson 11's own `renderTools` rebuilds
> `#tools-table`'s own entire `<tbody>` from scratch every time real data
> arrives — every `<tr>` this lesson's own new `Edit` button would sit
> inside is genuinely destroyed and recreated, not merely hidden, on every
> real refresh. Given a plain, direct `$('button.edit-tool').on('click',
> ...)` call (the shape Lesson 10 already established) only attaches to
> elements that exist at the exact moment it runs — what real, structural
> problem would that create for a button inside rows that don't exist yet
> when the page first loads, and get replaced every time `renderTools` runs
> again?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/local.html`, modified.
  `ToolDB/MainWindow.xaml.cs`, modified.
- **Change type** — add (an `Edit` button per row, one delegated click
  handler); add (one new event subscription).
- **Location** — `local.html`'s own `renderTools` function (established
  Lesson 11) and its own `<script>` block; `MainWindow.xaml.cs`'s own
  `Browser_CoreWebView2InitializationCompleted` (established Lesson 6).
- **Dependencies** — `#tools-table`'s own real markup (Lesson 11);
  `CoreWebView2` already initialized (Lesson 6).

### The New Code

```javascript
rows.push(`<tr><td>${tool.Name}</td><td>${tool.Manufacturer}</td><td>${tool.OverallDiameter}</td><td>${tool.OverallLength}</td><td>${tool.FluteCount}</td><td><button class="edit-tool" data-id="${tool.Id}">Edit</button></td></tr>`);
```

```javascript
$('#tools-table tbody').on('click', 'button.edit-tool', function () {
    const id = $(this).data('id');
    window.chrome.webview.postMessage({ action: 'edit', id: id });
});
```

```csharp
Browser.CoreWebView2.WebMessageReceived += Browser_WebMessageReceived;
```

### The Updated Project

`local.html`'s own `<script>` block, in full, new/changed lines marked:

```html
 1  <script>
 2      let tools = [];
 3
 4      function renderTools(newTools) {                                                                                                                                          // ← changed
 5          tools = newTools;                                                                                                                                                     // ← changed
 6
 7          const rows = [];
 8          for (const tool of tools) {
 9              rows.push(`<tr><td>${tool.Name}</td><td>${tool.Manufacturer}</td><td>${tool.OverallDiameter}</td><td>${tool.OverallLength}</td><td>${tool.FluteCount}</td><td><button class="edit-tool" data-id="${tool.Id}">Edit</button></td></tr>`);  // ← changed
10          }
11          $('#tools-table tbody').html(rows.join(''));
12
13          $('#tools-table').DataTable({ destroy: true });                                                                                                                       // ← changed
14      }                                                                                                                                                                          // ← changed
15
16      window.chrome.webview.addEventListener('message', event => {
17          renderTools(event.data);                                                                                                                                              // ← changed
18          $('#output').text(
19              `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})`
20          );
21      });
22
23      $('#show-count').on('click', () => {
24          $('#output').text(`${tools.length} tool(s) loaded.`);
25      });
26
27      $('#tools-table tbody').on('click', 'button.edit-tool', function () {                                                                                                     // ← new
28          const id = $(this).data('id');                                                                                                                                        // ← new
29          window.chrome.webview.postMessage({ action: 'edit', id: id });                                                                                                        // ← new
30      });                                                                                                                                                                        // ← new
31  </script>
```

`local.html`'s own rendering logic is now a real, named function,
`renderTools` (lines 4–14, the identical real loop and DataTables call
Lesson 11 already established, plus this lesson's own new `<button>`
markup and the `destroy: true` option, this lesson's own third unit).
The `message` handler (lines 16–21) calls it instead of inlining the loop
directly, and a real, new, delegated click handler (lines 27–30) reaches
every current and future `Edit` button.

`MainWindow.xaml.cs`'s own `Browser_CoreWebView2InitializationCompleted`,
in full, new line marked:

```csharp
1  private void Browser_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)
2  {
3      if (e.IsSuccess)
4      {
5          Console.WriteLine("CoreWebView2 initialized successfully.");
6          Browser.CoreWebView2.WebMessageReceived += Browser_WebMessageReceived;  // ← new
7      }
8      else
9      {
10         Console.WriteLine($"CoreWebView2 failed to initialize: {e.InitializationException}");
11     }
12 }
```

The identical real timing reasoning Lesson 6 already established for
`Browser.Source` applies here too: this subscription is added only once
`CoreWebView2InitializationCompleted` confirms `CoreWebView2` genuinely
exists, never earlier.

### Proving It in Isolation

No throwaway example exists for this unit's own delegated-click mechanism
— jQuery's own real documentation for `.on()`'s own delegated-selector
form (Header, above) is already the direct, cited proof of how it
differs from the plain form Lesson 10 established; a throwaway version
would repeat that lesson's own real button/click proof with an added
selector argument, demonstrating nothing new about *this* project's own
real, rebuilding-table scenario specifically.

### Discard the Throwaway Example

Not applicable, for the reason stated above.

### Mechanical Walkthrough

- `<button class="edit-tool" data-id="${tool.Id}">Edit</button>` — a real
  `<button>` (established Lesson 13's own WPF `Button`, but this one is
  plain HTML, established Lesson 10), given a real `class` attribute
  (first appearing in this project — a real, plain-text attribute jQuery
  selectors can match by, the same way `#id` already does) and a real
  `data-id` attribute (first appearing — a real, standard HTML mechanism
  for attaching arbitrary data to an element, read back later via
  jQuery's own `.data()`).
- `` $('#tools-table tbody').on('click', 'button.edit-tool', function ()
  { ... }); `` — `.on()` with a delegated selector (Header, above) — the
  handler is attached once, to the real, stable `<tbody>`, but only
  actually runs when a real click's own target matches
  `button.edit-tool` — a real compound selector (established Lesson 12's
  own CSS selector syntax) naming a `<button>` carrying that exact class.
- `$(this).data('id')` — `$(this)` wraps the real, specific button that
  was actually clicked (`this`, inside a jQuery delegated handler, real
  and set to that exact matched element, not `#tools-table tbody`
  itself); `.data('id')` (first appearing in this project) reads the
  real `data-id` attribute back as a real value.
- `window.chrome.webview.postMessage({ action: 'edit', id: id });` —
  `postMessage` (Header, above), called with a real, plain JavaScript
  object literal — two real fields, `action` and `id` — this lesson's own
  host↔JS contract (Terms, above).
- `Browser.CoreWebView2.WebMessageReceived += Browser_WebMessageReceived;`
  — `WebMessageReceived` (Header, above), a real `+=` subscription
  (established Lesson 5), the identical real shape every other WebView2
  event in this project already uses.

### CS Lens

Attaching one real handler to a stable ancestor, and letting it decide,
per real event, whether a specific descendant actually matches, is a
specific instance of **event bubbling** exploited deliberately — the
browser's own real mechanism where an event fired on a specific element
also triggers on every real ancestor, in order, unless something stops
it. Also recognized in: a building's own single fire alarm panel
reacting to any one of many individual smoke detectors, without a
separate alarm system per detector, a company's own general customer-
service line routing any specific complaint to the right department after
the fact, rather than requiring callers to already know which extension
to dial, and this project's own real WebView2 `Browser`, a single control
receiving every real navigation/message/initialization event regardless
of which specific piece of content inside it caused it.

### SE Lens

Why send `{ action: 'edit', id: id }` — a real, two-field object naming
*what* action is requested, alongside *which* tool — rather than just
`postMessage(id)`, sending the bare real number alone? The alternative not
chosen — a bare id — was rejected because this lesson's own real host↔JS
contract (Terms, above) would then have no way to grow: this project's
own real roadmap already plans a future *delete* action, and possibly
others, all needing to reach the identical real `WebMessageReceived`
event; a bare number gives C# no real way to tell "edit tool 5" from
"delete tool 5" apart. The honest cost: every real message now needs a
real, agreed-upon `action` field checked before anything else happens,
one small piece of real parsing this project didn't need when only one
kind of message existed at all.

### Run It

A real `dotnet build` was run this session against the actual, modified
files: build succeeded, 0 Warnings, 0 Errors. This project's own standing
constraint (no live WPF window observed this session) applies to
watching a real click actually reach C# through this exact chain — what's
verified for real instead is jQuery's own official, fetched documentation
for `.on()`'s own delegated-selector form (Lesson 10's own citation,
restated in full here), and a real, clean build confirming
`Browser_WebMessageReceived` (this lesson's own second unit) compiles
against the real, fetched `WebMessageReceived` event signature.

### Connecting Back

A real click can now reach C#, in principle — but nothing yet reads what
it actually sent, or does anything with it. The next unit is where a
real, deliberate bug surfaces in exactly that step.

---

## Concept Unit: A Real, Broken Contract — Case-Sensitive JSON

### The Problem

JavaScript's own real object literal, `{ action: 'edit', id: id }`,
writes its own two real field names in lowercase — ordinary JavaScript
convention. C#'s own real `EditRequest` class, matching this project's
own established convention (`Tool`, `AboutViewModel`, Lesson 8/16), names
its own properties `Action`/`Id`, in PascalCase. Nothing yet has checked
whether `JsonSerializer.Deserialize` actually reconciles the two.

> **Try this first:** Lesson 7's own real, fetched documentation already
> established that `System.Text.Json` treats HTML-sensitive characters
> with real, deliberate care by default — a real sign this library, in
> general, doesn't silently do the convenient thing. Given that, and
> given nothing in this project has explicitly told `JsonSerializer
> .Deserialize` that `action` and `Action` should be treated as the same
> real name, what would you predict happens, concretely, to
> `EditRequest.Action` and `EditRequest.Id` after deserializing
> `{"action":"edit","id":5}` with no special options set at all — a
> real exception, or something quieter?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/EditRequest.cs`, created.
  `ToolDB/MainWindow.xaml.cs`, modified.
  `ToolDB.Tests/EditRequestTests.cs`, created.
- **Change type** — add (one new class); add (one new event handler,
  `Browser_WebMessageReceived`, and two new private helpers); add (two
  new real, permanent tests).
- **Location** — `EditRequest.cs`, a new file; `MainWindow.xaml.cs`,
  alongside its own existing handlers.
- **Dependencies** — this lesson's own first unit's real
  `WebMessageReceived` subscription.

### The New Code

```csharp
public class EditRequest
{
    public string Action { get; set; } = "";
    public int Id { get; set; }
}
```

```csharp
var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
var request = JsonSerializer.Deserialize<EditRequest>(e.WebMessageAsJson, options);
```

### The Updated Project

`ToolDB/EditRequest.cs`, in full (a brand-new file):

```csharp
1  public class EditRequest
2  {
3      public string Action { get; set; } = "";
4      public int Id { get; set; }
5  }
```

`ToolDB/MainWindow.xaml.cs`'s own new handler and helper, in full:

```csharp
 1  private void Browser_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
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
38          RefreshBrowserTable();
39      }
40  }
41
42  private Tool? FindToolById(int id)
43  {
44      using var connection = new SqliteConnection("Data Source=tools.db");
45      connection.Open();
46
47      using var selectCommand = new SqliteCommand(
48          "SELECT tools.id, tools.name, vendors.name, tools.overall_diameter, tools.overall_length, tools.flute_count FROM tools JOIN vendors ON tools.vendor_id = vendors.id WHERE tools.id = @id",
49          connection);
50      selectCommand.Parameters.AddWithValue("@id", id);
51      using var reader = selectCommand.ExecuteReader();
52
53      if (reader.Read())
54      {
55          return Tool.FromReader(reader);
56      }
57
58      return null;
59  }
```

`Browser_WebMessageReceived` now does five real things in order: parse
the real message (line 4, with the fix this unit's own real bug required),
confirm it's really an `edit` request (line 5), look up the real tool by
id (line 10), show `ToolEditDialog` (established Lesson 17) and wait for
a real result, and, only if genuinely saved, persist the edit inside a
real transaction (established Lesson 14) and refresh the browser (this
lesson's own third unit).

### Proving It in Isolation

A minimal, real, isolated repro of the case-sensitivity behavior, before
it meets this project's own real message handler:

```csharp
var json = "{\"action\":\"edit\",\"id\":5}";

var requestDefault = JsonSerializer.Deserialize<EditRequest>(json);
Console.WriteLine($"Default options -> Action: '{requestDefault?.Action}', Id: {requestDefault?.Id}");

var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
var requestFixed = JsonSerializer.Deserialize<EditRequest>(json, options);
Console.WriteLine($"PropertyNameCaseInsensitive -> Action: '{requestFixed?.Action}', Id: {requestFixed?.Id}");
```

Run for real this session:

```
Default options -> Action: '', Id: 0
PropertyNameCaseInsensitive -> Action: 'edit', Id: 5
```

This real, captured output proves the Socratic question's own prediction:
`JsonSerializer.Deserialize`, with no options set, doesn't throw at all —
it silently leaves `Action`/`Id` at their own real default values (`""`,
`0`), because `"action"`/`"id"` (lowercase, real JSON) never match
`Action`/`Id` (PascalCase, real C#) without being told to ignore case.
This is a genuinely dangerous real shape of bug: no exception, no crash,
just silently wrong data — exactly the kind of "debugging a broken round
trip" this project's own roadmap named for this lesson.

### Discard the Throwaway Example

The isolated example above is discarded now — its own real behavior is
proven a second time, permanently, in `ToolDB.Tests/EditRequestTests.cs`
(this unit's own real, passing tests), against this project's own real
`EditRequest` class rather than a throwaway one.

### Mechanical Walkthrough

- `public class EditRequest { public string Action { get; set; } = "";
  public int Id { get; set; } }` — a real, plain class, deliberately
  mutable (unlike `Tool`, Lesson 8) — `JsonSerializer.Deserialize`
  (established Lesson 7) needs real, settable properties to populate an
  object from real JSON; an `init`-only or record shape would work
  identically here, but this project already has an established, plain-
  mutable-class convention for exactly this kind of small, JSON-only DTO
  (none yet in this project, but the pattern matches ordinary C# practice
  this reader already has enough context to follow).
- `new JsonSerializerOptions { PropertyNameCaseInsensitive = true }` —
  `JsonSerializerOptions` (established Lesson 16), reappearing, this
  lesson's own new property set on it, `PropertyNameCaseInsensitive`
  (Header, above) — a real object-initializer (established Lesson 4/8)
  setting exactly one option.
- `JsonSerializer.Deserialize<EditRequest>(e.WebMessageAsJson, options)` —
  `JsonSerializer.Deserialize` (established Lesson 7), reappearing with a
  real, second argument this project hasn't passed before — the real
  `options` object just built, controlling matching behavior for this one
  real call.
- `if (request is null || request.Action != "edit") { return; }` — a real
  `is null` pattern (established this project's own nullable-reference
  conventions, Lesson 13) guarding against a real, malformed message;
  `!=` (established since this project's own earliest lessons) compares
  the real, deserialized `Action` against the literal string `"edit"` —
  this lesson's own contract check.
- `Tool? tool = FindToolById(request.Id);` — a real, new private method,
  querying `tools.db` for exactly one real row by its own real `id` —
  the identical real `SqliteConnection`/`SqliteCommand`/parameterized
  `WHERE` shape (established Lesson 1–4, 14) this project has used
  throughout, narrowed to a single row this time.
- `var dialog = new ToolEditDialog(tool); dialog.Owner = this; bool?
  result = dialog.ShowDialog();` — the identical real dialog-opening
  shape Lesson 13 already established for `AboutDialog`, reused here for
  `ToolEditDialog` (Lesson 17) — `result`, a real `bool?` (established
  Lesson 13's own citation of `ShowDialog()`'s real return type),
  captured this time since this lesson's own code needs to act
  differently depending on it.
- `ToolRepository.UpdateTool(connection, transaction, tool.Id,
  dialog.ViewModel.Name, dialog.ViewModel.OverallDiameter, dialog
  .ViewModel.OverallLength, dialog.ViewModel.FluteCount);` — the real
  method Lesson 17 already established, called here for the first time
  from real, live application code rather than only from a test —
  `dialog.ViewModel` (Lesson 17's own public property) is where this
  lesson's own code reads back whatever the user actually edited.

### CS Lens

A message crossing a real boundary with no compiler on either side
checking that both parties agree on its own shape — proven here to fail
silently, not loudly, when they don't — is a specific instance of an
**untyped contract**: correctness depends entirely on both sides agreeing
by convention, not by any enforced type system spanning both. Also
recognized in: this project's own real `tools.db` schema itself (Lesson
2) — SQLite's own real, dynamic typing already let a wrong-shaped value
slip in without complaint, until Lesson 15's own real `CHECK`/`NOT NULL`
constraints started actually enforcing it — and any real network API
where a client and server independently agree on a JSON shape with no
shared compiler checking either side honors it.

### SE Lens

Why fix this with a real, one-line `PropertyNameCaseInsensitive = true`,
rather than renaming `EditRequest`'s own real properties to lowercase
(`action`/`id`) to match JavaScript's own convention directly? The
alternative not chosen — lowercase C# properties — was rejected because
it would violate this project's own established, universal PascalCase
convention (`Tool`, `AboutViewModel`, `ToolEditViewModel`, all Lesson 8,
16, 17) for the sake of one single class, making `EditRequest` look
foreign next to every other real class in this codebase just to avoid one
real configuration option. The honest cost of the chosen fix instead:
every future JSON message this project ever deserializes from JavaScript
needs the identical real option remembered and passed again — nothing
about `JsonSerializer.Deserialize`'s own default behavior protects a
future author who forgets it, the same real, silent failure this unit's
own isolated proof already demonstrated once.

### Run It

A real `dotnet build` was run this session against the actual new and
modified files: build succeeded, 0 Warnings, 0 Errors. The isolated
example above was run for real this session with `dotnet run`, real
output shown and quoted above; source is saved in this project's own
`verification/lesson-18/` folder (`lab2-json-case-sensitivity.cs`). A
real `dotnet test` confirmed two new, permanent, passing tests in
`ToolDB.Tests/EditRequestTests.cs` — one proving the real, broken default
behavior still reproduces exactly as shown, one proving the real fix
— alongside every one of this project's own existing tests: sixteen
total, zero failures.

### Connecting Back

A real message from JavaScript now correctly becomes a real C# object,
opens the correct real dialog for the correct real tool, and, if saved,
persists the edit — proven, not merely hoped, to survive the one real,
silent way this exact round trip was shown to actually break. The final
unit closes the loop back into the browser itself.

---

## Concept Unit: `ExecuteScriptAsync` — Calling Back Into JS After a Save

### The Problem

`ToolRepository.UpdateTool` (this lesson's own second unit) already
persists a real edit to `tools.db` — but `#tools-table` itself, still
showing whatever it rendered when the page first loaded, has no way to
know anything changed at all.

> **Try this first:** `renderTools` (this lesson's own first unit) is
> already a real, named, callable JavaScript function, not just inline
> code inside one handler. Given `ExecuteScriptAsync` (Header, above)
> runs any real, literal string of JavaScript inside the page, and given
> C# already has real, fresh data the instant `UpdateTool` commits — what
> literal string of JavaScript would let C# call `renderTools` directly,
> handing it real, fresh data, without needing a second `message` event
> at all?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml.cs`, modified.
- **Change type** — add (one new private method, `RefreshBrowserTable`).
- **Location** — alongside `FindToolById` (this lesson's own second
  unit), called from `Browser_WebMessageReceived`'s own real, successful-
  save branch.
- **Dependencies** — `renderTools` (this lesson's own first unit); a real,
  successful `ToolRepository.UpdateTool` call.

### The New Code

```csharp
private void RefreshBrowserTable()
{
    using var connection = new SqliteConnection("Data Source=tools.db");
    connection.Open();

    using var selectCommand = new SqliteCommand(
        "SELECT tools.id, tools.name, vendors.name, tools.overall_diameter, tools.overall_length, tools.flute_count FROM tools JOIN vendors ON tools.vendor_id = vendors.id",
        connection);
    using var reader = selectCommand.ExecuteReader();

    List<Tool> tools = new List<Tool>();
    while (reader.Read())
    {
        tools.Add(Tool.FromReader(reader));
    }

    string json = JsonSerializer.Serialize(tools);
    Browser.CoreWebView2.ExecuteScriptAsync($"renderTools({json})");
}
```

### The Updated Project

`MainWindow.xaml.cs`'s own `RefreshBrowserTable`, already shown in full
above as new code — called from `Browser_WebMessageReceived`'s own real
line 38 (this lesson's own second unit's own "Updated Project" listing),
the final step of a real, successful edit.

### Proving It in Isolation

No throwaway example exists for `ExecuteScriptAsync`'s own core mechanic
— building a literal call-expression string and handing it to a real
method is already the smallest possible demonstration; a throwaway
version calling some other named JS function would prove nothing this
lesson's own real code doesn't already show directly. What genuinely
needs isolating instead is a real, surprising claim about this exact
call's own compiler behavior, proven directly rather than assumed:
`ExecuteScriptAsync`'s own real return value, `Task<string>` (Header,
above), is discarded in the code above with no `await` at all — exactly
the kind of statement C#'s own compiler is documented to flag with a
real `CS4014` warning ("this call is not awaited"). A real, clean
`dotnet build` of this exact file, this session, produces **no** such
warning — a real, genuine surprise worth actually explaining, not
shrugging off.

Two real, isolated, side-by-side throwaway builds this session explain
why:

```csharp
// Version A: the callee IS declared `async`
async Task<string> DoSomethingAsync()
{
    await Task.Delay(10);
    return "done";
}
```

```csharp
// Version B: identical declared return type, Task<string>, but the
// callee is NOT declared `async` — it just builds and returns one
Task<string> DoSomethingAsync()
{
    return Task.FromResult("done");
}
```

Calling either one the identical way — `o.Inner.DoSomethingAsync();`, no
`await`, result discarded — produces two genuinely different real
outcomes. Version A's own real build output:

```
warning CS4014: Because this call is not awaited, execution of the
current method continues before the call is completed. Consider
applying the 'await' operator to the result of the call.
```

Version B's own real build output:

```
Build succeeded. 0 Warning(s). 0 Error(s).
```

This real, side-by-side comparison proves `CS4014`'s own actual trigger:
whether the *callee* is itself declared with the `async` keyword — not
merely whether its own declared return type is `Task<T>`, which is
identical in both versions above. `ExecuteScriptAsync` is real, official
WebView2 SDK code this project doesn't have the source of, but this
exact, observed real compiler behavior is consistent with it being
implemented the first way — a hand-built `Task<string>` wrapping a
native, asynchronous COM callback, not a C# `async` method itself.

### Discard the Throwaway Example

Both throwaway versions above are discarded now — they never appear in
this project again. What's proven is `CS4014`'s own real, specific
trigger condition — not this specific `DoSomethingAsync` example.

### Mechanical Walkthrough

- `string json = JsonSerializer.Serialize(tools);` — `JsonSerializer
  .Serialize` (established Lesson 7), reappearing, unchanged.
- `` Browser.CoreWebView2.ExecuteScriptAsync($"renderTools({json})"); ``
  — `ExecuteScriptAsync` (Header, above), called with a real template-
  string-built (established Lesson 5's own C# string interpolation)
  literal — the real text this produces is a genuine JavaScript function
  call, `renderTools([{"Id":1,"Name":...}, ...])`, with real tool data
  embedded directly as a JSON array literal, which JavaScript itself
  parses as a real array the instant this string runs as code — its own
  real, returned `Task<string>` (Header, above) is discarded here
  entirely, proven above to compile with no warning despite that.

### CS Lens

A compiler diagnostic that fires based on how a callee happens to be
*implemented* (whether it uses the real `async` keyword), rather than
purely on its own real, declared *return type* (`Task<string>`, identical
either way), is a specific instance of a **leaky abstraction** — the
diagnostic's own real behavior depends on information a caller,
reasoning only from the method's own public signature, has no way to see
at all. Also recognized in: this project's own real `SqliteException`
(Lesson 3 onward) — its own real message text depends on SQLite's own
internal implementation details, not just the fact that *some* real error
occurred — and a car's own dashboard warning light that only illuminates
for certain real failure modes and not others, even though, from the
driver's own seat, both look like "the engine isn't working right."

### SE Lens

Why does this lesson leave `ExecuteScriptAsync`'s own real result
un-awaited at all, rather than making `RefreshBrowserTable` (and
everything that calls it) `async`, and genuinely awaiting it? The
alternative not chosen — real `async`/`await` throughout — was rejected
deliberately, for this lesson's own stated scope: `async`/`await` is a
real, separate C# language concept this project hasn't taught yet,
reserved for its own dedicated lesson next. The honest cost, real and
current, not hypothetical: if `ExecuteScriptAsync` ever throws (a real,
possible outcome if `renderTools` itself throws inside the WebView, or if
the document isn't in a state that can run it), that real exception is
silently lost — no `try`/`catch` anywhere in this method could ever see
it, precisely because nothing awaits the `Task` it's carried on. This
project accepts that real gap for exactly one more lesson.

### Run It

A real `dotnet build` was run this session against the actual, modified
file: build succeeded, 0 Warnings, 0 Errors — the real absence of a
`CS4014` warning, explained above, confirmed directly against this exact
file, not assumed. The two, real, isolated, side-by-side comparison
builds proving *why* are saved in this project's own
`verification/lesson-18/` folder
(`lab3-cs4014-async-modifier-matters.cs`). This project's own standing
constraint (no live WPF window observed this session) still applies to
watching `#tools-table` actually redraw with real, refreshed data in a
running browser.

### Connecting Back

A real edit, made through `ToolEditDialog` (Lesson 17), now reaches
`tools.db` and reflects back into the exact same browser table the user
is already looking at — the full, real round trip this lesson's own
Header opened by naming as a two-session-old, deferred promise, now
closed.

---

## Connect the Pieces

One concrete trace, start to finish, through everything this lesson built:

1. A real `Edit` button was added to every row `renderTools` produces,
   reached by one delegated `.on('click', 'button.edit-tool', ...)`
   handler attached once to `#tools-table`'s own stable `<tbody>` —
   surviving every real rebuild `renderTools` performs, unlike a directly-
   bound handler would; clicking it calls the real `postMessage`
   Lesson 7's own Header already promised this project would eventually
   use in this direction (Unit 1).
2. `Browser_WebMessageReceived`, subscribed only once `CoreWebView2`
   genuinely exists, deserializes the real JSON `postMessage` sends into
   a new `EditRequest` — proven, for real, that doing so with no options
   set silently produces wrong, empty/zero data, and that
   `PropertyNameCaseInsensitive = true` is the real, one-line fix,
   permanently proven in `EditRequestTests.cs`; from there, the real
   tool is looked up, `ToolEditDialog` (Lesson 17) opens, and a genuine
   save persists through `ToolRepository.UpdateTool` (Lesson 14/17)
   inside a real transaction (Unit 2).
3. `RefreshBrowserTable` re-queries `tools.db` and calls the real,
   now-named `renderTools` function directly through `ExecuteScriptAsync`
   — its own real, unawaited `Task<string>` result proven, through two
   real, isolated, side-by-side builds, to produce no `CS4014` warning
   specifically because of how the callee is implemented, not because of
   its own declared return type — an honest, real gap in exception
   visibility this project accepts for exactly one more lesson (Unit 3).

**Next lesson:** 19 — UI/UX for Async State.
