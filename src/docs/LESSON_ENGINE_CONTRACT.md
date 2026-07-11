# Lesson Engine Contract

Every lesson written for the interactive lesson engine — whether authored by a human or
an agent — must meet this contract. It is not a style guide. It is a definition of what
teaching means in this format. A lesson that does not meet this contract is not a lesson.
It is a wall of text with a text box at the end.

This contract extends the core teaching principles in [LESSON_CONTRACT.md](LESSON_CONTRACT.md).
Read that document first. Everything in it applies here — this document only adds or
overrides what is specific to the lesson engine format: the markdown structure, the
runnable examples, and the challenge–test system.

---

## The Format in One Sentence

A lesson engine file is a markdown document where `##` headers create navigable steps,
regular code fences create runnable examples, `challenge` fences create editable starter
code, and `test` fences contain assertions that run against what the learner wrote.

---

## File Structure

Every lesson file starts with a frontmatter block:

```
---
series: python-fundamentals
level: 0
title: Variables & Types
lang: python
---
```

Fields:
- `series` — the series identifier. Must match an entry in `series.ts`.
- `level` — integer. Level 0 is the first level. Levels within a series build on each other.
- `title` — shown in the UI header. State the concept, not the activity. "Variables & Types"
  not "Learning About Variables."
- `lang` — the default language for code fences that do not specify one. Must be a
  language the executor supports (`python`, `javascript`, `typescript`, `sql`).

Anything before the first `##` header is the intro paragraph. It is automatically merged
into the first step. Use it to state what concept group the lesson covers, why it matters,
and what the learner will be able to do after finishing. Keep it to two to four sentences.
Do not waste it on "In this lesson we will learn about...".

---

## Step Structure

Each `##` header creates one step in the UI. The learner navigates step by step.

A step is either a **concept step** or a **challenge step**.

A **concept step** contains:
- Prose explaining the concept (required)
- One or more runnable code examples (required unless the concept is purely definitional)
- No `challenge` fence

A **challenge step** contains:
- Prose describing the problem to solve (required — see Challenge Writing below)
- Exactly one `challenge` fence
- Exactly one `test` fence
- No runnable examples

A step must not mix runnable examples and a challenge fence. Separate them.

---

## Pairing Rule

Every concept group is immediately followed by its challenge. The structure is:

```
## Concept Group Name
...prose + examples...

## Challenge: [task name]
...prose + challenge fence + test fence...
```

Challenges are not collected at the end of the lesson. A challenge that appears three
steps after the concept it tests does not reinforce the concept — it tests recall.

The number of challenge steps equals the number of concept groups. If a lesson has two
challenges, it covers two concept groups. Not four. Not one. Two.

A concept group is a cluster of ideas that are best understood together. "Variables
and primitive types" is one group — the ideas are interdependent and need each other
to make sense. "Arithmetic" and "type conversion" may be separate groups if the
challenge for each tests a genuinely different skill, or the same group if the challenge
requires both.

---

## Runnable Examples

A runnable example is a code fence with a real language identifier:

````
```python
x = 10
y = 3
print(x / y)
print(x // y)
```
````

Rules for every runnable example:

1. **One concept per example.** Do not teach `//`, `%`, and type conversion in one block.
   Show `//` and `%` together (they are a pair), then type conversion in a separate block.

2. **The example is self-contained.** It runs without any prior state. No imports from
   other examples, no variables defined in a previous block.

3. **State the output in the prose.** Before the code block, say what it prints or
   produces. After the code block, explain what that output demonstrates. The learner
   should be able to predict the output from the prose before they click Run.

4. **Vary one thing at a time.** If you want to show a concept with two inputs, use two
   separate blocks — or tell the learner to change one thing and run again. "Change
   `True` to `False` on line 2 and re-run — notice what `bool()` returns" is a teaching
   instruction. Two side-by-side code blocks that look the same except one character
   is not.

5. **No placeholder names.** Every variable name describes what it holds. No `x = 42`
   unless `x` is genuinely a mathematical unknown. Use `age = 42`, `temperature = 37.5`,
   `is_complete = False`. Students learn to name things by seeing good names modelled.

6. **No comments that restate the code.** `# int` next to `x = 42` says nothing. A
   comment is only worth writing if it states something the name and code cannot: why
   this value, why this structure, what breaks if it changes.

7. **Keep examples short.** Four to twelve lines. Longer examples lose the concept in
   the surrounding code. If a concept needs more than twelve lines to demonstrate, split
   it into two sequential examples with prose between them.

---

## The Runnable Example Is the Concept Lab

The original [LESSON_CONTRACT.md](LESSON_CONTRACT.md) requires a concept lab before every
new construct. In the lesson engine, the runnable example _is_ the concept lab.

The same rules apply:
- Strip the example of every complexity that is not the concept itself
- Name what the example demonstrates, not just what it does
- State exactly what output to expect and what that output proves
- Vary the input at least once to show the concept in two lights

The difference from the original contract: the code is not deleted. The learner runs it,
modifies it, and runs it again. The examples are interactive, not disposable. Write them
accordingly — they should reward modification.

---

## Challenge Writing

A challenge step tests whether the learner can apply the concept just taught in a new
context. The challenge is not a repetition of an example. It is a new problem whose
solution requires the concept.

### The prose

The challenge prose must contain:

1. **The task, stated clearly.** What function to write, what it should do, what it
   takes as input, and what it returns. Do not describe the algorithm. Describe the
   contract.

2. **One clarifying detail that prevents a wrong interpretation.** "Returns a float,
   not an int." "The format is `type: value`, not `value (type)`." This should be
   the one piece of information that the tests do not make obvious.

3. **Nothing else.** Do not hint at the solution. Do not describe the approach. The
   learner should be able to read the prose, understand what is needed, and begin.

### The starter code

The `challenge` fence contains the function signature with a `pass` body:

````
```challenge
def celsius_to_fahrenheit(c):
    pass
```
````

Rules:

- **Always include the function signature.** Never leave the challenge fence empty.
  The learner should not have to figure out the function name or argument names.
- **Use `pass` for Python, `return null` or `// TODO` for JavaScript.** The body must
  be syntactically valid but semantically empty.
- **Argument names must be descriptive.** `(c)` only if `c` is a conventionally accepted
  abbreviation (e.g., `c` for Celsius). Otherwise use full words.
- **If the challenge requires a helper or class, include its stub too.** The learner
  should start from code that runs (even if it returns wrong answers) not from code
  that throws a syntax error.

### The tests

The `test` fence contains assertion lines:

````
```test
assert celsius_to_fahrenheit(0) == 32.0
assert celsius_to_fahrenheit(100) == 212.0
assert celsius_to_fahrenheit(-40) == -40.0
assert celsius_to_fahrenheit(37) == 98.6
```
````

Rules:

1. **Four to six assertions per challenge.** Fewer than four does not adequately specify
   the contract. More than six tests peripheral behaviour instead of the concept.

2. **Cover the zero/identity case.** The input that produces the simplest or "default"
   output. `celsius_to_fahrenheit(0) == 32.0`. `describe(42) == "int: 42"`.

3. **Cover at least one typical case.** Representative input from the middle of the domain.

4. **Cover at least one boundary or edge case.** Negative numbers. Empty strings.
   Zero. The value where behaviour changes. `celsius_to_fahrenheit(-40) == -40.0`
   (the one temperature where Celsius and Fahrenheit coincide) is a good edge case
   because it reveals whether the formula is correct.

5. **Each assertion is one line, one `assert`, no logic.** No `for` loops over test
   data. No helper functions. Each assertion is independently readable.

6. **Floating point: only assert exact equality when the result is mathematically exact.**
   `0 × 9/5 + 32 = 32.0` exactly. `37 × 9/5 + 32 = 98.6` exactly in IEEE 754.
   When the result is not exact, use `round(result, N) == expected` or restructure
   the test to avoid the precision hazard.

7. **Test the contract, not the implementation.** If two different implementations
   both produce the correct output, both should pass. Do not write tests that pass
   only for one particular algorithm.

8. **The tests fully specify the function's behaviour** for the inputs they cover. A
   learner who makes all tests pass should have understood the concept — not just
   reverse-engineered the assertions.

---

## What the Learner Sees Per Step

Before writing a step, describe what the learner will read and do:

**Concept step:** Read prose. Read the code examples before running them. Predict the
output from the prose. Click Run and verify. Optionally enable Debug to watch the
execution line by line and see variables in the right panel.

**Challenge step:** Read the prose. Understand the contract. Open the editor. Write the
function. Click Run Tests. Read the pass/fail results. Enable Debug to trace execution
through the tests if stuck.

Write every step to serve those two flows. Prose that would be skipped by a learner
who just wants to write code is prose that is not doing its job.

---

## Explanation Standards (adapted from LESSON_CONTRACT.md)

These rules from the original contract apply without modification. They are restated here
in brief to keep this document self-contained.

### Describing vs Teaching

A description tells you what something does. A lesson explains why it works, what it
connects to, and what breaks without it.

**Description:** `type()` returns the type of a value.

**Teaching:** `type()` is how Python exposes its type system at runtime. Every value in
Python has a type — `int`, `float`, `str`, `bool` — and Python stores that type
information alongside the value in memory. `type(x)` reads that stored type and returns
it as a type object. This is what makes dynamic typing work: Python does not know the
type of `x` when it compiles your file; it reads the type at the moment `type(x)` runs.

### The Two Lenses

Every significant code block — example or challenge — is explained through two lenses:

**The CS lens:** What computational concept does this code embody? Name it.
Symbol table. Dispatch table. Coercion. Type system. First-class function. Do not let
a concept be implicit.

**The SE lens:** Why is it designed this way? What principle does it follow?
Separation of concerns. Single responsibility. Encapsulation. The principle is named
and connected to the specific code in the lesson.

Both lenses apply to every significant block. Neither is optional.

### Explain Before You Show

Before every code block, state the problem it solves. After every code block, state
what decision it embodies and what it connects to.

Within a concept step, each new code block follows this structure:

1. The problem — what are we trying to show?
2. The code — the smallest example that shows it
3. The walkthrough — what the code actually does
4. The CS explanation — what concept this embodies
5. The SE explanation — why this design, not another
6. What breaks without it — concrete and specific

Not every item needs to be long. A sentence each is often enough. All six must be present
for any code block that introduces something the learner has not seen before.

---

## Define at Use

Every concept, construct, built-in function, operator, or syntax the learner may not
know must be defined at the exact point it appears — not in a glossary, not in a prior
step. The first appearance carries the definition. After that, the term is used freely.

**Example — `//` first appearance:**
"`//` is floor division. It divides and then rounds down to the nearest integer,
regardless of the sign of the inputs. `10 // 3` gives `3`, not `3.33...`. `10 / 3`
always gives `3.33...` — `/` in Python 3 always returns a float even when both
operands are integers. `//` gives an integer when both operands are integers."

Every built-in function follows the same rule: state what it does, what it accepts,
what it returns, and what it does on unusual input.

```
type(value) — returns the type of value as a type object. type(42) returns <class 'int'>.
int(x) — converts x to an integer. int("25") returns 25. int(3.9) returns 3 (truncates, does not round).
str(x) — converts x to its string representation. str(42) returns "42".
bool(x) — converts x to True or False. bool(0) is False. bool(any nonzero number) is True.
```

Names must be descriptive. The exception is established mathematical notation where
the single letter is the concept (`c` for Celsius, `x` and `y` for coordinates). In
those cases the meaning is stated explicitly.

---

## The Aha Moment

When a concept from a previous step or a previous lesson appears in a new context,
name the connection explicitly. One sentence is enough.

**Without the connection:**
"We use `type(value).__name__` to get the type string."

**With the connection:**
"`type(value).__name__` — the same `type()` built-in from the previous step,
but now we go one level further: `.\_\_name\_\_` extracts the type's name as a plain
string (`'int'`, `'str'`) instead of the type object itself. Every Python type object
has a `__name__` attribute for exactly this purpose."

---

## Repetition Rule (adapted)

Basic syntax is explained once. After its first appearance in the curriculum, a `for`
loop or an `if` statement is used without comment.

Hard concepts are named at every appearance:
- Named CS concepts (recursion, symbol table, hash map, state machine, type coercion)
- Named SE principles (separation of concerns, single responsibility, encapsulation)
- Named patterns (dispatch table, factory, observer)
- Mathematical ideas (modular arithmetic, floating-point representation)

The restatement is short — one or two sentences connecting the concept to the code in
front of the learner. The goal is reinforcement through repeated encounter in different
contexts.

---

## Connection Standards

### Connect backwards
Open each concept step by connecting to what the learner already knows from previous
steps or levels. "We used `type()` in the last step to inspect primitive types — here
we use `type().__name__` to turn that type information into a string we can work with."

### Connect forwards
When appropriate, preview what the current concept makes possible. Not a promise —
a hint. "Once you can convert between types reliably, you can accept input from a user
as a string and convert it to a number before computing with it."

### Connect to the real world
Every concept taught exists in production software. Name where.

"Python's type system is what tools like `mypy` and IDEs use for type checking — they
read the type annotations and the type() system together to flag mismatches before your
code runs."

---

## Maximum Extraction

A code block about `//` is also a block about integer semantics, the difference between
mathematical division and integer division, and the historical reason Python 3 changed
`/` to always return a float. Teach as many of those as the step can hold without losing
focus on the primary concept.

The learner should finish each step knowing:
- What the concept is
- Why it exists
- What it connects to in the language or discipline
- Where they will encounter it again

---

## Structure

Every lesson file must contain:

1. **Frontmatter** — `series`, `level`, `title`, `lang`
2. **Intro paragraph** — what the lesson covers, why it matters, what the learner will
   be able to do. Merged into the first step.
3. **Concept steps** — one per concept group. Each has prose and runnable examples.
4. **Challenge steps** — one per concept group, immediately following its concept step.

The minimum viable lesson is: one concept step + one challenge step. Two concepts = two
concept steps + two challenge steps. The lesson ends when the concept group is complete —
not when a word count is reached.

---

## Checklist

Before a lesson is published:

**Format**
- [ ] Frontmatter is present and all four fields are correct
- [ ] Intro paragraph states the concept and why it matters in 2–4 sentences
- [ ] Every `##` step is either a concept step or a challenge step — never mixed
- [ ] Challenge steps immediately follow their concept step — none collected at the end
- [ ] Number of challenge steps equals the number of concept groups

**Concept Steps**
- [ ] Every runnable example is self-contained — runs without state from any prior block
- [ ] Every example demonstrates exactly one concept or one closely related pair
- [ ] Output is stated in the prose before the code block, not discovered by running
- [ ] All variable names are descriptive — no single letters except mathematical convention
- [ ] Every new syntax construct, built-in function, or operator is defined at first use
- [ ] Both CS and SE lenses are present for every significant block
- [ ] Examples are 4–12 lines

**Challenge Steps**
- [ ] Prose describes the contract (what to build), not the algorithm (how to build it)
- [ ] Prose includes exactly one clarifying constraint that prevents misinterpretation
- [ ] Starter code includes the function signature and a valid empty body
- [ ] Argument names in the starter code are descriptive
- [ ] 4–6 assertions, no more, no fewer
- [ ] Zero/identity case is covered
- [ ] At least one typical case is covered
- [ ] At least one boundary or edge case is covered
- [ ] Each assertion is one line, one `assert`, no control flow
- [ ] No floating-point equality assertion unless the result is mathematically exact
- [ ] Tests specify the contract, not the implementation — multiple correct implementations pass

**Teaching**
- [ ] Every significant code block has a walkthrough (not just a lens)
- [ ] Describing vs Teaching: prose explains why, not just what
- [ ] Connections backwards (to prior steps/lessons) are made explicit
- [ ] Connections forwards (what this makes possible) are present where they exist
- [ ] At least one real-world connection is named
- [ ] Hard concepts (CS concepts, SE principles) are named, not implied

**Names**
- [ ] Every lesson title names the concept, not the activity
- [ ] Every step title (`##`) describes what the learner will understand after reading it
- [ ] Every challenge title (`## Challenge: ...`) names the task, not the concept

---

_This contract governs every lesson file in the lesson engine, regardless of language,
series, or author. The test: could a learner complete the challenge using only what the
concept step taught, without looking anything up? If not, the concept step is incomplete._
