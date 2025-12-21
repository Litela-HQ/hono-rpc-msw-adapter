# hono-rpc-msw-adapter

Type-safe MSW (Mock Service Worker) adapter for Hono RPC.

This adapter allows you to create type-safe MSW handlers from your Hono RPC API routes, ensuring that your mocks stay in sync with your API schema.

## Features

- **Type-safe**: Leverages Hono RPC's type system for compile-time safety
- **Easy to use**: Simple API to create MSW handlers from Hono routes
- **Full HTTP method support**: GET, POST, PUT, PATCH, DELETE
- **Query parameters**: Automatic handling of query parameters for GET requests
- **JSON body parsing**: Automatic JSON body parsing with empty body support
- **Configurable**: Set base URL and other configuration options

## Installation

```bash
npm install @kimuson/hono-rpc-msw-adapter
# or
pnpm add @kimuson/hono-rpc-msw-adapter
# or
yarn add @kimuson/hono-rpc-msw-adapter
```

## Usage

### 1. Define your Hono API

```typescript
import { Hono } from 'hono';

const app = new Hono()
  .get('/users', (c) => {
    return c.json({ users: ['Alice', 'Bob'] }, 200);
  })
  .post('/users', async (c) => {
    const body = await c.req.json<{ name: string }>();
    return c.json({ id: 1, name: body.name }, 201);
  })
  .get('/posts/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ id, title: 'Test Post' }, 200);
  });

export type AppType = typeof app;
```

### 2. Register your API type

Create a declaration file (e.g., `types.d.ts`) to register your API type:

```typescript
import type { AppType } from './api';

declare module '@kimuson/hono-rpc-msw-adapter/register' {
  interface Register {
    routeType: AppType;
  }
}
```

### 3. Create MSW handlers

```typescript
import { createHandler, setConfig } from '@kimuson/hono-rpc-msw-adapter';
import { setupServer } from 'msw/node';

// Optional: Set configuration
setConfig({ baseUrl: 'http://localhost:3000' });

// Create handlers
const handlers = [
  createHandler('/users', '$get', async () => {
    return {
      status: 200,
      data: { users: ['Alice', 'Bob'] },
    };
  }),

  createHandler('/users', '$post', async ({ input }) => {
    const { name } = input.json;
    return {
      status: 201,
      data: { id: 1, name },
    };
  }),

  createHandler('/posts/:id', '$get', async () => {
    return {
      status: 200,
      data: { id: '123', title: 'Mocked Post' },
    };
  }),
];

// Setup MSW server
const server = setupServer(...handlers);
server.listen();
```

### 4. Use with Hono RPC client

```typescript
import { hc } from 'hono/client';
import type { AppType } from './api';

const client = hc<AppType>('http://localhost:3000');

// These requests will be intercepted by MSW
const response = await client.users.$get();
const data = await response.json(); // { users: ['Alice', 'Bob'] }
```

## API Reference

### `createHandler(route, method, handler)`

Creates a type-safe MSW handler for a Hono RPC route.

**Parameters:**

- `route`: The route path (e.g., `/users`, `/posts/:id`)
- `method`: The HTTP method (`$get`, `$post`, `$put`, `$patch`, `$delete`)
- `handler`: A function that returns the mock response

**Handler function parameters:**

- `input`: The request input with proper typing
  - For GET requests: `{ query: Record<string, string> }`
  - For POST/PUT/PATCH/DELETE requests: `{ json: T }` where T is the request body type

**Handler function return type:**

```typescript
{
  status: number;
  data: ResponseData;
}
```

### `setConfig(config)`

Sets the global configuration for the adapter.

**Parameters:**

- `config`: Configuration object
  - `baseUrl`: The base URL for your API (default: `/`)

### Type Registration

To enable type safety, you must register your Hono app type:

```typescript
declare module '@kimuson/hono-rpc-msw-adapter/register' {
  interface Register {
    routeType: YourHonoAppType;
  }
}
```

## Examples

### GET request with query parameters

```typescript
createHandler('/users', '$get', async ({ input }) => {
  const { limit } = input.query;
  return {
    status: 200,
    data: { users: ['Alice', 'Bob'], limit: parseInt(limit || '10', 10) },
  };
});

// Usage
await client.users.$get({ query: { limit: '5' } });
```

### POST request with JSON body

```typescript
createHandler('/users', '$post', async ({ input }) => {
  const { name } = input.json;
  return {
    status: 201,
    data: { id: 1, name },
  };
});

// Usage
await client.users.$post({ json: { name: 'Charlie' } });
```

### Route with path parameters

```typescript
createHandler('/posts/:id', '$get', async () => {
  return {
    status: 200,
    data: { id: '123', title: 'Test Post' },
  };
});

// Usage
await client.posts[':id'].$get({ param: { id: '123' } });
```

## Testing

The adapter includes comprehensive tests using Vitest:

```bash
pnpm test           # Run tests once
pnpm test:watch     # Watch mode
pnpm test:ui        # UI mode
pnpm test:coverage  # With coverage
```

## License

MIT
