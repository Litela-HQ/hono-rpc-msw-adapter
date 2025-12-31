import { type DefaultBodyType, HttpResponse, type StrictRequest, http } from 'msw';
import { concatUrl } from './concatUrl';
import { getConfig } from './config';
import { type IEndpoint, type SchemaType } from './types';

const parseBody = async (request: StrictRequest<DefaultBodyType>): Promise<unknown> => {
  if (request.method === 'GET') {
    return undefined;
  }

  try {
    const text = await request.text();
    const body: unknown = text ? JSON.parse(text) : {};
    return body;
  } catch {
    return {};
  }
};

const createRequestData = async (ctx: {
  request: StrictRequest<DefaultBodyType>;
  params: Record<string, string | ReadonlyArray<string> | undefined>;
}) => {
  const { request, params } = ctx;

  // query
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  // body
  return {
    query,
    param: params,
    json: await parseBody(request),
  };
};

export const createHandler = <
  const Route extends keyof SchemaType,
  const Method extends keyof SchemaType[Route],
  EndpointSchema extends IEndpoint = SchemaType[Route][Method] extends IEndpoint
    ? SchemaType[Route][Method]
    : never,
>(
  route: Route,
  method: Method,
  handler: (ctx: {
    input: EndpointSchema['input'];
    requestId: string;
    cookies: Record<string, string>;
    request: Request;
  }) =>
    | Pick<EndpointSchema, 'status' | 'output'>
    | Promise<Pick<EndpointSchema, 'status' | 'output'>>,
) => {
  const { baseUrl } = getConfig();

  const fullUrl = concatUrl(baseUrl, route.toString());

  if (method === '$get') {
    return http.get(fullUrl, async ({ request, requestId, params, cookies }) => {
      const input = await createRequestData({ request, params });

      const response = await handler({
        input: input as EndpointSchema['input'],
        requestId,
        cookies,
        request,
      });

      return HttpResponse.json(response.output, {
        status: response.status,
      });
    });
  }

  if (method === '$post') {
    return http.post(fullUrl, async ({ request, requestId, cookies, params }) => {
      const input = await createRequestData({ request, params });

      const response = await handler({
        input: input as EndpointSchema['input'],
        requestId,
        cookies,
        request,
      });

      return HttpResponse.json(response.output, {
        status: response.status,
      });
    });
  }

  if (method === '$put') {
    return http.put(fullUrl, async ({ request, requestId, cookies, params }) => {
      const input = await createRequestData({ request, params });

      const response = await handler({
        input: input as EndpointSchema['input'],
        requestId,
        cookies,
        request,
      });

      return HttpResponse.json(response.output, {
        status: response.status,
      });
    });
  }

  if (method === '$patch') {
    return http.patch(fullUrl, async ({ request, requestId, cookies, params }) => {
      const input = await createRequestData({ request, params });

      const response = await handler({
        input: input as EndpointSchema['input'],
        requestId,
        cookies,
        request,
      });

      return HttpResponse.json(response.output, {
        status: response.status,
      });
    });
  }

  if (method === '$delete') {
    return http.delete(fullUrl, async ({ request, requestId, cookies, params }) => {
      const input = await createRequestData({ request, params });

      const response = await handler({
        input: input as EndpointSchema['input'],
        requestId,
        cookies,
        request,
      });

      return HttpResponse.json(response.output, {
        status: response.status,
      });
    });
  }

  throw new Error(`Method ${String(method)} not supported`);
};
