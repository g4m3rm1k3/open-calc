import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import mapData from "../../codebase-map.json";
import styles from "./CodebaseMap.module.css";

// ── Colour + size config ──────────────────────────────────────────────────────
const TYPE_COLOR = {
  page:      "#60a5fa", // blue
  lab:       "#a78bfa", // purple
  component: "#34d399", // green
  content:   "#fbbf24", // amber
  util:      "#f87171", // red
  data:      "#94a3b8", // slate
};

const ISSUE_BORDER = {
  error:   "#ef4444",
  warning: "#f59e0b",
  info:    "#60a5fa",
  ok:      "#1e293b",
};

function buildGraph(filter) {
  const nodes = [];
  const links = [];
  const nodeIndex = {};

  function addNode(id, data) {
    if (nodeIndex[id] !== undefined) return nodeIndex[id];
    const idx = nodes.length;
    nodeIndex[id] = idx;
    nodes.push({ id, ...data });
    return idx;
  }

  // Issue lookup by file path
  const issueMap = {};
  for (const issue of mapData.summary.issues) {
    if (!issueMap[issue.file]) issueMap[issue.file] = [];
    issueMap[issue.file].push(issue);
  }

  function issueLevel(file) {
    const issues = issueMap[file] ?? [];
    if (issues.some(i => i.severity === "error"))   return "error";
    if (issues.some(i => i.severity === "warning")) return "warning";
    if (issues.some(i => i.severity === "info"))    return "info";
    return "ok";
  }

  if (!filter || filter === "pages" || filter === "all") {
    for (const p of mapData.pages) {
      addNode(p.file, {
        label: p.component,
        type: p.isLab ? "lab" : "page",
        route: p.route,
        loc: p.loc,
        issue: issueLevel(p.file),
        meta: p,
      });
    }
  }

  if (!filter || filter === "components" || filter === "all") {
    for (const c of mapData.components) {
      addNode(c.dir, {
        label: c.name,
        type: c.type,
        loc: c.loc,
        issue: issueLevel(c.dir),
        meta: c,
      });
    }
  }

  if (!filter || filter === "courses" || filter === "all") {
    for (const c of mapData.content) {
      addNode(c.dir, {
        label: c.course,
        type: "content",
        loc: c.totalFiles * 30,
        issue: c.registered ? issueLevel(c.dir) : "warning",
        complianceScore: c.complianceScore,
        registered: c.registered,
        meta: c,
      });
    }
  }

  if (!filter || filter === "utils" || filter === "all") {
    for (const u of mapData.utils) {
      addNode(u.file, {
        label: u.file.split("/").pop().replace(/\.(js|jsx)$/, ""),
        type: "util",
        loc: u.loc,
        issue: "ok",
        meta: u,
      });
    }
  }

  // Links: pages → components they import
  if (!filter || filter === "all") {
    for (const p of mapData.pages) {
      const srcIdx = nodeIndex[p.file];
      if (srcIdx === undefined) continue;
      for (const imp of p.imports ?? []) {
        for (const c of mapData.components) {
          if (imp.includes(c.name) || imp.includes(c.dir)) {
            const tgtIdx = nodeIndex[c.dir];
            if (tgtIdx !== undefined) {
              links.push({ source: srcIdx, target: tgtIdx });
            }
          }
        }
      }
    }
  }

  return { nodes, links };
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function DetailPanel({ node, onClose }) {
  if (!node) return null;
  const m = node.meta ?? {};
  const issues = (mapData.summary.issues ?? []).filter(
    i => i.file === node.id || i.file === (m.dir ?? m.file)
  );

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelType} style={{ background: TYPE_COLOR[node.type] }}>
          {node.type}
        </span>
        <span className={styles.panelTitle}>{node.label}</span>
        <button className={styles.panelClose} onClick={onClose}>✕</button>
      </div>

      <div className={styles.panelBody}>
        {node.route && <div className={styles.panelRow}><b>Route</b> <code>{node.route}</code></div>}
        {node.loc   && <div className={styles.panelRow}><b>LOC</b> {node.loc}</div>}
        {m.files    && <div className={styles.panelRow}><b>Files</b> {m.files}</div>}
        {m.totalFiles && <div className={styles.panelRow}><b>Lesson files</b> {m.lessonFiles}</div>}
        {node.complianceScore !== undefined &&
          <div className={styles.panelRow}>
            <b>Compliance</b>
            <span style={{ color: node.complianceScore < 60 ? "#f87171" : "#34d399" }}>
              {node.complianceScore}%
            </span>
          </div>
        }
        {node.registered !== undefined &&
          <div className={styles.panelRow}>
            <b>Registered</b>
            <span style={{ color: node.registered ? "#34d399" : "#f87171" }}>
              {node.registered ? "Yes" : "No — orphaned"}
            </span>
          </div>
        }

        {issues.length > 0 && (
          <div className={styles.panelIssues}>
            <b>Issues</b>
            {issues.map((iss, i) => (
              <div key={i} className={styles.panelIssue} data-severity={iss.severity}>
                [{iss.severity}] {iss.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CodebaseMap() {
  const svgRef = useRef(null);
  const simRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const draw = useCallback(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const W = svgRef.current.clientWidth || 900;
    const H = svgRef.current.clientHeight || 700;

    const { nodes, links } = buildGraph(filter);

    // Filter by search
    const activeNodes = search
      ? nodes.filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
      : nodes;
    const activeIds = new Set(activeNodes.map(n => n.id));
    const activeLinks = links.filter(
      l => activeIds.has(nodes[l.source]?.id ?? nodes[l.source?.index]?.id) &&
           activeIds.has(nodes[l.target]?.id ?? nodes[l.target?.index]?.id)
    );

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(activeNodes, n => n.loc) ?? 1])
      .range([5, 28]);

    const zoom = d3.zoom().scaleExtent([0.2, 4]).on("zoom", (e) => {
      g.attr("transform", e.transform);
    });
    svg.call(zoom);

    const g = svg.append("g");

    // Links
    const link = g.append("g").selectAll("line")
      .data(activeLinks)
      .join("line")
      .attr("stroke", "#334155")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.5);

    // Nodes
    const node = g.append("g").selectAll("g")
      .data(activeNodes)
      .join("g")
      .style("cursor", "pointer")
      .on("click", (_, d) => setSelected(d))
      .call(
        d3.drag()
          .on("start", (e, d) => {
            if (!e.active) simRef.current?.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on("end", (e, d) => {
            if (!e.active) simRef.current?.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      );

    node.append("circle")
      .attr("r", d => sizeScale(d.loc ?? 0))
      .attr("fill", d => TYPE_COLOR[d.type] ?? "#94a3b8")
      .attr("fill-opacity", 0.85)
      .attr("stroke", d => ISSUE_BORDER[d.issue ?? "ok"])
      .attr("stroke-width", d => d.issue !== "ok" ? 2.5 : 1);

    node.append("text")
      .text(d => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", d => sizeScale(d.loc ?? 0) + 11)
      .attr("font-size", 9)
      .attr("fill", "#94a3b8")
      .style("pointer-events", "none");

    // Simulation
    if (simRef.current) simRef.current.stop();
    simRef.current = d3.forceSimulation(activeNodes)
      .force("link", d3.forceLink(activeLinks).distance(80).strength(0.3))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collide", d3.forceCollide(d => sizeScale(d.loc ?? 0) + 6))
      .on("tick", () => {
        link
          .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });
  }, [filter, search]);

  useEffect(() => { draw(); return () => simRef.current?.stop(); }, [draw]);

  const filters = ["all", "pages", "components", "courses", "utils"];
  const { summary } = mapData;

  return (
    <div className={styles.root}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <span className={styles.title}>Codebase Map</span>
        <div className={styles.filters}>
          {filters.map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          className={styles.search}
          placeholder="Search nodes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.stats}>
          <span>{summary.totalPages} pages</span>
          <span>{summary.totalCourses} courses</span>
          <span className={styles.statWarn}>{summary.unregisteredCourses} unregistered</span>
          <span className={styles.statErr}>{summary.issues.filter(i=>i.severity==="error").length} errors</span>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {Object.entries(TYPE_COLOR).map(([type, color]) => (
          <span key={type} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: color }} />
            {type}
          </span>
        ))}
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: "transparent", border: "2px solid #f59e0b" }} />
          warning
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: "transparent", border: "2px solid #ef4444" }} />
          error
        </span>
      </div>

      {/* Graph */}
      <div className={styles.canvasWrap}>
        <svg ref={svgRef} className={styles.svg} />
        <DetailPanel node={selected} onClose={() => setSelected(null)} />
      </div>

      {/* Issues list */}
      <div className={styles.issueList}>
        <span className={styles.issueListTitle}>Issues ({summary.issues.length})</span>
        {summary.issues.map((iss, i) => (
          <div key={i} className={styles.issueRow} data-severity={iss.severity}>
            <span className={styles.issueBadge}>{iss.severity}</span>
            <span>{iss.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
