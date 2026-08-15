# BRD 6 — Computational Geometry, Graphics, Simulation, CAD/CAM, and Interactive Worlds

## 1. Product Vision

### Working title

**Foundations-to-Frontiers: Computational Geometry, Graphics, Simulation, CAD/CAM, and Interactive Computing**

### Purpose

Build a tutorial series that takes a learner from the mathematical foundations of geometric computation to the point where they can independently design and implement sophisticated systems involving:

* 2D and 3D geometry;
* coordinate systems;
* transformations;
* cameras;
* rasterization;
* rendering;
* shaders;
* GPU computation;
* ray tracing;
* physically based rendering;
* curves and surfaces;
* meshes;
* spatial data structures;
* collision detection;
* rigid-body physics;
* numerical simulation;
* animation;
* procedural generation;
* scene representation;
* game-engine architecture;
* geometric modeling;
* solid modeling;
* parametric CAD;
* constraint solving;
* B-rep;
* CSG;
* NURBS;
* feature modeling;
* tolerances;
* meshing;
* CAM;
* toolpath generation;
* CNC concepts;
* manufacturing simulation;
* robotics;
* visualization.

The learner should eventually be able to encounter a geometric or physical problem and move through:

> **mathematical model → geometric representation → algorithm → numerical method → data structure → implementation → visualization → simulation → optimization**

rather than treating graphics, CAD, physics, and games as collections of unrelated APIs.

---

# 2. Central Design Principle

The central idea is:

> **Geometry is data, transformations are computation, rendering is interpretation, simulation is state evolution, and CAD/CAM is constrained geometric computation.**

A point, curve, surface, solid, mesh, camera, toolpath, rigid body, or scene should all be treated as computational objects.

The learner should repeatedly move between:

```text
Mathematics
    ↓
Geometry
    ↓
Representation
    ↓
Algorithms
    ↓
Numerical Computation
    ↓
Programs
    ↓
Interactive Systems
```

And in the other direction:

```text
Program
    ↓
Data Structures
    ↓
Geometric Model
    ↓
Mathematical Structure
```

---

# 3. What This BRD Is Intended to Enable

The curriculum should eventually make the learner capable of building systems such as:

### Graphics

* 2D renderer;
* 3D renderer;
* rasterizer;
* ray tracer;
* path tracer;
* shader system;
* material system;
* animation system;
* scene graph;
* GPU renderer.

### Games

* game loop;
* entity/component architecture;
* input system;
* camera system;
* collision system;
* physics engine;
* animation;
* particles;
* terrain;
* procedural worlds;
* lighting;
* rendering;
* asset pipeline;
* scripting;
* replay systems;
* networking integration.

### CAD

* sketcher;
* constraint solver;
* parametric modeler;
* curve editor;
* surface modeler;
* solid modeler;
* B-rep kernel;
* CSG engine;
* feature tree;
* assembly system;
* dimensioning;
* tolerancing;
* geometric queries;
* sectioning;
* measurement;
* visualization.

### CAM

* stock model;
* machining geometry;
* tool representation;
* toolpath generation;
* contouring;
* pocketing;
* drilling;
* roughing;
* finishing;
* 3-axis machining;
* 5-axis concepts;
* collision checking;
* gouge detection;
* machine simulation;
* post-processing;
* G-code concepts.

### Simulation

* particle systems;
* rigid bodies;
* springs;
* cloth;
* soft bodies;
* fluids;
* heat;
* deformation;
* finite-element concepts;
* robotics;
* kinematics;
* dynamics;
* numerical integration.

### Scientific and engineering visualization

* volumetric data;
* scalar fields;
* vector fields;
* contouring;
* slicing;
* isosurfaces;
* streamlines;
* scientific rendering;
* interactive visualization.

---

# 4. Dependency Philosophy

BRD 6 **does not require BRDs 2–5 to be completed first**.

The intended relationship is approximately:

```text
                    BRD 1
             Computational Foundations
                       │
                       ▼
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
      BRD 2          BRD 3          BRD 4
       SE             AI            Systems
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
                     BRD 6
          Geometry / Graphics / Simulation
```

But even that diagram should **not** be interpreted as a required sequence.

BRD 6 should explicitly identify prerequisites at the lesson level.

For example:

```text
3D Transformations
    prerequisites:
        vectors
        matrices
        coordinate systems

Ray Tracing
    prerequisites:
        vectors
        rays
        intersections
        recursion
        floating-point arithmetic

Rigid Body Dynamics
    prerequisites:
        vectors
        matrices
        derivatives
        numerical integration

B-Rep Modeling
    prerequisites:
        topology
        geometry
        graphs
        surfaces

Toolpath Generation
    prerequisites:
        curves
        surfaces
        offsets
        intersections
        optimization
```

So a learner can enter the branch at different points.

---

# 5. Master Mental Model

The entire BRD should repeatedly reinforce this hierarchy:

```text
Numbers
 ↓
Points
 ↓
Vectors
 ↓
Coordinate Frames
 ↓
Transformations
 ↓
Curves
 ↓
Surfaces
 ↓
Solids
 ↓
Meshes
 ↓
Spatial Structures
 ↓
Scenes
 ↓
Physical State
 ↓
Simulation
 ↓
Interaction
 ↓
Manufacturing
```

But there is a second hierarchy:

```text
Geometry
 ↓
Representation
 ↓
Query
 ↓
Modification
 ↓
Constraint
 ↓
Optimization
 ↓
Simulation
 ↓
Visualization
```

And a third:

```text
Model
 ↓
World
 ↓
Camera
 ↓
Projection
 ↓
Visibility
 ↓
Lighting
 ↓
Rasterization / Ray Tracing
 ↓
Image
```

These three mental models should recur throughout the curriculum.

---

# 6. Scope

Target approximately:

> **320–350 core lessons**

plus:

* optional mathematical deep dives;
* implementation projects;
* reconstruction exercises;
* CAD projects;
* game-engine projects;
* rendering projects;
* simulation projects;
* CAM projects.

This is intentionally comparable in seriousness to the original Foundations BRD.

Graphics should **not** be reduced to “vectors + OpenGL.”

CAD should **not** be reduced to “NURBS.”

Game development should **not** be reduced to “use an engine.”

CAM should **not** be reduced to “generate G-code.”

The objective is to understand the computational machinery underneath these systems.

---

# 7. Core Curriculum

# Section I — Geometric Thinking

### Lessons 1–20

### 1. What Is a Geometric Problem?

Define geometric objects, relationships, constraints, measurements, transformations, and queries.

### 2. Points, Vectors, and Directions

Distinguish location from displacement.

### 3. Scalars and Geometric Quantities

Separate quantities such as distance, angle, mass, time, and scale from geometric entities.

### 4. Coordinate Systems

Understand geometry relative to a chosen frame.

### 5. Local and Global Coordinates

Derive why objects need their own coordinate systems.

### 6. Basis Vectors

Understand coordinates as combinations of basis directions.

### 7. Dot Products

Derive projection, angle, perpendicularity, and directional measurement.

### 8. Cross Products

Derive perpendicular vectors and oriented area.

### 9. Norms and Distance

Build geometric measurement from vector operations.

### 10. Normalization

Understand unit directions and their numerical implications.

### 11. Orientation

Introduce handedness, winding, and orientation.

### 12. Coordinate Transformations

Move representations between coordinate frames.

### 13. Affine Transformations

Unify translation, rotation, scaling, and shear.

### 14. Homogeneous Coordinates

Derive the matrix representation of affine transformations.

### 15. Transformation Composition

Understand transformations as function composition.

### 16. Inverse Transformations

Derive how to move back between coordinate systems.

### 17. Numerical Error in Geometry

Introduce floating-point error, tolerance, and robustness.

### 18. Exact vs Approximate Geometry

Understand why computational geometry rarely behaves exactly like symbolic mathematics.

### 19. Geometric Predicates

Build orientation, sidedness, containment, and intersection tests.

### 20. Geometric Problem-Solving

Develop the canonical workflow for converting geometry into computation.

---

# Section II — 2D Computational Geometry

### Lessons 21–45

### 21. Lines and Line Segments

Represent infinite and finite linear geometry.

### 22. Rays

Derive rays as useful geometric primitives.

### 23. Parametric Geometry

Represent geometric objects using parameters.

### 24. Line-Line Intersection

Derive intersection from equations.

### 25. Segment Intersection

Handle finite domains and edge cases.

### 26. Orientation Tests

Derive signed area and orientation predicates.

### 27. Collinearity

Determine when points lie on a common line.

### 28. Distance to a Line

Derive perpendicular distance.

### 29. Distance to a Segment

Account for finite endpoints.

### 30. Circles

Represent and query circles.

### 31. Circle-Line Intersection

Derive intersection analytically.

### 32. Circle-Circle Intersection

Explore multiple intersection cases.

### 33. Polygons

Represent boundaries and interior regions.

### 34. Polygon Orientation

Determine winding direction.

### 35. Point-in-Polygon

Derive containment algorithms.

### 36. Polygon-Polygon Intersection

Handle overlapping planar regions.

### 37. Convexity

Define convex sets geometrically.

### 38. Convex Hulls

Derive the smallest convex enclosure.

### 39. Sweep-Line Algorithms

Introduce spatial event processing.

### 40. Voronoi Diagrams

Derive regions of nearest influence.

### 41. Delaunay Triangulation

Connect triangulation to Voronoi geometry.

### 42. Polygon Triangulation

Decompose polygons into simpler primitives.

### 43. Spatial Partitioning in 2D

Introduce grids, quadtrees, and spatial indexing.

### 44. Robust 2D Geometry

Handle degeneracies and numerical uncertainty.

### 45. 2D Geometry Workshop

Solve unfamiliar geometric problems from first principles.

---

# Section III — 3D Geometry and Transformations

### Lessons 46–75

### 46. 3D Coordinate Frames

Extend geometric reasoning into three dimensions.

### 47. Rotations in 3D

Understand rotation around arbitrary axes.

### 48. Rotation Matrices

Derive matrix representations.

### 49. Euler Angles

Understand their convenience and limitations.

### 50. Gimbal Lock

Derive why parameterization can become singular.

### 51. Axis-Angle Representation

Represent rotations geometrically.

### 52. Quaternions

Derive quaternion rotation from algebraic structure.

### 53. Quaternion Composition

Compose rotations robustly.

### 54. Quaternion Interpolation

Derive smooth rotational interpolation.

### 55. Rigid Transformations

Unify translation and rotation.

### 56. SE(2) and SE(3)

Introduce the mathematical structure of rigid motions.

### 57. Transformation Hierarchies

Build parent-child coordinate systems.

### 58. Cameras as Coordinate Transformations

Derive camera space.

### 59. Perspective Projection

Derive projection from geometric optics.

### 60. Orthographic Projection

Derive engineering-style projection.

### 61. View Frustums

Represent visible regions.

### 62. Clipping Planes

Derive geometric clipping.

### 63. 3D Lines and Planes

Build spatial queries.

### 64. Ray-Plane Intersection

Derive ray queries.

### 65. Ray-Triangle Intersection

Build the foundation for rendering and collision.

### 66. Sphere Geometry

Represent spheres and related queries.

### 67. Box Geometry

Introduce axis-aligned and oriented boxes.

### 68. Bounding Volumes

Understand geometric approximation for fast queries.

### 69. Closest-Point Problems

Build reusable geometric queries.

### 70. Distance Between Geometric Objects

Compare points, lines, segments, and surfaces.

### 71. Geometric Transform Pipelines

Move objects through multiple coordinate spaces.

### 72. Numerical Rotation Problems

Handle drift, normalization, and precision.

### 73. Geometric Robustness in 3D

Understand degeneracies and near-intersections.

### 74. Coordinate Frames in Robotics, CAD, and Games

Compare the same mathematical machinery across domains.

### 75. 3D Geometry Workshop

Build a reusable geometry library.

---

# Section IV — Curves

### Lessons 76–100

### 76. Why Curves Matter

Connect curves to modeling, animation, paths, and manufacturing.

### 77. Parametric Curves

Represent curves as functions of a parameter.

### 78. Derivatives of Curves

Interpret tangent vectors geometrically.

### 79. Arc Length

Measure curve length.

### 80. Curvature

Measure how geometry bends.

### 81. Polynomial Curves

Introduce polynomial representations.

### 82. Bézier Curves

Derive Bézier curves from interpolation.

### 83. Bernstein Polynomials

Understand the mathematical basis of Bézier curves.

### 84. De Casteljau's Algorithm

Derive stable Bézier evaluation.

### 85. Bézier Subdivision

Split curves without changing their geometry.

### 86. Bézier Continuity

Understand positional and tangent continuity.

### 87. B-Splines

Generalize polynomial curve representation.

### 88. Knots

Understand how knot placement controls B-splines.

### 89. NURBS

Derive rational B-splines.

### 90. Rational Geometry

Understand why weights enable exact circles and conics.

### 91. Curve Intersections

Solve curve-curve intersection problems.

### 92. Curve Approximation

Approximate geometry numerically.

### 93. Curve Offsets

Derive parallel curves.

### 94. Curve Fairness

Understand smoothness and design quality.

### 95. Arc-Length Parameterization

Reparameterize curves for constant-speed traversal.

### 96. Curves for Animation

Use paths for motion.

### 97. Curves for CAD

Use curves as modeling primitives.

### 98. Curves for CAM

Use curves as manufacturing boundaries and toolpaths.

### 99. Curves for Games

Use curves for roads, tracks, trajectories, and procedural worlds.

### 100. Curve Modeling Workshop

Build a complete curve toolkit.

---

# Section V — Surfaces and Solid Geometry

### Lessons 101–130

### 101. Surfaces as Functions

Represent surfaces mathematically.

### 102. Parametric Surfaces

Generalize curves to two parameters.

### 103. Surface Tangents

Derive tangent planes.

### 104. Surface Normals

Build surface orientation.

### 105. Bézier Surfaces

Generalize Bézier curves.

### 106. B-Spline Surfaces

Build smooth freeform surfaces.

### 107. NURBS Surfaces

Build the foundation of industrial surface modeling.

### 108. Surface Continuity

Understand G0, G1, G2, and higher continuity.

### 109. Surface Intersections

Derive surface-surface intersection problems.

### 110. Surface Trimming

Separate underlying surfaces from visible regions.

### 111. Parametric Domains

Understand UV parameter spaces.

### 112. Surface Evaluation

Implement efficient point and derivative evaluation.

### 113. Surface Tessellation

Convert surfaces into renderable meshes.

### 114. Adaptive Tessellation

Increase detail where geometry requires it.

### 115. Implicit Surfaces

Represent geometry through equations.

### 116. Signed Distance Fields

Represent geometry using distance functions.

### 117. Constructive Solid Geometry

Build solids through set operations.

### 118. Half-Spaces

Represent solids through inequalities.

### 119. Primitives

Build spheres, boxes, cylinders, cones, and tori.

### 120. Extrusion

Construct solids by sweeping profiles.

### 121. Revolution

Construct solids through rotational sweeps.

### 122. Sweeps

Generalize profile motion along paths.

### 123. Offsetting Solids

Understand geometric offsets.

### 124. Boolean Operations

Derive union, intersection, and difference.

### 125. Solid Validity

Determine whether a geometric model represents a valid solid.

### 126. Boundary Representations

Introduce B-rep modeling.

### 127. Geometry vs Topology

Separate shape from connectivity.

### 128. Euler Operators

Build and modify solid topology.

### 129. Solid Modeling Kernel Concepts

Understand the architecture of geometric kernels.

### 130. Solid Geometry Workshop

Build a miniature solid-modeling engine.

---

# Section VI — Meshes and Discrete Geometry

### Lessons 131–155

### 131. Why Meshes Exist

Connect continuous geometry to discrete computation.

### 132. Triangle Meshes

Build the universal rendering representation.

### 133. Vertex and Index Buffers

Represent shared geometry efficiently.

### 134. Mesh Connectivity

Represent adjacency.

### 135. Half-Edge Structures

Build topology-aware mesh representations.

### 136. Winged-Edge Structures

Compare topological representations.

### 137. Mesh Normals

Derive vertex and face normals.

### 138. Tangent Spaces

Build local surface coordinate systems.

### 139. UV Coordinates

Map surfaces to 2D domains.

### 140. Mesh Parameterization

Understand surface-to-plane mapping.

### 141. Mesh Simplification

Reduce geometric complexity.

### 142. Edge Collapse

Derive a fundamental simplification operation.

### 143. Mesh Subdivision

Increase geometric resolution.

### 144. Catmull-Clark Subdivision

Build smooth subdivision surfaces.

### 145. Loop Subdivision

Understand triangle-based subdivision.

### 146. Mesh Repair

Handle holes, duplicate vertices, and invalid topology.

### 147. Mesh Boolean Operations

Perform solid operations on polygonal models.

### 148. Remeshing

Create more useful mesh structures.

### 149. Adaptive Meshing

Concentrate detail where necessary.

### 150. Mesh Quality

Measure aspect ratio, angles, and distortion.

### 151. Collision Meshes

Separate visual and physical representations.

### 152. Simulation Meshes

Prepare geometry for numerical simulation.

### 153. Manufacturing Meshes

Understand mesh requirements for physical fabrication.

### 154. Mesh Conversion Pipelines

Move between CAD, rendering, simulation, and manufacturing representations.

### 155. Mesh Processing Workshop

Build a geometry-processing toolkit.

---

# Section VII — Rendering Foundations

### Lessons 156–185

### 156. What Is Rendering?

Define the transformation from scene description to image.

### 157. The Rendering Pipeline

Build the complete conceptual pipeline.

### 158. Rasterization

Derive image formation through discrete sampling.

### 159. Triangles as Rendering Primitives

Understand why triangles dominate real-time graphics.

### 160. Screen-Space Coordinates

Map geometry to pixels.

### 161. Triangle Rasterization

Implement a software rasterizer.

### 162. Barycentric Coordinates

Derive interpolation over triangles.

### 163. Depth Testing

Resolve visibility.

### 164. Back-Face Culling

Eliminate hidden surfaces.

### 165. Clipping

Handle geometry crossing the view boundary.

### 166. Perspective-Correct Interpolation

Understand why naïve interpolation fails under perspective.

### 167. Textures

Map images onto surfaces.

### 168. Texture Coordinates

Understand UV mapping.

### 169. Texture Filtering

Derive nearest, bilinear, and higher-order filtering.

### 170. Mipmaps

Solve texture minification.

### 171. Aliasing

Understand sampling artifacts.

### 172. Anti-Aliasing

Reduce discrete sampling errors.

### 173. Color Representation

Understand color as computational data.

### 174. Color Spaces

Distinguish display and computation spaces.

### 175. Lighting Models

Build lighting from geometry.

### 176. Lambertian Reflection

Derive diffuse lighting.

### 177. Specular Reflection

Introduce directional reflection.

### 178. Blinn-Phong

Build a practical lighting model.

### 179. Shadows

Derive visibility-based lighting.

### 180. Shadow Mapping

Implement real-time shadows.

### 181. Environment Lighting

Represent surrounding illumination.

### 182. Normal Mapping

Represent small-scale surface detail.

### 183. Materials

Separate geometry from surface appearance.

### 184. Render Passes

Compose complex rendering pipelines.

### 185. Build a Software Renderer

Integrate the entire pipeline without relying on a graphics engine.

---

# Section VIII — Modern Rendering and GPU Computation

### Lessons 186–215

### 186. GPU Architecture

Understand massively parallel computation.

### 187. Vertex Processing

Understand programmable geometry transformation.

### 188. Fragment Processing

Understand programmable pixel computation.

### 189. Shaders

Treat rendering programs as mathematical transformations.

### 190. Shader Inputs and Outputs

Understand data flow through the pipeline.

### 191. GPU Memory

Understand buffers and resource access.

### 192. Parallel Work

Map computation onto GPU execution.

### 193. Compute Shaders

Use the GPU beyond graphics.

### 194. GPU Synchronization

Understand dependencies between parallel operations.

### 195. Ray Casting

Derive image formation using rays.

### 196. Ray-Primitive Intersection

Build a ray-intersection library.

### 197. Recursive Ray Tracing

Derive reflection and refraction.

### 198. Acceleration Structures

Understand why naïve ray tracing is expensive.

### 199. Bounding Volume Hierarchies

Build BVHs.

### 200. Spatial Trees

Compare BVHs, KD trees, octrees, and grids.

### 201. Monte Carlo Rendering

Introduce random sampling into image formation.

### 202. Path Tracing

Derive physically based light transport.

### 203. Importance Sampling

Spend samples where they matter.

### 204. Variance Reduction

Reduce Monte Carlo noise.

### 205. Global Illumination

Understand indirect light.

### 206. Physically Based Materials

Model material response more realistically.

### 207. BRDFs

Formalize reflection distributions.

### 208. Microfacet Models

Connect roughness to microscopic geometry.

### 209. Image-Based Lighting

Use environment representations for illumination.

### 210. Volumetric Rendering

Render participating media.

### 211. Real-Time Global Illumination

Explore practical approximations.

### 212. Temporal Techniques

Reuse information between frames.

### 213. Rendering Performance

Analyze GPU bottlenecks.

### 214. GPU Debugging

Reason about parallel visual computation.

### 215. Build a Modern Renderer

Integrate rasterization, shaders, materials, lighting, and GPU computation.

---

# Section IX — Animation and Procedural Geometry

### Lessons 216–240

### 216. Time as a Parameter

Introduce temporal computation.

### 217. Keyframes

Represent changing state over time.

### 218. Interpolation

Derive smooth transitions.

### 219. Splines for Animation

Use curves for temporal control.

### 220. Easing Functions

Control perceived motion.

### 221. Orientation Interpolation

Use quaternions for rotational animation.

### 222. Hierarchical Animation

Build articulated objects.

### 223. Forward Kinematics

Compute positions from joint parameters.

### 224. Inverse Kinematics

Solve for parameters from desired positions.

### 225. Jacobians

Connect kinematics to differential geometry.

### 226. Constraints in Animation

Maintain geometric relationships.

### 227. Skinning

Deform geometry using skeletons.

### 228. Linear Blend Skinning

Implement skeletal deformation.

### 229. Dual-Quaternion Skinning

Improve rotational deformation.

### 230. Morph Targets

Represent shape interpolation.

### 231. Procedural Animation

Generate motion algorithmically.

### 232. Procedural Geometry

Generate geometry from rules.

### 233. Noise

Generate structured variation.

### 234. Fractals

Generate recursive geometric structure.

### 235. Terrain Generation

Build landscapes computationally.

### 236. Roads and Paths

Generate structured environments.

### 237. Vegetation

Generate natural-looking geometry.

### 238. Destruction and Fracture

Generate changing geometry.

### 239. Procedural Worlds

Combine terrain, objects, rules, and spatial systems.

### 240. Procedural Generation Workshop

Build a procedural world generator.

---

# Section X — Collision Detection and Physics

### Lessons 241–275

### 241. What Is a Physical Simulation?

Model state and laws of evolution.

### 242. Position and Velocity

Introduce physical state.

### 243. Acceleration

Connect forces to motion.

### 244. Numerical Integration

Turn differential equations into executable updates.

### 245. Euler Integration

Implement the simplest integrator.

### 246. Semi-Implicit Euler

Understand improved stability.

### 247. Verlet Integration

Explore alternative integration strategies.

### 248. Runge-Kutta Methods

Build higher-order integration.

### 249. Stability

Understand why numerical simulations explode.

### 250. Particles

Build the simplest physics engine.

### 251. Springs

Model elastic forces.

### 252. Constraints

Represent physical relationships.

### 253. Collision Detection

Define geometric contact.

### 254. Broad Phase

Quickly eliminate impossible collisions.

### 255. Narrow Phase

Compute exact contact information.

### 256. AABB Collision

Build axis-aligned bounding-box tests.

### 257. Separating Axis Theorem

Derive convex collision detection.

### 258. GJK

Develop a general convex distance algorithm.

### 259. EPA

Compute penetration information.

### 260. Contact Manifolds

Represent persistent collision contact.

### 261. Impulse Resolution

Resolve rigid-body collisions.

### 262. Friction

Model tangential contact forces.

### 263. Restitution

Model bounciness.

### 264. Rigid Bodies

Add orientation and rotational state.

### 265. Inertia Tensors

Represent rotational resistance.

### 266. Angular Momentum

Build rotational dynamics.

### 267. Constraints and Joints

Create articulated bodies.

### 268. Position-Based Dynamics

Introduce constraint-driven simulation.

### 269. Cloth

Simulate deformable surfaces.

### 270. Soft Bodies

Simulate deformable volumes.

### 271. Particles and Fluids

Introduce particle-based fluid models.

### 272. Spatial Acceleration

Optimize physical queries.

### 273. Physics Engine Architecture

Separate collision, dynamics, integration, and constraints.

### 274. Determinism

Understand repeatable simulation.

### 275. Build a Physics Engine

Create a usable rigid-body simulation system.

---

# Section XI — CAD Foundations

### Lessons 276–305

### 276. What Makes CAD Different?

Distinguish geometric drawing from engineering modeling.

### 277. CAD as Constraint-Based Geometry

Introduce design intent.

### 278. Sketches

Represent 2D construction geometry.

### 279. Geometric Constraints

Model coincidence, parallelism, perpendicularity, tangency, and symmetry.

### 280. Dimensional Constraints

Represent engineering dimensions.

### 281. Degrees of Freedom

Determine what remains unspecified.

### 282. Constraint Graphs

Represent relationships between geometric entities.

### 283. Constraint Solving

Turn design intent into equations.

### 284. Nonlinear Constraint Systems

Handle general geometric constraints.

### 285. Numerical Constraint Solvers

Use iterative methods.

### 286. Parametric Modeling

Represent geometry through parameters.

### 287. Dependency Graphs

Track relationships between features.

### 288. Feature Trees

Represent construction history.

### 289. Extrusion Features

Create solids from sketches.

### 290. Revolve Features

Create rotational solids.

### 291. Sweep Features

Create path-driven solids.

### 292. Loft Features

Blend profiles into surfaces.

### 293. Fillets

Create rounded transitions.

### 294. Chamfers

Create beveled transitions.

### 295. Drafts

Model manufacturing-oriented surfaces.

### 296. Shelling

Create thin-walled solids.

### 297. Boolean Features

Build solids through constructive operations.

### 298. Parametric Regeneration

Recompute a model after parameter changes.

### 299. Topological Naming

Understand why persistent geometry identity is difficult.

### 300. CAD Model Validity

Define what constitutes a valid model.

### 301. CAD Tolerances

Represent approximate geometry safely.

### 302. Measurement

Compute dimensions and geometric relationships.

### 303. Sectioning

Generate cross-sectional geometry.

### 304. Engineering Visualization

Represent models for human interpretation.

### 305. Build a Parametric CAD Prototype

Integrate sketching, constraints, features, and regeneration.

---

# Section XII — Advanced CAD Geometry and Geometry Kernels

### Lessons 306–335

### 306. Geometry Kernels

Understand the architecture of industrial geometric modeling systems.

### 307. Topology Data Structures

Represent vertices, edges, loops, faces, shells, and solids.

### 308. Geometry-Topology Association

Connect mathematical surfaces to topological entities.

### 309. Edge Curves and Face Surfaces

Understand trimmed geometry.

### 310. Parametric Trimming

Represent boundaries on surfaces.

### 311. Curve-Curve Intersection

Build robust intersection algorithms.

### 312. Curve-Surface Intersection

Generalize intersection queries.

### 313. Surface-Surface Intersection

Build intersection curves.

### 314. Boolean Classification

Determine inside/outside relationships.

### 315. Solid Boolean Algorithms

Construct robust solid operations.

### 316. Offset Surfaces

Derive engineering offsets.

### 317. Offset Failure

Understand self-intersections and singularities.

### 318. Blending Geometry

Construct smooth transitions.

### 319. Surface Fairing

Improve smoothness without destroying design intent.

### 320. Geometric Continuity

Use continuity as a design constraint.

### 321. Tolerance Propagation

Understand numerical uncertainty through operations.

### 322. Robust Predicates

Build geometry algorithms that survive degenerate cases.

### 323. Exact Predicates and Approximate Constructions

Combine exact decisions with floating-point geometry.

### 324. Healing Geometry

Repair imported models.

### 325. STEP-Style Product Representation

Understand exchanging engineering models.

### 326. Mesh-to-B-Rep Conversion

Explore reverse engineering.

### 327. Point Clouds

Represent scanned geometry.

### 328. Surface Reconstruction

Build surfaces from measurements.

### 329. Reverse Engineering

Recover CAD-like structure from physical geometry.

### 330. Feature Recognition

Infer design intent from geometry.

### 331. Geometric Search

Query models for spatial and topological relationships.

### 332. Geometry Kernel Testing

Build adversarial geometric test cases.

### 333. Kernel Performance

Optimize expensive geometric operations.

### 334. Kernel Architecture

Design the layers of a reusable geometry engine.

### 335. Build a Mini Geometry Kernel

Integrate curves, surfaces, topology, intersections, and solids.

---

# Section XIII — CAM and Computational Manufacturing

### Lessons 336–365

This section is deliberately part of BRD 6 rather than a separate manufacturing afterthought.

### 336. What Is CAM?

Translate geometric intent into manufacturing operations.

### 337. CAD Geometry vs Manufacturing Geometry

Understand why the representations differ.

### 338. Stock Models

Represent material before machining.

### 339. Tools

Represent cutters and their geometry.

### 340. Tool Orientation

Understand tool axes and frames.

### 341. Machining Constraints

Represent machine and material limitations.

### 342. 2D Contouring

Generate boundary-following toolpaths.

### 343. Pocketing

Remove material from regions.

### 344. Facing

Generate planar material-removal paths.

### 345. Drilling

Generate drilling operations.

### 346. Roughing

Remove large amounts of material efficiently.

### 347. Finishing

Follow final geometry accurately.

### 348. Tool Offsets

Account for cutter geometry.

### 349. Curve Offsets for Toolpaths

Derive offset-based machining paths.

### 350. Surface Toolpaths

Generate paths across freeform surfaces.

### 351. Z-Level Machining

Build layered machining strategies.

### 352. Contour Parallel Toolpaths

Generate nested offsets.

### 353. Raster Toolpaths

Generate directional surface passes.

### 354. Adaptive Clearing

Optimize material removal.

### 355. Toolpath Optimization

Minimize travel and machining time.

### 356. Collision Detection

Detect tool, holder, stock, and fixture collisions.

### 357. Gouge Detection

Ensure the cutter does not remove unintended material.

### 358. Rest Machining

Machine material left by previous tools.

### 359. Multi-Axis Machining

Introduce additional degrees of freedom.

### 360. 5-Axis Geometry

Represent continuously changing tool orientation.

### 361. Inverse Kinematics for Machines

Convert tool orientation into machine axes.

### 362. Machine Simulation

Simulate the physical machine.

### 363. Post-Processing

Translate abstract toolpaths into machine-specific commands.

### 364. G-Code Concepts

Understand the computational model behind CNC instructions.

### 365. Build a CAM Prototype

Generate, visualize, validate, and simulate toolpaths.

---

# Section XIV — Simulation and Engineering Computation

### Lessons 366–395

If the BRD is allowed to exceed the original target, I would keep this section. It is important for the “anything else” requirement.

### 366. Differential Equations as Models

Represent changing physical systems mathematically.

### 367. Initial-Value Problems

Define simulation starting conditions.

### 368. Boundary Conditions

Represent constraints imposed by the environment.

### 369. Numerical Approximation

Understand why continuous systems must be discretized.

### 370. Error and Convergence

Measure whether numerical solutions improve.

### 371. Adaptive Time Stepping

Change simulation resolution according to behavior.

### 372. Stiff Systems

Understand difficult numerical dynamics.

### 373. Ordinary Differential Equation Solvers

Build reusable ODE infrastructure.

### 374. Partial Differential Equations

Introduce spatially distributed systems.

### 375. Finite Differences

Discretize derivatives.

### 376. Finite Volumes

Model conservation laws.

### 377. Finite Elements

Represent fields over meshes.

### 378. Basis Functions

Understand approximation spaces.

### 379. Element Assembly

Construct global systems from local elements.

### 380. Boundary Constraints

Apply physical conditions to numerical systems.

### 381. Linear Solvers

Solve large sparse systems.

### 382. Sparse Matrices

Represent computationally large systems efficiently.

### 383. Heat Simulation

Build a complete PDE example.

### 384. Wave Simulation

Model propagation.

### 385. Elasticity

Model deformation.

### 386. Stress and Strain

Introduce engineering mechanics.

### 387. Finite-Element Geometry

Connect CAD geometry to simulation meshes.

### 388. Mesh Refinement

Improve simulation accuracy.

### 389. Fluid Simulation

Introduce computational fluid models.

### 390. Particle-Based Fluids

Explore alternative fluid representations.

### 391. Grid-Based Fluids

Model fluid fields on discrete grids.

### 392. Simulation Stability

Understand numerical explosions and artifacts.

### 393. Simulation Validation

Compare computational models against physical behavior.

### 394. Simulation Visualization

Turn numerical fields into interpretable images.

### 395. Build an Engineering Simulation

Integrate geometry, meshing, numerical methods, solving, and visualization.

---

# Section XV — Game and Interactive Engine Architecture

### Lessons 396–425

This is another area I would **not omit** merely because “games” are an application.

If the goal is to build a general graphics system, games are one of the best integration targets.

### 396. Interactive Worlds

Understand computation that continuously responds to input.

### 397. The Game Loop

Derive update/render cycles.

### 398. Fixed vs Variable Time Steps

Understand simulation timing.

### 399. Input Systems

Model human interaction as events and state.

### 400. Cameras

Build interactive camera systems.

### 401. Scene Graphs

Represent hierarchical worlds.

### 402. Entities

Represent objects in a world.

### 403. Components

Separate data from behavior.

### 404. Entity-Component Systems

Build scalable world representation.

### 405. Resource Management

Manage textures, meshes, shaders, sounds, and models.

### 406. Asset Pipelines

Transform source assets into runtime representations.

### 407. Serialization

Represent worlds as persistent data.

### 408. Scripting

Expose engine capabilities to higher-level programs.

### 409. Animation Systems

Integrate skeletal and procedural animation.

### 410. Physics Integration

Connect simulation to interactive worlds.

### 411. Collision Queries

Expose geometry to gameplay logic.

### 412. Particle Systems

Build visual and physical effects.

### 413. Lighting Systems

Integrate rendering with dynamic worlds.

### 414. Level Representation

Represent large interactive environments.

### 415. Spatial Partitioning

Accelerate world queries.

### 416. Terrain Systems

Represent large landscapes.

### 417. Level of Detail

Scale geometric complexity with distance.

### 418. Streaming Worlds

Load and unload world regions dynamically.

### 419. Destruction Systems

Modify world geometry during runtime.

### 420. Procedural Worlds

Generate worlds from algorithms.

### 421. Replay Systems

Represent and reproduce simulation state.

### 422. Deterministic Simulation

Support reproducible worlds.

### 423. Engine Architecture

Separate platform, rendering, physics, world, and gameplay layers.

### 424. Engine Profiling

Measure frame time and subsystem costs.

### 425. Build a Mini Game Engine

Integrate rendering, input, physics, animation, assets, and world management.

---

# Section XVI — Advanced Visualization and Interactive Geometry

### Lessons 426–450

### 426. Scientific Visualization

Represent mathematical and physical data visually.

### 427. Scalar Fields

Represent quantities over space.

### 428. Vector Fields

Represent direction and magnitude over space.

### 429. Contours

Extract constant-value curves.

### 430. Isosurfaces

Extract constant-value surfaces.

### 431. Marching Squares

Derive 2D contour extraction.

### 432. Marching Cubes

Derive 3D isosurface extraction.

### 433. Volume Rendering

Render volumetric data.

### 434. Slicing

Visualize cross-sections.

### 435. Streamlines

Visualize vector fields.

### 436. Glyph Visualization

Represent vectors through geometric symbols.

### 437. Transfer Functions

Map numerical data to visual appearance.

### 438. Large-Scale Visualization

Handle massive geometric datasets.

### 439. Point Clouds

Render spatial measurements.

### 440. Spatial Data Interaction

Query geometry interactively.

### 441. Measurement Tools

Build accurate visual measurement.

### 442. Selection

Determine what the user clicked.

### 443. Picking

Map screen positions back into 3D geometry.

### 444. Manipulators

Build interactive translation, rotation, and scaling controls.

### 445. Gizmos

Represent editing operations visually.

### 446. Snapping

Connect interactive geometry to constraints.

### 447. Section and Slice Tools

Interactively inspect models.

### 448. Exploded Views

Represent assemblies spatially.

### 449. Interactive Model Inspection

Build professional geometry exploration tools.

### 450. Visualization Workshop

Build an interactive engineering visualization application.

---

# Section XVII — Robotics, Kinematics, and Physical Machines

### Lessons 451–475

### 451. Robots as Geometric Systems

Model robots through coordinate frames.

### 452. Rigid Transform Chains

Represent articulated structures.

### 453. Forward Kinematics

Compute end-effector positions.

### 454. Inverse Kinematics

Solve desired configurations.

### 455. Jacobians

Relate joint changes to spatial motion.

### 456. Singularities

Understand where motion becomes degenerate.

### 457. Velocity Kinematics

Model movement through differential relationships.

### 458. Acceleration Kinematics

Extend to second derivatives.

### 459. Robot Dynamics

Model forces and motion.

### 460. Trajectory Planning

Generate physically feasible movement.

### 461. Collision-Free Planning

Combine geometry with search.

### 462. Configuration Spaces

Transform motion planning into geometry.

### 463. Sampling-Based Planning

Introduce probabilistic motion planning.

### 464. RRT

Build rapidly exploring random trees.

### 465. Path Optimization

Improve generated paths.

### 466. Robot Simulation

Integrate geometry, physics, and control.

### 467. Manipulation

Model interaction with objects.

### 468. Grasp Geometry

Represent contact between tools and objects.

### 469. Machine Kinematics

Model CNC and industrial machinery.

### 470. Tool Orientation Planning

Connect geometry to manufacturing.

### 471. Calibration

Estimate geometric parameters from measurements.

### 472. Coordinate Registration

Align independent coordinate systems.

### 473. Point-Cloud Alignment

Introduce geometric registration.

### 474. Robotics Visualization

Build interactive robot models.

### 475. Robotics Workshop

Create a simulated articulated machine.

---

# Section XVIII — Integration and Master Projects

### Lessons 476–500

At this point I would deliberately stop teaching isolated concepts.

The final lessons should become increasingly project-driven.

### 476. Build a Geometry Library

Integrate points, vectors, matrices, transforms, intersections, curves, and surfaces.

### 477. Build a Mesh Library

Integrate topology, geometry, normals, UVs, and mesh processing.

### 478. Build a Renderer

Create a complete rendering pipeline.

### 479. Build a Ray Tracer

Implement geometric intersection and light transport.

### 480. Build a GPU Renderer

Move computationally intensive rendering to parallel hardware.

### 481. Build an Animation System

Integrate time, curves, skeletons, and interpolation.

### 482. Build a Collision Library

Create broad and narrow phase geometry queries.

### 483. Build a Physics Engine

Integrate rigid bodies, contacts, constraints, and integration.

### 484. Build a Procedural World

Generate terrain, objects, paths, and environments.

### 485. Build a CAD Sketcher

Create geometry and solve constraints.

### 486. Build a Parametric Modeler

Create features and regenerate models.

### 487. Build a Surface Modeler

Implement curves, surfaces, trimming, and visualization.

### 488. Build a Solid Modeler

Implement topology and Boolean operations.

### 489. Build a Geometry Kernel

Combine the geometric subsystems.

### 490. Build a Mesh Conversion Pipeline

Move between CAD, rendering, and simulation representations.

### 491. Build a CAM Toolpath Generator

Generate manufacturing paths from geometry.

### 492. Build a Toolpath Simulator

Visualize machining and detect collisions.

### 493. Build a Machine Simulator

Model machine axes and motion.

### 494. Build a Scientific Visualization Tool

Visualize fields and simulation results.

### 495. Build a Robotics Simulator

Integrate geometry, physics, kinematics, and visualization.

### 496. Build a Mini Game Engine

Integrate rendering, physics, animation, input, and worlds.

### 497. Build an Integrated Digital Model

Represent one object through:

```text
CAD
 ↓
B-Rep
 ↓
Mesh
 ↓
Renderer
 ↓
Physics
 ↓
CAM
 ↓
Machine Simulation
```

### 498. Build a Cross-Domain Geometry System

Use the same geometric primitives across CAD, games, simulation, and visualization.

### 499. Solve an Unfamiliar Geometric Problem

Given no prescribed algorithm, derive the representation, algorithm, and numerical strategy.

### 500. Final Capstone — Build Something That Doesn't Exist in the Lessons

The learner proposes a substantial system and must independently:

1. specify it;
2. model it mathematically;
3. select representations;
4. design geometric algorithms;
5. establish numerical tolerances;
6. implement the core;
7. visualize the result;
8. test degeneracies;
9. benchmark it;
10. document assumptions;
11. identify limitations;
12. derive future extensions.

---

# 8. The Most Important Architectural Change

I would make one thing explicit in this BRD:

> **There is no single “graphics representation.”**

A major goal of the curriculum is teaching the learner that the same object may need many representations.

For example:

```text
Mechanical Part
       │
       ├── Parametric Features
       │
       ├── B-Rep
       │
       ├── NURBS Surfaces
       │
       ├── Tessellated Mesh
       │
       ├── Collision Geometry
       │
       ├── Simulation Mesh
       │
       ├── Toolpath Geometry
       │
       └── Render Representation
```

The learner should understand **why** each representation exists.

That is one of the deepest ideas connecting CAD, games, graphics, simulation, and CAM.

---

# 9. The Geometry Representation Ladder

The BRD should repeatedly return to this progression:

```text
Point
 ↓
Primitive
 ↓
Curve
 ↓
Surface
 ↓
Solid
 ↓
Topology
 ↓
Mesh
 ↓
Scene
 ↓
Physical State
 ↓
Manufacturing State
```

And also:

```text
Continuous Geometry
        ↓
Approximation
        ↓
Discretization
        ↓
Numerical Computation
        ↓
Simulation / Rendering / Manufacturing
```

The learner should understand that a mesh is not “the object.”

It is **one computational representation of the object**.

That distinction becomes extremely important when building a real CAD/CAM system.

---

# 10. CAD Should Be Treated as a Computational Discipline

The CAD portion should not become:

> “Here is how to draw a box.”

Instead, the learner should understand:

```text
Intent
 ↓
Parameters
 ↓
Constraints
 ↓
Dependency Graph
 ↓
Geometric Construction
 ↓
Topology
 ↓
Regeneration
 ↓
Validation
```

For example:

```text
Sketch
   │
   ├── dimensions
   ├── coincidence
   ├── tangency
   └── symmetry
          ↓
      Constraint Solver
          ↓
      Profile Geometry
          ↓
       Extrusion
          ↓
        Solid
          ↓
      Feature Tree
```

That is the computational foundation of a parametric CAD system.

---

# 11. CAM Should Be Treated as Geometry + Optimization + Physics

CAM should likewise not be treated as a file-format exercise.

The underlying problem is:

> Given a desired physical result, a geometric model, a tool, a machine, material constraints, and manufacturing constraints, derive a feasible sequence of machine motions.

That naturally produces:

```text
CAD Model
    ↓
Manufacturing Geometry
    ↓
Operation Planning
    ↓
Tool Selection
    ↓
Toolpath Generation
    ↓
Collision / Gouge Checking
    ↓
Machine Kinematics
    ↓
Simulation
    ↓
Post Processing
    ↓
Machine Instructions
```

This is a **computational problem**, which is exactly why it belongs here.

---

# 12. Games Are Not a Separate Afterthought

The same mathematical machinery becomes:

| Fundamental concept | Game application           | CAD/CAM application      |
| ------------------- | -------------------------- | ------------------------ |
| Coordinate frames   | Character/world transforms | Part/assembly frames     |
| Curves              | Roads, animation paths     | Sketches/toolpaths       |
| Surfaces            | Terrain                    | NURBS surfaces           |
| Meshes              | Characters/worlds          | Visualization/export     |
| Collision           | Gameplay physics           | Tool/fixture collision   |
| Spatial indexing    | World queries              | Geometry queries         |
| Constraints         | Physics/joints             | Parametric sketches      |
| Transforms          | Cameras                    | Machine coordinates      |
| Kinematics          | Character/robot motion     | CNC/robot motion         |
| Simulation          | Physics                    | Manufacturing simulation |
| Rendering           | Game graphics              | CAD visualization        |
| Procedural geometry | Worlds                     | Model generation         |
| Ray intersection    | Rendering                  | Geometry queries         |
| Optimization        | Performance                | Toolpaths/design         |

That is exactly the kind of cross-domain transfer the original Foundations BRD was designed to teach.

---

# 13. Required Project Ladder

The projects should progressively build toward the user's actual capability rather than being disconnected exercises.

### Project 1 — Geometry Library

```text
vectors
matrices
points
rays
planes
intersections
transforms
```

### Project 2 — 2D Geometry Editor

```text
points
lines
arcs
curves
selection
snapping
constraints
```

### Project 3 — Software Rasterizer

```text
triangles
barycentric coordinates
depth
textures
lighting
```

### Project 4 — 3D Viewer

```text
camera
meshes
materials
transforms
selection
```

### Project 5 — Ray Tracer

```text
rays
intersections
materials
shadows
reflection
```

### Project 6 — Physics Engine

```text
collision
rigid bodies
constraints
integration
```

### Project 7 — Game Engine

```text
world
entities
components
rendering
physics
animation
input
```

### Project 8 — CAD Sketcher

```text
geometry
constraints
dimensions
solver
```

### Project 9 — Parametric CAD

```text
sketch
extrude
revolve
fillet
boolean
feature tree
```

### Project 10 — Geometry Kernel

```text
B-rep
topology
surfaces
trimming
intersections
booleans
```

### Project 11 — CAM System

```text
stock
tools
offsets
pockets
contours
roughing
finishing
```

### Project 12 — CNC Simulator

```text
machine kinematics
tool motion
collision
stock removal
visualization
```

### Project 13 — Simulation System

```text
meshes
ODEs
PDEs
finite elements
visualization
```

### Project 14 — Integrated Digital Engineering System

```text
CAD
 ↓
Geometry Kernel
 ↓
Mesh
 ├── Renderer
 ├── Physics
 └── Simulation
 ↓
CAM
 ↓
Machine Simulation
```

That final project would be enormously valuable because it forces the learner to understand **representation conversion**, which is one of the central problems in real engineering software.

---

# 14. Lesson Structure

The lesson format should be consistent with BRD 1.

Every major concept should answer:

### Motivation

What real geometric or computational problem exists?

### Intuition

What is the simplest mental model?

### Formalization

What exactly is the mathematical object?

### Derivation

Where did the algorithm or representation come from?

### Representation

How should a computer store it?

### Algorithm

How do we compute with it?

### Numerical Issues

What happens when mathematics meets finite precision?

### Visualization

Can we see the result?

### Implementation

How do we build it?

### Correctness

Why does it work?

### Complexity

How expensive is it?

### Failure Cases

What happens with degeneracies?

### Applications

Where is it useful?

### Connections

What other domains use the same idea?

---

# 15. The “Derive It Yourself” Requirement

This BRD should have especially strong reconstruction exercises.

Examples:

> Given three points, derive an orientation test.

> Given two geometric objects, derive an intersection test.

> Given an ordered polygon, derive a point-in-polygon algorithm.

> Given a camera and a 3D point, derive its screen position.

> Given triangles and a framebuffer, derive a rasterizer.

> Given a surface and a tool radius, derive a toolpath offset.

> Given a parametric sketch and constraints, derive a constraint solver.

> Given a solid represented by boundaries, derive a Boolean operation.

> Given bodies and forces, derive a numerical simulation.

> Given a target machine position, derive the required joint configuration.

> Given CAD geometry and a cutting tool, derive a collision-free machining path.

The learner should repeatedly be placed in the position:

> **“You have the mathematics. Now invent the machinery.”**

---

# 16. Numerical Robustness Is a First-Class Subject

This is particularly important for CAD/CAM.

Graphics can often tolerate:

> “close enough.”

CAD kernels frequently cannot.

A tiny numerical error can produce:

```text
invalid solid
       ↓
failed Boolean
       ↓
broken feature
       ↓
invalid toolpath
       ↓
incorrect manufacturing result
```

Therefore BRD 6 should make numerical robustness much deeper than the original Foundations course.

The learner should understand:

* floating-point error;
* tolerances;
* epsilon strategies;
* conditioning;
* robust predicates;
* degeneracies;
* near-parallel lines;
* coincident surfaces;
* tangent intersections;
* self-intersections;
* topology errors;
* error propagation;
* exact predicates;
* symbolic/numeric hybrids.

This is one of the places where a serious CAD system diverges sharply from a toy graphics engine.

---

# 17. The Unified Computational Model

The BRD should ultimately teach the learner to see all of these as variations on one problem:

### Graphics

> What does this scene look like from this viewpoint?

### Physics

> How does this state evolve according to these laws?

### CAD

> What geometric object satisfies these design constraints?

### CAM

> What sequence of physical operations produces the desired geometry?

### Robotics

> What configuration produces this desired physical pose?

### Games

> How does this interactive world evolve and respond?

### Visualization

> How can this mathematical state be represented perceptually?

These are not unrelated subjects.

They are different computational questions about **geometry, state, constraints, transformations, and numerical processes**.

---

# 18. Optional Advanced Branches

After the core BRD, the learner can branch further.

## Branch A — Advanced Rendering

* physically based rendering;
* bidirectional path tracing;
* photon mapping;
* spectral rendering;
* neural rendering;
* real-time GI;
* advanced GPU architecture;
* rendering research.

## Branch B — Advanced CAD

* advanced NURBS;
* subdivision modeling;
* implicit CAD;
* feature recognition;
* topology optimization;
* generative design;
* direct modeling;
* assembly solving.

## Branch C — Advanced CAM

* 5-axis machining;
* multi-axis tool orientation;
* machine-specific kinematics;
* advanced toolpath optimization;
* cutting-force models;
* machining simulation;
* adaptive manufacturing.

## Branch D — Advanced Physics

* deformable bodies;
* fluids;
* granular materials;
* fracture;
* multiphysics;
* finite elements;
* finite volumes;
* computational mechanics.

## Branch E — Advanced Games

* large-scale worlds;
* networking;
* advanced animation;
* AI-driven worlds;
* procedural generation;
* destruction;
* multiplayer simulation;
* engine architecture.

## Branch F — Robotics

* SLAM;
* motion planning;
* manipulation;
* control;
* perception;
* robot dynamics;
* autonomous systems.

## Branch G — Computational Manufacturing

* additive manufacturing;
* robotic manufacturing;
* inspection;
* metrology;
* scan-to-CAD;
* digital twins;
* manufacturing optimization.

---

# 19. The Ultimate BRD 6 Objective

Completion should **not** mean:

> “The learner knows how to use a graphics API.”

Nor:

> “The learner knows how to use CAD software.”

Nor:

> “The learner knows how to make a game.”

The goal is:

> **The learner understands the computational foundations from which graphics, games, CAD, CAM, simulation, robotics, and visualization systems can be constructed.**

A graduate should be able to look at a problem like:

> “I want to build my own CAD system.”

and naturally decompose it into:

```text
Geometry
    ↓
Numerical Representation
    ↓
Curves
    ↓
Surfaces
    ↓
Topology
    ↓
Constraints
    ↓
Parametric Modeling
    ↓
Feature Graph
    ↓
Solid Modeling
    ↓
Boolean Geometry
    ↓
Visualization
    ↓
Meshing
    ↓
Simulation
    ↓
CAM
```

Or:

> “I want to build my own game engine.”

and see:

```text
Math
 ↓
Transforms
 ↓
Geometry
 ↓
Meshes
 ↓
Rendering
 ↓
GPU
 ↓
Materials
 ↓
Animation
 ↓
Collision
 ↓
Physics
 ↓
World Representation
 ↓
Input
 ↓
Assets
 ↓
Simulation
 ↓
Interaction
```

Or:

> “I want to simulate a robot machining a CAD part.”

and see:

```text
CAD Geometry
      ↓
B-Rep
      ↓
Toolpath
      ↓
Machine Kinematics
      ↓
Collision Geometry
      ↓
Physics / Motion
      ↓
Simulation
      ↓
Visualization
```

That is the level of integration I think you are actually looking for.

---

# 20. Revised Series Architecture

I would therefore revise the family to something closer to:

```text
                    ┌──────────────────────────┐
                    │ BRD 1                    │
                    │ COMPUTATIONAL            │
                    │ FOUNDATIONS              │
                    │                          │
                    │ Mathematics              │
                    │ Algorithms               │
                    │ Computation              │
                    │ Programming              │
                    └────────────┬─────────────┘
                                 │
          ┌──────────────────────┼────────────────────────┐
          │                      │                        │
          ▼                      ▼                        ▼
 ┌─────────────────┐    ┌─────────────────┐     ┌─────────────────┐
 │ BRD 2           │    │ BRD 3           │     │ BRD 4           │
 │ SOFTWARE        │    │ AI / ML         │     │ SYSTEMS         │
 │ ENGINEERING     │    │                 │     │ ENGINEERING     │
 └─────────────────┘    └─────────────────┘     └─────────────────┘
          │                      │                        │
          └──────────────────────┼────────────────────────┘
                                 │
             ┌───────────────────┼───────────────────┐
             │                   │                   │
             ▼                   ▼                   ▼
      ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
      │ BRD 5       │    │ BRD 6       │    │ BRD 7       │
      │ SECURITY    │    │ GEOMETRY    │    │ SPECIALIZED │
      │ & CRYPTO    │    │ GRAPHICS    │    │ DOMAINS     │
      │             │    │ SIMULATION  │    │             │
      │             │    │ CAD / CAM   │    │             │
      │             │    │ GAMES       │    │             │
      │             │    │ ROBOTICS    │    │             │
      └─────────────┘    └─────────────┘    └─────────────┘
```

But **BRD 6 should be treated as a major branch, not a small optional appendix.**

And I would make the dependency graph explicit rather than saying:

> BRD 1 → BRD 2 → BRD 3 → BRD 4 → BRD 5 → BRD 6.

The real architecture is:

> **BRD 1 provides the common computational language. The other BRDs branch from it and cross-reference one another where useful.**

For your particular objective, a very natural path could be:

```text
BRD 1
  ↓
BRD 6
  ├── Geometry
  ├── Rendering
  ├── Simulation
  ├── CAD
  ├── CAM
  ├── Games
  └── Robotics
```

You would **not** need to complete Software Engineering, AI, Systems, or Security first.

Those become additional capabilities you can pull in when your projects require them.

And I think **500 lessons is actually a more honest scale for this BRD** than the old 150–250 estimate. Graphics alone can justify a deep curriculum; once you add computational geometry, CAD, CAM, simulation, games, robotics, and visualization, artificially keeping it at 150 lessons would recreate exactly the problem you noticed: it would become a survey rather than a foundation.

Most importantly, this version makes **your CAD/CAM goal a first-class design requirement without turning BRD 6 into a CAD-only curriculum**. The same geometric core can take you from a NURBS surface in a CAD kernel to a triangle mesh in a game engine, to a collision surface in a physics engine, to a toolpath in CAM, to a robot trajectory—and the learner understands why those transformations are possible.
