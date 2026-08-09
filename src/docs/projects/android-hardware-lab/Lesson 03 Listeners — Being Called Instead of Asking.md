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
- **Inversion of control** — the general shift this lesson is about:
  instead of your code driving execution and asking questions, you
  hand another object a piece of your code and let *it* decide when to
  run it.

**Objects and methods this lesson uses — shape, not full internals:**
this lesson isn't teaching `ClipboardManager` or `ClipData` as complete
classes — it's teaching the listener pattern, using specific methods on
them as the real-world example. But those specific methods and the
object types they pass around need their actual declared shape shown,
or the example is unfollowable. Nothing below is the whole class —
just the members this lesson actually calls.

`ClipboardManager` — the two members this lesson calls, exactly as
Android declares them:
```java
public void addPrimaryClipChangedListener(OnPrimaryClipChangedListener what);
public void setPrimaryClip(ClipData clip);

public interface OnPrimaryClipChangedListener {
    void onPrimaryClipChanged(); // the one method a listener must implement
}
```
`addPrimaryClipChangedListener` takes an object implementing that
one-method interface and keeps it. `setPrimaryClip` takes a `ClipData`
— not a `String` — and replaces whatever is currently on the clipboard
with it.

`ClipData` — why it isn't just a `String`, and the one factory method
this lesson calls:
```java
public class ClipData {
    // Convenience factory used in this lesson: builds a ClipData
    // holding exactly one item of plain text.
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
The real Android clipboard doesn't just store text — it can carry
multiple `Item`s at once (each holding text, a URI, or an `Intent`),
plus a description of what type of data it is. `ClipData` is the
container for all of that. `newPlainText(label, text)` is a shortcut
that builds a `ClipData` holding exactly one plain-text `Item`, so this
lesson never has to construct an `Item` or a description by hand — but
the shortcut is still building the same real container underneath,
which is why `setPrimaryClip` takes a `ClipData` and not a bare
`String`.

**Also present, but not this lesson's subject — left unexplained on
purpose:** `Bundle savedInstanceState`, `AppCompatActivity`, `Log.d`,
the generated `EdgeToEdge.enable(this)` / `findViewById` /
`ViewCompat.setOnApplyWindowInsetsListener(...)` block, and
`setContentView(R.layout.activity_main)`. These exist in the file
because Android Studio's template put them there or because this
series uses `Log.d` as its console — none of them are the mechanism
this lesson demonstrates, and none of them get shape shown here.

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
        // lambda is legal here — same shape as Step 2.
        ClipboardManager.OnPrimaryClipChangedListener listener = () -> {          // <- new
            Log.d("ClipListener", "Clipboard changed!");                          // <- new
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
D/ClipListener: Clipboard changed!
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
   interface. Nothing runs yet; the object just exists, unregistered.
2. `clipboard.addPrimaryClipChangedListener(listener)` — `clipboard`
   appends this object to its own internal list of registered
   listeners. Still nothing has *run* — registering is not calling.
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

---

## Connect the Pieces

Step 1 built the entire mechanism with no Android involved: an
interface, a list of registered implementers, and a `setValue` method
that calls all of them. Step 2 showed that a lambda is just shorthand
for the same anonymous-class idea, only legal because the interface
had one method. Step 3 was the identical mechanism again — register,
then trigger, then get called — except the "publisher" was a real
`ClipboardManager`, the "change" was a real clipboard write, and your
code found out about it without ever asking.

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
- [ ] Commit: not applicable — Steps 1–2 were a scratch file
      (discarded); Step 3's code stays in your test project for now.

Tell me when you're done — I won't start Lesson 4 until you do.
