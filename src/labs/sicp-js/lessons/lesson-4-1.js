export const lesson = {
  id: 'sicp-4-1',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '4.1  The Metacircular Evaluator',
  checkpoints: [
    { id: 'cp-eval-apply',       label: 'eval & apply' },
    { id: 'cp-building-eval',    label: 'Building evaluate' },
    { id: 'cp-closures-created', label: 'Closures from First Principles' },
    { id: 'cp-running',          label: 'Running the Evaluator' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Here is a question that sounds paradoxical: could you write a JavaScript interpreter in JavaScript? It seems circular — if you need JavaScript to run the interpreter, and the interpreter is JavaScript, haven\'t you assumed what you were trying to build? Chapter 4 of SICP answers this question, and the answer changes how you think about programming languages forever. The interpreter is just a program. Programs are data. Nothing is circular.',
      code: null,
    },

    // ── What is an interpreter? ───────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'interpreter-as-function-vocab',
      text: 'An interpreter is a function from (expression, environment) to value. That is the entire definition. evaluate("3 + 4", env) returns 7. evaluate("x * x", {x: 5}) returns 25. The "magic" of JavaScript evaluation — which you have been using since lesson 1-1 without examining — is just a very large, very fast instance of this function. When we write our own evaluate, we are building a smaller, visible, inspectable version of the same machine.',
      code: null,
    },

    // ── Terminology: eval/apply cycle ─────────────────────────────────────────────
    {
      type: 'narration',
      id: 'eval-apply-vocab',
      text: 'The evaluator rests on two mutually recursive functions. evaluate dispatches on the type of expression: "is this a literal? a variable lookup? an if? a function call?" It handles everything except function calls itself. apply handles function calls: "is this a primitive operation or a user-defined function?" Apply calls back to evaluate to run the body. They chase each other until a base case — a literal or a primitive — terminates the chain. Every programming language interpreter has this eval/apply structure at its heart.',
      code: null,
    },

    // ── Expression representation ─────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'expression-as-data-vocab',
      text: 'Before we can evaluate expressions, we need to represent them as data structures that our code can inspect. This is the same insight as Chapter 2.3\'s symbolic differentiation: an expression like x + 1 is not a computation to run — it is a tree to examine. We represent each expression type as an object tagged with its type. A literal number, a variable name, an if-expression, a lambda, and a function call are five distinct object shapes.',
      code: null,
    },
    {
      type: 'narration',
      id: 'expression-constructors',
      text: 'Here are the five expression constructors. Each creates a tagged object. The tags let evaluate know which case it is handling.',
      code: 'const lit   = val          => ({ type: \'lit\',  val });\nconst vari  = name         => ({ type: \'var\',  name });\nconst iff   = (pred,c,alt) => ({ type: \'if\',   pred, cons: c, alt });\nconst lam   = (params,bod) => ({ type: \'lam\',  params, body: bod });\nconst call  = (fn, ...args)=> ({ type: \'call\', fn, args });\n\n// Represent: if (x < 1) then 0 else x * x\nconst expr = iff(\n  call(vari(\'<\'), vari(\'x\'), lit(1)),\n  lit(0),\n  call(vari(\'*\'), vari(\'x\'), vari(\'x\'))\n);\n\nconsole.log(expr.type);           // if\nconsole.log(expr.cons.type);      // lit\nconsole.log(expr.alt.type);       // call\nconsole.log(expr.alt.fn.name);    // *',
    },
    {
      type: 'narration',
      id: 'expression-tree-idea',
      text: 'Notice what just happened. The expression "if x < 1 then 0 else x*x" is now data — a tree of objects. We can walk it, inspect it, transform it, store it in a variable. This is data as programs, and programs as data. Everything in Chapter 2 about processing trees applies here. Our evaluator will recurse through this tree exactly the way count_leaves recursed through a list tree.',
      code: null,
    },

    // ── The environment ───────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'env-vocab',
      text: 'The evaluator\'s environment is the Chapter 3.2 environment model made explicit. It is a linked list of frames. A frame is a Map of name→value bindings. extend_env creates a new frame for a function call, binding parameters to arguments, with the parent environment as the enclosing chain. lookup walks the chain until the name is found.',
      code: null,
    },
    {
      type: 'narration',
      id: 'env-code',
      text: 'Here are the environment operations. They implement exactly the frame chain from Chapter 3.2 — now as explicit data structures you can see and modify.',
      code: 'function make_env(frame, enclosing) {\n  return { frame, enclosing };\n}\n\nfunction lookup(name, env) {\n  if (env === null) throw new Error(`Unbound: ${name}`);\n  if (env.frame.has(name)) return env.frame.get(name);\n  return lookup(name, env.enclosing);\n}\n\nfunction extend_env(params, args, base) {\n  const frame = new Map();\n  params.forEach((p, i) => frame.set(p, args[i]));\n  return make_env(frame, base);\n}\n\n// Test: x in local, pi in global\nconst global = make_env(new Map([[\'pi\', 3.14]]), null);\nconst local  = extend_env([\'x\'], [5], global);\n\nconsole.log(lookup(\'x\',  local));  // 5  — found in local frame\nconsole.log(lookup(\'pi\', local));  // 3.14 — found in global',
    },
    {
      type: 'checkpoint',
      id: 'cp-eval-apply',
    },

    // ── Building evaluate ─────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'eval-literal-first',
      text: 'We build evaluate one case at a time. The simplest case: a literal. evaluate({ type: "lit", val: 42 }, env) should return 42. The environment is not consulted — a literal is its own value. One line of code.',
      code: 'function lookup(name, env) {\n  if (env === null) throw new Error(`Unbound: ${name}`);\n  return env.frame.has(name) ? env.frame.get(name) : lookup(name, env.enclosing);\n}\n\nfunction evaluate(exp, env) {\n  if (exp.type === \'lit\') return exp.val;  // literal: just return the value\n  // (more cases will go here)\n  throw new Error(`Cannot evaluate type: ${exp.type}`);\n}\n\nconst global = { frame: new Map(), enclosing: null };\nconst lit = v => ({ type: \'lit\', val: v });\n\nconsole.log(evaluate(lit(42),     global)); // 42\nconsole.log(evaluate(lit(true),   global)); // true\nconsole.log(evaluate(lit("hello"),global)); // hello',
    },
    {
      type: 'narration',
      id: 'eval-variable',
      text: 'The variable case: evaluate({ type: "var", name: "x" }, env) looks up x in the environment. The environment is the entire Chapter 3.2 frame chain — the same one we just built.',
      code: 'function make_env(f, e) { return { frame: f, enclosing: e }; }\nfunction lookup(name, env) {\n  if (!env) throw new Error(`Unbound: ${name}`);\n  return env.frame.has(name) ? env.frame.get(name) : lookup(name, env.enclosing);\n}\n\nfunction evaluate(exp, env) {\n  if (exp.type === \'lit\') return exp.val;\n  if (exp.type === \'var\') return lookup(exp.name, env);  // variable: look it up\n  throw new Error(`Cannot evaluate: ${exp.type}`);\n}\n\nconst global = make_env(new Map([[\'x\', 10], [\'pi\', 3.14]]), null);\nconst lit  = v => ({ type: \'lit\',  val: v });\nconst vari = n => ({ type: \'var\',  name: n });\n\nconsole.log(evaluate(vari(\'x\'),  global)); // 10\nconsole.log(evaluate(vari(\'pi\'), global)); // 3.14\nconsole.log(evaluate(lit(99),    global)); // 99',
    },
    {
      type: 'narration',
      id: 'eval-if',
      text: 'The if case: evaluate the predicate first. If it is truthy, evaluate the consequent; otherwise evaluate the alternative. Neither branch is evaluated until the predicate decides. This is the definition of conditional evaluation — only one branch runs.',
      code: 'function make_env(f, e) { return { frame: f, enclosing: e }; }\nfunction lookup(n, env) {\n  if (!env) throw new Error(`Unbound: ${n}`);\n  return env.frame.has(n) ? env.frame.get(n) : lookup(n, env.enclosing);\n}\n\nfunction evaluate(exp, env) {\n  if (exp.type === \'lit\') return exp.val;\n  if (exp.type === \'var\') return lookup(exp.name, env);\n  if (exp.type === \'if\') {\n    const test = evaluate(exp.pred, env);\n    return evaluate(test ? exp.cons : exp.alt, env); // one branch only\n  }\n  throw new Error(`Cannot evaluate: ${exp.type}`);\n}\n\nconst global = make_env(new Map([[\'x\', 5]]), null);\nconst lit = v => ({ type:\'lit\',val:v }),  vari = n => ({ type:\'var\',name:n });\nconst iff = (p,c,a) => ({ type:\'if\',pred:p,cons:c,alt:a });\n\n// if x > 3 then "big" else "small"\nconst expr = iff(vari(\'x\'), lit(\'big\'), lit(\'small\')); // x is truthy\nconsole.log(evaluate(expr, global));    // big\n\n// if 0 then "yes" else "no"\nconsole.log(evaluate(iff(lit(0), lit(\'yes\'), lit(\'no\')), global)); // no',
    },

    // ── The lambda case — most important ─────────────────────────────────────────
    {
      type: 'narration',
      id: 'eval-lambda-vocab',
      text: 'The lambda case is the most important. When evaluate sees a lambda, it does NOT run the body. It creates a closure: the code (parameter list and body) paired with the current environment. The closure is a value — it can be stored in a variable, returned, passed as an argument. The body runs later, when the closure is applied. This is exactly the Chapter 3.2 definition: a closure is a (code, environment) pair.',
      code: null,
    },
    {
      type: 'narration',
      id: 'eval-lambda-code',
      text: 'Here is the lambda case. One line: wrap the code and the current environment into a closure object tagged "closure".',
      code: 'function make_env(f, e) { return { frame: f, enclosing: e }; }\nfunction lookup(n, env) {\n  if (!env) throw new Error(`Unbound: ${n}`);\n  return env.frame.has(n) ? env.frame.get(n) : lookup(n, env.enclosing);\n}\nfunction evaluate(exp, env) {\n  if (exp.type === \'lit\') return exp.val;\n  if (exp.type === \'var\') return lookup(exp.name, env);\n  if (exp.type === \'if\')  return evaluate(evaluate(exp.pred,env) ? exp.cons : exp.alt, env);\n  if (exp.type === \'lam\') {\n    // Create a closure: code + the current environment\n    return { type: \'closure\', params: exp.params, body: exp.body, env };\n  }\n  throw new Error(`Cannot evaluate: ${exp.type}`);\n}\n\nconst global = make_env(new Map([[\'y\', 10]]), null);\nconst lam = (p, b) => ({ type:\'lam\', params:p, body:b });\nconst vari = n => ({ type:\'var\', name:n });\n\n// lambda([\'x\'], x) — the identity function\nconst identity_fn = evaluate(lam([\'x\'], vari(\'x\')), global);\nconsole.log(identity_fn.type);   // closure\nconsole.log(identity_fn.params); // [\'x\']\nconsole.log(identity_fn.env === global); // true — captured global env',
    },
    {
      type: 'checkpoint',
      id: 'cp-building-eval',
    },

    // ── apply ─────────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'apply-vocab',
      text: 'Now the other half of the cycle: apply. It handles two cases. A primitive function is a JavaScript function wrapped with a tag — we call its implementation directly. A closure was created by the lambda case above — we extend its captured environment with the argument bindings and evaluate the body. That is the critical step: the body runs in the environment captured at definition time, not the current environment. This is lexical scoping, now explicit in our code.',
      code: null,
    },
    {
      type: 'narration',
      id: 'apply-primitive',
      text: 'Primitive functions are JavaScript functions. We tag them as "prim" and call their implementation with the evaluated arguments.',
      code: 'const prim = impl => ({ type: \'prim\', impl });\n\nfunction apply(fn, args) {\n  if (fn.type === \'prim\') return fn.impl(...args);\n  throw new Error(`Not a function: ${fn.type}`);\n}\n\nconst add_prim = prim((a, b) => a + b);\nconst mul_prim = prim((a, b) => a * b);\n\nconsole.log(apply(add_prim, [3, 4]));  // 7\nconsole.log(apply(mul_prim, [5, 6]));  // 30',
    },
    {
      type: 'narration',
      id: 'apply-closure',
      text: 'Closure application: extend the closure\'s captured environment with the parameter→argument bindings, then evaluate the body in that new environment. The captured environment is the closure\'s defining scope — so free variables in the body are found there.',
      code: 'function make_env(f, e) { return { frame: f, enclosing: e }; }\nfunction extend_env(params, args, base) {\n  const frame = new Map(); params.forEach((p,i)=>frame.set(p,args[i]));\n  return make_env(frame, base);\n}\nfunction lookup(n, env) {\n  if (!env) throw new Error(`Unbound: ${n}`);\n  return env.frame.has(n) ? env.frame.get(n) : lookup(n, env.enclosing);\n}\n\nfunction apply(fn, args) {\n  if (fn.type === \'prim\') return fn.impl(...args);\n  if (fn.type === \'closure\') {\n    // extend the CLOSURE\'S env — not the current env\n    const new_env = extend_env(fn.params, args, fn.env);\n    return evaluate(fn.body, new_env);\n  }\n  throw new Error(`Not a function: ${fn.type}`);\n}\n\n// (This is a stub — full evaluate shown next)\nfunction evaluate(exp, env) {\n  if (exp.type === \'lit\') return exp.val;\n  if (exp.type === \'var\') return lookup(exp.name, env);\n  throw new Error(`Unknown: ${exp.type}`);\n}\n\n// Simulate: call closure(5), where closure is x => x + 1\nconst global = make_env(new Map(), null);\nconst add1_closure = { type:\'closure\', params:[\'x\'],\n  body: { type:\'var\', name:\'x\' }, env: global }; // simplified body\nconsole.log(apply(add1_closure, [5])); // 5 — body is just x',
    },

    // ── Wiring evaluate and apply ─────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'eval-call-case',
      text: 'The call case in evaluate combines everything. Evaluate the function expression to get a primitive or closure. Evaluate each argument expression. Then call apply. This is the eval/apply cycle completing its loop.',
      code: 'function make_env(f,e){return{frame:f,enclosing:e};}\nfunction extend_env(ps,as,base){const f=new Map();ps.forEach((p,i)=>f.set(p,as[i]));return make_env(f,base);}\nfunction lookup(n,env){if(!env)throw new Error(`Unbound: ${n}`);return env.frame.has(n)?env.frame.get(n):lookup(n,env.enclosing);}\n\nfunction apply(fn, args) {\n  if (fn.type === \'prim\')    return fn.impl(...args);\n  if (fn.type === \'closure\') return evaluate(fn.body, extend_env(fn.params, args, fn.env));\n  throw new Error(`Not a fn`);\n}\n\nfunction evaluate(exp, env) {\n  if (exp.type === \'lit\') return exp.val;\n  if (exp.type === \'var\') return lookup(exp.name, env);\n  if (exp.type === \'if\')  return evaluate(evaluate(exp.pred,env)?exp.cons:exp.alt, env);\n  if (exp.type === \'lam\') return { type:\'closure\', params:exp.params, body:exp.body, env };\n  if (exp.type === \'call\') {\n    const fn   = evaluate(exp.fn,   env);\n    const args = exp.args.map(a => evaluate(a, env));\n    return apply(fn, args);             // hand off to apply\n  }\n  throw new Error(`Unknown: ${exp.type}`);\n}\n\nconst prim = impl => ({type:\'prim\',impl});\nconst lit=v=>({type:\'lit\',val:v}), vari=n=>({type:\'var\',name:n});\nconst call=(fn,...args)=>({type:\'call\',fn,args});\nconst global = make_env(new Map([[\'add\',prim((a,b)=>a+b)]]),null);\n\n// Evaluate: add(3, 4)\nconsole.log(evaluate(call(vari(\'add\'), lit(3), lit(4)), global)); // 7',
    },
    {
      type: 'checkpoint',
      id: 'cp-closures-created',
    },

    // ── Running the complete evaluator ────────────────────────────────────────────
    {
      type: 'narration',
      id: 'complete-evaluator-vocab',
      text: 'Let\'s wire everything into a working evaluator with a real global environment. The global environment contains the primitive arithmetic operations. We can then define a user function as a closure and call it. Every step — the function definition creating a closure, the function call extending the environment, the recursive call looking up "fact" in global — is now explicit and inspectable in our evaluate/apply source code.',
      code: null,
    },
    {
      type: 'narration',
      id: 'complete-evaluator',
      text: 'Here is the complete working evaluator. The global environment holds primitive operations. We define factorial as a closure and call it. Run it — this is a JavaScript interpreter running inside JavaScript.',
      code: 'function make_env(f,e){return{frame:f,enclosing:e};}\nfunction extend_env(ps,as,base){\n  const f=new Map();ps.forEach((p,i)=>f.set(p,as[i]));return make_env(f,base);\n}\nfunction lookup(n,env){\n  if(!env)throw new Error(`Unbound: ${n}`);\n  return env.frame.has(n)?env.frame.get(n):lookup(n,env.enclosing);\n}\nfunction apply(fn,args){\n  if(fn.type===\'prim\') return fn.impl(...args);\n  if(fn.type===\'closure\') return evaluate(fn.body,extend_env(fn.params,args,fn.env));\n  throw new Error(`Not a fn`);\n}\nfunction evaluate(exp,env){\n  if(exp.type===\'lit\') return exp.val;\n  if(exp.type===\'var\') return lookup(exp.name,env);\n  if(exp.type===\'if\')  return evaluate(evaluate(exp.pred,env)?exp.cons:exp.alt,env);\n  if(exp.type===\'lam\') return{type:\'closure\',params:exp.params,body:exp.body,env};\n  if(exp.type===\'call\'){\n    const fn=evaluate(exp.fn,env);\n    const args=exp.args.map(a=>evaluate(a,env));\n    return apply(fn,args);\n  }\n  throw new Error(`Unknown: ${exp.type}`);\n}\nconst prim=impl=>({type:\'prim\',impl});\nconst lit=v=>({type:\'lit\',val:v}),vari=n=>({type:\'var\',name:n});\nconst iff=(p,c,a)=>({type:\'if\',pred:p,cons:c,alt:a});\nconst lam=(ps,b)=>({type:\'lam\',params:ps,body:b});\nconst call=(fn,...a)=>({type:\'call\',fn,args:a});\n\n// Global environment with primitives\nconst global=make_env(new Map([\n  [\'*\',prim((a,b)=>a*b)],[\'<\',prim((a,b)=>a<b)],[\'-\',prim((a,b)=>a-b)]\n]),null);\n\n// Define factorial and bind it in global\nconst fact_body=iff(\n  call(vari(\'<\'),vari(\'n\'),lit(2)),\n  lit(1),\n  call(vari(\'*\'),vari(\'n\'),call(vari(\'fact\'),call(vari(\'-\'),vari(\'n\'),lit(1))))\n);\nconst fact_closure={type:\'closure\',params:[\'n\'],body:fact_body,env:global};\nglobal.frame.set(\'fact\',fact_closure);\n\nconsole.log(evaluate(call(vari(\'fact\'),lit(5)),global)); // 120\nconsole.log(evaluate(call(vari(\'fact\'),lit(6)),global)); // 720',
    },
    {
      type: 'codelens',
      id: 'codelens-eval-call',
      text: 'Open CodeLens on evaluate(call(vari("*"), lit(3), lit(4)), global). Step through the full cycle: evaluate sees a call, evaluates vari("*") to a prim, evaluates lit(3) to 3 and lit(4) to 4, then calls apply. Apply sees a prim and calls its implementation. Watch the mutual recursion: evaluate calls apply which calls evaluate which calls apply...',
      code: 'function make_env(f,e){return{frame:f,enclosing:e};}\nfunction extend_env(ps,as,base){const f=new Map();ps.forEach((p,i)=>f.set(p,as[i]));return make_env(f,base);}\nfunction lookup(n,env){if(!env)throw new Error(`Unbound: ${n}`);return env.frame.has(n)?env.frame.get(n):lookup(n,env.enclosing);}\nfunction apply(fn,args){if(fn.type===\'prim\')return fn.impl(...args);if(fn.type===\'closure\')return evaluate(fn.body,extend_env(fn.params,args,fn.env));throw new Error("Not a fn");}\nfunction evaluate(exp,env){if(exp.type===\'lit\')return exp.val;if(exp.type===\'var\')return lookup(exp.name,env);if(exp.type===\'call\'){const fn=evaluate(exp.fn,env);const args=exp.args.map(a=>evaluate(a,env));return apply(fn,args);}throw new Error("Unknown: "+exp.type);}\nconst prim=impl=>({type:\'prim\',impl}),lit=v=>({type:\'lit\',val:v}),vari=n=>({type:\'var\',name:n}),call=(fn,...a)=>({type:\'call\',fn,args:a});\nconst global=make_env(new Map([[\'*\',prim((a,b)=>a*b)]]),null);\nconsole.log(evaluate(call(vari(\'*\'),lit(3),lit(4)),global));',
    },

    // ── What the metacircular evaluator reveals ───────────────────────────────────
    {
      type: 'narration',
      id: 'metacircular-reveals',
      text: 'Look at what we built. The environment model from Chapter 3.2 — frames, lookup, extend_env — is now explicit data in our evaluator. Closures — introduced conceptually in Chapter 1.1.8 — are now concrete objects with a params, body, and env field. Lexical scoping is not a language feature; it is the three-line apply case that passes fn.env (the closure\'s environment) instead of the current environment to extend_env. Every "magic" of JavaScript is just code.',
      code: null,
    },
    {
      type: 'narration',
      id: 'special-forms-vocab',
      text: 'The evaluator distinguishes between ordinary procedure calls and special forms. An ordinary call evaluates all its arguments before calling. A special form does not — if evaluates only one branch, lambda does not evaluate its body at all. This is why you cannot implement if as an ordinary function: by the time a function receives its arguments, they have already been evaluated. Special forms must be built into evaluate\'s dispatch.',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-seq',
      text: 'Extend the evaluator with a sequence form: { type: "seq", exprs: [...] }. It evaluates each expression in order and returns the last value. This is the evaluator equivalent of JavaScript\'s comma operator or a sequence of statements. Add the seq case to evaluate. seq([lit(1), lit(2), lit(99)]) should return 99.',
      expectedOutput: '99\n7',
      startCode: 'function make_env(f,e){return{frame:f,enclosing:e};}\nfunction extend_env(ps,as,base){const f=new Map();ps.forEach((p,i)=>f.set(p,as[i]));return make_env(f,base);}\nfunction lookup(n,env){if(!env)throw new Error(`Unbound: ${n}`);return env.frame.has(n)?env.frame.get(n):lookup(n,env.enclosing);}\nfunction apply(fn,args){if(fn.type===\'prim\')return fn.impl(...args);if(fn.type===\'closure\')return evaluate(fn.body,extend_env(fn.params,args,fn.env));throw new Error("Not a fn");}\n\nfunction evaluate(exp,env){\n  if(exp.type===\'lit\') return exp.val;\n  if(exp.type===\'var\') return lookup(exp.name,env);\n  if(exp.type===\'if\')  return evaluate(evaluate(exp.pred,env)?exp.cons:exp.alt,env);\n  if(exp.type===\'lam\') return{type:\'closure\',params:exp.params,body:exp.body,env};\n  if(exp.type===\'call\'){const fn=evaluate(exp.fn,env);const args=exp.args.map(a=>evaluate(a,env));return apply(fn,args);}\n  // ADD seq case: evaluate each, return last\n  throw new Error(`Unknown: ${exp.type}`);\n}\n\nconst prim=impl=>({type:\'prim\',impl}),lit=v=>({type:\'lit\',val:v}),vari=n=>({type:\'var\',name:n});\nconst call=(fn,...a)=>({type:\'call\',fn,args:a});\nconst seq=(...exprs)=>({type:\'seq\',exprs});\nconst global=make_env(new Map([[\'add\',prim((a,b)=>a+b)]]),null);\n\nconsole.log(evaluate(seq(lit(1),lit(2),lit(99)), global));  // 99\nconsole.log(evaluate(seq(call(vari(\'add\'),lit(3),lit(4))), global)); // 7\n',
      hint: 'if (exp.type === \'seq\') {\n  let result;\n  for (const e of exp.exprs) result = evaluate(e, env);\n  return result;\n}',
      tests: [],
      validate: ({ logs }) => logs.some(l => l.includes('99')) && logs.some(l => l.includes('7')),
    },
    {
      type: 'challenge',
      id: 'challenge-let',
      text: 'Add a let form: { type: "let", name, val, body }. It evaluates val, binds name to the result in a new frame, then evaluates body in that frame. This is syntactic sugar for: call a lambda that takes name as a parameter, with val as the argument. let({ name: "x", val: lit(5), body: call(vari("mul"), vari("x"), vari("x")) }) should return 25.',
      expectedOutput: '25',
      startCode: 'function make_env(f,e){return{frame:f,enclosing:e};}\nfunction extend_env(ps,as,base){const f=new Map();ps.forEach((p,i)=>f.set(p,as[i]));return make_env(f,base);}\nfunction lookup(n,env){if(!env)throw new Error(`Unbound: ${n}`);return env.frame.has(n)?env.frame.get(n):lookup(n,env.enclosing);}\nfunction apply(fn,args){if(fn.type===\'prim\')return fn.impl(...args);if(fn.type===\'closure\')return evaluate(fn.body,extend_env(fn.params,args,fn.env));throw new Error("Not a fn");}\n\nfunction evaluate(exp,env){\n  if(exp.type===\'lit\') return exp.val;\n  if(exp.type===\'var\') return lookup(exp.name,env);\n  if(exp.type===\'if\')  return evaluate(evaluate(exp.pred,env)?exp.cons:exp.alt,env);\n  if(exp.type===\'lam\') return{type:\'closure\',params:exp.params,body:exp.body,env};\n  if(exp.type===\'call\'){const fn=evaluate(exp.fn,env);const args=exp.args.map(a=>evaluate(a,env));return apply(fn,args);}\n  // ADD let case: create a new frame with one binding\n  throw new Error(`Unknown: ${exp.type}`);\n}\n\nconst prim=impl=>({type:\'prim\',impl}),lit=v=>({type:\'lit\',val:v}),vari=n=>({type:\'var\',name:n});\nconst call=(fn,...a)=>({type:\'call\',fn,args:a});\nconst letf=(name,val,body)=>({type:\'let\',name,val,body});\nconst global=make_env(new Map([[\'mul\',prim((a,b)=>a*b)]]),null);\n\nconsole.log(evaluate(letf(\'x\',lit(5),call(vari(\'mul\'),vari(\'x\'),vari(\'x\'))),global)); // 25\n',
      hint: 'if (exp.type === \'let\') {\n  const val = evaluate(exp.val, env);\n  const new_env = extend_env([exp.name], [val], env);\n  return evaluate(exp.body, new_env);\n}',
      tests: [],
      validate: ({ logs }) => logs.some(l => l.trim() === '25'),
    },
    {
      type: 'checkpoint',
      id: 'cp-running',
    },
  ],
}
