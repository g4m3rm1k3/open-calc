# Lesson 22: Declaring the Permission and Building the Notifications Screen

**What you will build:** The Manifest declarations `SEND_SMS` requires,
and a real third screen — status text and a button — built with
everything this series has already established (`ViewModel`,
`StateFlow`, `LazyColumn`'s sibling composables), with the actual
permission-request logic deliberately not wired yet. The transferable
problem: Java's Lesson 30 already drew a real, load-bearing line between
permissions the OS grants automatically and ones requiring an explicit
runtime prompt — that line is Android platform policy, untouched by
language. What's worth getting precisely right here is a claim easy to
get wrong: Java's own Lesson 33 already uses the *modern*,
contract-based permission API — this series isn't upgrading Java's
approach, it's building the exact same one, in Kotlin and Compose.

**What you need to know first:** Java's Lesson 30 (`<uses-permission>`,
`<uses-feature>`, normal vs. dangerous permissions) and Lesson 31 (the
screen's own shape, and `ActivityResultContracts.RequestPermission`
already chosen there as the option Java's own project builds — read in
full, since this lesson inherits that decision rather than revisiting
it). This series' Lesson 19 (`ViewModel`), Lesson 20 (`StateFlow`),
Lesson 16 (`LazyColumn`'s sibling composables — `Column`, `Text`,
`Button`).

**Terms introduced in this lesson:** None new — every construct in this
lesson is a direct reappearance, applied to a third screen. That
repetition is itself the point, named directly in this lesson's own SE
Lens.

---

## Concept Unit: The Manifest Declarations — Unchanged

### The Problem

Confirm directly, as this series has for every pure-platform-policy
concept so far: normal-versus-dangerous permission classification and
the specific Manifest tags that declare a permission or a hardware
feature are Android platform policy, evaluated by the OS and the
Play Store's own review tooling — none of it reads or cares what
language `MainActivity`, `InventoryActivity`, or this lesson's new
screen happen to be written in.

### The New Code

```xml
<uses-permission android:name="android.permission.SEND_SMS" />

<uses-feature
    android:name="android.hardware.telephony"
    android:required="false" />
```

### Project Change

- **Reference Source:** No reference counterpart — standard Android
  Manifest schema tags, identical to Java's Lesson 30.
- **Files affected:** `AndroidManifest.xml`.
- **Change type:** Add two top-level declarations, siblings of
  `<application>`.
- **Dependencies:** None new.

---

## Concept Unit: A Third Screen — Built With What's Already Known

### The Problem

The permission request needs a real screen to live on — its own status
display and a button — the identical structural need Java's Lesson 17
and this series' own Lesson 11 already solved once for the grid screen.

### Project Change

- **Reference Source:** No reference counterpart — an application
  screen, same general shape as `InventoryActivity`.
- **Files affected:** New `NotificationsViewModel.kt`; new
  `NotificationsActivity.kt`; `AndroidManifest.xml`; `InventoryActivity.kt`
  (a button reaching this new screen).
- **Change type:** Create two new files; add a Manifest entry; add a
  button and navigation to an existing screen.
- **Dependencies:** This series' own Lessons 11, 16, 19, 20.

### The New Code

```kotlin
class NotificationsViewModel : ViewModel() {
    private val _isGranted = MutableStateFlow(false)
    val isGranted: StateFlow<Boolean> = _isGranted.asStateFlow()
}
```

```kotlin
class NotificationsActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val viewModel: NotificationsViewModel = viewModel()
            val isGranted by viewModel.isGranted.collectAsState()

            Column(modifier = Modifier.padding(24.dp)) {
                Text(text = if (isGranted) "Notifications: enabled" else "Notifications: not yet requested")
                Button(onClick = { /* the real request arrives in Lesson 24 */ }) {
                    Text(text = "Enable Low-Stock Notifications")
                }
            }
        }
    }
}
```

```xml
<activity
    android:name=".NotificationsActivity"
    android:exported="false" />
```

```kotlin
val context = LocalContext.current
Button(onClick = {
    context.startActivity(Intent(context, NotificationsActivity::class.java))
}) {
    Text(text = "Notifications")
}
```

### Mechanical Walkthrough

Every construct here is a direct reappearance: `class NotificationsViewModel :
ViewModel()` and its private-`MutableStateFlow`/public-`StateFlow` pair
(this series' own Lessons 19 and 20), `ComponentActivity`/`setContent`
(Lesson 16), `viewModel()`/`.collectAsState()` (Lessons 19 and 20),
`Column`/`Text`/`Button`/`Modifier.padding` (Lesson 14),
`Intent`/`InventoryActivity::class.java`-style navigation (Lesson 11),
and the Manifest `<activity>` entry (this series' own Lesson 11 and
Java's own Lesson 07). `val context = LocalContext.current` is flagged,
not explained yet — this series' own Lesson 24 covers exactly what a
`CompositionLocal` is and why a composable needs one at all to reach an
`Activity`'s `Context`, rather than simply writing `this` the way
`MainActivity`'s View-based code always could. The one genuinely
new-looking piece this lesson does explain — `if
(isGranted) "..." else "..."` used directly as `Text`'s `text` argument
— is this series' own Lesson 02 `if`/`else` reused as an ordinary
statement-shaped conditional; the next lesson names precisely why it's
also legal to write exactly like this, as an expression producing a
value, and what Java's own ternary operator has to do with it.

### SE Lens

**Given every single construct in this screen already existed, what is
this lesson actually teaching?** Exactly what Java's own Lesson 31
named directly about its own third screen: "building a new screen is
now fast and familiar, the actual payoff of having learned each piece
once, properly, rather than by pattern-matching a template." This
lesson is a deliberate checkpoint, not a filler — confirming that
`ViewModel`, `StateFlow`, and Compose's basic vocabulary compose
together into a real, working screen with zero new mechanism required,
the same milestone Java's own series reached at the identical point in
its own permission-flow arc.

---

## Connect the Pieces

One trace: `<uses-permission>`/`<uses-feature>` declared `SEND_SMS`
requestable at all, unchanged from Java's own Lesson 30. A new
`NotificationsViewModel`, following this series' own Lessons 19 and 20
pattern exactly, holds a placeholder `isGranted` `StateFlow` — `false`
for now, not yet connected to anything real. `NotificationsActivity`
composes a status `Text` and a `Button` from it, reachable from the
inventory screen via the same `Intent`-based navigation this series
already built twice. Nothing here is new mechanism; the point is
confirming it all still fits together, before the next two lessons add
what's actually missing: a real conditional expression for the status
text, and a real permission request behind the button.

## What Breaks Without This

Temporarily remove the `<activity android:name=".NotificationsActivity"
... />` Manifest entry and tap the new "Notifications" button.

Real result, when you do this yourself: the identical
`android.content.ActivityNotFoundException` this series' own Lesson 11
already documented for a missing Manifest entry, now naming
`NotificationsActivity` instead of `InventoryActivity` — the same real
requirement, unchanged, applying to a third screen exactly as it did to
the second. Restore the entry before moving on.

## Exercises

1. Confirm, by reading `NotificationsViewModel`'s own code, that
   `isGranted` cannot currently be set to `true` from anywhere — there
   is no method on the class that writes to `_items` at all yet.
   Explain, in your own words, why this is an honest, incomplete state
   to leave the project in temporarily, rather than a bug.
2. Add a second placeholder `StateFlow<Boolean>` to
   `NotificationsViewModel`, unrelated to the real permission (for
   instance, `isExpanded`), and wire a second `Text` to it via
   `collectAsState()` — confirming you can reproduce this lesson's own
   `StateFlow`/`collectAsState` pattern independently, without copying
   it.

## Definition of Done

- [ ] The Manifest declares `SEND_SMS` and the telephony feature,
      identical to Java's own Lesson 30.
- [ ] A real third screen exists, reachable from the inventory screen,
      showing placeholder status text and a button that does nothing
      yet.
- [ ] You triggered the real `ActivityNotFoundException` from a missing
      Manifest entry, and restored it.
- [ ] You can state precisely why this lesson does not yet request any
      real permission, and what the next two lessons each add.
- [ ] Commit: `git commit -m "Declare SEND_SMS and build the
      Notifications screen shell with a placeholder StateFlow"` —
      explaining honestly that the real permission logic is still to
      come.

Next: `if`/`else` as a real expression, and the operator Java's own
Lesson 32 used for this exact status-text line — plus the Elvis
operator name collision this series flagged all the way back in Lesson
02, finally resolved.
