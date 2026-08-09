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
  code later, when something happens.
- **Anonymous class** — an unnamed, one-off class, defined and
  instantiated in a single expression, usually to implement an
  interface on the spot without giving the implementation its own
  named `.java` file.
- **Lambda expression** — shorthand syntax for exactly one specific
  case of an anonymous class: implementing an interface that declares
  exactly one abstract method.
- **Functional interface** — the formal name for an interface that
  declares exactly one abstract method, which is what makes the lambda
  shorthand legal for it in the first place.
- **Inversion of control** — the general shift this lesson is about:
  instead of your code driving execution and asking questions, you
  hand another object a piece of your code and let *it* decide when to
  run it.
- **Observer pattern** — the formal name for the whole architecture
  this lesson builds: one object (the subject) keeps a list of other
  objects (observers) and calls each of them when its state changes.
  "Listener" is Android's everyday word for an observer.

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
  Calling a method on it crosses a process boundary (IPC —
  inter-process communication) to the one real clipboard the whole
  device shares, which is exactly why two unrelated apps can copy and
  paste between each other without ever knowing the other exists: both
  only ever talk to this same middleman, never to each other directly.
  The three members this lesson calls, exactly as Android declares
  them:
  ```java
  public void addPrimaryClipChangedListener(OnPrimaryClipChangedListener what);
  public void removePrimaryClipChangedListener(OnPrimaryClipChangedListener what);
  public void setPrimaryClip(ClipData clip);

  public interface OnPrimaryClipChangedListener {
      void onPrimaryClipChanged(); // the one method a listener must implement
  }
  ```
  `addPrimaryClipChangedListener` takes an object implementing that
  one-method interface and keeps it — indefinitely, until told
  otherwise. `removePrimaryClipChangedListener` takes that exact same
  object back out of `clipboard`'s internal list. `setPrimaryClip`
  takes a `ClipData` — not a `String` — and replaces whatever is
  currently on the clipboard with it. (There's a fourth method you'll
  see elsewhere but this lesson never calls: `getPrimaryClip()`, the
  read counterpart to `setPrimaryClip` — pasting, not copying. Not
  needed here since this lesson only ever writes to the clipboard.)
- *Its use:* any time your app needs to hand data to, or take data
  from, literally any other app on the device, without either app
  knowing the other exists.

**`ClipData`**
- *What it is:* the packed, labeled parcel you actually hand to
  `ClipboardManager` — not the raw text itself.
- *Implementation:* a concrete container class, built from two parts:
  a `ClipDescription` (a label stating what *kind* of data this is —
  plain text, a link, an image — so a receiving app can check
  compatibility before trying to use it) and one or more `Item`s (the
  actual payload — text, a URI, or an `Intent`). A single `ClipData`
  can hold *more than one* `Item` at once — the same way copying
  several files at once in a file browser is still one clipboard
  action carrying several things. Building a `ClipDescription` and
  `Item` by hand is real work for the common case of "just some plain
  text," so Android supplies a shortcut instead — the one factory
  method this lesson calls:
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
  `newPlainText(label, text)` builds one `Item` wrapping `text`, builds
  a matching plain-text `ClipDescription`, and returns a `ClipData`
  already holding both — the shortcut is still building the same real,
  multi-part container underneath, which is why `setPrimaryClip` takes
  a `ClipData` and not a bare `String`.
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
compile to the same thing — the lambda is purely shorthand, legal only
because `ChangeListener` happens to have just the one method. Keep this
in mind: not every listener interface you'll meet has just one method,
and when one doesn't, the lambda shorthand isn't available — you're
back to an anonymous class, and this lesson's Step 1 form is the one
you'll need.

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

- `ClipboardManager.OnPrimaryClipChangedListener` — **first
  appearance.** A functional interface *declared by* `ClipboardManager`
  itself — one abstract method, `onPrimaryClipChanged()`, taking no
  arguments. This is `ChangeListener` from Step 1, except Android wrote
  it, not you.
- `() -> { ... }` — a lambda implementing that one method. The empty
  `()` matches `onPrimaryClipChanged`'s empty parameter list — compare
  to Step 2's `newValue -> ...`, which had one parameter because
  `ChangeListener.onChanged` declared one.
- `System.identityHashCode(this)` inside the lambda — **first
  appearance of something Steps 1–2 couldn't show you.** `Scratch.main`
  was `static` — no object, no `this`, nothing to capture. `onCreate`
  is an instance method on a real `MainActivity` object, and this
  lambda's body reads `this`, so the lambda captures a reference to
  *this specific Activity instance* to be able to do that later, when
  it eventually runs. The lambda object now indirectly holds onto the
  Activity that created it — remember this; Step 4 is about exactly
  what that costs you.
- `clipboard.addPrimaryClipChangedListener(listener)` — **first
  appearance.** This is `Publisher.addListener(...)` from Step 1,
  except it's a real method on a real `ClipboardManager`, appending
  your listener to its own internal list of registered listeners.
- `ClipData.newPlainText("label", "Lesson 3 test")` — **first
  appearance.** A static factory method that builds a `ClipData` object
  — the real type the Android clipboard actually stores. `"label"` is
  a description of the data's purpose (shown in some system UI), not
  the data itself; `"Lesson 3 test"` is the actual text.
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
alive and still reacting to clipboard changes. This is Lesson 02's leak
demo again, reached by a different road: instead of a `static` field
holding a `Context` directly, a long-lived system service is holding a
listener that itself holds one.

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
- [ ] Commit: not applicable — Steps 1–2 were a scratch file
      (discarded); Step 3–4's code stays in your test project for now.

Tell me when you're done — I won't start Lesson 4 until you do.
