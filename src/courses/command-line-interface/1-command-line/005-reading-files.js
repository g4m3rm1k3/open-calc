const lesson = {
  id: "cli-0-005",
  slug: "reading-files",
  chapter: "cli-0",
  order: 5,
  title: "Reading Files",
  subtitle: "touch, cat, head, tail, and wc",
  tags: ["cli", "cat", "head", "tail", "wc", "touch", "files"],
  aliases: ["cat command", "read file terminal", "head tail", "word count wc"],

  hook: `You spend a lot of time in the terminal reading files — checking configs, reviewing logs, inspecting code — without ever opening an editor. These five commands handle 90% of that work.`,

  mentalModel: [
    "`touch filename` creates an empty file if it doesn't exist. If the file already exists, it updates its last-modified timestamp. Useful for creating placeholder files.",
    "`cat file` prints the entire file to the terminal. Good for short files. For long files, pipe it: `cat file | head -n 20`.",
    "`head -n N file` prints the first N lines. `tail -n N file` prints the last N lines. Default is 10 lines when `-n` is omitted. These are how you read the start or end of a log file without loading everything.",
  ],

  intuition: {
    prose: [
      "`touch` is the most minimal file-creation tool. `touch README.md` creates an empty file named `README.md`. If the file already exists, it just updates the modification time — it doesn't clear the contents. Developers use `touch` to create placeholder files for a project structure before filling them in.",
      "`cat` (concatenate) prints a file's contents to the terminal. It's named 'concatenate' because it can combine multiple files: `cat file1.txt file2.txt` prints them one after the other. But in practice, you use it alone to read a file: `cat notes.txt`. For files longer than a screenful, this scrolls past the top immediately — that's when you reach for `head` or `tail`.",
      "`head -n 20 logfile.txt` prints the first 20 lines. `tail -n 20 logfile.txt` prints the last 20 lines. This is how you read log files — logs grow from the bottom, so `tail -n 50 app.log` shows the 50 most recent entries. Without `-n`, both default to 10 lines.",
      "`wc` (word count) measures a file. `wc -l file` counts lines — essential for knowing how long a file is before reading it. `wc -w file` counts words. `wc -c file` counts characters (bytes). `wc file` alone prints all three. Run `wc -l *.js` to count the lines in every JavaScript file in the current directory.",
    ],
    visualizations: [
      {
        id: "ShellTerminal",
        mathBridge:
          "**Explore the files in this project:**\n\n- `ls` — see what's here\n- `cat README.md` — read the full file\n- `wc -l server.js` — how many lines?\n- `head -n 5 server.js` — first 5 lines\n- `tail -n 5 server.js` — last 5 lines\n- `touch newfile.txt` — create empty file\n- `cat newfile.txt` — empty (prints nothing)\n- `wc -l README.md server.js` — count both files",
        props: {
          welcomeMessage:
            "Read the files here. Try: cat README.md, then head and tail on server.js",
          initialCwd: "/home/user/project",
          initialFiles: {
            "/home/user/project/": null,
            "/home/user/project/README.md":
              "# Dungeon Game\n\nA terminal dungeon crawler built in Node.js.\n\n## Getting Started\n\n```bash\nnpm install\nnpm start\n```\n\n## Project Structure\n\n```\nsrc/\n  game.js      — main game loop\n  player.js    — player state\n  dungeon.js   — dungeon generation\ntests/\n  game.test.js — game logic tests\n```\n\n## Controls\n\n- WASD or arrow keys to move\n- E to interact\n- I to open inventory\n- Esc to pause",
            "/home/user/project/server.js":
              "const http = require('http');\nconst fs = require('fs');\nconst path = require('path');\n\nconst PORT = process.env.PORT || 3000;\n\nconst MIME_TYPES = {\n  '.html': 'text/html',\n  '.js':   'application/javascript',\n  '.css':  'text/css',\n  '.json': 'application/json',\n};\n\nconst server = http.createServer((req, res) => {\n  const filePath = path.join(__dirname, 'public',\n    req.url === '/' ? 'index.html' : req.url);\n\n  const ext = path.extname(filePath);\n  const contentType = MIME_TYPES[ext] || 'text/plain';\n\n  fs.readFile(filePath, (err, data) => {\n    if (err) {\n      res.writeHead(404);\n      res.end('Not found');\n      return;\n    }\n    res.writeHead(200, { 'Content-Type': contentType });\n    res.end(data);\n  });\n});\n\nserver.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`);\n});\n",
            "/home/user/project/package.json":
              '{\n  "name": "dungeon-game",\n  "version": "1.0.0",\n  "description": "A terminal dungeon crawler",\n  "main": "server.js",\n  "scripts": {\n    "start": "node server.js",\n    "test": "jest"\n  },\n  "dependencies": {},\n  "devDependencies": {\n    "jest": "^29.0.0"\n  }\n}\n',
            "/home/user/project/app.log":
              "[2026-05-20 09:01:02] INFO  Server started on port 3000\n[2026-05-20 09:01:05] INFO  GET / 200 3ms\n[2026-05-20 09:01:07] INFO  GET /style.css 200 1ms\n[2026-05-20 09:02:11] WARN  GET /favicon.ico 404 0ms\n[2026-05-20 09:15:30] INFO  GET / 200 2ms\n[2026-05-20 10:00:00] ERROR Database connection failed: ECONNREFUSED\n[2026-05-20 10:00:01] WARN  Retrying connection (attempt 1/3)\n[2026-05-20 10:00:03] WARN  Retrying connection (attempt 2/3)\n[2026-05-20 10:00:05] WARN  Retrying connection (attempt 3/3)\n[2026-05-20 10:00:05] ERROR Max retries exceeded. Shutting down.\n",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**cat for multiple files.** `cat file1 file2 file3` concatenates and prints all three files in order. This is the original purpose — combine file chunks into one output. `cat header.html content.html footer.html > page.html` assembles a web page. In modern usage, you'll mostly use `cat` on a single file, but the name explains why it exists.",
      "**tail -f for live log watching.** `tail -f logfile` follows a file as it grows, printing new lines as they're added. This is invaluable for watching a server log in real time while testing. Press Ctrl+C to stop. (The `-f` flag isn't supported in our simulator, but it's critical to know in real systems.)",
      "**wc with glob patterns.** `wc -l *.js` counts lines in every `.js` file and prints a total. `wc -l **/*.js` (in bash/zsh with globbing enabled) counts recursively. This is a quick way to measure a codebase's size or compare files.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Use head before cat on unknown files",
        body: "Before `cat`-ing a file you haven't seen before, run `wc -l filename` to check how long it is. A 50,000-line minified JavaScript file will flood your terminal. Then use `head -n 30 filename` to preview it safely.",
      },
      {
        type: "tip",
        title: "tail -n 1 filename gets the last line",
        body: "A common pattern in log analysis: `tail -n 1 app.log` gets the most recent log entry. `tail -n 100 app.log` shows the last 100 entries — usually all you need to diagnose a fresh error.",
      },
    ],
  },

  examples: [
    {
      title: "Reading a log file safely",
      body: "# First, check how big it is\nwc -l app.log\n# 4823 app.log\n\n# Read the end (most recent events)\ntail -n 20 app.log\n\n# Look for errors\ngrep 'ERROR' app.log | tail -n 10\n\n# Never do this with a huge file:\n# cat app.log   # floods terminal with 4823 lines",
    },
    {
      title: "Create files for a new project",
      body: "# Create placeholder files\ntouch README.md .gitignore package.json\n\n# Verify they exist (all empty)\nls -la\nwc -c README.md\n# 0 README.md\n\n# cat on empty file prints nothing (no error)\ncat README.md",
    },
  ],

  assessment: {
    questions: [
      {
        id: "cli0-005-q1",
        type: "choice",
        text: "You have a 10,000-line log file. Which command shows just the 20 most recent entries?",
        options: [
          "`cat app.log`",
          "`head -n 20 app.log`",
          "`tail -n 20 app.log`",
          "`wc -l app.log`",
        ],
        answer: 2,
        explanation:
          "Log files grow from the bottom, so the most recent entries are at the end. `tail -n 20` prints the last 20 lines. `head -n 20` would show the oldest 20 entries. `cat` dumps everything. `wc -l` just counts lines.",
      },
      {
        id: "cli0-005-q2",
        type: "choice",
        text: "What does `touch notes.txt` do if `notes.txt` already exists?",
        options: [
          "Overwrites it with an empty file",
          "Returns an error",
          "Updates its last-modified timestamp without changing contents",
          "Opens it in the default editor",
        ],
        answer: 2,
        explanation:
          "`touch` on an existing file updates its access and modification timestamps without changing its contents. This is useful in build systems where timestamps are used to determine what needs to be rebuilt.",
      },
    ],
  },
};

export default lesson;
