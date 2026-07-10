import type { Block, BlockCategory, BlockConcept, BlockDefinition, BlockType, FieldSpec } from './types'

export const BLOCK_COLORS: Record<BlockCategory, string> = {
  oop:   '#2563eb',
  state: '#7c3aed',
  flow:  '#0891b2',
  output:'#dc2626',
  html:  '#ea580c',
  types: '#059669',
}

export const BLOCK_GROUPS: { id: BlockCategory; label: string }[] = [
  { id: 'oop',   label: 'OOP'    },
  { id: 'types', label: 'Types'  },
  { id: 'state', label: 'State'  },
  { id: 'flow',  label: 'Flow'   },
  { id: 'output',label: 'Output' },
  { id: 'html',  label: 'HTML'   },
]

// ─── Concept library ──────────────────────────────────────────────────────────

const CONCEPTS: Record<string, BlockConcept> = {
  class: {
    summary: 'A blueprint for creating objects that share the same structure and behaviour.',
    why: 'Classes let you model real-world things (Player, Invoice, Car) as reusable templates. Every instance you create from the class gets its own copy of the data but shares the same methods.',
    connects: ['constructor', 'method', 'field', 'variable'],
    example: 'class Dog {\n  name: string\n  constructor(name: string) { this.name = name }\n  bark() { return `Woof! I\'m ${this.name}` }\n}',
  },
  constructor: {
    summary: 'Runs once when a new instance is created — sets up the object\'s initial state.',
    why: 'Without a constructor you\'d have to manually assign every field after creation. The constructor bundles initialisation into one safe place.',
    connects: ['class', 'field', 'variable'],
    example: 'constructor(name: string, score = 0) {\n  this.name = name\n  this.score = score\n}',
  },
  method: {
    summary: 'A function attached to a class — it defines what the object can DO.',
    why: 'Methods keep behaviour close to the data it operates on. This is the core idea of encapsulation: the object manages its own state through methods, not external code.',
    connects: ['class', 'constructor', 'call', 'return'],
    example: 'greet(): string {\n  return `Hello, I\'m ${this.name}`\n}',
  },
  staticMethod: {
    summary: 'A method called on the class itself, not on an instance.',
    why: 'Static methods are useful for factory functions, utilities, and logic that doesn\'t need access to instance data. e.g. Math.random() is static.',
    connects: ['class', 'method'],
    example: 'static create(name: string) {\n  return new Player(name)\n}',
  },
  getter: {
    summary: 'A computed property — looks like a field but runs code when you read it.',
    why: 'Getters let you expose derived data without storing it. The caller writes `player.label` instead of `player.getLabel()`, keeping the interface clean.',
    connects: ['class', 'field', 'method'],
    example: 'get label(): string {\n  return `${this.name} (lv.${this.level})`\n}',
  },
  setter: {
    summary: 'Intercepts assignment — runs validation or transformation when a property is set.',
    why: 'Without a setter, callers can assign any value. Setters enforce invariants: `player.score = -1` can be rejected before the bad data reaches storage.',
    connects: ['class', 'getter', 'field'],
    example: 'set score(value: number) {\n  if (value < 0) throw new Error("Score cannot be negative")\n  this._score = value\n}',
  },
  field: {
    summary: 'A piece of data stored inside every instance of the class.',
    why: 'Fields are the object\'s memory. Each instance has its own copy, so `playerA.score` and `playerB.score` are independent.',
    connects: ['class', 'constructor', 'method'],
    example: 'score: number = 0\nprivate _name: string',
  },
  function: {
    summary: 'A reusable block of code that lives outside any class.',
    why: 'Not everything needs to be a class. Pure functions with no side effects are easier to test and reason about. Use functions for utilities, transformations, and algorithms.',
    connects: ['variable', 'call', 'return'],
    example: 'function clamp(value: number, min: number, max: number): number {\n  return Math.max(min, Math.min(max, value))\n}',
  },
  variable: {
    summary: 'A named slot that holds a value in memory.',
    why: '`const` = value never reassigned (prefer this). `let` = value changes over time. `var` = legacy, avoid it. Choosing the right keyword signals intent to readers.',
    connects: ['assign', 'function', 'class'],
    example: 'const player = new Player("Ada")\nlet score = 0',
  },
  assign: {
    summary: 'Updates the value stored in an existing variable or property.',
    why: 'Assignment is how programs change over time. Every mutation should be intentional — if something changes unexpectedly it\'s a bug.',
    connects: ['variable', 'field'],
    example: 'player.score = player.score + points',
  },
  call: {
    summary: 'Executes a function or method and optionally uses the return value.',
    why: 'A call is how one part of your program asks another to do work. It\'s the wiring between objects and functions.',
    connects: ['function', 'method', 'variable'],
    example: 'const result = player.addScore(10)\nconsole.log(result)',
  },
  return: {
    summary: 'Sends a value back to whoever called this function and exits immediately.',
    why: 'Return values are how functions communicate results without side effects. A function with a clear return type is easy to understand and test.',
    connects: ['function', 'method', 'variable'],
    example: 'return `${this.name}: ${this.score}`',
  },
  if: {
    summary: 'Runs code only when a condition is true.',
    why: 'Branching is what makes programs respond differently to different data. Every `if` is a decision point — the program takes one path or another.',
    connects: ['variable', 'assign', 'loop'],
    example: 'if (score > highScore) {\n  highScore = score\n  showCelebration()\n}',
  },
  loop: {
    summary: 'Repeats a block of code a set number of times.',
    why: 'Loops turn one line of code into work done on many items. Without loops you\'d have to write the same code 100 times for 100 players.',
    connects: ['variable', 'if', 'assign'],
    example: 'for (let i = 0; i < players.length; i++) {\n  players[i].reset()\n}',
  },
  log: {
    summary: 'Prints a value to the browser console — the simplest debugging tool.',
    why: 'console.log is how you see what\'s happening inside your program. In production you\'d remove these or replace with a proper logger.',
    connects: ['variable', 'call'],
    example: 'console.log("score:", player.score)',
  },
  event: {
    summary: 'Runs code when the user does something (click, keypress, submit…)',
    why: 'Events are the bridge between the DOM and your program logic. The browser calls your function automatically when the user acts.',
    connects: ['function', 'assign', 'htmlText'],
    example: 'document.querySelector("#btn")?.addEventListener("click", (e) => {\n  handleClick(e)\n})',
  },
  htmlText: {
    summary: 'Updates what\'s displayed in an HTML element.',
    why: 'This is the simplest form of DOM mutation: you put a value computed in JavaScript into a tag the user can see.',
    connects: ['event', 'variable'],
    example: 'document.querySelector("#score").textContent = String(player.score)',
  },
  forEachItem: {
    summary: 'Runs the same code once for every item in a list.',
    why: 'Without this you\'d write one line per item by hand. A list of 3 or 3,000 items is handled by the exact same block — the code inside runs once per item, automatically.',
    connects: ['variable', 'if', 'transformList'],
    example: 'names.forEach((name) => {\n  console.log(name)\n})',
  },
  transformList: {
    summary: 'Builds a brand-new list by running the same transformation on every item of an existing one.',
    why: 'The original list is never changed — a new one is created alongside it. This is how you turn a list of prices into a list of prices-with-tax, or a list of names into a list of greetings, without a loop and a manually-managed counter.',
    connects: ['forEachItem', 'filterList', 'return'],
    example: 'const withTax = prices.map((price) => {\n  return price * 1.08\n})',
  },
  filterList: {
    summary: 'Builds a new, shorter list containing only the items that pass a test.',
    why: 'The original list is never changed. This is how you go from "every player" to "just the players still in the game," using a condition instead of manually checking and copying items one at a time.',
    connects: ['transformList', 'forEachItem', 'if'],
    example: 'const active = players.filter((player) => {\n  return player.score > 0\n})',
  },
  whenReady: {
    summary: 'Runs code once a value that takes time to arrive (like data from a server) actually shows up.',
    why: 'Network requests don\'t finish instantly — this is how you say "when that\'s actually ready, do this" instead of trying to use a value before it exists. Add a "Catch" step underneath for what happens if it fails instead.',
    connects: ['chainStep', 'callWithCallback'],
    example: 'fetch(url)\n  .then((data) => {\n    console.log(data)\n  })\n  .catch((error) => {\n    console.log(error)\n  })',
  },
  chainStep: {
    summary: 'One link in a "When It\'s Ready" chain — either what to do when it succeeds (Then), or what to do if it fails (Catch).',
    why: 'A chain reads top to bottom, one link at a time, in the exact order they\'ll actually run — add another step below to keep the chain going.',
    connects: ['whenReady'],
    example: '.then((data) => {\n  console.log(data)\n})',
  },
  callWithCallback: {
    summary: 'Calls a function and hands it a block of code to run later, instead of running it immediately.',
    why: 'Some functions (setTimeout, animation frames, custom functions you\'ve written) don\'t run their effect right away — they take a callback and run it themselves, on their own schedule. This covers those cases when there isn\'t a more specific block for what you\'re doing.',
    connects: ['event', 'whenReady', 'forEachItem'],
    example: 'setTimeout(() => {\n  console.log("done waiting")\n}, 1000)',
  },
  interface: {
    summary: 'Describes the shape of an object — what fields and methods it must have — without implementing any behaviour.',
    why: 'Interfaces are TypeScript\'s way of defining contracts. Any object or class that has the right fields satisfies the interface, enabling polymorphism without inheritance.',
    connects: ['class', 'typeAlias', 'variable'],
    example: 'interface Scorable {\n  readonly name: string\n  score: number\n  addScore(points: number): number\n}',
  },
  typeAlias: {
    summary: 'Gives a name to any type — primitives, unions, intersections, or object shapes.',
    why: 'Type aliases make complex types reusable and readable. `type ID = string | number` is clearer than repeating the union every time.',
    connects: ['interface', 'variable', 'field'],
    example: 'type ID = string | number\ntype Status = "active" | "inactive" | "banned"',
  },
  enum: {
    summary: 'A set of named constants — gives human-readable names to a fixed set of values.',
    why: 'Enums prevent magic strings/numbers scattered through code. `Direction.North` is clear; the number 0 is not.',
    connects: ['variable', 'if', 'typeAlias'],
    example: 'enum Direction { North, South, East, West }\nconst heading = Direction.North',
  },
}

// ─── Block Library ────────────────────────────────────────────────────────────

function def(
  type: BlockType,
  label: string,
  category: BlockCategory,
  description: string,
  options: {
    defaults: Record<string, string>
    fields: FieldSpec[]
    childTypes?: BlockType[]
    tsOnly?: boolean
    childOnly?: boolean
  },
): BlockDefinition {
  return {
    type, label, category, description,
    concept: CONCEPTS[type] ?? { summary: description, why: '', connects: [] },
    defaults: options.defaults,
    fields: options.fields,
    childTypes: options.childTypes ?? [],
    tsOnly: options.tsOnly,
    childOnly: options.childOnly,
  }
}

function f(name: string, label: string, kind: FieldSpec['kind'] = 'text', options?: string[]): FieldSpec {
  return { name, label, kind, options }
}

// The statement types usable inside any "callback body" container — a
// callback's body is just an ordinary list of statements, the same shape
// as an if/loop/event's body, so this is deliberately the same set 'event'
// already uses (see below) plus the 5 new callback-taking blocks themselves,
// so e.g. a "For Each Item" body can itself contain a "When It's Ready".
const CALLBACK_BODY_TYPES: BlockType[] = [
  'variable', 'assign', 'call', 'log', 'if', 'loop', 'htmlText', 'readValue',
  'addClass', 'removeClass', 'toggleClass', 'setStyle',
  'forEachItem', 'transformList', 'filterList', 'whenReady', 'callWithCallback',
]

export const BLOCK_LIBRARY: BlockDefinition[] = [
  // ── OOP ──────────────────────────────────────────────────────────────────
  def('class', 'Class', 'oop', 'Define an object blueprint.', {
    defaults: { name: 'Player', extendsName: '', accessModifier: 'none' },
    fields: [f('name', 'Class name'), f('extendsName', 'Extends'), f('accessModifier', 'Export', 'select', ['none', 'export', 'export default'])],
    childTypes: ['constructor', 'field', 'method', 'getter', 'setter', 'staticMethod'],
  }),
  def('constructor', 'Constructor', 'oop', 'Initialise object state when a new instance is created.', {
    defaults: { params: 'name: string', body: 'this.name = name\nthis.score = 0' },
    fields: [f('params', 'Parameters'), f('body', 'Body', 'code')],
  }),
  def('method', 'Method', 'oop', 'Add behaviour to a class.', {
    defaults: { name: 'greet', params: '', returnType: 'string', async: 'false', access: 'public', body: "return `Hello, I'm ${this.name}`" },
    fields: [f('name', 'Name'), f('params', 'Parameters'), f('returnType', 'Return type'), f('access', 'Access', 'select', ['public', 'private', 'protected']), f('async', 'Async', 'select', ['false', 'true']), f('body', 'Body', 'code')],
  }),
  def('staticMethod', 'Static Method', 'oop', 'A method called on the class itself, not an instance.', {
    defaults: { name: 'create', params: 'name: string', returnType: '', async: 'false', body: 'return new this(name)' },
    fields: [f('name', 'Name'), f('params', 'Parameters'), f('returnType', 'Return type'), f('async', 'Async', 'select', ['false', 'true']), f('body', 'Body', 'code')],
  }),
  def('getter', 'Getter', 'oop', 'Expose a computed property — reads like a field, runs like a method.', {
    defaults: { name: 'label', returnType: 'string', body: "return `${this.name}`" },
    fields: [f('name', 'Property name'), f('returnType', 'Return type'), f('body', 'Body', 'code')],
  }),
  def('setter', 'Setter', 'oop', 'Intercept assignment to validate or transform the value.', {
    defaults: { name: 'score', param: 'value: number', body: 'this._score = Math.max(0, value)' },
    fields: [f('name', 'Property name'), f('param', 'Parameter'), f('body', 'Body', 'code')],
  }),
  def('function', 'Function', 'oop', 'A reusable block of code outside any class.', {
    defaults: { name: 'makePlayer', params: 'name: string', returnType: '', async: 'false' },
    fields: [f('name', 'Name'), f('params', 'Parameters'), f('returnType', 'Return type'), f('async', 'Async', 'select', ['false', 'true'])],
    childTypes: [...CALLBACK_BODY_TYPES, 'return'],
  }),
  def('call', 'Call', 'oop', 'Execute a function or method.', {
    defaults: { expression: 'player.greet()' },
    fields: [f('expression', 'Expression')],
  }),

  // ── TypeScript Types ──────────────────────────────────────────────────────
  def('interface', 'Interface', 'types', 'Define an object shape contract without implementation.', {
    defaults: { name: 'Scorable', extendsName: '', accessModifier: 'export' },
    fields: [f('name', 'Name'), f('extendsName', 'Extends'), f('accessModifier', 'Export', 'select', ['none', 'export'])],
    childTypes: ['interfaceField'],
    tsOnly: true,
  }),
  def('interfaceField', 'Interface Field', 'types', 'A typed field inside an interface.', {
    defaults: { name: 'score', type: 'number', optional: 'false', readonly: 'false' },
    fields: [f('name', 'Name'), f('type', 'Type'), f('optional', 'Optional', 'select', ['false', 'true']), f('readonly', 'Readonly', 'select', ['false', 'true'])],
    tsOnly: true,
  }),
  def('typeAlias', 'Type Alias', 'types', 'Give a name to any type — union, intersection, or shape.', {
    defaults: { name: 'Status', value: '"active" | "inactive" | "banned"', accessModifier: 'export' },
    fields: [f('name', 'Name'), f('value', 'Type expression'), f('accessModifier', 'Export', 'select', ['none', 'export'])],
    tsOnly: true,
  }),
  def('enum', 'Enum', 'types', 'A set of named constants for a fixed set of values.', {
    defaults: { name: 'Direction', accessModifier: 'export' },
    fields: [f('name', 'Name'), f('accessModifier', 'Export', 'select', ['none', 'export'])],
    childTypes: ['enumMember'],
    tsOnly: true,
  }),
  def('enumMember', 'Enum Member', 'types', 'One named value inside an enum.', {
    defaults: { name: 'North', value: '' },
    fields: [f('name', 'Name'), f('value', 'Value (optional)')],
    tsOnly: true,
  }),

  // ── State ─────────────────────────────────────────────────────────────────
  def('field', 'Field', 'state', 'Data stored inside every instance of the class.', {
    defaults: { name: 'score', type: 'number', value: '0', static: 'false', access: 'public' },
    fields: [f('name', 'Name'), f('type', 'Type'), f('value', 'Default value'), f('access', 'Access', 'select', ['public', 'private', 'protected']), f('static', 'Static', 'select', ['false', 'true'])],
  }),
  def('variable', 'Variable', 'state', 'A named slot that holds a value.', {
    defaults: { kind: 'const', name: 'player', type: '', value: 'new Player("Ada")' },
    fields: [f('kind', 'Kind', 'select', ['const', 'let', 'var']), f('name', 'Name'), f('type', 'Type annotation (optional)'), f('value', 'Value')],
  }),
  def('assign', 'Assign', 'state', 'Update the value stored in a variable or property.', {
    defaults: { target: 'player.score', value: '0' },
    fields: [f('target', 'Target'), f('value', 'Value')],
  }),
  def('return', 'Return', 'flow', 'Send a value back to the caller and exit.', {
    defaults: { expression: 'player' },
    fields: [f('expression', 'Expression')],
  }),

  // ── Flow ─────────────────────────────────────────────────────────────────
  def('if', 'If', 'flow', 'Run code only when a condition is true.', {
    defaults: { condition: 'player.score > 5', body: '' },
    // No 'if' in its own children (no nested if-in-if) — same restriction as before these 5 additions.
    childTypes: ['variable', 'assign', 'call', 'log', 'loop', 'return', 'htmlText', 'readValue', 'addClass', 'removeClass', 'toggleClass', 'setStyle', 'forEachItem', 'transformList', 'filterList', 'whenReady', 'callWithCallback'],
    fields: [f('condition', 'Condition'), f('body', 'Raw body (fallback)', 'code')],
  }),
  def('loop', 'Repeat', 'flow', 'Run code a set number of times.', {
    defaults: { count: '3', iterator: 'i', body: '' },
    // No 'loop' in its own children (no nested loop-in-loop) — same restriction as before these 5 additions.
    childTypes: ['variable', 'assign', 'call', 'log', 'if', 'return', 'htmlText', 'readValue', 'addClass', 'removeClass', 'toggleClass', 'setStyle', 'forEachItem', 'transformList', 'filterList', 'whenReady', 'callWithCallback'],
    fields: [f('count', 'Count'), f('iterator', 'Iterator name'), f('body', 'Raw body (fallback)', 'code')],
  }),

  // ── Output ────────────────────────────────────────────────────────────────
  def('log', 'Log', 'output', 'Print a value to the browser console.', {
    defaults: { expression: 'player.label' },
    fields: [f('expression', 'Expression')],
  }),

  // ── HTML ─────────────────────────────────────────────────────────────────
  // All seven of these share the same "target" concept — which element this
  // block acts on — and every one can point at either a raw CSS selector or
  // an already-declared variable (e.g. `const btn = document.querySelector(...)`
  // earlier in the file). targetKind/variableName aren't listed in `fields`
  // because the palette renders them as one combined dropdown (TargetField
  // in VisualJsPanel.tsx), not three separate raw inputs — but they're real,
  // explicit data on the block, not inferred from the selector string.
  def('event', 'Event Listener', 'html', 'Run code when the user interacts with an element.', {
    defaults: { targetKind: 'selector', selector: '#scoreButton', variableName: '', event: 'click' },
    childTypes: CALLBACK_BODY_TYPES,
    fields: [f('selector', 'Target (element or variable)'), f('event', 'Event type')],
  }),
  def('htmlText', 'HTML Text', 'html', 'Write a value into an element the user can see.', {
    defaults: { targetKind: 'selector', selector: '#message', variableName: '', text: 'player.label' },
    fields: [f('selector', 'Target (element or variable)'), f('text', 'Text expression')],
  }),
  def('readValue', 'Read Value', 'html', 'Read what a user typed into an input field.', {
    defaults: { name: 'userInput', targetKind: 'selector', selector: '', variableName: '' },
    fields: [f('name', 'Store in variable'), f('selector', 'Target (element or variable)')],
  }),
  def('addClass', 'Add Class', 'html', 'Add a CSS class to an element to change how it looks.', {
    defaults: { targetKind: 'selector', selector: '', variableName: '', className: 'active' },
    fields: [f('selector', 'Target (element or variable)'), f('className', 'Class to add')],
  }),
  def('removeClass', 'Remove Class', 'html', 'Remove a CSS class from an element.', {
    defaults: { targetKind: 'selector', selector: '', variableName: '', className: 'active' },
    fields: [f('selector', 'Target (element or variable)'), f('className', 'Class to remove')],
  }),
  def('toggleClass', 'Toggle Class', 'html', 'Add a class if absent, remove it if present.', {
    defaults: { targetKind: 'selector', selector: '', variableName: '', className: 'active' },
    fields: [f('selector', 'Target (element or variable)'), f('className', 'Class to toggle')],
  }),
  def('setStyle', 'Set Style', 'html', 'Set a CSS style property directly on an element.', {
    defaults: { targetKind: 'selector', selector: '', variableName: '', property: 'display', value: 'none' },
    fields: [f('selector', 'Target (element or variable)'), f('property', 'CSS property'), f('value', 'Value')],
  }),

  // ── Callbacks & chaining ─────────────────────────────────────────────────
  // Every block below holds its callback body as real children — same shape
  // as 'event' above — never a typed function string.
  def('forEachItem', 'For Each Item', 'flow', 'Run the same code once for every item in a list.', {
    defaults: { list: '', itemParam: 'item' },
    fields: [f('list', 'List (a variable holding an array)'), f('itemParam', 'Name for each item (e.g. item)')],
    childTypes: CALLBACK_BODY_TYPES,
  }),
  def('transformList', 'Transform Each Item', 'flow', 'Build a new list by transforming every item of an existing one.', {
    defaults: { list: '', outputName: 'result', itemParam: 'item' },
    fields: [f('list', 'List (a variable holding an array)'), f('outputName', 'New list name'), f('itemParam', 'Name for each item (e.g. item)')],
    childTypes: [...CALLBACK_BODY_TYPES, 'return'],
  }),
  def('filterList', 'Keep Matching Items', 'flow', 'Build a new, shorter list containing only the items that pass a test.', {
    defaults: { list: '', outputName: 'filtered', itemParam: 'item' },
    fields: [f('list', 'List (a variable holding an array)'), f('outputName', 'New list name'), f('itemParam', 'Name for each item (e.g. item)')],
    childTypes: [...CALLBACK_BODY_TYPES, 'return'],
  }),
  def('whenReady', 'When It\'s Ready', 'flow', 'Run code once a value that takes time to arrive actually shows up.', {
    defaults: { value: '' },
    fields: [f('value', 'Promise (e.g. a Fetch pattern)')],
    childTypes: ['chainStep'],
  }),
  def('chainStep', 'Then / Catch', 'flow', 'One link in a "When It\'s Ready" chain.', {
    defaults: { kind: 'then', paramName: 'data' },
    fields: [f('kind', 'Step type', 'select', ['then', 'catch']), f('paramName', 'Parameter name (e.g. data, or error for a catch step)')],
    childTypes: CALLBACK_BODY_TYPES,
    childOnly: true,
  }),
  def('callWithCallback', 'Call, With a Callback', 'flow', 'Call a function and hand it a block of code to run later.', {
    defaults: { fn: '', paramName: 'value' },
    fields: [f('fn', 'Function / method (e.g. setTimeout, myArray.forEach)'), f('paramName', 'Callback parameter name (optional)')],
    childTypes: CALLBACK_BODY_TYPES,
  }),
]

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function blockDefinition(type: string): BlockDefinition | null {
  return BLOCK_LIBRARY.find(b => b.type === type) ?? null
}

export function childOptionsFor(type: string): BlockDefinition[] {
  const def = blockDefinition(type)
  if (!def?.childTypes?.length) return []
  return def.childTypes.map(blockDefinition).filter(Boolean) as BlockDefinition[]
}

export function canContainChildren(type: string): boolean {
  return childOptionsFor(type).length > 0
}

export function createBlock(type: BlockType): Block {
  const def = blockDefinition(type)
  if (!def) throw new Error(`Unknown block type: ${type}`)
  return {
    id: `block_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    category: def.category,
    fields: { ...def.defaults },
    children: [],
  }
}

// The same element-or-variable target every DOM-facing block below points at.
function targetSummary(f: Record<string, string>): string {
  return f.targetKind === 'variable' ? (f.variableName || '?') : (f.selector || '?')
}

export function summarizeBlock(block: Block): string {
  const f = block.fields ?? {}
  switch (block.type) {
    case 'class':        return `class ${f.name || 'Unnamed'}${f.extendsName ? ` extends ${f.extendsName}` : ''}`
    case 'interface':    return `interface ${f.name || 'Unnamed'}${f.extendsName ? ` extends ${f.extendsName}` : ''}`
    case 'interfaceField': return `${f.readonly === 'true' ? 'readonly ' : ''}${f.name || 'field'}${f.optional === 'true' ? '?' : ''}: ${f.type || 'unknown'}`
    case 'typeAlias':    return `type ${f.name || 'T'} = ${f.value || 'unknown'}`
    case 'enum':         return `enum ${f.name || 'Enum'}`
    case 'enumMember':   return `${f.name || 'Member'}${f.value ? ` = ${f.value}` : ''}`
    case 'constructor':  return `constructor(${f.params || ''})`
    case 'method':       return `${f.access !== 'public' ? f.access + ' ' : ''}${f.name || 'method'}(${f.params || ''}): ${f.returnType || 'void'}`
    case 'staticMethod': return `static ${f.name || 'method'}(${f.params || ''})`
    case 'getter':       return `get ${f.name || 'property'}(): ${f.returnType || 'unknown'}`
    case 'setter':       return `set ${f.name || 'property'}(${f.param || 'value'})`
    case 'field':        return `${f.access !== 'public' ? f.access + ' ' : ''}${f.static === 'true' ? 'static ' : ''}${f.name || 'field'}: ${f.type || 'unknown'} = ${f.value || 'undefined'}`
    case 'function':     return `${f.async === 'true' ? 'async ' : ''}function ${f.name || 'fn'}(${f.params || ''})`
    case 'variable':     return `${f.kind || 'const'} ${f.name || 'value'}${f.type ? ': ' + f.type : ''} = ${f.value || 'undefined'}`
    case 'assign':       return `${f.target || 'value'} = ${f.value || 'undefined'}`
    case 'call':         return `${f.expression || 'fn()'}`
    case 'return':       return `return ${f.expression || 'undefined'}`
    case 'if':           return `if (${f.condition || 'true'})`
    case 'loop':         return `repeat ${f.count || '0'} as ${f.iterator || 'i'}`
    case 'log':          return `console.log(${f.expression || ''})`
    case 'event':        return `${targetSummary(f)} on ${f.event || 'click'}`
    case 'htmlText':     return `${targetSummary(f)} ← ${f.text || ''}`
    case 'readValue':    return `${f.name || 'val'} = ${targetSummary(f)}.value`
    case 'addClass':     return `${targetSummary(f)}.classList.add('${f.className || ''}')`
    case 'removeClass':  return `${targetSummary(f)}.classList.remove('${f.className || ''}')`
    case 'toggleClass':  return `${targetSummary(f)}.classList.toggle('${f.className || ''}')`
    case 'setStyle':     return `${targetSummary(f)}.style.${f.property || 'display'} = '${f.value || ''}'`
    case 'forEachItem':  return `for each ${f.itemParam || 'item'} in ${f.list || '?'}`
    case 'transformList': return `const ${f.outputName || 'result'} = ${f.list || '?'}.map(${f.itemParam || 'item'} => ...)`
    case 'filterList':   return `const ${f.outputName || 'filtered'} = ${f.list || '?'}.filter(${f.itemParam || 'item'} => ...)`
    case 'whenReady':    return `${f.value || '?'} …`
    case 'chainStep':    return `.${f.kind || 'then'}(${f.paramName || 'data'} => ...)`
    case 'callWithCallback': return `${f.fn || 'fn'}(${f.paramName || 'value'} => ...)`
    default:             return Object.values(f).filter(Boolean).join(' ')
  }
}
