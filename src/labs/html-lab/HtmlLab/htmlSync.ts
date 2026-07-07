import type { LabElement, BodyStyles } from "./types";
import type { CdnTag } from "./cdnLibraries";

// ─── elements → editable source parts ─────────────────────────────────────────
export function elementsToHtml(elements: LabElement[]): string {
  const VOID_TAGS = new Set(["img", "br", "hr", "input", "meta", "link"]);

  function renderEl(el: LabElement, depth = 1): string {
    const indent = "  ".repeat(depth);
    const children = elements
      .filter((c) => c.parentId === el.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const attrs = `${renderAttrs(el.attrs)} data-lab-id="${escapeAttr(el.id)}"`;

    if (VOID_TAGS.has(el.tag)) return `${indent}<${el.tag}${attrs} />`;
    if (children.length > 0) {
      const childLines = children.map((c) => renderEl(c, depth + 1)).join("\n");
      const inner = el.content
        ? `\n${indent}  ${el.content}\n${childLines}\n${indent}`
        : `\n${childLines}\n${indent}`;
      return `${indent}<${el.tag}${attrs}>${inner}</${el.tag}>`;
    }
    return `${indent}<${el.tag}${attrs}>${el.content || ""}</${el.tag}>`;
  }

  const roots = elements
    .filter((el) => !el.parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return [
    `<!DOCTYPE html>`,
    `<html lang="en">`,
    `<head>`,
    `  <meta charset="UTF-8" />`,
    `  <link rel="stylesheet" href="styles.css" />`,
    `  <script src="script.js" defer></script>`,
    `</head>`,
    `<body>`,
    ``,
    ...roots.map((el) => renderEl(el)),
    ``,
    `</body>`,
    `</html>`,
  ].join("\n");
}

const CSS_RESET = `/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

img, video, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}`;

// Custom properties (CSS variables) are conventionally declared at the very
// top of a stylesheet, before anything that might use them — the position a
// user typing `:root { --accent: ... }` above the reset comment clearly
// intended. elementsToCss otherwise always rebuilds custom CSS at the very
// end (see below), which silently relocated a hand-typed :root block behind
// the reset and every generated rule on the next round-trip. Variables still
// resolve correctly wherever the block ends up (the CSS cascade doesn't
// require "declare before use" the way JS does) — this is purely about not
// surprising a user by moving code they placed on purpose, not a functional
// fix. Only :root is hoisted; every other custom rule keeps acting as an
// override, applied after the generated rules it may be overriding.
function extractRootBlock(customCss: string): { rootBlock: string | null; rest: string } {
  const rootBlockPattern = /:root\s*\{[^}]*\}/i;
  const match = customCss.match(rootBlockPattern);
  if (!match) return { rootBlock: null, rest: customCss };
  return {
    rootBlock: match[0],
    rest: (customCss.slice(0, match.index) + customCss.slice((match.index ?? 0) + match[0].length)).trim(),
  };
}

export function elementsToCss(
  elements: LabElement[],
  customCss = "",
  bodyStyles: BodyStyles = {},
): string {
  const bodyRules = stylesToString(bodyStyles, "  ");
  const { rootBlock, rest: customCssWithoutRoot } = extractRootBlock(customCss.trim());
  const blocks: string[] = [
    ...(rootBlock ? [rootBlock, ``] : []),
    CSS_RESET,
    ``,
    `body {\n${bodyRules || "  margin: 0;\n  padding: 16px;\n  font-family: sans-serif;"}\n}`,
    ``,
    ...elements.map((el) => {
      const rules = stylesToString(el.styles, "  ");
      return `[data-lab-id="${el.id}"] {\n${rules ? `${rules}\n` : ""}}`;
    }),
  ];

  const mqByBreakpoint = new Map<string, { id: string; prop: string; value: string }[]>();
  for (const el of elements) {
    for (const mq of el.mediaQueries || []) {
      const bp = mq.breakpoint;
      if (!mqByBreakpoint.has(bp)) mqByBreakpoint.set(bp, []);
      mqByBreakpoint.get(bp)!.push({ id: el.id, prop: mq.prop, value: mq.value });
    }
  }
  if (mqByBreakpoint.size > 0) {
    blocks.push("");
    for (const [bp, rules] of mqByBreakpoint) {
      const grouped = new Map<string, { prop: string; value: string }[]>();
      for (const r of rules) {
        if (!grouped.has(r.id)) grouped.set(r.id, []);
        grouped.get(r.id)!.push({ prop: r.prop, value: r.value });
      }
      const inner = [...grouped.entries()]
        .map(([id, propRules]) => {
          const propLines = propRules
            .map(({ prop, value }) => `    ${prop.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`)
            .join("\n");
          return `  [data-lab-id="${id}"] {\n${propLines}\n  }`;
        })
        .join("\n");
      blocks.push(`@media (min-width: ${bp}) {\n${inner}\n}`);
    }
  }

  const trimmedCustom = customCssWithoutRoot.trim();
  if (trimmedCustom) blocks.push("", "/* Custom CSS */", trimmedCustom);
  return blocks.join("\n");
}

// ─── HTML string → elements ───────────────────────────────────────────────────
export function htmlToElements(
  code: string,
  existingElements: LabElement[] = [],
  javascript = "",
): LabElement[] | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, "text/html");
    const body = doc.body;
    const SKIP = new Set(["script", "style", "meta", "link"]);
    const usedIds = new Set<string>();
    const existingById = new Map<string, LabElement>(existingElements.map((el) => [el.id, el]));
    const existingByHtmlId = new Map<string, LabElement>(
      existingElements
        .filter((el) => el.attrs?.id)
        .map((el) => [el.attrs.id, el]),
    );
    const existingByPath = new Map<string, LabElement>();
    const jsRefs = extractJavascriptRefs(javascript);

    function buildExistingPaths(parentId: string | null, prefix = ""): void {
      existingElements
        .filter((el) => (el.parentId ?? null) === parentId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach((el, index) => {
          const path = prefix ? `${prefix}.${index}` : `${index}`;
          existingByPath.set(path, el);
          buildExistingPaths(el.id, path);
        });
    }
    buildExistingPaths(null);

    let counter = Date.now();
    function nextId(): string {
      let id = "el" + counter++;
      while (existingById.has(id) || usedIds.has(id)) id = "el" + counter++;
      return id;
    }

    function stableIdFor(node: Element, path: string): string {
      const explicitId = node.getAttribute("data-lab-id");
      if (explicitId && !usedIds.has(explicitId)) {
        usedIds.add(explicitId);
        return explicitId;
      }
      const htmlId = node.getAttribute("id");
      const idMatchedByJs = htmlId && jsRefs.htmlIds.has(htmlId);
      const priorByHtmlId = htmlId ? existingByHtmlId.get(htmlId) : null;
      if (idMatchedByJs && priorByHtmlId && !usedIds.has(priorByHtmlId.id)) {
        usedIds.add(priorByHtmlId.id);
        return priorByHtmlId.id;
      }
      const prior = existingByPath.get(path);
      if (prior && !usedIds.has(prior.id)) {
        usedIds.add(prior.id);
        return prior.id;
      }
      const id = nextId();
      usedIds.add(id);
      return id;
    }

    function parseNode(node: Element, parentId: string | null, order: number, path: string): LabElement[] {
      const tag = node.tagName.toLowerCase();
      if (SKIP.has(tag)) return [];

      const styleStr = node.getAttribute("style") || "";
      const labIdAttr = node.getAttribute("data-lab-id");
      const existing =
        (labIdAttr ? existingById.get(labIdAttr) : undefined) ??
        existingByPath.get(path);
      const inlineStyles = parseStyleString(styleStr);
      const styles = Object.keys(inlineStyles).length
        ? inlineStyles
        : { ...(existing?.styles || {}) };
      const attrs: Record<string, string> = {
        ...(existing?.attrs || {}),
        ...attrsFromNode(node),
      };

      const childEls = Array.from(node.children).filter(
        (c) => !SKIP.has(c.tagName.toLowerCase()),
      );
      // Mixed content (leading text before an inline child, e.g. <p>Fair
      // warning: <strong>...</strong></p>) needs its own path — `textContent`
      // on a node with children pulls in the children's text too, and
      // elementsToHtml/generateExportHtml only ever render `content` BEFORE
      // children, never interleaved with them, so only the text nodes up to
      // the first child element round-trip correctly.
      let content: string;
      if (childEls.length === 0) {
        content = (node.textContent || "").trim();
      } else {
        let leading = "";
        for (const child of Array.from(node.childNodes)) {
          if (child.nodeType !== Node.TEXT_NODE) break;
          leading += child.textContent || "";
        }
        content = leading.trim();
      }

      const el: LabElement = {
        id: stableIdFor(node, path),
        tag,
        attrs,
        styles,
        content,
        parentId: parentId || null,
        order,
        mediaQueries: existing?.mediaQueries || [],
      };

      const descendants: LabElement[] = [];
      childEls.forEach((child, i) => {
        descendants.push(...parseNode(child, el.id, i, `${path}.${i}`));
      });

      return [el, ...descendants];
    }

    const rootNodes = Array.from(body.children).filter(
      (c) => !SKIP.has(c.tagName.toLowerCase()),
    );
    if (rootNodes.length === 0) return null;

    const result: LabElement[] = [];
    rootNodes.forEach((node, i) => result.push(...parseNode(node, null, i, `${i}`)));
    return result;
  } catch (err) {
    console.warn("htmlToElements parse error:", err);
    return null;
  }
}

export function extractJavascriptRefs(javascript = ""): { labIds: Set<string>; htmlIds: Set<string> } {
  const labIds = new Set<string>();
  const htmlIds = new Set<string>();
  const labIdPattern = /data-lab-id\s*=\s*(?:"([^"]+)"|'([^']+)')/g;
  const getElementPattern = /getElementById\(\s*(?:"([^"]+)"|'([^']+)')\s*\)/g;
  const queryIdPattern = /querySelector(?:All)?\(\s*(?:"#([^"]+)"|'#([^']+)')\s*\)/g;

  for (const match of javascript.matchAll(labIdPattern)) labIds.add(match[1] || match[2]);
  for (const match of javascript.matchAll(getElementPattern)) htmlIds.add(match[1] || match[2]);
  for (const match of javascript.matchAll(queryIdPattern)) htmlIds.add(match[1] || match[2]);

  return { labIds, htmlIds };
}

// ─── Shared element renderer ──────────────────────────────────────────────────
function buildHtmlBody(elements: LabElement[]): string {
  const VOID_TAGS = new Set(["img", "br", "hr", "input", "meta", "link"]);
  function renderEl(el: LabElement, depth = 1): string {
    const indent = "  ".repeat(depth);
    const children = elements
      .filter(c => c.parentId === el.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const userAttrs = Object.entries(el.attrs || {})
      .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
      .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, "&quot;")}"`)
      .join("");
    const attrStr = ` data-lab-id="${el.id}"${userAttrs}`;
    if (VOID_TAGS.has(el.tag)) return `${indent}<${el.tag}${attrStr} />`;
    if (children.length > 0) {
      const childLines = children.map(c => renderEl(c, depth + 1)).join("\n");
      const inner = el.content
        ? `\n${indent}  ${el.content}\n${childLines}\n${indent}`
        : `\n${childLines}\n${indent}`;
      return `${indent}<${el.tag}${attrStr}>${inner}</${el.tag}>`;
    }
    return `${indent}<${el.tag}${attrStr}>${el.content || ""}</${el.tag}>`;
  }
  return elements
    .filter(e => !e.parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(el => renderEl(el))
    .join("\n");
}

// ─── Export: standalone HTML ──────────────────────────────────────────────────
export function generateExportHtml(
  elements: LabElement[],
  bodyStyles: BodyStyles,
  customCss: string,
  javascript: string,
  cdnTags: CdnTag[] = [],
): string {
  const htmlBody = buildHtmlBody(elements);
  const css = elementsToCss(elements, customCss, bodyStyles);

  const cdnHeadTags = cdnTags.map(({ url, type }) =>
    type === "stylesheet"
      ? `  <link rel="stylesheet" href="${url}" />`
      : `  <script src="${url}"></script>`,
  ).join("\n");

  const lines: (string | null)[] = [
    `<!DOCTYPE html>`,
    `<html lang="en">`,
    `<head>`,
    `  <meta charset="UTF-8" />`,
    `  <meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
    `  <title>My Page</title>`,
    cdnHeadTags || null,
    `  <style>`,
    css.split("\n").map(l => `    ${l}`).join("\n"),
    `  </style>`,
    `</head>`,
    `<body>`,
    ``,
    htmlBody,
    ``,
    javascript?.trim() ? `<script>\n${javascript}\n</script>` : "",
    `</body>`,
    `</html>`,
  ];
  return lines.filter((l): l is string => l !== null && l !== "").join("\n");
}

// ─── Export: linked to separate files ────────────────────────────────────────
// `jsFileNames` are written in order — one `<script>` per real file (each
// downloads as itself, real editable source, not a merged/transpiled bundle;
// see HtmlLab.tsx's exportSplit). Defaults to a single "script.js" for any
// caller that hasn't been updated to pass real names.
export function generateLinkedHtml(elements: LabElement[], cdnTags: CdnTag[] = [], jsFileNames: string[] = ["script.js"]): string {
  const htmlBody = buildHtmlBody(elements);
  const cdnHeadTags = cdnTags.map(({ url, type }) =>
    type === "stylesheet"
      ? `  <link rel="stylesheet" href="${url}" />`
      : `  <script src="${url}"></script>`,
  ).join("\n");
  const jsTags = jsFileNames.map((name) => `  <script src="${name}" defer></script>`).join("\n");

  const lines: (string | null)[] = [
    `<!DOCTYPE html>`,
    `<html lang="en">`,
    `<head>`,
    `  <meta charset="UTF-8" />`,
    `  <meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
    `  <title>My Page</title>`,
    cdnHeadTags || null,
    `  <link rel="stylesheet" href="styles.css" />`,
    `</head>`,
    `<body>`,
    ``,
    htmlBody,
    ``,
    jsTags || null,
    `</body>`,
    `</html>`,
  ];
  return lines.filter((l): l is string => l !== null).join("\n");
}

export function applyCssToElements(
  css: string,
  elements: LabElement[],
  javascript = "",
): { elements: LabElement[]; customCss: string; bodyStyles?: BodyStyles } {
  const styleById = new Map<string, Record<string, string>>();
  let bodyStyles: Record<string, string> | null = null;

  // Matched by structure (comment + the 3 known selector groups), not by the
  // exact property values inside — elementsToCss always re-emits this block
  // verbatim, so failing to strip it here means every editor keystroke
  // round-trips a fresh copy back into customCss, which then gets echoed
  // back in by elementsToCss on top of *another* fresh copy: an unbounded
  // duplicate pileup on every edit. Structural (not literal-text) matching
  // also means it still strips — and self-heals — a copy someone hand-edited.
  const resetBlock = /\/\*\s*Reset\s*\*\/\s*\*,\s*\*::before,\s*\*::after\s*\{[^}]*\}\s*img,\s*video,\s*svg\s*\{[^}]*\}\s*input,\s*button,\s*textarea,\s*select\s*\{[^}]*\}/gi;
  const managedBlock = /\[data-lab-id=(?:"([^"]+)"|'([^']+)')\]\s*\{([^}]*)\}/g;
  let customCss = css
    .replace(/\/\*\s*Custom CSS\s*\*\//gi, "")
    .replace(resetBlock, "")
    .replace(managedBlock, (_, id1: string, id2: string, body: string) => {
      const id = id1 || id2;
      styleById.set(id, parseStyleString(body));
      return "";
    });

  // A hand-typed or pasted rule using a plain tag/.class/#id selector — e.g.
  // ".card { padding: 16px; }" — previously stayed as opaque text forever:
  // this function only ever recognized the [data-lab-id] shape its own
  // elementsToCss emits, so such a rule never reached any element's `styles`,
  // meaning the canvas never reflected it and the Properties Panel had
  // nothing to show or let you change for it. This mirrors what
  // applyImportedCssToDoc already does for a freshly-imported HTML document
  // (matching a real, parsed DOM) — here against this app's own LabElement[]
  // model instead, no DOM involved. Compound/stateful selectors (".toast.show",
  // a class also toggled by this project's own JS) are deliberately left
  // alone, for the identical reason the import path leaves them alone: baking
  // a toggle-driven class's rule into a frozen inline style would permanently
  // block that class from ever visually turning on or off again.
  const stateClasses = extractDynamicClassNames(javascript);
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  customCss = customCss.replace(ruleRe, (fullMatch, selectorGroup: string, declarations: string) => {
    const trimmedSelectorGroup = selectorGroup.trim();
    const trimmedDeclarations = declarations.trim();
    if (!trimmedSelectorGroup || !trimmedDeclarations || /^body$/i.test(trimmedSelectorGroup)) return fullMatch;

    const parsedStyles = parseStyleString(trimmedDeclarations);

    const selectors = trimmedSelectorGroup.split(",").map((s) => s.trim()).filter(Boolean);
    const isSimple = selectors.every((sel) => {
      if (/[:>+~]/.test(sel) || sel === "*" || sel.startsWith("*") || isCompoundSelector(sel)) return false;
      return !classesOf(sel).some((c) => stateClasses.has(c));
    });
    // A class currently unmentioned by any JS is still routinely the *plan*
    // for one written moments later — "define what hidden looks like, then
    // wire up a button to toggle it" is a completely normal order to build
    // in, and stateClasses can only ever see JS that already exists. Baking
    // a visibility-style property into a frozen per-element rule the first
    // time would make that imminent toggle permanently inert (the class
    // stops mattering once the property lives outside it entirely) — so a
    // class-based rule that looks like a show/hide switch stays live CSS
    // regardless, on the assumption that baking it was never really the
    // point of writing a reusable class for it in the first place.
    const isVisibilityToggle = isSimple && selectors.some((sel) => sel.startsWith(".")) && looksLikeVisibilityToggle(parsedStyles);
    if (!isSimple || isVisibilityToggle) return fullMatch;

    const matchedElements = elements.filter((el) => selectors.some((sel) => elementMatchesSimpleSelector(el, sel)));
    if (matchedElements.length === 0) return fullMatch;

    for (const el of matchedElements) {
      // The exact [data-lab-id] block already extracted above reflects the
      // most recent Properties Panel edit for this one element specifically —
      // it wins over a same-named property from a broader class/tag rule.
      styleById.set(el.id, { ...parsedStyles, ...(styleById.get(el.id) ?? {}) });
    }
    return "";
  });

  customCss = customCss
    .replace(/body\s*\{([^}]*)\}/gi, (_, body: string) => {
      bodyStyles = parseStyleString(body);
      return "";
    })
    .trim();

  return {
    elements: elements.map((el) =>
      styleById.has(el.id) ? { ...el, styles: styleById.get(el.id)! } : el,
    ),
    customCss,
    ...(bodyStyles !== null ? { bodyStyles } : {}),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function stylesToString(styles: Record<string, string>, linePrefix = ""): string {
  return Object.entries(styles)
    .map(([k, v]) => {
      const prop = k.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${linePrefix}${prop}: ${v};`;
    })
    .join("\n");
}

function renderAttrs(attrs: Record<string, string> = {}): string {
  return Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([key, value]) => ` ${key}="${escapeAttr(value)}"`)
    .join("");
}

function escapeAttr(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function attrsFromNode(node: Element): Record<string, string> {
  const attrs: Record<string, string> = {};
  Array.from(node.attributes).forEach((attr) => {
    if (attr.name === "data-lab-id" || attr.name === "style") return;
    attrs[attr.name] = attr.value;
  });
  if (!("id" in attrs)) attrs.id = "";
  if (!("class" in attrs)) attrs.class = "";
  return attrs;
}

// ─── Full HTML document → lab state ──────────────────────────────────────────
export function parseHtmlDocument(htmlString: string): {
  elements: LabElement[];
  bodyStyles: BodyStyles;
  javascript: string;
  css: string;
} {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const styleEls = Array.from(doc.querySelectorAll("style"));
    const rawCss = styleEls.map((s) => s.textContent ?? "").join("\n\n");

    const scriptEls = Array.from(doc.querySelectorAll("script"));
    const javascript = scriptEls.map((s) => s.textContent).filter(Boolean).join("\n\n");

    const { bodyStylesFromCss, customCss } = applyImportedCssToDoc(doc, rawCss, javascript);

    const bodyStyleStr = doc.body?.getAttribute("style") || "";
    const bodyStyles: BodyStyles = { ...bodyStylesFromCss, ...parseStyleString(bodyStyleStr) };

    const elements = htmlToElements(doc.body?.innerHTML || "", [], javascript) || [];

    return { elements, bodyStyles, javascript, css: customCss };
  } catch (err) {
    console.warn("parseHtmlDocument error:", err);
    return { elements: [], bodyStyles: {}, javascript: "", css: "" };
  }
}

// Classes the imported page's own JS assigns dynamically — via
// `el.className = "..."` / `el.classList.add/toggle/remove("...")` — need the
// same protection as a compound-selector-referenced class (see stateClasses
// below), for a second, distinct reason: some of these classes aren't
// toggled on an existing element at all, they're stamped onto elements the
// script *creates* at runtime (`document.createElement` + `className =`).
// Real incident: a page whose JS rebuilds a nav list on load with
// `nav.className = "navBtn"` — baking `.navBtn`'s styles into one-time
// per-element `[data-lab-id]` rules (the default for a plain single-class
// selector) meant every button the script (re)created after that had zero
// styling, since a data-lab-id attribute only exists on elements that were
// in the original static markup, not ones freshly created in the browser.
// Keeping `.navBtn` as a live, real class rule — like the original page had
// — means newly-created elements are styled correctly too, the same way a
// real browser would render this page.
// A selector like "body.dark" or ".toast.show" — a tag/class immediately
// followed by one or more further classes with no combinator — is a
// toggleable "modifier" state (dark mode, a "show" state, a BEM modifier).
// Shared between applyImportedCssToDoc (matches against a real, parsed
// Document) and applyCssToElements (matches against this app's own
// LabElement[] model, no DOM involved) — both need to agree on exactly the
// same "simple enough to bake into one element's styles" boundary.
function isCompoundSelector(sel: string): boolean {
  const classCount = (sel.match(/\.[\w-]+/g) || []).length;
  return classCount >= 2 || (classCount >= 1 && /^[a-zA-Z]/.test(sel));
}
function classesOf(sel: string): string[] {
  return (sel.match(/\.[\w-]+/g) || []).map((c) => c.slice(1));
}

// Matches a *simple* selector — a bare tag name, a single ".class", or a
// single "#id" — against one LabElement, without needing a real DOM at all.
// Anything more elaborate (compound, combinators, pseudo-classes, "*") is
// already routed to customCss before this is ever called; it never has to
// recognize those, only decide the three plain cases directly.
function elementMatchesSimpleSelector(el: LabElement, selector: string): boolean {
  const trimmed = selector.trim();
  if (trimmed.startsWith(".")) {
    return (el.attrs?.class || "").split(/\s+/).includes(trimmed.slice(1));
  }
  if (trimmed.startsWith("#")) {
    return el.attrs?.id === trimmed.slice(1);
  }
  return el.tag.toLowerCase() === trimmed.toLowerCase();
}

// Real incident: writing ".hidden { display: none; }" and only afterward
// adding a button whose click handler does classList.toggle("hidden") —
// baked this class's rule into the element's own frozen [data-lab-id] style
// the moment the CSS was typed, since nothing referencing "hidden" existed
// in the JS yet. The toggle, added a moment later, still runs — the class
// really does get added and removed — but display:none no longer depends
// on the class at all once it lives in its own separate, unconditional
// rule, so nothing visible ever changes again. A class-based rule that sets
// one of these three properties to a value that would hide something is
// exactly the shape a show/hide toggle takes; kept live rather than baked,
// regardless of whether the JS side has been written yet.
function looksLikeVisibilityToggle(styles: Record<string, string>): boolean {
  const display = styles.display?.trim().toLowerCase();
  const visibility = styles.visibility?.trim().toLowerCase();
  const opacity = styles.opacity?.trim();
  return display === "none" || visibility === "hidden" || opacity === "0";
}

function extractDynamicClassNames(javascript: string): Set<string> {
  const names = new Set<string>();
  const classNameAssignRe = /\.className\s*=\s*(["'`])((?:(?!\1).)*)\1/g;
  const classListRe = /\.classList\.(?:add|toggle|remove)\(\s*(["'`])((?:(?!\1).)*)\1/g;
  let cm: RegExpExecArray | null;
  while ((cm = classNameAssignRe.exec(javascript)) !== null) {
    cm[2].split(/\s+/).filter(Boolean).forEach((c) => names.add(c));
  }
  while ((cm = classListRe.exec(javascript)) !== null) {
    names.add(cm[2]);
  }
  return names;
}

function applyImportedCssToDoc(
  doc: Document,
  css: string,
  javascript = "",
): { bodyStylesFromCss: Record<string, string>; customCss: string } {
  const bodyStylesFromCss: Record<string, string> = {};
  const appliedRules: { selector: string; styles: Record<string, string> }[] = [];
  const customChunks: string[] = [];

  let remaining = css.replace(/@[^{]+\{(?:[^{}]*|\{[^{}]*\})*\}/g, (m) => {
    customChunks.push(m.trim());
    return "";
  });

  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  const parsedRules: { selectors: string[]; declarations: string; styles: Record<string, string> }[] = [];
  // Any class referenced by a compound/stateful selector must never be baked into a
  // one-time inline-style snapshot — not even via its own plain single-class rule —
  // or the frozen inline value would permanently block whatever a classList.toggle()
  // at runtime is trying to show/hide (inline styles beat stylesheet rules regardless
  // of specificity). So every rule touching such a class is preserved as live CSS instead.
  const stateClasses = extractDynamicClassNames(javascript);
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(remaining)) !== null) {
    const selectorGroup = m[1].trim();
    const declarations = m[2].trim();
    if (!selectorGroup || !declarations) continue;
    const styles = parseStyleString(declarations);
    const selectors = selectorGroup.split(",").map((s) => s.trim()).filter(Boolean);
    parsedRules.push({ selectors, declarations, styles });
    for (const sel of selectors) {
      if (isCompoundSelector(sel)) classesOf(sel).forEach((c) => stateClasses.add(c));
    }
  }

  for (const rule of parsedRules) {
    const simple: string[] = [];
    const complex: string[] = [];
    for (const sel of rule.selectors) {
      const referencesStateClass = classesOf(sel).some((c) => stateClasses.has(c));
      if (/^html$|^body$/.test(sel) && !referencesStateClass) {
        Object.assign(bodyStylesFromCss, rule.styles);
      } else if (/[:>+~]/.test(sel) || sel === "*" || sel.startsWith("*") || isCompoundSelector(sel) || referencesStateClass) {
        complex.push(sel);
      } else {
        simple.push(sel);
      }
    }

    if (simple.length) simple.forEach((sel) => appliedRules.push({ selector: sel, styles: rule.styles }));
    if (complex.length) customChunks.push(`${complex.join(", ")} {\n  ${rule.declarations}\n}`);
  }

  function applyToEl(el: Element): void {
    const computed: Record<string, string> = {};
    for (const rule of appliedRules) {
      try {
        if (el.matches(rule.selector)) Object.assign(computed, rule.styles);
      } catch { /* invalid selector — skip */ }
    }
    if (Object.keys(computed).length) {
      const existing = parseStyleString(el.getAttribute("style") || "");
      const merged = { ...computed, ...existing };
      el.setAttribute(
        "style",
        Object.entries(merged)
          .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v}`)
          .join("; "),
      );
    }
    Array.from(el.children).forEach(applyToEl);
  }
  Array.from(doc.body?.children ?? []).forEach(applyToEl);

  return { bodyStylesFromCss, customCss: customChunks.join("\n\n") };
}

export function parseStyleString(str: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!str) return result;
  str.split(";").forEach((part) => {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) return;
    const key = part.slice(0, colonIdx).trim();
    const val = part.slice(colonIdx + 1).trim();
    if (!key || !val) return;
    const camel = key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    result[camel] = val;
  });
  return result;
}
