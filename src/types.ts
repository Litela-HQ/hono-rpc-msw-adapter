import { type Register } from '@litela-hq/hono-rpc-msw-adapter/register';
import { type Hono } from 'hono';
import { type HonoBase } from 'hono/hono-base';
import { type MergeSchemaPath, type Schema } from 'hono/types';

export type HonoRpcMswAdapterConfig = {
  baseUrl: string;
};

export type IEndpoint = {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- allow for constraints
  input: {};
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- allow for constraints
  output: {};
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow constraint
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type ResolveMergedSchema<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow constraint
  [T] extends [Hono<any, MergeSchemaPath<infer I, infer Base>, any>]
    ? I extends Schema
      ? Schema extends I
        ? never
        : { i: I; base: Base }
      : never
    : never;

export type IsNever<T> = [T] extends [never] ? true : false;

// eslint-disable-next-line typescript-eslint(prefer-ts-expect-error), typescript-eslint(ban-ts-comment) -- ts-ignore required for multiple tsconfig checks
// @ts-ignore -- should be registered by declaration merging
export type RouteType = Register['routeType'];

export type SchemaType = UnionToIntersection<
  // eslint-disable-next-line typescript-eslint(no-explicit-any) -- allow constraint
  RouteType extends HonoBase<any, infer S, any>
    ? S extends Record<infer K, Schema>
      ? K extends string
        ? Record<K, S[K]>
        : never
      : never
    : never
>;
