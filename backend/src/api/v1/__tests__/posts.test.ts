// Constants, Helpers & Types
import { UserType, Body, PostType } from '../types';
import { ResponseCode } from '../types/enum';
import { httpRequest, useTestServer } from './helpers';

// server start & stop hook
useTestServer();

describe('Posts', () => {
  // Define a sample user for testing
  const user = {
    identity: 'evan',
    password: '123456',
    username: 'evan',
    email: 'evan@gmail.com',
  };

  // Define a sample post for testing
  const post = {
    body: 'I am a post',
  };

  // Before all tests, register a user for authentication
  beforeAll(async () => {
    await httpRequest<Body & { user: UserType }>('POST', '/user/register', user);
  });

  it('should create a post', async () => {
    // Log in the user to obtain authentication headers
    const loginRequest = await httpRequest<Body & { user: UserType }>('POST', '/user/login', user);

    // Create a new post for the logged-in user
    const createPostRequest = await httpRequest<Body & { post: PostType }>(
      'PUT',
      '/post/create',
      post,
      loginRequest.headers,
    );

    // Assertions for a successful response
    expect(createPostRequest.body?.code).toBe(ResponseCode.SUCCESS);
    expect(createPostRequest.body?.post).toMatchObject<Partial<PostType>>(post);
    expect(createPostRequest.status).toBe(201);
  });

  it('should get posts', async () => {
    // Log in the user to obtain authentication headers
    const loginRequest = await httpRequest<Body & { user: UserType }>('POST', '/user/login', user);

    // Create 10 posts for the logged-in user
    await Promise.all(
      Array.from({ length: 10 }).map(async (_, index) => {
        await httpRequest<Body & { post: PostType }>(
          'PUT',
          '/post/create',
          {
            body: `Post-${index}`,
          },
          loginRequest.headers,
        );
      }),
    );

    // Retrieve all posts for the logged-in user
    const getPostsRequest = await httpRequest<Body & { posts: PostType[] }>(
      'POST',
      '/post/all',
      {},
      loginRequest.headers,
    );

    // Assertions for a successful response
    expect(getPostsRequest.body?.code).toBe(ResponseCode.SUCCESS);
    expect(getPostsRequest.body?.posts).toHaveLength(10);
    expect(getPostsRequest.status).toBe(200);
  });

  it('should delete a post', async () => {
    // Log in the user to obtain authentication headers
    const loginRequest = await httpRequest<Body & { user: UserType }>('POST', '/user/login', user);

    // Create a new post for the logged-in user
    const createPostRequest = await httpRequest<Body & { post: PostType }>(
      'PUT',
      '/post/create',
      post,
      loginRequest.headers,
    );

    const userPost = createPostRequest.body?.post;

    // Delete the created post using the post ID and authentication headers
    const deletePostRequest = await httpRequest<Body & { user: UserType }>(
      'DELETE',
      `/post/${userPost?._id}`,
      {},
      loginRequest.headers,
    );

    // Assertions for a successful response
    expect(deletePostRequest.body?.code).toBe(ResponseCode.SUCCESS);
    expect(deletePostRequest.status).toBe(201); // Update with the expected HTTP status code
  });
});
