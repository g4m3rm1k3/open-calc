# Lesson 2 — A Second Lesson, a Real Vector Diagram, and a Silent Bug Found in an Unrelated Course

This lesson adds `002-symmetric-encryption.js` to the same `cyber-lab-1`
chapter as Lesson 1, plus three new viz primitives
(`AESEncryptDemo.jsx`, `ECBPatternLeak.jsx`, `BlockCipherModeDiagram.jsx`)
and one Python notebook cell. As with Lesson 1, this document teaches the
*software engineering* behind what got built — the real Web Crypto APIs
used, a genuinely new rendering technique, and a bug this lesson's build
process surfaced in a completely unrelated, already-shipped course. It
does not re-teach what AES or ECB/CBC *are* — that content lives in the
lesson itself, for end users, not here.

---

## Concept Unit 1: Real Key Generation and Authenticated Encryption via Web Crypto

Lesson 1 used `crypto.subtle.digest` (hashing) and `crypto.subtle.deriveBits`
(PBKDF2). This lesson uses a different corner of the same real API:

```js
const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
const iv = crypto.getRandomValues(new Uint8Array(12))
const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext))
```

Three things worth naming explicitly, verified live in `AESEncryptDemo.jsx`:

- `generateKey`'s second argument (`extractable`, here `true`) and third
  argument (`keyUsages`, here `['encrypt', 'decrypt']`) are not
  boilerplate — they're a real capability restriction. A key generated
  with `keyUsages: ['encrypt']` only would throw if you tried to
  `decrypt` with it. This demo needs both because it demonstrates both
  directions with the same key.
- `crypto.getRandomValues` (not `Math.random()`) is what makes the IV
  cryptographically unpredictable — `Math.random()` is not
  cryptographically secure and must never generate anything
  security-relevant. This distinction is the entire content of one of
  this lesson's own end-user Concept Units (why a predictable IV leaks
  information), which makes it worth naming here too: the *implementation*
  has to get this right, not just the lesson's prose about it.
- `crypto.subtle.encrypt` with `{ name: 'AES-GCM' }` returns ciphertext
  with a 16-byte authentication tag already appended — there's no
  separate "tag" object to manage in the Web Crypto API's GCM mode
  (unlike the Python side, Concept Unit 5 below, where `encrypt_and_digest`
  returns them separately). Verified live: flipping `ciphertext[0]` before
  calling `decrypt` throws `OperationError` and returns nothing — not
  corrupted plaintext, an outright rejection, confirmed in this session
  by actually clicking the tamper button rather than assuming the API
  behaves this way from documentation alone.

---

## Concept Unit 2: Reproducing ECB With an API That Doesn't Expose ECB

The Web Crypto API deliberately does not implement raw AES-ECB — only
CBC, CTR, and GCM are exposed. `ECBPatternLeak.jsx` still needed genuine
ECB behavior to prove the lesson's point honestly (no simulated
cryptography, per the rule Lesson 1 established), which required a real
piece of applied math rather than a workaround:

CBC's definition for a single block is `C1 = AES_Encrypt(P1 XOR IV)`. If
`IV` is all zeros, that reduces to `C1 = AES_Encrypt(P1)` — which is
*exactly* what ECB does to every block, independently, with no chaining
at all. So calling `crypto.subtle.encrypt({ name: 'AES-CBC', iv: zero16 }, key, block)`
once per 16-byte block, discarding any state between calls, produces
byte-for-byte real ECB output using only a primitive the browser actually
exposes:

```js
async function ecbEncrypt(key, bytes) {
  const zeroIv = new Uint8Array(16)
  const blocks = await Promise.all(
    Array.from({ length: bytes.length / 16 }, (_, i) => {
      const chunk = bytes.slice(i * 16, i * 16 + 16)
      return crypto.subtle.encrypt({ name: 'AES-CBC', iv: zeroIv }, key, chunk)
    }),
  )
  const out = new Uint8Array(bytes.length)
  blocks.forEach((buf, i) => out.set(new Uint8Array(buf).slice(0, 16), i * 16))
  return out
}
```

The `.slice(0, 16)` is load-bearing, not cosmetic: Web Crypto's AES-CBC
always PKCS7-pads its input, appending a full extra 16-byte block even
when the input is already block-aligned (this disambiguates padding on
decrypt — without it, the decryptor couldn't tell real data from padding
bytes). A single 16-byte block in, 32 bytes out; discarding the second
16 bytes and keeping the first is what makes each independently-encrypted
chunk usable as a same-length pixel byte in the reconstructed image. This
was confirmed by checking output byte lengths directly during
development, not assumed from how PKCS7 padding is usually described.

---

## Concept Unit 3: Raw Pixel Bytes via Canvas `ImageData`

Every other viz component in this course renders numbers as text.
`ECBPatternLeak.jsx` is the first one to manipulate raw pixel bytes
directly:

```js
const imgData = ctx.createImageData(SIZE, SIZE)
for (let i = 0; i < bytes.length; i++) imgData.data[i] = bytes[i]
ctx.putImageData(imgData, 0, 0)
```

`ImageData.data` is a flat `Uint8ClampedArray` in `RGBA, RGBA, RGBA, ...`
order — four consecutive bytes per pixel. That byte layout is exactly why
the demo's synthetic test image is drawn at 32×32: `32 * 32 * 4 = 4096`
bytes, evenly divisible by AES's 16-byte block size with no partial block
and no padding math to reason about when slicing bytes back into pixels.

One real bug caught and fixed while building this: ciphertext bytes are
uniformly random, including whatever value lands in each pixel's alpha
(transparency) channel. Left alone, that means large parts of the
"encrypted" preview render as randomly, partially transparent — visually
confusing and not the point being demonstrated. The fix forces every 4th
byte (alpha) to `255` after encryption, before drawing:

```js
for (let i = 3; i < imgData.data.length; i += 4) imgData.data[i] = 255
```

This only touches the *rendering* copy — the actual encrypted bytes used
for the pattern-leak comparison are untouched; only the alpha channel of
what gets drawn to screen is overridden.

---

## Concept Unit 4: A Real `<svg>` Diagram, Not Styled Divs

Lesson 1's `RegistrationLoginFlow.jsx` is a static diagram built entirely
from `<div>`s and Tailwind classes — appropriate there, since it's just
two labeled boxes and an arrow-shaped Unicode character. `BlockCipherModeDiagram.jsx`
is this course's first component built from actual `<svg>` markup:
`<rect>`/`<text>` for blocks, `<line markerEnd="url(#arrowhead)">` for
directional arrows via a `<marker>` definition, and a hand-drawn XOR node
(a circle with a plus-sign cross) for the CBC diagram's chaining step.

The reason plain divs weren't enough here: CBC's diagram needs a
dashed feedback path curving from one column's output back into the
*next* column's input — an actual routed line with corners
(`<path d="M 80,207 H 160 V 76 H 190">`), not something CSS box layout
can express. This is the concrete case where SVG is the right tool
specifically because the content being shown *is* a wiring diagram, not
a stylistic upgrade applied everywhere by default — `ECBPatternLeak.jsx`
still correctly uses `<canvas>` for its pixel-data demo, because pixels
are exactly what canvas is for.

---

## Concept Unit 5: A Real, Verified Bug Found in an Unrelated, Already-Shipped Course

The Python cell for this lesson was first written using a top-level
`PythonNotebook: { cells: [...] }` field, copying the exact shape used by
an existing lesson elsewhere in the app
(`src/courses/applied-statistics/7-regression-analysis/003-correlation.js`).
Live testing (`/#/chapter/cyber-lab-1/symmetric-encryption`) showed
nothing rendered — no Python Lab section appeared at all, silently.

Reading `MicroCycleLesson.jsx` directly (not assuming from the existing
lesson's shape) showed the actual renderer reads `lesson.python` (or
`lesson.pythonLab` / `lesson.notebooks.python`), never a top-level
`lesson.PythonNotebook`. The capitalized key is only understood by the
lesson-*builder* tool (`builderUtils.js`), which normalizes it to
`python` internally when importing a lesson for editing — a conversion
that only happens inside the builder UI, never when a lesson page
renders directly.

This meant `003-correlation.js`'s Python notebook — real Pearson/Spearman
correlation code, present in the source file — has likely never rendered
on its own live lesson page, in production, the whole time it's existed.
Verified live, this session: navigating to
`/#/chapter/applied-statistics-7/correlation` shows no "Python Lab"
section and no trace of the cell's title text anywhere on the page. This
lesson's own `python:` field was renamed to match what the renderer
actually reads, and verified live afterward (see Definition of Done).
The pre-existing bug in `003-correlation.js` was **found, not fixed** —
fixing an unrelated, already-shipped course is out of scope for a Cyber
Lab lesson, and is being surfaced to the user directly rather than
silently patched.

---

## Concept Unit 6: Verifying a Package Exists Before Writing a Lesson Around It

Before writing the Python cell's content, this session needed to know
whether `pycryptodome` (a real, standard cryptography library) actually
installs and runs under Pyodide (the WebAssembly Python runtime this
app's notebooks use) — Pyodide has no AES support in its own standard
library, and `pycryptodome` has compiled C-extension internals, not pure
Python, so its availability wasn't something to assume.

This was checked directly, twice, using the `pyodide` npm package in a
plain Node script (no browser, no UI automation) — the same
verify-before-shipping discipline Lesson 1 applied to the MD5 collision
pair, applied here to a different kind of claim (package availability
rather than a cryptographic fact):

```js
import { loadPyodide } from "pyodide"
const pyodide = await loadPyodide()
await pyodide.loadPackage("micropip")
const micropip = pyodide.pyimport("micropip")
await micropip.install("pycryptodome")
// then: from Crypto.Cipher import AES ... AES.MODE_GCM ...
```

First confirmed real AES-ECB encryption worked; then, since GCM
specifically (with its `encrypt_and_digest`/`decrypt_and_verify` tamper
check) is what the lesson's Python cell actually teaches, a second,
separate check confirmed GCM's tamper detection specifically —
`decrypt_and_verify` on a deliberately corrupted ciphertext raised
`ValueError: MAC check failed`, live, before that exact behavior was
written into the lesson's Python cell as a claim. Both scripts are kept
in `scripts/` rather than deleted, per this session's explicit
correction on scratch-file deletion (see below).

---

## Concept Unit 7: A Real Bug the User Found Live That My Own Verification Missed

Concept Unit 6's standalone Node script proved `pycryptodome` installs and
runs under Pyodide *in general* — but "proved it works in an isolated
script" and "proved it works in this app's actual notebook" are two
different claims, and only the first one had actually been checked before
shipping. The user ran the real lesson cell in the real app and hit:

```
ModuleNotFoundError: No module named 'micropip'
The module 'micropip' is included in the Pyodide distribution, but it is not installed.
```

The root cause: this app's shared notebook host,
`src/components/notebooks/PythonNotebook.jsx`, initializes its own
Pyodide instance with its own specific `loadPackage([...])` call —
`numpy`, `pandas`, `matplotlib`, `scikit-learn`, `scipy`, `statsmodels`,
`sqlite3`, `sympy` — and, until this fix, **not `micropip`**. The
existing code even carried a confidently-worded but false comment: "Small
ones like micropip are core and don't need explicit loadPackage usually."
My Concept Unit 6 verification script called
`await pyodide.loadPackage("micropip")` itself, explicitly, before
importing it — so it never actually tested the claim that comment was
making; it just happened to route around the exact gap that comment got
wrong, without me noticing the two setups didn't match.

**Fixed** in `PythonNotebook.jsx` by adding `"micropip"` to the shared
preload list — a one-line change with app-wide effect: any lesson's
Python cell that ever needs `micropip.install(...)` for a package not
already bundled now works, not just this one. Verified live, after the
fix, by actually clicking "▶ Run" on this lesson's real cell in the
running app (not re-running the isolated Node script) and confirming the
exact expected output — including the tamper-rejection line — appeared
in the notebook's real output area.

**The actual lesson here, for future verification:** confirming a
capability in a clean, standalone script only proves it's possible in
general. If the real thing that will run it (a specific shared component,
with its own specific init sequence) hasn't been exercised directly, that
specific integration is still an assumption, not a verified fact — exactly
the gap between "I tested that AES-GCM decrypts a tampered message
correctly" and "I tested that *this lesson's actual Run button* does."

---

## Addendum: A Second Python Cell, No New Pattern

A follow-up request asked for more Python content in this lesson too. A
second cell (`py2`) was added to the same `python.cells` array —
`AES.MODE_ECB` and `AES.MODE_CBC` from `pycryptodome`, encrypting a
plaintext built from three identical 16-byte blocks and printing each
mode's ciphertext blocks as hex, so the same "identical plaintext blocks
→ identical ciphertext blocks under ECB, not under CBC" fact
`ECBPatternLeak.jsx` shows visually gets reproduced as plain hex from the
Python side. This uses exactly the same `python.cells[]` shape and the
same `micropip.install("pycryptodome")` pattern the first cell (and
Concept Units 6–7) already established — nothing new to teach about the
mechanism itself. A new challenge (`cyber-lab-1-002-ch4`) asks the
learner to break the three-identical-blocks setup on purpose and predict
what changes (only ECB's output, not CBC's) — verified live, both before
and after that edit, before being written into the lesson.

---

## A Note on What's Deliberately Not Its Own Unit

Per the Repetition Rule, the following reuse patterns Lesson 1 already
established, unchanged, and are deliberately not re-taught here:

- The `{ params = {} }` contract all three new viz components accept,
  and `VizFrame.jsx`'s `import.meta.glob` auto-discovery of them — same
  mechanism, same file location (`src/courses/cyber-lab/viz/`).
- `challenges: [...]` (click-to-reveal walkthrough) and
  `assessment: { questions: [...] }` — same shape, same renderer.
- `hook: { question, realWorldContext }` — same object shape Lesson 1's
  `ensureHook` fix made mandatory app-wide.
- `topicGroups.js` curation — this lesson lives inside an existing
  course/chapter already listed there; no new entry was needed (unlike
  Lesson 1's own course-level addition, and its Addendum's second
  cross-listing under Programming → Web Development).

---

## What Breaks Without This

Verified live, this session: without the `.slice(0, 16)` fix in
`ecbEncrypt`, each block's output would be 32 bytes instead of 16,
misaligning every subsequent pixel by 16 extra bytes and rendering
visible diagonal tearing instead of a clean side-by-side comparison —
this was seen directly while developing the component, before the slice
was added. Without forcing the alpha channel to 255, the "encrypted"
preview images render with random, distracting transparency instead of a
clean noise pattern — also seen directly, not assumed. Without renaming
`PythonNotebook` to `python`, this lesson's own Python cell would have
shipped exactly as invisible as `003-correlation.js`'s already is —
confirmed by testing this lesson's page in the same broken state first,
before the fix. Without adding `"micropip"` to `PythonNotebook.jsx`'s
preload list, the cell's very first line (`import micropip`) throws
`ModuleNotFoundError` in the real app — this exact failure shipped
initially and was caught live by the user running the actual cell, not
by any verification step performed before shipping (see Concept Unit 7).

## Exercises

- Open `/#/chapter/applied-statistics-7/correlation` yourself and
  confirm no Python Lab section renders — then find the
  `PythonNotebook:` field in that lesson's source and identify why,
  citing `builderUtils.js`'s normalization step.
- Remove the `.slice(0, 16)` from `ecbEncrypt` and re-run the ECB demo.
  Explain the visual artifact that appears and why, in terms of byte
  alignment.
- Change `AESEncryptDemo`'s tamper line from `tampered[0] ^= 0xff` to
  flipping a byte inside the auth tag instead of the ciphertext body
  (the last 16 bytes). Confirm decryption still fails — explain why GCM
  protects the tag's own integrity too, not just the ciphertext's.

## Definition of Done

- [x] `002-symmetric-encryption.js` renders at
      `/#/chapter/cyber-lab-1/symmetric-encryption` with all three new
      viz components, 3 challenges, and a 4-question quiz — verified
      live
- [x] `AESEncryptDemo`: encrypt, decrypt (matches original), and
      tamper-then-decrypt (rejected with a real GCM auth error) all
      verified live via actual button clicks, not assumed from reading
      the code
- [x] `ECBPatternLeak`: real AES-ECB (via the CBC/zero-IV equivalence)
      and real AES-CBC both run against the same synthetic striped
      image; ECB visibly preserves the stripe pattern, CBC does not —
      verified live
- [x] `BlockCipherModeDiagram` toggles between a real `<svg>` ECB
      diagram and a real `<svg>` CBC diagram with a routed dashed
      feedback path
- [x] The lesson's `python:` field (not `PythonNotebook:`) renders a
      real pycryptodome AES-256-GCM cell in the notebook, verified live
      — encrypt, decrypt, and a tampered `decrypt_and_verify` raising a
      real `ValueError`
- [x] `PythonNotebook.jsx`'s shared preload list includes `"micropip"`;
      the lesson's cell was re-verified live, via an actual click on its
      real "▶ Run" button in the running app, after this fix (not just
      via the standalone Node script from Concept Unit 6)
- [x] The second Python cell (`py2`, real AES-ECB vs. AES-CBC hex
      comparison) runs live with no errors, and its "All identical?"
      output matches what the JavaScript `ECBPatternLeak` demo shows
      visually — verified by actually clicking "▶ Run" on it
- [ ] You can explain, without notes, why `crypto.subtle.encrypt({name:'AES-CBC', iv: zero16}, key, oneBlock)`
      is mathematically identical to raw ECB block encryption
- [ ] You can explain why `003-correlation.js`'s existing Python
      notebook cell doesn't currently render on its own lesson page,
      and what the fix would be (out of scope for this lesson, but
      real)
- [ ] You can explain why Concept Unit 6's Node-script verification
      didn't actually catch the `micropip` bug, even though it tested
      the same library — what specifically was different between that
      script and the real app's notebook
- [ ] `git commit` with a message explaining why — for example: "Add
      Cyber Lab lesson 2 (symmetric encryption / AES) with three new
      viz primitives (real Web Crypto AES-GCM, a real ECB-vs-CBC
      pattern-leak demo, and a real SVG mode-of-operation diagram) plus
      a verified pycryptodome Python notebook cell; found (not fixed) a
      pre-existing bug where `PythonNotebook:`-keyed lessons never
      render their notebook outside the lesson builder; fixed a real,
      user-caught bug where `PythonNotebook.jsx` never preloaded
      `micropip`, breaking `import micropip` in any cell needing it"
