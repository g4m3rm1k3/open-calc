# Concept: Radians as an Angular Unit

**What you'll understand by the end:** why most programming APIs measure rotation in radians instead of degrees, and how to convert between the two.

**Prerequisites:** none.

## Setup

Any language with basic math functions and a `PI` constant — examples below use JavaScript (`Math.PI`), runnable in any browser console or Node.js.

## The Problem

Rotating an object in code requires specifying *how much* rotation — but "how much" needs a unit. Degrees (a full circle is 360) are the everyday, intuitive human unit, but most graphics and math libraries instead expect **radians**, a different unit built directly from a circle's own geometry rather than an arbitrary historical convention — code written assuming degrees, passed to an API expecting radians, silently produces wildly wrong rotations with no error at all.

## The Isolated Example

```javascript
function rotateDegrees(degrees) {
    // A hypothetical API that (incorrectly) expects degrees directly
    return `rotating by ${degrees}`;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

console.log(Math.PI);              // one half-turn (180°)
console.log(Math.PI * 2);          // one full turn (360°)
console.log(Math.PI / 2);          // a quarter turn (90°)
console.log(toRadians(90));        // should equal Math.PI / 2
console.log(toRadians(90) === Math.PI / 2);
```

**Real output:**
```
3.141592653589793
6.283185307179586
1.5707963267948966
1.5707963267948966
true
```

**What this proves:** a quarter turn, computed two different ways — directly as `Math.PI / 2`, and by converting `90` degrees through the formula — produces the identical value. Radians and degrees measure the exact same physical rotation; they're just different numeric scales for expressing it, related by one fixed conversion factor.

## Mechanical Walkthrough

- A **radian** is defined geometrically: it's the angle at which the arc length along a circle's edge equals the circle's radius. One full trip around any circle, regardless of its size, is always exactly `2π` radians — this is *why* `2π` (`Math.PI * 2`) is a full turn, not an arbitrary chosen number the way `360` (degrees) is.
- `Math.PI` (approximately `3.14159`) is one half-turn (180°); `Math.PI / 2` is one quarter-turn (90°); `Math.PI / 4` is one eighth-turn (45°) — fractions of `π` correspond directly to fractions of a full circle.
- Converting: `radians = degrees × (π / 180)`; `degrees = radians × (180 / π)` — one fixed multiplicative factor in each direction, derived directly from "180 degrees = π radians."

## CS Lens

Radians are the **natural unit** for angles in mathematics — many calculus identities and formulas (derivatives of `sin`/`cos`, for instance) only take their simplest form when angles are measured in radians, which is the deeper reason nearly every programming language's math library (`Math.sin`, `Math.cos`, `Math.atan2`, and every 3D graphics API's rotation functions) standardizes on radians internally, rather than an implementation detail chosen arbitrarily. Degrees remain the preferred unit in human-facing contexts (a protractor, a compass heading, a CSS `rotate()` value, which — a real, worth-knowing exception — *does* accept `deg` directly) precisely because they don't require this underlying mathematical relationship to be usable.

Also recognized in: every general-purpose math library across every language (Python's `math.radians()`/`math.degrees()`, C's `<math.h>`), robotics and physics simulation code (angular velocity is conventionally radians-per-second), and GPS/navigation systems' internal calculations.

## SE Lens

The real, common bug this unit mismatch produces: passing a "reasonable-looking" number (like `90`, intending 90 degrees) directly into an API expecting radians produces a rotation of roughly `90 / (2π) × 360 ≈ 5157` degrees — wrapped around many full circles — a result that's wrong in a way that's often not obviously wrong at a glance (it's still *some* rotation, just not the intended one), making this a real, worth-double-checking class of bug whenever a new rotation-related API is used for the first time. Reading an API's documentation once, specifically for which unit it expects, is cheap; debugging a silently-wrong rotation later is not.

## Connection

Directly used wherever `threejs-renderer-scene-camera.md`'s objects are rotated — Three.js's `.rotation` properties (and nearly every other JavaScript/WebGL 3D library) universally expect radians, never degrees.

## Try It Yourself

1. Write `toDegrees(radians)` (the inverse of `toRadians` above) and confirm `toDegrees(toRadians(x)) === x` (allowing for tiny floating-point rounding) for several different values of `x`.
2. Compute `Math.PI / 6` and reason out, before checking, what fraction of a full turn (in degrees) it represents — then verify with your conversion function.
3. Look up CSS's `rotate()` transform function, and confirm (by testing in a real browser) that it accepts `deg` directly (`rotate(90deg)`) — contrast this with Three.js/WebGL's radians-only convention, and reason about why a CSS author-facing API might reasonably choose the more human-intuitive unit while a lower-level graphics math library does not.
