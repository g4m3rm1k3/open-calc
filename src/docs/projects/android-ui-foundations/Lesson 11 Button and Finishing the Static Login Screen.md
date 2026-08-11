# Lesson 11: `Button` and Finishing the Static Login Screen

**What you will build:** The two buttons a login screen needs — submit
and create-account — completing the login screen's visible layout. The
transferable problem: a button is conceptually simple, but this lesson is
really about a design decision this project's requirements leave open —
should signing in and creating an account be two separate screens, or one
screen with two buttons? — and about giving each button a real, findable
identity now, so a later lesson can wire actual behavior to it without
redesigning the layout.

**What you need to know first:** Lesson 10 (`EditText`, `inputType`,
`hint`, `android:id`).

**Terms introduced in this lesson:**
- **`Button`** — a clickable widget rendering a labeled, tappable
  surface; a subclass of `TextView`, same as `EditText`.
- **`android:onClick` (recognition only)** — an XML attribute that can
  wire a button directly to a Java method by name; not used in this
  series, since the next lesson wires clicks from Java code instead, for
  reasons that lesson explains.

**Objects and methods used**
- `TextView` — the text-display widget class, Lesson 09 — `EditText` —
  the editable-text subclass of `TextView`, Lesson 10 — and
  `android:id`/`@+id/` — the attribute assigning a findable identity to a
  view, Lesson 09 — all reappear here unchanged on the two new buttons.
  `Button` is this lesson's own subject, given full treatment below.

---

## Concept Unit: One Screen, Two Buttons — a Design Decision

### The Problem

A login flow conceptually has two distinct actions: signing in with an
existing account, and creating a new one. Those could be two entirely
separate screens (a "Login" screen with a link to a separate "Sign Up"
screen), or they could share one screen with two buttons, since the
fields involved — a username and a password — are identical either way.

### The Options

**Option A — two separate screens.** A dedicated sign-up screen, reached
by a button from the login screen, possibly with additional fields
(password confirmation, an email address). This scales better if account
creation ever needs more information than login does, and keeps each
screen's purpose singular. Shown here as real, working code, even though
this project doesn't build it: a second layout,
`activity_signup.xml`, reusing exactly the same widgets as the login
screen —

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp">

    <EditText
        android:id="@+id/newUsernameField"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="@string/username_hint" />

    <EditText
        android:id="@+id/newPasswordField"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="@string/password_hint"
        android:inputType="textPassword" />

    <EditText
        android:id="@+id/confirmPasswordField"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="@string/confirm_password_hint"
        android:inputType="textPassword" />

    <Button
        android:id="@+id/createAccountSubmitButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="@string/create_account_button_label" />

</LinearLayout>
```

— a `SignUpActivity` built the same shape as every other Activity this
series builds (Lesson 06's `extends AppCompatActivity`, Lesson 07's
`onCreate`/`setContentView`), a `<activity android:name=".SignUpActivity" android:exported="false" />`
Manifest entry (Lesson 07's own mechanism), and, on the login screen, a
button navigating to it via `Intent`/`startActivity` (the exact
mechanism this series actually builds two lessons from now, in the data
grid milestone, applied one lesson early here purely for this
comparison). The extra `confirmPasswordField` is exactly the kind of
field this option handles cleanly that Option B's single shared form
cannot without awkwardly repurposing existing fields.

**Option B — one screen, two buttons.** The same username and password
fields serve both actions; a "Log In" button attempts to authenticate
against an existing account, and a "Create Account" button adds a new
one using the same typed values. This is simpler to build and navigate
when both actions genuinely need the exact same two fields and nothing
more.

**This project uses Option B**, since the two fields involved really are
identical between the two actions, and a second screen would duplicate an
identical form for no structural benefit. If your own app's sign-up flow
ever needs more fields than login does, Option A is the genuinely correct
tool for that case, and nothing about this lesson's `Button` mechanics
changes — you'd simply place the second button on a different screen
instead of this one.

### Project Change

- **Reference Source:** No external framework signature to cite —
  `Button`, like `EditText`, is being used directly, not subclassed.
- **Files affected:** `app/src/main/res/layout/activity_main.xml`,
  `app/src/main/res/values/strings.xml`.
- **Change type:** Add two child elements; add two string entries.
- **Location:** Inside `<LinearLayout>`, after the password field from
  Lesson 10.
- **Dependencies:** None new.

### The New Code

```xml
<Button
    android:id="@+id/loginButton"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="@string/login_button_label" />

<Button
    android:id="@+id/createAccountButton"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="@string/create_account_button_label" />
```

### The Updated Project

The full login screen, complete for this milestone:

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

    <Button
        android:id="@+id/loginButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="@string/login_button_label" />

    <Button
        android:id="@+id/createAccountButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="@string/create_account_button_label" />

</LinearLayout>
```

`strings.xml`, two new entries:

```xml
<string name="login_button_label">Log In</string>
<string name="create_account_button_label">Create Account</string>
```

### Mechanical Walkthrough

- `<Button ...>` — **first appearance**, but the same reappearing
  pattern from Lesson 10: `Button` **extends `TextView`** as well
  (through an intermediate class), inheriting text display and styling,
  adding clickable/tappable behavior on top.
- `android:id="@+id/loginButton"`, `android:id="@+id/createAccountButton"`
  — reappearing (Lesson 08's `@+id/` mechanism), silently reusable — each
  button gets its own unique lookup name, since the next lesson needs to
  find each one individually to attach different behavior to each.
- `android:text="@string/login_button_label"` — reappearing (Lesson 09's
  resource-reference mechanism), same reasoning: button labels are just
  as translatable as the title text was, so they follow the same rule.

### CS Lens

`Button extends TextView` (through an intermediate `TextView` subclass in
the real hierarchy) is the same **inheritance** relationship reappearing
a third time now — `TextView` itself, then `EditText`, now `Button`. Each
one adds one specific new capability (editability, then tappability) on
top of everything already inherited, rather than reimplementing text
rendering from nothing each time. This is the practical payoff of the
Template Method / inheritance discussion from Lessons 06–07: a framework
author wrote the "displays text" logic exactly once, in `TextView`, and
every subclass — including ones the framework author didn't originally
anticipate needing text-plus-tapping — gets it for free.

### SE Lens

**Why does Android model `Button` as a `TextView` subclass instead of a
completely separate, unrelated widget class?** The alternative — treating
every distinct widget as its own from-scratch class with no shared
ancestry — would mean reimplementing basic text rendering, sizing, and
styling logic separately for every widget that happens to display text,
multiplying both the framework's own code and the number of unrelated
APIs you'd need to learn. Modeling `Button` as "a `TextView`, plus
clickability" means everything you already learned about `TextView`
(`android:textSize`, `android:text`, resource references) transfers
immediately, and the framework's own maintenance burden — fixing a text-
rendering bug once — is shared across every subclass automatically,
rather than needing the same fix applied separately in five unrelated
places.

---

## Connect the Pieces

One trace through this milestone's screen so far: a `LinearLayout` root
(Lesson 08) stacks a `TextView` title (Lesson 09), two `EditText` fields —
one plain, one masked via `inputType="textPassword"` (Lesson 10) — and
now two `Button`s, each with its own findable `android:id`. Every widget
on this screen is, underneath, a `TextView` subclass except the root
container itself — the same inheritance relationship, applied four
times, each time adding exactly one new capability.

## What Breaks Without This

Remove both buttons' `android:id` attributes and run the app. The screen
still displays correctly — buttons render and are visibly tappable — but
open Android Studio's **Find Usages** or attempt to reference either
button from Java (a one-line scratch attempt is enough:
`findViewById(R.id.loginButton)` in `MainActivity`) and observe the real
compiler error: `cannot find symbol: variable loginButton` inside the
generated `R` class, because no ID means no corresponding field is
generated at all. Restore both IDs before moving on.

## Exercises

1. Add a third button beneath the first two with no `android:text`
   attribute at all, run the app, and observe what an unlabeled button
   looks like — confirming `android:text` isn't automatically required to
   compile, only to be usable. Remove it afterward.
2. Change `createAccountButton`'s `layout_width` from `match_parent` to
   `wrap_content` and run the app. Confirm it shrinks to fit its own text
   instead of spanning the screen — direct proof that `layout_width`'s
   three options (Lessons 08–09) apply identically to every widget type,
   not just the ones each was first introduced on.

## Definition of Done

- [ ] You can explain, concretely, why this project put both actions on
      one screen rather than two, and when the opposite choice would be
      the right one.
- [ ] You triggered the real "cannot find symbol" compiler error from a
      missing `android:id`, and restored it.
- [ ] The login screen now visibly shows a title, two input fields (one
      masked), and two labeled, tappable buttons.
- [ ] Every element with a findable identity (`loginRoot`, `usernameField`,
      `passwordField`, `loginButton`, `createAccountButton`) has a
      distinct, descriptive `android:id`.
- [ ] Commit: `git commit -m "Add login and create-account buttons to the
      shared login form"` — explaining the one-screen decision, not just
      the elements added.

Milestone 2 is done: a complete, real, static login screen — nothing on
it does anything yet when tapped. Milestone 3 starts wiring actual Java
behavior to it, and that's where fields, interfaces, and lambdas enter
for real.
