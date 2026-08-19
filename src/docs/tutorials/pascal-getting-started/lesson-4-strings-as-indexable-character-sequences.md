# Lesson 4: Strings as Indexable Character Sequences

**What you will build:** A program that inspects and rebuilds a string
character by character — the exact skill *Software Tools in Pascal*'s
early text-processing utilities (counting characters, finding words,
translating letters) are assembled from.

**What you need to know first:** Lesson 3 — arrays, indexing with
square brackets, and the `for i := Low(x) to High(x) do` loop shape.

**Terms used in this lesson:**
- **`Char`** — a built-in Pascal type representing a single character.
  This matters as its own type, distinct from `string`, because several
  operations in this lesson (indexing into a string, `UpCase`) work on
  one `Char` at a time, not a whole `string`.
- **String indexing** — accessing a single character of a `string`
  variable by position, written the same bracketed way as an array
  element (`sentence[1]`). This works because Free Pascal's `string`
  type is, under the hood, an indexable sequence of `Char` values — the
  same indexing mechanism taught for arrays in Lesson 3, applied to
  text instead of numbers.
- **String concatenation (`+`)** — joining two strings (or a string and
  a `Char`) end-to-end into one longer string, using the same `+`
  symbol as numeric addition. Pascal decides which operation `+` means
  by the types on either side of it — `Char`/`string` operands mean
  concatenation, `integer`/`real` operands mean arithmetic addition.

**Objects and methods used:**
- **`Length`** —
  - *What it is:* a built-in function returning how many characters a
    string contains.
  - *Implementation:* `function Length(const S: string): Integer;`
  - *Its use:* this lesson uses it both to report the sentence's size
    directly, and to bound a loop that visits every character.
- **`Copy`** —
  - *What it is:* a built-in function that extracts a substring.
  - *Implementation:* `function Copy(const S: string; Index: Integer;
    Count: Integer): string;` — returns `Count` characters from `S`,
    starting at the 1-based position `Index`.
  - *Its use:* this lesson uses it to pull out just the sentence's
    first word, once the space's position is known.
- **`Pos`** —
  - *What it is:* a built-in function that searches for a substring
    inside a string.
  - *Implementation:* `function Pos(const SubStr: string; const S:
    string): Integer;` — returns the 1-based index of `SubStr`'s first
    occurrence inside `S`, or `0` if it isn't found anywhere.
  - *Its use:* this lesson uses it to locate the first space character,
    which marks where the sentence's first word ends.
- **`UpCase`** —
  - *What it is:* a built-in function converting one character to its
    uppercase form.
  - *Implementation:* `function UpCase(c: Char): Char;` — takes a
    single `Char`, returns a single `Char`; a character that has no
    uppercase form (a space, a digit, a symbol) is returned unchanged.
  - *Its use:* this lesson calls it once per character, inside a loop,
    to build an all-uppercase copy of the sentence.

---

## The Problem

Lesson 1 already declared `string` variables and printed them whole.
Real text processing needs finer control: reading one character at a
time, finding where one piece of text sits inside another, and building
a new string up from pieces — none of which "print the whole string"
alone provides.

## The Code

```pascal
program Strings;
var
  sentence: string;
  word: string;
  i: integer;
begin
  sentence := 'the quick brown fox';
  writeln('Length: ', Length(sentence));
  writeln('First word: ', Copy(sentence, 1, Pos(' ', sentence) - 1));
  writeln('First character: ', sentence[1]);

  word := '';
  for i := 1 to Length(sentence) do
    word := word + UpCase(sentence[i]);
  writeln('Uppercased: ', word);
end.
```

## Walkthrough

`sentence := 'the quick brown fox';` assigns a literal string, the same
`string` type and `:=` assignment from Lesson 1, restated here in full:
`string` is a Free Pascal extension type holding text of any length;
`:=` stores the value on its right into the variable on its left.

`writeln('Length: ', Length(sentence));` calls `Length`, described
above, and prints the result. For this exact sentence — `t-h-e` (3),
a space (1), `q-u-i-c-k` (5), a space (1), `b-r-o-w-n` (5), a space
(1), `f-o-x` (3) — the total is `19`.

`writeln('First word: ', Copy(sentence, 1, Pos(' ', sentence) - 1));`
nests two function calls inside `Copy`'s arguments — Pascal evaluates
`Pos(' ', sentence)` first, since `Copy` needs that result as its own
third argument. `Pos(' ', sentence)` searches `sentence` for a single
space character and returns its position: the space sits right after
"the", at index `4`. `Copy(sentence, 1, 4 - 1)` — the expression `Pos(...)
- 1` evaluates to `3` — then extracts `3` characters starting at index
`1`, giving `"the"`: the sentence's first word, found by locating the
space that ends it rather than by any built-in "get the first word"
function, because Pascal has none — this three-function combination
*is* how that operation gets built.

`writeln('First character: ', sentence[1]);` uses **string indexing**,
defined in Terms above: `sentence[1]` reaches into the string and reads
just its first character, `'t'`, as a `Char` value — the same
square-bracket mechanism Lesson 3 used on an array, here applied to a
string instead.

`word := '';` initializes a second string variable to the **empty
string** — zero characters, not uninitialized or blank-with-content —
setting up an **accumulator**, the pattern named and explained fully in
Lesson 3: a variable started at an identity value before a loop, then
built up one piece at a time inside it. For string concatenation,
the empty string `''` is the identity value, exactly as `0` was the
identity value for addition in Lesson 3's total.

`for i := 1 to Length(sentence) do` is Lesson 2's `for` loop construct,
restated in full: it runs its body once per value of `i`, here from `1`
to `Length(sentence)` (`19`), incrementing `i` automatically each pass —
this visits every character position in the string exactly once, in
order.

`word := word + UpCase(sentence[i]);` is the loop body, and does three
things in sequence: `sentence[i]` reads the character at the current
position; `UpCase(...)` converts that one `Char` to uppercase (leaving
it unchanged if it has no uppercase form, such as the spaces in this
sentence); `word + UpCase(...)` then uses **string concatenation**,
defined in Terms above, to join that one character onto the end of
`word` so far; `:=` stores the newly extended string back into `word`,
overwriting the shorter previous version — the exact same
read-extend-store accumulator shape as Lesson 3's running total, with
concatenation standing in for addition.

**Execution trace (first four iterations of nineteen):**

```
i=1: sentence[1]='t', UpCase='T', word "" → "T"
i=2: sentence[2]='h', UpCase='H', word "T" → "TH"
i=3: sentence[3]='e', UpCase='E', word "TH" → "THE"
i=4: sentence[4]=' ', UpCase=' ', word "THE" → "THE "
```

Iteration 4 is the one worth noticing specifically: `UpCase(' ')`
returns a space unchanged, because a space has no uppercase form — per
`UpCase`'s own *Implementation* above, any character without one passes
through untouched, which is exactly why the final result keeps its
original spacing instead of collapsing or corrupting it.

`writeln('Uppercased: ', word);` prints the fully built string after
all nineteen iterations have run.

## Expected Output

```
Length: 19
First word: the
First character: t
Uppercased: THE QUICK BROWN FOX
```

Not run this session — confirm with `fpc strings.pas` and
`.\strings.exe`.

## Try It Yourself

- Change `sentence` to a string with no spaces at all, and predict what
  `Pos(' ', sentence)` returns before running it — per its own
  *Implementation* above, this is a documented, specific case.
- Write a loop that counts how many `'o'` characters appear in
  `sentence`, using an `integer` accumulator (Lesson 3's pattern, not
  this lesson's string one) instead of building a new string.
- Use `Copy` to extract the sentence's *last* word instead of its
  first — this requires finding the *last* space, not the first one
  `Pos` finds by default, which is a genuinely harder problem worth
  sitting with.

**Next:** `lesson-5-reference-parameters-and-multiple-return-values.md`
