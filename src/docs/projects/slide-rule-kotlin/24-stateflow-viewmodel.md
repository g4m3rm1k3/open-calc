# Lesson 24: One Owner for All the App's Real State

*(`StateFlow` Replaces `LiveData`, for Real This Time)*

**User Story**
> As a developer, I want every screen's state owned by its `ViewModel`,
> consistently, instead of scattered between composables and Room calls.

**What you will build**
No new visible feature — `CalculatorViewModel` (Lesson 11) grows to own
`expression`, `history` (now sourced from Lesson 23's Room `Flow`), and
`memory` consistently, all exposed as `StateFlow`, with the calculator
screen reduced to reading from and calling into the `ViewModel` instead of
holding logic itself.

**What you need to know first**
Lesson 11's `ViewModel`, Lesson 23's `Flow`. From `../track/`: Lesson 16,
`LiveData`, and Lesson 17, the Repository pattern — this lesson is the
direct, deliberate evolution of both.

---

## Concept Unit: `StateFlow` as `LiveData`'s Coroutine-Native Successor

### The Problem

Lesson 11's `CalculatorViewModel` exposed `memory` as `mutableStateOf`
directly — convenient for Compose, but it doesn't integrate with
coroutines/`Flow` the way Lesson 23's Room layer now does, and it's
Compose-specific, unusable if this app ever needed a non-Compose consumer
(a widget, a wear OS companion). `StateFlow` is Kotlin's own answer: a
`Flow` that always has a current value, observable by both coroutine code
and, via a small bridge, Compose.

### Project Change

- **Reference Source:** No reference counterpart — the direct Kotlin/
  coroutine evolution of `../track/` Lesson 16's `LiveData`, contrasted
  explicitly rather than ported.
- **Files affected:** `CalculatorViewModel.kt`; the calculator screen's
  composable.
- **Change type:** Replace `mutableStateOf` fields with `StateFlow`.
- **Location:** `CalculatorViewModel`'s `memory` property (Lesson 11); add
  `expression` and `history`.
- **Dependencies:** Lesson 23's `CalculationDao`.

### The New Code

```kotlin
class CalculatorViewModel(private val dao: CalculationDao) : ViewModel() {
    private val _memory = MutableStateFlow(0.0)
    val memory: StateFlow<Double> = _memory.asStateFlow()

    private val _expression = MutableStateFlow("")
    val expression: StateFlow<String> = _expression.asStateFlow()

    val history: StateFlow<List<CalculationEntity>> =
        dao.observeAll().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun onDigitPressed(digit: String) { _expression.value += digit }

    fun onEqualsPressed() {
        when (val result = safeEvaluate(_expression.value)) {
            is CalcResult.Ok -> {
                viewModelScope.launch {
                    dao.insert(CalculationEntity(expression = _expression.value, result = result.value.toString()))
                }
                _expression.value = result.value.toString()
            }
            is CalcResult.Error -> _expression.value = result.message
        }
    }

    fun memoryAdd(value: Double) { _memory.value += value }
}
```

### Mechanical walkthrough

1. `private val _memory = MutableStateFlow(0.0)` / `val memory: StateFlow<Double> = _memory.asStateFlow()`
   — (first appearance) the **backing-property pattern**: a private,
   mutable version (`_memory`) the class itself writes to, and a public,
   read-only version (`memory`) everything outside the class observes —
   `asStateFlow()` returns a read-only view of the same underlying flow.
   This is a stricter, more explicit version of Lesson 11's `private set` —
   outside code cannot even attempt to write `memory.value = ...` at all,
   there's no setter exposed whatsoever.
2. `dao.observeAll().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())`
   — (first appearance) `stateIn` converts Lesson 23's plain `Flow` into a
   real `StateFlow` that always has a current value (`emptyList()`
   initially) — `viewModelScope` is a `CoroutineScope` tied to the
   `ViewModel`'s own lifetime (automatically cancelled when the
   `ViewModel` is cleared), and `SharingStarted.WhileSubscribed(5000)`
   keeps the underlying database query active only while at least one
   screen is actually observing it (plus a 5-second grace period for
   quick screen rotations), rather than running forever in the
   background.
3. `fun onEqualsPressed()` / `fun onDigitPressed(digit: String)` — the
   button logic from Lessons 5–10 moved *into* the `ViewModel` entirely —
   the composable no longer holds this logic at all, only calls these
   methods and reads the resulting `StateFlow`s.

### CS Lens

`StateFlow` reappearing directly from `../track/` Lesson 16's `LiveData` —
the same "always has a current value, notifies observers on change" idea,
built on coroutines' `Flow` instead of Android's own lifecycle-aware
observer classes. The backing-property pattern (`_memory`/`memory`) is
**encapsulation** (a concept this curriculum treats as a "hard concept" per
the Repetition Rule) applied specifically to observable state — the same
principle behind Lesson 11's `private set`, expressed more strictly here.

### SE Lens

Why migrate off `LiveData` at all, if it already worked in `../track/`?
`LiveData` is Android-specific and callback-based; `StateFlow` is plain
Kotlin, usable anywhere coroutines run (a server, a desktop app, a
different platform entirely), and composes naturally with the rest of
`Flow`-based code (Lesson 23's `dao.observeAll()`) without a conversion
step. The real cost: `StateFlow` requires a small bridge
(`collectAsState()`, used in the composable next) to read from Compose,
where `LiveData` had its own dedicated `observeAsState()` — a similar,
parallel mechanism, not meaningfully more or less code, just a different
name for the same bridge.

### Connection

The composable itself, updated next, becomes almost entirely a thin layer
translating `ViewModel` state and calls — the payoff of moving logic out
of the UI layer that Lesson 23's `onButtonPressed` was already trending
toward.

---

## Concept Unit: The Composable, Reduced to a View Layer

### The Problem

With all logic moved into `CalculatorViewModel`, the composable's own job
shrinks to almost nothing — reading three `StateFlow`s and forwarding
button taps.

### The Updated Project

```kotlin
composable("calculator") {
    val viewModel: CalculatorViewModel = viewModel(factory = CalculatorViewModelFactory(dao))
    val expression by viewModel.expression.collectAsState()
    val memory by viewModel.memory.collectAsState()
    val history by viewModel.history.collectAsState()

    Column(modifier = Modifier.fillMaxSize()) {
        Text(text = "M: $memory", fontSize = 12.sp)
        Text(text = expression.ifEmpty { "0" }, fontSize = 40.sp)
        LazyVerticalGrid(columns = GridCells.Fixed(4), modifier = Modifier.weight(1f)) {
            items(buttons) { label ->
                Button(onClick = {
                    when (label) {
                        "=" -> viewModel.onEqualsPressed()
                        "C" -> viewModel.onClearPressed()
                        else -> viewModel.onDigitPressed(label)
                    }
                }) { Text(label) }
            }
        }
        LazyColumn(modifier = Modifier.weight(1f)) {
            items(history) { entry -> Text("${entry.expression} = ${entry.result}") }
        }
    }
}
```

### CS Lens

This is the payoff of state hoisting (Lesson 2), taken as far as this app
takes it: the composable holds *zero* business logic, only reads
`StateFlow`s and forwards taps — every one of Lessons 5 through 23's
features (evaluation, memory, history) now lives entirely in
`CalculatorViewModel`, independently testable without a `Composable`
function or an Android device involved at all — Lesson 25's whole premise.

### Connection

Lesson 25 tests `CalculatorViewModel` directly, calling `onDigitPressed`/
`onEqualsPressed` and asserting on `expression.value` — no UI, no
emulator, exactly because of this separation.

---

## Closing

### Connect the pieces

`StateFlow` (unit 1) replaces `LiveData` as this app's observable-state
mechanism, with the backing-property pattern keeping every write private
to the `ViewModel`. The composable (unit 2) shrinks to a thin translation
layer — read three `StateFlow`s, forward button taps to `ViewModel`
methods — the natural endpoint of the state-hoisting principle this course
has followed since Lesson 2.

### What breaks without this

Expose `_expression` directly (make it `val expression = MutableStateFlow("")`,
public, no backing-property split) instead of through the
private/public pair. Real, observable consequence — not a crash, a design
regression: any composable could now write `viewModel.expression.value =
"anything"` directly, bypassing `onDigitPressed`/`onEqualsPressed`
entirely — including bypassing Lesson 7's error handling and Lesson 23's
history-saving logic. Restore the backing-property split and the
`ViewModel` is again the only thing that can legally change its own state.

### Exercises

- Add `onClearPressed()` to the `ViewModel`, moving the `"C"` logic out of
  the composable entirely — confirm the composable's `when` shrinks to
  three trivial one-line calls.
- Try writing `viewModel.expression.value = "test"` from inside the
  composable and confirm the compiler rejects it — `StateFlow` (as opposed
  to `MutableStateFlow`) has no public setter at all.

### Definition of done

- [ ] The calculator screen fully works, with zero business logic left in
      the composable.
- [ ] `_expression`/`_memory` are private; `expression`/`memory` are
      read-only from outside `CalculatorViewModel`.
- [ ] You can explain, concretely, why `StateFlow` needed
      `collectAsState()` while `mutableStateOf` (Lesson 2) didn't.
- [ ] Commit: `git commit -m "Move all calculator logic into the ViewModel with StateFlow — the composable is now a thin view layer"`.
