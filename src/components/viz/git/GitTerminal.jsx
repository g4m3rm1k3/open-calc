import { useState, useEffect, useRef, useCallback } from "react";
import {
  sharedInits,
  getOrCreateEngine,
} from "../../../scripts/git/GitSharedInstances.js";

// ── ANSI-style token types ────────────────────────────────────────────────────
const COLOR = {
  green: "#73c991",
  yellow: "#e2c08d",
  red: "#f47067",
  cyan: "#4ec9b0",
  blue: "#4fc3f7",
  gray: "#858585",
  white: "#d4d4d4",
  dim: "#555555",
  magenta: "#c586c0",
};

function Line({ parts }) {
  return (
    <div className="leading-5">
      {parts.map((p, i) =>
        p.color ? (
          <span key={i} style={{ color: p.color }}>
            {p.text}
          </span>
        ) : (
          <span key={i} style={{ color: COLOR.white }}>
            {p.text}
          </span>
        ),
      )}
    </div>
  );
}

function text(t, color) {
  return [{ text: t, color }];
}
function plain(t) {
  return [{ text: t }];
}

// ── Command parser ────────────────────────────────────────────────────────────
function parseCommand(raw) {
  // Simple shell-like parse: respects "quoted args" and > redirection
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
      inQ = true;
      qChar = c;
    } else if (c === " " || c === "\t") {
      if (cur) {
        tokens.push(cur);
        cur = "";
      }
    } else {
      cur += c;
    }
  }
  if (cur) tokens.push(cur);
  return tokens;
}

// ── Output builder ────────────────────────────────────────────────────────────
function buildOutput(tokens, git, workingDirRef) {
  const lines = []; // array of {parts}[]

  const push = (parts) => lines.push({ parts });
  const pushPlain = (t) => push(plain(t));
  const pushColor = (t, c) => push(text(t, c));

  if (!tokens.length) return lines;

  const cmd = tokens[0];
  const sub = tokens[1];

  // ── built-ins ──────────────────────────────────────────────────────────────
  if (cmd === "clear") {
    return [{ clear: true }];
  }

  if (cmd === "ls") {
    const files = Array.from(git.workingDir.keys());
    if (!files.length) pushPlain("(empty working directory)");
    else push(files.map((f) => ({ text: f + "  ", color: COLOR.cyan })));
    return lines;
  }

  if (cmd === "cat") {
    const file = tokens[2] === undefined ? tokens[1] : tokens[2]; // cat <file> or ignored flags
    if (!file) {
      pushColor("cat: missing file operand", COLOR.red);
      return lines;
    }
    const content = git.workingDir.get(file);
    if (content === undefined) {
      pushColor(`cat: ${file}: No such file or directory`, COLOR.red);
      return lines;
    }
    content.split("\n").forEach((l) => pushPlain(l));
    return lines;
  }

  if (cmd === "touch") {
    const file = tokens[1];
    if (!file) {
      pushColor("touch: missing file operand", COLOR.red);
      return lines;
    }
    if (!git.workingDir.has(file)) git.writeFile(file, "");
    // no output on success
    return lines;
  }

  // echo "content" > file
  if (cmd === "echo") {
    const gtIdx = tokens.indexOf(">");
    if (gtIdx !== -1) {
      const targetFile = tokens[gtIdx + 1];
      const content = tokens.slice(1, gtIdx).join(" ");
      if (!targetFile) {
        pushColor("echo: expected filename after >", COLOR.red);
        return lines;
      }
      git.writeFile(targetFile, content);
      // no output
    } else {
      pushPlain(tokens.slice(1).join(" "));
    }
    return lines;
  }

  // ── git commands ──────────────────────────────────────────────────────────
  if (cmd !== "git") {
    pushColor(`${cmd}: command not found`, COLOR.red);
    push([
      { text: "Available: ", color: COLOR.gray },
      { text: "git  ls  cat  touch  echo  clear", color: COLOR.yellow },
    ]);
    return lines;
  }

  if (!sub) {
    pushColor("usage: git <command> [<args>]", COLOR.gray);
    push(
      text(
        "Common commands: status  add  commit  log  branch  checkout  merge  restore  diff",
        COLOR.gray,
      ),
    );
    return lines;
  }

  // git init
  if (sub === "init") {
    pushColor("Initialized empty Git repository.", COLOR.green);
    return lines;
  }

  // git status
  if (sub === "status") {
    const s = git.status();
    push([
      { text: "On branch ", color: COLOR.white },
      { text: s.branch, color: COLOR.green },
    ]);
    push([]);

    if (
      !s.staged.length &&
      !s.modified.length &&
      !s.untracked.length &&
      !s.deleted.length
    ) {
      pushColor("nothing to commit, working tree clean", COLOR.green);
      return lines;
    }

    if (s.staged.length) {
      pushColor("Changes to be committed:", COLOR.green);
      push(
        text('  (use "git restore --staged <file>..." to unstage)', COLOR.gray),
      );
      s.staged.forEach((f) =>
        push([{ text: "\tnew file/modified:   " + f, color: COLOR.green }]),
      );
      push([]);
    }

    if (s.modified.length || s.deleted.length) {
      pushColor("Changes not staged for commit:", COLOR.red);
      push(
        text(
          '  (use "git add <file>..." to update what will be committed)',
          COLOR.gray,
        ),
      );
      push(
        text('  (use "git restore <file>..." to discard changes)', COLOR.gray),
      );
      s.modified.forEach((f) =>
        push([{ text: "\tmodified:   " + f, color: COLOR.red }]),
      );
      s.deleted.forEach((f) =>
        push([{ text: "\tdeleted:    " + f, color: COLOR.red }]),
      );
      push([]);
    }

    if (s.untracked.length) {
      pushColor("Untracked files:", COLOR.red);
      push(
        text(
          '  (use "git add <file>..." to include in what will be committed)',
          COLOR.gray,
        ),
      );
      s.untracked.forEach((f) => push([{ text: "\t" + f, color: COLOR.red }]));
      push([]);
    }

    return lines;
  }

  // git add <file|.>
  if (sub === "add") {
    const target = tokens[2];
    if (!target) {
      pushColor("Nothing specified, nothing added.", COLOR.yellow);
      return lines;
    }
    if (target === ".") {
      const s = git.status();
      const toStage = [...s.modified, ...s.untracked, ...s.deleted];
      if (!toStage.length) {
        pushColor("nothing to add", COLOR.gray);
        return lines;
      }
      toStage.forEach((f) => git.add(f));
      // silent on success like real git
    } else {
      git.add(target);
      if (git.statusMessage.startsWith("error:")) {
        pushColor(git.statusMessage, COLOR.red);
      }
    }
    return lines;
  }

  // git commit -m "msg" OR git commit (no message)
  if (sub === "commit") {
    const mIdx = tokens.indexOf("-m");
    const msg = mIdx !== -1 ? tokens[mIdx + 1] : null;
    if (!msg) {
      pushColor("Aborting commit due to empty commit message.", COLOR.red);
      push(text('Use: git commit -m "your message here"', COLOR.gray));
      return lines;
    }
    const hash = git.commit(msg);
    if (!hash) {
      pushColor("On branch " + git.head, COLOR.white);
      pushColor("nothing to commit, working tree clean", COLOR.green);
    } else {
      push([
        {
          text: "[" + git.head + " " + hash.slice(0, 7) + "] ",
          color: COLOR.yellow,
        },
        { text: msg, color: COLOR.white },
      ]);
      const committed = git.getCommittedFiles();
      push([
        {
          text: " " + committed.size + " file(s) committed",
          color: COLOR.gray,
        },
      ]);
    }
    return lines;
  }

  // git log [--oneline] [--all]
  if (sub === "log") {
    const oneline = tokens.includes("--oneline");
    const allBranches = tokens.includes("--all") || tokens.includes("--graph");

    const allCommits = new Map();
    const visited = new Set();
    const queue = allBranches
      ? Object.values(git.branches).filter(Boolean)
      : [git._getBranchTip(git.head)].filter(Boolean);

    while (queue.length) {
      const hash = queue.shift();
      if (!hash || visited.has(hash)) continue;
      visited.add(hash);
      const obj = git.objects.get(hash);
      if (!obj || obj.type !== "commit") continue;
      allCommits.set(hash, { hash, ...obj.data });
      if (obj.data.parent) queue.push(obj.data.parent);
      if (obj.data.mergeParent) queue.push(obj.data.mergeParent);
    }

    const commits = Array.from(allCommits.values()).sort(
      (a, b) => b.timestamp - a.timestamp,
    );

    if (!commits.length) {
      pushColor("fatal: your current branch has no commits yet", COLOR.red);
      return lines;
    }

    // Find branch labels for each commit
    const hashToRefs = new Map();
    Object.entries(git.branches).forEach(([branch, hash]) => {
      if (!hash) return;
      if (!hashToRefs.has(hash)) hashToRefs.set(hash, []);
      hashToRefs.get(hash).push(branch);
    });
    const currentCommit = git._getBranchTip(git.head);
    if (currentCommit && !hashToRefs.get(currentCommit)?.includes("HEAD")) {
      if (!hashToRefs.has(currentCommit)) hashToRefs.set(currentCommit, []);
      // HEAD label only if detached
      if (!git.branches[git.head])
        hashToRefs.get(currentCommit).unshift("HEAD");
    }

    commits.forEach((c) => {
      const short = c.hash.slice(0, 7);
      const refs = hashToRefs.get(c.hash) ?? [];
      const refLabel = refs.length ? " (" + refs.join(", ") + ")" : "";
      const isHead =
        c.hash === currentCommit &&
        !git._isDetached() &&
        refs.includes(git.head);

      if (oneline) {
        push([
          { text: short, color: COLOR.yellow },
          { text: (isHead ? " -> " : "    ") + c.message, color: COLOR.white },
          { text: refLabel, color: COLOR.cyan },
        ]);
      } else {
        push([{ text: "commit " + c.hash, color: COLOR.yellow }]);
        if (c.mergeParent) {
          push([
            {
              text:
                "Merge: " +
                c.parent?.slice(0, 7) +
                " " +
                c.mergeParent.slice(0, 7),
              color: COLOR.white,
            },
          ]);
        }
        push([
          {
            text: "Author: " + (c.author ?? "User <user@opencalc.io>"),
            color: COLOR.white,
          },
        ]);
        const date = new Date(c.timestamp).toLocaleString();
        push([{ text: "Date:   " + date, color: COLOR.white }]);
        push([]);
        push([{ text: "    " + c.message + refLabel, color: COLOR.white }]);
        push([]);
      }
    });
    return lines;
  }

  // git diff [file]
  if (sub === "diff") {
    const file = tokens[2];
    const s = git.status();
    const targets = file ? [file] : s.modified;
    if (!targets.length) {
      pushColor("(no changes)", COLOR.gray);
      return lines;
    }
    const committed = git.getCommittedFiles();
    targets.forEach((f) => {
      push([{ text: "diff --git a/" + f + " b/" + f, color: COLOR.white }]);
      const old = (committed.get(f) ?? "").split("\n");
      const cur = (git.workingDir.get(f) ?? "").split("\n");
      old.forEach((l) => push([{ text: "- " + l, color: COLOR.red }]));
      cur.forEach((l) => push([{ text: "+ " + l, color: COLOR.green }]));
      push([]);
    });
    return lines;
  }

  // git branch [name] [-d name] [-D name]
  if (sub === "branch") {
    const dFlag = tokens.indexOf("-d") !== -1 || tokens.indexOf("-D") !== -1;
    const forceDelete = tokens.indexOf("-D") !== -1;
    const name = tokens[2];

    if (dFlag) {
      const target = name;
      if (!target) {
        pushColor("error: branch name required", COLOR.red);
        return lines;
      }
      if (target === git.head) {
        pushColor(
          `error: Cannot delete the branch '${target}' that you are currently on.`,
          COLOR.red,
        );
        return lines;
      }
      if (!git.branches[target]) {
        pushColor(`error: branch '${target}' not found.`, COLOR.red);
        return lines;
      }
      // Simple safety check: warn if not merged
      delete git.branches[target];
      push(text(`Deleted branch ${target}.`, COLOR.white));
      return lines;
    }

    if (!name) {
      // List branches
      Object.keys(git.branches).forEach((b) => {
        const isCurrent = b === git.head;
        push([
          { text: isCurrent ? "* " : "  ", color: COLOR.green },
          { text: b, color: isCurrent ? COLOR.green : COLOR.white },
        ]);
      });
      return lines;
    }

    // Create branch
    git.branch(name);
    if (git.statusMessage.startsWith("fatal:")) {
      pushColor(git.statusMessage, COLOR.red);
    }
    // silent on success
    return lines;
  }

  // git checkout [-b] <target>
  if (sub === "checkout") {
    const bFlag = tokens[2] === "-b";
    const target = bFlag ? tokens[3] : tokens[2];
    if (!target) {
      pushColor("error: missing branch/commit", COLOR.red);
      return lines;
    }

    if (bFlag) {
      git.branch(target);
      if (git.statusMessage.startsWith("fatal:")) {
        pushColor(git.statusMessage, COLOR.red);
        return lines;
      }
      git.checkout(target);
      push([
        { text: "Switched to a new branch '", color: COLOR.white },
        { text: target, color: COLOR.green },
        { text: "'", color: COLOR.white },
      ]);
    } else {
      git.checkout(target);
      if (git.statusMessage.startsWith("error:")) {
        pushColor(git.statusMessage, COLOR.red);
      } else {
        push([{ text: git.statusMessage, color: COLOR.white }]);
      }
    }
    return lines;
  }

  // git switch [-c] <target>
  if (sub === "switch") {
    const cFlag = tokens[2] === "-c";
    const target = cFlag ? tokens[3] : tokens[2];
    if (!target) {
      pushColor("error: missing branch name", COLOR.red);
      return lines;
    }
    if (cFlag) {
      git.branch(target);
      if (git.statusMessage.startsWith("fatal:")) {
        pushColor(git.statusMessage, COLOR.red);
        return lines;
      }
    }
    git.checkout(target);
    if (git.statusMessage.startsWith("error:"))
      pushColor(git.statusMessage, COLOR.red);
    else push([{ text: git.statusMessage, color: COLOR.white }]);
    return lines;
  }

  // git merge <branch>
  if (sub === "merge") {
    const source = tokens[2];
    if (!source) {
      pushColor("error: branch name required", COLOR.red);
      return lines;
    }
    const result = git.merge(source);
    if (result.error) {
      pushColor("error: " + result.error, COLOR.red);
    } else if (result.status === "already-up-to-date") {
      pushColor("Already up to date.", COLOR.white);
    } else if (result.status === "fast-forward") {
      push(text("Fast-forward", COLOR.white));
      push(
        text(
          " " + result.hash?.slice(0, 7) + "..." + result.hash?.slice(0, 7),
          COLOR.gray,
        ),
      );
    } else if (result.status === "conflict") {
      push(text("Auto-merging " + result.conflicts.join(", "), COLOR.white));
      push(
        text(
          "CONFLICT (content): Merge conflict in " +
            result.conflicts.join(", "),
          COLOR.red,
        ),
      );
      push(
        text(
          "Automatic merge failed; fix conflicts and then commit the result.",
          COLOR.red,
        ),
      );
    } else {
      push(text("Merge made by the 'ort' strategy.", COLOR.white));
    }
    return lines;
  }

  // git merge --abort
  if (sub === "merge" && tokens[2] === "--abort") {
    pushColor("error: There is no merge to abort.", COLOR.red);
    return lines;
  }

  // git restore <file> OR git restore --staged <file>
  if (sub === "restore") {
    const stagedFlag = tokens.includes("--staged");
    const file = tokens[tokens.length - 1];
    if (!file || file === "--staged") {
      pushColor("error: file required", COLOR.red);
      return lines;
    }
    if (stagedFlag) {
      git.staging.delete(file);
    } else {
      git.discardChanges(file);
    }
    return lines;
  }

  // git show [hash]
  if (sub === "show") {
    const target = tokens[2] ?? git._getBranchTip(git.head);
    if (!target) {
      pushColor("fatal: no commits yet", COLOR.red);
      return lines;
    }
    const hash =
      target.length < 10
        ? Array.from(git.objects.keys()).find((h) => h.startsWith(target))
        : target;
    const obj = hash ? git.objects.get(hash) : null;
    if (!obj || obj.type !== "commit") {
      pushColor(`fatal: bad object ${target}`, COLOR.red);
      return lines;
    }
    const c = obj.data;
    push([{ text: "commit " + hash, color: COLOR.yellow }]);
    push([
      {
        text: "Author: " + (c.author ?? "User <user@opencalc.io>"),
        color: COLOR.white,
      },
    ]);
    push([
      {
        text: "Date:   " + new Date(c.timestamp).toLocaleString(),
        color: COLOR.white,
      },
    ]);
    push([]);
    push([{ text: "    " + c.message, color: COLOR.white }]);
    return lines;
  }

  // git remote [-v]
  if (sub === "remote") {
    if (tokens[2] === "-v" || tokens[2] === undefined) {
      push(
        text(
          "origin  https://github.com/you/dungeon-explorer.git (fetch)",
          COLOR.white,
        ),
      );
      push(
        text(
          "origin  https://github.com/you/dungeon-explorer.git (push)",
          COLOR.white,
        ),
      );
    }
    return lines;
  }

  // git push / git pull / git fetch (simulated — no real network)
  if (sub === "push") {
    push(text("Enumerating objects: done.", COLOR.gray));
    push(text("Counting objects: done.", COLOR.gray));
    push(text("Writing objects: 100% (3/3), done.", COLOR.gray));
    push(text("Branch 'main' set up to track 'origin/main'.", COLOR.cyan));
    push([{ text: "   " + "main -> main  (simulated)", color: COLOR.blue }]);
    return lines;
  }

  if (sub === "pull") {
    push(text("Already up to date.", COLOR.white));
    push(text("(Simulated — no remote in this sandbox)", COLOR.gray));
    return lines;
  }

  if (sub === "fetch") {
    push(text("Fetching origin  (simulated)", COLOR.gray));
    return lines;
  }

  // git stash
  if (sub === "stash") {
    push(
      text(
        "Saved working directory and index state WIP on " +
          git.head +
          ": (simulated)",
        COLOR.white,
      ),
    );
    return lines;
  }

  // git help / --help / -h
  if (sub === "help" || sub === "--help" || sub === "-h") {
    [
      "These are common Git commands:",
      "",
      "  init       Create an empty repo",
      "  status     Show the working tree status",
      "  add        Add file(s) to the staging area",
      "  commit -m  Record changes to the repository",
      "  log        Show commit history",
      "  log --oneline  Compact one-line history",
      "  branch     List, create branches",
      "  checkout   Switch branches or restore files",
      "  checkout -b  Create and switch to a new branch",
      "  merge      Join two branches together",
      "  restore    Discard changes in working directory",
      "  diff       Show unstaged changes",
      "  show       Inspect a commit",
      "  remote -v  Show remotes",
      "  push       Upload commits (simulated)",
      "  pull       Download commits (simulated)",
      "",
      "Other: ls  cat <file>  touch <file>  echo 'x' > file  clear",
    ].forEach((l) => push(l ? plain(l) : []));
    return lines;
  }

  // git reset
  if (sub === "reset") {
    const mode = tokens[2];
    const target = tokens[3] ?? tokens[2];
    if (mode === "--soft" || mode === "--mixed" || mode === "--hard") {
      push(
        text(
          "(git reset simulated — undo via the VS Code panel)",
          COLOR.yellow,
        ),
      );
    } else {
      push(
        text(
          "tip: git reset --hard HEAD~1  undoes the last commit (destructive)",
          COLOR.gray,
        ),
      );
    }
    return lines;
  }

  pushColor(
    `git: '${sub}' is not a supported command in this sandbox.`,
    COLOR.red,
  );
  push(text("Try: git help", COLOR.gray));
  return lines;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GitTerminal({ params = {} }) {
  const {
    initialFiles = {
      "game-design.txt": "Dungeon Explorer\n\nA top-down adventure game.",
    },
    label = "dungeon-explorer",
    instanceId = null,
    prompt = "$ ",
    welcomeMessage = null,
  } = params;

  const gitRef = useRef(null);
  if (!gitRef.current) {
    gitRef.current = getOrCreateEngine(instanceId);
  }
  const git = gitRef.current;

  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Seed files once (same logic as GitWorkspace)
  useEffect(() => {
    if (!instanceId || !sharedInits.has(instanceId)) {
      if (instanceId) sharedInits.add(instanceId);
      Object.entries(initialFiles).forEach(([name, content]) => {
        git.writeFile(name, content);
      });
      refresh();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [history, setHistory] = useState(() => {
    const welcome = welcomeMessage ?? [
      text(`${label}`, COLOR.cyan).concat([
        { text: " — git terminal", color: COLOR.gray },
      ]),
      text('Type "git help" for available commands.', COLOR.dim),
      plain(""),
    ];
    return welcome.map((parts) => ({ parts, type: "output" }));
  });
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);

  const outputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const runCommand = (raw) => {
    const trimmed = raw.trim();
    const promptLine = {
      parts: [
        { text: prompt, color: COLOR.green },
        { text: " " + trimmed, color: COLOR.white },
      ],
      type: "prompt",
    };

    if (!trimmed) {
      setHistory((h) => [...h, promptLine]);
      return;
    }

    setCmdHistory((prev) => [trimmed, ...prev.slice(0, 49)]);
    setHistIdx(-1);

    const tokens = parseCommand(trimmed);
    const outputLines = buildOutput(tokens, git, null);

    if (outputLines.length === 1 && outputLines[0].clear) {
      setHistory([]);
      return;
    }

    const newEntries = outputLines.map((l) => ({
      parts: l.parts ?? [],
      type: "output",
    }));
    setHistory((h) => [...h, promptLine, ...newEntries]);
    refresh();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistIdx((idx) => {
        const next = Math.min(idx + 1, cmdHistory.length - 1);
        setInput(cmdHistory[next] ?? "");
        return next;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHistIdx((idx) => {
        const next = Math.max(idx - 1, -1);
        setInput(next === -1 ? "" : (cmdHistory[next] ?? ""));
        return next;
      });
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  const s = git.status();

  return (
    <div
      className="flex flex-col h-full min-h-[400px] max-h-[640px] rounded-lg overflow-hidden border border-gray-700"
      style={{
        background: "#0d1117",
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-gray-700 flex-shrink-0"
        style={{ background: "#161b22" }}
      >
        <div className="flex items-center gap-2">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "#ff5f56" }}
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "#ffbd2e" }}
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "#27c93f" }}
            />
          </div>
          <span className="text-xs ml-2" style={{ color: COLOR.gray }}>
            zsh — {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-mono"
            style={{ background: "#1f2937", color: COLOR.green }}
          >
            {s.branch}
          </span>
          {s.modified.length + s.untracked.length + s.deleted.length > 0 && (
            <span className="text-[10px]" style={{ color: COLOR.yellow }}>
              ✦ {s.modified.length + s.untracked.length + s.deleted.length}{" "}
              changed
            </span>
          )}
        </div>
      </div>

      {/* Output area */}
      <div ref={outputRef} className="flex-1 overflow-auto p-4 text-xs space-y-0">
        {history.map((entry, i) => (
          <Line key={i} parts={entry.parts} />
        ))}

        {/* Current input line */}
        <div className="flex items-center mt-1">
          <span style={{ color: COLOR.green, whiteSpace: "pre" }}>
            {prompt}{" "}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-xs caret-white"
            style={{ color: COLOR.white, fontFamily: "inherit" }}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>

      </div>

      {/* Status bar */}
      <div
        className="flex items-center gap-4 px-4 py-1 border-t border-gray-700 flex-shrink-0 text-[10px]"
        style={{ background: "#161b22", color: COLOR.dim }}
      >
        <span>↑↓ history</span>
        <span>Ctrl+L clear</span>
        <span className="ml-auto" style={{ color: COLOR.gray }}>
          git help for all commands
        </span>
      </div>
    </div>
  );
}
