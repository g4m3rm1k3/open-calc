export const lesson = {
  id: 'sicp-2-7',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.4  Multiple Representations for Abstract Data',
  checkpoints: [
    { id: 'cp-two-representations', label: 'Two Representations' },
    { id: 'cp-tagged-dispatch',     label: 'Type Tags' },
    { id: 'cp-data-directed',       label: 'Data-Directed' },
  ],
  segments: [

    {
      type: 'narration',
      id: 'intro',
      text: 'Chapter 2.1 showed rational numbers with one representation (a pair of integers) hidden behind an abstraction barrier. There was one right way to store a rational. But some types have two equally valid representations, each natural for different operations.\n\nComplex numbers are the example. They can be stored as (real, imaginary) — rectangular form — or as (magnitude, angle) — polar form. Addition is easy in rectangular form; multiplication is easy in polar form. We need BOTH forms available simultaneously.\n\nSection 2.4 solves this with type tags: each datum carries a label identifying its representation. Generic selectors dispatch on the tag. Data-directed programming goes further: instead of if/else chains on tags, use a dispatch table that can be extended without touching existing code.',
      code: null,
    },

    // ── Two representations ────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'complex-math',
      text: 'Complex number arithmetic:\n  Add: (r1 + r2, i1 + i2) — easy in rectangular form\n  Multiply: (mag1 * mag2, angle1 + angle2) — easy in polar form\n\nDefine both representations separately. Each has its own constructor and selectors.',
      code: `// Rectangular: store as { form: 'rect', real, imag }
function make_from_real_imag(r, i)   { return { form: 'rect', real: r, imag: i }; }
function real_rect(z)                { return z.real; }
function imag_rect(z)                { return z.imag; }
function magnitude_rect(z)           { return Math.sqrt(z.real**2 + z.imag**2); }
function angle_rect(z)               { return Math.atan2(z.imag, z.real); }

// Polar: store as { form: 'polar', mag, ang }
function make_from_mag_ang(m, a)     { return { form: 'polar', mag: m, ang: a }; }
function real_polar(z)               { return z.mag * Math.cos(z.ang); }
function imag_polar(z)               { return z.mag * Math.sin(z.ang); }
function magnitude_polar(z)          { return z.mag; }
function angle_polar(z)              { return z.ang; }`,
    },
    { type: 'checkpoint', id: 'cp-two-representations' },

    // ── Type tags and dispatch ─────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'tagged-dispatch-vocab',
      text: 'To use both representations together, the generic selectors must detect which form a datum is in and call the appropriate implementation. The form field IS the type tag. Generic real_part, imag_part, magnitude, angle dispatch on z.form.',
      code: null,
    },
    {
      type: 'narration',
      id: 'generic-selectors',
      text: 'Generic selectors: check the form tag and route to the right implementation.',
      code: `function real_part(z) {
  if (z.form === 'rect')  return z.real;
  if (z.form === 'polar') return z.mag * Math.cos(z.ang);
  throw new Error('Unknown form');
}
function imag_part(z) {
  if (z.form === 'rect')  return z.imag;
  if (z.form === 'polar') return z.mag * Math.sin(z.ang);
  throw new Error('Unknown form');
}
function magnitude(z) {
  if (z.form === 'rect')  return Math.sqrt(z.real**2 + z.imag**2);
  if (z.form === 'polar') return z.mag;
  throw new Error('Unknown form');
}
function angle(z) {
  if (z.form === 'rect')  return Math.atan2(z.imag, z.real);
  if (z.form === 'polar') return z.ang;
  throw new Error('Unknown form');
}`,
    },
    {
      type: 'narration',
      id: 'generic-arithmetic',
      text: 'Arithmetic using generic selectors. add_complex uses rectangular form naturally; mul_complex uses polar form naturally — both work on either input form.',
      code: `function real_part(z)  { return z.form==='rect'?z.real:z.mag*Math.cos(z.ang); }
function imag_part(z)  { return z.form==='rect'?z.imag:z.mag*Math.sin(z.ang); }
function magnitude(z)  { return z.form==='rect'?Math.sqrt(z.real**2+z.imag**2):z.mag; }
function angle(z)      { return z.form==='rect'?Math.atan2(z.imag,z.real):z.ang; }

function make_from_real_imag(r,i){ return{form:'rect',real:r,imag:i}; }
function make_from_mag_ang(m,a)  { return{form:'polar',mag:m,ang:a}; }

function add_complex(z1, z2) {
  return make_from_real_imag(
    real_part(z1) + real_part(z2),
    imag_part(z1) + imag_part(z2)
  );
}
function mul_complex(z1, z2) {
  return make_from_mag_ang(
    magnitude(z1) * magnitude(z2),
    angle(z1) + angle(z2)
  );
}

const z1 = make_from_real_imag(3, 4);   // 3 + 4i — rectangular
const z2 = make_from_mag_ang(5, 0.927); // ≈ 3 + 4i — polar

const sum = add_complex(z1, z2);
console.log(\`sum: \${real_part(sum).toFixed(2)} + \${imag_part(sum).toFixed(2)}i\`);`,
    },
    { type: 'checkpoint', id: 'cp-tagged-dispatch' },

    // ── Data-directed programming ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'data-directed-problem',
      text: 'The if/else dispatch has a problem: adding a new representation requires modifying every generic selector. For two representations, that is manageable. For ten, it becomes an unmaintainable chain of if/else branches.\n\nThe better solution: a dispatch table. Keys are (operation, type) pairs. Values are implementation functions. To add a new representation, just install its implementations in the table. Nothing else changes.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dispatch-table',
      text: 'A simple dispatch table: a JavaScript Map of Maps.',
      code: `const table = new Map();

function put(op, type, fn)  { if (!table.has(op)) table.set(op, new Map()); table.get(op).set(type, fn); }
function get_fn(op, type)   { return table.has(op) && table.get(op).has(type) ? table.get(op).get(type) : null; }`,
    },
    {
      type: 'narration',
      id: 'install-rectangular',
      text: 'Install the rectangular package. It puts each of its implementations into the table under the type tag "rect".',
      code: `const table = new Map();
function put(op, type, fn)  { if (!table.has(op)) table.set(op, new Map()); table.get(op).set(type, fn); }
function get_fn(op, type)   { return table.has(op) && table.get(op).has(type) ? table.get(op).get(type) : null; }

function install_rectangular() {
  function make(r, i) { return { tag: 'rect', real: r, imag: i }; }

  put('real_part', 'rect', z => z.real);
  put('imag_part', 'rect', z => z.imag);
  put('magnitude', 'rect', z => Math.sqrt(z.real**2 + z.imag**2));
  put('angle',     'rect', z => Math.atan2(z.imag, z.real));
  put('make',      'rect', make);
}

install_rectangular();
console.log(get_fn('real_part', 'rect')({ tag:'rect', real:3, imag:4 })); // 3`,
    },
    {
      type: 'narration',
      id: 'install-polar',
      text: 'Install the polar package. Same pattern, different implementations.',
      code: `const table = new Map();
function put(op, type, fn)  { if (!table.has(op)) table.set(op, new Map()); table.get(op).set(type, fn); }
function get_fn(op, type)   { return table.has(op) && table.get(op).has(type) ? table.get(op).get(type) : null; }

function install_rectangular() {
  put('real_part', 'rect', z => z.real);
  put('imag_part', 'rect', z => z.imag);
  put('magnitude', 'rect', z => Math.sqrt(z.real**2 + z.imag**2));
  put('angle',     'rect', z => Math.atan2(z.imag, z.real));
  put('make',      'rect', (r,i) => ({tag:'rect',real:r,imag:i}));
}

function install_polar() {
  put('real_part', 'polar', z => z.mag * Math.cos(z.ang));
  put('imag_part', 'polar', z => z.mag * Math.sin(z.ang));
  put('magnitude', 'polar', z => z.mag);
  put('angle',     'polar', z => z.ang);
  put('make',      'polar', (m,a) => ({tag:'polar',mag:m,ang:a}));
}

install_rectangular();
install_polar();`,
    },
    {
      type: 'narration',
      id: 'generic-dispatch',
      text: 'Generic selectors now look up the implementation in the table. Adding a third representation requires only writing the new package — no changes to apply, add_complex, or mul_complex.',
      code: `const table = new Map();
function put(op, type, fn)  { if (!table.has(op)) table.set(op, new Map()); table.get(op).set(type, fn); }
function get_fn(op, type)   { const m=table.get(op); return m&&m.has(type)?m.get(type):null; }
function install_rectangular() {
  put('real_part','rect',z=>z.real); put('imag_part','rect',z=>z.imag);
  put('magnitude','rect',z=>Math.sqrt(z.real**2+z.imag**2)); put('angle','rect',z=>Math.atan2(z.imag,z.real));
  put('make','rect',(r,i)=>({tag:'rect',real:r,imag:i}));
}
function install_polar() {
  put('real_part','polar',z=>z.mag*Math.cos(z.ang)); put('imag_part','polar',z=>z.mag*Math.sin(z.ang));
  put('magnitude','polar',z=>z.mag); put('angle','polar',z=>z.ang);
  put('make','polar',(m,a)=>({tag:'polar',mag:m,ang:a}));
}
install_rectangular(); install_polar();

// Generic selector: look up in table using the tag
function real_part(z)  { return get_fn('real_part', z.tag)(z); }
function imag_part(z)  { return get_fn('imag_part', z.tag)(z); }
function magnitude(z)  { return get_fn('magnitude', z.tag)(z); }

function add_complex(z1, z2) {
  return get_fn('make','rect')(real_part(z1)+real_part(z2), imag_part(z1)+imag_part(z2));
}

const r = get_fn('make','rect')(3, 4);
const p = get_fn('make','polar')(5, 0.927);
const sum = add_complex(r, p);
console.log(\`\${real_part(sum).toFixed(2)} + \${imag_part(sum).toFixed(2)}i\`);`,
    },
    { type: 'checkpoint', id: 'cp-data-directed' },

    {
      type: 'challenge',
      id: 'challenge-conjugate',
      text: 'Add a conjugate operation to the data-directed complex number system. The conjugate of a+bi is a-bi (negate the imaginary part). For polar form, the conjugate of (mag, angle) is (mag, -angle). Install conjugate in both packages. The generic conjugate function should look it up in the table and work for both forms.',
      expectedOutput: '3\n-4\n5',
      startCode: `const table = new Map();
function put(op, type, fn)  { if (!table.has(op)) table.set(op, new Map()); table.get(op).set(type, fn); }
function get_fn(op, type)   { const m=table.get(op); return m&&m.has(type)?m.get(type):null; }

function install_rectangular() {
  put('real_part','rect',z=>z.real); put('imag_part','rect',z=>z.imag);
  put('magnitude','rect',z=>Math.sqrt(z.real**2+z.imag**2));
  put('make','rect',(r,i)=>({tag:'rect',real:r,imag:i}));
  // ADD: conjugate for rect — negate imag
}

function install_polar() {
  put('real_part','polar',z=>z.mag*Math.cos(z.ang)); put('imag_part','polar',z=>z.mag*Math.sin(z.ang));
  put('magnitude','polar',z=>z.mag);
  put('make','polar',(m,a)=>({tag:'polar',mag:m,ang:a}));
  // ADD: conjugate for polar — negate angle
}

install_rectangular(); install_polar();

function real_part(z)  { return get_fn('real_part',z.tag)(z); }
function imag_part(z)  { return get_fn('imag_part',z.tag)(z); }
function magnitude(z)  { return get_fn('magnitude',z.tag)(z); }

// Generic conjugate
function conjugate(z) { return get_fn('conjugate', z.tag)(z); }

const z = get_fn('make','rect')(3, 4);
const zc = conjugate(z);
console.log(real_part(zc));  // 3
console.log(imag_part(zc));  // -4
console.log(Math.round(magnitude(zc)));  // 5
`,
      hint: '// In install_rectangular:\nput(\'conjugate\',\'rect\',z=>({tag:\'rect\',real:z.real,imag:-z.imag}));\n// In install_polar:\nput(\'conjugate\',\'polar\',z=>({tag:\'polar\',mag:z.mag,ang:-z.ang}));',
      validate: ({ logs }) => logs.some(l => l.trim() === '-4') && logs.some(l => l.trim() === '3'),
    },
  ],
}
