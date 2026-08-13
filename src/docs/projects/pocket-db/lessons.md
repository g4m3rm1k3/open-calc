# Lesson Purpose

## Purpose

Teach software engineering, computer science, mathematics, data science, systems programming, databases, statistics, algorithms, and applied machine learning through the incremental construction of **MiniDB**: a self-rolled, embedded C++ database engine with a first-class Python API and data-science tooling.

The curriculum should use the MiniDB BRD as its continuous engineering context. Every technical concept should connect to a concrete requirement, architectural decision, implementation task, experiment, benchmark, test, or user-facing capability from the BRD.

The learner should progressively develop the ability to:

* understand a problem mathematically
* model it computationally
* design an algorithm
* choose appropriate data structures
* implement the solution in C++
* expose it through Python
* test it
* benchmark it
* reason about correctness
* reason about complexity
* analyze data produced by the system
* visualize results
* document decisions
* debug failures
* optimize performance
* understand the underlying computer architecture
* communicate technical tradeoffs
* ship maintainable software

The lessons should therefore teach **theory and implementation together**, with MiniDB providing the recurring practical context.

---

# Curriculum Domains

## 1. Software Engineering

Teach:

* requirements engineering
* product requirements
* business requirements
* user stories
* acceptance criteria
* Agile development
* vertical slices
* iterative development
* MVP definition
* product roadmaps
* architecture
* architectural decision records
* technical debt
* refactoring
* modularity
* separation of concerns
* abstraction
* encapsulation
* interfaces
* dependency management
* API design
* backwards compatibility
* semantic versioning
* library design
* error handling
* exception safety
* resource ownership
* RAII
* code review
* debugging
* documentation
* maintainability
* observability
* logging
* metrics
* profiling
* release engineering
* CI/CD
* reproducible builds
* packaging
* dependency management
* cross-platform development
* technical communication

MiniDB applications:

* translating the BRD into engineering tasks
* designing the repository
* defining engine interfaces
* designing the C++ API
* designing the Python API
* implementing vertical slices
* maintaining architectural boundaries
* writing acceptance tests
* evolving the database without breaking users

---

# 2. Computer Science Fundamentals

Teach:

* abstraction
* computation
* algorithms
* data structures
* state
* invariants
* recursion
* iteration
* memory
* processes
* threads
* concurrency
* parallelism
* synchronization
* scheduling
* operating-system concepts
* filesystems
* system calls
* virtual memory
* caches
* I/O
* serialization
* binary representations
* networking concepts where relevant
* computational models
* determinism
* nondeterminism

MiniDB applications:

* database state
* page state
* transaction state
* process crashes
* memory management
* concurrent queries
* disk I/O
* buffer pools
* serialization
* binary database files

---

# 3. C++ Programming

Teach:

* syntax and semantics
* types
* value categories
* references
* pointers
* const correctness
* structs
* classes
* constructors
* destructors
* RAII
* ownership
* smart pointers
* move semantics
* copy semantics
* templates
* generic programming
* concepts
* iterators
* ranges
* lambdas
* operator overloading
* inheritance
* virtual functions
* polymorphism
* type traits
* allocators
* memory management
* exceptions
* error handling
* concurrency primitives
* atomics
* standard library containers
* standard algorithms
* C++ modules where appropriate
* C++20/23 features
* ABI considerations
* performance-oriented C++

MiniDB applications:

* page objects
* tuples
* schemas
* indexes
* transactions
* query operators
* execution pipelines
* buffer managers
* typed C++ queries
* zero-copy views

---

# 4. Python Programming

Teach:

* Python fundamentals
* functions
* classes
* modules
* packages
* iterators
* generators
* decorators
* context managers
* exceptions
* typing
* dataclasses
* protocols
* APIs
* package design
* virtual environments
* packaging
* testing
* performance considerations
* Python/C++ boundaries

MiniDB applications:

* Python database API
* query builder
* DataFrame API
* transaction context managers
* profiling API
* notebook API
* database administration tools

---

# 5. C++ / Python Interoperability

Teach:

* native extensions
* Python C APIs conceptually
* binding libraries
* ABI
* memory ownership across languages
* object lifetime
* type conversion
* exception translation
* zero-copy interoperability
* buffer protocols
* Arrow interoperability
* NumPy interoperability
* pandas interoperability
* performance costs of crossing language boundaries
* GIL considerations
* native parallelism
* packaging compiled extensions

MiniDB applications:

```text
Python
   ↓
Python binding
   ↓
C++
   ↓
Database engine
```

Teach why the hot path must remain in C++ while Python provides the high-level interface.

---

# 6. Data Structures

Teach:

* arrays
* dynamic arrays
* linked lists
* stacks
* queues
* hash tables
* sets
* maps
* trees
* binary trees
* balanced trees
* B-trees
* B+ trees
* heaps
* graphs
* tries
* bitmaps
* bloom filters
* priority queues
* ring buffers
* column vectors
* selection vectors
* compressed representations

MiniDB applications:

* B+Tree indexes
* hash indexes
* buffer replacement structures
* transaction tables
* catalogs
* query plans
* hash joins
* aggregation tables

---

# 7. Algorithms

Teach:

* algorithm design
* correctness
* invariants
* asymptotic complexity
* Big-O
* Big-Theta
* Big-Omega
* recursion
* divide and conquer
* binary search
* sorting
* hashing
* tree algorithms
* graph algorithms
* dynamic programming
* greedy algorithms
* selection algorithms
* aggregation algorithms
* join algorithms
* indexing algorithms
* external-memory algorithms
* streaming algorithms
* approximate algorithms
* probabilistic algorithms

MiniDB applications:

* B+Tree insertion/search
* sorting
* hash joins
* merge joins
* aggregation
* query optimization
* approximate statistics
* cardinality estimation

---

# 8. Mathematics for Computer Science

Teach:

* logic
* propositions
* predicates
* sets
* relations
* functions
* proof techniques
* induction
* invariants
* combinatorics
* discrete mathematics
* graphs
* probability
* recurrence relations
* asymptotic analysis
* mathematical notation
* Boolean algebra
* modular arithmetic

MiniDB applications:

* proving data-structure invariants
* transaction correctness
* index correctness
* query semantics
* complexity analysis
* probabilistic data structures

---

# 9. Mathematics for Data Science

Teach:

## Linear algebra

* vectors
* matrices
* matrix multiplication
* dot products
* norms
* projections
* linear transformations
* eigenvalues
* eigenvectors
* decompositions
* rank
* orthogonality
* covariance matrices
* dimensionality reduction

## Calculus

* functions
* limits
* derivatives
* partial derivatives
* gradients
* directional derivatives
* chain rule
* optimization
* integration
* multivariable calculus

## Probability

* sample spaces
* events
* conditional probability
* independence
* Bayes' theorem
* random variables
* expectation
* variance
* covariance
* distributions
* joint distributions
* marginal distributions
* conditional distributions
* law of large numbers
* central limit theorem

## Optimization

* objective functions
* loss functions
* convexity
* gradient descent
* stochastic gradient descent
* constrained optimization
* regularization

MiniDB applications:

* statistical aggregates
* covariance
* regression
* ML features
* vector search
* embeddings
* query cost estimation
* approximate algorithms
* statistical query optimization

---

# 10. Statistics

Teach:

* descriptive statistics
* populations
* samples
* sampling
* bias
* variance
* mean
* median
* mode
* quantiles
* percentiles
* variance
* standard deviation
* covariance
* correlation
* distributions
* outliers
* confidence intervals
* hypothesis testing
* p-values
* statistical power
* effect size
* regression
* resampling
* bootstrapping
* Bayesian reasoning
* experimental design
* A/B testing
* statistical significance
* practical significance

MiniDB applications:

```python
table.describe()
table.histogram(...)
table.value_counts(...)
table.correlation(...)
```

Teach how these operations can execute **inside the database rather than extracting all data into Python**.

---

# 11. Data Science

Teach:

* data collection
* data ingestion
* data cleaning
* data validation
* missing data
* duplicate detection
* outlier detection
* exploratory data analysis
* feature engineering
* aggregation
* joins
* reshaping
* grouping
* filtering
* sampling
* normalization
* encoding
* data leakage
* train/test splitting
* reproducibility
* experiment tracking
* data provenance
* analytical workflows
* communicating results

MiniDB applications:

* CSV ingestion
* Parquet ingestion
* DataFrame ingestion
* database profiling
* SQL analytics
* feature preparation
* ML datasets

---

# 12. Database Theory

Teach:

* relational model
* relations
* tuples
* attributes
* schemas
* keys
* primary keys
* foreign keys
* constraints
* normalization
* functional dependencies
* relational algebra
* selection
* projection
* joins
* aggregation
* relational equivalence
* query semantics
* indexes
* transactions
* ACID
* isolation
* durability
* consistency

MiniDB applications:

* table schemas
* SQL
* query planner
* constraints
* transaction engine
* indexes
* relational operators

---

# 13. Database Internals

Teach:

* storage engines
* pages
* records
* slotted pages
* page layouts
* heap files
* free-space management
* buffer pools
* indexes
* B+Trees
* query execution
* query planning
* query optimization
* statistics
* cardinality estimation
* joins
* aggregation
* columnar storage
* row storage
* vectorized execution
* compression
* caching

MiniDB applications:

The entire database engine.

---

# 14. Operating Systems and Systems Programming

Teach:

* processes
* threads
* scheduling
* mutexes
* locks
* atomics
* condition variables
* virtual memory
* memory mapping
* files
* file descriptors
* buffered I/O
* direct I/O concepts
* fsync
* durability
* page cache
* disk latency
* SSDs
* NVMe
* memory hierarchy
* CPU caches
* cache locality
* false sharing
* synchronization
* race conditions
* deadlocks

MiniDB applications:

* file manager
* WAL
* buffer pool
* concurrent execution
* crash recovery
* performance optimization

---

# 15. Computer Architecture

Teach:

* CPU architecture
* instruction execution
* registers
* memory hierarchy
* cache lines
* L1/L2/L3 caches
* branch prediction
* SIMD
* vector instructions
* memory bandwidth
* CPU throughput
* latency
* NUMA concepts
* storage hierarchy
* locality
* data layout
* alignment

MiniDB applications:

* columnar storage
* vectorized execution
* SIMD filtering
* cache-friendly data structures
* batch processing
* benchmarking

---

# 16. Concurrency and Parallelism

Teach:

* concurrency
* parallelism
* threads
* thread pools
* tasks
* futures
* mutexes
* reader/writer locks
* atomics
* lock-free concepts
* race conditions
* deadlocks
* starvation
* livelocks
* synchronization
* work stealing
* parallel algorithms
* scheduling

Database-specific:

* concurrent readers
* concurrent writers
* MVCC
* snapshots
* lock management
* transaction conflicts
* deadlock detection
* parallel query execution

---

# 17. Distributed Systems Concepts

Even though MiniDB is initially embedded, teach:

* distributed state
* replication
* consensus
* leader election
* fault tolerance
* partitions
* consistency models
* CAP theorem
* distributed transactions
* WAL replication
* logical replication

These concepts should be taught as **future architectural context**, not necessarily implemented in the initial product.

---

# 18. Compilers and Language Processing

Teach:

* lexing
* tokenization
* parsing
* grammars
* ASTs
* recursive descent
* operator precedence
* semantic analysis
* binding
* type checking
* intermediate representations
* query rewriting
* optimization
* execution plans

MiniDB applications:

```text
SQL
 ↓
Lexer
 ↓
Parser
 ↓
AST
 ↓
Binder
 ↓
Logical IR
 ↓
Optimizer
 ↓
Physical Plan
 ↓
Executor
```

---

# 19. Query Optimization

Teach:

* relational algebra
* logical plans
* physical plans
* rule-based optimization
* cost-based optimization
* cardinality estimation
* selectivity
* predicate pushdown
* projection pruning
* join ordering
* index selection
* statistics
* histograms
* cost models

Mathematical component:

Teach how estimated cost is constructed and why estimates can be wrong.

---

# 20. Machine Learning

Teach:

* supervised learning
* unsupervised learning
* regression
* classification
* clustering
* dimensionality reduction
* feature engineering
* normalization
* regularization
* loss functions
* optimization
* gradient descent
* model evaluation
* cross-validation
* overfitting
* underfitting
* bias/variance
* embeddings
* similarity search
* nearest neighbors

MiniDB applications:

* ML feature pipelines
* vector storage
* vector search
* dataset preparation
* local feature stores

---

# 21. Data Visualization

Teach:

* visual encoding
* distributions
* histograms
* scatter plots
* line charts
* box plots
* categorical plots
* time-series visualization
* correlation visualization
* dashboards
* misleading visualizations
* uncertainty visualization
* communicating analytical results

MiniDB applications:

```python
db.table("sales").profile()
db.table("sales").plot(...)
```

---

# 22. Testing and Verification

Teach:

* unit tests
* integration tests
* system tests
* acceptance tests
* regression tests
* property-based testing
* fuzz testing
* stress testing
* concurrency testing
* performance testing
* benchmark testing
* crash testing
* invariant testing
* deterministic testing
* randomized testing
* test fixtures
* mocking
* test isolation

Database-specific:

* crash recovery
* WAL correctness
* B+Tree invariants
* transaction invariants
* catalog invariants
* page corruption
* concurrent access

---

# 23. Performance Engineering

Teach:

* benchmarking
* profiling
* CPU profiling
* memory profiling
* allocation profiling
* cache profiling
* I/O profiling
* flame graphs
* latency
* throughput
* tail latency
* scalability
* Amdahl's law
* Little's law
* memory bandwidth
* CPU utilization
* cache locality
* branch prediction
* SIMD
* batching

Every performance lesson should distinguish:

```text
measurement
vs.
hypothesis
vs.
optimization
vs.
verification
```

---

# 24. Data Formats

Teach:

* binary serialization
* text serialization
* schema evolution
* CSV
* JSON
* Parquet
* Arrow
* columnar formats
* compression
* encoding
* endianness
* compatibility

MiniDB applications:

* database file format
* WAL format
* Arrow integration
* Parquet import/export

---

# 25. Reliability Engineering

Teach:

* fault models
* failure modes
* durability
* crash consistency
* recovery
* checksums
* corruption
* backups
* restore
* observability
* health checks
* invariants
* chaos testing
* fault injection

MiniDB applications:

```text
write
 ↓
crash
 ↓
restart
 ↓
recover
 ↓
verify
```

---

# 26. Security

Teach:

* threat modeling
* input validation
* SQL injection
* unsafe deserialization
* memory safety
* privilege concepts
* secrets
* file permissions
* sandboxing concepts
* dependency security
* supply-chain security
* fuzzing

MiniDB applications:

* SQL parser hardening
* file corruption handling
* safe extension APIs
* Python boundary security

---

# 27. Research and Experimental Method

Teach:

* forming hypotheses
* designing experiments
* controlling variables
* benchmarks
* statistical significance
* reproducibility
* ablation studies
* performance experiments
* interpreting results
* avoiding benchmark bias
* documenting experiments

Example:

> Does vectorized filtering outperform tuple-at-a-time execution?

Learner must:

1. form hypothesis
2. design benchmark
3. implement baseline
4. implement optimization
5. collect measurements
6. analyze distributions
7. determine significance
8. explain result
9. document conclusion

---

# 28. Technical Communication

Teach:

* architecture diagrams
* technical writing
* API documentation
* design documents
* ADRs
* README design
* changelogs
* benchmark reports
* experiment reports
* code comments
* issue writing
* pull requests
* code review
* presenting technical decisions

---

# 29. Meta-Skill: Engineering Thinking

Every lesson should reinforce the following loop:

```text
Problem
  ↓
Requirements
  ↓
Model
  ↓
Mathematics
  ↓
Algorithm
  ↓
Data Structure
  ↓
Implementation
  ↓
Tests
  ↓
Benchmark
  ↓
Analysis
  ↓
Optimization
  ↓
Documentation
  ↓
Reflection
```

The learner should repeatedly experience this loop rather than learning each subject in isolation.

---

# 30. Lesson Structure Requirement

Every lesson built from this curriculum should explicitly identify:

### Purpose

What capability or understanding the learner gains.

### BRD connection

Which MiniDB requirement, slice, architectural component, or product goal motivates the lesson.

### Prerequisites

The concepts the learner must already understand.

### Concepts

The explicit theory being taught.

### Mathematics

Any mathematical concepts required.

### Computer science

The CS concepts involved.

### Software engineering

The engineering practices involved.

### Implementation

What the learner builds.

### Data

What data is generated, stored, queried, or analyzed.

### Experiment

What hypothesis or engineering question is investigated.

### Testing

What correctness properties are verified.

### Benchmarking

What performance characteristics are measured.

### Reflection

What tradeoffs and design decisions the learner must explain.

### Deliverable

The concrete artifact produced by the lesson.

### BRD increment

Which new capability becomes possible in MiniDB after completing the lesson.

---

# 31. The Fundamental Teaching Pattern

The curriculum should repeatedly use this pattern:

> **Need → Theory → Mathematics → Algorithm → Implementation → Test → Data → Experiment → Optimization → Product**

For example:

```text
Need:
Fast indexed lookup

Theory:
B+Trees

Math:
O(log n)

CS:
Trees, recursion, disk-oriented algorithms

Engineering:
Interfaces, invariants, testing

Implementation:
B+Tree in C++

Data:
Generate millions of keys

Experiment:
Compare scan vs B+Tree

Statistics:
Measure latency distributions

Optimization:
Cache-aware nodes

Python:
Expose index performance through API

Product:
CREATE INDEX / indexed queries
```

This is the core philosophy of the curriculum.

---

# 32. Overall Educational Outcome

By completing the curriculum, the learner should not merely know how to use:

* C++
* Python
* SQL
* pandas
* NumPy
* statistics
* machine learning
* databases
* algorithms

They should understand **how these disciplines connect**.

The final learner capability should be:

> Given a real-world data or software problem, independently decompose it into requirements, mathematical models, algorithms, data structures, software architecture, implementation, tests, experiments, benchmarks, and a usable product.

MiniDB is the continuous laboratory in which that capability is developed.
