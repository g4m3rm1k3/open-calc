export const lesson = {
  id: 'sicp-2-4c',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.3.1  Quotation and Symbols',
  checkpoints: [
    { id: 'cp-symbols',     label: 'Symbols' },
    { id: 'cp-symbol-ops',  label: 'Symbol Operations' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'So far, data has been numbers and pairs. Section 2.3 extends data to include symbols — names used as pure labels, not as variable bindings. This is a subtle but crucial distinction. When we write x in code, the interpreter looks up x in the environment and returns whatever it is bound to. When we write the symbol "x" as data, we mean the name x itself — not its value, just the label. This is quotation: treating code as data rather than code to run. Every computer algebra system, every theorem prover, every language interpreter depends on this idea.',
      code: null,
    },

    // ── Terminology: Symbols ──────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'symbol-vocab',
      text: 'In Scheme, the original SICP language, a symbol is a distinct primitive data type — you write \'x (with an apostrophe) to get the symbol x rather than the value of the variable x. In JavaScript we represent symbols as strings. The string "x" is the symbol x. The critical property: symbol equality is name equality — "x" equals "x" regardless of what any variable named x is bound to. The predicate eq_sym(a, b) tests whether two symbols have the same name.',
      code: null,
    },
    {
      type: 'narration',
      id: 'symbol-equality-code',
      text: 'Here is symbol equality. Two strings with the same content are the same symbol. This is value equality for symbols, not reference equality. Note that JavaScript\'s === already does this for strings, which is why strings work as symbols.',
      code: 'function eq_sym(a, b) { return a === b; }\n\nconst x = "x";          // the symbol x\nconst y = "y";          // the symbol y\nconst also_x = "x";     // also the symbol x\n\nconsole.log(eq_sym(x, also_x));  // true — same name\nconsole.log(eq_sym(x, y));       // false — different names\n\n// Note: "x" is the symbol, not the variable x\n// If we had: const x = 42;\n// Then x would be 42, but "x" would still be the symbol\nconst num_x = 42;\nconsole.log(num_x);  // 42 — the value\nconsole.log("x");    // x  — the symbol (just the name)',
    },

    // ── Variable vs symbol: the critical distinction ─────────────────────────────
    {
      type: 'narration',
      id: 'variable-vs-symbol',
      text: 'The distinction between a variable and a symbol is the most important concept in Section 2.3.1. Run this code and predict each output before you see it. Some outputs will surprise you.',
      code: `// What is the difference?
const apple = "banana";   // variable 'apple' is bound to the string "banana"

console.log(apple);      // "banana" — the VALUE the variable holds
console.log("apple");    // "apple" — the SYMBOL apple (the name itself)

// When you say: apple — you get the value (banana)
// When you say: "apple" — you get the label (apple)
// This is quotation: "apple" means "the name apple", not "whatever apple is bound to"`,
    },
    {
      type: 'narration',
      id: 'atom-vocab',
      text: 'New vocabulary: an atom is a primitive, non-decomposable value. In our system:\n  Numbers are atoms: 5, 3.14, -7\n  Symbols are atoms: "x", "plus", "cat"\n  Null is a special atom: the empty list\n\nA pair is NOT an atom — it can be decomposed into head and tail. When processing symbolic expressions, is_pair tells you whether you have a decomposable structure or an atom.',
      code: `function is_pair(x) { return Array.isArray(x); }

function is_atom(x)   { return !is_pair(x) && x !== null; }
function is_number(x) { return typeof x === 'number'; }
function is_symbol(x) { return typeof x === 'string'; }

console.log(is_atom(5));       // true — number atom
console.log(is_atom("x"));     // true — symbol atom
console.log(is_atom([1,[2,null]])); // false — it's a pair`,
    },

    // ── Lists of symbols ──────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'symbol-lists-vocab',
      text: 'Symbols become powerful when combined with lists. A list of symbols is a simple data structure representing a sequence of names. Lists can hold both symbols and numbers: list("a", 1, "b", 2) contains two symbols and two numbers. Lists can also be nested, giving us symbol expressions — the building blocks of everything in sections 2.3.2 through 2.3.4. When we want to represent the algebraic expression x + 3, we write list("+", "x", 3).',
      code: null,
    },
    {
      type: 'narration',
      id: 'symbol-list-code',
      text: 'Here are lists of symbols. The pair chain is exactly the same structure as before — the only difference is that the elements are strings (symbols) instead of numbers.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction is_pair(x){return Array.isArray(x);}\nfunction display(x){\n  if(x===null)return\'nil\';\n  if(!is_pair(x))return String(x);\n  const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return`(${a.join(\' \')})` ;\n}\n\n// Lists of symbols\nconst alphabet = list("a", "b", "c", "d");\nconsole.log(display(alphabet));       // (a b c d)\n\n// Mixed — symbols and numbers\nconst mixed = list("x", 1, "y", 2);\nconsole.log(display(mixed));          // (x 1 y 2)\n\n// Expression as data: x + 3\nconst expr = list("+", "x", 3);\nconsole.log(display(expr));           // (+ x 3)',
    },
    {
      type: 'checkpoint',
      id: 'cp-symbols',
    },

    // ── memq ──────────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'memq-vocab',
      text: 'The function memq (member with symbol equality) tests whether a symbol appears in a list. If found, it returns the sub-list starting from that symbol — not just true. If not found, it returns null. Returning the sub-list rather than just true is useful: the caller gets not just "yes it is here" but "here is where it starts and what follows it."',
      code: null,
    },
    {
      type: 'narration',
      id: 'memq-code',
      text: 'Here is memq. It scans the list and returns the sub-list when the symbol is found.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction is_pair(x){return Array.isArray(x);}\nfunction display(x){\n  if(x===null)return\'nil\';\n  if(!is_pair(x))return String(x);\n  const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return`(${a.join(\' \')})` ;\n}\n\nfunction memq(sym, lst) {\n  if (is_null(lst)) return null;\n  if (head(lst) === sym) return lst;    // found — return sub-list from here\n  return memq(sym, tail(lst));          // keep searching\n}\n\nconst s = list("a", "b", "c", "d");\nconsole.log(display(memq("b", s))); // (b c d) — sub-list from b onward\nconsole.log(display(memq("d", s))); // (d)     — last element\nconsole.log(display(memq("x", s))); // nil     — not found',
    },
    {
      type: 'challenge',
      id: 'challenge-count-occurrences',
      text: 'Write count_occurrences(sym, lst) that counts how many times a symbol appears in a list. count_occurrences("a", list("a","b","a","c","a")) should return 3.',
      expectedOutput: '3\n0\n2',
      startCode: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nfunction count_occurrences(sym, lst) {\n  // base: is_null → 0\n  // recursive: 1+count if head matches, else just count on tail\n}\n\nconsole.log(count_occurrences("a", list("a","b","a","c","a"))); // 3\nconsole.log(count_occurrences("z", list("a","b","c")));         // 0\nconsole.log(count_occurrences("x", list("x","y","x")));         // 2\n',
      hint: 'function count_occurrences(sym, lst) {\n  if (is_null(lst)) return 0;\n  const rest = count_occurrences(sym, tail(lst));\n  return head(lst) === sym ? 1 + rest : rest;\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}function head(p){return p[0];}function tail(p){return p[1];}
function is_null(x){return x===null;}function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
${code}
return count_occurrences("a",list("a","b","a","c","a"))===3&&count_occurrences("z",list("a","b","c"))===0`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'narration',
      id: 'substitute-code',
      text: 'substitute(lst, old_sym, new_sym) replaces every occurrence of old_sym in a flat list with new_sym. It is the simplest form of symbolic transformation — a building block for the differentiator and other symbolic systems in later lessons.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction display(x){if(x===null)return\'nil\';if(!is_pair(x))return String(x);const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return`(${a.join(\' \')})`;}\n\nfunction substitute(lst, old_sym, new_sym) {\n  if (is_null(lst)) return null;\n  const h = head(lst) === old_sym ? new_sym : head(lst);\n  return pair(h, substitute(tail(lst), old_sym, new_sym));\n}\n\nconst s = list("a", "b", "a", "c");\nconsole.log(display(substitute(s, "a", "x"))); // (x b x c)\nconsole.log(display(substitute(s, "b", "y"))); // (a y a c)',
    },
    {
      type: 'challenge',
      id: 'challenge-remove-duplicates',
      text: 'Write remove_duplicates(lst) that returns a new list with each symbol appearing only once (keep the first occurrence). remove_duplicates(list("a","b","a","c","b")) should give (a b c). Use memq to check whether an element has already appeared.',
      expectedOutput: '(a b c)',
      startCode: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction memq(sym,lst){if(is_null(lst))return null;if(head(lst)===sym)return lst;return memq(sym,tail(lst));}\nfunction display(x){if(x===null)return\'nil\';if(!is_pair(x))return String(x);const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return`(${a.join(\' \')})`;}\n\nfunction remove_duplicates(lst) {\n  // Hint: build the result list; for each element, only include it\n  // if it has NOT appeared in the already-built result\n}\n\nconsole.log(display(remove_duplicates(list("a","b","a","c","b")))); // (a b c)\n',
      hint: 'function remove_duplicates(lst) {\n  if (is_null(lst)) return null;\n  const rest = remove_duplicates(tail(lst));\n  return memq(head(lst), rest) ? rest : pair(head(lst), rest);\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}function head(p){return p[0];}function tail(p){return p[1];}
function is_null(x){return x===null;}function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
function memq(sym,lst){if(is_null(lst))return null;if(head(lst)===sym)return lst;return memq(sym,tail(lst));}
${code}
const r=remove_duplicates(list("a","b","a","c","b"));
return head(r)==="a"&&head(tail(r))==="b"&&head(tail(tail(r)))==="c"&&is_null(tail(tail(tail(r))))`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-symbol-ops',
    },
  ],
}
