---
series: contributor-series
level: 4
title: How to Teach Through Code
lang: javascript
---

# How to Teach Through Code

Most technical writing fails at teaching because it explains what, not why. A tutorial shows you the code to type; a good lesson explains why that code exists, what it's doing at a deeper level, and what would break if you removed it. The reader who finishes a good lesson can adapt what they learned to a new situation — not just repeat what they saw.

Writing that kind of lesson is a craft. It requires choosing one concept per section (not three), showing the code first (not after a long explanation), and testing whether the learner understood (not just whether they copied correctly).

By the end of this lesson you will understand the structure of a good lesson section, know how to write CS lens and SE lens explanations that add depth beyond the surface syntax, and be able to write a challenge that tests whether the concept was actually learned.

## The structure of a great lesson section

```text
Every concept section in a lesson follows this pattern:

1. Show the code — a runnable example of the concept
2. Show the output or a paired explanation block
3. Explain the WHY (CS lens or SE lens)

What to avoid:
  ❌ "Here is how to use forEach:"  (tells, doesn't show)
  ✓  Show working forEach code first, then explain it

  ❌ "forEach iterates over an array" (definition, not insight)
  ✓  "CS lens: forEach is a higher-order function — it takes a function
      as an argument and calls it once per element. The function you pass
      is called a 'callback'. This pattern comes from functional programming
      and lets you define 'what to do with each element' without writing
      the loop manually."

The lens paragraph is what makes a lesson, not a reference doc.
It answers the question the learner has but hasn't asked yet.
```

## The "why does this exist?" question

```javascript
// Bad explanation (just the what):
// "Array.map() creates a new array by applying a function to each element."

// Good explanation (the what AND the why):
const numbers = [1, 2, 3, 4]
const doubled = numbers.map(n => n * 2)
// → [2, 4, 6, 8]

// CS lens: .map() is a mathematical function — it maps a set to another set
// using a transformation function. In math: f(S) = { f(x) | x ∈ S }.
// The key property: the original array is unchanged. .map() always returns
// a new array. This is called immutability — the input is never modified.
// Functional programming languages (Haskell, Elm) enforce this everywhere;
// JavaScript gives you the choice, but map/filter/reduce are the conventional
// way to process arrays without mutation.

// Why does this matter? Because:
//   numbers.map(n => n * 2) — safe: original unchanged
//   numbers.forEach((n, i) => numbers[i] = n * 2) — mutates original (surprising)
```

**CS lens:** The best explanations in a lesson trace from the surface (what you type) to the mechanism (what the computer does) to the origin (where this pattern came from). A learner who only knows "map makes a new array" will be confused when they encounter `flatMap`, `reduce`, or the functor pattern in other languages. A learner who understands "map applies a function to every element of a container" will recognize the same idea in Python's `map()`, Rust's `.iter().map()`, and Haskell's `fmap`.

## Writing a good challenge

```text
The challenge is the most important part of the lesson.
It's where the learner produces something, not just reads.

What makes a good challenge:
  1. One clear task — not three loosely related things
  2. Starter code that gives them a foothold (not a blank page)
  3. Tests that verify understanding, not just presence
  4. Tests that FAIL on wrong answers (not trivially passable)

Bad tests:
  assert typeof answer !== 'undefined'   ← passes with any value
  assert answer !== ''                   ← passes with "x"
  assert answer.length > 0              ← passes with "a"

Good tests:
  assert typeof answer === 'function'
  assert answer(5) === 10               ← tests the actual behaviour
  assert answer([1,2,3]).length === 3
  assert answer([]) === 0               ← tests the edge case

The test file should fail if the learner hasn't actually learned the concept.
```

## The opening paragraph

```text
Every lesson starts with 1-3 sentences that answer:
  1. What is this? (one sentence definition)
  2. Why does it matter? (one sentence motivation)
  3. When would you use it? (one sentence context) — optional

Examples:

Bad opening:
  "In this lesson we will learn about closures."
  → Describes the lesson, not the concept. Adds no value.

Good opening:
  "A closure is a function that remembers the variables from the scope
   where it was created, even after that scope has ended. This is how
   React hooks maintain state between renders and how event handlers
   can reference the current value of a variable without receiving it
   as an argument."
  → Defines it, motivates it, gives two concrete contexts.
```

**SE lens:** The hardest part of writing a lesson is not the code examples — it's the prose around them. The code shows what; the prose explains why. Most technical writers default to describing what the code does ("this function takes a number and returns its square") rather than explaining the underlying concept. The goal is to build a mental model that the learner can apply in new situations, not just remember the syntax for one scenario.

**Common mistakes:**
- Writing too much in one level — if you're teaching three unrelated ideas, they should be three separate levels. A level should have one thing to learn.
- Copying examples directly from the language's docs — documentation examples are designed to show every feature. Lesson examples should show one thing clearly, with everything non-essential removed.

**Debug tip:** After writing a lesson, read it as a beginner would. Pretend you don't know the concept. At every sentence: could a beginner have a question here that you haven't answered? If yes, either answer it or simplify the explanation.

**Next:** Understanding components — enough React to navigate the lesson engine code.

## Challenge: lesson_craft

Write the parts of a lesson section.

```javascript
const lessonSection = {
  // One sentence: what does Array.filter() do?
  whatItIs: '',
  // One sentence: why does immutability matter when using filter?
  whyItMatters: '',
  // Write one good assert that tests whether a filter implementation works
  // (test: answers.filterFn([1,2,3,4], x => x > 2) should return [3, 4])
  testAssertion: '',
}
```

```test
assert lessonSection.whatItIs.length > 20
assert lessonSection.whyItMatters.length > 20
assert lessonSection.testAssertion.includes('assert')
assert lessonSection.testAssertion.includes('filter') || lessonSection.testAssertion.includes('3') || lessonSection.testAssertion.includes('length')
```
