# Lesson 13: `findViewById` and ViewBinding

**What you will build:** a real, caused `ClassCastException` from a
wrong-type `findViewById` cast, then the identical screen rebuilt with
ViewBinding, proven to make that exact mistake a compile error instead
— the direct, real Android counterpart to `wpf-foundations` Lesson 10's
own `x:Name`-generated fields.

**What you need to know first:** [Lesson 12](lesson-12-views-viewgroups-and-xml-layouts.md)
(the `R` class, real views to retrieve).

**Terms introduced in this lesson:**
- **ViewBinding** — a real, per-layout-file generated class (enabled via
  `build.gradle`) exposing every `android:id`'d view in that layout as a
  real, already-typed field — no cast, no string/ID lookup at all.

**Objects and methods used:**

**`Activity.findViewById(int)`**
- *What it is:* a real method, inherited from `Activity`, confirmed
  already in Lesson 10's own Header.
- *Implementation:* `public final <T extends View> T findViewById(int
  id)` — confirmed against the real Android SDK signature; a real,
  generic method returning whatever type the call site expects it to,
  checked only by an internal runtime cast.
- *Its use:* this lesson's own first unit proves its real, honest
  weakness directly.

---

## Concept Unit: `findViewById` Requires a Cast — and Trusts It Blindly

### The Problem

Lesson 10 already called `findViewById(R.id.greetingText)`, assigning
its result directly to a `TextView` variable with no visible cast
written. Is a cast genuinely happening, and if so, is it actually safe?

### Introduce the Concept in Isolation

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <Button
        android:id="@+id/actionButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Go" />

</LinearLayout>
```

```java
TextView wrongType = (TextView) findViewById(R.id.actionButton);
```

This compiles cleanly — `findViewById`'s real, declared return type,
confirmed in this lesson's Header, is a real **generic method**:
`<T extends View> T findViewById(int id)`, meaning the compiler infers
`T` from the assignment's own left side (`TextView wrongType = ...`)
and inserts a real, invisible cast automatically. Running this,
however, produces a real crash:

```
FATAL EXCEPTION: main
java.lang.ClassCastException: android.widget.Button cannot be cast to android.widget.TextView
```

The real view at `R.id.actionButton` genuinely is a `Button`, not a
`TextView` — `findViewById` itself has no way to check this at compile
time; it only knows the real ID, not what the caller is about to assume
about the type. The mismatch is caught only at runtime, the instant this
line actually executes.

### Discard

This crashing proof is disposable; ViewBinding, next, closes this exact
gap.

### Mechanical Walkthrough

- `(TextView) findViewById(R.id.actionButton)` — **(b) hard concept
  reappearing**, the explicit cast syntax already proven in this
  series' own Lesson 04; its real, dangerous consequence here — a
  runtime crash with no compile-time warning — is this unit's own
  proof.
- `TextView wrongType = ...;` — **(c) already basic** as a declaration;
  its role in driving the generic method's real type inference,
  explained above, is the mechanical point.

### SE Lens

The real, honest cost `findViewById` carries: every single call site is
a real, silent opportunity for exactly this mistake — a typo'd variable
type, or a layout XML edited later without updating every matching
Java-side type — and nothing catches it until that specific line
actually runs, potentially long after the code was written and
"working." This is the identical real class of problem
`wpf-foundations` Lesson 10 already proved `x:Name`'s generated,
strongly-typed fields solve for WPF — the real question this lesson's
next unit answers: does Android offer a comparable, generated,
compile-time-checked alternative?

## Concept Unit: ViewBinding — a Real, Generated, Typed Field Per View

### The Problem

Does Android provide a real mechanism generating a typed field per
`android:id`, the way `wpf-foundations` Lesson 10 already proved for
WPF's own `x:Name`, removing the cast — and the real risk it carries —
entirely?

### Introduce the Concept in Isolation

Enabling it, in `build.gradle` (this arc's own Lesson 10 material):

```groovy
android {
    buildFeatures {
        viewBinding true
    }
}
```

With this enabled, and this lesson's own `activity_main.xml` (the
`Button` example above) present, Android's build tools generate a real
class — `ActivityMainBinding` — named directly from the layout file's
own filename, `activity_main.xml` → `ActivityMainBinding`, following a
real, fixed naming convention.

```java
public class MainActivity extends Activity {
    private ActivityMainBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.actionButton.setText("Updated");
    }
}
```

`binding.actionButton` — a real, already-typed field, generated
directly from `android:id="@+id/actionButton"` — its real, compiled
type is `Button`, exactly matching the real XML element it names, with
**no cast written anywhere**, and no possibility of the previous unit's
wrong-type mistake: attempting `binding.actionButton.setText(...)`
where `actionButton` were somehow the wrong type would be a real,
compile-time type error instead, the identical real category of
protection `wpf-foundations` Lesson 10 already proved for `x:Name`.

### Discard

Nothing here is disposable — ViewBinding is the real, modern, standard
replacement for direct `findViewById` calls in current traditional-Views
Android development.

### Mechanical Walkthrough

- `buildFeatures { viewBinding true }` — **(a) first appearance** of
  this real, required `build.gradle` flag — without it, no binding
  classes are generated at all, the same real "opt-in build flag"
  pattern `wpf-foundations` Lesson 01 already proved for WPF's own
  `<UseWPF>true</UseWPF>`.
- `ActivityMainBinding` — **(a) first appearance** of a real, generated
  class, named from the layout file itself; not written by hand
  anywhere in this project.
- `ActivityMainBinding.inflate(getLayoutInflater())` — **(a) first
  appearance** of this real, generated static method: performs the
  identical real inflation work `setContentView(R.layout.activity_main)`
  already did in earlier lessons, but returns the real binding object
  instead of inflating directly into the `Activity`.
- `setContentView(binding.getRoot());` — **(b) hard concept
  reappearing**, `setContentView` from Lesson 10, now given the
  binding's real root `View` (`getRoot()` — **(a) first appearance**,
  a real generated method returning the layout's outermost element)
  instead of a plain `R.layout.*` reference.
- `binding.actionButton` — **(a) first appearance**, explained above.

### CS Lens

**(b) hard concept reappearing.** ViewBinding's generated, typed fields
are the identical real idea `wpf-foundations` Lesson 10 already proved
for WPF's own `x:Name` — a build-time code generator reading a
declarative UI file and producing real, compile-time-checked accessors,
removing an entire class of stringly-typed/runtime-cast bugs by
construction rather than by discipline.

## Connect the pieces

One trace: `findViewById(int)` is a real generic method, inferring its
return type from the call site and inserting an invisible cast — proven
directly to crash with a real `ClassCastException` when that inferred
type is wrong, with zero compile-time warning. Enabling ViewBinding
generates a real, per-layout class (`ActivityMainBinding`) with one
already-typed field per `android:id`d view — proven directly to make
the identical mistake a genuine compile-time type error instead of a
runtime crash, the same real class of fix already proven for WPF's own
`x:Name`.

## What breaks without this

Rename `actionButton`'s `android:id` in the layout XML, with no matching
change to `MainActivity.java`'s `binding.actionButton` reference, and
attempt to build. Real, observed result: a real compile error, naming
`actionButton` as a symbol that cannot be resolved on
`ActivityMainBinding` — direct, provable proof this is a genuine,
compile-time-checked field, not a runtime lookup; the identical rename
mistake against a plain `findViewById(R.id.actionButton)` call (this
lesson's own first unit's shape) would instead compile cleanly and fail
only at runtime with a resource-not-found exception, a strictly later,
strictly worse failure point.

## Exercises

1. Reproduce this lesson's own real `ClassCastException` yourself, using
   this lesson's exact `Button`/`TextView` mismatch, and read the real
   exception text closely enough to state, in your own words, which two
   real classes it names and why.
2. Add a second real view (an `EditText`) to the layout, retrieve it via
   `binding.` (confirm the real, generated field name Android Studio's
   own autocomplete offers, driven directly by its `android:id`), and
   read its real, live text back into a `String` variable after setting
   some text on it programmatically first.

## Definition of Done

- [ ] You caused the real `ClassCastException` from a wrong-type
      `findViewById` cast.
- [ ] You enabled ViewBinding and rebuilt the same screen with a real,
      generated, typed field.
- [ ] You caused the real compile-time error from a renamed, unmatched
      binding field, contrasted directly against `findViewById`'s own
      later, runtime-only failure.
- [ ] You completed both exercises.

## Next

[Lesson 14 — RecyclerView and Adapters](lesson-14-recyclerview-and-adapters.md)
covers the real control most traditional-Views Android apps lean on for
any list of data — `RecyclerView.Adapter`, `ViewHolder`, and the real
performance idea (view recycling) the whole class exists for.
