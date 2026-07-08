// A single, real SQLite database (via sql.js/WASM) shared by two consumers:
// runRequest.ts's `db` bridge (what interpreted student code calls) and the
// SQL console tab (what a student can query directly, by hand, to verify
// what their JS code actually persisted). Both must see the same data, so
// this module owns exactly one lazily-created instance, memoized the same
// way SQLNotebook.jsx's own getSqlJs() loader already does for the WASM
// module itself.
const SQL_JS_CDN = "https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/sql-wasm.js";
const SQL_WASM_CDN = "https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/sql-wasm.wasm";

let sqlJsPromise: Promise<any> | null = null;
async function getSqlJs(): Promise<any> {
  if (sqlJsPromise) return sqlJsPromise;
  sqlJsPromise = (async () => {
    if (!(window as any).initSqlJs) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = SQL_JS_CDN;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load sql.js from CDN"));
        document.head.appendChild(script);
      });
    }
    return (window as any).initSqlJs({ locateFile: () => SQL_WASM_CDN });
  })();
  return sqlJsPromise;
}

let dbPromise: Promise<any> | null = null;
export async function getSharedDatabase(): Promise<any> {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    const SQL = await getSqlJs();
    const db = new SQL.Database();
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)`);
    // Credentials live in their own table, separate from `users` — a real,
    // common practice (not just a workaround): identity/profile data and
    // secret credential data are often kept apart so, for example, a query
    // that lists users for a public profile page can never accidentally
    // also select a password hash. `sessions` maps an issued token back to
    // the username it belongs to (lesson 14).
    db.run(`CREATE TABLE IF NOT EXISTS credentials (username TEXT PRIMARY KEY, password_hash TEXT NOT NULL)`);
    db.run(`CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, username TEXT NOT NULL)`);
    return db;
  })();
  return dbPromise;
}

// Runs arbitrary SQL (the SQL console tab's "Run" button) and returns a
// structured result — the exact same shape SQLNotebook.jsx's own execSql
// helper already uses, kept consistent rather than inventing a new one.
export function execSql(db: any, sql: string): { ok: true; results: any[] } | { ok: false; error: string } {
  try {
    const results = db.exec(sql.trim());
    return { ok: true, results };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
