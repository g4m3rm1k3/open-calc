# Lesson 41: Backups Should Cost Less Every Time They Repeat

## What you will build

A scheduled backup tool — the Track 4 capstone, combining Lesson 34's
real, working `cron` with Lesson 16's folder-comparison logic — that
copies only what actually changed since the last backup, links
everything else to the previous backup's already-stored copy instead of
duplicating it, and verifies every file byte-for-byte after copying. The
transferable problem this lesson is actually about: a backup tool that
copies the entire source directory every single run is correct but
wasteful — disk usage grows without bound even when nothing changes —
and the fix isn't a smarter compression scheme, it's noticing that two
files with identical content don't need two separate copies on disk at
all.

## What you need to know first

- **Lesson 16** — comparing two directories to determine what changed.
  Today's backup reuses that comparison, applied against the *previous
  backup* rather than a second live directory.
- **Lesson 13** — hashing a file's content to detect duplicates.
  Reused directly: today's "did this file change?" check is the same
  hash comparison, applied to one file across two points in time instead
  of two different files at the same time.
- **Lesson 34** — the real, working `cron` daemon this lesson schedules
  the backup with, and the exact "install, wait, verify it actually
  fired" proof technique that lesson established.

---

## The Problem, in prose, no code yet

The simplest possible backup tool copies the entire source folder to a
freshly named destination every time it runs. That's genuinely correct —
nothing is ever lost — but it's also wasteful in a way that gets worse
every single run: if a thousand files never change and only one file is
edited daily, a naive full-copy backup still duplicates all thousand
unchanged files, every day, forever. A backup taken an hour after the
previous one, with nothing having changed in between, should cost almost
nothing — not because the tool skips backing anything up, but because it
recognizes that "back this up" and "physically duplicate these bytes
again" aren't actually the same requirement.

---

## Concept Unit: Two Names, One File

### The Problem

Recognizing that a file hasn't changed is only half the problem — the
backup still needs *something* at the new backup's location representing
that file, or a later restore from that specific backup would be
incomplete. Physically copying the bytes again defeats the entire point.
There needs to be a way to make a file appear at a new location without
actually duplicating its content on disk at all.

### Introduce the concept in isolation

```python
import os

with open("original.txt", "w") as f:
    f.write("shared content")

os.link("original.txt", "hardlink_copy.txt")

original_inode = os.stat("original.txt").st_ino
linked_inode = os.stat("hardlink_copy.txt").st_ino
print("original inode:", original_inode)
print("hardlink inode:", linked_inode)
print("same inode (same physical data, two names):", original_inode == linked_inode)

with open("hardlink_copy.txt", "w") as f:
    f.write("changed through the second name")

print("original.txt now reads:", open("original.txt").read())
```

Run it:

```
original inode: 590782
hardlink inode: 590782
same inode (same physical data, two names): True
original.txt now reads: changed through the second name
```

What this proves: `os.link(source, new_name)` (**first appearance**)
doesn't copy `original.txt`'s content anywhere — it creates a second
directory entry, `hardlink_copy.txt`, pointing at the exact same
underlying data on disk, confirmed by both names sharing the same
**inode** (**first appearance**: the number the filesystem itself uses
to identify one physical file's data and metadata, independent of
whatever name or names point to it — a concept Lesson 8's symbolic
links lesson touched on the *naming* side of; a hard link is the same
inode with a second name, where a symbolic link is a separate file that
merely *contains* a path to another name). The second `open(...)`
call, writing through `hardlink_copy.txt`, changed what `original.txt`
reads back as — proof that both names really do refer to one shared
file, not two independent copies that merely started out identical.

This lab is deleted now; it never appears in the project. What survives
is both the technique and a real, sharp warning the last line of that
output makes concrete: **writing to a hard-linked file changes it
everywhere that link points**, which means a backup tool using hard
links must never modify a file in place through one of its links — it
must always create a genuinely new file when content has changed, never
edit an existing linked one.

### CS Lens

This is **deduplication at the filesystem level** — two logical
references to one physical copy of data, with the operating system
itself tracking how many names currently point to a given inode (a
"link count") and only actually freeing the underlying data once that
count reaches zero.

Also recognized in: real backup tools that use exactly this technique —
`rsync --link-dest`, Time Machine on macOS, `rsnapshot` — all building
"incremental-looking, but actually a full independent snapshot" backups
out of hard links for precisely this reason; Git's own object storage
(identical file content across commits is stored once, referenced by
hash, conceptually the same "don't duplicate identical data" idea
applied via content hashing instead of filesystem links.

### SE Lens

The alternative — copying every file on every backup — is simpler code
and has zero risk of the in-place-modification hazard just demonstrated.
Hard links trade that simplicity for real disk savings, at the cost of
a sharp new invariant the code must never violate: every write path in
this lesson's backup tool must go through `shutil.copy2` (creating a
brand-new file) for anything that changed, and only ever use `os.link`
for content confirmed byte-for-byte identical to what's already safely
stored in a previous backup — mixing those two up even once would
silently corrupt an older, supposedly-safe backup.

---

## Concept Unit: Copy What Changed, Link What Didn't

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `backup.py`.
- **Change type:** add.
- **Dependencies:** `hashlib` (Lesson 13/30), `os`, `shutil`, `time`.

### The New Code

```python
def hash_file(file_path):
    hasher = hashlib.sha256()
    with open(file_path, "rb") as opened_file:
        hasher.update(opened_file.read())
    return hasher.hexdigest()


def find_latest_backup(backup_root):
    if not os.path.isdir(backup_root):
        return None
    existing_backups = sorted(os.listdir(backup_root))
    return os.path.join(backup_root, existing_backups[-1]) if existing_backups else None


def create_backup(source_dir, backup_root, timestamp=None):
    timestamp = timestamp or time.strftime("%Y%m%d_%H%M%S")
    destination_dir = os.path.join(backup_root, timestamp)
    previous_backup_dir = find_latest_backup(backup_root)

    manifest = {"copied": [], "linked": [], "bytes_copied": 0}

    for current_dir, _, file_names in os.walk(source_dir):
        relative_dir = os.path.relpath(current_dir, source_dir)
        destination_subdir = os.path.join(destination_dir, relative_dir)
        os.makedirs(destination_subdir, exist_ok=True)

        for file_name in file_names:
            source_file_path = os.path.join(current_dir, file_name)
            destination_file_path = os.path.join(destination_subdir, file_name)
            relative_file_path = os.path.join(relative_dir, file_name)

            previous_file_path = None
            if previous_backup_dir:
                candidate = os.path.join(previous_backup_dir, relative_file_path)
                if os.path.isfile(candidate):
                    previous_file_path = candidate

            if previous_file_path and hash_file(previous_file_path) == hash_file(source_file_path):
                os.link(previous_file_path, destination_file_path)
                manifest["linked"].append(relative_file_path)
            else:
                shutil.copy2(source_file_path, destination_file_path)
                manifest["copied"].append(relative_file_path)
                manifest["bytes_copied"] += os.path.getsize(source_file_path)

    return destination_dir, manifest
```

### The Updated Project

Three new, freestanding functions with nothing surrounding them yet.

### Mechanical Walkthrough

- `hash_file` — a **hard concept reappearing** from Lesson 13's own
  duplicate-file-finder: `hashlib.sha256()` (SHA-256 rather than Lesson
  30's SHA-1, chosen here for its stronger collision resistance, since a
  backup tool silently treating two genuinely different files as
  identical would be a real data-loss bug, not just a minor
  inconvenience), fed the file's raw bytes, returning a fixed-length
  hex digest.
- `find_latest_backup` — `sorted(os.listdir(backup_root))` relies
  directly on this lesson's own timestamp naming scheme
  (`YYYYMMDD_HHMMSS`) sorting correctly as plain strings — a **hard
  concept reappearing** from Lesson 36's `date.today().isoformat()`
  choice: because the format is zero-padded and most-significant-first,
  alphabetical string sorting and chronological sorting produce the
  identical order, with no separate date-parsing step required.
- `os.walk(source_dir)` — a **hard concept reappearing** from Lesson 12's
  recursive file search: yields every directory, alongside its files, at
  every depth.
- `os.path.relpath(current_dir, source_dir)` — **first appearance.**
  Computes `current_dir`'s path *relative to* `source_dir` — for a file
  at `source/notes/gamma.txt`, this yields `notes`, not the full
  absolute path — which is exactly what's needed to reconstruct the
  identical relative structure inside `destination_dir` and to look up
  the *same* relative file inside `previous_backup_dir`, regardless of
  where either directory tree actually lives on disk.
- `os.makedirs(destination_subdir, exist_ok=True)` — a **hard concept
  reappearing**; creates the needed directory structure, tolerating it
  already existing.
- The `previous_file_path` lookup and the `if previous_file_path and
  hash_file(...) == hash_file(...):` branch — this is the entire concept
  this unit exists to teach, stated as code: only link when a same-path
  file existed in the previous backup *and* its content hash matches the
  current source file's hash exactly; anything new, moved, or changed in
  content takes the `else` branch instead.
- `shutil.copy2(source_file_path, destination_file_path)` — **first
  appearance of this specific function.** Like Lesson 11's own `cp`
  work, but `copy2` specifically (versus plain `shutil.copy`) also
  preserves the original file's metadata — modification time,
  permissions — which matters for a backup: a restored file with today's
  timestamp instead of its true original modification date would be a
  real, if subtle, loss of information.
- `manifest["bytes_copied"] += os.path.getsize(source_file_path)` —
  reused arithmetic and a stdlib call; tracks real, measurable savings
  the next unit's run directly demonstrates.

### Run it

Against a real three-file source directory, as the very first backup —
nothing to compare against yet, so everything is copied:

```
=== backup 1 ===
copied: ['./beta.txt', './alpha.txt', 'notes/gamma.txt']
linked: []
bytes copied: 41
```

Now, with `beta.txt`'s content changed and a new file, `delta.txt`,
added — everything else in `source/` left untouched — running a second
backup:

```
=== backup 2 ===
copied: ['./beta.txt', './delta.txt']
linked: ['./alpha.txt', 'notes/gamma.txt']
bytes copied: 35
```

`alpha.txt` and `notes/gamma.txt`, genuinely unchanged, were correctly
*linked*, not copied. Confirming that's really a hard link and not a
second independent copy that merely happens to match:

```python
inode_backup1 = os.stat("backups/20260101_000000/alpha.txt").st_ino
inode_backup2 = os.stat("backups/20260102_000000/alpha.txt").st_ino
print("same inode across both backups:", inode_backup1 == inode_backup2)
```

```
same inode across both backups: True
```

### CS Lens

The overall structure here is a **content-addressed comparison**:
deciding what to do with a file based on *what it contains* (its hash),
not merely *where it lives or what it's named* — the same principle
Lesson 13's duplicate finder used to spot identical files anywhere in a
tree, applied here across time instead of across a single directory
snapshot.

### SE Lens

`create_backup` never modifies `previous_backup_dir` at all — it only
ever reads from it (to compute a hash) and creates new hard links or new
files inside a brand-new `destination_dir`. This is a deliberate safety
property, not an accident: even a bug in this function's own logic can
corrupt, at worst, the *new* backup being created — every previous
backup remains exactly as it was, immutable, which is precisely the
guarantee a backup tool must never break.

---

## Concept Unit: Trusting, Then Verifying

### The Problem

`create_backup` reports what it *believes* it copied or linked — but a
report of intended actions isn't proof those actions actually produced
correct data on disk. A backup that silently corrupts a file during
copying (a truncated write, a filesystem error) and reports success
anyway is worse than one that fails loudly, because nobody would know to
restore from an earlier, still-good backup instead.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `backup.py`.
- **Change type:** add.
- **Location:** below `create_backup`.

### The New Code

```python
def verify_backup(source_dir, destination_dir):
    mismatches = []
    for current_dir, _, file_names in os.walk(source_dir):
        relative_dir = os.path.relpath(current_dir, source_dir)
        for file_name in file_names:
            source_file_path = os.path.join(current_dir, file_name)
            backup_file_path = os.path.join(destination_dir, relative_dir, file_name)
            if not os.path.isfile(backup_file_path) or hash_file(source_file_path) != hash_file(backup_file_path):
                mismatches.append(os.path.join(relative_dir, file_name))
    return mismatches
```

### Mechanical Walkthrough

Every construct here is a **hard concept reappearing** from the unit
above — `os.walk`, `os.path.relpath`, `hash_file` — applied to a genuinely
different question: not "did this file change since the last backup"
(the question `create_backup` answers while deciding link-versus-copy),
but "does the file that now exists in *this* backup actually match the
source, byte for byte, right now" — independently re-checked after the
fact, using the exact same hash-comparison technique for a different
purpose.

### Run it

```
mismatches: []
```

on both backups run in this lesson — an empty list meaning every single
file, whether freshly copied or hard-linked to a previous backup, hashes
identically to its corresponding source file.

### CS Lens

This is **independent verification** — deliberately re-deriving a result
(the hash of what's actually on disk) rather than trusting the process
that produced it to have reported its own success correctly. A process
reporting "I succeeded" and a separate check confirming the *result* is
actually correct are testing two different things; a bug in
`create_backup` that silently mislabeled a copy as successful would be
caught by `verify_backup` precisely because it doesn't rely on
`create_backup`'s own bookkeeping at all — it re-reads and re-hashes the
real files.

Also recognized in: this curriculum's own file-checksum-verification
territory (Lesson 44, not yet built), database backup tools that
restore into a scratch environment and query it to confirm the restore
actually worked rather than trusting the backup process's own exit
code, deployment pipelines that smoke-test a freshly deployed service
rather than assuming a successful deploy command means the service is
actually healthy.

### SE Lens

Folding verification into every backup run costs real time — every file
gets hashed twice more (once during `create_backup`'s comparison, once
during `verify_backup`) — in exchange for a genuinely stronger
guarantee: a backup that reports "0 mismatches" has *earned* that claim
through direct re-inspection, not merely completed without raising an
exception. For something whose entire purpose is being trustworthy
later, when it's needed most and least convenient to discover a problem,
that cost is worth paying every time, not just occasionally.

---

## Concept Unit: Closing the Loop With `cron`

### The Problem

Everything built so far runs when manually invoked. A backup that only
runs when someone remembers to run it by hand isn't meaningfully
different from no backup at all during every stretch of time nobody
remembered.

### Commands needed

Reusing Lesson 34's exact real, working setup:

```
$ echo "* * * * * /usr/bin/python3 /home/claude/lesson41/run_backup_job.py >> /home/claude/lesson41/cron_backup.log 2>&1" | crontab -
$ crontab -l
* * * * * /usr/bin/python3 /home/claude/lesson41/run_backup_job.py >> /home/claude/lesson41/cron_backup.log 2>&1
```

### Run it

Installed, then genuinely waited past the next real minute boundary —
the identical proof technique Lesson 34 used, applied to this lesson's
own real backup job instead of a placeholder timestamp logger:

```
[2026-07-26 01:05:01] backup -> /home/claude/lesson41/backups/20260726_010501
  copied=4 linked=0 bytes_copied=63
  verification mismatches: []
```

`cron`, entirely on its own, at the next real minute boundary, ran the
actual backup script, which created a real new timestamped backup
directory, ran real verification against it, and reported zero
mismatches — with no process kept alive in between by this lesson's own
shell session at all, exactly the property Lesson 34 built this
mechanism to provide.

### CS Lens and SE Lens

Both already fully covered in Lesson 34 — a scheduled, unattended,
crash-and-reboot-surviving trigger for a task that otherwise depends on
someone remembering to run it. No new lens content owed here beyond
naming the direct reuse, per the Repetition Rule; the entire point of
this closing unit is that nothing new had to be invented to wire a real
backup tool into a real schedule — Lesson 34's mechanism was already
general enough.

---

## Connect the pieces

One file, `alpha.txt`, followed through the entire capstone: on the first
backup, it doesn't exist in any previous backup, so it's copied for
real, its bytes physically duplicated onto disk, and `verify_backup`
confirms the copy matches. On the second backup — `alpha.txt` itself
never touched in `source/` — `create_backup` hashes it, finds an
identical hash already present in the previous backup, and creates a
hard link instead of a second physical copy; `os.stat().st_ino` proves,
directly, that both backups' `alpha.txt` are genuinely the same
underlying data, not two copies that merely match. Scheduled under
`cron`, this entire sequence — compare, link-or-copy, verify — now runs
automatically, once a minute in this lesson's own test, entirely without
anyone present to invoke it by hand.

## What breaks without this

Reverting `create_backup` to always `shutil.copy2` regardless of the
hash comparison — the naive, no-deduplication version — and rerunning
the same two-backup sequence:

```
=== backup 2 (naive, always copies) ===
copied: ['./beta.txt', './delta.txt', './alpha.txt', 'notes/gamma.txt']
linked: []
bytes copied: 63
```

Every file copied again, including the two that never changed — `63`
bytes copied instead of `35`, for a source directory this lesson kept
deliberately tiny specifically so the difference is easy to see by hand.
At real scale — thousands of mostly-unchanged files, backed up daily for
years — that difference compounds directly into disk usage that grows
without bound, rather than roughly tracking only genuine changes over
time. Restoring the hash comparison and `os.link` branch fixes it
immediately.

## Definition of done

- [ ] A first `create_backup` run against a source directory with no
      prior backups copies every file and links none.
- [ ] A second `create_backup` run, after changing one file and adding
      another, copies only those two and hard-links every unchanged file
      — confirmed by matching `st_ino` values, not just by trusting the
      manifest's own labels.
- [ ] `verify_backup` returns an empty list against a real backup, for
      both copied and linked files.
- [ ] Deliberately corrupting one backed-up file's content (e.g.,
      truncating it) and rerunning `verify_backup` correctly reports it
      as a mismatch.
- [ ] A crontab entry running the backup job every minute, left running
      for at least a minute, produces a real, new, verified backup
      directory with no manual intervention.
- [ ] You can explain, without looking back at this lesson, why the
      backup code must never write to a file through an existing hard
      link.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add backup.py run_backup_job.py
  git commit -m "Add incremental snapshot backup — hard-links unchanged files instead of recopying them, independently re-verifies every file by hash, and schedules under cron so it runs without anyone remembering to"
  ```

## What's next

This closes Track 4. `create_backup`'s destination is always a plain
directory tree — a natural next extension, once Track 6 introduces
SQLite (Lesson 50), is a database-aware version: a running database
can't simply be file-copied safely while it's being written to, and
needs its own consistent-snapshot mechanism before this lesson's
hash-and-link logic could safely apply to it at all. Track 5's
encryption lessons are also a natural next step for this exact backup
tool: nothing built today prevents someone with access to `backup_root`
from reading every file's plain content directly.
