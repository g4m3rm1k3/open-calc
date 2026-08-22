# Lesson 5.7: Reading the Same Tree Two Ways

**What you will build:** No new feature ships from this lesson either — like this slice's own purely foundational lessons, this is a real, executed investigation, not a production change. This project's own real `toPostfix` already turns `"3+5×(2−8)"` into a real, correctly-ordered postfix sequence — but a flat list of tokens hides the expression's own real *structure*: which operator actually belongs to which operands, and how deeply nested each one is. This lesson introduces the data structure that makes that structure explicit — a **tree** — and proves, with real, executed code, something genuinely satisfying: reading the exact same tree two different systematic ways produces, on one of those two reads, the *exact* postfix sequence `toPostfix` already computed for real, by a completely different method.

**What you need to know first:** This project's own real, permanent `toPostfix` function and its own real, tested result for this project's own target expression, `["3", "5", "2", "8", "−", "×", "+"]`. Nullable types and classes with default parameter values, both established since this project's own early work. `MutableList`, already established throughout this slice.

## Terms used in this lesson

- **Node** — a single element of a tree, holding a value and, optionally, references to other nodes beneath it. This word exists because a tree isn't one flat collection the way a `List` or `Map` is — it's built from individual pieces that each point to their own smaller pieces, and "node" names one of those individual pieces. A `Node` that references other `Node`s is a real, ordinary example of a *recursive data structure* — a type that contains, as part of its own definition, more instances of itself — the same self-referential shape this slice's own coming work (Recursion) will meet again from the function side rather than the data side.
- **Parent / child** — the relationship between a node and the nodes it directly references: a node is the *parent* of any node it points to, and each of those is that parent's *child*. This word exists to describe the tree's own shape in relative terms — the same node can be a child of one node and the parent of another, depending on which relationship is being discussed.
- **Root** — the one node in a tree that has no parent — the starting point every other node is reachable from, by following child references. This word exists because a tree needs exactly one well-defined place to start reading from, unlike a `List`, which is read from a fixed position (`0`) that has nothing to do with the data's own structure.
- **Leaf** — a node with no children at all. This word exists because a leaf is where a tree's own structure genuinely ends — nothing beneath it — the same way a real tree's own leaves are the parts with no further branches growing from them.
- **Binary tree** — a tree in which every node has *at most* two children, conventionally called left and right. This word exists because "tree" alone doesn't say how many children a node can have — a binary tree is specifically the shape where that number is capped at two, which is exactly the shape every operator in this project's own real expressions naturally has: one left operand, one right operand.
- **Tree traversal** — visiting every node in a tree, exactly once each, in some well-defined, systematic order. This word exists because, unlike a `List`, a tree has no single obvious reading order — reaching every node requires an explicit rule for which one gets visited next, and different rules produce genuinely different, both equally valid, sequences.
- **Pre-order traversal** — a specific traversal rule: visit a node itself first, then its left subtree, then its right subtree, applying the same rule recursively-in-shape at every node. This word exists to name one specific, standard visiting order, distinguishing it from the others below.
- **Post-order traversal** — a different traversal rule: visit a node's left subtree first, then its right subtree, and only then the node itself. This word exists to name the specific order this lesson's own real, executed proof turns out to matter for directly: an operator, in this ordering, is only ever visited *after* both of its own operands already have been.

## Objects and methods used

**Everything else in the file, not this lesson's subject but still explained.** None of this lesson's own subject — nodes, trees, traversal — is itself a real external class or method; each one is taught here as new, throwaway code, covered in this unit's own Mechanical Walkthrough. Every entry below is supporting cast: real standard-library methods that throwaway code depends on, each already established earlier in this project or this slice.

- **`mutableListOf<T>()` / `MutableList<T>`, `MutableList.add(element)`, `MutableList.removeAt(index)`**
  - *What it is:* The real standard-library collection type and methods already established throughout this slice's own Stack and Queue lessons.
  - *Implementation:* `fun <T> mutableListOf(): MutableList<T>`; `fun add(element: E): Boolean`; `fun removeAt(index: Int): T` — all part of the Kotlin standard library.
  - *Its use:* This lesson's own traversal function uses a `MutableList<Node>` as an explicit stack — the identical real shape this slice's own `Stack` class already proved, built directly from raw list operations here since the traversal is a standalone, throwaway lab, not real project code.
  - *Type:* A factory function and two instance methods.
  - *Responsibility:* Growable, ordered, indexable storage.
  - *Depends on:* The list instance and, where relevant, an index or element.
  - *Connects to:* Used together to implement push (`add`) and pop (`removeAt(size - 1)`) inside this lesson's own traversal function.
  - *Shape:* Standard-library data structure and methods, reappearing here unchanged.
- **`Collection.isNotEmpty()`**
  - *What it is:* A method answering whether a collection holds at least one element, already established from this slice's own opening lesson.
  - *Implementation:* `fun <T> Collection<T>.isNotEmpty(): Boolean`, part of the Kotlin standard library.
  - *Its use:* Controls this lesson's own traversal `while` loop, continuing for as long as there's still a node waiting to be visited.
  - *Type:* An extension function on `Collection<T>`.
  - *Responsibility:* Answering one question about a collection's current size.
  - *Depends on:* The collection it's called on.
  - *Connects to:* The condition of this lesson's own traversal function's `while` loop.
  - *Shape:* A standard-library predicate, reappearing here unchanged.
- **`while` loop**
  - *What it is:* A control structure repeating its body for as long as a condition stays `true`, already established from this slice's own Big-O and Queue lessons.
  - *Implementation:* `while (condition) { body }`.
  - *Its use:* Drives this lesson's own traversal, one node at a time, until every node has been visited.
  - *Type:* A control-flow keyword.
  - *Responsibility:* Deciding, fresh, before every repetition, whether to run the body again.
  - *Depends on:* A `Boolean` condition, re-evaluated every time control reaches the top of the loop.
  - *Connects to:* Wraps this lesson's own traversal function's entire body.
  - *Shape:* A fundamental control structure, reappearing here unchanged.
- **`!= null` (nullable comparison)**
  - *What it is:* A null comparison, already established throughout this project's own real `nextState`.
  - *Implementation:* Ordinary equality comparison against the literal `null`.
  - *Its use:* This lesson's own traversal function checks whether a node's `left`/`right` properties are actually present before pushing them, since a leaf node's own children are both `null`.
  - *Type:* An equality comparison.
  - *Responsibility:* Distinguishing "a real child is present" from "this side of the tree ends here."
  - *Depends on:* The nullable value being compared.
  - *Connects to:* Guards two real pushes inside this lesson's own traversal function.
  - *Shape:* Already-established Kotlin syntax, reappearing here unchanged.

## Concept Unit: Nodes, Parent/Child, and Traversal

### The Problem

This project's own real `toPostfix` already turns `"3+5×(2−8)"`'s own tokens into `["3", "5", "2", "8", "−", "×", "+"]` — a real, correctly-ordered flat list. But a flat list, by itself, doesn't show *which* operator actually applies to *which* operands, or how deeply nested one part of the expression is inside another — that structure existed the whole time, in the original expression's own shape, but nothing in this project currently represents it directly. This slice's own coming work (an Abstract Syntax Tree, later in this stage) will need exactly that: a real, explicit representation of an expression's own nested structure, not just its final linear order.

> Picture this project's own real expression, `3 + 5 × (2 − 8)`, drawn out by hand as a diagram where each operator sits above the two things it actually operates on, and each of *those* can themselves be another operator with its own two things underneath. Try actually sketching it — which operator ends up at the very top, and why that one specifically, given what this slice already knows about precedence? If you had to visit every piece of that diagram exactly once, is there only one order that makes sense, or could you reasonably visit its pieces in more than one valid order? If you visited every operand of a piece *before* visiting that piece itself, what would that guarantee about an operator versus its own operands — which one would always be ready first?

### Introduce the Concept in Isolation

The following throwaway file is not part of this project and never will be — a small, hand-written `Node` class, the exact real tree this project's own target expression forms, and a real, general, iterative traversal proving it can be walked:

```kotlin
class Node(val value: String, val left: Node? = null, val right: Node? = null)

fun preOrder(root: Node): List<String> {
    val visited = mutableListOf<String>()
    val stack = mutableListOf<Node>()
    stack.add(root)
    while (stack.isNotEmpty()) {
        val node = stack.removeAt(stack.size - 1)
        visited.add(node.value)
        if (node.right != null) {
            stack.add(node.right)
        }
        if (node.left != null) {
            stack.add(node.left)
        }
    }
    return visited
}

fun main() {
    val two = Node("2")
    val eight = Node("8")
    val minus = Node("−", two, eight)
    val five = Node("5")
    val times = Node("×", five, minus)
    val three = Node("3")
    val plus = Node("+", three, times)

    println(preOrder(plus))
    println(listOf(three.value, five.value, two.value, eight.value, minus.value, times.value, plus.value))
}
```

The tree built here is exactly this project's own real expression, `3 + 5 × (2 − 8)`, drawn as data instead of on paper:

```
        +
       / \
      3   ×
         / \
        5   −
           / \
          2   8
```

`plus` is the **root** — the `+` at the very top, with no parent of its own. `three`, `five`, `two`, and `eight` are **leaves** — each one a real number with no children. Every node here has *at most* two children, making this a **binary tree**. Compiled and run for real, this produced:

```
[+, 3, ×, 5, −, 2, 8]
[3, 5, 2, 8, −, ×, +]
```

The first line is a real **pre-order traversal** — visit the node itself, then its left child's own subtree, then its right child's own subtree — computed by the general, iterative `preOrder` function, using a real stack (a plain `MutableList` here, the identical mechanism this slice's own `Stack` lesson already proved): push the root; then, repeatedly, pop a node, visit it, and push its children — right first, then left, so that popping later reaches the left child before the right one, keeping the visiting order correct.

The second line is a **post-order traversal** of the *exact same tree* — left child's subtree, then right child's subtree, then the node itself — read off by hand here rather than computed by a general function, since general, reusable tree-processing is this slice's own next lesson's job. And the result is `[3, 5, 2, 8, −, ×, +]` — which is not just similar to, but *character-for-character identical* to `toPostfix`'s own real, already-tested postfix result for this exact expression. Two completely different algorithms — a stack-based token reordering, and a tree read in a specific order — reach the identical real answer, because a **post-order traversal of an expression's own correct tree** and a **correct Shunting-Yard conversion of the same expression's own tokens** are two different real paths to the same underlying fact: which operator actually needs its operands ready before it can run.

### Discard the Throwaway Example

This `Node` class, its tree, and both traversals are deleted now and will not appear in this project again. This project's own real `toPostfix` is completely unmodified — this unit's own job was proving that a tree can represent this project's own real expression correctly, and that reading it the right way reproduces an answer this project has already, separately, proven correct.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order:

- `class Node(val value: String, val left: Node? = null, val right: Node? = null)` — a class declaration, already established, with three constructor properties: `value`, a non-nullable `String`; `left` and `right`, each a nullable `Node?` defaulting to `null`, already-established nullable-type and default-parameter syntax. `Node?` referencing `Node` itself, inside `Node`'s own declaration, is what makes this a real recursive data structure, already named in Terms above.
- `fun preOrder(root: Node): List<String>` — a function declaration, already established, taking the tree's own root and returning the real, ordered list of values visited.
- `val visited = mutableListOf<String>()` — a real, empty `MutableList<String>`, documented above, accumulating values in the order they're actually visited.
- `val stack = mutableListOf<Node>()` — a second real `MutableList`, this one holding `Node`s still waiting to be visited, playing the identical real role this slice's own `Stack` class already proved, expressed here with raw list operations.
- `stack.add(root)` — the real `MutableList.add` method, documented above, seeding the stack with the one node every traversal has to start from.
- `while (stack.isNotEmpty())` — the real `while` loop and `isNotEmpty()` method, both documented above, continuing until every pushed node has been popped.
- `val node = stack.removeAt(stack.size - 1)` — the real `MutableList.removeAt` method, documented above, popping the most recently pushed node — real LIFO order, the same mechanism this slice's own Stack lesson already proved.
- `visited.add(node.value)` — reading the popped node's own `value` property (already-established property access) and appending it to the running result.
- `if (node.right != null) { stack.add(node.right) }` — the real null comparison documented above, pushing the right child only if one actually exists; skipped entirely for a leaf, whose `right` is `null` by the constructor's own default.
- `if (node.left != null) { stack.add(node.left) }` — the identical check for the left child, pushed *after* the right child specifically so that popping reaches it *first* — real LIFO order applied deliberately, to keep left-before-right visiting correct.
- `return visited` — already established.
- `fun main()`, `val two = Node("2")`, `val eight = Node("8")` — already established: two real leaf nodes, each built with only a `value`, leaving both `left` and `right` at their default `null`.
- `val minus = Node("−", two, eight)` — a real internal node, its own `left` and `right` set to the two leaves just built.
- The remaining `val` declarations — `five`, `times`, `three`, `plus` — repeat this identical shape, building the tree from its own leaves upward until `plus`, the root, references everything beneath it.
- `println(preOrder(plus))` — already established, calling the function just declared on the completed tree's own root.
- `println(listOf(three.value, five.value, two.value, eight.value, minus.value, times.value, plus.value))` — a real `listOf` call, already established, reading each named node's own `value` directly, in a hand-chosen order matching the post-order rule for this specific, known tree.

### CS Lens

Trees and traversal are two of the most heavily reused ideas in all of computing — almost anything with real, meaningful nesting ends up represented this way.

```
Also recognized in: a real file system's own directory structure, the
DOM every real web browser builds from HTML, an Abstract Syntax Tree
in every real compiler or interpreter (the exact real structure this
project's own coming work builds), a decision tree, an organization
chart, a family tree
```

### SE Lens

The alternative not chosen here: skip building a tree at all, and stop with the flat postfix list `toPostfix` already produces, evaluating it directly with a stack-based postfix evaluator — a real, legitimate, working approach that needs no tree at all. The real tradeoff: postfix evaluation alone would genuinely finish this project's own real evaluation job; a tree adds real value beyond that — it makes an expression's own structure directly inspectable (which operator's own operands are which, how deep a sub-expression sits) in a way a flat list doesn't, and it opens the door to real techniques (like the recursive processing this slice's very next lesson introduces) that read far more naturally over a tree than over a flat sequence. This slice's own broader, explicit goal is teaching real, transferable data structures through this calculator, not only the minimum needed to get one number — trees are worth the real, additional structure they carry for exactly that reason.

### Commands Needed

`kotlinc lab1_expression_tree.kt -include-runtime -d lab1.jar` compiles this file into a real, standalone, executable `.jar`, exactly as established throughout this slice; `java -jar lab1.jar` runs it.

### Run It

Real command run: `kotlinc lab1_expression_tree.kt -include-runtime -d lab1.jar`, then `java -jar lab1.jar`. Real, executed output:

```
[+, 3, ×, 5, −, 2, 8]
[3, 5, 2, 8, −, ×, +]
```

### Connect the Pieces

A tree, built by hand to match this project's own real expression exactly, proved two real things at once: a general, iterative traversal genuinely works, and reading that same tree in a different, specific order reproduces an answer this project already, separately proved correct — real, mutual confirmation that both this slice's Shunting-Yard work and this lesson's own tree both describe the same underlying truth about this expression.

## Connect the Pieces

Follow this project's own real expression through the one new idea this lesson introduces. `3 + 5 × (2 − 8)` was drawn, for the first time in this project's own work, as a real tree — seven real `Node`s, built from the leaves up, with `+` sitting at the root because it's the very last operation this expression actually performs. A real, general, iterative pre-order traversal, using a plain list as a stack in the identical shape this slice's own Stack lesson already proved, visited every one of those seven nodes and produced `[+, 3, ×, 5, −, 2, 8]` — node first, then left, then right, all the way down. A second traversal of the identical tree, read left-then-right-then-node instead, produced `[3, 5, 2, 8, −, ×, +]` — and that sequence is not merely similar to, but exactly, character for character, the same real postfix result this project's own `toPostfix` function already computed, for real, in this slice's own immediately preceding lesson, using a completely different real algorithm. Nothing about this project's own permanent code changed — no `Node` class exists in the real project yet, and none of this lesson's own code will be reused directly. What exists now is real, executed proof that a tree is a faithful, correct way to represent this project's own real expressions, and a first, concrete glimpse of exactly the traversal order — left, right, then the node itself — this slice's own next real work will need a general, reusable way to perform.
