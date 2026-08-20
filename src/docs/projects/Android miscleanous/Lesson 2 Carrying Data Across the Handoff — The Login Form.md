# Lesson 2: Carrying Data Across the Handoff — The Login Form

**What you will build:** A real `LoginActivity` with two `EditText`
fields (username, password) and a "Log In" button. Tapping it reads
what the user typed and carries the username along inside the `Intent`
that launches the next screen, which displays it. `MainActivity`'s
button from Lesson 1 is retargeted to open this new screen instead of
the placeholder `SecondActivity` it opened before. The transferable
problem: Lesson 1 proved that an `Intent` can make one `Activity` hand
control to another — but each `Activity` is its own independently
creatable object, with no shared memory or object references between
them. This lesson is about the actual mechanism for getting a real
value — not just control — across that boundary.

**What you need to know first:** Lesson 1 — the `Activity` class, the
Manifest's role in declaring components, `AppCompatActivity`,
`onCreate`, `setContentView`, `findViewById`, `Button`,
`setOnClickListener`, the explicit `Intent`, and `startActivity`. This
lesson's code sits directly on top of `MainActivity` and `SecondActivity`
exactly as Lesson 1 left them.

**Terms used in this lesson**

- **Manifest** — `AndroidManifest.xml`, the file declaring, in advance,
  every component the OS is allowed to create. This exists because the
  OS itself decides when to construct an `Activity` — your code never
  calls `new LoginActivity()` — and it needs a fixed, declared list to
  consult before it can do that; an undeclared `Activity` crashes the
  instant something tries to start it, with
  `ActivityNotFoundException`. Reappearing here because `LoginActivity`
  needs its own `<activity>` entry before `MainActivity`'s button can
  successfully launch it.
- **Layout (XML)** — a `.xml` file under `res/layout/` describing a
  screen's visual structure — what views exist, in what arrangement —
  separately from the Java code that gives them behavior. This exists
  so a screen's appearance and its behavior can be edited independently.
  Reappearing here because `LoginActivity` needs its own new layout
  file, `activity_login.xml`, distinct from `activity_main.xml`.
- **View** — the base class for anything drawn on screen a user can see
  or touch. Reappearing here because both new widgets this lesson
  introduces, `EditText` and `TextView`, are `View` subclasses, and the
  APIs this lesson uses to find and read them (`findViewById`) are
  written against `View`'s own contract.
- **Intent extra** — a single piece of data attached to an `Intent`
  under a string key, in addition to the target-component information
  Lesson 1 already covered. This exists because an `Intent` is not just
  a bare "go to this class" instruction — it's a general-purpose
  message object, and messages are far more useful when they can carry
  a payload, not just a destination. Without this mechanism, the only
  way for `LoginActivity` to tell the next screen what username was
  typed would be some kind of shared, globally-accessible storage — a
  much worse design this lesson's SE Lens returns to, below.

**Objects and methods used**

- **`Activity`**
  - *What it is:* The Android framework class representing one screen.
  - *Implementation:* `public class Activity extends ContextWrapper
    implements ComponentCallbacks2, ...` — part of the Android SDK.
  - *Its use:* `LoginActivity`, this lesson's new screen, is (indirectly,
    through `AppCompatActivity`) a subclass of this, exactly as
    `MainActivity` and `SecondActivity` were in Lesson 1.
  - *Type:* A public framework class, meant to be subclassed, never
    instantiated with `new`.
  - *Responsibility:* Owns one screen's entire lifecycle and exposes
    the callback methods — `onCreate` chief among them — that your
    subclass overrides to run code at the right moment.
  - *Depends on:* Being constructed by the OS, and being declared in
    the Manifest — the same dependency that made Lesson 1's
    `SecondActivity` crash when its entry was removed.
  - *Connects to:* The OS creates it and drives its lifecycle; it can
    build an `Intent` and call `startActivity` on itself to hand off to
    another `Activity` — exactly the mechanism this lesson extends with
    real data.
  - *Shape:* The outermost architectural boundary in the app — the seam
    between OS-driven code and app-written code.

- **`AppCompatActivity`**
  - *What it is:* The support-library subclass of `Activity` this
    project's screens actually extend.
  - *Implementation:* `public class AppCompatActivity extends
    FragmentActivity`, itself extending `Activity` — from
    `androidx.appcompat.app`.
  - *Its use:* `LoginActivity extends AppCompatActivity`, the same
    parent class `MainActivity` and `SecondActivity` already use.
  - *Type:* A public class, meant to be subclassed.
  - *Responsibility:* Everything `Activity` does, plus compatibility
    shims for older Android versions, including theming behavior
    Lesson 7 will depend on.
  - *Depends on:* A Manifest declaration, same as plain `Activity`.
  - *Connects to:* Sits between `LoginActivity`'s own code and the
    framework's `Activity`; your code calls its inherited methods.
  - *Shape:* A compatibility layer — an internal implementation detail,
    invisible to this lesson's actual logic.

- **`onCreate(Bundle savedInstanceState)`**
  - *What it is:* A lifecycle callback, inherited from `Activity`,
    overridden in every screen this project has.
  - *Implementation:* `protected void onCreate(@Nullable Bundle
    savedInstanceState)`, overridden with `@Override`.
  - *Its use:* Where `LoginActivity` sets up its two `EditText` fields
    and its button; also where `SecondActivity`'s modified version, in
    this lesson's third unit, reads the incoming username.
  - *Type:* A `protected` instance method, overridden, not called
    directly by your own code.
  - *Responsibility:* Gives a newly-created `Activity` its one-time
    chance to set up its screen before the user can see or touch it.
  - *Depends on:* Being called by the OS, which supplies
    `savedInstanceState`; this lesson still doesn't use that parameter's
    contents.
  - *Connects to:* Called by the OS; internally calls
    `super.onCreate(...)`, then `setContentView`, then `findViewById`.
  - *Shape:* The callback boundary between framework timing and app
    logic.

- **`setContentView(int layoutResID)`**
  - *What it is:* An `Activity` method attaching a layout to the screen.
  - *Implementation:* `public void setContentView(@LayoutRes int
    layoutResID)`.
  - *Its use:* Called once in `LoginActivity.onCreate`, attaching the
    new `activity_login.xml` layout.
  - *Type:* A `public` instance method.
  - *Responsibility:* Inflates the given XML file into real `View`
    objects and installs the result as the screen's visible content.
  - *Depends on:* A valid layout resource ID, which depends on a real
    file existing under `res/layout/`.
  - *Connects to:* Called by `onCreate`; drives Android's XML-inflation
    system, which is what turns `<EditText>` tags into real objects.
  - *Shape:* The seam between the declarative layout file and the
    imperative code that follows it.

- **`findViewById(int id)`**
  - *What it is:* A method for retrieving a specific view just created
    by `setContentView`.
  - *Implementation:* `public <T extends View> T findViewById(@IdRes int
    id)`.
  - *Its use:* Called four times in this lesson — twice in
    `LoginActivity` (for each `EditText`), once for its `Button`, and
    once in `SecondActivity` (for the `TextView` that will display the
    username).
  - *Type:* A `public` instance method.
  - *Responsibility:* Searches the inflated view hierarchy for the view
    whose `android:id` matches the given ID and returns a live
    reference to it.
  - *Depends on:* `setContentView` having already run.
  - *Connects to:* Called after `setContentView`; reads IDs the layout
    XML declared with `android:id="@+id/..."`.
  - *Shape:* The bridge from the declarative layout world into
    imperative code.

- **`Button`**
  - *What it is:* A `View` subclass representing a tappable button.
  - *Implementation:* `public class Button extends TextView`, itself
    extending `View` — `android.widget`.
  - *Its use:* `LoginActivity`'s "Log In" button, the interactive
    element that triggers reading the form and building the `Intent`.
  - *Type:* A public class, created by layout inflation, never with
    `new` in this lesson's own code.
  - *Responsibility:* Renders as a tappable, labeled rectangle and
    reports taps to a registered `View.OnClickListener`.
  - *Depends on:* A unique `android:id` in the layout XML.
  - *Connects to:* Created by inflation; retrieved by `findViewById`;
    has a listener attached via `setOnClickListener`.
  - *Shape:* A leaf node in the view hierarchy — the actual tappable
    surface.

- **`setOnClickListener(View.OnClickListener l)`**
  - *What it is:* A `View` method registering a tap callback.
  - *Implementation:* `public void setOnClickListener(@Nullable
    OnClickListener l)`, declared on `View` itself; `OnClickListener` is
    a nested interface with one method, `onClick(View v)`.
  - *Its use:* Registers the lambda that reads both `EditText` fields
    and builds the outgoing `Intent`.
  - *Type:* A `public` instance method.
  - *Responsibility:* Stores the given listener and arranges for its
    `onClick` to run once per tap.
  - *Depends on:* An object implementing `View.OnClickListener` — a
    lambda, in this lesson.
  - *Connects to:* Called on the `Button`; the listener it's given
    calls `getText()`, builds an `Intent`, and calls `startActivity`.
  - *Shape:* A callback boundary between the OS's touch system and app
    logic.

- **`Intent`**
  - *What it is:* A framework class representing a request — here, both
    "start this Activity" (Lesson 1) and, new in this lesson, "carry
    this data along."
  - *Implementation:* `public Intent(Context packageContext, Class<?>
    cls)` — the same two-argument constructor from Lesson 1, from
    `android.content.Intent`.
  - *Its use:* Built inside `LoginActivity`'s click listener, naming
    `SecondActivity` as the target and, new here, carrying the typed
    username.
  - *Type:* A public class, constructed directly with `new`.
  - *Responsibility:* Carries everything needed to describe a hand-off
    — which component, and now, which data — as one self-contained
    object built in one place and read in another.
  - *Depends on:* A `Context` and a target `Class`, same as Lesson 1;
    now also depends on whatever extras are attached to it via
    `putExtra`, below.
  - *Connects to:* Built by `LoginActivity`'s listener; consumed by
    `startActivity`; its extras are later read back out by
    `SecondActivity` via `getIntent()` and `getStringExtra`.
  - *Shape:* A data-transfer object at the boundary between two
    Activities.

- **`startActivity(Intent intent)`**
  - *What it is:* An `Activity` method asking the OS to launch the
    component described by an `Intent`.
  - *Implementation:* `public void startActivity(Intent intent)`.
  - *Its use:* Called from `LoginActivity`'s click listener, the same
    role it played for `MainActivity` in Lesson 1.
  - *Type:* A `public` instance method.
  - *Responsibility:* Hands the `Intent` to the OS's component-
    resolution system, which checks the Manifest and, if the target is
    declared, constructs and starts it.
  - *Depends on:* A fully-built `Intent`, and the target being declared
    in the Manifest.
  - *Connects to:* Called by the click listener; hands control to the
    OS, which constructs `SecondActivity` and calls its `onCreate`.
  - *Shape:* The literal moment control — and now, data — passes from
    one screen to another.

- **`EditText`**
  - *What it is:* A concrete `View` subclass representing an editable
    text field.
  - *Implementation:* `public class EditText extends TextView`, itself
    extending `View` — `android.widget`.
  - *Its use:* Two instances in `activity_login.xml` — one for the
    username, one for the password — giving the user somewhere to type.
  - *Type:* A public class, created by layout inflation.
  - *Responsibility:* Renders an editable field, accepts keyboard input,
    manages its own internal text buffer, and exposes `getText()` to
    read that buffer's current contents.
  - *Depends on:* A unique `android:id` in the layout for retrieval; an
    `android:inputType` attribute controlling keyboard behavior (this
    lesson sets `textPassword` on the password field so the device
    shows a masking keyboard and obscures typed characters).
  - *Connects to:* Created by inflation; retrieved by `findViewById`;
    read via `getText()` inside the click listener.
  - *Shape:* A leaf view — the actual on-screen input surface.

- **`getText()`**
  - *What it is:* A `TextView` instance method (inherited by `EditText`)
    returning the field's current text.
  - *Implementation:* `public Editable getText()` — returns
    `android.text.Editable`, not a plain `String`.
  - *Its use:* Called on both `EditText` fields inside the click
    listener, to read what the user actually typed.
  - *Type:* A `public` instance method.
  - *Responsibility:* Returns a live reference to the field's internal,
    mutable text buffer at the exact moment it's called.
  - *Depends on:* Being called on an already-existing `EditText`
    instance — calling it before `setContentView` has run would have
    nothing to call it on at all.
  - *Connects to:* Called by the click listener; its return value is
    immediately converted with `toString()`, below.
  - *Shape:* The bridge from a UI widget's internal state into plain
    application logic.

- **`Editable`**
  - *What it is:* An interface representing mutable, editable text.
  - *Implementation:* `public interface Editable extends CharSequence,
    Spannable, Appendable` — from `android.text`; a real concrete
    implementation is what `getText()` actually returns, not a plain
    `String`.
  - *Its use:* The real return type of `getText()`, sitting between the
    widget and the plain `String` this lesson's code actually wants.
  - *Type:* An interface, never instantiated directly by this lesson's
    own code.
  - *Responsibility:* Represents text that can be modified in place —
    characters inserted or removed — while the widget that owns it
    keeps rendering it live as the user types. This is why `getText()`
    can't simply return a plain `String`: a `String` in Java is
    immutable (see below), and a text field's content changes on every
    keystroke, which would mean constructing a brand-new `String`
    object on every single character typed.
  - *Depends on:* The `EditText` instance that owns the underlying
    buffer.
  - *Connects to:* Returned by `getText()`; converted to `String` by
    `toString()`, immediately after.
  - *Shape:* An internal representation seam this lesson passes through
    but doesn't otherwise manipulate.

- **`toString()`**
  - *What it is:* A method converting an `Editable` into a plain,
    immutable `String` snapshot.
  - *Implementation:* `public String toString()` — every `Editable`
    implementation provides a real, concrete override of this method
    (declared generically on `java.lang.Object`, and re-declared more
    specifically as part of `CharSequence`'s own contract, which
    `Editable` extends).
  - *Its use:* Chained directly onto `getText()` in this lesson's code
    — `getText().toString()` — to get a plain `String` the rest of the
    code can store and pass along.
  - *Type:* A `public` instance method, called on the `Editable` object
    `getText()` just returned.
  - *Responsibility:* Produces a fixed, immutable copy of the
    `Editable`'s current characters at the moment it's called — a
    snapshot that will *not* keep changing even if the user keeps
    typing afterward, unlike the live `Editable` it was built from.
  - *Depends on:* An already-obtained `Editable` instance to call it on.
  - *Connects to:* Called immediately on `getText()`'s return value; its
    result is what actually gets stored in a `String` variable and,
    later, attached to the `Intent` via `putExtra`.
  - *Shape:* The final conversion step at the boundary between a live
    UI widget and a plain, storable value.

- **`String`**
  - *What it is:* Java's built-in class representing a fixed, immutable
    sequence of characters.
  - *Implementation:* `public final class String implements
    CharSequence, ...` — from `java.lang`, automatically available
    without any import.
  - *Its use:* The type this lesson's code actually stores the username
    in, after converting it out of the widget's live `Editable`.
  - *Type:* A `public final` class — `final` meaning it cannot be
    subclassed at all, which is part of how Java guarantees its
    immutability.
  - *Responsibility:* Holds a fixed sequence of characters that, once
    constructed, can never be changed — any operation that looks like
    "modifying" a `String` (concatenation, for instance) actually
    produces a brand-new `String` object instead.
  - *Depends on:* Nothing external — it's part of the Java language
    itself.
  - *Connects to:* Produced by `toString()`; passed as an argument to
    `putExtra`, below, and later returned by `getStringExtra`.
  - *Shape:* A plain value type, not tied to any particular Android
    concept — the actual payload riding inside the `Intent`.

- **`Intent.putExtra(String name, String value)`**
  - *What it is:* An `Intent` instance method attaching a named piece
    of data to the `Intent`.
  - *Implementation:* `public Intent putExtra(String name, String
    value)` — one of many overloaded versions of `putExtra`, each
    accepting a different value type (`int`, `boolean`, `String`, and
    more); this lesson uses the `String` overload specifically. Returns
    the same `Intent` it was called on, allowing calls to be chained.
  - *Its use:* Attaches the username, under the key `"username"`, to
    the `Intent` being built in `LoginActivity`'s click listener, before
    it's handed to `startActivity`.
  - *Type:* A `public` instance method, called on the just-constructed
    `Intent` object.
  - *Responsibility:* Stores the given value inside the `Intent`'s
    internal extras storage, associated with the given string key, so
    it can be retrieved later by any code that ends up holding this
    same `Intent` object.
  - *Depends on:* An already-constructed `Intent` to call it on; a
    string key the receiving side will need to know and match exactly.
  - *Connects to:* Called on the `Intent` right after its constructor,
    before `startActivity`; its stored value is what
    `getStringExtra`, below, retrieves on the other side.
  - *Shape:* The actual mechanism by which data — not just a
    destination — crosses the Activity boundary this lesson exists to
    teach.

- **`getIntent()`**
  - *What it is:* An `Activity` instance method returning the `Intent`
    that was used to start this very `Activity`.
  - *Implementation:* `public Intent getIntent()` — declared on
    `Activity` itself.
  - *Its use:* Called inside `SecondActivity`'s `onCreate`, to get back
    the same `Intent` object `LoginActivity` built and attached the
    username to.
  - *Type:* A `public` instance method, called on `this` (implicitly)
    from inside `SecondActivity`.
  - *Responsibility:* Hands back a reference to the exact `Intent` the
    OS used to construct this `Activity`, extras and all, so the
    receiving screen can inspect what it was launched with.
  - *Depends on:* This `Activity` having actually been started via an
    `Intent` in the first place — every `Activity` in this app is, so
    this always succeeds here, but it's worth noting the dependency
    explicitly.
  - *Connects to:* Its return value is immediately chained into
    `getStringExtra`, below.
  - *Shape:* The receiving-side mirror of `startActivity` — where
    `startActivity` is where the sending screen hands the `Intent` off,
    `getIntent()` is where the receiving screen gets it back.

- **`Intent.getStringExtra(String name)`**
  - *What it is:* An `Intent` instance method retrieving a previously
    attached `String` extra by its key.
  - *Implementation:* `public String getStringExtra(String name)` —
    the retrieval counterpart to the `putExtra(String, String)`
    overload used on the sending side; returns `null` if no extra was
    stored under that exact key.
  - *Its use:* Called on the `Intent` returned by `getIntent()`, using
    the exact same key string, `"username"`, that `LoginActivity` used
    when it called `putExtra`.
  - *Type:* A `public` instance method.
  - *Responsibility:* Looks up the given key in the `Intent`'s internal
    extras storage and returns the associated `String`, or `null` if
    nothing was stored under that key — which is why the key strings on
    both sides of this hand-off have to match exactly, character for
    character, with nothing in the language itself enforcing that.
  - *Depends on:* The `Intent` actually having had a value stored under
    this exact key by `putExtra` on the sending side.
  - *Connects to:* Called on `getIntent()`'s return value; its result
    is passed straight into `setText`, below, to actually display it.
  - *Shape:* The exact receiving-side counterpart of `putExtra` — where
    that method wrote data into the `Intent`, this one reads it back
    out.

- **`TextView`**
  - *What it is:* A `View` subclass for displaying (non-editable, by
    default) text on screen.
  - *Implementation:* `public class TextView extends View` —
    `android.widget`; both `EditText` and `Button`, above, are actually
    subclasses of this.
  - *Its use:* A new `TextView` in `activity_second.xml`, used to
    display the username `SecondActivity` receives.
  - *Type:* A public class, created by layout inflation.
  - *Responsibility:* Renders a given piece of text on screen, and
    exposes `setText`, below, to change what text it shows after it's
    already been created.
  - *Depends on:* A unique `android:id` in the layout, for retrieval via
    `findViewById`.
  - *Connects to:* Created by inflation; retrieved by `findViewById` in
    `SecondActivity.onCreate`; its content is changed via `setText`.
  - *Shape:* A leaf view — the actual on-screen surface the username
    ends up rendered onto.

- **`setText(CharSequence text)`**
  - *What it is:* A `TextView` instance method changing the text it
    displays.
  - *Implementation:* `public final void setText(CharSequence text)` —
    one of several overloaded versions; this lesson uses the one
    accepting a `CharSequence`, which a plain `String` satisfies
    directly, since `String` implements `CharSequence` (see the
    `String` entry, above).
  - *Its use:* Called on the new `TextView` in `SecondActivity`, with
    the username `getStringExtra` just returned, making the received
    value actually visible on screen.
  - *Type:* A `public final` instance method — `final` here meaning
    subclasses of `TextView` cannot override it.
  - *Responsibility:* Replaces whatever text the view was previously
    showing (in this case, whatever placeholder text, if any, the XML
    layout gave it) with the given text, and triggers the view to
    redraw itself with the new content.
  - *Depends on:* Being called on an already-retrieved `TextView`
    instance, after `setContentView` has run.
  - *Connects to:* Called with `getStringExtra`'s return value as its
    argument — the final link in the chain this whole lesson traces.
  - *Shape:* The very last leaf in this lesson's data path — the
    on-screen proof that a value really did cross from one `Activity`
    to another.

---

## Concept Unit: Capturing What the User Typed

### The Problem

`LoginActivity` needs two fields the user can type into — a username and
a password — and, when the button is tapped, a way for the code to
actually read back whatever characters ended up in those fields. A
`Button`'s tap alone (Lesson 1) carries no information about what's in
some other, unrelated view on the same screen; something has to
explicitly go ask each field what it currently holds.

### Introduce the Concept in Isolation

A throwaway scratch layout and Activity, deleted once understood:

```xml
<!-- throwaway layout -->
<EditText
    android:id="@+id/scratch_field"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="Type something" />
```

```java
// throwaway onCreate body
EditText field = findViewById(R.id.scratch_field);
Log.d("SCRATCH", "Before typing: '" + field.getText().toString() + "'");
```

Running this and typing "hello" into the field, then triggering the same
log line again from a second, throwaway button tap, shows:

```
D/SCRATCH: Before typing: ''
D/SCRATCH: After typing: 'hello'
```

The empty string on the first line, before any typing happened, and the
literal typed text on the second, is the proof: `getText().toString()`
doesn't return some fixed value from when the layout was declared — it
reads the field's *live, current* contents at the exact moment it's
called. This chained call — retrieving the widget's live text buffer
with **`getText()`**, then converting it to a plain, fixed **`String`**
with **`toString()`** — is the standard pattern for reading user input
out of any Android text field.

### Discard the Throwaway Example

This scratch field and its log statements are deleted. The real
`LoginActivity` layout, with two real `EditText` fields, is built next.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition; no external reference implementation exists for this
  project.
- **Files affected:** `app/src/main/res/layout/activity_login.xml`
  (new file); `app/src/main/java/.../LoginActivity.java` (new file).
- **Change type:** Add (both files are new).
- **Location:** N/A — brand-new files have nothing to locate a position
  within yet.
- **Dependencies:** None beyond what Lesson 1 already established.

### The New Code

```xml
<EditText
    android:id="@+id/username_input"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="Username" />

<EditText
    android:id="@+id/password_input"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:inputType="textPassword"
    android:hint="Password" />
```

### The Updated Project

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:orientation="vertical"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="24dp">

    <EditText
        android:id="@+id/username_input"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Username" />

    <EditText
        android:id="@+id/password_input"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:inputType="textPassword"
        android:hint="Password" />

    <Button
        android:id="@+id/login_button"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Log In" />

</LinearLayout>
```

As a whole, this layout now describes a complete, working login form —
two labeled input fields stacked above a button, padded away from the
screen edges — rather than the single bare field the throwaway lab used
to prove the underlying mechanism.

### Mechanical Walkthrough

- **`<LinearLayout ... android:orientation="vertical">`** — the
  container element; `LinearLayout` arranges its direct children in a
  single row or column, and `vertical` here means top-to-bottom, which
  is why the two fields and the button stack instead of sitting
  side-by-side. This is a real Android framework class
  (`android.widget.LinearLayout`, itself a `View` subclass, per the
  Header's `View` entry) being used here purely as a container in XML,
  not called from Java in this unit.
- **`android:padding="24dp"`** — an attribute adding space between the
  container's edge and its children on all four sides; `dp`
  ("density-independent pixels") is Android's resolution-independent
  unit, ensuring this spacing looks the same physical size across
  devices with different screen densities rather than being a fixed
  pixel count that would look larger or smaller depending on the
  device.
- **`android:id="@+id/username_input"`** — declares this specific
  `EditText`'s identifier, which `findViewById` will use in the next
  unit to retrieve it; the `+` in `@+id/` means "create this ID if it
  doesn't already exist," as opposed to `@id/`, which references one
  already defined elsewhere.
- **`android:hint="Username"`** — placeholder text shown only while the
  field is empty, disappearing the moment the user types anything; this
  is separate from the field's actual content — `getText()` never
  returns hint text, only what the user has actually typed.
- **`android:inputType="textPassword"`** — an attribute on the second
  `EditText` telling Android's keyboard system to mask entered
  characters and offer a keyboard suited for password entry, rather
  than the default plain-text keyboard.

### CS Lens

Nothing here rises to the level of a hard concept (a design pattern, an
SE principle) — a declarative UI layout is routine syntax for this
platform, not a transferable computer-science idea worth a Recognition
list of its own.

### SE Lens

Declaring the form's structure in XML rather than building it entirely
in Java (`new EditText(this); field.setHint("Username"); ...`, and so on
for every widget) is the same separation-of-concerns tradeoff the Header
already named for layouts generally: the visual structure of the screen
can be read, and edited, without touching a single line of the Java
logic that gives it behavior — and Android Studio's own visual layout
editor can render and edit this XML directly, something it cannot do for
widgets built entirely in code. The cost: two files now have to agree
with each other by ID string alone (`R.id.username_input` in Java has to
match `android:id="@+id/username_input"` in XML exactly), with nothing
in the language itself checking that agreement beyond a build-time
generated constant — a renamed ID in one file silently breaks the other
until compiled, since `findViewById` calls with a stale or missing ID
fail loudly, but a typo introduced in the XML file alone shows up only
as a compiler error on the Java side referencing `R.id`.

### Commands Needed

No new terminal commands — building and running continues to use Android
Studio's Run button, as in Lesson 1.

### Run It

Not yet independently runnable — this unit's layout has no Java code
wired to it yet. The next unit adds `LoginActivity.onCreate`, which is
what actually makes this screen appear and respond to input.

### Connection

This layout gives the login form its two fields and its button. The
next unit writes the Java code that finds them, reads what's typed into
them at the moment of a tap, and uses that value to build the outgoing
`Intent`.

---

## Concept Unit: Attaching Data to the Intent

### The Problem

Lesson 1's `Intent` only ever said "start this specific class" — it
carried a destination, and nothing else. That's not enough for a login
flow: the whole point of typing a username is for some *other* screen to
know what was typed. `SecondActivity`, once it's running, is a
completely separate object from `LoginActivity` — it cannot simply reach
back and read `LoginActivity`'s local variables, because by the time
`SecondActivity` exists, `LoginActivity`'s own method call that created
the `Intent` has already returned.

### Introduce the Concept in Isolation

A throwaway two-Activity scratch project, deleted after this section,
built the same way Lesson 1's own Intent lab was:

```java
// throwaway, first Activity
Intent intent = new Intent(this, ScratchTargetActivity.class);
intent.putExtra("scratch_key", "hello from the first screen");
startActivity(intent);
```

```java
// throwaway, ScratchTargetActivity.onCreate
String received = getIntent().getStringExtra("scratch_key");
Log.d("SCRATCH", "Received: " + received);
```

Running this and tapping through produces:

```
D/SCRATCH: Received: hello from the first screen
```

Then, to prove the key string genuinely matters and isn't just decorative,
change only the receiving side's key to a typo — `getStringExtra(
"scratch_ky")` — without touching the sending side, and run again:

```
D/SCRATCH: Received: null
```

That `null`, with no crash and no error message pointing at the typo, is
the proof this lab exists to surface: the two sides of this hand-off are
connected by nothing more than a plain string matching exactly, with no
compiler check tying them together — get it wrong and the failure is
silent, not loud. This mechanism — data attached to a message object
under a string key, retrieved later by matching that same key — is
called an **Intent extra**.

### Discard the Throwaway Example

This scratch pair of Activities and their mismatched-key demonstration
are deleted now. The real project's `LoginActivity` gets its own,
correctly-matched key next.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `app/src/main/java/.../LoginActivity.java`
  (completing the file the previous unit started); `AndroidManifest.xml`
  (modified, adding `LoginActivity`'s own declaration).
- **Change type:** Add (the `onCreate` body and its click listener);
  configure (the Manifest entry, following the exact same pattern
  Lesson 1 used for `SecondActivity`).
- **Location:** Inside `LoginActivity`'s `onCreate`, after
  `setContentView` and the `findViewById` calls retrieving the two
  `EditText` fields and the button.
- **Dependencies:** The Manifest entry for `LoginActivity`, without
  which `startActivity` later in this same code would crash with
  `ActivityNotFoundException`, exactly as Lesson 1's very first lab
  demonstrated for `SecondActivity`.

### The New Code

```java
loginButton.setOnClickListener(v -> {
    String username = usernameField.getText().toString();
    Intent intent = new Intent(LoginActivity.this, SecondActivity.class);
    intent.putExtra("username", username);
    startActivity(intent);
});
```

### The Updated Project

```java
package com.example.authflowdemo;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import androidx.appcompat.app.AppCompatActivity;

public class LoginActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        EditText usernameField = findViewById(R.id.username_input);
        EditText passwordField = findViewById(R.id.password_input);
        Button loginButton = findViewById(R.id.login_button);

        loginButton.setOnClickListener(v -> {                         // ← new
            String username = usernameField.getText().toString();     // ← new
            Intent intent = new Intent(LoginActivity.this, SecondActivity.class); // ← new
            intent.putExtra("username", username);                    // ← new
            startActivity(intent);                                    // ← new
        });                                                            // ← new
    }
}
```

`onCreate` now fully sets up a working login form: it attaches the
layout, retrieves all three interactive views, and registers a listener
that — on tap — reads the username field, builds an `Intent` carrying
that value, and launches `SecondActivity` with it attached. The
`passwordField` variable is retrieved but not yet read in this lesson;
Lesson 5 is where a real credential check will use it.

### Mechanical Walkthrough

- **`loginButton.setOnClickListener(v -> { ... })`** — a reappearing
  call to the method fully explained in the Header; registers the
  lambda that follows, exactly as `MainActivity`'s button did in
  Lesson 1, on a different `Button` instance.
- **`usernameField.getText()`** — a reappearing call, fully explained
  in the Header and this unit's own lab; retrieves the live `Editable`
  currently held by the username field at the moment of the tap.
- **`.toString()`** — chained directly onto `getText()`'s return value;
  fully explained in the Header — converts the live `Editable` into a
  fixed `String` snapshot.
- **`String username = ...`** — a local variable declaration, storing
  the converted value under a name the rest of the listener body reuses.
- **`new Intent(LoginActivity.this, SecondActivity.class)`** — a
  reappearing constructor call, fully explained in the Header;
  `LoginActivity.this`, not bare `this`, for the same reason Lesson 1's
  version needed the qualified form — inside this lambda, plain `this`
  would refer to the listener object itself, not the enclosing
  `Activity`.
- **`intent.putExtra("username", username)`** — the new call this unit
  exists to teach, fully explained in the Header; the first argument,
  the literal string `"username"`, is the key the receiving side must
  match exactly; the second, the local variable `username`, is the
  value being attached.
- **`startActivity(intent)`** — a reappearing call, fully explained in
  the Header; hands the now-data-carrying `Intent` to the OS.

### CS Lens

This is an instance of **message passing** — two independent units of
running code (here, two separate `Activity` instances, which don't share
memory or object references) communicating not by one directly reading
the other's internal state, but by one constructing a self-contained
message object and handing it to a system that delivers it to the other.

Also recognized in: an HTTP request carrying a JSON body from a browser
to a server, which similarly cannot reach into the browser's own memory;
an actor sending a message to another actor in the actor concurrency
model; a `postMessage` call between two browser windows or iframes; a
process writing to another process's stdin, since two OS processes, like
two Activities, don't share memory by default either.

### SE Lens

The alternative this lesson deliberately avoids is some form of shared,
globally-reachable storage — a `public static` field somewhere holding
"the current username," which any `Activity` could read directly without
any `Intent` involved at all. That would be less code to write right
now. It's also a well-known source of hard-to-debug state bugs: any part
of the app, now or in some future lesson, could read or overwrite that
shared field at any time, with no record of which screen last touched it
or why — and it would silently keep the last value around even after the
`Activity` that set it was long gone, which is exactly the kind of stale,
hidden state a fresh `Activity` instance is supposed to avoid. Intent
extras cost a small amount of ceremony (the exact-match string key this
unit's own lab showed failing silently on a typo) in exchange for making
every hand-off of data explicit, traceable to one specific `Intent`
object, and gone the moment nothing references that `Intent` anymore.

### Commands Needed

No new terminal commands.

### Run It

With `LoginActivity` declared in the Manifest (the same
`<activity android:name=".LoginActivity">` pattern Lesson 1 used for
`SecondActivity`) and `MainActivity`'s button retargeted to open it (see
Connect the Pieces, below), typing a username, tapping "Log In," and
checking Logcat with a temporary log line in `SecondActivity.onCreate`
confirms:

```
D/AUTHFLOW: Received username extra: alice
```

### Connection

The `Intent` this unit builds is identical in kind to Lesson 1's — same
constructor, same `startActivity` call — with exactly one addition:
`putExtra`. The next unit is the mirror image of this one: reading that
same extra back out, on the receiving side, and actually putting it on
screen.

---

## Concept Unit: Receiving and Displaying the Data

### The Problem

The username is now riding inside the `Intent` that starts
`SecondActivity` — but nothing in `SecondActivity` has looked at it yet.
An `Intent` arriving at an `Activity` isn't automatically unpacked into
variables; the receiving `Activity` has to explicitly ask for the same
`Intent` it was started with, and explicitly read the specific key it
expects to find there.

### Introduce the Concept in Isolation

This unit's isolated mechanism was already demonstrated by the previous
unit's own lab — `getIntent().getStringExtra("scratch_key")`, including
the deliberate typo that proved key-matching is silent, not enforced.
Per the Repetition Rule, that lab's proof still applies here in full,
but this unit adds one new piece on top of it: actually displaying the
retrieved value, rather than only logging it.

A small, additional throwaway addition to that same scratch project,
deleted along with it:

```java
// throwaway, added to ScratchTargetActivity.onCreate
TextView label = findViewById(R.id.scratch_label);
label.setText(received);
```

With a `TextView` added to the scratch layout and the app run again, the
previously logged-only value now visibly appears on the second screen's
UI — proof that `setText` is what actually connects a plain `String`
value to something the user can see, the same way `getText()` was the
read side of that same connection in the first unit of this lesson.

### Discard the Throwaway Example

This entire scratch project — both Activities, both layouts — is deleted
now. Everything from here on is the real project's `SecondActivity`.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `app/src/main/res/layout/activity_second.xml`
  (modified — Lesson 1 left it with only a placeholder `TextView`);
  `app/src/main/java/.../SecondActivity.java` (modified — Lesson 1 left
  its `onCreate` with only `super.onCreate` and `setContentView`).
- **Change type:** Modify (both files already exist from Lesson 1).
- **Location:** Inside `SecondActivity.onCreate`, directly after the
  existing `setContentView` call Lesson 1 added.
- **Dependencies:** `LoginActivity` must already be attaching the
  `"username"` extra, per the previous unit — without it,
  `getStringExtra` here returns `null`, and `setText(null)` would show
  the field simply as empty, not crash, since `setText` accepts `null`
  without error.

### The New Code

```java
String username = getIntent().getStringExtra("username");
TextView welcomeLabel = findViewById(R.id.welcome_label);
welcomeLabel.setText(username);
```

### The Updated Project

```java
package com.example.authflowdemo;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class SecondActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_second);

        String username = getIntent().getStringExtra("username"); // ← new
        TextView welcomeLabel = findViewById(R.id.welcome_label);  // ← new
        welcomeLabel.setText(username);                            // ← new
    }
}
```

`onCreate` now completes the full round trip this lesson set out to
build: it attaches its layout, exactly as before, and then — new —
pulls the username back out of the `Intent` it was launched with and
puts it directly on screen, closing the loop that began with the user
typing into `LoginActivity`'s field.

### Mechanical Walkthrough

- **`getIntent()`** — the new method this unit centers on, fully
  explained in the Header; called with no arguments, on `this`
  (implicitly), retrieving the exact `Intent` object `LoginActivity`
  built and attached the username to.
- **`.getStringExtra("username")`** — chained directly onto
  `getIntent()`'s return value; fully explained in the Header; the
  literal string `"username"` here must match, character for character,
  the literal string `LoginActivity` used in its own `putExtra` call —
  this unit's earlier lab proved what happens when it doesn't.
- **`String username = ...`** — a local variable, storing the retrieved
  value; named `username` here for readability, though nothing requires
  this local variable's name to match the string key it came from.
- **`findViewById(R.id.welcome_label)`** — a reappearing call, fully
  explained in the Header; retrieves the `TextView` this unit's Project
  Change step added to `activity_second.xml`.
- **`welcomeLabel.setText(username)`** — the new method this unit
  centers on, fully explained in the Header; replaces whatever text
  `welcome_label` showed by default with the actual retrieved username,
  making it visible on screen.

### CS Lens

No new hard concept in this unit beyond message passing, already given
its full Recognition list in the previous unit — this unit is that same
pattern's receiving side, not a distinct idea of its own.

### SE Lens

`getStringExtra` returning `null` rather than throwing an exception when
a key is missing (as this lesson's own lab demonstrated) is a real,
named design tradeoff: a method can either fail loudly the instant
something's missing, or fail quietly and let the caller decide what a
missing value means. Android's extras API chose quiet — `null` — which
keeps `getIntent()` usable even when an `Activity` might legitimately be
started in more than one way (with or without a given extra), but pushes
the responsibility for checking onto every caller. This project is
currently carrying that exact debt: `setText(null)` doesn't crash, so a
mismatched key here would silently show a blank welcome message instead
of failing in an obvious way — a real cost, paid for the flexibility of
not being forced to handle every possible extra on every possible launch
path.

### Commands Needed

No new terminal commands.

### Run It

```
Typed "alice" into the username field, tapped Log In.
SecondActivity's screen now visibly reads: "alice"
```

### Connection

This closes the loop this entire lesson has been building toward: a
value typed by the user, on one screen, is now visibly displayed on a
completely different `Activity` instance, having crossed the boundary
between them carried by nothing but a plain `Intent` and a matching
string key.

---

## Connect the Pieces

Follow "alice," typed into the username field, start to finish. The user
types the characters into `activity_login.xml`'s `username_input`
`EditText`; the widget's internal `Editable` buffer updates live, one
keystroke at a time, entirely inside the widget, with no code of yours
running yet. The user taps "Log In." Only now does `loginButton`'s
registered lambda actually run: `usernameField.getText()` reads the
buffer's current state, `.toString()` freezes it into a plain,
immutable `String`. A new `Intent` is constructed naming
`SecondActivity` as its target — the same mechanism Lesson 1 built —
and `putExtra("username", username)` attaches that frozen `String`
under the key `"username"`. `startActivity(intent)` hands the whole
package to the OS, which — after confirming `SecondActivity` is
declared in the Manifest, exactly as Lesson 1's opening lab proved is
required — constructs a brand-new `SecondActivity` object and calls its
`onCreate`. Inside it, `getIntent()` retrieves that same `Intent`
object back, `getStringExtra("username")` reads the value out from
under the matching key, and `welcomeLabel.setText(username)` puts
"alice" on screen — a value that started as individual keystrokes in one
`Activity`'s live text buffer, now sitting as fixed text in a
completely different `Activity`'s `TextView`.

## What Breaks Without This

Change `LoginActivity`'s `putExtra("username", username)` call to use a
different key — `putExtra("user_name", username)`, an underscore instead
of nothing — while leaving `SecondActivity`'s
`getStringExtra("username")` untouched. Running the app again: no crash,
no error of any kind. `SecondActivity`'s screen simply shows a blank
welcome label where "alice" used to appear. This is the exact silent
failure this lesson's own lab reproduced on purpose, now shown for real,
in the actual project — proof that nothing in the language or the
framework checks that these two string literals agree; only running the
app and looking reveals the mismatch. Restore the matching key and
confirm the username reappears before moving on.

## Exercises

- Attach the password field's value as a second extra, under its own
  key, and retrieve it in `SecondActivity` the same way — purely to
  practice the full `putExtra`/`getStringExtra` round trip a second
  time before Lesson 4 builds real conditional logic on top of it.
- In `SecondActivity`, deliberately call `getStringExtra` with a key
  that was genuinely never set by anything (not a typo of a real one —
  a key that plain doesn't exist anywhere in the project) and confirm,
  with a temporary log line, that the result really is `null` rather
  than an empty string `""`. These are different values in Java, and
  code that assumes one when it gets the other is a real, common bug.

## Definition of Done

- [ ] `LoginActivity` exists, is declared in the Manifest, and its
      layout shows two `EditText` fields and a "Log In" button.
- [ ] `MainActivity`'s button (from Lesson 1) now opens `LoginActivity`,
      not the old placeholder `SecondActivity` flow.
- [ ] Typing a username and tapping "Log In" visibly displays that same
      username on `SecondActivity`'s screen.
- [ ] The "what breaks without this" mismatched-key failure was
      reproduced on purpose and the correct key restored afterward.
- [ ] Commit, with a message explaining *why*: e.g. `Add LoginActivity
      with username/password fields and wire its username through to
      SecondActivity via an Intent extra — establishes the data-carrying
      hand-off every later screen in the auth flow depends on.`

**Next lesson:** Lesson 3 builds `SignupActivity`, reinforcing this same
`EditText`/`Intent`-extra pattern on a second, distinct form, and adds
lateral navigation — a link from Login to Signup and back — which is a
different kind of hand-off than anything built so far: one that doesn't
end the previous screen's presence on the back stack the way this
lesson's flow has, so far, left unexamined.