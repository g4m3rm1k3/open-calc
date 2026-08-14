# Concept: Anchor-Driven vs. Content-Driven Alignment

**What you'll understand by the end:** two genuinely different real
strategies for lining up two sequences so corresponding content lands
on the same row — padding based on **known synchronization points**
versus padding based on **actual content similarity** — solving
superficially similar problems for completely different real reasons.

**Prerequisites:** `difflib-sequence-alignment-and-diffing.md`,
`python-zip-builtin-and-strict.md`.

## Setup

Python 3, no packages needed (`difflib` and `itertools` are standard
library).

## The Problem

Lining up two real, related sequences so corresponding rows appear
together is a recurring real need — but *what counts as
"corresponding"* differs completely depending on the real situation.
Sometimes two items correspond because they're genuinely similar
content (comparing two versions of the same file). Sometimes two items
correspond because of an entirely separate, **known** real fact that
has nothing to do with how similar their content looks — two
completely unrelated blocks of code that happen to both end at the
identical real synchronization point.

## The Isolated Example

Anchor-driven alignment — pad so each segment's real **end** lands on
the same row, because a known anchor marks it, regardless of content:

```python
from itertools import zip_longest

def align_by_anchor(segment_a, segment_b):
    pad = max(len(segment_a), len(segment_b))
    padded_a = [None] * (pad - len(segment_a)) + list(segment_a)
    padded_b = [None] * (pad - len(segment_b)) + list(segment_b)
    return list(zip(padded_a, padded_b))


channel_a = ["G01 X1", "G01 X2", "M100"]   # M100 = wait code (the anchor)
channel_b = ["G01 Y1", "M100"]              # fewer real lines before ITS wait code

for row in align_by_anchor(channel_a, channel_b):
    print(row)
```

**Real output, run this session:**
```
('G01 X1', None)
('G01 X2', 'G01 Y1')
('M100', 'M100')
```

Content-driven alignment — let a real diff algorithm decide where
correspondence lies, based on actual text similarity:

```python
import difflib

left = ["apple", "banana", "cherry"]
right = ["apple", "cherry"]
matcher = difflib.SequenceMatcher(None, left, right)
for tag, i1, i2, j1, j2 in matcher.get_opcodes():
    print(f"{tag}: left={left[i1:i2]} right={right[j1:j2]}")
```

**Real output, run this session:**
```
equal: left=['apple'] right=['apple']
delete: left=['banana'] right=[]
equal: left=['cherry'] right=['cherry']
```

**What this proves:** the anchor-driven version padded `channel_b`
at its **start** with a real `None`, purely so its final, real row
(`'M100'`) lines up with `channel_a`'s own final row — the two rows
before that (`'G01 X1'`/`'G01 X2'` vs. `'G01 Y1'`) never needed to
look similar at all; they're aligned purely because both segments end
at the identical, known real anchor. The content-driven version, given
completely different real input, instead found `"banana"` has **no**
real correspondent on the right at all — because nothing on the right
side actually resembles it — and padding happens exactly where real
content similarity says it should, nowhere else.

## Mechanical Walkthrough

- **Anchor-driven** alignment starts from a real, **externally known**
  fact — a shared synchronization point both sequences are guaranteed
  to reach (a wait code, a checkpoint, a timestamp) — and pads
  **backward** from that known point so it lands on the same real row
  in both sequences, without ever examining whether the content between
  anchors actually resembles anything.
- **Content-driven** alignment has no external anchor at all — it
  examines the real content itself (via `difflib.SequenceMatcher`,
  per `difflib-sequence-alignment-and-diffing.md`'s own real algorithm)
  and infers correspondence from genuine textual similarity.
- `[None] * n + list(segment)` is the real, concrete padding technique
  — real Python list repetition (`[None] * n`, producing `n` real
  `None` placeholders) concatenated (`+`) in front of the real segment,
  left-padding it so its own real end stays fixed at the list's end.
- Both techniques ultimately produce the same *kind* of real result — a
  row-by-row correspondence between two sequences — but arrive at it
  through fundamentally different real reasoning about what
  "corresponds" even means.

## CS Lens

This is a real, concrete instance of choosing an alignment strategy
based on what real information is actually available and relevant —
content-driven alignment (edit distance / sequence alignment, the
formal CS territory `difflib-sequence-alignment-and-diffing.md` already
covers) assumes no external structure exists beyond the content itself;
anchor-driven alignment assumes real, external structure (a known,
shared reference point) *does* exist and is more reliable than content
similarity for this particular real purpose. Neither is a special case
of the other — they're two genuinely different real answers to "how do
I know these two things correspond."

Also recognized in: video/audio synchronization using a shared,
known timestamp or clapperboard mark (anchor-driven) versus scene-
detection algorithms matching visual similarity across two edits of
the same footage (content-driven); database record matching via a real
shared key (anchor-driven, a foreign key) versus fuzzy/approximate
record matching by field similarity (content-driven) when no shared
key exists.

## SE Lens

The real, practical reason to pick correctly between them: applying
content-driven alignment to two channels of genuinely **unrelated**
G-code (this project's own real case — two independent machine
channels running completely different real operations between
synchronization points) would produce meaningless, misleading
correspondences — `difflib` would try to find textual similarity where
none is conceptually relevant at all. Applying anchor-driven alignment
to two versions of the *same* file, by contrast, would need a real,
external synchronization point that simply doesn't exist for that
problem — there's nothing to anchor to beyond the content itself.
Recognizing which real kind of "correspondence" a problem actually has
is the entire real design decision.

## Connection

Builds on `difflib-sequence-alignment-and-diffing.md` (the content-
driven half) and `python-zip-builtin-and-strict.md` (the real
`zip_longest` mechanism this project's own anchor-driven alignment
uses for its final, unanchored tail segment). A real, direct, worth-
noting contrast with this project's own `DiffView` (Step 38,
content-driven, via `difflib`) against `align_by_wait_codes` (Step 66,
anchor-driven, via known wait-code synchronization points) — two real,
different alignment features in the identical codebase, solving
visually similar problems for completely different real reasons.

## Try It Yourself

1. Feed `align_by_anchor` two segments of genuinely unrelated real
   text (not G-code) and confirm it still aligns correctly purely by
   length and position — content similarity is never examined at all,
   proving the mechanism truly doesn't care what the content actually
   is.
2. Try applying `difflib.SequenceMatcher` to this file's own
   `channel_a`/`channel_b` G-code example instead, and observe how
   different (and likely less useful) its real, content-based
   alignment looks compared to the anchor-driven version — direct,
   concrete proof of why the wrong strategy produces a real, if
   syntactically valid, misleading result.
3. Extend `align_by_anchor` to handle **three** or more real anchor
   points in sequence (not just one), padding each segment between
   consecutive anchors independently — the real, fuller version of
   what `align_by_wait_codes` actually does across a whole real
   program.
