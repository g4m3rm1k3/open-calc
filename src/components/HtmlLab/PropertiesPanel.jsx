import { useState, useRef, useEffect } from "react";
import styles from "./HtmlLab.module.css";
import { COMPONENT_PRESETS, PROP_PRESETS, BREAKPOINTS, CSS_PROPS_LIST } from "./styleLibrary";

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
    key: "styleLibrary",
    title: "Style Library",
    rows: [],
    special: "styleLibrary",
  },
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
  {
    key: "mediaQueries",
    title: "Media Queries",
    rows: [],
    special: "mediaQueries",
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
  onApplyPreset,
  onAddMediaQuery,
  onRemoveMediaQuery,
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
                {sec.special === "styleLibrary" ? (
                  <StyleLibrarySection onApplyPreset={onApplyPreset} />
                ) : sec.special === "boxmodel" ? (
                  <BoxModelVisual el={element} />
                ) : sec.special === "javascript" ? (
                  <JavascriptTools
                    element={element}
                    javascript={javascript}
                    onInsertJavascript={onInsertJavascript}
                  />
                ) : sec.special === "mediaQueries" ? (
                  <MediaQueriesSection
                    element={element}
                    onAddMediaQuery={onAddMediaQuery}
                    onRemoveMediaQuery={onRemoveMediaQuery}
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!pickerOpen) return;
    function handleOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [pickerOpen]);

  const presets = PROP_PRESETS[row.prop] || null;

  const pickerBtn = presets ? (
    <div className={styles.pickerWrap} ref={pickerRef}>
      <button
        type="button"
        className={styles.pickerBtn}
        title="Show presets"
        onClick={() => setPickerOpen((o) => !o)}
      >
        ▾
      </button>
      {pickerOpen && (
        <div className={styles.pickerList}>
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.pickerItem} ${val === p ? styles.pickerItemActive : ""}`}
              onClick={() => {
                onChange(row.prop, p);
                setPickerOpen(false);
              }}
            >
              {row.prop === "backgroundColor" || row.prop === "color" || row.prop === "border" ? (
                <span
                  className={styles.pickerSwatch}
                  style={{ background: p === "none" || p === "transparent" ? "transparent" : (row.prop === "border" ? p.split(" ").slice(-1)[0] : p), border: "1px solid #555" }}
                />
              ) : null}
              <span>{p}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  ) : null;

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
        {pickerBtn}
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
      {pickerBtn}
    </div>
  );
}

// ─── Style Library Section ────────────────────────────────────────────────────
function StyleLibrarySection({ onApplyPreset }) {
  const [selected, setSelected] = useState("");
  const [applied, setApplied] = useState(false);

  const preset = COMPONENT_PRESETS.find((p) => p.key === selected);

  const handleApply = () => {
    if (!preset) return;
    onApplyPreset(preset.styles);
    setApplied(true);
    setTimeout(() => setApplied(false), 800);
  };

  // Group presets by category
  const categories = [...new Set(COMPONENT_PRESETS.map((p) => p.category))];

  return (
    <div className={styles.slibSection}>
      <div className={styles.slibHint}>
        Pick a component style and apply it to the selected element.
      </div>
      <div className={styles.slibRow}>
        <select
          className={styles.propSelect}
          value={selected}
          onChange={(e) => { setSelected(e.target.value); setApplied(false); }}
        >
          <option value="">— choose preset —</option>
          {categories.map((cat) => (
            <optgroup key={cat} label={cat}>
              {COMPONENT_PRESETS.filter((p) => p.category === cat).map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {preset && (
        <div className={styles.slibPreview}>
          {Object.entries(preset.styles).map(([k, v]) => (
            <div key={k} className={styles.slibPreviewRow}>
              <span className={styles.slibPreviewProp}>{k.replace(/([A-Z])/g, "-$1").toLowerCase()}</span>
              <span className={styles.slibPreviewVal}>{v}</span>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        className={`${styles.slibApplyBtn} ${applied ? styles.slibApplyBtnDone : ""}`}
        disabled={!preset}
        onClick={handleApply}
      >
        {applied ? "✓ Applied" : "Apply Preset"}
      </button>
    </div>
  );
}

// ─── Media Queries Section ────────────────────────────────────────────────────
function MediaQueriesSection({ element, onAddMediaQuery, onRemoveMediaQuery }) {
  const [bp, setBp] = useState("768px");
  const [customBp, setCustomBp] = useState("");
  const [prop, setProp] = useState("");
  const [value, setValue] = useState("");

  const effectiveBp = bp === "" ? customBp.trim() : bp;
  const propPresets = prop && PROP_PRESETS[prop] ? PROP_PRESETS[prop] : null;
  const mqList = element.mediaQueries || [];

  const handleAdd = () => {
    if (!effectiveBp || !prop.trim() || !value.trim()) return;
    onAddMediaQuery({ breakpoint: effectiveBp, prop: prop.trim(), value: value.trim() });
    setProp("");
    setValue("");
  };

  return (
    <div className={styles.mqSection}>
      <div className={styles.mqBuilderLabel}>Breakpoint (min-width)</div>
      <div className={styles.mqRow}>
        <select
          className={styles.propSelect}
          value={bp}
          onChange={(e) => setBp(e.target.value)}
        >
          {BREAKPOINTS.map((b) => (
            <option key={b.label} value={b.value}>{b.label}</option>
          ))}
        </select>
        {bp === "" && (
          <input
            className={styles.propInput}
            value={customBp}
            placeholder="e.g. 900px"
            onChange={(e) => setCustomBp(e.target.value)}
          />
        )}
      </div>

      <div className={styles.mqBuilderLabel}>Property</div>
      <div className={styles.mqRow}>
        <input
          className={styles.propInput}
          list="mq-css-props"
          value={prop}
          placeholder="e.g. flexDirection"
          onChange={(e) => { setProp(e.target.value); setValue(""); }}
        />
        <datalist id="mq-css-props">
          {CSS_PROPS_LIST.map((p) => <option key={p} value={p} />)}
        </datalist>
      </div>

      <div className={styles.mqBuilderLabel}>Value</div>
      <div className={styles.mqRow}>
        {propPresets ? (
          <select
            className={styles.propSelect}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          >
            <option value="">— pick or type below —</option>
            {propPresets.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        ) : null}
        <input
          className={styles.propInput}
          value={value}
          placeholder="e.g. column"
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      <button
        type="button"
        className={styles.mqAddBtn}
        disabled={!effectiveBp || !prop.trim() || !value.trim()}
        onClick={handleAdd}
      >
        + Add Rule
      </button>

      {mqList.length > 0 && (
        <div className={styles.mqRuleList}>
          {mqList.map((mq, i) => (
            <div key={i} className={styles.mqRule}>
              <div className={styles.mqRuleText}>
                <span className={styles.mqRuleBp}>@{mq.breakpoint}</span>
                <span className={styles.mqRuleProp}>{mq.prop.replace(/([A-Z])/g, "-$1").toLowerCase()}</span>
                <span className={styles.mqRuleVal}>{mq.value}</span>
              </div>
              <button
                type="button"
                className={styles.mqRuleDel}
                onClick={() => onRemoveMediaQuery(i)}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
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
