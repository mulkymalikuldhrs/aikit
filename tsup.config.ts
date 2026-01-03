import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'cli': 'src/cli.ts',
    'index': 'src/index.ts',
    'mcp-server': 'src/mcp-server.ts',
    // Build conversion tools separately
    'tools/drawio-convert/diagram-utils': 'src/tools/drawio-convert/diagram-utils.js',
    'tools/drawio-convert/convert-to-mermaid': 'src/tools/drawio-convert/convert-to-mermaid.js',
    'tools/drawio-convert/convert-to-drawio': 'src/tools/drawio-convert/convert-to-drawio.js',
    'tools/drawio-convert/open-diagram': 'src/tools/drawio-convert/open-diagram.js',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node18',
  splitting: false,
  shims: true,
  cjsInterop: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
