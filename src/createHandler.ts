import type { Register } from '@kimuson/hono-rpc-msw-adapter/register';
import { type Hono } from 'hono';
import { HttpResponse, http } from 'msw';
import { getConfig } from './config';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint(prefer-ts-expect-error), @typescript-eslint(ban-ts-comment) -- allow constraint */
// @ts-ignore - routeType should be registered by declaration merging
export type ApiSchema = Register['routeType'] extends Hono<any, infer S> ? S : never;
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint(prefer-ts-expect-error), @typescript-eslint(ban-ts-comment) */

type IEndpoint = {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- allow for constraints
  input: {};
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- allow for constraints
  output: {};
};

const concatUrl = (baseUrl: string, route: string) => {
  try {
    return new URL(route, baseUrl).href;
  } catch {
    const dummyBase = 'http://localhost:6789';
    return new URL(baseUrl + route, dummyBase).href.replace(dummyBase, '');
  }
};

export const createHandler = <
  const Route extends keyof ApiSchema,
  const Method extends keyof ApiSchema[Route],
  EndpointSchema extends IEndpoint = ApiSchema[Route][Method] extends IEndpoint
    ? ApiSchema[Route][Method]
    : never,
>(
  route: Route,
  method: Method,
  handler: (ctx: {
    input: EndpointSchema['input'];
  }) =>
    | Pick<EndpointSchema, 'status' | 'output'>
    | Promise<Pick<EndpointSchema, 'status' | 'output'>>,
) => {
  const { baseUrl } = getConfig();

  const fullUrl = concatUrl(baseUrl, route.toString());

  if (method === '$get') {
    return http.get(fullUrl, async ({ request }) => {
      const url = new URL(request.url);
      const query: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });

      const response = await handler({
        input: { query } as EndpointSchema['input'],
      });

      return HttpResponse.json(response.output, {
        status: response.status,
      });
    });
  }

  if (method === '$post') {
    return http.post(fullUrl, async ({ request }) => {
      const text = await request.text();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- JSON.parse returns any by design
      const requestData = text ? JSON.parse(text) : {};
      const response = await handler({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Type assertion is necessary for flexibility
        input: { json: requestData } as EndpointSchema['input'],
      });

      return HttpResponse.json(response.output, {
        status: response.status,
      });
    });
  }

  if (method === '$put') {
    return http.put(fullUrl, async ({ request }) => {
      const text = await request.text();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- JSON.parse returns any by design
      const requestData = text ? JSON.parse(text) : {};
      const response = await handler({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Type assertion is necessary for flexibility
        input: { json: requestData } as EndpointSchema['input'],
      });

      return HttpResponse.json(response.output, {
        status: response.status,
      });
    });
  }

  if (method === '$patch') {
    return http.patch(fullUrl, async ({ request }) => {
      const text = await request.text();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- JSON.parse returns any by design
      const requestData = text ? JSON.parse(text) : {};
      const response = await handler({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Type assertion is necessary for flexibility
        input: { json: requestData } as EndpointSchema['input'],
      });

      return HttpResponse.json(response.output, {
        status: response.status,
      });
    });
  }

  if (method === '$delete') {
    return http.delete(fullUrl, async ({ request }) => {
      const text = await request.text();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- JSON.parse returns any by design
      const requestData = text ? JSON.parse(text) : {};
      const response = await handler({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Type assertion is necessary for flexibility
        input: { json: requestData } as EndpointSchema['input'],
      });

      return HttpResponse.json(response.output, {
        status: response.status,
      });
    });
  }

  throw new Error(`Method ${String(method)} not supported`);
};
