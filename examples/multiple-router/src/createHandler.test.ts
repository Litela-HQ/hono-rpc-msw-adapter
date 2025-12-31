import { createHandler } from '@kimuson/hono-rpc-msw-adapter';
import { setupServer } from 'msw/node';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { client } from './client';

describe('createHandler', () => {
  const server = setupServer();

  beforeEach(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
  });

  describe('GET requests', () => {
    it('should handle GET request with path parameters', async () => {
      const handler = createHandler('/users/:userId', '$get', () => {
        return {
          status: 200,
          output: { userId: '123' },
        };
      });

      server.use(handler);

      const response = await client.users[':userId'].$get({
        param: { userId: '123' },
      });
      const data = await response.json();

      expect(data).toEqual({ userId: '123' });
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

    it('should handle GET request for posts with path parameters', async () => {
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
  });

  describe('POST requests', () => {
    it('should handle POST request with JSON body for users', async () => {
      const handler = createHandler('/users', '$post', ({ input }) => {
        const name = (input as { json: { name: string } }).json.name;
        return {
          status: 201,
          output: { id: '123', name },
        };
      });

      server.use(handler);

      const response = await client.users.$post({ json: { name: 'John Doe' } });
      const data = await response.json();

      expect(data).toEqual({ id: '123', name: 'John Doe' });
      expect(response.status).toBe(201);
    });

    it('should handle POST request with JSON body for posts', async () => {
      const handler = createHandler('/posts', '$post', ({ input }) => {
        const title = (input as { json: { title: string } }).json.title;
        return {
          status: 201,
          output: { id: 1, title },
        };
      });

      server.use(handler);

      const response = await client.posts.$post({
        json: { title: 'New Post' },
      });
      const data = await response.json();

      expect(data).toEqual({ id: 1, title: 'New Post' });
      expect(response.status).toBe(201);
    });
  });

  describe('PUT requests', () => {
    it('should handle PUT request with JSON body for users', async () => {
      const handler = createHandler('/users/:userId', '$put', ({ input }) => {
        const name = (input as { json: { name: string } }).json.name;
        return {
          status: 200,
          output: { userId: '123', name },
        };
      });

      server.use(handler);

      const response = await client.users[':userId'].$put({
        param: { userId: '123' },
        json: { name: 'Updated Name' },
      });
      const data = await response.json();

      expect(data).toEqual({ userId: '123', name: 'Updated Name' });
      expect(response.status).toBe(200);
    });

    it('should handle PUT request with JSON body for posts', async () => {
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
    it('should handle PATCH request with JSON body for users', async () => {
      const handler = createHandler('/users/:userId', '$patch', ({ input }) => {
        const name = (input as { json: { name?: string } }).json.name;
        return {
          status: 200,
          output: { userId: '123', name: name ?? 'Updated User' },
        };
      });

      server.use(handler);

      const response = await client.users[':userId'].$patch({
        param: { userId: '123' },
        json: { name: 'Patched Name' },
      });
      const data = await response.json();

      expect(data).toEqual({ userId: '123', name: 'Patched Name' });
      expect(response.status).toBe(200);
    });

    it('should handle PATCH request with JSON body for posts', async () => {
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
    it('should handle DELETE request for users', async () => {
      const handler = createHandler('/users/:userId', '$delete', () => {
        return {
          status: 200,
          output: { deleted: true as const, userId: '123' },
        };
      });

      server.use(handler);

      const response = await client.users[':userId'].$delete({
        param: { userId: '123' },
      });
      const data = await response.json();

      expect(data).toEqual({ deleted: true, userId: '123' });
      expect(response.status).toBe(200);
    });

    it('should handle DELETE request for posts', async () => {
      const handler = createHandler('/posts/:id', '$delete', () => {
        return {
          status: 200,
          output: { deleted: true as const, id: '123' },
        };
      });

      server.use(handler);

      const response = await client.posts[':id'].$delete({
        param: { id: '123' },
      });
      const data = await response.json();

      expect(data).toEqual({ deleted: true, id: '123' });
      expect(response.status).toBe(200);
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple query parameters', async () => {
      const handler = createHandler('/api/search', '$get', ({ input }) => {
        const query = input.query as { q: string; limit?: string; offset?: string };
        return {
          status: 200,
          output: { results: [], query },
        };
      });

      server.use(handler);

      const response = await client.api.search.$get({
        query: { q: 'test', limit: '10', offset: '5' },
      });
      const data = await response.json();

      expect(data).toEqual({
        results: [],
        query: { q: 'test', limit: '10', offset: '5' },
      });
      expect(response.status).toBe(200);
    });

    it('should handle complex nested body', async () => {
      const handler = createHandler('/api/posts-with-author', '$post', ({ input }) => {
        const body = (
          input as {
            json: {
              title: string;
              author: { name: string; email: string };
              tags?: string[];
            };
          }
        ).json;
        return {
          status: 201,
          output: { id: 1, ...body },
        };
      });

      server.use(handler);

      const response = await client.api['posts-with-author'].$post({
        json: {
          title: 'New Post',
          author: { name: 'John Doe', email: 'john@example.com' },
          tags: ['tech', 'programming'],
        },
      });
      const data = await response.json();

      expect(data).toEqual({
        id: 1,
        title: 'New Post',
        author: { name: 'John Doe', email: 'john@example.com' },
        tags: ['tech', 'programming'],
      });
      expect(response.status).toBe(201);
    });

    it('should handle nested routers with multiple path parameters', async () => {
      const handler = createHandler('/nested/:userId/posts/:postId', '$get', ({ input }) => {
        const postId = (input as { param: { postId: string } }).param.postId;
        return {
          status: 200,
          output: { postId, title: 'User Post' },
        };
      });

      server.use(handler);

      const response = await client.nested[':userId'].posts[':postId'].$get({
        param: { userId: 'u123', postId: 'p456' },
      });
      const data = await response.json();

      expect(data).toEqual({ postId: 'p456', title: 'User Post' });
      expect(response.status).toBe(200);
    });
  });
});
