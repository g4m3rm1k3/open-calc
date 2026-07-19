# Lesson 1 — A New Course, Six Real Primitives, and Three Bugs Caught Building Them

## What You Will Build

The first Cyber Lab lesson: "What Is Hashing?" — a real course
(`src/courses/cyber-lab/`) teaching password hashing through six
independently-reusable interactive components, not prose describing
what hashing does. Every hash, every collision, every cracked password
in this lesson is a real, live computation — nothing is simulated,
including the one thing that's genuinely hard to fake honestly: why
password hashing costs more than a plain hash.

## What You Need to Know First

`lab-registry-autofind/01-...md` and `02-...md` — assumed fresh:
`import.meta.glob`-based auto-discovery, and the tradeoff between
eager and lazy registration. This lesson applies the exact same idea
to a different registry (courses, not labs) and extends it with one
genuinely new piece: the `{ params, onParamChange }` contract every
embeddable viz component has to follow.

---

## The Lesson

### Where You're Working

A new course: `src/courses/cyber-lab/meta.json` (course identity),
`src/courses/cyber-lab/1-cryptography-fundamentals/001-what-is-hashing.js`
(the lesson content), and six new files in
`src/courses/cyber-lab/viz/` — `HashOutput.jsx`, `AvalancheDiff.jsx`,
`DictionaryAttack.jsx`, `CollisionDemo.jsx`, `RegistrationLoginFlow.jsx`,
`PBKDF2CostDemo.jsx`. One new dependency: `js-md5` (Web Crypto's
`SubtleCrypto` doesn't implement MD5 — deprecated for security use, so
a real MD5 needs a real library). One fix to shared infrastructure:
`src/engines/lesson/enhancers/unifiedLessonEnhancer.js`. One addition
to `src/data/topicGroups.js`, the hand-curated home-page browsing map.

### Concept Unit: A Second Registry, the Same Glob Pattern — Plus One New Contract

#### The Problem

`lab-registry-autofind/01-...md` already proved `import.meta.glob` as
this app's answer to "adding something shouldn't mean editing a central
file." Courses turn out to use the exact same idea
(`src/courses/courseLoader.js`'s `import.meta.glob('./*/*/*.js')` for
lessons, `import.meta.glob('./*/meta.json', {eager:true})` for course
identity, and `VizFrame.jsx`'s own glob for interactive components) —
but a viz component isn't a free-standing React component the way a
lab is. It has to accept a specific shape of props to actually receive
the lesson's configured starting values.

#### Introduce the Concept in Isolation

```js
// How VizFrame actually renders whatever component a lesson references:
<VizComponent key={pinId} params={params} onParamChange={setParams} />
```

Confirmed by reading `VizFrame.jsx` directly (not assumed): every viz
receives exactly one meaningful prop, `params` — an object seeded from
the lesson's own `visualizations[].props` field — plus a setter,
`onParamChange`, for components that need their state to survive a
fullscreen expand/collapse remount.

```js
export default function HashOutput({ params = {} }) {
  const [text, setText] = useState(params.text ?? 'password123')
  const [algorithm, setAlgorithm] = useState(params.algorithm ?? 'SHA-256')
  // ...
}
```

**What this proves:** `params` supplies *starting* values only —
`{ text: 'password123', algorithm: 'SHA-256' }` from the lesson's
`props: { text: 'password123', algorithm: 'SHA-256' }` field seeds the
component's own `useState`, but every keystroke after that is purely
local React state, never round-tripped back through `onParamChange` —
these six components never call it at all, since none of them need to
survive the fullscreen-expand remount with different values than they
started with.

#### Discard the Throwaway Example

#### Project Change

- **Files:** all six `src/courses/cyber-lab/viz/*.jsx` files
- **Change type:** add
- **Dependencies:** none new beyond the pattern itself

#### The New Code

```js
export default function DictionaryAttack({ params = {} }) {
  const target = params.target ?? 'football'
  const demoSalt = params.salt ?? 'x7q2f9'
  // ...
}
```

#### The Updated Project

(Six files following this identical shape — shown in full in the real
source files; the pattern, not each file's UI logic, is this unit's
subject.)

#### Mechanical Walkthrough

`params = {}` as a default parameter — established JS, not new — means
a component embedded with no `props` field at all in the lesson (three
of these six are, deliberately, since `RegistrationLoginFlow` and
`CollisionDemo` need no starting values, and one lesson's `assessment`
doesn't touch this at all) never has to null-check `params` itself.
`params.text ?? 'password123'` — established `??` — supplies a
sensible default whenever the lesson didn't configure that specific
field, letting each component be embedded either bare (`{ id: 'HashOutput' }`)
or pre-configured (`{ id: 'HashOutput', props: { text: 'letmein' } }`)
without the component's own code needing to change either way.

#### CS Lens

A component reading its configuration from a single passed-in object
rather than many individually-named props is dependency injection in
miniature — the caller decides what configuration to hand over, the
component decides how to interpret it, and neither has to agree on
every possible field up front. **Recognized in:** any plugin system
where a host application passes a single `config` object to a
third-party module rather than a long, ever-growing parameter list.

#### SE Lens

The alternative — `VizFrame` inspecting each component's expected props
and spreading them individually (`<VizComponent text={params.text}
algorithm={params.algorithm} />`) — would require `VizFrame` itself to
know the full prop shape of every registered viz, which defeats the
entire point of an auto-discovered registry: `VizFrame` genuinely has
no idea what `DictionaryAttack` needs versus what `CollisionDemo`
needs, and shouldn't have to. One generic `params` object, interpreted
entirely inside each component, is what makes the registry able to
hold arbitrarily different components without a central file knowing
anything about any of them.

#### Connect to What Came Before

`lab-registry-autofind/01-...md` established *discovery* — how a new
file becomes reachable with zero central edits. This unit is the
matching *interface* contract that makes discovery actually usable:
being found is one problem, being configurable by whoever found you is
a second, separate one.

---

### Concept Unit: Real Web Crypto, and What "Real" Actually Requires

#### The Problem

Teaching "why does password hashing cost more" honestly — per explicit
correction during planning — means not faking a delay. The browser has
to actually do slow, real work, and the lesson has to be honest about
which parts of that work are genuinely equivalent to bcrypt/scrypt/
Argon2 and which parts are a real-but-partial stand-in.

#### Introduce the Concept in Isolation

```js
// Real SHA-256, via the browser's own crypto API — no library needed.
async function sha256(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

// Real PBKDF2 — genuinely slow at a high iteration count, timed for real.
async function pbkdf2(password, salt, iterations) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations },
    keyMaterial, 256,
  )
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('')
}
```

Run, real output (verified this session, against the actual lesson's
`PBKDF2CostDemo`, not a synthetic test): at 10,000 iterations, key
derivation completed in a handful of milliseconds; dragging the
iteration slider up produced a measurably larger, real elapsed time on
every re-run — the exact honest tradeoff the plan called for, with
zero artificial `setTimeout` anywhere in the code path.

**What this proves:** `crypto.subtle.digest` and `crypto.subtle.deriveBits`
are real, browser-native, standardized cryptographic primitives — not
a demo shim. `importKey` first turns a raw password string into a
`CryptoKey` object PBKDF2 can consume; `deriveBits` then runs the
actual repeated-hashing algorithm the requested number of times before
resolving. The `await` on each step is not decorative — real,
CPU-bound work is happening between them.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/courses/cyber-lab/viz/PBKDF2CostDemo.jsx`
- **Change type:** add
- **Dependencies:** none beyond Web Crypto itself (built into every
  modern browser, no library needed for this specific piece)

#### The New Code

(Shown in full above — this unit's isolated lab *is* the real
production code, unlike most concept labs in this curriculum, because
there's no simpler toy version of "await a real slow browser API" that
would teach the concept better than the real API itself.)

#### The Updated Project

(The real file — no further changes needed beyond what's shown above.)

#### Mechanical Walkthrough

`crypto.subtle` — the `SubtleCrypto` interface, part of the Web
Crypto API every modern browser ships. `digest(algorithm, data)`
returns a Promise resolving to an `ArrayBuffer` — raw bytes, not a
string, which is why every hash function in this lesson ends with the
same hex-formatting line (`[...new Uint8Array(buf)].map(b =>
b.toString(16).padStart(2,'0')).join('')`) — converting raw bytes into
the familiar hex string representation is a separate step from
computing the hash itself. `deriveBits` with `{name:'PBKDF2', hash,
salt, iterations}` is the same underlying idea as `digest`, just
repeated internally the requested number of times before returning —
which is the entire mechanism bcrypt/scrypt/Argon2 build further on
top of, by also demanding memory, not just repetition.

#### CS Lens

Deliberately making a computation expensive on purpose — not as a bug,
as the actual design goal — is a real, named idea:
**proof-of-work**-style cost functions, used the same way in
password hashing (cost the *attacker* time per guess) and in systems
like early spam-filtering (cost a *sender* CPU time per email, making
mass-spam economically unviable) and blockchain mining (cost a miner
real computation to add a block). **Recognized in:** any system where
"slow, on purpose" is the actual security property, not a performance
defect to optimize away.

#### SE Lens

Simulating bcrypt's cost with a `setTimeout` delay (the original,
rejected design) would have been strictly *easier* to build — no real
cryptography needed, any arbitrary number could be dialed in. It was
rejected because a fake delay teaches nothing about *why* the cost
exists; a learner dragging a slider that fakes slowness cannot
distinguish that from a progress bar. Real PBKDF2, genuinely timed,
teaches the actual mechanism (repeated internal hashing) at the cost of
being honest that it's a *real but partial* stand-in — flagged
explicitly in the lesson's own prose — for what bcrypt/scrypt/Argon2
add on top (memory-hardness), rather than silently implying the demo
*is* bcrypt.

#### Connect to What Came Before

Lesson content in this app has used LaTeX-rendered math and symbolic
computation extensively (the calculus/linear-algebra courses) but
never, before this lesson, a browser cryptography API. This is the
first appearance of `crypto.subtle` anywhere in this codebase's lesson
content.

---

### Concept Unit: A String Spread Into an Object Isn't What It Looks Like

#### The Problem

Building this lesson's `hook` field surfaced a real, currently-live bug
affecting 114 existing lesson files across this entire app (confirmed
by `grep`) — not something introduced by this lesson, something this
lesson's own verification process happened to catch.

#### Introduce the Concept in Isolation

```js
const aString = 'password'
console.log({ ...aString })
```

Run, real output:
```
{ '0': 'p', '1': 'a', '2': 's', '3': 's', '4': 'w', '5': 'o', '6': 'r', '7': 'd' }
```

**What this proves:** the spread operator (`...`) works on any
*iterable*, and a string is iterable character-by-character — so
`{...aString}` doesn't produce an object holding the string; it
produces an object with one numeric key per character. This is exactly
what `src/engines/lesson/enhancers/unifiedLessonEnhancer.js`'s
`ensureHook(lesson)` function was doing: `{ ...(lesson.hook ?? {}) }`,
assuming `lesson.hook` was always an object — true for 861 lessons in
this app, silently wrong for 114 others (`grep -rl "hook: \`"
src/courses` — confirmed count) that used a plain template-string
`hook` instead of the documented `{question, realWorldContext}` shape.
The resulting character-indexed object has neither a `.question` nor a
`.realWorldContext` property, so both of `ensureHook`'s fallback checks
fired, silently replacing every one of those 114 lessons' real,
hand-written hook text with generic filler — verified live, this
session, against the actual shipped `git` course
(`git-1/the-save-problem`), whose real three-hours-of-lost-work hook
paragraph was never once shown to a real user before this fix.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/engines/lesson/enhancers/unifiedLessonEnhancer.js`
- **Change type:** fix
- **Dependencies:** none

#### The New Code

```js
function ensureHook(lesson, topicMessage) {
  const rawHook = lesson.hook;
  const hook =
    typeof rawHook === "string"
      ? { realWorldContext: rawHook }
      : { ...(rawHook ?? {}) };

  if (!hook.question || !String(hook.question).trim()) {
    hook.question = `Why does ${lesson.title ?? "this concept"} matter when solving real problems?`;
  }
  // ...unchanged from here
}
```

#### The Updated Project

(Shown above — the rest of `ensureHook` is unchanged; only the input
normalization at the top changed.)

Real output after the fix, verified live against the shipped git
lesson: its real hook text ("You spent three hours getting a feature
working...") now renders; before the fix, only the generic
calculus-flavored filler sentence appeared in its place.

#### Mechanical Walkthrough

`typeof rawHook === "string"` — a runtime type check distinguishing
the two shapes this field can legally have (a bare string, or the
documented object) before doing anything else with it. Routing a
string into `{ realWorldContext: rawHook }` — a plain object literal,
not a spread — means the *entire* string becomes the readable prose
body, deliberately, rather than being silently discarded by a spread
that was never going to do anything useful with a string in the first
place.

#### CS Lens

This is a duck-typing failure: code that assumed one shape ("this is
always an object") without checking, run against a value with a
different, unexpected shape. JavaScript didn't throw an error — spread
on a string is perfectly legal, just not doing what the author of
`ensureHook` assumed — which is exactly why this class of bug is
dangerous: it doesn't crash, it silently produces a *plausible-looking*
wrong result. **Recognized in:** any dynamically-typed language's
"works on the happy path, silently wrong on an edge case nobody wrote a
test for" bug class — the same reason libraries like TypeScript's
strict mode or PropTypes exist, to catch exactly this kind of shape
mismatch before runtime.

#### SE Lens

The alternative fix — going through and rewriting all 114 affected
lesson files to use the `{question, realWorldContext}` object format
instead — would also work, and arguably is the more "correct" long-term
state (matching the documented, dominant convention). It's a much
larger, separate undertaking (114 files) than what this lesson's scope
called for. Fixing `ensureHook` itself once is the smaller, safer,
immediately-effective change: every one of those 114 lessons' real
hook text is now shown correctly, with zero risk to the 861 lessons
already using the correct format (the fix only changes behavior for
the `typeof === "string"` branch, which was previously producing
broken output unconditionally).

#### Connect to What Came Before

This is the third real bug this curriculum's own "verify live, don't
assume" discipline has caught mid-lesson (after `canvas-notes-lab`'s
`loadFromJSON`-as-callback mistake and `FloatingWindow`'s
never-clamped initial size) — each one invisible from reading the code
alone, each one only surfacing because a real lesson was actually
opened in a real browser and checked against real output before being
called finished.

---

### Concept Unit: A Real Attack, Animated — and a Cancellation Flag That Didn't Actually Cancel Anything

#### The Problem

Per explicit direction during planning, the dictionary attack in
`DictionaryAttack.jsx` isn't allowed to be "click a button, instantly
see the answer" — it has to visibly step through the wordlist one
guess at a time, computing each guess's real hash as it goes. The
first version of this shipped with a `cancelRef` flag, checked inside
the loop, that looked exactly like the established
"cooperative cancellation" pattern — and did nothing. Nothing in the
file ever set it to `true`. It was declared, reset, and checked, and
that's all — dead code that happened to look correct.

#### Introduce the Concept in Isolation

```js
let cancelled = false

async function countSlowly() {
  for (let i = 1; i <= 5; i++) {
    if (cancelled) { console.log('stopped early at', i); return }
    console.log('step', i)
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  console.log('done')
}

countSlowly()
setTimeout(() => { cancelled = true }, 450) // cancel partway through
```

Run, real output:
```
step 1
step 2
step 3
stopped early at 4
```

**What this proves:** an `async` function with a `for` loop containing
`await` runs strictly one iteration at a time — `step 2` never logs
before `step 1`'s full 200ms pause has elapsed, unlike, say,
`Promise.all` firing several promises at once. Checking a plain
variable (`cancelled`) at the *top* of each iteration, set from
*outside* the loop by an unrelated `setTimeout`, is enough to stop a
running loop early — no special cancellation API needed, just a shared
flag both sides can see.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/courses/cyber-lab/viz/DictionaryAttack.jsx`
- **Change type:** add
- **Dependencies:** the previous units' `sha256` helper

#### The New Code

```js
const cancelRef = useRef(false)

const runAttack = async () => {
  setRunning(true)
  setResult(null)
  cancelRef.current = false

  const real = await sha256(salted ? demoSalt + target : target)

  for (let i = 0; i < WORDLIST.length; i++) {
    if (cancelRef.current) return
    setCurrentIndex(i)
    const guessHash = await sha256(WORDLIST[i])
    await new Promise((resolve) => setTimeout(resolve, 220))
    if (guessHash === real) {
      setResult({ found: true, word: WORDLIST[i], hash: guessHash })
      setRunning(false)
      return
    }
  }
  setResult({ found: false })
  setRunning(false)
}
```

#### The Updated Project

The loop shown above was the entire first version — and it's
genuinely incomplete: nothing in the file ever set `cancelRef.current`
to anything but `false`. The button rendered below it is
`disabled={running}`, which already stops a user from ever clicking
"Run" a second time while one is in progress — so the scenario
`cancelRef` looked like it was guarding against (two overlapping
clicks) was never actually reachable through the UI at all. The real
gap: nothing protected against the component being *unmounted* — the
lesson navigated away from, the viz removed from the page — while
`runAttack`'s loop was still mid-`await`. The fix gives `cancelRef` an
actual job:

```js
useEffect(() => {
  return () => {
    cancelRef.current = true
  }
}, [])
```

Real output, verified live this session: starting an attack, then
navigating away from the lesson entirely before it finished, produced
zero unmount-related console warnings with this effect in place.

#### Mechanical Walkthrough

`useRef(false)`, not `useState(false)`, for `cancelRef` — established
(`canvas-notes-lab/02-...md` used the same "ref, not state" reasoning
for `prevPageIdRef`) — checking a cancellation flag every loop
iteration must never itself trigger a re-render; it only needs to be
*read*, synchronously, at each iteration boundary. `if (cancelRef.current)
return` sits at the *top* of the loop body, before that iteration's
real work starts. The empty-dependency-array `useEffect`'s cleanup
function runs exactly once, when the component unmounts — that's the
*only* place `cancelRef.current` is ever set to `true`. Resetting it to
`false` at the top of every `runAttack` call still matters, but for a
narrower reason than originally written: it's what lets the *same*
mounted component run a fresh attack after a previous one already
finished normally, without the ref being stuck at whatever it was left
at.

#### CS Lens

A shared flag, checked cooperatively by a running task rather than the
task being forcibly killed from outside, is **cooperative
cancellation** — the running code decides when it's safe to stop, at
points it chooses, instead of being interrupted mid-instruction.
**Recognized in:** the browser's own `AbortController`/`AbortSignal`
(a `fetch` request checks `signal.aborted` at safe points, not force-
terminated instantly); Java/C# thread interrupt flags (`Thread.interrupted()`,
checked by the running thread itself); any long-running script that
polls a "should I keep going?" flag instead of assuming it will run to
completion uninterrupted. A flag that's checked but never set is the
same shape as a guard clause that never fires — syntactically
complete, semantically inert.

#### SE Lens

The alternative — deleting `cancelRef` entirely, since `disabled={running}`
already prevents the double-click scenario the original comment
described — was seriously worth considering, and was rejected only
because a real, different failure remained: an unmounted-component
state update is a genuine React footgun (a wasted, and in some cases
warned-about, update to a component that no longer exists), not a
hypothetical. Keeping `cancelRef` and actually wiring it to the one
real trigger it needed (unmount) was smaller and more honest than
either leaving it as decoration or removing a real safety mechanism
along with the fake one.

#### Connect to What Came Before

Lesson 2 of `canvas-notes-lab` used a `cancelled` flag closed over by
an effect to stop a stale async page-load from overwriting a newer
one — cancel-on-unmount, the same trigger this fix uses. The original,
incomplete version of this file described a *different* trigger
(cancel-on-second-click) that was not only unimplemented, it was
already unreachable for an unrelated reason (the disabled button). The
lesson here isn't just "wire up the flag" — it's that a concept lab
proving a pattern works in isolation (this unit's `countSlowly()`
demo, which genuinely does cancel correctly) does not, by itself, prove
the *production* code actually connected that pattern to a real
trigger. That connection has to be checked on its own.

---

### Concept Unit: Verifying a Claim Computationally Before Shipping It

#### The Problem

`CollisionDemo.jsx` hardcodes two 128-byte hex messages and asserts, in
the UI itself, that they produce the same MD5 hash — real proof, not a
description. That claim came from memory of a famous 2004 result, and
memory of exact byte sequences is not a reliable source for something
a teaching tool is about to assert as true to a learner.

#### Introduce the Concept in Isolation

This is the one concept unit in this lesson whose "isolated lab" is
not a toy — it's the literal, unedited sequence of real commands run
this session, because the concept itself is *"don't trust unverified
recall — check."*

```
$ node -e "... hash the two messages I recalled from memory ..."
MD5(1): 79054025255fb1a26e4bc422aef54eb4
MD5(2): 7dc75a6b66c3c61b1e3caa74121e3c46
COLLIDE: false
```

The two hashes are different — the recalled bytes were wrong, and
would have shipped a "collision" demo that silently proved nothing.
After fetching the real published bytes (via `WebSearch` then
`WebFetch` against Wikipedia's MD5 article) and re-running the exact
same check:

```
MD5(1): 79054025255fb1a26e4bc422aef54eb4
MD5(2): 79054025255fb1a26e4bc422aef54eb4
COLLIDE: true
differing bytes: 6
```

**What this proves:** the *first* attempt looked just as plausible as
the second one until it was actually computed — nothing about staring
at 128 hex characters reveals whether they collide. Only running the
real hash function against them does. A claim about what two specific
byte sequences hash to is an empirical question with exactly one way
to answer it correctly: compute it.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/courses/cyber-lab/viz/CollisionDemo.jsx`
- **Change type:** add
- **Dependencies:** the verified-correct hex constants themselves

#### The New Code

```js
function hexToBytes(hex) {
  const bytes = []
  for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16))
  return bytes
}

function diffCount(hexA, hexB) {
  const a = hexToBytes(hexA)
  const b = hexToBytes(hexB)
  return a.filter((byte, i) => byte !== b[i]).length
}
```

#### The Updated Project

```js
useEffect(() => {
  setHashA(md5(hexToBytes(MESSAGE_A_HEX)))
  setHashB(md5(hexToBytes(MESSAGE_B_HEX)))
}, [])
```

The component recomputes both hashes live, in the learner's own
browser, every time this lesson loads — it never hardcodes the
*resulting* hash, only the two input messages, so what a learner sees
is `js-md5` actually agreeing with the verification already done this
session, not a pasted-in answer.

#### Mechanical Walkthrough

`hex.substr(i, 2)` steps through a hex string two characters at a
time — one byte is always exactly two hex digits — and
`parseInt(..., 16)` reads each pair as a base-16 number, rebuilding the
original byte array `js-md5` needs. `diffCount` zips the two byte
arrays together positionally (`.filter((byte, i) => byte !== b[i])`)
and counts mismatches — confirming, in the UI itself, the "6 bytes
differ" claim rather than just asserting it in prose.

#### CS Lens

Computing a hash and comparing it against an expected value, rather
than trusting that two things match because they look similar, is the
same operation a checksum or a test assertion performs: treat a belief
as a hypothesis, and get your answer from execution, not inspection.
**Recognized in:** a package manager verifying a downloaded file's
hash against its published checksum before trusting it; a unit test
asserting `actual === expected` instead of a comment claiming a
function "should" return the right thing; scientific replication —
rerunning someone else's stated result yourself before building on it.

#### SE Lens

Shipping the first, unverified recollection (rejected here) would have
cost nothing extra up front and produced a demo that *looks* identical
to the correct one — same layout, same two long hex blocks, same
"MD5(A)"/"MD5(B)" labels — right up until a learner actually read the
two output hashes and noticed they don't match, at which point the
entire lesson's central claim ("hashes are supposed to be one-way and
collision-resistant, except here's a real counterexample") would
appear simply broken, with no clue why. Verifying computationally
before shipping converts a silent, hard-to-diagnose correctness bug
into an immediately visible one, caught in minutes instead of by a
confused learner much later.

#### Connect to What Came Before

Every lesson in this curriculum has followed "real executed output,
not assumed output" as a discipline applied to *code* — does this
function actually do what the prose claims. This unit is the same
discipline applied one level up, to a *fact* being hardcoded into that
code — is this claimed historical result actually true — proving the
habit generalizes past "test your code" to "verify what you're about
to assert as true."

#### A Note on What's Deliberately Not Its Own Unit

Every remaining new file and code path in this diff, accounted for
explicitly rather than left silently uncovered, per the Repetition Rule:

- `AvalancheDiff.jsx`'s hex-digit diffing (`[...hash].map((ch, i) => ...)`
  with a conditional className per character) is the same
  `.map()`-with-conditional-styling shape `DictionaryAttack.jsx`'s
  wordlist rendering (this lesson, Unit 4) and `canvas-notes-lab`'s tab
  rendering already use.
- `HashOutput.jsx` and `AvalancheDiff.jsx` both wrap their hash
  computation in a `useEffect` with a local `cancelled` flag
  (`AvalancheDiff.jsx` additionally uses `Promise.all` to run two
  hashes concurrently rather than one) — the exact same
  effect-cancellation shape established in `canvas-notes-lab/02-...md`,
  applied here to a `.then()` chain instead of `async`/`await` syntax,
  and distinct from Unit 4's `cancelRef`-in-a-user-triggered-function
  variant (an effect cancels itself when its dependencies change; a ref
  here cancels a running loop when a button is clicked again — related
  ideas, two different triggers).
- `RegistrationLoginFlow.jsx` is a pure, stateless diagram — no hooks,
  no computation, plain JSX and Tailwind classes only. Nothing in it is
  new relative to any other static component already in this codebase.
- `001-what-is-hashing.js` (the lesson content object), `meta.json`,
  and the `topicGroups.js` insertion all populate already-documented
  data shapes (`{hook, intuition, rigor, challenges, assessment}`,
  `{icon, description, domain}`, and `{kind, key, differentiator}`
  respectively) with real content — new *data*, not a new *pattern* —
  matching entries already sitting in those exact files.
- `package.json`'s `js-md5` addition is a dependency install, already
  covered by Unit 2's explanation of why MD5 specifically needs a real
  library instead of `SubtleCrypto`.

---

## Connect the Pieces

`cyber-lab`'s course/lesson files are auto-discovered by the exact
`import.meta.glob` mechanism `lab-registry-autofind/01-...md` already
taught, applied to a second registry (`courseLoader.js`); its six
viz primitives are auto-discovered by `VizFrame.jsx`'s own glob, each
following the `{ params }` contract every registered viz must honor.
Each primitive performs genuinely real cryptographic work — SHA-256
and PBKDF2 via the browser's native Web Crypto API, MD5 via `js-md5`
(installed specifically because `SubtleCrypto` no longer implements
it), and a real, externally-verified 2004 MD5 collision pair (fetched
and computationally confirmed live this session, after an initial
attempt to recall it from memory produced two messages that did *not*
actually collide). The dictionary attack animates that same real
per-guess hashing one step at a time; its `cancelRef` originally
checked a flag nothing ever set, fixed to actually cancel the loop if
the component unmounts mid-run. Building and verifying this one lesson end-to-end surfaced and
fixed a real bug affecting 114 already-shipped lessons elsewhere in
this app, and required manually adding one entry to `topicGroups.js` —
confirming that entry-point discovery (`courseLoader.js`, fully
automatic) and browsing-page curation (`topicGroups.js`, deliberately
hand-maintained, per its own header comment) are two different,
independently-necessary layers, not one mechanism that made the other
redundant.

## What Breaks Without This

Verified live, this session: without the `ensureHook` fix, the git
course's real, hand-written hook paragraph is silently replaced by a
calculus-flavored generic sentence with no connection to the lesson's
actual subject — no error, no warning, a plausible-looking paragraph
sitting where a specific, carefully-written one should be. Without
manually adding an entry to `topicGroups.js`, `cyber-lab` remains
fully functional and directly linkable (Start Menu search finds it
correctly, confirmed live) but invisible from the home page's grouped
Explore browsing view — a real, if smaller, discoverability gap that
auto-discovery of the lesson *content* does not, by itself, close.
Without the unmount-cleanup fix, `cancelRef` is inert — declared,
reset, checked, never set — meaning navigating away from the lesson
while an attack is still animating leaves `runAttack`'s loop running
against an unmounted component. Verified live, this session, both
ways: with the fix, navigating away mid-attack produced zero
unmount-related console warnings; the reverse (confirming a warning
*without* the fix) was not separately reproduced, which is itself
worth naming rather than quietly skipping — the first version of this
lesson claimed a *different*, already-unreachable scenario (two clicks
racing, blocked by `disabled={running}`) was "reasoned through," which
turned out to be describing a bug that couldn't happen while missing
the one that could. Without verifying the MD5
collision pair computationally, the demo would have shipped showing
two different hashes side by side — the exact opposite of what "A Real
MD5 Collision" claims to prove, with no error to flag it — this one
*was* actually caught live, this session, exactly as narrated above.

## Addendum: One Curated Entry Wasn't Enough

A follow-up, live, after the lesson above was already considered done:
the course was reachable via direct URL and Start Menu search, and
*was* present on the home page's Explore view — but only under the
**Computer Science** top-level tab, in its **Security** subtopic. A
live click-through confirmed the entry renders correctly there. The
actual gap was navigational, not technical: someone looking for
security/cryptography content has no particular reason to expect it
filed under "Computer Science" rather than "Programming" — those read,
to a browsing user, as near-synonyms, and `topicGroups.js`'s own
top-level tabs treat them as two separate categories (Programming =
languages; Computer Science = DSA, logic, runtime, security).

This isn't a new pattern — it's the exact same `{kind, key,
differentiator}` entry insertion into a curated `items` array this
lesson's "Connect the Pieces" section already covered, applied a
second time to a different subtopic (`programming.web-development`
instead of `computer-science.security`). It's also the specific case
`topicGroups.js`'s own header comment names directly: this is a
*graph*, not a tree — the same course is meant to appear under every
subtopic it genuinely fits, not just the one it was first filed under,
precisely so a user browsing from a different, equally reasonable
starting point still finds it. `cyber-lab` now cross-lists under both
`computer-science.security` and `programming.web-development`, each
with its own differentiator text angled at that subtopic's framing
(general security concept vs. "the security half of web development"),
matching how `dsa-arrays-lab` already cross-lists under both `dsa` and
`python` with two different differentiator strings rather than one
reused verbatim.

**What breaks without this, verified live:** with only the
`computer-science.security` entry, clicking through Programming →
every one of its subtopics (Python, JavaScript, TypeScript, C++, Web
Development, Canvas & Graphics, Command Line & Git) never surfaces
`cyber-lab` — confirmed by the exact browsing path a user actually
took. Auto-discovery of the lesson *content* (`courseLoader.js`) has
no opinion about which curated tab a course sits under; that's
`topicGroups.js`'s job alone, and it only reflects entries someone
adds by hand.

## Addendum 2: A Second Language, and a Real Gap in Pyodide's `hashlib`

A follow-up request asked for more hands-on Python practice in this
lesson. Two cells were added under a new `python: { cells: [...] }`
field (the exact shape `002-symmetric-encryption.js` already
established — no new pattern here, per the Repetition Rule): one
hashing the same string with `hashlib.md5`/`sha1`/`sha256` so it can be
compared directly against the "Hash Anything" demo's JavaScript output,
and one computing real PBKDF2.

The one genuinely new thing found while building the second cell: this
app's Pyodide build's `hashlib` module has **no `pbkdf2_hmac`** —
`AttributeError: module 'hashlib' has no attribute 'pbkdf2_hmac'`,
confirmed live before it ever reached the lesson. CPython's real
`hashlib.pbkdf2_hmac` normally exists, but Pyodide's WebAssembly build
of `hashlib` doesn't include it — a real constraint of *this specific
runtime*, not of Python or PBKDF2 in general. The fix was to use
`pycryptodome`'s `Crypto.Protocol.KDF.PBKDF2` instead (already a
dependency of this course via `002-symmetric-encryption.js`'s AES
cells), verified with the same real, measured `time.perf_counter()`
timing this lesson's JavaScript demo already uses. A new challenge
(`cyber-lab-1-001-ch4`) asks the learner to run the hashing cell and
manually cross-check its output against the JavaScript demo above,
character for character — the same cross-language SHA-256 match
confirmed live while building this addendum
(`ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f` for
`"password123"`, identical in both the browser's Web Crypto output and
this new Python cell's output).

## Exercises

- Add a second lesson to `cyber-lab-1` (a new numbered file in the
  same chapter folder). Confirm it appears automatically in the
  chapter's lesson list with zero other changes — the same proof
  `lab-registry-autofind` already established for labs, now confirmed
  for courses too.
- Find one of the other 113 lessons still using a plain-string `hook`
  and confirm, live, that its real text now renders correctly after
  this session's fix.
- Remove the `useEffect` unmount-cleanup from `DictionaryAttack.jsx`,
  start an attack, then navigate away from the lesson before it
  finishes. Confirm a real console warning appears that didn't with
  the fix in place, then restore it.
- Before assuming `disabled={running}` actually blocks a second click,
  confirm it yourself: try to click "Run precomputed-table attack"
  again while an attack is mid-animation, and check whether `runAttack`
  fires a second time.

## Definition of Done

- [ ] `cyber-lab` course scaffolded (`meta.json`, `viz/`, first chapter
      folder) and its first lesson written using the real, rendered
      schema (`hook: {question, realWorldContext}`, not a plain string)
- [ ] Six viz primitives built, each following the `{ params = {} }`
      contract, each independently viz-registered
- [ ] Every hash, collision, and cost-factor demo uses real computation
      — `crypto.subtle.digest`/`deriveBits`, `js-md5` — verified live,
      this session, including a genuine MD5-colliding pair fetched and
      computationally confirmed, not recalled from memory and trusted
- [ ] `ensureHook`'s string-spread bug fixed; verified live against the
      real, previously-broken `git` course lesson
- [ ] `cyber-lab` added to `topicGroups.js` under Computer Science →
      Security; verified live, reachable both via direct URL/Start
      Menu search and via the home page's Explore browsing view
- [ ] `cyber-lab` cross-listed a second time under Programming → Web
      Development, with its own differentiator text; verified live by
      clicking through every Programming subtopic before the fix (not
      found) and after (found under Web Development)
- [ ] `DictionaryAttack`'s `cancelRef` actually gets set to `true`
      somewhere (the unmount-cleanup effect) — not just declared,
      reset, and checked with nothing ever triggering it
- [ ] You can explain, without notes, why the original "two clicks
      racing" scenario this file's comment described was already
      impossible (`disabled={running}`), and what the real risk was
      instead (an unmounted-component state update)
- [ ] The MD5 collision pair in `CollisionDemo.jsx` was verified
      computationally (both in Node and against the actual `js-md5`
      build the component uses) before being hardcoded — not shipped
      on recall alone
- [ ] You can explain, without notes, why `{...someString}` doesn't do
      what it looks like it should, and why that specific mistake is
      dangerous precisely because it doesn't throw
- [ ] Both new Python cells (hashlib cross-check, real PBKDF2 via
      pycryptodome) run live in the actual notebook with no errors —
      verified by actually clicking "▶ Run" on each, not assumed from a
      standalone script
- [ ] You can explain why Pyodide's `hashlib` is missing
      `pbkdf2_hmac` even though real CPython has it, and what was used
      instead
- [ ] `git commit` with a message explaining why — for example: "Add
      Cyber Lab's first lesson (password hashing) with six real,
      independently-reusable viz primitives — no simulated
      cryptography anywhere; fixed a real bug (string-spread into
      ensureHook) that was silently discarding 114 existing lessons'
      hand-written hooks app-wide"
