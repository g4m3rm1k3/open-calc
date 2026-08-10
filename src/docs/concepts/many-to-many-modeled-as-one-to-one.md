# Concept: Modeling a Many-to-Many Relationship as if It Were One-to-One

**What you'll understand by the end:** the real, concrete modeling
mistake of persisting a single field for a relationship that's
genuinely many-to-many, and the real fix — an ephemeral, one-off
question object, constructed, used once, and discarded, rather than
stored state pretending a single "true" answer exists.

**Prerequisites:** `python-classes-instances.md`,
`reference-by-id-not-by-object.md`.

## Setup

None — plain Python, no packages.

## The Problem

Some real-world relationships are genuinely **many-to-many** — many
recipes can be cooked in many kitchens, and the reverse is true too;
no single recipe has one true, exclusive kitchen. Modeling this as a
single field on one side (`recipe.kitchen_id`) is a real, concrete
mistake: it silently assumes a fact that doesn't exist — "this recipe
has exactly one true kitchen" — and the moment a second, equally valid
real relationship needs representing, the model has no honest way to
hold it.

## The Isolated Example

```python
from dataclasses import dataclass


@dataclass
class RecipeBroken:
    name: str
    kitchen_id: str | None = None  # "the" kitchen this recipe belongs to


pasta = RecipeBroken(name="Pasta")
pasta.kitchen_id = "kitchen-1"
print("pasta is now permanently tied to ONE kitchen:", pasta.kitchen_id)
print("but pasta is ALSO validly cooked in kitchen-2 -- no field for that")


@dataclass
class KitchenCompatibilityCheck:
    """An EPHEMERAL question: 'would this recipe work in this kitchen?'
    Deliberately never stored -- constructed, used once, discarded."""
    recipe_name: str
    kitchen_id: str

    def is_compatible(self, kitchen_equipment):
        return "stove" in kitchen_equipment


check1 = KitchenCompatibilityCheck("Pasta", "kitchen-1")
check2 = KitchenCompatibilityCheck("Pasta", "kitchen-2")
print("Pasta compatible with kitchen-1:", check1.is_compatible({"stove", "oven"}))
print("Pasta compatible with kitchen-2:", check2.is_compatible({"stove"}))
print("the SAME recipe checked against MULTIPLE real kitchens -- no conflict")
```

**Real output, run this session:**
```
pasta is now permanently tied to ONE kitchen: kitchen-1
but pasta is ALSO validly cooked in kitchen-2 -- no field for that
Pasta compatible with kitchen-1: True
Pasta compatible with kitchen-2: True
the SAME recipe checked against MULTIPLE real kitchens -- no conflict
```

**What this proves:** `RecipeBroken.kitchen_id` genuinely can only
hold **one** real value at a time — assigning `pasta.kitchen_id =
"kitchen-1"` leaves no honest way to also represent its equally real
compatibility with `"kitchen-2"`. `KitchenCompatibilityCheck` sidesteps
the whole problem: it never claims to be *the* relationship at all —
each instance is a real, one-off question, asked and discarded, and
checking the identical `"Pasta"` recipe against two different real
kitchens produces two independent, non-conflicting real answers,
because neither check is ever stored as *the* truth about the recipe.

## Mechanical Walkthrough

- A **one-to-one** (or one-to-many, from the "one" side) relationship
  is correctly modeled as a single field — a document genuinely does
  have exactly one current file path, for instance.
- A genuinely **many-to-many** relationship has no single "true" value
  to store on either side — persisting one anyway (`kitchen_id` on
  `Recipe`) silently encodes a false, oversimplified constraint that
  doesn't reflect the real domain at all.
- The real fix demonstrated here doesn't try to store the many-to-many
  relationship *correctly* in a richer structure (a real set of
  compatible kitchens, say) — it recognizes that the actual real need
  was never "remember this relationship" at all, only "answer this one
  question, right now, given these two specific things" — an
  **ephemeral** object, constructed for exactly one real check and then
  discarded, never attached to either side as persisted state.
- This is a real, different fix from simply switching `kitchen_id: str`
  to `kitchen_ids: set[str]` (which *would* correctly model a real,
  persisted many-to-many relationship, if one were actually needed) —
  the deeper, real insight here is recognizing when *no* relationship
  needs to be persisted at all, only checked on demand.

## CS Lens

This is a real, concrete instance of a **cardinality mistake** —
modeling a relationship's real multiplicity (one-to-one, one-to-many,
many-to-many) incorrectly, the exact same category of error a real
database schema review exists to catch before a table is ever built.
The deeper resolution chosen here — recognizing the relationship
doesn't need to be *stored* at all, only *computed on demand* — is a
real, related idea to `caching-and-memoization.md`'s own "derived vs.
stored" framing, applied in the opposite direction: rather than caching
a derived value for reuse, this fix deliberately keeps a real,
per-query answer **uncached**, specifically because persisting it at
all was the actual mistake, not merely persisting it in the wrong
shape.

Also recognized in: a real database schema mistakenly using a foreign
key column for a relationship that should be a real junction/join
table instead (the identical real cardinality error, in SQL terms);
any domain model asserting a single "owner" for something that
legitimately has several, real, valid owners at once.

## SE Lens

The real, practical cost of the original mistake: every piece of code
built on top of `recipe.kitchen_id` silently inherits the false
assumption that a recipe has exactly one real kitchen — a cost that
stays invisible until a genuinely valid, real second relationship
actually needs representing, at which point the fix isn't a small
patch, it's a real, structural correction (exactly what this project's
own history shows: removing a persisted field entirely, renaming the
surrounding classes, deleting now-meaningless tests). The real lesson
worth taking from a caught cardinality mistake like this one: the fix
that seems obvious (add a list instead of a single value) isn't always
the *right* fix — sometimes the real, correct resolution is recognizing
the relationship was never something to persist in the first place.

## Connection

Builds on `python-classes-instances.md` and directly extends
`reference-by-id-not-by-object.md`'s own reasoning about what should
and shouldn't be stored where. A real, applied instance in this
project's own history: a program-to-machine relationship, initially
modeled as a single persisted field on a document, corrected once a
human caught that the same real program can validly run on more than
one real machine — the identical real mistake and identical real
resolution (an ephemeral, on-demand check, never persisted) this
file's own isolated example demonstrates.

## Try It Yourself

1. Model the identical real relationship correctly as a genuine
   many-to-many structure (`kitchen_ids: set[str]` on `Recipe`, or a
   separate join table if using a database) and reason about when
   that's the *right* fix versus this file's own "don't persist it at
   all" resolution — what real, different need would call for actually
   storing the full relationship rather than just checking it on
   demand?
2. Find a real, existing single-value field in a codebase you have
   access to, and ask honestly: does the real-world relationship it
   represents ever have more than one valid value at once? If so,
   you've found a live instance of this exact mistake.
3. Write a test proving `KitchenCompatibilityCheck` instances for the
   same recipe against different kitchens never interfere with each
   other — direct, real proof the ephemeral design genuinely avoids
   the cardinality mistake, not just superficially.
