import { createHandler } from '@kimuson/hono-rpc-msw-adapter';

createHandler(
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

createHandler(
  '/posts',
  '$get',
  // @ts-expect-error -- non-matching status code should be detected by type checking
  () => {
    return {
      status: 201,
    };
  },
);

createHandler(
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
createHandler('/posts', '$get', ({ input }) => {
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

// Valid case for path params, no type errors
createHandler('/posts/:id', '$get', ({ input }) => {
  // input type should by typed by schema
  input satisfies { param: { id: string } };

  return {
    status: 200,
    output: {
      id: '1',
      title: 'Post 1',
      createdAt: '2021-01-01',
    },
  };
});

// Valid case for with body, no type errors
createHandler('/posts', '$post', ({ input }) => {
  // input type should by typed by schema
  input satisfies { json: { title: string } };

  return {
    status: 201,
    output: {
      id: 1,
      title: input.json.title,
    },
  };
});

// ========================================
// SingleRouter: Additional Type Tests
// ========================================

// Should error: wrong method for existing route
createHandler(
  '/posts/:id',
  // @ts-expect-error -- $post is not defined for this route, only $get
  '$post',
  () => {
    return {
      status: 200,
      output: { id: '1', title: 'Post', createdAt: '2021-01-01' },
    };
  },
);

// Valid: PUT with path params and body
createHandler('/posts/:id', '$put', ({ input }) => {
  input satisfies { param: { id: string }; json: { title: string } };

  return {
    status: 200,
    output: {
      id: input.param.id,
      title: input.json.title,
    },
  };
});

// Valid: PATCH with path params and optional body
createHandler('/posts/:id', '$patch', ({ input }) => {
  input satisfies { param: { id: string }; json: { title?: string } };

  return {
    status: 200,
    output: {
      id: input.param.id,
      title: input.json.title ?? 'Updated',
    },
  };
});

// Valid: DELETE with path params
createHandler('/posts/:id', '$delete', ({ input }) => {
  input satisfies { param: { id: string } };

  return {
    status: 200,
    output: {
      deleted: true as const,
      id: input.param.id,
    },
  };
});

// Valid: Multiple path parameters
createHandler('/users/:userId/posts/:postId', '$get', ({ input }) => {
  input satisfies { param: { userId: string; postId: string } };

  return {
    status: 200,
    output: {
      userId: input.param.userId,
      postId: input.param.postId,
      title: 'User Post',
    },
  };
});

// Valid: Multiple query parameters
createHandler('/search', '$get', ({ input }) => {
  input satisfies { query: { q: string; limit?: string; offset?: string } };

  return {
    status: 200,
    output: {
      results: [],
      query: input.query,
    },
  };
});

// Valid: Complex nested body
createHandler('/posts-with-author', '$post', ({ input }) => {
  input satisfies {
    json: {
      title: string;
      author: { name: string; email: string };
      tags?: string[];
    };
  };

  return {
    status: 201,
    output: {
      id: 1,
      title: input.json.title,
      author: input.json.author,
      tags: input.json.tags,
    },
  };
});

// Valid: Query + path params + body
createHandler('/posts/:id/update', '$put', ({ input }) => {
  input satisfies {
    param: { id: string };
    query: { notify?: string };
    json: { title: string; draft?: boolean };
  };

  return {
    status: 200,
    output: {
      id: input.param.id,
      title: input.json.title,
      draft: input.json.draft,
      notified: input.query?.notify === 'true',
    },
  };
});

// Valid: Empty optional body (param only)
createHandler('/posts/:id/publish', '$patch', ({ input }) => {
  input satisfies { param: { id: string } };

  return {
    status: 200,
    output: {
      id: input.param.id,
      published: true as const,
    },
  };
});

// Should error: wrong output type for complex nested body
createHandler(
  '/posts-with-author',
  '$post',
  // @ts-expect-error -- missing required fields in output
  () => {
    return {
      status: 201,
      output: {
        id: 1,
        wrongField: 'error',
      },
    };
  },
);
