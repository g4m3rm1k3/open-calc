# Lesson 24: Requirements Traceability

**What you will build.** Two real, separately built functions —
`export_contacts_csv` and a nightly `backup_export` — that both
independently implement the same compliance rule from Lesson 22, with no
link connecting either one back to the rule itself. When that rule
changes, you'll update the one you remember and watch the other keep
enforcing a policy that no longer applies, silently, with no error
anywhere. Then you'll add the one thing that was missing — not more
code, but a searchable connection between a requirement and everywhere it
lives — and use it to find both places at once.

**What you need to know first.** Lesson 22's `export_contacts_csv` /
`view_contact` split and its compliance rule — this lesson assumes that
same rule got implemented a second time, independently, somewhere else
in the system, and asks how anyone would ever know that happened.

**Terms introduced in this lesson**

- **requirements traceability** — the ability to connect a requirement to
  every piece of code, test, or other artifact that implements or depends
  on it, in both directions: given a requirement, find everything that
  satisfies it; given a piece of code, find the requirement that justifies
  it existing at all. The word matters because every earlier lesson in
  this domain assumed you could always find the code behind a
  requirement by remembering where it was. Real systems outgrow anyone's
  memory quickly, and this lesson is about what happens the moment they
  do.

**Objects and methods used.** None new — this lesson's code uses only
already-assumed syntax: dict iteration, `in` membership testing against a
string, and list comprehension-free iteration already covered throughout
this curriculum.

No pipeline diagram change — this lesson continues working in the
*Requirements* stage Lesson 12 named.

---

## Concept Unit: One Rule, Implemented Twice, Connected to Neither

### The Problem

Lesson 22 resolved a real conflict by writing `export_contacts_csv` to
exclude restricted contacts. Time passes. A separate, real feature — a
nightly backup export, run automatically, unrelated to the original
sales-versus-compliance conflict — gets built by someone who independently
knows restricted contacts shouldn't leave the system as a file, and
writes the identical rule into their own function, with no connection to
Lesson 22's code at all.

### The Concept

```python
def export_contacts_csv(contacts, include_restricted=False):
    lines = ["Full Name,Email Address,Company"]
    for contact in contacts:
        if contact["restricted"] and not include_restricted:
            continue
        lines.append(contact["name"] + "," + contact["email"] + "," + contact["company"])
    return "\n".join(lines)

def nightly_backup_export(contacts):
    lines = ["Full Name,Email Address,Company"]
    for contact in contacts:
        if contact["restricted"]:
            continue
        lines.append(contact["name"] + "," + contact["email"] + "," + contact["company"])
    return "\n".join(lines)
```

Both correctly implement Compliance's rule right now. Neither one
contains any indication of *why* — no comment, no reference, nothing
connecting either `if contact["restricted"]` line back to the actual
requirement that justifies it existing. Someone reading either function
in isolation has no way to know a second implementation of the identical
rule exists somewhere else in the codebase, or even that this line traces
back to a real, named decision at all, rather than being an arbitrary
choice one author happened to make.

### CS Lens

This is Lesson 19's unstated assumption, one level up: there, one
function silently depended on a fact nobody wrote down. Here, *two*
independent functions silently depend on the *same* fact, with nothing
connecting them to each other or to the decision that produced both — a
duplication Lesson 8 would have caught immediately if either author had
known the other's code existed, and neither one did.

### SE Lens

Nothing about writing `nightly_backup_export` this way was careless —
its author solved the problem correctly, using the same good judgment
Lesson 22's original author used. The failure isn't in either person's
work. It's in the complete absence of any way either of them could have
discovered the other's function existed, or that both were implementing
the same real, named requirement, without already knowing to go looking
for it.

---

## Concept Unit: The Rule Changes, and Only One Place Hears About It

### The Problem

Compliance revises the policy: restricted contacts *can* now be exported,
but only when explicitly requested. `export_contacts_csv` gets updated to
support that — it already has an `include_restricted` parameter, unused
until now.

### The Code, Run for Real

```python
contacts = [
    {"name": "Alice", "email": "alice@example.com", "company": "Acme", "restricted": False},
    {"name": "VIP Client", "email": "vip@bigcorp.com", "company": "BigCorp", "restricted": True},
]

print("csv export, now explicitly including restricted contacts:")
print(export_contacts_csv(contacts, include_restricted=True))
print("nightly backup export, same day, same contacts:")
print(nightly_backup_export(contacts))
```

Running it:

```text
$ python export_check.py
csv export, now explicitly including restricted contacts:
Full Name,Email Address,Company
Alice,alice@example.com,Acme
VIP Client,vip@bigcorp.com,BigCorp
nightly backup export, same day, same contacts:
Full Name,Email Address,Company
Alice,alice@example.com,Acme
```

`export_contacts_csv` correctly reflects the new policy — the VIP client
appears, exactly as the updated rule now allows. `nightly_backup_export`,
run the same day, against the same contacts, still silently excludes the
VIP client — not because anyone decided the backup job should keep the
old rule, but because whoever updated the policy had no way of knowing
this second function existed at all. The requirement changed. Only one of
its two real implementations heard about it.

### CS Lens

This is Lesson 1's regression, produced by the opposite mechanism: there,
a change broke a case that used to work. Here, a change correctly updates
one case while an *unconnected* second case is left silently enforcing a
policy that's already out of date — no crash, no error, just two parts of
the same system quietly disagreeing about what the current rule actually
is.

### SE Lens

The realistic fix here isn't "remember every place a rule was
implemented" — that's precisely the failure that already happened once,
by two individually reasonable people. What's missing is a real,
checkable way to ask the system itself "everywhere this specific
requirement is implemented," rather than relying on any one person's
memory of a decision they may not have even been present for.

---

## Concept Unit: Making the Connection Searchable

### The Problem

Give the original requirement a name, and mark every place that
implements it with that name, so the connection exists in the code
itself instead of only in someone's memory.

### The New Code

```python
source_files = {
    "export.py": '''
def export_contacts_csv(contacts, include_restricted=False):
    ...
        if contact["restricted"] and not include_restricted:  # REQ-COMPLIANCE-1
            continue
    ...
''',
    "backup.py": '''
def nightly_backup_export(contacts):
    ...
        if contact["restricted"]:  # REQ-COMPLIANCE-1
            continue
    ...
''',
}
```

A real, if minimal, trace back to the requirement, using a plain search:

```python
def find_requirement_implementations(tag, files):
    return [filename for filename, source in files.items() if tag in source]

print(find_requirement_implementations("REQ-COMPLIANCE-1", source_files))
```

Running it:

```text
$ python trace.py
['export.py', 'backup.py']
```

One search, run before the policy change instead of after, would have
surfaced both files at once — the same search that, if run *this* time
before updating `export_contacts_csv`, would have pointed straight at
`backup.py` as a second place needing the identical update.

### Mechanical Walkthrough

- `# REQ-COMPLIANCE-1` — a plain code comment, already-assumed syntax,
  used here as a **traceability tag**: a stable, searchable identifier
  connecting a specific line of code back to a specific, named
  requirement, rather than leaving that connection to exist only in
  whoever originally wrote the line.
- `tag in source` — already-assumed string membership testing; the entire
  mechanism is this simple, which is worth stating plainly: traceability
  doesn't require special tooling to start paying off, only a consistent
  habit of tagging code with the requirement it implements.

### The Concept

Nothing about the tag changes what either function does — both still
behave exactly as before. What it adds is a real, checkable answer to a
question that previously had none: "everywhere this requirement is
implemented." That answer existing *before* the policy changed is what
would have prevented this lesson's own bug entirely — not smarter code,
not a more careful developer, but a connection between a requirement and
its implementations that didn't depend on anyone's memory reaching back
far enough.

### CS Lens

This is the same underlying idea as a compiler's own "find all
references" — a real, mechanical way to answer "everywhere this thing is
used," rather than trusting a person to remember or manually search
correctly. Requirements traceability is that same capability, aimed at
requirements instead of variable names.

### SE Lens

A single string comment is a real, minimal version of a discipline that,
in larger systems, is often supported by dedicated tooling — linking a
requirement management system directly to code, tests, and commits. This
lesson deliberately builds the minimal version rather than reaching for
that tooling, because the underlying idea — a stable, searchable
connection between "why this code exists" and "where this code lives" —
is what actually matters, and it's exactly as real with a plain comment
tag as with an expensive tracking system, just less automated.

---

## Connect the Pieces

One requirement, two implementations, one missing connection:

1. **Implemented twice, connected to neither** —
   `export_contacts_csv` and `nightly_backup_export` both enforce
   Compliance's rule correctly, with nothing linking either back to the
   rule or to each other.
2. **The rule changes, one place hears about it** — updating
   `export_contacts_csv` to allow explicit inclusion leaves
   `nightly_backup_export` silently enforcing the old policy, reproduced
   for real.
3. **A searchable tag closes the gap** — `# REQ-COMPLIANCE-1`, present in
   both files, turns "everywhere this requirement is implemented" into a
   real, checkable search instead of a question only memory could answer.

## What Breaks Without This

Keep implementing shared rules independently, in different parts of a
real system, with no tag or link connecting any of them back to the
decision that produced them. Every individual implementation is correct
the day it's written. Every later change to the underlying policy reaches
only whichever implementations the person making the change happens to
remember or stumble across — in a system with dozens of real
requirements and hundreds of files, that's a shrinking fraction of the
truth every year the system keeps growing, and the gap between "the
policy says" and "the code actually does" widens quietly, discovered only
when someone notices two parts of the same system disagreeing, the way
this lesson's own backup export did.

## Exercises

1. Add a third, real implementation of `REQ-COMPLIANCE-1` — an export
   used by a customer-facing "download my data" feature — tag it the same
   way, and confirm `find_requirement_implementations` now returns all
   three files.
2. Go back to Lesson 19's `register_username`. What requirement or
   assumption would you tag it with, and why would tagging it have made
   Lesson 19's own `bulk_import` bug easier to prevent in advance?
3. Pick any two functions from this domain's earlier lessons that
   enforce what is, in your judgment, really the same underlying rule
   (Lesson 14's restricted-contact check and Lesson 22's `view_contact`
   are one real candidate). Write the shared requirement tag you'd give
   both.

## Definition of Done

- [ ] You can define requirements traceability in your own words, in both
      directions — requirement to code, and code to requirement.
- [ ] You've reproduced the real inconsistency between
      `export_contacts_csv` and `nightly_backup_export`, and confirmed the
      tag-based search finds both.
- [ ] You've completed all three exercises.
- [ ] Commit the tagged versions of both export functions and
      `find_requirement_implementations`. Commit message should explain
      *why*: for example, `Lesson 24 — tagged both compliance-rule
      implementations with REQ-COMPLIANCE-1 so future policy changes can
      find every affected file by search, not by memory.`
