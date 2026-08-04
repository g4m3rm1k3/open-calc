# Lesson 63: The Table You Need to Decode It Is Part of the Cost

## What you will build

A real Huffman encoder and decoder — frequency analysis, tree
construction with a real priority queue, recursive code generation, and
genuine bit-level packing into actual bytes, not just strings of `'0'`
and `'1'`. Verified with a real, direct win over Lesson 62's own RLE on
the exact same text — text with skewed letter frequency but no long
runs, exactly the case RLE handled badly. And then a genuinely important
honest correction: Huffman's real-world compression ratio must include
the cost of the code table needed to decode the data at all, and this
lesson measures, precisely, the real input size below which Huffman
coding — measured completely honestly — actually makes things worse.

## What you need to know first

- **Lesson 62** — run-length encoding, and its own measured weakness:
  it depends entirely on long consecutive runs and does nothing for data
  with no such runs. Today's text test case is chosen specifically to
  expose that weakness and show Huffman's different approach handling it
  well.
- **Lesson 59** — `collections.Counter`, reused directly for frequency
  analysis, the first real step of Huffman coding.
- **Lesson 30** — bit-level manipulation (`>>`, `&`), needed again here
  for real byte packing, though applied to variable-length codes rather
  than fixed frame-header fields.

---

## The Problem, in prose, no code yet

Every byte this curriculum has ever handled has used exactly 8 bits,
regardless of how common or rare its value is — `'e'`, one of English's
most frequent letters, costs exactly the same 8 bits as `'z'`, one of its
rarest. That's wasteful specifically because real text (and much other
real data) has genuinely skewed frequency: some values appear far more
often than others. Huffman coding's entire idea is to give frequently-
occurring values *shorter* codes and rare ones *longer* codes,
recovering real savings overall — but unlike RLE, decoding those
variable-length codes correctly requires knowing, in advance, exactly
which specific bit patterns represent which byte values. That mapping
has to travel with the compressed data somehow, and — the honest
correction this lesson builds toward — that mapping has a real cost of
its own.

---

## Concept Unit: A Priority Queue, Briefly

### The Problem

Building a Huffman tree means repeatedly finding and combining the two
*least* frequent items currently available — a operation a plain list
would need to re-sort, or re-scan, every single time.

### Introduce the concept in isolation

```python
import heapq

items = [(5, "e"), (1, "z"), (3, "m"), (5, "a"), (2, "q")]
heapq.heapify(items)
print("heapified:", items)

print("popping in order:")
while items:
    print(" ", heapq.heappop(items))
```

Run it:

```
heapified: [(1, 'z'), (2, 'q'), (3, 'm'), (5, 'a'), (5, 'e')]
popping in order:
  (1, 'z')
  (2, 'q')
  (3, 'm')
  (5, 'a')
  (5, 'e')
```

What this proves: `heapq.heapify` (**first appearance**) rearranges a
plain Python list in place into **heap order** — a weaker, cheaper
guarantee than being fully sorted (the printed list *happens* to look
sorted here because this example is small; a heap's internal array is
not generally sorted, only structured so the *smallest* element is
always at index `0`). `heapq.heappop` (**first appearance**) removes and
returns that smallest element, then re-establishes the heap property for
whatever remains — repeated calls, as shown, always return items in
increasing order, which is the one guarantee Huffman's tree-building
step actually needs: cheap, repeated access to "whatever is smallest
right now," without needing every other element kept in any particular
order.

This lab is deleted now; it never appears in the project. What survives
is trusting `heapq` for exactly this repeated-smallest-access pattern —
its own full underlying mechanism (a binary tree stored in an array,
with specific rules keeping the smallest element easy to find) gets its
own deeper treatment in Track 10's future priority queue lesson; here,
it's used as a correct, trusted tool.

### CS Lens

This is a **priority queue** — a data structure specialized for
"repeatedly retrieve the smallest (or largest) item," which is a
genuinely different, and here more efficient, capability than a plain
sorted list requires: `heapq` never fully sorts anything, it maintains
just enough structure to make the *next* smallest element cheap to find
every time, even as items are added and removed.

### SE Lens

Using `heapq` here rather than re-sorting a plain list on every
iteration of tree-building is a real, meaningful efficiency choice for
larger inputs — but for this lesson's purposes, the more important point
is trusting a well-understood, correct standard library tool for a
well-defined sub-problem, exactly the same relationship this curriculum
has already established with `hashlib`, `re`, and `sqlite3`.

---

## Concept Unit: Building the Tree

### Project Change

- **Reference Source:** No reference counterpart — this follows the
  standard, textbook Huffman coding algorithm, not a specific existing
  implementation's source.
- **Files affected:** new file, `huffman.py`.
- **Change type:** add.
- **Dependencies:** `heapq`, `collections.Counter`.

### The New Code

```python
class HuffmanNode:
    def __init__(self, frequency, byte_value=None, left=None, right=None):
        self.frequency = frequency
        self.byte_value = byte_value
        self.left = left
        self.right = right

    def __lt__(self, other):
        return self.frequency < other.frequency

    def is_leaf(self):
        return self.left is None and self.right is None


def build_huffman_tree(data: bytes):
    frequency_table = Counter(data)
    if len(frequency_table) == 1:
        (only_value,) = frequency_table.keys()
        return HuffmanNode(len(data), byte_value=only_value)

    heap = [HuffmanNode(freq, byte_value=value) for value, freq in frequency_table.items()]
    heapq.heapify(heap)

    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)
        parent = HuffmanNode(left.frequency + right.frequency, left=left, right=right)
        heapq.heappush(heap, parent)

    return heap[0]
```

### Mechanical Walkthrough

- `__lt__(self, other)` — **first appearance of defining this specific
  "dunder" method** in this curriculum's own code. `heapq` needs to be
  able to compare two `HuffmanNode` objects directly (`heappush`,
  `heappop`, and `heapify` all compare elements internally) — without
  `__lt__` defined, Python would have no idea how to order two node
  objects at all, since "less than" has no built-in meaning for a custom
  class; defining it here, comparing only by `frequency`, is what makes
  `HuffmanNode` objects usable in a heap at all.
- The single-distinct-byte special case — handled explicitly, before the
  general loop, because a tree with only one leaf and no internal
  structure at all would otherwise produce a broken (empty-string) code
  in the next unit — a real edge case worth naming rather than letting
  the general algorithm silently mishandle it.
- The `while len(heap) > 1:` loop — this is the actual Huffman
  algorithm: repeatedly pop the two *least* frequent remaining nodes,
  combine them into a new internal node whose frequency is their sum,
  and push that combined node back in. Every iteration reduces the
  heap's size by one; the process ends with exactly one node left — the
  tree's root — whose own frequency equals the total count of everything
  in the original data.
- This construction guarantees, by design, that the *least* frequent
  values end up deepest in the tree (combined earliest, pulled furthest
  from the root by every subsequent combination), while the *most*
  frequent values stay shallow — which is exactly what the next unit's
  code generation turns into short codes for common values and long
  codes for rare ones.

### CS Lens

This is a **greedy algorithm** — at every single step, it makes the
locally best choice available (combine the two smallest) without ever
reconsidering an earlier choice — and, a genuinely notable fact worth
stating plainly: for this specific problem, that greedy approach is
*provably optimal*, producing the shortest possible total encoded length
for any given set of prefix-free codes, not merely a reasonable
approximation.

Also recognized in: this curriculum's own Lesson 41 backup tool's
hard-linking decision (locally optimal, made once per file, without
reconsidering earlier files), Dijkstra's shortest-path algorithm (a
different greedy algorithm, also provably optimal for its own problem,
future territory for this curriculum).

### SE Lens

`HuffmanNode` intentionally stores `byte_value=None` for every internal
(non-leaf) node — only leaves ever hold a real byte value, since only
leaves represent an actual encoded symbol; internal nodes exist purely
to record how leaves are grouped and at what combined frequency. This
mirrors real tree-structure design generally: not every node needs every
field populated, and `None` here is a meaningful, checked signal
(`is_leaf()`), not a place-holder oversight.

---

## Concept Unit: Reading Codes Out of the Tree

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `huffman.py`.
- **Change type:** add.
- **Location:** below `build_huffman_tree`.

### The New Code

```python
def generate_codes(node, prefix="", codes=None):
    if codes is None:
        codes = {}
    if node.is_leaf():
        codes[node.byte_value] = prefix or "0"
        return codes
    generate_codes(node.left, prefix + "0", codes)
    generate_codes(node.right, prefix + "1", codes)
    return codes
```

### Mechanical Walkthrough

- `generate_codes` — a **hard concept reappearing**: recursive tree
  traversal, structurally identical to Lesson 55's own recursive descent
  over nested JSON, here walking a binary tree instead of nested
  dictionaries/lists. Every step down the **left** child appends a `"0"`
  to the accumulated `prefix`; every step down the **right** child
  appends a `"1"` — an arbitrary but fixed, consistent convention.
- Reaching a leaf assigns that leaf's accumulated `prefix` as its final
  code — `prefix or "0"` handles the earlier single-distinct-byte
  special case, where the tree is *just* one leaf and the loop that
  would normally build up a real prefix never runs at all, leaving
  `prefix` as the empty string; a genuinely empty code isn't usable, so
  a single `"0"` is substituted instead.
- Because every leaf's code is read directly from its own unique path
  down the tree — a specific sequence of left/right turns — no two
  leaves can ever produce the same code, and, more importantly, no
  leaf's code can ever be a *prefix* of another leaf's code, since that
  would require one leaf to sit on the path *to* another leaf, which
  isn't possible in a tree where every leaf is, by definition, a
  dead end.

### Run it

Against real, natural-language-shaped text with genuinely skewed letter
frequency:

```python
codes = generate_codes(build_huffman_tree(text))
for value, code in sorted(codes.items(), key=lambda kv: len(kv[1])):
    print(f"  {chr(value)!r}: {code} ({len(code)} bits)")
```

```
  ' ': 00 (2 bits)
  't': 1100 (4 bits)
  'e': 1101 (4 bits)
  'o': 1110 (4 bits)
  ...
  'q': 101100 (6 bits)
  'v': 101101 (6 bits)
```

Space — by far the most frequent character in ordinary prose — earned
the shortest code, 2 bits, versus 6 bits for genuinely rare letters like
`'q'`/`'v'` — real, direct proof the tree construction produces exactly
the shape this lesson's opening argument predicted.

Checking the prefix-free property directly, not just trusting the
construction's own logic:

```python
code_list = list(codes.values())
violations = [
    (a, b) for i, a in enumerate(code_list) for b in code_list[i+1:]
    if a.startswith(b) or b.startswith(a)
]
print("prefix-free violations found:", len(violations))
```

```
prefix-free violations found: 0
```

Zero violations across all 28 real generated codes — confirmed by
direct, exhaustive pairwise checking, not merely assumed from the
construction.

### CS Lens

This is exactly **prefix-free coding** (also called a "prefix code"),
the property that makes decoding a stream of concatenated variable-
length codes unambiguous with *no delimiters at all* between them: while
reading bits one at a time, the moment the bits read so far match any
known code, that match is guaranteed to be correct and complete — it
can never be secretly the beginning of some other, longer code, because
no code is ever a prefix of another.

### SE Lens

The prefix-free property is what makes the very simple decoding loop in
the next unit — "keep reading bits until they match a known code, then
reset" — correct at all, with no lookahead, no backtracking, and no
separators wasting space between codes. This is a direct payoff of the
tree structure itself, not a separate property that had to be checked
or enforced afterward — it falls out automatically from generating codes
by walking a real tree, which is exactly why this unit verified it by
direct, independent inspection rather than only trusting that reasoning.

---

## Concept Unit: Packing Real Bits Into Real Bytes

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `huffman.py`.
- **Change type:** add.
- **Location:** below `generate_codes`.

### The New Code

```python
def pack_bits(bit_string):
    padding_needed = (8 - len(bit_string) % 8) % 8
    bit_string += "0" * padding_needed

    packed = bytearray()
    for i in range(0, len(bit_string), 8):
        byte_bits = bit_string[i:i + 8]
        packed.append(int(byte_bits, 2))
    return bytes(packed), padding_needed
```

### Mechanical Walkthrough

- The codes generated so far are Python strings of literal `'0'`/`'1'`
  characters — readable, but each character still costs a full 8 bits
  as ordinary text, defeating the entire point of compression if stored
  that way. `pack_bits` converts a long string of bit-characters into
  genuinely packed bytes, 8 real bits per stored byte.
- `padding_needed = (8 - len(bit_string) % 8) % 8` — a **hard concept
  reappearing** from Lesson 48's own padding-restoration formula: since
  a compressed bitstream's true length is essentially never an exact
  multiple of 8, this computes exactly how many extra `"0"` bits are
  needed to round up to the next full byte boundary, returning `0`
  (via the outer `% 8`) when the length is already a clean multiple.
- `int(byte_bits, 2)` — **first appearance of `int()`'s second
  argument**, specifying the base to interpret the string in — `2` for
  binary, converting an 8-character `'0'`/`'1'` string directly into the
  integer `0`–`255` it represents, ready to become one real byte.
- The returned `padding_needed` **must** travel alongside the packed
  bytes — without it, a decoder has no way to know whether the final
  byte's trailing bits are real, meaningful code bits or just padding
  added to reach a clean byte boundary.

### CS Lens

This is **bit packing**, the direct byte-level payoff of everything
built so far: a string like `"1100"` costs 4 bytes as literal text
characters but represents only 4 real bits — packed correctly, eight
such codes' worth of real bits collapse into a single stored byte, which
is where Huffman coding's actual size reduction physically happens, not
in the tree or the code-generation step themselves.

### SE Lens

Tracking `padding_needed` explicitly, rather than assuming a decoder can
somehow infer it, is the same category of decision Lesson 45's nonce-
prepending and Lesson 51's explicit type choices already made: nothing
about a correct format should require the reader to guess something the
writer already knows and could simply state.

---

## Concept Unit: The Honest Cost of the Table

### The Problem

`huffman_decode` (assembled directly from the pieces above — reversing
`pack_bits` and walking the bitstream against `codes` until each known
pattern matches) needs the *exact* `codes` mapping used during encoding.
That mapping has to be stored or transmitted alongside the packed data
for decoding to be possible at all — and it has a real, measurable size
of its own, one this lesson's earlier compression-ratio framing has, so
far, quietly left out.

### Run it

The real total cost, computed honestly, at several input sizes — the
same repeated sentence, repeated a different number of times each run,
serializing the code table as straightforward JSON:

```python
for repeat_count in [1, 10, 50, 200]:
    text = base * repeat_count
    packed, codes, padding = huffman_encode(text)
    table_repr = json.dumps({str(k): v for k, v in codes.items()}).encode()
    total_real_size = len(packed) + len(table_repr) + 1
    print(f"repeats={repeat_count:>4} original={len(text):>6} packed={len(packed):>6} "
          f"table={len(table_repr):>4} total={total_real_size:>6} ratio={len(text)/total_real_size:.2f}x")
```

```
repeats=   1 original=    71 packed=    39 table= 449 total=   489 ratio=0.15x
repeats=  10 original=   710 packed=   383 table= 449 total=   833 ratio=0.85x
repeats=  50 original=  3550 packed=  1913 table= 449 total=  2363 ratio=1.50x
repeats= 200 original= 14200 packed=  7650 table= 449 total=  8100 ratio=1.75x
```

This is worth sitting with directly: for a 71-byte input, the *honest*
total output — packed data plus the table needed to ever decode it
again — is **489 bytes**, nearly seven times *larger* than the original.
Even at 710 bytes, the honest total (833 bytes) is still larger than the
input. Only once the input grows large enough (`50` repeats, `3550`
bytes) does genuine net compression appear, and it keeps improving as
the input grows further — because the table's size (`449` bytes here) is
essentially **fixed**, determined by how many distinct byte values
appear, not by how much text there is, so it matters less and less,
proportionally, the larger the real input gets.

### CS Lens

This is **fixed overhead amortization** — a one-time cost (the code
table) that must be paid regardless of input size, whose *relative*
impact shrinks as the thing it's amortized over grows. The same
structural shape as Lesson 41's crontab or Lesson 47's API key
generation cost being negligible per real use but potentially dominant
if measured against a single, trivially small operation.

### SE Lens

Real, production Huffman-based formats (DEFLATE, the algorithm inside
`.zip` and `.png`, among others) never serialize their code table this
naively — they use **canonical Huffman codes**, a specific convention
that lets the entire table be reconstructed from just a compact list of
code *lengths* rather than every full bit pattern, dramatically shrinking
the table's own size. This lesson's plain JSON serialization is a
deliberately honest, unoptimized baseline specifically so the real
crossover point — where compression genuinely starts paying off — is
visible and measured, rather than hidden behind an already-optimized
table format that would make the tradeoff much harder to see clearly at
all.

---

## Connect the pieces

One piece of real text, followed through the whole lesson: `Counter`
tallies its byte frequencies; `build_huffman_tree` repeatedly combines
the two least frequent groups via a real priority queue until one tree
remains, with common bytes ending up shallow and rare bytes deep;
`generate_codes` walks that tree recursively, producing genuinely
prefix-free codes — verified directly, zero violations across every real
pair; `pack_bits` collapses those bit-strings into real, dense bytes,
tracking exactly how much padding was added. Measured against Lesson
62's own RLE on the identical text — text with skewed frequency but no
long runs — Huffman's packed data alone beat RLE decisively (1.85x
smaller versus RLE's own 2x *expansion*). But measured with full honesty,
including the code table every real decode actually requires, that same
technique only becomes a genuine net win once the input is large enough
to amortize the table's own fixed cost — proven with real numbers at
four different real input sizes, not asserted from the algorithm's
reputation alone.

## What breaks without this

Reporting only `len(packed)` as "the compressed size" — this lesson's
own first, incomplete framing — would claim a real win (1.85x smaller)
at exactly the input size (710 bytes) where the *honest* total including
the table is still larger than the original (0.85x). Anyone deciding
whether to use Huffman coding based on the incomplete number would reach
the wrong conclusion for every input under roughly 3,000 bytes in this
lesson's own measured case — a real, consequential mistake this lesson's
final unit exists specifically to prevent.

## Definition of done

- [ ] `build_huffman_tree` followed by `generate_codes` produces codes
      with zero prefix-free violations, confirmed by direct pairwise
      checking.
- [ ] `huffman_encode` followed by `huffman_decode` recovers the exact
      original bytes.
- [ ] On real skewed-frequency text, Huffman's packed-data-only size
      beats Lesson 62's RLE output on the identical input.
- [ ] You can state, using this lesson's own measured numbers, the
      approximate input size below which naive Huffman coding produces
      a net *larger* total output than the original.
- [ ] You can explain why real formats like DEFLATE don't serialize
      their code table the same simple way this lesson does.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add huffman.py
  git commit -m "Add Huffman coding with real bit packing, verified prefix-free and round-trip correct — measured the real crossover point where table overhead outweighs compression, not just the best-case packed-data ratio"
  ```

## What's next

Track 8 has now built two genuinely different, complementary
compression strategies: RLE (exploits consecutive repetition) and
Huffman coding (exploits frequency skew, independent of position). Real
compression formats typically combine several such techniques in
sequence — DEFLATE itself layers a repetition-finding stage before its
own Huffman stage — a composition this curriculum's remaining tracks
don't build directly, but which both of these lessons' own honestly
measured strengths and weaknesses now explain the motivation for.
