# Lesson 24: Reacting to the Result

**What you will build:** A real, working permission flow — tapping
"Enable Low-Stock Notifications" shows the actual Android system
permission dialog, and the screen updates honestly based on whatever the
user actually taps, closing the exact milestone Java's own Lesson 33
completed. The transferable problem: Java's Lesson 33 called this "the
clearest, most concrete Inversion-of-Control case in the entire series"
— a request that returns immediately, with the real answer arriving
later, from a separate system process. This series' own Lesson 21
already proved, on a disposable example, exactly what Kotlin's
coroutines change about that shape. This lesson wires the real thing,
using Compose's own equivalent of the strict timing rule Java's field
initializer satisfied a different way.

**What you need to know first:** Java's Lesson 33 in full
(`ContextCompat.checkSelfPermission`, `PackageManager.PERMISSION_GRANTED`,
the idempotent-check reasoning, and the full execution trace of a
permission request's real timing — all reused directly here, not
re-derived). This series' Lesson 19 (`ViewModel`), Lesson 20
(`StateFlow`), Lesson 21 (`suspend`, coroutines, Inversion of Control),
Lesson 22 (the Notifications screen shell, `LocalContext.current`
flagged there).

**Terms introduced in this lesson:**
- **`CompositionLocal`** — a mechanism for making a value implicitly
  available to every composable in a subtree, without passing it as an
  explicit parameter through every intermediate function.
- **`LocalContext`** — the built-in `CompositionLocal` providing the
  current Android `Context`, the Compose replacement for reading `this`
  directly inside a View-based `Activity`.
- **`rememberLauncherForActivityResult`** — the Compose function that
  registers a permission (or other activity-result) request, satisfying
  the same strict, early-and-unconditional timing rule Java's field
  initializer satisfies for a View-based Activity.

---

## Concept Unit: `LocalContext.current` — Reaching a `Context` From a Composable

### The Problem

Java's `NotificationsActivity` could always write plain `this` to reach
its own `Context` — `this` inside `onCreate` or a click listener simply
*is* the `Activity`, which is itself a `Context` through its own
inheritance chain. A `@Composable` function is not a method on any
`Activity` — this series' own Lesson 14 already established that a
composable is an ordinary function, called by Compose's own runtime,
with no implicit `this` referring to a hosting `Activity` at all. Yet
`ContextCompat.checkSelfPermission` and `Intent`'s constructor (both
already used in this series) require a real `Context` argument. Where
does a composable get one?

### The Mechanism

```kotlin
val context = LocalContext.current
```

`LocalContext` is a **`CompositionLocal`** — a mechanism letting a value
be implicitly available to every composable inside a given part of the
composition tree, without that value being threaded as an explicit
parameter through every single function in between. `Activity`'s own
`setContent { }` call (this series' own Lesson 16) automatically
provides the hosting `Activity` itself as the current `LocalContext`
value for everything composed inside it — `LocalContext.current` reads
that value at the exact point it's called, giving back the real
`Context` a composable needs, with no parameter ever explicitly passed
down to reach it.

### CS Lens

A `CompositionLocal` is a real, scoped instance of the general
**Dependency Injection** idea — code that needs something (a `Context`)
declares that need and receives it from its surrounding environment,
rather than constructing or looking it up itself — narrower than a
full DI framework, but solving the identical underlying problem: how
does deeply nested code reach something set up much higher in the
call structure, without every intermediate function needing to know
about it and pass it along explicitly.

Also recognized in: React's own Context API (the near-identical name is,
again, not a coincidence), and Java's own `ThreadLocal` (a value
implicitly scoped to "whatever's currently running on this thread,"
rather than to "whatever's currently being composed").

### SE Lens

**Why not just pass `Context` as an ordinary parameter to every
composable that needs one, the same way `InventoryList` takes an
`items` parameter?** A `Context` is needed by a genuinely wide,
unpredictable set of composables — any of them might eventually need to
launch an `Intent`, check a permission, or read a resource — and
threading it explicitly through every single composable's parameter
list, whether or not that specific one needs it, would be pure
boilerplate repeated everywhere. A `CompositionLocal` is the right tool
specifically for this shape: a value that's genuinely ambient to an
entire subtree, as opposed to `items` or `onAdd` (this series' own
Lesson 17), which are specific data only certain composables should ever
see — reaching for `CompositionLocal` for state hoisting's own kind of
data would be the wrong tool, hiding a real dependency instead of
declaring it in a function's own signature.

---

## Concept Unit: Checking Before Asking — Unchanged From Java

### The Problem

Confirm directly, as this series has for every pure-platform-API
concept: `ContextCompat.checkSelfPermission`'s real signature and
`PackageManager.PERMISSION_GRANTED`'s meaning are AndroidX API, reused
identically regardless of language.

### The New Code

```kotlin
fun isSmsPermissionGranted(context: Context): Boolean {
    return ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS) ==
        PackageManager.PERMISSION_GRANTED
}
```

### Mechanical Walkthrough

- `ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS)`
  — reappearing, Java's own Lesson 33 concept, identical signature,
  identical **idempotent check** behavior (calling it any number of
  times changes nothing and shows no UI), now taking a `Context`
  obtained via `LocalContext.current` instead of Java's plain `this`.
- `== PackageManager.PERMISSION_GRANTED` — reappearing, the identical
  named-constant comparison Java's Lesson 33 already used.

---

## Concept Unit: `rememberLauncherForActivityResult` — Compose's Timing Rule

### The Problem

Java's Lesson 33 registered its permission launcher in a field
initializer specifically because `registerForActivityResult` must run
unconditionally, before the Activity reaches a certain point in its
lifecycle — calling it conditionally, or too late, throws a real,
documented `IllegalStateException`. A composable has no field
initializers at all. Does Compose have an equivalent rule, and an
equivalent way to satisfy it?

### The New Code

```kotlin
val permissionLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.RequestPermission()
) { isGranted ->
    viewModel.setGranted(isGranted)
}
```

`rememberLauncherForActivityResult` must be called unconditionally, at
the top level of the composable's body — not inside a `Button`'s
`onClick`, not inside an `if` — the exact same "must be called every
time, in the same order, regardless of any condition" rule this series'
own Lesson 15 already established for `remember` itself. This isn't a
coincidence: `rememberLauncherForActivityResult` is built directly on
top of `remember`, and inherits its rule for the identical underlying
reason — Compose needs to associate this specific registration with
this specific position in the composition, consistently, across every
recomposition, the same way it does for any other `remember`ed value.

### Mechanical Walkthrough

- `ActivityResultContracts.RequestPermission()` — reappearing, the exact
  same real contract class Java's Lesson 31 already chose and Lesson 33
  already used, completely unchanged.
- `{ isGranted -> viewModel.setGranted(isGranted) }` — a lambda,
  reappearing (this series' own Lesson 08), playing the identical role
  Java's own registered callback lambda played — except this one
  reports the result into the `ViewModel`'s own `StateFlow` (this
  lesson's own next unit) rather than directly mutating a `TextView`.

### SE Lens

**Given `remember` and `rememberLauncherForActivityResult` share the
identical unconditional-call rule, why does Compose enforce it through
convention (a documented rule about where to call it) rather than a
compiler error, the way this series' own Lesson 12 sealed-class
exhaustiveness check is enforced?** Whether a given call happens
"unconditionally, at the top level" is a property of a function's
overall control flow — genuinely difficult for a compiler to verify in
general, unlike checking whether every subtype of a sealed class has a
`when` branch, which is a simple, local, structural check. Compose's own
lint tooling does catch many common violations of this rule at build
time, but the underlying guarantee ultimately rests on a documented
convention rather than a hard language guarantee — a real, honest
difference in enforcement strength worth knowing rather than assuming
every Compose rule is compiler-checked the way Kotlin's own language
rules are.

---

## Concept Unit: Wiring the Full Flow

### Project Change

- **Reference Source:** `ContextCompat.checkSelfPermission`,
  `ActivityResultContracts.RequestPermission`, and
  `rememberLauncherForActivityResult` — all real, stable AndroidX APIs,
  the first two identical to Java's own Lesson 33 citations.
- **Files affected:** `NotificationsViewModel.kt`;
  `NotificationsActivity.kt`.
- **Change type:** Add a method to the `ViewModel`; replace the
  placeholder button logic.
- **Dependencies:** This lesson's own `LocalContext`,
  `isSmsPermissionGranted`, `rememberLauncherForActivityResult`.

### The New Code

```kotlin
class NotificationsViewModel : ViewModel() {
    private val _isGranted = MutableStateFlow(false)
    val isGranted: StateFlow<Boolean> = _isGranted.asStateFlow()

    fun setGranted(granted: Boolean) {
        _isGranted.value = granted
    }
}
```

```kotlin
setContent {
    val viewModel: NotificationsViewModel = viewModel()
    val isGranted by viewModel.isGranted.collectAsState()
    val context = LocalContext.current

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted -> viewModel.setGranted(granted) }

    LaunchedEffect(Unit) {
        viewModel.setGranted(isSmsPermissionGranted(context))
    }

    Column(modifier = Modifier.padding(24.dp)) {
        Text(text = if (isGranted) "Notifications: enabled" else "Notifications: not yet requested")
        Button(onClick = {
            if (isSmsPermissionGranted(context)) {
                viewModel.setGranted(true)
            } else {
                permissionLauncher.launch(Manifest.permission.SEND_SMS)
            }
        }) {
            Text(text = "Enable Low-Stock Notifications")
        }
    }
}
```

### The Updated Project

The full `NotificationsActivity.kt`:

```kotlin
class NotificationsActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val viewModel: NotificationsViewModel = viewModel()
            val isGranted by viewModel.isGranted.collectAsState()
            val context = LocalContext.current                                    // ← new

            val permissionLauncher = rememberLauncherForActivityResult(           // ← new
                contract = ActivityResultContracts.RequestPermission()            // ← new
            ) { granted -> viewModel.setGranted(granted) }                        // ← new

            LaunchedEffect(Unit) {                                                // ← new
                viewModel.setGranted(isSmsPermissionGranted(context))             // ← new
            }                                                                     // ← new

            Column(modifier = Modifier.padding(24.dp)) {
                Text(text = if (isGranted) "Notifications: enabled" else "Notifications: not yet requested")
                Button(onClick = {                                                // ← new
                    if (isSmsPermissionGranted(context)) {                        // ← new
                        viewModel.setGranted(true)                                // ← new
                    } else {                                                      // ← new
                        permissionLauncher.launch(Manifest.permission.SEND_SMS)   // ← new
                    }                                                            // ← new
                }) {
                    Text(text = "Enable Low-Stock Notifications")
                }
            }
        }
    }
}
```

### Mechanical Walkthrough

- `setGranted(granted: Boolean)` — a new, ordinary `ViewModel` method,
  the identical "only the `ViewModel`'s own methods ever write to the
  private backing flow" shape this series' own Lesson 20 already
  established for `addItem`/`deleteItem`.
- `LaunchedEffect(Unit) { ... }` — **first appearance.** A real Compose
  function running a `suspend` block (this series' own Lesson 21
  concept) exactly once when the composable first enters composition —
  `Unit` as the "key" argument means "never re-run this for as long as
  this composable stays in the same position in the tree." This is
  Compose's real, structured answer to "run this once, on screen
  entry" — the direct equivalent of Java's own `onCreate` calling
  `isSmsPermissionGranted()` once, immediately, before any button tap,
  so a returning user who already granted access sees accurate status
  right away rather than the placeholder default.
- `if (isSmsPermissionGranted(context)) { viewModel.setGranted(true) }
  else { permissionLauncher.launch(...) }` — reappearing, Java's own
  Lesson 33 idempotent-check-then-request pattern, unchanged in
  structure: re-tapping the button when access is already granted just
  re-confirms status rather than needlessly re-prompting.
- `permissionLauncher.launch(Manifest.permission.SEND_SMS)` —
  reappearing, the identical real system-dialog trigger Java's Lesson
  33 already used, with the identical `Manifest.permission.SEND_SMS`
  constant.

### Execution Trace — the Real Timing, Confirmed Unchanged

Java's own Lesson 33 already traced this exact sequence in full detail,
and nothing about the real timing changes here — only the objects
involved:

1. `rememberLauncherForActivityResult` registers `permissionLauncher`,
   pairing the contract with the `{ granted -> ... }` lambda. No dialog
   yet; the lambda hasn't run.
2. `LaunchedEffect(Unit)` runs once, calling
   `isSmsPermissionGranted(context)` and updating `viewModel`'s state
   with the real, current status — before any tap.
3. The user taps "Enable Low-Stock Notifications." `isSmsPermissionGranted`
   is checked again; if still `false`, `permissionLauncher.launch(...)`
   runs and **returns immediately** — this click handler finishes with
   no answer yet known, precisely Java's own Lesson 33 Inversion-of-
   Control point.
4. The OS shows its own real permission dialog, entirely outside this
   app's composition.
5. Once the user actually taps "Allow" or "Deny," the OS calls the
   registered lambda from step 1 — `{ granted -> viewModel.setGranted(granted) }`
   — for the first time, updating the `StateFlow`.
6. `.collectAsState()` (this series' own Lesson 20) triggers
   recomposition (Lesson 15) of the `Text` reading `isGranted`, and the
   screen finally reflects the user's real decision.

### CS Lens

This is the same **Inversion of Control** thread Java's own series
traced through its Lessons 07, 16, 17, and 33, and this series' own
Lessons 04, 08, 11, 15, and 21 — reappearing here at its clearest
Compose form: the gap between step 3 (asking) and step 5 (finding out)
spans a real human decision neither this code nor Compose's own runtime
can observe directly, only be notified of afterward.

### SE Lens

**Why does the app need to keep working correctly regardless of which
way the user answers, rather than assuming grant?** The identical,
unchanged answer Java's own Lesson 33 already gave: denying a permission
is the user's legitimate right, not an error condition — this project's
own status text for the denied case says so honestly, and both outcomes
are handled by the same `if`/`else` shape rather than one being treated
as a failure path.

---

## Connect the Pieces

One trace across this entire milestone: `LocalContext.current` gave a
composable a real `Context` with no `this` available. `rememberLauncherForActivityResult`
registered the permission request, satisfying Compose's own version of
the strict, unconditional timing rule Java's field initializer already
satisfied a different way. `LaunchedEffect(Unit)` ran the initial status
check once, on screen entry — Compose's structured answer to "run this
once" — and tapping the button either re-confirmed already-granted
status or triggered the real system dialog, whose eventual answer,
arriving asynchronously on the OS's own schedule, updated a `StateFlow`
(Lesson 20) that Compose's own recomposition (Lesson 15) turned back
into updated, honest status text on screen.

## What Breaks Without This

Move `rememberLauncherForActivityResult` inside the `Button`'s own
`onClick` lambda, calling it only when the button is actually tapped,
and try to build and run this yourself.

Real result: a real crash at runtime — Compose's own equivalent of
Java's documented `IllegalStateException: LifecycleOwners must call
register before they are STARTED`, since launching a permission request
whose launcher was never registered unconditionally, ahead of time,
violates the identical rule this lesson's own SE Lens named. Restore the
unconditional, top-level call before moving on.

## Exercises

1. Grant the permission once, navigate back to the inventory screen,
   then return to the Notifications screen. Confirm the status text
   correctly shows "enabled" immediately, with no dialog re-appearing —
   direct proof `LaunchedEffect`'s idempotent check works as intended,
   the Compose version of Java's own Lesson 33 first exercise.
2. In your device or emulator's system Settings, manually revoke the
   permission after granting it, then reopen the Notifications screen
   and confirm the status text correctly reverts to reflecting real,
   current system state.
3. Change `LaunchedEffect(Unit)` to `LaunchedEffect(isGranted)` instead,
   and explain, in your own words, why this would cause the initial
   check to re-run every time `isGranted` itself changes — connecting
   your answer to what `LaunchedEffect`'s key argument actually controls.

## Definition of Done

- [ ] Tapping "Enable Low-Stock Notifications" shows the real system
      permission dialog on an emulator or device.
- [ ] Both a real "Allow" and a real "Deny" tap correctly update the
      status text, with the app never crashing or breaking either way.
- [ ] You triggered the real crash from moving
      `rememberLauncherForActivityResult` inside a conditional callback,
      and restored the correct, unconditional version.
- [ ] You can explain what `LocalContext.current` and
      `LaunchedEffect(Unit)` each do, and why a composable needs both in
      a way `MainActivity`'s View-based code never did.
- [ ] Commit: `git commit -m "Request SEND_SMS via
      rememberLauncherForActivityResult and react to both grant and
      denial"` — explaining that both outcomes are handled, not just
      that a permission request was added.

Milestone 5 is done — the SMS permission requirement fully satisfied,
built on `ViewModel`, `StateFlow`, and coroutines end to end. Milestone
6 begins: Navigation, theming, and polish — starting with a real
`NavHost` replacing this series' own `Intent`-per-screen model for the
two Compose screens just built.
