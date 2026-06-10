# Vault PDM — Lesson 23 — Phase 4 Review: The Full Checkout Cycle

## What You Will Build

No new features. Perform a complete checkout cycle — check out, download, edit (make
a visible change), save WIP, check in — and trace every database write and GitLab API
call as it happens. Write an ASCII sequence diagram documenting the full cycle and
commit it to `docs/`.

## What You Need to Know First

Lessons 01–22. The full checkout cycle is implemented. This lesson is verification
and synthesis.

---

## The Exercise

### Step 1 — Perform a Full Cycle

Using Vault with a real GitLab project:

1. **Check out** a STEP or PDF file. Verify in psql: `SELECT * FROM locks`
2. **Download** the file. Verify the file appears in your Downloads folder
3. **Edit** the file (for a text file: open and add a line; for a binary file: rename
   your local copy to add `_modified`)
4. **Save WIP.** Verify in psql: `SELECT * FROM wip_snapshots`. Verify in GitLab:
   check the project's branches — `vault-wip/...` should appear
5. **Check in** with a commit message "Review cycle test check-in"
6. **Verify in GitLab**: the project's commit history shows your commit
7. **Verify in psql**:
   - `SELECT * FROM locks` — no lock for this file
   - `SELECT * FROM versions` — one version record with the commit SHA
   - `SELECT * FROM wip_snapshots` — no snapshots (deleted on check-in)
8. **Verify in GitLab**: the `vault-wip/...` branch is gone (deleted on check-in)
9. **Verify the version history panel**: the checked-in version appears

---

### Step 2 — Write the Sequence Diagram

A **sequence diagram** shows the order of interactions between components over time.
ASCII sequence diagrams are sufficient for documentation purposes.

Create `docs/checkout-sequence.md`:

```markdown
# Vault — Full Checkout Cycle Sequence

## Actors
- USER: The engineer using Vault
- RENDERER: React UI in Electron renderer process
- API: Express server in Electron main process
- DOMAIN: Business logic (domain layer TypeScript)
- DB: PostgreSQL database
- GITLAB: GitLab REST API

## Check Out

USER        RENDERER         API              DOMAIN           DB              GITLAB
  |             |              |                 |               |                |
  |--[click]-->  |              |                 |               |                |
  |             |--POST /checkout-->              |               |                |
  |             |              |--checkoutFile()-->              |                |
  |             |              |                 |--BEGIN------->|                |
  |             |              |                 |--SELECT FOR UPDATE (files)---->|
  |             |              |                 |--SELECT (locks)--------------->|
  |             |              |                 |  (no lock found)               |
  |             |              |                 |--INSERT INTO locks------------>|
  |             |              |                 |--COMMIT------>|                |
  |             |              |<--{ lock }------|               |                |
  |             |<--201 { lock }--|              |               |                |
  |<--badge: "Checked Out by You"--|             |               |                |

## WIP Save

USER        RENDERER         API              DOMAIN           DB              GITLAB
  |             |              |                 |               |                |
  |--[click]-->  |              |                 |               |                |
  |             |--openFile()--> (IPC to main)    |               |                |
  |<--dialog--| (OS file dialog)                  |               |                |
  |--[select]->  |              |                 |               |                |
  |             |--POST /wip-->  |                |               |                |
  |             |              |--saveWipSnapshot()-->           |                |
  |             |              |                 |--verify lock exists----------->|
  |             |              |                 |--commitWipSnapshot()----------->|
  |             |              |                 |                |--POST commits->|
  |             |              |                 |                |<--commitSha ---|
  |             |              |                 |--INSERT wip_snapshots--------->|
  |             |              |<--{ snapshotSha }|               |                |
  |<--"WIP saved"--|            |                 |               |                |

## Check In

USER        RENDERER         API              DOMAIN           DB              GITLAB
  |             |              |                 |               |                |
  |--[click]-->  |              |                 |               |                |
  |             |--POST /checkin-->              |               |                |
  |             |              |--checkinFile()-->               |                |
  |             |              |                 |--verify lock-->|                |
  |             |              |                 |--commitCheckin()-------------->|
  |             |              |                 |                |--POST commits->|
  |             |              |                 |                |<--commitSha ---|
  |             |              |                 |--BEGIN-------->|                |
  |             |              |                 |--INSERT versions-------------->|
  |             |              |                 |--DELETE wip_snapshots--------->|
  |             |              |                 |--DELETE locks----------------->|
  |             |              |                 |--COMMIT------->|                |
  |             |              |                 |--deleteBranch()--------------->|
  |             |              |<--{ commitSha }--|               |                |
  |             |<--200 { commitSha }--|          |               |                |
  |             |--re-fetch statuses-->            |               |                |
  |<--badge: "Available"--|     |                 |               |                |
```

---

### Step 3 — The Architecture Rule Audit

For each of the following, name which layer it belongs in and why:

1. "Checking whether a file is available for checkout" — **Domain**. This is a
   business rule: "a file is available if no lock record exists." It does not belong
   in the API layer (too specific) or the data layer (too abstract).

2. "Querying `SELECT * FROM locks WHERE file_id = $1`" — **Data**. Knows about SQL
   and the `locks` table. Domain calls this function by name; domain does not write SQL.

3. "Mapping the `CheckoutResult` to HTTP status codes 201/409" — **API**. Knows about
   HTTP. Translates domain results to HTTP responses. Neither domain nor renderer should
   choose HTTP status codes.

4. "Showing 'Checked Out by You' vs another user's name" — **Presentation**.
   Knows about the DOM and what to display. No business logic — it renders what the
   API returned.

5. "Calling `commitCheckin` with the user's PAT" — **Domain** orchestrates the call;
   **Data** makes the actual HTTP request to GitLab. Domain does not know the GitLab
   API URL; data does not know the business rule being implemented.

---

## Connect the Pieces

Phase 4 is complete. The system can:
- Authenticate a user via GitLab PAT
- Browse a project's file tree
- Check out a file with atomic locking
- Download the file to disk
- Save WIP snapshots to GitLab
- Check in with a version record
- View version history

Phase 5 adds quality-of-life features that do not change the core architecture.

---

## Definition of Done

- [ ] A complete checkout cycle has been performed and all six verification steps passed
- [ ] The sequence diagram is in `docs/checkout-sequence.md` and committed to git
- [ ] You can answer the architecture audit questions without looking at the code
- [ ] You can explain why the GitLab commit happens before the database writes in check-in
- [ ] You can explain what would need to change to support two simultaneous checkout users
    (the atomic locking already handles this — the answer is "nothing")
- [ ] Run:
      ```
      git add docs/
      git commit -m "Add Phase 4 review: full checkout sequence diagram, architecture rule audit"
      ```

---

*Next: Lesson 24 — Search. A search bar finds files by name or path using PostgreSQL
ILIKE. Results appear as you type, debounced to avoid excessive queries.*
