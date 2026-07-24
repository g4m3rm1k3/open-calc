# Lesson 18: Privilege Escalation

## What you will build

A real, unprivileged Linux user account on this machine, a root-owned file that account
genuinely cannot read, and a small setuid C program that hands that same account root's
file contents anyway — not through any memory corruption or password guess, but because a
program running with elevated privileges trusted a filename it was handed. The
transferable problem: every vulnerability in this course so far assumed the vulnerable
code was running with the attacker's own, ordinary permissions. This lesson is about what
changes — and what suddenly becomes catastrophic — when the vulnerable code is running
with someone else's.

## What you need to know first

Lesson 1 (Trust Boundaries) — today's vulnerability is an untrusted filename crossing into
code that trusts it, the same pattern as every lesson in Module B, now with a much higher
stake attached. Lesson 5 (Command Injection) is referenced directly and its exact
technique is deliberately attempted and shown *not* to work here, for a specific,
real reason explained in this lesson's final unit. Lesson 17 (Buffer Overflows) — this is
the second C lesson in the course; file I/O functions (`fopen`, `fgets`) are new but the
absence of automatic safety checks you learned there still applies.

---

## Concept Unit: Users, Permissions, and What "Denied" Actually Means

### The Problem

Every attack in this course so far ran as whatever user executed the vulnerable program.
This unit asks a question none of them needed to: what does the operating system itself
enforce about which files a given user is even allowed to touch, before any application
code runs at all?

### Introduce the Concept in Isolation

```bash
useradd -m -s /bin/bash lowpriv
id lowpriv
```

```
uid=1001(lowpriv) gid=1002(lowpriv) groups=1002(lowpriv)
```

```bash
echo "top secret root data" > /root/secret.txt
chmod 600 /root/secret.txt
ls -l /root/secret.txt
su lowpriv -c "cat /root/secret.txt"
```

```
-rw------- 1 root root 21 Jul 18 23:14 /root/secret.txt
cat: /root/secret.txt: Permission denied
```

This output proves that Linux's permission enforcement happens at the kernel level,
beneath any application: `cat` — a completely ordinary, correctly written program — was
refused access to `/root/secret.txt` before it ever got to decide anything about the
file's contents. `chmod 600` set the file's permission bits so that only its owner
(`root`) may read or write it; `lowpriv`, a different user entirely, was rejected
automatically. No application code enforced this. The kernel did, on every single file
access, unconditionally.

### Discard

This isolated `useradd`/`chmod` example established the baseline the rest of this lesson
builds on; the specific file `/root/secret.txt` and user `lowpriv` it created are reused
directly in the next units, not discarded — this is one of the cases this course's Concept
Isolation Rule anticipates: the lab *is* the infrastructure the following units need, not
a disposable stand-in for it.

### Where This Lives

This lesson builds three C programs — `whoami_demo.c`, then `read_backup_vuln.c`, then
`read_backup_fixed.c` — each compiled and installed as a real setuid binary on this
machine, using the `lowpriv` user and `/root/secret.txt` created in this unit throughout.

### CS Lens

```
Also recognized in: every multi-user operating system's access control model
(Windows ACLs, macOS's POSIX-compatible permissions), container isolation (a
process inside a Docker container is still subject to the same UID-based
permission checks against the host filesystem unless explicitly configured
otherwise), and cloud IAM roles, which are the same "who is asking, what are they
allowed to touch" question, reimplemented above the OS layer instead of within
it.
```

---

## Concept Unit: setuid — Borrowing the File Owner's Identity

### The Problem

Sometimes a low-privileged user legitimately needs to perform an action that requires
elevated permission — changing their own password (which requires writing to a
root-owned system file), for instance. The operating system needs a controlled way to let
a specific, trusted program run with elevated privileges *temporarily*, without simply
handing that user root access outright. This unit asks: how does that actually work,
mechanically?

### Introduce the Concept in Isolation

```c
#include <stdio.h>
#include <unistd.h>

int main() {
    printf("real UID: %d\n", getuid());
    printf("effective UID: %d\n", geteuid());
    return 0;
}
```

Compiled and run normally, first as root, then as `lowpriv`:

```
--- run as root, no setuid ---
real UID: 0
effective UID: 0
--- run as lowpriv, no setuid ---
real UID: 1001
effective UID: 1001
```

Now the same, unmodified binary, owned by root, with one bit changed:

```bash
chown root:root /usr/local/bin/whoami_setuid
chmod u+s /usr/local/bin/whoami_setuid
su lowpriv -c "/usr/local/bin/whoami_setuid"
```

```
real UID: 1001
effective UID: 0
```

This output proves the entire mechanism this unit exists to teach: `lowpriv` executed
this program, and the program's **real UID** — who actually ran it — correctly stayed
`1001`. But its **effective UID** — the identity the kernel uses to evaluate every
permission check the program performs from this point on — became `0`, root, because the
file's owner is root and its `setuid` bit is set. `chmod u+s` set that bit. This is what
"setuid" means: **run with the permissions of the file's owner, not the permissions of
whoever executed it.**

### Discard

`whoami_demo.c` is deleted now. It never appears again in this lesson — it existed only to
make real UID and effective UID visible and distinguishable before the next unit puts that
distinction to dangerous use.

### Where This Lives

**File:** `/usr/local/bin/whoami_setuid`, a compiled and installed copy of the throwaway
example above, owned by `root` with the setuid bit set. This installed binary is itself
discarded before the next unit — only the fact it demonstrated carries forward.

### CS Lens

```
Also recognized in: the `passwd` command on nearly every Linux system (setuid
root, specifically so an ordinary user can update their own entry in
/etc/shadow, a file they otherwise cannot write), `sudo` itself (a setuid-root
binary whose entire job is deciding, based on policy, whether to grant a
temporary elevated shell), ping (historically setuid root on many systems,
because opening a raw network socket required root privilege before more
granular capability systems existed), and Windows's "Run as Administrator" — a
different mechanism achieving a conceptually identical goal: temporarily
elevating a specific action's privileges without permanently elevating the
user's own.
```

### SE Lens

The alternative to setuid is giving `lowpriv` a `sudo` rule scoped to exactly the one
command they need — a smaller, more auditable grant of privilege than "this program always
runs as root for anyone." Real systems increasingly prefer that alternative, and modern
Linux capability systems (`setcap`, granting a specific privilege like "may bind to a
low-numbered port" without granting full root) exist specifically to shrink setuid's
blast radius. setuid remains common anyway because it requires no additional
infrastructure — just one file permission bit — which is precisely why it's still findable
across real systems, and precisely why the next unit's vulnerability class remains
relevant.

---

## Concept Unit: The Vulnerable setuid Utility

### The Problem

A setuid-root program is, by definition, code that a low-privileged user can trigger to
run with full root permissions. Lesson 1's trust boundary framing applies here with unusual
force: **any input that program accepts from the low-privileged caller is now input that
influences what *root* does**, not what the low-privileged user does. This unit builds a
small, realistic setuid utility and asks what happens when it trusts one of its inputs too
much.

### Skip: Concept Already Lab'd

`fopen`, `fgets`, and `fclose` — C's standard file-reading functions — are new to this
course but are not the concept this unit is teaching; they're explained inline in the
walkthrough below rather than isolated first, because the *vulnerability* here is not in
how they work individually, it's in what value gets passed to `fopen` — which is this
unit's actual, single new concept, and is exactly Lesson 1's trust-boundary pattern,
already fully lab'd in that lesson.

### Where This Lives

**File:** `read_backup_vuln.c` (new file), later installed as `/usr/local/bin/read_backup`,
owned by root, with the setuid bit set — using the exact mechanism from the previous unit.

### The New Code

```c
FILE *file = fopen(argv[1], "r");
if (!file) {
    perror("could not open file");
    return 1;
}
char line[256];
printf("--- contents of %s ---\n", argv[1]);
while (fgets(line, sizeof(line), file)) {
    printf("%s", line);
}
fclose(file);
```

### The Updated Project

```c
#include <stdio.h>

int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("usage: read_backup <filename>\n");
        return 1;
    }
    FILE *file = fopen(argv[1], "r");             // ← new
    if (!file) {                                    // ← new
        perror("could not open file");               // ← new
        return 1;                                     // ← new
    }                                                  // ← new
    char line[256];                                    // ← new
    printf("--- contents of %s ---\n", argv[1]);        // ← new
    while (fgets(line, sizeof(line), file)) {             // ← new
        printf("%s", line);                                // ← new
    }                                                        // ← new
    fclose(file);                                            // ← new
    return 0;
}
```

`main` is the entire program: read one command-line argument, treat it as a filename,
print that file's contents. The tool is intended — per its own name — to let a user view a
backup file that lives somewhere the user might not otherwise have permission to read
directly, which is precisely why someone might reach for `chmod u+s` on it in the first
place: that's a legitimate-sounding reason to want this specific program to run as root.

### Mechanical Walkthrough
- `argc != 2` — **(c) already basic**: argument-count checking, familiar from Lesson 17's
  `argv[1]` usage.
- `fopen(argv[1], "r")` — **(a) first appearance**: opens the file at the path given by
  `argv[1]` for reading (`"r"`), returning a `FILE *` handle on success or `NULL` on
- failure — critically, `fopen` performs its permission check using the *calling
  process's effective UID*, not the real UID. This single fact is the entire
  vulnerability: called from a setuid-root binary, `fopen` checks permissions as root,
  regardless of who actually launched the program.
- `perror("could not open file")` — **(a) first appearance**: prints the message followed
  by a human-readable description of the specific reason the most recent failed
  system call failed (e.g., "Permission denied," "No such file or directory") — standard
  C error reporting.
- `fgets(line, sizeof(line), file)` — **(a) first appearance**: reads one line (up to
- `sizeof(line) - 1` characters, or until a newline) from `file` into `line`, returning `NULL` once the end of the file is reached — this is what a bounds-respecting read looks

  like, in direct contrast to Lesson 17's unbounded `strcpy`, since `fgets` is explicitly
  told `line`'s size and will not write past it.
- `fclose(file)` — **(c) already basic**: releases the file handle; needs no further
  explanation for reading purposes.
- `argv[1]` used directly, three times, with **no validation of its contents at all** —
  **(b) hard concept reappearing**: this is Lesson 1's exact trust-boundary pattern —
  untrusted input flowing, unchecked, into an operation that treats it as fully trusted —
  reappearing here with the stakes raised by this program's root-level effective UID.

### CS Lens

`fopen`'s permission check happens against the **effective UID at the moment of the
call**, not against any property of the argument itself — the function has no concept of
"this path looks suspicious." It performs exactly the access check the kernel always
performs, using whatever identity the calling process currently holds. The vulnerability
isn't in `fopen`; it's that this program's effective identity (root, courtesy of the
setuid bit) is being applied to a path the program never restricted in any way.

```
Also recognized in: nearly every real-world "arbitrary file read/write via setuid
or setgid binary" CVE, symlink-following vulnerabilities in privileged cron jobs
(a job running as root follows a symlink an unprivileged user planted, and
operates on whatever the symlink actually points to), Docker container
misconfigurations that mount the host filesystem into a privileged container
without restricting which paths are reachable from inside it, and web application
"file download" features that accept a filename parameter and pass it to a
file-reading call without restricting it to an intended directory -- the exact
same unrestricted-path pattern, minus the privilege boundary.
```

### SE Lens

The alternative not chosen here is restricting *what the program is even capable of
doing* with root's privileges, rather than trusting the caller to only ask for reasonable
things — exactly the next unit's fix. The tradeoff being skipped is real: restricting the
path costs a few lines and slightly reduces the tool's flexibility (it can no longer read
*any* file by design, only ones inside a designated directory), in exchange for closing
off the exact vulnerability this unit demonstrates. Skipping that restriction is cheaper
to write and, as shown next, catastrophically more expensive when exploited.

### Commands Needed

`chown root:root /usr/local/bin/read_backup` sets the file's owner to root — required for
the setuid bit to have any effect, since setuid always means "run as the file's *owner*,"
never as any other identity. `chmod u+s /usr/local/bin/read_backup` sets the setuid
permission bit specifically (`u` for "user," meaning the file owner; `+s` adds the setuid
bit) — visible afterward as an `s` in place of the normal executable `x` in `ls -l`'s
output (`-rwsr-xr-x`).

### Run It

```
=== lowpriv tries to read root's secret DIRECTLY ===
cat: /root/secret.txt: Permission denied

=== lowpriv uses the setuid tool instead ===
--- contents of /root/secret.txt ---
top secret root data
```

The direct attempt is refused by the kernel, exactly as the first Concept Unit
established. The identical file, requested through the setuid tool instead, is handed
over in full. `lowpriv` never gained root access in any general sense — no shell, no
password, nothing persistent — but obtained the specific contents of a file the operating
system was actively enforcing they could not read, which is precisely what "privilege
escalation" means: a low-privileged actor gaining a capability normally reserved for a
higher-privileged one.

This unit's vulnerability is Lesson 1's unmarked trust-boundary crossing, reappearing
exactly where the first unit's permission enforcement said it shouldn't be possible —
because that enforcement was checking the *program's* effective identity, and the program
handed a root-level identity to an input it never questioned.

---

## Concept Unit: Restricting the Path

### The Problem

`read_backup`'s actual, legitimate purpose only ever needed to reach files inside one
specific directory. Nothing about that purpose required accepting an arbitrary path at
all — the previous unit's vulnerability exists entirely because the code accepted more
than its job required.

### Where This Lives

**File:** `read_backup_fixed.c` (new file, based on `read_backup_vuln.c`). **Change
type:** insert a validation check before the `fopen` call, and construct the actual path
from a fixed directory plus the validated filename rather than using `argv[1]` directly.

### The New Code

```c
if (strstr(argv[1], "..") != NULL || argv[1][0] == '/') {
    printf("refused: filename must be a plain name inside /var/backups/\n");
    return 1;
}

char full_path[512];
snprintf(full_path, sizeof(full_path), "/var/backups/%s", argv[1]);
```

### The Updated Project

```c
#include <stdio.h>
#include <string.h>

int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("usage: read_backup <filename>\n");
        return 1;
    }

    if (strstr(argv[1], "..") != NULL || argv[1][0] == '/') {  // ← new
        printf("refused: filename must be a plain name inside /var/backups/\n");  // ← new
        return 1;                                                // ← new
    }                                                             // ← new

    char full_path[512];                                          // ← new
    snprintf(full_path, sizeof(full_path), "/var/backups/%s", argv[1]);  // ← new

    FILE *file = fopen(full_path, "r");
    if (!file) {
        perror("could not open file");
        return 1;
    }
    char line[256];
    printf("--- contents of %s ---\n", full_path);
    while (fgets(line, sizeof(line), file)) {
        printf("%s", line);
    }
    fclose(file);
    return 0;
}
```

The program's overall shape is unchanged — read one argument, print one file's contents —
but `fopen` now always operates on a path the program itself constructed, anchored to
`/var/backups/`, rather than on `argv[1]` directly.

### Mechanical Walkthrough
- `strstr(argv[1], "..") != NULL` — **(a) first appearance**: `strstr` searches for one
  string inside another, returning a pointer to the first occurrence or `NULL` if it's
- absent. Checking for `".."` specifically blocks **path traversal** — an attacker
  supplying something like `../../root/secret.txt` to walk back out of the intended
  directory using relative path segments.
- `argv[1][0] == '/'` — **(a) first appearance**: checks whether the filename's first
  character is a forward slash, which would make it an **absolute path** — bypassing the
  intended directory entirely regardless of any `..` sequences, the same class of bypass
  the previous unit's exploit used directly.
- `snprintf(full_path, sizeof(full_path), "/var/backups/%s", argv[1])` — **(b) hard
  concept reappearing**: `snprintf` is Lesson 5's bounds-respecting alternative to unsafe
  string building — here used to construct a path that is *always* prefixed with
  `/var/backups/`, no matter what `argv[1]` contains, given that it has already passed the
  two checks above.

### CS Lens

This is Lesson 1's allow-list principle again: rather than trying to enumerate every
dangerous path shape (a deny-list — block `..`, block leading `/`, and hope nothing else
was missed), the more robust version of this fix restricts the *output* — `full_path` is
always, unconditionally, something inside `/var/backups/`, by construction, not by
successfully blocking every bad input. The two checks shown here are a reasonable
first defense, but the SE Lens below names a more complete alternative than pattern
matching against the raw string.

### SE Lens

A more thorough fix than string pattern-matching exists: resolve `full_path` to its
**canonical path** (using `realpath()`, which follows symlinks and collapses `..`
segments into an actual absolute path) and then verify that canonical path genuinely
starts with `/var/backups/`, rather than trusting that blocking the literal substring
`".."` catches every way to escape the directory (symlinks inside `/var/backups/`
pointing elsewhere would defeat the simpler check shown above). The version in this
lesson trades some of that robustness for a change small enough to read in full inside
this unit — a real, disclosed simplification, not a hidden one.

### Commands Needed

No new tools — `gcc -o read_backup_fixed read_backup_fixed.c`, then the same
`chown root:root` / `chmod u+s` sequence as the previous unit's install.

### Run It

```
=== legitimate use ===
--- contents of /var/backups/report.txt ---
a legitimate backup file

=== attempted escalation with absolute path ===
refused: filename must be a plain name inside /var/backups/

=== attempted escalation with path traversal ===
refused: filename must be a plain name inside /var/backups/
```

The exact attack that succeeded against the previous unit's version — an absolute path
straight to `/root/secret.txt` — is refused before `fopen` is ever called. A path
traversal variant, `../../root/secret.txt`, is refused by the same check. Legitimate use,
a plain filename, still works exactly as intended.

This unit's fix connects directly to the vulnerability it closes: the previous unit's
entire exploit depended on `argv[1]` reaching `fopen` unexamined; this unit's two-line
check, running before that call, is the only change required to remove that path.

---

## Connect the Pieces

Trace the full chain: the first unit established that the kernel enforces file permissions
strictly, using a process's effective UID — `lowpriv` genuinely cannot read
`/root/secret.txt` directly. The second unit showed setuid deliberately overriding that
check for one specific, trusted program, changing its effective UID to root's regardless
of who runs it. The third unit built exactly such a program and gave it Lesson 1's
unmarked trust boundary — an unrestricted filename — which, combined with the second
unit's elevated effective UID, let `lowpriv` read a file the first unit proved they
otherwise cannot. The fourth unit closed that boundary the same way Lesson 1 always
closes it: not by inspecting the dangerous input harder, but by constraining what the
program is willing to do with it at all.

## What Breaks Without This

A brief, genuinely important aside: an earlier draft of this lesson's vulnerable program
used `system("cp %s /root/backups/", argv[1])` — Lesson 5's exact command-injection
shape — expecting the same privilege escalation to work through a shell instead of a
direct file read. It didn't: on this system, `/bin/sh` (like `bash`) detects that its real
and effective UIDs differ and deliberately drops back to the real UID before executing
anything, specifically as a defense against this exact attack pattern. This is worth
sitting with rather than skipping past: it means a real, additional layer of protection
already exists in modern shells, independent of anything this lesson's programs do — and
it's precisely why the vulnerability in this lesson had to be built as a direct file
operation in C rather than a shelled-out command, once that fact was discovered while
testing. Rerun `read_backup_vuln` (the unrestricted version) against `/root/secret.txt`
to reproduce the actual, working escalation this lesson relies on — the shell's defense
doesn't apply here because no shell is involved at all.

## Exercises

1. Create a symlink inside `/var/backups/` pointing at `/root/secret.txt`
   (`ln -s /root/secret.txt /var/backups/link`) and run `read_backup_fixed link`. Determine
   whether the fix from this lesson's final unit prevents this, and explain why, connecting
   your answer to that unit's SE Lens.
2. Modify `read_backup_fixed.c` to use `realpath()` and verify the resolved path's prefix,
   per the SE Lens's "more thorough fix," and confirm it closes the symlink gap from
   Exercise 1.
3. Remove the setuid bit from `read_backup_fixed` (`chmod u-s`) and rerun it as `lowpriv`
   against a file inside `/var/backups/`. Explain, in one sentence, why this still works
   correctly even without elevated privileges — and what that implies about when setuid is
   actually necessary versus merely convenient.

## Definition of Done

- [ ] You created the `lowpriv` user and confirmed direct access to `/root/secret.txt` is
      denied
- [ ] You built and ran the setuid `whoami_demo`, confirming effective UID becomes `0`
      while real UID stays `1001`
- [ ] You built and ran the vulnerable `read_backup`, reproducing the successful read of
      `/root/secret.txt`
- [ ] You built and ran the fixed `read_backup_fixed`, reproducing both refusals and the
      legitimate success case
- [ ] You completed Exercise 1 and can state whether the symlink attack succeeds against
      the simple string-check fix
- [ ] You can explain, in one sentence, the difference between real UID and effective UID
- [ ] `git add .` and `git commit -m "Lesson 18: privilege escalation via an unrestricted
      setuid file path"` in your `security-labs/` folder

**Next:** Lesson 19 — Secrets Management, where this lesson's `/root/secret.txt` — a
credential sitting in a plaintext file, protected by nothing but file permissions — gets
the treatment real production systems give secrets instead.
