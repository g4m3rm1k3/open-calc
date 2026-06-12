export const lesson = {
  id: 'sicp-2-7',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.4  Multiple Representations for Abstract Data',
  checkpoints: [
    { id: 'cp-tagged-data',   label: 'Tagged Data' },
    { id: 'cp-generic-ops',   label: 'Generic Operations' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Section 2.4 confronts a new problem: what if there is no single best representation for a type? Complex numbers have two natural forms — rectangular (real + imaginary) and polar (magnitude + angle). Both are valid. Conversion between them is expensive. The solution is to allow both representations to coexist, distinguished by type tags. This leads to the idea of generic operations that work regardless of which representation is underneath.',
      code: null,
    },

    // ── Terminology: Tagged Data ──────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'tagged-data-vocab',
      text: 'A tagged datum is a value paired with a type tag — a label that says what representation is being used. The tag sits in a known position so that code can inspect it before deciding how to proceed. Type dispatching means checking the tag and calling the implementation appropriate for that type. This is the data equivalent of the function overloading you see in object-oriented languages. Here, the tag is an explicit part of the data, not hidden in a class system.',
      code: null,
    },

    // ── Complex numbers: two representations ──────────────────────────────────────
    {
      type: 'narration',
      id: 'complex-rectangular',
      text: 'The rectangular representation stores real and imaginary parts directly. Addition is easy in rectangular form: add the real parts and add the imaginary parts. Here are the rectangular implementation with its own constructors and selectors.',
      code: '// Rectangular: [real, imag]\nfunction make_from_real_imag(r, i) { return { tag: \'rect\', real: r, imag: i }; }\nfunction real_part_rect(z)  { return z.real; }\nfunction imag_part_rect(z)  { return z.imag; }\nfunction magnitude_rect(z)  { return Math.sqrt(z.real**2 + z.imag**2); }\nfunction angle_rect(z)      { return Math.atan2(z.imag, z.real); }\n\nconst z1 = make_from_real_imag(3, 4);\nconsole.log(real_part_rect(z1));      // 3\nconsole.log(imag_part_rect(z1));      // 4\nconsole.log(magnitude_rect(z1));      // 5',
    },
    {
      type: 'narration',
      id: 'complex-polar',
      text: 'The polar representation stores magnitude and angle. Multiplication is easy in polar form: multiply the magnitudes and add the angles. Here are the polar implementation.',
      code: '// Polar: [magnitude, angle]\nfunction make_from_mag_ang(r, a) { return { tag: \'polar\', mag: r, ang: a }; }\nfunction real_part_polar(z)  { return z.mag * Math.cos(z.ang); }\nfunction imag_part_polar(z)  { return z.mag * Math.sin(z.ang); }\nfunction magnitude_polar(z)  { return z.mag; }\nfunction angle_polar(z)      { return z.ang; }\n\nconst z2 = make_from_mag_ang(5, Math.PI / 4);\nconsole.log(magnitude_polar(z2));    // 5\nconsole.log(Math.round(real_part_polar(z2) * 100) / 100);  // ~3.54',
    },

    // ── Terminology: Generic operations ──────────────────────────────────────────
    {
      type: 'narration',
      id: 'generic-ops-vocab',
      text: 'A generic operation works correctly regardless of which representation is underneath. It checks the type tag and dispatches to the right implementation. real_part, imag_part, magnitude, and angle are generic: they look at the tag, then call either the rectangular or polar version. The arithmetic operations — add_complex, mul_complex — are written in terms of the generic selectors, so they work with either representation without knowing which one they are getting.',
      code: null,
    },
    {
      type: 'narration',
      id: 'tagged-dispatch',
      text: 'Here is the dispatcher. tag returns the tag. The generic selectors check the tag and call the appropriate implementation. add_complex and mul_complex use only the generic selectors — they never touch the tag directly.',
      code: 'function make_from_real_imag(r, i) { return { tag: \'rect\', real: r, imag: i }; }\nfunction make_from_mag_ang(r, a)   { return { tag: \'polar\', mag: r, ang: a }; }\n\nfunction tag(z) { return z.tag; }\n\nfunction real_part(z) {\n  if (tag(z) === \'rect\')  return z.real;\n  if (tag(z) === \'polar\') return z.mag * Math.cos(z.ang);\n  throw new Error(`Unknown type: ${tag(z)}`);\n}\nfunction imag_part(z) {\n  if (tag(z) === \'rect\')  return z.imag;\n  if (tag(z) === \'polar\') return z.mag * Math.sin(z.ang);\n  throw new Error(`Unknown type: ${tag(z)}`);\n}\nfunction magnitude(z) {\n  if (tag(z) === \'rect\')  return Math.sqrt(z.real**2 + z.imag**2);\n  if (tag(z) === \'polar\') return z.mag;\n  throw new Error(`Unknown type: ${tag(z)}`);\n}\nfunction angle(z) {\n  if (tag(z) === \'rect\')  return Math.atan2(z.imag, z.real);\n  if (tag(z) === \'polar\') return z.ang;\n  throw new Error(`Unknown type: ${tag(z)}`);\n}\n\n// Generic arithmetic\nfunction add_complex(z1, z2) {\n  return make_from_real_imag(\n    real_part(z1) + real_part(z2),\n    imag_part(z1) + imag_part(z2));\n}\nfunction mul_complex(z1, z2) {\n  return make_from_mag_ang(\n    magnitude(z1) * magnitude(z2),\n    angle(z1) + angle(z2));\n}\n\nconst a = make_from_real_imag(3, 4);\nconst b = make_from_mag_ang(5, 0);\nconst sum = add_complex(a, b);\nconsole.log(`${real_part(sum)} + ${imag_part(sum)}i`); // 8 + 4i\nconsole.log(magnitude(mul_complex(a, b)));              // 25',
    },
    {
      type: 'codelens',
      id: 'codelens-dispatch',
      text: 'Open CodeLens on add_complex(a, b) where a is rectangular and b is polar. Step through the generic real_part and imag_part calls — each one inspects the tag and takes a different path. The arithmetic itself is the same code regardless of representation. This is the power of type dispatch.',
      code: 'function make_from_real_imag(r, i) { return { tag: \'rect\', real: r, imag: i }; }\nfunction make_from_mag_ang(r, a) { return { tag: \'polar\', mag: r, ang: a }; }\nfunction real_part(z) { return z.tag===\'rect\' ? z.real : z.mag*Math.cos(z.ang); }\nfunction imag_part(z) { return z.tag===\'rect\' ? z.imag : z.mag*Math.sin(z.ang); }\n\nfunction add_complex(z1, z2) {\n  return make_from_real_imag(real_part(z1) + real_part(z2),\n                              imag_part(z1) + imag_part(z2));\n}\n\nconst a = make_from_real_imag(3, 4);\nconst b = make_from_mag_ang(2, 0);\nconsole.log(JSON.stringify(add_complex(a, b)));',
    },
    {
      type: 'checkpoint',
      id: 'cp-tagged-data',
    },
    {
      type: 'challenge',
      id: 'challenge-conjugate',
      text: 'The complex conjugate of a + bi is a - bi (negate the imaginary part). Write conjugate(z) as a generic operation: if the tag is "rect", return make_from_real_imag(real, -imag). If the tag is "polar", return make_from_mag_ang(mag, -angle) — negating the angle reflects across the real axis. conjugate of 3+4i should give 3-4i.',
      expectedOutput: '3 - 4i\n0',
      startCode: 'function make_from_real_imag(r, i) { return { tag: \'rect\', real: r, imag: i }; }\nfunction make_from_mag_ang(r, a)   { return { tag: \'polar\', mag: r, ang: a }; }\nfunction real_part(z) { return z.tag===\'rect\' ? z.real : z.mag*Math.cos(z.ang); }\nfunction imag_part(z) { return z.tag===\'rect\' ? z.imag : z.mag*Math.sin(z.ang); }\nfunction magnitude(z) { return z.tag===\'rect\' ? Math.sqrt(z.real**2+z.imag**2) : z.mag; }\nfunction angle(z)     { return z.tag===\'rect\' ? Math.atan2(z.imag,z.real) : z.ang; }\n\n// Write conjugate(z) — generic, works for both rect and polar\nfunction conjugate(z) {\n  // your code here\n}\n\nconst z = make_from_real_imag(3, 4);\nconst c = conjugate(z);\nconsole.log(`${real_part(c)} - ${-imag_part(c)}i`);  // 3 - 4i\nconsole.log(Math.round(imag_part(conjugate(make_from_mag_ang(5, 0))))); // 0\n',
      hint: 'function conjugate(z) {\n  if (z.tag === \'rect\') return make_from_real_imag(z.real, -z.imag);\n  if (z.tag === \'polar\') return make_from_mag_ang(z.mag, -z.ang);\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function make_from_real_imag(r,i){return{tag:'rect',real:r,imag:i};}
function make_from_mag_ang(r,a){return{tag:'polar',mag:r,ang:a};}
function imag_part(z){return z.tag==='rect'?z.imag:z.mag*Math.sin(z.ang);}
${code}
const c1 = conjugate(make_from_real_imag(3,4));
const c2 = conjugate(make_from_mag_ang(5,1.0));
return typeof conjugate==='function' && imag_part(c1)===-4 && Math.abs(imag_part(c2)+Math.sin(1.0)*5)<0.001`)
          return fn() === true
        } catch { return false }
      },
    },

    // ── Data-directed programming ─────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'data-directed-vocab',
      text: 'The if/else dispatch table in real_part and imag_part has a problem: every time you add a new representation, you must edit every generic operation. Data-directed programming solves this by storing the implementations in a table indexed by (operation, type). Adding a new representation means adding new rows to the table — no existing code changes. This is the open/closed principle: open for extension, closed for modification. SICP uses this technique extensively in Chapter 2.5 to build a generic arithmetic system.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dispatch-table',
      text: 'Here is the dispatch table approach. put registers an implementation for a given operation and type. get retrieves it. apply_generic looks up the right function for the tag and calls it. Now adding a "polar" package means calling put once for each operation — apply_generic never needs to change.',
      code: 'const dispatch_table = {};\n\nfunction put(op, type, fn) {\n  if (!dispatch_table[op]) dispatch_table[op] = {};\n  dispatch_table[op][type] = fn;\n}\nfunction get(op, type) {\n  return dispatch_table[op] && dispatch_table[op][type];\n}\n\nfunction apply_generic(op, z) {\n  const fn = get(op, z.tag);\n  if (!fn) throw new Error(`No method ${op} for type ${z.tag}`);\n  return fn(z);\n}\n\n// Register rectangular implementations\nput(\'real_part\', \'rect\', z => z.real);\nput(\'imag_part\', \'rect\', z => z.imag);\nput(\'magnitude\', \'rect\', z => Math.sqrt(z.real**2 + z.imag**2));\n\n// Register polar implementations\nput(\'real_part\', \'polar\', z => z.mag * Math.cos(z.ang));\nput(\'imag_part\', \'polar\', z => z.mag * Math.sin(z.ang));\nput(\'magnitude\', \'polar\', z => z.mag);\n\n// Generic operations — never need to change\nconst real_part = z => apply_generic(\'real_part\', z);\nconst imag_part = z => apply_generic(\'imag_part\', z);\nconst magnitude = z => apply_generic(\'magnitude\', z);\n\nconst a = { tag: \'rect\', real: 3, imag: 4 };\nconst b = { tag: \'polar\', mag: 5, ang: Math.PI / 6 };\nconsole.log(magnitude(a));   // 5\nconsole.log(magnitude(b));   // 5\nconsole.log(Math.round(real_part(b) * 1000) / 1000); // 4.330',
    },
    {
      type: 'checkpoint',
      id: 'cp-generic-ops',
    },
  ],
}
