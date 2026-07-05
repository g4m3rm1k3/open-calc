export default {
  id: 'promise',
  title: 'Promise',
  tag: 'JS Fundamentals',
  steps: [
    {
      title: 'Promise — a value that arrives later',
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
        '`new Promise(executor)` creates a Promise. The executor receives two arguments: `resolve` (call with the success value) and `reject` (call with an error). `fetchUser(1)` calls `resolve({ id: 1, name: \'Alice\' })` immediately. Line 12 prints `\'object\'`. Line 13 prints `true`. The Promise object is created synchronously — the value it carries arrives asynchronously (or synchronously, as here).',
        'CS — A Promise is a state machine with three states: `pending` (initial), `fulfilled` (resolved with a value), and `rejected` (failed with a reason). Once settled, a Promise never changes state — the "resolve once" guarantee. Transitions: pending → fulfilled (via `resolve`) or pending → rejected (via `reject`).',
        'SE — Promises replaced callback-based async in JavaScript. Node.js\'s `util.promisify()` wraps callback APIs in Promises. `fetch()`, `fs.promises.readFile()`, `axios.get()`, and every modern async API return Promises. The browser\'s `IndexedDB`, `Service Worker`, and `WebCrypto` APIs all use Promises. `async/await` is syntax sugar that unwraps Promises.',
        'Without this: without Promises, async results use callbacks: `fetchUser(id, function(err, user) { ... })`. Nested callbacks ("callback hell") become unreadable and error-prone — the "pyramid of doom." A Promise represents the eventual result as a first-class value you can pass around and compose.',
      ],
      active: [
        { startLine: 1,  endLine: 9,  color: 'indigo',  label: 'Promise executor — resolve or reject' },
        { startLine: 11, endLine: 13, color: 'emerald', label: 'p is a Promise object (type: object, instanceof: true)' },
      ],
      connections: [{ fromLine: 4, toLine: 11, color: 'violet', label: 'resolve() settles the Promise as fulfilled' }],
    },
    {
      title: '.then() — handle the resolved value',
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
        '`.then(onFulfilled)` registers a callback that runs when the Promise resolves. `fetchUser(1)` resolves with `{ id: 1, name: \'Alice\' }`. The `then` callback receives that value as `user`. Line 16 prints `\'Alice\'`. Line 17 prints `1`. `.then()` returns a new Promise so calls can be chained.',
        'CS — `.then()` is the subscription mechanism. It returns a new Promise, making chaining possible. The callback is queued as a microtask — it runs after the current synchronous code finishes but before the next event loop tick (macrotasks: setTimeout, I/O). Microtasks always run before macrotasks.',
        'SE — `.then()` enables fluent async pipelines: `fetchUser(id).then(user => fetchPosts(user.id)).then(posts => render(posts))`. Libraries like Axios, Superagent, and the Fetch API chain `.then()` calls to transform responses. TypeScript\'s `Promise<T>` type tracks the resolved value type through the chain.',
        'Without this: without `.then()`, you\'d poll the Promise or pass callbacks to the constructor. The separation of "create a Promise" from "register what to do when it resolves" is key: the Promise can be passed around, stored, and composed before any `.then()` is attached. The callback is registered late; the Promise was created early.',
      ],
      active: [
        { startLine: 15, endLine: 18, color: 'violet',  label: '.then() — callback receives the resolved user object' },
        { startLine: 16, endLine: 17, color: 'emerald', label: 'Alice, 1 — printed from resolved value' },
      ],
      connections: [{ fromLine: 4, toLine: 15, color: 'violet', label: 'resolve() triggers .then() callback' }],
    },
    {
      title: '.catch() — handle rejection',
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
        '`fetchUser(-1)` calls `reject(new Error(\'Invalid user id: -1\'))`. The `.then()` on line 21 is skipped — it only runs on fulfillment. The `.catch()` on line 24 runs with the rejected reason. Line 25 prints `\'Invalid user id: -1\'`. `.catch(handler)` is shorthand for `.then(undefined, handler)` — the second argument to `.then()` is the rejection handler.',
        'CS — A rejected Promise propagates through the chain until a rejection handler is found. If there is no `.catch()`, the rejection is unhandled — Node.js 15+ terminates the process on unhandled rejections. `.catch()` handles the rejected branch and returns a new fulfilled Promise — after `.catch()`, the chain continues as fulfilled unless `.catch()` also throws.',
        'SE — Error handling in Promise chains follows "reject early, catch late": errors propagate automatically through `.then()` calls until a `.catch()` handles them. Axios wraps HTTP error responses (4xx, 5xx) as rejections. Express\'s `express-async-errors` wraps route handlers so rejected Promises reach error middleware. `window.addEventListener(\'unhandledrejection\', ...)` is the global handler for uncaught rejections.',
        'Without this: without `.catch()`, a rejected Promise with no handler is unhandled. Always attach `.catch()` to Promise chains so rejections don\'t silently disappear. Node.js exits on unhandled rejections. The browser fires an `unhandledrejection` event.',
      ],
      active: [
        { startLine: 20, endLine: 26, color: 'violet',  label: '.catch() — handles the rejected Promise' },
        { startLine: 25, endLine: 25, color: 'emerald', label: '"Invalid user id: -1" — rejection reason printed' },
      ],
      connections: [{ fromLine: 6, toLine: 24, color: 'violet', label: 'reject() skips .then(), triggers .catch()' }],
    },
    {
      title: 'Chained .then() — transform values through the pipeline',
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
        'Three `.then()` calls chain: the first receives `user`, logs it, and returns `fetchPosts(user.id)` — another Promise. When `fetchPosts` resolves, the second `.then()` receives `posts` (array of 2). It returns an array of titles. The third `.then()` receives the titles. Output: `\'got user: Alice\'`, `\'got posts: 2\'`, `\'Hello World\'`, `\'Second Post\'`. Any rejection propagates to `.catch()`.',
        'CS — When a `.then()` callback returns a Promise, the chain waits for that Promise to settle before calling the next `.then()`. When a callback returns a plain value, the next `.then()` receives it directly. This "thenable" protocol prevents `Promise<Promise<User>>` nesting — the chain flattens nested Promises automatically.',
        'SE — Promise chains are the standard async pipeline pattern. Axios interceptors (`axios.interceptors.request.use(config => ...)`) are `.then()` callbacks injected into every request chain. Middleware in Koa 2 chains `await next()` calls. The fetch/transform/render pattern is three chained Promises: fetch data → transform → update DOM.',
        'Without this: without chaining, sequential async operations nest: `.then(user => { fetchPosts(user.id).then(posts => { ... }) })`. The nesting grows with each async step — the callback pyramid returns. Chaining keeps every step at the same indentation level, reading sequentially despite being async.',
      ],
      active: [
        { startLine: 20, endLine: 34, color: 'violet',  label: 'three .then() steps — each transforms and returns' },
        { startLine: 23, endLine: 23, color: 'indigo',  label: 'return a Promise — chain waits for it' },
        { startLine: 27, endLine: 27, color: 'emerald', label: 'return a plain value — next then receives it directly' },
      ],
      connections: [{ fromLine: 23, toLine: 12, color: 'violet', label: '.then returns Promise → chain waits' }],
    },
    {
      title: 'Promise.all() — run in parallel, wait for all',
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
        '`Promise.all([p1, p2, p3])` runs all three Promises and returns a new Promise that resolves when ALL resolve — with an array of results in input order. Line 19 prints `3`. Lines 20–22 print `\'User-1\'`, `\'User-2\'`, `\'User-3\'`. `Promise.all([fetchUser(1), fetchUser(-1)])` rejects because `fetchUser(-1)` rejects — line 26 prints `\'Invalid id: -1\'`. One rejection rejects the whole `Promise.all`.',
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
        '`Promise.race([...])` resolves/rejects as soon as the FIRST Promise settles. All three are synchronous here, so `slow(\'A\', 1)` wins (first in array). Line 25 prints `\'A\'`, line 26 prints `1`. `Promise.allSettled` waits for ALL Promises and never itself rejects — each result has `status`. Lines 30–35 print `\'ok: User-1\'`, `\'fail: Invalid id: -1\'`, `\'ok: User-2\'`.',
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
