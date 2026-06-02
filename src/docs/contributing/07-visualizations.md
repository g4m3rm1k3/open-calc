# Available Visualizations

These are the interactive components you can embed in any lesson using a `visualizations` array or inside a notebook.

To embed a viz, add it to `intuition.visualizations` in your lesson:

```js
visualizations: [
  {
    id: 'FunctionPlotter',      // the ID from this list
    title: 'Plot the derivative',
    caption: 'Try changing the function and observe the slope.',
  },
]
```

Some components accept a `props` object for configuration. Refer to the template docs for examples.

---

## Notebook types (code environments)

These are full coding environments where the student writes and runs code.

| ID | Language | Use for |
|----|----------|---------|
| `PythonNotebook` | Python (Pyodide) | Python lessons, data science, AI/ML |
| `JSNotebook` | HTML / CSS / JS | Web development, JavaScript lessons |
| `OpenMatNotebook` | MATLAB / Octave | Engineering math, signal processing |
| `SimNotebook` | Three.js / Canvas 2D | 3D simulations, physics engines, game logic |
| `ScienceNotebook` | HTML / CSS / JS | Chemistry, biology, science labs |
| `GcodeNotebook` | G-code | CNC machining lessons |
| `CNCLab` | G-code + simulation | Full CNC machine simulator |
| `GitLab` | Git commands | Git and version control lessons |

---

## Calculus visualizations

| ID | What it shows |
|----|--------------|
| `LimitApproach` | Numerical limit approach from left and right |
| `EpsilonDelta` | ε-δ definition of a limit |
| `TwoSidedLimit` | One-sided and two-sided limits |
| `SqueezeTheorem` | Squeeze theorem with animated bounds |
| `ContinuityViz` | Continuity: holes, jumps, asymptotes |
| `LimitRacingCar` | Limit intuition via a car approaching a point |
| `TangentLineConstructor` | Secant → tangent line animation |
| `SecantLineViz` | Secant line with adjustable h |
| `DerivativeBuilder` | Build derivatives by dragging function shapes |
| `PowerRulePattern` | Visual pattern for the power rule |
| `ProductRuleRectangle` | Rectangle area proof of the product rule |
| `ChainRuleMicroscope` | Composition zoom for chain rule |
| `ImplicitCurveExplorer` | Implicit differentiation on a curve |
| `LinearApproximation` | Tangent line as a local linear model |
| `MVTViz` | Mean Value Theorem with adjustable endpoints |
| `NewtonsMethod` | Newton's method iteration animation |
| `RiemannSum` | Left, right, midpoint Riemann sums |
| `AreaAccumulator` | Accumulating area under a curve |
| `AreaBetweenCurves` | Area between two curves |
| `VolumesOfRevolution` | Disk/washer/shell method |
| `TaylorApproximation` | Taylor series approximation with degree slider |
| `SeriesConvergenceLab` | Convergence tests for series |
| `FunctionPlotter` | General-purpose function plotter |
| `GraphMorph` | Morphing between function families |
| `CurveSketchingBoard` | Full curve sketching with sign charts |
| `SlopeField` | Direction fields for ODEs |
| `EulerMethodStepper` | Euler's method step-by-step |
| `PolarCurve` | Polar coordinate function plotter |

---

## Linear algebra visualizations

| ID | What it shows |
|----|--------------|
| `LALesson01_Vectors` | 2D vector addition and scalar multiplication |
| `LALesson02_Combinations` | Linear combinations and span |
| `LALesson03_DotCross` | Dot product and cross product |
| `LALesson04_Matrices` | Matrix as a transformation |
| `LALesson05_MatrixMult` | Matrix multiplication as composition |
| `LALesson06_Inverses` | Matrix inverse and its geometric meaning |
| `LALesson07_NullSpace` | Null space and column space |
| `LALesson08_Eigen` | Eigenvectors as stretch directions |
| `LALesson09_Diagonalization` | Diagonalization step-by-step |
| `LALesson10_ComplexEigen` | Complex eigenvalues and rotation |
| `LALesson11_OrthogonalProjections` | Gram-Schmidt and projection |
| `LALesson12_SVD` | Singular value decomposition |
| `VectorsModuleViz` | General vector operations |
| `DotProductViz` | Dot product and angle |
| `CrossProductViz` | Cross product and right-hand rule |
| `LinearTransformationsViz` | Linear map visualization |
| `GaussianEliminationStepper` | Row reduction step-by-step |
| `EigenvaluesModuleViz` | Eigenvalue explorer |
| `GramSchmidtProcess` | Gram-Schmidt orthogonalization |
| `LeastSquaresFit` | Least squares regression |
| `LowRankApproximationViz` | SVD low-rank approximation |

---

## Physics visualizations

| ID | What it shows |
|----|--------------|
| `ProjectileMotion` | Projectile with adjustable angle and speed |
| `VectorKinematicsLab` | Position, velocity, acceleration vectors |
| `ForceBlockSim` | Block on a surface with applied forces |
| `InclinedPlaneSim` | Block on inclined plane with friction |
| `AtwoodMachineSim` | Atwood machine simulation |
| `SpringOscillation` | Spring-mass system |
| `OscillationViz` | Simple harmonic motion |
| `PositionVelocityAcceleration` | Graphs of x, v, a over time |
| `DisplacementVsDistance` | Path vs displacement comparison |
| `MotionTracer` | Trace a moving object's path |
| `RollerCoaster` | Energy conservation on a track |
| `WorkDotProductViz` | Work as a dot product |

---

## Discrete math and logic

| ID | What it shows |
|----|--------------|
| `TruthTableLab` | Interactive truth table builder |
| `TruthCube3D` | 3D truth table visualization |
| `VennDiagram` | Set operations with Venn diagrams |
| `LogicGateSim` | Logic gate simulator |
| `DFAChallengeGame` | Finite automata game |
| `GraphTraversalGame` | BFS/DFS traversal on a graph |
| `GraphNetwork3D` | 3D graph visualization |
| `RecurrenceExplorer` | Recurrence relation explorer |
| `ComplexityLab` | Algorithm complexity comparison |
| `PascalsTriangle` | Pascal's triangle builder |
| `ModClockViz` | Modular arithmetic on a clock |
| `EuclideanAlgorithmViz` | Euclidean algorithm step-by-step |

---

## Geometry

| ID | What it shows |
|----|--------------|
| `G1_1_FivePostulates` through `G1_6_Pythagorean` | Euclidean geometry basics |
| `G2_1_CircleTheorems1` through `G2_6_ArcSectorPi` | Circle theorems |
| `G3_1_CoordinatePlane` through `G3_6_Vectors` | Coordinate geometry |
| `G4_1_PrismsCylinders` through `G4_4_CrossSections` | 3D solids |
| `UnitCircle` | Interactive unit circle |
| `UnitCircleFullViz` | Unit circle with all trig values |
| `PolarCartesianViz` | Polar ↔ Cartesian conversion |
| `TriangleGeometryViz` | Triangle properties explorer |

---

## Precalc / Algebra

| ID | What it shows |
|----|--------------|
| `FunctionMachine` | Input → output function machine |
| `FunctionPlotter` | Multi-function plotter |
| `TransformLab` | Function transformations (shift, scale, reflect) |
| `ExponentialGrowth` | Exponential growth and decay |
| `LogGraphViz` | Logarithm graphs |
| `ComplexPlaneViz` | Complex numbers on the plane |
| `PolynomialScrubber` | Scrub polynomial coefficients |
| `RationalSketchViz` | Rational function sketcher |
| `NumberLine` | Interactive number line |
| `SignChartBuilder` | Sign chart for inequalities |
| `SequenceExplorer` | Arithmetic and geometric sequences |

---

## CNC / G-code

| ID | What it shows |
|----|--------------|
| `GcodeNotebook` | G-code editor with simulation |
| `CNCLab` | Full CNC machine simulator |
| `CNCAxesExplorer` | Machine axes and coordinate systems |
| `CNCHistoryTimeline` | History of CNC machining |
| `CNCMachineTypes` | VMC, lathe, multi-axis types |
| `CNCDialectTable` | G/M code reference table |

---

## General purpose

| ID | What it shows |
|----|--------------|
| `SVGDiagram` | Static SVG diagrams (pass SVG string in props) |
| `FunctionPlotter` | Multi-function plotter with zoom/pan |
| `NumberLine` | Annotated number line |

---

## Using a viz that is not listed

If you need something that does not exist, describe it in your submission and we will build it. Include:
- What it should show
- What the student interacts with (sliders, drag handles, buttons)
- What updates in response

You can use the `SVGDiagram` ID with a custom SVG for static diagrams in the meantime.
