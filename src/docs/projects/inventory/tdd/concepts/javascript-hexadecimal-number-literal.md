# Concept: JavaScript Hexadecimal Number Literals

**What you'll understand by the end:** how to write a number directly in base-16 in JavaScript source code, and why colors are commonly written this way.

**Prerequisites:** none.

## Setup

Any JavaScript or TypeScript runtime — no install needed.

## The Problem

Colors on computers are commonly represented as three (or four) byte values — red, green, blue (and sometimes alpha) — each ranging 0–255. Writing such a value in ordinary base-10 (`4589598`) gives no visual sense of the underlying red/green/blue split at all; a format that groups digits by byte, in the base computers naturally group bytes in, is far more readable to anyone who's learned to read it.

## The Isolated Example

```javascript
const decimal = 70;
const hex = 0x46;

console.log(decimal === hex);
console.log(hex);

const color = 0x46d89f;
console.log(color);
console.log(color.toString(16));
console.log(((color >> 16) & 0xff), ((color >> 8) & 0xff), (color & 0xff));
```

**Real output:**
```
true
70
4642463
46d89f
70 216 159
```

**What this proves:** `0x46` and `70` are the exact same numeric value — JavaScript's engine stores no memory of which literal form was used to write it. `0x46d89f`, printed as a plain number, shows `4642463` (its base-10 value) — the hex *form* only exists in the source code the developer typed; the bit-shifting at the end recovers the original red (`70`), green (`216`), blue (`159`) byte values the hex digits directly encoded.

## Mechanical Walkthrough

- `0x` prefixing a number literal tells JavaScript's parser to read the digits that follow in base 16 (using `0`–`9` and `a`–`f`/`A`–`F` for the six digits beyond 9) instead of the default base 10.
- Once parsed, the resulting value is an ordinary JavaScript number — identical in every way to the same value written in decimal; `0x46 === 70` is `true` because they are, numerically, the same thing.
- A 6-digit hex literal like `0x46d89f` is conventionally read as three 2-digit pairs — `46`, `d8`, `9f` — each pair one byte (0–255 in decimal, `00`–`ff` in hex) representing red, green, and blue respectively, the same convention as CSS's `#46d89f` color syntax, `#` swapped for `0x`.

## CS Lens

This is simply an alternate **radix** (base) for writing an integer literal — computers do not store or care which base a literal was written in; base-16 is chosen here purely for human readability, because it maps cleanly onto byte boundaries (each hex digit represents exactly 4 bits, so two hex digits represent exactly one byte) in a way base-10 does not.

Also recognized in: nearly every programming language supports the identical `0x` hex-literal convention (C, Python, Java, Rust), and hex is used pervasively anywhere byte-aligned data needs human-readable representation — memory addresses, color values, MAC addresses, hash digests.

## SE Lens

Choosing hex specifically for color values is a real, deliberate readability convention, not an arbitrary habit — a developer who has learned to read hex colors can often estimate a color's general hue and brightness directly from its digits (`0x07111e` — very small values across the board — reads as "very dark," without needing to convert anything), an ability the equivalent decimal number (`463902`) doesn't offer at a glance.

## Connection

Directly used throughout Three.js color arguments (`threejs-renderer-scene-camera.md`, `threejs-lighting-basics.md`) — every color value in that library accepts this exact literal form, chosen specifically to match how colors are already conventionally written in CSS and design tools.

## Try It Yourself

1. Convert a real CSS hex color you recognize (e.g. `#ff8b8b`) into a JavaScript number literal (`0xff8b8b`) and log it — confirm it prints as a large base-10 number, and manually convert that number back to hex using `.toString(16)` to confirm it round-trips.
2. Write `0b` (binary) and `0o` (octal) literals for the same value `70` (`0b1000110` and `0o106`) and confirm all four forms (`70`, `0x46`, `0b1000110`, `0o106`) are `===` to each other.
3. Extract the individual red/green/blue byte values from a hex color literal of your choosing using the same bit-shift-and-mask technique shown above (`(color >> 16) & 0xff`, etc.), and verify each extracted value is between 0 and 255.
