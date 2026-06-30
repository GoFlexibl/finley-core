import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  // Provided by the consuming app — never bundle these (single React instance).
  external: ['react', 'react-dom', '@mui/material', '@mui/icons-material', 'recharts'],
});
