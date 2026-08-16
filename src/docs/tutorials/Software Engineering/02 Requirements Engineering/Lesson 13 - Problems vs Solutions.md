# Lesson 13: Problems vs Solutions

**What you will build.** A CSV export feature, built exactly, faithfully,
correctly to a real stakeholder request — and then a demonstration that
building it exactly as asked didn't actually solve anything, because the
request itself was already a solution in disguise, aimed at a real
problem nobody had stated out loud yet. The transferable problem: most
requests that arrive as requirements are already somebody's guess at a
solution, and building that guess faithfully is not the same thing as
solving the problem underneath it — sometimes it isn't even close.

**What you need to know first.** Lesson 12's pipeline, specifically its
one-line gloss of *Problem* and *Requirements* as the first two stages —
this lesson is the promised deeper treatment of exactly that gap, now
that Domain 1's vocabulary (Lesson 2's programming question versus
engineering question, most directly) is available to build on.

**Terms introduced in this lesson**

- **problem**, given its real, full definition now — a real gap between
  the way things are and the way someone needs them to be, stated
  independently of any particular fix. A problem is true whether or not
  anyone has proposed a way to solve it yet.
- **solution** — one specific, concrete way of closing that gap. A
  problem can have many possible solutions; a solution implies exactly
  one problem it's aimed at, whether or not that problem was ever stated.
- **the XY problem** — a widely recognized, named pattern: someone
  wants to solve real problem X, decides on their own that Y would solve
  it, and then asks for help with Y specifically — describing their
  attempted solution instead of their actual problem. Whoever receives
  the request for Y, with no visibility into X, can build Y perfectly and
  still leave the original problem unsolved, or solved worse than a
  different approach would have. The name comes from a recurring pattern
  on technical help forums, but the underlying failure is universal.

**Objects and methods used.** None new — this lesson's one short function
uses only already-assumed syntax: string concatenation, a `for` loop, and
`"\n".join(...)`.

No pipeline diagram change — this lesson works entirely within the
*Problem* and *Requirements* stages Lesson 12 already named; nothing new
is being added to the sequence itself.

---

## Concept Unit: A Request That Already Arrived as a Solution

### The Problem

A real request lands on a real team: *"Add a button to the account page
that exports a user's contacts as a CSV file."* It's specific, it's
buildable, and it sounds exactly like the kind of thing a requirement is
supposed to be. Is it one?

### The Concept

Read it again, closely: *a button*, *exports*, *as a CSV file* — every
one of those is already a decision about *how* to solve something, not a
statement of *what actually needs to be true*. Ask the one question this
request skipped answering: why does this person want their contacts as a
CSV file at all? The honest answer, once asked, turns out to be: *"so I
can get my contacts into the CRM tool my sales team uses."* That sentence
— get contacts into the CRM tool — is the real **problem**. "A CSV export
button" was never the problem. It was one person's own guess at a
**solution** to a problem they never actually stated, arrived at before
anyone with the fuller picture — what the CRM tool actually needs, whether
other teams have hit this same gap, whether a one-time export is even
enough — had a chance to weigh in.

### CS Lens

This is the same shape as Lesson 2's programming question versus
engineering question, moved one stage earlier in Lesson 12's pipeline: a
request phrased as "build me this specific thing" already presumes an
answer to a question — what actually needs to be true — that was never
asked out loud. Building the specific thing precisely as asked answers a
programming question. It says nothing about whether the underlying
engineering question was ever correctly identified.

### SE Lens

The realistic alternative to accepting "add a CSV export button" as a
requirement isn't refusing every specific request on principle — most
people describing a problem naturally reach for the closest solution they
can picture, and that instinct isn't a mistake to train out of anyone. The
actual discipline is a habit: before treating a specific, solution-shaped
request as settled, ask what real gap it's meant to close, and write
*that* down as the requirement, keeping the originally requested solution
as one candidate answer among possibly several — not the only one ever
considered.

---

## Concept Unit: Building the Solution Exactly as Asked

### The Problem

Suppose the team skips asking why, and builds precisely what was
requested: a function that exports a list of contacts as CSV text.

### The Code, Run for Real

```python
def export_contacts_csv(contacts):
    lines = ["name,email"]
    for contact in contacts:
        lines.append(contact["name"] + "," + contact["email"])
    return "\n".join(lines)
```

Run it against two real contacts:

```python
contacts = [
    {"name": "Alice", "email": "alice@example.com"},
    {"name": "Bob", "email": "bob@example.com"},
]
print(export_contacts_csv(contacts))
```

Running it:

```text
$ python export.py
name,email
Alice,alice@example.com
Bob,bob@example.com
```

This is correct. It's a real, well-formed CSV file, with a header row and
one line per contact, exactly what "export contacts as a CSV file" asked
for. By every standard Lesson 2 used for the programming question, this
function is done.

### The Concept

Now bring back the actual problem this lesson's first unit uncovered:
getting contacts into a specific CRM tool. That CRM tool, like most real
import tools, has its own real requirements for what a valid import file
looks like — and a realistic one might require a `company` column this
export never asked about at all, and might expect header names like `Full
Name` and `Email Address` rather than `name` and `email`. The file this
function produces is a completely correct CSV export, and importing it
into that CRM tool fails, or silently drops every contact's company
information, because the actual problem was never "produce a CSV file" —
it was "get this specific data into this specific other tool, correctly."
Nothing about `export_contacts_csv` needs to be debugged. Its logic is
right. Its *target* was wrong from the moment "CSV export button" was
accepted as the requirement instead of the real problem underneath it.

### Mechanical Walkthrough

- `contact["name"] + "," + contact["email"]` — already-assumed string
  concatenation and dict indexing; the only thing worth tracing here is
  that this is precisely, literally what "export as CSV" was asked to
  produce — the code is not where this lesson's failure lives.
- `"\n".join(lines)` — already-assumed `str.join`, joining the header and
  each contact's line with newlines into one final string.

### CS Lens

This is a direct, concrete instance of the **XY problem**: X was "get
contacts into the CRM," Y was "a CSV export button." The team was asked
for, and correctly delivered, Y — with zero visibility into X, because X
was never written down as the actual requirement anywhere.

### SE Lens

The cost of this mistake wasn't caught until the CRM import failed —
which means everything before that point (the request, the design of the
button, the implementation, even a reasonable test confirming the CSV
looks right) happened without anyone having the information needed to
catch it earlier. This is Lesson 5's cost-of-change curve again, applied
to a requirements mistake instead of a technical one: the same missing
fact — what does the CRM tool actually need — costs one clarifying
question if caught before any code is written, and a rebuilt export
feature, reviewed, tested, and shipped a second time, if caught only once
a real user tries to use it for its real purpose.

---

## Concept Unit: Naming the Pattern So It Can Be Caught Earlier

### The Problem

This specific CSV example is one instance of a much more general trap.
What makes it recognizable in advance, rather than only obvious in
hindsight?

### The Concept

The reliable signal is in the *shape* of the request itself, not in
whether it happens to be wrong: any request phrased as a specific
implementation detail — a button, a file format, a particular algorithm,
a specific field — is a candidate for this exact trap, whether or not it
turns out to be the right solution in the end. The **XY problem** doesn't
mean every solution-shaped request is wrong; the CSV button might, after
asking, turn out to be exactly the right answer to the real problem. What
it means is that a solution-shaped request carries no information, by
itself, about whether it's the right one — that information only exists
one level up, in the actual problem, which has to be asked for
explicitly, every time, rather than assumed to already be implied by
whatever solution happened to be requested first.

### CS Lens

This exact pattern is well known far outside software: a classic
technical-support scenario where someone asks "how do I get the last
three characters of a filename" when their real, unstated goal is
checking whether a file has a specific extension — a completely different,
often simpler problem with its own better solution. A patient describing
a home remedy they tried, rather than the original symptom, to a doctor.
A student asking how to fix one specific line of code, when the actual
problem is a misunderstanding several steps earlier that the specific
line was only a symptom of. In every case, answering the literal question
asked is possible, correct, and still frequently useless, because the
question itself was never the real problem.

### SE Lens

The discipline this lesson is building toward — ask what problem a
request is actually trying to solve, before treating the requested
solution as settled — is the entry point to this curriculum's entire
Requirements Engineering domain. It isn't free: asking "why" costs a real
conversation, sometimes an uncomfortable one if it looks like second-
guessing someone who already thought they'd done the analysis themselves.
The realistic alternative — building exactly what's asked, every time,
without ever asking why — was just demonstrated directly: a correct
CSV file, a failed CRM import, and a second round of work that a single
question, asked before any code was written, would have made unnecessary.

---

## Connect the Pieces

One request, followed from its surface down to what it actually needed:

1. **The request arrives already as a solution** — "add a CSV export
   button," specific and buildable, with no stated problem underneath it
   yet.
2. **The real problem, once asked for** — getting contacts into a
   specific CRM tool, a genuinely different, more specific question than
   "produce a CSV file."
3. **The solution, built exactly as requested, and correct** —
   `export_contacts_csv` does precisely what was asked, verified with real
   output.
4. **The mismatch, discovered only once it mattered** — the CRM tool's
   own real requirements were never part of the original request, so a
   correct CSV export still failed to solve the actual problem.

## What Breaks Without This

Never ask why, for any request, ever — treat every solution-shaped ask as
already being the requirement, and build it faithfully every time.
Nothing about this habit produces visibly broken code — every individual
feature, examined alone, is likely to be implemented correctly, the same
way `export_contacts_csv` was. What accumulates instead is a system full
of features that were each answers to a "Y" nobody ever traced back to a
real "X" — each one technically working, a growing number of them not
actually solving anything anyone needed solved, discovered one
disappointed user at a time, long after the code that "worked" already
shipped.

## Exercises

1. Take the CSV export function and adapt it to actually solve the real
   problem this lesson uncovered: produce output with `Full Name`,
   `Email Address`, and `Company` columns instead of `name` and `email`,
   given contacts that now include a `"company"` field. Run it and
   confirm the header row matches what a CRM import would realistically
   expect.
2. Think of a real request you've made to someone else — a
   friend, a coworker, a piece of software's support team — that was
   already phrased as a solution ("can you send me the file as a PDF,"
   "can this button be bigger"). Name the real problem underneath it, in
   one sentence.
3. Write a short, realistic solution-shaped request of your own (not this
   lesson's CSV example), and then write the question you'd ask to find
   the real problem underneath it, and a one-sentence guess at what that
   real problem might turn out to be.

## Definition of Done

- [ ] You can state the difference between a problem and a solution, in
      your own words, using this lesson's own definitions.
- [ ] You can define the XY problem and give one real example that isn't
      from this lesson.
- [ ] You've completed all three exercises, including the updated CSV
      export function from Exercise 1, run and verified.
- [ ] Commit the updated `export_contacts_csv`. Commit message should
      explain *why* the columns changed: for example, `Lesson 13 — export
      columns changed to match the CRM's real import requirements, the
      actual problem behind the original CSV-button request.`
