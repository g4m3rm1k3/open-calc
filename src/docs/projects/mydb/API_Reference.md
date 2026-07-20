# MyDB API Reference

**What this file is:** the current, public shape of every MyDB module —
nothing more. Not how it was built, not why, not history. If you want
the reasoning, that's what the lesson that introduced or changed a
signature is for; this file is what you'd hand someone who needs to
*call* the module, not learn from it.

**Update rule:** any lesson whose Definition of Done includes "update
the API reference" means a public function/class signature changed.
Replace the relevant section below in full — don't append a changelog
inside this file; git history is the changelog.

**Status legend:** 🔴 not started · 🟡 in progress, API may still
change · 🟢 frozen for this level, safe to build on top of.

---

## `storage/` — Storage Engine

**Status:** 🔴 Not started. First appears in Lesson 4 (module split);
public API expected to freeze at the end of Lesson 6.

*(This section gets filled in as those lessons are written.)*

---

## `sql/` — SQL Parser

**Status:** 🔴 Not started. Level 2.

---

## `engine/` — Query Executor

**Status:** 🔴 Not started. Level 2.

---

## `auth/` — Authentication & Authorization

**Status:** 🔴 Not started. Level 4.

---

## `net/` — Networking

**Status:** 🔴 Not started. Level 5.
