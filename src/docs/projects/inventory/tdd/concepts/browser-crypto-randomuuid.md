# Concept: `crypto.randomUUID()`

**What you'll understand by the end:** how to mint a real, globally unique identifier entirely on the client, with no server round-trip, and why that's safe to do without asking anything else in the system whether the id is already taken.

**Prerequisites:** `uuid-byte-order.md` (what a UUID actually is, underneath its string form — this file assumes that and covers a different concern: minting one, not serializing one).

## Setup

Any modern browser, or Node.js 19+ — `crypto` is a real, built-in global object in both; no import or install needed. (Older Node requires `require("node:crypto").randomUUID()` instead of the bare global — not a concern here, since this project's own Vite dev server and every current browser both expose it globally.)

## The Problem

Every real id this project has minted so far — a tool's `id`, a holder's `id` — arrived already-made from the backend, generated server-side (`uuid.uuid4()`, `core/tools.py`) at the moment a row was inserted into a real table. Nothing on the client has ever had to invent a brand-new unique identifier itself before now. A new sketch layer needs one the instant "Add Layer" is clicked — entirely in the browser, with no server involved at all — so the question is real: can a client safely make up its own id, or does a real, unique identity require a central authority (a database's auto-increment counter, a server checking "has anyone used this before") to hand one out?

## The Isolated Example

```js
const a = crypto.randomUUID();
const b = crypto.randomUUID();
console.log(a);
console.log(b);
console.log(a === b);
```

**Real output, run this session (Node 22, global `crypto`, no import):**
```
2ce92453-86a1-45ab-92d7-d09102de6638
f39b2305-e538-4bde-a1f7-afc7853216df
false
```

**What this proves:** two separate calls, with no coordination between them and no argument telling either one what the other produced, still came back different — and did so without contacting anything outside this one process. `false` on the equality check is the whole point: nothing here checked a shared list of "ids already given out" to guarantee that.

## Mechanical Walkthrough

- `crypto` — **(a) first appearance** — a real, global object every modern JS runtime (browser or Node) exposes automatically; no `import`, no `require`, no package install, unlike every other external capability this project has reached for so far.
- `crypto.randomUUID()` — **(a) first appearance** — generates a version-4 UUID (per RFC 4122, the same standard `uuid-byte-order.md` already named): 128 bits, of which 122 are real random bits (the remaining 6 are fixed version/variant marker bits, which is why every UUID this call produces has a `4` in the same fixed position — visible in both real outputs above, right after the second dash). No argument is passed and none is needed — the randomness comes from the runtime's own cryptographically secure random source, not from anything the caller supplies.
- `a === b` — already-established syntax, no restatement owed — string equality on the two returned values.

## CS Lens

This is a **birthday-problem-scale collision estimate**, made concrete: 122 random bits means 2¹²² possible values — about 5.317 × 10³⁶, a number large enough that generating one billion UUIDs per second for the age of the universe would still leave the odds of ever producing a duplicate effectively zero. The design bet a UUID makes is specifically this: skip the coordination a database's auto-increment column requires (ask a central authority "what's the next number") and rely on the space being so large that two independent, uncoordinated callers picking randomly will not collide in practice — probabilistic uniqueness, not guaranteed uniqueness, traded for needing zero coordination at all.

Also recognized in: any distributed system minting ids on multiple machines at once with no shared counter (Twitter's Snowflake ids solve the identical problem a different way — embedding a timestamp and machine id instead of relying purely on randomness); Git's own commit hashes, which are content-addressed rather than random but rely on the same "the space is too large to collide by accident" reasoning; DNS's own use of random query ids to match a response to its request without a central registry of "ids in flight."

## SE Lens

The real, deliberate reason this is *safe* here specifically: a layer's id is pure, ephemeral, client-only UI state — it is never written to a database, never compared against another client's ids, never has to survive a server restart. Contrast this project's own tool `id`s (`core/tools.py`'s `uuid.uuid4()`), which face the identical math but a genuinely different real requirement: a tool's id *does* eventually need to be looked up, joined against, and trusted by a server that many different clients talk to, so generating it server-side (or, for an imported tool, preserving the real GUID a `.TOOLDB` file already assigned it) keeps one authority in charge of the namespace those lookups depend on. The lesson isn't "client-side generation is always fine" — it's that the right place to mint an id depends on who else ever needs to agree on it. Data that only this one browser tab will ever read back doesn't need a central authority at all.

## Connection

Used in this project's `useSketch.ts` (`makeLayer()`) to give a new `Layer` a real, stable identity the instant "Add Layer" is clicked, with no `fetch` call and no backend involved.

## Try It Yourself

1. Call `crypto.randomUUID()` a thousand times in a loop, store every result in a `Set`, and confirm `set.size === 1000` — real, direct proof that a thousand independent calls produced a thousand distinct values.
2. Log just the 15th character of ten different real UUIDs (the position right after the second dash) and confirm it's always `4` — the fixed version marker the Mechanical Walkthrough named, visible directly rather than just asserted.
3. `uuid-byte-order.md`'s own Python example used `uuid.uuid4()` to generate a UUID server-side. Generate one with that, and one with `crypto.randomUUID()` here, and explain why comparing the two for equality is a meaningless question — not just "no comparison was run," but what would actually be wrong with running one.
