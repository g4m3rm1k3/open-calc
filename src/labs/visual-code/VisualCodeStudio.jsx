import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Copy, Download, FolderOpen, Play, RotateCcw, Save } from "lucide-react";
import { createBlock } from "./blocks";
import {
  DEFAULT_PROJECT,
  TARGETS,
  cloneProject,
  findBlock,
  insertBlock,
  moveBlock,
  normalizeProject,
  parseProject,
  removeBlock,
  serializeProject,
  transpileProject,
  updateBlock,
} from "./transpiler";
import { buildRunnableHtml } from "./runJavaScript";
import { BlockPalette, OutputPanel, ProgramPanel } from "./VisualCodePanels";
import styles from "./VisualCodeStudio.module.css";

export default function VisualCodeStudio({
  initialProject = DEFAULT_PROJECT,
  targets = TARGETS,
  onProjectChange,
  onCodeChange,
  onBack,
}) {
  const [project, setProject] = useState(() => normalizeProject(cloneProject(initialProject)));
  const [query, setQuery] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState(project.blocks[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState("code");
  const [messages, setMessages] = useState([]);
  const [saveState, setSaveState] = useState("idle");
  const importRef = useRef(null);
  const previewRef = useRef(null);

  const generated = useMemo(() => transpileProject(project, project.target), [project]);
  const previewHtml = useMemo(() => buildRunnableHtml({ html: project.html, code: generated.code }), [project.html, generated.code]);
  const selectedBlock = useMemo(() => findBlock(project.blocks, selectedBlockId), [project.blocks, selectedBlockId]);
  const targetList = Object.values(targets);

  useEffect(() => {
    onProjectChange?.(project);
  }, [project, onProjectChange]);

  useEffect(() => {
    onCodeChange?.(generated.code, generated);
  }, [generated, onCodeChange]);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.data?.source !== "visual-code-runner") return;
      setMessages((current) => [...current, { type: event.data.type, value: event.data.value }]);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function commit(updater) {
    setProject((current) => normalizeProject(typeof updater === "function" ? updater(current) : updater));
    setSaveState("dirty");
  }

  function addBlock(type, parentId = null) {
    const block = createBlock(type);
    commit((current) => ({ ...current, blocks: insertBlock(current.blocks, parentId, block) }));
    setSelectedBlockId(block.id);
    setActiveTab("edit");
  }

  function deleteBlock(id) {
    commit((current) => ({ ...current, blocks: removeBlock(current.blocks, id) }));
    if (selectedBlockId === id) setSelectedBlockId(null);
  }

  function updateField(name, value) {
    if (!selectedBlock) return;
    commit((current) => ({
      ...current,
      blocks: updateBlock(current.blocks, selectedBlock.id, (block) => ({
        ...block,
        fields: { ...block.fields, [name]: value },
      })),
    }));
  }

  function runProject() {
    setMessages([]);
    setActiveTab("run");
    if (previewRef.current) previewRef.current.srcdoc = previewHtml;
  }

  function importProject(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const next = parseProject(String(reader.result ?? ""));
        setProject(next);
        setSelectedBlockId(next.blocks[0]?.id ?? null);
        setSaveState("idle");
      } catch (error) {
        window.alert(`Could not import project: ${error.message}`);
      }
    };
    reader.readAsText(file);
  }

  function exportProject() {
    downloadText(serializeProject(project), `${slug(project.name)}.visual-code.json`, "application/json");
    setSaveState("saved");
  }

  return (
    <section className={styles.studio}>
      <input ref={importRef} type="file" accept=".json,.visual-code.json" className={styles.hiddenInput} onChange={importProject} />
      <header className={styles.topbar}>
        <div className={styles.titleGroup}>
          {onBack && (
            <button className={styles.button} onClick={onBack} aria-label="Back">
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className={styles.title}>Visual Code Lab</h1>
          <p className={styles.subtitle}>Object-oriented blocks, generated code, live output, and a portable project tree.</p>
        </div>
        <div className={styles.topActions}>
          <input
            className={styles.projectName}
            value={project.name}
            aria-label="Project name"
            onChange={(event) => commit((current) => ({ ...current, name: event.target.value }))}
          />
          <select
            className={styles.select}
            value={project.target}
            onChange={(event) => commit((current) => ({ ...current, target: event.target.value }))}
            aria-label="Target language"
          >
            {targetList.map((target) => (
              <option key={target.id} value={target.id}>{target.label}</option>
            ))}
          </select>
          <button className={`${styles.button} ${styles.primaryButton}`} onClick={runProject}>
            <Play size={16} /> Run
          </button>
          <button className={styles.button} onClick={() => navigator.clipboard?.writeText(generated.code)}>
            <Copy size={16} /> Copy
          </button>
          <button className={styles.button} onClick={() => downloadText(generated.code, `${slug(project.name)}.${targets[project.target]?.fileExtension ?? "txt"}`, "text/plain")}>
            <Download size={16} /> Code
          </button>
          <button className={styles.button} onClick={() => importRef.current?.click()}>
            <FolderOpen size={16} /> Import
          </button>
          <button className={styles.button} onClick={exportProject}>
            <Save size={16} /> Project
          </button>
          <button className={styles.button} onClick={() => { setProject(normalizeProject(cloneProject(DEFAULT_PROJECT))); setSelectedBlockId(DEFAULT_PROJECT.blocks[0]?.id ?? null); }}>
            <RotateCcw size={16} /> Reset
          </button>
          <span className={styles.saveState}>{saveState === "dirty" ? "Unsaved" : saveState === "saved" ? "Exported" : "Ready"}</span>
        </div>
      </header>

      <div className={styles.main}>
        <aside className={styles.panel}>
          <BlockPalette query={query} onQueryChange={setQuery} onAddBlock={addBlock} />
        </aside>

        <main className={`${styles.panel} ${styles.workspace}`}>
          <ProgramPanel
            blocks={project.blocks}
            selectedBlockId={selectedBlockId}
            onSelect={setSelectedBlockId}
            onAddBlock={addBlock}
            onDeleteBlock={deleteBlock}
            onMoveBlock={(id, direction) => commit((current) => ({ ...current, blocks: moveBlock(current.blocks, id, direction) }))}
          />
        </main>

        <aside className={styles.panel}>
          <OutputPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            generated={generated}
            selectedBlock={selectedBlock}
            project={project}
            messages={messages}
            previewRef={previewRef}
            previewHtml={previewHtml}
            onRun={runProject}
            onFieldChange={updateField}
            onHtmlChange={(html) => commit((current) => ({ ...current, html }))}
          />
        </aside>
      </div>
    </section>
  );
}

function downloadText(text, filename, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function slug(value) {
  return String(value || "visual-code").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "visual-code";
}
