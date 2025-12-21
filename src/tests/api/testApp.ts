import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import z from 'zod';

type Post = {
  id: string;
  title: string;
  createdAt: string;
};

const posts: Post[] = [
  { id: '1', title: 'Post 1', createdAt: '2021-01-01' },
  { id: '2', title: 'Post 2', createdAt: '2021-01-02' },
];

export const testApp = new Hono()
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

export type TestAppType = typeof testApp;
