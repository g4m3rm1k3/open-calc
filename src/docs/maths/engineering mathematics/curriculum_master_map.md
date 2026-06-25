# Mathematics, Physics, and Computer Science
### A Unified Curriculum for the Engineer-Programmer

---

## The Goal

You are building software that models physical reality —
geometry, motion, forces, materials, manufacturing processes.
To build it correctly you need to understand what it is computing.

SolidWorks computes differential geometry and constraint solving.
Mastercam computes computational geometry and kinematics.
FEA software computes numerical linear algebra on a mesh.
A physics engine computes differential equations integrated over time.
A cryptographic library computes number theory in finite fields.
A machine learning model computes multivariable optimisation.

This curriculum builds the mathematical foundation to understand
all of these — not as a user, but as the person who could write them.

---

## The Framing: Three Threads, Woven Together

Every lesson in this curriculum belongs to at least one thread.
Most belong to two or three simultaneously.

**Thread 1 — Pure Mathematics**
The formal structure: definitions, theorems, proofs.
Rigorous but connected — every definition exists because something
needed it. Nothing is introduced without a reason.

**Thread 2 — Physics and Engineering Science**
The phenomena mathematics was invented to describe.
Mechanics, kinematics, stress and strain, vibration, heat,
electromagnetism. Taught alongside the mathematics — not after it.

**Thread 3 — Computer Science and Implementation**
The algorithms, data structures, and computational methods
that turn mathematics into running software.
Every major mathematical concept has a computational version.
Both are taught.

---

## Starting Point and Assumptions

**Assumed:** solid algebra — variables, equations, solving for $x$,
manipulating expressions, graphing lines, basic coordinate geometry.

**Not assumed:** trigonometry, logarithms, exponentials, complex numbers,
calculus, linear algebra, statistics, discrete math, or physics.

Everything is built from here.

---

## The Master Map

---

### Stage 0 — Language and Foundations
**~12 lessons**

> Mathematics is written in a language — sets, logic, and functions.
> Most courses skip this stage, then spend years using terms
> informally in ways that create subtle confusions.
> These twelve lessons are the grammar of everything that follows.

| # | Lesson | Threads |
|---|--------|---------|
| 0.1 | **Sets — Collecting and Describing Things** | Math |
| 0.2 | **Set Operations — Union, Intersection, Complement** | Math, CS |
| 0.3 | **Logic — AND, OR, NOT, Implication** | Math, CS |
| 0.4 | **Truth Tables and Logical Equivalence** | Math, CS |
| 0.5 | **Proof Strategies — Contradiction, Contrapositive** | Math |
| 0.6 | **Proof by Induction** | Math, CS |
| 0.7 | **Functions — The Core Abstraction** | Math, CS |
| 0.8 | **Types of Functions — Injective, Surjective, Bijective** | Math, CS |
| 0.9 | **Composition and Inverse Functions** | Math, CS |
| 0.10 | **The Cartesian Plane and Coordinate Systems** | Math, Physics |
| 0.11 | **Relations and Equivalence Classes** | Math, CS |
| 0.12 | **Notation and Mathematical Writing** | Math |

*Physics anchor: every physical measurement maps a real situation to a
number — that mapping is a function. Coordinate systems are how
physics locates things in space. These ideas are introduced here
and used in every subsequent stage.*

*CS anchor: a function in mathematics and a function in code are
the same idea — input, rule, output. Logic gates are AND, OR, NOT.
Type theory is built on injective/surjective/bijective.*

---

### Stage 1 — Algebra II and Precalculus
**~25 lessons**

> The layer most college courses assume. Polynomials describe curves.
> Exponentials describe growth and decay. Logarithms compress large
> ranges. Complex numbers complete the number system. None of these
> should be black boxes.

**Chapter 1A — Polynomials**

| # | Lesson | Threads |
|---|--------|---------|
| 1.1 | **Polynomials — Structure, Degree, Coefficients** | Math |
| 1.2 | **Factoring and the Factor Theorem** | Math |
| 1.3 | **Polynomial Division and the Remainder Theorem** | Math, CS |
| 1.4 | **Roots and the Fundamental Theorem of Algebra** | Math |
| 1.5 | **Rational Functions — Behaviour Near Asymptotes** | Math, Physics |

*Physics anchor: position as a polynomial in time. Projectile motion
is a quadratic. Uniformly accelerated motion is $s = ut + \frac{1}{2}at^2$
— a polynomial in $t$ whose coefficients are physical quantities.*

**Chapter 1B — Exponentials and Logarithms**

| # | Lesson | Threads |
|---|--------|---------|
| 1.6 | **Exponential Functions — Growth and Decay** | Math, Physics |
| 1.7 | **The Number $e$ — Its Definition and Why It Appears** | Math, Physics |
| 1.8 | **The Natural Logarithm $\ln$** | Math, Physics |
| 1.9 | **Logarithm Laws — Manipulating Log Expressions** | Math |
| 1.10 | **Exponential and Logarithmic Equations** | Math |
| 1.11 | **Logarithmic Scales — Decibels, pH, Richter** | Math, Physics |

*Physics anchor: radioactive decay, Newton's law of cooling,
RC circuit discharge — all exponential. The half-life formula
is derived here, not memorised.*

*CS anchor: algorithm complexity — $O(\log n)$, $O(n \log n)$,
$O(2^n)$ — is exponential and logarithmic growth made precise.*

**Chapter 1C — Complex Numbers**

| # | Lesson | Threads |
|---|--------|---------|
| 1.12 | **Why $i$ Exists — Completing the Number System** | Math |
| 1.13 | **Complex Arithmetic — Add, Subtract, Multiply, Divide** | Math |
| 1.14 | **The Complex Plane — Argand Diagrams** | Math, Physics |
| 1.15 | **Modulus, Argument, and Polar Form** | Math, Physics |
| 1.16 | **Euler's Formula: $e^{i\theta} = \cos\theta + i\sin\theta$** | Math, Physics |
| 1.17 | **De Moivre's Theorem and Roots of Unity** | Math |

*Physics anchor: AC circuits, vibration analysis, and quantum
mechanics all use complex numbers not as a trick but as a necessity.
Euler's formula connects exponentials, trig, and complex numbers
in a single equation — the most connected result in mathematics.*

---

### Stage 2 — Trigonometry
**~22 lessons**

> Trigonometry is the mathematics of angles, circles, and waves.
> It is the backbone of 2D and 3D geometry, periodic motion,
> signal processing, and — via Euler's formula — complex analysis.

**Chapter 2A — Right Triangles and the Basic Functions**

| # | Lesson | Threads |
|---|--------|---------|
| 2.1 | **Angles — Degrees, Radians, and Arc Length** | Math, Physics |
| 2.2 | **The Six Trig Functions — Defined on a Right Triangle** | Math |
| 2.3 | **Special Angles — Exact Values Without a Calculator** | Math |
| 2.4 | **Solving Right Triangles** | Math, Physics |
| 2.5 | **The Pythagorean Identity — Derived, Not Memorised** | Math |

**Chapter 2B — The Unit Circle and General Angles**

| # | Lesson | Threads |
|---|--------|---------|
| 2.6 | **The Unit Circle** | Math, CS |
| 2.7 | **Trig Functions for All Angles — Extending Past 90°** | Math, Physics |
| 2.8 | **Reference Angles and the ASTC Rule** | Math |
| 2.9 | **Graphs of Sin and Cos — Amplitude, Period, Phase** | Math, Physics |
| 2.10 | **Graphs of the Remaining Four Functions** | Math |

*Physics anchor: simple harmonic motion ($x = A\cos(\omega t + \phi)$)
is introduced here alongside the graph of cosine. The amplitude,
angular frequency, and phase shift of the graph are the same
amplitude, frequency, and phase of a vibrating mass on a spring.
The physics makes the graph meaningful.*

**Chapter 2C — Identities and Equations**

| # | Lesson | Threads |
|---|--------|---------|
| 2.11 | **Pythagorean Identities — Three Forms** | Math |
| 2.12 | **Sum and Difference Formulas — Derived Geometrically** | Math |
| 2.13 | **Double and Half Angle Formulas** | Math, CS |
| 2.14 | **Product-to-Sum and Sum-to-Product** | Math, Physics |
| 2.15 | **Inverse Trig Functions** | Math, CS |
| 2.16 | **Solving Trig Equations** | Math |

*CS anchor: the double angle formulas are used in fast Fourier
transform (FFT) algorithms. The sum formula $\sin(A+B)$ is the
step that makes FFT work in $O(n\log n)$ instead of $O(n^2)$.*

**Chapter 2D — Applications in 2D and 3D**

| # | Lesson | Threads |
|---|--------|---------|
| 2.17 | **The Law of Sines** | Math, Physics |
| 2.18 | **The Law of Cosines** | Math, Physics |
| 2.19 | **Vectors in 2D — Magnitude, Direction, Components** | Math, Physics |
| 2.20 | **Dot Product in 2D — Angle Between Vectors** | Math, Physics |
| 2.21 | **Polar Coordinates** | Math, CS |
| 2.22 | **Parametric Equations in 2D** | Math, CS, Physics |

*Physics anchor: force decomposition, projectile motion components,
relative velocity. These are the first places where trig is not
"find a side of this triangle" but "model a physical situation."*

*CS anchor: parametric equations describe curves as functions of
a parameter $t$ — the natural form for a toolpath or an animation.*

---

### Stage 3 — Analytic Geometry and Curves
**~12 lessons**

> The geometry of shapes defined by equations. Every surface in
> a 3D modeling system is defined this way. Understanding the
> mathematics makes the software legible.

| # | Lesson | Threads |
|---|--------|---------|
| 3.1 | **Conics — Unified View via Distance** | Math |
| 3.2 | **The Circle and Its Equations** | Math, CS |
| 3.3 | **The Parabola** | Math, Physics |
| 3.4 | **The Ellipse** | Math, Physics, CS |
| 3.5 | **The Hyperbola** | Math, Physics |
| 3.6 | **Parametric Curves — Describing Motion** | Math, Physics, CS |
| 3.7 | **Bézier Curves** | Math, CS |
| 3.8 | **B-Splines and NURBS** | Math, CS |
| 3.9 | **Polar Curves** | Math, CS |
| 3.10 | **Curves in 3D — Helices and Space Curves** | Math, Physics, CS |

*CS anchor: Bézier curves and NURBS are the actual mathematical
representation used inside every CAD system. Lesson 3.7 derives
the Bézier cubic from scratch. Lesson 3.8 shows why NURBS
generalise Bézier — and why SolidWorks uses them.*

---

### Stage 4 — Linear Algebra
**~22 lessons**

> The mathematics of space, transformation, and data.
> A matrix is not a grid of numbers — it is a function on space.
> Once that shift happens, everything else in this stage
> becomes obvious rather than arbitrary.

**Chapter 4A — Vectors in 2D and 3D**

| # | Lesson | Threads |
|---|--------|---------|
| 4.1 | **Vectors — the Object** | Math, Physics |
| 4.2 | **Vector Addition and Scalar Multiplication** | Math, Physics |
| 4.3 | **The Dot Product — Projection and Angle** | Math, Physics |
| 4.4 | **The Cross Product — Area and Normal Vectors** | Math, Physics |
| 4.5 | **Lines and Planes in 3D** | Math, CS, Physics |

*Physics anchor: force, velocity, and acceleration are all vectors.
Every mechanics problem in Stage 6 starts here.*

*CS anchor: surface normals (cross products) are the first step in
every 3D rendering pipeline. Ray-plane intersection (Lesson 4.5)
is the core of a ray tracer.*

**Chapter 4B — Systems, Matrices, and the Core Theory**

| # | Lesson | Threads |
|---|--------|---------|
| 4.6 | **Systems of Linear Equations** | Math, Physics, CS |
| 4.7 | **Matrices as Compact Notation** | Math, CS |
| 4.8 | **Row Reduction and RREF** | Math, CS |
| 4.9 | **Linear Independence, Span, and Basis** | Math, CS |
| 4.10 | **Dimension and Coordinate Vectors** | Math, CS |
| 4.11 | **The Four Fundamental Subspaces** | Math, CS |
| 4.12 | **Rank and the Rank-Nullity Theorem** | Math, CS |

**Chapter 4C — Matrix Operations and Transformations**

| # | Lesson | Threads |
|---|--------|---------|
| 4.13 | **Matrix Multiplication as Composition** | Math, CS, Physics |
| 4.14 | **The Determinant — Area, Volume, Invertibility** | Math, Physics |
| 4.15 | **The Inverse Matrix** | Math, CS |
| 4.16 | **Linear Transformations** | Math, CS, Physics |
| 4.17 | **Rotation, Reflection, and Shear Matrices** | Math, CS, Physics |
| 4.18 | **Homogeneous Coordinates** | Math, CS |
| 4.19 | **Change of Basis** | Math, CS, Physics |
| 4.20 | **Eigenvalues and Eigenvectors** | Math, Physics |
| 4.21 | **Diagonalization** | Math, Physics, CS |
| 4.22 | **The Singular Value Decomposition** | Math, CS |

*CS anchor: Lesson 4.18 (homogeneous coordinates) is exactly the
mathematics inside every 3D graphics pipeline — OpenGL, DirectX,
and every game engine use 4×4 matrices in homogeneous coordinates.
Lesson 4.17 builds rotation matrices from scratch.*

*Physics anchor: eigenvalues of the stiffness matrix are the
natural frequencies of a structure. Lesson 4.20 connects to
Lesson 6.6 (vibration) and Lesson 6.9 (coupled oscillators).*

---

### Stage 5 — Calculus
**~28 lessons**

> Newton invented calculus to describe planetary motion.
> Leibniz invented it to compute areas. The derivative and the
> integral are the same object seen from opposite directions —
> the Fundamental Theorem connects them. Every rate of change
> in physics and every accumulation in engineering uses this.

**Chapter 5A — Limits and Continuity**

| # | Lesson | Threads |
|---|--------|---------|
| 5.1 | **Sequences and Limits** | Math, CS |
| 5.2 | **The Limit of a Function — Informal** | Math |
| 5.3 | **The Limit — Formal ($\epsilon$-$\delta$)** | Math |
| 5.4 | **Continuity** | Math, Physics |
| 5.5 | **The Intermediate Value Theorem** | Math, CS |

*CS anchor: bisection method (Lesson 5.5) is the IVT turned into
an algorithm. It is also the root-finding step inside constraint
solvers in CAD software.*

**Chapter 5B — Differentiation**

| # | Lesson | Threads |
|---|--------|---------|
| 5.6 | **The Derivative — Rate of Change and Slope** | Math, Physics |
| 5.7 | **Differentiation Rules — Power, Sum, Product, Quotient** | Math |
| 5.8 | **Derivatives of Trig, Exp, and Log** | Math, Physics |
| 5.9 | **The Chain Rule** | Math, Physics, CS |
| 5.10 | **Implicit Differentiation** | Math, CS |
| 5.11 | **Related Rates** | Math, Physics |
| 5.12 | **Linear Approximation and Error Propagation** | Math, Physics |
| 5.13 | **Optimisation — First and Second Derivative Tests** | Math, Physics, CS |
| 5.14 | **Taylor and Maclaurin Series** | Math, Physics, CS |

*Physics anchor: velocity is $ds/dt$, acceleration is $d^2s/dt^2$.
The derivative is introduced with position-velocity-acceleration
as the motivating example — the reason Newton invented it.*

*CS anchor: the chain rule (Lesson 5.9) is the exact operation
performed in neural network backpropagation. Lesson 5.9 derives
it and Lesson 9.13 applies it.*

**Chapter 5C — Integration**

| # | Lesson | Threads |
|---|--------|---------|
| 5.15 | **The Definite Integral — Accumulated Change** | Math, Physics |
| 5.16 | **The Fundamental Theorem of Calculus** | Math |
| 5.17 | **Integration Techniques — Substitution** | Math |
| 5.18 | **Integration by Parts** | Math, Physics |
| 5.19 | **Area, Arc Length, Surface Area, Volume** | Math, CS |
| 5.20 | **Improper Integrals** | Math, Physics |
| 5.21 | **Numerical Integration — Trapezoid and Simpson** | Math, CS |

*CS anchor: Lesson 5.21 (numerical integration) is what a physics
engine does every frame. Euler's method, the trapezoid rule, and
Runge-Kutta are all numerical integration — applied in Lesson 6.3.*

**Chapter 5D — Multivariable Calculus**

| # | Lesson | Threads |
|---|--------|---------|
| 5.22 | **Functions of Several Variables** | Math, Physics |
| 5.23 | **Partial Derivatives** | Math, Physics, CS |
| 5.24 | **The Gradient** | Math, Physics, CS |
| 5.25 | **Directional Derivatives** | Math, Physics |
| 5.26 | **Optimisation in Multiple Variables** | Math, CS |
| 5.27 | **Double and Triple Integrals** | Math, Physics |
| 5.28 | **The Jacobian and Change of Variables** | Math, CS, Physics |

*CS anchor: gradient descent (Lesson 5.24) is the optimisation
algorithm that trains every neural network. The gradient is the
direction to move; the learning rate is the step size.*

---

### Stage 6 — Physics and Mechanics
**~28 lessons, woven with Stages 4 and 5**

> Physics is taught here not as memorising formulas, but as the
> application of mathematics to describing reality. Every formula
> is derived from a principle. Every quantity has a mathematical
> type — scalar, vector, tensor.
>
> **Note on sequencing:** Stage 6 is not strictly "after" Stage 5.
> Kinematics (Chapter 6A) can be started after Stage 2 (trig).
> Dynamics (Chapter 6B) requires Stage 5B (differentiation).
> Energy methods (Chapter 6C) require Stage 5C (integration).
> Stress and strain (Chapter 6D) require Stage 4 (linear algebra).
> The lessons are numbered sequentially but can be interleaved.

**Chapter 6A — Kinematics (after Stage 2)**

| # | Lesson | Threads |
|---|--------|---------|
| 6.1 | **Position, Velocity, and Acceleration** | Physics, Math |
| 6.2 | **Kinematics in 1D** | Physics, Math |
| 6.3 | **Kinematics in 2D — Projectile Motion** | Physics, Math |
| 6.4 | **Circular Motion** | Physics, Math |
| 6.5 | **Relative Motion and Reference Frames** | Physics, Math |
| 6.6 | **Rigid Body Kinematics** | Physics, Math, CS |

*CS anchor: Lesson 6.6 is the mathematics behind articulated
body simulation — robot arms, character animation skeletons,
and multi-axis machine tool kinematics all use rigid body
kinematics implemented as matrix chains.*

**Chapter 6B — Newtonian Mechanics (after Stage 5B)**

| # | Lesson | Threads |
|---|--------|---------|
| 6.7 | **Newton's Laws** | Physics, Math |
| 6.8 | **Forces — Gravity, Normal Force, Friction** | Physics, Math |
| 6.9 | **Free Body Diagrams and Equilibrium** | Physics, Math |
| 6.10 | **Newton's Second Law as a Differential Equation** | Physics, Math |
| 6.11 | **Momentum and Impulse** | Physics, Math |
| 6.12 | **Torque and Rotational Dynamics** | Physics, Math |

**Chapter 6C — Energy and Work (after Stage 5C)**

| # | Lesson | Threads |
|---|--------|---------|
| 6.13 | **Work and the Work-Energy Theorem** | Physics, Math |
| 6.14 | **Potential Energy and Conservation** | Physics, Math |
| 6.15 | **Power** | Physics, Math |
| 6.16 | **The Lagrangian — Energy-Based Mechanics** | Physics, Math, CS |

*CS anchor: Lesson 6.16 introduces the Lagrangian approach,
which is the basis for physics engines that use energy methods
rather than force methods — more stable numerically for
constraint-heavy simulations.*

**Chapter 6D — Stress, Strain, and Materials (after Stage 4)**

| # | Lesson | Threads |
|---|--------|---------|
| 6.17 | **Stress — Force Per Unit Area** | Physics, Math |
| 6.18 | **Strain — Deformation Per Unit Length** | Physics, Math |
| 6.19 | **Hooke's Law and the Elastic Modulus** | Physics, Math |
| 6.20 | **The Stress Tensor** | Physics, Math |
| 6.21 | **Principal Stresses and the Mohr Circle** | Physics, Math |
| 6.22 | **Beam Bending — The Euler-Bernoulli Equation** | Physics, Math |
| 6.23 | **Introduction to Finite Element Analysis** | Physics, Math, CS |

*CS anchor: Lesson 6.23 connects to Stage 4 directly — FEA
assembles a global stiffness matrix from element stiffness matrices
and solves $Ku = f$. This is the linear algebra of Stage 4
applied at engineering scale. Understanding this is the difference
between clicking "run FEA" and knowing what the software is doing.*

---

### Stage 7 — Differential Equations
**~14 lessons**

> The language of everything that changes over time.
> Vibration, heat transfer, fluid flow, control systems,
> and population dynamics are all differential equations.

| # | Lesson | Threads |
|---|--------|---------|
| 7.1 | **What Is a Differential Equation?** | Math, Physics |
| 7.2 | **Separable First-Order ODEs** | Math, Physics |
| 7.3 | **First-Order Linear ODEs** | Math, Physics |
| 7.4 | **Numerical Methods — Euler and Runge-Kutta** | Math, CS |
| 7.5 | **Second-Order ODEs — The Harmonic Oscillator** | Math, Physics |
| 7.6 | **Damping — Under, Over, Critical** | Math, Physics |
| 7.7 | **Forced Oscillation and Resonance** | Math, Physics |
| 7.8 | **Systems of ODEs** | Math, Physics, CS |
| 7.9 | **The Laplace Transform** | Math, Physics, CS |
| 7.10 | **Transfer Functions and Control Systems** | Math, Physics, CS |
| 7.11 | **Fourier Series** | Math, Physics, CS |
| 7.12 | **The Fourier Transform** | Math, Physics, CS |
| 7.13 | **The Discrete Fourier Transform and FFT** | Math, CS |
| 7.14 | **Partial Differential Equations — an Introduction** | Math, Physics |

*CS anchor: Lesson 7.4 (Euler/Runge-Kutta) is what a physics
engine runs every frame. Lesson 7.13 (FFT) is the algorithm
inside every audio processor, spectrum analyser, and signal
processing library — and it is $O(n\log n)$ for reasons
that trace directly to Stage 2's double-angle trig identities.*

---

### Stage 8 — Probability and Statistics
**~14 lessons**

> Measurement is always uncertain. Material properties are
> distributions. Simulation output needs statistical interpretation.
> Machine learning is applied probability.

| # | Lesson | Threads |
|---|--------|---------|
| 8.1 | **Descriptive Statistics** | Math, Physics |
| 8.2 | **Probability — Axioms and Sample Spaces** | Math |
| 8.3 | **Conditional Probability** | Math, CS |
| 8.4 | **Bayes' Theorem** | Math, CS |
| 8.5 | **Random Variables and Distributions** | Math |
| 8.6 | **Expectation, Variance, Standard Deviation** | Math, Physics |
| 8.7 | **Common Distributions — Binomial, Poisson, Normal** | Math, Physics |
| 8.8 | **The Central Limit Theorem** | Math |
| 8.9 | **Confidence Intervals and Hypothesis Testing** | Math, Physics |
| 8.10 | **Linear Regression** | Math, CS |
| 8.11 | **Information Theory and Entropy** | Math, CS |
| 8.12 | **Monte Carlo Methods** | Math, CS, Physics |
| 8.13 | **Statistical Process Control** | Math, Physics |
| 8.14 | **Maximum Likelihood and Bayesian Inference** | Math, CS |

---

### Stage 9 — Discrete Mathematics and Algorithms
**~22 lessons**

> The mathematics computers run on directly. Every algorithm,
> data structure, and computation model is grounded here.

**Chapter 9A — Discrete Structures**

| # | Lesson | Threads |
|---|--------|---------|
| 9.1 | **Combinatorics — Counting Carefully** | Math, CS |
| 9.2 | **The Pigeonhole Principle** | Math, CS |
| 9.3 | **Recurrences and Generating Functions** | Math, CS |
| 9.4 | **Graph Theory** | Math, CS |
| 9.5 | **Trees and Spanning Trees** | Math, CS |
| 9.6 | **Automata and State Machines** | Math, CS |

**Chapter 9B — Algorithm Design and Analysis**

| # | Lesson | Threads |
|---|--------|---------|
| 9.7 | **Asymptotic Complexity — Big O** | Math, CS |
| 9.8 | **Sorting Algorithms** | CS |
| 9.9 | **Divide and Conquer** | Math, CS |
| 9.10 | **Dynamic Programming** | Math, CS |
| 9.11 | **Graph Algorithms** | CS |
| 9.12 | **P vs NP** | Math, CS |

**Chapter 9C — Machine Learning**

| # | Lesson | Threads |
|---|--------|---------|
| 9.13 | **Linear Regression as Optimisation** | Math, CS |
| 9.14 | **Gradient Descent** | Math, CS |
| 9.15 | **Neural Networks and Backpropagation** | Math, CS |
| 9.16 | **Principal Component Analysis** | Math, CS |

---

### Stage 10 — Abstract Algebra and Number Theory
**~12 lessons**

> The deep structure underneath all arithmetic.
> These lessons are later in the curriculum because concrete
> experience in Stages 1–9 gives the abstractions somewhere to land.

| # | Lesson | Threads |
|---|--------|---------|
| 10.1 | **Primes and Unique Factorisation** | Math |
| 10.2 | **The Euclidean Algorithm** | Math, CS |
| 10.3 | **Modular Arithmetic — Formal Treatment** | Math, CS |
| 10.4 | **Euler's Totient and Fermat's Little Theorem** | Math, CS |
| 10.5 | **Groups — Symmetry Made Algebraic** | Math, Physics |
| 10.6 | **Subgroups, Cyclic Groups, and Generators** | Math, CS |
| 10.7 | **Rings** | Math |
| 10.8 | **Fields** | Math, CS |
| 10.9 | **Finite Fields $\mathrm{GF}(p)$** | Math, CS |
| 10.10 | **Polynomial Rings and Irreducibility** | Math, CS |
| 10.11 | **$\mathrm{GF}(2^8)$** | Math, CS |
| 10.12 | **Elliptic Curves over Finite Fields** | Math, CS |

---

### Stage 11 — Applications
**Lessons written after the relevant stages are complete**

> Not a new subject — everything built in Stages 0–10, deployed.
> Each application lesson states exactly which earlier lessons it
> uses.

**Chapter 11A — Cryptography**
*Caesar and Vigenère (already written) → RSA → Diffie-Hellman
→ AES → Elliptic Curve Cryptography → SHA-256 and HMAC*

**Chapter 11B — 3D Graphics and Rendering**
*Ray tracing → Rasterization → Shading models → Transformation
pipelines → Quaternions for rotation*

**Chapter 11C — Geometric Modeling (CAD/CAM)**
*Bézier and NURBS surfaces → Boolean solid modeling → Mesh
representations → Computational geometry algorithms*

**Chapter 11D — Physics Simulation**
*Rigid body dynamics → Constraint solving → Collision detection
→ Finite element analysis → Fluid simulation*

**Chapter 11E — Signal Processing**
*Sampling and Nyquist → DFT and FFT → Filtering → Audio and
image processing*

**Chapter 11F — Machine Learning Systems**
*Linear models → Neural networks → Convolutional networks →
Transformers — all derived from first principles*

---

## The Existing Lessons — Where They Belong

**Crypto lessons 00–05** (Caesar through Kasiski):
→ Chapter 11A, once Stage 10 is complete.
They are good and stay as written. Stage 10 gives them foundations.

**Linear algebra lessons L1–L3** (Span, Subspaces, Basis):
→ Stage 4, Chapter 4B (Lessons 4.9–4.10).
Good lessons; they will be connected to what Stage 4 builds
before them.

---

## The First Detailed Map to Build

**Stage 0** — twelve lessons, one session to plan in detail,
then two sessions to write.

It is the right starting point because:
1. Short enough to complete quickly and establish the rhythm
2. Removes the language-level confusions that make everything
   after it harder
3. Contains the first proofs — contradiction and induction —
   which are techniques used in every subsequent stage
4. Functions (Lessons 0.7–0.9) are the bridge between
   mathematics and programming — the same abstraction in both

After Stage 0, Stage 1 (Chapter 1B, exponentials and logs)
can run in parallel with Stage 2 (Chapter 2A, basic trig),
since Euler's formula in Lesson 1.16 is where they converge.
