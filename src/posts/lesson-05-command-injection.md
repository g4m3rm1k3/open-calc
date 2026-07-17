# Lesson 5: Command Injection

Today we study the exact same missing checkpoint from Lesson 4, meeting a different
interpreter: not a database, but the **operating system's shell** — the program that
turns text into running processes. Our case study is a five-line file utility, and one
semicolon that turns "count the lines in this file" into "count the lines in this file,
*and then run whatever else I decide to type.*"

## What you will learn

You'll build a tool that shells out to a real command, break it with shell metacharacters,
and fix it with the command-injection equivalent of Lesson 4's parameterized queries —
separating the command from its arguments at the API level instead of relying on the
shell to parse a single string correctly.

## What you need to know first

Lesson 1 (Trust Boundaries) and Lesson 4 (SQL Injection) directly — today is the same
vulnerability shape, moved to a new interpreter. If SQL injection made sense to you, this
lesson will feel almost mechanical, which is exactly the point: once you see the pattern
once, you can recognize it anywhere.

---

## The problem

Many programs need to run another program — resize an image with an external tool, ping a
server, compress a file. The straightforward way to do this in most languages is to build
a single string containing the command and hand it to the **shell**: the same program that
interprets what you type at a terminal prompt. The shell has its own grammar, just like
SQL — certain characters aren't literal text to it, they're *instructions*.

- `;` — end this command, start a new one
- `&&` — run the next command only if this one succeeds
- `|` — pipe this command's output into the next command as input
- `` ` `` or `$()` — run this inner command first and substitute its output

If any of those characters arrive inside a value you meant to be "just a filename" or
"just a hostname," and that value gets concatenated into a command string before the shell
sees it, the shell will not treat them as literal text. It will treat them as more shell
grammar — exactly the way SQL treated `--` as a comment marker rather than as two harmless
dashes.

## The lab: a word-count tool with a shell behind it

**Disposable host.** `FileCounter` — a tool that reports how many lines are in a file by
calling the real `wc` (word count) command-line program.

### Step 1 — building the command as one string

```python
import os

def word_count(filename):
    command = "wc -l " + filename
    print(command)
    os.system(command)

word_count("test.txt")
```

**New construct: `os.system`.** `os.system(command_string)` hands `command_string`
directly to the operating system's shell to interpret and run, and prints whatever that
command prints to the terminal. It's the most direct way to run another program from
Python, and — as you're about to see — the most dangerous when any part of
`command_string` comes from outside the program.

Assuming a file `test.txt` with three lines exists, run it:

```
wc -l test.txt
3 test.txt
```

**Walkthrough.** `word_count` builds one string by concatenating the literal text
`"wc -l "` with whatever `filename` holds, then hands the whole thing to `os.system`. The
shell receives `wc -l test.txt`, recognizes `wc` as a program to run, and passes `-l
test.txt` to it as arguments. `wc` prints the line count followed by the filename it
counted. This is identical in shape to Step 1 of Lesson 4 — build a string, hand it to an
interpreter, trust that only the intended parts will be treated as instructions.

**CS lens.** The shell, like the SQL engine in Lesson 4, has a grammar that governs which
characters are literal data and which are control syntax. `os.system` gives the shell one
single string and asks it to parse the *entire thing* as shell grammar — there is no
mechanism here for saying "parse `wc -l` as a command, but treat everything in `filename`
as inert data, no matter what it contains." That distinction has to be made by the
programmer, and in this function, it isn't made at all.

**SE lens.** Exactly like `check_login` in Lesson 4, `word_count` has taken on an
unstated second responsibility — safely converting arbitrary text into shell-safe
argument syntax — that nothing in the function actually implements.

### Step 2 — the payload

```python
word_count("test.txt; echo INJECTED - arbitrary command executed")
```

Run it:

```
wc -l test.txt; echo INJECTED - arbitrary command executed
3 test.txt
INJECTED - arbitrary command executed
```

**Execution trace** of how the shell parses this string:

```
'wc -l test.txt'                    → parsed as a complete command: run `wc` with
                                       arguments `-l` and `test.txt`
';'                                  → shell grammar meaning "end that command,
                                       here comes another one"
' echo INJECTED - arbitrary command executed'
                                     → parsed as a second, completely separate
                                       command: run `echo` with those words as
                                       arguments
```

Two commands ran where the program only ever intended to run one. `echo` is harmless here
— it just prints text — but the shell has no concept of "harmless." It will run whatever
command follows the `;` with exactly the same trust as the command the programmer wrote.
An attacker who can reach `word_count`'s `filename` parameter can substitute `echo
INJECTED` for literally any command the operating system can run, constrained only by
whatever permissions the running program itself has — reading files, sending network
requests, or, in the worst realistic case, downloading and running further malicious code.

**Security lens.** This is the same trust-boundary failure as Lesson 4, but where SQL
injection's blast radius was "everything in this database," command injection's blast
radius is "everything this operating system account is allowed to do" — usually a
substantially larger set of possible damage, since a shell command isn't confined to one
database's data. This is regularly rated among the most severe vulnerability classes for
exactly that reason: successful exploitation often means the attacker can run arbitrary
code, not just read or modify data.

### Step 3 — the fix: separate the command from its arguments

```python
import subprocess

def word_count_safe(filename):
    result = subprocess.run(["wc", "-l", filename], capture_output=True, text=True)
    print(result.stdout, end="")
    if result.returncode != 0:
        print(result.stderr, end="")

word_count_safe("test.txt")
print("---injection attempt---")
word_count_safe("test.txt; echo INJECTED - arbitrary command executed")
```

**New constructs.** `subprocess.run(argument_list, ...)` runs a program directly — no
shell is invoked to interpret anything — where `argument_list` is a Python list whose
first element is the program to run and whose remaining elements are passed to that
program as separate, literal arguments. `capture_output=True` collects the program's
output instead of printing it immediately, storing it on the returned object as
`result.stdout` and `result.stderr`. `text=True` decodes that output as text (`str`)
rather than raw bytes. `result.returncode` is the number the program exited with — `0`
conventionally means success, anything else means failure. `print(result.stdout, end="")`
prints the captured output; `end=""` overrides `print`'s default behavior of adding an
extra newline, since `result.stdout` already ends with one.

Run it:

```
3 test.txt
---injection attempt---
wc: 'test.txt; echo INJECTED - arbitrary command executed': No such file or directory
```

**Walkthrough.** The first call works exactly as before — `wc` runs, counts three lines,
reports them. The second call is where the fix shows itself: the entire string
`"test.txt; echo INJECTED - arbitrary command executed"` — semicolon and all — is passed
to `wc` as a **single literal argument**, because no shell ever touched this string to
interpret its punctuation as grammar. `wc` dutifully tries to open a file with that exact
name, including the semicolon and the word "echo" as part of the filename, and reports —
correctly — that no such file exists. Nothing was executed. The semicolon lost all of its
special meaning the moment there was no shell present to assign it one.

**CS lens.** This is the identical structural fix as Lesson 4's placeholders: **separate
code (the program to run) from data (the arguments to that program) at the API level,**
rather than trying to build one string and hoping it gets parsed the way you intended.
`subprocess.run(["wc", "-l", filename])` tells the operating system, unambiguously, "run
exactly this program, with exactly these arguments" — there is no parsing step where
`filename`'s contents could be reinterpreted as something other than a single argument
value, no matter what characters it contains.

**SE lens.** Notice what did *not* change: `word_count_safe` still accomplishes exactly
the same task as `word_count`. Fixing an injection vulnerability essentially never means
"do less" — it means choosing the API that keeps code and data in genuinely separate
channels instead of the one that concatenates them. `subprocess.run` with an argument list
was available the whole time; `os.system` with string concatenation was simply the wrong
tool for input containing untrusted data.

---

## Incremental practice

Run `word_count_safe` against this short sequence, each one changing one thing:

1. `word_count_safe("test.txt")` — the plain, correct case
2. `word_count_safe("test.txt; echo hi")` — the semicolon payload from Step 2
3. `word_count_safe("test.txt && echo hi")` — the `&&` operator instead of `;`
4. `word_count_safe("$(echo test.txt)")` — command substitution syntax
5. `word_count_safe("../../etc/passwd")` — not a shell metacharacter at all, but an
   attempt to reach a file outside the intended directory (a different vulnerability,
   **path traversal**, that you should notice this fix does *not* address — parameterizing
   the command doesn't validate that the filename is one the caller should be allowed to
   read at all)

Every one of 2 through 4 fails the same way — "no such file," because none of that
punctuation was ever handed to a shell to interpret. Case 5 is worth sitting with: it
*succeeds* at opening a file, if one exists at that path and the running program has
permission to read it, because "which files may this caller ask for" is an authorization
question (Lesson 3), not an injection question, and this fix was never meant to answer it.

---

## Connect the pieces

This lesson and Lesson 4 are the same vulnerability with a different interpreter on the
receiving end, and the same fix philosophy: don't try to make untrusted data "safe" for a
string-based command — give it a channel where it's never treated as command grammar in
the first place. `subprocess.run(["wc", "-l", filename])` is doing for the shell exactly
what `cursor.execute(query, (username, password))` did for SQL: separating the fixed
structure of the operation from the variable data plugged into it.

## What breaks without this

Go back to Step 1's `word_count` and imagine the input isn't `echo` but a command that
reads a sensitive file and sends it somewhere:

```python
word_count("test.txt; cat /etc/passwd")
```

On the sandbox this lesson was tested in, that would print the contents of the system's
password-account listing — not a secret in itself on modern systems, but illustrative:
whatever `cat`, `curl`, or any other installed program could do, the injected command can
now do too, using the same permissions as the vulnerable program. If that program has
network access, the attacker can exfiltrate data. If it runs with elevated privileges, so
does the injected command. The vulnerability's severity is bounded by the running
program's permissions, not by anything in the vulnerable code itself — which is why
Lesson 18 (Privilege Escalation) will return to this exact point: what a successful
injection can do depends heavily on what the compromised process was allowed to do before
the attack ever happened.

## Recognition

```
Today: Command Injection (untrusted text parsed as shell grammar)

Also recognized in: CI/CD pipeline configuration (a build script that interpolates
a git branch name or commit message into a shell step), image-processing pipelines
that shell out to ImageMagick or ffmpeg with user-controlled filenames, any
"webhook" system that runs a user-configured command, deserialization
vulnerabilities that ultimately achieve the same goal (arbitrary code execution) by
a different route, and every "remote code execution" CVE you'll read about that
lists a command-construction function as the root cause.
```

## Definition of done

- [ ] You created `test.txt`, ran Steps 1 through 3, and reproduced the outputs shown,
      including the injected `echo` actually running in Step 2
- [ ] You ran the five-case incremental practice sequence and can explain why cases 2–4
      fail safely while case 5 succeeds — and why that's not a contradiction
- [ ] You can name the one-sentence difference between `os.system("wc -l " + filename)`
      and `subprocess.run(["wc", "-l", filename])` in terms of who parses the string and
      when
- [ ] You can explain, without notes, why command injection and SQL injection are "the
      same vulnerability" despite looking like different attacks
- [ ] `git add .` and `git commit -m "Lesson 5: command injection — shell string
      concatenation vs argument lists"` in your `security-labs/` folder

**Next:** Lesson 6 — Cross-Site Scripting (XSS), the third and final injection lesson,
where the interpreter is a web browser's HTML parser, and where — for the first time in
this module — the attacker isn't targeting the server at all, but every other user who
views a page.
