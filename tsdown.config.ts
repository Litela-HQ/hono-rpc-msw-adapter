import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts', './src/register.ts'],
  platform: 'node',
  format: {
    esm: {
      target: ['es2015'],
    },
    cjs: {
      target: ['node20'],
    },
  },
  outDir: 'dist',
  clean: true,
  minify: true,
});
