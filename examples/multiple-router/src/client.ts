import { setConfig } from '@kimuson/hono-rpc-msw-adapter';
import { hc } from 'hono/client';
import { type MultipleRoutersAppType } from './hono';

setConfig({ baseUrl: 'http://localhost:3000' });

declare module '@kimuson/hono-rpc-msw-adapter/register' {
  // eslint-disable-next-line typescript-eslint(consistent-type-definitions)
  interface Register {
    routeType: MultipleRoutersAppType;
  }
}

export const client = hc<MultipleRoutersAppType>('http://localhost:3000');
