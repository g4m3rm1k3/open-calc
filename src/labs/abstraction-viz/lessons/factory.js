export default {
  id: 'factory',
  title: 'Factory Pattern',
  tag: 'Design Pattern',
  steps: [
    {
      title: 'Factory function — construction without new',
      code:
`function createButton(type) {
  if (type === 'primary') {
    return { type: 'primary', color: 'blue', border: '2px solid blue' }
  }
  if (type === 'danger') {
    return { type: 'danger', color: 'red', border: '2px solid red' }
  }
  return { type: 'default', color: 'grey', border: '1px solid grey' }
}

const btn = createButton('primary')
console.log(btn.type)
console.log(btn.color)`,
      explanation: [
        '`createButton(\'primary\')` is a factory function: a plain function that returns a configured object. The caller provides intent (`\'primary\'`), and the factory provides the result. Lines 12–13 print `\'primary\'` then `\'blue\'`. The caller never touches object literals directly — it only describes what it wants.',
        'CS — A factory is any callable that returns an object and hides construction details. There are three levels: factory functions (plain functions returning literals, used here), factory methods (static class methods returning instances), and Abstract Factory (a function that returns different factories). This is the simplest, most composable form.',
        'SE — `document.createElement(\'div\')`, `React.createElement(type, props)`, `Buffer.from(data)`, and `express()` are all factory functions. Every major library uses them because they give the library — not the caller — control over what actually gets created. Callers express intent; factories decide implementation.',
        'Without this: without a factory, every caller writes `{ type: \'primary\', color: \'blue\', border: \'2px solid blue\' }` inline. When the design team changes the primary border to `\'3px solid navy\'`, every call site in the codebase must be updated. The factory is the single source of truth for construction.',
      ],
      active: [
        { startLine: 1, endLine: 9,  color: 'indigo',  label: 'createButton — factory function' },
        { startLine: 11, endLine: 13, color: 'emerald', label: 'caller gets object, no new required' },
      ],
      connections: [{ fromLine: 11, toLine: 1, color: 'emerald', label: 'call → factory decides' }],
    },
    {
      title: 'Add a render() method to every button',
      code:
`function createButton(type) {
  if (type === 'primary') {
    return { type: 'primary', color: 'blue', border: '2px solid blue',
      render: function() { return '<button style="color:blue">' + type + '</button>' } }
  }
  if (type === 'danger') {
    return { type: 'danger', color: 'red', border: '2px solid red',
      render: function() { return '<button style="color:red">' + type + '</button>' } }
  }
  return { type: 'default', color: 'grey', border: '1px solid grey',
    render: function() { return '<button>' + type + '</button>' } }
}

const btn = createButton('primary')
console.log(btn.type)
console.log(btn.color)
console.log(btn.render())`,
      explanation: [
        'Each object returned now includes a `render` method. `btn.render()` on line 17 prints `\'<button style="color:blue">primary</button>\'`. The method closes over the `type` argument — it reads `type` from the factory call\'s scope. No `this.type` needed here; the closure captures the local variable.',
        'CS — The returned objects are closures: their methods capture variables from the enclosing factory scope. Each call to `createButton` creates a new closure environment. `createButton(\'primary\')` and `createButton(\'danger\')` produce objects whose `render` methods close over different `type` values — they are independent.',
        'SE — Adding shared behaviour to all factory outputs is the factory\'s superpower. Every button gets `render()` automatically — no base class, no prototype chain needed. Lodash\'s `_.create(proto, props)` factory attaches methods this way. React\'s `createContext()` attaches `Provider` and `Consumer` to the returned object.',
        'Without this: without the factory, every caller who wants a renderable button must remember to add `render` themselves. One caller forgets; their button has no `render`; `btn.render()` throws `TypeError: btn.render is not a function`. The factory guarantees the contract — every output has the same shape.',
      ],
      active: [
        { startLine: 3,  endLine: 4,  color: 'violet',  label: 'render added to every branch' },
        { startLine: 17, endLine: 17, color: 'emerald', label: 'btn.render() — prints the HTML string' },
      ],
      connections: [{ fromLine: 17, toLine: 4, color: 'violet', label: 'render closes over type' }],
    },
    {
      title: 'Move shared behaviour into one place',
      code:
`function createButton(type) {
  const styles = {
    primary: { color: 'blue',  border: '2px solid blue' },
    danger:  { color: 'red',   border: '2px solid red'  },
    default: { color: 'grey',  border: '1px solid grey' },
  }
  const s = styles[type] || styles['default']

  return {
    type,
    color:  s.color,
    border: s.border,
    render: function() {
      return '<button style="color:' + s.color + '">' + type + '</button>'
    },
  }
}

const primary = createButton('primary')
const danger  = createButton('danger')
const unknown = createButton('ghost')
console.log(primary.type)
console.log(danger.color)
console.log(unknown.color)
console.log(primary.render())`,
      explanation: [
        'The `styles` map on lines 2–6 holds every type\'s configuration. Line 7 looks up the right style — or falls back to `default` for unknown types. `createButton(\'ghost\')` returns `{ type: \'ghost\', color: \'grey\', ... }` because `\'ghost\'` has no entry. Lines 21–24 print `\'primary\'`, `\'red\'`, `\'grey\'`, `\'<button style="color:blue">primary</button>\'`.',
        'CS — The lookup table `styles[type]` replaces a chain of `if/else` branches. Lookup tables scale in `O(1)` regardless of how many types exist — the dictionary lookup takes constant time. If/else chains grow `O(n)` with every new type added. The fallback `|| styles[\'default\']` is the Null Object pattern: return a safe default rather than `undefined`.',
        'SE — Configuration objects are the standard way to handle variant behaviour in production: Material UI\'s theme object maps `primary`, `secondary`, `error` to colour tokens. Tailwind\'s config maps utility names to CSS values. Webpack\'s resolve.alias maps module names to paths. The lookup-table factory is the same pattern.',
        'Without this: with if/else branches, adding a new button type (`\'success\'`, `\'warning\'`) means editing the factory\'s branch structure. With the map, adding a type is one key in `styles` — no branching logic changes. The factory becomes open for extension, closed for modification.',
      ],
      active: [
        { startLine: 2,  endLine: 6,  color: 'indigo', label: 'styles map — all config in one place' },
        { startLine: 7,  endLine: 7,  color: 'violet', label: 'fallback to default for unknown types' },
        { startLine: 21, endLine: 24, color: 'emerald', label: 'four outputs, one factory' },
      ],
      connections: [],
    },
    {
      title: 'Upgrade to a class — factory returns an instance',
      code:
`class Button {
  constructor(type, color, border) {
    this.type   = type
    this.color  = color
    this.border = border
  }
  render() {
    return '<button style="color:' + this.color + '">' + this.type + '</button>'
  }
}

function createButton(type) {
  const styles = {
    primary: { color: 'blue',  border: '2px solid blue' },
    danger:  { color: 'red',   border: '2px solid red'  },
    default: { color: 'grey',  border: '1px solid grey' },
  }
  const s = styles[type] || styles['default']
  return new Button(type, s.color, s.border)
}

const primary = createButton('primary')
const danger  = createButton('danger')
const unknown = createButton('ghost')
console.log(primary.type)
console.log(danger.color)
console.log(unknown.color)
console.log(primary.render())
console.log(primary instanceof Button)`,
      explanation: [
        '`createButton` now calls `new Button(...)` on line 19 and returns the instance. The caller still writes `createButton(\'primary\')` — nothing about the API changed. Line 29 logs `true` — `primary instanceof Button` because the factory creates a real class instance. The factory hid the class entirely; callers had no idea a class existed until this step.',
        'CS — This is the Factory Method pattern: a function (or static class method) that encapsulates `new`. The factory owns the `new` call and the argument assembly. The caller owns the intent. Switching from a literal to a class instance was a zero-cost refactor — the factory absorbed the change completely.',
        'SE — Factory functions are how you evolve an API without breaking callers. Lodash started many utilities as plain functions returning objects; later versions swapped in class instances for performance. The callers never changed. React\'s hooks (`useState`, `useReducer`) return arrays/objects from factories — the internal representation changed between React 16 and 17 without any caller updates.',
        'Without this: if callers write `new Button(\'primary\', \'blue\', \'2px solid blue\')` directly, the class constructor\'s signature is part of the public API. Adding a parameter (say, `disabled`) requires updating every `new Button(...)` call. The factory absorbs the signature change — callers pass only `type`, and the factory handles everything else.',
      ],
      active: [
        { startLine: 1,  endLine: 9,  color: 'indigo',  label: 'Button class — real class under the hood' },
        { startLine: 19, endLine: 19, color: 'violet',  label: 'factory calls new Button internally' },
        { startLine: 29, endLine: 29, color: 'emerald', label: 'instanceof Button — true' },
      ],
      connections: [{ fromLine: 19, toLine: 1, color: 'violet', label: 'factory → new Button' }],
    },
    {
      title: 'Registry — factory picks the right class dynamically',
      code:
`class Button {
  constructor(type, color, border) {
    this.type   = type
    this.color  = color
    this.border = border
  }
  render() {
    return '<button style="color:' + this.color + '">' + this.type + '</button>'
  }
}

class IconButton extends Button {
  constructor(type, color, border, icon) {
    super(type, color, border)
    this.icon = icon
  }
  render() {
    return '<button>' + this.icon + ' ' + this.type + '</button>'
  }
}

const registry = {
  primary:  (t) => new Button(t, 'blue', '2px solid blue'),
  danger:   (t) => new Button(t, 'red',  '2px solid red'),
  icon:     (t) => new IconButton(t, 'blue', '2px solid blue', '★'),
  default:  (t) => new Button(t, 'grey', '1px solid grey'),
}

function createButton(type) {
  const maker = registry[type] || registry['default']
  return maker(type)
}

const primary = createButton('primary')
const danger  = createButton('danger')
const unknown = createButton('ghost')
const icon    = createButton('icon')
console.log(primary.render())
console.log(danger.render())
console.log(unknown.render())
console.log(icon.render())`,
      explanation: [
        'The `registry` on lines 22–27 maps type strings to creator functions. `createButton(\'icon\')` looks up `registry[\'icon\']` and calls it — returning an `IconButton` instance. `createButton(\'ghost\')` falls back to `registry[\'default\']`. Lines 38–41 print the rendered HTML for each. The factory now dispatches to different constructors based on the type string.',
        'CS — This is the Registry + Factory pattern, sometimes called the Prototype Registry. The registry is a dictionary of factories indexed by key. Lookup is `O(1)`. Adding a new type is `registry[\'newType\'] = (t) => new NewClass(t, ...)` — no branching code changes. The factory function itself is now trivially small: look up, call, return.',
        'SE — This is how plugin systems work. Webpack\'s loader resolution, React\'s reconciler type dispatch, Express\'s router method registry, and Angular\'s dependency injection container all use registries. The registry lets third-party code register new types without modifying the factory\'s source. That\'s the Open/Closed Principle at the system level.',
        'Without this: without the registry, every new button type requires an `if/else` branch in `createButton`. The factory file becomes a change magnet — every developer adding a new type modifies it. With the registry, adding a type adds one line to the registry — the factory function never changes.',
      ],
      active: [
        { startLine: 22, endLine: 27, color: 'indigo',  label: 'registry — type → creator function' },
        { startLine: 29, endLine: 32, color: 'violet',  label: 'createButton looks up and calls' },
        { startLine: 38, endLine: 41, color: 'emerald', label: 'four types, two classes, one factory' },
      ],
      connections: [{ fromLine: 30, toLine: 22, color: 'violet', label: 'type → registry lookup' }],
    },
    {
      title: 'Validation and defaults inside the factory',
      code:
`class Button {
  constructor(type, color, border) {
    this.type   = type
    this.color  = color
    this.border = border
  }
  render() {
    return '<button style="color:' + this.color + '">' + this.type + '</button>'
  }
}

class IconButton extends Button {
  constructor(type, color, border, icon) {
    super(type, color, border)
    this.icon = icon
  }
  render() {
    return '<button>' + this.icon + ' ' + this.type + '</button>'
  }
}

const registry = {
  primary:  (t) => new Button(t, 'blue', '2px solid blue'),
  danger:   (t) => new Button(t, 'red',  '2px solid red'),
  icon:     (t) => new IconButton(t, 'blue', '2px solid blue', '★'),
  default:  (t) => new Button(t, 'grey', '1px solid grey'),
}

function createButton(type) {
  if (typeof type !== 'string' || type.trim() === '') {
    throw new Error('createButton: type must be a non-empty string, got ' + typeof type)
  }
  const key   = type.trim().toLowerCase()
  const maker = registry[key] || registry['default']
  return maker(key)
}

const primary = createButton('primary')
const danger  = createButton('danger')
const unknown = createButton('ghost')
const icon    = createButton('icon')
console.log(primary.render())
console.log(danger.render())
console.log(unknown.render())
console.log(icon.render())
console.log(createButton('  PRIMARY  ').type)`,
      explanation: [
        'Lines 30–32 validate the `type` argument before any construction happens. Line 33 normalises the input with `.trim().toLowerCase()` — `\'  PRIMARY  \'` becomes `\'primary\'`. Line 47 prints `\'primary\'`. If `createButton(42)` were called, it would throw `Error: createButton: type must be a non-empty string, got number`. The error message names the rule and the actual value.',
        'CS — Input validation at the factory boundary is the guard-clause pattern: check preconditions first, throw if violated, proceed only when safe. The factory is a trust boundary — it is the last point where untrusted external input becomes an internal object. Everything inside the factory (the registry, the class constructors) can trust that `key` is a valid string.',
        'SE — Production factories always validate. Zod\'s `z.object()` schema factories reject invalid shapes with exact field-level error messages. Express validators validate request bodies before route handlers touch them. React\'s `PropTypes` (the runtime version) logs warnings when component factories receive wrong prop types. The pattern is: reject at the boundary, trust inside.',
        'Without this: without validation, `createButton(undefined)` calls `registry[undefined]` — returns `undefined` — then calls `undefined(type)` which throws `TypeError: undefined is not a function`. The error points at line 35 deep in the factory, not at the caller. The caller gets a confusing error with no context. Good validation throws early with a message that names the caller\'s mistake.',
      ],
      active: [
        { startLine: 30, endLine: 32, color: 'violet',  label: 'guard clause — reject invalid input early' },
        { startLine: 33, endLine: 33, color: 'indigo',  label: 'normalise input before lookup' },
        { startLine: 47, endLine: 47, color: 'emerald', label: '"PRIMARY" → "primary" normalised correctly' },
      ],
      connections: [],
    },
    {
      title: 'Memoized factory — cache instances by type',
      code:
`class Button {
  constructor(type, color, border) {
    this.type   = type
    this.color  = color
    this.border = border
  }
  render() {
    return '<button style="color:' + this.color + '">' + this.type + '</button>'
  }
}

class IconButton extends Button {
  constructor(type, color, border, icon) {
    super(type, color, border)
    this.icon = icon
  }
  render() {
    return '<button>' + this.icon + ' ' + this.type + '</button>'
  }
}

const registry = {
  primary:  (t) => new Button(t, 'blue', '2px solid blue'),
  danger:   (t) => new Button(t, 'red',  '2px solid red'),
  icon:     (t) => new IconButton(t, 'blue', '2px solid blue', '★'),
  default:  (t) => new Button(t, 'grey', '1px solid grey'),
}

const cache = {}

function createButton(type) {
  if (typeof type !== 'string' || type.trim() === '') {
    throw new Error('createButton: type must be a non-empty string, got ' + typeof type)
  }
  const key = type.trim().toLowerCase()
  if (cache[key]) return cache[key]
  const maker = registry[key] || registry['default']
  cache[key] = maker(key)
  return cache[key]
}

const a = createButton('primary')
const b = createButton('danger')
const c = createButton('primary')
console.log(a.render())
console.log(b.render())
console.log(a === c)
console.log(Object.keys(cache))`,
      explanation: [
        'Line 36 checks `cache[key]` before constructing — if a button of that type already exists, return it immediately. `createButton(\'primary\')` is called twice (lines 42 and 44). The second call returns the cached instance. Line 47 prints `true` — `a` and `c` are the exact same object in memory. Line 48 prints `[\'primary\', \'danger\']`.',
        'CS — This is the Flyweight pattern combined with the Factory: a single instance is shared wherever the same type is needed. The cache is a dictionary of `type → instance`. The factory checks the cache first (`O(1)`), constructs only on a miss, then populates the cache for future hits. This eliminates redundant object allocation for identical configurations.',
        'SE — React\'s reconciler caches component types. Redux\'s `combineReducers` returns a cached reducer reference. Node.js\'s `require()` is a memoized factory — every subsequent `require(\'lodash\')` returns the cached module object. The Module Pattern is a memoized factory at the file level.',
        'Without this: without caching, `createButton(\'primary\')` called 1,000 times creates 1,000 separate `Button` objects — identical but independent. Each allocates memory. In a button library rendering thousands of UI elements, the allocation cost is significant. The cache trades memory (one object per type) for speed (zero construction on repeat calls).',
      ],
      active: [
        { startLine: 29, endLine: 29, color: 'indigo',  label: 'cache — one object per unique type' },
        { startLine: 36, endLine: 36, color: 'violet',  label: 'cache hit — return existing, skip construction' },
        { startLine: 46, endLine: 48, color: 'emerald', label: 'a === c: true — same reference returned twice' },
      ],
      connections: [],
    },
    {
      title: 'Static factory method on the class itself',
      code:
`class Button {
  constructor(type, color, border) {
    this.type   = type
    this.color  = color
    this.border = border
  }

  render() {
    return '<button style="color:' + this.color + '">' + this.type + '</button>'
  }

  static primary() { return new Button('primary', 'blue',  '2px solid blue') }
  static danger()  { return new Button('danger',  'red',   '2px solid red')  }
  static ghost()   { return new Button('ghost',   'grey',  '1px solid grey') }
}

class IconButton extends Button {
  constructor(type, color, border, icon) {
    super(type, color, border)
    this.icon = icon
  }
  render() {
    return '<button>' + this.icon + ' ' + this.type + '</button>'
  }
  static icon() { return new IconButton('icon', 'blue', '2px solid blue', '★') }
}

const a = createButton('primary')
const b = createButton('danger')
const c = createButton('primary')

function createButton(type) {
  if (typeof type !== 'string' || type.trim() === '') {
    throw new Error('createButton: type must be a non-empty string, got ' + typeof type)
  }
  const key = type.trim().toLowerCase()
  if (key === 'primary') return Button.primary()
  if (key === 'danger')  return Button.danger()
  if (key === 'icon')    return IconButton.icon()
  return Button.ghost()
}

const p = Button.primary()
const d = Button.danger()
const i = IconButton.icon()
console.log(p.render())
console.log(d.render())
console.log(i.render())
console.log(p instanceof Button)`,
      explanation: [
        '`Button.primary()` on line 12 is a static factory method — it lives on the class itself, not on instances. `Button.primary()` on line 44 creates and returns a primary button directly. `p.render()` on line 47 prints `\'<button style="color:blue">primary</button>\'`. Line 50 prints `true` — `p instanceof Button`.',
        'CS — Static factory methods are the preferred approach in languages like Java, and are increasingly common in JavaScript. They have two advantages over plain factory functions: the factory\'s name makes the intent clear (`Button.primary()` vs `createButton(\'primary\')`), and the factory lives on the class, keeping related code co-located. `Array.from()`, `Promise.resolve()`, and `Object.keys()` are static factory methods on standard library classes.',
        'SE — Named constructors are a production pattern: `Date.now()` (returns a number, not a Date), `Promise.all()`, `URL.createObjectURL()`. When a class has multiple valid construction paths — with defaults, from a string, from another instance — named static methods communicate which path you\'re taking. `Button.primary()` is more readable than `new Button(\'primary\', \'blue\', \'2px solid blue\')`.',
        'Without this: without named factory methods, complex construction requires remembering argument order — `new Button(\'primary\', \'blue\', \'2px solid blue\')`. Swap `\'blue\'` and `\'2px solid blue\'` and the class breaks silently (both are strings). Named factories like `Button.primary()` encode the defaults inside the class, where they belong.',
      ],
      active: [
        { startLine: 12, endLine: 14, color: 'indigo',  label: 'static factory methods on Button itself' },
        { startLine: 44, endLine: 46, color: 'emerald', label: 'callers use named constructors — intent is clear' },
        { startLine: 50, endLine: 50, color: 'violet',  label: 'instanceof Button — true' },
      ],
      connections: [{ fromLine: 12, toLine: 1, color: 'violet', label: 'static factory calls new Button' }],
    },
  ],
}
