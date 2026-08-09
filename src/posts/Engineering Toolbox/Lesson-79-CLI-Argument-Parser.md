# Lesson 79: Building the Thing `argparse` Is

**What you will build:** an `ArgumentParser` class supporting
positional arguments, `--flag value` options, boolean `--flag`
switches, required options, and auto-generated usage/error messages —
a real, working, order-independent command-line parser, from nothing
but `sys.argv`. The working feature is a CLI tool with proper argument
handling. The transferable problem: `sys.argv` is just a flat list of
strings with no structure at all — every rule a CLI tool seems to
"just know" (flags can appear in any order, `--loud` doesn't need a
value but `--times` does, a missing required argument should fail with
a clear message, not a crash three lines later) is something *someone
has to implement*, and this lesson is that implementation, not a
description of it.

**What you need to know first:** Lesson 1 (mini shell) — that lesson's
own argv parsing was the first time this curriculum touched command-
line input at all; this lesson revisits that exact problem with far
more rigor. Lesson 56 (config-file parser) — structurally, parsing
`--times 3` out of a token stream is close cousin to parsing `key=value`
pairs out of a config file; both are about turning an unstructured
stream of text into a structured result the rest of a program can
trust.

---

## Concept Unit: The Problem — `sys.argv` Has No Structure

### The Problem

Everything typed after a script's name on the command line arrives as
one flat list of strings, in the exact order typed, with absolutely no
indication of what's a command, what's a value, or what's a flag —
that meaning has to be imposed by code, and nothing does that
automatically.

### The New Code

```python
import sys
print("raw argv:", sys.argv)
```

### Run It

```
$ python3 lab1_raw_argv.py greet Alice --loud --times 3
raw argv: ['lab1_raw_argv.py', 'greet', 'Alice', '--loud', '--times', '3']
```

Six strings, in one list — `sys.argv[0]` is always the script's own
name, already established from Lesson 1; everything after it,
`sys.argv[1:]`, is what was actually typed, completely unstructured.

### CS Lens

Raw, unstructured input needing a deliberate parsing step before a
program can trust anything about its shape is a pattern that shows up
everywhere text meets a program's logic. Also recognized in: Lesson 55's
JSON parser turning a raw string into nested Python objects, Lesson
56's own config-file parser, a web server turning a raw HTTP request
line into a method/path/headers structure, a shell (Lesson 1) turning
a typed command line into a program name plus its own arguments.

---

## Concept Unit: Hand-Rolled Parsing Breaks on Order

### The Problem

It's tempting to just index directly into `sys.argv` — `args[0]` is
the command, `args[1]` is the name, and so on. This works for exactly
one specific argument order, and silently produces garbage — not an
error — the moment a user (reasonably) types flags in a different
order than expected.

### The New Code

```python
import sys

args = sys.argv[1:]
command = args[0]           # assumes it's always first -- breaks if a flag comes first
name = args[1]               # assumes it's always second
loud = "--loud" in args
times = 1
if "--times" in args:
    idx = args.index("--times")
    times = int(args[idx + 1])   # assumes a value always follows -- crashes if not

print(f"command={command}, name={name}, loud={loud}, times={times}")
```

### Run It

```
$ python3 lab2_manual_mess.py greet Alice --loud --times 3
command=greet, name=Alice, loud=True, times=3
$ python3 lab2_manual_mess.py --loud greet Alice
command=--loud, name=greet, loud=True, times=1
```

The second call is a completely reasonable thing for someone to type —
`--loud` first, then the positional arguments — and it silently
produces `command='--loud'`, a nonsense value that would go on to
cause confusing failures somewhere downstream, with no error anywhere
near where the actual problem was. Discarded now; the rest of this
lesson builds a parser that identifies each token by *what it looks
like* (starts with `--`, or doesn't), not by *what position it happens
to occupy*.

### CS Lens

Assuming input arrives in one specific, fixed order — rather than
identifying each piece by its own shape or marker — is a recurring,
easy mistake. Also recognized in: a function assuming keyword
arguments are always passed in declaration order (Python explicitly
allows any order, by design), a CSV parser assuming columns never get
reordered, an HTTP client assuming response headers always arrive in a
specific sequence when the protocol makes no such guarantee.

---

## Concept Unit: Positional Arguments and a Result Object

### The Problem

Before handling flags at all, even the simplest case — plain
positional arguments, no flags — deserves a real, reusable mechanism:
declare what arguments are expected, then parse a token list against
that declaration, producing a clean, attribute-accessible result
rather than a loose pile of local variables.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition. (Python's real `argparse` module exists and does this
  professionally; this lesson deliberately does not import or peek at
  its source, building an equivalent from first principles instead.)
- **Files affected:** `argparser.py` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** none beyond the standard library.

### The New Code

```python
class Namespace:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

    def __repr__(self):
        fields = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"Namespace({fields})"


class ArgumentParser:
    def __init__(self, prog="prog"):
        self.prog = prog
        self.positionals = []

    def add_argument(self, name):
        self.positionals.append(name)

    def parse_args(self, args):
        if len(args) < len(self.positionals):
            missing = self.positionals[len(args):]
            raise ValueError(f"the following arguments are required: {', '.join(missing)}")
        result = {}
        for name, value in zip(self.positionals, args):
            result[name] = value
        return Namespace(**result)
```

### Run It

```python
>>> from argparser import ArgumentParser
>>> parser = ArgumentParser(prog="greet")
>>> parser.add_argument("command")
>>> parser.add_argument("name")
>>> ns = parser.parse_args(["greet", "Alice"])
>>> ns
Namespace(command='greet', name='Alice')
>>> ns.command, ns.name
('greet', 'Alice')
>>> parser.parse_args(["greet"])
Traceback (most recent call last):
  ...
ValueError: the following arguments are required: name
```

### Mechanical Walkthrough

- `class Namespace: def __init__(self, **kwargs): self.__dict__.update(kwargs)`
  — **first appearance of `**kwargs` used to dynamically build an
  object's attributes.** `self.__dict__` is the actual dictionary
  every Python object stores its own attributes in — already existing,
  just not usually touched directly; `.update(kwargs)` inserts every
  keyword argument passed to `Namespace(...)` as a real attribute,
  without needing to write out `self.command = command`,
  `self.name = name`, and so on by hand for every possible argument
  name a user of this parser might declare. This is what lets `ns.name`
  and `ns.command` both work as attribute access, for argument names
  that `Namespace` itself has no advance knowledge of.
- `def add_argument(self, name): self.positionals.append(name)` — a
  declaration step, separate from parsing — building up a list of
  *what's expected*, before any actual command-line input is examined.
- `if len(args) < len(self.positionals): ... raise ValueError(...)` —
  the first real validation this lesson builds: not enough arguments
  were provided to satisfy every declared positional — caught and
  reported *before* attempting to build a result, rather than letting
  a later `zip` silently produce a Namespace missing some expected
  attributes.
- `for name, value in zip(self.positionals, args): result[name] = value`
  — reappearing `zip`'s pairing behavior (already established from
  earlier lessons), matching each declared name to the token in the
  same position — with the earlier length check already guaranteeing
  there are at least enough tokens for every positional to get one.
- `return Namespace(**result)` — **first appearance of `**` used to
  *unpack* a dict into keyword arguments**, the mirror image of
  `Namespace.__init__`'s `**kwargs` gathering them back up: `result`
  might be `{"command": "greet", "name": "Alice"}`; `Namespace(**result)`
  calls `Namespace(command="greet", name="Alice")` — turning a plain
  dict into named attribute access.

### CS Lens

Separating "declare what's expected" from "parse actual input against
that declaration" — two distinct steps, not intermingled — is the same
shape as a database schema (declared once) versus inserting actual
rows (validated against it repeatedly), or a function's own signature
(declared parameters) versus each individual call site. This
separation is what lets the *same* parser object be reused to parse
many different actual command lines, or across a program's lifetime.

---

## Concept Unit: Optional Flags — `--flag value` and `--flag` Alone

### The Problem

Real command-line tools need more than fixed-position arguments: flags
that can appear anywhere, in any order, some taking a value
(`--times 3`) and some not (`--loud`) — exactly the two cases the
hand-rolled version got wrong.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `argparser.py`.
- **Change type:** modify — `add_argument` and `parse_args` both
  rewritten to handle two categories of argument instead of one.
- **Location:** replacing both methods from the previous unit.
- **Dependencies:** `Namespace`, unchanged.

### The New Code

```python
    def __init__(self, prog="prog"):
        self.prog = prog
        self.positionals = []
        self.optionals = {}   # flag string -> spec dict

    def add_argument(self, name, action="store", default=None):
        if name.startswith("--"):
            dest = name[2:].replace("-", "_")
            self.optionals[name] = {"dest": dest, "action": action, "default": default}
        else:
            self.positionals.append(name)

    def parse_args(self, args):
        result = {}
        for spec in self.optionals.values():
            result[spec["dest"]] = False if spec["action"] == "store_true" else spec["default"]

        positional_values = []
        i = 0
        while i < len(args):
            token = args[i]
            if token.startswith("--"):
                if token not in self.optionals:
                    raise ValueError(f"unrecognized argument: {token}")
                spec = self.optionals[token]
                if spec["action"] == "store_true":
                    result[spec["dest"]] = True
                    i += 1
                else:
                    if i + 1 >= len(args):
                        raise ValueError(f"argument {token}: expected one value")
                    result[spec["dest"]] = args[i + 1]
                    i += 2
            else:
                positional_values.append(token)
                i += 1

        if len(positional_values) < len(self.positionals):
            missing = self.positionals[len(positional_values):]
            raise ValueError(f"the following arguments are required: {', '.join(missing)}")

        for name, value in zip(self.positionals, positional_values):
            result[name] = value

        return Namespace(**result)
```

### Run It

```python
>>> parser = ArgumentParser(prog="greet")
>>> parser.add_argument("command")
>>> parser.add_argument("name")
>>> parser.add_argument("--loud", action="store_true")
>>> parser.add_argument("--times", default="1")
>>> parser.parse_args(["greet", "Alice", "--loud", "--times", "3"])
Namespace(loud=True, times='3', command='greet', name='Alice')
>>> parser.parse_args(["--loud", "greet", "Alice"])
Namespace(loud=True, times='1', command='greet', name='Alice')
>>> parser.parse_args(["greet", "Alice"])
Namespace(loud=False, times='1', command='greet', name='Alice')
```

The second call — `--loud` typed *before* the positionals — is the
exact input that produced silent garbage in the hand-rolled version.
Here, it parses correctly: `command='greet'`, `name='Alice'`,
`loud=True`, confirming the order-independence this whole unit exists
to provide.

### Mechanical Walkthrough

- `if name.startswith("--"): dest = name[2:].replace("-", "_")` —
  **first appearance of a "dest" name derived from a flag string.**
  `--times` becomes the attribute name `times`; a flag like
  `--dry-run` would become `dry_run` (hyphens aren't legal in Python
  attribute names, so they're converted to underscores) — this is
  exactly the same translation real `argparse` performs, done here
  explicitly instead of hidden inside a library.
- `for spec in self.optionals.values(): result[spec["dest"]] = False if spec["action"] == "store_true" else spec["default"]`
  — **first appearance of pre-filling defaults before parsing
  begins.** Every declared optional gets a value in `result`
  immediately — `False` for a `store_true` flag not yet seen, or its
  declared `default` otherwise — so that a flag genuinely absent from
  the actual command line still ends up with a sensible value in the
  final `Namespace`, rather than simply missing.
- `while i < len(args): token = args[i]` — **first appearance of a
  manual index-based walk through the argument list, instead of a
  plain `for` loop.** A `for token in args:` loop can't skip ahead —
  and consuming a flag's *value* (the token right after `--times`)
  means the loop needs to jump forward by two positions in one
  iteration, not one — exactly what an explicit `i` variable, advanced
  by hand, allows and a plain `for` loop doesn't.
- `if token.startswith("--"):` — **the actual dispatch point.**
  Whether a token is treated as a flag or a positional value is
  decided purely by *what the token itself looks like* — starting with
  `--` — never by its position in the list. This single check is the
  entire fix for the hand-rolled version's order-dependence.
- `if spec["action"] == "store_true": result[spec["dest"]] = True; i += 1`
  — a boolean flag consumes exactly one token (itself) and advances
  the index by one.
- `else: ... result[spec["dest"]] = args[i + 1]; i += 2` — a
  value-taking flag consumes *two* tokens (the flag and its value) and
  advances the index by two — this is the deliberate difference in
  step size that a plain `for` loop couldn't express.
- `if i + 1 >= len(args): raise ValueError(...)` — checked *before*
  accessing `args[i + 1]` — catches a flag that expected a value but
  was the last token typed, with a clear message, instead of letting
  Python raise its own less-informative `IndexError` from the access
  itself.
- `else: positional_values.append(token); i += 1` — anything not
  starting with `--` is treated as a positional value, collected in
  order, regardless of *where* in the overall argument list it
  appeared relative to any flags.

### CS Lens

Deciding how to interpret a token based on its own shape (does it
start with `--`?) rather than its position, with a manually-advanced
index that can skip variable amounts depending on what was just
consumed, is the same kind of **tokenizing with lookahead** used in
real parsers and lexers — including, structurally, Lesson 58's
arithmetic expression parser, which also needed to sometimes consume
more than one token per step depending on what it had just seen.

---

## Concept Unit: Required Flags and Real Usage/Error Output

### The Problem

Some optional-looking flags (syntactically starting with `--`) are
actually required for a program to run meaningfully — and when
something's genuinely missing or unrecognized, a real CLI tool doesn't
raise a Python traceback at the user; it prints a clear usage message
and exits with a specific, checkable status code.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `argparser.py`.
- **Change type:** modify — `add_argument` gains `required` and `help`
  parameters; `error` and `format_usage` are added; every `raise
  ValueError` from the previous unit becomes a call to `self.error`.
- **Location:** throughout `ArgumentParser`.
- **Dependencies:** `sys` (for `sys.exit` and `sys.argv`).

### The New Code

```python
import sys

    def add_argument(self, name, action="store", default=None, required=False, help=None):
        if name.startswith("--"):
            dest = name[2:].replace("-", "_")
            self.optionals[name] = {
                "dest": dest, "action": action, "default": default,
                "required": required, "help": help,
            }
        else:
            self.positionals.append({"name": name, "help": help})

    def format_usage(self):
        parts = [self.prog]
        for flag, spec in self.optionals.items():
            token = flag if spec["action"] == "store_true" else f"{flag} {spec['dest'].upper()}"
            parts.append(token if spec["required"] else f"[{token}]")
        for pos in self.positionals:
            parts.append(pos["name"])
        return "usage: " + " ".join(parts)

    def error(self, message):
        sys.stderr.write(self.format_usage() + "\n")
        sys.stderr.write(f"{self.prog}: error: {message}\n")
        sys.exit(2)

    def parse_args(self, args=None):
        if args is None:
            args = sys.argv[1:]
        # ... same token-walking loop as before, but every
        # `raise ValueError(...)` becomes `self.error(...)` instead ...
        missing_required = [
            flag for flag, spec in self.optionals.items()
            if spec["required"] and result[spec["dest"]] is None
        ]
        if missing_required:
            self.error(f"the following arguments are required: {', '.join(missing_required)}")
        return Namespace(**result)
```

### The Real CLI Script

```python
from argparser import ArgumentParser

parser = ArgumentParser(prog="greet")
parser.add_argument("name", help="who to greet")
parser.add_argument("--loud", action="store_true", help="shout the greeting")
parser.add_argument("--times", default="1", help="how many times to repeat")
parser.add_argument("--from", required=True, help="who the greeting is from")

args = parser.parse_args()
greeting = f"Hello, {args.name}! From: {getattr(args, 'from')}"
if args.loud:
    greeting = greeting.upper()
for _ in range(int(args.times)):
    print(greeting)
```

### Run It

```
$ python3 greet_cli.py Alice --loud --times 2 --from Bob
HELLO, ALICE! FROM: BOB
HELLO, ALICE! FROM: BOB

$ python3 greet_cli.py Alice; echo "exit code: $?"
usage: greet [--loud] [--times TIMES] --from FROM name
greet: error: the following arguments are required: --from
exit code: 2

$ python3 greet_cli.py Alice --from Bob --shout; echo "exit code: $?"
usage: greet [--loud] [--times TIMES] --from FROM name
greet: error: unrecognized argument: --shout
exit code: 2
```

Three real runs of a real script, invoked exactly the way a user
would: one succeeds; two fail with a clear, correctly formatted usage
line, a specific error message, and exit code `2` — matching, in
substance, exactly how Python's real `argparse` behaves on the same
kinds of mistakes.

### Mechanical Walkthrough

- `def parse_args(self, args=None): if args is None: args = sys.argv[1:]`
  — **first appearance of `parse_args` reading real command-line
  input by default.** Every earlier unit's tests passed an explicit
  list (`parser.parse_args(["greet", "Alice"])`) for controlled,
  repeatable testing — the real CLI script above calls
  `parser.parse_args()` with no arguments at all, which now correctly
  falls back to the actual `sys.argv[1:]` from the real invocation.
- `getattr(args, 'from')` — **first appearance of `getattr` used to
  access an attribute whose name isn't a valid Python identifier as a
  literal.** `from` is a reserved keyword in Python — `args.from`
  would be a syntax error — so accessing it requires `getattr(args,
  "from")`, the string-based equivalent of attribute access. This is
  a genuine, real limitation worth naming, not hidden: real
  `argparse` has this exact same restriction, for this exact same
  reason.
- `def error(self, message): sys.stderr.write(...); sys.exit(2)` —
  **first appearance of `sys.stderr` and a specific, deliberate exit
  code.** Writing to `sys.stderr` (not `print`, which goes to
  `sys.stdout`) is itself a real convention: error output and normal
  output are two separate streams, so a shell script or another
  program invoking this one can distinguish "the actual output" from
  "something went wrong," even if both happen to be visible in the
  same terminal. `sys.exit(2)` — not `sys.exit(1)` or an unhandled
  exception — is the specific, standard Unix convention real
  `argparse` also uses for "the command-line arguments themselves were
  invalid," checkable programmatically by anything that ran this
  script (`echo "exit code: $?"`, shown above, is exactly how a shell
  reads that back).
- `missing_required = [flag for flag, spec in self.optionals.items() if spec["required"] and result[spec["dest"]] is None]`
  — **first appearance of checking required *optionals*** (as opposed
  to required positionals, already handled in the previous unit): a
  flag can be syntactically optional-looking (`--from`) while still
  being semantically mandatory — checked only *after* the full parse,
  once it's known for certain whether it was ever actually supplied.
- `format_usage` — builds a usage string by walking the same
  `self.optionals` and `self.positionals` structures already used for
  parsing — required flags shown bare, optional ones wrapped in `[...]`
  — the exact bracket convention real `argparse`, and most Unix CLI
  tools generally, use to signal optionality directly in a usage
  string.

### CS Lens

Distinguishing "this input is malformed" (worth a clear message and a
specific, checkable exit status) from "something in the program
itself broke" (worth a full traceback) is a genuine, deliberate
design decision in real command-line tools, not a cosmetic one. Also
recognized in: HTTP status codes distinguishing 4xx (the client's
request was invalid) from 5xx (the server itself failed), a compiler
reporting a syntax error with a specific line and message rather than
crashing with an internal exception, a shell's own convention (exit
code `0` for success, non-zero for specific categories of failure)
that this exact `sys.exit(2)` participates in.

---

## Connect the Pieces

```python
from argparser import ArgumentParser

parser = ArgumentParser(prog="deploy")
parser.add_argument("environment", help="target environment (staging/prod)")
parser.add_argument("--dry-run", action="store_true", help="show what would happen, don't actually deploy")
parser.add_argument("--version", required=True, help="version tag to deploy")
parser.add_argument("--replicas", default="3", help="number of replicas")

args = parser.parse_args()
action = "Would deploy" if args.dry_run else "Deploying"
print(f"{action} version {args.version} to {args.environment} with {args.replicas} replicas")
```

```
$ python3 deploy.py prod --version 2.4.1 --dry-run
Would deploy version 2.4.1 to prod with 3 replicas

$ python3 deploy.py --version 2.4.1 --replicas 10 staging
Deploying version 2.4.1 to staging with 10 replicas
```

Every concept from this lesson in one realistic script: a positional
argument (`environment`), a required flag (`--version`), a boolean
switch (`--dry-run`), a flag with a default (`--replicas`), and —
worth noticing in the second call — the positional argument
(`staging`) typed *last*, after every flag, and still parsed correctly
into `args.environment`, because nothing about this parser ever
depended on argument position for anything except positionals matching
other positionals, in relative order, among themselves.

## What Breaks Without This

Already shown directly, twice, in this lesson's second unit: the
hand-rolled `args[0]`/`args[1]`-indexing version silently assigns
`command = '--loud'` the moment a flag is typed before the positional
arguments — a real, wrong result, with no error anywhere. That failure
mode — not a crash, a *plausible-looking wrong answer* — is the
specific danger a real parser exists to eliminate, and it's worth
re-running that exact broken script one more time, side by side with
`ArgumentParser` handling the identical input correctly, as concrete
proof the fix isn't cosmetic.

## Exercises

- Add short-flag support (`-l` as a synonym for `--loud`) — research
  how real `argparse` lets `add_argument` accept multiple flag strings
  for the same destination.
- Add a `type` parameter to `add_argument` (e.g. `type=int`) so
  `--times` can be automatically converted from a string to an integer
  during parsing, rather than requiring `int(args.times)` in the
  calling script.
- Add a `--help`/`-h` flag, handled automatically by every
  `ArgumentParser`, that prints `format_usage()` plus each argument's
  `help` text, then exits with code `0` (success, not an error) —
  research why real CLI tools treat `--help` as a success case, not a
  failure.
- Add support for a flag that can be repeated (`--tag foo --tag bar`
  collecting `["foo", "bar"]` in a list) — research `argparse`'s own
  `action="append"` for the real equivalent.

## Definition of Done

- [ ] `ArgumentParser` implemented and run, matching every trace
      above, including the order-independence check
      (`--loud` before positionals parsing correctly).
- [ ] A real script (not just inline test calls) run from an actual
      terminal, invoking `parser.parse_args()` with no arguments and
      reading genuine `sys.argv`.
- [ ] Both real failure cases reproduced on your own machine: a missing
      required flag and an unrecognized flag, each producing the
      correct usage line, error message, and exit code `2` — confirmed
      with `echo $?` (or the equivalent on your platform) after each.
- [ ] Can explain out loud, without looking at the code, why the
      token-walking loop needs a manually advanced index instead of a
      plain `for token in args:` loop.
- [ ] Committed, with a message explaining *why* — e.g. `"CLI argument
      parser from scratch: order-independent flag parsing, required
      options, and real usage/error output with proper exit codes"` —
      not `"add argparser.py"`.
