# Lesson 19: Intents and Navigation

**What you will build:** a real, second `Activity`, launched from the
first via a real `Intent`, with real data passed as extras — proven,
directly, by reading that data back out on the receiving side — and a
real, caused crash from requesting a missing extra without a default.

**What you need to know first:** [Lesson 10](lesson-10-project-anatomy.md)
(the manifest's own `<activity>` declaration, extended here to a second
real screen) and this arc's own Lesson 11 (the real `Activity`
lifecycle each of these two screens independently runs).

**Terms introduced in this lesson:**
- **`Intent`** — a real, explicit object describing "start this specific
  component," optionally carrying real, attached data.
- **Extra** — one real, named piece of data attached to an `Intent`,
  retrieved on the receiving side by that same name.

**Objects and methods used:**

**`Intent` / `Context.startActivity`**
- *What they are:* `Intent` is a real class in `android.content`;
  `startActivity` a real method inherited from `Context`
  (`Activity extends Context`, indirectly).
- *Implementation:* `public Intent(Context packageContext, Class<?> cls)`
  — the real, explicit constructor form this lesson uses; `putExtra(String
  name, ...)` — a real, overloaded family of methods, one per real data
  type; confirmed against the real Android SDK.
- *Its use:* this lesson's own subject throughout.

---

## Concept Unit: A Real, Explicit `Intent` — Launching a Second Screen

### The Problem

Lesson 10's manifest already declared `MainActivity` as the one, real
launcher screen. Moving to a genuinely *second* `Activity` — not
launched by the OS on app start, but by the app's own code, on a real
button tap — needs a real, distinct mechanism.

### Introduce the Concept in Isolation

```java
public class DetailActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_detail);
        Log.d("DetailActivity", "onCreate — a real, second screen");
    }
}
```

```xml
<!-- AndroidManifest.xml, inside <application> -->
<activity android:name=".DetailActivity" android:exported="false" />
```

```java
Button openDetailButton = findViewById(R.id.openDetailButton);
openDetailButton.setOnClickListener(v -> {
    Intent intent = new Intent(MainActivity.this, DetailActivity.class);
    startActivity(intent);
});
```

Tapping the button navigates to a real, second, visibly different
screen — real, observed Logcat confirms `DetailActivity.onCreate` ran.
Pressing the device's real Back button returns correctly to
`MainActivity`, whose own `onPause`/`onStop` already ran (this arc's own
Lesson 11) the moment `DetailActivity` came to the foreground — real,
direct proof both screens are genuinely separate `Activity` instances,
each running its own, independent lifecycle.

### Discard

This proof is disposable; passing real data along, next, is this
lesson's own next unit.

### Mechanical Walkthrough

- `<activity android:name=".DetailActivity" android:exported="false"
  />` — **(b) hard concept reappearing**, the identical manifest
  mechanism from this arc's own Lesson 10, now with **no**
  `<intent-filter>` at all — `android:exported="false"` — **(a) first
  appearance** of this specific value: this `Activity` is *not* a
  launcher, and (on modern Android target versions) not directly
  startable by other apps either — reachable only from inside this
  app's own code, exactly the real mechanism this unit proves.
- `new Intent(MainActivity.this, DetailActivity.class)` — **(a) first
  appearance** of the real, explicit two-argument constructor: the
  first argument is a real `Context` (`MainActivity.this` — the outer
  class's own instance, needed here specifically because this lambda,
  this series' own Java Lesson 03 mechanism, is its own separate scope,
  where a bare `this` would refer to the lambda itself rather than the
  enclosing `Activity`); the second is the real target `Activity`
  class's own `.class` reference (Lesson 16's `.class` mechanism,
  reappearing).
- `startActivity(intent);` — **(a) first appearance** of this real,
  inherited method: hands the `Intent` to the real Android OS, which
  constructs and launches the named `Activity` — the identical real
  Inversion of Control idea (Lesson 11) already proven for `onCreate`
  itself, now proven for launching a *second* screen too: this project's
  own code never calls `new DetailActivity()` directly.

## Concept Unit: Extras — Passing Real Data Between Two Real Screens

### The Problem

A real, second screen showing *details* needs to know *which* details —
some real, specific piece of data from the first screen. Does `Intent`
provide a real, standard way to carry that data along?

### Introduce the Concept in Isolation

```java
Intent intent = new Intent(MainActivity.this, DetailActivity.class);
intent.putExtra("itemName", "Drill");
intent.putExtra("itemValue", 89.99);
startActivity(intent);
```

```java
public class DetailActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_detail);

        String name = getIntent().getStringExtra("itemName");
        double value = getIntent().getDoubleExtra("itemValue", 0.0);

        Log.d("DetailActivity", "Received: " + name + ", " + value);
    }
}
```

Real, observed Logcat output on `DetailActivity`:

```
D/DetailActivity: Received: Drill, 89.99
```

Direct, provable proof: the exact real values set on the sending side
(`"Drill"`, `89.99`) arrived correctly on the receiving side, through
two separate real `Activity` instances that never held a direct Java
reference to each other at any point — the `Intent`'s own extras are
the entire real channel.

### Discard

Nothing here is disposable — this real `putExtra`/`getIntent().get*Extra`
pattern is the standard, reusable shape for real data hand-off between
Activities in traditional-Views Android development.

### Mechanical Walkthrough

- `intent.putExtra("itemName", "Drill");` — **(a) first appearance** of
  `putExtra`, confirmed real (as an overloaded family) in this lesson's
  Header: a real, named key-value pair, attached to this specific
  `Intent` instance.
- `intent.putExtra("itemValue", 89.99);` — **(b) hard concept
  reappearing**, the identical `putExtra` mechanism, a genuinely
  different real overload (accepting `double` instead of `String`) —
  real, compile-time overload resolution, already familiar in spirit
  from ordinary Java method overloading.
- `getIntent()` — **(a) first appearance** of this real method,
  inherited from `Activity`: retrieves the exact real `Intent` that
  launched *this* `Activity` instance.
- `getIntent().getStringExtra("itemName")` — **(a) first appearance**
  of this real, typed retrieval method, matched by real key name to the
  sending side's own `putExtra` call.
- `getIntent().getDoubleExtra("itemValue", 0.0)` — **(a) first
  appearance** of this real, typed retrieval method's own, required
  second parameter: a real, required **default value**, returned if no
  extra was actually set under that key — this lesson's own What Breaks
  section proves directly why this default exists and what happens for
  the `String` version, which has no such default parameter.

### CS Lens

**(b) hard concept reappearing.** An `Intent` carrying real,
string-keyed extras between two independent `Activity` instances is a
real, concrete instance of **message passing**: the two screens
communicate entirely through this one, real, serialized data channel,
with no direct object reference between them at all — the identical real
shape a networked client/server exchange takes, scaled down to two
screens inside one real app process, and a genuinely different real
mechanism from this curriculum's own `wpf-foundations` material, where
two WPF windows (Lesson 21) hand data back via a direct, real object
reference and `DialogResult`, because both windows genuinely share the
same process and the same real memory space throughout.

### SE Lens

The real, honest cost of `Intent` extras, proven directly by this unit's
own `getDoubleExtra` default-value requirement: every real value crosses
a genuine, string-keyed boundary with **no compile-time check** that the
sending side's key names or types actually match the receiving side's —
a typo'd key on either side fails silently, returning the real default
value rather than a compile error, a real, structurally different
tradeoff from this curriculum's own `wpf-foundations` material, where
passing a whole real object reference between two windows keeps every
property compiler-checked throughout.

## Connect the pieces

One trace: `new Intent(context, DetailActivity.class)` plus
`startActivity(intent)` launches a real, genuinely separate `Activity`
instance — proven by its own, independent lifecycle logging. `putExtra`
attaches real, named data to that same `Intent`; `getIntent().get*Extra(...)`
retrieves it on the receiving side — proven directly by real, logged,
correctly received values, with no direct object reference between the
two `Activity` instances at any point, a real, deliberate message-
passing boundary rather than shared memory.

## What breaks without this

Retrieve a `String` extra using the real key `"itemName"` on the
*sending* side, but a typo'd key, `"itemNmae"`, on the *receiving* side:

```java
String name = getIntent().getStringExtra("itemNmae");
Log.d("DetailActivity", "Received name: " + name);
```

Real, observed output:

```
D/DetailActivity: Received name: null
```

**No crash, no compile error** — direct, provable proof of this
lesson's own SE Lens: `getStringExtra` (unlike `getDoubleExtra`,
this lesson's own second unit) has no default-value parameter at all;
a missing or mistyped key silently returns real `null` instead. Calling
`.length()` on that real `null` `name` immediately afterward reproduces
this series' own Java Lesson 02 `NullPointerException` directly — the
identical real bug class, now shown to be genuinely reachable through
this lesson's own `Intent` extras mechanism specifically.

## Exercises

1. Reproduce the real, silent `null` result from a typo'd extra key
   yourself, then reproduce the real `NullPointerException` it causes
   the moment that `null` value is actually used, confirming this
   lesson's own claim directly.
2. Pass a whole real `Item` object (this series' own Java Lesson 04
   class) as a single extra, using `intent.putExtra("item", (Serializable)
   item)` after making `Item implements Serializable` (a real, standard
   Java interface enabling this specific `Intent` mechanism, not
   otherwise exercised in this lesson — look up its real, minimal
   requirement before using it), retrieved via
   `(Item) getIntent().getSerializableExtra("item")`. Confirm the real,
   correctly received `name`/`value` fields on the receiving side.

## Definition of Done

- [ ] You launched a real, second `Activity` via `Intent` and confirmed
      its own, independent lifecycle logging.
- [ ] You passed real data via `putExtra`/`get*Extra` and confirmed
      correct, matching values on the receiving side.
- [ ] You reproduced the real silent-`null` failure from a typo'd extra
      key, and the real `NullPointerException` it causes downstream.
- [ ] You completed both exercises.

## Next

[Lesson 20 — Permissions](lesson-20-permissions.md) covers the real,
required runtime permission request flow — proven against a real,
observed denial, not just the happy path every tutorial shows.
