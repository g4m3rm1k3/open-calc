// Phase 0 — Lesson 0.3: Values, Types, and Identity
// Focus: Primitive vs Reference, Memory Model (Stack/Heap), Identity vs Equality

const LESSON_JS_CORE_0_3 = {
  title: 'Values, Types, and Identity',
  subtitle: 'The First Principles of JavaScript Memory',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### The Great Divide: Primitives vs. Objects\n\nEvery value in JavaScript falls into one of two categories. How the computer stores them in memory is completely different:\n\n1. **Primitives**: (Strings, Numbers, Booleans, null, undefined, Symbol, BigInt)\n2. **Objects**: (Objects, Arrays, Functions)\n\n> **The Key Difference**:\n> - **Primitives are values**. When you move a primitive, you move the actual data.\n> - **Objects are addresses**. When you move an object, you are moving a **pointer** to a location in memory.`,
    },
    {
      type: 'js',
      instruction: `### Primitives are Immutable\n\n**Primitives are immutable.** You cannot "change" the number 5 into the number 6; you can only choose a different number.\n\nRun this code. Notice that even though we call \`.toUpperCase()\` on the string, the original string remains exactly the same. We can only create *new* strings; we cannot edit existing ones.`,
      html: `<div class="pView">
  <div class="val" id="orig">Original: ?</div>
  <div class="val" id="res">Result: ?</div>
</div>`,
      css: `.pView{height:100%;background:#0a1120;padding:14px;border-radius:10px;display:grid;gap:10px;}
.val{padding:12px;border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;font-size:12px;}`,
      startCode: `let name = "alice";
let result = name.toUpperCase(); // Returns "ALICE" 

document.getElementById('orig').textContent = 'Original: "' + name + '"';
document.getElementById('res').textContent = 'Result of method: "' + result + '"';
console.log("Original name remains unchanged:", name);`,
      outputHeight: 180,
    },
    {
      type: 'js',
      instruction: `### Objects are Mutable\n\nUnlike primitives, you can reach inside an object and change its properties without creating a new one.\n\nWatch how the same object in memory is being modified directly. We didn't swap the object; we just changed the **data** sitting at that memory address.`,
      html: `<div class="oView">
  <div class="row" id="u1">User: ?</div>
  <div class="row" id="u2">User (after change): ?</div>
</div>`,
      css: `.oView{height:100%;background:#0a1120;padding:14px;border-radius:10px;display:grid;gap:10px;}
.row{padding:12px;border:1px solid #334155;border-radius:8px;background:#111c30;color:#93c5fd;font-family:monospace;font-size:12px;}`,
      startCode: `const user = { name: "Alice" };
document.getElementById('u1').textContent = 'Step 1: ' + JSON.stringify(user);

user.name = "Bob"; // Mutation!
document.getElementById('u2').textContent = 'Step 2: ' + JSON.stringify(user);

console.log("Object mutated in-place:", user);`,
      outputHeight: 180,
    },
    {
      type: 'markdown',
      instruction: `### Stack vs. Heap\n\nTo understand why they behave differently, we must look at where the engine puts them:\n\n- **The Stack**: Fast, fixed-size memory. Primitives live here. They are stored directly.\n- **The Heap**: Large, flexible memory. Objects live here because they can grow to any size.\n\nWhen you create an object, the **Stack** only holds a small **Reference** (an address like \`0x001\`) that points to the actual data in the **Heap**.`,
    },
    {
      type: 'js',
      instruction: `### Copying Primitives (By Value)\n\nWhen you copy a primitive, you are making a **real copy** of the data. Changing one does not affect the other because they live in two different spots on the Stack.`,
      html: `<div class="stackSim">
  <div class="slot" id="a">a: 10</div>
  <div class="slot" id="b">b: 10</div>
</div>`,
      css: `.stackSim{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:flex;gap:10px;justify-content:center;align-items:center;}
.slot{width:80px;height:80px;border:2px solid #334155;border-radius:12px;display:grid;place-items:center;background:#111827;color:#cbd5e1;font-weight:800;transition:all 0.3s ease;}`,
      startCode: `let a = 10;
let b = a; 
b = 20;

setTimeout(() => {
  const elB = document.getElementById('b');
  elB.textContent = 'b: 20';
  elB.style.borderColor = '#38bdf8';
  elB.style.background = '#0c2035';
  console.log("a is still 10, b is now 20. Copy successful.");
}, 800);`,
      outputHeight: 180,
    },
    {
      type: 'js',
      instruction: `### Copying Objects (By Reference)\n\nWhen you "copy" an object, you are only copying the **Address**. Both variables now point to the exact same spot in the Heap.\n\nThis is why changing \`userB\` also changes \`userA\`. They are two names for the same thing.`,
      html: `<div class="refSim">
  <div class="vars">
    <div class="v" id="va">userA -> #101</div>
    <div class="v" id="vb">userB -> #101</div>
  </div>
  <div class="heap" id="h101">#101: { name: "Alice" }</div>
</div>`,
      css: `.refSim{height:100%;display:grid;grid-template-columns:1fr 1fr;gap:20px;background:#0a1220;padding:20px;border-radius:10px;align-items:center;}
.v{padding:10px;border:1px solid #334155;border-radius:8px;background:#111827;color:#94a3b8;font-size:11px;margin-bottom:8px;font-family:monospace;}
.heap{padding:20px;border:2px solid #10b981;border-radius:12px;background:#06201b;color:#10b981;font-family:monospace;font-size:12px;text-align:center;}`,
      startCode: `setTimeout(() => {
  const h = document.getElementById('h101');
  h.textContent = '#101: { name: "Bob" }';
  h.style.background = '#0c2d22';
  console.log("Both variables point to #101. Mutation affects both.");
}, 1000);`,
      outputHeight: 200,
    },
    {
      type: 'markdown',
      instruction: `### Identity vs. Structural Equality\n\nThis is the #1 source of bugs for new developers.\n\n- **Primitives** are compared by **Value**. If the contents match, they are equal.\n- **Objects** are compared by **Identity** (Address). Two objects are only equal if they are the *exact same instance* in memory.`,
    },
    {
      type: 'js',
      instruction: `### The Object Comparison Trap\n\nEven if two objects look identical, they are **not equal** if they live at different addresses. Every time you use \`{}\`, you are carving out a **new** spot in the Heap.\n\nRun the cell to see common equality results.`,
      html: `<div class="eqView" id="ev"></div>`,
      css: `.eqView{height:100%;background:#0a1220;padding:14px;border-radius:10px;color:#cbd5e1;font-family:monospace;font-size:11px;line-height:1.7;}`,
      startCode: `const obj1 = { id: 1 };
const obj2 = { id: 1 };
const lines = [
  'Strings: "hi" === "hi" -> ' + ("hi" === "hi"),
  'Numbers: 5 === 5 -> ' + (5 === 5),
  'Identical Objects: obj1 === obj2 -> ' + (obj1 === obj2),
  'Same Reference: obj1 === obj1 -> ' + (obj1 === obj1)
];
document.getElementById('ev').innerHTML = lines.join('<br>');
console.log("Object equality checks identity, not content.");`,
      outputHeight: 200,
    },


    {
      type: 'challenge',
      instruction: `### Challenge: The Clone vs. Reference Trap\n\nI've given you a \`hero\` object. Create a variable \`sidekick\` that starts with the same data, but fix the sidekick's name to "Robin" **without** changing the hero's name.\n\n> **Hint**: If you just do \`sidekick = hero\`, they will share the same memory address. You need to create a **new** object.`,
      html: `<div class="cBox" id="status">Waiting for your code...</div>`,
      css: `.cBox{height:100%; border:1px solid #334155; border-radius:12px; background:#0a1220; display:grid; place-items:center; color:#94a3b8; font-weight:800;}`,
      startCode: `const hero = { name: "Batman" };

// 1. Create sidekick as a SEPARATE object 
// 2. Change sidekick's name to "Robin"
const sidekick = ???;

console.log("Hero:", hero.name);
console.log("Sidekick:", sidekick.name);`,
      solutionCode: `const hero = { name: "Batman" };
const sidekick = { name: "Batman" };
sidekick.name = "Robin";
document.getElementById('status').textContent = 'Hero is still Batman. Success!';
document.getElementById('status').style.color = '#10b981';`,
      check: (js, logs) => {
        return logs.some(l => l.msg.includes("Hero: Batman")) && 
               logs.some(l => l.msg.includes("Sidekick: Robin"));
      },
      successMessage: "Great! You created a separate spot in the Heap instead of just copying the address.",
    },
    {
      type: 'markdown',
      instruction: `### Empty Values: null vs. undefined\n\nBoth represent "nothing," but with different semantic meanings:\n\n- **undefined**: A variable has been declared but has no value yet. (JavaScript's default "nothing").\n- **null**: An intentional absence of value. (The programmer's "this is empty on purpose").`,
    },
    {
      type: 'js',
      instruction: `### Visualizing undefined\n\nJavaScript gives you \`undefined\` automatically for things that don't exist yet: declared variables without values, missing properties, or missing arguments.`,
      html: `<div class="uView" id="uv"></div>`,
      css: `.uView{height:100%; background:#0a1220; padding:14px; border-radius:10px; color:#cbd5e1; font-family:monospace; line-height:1.7;}`,
      startCode: `let x;
const obj = { a: 1 };
const lines = [
  'Variable with no value: ' + x,
  'Missing property obj.b: ' + obj.b
];
document.getElementById('uv').innerHTML = lines.join('<br>');
console.log("undefined is the engine's way of saying 'not found'.");`,
      outputHeight: 180,
    },
    {
      type: 'js',
      instruction: `### Visualizing null\n\nYou use \`null\` when you want to explicitly say "this value is gone" or "this has no owner." It is a deliberate signal from you to other developers.`,
      html: `<div class="nView" id="nv">Current User: null</div>`,
      css: `.nView{height:100%; border:1px dashed #334155; border-radius:12px; background:#0a1220; color:#94a3b8; display:grid; place-items:center;}`,
      startCode: `let currentUser = { name: "Alice" };
// User logs out...
currentUser = null; 

document.getElementById('nv').textContent = 'Current User: ' + currentUser;
console.log("null is your way of saying 'intentionally empty'.");`,
      outputHeight: 180,
    },
    {
      type: 'markdown',
      instruction: `### The 'typeof' Operator\n\nYou can ask JavaScript what type a value is. But be careful—there are some famous historical bugs in this tool!`,
    },
    {
      type: 'js',
      instruction: `### Measuring Types\n\nTry these different values. Notice the weird result for \`null\` — **this is a bug in JavaScript from 1995** that can never be fixed because it would break the internet!\n\n> **Historical Note**: In early JS, values were stored in 32-bit units. The type "object" used a tag of \`000\`. Since \`null\` was represented as all zeros, \`typeof null\` returned \`"object"\`.`,
      html: `<div class="tView" id="tv"></div>`,
      css: `.tView{height:100%; background:#0a1220; padding:14px; border-radius:10px; color:#38bdf8; font-family:monospace; font-size:11px; line-height:1.7;}`,
      startCode: `const types = [
  '42 is: ' + typeof 42,
  '"hi" is: ' + typeof "hi",
  'true is: ' + typeof true,
  'null is: ' + typeof null + ' (THE BUG!)',
  'undefined is: ' + typeof undefined
];
document.getElementById('tv').innerHTML = types.join('<br>');
console.log("typeof is helpful but imperfect.");`,
      outputHeight: 180,
    },
    {
      type: 'markdown',
      instruction: `### Does 'const' mean "Locked"?\n\nThis is the most common point of confusion. \`const\` does **not** make a value immutable. It only prevents you from **reassigning** the variable to a different address.\n\n- If \`const\` points to a **Primitive**, it's effectively locked.\n- If \`const\` points to an **Object**, you can still change the contents of that object!`,
    },
    {
      type: 'js',
      instruction: `### Mutability vs Reassignment\n\nWatch how we can modify the array inside the object even though it's a \`const\`. The "binding" is locked, but the "data" in the heap is not. We only get an error when we try to swap the whole object for a new one.`,
      html: `<div class="cBox" id="cStatus">Running Bag Demo...</div>`,
      css: `.cBox{height:100%; border:1px solid #334155; border-radius:12px; background:#0a1220; padding:14px; color:#cbd5e1; font-family:monospace; font-size:11px;}`,
      startCode: `const bag = { items: ["apple"] };
const s = document.getElementById('cStatus');
bag.items.push("orange");

s.innerHTML = 'Bag Items: ' + bag.items.join(', ');

try {
  bag = { items: ["banana"] };
} catch(e) {
  s.innerHTML += '<br><br><span style="color:#ef4444">ERROR: ' + e.message + '</span>';
  console.log("Reassignment failed as expected.");
}`,
      outputHeight: 180,
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
