# Phase 1 — Computational Thinking

**Goal:** Learn how software actually works at the fundamental level.
**Runtime:** Console-based throughout — no browser, no framework, nowhere to hide.
**Time estimate:** ~40 hours

## What this phase teaches

Before you can build maintainable systems, you need to understand what a computer
is actually doing when it runs your code. This phase builds that foundation.
Everything is visible in the terminal.

## Modules

- **Module 1 — Fundamentals** (LAB-01 through LAB-08): Variables, functions,
  data structures, recursion, and complexity. The vocabulary of computation.
  Each lab is a standalone concept, so the language rotates deliberately —
  JavaScript (LAB-01), Python (LAB-02–03), Java (LAB-04), C++ (LAB-05–07),
  back to JavaScript (LAB-08) to bridge into Module 2. Seeing the same ideas
  expressed in four languages early is the point — it shows you which parts
  of "how variables work" are universal and which are language-specific.
- **Module 2 — Mini Projects** (LAB-09 through LAB-16): Eight complete projects
  that apply the fundamentals, all in Node.js/JavaScript. Unlike Module 1, these
  build on each other directly — the lexer (LAB-10) feeds the parser (LAB-11),
  which feeds the evaluator (LAB-12), which grows into the VM (LAB-16) — so the
  language stays fixed across the whole module.

## The pattern

Every mini-project in Module 2 is a system you will recognize later:
- The **lexer** reappears in every language tool (Phase 7)
- The **parser** reappears in the template engine, linter, and compiler
- The **state machine** reappears in every game, UI, and protocol
- The **VM** is the foundation of Phase 7

## Start here

[LAB-01 — Variables, Types, and Memory](module-01-fundamentals/LAB-01-variables-types-memory.md)
