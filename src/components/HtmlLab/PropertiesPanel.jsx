import { useState } from "react";
import styles from "./HtmlLab.module.css";

const TAGS = ["div", "p", "h1", "h2", "h3", "h4", "button", "span", "a", "img", "ul", "li", "section", "article", "header", "footer"];

const TAG_ATTR_ROWS = {
  a: [
    { label: "href", prop: "_href", attr: "href", type: "attr", placeholder: "https://example.com" },
    { label: "target", prop: "_target", attr: "target", type: "attr", placeholder: "_blank" },
  ],
  img: [
    { label: "src", prop: "_src", attr: "src", type: "attr", placeholder: "https://..." },
    { label: "alt", prop: "_alt", attr: "alt", type: "attr", placeholder: "Image description" },
  ],
  button: [
    { label: "type", prop: "_type", attr: "type", type: "attr", placeholder: "button" },
  ],
};

const SECTIONS = [
  {
    key: "content",
    title: "Content",
    rows: [
      { label: "Text", prop: "_content", type: "text" },
      { label: "Tag",  prop: "_tag",     type: "tag"  },
      { label: "id",   prop: "_id",      type: "attr" },
      { label: "class", prop: "_class",   attr: "class", type: "attr", placeholder: "card primary" },
    ],
  },
  {
    key: "javascript",
    title: "JavaScript",
    rows: [],
    special: "javascript",
  },
  {
    key: "layout",
    title: "Layout",
    rows: [
      { label: "display",   prop: "display",         type: "select", opts: ["block","inline-block","flex","grid","inline","none"] },
      { label: "flex-dir",  prop: "flexDirection",   type: "select", opts: ["","row","column","row-reverse","column-reverse"] },
      { label: "align",     prop: "alignItems",      type: "select", opts: ["","flex-start","center","flex-end","stretch","baseline"] },
      { label: "justify",   prop: "justifyContent",  type: "select", opts: ["","flex-start","center","flex-end","space-between","space-around","space-evenly"] },
      { label: "flex-wrap", prop: "flexWrap",        type: "select", opts: ["","nowrap","wrap","wrap-reverse"] },
      { label: "gap",       prop: "gap",             type: "text" },
    ],
  },
  {
    key: "size",
    title: "Size",
    rows: [
      { label: "width",    prop: "width",     type: "text" },
      { label: "height",   prop: "height",    type: "text" },
      { label: "min-w",    prop: "minWidth",  type: "text" },
      { label: "min-h",    prop: "minHeight", type: "text" },
      { label: "max-w",    prop: "maxWidth",  type: "text" },
      { label: "max-h",    prop: "maxHeight", type: "text" },
      { label: "overflow", prop: "overflow",  type: "select", opts: ["","visible","hidden","scroll","auto"] },
    ],
  },
  {
    key: "spacing",
    title: "Spacing",
    rows: [
      { label: "margin",    prop: "margin",        type: "text" },
      { label: "padding",   prop: "padding",       type: "text" },
      { label: "margin-t",  prop: "marginTop",     type: "text" },
      { label: "margin-r",  prop: "marginRight",   type: "text" },
      { label: "margin-b",  prop: "marginBottom",  type: "text" },
      { label: "margin-l",  prop: "marginLeft",    type: "text" },
      { label: "padding-t", prop: "paddingTop",    type: "text" },
      { label: "padding-r", prop: "paddingRight",  type: "text" },
      { label: "padding-b", prop: "paddingBottom", type: "text" },
      { label: "padding-l", prop: "paddingLeft",   type: "text" },
    ],
  },
  {
    key: "typography",
    title: "Typography",
    rows: [
      { label: "font-size",   prop: "fontSize",       type: "text" },
      { label: "color",       prop: "color",          type: "color" },
      { label: "font-weight", prop: "fontWeight",     type: "select", opts: ["","300","400","500","600","700","bold"] },
      { label: "text-align",  prop: "textAlign",      type: "select", opts: ["","left","center","right","justify"] },
      { label: "line-height", prop: "lineHeight",     type: "text" },
      { label: "letter-sp",   prop: "letterSpacing",  type: "text" },
      { label: "decoration",  prop: "textDecoration", type: "select", opts: ["","none","underline","line-through","overline"] },
      { label: "transform",   prop: "textTransform",  type: "select", opts: ["","none","uppercase","lowercase","capitalize"] },
    ],
  },
  {
    key: "background",
    title: "Background",
    rows: [
      { label: "bg-color",  prop: "backgroundColor", type: "color" },
      { label: "bg-image",  prop: "backgroundImage", type: "text" },
      { label: "bg-size",   prop: "backgroundSize",  type: "select", opts: ["","cover","contain","auto"] },
      { label: "opacity",   prop: "opacity",         type: "text" },
    ],
  },
  {
    key: "border",
    title: "Border & shadow",
    rows: [
      { label: "border",     prop: "border",       type: "text" },
      { label: "radius",     prop: "borderRadius", type: "text" },
      { label: "outline",    prop: "outline",      type: "text" },
      { label: "box-shadow", prop: "boxShadow",    type: "text" },
    ],
  },
  {
    key: "boxmodel",
    title: "Box model",
    rows: [],
    special: "boxmodel",
  },
];

export default function PropertiesPanel({
  element,
  onChange,
  onContentChange,
  onTagChange,
  onAttrChange,
  javascript,
  onInsertJavascript,
}) {
  const [collapsed, setCollapsed] = useState({ boxmodel: false });

  const toggle = (key) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  if (!element) {
    return (
      <div className={styles.propsPanel}>
        <div className={styles.panelHeader}>Properties</div>
        <div className={styles.propsEmpty}>
          Select an element on the canvas to edit its styles.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.propsPanel}>
      <div className={styles.panelHeader}>
        &lt;{element.tag}&gt; · {element.id}
        {element.parentId && (
          <span className={styles.nestedBadge}>nested</span>
        )}
      </div>
      <div className={styles.propsBody}>
        {SECTIONS.map((sec) => (
          <div key={sec.key} className={styles.propSection}>
            <button
              className={styles.propSectionTitle}
              onClick={() => toggle(sec.key)}
            >
              {sec.title}
              <span>{collapsed[sec.key] ? "▶" : "▼"}</span>
            </button>

            {!collapsed[sec.key] && (
              <div className={styles.propRows}>
                {sec.special === "boxmodel" ? (
                  <BoxModelVisual el={element} />
                ) : sec.special === "javascript" ? (
                  <JavascriptTools
                    element={element}
                    javascript={javascript}
                    onInsertJavascript={onInsertJavascript}
                  />
                ) : (
                  getRowsForSection(sec, element).map((row) => (
                    <PropRow
                      key={row.prop}
                      row={row}
                      element={element}
                      onChange={onChange}
                      onContentChange={onContentChange}
                      onTagChange={onTagChange}
                      onAttrChange={onAttrChange}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PropRow({ row, element, onChange, onContentChange, onTagChange, onAttrChange }) {
  const val = element.styles[row.prop] || "";

  if (row.prop === "_content") {
    return (
      <div className={styles.propRow}>
        <label className={styles.propLabel}>Text</label>
        <input
          className={styles.propInput}
          value={element.content || ""}
          onChange={(e) => onContentChange(e.target.value)}
        />
      </div>
    );
  }

  if (row.prop === "_tag") {
    return (
      <div className={styles.propRow}>
        <label className={styles.propLabel}>Tag</label>
        <select
          className={styles.propSelect}
          value={element.tag}
          onChange={(e) => onTagChange(e.target.value)}
        >
          {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    );
  }

  if (row.type === "attr") {
    const attrName = row.attr || row.prop.slice(1);
    return (
      <div className={styles.propRow}>
        <label className={styles.propLabel}>{row.label}</label>
        <input
          className={styles.propInput}
          value={element.attrs?.[attrName] || ""}
          placeholder={row.placeholder || ""}
          onChange={(e) => onAttrChange(attrName, e.target.value)}
        />
      </div>
    );
  }

  if (row.type === "select") {
    return (
      <div className={styles.propRow}>
        <label className={styles.propLabel}>{row.label}</label>
        <select
          className={styles.propSelect}
          value={val}
          onChange={(e) => onChange(row.prop, e.target.value)}
        >
          {row.opts.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
        </select>
      </div>
    );
  }

  if (row.type === "color") {
    return (
      <div className={styles.propRow}>
        <label className={styles.propLabel}>{row.label}</label>
        <input
          type="color"
          className={styles.propColor}
          value={toHex(val)}
          onChange={(e) => onChange(row.prop, e.target.value)}
        />
        <input
          className={styles.propInput}
          value={val}
          placeholder="#000000"
          onChange={(e) => onChange(row.prop, e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className={styles.propRow}>
      <label className={styles.propLabel}>{row.label}</label>
      <input
        className={styles.propInput}
        value={val}
        placeholder="e.g. 8px"
        onChange={(e) => onChange(row.prop, e.target.value)}
      />
    </div>
  );
}

function JavascriptTools({ element, javascript = "", onInsertJavascript }) {
  const selector = getElementSelector(element);
  const selectorLiteral = JSON.stringify(selector);
  const varName = toVarName(element.attrs?.id || element.id);
  const hasSelector = javascript.includes(selector);
  const styleObject = stylesToJsObject(element.styles);
  const snippets = [
    {
      label: "Select",
      code: `const ${varName} = document.querySelector(${selectorLiteral});`,
    },
    {
      label: "Apply",
      code: `(() => {\n  const ${varName} = document.querySelector(${selectorLiteral});\n  if (!${varName}) return;\n\n  Object.assign(${varName}.style, ${styleObject});\n})();`,
    },
    {
      label: "Reset",
      code: `(() => {\n  const ${varName} = document.querySelector(${selectorLiteral});\n  if (!${varName}) return;\n\n  ${varName}.removeAttribute("style");\n})();`,
    },
    {
      label: "Click",
      code: `(() => {\n  const ${varName} = document.querySelector(${selectorLiteral});\n  if (!${varName}) return;\n\n  ${varName}.addEventListener("click", () => {\n    ${varName}.classList.toggle("is-active");\n  });\n})();`,
    },
  ];

  return (
    <div className={styles.jsTools}>
      <div className={styles.selectorBox}>
        <span>selector</span>
        <code>{selector}</code>
      </div>
      <div className={styles.jsToolButtons}>
        {snippets.map((snippet) => (
          <button
            key={snippet.label}
            type="button"
            className={styles.jsToolBtn}
            onClick={() => onInsertJavascript(snippet.code)}
          >
            {snippet.label}
          </button>
        ))}
      </div>
      {hasSelector && (
        <div className={styles.jsLinked}>JavaScript references this element</div>
      )}
    </div>
  );
}

function getRowsForSection(section, element) {
  if (section.key !== "content") return section.rows;
  return [...section.rows, ...(TAG_ATTR_ROWS[element.tag] || [])];
}

function getElementSelector(element) {
  const htmlId = element.attrs?.id?.trim();
  if (htmlId) return `#${cssEscape(htmlId)}`;
  return `[data-lab-id="${element.id}"]`;
}

function toVarName(value) {
  const cleaned = String(value)
    .replace(/[^a-zA-Z0-9_$]+/g, " ")
    .trim()
    .replace(/\s+([a-zA-Z0-9_$])/g, (_, c) => c.toUpperCase())
    .replace(/^[^a-zA-Z_$]+/, "");
  return cleaned || "selectedElement";
}

function cssEscape(value) {
  if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(value);
  return String(value).replace(/["\\#.;:[\],>+~*='()\s]/g, "\\$&");
}

function stylesToJsObject(styles = {}) {
  const body = Object.entries(styles)
    .map(([key, value]) => `\n    ${JSON.stringify(key)}: ${JSON.stringify(value)}`)
    .join(",");
  return `{${body ? `${body}\n  ` : ""}}`;
}

// ─── Box Model Visual ─────────────────────────────────────────────────────────
function BoxModelVisual({ el }) {
  const s = el.styles;

  // Parse 4-sided shorthand or individual values
  function getSides(shorthand, top, right, bottom, left) {
    const sh = s[shorthand] || "";
    const parts = sh.trim().split(/\s+/);
    if (parts.length === 1) {
      return { t: parts[0], r: parts[0], b: parts[0], l: parts[0] };
    }
    if (parts.length === 2) {
      return { t: parts[0], r: parts[1], b: parts[0], l: parts[1] };
    }
    if (parts.length === 4) {
      return { t: parts[0], r: parts[1], b: parts[2], l: parts[3] };
    }
    return {
      t: s[top] || "0",
      r: s[right] || "0",
      b: s[bottom] || "0",
      l: s[left] || "0",
    };
  }

  const margin = getSides("margin", "marginTop", "marginRight", "marginBottom", "marginLeft");
  const padding = getSides("padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft");
  const border = s.border || "0";
  const width = s.width || "auto";
  const height = s.height || "auto";

  return (
    <div className={styles.boxModel}>
      {/* Margin layer */}
      <div className={styles.bmLayer} style={{ background: "rgba(246,178,107,0.25)", border: "1px solid rgba(246,178,107,0.6)" }}>
        <div className={styles.bmLayerLabel} style={{ color: "#c47d17" }}>margin</div>
        <div className={styles.bmTopVal} style={{ color: "#c47d17" }}>{margin.t}</div>
        <div className={styles.bmRow}>
          <span className={styles.bmSideVal} style={{ color: "#c47d17" }}>{margin.l}</span>

          {/* Border layer */}
          <div className={styles.bmLayer} style={{ background: "rgba(226,75,74,0.12)", border: "1px solid rgba(226,75,74,0.4)", flex: 1 }}>
            <div className={styles.bmLayerLabel} style={{ color: "#b91c1c" }}>border</div>
            <div className={styles.bmTopVal} style={{ color: "#b91c1c" }}>{border}</div>
            <div className={styles.bmRow}>
              <span className={styles.bmSideVal} style={{ color: "#b91c1c" }}>—</span>

              {/* Padding layer */}
              <div className={styles.bmLayer} style={{ background: "rgba(0,180,100,0.14)", border: "1px solid rgba(0,180,100,0.4)", flex: 1 }}>
                <div className={styles.bmLayerLabel} style={{ color: "#166534" }}>padding</div>
                <div className={styles.bmTopVal} style={{ color: "#166534" }}>{padding.t}</div>
                <div className={styles.bmRow}>
                  <span className={styles.bmSideVal} style={{ color: "#166534" }}>{padding.l}</span>

                  {/* Content layer */}
                  <div className={styles.bmContent}>
                    <div className={styles.bmContentTag}>&lt;{el.tag}&gt;</div>
                    <div className={styles.bmDims}>{width} × {height}</div>
                  </div>

                  <span className={styles.bmSideVal} style={{ color: "#166534" }}>{padding.r}</span>
                </div>
                <div className={styles.bmBottomVal} style={{ color: "#166534" }}>{padding.b}</div>
              </div>

              <span className={styles.bmSideVal} style={{ color: "#b91c1c" }}>—</span>
            </div>
            <div className={styles.bmBottomVal} style={{ color: "#b91c1c" }}>{border}</div>
          </div>

          <span className={styles.bmSideVal} style={{ color: "#c47d17" }}>{margin.r}</span>
        </div>
        <div className={styles.bmBottomVal} style={{ color: "#c47d17" }}>{margin.b}</div>
      </div>
    </div>
  );
}

function toHex(val) {
  if (!val) return "#000000";
  if (val.startsWith("#") && (val.length === 4 || val.length === 7)) return val;
  return "#000000";
}
