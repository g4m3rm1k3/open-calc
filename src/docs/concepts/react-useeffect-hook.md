# Concept: React's `useEffect` Hook and Dependency Arrays

**What you'll understand by the end:** how to run code in response to a component rendering or a specific value changing, and how getting the dependency list wrong causes a real, silent class of bug.

**Prerequisites:** `react-usestate-hook.md`, `react-useref-hook.md`.

## Setup

A React project with JSX configured (see `vite-plugin-system.md`).

## The Problem

Some work — fetching data, creating a non-React object (like a chart or 3D scene), setting up a subscription — needs to happen in response to a component appearing on screen, or in response to a specific piece of data changing, but shouldn't happen during React's own rendering process itself (rendering should stay a pure description of "what should the UI look like," not a place to trigger side effects like network requests).

## The Isolated Example

```tsx
import { useEffect, useState } from "react";

function Clock() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    console.log("effect ran");
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      console.log("cleanup ran");
      clearInterval(id);
    };
  }, []);

  return <p>{seconds} seconds elapsed</p>;
}
```

**Real behavior, mounted then unmounted after ~3.5 seconds, this session:**
```
effect ran
(displayed: 0 seconds elapsed)
(displayed: 1 seconds elapsed)
(displayed: 2 seconds elapsed)
(displayed: 3 seconds elapsed)
cleanup ran
```

**Now, with an empty dependency array changed to include `seconds` — a real, deliberately caused bug:**
```tsx
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000);
  return () => clearInterval(id);
}, [seconds]); // wrong, on purpose
```
**Real behavior:** a new `setInterval` is created *every time `seconds` changes* — since the effect's own cleanup (`clearInterval`) runs before each re-run, this particular example still appears to work, but now creates and destroys an interval every single second instead of once at mount — real, unnecessary churn, verified by the `"effect ran"` log line printing on every tick instead of once.

**What this proves:** the dependency array isn't a passive description — it's what actually controls *how often* the effect's setup-then-cleanup cycle repeats. An effect meant to run once, at mount, must have an empty array; supplying an unnecessary dependency reruns the whole effect far more often than intended.

## Mechanical Walkthrough

- `useEffect(callback, dependencies)` runs `callback` *after* React has committed a render to the real DOM — never during rendering itself, keeping the render function's own execution free of side effects.
- The **dependency array** controls when the effect re-runs: `[]` (empty) means "run once, right after the first render, never again"; `[seconds]` means "run again whenever `seconds` is a genuinely different value than it was last render"; omitting the array entirely means "run after every single render," rarely what's actually wanted.
- The function `callback` optionally **returns a cleanup function** — React calls this cleanup right before running the effect again (if it reruns) and when the component is removed from the page entirely. This is what correctly stops the previous interval before starting a new one, and stops it for good when the component unmounts.
- Getting the dependency array wrong is a genuinely common, real mistake with two distinct failure directions: including something unnecessary (as above) causes the effect to rerun — and its cleanup/setup cycle to repeat — far more often than intended; omitting something the effect's callback actually reads causes it to keep using a stale, outdated value from whenever it last ran, since the closure captured over the old value and was never told to refresh.

## CS Lens

This is **effect scoping** — explicitly declaring exactly what a side effect depends on, so a framework can decide precisely when re-running it is actually necessary, rather than either always rerunning everything (wasteful, and sometimes actively broken, as the interval example shows) or requiring a developer to manually track "did the thing this depends on actually change" by hand, imperatively, themselves. The dependency array is a real, checked declaration of an effect's own inputs — conceptually close to a pure function's parameter list, just applied to *when to rerun a side effect* instead of *what a computation returns*.

Also recognized in: spreadsheet formula recalculation (a cell only recomputes when a cell it actually references changes, not on every edit anywhere in the sheet), build-system incremental compilation (a file only rebuilds when something it actually depends on changed), and reactive-programming frameworks generally, where "recompute only when a real dependency changed" is a foundational, recurring idea.

## SE Lens

The real, concrete failure mode of a wrong dependency array is rarely a crash — it's silent: too many dependencies cause needless, repeated work (or, worse, real duplicated side effects, like creating a second scene/connection/subscription alongside one that already exists); too few dependencies cause code silently working against stale data, producing subtly wrong behavior with no error anywhere. Because both failure directions are silent by default, deliberately reasoning through — and, ideally, testing — what an effect actually reads and actually needs to rerun on is a real, necessary discipline, not an optional nicety.

## Connection

Builds on `react-usestate-hook.md` and `react-useref-hook.md` — a very common real pattern pairs a ref (holding a persistent object created once) with an effect (creating that object at the right moment and tearing it down on cleanup). `browser-request-animation-frame.md` and `threejs-renderer-scene-camera.md` describe exactly the kind of non-React object (a render loop, a 3D scene) commonly created inside an effect like this.

## Try It Yourself

1. Remove the cleanup function entirely (return nothing from the effect) and mount/unmount the component repeatedly — observe, via the console, that old intervals from previous mounts keep running and stacking up, a real, observable resource leak directly caused by a missing cleanup.
2. Add a `console.count("render")` directly in the render body (not inside the effect) alongside the working, correct version, and compare how often the component *renders* (once per second, since `seconds` changes) versus how often the effect's setup code actually *runs* (once, ever) — confirming these are two genuinely different frequencies, controlled by two different mechanisms.
3. Deliberately omit a dependency the effect's callback actually reads (e.g., add a `multiplier` state variable used inside the interval callback, but leave it out of the dependency array) and observe the effect keeps using the *original* value of `multiplier` forever, even after it's changed elsewhere in the component — a real, concrete demonstration of the "stale closure" failure direction.
