// ─── elements → HTML string ───────────────────────────────────────────────────
export function elementsToHtml(elements) {
  const VOID_TAGS = new Set(["img", "br", "hr", "input", "meta", "link"]);

  const lines = elements.map((el) => {
    const styleStr = stylesToString(el.styles);
    const posStyle = `left:${el.x}px; top:${el.y}px; position:absolute;`;
    const fullStyle = [posStyle, styleStr].filter(Boolean).join(" ");

    if (VOID_TAGS.has(el.tag)) {
      return `  <${el.tag} style="${fullStyle}" />`;
    }
    return `  <${el.tag} style="${fullStyle}">${el.content || ""}</${el.tag}>`;
  });

  return [
    `<!DOCTYPE html>`,
    `<html lang="en">`,
    `<head>`,
    `  <meta charset="UTF-8" />`,
    `  <style>`,
    `    body { margin: 0; font-family: sans-serif; position: relative; min-height: 100vh; }`,
    `  </style>`,
    `</head>`,
    `<body>`,
    ``,
    ...lines,
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

    const nodes = Array.from(body.children).filter(
      (c) => !SKIP.has(c.tagName.toLowerCase())
    );

    if (nodes.length === 0) return null;

    const result = nodes.map((node, i) => {
      const tag = node.tagName.toLowerCase();
      const styleStr = node.getAttribute("style") || "";
      const allStyles = parseStyleString(styleStr);

      // Pull position out of styles into x/y
      const x = parseInt(allStyles.left) || 20 + i * 20;
      const y = parseInt(allStyles.top) || 20 + i * 20;
      delete allStyles.left;
      delete allStyles.top;
      delete allStyles.position;

      // Preserve existing id if same slot
      const existing = existingElements[i];
      const id = existing?.id || "el" + (Date.now() + i);

      return {
        id,
        tag,
        styles: allStyles,
        content: node.textContent || "",
        x,
        y,
      };
    });

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
      return `${prop}:${v}`;
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
    // Convert kebab-case to camelCase
    const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    result[camel] = val;
  });
  return result;
}
