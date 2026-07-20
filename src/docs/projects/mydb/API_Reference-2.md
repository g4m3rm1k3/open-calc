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

**Status:** 🟡 In progress — `insert`/`printAll` exist; `update`/`remove`
land in Lesson 5, after which this freezes for the rest of Level 1.

```cpp
struct Student {
    int id;
    std::string name;
    int age;
};

class Table {
public:
    Table(const std::string& filename);
    // Opens (or creates, on first write) the file at `filename` as
    // this table's backing storage. Does not read or validate the
    // file's contents at construction time.

    void insert(const Student& s);
    // Appends one record to the table's file. Does not check for
    // duplicate ids — nothing currently enforces uniqueness.

    void printAll() const;
    // Reads every record currently in the file and prints each one,
    // in raw stored order, to standard output. Does not return the
    // records as Student objects — that requires parsing the stored
    // text back into typed fields, which storage/ does not yet do.
};
```

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
