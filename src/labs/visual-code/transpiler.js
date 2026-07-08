import { blockDefinition } from "./blocks";

export const DEFAULT_PROJECT = {
  schemaVersion: 1,
  id: "visual-code-starter",
  name: "Visual Code Project",
  target: "javascript",
  html: '<main id="app"><button id="scoreButton">Add score</button><p id="message"></p></main>',
  blocks: [
    {
      id: "starter_class",
      type: "class",
      category: "oop",
      fields: { name: "Player", extendsName: "" },
      children: [
        member("starter_constructor", "constructor", { params: "name", body: "this.name = name;\nthis.score = 0;" }),
        member("starter_field", "field", { name: "level", value: "1", static: "false" }),
        member("starter_method", "method", {
          name: "addScore",
          params: "points",
          async: "false",
          body: "this.score += points;\nreturn `${this.name}: ${this.score}`;",
        }),
        member("starter_getter", "getter", { name: "label", body: "return `${this.name} (level ${this.level})`;" }),
      ],
    },
    block("starter_var", "variable", "state", { kind: "const", name: "player", value: 'new Player("Ada")' }),
    block("starter_log", "log", "output", { expression: "player.label" }),
    {
      id: "starter_event",
      type: "event",
      category: "html",
      fields: { selector: "#scoreButton", event: "click" },
      children: [
        block("starter_assign", "assign", "state", { target: "document.querySelector(\"#message\").textContent", value: "player.addScore(1)" }),
        block("starter_inner_log", "log", "output", { expression: "player.score" }),
      ],
    },
  ],
};

const INDENT = "  ";

export const TARGETS = {
  javascript: {
    id: "javascript",
    label: "JavaScript",
    fileExtension: "js",
    transpile: transpileJavaScript,
  },
};

export function transpileProject(project, targetId = project.target ?? "javascript") {
  const target = TARGETS[targetId];
  if (!target) {
    return { targetId, code: "", diagnostics: [diagnostic("error", `No transpiler registered for ${targetId}.`)] };
  }
  return target.transpile(normalizeProject(project));
}

export function registerTarget(target) {
  TARGETS[target.id] = target;
}

export function cloneProject(project = DEFAULT_PROJECT) {
  return JSON.parse(JSON.stringify(project));
}

export function normalizeProject(project) {
  return {
    schemaVersion: 1,
    id: project?.id || `project_${Date.now().toString(36)}`,
    name: project?.name || "Visual Code Project",
    target: project?.target || "javascript",
    html: project?.html || '<main id="app"></main>',
    blocks: normalizeBlocks(project?.blocks ?? []),
  };
}

export function updateBlock(blocks, blockId, updater) {
  return blocks.map((item) => {
    if (item.id === blockId) return updater(item);
    return { ...item, children: updateBlock(item.children ?? [], blockId, updater) };
  });
}

export function removeBlock(blocks, blockId) {
  return blocks
    .filter((item) => item.id !== blockId)
    .map((item) => ({ ...item, children: removeBlock(item.children ?? [], blockId) }));
}

export function findBlock(blocks, blockId) {
  if (!blockId) return null;
  for (const item of blocks) {
    if (item.id === blockId) return item;
    const child = findBlock(item.children ?? [], blockId);
    if (child) return child;
  }
  return null;
}

export function insertBlock(blocks, parentId, newBlock) {
  if (!parentId) return [...blocks, newBlock];
  return updateBlock(blocks, parentId, (parent) => ({ ...parent, children: [...(parent.children ?? []), newBlock] }));
}

export function moveBlock(blocks, blockId, direction) {
  const index = blocks.findIndex((item) => item.id === blockId);
  if (index >= 0) {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= blocks.length) return blocks;
    const next = [...blocks];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    return next;
  }
  return blocks.map((item) => ({ ...item, children: moveBlock(item.children ?? [], blockId, direction) }));
}

export function serializeProject(project) {
  return JSON.stringify(normalizeProject(project), null, 2);
}

export function parseProject(json) {
  const parsed = JSON.parse(json);
  return normalizeProject(parsed);
}

function transpileJavaScript(project) {
  const diagnostics = [];
  const code = project.blocks
    .map((item) => renderBlock(item, 0, diagnostics))
    .filter(Boolean)
    .join("\n\n");
  return { targetId: "javascript", code, diagnostics };
}

function renderBlock(item, depth, diagnostics) {
  const pad = INDENT.repeat(depth);
  const f = item.fields ?? {};

  switch (item.type) {
    case "class": {
      const name = safeIdentifier(f.name, "UnnamedClass", diagnostics, item);
      const heritage = f.extendsName?.trim() ? ` extends ${f.extendsName.trim()}` : "";
      const members = renderChildren(item, depth + 1, diagnostics, renderClassMember);
      return `${pad}class ${name}${heritage} {\n${members || `${INDENT.repeat(depth + 1)}// Add constructor, fields, and methods here.`}\n${pad}}`;
    }
    case "function": {
      const keyword = f.async === "true" ? "async function" : "function";
      const body = renderChildren(item, depth + 1, diagnostics) || indentRaw("", depth + 1);
      return `${pad}${keyword} ${safeIdentifier(f.name, "fn", diagnostics, item)}(${f.params || ""}) {\n${body}\n${pad}}`;
    }
    case "variable":
      return `${pad}${["const", "let", "var"].includes(f.kind) ? f.kind : "const"} ${safeIdentifier(f.name, "value", diagnostics, item)} = ${valueOr(f.value, "undefined")};`;
    case "assign":
      return `${pad}${f.target || "value"} = ${valueOr(f.value, "undefined")};`;
    case "call":
      return `${pad}${valueOr(f.expression, "undefined")};`;
    case "return":
      return `${pad}return ${valueOr(f.expression, "undefined")};`;
    case "log":
      return `${pad}console.log(${valueOr(f.expression, "\"\"")});`;
    case "if": {
      const body = renderChildren(item, depth + 1, diagnostics) || indentRaw(f.body || "", depth + 1);
      return `${pad}if (${valueOr(f.condition, "true")}) {\n${body}\n${pad}}`;
    }
    case "loop": {
      const iterator = safeIdentifier(f.iterator, "i", diagnostics, item);
      const body = renderChildren(item, depth + 1, diagnostics) || indentRaw(f.body || "", depth + 1);
      return `${pad}for (let ${iterator} = 0; ${iterator} < ${valueOr(f.count, "0")}; ${iterator}++) {\n${body}\n${pad}}`;
    }
    case "event": {
      const body = renderChildren(item, depth + 1, diagnostics);
      return `${pad}document.querySelector(${JSON.stringify(f.selector || "#app")})?.addEventListener(${JSON.stringify(f.event || "click")}, (event) => {\n${body || `${INDENT.repeat(depth + 1)}// Add event blocks here.`}\n${pad}});`;
    }
    case "htmlText":
      return `${pad}document.querySelector(${JSON.stringify(f.selector || "#app")}).textContent = String(${valueOr(f.text, "\"\"")});`;
    default: {
      const definition = blockDefinition(item.type);
      diagnostics.push(diagnostic("warning", definition ? `No JavaScript renderer for ${definition.label}.` : `Unknown block type ${item.type}.`, item.id));
      return "";
    }
  }
}

function renderClassMember(item, depth, diagnostics) {
  const pad = INDENT.repeat(depth);
  const f = item.fields ?? {};

  switch (item.type) {
    case "constructor":
      return `${pad}constructor(${f.params || ""}) {\n${indentRaw(f.body || "", depth + 1)}\n${pad}}`;
    case "method": {
      const asyncPrefix = f.async === "true" ? "async " : "";
      return `${pad}${asyncPrefix}${safeIdentifier(f.name, "method", diagnostics, item)}(${f.params || ""}) {\n${indentRaw(f.body || "", depth + 1)}\n${pad}}`;
    }
    case "staticMethod": {
      const asyncPrefix = f.async === "true" ? "async " : "";
      return `${pad}static ${asyncPrefix}${safeIdentifier(f.name, "method", diagnostics, item)}(${f.params || ""}) {\n${indentRaw(f.body || "", depth + 1)}\n${pad}}`;
    }
    case "getter":
      return `${pad}get ${safeIdentifier(f.name, "property", diagnostics, item)}() {\n${indentRaw(f.body || "", depth + 1)}\n${pad}}`;
    case "setter":
      return `${pad}set ${safeIdentifier(f.name, "property", diagnostics, item)}(${safeIdentifier(f.param, "value", diagnostics, item)}) {\n${indentRaw(f.body || "", depth + 1)}\n${pad}}`;
    case "field": {
      const staticPrefix = f.static === "true" ? "static " : "";
      return `${pad}${staticPrefix}${safeIdentifier(f.name, "field", diagnostics, item)} = ${valueOr(f.value, "undefined")};`;
    }
    default:
      return renderBlock(item, depth, diagnostics);
  }
}

function renderChildren(item, depth, diagnostics, renderer = renderBlock) {
  return (item.children ?? []).map((child) => renderer(child, depth, diagnostics)).filter(Boolean).join("\n");
}

function normalizeBlocks(blocks) {
  return blocks.map((item) => {
    const definition = blockDefinition(item.type);
    return {
      id: item.id || `block_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      type: item.type,
      category: item.category || definition?.category || "state",
      fields: { ...(definition?.defaults ?? {}), ...(item.fields ?? {}) },
      children: normalizeBlocks(item.children ?? []),
    };
  });
}

function safeIdentifier(value, fallback, diagnostics, item) {
  const text = String(value || "").trim();
  if (/^[A-Za-z_$][\w$]*$/.test(text)) return text;
  diagnostics.push(diagnostic("warning", `"${text || "(blank)"}" is not a valid JavaScript identifier; using ${fallback}.`, item.id));
  return fallback;
}

function indentRaw(source, depth) {
  const pad = INDENT.repeat(depth);
  const lines = String(source).split("\n");
  return lines.length ? lines.map((line) => `${pad}${line}`).join("\n") : `${pad}`;
}

function valueOr(value, fallback) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function diagnostic(level, message, blockId) {
  return { level, message, blockId };
}

function block(id, type, category, fields, children = []) {
  return { id, type, category, fields, children };
}

function member(id, type, fields) {
  return block(id, type, type === "field" ? "state" : "oop", fields);
}
