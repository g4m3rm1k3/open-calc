const lesson = {
  id: "cli-0-009",
  slug: "grep-and-find",
  chapter: "cli-0",
  order: 9,
  title: "Searching with grep and find",
  subtitle: "Find text inside files. Find files by name.",
  tags: ["cli", "grep", "find", "search", "which", "regex"],
  aliases: ["search files terminal", "grep command", "find command", "find files by name", "search text in files"],

  hook: `Two questions come up constantly in development: "Which file contains this text?" and "Where is this file?". grep answers the first. find answers the second.`,

  mentalModel: [
    "`grep 'pattern' file` searches inside a file for lines matching a pattern. `grep -r 'pattern' directory/` searches all files in the directory recursively. This is how you find which file contains a function, a config key, or an error message.",
    "`find . -name 'pattern'` finds files by name starting from the current directory. `find . -name '*.js'` finds all JavaScript files. `find . -type f` finds only files (not directories). `find . -type d` finds only directories.",
    "`which command` tells you where a command's executable lives. `which node` might return `/usr/local/bin/node`. Useful for confirming which version of a tool is active.",
  ],

  intuition: {
    prose: [
      "`grep` (Global Regular Expression Print) searches file contents for lines matching a pattern. `grep 'TODO' app.js` prints every line in `app.js` that contains the word TODO. `grep -r 'TODO' src/` searches all files under `src/` and prints matches with their filename. This is how you scan a codebase for all TODO comments, find all uses of a function, or locate where a config value is set.",
      "Useful `grep` flags: `-i` (case-insensitive: `grep -i 'error' app.log` matches ERROR, Error, error), `-n` (line numbers: shows which line each match is on), `-l` (list only filenames that match, not the matching lines), `-c` (count how many matching lines per file). Combine them: `grep -rn 'TODO' src/` shows every TODO with filename and line number.",
      "`find` searches for files and directories by name or type. `find . -name 'config.json'` finds every file named `config.json` starting from `.` (current directory). `find . -name '*.test.js'` finds all test files. Use `-type f` to restrict to files, `-type d` to directories: `find . -type d -name 'node_modules'` finds all `node_modules` directories (useful before deleting them all).",
      "`which` locates a command's executable. `which python3` tells you which Python you're running — important when multiple versions are installed. `which node` might return `/usr/local/bin/node` or a version manager path like `~/.nvm/versions/node/v20/bin/node`. If a command isn't found, `which` exits with an error. Used in scripts to verify a tool is installed.",
    ],
    visualizations: [
      {
        id: "ShellTerminal",
        mathBridge:
          "**Search the codebase:**\n\n```bash\n# Search for text in a specific file\ngrep 'TODO' app.js\n\n# Search recursively across all files\ngrep -r 'TODO' .\n\n# Add line numbers\ngrep -rn 'function' src/\n\n# List only filenames that match\ngrep -rl 'import' .\n\n# Case-insensitive search\ngrep -i 'error' app.log\n\n# Find files by name\nfind . -name '*.js'\nfind . -name '*.md'\nfind . -type d\n\n# Find a specific file\nfind . -name 'config.json'\n```",
        props: {
          welcomeMessage: "Search the project files. Try: grep -r 'TODO' src/",
          initialCwd: "/home/user/project",
          initialFiles: {
            "/home/user/project/": null,
            "/home/user/project/app.js": "const express = require('express');\nconst db = require('./db');\n\n// TODO: add authentication middleware\n\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.send('Hello world');\n});\n\napp.get('/users', async (req, res) => {\n  // TODO: add pagination\n  const users = await db.getAll();\n  res.json(users);\n});\n\napp.listen(3000);\n",
            "/home/user/project/db.js": "const { Pool } = require('pg');\n\n// TODO: use environment variable for connection string\nconst pool = new Pool({\n  connectionString: 'postgres://localhost/myapp',\n});\n\nasync function getAll() {\n  const result = await pool.query('SELECT * FROM users');\n  return result.rows;\n}\n\nmodule.exports = { getAll };\n",
            "/home/user/project/app.log": "[ERROR] 2026-05-20 DB connection timeout\n[INFO]  2026-05-20 Server started on port 3000\n[WARN]  2026-05-20 Auth token expiring soon\n[ERROR] 2026-05-20 User not found: id=42\n[INFO]  2026-05-20 Request completed in 3ms\n",
            "/home/user/project/config.json": '{\n  "port": 3000,\n  "dbUrl": "postgres://localhost/myapp",\n  "debug": true\n}\n',
            "/home/user/project/src/": null,
            "/home/user/project/src/utils.js": "// Utility functions\n\nfunction formatDate(d) {\n  // TODO: support timezone parameter\n  return new Date(d).toISOString();\n}\n\nfunction slugify(str) {\n  return str.toLowerCase().replace(/\\s+/g, '-');\n}\n\nmodule.exports = { formatDate, slugify };\n",
            "/home/user/project/src/auth.js": "// Authentication helpers\n\nfunction validateToken(token) {\n  if (!token) return false;\n  // TODO: verify JWT signature\n  return token.length > 10;\n}\n\nmodule.exports = { validateToken };\n",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**grep uses regular expressions.** The pattern in `grep` is actually a regex, not a plain string. `grep 'function.*render' src/` finds lines with 'function' followed by anything followed by 'render'. `grep '^import' file.js` finds lines starting with 'import' (the `^` anchors to the start of the line). `grep 'error$' app.log` finds lines ending with 'error'. Use `grep -F` (fixed string) if your pattern contains regex special characters and you want literal matching.",
      "**find with multiple conditions.** `find` supports combining conditions: `find . -name '*.js' -not -path '*/node_modules/*'` finds JavaScript files but excludes anything in `node_modules`. `-not` negates a condition. `-path` matches against the full path (useful for excluding subdirectories). This pattern is essential when working in projects with `node_modules` — plain `find . -name '*.js'` returns thousands of results from dependencies.",
      "**grep vs. find — different searches.** `grep` searches file contents (what's inside). `find` searches the filesystem (names and paths). They're complementary: `find . -name '*.log' | xargs grep 'ERROR'` uses find to locate all log files, then pipes their names to grep to search inside them. (The `xargs` command converts the list of filenames into grep arguments.)",
    ],
    callouts: [
      {
        type: "tip",
        title: "grep -rn is your most-used combo",
        body: "`grep -rn 'searchterm' .` searches recursively across all files with line numbers. This is the workhorse command for navigating an unfamiliar codebase — 'where is this function defined?', 'which file uses this config key?', 'where is this string coming from?'",
      },
      {
        type: "tip",
        title: "Exclude node_modules from find",
        body: "Always add `-not -path '*/node_modules/*'` when using find in a JavaScript project: `find . -name '*.js' -not -path '*/node_modules/*'`. Without it, you get thousands of results from your dependencies.",
      },
    ],
  },

  examples: [
    {
      title: "Audit a codebase for TODOs",
      body: "# Find all TODO comments with file and line\ngrep -rn 'TODO' src/\n# src/app.js:4:// TODO: add authentication middleware\n# src/utils.js:5:  // TODO: support timezone parameter\n# src/auth.js:6:  // TODO: verify JWT signature\n\n# Count TODOs per file\ngrep -rc 'TODO' src/\n# src/app.js:2\n# src/utils.js:1\n# src/auth.js:1",
    },
    {
      title: "Find and clean node_modules",
      body: "# Find all node_modules directories\nfind . -type d -name 'node_modules'\n# ./node_modules\n# ./packages/api/node_modules\n# ./packages/web/node_modules\n\n# Delete them all (use with care)\n# find . -type d -name 'node_modules' -exec rm -rf {} +",
    },
  ],

  assessment: {
    questions: [
      {
        id: "cli0-009-q1",
        type: "choice",
        text: "Which command finds all lines containing 'password' in any file under the current directory, and shows the filename and line number for each match?",
        options: [
          "`grep 'password' *`",
          "`grep -rn 'password' .`",
          "`find . -name 'password'`",
          "`grep -l 'password' .`",
        ],
        answer: 1,
        explanation: "`-r` makes grep recursive (searches subdirectories), `-n` adds line numbers. Combined: `grep -rn 'password' .` shows every match as `filename:linenum:line content`. Option A only searches files in the current directory (not subdirectories). `-l` lists only filenames, not matching lines.",
      },
      {
        id: "cli0-009-q2",
        type: "choice",
        text: "What does `find . -type f -name '*.test.js'` do?",
        options: [
          "Searches inside all .test.js files for the text 'type f'",
          "Finds directories named .test.js",
          "Finds all files (not directories) with names ending in .test.js",
          "Finds the first .test.js file and stops",
        ],
        answer: 2,
        explanation: "`-type f` restricts results to regular files (excluding directories, symlinks, etc.). `-name '*.test.js'` matches names ending in `.test.js`. Together they find all test files in the directory tree — a common pattern in JavaScript projects.",
      },
    ],
  },
};

export default lesson;
