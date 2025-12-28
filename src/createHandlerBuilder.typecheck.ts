import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
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

createHandlerBuilder<SingleRouterAppType>().createHandler(
  // @ts-expect-error -- non-exists route should be detected by type checking
  '/non-exists',
  '$get',
  () => {
    return {
      status: 200,
      output: { message: 'Hello, world!' },
    };
  },
);

createHandlerBuilder<MultipleRoutersAppType>().createHandler(
  // @ts-expect-error -- non-exists route should be detected by type checking
  '/non-exists',
  '$get',
  () => {
    return {
      status: 200,
      output: { message: 'Hello, world!' },
    };
  },
);

createHandlerBuilder<SingleRouterAppType>().createHandler(
  '/posts',
  '$get',
  // @ts-expect-error -- non-matching status code should be detected by type checking
  () => {
    return {
      status: 201,
    };
  },
);

createHandlerBuilder<MultipleRoutersAppType>().createHandler(
  '/posts',
  '$get',
  // @ts-expect-error -- non-matching status code should be detected by type checking
  () => {
    return {
      status: 201,
    };
  },
);

createHandlerBuilder<SingleRouterAppType>().createHandler(
  '/posts',
  '$get',
  // @ts-expect-error -- non-matching output type should be detected by type checking
  () => {
    return {
      status: 200,
      output: {
        postsInvalid: [],
      },
    };
  },
);

createHandlerBuilder<MultipleRoutersAppType>().createHandler(
  '/posts',
  '$get',
  // @ts-expect-error -- non-matching output type should be detected by type checking
  () => {
    return {
      status: 200,
      output: {
        postsInvalid: [],
      },
    };
  },
);

// Valid case, no type errors
createHandlerBuilder<SingleRouterAppType>().createHandler('/posts', '$get', ({ input }) => {
  // input type should by typed by schema
  input satisfies { query: { limit?: string } };

  return {
    status: 200,
    output: {
      posts: [
        {
          id: '1',
          title: 'Post 1',
          createdAt: '2021-01-01',
        },
      ],
    },
  };
});

// Valid case, no type errors
createHandlerBuilder<MultipleRoutersAppType>().createHandler('/posts', '$get', ({ input }) => {
  // input type should by typed by schema
  input satisfies { query: { limit?: string } };

  return {
    status: 200,
    output: {
      posts: [
        {
          id: '1',
          title: 'Post 1',
          createdAt: '2021-01-01',
        },
      ],
    },
  };
});
