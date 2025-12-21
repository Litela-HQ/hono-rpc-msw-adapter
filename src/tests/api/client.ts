import { hc } from 'hono/client';
import { type TestAppType } from './testApp';

// Declare module augmentation for type registration
declare module '@kimuson/hono-rpc-msw-adapter/register' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- for declaration merging
  interface Register {
    routeType: TestAppType;
  }
}

export const client = hc<TestAppType>('http://localhost:3000');
