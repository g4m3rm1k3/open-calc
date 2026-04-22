// J5 — Lesson 4-1: Prototypes — The Real Inheritance Model

const LESSON_JS_CORE_4_1 = {
  title: 'Prototypes — The Real Inheritance Model',
  subtitle: 'How property lookup, the prototype chain, and Object.create actually work.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — Every Object Has a Prototype

JavaScript inheritance is not class-based. It is **prototype-based**. Classes (which we cover next lesson) are syntactic sugar over the prototype system — understanding the real mechanism makes the sugar transparent.

Every object in JavaScript has a hidden link to another object called its **prototype**. When you access a property that does not exist on an object, JavaScript automatically walks up the prototype chain until it finds it — or returns \`undefined\`.

\`\`\`js
const animal = {
  breathe() { return "inhale → exhale"; }
};

const dog = Object.create(animal);  // dog's prototype = animal
dog.speak = function() { return "woof"; };

dog.speak();    // "woof"      — found on dog itself
dog.breathe();  // "inhale → exhale" — NOT on dog, found on prototype
dog.missing;    // undefined   — not on dog or animal or Object.prototype
\`\`\`

The lookup chain:
\`\`\`
dog → animal → Object.prototype → null
\`\`\`

\`null\` is the end of every prototype chain. \`Object.prototype\` is where methods like \`.toString()\`, \`.hasOwnProperty()\`, and \`.valueOf()\` come from — they are on every object because every object's chain eventually reaches it.`,
    },

    {
      type: 'js',
      instruction: `### The Prototype Chain: Live Inspection

Run this and use the console to trace the chain. \`Object.getPrototypeOf(obj)\` gives you the next link. Walk up until you hit \`null\`.`,
      html: `<div class="app">
  <div id="chain" class="chain-display"></div>
  <button id="buildBtn">Build Chain</button>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:16px;border-radius:12px;display:flex;flex-direction:column;gap:12px;font-family:monospace;}
.chain-display{flex:1;display:flex;flex-direction:column;gap:8px;overflow-y:auto;}
.node{background:#111827;border-radius:8px;padding:10px;font-size:12px;}
.node .name{color:#38bdf8;font-weight:700;margin-bottom:4px;}
.node .props{color:#4ade80;}
.node .proto{color:#64748b;font-size:11px;}
.arrow{color:#334155;text-align:center;font-size:16px;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:10px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:12px;}`,
      startCode: `const animal = {
  type: "Animal",
  breathe() { return "inhale → exhale"; },
};

const dog = Object.create(animal);
dog.type  = "Dog";
dog.breed = "Labrador";
dog.speak = function() { return "woof"; };

const buddy = Object.create(dog);
buddy.name = "Buddy";

// Verify prototype chain
console.log("buddy.name:    ", buddy.name);       // own property
console.log("buddy.breed:   ", buddy.breed);      // from dog (prototype)
console.log("buddy.breathe:", buddy.breathe());   // from animal (prototype of prototype)
console.log("buddy.toString:", typeof buddy.toString); // from Object.prototype

// Walk the chain
let current = buddy;
let depth = 0;
while (current !== null) {
  console.log("Level", depth + ":", Object.keys(current).join(", ") || "(no own keys)");
  current = Object.getPrototypeOf(current);
  depth++;
}

// Build visual
const container = document.getElementById('chain');
[
  { label: "buddy", obj: buddy, color: "#38bdf8" },
  { label: "dog (buddy's prototype)", obj: Object.getPrototypeOf(buddy), color: "#a78bfa" },
  { label: "animal (dog's prototype)", obj: Object.getPrototypeOf(Object.getPrototypeOf(buddy)), color: "#34d399" },
].forEach((item, i) => {
  if (i > 0) {
    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    arrow.textContent = '↑ [[Prototype]]';
    container.appendChild(arrow);
  }
  const node = document.createElement('div');
  node.className = 'node';
  node.innerHTML =
    '<div class="name" style="color:' + item.color + '">' + item.label + '</div>' +
    '<div class="props">Own keys: ' + Object.keys(item.obj).join(', ') + '</div>';
  container.appendChild(node);
});`,
      outputHeight: 320,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Constructor Functions and .prototype

Before \`class\` syntax existed, JavaScript used **constructor functions** to create objects with shared methods. Understanding this is essential for reading older codebases and understanding what \`class\` compiles to.

\`\`\`js
function Animal(name) {
  this.name = name;    // set on each instance
}

// Methods go on the prototype — shared across all instances
Animal.prototype.speak = function() {
  return this.name + " makes a sound";
};

const cat = new Animal("Cat");
const dog = new Animal("Dog");

cat.speak();   // "Cat makes a sound"
dog.speak();   // "Dog makes a sound"

// They share the same function object — not one copy per instance
cat.speak === dog.speak   // true
\`\`\`

**What \`new\` does** (four steps):
1. Creates a new empty object: \`{}\`
2. Sets the object's \`[[Prototype]]\` to \`Animal.prototype\`
3. Calls \`Animal\` with \`this\` bound to the new object
4. Returns the new object (unless the constructor explicitly returns another object)

**Why methods go on \`.prototype\`**: if you put \`speak\` directly in the constructor as \`this.speak = function() {}\`, every instance gets its own copy of the function in memory. With \`.prototype\`, all instances share one copy. For 10,000 objects, that is a significant difference.`,
    },

    {
      type: 'js',
      instruction: `### Constructor Functions: Shared vs Own

Run this to see the memory difference. Both approaches work, but only the prototype version shares the method.`,
      html: `<div class="app">
  <div class="section">
    <div class="label">Methods on instance (bad for memory)</div>
    <div id="r1" class="row">?</div>
    <div id="r2" class="row">?</div>
  </div>
  <div class="section">
    <div class="label">Methods on prototype (correct)</div>
    <div id="r3" class="row">?</div>
    <div id="r4" class="row">?</div>
  </div>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:16px;border-radius:12px;display:flex;flex-direction:column;gap:14px;font-family:monospace;}
.section{display:flex;flex-direction:column;gap:6px;}
.label{color:#475569;font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
.row{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;}`,
      startCode: `// ── Method ON the instance — each object gets its own copy ─────────────
function AnimalBad(name) {
  this.name = name;
  this.speak = function() { return this.name + " speaks"; };  // copy per instance
}
const cat1 = new AnimalBad("Cat");
const dog1 = new AnimalBad("Dog");

// ── Method ON the prototype — shared across all instances ────────────
function AnimalGood(name) {
  this.name = name;
}
AnimalGood.prototype.speak = function() { return this.name + " speaks"; };

const cat2 = new AnimalGood("Cat");
const dog2 = new AnimalGood("Dog");

document.getElementById('r1').textContent =
  "cat1.speak === dog1.speak: " + (cat1.speak === dog1.speak) + " — different function objects in memory";
document.getElementById('r2').textContent =
  "calls work: " + cat1.speak() + " / " + dog1.speak();

document.getElementById('r3').textContent =
  "cat2.speak === dog2.speak: " + (cat2.speak === dog2.speak) + " — same function object shared";
document.getElementById('r4').textContent =
  "calls work: " + cat2.speak() + " / " + dog2.speak();

// Check the prototype chain
console.log("cat2 proto is AnimalGood.prototype:", Object.getPrototypeOf(cat2) === AnimalGood.prototype);`,
      outputHeight: 250,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — Prototype Chain Inheritance

To set up inheritance between constructor functions, you set the child's prototype to an instance of the parent, then fix the \`constructor\` pointer:

\`\`\`js
function Animal(name) { this.name = name; }
Animal.prototype.breathe = function() { return "breathing"; };

function Dog(name, breed) {
  Animal.call(this, name);    // call parent constructor — sets this.name
  this.breed = breed;
}

// Wire up the prototype chain
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;    // fix broken constructor pointer

Dog.prototype.speak = function() { return "woof"; };

const d = new Dog("Rex", "Husky");
d.breathe();  // inherited from Animal.prototype
d.speak();    // own method on Dog.prototype
\`\`\`

This is what \`class ... extends\` compiles to. When you see \`class Dog extends Animal\`, the engine is doing exactly this under the hood.

**\`instanceof\` check:**
\`\`\`js
d instanceof Dog    // true — Dog.prototype is in d's chain
d instanceof Animal // true — Animal.prototype is in d's chain
\`\`\`

**hasOwnProperty:**
\`\`\`js
d.hasOwnProperty('name')   // true — set in constructor
d.hasOwnProperty('speak')  // false — on prototype, not own
\`\`\``,
    },

    {
      type: 'js',
      instruction: `### Prototype Inheritance: Full Chain

Run this and verify that instanceof correctly walks the prototype chain. Try calling \`d.breathe()\` — it travels two levels up to find it.`,
      startCode: `function Animal(name) {
  this.name = name;
}
Animal.prototype.breathe = function() {
  return this.name + " breathes";
};

function Dog(name, breed) {
  Animal.call(this, name);   // call parent constructor
  this.breed = breed;
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function() {
  return this.name + " says woof";
};

const rex = new Dog("Rex", "Husky");

console.log("--- Own properties ---");
console.log("name:", rex.name);
console.log("breed:", rex.breed);
console.log("hasOwnProperty speak:", rex.hasOwnProperty('speak'));   // false
console.log("hasOwnProperty name:", rex.hasOwnProperty('name'));     // true

console.log("--- Inherited ---");
console.log("speak():", rex.speak());
console.log("breathe():", rex.breathe());

console.log("--- instanceof ---");
console.log("rex instanceof Dog:", rex instanceof Dog);
console.log("rex instanceof Animal:", rex instanceof Animal);
console.log("rex instanceof Object:", rex instanceof Object);   // everything is

console.log("--- Chain ---");
let p = rex;
while (p) {
  console.log(p.constructor?.name ?? "Object.prototype", "— own keys:", Object.keys(p).join(", ") || "none");
  p = Object.getPrototypeOf(p);
}`,
      showDom: false,
      outputHeight: 300,
    },

    {
      type: 'markdown',
      instruction: `## Part 4 — Object.create and Composition

\`Object.create(proto)\` creates a new object with \`proto\` as its prototype. This is the most direct way to set up prototype chains without constructor functions:

\`\`\`js
const canFly = {
  fly() { return this.name + " is flying"; },
};

const canSwim = {
  swim() { return this.name + " is swimming"; },
};

// Mix behaviors via prototype
const duck = Object.assign(Object.create(canFly), canSwim, { name: "Donald" });
duck.fly();   // "Donald is flying"
duck.swim();  // "Donald is swimming"
\`\`\`

**Composition over inheritance** is a design principle: rather than building deep inheritance trees, compose objects by mixing in behaviors. This avoids the "fragile base class" problem common in deep class hierarchies in languages like Java or C++.

JavaScript is uniquely suited to this pattern because prototypes are just objects — you can arrange them however you want.`,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 1: Build a Prototype Chain

Create a \`Vehicle\` constructor with a \`start()\` method on its prototype that returns \`"starting engine"\`.

Create a \`Car\` constructor that inherits from \`Vehicle\`. Give \`Car\` a \`drive()\` method that returns \`"driving at X mph"\` where X is a \`speed\` property set in the Car constructor.

Both should work with \`instanceof\`.

\`\`\`
const car = new Car(60);
car.start()   → "starting engine"
car.drive()   → "driving at 60 mph"
car instanceof Vehicle  → true
\`\`\``,
      startCode: `function Vehicle() {}
// add start() to Vehicle.prototype

function Car(speed) {
  // call Vehicle constructor
  // set this.speed
}
// set up prototype chain
// add drive() to Car.prototype

const car = new Car(60);
console.log(car.start());            // "starting engine"
console.log(car.drive());            // "driving at 60 mph"
console.log(car instanceof Vehicle); // true
console.log(car instanceof Car);     // true`,
      solutionCode: `function Vehicle() {}
Vehicle.prototype.start = function() { return "starting engine"; };

function Car(speed) {
  Vehicle.call(this);
  this.speed = speed;
}
Car.prototype = Object.create(Vehicle.prototype);
Car.prototype.constructor = Car;
Car.prototype.drive = function() { return "driving at " + this.speed + " mph"; };

const car = new Car(60);
console.log(car.start());
console.log(car.drive());
console.log(car instanceof Vehicle);
console.log(car instanceof Car);`,
      check: (code, logs) =>
        logs[0] === 'starting engine' &&
        logs[1] === 'driving at 60 mph' &&
        logs[2] === 'true' &&
        logs[3] === 'true',
      successMessage: 'Correct! This is exactly what `class Car extends Vehicle` compiles to.',
      failMessage: 'Use Object.create(Vehicle.prototype) to set Car.prototype, call Vehicle.call(this) in the Car constructor.',
    },

    {
      type: 'challenge',
      instruction: `### Challenge 2: hasOwnProperty vs Prototype

Given the object below, log:
1. Whether \`name\` is an **own** property of \`fido\`
2. Whether \`bark\` is an **own** property of \`fido\`
3. Whether \`fido\` can call \`bark()\` (it should be able to via prototype)

Expected:
\`\`\`
name is own: true
bark is own: false
bark call: Fido says woof
\`\`\``,
      startCode: `const dogProto = {
  bark() { return this.name + " says woof"; },
};

const fido = Object.create(dogProto);
fido.name = "Fido";

console.log("name is own:", /* your code */);
console.log("bark is own:", /* your code */);
console.log("bark call:",   /* call bark on fido */);`,
      solutionCode: `const dogProto = {
  bark() { return this.name + " says woof"; },
};
const fido = Object.create(dogProto);
fido.name = "Fido";
console.log("name is own:", fido.hasOwnProperty('name'));
console.log("bark is own:", fido.hasOwnProperty('bark'));
console.log("bark call:",   fido.bark());`,
      check: (code, logs) =>
        logs[0] === 'name is own: true' &&
        logs[1] === 'bark is own: false' &&
        logs[2] === 'bark call: Fido says woof',
      successMessage: 'Correct! hasOwnProperty distinguishes own properties from inherited ones — important for iteration and serialization.',
      failMessage: 'Use fido.hasOwnProperty("name") and fido.hasOwnProperty("bark") for the first two.',
    },

  ],
};

export default {
  id: 'js-core-4-1-prototypes',
  slug: 'prototypes-the-real-inheritance-model',
  chapter: 'js4.1',
  order: 0,
  title: 'Prototypes — The Real Inheritance Model',
  subtitle: 'Property lookup, the prototype chain, constructor functions, and Object.create.',
  tags: ['javascript', 'prototypes', 'inheritance', 'object-create', 'constructor-functions'],

  hook: {
    question: 'When you call `[].map()`, where does `map` actually come from?',
    realWorldContext: '`map` is not on your array — it is on `Array.prototype`. The prototype chain is how JavaScript implements inheritance, method sharing, and the entire standard library. Understanding it means you understand how the language actually works.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'Every object has a hidden [[Prototype]] link. Property lookup walks this chain until found or null is hit.',
      'Constructor functions use `.prototype` to share methods across instances — one copy in memory, not one per object.',
      '`class` syntax is sugar — it compiles to prototype manipulation under the hood.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'hasOwnProperty vs in',
        body: '`"key" in obj` searches the whole prototype chain. `obj.hasOwnProperty("key")` only checks own properties. Use hasOwnProperty when iterating to avoid inherited keys.',
      },
      {
        type: 'tip',
        title: 'Object.create(null)',
        body: 'Creates an object with NO prototype — not even Object.prototype. Useful for pure hash maps with no inherited properties like toString or hasOwnProperty.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Prototypes — Chain, Constructor Functions, Inheritance',
        props: { lesson: LESSON_JS_CORE_4_1 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Property lookup: own → [[Prototype]] → [[Prototype]]... → Object.prototype → null.',
    'Methods on .prototype: shared (one copy). Methods on this inside constructor: one per instance.',
    '`new` creates object, sets [[Prototype]] to Constructor.prototype, calls constructor with this.',
    'instanceof walks the prototype chain — true if Constructor.prototype is anywhere in the chain.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
