# Lesson 28: Talking to a Server — Retrofit, JSON, and the Repository Boundary Revisited

**What you will build:** A real, working network call — using a public
test API as an honest stand-in for a backend this project doesn't have
— wired into `ItemRepository` and triggered automatically by Lesson
27's connectivity receiver the moment the device comes back online.
The transferable problem: every data source this project has used so
far (Room, `SharedPreferences`) is local and effectively instant.
A network call is neither: it can take real, unpredictable time, it can
fail in ways a database query almost never does (no connection, a
timeout, a malformed response), and the data arrives as **JSON**, a
text format, not typed Java objects — every one of those differences
needs real handling, not an afterthought.

**What you need to know first:** Lesson 17 (`ItemRepository` — this
lesson is the exact payoff of that seam), Lesson 14 (asynchronous work,
callbacks), Lesson 27 (the connectivity receiver, currently just
logging), Lesson 9 (`try`/`catch`, since network failure is a real,
expected case here, not an edge case).

---

## Concept Unit: JSON — Structured Text, Not Java Objects

### The Problem

A server doesn't send Java objects over the network — it sends text, in
a specific, structured format almost every web API uses: **JSON**
(JavaScript Object Notation, despite the name, entirely language-
agnostic). Before any library parses it automatically, see what it
actually looks like and what parsing it by hand would mean.

### Introduce the Concept in Isolation

```java
import org.json.JSONObject;
import org.json.JSONException;

public class JsonDemo {
    public static void main(String[] args) throws JSONException {
        String rawJson = "{\"id\": 1, \"title\": \"Sample Notice\", \"body\": \"Server text here\"}";

        JSONObject parsed = new JSONObject(rawJson);
        int id = parsed.getInt("id");
        String title = parsed.getString("title");

        System.out.println("Parsed id: " + id);
        System.out.println("Parsed title: " + title);
    }
}
```

(Run this via a temporary call inside the real app, since the `org.json`
package this specific class needs is bundled with Android but not a
plain desktop JVM by default — read the Logcat output rather than a
terminal, same accommodation Lesson 20's `DiffDemo` needed.)

Output:

```
Parsed id: 1
Parsed title: Sample Notice
```

This proves the shape: JSON is text using `{ }` for an object, `"key":
value` pairs separated by commas, and quoted strings for text values —
readable by a human directly, and `JSONObject.getInt`/`getString` pull
individual values out by key, by hand, one at a time.

### Discard the Throwaway Example

Delete this block — parsing every field by hand, one line per key, for
every response shape this app might ever receive, is exactly the
repetitive, error-prone boilerplate the next unit's library
automatically eliminates the same way Room (Lesson 13) eliminated raw
`Cursor` column reads.

### CS Lens

JSON is a **serialization format** — the same general concept named
in Lesson 8's `Parcelable` CS Lens, here in its most common cross-
network, cross-language form: a text representation of structured data
that any program, in any language, can produce and parse, in contrast
to `Parcelable`'s Android-only, binary, same-process design.

---

## Concept Unit: Retrofit — Declaring an API as a Java Interface

### The Problem

Hand-parsing JSON field-by-field, for every endpoint, doesn't scale —
and manually managing HTTP connections, threading, and error cases for
every network call would be substantial, repetitive work. Retrofit
generates all of it from an annotated interface, the same "describe
intent, let a tool generate the implementation" shape as Room's `@Dao`
(Lesson 13) and the Navigation Component's Safe Args (Lesson 19).

### Commands Needed

Add to `app/build.gradle`'s `dependencies { }`:

```gradle
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
```

Add to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Sync.

### Project Change

- **Reference Source:** No reference counterpart — this lesson uses
  `https://jsonplaceholder.typicode.com`, a well-known, free, public
  test API commonly used for exactly this kind of learning exercise, as
  an honest stand-in for a real backend Pocket Inventory doesn't have.
  Treat every call this lesson makes as a demonstration of the
  *mechanism* — the shape a real sync feature would follow — not a
  real inventory-sync feature.
- **Files affected:** New file `RemoteNotice.java`; new file
  `CatalogApi.java`; `ItemRepository.java`.
- **Change type:** Create, modify.

### The New Code — the Response Shape

```java
package com.yourname.pocketinventory;

public class RemoteNotice {
    private int id;
    private String title;
    private String body;

    public int getId() { return id; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
}
```

### The Updated Project

A new, plain class — no annotations at all this time. Its field names
(`id`, `title`, `body`) deliberately match the remote JSON's keys
exactly — the mechanism the next unit's Gson converter relies on.

### Mechanical Walkthrough

- `private int id;` / `private String title;` / `private String body;`
  — reappearing (field declarations, Lesson 7), no constructor
  provided at all — **first appearance of a class relying entirely on
  a library to populate its fields via reflection**, rather than a
  constructor call anywhere in this project's own code; Gson (used
  internally by the converter, next unit) sets these fields directly
  by matching JSON key names to field names, bypassing normal
  constructor-based object creation entirely.
- Getters only, no setters — reappearing (Lesson 7's `Item` fields that
  never change after construction), appropriate here since this object
  only ever represents data *received*, never edited and sent back.

### The New Code — the API Interface

```java
package com.yourname.pocketinventory;

import retrofit2.Call;
import retrofit2.http.GET;
import java.util.List;

public interface CatalogApi {
    @GET("posts")
    Call<List<RemoteNotice>> getNotices();
}
```

### The Updated Project

A new file — another interface with zero implemented method bodies
(the same shape as Lesson 13's `ItemDao`), this time generated by
Retrofit instead of Room.

### Mechanical Walkthrough

- `interface CatalogApi` — reappearing (Lesson 13's `@Dao` shape,
  Lesson 8's listener interfaces).
- `@GET("posts")` — **first appearance.** Declares this method
  performs an HTTP `GET` request against the path `"posts"`, appended
  to a base URL supplied when Retrofit is actually built (next unit) —
  `jsonplaceholder.typicode.com/posts` is a real, public endpoint
  returning a JSON array of objects shaped like `RemoteNotice`.
- `Call<List<RemoteNotice>> getNotices();` — **first appearance of
  `Call<T>`.** Represents one specific, not-yet-executed network
  request — calling this method doesn't perform the request itself; it
  produces a `Call` object you then explicitly execute (next unit),
  the same "describe, then trigger separately" shape as Lesson 18's
  Fragment transactions (`beginTransaction()` then `.commit()`).

### The New Code — Building the Retrofit Client and Calling It

```java
private static final CatalogApi catalogApi = new Retrofit.Builder()
        .baseUrl("https://jsonplaceholder.typicode.com/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(CatalogApi.class);
```

```java
void checkRemoteNotices() {
    catalogApi.getNotices().enqueue(new Callback<List<RemoteNotice>>() {
        @Override
        public void onResponse(Call<List<RemoteNotice>> call, Response<List<RemoteNotice>> response) {
            if (response.isSuccessful() && response.body() != null) {
                List<RemoteNotice> notices = response.body();
                android.util.Log.d("ItemRepository", "Fetched " + notices.size() + " remote notices");
            }
        }

        @Override
        public void onFailure(Call<List<RemoteNotice>> call, Throwable t) {
            android.util.Log.e("ItemRepository", "Remote notice check failed", t);
        }
    });
}
```

### The Updated Project

Both blocks are added to `ItemRepository.java` — the `catalogApi` field
alongside `itemDao`/`dbExecutor` (Lesson 13/17); `checkRemoteNotices()`
as a new method, callable independently of every existing Room-backed
method on this class.

### Mechanical Walkthrough
- `new Retrofit.Builder().baseUrl(...).addConverterFactory(GsonConverterFactory.create()).build()`
- — reappearing Builder pattern (Lesson 13/22/26).
- `.baseUrl(...)` — **first appearance** — the root URL every `@GET`/`@POST` path is appended to.
- `.addConverterFactory(GsonConverterFactory.create())` —

  **first appearance** — registers Gson as the library responsible for
  converting raw JSON text into real Java objects (`RemoteNotice`),
- and back — this single line is what replaces the `JSONObject`
  hand-parsing from this lesson's first unit entirely.
- `.create(CatalogApi.class)` — **first appearance.** Generates a real,
  working implementation of the `CatalogApi` interface at runtime,
  using Java reflection on the `.class` object (Lesson 4's first
  appearance of `.class` as a value, reused here for a genuinely
  different purpose) — a subtly different code-generation mechanism
  from Room's compile-time annotation processing (Lesson 13) or Safe
  Args' build-time plugin (Lesson 19), worth naming as a real
  distinction: this generation happens live, when the app runs, not as
  a separate build step producing a `.java` file you could inspect.
- `catalogApi.getNotices()` — reappearing (interface method call),
  returning a `Call<List<RemoteNotice>>` as declared.
- `.enqueue(new Callback<List<RemoteNotice>>() { ... })` — **first
  appearance.** Actually triggers the network request — **asynchronously**,
  on Retrofit's own internally-managed background thread pool (Lesson
  14's principle, automated the same way `WorkManager` automated it in
- Lesson 26 — no manual `ExecutorService` needed here either) — the
  anonymous `Callback` (same anonymous-class shape as Lesson 8/20/27)
  is invoked once a result or failure is known.
- `onResponse(Call<...> call, Response<...> response)` — **first
  appearance.** Called when the server actually responded — **not**
  the same as "succeeded": a 404 or 500 error is still a `Response`,
  which is exactly why the next line checks further.
- `response.isSuccessful()` — **first appearance.** `true` only for a
  2xx-range HTTP status — a real, necessary check distinct from merely
  receiving *a* response at all.
- `response.body()` — **first appearance.** The actual parsed
  `List<RemoteNotice>`, already fully converted from JSON by the Gson
  converter registered above — by the time this line runs, every
  `RemoteNotice` object already exists, fully populated, with zero
  manual parsing code written anywhere in this project.
- `onFailure(Call<...> call, Throwable t)` — **first appearance.**
  Called when the request never even got a response at all — no
  connectivity, a timeout, a malformed URL — genuinely different from a
  server-side error response, and, unlike Lesson 9's `try`/`catch`
  around `Integer.parseInt`, this failure path is asynchronous: it
  can't be caught with an ordinary `try`/`catch` around the `.enqueue(...)`
  call, since that call returns immediately, long before any real
  network activity has happened or failed.

### Run It

Call `repository.checkRemoteNotices()` temporarily from anywhere
reachable (a debug button, or directly in `InventoryListFragment.onViewCreated`
for a one-time test). Run the app with a working internet connection:
Logcat shows `"Fetched 100 remote notices"` — a real, successful
network round-trip, real JSON parsed into real `RemoteNotice` objects,
with the actual field values (title, body) available for inspection if
you log one directly. Now disable the emulator's network connection
entirely and run it again: `onFailure` fires instead, logging a real
`java.net.UnknownHostException` or similar — proof both paths genuinely
work, not just the success case.

### CS Lens

**This is a hard concept — asynchronous I/O with a two-path result
(success/failure) delivered later, not returned immediately — and it
recurs constantly:** the calling code never blocks waiting for the
network; it registers what to do for each outcome and moves on
immediately, exactly the callback/continuation shape already named in
Lesson 10's Activity Result API and Lesson 16's `LiveData`. Also
recognized in: JavaScript `fetch()`'s `.then()`/`.catch()` pair,
Python's `asyncio` request libraries, and any RPC client library across
any language and platform.

---

## Concept Unit: Wiring the Connectivity Receiver to a Real Trigger

### The Problem

Lesson 27's connectivity receiver only logs. Give it the real action it
was built to eventually trigger.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `PocketInventoryApplication.java`.
- **Change type:** Modify.
- **Dependencies:** `ItemRepository.checkRemoteNotices()`, this
  lesson.

### The New Code

```java
if (isConnected) {
    ItemRepository repository = new ItemRepository((Application) context.getApplicationContext());
    repository.checkRemoteNotices();
}
```

### The Updated Project

Replaces the connectivity receiver's `Log.d(...)`-only body from Lesson
27 — the check for `isConnected` (already present) now gates a real
action instead of only a log line.

### Mechanical Walkthrough
- `new ItemRepository((Application) context.getApplicationContext())`
  — reappearing (constructor call, Lesson 17), a fresh instance rather
- than the one `InventoryViewModel` owns — worth naming honestly as a
  simplification: a real production app would more likely share one
  `ItemRepository` instance app-wide (a job for a proper dependency-
  injection setup, out of scope here) rather than construct a new one
  per broadcast; this project accepts the small duplication to avoid
  introducing a DI framework this late, for a feature this narrow.

### Run It

Toggle connectivity off, then back on, exactly as in Lesson 27's
testing. Confirm `checkRemoteNotices()` now actually fires and logs a
real fetch result the moment connectivity is restored — the full,
working loop this project has been building toward since Lesson 27
first registered a receiver with nothing real to do.

---

## Connect the Pieces

Full trace: the device regains connectivity → the dynamically-
registered receiver (Lesson 27) fires, confirms `isConnected`, and
constructs an `ItemRepository`, calling `checkRemoteNotices()` → Retrofit's
generated `CatalogApi` implementation performs a real, asynchronous
`GET` request against the public test API → on success, the Gson
converter transforms raw JSON text into real, populated `RemoteNotice`
objects with zero manual parsing code, delivered to `onResponse` on
Retrofit's own managed thread → on any failure — no connection, a bad
response — `onFailure` handles it instead, with no `try`/`catch`
capable of reaching it, since the failure arrives asynchronously, long
after the triggering call already returned.

## What Breaks Without This

Temporarily change the `@GET("posts")` path to `@GET("nonexistent")`.
Run `checkRemoteNotices()`: `onResponse` still fires (a response was
genuinely received), but `response.isSuccessful()` is now `false` (a
404) — confirm your code correctly skips processing in this case rather
than crashing on a `null` or empty body. This is exactly why `isSuccessful()`
must be checked separately from merely reaching `onResponse` at all.
Restore the correct path afterward.

## Exercises

1. Add a second endpoint to `CatalogApi`,
   `@GET("posts/{id}") Call<RemoteNotice> getNotice(@Path("id") int id);`
   — your first use of a **path parameter** — and call it for a single
   specific notice, logging its `title` and `body` once fetched.
2. Add a timeout: research (documentation, optional to implement)
   `OkHttpClient.Builder().connectTimeout(...)`, supplied to
   `Retrofit.Builder().client(...)`, and write down, in your own
   words, why an unbounded wait for a network response would be a real
   problem for this project's `LowStockWorker` (Lesson 26) if it ever
   made a network call of its own.

## Definition of Done

- [ ] `checkRemoteNotices()` performs a real network call and correctly
      handles both success and failure, verified by actually toggling
      connectivity, not just reading the code.
- [ ] You ran the `JsonDemo` lab and can explain what JSON looks like
      and what Gson is doing that you'd otherwise do by hand.
- [ ] The connectivity receiver from Lesson 27 now triggers a real
      network call instead of only logging.
- [ ] You broke the endpoint path on purpose, saw `isSuccessful()`
      correctly return `false`, and restored it.
- [ ] Commit: message explaining why (e.g. "Add Retrofit-based network
      access to ItemRepository, using a public test API as an honest
      stand-in for a real backend, triggered by the connectivity
      receiver built in Lesson 27").

Lesson 29 is next: this project's own database, still entirely private
to itself — `ContentProvider`, and what it would take to let a
*different* app query Pocket Inventory's data, even though this
project has no real reason to ship one.
