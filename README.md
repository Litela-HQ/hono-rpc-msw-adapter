# hono-rpc-msw-adapter

A lightweight library for creating type-safe MSW mock handlers for endpoints accessible via Hono RPC.

While Hono's official RPC feature enables type-safe resource access from the frontend, it doesn't provide a way to register MSW mocks in a type-safe manner. This library fills that gap.

## Installation

```bash
pnpm add @kimuson/hono-rpc-msw-adapter
```

## Usage

### 1. Define your Hono API with schema

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';

const app = new Hono()
  .get('/posts', zValidator('query', z.object({ limit: z.string().optional() })), (c) => {
    return c.json({ posts: ['Post 1', 'Post 2'] }, 200);
  })

export type AppType = typeof app;
```

### 2. Create a Hono Client and register API type for msw adapter

```typescript
// path/to/api/client.ts
import { hc } from 'hono/client';
import { setConfig } from '@kimuson/hono-rpc-msw-adapter';
import type { AppType } from '/path/to/api';

const baseUrl = 'http://localhost:3000'

// for msw adapter
setConfig({ baseUrl });
declare module '@kimuson/hono-rpc-msw-adapter/register' {
  interface Register {
    routeType: AppType;
  }
}

// hono client
export const client = hc<AppType>(baseUrl);
```

The `declare module` statement registers your API type with `@kimuson/hono-rpc-msw-adapter`. This enables declaration merging of the API type, allowing the library to provide type-safe handler generation based on your API schema.

### 3. Create MSW handlers

```typescript
import { createHandler } from '@kimuson/hono-rpc-msw-adapter';
import { setupServer } from 'msw/node';

export const postsHandler = createHandler(
  '/posts',
  '$get',
  async ({ input }) => {
    return {
      status: 200,
      output: { posts: ['Post 1', 'Post 2'] },
    };
  },
);
```

The `createHandler` function is fully type-safe and only accepts endpoints that actually exist in your API (e.g., `/posts` in the example above).

It also validates HTTP methods, ensuring only defined methods are accepted. The handler implementation receives typed `input` for building your mock, and the return value must satisfy the response schema type.

The resulting `postsHandler` is a ready-to-use MSW handler that can be registered with `server.use()` in a properly configured MSW setup.

For MSW configuration details, please refer to the MSW documentation.

## API

### Handler Callback

The handler callback receives the following context:

- `input`: Type-safe query params, path params, and body data
- `requestId`: Request ID
- `cookies`: Request cookies
- `request`: Request object

### setConfig

Call the `setConfig` function to configure global settings.

Available options:

- `baseUrl`: The base URL for requests. This should match the URL configured for your Hono client.

## License

MIT
