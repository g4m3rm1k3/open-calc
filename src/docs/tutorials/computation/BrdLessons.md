# 5. Core Curriculum

## Section I — Computational Thinking and Mathematical Language

### Lessons 1–18

### 1. What Is a Computational Problem?

Define inputs, outputs, transformations, constraints, state, and correctness. Show how vague real-world questions become precise computational specifications.

### 2. Expressions, Values, and Evaluation

Introduce the idea that computation is transformation of expressions into values. Trace arithmetic expressions manually before introducing language syntax.

### 3. Names, Bindings, and Environments

Explain variables as bindings rather than magical boxes. Introduce environments and show how name lookup works.

### 4. Functions as Transformations

Define functions mathematically and computationally. Establish input/output behavior, composition, and why functions are the fundamental abstraction of programming.

### 5. Function Composition

Derive composition from substitution and show how complex behavior can be built from simple functions.

### 6. Equality and Substitution

Distinguish mathematical equality, value equality, identity, and assignment. Establish substitution as a foundational reasoning technique.

### 7. Predicates and Boolean Logic

Build propositions from AND, OR, NOT, implication, and equivalence, then translate them directly into code.

### 8. Truth Tables and Logical Equivalence

Derive truth tables and use them to simplify conditions.

### 9. Quantifiers

Introduce “for all” and “there exists,” then translate quantified statements into loops, searches, validations, and tests.

### 10. Sets as Computational Collections

Introduce membership, union, intersection, difference, Cartesian products, and subsets.

### 11. Relations

Define relations as sets of ordered pairs and connect them to databases, graphs, mappings, dependencies, and program behavior.

### 12. Functions as Special Relations

Derive the mathematical definition of a function and explain total/partial, injective, surjective, and bijective functions.

### 13. Algebraic Manipulation

Teach rearrangement, factoring, substitution, cancellation, and solving equations as computational tools rather than school exercises.

### 14. Inductive Thinking

Introduce the idea of establishing a property for an initial case and proving that the property propagates.

### 15. Mathematical Induction

Derive induction formally and immediately apply it to recursive programs and data structures.

### 16. Invariants

Introduce loop invariants and state invariants as “facts that remain true while computation changes everything else.”

### 17. Proof by Cases and Contradiction

Teach decomposition of a problem into exhaustive cases and derive contradiction as a proof strategy.

### 18. The Computational Proof Mindset

Combine specification, examples, invariants, induction, counterexamples, and testing into one problem-solving methodology.

---

# Section II — Recursion, Data, and the Little-Schemer Mindset

### Lessons 19–40

### 19. Recursive Definitions

Define natural numbers, lists, and trees recursively.

### 20. Recursive Functions

Derive recursive programs directly from recursive data definitions.

### 21. Structural Recursion

Show why the shape of the data naturally determines the shape of the algorithm.

### 22. Base Cases and Progress

Explain termination and why every recursive algorithm needs a measurable reduction.

### 23. Tracing Recursive Evaluation

Manually execute recursive programs and draw evaluation trees.

### 24. Lists from First Principles

Construct lists conceptually using empty-list and pair/cons operations.

### 25. Map

Derive `map` from the definition of a list transformation.

### 26. Filter

Derive filtering from predicates and structural recursion.

### 27. Fold / Reduce

Derive accumulation and show that many apparently different algorithms are folds.

### 28. Append and Reverse

Implement both naïve and accumulator-based versions and derive their complexity.

### 29. Nested Lists

Generalize structural recursion to arbitrarily nested data.

### 30. Trees as Recursive Data

Derive trees from the same principles used for lists.

### 31. Tree Traversals

Derive preorder, inorder, and postorder traversal.

### 32. Generators and Search

Relate recursive enumeration to search spaces.

### 33. Backtracking

Derive backtracking as controlled exploration of a recursive decision tree.

### 34. Accumulators

Show how recursive state can be converted into explicit parameters.

### 35. Tail Recursion

Explain why some recursive programs can execute with constant stack space.

### 36. Mutual Recursion

Introduce mutually defined computations.

### 37. Recursion vs Iteration

Show that iteration and recursion can express the same computations while providing different reasoning advantages.

### 38. Memoization

Derive memoization by identifying repeated subproblems.

### 39. Dynamic Programming from Recursion

Transform recursive definitions into bottom-up computations.

### 40. The Recursive Problem-Solving Method

Give the learner a reusable procedure for deriving recursive solutions from data definitions.

---

# Section III — Algebra for Programmers

### Lessons 41–58

### 41. Variables and Symbolic Expressions

Treat algebraic expressions as manipulable computational objects.

### 42. Polynomials

Represent and evaluate polynomials efficiently.

### 43. Exponents and Logarithms

Derive exponent laws and logarithms and connect them to algorithmic growth.

### 44. Summation Notation

Teach sigma notation and translating loops into mathematical sums.

### 45. Product Notation

Connect products to factorials, permutations, probability, and combinatorics.

### 46. Arithmetic Series

Derive common sums instead of memorizing them.

### 47. Geometric Series

Derive geometric sums and connect them to recursion and complexity.

### 48. Recurrences

Translate recursive algorithms into recurrence equations.

### 49. Solving Simple Recurrences

Derive closed forms by expansion, substitution, and pattern recognition.

### 50. Growth Rates

Compare constant, logarithmic, linear, polynomial, exponential, and factorial growth.

### 51. Big-O

Derive asymptotic notation from the idea of ignoring lower-order behavior.

### 52. Big-Theta and Big-Omega

Distinguish upper, lower, and tight bounds.

### 53. Amortized Analysis

Explain why occasional expensive operations can still produce cheap average costs.

### 54. Modular Arithmetic

Build arithmetic modulo `n` from equivalence classes.

### 55. Greatest Common Divisor

Derive Euclid's algorithm from the mathematical identity behind it.

### 56. Extended Euclidean Algorithm

Derive coefficients and connect them to modular inverses.

### 57. Prime Numbers

Explore divisibility, factorization, and computational consequences.

### 58. Algebraic Reasoning in Code

Turn symbolic identities into optimizations, tests, and algorithm derivations.

---

# Section IV — Combinatorics and Discrete Mathematics

### Lessons 59–82

### 59. Counting Without Listing

Introduce the fundamental counting principle.

### 60. Addition and Multiplication Rules

Derive the two basic counting rules.

### 61. Permutations

Derive factorial counting.

### 62. Combinations

Derive binomial coefficients.

### 63. Pascal's Triangle

Derive its recurrence and computational interpretation.

### 64. Binomial Theorem

Connect combinations to polynomial expansion.

### 65. Inclusion-Exclusion

Derive correction for overlapping counts.

### 66. Pigeonhole Principle

Introduce existence proofs with direct algorithmic applications.

### 67. Stars and Bars

Derive constrained distribution counts.

### 68. Counting Recursive Structures

Use recurrence relations to count trees, strings, and paths.

### 69. Generating Functions — Motivation

Introduce them as algebraic representations of sequences.

### 70. Generating Functions — Basic Manipulation

Derive coefficient extraction and recurrence solving.

### 71. Discrete Probability

Introduce sample spaces, events, and probability axioms.

### 72. Conditional Probability

Derive probability after incorporating information.

### 73. Independence

Distinguish independence from correlation and conditional dependence.

### 74. Bayes' Rule

Derive Bayes from conditional probability.

### 75. Expected Value

Define expectation and derive linearity.

### 76. Variance

Derive variance and connect it to uncertainty.

### 77. Random Variables

Introduce discrete random variables as functions over outcomes.

### 78. Randomized Algorithms

Use probability as an algorithmic resource.

### 79. Birthday Paradox

Use an apparently surprising result to teach probabilistic reasoning.

### 80. Markov Chains

Introduce state transitions governed by probabilities.

### 81. Monte Carlo and Las Vegas Algorithms

Distinguish probabilistic approximation from probabilistic runtime.

### 82. Probabilistic Problem Solving

Develop the ability to turn uncertainty into mathematics and then code.

---

# Section V — Data Structures

### Lessons 83–108

### 83. Why Data Structures Exist

Connect representation to operation cost.

### 84. Arrays and Contiguous Memory

Derive constant-time indexing.

### 85. Linked Structures

Derive linked lists from references and recursive data.

### 86. Stacks

Derive LIFO behavior and applications.

### 87. Queues

Derive FIFO behavior.

### 88. Deques

Unify stack and queue operations.

### 89. Hash Tables

Derive hashing, collisions, buckets, and expected complexity.

### 90. Sets and Maps

Understand abstract data types independently of implementations.

### 91. Binary Search

Derive search from ordered structure.

### 92. Binary Search Trees

Derive search trees from recursive ordering constraints.

### 93. Tree Invariants

Prove the properties that make BST operations correct.

### 94. Heaps

Derive priority queues from partial ordering.

### 95. Heap Construction

Compare incremental construction and bottom-up heapification.

### 96. Priority Queues

Explore scheduling, graph algorithms, event simulation, and optimization.

### 97. Balanced Trees

Introduce why unbalanced trees can collapse into linear structures.

### 98. AVL Trees

Derive balancing rotations from height constraints.

### 99. Red-Black Trees

Understand the invariant-based approach to approximate balance.

### 100. B-Trees

Derive multiway trees for storage systems.

### 101. Tries

Derive prefix trees from strings and hierarchical keys.

### 102. Disjoint Sets

Build union-find from equivalence classes.

### 103. Path Compression

Derive why union-find becomes almost constant-time.

### 104. Persistent Data Structures

Introduce immutable structures and structural sharing.

### 105. Structural Sharing

Connect functional programming to efficient immutable data.

### 106. Representation Invariants

Formalize the contract between an abstract data type and its implementation.

### 107. Choosing Data Structures

Teach selection by operations, workload, constraints, and invariants.

### 108. Designing a Data Structure

Have the learner derive a new data structure from required operations, built with minimal scaffolding from this section's tools alone; includes a deliberately planted inconsistency in a companion implementation for the learner to find before it's revealed.

---

# Section VI — Algorithms and Algorithmic Problem Solving

### Lessons 109–138

### 109. What Makes an Algorithm?

Define finiteness, determinism, correctness, and resource usage.

### 110. Specifications Before Algorithms

Turn natural-language problems into precise contracts.

### 111. Brute Force

Establish exhaustive search as a baseline.

### 112. Divide and Conquer

Derive recursive decomposition.

### 113. Merge Sort

Derive the algorithm and its recurrence.

### 114. Quick Sort

Derive partitioning and analyze average/worst cases.

### 115. Selection Algorithms

Find order statistics without fully sorting.

### 116. Lower Bounds

Understand when an algorithm cannot asymptotically improve without changing assumptions.

### 117. Greedy Algorithms

Introduce local decisions and the proof obligations required to justify them.

### 118. Exchange Arguments

Derive a common greedy proof technique.

### 119. Dynamic Programming

Develop the general recipe: state, transition, base case, order.

### 120. Longest Common Subsequence

Use a complete DP derivation.

### 121. Knapsack

Compare formulations and understand state design.

### 122. Interval Problems

Derive greedy scheduling and related algorithms.

### 123. Graphs as Computational Objects

Introduce vertices, edges, directedness, weights, and representations.

### 124. Breadth-First Search

Derive BFS from frontier expansion.

### 125. Depth-First Search

Derive DFS from recursive exploration.

### 126. DFS Invariants and Timestamps

Use discovery/finish times to reason about graph structure.

### 127. Topological Sorting

Derive ordering from dependency constraints.

### 128. Connected Components

Derive connectivity algorithms.

### 129. Shortest Paths

Define the shortest-path problem and compare assumptions.

### 130. Dijkstra's Algorithm

Derive it from a greedy invariant.

### 131. Bellman-Ford

Derive relaxation and negative-edge handling.

### 132. Minimum Spanning Trees

Define the optimization problem.

### 133. Kruskal and Prim

Derive both approaches and compare their underlying ideas.

### 134. Network Flow

Introduce flow as conservation over a graph.

### 135. Matching

Connect matching to flow and combinatorial optimization.

### 136. Constraint Satisfaction

Frame problems as variables, domains, and constraints.

### 137. Search, Pruning, and Heuristics

Derive ways to shrink enormous search spaces.

### 138. Algorithm Design Workshop

Teach a repeatable process for inventing algorithms for unfamiliar problems, applied by the learner with minimal scaffolding from this section's tools alone; includes a deliberately planted inconsistency in a companion algorithm for the learner to find before it's revealed.

---

# Section VII — Mathematical Structures Behind Programming

### Lessons 139–158

### 139. Abstraction

Understand abstraction as preserving relevant structure while discarding irrelevant detail.

### 140. Algebraic Structures

Introduce operations, closure, identity, inverses, and associativity.

### 141. Monoids

Show why concatenation, addition, and reduction share one structure.

### 142. Semirings

Connect arithmetic-like structures to dynamic programming and path problems.

### 143. Groups

Introduce symmetry and reversible operations.

### 144. Rings and Fields

Establish the mathematical environments behind arithmetic and algebraic computation.

### 145. Equivalence Relations

Derive quotienting and canonical representations.

### 146. Partial Orders

Introduce ordering without requiring every pair to be comparable.

### 147. Lattices

Connect partial orders to program analysis and information ordering.

### 148. Graphs as Relations

Unify graph theory with the relational perspective.

### 149. Trees as Recursive Algebras

Treat recursive data structures algebraically.

### 150. Algebraic Data Types

Connect sum/product types to mathematical constructions.

### 151. Pattern Matching

Derive pattern matching from data decomposition.

### 152. Folds as Algebra

Explain why fold operations follow from monoid-like structure.

### 153. Functors as Structure-Preserving Transformations

Introduce the practical idea without requiring category theory first.

### 154. Monads as Computational Composition

Explain the programming problem monads solve before formal abstraction.

### 155. Types as Sets of Values

Build a mathematical model of types.

### 156. Programs as Functions

Explore denotational thinking.

### 157. Programs as Proofs

Introduce the Curry-Howard correspondence conceptually.

### 158. Abstraction as a Problem-Solving Tool

Teach when mathematical abstraction reduces complexity instead of adding it, then have the learner apply it with minimal scaffolding from this section's tools alone; includes a deliberately planted inconsistency in a companion abstraction for the learner to find before it's revealed.

---

# Section VIII — Programming Languages and Semantics

### Lessons 159–183

### 159. Syntax vs Semantics

Separate what programs look like from what they mean.

### 160. Grammars

Define formal syntax.

### 161. Parsing

Turn text into structured syntax.

### 162. Abstract Syntax Trees

Derive ASTs from grammars.

### 163. Interpreters

Build the smallest useful interpreter.

### 164. Environments

Model variable lookup formally.

### 165. Closures

Derive lexical scope and closures.

### 166. Evaluation Strategies

Compare eager, lazy, and call-by-name evaluation.

### 167. Mutable State

Introduce stores separately from environments.

### 168. References

Model aliases and mutable data.

### 169. Continuations

Derive the “rest of the computation.”

### 170. Exceptions

Understand non-local control flow.

### 171. Iterators and Generators

Connect suspension/resumption to computation.

### 172. Coroutines

Generalize control transfer.

### 173. Type Systems

Explain types as constraints on programs.

### 174. Type Inference

Derive inference from constraints.

### 175. Parametric Polymorphism

Explain generic code mathematically.

### 176. Subtyping

Introduce structural and nominal relationships.

### 177. Algebraic Data Types

Build expressive typed representations.

### 178. Operational Semantics

Define execution as mathematical state transitions.

### 179. Small-Step vs Big-Step Semantics

Compare two ways to formalize execution.

### 180. Program Equivalence

Ask when two different programs compute the same thing.

### 181. Static Analysis

Derive useful information without executing the program.

### 182. Interpreters and Compilers

Explain the spectrum from direct execution to translation.

### 183. Build a Small Language

Integrate lexer, parser, AST, evaluator, environments, functions, and types, built by the learner with minimal scaffolding from this section's tools alone; includes a deliberately planted inconsistency in a companion interpreter for the learner to find before it's revealed.

---

# Section IX — Computer Architecture and Representation

### Lessons 184–207

### 184. Bits and Information

Define binary representation.

### 185. Boolean Circuits

Build computation from logic gates.

### 186. Binary Arithmetic

Derive addition and subtraction circuits.

### 187. Integer Representation

Explore unsigned and signed integers.

### 188. Two's Complement

Derive negative integer representation.

### 189. Floating-Point Representation

Explain approximation, exponent, mantissa, and error.

### 190. Text Encoding

Derive character encoding and Unicode concepts.

### 191. Memory as an Address Space

Build a conceptual memory model.

### 192. Pointers and References

Connect addresses to programming abstractions.

### 193. Stack Frames

Derive function-call execution.

### 194. Heap Allocation

Explain dynamic memory.

### 195. Assembly

Translate simple high-level constructs into machine instructions.

### 196. Instruction Sets

Understand registers, operations, memory access, and control flow.

### 197. CPU Execution

Trace fetch/decode/execute.

### 198. Caches

Derive locality and why memory hierarchy exists.

### 199. Branch Prediction

Explain why control flow has performance consequences.

### 200. Pipelines

Understand overlapping instruction execution.

### 201. Virtual Memory

Derive address translation and isolation.

### 202. Processes

Explain a running program as an operating-system-managed abstraction.

### 203. System Calls

Cross the boundary between application and kernel.

### 204. Compilers and Optimization

Show how source becomes efficient machine code.

### 205. Undefined Behavior

Explain why language semantics and hardware behavior differ.

### 206. Performance Models

Build realistic mental models for runtime and memory.

### 207. Systems-Level Debugging

Teach the learner to reason across source, runtime, memory, assembly, and hardware, working with minimal scaffolding from this section's tools alone; includes a deliberately planted inconsistency for the learner to find before it's revealed.

---

# Section X — Operating Systems, Concurrency, and Systems

### Lessons 208–230

### 208. Operating-System Abstractions

Understand processes, files, memory, and devices as abstractions.

### 209. Processes vs Threads

Derive the distinction.

### 210. Scheduling

Explore CPU allocation policies.

### 211. Context Switching

Understand the cost of concurrency.

### 212. Race Conditions

Derive races from interleaving operations.

### 213. Locks and Mutual Exclusion

Build synchronization primitives conceptually.

### 214. Deadlocks

Derive the four necessary conditions.

### 215. Semaphores

Introduce counting-based synchronization.

### 216. Condition Variables

Coordinate threads around predicates.

### 217. Atomics

Introduce indivisible operations.

### 218. Memory Models

Explain why concurrent programs cannot always assume sequential execution.

### 219. Lock-Free Thinking

Introduce atomic data structures and progress guarantees.

### 220. Filesystems

Model persistent data as names, metadata, blocks, and operations.

### 221. Databases

Explain persistent structured data and transactions.

### 222. Transactions

Derive atomicity and consistency requirements.

### 223. Indexes

Derive why databases use trees and hash structures.

### 224. Logging and Recovery

Explain how systems survive crashes.

### 225. Networking Fundamentals

Model communication as messages over unreliable infrastructure.

### 226. Sockets

Understand endpoints, connections, and byte streams.

### 227. Protocols

Derive the need for explicit communication rules.

### 228. Distributed State

Explain why shared state becomes difficult across machines.

### 229. Failure and Partial Failure

Introduce timeouts, retries, duplication, and lost messages.

### 230. Systems Design Problem-Solving

Teach decomposition of large systems into state, interfaces, invariants, failure modes, and resource constraints, applied by the learner with minimal scaffolding from this section's tools alone; includes a deliberately planted inconsistency in a companion system design for the learner to find before it's revealed.

---

# Section XI — Linear Algebra, Geometry, and Continuous Mathematics

### Lessons 231–252

### 231. Coordinate Systems

Build geometry from coordinates.

### 232. Vectors

Define vectors as mathematical and computational objects.

### 233. Vector Operations

Derive addition, scalar multiplication, dot products, and projections.

### 234. Matrices

Introduce matrices as transformations and structured data.

### 235. Matrix Multiplication

Derive it from composition of linear transformations.

### 236. Linear Transformations

Connect algebraic and geometric interpretations.

### 237. Change of Basis

Explain coordinate systems and representations.

### 238. Determinants

Derive geometric meaning.

### 239. Inverses

Understand when transformations can be reversed.

### 240. Eigenvalues and Eigenvectors

Explain invariant directions and their computational uses.

### 241. Systems of Linear Equations

Derive Gaussian elimination.

### 242. Numerical Stability

Explain why mathematically equivalent computations can behave differently on machines.

### 243. Affine Geometry

Introduce translations, rotations, scaling, and homogeneous coordinates.

### 244. 2D Transformations

Apply transformations to graphics and geometry.

### 245. 3D Transformations

Build the foundation for graphics, robotics, CAD, and simulation.

### 246. Derivatives

Introduce rates of change from first principles.

### 247. Gradients

Generalize derivatives to many variables.

### 248. Integrals

Introduce accumulation.

### 249. Optimization

Derive local optimization using gradients.

### 250. Numerical Optimization

Connect optimization mathematics to executable algorithms.

### 251. Computational Geometry

Apply geometric reasoning to intersections, distances, hulls, and spatial structures.

### 252. Mathematics of Simulation

Connect differential equations, numerical approximation, state updates, and computational models, built by the learner with minimal scaffolding from this section's tools alone; includes a deliberately planted inconsistency in a companion simulation for the learner to find before it's revealed.

---

# Section XII — Computability, Complexity, and the Limits of Algorithms

### Lessons 253–272

### 253. What Does “Computable” Mean?

Introduce formal models of computation.

### 254. Finite Automata

Derive state machines.

### 255. Regular Languages

Connect automata to pattern matching and lexical analysis.

### 256. Regular Expressions

Explain their mathematical foundation and practical limitations.

### 257. Context-Free Grammars

Build a formal model for nested syntax.

### 258. Pushdown Automata

Connect stacks to context-free computation.

### 259. Turing Machines

Introduce the general model of algorithmic computation.

### 260. Universal Computation

Explain how one machine can simulate another.

### 261. The Halting Problem

Derive a problem that no general algorithm can solve.

### 262. Reductions

Develop the technique for transferring difficulty between problems.

### 263. Complexity Classes

Introduce time and space as resources.

### 264. P and NP

Explain tractable verification versus tractable search.

### 265. NP-Completeness

Derive why many apparently unrelated problems share a common difficulty.

### 266. Approximation Algorithms

Explore what to do when exact optimization is computationally expensive.

### 267. Parameterized Thinking

Ask which input dimensions actually cause difficulty.

### 268. Online Algorithms

Solve problems without knowing future input.

### 269. Streaming Algorithms

Compute with severe memory constraints.

### 270. Randomized Complexity

Use probability to change computational tradeoffs.

### 271. Information-Theoretic Limits

Understand lower bounds through information.

### 272. The Limits of Problem Solving

Teach the crucial distinction between:

* “I don't know how to solve this,”
* “we haven't found an efficient solution,” and
* “no general algorithm can solve this.”

Then have the learner classify a set of unfamiliar problems into these three categories, including one a collaborator has deliberately mis-classified for the learner to catch.

---

# Section XIII — Software Engineering as Applied Computer Science

### Lessons 273–292

### 273. Requirements as Specifications

Turn ambiguous requests into precise behavior.

### 274. Interfaces

Design contracts between components.

### 275. Modularity

Control complexity through boundaries.

### 276. Dependency Management

Understand directed dependency graphs.

### 277. Testing as Specification

Connect tests to properties and invariants.

### 278. Property-Based Testing

Generate examples from mathematical properties.

### 279. Debugging as Hypothesis Testing

Treat debugging as scientific reasoning.

### 280. Refactoring

Change representation while preserving behavior.

### 281. API Design

Design abstractions around stable contracts.

### 282. Error Handling

Model failure explicitly.

### 283. Observability

Understand systems through logs, metrics, traces, and state.

### 284. Performance Engineering

Measure before optimizing.

### 285. Profiling

Locate actual computational costs.

### 286. Complexity in Production

Connect asymptotic reasoning to real workloads.

### 287. Architecture

Decompose large systems into interacting components.

### 288. Technical Debt

Understand why local convenience can create global complexity.

### 289. Documentation as a Formal Interface

Write explanations that preserve the model needed to use a system correctly.

### 290. Code Review as Proof Review

Review correctness, invariants, assumptions, and failure modes.

### 291. Designing for Change

Identify which assumptions are likely to change and isolate them.

### 292. Engineering Judgment

Learn when simplicity, correctness, performance, flexibility, or reliability should dominate, then evaluate a design a collaborator has already made — including one deliberately poor tradeoff — and identify and justify the fix.

---

# Section XIV — Integration and Advanced Problem Solving

### Lessons 293–312

### 293. Read an Unfamiliar Problem

Extract nouns, operations, constraints, and invariants.

### 294. Start With the Mathematical Model

Translate the problem into sets, functions, graphs, states, equations, or optimization.

### 295. Build the Simplest Correct Solution

Use brute force as a reference implementation.

### 296. Identify the Bottleneck

Measure or mathematically analyze where the solution becomes infeasible.

### 297. Search for Structure

Look for ordering, symmetry, repetition, locality, independence, monotonicity, or conservation.

### 298. Choose the Representation

Derive the data structure from the required operations.

### 299. Choose the Algorithm

Map structure and constraints to an algorithmic strategy.

### 300. Prove the Algorithm

Use invariants, induction, contradiction, exchange arguments, or exhaustive reasoning.

### 301. Analyze Complexity

Determine time, space, communication, and other relevant resources.

### 302. Implement

Translate the mathematical algorithm into a language.

### 303. Test

Construct ordinary, boundary, adversarial, randomized, and property-based tests.

### 304. Debug

Use observations to eliminate hypotheses.

### 305. Optimize

Only optimize after identifying a real bottleneck.

### 306. Generalize

Ask which assumptions can be removed.

### 307. Derive an Alternative

Implement the same idea using another representation or algorithm.

### 308. Explain It

Teach the solution without relying on memorized terminology.

### 309. Reconstruct From Memory

Close the book and derive the solution from first principles.

### 310. Transfer Across Languages

Implement the same algorithm in several radically different programming paradigms.

### 311. Transfer Across Domains

Apply the same mathematical structure to a new problem.

### 312. The Final Capstone: Solve Something You Have Never Seen

The learner receives an unfamiliar computational problem and must independently model, derive, prove, implement, test, and analyze a solution.

---
