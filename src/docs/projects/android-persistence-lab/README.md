# Android Persistence Lab — Real Storage, Real Messaging

## What This Is

The direct sequel to [`android-ui-foundations`](../android-ui-foundations/):
same login screen, same inventory grid, same permission-request flow —
now made real. `android-ui-foundations` builds every screen with
in-memory, hardcoded data that vanishes the moment the app process dies,
and stops the SMS story at "permission granted," without ever actually
sending anything. This series closes both gaps: a real SQLite database
backing the login screen and the grid, and a real `SmsManager` call
completing the permission flow it only started.

**Prerequisite:** finish `android-ui-foundations` first. Every lesson
here assumes its login screen, its `RecyclerView` grid, and its
permission-request lessons (30–33) are already real, working code — this
series edits and extends that project directly, it doesn't start a new
one.

## Why This Exists, Separately

The two things this series adds — real persistence and real background
messaging — are both a genuine jump in kind, not just more of the same:
a database survives the process that wrote to it, and has its own
lifecycle (versions, migrations, concurrent access) `android-ui-foundations`
never had to think about. `SmsManager` involves a real device capability
with real permission and platform-policy weight behind it, not just
another method call. Both deserve their own focused sequence rather than
being squeezed in as two more lessons at the end of an already-long
series.

## Lesson Standard

Same standard as every curriculum in this repository: every construct
gets its own real, isolated proof before it's used for real — a
throwaway lab, actually run, actually showing real output, never
narrated. Where Android's own SDK is the only way to prove something (no
plain-JVM equivalent exists), the lesson says so explicitly and gives a
concrete on-device verification step instead. Where the underlying
engine is genuinely testable without Android at all — SQLite itself is
the same real engine `android.database.sqlite` wraps — the lesson proves
the SQL directly with the real `sqlite3` command-line tool before ever
touching Android's own API around it, the same "prove the mechanism in
isolation, then apply it" approach `android-ui-foundations` already
established for pure-Java concepts.

## Roadmap

| # | Title | What Becomes Real |
|---|---|---|
| 1 | `SQLiteOpenHelper` and a Database That Outlives the Process | A real `.db` file, created once, surviving a full app restart |
| 2 | `CREATE TABLE` and a Schema That Matches the Model | A real `users` table and `items` table, designed, not improvised |
| 3 | `INSERT` and `ContentValues` | Real rows written to disk, confirmed with `sqlite3` directly |
| 4 | `SELECT`, `Cursor`, and Reading Rows Back Into Objects | The grid's data comes from the database, not a hardcoded list |
| 5 | Real Login: Checking Credentials Against the Database | The login screen accepts a real account, rejects a wrong password |
| 6 | Creating a New Account, and Why Passwords Are Never Stored Plain | Account creation, with a real (if minimal) password hash |
| 7 | `UPDATE` — Changing a Value That Already Exists | Editing a grid row for real, persisted |
| 8 | `DELETE` and Confirming What's Actually Gone | Removing a grid row for real, persisted |
| 9 | `SmsManager` — Actually Sending a Message | The permission flow from `android-ui-foundations` finally sends a real SMS |
| 10 | Deciding *When* to Notify, and What Happens When Permission Is Denied | A real, data-driven trigger condition; graceful behavior with no permission |

## Status

- [x] Lesson 1 — written
- [ ] Lessons 2–10 — in progress

## Definition of Done (whole series)

- The login screen checks a real username/password against a real,
  persisted table, and can create a new account that survives a restart.
- The grid displays real database rows, not hardcoded data — add,
  change, and remove a row, and confirm each change survives closing and
  reopening the app.
- With SMS permission granted, a real trigger condition sends a real SMS
  through `SmsManager`. With permission denied, the rest of the app
  keeps working, and nothing crashes or silently pretends to send
  anything.
