# Python Tool Database — LAB 00 — Why Software is Hard and What XP Does About It

**Prerequisites:** None. This is the first lesson in the series.

**What this lab adds:**
- An understanding of why software projects fail even when smart people work on them
- The four values of the Agile Manifesto — the philosophical foundation for everything that follows
- A personal notes document that you will keep and add to throughout the series

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You are building a tool database for a machine shop. You spend two weeks building exactly what was asked for. The machinist looks at it and says "this isn't what I meant." Who is at fault?
> 2. What is the difference between a plan that accounts for change and a plan that tries to prevent it?
> 3. If you had to describe the software you are about to build to someone who has never used Mastercam, what would be the hardest part to explain?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have:

1. A running Python installation confirmed working in your terminal
2. A `notes.md` file in your project folder where you capture your own words for each key concept — this file grows with every lesson
3. A clear answer to the question: "Why does software need a working method at all?"

There is no application code in this lesson. The entire lesson is about how we think and work before we write a single function. Every lab after this one will reference the ideas introduced here.

---

## Part 1 — The Problem That Software Development Is Solving

### Concept: Requirements Change

**What it is:** A requirement is a statement of what the software should do. Requirements change — not because the people asking are unreasonable, but because building software reveals understanding that was not possible before the software existed.

**The problem before:**

Imagine you are a machinist. You have been asked to describe, before anything is built, exactly what a perfect tool database application looks like. You have never used one. You try:

> "I want to be able to look up tools by diameter and see their feeds and speeds."

That sounds clear. A developer builds it. You use it. You immediately notice:

> "I also need to see the holder it goes in, because the same tool in a different holder has different stickout, which changes the feed rate."
>
> "And I need to be able to group tools by job, because some tools are only for certain parts."
>
> "And I need to import them from Mastercam, not enter them by hand."

None of these were in the original requirement. Not because you were careless — because you did not know you needed them until you saw what it looked like without them. **This is normal. It is not a failure. It is how human understanding works.**

**The solution:** Build a process that expects requirements to change, handles change cheaply, and treats each new understanding as information rather than a problem.

**What it hides:** The need to predict the future. A process that handles change well means you never need to know exactly where you are going before you start — you navigate as you go, with frequent checks.

**Canonical example (General):**
You are driving from your house to a new restaurant you have never been to. You could:
- Plan every turn in advance and refuse to deviate (plan-heavy, fails at first road closure)
- Look at a map, drive toward the destination, and adjust when you hit traffic (adaptive)

Software development is the second kind of problem. The destination changes slightly as you get closer to it.

**Project application:** The tool database you are building will change as you build it. The machinist will use it, then ask for new fields, new filters, new integrations. The architecture we chose (Hexagonal, introduced in Lab 00f) is specifically designed so that changes stay cheap. Every decision in this series is made with "how hard will this be to change?" as one of the criteria.

**You will see this again in:**
- Every job that involves building software for someone else
- Every time you read about "Agile" in a job listing — this is why it exists
- Product management as a discipline — the entire role is about managing changing requirements
- Your own projects when you realize week 3 that you want something different than you planned in week 1

**Watch for:** The temptation to say "just tell me exactly what you want and I'll build it." You will never get the full answer up front. The answer develops as the software develops.

---

### REFLECT AND WRITE

Open your `notes.md` file (create it if it does not exist yet at `python-tooldb/notes.md`).

Write in your own words:

> "Requirements change because..."

Do not copy the text above. Force yourself to paraphrase it. One to three sentences. If you cannot paraphrase it, re-read the section.

**You should be able to write:** something about people not knowing what they need until they see it working, or something about understanding developing through use. If your answer is "because people don't think carefully," re-read — that is the wrong diagnosis.

---

## Part 2 — Why Having No Process Makes It Worse

### Concept: The Big Ball of Mud

**What it is:** The architecture pattern that results from no architecture decisions — code that calls other code freely, with no rules about what is allowed to depend on what. The most common pattern in real software. Named by Brian Foote and Joseph Yoder.

**The problem before:**

```
# No architecture. Six months in. A real codebase that has grown without rules.

def save_tool(name, diameter):
    conn = sqlite3.connect("tools.db")   # database connection here...
    if name == "":
        show_error_popup("Name is required") # ...and UI code here...
    result = conn.execute(...)
    send_email_notification(result)       # ...and email here...
    update_mastercam_file(result)         # ...and file I/O here
```

This function saves a tool, validates input, shows a UI popup, sends an email, and updates a Mastercam file. It has five reasons to change. Changing the email provider means editing the same function as changing the validation rules. Testing the save logic requires a running database, a running UI, and an email server.

This is not a hypothetical. This is what almost every codebase looks like after six months of "just getting things working."

**The solution:** Rules about what code is allowed to call what other code. Each piece of the system has one job and one reason to change.

**What it hides:** The cost. The Big Ball of Mud feels like the fastest way to work — no abstractions, no layers, just write what you need. The cost is invisible at first and enormous later. Every change risks breaking unrelated things. Every bug could be anywhere. Adding one person to the team takes months because there are no boundaries to understand.

**Canonical example (General):**
A restaurant where every employee can do every job — a waiter can cook, a cook can take orders, a manager can clean tables. Seems efficient. Falls apart immediately when one person is sick, or when you try to hire someone new, or when the menu changes and the cooking technique needs to change but somehow that also means the waiters do things differently.

**Project application:** The architecture for this project is decided in Lab 00f (Hexagonal Architecture). The rules are: the domain (tools, holders, jobs) has no dependencies on the database, the UI, or any file format. The database is a plug-in. The UI is a plug-in. This is the structural answer to the Big Ball of Mud.

**You will see this again in:**
- Every codebase you inherit from a previous developer
- "Technical debt" conversations at any software company
- The reason major rewrites happen — and why they usually fail too
- The reason code review exists at professional companies

**Watch for:** The Big Ball of Mud is attractive because it feels like the fastest path in the short term. It is. It is also the slowest path over any timeline longer than a few weeks.

---

> ## 🎯 Challenge: Identify the Mud
>
> **You know:** What a Big Ball of Mud looks like — mixed responsibilities in one place.
>
> **Task:** Below is a simplified Python function. List every separate responsibility you can find in it. How many reasons does this function have to change?
>
> ```python
> def process_import(filepath):
>     if not filepath.endswith('.tooldb'):
>         print("Error: file must be a .tooldb file")
>         return
>     conn = sqlite3.connect(filepath)
>     rows = conn.execute("SELECT * FROM tools").fetchall()
>     valid = []
>     for row in rows:
>         if row['diameter'] > 0:
>             valid.append(row)
>         else:
>             print(f"Skipping tool {row['name']}: invalid diameter")
>     conn2 = sqlite3.connect("my_tools.db")
>     for tool in valid:
>         conn2.execute("INSERT INTO tools VALUES (?, ?)",
>                       (tool['name'], tool['diameter']))
>     conn2.commit()
>     print(f"Imported {len(valid)} tools")
> ```
>
> **Try for at least 5 minutes before revealing the answer.**
>
> ---
>
> <details>
> <summary>▶ Show Answer</summary>
>
> This function has at least **six** separate responsibilities:
>
> 1. **File type validation** — checking the `.tooldb` extension
> 2. **Source database connection** — opening the Mastercam file
> 3. **Data reading** — querying rows from the source
> 4. **Data validation** — checking that diameter > 0
> 5. **Reporting** — printing skip messages and the final count
> 6. **Destination database write** — connecting to and inserting into the target
>
> **How many reasons to change:** Six. If the validation rules change, this function changes. If the file format changes, this function changes. If the reporting format changes, this function changes. If the destination schema changes, this function changes.
>
> **Key insight:** Each reason to change is a future bug waiting to happen. When validation rules change and someone edits this function, they are one typo away from accidentally breaking the database write. Separation means each thing changes independently.
>
> </details>

---

## Part 3 — The Agile Manifesto

### Concept: The Agile Manifesto

**What it is:** A one-page document written in 2001 by seventeen software practitioners that captures four values shared by all adaptive software methodologies.

**The problem before:**

In the 1990s, the dominant approach to software was called "waterfall." Every requirement was gathered upfront, written in a specification document hundreds of pages long, approved by committees, then handed to developers. Requirements were frozen. Changes required formal change requests. The development phase began only after all requirements were "complete."

The result: projects delivered 18 months late, half the features cut, built to a specification that no longer matched what anyone needed because the business had changed while the specification was being written.

**The solution:** The seventeen people at the meeting had all independently built better approaches. They wrote down what their approaches had in common.

**The four values:**

> We are uncovering better ways of developing software by doing it and helping others do it. Through this work we have come to value:
>
> **Working software** over comprehensive documentation
> **Individuals and interactions** over processes and tools
> **Customer collaboration** over contract negotiation
> **Responding to change** over following a plan
>
> That is, while there is value in the items on the right, we value the items on the left more.

**What each value means for this project:**

| Value | What it means here |
|---|---|
| Working software over documentation | Every lesson ends with running code. Not a design doc, not a diagram — something that runs. |
| Individuals and interactions | You (the machinist / developer) making judgment calls is more valuable than following a rigid process. |
| Customer collaboration | When you realize in Lab 23 that you need a field you didn't plan for, you add it — that's collaboration with your own evolving understanding. |
| Responding to change | The architecture is chosen specifically to make changes cheap. PySide6 can be replaced. SQLite can be replaced. Changes are expected, not feared. |

**What it does NOT mean:**

- "No documentation" — it means working software takes priority when they conflict
- "No process" — it means the process serves the people, not the reverse
- "No planning" — it means respond to change, not ignore the future entirely

**Canonical example (General):**
Compare two restaurants. Restaurant A writes a 400-page menu specification before hiring chefs, spending two years perfecting the menu on paper, then opening. Restaurant B opens with 20 dishes, watches what customers order, adds popular variations, removes what nobody orders. Restaurant B serves real customers' real preferences. Restaurant A serves the committee's best guess from two years ago.

**Project application:** You are building a tool database without knowing every feature you will want in advance. Each lesson adds one working feature. You can use what you built after each lesson. Your understanding of what you need grows as you use it. The lesson plan itself has already changed three times during planning — this is Agile in action.

**You will see this again in:**
- Every job posting that says "Agile environment" or "Scrum"
- Every sprint review or standup in a professional software team
- Product development at any technology company
- The reason "MVP" (Minimum Viable Product) is a concept — ship the smallest working thing, learn from real use

**Watch for:** "Agile" is sometimes used as an excuse to skip planning entirely. The Manifesto says "responding to change over following a plan" — not "no plan." Plans are useful. Rigid attachment to a plan when reality contradicts it is the problem.

---

### REFLECT AND WRITE

Add to `notes.md`:

> "The Agile Manifesto values X over Y because..."
> (fill in one of the four pairs and explain the tradeoff in your own words)

Pick the value that surprised you most. If none surprised you, pick the one that is hardest to apply in practice and explain why.

---

## Part 4 — Where XP Comes From

### Concept: Extreme Programming (XP)

**What it is:** A specific software development methodology created by Kent Beck around 1996–1999, built on twelve specific engineering practices that work together to keep software changeable, tested, and releasable at all times.

**The problem before:**

Before XP, software teams treated testing as a phase at the end of development. Code was written, features were added, and then — weeks or months later — a QA team tested everything. Bugs were found long after the code was written, making them expensive to fix. Integration happened rarely, so merging large branches of separate work was painful and risky.

**The solution:** Kent Beck pushed every practice to its extreme: if testing at the end is good, testing continuously throughout is better. If code review is good, do it continuously by working in pairs. If integration is good, integrate every few hours. If planning is useful, plan in very small increments.

**The twelve practices (introduced now, built throughout the series):**

| Practice | One-line description | First appears |
|---|---|---|
| **Test-Driven Development** | Write the test before the code | Lab 00c |
| **Refactoring** | Improve code structure without changing behavior | Lab 00e |
| **Simple Design** | Build only what the current test demands | Lab 00d |
| **YAGNI** | You Aren't Gonna Need It | Lab 00d |
| **Small Releases** | Every lesson ends with working software | Every lesson |
| **Continuous Integration** | Run tests after every change | Lab 2b |
| **Pair Programming** | Two people, one computer | Optional — useful to know |
| **Collective Code Ownership** | Anyone can change any part | Throughout |
| **Coding Standards** | Consistent style everywhere | Lab 00l |
| **Metaphor** | Shared vocabulary (DDD's Ubiquitous Language) | Lab 00h |
| **Sustainable Pace** | Don't burn out — 40-hour weeks | Ongoing |
| **On-Site Customer** | The person who needs it is available | Adapted: your own evolving understanding |

**Why "extreme":** Each practice, taken alone, is just good advice. Kent Beck's insight was that these practices reinforce each other. TDD makes refactoring safe (tests catch regressions). Refactoring makes simple design achievable (you can clean up after the test passes). Simple design makes tests easy to write. The combination is more powerful than any single practice.

**Canonical example (General):**
A bicycle wheel is strongest when every spoke is tight. A wheel with some tight spokes and some loose ones is weaker than a wheel where every spoke is slightly looser but all equal. XP practices are the spokes — the value comes from all of them working together.

**Project application:** Every lesson in this series applies at least one XP practice explicitly. The **Patterns**, **Principles**, and **XP principle** fields in the lesson plan record which practice is being demonstrated. By the end of the series, you will have built every practice into a habit through repetition, not memorization.

**You will see this again in:**
- Any software team using Scrum (a related methodology that shares XP values)
- CI/CD pipelines at every professional software company (Continuous Integration, automated)
- Code review culture — the reason professional teams require review before merging
- The reason senior engineers say "write the test first" — this is where that came from

**Watch for:** XP was designed for teams. Some practices (pair programming, on-site customer) need adaptation for solo projects. The core technical practices — TDD, refactoring, simple design — apply fully regardless of team size.

---

## Part 5 — Setting Up Your Environment

Before the next lesson, Python must be installed and confirmed working. This is the only "runnable" step in this lesson.

### Step 1 — Check if Python is already installed

Open a terminal (on Windows: press `Win + R`, type `cmd`, press Enter).

Type:

```
python --version
```

### SAVE AND TRY

**You should see:** Something like `Python 3.12.0` or any version starting with 3.10 or higher.

**If you see `'python' is not recognized`:** Python is not installed. Go to `python.org/downloads`, download the Windows installer, run it, and check "Add Python to PATH" before installing. Then close and reopen the terminal and try again.

**If you see `Python 2.7.x`:** This is an old version. Install Python 3 from `python.org` — it installs alongside Python 2.

**Change something:** Type `python --version` and then `python3 --version`. On some systems one works and the other doesn't. Note which one works for you — use that command consistently.

---

### Step 2 — Create the project folder

In your terminal:

```
cd C:\Users\g4m3r\Desktop\cadcam\python-tooldb
```

Then:

```
python -m venv venv
```

### SAVE AND TRY

**You should see:** A new `venv` folder appear inside `python-tooldb`. No errors.

**What just happened:** `python -m venv venv` created a **virtual environment** — an isolated copy of Python that belongs only to this project. When you install packages later, they go into this `venv` folder and do not affect any other Python project on your computer.

We will cover virtual environments in depth in Lab 08. For now: it exists, and we activate it before working on this project.

**Activate the virtual environment:**

```
venv\Scripts\activate
```

**You should see:** Your terminal prompt now starts with `(venv)` — for example `(venv) C:\Users\g4m3r\Desktop\cadcam\python-tooldb>`. This means the virtual environment is active.

**Change something:** Deactivate with `deactivate`. Notice the `(venv)` prefix disappears. Activate again with `venv\Scripts\activate`. You will do this at the start of every work session.

---

### Step 3 — Create your notes file

With the virtual environment active, in the terminal:

```
echo # Python Tool Database — My Notes > notes.md
```

Open `notes.md` in any text editor. Add your reflections from Parts 1–4 above. This file is yours — write in your own voice, not in the style of these lessons.

### SAVE AND TRY

**You should see:** `notes.md` exists in `python-tooldb/` and contains at least your reflections from the REFLECT AND WRITE sections above.

**Verify:** In the terminal, type `type notes.md` (Windows) — you should see the file contents.

---

## Part 6 — The Working Method for This Series

Every lesson from Lab 01 onward follows the same rhythm. Here it is, written out once in full, so you recognize it in every lesson after.

### The Red-Green-Refactor cycle (preview)

```
1. RED   — Write a test for the thing about to be built.
           Run it. It fails. Good — this proves the test checks something real.

2. GREEN — Write the minimum code to make the test pass.
           Not the best code. Just enough to pass.

3. REFACTOR — Improve the code while keeping the tests green.
              Better names. Smaller functions. No duplication.
              Run tests after every change.
```

This cycle repeats. Each cycle takes minutes, not hours. The lesson is structured around it.

### What "SAVE AND TRY" means

Every significant step ends with a **SAVE AND TRY** block. This block tells you:
- What command to run
- Exactly what output to expect
- Something to change to verify you understand it
- What to do if it breaks

"Something to change" is not optional — it is the most important part. Changing a value and predicting the new output is how understanding sticks. Reading is passive. Changing is active.

### What a Challenge is

Challenges appear after substantial concepts. They give you a task to implement yourself, with the solution hidden in a `▶ Show Solution` block. The rule: try for at least five minutes before looking. If you look immediately, you are trading a skill for an answer.

---

## Final Check

| What to verify | How to verify it |
|---|---|
| Python 3.10+ is installed | `python --version` shows 3.10 or higher |
| Virtual environment was created | `venv/` folder exists in `python-tooldb/` |
| Virtual environment activates | Terminal prompt shows `(venv)` after `venv\Scripts\activate` |
| `notes.md` exists with content | `type notes.md` in terminal shows your written reflections |
| You can describe what XP is | Close this lesson and write one paragraph from memory |

---

## Quick Check Answers

**1. You built exactly what was asked for but the machinist says "this isn't what I meant." Who is at fault?**

Neither — and both, depending on how you look at it. The machinist did not know precisely what they needed until they saw it working. The developer built exactly what was described. This is the normal state of software development, not a failure of either party. The productive question is not "whose fault" but "how do we build a process that catches this gap early and cheaply?" That process is what this series teaches.

**2. What is the difference between a plan that accounts for change and a plan that tries to prevent it?**

A plan that tries to prevent change assumes requirements can be fully known upfront — it locks everything down, defines penalties for changes, and treats any deviation as a failure. A plan that accounts for change assumes requirements will evolve — it keeps each step small, keeps the system always-releasable, and treats new understanding as information rather than a problem. The Agile Manifesto values "responding to change over following a plan" — not "no plan," but a plan held loosely.

**3. If you had to describe the tool database to someone who has never used Mastercam, what would be the hardest part to explain?**

There is no single right answer. The purpose of this question is to make you think about the domain vocabulary — the words (tool, holder, assembly, stickout, operation, job) that you will use constantly and that a non-machinist would not understand. In Lab 00h (Domain-Driven Design) this is called the **Ubiquitous Language** — the shared vocabulary that everyone working on the software must agree on and use consistently. If you struggled to explain any term, that term needs to be in the domain glossary.

---

*Lab 00 complete. Next: Lab 00b — The XP Practices Field Guide.*
