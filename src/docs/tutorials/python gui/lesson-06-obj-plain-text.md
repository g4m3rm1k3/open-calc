# Lesson 6: What an OBJ File Actually Is, Plain-Text and All

**What you will build:** a hand-written parser — no `THREE.Scene`, no
`THREE.Mesh`, not even `three` imported at all — that reads a real
`.obj` file byte-for-byte as plain text and pulls out its position,
color, and face data using nothing but Node's own file-reading and
string methods. The transferable problem this lesson is actually about:
Lesson 7 is going to hand this exact same kind of file to
`THREE.OBJLoader` and trust it completely — and trusting a black box is
only well-founded once you've confirmed, yourself, what's actually
inside it. This lesson exists so that trust is earned, not assumed:
by the end, you'll know precisely what `OBJLoader` is doing internally,
because you'll have done it yourself, by hand, first.

**What you need to know first:** Lesson 2 — the general idea that raw
vertex data is just numbers with a name given to them (`BufferAttribute`
wrapping a `Float32Array`). Lesson 5 — your own `save_vertex_colored_obj`
function's real, quoted source, specifically its `v` line format
(`v x y z r g b`) and its face-index convention.

**Terms used in this lesson**

- **Plain-text format** — a file format whose bytes, read directly,
  are human-readable characters (letters, digits, spaces, newlines) —
  as opposed to a **binary format**, whose bytes encode data in ways
  meaningless to open in a plain text editor (most image and compiled
  program formats). It matters here because it means an `.obj` file
  needs no special decoding step at all before a program can start
  making sense of it — `fs.readFileSync` (below) with a text encoding
  is the entire "parsing" step's first half, something a binary format
  like `.stl` (your own pipeline's *input* format, confirmed in your
  shared script's own `pyvista.read(path)` calls) would need
  meaningfully more work to even get this far with.
- **Line-oriented format** — a text format where each line, on its
  own, is one complete, self-contained piece of data — a `.obj` file's
  own real structure, confirmed below, where every line begins with a
  short marker (`v` for a vertex, `f` for a face) telling a reader what
  kind of data follows on that exact line, with no need to look at any
  other line to understand it.
- **Whitespace-delimited tokens** — individual pieces of data on a
  line, separated by spaces, with no other punctuation marking where
  one value ends and the next begins — confirmed below, splitting an
  `.obj` line on the single-space character is genuinely sufficient to
  recover every individual number on it.
- **1-based indexing** — counting starting from `1` rather than `0` —
  the convention `.obj` files use for referencing vertices from a face
  line, confirmed below, in genuine, direct contrast to JavaScript's own
  arrays, which — Lesson 1's own `scene.children[0]` check, and every
  array index used anywhere in this curriculum since — are always
  0-based.

**Objects and methods used**

- **`fs.readFileSync(path, encoding)`**
  - *What it is:* a Node.js built-in function that reads an entire
    file's contents into memory in one call, synchronously — not a
    Three.js API at all, the first non-Three.js tool this curriculum
    has needed.
  - *Implementation:* imported via `import * as fs from 'fs'`; called
    as `fs.readFileSync(path, 'utf-8')` — the second argument, a text
    **encoding** name, is what tells it to return a plain JavaScript
    string rather than raw, uninterpreted bytes.
  - *Its use:* this is the actual, literal first step of reading any
    `.obj` file — before any parsing logic can run, the file's raw
    contents have to exist in memory as something JavaScript can work
    with at all.
  - *Type:* a free function, part of Node's own built-in `fs`
    ("filesystem") module — not a class, not something `new` is ever
    called on.
  - *Responsibility:* opens the file at the given path, reads its
    entire contents, and returns them — as a plain string when a text
    encoding like `'utf-8'` is given, confirmed below by checking
    `typeof` the result.
  - *Depends on:* a real file existing at the given path; a real
    Node.js environment (this function doesn't exist in a browser at
    all — a real, important limit this lesson's own Commands section
    returns to).
  - *Connects to:* its return value is handed directly to
    `String.prototype.split` (below) to break it into individual lines
    — the very next step in this lesson's own real code.
  - *Shape:* confirmed below — a single plain string, its `.length`
    property counting characters (including every newline character in
    the file), not an object, array, or Buffer, specifically because a
    text encoding was given as the second argument.

- **`String.prototype.split(separator)`**
  - *What it is:* a JavaScript built-in method that breaks a string
    into an array of substrings, cutting at every occurrence of a given
    separator.
  - *Implementation:* `someString.split('\n')` splits at every newline
    character; `someString.split(' ')` splits at every single space
    character — both used in this lesson, for two different jobs
    (splitting a whole file into lines; splitting one line into
    tokens).
  - *Its use:* this is the actual mechanism behind both "line-oriented"
    and "whitespace-delimited" (both defined in Terms, above) —
    neither is a special `.obj`-specific parsing feature; both are this
    one ordinary, general-purpose string method, called with a
    different separator each time.
  - *Type:* an instance method on every JavaScript string.
  - *Responsibility:* returns a new array of substrings, in order, with
    the separator itself removed from every piece.
  - *Depends on:* a real string to call it on; a separator argument —
    confirmed below, an *empty* trailing piece is produced when the
    string ends with the separator itself (a file ending in a newline
    produces one empty final "line").
  - *Connects to:* called first on the whole file's text (splitting
    into lines), then called again, separately, on each individual line
    of interest (splitting into tokens) — the same method, two
    different scopes.
  - *Shape:* confirmed below — a real JavaScript array of strings, with
    `.length` reflecting the actual number of pieces produced,
    including any empty trailing piece.

- **`parseFloat(string)`**
  - *What it is:* a JavaScript built-in function converting a string
    that looks like a decimal number into an actual JavaScript number.
  - *Implementation:* `parseFloat('0.000000')` returns the number `0`,
    not the string `'0.000000'` — confirmed below via `typeof`.
  - *Its use:* every token pulled out of a `v` line by `.split(' ')` is
    still a string at that point (splitting a string produces more
    strings) — this is the one call that actually turns
    `'1.000000'` into the real number `1`, ready for the exact same use
    Lesson 2's own hand-typed `Float32Array` literals had.
  - *Type:* a free function, part of core JavaScript — not Node- or
    browser-specific, not attached to any class.
  - *Responsibility:* reads as much of the start of a string as looks
    like a valid decimal number and converts it; confirmed below to
    correctly handle a leading `-` sign, needed for this lesson's own
    sample file's negative vertex positions.
  - *Depends on:* a string argument that begins with something
    number-like — a string with no valid leading number produces the
    special value `NaN` ("Not a Number"), not used or tested directly
    in this lesson but worth naming as the real failure mode a more
    defensive parser (a real concern for Module B's later, robust
    file-upload handling) would need to check for.
  - *Connects to:* called once per numeric token on a `v` line, in this
    lesson's own real code, immediately after `.split(' ')` produces
    those tokens as strings.
  - *Shape:* returns a plain JavaScript number — confirmed below,
    genuinely `typeof 'number'`, not a string that merely looks
    numeric.

- **`parseInt(string, radix)`**
  - *What it is:* a JavaScript built-in function converting a string
    that looks like a whole number into an actual JavaScript integer.
  - *Implementation:* `parseInt('3', 10)` returns the number `3`; the
    second argument, `radix`, specifies the numeric base to interpret
    the string in — `10` for ordinary decimal, always given explicitly
    in this lesson's own code even though `10` also happens to be the
    default, because an omitted radix has real, documented historical
    surprises with strings that begin with `0` in some JavaScript
    environments, and being explicit costs nothing.
  - *Its use:* face-line tokens (`'1'`, `'2'`, `'3'`) are whole vertex
    references, not measurements with decimal places — `parseInt`,
    not `parseFloat`, is the correct tool specifically because these
    numbers are never meant to have a fractional part.
  - *Type:* a free function, part of core JavaScript.
  - *Responsibility:* reads as much of the start of a string as looks
    like a valid whole number, in the given base, and converts it.
  - *Depends on:* a string argument; a radix argument (given explicitly
    here, for the reason stated above).
  - *Connects to:* called once per token on a face line, in this
    lesson's own real code — its output is what this lesson's own third
    unit shows being used, correctly and incorrectly, to look values up
    in a JavaScript array.
  - *Shape:* returns a plain JavaScript integer.

---

## Concept Unit: A `.obj` File Is Just Text

### The Problem

Every geometry built so far in this curriculum was typed directly into
JavaScript source code — Lesson 1's `BoxGeometry`, Lesson 2's hand-typed
`Float32Array`. Your own real machining models don't arrive that way —
they arrive as files on disk, written by a wholly separate program (your
own Python script) in a format Three.js needs to *read*, not have typed
into it directly. Before trusting any tool to do that reading
automatically, the most basic possible question is worth answering
directly: what does an `.obj` file actually *contain*?

> **Stop and think first:** your own `save_vertex_colored_obj`
> function's real source, already shared and quoted in earlier lessons,
> writes its output using Python's ordinary `open(filename, 'w')` and
> `f.write(...)` — the exact same file-writing calls you'd use to write
> a `.txt` file full of English sentences, not any special
> "3D-file-writing" library call. Given that, what would you expect to
> see if you opened a real `.obj` file your script produced in an
> ordinary text editor — garbled binary data, or something you could
> actually read? What does that tell you about what kind of format this
> is, before you've looked at a single real line of one?

### Isolating `fs.readFileSync` and `.split('\n')`

```js
// throwaway-read-file.mjs
import * as fs from 'fs';

const text = fs.readFileSync('./triangle.obj', 'utf-8');

console.log('typeof text:', typeof text);
console.log('text.length (characters):', text.length);
console.log('--- raw text ---');
console.log(JSON.stringify(text));

const lines = text.split('\n');
console.log('lines.length (includes trailing empty string):', lines.length);
console.log('lines[0]:', JSON.stringify(lines[0]));
console.log('lines[3]:', JSON.stringify(lines[3]));
console.log('lines[4] (after trailing newline):', JSON.stringify(lines[4]));
```

Run against a real, actual `.obj` file — `triangle.obj`, built to match
your own `save_vertex_colored_obj` function's exact real output format
(quoted in full, this lesson's own Reference Source, below) for one
triangle:

```
v 0.000000 1.000000 0.000000 1.0000 0.0000 0.0000
v -1.000000 -1.000000 0.000000 0.0000 1.0000 0.0000
v 1.000000 -1.000000 0.000000 0.0000 0.0000 1.0000
f 1 2 3
```

Actually run, this session, in plain Node:

```
typeof text: string
text.length (characters): 161
--- raw text ---
"v 0.000000 1.000000 0.000000 1.0000 0.0000 0.0000\nv -1.000000 -1.000000 0.000000 0.0000 1.0000 0.0000\nv 1.000000 -1.000000 0.000000 0.0000 0.0000 1.0000\nf 1 2 3\n"
lines.length (includes trailing empty string): 5
lines[0]: "v 0.000000 1.000000 0.000000 1.0000 0.0000 0.0000"
lines[3]: "f 1 2 3"
lines[4]: ""
```

This is called **line-oriented, whitespace-delimited plain text**
(both defined in Terms, above). What it proves, directly answering the
Socratic question: `typeof text` reads `'string'` — genuinely ordinary
text, not a special binary object — and the raw `JSON.stringify` output
shows exactly four real `\n` newline characters, one per line, matching
what any text editor would show as four separate lines. The
`lines.length` of `5`, not `4`, for a file with four lines of actual
content is a real, concrete consequence of `.split('\n')`'s own
behavior confirmed in this lesson's own Header: a file ending in a
newline (the standard, correct way to end a text file, and exactly what
Python's own `f.write(f"...\n")` calls, quoted throughout your own
script, always produce) leaves one empty string after the final split
cut — real, harmless, but worth knowing about before writing a loop
over `lines` that assumes every entry is real content.

### Discarding the throwaway example

Deleted — never appears in the real project as its own separate file.
What it proved (a `.obj` file really is plain text; `.split('\n')`'s
real behavior on a trailing newline) is what the real code below
relies on.

### Project Change

- **Reference Source:** Your own `save_vertex_colored_obj` function
  (shared script), quoted in full: `for i in range(len(vertices)):
  f.write(f"v {vertices[i,0]:.6f} {vertices[i,1]:.6f}
  {vertices[i,2]:.6f} " f"{colors[i,0]:.4f} {colors[i,1]:.4f}
  {colors[i,2]:.4f}\n")`, followed by `for face in faces: f.write(f"f
  {face[0]} {face[1]} {face[2]}\n")`. This lesson's own `triangle.obj`
  sample file, quoted above, matches this exact real format
  byte-for-byte, for a minimal three-vertex, one-face case — it is a
  constructed example built to match your script's documented output,
  not a file your script actually produced this session (no real sample
  file has been provided yet — see this project's own `HANDOFF.md` for
  the standing request to get one before Lesson 7 tests `OBJLoader`
  against real output).
- **Files affected:** created —
  `lessons/lesson-06-obj-plain-text/triangle.obj` (the sample data
  file, not JavaScript), `lessons/lesson-06-obj-plain-text/parse.mjs`
  (this lesson's own real, runnable parser — a Node script, not a
  browser page; this lesson needs no `WebGLRenderer` at all, since
  nothing in it renders anything).
- **Change type:** add.
- **Location:** top of `parse.mjs`.
- **Dependencies:** Node's own built-in `fs` module — no `three`
  import anywhere in this lesson's own file.

### The New Code

```js
import * as fs from 'fs';

const text = fs.readFileSync('./triangle.obj', 'utf-8');
const lines = text.split('\n');
```

### The Updated Project

Nothing exists yet for this to sit inside — a brand-new file, per
Project Change above.

```
1  import * as fs from 'fs';
2
3  const text = fs.readFileSync('./triangle.obj', 'utf-8'); // ← new
4  const lines = text.split('\n');                            // ← new
```

`parse.mjs` now holds the entire real file's contents, split into five
real string entries (four lines of content, one trailing empty string,
confirmed above) — nothing has been interpreted yet; every line is
still just an undifferentiated string, whether it starts with `v`,
`f`, or is empty.

### Mechanical Walkthrough

- `import * as fs from 'fs'` — an **ES module import**, reappearing
  from Lesson 1, given full treatment there — this time pulling from
  `'fs'`, a Node built-in module name rather than a package like
  `'three'`, but the exact same import syntax and mechanism.
- `fs.readFileSync('./triangle.obj', 'utf-8')` — the function call
  (this lesson's own Header), given a relative file path and the
  `'utf-8'` **encoding** name (defined in this lesson's own Header
  entry) — confirmed above to return a real string, not a Buffer or
  other binary-oriented object.
- `text.split('\n')` — the method call (this lesson's own Header),
  splitting on the literal newline character — confirmed above to
  produce exactly one entry per line of content, plus one trailing
  empty entry from the file's own final newline.

### CS Lens

A format that can be inspected and understood by a human, using only
generic tools (a text editor, `cat`, this lesson's own bare
`fs.readFileSync`), with no format-specific decoder required just to
see what's inside, is the general idea of **human-readable / self-
describing data formats**. Also recognized in: JSON and YAML,
readable configuration and data-interchange formats deliberately chosen
over compact binary alternatives for exactly this inspectability;
CSV files, readable in any text editor or spreadsheet program without
special tooling; HTML and Markdown source, both plain text describing
richer structure; your own pipeline's own diagnostic print statements
(the `print(f"...")` calls throughout your shared script), themselves a
form of human-readable output describing what a much more complex
binary computation actually did.

### SE Lens

The alternative not chosen: `.obj`'s own real design predates
compact binary 3D formats like `.glb` (a binary variant of glTF) that
store the identical *kind* of data — vertices, faces — in a fraction of
the file size, since ASCII digits (`"0.000000"`, eight characters) take
meaningfully more space than the raw binary floating-point number they
represent (four or eight bytes). The real cost of `.obj`'s own choice,
confirmed directly by this unit's own `text.length` of `161` characters
for a single three-vertex triangle: real file-size and parsing-speed
overhead that compounds at your own pipeline's actual scale — your
shared script's own `sample_points` function samples on the order of
thousands of points per mesh, and every one of those, written as
`.obj` text, costs meaningfully more disk space and parse time than
the same data would in a binary format. `.obj`'s real, ongoing
advantage — confirmed directly by this lesson's own ability to read
one with nothing but `fs.readFileSync` and `.split()`, no special
library required — is exactly the inspectability this unit's CS Lens
just named; for debugging your own pipeline's output by eye, that
tradeoff is a genuine, deliberate win, not just an accepted cost.

### One sentence connecting this unit to what came before

`lines` now holds every real line from a real `.obj`-shaped file, still
entirely undifferentiated text — the next unit is what actually reads
a `v` line's own specific structure.

---

## Concept Unit: The `v` Line — Position and Color as Tokens

### The Problem

`lines[0]` — confirmed, previous unit — is the string `"v 0.000000
1.000000 0.000000 1.0000 0.0000 0.0000"`. That's still just one long
string; nothing has pulled the six individual numbers out of it, and
nothing has confirmed that a space character is genuinely all that
separates them.

> **Stop and think first:** Lesson 5's own Header already quoted your
> `save_vertex_colored_obj` function's exact Python f-string:
> `f"v {vertices[i,0]:.6f} {vertices[i,1]:.6f} {vertices[i,2]:.6f} "
> f"{colors[i,0]:.4f} {colors[i,1]:.4f} {colors[i,2]:.4f}\n"`. Looking
> at that format string directly — what character sits between each
> `{...}` placeholder? Given that, what JavaScript string method
> already used earlier in this exact lesson (this lesson's own first
> unit) would you guess is the right tool to pull the individual
> numbers back out — the same method, or a different one, just called
> with a different argument?

### Isolating `.split(' ')` and `parseFloat`

```js
// throwaway-parse-v-line.mjs
const line = 'v 0.000000 1.000000 0.000000 1.0000 0.0000 0.0000';

const trimmed = line.trim();
console.log('trimmed === line (no leading/trailing whitespace to remove here):', trimmed === line);

const tokens = trimmed.split(' ');
console.log('tokens:', tokens);
console.log('tokens.length:', tokens.length);
console.log('tokens[0] (the line-type marker):', tokens[0]);

const x = parseFloat(tokens[1]);
const y = parseFloat(tokens[2]);
const z = parseFloat(tokens[3]);
console.log('typeof x:', typeof x, '| x, y, z:', x, y, z);

const r = parseFloat(tokens[4]);
const g = parseFloat(tokens[5]);
const b = parseFloat(tokens[6]);
console.log('r, g, b:', r, g, b);

const noColorLine = 'v 0.000000 1.000000 0.000000';
const noColorTokens = noColorLine.trim().split(' ');
console.log('a plain v line with no color has tokens.length:', noColorTokens.length);
console.log('tokens[4] on that line (should be undefined - nothing there):', noColorTokens[4]);
```

Actually run, this session, in plain Node:

```
trimmed === line (no leading/trailing whitespace to remove here): true
tokens: [
  'v',        '0.000000',
  '1.000000', '0.000000',
  '1.0000',   '0.0000',
  '0.0000'
]
tokens.length: 7
tokens[0] (the line-type marker): v
typeof x: number | x, y, z: 0 1 0
r, g, b: 1 0 0
a plain v line with no color has tokens.length: 4
tokens[4] on that line (should be undefined - nothing there): undefined
```

What this proves, directly answering the Socratic question: yes, the
identical `.split()` method from this lesson's own first unit, just
given `' '` instead of `'\n'` — the same general-purpose tool, a
different separator, exactly as the Socratic question's own reasoning
predicted from your script's own format string. `tokens.length` of `7`
— one marker plus six real numbers — confirms this specific line
carries color data; the second, deliberately shorter test line
(`tokens.length` of `4`) confirms what a `v` line *without* color looks
like once parsed — real, direct evidence for `OBJLoader`'s own behavior
already quoted in Lesson 5's own Header (`state.colors.push(undefined,
undefined, undefined)` when fewer than seven tokens are present) —
this lesson's own hand-parsing independently reproduces the exact same
token-count distinction that real loader code checks for.

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved
(`.split(' ')` correctly tokenizes a `v` line; `parseFloat` correctly
converts each token to a real number; a color-less `v` line has
exactly four tokens, not seven) is what the real code below relies on.

### Project Change

- **Reference Source:** Your own `save_vertex_colored_obj` function
  (shared script), the same quoted `v`-line f-string as the previous
  unit's own Reference Source.
- **Files affected:** modified — `parse.mjs`.
- **Change type:** add.
- **Location:** directly below the `lines` variable from the previous
  unit.
- **Dependencies:** the `lines` array, already in scope.

### The New Code

```js
const vertices = [];
const colors = [];

for (const line of lines) {
  const tokens = line.trim().split(' ');
  if (tokens[0] === 'v') {
    vertices.push({
      x: parseFloat(tokens[1]),
      y: parseFloat(tokens[2]),
      z: parseFloat(tokens[3]),
    });
    colors.push({
      r: parseFloat(tokens[4]),
      g: parseFloat(tokens[5]),
      b: parseFloat(tokens[6]),
    });
  }
}
```

### The Updated Project

```
1  import * as fs from 'fs';
2
3  const text = fs.readFileSync('./triangle.obj', 'utf-8');
4  const lines = text.split('\n');
5
6  const vertices = [];                         // ← new
7  const colors = [];                            // ← new
8
9  for (const line of lines) {                   // ← new
10   const tokens = line.trim().split(' ');       // ← new
11   if (tokens[0] === 'v') {                     // ← new
12     vertices.push({                            // ← new
13       x: parseFloat(tokens[1]),                // ← new
14       y: parseFloat(tokens[2]),                // ← new
15       z: parseFloat(tokens[3]),                // ← new
16     });                                         // ← new
17     colors.push({                               // ← new
18       r: parseFloat(tokens[4]),                 // ← new
19       g: parseFloat(tokens[5]),                 // ← new
20       b: parseFloat(tokens[6]),                 // ← new
21     });                                          // ← new
22   }                                              // ← new
23 }                                                // ← new
```

`parse.mjs` now walks every line from the file, and for every one
that's actually a `v` line, extracts both its position and its color
into two separate, same-length arrays — the exact same *shape* of
separation Lesson 5's own second unit already established for
`position`/`color` as independent `BufferAttribute`s, now built by
hand-parsing real file text instead of hand-typed literals.

### Mechanical Walkthrough

- `const vertices = []` / `const colors = []` — two empty array
  declarations, ready to be filled — plain JavaScript syntax, not a new
  concept, but named here because per this curriculum's own Concept
  Unit format, every syntactic element in New Code gets an entry.
- `for (const line of lines)` — a **for-of loop**: iterates over every
  element of the `lines` array in order — the first loop this
  curriculum has needed, since every geometry built by hand so far
  (Lesson 2 onward) used a fixed, small, literal number of vertices
  typed directly rather than an unknown number read from a file.
- `line.trim()` — the method (this lesson's own Header, reappearing
  from the previous unit's own isolated lab) — called here for real,
  on every line, including the file's own trailing empty string
  (confirmed, this lesson's first unit, to exist) — `''.trim()`
  produces `''`, harmless, and `''.split(' ')` produces `['']`, whose
  `tokens[0]` is `''`, not `'v'`, so the `if` check below correctly
  skips it without any special-case code needed.
- `.split(' ')` — reappearing from this lesson's own isolated lab,
  given full treatment there.
- `tokens[0] === 'v'` — a strict equality check against the literal
  string `'v'` — this is the actual mechanism behind "line-oriented"
  (defined in Terms): the very first token on every line is what
  determines how the rest of that line should be interpreted, checked
  here explicitly rather than assumed.
- `vertices.push({ x: ..., y: ..., z: ... })` / `colors.push({ r: ...,
  g: ..., b: ... })` — `Array.prototype.push`, appending one new object
  to the end of each array — building up `vertices` and `colors` in
  lockstep, one real entry each per `v` line encountered, the identical
  "tied together only by shared index" structure this lesson's own
  reference source (Lesson 5's Header) already established for
  Three.js's own `BufferAttribute`s.
- `parseFloat(tokens[1])` through `parseFloat(tokens[6])` — reappearing
  from this lesson's own isolated lab, given full treatment there — six
  separate calls, one per numeric token, each producing a real
  JavaScript number rather than the string `.split()` alone would leave
  behind.

### CS Lens

Filtering a mixed stream of items down to only the ones matching a
specific marker or type, processing each match and skipping everything
else, is the general shape of a **type-tagged dispatch** — using one
small, explicit tag (`tokens[0]`) to decide how to handle a piece of
otherwise-uniform data (a plain text line), rather than needing the
data's own structure alone to reveal what it is. Also recognized in: a
JSON API response with a `"type"` field determining how the rest of the
object should be interpreted; a compiler's own token stream, each token
tagged as a keyword, identifier, or operator before any further parsing
happens; a network protocol's packet header, whose type field
determines how to interpret everything that follows.

### SE Lens

The alternative not chosen: skip the `tokens[0] === 'v'` check
entirely, and simply attempt to parse every line as a vertex, letting
`parseFloat` produce `NaN` for anything that doesn't look like one
(this lesson's own Header already named `NaN` as `parseFloat`'s real
failure mode). The real cost of that shortcut: this lesson's own sample
file's fourth line, `'f 1 2 3'`, would silently produce a "vertex" with
`x: NaN` (since `parseFloat('1')` — token `[1]`, which on an `f` line is
actually a face index, not a coordinate — would parse successfully as
the number `1`, while later tokens would fail more visibly) — a real,
silent data-corruption bug that an explicit type check, as this
lesson's own code uses, prevents by construction rather than by
catching the failure after the fact.

### One sentence connecting this unit to what came before

`vertices` and `colors` are now two real, populated arrays — but
nothing has yet used the file's own fourth line, the one starting with
`f`, which is what the final unit turns to.

---

## Concept Unit: The `f` Line and OBJ's 1-Based Indexing

### The Problem

A triangle needs to know *which three* of its vertices form its one
face — that's exactly what an `f` line encodes, but nothing parsed so
far has read it, and — a real, well-documented `.obj`-format quirk —
naively using its numbers as JavaScript array indices would silently
produce the *wrong* triangle.

> **Stop and think first:** your own `save_vertex_colored_obj`
> function's real, quoted source computes its face data as `faces =
> mesh.faces.reshape(-1, 4)[:, 1:] + 1` — notice the `+ 1` at the very
> end, added right before writing to the file. If the underlying mesh
> data, before that `+ 1`, already used ordinary 0-based indices (the
> normal convention in Python/NumPy, and the same convention every
> JavaScript array in this curriculum has used since Lesson 1's own
> `scene.children[0]`), why would your own script deliberately add `1`
> to every single face index right before writing it out? What
> convention might the `.obj` *format itself* — not your script's own
> choice — actually require?

### Isolating `parseInt` and the indexing gotcha

```js
// throwaway-face-indexing.mjs
const positions = [
  { x: 0, y: 1, z: 0 },     // JS array index 0
  { x: -1, y: -1, z: 0 },   // JS array index 1
  { x: 1, y: -1, z: 0 },    // JS array index 2
];

const faceLine = 'f 1 2 3';
const tokens = faceLine.trim().split(' ');
console.log('tokens:', tokens);

const objIndices = [parseInt(tokens[1], 10), parseInt(tokens[2], 10), parseInt(tokens[3], 10)];
console.log('objIndices (as written in the file, 1-based):', objIndices);

const wrongLookup = objIndices.map(i => positions[i]);
console.log('WRONG - looked up directly (off by one):', wrongLookup);

const jsIndices = objIndices.map(i => i - 1);
const correctLookup = jsIndices.map(i => positions[i]);
console.log('jsIndices (converted):', jsIndices);
console.log('CORRECT - looked up after -1:', correctLookup);
```

Actually run, this session, in plain Node:

```
tokens: [ 'f', '1', '2', '3' ]
objIndices (as written in the file, 1-based): [ 1, 2, 3 ]
WRONG - looked up directly (off by one): [
  { x: -1, y: -1, z: 0 },
  { x: 1, y: -1, z: 0 },
  undefined
]
jsIndices (converted): [ 0, 1, 2 ]
CORRECT - looked up after -1: [
  { x: 0, y: 1, z: 0 },
  { x: -1, y: -1, z: 0 },
  { x: 1, y: -1, z: 0 }
]
```

This is called an **off-by-one error**, and this unit doesn't just name
it — it reproduces the actual, real, broken output. What it proves,
directly answering the Socratic question: using the file's own `1, 2,
3` face indices directly as JavaScript array positions genuinely
produces the *wrong triangle* — the top vertex (index `0` in `positions`,
the one this lesson's own file lists first) is silently dropped
entirely, replaced by an `undefined` third corner that would crash or
render garbage — while subtracting `1` from each index first, the exact
inverse of your own script's own `+ 1`, recovers the correct triangle
exactly. Your own script's `+ 1` isn't an arbitrary choice — it's
converting *from* the 0-based indices Python/NumPy naturally use *to*
the 1-based convention the `.obj` format itself requires; any correct
reader of the file has to reverse that exact conversion.

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved (the real,
concrete broken output from skipping the conversion, and the real,
correct output from applying it) is what the real code below relies
on.

### Project Change

- **Reference Source:** Your own script's real, quoted line —
  `faces = mesh.faces.reshape(-1, 4)[:, 1:] + 1` — the `+ 1` this
  unit's own Socratic question and isolated lab both center on.
- **Files affected:** modified — `parse.mjs`.
- **Change type:** add.
- **Location:** directly below the `for` loop from the previous unit —
  either inside the same loop (checking for `'f'` alongside `'v'`) or
  as its own separate pass; this lesson's own New Code adds it inside
  the same loop, avoiding a second full pass over `lines`.
- **Dependencies:** the `lines` array; the `vertices` and `colors`
  arrays are read, not written, by this unit's own new code.

### The New Code

```js
const faces = [];

for (const line of lines) {
  const tokens = line.trim().split(' ');
  if (tokens[0] === 'v') {
    // ...previous unit's own code, unchanged, still here...
  } else if (tokens[0] === 'f') {
    faces.push([
      parseInt(tokens[1], 10) - 1,
      parseInt(tokens[2], 10) - 1,
      parseInt(tokens[3], 10) - 1,
    ]);
  }
}
```

### The Updated Project

The complete file, all three of this lesson's own units combined —
nothing elided:

```
1  import * as fs from 'fs';
2
3  const text = fs.readFileSync('./triangle.obj', 'utf-8');
4  const lines = text.split('\n');
5
6  const vertices = [];
7  const colors = [];
8  const faces = [];                              // ← new
9
10 for (const line of lines) {
11   const tokens = line.trim().split(' ');
12   if (tokens[0] === 'v') {
13     vertices.push({
14       x: parseFloat(tokens[1]),
15       y: parseFloat(tokens[2]),
16       z: parseFloat(tokens[3]),
17     });
18     colors.push({
19       r: parseFloat(tokens[4]),
20       g: parseFloat(tokens[5]),
21       b: parseFloat(tokens[6]),
22     });
23   } else if (tokens[0] === 'f') {                // ← new
24     faces.push([                                  // ← new
25       parseInt(tokens[1], 10) - 1,                // ← new
26       parseInt(tokens[2], 10) - 1,                 // ← new
27       parseInt(tokens[3], 10) - 1,                 // ← new
28     ]);                                            // ← new
29   }                                                // ← new
30 }
31
32 console.log('vertices:', vertices);
33 console.log('colors:', colors);
34 console.log('faces (converted to 0-based):', faces);
```

`parse.mjs` is now a complete, working hand-written `.obj` parser —
every real line handled, `v` lines building `vertices`/`colors` in
lockstep (previous unit), `f` lines building `faces` with the correct
0-based conversion already applied (this unit) — the same three-array
shape (positions, colors, face indices) that `THREE.BufferGeometry`
itself, confirmed since Lesson 2, is built from directly.

### Mechanical Walkthrough

- `const faces = []` — an empty array declaration, the same pattern as
  `vertices`/`colors` from the previous unit.
- `else if (tokens[0] === 'f')` — extending the previous unit's own
  `if` check with a second branch — reappearing strict-equality logic,
  given full treatment in the previous unit, now checking for a
  different literal marker.
- `parseInt(tokens[1], 10)` through `parseInt(tokens[3], 10)` — the
  function (this lesson's own Header) — three calls, one per face
  token, each converting a whole-number string to a real integer.
- `- 1` — ordinary subtraction, applied to each parsed integer
  immediately — the actual, minimal fix this unit's own isolated lab
  already proved necessary, converting the file's own 1-based indices
  into the 0-based indices every array access in this curriculum
  (JavaScript's own native convention) actually requires.
- `faces.push([...])` — `Array.prototype.push`, reappearing from the
  previous unit, appending one three-element array (not an object with
  named fields, unlike `vertices`/`colors` — a plain array is
  sufficient here since face data has no natural named fields the way
  x/y/z or r/g/b do) representing one triangle's three, now-correct,
  vertex references.

### CS Lens

Converting between two different indexing conventions at the exact
boundary where data crosses from one system into another — `.obj`'s
own 1-based file format on one side, JavaScript's 0-based arrays on the
other — is the same underlying idea as Lesson 5's own "normalization
before consumption" CS Lens (`THREE.Color`'s `0`–`1` range vs. your own
script's `0`–`255` bytes), reappearing here per the Repetition Rule,
applied to indices instead of color values: **convention translation at
a system boundary**, done once, deliberately, rather than letting a
foreign convention silently leak into code that assumes its own native
one.

### SE Lens

The alternative not chosen: `.obj` could have used 0-based indices
natively, matching the vast majority of programming languages'
own array conventions (including JavaScript's) and avoiding this exact
conversion step entirely. The real, historical reason it doesn't
(`.obj` predates JavaScript by over a decade, and many of the C and
Fortran-era tools it was designed to interoperate with had their own
reasons to prefer 1-based counting) is outside this lesson's own scope
— but the real cost of the convention as it actually exists, confirmed
directly by this unit's own isolated lab's "WRONG" output, is genuine
and ongoing: every single reader of `.obj` face data, in any language,
forever, has to remember this one specific `- 1`, or silently produce
corrupted geometry exactly like this unit's own broken lookup — a small,
permanent tax paid by every consumer of the format, for a design
decision made once, decades ago, by the format's own original authors.

### One sentence connecting this unit to what came before

`vertices`, `colors`, and `faces` — three real arrays, hand-parsed from
a real file, with every one of this lesson's own real gotchas (trailing
newlines, missing color data, 1-based indices) already confirmed and
handled — are exactly what Lesson 7's `OBJLoader` claims to build
automatically; having built them by hand first is what makes that
claim genuinely checkable rather than simply trusted.

---

## Closing

### Connect the pieces

Start from `text`, line 3: the entire real file, `161` characters,
confirmed by this lesson's first unit to be plain, ordinary text with
no special decoding needed. Line 4's `.split('\n')` turns that one
string into five real entries — four lines of content, one trailing
empty string, a direct, confirmed consequence of the file's own final
newline character, itself a consequence of your own script's own
`f.write(f"...\n")` convention. The loop beginning at line 10 walks
every one of those five entries once; the empty fifth entry's own
`tokens[0]`, confirmed by this lesson's second unit's own reasoning
through `''.split(' ')`, is `''` — matching neither `'v'` nor `'f'`,
so it's silently, correctly skipped, with no special-case code written
anywhere to handle it explicitly. Each of the file's first three real
lines matches `tokens[0] === 'v'` and contributes one entry each to
`vertices` and `colors`, in lockstep, tied together only by shared
array index — the identical structural relationship Lesson 5's own
`BufferGeometry`, built from hand-typed literals rather than parsed
text, already established between its own `position` and `color`
attributes. The file's final real line, `'f 1 2 3'`, matches `tokens[0]
=== 'f'` and — confirmed, this lesson's own third unit's isolated lab,
to matter concretely rather than academically — has `1` subtracted
from each of its three numbers before being stored, the exact reverse
of the `+ 1` your own script's own real, quoted source applies when
writing the file in the first place. `faces[0]`, once this file finishes
parsing, reads `[0, 1, 2]` — genuinely usable, correct JavaScript array
indices into `vertices` and `colors`, ready, next lesson, to be compared
directly against whatever `THREE.OBJLoader` produces from this exact
same file.

## Commands needed

This lesson's own code is the first in this curriculum that needs no
browser at all — it's a plain Node script, not a page. From inside
`lessons/lesson-06-obj-plain-text/`, run:

```
node parse.mjs
```

`node` is the JavaScript runtime already used throughout this
curriculum's own `verify/` scripts; running a file directly (no `npx
serve`, no browser, no `index.html`) is possible here specifically
because nothing in this lesson touches `WebGLRenderer`, the DOM, or
anything else that only exists in a browser — the real, concrete
payoff of Lesson 1's own "separation of concerns" CS Lens, reappearing
in practice: parsing logic genuinely doesn't need a renderer anywhere
nearby to be real, runnable, and testable on its own.

## Run it

Unlike every lesson since Lesson 1, this lesson's own code was already,
genuinely, fully run and verified this session — every isolated lab
above shows real output, and `lessons/lesson-06-obj-plain-text/parse.mjs`
is provided as the complete, real, already-executable file — no
browser-dependent gap remains for this lesson, and nothing needs to be
reported back to close it out.

## Next lesson

Lesson 7 turns to `THREE.OBJLoader` itself — confirmed, this session,
via its own real source, to already natively understand the exact
`v x y z r g b` convention this lesson just parsed by hand. The plan
going in: load this exact same `triangle.obj` file through the real
loader, and compare its output directly against `vertices`, `colors`,
and `faces` as built in this lesson — a real, checkable test, not an
assumed one. **Still needed before that comparison can use your own
real pipeline output specifically** (rather than this lesson's own
constructed stand-in file): an actual `.obj` file produced by running
your own `save_vertex_colored_obj` function for real.
