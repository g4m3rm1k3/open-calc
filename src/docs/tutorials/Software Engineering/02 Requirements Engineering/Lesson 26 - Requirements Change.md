# Lesson 26: Requirements Change

**What you will build.** A real change to Lesson 24's `REQ-COMPLIANCE-1`
— Compliance now wants an audit entry logged every time a restricted
contact is excluded from an export, not just silent exclusion — carried
through this domain's own tools in order: find every place the original
requirement lives, using Lesson 24's traceability tag; update every one
of them; and check the result against updated acceptance criteria, in
Lesson 20's own style. The transferable problem: a requirement changing
isn't a special event needing an ad hoc response — it's the normal
operation of every tool this domain has already built, run again, on
purpose, against a real, specific change.

**What you need to know first.** This lesson uses, directly and in
sequence, Lesson 24's traceability tags, Lesson 20's acceptance criteria,
and Lesson 5's cost-of-change curve — it doesn't introduce new
vocabulary so much as show how the domain's existing vocabulary composes
into a real process.

**Terms introduced in this lesson**

- **change request** — a proposal to modify an already-agreed
  requirement, arriving after work based on the original version has
  already begun or shipped. The word matters because it names something
  distinct from a brand-new requirement: a change request has to account
  for everything already built on top of the version being changed, which
  a fresh requirement never has to.
- **impact analysis** — determining, before making a change, everywhere
  in the system that change would actually touch. Lesson 24's
  traceability tags are exactly the tool impact analysis reaches for
  first: a searchable answer to "everywhere this requirement lives,"
  asked deliberately, before a single line changes, rather than
  discovered afterward the way Lesson 24's own bug was.

**Objects and methods used.** `list.clear()`, first appearance in this
curriculum: removes every element from a list in place, leaving it empty,
used here to reset shared state between repeated checks rather than
constructing a fresh list each time.

No pipeline diagram change — this lesson continues working in the
*Requirements* stage Lesson 12 named, at its boundary with *Change*.

---

## Concept Unit: Impact Analysis Before Touching Anything

### The Problem

A real, new change request arrives for `REQ-COMPLIANCE-1`: *"every time a
restricted contact is excluded from an export, log an audit entry — we
need a record of what was withheld, not just silence."* Before writing
any code, find everywhere this change actually needs to happen.

### The Concept

This is exactly the search Lesson 24 built and never got to use in
anger:

```python
print(find_requirement_implementations("REQ-COMPLIANCE-1", source_files))
```

The result, unchanged from Lesson 24 — `['export.py', 'backup.py']` — is
this change's entire **impact analysis**, answered in one line, because
the traceability tag already existed. Compare this to Lesson 24's own
opening failure: there, the *first* change to this requirement reached
only one of its two real implementations, because no tag existed yet to
search for. This time, the tag is already in place, and the search
answers the only question that matters before writing a single new line:
not "where do I remember implementing this," but "where does the system
say this requirement actually lives."

### CS Lens

This is the same relationship as a compiler's dependency graph to a
build system: knowing exactly what depends on what turns "did I update
everything this change affects" from a guess into a computed, checkable
answer — impact analysis is requirements traceability, used for exactly
the purpose it was built for.

### SE Lens

Running this search *before* changing anything, rather than after
something breaks, is the entire difference between this lesson and
Lesson 24's own failure. The tag existing wasn't enough on its own —
Lesson 24 also had to actually be searched, on purpose, as the first step
of handling this change, not as a postmortem after a second bug.

---

## Concept Unit: Applying the Change to Every Affected Place

### The Problem

Both `export_contacts_csv` and `nightly_backup_export`, found by the
search above, need the identical new behavior: log an audit entry
whenever a restricted contact is excluded.

### The New Code

```python
audit_log = []

def export_contacts_csv(contacts, include_restricted=False):
    lines = ["Full Name,Email Address,Company"]
    for contact in contacts:
        if contact["restricted"] and not include_restricted:  # REQ-COMPLIANCE-1
            audit_log.append("excluded " + contact["name"] + " from export_contacts_csv")
            continue
        lines.append(contact["name"] + "," + contact["email"] + "," + contact["company"])
    return "\n".join(lines)

def nightly_backup_export(contacts):
    lines = ["Full Name,Email Address,Company"]
    for contact in contacts:
        if contact["restricted"]:  # REQ-COMPLIANCE-1
            audit_log.append("excluded " + contact["name"] + " from nightly_backup_export")
            continue
        lines.append(contact["name"] + "," + contact["email"] + "," + contact["company"])
    return "\n".join(lines)
```

Run both against the same contacts used throughout this domain's export
examples:

```python
contacts = [
    {"name": "Alice", "email": "alice@example.com", "company": "Acme", "restricted": False},
    {"name": "VIP Client", "email": "vip@bigcorp.com", "company": "BigCorp", "restricted": True},
]

export_contacts_csv(contacts, include_restricted=False)
nightly_backup_export(contacts)
for entry in audit_log:
    print(entry)
```

Running it:

```text
$ python export_audit.py
excluded VIP Client from export_contacts_csv
excluded VIP Client from nightly_backup_export
```

Both places, found by the same search that opened this lesson, now log
the same real audit information — no second, forgotten function left
silently behind the way Lesson 24's opening scenario left one.

### Mechanical Walkthrough

- `audit_log.append(...)` — already-assumed `list.append`; the new fact
  worth naming is that this single shared list is now populated
  identically by both functions, giving anyone reviewing exclusions one
  real place to look, regardless of which export produced them.
- `for entry in audit_log:` — already-assumed iteration; confirms, by
  real printed output, that both functions' exclusions actually landed in
  the same shared record.

### CS Lens

This is Lesson 8's separation of concerns, working correctly for once
instead of being violated: the *audit logging* concern is now identical
in both places specifically because both places were found and updated
together, deliberately, rather than one author solving it locally without
knowing a second, matching implementation existed.

### SE Lens

Notice what impact analysis bought here beyond convenience: without it,
this exact change request could easily have been implemented only in
`export_contacts_csv` — the more visible, more frequently discussed of
the two functions — leaving `nightly_backup_export` silently
non-compliant with the new audit rule, the identical shape of failure
Lesson 24 already demonstrated once. The search made that omission
structurally unlikely, not merely less likely if someone happened to
remember.

---

## Concept Unit: Verifying the Change, Not Just Applying It

### The Problem

Both functions were changed. Has the change request actually been
satisfied, or does it only look that way?

### The New Code

```python
def check_audit_criteria(export_fn, label):
    audit_log.clear()
    contacts = [
        {"name": "Alice", "email": "alice@example.com", "company": "Acme", "restricted": False},
        {"name": "VIP Client", "email": "vip@bigcorp.com", "company": "BigCorp", "restricted": True},
    ]
    export_fn(contacts) if label == "backup" else export_fn(contacts, include_restricted=False)
    assert len(audit_log) == 1, f"AC-AUDIT failed for {label}: expected 1 audit entry, got {len(audit_log)}"
    assert "VIP Client" in audit_log[0], f"AC-AUDIT failed for {label}: audit entry doesn't name the excluded contact"
    print(label, "passes AC-AUDIT")
```

Run this exactly the way Lesson 20 ran its own acceptance check — once
per implementation, using `list.clear()` to reset shared state between
runs so one check can't leak into the next:

```python
check_audit_criteria(export_contacts_csv, "export")
check_audit_criteria(nightly_backup_export, "backup")
```

Running it:

```text
$ python export_audit.py
export passes AC-AUDIT
backup passes AC-AUDIT
```

### The Concept

This is the exact same discipline Lesson 20 taught, applied to a change
instead of an original build: a change request isn't done when the code
"looks updated." It's done when a real, written acceptance criterion —
here, AC-AUDIT, a direct descendant of `REQ-COMPLIANCE-1`'s own
traceability tag — passes against every implementation impact analysis
found. Nothing in this lesson introduced a new discipline. It ran three
already-taught tools — traceability, implementation, and acceptance
checking — against one real change, in the order that makes each one
actually pay off: find everything affected, before changing anything;
change everything found, together; verify everything changed, the same
way it would have been verified the first time.

### CS Lens

This full sequence — find, change, verify — mirrors exactly how a
well-built system handles a schema migration: find every place a changed
field is read or written, update all of them together, then run the full
test suite against the result, rather than trusting that updating the one
place someone happened to think of was enough.

### SE Lens

Every piece of this lesson's process existed before this lesson started
— nothing new was invented. That's the actual point: requirements change
is not a special, unusual event this curriculum needs a separate toolkit
for. It's the normal, expected operation of Requirements Engineering,
running the exact same instruments — traceability, acceptance criteria,
Lesson 5's cost-of-change awareness — against a target that happens to be
"an existing requirement" instead of "a brand-new one."

---

## Connect the Pieces

One change request, three tools from this domain, run in sequence:

1. **Impact analysis, via traceability** — searching `REQ-COMPLIANCE-1`
   finds both `export.py` and `backup.py`, before either one is touched.
2. **The change, applied everywhere found** — both functions gain
   identical audit logging, confirmed by real, matching printed entries.
3. **Verification, via acceptance criteria** — `check_audit_criteria`,
   built in Lesson 20's exact style, confirms both implementations
   actually satisfy the new requirement, not just that their code was
   edited.

## What Breaks Without This

Handle the identical change request by editing whichever file comes to
mind first, without running the traceability search, and without writing
a new acceptance check. `export_contacts_csv` gets its audit logging.
`nightly_backup_export`, exactly as in Lesson 24's own opening failure,
doesn't — not because anyone decided it shouldn't, but because nobody
asked the system where else this requirement lived before assuming they
already knew.

## Exercises

1. Add a third exclusion path — a customer-facing "download my data"
   export, tagged `REQ-COMPLIANCE-1` — and confirm the traceability search
   finds it, the audit logging change reaches it, and
   `check_audit_criteria` passes against it too.
2. Write a second change request of your own for any requirement built
   earlier in this domain, and walk it through this lesson's three-step
   process: find, change, verify.
3. `check_audit_criteria` currently checks `len(audit_log) == 1`. Explain,
   in a sentence, why that specific assertion would need to change if a
   contact list ever contained more than one restricted contact — and
   fix it.

## Definition of Done

- [ ] You can state, in order, this lesson's three-step process for
      handling a requirements change.
- [ ] You've run the impact analysis search, applied the audit-logging
      change to both functions, and confirmed both pass
      `check_audit_criteria`, all yourself.
- [ ] You've completed all three exercises.
- [ ] Commit the audit-logging change to both functions along with
      `check_audit_criteria`. Commit message should explain *why*: for
      example, `Lesson 26 — REQ-COMPLIANCE-1 now requires an audit entry
      on every exclusion; both known implementations found via
      traceability and updated together, verified by new acceptance
      criteria.`
