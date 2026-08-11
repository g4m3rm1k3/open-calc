# Lesson 10: `EditText` and Password Masking Options

**What you will build:** The real username and password fields on the
login screen. The transferable problem: text input widgets need to
support wildly different kinds of input (a name, an email, a PIN, a
password meant to stay hidden from anyone looking at the screen), and
Android solves this with one flexible attribute rather than a separate
widget class for every case — plus a genuine design decision about
*which* masking behavior actually fits a password field, since more than
one option exists.

**What you need to know first:** Lesson 09 (`TextView`, string
resources, `wrap_content`, `sp`).

**Terms introduced in this lesson:**
- **`EditText`** — the standard Android widget for user-editable text
  input; a subclass of `TextView`.
- **`inputType`** — an attribute controlling what kind of input a text
  field accepts and how it's displayed, including keyboard layout and
  masking behavior.
- **`textPassword` / `numberPassword`** — two of `inputType`'s values,
  both masking typed characters as dots, differing in what characters
  they accept and which keyboard they trigger.
- **`hint`** — placeholder text shown inside an empty input field,
  disappearing once the user types.
- **`TextInputLayout` (recognition)** — a Material Components wrapper
  widget adding features like a show/hide password toggle on top of a
  plain `EditText`.

**Objects and methods used:**

**`EditText`**
- *What it is:* the standard Android widget for user-editable text
  input.
- *Implementation:* a subclass of `TextView`, inheriting text display
  and styling, adding the ability to accept and display typed input on
  top.
- *Its use:* this lesson's two new fields — username and password — both
  built from it.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`TextView`**
  - *What it is:* the leaf `View` class for displaying text, which
    `EditText` is itself a subclass of.
  - *Implementation:* given full treatment in Lesson 09.
  - *Its use:* every attribute `TextView` supports (`textSize`, and so
    on) is available on `EditText` too, by inheritance.
- **`android:id` / `@+id/`**
  - *What it is:* the attribute assigning a view a findable identity.
  - *Implementation:* given full treatment in Lesson 08.
  - *Its use:* each new `EditText` gets its own unique id, so Java code
    can look it up later.
- **`wrap_content` / `match_parent`**
  - *What they are:* the two sizing keywords a `layout_width`/
    `layout_height` attribute can hold.
  - *Implementation:* given full treatment in Lesson 08.
  - *Their use:* sizing each `EditText` field exactly as any other
    `View` already met.

---

## Concept Unit: `EditText` — `TextView` You Can Type Into

### The Problem

Lesson 09's `TextView` displays text but has no way for a user to type
into it. Android's answer isn't a completely unrelated widget class —
it's a subclass.

### The New Code

```xml
<EditText
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="@string/username_hint" />
```

### Mechanical Walkthrough

- `<EditText ...>` — **first appearance**, but not a new concept from
  scratch: `EditText` **extends `TextView`** — the exact inheritance
  relationship Lesson 06 taught, reappearing here for real, in a
  framework class instead of the `Animal`/`Dog` lab. Every attribute
  `TextView` already understands (`android:textSize`, and eventually
  more) is inherited automatically; `EditText` adds the specific
  behavior of accepting and displaying user-typed input on top of that.
- `android:hint="@string/username_hint"` — **first appearance.** A
  **hint** is placeholder text shown only while the field is empty,
  vanishing the instant the user types a character — unlike `text` or
  `android:text`, a hint is never actually part of the field's real
  value; reading the field's contents in code later never returns hint
  text.

### CS Lens

`EditText extends TextView` is the same **inheritance** relationship from
Lesson 06, reappearing at a harder level: rather than a two-level lab
hierarchy you wrote yourself, this is a real framework class hierarchy,
several classes deep (`EditText` → `TextView` → ... → `View`), and you're
now reading it from documentation and behavior rather than from source you
wrote. The same dynamic-dispatch reasoning from Lesson 06 applies: an
`EditText` object used through a `TextView`-typed reference (which happens
constantly in Android APIs that accept a `TextView` parameter) still
behaves like the real, more specific `EditText` it is.

### SE Lens

Why does Android give `EditText` its own class at all, instead of just
adding an "editable" flag to plain `TextView`? A flag would mean every
single `TextView` — including ones that only ever display static
labels — carries the memory and behavioral overhead of being
potentially editable, whether or not anything ever uses it. A separate
subclass means that cost is paid only by widgets that are actually
meant to accept input, while every non-editable `TextView` stays as
simple as Lesson 09 already showed it to be — the same "pay for what
you use" reasoning behind keeping primitives and wrapper classes
separate.

---

## Concept Unit: `inputType` — One Attribute Controls Keyboard and Masking

### The Problem

A username field, an email field, a numeric PIN, and a password field are
all, structurally, the same `EditText` widget — yet each needs a
different on-screen keyboard and different display behavior (a password
must visually hide what's typed; nothing else should). Android doesn't
solve this with five different widget classes. One attribute,
`inputType`, controls both the keyboard shown and how typed text renders.

### The New Code — Two Real Options

**Option A — `textPassword`:**

```xml
<EditText
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="@string/password_hint"
    android:inputType="textPassword" />
```

**Option B — `numberPassword`:**

```xml
<EditText
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="@string/password_hint"
    android:inputType="numberPassword" />
```

Both mask every typed character as a dot the instant the next character
is typed. They differ in what they actually accept and show:
`textPassword` accepts any character (letters, digits, symbols) and pops
up the full alphabetic keyboard; `numberPassword` accepts digits only and
pops up a numeric keypad, the same way a phone PIN entry screen looks.

### The Tradeoff

`numberPassword` is the right choice specifically when the password is
guaranteed to be numeric only — a 4- or 6-digit PIN, for instance —
because a numeric keypad is faster to use and physically cannot produce
an invalid character. It is the *wrong* choice for a general account
password that might contain letters or symbols: those characters simply
cannot be typed at all with a numeric keyboard showing, silently blocking
a user from ever entering the password they actually chose. **This
project uses `textPassword`,** since a general login password has no
guarantee of being numeric-only, and restricting the keyboard would
restrict what passwords users could type in the first place — a real
usability bug, not just a style choice.

### The Updated Project

The full login form so far, both fields added inside Lesson 08's
`LinearLayout`, after the title `TextView` from Lesson 09:

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

    <EditText
        android:id="@+id/usernameField"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="@string/username_hint" />

    <EditText
        android:id="@+id/passwordField"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="@string/password_hint"
        android:inputType="textPassword" />

</LinearLayout>
```

And in `strings.xml`, two new entries alongside `login_title`:

```xml
<string name="username_hint">Username</string>
<string name="password_hint">Password</string>
```

The container now holds a title and two real input fields, stacked
top-to-bottom exactly as `LinearLayout`'s `vertical` orientation
guarantees. Each field has its own `android:id` — the same `@+id/`
mechanism from Lesson 08 — because a future lesson's Java code will need
to find each one individually to read what the user typed.

### Mechanical Walkthrough

- `android:inputType="textPassword"` — **first appearance.** A single
  attribute controlling two things at once: which on-screen keyboard
  Android shows, and whether typed characters render as dots instead of
  themselves. `textPassword` specifically: full alphabetic keyboard,
  every character masked.
- `android:inputType="numberPassword"` — the same attribute, a
  different value: numeric keypad only, digits masked the same way —
  shown here purely as the rejected alternative, never applied to the
  real project.
- `android:id="@+id/usernameField"` / `android:id="@+id/passwordField"`
  — the same `@+id/` mechanism Lesson 08 introduced, now applied to two
  real, distinct fields this project's Java code will need to look up
  individually.

### SE Lens

**Why does Android bundle "which keyboard to show" and "how to mask the
display" into the same single attribute, instead of two separate
attributes you could set independently?** The alternative — separating
"keyboard type" from "masking behavior" as two unrelated settings — would
allow nonsensical combinations, like a numeric keypad paired with
alphabetic masking rules, that never correspond to a real input scenario
an app actually needs. Coupling them into one `inputType` value per
real-world input category (a password, a phone number, an email address)
means the attribute itself documents intent — reading
`android:inputType="textPassword"` tells you exactly what kind of field
this is, in one place, rather than requiring you to mentally combine two
separate settings to figure out what the field actually does.

---

## Connect the Pieces

One trace: `EditText` inherits everything `TextView` already does
(displaying styled text) and adds the ability to accept typed input.
`inputType="textPassword"` is the specific setting that makes this
particular `EditText` mask its display — the exact behavior a login
form's password field needs — while the plain,
`inputType`-unset username field above it displays exactly what's typed,
because no masking was requested.

## What Breaks Without This

Remove `android:inputType="textPassword"` from the password field
entirely and run the app. Real result: the field behaves exactly like
the plain username field above it — typed characters display as normal,
readable text, with no masking at all. This is the concrete version of
the real failure: a password field with no `inputType` set is
not a password field at all, visually, no matter what you name its
`android:id` or `android:hint`. Restore `android:inputType="textPassword"`
before moving on.

## Exercises

1. Temporarily change the password field's `inputType` to
   `numberPassword`, run the app, and try typing a password containing a
   letter. Confirm directly that the letter simply cannot be entered —
   proving the tradeoff above through behavior, not just the written
   explanation. Revert to `textPassword` afterward.
2. Add a third `EditText` with no `hint` attribute at all, run the app,
   and observe it renders with no placeholder text — confirming `hint`
   is optional and what its absence looks like.

## Definition of Done

- [ ] You can state, from memory, why `EditText` doesn't need a whole new
      explanation of `android:textSize` or any other `TextView` attribute
      to use it.
- [ ] You ran the app with `textPassword` removed and saw the real,
      unmasked field — direct proof, not just the written claim.
- [ ] You tried typing a letter into a `numberPassword` field and
      confirmed it's rejected.
- [ ] The login screen now shows a title, a plain username field, and a
      masked password field, each with its own `android:id`.
- [ ] Commit: `git commit -m "Add username and password fields; use
      textPassword over numberPassword since passwords aren't
      numeric-only"` — explaining the `inputType` choice, not just
      the addition.

Next: the two buttons a login screen needs — submit and create-account —
and `android:id`'s payoff, once Java code actually needs to find these
widgets.
