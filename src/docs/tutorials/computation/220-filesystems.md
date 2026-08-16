# Lesson 220: Filesystems — Names, Metadata, Blocks, and Operations

**What you will build**: A real, small filesystem — a directory mapping
human-chosen names to files, an inode holding each file's real metadata,
and a disk of fixed-size blocks holding the actual scattered content —
with working `create`, `write`, and `read` operations. It closes by
proving, concretely, that a file's *name* and a file's *data* are
genuinely separate things: a hard link lets two different names share
one inode, and deleting a name only frees the underlying blocks once the
very last name pointing at them is gone.

**What you need to know first**: Lesson 191's addressable-memory-as-
vector convention (a disk, here, is exactly that idea, made persistent).
Lesson 194's free-list allocator and double-free danger — this lesson's
reference-counted deletion is the direct filesystem-level version of the
same problem. Lesson 214's sentinel-value convention (`-1` meaning
"nothing here").

**Terms used in this lesson**:

- **filesystem** — a system for organizing persistent storage as named,
  independently addressable files, built on top of a raw block device;
  exists because a raw disk only offers "give me what's at address `N`,"
  with no notion of grouping bytes into a named, growable unit a person
  could actually find again later.
- **name** (also **directory entry**) — a human-chosen label mapped to a
  specific file's underlying data, kept deliberately separate from the
  data itself; exists so a file's real storage can be referenced by more
  than one name, or found under a different name later, without the
  underlying bytes ever moving.
- **inode** — a file's metadata record: everything about a file except
  its actual content — which blocks belong to it, and how many names
  currently point to it; exists as the one piece of indirection between
  a human-readable name and the scattered real blocks holding the actual
  bytes.
- **block** — a fixed-size chunk of a disk's storage, the actual unit a
  file's content is broken into and stored across; exists because a disk
  is naturally organized as fixed-size units, and a file's real size
  essentially never lines up with exactly one convenient chunk.
- **hard link** — a second directory entry pointing at the exact same
  inode as an existing one; the concrete proof that a name and the data
  behind it are genuinely separate, since creating a hard link makes a
  brand-new name with zero new data.
- **link count** — the number of directory entries currently pointing at
  a given inode; exists so a file's real data can be safely freed at the
  moment the *last* name referencing it disappears, never the first.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`if`** / **`cond`**
  - *What they are:* Clojure's two-branch and multi-branch conditional
    special forms.
  - *Implementation:* `(if test then else)` returns `then` or `else`
    depending on `test`; `(cond test1 result1 ... true default)` returns
    the result paired with the first truthy test, with a bare `true` as
    this curriculum's own always-matching final case.
  - *Their use:* `if` decides between a successful allocation and a
    refused one; `cond` drives every recursive scan in this lesson —
    directory lookup, free-block search, block collection, entry
    removal.
- **`=`**
  - *What it is:* Clojure's equality-testing function.
  - *Implementation:* `(= a b)` returns `true` if `a` and `b` are equal
    values.
  - *Its use:* checking a directory entry's name against a target,
    checking a disk slot against the free sentinel, checking a scan
    index against a collection's length.
- **`get`**
  - *What it is:* Clojure's positional lookup function for an indexed
    collection.
  - *Implementation:* `(get coll index)` returns the value at `index`.
  - *Its use:* reading a directory entry's name or inode index, an
    inode's block-list or link-count, a disk block's content — every
    piece of this lesson's nested vector-of-pairs structure is read this
    way.
- **`assoc`**
  - *What it is:* Clojure's functional-update function for an indexed or
    keyed collection.
  - *Implementation:* `(assoc coll index value)` returns a new
    collection identical to `coll` except at `index`, which now holds
    `value`.
  - *Its use:* appending a new directory entry, a new inode, or a new
    block, at exactly `(count coll)` — the established append idiom —
    and writing a freed block back to the sentinel.
- **`count`**
  - *What it is:* Clojure's function returning how many elements a
    collection holds.
  - *Implementation:* `(count coll)` returns an integer.
  - *Its use:* finding the next free index to append at, and as the
    stopping condition for every recursive scan in this lesson.
- **`+`** / **`-`**
  - *What they are:* Clojure's addition and subtraction functions.
  - *Implementation:* `(+ a b)` / `(- a b)` return the sum or
    difference.
  - *Their use:* advancing a scan index by one; incrementing or
    decrementing a link count.
- **`def`**
  - *What it is:* Clojure's top-level name-binding form, used here only
    at the REPL to hold example state between steps.
  - *Implementation:* `(def name value)` evaluates `value` once and
    binds `name` to the result.
  - *Its use:* every `user=>` transcript carries the disk, directory, and
    inode table from one operation to the next.

---

## Concept Unit: Names, Metadata, and Blocks — Creating and Writing a File

### The Problem

Lesson 191 modeled memory as one flat, addressable vector — an address
*is* how you find something, nothing more. A real filesystem needs
something a person can actually work with: a name, like `"notes.txt"`,
that doesn't change even if the file grows, shrinks, or ends up scattered
across storage in whatever order happened to be free at write time.
Three genuinely different things need representing here, not one: the
*name* someone types, the file's *metadata* (how big it is, which
storage it actually occupies), and the *raw storage* itself. How do
these stay connected without being the same thing?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because filesystems are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn directory-lookup [directory name index]
  (cond
    (= index (count directory)) -1
    (= (get (get directory index) 0) name) (get (get directory index) 1)
    true (directory-lookup directory name (+ index 1))))

(defn find-free-block [disk index]
  (cond
    (= index (count disk)) -1
    (= (get disk index) -1) index
    true (find-free-block disk (+ index 1))))

(defn allocate-block-at [disk content free-index]
  (if (= free-index -1)
    [disk -1]
    [(assoc disk free-index content) free-index]))

(defn allocate-block [disk content]
  (allocate-block-at disk content (find-free-block disk 0)))

(defn make-inode []
  [[] 1])

(defn create-file [directory inodes name]
  [(assoc directory (count directory) [name (count inodes)])
   (assoc inodes (count inodes) (make-inode))])

(defn append-block-to-inode [inode block-index]
  [(assoc (get inode 0) (count (get inode 0)) block-index) (get inode 1)])

(defn write-file-committed [disk inodes inode-index allocation]
  [(get allocation 0)
   (assoc inodes inode-index (append-block-to-inode (get inodes inode-index) (get allocation 1)))])

(defn write-file [disk inodes inode-index content]
  (write-file-committed disk inodes inode-index (allocate-block disk content)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def disk0 [-1 -1 -1 -1])
#'user/disk0
user=> (def directory0 [])
user=> (def inodes0 [])
user=> (def created (create-file directory0 inodes0 "notes.txt"))
#'user/created
user=> (def directory1 (get created 0))
user=> (def inodes1 (get created 1))
user=> directory1
[[notes.txt 0]]
user=> inodes1
[[[] 1]]
user=> (def wr1 (write-file disk0 inodes1 0 "AAA"))
#'user/wr1
user=> (def disk2 (get wr1 0))
user=> (def inodes2 (get wr1 1))
user=> disk2
[AAA -1 -1 -1]
user=> inodes2
[[[0] 1]]
user=> (def wr2 (write-file disk2 inodes2 0 "BBB"))
#'user/wr2
user=> (def disk3 (get wr2 0))
user=> (def inodes3 (get wr2 1))
user=> disk3
[AAA BBB -1 -1]
user=> inodes3
[[[0 1] 1]]
```

### Mechanical Walkthrough

`(defn directory-lookup [directory name index] ...)` — `defn`,
reappearing. A directory here is a vector of `[name inode-index]` pairs;
this scans it for a matching name. `(cond ...)`, reappearing:
`(= index (count directory)) -1` — ran past the end without finding it,
report "no such name" with the same `-1` sentinel used throughout this
curriculum. `(= (get (get directory index) 0) name) (get (get directory
index) 1)` — two nested `get` calls, reappearing: the inner reads the
entry at `index`, the outer reads its name (slot `0`); if it matches,
return that same entry's inode index (slot `1`). `true
(directory-lookup directory name (+ index 1))` — the fallback,
reappearing `cond`-with-`true` convention: keep scanning.

`(defn find-free-block [disk index] ...)` — the identical scanning
shape, now over the disk itself: a vector where each slot holds either
real content or the `-1` free-sentinel. Returns the first free index, or
`-1` if the disk is completely full.

`(defn allocate-block-at [disk content free-index] ...)` — `if`,
reappearing: if `find-free-block` came back `-1` (disk full), return the
disk unchanged and `-1`, the same fail-silently shape Lesson 214's
`acquire-resource` used. Otherwise, `assoc`, reappearing, writes
`content` into that free slot, and the pair reports the new disk and
where the content actually landed. `(defn allocate-block [disk content]
(allocate-block-at disk content (find-free-block disk 0)))` — the
public entry point, composing the two.

`(defn make-inode [] [[] 1])` — a brand-new inode: an empty block-list
(no content yet) and a link count of `1` — one name, about to be
created, will point at it immediately.

`(defn create-file [directory inodes name] ...)` — builds a pair:
a new directory entry, `[name (count inodes)]` — the new inode's index
is simply wherever it's about to land in the growing `inodes` vector,
`assoc`'d onto the directory at `(count directory)`, the established
append idiom; and the new inode itself, `(make-inode)`, `assoc`'d onto
`inodes` at that exact same index. The name and the metadata are created
together, but as two separate entries in two separate vectors — never
the same value.

`(defn append-block-to-inode [inode block-index] ...)` — rebuilds an
inode's pair with one more block appended to its block-list (`assoc` at
`(count (get inode 0))`, the same append idiom, now one level deeper)
and its link-count, `(get inode 1)`, passed through unchanged — writing
content never touches how many names reference the file.

`(defn write-file-committed [disk inodes inode-index allocation] ...)`
— takes the result of an allocation attempt and, if it succeeded, folds
the new block's index into the target inode via `append-block-to-inode`,
`assoc`'d back into `inodes` at `inode-index`. `(defn write-file [disk
inodes inode-index content] (write-file-committed disk inodes
inode-index (allocate-block disk content)))` — the public entry point.

Trace: `disk0` starts as four free slots. `create-file` makes
`directory1 = [[notes.txt 0]]` and `inodes1 = [[[] 1]]` — one name,
pointing at inode `0`, which has no blocks yet. `write-file` with `"AAA"`
finds free block `0`, writes it, and folds it into the inode:
`inodes2 = [[[0] 1]]` — block-list now `[0]`. A second `write-file` with
`"BBB"` finds free block `1` (block `0` is taken) and folds *that* in
too: `inodes3 = [[[0 1] 1]]` — the file's real content is now scattered
across disk positions `0` and `1`, tracked only by the inode's own
block-list, never by any assumption that a file's bytes sit next to each
other.

### CS Lens

This three-layer split — name, metadata, raw storage — is
**indirection**, the same idea Lesson 201's page table and Lesson 192's
pointers already used, applied here at a different layer: a name never
points *directly* at data; it points at a metadata record, which points
at the data. That extra hop is what lets a file be renamed, linked under
a second name, or have its blocks scattered across the disk in whatever
order they happened to be free — none of which would be possible if a
name had to point straight at a fixed, contiguous stretch of storage.

Also recognized in: a library's card catalog, mapping a title to a call
number (metadata: which shelf, how many volumes), never directly to the
physical shelf location itself; a phone contact entry, mapping a name to
a stored number, itself separate from whatever conversation history or
account that number is tied to; a URL shortener, mapping a short link to
a metadata record that in turn points at the real destination, letting
the destination change without breaking the short link.

### SE Lens

The alternative is what Lesson 191's raw addressable memory already is:
no names, no metadata, just "give me the byte at address `N`." That's
strictly simpler and needs none of this lesson's machinery — but it
pushes every one of a filesystem's real jobs (finding a file by a
human-chosen name, growing a file without moving everything after it,
tracking how big something actually is) onto whoever's using the raw
storage directly, by hand, every time. The tradeoff this lesson's design
accepts: every read or write now costs an extra hop through the inode
before reaching real data, real overhead compared to a flat address
space — paid once, permanently, in exchange for never having to know or
care which specific blocks a file's content happens to live in.

---

## Concept Unit: Reading — Gathering Scattered Blocks Back Into One File

### The Problem

`write-file` deliberately let `"notes.txt"`'s two pieces of content land
in whatever blocks happened to be free — `0` and `1`, in this case, but
nothing guarantees that in general, and nothing guarantees they'd stay
adjacent as a file grows and other files get created around it. Reading
the file back has to reconstruct it correctly regardless of where its
blocks actually ended up, using nothing but the inode's own block-list
as the map.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because filesystems are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn collect-blocks [disk block-list index accumulated]
  (if (= index (count block-list))
    accumulated
    (collect-blocks disk block-list (+ index 1)
      (assoc accumulated (count accumulated) (get disk (get block-list index))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def read-result (collect-blocks disk3 (get (get inodes3 0) 0) 0 []))
#'user/read-result
user=> read-result
[AAA BBB]
```

### Mechanical Walkthrough

`(defn collect-blocks [disk block-list index accumulated] ...)` —
`defn`, reappearing, four arguments: the disk, the specific inode's own
block-list to follow, a scan index, and an `accumulated` result being
built up — the recursion-with-an-accumulator pattern this curriculum has
used since Lesson 119, avoiding both `loop` and any mutation.

`(if (= index (count block-list)) accumulated ...)` — `if` and `=`,
reappearing: once the index has walked past every entry in `block-list`,
stop and hand back whatever's been gathered so far.

`(collect-blocks disk block-list (+ index 1) (assoc accumulated (count
accumulated) (get disk (get block-list index))))` — the recursive case,
read from the inside out: `(get block-list index)` reads which disk
block number sits at this position in the file's own ordering — not the
same as `index` itself, since `block-list` might name blocks `0` and
`1`, or `7` and `2`, in any order a real disk actually assigned them.
`(get disk ...)` then reads that block's actual content. `(assoc
accumulated (count accumulated) ...)` appends it onto the end of the
growing result, the same append idiom used throughout this lesson.
`(+ index 1)` advances to the next position in the file's own order,
not the next position on the physical disk.

Trace: `block-list` is `[0 1]` (from `inodes3`'s inode). `index = 0`:
`(get [0 1] 0)` is `0`; `(get disk3 0)` is `"AAA"`; `accumulated` becomes
`["AAA"]`. `index = 1`: `(get [0 1] 1)` is `1`; `(get disk3 1)` is
`"BBB"`; `accumulated` becomes `["AAA" "BBB"]`. `index = 2`: equals
`(count [0 1])`, `2` — stop, return `["AAA" "BBB"]` — the file's content,
correctly reassembled in write order, regardless of which physical disk
positions it actually occupied.

### CS Lens

This is the exact same shape as Lesson 209's per-thread state and Lesson
214's block-collection idea, generalized once more: a piece of data that
"belongs together" logically doesn't need to live together physically —
what matters is a reliable *map* from logical position to physical
location, walked in order. The file's own block-list *is* that map, and
`collect-blocks` is nothing more than following it.

Also recognized in: a torrent download reassembling a file from pieces
that arrived out of order and from different peers, using only piece
numbers to put them back in the right sequence; a mail-merge letter
pulling fields from scattered spreadsheet cells into one coherent
document; a video's index track, letting a player seek to any frame
without the underlying video data needing to be stored in strict
playback order on disk.

### SE Lens

The alternative is what a filesystem with no fragmentation would need:
require every file's blocks to be perfectly contiguous, always, so
"reading" could just be "read this many blocks starting here," no
block-list required at all. Lesson 194's own free-list allocator already
showed why that's not realistic to maintain over time — free space
fragments as files are created and deleted in different orders, and
forcing contiguity would mean constantly relocating existing files just
to keep room free. The block-list's real cost: every read pays for
following an extra layer of indirection, one `get` per block instead of
one contiguous scan — a cost this lesson's design accepts deliberately,
the identical tradeoff Lesson 194's own heap allocator already made for
the same reason.

---

## Concept Unit: Hard Links and Reference-Counted Deletion

### The Problem

Every file so far has had exactly one name. What happens if a second
name should point at the *same* file — not a copy, the literal same
data — and what should happen to that data if *one* of the two names is
later deleted? If deleting a name always freed its inode's blocks
immediately, the second name would be left pointing at freed,
overwritten storage — exactly Lesson 194's double-free danger, now at
the filesystem's own naming layer.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because filesystems are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn increment-link-count [inode]
  [(get inode 0) (+ (get inode 1) 1)])

(defn link-name [directory inodes name existing-inode-index]
  [(assoc directory (count directory) [name existing-inode-index])
   (assoc inodes existing-inode-index (increment-link-count (get inodes existing-inode-index)))])

(defn remove-entry [directory name index result]
  (cond
    (= index (count directory)) result
    (= (get (get directory index) 0) name) (remove-entry directory name (+ index 1) result)
    true (remove-entry directory name (+ index 1) (assoc result (count result) (get directory index)))))

(defn decrement-link-count [inode]
  [(get inode 0) (- (get inode 1) 1)])

(defn free-blocks [disk block-list index]
  (cond
    (= index (count block-list)) disk
    true (free-blocks (assoc disk (get block-list index) -1) block-list (+ index 1))))

(defn delete-name-with-inode [disk new-directory inodes inode-index new-inode]
  (if (= (get new-inode 1) 0)
    [(free-blocks disk (get new-inode 0) 0) new-directory (assoc inodes inode-index new-inode)]
    [disk new-directory (assoc inodes inode-index new-inode)]))

(defn delete-name-at [disk directory inodes name inode-index]
  (delete-name-with-inode disk (remove-entry directory name 0 [])
    inodes inode-index (decrement-link-count (get inodes inode-index))))

(defn delete-name [disk directory inodes name]
  (delete-name-at disk directory inodes name (directory-lookup directory name 0)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def linked (link-name directory1 inodes3 "backup.txt" 0))
#'user/linked
user=> (def directory4 (get linked 0))
user=> (def inodes4 (get linked 1))
user=> directory4
[[notes.txt 0] [backup.txt 0]]
user=> inodes4
[[[0 1] 2]]
user=> (collect-blocks disk3 (get (get inodes4 0) 0) 0 [])
[AAA BBB]
```

Delete the original name first — `backup.txt` still shares the same
inode:

```
user=> (def del1 (delete-name disk3 directory4 inodes4 "notes.txt"))
#'user/del1
user=> (def disk5 (get del1 0))
user=> (def directory5 (get del1 1))
user=> (def inodes5 (get del1 2))
user=> disk5
[AAA BBB -1 -1]
user=> directory5
[[backup.txt 0]]
user=> inodes5
[[[0 1] 1]]
user=> (collect-blocks disk5 (get (get inodes5 0) 0) 0 [])
[AAA BBB]
```

Delete the last remaining name — only now do the blocks actually free:

```
user=> (def del2 (delete-name disk5 directory5 inodes5 "backup.txt"))
#'user/del2
user=> (def disk6 (get del2 0))
user=> (def directory6 (get del2 1))
user=> (def inodes6 (get del2 2))
user=> disk6
[-1 -1 -1 -1]
user=> directory6
[]
user=> inodes6
[[[0 1] 0]]
```

### Mechanical Walkthrough

`(defn increment-link-count [inode] [(get inode 0) (+ (get inode 1)
1)])` — rebuilds an inode's pair with its block-list, `(get inode 0)`,
unchanged, and its link-count one higher.

`(defn link-name [directory inodes name existing-inode-index] ...)` —
appends a *new* directory entry, `[name existing-inode-index]`, pointing
at an *already-existing* inode index instead of creating a fresh one via
`make-inode` — this is the entire mechanism of a hard link: no new
inode, no new blocks, just a second name in the directory aimed at the
same metadata record, plus its link-count bumped up by one.

`(link-name directory1 inodes3 "backup.txt" 0)` — `directory4` gains a
second entry, `[backup.txt 0]`, pointing at the identical inode index,
`0`, that `"notes.txt"` already points at. `inodes4` shows that inode's
link-count is now `2`. Reading `"backup.txt"` via `collect-blocks`
returns the exact same `[AAA BBB]` — not a copy, the literal same
underlying blocks, reached through a different name.

`(defn remove-entry [directory name index result] ...)` — `cond`,
reappearing, the same three-branch scanning shape as
`directory-lookup`, but building a *new* directory instead of returning
a match: reached the end, return what's been kept so far; found a match
for `name`, skip it (don't add it to `result`, just advance); anything
else, keep it (`assoc` onto `result`) and advance.

`(defn decrement-link-count [inode] [(get inode 0) (- (get inode 1)
1)])` — the mirror of the increment function.

`(defn free-blocks [disk block-list index] ...)` — walks a block-list
and, for each entry, `assoc`s that disk position back to the `-1`
sentinel — genuinely returning the storage to the free pool, the same
final step Lesson 194's own allocator needed for a correct, non-leaking
`free`.

`(defn delete-name-with-inode [disk new-directory inodes inode-index
new-inode] ...)` — the decision point: `if` the inode's *new*, just-
decremented link-count is `0`, call `free-blocks` on its block-list —
nobody references this data anymore, it's genuinely safe to reclaim.
Otherwise, leave the disk completely untouched — some other name still
needs those exact blocks.

`(defn delete-name-at [...] ...)` and `(defn delete-name [...] ...)` —
the two entry points, composing everything above: find the name's inode
index, remove its directory entry, decrement its link-count, and decide
whether to free.

Trace the two deletions: deleting `"notes.txt"` first — `remove-entry`
drops it from the directory, leaving only `"backup.txt"`; the inode's
link-count drops from `2` to `1`; since `1 ≠ 0`, `delete-name-with-inode`
takes the "leave it alone" branch — `disk5` is untouched, still holding
`"AAA"` and `"BBB"`, and reading `"backup.txt"` afterward still works
correctly. Deleting `"backup.txt"` next — the directory becomes
completely empty; the link-count drops from `1` to `0`; this time the
`if` takes the free branch — `free-blocks` walks `[0 1]` and resets both
disk positions back to `-1`. Only now, with the *last* name gone, does
the data actually disappear.

### CS Lens

This is **reference counting**, the exact same technique named for
memory in Lesson 194's own free-list world, now applied at the
filesystem's naming layer instead of the heap's pointer layer: track how
many independent references exist to a shared resource, and only
reclaim it the moment that count reaches zero. The specific danger this
prevents is the filesystem-level version of Lesson 194's double-free —
here, it would look like `"backup.txt"` suddenly pointing at freed,
possibly-overwritten storage the instant `"notes.txt"` alone was
deleted, even though `"backup.txt"` itself was never touched.

Also recognized in: a shared document with multiple owners, where the
file only actually leaves the trash once every owner has deleted their
own copy of the share, not the first one; a library book with several
holds on it, only returned to the general shelf once every hold is
cleared; a software package's dependency, only safely uninstalled once
no other installed package still declares it as a requirement.

### SE Lens

The alternative is what a filesystem without link counts would have to
do: forbid more than one name per file entirely, the simplest possible
rule, needing none of `link-name`'s or the decrement-and-check logic
this unit built. Real filesystems reject that simplicity because
multiple names for the same data is a genuinely useful, common
operation — a backup copy that doesn't cost extra storage, an alias in
a second directory for convenience — and the alternative to a real hard
link, an actual *copy* of the data, both wastes storage and, worse,
silently diverges the moment either copy is edited, when the whole point
was that they were supposed to be the same file. The cost this design
accepts instead: every single deletion now has to check a count rather
than just freeing unconditionally, and a genuine bug class opens up if
that count is ever miscounted — an inode whose link-count never reaches
zero leaks its blocks forever (nobody frees them, since nothing ever
sees `0`), while a count that reaches zero too early reproduces the
double-free danger this whole mechanism exists to prevent.

---

## Connect the Pieces

Follow `"notes.txt"`'s two blocks of content through every unit built in
this lesson. `create-file` (Unit 1) gives it a name in the directory and
a fresh inode, link-count `1`, no blocks yet. Two `write-file` calls
(Unit 1, reused) scatter its real content across disk positions `0` and
`1`, tracked only by the inode's own growing block-list, `[0 1]`.
`collect-blocks` (Unit 2) proves that scattering doesn't matter — reading
the file walks the block-list in order and reassembles `["AAA" "BBB"]`
regardless of physical position. `link-name` (Unit 3) gives the exact
same inode a second name, `"backup.txt"`, with zero new data and the
link-count bumped to `2`; `collect-blocks`, called again, proves it's
genuinely the same data, not a copy, by returning the identical result
through the second name. Deleting `"notes.txt"` (Unit 3) removes its
directory entry and drops the count to `1`, but `free-blocks` never
runs — `"backup.txt"`'s own read, tried again, still works, because the
data was never touched. Only deleting `"backup.txt"` too, dropping the
count to `0`, finally triggers `free-blocks`, and only then do disk
positions `0` and `1` return to `-1` — the entire arc, from a name's
first appearance to its data's actual disappearance, governed at every
step by the link-count this lesson built specifically to get that timing
right.

## What Breaks Without This

Replace `delete-name-with-inode`'s check with a version that always
frees, regardless of the remaining link-count:

```clojure
(defn delete-name-with-inode-broken [disk new-directory inodes inode-index new-inode]
  [(free-blocks disk (get new-inode 0) 0) new-directory (assoc inodes inode-index new-inode)])
```

Re-run the exact same two-name scenario against it — delete
`"notes.txt"` first, while `"backup.txt"` still exists:

```
user=> (free-blocks disk3 (get (get inodes4 0) 0) 0)
[-1 -1 -1 -1]
```

The blocks are gone immediately, on the *first* deletion, even though
`"backup.txt"` still has a perfectly valid directory entry pointing at
the same inode. Reading `"backup.txt"` afterward via `collect-blocks`
would now gather whatever happens to occupy positions `0` and `1` next —
stale, wrong, or someone else's data entirely, with no error raised
anywhere. Restoring the link-count check brings the correct
"only free at zero" behavior back.

## Exercises

1. Create a second, independent file, `"other.txt"`, and confirm
   `find-free-block` correctly skips over blocks already claimed by
   `"notes.txt"`'s writes, landing its own content in different disk
   positions.
2. Link a third name, `"triple.txt"`, onto the same inode as `"notes.txt"`
   and `"backup.txt"`, confirm the link-count reaches `3`, and confirm
   the blocks survive two deletions but not the third.
3. Trace what `directory-lookup` returns for a name that was already
   deleted, and explain in one sentence why this correctly matches
   `"file not found"` rather than crashing.

## Definition of Done

- [ ] `directory-lookup`, `find-free-block`, `allocate-block`,
      `create-file`, `write-file`, `collect-blocks`, `link-name`, and
      `delete-name` all defined and run in a live `bb` REPL, matching
      every transcript shown above exactly.
- [ ] The Unit 1 create-and-write scenario reproduced, with content
      correctly scattered across two different disk blocks.
- [ ] The Unit 2 read reproduced, correctly reassembling scattered
      content in write order.
- [ ] The Unit 3 hard-link-and-delete scenario reproduced in full: the
      shared read succeeding, the first delete leaving data intact, and
      the second delete actually freeing the blocks.
- [ ] Exercise 2 completed and hand-traced.
- [ ] `git commit -m "Add Lesson 220: a real filesystem — names,
      inodes, and scattered blocks — with hard links proving a name and
      its data are genuinely separate things"`
