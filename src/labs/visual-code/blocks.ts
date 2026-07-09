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
  },
): BlockDefinition {
  return {
    type, label, category, description,
    concept: CONCEPTS[type] ?? { summary: description, why: '', connects: [] },
    defaults: options.defaults,
    fields: options.fields,
    childTypes: options.childTypes ?? [],
    tsOnly: options.tsOnly,
  }
}

function f(name: string, label: string, kind: FieldSpec['kind'] = 'text', options?: string[]): FieldSpec {
  return { name, label, kind, options }
}

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
    childTypes: ['variable', 'assign', 'call', 'log', 'if', 'loop', 'return', 'htmlText', 'readValue', 'addClass', 'removeClass', 'toggleClass', 'setStyle'],
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
    childTypes: ['variable', 'assign', 'call', 'log', 'loop', 'return', 'htmlText', 'readValue', 'addClass', 'removeClass', 'toggleClass', 'setStyle'],
    fields: [f('condition', 'Condition'), f('body', 'Raw body (fallback)', 'code')],
  }),
  def('loop', 'Repeat', 'flow', 'Run code a set number of times.', {
    defaults: { count: '3', iterator: 'i', body: '' },
    childTypes: ['variable', 'assign', 'call', 'log', 'if', 'return', 'htmlText', 'readValue', 'addClass', 'removeClass', 'toggleClass', 'setStyle'],
    fields: [f('count', 'Count'), f('iterator', 'Iterator name'), f('body', 'Raw body (fallback)', 'code')],
  }),

  // ── Output ────────────────────────────────────────────────────────────────
  def('log', 'Log', 'output', 'Print a value to the browser console.', {
    defaults: { expression: 'player.label' },
    fields: [f('expression', 'Expression')],
  }),

  // ── HTML ─────────────────────────────────────────────────────────────────
  def('event', 'Event Listener', 'html', 'Run code when the user interacts with an element.', {
    defaults: { selector: '#scoreButton', event: 'click' },
    childTypes: ['variable', 'assign', 'call', 'log', 'if', 'loop', 'htmlText', 'readValue', 'addClass', 'removeClass', 'toggleClass', 'setStyle'],
    fields: [f('selector', 'CSS selector'), f('event', 'Event type')],
  }),
  def('htmlText', 'HTML Text', 'html', 'Write a value into an element the user can see.', {
    defaults: { selector: '#message', text: 'player.label' },
    fields: [f('selector', 'CSS selector'), f('text', 'Text expression')],
  }),
  def('readValue', 'Read Value', 'html', 'Read what a user typed into an input field.', {
    defaults: { name: 'userInput', selector: '' },
    fields: [f('name', 'Store in variable'), f('selector', 'Input element')],
  }),
  def('addClass', 'Add Class', 'html', 'Add a CSS class to an element to change how it looks.', {
    defaults: { selector: '', className: 'active' },
    fields: [f('selector', 'Element'), f('className', 'Class to add')],
  }),
  def('removeClass', 'Remove Class', 'html', 'Remove a CSS class from an element.', {
    defaults: { selector: '', className: 'active' },
    fields: [f('selector', 'Element'), f('className', 'Class to remove')],
  }),
  def('toggleClass', 'Toggle Class', 'html', 'Add a class if absent, remove it if present.', {
    defaults: { selector: '', className: 'active' },
    fields: [f('selector', 'Element'), f('className', 'Class to toggle')],
  }),
  def('setStyle', 'Set Style', 'html', 'Set a CSS style property directly on an element.', {
    defaults: { selector: '', property: 'display', value: 'none' },
    fields: [f('selector', 'Element'), f('property', 'CSS property'), f('value', 'Value')],
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
    case 'event':        return `${f.selector || '#app'} on ${f.event || 'click'}`
    case 'htmlText':     return `${f.selector || '#app'} ← ${f.text || ''}`
    case 'readValue':    return `${f.name || 'val'} = ${f.selector || '?'}.value`
    case 'addClass':     return `${f.selector || '?'}.classList.add('${f.className || ''}')`
    case 'removeClass':  return `${f.selector || '?'}.classList.remove('${f.className || ''}')`
    case 'toggleClass':  return `${f.selector || '?'}.classList.toggle('${f.className || ''}')`
    case 'setStyle':     return `${f.selector || '?'}.style.${f.property || 'display'} = '${f.value || ''}'`
    default:             return Object.values(f).filter(Boolean).join(' ')
  }
}
