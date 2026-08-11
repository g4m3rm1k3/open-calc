# Lesson 09: `TextView` and String Resources

**What you will build:** A real title on the login screen — the first
visible child inside last lesson's empty `LinearLayout`. The transferable
problem: Android never lets you hardcode user-visible text directly next
to the widget showing it, the way you might in a quick HTML page. Text
lives in its own resource system, referenced by name. That indirection is
a real design decision with a real cost and a real payoff, not a
formality.

**What you need to know first:** Lesson 08 (`View`, `ViewGroup`,
`LinearLayout`, `android:id`, `dp`).

**Terms introduced in this lesson:**
- **`TextView`** — the basic Android widget for displaying a run of text;
  a leaf `View` (it has no children of its own).
- **String resource / `res/values/strings.xml`** — a separate XML file
  mapping short names to the actual text an app displays, referenced from
  layouts and code instead of writing text inline.
- **`@string/...` resource reference** — layout XML syntax pointing at a
  named entry in `strings.xml` instead of literal text.
- **`sp` (scale-independent pixel)** — a unit like `dp`, but one that also
  scales with the user's chosen system font size, used specifically for
  text sizes.

**Objects and methods used:**

**`TextView`**
- *What it is:* the basic Android widget for displaying a run of text.
- *Implementation:* a leaf `View` — it has no children of its own —
  reading its displayed text from `android:text`, which this lesson
  points at a string resource rather than a literal.
- *Its use:* the first real, visible child inside the login screen's
  `LinearLayout`, showing the title.

---

## Concept Unit: `TextView` and Why Text Isn't Written Inline

### The Problem

The obvious way to put a title on screen is to just write the text
directly into the layout file: `android:text="Welcome Back"`. Android
allows this, and it will work — but every real Android project avoids
it, for a concrete reason: an app that ships to real users eventually
needs its text translated into other languages, and hunting through every
layout file for hardcoded strings to translate is exactly the kind of
manual, error-prone process a dedicated system exists to prevent. Android
solves this by keeping every user-visible string in one place —
`res/values/strings.xml` — and having layouts and code reference it by
name instead of containing the text itself.

### Project Change

- **Reference Source:** No external framework signature to cite —
  `TextView` is being *used*, not subclassed or overridden, so there's no
  parent contract to quote yet; that only applies once a later lesson
  extends a framework class.
- **Files affected:** `app/src/main/res/values/strings.xml` (created by
  the wizard, currently holds only the app's own name) and
  `app/src/main/res/layout/activity_main.xml` (from Lesson 08).
- **Change type:** Add an entry to `strings.xml`; add a child element
  inside the existing `LinearLayout`.
- **Location:** Inside `<resources>` in `strings.xml`; as the first child
  inside `<LinearLayout>` in `activity_main.xml`.
- **Dependencies:** None new.

### The New Code

In `strings.xml`:

```xml
<string name="login_title">Welcome Back</string>
```

In `activity_main.xml`:

```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/login_title"
    android:textSize="24sp" />
```

### The Updated Project

`strings.xml` in full:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">YourApp</string>
    <string name="login_title">Welcome Back</string>
</resources>
```

`activity_main.xml` in full:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp"
    android:id="@+id/loginRoot">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/login_title"
        android:textSize="24sp" />

</LinearLayout>
```

The empty container from Lesson 08 now has its first real child: a title
`TextView`, sitting at the top since `LinearLayout` stacks children in
the order they're written.

### Mechanical Walkthrough

- `<string name="login_title">Welcome Back</string>` — **first
  appearance.** `<resources>` in `strings.xml` is a flat list of
  `<string>` entries, each with a `name` attribute (the lookup key,
  `login_title`) and its text content (`Welcome Back`, the actual
  displayed value). Android's build process compiles every entry in this
  file into a field on the generated `R` class — the same `R.layout`
  you've already read since Lesson 05 also has an `R.string` side,
  generated the same way.
- `<TextView ...>` — **first appearance.** A leaf `View` — no children —
  whose entire job is displaying a run of text. It's the simplest real
  widget Android has.
- `android:layout_width="wrap_content"`, `android:layout_height="wrap_content"`
  — **first appearance of `wrap_content` specifically** (Lesson 08 only
  used `match_parent`). `wrap_content` means "size myself to exactly fit
  my own content" — here, exactly as wide and tall as the text
  `"Welcome Back"` at the given text size, no more. This is the third and
  last of Android's three sizing options for a dimension:
  `match_parent` (fill the parent), a fixed size (e.g. `40dp`), or
  `wrap_content` (fit the content exactly).
- `android:text="@string/login_title"` — **first appearance of a
  resource reference.** `@string/login_title` is not literal text — it's
  a pointer: `@` marks this as a resource reference, `string` names which
  resource *type* to look in, and `login_title` is the lookup key defined
  a moment ago in `strings.xml`. At build time, Android resolves this
  reference and the `TextView` displays `"Welcome Back"` — but the layout
  file itself never contains that literal text.
- `android:textSize="24sp"` — **first appearance of `sp`.** Like `dp`
  from Lesson 08, `sp` scales with screen density — but it *also* scales
  with a font-size preference the user can set in their device's
  accessibility settings. A user who has increased their system font size
  for readability sees this text scale up accordingly; a `dp`-sized
  element (like a button's height) would not respond to that setting at
  all. This is why Android has two units instead of one: `dp` for general
  layout dimensions, `sp` specifically for anything that renders text.

### CS Lens

Separating displayed text from the code and layout that presents it is
an instance of **separation of concerns** — the same reasoning behind
Lesson 01's Java splitting compile and run into two steps, applied here
to a different axis: *what* is shown versus *where and how* it's
arranged.

Also recognized in: every localization/internationalization (i18n)
system in professional software (web apps' translation JSON files,
desktop apps' `.po`/`.resx` files), CSS separating a document's content
from its presentation, and configuration files separating "values that
might change" from the code that uses them.

### SE Lens

**Why pay the cost of an extra indirection — a name in one file pointing
at text in another — for a string that, right now, is only used once?**
The alternative, hardcoding `"Welcome Back"` directly in the layout,
looks strictly simpler today. The cost shows up the moment this app needs
a second language: with string resources, translation means adding a
`res/values-es/strings.xml` (a language-specific variant Android
automatically picks based on the device's language setting) with the same
`login_title` key translated — zero changes to any layout file. Without
this system, translating means finding and editing every layout file that
contains hardcoded text, and hoping none were missed. Paying the small
indirection cost once, up front, on every string — even ones that seem
like they'll only ever be used once — is what keeps that second cost from
existing at all.

---

## Connect the Pieces

One trace: `login_title` in `strings.xml` is a name; `@string/login_title`
in the layout resolves that name to `"Welcome Back"` at build time; the
`TextView` displays whatever text that resolution produces. Change the
string's value in one place, and every layout referencing
`@string/login_title` updates without being touched itself.

## What Breaks Without This

In the layout, misspell the reference: `android:text="@string/login_ttle"`
(missing an `i`). Try to build. Real, captured build failure: "resource
string/login_ttle not found" — because this reference is checked at
build time, not silently ignored the way an undefined variable might be
in a more permissive language. Fix the typo before moving on.

## Exercises

1. Add a second string, `login_subtitle`, with any short text, and a
   second `TextView` beneath the title with a smaller `textSize` (try
   `14sp`) displaying it. Confirm it stacks below the title.
2. In your device or emulator's system settings, increase the display
   font size, then re-run the app without changing any code. Confirm the
   `sp`-sized title text visibly grows while a `dp`-sized element (the
   `24dp` padding from Lesson 08) does not — direct proof of `sp` vs.
   `dp`'s different scaling behavior, not just the definition above.

## Definition of Done

- [ ] You can explain what a resource reference like `@string/login_title`
      actually resolves to, and when.
- [ ] You triggered the "resource not found" build failure yourself with
      a misspelled reference, and fixed it.
- [ ] You can state, concretely, why `sp` exists as a separate unit from
      `dp` rather than everything just using `dp`.
- [ ] The app runs and shows the real title text on screen.
- [ ] Commit: `git commit -m "Add login title as a string resource
      instead of hardcoded text"` — explaining the string-resource
      choice, not just the addition.

Next: the username and password fields — `EditText`, and the real
options for making typed password characters render as dots instead of
plain text.
