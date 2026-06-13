// ─── elements → HTML string ───────────────────────────────────────────────────
export function elementsToHtml(elements) {
  const VOID_TAGS = new Set(["img", "br", "hr", "input", "meta", "link"]);

  function renderEl(el, depth = 1) {
    const indent = "  ".repeat(depth);
    const styleStr = stylesToString(el.styles);
    const children = elements
      .filter((c) => c.parentId === el.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (VOID_TAGS.has(el.tag)) {
      return `${indent}<${el.tag}${styleStr ? ` style="${styleStr}"` : ""} />`;
    }
    if (children.length > 0) {
      const childLines = children.map((c) => renderEl(c, depth + 1)).join("\n");
      const inner = el.content
        ? `\n${indent}  ${el.content}\n${childLines}\n${indent}`
        : `\n${childLines}\n${indent}`;
      return `${indent}<${el.tag}${styleStr ? ` style="${styleStr}"` : ""}>${inner}</${el.tag}>`;
    }
    return `${indent}<${el.tag}${styleStr ? ` style="${styleStr}"` : ""}>${el.content || ""}</${el.tag}>`;
  }

  const roots = elements
    .filter((el) => !el.parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return [
    `<!DOCTYPE html>`,
    `<html lang="en">`,
    `<head>`,
    `  <meta charset="UTF-8" />`,
    `  <style>`,
    `    body { margin: 16px; font-family: sans-serif; }`,
    `  </style>`,
    `</head>`,
    `<body>`,
    ``,
    ...roots.map((el) => renderEl(el)),
    ``,
    `</body>`,
    `</html>`,
  ].join("\n");
}

// ─── HTML string → elements ───────────────────────────────────────────────────
export function htmlToElements(code, existingElements) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, "text/html");
    const body = doc.body;
    const SKIP = new Set(["script", "style", "meta", "link"]);

    let counter = Date.now();
    function nextId() { return "el" + (counter++); }

    function parseNode(node, parentId, order) {
      const tag = node.tagName.toLowerCase();
      if (SKIP.has(tag)) return [];

      const styleStr = node.getAttribute("style") || "";
      const styles = parseStyleString(styleStr);

      // Collect text content (only if no child elements)
      const childEls = Array.from(node.children).filter(
        (c) => !SKIP.has(c.tagName.toLowerCase())
      );
      const content = childEls.length === 0 ? (node.textContent || "").trim() : "";

      const el = {
        id: nextId(),
        tag,
        styles,
        content,
        parentId: parentId || null,
        order,
      };

      const descendants = [];
      childEls.forEach((child, i) => {
        descendants.push(...parseNode(child, el.id, i));
      });

      return [el, ...descendants];
    }

    const rootNodes = Array.from(body.children).filter(
      (c) => !SKIP.has(c.tagName.toLowerCase())
    );
    if (rootNodes.length === 0) return null;

    const result = [];
    rootNodes.forEach((node, i) => result.push(...parseNode(node, null, i)));
    return result;
  } catch (err) {
    console.warn("htmlToElements parse error:", err);
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function stylesToString(styles) {
  return Object.entries(styles)
    .map(([k, v]) => {
      const prop = k.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${prop}: ${v}`;
    })
    .join("; ");
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
