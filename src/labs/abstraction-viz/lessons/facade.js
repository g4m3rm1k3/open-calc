export default {
  id: 'facade',
  title: 'Facade Pattern',
  tag: 'Design Pattern',
  steps: [
    {
      title: 'The problem — many subsystems to coordinate',
      code:
`class CPU {
  freeze()  { return 'CPU frozen' }
  jump(pos) { return 'CPU jumped to ' + pos }
  execute() { return 'CPU executing' }
}

class Memory {
  load(pos, data) { return 'Memory loaded: ' + data + ' at ' + pos }
}

class HardDrive {
  read(lba, size) { return 'HardDrive read ' + size + ' bytes from lba ' + lba }
}

const cpu    = new CPU()
const memory = new Memory()
const hd     = new HardDrive()

console.log(cpu.freeze())
console.log(hd.read(0, 512))
console.log(memory.load(0, 'boot-data'))
console.log(cpu.jump(0))
console.log(cpu.execute())`,
      explanation: [
        'Three subsystems — `CPU`, `Memory`, `HardDrive` — each with their own API. Booting a computer requires orchestrating all three in a specific sequence. Lines 18–22 print the five steps in order. Without a Facade, every caller who wants to "boot" must know this sequence, the correct arguments, and the right order. If the sequence changes, every caller changes.',
        'CS — The Facade pattern provides a simplified interface to a complex subsystem. The facade itself is a class or object that coordinates multiple subsystem classes behind a single, higher-level method. Callers interact with the facade — the subsystems are hidden. This is a structural pattern: it simplifies the interface without changing the underlying behaviour.',
        'SE — `axios.get(url)` is a facade over `XMLHttpRequest` (or `node:http`), headers, serialisation, response parsing, and error normalisation. `mongoose.connect()` is a facade over the MongoDB driver, connection pooling, and authentication. `React.render()` is a facade over the virtual DOM reconciler, fiber scheduler, and DOM commit phase. Every library\'s public API is a facade.',
        'Without this: without the facade, every feature that needs to "boot" the computer duplicates the five-step sequence. If step 3 changes (e.g., memory must be loaded from position 1024 instead of 0), all callers must be updated. The facade centralises the sequence — one change fixes all callers.',
      ],
      active: [
        { startLine: 1,  endLine: 13, color: 'indigo',  label: 'three subsystems — each with its own interface' },
        { startLine: 15, endLine: 22, color: 'emerald', label: 'caller orchestrates 5 steps manually — knowledge leak' },
      ],
      connections: [],
    },
    {
      title: 'Facade — one method hides the complexity',
      code:
`class CPU {
  freeze()  { return 'CPU frozen' }
  jump(pos) { return 'CPU jumped to ' + pos }
  execute() { return 'CPU executing' }
}

class Memory {
  load(pos, data) { return 'Memory loaded: ' + data + ' at ' + pos }
}

class HardDrive {
  read(lba, size) { return 'HardDrive read ' + size + ' bytes from lba ' + lba }
}

class ComputerFacade {
  constructor() {
    this.cpu    = new CPU()
    this.memory = new Memory()
    this.hd     = new HardDrive()
  }

  start() {
    const steps = []
    steps.push(this.cpu.freeze())
    steps.push(this.hd.read(0, 512))
    steps.push(this.memory.load(0, 'boot-data'))
    steps.push(this.cpu.jump(0))
    steps.push(this.cpu.execute())
    return steps
  }
}

const computer = new ComputerFacade()
const log = computer.start()
console.log(log[0])
console.log(log[1])
console.log(log[2])
console.log(log.length)`,
      explanation: [
        '`ComputerFacade` owns instances of all three subsystems. `start()` calls them in the correct order, collects results, and returns them. The caller writes `computer.start()` — one method, no knowledge of subsystem APIs, no ordering logic, no arguments to remember. Lines 35–38 print the four steps and the count `5`. The caller is completely isolated from the subsystem details.',
        'CS — The facade owns the subsystem instances and knows the interaction protocol. Callers get a simplified interface. Subsystems can be refactored (e.g., `CPU.freeze` renamed) without any caller changes — only the facade updates. This is the encapsulation principle applied at the module level: the facade is the subsystem\'s public interface.',
        'SE — `knex(\'users\').where({ active: true }).select()` is a query builder facade hiding SQL string construction, parameter binding, and connection management. `bcrypt.hash(password, 10)` is a facade over salt generation, multiple hash rounds, and encoding. `JSON.parse()` and `JSON.stringify()` are facades over a full JSON parser/serialiser. Every stdlib function is a facade.',
        'Without this: without the facade, adding a new boot step (e.g., `this.gpu.init()`) requires updating every file that boots the computer. With the facade, one change in `start()` propagates everywhere. This is the "one place to change" principle — the facade becomes the single authority for "how to start the computer."',
      ],
      active: [
        { startLine: 15, endLine: 30, color: 'violet',  label: 'ComputerFacade — owns subsystems, exposes start()' },
        { startLine: 33, endLine: 38, color: 'emerald', label: 'caller: one method, full boot sequence hidden' },
      ],
      connections: [{ fromLine: 22, toLine: 1, color: 'violet', label: 'start() orchestrates all three subsystems' }],
    },
    {
      title: 'Facade with options — flexible but still simple',
      code:
`class CPU {
  freeze()  { return 'CPU frozen' }
  jump(pos) { return 'CPU jumped to ' + pos }
  execute() { return 'CPU executing' }
}

class Memory {
  load(pos, data) { return 'Memory loaded: ' + data + ' at ' + pos }
}

class HardDrive {
  read(lba, size) { return 'HardDrive read ' + size + ' bytes from lba ' + lba }
}

class ComputerFacade {
  constructor() {
    this.cpu = new CPU(); this.memory = new Memory(); this.hd = new HardDrive()
  }

  start(options) {
    options = options || {}
    const bootPos  = options.bootPos  || 0
    const bootSize = options.bootSize || 512
    const bootData = options.bootData || 'boot-data'
    const steps = []
    steps.push(this.cpu.freeze())
    steps.push(this.hd.read(bootPos, bootSize))
    steps.push(this.memory.load(bootPos, bootData))
    steps.push(this.cpu.jump(bootPos))
    steps.push(this.cpu.execute())
    return steps
  }
}

const computer = new ComputerFacade()
const log1 = computer.start()
const log2 = computer.start({ bootPos: 1024, bootSize: 1024, bootData: 'custom-os' })
console.log(log1[1])
console.log(log2[1])
console.log(log1.length)`,
      explanation: [
        '`start(options)` now accepts optional configuration with defaults. `computer.start()` uses defaults: bootPos 0, bootSize 512, bootData `\'boot-data\'`. `computer.start({ bootPos: 1024, bootSize: 1024, bootData: \'custom-os\' })` uses custom values. Line 39 prints the default hard drive read. Line 40 prints the custom hard drive read. Line 41 prints `5`. The caller still writes one line — complexity stays hidden.',
        'CS — Options objects with defaults are the idiomatic JavaScript way to handle optional parameters. `options || {}` handles a missing argument. `options.bootPos || 0` provides a default value. This pattern is equivalent to named parameters with defaults in Python or keyword arguments in Ruby. The facade interface grows to accommodate configuration without exposing subsystem internals.',
        'SE — Express\'s `app.use(cors({ origin: \'https://example.com\', credentials: true }))` is a facade method with options. Webpack\'s configuration object (`webpack({ entry, output, module, plugins })`) is a facade over the entire compilation pipeline. `new URL(input, base)` has a default base. Options objects make facades flexible without requiring callers to learn the subsystem.',
        'Without this: without defaults, every `start()` call must provide all arguments — even the common case. `computer.start(0, 512, \'boot-data\')` is opaque (what does 512 mean?). `start({ bootPos: 1024, bootSize: 1024 })` is self-documenting — the option names make the call readable. Options objects are the standard "named parameter" idiom in JavaScript.',
      ],
      active: [
        { startLine: 20, endLine: 31, color: 'violet',  label: 'start(options) — defaults + customisation' },
        { startLine: 36, endLine: 41, color: 'emerald', label: 'default vs custom boot — same interface, different behaviour' },
      ],
      connections: [],
    },
    {
      title: 'Facade for an HTTP client subsystem',
      code:
`class CPU {
  freeze()  { return 'CPU frozen' }
  jump(pos) { return 'CPU jumped to ' + pos }
  execute() { return 'CPU executing' }
}

class Memory {
  load(pos, data) { return 'Memory loaded: ' + data + ' at ' + pos }
}

class HardDrive {
  read(lba, size) { return 'HardDrive read ' + size + ' bytes from lba ' + lba }
}

class ComputerFacade {
  constructor() { this.cpu=new CPU(); this.memory=new Memory(); this.hd=new HardDrive() }
  start(opts) {
    opts = opts||{}; const p=opts.bootPos||0; const s=opts.bootSize||512; const d=opts.bootData||'boot-data'
    return [this.cpu.freeze(), this.hd.read(p,s), this.memory.load(p,d), this.cpu.jump(p), this.cpu.execute()]
  }
}

class ApiClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl
    this.token   = token
    this.headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
  }

  _buildUrl(path, params) {
    var url = this.baseUrl + path
    if (params) {
      var qs = Object.keys(params).map(function(k) { return k + '=' + params[k] }).join('&')
      url += '?' + qs
    }
    return url
  }

  get(path, params) {
    return { method: 'GET', url: this._buildUrl(path, params), headers: this.headers }
  }

  post(path, body) {
    return { method: 'POST', url: this._buildUrl(path), headers: this.headers, body: JSON.stringify(body) }
  }
}

const api = new ApiClient('https://api.example.com', 'secret-token')
const getReq  = api.get('/users', { page: 1, limit: 10 })
const postReq = api.post('/users', { name: 'Alice', age: 25 })
console.log(getReq.method)
console.log(getReq.url)
console.log(postReq.method)
console.log(postReq.body)`,
      explanation: [
        '`ApiClient` is a facade over URL construction, header management, and body serialisation. `api.get(\'/users\', { page: 1, limit: 10 })` builds the full request object without the caller touching URLs, headers, or `JSON.stringify`. Line 51 prints `\'GET\'`. Line 52 prints `\'https://api.example.com/users?page=1&limit=10\'`. Line 53 prints `\'POST\'`. Line 54 prints `\'{"name":"Alice","age":25}\'`.',
        'CS — `ApiClient` is a thin facade: it wraps the raw request-building mechanics but does not add business logic. The `_buildUrl` private method is an implementation detail (the `_` prefix is a convention for "internal"). The public methods (`get`, `post`) are the facade interface. The caller never touches `_buildUrl`, `this.baseUrl`, or `this.headers` directly.',
        'SE — `axios.create({ baseURL: url, headers: { Authorization: token } })` is exactly this pattern — a configured Axios instance that is a facade over raw HTTP. `fetch` with an `AbortController`, custom headers, and JSON body parsing is ~20 lines; `ApiClient.post` collapses it to one. Every SDK (Stripe, Twilio, GitHub) is an `ApiClient` facade over their REST API.',
        'Without this: without `ApiClient`, every API call in the codebase manually constructs the auth header, builds the URL with query parameters, and stringifies the body. 50 API calls = 50 repetitions of header construction. Change the token format and every call must be updated. The facade centralises all of this in one place.',
      ],
      active: [
        { startLine: 23, endLine: 46, color: 'violet',  label: 'ApiClient — facade over URL, headers, serialisation' },
        { startLine: 48, endLine: 54, color: 'emerald', label: 'caller writes get()/post() — all plumbing hidden' },
      ],
      connections: [{ fromLine: 38, toLine: 29, color: 'violet', label: 'get() delegates to _buildUrl internally' }],
    },
  ],
}
