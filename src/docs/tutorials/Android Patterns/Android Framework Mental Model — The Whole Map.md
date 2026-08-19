# Android Framework Mental Model — The Whole Map

One self-contained document. The problem it's solving isn't a Java syntax
gap — it's not knowing which of a small number of recurring shapes and
mechanisms you're looking at when you open an unfamiliar Android class.
Everything needed to close that gap is here, in one place, in the order
it actually builds on itself — nothing below sends you somewhere else to
finish the thought.

## Three layers, always

Everything below sorts into exactly one of three layers — worth knowing
which one you're looking at before going deeper into any of them:

```
Your application     — Activities, Views, your data model, your business rules
Android framework    — components, lifecycle, the view system, resources, Intents, system-service client APIs
Android OS           — processes, permissions, the real system services, hardware
```

Almost everything below lives in the middle layer — the framework
mediating between code you write and a device the OS actually controls.

## Android is an OS-managed component framework, not a program with a `main()`

A normal program: the OS starts your `main()`, and every line of
execution traces back to something *you* called, directly or
indirectly.

Android has exactly one exception to this, and it applies to exactly
four kinds of class, never anything else: `Activity`, `Service`,
`BroadcastReceiver`, and `ContentProvider` — the four component types
listed just below — and only when a class is declared as one of them in
the Manifest, by name, in XML. (One more class also gets this same
treatment, `Application`, covered further down — still not a fifth
"component," a separate concept, but built the same way.)

**For those specific classes, and only those:** the compiled `.class`
file sits inert inside the installed APK, doing nothing, until the OS —
not your code — decides this particular declared class is needed right
now (the user tapped the icon; a broadcast matched; whatever the actual
trigger is), reads its name as a plain string out of the Manifest, and
constructs it itself, via reflection, off that string. You never write
`new MainActivity()` anywhere for this to happen — the worked trace
further down walks this exact mechanic, in full, for one real Activity.

**Every other class in the app is completely ordinary** — a data model,
a `RecyclerView.Adapter`, a `ViewHolder`, a helper class, literally
anything that isn't one of those four declared types (or `Application`).
These are built with `new`, by your own code, at whatever moment your
own code decides, exactly like any Java program with nothing
Android-specific about how they come into existence at all. The
Manifest never mentions them, and the OS's reflection-based construction
above never touches them.

### Three terms just used, defined exactly

**`AndroidManifest.xml`** (almost always just called "the Manifest") —
one specific real file, at a fixed location in every Android project
(`app/src/main/AndroidManifest.xml`), written in XML. It's the same file
already worked with for permissions — `<uses-permission
android:name="android.permission.SEND_SMS" />` is a real line that
actually goes in this exact file — permissions are just one of the
things it declares. It also lists every `Activity` / `Service` /
`BroadcastReceiver` / `ContentProvider` in the app, by exact class name,
plus a handful of whole-app facts: the package name, the minimum
Android version supported, the app's icon and display name. Nothing in
it runs — it's pure declaration, read by build tools and by the OS,
never executed as code.

**APK** — the actual file installed onto a device (a `.apk` file): one
zip-format archive containing the compiled bytecode, the Manifest, and
every resource (layouts, images, strings) the app needs. Android
Studio's build process produces this one file; installing an app is
copying it onto the device and having the OS unpack and register it.

**Reflection** — the specific mechanism that lets code construct a class
and call its methods using only the class's *name*, as a plain string,
decided at the moment the program is actually running — instead of the
ordinary way, where the exact class being built (`new MainActivity()`)
is written directly into the source code, fixed before the program ever
runs. This is exactly how the OS builds whichever class is named in the
Manifest: it never has `MainActivity` typed into any of its own source
code, because which app it's launching changes from device to device —
all it has is the string `"MainActivity"`, read out of that specific
app's Manifest, at the moment it's needed.

The Manifest actually gets read at two different times, worth telling
apart: once at install time, when Android unpacks the APK and records
what's declared inside it — so the OS already knows what an app *can*
do before ever running a single line of its code; and again at runtime,
whenever something needs to resolve an actual request (the user tapping
the icon, for instance) against that already-recorded information, to
decide which exact class to construct.

## Process, Application, Component, and plain object — four different things, easy to conflate

```
Process        — the OS-level container; created once, holds everything below
Application    — one real object, constructed once per process, before any component
Component      — Activity / Service / BroadcastReceiver / ContentProvider; created and destroyed individually, many times, over the process's life
plain object   — anything you build with `new`; Android has no opinion on these
```

`Application` is a real, subclassable class (`android.app.Application`),
declared with `android:name` in the Manifest and constructed through the
same reflection mechanism as any component — but only once, before the
first component in the process exists. Its job: somewhere to hold state
or set up something meant to live for the whole process, not just one
screen — reachable from any component with `getApplicationContext()`. An
`Activity` can be destroyed and rebuilt many times over (Situation 2
below); the one `Application` object underneath it, for that entire
process, never is.

## The four component types

`Activity` is one of exactly four kinds of thing the Manifest can
declare and the OS can construct and manage the lifetime of:

- **`Activity`** — one screen. The one used as the running example below.
- **`Service`** — runs in the background, with no screen of its own.
  Same idea as an Activity — the system constructs it, calls lifecycle
  methods on it — but nothing about it is ever shown on screen.
- **`BroadcastReceiver`** — constructed and handed one method call
  (`onReceive`) in response to a system-wide or app-wide announcement
  (battery low, SMS received, your own app-defined event) — then
  discarded. The shortest-lived of the four.
- **`ContentProvider`** — exposes a slice of your app's structured data
  to *other* apps' components, under a URI, with the OS mediating
  access instead of either app talking to the other directly.

All four get the same treatment from the OS: declared in the Manifest,
constructed via reflection off that declaration, never built with a
`new` your own code writes. Activity's own lifecycle hooks get real
depth further down; `Service`, `BroadcastReceiver`, and `ContentProvider`
each have their own real hook methods, not covered here — worth their
own pass if a build actually reaches for one of them.

## Activity → Window → View tree — three objects, not one

Every `Activity` owns exactly one real `android.view.Window` object,
created for it before `onCreate` ever runs, reachable with `getWindow()`.
`setContentView(int)` — seen below, in the trace — is a convenience
method that internally just calls `getWindow().setContentView(...)`, so
the full real chain is:

```
Activity  →  owns a  →  Window  →  holds the  →  View tree
```

The `Window` is where things that apply to the whole screen rather than
one specific view actually live — the title bar, whether the status bar
is visible, screen-wide flags like keeping the screen on. Code that
looks like it's configuring "the Activity" (`getWindow().addFlags(...)`)
is really configuring this separate, distinct object the Activity merely
holds a reference to.

**`LayoutInflater`** is the real class that turns XML into `View`
objects — not the same thing as `setContentView`, even though the two
get talked about interchangeably. `setContentView` fetches the window's
`LayoutInflater` and calls its `inflate(...)` method internally; that's
the actual work. The same `LayoutInflater` shows up again with no
`Activity` in sight at all: `RecyclerView.Adapter.onCreateViewHolder`
has no `setContentView` to call (an `Adapter` isn't an `Activity`), so
it calls `LayoutInflater.from(parent.getContext()).inflate(R.layout.row,
parent, false)` directly — same class, same real job, different wrapper
(or no wrapper) depending on where you're standing.

## A concrete screen, traced through three real situations

Everything above is structure. Here's what it actually does, mechanically,
using one small, realistic screen: a note you can view and edit.
`MainActivity` shows the current note text and an Edit button; tapping it
opens `EditActivity`, which hands the edited text back.

```java
public class MainActivity extends AppCompatActivity {

    private TextView noteText;
    private String currentNote = "Tap Edit to write something";

    private final ActivityResultLauncher<Intent> editLauncher =
        registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                currentNote = result.getData().getStringExtra("EDITED_NOTE");
                noteText.setText(currentNote);
            }
        });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        noteText = findViewById(R.id.noteText);
        Button editButton = findViewById(R.id.editButton);

        if (savedInstanceState != null) {
            currentNote = savedInstanceState.getString("CURRENT_NOTE", currentNote);
        }
        noteText.setText(currentNote);

        editButton.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, EditActivity.class);
            intent.putExtra("EXISTING_NOTE", currentNote);
            editLauncher.launch(intent);
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putString("CURRENT_NOTE", currentNote);
    }
}
```

```java
public class EditActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit);

        EditText editField = findViewById(R.id.editField);
        String existing = getIntent().getStringExtra("EXISTING_NOTE");
        editField.setText(existing);

        findViewById(R.id.saveButton).setOnClickListener(v -> {
            Intent result = new Intent();
            result.putExtra("EDITED_NOTE", editField.getText().toString());
            setResult(RESULT_OK, result);
            finish();
        });
    }
}
```

**`R`** — a class the build tools generate automatically, never typed by
hand, containing one integer constant for every resource in the project
— `R.layout.activity_main`, `R.id.noteText`. Every resource (a layout
file, a string, an image) gets a fixed number at build time; `R` is
nothing more than a lookup table from names to those numbers,
regenerated every time a resource is added, renamed, or removed.
`R.layout.activity_main` isn't the layout itself — it's the specific
integer `setContentView`/`LayoutInflater.inflate` use to know which
layout resource to actually go read and build.

**`Bundle`** — a key/value container built specifically to survive being
handed across a boundary Java objects normally can't cross: a destroyed
Activity, or even a killed process. It only holds simple, serializable
data (strings, numbers, small objects that implement `Parcelable` — an
interface a class implements specifically to make itself fast to pack
into a `Bundle` this way) — never a live reference to a `View` or an
`Activity` itself, because the whole point is surviving after those are
gone.

**`Intent`** — a message describing *what to do*, not a direct call.
`new Intent(MainActivity.this, EditActivity.class)` is an *explicit*
Intent: it names the exact class to start. It carries its own extras in
an internal `Bundle` — `putExtra`/`getStringExtra` are just typed
convenience wrappers around that same key/value idea.

**`findViewById`** — walks the `View` tree `setContentView` already
built from XML, and hands back a typed reference to one specific node.
It only works *after* `setContentView` has run; call it one line
earlier and it returns `null`, because the tree doesn't exist yet.

### Situation 1 — cold start (app not already running)

1. `setContentView(R.layout.activity_main)` — internally asks the
   window's `LayoutInflater` to read `activity_main.xml` and build a
   real, in-memory tree of `View` objects (a `TextView`, a `Button`,
   whatever container holds them), then attaches that tree as this
   Activity's content — this is the one time in the whole trace
   something gets built from XML at all; every other reference to these
   views from here on reuses this same tree.
2. `noteText = findViewById(R.id.noteText)` — reads a reference out of
   the tree step 1 just built; `noteText` now points at a real object
   that's already on screen.
3. `savedInstanceState != null` — **false**. Cold start means nothing was
   ever saved, so the parameter `onCreate` received really is `null`.
4. `noteText.setText(currentNote)` — shows the field's default value,
   `"Tap Edit to write something"`, because step 3 skipped the restore.
5. `editButton.setOnClickListener(v -> { ... })` — stores the lambda on
   the button object. Nothing inside it runs yet; nobody has tapped
   anything.
6. `onStart()` → `onResume()` — the screen becomes visible and
   interactive. Only now can step 5's listener actually fire.

### Situation 2 — the phone rotates

The aha this situation exists to prove: **rotating the screen does not
resume anything — it destroys the current `MainActivity` object outright
and constructs a brand-new one from scratch.** Not the same instance
continuing with a different width; a different object, same class.

1. `onPause()` → `onStop()` — the visible instance stops being visible,
   same as if the user had switched apps.
2. `onSaveInstanceState(outState)` — called specifically because Android
   is *about to destroy this object* and knows it, not because anything
   was requested. `outState.putString("CURRENT_NOTE", currentNote)`
   copies the field's current value into the `Bundle` — this is the only
   reason that value survives what happens next.
3. `onDestroy()` — the actual `MainActivity` object this trace has been
   following is now gone. Its `currentNote` field is gone with it; there
   is no version of this object left anywhere holding the user's edited
   text.
4. A **new** `MainActivity` object is constructed — same reflection-based
   process described above, run again. `currentNote` starts back at its
   default, `"Tap Edit to write something"`, because a brand-new object
   has never had anything else assigned to it.
5. `onCreate(savedInstanceState)` runs again, but this time the parameter
   is **not** null — it's the exact `Bundle` object step 2 filled in,
   handed to this new object by the system.
6. `savedInstanceState.getString("CURRENT_NOTE", currentNote)` — this
   time the check from cold-start step 3 succeeds, and the value written
   in step 2 overwrites the fresh default. On screen, nothing visibly
   changed. Underneath, every object involved is new except the one
   `String` that made the round trip through the `Bundle`.

Delete the `onSaveInstanceState` override and rerun this exact trace:
step 2 never happens, step 6 has nothing to read back, and the edited
note silently reverts to the default on every rotation — a real, common
bug, and now a predictable one.

Rotation is one instance of a bigger category, not a special case of its
own: Android runs this exact destroy-and-recreate sequence for any
**configuration change** — locale switching, dark mode toggling, a
foldable's screen resizing. Same mechanism every time, because any of
them can change which resources (layout, strings, drawables) apply, and
the simplest correct answer is rebuilding the screen from scratch against
the new configuration rather than trying to patch a live object.

### Situation 3 — open EditActivity, edit, and come back

Deliberate contrast with Situation 2: this time, nothing about
`MainActivity`'s own object is destroyed at all.

1. The user taps Edit. The listener stored in cold-start step 5 finally
   runs: `new Intent(MainActivity.this, EditActivity.class)` names
   `EditActivity` explicitly; `.putExtra("EXISTING_NOTE", currentNote)`
   packs the current text into that Intent's own `Bundle`.
2. `editLauncher.launch(intent)` — hands the Intent to the system and
   registers `MainActivity`'s lambda to be called later with whatever
   comes back. Nothing about `MainActivity` is destroyed for this — it's
   simply no longer the top, visible screen.
3. `MainActivity.onPause()` → `onStop()`. Compare directly against
   Situation 2: no `onSaveInstanceState`, no `onDestroy` — this is a
   normal navigation, not a configuration change, and the object
   underneath survives untouched, fields and all, the whole time
   `EditActivity` is on screen.
4. A new `EditActivity` object is constructed (same system mechanism as
   any Activity). Its own `onCreate` runs: `getIntent()` returns the
   exact `Intent` built in step 1; `getStringExtra("EXISTING_NOTE")`
   reads the packed value back out and pre-fills the edit field.
5. The user edits the text and taps Save. `setResult(RESULT_OK, result)`
   attaches a second, separate `Intent` — this one carrying the *edited*
   text under `"EDITED_NOTE"` — as this Activity's outcome. `finish()`
   ends `EditActivity`; its object is now destroyed, same as any
   `onDestroy`, but this one was never expected to survive past this
   point.
6. Back on `MainActivity`: **not** `onCreate` again — `onRestart()` →
   `onStart()` → `onResume()`. This is the same object from step 3, its
   fields never having stopped existing. Separately, the lambda
   registered in the field declaration at the top — the one
   `editLauncher` was built with — now runs, receiving the result Intent
   from step 5: `result.getData().getStringExtra("EDITED_NOTE")` reads
   the edited text out, and `noteText.setText(currentNote)` updates the
   same `TextView` object `findViewById` found back in cold-start step 2.

**What the contrast between Situation 2 and Situation 3 actually proves:**
two things can look identical on screen — the note text updates in both
— for completely different underlying reasons. Rotation destroys and
rebuilds the object, and the note only survives because it was
explicitly copied into a `Bundle` first. Navigating away and back never
destroys the object at all — the note "survives" because it was never
actually at risk. Confusing which situation you're in is exactly what
produces working-on-your-phone, broken-on-rotation bugs: code that only
works because the object never went away, quietly assumed to be safe
everywhere.

## Naming what you just watched: the three shapes every Android class takes

The trace above already showed two of these three in action without
naming them. Every confusing Android class is one of exactly three
shapes — once you can name which one, you know who calls your code,
when, with what data, and what you owe back.

**Shape 1 — extend it, fill in the blanks.** `MainActivity extends
AppCompatActivity` is this shape: the base class owns the whole
sequence traced above, and calls named methods on `this` at fixed
points — `onCreate`, `onSaveInstanceState` — that you never call
yourself. Two flavors of "blank," and knowing which one tells you
whether skipping it is even legal: **`abstract`** methods the compiler
refuses to build without (seen below, in `SQLiteOpenHelper`'s
`onCreate`/`onUpgrade`); and **overridable-but-not-abstract** methods
that already have a real body in the parent — skip one, and *nothing
breaks*, the parent's default silently runs instead. That's the trap:
"it worked without me writing anything" doesn't mean the method wasn't
needed, it means the default ran. The one question to ask of any Shape 1
method: what does the parameter Android hands you already contain by
the time it calls you, and what does Android do with whatever you
return or mutate on it?

**Shape 2 — hand over a small object, it gets called back *later*.**
`editButton.setOnClickListener(v -> { ... })` in the trace is this
shape: `setOnClickListener` doesn't run the lambda, it *stores* it — the
trace's own Situation 1, step 5 says exactly that, and step 6 shows
nothing inside it can run until `onResume` makes the screen interactive.
The `editLauncher` field is the same shape at a slight remove: registered
once, at field-declaration time, and only actually invoked in Situation
3, step 6 — real time later, real different situation. A lambda isn't
special Android syntax; it's shorthand for `new ClickListener() { public
void onClick(...) { ... } }` — same object, same mechanism, less typing.
The one question: what's the exact signature of that one method, and
what real-world event is the trigger?

**Shape 3 — configure, then ask for the real thing (Builder).** Nothing
in the trace above uses this shape, but it's everywhere else:
`new AlertDialog.Builder(ctx).setTitle(...).setPositiveButton(...).create()`
— every chained call before `.create()`/`.show()`/`.build()` is filling
out a form. **Nothing real exists yet.** Forget the terminal call and
nothing happens at all — not a bug, just an unfinished form. Shapes
nest: `setPositiveButton(...)` takes a `DialogInterface.OnClickListener`
— a Shape 2 callback, riding inside a Shape 3 builder.

**The filter — run this on any class handed to you:**

1. Told to `extends` it? → **Shape 1.** Find which methods are
   `abstract` (mandatory) vs. override-optional (silent default if
   skipped). Read the parameters — that's what's already known when
   Android calls you.
2. Told to `implement` a `*Listener`/`*Callback` interface, or pass a
   lambda into a `setOnXxx(...)` method? → **Shape 2.** Find the one
   method's real signature. Ask what event fires it.
3. Chaining `.setXxx(...)` calls ending in `.build()`/`.create()`/
   `.show()`? → **Shape 3.** Nothing is real until the terminal call.

Most confusing real code is just these three composed — an Adapter (1)
whose `onBindViewHolder` wires a click listener (2) that pops a Builder
(3). Once each layer can be named, "where do I implement things myself"
turns into "this method's `abstract`, so here" — not a guess.

## The main thread doesn't sit idle waiting for your method calls

This is what makes Shape 2 callbacks fire *later* instead of
immediately, mechanically.

**`Looper`** — an object that runs an infinite loop on one specific
thread, pulling the next queued item off a **`MessageQueue`** and
running it, forever, until told to stop. Every app's main thread has
exactly one, created by the system before any of your code runs.

**`Handler`** — the object you actually use to get something *onto*
that queue, tied to one specific `Looper` when constructed.

```java
Handler mainHandler = new Handler(Looper.getMainLooper());

Log.d("Trace", "1: before post");
mainHandler.post(() -> Log.d("Trace", "3: runnable finally runs"));
Log.d("Trace", "2: after post, before the runnable");
```

Real, documented behavior of `Handler.post`, traced:

1. `mainHandler.post(runnable)` — does **not** run the lambda. It places
   it on the main `Looper`'s `MessageQueue` and returns immediately.
2. `Log.d("Trace", "2: ...")` — runs next, on the same line of code that
   called `post`, because `post` already returned.
3. Only once the current method finishes and the `Looper` gets back
   around to pulling the next item off its queue does the lambda from
   step 1 finally run — logging `"3: ..."` last, even though it was the
   *second* line of code written.

Log order: `1, 2, 3` — not `1, 3, 2`, despite the lambda being written
before line 2. This is the exact same registration-vs-invocation shape
as `editButton.setOnClickListener(...)` in the trace above — a click
listener's `onClick` is, underneath, a `Runnable` some part of Android's
own input system posts to this same queue when a tap is detected. It's
why touching a `View` from any thread other than the one whose `Looper`
owns it fails: that other thread has no way to get its work onto the
queue the one thread actually reading it is looping on.

## What's already there vs. what's always yours

A different, related question from "which shape is this class" — this
one is "do I even have to write this at all." Otherwise "add an image,"
"add a database," "add SMS," "let the user edit a field" are four
separate things to memorize, and the list never ends. Underneath all
four is the same question, asked the same way, every time: **is there
already a class for this exact noun, and if there isn't, what am I
actually supposed to write instead?**

Android ships to every phone running it, used by millions of unrelated
apps. Anything a huge number of *different* apps would all need to do
the same way — store structured data, send a text, decode and show an
image, ask permission, respond to a tap — is worth Google building once,
centrally, so nobody rewrites it badly. That's most of the SDK — the
Android Software Development Kit, literally the set of classes Google
ships as part of the platform itself, already installed on every device
before an app ever gets there. Nothing
about *your* app's specific fields, *your* app's rule for what counts as
a valid entry, or *your* screen's specific layout could ever be
pre-built by anyone else, because nobody else has seen your app. That
part has no shortcut, ever, for any feature.

**The test, on any new task:** name the noun — "image," "text message,"
"row in a table," "click." Ask: would *any* app wanting to do this exact
generic thing need the same code? If yes, the SDK almost certainly
already has a class for that noun, and the job is finding it, not
writing it. If the honest answer is "no, this depends on what *my app*
considers valid" — that piece is yours, and no amount of searching finds
it, because it doesn't exist anywhere yet.

### Reading a class name before opening its documentation

Android's naming conventions aren't decoration — they let you *predict*
which shape a class is before reading a single line of its
documentation. A prediction, not a rule: the suffix isn't what makes a
class call-only or extendable, it's a strong hint Android's own authors
were consistent about. The class's real declaration is what's actually
authoritative — so treat the suffix as step one of a short lookup, not
the final answer:

```
name → predict the shape
     → open the real declaration
     → is it abstract, and what does it extend/implement?
     → does its constructor take arguments you'd have to supply?
     → does it have abstract methods with no body?
     → confirm against the official doc page
```

- **`*Manager`** — a system service. Obtained through a static call
  (`SmsManager.getDefault()`, `getSystemService(...)`), never `extends`ed,
  never built with `new`. You call its methods; the real work already
  lives inside it. (`SmsManager`, `NotificationManager`,
  `ConnectivityManager`.)
- **`*Helper`** — Android needs one or two specific facts only *you* can
  supply, and handles everything generic around them. You `extends` it
  and fill in exactly the named abstract methods — nothing more.
  (`SQLiteOpenHelper`.)
- **`*Builder`** — a throwaway configuration object (Shape 3 above).
- **`*Listener` / `*Callback`**, or a method named `setOnXxxListener` —
  an interface, usually one method (Shape 2 above).
- **A plain concrete class with none of those suffixes, built with
  `new`** — just use it directly. No subclassing was ever intended.
  (`Bitmap`, `Uri`, `Intent`, `ContentValues`.)

**When the name alone doesn't tell you enough, don't go searching — ask
your own IDE**, since it already has the real declaration loaded:
right-click inside the class body → **Generate → Override Methods…**
lists every method the base class actually allows you to override, real
signature and all, with checkboxes. **Generate → Implement Methods…**
does the same for an interface's required methods. That list, not a
search engine, is the authoritative answer to "what could I even write
here" — the official reference page (developer.android.com) is worth
opening afterward for *why* a specific one exists and when it fires, not
for discovering that it exists in the first place.

### Worked applications — same method, four different nouns

**"I want to show an image."** Noun: image. Generic? Yes. The real class
is `ImageView` — no special suffix, a public constructor, placed like
any other `View` — so it's call-only:

```java
imageView.setImageBitmap(bitmap);
imageView.setImageResource(R.drawable.icon);
imageView.setImageURI(uri);
```

No subclass needed for any of those three. If the image has to come
*from the user* instead of a bundled resource, that pulls in a second,
genuinely required piece: a Shape-2 callback — the modern
`ActivityResultLauncher`'s registered callback, exactly the shape
`editLauncher` used in the trace above — receiving the picked `Uri`
back. That callback body is yours to write, because only you know which
`ImageView` on which screen it belongs to.

**"I want a database."** Noun: data that outlives the app closing.
Generic? Yes. The real class is `SQLiteOpenHelper` — the `*Helper`
suffix already says: extend it, fill in exactly two abstract methods:

```java
public abstract void onCreate(SQLiteDatabase db);
public abstract void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion);
```

Android handles opening the file, the connection lifecycle, and calling
those two methods at the right moment on its own. What's yours: the
actual `CREATE TABLE` SQL text (nobody but you knows your columns), and
your own mapping code from a `Cursor` row back into your own object.

**"I want to send an SMS."** Noun: text message. Generic? Yes. The real
class is `SmsManager`, the `*Manager` suffix telling you it's call-only:

```java
SmsManager.getDefault().sendTextMessage(phoneNumber, null, message, null, null);
```

No subclass, ever. But sending SMS touches the user's phone plan and
privacy, so Android also requires a runtime permission check before that
call is allowed to succeed. That check-and-branch — ask, handle
"granted," handle "denied" — is genuinely yours to write every time,
because only your app knows what to show the user if they say no. Skip
it, and the call above throws a real `SecurityException` **at runtime**,
not a compile error — the compiler has no way to know in advance what a
user will tap months from now. This generalizes past SMS: your process
never has unrestricted access to a protected capability (camera,
location, contacts, storage, microphone) by default — Android mediates
every one of them, and the pattern is always the same ask/granted/denied
shape.

**"I want to update a field, or change the picture on an existing
row."** Notice this isn't a new noun at all — it's the same
`SQLiteOpenHelper` object, calling `db.update(...)` instead of
`db.insert(...)` with a `WHERE` clause, and the same `ImageView` calls
above with a different `Uri`. The genuinely new, always-yours piece is
different: Android has no way to know your in-memory list changed unless
you say so. Mutating your `List<Item>` alone does nothing on screen. For
a `RecyclerView`, you have to call this yourself:

```java
items.set(position, updatedItem);
adapter.notifyItemChanged(position);
```

Skip the second line, and the database is correctly updated while the
screen keeps showing the old value — until the row scrolls off-screen
and a recycled `View` happens to pull the new data back in. That's not a
separate bug to learn about later; it's this exact same "always yours"
gap, showing up as a UI symptom instead of a crash.

### The one thing that's always yours, no matter the shape

Call-only, extend-and-fill-in, implement-a-listener, or
configure-then-build — whichever shape a class turns out to be, the
wiring between it and *your* specific data can never be pre-built by
anyone else, because nobody else has seen your app's fields, your app's
rules, or your app's screens. That's not a gap in your Android knowledge
to close eventually — it's the permanent, unchanging shape of the job.

Named precisely, this is **mechanism vs. policy** — a real, general
software-engineering split, not an Android quirk. The *mechanism* is the
generic capability: `RecyclerView` can display a collection; `SQLite`
can store rows. The *policy* is your app's own rules layered on top of
that mechanism: which rows to show, in what order, which ones a given
user is even allowed to touch. Android — or any framework, in any
language — can ship the mechanism to everyone, because it's the same for
every app. It can never ship the policy, because the policy *is* your
app; there's nothing generic left to build once you've specified it.

## Which method am I actually supposed to override

A third, still different question: given a plain-English thing you want
to happen, which *one* real Android method fires at the right moment,
out of the fifteen a base class might offer. The official reference page
for `Activity` lists every overridable method with a correct, precise
contract for each — once you're already on the right method's page. It
has no way to tell you which one to open in the first place. Android's
hook names sort into three fixed, small buckets by *when* they fire —
once the bucket is known, the list of real candidates is short enough to
just read.

### Bucket 1 — tied to the screen's own existence

This is exactly the sequence already traced above:

```
onCreate(Bundle) → onStart() → onResume() → [visible, running] → onPause() → onStop() → onDestroy()
```

(A `Fragment` has the near-identical `onCreateView` / `onViewCreated` /
`onStart` / `onResume` / `onPause` / `onDestroyView`.)

**"Set up views, read what was passed in, do something that should
happen exactly once for this screen's whole lifetime."** →
`onCreate(Bundle savedInstanceState)`.

**"Refresh something that might have gone stale while the user was on a
different screen."** → `onResume()`, **not** `onCreate`. Single most
common real bug in this bucket: `onCreate` runs once, the first time the
screen is built — it does **not** run again when the user comes back to
this screen from somewhere else (that's Situation 3 above — `onCreate`
never re-runs there, only `onRestart`/`onStart`/`onResume`). Data loaded
in `onCreate` silently goes stale the moment the user navigates away and
back.

**"Release or pause something expensive (camera, sensor, a timer) the
moment the screen stops being visible."** → `onPause()`.

### Bucket 2 — tied to one item inside a repeating list

`RecyclerView.Adapter`'s two real hooks, and they run at wildly different
rates — confusing them is the second most common bug in this bucket:

**"Build a row's view structure from scratch."** →
`onCreateViewHolder(ViewGroup parent, int viewType)`. Called *rarely* —
only when the list needs a physically new row it has nothing recyclable
to reuse. On a screen showing 8 visible rows out of 500 items, this
might run 9 or 10 times total, not 500.

**"Given a specific item and a specific (possibly reused) row, put that
item's data into that row."** → `onBindViewHolder(VH holder, int
position)`. Called constantly — every time any row, new or recycled,
needs to display a given position. Code that only makes sense to run
once (building the row's layout) belongs in the first method; code that
depends on *which* item is showing belongs in this one.

### Bucket 3 — triggered by something the user does, whenever they do it

Android's own convention here: `setOn<Verb>Listener`, where `<Verb>`
names the exact action. If the verb can be named, the real interface can
usually be guessed correctly before looking anything up:

| React to… | Register with | Interface / method you implement |
|---|---|---|
| a tap | `view.setOnClickListener(...)` | `View.OnClickListener.onClick(View v)` |
| a press-and-hold | `view.setOnLongClickListener(...)` | `View.OnLongClickListener.onLongClick(View v): boolean` |
| text changing while typing | `editText.addTextChangedListener(...)` | `TextWatcher` — **three** methods: `beforeTextChanged`, `onTextChanged`, `afterTextChanged` |
| a dialog button tap | `builder.setPositiveButton(text, ...)` | `DialogInterface.OnClickListener.onClick(DialogInterface dialog, int which)` |
| a permission result | `registerForActivityResult(new RequestPermission(), ...)` | a lambda taking one `Boolean` (granted or not) |

Two real traps specific to this table, worth knowing before hitting them
instead of after:

- **`TextWatcher` can't be a lambda.** A lambda only works for an
  interface with exactly one abstract method (a *functional interface*)
  — why `v -> { ... }` works for `OnClickListener`. `TextWatcher`
  declares three, so Java's lambda syntax doesn't apply at all; it needs
  a full anonymous class with all three methods written out, even if two
  do nothing.
- **There are two unrelated interfaces both named `OnClickListener`** —
  `android.view.View.OnClickListener` (`onClick(View v)`) and
  `android.content.DialogInterface.OnClickListener`
  (`onClick(DialogInterface dialog, int which)`). Same name, different
  package, different signature, different job. Autocomplete offers both;
  picking the wrong one still compiles, and only surfaces as a type
  error at the exact call site expecting the other one.

**Where a Bucket 3 listener gets registered is a Bucket-1/2 decision,
not a Bucket-3 one:** a click listener on a `RecyclerView` row almost
always belongs inside `onBindViewHolder` (Bucket 2), because the
listener's body usually needs to know *which* item was tapped — only
known at bind time, not at `onCreateViewHolder` time when the row is
still item-less.

### The actual decision procedure

1. Does this depend on the screen's own state (created / visible /
   gone)? → **Bucket 1** — pick from the fixed six names above; a
   choice among a short list, not a search.
2. Does this depend on which specific item, inside a repeating list, is
   involved? → **Bucket 2** — once, ever, per row object vs. every time
   that row shows data.
3. Is this triggered by something the user actively does, at an
   unpredictable moment? → **Bucket 3** — name the verb, expect
   `setOn<Verb>Listener` to already exist for it.
4. None of the three fit? That's not a hook at all — it's plain code
   written and called directly: the "always yours" half above, not
   something Android calls back into.

## System services — the concern-to-class map

The suffix table above covers *recognizing* a `*Manager`-suffixed class
as call-only. This is the other half: which concern maps to which real
class, so there's something concrete to go recognize in the first place.

| Concern | Real class |
|---|---|
| Persisted structured data | `SQLiteOpenHelper`, or `Room` on top of it |
| Background work that should survive the app closing | `WorkManager` |
| Sending a text message | `SmsManager` |
| Posting a notification | `NotificationManager` |
| Checking network connectivity | `ConnectivityManager` |
| Reading device location | `LocationManager` / `FusedLocationProviderClient` |

Many of these `Manager` objects aren't doing the real work locally at
all — they're thin client objects whose methods quietly cross into a
separate system process over **IPC** (inter-process communication: one
running process's code invoking something inside a genuinely different,
separate process — never possible directly, always mediated by the OS,
since two processes can't just reach into each other's memory the way
two objects in the same process can). Android's own specific mechanism
for this is called `Binder`. From the calling code it reads like an
ordinary method call; it isn't one underneath. Not something to manage
directly — just useful context for why a "simple" call can be slower, or
more tightly permission-gated, than a plain Java method would ever be.

## Putting it together

One concrete class, read cold, using everything above: `class MyAdapter
extends RecyclerView.Adapter<MyAdapter.ViewHolder>`, whose
`onBindViewHolder` wires `holder.itemView.setOnClickListener(v -> new
AlertDialog.Builder(ctx).setTitle(...).show())`. `extends
RecyclerView.Adapter` is Shape 1 — Bucket 2 governs which of its methods
run once per row object versus once per bind. The lambda inside
`onBindViewHolder` is Shape 2, registered now, fired later, the next
time this exact row is tapped, off the main thread's `Looper` the same
way the trace's own click listener was. `AlertDialog.Builder` is Shape 3
— nothing shows until `.show()`. Whether any of it needed to be written
at all comes down to mechanism vs. policy: `RecyclerView` and
`AlertDialog` are Android's mechanism; which item, which title, and what
happens after the tap are this app's policy, and always will be, no
matter how many more of these get read.

## What this deliberately doesn't cover

Reading this once doesn't make anyone finished with Android — it's a
decoder ring, not the whole dictionary. What's here is the recurring
grammar: how a class expects you to participate, whether you had to
write it at all, which specific hook a plain-English requirement maps
to, and the process/thread/component architecture underneath all of it.
That grammar makes a genuinely new class fast to read the first time
it's met — it isn't a substitute for meeting it.

Real, separate subject matter this document doesn't touch, each with its
own real mechanics worth learning when a build actually needs it:
`Service`, `BroadcastReceiver`, and `ContentProvider`'s own hook methods
in depth (only named above, not walked); how `View` measurement, layout,
and drawing actually size and place things on screen; and whatever
specific library a project reaches for — `Room`, `Retrofit`, Fragments
plus the Navigation Component, `WorkManager`, Compose, dependency
injection, testing. Each of those is a real, separate vocabulary. What
changes, having read this, is that opening any of them for the first
time means recognizing "this `Dao` interface is Shape 1," "this
`databaseBuilder(...).build()` is Shape 3," instead of starting from
nothing.
