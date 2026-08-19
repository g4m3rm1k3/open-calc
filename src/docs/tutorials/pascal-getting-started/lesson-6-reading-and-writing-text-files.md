# Lesson 6: Reading and Writing Text Files

**What you will build:** A program that writes two lines of text to a
real file on disk, then reopens that file and reads it back line by
line — the single most central skill in *Software Tools in Pascal*,
whose early utility programs are almost entirely built around reading a
stream of text and writing a transformed stream back out.

**What you need to know first:** Lesson 5 — `var` parameters (this
lesson's `readln(inFile, line)` call uses the same underlying
by-reference mechanism). Lesson 4 — `string` variables and `writeln`'s
multi-argument form. Lesson 3 — the accumulator pattern, reused here
for counting lines.

**Terms used in this lesson:**
- **`Text`** — a built-in Pascal type representing a text file: a
  stream of characters organized into lines, which can be opened either
  for reading or for writing. A variable of type `Text` does not hold
  file *contents* directly — it holds a handle to an open (or not yet
  opened) connection to a file on disk, similar in role to `std::
  ifstream`/`std::ofstream` in C++, except Pascal uses one type, `Text`,
  for both directions, and a separate call (`Reset` or `Rewrite`,
  below) decides which direction a given open uses.
- **`not`** — the Boolean negation operator: given a `True`/`False`
  value, it produces the opposite. This lesson uses it in `not
  EOF(inFile)`, meaning "the file has *not* reached its end."

**Objects and methods used:**
- **`Assign`** —
  - *What it is:* a built-in procedure that associates a `Text`
    variable with a specific file path on disk.
  - *Implementation:* `procedure Assign(var f: Text; const FileName:
    string);`
  - *Its use:* this lesson calls it twice, once for the file variable
    being written to, once for the one being read from — in both
    cases, `Assign` only records *which* file the variable refers to;
    it does not open anything yet.
- **`Rewrite`** —
  - *What it is:* a built-in procedure that opens a `Text` file for
    writing.
  - *Implementation:* `procedure Rewrite(var f: Text);` — creates the
    file if it doesn't exist, and **truncates** it (discards any
    existing content) if it does.
  - *Its use:* this lesson uses it to open `sample.txt` fresh, so the
    two lines written afterward become the file's entire content.
- **`Reset`** —
  - *What it is:* a built-in procedure that opens a `Text` file for
    reading.
  - *Implementation:* `procedure Reset(var f: Text);` — the file must
    already exist; unlike `Rewrite`, `Reset` never creates or erases
    anything, it only positions reading at the file's start.
  - *Its use:* this lesson uses it to reopen `sample.txt` for reading,
    after the earlier `Rewrite`/`Close` pair already created it.
- **`Close`** —
  - *What it is:* a built-in procedure that ends a file's open
    connection.
  - *Implementation:* `procedure Close(var f: Text);`
  - *Its use:* this lesson calls it after writing, to guarantee both
    lines are actually flushed to disk before the file is reopened for
    reading — and again after reading, to release the file cleanly.
- **`EOF`** —
  - *What it is:* a built-in function testing whether a file's read
    position has reached the end of its content ("end of file").
  - *Implementation:* `function EOF(var f: Text): Boolean;` — returns
    `True` once every line has already been read, `False` while lines
    remain.
  - *Its use:* this lesson uses it to control a read loop without
    needing to know in advance how many lines the file contains.
- **`readln`** (file form) —
  - *What it is:* the same procedure taught in Lesson 1, reappearing
    here in a different form.
  - *Implementation:* `procedure ReadLn(var f: Text; var S: string);` —
    when called with a file variable as its first argument, it reads
    the next line from *that file* instead of from the console.
  - *Its use:* Lesson 1 used `readln(name)` with no file argument,
    which reads from the console by default; this lesson's
    `readln(inFile, line)` explicitly names `inFile` as the source,
    redirecting the read away from the console entirely.
- **`writeln`** (file form) —
  - *What it is:* the same procedure taught in Lesson 0, reappearing
    here in a different form.
  - *Implementation:* `procedure WriteLn(var f: Text; args...);` — when
    called with a file variable as its first argument, it writes to
    *that file* instead of the console.
  - *Its use:* this lesson's `writeln(outFile, '...')` calls redirect
    output into `sample.txt`; later calls in the same program, with no
    file argument, still print to the console exactly as in every
    earlier lesson — both forms coexist in the same program.

---

## The Problem

Every program in this series so far has read from, and written to, the
console only — nothing persists after the program exits. Processing
real text data — the entire premise of *Software Tools in Pascal* —
requires reading and writing files that live on disk independently of
any one program run.

## The Code

```pascal
program FileIO;
var
  outFile, inFile: Text;
  line: string;
  lineCount: integer;
begin
  Assign(outFile, 'sample.txt');
  Rewrite(outFile);
  writeln(outFile, 'the quick brown fox');
  writeln(outFile, 'jumps over the lazy dog');
  Close(outFile);

  Assign(inFile, 'sample.txt');
  Reset(inFile);
  lineCount := 0;
  while not EOF(inFile) do
  begin
    readln(inFile, line);
    lineCount := lineCount + 1;
    writeln('Line ', lineCount, ': ', line);
  end;
  Close(inFile);
end.
```

## Walkthrough

`outFile, inFile: Text;` declares two file variables, both of type
`Text` — one will be used for writing, one for reading; Pascal does not
require separate types for the two directions, only separate calls
(`Rewrite` vs. `Reset`, both explained above) to open them.

`Assign(outFile, 'sample.txt');` associates `outFile` with the path
`'sample.txt'`, resolved relative to the running program's current
working directory. Per `Assign`'s own *Implementation* above, this step
alone does not open anything — it only records which file `outFile`
will refer to once it is opened.

`Rewrite(outFile);` opens that file for writing, per its
*Implementation* above: freshly created if it doesn't exist yet,
truncated (emptied) if it does — either way, `outFile` is now ready to
receive written lines with nothing already in it.

`writeln(outFile, 'the quick brown fox');` is `writeln`'s **file
form**, defined in Objects and methods above: because the first
argument is a `Text` variable rather than a plain value to print, this
call writes `'the quick brown fox'` followed by a newline into
`sample.txt`, not to the console. `writeln(outFile, 'jumps over the
lazy dog');` repeats this, adding a second line to the same file.

`Close(outFile);` ends the write session, per its *Implementation*
above — this specifically matters here because writes to a file are
often buffered in memory rather than sent to disk immediately; `Close`
guarantees both lines are actually flushed to `sample.txt` before
anything tries to read them back.

`Assign(inFile, 'sample.txt');` associates the *second* file variable
with the *same* path — `outFile` and `inFile` are two independent
handles that happen to name the same file on disk; nothing links them
to each other directly.

`Reset(inFile);` opens `sample.txt` for reading, per its
*Implementation* above — this is the direct counterpart to `Rewrite`:
where `Rewrite` prepares a file to be written into (creating or
erasing it), `Reset` prepares an *existing* file to be read from,
starting at its first character, and never creates or erases anything.

`lineCount := 0;` initializes an **accumulator**, the pattern fully
explained in Lesson 3 — a variable started at an identity value (`0`,
for counting) before a loop, updated once per iteration.

`while not EOF(inFile) do` is a **new loop shape** for this series: a
`while` loop runs its body repeatedly for as long as its condition
stays `True`, checking the condition *before* every pass — unlike
`for`, a `while` loop has no built-in notion of a range or a count; it
keeps going purely based on a condition re-evaluated each time.
`EOF(inFile)`, per its *Implementation* above, returns `True` once
every line in the file has already been read; `not`, defined in Terms
above, flips that to `False` once the end is reached — so `not
EOF(inFile)` reads as "there is still more file left to read," and the
loop runs for exactly as long as that stays true. This is the correct
tool here specifically because, unlike Lesson 3's array (whose exact
size was known from its declaration), a text file's line count is not
known in advance — `EOF` is how the program discovers "no more input"
at the moment it actually happens, rather than being told in advance.

`begin ... end;` groups the loop's three-statement body into one
compound statement, the same grouping mechanism taught in Lesson 2 —
without it, only `readln(inFile, line);` would repeat, and the other
two lines would run exactly once, after the loop finished.

`readln(inFile, line);` is `readln`'s **file form**, defined in Objects
and methods above: because `inFile` is passed as the first argument,
this reads the next line from `sample.txt` into `line`, rather than
reading from the console the way Lesson 1's `readln(name)` did.

`lineCount := lineCount + 1;` is the same accumulator update shape from
Lesson 3, counting lines instead of summing numbers.

`writeln('Line ', lineCount, ': ', line);` — note this call has **no**
file argument, so, per `writeln`'s ordinary console form (Lesson 0),
this prints to the console even though `line` itself came from a file —
the file form and the console form coexist in the same program, chosen
per call by whether a file variable is passed as the first argument.

**Execution trace:**

```
Before loop: lineCount = 0
Pass 1: not EOF(inFile) is True → readln reads "the quick brown fox",
        lineCount 0 → 1, prints "Line 1: the quick brown fox"
Pass 2: not EOF(inFile) is True → readln reads "jumps over the lazy dog",
        lineCount 1 → 2, prints "Line 2: jumps over the lazy dog"
Pass 3: not EOF(inFile) is False (the file has no third line) →
        loop body does not run, loop ends
```

Pass 3 is the crux of why `while` was the right loop here: the loop
doesn't run a fixed number of times decided in advance — it runs
exactly until `EOF` reports there is nothing left, discovered only at
that moment.

`Close(inFile);` ends the read session, releasing the file handle.

**Optional aside, skip freely:** the general shape here — keep reading,
checking after each read whether input is exhausted, stop once it is —
is a common one across languages with their own file-reading loops
(C++'s `ifstream`/`getline` included), not something specific to
Pascal. Not needed to understand this lesson; only worth knowing if
you've already bumped into a similar-looking loop somewhere else and
want to recognize it as the same underlying idea.

## Expected Output

Console:

```
Line 1: the quick brown fox
Line 2: jumps over the lazy dog
```

A file named `sample.txt` is also created in the same folder as the
compiled `.exe`, containing exactly the two written lines. Not run this
session — confirm with `fpc fileio.pas` and `.\fileio.exe`, then open
`sample.txt` in a text editor to see it directly.

## Connect the Pieces

Across this lesson: two literal strings are written into `sample.txt`
via `outFile`; `Close` guarantees they're actually on disk; a
completely separate `inFile` handle reopens that same path; the `while
not EOF` loop reads those exact same two lines back, one per pass,
each one immediately counted by `lineCount` and printed to the console
— one piece of text traveling from a string literal in the program's
own source, out to disk, and back again through a second, independent
file handle.

## Try It Yourself

- Add a third `writeln(outFile, '...')` call before `Close(outFile);`
  and confirm the read loop reports three lines without any other code
  changing — proof `while not EOF` really does adapt to the file's
  actual length.
- Open `sample.txt` in a plain text editor after running the program,
  type a fourth line by hand, save it, and rerun *only* the reading
  half (comment out the `Rewrite`/`writeln`/`Close` block for
  `outFile`) — confirm the program picks up your hand-typed line too.
- Delete the `Close(outFile);` call, recompile, and run — on some
  systems the written lines may not appear when reading back, or the
  file may appear empty; this demonstrates why `Close` isn't optional
  bookkeeping.

**Next:** the series continues once expanded — see `HANDOFF.md` in this
folder for what's planned next (arrays of records, recursion, and
tackling the first real *Software Tools in Pascal* utility programs
directly).
