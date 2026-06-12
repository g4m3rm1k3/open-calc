export const lesson = {
  id: 'sicp-2-7',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.4  Multiple Representations for Abstract Data',
  checkpoints: [
    { id: 'cp-two-representations', label: 'Two Representations' },
    { id: 'cp-tagged-dispatch',     label: 'Type Tags & Dispatch' },
    { id: 'cp-data-directed',       label: 'Data-Directed Style' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Chapter 2.1 showed that rational numbers could be represented as pairs, with an abstraction barrier hiding the representation from the arithmetic operations. There was one representation, and it was the right one. But what if a type has two equally valid representations, each useful for different operations? This is not a hypothetical problem — it comes up constantly in software. Chapter 2.4 uses complex numbers as the example, because complex numbers genuinely have two natural forms that no one wants to give up.',
      code: null,
    },

    // ── The problem: two equally good representations ─────────────────────────────
    {
      type: 'narration',
      id: 'complex-numbers-problem',
      text: 'A complex number like 3 + 4i can be written in rectangular form (real part 3, imaginary part 4) or polar form (magnitude 5, angle arctan(4/3)). Neither is "more correct." Addition is easy in rectangular form: add real parts, add imaginary parts. Multiplication is easy in polar form: multiply magnitudes, add angles. Converting between forms involves trigonometry and is expensive. If we could only choose one representation, we would be slow at either addition or multiplication. We want both.',
      code: null,
    },
    {
      type: 'narration',
      id: 'rectangular-representation',
      text: 'Here is the rectangular representation. The constructor takes real and imaginary parts. The selectors return them directly. Magnitude and angle must be computed via trigonometry.',
      code: 'function make_rect(real, imag) { return { kind: \'rect\', real, imag }; }\n\nfunction real_rect(z)  { return z.real; }\nfunction imag_rect(z)  { return z.imag; }\nfunction mag_rect(z)   { return Math.sqrt(z.real**2 + z.imag**2); }\nfunction angle_rect(z) { return Math.atan2(z.imag, z.real); }\n\nconst z = make_rect(3, 4);\nconsole.log(real_rect(z));  // 3\nconsole.log(imag_rect(z));  // 4\nconsole.log(mag_rect(z));   // 5',
    },
    {
      type: 'narration',
      id: 'polar-representation',
      text: 'Here is the polar representation. Magnitude and angle are stored directly. Real and imaginary parts must be computed from them via trigonometry. Note: the selector names (mag_polar, angle_polar) are different from the constructors — both representations exist simultaneously, each with its own functions.',
      code: 'function make_polar(mag, angle) { return { kind: \'polar\', mag, angle }; }\n\nfunction real_polar(z)  { return z.mag * Math.cos(z.angle); }\nfunction imag_polar(z)  { return z.mag * Math.sin(z.angle); }\nfunction mag_polar(z)   { return z.mag; }\nfunction angle_polar(z) { return z.angle; }\n\nconst z = make_polar(5, Math.PI / 4);\nconsole.log(mag_polar(z));                          // 5\nconsole.log(Math.round(real_polar(z) * 100) / 100); // 3.54',
    },
    {
      type: 'checkpoint',
      id: 'cp-two-representations',
    },

    // ── The problem with two separate implementations ─────────────────────────────
    {
      type: 'narration',
      id: 'dispatch-problem-vocab',
      text: 'Now we have two complete implementations of complex numbers. The problem: if we write add_complex, which selectors do we use? We cannot call both real_rect and real_polar — we have to know which representation we are holding. And that knowledge needs to come from the datum itself, not from the caller. The caller should not have to know or care which representation is inside. The solution is a type tag: attach a label to every datum that says which representation it uses, and dispatch to the right implementation based on that label.',
      code: null,
    },

    // ── Terminology: type tags ────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'type-tag-vocab',
      text: 'A tagged datum is a value that carries its own type information. The type tag is a piece of data attached to every complex number that says "I am rectangular" or "I am polar." Type dispatching is the process of reading the tag and calling the appropriate implementation. In our design, the "kind" field in the object IS the tag. Every generic operation — real_part, imag_part, magnitude, angle — reads the kind field and dispatches.',
      code: null,
    },
    {
      type: 'narration',
      id: 'generic-selectors',
      text: 'Here are the generic selectors. Each checks the type tag and delegates to the appropriate representation-specific function. The arithmetic operations will use only these generic names.',
      code: 'function make_rect(r, i)  { return { kind: \'rect\', real: r, imag: i }; }\nfunction make_polar(m, a) { return { kind: \'polar\', mag: m, angle: a }; }\n\nfunction real_part(z) {\n  if (z.kind === \'rect\')  return z.real;\n  if (z.kind === \'polar\') return z.mag * Math.cos(z.angle);\n  throw new Error(`Unknown kind: ${z.kind}`);\n}\nfunction imag_part(z) {\n  if (z.kind === \'rect\')  return z.imag;\n  if (z.kind === \'polar\') return z.mag * Math.sin(z.angle);\n  throw new Error(`Unknown kind: ${z.kind}`);\n}\nfunction magnitude(z) {\n  if (z.kind === \'rect\')  return Math.sqrt(z.real**2 + z.imag**2);\n  if (z.kind === \'polar\') return z.mag;\n  throw new Error(`Unknown kind: ${z.kind}`);\n}\n\nconst a = make_rect(3, 4);\nconst b = make_polar(5, 0);\nconsole.log(real_part(a));  // 3  — rect path taken\nconsole.log(real_part(b));  // 5  — polar path taken\nconsole.log(magnitude(a));  // 5  — rect path computes it',
    },
    {
      type: 'narration',
      id: 'arithmetic-generic',
      text: 'Now add_complex and mul_complex can be written once. They use only the generic selectors — they never look at the kind field themselves. The tag is the interface between the arithmetic layer and the representation layer.',
      code: 'function make_rect(r,i){return{kind:\'rect\',real:r,imag:i};}\nfunction make_polar(m,a){return{kind:\'polar\',mag:m,angle:a};}\nfunction real_part(z){return z.kind===\'rect\'?z.real:z.mag*Math.cos(z.angle);}\nfunction imag_part(z){return z.kind===\'rect\'?z.imag:z.mag*Math.sin(z.angle);}\nfunction magnitude(z){return z.kind===\'rect\'?Math.sqrt(z.real**2+z.imag**2):z.mag;}\nfunction angle(z){return z.kind===\'rect\'?Math.atan2(z.imag,z.real):z.angle;}\n\nfunction add_complex(z1, z2) {\n  return make_rect(real_part(z1) + real_part(z2),\n                   imag_part(z1) + imag_part(z2));\n}\nfunction mul_complex(z1, z2) {\n  return make_polar(magnitude(z1) * magnitude(z2),\n                    angle(z1)     + angle(z2));\n}\n\n// Mixed: one rectangular + one polar\nconst a = make_rect(3, 4);\nconst b = make_polar(2, 0);\nconst sum = add_complex(a, b);\nconsole.log(`${real_part(sum)} + ${imag_part(sum)}i`); // 5 + 4i',
    },
    {
      type: 'codelens',
      id: 'codelens-dispatch',
      text: 'Open CodeLens on add_complex(a, b) where a is rectangular (kind="rect") and b is polar (kind="polar"). Step through real_part — watch it check the kind field and take different code paths for each argument. The arithmetic is the same code for any combination of representations. That is the abstraction barrier between arithmetic and representation.',
      code: 'function make_rect(r,i){return{kind:\'rect\',real:r,imag:i};}\nfunction make_polar(m,a){return{kind:\'polar\',mag:m,angle:a};}\nfunction real_part(z){return z.kind===\'rect\'?z.real:z.mag*Math.cos(z.angle);}\nfunction imag_part(z){return z.kind===\'rect\'?z.imag:z.mag*Math.sin(z.angle);}\nfunction add_complex(z1,z2){return make_rect(real_part(z1)+real_part(z2),imag_part(z1)+imag_part(z2));}\n\nconst a = make_rect(3, 4);\nconst b = make_polar(2, 0);\nconsole.log(JSON.stringify(add_complex(a, b)));',
    },
    {
      type: 'challenge',
      id: 'challenge-conjugate',
      text: 'Write conjugate(z) as a generic operation. The complex conjugate of a + bi is a - bi (negate the imaginary part). In polar form, conjugating negates the angle: magnitude stays the same, angle is negated. Use the kind field to dispatch. conjugate of rect(3, 4) should give a number with imaginary part -4. conjugate of polar(5, 0.5) should give polar(5, -0.5).',
      expectedOutput: '-4\n-0.5',
      startCode: 'function make_rect(r,i){return{kind:\'rect\',real:r,imag:i};}\nfunction make_polar(m,a){return{kind:\'polar\',mag:m,angle:a};}\nfunction imag_part(z){return z.kind===\'rect\'?z.imag:z.mag*Math.sin(z.angle);}\nfunction angle(z){return z.kind===\'rect\'?Math.atan2(z.imag,z.real):z.angle;}\n\n// Write conjugate(z) — check kind, dispatch to right implementation\nfunction conjugate(z) {\n  // your code here\n}\n\nconsole.log(imag_part(conjugate(make_rect(3, 4))));    // -4\nconsole.log(angle(conjugate(make_polar(5, 0.5))));     // -0.5\n',
      hint: 'function conjugate(z) {\n  if (z.kind === \'rect\')  return make_rect(z.real, -z.imag);\n  if (z.kind === \'polar\') return make_polar(z.mag, -z.angle);\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function make_rect(r,i){return{kind:'rect',real:r,imag:i};}
function make_polar(m,a){return{kind:'polar',mag:m,angle:a};}
function imag_part(z){return z.kind==='rect'?z.imag:z.mag*Math.sin(z.angle);}
function angle(z){return z.kind==='rect'?Math.atan2(z.imag,z.real):z.angle;}
${code}
return imag_part(conjugate(make_rect(3,4)))===-4 && angle(conjugate(make_polar(5,0.5)))===-0.5`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-tagged-dispatch',
    },

    // ── Data-directed programming ─────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'dispatch-table-problem-vocab',
      text: 'The if/else chain in real_part has a structural problem. If a third representation is added — say, "cartesian with exact fractions" — every generic operation must be edited to add a new branch. As the number of representations grows, so does the maintenance burden. Every developer who adds a representation must know about and modify all the generic operations. This is the fragile base class problem in disguise. Data-directed programming solves it with a dispatch table: a two-dimensional lookup structure indexed by (operation-name, type-name). Adding a new representation means adding rows to the table, not editing existing functions.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dispatch-table-vocab',
      text: 'The dispatch table stores (operation, type) → implementation entries. get(op, type) retrieves the implementation for an operation on a given type. put(op, type, fn) registers an implementation. apply_generic reads the type tag from the datum, looks up the right implementation, and calls it. With this structure, each "package" of implementations for one representation can be added independently — no editing of existing code.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dispatch-table-impl',
      text: 'Here is the dispatch table and apply_generic. Then two packages — rectangular and polar — register their implementations independently. The generic operations (real_part, imag_part, magnitude) never change when a new package is added.',
      code: 'const table = {};\nfunction put(op, kind, fn) {\n  if (!table[op]) table[op] = {};\n  table[op][kind] = fn;\n}\nfunction get(op, kind) { return table[op] && table[op][kind]; }\n\nfunction apply_generic(op, z) {\n  const fn = get(op, z.kind);\n  if (!fn) throw new Error(`No ${op} for ${z.kind}`);\n  return fn(z);\n}\n\n// Rectangular package — installs its implementations into the table\nput(\'real_part\', \'rect\', z => z.real);\nput(\'imag_part\', \'rect\', z => z.imag);\nput(\'magnitude\', \'rect\', z => Math.sqrt(z.real**2 + z.imag**2));\n\n// Polar package — completely independent\nput(\'real_part\', \'polar\', z => z.mag * Math.cos(z.angle));\nput(\'imag_part\', \'polar\', z => z.mag * Math.sin(z.angle));\nput(\'magnitude\', \'polar\', z => z.mag);\n\n// Generic operations — never need to change when new packages arrive\nconst real_part = z => apply_generic(\'real_part\', z);\nconst imag_part = z => apply_generic(\'imag_part\', z);\nconst magnitude = z => apply_generic(\'magnitude\', z);\n\nconst a = { kind: \'rect\', real: 3, imag: 4 };\nconst b = { kind: \'polar\', mag: 5, angle: 0 };\n\nconsole.log(magnitude(a));  // 5  — dispatched to rect implementation\nconsole.log(magnitude(b));  // 5  — dispatched to polar implementation\nconsole.log(real_part(b));  // 5  — cos(0) = 1, so 5 * 1 = 5',
    },
    {
      type: 'narration',
      id: 'open-closed-vocab',
      text: 'The data-directed approach satisfies the open/closed principle: the system is open for extension (you can add new representations by adding new table entries) and closed for modification (existing generic operations and existing packages need no changes). This is the same principle behind well-designed plugin systems, database drivers, and codec libraries. SICP shows that it can be built from scratch using only tables and closures.',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-new-package',
      text: 'Add a third representation: unit-circle form, kind="unit", which stores only an angle (magnitude is always 1). Write a "unit" package that puts real_part, imag_part, and magnitude into the dispatch table. magnitude of a unit number is always 1. real_part is cos(angle), imag_part is sin(angle). Then create { kind: "unit", angle: Math.PI/2 } and verify real_part ≈ 0 and imag_part ≈ 1.',
      expectedOutput: '1\n0',
      startCode: 'const table = {};\nfunction put(op,kind,fn){if(!table[op])table[op]={};table[op][kind]=fn;}\nfunction get(op,kind){return table[op]&&table[op][kind];}\nfunction apply_generic(op,z){const fn=get(op,z.kind);if(!fn)throw new Error(`No ${op} for ${z.kind}`);return fn(z);}\n\nput(\'real_part\', \'rect\', z => z.real);\nput(\'imag_part\', \'rect\', z => z.imag);\nput(\'magnitude\', \'rect\', z => Math.sqrt(z.real**2 + z.imag**2));\n\nput(\'real_part\', \'polar\', z => z.mag * Math.cos(z.angle));\nput(\'imag_part\', \'polar\', z => z.mag * Math.sin(z.angle));\nput(\'magnitude\', \'polar\', z => z.mag);\n\n// Add the "unit" package here — magnitude always 1, real=cos, imag=sin\n\n\nconst real_part = z => apply_generic(\'real_part\', z);\nconst imag_part = z => apply_generic(\'imag_part\', z);\nconst magnitude = z => apply_generic(\'magnitude\', z);\n\nconst u = { kind: \'unit\', angle: Math.PI / 2 };\nconsole.log(magnitude(u));                     // 1\nconsole.log(Math.round(real_part(u)));         // 0  (cos(π/2) ≈ 0)\n',
      hint: 'put(\'real_part\', \'unit\', z => Math.cos(z.angle));\nput(\'imag_part\', \'unit\', z => Math.sin(z.angle));\nput(\'magnitude\', \'unit\', _z => 1);',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nconst magnitude=z=>apply_generic('magnitude',z);const real_part=z=>apply_generic('real_part',z);const u={kind:'unit',angle:Math.PI/2};return magnitude(u)===1&&Math.abs(real_part(u))<0.0001`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-data-directed',
    },
  ],
}
