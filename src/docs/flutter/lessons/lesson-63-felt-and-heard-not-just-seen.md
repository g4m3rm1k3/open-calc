# Lesson 63: Felt and Heard, Not Just Seen

**What you will build.** A real sound and a real, distinct physical
vibration for three of this app's own already-existing real moments —
a digit accepted, a move rejected, a puzzle solved — reaching the
real, physical device this app runs on through the identical real
platform channel Flutter itself uses internally, and two new, real,
local preference toggles deciding whether either one plays at all. The
transferable problem: sight is not the only real sense a UI can speak
to, and for a specific, real, physical moment — a piece landing, a
mistake happening — a sound or a vibration can communicate it faster,
and more viscerally, than anything visual can, especially for a player
not looking directly at the screen at that exact instant.

**What you need to know first.** `_dispatch` and this app's own real
`GameIntent` pipeline — every new real feedback call in this lesson
attaches to an already-existing real branch of it, not a new one.
`_CompletionBanner`'s own real `didUpdateWidget`, and the real,
already-established fact it depends on: this method fires on every
real rebuild that reuses the same `Element`, so detecting a genuine
`false`-to-`true` transition, not merely a value being `true`, is this
app's own explicit responsibility. Treating a function itself as a
real, storable, passable value, not just something to call immediately
— already used elsewhere in this project for a callback.

**Terms used in this lesson**

- **Platform channel** — Flutter's real, general mechanism for a Dart
  call to reach real, native, per-platform code (Windows, Android,
  iOS, and so on) and back, by name, over a real, asynchronous message
  passing bridge. It exists because Dart code, on its own, has no real
  way to trigger a native OS capability — playing a system sound,
  triggering a vibration motor — directly; every such capability has
  to cross this real bridge.

**Objects and methods used**

- **`SystemSound` / `SystemSoundType`**
  - *What it is:* `SystemSound` is a real, built-in Flutter class
    exposing the host platform's own small library of short, built-in
    sounds; `SystemSoundType` is a real, small enum naming which one.
  - *Implementation:* its real, complete body, read fresh this session
    from
    `C:\flutter\packages\flutter\lib\src\services\system_sound.dart`:
    ```dart
    enum SystemSoundType { click, tick, alert }

    abstract final class SystemSound {
      static Future<void> play(SystemSoundType type) async {
        await SystemChannels.platform.invokeMethod<void>('SystemSound.play', type.toString());
      }
    }
    ```
  - *Its use:* `SystemSoundType.click` on a real, accepted move;
    `SystemSoundType.alert` on a real, rejected one.
  - *Type:* `SystemSound` is an `abstract final class` — real Dart
    syntax (already established) for a class that can never be
    instantiated or extended, existing purely to hold real, `static`
    members; `SystemSoundType` is a real enum.
  - *Responsibility:* ask the host platform to play one of a real,
    small, fixed set of short system sounds — nothing about *whether*
    to play it, or how loud; that decision belongs entirely to this
    app's own calling code.
  - *Depends on:* the real, underlying platform channel, explained in
    this lesson's own Header, above, and whatever real sounds the host
    platform itself actually defines for each real `SystemSoundType`
    value — real, honestly platform-dependent, per its own real,
    quoted doc comments (`alert` is real and audible on desktop
    platforms; ignored on mobile and web).
  - *Connects to:* called from `_SudokuAppState._playSound`, below.
  - *Shape:* Presentation-layer, reached only from `_dispatch`.
- **`HapticFeedback`**
  - *What it is:* a real, built-in Flutter class exposing the host
    device's own real, physical vibration/haptic hardware, through a
    real, small, named set of distinct effects.
  - *Implementation:* its real, relevant members, read fresh this
    session from
    `C:\flutter\packages\flutter\lib\src\services\haptic_feedback.dart`:
    ```dart
    abstract final class HapticFeedback {
      static Future<void> vibrate() async {
        await SystemChannels.platform.invokeMethod<void>('HapticFeedback.vibrate');
      }
      static Future<void> selectionClick() async {
        await SystemChannels.platform.invokeMethod<void>(
          'HapticFeedback.vibrate', 'HapticFeedbackType.selectionClick');
      }
      static Future<void> mediumImpact() async { /* the identical real shape, 'HapticFeedbackType.mediumImpact' */ }
      static Future<void> successNotification() async { /* the identical real shape, 'HapticFeedbackType.successNotification' */ }
    }
    ```
    Every real, named effect funnels through the identical real method
    name (`'HapticFeedback.vibrate'`) — only `vibrate()` itself passes
    no second argument; every other real, named effect passes a real,
    distinct string naming which one.
  - *Its use:* `.selectionClick()` on a real cell selection,
    `.mediumImpact()` on a real, accepted move, `.vibrate()` on a real,
    rejected one, `.successNotification()` on a genuine, real puzzle
    completion.
  - *Type:* an `abstract final class` holding real, `static` methods —
    the identical real shape as `SystemSound`, above.
  - *Responsibility:* ask the host device to produce one of a real,
    small set of distinct physical sensations — again, deciding
    *whether* to ask at all is entirely this app's own calling code's
    real job.
  - *Depends on:* the real platform channel; real, physical haptic
    hardware, honestly absent or a no-op on a platform without any
    (this development machine's own desktop environment included, per
    each method's own real, quoted doc comments).
  - *Connects to:* called from `_SudokuAppState._playHaptic` and from
    `_CompletionBannerState.didUpdateWidget`, below.
  - *Shape:* Presentation-layer.
- **`SystemChannels.platform` / `MethodChannel` / `invokeMethod`**
  - *What it is:* `SystemChannels.platform` is a real, already-existing,
    shared `MethodChannel` instance Flutter itself constructs once;
    `MethodChannel` is the real, general class implementing the
    platform channel mechanism explained in this lesson's own Header,
    above; `invokeMethod` is its real instance method actually sending
    one real, named call across.
  - *Implementation:* `Future<T?> invokeMethod<T>(String method,
    [dynamic arguments])`, read fresh this session from
    `C:\flutter\packages\flutter\lib\src\services\platform_channel.dart`
    — real and generic: `T` is whatever real type the *response*
    should be decoded as, not the call's own arguments.
  - *Its use:* the real, single, shared mechanism both `SystemSound
    .play` and every real `HapticFeedback` method already call
    internally — this lesson's own code never calls it directly.
  - *Type:* `SystemChannels.platform` is a real, `static`,
    already-constructed `MethodChannel` instance; `invokeMethod` is a
    real, generic instance method on it.
  - *Responsibility:* serialize a real method name and real arguments,
    send them across the real platform channel bridge, and return the
    real, decoded response, asynchronously.
  - *Depends on:* a real, native platform-side handler actually
    registered for whatever channel name this is (`'flutter/platform'`,
    real and already wired by the engine itself for this specific,
    shared channel).
  - *Connects to:* this lesson's own demystification of exactly how
    `SystemSound`/`HapticFeedback` actually reach a real device —
    never an unexamined black box.
  - *Shape:* framework-level plumbing.
- **`TestDefaultBinaryMessengerBinding` / `setMockMethodCallHandler` / `MethodCall` / `isMethodCall`**
  - *What it is:* a real, `flutter_test`-only mechanism for
    intercepting every real call a widget under test sends across a
    given platform channel, without any real, native platform ever
    actually receiving it — `MethodCall` is the real, plain object
    describing one such intercepted call; `isMethodCall` is a real
    `Matcher` comparing one against an expected real method name and
    real arguments.
  - *Implementation:* `TestDefaultBinaryMessengerBinding.instance
    .defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels
    .platform, (MethodCall call) async { ... })`, and `Matcher
    isMethodCall(String method, {required dynamic arguments})` — both
    real, read fresh this session from Flutter's own real, installed
    SDK test suite
    (`C:\flutter\packages\flutter\test\services\haptic_feedback_test.dart`),
    which uses this exact, real, current pattern to test
    `HapticFeedback` itself.
  - *Its use:* every real, permanent test in this lesson's own new
    `sound_and_haptics_test.dart` installs a real handler recording
    every real call into a plain `List<MethodCall>`, then asserts
    against it — this lesson's own real, repeatable way to prove a
    real sound or haptic call genuinely happened, without needing real
    hardware.
  - *Type:* a real, singleton test binding; a real instance method on
    the real `BinaryMessenger` it exposes; a real, plain data class;
    a real, top-level `Matcher`-returning function.
  - *Responsibility:* substitute a real, native platform response with
    a real, test-controlled one, and record every real, intercepted
    call for later inspection.
  - *Depends on:* `TestWidgetsFlutterBinding.ensureInitialized()`
    already having run (implicit, already true throughout this
    project's own `flutter_test`-based suite).
  - *Connects to:* used throughout this lesson's own isolated labs and
    its new, permanent test file, below.
  - *Shape:* test-only tooling — none of this appears anywhere in this
    app's own real, shipped `lib/` code.

## Concept Unit: Sound effects

### The Problem

A digit landing in a cell, or being rejected, is currently a
completely silent event — every real feedback this app gives is
visual (a color, a shake, a pop). A player glancing away for even a
moment, or simply not watching the exact cell they just tapped, gets
no real signal at all that anything happened.

> **Try it yourself first.** This app already distinguishes an
> accepted move from a rejected one visually — a pop-in versus a
> shake and a `SnackBar`. If you wanted the *identical* real
> distinction to also exist as sound, without writing or bundling any
> actual audio file, what real, existing capability might a mobile or
> desktop operating system already expose for exactly this kind of
> short, generic "something happened" cue — the same real category of
> sound a picker, a keyboard, or a system alert already makes on your
> own real device?

### Introducing the concept

A minimal, throwaway lab proves the real mechanism, and what it
actually sends, before this lesson's own project code relies on it:

```dart
final log = <MethodCall>[];
TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
  SystemChannels.platform,
  (call) async {
    log.add(call);
    return null;
  },
);

await SystemSound.play(SystemSoundType.click);
```

Run for real (`verification/lesson-63/sound_haptics_labs_test.dart`,
Lab 1) — because exactly what real method name and real argument a
call like this actually sends across the real platform channel is not
something to state from confidence alone:

```
log.single == isMethodCall('SystemSound.play', arguments: 'SystemSoundType.click')
```

Real, direct proof: `SystemSound.play` genuinely sends one real method
call, named `'SystemSound.play'`, with the real `SystemSoundType`'s own
`toString()` as its only real argument — exactly what this lesson's
own Header already quoted from the real, installed source, now
confirmed as real, observable behavior, not just read code.

### Discard the throwaway example

This lab's own mock handler and lone `SystemSound.play` call are
deleted here. What carries forward: `SystemSound.play(SystemSoundType
.click)`/`.alert` are real, correct, minimal calls this app's own code
can now trust and reuse directly.

### Project Change

- **Reference Source** — No reference counterpart; a from-scratch
  addition.
- **Files affected** —
  `project/lib/features/sudoku/presentation/sudoku_app.dart`
  (`_SudokuAppState` gains `_playSound`; `_dispatch`'s own
  `EnterDigitIntent` case calls it on both its real success and real
  rejection paths).
- **Change type** — add.
- **Location** — a new, real, private method beside `_dispatch`; two
  new real call sites inside `_dispatch` itself.
- **Dependencies** — `package:flutter/services.dart`, already imported
  in this file.

### The New Code

```dart
void _playSound(SystemSoundType type) {
  SystemSound.play(type);
}
```

### The Updated Project

`_dispatch`'s own real `EnterDigitIntent` case, this Concept Unit's
own two new lines marked, numbered:

```dart
 1  case EnterDigitIntent(digit: final digit):
 2    final row = _selectedRow;
 3    final col = _selectedCol;
 4    if (row == null || col == null) {
 5      return;
 6    }
 7    try {
 8      ref.read(gameSessionProvider.notifier).enterDigit(row, col, digit);
 9      _playSound(SystemSoundType.click);                                 // ← new
10    } on InvalidMoveException catch (e) {
11      _scaffoldMessengerKey.currentState?.showSnackBar(
12        SnackBar(content: Text(e.message)),
13      );
14      _playSound(SystemSoundType.alert);                                 // ← new
15      setState(() => _shakeTrigger++);
16    } on InvalidStateTransitionException catch (e) {
17      _scaffoldMessengerKey.currentState?.showSnackBar(
18        SnackBar(content: Text(e.message)),
19      );
20      _playSound(SystemSoundType.alert);                                 // ← new
21      setState(() => _shakeTrigger++);
22    }
```

Lines 1-8 and 10-13, 16-19 are entirely unchanged — the real move
attempt, and the real `SnackBar`/shake feedback already built earlier
in this project, both keep working exactly as before. Lines 9, 14, and
20 are new: a real sound now plays alongside every one of these three
already-real outcomes.

### Mechanical walkthrough

- `void _playSound(SystemSoundType type)` — a real, new, private
  method (already an established shape in this class, e.g.
  `_cycleThemeMode`), taking one real `SystemSoundType` parameter.
- `SystemSound.play(type)` — the real, static method explained in full
  in this lesson's own Header, above.
- `_playSound(SystemSoundType.click)` — called the instant
  `enterDigit` returns *without* throwing, i.e., a real, accepted
  move.
- `_playSound(SystemSoundType.alert)` — called inside both real
  `catch` blocks, i.e., any real, rejected move, regardless of which
  of the two real exception types was actually thrown.

### CS lens

Reusing the host platform's own real, built-in sound library, rather
than bundling and playing a custom audio asset, is a real instance of
**relying on a platform affordance instead of reinventing it** — not a
named CS pattern on its own, but the same real discipline this
lesson's own Contrast-adjacent research already showed with
`Color.computeLuminance()`. Also recognized in: a web form using the
browser's own real, built-in validation-error sound rather than a
custom one; a text editor reusing the OS's own real "bell" sound for
an invalid keystroke instead of shipping its own.

### SE lens

The real alternative here was a dedicated audio package (bundling real
`.wav`/`.mp3` assets, adding a real, new third-party dependency) —
real, more control over the exact sound, at the real cost of a real,
new dependency, real asset files to ship, and real, per-platform audio
session management this app doesn't otherwise need. The real,
honest cost of the chosen approach: `SystemSoundType` only offers
three real, generic sounds, and `alert` itself is honestly, real and
platform-dependent — silently ignored on mobile and web, per its own
real, quoted doc comment — a real limitation this app accepts rather
than works around, since a generic "something happened" cue was always
the actual real goal, not a specific, branded sound.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

Every real move this app already recognized — accepted, rejected — now
has a real, audible signature to match its already-real visual one.

---

## Concept Unit: Haptic feedback

### The Problem

The Concept Unit above added sound; a player in a real, quiet setting,
or simply not near a real speaker, still gets nothing extra beyond
what was already there. A real, physical vibration reaches a player a
sound cannot.

> **Try it yourself first.** This app now has real sound for two real
> outcomes (accepted, rejected) — but this lesson's own opening
> problem also named a *third*, real, distinct moment worth a physical
> cue: selecting a cell at all, before any digit is even entered.
> Should selecting a cell get the identical real feedback strength as
> placing a digit, or something deliberately lighter? What real,
> physical difference would make sense to a person feeling it, not
> just hearing about it?

### Introducing the concept

A minimal, throwaway lab proves that every real, named `HapticFeedback`
effect is, underneath, the identical real method call, distinguished
only by a real argument:

```dart
await HapticFeedback.vibrate();
await HapticFeedback.mediumImpact();
```

Run for real (Lab 2, same file) — because assuming each real,
differently-named method must send a differently-named real platform
call, rather than checking, is exactly the kind of assumption this
lesson's own Verification Rule doesn't extend:

```
log[0] == isMethodCall('HapticFeedback.vibrate', arguments: null)
log[1] == isMethodCall('HapticFeedback.vibrate', arguments: 'HapticFeedbackType.mediumImpact')
```

Both real calls share the identical real method name; only the real,
second argument differs. A second, small, real lab confirms one more
fact this Concept Unit's own next step depends on: a real, first-class
function value, passed by name (`HapticFeedback.selectionClick`, with
no `()`), can be stored, conditionally called later, and produces the
identical real platform call as calling it directly would have:

```dart
Future<void> playIfEnabled(bool enabled, Future<void> Function() effect) async {
  if (enabled) await effect();
}
await playIfEnabled(true, HapticFeedback.selectionClick);
await playIfEnabled(false, HapticFeedback.selectionClick);
```

Real, run proof (Lab 3): exactly one real call was recorded — the
`enabled: false` call genuinely never reached the real platform
channel at all.

### Discard the throwaway example

Both labs' own real handlers and calls are deleted here. What carries
forward: every named `HapticFeedback` method is safe to call directly
by name, and a real, `bool`-gated wrapper around a passed-in effect is
a real, correct way to make that call conditional.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/presentation/sudoku_app.dart`
  (`_SudokuAppState` gains `_playHaptic`; three new real call sites —
  `SelectCellIntent`, and alongside each of `_playSound`'s own three
  real call sites); `_CompletionBanner`/`_CompletionBannerState` gain a
  new, real `hapticsEnabled` field, threaded in from both real layouts.
- **Change type** — add.
- **Location** — a new, real, private method beside `_playSound`; new
  call sites inside `_dispatch` and inside `_CompletionBannerState
  .didUpdateWidget`.
- **Dependencies** — none beyond the Flutter SDK.

### The New Code

```dart
void _playHaptic(Future<void> Function() effect) {
  effect();
}
```

### The Updated Project

`_dispatch`'s own real `SelectCellIntent` case, numbered:

```dart
1  case SelectCellIntent(row: final row, col: final col):
2    _playHaptic(HapticFeedback.selectionClick);            // ← new
3    setState(() {
4      _selectedRow = row;
5      _selectedCol = col;
6    });
```

`_CompletionBannerState.didUpdateWidget`, this Concept Unit's own real
addition to already-existing code from earlier in this project,
numbered:

```dart
1  void didUpdateWidget(_CompletionBanner oldWidget) {
2    super.didUpdateWidget(oldWidget);
3    if (!oldWidget.visible && widget.visible) {
4      _controller.forward(from: 0);
5      if (widget.hapticsEnabled) {                          // ← new
6        HapticFeedback.successNotification();                // ← new
7      }                                                       // ← new
8    }
9  }
```

Line 4, the real, already-existing animation trigger from earlier in
this project, is untouched; lines 5-7 are new, reached only inside the
identical real guard that already protects line 4 — a genuine game
completion, not merely a rebuild where `visible` happened to already
be `true`.

### Mechanical walkthrough

- `void _playHaptic(Future<void> Function() effect)` — a real, new,
  private method whose own parameter is itself a real function type
  (`Future<void> Function()`, already established elsewhere in this
  project for callbacks) — not a value to compute, but a real,
  deferred action to run.
- `effect()` — calls whatever real function was passed in; this
  method's entire real job, for now, is simply forwarding the call —
  its own real reason to exist is the next Concept Unit's own real
  gating logic, added here without changing any of *this* Concept
  Unit's own already-written call sites.
- `_playHaptic(HapticFeedback.selectionClick)` — passes the real,
  static method itself, by name, as this lesson's own isolated lab
  already proved works correctly.
- `if (widget.hapticsEnabled) { HapticFeedback.successNotification();
  }` — a real, direct conditional call (not yet routed through
  `_playHaptic`, since `_CompletionBannerState` is a separate real
  class from `_SudokuAppState` and only receives the real, current
  preference value, not the gating method itself) — `widget
  .hapticsEnabled` is a new, real field this Concept Unit adds to
  `_CompletionBanner`, threaded in from `_SudokuAppState.build`
  exactly the same real way `shakeTrigger` already reaches
  `SudokuBoardView`.

### CS lens

Passing `HapticFeedback.selectionClick` itself, rather than a wrapping
`() => HapticFeedback.selectionClick()`, is a real, direct use of
**functions as first-class values** — a hard concept, already
established elsewhere in this project: a named function, referenced
without calling it, is itself a real, storable, passable value with
exactly the same real shape (`Future<void> Function()`) an anonymous
one would have. Also recognized in: passing a comparator function
directly into a real sort call; a UI framework's own `onPressed:
myHandler` (a bare, real reference, not `onPressed: () =>
myHandler()`); a real event system registering a named listener
function by reference.

### SE lens

The real alternative here was giving each of the three feedback
moments — selection, placement, rejection — its own separate, direct
`if (_hapticsEnabled) HapticFeedback.xxx();` inline, with no shared
`_playHaptic` method at all — real, marginally less code right now, at
the real cost of the gating condition itself being repeated, by hand,
at every real call site, with a real risk one of them is eventually
added without it. The real, chosen approach keeps that real condition
in exactly one place, at the cost of every real call site needing to
pass a real function value rather than simply writing the call
directly.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

Every real moment this app can now signal with sound also has a real,
distinct, physical counterpart — a light tap for selecting, a firmer
one for placing, a rejection buzz, and a real, celebratory pulse for a
finished puzzle.

---

## Concept Unit: User preferences

### The Problem

Both Concept Units above play real sound and real haptics
unconditionally — there is no real way, yet, for a player who finds
either one unwelcome (a quiet room, a sensitive real device, personal
preference) to turn it off.

> **Try it yourself first.** Curriculum's own later work already plans
> a real, dedicated settings screen with real, persistent storage —
> not this lesson's own real job. Given only what this lesson's own
> code actually needs right now (should a sound play; should a haptic
> fire), what is the smallest real piece of state that could answer
> both questions, without building anything that screen doesn't
> already need built for it later?

### Introducing the concept

No new isolated lab is needed here — a `bool` field and `setState`
are both already fully, formally established in this project;
introducing a throwaway lab for them again would violate the Recursive
Concept Extraction Rule's own "new concept" test, since neither
construct is new here. What *is* new is only how this Concept Unit
chooses to *scope* that already-known tool: two real, local,
`_SudokuAppState`-owned `bool` fields, deliberately not persisted.

### Discard the throwaway example

Not applicable — no throwaway example was introduced.

### Project Change

- **Reference Source** — No reference counterpart; curriculum's own
  later, full settings screen (`Sound`, `Haptics`, `Dark mode`,
  `Timer`, `Difficulty`, `Mistake warnings`, `Animations`) is a real,
  separate, later, larger piece of work — this Concept Unit
  deliberately builds only the two real flags sound and haptics
  themselves already need.
- **Files affected** —
  `project/lib/features/sudoku/presentation/sudoku_app.dart`
  (`_SudokuAppState` gains `_soundEnabled`/`_hapticsEnabled`;
  `_playSound`/`_playHaptic` both gate on them; two new real
  `IconButton`s added to the AppBar; two new real toggle methods).
- **Change type** — add; modify (`_playSound`/`_playHaptic` gain a real
  guard).
- **Location** — two new fields beside `_shakeTrigger`; the two
  `_playSound`/`_playHaptic` methods from the Concept Units above; the
  AppBar's own existing `actions:` list, alongside the already-real
  theme toggle.
- **Dependencies** — none beyond the Flutter SDK.

### The New Code

```dart
bool _soundEnabled = true;
bool _hapticsEnabled = true;

void _toggleSound() {
  setState(() => _soundEnabled = !_soundEnabled);
}
```

### The Updated Project

`_playSound`/`_playHaptic`, both real, complete, and now gated,
numbered:

```dart
1  void _playSound(SystemSoundType type) {
2    if (_soundEnabled) {                    // ← new
3      SystemSound.play(type);
4    }                                        // ← new
5  }
6
7  void _playHaptic(Future<void> Function() effect) {
8    if (_hapticsEnabled) {                   // ← new
9      effect();
10   }                                        // ← new
11 }
```

The AppBar's own real `actions:` list, numbered, with this Concept
Unit's own two new real buttons preceding the already-existing theme
toggle:

```dart
 1  actions: [
 2    IconButton(                                                        // ← new
 3      icon: Icon(_soundEnabled ? Icons.volume_up : Icons.volume_off),  // ← new
 4      tooltip: _soundEnabled ? 'Mute sound' : 'Unmute sound',          // ← new
 5      onPressed: _toggleSound,                                        // ← new
 6    ),                                                                  // ← new
 7    IconButton(                                                        // ← new
 8      icon: Icon(_hapticsEnabled ? Icons.vibration : Icons.mobile_off),// ← new
 9      tooltip: _hapticsEnabled ? 'Disable haptics' : 'Enable haptics', // ← new
10      onPressed: _toggleHaptics,                                      // ← new
11   ),                                                                  // ← new
12   IconButton(
13     icon: Icon(_iconForThemeMode(_themeMode)),
14     tooltip: 'Change theme',
15     onPressed: _cycleThemeMode,
16   ),
17 ],
```

Lines 12-16, the real, pre-existing theme toggle, are entirely
unchanged in their own content — only their position, now third rather
than first, moved to make room.

### Mechanical walkthrough

- `bool _soundEnabled = true;` / `bool _hapticsEnabled = true;` — two
  real, already-established `bool` fields (already used elsewhere in
  this class, e.g. `_themeMode`'s own kind), each defaulted `true` so
  this app's own existing, already-verified feedback behavior from the
  two Concept Units above is unchanged for anyone who never touches
  either new toggle.
- `if (_soundEnabled) { SystemSound.play(type); }` /
  `if (_hapticsEnabled) { effect(); }` — real, already-established
  `if` statements, each now the one, single, real place its own
  feedback channel can be silenced.
- `void _toggleSound()` / `void _toggleHaptics()` — two real, new,
  private methods, each an identical real shape to the already-existing
  `_cycleThemeMode`: a real `setState` flipping one real `bool` with
  `!` (already established).
- `IconButton(icon: Icon(_soundEnabled ? Icons.volume_up :
  Icons.volume_off), tooltip: ..., onPressed: _toggleSound)` —
  constructs a real, already-established widget (`IconButton`, already
  used for the theme toggle), its real `icon`/`tooltip` both swapping
  based on the current real `_soundEnabled` value, the identical real
  pattern the theme toggle already established for its own three
  states.

### CS lens

**Preference/state separation from persistence** — keeping *what the
current setting is* (a real, in-memory `bool`) entirely separate from
*where it's remembered* (not built yet, deliberately) is a real,
common, load-bearing split: a system can have real, working runtime
behavior driven by a preference long before that preference has any
real, durable storage at all. Also recognized in: a video game's own
in-session graphics-quality toggle, changeable mid-session even before
a "save settings" step exists; a web app's own in-memory dark-mode
toggle, working immediately, persisted to `localStorage` as a real,
separate, later concern; an embedded device's own runtime
configuration registers, distinct from whatever real, non-volatile
storage eventually backs them.

### SE lens

The real alternative here was building the full, real settings screen
now — real, more complete, but real, direct scope creep into
curriculum's own later, dedicated lesson, and real, wasted work if that
later lesson's own real design (a dedicated screen, real persistence
via this app's own already-existing `AppDatabase`) ends up shaped
differently than whatever this lesson would have guessed. The real,
honest cost of the chosen, narrower approach: every real toggle in
this app resets to its own real default the instant the app restarts —
a real, deliberately temporary, tracked limitation, not a bug, closed
out by name in this app's own next real settings-focused lesson.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

Every real sound and haptic this lesson built is now genuinely
optional, in real, immediate control of the person playing — not
persisted yet, but already real and already working.

---

## Connect the pieces

One real, concrete trace, start to finish: a player mutes sound, then
plays through a real move.

1. A real tap on the "Mute sound" button calls `_toggleSound`, a real
   `setState` flips `_soundEnabled` from `true` to `false`; the AppBar
   icon swaps from a real, filled speaker to a real, muted one, and its
   own real tooltip now reads "Unmute sound."
2. The player taps a real, empty cell — `_dispatch`'s own real
   `SelectCellIntent` case calls `_playHaptic(HapticFeedback
   .selectionClick)`; since `_hapticsEnabled` is still real, `true`,
   a real, physical selection tick fires.
3. The player taps a real, valid digit — `enterDigit` succeeds;
   `_playSound(SystemSoundType.click)` runs, but, since `_soundEnabled`
   is now real, `false`, nothing actually plays; `_playHaptic
   (HapticFeedback.mediumImpact)` still fires, since haptics were never
   touched.
4. Were this real move the puzzle's own final one, `_CompletionBanner`
   would receive `visible: true` for the real first time; its own
   `didUpdateWidget` would call `_controller.forward(from: 0)`
   (this app's own already-real completion flourish) and, since
   `widget.hapticsEnabled` still reads `true`, a real
   `HapticFeedback.successNotification()` — one real, final, physical
   confirmation, reaching a player through touch even with every real
   sound in this app currently silenced.

Two real feedback channels, three real, distinct events each, one real
pair of switches controlling both independently — real, physical
confirmation of exactly what this app's own, already-existing visual
feedback already showed, reaching a player who might not have been
looking, or listening, at the exact right moment.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause.

One real, throwaway lab file
(`verification/lesson-63/sound_haptics_labs_test.dart`) ran first,
isolated from the real project entirely — all three real labs passed
on their first real run; full, real narrative and output saved to
`verification/lesson-63/run-log.md`.

With every Concept Unit's own real code landed, an already-existing,
permanent `theme_mode_test.dart` broke: this lesson's own two new
AppBar buttons made its own bare `find.byType(IconButton)`/`find
.byType(Icon)` finders match three real widgets instead of one. Fixed
by anchoring both to the theme button's own real, stable `tooltip:
'Change theme'` via `find.byTooltip`, unaffected by how many other
real buttons this app's AppBar now carries.

Final, clean, real results:

```
flutter analyze .
57 issues found. (ran in 6.3s)
```

Up by exactly one from this lesson's own pre-change baseline — the new
test file's own single, additional, same-category
`avoid_relative_lib_imports` info; zero new categories.

```
flutter test
...
00:19 +76: All tests passed!
```

76 real test-file-level checks, up from 70: six new, all in a new,
permanent `sound_and_haptics_test.dart`, proving every real sound and
haptic call this lesson added, and that muting either one genuinely
silences only that one real channel.
