# Lesson 150: Algebraic Data Types

**What you will build**: By the end of this lesson you'll enumerate every possible value of two small hand-built types — one where a value bundles a color *and* a flag together, one where a value is *either* a tagged color *or* a tagged flag — and count them: `6` for the first, `5` for the second, exactly `3 \times 2` and `3 + 2`. That's not a coincidence: a **product type** literally multiplies its possibilities, a **sum type** literally adds them, and Lesson 149's own tree — `nil`, *or* a value with two subtrees — is a sum of a product, named precisely for the first time.

**What you need to know first**: Lesson 149's tree constructors (empty, or value-with-two-subtrees); Lesson 59's counting principle and Lesson 60's addition/multiplication rules, applied here to types instead of outcomes; Lesson 92's `[value left right]` vector-as-triple.

**Terms introduced in this lesson**:

- **product type** — a type whose values bundle several components together, all at once — every combination of one value from each component is a distinct value of the product. *Why it matters*: Lesson 92's `[value left right]` is a product of three components; the *number* of possible nodes is the product of each component's own possibility count, exactly why it's called a product type.
- **sum type** — a type whose values are *one* of several tagged alternatives, never more than one at a time. *Why it matters*: Lesson 149's tree is `nil` *or* a node — never both — and the number of possible values is the *sum* of each alternative's own count, exactly why it's called a sum type.

**Objects and methods used**: None new. This lesson reuses `assoc`/`count`/`get` (Lesson 84, Lesson 94) and `concat` (Lesson 28), each already covered.

---

## Concept Unit: Product Types — Bundling Multiplies Possibilities

### The Problem

`[color flag]` bundles a color and a boolean flag together — every real value has both, always. If there are `3` possible colors and `2` possible flags, how many distinct `[color flag]` pairs actually exist?

### Introduce the concept in isolation

```clojure
(defn all-products [colors flags i j acc]
  (if (>= i (count colors))
    acc
    (if (>= j (count flags))
      (all-products colors flags (+ i 1) 0 acc)
      (all-products colors flags i (+ j 1) (assoc acc (count acc) [(get colors i) (get flags j)])))))
```

```
user=> (def colors ["red" "green" "blue"])
user=> (def flags [true false])
user=> (all-products colors flags 0 0 [])
[["red" true] ["red" false] ["green" true] ["green" false] ["blue" true] ["blue" false]]
user=> (count (all-products colors flags 0 0 []))
6
```

Every color paired with every flag, enumerated exhaustively: `6` distinct pairs, exactly `3 \times 2`. This is a **product type** — bundling a color *and* a flag together means the total number of possible bundles is the product of each part's own count, the identical `\times` from Lesson 60's own multiplication rule, now counting *types* instead of outcomes of separate choices.

### Discard the throwaway example

Not applicable — `all-products` is real, reusable, and its output was counted directly, not assumed from the formula alone.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch enumeration built to make Lesson 92's own `[value left right]` shape's possibility-count concrete.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn all-products [colors flags i j acc]
  (if (>= i (count colors))
    acc
    (if (>= j (count flags))
      (all-products colors flags (+ i 1) 0 acc)
      (all-products colors flags i (+ j 1) (assoc acc (count acc) [(get colors i) (get flags j)])))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (>= i (count colors)) acc ...)`** — reappearing nested-scan outer bound (used since Lesson 134): once every color has been paired with every flag, return the accumulated list.
- **`(if (>= j (count flags)) (all-products colors flags (+ i 1) 0 acc) ...)`** — reappearing inner-scan reset (Lesson 134's own two-level nested scan): once one color has been paired with every flag, advance to the next color and reset the flag index.
- **`(assoc acc (count acc) [(get colors i) (get flags j)])`** — reappearing `assoc`-as-append (Lesson 94): each new pair is appended as a genuine two-element product, one color and one flag together.

### CS Lens

Lesson 92's `[value left right]` is exactly this shape, three components instead of two: the total number of possible tree nodes, for a fixed set of possible values and possible subtree shapes, is the product of all three counts — the identical reasoning this unit just made concrete for two components.

### SE Lens

Naming `[color flag]` a product type isn't decoration — it predicts real behavior: adding a third component (say, a size) doesn't add possibilities, it *multiplies* them, `3 \times 2 \times (\text{size count})`, exactly the combinatorial explosion Lesson 61's own permutation-counting already warned about, now recognized in a type's own shape before any code enumerates it.

---

## Concept Unit: Sum Types — Alternatives Add Possibilities

### The Problem

A value that's *either* a tagged color *or* a tagged flag — never both — is a genuinely different shape than the previous unit's bundle. How many distinct values does *that* type have?

### Introduce the concept in isolation

```clojure
(defn tagged-colors [colors i acc]
  (if (>= i (count colors))
    acc
    (tagged-colors colors (+ i 1) (assoc acc (count acc) ["color" (get colors i)]))))

(defn tagged-flags [flags i acc]
  (if (>= i (count flags))
    acc
    (tagged-flags flags (+ i 1) (assoc acc (count acc) ["flag" (get flags i)]))))
```

```
user=> (concat (tagged-colors colors 0 []) (tagged-flags flags 0 []))
(["color" "red"] ["color" "green"] ["color" "blue"] ["flag" true] ["flag" false])
user=> (count (concat (tagged-colors colors 0 []) (tagged-flags flags 0 [])))
5
```

Every color, tagged `"color"`, *plus* every flag, tagged `"flag"` — `5` distinct values total, exactly `3 + 2`. This is a **sum type**: a value is a *color-alternative* or a *flag-alternative*, never a bundle of both, and the total count is the sum of each alternative's own count, Lesson 60's addition rule, now counting type alternatives instead of separate outcome groups.

### Discard the throwaway example

Not applicable — both functions are real, and `concat` (Lesson 28) combined their results into one real, counted list.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch enumeration built to make sum-type counting concrete, contrasted directly against the previous unit's product.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn tagged-colors [colors i acc]
  (if (>= i (count colors))
    acc
    (tagged-colors colors (+ i 1) (assoc acc (count acc) ["color" (get colors i)]))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`["color" (get colors i)]`** — first appearance of a *tagged* value: a plain string tag paired with the real value, marking which alternative this particular value came from — necessary here since, unlike the previous unit's product, a bare value alone wouldn't say whether it came from the color side or the flag side.
- **`(concat (tagged-colors colors 0 []) (tagged-flags flags 0 []))`** — reappearing `concat` (Lesson 28, and Lesson 141's own monoid example): joins two separately-built lists of alternatives into the one list representing every value of the sum type.

### CS Lens

Lesson 149's tree is precisely a sum type: a tree node is `nil` — one alternative, with exactly `1` possible value — *or* a real node — the other alternative — never both at once, the identical "tagged, mutually exclusive alternatives" shape this unit just counted for colors and flags.

### SE Lens

A sum type's tag is what makes "which alternative is this" a real, checkable question — Lesson 149's own `(nil? t)` check *is* reading that tag, even though it was never described that way before this lesson; without some way to distinguish alternatives, a sum type's values would be genuinely ambiguous the moment two alternatives could look alike.

### Connection to the previous unit

The previous unit bundled two components together, multiplying their possibilities; this unit offers two alternatives instead, adding their possibilities — the two fundamental ways a type's shape can combine smaller types, both counted directly rather than assumed.

---

## Connect the Pieces

Product and sum, counted side by side, both matching Lesson 59's and Lesson 60's own counting rules exactly:

```clojure
(println "Product count:" (count (all-products colors flags 0 0 [])) "expected 3*2 =" (* 3 2))
(println "Sum count:" (count (concat (tagged-colors colors 0 []) (tagged-flags flags 0 []))) "expected 3+2 =" (+ 3 2))
```

```
Product count: 6 expected 3*2 = 6
Sum count: 5 expected 3+2 = 5
```

Bundling multiplies; choosing among alternatives adds — the exact two rules Lesson 60 already proved for counting outcomes, now proven again for counting a type's own possible values.

## What Breaks Without This

Suppose a data model needed "a shape, which might be a circle (radius) or a rectangle (width and height)," and represented it as a *product* — always storing a radius, a width, *and* a height together, using some sentinel like `0` for whichever fields don't apply to the current shape. That's the wrong algebraic shape for the actual problem: "circle or rectangle" is a sum (one alternative or the other), forced into a product's bundle-everything-together shape. The real cost shows up immediately: every function handling this type has to remember which sentinel values mean "not applicable" rather than the type itself guaranteeing only the relevant fields are ever present — exactly the kind of representation-invariant bug Lesson 106 already warned about, here traced to picking the wrong one of these two fundamental type shapes from the start.

## Exercises

1. **Trace.** By hand, list all `6` values `all-products` produces for `colors`/`flags`, confirming the enumeration order matches the nested-scan shape.
2. **Predict.** Before checking, predict the product count and sum count for a set of `4` sizes combined with `colors` (`3` values) — both as a product (`[color size]`) and as a sum (tagged color-or-size). Then verify both with real code.
3. **Verify.** Confirm Lesson 92's own `[value left right]` node shape is a product of exactly three components, by identifying what each of the three positions independently ranges over.
4. **Break it, on purpose.** Remove the tags (`"color"`/`"flag"`) from this lesson's sum-type values, leaving bare values only, and describe a concrete case where two different alternatives become genuinely indistinguishable without them.
5. **Generalize.** Describe, without coding it, why Lesson 7's boolean (`true`/`false`) is a sum type with exactly `2` values, and why a product of two booleans has exactly `4`.
6. **Reconstruct.** Close this lesson. From memory, explain why Lesson 149's tree is a *sum* of a *product* — name which part is the sum and which part is the product.

## Definition of Done

- [ ] You can define a product type and explain why bundling multiplies possibility counts.
- [ ] You can define a sum type and explain why choosing among alternatives adds possibility counts.
- [ ] You can explain why Lesson 92's `[value left right]` is a product and Lesson 149's tree shape is a sum.
- [ ] You completed Exercise 2 and verified both a product count and a sum count for a new pair of small types.
- [ ] You completed Exercise 4 and described a concrete ambiguity caused by removing sum-type tags.
- [ ] Commit your Exercise 2 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm color/size product count 12 and sum count 7; show untagged color/size values collide when both use strings"` — not just `"lesson 150 exercise"`.

---

**Next lesson:** Lesson 151, *Pattern Matching*, derives a direct, principled way to ask "which alternative is this" for a sum type — the exact question this lesson's `nil?` check and tag strings were both answering by hand, given a real, structured technique instead of ad hoc conditionals.
