# Lesson 14: Stakeholders

**What you will build.** The CSV export feature from Lesson 13, corrected
to serve the CRM problem it was actually meant to solve — and then a real
gap in it that has nothing to do with the CRM at all: a VIP client's
contact record, marked restricted, exported in plain text to a sales rep
who was never supposed to see it. Nobody who asked for this feature asked
for that to happen. The transferable problem: a requirement gathered from
one person — even the right person, even asking the right "why" the way
Lesson 13 taught — only ever captures what *that person* needs. Anyone
else with a legitimate interest in the system's behavior is invisible
until someone deliberately goes looking for them.

**What you need to know first.** Lesson 13's problem-versus-solution
distinction, and its `export_contacts_csv` example — this lesson
continues that exact feature, past the point Lesson 13 left it.

**Terms introduced in this lesson**

- **stakeholder** — anyone with a legitimate interest in a system's
  behavior or outcome, whether or not they're the one who asked for a
  given feature. This includes the person requesting a feature, but also
  the people who will use it, the people who operate or maintain it once
  it's live, the organization paying for it, and anyone the system's
  behavior could genuinely affect — including someone who never
  interacts with the system directly, like the VIP client in this
  lesson's own example, whose data is exported by someone else's action
  entirely.

**Objects and methods used.** None new — this lesson's code uses only
already-assumed syntax: `if`/`continue` inside a loop, and keyword
arguments, already covered by earlier default-parameter treatment in
Lesson 1.

No pipeline diagram change — this lesson continues working in the
*Requirements* stage Lesson 12 named.

---

## Concept Unit: The Person Who Asked Is Not the Only Stakeholder

### The Problem

Lesson 13 fixed the CSV export to solve the sales rep's real problem —
getting contacts into the CRM, with the right column names. Is the
feature's requirement now complete?

### The Concept

Everything Lesson 13 gathered came from one conversation, with one
person: the sales rep who wanted the export. That conversation correctly
found the real problem behind the request, which was real progress — but
it never asked, and had no reason to ask on its own, who *else* might
have a legitimate interest in a feature that reads every contact's data
and writes it out as a downloadable file. A **stakeholder** is anyone in
that position, whether or not they were ever in the room: whoever owns
the contact data being exported, whoever is responsible for what happens
to it once it leaves the system, whoever would be affected if it left the
system incorrectly. None of those people asked for the CSV export
feature. All of them have a real, legitimate stake in how it behaves.

### CS Lens

This is the same widening Lesson 2's closing unit performed on
`is_username_available` — from "does this satisfy the one question I was
asked" to "what else does this system's existence actually touch" —
applied here specifically to *who* a requirement has to account for,
rather than what it has to account for.

### SE Lens

The realistic alternative to identifying every stakeholder up front isn't
achievable — a truly exhaustive list, for any real system, is often
impractical to assemble completely before any work starts, and this
curriculum's later lesson on requirements prioritization deals directly
with that limit. The narrower, achievable discipline this lesson is
building is asking, deliberately, whose data or interests a given feature
touches beyond the person who requested it — a specific, answerable
question, not an open-ended search for every conceivable party.

---

## Concept Unit: A Real Gap, From a Stakeholder Nobody Asked

### The Problem

Build Lesson 13's corrected export and hand it to a real, slightly larger
set of contacts — including one marked `restricted`, a VIP client only
certain senior staff are supposed to see.

### The Code, Run for Real

```python
def export_contacts_csv(contacts):
    lines = ["Full Name,Email Address,Company"]
    for contact in contacts:
        lines.append(contact["name"] + "," + contact["email"] + "," + contact["company"])
    return "\n".join(lines)
```

Run it against a contact list including the restricted VIP:

```python
contacts = [
    {"id": 1, "name": "Alice", "email": "alice@example.com", "company": "Acme", "restricted": False},
    {"id": 2, "name": "VIP Client", "email": "vip@bigcorp.com", "company": "BigCorp", "restricted": True},
]
print(export_contacts_csv(contacts))
```

Running it:

```text
$ python export.py
Full Name,Email Address,Company
Alice,alice@example.com,Acme
VIP Client,vip@bigcorp.com,BigCorp
```

This is exactly correct, by every standard Lesson 13 established — the
CRM-friendly columns are right, every contact is present, the sales rep's
real problem is solved. It is also a real, live data leak: `contact`
already carries a `restricted` field the moment this data exists in the
system, and this function ignores it completely, handing the VIP client's
private information to whoever happens to click export, regardless of
whether they were ever supposed to see it.

### The Fix

```python
def export_contacts_csv(contacts, requester_can_view_restricted):
    lines = ["Full Name,Email Address,Company"]
    for contact in contacts:
        if contact["restricted"] and not requester_can_view_restricted:
            continue
        lines.append(contact["name"] + "," + contact["email"] + "," + contact["company"])
    return "\n".join(lines)
```

Run it for two different requesters against the identical contact list:

```python
print("ordinary rep export:")
print(export_contacts_csv(contacts, requester_can_view_restricted=False))
print("senior rep export:")
print(export_contacts_csv(contacts, requester_can_view_restricted=True))
```

Running it:

```text
$ python export.py
ordinary rep export:
Full Name,Email Address,Company
Alice,alice@example.com,Acme
senior rep export:
Full Name,Email Address,Company
Alice,alice@example.com,Acme
VIP Client,vip@bigcorp.com,BigCorp
```

An ordinary rep's export now correctly omits the VIP client entirely. A
senior rep, explicitly marked as authorized, still sees everything.

### Mechanical Walkthrough

- `requester_can_view_restricted` — a new parameter, already-assumed
  function-parameter syntax; the engineering idea worth naming isn't the
  parameter itself, it's that this function's behavior now depends on
  *who's asking*, a fact the original version had no way to express at
  all.
- `if contact["restricted"] and not requester_can_view_restricted:
  continue` — already-assumed conditional and `continue`; skips adding
  this contact's line to the output entirely, for exactly the requesters
  this stakeholder's own data protection depends on excluding.
- `requester_can_view_restricted=False` / `=True` at the call sites —
  already-assumed keyword-argument syntax, first used this way in this
  curriculum to make each call self-explanatory about which requester
  it's simulating, without needing a comment to say so.

### The Concept

Notice exactly what changed between the two versions of this function:
the sales rep's original problem — getting contacts into the CRM — is
served identically well by both. What the fix added was service to a
*second* stakeholder, one who never appeared in Lesson 13's original
conversation at all, and whose interest — that restricted data not leave
the system uncontrolled — was every bit as real and legitimate as the
sales rep's, just invisible until someone asked whose data this feature
actually touches.

### CS Lens

The same shape recurs anywhere a system serves more than one party at
once: a shared document editor has to consider not just the person typing
but everyone else who can currently see the document; a public API has to
consider not just the developer calling it but the end users whose data
that call might expose; a shared calendar tool has to consider not just
the person scheduling a meeting but everyone being invited to it. In each
case, satisfying the person actively making the request is necessary and
not sufficient.

### SE Lens

Adding the permission check cost something real and worth naming
honestly: the ordinary rep's export is now smaller than the sales rep
originally wanted, and Lesson 13's clean, fully-solved CRM problem now has
a real exception carved into it. That's not a flaw in the fix — it's an
honest, visible tradeoff, in exactly Lesson 11's sense, between two
legitimate stakeholders' needs, resolved by a real decision (senior staff
can see restricted contacts, others can't) rather than left unresolved by
never asking the second stakeholder's question at all.

---

## Concept Unit: Finding Stakeholders Before They Find You

### The Problem

The restricted-contact gap in this lesson was found by walking through a
slightly larger, more realistic set of test data — not by a rule that
mechanically produces the full stakeholder list in advance. Is there a
more reliable way to ask the question?

### The Concept

A reliably useful version of the question isn't "who might possibly care
about this feature" — too open-ended to answer completely — it's "what
does this feature actually touch, and who has a legitimate interest in
each of those things." `export_contacts_csv` touches contact data; asking
"who has a legitimate interest in contact data leaving the system"
surfaces the VIP client's stakeholder role directly, the same way asking
"who has a legitimate interest in this button's existence" surfaced
nothing new (nobody besides the sales rep genuinely cares whether the
button itself exists) but asking about the *data it moves* surfaced a
real, missed stakeholder immediately. The reliable move is grounding the
question in the system's actual behavior — what does it read, write,
show, or send, and to whom — rather than trying to imagine every
conceivable interested party from scratch.

### CS Lens

This is the same technique Lesson 9's cohesion and coupling analysis
used, redirected at people instead of code: instead of asking "is this
function correct" in isolation, ask what it actually touches and depends
on, and let *that* analysis reveal what else needs attention — here,
whose interests, rather than which other functions.

### SE Lens

This lesson's fix is not the end of this feature's stakeholder story —
a real system would also want to ask what happens to the exported CSV
file after it leaves the system entirely, which is a question about data
handling this curriculum's later domains address directly. What this
lesson establishes is narrower and foundational: the habit of tracing a
feature's actual behavior to find who it touches, rather than only ever
serving whoever happened to ask for it first.

---

## Connect the Pieces

One feature, `export_contacts_csv`, examined from two different
stakeholders' vantage points:

1. **One stakeholder, correctly served** — Lesson 13's fix solved the
   sales rep's real problem, verified with real, correct CRM-ready
   output.
2. **A second, unstated stakeholder, found by tracing the data** — a
   restricted VIP contact, exported in plain text to anyone who asked,
   because nobody besides the sales rep was ever consulted.
3. **Both served, at a real, visible cost** — the fixed version protects
   the restricted contact for unauthorized requesters, at the honest cost
   of a smaller export for them, resolving a genuine tradeoff instead of
   leaving it undiscovered.

## What Breaks Without This

Ship the unrestricted version, having gathered requirements from exactly
one conversation, with exactly one stakeholder. Nothing about it fails
any test the sales rep would think to write — it solves their problem
completely. Months later, the VIP client's information turns up somewhere
it shouldn't, traced back to an ordinary sales rep's routine CSV export,
and the resulting conversation is no longer about a feature request — it's
about a real trust and compliance failure, discovered by the one
stakeholder this lesson's whole point is that nobody thought to ask.

## Exercises

1. Add a second restriction category — contacts whose data belongs to a
   specific region and can only be exported by requesters authorized for
   that region — and thread it through `export_contacts_csv` the way
   `restricted` already is. Confirm, by running it, that a requester
   authorized for one region but not the other gets the correct, partial
   export.
2. For any other feature this curriculum has built (Lesson 1's
   `cart_total`, Lesson 10's `apply_coupon`), name one stakeholder beyond
   whoever the original lesson implicitly wrote it for, and describe, in
   a sentence, what that stakeholder would care about.
3. Practice the grounding technique from this lesson's closing unit: pick
   any real app or website you use, name one specific thing it reads,
   writes, or sends, and name a stakeholder — beyond you, the user — with
   a legitimate interest in how that specific thing is handled.

## Definition of Done

- [ ] You can define "stakeholder" in your own words, distinct from
      "whoever requested the feature."
- [ ] You've reproduced the unrestricted leak and confirmed the permission
      check fixes it for an unauthorized requester while preserving access
      for an authorized one.
- [ ] You've completed all three exercises.
- [ ] Commit the permission-aware `export_contacts_csv`. Commit message
      should explain *why*: for example, `Lesson 14 — export now respects
      restricted contacts, closing a real data-exposure gap found by
      asking who else has a stake in this feature besides the requester.`
