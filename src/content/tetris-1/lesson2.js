// LESSON_TETRIS_02.js
// Lesson 2 — Describing a Piece
// The problem: we have a board but nothing on it. We need to represent
// a Tetris piece in code — its shape, colour, and position.
// Concepts: objects as data models, 2D arrays, nested loops,
//           the 7 tetrominoes, separation of data and display.

const LESSON_TETRIS_02 = {
  title: 'Describing a Piece',
  subtitle: 'Represent a Tetris piece as data — shape, colour, and position — then render it onto the board.',
  sequential: true,
  cells: [

    // ─── PART 1: RECAP ────────────────────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## Recap: What we built in Lesson 1

By the end of Lesson 1 you had two functions:

\`\`\`js
createBoard()   // creates 200 DOM cells, returns them as an array
renderBoard(cells, boardData)  // reads the 2D array, sets each cell's colour
\`\`\`

And one key mental model:

> **The board array is the ground truth. The DOM is the picture of that truth.**

\`boardData\` is a 20×10 array of values — either \`0\` (empty) or a colour string like \`'cyan'\`. \`renderBoard\` translates that array into visible pixels.

These two functions are complete. They don't change again.

---

## The problem we face now

The board renders. But there's nothing on it. A Tetris game needs pieces — seven distinct shapes that fall from the top. Before anything can move, fall, or collide, we need to answer one question:

**How do you represent a Tetris piece in code?**

A piece has:
- A **shape** — which cells are filled
- A **colour** — what it looks like
- A **position** — where it is on the board

By the end of this lesson you'll have a \`PIECES\` data structure containing all seven tetrominoes, and a render function that draws the active piece on top of the board.`,
    },

    // ─── RECAP CELL — show lesson 1 result ───────────────────────────────────

    {
      type: 'js',
      instruction: `Here's the Lesson 1 code running. The board is there — 200 cells, empty, waiting.

Look at the two functions. Read every line and make sure you can explain what it does before moving on. Specifically:

- Why does \`createBoard\` return \`cells\`?
- Why does \`renderBoard\` loop with a nested \`for\`?
- What does \`row * COLS + col\` compute?

If you can answer all three without looking them up, you're ready for Lesson 2.`,
      html: `<div id="board"></div>`,
      css: `body{background:#0f172a;display:flex;justify-content:center;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}`,
      startCode: `const COLS = 10;
const ROWS = 20;

function createBoard() {
  const boardEl = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    boardEl.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}

function renderBoard(cells, boardData) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const index = row * COLS + col;
      const value = boardData[row][col];
      cells[index].style.background = value !== 0 ? value : '';
    }
  }
}

const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const cells = createBoard();
renderBoard(cells, boardData);

console.log('Board ready. boardData is', ROWS, 'rows ×', COLS, 'cols.');
console.log('All cells empty:', boardData.every(row => row.every(v => v === 0)));`,
      outputHeight: 620,
    },

    // ─── PART 2: OBJECTS AS DATA MODELS ──────────────────────────────────────

    {
      type: 'js',
      instruction: `Before we model a Tetris piece, we need to understand **objects as data models**.

An object is a collection of named values — properties. It's how JavaScript groups related data together. Instead of five separate variables (\`pieceX\`, \`pieceY\`, \`pieceColour\`, ...), you use one object with five properties (\`piece.x\`, \`piece.y\`, \`piece.colour\`, ...).

Objects aren't just storage — they're a design decision. Grouping related data into an object means you can pass it to functions as a single argument, copy it, log it, and reason about it as one thing.

For Tetris, a piece has exactly the properties it needs and nothing else. Run the example and notice how the object makes the piece's state readable at a glance.`,
      html: `<div id="objDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#objDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:13px;line-height:1.9;}`,
      startCode: `// Instead of scattered variables:
// let pieceX = 3;
// let pieceY = 0;
// let pieceColour = 'cyan';
// let pieceShape = ...  // awkward

// One object:
const piece = {
  x: 3,          // column position (left edge of piece)
  y: 0,          // row position (top edge of piece)
  colour: 'cyan',
  shape: [       // 4×4 matrix — we'll explain this next
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
};

// Access properties with dot notation
document.querySelector('#objDemo').innerHTML = [
  'piece.x:      ' + piece.x,
  'piece.y:      ' + piece.y,
  'piece.colour: ' + piece.colour,
  'piece.shape:  4×4 matrix (see below)',
  '',
  '// Move the piece right:',
  'piece.x = piece.x + 1  →  ' + (piece.x + 1),
  '',
  '// The whole piece travels as one unit.',
  '// We only update x or y — shape and colour stay constant.',
].join('<br>');`,
      outputHeight: 240,
    },

    // ─── PART 3: 2D ARRAYS ────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `A Tetris piece's shape is a **2D array** — an array where each element is itself an array.

Think of it as a grid of rows. \`shape[0]\` is the first row. \`shape[0][0]\` is the first cell in the first row. A \`1\` means "filled", a \`0\` means "empty".

The I-piece (vertical) looks like this in data:

\`\`\`
shape[0] = [0, 1, 0, 0]
shape[1] = [0, 1, 0, 0]
shape[2] = [0, 1, 0, 0]
shape[3] = [0, 1, 0, 0]
\`\`\`

To iterate every cell in a 2D array you need **nested loops** — an outer loop for rows and an inner loop for columns. This pattern appears everywhere in Tetris: rendering, collision detection, line clearing.`,
      html: `<div id="matrixVis"></div><div id="matrixLog"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#matrixVis{display:grid;grid-template-columns:repeat(4,36px);gap:3px;margin-bottom:12px;width:fit-content;}
.m-cell{width:36px;height:36px;border:1px solid #334155;border-radius:4px;background:#111827;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:13px;color:#475569;}
.m-cell.on{background:#0891b2;border-color:#22d3ee;color:#e0f2fe;}
#matrixLog{border:1px solid #334155;border-radius:8px;background:#111827;color:#94a3b8;font-family:monospace;padding:10px;font-size:12px;line-height:1.8;}`,
      startCode: `// The I-piece shape as a 2D array
const shape = [
  [0, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 1, 0, 0],
];

const vis = document.querySelector('#matrixVis');
const log = document.querySelector('#matrixLog');
const lines = [];

// Nested loop: outer = rows, inner = cols
for (let row = 0; row < shape.length; row++) {
  for (let col = 0; col < shape[row].length; col++) {
    const cell = document.createElement('div');
    cell.className = 'm-cell';
    const value = shape[row][col];
    cell.textContent = value;
    if (value === 1) cell.classList.add('on');
    vis.appendChild(cell);

    if (value === 1) {
      lines.push(\`shape[\${row}][\${col}] = 1  ← filled\`);
    }
  }
}

log.innerHTML = lines.join('<br>');`,
      outputHeight: 280,
    },

    // ─── PART 4: THE 7 TETROMINOES ────────────────────────────────────────────

    {
      type: 'js',
      instruction: `There are exactly **7 Tetris pieces** (tetrominoes). Each one is named by the letter its shape resembles.

Every piece is stored as a 4×4 matrix — even pieces smaller than 4×4 are padded with zeros. This makes rotation easier (always rotating a 4×4 grid) and keeps the data structure consistent.

The standard Tetris colours are fixed — each piece always has the same colour. These are not arbitrary choices: they've been part of the game since the Tetris Guideline was published.

Run the cell below to see all seven pieces rendered from their data.`,
      html: `<div id="allPieces"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#allPieces{display:flex;flex-wrap:wrap;gap:16px;}
.piece-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;}
.piece-label{color:#94a3b8;font-family:monospace;font-size:11px;}
.piece-grid{display:grid;grid-template-columns:repeat(4,18px);gap:2px;}
.pc{width:18px;height:18px;border-radius:2px;}
.pc.on{border:1px solid rgba(255,255,255,0.2);}
.pc.off{background:transparent;}`,
      startCode: `// All 7 tetrominoes — the complete PIECES data structure
const PIECES = [
  {
    name: 'I',
    colour: '#00f0f0',
    shape: [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0],
    ],
  },
  {
    name: 'O',
    colour: '#f0f000',
    shape: [
      [0,1,1,0],
      [0,1,1,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
  },
  {
    name: 'T',
    colour: '#a000f0',
    shape: [
      [0,1,0,0],
      [1,1,1,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
  },
  {
    name: 'S',
    colour: '#00f000',
    shape: [
      [0,1,1,0],
      [1,1,0,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
  },
  {
    name: 'Z',
    colour: '#f00000',
    shape: [
      [1,1,0,0],
      [0,1,1,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
  },
  {
    name: 'J',
    colour: '#0000f0',
    shape: [
      [1,0,0,0],
      [1,1,1,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
  },
  {
    name: 'L',
    colour: '#f0a000',
    shape: [
      [0,0,1,0],
      [1,1,1,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
  },
];

// Render all 7
const container = document.querySelector('#allPieces');

PIECES.forEach(piece => {
  const wrap = document.createElement('div');
  wrap.className = 'piece-wrap';

  const label = document.createElement('div');
  label.className = 'piece-label';
  label.textContent = piece.name + '-piece';
  wrap.appendChild(label);

  const grid = document.createElement('div');
  grid.className = 'piece-grid';

  piece.shape.forEach(row => {
    row.forEach(val => {
      const cell = document.createElement('div');
      cell.className = 'pc ' + (val ? 'on' : 'off');
      if (val) cell.style.background = piece.colour;
      grid.appendChild(cell);
    });
  });

  wrap.appendChild(grid);
  container.appendChild(wrap);
});

console.log('7 pieces loaded:', PIECES.map(p => p.name).join(', '));`,
      outputHeight: 200,
    },

    // ─── PART 5: RENDERING A PIECE OVER THE BOARD ─────────────────────────────

    {
      type: 'js',
      instruction: `Now we need to render the active piece on top of the board.

The key insight: **we don't write the piece into \`boardData\`**. The piece is floating — it hasn't landed yet. \`boardData\` only contains pieces that have locked in place.

Instead, \`renderBoard\` needs to know about the active piece and draw it on top. The updated render function does two passes:

1. Draw the board data (same as before)
2. Draw the active piece on top, using \`piece.y + row\` and \`piece.x + col\` to find each cell's board position

This keeps locked pieces and the active piece in completely separate data structures — which matters enormously for collision detection in Lesson 6.`,
      html: `<div id="board"></div>`,
      css: `body{background:#0f172a;display:flex;justify-content:center;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}`,
      startCode: `const COLS = 10;
const ROWS = 20;

function createBoard() {
  const boardEl = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    boardEl.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}

// UPDATED renderBoard — now accepts an optional activePiece
function renderBoard(cells, boardData, activePiece = null) {
  // Pass 1: draw locked board data
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const index = row * COLS + col;
      const value = boardData[row][col];
      cells[index].style.background = value !== 0 ? value : '';
    }
  }

  // Pass 2: draw the active piece on top
  if (activePiece) {
    activePiece.shape.forEach((shapeRow, r) => {
      shapeRow.forEach((val, c) => {
        if (val === 0) return; // skip empty cells in the shape
        const boardRow = activePiece.y + r;
        const boardCol = activePiece.x + c;
        const index = boardRow * COLS + boardCol;
        if (index >= 0 && index < cells.length) {
          cells[index].style.background = activePiece.colour;
        }
      });
    });
  }
}

// Test: T-piece at position (3, 2)
const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const cells = createBoard();

const activePiece = {
  x: 3,
  y: 2,
  colour: '#a000f0',
  shape: [
    [0,1,0,0],
    [1,1,1,0],
    [0,0,0,0],
    [0,0,0,0],
  ],
};

renderBoard(cells, boardData, activePiece);
console.log('T-piece rendered at x=3, y=2');`,
      outputHeight: 620,
    },

    // ─── PART 6: SPAWNING A PIECE ─────────────────────────────────────────────

    {
      type: 'js',
      instruction: `A piece needs to **spawn** at the top of the board in the correct starting position.

In standard Tetris, pieces spawn near the top centre. The starting column is calculated to roughly centre the piece: \`Math.floor((COLS - 4) / 2)\` gives column 3 for a 10-wide board, which centres a 4×4 piece matrix.

The starting row is 0 — pieces appear at the very top. As soon as a piece spawns, the game loop will start moving it down.

The \`spawnPiece\` function picks a random piece from \`PIECES\` and returns a new piece object with the starting position. This is the piece that will start falling in Lesson 4.`,
      html: `<div id="board"></div><div id="spawnLog"></div>`,
      css: `body{background:#0f172a;display:flex;flex-direction:column;align-items:center;padding:20px;gap:12px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
#spawnLog{color:#94a3b8;font-family:monospace;font-size:12px;text-align:center;}`,
      startCode: `const COLS = 10;
const ROWS = 20;
const PIECES = [
  { name:'I', colour:'#00f0f0', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  { name:'O', colour:'#f0f000', shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'T', colour:'#a000f0', shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'S', colour:'#00f000', shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]] },
  { name:'Z', colour:'#f00000', shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'J', colour:'#0000f0', shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'L', colour:'#f0a000', shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
];

function spawnPiece() {
  const template = PIECES[Math.floor(Math.random() * PIECES.length)];
  return {
    name: template.name,
    colour: template.colour,
    shape: template.shape,
    x: Math.floor((COLS - 4) / 2), // centred horizontally
    y: 0,                           // top of board
  };
}

function createBoard() {
  const boardEl = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    boardEl.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}

function renderBoard(cells, boardData, activePiece = null) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      cells[row * COLS + col].style.background =
        boardData[row][col] !== 0 ? boardData[row][col] : '';
    }
  }
  if (activePiece) {
    activePiece.shape.forEach((shapeRow, r) => {
      shapeRow.forEach((val, c) => {
        if (!val) return;
        const idx = (activePiece.y + r) * COLS + (activePiece.x + c);
        if (idx >= 0 && idx < cells.length) cells[idx].style.background = activePiece.colour;
      });
    });
  }
}

const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const cells = createBoard();
const activePiece = spawnPiece();
renderBoard(cells, boardData, activePiece);

document.querySelector('#spawnLog').textContent =
  'Spawned: ' + activePiece.name + '-piece at x=' + activePiece.x + ', colour=' + activePiece.colour;

console.log('Active piece:', activePiece);`,
      outputHeight: 660,
    },

    // ─── PART 7: ROTATION ─────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Rotating a Tetris piece means rotating its 4×4 shape matrix 90° clockwise.

The mathematical rule for a 90° clockwise rotation of an N×N matrix:

**\`newShape[col][N - 1 - row] = oldShape[row][col]\`**

Or equivalently, the new matrix's rows are the old matrix's columns read from bottom to top.

This is one of those formulas worth deriving yourself rather than memorising. Imagine the matrix as a physical grid. Rotating it 90° clockwise: the top row becomes the right column, the left column becomes the top row. That's the rule.

We won't add rotation to the controls until Lesson 5, but we need the function now to verify our piece shapes are correct.`,
      html: `<div id="rotDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#rotDemo{display:flex;gap:24px;align-items:flex-start;}
.rot-group{display:flex;flex-direction:column;align-items:center;gap:6px;}
.rot-label{color:#94a3b8;font-family:monospace;font-size:11px;}
.rot-grid{display:grid;grid-template-columns:repeat(4,22px);gap:2px;}
.rc{width:22px;height:22px;border-radius:2px;}
.rc.on{background:#a000f0;border:1px solid #c084fc;}
.rc.off{background:#111827;border:1px solid #1e293b;}`,
      startCode: `function rotate(shape) {
  const N = shape.length;
  // Create a new N×N matrix filled with zeros
  const result = Array.from({ length: N }, () => Array(N).fill(0));
  for (let row = 0; row < N; row++) {
    for (let col = 0; col < N; col++) {
      // 90° clockwise: new[col][N-1-row] = old[row][col]
      result[col][N - 1 - row] = shape[row][col];
    }
  }
  return result;
}

function drawShape(container, shape, colour, label) {
  const group = document.createElement('div');
  group.className = 'rot-group';
  const lbl = document.createElement('div');
  lbl.className = 'rot-label';
  lbl.textContent = label;
  group.appendChild(lbl);
  const grid = document.createElement('div');
  grid.className = 'rot-grid';
  shape.forEach(row => row.forEach(val => {
    const cell = document.createElement('div');
    cell.className = 'rc ' + (val ? 'on' : 'off');
    if (val) cell.style.background = colour;
    grid.appendChild(cell);
  }));
  group.appendChild(grid);
  container.appendChild(group);
}

const T_SHAPE = [
  [0,1,0,0],
  [1,1,1,0],
  [0,0,0,0],
  [0,0,0,0],
];

const container = document.querySelector('#rotDemo');
const colour = '#a000f0';

drawShape(container, T_SHAPE, colour, '0°');
drawShape(container, rotate(T_SHAPE), colour, '90°');
drawShape(container, rotate(rotate(T_SHAPE)), colour, '180°');
drawShape(container, rotate(rotate(rotate(T_SHAPE))), colour, '270°');

console.log('rotate() produces 4 distinct orientations for T-piece');`,
      outputHeight: 180,
    },

    // ─── PART 8: SEPARATION OF DATA AND DISPLAY ──────────────────────────────

    {
      type: 'js',
      instruction: `This cell is about a principle, not a technique: **separation of data and display**.

The PIECES array is pure data. It contains shapes, colours, names. No DOM. No styles. No \`querySelector\`. It doesn't know the board exists. You could run it in Node.js with no browser and it would work fine.

\`renderBoard\` is pure display. It takes data and translates it to DOM. It doesn't contain game logic. It doesn't decide where pieces go. It just paints.

This separation is what makes the game testable, debuggable, and extendable. When something looks wrong visually, you check the data first. If the data is correct, the bug is in the renderer. If the data is wrong, the bug is in the game logic. You never have to debug both at once.

Run the cell to see the same data rendered two different ways — same data, different display.`,
      html: `<div id="dis1" class="board-mini"></div>
<div id="dis2" class="board-mini"></div>`,
      css: `body{background:#0a1220;padding:14px;display:flex;gap:16px;}
.board-mini{display:grid;grid-template-columns:repeat(4,30px);gap:3px;}
.dm{width:30px;height:30px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:11px;}`,
      startCode: `// THE DATA — no DOM, no styles
const shape = [
  [0,1,0,0],
  [1,1,1,0],
  [0,0,0,0],
  [0,0,0,0],
];
const colour = '#a000f0';

// DISPLAY VERSION 1: coloured blocks
const board1 = document.querySelector('#dis1');
shape.forEach(row => row.forEach(val => {
  const cell = document.createElement('div');
  cell.className = 'dm';
  cell.style.background = val ? colour : '#111827';
  cell.style.border = '1px solid ' + (val ? '#c084fc' : '#1e293b');
  board1.appendChild(cell);
}));

// DISPLAY VERSION 2: ASCII numbers
const board2 = document.querySelector('#dis2');
shape.forEach(row => row.forEach(val => {
  const cell = document.createElement('div');
  cell.className = 'dm';
  cell.style.background = '#111827';
  cell.style.color = val ? '#a78bfa' : '#334155';
  cell.style.border = '1px solid #1e293b';
  cell.textContent = val;
  board2.appendChild(cell);
}));

console.log('Same data. Two displays. The data never changes.');
console.log('This is why we keep data and display separate.');`,
      outputHeight: 160,
    },

    // ─── PART 9: CHALLENGE ────────────────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## Your Turn

You've seen all the pieces:
- A piece is an object with \`shape\`, \`colour\`, \`x\`, \`y\`
- A shape is a 4×4 matrix of 1s and 0s
- \`renderBoard\` now takes an optional \`activePiece\` and draws it on top
- \`spawnPiece\` creates a new piece at the starting position
- \`rotate(shape)\` rotates a matrix 90° clockwise

Now you're going to write the complete Lesson 2 game state — PIECES data, spawnPiece, the updated renderBoard — and put a piece on the board.

**Your job:**
1. Complete the \`PIECES\` array with all 7 tetrominoes
2. Complete \`spawnPiece()\` to return a correctly positioned piece object
3. Complete the second pass of \`renderBoard\` to draw the active piece

The scaffold has the board setup complete. You fill in the three functions.`,
    },

    {
      type: 'challenge',
      instruction: `**Challenge: Put a piece on the board.**

Three things to complete:

**1. PIECES array** — already started. Add the remaining pieces (S, Z, J, L). Each needs \`name\`, \`colour\`, and \`shape\` (4×4 matrix).

**2. spawnPiece()** — picks a random piece from PIECES and returns an object with \`name\`, \`colour\`, \`shape\`, \`x\` (centred), and \`y\` (0).

**3. renderBoard second pass** — loop through \`activePiece.shape\`. For each cell where the value is 1, calculate the board position (\`activePiece.y + r\`, \`activePiece.x + c\`) and set that DOM cell's background to \`activePiece.colour\`.

The test at the bottom spawns a piece and checks it rendered correctly.`,
      html: `<div id="board"></div><div id="status"></div>`,
      css: `body{background:#0f172a;display:flex;flex-direction:column;align-items:center;padding:20px;gap:10px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
#status{color:#94a3b8;font-family:monospace;font-size:12px;text-align:center;max-width:320px;line-height:1.7;}`,
      startCode: `const COLS = 10;
const ROWS = 20;

// ── 1. PIECES DATA ───────────────────────────────────────────────────────────
// Complete the remaining pieces: S, Z, J, L
// Colours: S=#00f000, Z=#f00000, J=#0000f0, L=#f0a000
// Shapes: use the 4×4 matrix format. Rows 2 and 3 are always [0,0,0,0].

const PIECES = [
  {
    name: 'I', colour: '#00f0f0',
    shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  },
  {
    name: 'O', colour: '#f0f000',
    shape: [[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
  },
  {
    name: 'T', colour: '#a000f0',
    shape: [[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]],
  },
  // YOUR CODE HERE — add S, Z, J, L
];

// ── 2. spawnPiece ────────────────────────────────────────────────────────────
// Pick a random piece from PIECES.
// Return an object: { name, colour, shape, x, y }
// x should centre the piece: Math.floor((COLS - 4) / 2)
// y should be 0 (top of board)

function spawnPiece() {
  // YOUR CODE HERE
}

// ── 3. renderBoard ───────────────────────────────────────────────────────────

function createBoard() {
  const boardEl = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    boardEl.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}

function renderBoard(cells, boardData, activePiece = null) {
  // Pass 1: draw locked board data (complete — don't change this)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const index = row * COLS + col;
      cells[index].style.background =
        boardData[row][col] !== 0 ? boardData[row][col] : '';
    }
  }

  // Pass 2: draw the active piece on top
  if (activePiece) {
    activePiece.shape.forEach((shapeRow, r) => {
      shapeRow.forEach((val, c) => {
        // YOUR CODE HERE
        // Skip if val === 0
        // Calculate boardRow = activePiece.y + r
        // Calculate boardCol = activePiece.x + c
        // Calculate index = boardRow * COLS + boardCol
        // Guard: only set if index >= 0 && index < cells.length
        // Set cells[index].style.background = activePiece.colour
      });
    });
  }
}

// ── TEST ─────────────────────────────────────────────────────────────────────

const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const cells = createBoard();

let activePiece;
try { activePiece = spawnPiece(); } catch(e) { activePiece = null; }

if (activePiece) renderBoard(cells, boardData, activePiece);

const status = document.querySelector('#status');

const hasAllPieces = PIECES.length === 7;
const pieceNames = PIECES.map(p => p.name).sort().join('');
const hasAllNames = pieceNames === 'IJLOSTUZ'.split('').filter(c => 'IJLOSTZ'.includes(c)).sort().join('') ||
                    pieceNames === [...'IJLOSTZ'].sort().join('');
const spawnWorks = activePiece && typeof activePiece.x === 'number' &&
                   typeof activePiece.y === 'number' && activePiece.y === 0 &&
                   activePiece.x === Math.floor((COLS - 4) / 2);
const renderWorks = activePiece && (() => {
  let found = false;
  activePiece.shape.forEach((row, r) => row.forEach((val, c) => {
    if (val === 1) {
      const idx = (activePiece.y + r) * COLS + (activePiece.x + c);
      if (cells[idx] && cells[idx].style.background !== '') found = true;
    }
  }));
  return found;
})();

if (hasAllPieces && spawnWorks && renderWorks) {
  status.textContent = '✓ All 7 pieces defined. Piece spawns at x=' +
    activePiece.x + '. Piece renders on board.';
  status.style.color = '#10b981';
} else {
  status.innerHTML =
    '7 pieces defined: ' + hasAllPieces + ' (' + PIECES.length + '/7)<br>' +
    'spawnPiece works: ' + !!spawnWorks + '<br>' +
    'piece renders: ' + !!renderWorks;
  status.style.color = '#f87171';
}`,
      solutionCode: `const COLS = 10;
const ROWS = 20;

const PIECES = [
  { name:'I', colour:'#00f0f0', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  { name:'O', colour:'#f0f000', shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'T', colour:'#a000f0', shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'S', colour:'#00f000', shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]] },
  { name:'Z', colour:'#f00000', shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'J', colour:'#0000f0', shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'L', colour:'#f0a000', shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
];

function spawnPiece() {
  const template = PIECES[Math.floor(Math.random() * PIECES.length)];
  return {
    name: template.name,
    colour: template.colour,
    shape: template.shape,
    x: Math.floor((COLS - 4) / 2),
    y: 0,
  };
}

function createBoard() {
  const boardEl = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    boardEl.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}

function renderBoard(cells, boardData, activePiece = null) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const index = row * COLS + col;
      cells[index].style.background =
        boardData[row][col] !== 0 ? boardData[row][col] : '';
    }
  }
  if (activePiece) {
    activePiece.shape.forEach((shapeRow, r) => {
      shapeRow.forEach((val, c) => {
        if (val === 0) return;
        const idx = (activePiece.y + r) * COLS + (activePiece.x + c);
        if (idx >= 0 && idx < cells.length) {
          cells[idx].style.background = activePiece.colour;
        }
      });
    });
  }
}

const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const cells = createBoard();
const activePiece = spawnPiece();
renderBoard(cells, boardData, activePiece);

const status = document.querySelector('#status');
status.textContent = '✓ All 7 pieces defined. Piece spawns and renders correctly.';
status.style.color = '#10b981';`,
      check: (code) => {
        const has7Pieces = (code.match(/name\s*:/g) || []).length >= 7;
        const hasSpawn = /function spawnPiece/.test(code) &&
                         /Math\.floor.*COLS.*4.*2/.test(code);
        const hasRenderPass = /activePiece\.y\s*\+\s*r/.test(code) &&
                              /activePiece\.x\s*\+\s*c/.test(code);
        return has7Pieces && hasSpawn && hasRenderPass;
      },
      successMessage: `The piece is on the board. Seven shapes in data, one rendered on screen. Lesson 3 starts here — the piece is static. We need it to fall.`,
      failMessage: `Three things to check: (1) Does PIECES have 7 entries? (2) Does spawnPiece return {name, colour, shape, x: Math.floor((COLS-4)/2), y: 0}? (3) In the render pass, are you using activePiece.y + r and activePiece.x + c to find the board position?`,
      outputHeight: 680,
    },

    // ─── PART 10: BONUS CHALLENGE ─────────────────────────────────────────────

    {
      type: 'challenge',
      instruction: `**Bonus: Rotate the piece.**

Implement the \`rotate(shape)\` function and add a button that rotates the active piece each time it's clicked. The piece should visually rotate on the board.

The rule for 90° clockwise rotation:
\`result[col][N - 1 - row] = shape[row][col]\`

Don't modify the PIECES data — create a new rotated shape and update the active piece's \`shape\` property.`,
      html: `<div id="board"></div>
<button id="rotBtn">Rotate ↻</button>
<div id="rotStatus"></div>`,
      css: `body{background:#0f172a;display:flex;flex-direction:column;align-items:center;padding:20px;gap:10px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
#rotBtn{padding:8px 20px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px;}
#rotBtn:hover{background:#334155;}
#rotStatus{color:#94a3b8;font-family:monospace;font-size:12px;}`,
      startCode: `const COLS = 10;
const ROWS = 20;

const PIECES = [
  { name:'I', colour:'#00f0f0', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  { name:'O', colour:'#f0f000', shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'T', colour:'#a000f0', shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'S', colour:'#00f000', shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]] },
  { name:'Z', colour:'#f00000', shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'J', colour:'#0000f0', shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'L', colour:'#f0a000', shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
];

// YOUR CODE HERE — implement rotate(shape)
// Returns a new 4×4 matrix rotated 90° clockwise
function rotate(shape) {

}

function spawnPiece() {
  const t = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { name:t.name, colour:t.colour, shape:t.shape,
           x: Math.floor((COLS-4)/2), y: 4 };
}

function createBoard() {
  const el = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    el.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}

function renderBoard(cells, boardData, activePiece = null) {
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      cells[row*COLS+col].style.background = boardData[row][col] || '';
  if (activePiece)
    activePiece.shape.forEach((sr, r) => sr.forEach((val, c) => {
      if (!val) return;
      const idx = (activePiece.y+r)*COLS + (activePiece.x+c);
      if (idx>=0 && idx<cells.length) cells[idx].style.background = activePiece.colour;
    }));
}

const boardData = Array.from({length:ROWS}, () => Array(COLS).fill(0));
const cells = createBoard();
const activePiece = spawnPiece();
let rotCount = 0;

renderBoard(cells, boardData, activePiece);

// YOUR CODE HERE — add click handler to #rotBtn
// Each click should: rotate activePiece.shape, re-render, update status
`,
      solutionCode: `const COLS = 10;
const ROWS = 20;
const PIECES = [
  { name:'I', colour:'#00f0f0', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  { name:'O', colour:'#f0f000', shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'T', colour:'#a000f0', shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'S', colour:'#00f000', shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]] },
  { name:'Z', colour:'#f00000', shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'J', colour:'#0000f0', shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'L', colour:'#f0a000', shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
];

function rotate(shape) {
  const N = shape.length;
  const result = Array.from({length:N}, () => Array(N).fill(0));
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      result[c][N-1-r] = shape[r][c];
  return result;
}

function spawnPiece() {
  const t = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { name:t.name, colour:t.colour, shape:t.shape,
           x: Math.floor((COLS-4)/2), y: 4 };
}

function createBoard() {
  const el = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS*COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    el.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}

function renderBoard(cells, boardData, activePiece=null) {
  for (let row=0;row<ROWS;row++) for (let col=0;col<COLS;col++)
    cells[row*COLS+col].style.background = boardData[row][col] || '';
  if (activePiece) activePiece.shape.forEach((sr,r) => sr.forEach((val,c) => {
    if (!val) return;
    const idx = (activePiece.y+r)*COLS+(activePiece.x+c);
    if (idx>=0&&idx<cells.length) cells[idx].style.background=activePiece.colour;
  }));
}

const boardData = Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells = createBoard();
const activePiece = spawnPiece();
let rotCount = 0;

renderBoard(cells, boardData, activePiece);

document.querySelector('#rotBtn').addEventListener('click', () => {
  activePiece.shape = rotate(activePiece.shape);
  rotCount++;
  renderBoard(cells, boardData, activePiece);
  document.querySelector('#rotStatus').textContent =
    'Rotated ' + rotCount + ' time(s) — ' + (rotCount % 4 * 90) + '°';
});`,
      check: (code) =>
        /result\[c\]\[N\s*-\s*1\s*-\s*r\]\s*=\s*shape\[r\]\[c\]/.test(code) ||
        /result\[col\]\[N\s*-\s*1\s*-\s*row\]\s*=\s*shape\[row\]\[col\]/.test(code),
      successMessage: `Clean. The rotation formula is the building block of Tetris rotation. Lesson 5 will hook this up to the arrow key.`,
      failMessage: `The rotation formula: result[col][N-1-row] = shape[row][col]. Create an N×N result matrix, loop through every cell in shape, and apply that mapping.`,
      outputHeight: 680,
    },

    // ─── SEED ─────────────────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Here's what you have at the end of Lesson 2. A board with a piece on it.

The piece spawns at the top, renders on the board, and can be rotated. But it just sits there. It doesn't fall. It doesn't respond to anything.

In Lesson 3, we add the **game loop** — a timer that ticks every 800ms, moves the piece down one row, and redraws the board. The piece will finally fall.

Notice two things about the code below:

1. \`PIECES\` is pure data — no DOM, no rendering. It could live in a separate file.
2. The render call is always the last step. Update the state, then render. Never render in the middle of updating.

Those two rules hold for the entire game.`,
      html: `<div id="board"></div>`,
      css: `body{background:#0f172a;display:flex;justify-content:center;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}`,
      startCode: `const COLS = 10;
const ROWS = 20;

const PIECES = [
  { name:'I', colour:'#00f0f0', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  { name:'O', colour:'#f0f000', shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'T', colour:'#a000f0', shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'S', colour:'#00f000', shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]] },
  { name:'Z', colour:'#f00000', shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'J', colour:'#0000f0', shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'L', colour:'#f0a000', shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
];

function spawnPiece() {
  const t = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { name:t.name, colour:t.colour, shape:t.shape,
           x: Math.floor((COLS - 4) / 2), y: 0 };
}

function createBoard() {
  const el = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    el.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}

function renderBoard(cells, boardData, activePiece = null) {
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      cells[row*COLS+col].style.background = boardData[row][col] || '';
  if (activePiece)
    activePiece.shape.forEach((sr, r) => sr.forEach((val, c) => {
      if (!val) return;
      const idx = (activePiece.y + r) * COLS + (activePiece.x + c);
      if (idx >= 0 && idx < cells.length)
        cells[idx].style.background = activePiece.colour;
    }));
}

// Game state
const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const cells = createBoard();
let activePiece = spawnPiece();

// Render once — lesson 3 will put this inside a loop
renderBoard(cells, boardData, activePiece);

console.log('Lesson 2 complete. Piece on board:', activePiece.name, 'at x=' + activePiece.x);
console.log('Lesson 3 adds: tick() + setInterval → piece falls.');`,
      outputHeight: 640,
    },

  ],
};

export default {
  id: 'tetris-02-describing-a-piece',
  slug: 'tetris-describing-a-piece',
  chapter: 'tetris.1',
  order: 2,
  title: 'Describing a Piece',
  subtitle: 'Model the 7 tetrominoes as data objects, render them on the board, and implement rotation',
  tags: ['javascript', 'objects', '2d-arrays', 'nested-loops', 'dom', 'data-modelling', 'separation-of-concerns'],
  hook: {
    question: 'How do you represent a Tetris piece — its shape, colour, and position — in JavaScript data?',
    realWorldContext:
      'Every game object in every game ever made is a data structure. The shape is a matrix. The position is two numbers. The colour is a string. Data first. Display second.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'A piece is an object: { shape, colour, x, y }. Group related data together.',
      'A shape is a 4×4 matrix — a 2D array. Iterate it with nested loops.',
      'boardData holds locked pieces. activePiece floats on top. Never mix them.',
      'renderBoard does two passes: locked data first, active piece second.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'Data Before Display',
        body: 'PIECES is pure data. No DOM, no styles. renderBoard is pure display. No game logic. This separation makes both easier to debug.',
      },
      {
        type: 'tip',
        title: 'Rotation Formula',
        body: 'result[col][N-1-row] = shape[row][col]. New rows are old columns read bottom-to-top.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Tetris — Lesson 2: Describing a Piece',
        props: { lesson: LESSON_TETRIS_02 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'A piece is an object: shape (4×4 matrix), colour, x, y.',
    'shape[row][col] === 1 means that cell is filled. 0 means empty.',
    'boardData = locked pieces. activePiece = floating piece. Never write activePiece into boardData until it lands.',
    'renderBoard: pass 1 = board data, pass 2 = active piece on top.',
    'spawnPiece: x = Math.floor((COLS - 4) / 2), y = 0.',
    'rotate: result[col][N-1-row] = shape[row][col].',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};