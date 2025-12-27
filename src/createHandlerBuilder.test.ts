import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { hc } from 'hono/client';
import { setupServer } from 'msw/node';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import z from 'zod';
import { createHandlerBuilder } from './createHandlerBuilder';

type Post = {
  id: string;
  title: string;
  createdAt: string;
};

const posts: Post[] = [
  { id: '1', title: 'Post 1', createdAt: '2021-01-01' },
  { id: '2', title: 'Post 2', createdAt: '2021-01-02' },
];

describe('createHandler', () => {
  describe('single router', () => {
    const singleRouterApp = new Hono()
      .get('/posts', zValidator('query', z.object({ limit: z.string().optional() })), (c) => {
        return c.json({ posts }, 200);
      })
      .get('/posts/:id', (c) => {
        const postId = c.req.param('id');
        const post = posts.find((post) => post.id === postId);

        if (!post) {
          return c.json({ error: 'Post not found' }, 404);
        }
        return c.json(post, 200);
      })
      .post('/posts', zValidator('json', z.object({ title: z.string() })), (c) => {
        const body = c.req.valid('json');
        return c.json({ id: 1, title: body.title }, 201);
      })
      .put('/posts/:id', zValidator('json', z.object({ title: z.string() })), (c) => {
        const id = c.req.param('id');
        const body = c.req.valid('json');
        return c.json({ id, title: body.title }, 200);
      })
      .patch('/posts/:id', zValidator('json', z.object({ title: z.string().optional() })), (c) => {
        const id = c.req.param('id');
        const body = c.req.valid('json');
        return c.json({ id, title: body.title ?? 'Updated' }, 200);
      })
      .delete('/posts/:id', (c) => {
        const id = c.req.param('id');
        return c.json({ deleted: true, id }, 200);
      });

    type SingleRouterAppType = typeof singleRouterApp;

    const singleRouterAppClient = hc<SingleRouterAppType>('http://localhost:3000');

    const server = setupServer();

    const { createHandler, setConfig } = createHandlerBuilder<SingleRouterAppType>();

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

        const response = await singleRouterAppClient.posts.$get({
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

        const response = await singleRouterAppClient.posts[':id'].$get({ param: { id: '123' } });
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

        const response = await singleRouterAppClient.posts.$get({ query: { limit: '5' } });
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

        const response = await singleRouterAppClient.posts.$post({ json: { title: 'New Post' } });
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

        const response = await singleRouterAppClient.posts[':id'].$put({
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

        const response = await singleRouterAppClient.posts[':id'].$patch({
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

        const response = await singleRouterAppClient.posts[':id'].$delete({ param: { id: '123' } });
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

        const response = await singleRouterAppClient.posts.$get({
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

  describe('multiple routers', () => {
    const usersRouter = new Hono().get('/:userId', (c) => {
      const userId = c.req.param('userId');
      return c.json({ userId }, 200);
    });

    const postsRouter = new Hono().get(
      '/',
      zValidator('query', z.object({ limit: z.string().optional() })),
      (c) => {
        return c.json({ posts }, 200);
      },
    );

    const multipleRoutersApp = new Hono()
      // multiple routes pattern
      .route('/users', usersRouter)
      .route('/posts', postsRouter);

    type MultipleRoutersAppType = typeof multipleRoutersApp;

    const multipleRoutersAppClient = hc<MultipleRoutersAppType>('http://localhost:3000');

    const { createHandler, setConfig } = createHandlerBuilder<MultipleRoutersAppType>();

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
        const handler = createHandler('/users/:userId', '$get', () => {
          return {
            status: 200,
            output: { userId: '123' },
          };
        });

        server.use(handler);

        const response = await multipleRoutersAppClient.users[':userId'].$get({
          param: { userId: '123' },
        });
        const data = await response.json();

        expect(data).toEqual({ userId: '123' });
        expect(response.status).toBe(200);
      });
    });
  });
});
