# Lesson 22: Conflicting Requirements

**What you will build.** A version of Lesson 14's contact export that
tries to honor two real requirements from two real stakeholders at
once — Sales wants a senior rep's export to include every contact they
work with, restricted or not; Compliance wants a new, stricter rule: no
restricted contact may ever appear in an exportable file, for anyone,
regardless of role. You'll implement Sales' request faithfully and watch
it directly violate Compliance's rule, in real, reproduced output — proof
that no implementation satisfies both exactly as stated. Then you'll
build the actual resolution: not a clever trick that secretly satisfies
both, but a real, acknowledged compromise, splitting one contact's data
across two different channels on purpose.

**What you need to know first.** Lesson 14's `export_contacts_csv` and
its permission check, and Lesson 11's engineering tradeoffs — this lesson
applies that same tension to two named, competing *requirements* instead
of two abstract *qualities*, which changes how it has to be resolved.

**Terms introduced in this lesson**

- **conflicting requirements** — two or more requirements, each
  individually legitimate on its own terms, that cannot both be fully
  satisfied by the same system at the same time: satisfying one
  necessarily means falling short of the other, at least partially. The
  word matters because it names a situation this curriculum hasn't
  produced yet — every gap found so far (an unstated assumption, an
  ambiguous phrase) was resolvable by finding the missing information and
  filling it in. A real conflict has no missing piece to find; both
  requirements are already fully known, and they still can't both be
  true at once.

**Objects and methods used.** None new — this lesson's code uses only
already-assumed syntax already covered in Lesson 14's own treatment of
this feature.

No pipeline diagram change — this lesson continues working in the
*Requirements* stage Lesson 12 named.

---

## Concept Unit: Two Legitimate Requirements, Directly Opposed

### The Problem

Two real requests land on the same feature, from two real stakeholders,
in the same week. Sales: *"a senior rep's export must include every
contact they work with — restricted clients included — so nothing is
missed during a handoff."* Compliance, responding to a new policy: *"no
restricted contact may ever appear in an exported file, for any
requester, under any circumstance — an exported file can leave the
system and can't be revoked once it does."*

### The Concept

Build Sales' request exactly as asked — the same permission-aware export
Lesson 14 already built, letting an authorized senior rep see everything:

```python
def export_contacts_csv_full(contacts, requester_can_view_restricted):
    lines = ["Full Name,Email Address,Company"]
    for contact in contacts:
        if contact["restricted"] and not requester_can_view_restricted:
            continue
        lines.append(contact["name"] + "," + contact["email"] + "," + contact["company"])
    return "\n".join(lines)
```

Run it for a senior rep, exactly the case Lesson 14 was proud of:

```python
contacts = [
    {"id": 1, "name": "Alice", "email": "alice@example.com", "company": "Acme", "restricted": False},
    {"id": 2, "name": "VIP Client", "email": "vip@bigcorp.com", "company": "BigCorp", "restricted": True},
]
print(export_contacts_csv_full(contacts, requester_can_view_restricted=True))
```

Running it:

```text
$ python export.py
Full Name,Email Address,Company
Alice,alice@example.com,Acme
VIP Client,vip@bigcorp.com,BigCorp
```

Sales' requirement is satisfied exactly: the senior rep's export includes
every contact, VIP included. Compliance's requirement is violated exactly
as clearly: `VIP Client` — a restricted contact — is sitting in an
exported file. Nothing about this is a bug to fix. `export_contacts_csv_full`
is a completely correct implementation of Sales' request. It is also a
completely direct violation of Compliance's, because the two requests, as
stated, are **conflicting requirements**: no version of this function's
output can include the VIP client for Sales and simultaneously never
include the VIP client for Compliance. Both cannot be fully true of the
same exported file at once.

### CS Lens

Unlike Lesson 21's ambiguity, there's no missing information to find
here. Both requirements are already completely precise — "include every
contact" and "never include a restricted contact in an export" are each,
individually, exactly as unambiguous as Lesson 16 asked functional
requirements to be. The problem isn't that either one is vague. It's
that they're both fully specified and mutually exclusive, which is a
structurally different kind of problem than anything the rest of this
domain has solved by clarifying wording.

### SE Lens

The realistic mistake here is searching for a clever technical solution
that secretly satisfies both requirements exactly as stated — there
isn't one, because the conflict isn't a puzzle, it's a genuine
disagreement about what the system should do, between two people who
each have a legitimate stake, per Lesson 14. No amount of better code
resolves a disagreement that was never actually about the code.

---

## Concept Unit: Resolving It Without Pretending Either Side Lost Nothing

### The Problem

Sales' actual need — a rep working with VIP accounts needs full,
real-time access to their information — doesn't strictly require a
downloadable file; it requires *access*. Compliance's actual need — a
restricted contact should never sit in a file that can leave the system
unmonitored — doesn't strictly forbid a rep from seeing the data on
screen; it forbids it leaving as a file. Split the same requirement in
two.

### The New Code

```python
def view_contact(contact, requester_can_view_restricted):
    if contact["restricted"] and not requester_can_view_restricted:
        return None
    return contact["name"] + " <" + contact["email"] + "> (" + contact["company"] + ")"

def export_contacts_csv(contacts):
    lines = ["Full Name,Email Address,Company"]
    for contact in contacts:
        if contact["restricted"]:
            continue
        lines.append(contact["name"] + "," + contact["email"] + "," + contact["company"])
    return "\n".join(lines)
```

Run both channels for the same senior rep, against the same contacts:

```python
print("senior rep's on-screen view of the VIP client:")
print(view_contact(contacts[1], requester_can_view_restricted=True))

print("senior rep's exported file:")
print(export_contacts_csv(contacts))
```

Running it:

```text
$ python export.py
senior rep's on-screen view of the VIP client:
VIP Client <vip@bigcorp.com> (BigCorp)
senior rep's exported file:
Full Name,Email Address,Company
Alice,alice@example.com,Acme
```

The senior rep sees the VIP client's full details on screen, unrestricted
— Sales' actual underlying need, met. The exported file contains only
Alice — Compliance's rule, met exactly, with no exception carved out for
seniority at all. Neither requirement, exactly as originally worded, is
fully satisfied: Sales didn't get the VIP client *in the export file*,
which is technically less than "every contact I work with, in one
export." Compliance's rule is honored without qualification. This is a
real resolution, not a trick — it required deciding, explicitly, that
"view" and "export" are different enough operations to deserve different
rules, and getting both stakeholders to agree that splitting the
requirement this way actually serves what each of them needed underneath
their original wording.

### Mechanical Walkthrough

- `view_contact` returning a formatted string or `None` — mechanically
  identical to Lesson 14's permission check, already-assumed at this
  point; the new idea isn't the check itself, it's that this function
  exists at all, as a channel `export_contacts_csv` deliberately doesn't
  share any code with.
- `export_contacts_csv` with `if contact["restricted"]: continue` and no
  `requester_can_view_restricted` parameter at all — worth noticing
  precisely: this function no longer accepts seniority as an input in any
  form. That's not an oversight; it's the resolution made structural —
  there is no argument you could pass this function to make it include a
  restricted contact, for anyone, which is exactly what Compliance's
  "under any circumstance" demanded.

### CS Lens

This is Lesson 8's separation of concerns, applied to a requirements
conflict instead of a design one: "showing a rep contact information" and
"producing a downloadable file" were being treated as the same operation,
sharing one function and one permission rule; splitting them into two
genuinely separate concerns, each with its own rule, is what dissolves a
conflict that looked unsolvable while they were tangled together.

### SE Lens

This resolution cost something real and worth stating honestly: Sales'
literal original request — "everything in one export" — is not what
shipped. A real conversation, not a code change, is what made that
acceptable: showing both stakeholders that the split serves the actual
need behind each of their requirements, per Lesson 13's own distinction
between a request and the problem underneath it. That conversation is
the actual resolution. The code in this unit is just what it looks like
once the decision has already been made.

---

## Concept Unit: A Conflict Resolved Is Still a Real Decision, Not a Discovery

### The Problem

Lesson 21's ambiguity was resolved by *discovering* the one intended
meaning and stating it precisely. Does this lesson's conflict resolve the
same way — is there one "correct" answer waiting to be found?

### The Concept

No, and this is the precise difference between the two failure modes.
Lesson 21's two dedupe functions disagreed because a fact — what the
requester actually meant by "duplicate" — existed but had never been
asked for; finding it out resolved the disagreement completely, in favor
of whichever meaning was actually intended. This lesson's split between
`view_contact` and `export_contacts_csv` isn't a rediscovery of some
already-existing "correct" resolution — it's a genuinely new decision,
made by weighing Sales' need against Compliance's rule and choosing a
specific compromise between them. A different, equally reasonable team
might have resolved the identical conflict differently — perhaps
requiring a second approval step before any restricted contact could ever
be exported, rather than banning export outright. Both are legitimate
resolutions of the same real conflict; neither is more "correct" in the
sense Lesson 21's disambiguation was. Recognizing which kind of problem
is in front of you — a fact to find, or a decision to make — determines
whether the right next step is asking one more clarifying question or
convening the people whose competing needs actually have to be weighed
against each other.

### CS Lens

This is the same distinction as a well-posed optimization problem
(one correct answer, given enough information) versus a genuine
multi-objective tradeoff (multiple valid answers, depending on how the
objectives are weighted) — Lesson 21's ambiguity was the first kind in
disguise; this lesson's conflict is honestly the second.

### SE Lens

This curriculum's later domain on technical decision making returns to
exactly this distinction, at real depth: not every unresolved question in
a system is a bug or a gap waiting to be closed by better analysis. Some
are decisions, made by weighing real, competing, legitimate interests
against each other, and the discipline this lesson teaches is
recognizing which kind of question is actually in front of you before
reaching for the wrong tool to answer it.

---

## Connect the Pieces

One feature, two legitimate requirements, one real conflict, one real
decision:

1. **The conflict, made concrete** — `export_contacts_csv_full` satisfies
   Sales exactly and violates Compliance exactly, in the same real run,
   against the same contact list.
2. **The resolution, not a trick** — `view_contact` and
   `export_contacts_csv`, split into two channels with two different
   rules, serving both stakeholders' underlying needs while honoring
   neither party's original wording exactly.
3. **The distinction that mattered** — this was a decision to make, not
   a fact to discover, unlike Lesson 21's ambiguity; treating it as the
   wrong kind of problem would have meant searching indefinitely for a
   "correct" answer that was never going to exist.

## What Breaks Without This

Ship `export_contacts_csv_full`, satisfying Sales because it's the
requirement someone happened to implement first, without ever surfacing
the conflict with Compliance's rule to anyone who could actually decide
between them. The feature works, by Sales' standard, right up until a
compliance audit finds a restricted contact sitting in an exported file
that should never have been able to leave the system — not a coding
mistake, but a real decision that was never actually made, only defaulted
into by whichever requirement got implemented without anyone noticing the
other one existed.

## Exercises

1. Implement the alternative resolution this lesson's third unit
   mentions — restricted contacts can be exported, but only after a
   second, explicit confirmation step — and compare it honestly against
   the view/export split: which stakeholder does each resolution favor
   more, and why?
2. Find two requirements from earlier lessons in this domain that are in
   tension but not fully conflicting (Lesson 15's ranked search
   favoring exact matches, and a hypothetical requirement to always show
   the most recently added file first, are a good candidate) — is this a
   real conflict in this lesson's sense, or a tradeoff Lesson 11 would
   resolve through measurement instead?
3. Describe, in a few sentences, a real conflict you've encountered
   between two people's legitimate needs — in software or otherwise —
   and the compromise that was actually reached. Was it a discovery or a
   decision?

## Definition of Done

- [ ] You can define "conflicting requirements" in your own words, and
      distinguish it from an ambiguous requirement (Lesson 21).
- [ ] You've reproduced the real conflict (`export_contacts_csv_full`
      violating Compliance's rule) and the real resolution
      (`view_contact` / `export_contacts_csv` split) yourself.
- [ ] You've completed all three exercises.
- [ ] Commit `view_contact` and the updated `export_contacts_csv`. Commit
      message should explain *why*: for example, `Lesson 22 — split
      contact viewing from contact export after Sales' and Compliance's
      requirements turned out to be genuinely irreconcilable as one
      operation.`
