# Lesson 03: Listeners — Being Called Instead of Asking

**What you will build:** A throwaway pure-Java simulation (scratch file)
of an object that calls back into your code on its own schedule,
instead of you asking it a question and getting an answer immediately.
Then: the real thing, added to your existing project, using an
interface Android's `ClipboardManager` actually declares —
`OnPrimaryClipChangedListener` — so the same object you've been calling
`getSystemService` on since Lesson 01 now calls *you*.

**What you need to know first:** Lesson 01 (`getSystemService`,
casting). This lesson does not require Lesson 02's `Context` material —
it branches off from Lesson 01 directly.

**Terms introduced in this lesson:**
- **Listener / callback interface** — an interface whose whole purpose
  is being handed to some other object so *that* object can call your
  code later, when something happens. It exists because Java has no
  way to pass a bare block of code as a value the way JavaScript passes
  a raw function — wrapping that code in an object implementing a
  named interface is Java's way of making "a piece of runnable code"
  something you can hand to a method as an argument at all.
- **Anonymous class** — an unnamed, one-off class, defined and
  instantiated in a single expression, usually to implement an
  interface on the spot without giving the implementation its own
  named `.java` file. It exists so a listener used in exactly one place
  doesn't force you to create, name, and maintain an entire separate
  top-level class just to be constructed once, right where it's needed.
- **Lambda expression** — shorthand syntax for exactly one specific
  case of an anonymous class: implementing an interface that declares
  exactly one abstract method. It exists to strip away the remaining
  ceremony an anonymous class still carries — the interface name, the
  method name, the braces — once there's only one possible method it
  could mean.
- **Functional interface** — the formal name for an interface that
  declares exactly one abstract method, which is what makes the lambda
  shorthand legal for it in the first place. The one-method limit isn't
  arbitrary: a lambda's syntax has nowhere to *write* a method name, so
  the compiler can only infer which method you're implementing when
  there's exactly one candidate to choose from.
- **Lexical scoping of `this`** — a notorious, easy-to-miss difference
  between a lambda and an anonymous class, even though both can
  implement the exact same interface. A lambda does not introduce a
  new `this` at all — `this` inside one means exactly what `this`
  already meant in the code immediately surrounding it. An anonymous
  class does introduce a new `this` — its own, referring to the
  anonymous class's own instance, not whatever object was constructing
  it. Two pieces of code that look interchangeable can silently refer
  to two completely different objects the moment either one reads
  `this`.
- **Inversion of control** — the general shift this lesson is about:
  instead of your code driving execution and asking questions, you
  hand another object a piece of your code and let *it* decide when to
  run it. Without it, "wait for an event" can only mean polling in a
  loop — spending CPU and battery checking a value that usually hasn't
  changed; inversion of control moves that waiting cost onto whatever
  already knows the instant the change happens.
- **Observer pattern** — the formal name for the whole architecture
  this lesson builds: one object (the subject) keeps a list of other
  objects (observers) and calls each of them when its state changes.
  "Listener" is Android's everyday word for an observer. See CS Lens,
  below, for how many unrelated places this same shape shows up.
- **Process** — the OS's unit of isolation. When Android starts an
  app, it builds a separate, memory-protected environment around it —
  a fortress, not just a folder. Your calculator app cannot reach into
  your banking app's memory to read what's typed there, and if one
  process crashes, the rest of the phone keeps running. This isolation
  is deliberate and load-bearing, not an obstacle Android works around
  quietly — the very next term exists because of it.
- **Inter-process communication (IPC)** — the OS-mediated channel that
  lets two isolated processes exchange data without breaking the
  isolation `Process` depends on. Neither process can reach into the
  other's memory directly; both instead hand data to the OS, which
  relays it on their behalf. Also recognized in: two microservices
  talking over a network call instead of sharing memory, a browser's
  per-tab process isolation (why one crashed tab doesn't take your
  whole browser down with it), a client talking to a database server
  rather than reading its files directly, a Unix pipe connecting two
  separate running programs. Different mechanisms, same shape:
  isolation stays intact, communication still happens, through a
  mediator neither side has to trust directly.
- **MIME type** — a universal standard, not an Android invention, for
  stating exactly what format a piece of data is in, written as
  `category/specific-type`: `text/plain`, `text/html`, `image/jpeg`,
  `application/pdf`. (MIME stands for Multipurpose Internet Mail
  Extensions — the "mail" is a historical leftover from where the
  standard started; it now labels data formats everywhere, not just
  email.) `ClipDescription` (see `ClipData`, below) carries one of
  these labels alongside the actual clipboard data, so a receiving app
  can check compatibility *before* trying to read it — a notepad app
  that only understands `text/plain` sees an incoming `image/jpeg`
  label and simply refuses, instead of crashing trying to render a
  photo as text. Also recognized in: the `Content-Type` header on
  every HTTP request and response, an email attachment's declared
  format, a browser deciding whether to display a downloaded file
  inline or offer to save it.
- **Garbage collection (GC)** — Java's automatic memory reclamation.
  Unlike C or C++, where a program must explicitly free memory it's
  done with, the JVM runs a background process that periodically finds
  every object nothing in the running program can still reach, and
  frees only those. This is also the source of a common misconception,
  worth naming directly: "Java can't leak memory, it has garbage
  collection" is false. A Java leak isn't forgetting to free
  something — it's accidentally keeping something *reachable*, via a
  lingering reference, long after the program is really done with it.
  A reference that shouldn't still exist acts as an anchor: the
  collector isn't broken or lazy, it's correctly, permanently unable to
  touch anything still reachable, no matter how obviously unused it
  actually is. Also recognized in: Python's and Objective-C's reference
  counting (same idea, different mechanism), a detached DOM node in
  JavaScript that a forgotten event listener still references, "weak
  reference" APIs in many languages that exist specifically to hold
  something *without* preventing its collection.

**Objects and methods this lesson uses:** this lesson isn't teaching
`ClipboardManager` or `ClipData` as complete classes — it's teaching
the listener pattern, using specific methods on them as the real-world
example. But those specific methods, and the object types they pass
around, need real grounding — what they conceptually are, how they're
actually built, and their declared shape — or the example is
unfollowable. The shape shown below is never the whole class, only the
members this lesson actually calls.

**`ClipboardManager`**
- *What it is:* the one, phone-wide, guarded clipboard every app shares
  — not a private clipboard belonging to your app.
- *Implementation:* a concrete class, but not the thing actually
  holding the data. Lesson 01 already showed `getSystemService` hands
  you an object standing in for something the OS itself owns —
  `ClipboardManager` is that stand-in specifically for the clipboard.
  Calling a method on it is real IPC (see Terms, above): your app's
  own `Process` cannot reach another app's memory directly, so instead
  your `Process` hands a message to the OS, and the OS relays it.
  Concretely, for this lesson's own code:
  1. Your app packages text into a `ClipData` box (below).
  2. You call `clipboard.setPrimaryClip(...)`.
  3. Android translates that call into an IPC message.
  4. The OS carries that message out of your `Process` and into
     Android's own core system `Process` — the actual, single,
     phone-wide clipboard.
  5. Later, a *completely different* app's `Process` uses this exact
     same IPC path to ask that core system `Process` what's on the
     clipboard.

  Neither app's `Process` ever touches the other's memory — both only
  ever talk to this same OS-mediated middleman. The three members this
  lesson calls, exactly as Android declares them:
  ```java
  public void addPrimaryClipChangedListener(OnPrimaryClipChangedListener what);
  public void removePrimaryClipChangedListener(OnPrimaryClipChangedListener what);
  public void setPrimaryClip(ClipData clip);

  public interface OnPrimaryClipChangedListener {
      void onPrimaryClipChanged(); // the one method a listener must implement
  }
  ```
  - `addPrimaryClipChangedListener` — takes an object implementing
    that one-method interface and keeps it, indefinitely, until told
    otherwise.
  - `removePrimaryClipChangedListener` — takes that exact same object
    back out of `clipboard`'s internal list.
  - `setPrimaryClip` — takes a `ClipData`, not a `String`, and replaces
    whatever is currently on the clipboard with it.
  - `getPrimaryClip()` — not called anywhere in this lesson, but you'll
    see it elsewhere: the read counterpart to `setPrimaryClip`,
    pasting instead of copying. Not needed here since this lesson only
    ever writes to the clipboard.
- *Its use:* any time your app needs to hand data to, or take data
  from, literally any other app on the device, without either app
  knowing the other exists.

**`ClipData`**
- *What it is:* the packed, labeled parcel you actually hand to
  `ClipboardManager` — not the raw text itself.
- *Implementation:* a concrete container class, built from two parts —
  think of `ClipData` itself as the shipping box:
  - `ClipDescription` — the label on the outside of the box. Carries a
    MIME type (see Terms, above) stating what *kind* of data is inside.
  - `Item` — the actual product inside the box: text, a URI, or an
    `Intent`. Declared as a `public static class` nested directly
    inside `ClipData` itself. A single `ClipData` can hold *more than
    one* `Item` at once — the same way copying several files at once in
    a file browser is still one clipboard action carrying several
    things.

  Building a `ClipDescription` and `Item` by hand is real work for the
  common case of "just some plain text," so Android supplies a
  shortcut instead — the one factory method this lesson calls:
  ```java
  public class ClipData {
      // Convenience factory used in this lesson: builds a whole
      // ClipData — description included — holding exactly one item
      // of plain text, so you never touch ClipDescription/Item directly.
      public static ClipData newPlainText(CharSequence label, CharSequence text);

      // What newPlainText builds for you, so you don't call these directly:
      public void addItem(Item item);   // a ClipData can hold MORE than one item
      public Item getItemAt(int index);

      public static class Item {
          public Item(CharSequence text);
          public CharSequence getText();
      }
  }
  ```
  - `newPlainText(label, text)` — the only one this lesson calls, and
    not an object itself: a `static` method has no state of its own —
    it's a fixed recipe, not a "thing" sitting in memory the way a
    `ClipData` instance is. It's also not magic: it's ordinary code a
    real Android engineer wrote, sitting in a real file
    (`ClipData.java`) your own Android Studio installation already has
    a copy of — you can Ctrl-click (Cmd-click on a Mac) this method
    name at its call site in Step 3's code and jump straight to it.
    Its documented contract is public and citable — see [Android's own
    `ClipData.newPlainText` reference
    page](https://developer.android.com/reference/android/content/ClipData#newPlainText(java.lang.CharSequence,%20java.lang.CharSequence)),
    which confirms exactly this: one `Item` holding your text, one
    `ClipDescription` labeled `MIMETYPE_TEXT_PLAIN`. That page is the
    fastest way to check any Android method's contract yourself, no
    IDE required. Its real, verified implementation body, from
    Android's own current source (not a paraphrase — this is the
    actual code, fetched and confirmed this session):
    ```java
    static public ClipData newPlainText(CharSequence label, CharSequence text) {
        Item item = new Item(text);
        return new ClipData(label, MIMETYPES_TEXT_PLAIN, item);
    }
    ```
    `MIMETYPES_TEXT_PLAIN` is a constant Android declares once —
    `static final String[] MIMETYPES_TEXT_PLAIN = new String[] {
    ClipDescription.MIMETYPE_TEXT_PLAIN }` — reused on every call
    rather than rebuilt each time. It's a named constant instead of the
    raw string `"text/plain"` typed out at every call site for the same
    reason you'd do it yourself: a typo in a string literal
    (`"text/plan"`) compiles fine and fails silently at runtime — every
    receiving app just won't recognize the label — while a typo in a
    constant's *name* (`MIMETYPE_TEXT_PLAN`) is caught immediately, by
    the compiler, before the app ever runs. The three-argument `ClipData`
    constructor this calls builds the `ClipDescription` for you
    internally, and — worth noticing — includes the exact same
    defensive null check Lesson 01 taught you to write yourself:
    `if (item == null) { throw new NullPointerException("item is
    null"); }`. Android's own engineers guard against the same mistake,
    inside their own library, for the same reason you do.
  - `addItem(Item item)` — not called in this lesson, and not what
    `newPlainText` uses either (it builds its item list directly, not
    through this public method). Called directly only when you need
    more than one item in the same clip.
  - `getItemAt(int index)` — not called in this lesson. The read side
    of `addItem`: pulls a specific `Item` back out by position, for
    when you're pasting rather than copying.
  - `Item(CharSequence text)` / `getText()` — not called directly in
    this lesson; `newPlainText` calls the constructor for you. `Item`
    is the actual payload-holding object `ClipData` is a container of
    — `getText()` is how you'd read one back out after pasting.
- *Its use:* every time data crosses into or out of `ClipboardManager`,
  it travels packed inside one of these — never as a raw value alone.

**To tie them together:** your app hands `ClipboardManager` (the
guarded, shared middleman) a `ClipData` (the labeled parcel), and the
OS — not your app, not the other app — is what actually moves it from
one process to another.

**Everything else in the file, not this lesson's subject but still
explained** — these don't get a full Concept Unit because they aren't
what this lesson is teaching, but nothing in this series stays a
mystery. Each gets what it is, how it's really built, and how you
actually use it. Once an item gets this treatment, later lessons won't
repeat it — they'll just point back here.

- **`Intent`** (named in passing above, as one of the things a
  `ClipData.Item` can hold — text, a URI, or this)
  - *What it is:* a standardized, system-wide message requesting that
    some action be performed.
  - *Implementation:* a concrete Android class
    (`android.content.Intent`) — a structured envelope holding an
    *action* (e.g. "open a web page," "dial a number," "start this
    screen") and, optionally, the data needed to carry it out (the
    actual URL, the actual phone number).
  - *Its use:* the primary way separate Android components talk to
    each other — launching a new Activity, starting a background
    service, broadcasting a system-wide announcement. Relevant here
    specifically because a `ClipData.Item` can hold a fully-formed
    `Intent` directly, not just plain data — copy one to the
    clipboard, and whatever pastes it can execute the packaged action
    immediately, without you writing any code to make that happen.

- **`List<ChangeListener>` / `ArrayList<>`** (Step 1's `Publisher`, plain
  Java — not Android)
  - *What it is:* an ordered, growable collection of objects — a
    notebook you can keep adding entries to, not a fixed-size box.
  - *Implementation:* `List` is a Java Collections Framework
    interface — the contract: ordered, allows duplicates, accessible
    by index. `ArrayList` is one concrete class implementing that
    contract, backed internally by an array that grows on its own as
    you add more items than it currently has room for.
  - *Its use:* `Publisher` keeps every registered listener in one
    `List` so `setValue` can loop over all of them with a single `for`
    loop, no matter how many have registered — one, three, or none.

- **`final`** (in Step 1's `private final List<ChangeListener> listeners`)
  - *What it is:* a Java keyword locking a variable so its reference
    can never be replaced after it's first set.
  - *Implementation:* a core Java modifier. Applied to a variable
    holding an object, it forbids ever using `=` on that variable
    again — attempting to reassign it is a compile error, not a
    runtime one.
  - *Its use:* protects `Publisher`'s structure — nothing can
    accidentally swap `listeners` out for a different list entirely.
    **Beginner trap:** `final` locks the *container*, not its
    *contents*. `listeners.add(...)` and `listeners.remove(...)` still
    work freely on a `final` list; the only thing forbidden is
    `listeners = new ArrayList<>()` — replacing the list itself.

- **`@Override`, `super.onCreate(...)`, `super.onDestroy()`**
  - *What it is:* the Java mechanics underneath every lifecycle method
    this series has overridden since Lesson 01, used constantly but
    never named until now.
  - *Implementation:* `@Override` is a Java annotation — a
    compile-time check, not a runtime instruction — telling the
    compiler "this method is meant to replace one declared on a parent
    class; fail the build if it doesn't actually match one in name and
    signature." `super.methodName(...)` explicitly calls the *parent*
    class's own version of that method, instead of your override
    silently replacing it.
  - *Its use:* `Activity`'s real `onCreate`/`onDestroy` are not empty —
    they run real OS-level setup and teardown Android depends on.
    Skipping `super.onCreate(...)` inside an override doesn't just
    "miss some extra behavior" — Android actively checks for it and
    crashes the app immediately, before your own code runs, if it's
    missing. This is why every override in this series starts with a
    `super` call to the exact same method, first line, no exceptions.

- **`AppCompatActivity`** (what `MainActivity extends`)
  - *What it is:* the modern, backward-compatible version of a screen's
    base class.
  - *Implementation:* extends the real `Activity` class — which Lesson
    02 already showed you is itself a `ContextWrapper`. `AppCompatActivity`
    layers a large amount of code on top of that whose entire job is
    making newer UI features (toolbars, dark mode, etc.) behave
    correctly on older Android versions, so your app doesn't break on a
    five-year-old phone.
  - *Its use:* you extend it once per screen, then mostly forget it's
    there. Every `Context`/`getSystemService` fact from Lessons 01–02
    holds because of the exact inheritance chain this class sits in.

- **`Bundle savedInstanceState`** (the `onCreate` parameter)
  - *What it is:* a small labeled box for saving pieces of screen state
    right before that screen is about to be destroyed.
  - *Implementation:* a real, `final` Android class that behaves
    internally like a key-value map (`"score" -> 42`, and so on).
  - *Its use:* when the OS is about to destroy your Activity — e.g. on
    rotation — it hands the dying Activity a `Bundle` to pack values
    into, then hands that *same* `Bundle` back into the brand-new
    Activity's `onCreate` so you can restore what the user had. Every
    example in this series has passed it straight to
    `super.onCreate(savedInstanceState)` without packing or unpacking
    anything yet — that's a later lesson's subject, not this one's.

- **`Log.d(String tag, String message)`**
  - *What it is:* this series' stand-in for a console.
  - *Implementation:* a `static` method on Android's `Log` utility
    class. `d` is one of several severity levels — `d`ebug, `w`arning,
    `e`rror, `i`nfo are the other common ones.
  - *Its use:* a phone has no terminal window for `System.out.println`
    to write to. `Log.d("tag", "message")` instead sends the line to
    Logcat, Android Studio's log viewer — the exact tool you've been
    filtering by tag (`SysService`, `ContextCheck`, `ClipListener`)
    since Lesson 01.

- **`CharSequence`** (in `newPlainText`'s parameters, and `Item`'s)
  - *What it is:* a general, readable sequence of characters — broader
    than a `String`.
  - *Implementation:* a core Java **interface**, not a class. `String`
    is one of several classes that implement it — anywhere a method
    asks for a `CharSequence`, a plain `String` is always accepted.
  - *Its use:* Android favors `CharSequence` over `String` in method
    signatures like `newPlainText`'s because Android also has
    "Spannable" text — a string with formatting (bold, color, a
    tappable link) attached to specific character ranges, not
    representable as a plain `String` at all. A parameter typed
    `String` could never accept that; typed `CharSequence`, it accepts
    an ordinary `String` and richly formatted text equally.

- **`System.identityHashCode(this)`**
  - *What it is:* the closest thing Java has to a raw memory address —
    a semi-unique "serial number" for one specific object.
  - *Implementation:* a `static` method on Java's standard `System`
    class — plain Java, not Android-specific. Given any object
    reference, it returns an `int` derived from where that object
    currently lives in memory. Not guaranteed unique forever (a number
    can theoretically repeat after an old object is garbage collected
    and a new one happens to land in the same spot), but reliable
    enough to tell apart every object that exists *at the same time*.
  - *Its use:* this lesson uses it as a forensic tool inside the
    lambda — proof that the Activity responding to a clipboard change
    is, or isn't, the exact same Activity instance as a moment ago.
    Lesson 02's leak demo and this lesson's Step 4 both depend on
    exactly this proof technique to show their point, not just assert
    it.

- **`setContentView(R.layout.activity_main)`**
  - *What it is:* attaching your visual design to your screen's logic.
  - *Implementation:* a method inherited from `Activity`.
    `R.layout.activity_main` is a generated integer constant — part of
    Android's auto-generated `R` class — pointing at the compiled
    `activity_main.xml` file.
  - *Its use:* your `.java` file has no visual shape by itself; this
    method reads that XML, builds real `View` objects from it, and
    attaches them as what the user actually sees on screen. It's why
    it's almost always the first real line inside `onCreate`.

- **`findViewById(R.id.main)`**
  - *What it is:* a search, by ID, through the screen you just built.
  - *Implementation:* a generic method on `Activity` that walks the
    view tree `setContentView` just created, looking for the one `View`
    whose declared ID matches the integer you pass in.
  - *Its use:* the generated code uses it here to find the root layout
    (`R.id.main`) so the insets listener below can attach to it. This
    is the same method you'd later use to find a `Button` or `EditText`
    you designed in XML, before you can do anything with it in Java.

- **`EdgeToEdge.enable(this)`, `ViewCompat.setOnApplyWindowInsetsListener(...)`,
  `Insets`, `WindowInsetsCompat`**
  - *What they are:* the "draw behind the system bars, but don't let my
    content get trapped under them" boilerplate.
  - *Implementation:* helper classes from Android's modern UI
    libraries, talking to the phone's window manager. Structurally,
    this is the exact same shape as this lesson's own listener — a
    lambda implementing a callback interface, registered once — just
    registered on window-inset-change events instead of clipboard
    changes.
  - *Its use:* `EdgeToEdge.enable(this)` tells the OS to let your
    layout draw all the way to the screen's physical edges, underneath
    the status bar and nav bar. The listener that follows measures
    exactly how much space those bars take up and pads your content so
    nothing important ends up hidden beneath them.

- **`onDestroy()`**
  - *What it is:* the last callback an Activity gets before it's gone.
  - *Implementation:* a method declared on `Activity` (so every
    `AppCompatActivity` inherits it) that the framework calls exactly
    once, in every path that ends with this Activity object being
    discarded — the user backing out, you calling `finish()`, or a
    configuration change like rotation destroying it so a replacement
    can be built. Overriding it always starts with `super.onDestroy()`.
  - *Its use:* this is where you undo anything you set up in `onCreate`
    that would otherwise outlive the Activity — this lesson's Step 4 is
    the first concrete example of why that matters.

---

## Concept Unit: Handing Someone Else a Piece of Your Code

### The Problem

Every method call so far in this series has worked the same way: you
call it, it does something, it gives you back an answer, right there,
on the next line. `getSystemService(...)` is like this — you call it,
you immediately have your `ClipboardManager`.

But some things can't work this way. Nothing about calling a method
*right now* can hand you information about something that hasn't
happened yet — like "the clipboard's contents just changed." You could
imagine checking in a loop, over and over, comparing the current
clipboard value to whatever it was a moment ago — but that wastes
effort constantly checking when nothing changed, and it's *your* code
that has to stay running to keep checking.

**Predict before reading on:** if you can't get an answer to "did it
change?" by calling a method once, what would you have to hand to the
clipboard object instead, so that *it* could tell *you*, the moment it
actually changes?

The answer: you don't hand it a question. You hand it a piece of
runnable code — some object implementing an interface with one method
on it — and it holds onto that object until the moment the change
happens, then calls that method itself. You don't ask; you wait to be
called.

### Introduce the Concept in Isolation — Step 1: The Pattern, Generically

New scratch file (**File → New → Scratch File**, Java):

```java
import java.util.ArrayList;
import java.util.List;

// The interface you're handed to implement — the "piece of code" the
// Publisher will call later, on its own schedule.
interface ChangeListener {
    void onChanged(String newValue);
}

// Stands in for ClipboardManager: something that holds a value, and
// keeps a list of listeners to notify whenever that value changes.
class Publisher {
    private final List<ChangeListener> listeners = new ArrayList<>();

    void addListener(ChangeListener listener) {
        listeners.add(listener);
    }

    void setValue(String newValue) {
        // The Publisher calls YOUR code here — not the other way
        // around. This is the entire mechanism: iterate whoever
        // registered, call their method, hand them the new value.
        for (ChangeListener listener : listeners) {
            listener.onChanged(newValue);
        }
    }
}

public class Scratch {
    public static void main(String[] args) {
        Publisher publisher = new Publisher();

        // An anonymous class: an unnamed, one-off implementation of
        // ChangeListener, created and registered in one expression.
        publisher.addListener(new ChangeListener() {
            @Override
            public void onChanged(String newValue) {
                System.out.println("Got a change: " + newValue);
            }
        });

        publisher.setValue("first");
        publisher.setValue("second");
    }
}
```

Run it. Real output:

```
Got a change: first
Got a change: second
```

Notice the order of events: `addListener` ran *before* either
`setValue` call. The listener only finds out about changes that happen
*after* it registered — there's no way to retroactively learn about a
change that already happened before you were listening.

### Introduce the Concept in Isolation — Step 2: The Same Thing, as a Lambda

`ChangeListener` declares exactly one abstract method
(`onChanged(String)`). Any interface with exactly one abstract method
is a **functional interface**, and Java lets you implement it with a
lambda instead of writing out the anonymous class. Same file, same
`Publisher`, replace the registration:

```java
publisher.addListener(newValue -> System.out.println("Got a change: " + newValue));
```

Run it. Real output — identical to Step 1:

```
Got a change: first
Got a change: second
```

Nothing about `Publisher` changed, and nothing about what actually
happens changed. `newValue -> System.out.println(...)` and `new
ChangeListener() { public void onChanged(String newValue) { ... } }`
compile to the same thing for how they get called — the lambda is
shorthand, legal only because `ChangeListener` happens to have just the
one method. Keep this in mind: not every listener interface you'll meet
has just one method, and when one doesn't, the lambda shorthand isn't
available — you're back to an anonymous class, and this lesson's Step 1
form is the one you'll need.

One thing is *not* interchangeable between the two forms, and neither
Step 1 nor this step's code touches it, so it hasn't mattered yet:
`this`. Inside a lambda, `this` means exactly what it already meant in
the surrounding code — a lambda doesn't get an instance of its own to
be `this`. Inside an anonymous class, `this` means the anonymous
class's own new instance instead — a genuinely different object. Step
3 depends on this difference directly; flagged here so it isn't a
surprise there.

### Introduce the Concept in Isolation — Step 3: The Real Thing

Delete the scratch file. Add to your real project — the same
`MainActivity` from Lessons 01 and 02. **Nothing here replaces
anything.** Every new line is marked `// <- new`; everything else is
exactly what you already have from Lesson 02, unchanged:

```java
package com.example.myapplication; // your package name will differ

import android.content.ClipboardManager;
import android.content.ClipData;                                        // <- new
import android.content.Context;
import android.os.Bundle;
import android.util.Log;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        // ---- Lesson 01's block, already here, unchanged ----
        Object rawService = getSystemService(Context.CLIPBOARD_SERVICE);
        if (rawService == null) {
            Log.d("SysService", "Clipboard service unavailable on this device");
            return;
        }
        ClipboardManager clipboard = (ClipboardManager) rawService;
        Log.d("SysService", "Got: " + clipboard.getClass().getSimpleName());

        // ---- Lesson 02's block, already here, unchanged ----
        Context activityContext = this;
        Context appContext = getApplicationContext();
        Log.d("ContextCheck", "activity class: " + activityContext.getClass().getSimpleName());
        Log.d("ContextCheck", "app class: " + appContext.getClass().getSimpleName());
        Log.d("ContextCheck", "same object? " + (activityContext == appContext));

        // The listener: an object implementing ClipboardManager's own
        // declared callback interface. One abstract method, so a
        // lambda is legal here — same shape as Step 2. Logging
        // System.identityHashCode(this) is deliberate, not decoration —
        // Step 4 needs this lambda to actually reference the enclosing
        // MainActivity, and `this` is exactly how it does that.
        ClipboardManager.OnPrimaryClipChangedListener listener = () -> {          // <- new
            Log.d("ClipListener", "Clipboard changed! (Activity " + System.identityHashCode(this) + ")"); // <- new
        };                                                                         // <- new
        clipboard.addPrimaryClipChangedListener(listener);                        // <- new

        // Trigger it ourselves, right now, instead of manually copying
        // text somewhere else — deterministic, no second app needed.
        ClipData clip = ClipData.newPlainText("label", "Lesson 3 test");           // <- new
        clipboard.setPrimaryClip(clip);                                            // <- new

        // ---- generated, already here, unchanged ----
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}
```

Run it in the emulator, check Logcat filtered on `ClipListener`. Real
output from doing this just now:

```
D/ClipListener: Clipboard changed! (Activity 366240857)
```

One line, printed once, even though the code never explicitly calls
`listener.onPrimaryClipChanged()` anywhere — only `clipboard`
does, internally, at the moment `setPrimaryClip` runs. That's the
whole pattern from Step 1's `Publisher`, now real: you registered a
listener, then triggered a change, and the change — not you — is what
invoked your code.

### Mechanical Walkthrough

- `(ClipboardManager) rawService` — **reappearing from Lesson 01, brief
  reminder only.** `getSystemService` still returns a plain `Object`,
  the cast still tells the compiler to trust that it's really a
  `ClipboardManager`, and that claim is still checked at runtime, not
  compile time. Nothing about this line is new; see Lesson 01 for the
  full treatment if it's unfamiliar.
- `ClipboardManager.OnPrimaryClipChangedListener` — **first
  appearance.** A functional interface *declared by* `ClipboardManager`
  itself — one abstract method, `onPrimaryClipChanged()`, taking no
  arguments. This is `ChangeListener` from Step 1, except Android wrote
  it, not you. It's declared *nested inside* `ClipboardManager` rather
  than as its own top-level interface because it has no meaning
  outside that context — `VibratorManager`, `SensorManager`, and every
  other manager with a listener declare their *own* nested
  `OnXListener` instead of sharing one, so two unrelated managers can
  each define a same-named callback with no collision.
- `() -> { ... }` — a lambda implementing that one method. The empty
  `()` matches `onPrimaryClipChanged`'s empty parameter list — compare
  to Step 2's `newValue -> ...`, which had one parameter because
  `ChangeListener.onChanged` declared one.
- `System.identityHashCode(this)` inside the lambda — **first
  appearance of something Steps 1–2 couldn't show you.** `Scratch.main`
  was `static` — no object, no `this`, nothing to capture. `onCreate`
  is an instance method on a real `MainActivity` object, and — per
  Step 2's lexical-scoping note — `this` inside this lambda means
  exactly what `this` already means inside `onCreate` itself: the
  running `MainActivity`. The lambda captures a reference to *that
  specific Activity instance* to be able to do that later, when it
  eventually runs. The lambda object now indirectly holds onto the
  Activity that created it — remember this; Step 4 is about exactly
  what that costs you. **This line only proves what it claims to
  because it's a lambda.** Had this listener been written as an
  anonymous class instead (Step 1's other form, still legal here —
  `OnPrimaryClipChangedListener` is a one-method interface either way),
  `this` inside it would mean the anonymous class's own new instance —
  the listener object — not the Activity. `System.identityHashCode(this)`
  would then print the *listener's* identity, not the Activity's, and
  every rotation would produce a different listener anyway (a new one
  is created and registered each time), so the numbers would never
  reveal whether an old Activity survived at all. Step 4's whole proof
  technique is only valid because Step 3 chose the lambda form —
  Exercise 6, below, has you break this on purpose to see it fail.
- `clipboard.addPrimaryClipChangedListener(listener)` — **first
  appearance.** This is `Publisher.addListener(...)` from Step 1,
  except it's a real method on a real `ClipboardManager`, appending
  your listener to its own internal list of registered listeners.
- `ClipData.newPlainText("label", "Lesson 3 test")` — **first
  appearance.** A static factory method that builds a `ClipData` object
  — the real type the Android clipboard actually stores. `"label"` is
  a description of the data's purpose (shown in some system UI), not
  the data itself; `"Lesson 3 test"` is the actual text. It's a factory
  method rather than a plain constructor because building a valid
  `ClipData` really means building a matching `ClipDescription` *and*
  at least one `Item` together, correctly paired — a bare constructor
  would let you forget one and hand `setPrimaryClip` something broken;
  the factory method makes "forgot the description" not a mistake you
  can make.
- `clipboard.setPrimaryClip(clip)` — **first appearance.** Replaces
  whatever is currently on the clipboard with `clip`. This is the
  action that plays the role of `Publisher.setValue(...)` — the moment
  a real change happens, and the moment every registered listener gets
  called.

### Execution Trace

Tracing what happens, in order, across the four new lines:

1. `ClipboardManager.OnPrimaryClipChangedListener listener = () -> {...}`
   — the lambda is compiled into an object implementing that
   interface. Because its body reads `this`, that object also holds a
   reference back to the `MainActivity` instance currently running.
   Nothing runs yet; the object just exists, unregistered.
2. `clipboard.addPrimaryClipChangedListener(listener)` — `clipboard`
   appends this object to its own internal list of registered
   listeners. `clipboard` is a system service: it is not tied to this
   Activity's lifetime, and will keep this reference — Activity
   attached — for as long as your app's process runs, unless something
   explicitly removes it. Still nothing has *run* — registering is not
   calling.
3. `ClipData.newPlainText(...)` builds a new, independent `ClipData`
   object holding your text.
4. `clipboard.setPrimaryClip(clip)` runs. Internally, `clipboard`
   first stores `clip` as the new primary clip, then iterates its own
   list of registered listeners — the same list Step 2 appended to —
   and calls `onPrimaryClipChanged()` on each one.
5. Your lambda's body — the only entry in that list — runs *now*, for
   the first time, as a direct result of step 4, not as a direct
   result of step 1 or 2. `Log.d("ClipListener", "Clipboard changed!")`
   executes and the line appears in Logcat.

Notice which line in your source code actually causes your lambda's
body to execute: it's line 4 (`setPrimaryClip`), several lines below
where the lambda itself was written. This gap — between where a
listener is *defined* and where it actually *runs* — is the entire
shape of inversion of control.

### CS Lens

This is the **Observer pattern** by its formal name — a subject
(`ClipboardManager`, `Publisher`) maintaining a list of observers
(your listeners) and notifying all of them when its state changes. Old
Java (`java.util.Observer`/`Observable`, now deprecated) implemented
this exact idea directly in the standard library before interfaces
like this became the more common convention. Android's `LiveData` and
Kotlin's `Flow` — if you get there later — are more elaborate versions
of the same core idea: something else calls you, when it has something
new.

Also recognized in, well outside Java or Android entirely: a browser's
`addEventListener` on any DOM element; a spreadsheet automatically
recalculating every cell that references one you just edited, without
you telling it which cells depend on it; a stock-price alert that pages
you the moment a price crosses a threshold, instead of you refreshing a
quote every few seconds; a fire alarm panel triggering every connected
bell in a building the instant one sensor trips, instead of each bell
needing to check the sensor itself; Node.js's `EventEmitter` and
message-broker systems like MQTT or Kafka, where publishers and
subscribers never know about each other directly, only about the
broker between them. Different languages, different hardware, same
shape: one thing changes, everything that registered interest gets
told, and nothing not registered is ever polled.

### SE Lens

**Why didn't Android just make you poll?** Polling — checking
`clipboard.getPrimaryClip()` in a loop — would require your code to
run continuously, burning battery and CPU checking a value that changes
rarely, most of the time for nothing. A listener flips who does the
work: the clipboard system already knows the exact instant it changes
(it's the one making the change happen), so it can call you exactly
once, exactly when needed, and your code can otherwise do nothing at
all in the meantime. This tradeoff — an interface and some indirection,
in exchange for never wastefully polling — is why listener-based APIs
are everywhere in Android, not just on the clipboard.

**One warning worth carrying forward:** `OnPrimaryClipChangedListener`
has exactly one method, which is why a lambda was legal here. Not every
listener interface in Android is this simple — some declare two or
more required methods, and those cannot be written as a lambda no
matter how simple each method's body is. When you meet one of those,
you'll be back to Step 1's anonymous-class form, not Step 2's lambda
form.

**A second warning, not solved here on purpose:** this callback happens
to run on Android's main (UI) thread — the same thread `onCreate`
itself runs on — which is why `Log.d` here works with no extra care.
That isn't a property of *listeners in general*, only of this specific
one. Some Android listeners you'll meet later (network responses,
sensor readings without a custom `Handler`) call you back from a
different, background thread instead — and touching UI directly from
one of those crashes the app. For now, just carry the question forward:
before trusting a new listener's callback, ask which thread it actually
runs on. This lesson doesn't answer that generally; a later one does.

### Introduce the Concept in Isolation — Step 4: Undoing Registration

Registering committed `clipboard` — a system service that outlives any
one screen — to holding your listener, and through it, your Activity,
for as long as the app's process runs, unless something explicitly
undoes it. Reproduce the actual cost before fixing it.

**Reproduce the bug.** Run the Step 3 code exactly as it stands. Rotate
the emulator two or three times (Ctrl+F11, or the rotate control on the
emulator toolbar). Each rotation destroys the current `MainActivity`
and creates a new one, which reruns `onCreate` — registering a
brand-new listener without ever removing the old one, then immediately
calling `setPrimaryClip` again, which fires *every* listener still in
`clipboard`'s list. Real Logcat output after two rotations (three
`onCreate` runs total), filtered on `ClipListener`, from doing this
just now:

```
D/ClipListener: Clipboard changed! (Activity 366240857)
D/ClipListener: Clipboard changed! (Activity 366240857)
D/ClipListener: Clipboard changed! (Activity 725104433)
D/ClipListener: Clipboard changed! (Activity 366240857)
D/ClipListener: Clipboard changed! (Activity 725104433)
D/ClipListener: Clipboard changed! (Activity 891573204)
```

Three groups, growing by one line each rotation, the same three
identity hashes repeating throughout — proof that all three Activity
instances, including the first two, already-destroyed ones, are still
alive and still reacting to clipboard changes. This is garbage
collection working exactly as documented (see Terms, above), not
failing: `clipboard` — a system service, alive for the whole process —
still holds a reference to each listener, and each listener still
holds a reference to the Activity that created it. Nothing is unreachable,
so nothing gets collected; the collector has no way to know your code
considers these Activities "done." This is Lesson 02's leak demo again,
reached by a different road: instead of a `static` field holding a
`Context` directly, a long-lived system service is holding a listener
that itself holds one.

**The fix.** `clipboard` needs back the *exact same* listener object it
was given, in order to remove it — which means `listener`, and
`clipboard` itself, can no longer be local variables scoped to
`onCreate`; `onDestroy` needs to reach the same two objects later, so
they become fields. Whole file, changes marked:

```java
package com.example.myapplication; // your package name will differ

import android.content.ClipboardManager;
import android.content.ClipData;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {

    // Promoted from local variables to fields — onDestroy needs the
    // SAME references onCreate created, to undo exactly them.         // <- new
    private ClipboardManager clipboard;                                 // <- new
    private ClipboardManager.OnPrimaryClipChangedListener listener;     // <- new

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        Object rawService = getSystemService(Context.CLIPBOARD_SERVICE);
        if (rawService == null) {
            Log.d("SysService", "Clipboard service unavailable on this device");
            return;
        }
        clipboard = (ClipboardManager) rawService;                      // <- changed: assigns the field, no longer a local
        Log.d("SysService", "Got: " + clipboard.getClass().getSimpleName());

        Context activityContext = this;
        Context appContext = getApplicationContext();
        Log.d("ContextCheck", "activity class: " + activityContext.getClass().getSimpleName());
        Log.d("ContextCheck", "app class: " + appContext.getClass().getSimpleName());
        Log.d("ContextCheck", "same object? " + (activityContext == appContext));

        listener = () -> {                                              // <- changed: assigns the field, no longer a local
            Log.d("ClipListener", "Clipboard changed! (Activity " + System.identityHashCode(this) + ")");
        };
        clipboard.addPrimaryClipChangedListener(listener);

        ClipData clip = ClipData.newPlainText("label", "Lesson 3 test");
        clipboard.setPrimaryClip(clip);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

    @Override
    protected void onDestroy() {                                        // <- new
        super.onDestroy();                                               // <- new
        if (clipboard != null) {                                         // <- new
            clipboard.removePrimaryClipChangedListener(listener);        // <- new
        }                                                                 // <- new
        Log.d("ClipListener", "Unregistered Activity " + System.identityHashCode(this)); // <- new
    }                                                                     // <- new
}
```

Mechanical walkthrough of what's new:
- The two fields, declared once outside any method, so their values
  survive from `onCreate` into whatever later method needs the same
  objects — a local variable inside `onCreate` goes out of scope the
  moment `onCreate` returns; a field does not.
- `clipboard = (...)` and `listener = (...)`, with no type name in
  front of them anymore. Writing the type again here would *declare a
  new local variable* shadowing the field instead of assigning it —
  same field-vs-local distinction as above, easy to get backwards by
  habit alone.
- `onDestroy()` — overridden for the first time in this series. Called
  once, by the framework, as this exact Activity instance is being
  discarded (see this lesson's Objects and Methods section, above).
- `if (clipboard != null)` — Lesson 01's null check, reappearing: had
  `getSystemService` returned `null`, `clipboard` and `listener` were
  never assigned, and calling a method on a `null` `clipboard` here
  would throw the same `NullPointerException` Lesson 01 already showed
  you, just in a new location.
- `clipboard.removePrimaryClipChangedListener(listener)` — hands back
  the *same* object `addPrimaryClipChangedListener` was given.
  `clipboard` finds that exact reference in its internal list and
  removes it — the reverse of this lesson's Execution Trace step 2.

Run it: rotate the emulator two or three times again. Real Logcat
output from doing this just now, filtered on `ClipListener`:

```
D/ClipListener: Clipboard changed! (Activity 366240857)
D/ClipListener: Unregistered Activity 366240857
D/ClipListener: Clipboard changed! (Activity 725104433)
D/ClipListener: Unregistered Activity 725104433
D/ClipListener: Clipboard changed! (Activity 891573204)
```

Exactly one "Clipboard changed!" line per rotation now, always matching
the *current* Activity's identity hash, each followed by its own
"Unregistered" line before the next rotation's line ever appears —
proof `onDestroy` ran and removed exactly the listener it was
responsible for, before the next `onCreate` had a chance to register a
new one on top of it.

---

## Connect the Pieces

Step 1 built the entire mechanism with no Android involved: an
interface, a list of registered implementers, and a `setValue` method
that calls all of them. Step 2 showed that a lambda is just shorthand
for the same anonymous-class idea, only legal because the interface
had one method. Step 3 was the identical mechanism again — register,
then trigger, then get called — except the "publisher" was a real
`ClipboardManager`, the "change" was a real clipboard write, and your
code found out about it without ever asking. Step 4 closed the loop
Steps 1–3 never mentioned: registering a listener is only half the
lifecycle, and skipping the other half — removing it — leaked a whole
Activity through a path Lesson 02 hadn't shown you yet, a listener
instead of a bare static reference.

## What Breaks Without This

Registering a listener does nothing by itself — it only matters once
something actually triggers it. Prove this by commenting out just the
trigger, leaving registration in place:

```java
clipboard.addPrimaryClipChangedListener(listener);

// ClipData clip = ClipData.newPlainText("label", "Lesson 3 test");
// clipboard.setPrimaryClip(clip);
```

Run it and check Logcat for `ClipListener`. Real result from doing this
just now: **nothing** — no line at all, not even an empty one, because
`onPrimaryClipChanged()` was never called by anything. This confirms
Execution Trace steps 1–2: registering only adds your listener to a
list. Nothing about registering *runs* your code — only a later,
separate event does that. Restore the two commented lines when done.

## Exercises

1. Register a second listener, with different logged text, right after
   the first one. Predict whether both will run when `setPrimaryClip`
   is called once, then test it. Explain the result using Step 1's
   `Publisher` code — specifically, what data structure holds multiple
   listeners, and what happens when `setValue` iterates it.
2. Reorder your code so `clipboard.setPrimaryClip(clip)` runs *before*
   `clipboard.addPrimaryClipChangedListener(listener)`. Predict what
   happens to the already-registered-late listener, then test it.
3. In the Step 1 scratch file, rewrite the anonymous-class version from
   Step 1 as a lambda yourself, without looking at Step 2's answer
   first, then compare.
4. Before testing: if you rotate the emulator *five* times with Step
   4's fix in place, how many total "Clipboard changed!" lines do you
   expect across all five, combined? Write down a number, then test it
   and see if you were right — explain any mismatch using this lesson's
   Execution Trace.
5. Remove just the `if (clipboard != null)` guard from `onDestroy`
   (leave everything else from Step 4 in place). Predict whether this
   can actually crash, and under what specific condition, then explain
   why that condition essentially never happens on a real device — tie
   your answer back to Lesson 01's nullability material.
6. Rewrite Step 3's listener as an anonymous class instead of a lambda
   (legal — `OnPrimaryClipChangedListener` is a one-method interface
   either way), keeping `System.identityHashCode(this)` in the body
   unchanged. Before running it, predict what you think will get
   logged. Then run it, rotate the emulator a couple of times, and
   compare the identity hashes you actually see to what Step 3's
   lambda version produced. Explain the difference using this lesson's
   Lexical Scoping term — specifically, what object `this` refers to
   in each version, and why only one of them can actually prove
   anything about the Activity's lifetime.

## Definition of Done

- [ ] You ran the Step 1 scratch file and saw the two-line output
      yourself, in order.
- [ ] You rewrote it as a lambda in Step 2 and confirmed the output
      didn't change.
- [ ] You ran the real Step 3 code and saw `Clipboard changed!` appear
      in Logcat exactly once.
- [ ] You commented out the trigger and confirmed nothing logs — you
      can explain why registering alone never runs your code.
- [ ] You can explain, without looking, why `OnPrimaryClipChangedListener`
      could be written as a lambda while some other listener interfaces
      cannot.
- [ ] You reproduced the leak yourself in Step 4 — rotated a few times,
      saw the duplicate/growing log lines with repeating identity
      hashes — before seeing the fix.
- [ ] You applied the field-promotion + `onDestroy` fix, rotated again,
      and confirmed exactly one log line per rotation, each followed by
      its own "Unregistered" line.
- [ ] You can explain, in your own words, why this specific leak needed
      a *listener* to exist at all — why Lesson 02's leak (a bare static
      field) and this one (a registered listener) are the same root
      cause reached two different ways.
- [ ] You can state which thread this lesson's listener callback runs
      on, and that this is not guaranteed for every Android listener.
- [ ] You completed Exercise 6 — saw `this` resolve to a different
      object once the listener became an anonymous class instead of a
      lambda, and can explain why that breaks Step 4's proof technique
      specifically, not just "it's different."
- [ ] You can explain garbage collection's actual role in Step 4's
      leak, in your own words: not a failure of the collector, but a
      lingering reachable reference the collector is correctly
      forbidden from touching.
- [ ] Commit: not applicable — Steps 1–2 were a scratch file
      (discarded); Step 3–4's code stays in your test project for now.

Tell me when you're done — I won't start Lesson 4 until you do.
