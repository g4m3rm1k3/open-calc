export default {
  id: 'scope-chain',
  title: 'Scope Chain',
  tag: 'Scope',
  steps: [
    {
      title: 'Global scope — the outermost environment',
      code:
`let appName = 'MyApp'
console.log(appName)`,
      explanation: [
        'Every JavaScript program has one global scope — the outermost namespace that lives for the entire lifetime of the program. Any variable declared at the top level becomes part of this global environment.',
        'console.log(appName) triggers a scope chain lookup. The engine checks the current scope — global, since we are not inside any function. It finds appName = \'MyApp\' and logs it. There is no outer scope to walk to; global is the end of the chain.',
        'CS — Each scope is a data structure mapping names to values. In compiler theory this is called a symbol table or environment. A ReferenceError means the lookup walked the entire chain and found no binding for that name.',
        'SE — Global variables are accessible everywhere, which also means they can be overwritten from anywhere. The rest of this lesson builds up the scope chain step by step, showing how inner scopes create private containers that prevent accidental interference.',
      ],
      active: [
        { startLine: 1, endLine: 1, color: 'indigo', label: 'appName — bound in global scope' },
        { startLine: 2, endLine: 2, color: 'emerald', label: 'lookup finds appName in global' },
      ],
      connections: [],
    },
    {
      title: 'Function scope — a local, private container',
      code:
`let appName = 'MyApp'
console.log(appName)

function getGreeting(username) {
  let greeting = 'Welcome'     // local — only exists inside getGreeting
  return greeting + ' to ' + appName + ', ' + username
}

console.log(getGreeting('Alice'))`,
      explanation: [
        'getGreeting creates its own lexical scope. greeting is allocated inside that scope and only exists while getGreeting is executing. After it returns, the scope is destroyed and greeting is gone. appName is not in getGreeting\'s scope, so the engine walks up the chain to global.',
        'Line 6 evaluates: greeting — found locally → \'Welcome\'. appName — not local → walk up → found in global → \'MyApp\'. username — found as the parameter → \'Alice\'. Result: \'Welcome to MyApp, Alice\'.',
        'CS — Each function call pushes a new execution context with its own lexical environment. The scope chain rule is one-directional: inner scopes can read outer scopes, outer scopes cannot reach into inner ones. This is enforced at compile time in JavaScript\'s lexical scoping model.',
        'SE — Function scope is the most fundamental form of encapsulation in JavaScript. greeting is owned by getGreeting — no external code can corrupt it. Every local variable you declare inside a function is automatically protected from the outside world.',
      ],
      active: [
        { startLine: 1, endLine: 1, color: 'indigo', label: 'appName — global scope' },
        { startLine: 4, endLine: 7, color: 'violet', label: 'getGreeting scope — greeting is private here' },
        { startLine: 5, endLine: 5, color: 'pink', label: 'local variable — destroyed when function returns' },
        { startLine: 6, endLine: 6, color: 'emerald', label: 'appName read from outer scope — chain walk' },
      ],
      connections: [
        { fromLine: 6, toLine: 1, color: 'indigo', label: 'chain walk → global' },
      ],
    },
    {
      title: 'Three levels — nested function reads all outer scopes',
      code:
`let appName = 'MyApp'
console.log(appName)

function getGreeting(username) {
  let greeting = 'Welcome'
  return greeting + ' to ' + appName + ', ' + username
}

console.log(getGreeting('Alice'))

function buildReport(username) {
  let department = 'Engineering'   // level 2 — buildReport scope

  function formatLine(label) {     // level 3 — formatLine scope
    // label is local; department from level 2; appName from level 1
    return '[' + appName + '] ' + department + ' | ' + label + ': ' + username
  }

  return formatLine('Report')
}

console.log(buildReport('Bob'))`,
      explanation: [
        'formatLine is defined inside buildReport. It has access to three nested scopes: its own (label), buildReport\'s (department and username), and global (appName). The engine walks outward until each identifier is found.',
        'Trace formatLine(\'Report\'): label → local → \'Report\'. department → not local → walk up → buildReport scope → \'Engineering\'. username → walk up → buildReport parameter → \'Bob\'. appName → walk up → walk up → global → \'MyApp\'. Result: \'[MyApp] Engineering | Report: Bob\'.',
        'CS — The scope chain is a linked list of environments: formatLine.env → buildReport.env → global.env. Each lookup walks this list from innermost to outermost. The depth of nesting determines the chain length; modern engines optimise this with compile-time slot indices so the runtime cost is O(1) not O(depth).',
        'SE — Nested functions appear everywhere: event handlers inside components, callbacks inside middleware, helpers inside algorithms. Every nested function inherits access to all enclosing scopes automatically — no extra arguments needed. This implicit outer-scope access is the foundation that closures are built on.',
      ],
      active: [
        { startLine: 1, endLine: 1, color: 'indigo', label: 'level 1 — global scope' },
        { startLine: 11, endLine: 19, color: 'violet', label: 'level 2 — buildReport scope' },
        { startLine: 13, endLine: 17, color: 'emerald', label: 'level 3 — formatLine scope' },
        { startLine: 16, endLine: 16, color: 'pink', label: 'chain walk: label → department → appName' },
      ],
      connections: [
        { fromLine: 16, toLine: 12, color: 'violet', label: 'department from level 2' },
        { fromLine: 16, toLine: 1, color: 'indigo', label: 'appName from level 1' },
      ],
    },
    {
      title: 'Shadowing — inner name hides the outer name',
      code:
`let appName = 'MyApp'
console.log(appName)

function getGreeting(username) {
  let greeting = 'Welcome'
  return greeting + ' to ' + appName + ', ' + username
}

console.log(getGreeting('Alice'))

function buildReport(username) {
  let department = 'Engineering'
  function formatLine(label) {
    return '[' + appName + '] ' + department + ' | ' + label + ': ' + username
  }
  return formatLine('Report')
}

console.log(buildReport('Bob'))

function shadowDemo() {
  let appName = 'LocalApp'    // shadows the global appName — lookup stops here
  return 'inner sees: ' + appName
}

console.log(shadowDemo())          // → 'inner sees: LocalApp'
console.log('global: ' + appName)  // → 'global: MyApp'  — unaffected`,
      explanation: [
        'shadowDemo declares its own let appName = \'LocalApp\'. When the scope chain lookup for appName starts inside shadowDemo, it finds the local binding immediately and stops — the global appName is never reached. This is called shadowing.',
        'The global appName is not modified. After shadowDemo returns, console.log(\'global: \' + appName) resolves appName back through global scope and finds \'MyApp\' unchanged. Shadowing is purely lexical — it affects only code inside the function that redeclares the name.',
        'CS — Shadowing is not a bug; it is how lexical scoping is designed. Lookup always starts at the innermost scope and walks outward, stopping at the first match. Python, Go, Java, and Rust all have the same rule. The risk: forgetting that an inner declaration shadows an outer one, leading to confusing bugs where the outer value seems to "not update."',
        'SE — Shadowing is why you can safely name a local parameter or variable the same as a module-level constant without interference. React does this constantly: component parameters shadow module imports. The discipline is: use shadows intentionally when the local name is more specific, and avoid accidental shadows by using descriptive names.',
      ],
      active: [
        { startLine: 1, endLine: 1, color: 'indigo', label: 'global appName = \'MyApp\'' },
        { startLine: 21, endLine: 24, color: 'violet', label: 'shadowDemo scope' },
        { startLine: 22, endLine: 22, color: 'pink', label: 'local appName shadows global — lookup stops here' },
        { startLine: 27, endLine: 27, color: 'emerald', label: 'global appName intact — shadow was local' },
      ],
      connections: [],
    },
    {
      title: 'Block scope — let and const are not function scope',
      code:
`let appName = 'MyApp'
console.log(appName)

function getGreeting(username) {
  let greeting = 'Welcome'
  return greeting + ' to ' + appName + ', ' + username
}

console.log(getGreeting('Alice'))

function buildReport(username) {
  let department = 'Engineering'
  function formatLine(label) {
    return '[' + appName + '] ' + department + ' | ' + label + ': ' + username
  }
  return formatLine('Report')
}

console.log(buildReport('Bob'))

function shadowDemo() {
  let appName = 'LocalApp'
  return 'inner sees: ' + appName
}

console.log(shadowDemo())
console.log('global: ' + appName)

function blockScopeDemo() {
  let status = 'idle'
  if (true) {
    let status = 'active'   // block scope — new binding, only alive inside this { }
    console.log('block: ' + status)
  }
  console.log('outer: ' + status)   // still 'idle' — block's status is gone
}

blockScopeDemo()`,
      explanation: [
        'let and const create block-scoped variables — their lifetime is limited to the nearest enclosing curly braces {}. Inside the if block, let status = \'active\' creates a new binding that shadows the outer status. When the block closes, that binding is destroyed.',
        'Trace blockScopeDemo(): let status = \'idle\' (function scope). Enter if block. let status = \'active\' (block scope — different binding). console.log inside: \'active\'. Exit block — inner status destroyed. console.log outside: \'idle\'. The outer binding was never modified.',
        'CS — Block scoping (let/const) was added in ES2015. Before that, var was function-scoped, which meant variables declared inside loops or conditionals leaked into the enclosing function. This was a frequent source of bugs. let/const bring JavaScript\'s scoping rules in line with Java, C#, and C++.',
        'SE — The loop closure bug was the most notorious consequence of var\'s function scope: for (var i=0; i<3; i++) { setTimeout(() => console.log(i), 0) } logs 3,3,3 not 0,1,2. Using let fixes it because each iteration gets its own block-scoped i. This single change in variable declaration eliminates an entire class of bugs.',
      ],
      active: [
        { startLine: 29, endLine: 36, color: 'violet', label: 'blockScopeDemo — function scope' },
        { startLine: 30, endLine: 30, color: 'indigo', label: 'status = \'idle\' — function-scoped binding' },
        { startLine: 31, endLine: 33, color: 'pink', label: 'block {} — creates a new scope' },
        { startLine: 32, endLine: 32, color: 'emerald', label: 'new status = \'active\' — block-scoped, destroyed at }' },
      ],
      connections: [],
    },
    {
      title: 'ReferenceError — the lookup exhausted the chain',
      code:
`let appName = 'MyApp'
console.log(appName)

function getGreeting(username) {
  let greeting = 'Welcome'
  return greeting + ' to ' + appName + ', ' + username
}

console.log(getGreeting('Alice'))

function buildReport(username) {
  let department = 'Engineering'
  function formatLine(label) {
    return '[' + appName + '] ' + department + ' | ' + label + ': ' + username
  }
  return formatLine('Report')
}

console.log(buildReport('Bob'))

function shadowDemo() {
  let appName = 'LocalApp'
  return 'inner sees: ' + appName
}

console.log(shadowDemo())
console.log('global: ' + appName)

function blockScopeDemo() {
  let status = 'idle'
  if (true) {
    let status = 'active'
    console.log('block: ' + status)
  }
  console.log('outer: ' + status)
}

blockScopeDemo()

function secretOwner() {
  let secret = 'classified'
  return 'stored: ' + secret
}

console.log(secretOwner())
// console.log(secret)   // ✗ would throw: ReferenceError: secret is not defined`,
      explanation: [
        'secretOwner declares let secret inside itself. Calling secretOwner() works — \'classified\' is in scope. But secret does not exist anywhere outside secretOwner: not in global scope, not in any other function. Accessing it from outside would throw ReferenceError.',
        'When the engine looks up secret at the commented-out console.log: check global scope → not found. There is no outer scope to continue to. The chain is exhausted. JavaScript throws: "ReferenceError: secret is not defined." The error is the scope chain working correctly — the variable is genuinely private.',
        'CS — ReferenceError is the scope chain\'s enforcement mechanism. Every variable lookup either terminates by finding a binding or terminates by exhausting all enclosing scopes and throwing. There is no "undefined variable" — every undeclared name is an error. This is the same guarantee that Java\'s compiler provides at compile time.',
        'SE — This is why function scope provides real encapsulation without any class or module system. secret is just as private as a Java private field — nothing outside secretOwner can read or write it, by structural impossibility, not by convention. Closures exploit this to build stateful objects with genuinely private state.',
      ],
      active: [
        { startLine: 40, endLine: 44, color: 'violet', label: 'secretOwner — secret is private inside here' },
        { startLine: 41, endLine: 41, color: 'pink', label: 'secret — not in global scope, invisible outside' },
        { startLine: 45, endLine: 45, color: 'indigo', label: 'works — called from outside, returns the value' },
        { startLine: 46, endLine: 46, color: 'emerald', label: '✗ comment shows what the error would be' },
      ],
      connections: [],
    },
    {
      title: 'The full chain — every scope level in one program',
      code:
`let appName = 'MyApp'
console.log(appName)

function getGreeting(username) {
  let greeting = 'Welcome'
  return greeting + ' to ' + appName + ', ' + username
}

console.log(getGreeting('Alice'))

function buildReport(username) {
  let department = 'Engineering'
  function formatLine(label) {
    return '[' + appName + '] ' + department + ' | ' + label + ': ' + username
  }
  return formatLine('Report')
}

console.log(buildReport('Bob'))

function shadowDemo() {
  let appName = 'LocalApp'
  return 'inner sees: ' + appName
}

console.log(shadowDemo())
console.log('global: ' + appName)

function blockScopeDemo() {
  let status = 'idle'
  if (true) {
    let status = 'active'
    console.log('block: ' + status)
  }
  console.log('outer: ' + status)
}

blockScopeDemo()

function secretOwner() {
  let secret = 'classified'
  return 'stored: ' + secret
}

console.log(secretOwner())
// console.log(secret)   // ✗ ReferenceError: secret is not defined`,
      explanation: [
        'The full program demonstrates every scope level together. Each function creates an isolated scope. The chain connects them: formatLine reads from three levels, shadowDemo shows name collision, blockScopeDemo shows block vs function scope, secretOwner shows private access.',
        'All output runs in order: global appName, getGreeting, buildReport (three-level chain), shadowDemo + global confirmation, blockScopeDemo (block vs outer), secretOwner. Watch the console strip to see each output appear as the code accumulates.',
        'CS — The scope chain is a compile-time artefact in JavaScript. The V8 engine, during parsing, determines at compile time which scope each identifier belongs to, and replaces named lookups with slot indices into a fixed-offset context object. The chain walk you see conceptually is resolved at O(1) runtime cost.',
        'SE — Every language feature you have learned builds on this foundation: closures (a function capturing its outer scope), modules (a file-level scope), classes (a function scope for methods), React hooks (closures over state). You are not learning JavaScript trivia — you are learning the mechanism that makes all of these possible.',
      ],
      active: [
        { startLine: 1, endLine: 1, color: 'indigo', label: 'global scope — root of the chain' },
        { startLine: 11, endLine: 17, color: 'violet', label: 'buildReport scope — level 2' },
        { startLine: 13, endLine: 15, color: 'emerald', label: 'formatLine scope — level 3, reads all outer levels' },
        { startLine: 21, endLine: 23, color: 'pink', label: 'shadowDemo — shows name collision handled by proximity' },
      ],
      connections: [],
    },
  ],
}
