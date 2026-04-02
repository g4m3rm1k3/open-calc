// Phase 0 — Lesson 0.3: Values, Types, and Identity
// Focus: Primitive vs Reference, Memory Model (Stack/Heap), Identity vs Equality

const LESSON_JS_CORE_0_3 = {
  title: 'Values, Types, and Identity',
  subtitle: 'The First Principles of JavaScript Memory',
  sequential: true,

  cells: [
    // ── 1. The Core Split ──────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Great Divide: Primitives vs. Objects\n\nEvery value in JavaScript falls into one of two categories. How the computer stores them in memory is completely different:\n\n1. **Primitives** (Strings, Numbers, Booleans, null, undefined, Symbol, BigInt)\n2. **Objects** (Objects, Arrays, Functions)\n\n**Primitives are values.** When you move a primitive, you move the actual data.\n**Objects are addresses.** When you move an object, you are moving a pointer to a location in memory.`,
    },

    // ── 2. Primitive Immutability ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `**Primitives are immutable.** You cannot "change" the number 5 into the number 6. You can only choose a different number.\n\nRun this code. Notice that even though we call a method on the string, the original string remains exactly the same. We can only create *new* strings.`,
      startCode: `let name = "alice";
name.toUpperCase(); // This returns "ALICE" but does NOT change 'name'
console.log("Original name:", name); 

let newName = name.toUpperCase();
console.log("New name:", newName);`,
      outputHeight: 120,
    },

    // ── 3. Objects are Mutable ──────────────────────────────────────────────
    {
      type: 'js',
      instruction: `**Objects are mutable.** Unlike primitives, you can reach inside an object and change its properties without creating a new one.\n\nWatch how the same object in memory is being modified directly.`,
      startCode: `const user = { name: "Alice" };
user.name = "Bob"; // We changed a property INSIDE the object
console.log("User object:", user);

const scores = [10, 20];
scores.push(30); // We added a value to the same array in memory
console.log("Scores array:", scores);`,
      outputHeight: 120,
    },

    // ── 4. The Memory Model: Stack vs Heap ──────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Stack vs. Heap\n\nTo understand why they behave differently, we must look at memory:\n\n- **The Stack** is for fast, small items. Primitives live here. They are stored directly in the "execution context."\n- **The Heap** is a large, unstructured pool of memory. Objects live here because they can grow to any size.\n\nWhen you create an object, the **Stack** only holds a small "Reference" (an address like \`0x001\`) that points to the actual data in the **Heap**.`,
    },

    // ── 5. Copying Primitives (By Value) ────────────────────────────────────
    {
      type: 'js',
      instruction: `When you copy a primitive, you are making a **real copy** of the data. Changing one does not affect the other because they live in two different spots on the Stack.`,
      startCode: `let a = 10;
let b = a; // 'b' gets its own copy of 10
b = 20;

console.log("a is still:", a);
console.log("b is now:", b);`,
      outputHeight: 100,
    },

    // ── 6. Copying Objects (By Reference) ───────────────────────────────────
    {
      type: 'js',
      instruction: `When you "copy" an object, you are only copying the **Address**. Both variables now point to the exact same spot in the Heap.\n\nThis is why changing \`userB\` also changes \`userA\`. They are two names for the same thing.`,
      startCode: `const userA = { name: "Alice" };
const userB = userA; // Both point to the same memory address

userB.name = "Bob";

console.log("userA name:", userA.name);
console.log("userB name:", userB.name);
console.log("Are they the same object?", userA === userB);`,
      outputHeight: 140,
    },

    // ── 7. Identity vs Equality ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Identity vs. Structural Equality\n\nThis is the #1 source of bugs for new JS developers.\n\n- **Primitives** are compared by **Value**. If the contents match, they are equal.\n- **Objects** are compared by **Identity** (Address). Two objects are only equal if they are the *exact same instance* in memory.`,
    },

    // ── 8. Object Comparison Trap ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `Even if two objects look identical, they are **not equal** if they live at different addresses. Every time you use \`{}\`, you are carving out a *new* spot in the Heap.`,
      startCode: `console.log("Strings:", "hi" === "hi"); // true (same value)
console.log("Numbers:", 5 === 5);      // true (same value)

const obj1 = { id: 1 };
const obj2 = { id: 1 };

console.log("Identical objects:", obj1 === obj2); // false! Differend addresses.`,
      outputHeight: 120,
    },

    // ── 9. Challenge: The Reference Trap ────────────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge: Don't break the original!\n\nI've given you a \`hero\` object. Create a variable \`sidekick\` that starts with the same data, but fix the sidekick's name to "Robin" **without** changing the hero's name to "Robin".\n\n*Hint: If you just do \`sidekick = hero\`, they will share the same memory!*`,
      startCode: `const hero = { name: "Batman" };
// 1. Create sidekick as a SEPARATE object with the same name
const sidekick = { name: hero.name };

// 2. Change sidekick's name
sidekick.name = "Robin";

console.log("Hero:", hero.name);
console.log("Sidekick:", sidekick.name);`,
      solutionCode: `const hero = { name: "Batman" };
const sidekick = { ...hero };
sidekick.name = "Robin";`,
      check: (js, logs) => {
        return logs.some(l => l.msg.includes("Hero: Batman")) && 
               logs.some(l => l.msg.includes("Sidekick: Robin"));
      },
      successMessage: "Great! You successfully 'cloned' the object instead of just copying the reference.",
    },

    // ── 10. The 'null' vs 'undefined' Distinction ─────────────────────────────
    {
      type: 'markdown',
      instruction: `### Empty Values: null vs undefined\n\nBoth represent "nothing," but with different semantic meanings:\n\n- **undefined**: A variable has been declared but has no value yet (The computer's "I don't know").\n- **null**: An intentional absence of value (The programmer's "This is empty").`,
    },

    // ── 11. Visualizing undefined ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `JavaScript gives you \`undefined\` automatically for things that don't exist yet.`,
      startCode: `let x;
console.log("Declared but not set:", x);

const obj = { a: 1 };
console.log("Missing property:", obj.b);

function test(y) { console.log("Missing argument:", y); }
test();`,
      outputHeight: 140,
    },

    // ── 12. Visualizing null ─────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `You use \`null\` when you want to explicitly say "this value is gone" or "this has no owner."`,
      startCode: `let currentUser = { name: "Alice" };
// User logs out...
currentUser = null; 

console.log("Value is now intentionally empty:", currentUser);`,
      outputHeight: 100,
    },

    // ── 13. Type Checking with 'typeof' ──────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The 'typeof' Operator\n\nYou can ask JavaScript what type a value is. But be careful—there are some famous historical bugs in this tool!`,
    },

    // ── 14. typeof demonstration ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `Try these different values. Notice the weird result for \`null\`—this is a bug in JavaScript from 1995 that can never be fixed because it would break the internet!`,
      startCode: `console.log(typeof 42);
console.log(typeof "hello");
console.log(typeof true);
console.log(typeof { a: 1 });
console.log(typeof [1, 2]); // Arrays are objects!
console.log(typeof null);    // "object" (The 30-year-old bug)
console.log(typeof undefined);`,
      outputHeight: 180,
    },

    // ── 15. The 'const' Misconception ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Does 'const' mean unchangeable?\n\nThis is the most common point of confusion. \`const\` does **not** make a value immutable. It only prevents you from **reassigning** the variable to a different address.\n\n- If \`const\` points to a **Primitive**, it's effectively locked.\n- If \`const\` points to an **Object**, you can still change the contents of that object!`,
    },

    // ── 16. const + objects ──────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `Watch how we can modify the object even though it's a \`const\`. The "binding" is locked, but the "data" in the heap is not.`,
      startCode: `const bag = { items: ["apple"] };

// This is ALLOWED (modifying the heap)
bag.items.push("orange");
console.log("Bag contents changed:", bag.items);

try {
  // This is FORBIDDEN (trying to change the address on the stack)
  bag = { items: ["banana"] };
} catch(e) {
  console.error("Error:", e.message);
}`,
      outputHeight: 160,
    },

    // ── 17. The Visual Memory Model ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `Let's visualize the Stack and Heap through code. Click Run and watch the console simulate the memory states.`,
      startCode: `function logMemory(stack, heap) {
  console.log("--- MEMORY SNAPSHOT ---");
  console.log("STACK (Address -> Value):", JSON.stringify(stack));
  console.log("HEAP  (Address -> Data): ", JSON.stringify(heap));
}

let name = "Alice"; // Stack: [name: "Alice"]
let user = { id: 1 }; // Stack: [user: 0x01], Heap: [0x01: {id: 1}]

logMemory({ name: "Alice", user: "0x01" }, { "0x01": { id: 1 } });`,
      outputHeight: 140,
    },

    // ── 18. Identity vs Content (Drill) ──────────────────────────────────────
    {
      type: 'js',
      instruction: `One final check: Why does this return false? Both have the same content.`,
      startCode: `const list1 = [1, 2, 3];
const list2 = [1, 2, 3];

console.log("Value Equality check:", list1 === list2);
console.log("Are they same identity?", list1 === list2);`,
      outputHeight: 100,
    },

    // ── 19. Challenge: Identity Predictor ─────────────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge: Predict Identity\n\nI've created three variables. Without running the code, can you predict which comparisons will be \`true\`? Fix the \`result\` variables to match reality.`,
      startCode: `const r1 = { x: 10 };
const r2 = r1;
const r3 = { x: 10 };

const check1 = (r1 === r2); // Is this true or false?
const check2 = (r1 === r3); // Is this true or false?

console.log("Check 1:", check1);
console.log("Check 2:", check2);`,
      solutionCode: `const r1 = { x: 10 };
const r2 = r1;
const r3 = { x: 10 };
const check1 = true;
const check2 = false;`,
      check: (js, logs) => {
        return logs.some(l => l.msg.includes("Check 1: true")) && 
               logs.some(l => l.msg.includes("Check 2: false"));
      },
      successMessage: "Spot on! You understand that identity depends on memory address, not content.",
    },

    // ── 20. Summary ─────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Memory Model Mastery\n\n- **Primitives** are stored by **Value**. They are immutable and live on the Stack.\n- **Objects** are stored by **Reference**. They are mutable and live in the Heap.\n- **Equality (\`===\`)** checks value for primitives but identity for objects.\n- **\`const\`** locks the variable's address, but doesn't stop objects from changing internally.\n\nYou've cleared the hardest mental hurdle in JS internals. Ready for Variables?`,
    },
  ],
};

export default {
  id: 'js-core-0-3-values-identity',
  slug: 'values-types-identity',
  chapter: 'js0.1',
  order: 3,
  title: 'Values, Types, and Identity',
  subtitle: 'Understanding how JS handles data in memory.',
  tags: ['javascript', 'memory', 'primitives', 'objects', 'identity'],

  hook: {
    question: 'Why does [] === [] return false?',
    realWorldContext: 'In JavaScript, knowing NOT just what a value is, but WHERE it is in memory, is the difference between a senior dev and a beginner.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'In JavaScript, understanding the difference between **Primitive values** and **Reference types (Objects)** is the foundation of mental model mastery.',
      'A **Primitive** (like 5, "hello", or true) is stored directly where it is used. When you copy it, you make a real, separate copy of the data.',
      'An **Object** (including Arrays and Functions) is stored in the **Heap**. What lives in your variable is just a "pointer" or "address" to that memory location. When you copy an object, you are only copying the address, not the data.',
      'This distinction explains why changing one object might unexpectedly change another, while changing a number never affects other variables.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Identity vs Equality',
        body: 'Primitive values are equal if they have the same content. Objects are only equal if they are the exact same instance in memory (same address).',
      },
      {
        type: 'warning',
        title: 'The Reference Trap',
        body: 'Never compare two objects or arrays with `===` unless you are checking if they are the exact same instance.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Memory Model: Primitives vs. Objects',
        props: {
          lesson: LESSON_JS_CORE_0_3,
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],

  mentalModel: [
    'Primitives are values. Objects are addresses.',
    'Stack = primitives. Heap = objects.',
    'Identity is checking if two pointers hit the same Heap address.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
};
