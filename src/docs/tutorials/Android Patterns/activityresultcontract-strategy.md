# One Machine, Many Request Shapes: ActivityResultContract

**What problem this solves.** Different situations that all share the
same underlying shape — launch some other component, and later,
asynchronously, receive back some kind of answer — actually need
genuinely different input and output types depending on what's being
launched: requesting a single permission needs a permission-name string
in and a yes/no boolean out; launching an arbitrary `Activity` to pick
an image needs an `Intent` in and a result code plus data out. Writing
a separate, unrelated registration-and-callback mechanism for every one
of these specific cases would duplicate the same underlying "register
early, launch later, deliver asynchronously" machinery over and over,
once per case. The abstract fix: separate the reusable registration
machinery from the specific "what goes in, what comes back" shape of
any one particular kind of request, so the shared machinery is written
once, and different request types simply plug in a different, small,
self-contained specification of their own in/out shape.

**Classic pattern family.** Closest to the Gang-of-Four **Strategy**
pattern — the pluggable "shape of this particular kind of request"
object is itself an interchangeable strategy, and the shared
registration machinery works identically no matter which one is
plugged in — though the asynchronous, later-delivered callback half
also carries a real Command flavor.

**Where you'll meet it in Android.**
`androidx.activity.result.contract.ActivityResultContract<I, O>` (the
abstract strategy contract) and its real subclasses, most commonly
`ActivityResultContracts.StartActivityForResult`, registered through
the same `ComponentActivity.registerForActivityResult(...)` mechanism
used for permission requests.

**Terms used in this pattern.**

- **Generic contract with two independent type parameters** —
  `ActivityResultContract<I, O>` fills in two independent placeholders:
  `I` names the input type a `launch(...)` call requires; `O` names the
  output type the eventual callback receives. It exists so the same
  registration machinery works with any pairing of input/output shapes,
  chosen entirely by which concrete contract subclass is plugged in.
- **Result code** — a small integer describing how a launched
  `Activity` ended, distinct from and carried alongside any data that
  `Activity` also chose to send back.

**Objects and methods used.**

- **`ActivityResultContract<I, O>`**
  *What it is:* an abstract class defining the shape of one specific
  kind of request/response pairing.
  *Implementation:* `public abstract class ActivityResultContract<I,
  O>`; real subclasses each fix `I` and `O` to concrete types
  (`RequestPermission` fixes them to `String` and `Boolean`;
  `StartActivityForResult` fixes them to `Intent` and `ActivityResult`).
  *Its use:* the pluggable strategy object naming exactly what a
  specific kind of request needs going in and what shape its answer
  takes coming back — the shared registration/launch/callback machinery
  never changes to support a new kind of request; only a new contract
  subclass does.
- **`ActivityResultContracts.StartActivityForResult`**
  *What it is:* a concrete `ActivityResultContract<Intent,
  ActivityResult>` implementation.
  *Implementation:* a predefined class describing "launch this `Intent`
  as an `Activity`, and deliver back an `ActivityResult` once it
  finishes."
  *Its use:* the general-purpose contract for launching any `Activity`
  and needing to know how it ended — not limited to any one specific
  system dialog.
- **`ActivityResult`**
  *What it is:* the object this contract's callback receives.
  *Implementation:* `public final class ActivityResult`, exposing
  `getResultCode()` (returning `int`) and `getData()` (returning
  `Intent`, possibly `null`).
  *Its use:* bundles both pieces of information the finished `Activity`
  might report together — how it ended, and optionally what data it
  chose to send back — as one object.
- **`Activity.RESULT_OK` / `Activity.RESULT_CANCELED`**
  *What they are:* `public static final int` constants on `Activity`.
  *Implementation:* `public static final int RESULT_OK = -1; public
  static final int RESULT_CANCELED = 0`.
  *Their use:* the two standard values a finished `Activity` commonly
  reports through its own result code, checked against what
  `ActivityResult.getResultCode()` returns.
- **`ActivityResultLauncher<Intent>.launch(Intent input)`**
  *What it is:* an instance method on `ActivityResultLauncher`,
  returning `void`.
  *Implementation:* `public abstract void launch(I input)`.
  *Its use:* the actual trigger, handing in the specific `Intent` this
  contract's own `I` type requires — the same method name and role as
  the permission pattern's own `launch(String)`, just with a different
  input type this time, entirely determined by which contract this
  launcher was registered with.

---

## The Shape

Four participants:

- **`ActivityResultContract<I, O>`** — the pluggable strategy naming
  one specific request's in/out shape.
- **The shared registration/launch/callback machinery** — written
  once, reused unmodified regardless of which contract is plugged in.
- **The launched `Activity`** — whatever real component ends up
  actually running, entirely determined by what `Intent` this specific
  contract's launch call was given.
- **The callback** — registered once, receiving whatever output type
  `O` this specific contract declares.

The relationship: the registration/launch/delivery machinery itself has
no idea what specific kind of request it's handling — it's written
entirely against the generic `ActivityResultContract<I, O>` shape, and
only the concrete contract subclass plugged into a given
`registerForActivityResult(...)` call determines what actual input type
`launch(...)` requires and what actual output type the callback
eventually receives. Swapping one contract for another changes
everything about what's actually launched and what comes back, while
the surrounding registration and delivery code — the actual hard,
timing-sensitive machinery — stays completely identical in shape.

```
   registerForActivityResult(contract, callback)
                    |
        (I, O) fixed by whichever contract is plugged in:
                    |
       RequestPermission        <String, Boolean>
       StartActivityForResult   <Intent, ActivityResult>
       ... more contracts, same machinery ...
                    |
                    v
   ActivityResultLauncher<I>
                    |
                    |  .launch(input: I)
                    v
   Android launches the real target, eventually delivers O
                    |
                    v
   callback(result: O)  -- same registration/delivery machinery,
                           different concrete shape each time
```

---

## Mechanical Walkthrough

```java
private final ActivityResultLauncher<Intent> enableBluetoothLauncher =
        registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (result.getResultCode() == Activity.RESULT_OK) {
                onBluetoothEnabled();
            } else {
                onBluetoothDeclined();
            }
        });
```

- **`registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> { ... })`**
  — the registration itself, run as a field initializer, exactly like
  the permission pattern's own registration — the same unconditional,
  early-timing requirement applies here for the same underlying reason,
  since it's the exact same machinery underneath.
- **`result -> { if (result.getResultCode() == Activity.RESULT_OK) { ... } }`**
  — the callback lambda; `result` here is an `ActivityResult`, this
  specific contract's declared `O` type — a different contract would
  have delivered a different type to this exact same lambda position.

Triggering the request, separately, later:

```java
Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
enableBluetoothLauncher.launch(enableBtIntent);
```

- **`new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)`** — builds the
  actual request to hand in; this is an ordinary `Intent`, unrelated to
  the contract mechanism itself.
- **`enableBluetoothLauncher.launch(enableBtIntent)`** — the trigger
  call, taking an `Intent` because this specific contract's `I` type is
  `Intent` — the permission pattern's equivalent call takes a `String`
  instead, at the identical position in that other contract's shape.

---

## Collaboration — how it actually runs

1. `registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> { ... })`
   runs unconditionally, early — the identical timing requirement to
   the permission pattern's own registration rule, since it's the exact
   same underlying machinery, just plugged with a different contract.
2. Later, `enableBluetoothLauncher.launch(enableBtIntent)` is called,
   handing in an `Intent` because this specific contract's own `I` type
   is `Intent`.
3. Android launches a real `Activity` from the given `Intent` — here,
   the system's own built-in "enable Bluetooth?" screen — and that
   `Activity` runs its own independent lifecycle, entirely outside this
   calling `Activity`'s control.
4. Whenever that launched `Activity` finishes, it reports its own
   result code (and optionally, data); Android packages both into a
   single `ActivityResult` object.
5. The registered callback finally runs, receiving that
   `ActivityResult` — the exact `O` type this specific contract
   declared — and checks `result.getResultCode()` against
   `Activity.RESULT_OK` to decide what actually happened.

---

## Why It's Shaped This Way

The design principle is **separating the reusable "register early,
launch later, deliver asynchronously" machinery from the specific shape
of any one kind of request**, so a new kind of request — a new contract
— can be added without touching or duplicating the shared machinery at
all.

The alternative not chosen: a separate, hand-written
registration-and-callback mechanism for every different kind of
launched-and-answered request — one for permissions, a different one
for picking an image, another for scanning a barcode. The real cost
avoided: each one would have to correctly re-implement the same subtle,
easy-to-get-wrong timing rule (register before `STARTED`,
unconditionally) independently, multiplying the exact place this
pattern has already shown is easy to get wrong.

The cost this pattern itself carries: the generic `I`/`O` shape means a
specific contract's actual input and output types aren't visible at
the `registerForActivityResult` call site itself — a reader has to
know, or look up, what a given contract actually fixes `I` and `O` to,
since the registration call's own syntax looks identical either way.

---

## Recognizing It Elsewhere

Also recognized in: a generic HTTP client library, where the
transport/connection machinery is written once and different endpoints
simply supply their own request/response type pairing; a plugin
system's fixed load/execute/unload lifecycle, with each individual
plugin supplying its own specific behavior behind that shared shape; a
checkout system's payment-processing pipeline, where the overall
authorize/capture/confirm flow is identical regardless of which
specific payment method — card, wallet, bank transfer — is actually
plugged in as the strategy.

---

## Where This Actually Breaks

The most common real mistake: assuming `Activity.RESULT_OK` is the only
possible outcome and never actually checking the result code before
acting on `result.getData()`, especially for a system dialog the
developer expects users to almost always accept. When a user does
decline, or backs out of the dialog without deciding, the callback
still runs — because the launched `Activity` still finished, just with
`RESULT_CANCELED` — and code that skips the check and reaches straight
for `getData()` either gets `null` where it expected real data, or,
worse, silently proceeds as if the user had agreed to something they
explicitly declined.
