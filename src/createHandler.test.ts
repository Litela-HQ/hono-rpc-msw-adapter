import { createHandler, setConfig } from '@kimuson/hono-rpc-msw-adapter';
import { setupServer } from 'msw/node';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { client } from './tests/api/client';

describe('createHandler', () => {
  const server = setupServer();

  beforeEach(() => {
    setConfig({ baseUrl: 'http://localhost:3000' });
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
  });

  describe('GET requests', () => {
    it('should handle GET request without input', async () => {
      const handler = createHandler('/posts', '$get', () => {
        return {
          status: 200,
          output: {
            posts: [
              {
                id: '1',
                title: 'Test Post',
                createdAt: '2021-01-01',
              },
            ],
          },
        };
      });

      server.use(handler);

      const response = await client.posts.$get({
        query: {},
      });
      const data = await response.json();

      expect(data).toEqual({
        posts: [
          {
            id: '1',
            title: 'Test Post',
            createdAt: '2021-01-01',
          },
        ],
      });
      expect(response.status).toBe(200);
    });

    it('should handle GET request with path parameters', async () => {
      const handler = createHandler('/posts/:id', '$get', () => {
        return {
          status: 200,
          output: { id: '123', title: 'Test Post', createdAt: '2021-01-01' },
        };
      });

      server.use(handler);

      const response = await client.posts[':id'].$get({ param: { id: '123' } });
      const data = await response.json();

      expect(data).toEqual({ id: '123', title: 'Test Post', createdAt: '2021-01-01' });
      expect(response.status).toBe(200);
    });

    it('should handle GET request with query parameters', async () => {
      const handler = createHandler('/posts', '$get', ({ input }) => {
        const query = input.query;
        const limitStr = query?.limit ?? '';
        const limit = limitStr !== '' ? parseInt(limitStr, 10) : 10;
        return {
          status: 200,
          output: {
            posts: [
              { id: '1', title: 'Post 1', createdAt: '2021-01-01' },
              { id: '2', title: 'Post 2', createdAt: '2021-01-02' },
            ],
            limit,
          },
        };
      });

      server.use(handler);

      const response = await client.posts.$get({ query: { limit: '5' } });
      const data = await response.json();

      expect(data).toEqual({
        posts: [
          { id: '1', title: 'Post 1', createdAt: '2021-01-01' },
          { id: '2', title: 'Post 2', createdAt: '2021-01-02' },
        ],
        limit: 5,
      });
      expect(response.status).toBe(200);
    });
  });

  describe('POST requests', () => {
    it('should handle POST request with JSON body', async () => {
      const handler = createHandler('/posts', '$post', ({ input }) => {
        const title = (input as { json: { title: string } }).json.title;
        return {
          status: 201,
          output: { id: 1, title },
        };
      });

      server.use(handler);

      const response = await client.posts.$post({ json: { title: 'New Post' } });
      const data = await response.json();

      expect(data).toEqual({ id: 1, title: 'New Post' });
      expect(response.status).toBe(201);
    });
  });

  describe('PUT requests', () => {
    it('should handle PUT request with JSON body', async () => {
      const handler = createHandler('/posts/:id', '$put', ({ input }) => {
        const title = (input as { json: { title: string } }).json.title;
        return {
          status: 200,
          output: { id: '123', title },
        };
      });

      server.use(handler);

      const response = await client.posts[':id'].$put({
        param: { id: '123' },
        json: { title: 'Updated Title' },
      });
      const data = await response.json();

      expect(data).toEqual({ id: '123', title: 'Updated Title' });
      expect(response.status).toBe(200);
    });
  });

  describe('PATCH requests', () => {
    it('should handle PATCH request with JSON body', async () => {
      const handler = createHandler('/posts/:id', '$patch', ({ input }) => {
        const title = (input as { json: { title?: string } }).json.title;
        return {
          status: 200,
          output: { id: '123', title: title ?? 'Updated' },
        };
      });

      server.use(handler);

      const response = await client.posts[':id'].$patch({
        param: { id: '123' },
        json: { title: 'Patched Title' },
      });
      const data = await response.json();

      expect(data).toEqual({ id: '123', title: 'Patched Title' });
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE requests', () => {
    it('should handle DELETE request', async () => {
      const handler = createHandler('/posts/:id', '$delete', () => {
        return {
          status: 200,
          output: { deleted: true as const, id: '123' },
        };
      });

      server.use(handler);

      const response = await client.posts[':id'].$delete({ param: { id: '123' } });
      const data = await response.json();

      expect(data).toEqual({ deleted: true, id: '123' });
      expect(response.status).toBe(200);
    });
  });

  describe('URL handling', () => {
    it('should handle baseUrl with trailing slash', async () => {
      setConfig({ baseUrl: 'http://localhost:3000/' });

      const handler = createHandler('/posts', '$get', () => {
        return {
          status: 200,
          output: { posts: [] },
        };
      });

      server.use(handler);

      const response = await client.posts.$get({
        query: {},
      });

      expect(response.status).toBe(200);
    });

    it('should handle baseUrl without protocol', () => {
      setConfig({ baseUrl: '/api' });

      const handler = createHandler('/posts', '$get', () => {
        return {
          status: 200,
          output: { posts: [] },
        };
      });

      expect(() => handler).not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should throw error for unsupported HTTP method', () => {
      expect(() => {
        // @ts-expect-error - invalid method should be detected by type checking
        createHandler('/posts', '$options', () => {
          return {
            status: 200,
            output: {},
          };
        });
      }).toThrow('Method $options not supported');
    });
  });
});
