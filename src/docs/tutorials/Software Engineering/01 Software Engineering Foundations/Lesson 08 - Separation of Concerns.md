# Lesson 8: Separation of Concerns

**What you will build.** A signup function that validates a password,
normalizes a username, checks for duplicates, records the new account, and
builds a welcome message — all in one function, at first. Then a second,
completely real feature — changing an existing user's password — that
needs two of those same five jobs done again, exactly the same way. You'll
watch that reuse either force real, dangerous duplication or come for
free, purely depending on whether the first function's jobs were kept
separate or tangled together, and prove the danger with a real,
reproduced bug: the same password rule, quietly disagreeing with itself.

**What you need to know first.** Lesson 1's regression (a change in one
place breaking something elsewhere that looked unrelated) and Lesson 6's
maintainability (the cost of a future change) — this lesson's central
failure is a specific, very common way both of those show up together.

**Terms introduced in this lesson**

- **concern** — a distinct responsibility, or a distinct *reason a piece
  of code might need to change*, independent of the others: whether a
  password meets the rules is one concern; what counts as "the same"
  username is a second; whether an account already exists is a third;
  what message a user sees is a fourth. The word is defined this way —
  by reason to change, not just by topic — because it's what makes the
  next definition testable rather than a matter of taste.
- **separation of concerns** — structuring code so each distinct concern
  is handled by its own, independent part, rather than interleaved with
  the others in a single block. The principle is usually credited to
  Edsger Dijkstra, who used it in a 1974 paper to describe deliberately
  reasoning about one aspect of a program at a time. It's introduced
  formally here because Lessons 1 through 7 have all, in different ways,
  been building toward exactly this: keeping code's different jobs
  separable is one of the main tools for keeping Lesson 6's
  maintainability high and Lesson 1's regressions rare.

**Objects and methods used.** None new — this lesson's code uses only
already-assumed syntax: functions, `set` membership, string methods
(`.strip()`, `.lower()`), and tuple returns.

No pipeline diagram yet — this curriculum has not established one.

---

## Concept Unit: One Function, Four Different Jobs

### The Problem

Write a signup function: given a username, a password, and the set of
usernames already registered, validate the password, normalize the
username the way Lesson 2's exercise did, reject duplicates, register the
new account, and return a result.

### The Code, Run for Real

```python
def process_signup(username, password, existing_usernames):
    if len(password) < 8:
        return False, "Password too short"
    normalized = username.strip().lower()
    if normalized in existing_usernames:
        return False, "Username taken"
    existing_usernames.add(normalized)
    return True, "Welcome, " + username + "!"
```

Check it against three real cases — a fresh signup, a duplicate (same
username, different casing and spacing), and an invalid password:

```python
existing = {"alice"}
print(process_signup("Bob", "hunter22", existing))
print(process_signup(" Bob ", "hunter22", existing))
print(process_signup("Carol", "short", existing))
```

Running it:

```text
$ python signup.py
(True, 'Welcome, Bob!')
(False, 'Username taken')
(False, 'Password too short')
```

All three correct: `"Bob"` registers; `" Bob "` collides with the
now-registered `"bob"` once normalized; `"Carol"`'s password is rejected
before anything else about her signup is even checked.

### The Concept

Four separate jobs are visible inside this one function, each answerable
by a different question, about a different thing: *is this password
acceptable* (validation); *what does "the same username" actually mean*
(normalization); *has this account already been claimed* (a check against
stored state); *what does the user see when this succeeds* (a message).
None of those four questions depends on the answer to any of the others —
whether a password is long enough has nothing to do with what a welcome
message says. Right now, all four live inside one function body, in a
fixed order, sharing local variables, with nothing marking where one job's
logic ends and the next one's begins except which line happens to come
next.

### CS Lens

This is the same shape as Lesson 2's `is_username_available`, one level
up: there, a single function answered one question cleanly. Here, one
function is answering four different questions at once — each one
individually as simple as Lesson 2's, but now stacked inside a shared
body instead of kept apart.

### SE Lens

Nothing about this function is wrong yet — it's correct, and by Lesson
6's standard it's even reasonably reliable (it already fails cleanly on
bad passwords and duplicates rather than crashing). The cost of bundling
four concerns into one function doesn't show up by reading this function
alone. It shows up the moment something else in the system needs *some*,
but not *all*, of what this function does — which is exactly what the
next unit introduces.

---

## Concept Unit: Two Concerns, Needed Again, Without the Other Two

### The Problem

A second, real feature: letting an existing user change their password.
It needs the exact same password rule `process_signup` already enforces,
and the exact same username normalization — but it must *not* check
whether the username is already taken (of course it is; they're changing
their own password) and must *not* add anything to `existing_usernames`
(they're already in it).

### The Tangled Version's Only Real Option

Because validation and normalization live only inside `process_signup`'s
own body, with no way to reach just those two parts, the honest options
are either awkwardly repurposing a function that does unrelated things,
or writing the two rules again:

```python
def process_password_change(username, new_password, existing_usernames):
    if len(new_password) < 8:
        return False, "Password too short"
    normalized = username.strip().lower()
    return True, "Password updated for " + username
```

This runs, and it's correct today — the password rule here,
`len(new_password) < 8`, is a second, independent copy of the identical
rule already sitting inside `process_signup`.

### The Real Bug This Causes

A genuine new requirement arrives: passwords must now be at least ten
characters, not eight. Update the rule — but only where the change was
actually requested, inside `process_signup`, the way a real, rushed fix
often goes:

```python
def process_signup(username, password, existing_usernames):
    if len(password) < 10:                          # ← changed
        return False, "Password too short"
    normalized = username.strip().lower()
    if normalized in existing_usernames:
        return False, "Username taken"
    existing_usernames.add(normalized)
    return True, "Welcome, " + username + "!"
```

`process_password_change` is untouched — nobody edited it, because
nothing about editing `process_signup` pointed at it. Run both against
the identical eight-character password that used to be valid everywhere:

```python
existing = {"bob"}
print("signup:", process_signup("Dave", "hunter22", set()))
print("password change:", process_password_change("Bob", "hunter22", existing))
```

Here's what actually comes back:

```text
$ python signup.py
signup: (False, 'Password too short')
password change: (True, 'Password updated for Bob')
```

The same eight-character password, against the same intended rule, is
rejected for a new signup and accepted for a password change — a live,
real disagreement, in production, about what a valid password even is.
Nothing crashed. Nothing errored. The rule simply exists in two places
now, and only one of them got the memo.

### The Separated Version, Given the Same Requirement

Split each concern into its own function first:

```python
def is_password_valid(password):
    return len(password) >= 10

def normalize_username(username):
    return username.strip().lower()

def is_username_taken(normalized_username, existing_usernames):
    return normalized_username in existing_usernames

def welcome_message(username):
    return "Welcome, " + username + "!"
```

Both features are built by calling into these, never repeating their
logic:

```python
def process_signup(username, password, existing_usernames):
    if not is_password_valid(password):
        return False, "Password too short"
    normalized = normalize_username(username)
    if is_username_taken(normalized, existing_usernames):
        return False, "Username taken"
    existing_usernames.add(normalized)
    return True, welcome_message(username)

def process_password_change(username, new_password, existing_usernames):
    if not is_password_valid(new_password):
        return False, "Password too short"
    normalize_username(username)
    return True, "Password updated for " + username
```

Run the identical eight-character-password check against both:

```text
$ python signup_separated.py
signup: (False, 'Password too short')
password change: (False, 'Password too short')
```

Both agree — because both call the exact same `is_password_valid`, and
the ten-character rule only ever exists in that one place. There was no
second copy to forget.

### Mechanical Walkthrough

- `is_password_valid(password)` — first appearance as its own named
  function; mechanically identical to the inline `len(password) < 8`
  check from the previous unit, just extracted and named — the return
  value is now `True`/`False` directly rather than paired with a message.
- `process_signup` and `process_password_change` calling
  `is_password_valid` and `normalize_username` — ordinary function calls,
  already-assumed syntax; the new idea isn't the call syntax, it's that
  two different features now share one real implementation of each rule
  rather than each carrying their own copy.

### CS Lens

This is the same failure family as Lesson 1's regression, at one remove:
there, one function's behavior silently diverged from what it used to
guarantee. Here, *two functions that were supposed to agree* silently
diverged from each other, because the thing they were supposed to agree
about was never a single, shared piece of code — it was two separate,
independently-editable copies of the same intent.

### SE Lens

The realistic alternative to extracting `is_password_valid` isn't "always
extract every single line into its own function" — a one-line check used
in exactly one place, never needed anywhere else, gains nothing from
being pulled out on principle, and Lesson 7 already showed that adding
structure has a real cost too, not just a benefit. The concrete signal
that earned the extraction here is specific: a second real feature
needed the *identical* rule, which is exactly the situation where keeping
concerns separate stops being tidiness and starts being the only thing
standing between one rule and two rules that can quietly stop agreeing.

---

## Concept Unit: Why This Split, Specifically

### The Problem

The previous unit split `process_signup` into four functions along a
particular seam — validation, normalization, a taken-check, a message.
Was that the only way to have split it?

### The Concept

No — the four functions could have been split differently, or fewer, or
more. What made this particular split useful wasn't the number of
functions; it was that each one lined up with exactly one of the four
independent *reasons this code might need to change*, as this lesson's
opening unit named them. A password-length rule changing has nothing to
do with what a welcome message says — so a change to one now touches
`is_password_valid` alone, and nothing about `welcome_message`,
`normalize_username`, or `is_username_taken` even has to be read, let
alone understood, to make it safely. That's the actual test **separation
of concerns** is asking: not "is this code split into small pieces," but
"does each independent reason to change land in exactly one place." A
codebase can be full of small functions and still fail this test badly,
if those functions are split along the wrong lines — by coincidence of
code length, say, rather than by what actually varies independently.

### CS Lens

The identical principle, at larger scale, is why network software is
built in layers — routing an internet packet is a separate concern from
encrypting its contents, which is separate again from the specific
application using it, and a change to any one layer's algorithm doesn't
require touching the others. It's why a well-built application keeps how
data is displayed separate from how it's stored (a distinction commonly
named "model" and "view"). It's even why a building's plumbing and
electrical systems are designed and worked on separately, by different
trades, despite running through the same walls — each is a genuinely
independent concern, with its own, different reasons to change, and
tangling them would make a plumbing fix risk an electrical mistake for no
reason connected to the actual plumbing work being done.

### SE Lens

Splitting along the wrong seam is a real, common failure, not just a
hypothetical one — a codebase can end up with a function called
`validate_and_save_and_notify` that's technically "separated" from the
rest of the system while still tangling three unrelated concerns
internally, exactly like this lesson's original `process_signup` did. The
question this lesson leaves open on purpose — *how do you tell, in
general, whether a given split lines up with real, independent reasons to
change, versus just looking like separate pieces* — is a large enough
question that this curriculum gives it its own dedicated pair of ideas,
cohesion and coupling, immediately next.

---

## Connect the Pieces

One signup function, split once, tested under real reuse pressure:

1. **Four concerns, one function** — validation, normalization, a
   duplicate check, and a message, all inside `process_signup`, each
   independently reasonable, none of them actually independent *in the
   code*.
2. **A second feature needs two of the four** — `process_password_change`
   either duplicates validation and normalization, or has nothing to call
   into instead.
3. **The duplication drifts** — updating the password rule in
   `process_signup` alone leaves `process_password_change` enforcing the
   old rule, reproduced for real: the same eight-character password
   rejected in one flow, accepted in the other.
4. **Separated, it can't drift** — both flows calling the same
   `is_password_valid` means updating the rule once updates it
   everywhere it's used, with no second copy left behind to disagree.

## What Breaks Without This

Leave the tangled version's duplicated password rule exactly as this
lesson found it, disagreeing between signup and password-change, and ship
it. No crash, no error — both functions run correctly by their own
internal logic; they simply enforce two different real security policies
under one name. Months later, a security review asks "what's the minimum
password length in this system," and the honest answer is "it depends
which code path you're reading" — which is not a question a maintainable
system should ever have two different true answers to. Fixing it at that
point means finding every silent copy of the rule across the whole
codebase, not just the one that happened to prompt the question.

## Exercises

1. Add a third feature to the separated version: an admin tool that
   checks whether a username is available without registering it (reusing
   Lesson 2's original question). Write it using only
   `normalize_username` and `is_username_taken` — no new duplication of
   either.
2. Look back at Lesson 6's `safe_average_tangled`. Name which concerns are
   tangled together in it, using this lesson's definition of "concern" —
   a distinct reason the code might need to change.
3. Take any function you've written for this curriculum so far and ask,
   honestly: does it answer more than one independent question? If so,
   name the questions; you don't have to split the function to complete
   this exercise, only to correctly identify the concerns.

## Definition of Done

- [ ] You've reproduced the real password-rule disagreement between the
      two tangled functions, and confirmed the separated version doesn't
      have it.
- [ ] You can state separation of concerns using this lesson's own
      definition of "concern" (a distinct reason to change), not a vaguer
      one.
- [ ] You've completed all three exercises.
- [ ] Commit the separated version (`is_password_valid`,
      `normalize_username`, `is_username_taken`, `welcome_message`,
      `process_signup`, `process_password_change`). Commit message should
      explain *why*: for example, `Lesson 8 — signup logic split by
      concern after duplicated password validation drifted out of sync
      across two features.`
