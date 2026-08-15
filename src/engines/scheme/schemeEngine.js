// A small hand-written Scheme interpreter, scoped to the subset used by
// "The Little Schemer": atoms, S-expressions, cons/car/cdr, cond, lambda,
// define, and/or, plus the numeric primitives the book relies on (add1,
// sub1, zero?). Not R7RS — no call/cc, no macros, no tail-call optimization
// (the book's recursion depths never come close to the JS call stack limit).
// Shared by both the inline "Run" button on lesson code blocks
// (src/utils/inlineRunner.js) and the persistent REPL sandbox
// (src/labs/little-schemer/SchemeRepl.jsx), so it only has to be right once.

export class SchemeError extends Error {}

export class Pair {
  constructor(car, cdr) {
    this.car = car;
    this.cdr = cdr;
  }
}

// Empty-list sentinel — distinct from `false` and from any Pair, matching
// real Scheme's three-way split between '(), #f, and everything else.
export const NIL = { nilTag: true };

// Returned by side-effect-only primitives (display/newline) so the REPL and
// inline runner can skip echoing a "=> " line for them — the book itself
// never calls display; its whole teaching device is the REPL echoing a
// value back, so that's the line worth keeping clean.
const VOID = { voidTag: true };

function arrayToList(items) {
  let result = NIL;
  for (let i = items.length - 1; i >= 0; i--) result = new Pair(items[i], result);
  return result;
}

function listToArray(list) {
  const out = [];
  while (list instanceof Pair) {
    out.push(list.car);
    list = list.cdr;
  }
  return out;
}

// ── Reader ──────────────────────────────────────────────────────────────

function tokenize(source) {
  const noComments = source
    .split("\n")
    .map((line) => line.replace(/;.*$/, ""))
    .join("\n");
  const spaced = noComments
    .replace(/\(/g, " ( ")
    .replace(/\)/g, " ) ")
    .replace(/'/g, " ' ");
  const trimmed = spaced.trim();
  return trimmed.length ? trimmed.split(/\s+/) : [];
}

function parseAtom(token) {
  if (token === "#t") return true;
  if (token === "#f") return false;
  if (/^-?\d+(\.\d+)?$/.test(token)) return Number(token);
  return token; // symbols are plain JS strings — see note in evalExpr
}

function parseExpr(tokens, pos) {
  const tok = tokens[pos];
  if (tok === undefined) throw new SchemeError("Unexpected end of input");
  if (tok === "(") {
    pos++;
    const items = [];
    while (tokens[pos] !== ")") {
      if (tokens[pos] === undefined) throw new SchemeError("Missing closing )");
      const [item, next] = parseExpr(tokens, pos);
      items.push(item);
      pos = next;
    }
    return [arrayToList(items), pos + 1];
  }
  if (tok === ")") throw new SchemeError("Unexpected )");
  if (tok === "'") {
    const [inner, next] = parseExpr(tokens, pos + 1);
    return [arrayToList(["quote", inner]), next];
  }
  return [parseAtom(tok), pos + 1];
}

/** Parse every top-level form in `source`. */
export function parseAll(source) {
  const tokens = tokenize(source);
  const forms = [];
  let pos = 0;
  while (pos < tokens.length) {
    const [expr, next] = parseExpr(tokens, pos);
    forms.push(expr);
    pos = next;
  }
  return forms;
}

/** Net paren depth of `source` (comments stripped) — used by the REPL to
 * decide whether to keep buffering a multi-line form before evaluating. */
export function parenBalance(source) {
  const noComments = source
    .split("\n")
    .map((line) => line.replace(/;.*$/, ""))
    .join("\n");
  let bal = 0;
  for (const ch of noComments) {
    if (ch === "(") bal++;
    else if (ch === ")") bal--;
  }
  return bal;
}

// ── Printer ─────────────────────────────────────────────────────────────

export function printValue(v) {
  if (v === NIL) return "()";
  if (v === true) return "#t";
  if (v === false) return "#f";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v; // symbols are bare strings
  if (v instanceof Pair) {
    const parts = [];
    let cur = v;
    while (cur instanceof Pair) {
      parts.push(printValue(cur.car));
      cur = cur.cdr;
    }
    if (cur === NIL) return "(" + parts.join(" ") + ")";
    return "(" + parts.join(" ") + " . " + printValue(cur) + ")";
  }
  if (v && v.isClosure) return v.name ? `#<procedure:${v.name}>` : "#<procedure>";
  if (typeof v === "function") return "#<primitive>";
  if (v === undefined) return "";
  return String(v);
}

// ── Environment ─────────────────────────────────────────────────────────

class Environment {
  constructor(parent = null) {
    this.vars = new Map();
    this.parent = parent;
    // Set per top-level evaluation call by evalSchemeSource; read by the
    // display/newline primitives, which close over the *global* env object
    // directly so they reach it regardless of how deep a closure call nests.
    this.outSink = null;
  }
  lookup(name) {
    let env = this;
    while (env) {
      if (env.vars.has(name)) return env.vars.get(name);
      env = env.parent;
    }
    throw new SchemeError(`Unbound variable: ${name}`);
  }
  define(name, value) {
    this.vars.set(name, value);
  }
}

// ── Evaluator ───────────────────────────────────────────────────────────

function evalBody(body, env) {
  let result = NIL;
  for (const form of body) result = evalExpr(form, env);
  return result;
}

function applyFn(fn, args) {
  if (typeof fn === "function") return fn(...args);
  if (fn && fn.isClosure) {
    const local = new Environment(fn.env);
    fn.params.forEach((p, i) => local.define(p, args[i]));
    return evalBody(fn.body, local);
  }
  throw new SchemeError("Not a procedure: " + printValue(fn));
}

function evalExpr(expr, env) {
  if (typeof expr === "number" || typeof expr === "boolean") return expr;
  if (expr === NIL) return NIL;
  // Symbols are plain JS strings with no separate literal-string type in
  // this dialect (the book never uses string literals) — a bare string
  // means "look this name up," while `quote` hands one back unevaluated.
  if (typeof expr === "string") return env.lookup(expr);

  if (expr instanceof Pair) {
    const op = expr.car;

    if (op === "quote") return expr.cdr.car;

    if (op === "if") {
      const parts = listToArray(expr.cdr);
      const [test, then, elseExpr] = parts;
      if (evalExpr(test, env) !== false) return evalExpr(then, env);
      return elseExpr !== undefined ? evalExpr(elseExpr, env) : NIL;
    }

    if (op === "cond") {
      let clause = expr.cdr;
      while (clause instanceof Pair) {
        const [test, ...body] = listToArray(clause.car);
        if (test === "else" || evalExpr(test, env) !== false) {
          return evalBody(body, env);
        }
        clause = clause.cdr;
      }
      return NIL;
    }

    if (op === "and") {
      let rest = expr.cdr;
      let result = true;
      while (rest instanceof Pair) {
        result = evalExpr(rest.car, env);
        if (result === false) return false;
        rest = rest.cdr;
      }
      return result;
    }

    if (op === "or") {
      let rest = expr.cdr;
      while (rest instanceof Pair) {
        const v = evalExpr(rest.car, env);
        if (v !== false) return v;
        rest = rest.cdr;
      }
      return false;
    }

    if (op === "begin") {
      return evalBody(listToArray(expr.cdr), env);
    }

    if (op === "lambda") {
      const params = listToArray(expr.cdr.car);
      const body = listToArray(expr.cdr.cdr);
      return { isClosure: true, params, body, env };
    }

    if (op === "define") {
      const target = expr.cdr.car;
      if (target instanceof Pair) {
        // (define (name arg...) body...) sugar
        const name = target.car;
        const params = listToArray(target.cdr);
        const body = listToArray(expr.cdr.cdr);
        env.define(name, { isClosure: true, params, body, env, name });
        return name;
      }
      const name = target;
      const value = evalExpr(expr.cdr.cdr.car, env);
      if (value && value.isClosure && !value.name) value.name = name;
      env.define(name, value);
      return name;
    }

    const fn = evalExpr(op, env);
    const args = listToArray(expr.cdr).map((a) => evalExpr(a, env));
    return applyFn(fn, args);
  }

  throw new SchemeError("Cannot evaluate: " + String(expr));
}

// ── Primitives + env factory ────────────────────────────────────────────

/** Build a fresh global environment with every primitive the book needs. */
export function createEnv() {
  const env = new Environment();
  const def = (name, fn) => env.define(name, fn);

  def("cons", (a, b) => new Pair(a, b));
  def("car", (p) => {
    if (!(p instanceof Pair)) throw new SchemeError("car: expects a non-empty list, got " + printValue(p));
    return p.car;
  });
  def("cdr", (p) => {
    if (!(p instanceof Pair)) throw new SchemeError("cdr: expects a non-empty list, got " + printValue(p));
    return p.cdr;
  });
  def("list", (...xs) => arrayToList(xs));

  def("null?", (x) => x === NIL);
  def("pair?", (x) => x instanceof Pair);
  // The book treats atom? as a given primitive, but it isn't standard
  // Scheme — an atom is anything that's neither a pair nor the empty list.
  def("atom?", (x) => !(x instanceof Pair) && x !== NIL);
  def("list?", (x) => {
    while (x instanceof Pair) x = x.cdr;
    return x === NIL;
  });
  def("eq?", (a, b) => a === b);
  def("equal?", (a, b) => printValue(a) === printValue(b));
  def("not", (x) => x === false);

  def("number?", (x) => typeof x === "number");
  def("zero?", (x) => x === 0);
  def("add1", (x) => x + 1);
  def("sub1", (x) => x - 1);
  def("+", (...xs) => xs.reduce((a, b) => a + b, 0));
  def("*", (...xs) => xs.reduce((a, b) => a * b, 1));
  def("-", (a, ...rest) => (rest.length ? rest.reduce((acc, b) => acc - b, a) : -a));
  def("=", (a, b) => a === b);
  def(">", (a, b) => a > b);
  def("<", (a, b) => a < b);

  // display/newline close over `env` itself (the global env object), so
  // they still reach the current outSink even when called from deep inside
  // a lambda's child environment.
  def("display", (v) => {
    if (env.outSink) env.outSink(printValue(v));
    return VOID;
  });
  def("newline", () => {
    if (env.outSink) env.outSink("");
    return VOID;
  });

  return env;
}

/**
 * Evaluate every top-level form in `source` against `env`, calling
 * `onLine({type, text})` for each result / display() output / error.
 * Errors are caught per top-level form so one mistake doesn't stop the rest
 * of a lesson code block or REPL entry from running.
 */
export function evalSchemeSource(source, env, onLine) {
  env.outSink = (text) => onLine({ type: "output", text });

  let forms;
  try {
    forms = parseAll(source);
  } catch (e) {
    onLine({ type: "error", text: e.message || String(e) });
    return;
  }

  for (const form of forms) {
    const isDefine = form instanceof Pair && form.car === "define";
    try {
      const result = evalExpr(form, env);
      if (isDefine) {
        onLine({ type: "dim", text: `; ${result} defined` });
      } else if (result !== VOID) {
        onLine({ type: "result", text: "=> " + printValue(result) });
      }
    } catch (e) {
      onLine({ type: "error", text: e.message || String(e) });
    }
  }
}
