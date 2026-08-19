# From Zero to Mastery: Scheme, Lisp, SICP & Clojure

A ground-up curriculum that takes you from absolute zero — no Lisp, no
functional programming, no prior experience — through mastery of Scheme,
the canonical Lisp books, SICP, and production-ready Clojure.

The goal is not just to read books. It is to build the thinking patterns
and architectural instincts that make you a better programmer in *any*
language — and to build real, useful tools along the way.

---

## What you will need

**One tool, for the entire series:**

> **[Racket / DrRacket](https://racket-lang.org/)**
>
> DrRacket is already installed on your machine. Every lesson in this
> series runs in DrRacket. Every code block shows its real output from
> a real Racket session. You type; you run; you see.

Later lessons (Module 5 onward) add **Clojure** with its own installer —
that is covered in Lesson 39 when you reach it.

---

## Reading order

Work through the lessons in number order. Every lesson states exactly
what you need to know from the lessons before it. Do not skip ahead.

---

## Module 0 — Foundations (Lessons 0–4)

Build the mental model before you write a real program. What Lisp *is*,
why it looks the way it does, and how to speak fluently in S-expressions.

| Lesson | Title |
|--------|-------|
| [Lesson 0](lesson-00.md) | A Language That Thinks in Lists |
| [Lesson 1](lesson-01.md) | Atoms and Pairs — The Two Things Everything Is |
| [Lesson 2](lesson-02.md) | Lists All the Way Down |
| [Lesson 3](lesson-03.md) | Your First Recipe — `define` and `lambda` |
| [Lesson 4](lesson-04.md) | Asking Questions — `cond`, `if`, and Booleans |

---

## Module 1 — The Little Schemer Arc (Lessons 5–15)

Recursion as a first language. These lessons follow the ideas in
*The Little Schemer* by Friedman & Felleisen. You do not need to own
the book — the lessons are self-contained — but reading it alongside
is worthwhile.

| Lesson | Title |
|--------|-------|
| [Lesson 5](lesson-05.md) | The First Commandment — Recur on the `cdr` |
| [Lesson 6](lesson-06.md) | The Second Commandment — Build with `cons` |
| [Lesson 7](lesson-07.md) | The Third Commandment — Stop When Null, Otherwise Recur |
| [Lesson 8](lesson-08.md) | `lat?`, `member?`, `rember` — Searching Lists |
| [Lesson 9](lesson-09.md) | Firsts and Seconds — Nested List Recursion |
| [Lesson 10](lesson-10.md) | Numbers as Lists — Peano Arithmetic |
| [Lesson 11](lesson-11.md) | `o+`, `o×`, `o↑` — Building Arithmetic from Recursion |
| [Lesson 12](lesson-12.md) | Length, Reverse, Flatten — Classic List Algorithms |
| [Lesson 13](lesson-13.md) | Higher-Order Functions — `lambda` Returning `lambda` |
| [Lesson 14](lesson-14.md) | `set?`, `makeset`, `subset?` — Lists as Sets |
| [Lesson 15](lesson-15.md) | Association Lists — `lookup`, `newpair`, `extend` |

---

## Module 2 — The Seasoned Schemer Arc (Lessons 16–22)

Named let, letrec, tail calls, continuations, macros, and streams.
These ideas follow *The Seasoned Schemer* and are where Scheme stops
feeling like a toy and starts feeling like a tool.

| Lesson | Title |
|--------|-------|
| [Lesson 16](lesson-16.md) | `let` and `letrec` — Naming Things Inside Functions |
| [Lesson 17](lesson-17.md) | Named `let` — Loops Without Looping |
| [Lesson 18](lesson-18.md) | Tail Calls — Why Some Recursion Doesn't Blow the Stack |
| [Lesson 19](lesson-19.md) | Continuations — Capturing Where You Are |
| [Lesson 20](lesson-20.md) | `call/cc` for Early Exit and Coroutines |
| [Lesson 21](lesson-21.md) | `define-syntax` and Macros — Extending the Language |
| [Lesson 22](lesson-22.md) | Streams — Infinite Lists |

---

## Module 3 — The Reasoned Schemer Arc (Lessons 23–26)

Logic programming with miniKanren, following *The Reasoned Schemer*.
The idea: instead of writing a function that computes an answer, you
write a *relation* that describes a truth — and the computer finds the
answer.

| Lesson | Title |
|--------|-------|
| [Lesson 23](lesson-23.md) | Relations, Not Functions — miniKanren Basics |
| [Lesson 24](lesson-24.md) | Conjunction and Disjunction — `conde` and `conj` |
| [Lesson 25](lesson-25.md) | Recursion in miniKanren — `appendo`, `membero` |
| [Lesson 26](lesson-26.md) | Running Backwards — Queries as Programs |

---

## Module 4 — SICP Arc (Lessons 27–38)

*Structure and Interpretation of Computer Programs* by Abelson &
Sussman, often called the most important CS book ever written. Dense,
but you are ready for it by now. These lessons unpack it slowly,
chapter by chapter, with every example run for real.

| Lesson | Title |
|--------|-------|
| [Lesson 27](lesson-27.md) | SICP Ch1 — The Elements of Programming |
| [Lesson 28](lesson-28.md) | SICP Ch1 — Higher-Order Procedures |
| [Lesson 29](lesson-29.md) | SICP Ch1 — Recursion vs. Iteration — The Process Shape |
| [Lesson 30](lesson-30.md) | SICP Ch2 — Data Abstraction |
| [Lesson 31](lesson-31.md) | SICP Ch2 — Hierarchical Data and Closure |
| [Lesson 32](lesson-32.md) | SICP Ch2 — Symbolic Data |
| [Lesson 33](lesson-33.md) | SICP Ch2 — Generic Operations and Tagged Data |
| [Lesson 34](lesson-34.md) | SICP Ch3 — Assignment and Local State |
| [Lesson 35](lesson-35.md) | SICP Ch3 — The Environment Model |
| [Lesson 36](lesson-36.md) | SICP Ch3 — Streams and Lazy Evaluation |
| [Lesson 37](lesson-37.md) | SICP Ch4 — The Metacircular Evaluator |
| [Lesson 38](lesson-38.md) | SICP Ch4 — Lazy Evaluation and the Amb Evaluator |

---

## Module 5 — Clojure Arc (Lessons 39–50)

Lisp on the JVM, with persistent data structures, a world-class
concurrency model, and a library ecosystem that lets you build and
ship real tools. This is where everything you learned in Scheme becomes
something you can use professionally.

| Lesson | Title |
|--------|-------|
| [Lesson 39](lesson-39.md) | Clojure's World — JVM, Namespaces, the REPL |
| [Lesson 40](lesson-40.md) | Clojure's Data Literals — Vectors, Maps, Sets |
| [Lesson 41](lesson-41.md) | Sequences — Everything is a Sequence |
| [Lesson 42](lesson-42.md) | Destructuring — Tearing Structure Apart |
| [Lesson 43](lesson-43.md) | Functions All the Way — `fn`, `defn`, Closures |
| [Lesson 44](lesson-44.md) | Recursion in Clojure — `loop`/`recur` |
| [Lesson 45](lesson-45.md) | Macros in Clojure — `defmacro` and the Reader |
| [Lesson 46](lesson-46.md) | State in Clojure — Atoms, Refs, Agents |
| [Lesson 47](lesson-47.md) | Protocols and Records — Polymorphism the Clojure Way |
| [Lesson 48](lesson-48.md) | Threading Macros and Transducers |
| [Lesson 49](lesson-49.md) | `core.async` — Channels and Go Blocks |
| [Lesson 50](lesson-50.md) | Architecting with Clojure — A Mini Data Pipeline |
