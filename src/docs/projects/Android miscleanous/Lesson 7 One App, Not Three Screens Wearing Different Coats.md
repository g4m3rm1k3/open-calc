# Lesson 7: One App, Not Three Screens Wearing Different Coats

**What you will build:** A real `colors.xml` and a real `styles.xml`,
replacing the placeholder theme name — `Theme.AuthFlowDemo` — that has
sat, undefined in any meaningful way, in the Manifest since Lesson 1. A
shared button style applied identically across `LoginActivity` and
`SignupActivity`, so their buttons look and behave consistently without
either layout repeating the same visual attributes by hand. And a fix
for the specific problem Lesson 4's own closing exercise surfaced on
purpose: `MainActivity`, having no layout of its own, still briefly
shows the *system's* default background color before it redirects — a
visible flash this lesson replaces with a deliberate, on-brand one. The
transferable problem: every visual attribute this project has set so
far — `android:hint`, `android:padding`, a hardcoded string like "Log
In" — has been written directly, once, on the one element it applies
to. That's fine for one attribute on one button. It stops being fine the
moment the same look needs to apply consistently across three separate
screens, maintained by whoever touches this project next, without
hunting down and manually keeping every copy in sync.

**What you need to know first:** Lesson 1 — the Manifest, and its
already-existing (but never yet defined) `android:theme=
"@style/Theme.AuthFlowDemo"` reference on the `<application>` element.
Lesson 4 — its closing exercise, which showed `MainActivity` briefly
flashing a stale screen when a layout was added back in, and named this
lesson as where a proper fix belongs. No new Java code appears anywhere
in this lesson — every change here is a declarative resource file or a
Manifest attribute, which is itself worth noting directly: Android's own
styling system is deliberately built this way, entirely separate from
the Java logic this series has spent six lessons on.

**Terms used in this lesson**

- **Resource** — in Android, any value — a color, a string, a
  dimension, a whole layout, a style — declared in an XML file under
  `res/`, rather than written as a literal directly in Java or in
  another XML file, and referenced elsewhere using an `@type/name`
  syntax (`@color/primary`, `@style/Theme.AuthFlowDemo`). This exists so
  a value used in more than one place has exactly one place it's
  actually *defined* — changing it there changes it everywhere it's
  referenced, without hunting down every individual copy by hand. Every
  layout file this series has already written (`activity_login.xml`,
  and the rest) is itself a resource of this same general kind; this
  lesson is the first to reach for the mechanism deliberately, for
  colors and styles specifically.
- **Theme** — a specific kind of resource: a named collection of default
  appearance values (background color, text color, and many more) that
  applies to an entire `Activity`, or the whole application, rather than
  to one individual view. This exists because most views in a
  well-designed app should look consistent with the screen around
  them by default, without every single `Button` and `EditText` needing
  its own explicit color attributes repeated by hand — a theme sets
  sensible defaults once, for everything inside its scope, and any
  individual view can still override a specific attribute if it
  genuinely needs to differ. Applied via the `android:theme` attribute —
  already present on the Manifest's `<application>` element since
  Lesson 1's own template-generated content, though never yet given real
  values to define.
- **Style** — a named, reusable collection of attribute-value pairs —
  like a theme, but applied to one specific view (via a layout's
  `style="@style/..."` attribute), not to an entire screen or app. This
  exists for the case a theme's own broad, screen-wide defaults don't
  cover: several *specific* views — this lesson's Login and Signup
  buttons, for instance — that should share one particular look with
  each other, without necessarily being the default for every button
  anywhere in the app.
- **Manifest** — `AndroidManifest.xml`, declaring every component the OS
  may create. Reappearing here because this lesson's final unit adds an
  `android:theme` attribute directly to `MainActivity`'s own
  `<activity>` entry — a per-component override of the app-wide theme
  the `<application>` element already declares, which this lesson's own
  Mechanical Walkthrough addresses directly.

**Objects and methods used**

No new Java classes or methods appear anywhere in this lesson — every
change is a declarative XML resource file (`colors.xml`, `styles.xml`)
or a Manifest attribute. Every `Activity`, `Intent`, and method this
project's Java code already depends on (`onCreate`, `setContentView`,
`startActivity`, and the rest, fully explained across Lessons 1 through
6) is entirely unchanged by this lesson and does not appear in any of
this lesson's own new code blocks, so, per this schema's own scope, none
of those entries are reproduced here — this lesson's Header instead
gives its full attention to the resource-system Terms above, which is
where all of this lesson's actual new material lives.

---

## Concept Unit: The Resource System — One Color, One Place

### The Problem

`Theme.AuthFlowDemo`, referenced in the Manifest since Lesson 1, has
never actually been given real content — Android Studio's own project
template silently generated a minimal, mostly-empty version of it, which
is why every screen in this project so far has looked like an unstyled
default system app rather than anything with a deliberate visual
identity. Beyond that specific gap, nothing in this project currently
has a single, centralized place any color is defined — if a future
lesson wanted to change the app's primary color, there'd be nowhere to
change it once and have every screen follow.

### Introduce the Concept in Isolation

A throwaway scratch layout, with one `TextView`, deleted after this
section:

```xml
<!-- throwaway res/values/colors.xml -->
<resources>
    <color name="scratch_color">#3F51B5</color>
</resources>
```

```xml
<!-- throwaway layout -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Hello"
    android:textColor="@color/scratch_color" />
```

Running this shows the text rendered in the specific blue-violet
`#3F51B5`. Now, without touching the layout file at all, change only the
one line in `colors.xml`:

```xml
<color name="scratch_color">#D32F2F</color>
```

Running again, with no other file touched, shows the exact same text
now rendered in red. That's the proof: `@color/scratch_color` in the
layout doesn't hold a fixed value of its own — it's a reference,
resolved at the moment the layout is inflated, to whatever `colors.xml`
currently defines under that name. This is called a **resource**
reference, and it's how Android keeps a value's *definition* separate
from every place that *uses* it.

### Discard the Throwaway Example

This scratch `colors.xml` and layout are deleted. The real project's
`colors.xml`, built next, defines this project's actual palette.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition; this project has no external design system it's porting
  from.
- **Files affected:** `app/src/main/res/values/colors.xml` (modified —
  Android Studio's template already created a minimal version of this
  file; this lesson replaces its contents); `app/src/main/res/values/
  styles.xml` (modified — same situation as `colors.xml`, giving real
  content to `Theme.AuthFlowDemo` for the first time).
- **Change type:** Replace (both files' contents).
- **Location:** Both files' existing `<resources>` root element.
- **Dependencies:** None — both files already exist from the original
  project template; nothing external needs to be added.

### The New Code

```xml
<color name="primary">#3F51B5</color>
<color name="primary_dark">#303F9F</color>
<color name="background">#FAFAFA</color>
<color name="text_primary">#212121</color>
```

### The Updated Project

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#3F51B5</color>
    <color name="primary_dark">#303F9F</color>
    <color name="background">#FAFAFA</color>
    <color name="text_primary">#212121</color>
</resources>
```

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>

    <style name="Theme.AuthFlowDemo" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryDark">@color/primary_dark</item>
        <item name="android:windowBackground">@color/background</item>
        <item name="android:textColorPrimary">@color/text_primary</item>
    </style>

</resources>
```

As a whole, `colors.xml` now gives this project's actual palette four
real, named entries in one file, and `styles.xml` now gives
`Theme.AuthFlowDemo` — the exact name already referenced by the
Manifest's `<application>` element since Lesson 1 — real substance for
the first time: every screen in the app, sharing this one theme by
default, now inherits a consistent background, primary color, and text
color, without any of them needing to set those attributes individually.

### Mechanical Walkthrough

- **`<resources>`** — the required root element of any Android values
  file; everything this file defines — colors, styles, or (in other
  files this project doesn't currently use) strings and dimensions —
  must be declared as a direct child of this one element.
- **`<color name="primary">#3F51B5</color>`** — declares a named color
  resource; `#3F51B5` is a standard six-digit hexadecimal RGB color
  value, the same format used throughout web and native UI development;
  `name="primary"` is what `@color/primary` elsewhere resolves against.
- **`<style name="Theme.AuthFlowDemo" parent="Theme.AppCompat.Light.NoActionBar">`**
  — declares a style resource, specifically one meant to be used as a
  theme; `name` must match, exactly, the name already referenced by the
  Manifest's `android:theme="@style/Theme.AuthFlowDemo"` — this lesson's
  own reason this exact name was chosen rather than any other.
  `parent="Theme.AppCompat.Light.NoActionBar"` means this style
  **inherits** every attribute value already defined by that existing
  framework theme, then overrides only the specific ones listed inside
  it — `Theme.AppCompat.Light.NoActionBar` is one of many ready-made
  base themes the AppCompat support library (already in use since
  Lesson 1's `AppCompatActivity`) provides; "Light" means light-colored
  default surfaces, and "NoActionBar" means it doesn't reserve space for
  a top action bar this project has never used.
- **`<item name="colorPrimary">@color/primary</item>`** — one attribute
  override inside the style; `colorPrimary` is a specific,
  framework-recognized attribute name that AppCompat's own widgets (like
  `Button`) consult by default for their accent color; its value here is
  itself a resource reference, resolving to the `primary` color entry
  defined moments earlier in `colors.xml` — a resource referencing
  another resource, the same mechanism, one layer deeper.
- **`<item name="android:windowBackground">@color/background</item>`**
  — sets the default background color for every `Activity` using this
  theme, unless a specific screen's own layout overrides it; the
  `android:` prefix here (absent from `colorPrimary`, above) marks this
  specific attribute as one defined by the core Android framework
  itself, rather than by the AppCompat support library — both kinds of
  attribute can appear side by side inside the same `<style>` block.
- **`<item name="android:textColorPrimary">@color/text_primary</item>`**
  — sets the default text color for ordinary text views across the app,
  again unless a specific view overrides it directly.

### CS Lens

This is an instance of **centralizing configuration** — separating a
system's tunable values (here, colors) from the logic and structure that
uses them, so a value can be changed in exactly one place and take
effect everywhere it's referenced, rather than requiring every use site
to be found and edited individually.

Also recognized in: a CSS stylesheet's custom properties (`--primary-
color: ...`) referenced throughout a webpage's own styling; an
application's environment-variable configuration file, read once by many
different parts of a running program; a game's tunable difficulty
constants kept in one data file rather than scattered through the game's
own logic code; a design system's own token file, shared across many
different products or platforms.

### SE Lens

The alternative — writing `android:textColor="#3F51B5"` directly,
repeated by hand, on every individual view across every layout file this
project has — would work identically the moment it's written. Its real
cost only appears later: changing the app's primary color would mean
finding and correctly updating every single one of those hardcoded
literals, across every layout file, with nothing checking that all of
them were actually caught, and no compiler error if one is missed — a
silent, incomplete update, exactly the same shape of failure Lesson 2's
own mismatched `Intent` extra keys demonstrated. Centralizing the value
in `colors.xml` costs one extra level of indirection — a reader
encountering `@color/primary` has to go look up what it currently
resolves to, rather than seeing the literal value directly — a real,
worthwhile tradeoff for a value used in more than one place, and
increasingly worthwhile the more places reference it.

### Commands Needed

No new terminal commands — Android Studio's own resource editor can
create and edit both files directly, or they can be edited as plain
text, same as any other file in this project.

### Run It

```
App launched (no Java code changed yet this lesson) — LoginActivity's
screen background is now the defined off-white @color/background,
replacing whatever the previous, undefined placeholder theme happened
to fall back to; visible on Login, Signup, and Home alike, since all
three share this one Theme.AuthFlowDemo by default.
```

### Connection

Every screen in the app now shares one real, defined visual baseline.
The next unit builds on top of it — a shared *style*, not a theme, for
the one element that needs a more specific, deliberate look than the
theme's own broad defaults give it: the buttons.

---

## Concept Unit: A Shared Style for the Buttons

### The Problem

`LoginActivity`'s "Log In" button and `SignupActivity`'s "Create
Account" button are both ordinary `Button`s, styled by nothing more than
the theme's own broad defaults from the previous unit. A real app
usually wants its primary action buttons to share a specific, deliberate
look — consistent padding, a specific text color — distinct from a
theme's own general baseline. Writing that specific look directly,
repeated by hand, on both buttons' own XML attributes would work, but
it's the exact same maintenance problem the previous unit's SE Lens just
named for colors, now facing a second kind of duplication.

### Introduce the Concept in Isolation

A throwaway scratch layout with two buttons, deleted after this section:

```xml
<!-- throwaway styles.xml addition -->
<style name="ScratchButton">
    <item name="android:textColor">#FFFFFF</item>
    <item name="android:padding">16dp</item>
</style>
```

```xml
<!-- throwaway layout -->
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="First"
    style="@style/ScratchButton" />

<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Second"
    style="@style/ScratchButton" />
```

Running this shows both buttons sharing identical white text and
padding. Changing only the style definition's padding value — `24dp`
instead of `16dp` — with neither `<Button>` tag touched at all, and
running again, shows both buttons' padding change together, in lockstep.
That's the proof: `style="@style/ScratchButton"` doesn't copy the
style's values onto the button once, at the moment the XML is written —
it's resolved the same way a `@color` reference is, every time the
layout is inflated, which is exactly why editing the one shared
definition moved both buttons at once.

### Discard the Throwaway Example

This scratch style and layout are deleted. The real project's button
style, applied to Login's and Signup's real buttons, is built next.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `app/src/main/res/values/styles.xml` (modified,
  adding one new `<style>`); `app/src/main/res/layout/
  activity_login.xml` (modified); `app/src/main/res/layout/
  activity_signup.xml` (modified).
- **Change type:** Add (the new style); modify (adding the `style`
  attribute to two existing `<Button>` elements).
- **Location:** `styles.xml`, alongside the `Theme.AuthFlowDemo` entry
  from the previous unit; each layout's existing `<Button>` element,
  built in Lesson 2 and Lesson 3.
- **Dependencies:** None beyond the theme already established in this
  lesson's previous unit.

### The New Code

```xml
<style name="PrimaryButton">
    <item name="android:textColor">#FFFFFF</item>
    <item name="android:paddingTop">12dp</item>
    <item name="android:paddingBottom">12dp</item>
    <item name="backgroundTint">@color/primary</item>
</style>
```

### The Updated Project

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>

    <style name="Theme.AuthFlowDemo" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryDark">@color/primary_dark</item>
        <item name="android:windowBackground">@color/background</item>
        <item name="android:textColorPrimary">@color/text_primary</item>
    </style>

    <style name="PrimaryButton">
        <item name="android:textColor">#FFFFFF</item>
        <item name="android:paddingTop">12dp</item>
        <item name="android:paddingBottom">12dp</item>
        <item name="backgroundTint">@color/primary</item>
    </style>

</resources>
```

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
        android:text="Log In"
        style="@style/PrimaryButton" />

    <TextView
        android:id="@+id/go_to_signup_link"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Don't have an account? Sign Up" />

</LinearLayout>
```

`SignupActivity`'s own layout gains the identical `style="@style/
PrimaryButton"` attribute on its own submit button, in the same
position — omitted here in full since, per this lesson's own SE Lens
below, the entire point of this unit is that both buttons now share
their look through exactly one written definition, not two separately
maintained copies of the same attributes.

### Mechanical Walkthrough

- **`<style name="PrimaryButton">`** — a style resource, declared with
  no `parent` attribute this time, unlike `Theme.AuthFlowDemo`'s own
  declaration in the previous unit; a style used this way, applied
  directly to one view via the `style=` attribute rather than to a
  whole screen, doesn't need to inherit from an existing base theme the
  way a theme itself typically does.
- **`<item name="android:textColor">#FFFFFF</item>`** — sets this
  style's text color directly to white, as a literal hex value here
  rather than a `@color` reference — a deliberate, small inconsistency
  with the previous unit's own centralization argument, left as this
  lesson's own exercise to resolve.
- **`<item name="backgroundTint">@color/primary</item>`** — tints the
  button's default background drawable with the app's primary color,
  referenced from `colors.xml`; `backgroundTint` (no `android:` prefix)
  is an AppCompat-specific attribute, distinct from the plain framework
  `android:background`, which would replace the button's entire
  background shape rather than just recoloring its existing one.
- **`style="@style/PrimaryButton"`** — the attribute, on the `<Button>`
  element itself, that applies every item from this unit's new style;
  fully explained by this unit's own isolated lab, above; notably a
  different attribute name than `android:theme`, seen in the previous
  unit — `style` applies to one view; `android:theme` (not used in this
  unit) would apply to an entire subtree of views, a distinction worth
  keeping straight since the two are easy to conflate.

### CS Lens

No new hard concept beyond centralizing configuration, already given its
Recognition list in the previous unit — a style is the same idea
(one shared definition, many use sites) applied to a set of view
attributes instead of a single color value.

### SE Lens

This is a direct, concrete application of the **DRY principle — "Don't
Repeat Yourself"** — a named software engineering principle stating that
every piece of knowledge (here, "what a primary action button looks
like in this app") should have exactly one authoritative representation
in a system, rather than being copied, even accurately, into multiple
places. Before this unit, Login's and Signup's buttons had no shared
representation at all — each one's look lived entirely in its own
`<Button>` tag's own attributes, coincidentally identical only because
both were, in fact, copied from the same original pattern back in Lesson
3. The alternative this unit avoids — keeping every button's styling
attributes written out individually, on every button, everywhere — costs
nothing extra the first time it's written, and grows strictly worse with
every additional button this project ever adds that should share the
same look: each one is one more place a future visual change has to be
remembered and manually kept in sync, exactly the failure mode DRY
exists to prevent. The cost accepted in exchange: a reader looking at a
single `<Button>` tag alone can no longer see everything about its
appearance in one place — some of it lives in `PrimaryButton`, requiring
a second file to fully understand the first.

### Commands Needed

No new terminal commands.

### Run It

```
Login and Signup screens: both submit buttons now show white text on
  the app's primary color background, with matching padding —
  identical, because both reference the same PrimaryButton style.

backgroundTint's color value changed, in styles.xml only, from
  @color/primary to @color/primary_dark, with neither layout file
  touched: both buttons' color changed together, confirming the same
  proof this unit's own isolated lab already established, now shown
  against the real project's own two real screens.

Value restored to @color/primary before committing.
```

### Connection

Both auth screens now share a deliberate, consistent visual identity —
the last remaining piece is `MainActivity`, which currently has no
layout at all, and, as Lesson 4's own closing exercise already
surfaced, briefly flashes an unstyled default before it redirects.

---

## Concept Unit: Fixing the Router's Flash

### The Problem

Lesson 4's own closing exercise showed this directly: even though
`MainActivity` calls no `setContentView` at all, the OS still briefly
displays *some* background — the app's theme's own default
`windowBackground` — for the fraction of a second between the window
being created and `onCreate`'s `if`/`else` redirecting to the next real
screen. Since the previous two units of this lesson, that background is
now this project's own defined off-white, not an arbitrary system
default — better, but still not a deliberate design decision for this
one specific, momentary screen, which arguably shouldn't look identical
to every other screen in the app at all, given it's never actually meant
to be *seen*.

### Introduce the Concept in Isolation

A throwaway scratch Activity given its own distinct theme, deleted after
this section:

```xml
<!-- throwaway styles.xml addition -->
<style name="ScratchRouterTheme" parent="Theme.AuthFlowDemo">
    <item name="android:windowBackground">#000000</item>
</style>
```

```xml
<!-- throwaway Manifest entry -->
<activity
    android:name=".ScratchRouterActivity"
    android:theme="@style/ScratchRouterTheme" />
```

Running an app where this scratch Activity does nothing but sleep
briefly (to make the otherwise-instant flash actually observable) before
finishing shows, unmistakably, a solid black screen for that brief
window — visibly different from every other screen in the same scratch
app, which uses the app-wide theme's own lighter background. Removing
just the `android:theme` attribute from this scratch Activity's Manifest
entry, with nothing else touched, and running again, shows the same
brief flash now rendered in the app-wide theme's own background instead
— confirming this specific attribute, on this specific `<activity>` tag,
is what overrides the app-wide default for one single component, without
affecting any other screen in the same app at all.

### Discard the Throwaway Example

This scratch Activity, its theme, and its Manifest entry are deleted.
The real project's fix, applied to the genuine `MainActivity`, is built
next.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `app/src/main/res/values/styles.xml` (modified,
  adding one new `<style>`); `AndroidManifest.xml` (modified, adding
  `android:theme` to the existing `<activity android:name=".MainActivity">`
  entry, unchanged since Lesson 1).
- **Change type:** Add (the new style); configure (the one new
  attribute on an existing Manifest entry).
- **Location:** `styles.xml`, alongside this lesson's other two styles;
  the `<activity android:name=".MainActivity">` element the Manifest
  has carried since Lesson 1.
- **Dependencies:** `Theme.AuthFlowDemo`, from this lesson's first unit,
  as this new style's parent.

### The New Code

```xml
<style name="Theme.AuthFlowDemo.Router" parent="Theme.AuthFlowDemo">
    <item name="android:windowBackground">@color/primary</item>
</style>
```

```xml
<activity
    android:name=".MainActivity"
    android:theme="@style/Theme.AuthFlowDemo.Router"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

### The Updated Project

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>

    <style name="Theme.AuthFlowDemo" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryDark">@color/primary_dark</item>
        <item name="android:windowBackground">@color/background</item>
        <item name="android:textColorPrimary">@color/text_primary</item>
    </style>

    <style name="PrimaryButton">
        <item name="android:textColor">#FFFFFF</item>
        <item name="android:paddingTop">12dp</item>
        <item name="android:paddingBottom">12dp</item>
        <item name="backgroundTint">@color/primary</item>
    </style>

    <style name="Theme.AuthFlowDemo.Router" parent="Theme.AuthFlowDemo">
        <item name="android:windowBackground">@color/primary</item>
    </style>

</resources>
```

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.AuthFlowDemo">

        <activity
            android:name=".MainActivity"
            android:theme="@style/Theme.AuthFlowDemo.Router"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity android:name=".LoginActivity" android:exported="false" />
        <activity android:name=".SignupActivity" android:exported="false" />
        <activity android:name=".HomeActivity" android:exported="false" />
        <activity android:name=".SecondActivity" android:exported="false" />

    </application>
</manifest>
```

As a whole, the Manifest's `<application>` element still declares
`Theme.AuthFlowDemo` as the app-wide default, applying to every screen
that doesn't say otherwise — `LoginActivity`, `SignupActivity`,
`HomeActivity`, and `SecondActivity` all continue to use it, unchanged.
`MainActivity`'s own entry now names a more specific theme, inheriting
everything from the app-wide one but overriding just its background —
the one visible difference this project's brief, unavoidable router
flash now deliberately shows, instead of an arbitrary default.

### Mechanical Walkthrough

- **`<style name="Theme.AuthFlowDemo.Router" parent="Theme.AuthFlowDemo">`**
  — declares a new theme whose `parent` is this project's own
  already-defined theme, not a framework base theme directly; this
  means every attribute `Theme.AuthFlowDemo` itself already sets
  (`colorPrimary`, `textColorPrimary`, and the rest) still applies here
  too, without needing to be repeated — only `android:windowBackground`
  is actually overridden by this new, more specific style.
- **`<item name="android:windowBackground">@color/primary</item>`** —
  overrides just this one attribute, to the app's own primary color
  instead of the app-wide theme's lighter background — a deliberate,
  on-brand color for a screen the user should never consciously register
  seeing at all, rather than a jarring, undecorated system default.
- **`android:theme="@style/Theme.AuthFlowDemo.Router"`** — a new
  attribute, added directly to `MainActivity`'s own `<activity>` element
  in the Manifest, fully explained by this unit's own isolated lab: an
  `android:theme` attribute on a specific `<activity>` tag overrides the
  `<application>` element's own app-wide theme, for that one component
  only — every other `<activity>` entry in this same Manifest, having no
  such attribute of its own, continues to fall back to
  `Theme.AuthFlowDemo` exactly as before.

### CS Lens

No new hard concept beyond centralizing configuration and, specifically,
**inheritance with override** — a more specific definition
(`Theme.AuthFlowDemo.Router`) building on a more general one
(`Theme.AuthFlowDemo`), changing only what genuinely needs to differ —
already given its own Recognition treatment, in a different form, in
this lesson's first unit's discussion of `parent="Theme.AppCompat.
Light.NoActionBar"`.

### SE Lens

The real, complete solution to a router's momentary blank screen, on
current Android versions, is the platform's own dedicated Splash Screen
API (`androidx.core.splashscreen`), which supports an animated icon and
precise, documented control over exactly how long it's shown — genuinely
out of this lesson's own scope, and worth naming honestly rather than
silently pretending this lesson's simpler fix is the complete, modern
answer. What this lesson's `windowBackground` override does provide,
honestly: it replaces an arbitrary, undecorated flash with a single,
deliberate, on-brand color — a real, meaningful improvement for very
little additional complexity, and a reasonable stopping point for a
screen this brief, while remaining explicit that a production app aiming
for a fully polished launch experience would reach for the dedicated
API this lesson didn't build.

### Commands Needed

No new terminal commands.

### Run It

```
App launched: a brief flash of the app's own primary color appears
  before LoginActivity (or HomeActivity, depending on the persisted
  login state from Lesson 5) takes over — visibly different from the
  lighter background every other screen in the app uses, and no longer
  an arbitrary, undecorated system default.
```

### Connection

This closes the visual gap Lesson 4's own exercise first surfaced,
completing this lesson's own goal: every screen in this project, the
router included, now reflects one deliberate, shared visual identity
rather than a patchwork of whatever each screen's own individual,
unstyled defaults happened to be.

---

## Connect the Pieces

Follow one color, `@color/primary`, through every screen it touches.
Defined once, in `colors.xml`, as `#3F51B5`. `Theme.AuthFlowDemo`
references it for `colorPrimary`, which AppCompat's own widgets consult
by default — applying, app-wide, to `LoginActivity`, `SignupActivity`,
`HomeActivity`, and `SecondActivity` alike, none of which override it.
`PrimaryButton` references the same color a second time, for
`backgroundTint`, applied specifically to Login's and Signup's submit
buttons via their own `style` attribute — a different resource,
referencing the identical underlying value. `Theme.AuthFlowDemo.Router`
references it a third time, for `MainActivity`'s own
`windowBackground`, applied only to that one screen via its own Manifest
`android:theme` attribute. Three genuinely different mechanisms —
a theme's own default, an individual view's explicit style, and a
per-component theme override — all resolving back to the exact same
single hex value, defined in exactly one file, changeable in exactly one
place, with every one of these three uses following along automatically
the moment it changes.

## What Breaks Without This

Change `colors.xml`'s `primary` entry from `#3F51B5` to `#00C853` — a
clearly different, bright green — and run the app again, visiting every
screen. Every one of this lesson's three separate uses of that color —
the app-wide theme's own default button tinting, `PrimaryButton`'s
explicit `backgroundTint`, and `MainActivity`'s router flash — changes
together, in the same run, with none of the project's own layout or
Manifest files touched at all. This isn't a failure to reproduce on
purpose the way earlier lessons' own "what breaks" sections have been —
it's the positive proof this entire lesson has been building toward:
this is exactly what centralizing a value is *for*. Change the value
back to `#3F51B5` before committing, and, as a genuine failure to
contrast against it, try hardcoding one of `colors.xml`'s
values directly as a literal hex string on just one single view instead
of referencing it — confirm that this one view, alone, now fails to
follow along the next time the centralized color changes, which is
precisely the maintenance cost this lesson's own SE Lens named directly.

## Exercises

- `PrimaryButton`'s own `android:textColor` is still a hardcoded literal
  hex value (`#FFFFFF`), not a `@color` reference — the one deliberate
  inconsistency this lesson's own Mechanical Walkthrough flagged rather
  than silently leaving unexamined. Add a `text_on_primary` entry to
  `colors.xml` and update `PrimaryButton` to reference it instead,
  applying this lesson's own centralization argument to the one place
  this lesson didn't finish applying it.
- Define a second shared style, `FormField`, for the `EditText` fields
  on both Login and Signup (padding and a consistent hint text color),
  and apply it the same way `PrimaryButton` was applied to both
  buttons — deliberate repetition of this lesson's own second unit,
  applied to a different, still-unstyled element.

## Definition of Done

- [ ] `colors.xml` defines this project's real palette; `Theme.
      AuthFlowDemo` in `styles.xml` gives real content to the theme name
      the Manifest has referenced since Lesson 1.
- [ ] `PrimaryButton` is defined once and applied, via the `style`
      attribute, to both Login's and Signup's submit buttons.
- [ ] `MainActivity` has its own `Theme.AuthFlowDemo.Router` theme,
      applied via `android:theme` on its own `<activity>` Manifest
      entry, overriding only its `windowBackground`.
- [ ] Changing `@color/primary` in exactly one place visibly changes all
      three of this lesson's separate uses of it, confirmed by an actual
      run.
- [ ] Commit, with a message explaining *why*: e.g. `Define the app's
      real color palette and theme, share a PrimaryButton style across
      Login and Signup, and give MainActivity its own themed
      windowBackground — replaces six lessons' worth of unstyled
      defaults with one deliberate, centralized visual identity.`

**This closes the series.** Across seven lessons, this project went from
a single unstyled `Activity` to a complete, deliberately-designed
authentication flow: `Activity` and `Intent` fundamentals; data carried
across screens; a Signup screen and the back stack reasoning lateral
navigation between peer screens requires; a router that decides and
disappears; a login state that survives the app being fully closed;
back-stack flags that keep a completed login from ever being
Back-button-reversible; and, finally, one shared, centralized visual
identity tying all of it together. Every mechanism this series
introduced — the Manifest's component registration, explicit Intents,
Intent extras, the back stack, `finish()`, `SharedPreferences`, Intent
flags, and Android's resource system — is a genuinely reusable pattern,
not specific to a login flow at all; the next screen this project adds,
whatever it turns out to be, will very likely reach for several of them
again.