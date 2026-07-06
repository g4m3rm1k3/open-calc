import * as Babel from "@babel/standalone";
import type { JsFile } from "./types";

export interface TranspileResult {
  code: string;
  error: string | null;
}

export function hasJsx(jsFiles: JsFile[]): boolean {
  return jsFiles.some((f) => f.name.toLowerCase().endsWith(".jsx"));
}

// Runs the whole concatenated bundle through Babel's JSX transform in the
// parent app — not inside the preview iframe — so the iframe only ever needs
// plain JS + the React UMD scripts, and a transpile error surfaces in this
// app's own UI instead of failing silently inside the sandboxed iframe.
// Plain `.js`-only projects skip this entirely (no jsFiles need transpiling,
// no Babel cost paid).
export function transpileBundle(bundle: string, jsFiles: JsFile[]): TranspileResult {
  if (!hasJsx(jsFiles) || !bundle.trim()) return { code: bundle, error: null };
  try {
    // `runtime: 'classic'` is required here — the default "automatic" JSX
    // runtime emits `import ... from "react/jsx-runtime"`, which needs a real
    // module bundler to resolve. React is loaded as a plain global via a UMD
    // <script> tag (see cdnLibraries.ts's reactCdnTags), so JSX must compile
    // to `React.createElement(...)` calls instead, which need no imports.
    const result = Babel.transform(bundle, { presets: [["react", { runtime: "classic" }]], filename: "bundle.jsx" });
    return { code: result.code ?? "", error: null };
  } catch (e) {
    return { code: "", error: e instanceof Error ? e.message : String(e) };
  }
}
