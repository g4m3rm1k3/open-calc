# Lesson 1: Trust Boundaries — Where Attacks Begin

Today we study **trust boundaries** — the invisible lines in every system that separate
data you control from data you don't. Our case study is a five-line command-line tool.
Every attack you will ever study in this course — SQL injection, XSS, buffer overflows,
CSRF — is the same idea wearing a different costume: code that stopped tracking which
side of a trust boundary its data came from.

## What you will learn

By the end of this lesson you will be able to look at any piece of code and ask one
question that finds most security bugs before you know their names: *where did this
data come from, and did the code that used it know that?* You'll write two small,
runnable Python scripts — one that crosses a trust boundary invisibly and one that
enforces it — and you'll be able to explain, precisely, why the second one is safe and
the first one isn't.

## What you need to know first

Ordinary programming: variables, functions, `if` statements, calling a function with an
argument. No prior security knowledge is assumed — this is lesson 1. Every Python-specific
construct used below is explained the first time it appears, the same way it would be for
any language; if you're reading this in a different language, the concept is what matters,
not the syntax.

---

## The problem

Every program has two kinds of data: data the *program's author* put there, and data that
arrived from *outside* — a user typing something, a file on disk, a network request, an
environment variable, another program's output. The author controls the first kind
completely. The author controls the second kind not at all.

The line between those two is a **trust boundary**. On one side, data means what the
program expects it to mean. On the other side, data means whatever the person who sent it
wanted it to mean — including things designed to make your program do something its
author never intended.

The bug that causes almost every security vulnerability you'll study in this course is not
"the programmer was careless." It's more specific than that: **the code used data from
across a trust boundary the same way it would use data it authored itself.** That's the
whole pattern. Everything else in this course is a variation on it.

## The lab: a script that forgets where its data came from

**Disposable host.** We're going to build a tiny tool called `GreetingBot` — a name that
means nothing and will never appear again after this lesson. Its only job is to make the
trust-boundary problem visible in five lines, stripped of every other complexity a real
program would have.

### Step 1 — the trusted version

```python
def greet(name):
    print("Hello, " + name + "!")

greet("Ada")
```

Run it. It prints:

```
Hello, Ada!
```

**Walkthrough.** `greet` is a function — a named, reusable block of code — that takes one
argument, `name`, and builds a new string by concatenating (`+`) three pieces: the literal
text `"Hello, "`, whatever `name` holds, and `"!"`. `print` writes that string to the
terminal. We called `greet("Ada")`, so Python bound the parameter `name` to the string
`"Ada"` for the duration of the call.

**CS lens.** This is **string concatenation** — building a new string by joining smaller
strings end to end. Nothing here is a security concept yet, because `"Ada"` was written by
us, the program's author, directly in the source code. It never crossed a trust boundary.
It is, structurally, no different from a number written directly in the code.

**SE lens.** `greet` has a single responsibility: format and print a greeting. It doesn't
know or care where `name` came from — that's the caller's problem. This separation
(the function trusts its caller to hand it something reasonable) is normal, good design —
*until* the caller is willing to hand it something from outside the program. Watch what
happens next.

**Security lens.** No principle is violated yet — this example exists only to show the
"safe" shape before we break it. Hold this code in your head; the next block changes one
line.

This code is deleted now — it doesn't survive past this lesson. It existed to give you a
baseline to compare against.

### Step 2 — the same shape, one line changed

```python
def greet(name):
    print("Hello, " + name + "!")

user_supplied_name = input("What's your name? ")
greet(user_supplied_name)
```

**New construct: `input()`.** `input(prompt)` is a built-in Python function. It prints
`prompt` to the terminal, pauses the program, waits for the person running it to type
something and press Enter, and returns whatever they typed as a string. It never fails —
if the person types nothing, it returns an empty string `""`.

Run it and type `Ada` when prompted:

```
What's your name? Ada
Hello, Ada!
```

Identical output to Step 1. Now run it again and type this instead:

```
What's your name? Ada"); os.system("echo not actually harmless
```

Output:

```
Hello, Ada"); os.system("echo not actually harmless!
```

**Walkthrough.** Nothing dangerous happened here — `greet` only ever does string
concatenation and `print`, so there's no way for typed text to become executable code in
*this* script. That's the point of this step, not a mistake: I want you to see that the
data crossed the trust boundary — it went from "typed by a stranger at a keyboard" to
"passed directly into a function" — with **nothing in the code marking that crossing.**
`greet` cannot tell the difference between the string `"Ada"` we wrote in Step 1 and the
string a stranger typed in Step 2. To `greet`, they are the same type of value: a Python
`str`. The trust boundary is real, but it is invisible in the code.

**CS lens.** This is the core idea behind every **injection vulnerability** you'll study
later in this course (Lessons 4–6): a value's *type* (here, `str`) tells you its shape, but
says nothing about its *provenance* — where it came from and whether it's trustworthy.
Python's type system enforces "this is a string." No type system enforces "this string was
typed by someone I don't control." That second fact has to be tracked by the programmer,
by hand, at every point data crosses a trust boundary — because no compiler does it for
you.

**SE lens.** `greet`'s single responsibility ("format and print a greeting") hasn't
changed, and that's exactly the problem: the responsibility for checking *where the data
came from* was never assigned to anyone. In Step 1, that was fine, because the caller
(us, writing the code) was trustworthy by construction. In Step 2, the caller became "an
untrusted user," and no code was added to account for that change. This is why, later in
this course, you'll see functions that accept "already-validated" input as a distinct type
from raw input — making the trust boundary visible *in the type system* instead of leaving
it as an invisible fact the programmer has to remember.

**Security lens.** The principle here is **input validation at the trust boundary**: the
moment data crosses from untrusted territory into your program, something must decide
whether it's acceptable — before it travels any further. In `greet`, nothing decided
anything. The data flowed straight from `input()` to `print()` with zero checkpoints.
`greet` happened to be harmless here only because `print` can't execute code. Lesson 4
shows you the identical pattern with a function that *can* execute code, and the identical
missing checkpoint turns into a real vulnerability.

### Step 3 — marking the boundary

```python
def greet(name):
    print("Hello, " + name + "!")

def sanitize_name(raw_input):
    allowed_characters = set(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ "
    )
    cleaned = "".join(character for character in raw_input if character in allowed_characters)
    return cleaned.strip()

user_supplied_name = input("What's your name? ")
safe_name = sanitize_name(user_supplied_name)
greet(safe_name)
```

**New construct: set membership and a generator expression.** `set("abc...")` builds a
`set` — an unordered collection with fast "is this item in here?" checks — containing one
entry per character in that string. `character in allowed_characters` asks whether a
single character is a member of that set, and answers in constant time regardless of how
big the set is, because a set is backed by a hash table rather than a list that has to be
scanned. `"".join(character for character in raw_input if character in allowed_characters)`
is a **generator expression** inside `str.join`: it walks `raw_input` one character at a
time, keeps only the ones present in `allowed_characters`, and glues the survivors back
into a single string with `""` (empty string) between them — i.e., no separator. `.strip()`
removes leading/trailing whitespace from the result.

Run it with the same malicious-looking input from Step 2:

```
What's your name? Ada"); os.system("echo not actually harmless
Hello, Ada os osecho not actually harmless!
```

**Execution trace**, since this step involves iterating over input character by character:

```
raw_input = 'Ada"); os.system("echo not actually harmless'
character 'A' → in allowed_characters → kept
character 'd' → in allowed_characters → kept
character 'a' → in allowed_characters → kept
character '"' → NOT in allowed_characters → dropped
character ')' → NOT in allowed_characters → dropped
character ';' → NOT in allowed_characters → dropped
character ' ' → in allowed_characters → kept
character 'o' → in allowed_characters → kept
... (continues for every character in raw_input)
cleaned = 'Ada os osecho not actually harmless'
```

The quotation marks, parentheses, and semicolon — the characters that would matter if this
string were ever handed to something that *interprets* text as code, like `os.system` —
are gone. What survives is plain text, and only plain text.

**Walkthrough.** `sanitize_name` is a **checkpoint**: a function whose entire job is to sit
between untrusted input and the rest of the program, and decide what's allowed through. It
doesn't try to understand what the input *means* — it just enforces a strict allow-list
(letters and spaces only) and discards everything else. `safe_name` is now a value we can
reason about with confidence: no matter what a stranger typed, `safe_name` contains only
letters and spaces.

**CS lens.** This is an **allow-list** (also called a whitelist): define the small set of
things you know are safe, and reject everything not on that list. Its opposite, a
**deny-list** (blocklist) — trying to enumerate every *dangerous* character — is
structurally weaker, because you have to think of every dangerous thing in advance, while
an allow-list only requires you to know what *valid* input looks like, which is almost
always a smaller, more stable set.

**SE lens.** Notice the shape: `sanitize_name` takes untrusted input and returns something
we've named `safe_name`. That name is doing real work — it documents, at the call site,
that this value has already passed the checkpoint. This is the same idea, done informally
here with a variable name, that Lesson 4 will do formally with a distinct type
(`SanitizedInput` vs. `str`) so that the compiler — not just a careful reader — can catch
the mistake of forgetting to sanitize.

**Security lens.** This is **input validation** implementing the principle of
**fail-safe defaults**: when in doubt, reject. The allow-list doesn't ask "is this specific
string dangerous?" (a question you can get wrong); it asks "is this string made
*exclusively* of things I've already decided are safe?" (a question that's much harder to
get wrong, because the default for anything not explicitly allowed is rejection, not
acceptance).

This code is deleted now — `GreetingBot` won't reappear. What you keep is the pattern:
*untrusted input → checkpoint function → a value you can trust*, and the discipline of
being able to point at the exact line where that crossing happens.

---

## Connect the pieces

Three versions of the same five lines showed you the whole shape of this course:

- **Step 1** — no trust boundary present. Baseline.
- **Step 2** — a trust boundary crossed *invisibly*. The data got through with no
  checkpoint, and nothing in the code even marked that a crossing had happened. This is
  the shape of the vulnerability in every injection attack you'll study.
- **Step 3** — the same crossing, but marked with an explicit checkpoint that enforces an
  allow-list. This is the shape of the *fix* for every injection attack you'll study.

Every remaining lesson in Module B (SQL Injection, Command Injection, XSS) is this exact
pattern, with the checkpoint moved to a different kind of interpreter — a SQL engine
instead of `os.system`, a browser's HTML parser instead of a shell. The interpreter
changes. The missing-checkpoint shape does not.

## What breaks without this

Take Step 2's version of `greet` and imagine, instead of `print`, it passed `name` straight
into a real shell command:

```python
import os
def greet(name):
    os.system("echo Hello, " + name + "!")
```

Typing `Ada` still prints `Hello, Ada!`. But typing:

```
Ada; rm -rf ./some_folder
```

causes the shell to run **two commands** instead of one — `echo Hello, Ada` and then,
separately, `rm -rf ./some_folder` — because the semicolon means "end this command, start
the next one" to the shell, and nothing in the code stopped that character from reaching
it. This is not a hypothetical; it's the literal mechanism behind command injection, which
you'll build and exploit safely in a sandboxed lab in Lesson 5. I'm showing you the shape
now, without running it, so you recognize it on sight before you ever see it as an "attack."

## Recognition

Trust boundaries aren't a security-course abstraction — they're a design decision that
shows up everywhere a system has more than one author:

```
Today: Trust Boundaries (invisible-vs-marked data crossings)

Also recognized in: the OS kernel/user-mode boundary, browser sandboxing between
tabs, container isolation (Docker namespaces), database connection permissions,
API authentication (every request is untrusted until proven otherwise), firewalls
and DMZs separating internal networks from the internet, code signing (is this
binary from who it claims to be from?), and every input field on every website
you've ever used.
```

## Definition of done

Verify each of these yourself before moving to Lesson 2:

- [ ] You ran Step 1, Step 2, and Step 3, and saw the outputs shown above (or close to
      them — exact spacing may differ slightly)
- [ ] You can explain, in one sentence, why Step 2's output is dangerous-*shaped* even
      though nothing bad actually happened when you ran it
- [ ] You can explain, in one sentence, what `sanitize_name` does differently from `greet`
      that makes it a checkpoint
- [ ] You can name the difference between an allow-list and a deny-list, and say which one
      Step 3 uses and why that's the stronger choice
- [ ] Optional but recommended: create a folder for this course (e.g. `security-labs/`),
      save your version of the three scripts there, and run `git init` followed by
      `git add .` and `git commit -m "Lesson 1: trust boundaries — invisible vs. marked
      data crossings"`. The commit message explains *why* this code exists (to make the
      trust-boundary pattern visible), not just *what* changed — a habit worth starting on
      lesson 1, since every future lesson will ask for it.

**Next:** Lesson 2 — CIA Triad and Threat Modeling, where "is this input safe?" becomes
part of a bigger question: safe *for what property* — confidentiality, integrity, or
availability — and how you decide what to defend before you know what the attack looks
like.
