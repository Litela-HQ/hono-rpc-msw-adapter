import { type Hono } from 'hono';
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
