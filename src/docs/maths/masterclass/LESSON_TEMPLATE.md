# [LESSON NUMBER] — [TITLE THAT NAMES THE CORE IDEA, NOT THE TOPIC]
<!--
Title examples:
  GOOD: "The Gauss Trick and How to Prove Things Are Always True"
  GOOD: "Why Your Intuition About Infinity is Wrong"
  GOOD: "The One Picture That Replaces Every Trig Formula"
  BAD:  "Proof Strategies"
  BAD:  "Introduction to Integration"
  BAD:  "The Epsilon-Delta Definition of a Limit"
The title should make someone who doesn't know the topic curious.
-->

**Phase [N] · [Phase Name] · Lesson [X] of [Y]**

---
<!-- 
OPENING HOOK — 2 to 5 sentences. No "in this lesson we will."
This is a story, a puzzle, a surprising fact, or a question.
The reader should immediately want to know what comes next.
Goal: create the question before providing the answer.

Examples of good hooks:
- A story (Gauss, Euler's failed conjecture, a physical paradox)
- A counterintuitive claim ("This sum goes on forever, but adds up to a finite number")
- A challenge ("Can you find a pattern in these numbers before I tell you what it is?")
- A gap ("You can solve any quadratic. But what about x^5 - x - 1 = 0?")
-->

[2–5 sentence hook here. Tell a story or pose a puzzle.]

---

## The Problem

<!--
State what the student CANNOT yet do, or what question they CANNOT yet answer.
Be concrete. If you can't state the problem in one sentence, the lesson needs a sharper focus.

This section should make the student feel the gap. They should want the thing that fills it.
"You can check that this formula works for small numbers. But you cannot check every number.
So how do you know it's always true?"
-->

[One or two sentences. The gap. The question.]

---

<!-- 
DISCOVERY SECTION — the heart of the lesson.
Walk the student to the idea. Don't state it yet.

Pattern:
1. A concrete example or experiment (often code)
2. A question: "do you see a pattern?" or "what would happen if..."
3. Another example that deepens the pattern
4. The student is now one step away from the idea

Code here should:
- Be ≤ 15 lines
- Produce interesting output with a natural shape
- Invite the student to change one thing and observe

Use "Before scrolling down..." pauses at least once.
-->

## Finding the Pattern

> **Try this first.** [Instruction that makes the student think before the answer appears.]
> *(Take [30 seconds / a minute]. The answer is there.)*

```python
# [What this code reveals — ONE thing]
# Keep it short. The student should be able to read it.
[short code, ≤ 15 lines]
```

[What the student should notice from the output. Ask a question about it.]

---

## The Idea

<!--
NOW state the concept. It earns its place because the student already understands
what it means from the examples above. 

Order:
1. State the idea in plain English first
2. Show it with an example
3. State it precisely (with notation if needed)
4. The notation is a shorthand for something they already understand

If the idea has a name (e.g., "induction"), introduce the name AFTER the concept:
"This technique — checking the first case and proving each case implies the next —
is called mathematical induction."
-->

[The idea in plain English, before any notation.]

[An example that makes it concrete.]

[The precise statement, with notation introduced as shorthand for the English version.]

---

## Building the Proof / Derivation

<!--
Every formula is derived. Every theorem is proved.
Write proofs conversationally: "We want to show X. Here's the move: ..."
Every step has a reason attached in plain English.
Never write "it is easy to see that" or "one can show."

Structure:
- State what you want to prove (in English)
- State the strategy (one sentence: "We'll add and subtract the same term" or "We'll assume the opposite and find a contradiction")
- Execute step by step
- Each step: what happened, and why you did it

After the proof: one sentence saying what you actually proved and why it matters.
-->

**What we want to show:** [Plain English statement of the result]

**Strategy:** [One sentence. What is the proof doing at a high level?]

[Proof, step by step, with English commentary on each move]

---

<!--
SECOND CODE BLOCK (if needed) — ONE different insight from the first.
Often this is: "Let's see the formula in action" or "Let's see where it breaks."
Still ≤ 20 lines. Still one point.
-->

```python
# [What this reveals]
[code]
```

[What to notice. What changes if you modify it.]

---

## Try It Yourself

<!--
A challenge that requires genuine understanding, not mechanical repetition.
The student should need to think.
It should be solvable with the lesson's tools — but not trivially.

Good challenge formats:
- "Prove [similar result] using the same technique"
- "What goes wrong if you try to apply this to [edge case]?"
- "Find the formula for [related sum / product / pattern]"
- "Modify the code to show [related phenomenon]"

Include a starting hint if the problem is hard.
-->

[The challenge.]

```python
# Starting point if needed
[optional scaffold]
```

---

## What Comes Next

<!--
One or two sentences. What does this lesson make possible?
Create anticipation for the next lesson.
-->

[In the next lesson, we will use [this idea] to [solve a more interesting problem]...]
