import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";

function emitVersionJson() {
  return {
    name: "emit-version-json",
    generateBundle() {
      const v = createHash("sha1").update(Date.now().toString()).digest("hex").slice(0, 10);
      this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ v }) });
    },
  };
}

// Dev-only: file system API so the in-browser editors can read/write src files
function devFsPlugin() {
  return {
    name: "dev-fs-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api/dev-fs")) return next();
        const url = new URL(req.url, "http://localhost");
        const action = url.pathname.replace("/api/dev-fs/", "").replace("/api/dev-fs", "");
        const root = process.cwd();

        const json = (data, status = 200) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
        };

        try {
          if (action === "list" && req.method === "GET") {
            const dir = url.searchParams.get("dir") || "src/courses/geometry/diagrams";
            // Comma-separated extensions, e.g. "jsx,js" — defaults to "svg"
            // so existing callers (ScratchPad) are unaffected.
            const exts = (url.searchParams.get("ext") || "svg").split(",").map(e => e.trim().replace(/^\./, ""));
            const absDir = path.resolve(root, dir);
            if (!absDir.startsWith(root)) return json({ error: "Forbidden" }, 403);
            const files = fs.existsSync(absDir)
              ? fs.readdirSync(absDir).filter(f => exts.some(e => f.endsWith(`.${e}`))).map(f => ({ name: f, path: `${dir}/${f}` }))
              : [];
            return json(files);

          } else if (action === "read" && req.method === "GET") {
            const filePath = url.searchParams.get("path") || "";
            const absPath = path.resolve(root, filePath);
            if (!absPath.startsWith(root)) return json({ error: "Forbidden" }, 403);
            const content = fs.readFileSync(absPath, "utf-8");
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            return res.end(content);

          } else if (action === "write" && req.method === "POST") {
            let body = "";
            req.on("data", d => (body += d));
            req.on("end", () => {
              try {
                const { filePath, content } = JSON.parse(body);
                const absPath = path.resolve(root, filePath);
                if (!absPath.startsWith(root)) return json({ error: "Forbidden" }, 403);
                fs.mkdirSync(path.dirname(absPath), { recursive: true });
                fs.writeFileSync(absPath, content, "utf-8");
                json({ ok: true });
              } catch (e) {
                json({ error: e.message }, 500);
              }
            });
          } else {
            next();
          }
        } catch (e) {
          json({ error: e.message }, 500);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), emitVersionJson(), devFsPlugin()],
  base: process.env.VITE_BASE_URL ?? (process.env.ELECTRON_BUILD ? "./" : "/"),
  build: {
    outDir: "dist",
    reportCompressedSize: false,
    contentHash: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "d3-vendor": ["d3"],
          "three-vendor": ["three"],
          "katex-vendor": ["katex"],
        },
      },
    },
  },
});
