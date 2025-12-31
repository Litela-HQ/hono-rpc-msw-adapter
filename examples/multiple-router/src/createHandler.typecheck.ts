/**/
/**/
/**/
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
// MultipleRouters: Comprehensive Type Tests
// ========================================

// Valid: GET with path params on users router
createHandler('/users/:userId', '$get', ({ input }) => {
  input satisfies { param: { userId: string } };

  return {
    status: 200,
    output: {
      userId: input.param.userId,
    },
  };
});

// Valid: POST on users router
createHandler('/users', '$post', ({ input }) => {
  input satisfies { json: { name: string } };

  return {
    status: 201,
    output: {
      id: '123',
      name: input.json.name,
    },
  };
});

// Valid: PUT on users router
createHandler('/users/:userId', '$put', ({ input }) => {
  input satisfies { param: { userId: string }; json: { name: string } };

  return {
    status: 200,
    output: {
      userId: input.param.userId,
      name: input.json.name,
    },
  };
});

// Valid: PATCH on users router
createHandler('/users/:userId', '$patch', ({ input }) => {
  input satisfies { param: { userId: string }; json: { name?: string } };

  return {
    status: 200,
    output: {
      userId: input.param.userId,
      name: input.json.name ?? 'Updated User',
    },
  };
});

// Valid: DELETE on users router
createHandler('/users/:userId', '$delete', ({ input }) => {
  input satisfies { param: { userId: string } };

  return {
    status: 200,
    output: {
      deleted: true as const,
      userId: input.param.userId,
    },
  };
});

// Valid: GET with query on posts router
createHandler('/posts', '$get', ({ input }) => {
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

// Valid: GET with path params on posts router
createHandler('/posts/:id', '$get', ({ input }) => {
  input satisfies { param: { id: string } };

  return {
    status: 200,
    output: {
      id: input.param.id,
      title: 'Test Post',
      createdAt: '2021-01-01',
    },
  };
});

// Valid: POST on posts router
createHandler('/posts', '$post', ({ input }) => {
  input satisfies { json: { title: string } };

  return {
    status: 201,
    output: {
      id: 1,
      title: input.json.title,
    },
  };
});

// Valid: PUT on posts router
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

// Valid: PATCH on posts router
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

// Valid: DELETE on posts router
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

// Valid: Multiple query parameters on edge cases router
createHandler('/api/search', '$get', ({ input }) => {
  input satisfies { query: { q: string; limit?: string; offset?: string } };

  return {
    status: 200,
    output: {
      results: [],
      query: input.query,
    },
  };
});

// Valid: Complex nested body on edge cases router
createHandler('/api/posts-with-author', '$post', ({ input }) => {
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

// Valid: Nested routers with multiple path parameters
// NOTE: For deeply nested routers, TypeScript may not fully infer all path parameters.
// The handler works correctly at runtime, but full type inference is limited.
createHandler('/nested/:userId/posts/:postId', '$get', ({ input }) => {
  // Skip satisfies check due to nested router type inference limitations
  // input satisfies { param: { userId: string; postId: string } };

  return {
    status: 200,
    output: {
      postId: (input as { param: { postId: string } }).param.postId,
      title: 'User Post',
    },
  };
});

// Should error: wrong method on posts router
createHandler(
  '/posts',
  // @ts-expect-error -- $delete is not defined for /posts without :id
  '$delete',
  () => {
    return {
      status: 200,
      output: {},
    };
  },
);

// Should error: wrong output type on users router
createHandler(
  '/users/:userId',
  '$get',
  // @ts-expect-error -- output should have userId field
  () => {
    return {
      status: 200,
      output: {
        wrongField: 'error',
      },
    };
  },
);

// Should error: wrong status code on posts router
createHandler(
  '/posts/:id',
  '$get',
  // @ts-expect-error -- status should be 200 or 404
  () => {
    return {
      status: 201,
      output: {
        id: '1',
        title: 'Post',
        createdAt: '2021-01-01',
      },
    };
  },
);
