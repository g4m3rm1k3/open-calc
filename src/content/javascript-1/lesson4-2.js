// J5 — Lesson 4-2: Classes — Sugar Over Prototypes

const LESSON_JS_CORE_4_2 = {
  title: 'Classes — Sugar Over Prototypes',
  subtitle: 'class, extends, super, static, private fields, and what the engine actually does.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — Class Syntax

ES6 \`class\` syntax does not introduce a new object model. It is **syntactic sugar** over prototype-based inheritance — cleaner to write, identical at runtime.

\`\`\`js
class Animal {
  constructor(name) {
    this.name = name;        // own property — set on each instance
  }

  speak() {                  // goes on Animal.prototype
    return this.name + " makes a sound";
  }

  static count = 0;          // on Animal itself, not on instances

  toString() {               // override Object.prototype.toString
    return "[Animal: " + this.name + "]";
  }
}

const cat = new Animal("Cat");
cat.speak();       // "Cat makes a sound"
Animal.count;      // 0 — static, not on cat
\`\`\`

What the engine does behind the scenes:
\`\`\`js
// The class above compiles to roughly:
function Animal(name) { this.name = name; }
Animal.prototype.speak    = function() { return this.name + " makes a sound"; };
Animal.prototype.toString = function() { return "[Animal: " + this.name + "]"; };
Animal.count = 0;
\`\`\`

The difference is syntax clarity — especially with inheritance.`,
    },

    {
      type: 'js',
      instruction: `### Class Basics: Constructor, Methods, Static

Run this and verify that methods land on the prototype (shared) and static properties land on the class itself (not on instances).`,
      startCode: `class Counter {
  static instanceCount = 0;   // shared across all instances — lives on Counter

  constructor(start = 0) {
    this.value = start;
    Counter.instanceCount++;   // track how many we've created
  }

  increment(by = 1) {
    this.value += by;
    return this;               // return this for chaining
  }

  reset() {
    this.value = 0;
    return this;
  }

  toString() {
    return "Counter(" + this.value + ")";
  }
}

const a = new Counter(10);
const b = new Counter(100);

// Method chaining — works because each method returns this
a.increment().increment().increment(5);

console.log("a:", a.toString());           // Counter(17)
console.log("b:", b.toString());           // Counter(100)
console.log("instances created:", Counter.instanceCount);  // 2

// Methods are on the prototype, not on each instance
console.log("a.increment === b.increment:", a.increment === b.increment);  // true — shared`,
      showDom: false,
      outputHeight: 160,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Inheritance: extends and super

\`extends\` sets up the prototype chain automatically. \`super\` calls the parent class's constructor or methods.

\`\`\`js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() { return this.name + " makes a sound"; }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);          // MUST call super() before accessing this
    this.breed = breed;
  }

  speak() {               // override parent method
    return this.name + " barks";
  }

  describe() {
    return super.speak() + " (and is a " + this.breed + ")";   // call parent method
  }
}

const d = new Dog("Rex", "Husky");
d.speak();    // "Rex barks"       — uses Dog's override
d.describe(); // "Rex makes a sound (and is a Husky)" — calls Animal.speak via super
\`\`\`

**super() must come first**: if a child class has a constructor, it must call \`super()\` before accessing \`this\`. If you omit the constructor, it is added automatically.

**Method resolution order**: when you call a method, JavaScript starts at the instance's own prototype and walks up. The first match wins — this is how overriding works.`,
    },

    {
      type: 'js',
      instruction: `### extends + super: Shape Hierarchy

A classic OOP example. Every subclass calls \`super\` to set up common properties, then adds its own. \`toString\` is overridden at each level.`,
      html: `<div class="app">
  <div id="output" class="output"></div>
  <button id="runBtn">Run</button>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:16px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.output{flex:1;background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#93c5fd;font-size:12px;white-space:pre;overflow:auto;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;font-family:monospace;}`,
      startCode: `class Shape {
  constructor(color = 'black') {
    this.color = color;
  }
  area()      { return 0; }
  toString()  { return "Shape(color=" + this.color + " area=" + this.area().toFixed(2) + ")"; }
}

class Circle extends Shape {
  constructor(radius, color) {
    super(color);
    this.radius = radius;
  }
  area()      { return Math.PI * this.radius ** 2; }
  toString()  { return "Circle(r=" + this.radius + " " + super.toString() + ")"; }
}

class Rectangle extends Shape {
  constructor(w, h, color) {
    super(color);
    this.width = w;
    this.height = h;
  }
  area()     { return this.width * this.height; }
  toString() { return "Rectangle(" + this.width + "×" + this.height + " " + super.toString() + ")"; }
}

class Square extends Rectangle {
  constructor(side, color) {
    super(side, side, color);  // Square is a Rectangle with equal sides
  }
}

const shapes = [
  new Circle(5, 'red'),
  new Rectangle(4, 6, 'blue'),
  new Square(3, 'green'),
];

const output = shapes.map(s => [
  s.toString(),
  "instanceof Shape: " + (s instanceof Shape),
  "instanceof Rectangle: " + (s instanceof Rectangle),
].join("\n")).join("\n\n");

document.getElementById('output').textContent = output;
document.getElementById('runBtn').onclick = () => {
  shapes.forEach(s => console.log(s.toString(), "| area:", s.area().toFixed(2)));
};`,
      outputHeight: 320,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — Private Fields and Methods

ES2022 added **private class fields** with the \`#\` prefix. Private fields are enforced at the language level — they cannot be accessed outside the class body, even via \`obj["#field"]\`.

\`\`\`js
class BankAccount {
  #balance = 0;           // private — inaccessible outside the class
  #transactionLog = [];

  constructor(initial) {
    this.#balance = initial;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error("Amount must be positive");
    this.#balance += amount;
    this.#transactionLog.push({ type: 'deposit', amount });
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error("Insufficient funds");
    this.#balance -= amount;
    this.#transactionLog.push({ type: 'withdraw', amount });
  }

  get balance() { return this.#balance; }   // read-only public accessor
}

const account = new BankAccount(100);
account.deposit(50);
account.balance;           // 150 — via getter
account.#balance;          // SyntaxError — truly private
\`\`\`

**Private vs closure-based privacy**: closure-based privacy (from lesson 2-2) is still valid. Private fields are enforced by syntax, making intent clearer and allowing class hierarchies where subclasses also cannot access parent private fields.`,
    },

    {
      type: 'js',
      instruction: `### Private Fields: BankAccount

Click Deposit and Withdraw. The \`#balance\` is genuinely private — the attempt to access it directly is caught and shown. The \`get balance\` accessor provides controlled read access.`,
      html: `<div class="app">
  <div id="balance-display" class="balance">Balance: $0</div>
  <div class="controls">
    <input id="amount" type="number" value="50" min="1" />
    <button id="depositBtn">Deposit</button>
    <button id="withdrawBtn">Withdraw</button>
    <button id="peekBtn">Peek #balance</button>
  </div>
  <div id="log" class="log"></div>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:16px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.balance{font-size:24px;font-weight:800;color:#38bdf8;text-align:center;padding:12px;background:#0f2233;border-radius:8px;}
.controls{display:flex;gap:8px;align-items:center;}
input{background:#111827;border:1px solid #334155;border-radius:8px;padding:8px;color:#e2e8f0;font-family:monospace;font-size:13px;width:70px;}
button{flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:9px;border-radius:8px;cursor:pointer;font-size:12px;font-family:monospace;}
.log{flex:1;background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;font-size:11px;overflow-y:auto;display:flex;flex-direction:column;gap:3px;}
.entry{color:#93c5fd;}.err{color:#f87171;}`,
      startCode: `class BankAccount {
  #balance = 0;
  #log = [];

  constructor(initial) {
    this.#balance = initial;
    this.#log.push("Account opened with $" + initial);
  }

  deposit(amount) {
    if (amount <= 0) throw new Error("Amount must be positive");
    this.#balance += amount;
    this.#log.push("Deposited $" + amount);
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error("Insufficient funds");
    this.#balance -= amount;
    this.#log.push("Withdrew $" + amount);
  }

  get balance()      { return this.#balance; }
  get transactions() { return [...this.#log]; }
}

const account = new BankAccount(200);

function addLog(msg, isErr = false) {
  const el = document.createElement('div');
  el.className = 'entry' + (isErr ? ' err' : '');
  el.textContent = msg;
  document.getElementById('log').appendChild(el);
}

function refresh() {
  document.getElementById('balance-display').textContent = "Balance: $" + account.balance;
}

refresh();
addLog("Account opened: $200");

document.getElementById('depositBtn').onclick = () => {
  try {
    const amt = Number(document.getElementById('amount').value);
    account.deposit(amt);
    refresh();
    addLog("Deposited $" + amt);
  } catch(e) { addLog("✗ " + e.message, true); }
};

document.getElementById('withdrawBtn').onclick = () => {
  try {
    const amt = Number(document.getElementById('amount').value);
    account.withdraw(amt);
    refresh();
    addLog("Withdrew $" + amt);
  } catch(e) { addLog("✗ " + e.message, true); }
};

document.getElementById('peekBtn').onclick = () => {
  try {
    // This will throw a SyntaxError if you try account.#balance in real code
    // We can only access it via the getter
    addLog("balance (via getter): $" + account.balance);
    addLog("account['#balance']: " + account['#balance'] + " — undefined, truly private");
  } catch(e) { addLog("✗ " + e.message, true); }
};`,
      outputHeight: 350,
    },

    {
      type: 'markdown',
      instruction: `## Part 4 — Getters, Setters, and Static Methods

**Getters and setters** allow computed or validated properties that look like plain property access:

\`\`\`js
class Temperature {
  #celsius;

  constructor(c) { this.#celsius = c; }

  get fahrenheit() { return this.#celsius * 9/5 + 32; }
  set fahrenheit(f) { this.#celsius = (f - 32) * 5/9; }

  get celsius() { return this.#celsius; }
  set celsius(c) {
    if (c < -273.15) throw new Error("Below absolute zero");
    this.#celsius = c;
  }
}

const t = new Temperature(100);
t.fahrenheit;       // 212 — computed
t.fahrenheit = 32;  // sets celsius to 0
t.celsius;          // 0
\`\`\`

**Static methods** belong to the class, not instances. Common uses: factory methods, utility functions, and keeping related code organized:

\`\`\`js
class Color {
  constructor(r, g, b) { this.r = r; this.g = g; this.b = b; }

  static fromHex(hex) {             // factory — creates a Color from a hex string
    const n = parseInt(hex.slice(1), 16);
    return new Color((n >> 16) & 255, (n >> 8) & 255, n & 255);
  }

  toHex() { return "#" + [this.r, this.g, this.b].map(v => v.toString(16).padStart(2,'0')).join(''); }
}

const red = Color.fromHex('#ff0000');
red.toHex();   // "#ff0000"
\`\`\``,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 1: Build a Stack Class

Write a \`Stack\` class with:
- Private \`#items\` array
- \`push(val)\` — add to top
- \`pop()\` — remove and return top, throw \`"Stack is empty"\` if empty
- \`peek\` getter — return top without removing, or \`undefined\` if empty
- \`size\` getter — number of items
- \`isEmpty\` getter — boolean

\`\`\`
const s = new Stack();
s.push(1); s.push(2); s.push(3);
s.peek    → 3
s.size    → 3
s.pop()   → 3
s.size    → 2
\`\`\``,
      startCode: `class Stack {
  // your implementation
}

const s = new Stack();
s.push(1); s.push(2); s.push(3);
console.log("peek:", s.peek);       // 3
console.log("size:", s.size);       // 3
console.log("pop:", s.pop());       // 3
console.log("size:", s.size);       // 2
console.log("isEmpty:", s.isEmpty); // false
s.pop(); s.pop();
console.log("isEmpty:", s.isEmpty); // true
try { s.pop(); } catch(e) { console.log("caught:", e.message); }`,
      solutionCode: `class Stack {
  #items = [];
  push(val)      { this.#items.push(val); }
  pop()          { if (this.isEmpty) throw new Error("Stack is empty"); return this.#items.pop(); }
  get peek()     { return this.#items[this.#items.length - 1]; }
  get size()     { return this.#items.length; }
  get isEmpty()  { return this.#items.length === 0; }
}
const s = new Stack();
s.push(1); s.push(2); s.push(3);
console.log("peek:", s.peek);
console.log("size:", s.size);
console.log("pop:", s.pop());
console.log("size:", s.size);
console.log("isEmpty:", s.isEmpty);
s.pop(); s.pop();
console.log("isEmpty:", s.isEmpty);
try { s.pop(); } catch(e) { console.log("caught:", e.message); }`,
      check: (code, logs) =>
        logs[0] === 'peek: 3' &&
        logs[1] === 'size: 3' &&
        logs[2] === 'pop: 3' &&
        logs[3] === 'size: 2' &&
        logs[4] === 'isEmpty: false' &&
        logs[5] === 'isEmpty: true' &&
        logs[6] === 'caught: Stack is empty',
      successMessage: 'Correct! A Stack with private state, getters, and error throwing — a real data structure in a clean class.',
      failMessage: 'Use #items = [] as a private field. Add getters for peek/size/isEmpty. Throw in pop() when empty.',
    },

    {
      type: 'challenge',
      instruction: `### Challenge 2: extend and super

Create a \`Logger\` base class with a \`log(msg)\` method that prepends \`"[LOG]"\` and logs to console.

Create a \`TimestampLogger\` that extends \`Logger\`. Its \`log(msg)\` should call the parent's \`log\` with the message prefixed by the current time (use \`new Date().toLocaleTimeString()\`).

\`\`\`
const tl = new TimestampLogger();
tl.log("server started");  // [LOG] 12:34:56 server started (or similar)
\`\`\``,
      startCode: `class Logger {
  // log(msg) — prefix with [LOG]
}

class TimestampLogger extends Logger {
  // override log(msg) — prepend timestamp, then call super.log
}

const tl = new TimestampLogger();
tl.log("server started");   // should print [LOG] HH:MM:SS server started`,
      solutionCode: `class Logger {
  log(msg) { console.log("[LOG]", msg); }
}
class TimestampLogger extends Logger {
  log(msg) { super.log(new Date().toLocaleTimeString() + " " + msg); }
}
const tl = new TimestampLogger();
tl.log("server started");`,
      check: (code, logs) =>
        /extends\s+Logger/.test(code) &&
        /super\.log/.test(code) &&
        logs[0]?.startsWith('[LOG]'),
      successMessage: 'Correct! super.log() delegates to the parent while adding the timestamp — classic decorator pattern via inheritance.',
      failMessage: 'extends Logger, then in the override call super.log(timestamp + " " + msg).',
    },

  ],
};

export default {
  id: 'js-core-4-2-classes',
  slug: 'classes-sugar-over-prototypes',
  chapter: 'js4.1',
  order: 1,
  title: 'Classes — Sugar Over Prototypes',
  subtitle: 'class, extends, super, private fields, getters, setters, and static.',
  tags: ['javascript', 'classes', 'extends', 'super', 'private-fields', 'inheritance'],

  hook: {
    question: 'Is JavaScript\'s class syntax real classes, or pretend?',
    realWorldContext: 'Classes are the organizing principle of most large JavaScript codebases, every framework, and most libraries. Knowing what they compile to means you are never surprised by their behavior.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'class is syntax sugar — methods go on the prototype, constructors set own properties.',
      'super() must be called before `this` in a subclass constructor.',
      '#field is genuinely private — not accessible outside the class body, even with bracket notation.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Forgetting super() in a Subclass',
        body: 'If you write a constructor in a class that extends another, you MUST call super() before accessing this. Omitting super() throws a ReferenceError.',
      },
      {
        type: 'tip',
        title: 'Static Factory Methods',
        body: 'Instead of multiple constructors (which JS does not support), use static factory methods: `Color.fromHex("#fff")`, `User.fromJSON(data)`. This is the standard JavaScript pattern.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Classes — extends, super, private fields, getters',
        props: { lesson: LESSON_JS_CORE_4_2 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'class compiles to: constructor function + methods on .prototype. No new runtime model.',
    'extends sets the prototype chain. super() calls the parent constructor.',
    '#field = private. Only accessible inside the class body. Not on the prototype.',
    'static = on the class itself, not on instances.',
    'get/set create computed properties that look like plain access but run code.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
