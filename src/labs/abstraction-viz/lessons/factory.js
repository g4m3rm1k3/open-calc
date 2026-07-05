export default {
  id: 'factory',
  title: 'Factory Pattern',
  tag: 'Design Pattern',
  steps: [
    {
      title: 'Factory function — caller expresses intent, factory decides shape',
      semanticEvent: 'DefineFunction',
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
        '`createButton` establishes the **intent → object dependency**: the caller provides a string describing what they want; the factory owns the decision of what that becomes. The caller\'s API surface is one word — `\'primary\'`. The factory\'s internal structure (colors, borders, shapes) is invisible to callers. This separation is what makes factories extensible.',
        'CS — A factory is any callable that returns an object and hides construction details. There are three levels: factory functions (plain functions returning literals, used here), factory methods (static class methods returning instances), and Abstract Factory (a function that returns different factories). This is the simplest, most composable form.',
        'SE — `document.createElement(\'div\')`, `React.createElement(type, props)`, `Buffer.from(data)`, and `express()` are all factory functions. Every major library uses them because they give the library — not the caller — control over what actually gets created. Callers express intent; factories decide implementation.',
        'Without this: without a factory, every caller writes `{ type: \'primary\', color: \'blue\', border: \'2px solid blue\' }` inline. When the design team changes the primary border to `\'3px solid navy\'`, every call site in the codebase must be updated. The factory is the single source of truth for construction.',
      ],
      active: [
        { startLine: 1,  endLine: 9,  color: 'indigo',  label: 'createButton — factory owns the object shape' },
        { startLine: 11, endLine: 13, color: 'emerald', label: 'caller expresses intent only' },
      ],
      connections: [{ fromLine: 11, toLine: 1, color: 'emerald', label: 'createButton call', type: 'calls' }],
    },
    {
      title: 'Add shared behaviour — every output gets render()',
      semanticEvent: 'WriteProperty',
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
        'Adding `render` to every returned object **extends the factory contract**: all outputs now carry the same method. The factory guarantees the shape — any code that accepts a factory output can call `.render()` without checking if it exists. The `render` method closes over `type`, so it always renders the right label without needing `this`.',
        'CS — The returned objects are closures: their methods capture variables from the enclosing factory scope. Each call to `createButton` creates a new closure environment. `createButton(\'primary\')` and `createButton(\'danger\')` produce objects whose `render` methods close over different `type` values — they are independent.',
        'SE — Adding shared behaviour to all factory outputs is the factory\'s superpower. Every button gets `render()` automatically — no base class, no prototype chain needed. Lodash\'s `_.create(proto, props)` factory attaches methods this way. React\'s `createContext()` attaches `Provider` and `Consumer` to the returned object.',
        'Without this: without the factory, every caller who wants a renderable button must remember to add `render` themselves. One caller forgets; their button has no `render`; `btn.render()` throws `TypeError: btn.render is not a function`. The factory guarantees the contract — every output has the same shape.',
      ],
      active: [
        { startLine: 3,  endLine: 4,  color: 'violet',  label: 'render added to every branch' },
        { startLine: 17, endLine: 17, color: 'emerald', label: 'btn.render() — guaranteed to exist' },
      ],
      connections: [
        { fromLine: 17, toLine: 4, color: 'violet', label: 'render closes over type', type: 'captures' },
      ],
    },
    {
      title: 'Lookup table — all config in one place',
      semanticEvent: 'ReadProperty',
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
        'The `styles` lookup table **centralises all variant configuration** behind a single dictionary access: `styles[type]`. Instead of branching logic, the factory performs one `O(1)` lookup and falls back to `default` for unknown types. The relationship established: type strings map to configuration objects, and the factory reads from that map rather than encoding logic in branches.',
        'CS — The lookup table `styles[type]` replaces a chain of `if/else` branches. Lookup tables scale in `O(1)` regardless of how many types exist. If/else chains grow `O(n)` with every new type added. The fallback `|| styles[\'default\']` is the Null Object pattern: return a safe default rather than `undefined`.',
        'SE — Configuration objects are the standard way to handle variant behaviour in production: Material UI\'s theme object maps `primary`, `secondary`, `error` to colour tokens. Tailwind\'s config maps utility names to CSS values. Webpack\'s resolve.alias maps module names to paths. The lookup-table factory is the same pattern.',
        'Without this: with if/else branches, adding a new button type (`\'success\'`, `\'warning\'`) means editing the factory\'s branch structure. With the map, adding a type is one key in `styles` — no branching logic changes. The factory becomes open for extension, closed for modification.',
      ],
      active: [
        { startLine: 2,  endLine: 6,  color: 'indigo',  label: 'styles map — all config centralised' },
        { startLine: 7,  endLine: 7,  color: 'violet',  label: 'fallback to default for unknown types' },
        { startLine: 21, endLine: 24, color: 'emerald', label: 'four outputs, one factory' },
      ],
      connections: [
        { fromLine: 7, toLine: 2, color: 'indigo', label: 'styles[type] lookup', type: 'reads' },
      ],
    },
    {
      title: 'Upgrade to a class — factory hides the implementation change',
      semanticEvent: 'CreateObject',
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
        'The factory now calls `new Button(...)` internally — but **the caller\'s API is unchanged**. This reveals the factory\'s core value: the implementation behind `createButton(\'primary\')` can change completely (from a literal to a class instance) without the caller knowing or caring. The factory absorbed the change.',
        'CS — This is the Factory Method pattern: a function (or static class method) that encapsulates `new`. The factory owns the `new` call and the argument assembly. The caller owns the intent. Switching from a literal to a class instance was a zero-cost refactor — the factory absorbed the change completely.',
        'SE — Factory functions are how you evolve an API without breaking callers. Lodash started many utilities as plain functions returning objects; later versions swapped in class instances for performance. The callers never changed. React\'s hooks (`useState`, `useReducer`) return arrays/objects from factories — the internal representation changed between React 16 and 17 without any caller updates.',
        'Without this: if callers write `new Button(\'primary\', \'blue\', \'2px solid blue\')` directly, the class constructor\'s signature is part of the public API. Adding a parameter (say, `disabled`) requires updating every `new Button(...)` call. The factory absorbs the signature change — callers pass only `type`, and the factory handles everything else.',
      ],
      active: [
        { startLine: 1,  endLine: 9,  color: 'indigo',  label: 'Button class — hidden behind the factory' },
        { startLine: 19, endLine: 19, color: 'violet',  label: 'factory delegates to new Button' },
        { startLine: 29, endLine: 29, color: 'emerald', label: 'instanceof Button — true, class hidden from caller' },
      ],
      connections: [
        { fromLine: 22, toLine: 13, color: 'violet', label: 'createButton call', type: 'calls' },
        { fromLine: 19, toLine: 1,  color: 'indigo', label: 'factory creates Button instance', type: 'creates' },
      ],
    },
    {
      title: 'Registry — dynamic dispatch to the right class',
      semanticEvent: 'ReadProperty',
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
        'The `registry` maps type strings to **creator functions** — `createButton` simply looks up the right creator and calls it. The factory no longer knows about `Button` or `IconButton` directly; it only knows about the registry. Adding a new button type is one entry in the registry with zero changes to `createButton` itself.',
        'CS — This is the Registry + Factory pattern. The registry is a dictionary of factories indexed by key. Lookup is `O(1)`. Adding a new type is `registry[\'newType\'] = (t) => new NewClass(t, ...)` — no branching code changes. The factory function itself is now trivially small: look up, call, return.',
        'SE — This is how plugin systems work. Webpack\'s loader resolution, React\'s reconciler type dispatch, Express\'s router method registry, and Angular\'s dependency injection container all use registries. The registry lets third-party code register new types without modifying the factory\'s source. That\'s the Open/Closed Principle at the system level.',
        'Without this: without the registry, every new button type requires an `if/else` branch in `createButton`. The factory file becomes a change magnet — every developer adding a new type modifies it. With the registry, adding a type adds one line to the registry — the factory function never changes.',
      ],
      active: [
        { startLine: 22, endLine: 27, color: 'indigo',  label: 'registry — type → creator function mapping' },
        { startLine: 29, endLine: 32, color: 'violet',  label: 'createButton: look up, call, return' },
        { startLine: 38, endLine: 41, color: 'emerald', label: 'four types, two classes, one small factory' },
      ],
      connections: [
        { fromLine: 30, toLine: 22, color: 'violet', label: 'registry[type] lookup', type: 'reads' },
        { fromLine: 31, toLine: 30, color: 'indigo', label: 'maker(type) dispatches to creator', type: 'calls' },
      ],
    },
    {
      title: 'Validation — factory guards the boundary',
      semanticEvent: 'TakeBranch',
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
        'The guard clause on lines 30–32 establishes the **factory as a trust boundary**: invalid input is rejected before any construction happens. Everything inside the factory — the registry lookup, the class constructors — can trust that `key` is a valid trimmed lowercase string. The error message names both the rule violated and the actual value received.',
        'CS — Input validation at the factory boundary is the guard-clause pattern: check preconditions first, throw if violated, proceed only when safe. The factory is a trust boundary — it is the last point where untrusted external input becomes an internal object. Everything inside the factory can trust that `key` is a valid string.',
        'SE — Production factories always validate. Zod\'s `z.object()` schema factories reject invalid shapes with exact field-level error messages. Express validators validate request bodies before route handlers touch them. React\'s `PropTypes` (the runtime version) logs warnings when component factories receive wrong prop types. The pattern is: reject at the boundary, trust inside.',
        'Without this: without validation, `createButton(undefined)` calls `registry[undefined]` — returns `undefined` — then calls `undefined(type)` which throws `TypeError: undefined is not a function`. The error points deep inside the factory, not at the caller. Good validation throws early with a message that names the caller\'s mistake.',
      ],
      active: [
        { startLine: 30, endLine: 32, color: 'violet',  label: 'guard clause — invalid input rejected at boundary' },
        { startLine: 33, endLine: 33, color: 'indigo',  label: 'normalise before lookup' },
        { startLine: 47, endLine: 47, color: 'emerald', label: '"PRIMARY" → "primary" normalised correctly' },
      ],
      connections: [],
    },
    {
      title: 'Memoized factory — cache instances by type',
      semanticEvent: 'ReadProperty',
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
        'The `cache` object creates a **second lookup before construction**: if the type was already built, return the cached instance. `a` and `c` both call `createButton(\'primary\')` — the second call hits the cache and returns the same object. `a === c` is `true`. The factory now **produces** on first call and **reads** on all subsequent calls.',
        'CS — This is the Flyweight pattern combined with the Factory: a single instance is shared wherever the same type is needed. The cache is a dictionary of `type → instance`. The factory checks the cache first (`O(1)`), constructs only on a miss, then populates the cache for future hits. This eliminates redundant object allocation for identical configurations.',
        'SE — React\'s reconciler caches component types. Redux\'s `combineReducers` returns a cached reducer reference. Node.js\'s `require()` is a memoized factory — every subsequent `require(\'lodash\')` returns the cached module object. The Module Pattern is a memoized factory at the file level.',
        'Without this: without caching, `createButton(\'primary\')` called 1,000 times creates 1,000 separate `Button` objects — identical but independent. Each allocates memory. In a button library rendering thousands of UI elements, the allocation cost is significant. The cache trades memory (one object per type) for speed (zero construction on repeat calls).',
      ],
      active: [
        { startLine: 29, endLine: 29, color: 'indigo',  label: 'cache — one object per unique type' },
        { startLine: 36, endLine: 36, color: 'violet',  label: 'cache hit — return existing, skip construction' },
        { startLine: 46, endLine: 48, color: 'emerald', label: 'a === c: true — same reference returned twice' },
      ],
      connections: [
        { fromLine: 36, toLine: 29, color: 'violet', label: 'cache hit: reads existing instance', type: 'reads' },
        { fromLine: 38, toLine: 29, color: 'indigo', label: 'cache miss: writes new instance', type: 'writes' },
      ],
    },
    {
      title: 'Static factory method — construction named on the class',
      semanticEvent: 'CallFunction',
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
        'Static factory methods (`Button.primary()`) **attach the factory directly to the class** — the construction knowledge lives where the class is defined. Callers use named constructors that communicate intent (`Button.primary()` instead of `new Button(\'primary\', \'blue\', \'2px solid blue\')`). The class owns both the type definition and the named construction paths.',
        'CS — Static factory methods are the preferred approach in languages like Java, and are increasingly common in JavaScript. They have two advantages over plain factory functions: the factory\'s name makes the intent clear, and the factory lives on the class, keeping related code co-located. `Array.from()`, `Promise.resolve()`, and `Object.keys()` are static factory methods on standard library classes.',
        'SE — Named constructors are a production pattern: `Date.now()` (returns a number, not a Date), `Promise.all()`, `URL.createObjectURL()`. When a class has multiple valid construction paths — with defaults, from a string, from another instance — named static methods communicate which path you\'re taking. `Button.primary()` is more readable than `new Button(\'primary\', \'blue\', \'2px solid blue\')`.',
        'Without this: without named factory methods, complex construction requires remembering argument order — `new Button(\'primary\', \'blue\', \'2px solid blue\')`. Swap `\'blue\'` and `\'2px solid blue\'` and the class breaks silently (both are strings). Named factories like `Button.primary()` encode the defaults inside the class, where they belong.',
      ],
      active: [
        { startLine: 12, endLine: 14, color: 'indigo',  label: 'static factory methods — construction on the class' },
        { startLine: 44, endLine: 46, color: 'emerald', label: 'callers use named constructors' },
        { startLine: 50, endLine: 50, color: 'violet',  label: 'instanceof Button — true' },
      ],
      connections: [
        { fromLine: 12, toLine: 1,  color: 'indigo', label: 'Button.primary() creates Button', type: 'creates' },
        { fromLine: 44, toLine: 12, color: 'emerald', label: 'caller uses named constructor', type: 'calls' },
      ],
    },
  ],
}
