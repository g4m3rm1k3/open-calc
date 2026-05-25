import { useState, useEffect, useRef } from "react";

// ── Colors ────────────────────────────────────────────────────────────────────
const C = {
  green:   "#73c991",
  yellow:  "#e2c08d",
  red:     "#f47067",
  cyan:    "#4ec9b0",
  blue:    "#4fc3f7",
  gray:    "#858585",
  white:   "#d4d4d4",
  dim:     "#555555",
  magenta: "#c586c0",
};

// ── Output helpers ────────────────────────────────────────────────────────────
const col  = (text, color) => ({ text, color });
const plain = (text) => ({ text });

function Line({ parts }) {
  return (
    <div className="leading-5">
      {parts.map((p, i) =>
        p.color
          ? <span key={i} style={{ color: p.color }}>{p.text}</span>
          : <span key={i} style={{ color: C.white }}>{p.text}</span>
      )}
    </div>
  );
}

// ── Virtual filesystem ────────────────────────────────────────────────────────
function initFs(initialFiles) {
  const fs = new Map([
    ["/", "DIR"],
    ["/home", "DIR"],
    ["/home/user", "DIR"],
    ["/usr", "DIR"],
    ["/usr/bin", "DIR"],
    ["/etc", "DIR"],
    ["/tmp", "DIR"],
  ]);

  if (initialFiles) {
    for (const [rawPath, content] of Object.entries(initialFiles)) {
      const isDir = rawPath.endsWith("/") || content === null || content === undefined;
      const path  = rawPath.replace(/\/$/, "") || "/";

      // Ensure parent dirs exist
      const parts = path.split("/").filter(Boolean);
      for (let i = 1; i < parts.length; i++) {
        const p = "/" + parts.slice(0, i).join("/");
        if (!fs.has(p)) fs.set(p, "DIR");
      }

      fs.set(path, isDir ? "DIR" : (content ?? ""));
    }
  }
  return fs;
}

function resolvePath(cwd, input) {
  if (!input || input === "~") return "/home/user";
  if (input.startsWith("~/")) return "/home/user" + input.slice(1);
  const base = input.startsWith("/") ? "" : cwd;
  const raw  = base + "/" + input;
  const parts = raw.split("/");
  const out = [];
  for (const p of parts) {
    if (p === "" || p === ".") continue;
    if (p === "..") out.pop();
    else out.push(p);
  }
  return "/" + out.join("/");
}

function listDir(fs, path) {
  const prefix = path === "/" ? "/" : path + "/";
  const names  = new Set();
  for (const k of fs.keys()) {
    if (k === path) continue;
    if (path === "/" ? k.startsWith("/") && !k.slice(1).includes("/") && k !== "/"
                     : k.startsWith(prefix) && !k.slice(prefix.length).includes("/")) {
      names.add(path === "/" ? k.slice(1) : k.slice(prefix.length));
    }
  }
  return [...names].sort();
}

function copyEntry(fs, src, dst) {
  const srcVal = fs.get(src);
  if (srcVal === undefined) return false;
  if (srcVal === "DIR") {
    fs.set(dst, "DIR");
    const prefix = src === "/" ? "/" : src + "/";
    for (const [k, v] of fs.entries()) {
      if (k.startsWith(prefix)) {
        fs.set(dst + k.slice(src.length), v);
      }
    }
  } else {
    fs.set(dst, srcVal);
  }
  return true;
}

function deleteEntry(fs, path, recursive) {
  const val = fs.get(path);
  if (val === undefined) return "not found";
  if (val === "DIR") {
    const kids = listDir(fs, path);
    if (kids.length > 0 && !recursive) return "directory not empty";
    const prefix = path === "/" ? "/" : path + "/";
    for (const k of [...fs.keys()]) {
      if (k.startsWith(prefix)) fs.delete(k);
    }
  }
  fs.delete(path);
  return null;
}

// ── Simple tokenizer (respects quoted strings) ────────────────────────────────
function tokenize(raw) {
  const tokens = [];
  let cur = "";
  let inQ = false;
  let qChar = "";
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (inQ) {
      if (c === qChar) inQ = false;
      else cur += c;
    } else if (c === '"' || c === "'") {
      inQ = true; qChar = c;
    } else if (c === " " || c === "\t") {
      if (cur) { tokens.push(cur); cur = ""; }
    } else {
      cur += c;
    }
  }
  if (cur) tokens.push(cur);
  return tokens;
}

// ── Parse redirection from token list ────────────────────────────────────────
// Returns { tokens, redirect: null | { op: ">"|">>", file } }
function parseRedirect(tokens) {
  const outIdx = tokens.indexOf(">");
  const appIdx = tokens.indexOf(">>");
  // ">>" must be checked before ">"
  if (appIdx !== -1) {
    const file = tokens[appIdx + 1];
    return { tokens: tokens.slice(0, appIdx), redirect: { op: ">>", file } };
  }
  if (outIdx !== -1) {
    const file = tokens[outIdx + 1];
    return { tokens: tokens.slice(0, outIdx), redirect: { op: ">", file } };
  }
  return { tokens, redirect: null };
}

// ── Man pages (simplified) ────────────────────────────────────────────────────
const MAN_PAGES = {
  pwd:   "pwd — print name of current working directory\n\nUsage: pwd\nPrints the full path of the current directory.",
  ls:    "ls — list directory contents\n\nUsage: ls [options] [path]\n  -l   long format (permissions, size, date)\n  -a   show hidden files (names starting with .)\n  -la  both",
  cd:    "cd — change directory\n\nUsage: cd [path]\n  cd         go to home (~)\n  cd ..      go up one level\n  cd /etc    go to absolute path\n  cd ~/docs  use tilde for home",
  mkdir: "mkdir — make directory\n\nUsage: mkdir [-p] name\n  -p   create parent directories as needed",
  rmdir: "rmdir — remove empty directory\n\nUsage: rmdir name\nFails if directory is not empty. Use rm -r for non-empty.",
  touch: "touch — create empty file (or update timestamp)\n\nUsage: touch filename\nCreates the file if it doesn't exist.",
  cat:   "cat — concatenate and print files\n\nUsage: cat [file...]\nPrints file contents to the terminal.",
  echo:  "echo — write text to terminal\n\nUsage: echo [text] [> file] [>> file]\n  >    write to file (overwrite)\n  >>   append to file",
  head:  "head — output first lines of a file\n\nUsage: head [-n N] file\nDefault: first 10 lines.",
  tail:  "tail — output last lines of a file\n\nUsage: tail [-n N] file\nDefault: last 10 lines.",
  wc:    "wc — word, line and character count\n\nUsage: wc [-l|-w|-c] file\n  -l   count lines\n  -w   count words\n  -c   count characters",
  cp:    "cp — copy files or directories\n\nUsage: cp [-r] source destination\n  -r   copy directories recursively",
  mv:    "mv — move (rename) files\n\nUsage: mv source destination\nIf destination is a directory, source is moved inside it.",
  rm:    "rm — remove files or directories\n\nUsage: rm [-r] [-f] path\n  -r   remove directories recursively\n  -f   force (no errors on missing files)\n  ⚠️  rm -rf is irreversible — be careful.",
  grep:  "grep — search text using patterns\n\nUsage: grep [options] pattern [file]\n  -r   recursive (search directories)\n  -i   case-insensitive\n  -n   show line numbers\n  -l   show filenames only\n  -c   count matches",
  find:  "find — search for files\n\nUsage: find [path] [-name pattern] [-type f|d]\n  -name '*.js'   glob pattern match\n  -type f        files only\n  -type d        directories only",
  which: "which — locate a command\n\nUsage: which command\nShows the path to the command binary.",
  env:   "env — print environment variables\n\nUsage: env\nPrints all current environment variables as KEY=value pairs.",
  export:"export — set environment variable\n\nUsage: export NAME=value\nMakes the variable available to child processes.",
  alias: "alias — create command shortcuts\n\nUsage: alias name='command'\n       alias         (list all aliases)\nExample: alias ll='ls -la'",
  clear: "clear — clear the terminal screen\n\nUsage: clear (or Ctrl+L)\nScrolls the output out of view.",
  history:"history — show command history\n\nUsage: history\nLists previously run commands. Use ↑/↓ arrows to navigate.",
  pipe:  "| (pipe) — connect command output to command input\n\nUsage: cmd1 | cmd2\nExample: cat file.txt | grep hello\nThe output of cmd1 becomes the input of cmd2.",
};

// ── Main command executor ─────────────────────────────────────────────────────
function runCommand(raw, { fs, cwd, env, aliases, cmdHistory }) {
  const trimmed = raw.trim();
  if (!trimmed) return { output: [], newCwd: cwd, newFs: fs, newEnv: env, newAliases: aliases };

  const lines = [];
  const push    = (parts) => lines.push({ parts });
  const pushCol = (text, color) => push([col(text, color)]);
  const pushPlain = (text) => push([plain(text)]);
  const err     = (msg) => push([col(`Error: ${msg}`, C.red)]);

  // Expand aliases
  let expandedRaw = trimmed;
  for (const [name, cmd] of Object.entries(aliases)) {
    if (expandedRaw === name || expandedRaw.startsWith(name + " ")) {
      expandedRaw = cmd + expandedRaw.slice(name.length);
      break;
    }
  }

  // Expand env vars ($VAR or ${VAR})
  expandedRaw = expandedRaw.replace(/\$\{(\w+)\}|\$(\w+)/g, (_, a, b) => env[a || b] ?? "");

  // Handle pipes: split on | and process sequentially
  const segments = expandedRaw.split("|").map(s => s.trim());
  let pipeInput = null;

  for (let si = 0; si < segments.length; si++) {
    const seg = segments[si];
    const allTokens = tokenize(seg);
    const { tokens, redirect } = parseRedirect(allTokens);
    const [cmd, ...args] = tokens;
    const segLines = [];
    const segPush    = (parts) => segLines.push({ parts });
    const segPlain   = (text)  => segPush([plain(text)]);
    const segCol     = (text, color) => segPush([col(text, color)]);
    const segErr     = (msg)   => segPush([col(`Error: ${msg}`, C.red)]);
    let newCwd = cwd;

    switch (cmd) {
      case "pwd": {
        segPlain(cwd);
        break;
      }

      case "ls": {
        const flags = args.filter(a => a.startsWith("-")).join("");
        const pathArg = args.find(a => !a.startsWith("-"));
        const target = pathArg ? resolvePath(cwd, pathArg) : cwd;
        const entry = fs.get(target);
        if (!entry) { segErr(`ls: ${target}: No such file or directory`); break; }
        if (entry !== "DIR") {
          segPlain(target.split("/").pop());
          break;
        }
        const names = listDir(fs, target);
        const showHidden = flags.includes("a");
        const longFmt    = flags.includes("l");
        const displayed  = showHidden ? [".","..","...", ...names] : names;
        if (!longFmt) {
          // colorize: dirs in blue, files in white
          const parts = displayed.map(n => {
            const full = target === "/" ? `/${n}` : `${target}/${n}`;
            const isDir = fs.get(full) === "DIR" || n === "." || n === ".." || n === "...";
            return isDir
              ? col(n + "/  ", C.blue)
              : col(n + "  ", C.white);
          });
          if (parts.length) segPush(parts);
        } else {
          segCol(`total ${displayed.length}`, C.dim);
          for (const n of displayed) {
            const full = target === "/" ? `/${n}` : `${target}/${n}`;
            const isDir = fs.get(full) === "DIR" || n === "." || n === "..";
            const content = fs.get(full);
            const size = isDir ? "4096" : String(typeof content === "string" ? content.length : 0);
            const perm = isDir ? "drwxr-xr-x" : "-rw-r--r--";
            segPush([
              col(`${perm}  1 user user `, C.dim),
              col(size.padStart(6) + " ", C.yellow),
              col("May 25 2026 ", C.dim),
              isDir ? col(n + "/", C.blue) : col(n, C.white),
            ]);
          }
        }
        break;
      }

      case "cd": {
        const target = args[0] ? resolvePath(cwd, args[0]) : "/home/user";
        if (!fs.has(target)) { segErr(`cd: ${args[0]}: No such file or directory`); break; }
        if (fs.get(target) !== "DIR") { segErr(`cd: ${args[0]}: Not a directory`); break; }
        newCwd = target;
        break;
      }

      case "mkdir": {
        const hasP = args.includes("-p");
        const pathArgs = args.filter(a => !a.startsWith("-"));
        for (const a of pathArgs) {
          const target = resolvePath(cwd, a);
          if (fs.has(target)) { segErr(`mkdir: ${a}: File exists`); continue; }
          if (!hasP) {
            const parent = target.split("/").slice(0, -1).join("/") || "/";
            if (!fs.has(parent)) { segErr(`mkdir: ${a}: No such file or directory`); continue; }
          } else {
            const parts = target.split("/").filter(Boolean);
            for (let i = 1; i <= parts.length; i++) {
              const p = "/" + parts.slice(0, i).join("/");
              if (!fs.has(p)) fs.set(p, "DIR");
            }
          }
          fs.set(target, "DIR");
        }
        break;
      }

      case "rmdir": {
        for (const a of args) {
          const target = resolvePath(cwd, a);
          if (!fs.has(target)) { segErr(`rmdir: ${a}: No such file or directory`); continue; }
          if (fs.get(target) !== "DIR") { segErr(`rmdir: ${a}: Not a directory`); continue; }
          if (listDir(fs, target).length > 0) { segErr(`rmdir: ${a}: Directory not empty`); continue; }
          fs.delete(target);
        }
        break;
      }

      case "touch": {
        for (const a of args.filter(a => !a.startsWith("-"))) {
          const target = resolvePath(cwd, a);
          if (!fs.has(target)) {
            const parent = target.split("/").slice(0, -1).join("/") || "/";
            if (!fs.has(parent)) { segErr(`touch: ${a}: No such file or directory`); continue; }
            fs.set(target, "");
          }
          // if exists, just "update timestamp" (no-op in sim)
        }
        break;
      }

      case "cat": {
        const fileArgs = args.filter(a => !a.startsWith("-"));
        if (pipeInput !== null && fileArgs.length === 0) {
          for (const line of pipeInput.split("\n")) segPlain(line);
          break;
        }
        for (const a of fileArgs) {
          const target = resolvePath(cwd, a);
          const entry = fs.get(target);
          if (entry === undefined) { segErr(`cat: ${a}: No such file or directory`); continue; }
          if (entry === "DIR") { segErr(`cat: ${a}: Is a directory`); continue; }
          for (const line of entry.split("\n")) segPlain(line);
        }
        break;
      }

      case "echo": {
        // args already expanded (env vars done above)
        const msg = args.join(" ");
        segPlain(msg);
        break;
      }

      case "head": {
        const nIdx = args.indexOf("-n");
        const n = nIdx !== -1 ? parseInt(args[nIdx + 1]) || 10 : 10;
        const fileArg = args.find(a => !a.startsWith("-") && (nIdx === -1 || args.indexOf(a) !== nIdx + 1));
        const source = pipeInput !== null && !fileArg ? pipeInput : fs.get(resolvePath(cwd, fileArg ?? ""));
        if (source === undefined) { segErr(`head: ${fileArg}: No such file or directory`); break; }
        if (source === "DIR") { segErr(`head: ${fileArg}: Is a directory`); break; }
        source.split("\n").slice(0, n).forEach(l => segPlain(l));
        break;
      }

      case "tail": {
        const nIdx = args.indexOf("-n");
        const n = nIdx !== -1 ? parseInt(args[nIdx + 1]) || 10 : 10;
        const fileArg = args.find(a => !a.startsWith("-") && (nIdx === -1 || args.indexOf(a) !== nIdx + 1));
        const source = pipeInput !== null && !fileArg ? pipeInput : fs.get(resolvePath(cwd, fileArg ?? ""));
        if (source === undefined) { segErr(`tail: ${fileArg}: No such file or directory`); break; }
        if (source === "DIR") { segErr(`tail: ${fileArg}: Is a directory`); break; }
        const allLines = source.split("\n");
        allLines.slice(Math.max(0, allLines.length - n)).forEach(l => segPlain(l));
        break;
      }

      case "wc": {
        const flags = args.filter(a => a.startsWith("-")).join("");
        const fileArg = args.find(a => !a.startsWith("-"));
        const source = pipeInput !== null && !fileArg ? pipeInput : fileArg ? fs.get(resolvePath(cwd, fileArg)) : null;
        if (source === undefined || source === null) { segErr(`wc: ${fileArg ?? "(stdin)"}: No such file`); break; }
        if (source === "DIR") { segErr(`wc: ${fileArg}: Is a directory`); break; }
        const lineCount = source.split("\n").length;
        const wordCount = source.split(/\s+/).filter(Boolean).length;
        const charCount = source.length;
        if (flags.includes("l")) { segPlain(String(lineCount)); break; }
        if (flags.includes("w")) { segPlain(String(wordCount)); break; }
        if (flags.includes("c")) { segPlain(String(charCount)); break; }
        segPush([
          col(String(lineCount).padStart(8), C.white),
          col(String(wordCount).padStart(8), C.white),
          col(String(charCount).padStart(8), C.white),
          col(fileArg ? "  " + fileArg : "  (stdin)", C.dim),
        ]);
        break;
      }

      case "cp": {
        const hasR = args.includes("-r") || args.includes("-R") || args.includes("-rf") || args.includes("-fr");
        const pathArgs = args.filter(a => !a.startsWith("-"));
        if (pathArgs.length < 2) { segErr("cp: missing destination"); break; }
        const [srcRaw, dstRaw] = pathArgs;
        const src = resolvePath(cwd, srcRaw);
        let dst = resolvePath(cwd, dstRaw);
        if (!fs.has(src)) { segErr(`cp: ${srcRaw}: No such file or directory`); break; }
        if (fs.get(src) === "DIR" && !hasR) { segErr(`cp: ${srcRaw}: is a directory (use -r)`); break; }
        // If dst is an existing dir, copy inside it
        if (fs.get(dst) === "DIR") {
          dst = dst + "/" + src.split("/").pop();
        }
        const newFs = new Map(fs);
        copyEntry(newFs, src, dst);
        lines.push(...segLines);
        return { output: lines, newCwd: cwd, newFs, newEnv: env, newAliases: aliases };
      }

      case "mv": {
        const pathArgs = args.filter(a => !a.startsWith("-"));
        if (pathArgs.length < 2) { segErr("mv: missing destination"); break; }
        const [srcRaw, dstRaw] = pathArgs;
        const src = resolvePath(cwd, srcRaw);
        let dst = resolvePath(cwd, dstRaw);
        if (!fs.has(src)) { segErr(`mv: ${srcRaw}: No such file or directory`); break; }
        if (fs.get(dst) === "DIR") {
          dst = dst + "/" + src.split("/").pop();
        }
        const newFs = new Map(fs);
        copyEntry(newFs, src, dst);
        deleteEntry(newFs, src, true);
        lines.push(...segLines);
        return { output: lines, newCwd: cwd, newFs, newEnv: env, newAliases: aliases };
      }

      case "rm": {
        const flags = args.filter(a => a.startsWith("-")).join("");
        const recursive = flags.includes("r") || flags.includes("R");
        const pathArgs = args.filter(a => !a.startsWith("-"));
        const newFs = new Map(fs);
        for (const a of pathArgs) {
          const target = resolvePath(cwd, a);
          if (!newFs.has(target)) {
            if (!flags.includes("f")) segErr(`rm: ${a}: No such file or directory`);
            continue;
          }
          const e = deleteEntry(newFs, target, recursive);
          if (e) segErr(`rm: ${a}: ${e}`);
        }
        lines.push(...segLines);
        return { output: lines, newCwd: cwd, newFs, newEnv: env, newAliases: aliases };
      }

      case "grep": {
        const flags = args.filter(a => a.startsWith("-")).join("");
        const nonFlags = args.filter(a => !a.startsWith("-"));
        const pattern = nonFlags[0];
        const fileArg = nonFlags[1];
        if (!pattern) { segErr("grep: missing pattern"); break; }
        const source = pipeInput !== null && !fileArg ? pipeInput : fileArg ? (() => {
          const v = fs.get(resolvePath(cwd, fileArg));
          return (v === undefined || v === "DIR") ? null : v;
        })() : null;
        if (source === null) { segErr(`grep: ${fileArg ?? "(no input)"}: No such file`); break; }
        try {
          const re = new RegExp(pattern, flags.includes("i") ? "gi" : "g");
          const allLines = source.split("\n");
          if (flags.includes("c")) {
            segPlain(String(allLines.filter(l => re.test(l)).length));
            re.lastIndex = 0;
            break;
          }
          if (flags.includes("l") && fileArg) {
            if (allLines.some(l => { re.lastIndex = 0; return re.test(l); })) segPlain(fileArg);
            break;
          }
          allLines.forEach((line, idx) => {
            re.lastIndex = 0;
            if (re.test(line)) {
              const parts = [];
              if (flags.includes("n")) parts.push(col(`${idx + 1}:`, C.green));
              // Highlight matches
              re.lastIndex = 0;
              let last = 0;
              let m;
              while ((m = re.exec(line)) !== null) {
                if (m.index > last) parts.push(plain(line.slice(last, m.index)));
                parts.push(col(m[0], C.red));
                last = m.index + m[0].length;
                if (!re.global) break;
              }
              if (last < line.length) parts.push(plain(line.slice(last)));
              segPush(parts);
            }
          });
        } catch {
          segErr(`grep: invalid pattern: ${pattern}`);
        }
        break;
      }

      case "find": {
        const firstNonFlag = args.find(a => !a.startsWith("-"));
        const searchRoot = firstNonFlag && !firstNonFlag.startsWith("-") ? resolvePath(cwd, firstNonFlag) : cwd;
        const nameIdx = args.indexOf("-name");
        const typeIdx = args.indexOf("-type");
        const namePattern = nameIdx !== -1 ? args[nameIdx + 1] : null;
        const typeFilter  = typeIdx !== -1 ? args[typeIdx + 1] : null;

        const globToRe = (g) => new RegExp(
          "^" + g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
        );
        const nameRe = namePattern ? globToRe(namePattern) : null;

        for (const [k] of fs.entries()) {
          if (k === searchRoot || (k.startsWith(searchRoot === "/" ? "/" : searchRoot + "/"))) {
            const isDir = fs.get(k) === "DIR";
            if (typeFilter === "f" && isDir) continue;
            if (typeFilter === "d" && !isDir) continue;
            const basename = k.split("/").pop();
            if (nameRe && !nameRe.test(basename)) continue;
            segPlain(k);
          }
        }
        break;
      }

      case "which": {
        const builtins = ["pwd","ls","cd","mkdir","rmdir","touch","cat","echo","head","tail","wc","cp","mv","rm","grep","find","which","env","export","alias","clear","history","man","help"];
        for (const a of args) {
          if (builtins.includes(a)) segPlain(`/usr/bin/${a} (shell builtin)`);
          else segCol(`which: ${a}: not found`, C.red);
        }
        break;
      }

      case "env": {
        for (const [k, v] of Object.entries(env)) {
          segPush([col(`${k}`, C.green), col("=", C.dim), plain(v)]);
        }
        break;
      }

      case "export": {
        for (const a of args) {
          const eq = a.indexOf("=");
          if (eq === -1) { segErr(`export: invalid syntax: ${a}`); continue; }
          const key = a.slice(0, eq);
          const val = a.slice(eq + 1);
          if (!/^[A-Za-z_]\w*$/.test(key)) { segErr(`export: invalid variable name: ${key}`); continue; }
          env[key] = val;
        }
        break;
      }

      case "alias": {
        if (args.length === 0) {
          for (const [k, v] of Object.entries(aliases)) {
            segPush([col(`alias `, C.yellow), col(k, C.green), col("=", C.dim), plain(`'${v}'`)]);
          }
          break;
        }
        for (const a of args) {
          const eq = a.indexOf("=");
          if (eq === -1) {
            if (aliases[a]) segPush([col(`alias `, C.yellow), col(a, C.green), col("=", C.dim), plain(`'${aliases[a]}'`)]);
            else segErr(`alias: ${a}: not found`);
          } else {
            aliases[a.slice(0, eq)] = a.slice(eq + 1).replace(/^['"]|['"]$/g, "");
          }
        }
        break;
      }

      case "history": {
        cmdHistory.forEach((cmd, i) => {
          segPush([col(String(i + 1).padStart(4), C.dim), plain("  " + cmd)]);
        });
        break;
      }

      case "man": {
        const topic = args[0];
        if (!topic) { segErr("man: what manual page do you want?"); break; }
        const page = MAN_PAGES[topic];
        if (!page) { segCol(`No manual entry for ${topic}`, C.yellow); break; }
        for (const line of page.split("\n")) {
          const isHeader = !line.startsWith(" ") && line.trim().length > 0 && line === line.toUpperCase();
          segPush([col(line, isHeader ? C.yellow : C.white)]);
        }
        break;
      }

      case "help": {
        const cmds = [
          ["pwd",     "print working directory"],
          ["ls",      "list directory contents  (ls -la for details)"],
          ["cd",      "change directory          (cd .., cd ~, cd /path)"],
          ["mkdir",   "make directory            (mkdir -p for parents)"],
          ["rmdir",   "remove empty directory"],
          ["touch",   "create empty file"],
          ["cat",     "print file contents"],
          ["echo",    "print text  (echo text > file to write)"],
          ["head",    "first N lines of a file   (head -n 5 file)"],
          ["tail",    "last N lines of a file    (tail -n 5 file)"],
          ["wc",      "count lines/words/chars   (wc -l file)"],
          ["cp",      "copy file or directory    (cp -r for dirs)"],
          ["mv",      "move or rename"],
          ["rm",      "remove file               (rm -r for dirs)"],
          ["grep",    "search text               (grep pattern file)"],
          ["find",    "find files                (find . -name '*.txt')"],
          ["which",   "locate a command"],
          ["env",     "print environment variables"],
          ["export",  "set environment variable  (export NAME=value)"],
          ["alias",   "create command shortcut   (alias ll='ls -la')"],
          ["history", "show command history"],
          ["man",     "show help for a command   (man ls)"],
          ["|",       "pipe output to next command (ls | grep .txt)"],
          [">",       "redirect output to file   (echo hi > file.txt)"],
          [">>",      "append output to file     (echo hi >> file.txt)"],
        ];
        segPush([col("Available commands:", C.yellow)]);
        segPush([plain("")]);
        for (const [name, desc] of cmds) {
          segPush([col(name.padEnd(12), C.green), col(desc, C.dim)]);
        }
        segPush([plain("")]);
        segPush([col("Tip: ", C.cyan), plain("man <cmd> for detailed help.  Use ↑↓ for history.")]);
        break;
      }

      case "clear": {
        lines.push({ parts: [plain("__CLEAR__")] });
        break;
      }

      case undefined:
      case "":
        break;

      default: {
        segCol(`${cmd}: command not found`, C.red);
        segPush([col("Type ", C.dim), col("help", C.green), col(" to see available commands.", C.dim)]);
      }
    }

    // Handle redirection for this segment
    if (redirect && redirect.file) {
      const destPath = resolvePath(cwd, redirect.file);
      const textContent = segLines.map(l => l.parts.map(p => p.text).join("")).join("\n");
      if (redirect.op === ">") {
        fs.set(destPath, textContent);
      } else {
        const existing = fs.get(destPath);
        fs.set(destPath, (existing && existing !== "DIR" ? existing + "\n" : "") + textContent);
      }
      // Don't add segment lines to output (they went to file)
      pipeInput = textContent;
    } else {
      // pipeInput for next segment = text of this segment's output
      pipeInput = segLines.map(l => l.parts.map(p => p.text).join("")).join("\n");
      if (si === segments.length - 1) {
        // Last segment: add to output
        lines.push(...segLines);
      }
      // else: intermediate — output is piped, not printed
    }

    // cwd change propagates
    cwd = newCwd;
  }

  return { output: lines, newCwd: cwd, newFs: fs, newEnv: env, newAliases: aliases };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ShellTerminal({ params = {} }) {
  const {
    instanceId,
    initialFiles,
    initialCwd     = "/home/user",
    welcomeMessage,
    prompt: promptLabel = "user",
    hostname           = "upskill",
  } = params;

  const [fsMap, setFsMap]         = useState(() => initFs(initialFiles));
  const [cwd, setCwd]             = useState(initialCwd);
  const [env, setEnv]             = useState({
    HOME: "/home/user",
    USER: "user",
    SHELL: "/bin/zsh",
    PATH: "/usr/local/bin:/usr/bin:/bin",
    TERM: "xterm-256color",
  });
  const [aliases, setAliases]     = useState({});
  const [history, setHistory]     = useState(() => {
    if (welcomeMessage) return [{ parts: [col(welcomeMessage, C.cyan)] }];
    return [
      { parts: [col("Terminal ready. Type ", C.dim), col("help", C.green), col(" to see available commands.", C.dim)] },
    ];
  });
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx]       = useState(-1);
  const [input, setInput]           = useState("");

  const outputRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const prompt = `${promptLabel}@${hostname}:${cwd.replace("/home/user", "~")}$`;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      const cmd = input.trim();
      const promptLine = { parts: [col(prompt + " ", C.green), plain(input)] };

      if (cmd === "clear") {
        setHistory([]);
        setInput("");
        setCmdHistory(h => [cmd, ...h]);
        setHistIdx(-1);
        return;
      }

      if (!cmd) {
        setHistory(h => [...h, promptLine]);
        setInput("");
        return;
      }

      const newFs = new Map(fsMap);
      const newEnv = { ...env };
      const newAliases = { ...aliases };

      const result = runCommand(cmd, {
        fs: newFs,
        cwd,
        env: newEnv,
        aliases: newAliases,
        cmdHistory,
      });

      const newHistory = [
        ...history,
        promptLine,
        ...result.output,
      ];

      setHistory(newHistory);
      setFsMap(result.newFs);
      setCwd(result.newCwd);
      setEnv(result.newEnv);
      setAliases(result.newAliases);
      setCmdHistory(h => [cmd, ...h]);
      setHistIdx(-1);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistIdx(idx => {
        const next = Math.min(idx + 1, cmdHistory.length - 1);
        setInput(cmdHistory[next] ?? "");
        return next;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHistIdx(idx => {
        const next = Math.max(idx - 1, -1);
        setInput(next === -1 ? "" : (cmdHistory[next] ?? ""));
        return next;
      });
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      setHistory(h => [...h, { parts: [col(prompt + " ", C.green), plain(input), col("^C", C.red)] }]);
      setInput("");
    }
  };

  return (
    <div
      className="flex flex-col h-full min-h-[400px] max-h-[640px] rounded-lg overflow-hidden border border-gray-700"
      style={{ background: "#0d1117", fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace" }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-gray-700 flex-shrink-0"
        style={{ background: "#161b22" }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#27c93f" }} />
          <span className="text-xs ml-2" style={{ color: C.gray }}>
            zsh — {promptLabel}@{hostname}
          </span>
        </div>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-mono"
          style={{ background: "#1f2937", color: C.green }}
        >
          {cwd.replace("/home/user", "~")}
        </span>
      </div>

      {/* Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-auto p-4 text-xs space-y-0"
      >
        {history.map((entry, i) => (
          <Line key={i} parts={entry.parts} />
        ))}

        {/* Current input line */}
        <div className="flex items-center mt-1">
          <span style={{ color: C.green, whiteSpace: "pre" }}>{prompt} </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-xs caret-white"
            style={{ color: C.white, fontFamily: "inherit" }}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
      </div>

      {/* Status bar */}
      <div
        className="flex items-center gap-4 px-4 py-1 border-t border-gray-700 flex-shrink-0 text-[10px]"
        style={{ background: "#161b22", color: C.dim }}
      >
        <span>↑↓ history</span>
        <span>Ctrl+L clear</span>
        <span>Ctrl+C cancel</span>
        <span>man &lt;cmd&gt; for help</span>
      </div>
    </div>
  );
}
