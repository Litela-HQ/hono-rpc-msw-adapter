# hono-rpc-msw-adapter

A lightweight library for creating type-safe MSW mock handlers for endpoints accessible via Hono RPC.

While Hono's official RPC feature enables type-safe resource access from the frontend, it doesn't provide a way to register MSW mocks in a type-safe manner. This library fills that gap.

## Installation

GitHub Packages requires authentication, including for public npm packages. Create a classic personal access token with the `read:packages` scope, then add the following configuration to your user-level `~/.npmrc`:

```ini
@litela-hq:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

Set the token in your environment and install the package:

```bash
export GITHUB_PACKAGES_TOKEN=YOUR_TOKEN
pnpm add @litela-hq/hono-rpc-msw-adapter
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
import { setConfig } from '@litela-hq/hono-rpc-msw-adapter';
import type { AppType } from '/path/to/api';

const baseUrl = 'http://localhost:3000'

// for msw adapter
setConfig({ baseUrl });
declare module '@litela-hq/hono-rpc-msw-adapter/register' {
  interface Register {
    routeType: AppType;
  }
}

// hono client
export const client = hc<AppType>(baseUrl);
```

The `declare module` statement registers your API type with `@litela-hq/hono-rpc-msw-adapter`. This enables declaration merging of the API type, allowing the library to provide type-safe handler generation based on your API schema.

### 3. Create MSW handlers

```typescript
import { createHandler } from '@litela-hq/hono-rpc-msw-adapter';
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

## Publishing

Releases are prepared with release-it:

```bash
pnpm exec release-it
```

Pushing the generated `v*` tag triggers the publish workflow. The workflow verifies that the tag matches the version in `package.json`, runs all checks, builds the package, and publishes it to GitHub Packages using the repository's `GITHUB_TOKEN`. Stable versions use the `latest` distribution tag, while prerelease versions use `next`.

After the first publish, verify the visibility in the package settings under the Litela-HQ organization. If it is not **Public**, an organization owner must change it to Public. GitHub does not allow a public package to be changed back to private.

## Development

Enter the Nix development shell to use the project-compatible Node.js and pnpm versions:

```bash
nix develop
pnpm install --frozen-lockfile
```

Alternatively, run `direnv allow` to load the same environment automatically.

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
