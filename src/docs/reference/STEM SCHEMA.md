# Lesson Schema

This is the mechanical production template for every lesson in the mathematics, physics, engineering, structural dynamics, signal processing, and machining-dynamics curriculum.

The schema exists to make a rigorous lesson reproducible. It is not a lesson philosophy and it is not a list of topics. It is the literal, ordered sequence of things to teach and produce so that following it in order makes a shallow formula-dump structurally difficult.

The central rule is:

> **Every mathematical or physical idea must be connected through the chain: physical meaning → mathematical representation → derivation → calculation → interpretation → verification.**

A student should never encounter an equation merely because "this is the equation we need." They should understand what physical problem produced it, what every term represents, why the equation has that form, how to manipulate it, what it predicts, and how the prediction can be checked.

---

# The Repetition Rule

**Every concept, quantity, equation, mathematical operation, physical principle, model, assumption, method, or term gets full, real treatment at every single use it appears in — first appearance or fiftieth.**

A hard concept — such as resonance, damping ratio, eigenvalue, Fourier transform, transfer function, regenerative chatter, or a delay differential equation — receives a genuine explanation every time it is used.

A basic concept — such as velocity, acceleration, a derivative, a vector, or a sinusoid — also receives an explicit explanation at the point of use.

There is no reduced "already learned" tier.

This is deliberate.

A student reading Lesson 14 should not have to remember exactly how Lesson 4 defined damping, nor open Lesson 4 to reconstruct the meaning of (\zeta). Lesson 14 must explain what damping means and why (\zeta) matters within its own context.

Prior lessons may appear under:

* **What you need to know first**
* the closing **Connection to the next lesson**

They must never substitute for explanation inside the lesson itself.

A lesson number is a navigation aid, not an explanation.

---

# Concept Files — Reuse Across Lessons and Curricula

The curriculum may maintain a shared catalog of standalone mathematical and physical concepts.

There should be one shared catalog:

`src/docs/concepts/`

Concept files are appropriate for supporting material that is sufficiently general to recur across multiple lessons or curricula.

Examples:

* `complex-numbers.md`
* `eigenvalues.md`
* `second-order-odes.md`
* `fourier-transform.md`
* `matrix-multiplication.md`
* `free-body-diagram.md`
* `units-and-dimensional-analysis.md`
* `sampling-and-aliasing.md`

A concept file is **not** a substitute for teaching the concept in the lesson.

The Repetition Rule still applies.

The lesson must explain the concept in the context in which it is being used. A concept file provides a deeper standalone treatment or reusable reference.

### When to factor something out

Factor a concept out when it:

* appears in multiple lessons,
* appears in multiple curricula,
* has a sufficiently general mathematical or physical identity,
* can be understood independently of the current problem.

Keep narrow, problem-specific reasoning inside the lesson.

For example:

**Concept file:**

> What an eigenvalue is and why eigenvalue problems occur in physical systems.

**Lesson:**

> Why the eigenvalue of this particular spindle/tool model corresponds to this particular natural frequency.

---

# Header

Write this once before the Concept Units.

```markdown
# Lesson N: <title>
```

The title should be **concept-first**, not merely application-first.

Bad:

> Lesson 8: Stability Lobes

Better:

> Lesson 8: Regenerative Stability and the Origin of Stability Lobes

---

## What you will learn

One paragraph describing:

1. the physical problem,
2. the mathematical idea,
3. the skill the student will acquire,
4. the practical consequence.

Example:

> You will model a vibrating tool as a single-degree-of-freedom mass-spring-damper system, derive its frequency response, and use the resulting equation to predict resonance. The transferable skill is learning how a physical system becomes a differential equation and how that equation can be used to predict measurable behavior.

---

## What you need to know first

Name the specific previous lessons and concepts required.

Example:

* Lesson 2: Newton's laws
* Lesson 3: derivatives
* Lesson 4: sinusoidal motion
* complex numbers
* units and dimensional analysis

"Nothing" is appropriate only for Lesson 1.

---

# Physical System Diagram

Whenever the lesson concerns a physical system, begin with a diagram.

The diagram should identify:

* physical objects,
* coordinate system,
* forces,
* displacement,
* velocity,
* acceleration,
* relevant constraints,
* inputs,
* outputs.

For a mass-spring-damper:

[
F(t)\rightarrow
\boxed{\text{Mass}}
\rightarrow x(t)
]

with the spring and damper explicitly identified.

The student must know **what the symbols refer to physically before encountering the equation containing them.**

---

# Mathematical Pipeline

Whenever the lesson participates in a larger mathematical or engineering pipeline, restate the full pipeline.

For example:

[
\boxed{\text{Physical System}}
\rightarrow
\boxed{\text{Assumptions}}
\rightarrow
\boxed{\text{Mathematical Model}}
\rightarrow
\boxed{\text{Differential Equation}}
\rightarrow
\boxed{\text{Solution}}
\rightarrow
\boxed{\text{Prediction}}
\rightarrow
\boxed{\text{Experiment}}
]

Mark the stage this lesson develops.

For machining dynamics:

[
\text{Tap Test}
\rightarrow
\text{Time Signals}
\rightarrow
\text{FFT}
\rightarrow
\text{FRF}
\rightarrow
\text{Modal Parameters}
\rightarrow
\text{Cutting Model}
\rightarrow
\text{Stability}
\rightarrow
\text{Stability Lobes}
]

A lesson should never present its own equation as if it exists independently of the larger system.

---

# Terms Used in This Lesson

One entry per important term.

Each term receives:

* **What it means**
* **Why it exists**
* **How it is used here**

Example:

### **Natural frequency**

The frequency at which a system oscillates when disturbed and then allowed to vibrate freely. It exists because the combination of inertia and restoring stiffness creates a preferred oscillation rate. In this lesson it determines where the mass-spring system will resonate when externally excited.

### **Damping**

The physical mechanisms that remove vibrational energy from a system. Damping exists because real structures do not oscillate indefinitely; energy is dissipated through material losses, joints, friction, and other mechanisms. In this lesson it controls the width and height of the resonance peak.

---

# Quantities, Equations, Models, and Assumptions

Replace the programming-specific **Objects and Methods Used** section with this.

Every significant mathematical or physical entity gets its own entry.

## Quantities

For every quantity:

* **Name**
* **Symbol**
* **Physical meaning**
* **Mathematical meaning**
* **SI unit**
* **Why it matters here**

Example:

### **Stiffness**

* **Symbol:** (k)
* **Physical meaning:** Resistance of a structure to deformation.
* **Mathematical meaning:** Force per unit displacement for a linear spring.
* **SI unit:** N/m.
* **Why it matters here:** Increasing stiffness raises the natural frequency of the tool structure.

---

## Equations

For every major equation:

* **Equation**
* **Origin**
* **Meaning of every term**
* **Units**
* **Assumptions**
* **What the equation predicts**
* **What the equation does not predict**

Example:

[
m\ddot{x}+c\dot{x}+kx=F(t)
]

Explain:

* where the mass term comes from,
* where the damping term comes from,
* where the stiffness term comes from,
* why they add,
* what each term's units are,
* what assumptions make the equation valid.

---

## Models

For every model:

* **Physical system represented**
* **Degrees of freedom**
* **Inputs**
* **Outputs**
* **Parameters**
* **Assumptions**
* **Limitations**
* **Why this model is useful**

---

## Assumptions

Every meaningful simplification must be named.

Examples:

* linear stiffness,
* small displacement,
* constant mass,
* viscous damping,
* rigid-body approximation,
* negligible nonlinearities,
* constant cutting coefficients.

Never hide assumptions inside equations.

---

# Recursive Concept Extraction Rule

Before writing a lesson, recursively analyze the mathematics and physics being introduced.

A teachable concept includes any:

* mathematical operation,
* mathematical structure,
* physical law,
* physical phenomenon,
* variable,
* parameter,
* equation,
* model,
* approximation,
* assumption,
* coordinate system,
* transformation,
* numerical method,
* measurement technique,
* signal-processing method,
* engineering principle,
* interpretation method.

Examples:

[
\frac{d x}{dt}
]

may introduce:

* derivative,
* rate of change,
* velocity if (x) represents displacement.

A Fourier-analysis lesson may introduce:

* frequency,
* periodic signal,
* complex exponential,
* Fourier transform,
* frequency spectrum,
* sampling,
* FFT.

These should not automatically become six separate units merely because six terms appear.

The stopping rule applies.

---

# The Stopping Rule

Continue splitting until each Concept Unit has **one central teachable idea**.

Do not split merely because several symbols appear.

For example:

[
\omega_n=\sqrt{\frac{k}{m}}
]

should not automatically become separate units for:

* square root,
* division,
* (k),
* (m),
* (\omega_n).

Those are components of the natural-frequency concept.

However, if the lesson introduces **dimensional analysis** for the first time, that is a separate concept because the student must learn a transferable reasoning method.

The test is:

> **Is this a genuinely different idea the student must understand, or merely a mathematical component of the current idea?**

---

# Concept Isolation Rule

The first appearance of every new mathematical or physical concept must be taught through an **isolated example** before it is embedded in the full engineering problem.

The isolated example should:

* use the simplest possible physical system,
* contain one primary new concept,
* use deliberately simple numbers,
* be solved completely,
* have an interpretable result,
* be explicitly discarded as a teaching model.

For example, before applying damping to a CNC spindle:

### Isolated system

[
m=1,\text{kg}
]

[
k=100,\text{N/m}
]

Calculate:

[
\omega_n=\sqrt{\frac{k}{m}}
]

Then:

[
\omega_n=10,\text{rad/s}
]

The student understands the relationship before confronting a real tool-holder-spindle model.

---

# Escalating Example Rule

When the real engineering problem is complicated, do not jump directly from the toy example to the real system.

Use an escalating sequence.

Example:

### Level 1 — Simple numbers

[
m=1,\qquad k=100
]

### Level 2 — Realistic numbers

[
m=0.25,\text{kg},\qquad k=2\times10^6,\text{N/m}
]

### Level 3 — Multiple parameters

Add damping.

### Level 4 — Multiple degrees of freedom

Introduce matrices.

### Level 5 — Experimental data

Use actual measured FRF data.

Each example should change only enough to introduce the next difficulty.

---

# Concept Unit

A Concept Unit is the smallest meaningful teaching section centered around one mathematical, physical, or engineering concept.

Each step below is its own `###` heading.

---

## 1. The Physical Problem

Begin with prose.

Explain:

* What physical situation are we examining?
* What is moving?
* What forces act?
* What are we trying to predict?
* Why is the current model insufficient?

No equation dump yet.

---

## 2. Physical Intuition

Before mathematics, explain what the system should do qualitatively.

Ask:

* What happens if stiffness increases?
* What happens if mass increases?
* What happens if damping increases?
* What should happen if the force gets larger?
* What should happen if the excitation frequency changes?

The student should make a prediction **before calculating the answer**.

---

## 3. Isolated Mathematical/Physical Example

Introduce the new concept with the smallest useful example.

For example:

[
F=kx
]

with:

[
k=100,\text{N/m}
]

and:

[
x=0.01,\text{m}
]

Calculate:

[
F=1,\text{N}
]

Then explicitly state:

> This relationship is the linear spring law. It says that, under the linear-spring assumption, doubling displacement doubles restoring force.

---

## 4. Name the Concept

State the formal name of the concept explicitly.

Do not leave the student knowing only what the mathematics does.

Example:

> This relationship is called **Hooke's law in its linear spring form**.

The student should leave the section with terminology they can recognize in textbooks, papers, software documentation, and engineering discussions.

---

## 5. Discard the Isolated Example

State that the example was deliberately constructed only to isolate the concept.

It is not part of the final engineering model.

---

# 6. Mathematical Formulation

Now introduce the real equation.

For example:

[
m\ddot{x}+c\dot{x}+kx=F(t)
]

Identify every component.

Explain:

* why the mass contribution appears,
* why damping appears,
* why stiffness appears,
* why they sum,
* why the right-hand side represents external excitation.

---

# 7. Derivation

Whenever mathematically appropriate, derive rather than merely state the result.

The derivation should show the chain of reasoning.

For example:

Start with Newton's law:

[
\sum F=m\ddot{x}
]

Forces opposing positive displacement:

[
F_s=-kx
]

[
F_c=-c\dot{x}
]

External force:

[
F(t)
]

Therefore:

[
F(t)-c\dot{x}-kx=m\ddot{x}
]

Rearrange:

[
m\ddot{x}+c\dot{x}+kx=F(t)
]

Explain every transition.

---

# 8. Mathematical Walkthrough

Literally enumerate every meaningful mathematical operation in the derivation.

For each step explain:

* what operation occurred,
* why it is valid,
* what physical meaning changed or became visible,
* what units are involved.

Do not say merely:

> "Now solve for (\omega_n)."

Instead:

> Starting from (m\ddot{x}+kx=0), divide by (m) so the acceleration term has coefficient 1. This produces (\ddot{x}+(k/m)x=0). The ratio (k/m) has units of (1/\text{s}^2), which is why its square root naturally has units of (1/\text{s}) and becomes the system's characteristic angular frequency.

---

# 9. Dimensional Analysis

Every important derived equation should receive a dimensional check when practical.

For:

[
\omega_n=\sqrt{\frac{k}{m}}
]

show:

[
\frac{\text{N/m}}{\text{kg}}
============================

# \frac{\text{kg/s}^2}{\text{kg}}

\frac{1}{\text{s}^2}
]

therefore:

[
\omega_n=\frac{1}{\text{s}}
]

This confirms that the equation has the correct dimensions for angular frequency.

Dimensional analysis is not merely a correctness check. It is a teaching tool for understanding what an equation can physically mean.

---

# 10. Graphical Interpretation

Whenever the concept has a meaningful graphical representation, show it.

Examples:

* (x(t))
* (v(t))
* (a(t))
* force-displacement curve
* resonance curve
* phase plot
* FFT spectrum
* FRF
* mode shape
* stability lobe diagram.

Explain:

* axes,
* units,
* important features,
* slopes,
* peaks,
* crossings,
* asymptotes,
* physical interpretation.

---

# 11. Physical Interpretation

Return from mathematics to physics.

Ask:

> What does this equation actually tell us about the machine?

For example:

[
\omega_n=\sqrt{\frac{k}{m}}
]

means:

* increasing stiffness raises natural frequency,
* increasing mass lowers natural frequency.

Then connect that to a real spindle/tool system.

---

# 12. Limiting Cases

Test the model at extreme values.

Examples:

### If damping approaches zero

[
c\rightarrow0
]

What happens?

### If stiffness becomes very large

[
k\rightarrow\infty
]

What happens?

### If mass becomes very large

[
m\rightarrow\infty
]

What happens?

Limiting cases reveal whether the mathematical model behaves sensibly.

---

# 13. What Breaks the Model?

Explicitly state where the equation stops being trustworthy.

For example, the linear mass-spring-damper model assumes:

* linear stiffness,
* linear damping,
* small displacement,
* time-invariant parameters.

A real tool-holder interface may violate these assumptions.

The student should understand both:

> **Why the model works**

and:

> **Why the model eventually fails.**

---

# 14. Numerical Calculation

Solve a realistic numerical example.

Show:

1. given values,
2. unit conversions,
3. equation,
4. substitution,
5. intermediate values,
6. final result,
7. units,
8. physical interpretation.

Never jump directly from:

[
m=0.5,\quad k=2\times10^6
]

to:

[
\omega_n=2000\text{ rad/s}
]

without showing the reasoning.

---

# 15. Computation / Simulation

When computation is useful, introduce it as a **verification tool**, not as a replacement for understanding.

Possible tools include:

* Python,
* MATLAB,
* spreadsheets,
* symbolic algebra,
* numerical solvers,
* plotting tools.

The student must first understand what is being calculated mathematically.

Then the computer performs the repetitive arithmetic.

---

# 16. Experimental Verification

When the concept is experimentally measurable, compare prediction with measurement.

The structure should be:

[
\boxed{\text{Model}}
\rightarrow
\boxed{\text{Prediction}}
]

and independently:

[
\boxed{\text{Experiment}}
\rightarrow
\boxed{\text{Measurement}}
]

Then compare them.

Example:

| Quantity          |    Model | Experiment |
| ----------------- | -------: | ---------: |
| Natural frequency | 1,850 Hz |   1,790 Hz |
| Damping ratio     |    0.025 |      0.029 |

Then explain the difference.

The goal is not to force experiment to equal theory.

The difference is itself information about the model.

---

# 17. Engineering / Physical Lens

Name the broader physical principle represented by the concept.

For a hard concept, identify several unrelated places where the same principle appears.

For example, resonance appears in:

* musical instruments,
* bridges,
* aircraft structures,
* electrical circuits,
* machine tools,
* buildings,
* MEMS sensors.

The goal is recognition:

> The student should begin seeing the same mathematical structure in unrelated physical systems.

---

# 18. Mathematical Lens

Explain what mathematical structure the physics has exposed.

Examples:

* second-order differential equation,
* eigenvalue problem,
* linear operator,
* convolution,
* Fourier transform,
* matrix system,
* complex-valued function,
* delay equation.

Explain why that mathematical structure is useful beyond the current problem.

---

# 19. Engineering Design Lens

Explain how the concept affects engineering decisions.

State:

* what alternative could be chosen,
* what tradeoff exists,
* what failure mode is being avoided,
* what measurement or design decision the mathematics enables.

Example:

> Increasing tool diameter increases bending stiffness dramatically, but may increase cutting-force requirements and change the available machining envelope. The structural-dynamics model therefore does not merely calculate a number; it gives a way to reason about tool selection.

---

# 20. Commands / Computational Tools

If computation is required, list the exact commands.

For every command explain:

* what program is being used,
* what each argument means,
* what input it consumes,
* what output it produces,
* what successful output should look like.

The command is subordinate to the mathematical task.

The student should understand what they are asking the computer to calculate.

---

# 21. Run / Calculate It

Perform the actual calculation or simulation.

Show the real result.

Do not write:

> "The result should be approximately 1,500 Hz."

Actually calculate it.

If external software or experimental equipment is unavailable, explicitly label the result as:

* analytical,
* simulated,
* previously measured,
* or hypothetical.

Never present simulated or assumed data as experimental measurement.

---

# 22. One-Sentence Connection

End the Concept Unit with one sentence explaining how this concept enables the immediately following concept.

Example:

> Knowing the natural frequency tells us where the structure prefers to vibrate; the next step is determining how strongly it responds when an external force excites it at each frequency.

---

# Full-Problem Integration

After all Concept Units are complete, reconstruct the actual engineering problem.

The student should see the entire chain:

[
\text{Physical System}
]

↓

[
\text{Assumptions}
]

↓

[
\text{Variables}
]

↓

[
\text{Governing Laws}
]

↓

[
\text{Mathematical Model}
]

↓

[
\text{Derivation}
]

↓

[
\text{Numerical Solution}
]

↓

[
\text{Prediction}
]

↓

[
\text{Measurement}
]

↓

[
\text{Model vs. Reality}
]

---

# Closing

## Connect the Pieces

Carry one concrete physical example through the entire lesson.

For a spindle-dynamics lesson, for example:

[
\text{Tool}
\rightarrow
m,k,c
\rightarrow
\omega_n
\rightarrow
\text{resonance}
\rightarrow
\text{FRF}
\rightarrow
\text{measured response}
]

Do not summarize only conceptually. Show the actual values moving through the calculation.

---

## What Breaks Without This?

Deliberately remove an assumption, parameter, term, or mathematical step.

Show what changes.

Examples:

* remove damping,
* use the wrong units,
* ignore tool mass,
* use insufficient sampling frequency,
* omit the delay term from a chatter model.

Show the resulting mathematical or physical failure.

Then restore the correct model.

---

## Exercises

Exercises should progress through levels.

### Level 1 — Recognition

Identify quantities, forces, variables, units, or equations.

### Level 2 — Direct Calculation

Apply the equation with new numbers.

### Level 3 — Interpretation

Explain what happens when a parameter changes.

### Level 4 — Derivation

Derive or rearrange an equation.

### Level 5 — Modeling

Construct a mathematical model from a physical description.

### Level 6 — Numerical

Use computational tools to calculate or simulate the system.

### Level 7 — Experimental

Compare a prediction against measured data.

### Level 8 — Engineering Judgment

Decide what the model implies about the physical system and identify where uncertainty or model limitations matter.

---

# Definition of Done

A lesson is complete when the student can:

* [ ] Describe the physical problem without equations.
* [ ] Identify the relevant physical quantities.
* [ ] Define every important symbol.
* [ ] State the assumptions of the model.
* [ ] Explain why the governing equation has its form.
* [ ] Derive the major result where derivation is appropriate.
* [ ] Check important equations dimensionally.
* [ ] Perform the calculation by hand at least once.
* [ ] Interpret the result physically.
* [ ] Plot the relevant mathematical or physical relationship.
* [ ] Identify limiting cases.
* [ ] State where the model breaks down.
* [ ] Reproduce the calculation computationally when appropriate.
* [ ] Compare theory with measurement when appropriate.
* [ ] Explain the engineering significance.
* [ ] Complete the exercises without copying the worked example.

---

# Self-Check Before Calling a Lesson Finished

* [ ] Does every major mathematical concept receive a full explanation in this lesson, even if it appeared earlier?
* [ ] Does every important physical quantity have a symbol, meaning, unit, and purpose?
* [ ] Does every major equation explain where it came from?
* [ ] Is every term in every major equation physically interpreted?
* [ ] Are the assumptions behind every important model explicitly stated?
* [ ] Are units shown for important calculations?
* [ ] Has dimensional analysis been used where appropriate?
* [ ] Did the lesson begin with physical intuition before introducing complicated mathematics?
* [ ] Does every genuinely new concept have an isolated example?
* [ ] Was the isolated example deliberately simpler than the real engineering problem?
* [ ] If the real problem is complicated, were there escalating examples between the toy problem and the real problem?
* [ ] Does every derivation explain why each mathematical step is valid rather than merely showing algebra?
* [ ] Does every major result receive physical interpretation after the mathematics?
* [ ] Does every important model include its limitations?
* [ ] Are limiting cases examined where they provide useful insight?
* [ ] Is there a graphical representation wherever one materially improves understanding?
* [ ] If numerical computation is used, does the student understand what mathematical operation the computer is performing?
* [ ] Are computational results clearly distinguished from experimental results?
* [ ] If experimental data are presented, are they actually measured rather than invented?
* [ ] Where appropriate, is model prediction compared against measurement?
* [ ] Does the lesson explain discrepancies rather than hiding them?
* [ ] Does every hard concept connect to several unrelated physical or mathematical examples?
* [ ] Does every engineering lens identify a real tradeoff or design consequence?
* [ ] Can a student reconstruct the entire problem from physical system → model → equation → calculation → prediction?
* [ ] Does the closing section deliberately expose what happens when an assumption, term, or parameter is removed?
* [ ] Do the exercises progress from recognition through calculation, derivation, modeling, computation, and engineering interpretation?
* [ ] Could a student starting from the previous lesson's completed state perform every calculation without guessing what quantities, equations, units, or assumptions are required?

---

# The Fundamental Teaching Loop

Every lesson should ultimately follow this loop:

[
\boxed{\text{Physical Reality}}
]

↓

[
\boxed{\text{Question}}
]

↓

[
\boxed{\text{Assumptions}}
]

↓

[
\boxed{\text{Variables}}
]

↓

[
\boxed{\text{Physical Laws}}
]

↓

[
\boxed{\text{Mathematical Model}}
]

↓

[
\boxed{\text{Derivation}}
]

↓

[
\boxed{\text{Calculation}}
]

↓

[
\boxed{\text{Prediction}}
]

↓

[
\boxed{\text{Measurement / Simulation}}
]

↓

[
\boxed{\text{Comparison}}
]

↓

[
\boxed{\text{Physical Interpretation}}
]

↓

[
\boxed{\text{Model Limitations}}
]

The student should repeatedly experience this cycle.

The ultimate objective is not for the student to memorize equations. It is for them to develop the ability to look at a physical system — such as a spindle, tool holder, endmill, or cutting process — and independently move from **physical reality to a defensible mathematical model and back again**.
