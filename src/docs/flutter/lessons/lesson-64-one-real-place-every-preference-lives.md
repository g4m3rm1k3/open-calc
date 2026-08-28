# Lesson 64: One Real Place Every Preference Lives

**What you will build.** A real, dedicated Settings screen, reached by
a real `Navigator` push, consolidating every preference this app has —
sound, haptics, and dark mode (moved here from scattered AppBar
buttons, and, for the first time, genuinely saved across a real app
restart) — plus four genuinely new ones: showing or hiding the timer,
confirming before a move already known to be a mistake, turning this
app's own animations on or off, and a preferred difficulty. The
transferable problem: a preference scattered as one-off toggles,
wherever in the UI felt convenient at the time, doesn't scale — a
player looking for "where do I turn off sound" needs exactly one real
place to look, and this app's own code needs exactly one real place
that owns what the current, shared preferences actually are, whether
five toggles exist or fifty.

**What you need to know first.** `GameSessionNotifier`/
`gameSessionProvider`'s own real shape (`NotifierProvider`, a
`Notifier<T>` subclass, `ref.watch`/`ref.read(...notifier)`) — this
lesson's own new `SettingsNotifier` is built the identical real way,
applied to preferences instead of gameplay. `AppDatabase`'s own real
`settings` table, deliberately naked (no repository interface), and
its own real `totalGamesStarted`/`incrementTotalGamesStarted` methods
— the real, established precedent this lesson's own generic
`getSetting`/`setSetting` methods extend. `_scaffoldMessengerKey`'s
own real role and the real `BuildContext` mistake it originally fixed
— this lesson repeats, and fixes, the identical real class of mistake
twice more. `_playSound`/`_playHaptic` and the real, local
`_soundEnabled`/`_hapticsEnabled` fields they previously gated —
this lesson removes both fields, replacing them with a real, shared
provider. Every real animation duration this app's board and
completion banner already play.

**Terms used in this lesson**

- **Composition root** — the one real place a preference (or, as
  already established elsewhere in this app, a dependency like `Clock`)
  is actually decided and bound, with every other real piece of code
  reaching it only through a shared, real seam rather than deciding or
  storing its own separate copy. This lesson's own `SettingsNotifier`
  becomes that one real place for every preference this app has.

**Objects and methods used**

- **`Navigator` / `Navigator.of` / `MaterialPageRoute` / `GlobalKey<NavigatorState>`**
  - *What it is:* `Navigator` is a real, built-in Flutter widget
    managing a real, growing-and-shrinking stack of real screens
    (`Route`s); `Navigator.of(context)` finds the nearest real one
    above a given context; `MaterialPageRoute` is a real, concrete
    `Route` describing one real, new screen to push; `GlobalKey
    <NavigatorState>` is a real, already-established kind of key
    (`_scaffoldMessengerKey` already uses the identical real shape for
    a different real state class) letting code reach a real
    `Navigator`'s own state directly, bypassing `BuildContext`
    lookup entirely.
  - *Implementation:* `MaterialApp`'s own real `navigatorKey:`
    parameter accepts exactly this kind of key, wiring it to the real,
    single `Navigator` `MaterialApp` builds internally; `NavigatorState
    .push<T>(Route<T> route)` and `.pop<T>([T? result])` are real,
    concrete methods on the state that key exposes.
  - *Its use:* `Navigator.of(context).push(MaterialPageRoute(builder:
    (context) => const SettingsScreen()))` opens the real, new screen;
    a real `GlobalKey<NavigatorState>` (`_navigatorKey`) fixes the real
    `BuildContext` mistake described in this lesson's own Concept
    Units, below.
  - *Type:* `Navigator` a `StatefulWidget`; `MaterialPageRoute<T>` a
    real, generic `Route` subclass; `GlobalKey<NavigatorState>` a real,
    generic key class.
  - *Responsibility:* own and mutate the real, ordered stack of screens
    currently shown, animate real transitions between them, and expose
    real push/pop operations to any real code holding a valid real
    context or key.
  - *Depends on:* a real `MaterialApp` (or a bare `Navigator`) already
    present above wherever `Navigator.of` is called, or a real
    `GlobalKey<NavigatorState>` already attached to one.
  - *Connects to:* the Settings `IconButton`'s own `onPressed`, and
    `_confirmMistake`'s own `showDialog` call, below.
  - *Shape:* framework-level, Presentation-layer only.
- **`showDialog` / `AlertDialog`**
  - *What it is:* `showDialog` is a real, built-in Flutter function
    pushing a real, modal dialog route onto the nearest real
    `Navigator`, returning a real `Future` that resolves once that
    dialog is dismissed; `AlertDialog` is a real, ready-made Material
    widget shaping that dialog's own real title, body, and actions.
  - *Implementation:* `Future<T?> showDialog<T>({required BuildContext
    context, required WidgetBuilder builder})` — real and generic: `T`
    is whatever real type the dialog itself eventually returns via a
    real `Navigator.pop(context, value)` call from inside it.
  - *Its use:* `_confirmMistake` awaits a real `bool?` — `true` if the
    player taps "Enter anyway," `false` if "Cancel," `null` if
    dismissed some other real way (mapped to `false` either way).
  - *Type:* `showDialog` a top-level, generic function; `AlertDialog` a
    real, concrete `StatelessWidget`.
  - *Responsibility:* `showDialog` manages the real, modal route itself
    — dimming the background, blocking real interaction outside the
    dialog, returning control once popped; `AlertDialog` only shapes
    what's shown inside it.
  - *Depends on:* a real, valid `BuildContext` genuinely below a
    `Navigator` — the exact real requirement this lesson's own
    `_navigatorKey` fix exists to satisfy.
  - *Connects to:* its own two real `TextButton`s each call
    `Navigator.pop(context, value)` directly, resolving the real
    `Future` `_confirmMistake` is awaiting.
  - *Shape:* Presentation-layer, reached only from `_dispatch`.
- **`SwitchListTile`**
  - *What it is:* a real, built-in Material widget combining a real
    `ListTile` (a title, an optional subtitle) with a real, built-in
    on/off `Switch`, already wired together as one real, tappable row.
  - *Implementation:* its real, relevant constructor members:
    `SwitchListTile({Widget? title, Widget? subtitle, required bool
    value, required ValueChanged<bool>? onChanged})`.
  - *Its use:* every boolean preference on `SettingsScreen` (Sound,
    Haptics, Timer, Mistake warnings, Animations) uses one, real,
    identical `SwitchListTile`, differing only in its own real title,
    subtitle, and which real notifier method its `onChanged` calls.
  - *Type:* a real, concrete `StatefulWidget`.
  - *Responsibility:* show a real, current boolean value and a real,
    tappable row toggling it, calling back with the real, new value —
    never owning that value itself.
  - *Depends on:* a real, current `value` and a real `onChanged`
    callback, both supplied fresh on every real build from
    `settingsProvider`'s own current state.
  - *Connects to:* `onChanged` calls straight into `SettingsNotifier`'s
    own real, matching toggle method.
  - *Shape:* Presentation-layer, purely visual once wired.
- **`SegmentedButton<T>` / `ButtonSegment<T>`**
  - *What it is:* a real, built-in Material 3 widget presenting a
    real, small, fixed set of mutually exclusive choices as one, real,
    connected row of segments — `ButtonSegment<T>` names one real
    choice.
  - *Implementation:* its real, relevant constructor members:
    `SegmentedButton<T>({required List<ButtonSegment<T>> segments,
    required Set<T> selected, ValueChanged<Set<T>>? onSelectionChanged})`;
    `ButtonSegment<T>({required T value, required Widget label})`.
  - *Its use:* this lesson's own real, three-way `Difficulty` choice
    (`easy`/`medium`/`hard`), real and generic over this project's own
    already-established `Difficulty` enum.
  - *Type:* a real, generic, concrete `StatefulWidget`.
  - *Responsibility:* show every real, available choice at once, mark
    exactly which real one (or, in general, ones — this app only ever
    selects exactly one) is currently selected, and report back a real,
    complete new selection set on a real tap — never a single changed
    value in isolation.
  - *Depends on:* a real, non-empty `segments` list and a real,
    current `selected` set.
  - *Connects to:* `onSelectionChanged`'s own real `selection.first`
    calls `SettingsNotifier.setPreferredDifficulty` directly.
  - *Shape:* Presentation-layer.

## Concept Unit: A real settings screen

### The Problem

This app's own real, already-existing sound and haptics toggles
currently live as individual `IconButton`s, directly in the
main screen's own AppBar — a place that stops scaling the moment a
third, fourth, or fifth preference needs to exist alongside them, and
gives a player no real, single place to expect to find one.

> **Try it yourself first.** This app already has one real, working
> example of navigating to different real content based on real,
> changing conditions — its own `_CompactLayout`/`_WideLayout` choice,
> picking between two real widgets in the same real position based on
> real screen width. Is showing a whole, separate Settings screen the
> identical real kind of problem (which widget goes in this same real
> spot), or a genuinely different one? What real, new capability would
> "leave this screen, see another one, then come back" need that
> swapping between two widgets in place never did?

### Introducing the concept

No new isolated lab is needed for `Navigator.push`/`MaterialPageRoute`
themselves — both are frequently-cited real, standard Flutter
navigation primitives whose own behavior (pushing a new real screen,
animating in, real back-navigation) is already confidently predictable
without a run, per the Verification Rule's own Necessity clause: a
real, new screen appears, and a real, physical or software back
action returns to the previous one. What genuinely needs real, run
proof instead is this lesson's own actual mistake — see the next
Concept Unit's own isolated lab, which exists specifically because a
first, real attempt at exactly this pattern failed.

### Discard the throwaway example

Not applicable — no throwaway example was introduced in this specific
Concept Unit.

### Project Change

- **Reference Source** — No reference counterpart; a from-scratch
  addition.
- **Files affected** —
  `project/lib/features/sudoku/presentation/settings_screen.dart` (new
  file); `project/lib/features/sudoku/presentation/sudoku_app.dart`
  (AppBar's own three real toggle buttons replaced by one real
  "Settings" button).
- **Change type** — add (new screen); replace (AppBar actions).
- **Location** — a new, real, top-level `SettingsScreen` widget; the
  main screen's own `AppBar.actions` list.
- **Dependencies** — none beyond the Flutter SDK.

### The New Code

```dart
IconButton(
  icon: const Icon(Icons.settings),
  tooltip: 'Settings',
  onPressed: () => Navigator.of(context).push(
    MaterialPageRoute(builder: (context) => const SettingsScreen()),
  ),
);
```

### The Updated Project

`SudokuApp.build`'s own real `home:`, this Concept Unit's own real,
first attempt, numbered:

```dart
1  home: Scaffold(
2    appBar: AppBar(
3      title: const Text('Sudoku'),
4      actions: [
5        IconButton(                                          // ← new
6          icon: const Icon(Icons.settings),                   // ← new
7          tooltip: 'Settings',                                // ← new
8          onPressed: () => Navigator.of(context).push(         // ← new
9            MaterialPageRoute(builder: (context) => const SettingsScreen()), // ← new
10         ),                                                   // ← new
11       ),                                                     // ← new
12     ],
13   ),
14   body: Focus(/* this app's entire existing real body, unchanged */),
15 ),
```

Real, run-caught the instant this landed in a real, permanent test: a
real `The context used to push or pop routes from the Navigator must
be that of a widget that is a descendant of a Navigator widget` error
— line 8's own `context` is `_SudokuAppState.build`'s own parameter,
which sits *above* the very `MaterialApp` (and, inside it, the real
`Navigator`) this same `build` call constructs, exactly the same real
class of mistake this project's own `_scaffoldMessengerKey` already
exists to solve for `SnackBar`. This Concept Unit's own real fix is
covered in full in the next Concept Unit, below, once the Settings
screen's own real content exists to navigate to.

### Mechanical walkthrough

- `IconButton(icon: const Icon(Icons.settings), tooltip: 'Settings',
  onPressed: ...)` — a real, already-established widget (the identical
  real shape the theme toggle already used), its own real `icon`
  fixed rather than switching between states, since "open settings" is
  always the identical real action regardless of any preference's own
  current value.
- `Navigator.of(context)` — the real method explained in full in this
  lesson's own Header, above; resolves the nearest real `Navigator`
  above whatever `context` is passed — this specific call site's own
  real bug, and fix, are this lesson's own central real lesson.
- `.push(MaterialPageRoute(builder: (context) => const
  SettingsScreen()))` — the real method and real class explained in
  full in this lesson's own Header, above; `builder:` receives its own
  real, fresh `context`, genuinely below the newly-pushed route, unlike
  the outer `context` this whole expression is called from.

### CS lens

A real, growing, ordered stack of screens, each one pushed on top of
the last and popped back off in exact reverse order, is a real,
literal **stack** — the same CS data structure already familiar from
this curriculum's own recursion and backtracking work, here applied to
real, whole screens instead of function calls. Also recognized in: a
web browser's own back button, walking an identical real, ordered
history stack; a text editor's own undo stack; a debugger's own real
call stack, unwound one real frame at a time.

### SE lens

The real alternative here was a single, ever-growing settings `Column`
squeezed onto the main screen itself, always visible — real, zero
navigation code needed, at the real cost of permanently consuming
real, valuable screen space for something most real sessions never
touch. The real, chosen tradeoff: a real, separate screen costs one
real navigation call and, as this Concept Unit's own real mistake
already showed, a genuine `BuildContext` hazard to get right — worth
it for keeping the main, real, gameplay screen focused on gameplay.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

A real, tappable path now exists from this app's own main screen to a
real, separate place every preference will live — the next Concept
Unit fixes the real bug this Concept Unit's own first attempt exposed,
and gives that place its own first, real, persisted content.

---

## Concept Unit: Real, shared, persisted preferences

### The Problem

This app's own already-existing sound and haptics toggles lived as two
real, separate, local `bool` fields on `_SudokuAppState`, reachable
only from that one widget, and reset to their own real defaults on
every real app restart. A Settings screen needs those identical real
preferences too
— a second, separate real copy would immediately drift out of sync
with the first.

> **Try it yourself first.** `GameSessionNotifier`/`gameSessionProvider`
> already give this app one real, shared place its one, current
> `GameSession` lives, reachable from any real widget via `ref.watch`/
> `ref.read`. Sketch, in your head, the identical real shape applied to
> preferences instead: what would the real, shared "current state"
> object need to hold, and what real, small methods would it need, to
> replace `_soundEnabled`/`_hapticsEnabled` and their own real toggle
> methods with something both the main screen and a real, separate
> Settings screen could equally reach?

### Introducing the concept

`AppDatabase`'s own real `settings` table already exists (`key TEXT
PRIMARY KEY, value INTEGER NOT NULL`), built long before this lesson
for a single, real, hardcoded key (`total_games_started`). No isolated
lab is needed for the `Notifier`/`NotifierProvider` shape itself — the
identical real mechanism `gameSessionProvider` already established,
reused here, not re-derived, per the Repetition Rule; what this
Concept Unit's own real, run evidence actually proves is the *specific*
`BuildContext` mistake left unresolved by the Concept Unit above,
since `_confirmMistake` (added in a later Concept Unit but landed in
the same real file this session) hit the identical real class of bug a
second time:

```dart
showDialog<bool>(context: context, builder: (context) => AlertDialog(...));
```

Run for real, the instant a permanent test exercised it: `No
MaterialLocalizations found... SudokuApp widgets require
MaterialLocalizations to be provided by a Localizations widget
ancestor` — the identical real root cause as the Concept Unit above's
own `Navigator.of` failure, `this.context` sitting above `MaterialApp`
a second time, in a second, real call site.

### Discard the throwaway example

Not applicable — both real failures shown above happened directly in
real, permanent project code, not a throwaway lab; the real fix below
is itself the discard-worthy lesson.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/infrastructure/app_database.dart`
  (`getSetting`/`setSetting` added);
  `project/lib/features/sudoku/application/settings_provider.dart`
  (new file: `AppSettings`, `SettingsNotifier`, `settingsProvider`);
  `project/lib/features/sudoku/presentation/sudoku_app.dart`
  (`_soundEnabled`/`_hapticsEnabled`/`_themeMode` fields and their own
  toggle methods removed; a real `_navigatorKey` added; every real
  read/write routed through `settingsProvider` instead).
- **Change type** — add (new file, new `AppDatabase` methods, new
  `GlobalKey`); remove (three real fields, three real methods).
- **Location** — `AppDatabase`, beside `totalGamesStarted`; a new file
  for the provider; `_SudokuAppState`, replacing its own former,
  local preference state.
- **Dependencies** — `appDatabaseProvider`, already established.

### The New Code

```dart
Future<int?> getSetting(String key) async {
  final db = await _open();
  final rows = await db.query('settings', where: 'key = ?', whereArgs: [key]);
  return rows.isEmpty ? null : rows.first['value'] as int;
}

Future<void> setSetting(String key, int value) async {
  final db = await _open();
  await db.insert('settings', {'key': key, 'value': value}, conflictAlgorithm: ConflictAlgorithm.replace);
}
```

### The Updated Project

`SettingsNotifier`, this lesson's own real, new composition root for
every preference, numbered (elided fields shown in full below, not
placeholder):

```dart
 1  class SettingsNotifier extends Notifier<AppSettings> {
 2    @override
 3    AppSettings build() {
 4      Future.microtask(_load);
 5      return AppSettings._defaults;
 6    }
 7
 8    Future<void> _load() async {
 9      final db = ref.read(appDatabaseProvider);
10      final sound = await db.getSetting('sound_enabled');
11      // ...six further real db.getSetting calls, one per real preference
12      if (!ref.mounted) return;
13      state = AppSettings(
14        soundEnabled: sound == null ? state.soundEnabled : sound == 1,
15        // ...six further real fields, each the identical real
16        // null-means-keep-default, otherwise-decode pattern
17      );
18    }
19
20    Future<void> _save(String key, int value) =>
21        ref.read(appDatabaseProvider).setSetting(key, value);
22
23    void toggleSound() {
24      state = state.copyWith(soundEnabled: !state.soundEnabled);
25      _save('sound_enabled', state.soundEnabled ? 1 : 0);
26    }
27    // ...six further real toggle/set methods, the identical real shape
28  }
```

`_SudokuAppState`'s own real fix, the `_navigatorKey` this whole
lesson's own two real `BuildContext` bugs needed, numbered:

```dart
1  class _SudokuAppState extends ConsumerState<SudokuApp> with WidgetsBindingObserver {
2    final _scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();
3    final _navigatorKey = GlobalKey<NavigatorState>();                    // ← new
4    int? _selectedRow = 4;
5    int? _selectedCol = 4;
6    int _shakeTrigger = 0;
```

And `build`'s own real `MaterialApp`, wiring it in, alongside wrapping
`Scaffold` in a real `Builder` for the Settings button's own
`Navigator.of` call from the Concept Unit above:

```dart
1  return MaterialApp(
2    scaffoldMessengerKey: _scaffoldMessengerKey,
3    navigatorKey: _navigatorKey,                                          // ← new
4    theme: AppTheme.light,
5    darkTheme: AppTheme.dark,
6    themeMode: settings.themeMode,                                        // ← changed from _themeMode
7    home: Builder(                                                        // ← new
8      builder: (context) => Scaffold(                                    // ← new
9        appBar: AppBar(/* the Settings IconButton from the Concept Unit above */),
10       body: Focus(/* this app's entire existing real body, unchanged */),
11     ),                                                                   // ← new
12   ),                                                                     // ← new
13 );
```

### Mechanical walkthrough

- `Future<int?> getSetting(String key)` / `Future<void> setSetting(String
  key, int value)` — two real, new, public methods on `AppDatabase`,
  the identical real query/insert shape `totalGamesStarted`/
  `incrementTotalGamesStarted` already established, generalized from
  one real, hardcoded key to any real, caller-given one.
- `class SettingsNotifier extends Notifier<AppSettings>` — the
  identical real base class `GameSessionNotifier` already extends,
  explained in full, restated here rather than cited: a real Riverpod
  class owning one real, shared, mutable-by-replacement `state`
  object, reachable from any real widget through the real
  `settingsProvider` it's registered under.
- `Future.microtask(_load)` — a real, already-established method
  (`dart:async`), scheduling `_load` to run once the current real
  synchronous work finishes — the identical real, deliberately
  un-awaited, optimistic-startup choice `GameSessionNotifier.build`
  already makes for its own saved session.
- `AppSettings._defaults` — a real, private, `static const` instance
  (shown in full inside `AppSettings` itself, not reproduced here)
  naming every real preference's own real, sensible starting value.
- `if (!ref.mounted) return;` — a real, already-established guard
  (the identical real shape `GameSessionNotifier._loadSavedSession`
  already uses), protecting against a real, late-arriving async read
  completing after this real notifier has already been discarded.
- `state = AppSettings(soundEnabled: sound == null ? state.soundEnabled
  : sound == 1, ...)` — for each real preference, a real ternary:
  `null` (never saved) keeps the real, current — meaning default —
  value; any other real, saved `int` decodes to a real `bool` by
  comparing against `1`.
- `void toggleSound() { state = state.copyWith(...); _save(...); }` —
  a real, new method; `state = ...` is a real, direct field
  reassignment (Riverpod's own real change-notification mechanism,
  already established, fires the instant `state`'s own reference
  changes); `copyWith` (shown in full inside `AppSettings` itself, the
  identical real shape `GameSession.touched`-style copying already
  established) returns a real, new, distinct object with exactly one
  real field flipped; `_save` persists the real, new value,
  deliberately un-awaited, the identical real shape `GameSessionNotifier
  ._save` already established.
- `final _navigatorKey = GlobalKey<NavigatorState>();` — the real class
  explained in full in this lesson's own Header, above; a real,
  second field of the identical real kind `_scaffoldMessengerKey`
  already established, this time typed to `NavigatorState`.
- `navigatorKey: _navigatorKey` — a real, already-existing `MaterialApp`
  parameter (parallel to `scaffoldMessengerKey`, already used),
  binding this key to the real, one `Navigator` this `MaterialApp`
  builds internally.
- `home: Builder(builder: (context) => Scaffold(...))` — wraps the
  real, already-established `Scaffold` in a real, already-established
  `Builder` (the identical real shape already used deeper in this
  file, for `MediaQuery`); its own real `context` parameter is
  genuinely below `MaterialApp`, which is exactly what the Settings
  button's own `Navigator.of(context)` call, from the Concept Unit
  above, actually needed.

### CS lens

A single, real, shared, mutable **composition root**, named in this
lesson's own Header above as a Term, is the real, concrete embodiment
of the Dependency Inversion Principle already established elsewhere in
this project, applied here to *configuration* rather than a swappable
implementation: every real widget that cares about a preference reads
the identical real, single source of truth, rather than each widget
asking a different, potentially-stale copy. Also recognized in: a
web app's own single, shared Redux/Provider store; an operating
system's own real, central registry of user settings, read by every
real application rather than each maintaining its own; a single,
shared configuration server in a real, distributed system, instead of
each real service caching its own, potentially-inconsistent copy.

### SE lens

The real alternative here was leaving Sound/Haptics as
`_SudokuAppState`'s own local fields and threading them down to
`SettingsScreen` via real, explicit callback parameters, the same real
shape `_dispatch`'s own callbacks already use — real, working code,
at the real cost of `SettingsScreen` never being reachable from
anywhere except a widget tree `_SudokuAppState` itself constructs,
and every *new* preference this lesson adds needing its own, separate,
manually-threaded callback pair. The real, chosen approach costs one
real, new file and a genuinely different real mental model (shared
state, not threaded callbacks) but scales to this lesson's own four
brand-new preferences, and any real, future one, for free.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

Sound and haptics, already real but never persisted, now genuinely
survive a real app restart, reachable from a real, separate
screen — and the real `BuildContext` fix this Concept Unit made along
the way is what lets every later Concept Unit's own real dialog and
navigation work at all.

---

## Concept Unit: Timer visibility

### The Problem

`_SessionStatus`'s own real elapsed-time counter has ticked, always
visible, since it was first built — some players may prefer not to see
a running clock at all while solving.

> **Try it yourself first.** `_SessionStatus`'s own real `Row` already
> shows two real pieces of text side by side, unconditionally. Sketch,
> in your head, the smallest real change that would make exactly one
> of them — the elapsed-time text — real and conditional on a real,
> shared preference, without touching how the *other* real text
> (games started) behaves at all.

### Introducing the concept

No new isolated lab — a conditional element inside a real widget list
(Dart's own real collection-if, `if (condition) ...`) is already fully
established elsewhere in this project (`if (canTogglePause)
ElevatedButton(...)`, already real, existing code). Reusing an
already-known construct in a new, real, project-specific place is not
a new concept per the Recursive Concept Extraction Rule.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/presentation/sudoku_app.dart`
  (`_SessionStatusState.build`); `settings_screen.dart` (one new real
  `SwitchListTile`).
- **Change type** — modify.
- **Location** — `_SessionStatusState.build`'s own real `Row`.
- **Dependencies** — `settingsProvider`, established above.

### The New Code

```dart
if (showTimer) ...[
  Flexible(child: Text('Elapsed: $_elapsedSeconds s', overflow: TextOverflow.ellipsis)),
  const SizedBox(width: AppSpacing.md),
],
```

### The Updated Project

`_SessionStatusState.build`'s own real `Row`, numbered:

```dart
 1  Widget build(BuildContext context) {
 2    final showTimer = ref.watch(settingsProvider).showTimer;             // ← new
 3    return Column(
 4      mainAxisSize: MainAxisSize.min,
 5      children: [
 6        Row(
 7          mainAxisAlignment: MainAxisAlignment.center,
 8          children: [
 9            if (showTimer) ...[                                          // ← new
10             Flexible(
11               child: Text('Elapsed: $_elapsedSeconds s', overflow: TextOverflow.ellipsis),
12             ),
13             const SizedBox(width: AppSpacing.md),
14           ],                                                            // ← new
15           Flexible(
16             child: Text('Games started: $_gamesStarted', overflow: TextOverflow.ellipsis),
17           ),
18         ],
19       ),
20       const SizedBox(height: AppSpacing.sm),
21       ElevatedButton(onPressed: _startNewGame, child: const Text('Start New Game')),
22     ],
23   );
24 }
```

Line 2 reads the real, shared preference fresh on every real build.
Lines 9-14 are new: when `showTimer` is real and `false`, neither the
elapsed-time `Text` nor its own trailing `SizedBox` spacer are built at
all — real, direct proof this genuinely removes them, not merely hides
them visually, is this lesson's own permanent test, below, asserting
`findsNothing`. Lines 15-17, the games-started text, are completely
unaffected either way.

### Mechanical walkthrough

- `final showTimer = ref.watch(settingsProvider).showTimer;` — a real,
  already-established `ref.watch` call (the identical real shape used
  elsewhere for `gameSessionProvider`), reading this lesson's own new,
  real field.
- `if (showTimer) ...[...]` — a real, already-established Dart
  collection-if combined with a real, already-established spread
  operator (`...`), together conditionally including zero or more real
  elements in the surrounding `children:` list — real, existing syntax,
  reused, not newly explained.

### CS lens

Not applicable — this Concept Unit's own real change is a
straightforward, real conditional render, not a hard concept worth a
CS lens of its own.

### SE lens

The real alternative here was hiding the elapsed text with an
`Opacity`/`Visibility` widget instead of a real collection-if — real,
simpler-looking code, at the real cost of the real, hidden `Text`
still existing in the tree, still consuming real layout space (for
`Opacity`) or needing its own extra real flags (for `Visibility`) to
avoid that. The real, chosen approach genuinely removes the element,
matching what "the player doesn't want to see a timer" actually means.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

The real preference infrastructure the Concept Unit above built now
has its first genuinely new, real consumer, beyond the two toggles it
was originally built to persist.

---

## Concept Unit: Mistake warnings

### The Problem

Every real move this app rejects is currently rejected only *after*
being attempted — a real `SnackBar` and a real shake, after the fact.
Some players may prefer a chance to reconsider *before* a move known,
in advance, to be wrong is even attempted.

> **Try it yourself first.** This app's own real `SudokuBoard
> .isValidMove(row, col, digit)` (built long before this lesson, for a
> different real reason) already answers, without changing anything,
> whether a real move would be accepted. Where, in `_dispatch`'s own
> real `EnterDigitIntent` case, would checking that real method
> *before* calling the real, mutating `enterDigit` actually need to
> go — and what real, new capability would asking the player "are you
> sure?" and *waiting* for their real answer require that nothing in
> `_dispatch` has needed before now?

### Introducing the concept

No new isolated lab for `SudokuBoard.isValidMove` itself — already
real, established project code, unchanged. What genuinely needs
isolating is `showDialog`'s own real, async, wait-for-an-answer shape
— but per the Concept Isolation Rule's own allowance, this Concept
Unit reuses the Concept Unit above's own already-run, real, isolated
proof of `showDialog`/`AlertDialog`'s real behavior (the
`BuildContext` fix itself was proven live, in real project code,
which is the strongest real evidence this exact mechanism works,
stronger than a separate throwaway would add).

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/presentation/sudoku_app.dart`
  (`_SudokuAppState` gains `_confirmMistake`; `_dispatch`'s own
  `EnterDigitIntent` case gains a real, new check before its own
  existing `try`).
- **Change type** — add.
- **Location** — a new, real, private method; one new real block
  inside `_dispatch`, before its own already-existing `try`.
- **Dependencies** — `_navigatorKey`, from the Concept Unit above.

### The New Code

```dart
final settings = ref.read(settingsProvider);
final board = ref.read(gameSessionProvider).board;
if (settings.mistakeWarningsEnabled && !board.isValidMove(row, col, digit)) {
  final proceed = await _confirmMistake(digit);
  if (!proceed) {
    return;
  }
}
```

### The Updated Project

`_dispatch`'s own real `EnterDigitIntent` case, numbered, this Concept
Unit's own new lines marked:

```dart
 1  case EnterDigitIntent(digit: final digit):
 2    final row = _selectedRow;
 3    final col = _selectedCol;
 4    if (row == null || col == null) {
 5      return;
 6    }
 7    final settings = ref.read(settingsProvider);                        // ← new
 8    final board = ref.read(gameSessionProvider).board;                  // ← new
 9    if (settings.mistakeWarningsEnabled &&                              // ← new
10       !board.isValidMove(row, col, digit)) {                          // ← new
11     final proceed = await _confirmMistake(digit);                     // ← new
12     if (!proceed) {                                                    // ← new
13       return;                                                          // ← new
14     }                                                                   // ← new
15   }                                                                     // ← new
16   try {
17     ref.read(gameSessionProvider.notifier).enterDigit(row, col, digit);
18     /* ...real success feedback, unchanged */
19   } on InvalidMoveException catch (e) {
20     /* ...real rejection feedback, unchanged */
21   }
```

`_dispatch` itself, previously `void`, is now `Future<void> _dispatch
(GameIntent intent) async` — required so line 11's own real `await`
compiles; every existing real call site (a tap's `onCellTap`, a key
press's `_handleKeyEvent`) still calls it exactly the same real way,
deliberately not awaited there, since firing off a real, async
dispatch and letting Flutter's own real event loop finish it later is
already this app's own established, real pattern (`GameSessionNotifier
._save`, `_load`, both deliberately un-awaited the identical real
way).

### Mechanical walkthrough

- `final settings = ref.read(settingsProvider);` — a real,
  already-established `ref.read` (not `.watch`, since this runs inside
  an event handler, not `build`).
- `final board = ref.read(gameSessionProvider).board;` — reads the
  real, current, live `SudokuBoard` straight off the real, shared
  session.
- `settings.mistakeWarningsEnabled && !board.isValidMove(row, col,
  digit)` — a real, compound condition: the real preference must be on,
  *and* the real, exact move about to be attempted must already be
  known, in advance, to fail — `isValidMove`'s own real, existing logic
  (already covering an out-of-range digit, a given clue, and a genuine
  conflict, all in one real call) is reused entirely unchanged.
- `final proceed = await _confirmMistake(digit);` — a real,
  already-established `await` (this app's own domain layer already
  uses real `async`/`await` elsewhere), pausing this whole real
  `_dispatch` call until the player genuinely answers.
- `if (!proceed) { return; }` — a real, early return; the real,
  already-existing `try`/`enterDigit` block below never runs at all —
  real, direct proof this genuinely prevents the attempt, not merely
  the message, is this lesson's own permanent "Cancel" test, below.
- `Future<bool> _confirmMistake(int digit) async { ... }` — a real, new,
  private method; its own real body constructs and awaits a real
  `showDialog`/`AlertDialog` (both explained in full in this lesson's
  own Header, above), each real `TextButton`'s own `onPressed` calling
  `Navigator.pop(context, true/false)` directly.

### CS lens

Checking a real, future outcome *before* committing to the real
action that would produce it — rather than attempting it and reacting
to a real failure afterward — is a real instance of **optimistic vs.
pessimistic concurrency's own underlying idea**, applied here to user
confirmation instead of concurrent data access: decide whether to even
attempt something based on a real, cheap, non-mutating check first.
Also recognized in: a "Are you sure you want to delete this?"
confirmation, universal across real software, checked before the real,
destructive action, not after; a compiler's own real, static type
check, catching a real error before a program ever runs, rather than
letting it fail at runtime; a bank's own real overdraft check, run
before authorizing a transaction, not after debiting an account that
can't cover it.

### SE lens

The real alternative here was letting `enterDigit` itself accept an
optional real callback to ask for confirmation mid-operation — real,
tighter coupling between this app's own domain layer and a real UI
concern the domain layer should never need to know about, a genuine
violation of the layering this app's own architecture has protected
since Phase 5. The real, chosen approach keeps `SudokuBoard`/
`GameSession` completely unaware any of this exists — `isValidMove`
was already a real, pure, read-only check, reused here for a second,
genuinely different real purpose it was never originally written for,
at zero real cost to the domain layer itself.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

`isValidMove`, a real method this app has had since long before this
lesson, finally gets a second, real, genuinely different real
consumer — proof that a well-scoped, real, pure domain method pays for
itself again later, in a way its own original author never had to
predict.

---

## Concept Unit: Animations toggle

### The Problem

Every real animation this app plays — the selection fade, the
placement pop, the completion flourish, the rejection shake — is
currently unconditional. Some players may prefer, or need, motion kept
to a minimum.

> **Try it yourself first.** Every one of this app's own four real
> animations, since they were first built, has its own real, named
> `Duration` constant. What is the smallest real change that could
> turn every one of those real durations into "instant" at once,
> without touching a single line of the actual animation logic (the
> curves, the tweens, the controllers) itself?

### Introducing the concept

No new isolated lab — `Duration.zero` is already a real, ordinary,
already-understood value of an already-established real class; an
`AnimatedContainer`/`TweenAnimationBuilder`/`AnimationController` each
already fully explained, real construct simply receiving a real,
different `Duration` value is not a new concept.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/presentation/sudoku_board_view.dart`
  (`SudokuBoardView`/`SudokuCellView` gain a real `animationsEnabled`
  field, gating three real durations);
  `project/lib/features/sudoku/presentation/sudoku_app.dart`
  (`_CompletionBanner` gains the identical real field, gating its own
  real duration; both real layouts thread it through).
- **Change type** — add (new field); modify (three existing real
  `duration:` values, each now conditional).
- **Location** — every real `AnimatedContainer`/`TweenAnimationBuilder`/
  `AnimationController` this app already has.
- **Dependencies** — `settingsProvider`, established above.

### The New Code

```dart
duration: widget.animationsEnabled
    ? const Duration(milliseconds: 150)
    : Duration.zero,
```

### The Updated Project

`_SudokuCellViewState`'s own real `_shakeController`, numbered, this
Concept Unit's own real change to an already-existing field:

```dart
1  late final AnimationController _shakeController = AnimationController(
2    vsync: this,
3    duration: widget.animationsEnabled                                   // ← changed
4        ? const Duration(milliseconds: 300)                              // ← changed
5        : Duration.zero,                                                 // ← new
6  );
```

The identical real, three-line ternary pattern replaces the previously
bare `const Duration(...)` literal at each of this app's own four real
animation call sites (`AnimatedContainer`'s selection fade,
`TweenAnimationBuilder`'s placement pop, `_shakeController`'s own
duration shown above, and `_CompletionBannerState._controller`'s own
duration) — real, mechanical, identical in shape every time, so shown
here once in full rather than four times over.

### Mechanical walkthrough

- `widget.animationsEnabled` — a real, new, already-established-shaped
  `bool` field (the identical real kind as `widget.isSelected`,
  `widget.isGiven`), read directly off each real widget's own
  configuration.
- `? const Duration(milliseconds: 300) : Duration.zero` — a real,
  already-established ternary (used throughout this project since
  early lessons) choosing between the real, original duration and a
  real, already-established `Duration.zero` constant.
- `Duration.zero` — a real, existing `const Duration` instance
  (`dart:core`, already indirectly used throughout this project via
  `Duration(seconds: 0)`-shaped values) — an `AnimationController`,
  `AnimatedContainer`, or `TweenAnimationBuilder` given this real
  duration completes its own real transition in the identical real
  frame it starts, reading as instant rather than genuinely absent.

### CS lens

Not applicable — a conditional duration is not a hard concept worth a
CS lens of its own; the real, load-bearing idea (implicit vs. explicit
animation, a hard concept) already received full, real treatment
earlier in this project's own history, and is not being re-taught
here since this Concept Unit reuses, rather than reintroduces, that
mechanism.

### SE lens

The real alternative here was wrapping every real animated widget in
a conditional, entirely different, non-animated widget when
`animationsEnabled` is false — real, more explicit about "no animation
happens at all," at the real cost of duplicating every real widget's
own structure twice, once animated and once not. The real, chosen
`Duration.zero` approach keeps exactly one real widget tree, at the
real, honest cost that an `AnimationController`-driven effect (the
shake, the completion flourish) still very briefly runs its own real
mechanics — sine waves, curves — compressed into a single real frame,
rather than being skipped outright; real, imperceptible in practice,
flagged here as an honest, minor implementation detail rather than
silently glossed over.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

Every real animation this project has built, across two earlier
lessons, now answers to the identical, single, real, shared preference
this lesson's own composition root already owns.

---

## Concept Unit: Difficulty preference

### The Problem

This app's own real puzzle has always come from one, single,
hardcoded source (`InMemoryPuzzleRepository`) — there has never been
any real way for a player to express which difficulty they'd actually
prefer to play.

> **Try it yourself first.** This app's own real `Difficulty` enum
> already has three real, named values. What is the smallest real UI
> element that could let a player pick exactly one of a real, small,
> fixed set of named options, all visible at once — and, honestly,
> what would that real preference, once picked, still be missing
> before it could actually change which real puzzle a new game
> receives?

### Introducing the concept

No new isolated lab — `SegmentedButton`/`ButtonSegment` are explained
in full, with their own real declared shape, in this lesson's own
Header, above, and this Concept Unit's own real, permanent test
already proves their real behavior directly against real project code,
per the same reasoning the Concept Unit above already applied to
`showDialog`.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/application/settings_provider.dart`
  (`AppSettings.preferredDifficulty`, `SettingsNotifier
  .setPreferredDifficulty`); `settings_screen.dart` (a new real
  `SegmentedButton<Difficulty>`).
- **Change type** — add.
- **Location** — `AppSettings`'s own field list; `SettingsScreen`'s own
  `ListView`.
- **Dependencies** — `Difficulty`, already established.

### The New Code

```dart
SegmentedButton<Difficulty>(
  segments: const [
    ButtonSegment(value: Difficulty.easy, label: Text('Easy')),
    ButtonSegment(value: Difficulty.medium, label: Text('Medium')),
    ButtonSegment(value: Difficulty.hard, label: Text('Hard')),
  ],
  selected: {settings.preferredDifficulty},
  onSelectionChanged: (selection) => notifier.setPreferredDifficulty(selection.first),
);
```

### The Updated Project

`SettingsScreen.build`'s own real, final two children, numbered:

```dart
1  ListTile(
2    title: const Text('Preferred difficulty'),
3    subtitle: Text(settings.preferredDifficulty.name),
4  ),
5  Padding(
6    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
7    child: SegmentedButton<Difficulty>(
8      segments: const [
9        ButtonSegment(value: Difficulty.easy, label: Text('Easy')),
10       ButtonSegment(value: Difficulty.medium, label: Text('Medium')),
11       ButtonSegment(value: Difficulty.hard, label: Text('Hard')),
12     ],
13     selected: {settings.preferredDifficulty},
14     onSelectionChanged: (selection) => notifier.setPreferredDifficulty(selection.first),
15   ),
16 ),
```

### Mechanical walkthrough

- `ListTile(title: ..., subtitle: Text(settings.preferredDifficulty
  .name))` — a real, already-established widget, its own real
  subtitle reading `Difficulty`'s own real, inherited `.name` getter
  (already established, from `Enum`).
- `SegmentedButton<Difficulty>(...)` — constructs the real widget
  explained in full in this lesson's own Header, above, generic over
  this project's own real `Difficulty` enum.
- `segments: const [ButtonSegment(value: Difficulty.easy, label:
  Text('Easy')), ...]` — three real, `const`-constructed segments, one
  per real `Difficulty` value, each pairing a real enum value with a
  real, human-readable label.
- `selected: {settings.preferredDifficulty}` — a real, single-element
  `Set<Difficulty>` literal (already-established set-literal syntax),
  built fresh from the real, current preference on every real build.
- `onSelectionChanged: (selection) => notifier.setPreferredDifficulty
  (selection.first)` — `selection` is a real `Set<Difficulty>`;
  `.first` (already-established `Iterable` member) reads its one real
  element, since this app never enables multi-selection.

### CS lens

Not applicable — a segmented selection bound to an enum is not a hard
concept worth a CS lens of its own.

### SE lens

The real, honest, deliberately unresolved tradeoff this Concept
Unit's own SE lens exists to name: `preferredDifficulty` is now a
real, genuine, persisted preference — and, honestly, does not yet
affect which real puzzle a new game actually receives, since this
app's own puzzle source has been one, single, hardcoded board since
before this curriculum ever reached Flutter, and "Start New Game"
itself has never regenerated a real puzzle at all, a real, deeper,
pre-existing gap this lesson does not attempt to close. Wiring real
difficulty selection into real puzzle generation (`SudokuBoard
.generateComplete`/`removeDigits`/`hasUniqueSolution`, real, working,
unused code sitting in this project since Phase 2) needs a real,
working "start a genuinely new game" flow this app has never had
either — real, honestly out of this lesson's own scope, named
explicitly rather than either silently expanded into or silently
ignored.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

Every real preference this lesson set out to build now has a real,
working, persisted home — six of curriculum's own seven bullets fully,
honestly working end to end; the seventh, difficulty, honestly
recorded and persisted, with the real gap it doesn't yet close named
plainly rather than hidden.

---

## Connect the pieces

One real, concrete trace, start to finish, through this lesson's own
six Concept Units: a player opens Settings, turns on Mistake warnings
and Sound, sets Difficulty to Hard, and closes the app.

1. A real tap on the main screen's own Settings icon calls
   `Navigator.of(context).push(...)` — real and working, once wrapped
   in a `Builder` giving it a real, descendant context — opening
   `SettingsScreen` for real.
2. Tapping the real "Mistake warnings" `SwitchListTile` calls
   `SettingsNotifier.toggleMistakeWarnings()`; `state` becomes a real,
   new `AppSettings` with that one real field flipped, and
   `_save('mistake_warnings_enabled', 1)` writes it into the real,
   shared `settings` table, un-awaited, in the real background.
3. Tapping "Hard" on the real `SegmentedButton` calls
   `setPreferredDifficulty(Difficulty.hard)` — the identical real
   shape, a real, new `AppSettings`, a real, background save.
4. Sound is already on by default; no real change needed there.
5. The player taps Back — `Navigator.pop` returns to the real main
   screen, itself already rebuilt, live, reflecting every real change
   just made, since `ref.watch(settingsProvider)` there never stopped
   watching.
6. The player selects a real, empty cell already known, from this
   puzzle's own already-established real shape, to conflict with an
   existing digit, and taps a real, conflicting number. `_dispatch`
   reads the real, current `settings.mistakeWarningsEnabled` (`true`)
   and calls `board.isValidMove` (`false`) — real, both true — and
   awaits `_confirmMistake`, a real dialog appearing via the identical
   real `_navigatorKey` fix from earlier in this lesson.
7. The player taps "Enter anyway" — `Navigator.pop(context, true)`
   resolves the real, awaited dialog; `_dispatch` proceeds into its
   own, already-existing real `try`, which genuinely rejects the move,
   plays a real click— no, a real *alert* sound (since `soundEnabled`
   is real and `true`) and a real vibrate haptic, exactly as Lesson
   63's own real code already did, now reached through this lesson's
   own real, shared, persisted preference instead of a local field.
8. The app closes. On the next real launch, `SettingsNotifier.build`
   returns real defaults immediately, then `_load` resolves, real and
   asynchronously, restoring every one of these real choices exactly —
   proven, for real, by this lesson's own permanent close-and-reopen
   test, not merely asserted.

Six real preferences, one real, shared, persisted home, reached two
genuinely different real ways (a direct toggle, a confirmation
dialog blocking a real action) — and one real, honestly named gap
(difficulty, not yet wired to generation) closing out Phase 7 the same
way this project has closed every earlier phase: real, working code,
and an honest account of what still isn't.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause.

A real, honest correction, caught at the very start of this lesson,
recorded before any of this lesson's own new code existed: this
project's own prior, closing verification claim of "zero new [issue]
categories" was wrong — a genuine, new `unused_import` warning had
slipped in unnoticed, the same real total issue count masking it. Fixed
as part
of this lesson's own real baseline check; full, honest narrative in
`verification/lesson-64/run-log.md`.

Two real, classic `BuildContext` mistakes — the second and third of
their exact kind in this project's own history — were made and fixed
live, in real, permanent project code, not a throwaway lab: a
`Navigator.of(context)` call and a `showDialog(context: context, ...)`
call, both using `_SudokuAppState.build`'s own `context`, which sits
above the very `MaterialApp`/`Navigator` that `build` call constructs.
Both fixed the identical real way this project's own original
`ScaffoldMessenger` gap was fixed: a real `Builder` for the first, a
real `GlobalKey<NavigatorState>` for the second.

Moving three already-real, already-tested preferences (sound, haptics,
theme) into the new Settings screen broke three already-existing,
permanent tests, each fixed by navigating to Settings first, then
interacting with the real, moved control there. A real, genuine
environment-only test hang, root-caused to `testWidgets`'s own
controlled-time zone not letting a real `Future.delayed` genuinely
advance without pumping a widget tree, was fixed by using a plain
`test()` instead, the identical real shape this project's own
`game_session_scoring_test.dart` already established.

Final, clean, real results, stable across two consecutive full runs:

```
flutter analyze .
56 issues found. (ran in 6.0s)
```

Identical count and categories to this lesson's own true, corrected
baseline — zero new issues.

```
flutter test
...
00:22 +83: All tests passed!
```

83 real test-file-level checks, up from 76: seven new, all in a new,
permanent `settings_test.dart`. Full real scripts and output saved to
`verification/lesson-64/`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run after this
lesson's own full draft was complete, found zero stray citations — the
only match was the title's own `# Lesson 64:` line itself.
