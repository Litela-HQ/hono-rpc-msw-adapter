import { type Schema, type Hono } from 'hono';
import { type HonoBase } from 'hono/hono-base';
import { HttpResponse, http } from 'msw';
import { concatUrl } from './concatUrl';
import { type IEndpoint, type HonoRpcMswAdapterConfig, type UnionToIntersection } from './types';

const defaultConfig: HonoRpcMswAdapterConfig = {
  baseUrl: '/',
};

export const createHandlerBuilder = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow constraint
  RT extends Hono<any, any, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow constraint
  NewResolution = RT extends HonoBase<any, infer S, any>
    ? S extends Record<infer K, Schema>
      ? K extends string
        ? {
            pathname: K;
            schema: S[K];
          }
        : never
      : never
    : never,
  // Resolve schema by extracting pathname and schema from NewResolution
  S = UnionToIntersection<
    NewResolution extends { pathname: infer P; schema: infer Sch }
      ? P extends string
        ? Record<P, Sch>
        : never
      : never
  >,
>() => {
  let registeredConfig: HonoRpcMswAdapterConfig = defaultConfig;

  const setConfig = (config: Partial<HonoRpcMswAdapterConfig>) => {
    registeredConfig = {
      ...defaultConfig,
      ...config,
    };
  };

  const getConfig = () => {
    return registeredConfig;
  };

  const createHandler = <
    const Route extends keyof S,
    const Method extends keyof S[Route],
    EndpointSchema extends IEndpoint = S[Route][Method] extends IEndpoint
      ? S[Route][Method]
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

  return {
    createHandler,
    setConfig,
    getConfig,
  } as const;
};
