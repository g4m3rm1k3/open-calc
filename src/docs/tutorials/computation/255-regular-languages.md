# Lesson 255: Regular Languages

**What you will build** — A second, different finite automaton (recognizing binary sequences that end in `1`, rather than Lesson 254's sequences with an even number of `1`s), reusing every function Lesson 254 built without changing a single line of that code — proof that "language" and "automaton" are genuinely separable ideas. Then a real `complement-states` function that mechanically derives a working automaton for the *opposite* language from an existing one, and a toy identifier-recognizing automaton connecting all of this directly to lexical analysis — deciding whether a sequence of character-categories forms a legal token, exactly the question a real compiler's tokenizer has to answer before anything else can happen. The transferable problem: what does it actually mean for a language to be "regular," how do you show a specific language has that property, and what do you get for free once you know it does?

**What you need to know first** — Every function Lesson 254 built: `matches-transition?`, `find-transition`, `run-from`, `is-accept-state?`, and `accepts?`, plus that lesson's own vocabulary — **finite automaton**, **state**, **transition**, **deterministic**, **start state**, **accept state**, **run**, and **language (of an automaton)**. Lesson 94/96's established append-by-`assoc` technique for growing a vector one element at a time (`(assoc v (count v) new-element)`). Lesson 20's recursion and Lesson 22's base-case-and-progress.

**Terms used in this lesson**

- **regular language** — a language (in Lesson 254's own sense: a set of accepted input sequences) for which *some* finite automaton exists whose language it is exactly. "Regular" is a property a language either has or does not have — not every conceivable set of sequences is regular, though this lesson does not yet build an example of one that isn't (Lesson 256, Regular Expressions, and later lessons return to that boundary directly).
- **witness automaton** — a specific, concrete finite automaton exhibited as proof that a particular language is regular. Regularity is proven constructively: not by argument alone, but by actually producing a working machine and showing, by running it, that it accepts exactly the right set of inputs.
- **closure property** — a fact of the form "if you start with something that has property X, and apply operation Y to it, the result still has property X." This lesson proves one specific closure property concretely: starting from a regular language and complementing it still produces a regular language.
- **complement (of a language)** — given a language L over some fixed alphabet, its complement is every possible finite sequence over that same alphabet that is *not* in L. Every sequence, without exception, is in either L or its complement, never both and never neither.
- **trap state (dead state)** — a state that, once entered, can never be left for any other state — every transition out of it leads directly back to itself, regardless of what symbol is read next. A non-accepting trap state represents "this input has already failed, and nothing that comes afterward can change that."
- **lexical analysis** — the process of deciding whether a sequence of input characters (or, as in this lesson's own example, character *categories*) forms one legal, meaningful unit — a token — according to a fixed set of rules, before anything else is done with it.
- **token** — one meaningful, indivisible unit recognized during lexical analysis — this lesson's own example asks whether a given sequence of category-symbols forms one legal identifier token, not what that token subsequently means.

**Objects and methods used**

- **`assoc`**
  - *What it is:* A Clojure function that returns an updated *copy* of a vector or map, with one position set to a new value — the original collection passed in is never modified.
  - *Implementation:* `(assoc collection key value)` returns a new collection, equal to `collection` everywhere except at `key`, which now holds `value`. For a vector specifically, `key` must be either a valid existing index or exactly `(count collection)` — supplying exactly the current length is how a vector is grown by one element, which is what `assoc`'s only use in this lesson actually does.
  - *Its use:* `complement-states`, in the second Concept Unit below, builds up its result vector one state at a time, appending each surviving state via `assoc` at exactly the accumulator's own current length — the identical growth technique already established for heap arrays in Lesson 94 and Lesson 96.
- **`get`, `count`, `=`, `+`, `if`, `defn`, `println`**
  - *What they are:* All seven reappear in full from Lesson 254: `get` reads a value out of a vector by index; `count` reports how many elements a collection holds; `=` tests value equality; `+` is Clojure's addition function; `if` evaluates exactly one of two branches based on a test; `defn` binds a name to a function; `println` prints its arguments' readable form followed by a newline.
  - *Their use here:* Identical roles to Lesson 254 — indexing into transition and state vectors, counting collection lengths for base cases, testing equality at every match check, advancing search indices by one, branching on every base case, naming every function in this lesson, and showing every real result below.

---

## Concept Unit: Regular Languages Have Witness Automata

### The Problem

Lesson 254 built exactly one automaton and used "the language of an automaton" to mean whatever that one specific machine happened to accept. That leaves an open question: is "regular language" just another name for "whatever some automaton accepts," trivially true of literally any set of sequences someone might describe — or is it a real, checkable property, one some languages have and others might not? And however that question is answered, how would this curriculum ever actually *show*, concretely, that some particular language has this property, rather than just asserting it?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing Section XII's build from Lesson 254.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Depends directly on `accepts?` and everything it calls, from Lesson 254, unchanged.

### The New Code

```clojure
(accepts? [["no" 0 "no"] ["no" 1 "yes"] ["yes" 0 "no"] ["yes" 1 "yes"]]
          "no" ["yes"] [1 0 1 0])
```

### The Updated Project

Skipped — this is a single call to Lesson 254's own already-complete `accepts?`, with no enclosing structure of its own to place it inside.

### Naming the Concept

This lesson defines, formally, what Lesson 254 only used informally: a language L is **regular** exactly when there exists *some* finite automaton — some choice of states, transitions, start state, and accept states — whose own language (the set of everything it accepts) is exactly L. This is not proven by argument; it is proven by exhibiting a real, working automaton and running it, which is exactly what this new transition table does. It defines two states, `"no"` and `"yes"`, meaning "the most recent symbol read was not a `1`" and "the most recent symbol read was a `1`," with `"yes"` as the only accept state — a **witness automaton** for the language "binary sequences ending in `1`":

```
ends-in-1 [] => false
ends-in-1 [1] => true
ends-in-1 [1 0] => false
ends-in-1 [0 1] => true
ends-in-1 [1 1] => true
ends-in-1 [1 0 1 0] => false
```

Every one of these six results matches the stated rule exactly: the empty sequence has no symbols to end in `1`, so it is rejected; `[1]`, `[0 1]`, and `[1 1]` each really do end in `1`, and are accepted; `[1 0]` and `[1 0 1 0]` each end in `0`, and are rejected — including `[1 0 1 0]`, which contains three `1`s overall, the same total Lesson 254's own parity automaton would have called "odd" and rejected for a completely different reason. That last fact is the actual point: this automaton and Lesson 254's parity automaton share an identical alphabet (`0`/`1`) and an identical general shape (two states, four transitions), and yet they recognize two genuinely different properties of exactly the same possible inputs — one about the *total count* of `1`s, the other about only the *last* symbol. Both are regular, and both are regular for the same underlying reason: a real, deterministic finite automaton exists for each, shown running correctly above.

### Mechanical Walkthrough

Every distinct syntactic element in this unit's own code, per the Repetition Rule, restated in full even though each element already appeared in Lesson 254:

- **The transition-triple vectors** — `["no" 0 "no"]`, `["no" 1 "yes"]`, `["yes" 0 "no"]`, `["yes" 1 "yes"]` — four three-slot vectors, each `[from-state input-symbol to-state]`, the identical vector-as-triple shape Lesson 254 established and Lesson 92 originated. This lesson's own transitions differ from Lesson 254's only in which state each symbol leads to — `"no"` reading `1` leads to `"yes"` (a `1` was just seen), but `"yes"` reading `0` leads back to `"no"` (the most recent symbol is no longer a `1`), a rule with no counterpart at all in Lesson 254's own parity automaton.
- **The outer vector** — `[[...] [...] [...] [...]]` — a vector holding all four transition triples together, the same whole-transition-table shape Lesson 254's own `transitions` parameter expected.
- **`"no"`** (the second argument) — a string literal naming the start state, the same role Lesson 254's own `start` parameter filled.
- **`["yes"]`** (the third argument) — a one-element vector naming the accept states, the same role Lesson 254's own `accept-states` parameter filled.
- **`[1 0 1 0]`** (the fourth argument) — a vector of input symbols, the input being tested, the same role Lesson 254's own `input` parameter filled.
- **`(accepts? ...)`** — a call to Lesson 254's own `accepts?` function, unmodified, with these four arguments. Internally, this single call still does everything the previous lesson's Connect the Pieces section traced in full: hand the transition table and start state to `run-from`, which repeatedly calls `find-transition` (itself searching via `matches-transition?`) once per input symbol, then hand the resulting final state to `is-accept-state?` against the given accept-state list.

### CS Lens

**Regular language**, defined via a witness automaton, is a hard concept.

```
Also recognized in: a regular-expression pattern proven to match exactly by
constructing an automaton for it (Lesson 256's own subject, next); a network
protocol's valid-message grammar, checked by a state machine before a
message is ever acted on; a simple validation rule (a US ZIP code's five
digits, a MAC address's colon-separated hex pairs) checked symbol by symbol
rather than all at once; a game's input-combo detector (a specific sequence
of button presses) built as exactly this same kind of small state machine.
```

### SE Lens

The design principle: this unit changed *only* the data (a new transition table, new states, new accept states) and reused Lesson 254's own runner functions completely unchanged — no new `defn` appears anywhere in this unit's own code. The alternative not chosen: writing a second, dedicated "ends-in-1 checker" function directly, perhaps a simple recursive scan checking only the last element of the input. That alternative would run faster for this one specific property and would be simpler to read in isolation — but it would not demonstrate anything general; it would be one more one-off function, unrelated in its own code to Lesson 254's parity checker, sharing nothing with it structurally even though both problems are, underneath, the exact same kind of question. The real tradeoff Lesson 254's own data-driven design already argued for, now paid off directly: because "what an automaton accepts" was built as a genuinely general function over arbitrary transition data, a completely different language needed zero new logic — only new data.

### Commands Needed

`bb <path-to-file>.clj`, unchanged from Lesson 254.

### Run It

```
ends-in-1 [] => false
ends-in-1 [1] => true
ends-in-1 [1 0] => false
ends-in-1 [0 1] => true
ends-in-1 [1 1] => true
ends-in-1 [1 0 1 0] => false
```

Run for real, this session, via `bb`. All six match the "ends in `1`" rule by direct inspection.

### Connection

This unit showed regularity is provable by exhibiting one working automaton. The next unit asks whether, having proven a language regular once, some *related* language can be shown regular too, without building a second witness automaton completely from scratch.

---

## Concept Unit: Closure Under Complement

### The Problem

Lesson 254's own parity automaton accepts sequences with an even count of `1`s. Its **complement** — every sequence with an *odd* count of `1`s instead — is a different language. Is there any way to know, cheaply, whether that different language is also regular, or does regularity have to be re-proven from nothing, by hand, for every new language someone happens to describe?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing this lesson's own build.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Depends directly on `is-accept-state?` from Lesson 254, unchanged.

### The New Code

```clojure
(defn complement-states [all-states accept-states index acc]
  (if (= index (count all-states))
    acc
    (if (is-accept-state? accept-states (get all-states index) 0)
      (complement-states all-states accept-states (+ index 1) acc)
      (complement-states all-states accept-states (+ index 1)
                          (assoc acc (count acc) (get all-states index))))))
```

### The Updated Project

Skipped — a freestanding new function, nothing surrounding it yet.

### Naming the Concept

Per the Section VI+ convention already used throughout this lesson series, this code is both the isolated demonstration and the real artifact directly. `complement-states` takes the *full* list of an automaton's states, its current accept-states, and returns a new list holding exactly the states that were *not* accepting — every state left behind once the accepting ones are filtered out.

```
complement of [even] over [even odd] => [odd]
```

Given the parity automaton's own two states, `["even" "odd"]`, and its own accept-states, `["even"]`, `complement-states` correctly returns `["odd"]` — the one state not in the original accept list. This single result is the mechanical core of a real **closure property**: an automaton is completely determined by its states, transitions, start state, and accept states; changing *only* the accept states, while leaving the transitions, start state, and full state list exactly as they were, produces a different, still-perfectly-valid finite automaton — and that new automaton's language is provably the complement of the original's. This lesson demonstrates that claim concretely rather than asserting it, by running the *same* transitions and start state twice, once with the original accept states and once with `complement-states`'s own output, against five identical inputs:

```
parity [] even-accept => true
parity [] odd-accept  => false
parity [1] even-accept => false
parity [1] odd-accept  => true
parity [1 1] even-accept => true
parity [1 1] odd-accept  => false
parity [0 1 0 1 1] even-accept => false
parity [0 1 0 1 1] odd-accept  => true
parity [1 1 0 1 1] even-accept => true
parity [1 1 0 1 1] odd-accept  => false
```

Every one of these five pairs disagrees, every single time — wherever the original accept states say `true`, the complement accept states say `false`, and vice versa, with no exception across five different inputs chosen to vary in both length and parity. That is exactly what "the complement automaton accepts exactly the complement language" means, made concrete: not a proof for every possible regular language in general (a fuller proof belongs to a course in formal language theory, and this lesson does not attempt to reconstruct it in full generality, the same honest scope-limiting this curriculum already applied in Lessons 99, 100, and 134), but a real, run-verified demonstration of the mechanism that makes it true — flipping accept states, and nothing else, flips every accept/reject decision the automaton makes.

### Mechanical Walkthrough

Every distinct syntactic element in `complement-states`, in order:

- **`all-states`** — a parameter bound to the automaton's *entire* list of states, not just the accepting ones — for the parity automaton, `["even" "odd"]`.
- **`accept-states`** — a parameter bound to the current accept-state list being complemented — `["even"]` in the demonstration above.
- **`index`** — a parameter tracking which position of `all-states` is currently being checked, exactly the same role `index` played in Lesson 254's own `find-transition` and `is-accept-state?`.
- **`acc`** — a new parameter, an accumulator: a vector, starting empty (`[]`, supplied directly by the caller), that this function builds up one surviving state at a time as it recurses. This is the accumulator-passing recursion style, already established in this curriculum since Lesson 34 and reused deliberately (rather than `loop`, which is permanently off-limits in this curriculum) since Lesson 119.
- **`(if (= index (count all-states)) acc ...)`** — the base case: once `index` has reached the length of `all-states` (via `count`, already explained in the Header), every state has been checked, and the function returns `acc` — whatever it has accumulated so far, which is exactly the complete answer at that point.
- **`(is-accept-state? accept-states (get all-states index) 0)`** — a call to Lesson 254's own `is-accept-state?`, checking whether the state currently at `index` (retrieved via `get`, already explained in the Header) is one of the *original* accept states.
- **`(complement-states all-states accept-states (+ index 1) acc)`** (when the check above is `true`) — the recursive case for a state that *was* accepting: skip it — recurse with `index` advanced by `1` via `+`, but `acc` passed through completely unchanged, since an originally-accepting state does not belong in the complement.
- **`(assoc acc (count acc) (get all-states index))`** (when the check above is `false`) — building the new accumulator: `(get all-states index)` reads the current non-accepting state, and `assoc`, already explained in the Header, appends it onto `acc` at position `(count acc)` — exactly its current length, which is how a vector is grown by one element with `assoc` rather than overwritten.
- **`(complement-states all-states accept-states (+ index 1) (assoc ...))`** (the full recursive case) — recurse with `index` advanced by `1`, and this newly-grown vector passed forward as the next call's own `acc`.

**Execution trace** — `(complement-states ["even" "odd"] ["even"] 0 [])`, matching the `Run It` result above:

```
Call index=0 acc=[]:      is-accept-state? ["even"] "even" -> true  -> skip -> recurse index=1 acc=[]
Call index=1 acc=[]:      is-accept-state? ["even"] "odd"  -> false -> keep -> acc becomes (assoc [] 0 "odd") = ["odd"]
                           -> recurse index=2 acc=["odd"]
Call index=2 acc=["odd"]: (= 2 (count ["even" "odd"])) -> (= 2 2) -> true -> base case, returns ["odd"]
```

Two states checked, one kept — the accumulator grows from `[]` to `["odd"]` at exactly the step where a genuinely non-accepting state is found, and is carried through unchanged on the step where an accepting one is skipped.

### CS Lens

**Closure property** is a hard concept, central to the theory of regular languages and reused constantly across the rest of computer science.

```
Also recognized in: closure of the integers under addition (adding two
integers always yields an integer); closure of sorted arrays under merging
(Lesson 113's merge sort, where merging two sorted arrays always yields a
sorted array); closure of well-formed HTML under nesting (a valid element
inside a valid element is still valid); closure of database views under
composition (a query over valid tables produces another valid, queryable
table); closure of type-safe expressions under composition in a well-typed
language (Lesson 173's type systems), where combining two well-typed
expressions correctly yields another well-typed expression.
```

### SE Lens

The design principle: proving a general closure property once, in code, is more valuable than checking one specific instance by hand, because it applies to *every* future automaton this curriculum (or a reader's own project) ever builds — not just the parity example shown here. The alternative not chosen: build the "odd number of `1`s" automaton directly, by hand, writing out its own fresh transition table from scratch and re-verifying it independently. That alternative would work, and would take real, separate effort to get right and check — this unit's actual point is that it does not need to, because `complement-states` derives a correct accept-state list mechanically from an automaton that was already proven correct. The real tradeoff: `complement-states` only ever changes accept states — it says nothing about deriving new *transitions* for a differently-structured language (Lesson 256's regular expressions, and later, non-deterministic automata, both eventually need genuinely new transition-construction techniques this lesson does not attempt). Complementation is the cheapest possible closure property precisely because it changes the least; that is also exactly why it cannot be stretched to cover every useful way of combining or modifying automata.

### Commands Needed

`bb <path-to-file>.clj`, unchanged.

### Run It

```
complement of [even] over [even odd] => [odd]
parity [] even-accept => true
parity [] odd-accept  => false
parity [1] even-accept => false
parity [1] odd-accept  => true
parity [1 1] even-accept => true
parity [1 1] odd-accept  => false
parity [0 1 0 1 1] even-accept => false
parity [0 1 0 1 1] odd-accept  => true
parity [1 1 0 1 1] even-accept => true
parity [1 1 0 1 1] odd-accept  => false
```

Run for real, this session, via `bb`. Every even/odd-accept pair disagrees exactly as described above.

### Connection

Complementation showed one language's regularity can be transferred to a related one purely by data manipulation. The final unit turns away from deriving new languages from old ones and toward a concrete, practical reason any of this matters outside pure theory: deciding whether a sequence of symbols is a legal token.

---

## Concept Unit: Regular Languages as Lexical Patterns

### The Problem

Every automaton built so far in this lesson answers an abstract question about `0`s and `1`s. Real programs constantly need to answer a structurally identical question about something much more concrete: given a sequence of characters, is it a *legal* piece of syntax — a legal identifier, a legal number, a legal keyword — before anything else can be done with it at all? Is that genuinely the same kind of problem this lesson has already been solving, or does it need something new?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing this lesson's own build.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Depends directly on `accepts?` from Lesson 254, unchanged.

### The New Code

```clojure
(accepts? [["start" "letter" "valid"] ["start" "digit" "invalid"]
           ["valid" "letter" "valid"] ["valid" "digit" "valid"]
           ["invalid" "letter" "invalid"] ["invalid" "digit" "invalid"]]
          "start" ["valid"] ["digit" "letter"])
```

### The Updated Project

Skipped — a single call to Lesson 254's own already-complete `accepts?`, with no enclosing structure of its own.

### Naming the Concept

This automaton's alphabet is no longer `0`/`1` — its two symbols are the strings `"letter"` and `"digit"`, standing in for "the next input character is a letter" or "the next input character is a digit." Nothing about `accepts?`, `run-from`, `find-transition`, or `matches-transition?` required any change to make this work — every one of those functions, since Lesson 254, only ever compared symbols with `=`, never assumed they were numbers specifically. Its three states model a simple identifier-naming rule ("must start with a letter, then any mix of letters and digits"): `"start"` (nothing read yet), `"valid"` (a legal identifier so far), and `"invalid"` — a **trap state**: every transition leading out of `"invalid"`, on either symbol, leads right back to `"invalid"`, so once an input goes wrong, no later symbol can ever rescue it.

```
identifier [] => false
identifier [letter] => true
identifier [digit] => false
identifier [letter digit] => true
identifier [digit letter] => false
identifier [letter letter digit digit] => true
```

`[]`, an empty sequence, is rejected — an identifier needs at least one character. `["letter"]` is accepted — a single letter, like a variable named `x`, is a legal identifier on its own. `["digit"]` is rejected outright — no identifier may begin with a digit. `["letter" "digit"]` is accepted — like `x1`, a letter followed by a digit is legal. `["digit" "letter"]` is rejected — even though a letter does appear, the identifier already failed at the very first symbol, and the trap state at `"invalid"` guarantees the later letter cannot undo that. `["letter" "letter" "digit" "digit"]` is accepted — like `xy11`, any length of letters and digits is fine once a letter has started it off. This is exactly **lexical analysis**: deciding whether one candidate sequence forms a single legal **token**, symbol category by symbol category, using nothing more than the same finite-automaton machinery this whole lesson has already built and reused three separate times now.

### Mechanical Walkthrough

New elements not already covered above:

- **`"letter"`, `"digit"`** — string literals used as input symbols, rather than the numbers `0`/`1` used everywhere earlier in this lesson and in Lesson 254. Every function that consumes a symbol — `matches-transition?`'s own `(= (get transition 1) input-symbol)`, specifically — compares with `=`, which works identically regardless of whether the values being compared are numbers or strings; nothing needed to change.
- **`"start"`, `"valid"`, `"invalid"`** — state names, the same role `"even"`/`"odd"` and `"no"`/`"yes"` played earlier, now three states instead of two.
- **`["invalid" "letter" "invalid"]`, `["invalid" "digit" "invalid"]`** — the two transitions defining the trap state directly: from `"invalid"`, on either possible symbol, the destination is `"invalid"` itself. This is the concrete, data-level definition of a trap state — nothing in the automaton-running code needs to know a state is "special" in any way; it falls out entirely from every one of its own outgoing transitions pointing back to itself.
- **The remaining four transitions and the `accepts?` call itself** — structurally identical in every respect to the calls already fully walked through in the two units above: a vector of transition triples, a start-state string, an accept-state vector, an input vector, all handed to `accepts?` unchanged.

### CS Lens

**Lexical analysis** and **trap state** are hard concepts.

```
Also recognized in: a real programming language compiler's own tokenizer,
deciding whether a run of characters is a legal identifier, number literal,
or operator before parsing ever begins; a form field's input mask (a phone
number, a credit card number) rejecting a keystroke the instant it becomes
impossible to complete validly; a URL parser rejecting a malformed address
the moment an illegal character appears, rather than scanning the rest of
the string first; a vending machine's own "jammed" state, entered once and
never exited without external intervention, identical in shape to a trap
state that only differs from an accepting one by which side of "found" or
"failed" it represents.
```

### SE Lens

The design principle: reusing the exact same four functions across three completely different alphabets and problem domains (binary digits, and now abstract character categories) is only possible because those functions were written, in Lesson 254, to operate on *symbols in general* — values compared only with `=` — rather than being hard-coded to expect numbers specifically. The alternative not chosen: writing this identifier check as a dedicated function, perhaps directly inspecting real characters with string-specific operations. The real tradeoff: a dedicated function could work directly on genuine text, which this lesson's simplified `"letter"`/`"digit"`-category alphabet deliberately avoids (a genuine text-scanning version would need character classification and string traversal machinery this curriculum has not yet built in Section XII, and does not need in order to teach the underlying idea); the general, data-driven automaton version, in exchange for that simplification, is the exact same code already proven correct twice over in this lesson, applied a third time with nothing changed but the data.

### Commands Needed

`bb <path-to-file>.clj`, unchanged.

### Run It

```
identifier [] => false
identifier [letter] => true
identifier [digit] => false
identifier [letter digit] => true
identifier [digit letter] => false
identifier [letter letter digit digit] => true
```

Run for real, this session, via `bb`. All six match the stated identifier rule by direct inspection.

### Connection

This unit closes the lesson by grounding "regular language" in a real, practical use — deciding whether a sequence forms a legal token — using nothing beyond what the first two units already built and proved. Lesson 256 asks the reverse question this lesson has been assuming an answer to throughout: given only a *pattern*, written compactly, how do you construct the witness automaton for it, rather than designing one by hand each time?

---

## Connect the Pieces

Follow the identifier automaton's own trap state through a single input, `["digit" "letter"]`, tracing exactly how "failure, once entered, cannot be undone" plays out mechanically. `accepts?` hands the six-transition table, start state `"start"`, and this input to `run-from`. `run-from` reads the first symbol, `"digit"`, and calls `find-transition` with state `"start"`; `find-transition` searches the table via `matches-transition?` and finds `["start" "digit" "invalid"]` — the automaton moves to `"invalid"` after only one symbol. `run-from` then reads the second symbol, `"letter"`, and calls `find-transition` again, this time with state `"invalid"`; the search finds `["invalid" "letter" "invalid"]` — the trap state's own self-loop — and the automaton stays exactly where it already was. `run-from` has consumed both symbols and returns `"invalid"` as the final state. `accepts?` hands that state to `is-accept-state?` against `["valid"]`; `"invalid"` is not `"valid"`, so the search returns `false`, and `accepts?` returns `false` — exactly `identifier [digit letter] => false`, shown above. The letter genuinely was read, genuinely caused a real transition, and still changed nothing about the outcome, because the single wrong symbol at the very start already committed the automaton to a state it can structurally never leave.

## What Breaks Without This

Remove the identifier automaton's own trap-state self-loop for `"letter"` — change `["invalid" "letter" "invalid"]` to instead route back to `"valid"`, as if a letter could "rescue" an already-failed identifier:

```clojure
(accepts? [["start" "letter" "valid"] ["start" "digit" "invalid"]
           ["valid" "letter" "valid"] ["valid" "digit" "valid"]
           ["invalid" "letter" "valid"] ["invalid" "digit" "invalid"]]
          "start" ["valid"] ["digit" "letter"])
```

Run this for real, this session, via `bb`:

```
true
```

`["digit" "letter"]` — the same input this lesson's own Connect the Pieces section just traced as a genuine rejection — now returns `true`: an identifier beginning with a digit is wrongly accepted, just because a letter happened to appear somewhere after it. No crash, no error, no warning — a single, quiet change to one transition silently broke the entire rule this automaton exists to enforce, and every part of the code that calls `accepts?` would have no way to detect it without independently already knowing the correct answer. The fix is to restore `["invalid" "letter" "invalid"]` exactly as it appeared in the Concept Unit above; the lesson this failure teaches is that a trap state's entire job is encoded purely in its own outgoing transitions — there is no separate "this state is a trap" flag anywhere in this lesson's data model, which makes the trap property easy to state in prose and just as easy to silently break with one wrong transition.

## Exercises

1. Design a third automaton, over the `0`/`1` alphabet, recognizing sequences with *at least two* `1`s total (any number of `0`s allowed anywhere). Decide how many states it needs, write out its transition table, and confirm it against at least four inputs of your own choosing via Lesson 254's own `accepts?`.
2. Use `complement-states` on the ends-in-1 automaton's own states and accept states from the first Concept Unit above. Predict, before running it, what language the resulting complemented automaton recognizes, in one plain-English sentence; then verify your prediction on at least three inputs.
3. Add a fourth state to the identifier automaton representing "must not start with an underscore either" (introduce a third input-symbol category, `"underscore"`, alongside `"letter"`/`"digit"`, and route it to the trap state exactly like `"digit"` does from `"start"`, but treat it like `"digit"` — legal, not trap-inducing — everywhere else). Write out the updated transition table and test it on at least three inputs.
4. In writing, explain why `complement-states` only ever needs an automaton's state list and current accept-states as input — never its transitions or start state — to correctly compute a complemented accept-state list.
5. Predict, before running it, what `(accepts? [["no" 0 "no"] ["no" 1 "yes"] ["yes" 0 "no"] ["yes" 1 "yes"]] "no" (complement-states ["no" "yes"] ["yes"] 0 []) [1 0])` returns, given that `[1 0]` was rejected by the *original* ends-in-1 automaton in this lesson's own first Concept Unit. Run it and confirm.

## Definition of Done

- [ ] The ends-in-1 automaton run on at least four inputs via `bb`, all matching the "last symbol is `1`" rule by direct inspection.
- [ ] `complement-states` run on the parity automaton's own states and accept-states, its output confirmed by direct inspection, and the complemented automaton run against at least three inputs shown to disagree with the original on every one.
- [ ] The identifier automaton run on at least four inputs via `bb`, all matching the "starts with a letter" rule by direct inspection.
- [ ] The trap state's own self-loop deliberately broken, the resulting silent misacceptance reproduced for real via `bb`, and the transition restored.
- [ ] A git commit made, with a message explaining *why*: for example, "Add Lesson 255: prove regularity by exhibiting witness automata, derive a complement automaton mechanically from an existing one, and connect the same machinery to real lexical analysis via a trap-state identifier check."
