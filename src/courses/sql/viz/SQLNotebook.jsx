// SQLNotebook.jsx
// Interactive SQL notebook using sql.js (SQLite compiled to WebAssembly).
// Pure SQL — no Python required. Results rendered as formatted tables.

import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { setupOpenCalcMonaco } from "../../../utils/monacoThemes.js";

import { useThemeColors, withAlpha } from '../../../hooks/useThemeColors';
import { useGlobalTheme } from '../../../context/ThemeContext.jsx';
// ── Theme hook ────────────────────────────────────────────────────────────────


// ── sql.js singleton loader ───────────────────────────────────────────────────
const SQL_JS_CDN =
  "https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/sql-wasm.js";
const SQL_WASM_CDN =
  "https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/sql-wasm.wasm";

let sqlJsPromise = null;
async function getSqlJs() {
  if (sqlJsPromise) return sqlJsPromise;
  sqlJsPromise = (async () => {
    if (!window.initSqlJs) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = SQL_JS_CDN;
        script.onload = resolve;
        script.onerror = () =>
          reject(new Error("Failed to load sql.js from CDN"));
        document.head.appendChild(script);
      });
    }
    return window.initSqlJs({ locateFile: () => SQL_WASM_CDN });
  })();
  return sqlJsPromise;
}

// ── Execute SQL against a db, return structured result ───────────────────────
function execSql(db, sql) {
  try {
    const results = db.exec(sql.trim());
    return { ok: true, results };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Result table renderer ─────────────────────────────────────────────────────
function ResultTable({ results, C }) {
  if (!results || results.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
        }}
      >
        <span style={{ color: C.green, fontSize: 14 }}>✓</span>
        <span style={{ color: C.muted, fontSize: 13 }}>
          Query executed — no rows returned
        </span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {results.map((result, ri) => {
        const rowCount = result.values.length;
        return (
          <div key={ri}>
            <div
              style={{
                overflowX: "auto",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.surface2,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                }}
              >
                <thead>
                  <tr style={{ background: `${C.blueBg}` }}>
                    {result.columns.map((col, ci) => (
                      <th
                        key={ci}
                        style={{
                          padding: "7px 14px",
                          textAlign: "left",
                          color: C.blue,
                          fontWeight: 600,
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          borderBottom: `1px solid ${C.border}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.values.map((row, rowi) => (
                    <tr
                      key={rowi}
                      style={{
                        background:
                          rowi % 2 === 0 ? "transparent" : `${withAlpha(C.surface, "88")}`,
                        borderBottom:
                          rowi < result.values.length - 1
                            ? `1px solid ${withAlpha(C.border, "44")}`
                            : "none",
                      }}
                    >
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          style={{
                            padding: "6px 14px",
                            color: cell === null ? C.hint : C.text,
                            fontStyle: cell === null ? "italic" : "normal",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cell === null ? "NULL" : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "4px 4px 0", color: C.muted, fontSize: 11 }}>
              {rowCount} row{rowCount !== 1 ? "s" : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Cell component ────────────────────────────────────────────────────────────
const SQLCell = React.memo(
  ({ cell, C, monacoTheme, onRun, onUpdate, isExecuting, isSetup }) => {
    const lineCount = (cell.sql || "").split("\n").length;
    const editorHeight = `${Math.min(360, Math.max(60, lineCount * 20 + 20))}px`;

    const statusColor =
      cell.status === "error"
        ? C.redBd
        : cell.status === "done"
          ? C.greenBd
          : cell.status === "running"
            ? C.tealBd
            : isSetup
              ? withAlpha(C.amberBd, "55")
              : withAlpha(C.blueBd, "44");

    const statusBg =
      cell.status === "error"
        ? `0 4px 20px ${withAlpha(C.redBd, "22")}`
        : cell.status === "done" && !isSetup
          ? `0 4px 20px ${withAlpha(C.greenBd, "18")}`
          : "none";

    return (
      <div
        style={{
          background: `${withAlpha(C.surface, "ee")}`,
          border: `1.5px solid ${statusColor}`,
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: statusBg,
          transition: "border-color .2s",
        }}
      >
        {/* ── Cell header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            background: isSetup
              ? `linear-gradient(90deg, ${C.amberBg} 0%, ${C.surface2} 100%)`
              : `linear-gradient(90deg, ${C.blueBg} 0%, ${C.surface2} 80%)`,
            borderBottom: `1px solid ${withAlpha(C.border, "44")}`,
          }}
        >
          {/* Type badge */}
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "2px 6px",
              borderRadius: 4,
              background: isSetup ? C.amberBg : C.blueBg,
              border: `1px solid ${isSetup ? C.amberBd : C.blueBd}`,
              color: isSetup ? C.amber : C.blue,
              flexShrink: 0,
            }}
          >
            {isSetup ? "setup" : "sql"}
          </span>

          <span
            style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.text }}
          >
            {cell.label || ""}
          </span>

          {/* Status indicator */}
          {cell.status === "done" && (
            <span style={{ color: C.green, fontSize: 12 }}>✓</span>
          )}
          {cell.status === "error" && (
            <span style={{ color: C.red, fontSize: 12 }}>✗</span>
          )}
          {cell.status === "running" && (
            <span
              style={{
                color: C.teal,
                fontSize: 12,
                animation: "pulse 1s infinite",
              }}
            >
              ●
            </span>
          )}

          {/* Run button */}
          <button
            onClick={() => onRun(cell.id)}
            disabled={isExecuting}
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              border: "none",
              background: isExecuting ? C.hint : isSetup ? C.amber : "#0ea5e9",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              cursor: isExecuting ? "not-allowed" : "pointer",
              flexShrink: 0,
              transition: "background .15s",
            }}
          >
            {isExecuting ? "…" : "▶ Run"}
          </button>
        </div>

        {/* ── Editor ── */}
        <div style={{ background: C.dark ? "#0c1222" : "#f8fafc" }}>
          <Editor
            height={editorHeight}
            language="sql"
            value={cell.sql}
            onChange={(val) => onUpdate(cell.id, val ?? "")}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 13,
              lineNumbers: "on",
              renderLineHighlight: "none",
              overviewRulerLanes: 0,
              padding: { top: 10, bottom: 10 },
              wordWrap: "on",
              scrollbar: { vertical: "hidden", alwaysConsumeMouseWheel: false },
              readOnly: false,
            }}
            beforeMount={(monaco) => setupOpenCalcMonaco(monaco)}
            theme={monacoTheme || (C.dark ? "open-calc-dark" : "open-calc-light")}
          />
        </div>

        {/* ── Output ── */}
        {(cell.status === "done" || cell.status === "error") && (
          <div
            style={{
              borderTop: `1px solid ${cell.status === "error" ? withAlpha(C.redBd, "44") : withAlpha(C.border, "44")}`,
              padding: "10px 12px",
              background:
                cell.status === "error" ? `${C.redBg}` : `${withAlpha(C.greenBg, "44")}`,
            }}
          >
            {cell.status === "error" ? (
              <div
                style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
              >
                <span
                  style={{
                    color: C.red,
                    fontWeight: 700,
                    flexShrink: 0,
                    fontSize: 13,
                  }}
                >
                  ✗
                </span>
                <pre
                  style={{
                    margin: 0,
                    color: C.red,
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {cell.error}
                </pre>
              </div>
            ) : (
              <ResultTable results={cell.output} C={C} />
            )}
          </div>
        )}
      </div>
    );
  },
);
SQLCell.displayName = "SQLCell";

// ── Schema sidebar ────────────────────────────────────────────────────────────
function SchemaSidebar({ db, C, refreshKey }) {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    if (!db) return;
    try {
      const res = db.exec(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
      );
      if (res.length === 0) {
        setTables([]);
        return;
      }
      const names = res[0].values.map((r) => r[0]);
      const tableInfos = names.map((name) => {
        const cols = db.exec(`PRAGMA table_info("${name}")`);
        const columns =
          cols.length > 0
            ? cols[0].values.map((r) => ({
                name: r[1],
                type: r[2],
                pk: r[5] === 1,
              }))
            : [];
        return { name, columns };
      });
      setTables(tableInfos);
    } catch {
      setTables([]);
    }
  }, [db, refreshKey]);

  if (tables.length === 0) return null;

  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        overflow: "hidden",
        background: C.surface2,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          padding: "7px 12px",
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: C.muted,
        }}
      >
        Schema
      </div>
      <div
        style={{
          padding: "8px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {tables.map((t) => (
          <div key={t.name}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.teal,
                marginBottom: 2,
              }}
            >
              📋 {t.name}
            </div>
            <div
              style={{
                paddingLeft: 16,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {t.columns.map((col) => (
                <div
                  key={col.name}
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {col.pk ? "🔑 " : "  "}
                  {col.name}
                  <span style={{ color: C.hint }}> {col.type}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SQLNotebook({
  params,
  onParamChange,
  initialCells: initialCellsProp = [],
}) {
  const initialCells = params?.initialCells ?? initialCellsProp;
  const C = useThemeColors();
  const { themeStyles } = useGlobalTheme();
  const monacoTheme = themeStyles?.monaco || (C.dark ? "open-calc-dark" : "open-calc-light");
  const dbRef = useRef(null);
  const SQLRef = useRef(null);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [executing, setExecuting] = useState(null);
  const [schemaKey, setSchemaKey] = useState(0);

  const [cells, setCells] = useState(() =>
    initialCells.map((c) => ({
      ...c,
      sql: c.sql ?? "",
      status: "idle",
      output: null,
      error: null,
    })),
  );

  // ── Create a fresh DB and run all setup cells ─────────────────────────────
  const initDb = useCallback(
    async (SQL) => {
      const db = new SQL.Database();
      dbRef.current = db;

      const setupCells = initialCells.filter((c) => c.setup);
      for (const sc of setupCells) {
        const { ok, error } = execSql(db, sc.sql);
        if (!ok) {
          setDbError(`Setup failed for "${sc.label || sc.id}": ${error}`);
          return false;
        }
      }
      return true;
    },
    [initialCells],
  );

  // ── Boot ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    getSqlJs()
      .then(async (SQL) => {
        SQLRef.current = SQL;
        const ok = await initDb(SQL);
        if (ok) {
          // Mark setup cells as done
          setCells((prev) =>
            prev.map((c) =>
              c.setup ? { ...c, status: "done", output: [], error: null } : c,
            ),
          );
          setDbReady(true);
          setSchemaKey((k) => k + 1);
        }
      })
      .catch((e) => setDbError(e.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Run a single cell ──────────────────────────────────────────────────────
  const runCell = useCallback(
    (cellId) => {
      if (!dbRef.current || executing) return;
      const cell = cells.find((c) => c.id === cellId);
      if (!cell) return;

      setExecuting(cellId);
      setCells((prev) =>
        prev.map((c) =>
          c.id === cellId
            ? { ...c, status: "running", output: null, error: null }
            : c,
        ),
      );

      // sql.js exec is synchronous — use setTimeout to let React paint "running" state
      setTimeout(() => {
        const { ok, results, error } = execSql(dbRef.current, cell.sql);
        setCells((prev) =>
          prev.map((c) =>
            c.id === cellId
              ? {
                  ...c,
                  status: ok ? "done" : "error",
                  output: ok ? results : null,
                  error: ok ? null : error,
                }
              : c,
          ),
        );
        setExecuting(null);
        setSchemaKey((k) => k + 1);
      }, 20);
    },
    [cells, executing],
  );

  // ── Run All (reset + re-run everything) ───────────────────────────────────
  const runAll = useCallback(async () => {
    if (!SQLRef.current || executing) return;
    const SQL = SQLRef.current;

    // Fresh DB
    const db = new SQL.Database();
    dbRef.current = db;

    const newCells = [...cells];
    for (let i = 0; i < newCells.length; i++) {
      const cell = newCells[i];
      newCells[i] = { ...cell, status: "running", output: null, error: null };
      setCells([...newCells]);

      // Small delay to show running state per cell
      await new Promise((r) => setTimeout(r, 20));

      const { ok, results, error } = execSql(db, cell.sql);
      newCells[i] = {
        ...cell,
        status: ok ? "done" : "error",
        output: ok ? results : null,
        error: ok ? null : error,
      };
      setCells([...newCells]);
    }
    setSchemaKey((k) => k + 1);
  }, [cells, executing]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(async () => {
    if (!SQLRef.current) return;
    setCells((prev) =>
      prev.map((c) => ({ ...c, status: "idle", output: null, error: null })),
    );
    await initDb(SQLRef.current);
    setCells((prev) =>
      prev.map((c) =>
        c.setup ? { ...c, status: "done", output: [], error: null } : c,
      ),
    );
    setSchemaKey((k) => k + 1);
  }, [initDb]);

  // ── Update cell SQL ────────────────────────────────────────────────────────
  const updateCell = useCallback((cellId, sql) => {
    setCells((prev) => prev.map((c) => (c.id === cellId ? { ...c, sql } : c)));
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: C.bg,
        borderRadius: 12,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flex: 1,
          }}
        >
          <span style={{ fontSize: 14 }}>🗄️</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: dbReady ? C.teal : C.muted,
              letterSpacing: "0.05em",
            }}
          >
            {!dbReady && !dbError
              ? "Loading SQLite…"
              : dbError
                ? "Error"
                : "SQLite · In-Browser"}
          </span>
          {dbReady && (
            <span
              style={{
                fontSize: 10,
                color: C.hint,
                background: C.surface2,
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                padding: "1px 6px",
              }}
            >
              sql.js 1.12.0
            </span>
          )}
        </div>

        {dbReady && (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={reset}
              disabled={!!executing}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: C.surface,
                color: C.muted,
                fontSize: 11,
                fontWeight: 600,
                cursor: executing ? "not-allowed" : "pointer",
              }}
            >
              ↺ Reset
            </button>
            <button
              onClick={runAll}
              disabled={!!executing}
              style={{
                padding: "5px 14px",
                borderRadius: 6,
                border: "none",
                background: executing ? C.hint : "#0ea5e9",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                cursor: executing ? "not-allowed" : "pointer",
              }}
            >
              ▶▶ Run All
            </button>
          </div>
        )}
      </div>

      {/* ── DB Error ── */}
      {dbError && (
        <div
          style={{
            padding: "12px 16px",
            background: C.redBg,
            border: `1px solid ${C.redBd}`,
            borderRadius: 8,
            color: C.red,
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          <strong>Failed to initialize:</strong> {dbError}
        </div>
      )}

      {/* ── Loading ── */}
      {!dbReady && !dbError && (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            color: C.muted,
            fontSize: 13,
          }}
        >
          Loading SQLite engine…
        </div>
      )}

      {/* ── Schema sidebar ── */}
      {dbReady && (
        <SchemaSidebar db={dbRef.current} C={C} refreshKey={schemaKey} />
      )}

      {/* ── Cells ── */}
      {dbReady && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cells.map((cell) => (
            <SQLCell
              key={cell.id}
              cell={cell}
              C={C}
              monacoTheme={monacoTheme}
              onRun={runCell}
              onUpdate={updateCell}
              isExecuting={executing === cell.id}
              isSetup={!!cell.setup}
            />
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      {dbReady && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: `1px solid ${C.border}`,
            fontSize: 11,
            color: C.hint,
            textAlign: "center",
          }}
        >
          SQLite · WebAssembly · Shift+Enter to run · Reset clears all data
        </div>
      )}
    </div>
  );
}
