import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { BLOCK_COLORS, BLOCK_GROUPS, BLOCK_LIBRARY, blockDefinition, canContainChildren, childOptionsFor } from "./blocks";
import { serializeProject } from "./transpiler";
import styles from "./VisualCodeStudio.module.css";

export function BlockPalette({ query, onQueryChange, onAddBlock }) {
  const filtered = BLOCK_LIBRARY.filter((item) => {
    const text = `${item.label} ${item.category} ${item.description}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <>
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderLine}>
          <h2 className={styles.panelTitle}>Blocks</h2>
        </div>
        <input
          className={styles.input}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search class, getter, event..."
        />
      </div>
      <div className={styles.scroll}>
        {BLOCK_GROUPS.map((group) => {
          const groupBlocks = filtered.filter((item) => item.category === group.id);
          if (!groupBlocks.length) return null;
          return (
            <section className={styles.paletteGroup} key={group.id}>
              <h3 className={styles.groupTitle}>{group.label}</h3>
              <div className={styles.blockList}>
                {groupBlocks.map((item) => (
                  <button
                    key={item.type}
                    className={styles.paletteBlock}
                    style={{ "--block-color": BLOCK_COLORS[item.category] }}
                    onClick={() => onAddBlock(item.type)}
                  >
                    <span className={styles.blockName}>{item.label}</span>
                    <span className={styles.blockDescription}>{item.description}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

export function ProgramPanel({ blocks, selectedBlockId, onSelect, onAddBlock, onDeleteBlock, onMoveBlock }) {
  return (
    <>
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderLine}>
          <h2 className={styles.panelTitle}>Program</h2>
          <button className={styles.button} onClick={() => onAddBlock("class")}>
            <Plus size={16} /> Class
          </button>
        </div>
      </div>
      <div className={styles.scroll}>
        {blocks.length ? (
          <div className={styles.stack}>
            {blocks.map((item) => (
              <BlockNode
                key={item.id}
                block={item}
                selectedBlockId={selectedBlockId}
                onSelect={onSelect}
                onAddBlock={onAddBlock}
                onDeleteBlock={onDeleteBlock}
                onMoveBlock={onMoveBlock}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>Add blocks from the palette to build a program.</div>
        )}
      </div>
    </>
  );
}

export function OutputPanel({
  activeTab,
  onTabChange,
  generated,
  selectedBlock,
  project,
  messages,
  previewRef,
  onRun,
  onFieldChange,
  onHtmlChange,
  previewHtml,
}) {
  return (
    <>
      <div className={styles.panelHeader}>
        <div className={styles.tabs}>
          {["code", "edit", "run", "preview", "data"].map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.scroll}>
        {activeTab === "code" && (
          <div className={styles.editor}>
            {generated.diagnostics.map((item, index) => (
              <div className={styles.diagnostic} key={`${item.message}-${index}`}>{item.message}</div>
            ))}
            <pre className={styles.code}>{generated.code}</pre>
          </div>
        )}

        {activeTab === "edit" && (
          <Inspector block={selectedBlock} html={project.html} onHtmlChange={onHtmlChange} onFieldChange={onFieldChange} />
        )}

        {activeTab === "run" && (
          <div className={styles.editor}>
            <button className={`${styles.button} ${styles.primaryButton}`} onClick={onRun}>
              Run code
            </button>
            <div className={styles.output}>
              {messages.length ? messages.map((message, index) => (
                <p
                  key={`${message.type}-${index}`}
                  className={`${styles.outputLine} ${message.type === "error" ? styles.error : ""}`}
                >
                  [{message.type}] {message.value}
                </p>
              )) : <p className={styles.outputLine}>Run the project to see console output.</p>}
            </div>
            <iframe ref={previewRef} className={styles.preview} title="JavaScript run output" sandbox="allow-scripts" />
          </div>
        )}

        {activeTab === "preview" && (
          <div className={styles.editor}>
            <label className={styles.field}>
              <span>Preview HTML</span>
              <textarea className={styles.textarea} value={project.html} onChange={(event) => onHtmlChange(event.target.value)} />
            </label>
            <iframe className={styles.preview} title="HTML preview" sandbox="allow-scripts" srcDoc={previewHtml} />
          </div>
        )}

        {activeTab === "data" && (
          <pre className={styles.code}>{serializeProject(project)}</pre>
        )}
      </div>
    </>
  );
}

function BlockNode({ block, selectedBlockId, onSelect, onDeleteBlock, onMoveBlock, onAddBlock }) {
  const definition = blockDefinition(block.type);
  const color = BLOCK_COLORS[block.category] ?? "#475569";
  const childOptions = childOptionsFor(block.type);

  return (
    <article
      className={`${styles.stackBlock} ${selectedBlockId === block.id ? styles.stackBlockActive : ""}`}
      style={{ "--block-color": color }}
      onClick={() => onSelect(block.id)}
    >
      <div className={styles.blockTopline}>
        <span className={styles.blockName}>{definition?.label ?? block.type}</span>
        <div className={styles.blockActions}>
          <button className={styles.iconButton} title="Move up" onClick={(event) => { event.stopPropagation(); onMoveBlock(block.id, "up"); }}>
            <ArrowUp size={14} />
          </button>
          <button className={styles.iconButton} title="Move down" onClick={(event) => { event.stopPropagation(); onMoveBlock(block.id, "down"); }}>
            <ArrowDown size={14} />
          </button>
          <button className={styles.iconButton} title="Delete" onClick={(event) => { event.stopPropagation(); onDeleteBlock(block.id); }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <span className={styles.blockDescription}>{summarizeBlock(block)}</span>
      {canContainChildren(block.type) && (
        <div className={styles.childSlot}>
          {(block.children ?? []).map((child) => (
            <BlockNode
              key={child.id}
              block={child}
              selectedBlockId={selectedBlockId}
              onSelect={onSelect}
              onDeleteBlock={onDeleteBlock}
              onMoveBlock={onMoveBlock}
              onAddBlock={onAddBlock}
            />
          ))}
          <div className={styles.childActions}>
            {childOptions.map((option) => (
              <button
                key={option.type}
                className={styles.button}
                onClick={(event) => {
                  event.stopPropagation();
                  onAddBlock(option.type, block.id);
                }}
              >
                <Plus size={16} /> {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function Inspector({ block, html, onHtmlChange, onFieldChange }) {
  if (!block) {
    return (
      <div className={styles.editor}>
        <div className={styles.empty}>Select a block to edit its settings.</div>
        <HtmlEditor html={html} onHtmlChange={onHtmlChange} />
      </div>
    );
  }

  const definition = blockDefinition(block.type);
  const fields = definition?.fields?.length
    ? definition.fields
    : Object.keys(block.fields ?? {}).map((name) => ({ name, label: labelize(name), kind: "text" }));

  return (
    <div className={styles.editor}>
      <div className={styles.inspectorHeading}>
        <strong>{definition?.label ?? block.type}</strong>
        <span>{definition?.description}</span>
      </div>
      {fields.map((field) => (
        <label className={styles.field} key={field.name}>
          <span>{field.label}</span>
          {field.kind === "select" ? (
            <select
              className={styles.select}
              value={block.fields?.[field.name] ?? ""}
              onChange={(event) => onFieldChange(field.name, event.target.value)}
            >
              {(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : field.kind === "code" ? (
            <textarea
              className={styles.textarea}
              value={block.fields?.[field.name] ?? ""}
              onChange={(event) => onFieldChange(field.name, event.target.value)}
            />
          ) : (
            <input
              className={styles.input}
              value={block.fields?.[field.name] ?? ""}
              onChange={(event) => onFieldChange(field.name, event.target.value)}
            />
          )}
        </label>
      ))}
      <HtmlEditor html={html} onHtmlChange={onHtmlChange} />
    </div>
  );
}

function HtmlEditor({ html, onHtmlChange }) {
  return (
    <label className={styles.field}>
      <span>Preview HTML</span>
      <textarea className={styles.textarea} value={html} onChange={(event) => onHtmlChange(event.target.value)} />
    </label>
  );
}

function summarizeBlock(block) {
  const f = block.fields ?? {};
  switch (block.type) {
    case "class":
      return `class ${f.name || "Unnamed"}${f.extendsName ? ` extends ${f.extendsName}` : ""}`;
    case "constructor":
      return `constructor(${f.params || ""})`;
    case "method":
    case "staticMethod":
      return `${block.type === "staticMethod" ? "static " : ""}${f.name || "method"}(${f.params || ""})`;
    case "getter":
      return `get ${f.name || "property"}`;
    case "setter":
      return `set ${f.name || "property"}(${f.param || "value"})`;
    case "field":
      return `${f.static === "true" ? "static " : ""}${f.name || "field"} = ${f.value || "undefined"}`;
    case "function":
      return `${f.async === "true" ? "async " : ""}function ${f.name || "fn"}(${f.params || ""})`;
    case "variable":
      return `${f.kind || "const"} ${f.name || "value"} = ${f.value || "undefined"}`;
    case "if":
      return `if (${f.condition || "true"})`;
    case "loop":
      return `repeat ${f.count || "0"} as ${f.iterator || "i"}`;
    case "event":
      return `${f.selector || "#app"} on ${f.event || "click"}`;
    case "log":
      return `console.log(${f.expression || ""})`;
    case "htmlText":
      return `${f.selector || "#app"} <- ${f.text || ""}`;
    default:
      return Object.values(f).filter(Boolean).join(" ");
  }
}

function labelize(name) {
  return name.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
