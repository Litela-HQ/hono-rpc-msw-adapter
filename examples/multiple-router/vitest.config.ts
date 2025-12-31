import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    conditions: ['@hono-rpc-msw-adapter/src'],
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
