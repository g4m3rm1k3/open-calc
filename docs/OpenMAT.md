# OpenMAT Guide

OpenMAT is a matrix-computing workspace inside `open-calc`.

It is designed to feel familiar to MATLAB users, but it is not a MATLAB runtime. The current implementation is a custom MATLAB-like language layer built on top of a browser-side math engine and Open Calc's plotting stack.

## What language is OpenMAT?

OpenMAT is a hybrid:

- The app itself is written in JavaScript and React.
- The execution engine is powered by `mathjs`.
- The code users write is a MATLAB-like dialect that OpenMAT preprocesses before evaluation.

That means OpenMAT is not:

- raw browser JavaScript
- Python
- full MATLAB compatibility

It is best understood as:

1. MATLAB-style syntax where possible
2. browser-native execution
3. Open Calc plotting, controls, and visualization features on top

## Current mental model

When a user runs a script:

1. OpenMAT reads the script as MATLAB-like code.
2. It normalizes some syntax such as indexing, matrix behavior, anonymous functions, and control flow.
3. The normalized expression is evaluated with the local math engine.
4. Plot commands are converted into Open Calc figure data or 3D launch data.
5. Interactive controls such as `slider(...)` and `animate(...)` are surfaced in the UI and fed back into reruns.

## Interaction model

OpenMAT should be understood as one shared session with several views into it:

- `Editor` tabs hold saved scripts, examples, and labs.
- `Run` executes the active script tab and refreshes the Figure, Workspace, and Console.
- `Console` is for short one-line experiments against the current workspace state.
- `Promote to Script` moves a useful console command back into the active script tab.
- `Workspace` shows the live variables produced by the latest script run or console command.

This means the product model is:

1. Write or load a script in the editor.
2. Run it to create figures and variables.
3. Probe or extend the result in the console.
4. Promote good discoveries back into the script.
5. Use the same session state as the basis for simulation workflows later.

## Getting started with the lab

If someone is brand new to OpenMAT, the first lesson should be about workflow, not language syntax.

Recommended beginner flow:

1. Enter `Simulation Mode`
2. Pick a guided lab such as `Pendulum`
3. Press `Run`
4. Move the sliders and watch the viewport and plots respond
5. Open `Workspace` to see what variables the lab produced
6. Try a one-line console command
7. Return to `Script Mode` only after the user understands the lab workflow

For geometry authoring:

1. Open the `Geometry` rail in `Simulation Mode`
2. Select a simulation object first if you want to replace it
3. Click `Open ScratchPad`
4. ScratchPad opens in `Geo` mode with `Select` active
5. Click one shape and use `Send to OpenMAT`
6. The shape either replaces the selected object or imports centered into the viewport
7. Use `Sync Linked Scratch Geometry` after later ScratchPad edits

That is the best first chapter for a course because it teaches the interaction model before introducing OpenMAT's language layer.

## MATLAB user quick start

If someone already knows MATLAB, the fastest OpenMAT success path is:

1. run one simple 2D plot
2. run one matrix example
3. run one `plot3(...)` example
4. run one `surf(...)` example
5. only then try `slider(...)` and `animate(...)`

Recommended first examples:

- `MATLAB First Plot`
- `Matrix Quick Start`
- `Helix plot3`
- `Surface + Mesh Demo`

That sequence matters because it establishes trust before it introduces OpenMAT-only interactivity.

## Challenge demo path

For judges or first-time users, the strongest short demo order is:

1. `MATLAB First Plot`
2. `Interactive Signal`
3. `Animated 3D Helix`
4. `Interactive 3D Surface`
5. `Pendulum Lab`

Why this order works:

- the first two prove basic plotting and controls
- the next two create visual wow quickly
- the last one shows engineering intuition, not just graphing

## What OpenMAT is strong at today

- matrix algebra
- vectorized numeric work
- classroom and lab-style plotting
- parameterized controls
- simple animation and simulation templates
- local browser execution with no required server

## What OpenMAT is not yet

- full MATLAB compatibility
- Simulink
- a symbolic engine
- a complete ODE / PDE toolbox
- a full desktop project/file environment

## Supported language areas

OpenMAT currently supports a growing subset of MATLAB-like behavior:

- matrices and vectors: `[1 2; 3 4]`, transpose, `A \ b`
- array creation: `linspace`, `logspace`, `zeros`, `ones`, `eye`, `rand`, `randn`
- math and numerics: `eig`, `qr`, `svd`, `trapz`, `gradient`, `roots`, `interp1`
- plots: `plot`, `scatter`, `bar`, `stem`, `area`, `hist`, `subplot`
- axes and figure commands: `grid`, `title`, `xlabel`, `ylabel`, `xlim`, `ylim`, `axis`
- control flow: `if`, `elseif`, `else`, `for`, `while`, `break`, `continue`
- functions: `function ... end`, anonymous functions with `@(...)`
- interactivity: `slider(...)`
- animation: `animate(...)`
- 3D handoff: `surf(...)`, `mesh(...)`

## MATLAB compatibility quick read

OpenMAT has a real chance to feel familiar to MATLAB users, but the honest framing today is:

- strong for guided numeric work, teaching, and compact engineering scripts
- partial for general-purpose MATLAB coding
- not yet suitable as a drop-in runtime for workplace MATLAB projects

If someone pastes in production MATLAB from work, the right question is not "is OpenMAT broken?" but:

1. is this script mostly matrix math and plotting
2. or is it leaning on MATLAB desktop workflow, graphics handles, file I/O, classes, and toolboxes

The first category has a good chance.
The second category usually needs rewriting.

## Try this

These patterns are the best fit for OpenMAT right now:

- matrix and vector scripts
- classroom linear algebra and calculus labs
- compact engineering calculations
- parameter sweeps built around core numerics
- plots and quick visual analysis
- single-file or small multi-function experiments

Good examples:

- `A = [1 2; 3 4]; x = A \ b`
- `t = 0:0.01:10; y = sin(t); plot(t, y)`
- `function y = f(x); y = x.^2; end`
- `slider('k', 10, 200, 5, 50)`

## Works, but differently

These concepts exist, but not in full MATLAB form:

- plotting works through Open Calc rendering rather than MATLAB graphics handles
- `surf(...)` and `mesh(...)` hand off to the integrated 3D grapher instead of MATLAB figure windows
- the console, editor, workspace, and simulation benches all share one local browser session
- OpenMAT-specific interactivity such as `slider(...)` and `animate(...)` is part of the language surface

So a user can often keep the math while changing the workflow.

## Won't work yet

These are the most important boundaries to state clearly:

- no toolbox compatibility promise for Control System, Signal Processing, Optimization, PDE, Symbolic Math, or Simulink
- no desktop MATLAB environment parity
- no drop-in support for multi-file production codebases, package folders, `classdef`, or app-style workflows
- no MATLAB GUI/handle graphics ecosystem parity
- no guarantee that workplace scripts with specialized toolbox dependencies will run unchanged

That means OpenMAT should currently be pitched as:

- a browser-first MATLAB-like lab
- an engineering intuition studio
- a compact numeric runtime

not as:

- "MATLAB in the browser"

## Rewrite guidance

If a MATLAB script fails in OpenMAT, the recommended approach is:

1. isolate the numeric core
2. remove toolbox calls first
3. replace file-system or GUI assumptions
4. test one function or section at a time
5. rebuild plotting and interactivity using OpenMAT's native workflow

The shortest successful migration path is usually:

- keep the math
- simplify the environment assumptions
- use OpenMAT's plotting, sliders, and workbench UI instead of trying to mirror MATLAB exactly

## OpenMAT-specific features

These are not MATLAB features, but part of OpenMAT's identity:

- `slider(name, min, max, step, default)`
- `animate(name, min, max, step, default, speed, loop)`
- `window.OpenMAT` extension API
- integrated Open Calc figure rendering
- integrated Open Calc 3D workspace bridge

## UI direction

OpenMAT is being shaped as a shared foundation for two interfaces:

- `Script Mode`
  MATLAB-like editing, console work, workspace browsing, and plotting
- `Simulation Mode`
  A guided, more ANSYS-like workflow with project trees, setup panels, solver controls, and result dashboards

These should not become two separate products. They should stay two layers on top of the same computational session so users can move between free-form scripting and structured simulation work.

## First guided simulation layer

The first `OpenMAT Sim` pass uses the same OpenMAT session model and adds a guided panel layer for:

- `Pendulum`
- `Spring-Mass`
- `Projectile`

Each guided model should:

1. load a lab script into the editor without becoming a separate tool
2. reuse the same figure pane, controls, workspace, and console
3. add prompts and observation cues for learners
4. keep script mode available for deeper editing and experimentation

## Workbench model

OpenMAT should grow through focused workbenches instead of one giant generic simulation UI.

A workbench is:

- one class of problem
- one preferred set of primitives and panels
- one set of outcomes and prompts
- one attached lesson flow

Current built-in workbenches include:

- `Pendulum`
- `Spring-Mass`
- `Projectile`
- `Merchant Circle`
- `Beam / Cantilever`

This is the beginning of the platform model:

1. `OpenMAT Core`
2. `Workbenches`
3. `Lessons`

The first good engineering workbench is `Beam / Cantilever` because it ties together geometry, load, section properties, deflection, stress, and strain.

## Native plotting and 3D

OpenMAT should compete in its own lane by being more visual and more immediate than a traditional numerical desktop tool.

Current plotting direction:

- native 2D figures inside the OpenMAT figure pane
- subplot support inside the same session
- local axis, grid, and view-state control
- `surf(...)`, `mesh(...)`, and `surfc(...)` rendered in the integrated 3D viewport
- `plot3(...)` and `scatter3(...)` rendered as native 3D curve / point-cloud views
- one-click handoff from local 3D into the separate app grapher when a user wants a larger surface workspace

The important product rule is:

- 3D should feel like OpenMAT itself, not like leaving OpenMAT to find another tool

That means the local 3D viewport matters a lot for credibility even if the app also has a bigger dedicated grapher.

## Script and data workflow

To feel MATLAB-like in real use, OpenMAT needs more than syntax. It needs file and data flow.

Current direction:

- import `.m` files into new OpenMAT script tabs
- export the active script tab back out as `.m`
- import `.csv`, `.tsv`, or plain-text numeric tables into generated OpenMAT starter scripts
- export selected workspace tables or matrices to `.csv`
- preserve full OpenMAT sessions as JSON for restore/share/debug workflows

The honest framing is:

- OpenMAT session export is native OpenMAT state
- `.m` export is for script portability
- CSV export/import is for data portability

## Benchmark-backed workbenches

The strongest proof that OpenMAT is worth trusting is not a claim of total MATLAB compatibility. It is benchmark-backed workbenches that make assumptions, outputs, and validation visible.

The flagship benchmark path should emphasize:

- `Projectile`
  Classical drag-free kinematics benchmark
- `Beam / Cantilever`
  Closed-form end-loaded beam comparison
- `Merchant Circle`
  Force decomposition and resultant checks
- `Spring-Mass`
  Frequency and damping intuition with expected response bands
- `Chatter / Tool Dynamics`
  Directional engineering estimates with explicit assumptions

These benches should always expose:

- solver summary
- assumptions
- key outputs
- benchmark checks
- recommended presets

## Professional-feeling workflow

OpenMAT does not need to become all of MATLAB to become compelling. It does need to feel serious.

That means:

- editor, figure, workspace, console, and normalized-code views should all feel connected
- the last run should be inspectable
- errors should be readable and recoverable
- imported scripts/data should land in obvious places
- benchmark scripts should be easy to open from the browser
- compatibility limits should be documented before the user hits them

## Extension API direction

OpenMAT is being opened to extension so custom scripts and eventually app-level integrations can register new functions.

Current surface:

- `window.OpenMAT.registerExtension(name, extension)`
- `window.OpenMAT.unregisterExtension(name)`
- `window.OpenMAT.listExtensions()`
- `window.OpenMAT.listWorkbenches()`
- `window.OpenMAT.getWorkbench(id)`
- `window.OpenMAT.openWorkbench(id)`
- `window.OpenMAT.run(source)`
- `window.OpenMAT.getState()`
- `window.OpenMAT.exportSession()`

This should be treated as an evolving API until a more formal contract is published.

## Documentation discipline

As OpenMAT grows, these should stay updated together:

1. This guide in `docs/OpenMAT.md`
2. The in-app `Reference` tab
3. The built-in `help` / `HELP_TEXT`
4. Example scripts in the browser panel

If a feature lands and only one of those gets updated, documentation is considered incomplete.

## Next documentation targets

- supported syntax matrix vs unsupported syntax matrix
- extension author guide with worked example
- simulation cookbook
- plotting cookbook
- indexing and array semantics guide
- script mode vs simulation mode workflow guide
