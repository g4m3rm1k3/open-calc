# Concept: Avoiding Premature Abstraction

**What you'll understand by the end:** how to judge whether a piece of code has earned its own reusable unit (a function, a component, a file) yet, rather than defaulting to extracting everything on sight.

**Prerequisites:** none.

## Setup

No install needed — any language or framework works. The isolated example uses a small UI component, but the underlying judgment applies equally to functions, classes, and modules in any codebase.

## The Problem

Two opposite mistakes are both real and common: leaving genuinely duplicated, reused logic scattered and copy-pasted across a codebase (a real maintenance cost — a bug fix or change has to be found and repeated everywhere), and extracting *everything*, including one-off, single-use pieces with no real logic, into their own separately-named function/file purely out of habit — adding real indirection (another file to open, another name to remember) for something that had no actual reuse need to justify it.

## The Isolated Example

Two pieces of UI, side by side, in the same file:
```tsx
function App() {
  return (
    <>
      <h1>Toolpath</h1>
      <pre>{JSON.stringify(points, null, 2)}</pre>
    </>
  );
}
```

Extracting the heading (no real justification):
```tsx
function Heading() {
  return <h1>Toolpath</h1>;
}
// Used exactly once, has no props, no logic, no other caller anywhere.
```

Extracting the data dump (a real, statable justification):
```tsx
interface DataDumpProps {
  data: unknown;
}
function DataDump({ data }: DataDumpProps) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
// Used here for `points`; a tool-table view and a machine-state view,
// elsewhere in the same real project, both need the identical
// "show me this data as readable JSON" behavior.
```

**What this proves:** both extractions are mechanically identical in shape (a small function returning JSX) — the difference that matters is entirely external to the code itself: `DataDump` has more than one real, current consumer needing identical behavior; `Heading` has exactly one, with no stated plan for a second.

## Mechanical Walkthrough

- The **rule of three** (a widely-cited, informal heuristic, not a strict law) suggests waiting until a piece of logic is needed a *third* time before extracting it — the first occurrence is just code; the second might be coincidence; the third is real, confirmed duplication worth naming and centralizing.
- A stronger, more reliable signal than a pure repetition count: does the piece being considered for extraction have a **real, statable job** — "format arbitrary data as readable JSON," for instance — that's meaningful independent of its current one caller? A one-line static heading has no such independent job; it's just markup that happens to be sitting in a specific place.
- The cost being weighed isn't zero on either side: under-extraction risks real, compounding duplication (the same fix applied inconsistently across several copies); over-extraction risks real, compounding indirection (a codebase where finding out what a page actually renders requires opening five separate one-line files).

## CS Lens

This is a judgment call about the right level of **abstraction under uncertainty** — an abstraction (a named function, a reusable component) is a bet that a piece of logic will be needed again, in a form general enough to serve those future needs; a bet made too early, before real, concrete future needs are known, risks guessing wrong about what the *right* general shape even is, requiring rework anyway once the real second and third use cases arrive with requirements the first guess didn't anticipate.

Also recognized in: the YAGNI ("You Aren't Gonna Need It") principle from Extreme Programming, and the more general engineering tension between designing for known, current requirements versus speculative future ones — a recurring theme across nearly every real engineering discipline, not unique to software.

## SE Lens

The real, practical test worth asking before extracting something: "if I needed to change this specific piece of behavior, would I want to find and change it in exactly one place, or does it genuinely only exist in one place today with no other real consumer even in view?" A one-off heading fails this test; a "format this data as JSON" utility that a project's own stated near-term plans will clearly need again passes it. Naming this judgment call explicitly, in code review or in a project's own documentation, avoids re-litigating "should this be its own file" from scratch, inconsistently, every single time the question comes up.

## Connection

Directly informs `react-component-props.md`'s decision of when a piece of UI deserves to become its own component with real props, versus staying inline. Related to `adapter-pattern.md` — an adapter is justified by a real, current need to isolate a translation boundary, not by "this looks like it should probably be its own function." A real, concrete payoff of this same judgment call applied to *type* structure rather than function extraction, from later in one contributing project's own history: a domain object's "kind" (which of several real variants it is) modeled as a plain string with optional fields, explicitly instead of a subclass-per-kind hierarchy, on the stated real reasoning that a full hierarchy "would be pure ceremony" at that size — confirmed paying off directly once new, real per-kind behavior (geometry generation, one branch per kind) was added purely by branching on the string, with zero new classes needed.

## Try It Yourself

1. Look through a real, current codebase you have access to for a function or component with exactly one caller, no meaningful independent logic, and no stated plan for reuse — consider (without necessarily doing it) whether inlining it back into its one call site would make the code easier or harder to follow.
2. Find the opposite: a piece of logic genuinely duplicated, near-identically, in three or more places in a real codebase — sketch what a single, extracted version would look like, and identify what (if anything) differs slightly between the current copies that the extracted version would need to account for.
3. Write down, in your own words, a rule for your own future work distinguishing "this needs its own function/file now" from "this can stay inline for now" — then apply it to the next real piece of code you write, and see whether it holds up in practice.

## A Second Real Facet: Convergent Design — Recognizing Duplication That Arrived Independently

The rule of three, as originally stated, imagines one person copy-
pasting the same logic a second and third time. A real, different, and
genuinely trickier case: two pieces of code, built **independently**,
for two different real domains, by someone not deliberately copying
anything — that still end up with strikingly similar real structure,
because the underlying problem genuinely has the same shape.

```python
class RecipeCard:
    def __init__(self, name):
        self.name = name
        self.notes = []

    def jump_to_next_note(self, current_index):
        if not self.notes:
            return current_index
        return (current_index + 1) % len(self.notes)


class ChecklistBoard:
    def __init__(self, title):
        self.title = title
        self.items = []

    def jump_to_next_item(self, current_index):
        if not self.items:
            return current_index
        return (current_index + 1) % len(self.items)


card = RecipeCard("Bread")
card.notes = ["proof 1hr", "bake 40min"]
board = ChecklistBoard("Move Prep")
board.items = ["pack boxes", "label boxes", "load truck"]

print("RecipeCard next from 1:", card.jump_to_next_note(1))
print("ChecklistBoard next from 2:", board.jump_to_next_item(2))
```

**Real output, run this session:**
```
RecipeCard next from 1: 0
ChecklistBoard next from 2: 0
```

**What this proves:** `RecipeCard` and `ChecklistBoard` were written
for two genuinely different real domains (cooking notes, a moving
checklist) — nothing about either one's own real purpose has anything
to do with the other. Yet their real navigation logic
(`modulo-for-cyclic-wraparound-indexing.md`'s own wraparound pattern,
guarded against an empty collection) is now, independently, nearly
identical — both correctly wrap from the last real index back to `0`.

**The judgment call this facet actually names:** this is real, worth-
noticing structural duplication — but it's **two** independent
occurrences, not three. The rule of three's own traditional reading
treats a second occurrence as "possibly coincidence, not yet
confirmed" — worth **noting explicitly**, so it isn't silently
forgotten, but not automatically worth extracting a shared base class
or mixin over yet, especially since the two real domains might still
diverge in ways a shared abstraction would have to awkwardly
accommodate. A **third**, independently-arrived-at instance of the
identical shape would be the real, traditional threshold this file's
own first facet already names.

**Mechanical note:** what makes this genuinely harder to catch than
ordinary copy-paste duplication is that there's no shared history to
grep for — `RecipeCard` and `ChecklistBoard` were never derived from
each other, so nothing marks them as related; recognizing the
convergence requires actually noticing the *structural* similarity,
not tracing a copy-paste lineage.

**A real postscript, from later in one contributing project's own
history:** this facet's own exercise above asks the reader to imagine
a real third instance and reconsider the extraction judgment once it
arrives. A real third instance did eventually show up — a domain
object's own store/panel/designer-dialog structure, built once, then
deliberately built a **second** and **third** time for two further,
unrelated real domains, each new instance's own code explicitly
stating in its own docstring that it was mirroring the prior one's
reasoning on purpose. That's a genuinely different real starting point
from this facet's own independent-convergence framing (which assumes
nobody set out to copy anything) — but it lands at the identical real
threshold: three instances of one shared shape, still, honestly,
without a shared abstraction ever extracted. Confirmed directly rather
than assumed: no generic base class or shared store type exists for
this real shape even at three instances — a genuine, open, real
tension between the rule of three's own traditional threshold and this
file's own governing judgment call (extract only once a real,
concrete abstraction pays for itself), worth naming honestly rather
than resolving one way or the other by default. Deliberate imitation
across independently-scoped features and true independent convergence
turn out to raise the identical real question once a third instance
exists, even though they arrive at that point by genuinely different
real paths.

### Try It Yourself (second facet)

1. Write a third, independent class (say, `PlaylistQueue`, tracking
   songs) with the identical real navigation shape, and reason about
   whether hitting the real "three independent instances" threshold
   changes your own judgment about whether extraction is now worth it.
2. Sketch what a shared base class or mixin (`CyclicNavigator`, say)
   would actually look like for these three classes — then identify
   one real way the three domains might plausibly diverge in the
   future (a `RecipeCard` needing to skip disabled notes, perhaps) that
   a shared abstraction would need to account for, or would awkwardly
   constrain.
3. Explain, in your own words, why *noting* a two-instance convergence
   explicitly (a comment, a shared citation in documentation) has real
   value even when the actual judgment call is "not yet" — what real,
   concrete problem does silently *not* noting it risk, compared to
   noting it and still deciding to wait?
4. Sketch, concretely, what a shared abstraction *would* have to look
   like for this facet's own real postscript (a store/panel/designer
   shape spanning three genuinely unrelated real domains) — then
   reason about whether the honest answer is "this is overdue" or
   "the three domains' own real differences would make a shared
   abstraction more awkward than the current, real duplication," and
   what additional, concrete evidence (a fourth instance? a real,
   costly bug from the duplication itself?) would change that answer.
