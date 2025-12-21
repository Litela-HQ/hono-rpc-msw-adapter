import type { Register } from '@kimuson/hono-rpc-msw-adapter/register';
import { type Hono } from 'hono';
import { HttpResponse, http } from 'msw';
import { getConfig } from './config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow constraint
export type ApiSchema = Register['routeType'] extends Hono<any, infer S> ? S : never;

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
  Response extends {
    status: number;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- allow for constraints
    data: {};
  } = {
    status: EndpointSchema['status'];
    data: EndpointSchema['output'];
  },
>(
  route: Route,
  method: Method,
  handler: (ctx: { input: EndpointSchema['input'] }) => Response | Promise<Response>,
) => {
  const { baseUrl } = getConfig();

  const fullUrl = concatUrl(baseUrl, route.toString());

  if (method === '$get') {
    return http.get(fullUrl, async () => {
      const response = await handler({ input: {} as EndpointSchema['input'] });

      return HttpResponse.json(response.data, {
        status: response.status,
      });
    });
  }

  if (method === '$post') {
    return http.post(fullUrl, async ({ request }) => {
      const requestData = await request.json();
      const response = await handler({
        input: { json: requestData } as EndpointSchema['input'],
      });

      return HttpResponse.json(response.data, {
        status: response.status,
      });
    });
  }

  if (method === '$put') {
    return http.put(fullUrl, async ({ request }) => {
      const requestData = await request.json();
      const response = await handler({
        input: { json: requestData } as EndpointSchema['input'],
      });

      return HttpResponse.json(response.data, {
        status: response.status,
      });
    });
  }

  if (method === '$patch') {
    return http.patch(fullUrl, async ({ request }) => {
      const requestData = await request.json();
      const response = await handler({
        input: { json: requestData } as EndpointSchema['input'],
      });

      return HttpResponse.json(response.data, {
        status: response.status,
      });
    });
  }

  if (method === '$delete') {
    return http.delete(fullUrl, async ({ request }) => {
      const requestData = await request.json();
      const response = await handler({
        input: { json: requestData } as EndpointSchema['input'],
      });

      return HttpResponse.json(response.data, {
        status: response.status,
      });
    });
  }

  throw new Error(`Method ${String(method)} not supported`);
};
