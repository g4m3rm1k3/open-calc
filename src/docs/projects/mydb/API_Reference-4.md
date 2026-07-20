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

**Status:** 🟢 Frozen for Level 1. Level 3 is expected to change *how*
these are implemented internally (pages, indexes) without changing
this signature list at all.

**Tests:** `storage/table_test.cpp` is a standalone executable (its own
`main` — never linked with `mydb.cpp`) proving this API's documented
behavior. Build with
`g++ storage/table_test.cpp storage/table.cpp -o table_test -Wall`.

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

    std::vector<Student> selectAll() const;
    // Reads every record currently in the file, parses each one back
    // into a Student, and returns them all. Malformed stored lines
    // (e.g. hand-edited corruption) will crash via an uncaught
    // std::invalid_argument from std::stoi, not a clean exception —
    // a known gap, not yet handled.

    void printAll() const;
    // Convenience wrapper around selectAll() that prints every record
    // to standard output in the same comma-joined text format it's
    // stored in.

    void update(int id, const Student& newData);
    // Replaces the record whose id matches `id` with `newData`
    // (including its id — callers can technically change a record's
    // id this way). Rewrites the entire file via a temp-file-and-
    // rename. Throws std::runtime_error if no record with that id
    // exists; the file is left unchanged (rewritten identically) in
    // that case.

    void remove(int id);
    // Deletes the record whose id matches `id`. Rewrites the entire
    // file via a temp-file-and-rename. Throws std::runtime_error if
    // no record with that id exists.
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
