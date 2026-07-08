import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  sharedInstances,
  sharedInits,
  getOrCreateEngine,
} from "../../../scripts/git/GitSharedInstances.js";

/**
 * GitWorkspace — An interactive text editor + git simulation.
 * Looks and feels like VS Code with a Source Control panel.
 *
 * Props:
 *   initialFiles   { 'filename': 'content', ... }
 *   showStaging    false (auto-stage) | true (explicit stage step)
 *   label          repo label shown in file tree header
 */
export default function GitWorkspace({ params = {} }) {
  const {
    initialFiles = {
      "game-design.txt": "Dungeon Explorer\n\nA top-down adventure game.",
    },
    showStaging = false,
    label = "my-project",
    instanceId = null, // share state across lessons when set to the same string
    showBranching = false, // show branch create/switch/merge controls
  } = params;
  const gitRef = useRef(null);
  if (!gitRef.current) {
    gitRef.current = getOrCreateEngine(instanceId);
  }
  const git = gitRef.current;

  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Init files once (shared instances only seed on first mount)
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (instanceId && sharedInits.has(instanceId)) {
      // Already seeded by a previous lesson — just open first existing file
      const first = git.workingDir.keys().next().value;
      if (first) setActiveFile(first);
      return;
    }
    if (instanceId) sharedInits.add(instanceId);
    Object.entries(initialFiles).forEach(([name, content]) => {
      git.writeFile(name, content);
    });
    setActiveFile(Object.keys(initialFiles)[0]);
    refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [activeFile, setActiveFile] = useState(null);
  const [commitMsg, setCommitMsg] = useState("");
  const [flashHash, setFlashHash] = useState(null);
  const [commitError, setCommitError] = useState(null);
  const [unsaved, setUnsaved] = useState(() => new Map()); // buffer: typed but not yet saved to disk
  const [contextMenu, setContextMenu] = useState(null); // { x, y, file }
  const [renaming, setRenaming] = useState(null); // filename being renamed inline
  const [renameValue, setRenameValue] = useState("");
  const [deletedCache, setDeletedCache] = useState(() => new Map()); // content of deleted files for pre-commit restore
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [mergeError, setMergeError] = useState(null);
  const textareaRef = useRef(null);
  const saveRef = useRef(null);

  // Derived from git state
  const files = Array.from(git.workingDir.entries());
  const status = git.status();
  // Collect ALL commits reachable from any branch tip, sorted newest first
  const fullHistory = (() => {
    const allCommits = new Map();
    const visited = new Set();
    const queue = Object.values(git.branches).filter(Boolean);
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
    return Array.from(allCommits.values()).sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  })();
  const isDetached = !git.branches[git.head];
  const staged = status.staged ?? [];
  const modified = status.modified ?? [];
  const untracked = status.untracked ?? [];
  const deleted = status.deleted ?? [];

  // All files visible in the tree: working dir + deleted ones
  const allFileNames = Array.from(
    new Set([...Array.from(git.workingDir.keys()), ...deleted]),
  );

  const activeContent = activeFile
    ? unsaved.has(activeFile)
      ? unsaved.get(activeFile)
      : (git.workingDir.get(activeFile) ?? "")
    : "";
  const isModified = (f) => modified.includes(f);
  const isUntracked = (f) => untracked.includes(f);
  const isStaged = (f) => staged.includes(f);
  const isDeleted = (f) => deleted.includes(f);
  // Files deleted from deletedCache that were never committed (not recoverable via git restore)
  const recentlyDeletedUntracked = Array.from(deletedCache.keys()).filter(
    (f) => !git.workingDir.has(f) && !deleted.includes(f),
  );

  // After checkout, active file may no longer exist
  useEffect(() => {
    if (activeFile && !git.workingDir.has(activeFile)) {
      const first = git.workingDir.keys().next().value;
      setActiveFile(first ?? null);
    }
  }, [tick, activeFile]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEdit = (value) => {
    if (!activeFile) return;
    setUnsaved((prev) => new Map(prev).set(activeFile, value));
  };

  const handleStage = (path) => {
    git.add(path);
    refresh();
  };

  const handleCommit = () => {
    const msg = commitMsg.trim();
    if (!msg) {
      setCommitError("Enter a commit message first.");
      setTimeout(() => setCommitError(null), 2000);
      return;
    }
    // Flush unsaved buffer to disk before committing (like an editor auto-save on commit)
    unsaved.forEach((content, filename) => git.writeFile(filename, content));
    setUnsaved(new Map());
    if (!showStaging) {
      const freshStatus = git.status();
      [...freshStatus.modified, ...freshStatus.untracked].forEach((f) =>
        git.add(f),
      );
    }
    const result = git.commit(msg);
    if (!result) {
      setCommitError("Nothing to commit.");
      setTimeout(() => setCommitError(null), 2000);
      return;
    }
    setCommitMsg("");
    setCommitError(null);
    refresh();
  };

  const handleCheckout = (hash) => {
    git.checkout(hash);
    setUnsaved(new Map());
    setFlashHash(hash);
    setTimeout(() => setFlashHash(null), 1000);
    refresh();
  };

  const handleReturnToLatest = () => {
    git.checkout("main");
    setUnsaved(new Map());
    refresh();
  };

  const handleDiscard = (path) => {
    git.discardChanges(path);
    setUnsaved((prev) => {
      const m = new Map(prev);
      m.delete(path);
      return m;
    });
    if (activeFile === path && isDeleted(path)) {
      const remaining = Array.from(git.workingDir.keys());
      setActiveFile(remaining[0] ?? null);
    }
    refresh();
  };

  const handleDeleteFile = (path) => {
    // Cache content before deleting so restore works even without commits
    const snapshot = unsaved.has(path)
      ? unsaved.get(path)
      : (git.workingDir.get(path) ?? "");
    setDeletedCache((prev) => new Map(prev).set(path, snapshot));
    git.deleteFile(path);
    setUnsaved((prev) => {
      const m = new Map(prev);
      m.delete(path);
      return m;
    });
    if (activeFile === path) {
      const remaining = Array.from(git.workingDir.keys()).filter(
        (f) => f !== path,
      );
      setActiveFile(remaining[0] ?? null);
    }
    refresh();
  };

  const handleSave = () => {
    if (!activeFile || !unsaved.has(activeFile)) return;
    git.writeFile(activeFile, unsaved.get(activeFile));
    setUnsaved((prev) => {
      const m = new Map(prev);
      m.delete(activeFile);
      return m;
    });
    refresh();
  };
  saveRef.current = handleSave;

  // Ctrl+S / Cmd+S — always calls latest handleSave via ref
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveRef.current?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [contextMenu]);

  const handleContextMenu = (e, name) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file: name });
  };

  const handleRename = (oldName, newName) => {
    const trimmed = (newName ?? "").trim();
    if (!trimmed || trimmed === oldName) {
      setRenaming(null);
      return;
    }
    git.renameFile(oldName, trimmed);
    if (activeFile === oldName) setActiveFile(trimmed);
    if (unsaved.has(oldName)) {
      setUnsaved((prev) => {
        const m = new Map(prev);
        m.set(trimmed, m.get(oldName));
        m.delete(oldName);
        return m;
      });
    }
    setRenaming(null);
    refresh();
  };

  const handleCreateBranch = (name) => {
    if (!name || git.branches[name] !== undefined) return;
    git.branch(name);
    setShowNewBranch(false);
    setNewBranchName("");
    refresh();
  };

  const handleSwitchBranch = (name) => {
    git.checkout(name);
    setUnsaved(new Map());
    refresh();
  };

  const handleMerge = (sourceBranch) => {
    const result = git.merge(sourceBranch);
    if (result.status === "conflict") {
      setMergeError(
        `Conflict in: ${result.conflicts.join(", ")} — resolve and commit.`,
      );
      setTimeout(() => setMergeError(null), 6000);
    } else if (result.error) {
      setMergeError(result.error);
      setTimeout(() => setMergeError(null), 3000);
    } else {
      setMergeError(null);
    }
    setUnsaved(new Map());
    refresh();
  };

  const canCommit = showStaging
    ? staged.length > 0
    : modified.length > 0 ||
      deleted.length > 0 ||
      unsaved.size > 0 ||
      untracked.length > 0;
  const currentCommitHash =
    typeof git.head === "string" && !git.branches?.[git.head]
      ? git.head
      : (git.branches?.[git.head] ?? null);

  return (
    <div
      className="flex h-full min-h-[520px] max-h-[680px] rounded-lg overflow-hidden border border-slate- text-sm"
      style={{
        background: "#1e1e1e",
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
      }}
    >
      {/* ── LEFT: File Tree ── */}
      <div
        className="w-44 flex-shrink-0 flex flex-col border-r border-slate-"
        style={{ background: "#252526" }}
      >
        {/* Repo header */}
        <div className="px-3 py-2 border-b border-slate-">
          <div className="text-[9px] font-bold text-slate- dark:text-slate- uppercase tracking-widest truncate">
            {label}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: isDetached ? "#f0a040" : "#34d399" }}
            />
            {showBranching &&
            Object.keys(git.branches).length > 1 &&
            !isDetached ? (
              <select
                value={git.head}
                onChange={(e) => handleSwitchBranch(e.target.value)}
                className="text-[10px] bg-transparent outline-none cursor-pointer flex-1 min-w-0"
                style={{ color: "#34d399" }}
              >
                {Object.keys(git.branches).map((name) => (
                  <option
                    key={name}
                    value={name}
                    style={{ background: "#2d2d2d" }}
                  >
                    {name}
                  </option>
                ))}
              </select>
            ) : (
              <span
                className="text-[10px] flex-1 truncate"
                style={{ color: isDetached ? "#f0a040" : "#34d399" }}
              >
                {isDetached ? git.head.slice(0, 7) + " (detached)" : git.head}
              </span>
            )}
            {showBranching && !showNewBranch && !isDetached && (
              <button
                onClick={() => setShowNewBranch(true)}
                className="text-[11px] text-slate- dark:text-slate- hover:text-slate- px-0.5 flex-shrink-0 leading-none"
                title="New branch"
              >
                +
              </button>
            )}
          </div>
          {showBranching && showNewBranch && (
            <div className="flex gap-1 mt-1">
              <input
                autoFocus
                placeholder="branch-name"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newBranchName.trim())
                    handleCreateBranch(newBranchName.trim());
                  if (e.key === "Escape") {
                    setShowNewBranch(false);
                    setNewBranchName("");
                  }
                }}
                className="flex-1 text-[10px] bg-transparent border border-slate- rounded px-1 py-0.5 outline-none focus:border-blue-500 text-slate- min-w-0"
              />
              <button
                onClick={() => {
                  if (newBranchName.trim())
                    handleCreateBranch(newBranchName.trim());
                }}
                className="text-[10px] px-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 flex-shrink-0"
              >
                ✓
              </button>
            </div>
          )}
        </div>

        {/* Explorer label */}
        <div className="px-3 pt-2 pb-0.5 text-[9px] font-bold text-slate- dark:text-slate- uppercase tracking-widest">
          Explorer
        </div>

        {/* File list */}
        <div className="flex-1 overflow-auto">
          {allFileNames.map((name) => {
            const del = isDeleted(name);
            const unt = !del && isUntracked(name);
            const mod = !del && !unt && isModified(name);
            const stg = isStaged(name);
            const unsv = unsaved.has(name);
            const active = name === activeFile;
            const statusLetter = del
              ? "D"
              : stg
                ? "A"
                : unt
                  ? "U"
                  : mod
                    ? "M"
                    : null;
            const statusColor = del
              ? "#f47067"
              : stg || unt
                ? "#73c991"
                : "#e2c08d";
            const isRenaming = renaming === name;
            return (
              <div
                key={name}
                className="flex items-center transition-colors"
                style={{ background: active ? "#37373d" : "transparent" }}
                onContextMenu={(e) => handleContextMenu(e, name)}
              >
                {isRenaming ? (
                  <input
                    autoFocus
                    className="flex-1 mx-2 my-0.5 px-1 text-xs rounded outline-none"
                    style={{
                      background: "#3c3c3c",
                      border: "1px solid #0078d4",
                      color: "#cccccc",
                    }}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(name, renameValue);
                      if (e.key === "Escape") setRenaming(null);
                    }}
                    onBlur={() => handleRename(name, renameValue)}
                  />
                ) : (
                  <button
                    onClick={() => !del && setActiveFile(name)}
                    className="flex-1 text-left px-3 py-1 flex items-center gap-2 min-w-0"
                    style={{
                      color: del
                        ? "#f47067"
                        : mod
                          ? "#e2c08d"
                          : stg || unt
                            ? "#73c991"
                            : "#cccccc",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      opacity={del ? 0.4 : 0.6}
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M13.71 4.29l-3-3A1 1 0 0 0 10 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-.29-.71zM13 14H4V2h6v3h3v9z" />
                    </svg>
                    <span
                      className="text-xs truncate"
                      style={{ textDecoration: del ? "line-through" : "none" }}
                    >
                      {name}
                    </span>
                    <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                      {unsv && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "#aaaaaa" }}
                          title="Unsaved"
                        />
                      )}
                      {statusLetter && (
                        <span
                          className="text-[9px] font-bold"
                          style={{ color: statusColor }}
                        >
                          {statusLetter}
                        </span>
                      )}
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CENTER: Editor ── */}
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{ background: "#1e1e1e" }}
      >
        {activeFile ? (
          <>
            {/* Tab bar */}
            <div
              className="flex items-center border-b border-slate-"
              style={{ background: "#2d2d2d" }}
            >
              <div
                className="flex items-center gap-2 px-4 py-1.5 border-t-2 text-xs"
                style={{
                  borderTopColor: "#0078d4",
                  background: "#1e1e1e",
                  color: isModified(activeFile) ? "#e2c08d" : "#cccccc",
                }}
              >
                <span>{activeFile}</span>
                {unsaved.has(activeFile) && (
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: "#cccccc", opacity: 0.65 }}
                    title="Unsaved — Ctrl+S to save"
                  />
                )}
                {!unsaved.has(activeFile) && isModified(activeFile) && (
                  <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                )}
                {isDeleted(activeFile) && (
                  <span className="text-[9px] text-red-400 font-bold ml-1">
                    DELETED
                  </span>
                )}
              </div>
              {unsaved.has(activeFile) && (
                <button
                  onClick={handleSave}
                  className="ml-auto mr-3 px-2 py-0.5 rounded text-[10px] font-medium hover:bg-blue-600/20 transition-colors"
                  style={{ color: "#4fc3f7" }}
                  title="Save (Ctrl+S)"
                >
                  Save
                </button>
              )}
            </div>

            {/* Line numbers + textarea */}
            <div className="flex flex-1 min-h-0">
              <LineNumbers content={activeContent} />
              <textarea
                ref={textareaRef}
                className="flex-1 bg-transparent outline-none resize-none p-3 leading-6 text-sm"
                style={{
                  color: "#d4d4d4",
                  caretColor: "#aeafad",
                  fontFamily: "inherit",
                }}
                value={activeContent}
                onChange={(e) => handleEdit(e.target.value)}
                spellCheck={false}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate- dark:text-slate- text-sm">
            Select a file to edit
          </div>
        )}
      </div>

      {/* ── RIGHT: Git Panel ── */}
      <div
        className="w-60 flex-shrink-0 flex flex-col border-l border-slate-"
        style={{ background: "#252526" }}
      >
        {/* Panel title */}
        <div className="px-3 py-2 border-b border-slate- flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate- dark:text-slate- uppercase tracking-widest">
            Source Control
          </span>
          <span className="text-[9px] text-slate- dark:text-slate-">git</span>
        </div>

        {/* Commit area */}
        <div className="p-3 border-b border-slate-">
          <input
            type="text"
            placeholder="Message (Enter to commit)"
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCommit()}
            className="w-full bg-transparent border border-slate- rounded px-2 py-1 text-xs text-slate- outline-none focus:border-blue-500 placeholder-slate- mb-2"
          />
          <button
            onClick={handleCommit}
            disabled={!canCommit}
            className="w-full py-1.5 rounded text-xs font-bold transition-all"
            style={{
              background: canCommit ? "#0078d4" : "#3a3a3a",
              color: canCommit ? "#ffffff" : "#666666",
              cursor: canCommit ? "pointer" : "not-allowed",
            }}
          >
            ✓ Commit
          </button>
          {commitError && (
            <div className="mt-1 text-[10px] text-red-400">{commitError}</div>
          )}
        </div>

        {/* Merge panel — other branches you can merge into current */}
        {showBranching &&
          Object.keys(git.branches).filter((n) => n !== git.head && !isDetached)
            .length > 0 && (
            <div className="px-3 py-1.5 border-b border-slate- flex-shrink-0">
              {mergeError && (
                <div className="text-[10px] text-red-400 mb-1">
                  {mergeError}
                </div>
              )}
              {Object.keys(git.branches)
                .filter((n) => n !== git.head && !isDetached)
                .map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between py-0.5"
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "#d4a057" }}
                      />
                      <span className="text-[10px] text-slate- truncate">
                        {name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleMerge(name)}
                      className="text-[9px] px-1.5 py-0.5 rounded hover:bg-green-600/20 text-green-400 flex-shrink-0 ml-1"
                      title={`Merge ${name} into ${git.head}`}
                    >
                      ↓ merge
                    </button>
                  </div>
                ))}
            </div>
          )}

        {/* Changed files panel — always visible when there are changes */}
        {(modified.length > 0 ||
          untracked.length > 0 ||
          deleted.length > 0 ||
          recentlyDeletedUntracked.length > 0 ||
          staged.length > 0 ||
          unsaved.size > 0) && (
          <div
            className="px-3 py-2 border-b border-slate- flex-shrink-0 overflow-auto"
            style={{ maxHeight: "9rem" }}
          >
            {/* Unsaved buffers */}
            {unsaved.size > 0 && (
              <>
                <div className="text-[9px] text-slate- dark:text-slate- uppercase tracking-widest mb-1">
                  Unsaved
                </div>
                {Array.from(unsaved.keys()).map((f) => (
                  <div
                    key={f}
                    className="flex items-center justify-between py-0.5"
                  >
                    <span className="text-[11px] truncate text-slate-">
                      {f}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "#aaaaaa" }}
                      />
                      <button
                        onClick={handleSave}
                        className="text-[10px] px-1 py-0.5 rounded hover:bg-blue-600/30 text-blue-400"
                        title="Save (Ctrl+S)"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
            {/* Git-tracked changes */}
            {(modified.length > 0 ||
              deleted.length > 0 ||
              untracked.length > 0 ||
              recentlyDeletedUntracked.length > 0) && (
              <>
                <div className="text-[9px] text-slate- dark:text-slate- uppercase tracking-widest mb-1 mt-1">
                  Changes
                </div>
                {[
                  ...modified.map((f) => ({ f, type: "M" })),
                  ...deleted.map((f) => ({ f, type: "D" })),
                  ...untracked.map((f) => ({ f, type: "U" })),
                  ...recentlyDeletedUntracked.map((f) => ({
                    f,
                    type: "D",
                    fromCache: true,
                  })),
                ].map(({ f, type, fromCache }) => (
                  <div
                    key={f + (fromCache ? "-cache" : "")}
                    className="flex items-center justify-between py-0.5"
                  >
                    <span
                      className="text-[11px] truncate"
                      style={{
                        color:
                          type === "D"
                            ? "#f47067"
                            : type === "U"
                              ? "#73c991"
                              : "#e2c08d",
                        textDecoration: type === "D" ? "line-through" : "none",
                      }}
                    >
                      {f}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                      <span
                        className="text-[9px] font-bold"
                        style={{
                          color:
                            type === "D"
                              ? "#f47067"
                              : type === "U"
                                ? "#73c991"
                                : "#e2c08d",
                        }}
                      >
                        {type}
                      </span>
                      {/* Discard (git restore) — only for tracked M/D files */}
                      {(type === "M" || type === "D") &&
                        !fromCache &&
                        fullHistory.length > 0 && (
                          <button
                            onClick={() => handleDiscard(f)}
                            className="text-[10px] px-1 py-0.5 rounded hover:bg-blue-600/30 text-blue-400"
                            title="Discard changes (git restore)"
                          >
                            ↩
                          </button>
                        )}
                      {/* Restore from local cache — for untracked files deleted before any commit */}
                      {fromCache && (
                        <button
                          onClick={() => {
                            git.writeFile(f, deletedCache.get(f));
                            setDeletedCache((prev) => {
                              const m = new Map(prev);
                              m.delete(f);
                              return m;
                            });
                            refresh();
                          }}
                          className="text-[10px] px-1 py-0.5 rounded hover:bg-blue-600/30 text-blue-400"
                          title="Restore file"
                        >
                          ↩
                        </button>
                      )}
                      {showStaging && type !== "D" && !fromCache && (
                        <button
                          onClick={() => handleStage(f)}
                          className="text-[10px] px-1 py-0.5 rounded hover:bg-green-600/30 text-green-400"
                          title="Stage this file"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            {staged.length > 0 && (
              <div className="mt-1">
                <div className="text-[9px] text-slate- dark:text-slate- uppercase tracking-widest mb-1">
                  Staged
                </div>
                {staged.map((f) => (
                  <div key={f} className="flex items-center py-0.5">
                    <span
                      className="text-[11px] truncate flex-1"
                      style={{ color: "#73c991" }}
                    >
                      {f}
                    </span>
                    <span
                      className="text-[9px] font-bold ml-1"
                      style={{ color: "#73c991" }}
                    >
                      A
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Git Graph */}
        <div className="flex-1 overflow-auto">
          <div className="px-3 pt-2 pb-1 text-[9px] font-bold text-slate- dark:text-slate- uppercase tracking-widest">
            Git Graph
          </div>
          {isDetached && (
            <div className="mx-3 mb-1 flex flex-col gap-1">
              {Object.entries(git.branches)
                .filter(([, tip]) => tip)
                .map(([name]) => (
                  <button
                    key={name}
                    onClick={() => {
                      git.checkout(name);
                      setUnsaved(new Map());
                      refresh();
                    }}
                    className="py-1 rounded text-[10px] font-bold transition-all"
                    style={{
                      background: "#1a2a1a",
                      border: "1px solid #4a7a4a",
                      color: "#73c991",
                    }}
                  >
                    ↩ Return to {name}
                  </button>
                ))}
            </div>
          )}
          {fullHistory.length === 0 ? (
            <div className="px-3 pb-2 text-[10px] text-slate- dark:text-slate-">
              No commits yet.
            </div>
          ) : (
            <GitGraphPane
              git={git}
              fullHistory={fullHistory}
              currentCommitHash={currentCommitHash}
              isDetached={isDetached}
              flashHash={flashHash}
              onCheckout={handleCheckout}
            />
          )}
        </div>
      </div>

      {contextMenu &&
        createPortal(
          <div
            className="fixed z-[9999] rounded shadow-xl overflow-hidden py-1"
            style={{
              top: contextMenu.y,
              left: contextMenu.x,
              background: "#252526",
              border: "1px solid #454545",
              minWidth: 150,
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {!isDeleted(contextMenu.file) && (
              <button
                className="w-full text-left px-3 py-1.5 text-xs text-slate- hover:bg-slate- flex items-center gap-2"
                onClick={() => {
                  setRenaming(contextMenu.file);
                  setRenameValue(contextMenu.file);
                  setContextMenu(null);
                }}
              >
                <span style={{ opacity: 0.7 }}>&#9999;</span> Rename
              </button>
            )}
            {!isDeleted(contextMenu.file) && (
              <button
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-900/30 flex items-center gap-2"
                style={{ color: "#f47067" }}
                onClick={() => {
                  handleDeleteFile(contextMenu.file);
                  setContextMenu(null);
                }}
              >
                <span style={{ opacity: 0.7 }}>&#128465;</span> Delete
              </button>
            )}
            {isDeleted(contextMenu.file) && (
              <button
                className="w-full text-left px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-900/30 flex items-center gap-2"
                onClick={() => {
                  if (fullHistory.length > 0) {
                    handleDiscard(contextMenu.file);
                  } else if (deletedCache.has(contextMenu.file)) {
                    git.writeFile(
                      contextMenu.file,
                      deletedCache.get(contextMenu.file),
                    );
                    setDeletedCache((prev) => {
                      const m = new Map(prev);
                      m.delete(contextMenu.file);
                      return m;
                    });
                    refresh();
                  }
                  setContextMenu(null);
                }}
              >
                <span>&#8629;</span> Restore file
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

// ─── Multi-lane git graph ────────────────────────────────────────────────────

const LANE_COLORS = ["#1e6bbf", "#d4a057", "#c75c80", "#5cba8a", "#8b6cc8"];

function buildGraphLayout(git, fullHistory) {
  if (!fullHistory || fullHistory.length === 0)
    return {
      sorted: [],
      commitLane: new Map(),
      commitBranches: new Map(),
      maxLane: 0,
    };

  const commitLane = new Map();
  let nextLane = 1;

  // main branch = lane 0
  let cur = git.branches["main"];
  while (cur && !commitLane.has(cur)) {
    commitLane.set(cur, 0);
    const obj = git.objects.get(cur);
    if (!obj) break;
    cur = obj.data.parent;
  }

  // each other branch gets the next lane
  Object.entries(git.branches).forEach(([name, tip]) => {
    if (name === "main" || !tip) return;
    let c = tip;
    while (c && !commitLane.has(c)) {
      commitLane.set(c, nextLane);
      const obj = git.objects.get(c);
      if (!obj) break;
      c = obj.data.parent;
    }
    nextLane++;
  });

  // anything unassigned (detached commits, etc.) → lane 0
  fullHistory.forEach((c) => {
    if (!commitLane.has(c.hash)) commitLane.set(c.hash, 0);
  });

  // which branch labels point to each commit
  const commitBranches = new Map();
  Object.entries(git.branches).forEach(([name, tip]) => {
    if (!tip) return;
    if (!commitBranches.has(tip)) commitBranches.set(tip, []);
    commitBranches.get(tip).push(name);
  });

  const maxLane = Math.max(0, ...Array.from(commitLane.values()));
  return { sorted: fullHistory, commitLane, commitBranches, maxLane };
}

function GitGraphPane({
  git,
  fullHistory,
  currentCommitHash,
  isDetached,
  flashHash,
  onCheckout,
}) {
  const { sorted, commitLane, commitBranches, maxLane } = buildGraphLayout(
    git,
    fullHistory,
  );

  const ROW_H = 44;
  const LW = 14; // lane width
  const SVG_W = (maxLane + 1) * LW + 4;
  const SVG_H = sorted.length * ROW_H;

  const cx = (hash) => (commitLane.get(hash) ?? 0) * LW + LW / 2;
  const cy = (i) => i * ROW_H + ROW_H / 2;
  const idxOf = (hash) => sorted.findIndex((c) => c.hash === hash);
  const color = (hash) =>
    LANE_COLORS[commitLane.get(hash) ?? 0] ?? LANE_COLORS[0];

  const edges = sorted.flatMap((commit, i) => {
    const result = [];
    const x1 = cx(commit.hash);
    const y1 = cy(i);
    const c = color(commit.hash);

    if (commit.parent) {
      const pi = idxOf(commit.parent);
      if (pi >= 0) {
        const x2 = cx(commit.parent);
        const y2 = cy(pi);
        result.push(
          <line
            key={`e-${commit.hash}`}
            x1={x1}
            y1={y1 + 5}
            x2={x2}
            y2={y2 - 5}
            stroke={c}
            strokeWidth={1.5}
          />,
        );
      }
    }

    if (commit.mergeParent) {
      const mi = idxOf(commit.mergeParent);
      if (mi >= 0) {
        const x2 = cx(commit.mergeParent);
        const y2 = cy(mi);
        const mc = color(commit.mergeParent);
        result.push(
          <line
            key={`me-${commit.hash}`}
            x1={x1}
            y1={y1 + 5}
            x2={x2}
            y2={y2 - 5}
            stroke={mc}
            strokeWidth={1.5}
            strokeDasharray="3,2"
          />,
        );
      }
    }

    return result;
  });

  return (
    <div className="pb-2" style={{ display: "flex" }}>
      {/* SVG lane area */}
      <svg
        width={SVG_W}
        height={SVG_H}
        style={{ flexShrink: 0, marginLeft: 8 }}
      >
        {edges}
        {sorted.map((commit, i) => {
          const isCurrent = currentCommitHash === commit.hash;
          const isFlashing = flashHash === commit.hash;
          const laneColor = color(commit.hash);
          return (
            <circle
              key={commit.hash}
              cx={cx(commit.hash)}
              cy={cy(i)}
              r={5}
              fill={isCurrent ? "#0078d4" : isFlashing ? "#34d399" : laneColor}
              stroke={isCurrent ? "#4fc3f7" : "#1a1a1a"}
              strokeWidth={isCurrent ? 2 : 1}
              style={{
                filter: isCurrent
                  ? "drop-shadow(0 0 3px rgba(0,120,212,0.7))"
                  : "none",
              }}
            />
          );
        })}
      </svg>

      {/* Commit info rows */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {sorted.map((commit, i) => {
          const isCurrent = currentCommitHash === commit.hash;
          const branches = commitBranches.get(commit.hash) ?? [];
          return (
            <button
              key={commit.hash}
              onClick={() => onCheckout(commit.hash)}
              style={{
                height: ROW_H,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              className="w-full text-left pr-3 rounded hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-1 flex-wrap">
                {branches.map((name) => (
                  <span
                    key={name}
                    className="text-[8px] px-1 rounded font-bold"
                    style={{
                      background:
                        name === git.head && !isDetached
                          ? "#0d2a44"
                          : "#1d1d2e",
                      color:
                        name === git.head && !isDetached
                          ? "#4fc3f7"
                          : "#8888aa",
                      border: `1px solid ${name === git.head && !isDetached ? "#1e5a8a" : "#333355"}`,
                    }}
                  >
                    {name === git.head && !isDetached ? `● ${name}` : name}
                  </span>
                ))}
                {isCurrent && isDetached && (
                  <span
                    className="text-[8px] px-1 rounded font-bold"
                    style={{
                      background: "#3a2a00",
                      color: "#f0a040",
                      border: "1px solid #8a6000",
                    }}
                  >
                    HEAD
                  </span>
                )}
                <span
                  className="text-[9px] font-mono"
                  style={{ color: "#6a9955" }}
                >
                  {commit.hash.slice(0, 7)}
                </span>
              </div>
              <div
                className="text-[11px] leading-tight"
                style={{ color: isCurrent ? "#e0e0e0" : "#888" }}
              >
                {commit.message}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Renders simple line numbers that track textarea content */
function LineNumbers({ content }) {
  const lines = (content || "").split("\n").length;
  return (
    <div
      className="py-3 pr-3 pl-2 text-right select-none leading-6 text-xs border-r border-slate- min-w-[2.5rem]"
      style={{ color: "#5a5a5a", background: "#1e1e1e" }}
    >
      {Array.from({ length: lines }, (_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  );
}
