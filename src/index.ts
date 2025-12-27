import type { Register } from '@kimuson/hono-rpc-msw-adapter/register';
import { createHandlerBuilder } from './createHandlerBuilder';

/* eslint-disable @typescript-eslint(prefer-ts-expect-error), @typescript-eslint(ban-ts-comment) -- allow constraint */
// @ts-ignore - routeType should be registered by declaration merging
export const { createHandler, setConfig } = createHandlerBuilder<Register['routeType']>();
/* eslint-enable  @typescript-eslint(prefer-ts-expect-error), @typescript-eslint(ban-ts-comment) */

export type { HonoRpcMswAdapterConfig } from './types';
