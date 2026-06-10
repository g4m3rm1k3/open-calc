# Three.js Masterclass: From Fundamentals to CAD/CAM & Game Engines

**Who this is for:** You want to learn 3D deeply. You are not just building a toy; you are building real, complex systems like CAD/CAM software, games with imported Blender characters, and animated mechanical assemblies. You want to understand the underlying math, the JavaScript data structures, and the architectural patterns required to make 3D performant.

**How this course is structured:** To achieve true mastery without overwhelming you with 6,000-line files, this masterclass is broken down into dozens of highly focused, atomic labs. Each lab targets *one* specific technical concept, explains the "why" deeply, and has you write the minimum code to prove it works.

---

## The Masterclass Curriculum

### Section 1: Memory, Math, and The Engine
| Lab | Title | Core Concept |
|-----|-------|--------------|
| [LAB-01](./THREE-LAB-01-SCENE-CAMERA-RENDERER.md) | The Engine Shell | Scene Graph, Right-Hand Rule, The WebGLRenderer loop. |
| [LAB-02](./THREE-LAB-02-JS-TYPED-ARRAYS.md) | JavaScript Memory & WebGL | Why `[1, 2, 3]` crashes the GPU, and what `Float32Array` is. |
| [LAB-03](./THREE-LAB-03-BUFFER-GEOMETRY-INDICES.md) | Indices & Shared Data | Building a quad. How indices save RAM by preventing duplicated vertices. |
| [LAB-04](./THREE-LAB-04-NORMALS-AND-MATH.md) | Face Normals | The math behind lighting. Why a flat plane needs vectors pointing "out". |

### Section 2: Projections and CAD Cameras
| Lab | Title | Core Concept |
|-----|-------|--------------|
| [LAB-05](./THREE-LAB-05-ORTHOGRAPHIC-CAMERAS.md) | Perspective vs Orthographic | The Frustum. Why CAD software uses Orthographic, and how to implement it. |
| `LAB-06` | Raycasting Fundamentals | Translating 2D clicks (NDC) to 3D lasers. Intersecting custom BufferGeometry. |
| `LAB-07` | Reverse-Engineering OrbitControls | Building a custom Trackball camera. Quaternions vs Euler angles (Gimbal Lock). |

### Section 3: Interaction and Architecture
| Lab | Title | Core Concept |
|-----|-------|--------------|
| `LAB-08` | Bounding Volume Hierarchies (BVH) | Big-O Notation in 3D. Why checking 1M polygons is slow, and how BVH makes it O(log N). |
| `LAB-09` | The Composite Pattern (Assemblies) | Using `THREE.Group`. Local vs World space. Building a robot arm. |
| `LAB-10` | Forward Kinematics | Rotating pivot points locally without breaking the global assembly. |
| `LAB-11` | The Exploded View (State Machines) | Storing 'Assembled' vs 'Exploded' states. Linear Interpolation (Lerp) for smooth separation. |

### Section 4: Assets, Materials, and Characters
| Lab | Title | Core Concept |
|-----|-------|--------------|
| `LAB-12` | Physically Based Rendering (PBR) | `MeshStandardMaterial`, Roughness, Metalness, and the BRDF equation. |
| `LAB-13` | The Asset Pipeline | Loading `.gltf` Blender files. Promises and the `LoadingManager`. |
| `LAB-14` | Skeletal Animation (Bones) | How `SkinnedMesh` works. Vertices weighted to bones. |
| `LAB-15` | The Animation Mixer | Playing "Idle" and "Walk" tracks, and blending them smoothly. |

### Section 5: Extreme Performance
| Lab | Title | Core Concept |
|-----|-------|--------------|
| `LAB-16` | Draw Calls & GPU Bottlenecks | Why adding 10,000 separate meshes kills the CPU single-thread. |
| `LAB-17` | InstancedMesh | Drawing 10,000 bolts with 1 draw call using transformation matrices. |
| `LAB-18` | Post-Processing | The Render Pipeline. Adding CAD-style highlight outlines to selected objects using `EffectComposer`. |

---

## How to Read This Series

This series strictly follows the **eCaM v2 Lesson Requirements Specification**:
1. **The One-Line Rule:** *Every* JS concept, data structure, math formula, and API method is explained *before* the code is written.
2. **Concept Blocks:** You will see blocks defining exactly what a concept is, the pain it solves, and the tradeoffs.
3. **Save and Try:** You will run and verify the code at every step.
