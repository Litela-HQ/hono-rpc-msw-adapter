# @kimuson/hono-rpc-msw-adapter

## Usage

```typescript
// src/lib/client.ts
import type { RouteType } from "/path/to/server";
import { hc } from "hono/client";
import { setConfig } from '@kimuson/hono-rpc-msw-adapter';

declare module '@kimuson/hono-rpc-msw-adapter/types' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- for declaration merging
  interface Register {
    apiSchema: RouteType;
  }
}

const baseUrl = 'http://localhost:6789'

setConfig({
  baseUrl,
})

export const honoClient = hc<RouteType>(baseUrl);
```

```typescript
// src/path/to/mock.ts
import { createHandler } from '@kimuson/hono-rpc-msw-adapter';

export const getProjectsHandler = createHandler(
  "/projects" /* only accept registered path */,
  "$get", /* only accept registered method */
  () => ({
    // only accept response type that is defined in the schema
    status: 200,
    data: {
      success: true,
    },
  })
);
```
