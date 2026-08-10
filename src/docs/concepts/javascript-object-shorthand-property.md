# Concept: Object Property Shorthand

**What you'll understand by the end:** a small but extremely common syntax shortcut for building an object from variables that already share the property's intended name.

**Prerequisites:** none.

## Setup

Any modern JavaScript or TypeScript runtime — no install needed.

## The Problem

Building an object out of existing local variables, where the desired key name is identical to the variable's own name, means writing that name twice (`{ program: program }`) — a small, mechanical repetition that adds nothing a reader doesn't already know from the variable's own name.

## The Isolated Example

```javascript
function buildRequest(program, speed) {
    const full = { program: program, speed: speed };
    const short = { program, speed };
    console.log(JSON.stringify(full));
    console.log(JSON.stringify(short));
}

buildRequest("G01 X10", 500);
```

**Real output:**
```
{"program":"G01 X10","speed":500}
{"program":"G01 X10","speed":500}
```

**What this proves:** `{ program, speed }` produced an object byte-for-byte identical (once serialized) to the fully spelled-out `{ program: program, speed: speed }` — the shorthand is purely a writing convenience with zero behavioral difference.

## Mechanical Walkthrough

- `{ program: program }` — the ordinary object literal form: a key (`program`, before the colon) paired with a value expression (`program`, the variable, after the colon) — they merely happen to be spelled the same here.
- `{ program }` — shorthand: when a key would be identical to the name of an in-scope variable supplying its value, JavaScript lets the pair collapse to just that one name — the engine expands it to the full key-value form internally.
- Shorthand and full form can be freely mixed in the same object literal (`{ program, speed: speed * 2 }` is valid) — shorthand applies per-property, not to the whole literal.

## CS Lens

This is a small instance of a broader design principle in language and API design: **eliminate mechanical repetition the compiler/interpreter can trivially reconstruct on its own.** The information "the key is named `program`" is already fully present in the variable name; requiring it be typed a second time adds nothing the reader or the language didn't already know, purely bookkeeping cost.

Also recognized in: Python's keyword-argument-adjacent patterns, and more directly, other languages that have adopted the identical shorthand (Ruby, more recent additions to older languages) — a recognizable, recurring convenience once a language's object/record literal syntax already separates keys from values.

## SE Lens

Shorthand is most valuable, and most readable, specifically when the variable's name already *is* the best name for that property — which is common when passing local data straight into a request body, a function's options object, or a returned record. It becomes a readability cost, not a win, the moment someone is tempted to rename the variable to something shorter or more local-sounding purely to fit on a line, at the cost of the property name it silently produces — a real, worth-knowing coupling shorthand introduces between local variable naming and object-key naming that the fully spelled-out form doesn't have.

## Connection

Commonly used when building a JSON body passed to `fetch-post-with-body.md`'s options object, or a return value from a function whose local variables already match a desired response shape.

## Try It Yourself

1. Rename the `program` parameter in `buildRequest` to `prog` but keep the object literal as shorthand (`{ prog, speed }`). Observe the resulting key is now `"prog"`, not `"program"` — direct proof that shorthand's key comes from the variable's actual name, not from any separate intent.
2. Mix shorthand and full form in one object literal (`{ program, total: speed * 2 }`), and confirm both forms coexist without any special syntax needed to combine them.
3. Look up object destructuring (`const { program, speed } = full;`) — the mirror-image shorthand, pulling values *out* of an object into same-named variables — and confirm it reconstructs the original `program`/`speed` variables from `full` above.
