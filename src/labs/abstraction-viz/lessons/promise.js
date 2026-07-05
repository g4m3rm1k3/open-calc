export default {
  id: 'promise',
  title: 'Promise',
  tag: 'JS Fundamentals',
  steps: [
    {
      title: 'Promise — a value that arrives later',
      semanticEvent: 'CreateObject',
      code:
`function fetchUser(id) {
  return new Promise(function(resolve, reject) {
    if (id > 0) {
      resolve({ id: id, name: 'Alice' })
    } else {
      reject(new Error('Invalid user id: ' + id))
    }
  })
}

const p = fetchUser(1)
console.log(typeof p)
console.log(p instanceof Promise)`,
      runCode:
`class Promise {
  constructor(exec) {
    this._s='pending';this._v=undefined;this._e=undefined
    var self=this
    function resolve(v){self._v=v;self._s='fulfilled'}
    function reject(e){self._e=e;self._s='rejected'}
    exec(resolve,reject)
  }
  then(onOk,onErr){
    var self=this
    return new Promise(function(res,rej){
      if(self._s==='fulfilled'){try{res(onOk?onOk(self._v):self._v)}catch(e){rej(e)}}
      else{if(onErr){try{res(onErr(self._e))}catch(e){rej(e)}}else rej(self._e)}
    })
  }
  catch(fn){return this.then(undefined,fn)}
}
function fetchUser(id) {
  return new Promise(function(resolve, reject) {
    if (id > 0) { resolve({ id: id, name: 'Alice' }) }
    else { reject({ message: 'Invalid user id: ' + id }) }
  })
}
var p = fetchUser(1)
console.log(typeof p)
console.log(p instanceof Promise)`,
      explanation: [
        '`new Promise(executor)` establishes the **resolve/reject state machine**: the executor receives `resolve` (call with the success value) and `reject` (call with an error). `fetchUser(1)` immediately calls `resolve({ id: 1, name: \'Alice\' })`. The resulting `p` is an object (`typeof` returns `\'object\'`) and is an instance of `Promise` (`instanceof` returns `true`).',
        'CS — A Promise is a state machine with three states: `pending` (initial), `fulfilled` (resolved with a value), and `rejected` (failed with a reason). Once settled, a Promise never changes state — the "resolve once" guarantee. Transitions: pending → fulfilled (via `resolve`) or pending → rejected (via `reject`).',
        'SE — Promises replaced callback-based async in JavaScript. Node.js\'s `util.promisify()` wraps callback APIs in Promises. `fetch()`, `fs.promises.readFile()`, `axios.get()`, and every modern async API return Promises. The browser\'s `IndexedDB`, `Service Worker`, and `WebCrypto` APIs all use Promises. `async/await` is syntax sugar that unwraps Promises.',
        'Without this: without Promises, async results use callbacks: `fetchUser(id, function(err, user) { ... })`. Nested callbacks ("callback hell") become unreadable and error-prone — the "pyramid of doom." A Promise represents the eventual result as a first-class value you can pass around and compose.',
      ],
      active: [
        { startLine: 1,  endLine: 9,  color: 'indigo',  label: 'Promise executor — resolve or reject' },
        { startLine: 11, endLine: 13, color: 'emerald', label: 'p is a Promise object (type: object, instanceof: true)' },
      ],
      connections: [{ fromLine: 4, toLine: 11, color: 'violet', label: 'resolve() settles the Promise as fulfilled', type: 'calls' }],
    },
    {
      title: '.then() — handle the resolved value',
      semanticEvent: 'CallFunction',
      code:
`function fetchUser(id) {
  return new Promise(function(resolve, reject) {
    if (id > 0) {
      resolve({ id: id, name: 'Alice' })
    } else {
      reject(new Error('Invalid user id: ' + id))
    }
  })
}

const p = fetchUser(1)
console.log(typeof p)
console.log(p instanceof Promise)

fetchUser(1).then(function(user) {
  console.log(user.name)
  console.log(user.id)
})`,
      runCode:
`class Promise {
  constructor(exec) {
    this._s='pending';this._v=undefined;this._e=undefined
    var self=this
    function resolve(v){self._v=v;self._s='fulfilled'}
    function reject(e){self._e=e;self._s='rejected'}
    exec(resolve,reject)
  }
  then(onOk,onErr){
    var self=this
    return new Promise(function(res,rej){
      if(self._s==='fulfilled'){try{res(onOk?onOk(self._v):self._v)}catch(e){rej(e)}}
      else{if(onErr){try{res(onErr(self._e))}catch(e){rej(e)}}else rej(self._e)}
    })
  }
  catch(fn){return this.then(undefined,fn)}
}
function fetchUser(id) {
  return new Promise(function(resolve, reject) {
    if (id > 0) { resolve({ id: id, name: 'Alice' }) }
    else { reject({ message: 'Invalid user id: ' + id }) }
  })
}
var p = fetchUser(1)
console.log(typeof p)
console.log(p instanceof Promise)
fetchUser(1).then(function(user) {
  console.log(user.name)
  console.log(user.id)
})`,
      explanation: [
        '`.then(onFulfilled)` establishes the **fulfillment subscription**: when the Promise resolves, `onFulfilled` receives the resolved value as `user`. `fetchUser(1)` resolves with `{ id: 1, name: \'Alice\' }` — the callback prints `\'Alice\'` and `1`. `.then()` returns a new Promise so calls can be chained.',
        'CS — `.then()` is the subscription mechanism. It returns a new Promise, making chaining possible. The callback is queued as a microtask — it runs after the current synchronous code finishes but before the next event loop tick (macrotasks: setTimeout, I/O). Microtasks always run before macrotasks.',
        'SE — `.then()` enables fluent async pipelines: `fetchUser(id).then(user => fetchPosts(user.id)).then(posts => render(posts))`. Libraries like Axios, Superagent, and the Fetch API chain `.then()` calls to transform responses. TypeScript\'s `Promise<T>` type tracks the resolved value type through the chain.',
        'Without this: without `.then()`, you\'d poll the Promise or pass callbacks to the constructor. The separation of "create a Promise" from "register what to do when it resolves" is key: the Promise can be passed around, stored, and composed before any `.then()` is attached. The callback is registered late; the Promise was created early.',
      ],
      active: [
        { startLine: 15, endLine: 18, color: 'violet',  label: '.then() — callback receives the resolved user object' },
        { startLine: 16, endLine: 17, color: 'emerald', label: 'Alice, 1 — printed from resolved value' },
      ],
      connections: [{ fromLine: 4, toLine: 15, color: 'violet', label: 'resolve() triggers .then() callback', type: 'calls' }],
    },
    {
      title: '.catch() — handle rejection',
      semanticEvent: 'CallFunction',
      code:
`function fetchUser(id) {
  return new Promise(function(resolve, reject) {
    if (id > 0) {
      resolve({ id: id, name: 'Alice' })
    } else {
      reject(new Error('Invalid user id: ' + id))
    }
  })
}

const p = fetchUser(1)
console.log(typeof p)
console.log(p instanceof Promise)

fetchUser(1).then(function(user) {
  console.log(user.name)
  console.log(user.id)
})

fetchUser(-1)
  .then(function(user) {
    console.log(user.name)
  })
  .catch(function(err) {
    console.log(err.message)
  })`,
      runCode:
`class Promise {
  constructor(exec) {
    this._s='pending';this._v=undefined;this._e=undefined
    var self=this
    function resolve(v){self._v=v;self._s='fulfilled'}
    function reject(e){self._e=e;self._s='rejected'}
    exec(resolve,reject)
  }
  then(onOk,onErr){
    var self=this
    return new Promise(function(res,rej){
      if(self._s==='fulfilled'){try{res(onOk?onOk(self._v):self._v)}catch(e){rej(e)}}
      else{if(onErr){try{res(onErr(self._e))}catch(e){rej(e)}}else rej(self._e)}
    })
  }
  catch(fn){return this.then(undefined,fn)}
}
function fetchUser(id) {
  return new Promise(function(resolve, reject) {
    if (id > 0) { resolve({ id: id, name: 'Alice' }) }
    else { reject({ message: 'Invalid user id: ' + id }) }
  })
}
fetchUser(1).then(function(user){ console.log(user.name); console.log(user.id) })
fetchUser(-1).then(function(user){ console.log(user.name) }).catch(function(e){ console.log(e.message) })`,
      explanation: [
        '`.catch(handler)` establishes the **rejection routing contract**: `fetchUser(-1)` calls `reject(new Error(...))`, which skips all `.then()` handlers and routes to the `.catch()`. The handler receives the rejection reason and prints `\'Invalid user id: -1\'`. `.catch(fn)` is shorthand for `.then(undefined, fn)`.',
        'CS — A rejected Promise propagates through the chain until a rejection handler is found. If there is no `.catch()`, the rejection is unhandled — Node.js 15+ terminates the process on unhandled rejections. `.catch()` handles the rejected branch and returns a new fulfilled Promise — after `.catch()`, the chain continues as fulfilled unless `.catch()` also throws.',
        'SE — Error handling in Promise chains follows "reject early, catch late": errors propagate automatically through `.then()` calls until a `.catch()` handles them. Axios wraps HTTP error responses (4xx, 5xx) as rejections. Express\'s `express-async-errors` wraps route handlers so rejected Promises reach error middleware. `window.addEventListener(\'unhandledrejection\', ...)` is the global handler for uncaught rejections.',
        'Without this: without `.catch()`, a rejected Promise with no handler is unhandled. Always attach `.catch()` to Promise chains so rejections don\'t silently disappear. Node.js exits on unhandled rejections. The browser fires an `unhandledrejection` event.',
      ],
      active: [
        { startLine: 20, endLine: 26, color: 'violet',  label: '.catch() — handles the rejected Promise' },
        { startLine: 25, endLine: 25, color: 'emerald', label: '"Invalid user id: -1" — rejection reason printed' },
      ],
      connections: [{ fromLine: 6, toLine: 24, color: 'violet', label: 'reject() skips .then(), triggers .catch()', type: 'calls' }],
    },
    {
      title: 'Chained .then() — transform values through the pipeline',
      semanticEvent: 'CallFunction',
      code:
`function fetchUser(id) {
  return new Promise(function(resolve, reject) {
    if (id > 0) {
      resolve({ id: id, name: 'Alice' })
    } else {
      reject(new Error('Invalid user id: ' + id))
    }
  })
}

function fetchPosts(userId) {
  return new Promise(function(resolve) {
    resolve([
      { id: 1, title: 'Hello World', userId: userId },
      { id: 2, title: 'Second Post', userId: userId },
    ])
  })
}

fetchUser(1)
  .then(function(user) {
    console.log('got user: ' + user.name)
    return fetchPosts(user.id)
  })
  .then(function(posts) {
    console.log('got posts: ' + posts.length)
    return posts.map(function(p) { return p.title })
  })
  .then(function(titles) {
    console.log(titles[0])
    console.log(titles[1])
  })
  .catch(function(err) {
    console.log('Error: ' + err.message)
  })`,
      runCode:
`class Promise {
  constructor(exec) {
    this._s='pending';this._v=undefined;this._e=undefined
    var self=this
    function resolve(v){
      if(v instanceof Promise){v.then(resolve,reject)}
      else{self._v=v;self._s='fulfilled'}
    }
    function reject(e){self._e=e;self._s='rejected'}
    exec(resolve,reject)
  }
  then(onOk,onErr){
    var self=this
    return new Promise(function(res,rej){
      if(self._s==='fulfilled'){try{res(onOk?onOk(self._v):self._v)}catch(e){rej(e)}}
      else{if(onErr){try{res(onErr(self._e))}catch(e){rej(e)}}else rej(self._e)}
    })
  }
  catch(fn){return this.then(undefined,fn)}
}
function fetchUser(id) {
  return new Promise(function(resolve, reject) {
    if (id > 0) { resolve({ id: id, name: 'Alice' }) }
    else { reject({ message: 'Invalid user id: ' + id }) }
  })
}
function fetchPosts(userId) {
  return new Promise(function(resolve) {
    resolve([{id:1,title:'Hello World',userId:userId},{id:2,title:'Second Post',userId:userId}])
  })
}
fetchUser(1)
  .then(function(user) { console.log('got user: ' + user.name); return fetchPosts(user.id) })
  .then(function(posts) { console.log('got posts: ' + posts.length); return posts.map(function(p){return p.title}) })
  .then(function(titles) { console.log(titles[0]); console.log(titles[1]) })
  .catch(function(err) { console.log('Error: ' + err.message) })`,
      explanation: [
        'Three chained `.then()` calls establish the **sequential async pipeline**: each step receives the previous step\'s return value. Returning a Promise from `.then()` (line 23) makes the chain wait for that Promise before calling the next handler. Returning a plain value passes it directly. Output: `\'got user: Alice\'`, `\'got posts: 2\'`, `\'Hello World\'`, `\'Second Post\'`.',
        'CS — When a `.then()` callback returns a Promise, the chain waits for that Promise to settle before calling the next `.then()`. When a callback returns a plain value, the next `.then()` receives it directly. This "thenable" protocol prevents `Promise<Promise<User>>` nesting — the chain flattens nested Promises automatically.',
        'SE — Promise chains are the standard async pipeline pattern. Axios interceptors (`axios.interceptors.request.use(config => ...)`) are `.then()` callbacks injected into every request chain. Middleware in Koa 2 chains `await next()` calls. The fetch/transform/render pattern is three chained Promises: fetch data → transform → update DOM.',
        'Without this: without chaining, sequential async operations nest: `.then(user => { fetchPosts(user.id).then(posts => { ... }) })`. The nesting grows with each async step — the callback pyramid returns. Chaining keeps every step at the same indentation level, reading sequentially despite being async.',
      ],
      active: [
        { startLine: 20, endLine: 34, color: 'violet',  label: 'three .then() steps — each transforms and returns' },
        { startLine: 23, endLine: 23, color: 'indigo',  label: 'return a Promise — chain waits for it' },
        { startLine: 27, endLine: 27, color: 'emerald', label: 'return a plain value — next then receives it directly' },
      ],
      connections: [{ fromLine: 23, toLine: 12, color: 'violet', label: '.then returns Promise → chain waits', type: 'calls' }],
    },
    {
      title: 'Promise.all() — run in parallel, wait for all',
      semanticEvent: 'CallFunction',
      code:
`function fetchUser(id) {
  return new Promise(function(resolve, reject) {
    if (id > 0) {
      resolve({ id: id, name: 'User-' + id })
    } else {
      reject(new Error('Invalid id: ' + id))
    }
  })
}

function fetchPosts(userId) {
  return new Promise(function(resolve) {
    resolve([{ id: 1, title: 'Post by ' + userId }])
  })
}

Promise.all([fetchUser(1), fetchUser(2), fetchUser(3)])
  .then(function(users) {
    console.log(users.length)
    console.log(users[0].name)
    console.log(users[1].name)
    console.log(users[2].name)
  })

Promise.all([fetchUser(1), fetchUser(-1)])
  .catch(function(err) {
    console.log(err.message)
  })`,
      runCode:
`class Promise {
  constructor(exec) {
    this._s='pending';this._v=undefined;this._e=undefined
    var self=this
    function resolve(v){self._v=v;self._s='fulfilled'}
    function reject(e){self._e=e;self._s='rejected'}
    exec(resolve,reject)
  }
  then(onOk,onErr){
    var self=this
    return new Promise(function(res,rej){
      if(self._s==='fulfilled'){try{res(onOk?onOk(self._v):self._v)}catch(e){rej(e)}}
      else{if(onErr){try{res(onErr(self._e))}catch(e){rej(e)}}else rej(self._e)}
    })
  }
  catch(fn){return this.then(undefined,fn)}
  static all(ps){
    return new Promise(function(res,rej){
      var results=[],count=0
      ps.forEach(function(p){
        p.then(function(v){results.push(v);count++;if(count===ps.length)res(results)})
         .catch(function(e){rej(e)})
      })
    })
  }
}
function fetchUser(id) {
  return new Promise(function(resolve, reject) {
    if (id > 0) { resolve({ id: id, name: 'User-' + id }) }
    else { reject({ message: 'Invalid id: ' + id }) }
  })
}
Promise.all([fetchUser(1), fetchUser(2), fetchUser(3)]).then(function(users) {
  console.log(users.length)
  console.log(users[0].name)
  console.log(users[1].name)
  console.log(users[2].name)
})
Promise.all([fetchUser(1), fetchUser(-1)]).catch(function(err) { console.log(err.message) })`,
      explanation: [
        '`Promise.all([...])` establishes the **parallel execution contract**: all three Promises run concurrently and the result resolves when ALL resolve — with results in input order. `[fetchUser(1), fetchUser(2), fetchUser(3)]` resolves with an array of 3 users. `[fetchUser(1), fetchUser(-1)]` rejects immediately because `fetchUser(-1)` rejects — one rejection rejects the whole `Promise.all`.',
        'CS — `Promise.all` is the "fan-out, fan-in" pattern. Fan-out: dispatch multiple operations concurrently. Fan-in: collect all results when done. The result array preserves input order. Contrast with sequential chains: `all` waits for the slowest; sequential waits for each before starting the next.',
        'SE — `Promise.all` is used in every batched data-fetching scenario: load all user details for a dashboard in one parallel batch, then render. `Promise.allSettled()` is the variant that waits for all and never rejects — each result is `{ status: \'fulfilled\', value }` or `{ status: \'rejected\', reason }`. React Query\'s parallel queries and Next.js\'s `Promise.all([fetch(url1), fetch(url2)])` use this pattern.',
        'Without this: without `Promise.all`, fetching 3 users sequentially takes 3× as long. With `Promise.all`, all three start immediately — total time is the slowest request, not the sum. For a dashboard loading 10 resources, the difference is 10 seconds (sequential) vs. ~1 second (parallel).',
      ],
      active: [
        { startLine: 17, endLine: 23, color: 'violet',  label: 'Promise.all — all resolve → array of results' },
        { startLine: 25, endLine: 27, color: 'indigo',  label: 'one rejection → entire Promise.all rejects' },
        { startLine: 19, endLine: 22, color: 'emerald', label: '3 users returned; then rejection example' },
      ],
      connections: [],
    },
    {
      title: 'Promise.race() and Promise.allSettled()',
      semanticEvent: 'CallFunction',
      code:
`function fetchUser(id) {
  return new Promise(function(resolve, reject) {
    if (id > 0) {
      resolve({ id: id, name: 'User-' + id })
    } else {
      reject(new Error('Invalid id: ' + id))
    }
  })
}

function slow(label, value) {
  return new Promise(function(resolve) {
    resolve({ label: label, value: value })
  })
}

function fast(label, value) {
  return new Promise(function(resolve) {
    resolve({ label: label, value: value })
  })
}

Promise.race([slow('A', 1), fast('B', 2), slow('C', 3)])
  .then(function(winner) {
    console.log(winner.label)
    console.log(winner.value)
  })

Promise.allSettled([fetchUser(1), fetchUser(-1), fetchUser(2)])
  .then(function(results) {
    results.forEach(function(r) {
      if (r.status === 'fulfilled') {
        console.log('ok: ' + r.value.name)
      } else {
        console.log('fail: ' + r.reason.message)
      }
    })
  })`,
      runCode:
`class Promise {
  constructor(exec) {
    this._s='pending';this._v=undefined;this._e=undefined
    var self=this
    function resolve(v){self._v=v;self._s='fulfilled'}
    function reject(e){self._e=e;self._s='rejected'}
    exec(resolve,reject)
  }
  then(onOk,onErr){
    var self=this
    return new Promise(function(res,rej){
      if(self._s==='fulfilled'){try{res(onOk?onOk(self._v):self._v)}catch(e){rej(e)}}
      else{if(onErr){try{res(onErr(self._e))}catch(e){rej(e)}}else rej(self._e)}
    })
  }
  catch(fn){return this.then(undefined,fn)}
  static race(ps){
    return new Promise(function(res,rej){
      var done=false
      ps.forEach(function(p){
        p.then(function(v){if(!done){done=true;res(v)}})
         .catch(function(e){if(!done){done=true;rej(e)}})
      })
    })
  }
  static allSettled(ps){
    return new Promise(function(res){
      var results=[],count=0
      ps.forEach(function(p){
        p.then(function(v){results.push({status:'fulfilled',value:v});count++;if(count===ps.length)res(results)})
         .catch(function(e){results.push({status:'rejected',reason:e});count++;if(count===ps.length)res(results)})
      })
    })
  }
}
function fetchUser(id){return new Promise(function(resolve,reject){if(id>0)resolve({id:id,name:'User-'+id});else reject({message:'Invalid id: '+id})})}
function makeP(label,value){return new Promise(function(resolve){resolve({label:label,value:value})})}
Promise.race([makeP('A',1),makeP('B',2),makeP('C',3)]).then(function(winner){
  console.log(winner.label)
  console.log(winner.value)
})
Promise.allSettled([fetchUser(1),fetchUser(-1),fetchUser(2)]).then(function(results){
  results.forEach(function(r){
    if(r.status==='fulfilled') console.log('ok: '+r.value.name)
    else console.log('fail: '+r.reason.message)
  })
})`,
      explanation: [
        '`Promise.race([...])` and `Promise.allSettled([...])` establish two **composition contracts**: `race` settles as soon as the first Promise settles (`\'A\'` wins, being first in the array); `allSettled` waits for all and never rejects itself — each result carries a `status` of `\'fulfilled\'` or `\'rejected\'`. Output: `\'A\'`, `1`, `\'ok: User-1\'`, `\'fail: Invalid id: -1\'`, `\'ok: User-2\'`.',
        'CS — `Promise.race` implements "first wins" — useful for timeouts: `Promise.race([fetchData(), timeout(5000)])` where `timeout(5000)` rejects after 5 seconds. `allSettled` implements "wait for all, report each" — no result is lost. `any` (ES2021) resolves with the first success, ignoring failures until all fail.',
        'SE — `Promise.race` is used for timeout patterns: `const result = await Promise.race([apiCall(), timeout(3000)])`. `allSettled` is used for "try all, report failures" batch operations — loading images where some might 404, or parallel API calls where partial failures are acceptable.',
        'Without this: without `race`, implementing a timeout requires a manual timer check wrapped around the chain. Without `allSettled`, you need a custom counter and array to collect all results regardless of success/failure. These combinators are the standard vocabulary for composing Promise flows.',
      ],
      active: [
        { startLine: 23, endLine: 27, color: 'violet',  label: 'Promise.race — first to settle wins' },
        { startLine: 28, endLine: 36, color: 'indigo',  label: 'allSettled — all results, fulfilled or rejected' },
        { startLine: 25, endLine: 26, color: 'emerald', label: 'A wins race; ok/fail/ok from allSettled' },
      ],
      connections: [],
    },
  ],
}
