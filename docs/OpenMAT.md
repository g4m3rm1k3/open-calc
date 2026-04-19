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

## OpenMAT-specific features

These are not MATLAB features, but part of OpenMAT's identity:

- `slider(name, min, max, step, default)`
- `animate(name, min, max, step, default, speed, loop)`
- `window.OpenMAT` extension API
- integrated Open Calc figure rendering
- integrated Open Calc 3D workspace bridge

## Extension API direction

OpenMAT is being opened to extension so custom scripts and eventually app-level integrations can register new functions.

Current surface:

- `window.OpenMAT.registerExtension(name, extension)`
- `window.OpenMAT.unregisterExtension(name)`
- `window.OpenMAT.listExtensions()`
- `window.OpenMAT.run(source)`
- `window.OpenMAT.getState()`

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
