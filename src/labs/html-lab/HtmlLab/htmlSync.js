// ─── elements → editable source parts ─────────────────────────────────────────
export function elementsToHtml(elements) {
  const VOID_TAGS = new Set(["img", "br", "hr", "input", "meta", "link"]);

  function renderEl(el, depth = 1) {
    const indent = "  ".repeat(depth);
    const children = elements
      .filter((c) => c.parentId === el.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const attrs = `${renderAttrs(el.attrs)} data-lab-id="${escapeAttr(el.id)}"`;

    if (VOID_TAGS.has(el.tag)) {
      return `${indent}<${el.tag}${attrs} />`;
    }
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

export function elementsToCss(elements, customCss = "", bodyStyles = {}) {
  const bodyRules = stylesToString(bodyStyles, "  ");
  const blocks = [
    CSS_RESET,
    ``,
    `body {\n${bodyRules || "  margin: 0;\n  padding: 16px;\n  font-family: sans-serif;"}\n}`,
    ``,
    ...elements.map((el) => {
      const rules = stylesToString(el.styles, "  ");
      return `[data-lab-id="${el.id}"] {\n${rules ? `${rules}\n` : ""}}`;
    }),
  ];

  // ── Media query blocks ──────────────────────────────────────────────────────
  // Group all element media queries by breakpoint
  const mqByBreakpoint = new Map();
  for (const el of elements) {
    for (const mq of el.mediaQueries || []) {
      const bp = mq.breakpoint;
      if (!mqByBreakpoint.has(bp)) mqByBreakpoint.set(bp, []);
      mqByBreakpoint
        .get(bp)
        .push({ id: el.id, prop: mq.prop, value: mq.value });
    }
  }
  if (mqByBreakpoint.size > 0) {
    blocks.push("");
    for (const [bp, rules] of mqByBreakpoint) {
      const grouped = new Map();
      for (const r of rules) {
        if (!grouped.has(r.id)) grouped.set(r.id, []);
        grouped.get(r.id).push({ prop: r.prop, value: r.value });
      }
      const inner = [...grouped.entries()]
        .map(([id, propRules]) => {
          const propLines = propRules
            .map(
              ({ prop, value }) =>
                `    ${prop.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`,
            )
            .join("\n");
          return `  [data-lab-id="${id}"] {\n${propLines}\n  }`;
        })
        .join("\n");
      blocks.push(`@media (min-width: ${bp}) {\n${inner}\n}`);
    }
  }

  const trimmedCustom = customCss.trim();
  if (trimmedCustom) {
    blocks.push("", "/* Custom CSS */", trimmedCustom);
  }
  return blocks.join("\n");
}

// ─── HTML string → elements ───────────────────────────────────────────────────
export function htmlToElements(code, existingElements = [], javascript = "") {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, "text/html");
    const body = doc.body;
    const SKIP = new Set(["script", "style", "meta", "link"]);
    const usedIds = new Set();
    const existingById = new Map(existingElements.map((el) => [el.id, el]));
    const existingByHtmlId = new Map(
      existingElements
        .filter((el) => el.attrs?.id)
        .map((el) => [el.attrs.id, el]),
    );
    const existingByPath = new Map();
    const jsRefs = extractJavascriptRefs(javascript);

    function buildExistingPaths(parentId, prefix = "") {
      existingElements
        .filter((el) => (el.parentId ?? null) === (parentId ?? null))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach((el, index) => {
          const path = prefix ? `${prefix}.${index}` : `${index}`;
          existingByPath.set(path, el);
          buildExistingPaths(el.id, path);
        });
    }
    buildExistingPaths(null);

    let counter = Date.now();
    function nextId() {
      let id = "el" + counter++;
      while (existingById.has(id) || usedIds.has(id)) id = "el" + counter++;
      return id;
    }

    function stableIdFor(node, path) {
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

    function parseNode(node, parentId, order, path) {
      const tag = node.tagName.toLowerCase();
      if (SKIP.has(tag)) return [];

      const styleStr = node.getAttribute("style") || "";
      const existing =
        existingById.get(node.getAttribute("data-lab-id")) ||
        existingByPath.get(path);
      const inlineStyles = parseStyleString(styleStr);
      const styles = Object.keys(inlineStyles).length
        ? inlineStyles
        : { ...(existing?.styles || {}) };
      const attrs = {
        ...(existing?.attrs || {}),
        ...attrsFromNode(node),
      };

      // Collect text content (only if no child elements)
      const childEls = Array.from(node.children).filter(
        (c) => !SKIP.has(c.tagName.toLowerCase()),
      );
      const content =
        childEls.length === 0 ? (node.textContent || "").trim() : "";

      const el = {
        id: stableIdFor(node, path),
        tag,
        attrs,
        styles,
        content,
        parentId: parentId || null,
        order,
        mediaQueries: existing?.mediaQueries || [],
      };

      const descendants = [];
      childEls.forEach((child, i) => {
        descendants.push(...parseNode(child, el.id, i, `${path}.${i}`));
      });

      return [el, ...descendants];
    }

    const rootNodes = Array.from(body.children).filter(
      (c) => !SKIP.has(c.tagName.toLowerCase()),
    );
    if (rootNodes.length === 0) return null;

    const result = [];
    rootNodes.forEach((node, i) =>
      result.push(...parseNode(node, null, i, `${i}`)),
    );
    return result;
  } catch (err) {
    console.warn("htmlToElements parse error:", err);
    return null;
  }
}

export function extractJavascriptRefs(javascript = "") {
  const labIds = new Set();
  const htmlIds = new Set();
  const labIdPattern = /data-lab-id\s*=\s*(?:"([^"]+)"|'([^']+)')/g;
  const getElementPattern = /getElementById\(\s*(?:"([^"]+)"|'([^']+)')\s*\)/g;
  const queryIdPattern =
    /querySelector(?:All)?\(\s*(?:"#([^"]+)"|'#([^']+)')\s*\)/g;

  for (const match of javascript.matchAll(labIdPattern))
    labIds.add(match[1] || match[2]);
  for (const match of javascript.matchAll(getElementPattern))
    htmlIds.add(match[1] || match[2]);
  for (const match of javascript.matchAll(queryIdPattern))
    htmlIds.add(match[1] || match[2]);

  return { labIds, htmlIds };
}

// ─── Shared element renderer (used by both export functions) ──────────────────
function buildHtmlBody(elements) {
  const VOID_TAGS = new Set(["img", "br", "hr", "input", "meta", "link"]);
  function renderEl(el, depth = 1) {
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

// ─── Export: generate a clean standalone HTML file ───────────────────────────
export function generateExportHtml(elements, bodyStyles, customCss, javascript, cdnTags = []) {
  const htmlBody = buildHtmlBody(elements);
  const css      = elementsToCss(elements, customCss, bodyStyles);

  const cdnHeadTags = cdnTags.map(({ url, type }) =>
    type === "stylesheet"
      ? `  <link rel="stylesheet" href="${url}" />`
      : `  <script src="${url}"></script>`
  ).join("\n");

  return [
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
  ].filter(l => l !== null && l !== "").join("\n");
}

// ─── Export: generate HTML that links to separate styles.css / script.js ─────
export function generateLinkedHtml(elements, cdnTags = []) {
  const htmlBody = buildHtmlBody(elements);
  const cdnHeadTags = cdnTags.map(({ url, type }) =>
    type === "stylesheet"
      ? `  <link rel="stylesheet" href="${url}" />`
      : `  <script src="${url}"></script>`
  ).join("\n");

  return [
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
    `  <script src="script.js" defer></script>`,
    `</body>`,
    `</html>`,
  ].filter(l => l !== null).join("\n");
}

export function applyCssToElements(css, elements) {
  const styleById = new Map();
  let bodyStyles = null;

  const managedBlock = /\[data-lab-id=(?:"([^"]+)"|'([^']+)')\]\s*\{([^}]*)\}/g;
  let customCss = css
    .replace(/\/\*\s*Custom CSS\s*\*\//gi, "")
    .replace(managedBlock, (_, id1, id2, body) => {
      const id = id1 || id2;
      styleById.set(id, parseStyleString(body));
      return "";
    });

  // Extract body block and parse its styles
  customCss = customCss.replace(/body\s*\{([^}]*)\}/gi, (_, body) => {
    bodyStyles = parseStyleString(body);
    return "";
  }).trim();

  return {
    elements: elements.map((el) =>
      styleById.has(el.id) ? { ...el, styles: styleById.get(el.id) } : el,
    ),
    customCss,
    ...(bodyStyles !== null ? { bodyStyles } : {}),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function stylesToString(styles, linePrefix = "") {
  return Object.entries(styles)
    .map(([k, v]) => {
      const prop = k.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${linePrefix}${prop}: ${v};`;
    })
    .join("\n");
}

function renderAttrs(attrs = {}) {
  return Object.entries(attrs)
    .filter(
      ([, value]) =>
        value !== undefined && value !== null && String(value).trim() !== "",
    )
    .map(([key, value]) => ` ${key}="${escapeAttr(value)}"`)
    .join("");
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function attrsFromNode(node) {
  const attrs = {};
  Array.from(node.attributes).forEach((attr) => {
    if (attr.name === "data-lab-id" || attr.name === "style") return;
    attrs[attr.name] = attr.value;
  });
  if (!("id" in attrs)) attrs.id = "";
  if (!("class" in attrs)) attrs.class = "";
  return attrs;
}

// ─── Full HTML document → lab state ──────────────────────────────────────────
export function parseHtmlDocument(htmlString) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const styleEls = Array.from(doc.querySelectorAll("style"));
    const rawCss = styleEls.map((s) => s.textContent).join("\n\n");

    const scriptEls = Array.from(doc.querySelectorAll("script"));
    const javascript = scriptEls.map((s) => s.textContent).filter(Boolean).join("\n\n");

    // Apply CSS rules to DOM elements via selector matching so that
    // htmlToElements picks them up as inline styles (it reads style="...").
    // Returns body styles and any CSS that can't be inlined (pseudo-selectors,
    // @media/@keyframes blocks).
    const { bodyStylesFromCss, customCss } = applyImportedCssToDoc(doc, rawCss);

    // Merge body CSS rules with any inline style="" on <body>
    const bodyStyleStr = doc.body?.getAttribute("style") || "";
    const bodyStyles = { ...bodyStylesFromCss, ...parseStyleString(bodyStyleStr) };

    // DOM elements now have inline styles set — htmlToElements reads them directly
    const elements = htmlToElements(doc.body?.innerHTML || "", [], javascript) || [];

    return { elements, bodyStyles, javascript, css: customCss };
  } catch (err) {
    console.warn("parseHtmlDocument error:", err);
    return { elements: [], bodyStyles: {}, javascript: "", css: "" };
  }
}

// Apply class/id/tag CSS rules to a parsed DOM document by using element.matches().
// @-rules and pseudo-selectors can't be inlined so they go to customCss.
function applyImportedCssToDoc(doc, css) {
  const bodyStylesFromCss = {};
  const appliedRules = []; // { selector, styles }[]
  const customChunks = [];

  // Lift @-rules (media, keyframes, supports…) out unchanged — they have nested braces
  let remaining = css.replace(/@[^{]+\{(?:[^{}]*|\{[^{}]*\})*\}/g, (m) => {
    customChunks.push(m.trim());
    return "";
  });

  // Parse flat   selector { declarations }   blocks
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(remaining)) !== null) {
    const selectorGroup = m[1].trim();
    const declarations = m[2].trim();
    if (!selectorGroup || !declarations) continue;
    const styles = parseStyleString(declarations);
    const selectors = selectorGroup.split(",").map((s) => s.trim()).filter(Boolean);

    const simple = [];
    const complex = [];
    for (const sel of selectors) {
      // body/html → extract as bodyStyles
      if (/^html$|^body$/.test(sel)) {
        Object.assign(bodyStylesFromCss, styles);
      // pseudo-classes/elements and CSS combinators can't be inlined → customCss
      } else if (/[:>+~]/.test(sel) || sel === "*" || sel.startsWith("*")) {
        complex.push(sel);
      } else {
        simple.push(sel);
      }
    }

    if (simple.length) simple.forEach((sel) => appliedRules.push({ selector: sel, styles }));
    if (complex.length) customChunks.push(`${complex.join(", ")} {\n  ${declarations}\n}`);
  }

  // Walk the body DOM, test each element against collected rules, set inline styles
  function applyToEl(el) {
    const computed = {};
    for (const rule of appliedRules) {
      try {
        if (el.matches(rule.selector)) Object.assign(computed, rule.styles);
      } catch { /* invalid selector — skip */ }
    }
    if (Object.keys(computed).length) {
      // Inline style="" in the original HTML takes precedence over class rules
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
  Array.from(doc.body?.children || []).forEach(applyToEl);

  return { bodyStylesFromCss, customCss: customChunks.join("\n\n") };
}

export function parseStyleString(str) {
  const result = {};
  if (!str) return result;
  str.split(";").forEach((part) => {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) return;
    const key = part.slice(0, colonIdx).trim();
    const val = part.slice(colonIdx + 1).trim();
    if (!key || !val) return;
    const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    result[camel] = val;
  });
  return result;
}
