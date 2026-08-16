# Taught Constructs & Terms — Quick Lookup Index

This file exists so "has this already been taught?" is a single grep, not a
search across 130+ lesson files. Every language construct or term gets its
own first-appearance treatment exactly once (Repetition Rule, `LESSON
SCHEMA.md`) — before marking anything "new" in a lesson, grep this file for
the name first.

**How it's built:** each entry is copied straight from the lesson that
introduced it — specifically, that lesson's own Header ("Terms introduced in
this lesson" / "Objects and methods used"), which every lesson already
writes per the schema. This file adds nothing not already stated in the
lesson itself; it's a flat index over material that already exists.

**How to keep it updated:** the moment a new lesson is finished, append its
own new Terms and Objects/methods entries here, under a new `### Lesson N -
Title` heading, in the same two-line-per-entry style already used below.
Lessons that introduce nothing new (`Terms introduced... None new`) get no
heading here at all — same as the ones already skipped below. Never
backfill or edit a past lesson's entries here from memory; if one looks
wrong, go reread that lesson's own Header and fix whichever one is actually
wrong.

**One exception:** Lesson 108 (*Designing a Data Structure*) uses a
different format entirely (challenge → companion implementation with a
planted bug → reveal) with no Terms/Objects Header at all, and introduces no
genuinely new construct of its own — it's a deliberate, documented gap, not
a missed extraction.

---

### Lesson 1 - What Is a Computational Problem?
- computational problem (term)
- input (term)
- output (term)
- transformation (term)
- constraint (term)
- state (term)
- correctness (term)
- specification (term)
- well-defined problem (term)

### Lesson 2 - Expressions, Values, and Evaluation
- expression (term)
- value (term)
- evaluation (term)
- sub-expression (term)
- REPL (term)
- form (term)
- prefix notation (term)
- `+` (object/method)
- `*` (object/method)
- `-` (object/method)
- `/` (object/method)

### Lesson 3 - Names, Bindings, and Environments
- binding (term)
- environment (term)
- name lookup (term)
- symbol (term)
- rebinding (term)
- script mode (term)
- `def` (object/method)
- `println` (object/method)

### Lesson 4 - Functions as Transformations
- function (term)
- parameter (term)
- argument (term)
- call (term)
- return value (term)
- arity (term)
- local scope (term)
- `defn` (object/method)

### Lesson 5 - Function Composition
- composition (term)
- first-class value (term)
- commutative (term)
- `comp` (object/method)

### Lesson 6 - Equality and Substitution
- equality (term)
- assignment (term)
- identity (term)
- substitution (term)
- `=` (object/method)
- `==` (object/method)
- `identical?` (object/method)

### Lesson 7 - Predicates and Boolean Logic
- predicate (term)
- boolean (term)
- logical connective (term)
- nil (term)
- truthy (term)
- conditional (term)
- implication (term)
- equivalence (term)
- `>`, `>=`, `<`, `<=` (object/method)
- `and` (object/method)
- `or` (object/method)
- `not` (object/method)
- `if` (object/method)

### Lesson 8 - Truth Tables and Logical Equivalence
- truth table (term)
- logical equivalence (term)
- De Morgan's laws (term)

### Lesson 9 - Quantifiers
- quantifier (term)
- universal quantification (term)
- existential quantification (term)
- domain (term)

### Lesson 10 - Sets as Computational Collections
- set (term)
- membership (term)
- namespace (term)
- Cartesian product (term)
- `contains?` (object/method)
- `require` (object/method)
- `clojure.set/union` (object/method)
- `clojure.set/intersection` (object/method)
- `clojure.set/difference` (object/method)
- `clojure.set/subset?` (object/method)

### Lesson 11 - Relations
- ordered pair (term)
- relation (term)
- domain (term)
- range (term)
- `first` (object/method)
- `second` (object/method)
- `contains?` (object/method)

### Lesson 12 - Functions as Special Relations
- single-valued (term)
- total function (term)
- partial function (term)
- injective (term)
- surjective (term)
- bijective (term)
- codomain (term)

### Lesson 13 - Algebraic Manipulation
- rearrangement (term)
- cancellation (term)
- factoring (term)

### Lesson 14 - Inductive Thinking
- base case (term)
- inductive step (term)
- propagation (term)

### Lesson 15 - Mathematical Induction
- inductive hypothesis (term)
- vacuous truth (term)

### Lesson 16 - Invariants
- invariant (term)
- loop invariant (term)
- state invariant (term)

### Lesson 17 - Proof by Cases and Contradiction
- proof by cases (term)
- exhaustive (term)
- proof by contradiction (term)

### Lesson 18 - The Computational Proof Mindset
- the computational proof mindset (term)

### Lesson 19 - Recursive Definitions
- recursive definition (term)
- recursive case (term)
- successor (term)

### Lesson 20 - Recursive Functions
- recursive function (term)
- recursive call (term)

### Lesson 21 - Structural Recursion
- structural recursion (term)

### Lesson 22 - Base Cases and Progress
- termination measure (term)
- well-ordering principle (term)

### Lesson 23 - Tracing Recursive Evaluation
- call stack (term)
- evaluation tree (term)
- overlapping subproblems (term)

### Lesson 24 - Lists from First Principles
- empty list (term)
- cons (term)
- deconstruction (term)
- `list` (object/method)
- `empty?` (object/method)
- `cons` (object/method)
- `first` (object/method)
- `rest` (object/method)

### Lesson 25 - Map
- map (term)
- `map` (object/method)

### Lesson 26 - Filter
- filter (term)
- `filter` (object/method)

### Lesson 27 - Fold / Reduce
- reduce (term)
- accumulator (term)
- `reduce` (object/method)

### Lesson 28 - Append and Reverse
- naive implementation (term)
- `concat` (object/method)
- `reverse` (object/method)

### Lesson 29 - Nested Lists
- nested list (term)
- `sequential?` (object/method)

### Lesson 30 - Trees as Recursive Data
- leaf (term)
- `max` (object/method)

### Lesson 31 - Tree Traversals
- preorder traversal (term)
- inorder traversal (term)
- postorder traversal (term)

### Lesson 32 - Generators and Search
- search space (term)
- generator (term)

### Lesson 33 - Backtracking
- backtracking (term)
- pruning (term)

### Lesson 34 - Accumulators
- pending work (term)
- accumulator transformation (term)

### Lesson 35 - Tail Recursion
- tail call (term)
- tail call optimization (term)
- `recur` (object/method)

### Lesson 36 - Mutual Recursion
- mutual recursion (term)
- forward declaration (term)
- `declare` (object/method)

### Lesson 37 - Recursion vs Iteration
- iteration (term)
- `loop` (object/method)

### Lesson 38 - Memoization
- memoization (term)
- cache hit (term)
- `memoize` (object/method)

### Lesson 39 - Dynamic Programming from Recursion
- dynamic programming (term)
- bottom-up (term)

### Lesson 40 - The Recursive Problem-Solving Method
- the recursive problem-solving method (term)

### Lesson 41 - Variables and Symbolic Expressions
- symbolic expression (term)
- symbol (term)
- `quote` (object/method)
- `number?` (object/method)

### Lesson 42 - Polynomials
- polynomial (term)
- Horner's method (term)

### Lesson 43 - Exponents and Logarithms
- exponent (term)
- logarithm (term)
- `quot` (object/method)

### Lesson 44 - Summation Notation
- summation notation (term)
- index variable (term)

### Lesson 45 - Product Notation
- product notation (term)

### Lesson 46 - Arithmetic Series
- arithmetic series (term)

### Lesson 47 - Geometric Series
- geometric series (term)

### Lesson 48 - Recurrences
- recurrence (term)
- T(n) (term)

### Lesson 49 - Solving Simple Recurrences
- expansion (term)
- closed form (term)

### Lesson 50 - Growth Rates
- growth rate (term)

### Lesson 51 - Big-O
- Big-O notation (term)
- dominant term (term)

### Lesson 52 - Big-Theta and Big-Omega
- Big-Omega (Ω) (term)
- Big-Theta (Θ) (term)

### Lesson 53 - Amortized Analysis
- amortized cost (term)

### Lesson 54 - Modular Arithmetic
- modulus (term)
- equivalence class (mod n) (term)
- modular arithmetic (term)
- `mod` (object/method)

### Lesson 55 - Greatest Common Divisor
- greatest common divisor (GCD) (term)
- Euclid's algorithm (term)

### Lesson 56 - Extended Euclidean Algorithm
- Bézout's identity (term)
- modular inverse (term)

### Lesson 57 - Prime Numbers
- prime number (term)
- prime factorization (term)

### Lesson 58 - Algebraic Reasoning in Code
- least common multiple (LCM) (term)
- algebraic reasoning in code (term)

### Lesson 59 - Counting Without Listing
- fundamental counting principle (term)

### Lesson 60 - Addition and Multiplication Rules
- addition rule (term)

### Lesson 61 - Permutations
- permutation (term)

### Lesson 62 - Combinations
- combination (term)
- binomial coefficient (term)

### Lesson 64 - Binomial Theorem
- binomial theorem (term)

### Lesson 65 - Inclusion-Exclusion
- inclusion-exclusion (term)

### Lesson 66 - Pigeonhole Principle
- pigeonhole principle (term)
- existence proof (term)

### Lesson 67 - Stars and Bars
- stars and bars (term)

### Lesson 69 - Generating Functions - Motivation
- generating function (term)

### Lesson 70 - Generating Functions - Basic Manipulation
- convolution (term)

### Lesson 71 - Discrete Probability
- sample space (term)
- event (term)
- probability axioms (term)

### Lesson 72 - Conditional Probability
- conditional probability (term)

### Lesson 73 - Independence
- independence (term)

### Lesson 74 - Bayes' Rule
- Bayes' rule (term)

### Lesson 75 - Expected Value
- expected value (term)
- linearity of expectation (term)

### Lesson 76 - Variance
- variance (term)

### Lesson 77 - Random Variables
- random variable (term)
- indicator random variable (term)

### Lesson 78 - Randomized Algorithms
- randomized algorithm (term)
- `shuffle` (object/method)

### Lesson 79 - Birthday Paradox
- complement (term)

### Lesson 80 - Markov Chains
- Markov chain (term)
- Markov property (term)
- law of total probability (term)

### Lesson 81 - Monte Carlo and Las Vegas Algorithms
- Las Vegas algorithm (term)
- Monte Carlo algorithm (term)
- `rand-int` (object/method)

### Lesson 82 - Probabilistic Problem Solving
- probabilistic method (term)

### Lesson 83 - Why Data Structures Exist
- representation (term)

### Lesson 84 - Arrays and Contiguous Memory
- array (term)
- contiguous memory (term)
- index (term)
- `[...]` (vector literal) (object/method)
- `get` (object/method)
- `assoc` (object/method)

### Lesson 85 - Linked Structures
- node (term)
- reference (term)

### Lesson 86 - Stacks
- stack (term)
- LIFO (term)

### Lesson 87 - Queues
- queue (term)
- FIFO (term)

### Lesson 88 - Deques
- deque (term)

### Lesson 89 - Hash Tables
- hash function (term)
- collision (term)
- chaining (term)

### Lesson 90 - Sets and Maps
- abstract data type (term)
- Set (term)
- Map (term)

### Lesson 91 - Binary Search
- binary search (term)

### Lesson 92 - Binary Search Trees
- binary search tree (BST) (term)

### Lesson 93 - Tree Invariants
- structural induction (term)

### Lesson 94 - Heaps
- heap (term)
- complete binary tree (term)
- `count` (object/method)

### Lesson 95 - Heap Construction
- height (term)
- sift-down (term)
- heapify (term)

### Lesson 96 - Priority Queues
- priority queue (term)
- `pop` (object/method)

### Lesson 98 - AVL Trees
- balance factor (term)
- AVL tree (term)
- rotation (term)

### Lesson 99 - Red-Black Trees
- red-black tree (term)
- uncle (term)

### Lesson 100 - B-Trees
- B-tree (term)
- order (term)
- split (term)

### Lesson 101 - Tries
- trie (term)
- prefix (term)

### Lesson 102 - Disjoint Sets
- disjoint sets (term)
- representative (term)

### Lesson 104 - Persistent Data Structures
- persistent data structure (term)
- ephemeral data structure (term)
- structural sharing (term)
- path copying (term)
- `identical?` (object/method)

### Lesson 106 - Representation Invariants
- abstract data type (ADT) (term)
- representation invariant (term)
- abstraction barrier (term)

### Lesson 109 - What Makes an Algorithm?
- algorithm (term)
- space complexity (term)

### Lesson 110 - Specifications Before Algorithms
- precondition (term)
- postcondition (term)

### Lesson 111 - Brute Force
- brute force (term)

### Lesson 112 - Divide and Conquer
- divide and conquer (term)

### Lesson 113 - Merge Sort
- merge (term)

### Lesson 114 - Quick Sort
- pivot (term)
- partition (term)

### Lesson 115 - Selection Algorithms
- order statistic (term)

### Lesson 116 - Lower Bounds
- lower bound (term)
- decision tree (term)

### Lesson 117 - Greedy Algorithms
- greedy algorithm (term)

### Lesson 118 - Exchange Arguments
- exchange argument (term)

### Lesson 119 - Dynamic Programming
- state (term)
- transition (term)

### Lesson 120 - Longest Common Subsequence
- subsequence (term)
- longest common subsequence (LCS) (term)

### Lesson 122 - Interval Problems
- interval partitioning (term)

### Lesson 123 - Graphs as Computational Objects
- graph (term)
- directed (term)
- weighted (term)
- adjacency list (term)
- adjacency matrix (term)

### Lesson 124 - Breadth-First Search
- breadth-first search (BFS) (term)
- frontier (term)

### Lesson 125 - Depth-First Search
- depth-first search (DFS) (term)

### Lesson 126 - DFS Invariants and Timestamps
- discovery time (term)
- back edge (term)

### Lesson 127 - Topological Sorting
- topological sort (term)

### Lesson 128 - Connected Components
- connected component (term)

### Lesson 130 - Dijkstra's Algorithm
- relax (term)

### Lesson 131 - Bellman-Ford
- negative cycle (term)

### Lesson 132 - Minimum Spanning Trees
- spanning tree (term)
- minimum spanning tree (MST) (term)

### Lesson 134 - Network Flow
- flow network (term)
- conservation (term)

### Lesson 135 - Matching
- bipartite matching (term)

### Lesson 136 - Constraint Satisfaction
- constraint satisfaction problem (CSP) (term)
- variable (term)
- domain (term)
- constraint (term)
- assignment (term)
- consistent assignment (term)
- `not=` (object/method)
- `nil?` (object/method) — genuine first-appearance treatment; earlier lessons (85, 92, 109) used it but never actually explained it, see HANDOFF.md

### Lesson 137 - Search, Pruning, and Heuristics
- search tree (term)
- heuristic (term)
- degree heuristic (term)

### Lesson 139 - Abstraction
- abstraction (term)
- observational equivalence (term)

### Lesson 140 - Algebraic Structures
- binary operation (term)
- closure (term)
- identity element (term)
- inverse (term)
- associativity (term)

### Lesson 141 - Monoids
- monoid (term)

### Lesson 142 - Semirings
- semiring (term)
- distributivity (term)

### Lesson 143 - Groups
- group (term)
- symmetry (term)

### Lesson 144 - Rings and Fields
- ring (term)
- field (term)

### Lesson 145 - Equivalence Relations
- equivalence relation (term)
- equivalence class (term)
- canonical representative (term)

### Lesson 146 - Partial Orders
- antisymmetric (term)
- partial order (term)
- comparable (term)
- total order (term)

### Lesson 147 - Lattices
- join (term)
- meet (term)
- lattice (term)

### Lesson 148 - Graphs as Relations
- transitive closure (term)

### Lesson 150 - Algebraic Data Types
- product type (term)
- sum type (term)

### Lesson 151 - Pattern Matching
- pattern matching (term)
- `cond` (object/method)

### Lesson 153 - Functors as Structure-Preserving Transformations
- functor (term)

### Lesson 154 - Monads as Computational Composition
- monad (term)

### Lesson 156 - Programs as Functions
- denotation (term)
- referential transparency (term)

### Lesson 157 - Programs as Proofs
- Curry-Howard correspondence (term)
- uninhabited type (term)

### Lesson 159 - Syntax vs Semantics
- syntax (term)
- semantics (term)

### Lesson 160 - Grammars
- grammar (term)
- terminal (term)
- non-terminal (term)
- production rule (term)

### Lesson 161 - Parsing
- parse tree (term)

### Lesson 162 - Abstract Syntax Trees
- abstract syntax tree (AST) (term)

### Lesson 163 - Interpreters
- interpreter (term)

### Lesson 164 - Environments
- environment (term)
- shadowing (term) — also where the canonical, corrected `lookup`/`lookup-at` now lives (fixes a latent first-match-wins bug in Lesson 154's original)

### Lesson 165 - Closures
- closure (term)
- lexical scope (term)

### Lesson 166 - Evaluation Strategies
- eager evaluation (term)
- thunk (term)
- call-by-name (term)

### Lesson 167 - Mutable State
- store (term)
- location (term)

### Lesson 168 - References
- alias (term)

### Lesson 169 - Continuations
- continuation (term)
- continuation-passing style (CPS) (term)

### Lesson 170 - Exceptions
- non-local control flow (term)
- error continuation (term)

### Lesson 171 - Iterators and Generators
- generator (term)
- suspension/resumption (term)

### Lesson 172 - Coroutines
- coroutine (term)

### Lesson 173 - Type Systems
- static type checking (term)
- type environment (term)

### Lesson 174 - Type Inference
- type inference (term)
- constraint (term, PL sense — distinct from Lesson 1's "constraint")

### Lesson 175 - Parametric Polymorphism
- parametric polymorphism (term)
- type variable (term)

### Lesson 176 - Subtyping
- structural typing (term)
- nominal typing (term)

### Lesson 178 - Operational Semantics
- operational semantics (term)
- transition rule (term)

### Lesson 179 - Small-Step vs Big-Step Semantics
- small-step semantics (term)
- reduction (term)

### Lesson 180 - Program Equivalence
- program equivalence (term)

### Lesson 181 - Static Analysis
- static analysis (term)
- free variable (term)

### Lesson 182 - Interpreters and Compilers
- compilation (term)
- bytecode (term)
- virtual machine (VM) (term)

### Lesson 184 - Bits and Information
- bit (term)
- radix (base) (term)
- positional notation (term)
- digit-expansion reconstruction (Horner's method) (term)
- bits of information (term)

### Lesson 185 - Boolean Circuits
- logic gate (term)
- NAND gate (term)
- functional completeness (universal gate) (term)
- circuit (term)

### Lesson 186 - Binary Arithmetic
- half-adder (term)
- carry (term)
- full-adder (term)
- ripple-carry addition (term)
- half-subtractor (term)
- borrow (term)

### Lesson 187 - Integer Representation
- word width (fixed-width representation) (term)
- overflow (term)
- unsigned integer (term)
- sign-magnitude representation (term)

### Lesson 188 - Two's Complement
- ones' complement (term)
- two's complement (term)

### Lesson 189 - Floating-Point Representation
- fractional binary expansion (term)
- normalized form (term)
- exponent (term)
- mantissa (significand) (term)
- implicit leading bit (term)
- rounding error (approximation error) (term)

### Lesson 190 - Text Encoding
- code point (term)
- fixed-width character encoding (term)
- variable-width encoding (term)
- continuation byte (term)
- `int` (object/method)
- `char` (object/method)
- character literal (`\a`, `\space`) (object/method)

### Lesson 191 - Memory as an Address Space
- address (term)
- byte (term)
- endianness (big-endian / little-endian) (term)
- contiguous allocation (term)

### Lesson 192 - Pointers and References
- pointer (term)
- dereference (term)
- null pointer (term)
- pointer arithmetic (term)

### Lesson 193 - Stack Frames
- stack pointer (term)
- stack frame (term)

### Lesson 194 - Heap Allocation
- heap (term)
- free list (term)
- first-fit (term)
- external fragmentation (term)
- coalescing (term)

### Lesson 195 - Assembly
- register (term)
- instruction (term)
- program counter (PC) (term)
- jump (term)

### Lesson 196 - Instruction Sets
- addressing mode (term)
- register-indirect addressing (term)
- condition flag (term)

### Lesson 197 - CPU Execution
- fetch (term)
- decode (term)
- execute (term)
- fetch-decode-execute cycle (term)

### Lesson 198 - Caches
- cache (term)
- cache hit (term)
- cache miss (term)
- temporal locality (term)
- spatial locality (term)
- cache line (block) (term)
- direct-mapped (term)
- memory hierarchy (term)

### Lesson 199 - Branch Prediction
- branch (term)
- taken / not-taken (term)
- branch prediction (term)
- misprediction (misprediction penalty) (term)

### Lesson 200 - Pipelines
- pipeline (term)
- pipeline stage (term)
- throughput (term)
- pipeline flush (term)
- control hazard (term)
- data hazard (term)

### Lesson 201 - Virtual Memory
- virtual address (term)
- physical address (term)
- page / frame (term)
- page table (term)
- page fault (term)

### Lesson 202 - Processes
- process (term)
- process control block (PCB) (term)
- PID (process ID) (term)
- process state (term)

### Lesson 203 - System Calls
- kernel (term)
- user mode / kernel mode (term)
- system call (syscall) (term)
- trap (term)

### Lesson 204 - Compilers and Optimization
- compiler optimization (term)
- constant folding (term)
- dead code elimination (term)
- common subexpression elimination (CSE) (term)

### Lesson 205 - Undefined Behavior
- undefined behavior (term)
- well-defined behavior (term)

### Lesson 206 - Performance Models
- performance model (term)
- cache thrashing (term)
- memory footprint (term)

### Lesson 208 - Operating-System Abstractions
- abstraction (term)
- file (term)
- directory (term)
- device (term)
- leaky abstraction (term)

### Lesson 209 - Processes vs Threads
- thread (term)
- thread control block (TCB) (term)

### Lesson 210 - Scheduling
- scheduling (term)
- round-robin (term)
- priority scheduling (term)
- starvation (term)

### Lesson 211 - Context Switching
- context switch (term)
- context-switch overhead (term)
- cache pollution (term)

### Lesson 212 - Race Conditions
- race condition (term)
- interleaving (term)
- critical section (term)
- lost update (term)
