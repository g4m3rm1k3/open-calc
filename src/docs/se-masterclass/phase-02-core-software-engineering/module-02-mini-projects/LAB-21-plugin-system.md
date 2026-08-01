# SE Masterclass — LAB-21 — Plugin System

**Language: TypeScript (Node.js)** — Module 2 of Phase 2 begins; each lab here is a new, standalone mini-project.

**Prerequisites:** LAB-18 (OCP specifically) and LAB-19 (composition). A plugin system IS the Open/Closed Principle, built as a real, runnable architecture instead of a two-class example.

**What this lab adds:**
- Extension points: places a host system deliberately leaves open for outside code to hook into
- A plugin interface (contract) every plugin must satisfy — LAB-17's pattern, applied to a whole architecture
- A plugin registry and execution pipeline — LAB-09's dispatch table, generalized to ordered, chained transforms
- Adding new functionality by adding a new plugin — zero edits to the host

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A plugin system needs the HOST to define an interface plugins must implement. Who writes that interface — the host, or each plugin author?
> 2. If two plugins both want to modify the same text, does the ORDER they run in matter? Give a concrete example where it would.
> 3. What should happen if a plugin's `transform` function throws an error — should it crash the whole pipeline, or something else?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `npx ts-node main.ts` prints:

```
=== Plugin Host With No Plugins ===
input: "Hello World"
output: "Hello World"   ← unchanged, zero plugins registered

=== Registering Plugins ===
registered: UppercasePlugin
registered: ReversePlugin
registered: WordCountPlugin

=== Running the Pipeline ===
input: "Hello World"
after UppercasePlugin: "HELLO WORLD"
after ReversePlugin: "DLROW OLLEH"
after WordCountPlugin: "DLROW OLLEH (2 words)"
final output: "DLROW OLLEH (2 words)"

=== Order Matters ===
[Uppercase, Reverse]: "DLROW OLLEH"
[Reverse, Uppercase]: "DLROW OLLEH"
  ← same result here (coincidence of this example) — try [Uppercase, WordCount, Reverse] to see it diverge

=== New Plugin, Zero Host Changes ===
registered: ExclaimPlugin
after ExclaimPlugin: "HELLO WORLD!!!"

=== Plugin Error Isolation ===
registered: BrokenPlugin
running pipeline with BrokenPlugin included:
  BrokenPlugin threw: simulated plugin failure
  pipeline continued with the pre-failure value: "HELLO WORLD"
```

---

### Concept: Extension Points

**What it is:** An **extension point** is a place a host system deliberately designs to let OUTSIDE code plug in new behavior, without the host needing to know in advance what that behavior will be. This is LAB-18's Open/Closed Principle, but as a whole-system ARCHITECTURE instead of a two-class swap.

**The problem before:** Without a defined extension point, adding a new text transformation means editing the host application's source directly — exactly LAB-18's OCP violation, at the scale of an entire application instead of one function.

**The solution:** The host defines ONE interface every plugin must satisfy, and a mechanism for DISCOVERING and RUNNING registered plugins — the host never needs to know what any SPECIFIC plugin does, only that it satisfies the shape.

**Canonical example (General Explanation):** Think of a USB port. The computer manufacturer didn't know, when they built the laptop, that you'd plug in a specific mouse from a specific company years later — they only had to define ONE stable extension point (the USB standard) that any future device satisfying it could use. Your text editor's plugin marketplace, a browser's extension system, and webpack's plugin architecture are this exact idea, applied to software instead of hardware.

**Project Application (The "Why" here):** This lab builds a text-processing pipeline — a `TextPlugin` interface (LAB-17) any plugin implements, and a `PluginHost` that runs registered plugins in sequence, exactly like LAB-09's dispatch table but CHAINING transforms instead of picking one.

---

## Step 1 — Define the Plugin Contract

```ts
// plugin.ts

export interface TextPlugin {
  name: string
  transform(input: string): string        // ← add: every plugin does exactly one thing — text in, text out
}
```

```ts
// host.ts
import { TextPlugin } from './plugin'

export class PluginHost {
  private plugins: TextPlugin[] = []           // ← add: the registry — LAB-09's dispatch table, as an ordered list

  register(plugin: TextPlugin): void {
    this.plugins.push(plugin)
    console.log(`registered: ${plugin.name}`)
  }

  run(input: string): string {
    let result = input
    for (const plugin of this.plugins) {          // ← add: chain — each plugin's OUTPUT becomes the next plugin's INPUT
      result = plugin.transform(result)
    }
    return result
  }
}
```

```ts
// main.ts
import { PluginHost } from './host'

console.log('=== Plugin Host With No Plugins ===')
const host = new PluginHost()
console.log(`input: "Hello World"`)
console.log(`output: "${host.run('Hello World')}"   ← unchanged, zero plugins registered`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Plugin Host With No Plugins ===
input: "Hello World"
output: "Hello World"   ← unchanged, zero plugins registered
```

**Confirm the empty-pipeline behavior:** With zero plugins registered, `run()`'s `for` loop never executes, and `result` stays exactly equal to `input` — this is the correct, unsurprising baseline before any extension exists, exactly like LAB-14's topological sort on an empty graph would correctly produce an empty order.

---

## Step 2 — Build and Register Concrete Plugins

```ts
// plugins/uppercase.ts
import { TextPlugin } from '../plugin'

export class UppercasePlugin implements TextPlugin {
  name = 'UppercasePlugin'
  transform(input: string): string {
    return input.toUpperCase()
  }
}
```

```ts
// plugins/reverse.ts
import { TextPlugin } from '../plugin'

export class ReversePlugin implements TextPlugin {
  name = 'ReversePlugin'
  transform(input: string): string {
    return input.split('').reverse().join('')
  }
}
```

```ts
// plugins/word-count.ts
import { TextPlugin } from '../plugin'

export class WordCountPlugin implements TextPlugin {
  name = 'WordCountPlugin'
  transform(input: string): string {
    const wordCount = input.trim().split(/\s+/).filter(w => w.length > 0).length
    return `${input} (${wordCount} words)`
  }
}
```

Add to `main.ts`:

```ts
import { UppercasePlugin } from './plugins/uppercase'
import { ReversePlugin } from './plugins/reverse'
import { WordCountPlugin } from './plugins/word-count'

console.log('\n=== Registering Plugins ===')
host.register(new UppercasePlugin())
host.register(new ReversePlugin())
host.register(new WordCountPlugin())
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Registering Plugins ===
registered: UppercasePlugin
registered: ReversePlugin
registered: WordCountPlugin
```

**Confirm the host never imports these concrete classes:** Look at `host.ts` again — it imports ONLY `TextPlugin`, the interface, never `UppercasePlugin` or any other concrete plugin. This is LAB-17's dependency-direction diagram, alive in a real system: `host.ts` is at the "center," and every plugin points INWARD at it, never the other way around.

---

## Step 3 — Run the Full Pipeline

```ts
console.log('\n=== Running the Pipeline ===')
const input = 'Hello World'
console.log(`input: "${input}"`)

let traced = input
traced = new UppercasePlugin().transform(traced)
console.log(`after UppercasePlugin: "${traced}"`)
traced = new ReversePlugin().transform(traced)
console.log(`after ReversePlugin: "${traced}"`)
traced = new WordCountPlugin().transform(traced)
console.log(`after WordCountPlugin: "${traced}"`)

console.log(`final output: "${host.run(input)}"`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Running the Pipeline ===
input: "Hello World"
after UppercasePlugin: "HELLO WORLD"
after ReversePlugin: "DLROW OLLEH"
after WordCountPlugin: "DLROW OLLEH (2 words)"
final output: "DLROW OLLEH (2 words)"
```

**Confirm `host.run()` matches the manually traced version exactly:** `host.run(input)` internally does precisely what was traced by hand above — pass `input` through each registered plugin's `transform` in order, threading each result into the next. The manual trace and the pipeline's actual output should be IDENTICAL.

---

### Concept: Order Matters — Plugin Chains Are Not Commutative

**What it is:** Because each plugin's output feeds the NEXT plugin's input, the ORDER plugins are registered in can change the final result — this is not a bug, it's an inherent property of chaining transforms.

**Where you will see this:** Webpack's plugin/loader order, Express middleware order, and Unix pipe order (`cat file | grep foo | sort`) all have this exact same property — reordering a pipeline can silently change behavior, which is why documentation for real plugin systems is usually explicit about registration order.

---

## Step 4 — Confirm Order Sensitivity

```ts
console.log('\n=== Order Matters ===')
const hostA = new PluginHost()
hostA.register(new UppercasePlugin())
hostA.register(new ReversePlugin())
console.log(`[Uppercase, Reverse]: "${hostA.run('Hello World')}"`)

const hostB = new PluginHost()
hostB.register(new ReversePlugin())
hostB.register(new UppercasePlugin())
console.log(`[Reverse, Uppercase]: "${hostB.run('Hello World')}"`)
console.log('  ← same result here (coincidence of this example) — try [Uppercase, WordCount, Reverse] to see it diverge')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Order Matters ===
[Uppercase, Reverse]: "DLROW OLLEH"
[Reverse, Uppercase]: "DLROW OLLEH"
  ← same result here (coincidence of this example) — try [Uppercase, WordCount, Reverse] to see it diverge
```

**Why uppercase/reverse happen to commute here, but won't always:** Reversing then uppercasing, or uppercasing then reversing, produces the same characters either way — `toUpperCase()` doesn't care about character POSITION, and reversing doesn't care about character CASE, so these two specific operations happen not to interfere. `WordCountPlugin`, however, APPENDS text — reversing AFTER word-count would reverse the appended "(2 words)" text too, producing visible garbage, while reversing BEFORE word-count keeps the appended text readable.

**Change something:** Build a THIRD host with `[UppercasePlugin, WordCountPlugin, ReversePlugin]` registered in that order. Predict the output before running — the `(2 words)` suffix will end up reversed along with everything else, visibly demonstrating why plugin order is a real design decision, not an implementation detail.

---

## Step 5 — Add a New Plugin, Touch Nothing Existing

```ts
// plugins/exclaim.ts
import { TextPlugin } from '../plugin'

export class ExclaimPlugin implements TextPlugin {
  name = 'ExclaimPlugin'
  transform(input: string): string {
    return `${input}!!!`
  }
}
```

Add to `main.ts`:

```ts
import { ExclaimPlugin } from './plugins/exclaim'

console.log('\n=== New Plugin, Zero Host Changes ===')
const hostC = new PluginHost()
hostC.register(new ExclaimPlugin())
console.log(`after ExclaimPlugin: "${hostC.run('Hello World'.toUpperCase())}"`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== New Plugin, Zero Host Changes ===
registered: ExclaimPlugin
after ExclaimPlugin: "HELLO WORLD!!!"
```

**Confirm this is the entire point:** `PluginHost`, `TextPlugin`, and every PREVIOUSLY written plugin file were untouched by adding `ExclaimPlugin` — the exact OCP promise from LAB-18, now demonstrated at the scale of a real, growing system instead of a two-class toy example.

---

## 🎯 Challenge: Isolate Plugin Failures

**You know:** `host.run()`'s `for` loop currently has no error handling — a throwing plugin would crash the ENTIRE pipeline, taking down every plugin after it too.

**Task:** Modify `PluginHost.run()` so that if a plugin throws, the error is caught, logged, and the pipeline CONTINUES with the value from BEFORE the failing plugin (skip the broken plugin's contribution, don't crash everything downstream).

**Starting code:**

```ts
class BrokenPlugin implements TextPlugin {
  name = 'BrokenPlugin'
  transform(input: string): string {
    throw new Error('simulated plugin failure')
  }
}
```

<details>
<summary>▶ Show Solution</summary>

```ts
// Modify host.ts's run() method:
run(input: string): string {
  let result = input
  for (const plugin of this.plugins) {
    try {
      result = plugin.transform(result)
    } catch (err) {
      console.log(`  ${plugin.name} threw: ${(err as Error).message}`)
      // 'result' is intentionally NOT updated — the pipeline continues with the pre-failure value
    }
  }
  return result
}
```

**Key insight:** This is LAB-09's boundary-validation instinct, applied to plugin execution instead of user input — a MISBEHAVING plugin is untrusted input, exactly like a malformed calculator expression, and the host protects itself from ONE bad extension crashing everything, exactly like `try/catch` around `applyOperator` protected the calculator's REPL loop. Real plugin systems (browser extensions, VSCode) apply this same isolation — one broken extension shouldn't take down the whole application.

</details>

Add to `main.ts`:

```ts
console.log('\n=== Plugin Error Isolation ===')
const hostD = new PluginHost()
hostD.register(new UppercasePlugin())
hostD.register(new BrokenPlugin())
console.log('running pipeline with BrokenPlugin included:')
const resultD = hostD.run('hello world')
console.log(`  pipeline continued with the pre-failure value: "${resultD}"`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Plugin Error Isolation ===
registered: BrokenPlugin
running pipeline with BrokenPlugin included:
  BrokenPlugin threw: simulated plugin failure
  pipeline continued with the pre-failure value: "HELLO WORLD"
```

---

## Mental Model: Where This Shows Up

| Real system | The "host" | The "plugin" |
|---|---|---|
| VSCode | The editor core | Extensions (linters, themes, language support) |
| webpack | The bundler pipeline | Loaders and plugins transforming files |
| ESLint | The linting engine | Rule plugins |
| Express/Koa | The HTTP server | Middleware functions |
| Browsers | The rendering engine | Browser extensions |

**Where you will see this again:** LAB-22 (Event Bus) builds a DIFFERENT extension mechanism (publish/subscribe instead of a linear pipeline) for the same underlying goal — letting outside code react to a system without modifying it.

---

## Final Check

| Feature | How to verify |
|---|---|
| An empty `PluginHost` returns input unchanged | Step 1 |
| Three registered plugins chain correctly, each consuming the previous plugin's output | Step 3 |
| Plugin order visibly changes output for at least one combination | Step 4 |
| A new plugin (`ExclaimPlugin`) works with zero edits to `PluginHost` or any other plugin | Step 5 |
| A throwing plugin doesn't crash the whole pipeline | Challenge |
| You can explain, without notes, why `host.ts` never imports a concrete plugin | Dependency direction, LAB-17 |

---

## Quick Check Answers

**1. Who writes the plugin interface — the host, or each plugin author?**

The HOST — `TextPlugin` was defined in `plugin.ts`, owned by the host application, and every plugin author writes THEIR code to satisfy that ALREADY-EXISTING contract, never the reverse. This mirrors LAB-17: the interface is the stable, shared abstraction that concrete implementations (here, plugins) depend on, not something each implementation invents independently.

**2. Does plugin order matter? Give an example where it would.**

Yes — Step 4 demonstrated it directly with `WordCountPlugin` (which appends text) combined with `ReversePlugin`: running `WordCountPlugin` BEFORE `ReversePlugin` reverses the appended `"(2 words)"` text along with everything else, producing garbled output, while running `ReversePlugin` first keeps the appended suffix readable. Any pair of plugins where one's output shape depends on POSITION or STRUCTURE (not just character-by-character content) will be order-sensitive.

**3. What should happen if a plugin throws — crash everything, or something else?**

Something else — the Challenge's solution catches the error, logs which plugin failed and why, and lets the pipeline continue with the value from before the failure, rather than letting one broken extension take down every plugin registered after it. This mirrors LAB-09's boundary validation: untrusted code (a plugin you didn't write) should be defended against, the same way untrusted USER input was defended against back in the calculator.

---

*Next: [LAB-22 — Event Bus](LAB-22-event-bus.md) — TypeScript, same module*
