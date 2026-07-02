import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: false,
  minify: false,
  splitting: false,
  treeshake: true,
  target: 'es2020',
  // Allow importing the .js engine source from index.ts
  esbuildOptions(options) {
    options.allowOverwrite = true
  },
})
