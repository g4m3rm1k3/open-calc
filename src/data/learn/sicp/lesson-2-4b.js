export const lesson = {
  id: 'sicp-2-4b',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.2.4  Example: The Picture Language',
  checkpoints: [
    { id: 'cp-painters',     label: 'Painters' },
    { id: 'cp-combinators',  label: 'Combinators' },
    { id: 'cp-recursion',    label: 'Recursive Painters' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Section 2.2.4 is different from every other section in the book. It is not introducing a new data structure or algorithm technique. It is demonstrating a principle through an elaborate example: the picture language shows what it looks like to design a language within a language, using the same closure property that makes lists so powerful. A painter is a function. Combinators are higher-order functions that build new painters from old ones. Any combined painter can be further combined — the same closure property that lets pair hold a pair.',
      code: null,
    },

    // ── Terminology: Painters and Frames ─────────────────────────────────────────
    {
      type: 'narration',
      id: 'painter-vocab',
      text: 'A painter is a function that takes a frame and draws something inside it. A frame is a coordinate transformation — it specifies an origin point and two edge vectors. The painter does not know or care about the absolute coordinates of the screen. It only knows about the frame it receives. This makes painters composable: a combinator can split a frame, pass half to each sub-painter, and the sub-painters draw themselves correctly in their sub-frame without knowing they have been resized.',
      code: null,
    },
    {
      type: 'narration',
      id: 'frame-vectors-code',
      text: 'Here is a frame represented as three vectors: origin, horiz (horizontal edge), and vert (vertical edge). The function frame_coord_map converts a unit-square coordinate (s, t) to an absolute point within the frame.',
      code: 'function make_vect(x, y) { return { x, y }; }\nfunction add_vect(v1, v2) { return make_vect(v1.x + v2.x, v1.y + v2.y); }\nfunction scale_vect(s, v) { return make_vect(s * v.x, s * v.y); }\n\nfunction make_frame(origin, horiz, vert) { return { origin, horiz, vert }; }\nfunction origin_frame(f) { return f.origin; }\nfunction horiz_frame(f)  { return f.horiz; }\nfunction vert_frame(f)   { return f.vert; }\n\nfunction frame_coord_map(frame) {\n  return (s, t) => add_vect(\n    origin_frame(frame),\n    add_vect(scale_vect(s, horiz_frame(frame)),\n             scale_vect(t, vert_frame(frame)))\n  );\n}\n\n// A frame from (0,0) to (1,0) to (0,1) — the unit square\nconst unit_frame = make_frame(\n  make_vect(0, 0),\n  make_vect(1, 0),\n  make_vect(0, 1)\n);\n\nconst map = frame_coord_map(unit_frame);\nconsole.log(JSON.stringify(map(0, 0))); // origin: {x:0,y:0}\nconsole.log(JSON.stringify(map(1, 0))); // right corner: {x:1,y:0}\nconsole.log(JSON.stringify(map(0.5, 0.5))); // center: {x:0.5,y:0.5}',
    },

    // ── Simple painters ───────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'simple-painters-vocab',
      text: 'A painter is a function from a frame to a description of what it draws. For this interactive environment we represent drawings as text descriptions. The key is the type: (frame) → description. We can compose these functions without needing actual pixels.',
      code: null,
    },
    {
      type: 'narration',
      id: 'simple-painters-code',
      text: 'Here are two simple painters. wave draws a stick figure in the given frame. rogers draws "Rogers" (representing a photograph). Both take a frame and return a description. The important thing is not what they draw but that they are functions.',
      code: 'function make_frame(origin, horiz, vert) { return { origin, horiz, vert }; }\nfunction make_vect(x, y) { return { x, y }; }\n\n// A painter is a function: frame → string description\nconst wave = frame => `wave-figure in frame at (${frame.origin.x.toFixed(1)},${frame.origin.y.toFixed(1)})`;\nconst rogers = frame => `rogers-portrait in frame at (${frame.origin.x.toFixed(1)},${frame.origin.y.toFixed(1)})`;\n\nconst unit_frame = make_frame(make_vect(0,0), make_vect(1,0), make_vect(0,1));\n\nconsole.log(wave(unit_frame));   // wave-figure in frame at (0.0,0.0)\nconsole.log(rogers(unit_frame)); // rogers-portrait in frame at (0.0,0.0)\n\n// Painters are values — store them, pass them, return them\nconst my_painter = wave;\nconsole.log(my_painter(unit_frame) === wave(unit_frame)); // true',
    },
    {
      type: 'checkpoint',
      id: 'cp-painters',
    },

    // ── Combinators ───────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'combinator-vocab',
      text: 'A combinator takes one or more painters and returns a new painter. beside(p1, p2) places p1 in the left half of the frame and p2 in the right half. It does this by computing two sub-frames from the given frame, then calling each painter with its sub-frame. The painters do not know they have been placed side by side — they just draw in whatever frame they receive.',
      code: null,
    },
    {
      type: 'narration',
      id: 'beside-code',
      text: 'beside splits the frame horizontally at the midpoint, computes a left sub-frame and a right sub-frame, then calls each painter. The sub-frames are computed by scaling the horiz vector.',
      code: 'function make_frame(origin, horiz, vert) { return { origin, horiz, vert }; }\nfunction make_vect(x, y) { return { x, y }; }\nfunction add_vect(v1, v2) { return { x: v1.x+v2.x, y: v1.y+v2.y }; }\nfunction scale_vect(s, v) { return { x: s*v.x, y: s*v.y }; }\n\nfunction beside(painter1, painter2) {\n  return function(frame) {\n    const split_horiz = scale_vect(0.5, frame.horiz);\n    const left_frame  = make_frame(frame.origin, split_horiz, frame.vert);\n    const right_frame = make_frame(\n      add_vect(frame.origin, split_horiz),\n      split_horiz, frame.vert\n    );\n    return painter1(left_frame) + \' | \' + painter2(right_frame);\n  };\n}\n\nconst wave   = f => `wave@(${f.origin.x.toFixed(1)},${f.origin.y.toFixed(1)},w=${f.horiz.x.toFixed(1)})`;\nconst rogers = f => `rogers@(${f.origin.x.toFixed(1)},${f.origin.y.toFixed(1)},w=${f.horiz.x.toFixed(1)})`;\nconst unit_frame = make_frame(make_vect(0,0), make_vect(1,0), make_vect(0,1));\n\nconst waver = beside(wave, rogers);\nconsole.log(waver(unit_frame)); // wave in left half | rogers in right half',
    },
    {
      type: 'narration',
      id: 'below-flip-code',
      text: 'below stacks painters vertically. flip_vert reflects a painter upside down by flipping the vert vector. flip_horiz mirrors left-right. Both take a painter and return a new painter — no special rendering code needed, just frame arithmetic.',
      code: 'function make_frame(o,h,v){return{origin:o,horiz:h,vert:v};}\nfunction make_vect(x,y){return{x,y};}\nfunction add_vect(a,b){return{x:a.x+b.x,y:a.y+b.y};}\nfunction scale_vect(s,v){return{x:s*v.x,y:s*v.y};}\n\nfunction below(p1, p2) {\n  return frame => {\n    const split_vert = scale_vect(0.5, frame.vert);\n    const top_frame = make_frame(add_vect(frame.origin,split_vert), frame.horiz, split_vert);\n    const bot_frame = make_frame(frame.origin, frame.horiz, split_vert);\n    return p2(bot_frame) + \'\\n\' + p1(top_frame);\n  };\n}\n\nfunction flip_vert(painter) {\n  return frame => painter(make_frame(\n    add_vect(frame.origin, frame.vert),\n    frame.horiz,\n    scale_vect(-1, frame.vert) // negate the vertical direction\n  ));\n}\n\nconst wave = f => `wave(${f.origin.y.toFixed(2)} top=${(f.origin.y+f.vert.y).toFixed(2)})`;\nconst unit_frame = make_frame(make_vect(0,0),make_vect(1,0),make_vect(0,1));\n\nconsole.log(wave(unit_frame));            // origin y=0, top y=1\nconsole.log(flip_vert(wave)(unit_frame)); // origin y=1, top y=0 (flipped)',
    },
    {
      type: 'narration',
      id: 'closure-property-in-painters',
      text: 'The key insight: because combinators return painters, you can combine combined painters. beside(wave, rogers) is a painter. beside(beside(wave, rogers), wave) is also a valid painter. This is the closure property applied to painters — the same property that lets pair hold a pair, which lets lists hold lists. The entire design space of composed images is accessible through function composition alone.',
      code: 'function make_frame(o,h,v){return{origin:o,horiz:h,vert:v};}\nfunction make_vect(x,y){return{x,y};}\nfunction add_vect(a,b){return{x:a.x+b.x,y:a.y+b.y};}\nfunction scale_vect(s,v){return{x:s*v.x,y:s*v.y};}\nfunction beside(p1,p2){return f=>{const sh=scale_vect(0.5,f.horiz);return p1(make_frame(f.origin,sh,f.vert))+\' | \'+p2(make_frame(add_vect(f.origin,sh),sh,f.vert));};}\nfunction below(p1,p2){return f=>{const sv=scale_vect(0.5,f.vert);return p2(make_frame(f.origin,f.horiz,sv))+\'\\n\'+p1(make_frame(add_vect(f.origin,sv),f.horiz,sv));};}\n\nconst w = f => `W(${f.origin.x.toFixed(1)},${f.origin.y.toFixed(1)})`;\nconst r = f => `R(${f.origin.x.toFixed(1)},${f.origin.y.toFixed(1)})`;\nconst unit = make_frame(make_vect(0,0),make_vect(1,0),make_vect(0,1));\n\n// Any combined painter can be further combined\nconst wr = beside(w, r);\nconst wrw = beside(wr, w);  // combined painter used as an argument\nconsole.log(wrw(unit));\n\n// below of beside — freely compose\nconst two_rows = below(beside(w,r), beside(r,w));\nconsole.log(two_rows(unit));',
    },
    {
      type: 'checkpoint',
      id: 'cp-combinators',
    },

    // ── Recursive painters ────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'recursive-painters-vocab',
      text: 'The most striking application of the closure property is recursive combinators. right_split(painter, n) places painter beside a smaller version of right_split(painter, n-1). The recursion stops at n=0. The result is a painter that calls painter in ever-smaller sub-frames, producing a fractal-like pattern. The entire infinite family of patterns is described by one recursive function.',
      code: null,
    },
    {
      type: 'narration',
      id: 'right-split-code',
      text: 'Here is right_split. At n=0, just the painter. At n>0, the painter beside a recursively split version of itself, stacked with a recursively split version below. Watch how the description shows the recursive structure.',
      code: 'function make_frame(o,h,v){return{origin:o,horiz:h,vert:v};}\nfunction make_vect(x,y){return{x,y};}\nfunction add_vect(a,b){return{x:a.x+b.x,y:a.y+b.y};}\nfunction scale_vect(s,v){return{x:s*v.x,y:s*v.y};}\nfunction beside(p1,p2){return f=>{const sh=scale_vect(0.5,f.horiz);return p1(make_frame(f.origin,sh,f.vert))+ \'|\' +p2(make_frame(add_vect(f.origin,sh),sh,f.vert));};}\nfunction below(p1,p2){return f=>{const sv=scale_vect(0.5,f.vert);return p2(make_frame(f.origin,f.horiz,sv))+ \'\\n\' +p1(make_frame(add_vect(f.origin,sv),f.horiz,sv));};}\n\nfunction right_split(painter, n) {\n  if (n === 0) return painter;\n  const smaller = right_split(painter, n - 1);\n  return beside(painter, below(smaller, smaller));\n}\n\nconst w = f => `W(${(f.horiz.x).toFixed(2)})`; // show width only\nconst unit = make_frame(make_vect(0,0),make_vect(1,0),make_vect(0,1));\n\nconsole.log(right_split(w, 0)(unit));  // just W at full width\nconsole.log(right_split(w, 1)(unit));  // W|half W\nconsole.log(right_split(w, 2)(unit));  // W|half(W|quarter W)',
    },
    {
      type: 'challenge',
      id: 'challenge-corner-split',
      text: 'Write corner_split(painter, n). At n=0, return painter. At n>0: place a copy of painter in the top-left corner of the frame, with right_split to the right, up_split above, and corner_split(n-1) in the remaining corner. You will need up_split — identical structure to right_split but uses below instead of beside. corner_split(wave, 2) should produce a description with nested subdivisions.',
      expectedOutput: 'has splits',
      startCode: 'function make_frame(o,h,v){return{origin:o,horiz:h,vert:v};}\nfunction make_vect(x,y){return{x,y};}\nfunction add_vect(a,b){return{x:a.x+b.x,y:a.y+b.y};}\nfunction scale_vect(s,v){return{x:s*v.x,y:s*v.y};}\nfunction beside(p1,p2){return f=>{const sh=scale_vect(0.5,f.horiz);return p1(make_frame(f.origin,sh,f.vert))+\'|\'+p2(make_frame(add_vect(f.origin,sh),sh,f.vert));};}\nfunction below(p1,p2){return f=>{const sv=scale_vect(0.5,f.vert);return p2(make_frame(f.origin,f.horiz,sv))+\'\\n\'+p1(make_frame(add_vect(f.origin,sv),f.horiz,sv));};}\n\nfunction right_split(painter, n) {\n  if (n === 0) return painter;\n  const smaller = right_split(painter, n - 1);\n  return beside(painter, below(smaller, smaller));\n}\n\nfunction up_split(painter, n) {\n  // your code here — identical to right_split but below/beside swapped\n}\n\nfunction corner_split(painter, n) {\n  // your code here\n}\n\nconst w = f => `W`;\nconst unit = make_frame(make_vect(0,0),make_vect(1,0),make_vect(0,1));\nconst result = corner_split(w, 2)(unit);\nconsole.log(result.length > 5 ? \'has splits\' : \'too short\');\n',
      hint: 'function up_split(painter, n) {\n  if (n === 0) return painter;\n  const smaller = up_split(painter, n - 1);\n  return below(painter, beside(smaller, smaller));\n}\n\nfunction corner_split(painter, n) {\n  if (n === 0) return painter;\n  const up    = up_split(painter, n - 1);\n  const right = right_split(painter, n - 1);\n  const corner = corner_split(painter, n - 1);\n  const top_left = beside(painter, up);\n  const bot_right = beside(right, corner);\n  return below(top_left, bot_right);\n}',
      tests: [],
      validate: ({ logs }) => logs.some(l => l.includes('has splits')),
    },
    {
      type: 'checkpoint',
      id: 'cp-recursion',
    },
  ],
}
