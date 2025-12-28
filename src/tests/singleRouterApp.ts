import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { type Post } from './types';

const posts: Post[] = [
  { id: '1', title: 'Post 1', createdAt: '2021-01-01' },
  { id: '2', title: 'Post 2', createdAt: '2021-01-02' },
];

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
  })
  // Edge cases: Multiple path parameters
  .get('/users/:userId/posts/:postId', (c) => {
    const userId = c.req.param('userId');
    const postId = c.req.param('postId');
    return c.json({ userId, postId, title: 'User Post' }, 200);
  })
  // Edge cases: Multiple query parameters
  .get(
    '/search',
    zValidator(
      'query',
      z.object({
        q: z.string(),
        limit: z.string().optional(),
        offset: z.string().optional(),
      }),
    ),
    (c) => {
      const query = c.req.valid('query');
      return c.json({ results: [], query }, 200);
    },
  )
  // Edge cases: Complex nested body
  .post(
    '/posts-with-author',
    zValidator(
      'json',
      z.object({
        title: z.string(),
        author: z.object({
          name: z.string(),
          email: z.string(),
        }),
        tags: z.array(z.string()).optional(),
      }),
    ),
    (c) => {
      const body = c.req.valid('json');
      return c.json({ id: 1, ...body }, 201);
    },
  )
  // Edge cases: Query + path params + body
  .put(
    '/posts/:id/update',
    zValidator('query', z.object({ notify: z.string().optional() })),
    zValidator('json', z.object({ title: z.string(), draft: z.boolean().optional() })),
    (c) => {
      const id = c.req.param('id');
      const query = c.req.valid('query');
      const body = c.req.valid('json');
      return c.json({ id, ...body, notified: query.notify === 'true' }, 200);
    },
  )
  // Edge cases: Empty optional body
  .patch('/posts/:id/publish', (c) => {
    const id = c.req.param('id');
    return c.json({ id, published: true }, 200);
  });

export type SingleRouterAppType = typeof singleRouterApp;
