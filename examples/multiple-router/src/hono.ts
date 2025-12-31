import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Post = {
  id: string;
  title: string;
  createdAt: string;
};

const posts: Post[] = [
  { id: '1', title: 'Post 1', createdAt: '2021-01-01' },
  { id: '2', title: 'Post 2', createdAt: '2021-01-02' },
];

const usersRouter = new Hono()
  .get('/:userId', (c) => {
    const userId = c.req.param('userId');
    return c.json({ userId }, 200);
  })
  .post('/', zValidator('json', z.object({ name: z.string() })), (c) => {
    const body = c.req.valid('json');
    return c.json({ id: '123', name: body.name }, 201);
  })
  .put('/:userId', zValidator('json', z.object({ name: z.string() })), (c) => {
    const userId = c.req.param('userId');
    const body = c.req.valid('json');
    return c.json({ userId, name: body.name }, 200);
  })
  .patch('/:userId', zValidator('json', z.object({ name: z.string().optional() })), (c) => {
    const userId = c.req.param('userId');
    const body = c.req.valid('json');
    return c.json({ userId, name: body.name ?? 'Updated User' }, 200);
  })
  .delete('/:userId', (c) => {
    const userId = c.req.param('userId');
    return c.json({ deleted: true, userId }, 200);
  });

const postsRouter = new Hono()
  .get('/', zValidator('query', z.object({ limit: z.string().optional() })), (c) => {
    return c.json({ posts }, 200);
  })
  .get('/:id', (c) => {
    const postId = c.req.param('id');
    const post = posts.find((post) => post.id === postId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }
    return c.json(post, 200);
  })
  .post('/', zValidator('json', z.object({ title: z.string() })), (c) => {
    const body = c.req.valid('json');
    return c.json({ id: 1, title: body.title }, 201);
  })
  .put('/:id', zValidator('json', z.object({ title: z.string() })), (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    return c.json({ id, title: body.title }, 200);
  })
  .patch('/:id', zValidator('json', z.object({ title: z.string().optional() })), (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    return c.json({ id, title: body.title ?? 'Updated' }, 200);
  })
  .delete('/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ deleted: true, id }, 200);
  });

// Edge cases router
const edgeCasesRouter = new Hono()
  // Multiple query parameters
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
  // Complex nested body
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
  );

// Nested router for multiple path parameters
const userPostsRouter = new Hono().get('/:postId', (c) => {
  const postId = c.req.param('postId');
  return c.json({ postId, title: 'User Post' }, 200);
});

const usersNestedRouter = new Hono().route('/:userId/posts', userPostsRouter);

const multipleRoutersApp = new Hono()
  // multiple routes pattern
  .route('/users', usersRouter)
  .route('/posts', postsRouter)
  .route('/api', edgeCasesRouter)
  .route('/nested', usersNestedRouter);

export type MultipleRoutersAppType = typeof multipleRoutersApp;
