import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createHash } from "crypto";

function emitVersionJson() {
  return {
    name: "emit-version-json",
    generateBundle() {
      const v = createHash("sha1").update(Date.now().toString()).digest("hex").slice(0, 10);
      this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ v }) });
    },
  };
}

export default defineConfig({
  plugins: [react(), emitVersionJson()],
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
