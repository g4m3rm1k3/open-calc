// LESSON_TETRIS_01.js
// Lesson 1 — The Empty Stage
// The problem: we need a visible 10×20 board on screen.
// Concepts: HTML/CSS/JS relationship, the DOM, querySelector,
//           innerHTML, CSS Grid, loops, data model.

const LESSON_TETRIS_01 = {
  title: 'The Empty Stage',
  subtitle: 'Build a 10×20 Tetris board from scratch using the DOM, loops, and CSS Grid.',
  sequential: true,
  cells: [

    // ─── PART 1: ORIENTATION ─────────────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## We're building Tetris.

Not a toy exercise. Not a tutorial you copy-paste. A real, working, playable Tetris game — built piece by piece over 12 lessons.

By the end of this course you will understand:
- How HTML, CSS, and JavaScript fit together
- How to model data and render it to the screen
- How games loop, respond to input, and manage state
- How to write clean, maintainable code

**How each lesson works:**

1. You see the game as it stands — working, playable
2. You see what's missing — the next problem
3. You learn the concept you need to solve it
4. You write the code that makes it work
5. The next lesson begins with your solution running

Right now there is no game. There is only a blank page. Let's fix that.`,
    },

    // ─── PART 2: THE THREE LANGUAGES ─────────────────────────────────────────

    {
      type: 'js',
      instruction: `Every web page is built from three languages. They have completely different jobs and should never be mixed up.

**HTML** describes structure — what things exist and how they relate. "There is a div. Inside it are 200 more divs."

**CSS** describes appearance — what things look like. "Those 200 divs are arranged in a 10-column grid. Each one is a dark square."

**JavaScript** describes behaviour — what things do. "When the timer fires, move the piece down one row and redraw everything."

For Tetris specifically: HTML gives us the board container. CSS makes it look like a grid. JavaScript populates it with cells and controls everything that moves.

Run the cell below — it builds a tiny 3×3 board using all three, so you can see them working together before we scale up to 10×20.`,
      html: `<div id="miniBoard"></div>
<p id="caption" style="color:#94a3b8;font-family:monospace;font-size:12px;margin-top:8px;"></p>`,
      css: `body { background: #0a1220; padding: 14px; }
#miniBoard {
  display: grid;
  grid-template-columns: repeat(3, 32px);
  gap: 2px;
  width: fit-content;
}
.cell {
  width: 32px;
  height: 32px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 3px;
}
.cell.lit {
  background: #22d3ee;
  border-color: #67e8f9;
  box-shadow: 0 0 6px #22d3ee88;
}`,
      startCode: `// HTML gave us the container: <div id="miniBoard">
// CSS gave it grid layout and styled the cells
// JavaScript creates the cells and can change them

const board = document.querySelector('#miniBoard');

// Create 9 cells (3 rows × 3 columns)
for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  board.appendChild(cell);
}

// Light up the diagonal
const cells = board.querySelectorAll('.cell');
[0, 4, 8].forEach(i => cells[i].classList.add('lit'));

document.querySelector('#caption').textContent =
  '3×3 board: HTML = structure, CSS = appearance, JS = behaviour';`,
      outputHeight: 180,
    },

    // ─── PART 3: THE DOM ─────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `The **DOM** (Document Object Model) is the browser's internal representation of your HTML page as a tree of objects.

When the browser loads your HTML, it parses it and creates a JavaScript object for every element. These objects are connected in a tree — the document is the root, each element is a node, and elements are nested inside each other.

The critical insight: **the DOM is live**. When you change a DOM object using JavaScript — adding a class, changing text, removing a child — the browser immediately reflects that change on screen. There is no separate "refresh" step.

This is how all dynamic web UIs work: JavaScript modifies DOM objects, the browser re-paints.`,
      html: `<div id="domDemo">
  <div id="parent" class="box">
    <div id="child1" class="box small">child 1</div>
    <div id="child2" class="box small">child 2</div>
  </div>
</div>
<div id="domLog"></div>`,
      css: `body { background: #0a1220; padding: 14px; font-family: monospace; }
.box { border: 1px solid #334155; background: #111827; color: #cbd5e1; 
       padding: 10px; border-radius: 6px; margin-bottom: 6px; }
.small { font-size: 12px; padding: 6px; margin: 4px; }
#domLog { color: #94a3b8; font-size: 12px; margin-top: 8px; line-height: 1.7; }`,
      startCode: `// querySelector finds the FIRST element matching a CSS selector
const parent = document.querySelector('#parent');
const child1 = document.querySelector('#child1');
const child2 = document.querySelector('#child2');

// These are live objects — change them and the screen updates immediately
child1.textContent = 'I was changed by JS';
child1.style.borderColor = '#22d3ee';
child1.style.color = '#22d3ee';

// You can read the tree structure
document.querySelector('#domLog').innerHTML = [
  'parent.tagName: ' + parent.tagName,
  'parent.children.length: ' + parent.children.length,
  'child1.id: ' + child1.id,
  'child2.textContent: "' + child2.textContent + '"',
].join('<br>');`,
      outputHeight: 220,
    },

    // ─── PART 4: querySelector ────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `\`document.querySelector(selector)\` is how you find a DOM element from JavaScript.

It accepts any CSS selector — the same syntax you use in a stylesheet. It returns the **first** matching element, or \`null\` if nothing matches.

\`document.querySelectorAll(selector)\` returns **all** matches as a NodeList (array-like).

These two functions are the foundation of DOM manipulation. Everything that interacts with the page starts by finding the right element. If querySelector returns null, the rest of your code breaks — this is the first place to check when something isn't working.`,
      html: `<div id="box1" class="target">box 1</div>
<div id="box2" class="target">box 2</div>
<div id="box3">box 3 (no class)</div>
<div id="selectorLog"></div>`,
      css: `body { background: #0a1220; padding: 14px; font-family: monospace; }
.target { border: 1px solid #334155; background: #111827; color: #cbd5e1;
          padding: 8px; border-radius: 6px; margin-bottom: 6px; font-size: 13px; }
#box3 { border: 1px solid #334155; background: #111827; color: #cbd5e1;
        padding: 8px; border-radius: 6px; margin-bottom: 6px; font-size: 13px; }
#selectorLog { color: #94a3b8; font-size: 12px; margin-top: 8px; line-height: 1.8; }`,
      startCode: `// querySelector: find by id
const byId = document.querySelector('#box1');

// querySelector: find by class (returns FIRST match only)
const byClass = document.querySelector('.target');

// querySelectorAll: find ALL matching elements
const allTargets = document.querySelectorAll('.target');

// querySelector returns null if nothing matches
const missing = document.querySelector('#doesNotExist');

// Modify the first result
byId.style.borderColor = '#22d3ee';
byId.style.color = '#22d3ee';

document.querySelector('#selectorLog').innerHTML = [
  '#box1 found: ' + (byId !== null),
  '.target (first): ' + byClass.id,
  '.target (all): ' + allTargets.length + ' elements',
  '#doesNotExist: ' + missing,
].join('<br>');`,
      outputHeight: 220,
    },

    // ─── PART 5: innerHTML vs createElement ───────────────────────────────────

    {
      type: 'js',
      instruction: `There are two ways to create DOM content from JavaScript.

**innerHTML** — write HTML as a string, let the browser parse it into DOM nodes. Fast to write, good for simple cases. Danger: never put user input directly into innerHTML (XSS vulnerability). Also destroys and recreates everything inside the element.

**createElement + appendChild** — create individual nodes programmatically. More verbose but safer, and better when you need references to specific elements.

For Tetris we use createElement inside a loop — we need references to each cell so we can update them later. For simple static content, innerHTML is fine.`,
      html: `<div id="method1"></div>
<div id="method2"></div>
<div id="methodLog"></div>`,
      css: `body { background: #0a1220; padding: 14px; font-family: monospace; }
.demo-cell {
  display: inline-block;
  width: 24px; height: 24px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 3px;
  margin: 2px;
  vertical-align: top;
}
#methodLog { color: #94a3b8; font-size: 12px; margin-top: 8px; line-height: 1.8; }`,
      startCode: `// METHOD 1: innerHTML (HTML string → DOM)
document.querySelector('#method1').innerHTML =
  '<div class="demo-cell" style="background:#22d3ee"></div>'.repeat(5) +
  '<div class="demo-cell"></div>'.repeat(5);

// METHOD 2: createElement + appendChild (programmatic)
const container2 = document.querySelector('#method2');
for (let i = 0; i < 10; i++) {
  const cell = document.createElement('div');
  cell.className = 'demo-cell';
  if (i < 5) cell.style.background = '#a78bfa';
  container2.appendChild(cell);
}

document.querySelector('#methodLog').innerHTML = [
  'innerHTML: fast, but destroys all children each time',
  'createElement: slower to write, but gives you references',
  'Tetris uses createElement so we keep cell references for updates',
].join('<br>');`,
      outputHeight: 160,
    },

    // ─── PART 6: Loops for building repetitive DOM ────────────────────────────

    {
      type: 'js',
      instruction: `Tetris needs 200 cells (10 columns × 20 rows). You don't write 200 lines of HTML — you write a loop.

This is the fundamental pattern for building any grid, list, or repeated UI element from JavaScript: loop from 0 to N, create the element, configure it, append it.

The key insight about grid cells: each cell has an index (0–199) which can be converted to a row and column:
- \`row = Math.floor(index / cols)\`
- \`col = index % cols\`

And back: \`index = row * cols + col\`

This conversion is used constantly in Tetris — to find a cell in the DOM from a board position, and to find a board position from a DOM cell.`,
      html: `<div id="gridDemo"></div>
<div id="gridLog"></div>`,
      css: `body { background: #0a1220; padding: 14px; }
#gridDemo {
  display: grid;
  grid-template-columns: repeat(10, 24px);
  gap: 2px;
  width: fit-content;
}
.g-cell {
  width: 24px; height: 24px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 2px;
  font-family: monospace;
  font-size: 8px;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
}
#gridLog { color: #94a3b8; font-family: monospace; font-size: 12px; 
           margin-top: 8px; line-height: 1.8; }`,
      startCode: `const COLS = 10;
const ROWS = 5; // using 5 rows to keep it short
const grid = document.querySelector('#gridDemo');

// Build the grid: ROWS × COLS = 50 cells
for (let i = 0; i < ROWS * COLS; i++) {
  const cell = document.createElement('div');
  cell.className = 'g-cell';
  cell.textContent = i;
  grid.appendChild(cell);
}

// Demonstrate index ↔ row/col conversion
const cells = grid.querySelectorAll('.g-cell');
const highlight = [0, 9, 25, 49]; // corners + middle

highlight.forEach(i => {
  const row = Math.floor(i / COLS);
  const col = i % COLS;
  cells[i].style.background = '#22d3ee33';
  cells[i].style.color = '#22d3ee';
  cells[i].style.borderColor = '#22d3ee';
  document.querySelector('#gridLog').innerHTML +=
    \`index \${i} → row \${row}, col \${col}<br>\`;
});`,
      outputHeight: 220,
    },

    // ─── PART 7: CSS Grid for the board ──────────────────────────────────────

    {
      type: 'js',
      instruction: `CSS Grid is the layout system that makes a Tetris board work. Without it, you'd need absolute positioning for every cell. With it, you just say "10 equal columns" and the browser handles everything.

The key properties for our board:
- \`display: grid\` — enables grid layout
- \`grid-template-columns: repeat(10, 1fr)\` — 10 equal columns
- \`gap: 2px\` — space between cells

The cells don't need any positioning CSS — the grid places them automatically, left-to-right, top-to-bottom, in order. Cell 0 goes in row 0 col 0. Cell 9 goes in row 0 col 9. Cell 10 goes in row 1 col 0. Exactly the order we append them.

This alignment between DOM order and grid position is what makes the index → row/col conversion work.`,
      html: `<div id="gridExplainer"></div>`,
      css: `body { background: #0a1220; padding: 14px; }
#gridExplainer {
  display: grid;
  grid-template-columns: repeat(10, 28px);
  grid-template-rows: repeat(4, 28px);
  gap: 3px;
  width: fit-content;
  border: 2px solid #334155;
  padding: 6px;
  border-radius: 6px;
  background: #0f172a;
}
.ex-cell {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-size: 9px;
  color: #475569;
  transition: all 0.15s ease;
}`,
      startCode: `const COLS = 10;
const ROWS = 4;
const g = document.querySelector('#gridExplainer');

for (let i = 0; i < ROWS * COLS; i++) {
  const cell = document.createElement('div');
  cell.className = 'ex-cell';
  const row = Math.floor(i / COLS);
  const col = i % COLS;
  cell.title = \`[\${row}][\${col}]\`;
  g.appendChild(cell);
}

// Animate cells lighting up in order
const cells = g.querySelectorAll('.ex-cell');
cells.forEach((cell, i) => {
  setTimeout(() => {
    cell.style.background = '#1e3a5f';
    cell.style.borderColor = '#3b82f6';
    cell.style.color = '#93c5fd';
    cell.textContent = i;
  }, i * 60);
});
console.log('Grid fills left→right, top→bottom. Order matches the index.');`,
      outputHeight: 200,
    },

    // ─── PART 8: The board data model ─────────────────────────────────────────

    {
      type: 'js',
      instruction: `Before we build the real board, we need to understand the data model behind it.

The board is a 2D array: 20 rows, each row containing 10 values. Each value is either \`0\` (empty) or a colour string like \`'cyan'\` (occupied).

This is the **ground truth** of the game. The DOM is just a visual representation of this array. Every time the state changes, we redraw the DOM from the array. The array is the game; the DOM is the picture of the game.

This separation — state in an array, visuals in the DOM, a render function connecting them — is the pattern that makes the whole game possible.`,
      html: `<div id="boardVis"></div>
<div id="boardLog"></div>`,
      css: `body { background: #0a1220; padding: 14px; }
#boardVis {
  display: grid;
  grid-template-columns: repeat(10, 22px);
  gap: 2px;
  width: fit-content;
  margin-bottom: 10px;
}
.bv-cell {
  width: 22px; height: 22px;
  background: #1e293b;
  border: 1px solid #1e293b;
  border-radius: 2px;
  transition: all 0.1s;
}
.bv-cell.filled { border-color: #475569; }
#boardLog { color: #94a3b8; font-family: monospace; font-size: 12px; line-height: 1.8; }`,
      startCode: `const COLS = 10;
const ROWS = 6; // small for demo

// THE BOARD DATA: 2D array of 0 or colour string
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Put some pieces in the bottom two rows
board[4] = ['cyan', 0, 0, 'yellow', 'yellow', 'yellow', 0, 0, 0, 'cyan'];
board[5] = ['cyan', 'cyan', 0, 'yellow', 0, 'yellow', 0, 'cyan', 'cyan', 'cyan'];

// RENDER: draw the board array to the DOM
const vis = document.querySelector('#boardVis');
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const cell = document.createElement('div');
    cell.className = 'bv-cell';
    const value = board[row][col];
    if (value !== 0) {
      cell.style.background = value;
      cell.classList.add('filled');
    }
    vis.appendChild(cell);
  }
}

document.querySelector('#boardLog').innerHTML =
  'board[5] = [' + board[5].map(v => v || '0').join(', ') + ']<br>' +
  'The DOM reflects the array. Change the array, redraw the DOM.';`,
      outputHeight: 220,
    },

    // ─── PART 9: INTEGRATION CHALLENGE ────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## Your Turn

You've seen all the pieces:
- HTML gives us a container div
- CSS Grid makes it a 10-column grid
- A JavaScript loop creates the cells
- \`appendChild\` puts them in the DOM
- A 2D array is the board's data model

Now you're going to put it all together.

**Your job:** Complete the \`createBoard()\` function so it builds and returns a 10×20 board with all 200 cells in the DOM.

Then complete the \`renderBoard()\` function so it reads the board data array and sets each cell's background colour correctly.

The scaffold is already set up — HTML, CSS, and the shell of each function. You fill in the logic.

Read the comments carefully. Each function has hints if you get stuck.`,
    },

    {
      type: 'challenge',
      instruction: `**Challenge: Build the board.**

Complete \`createBoard()\` to:
1. Create 200 div elements with class \`"cell"\`
2. Append each one to \`#board\`
3. Return an array of all 200 cell elements (so we can reference them later)

Complete \`renderBoard()\` to:
1. Loop through every cell in \`boardData\` (20 rows × 10 cols)
2. Calculate the DOM index for each position: \`row * COLS + col\`
3. If \`boardData[row][col]\` is not 0, set \`cells[index].style.background\` to the colour
4. If it is 0, set the background back to \`''\` (clears it)

The test at the bottom checks both functions work correctly.`,
      html: `<div id="board"></div>
<div id="status"></div>`,
      css: `body { background: #0f172a; display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 12px; }
#board {
  display: grid;
  grid-template-columns: repeat(10, 28px);
  grid-template-rows: repeat(20, 28px);
  gap: 2px;
  border: 2px solid #1e293b;
  padding: 4px;
  background: #0a0f1a;
  border-radius: 4px;
}
.cell {
  width: 28px;
  height: 28px;
  background: #0f1929;
  border: 1px solid #1a2744;
  border-radius: 2px;
}
#status {
  color: #94a3b8;
  font-family: monospace;
  font-size: 12px;
  text-align: center;
  max-width: 320px;
  line-height: 1.7;
}`,
      startCode: `const COLS = 10;
const ROWS = 20;

// createBoard()
// Creates 200 .cell divs inside #board.
// Returns an array of all cell elements.
function createBoard() {
  const boardEl = document.querySelector('#board');
  const cells = [];

  // YOUR CODE HERE
  // Hint: loop ROWS * COLS times
  // Hint: createElement('div'), set className to 'cell', appendChild to boardEl
  // Hint: push each cell into the cells array
  // Hint: return cells at the end

  return cells;
}

// renderBoard(cells, boardData)
// cells: array of 200 DOM elements (from createBoard)
// boardData: 20×10 array — 0 means empty, string means colour
// Updates each cell's background to match the data.
function renderBoard(cells, boardData) {

  // YOUR CODE HERE
  // Hint: nested loop — for row 0..19, for col 0..9
  // Hint: index = row * COLS + col
  // Hint: const value = boardData[row][col]
  // Hint: if value !== 0, set cells[index].style.background = value
  // Hint: else set cells[index].style.background = ''

}

// ── Test ────────────────────────────────────────────────────────────────────

const cells = createBoard();

// Create test data: fill bottom 2 rows with colours
const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
boardData[18] = Array(COLS).fill('cyan');
boardData[19] = Array(COLS).fill('orange');

renderBoard(cells, boardData);

// Check
const status = document.querySelector('#status');
const correctCells = cells.length === 200;
const bottomRowColoured = cells[190].style.background !== '';
const topRowEmpty = cells[0].style.background === '';

if (correctCells && bottomRowColoured && topRowEmpty) {
  status.textContent = '✓ Board built correctly. 200 cells, renders data accurately.';
  status.style.color = '#10b981';
} else {
  status.innerHTML =
    'cells.length === 200: ' + correctCells + '<br>' +
    'bottom row coloured: ' + bottomRowColoured + '<br>' +
    'top row empty: ' + topRowEmpty;
  status.style.color = '#f87171';
}`,
      solutionCode: `const COLS = 10;
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

const cells = createBoard();
const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
boardData[18] = Array(COLS).fill('cyan');
boardData[19] = Array(COLS).fill('orange');
renderBoard(cells, boardData);

const status = document.querySelector('#status');
status.textContent = '✓ Board built correctly. 200 cells, renders data accurately.';
status.style.color = '#10b981';`,
      check: (code) => {
        // Check for the key structural patterns
        const hasLoop = /for\s*\(/.test(code);
        const hasCreateElement = /createElement/.test(code);
        const hasAppendChild = /appendChild/.test(code);
        const hasIndexCalc = /row\s*\*\s*COLS\s*\+\s*col/.test(code) ||
                             /row\s*\*\s*10\s*\+\s*col/.test(code);
        const hasBgSet = /style\.background/.test(code);
        return hasLoop && hasCreateElement && hasAppendChild && hasIndexCalc && hasBgSet;
      },
      successMessage: `The board renders. 200 cells in the DOM. renderBoard() translates data to pixels. This is the foundation everything else builds on.`,
      failMessage: `Check three things: (1) Are you looping ROWS * COLS = 200 times in createBoard? (2) Are you using row * COLS + col to get the index? (3) Are you checking if value !== 0 before setting the background?`,
      outputHeight: 640,
    },

    // ─── PART 10: BONUS CHALLENGE ─────────────────────────────────────────────

    {
      type: 'challenge',
      instruction: `**Bonus: Checkerboard pattern.**

The board works. Now prove you understand the row/col math.

Modify the \`boardData\` array so that cells in a checkerboard pattern are coloured. A cell at \`[row][col]\` should be coloured \`'#1e3a5f'\` if \`(row + col) % 2 === 0\`, and \`0\` otherwise.

Do not change \`createBoard\` or \`renderBoard\` — they are correct. Only change how you build \`boardData\`.`,
      html: `<div id="board"></div>
<div id="status"></div>`,
      css: `body { background: #0f172a; display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 12px; }
#board {
  display: grid;
  grid-template-columns: repeat(10, 28px);
  grid-template-rows: repeat(20, 28px);
  gap: 2px;
  border: 2px solid #1e293b;
  padding: 4px;
  background: #0a0f1a;
  border-radius: 4px;
}
.cell {
  width: 28px;
  height: 28px;
  background: #0f1929;
  border: 1px solid #1a2744;
  border-radius: 2px;
  transition: background 0.1s;
}
#status { color: #94a3b8; font-family: monospace; font-size: 12px; text-align: center; }`,
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

const cells = createBoard();

// YOUR CODE HERE
// Build boardData so cells where (row + col) % 2 === 0
// are coloured '#1e3a5f', all others are 0.
const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
// ...

renderBoard(cells, boardData);

// Check
const topLeft = boardData[0][0];
const oneRight = boardData[0][1];
const status = document.querySelector('#status');
if (topLeft === '#1e3a5f' && oneRight === 0) {
  status.textContent = '✓ Checkerboard correct.';
  status.style.color = '#10b981';
} else {
  status.textContent = 'Not quite. Check the (row + col) % 2 condition.';
  status.style.color = '#f87171';
}`,
      solutionCode: `const COLS = 10;
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

const cells = createBoard();

const boardData = Array.from({ length: ROWS }, (_, row) =>
  Array.from({ length: COLS }, (_, col) =>
    (row + col) % 2 === 0 ? '#1e3a5f' : 0
  )
);

renderBoard(cells, boardData);

const status = document.querySelector('#status');
status.textContent = '✓ Checkerboard correct.';
status.style.color = '#10b981';`,
      check: (code) =>
        /\(row\s*\+\s*col\)\s*%\s*2/.test(code) ||
        /\(col\s*\+\s*row\)\s*%\s*2/.test(code),
      successMessage: `Clean. The (row + col) % 2 pattern is a fundamental grid idiom — it appears constantly in game development.`,
      failMessage: `The condition is (row + col) % 2 === 0. Loop through rows and cols, and for each position check this condition to decide the cell colour.`,
      outputHeight: 640,
    },

    // ─── PART 11: SEED ────────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `The board is built. Here's what you have at the end of Lesson 1 — a clean, empty 10×20 board, fully rendered from a data array.

This code is the foundation. Every lesson from here builds on these two functions. In Lesson 2, we describe a Tetris piece as data — a 4×4 matrix of 1s and 0s with a colour. In Lesson 3, we render that piece onto the board.

**What to notice about the code below:** \`createBoard\` and \`renderBoard\` have no knowledge of pieces, movement, or game rules. They only know about cells and colours. This separation is intentional. The game logic in later lessons will work with \`boardData\`. \`renderBoard\` will always be the last step — the thing that translates state to pixels.

Run it. This is where Lesson 2 begins.`,
      html: `<div id="board"></div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center; padding: 20px; }
#board {
  display: grid;
  grid-template-columns: repeat(10, 28px);
  grid-template-rows: repeat(20, 28px);
  gap: 2px;
  border: 2px solid #1e293b;
  padding: 4px;
  background: #0a0f1a;
  border-radius: 4px;
}
.cell {
  width: 28px;
  height: 28px;
  background: #0f1929;
  border: 1px solid #1a2744;
  border-radius: 2px;
}`,
      startCode: `const COLS = 10;
const ROWS = 20;

// Lesson 1 result: the two foundational functions.
// These do not change for the rest of the course.

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

// Lesson 2 will add:
// - PIECES data (7 tetrominoes as 4×4 matrices)
// - activePiece (position + shape + colour)
// - renderBoard will be updated to draw the active piece over the board data
console.log('Board ready. Lesson 2: describing a piece.');`,
      outputHeight: 640,
    },

  ],
};

export default {
  id: 'tetris-01-empty-stage',
  slug: 'tetris-the-empty-stage',
  chapter: 'tetris.1',
  order: 1,
  title: 'The Empty Stage',
  subtitle: 'Build a 10×20 Tetris board using the DOM, CSS Grid, and a 2D data array',
  tags: ['html', 'css', 'javascript', 'dom', 'css-grid', 'loops', 'arrays', 'data-model'],
  hook: {
    question: 'How does a game board go from a JavaScript array to pixels on screen?',
    realWorldContext:
      'Every dynamic web UI works the same way: state lives in JS data structures, the DOM is the visual representation, and a render function connects them.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'HTML, CSS, and JavaScript each have one job. Mixing them creates code that is hard to change.',
      'The DOM is a live tree of objects. Changing a DOM object immediately changes what the user sees.',
      'The board array is the ground truth. The DOM is the picture of that truth. Always update the array, then re-render.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'Data Before Display',
        body: 'createBoard() builds the DOM structure once. renderBoard() draws the current state. These are two separate operations and they stay separate for the entire game.',
      },
      {
        type: 'tip',
        title: 'Index ↔ Row/Col',
        body: 'row = Math.floor(index / COLS). col = index % COLS. index = row * COLS + col. Memorise this — you will use it hundreds of times.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Tetris — Lesson 1: The Empty Stage',
        props: {
          lesson: LESSON_TETRIS_01,
        },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'HTML = structure. CSS = appearance. JS = behaviour. Never mix responsibilities.',
    'The DOM is a live tree. Changing a node immediately updates the screen.',
    'querySelector(selector) finds DOM elements. Returns null if nothing matches.',
    'Board state lives in a 2D array. The DOM is just the visual representation.',
    'index = row * COLS + col. row = floor(index / COLS). col = index % COLS.',
    'createBoard() runs once. renderBoard() runs every frame.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};