// Constants, Helpers & Types
import { UserType, Body } from '../types';
import { ResponseCode } from '../types/enum';
import { httpRequest, testCookie, useTestServer } from './helpers';

// server start & stop hook
useTestServer();

describe('User Authentication', () => {
  // Define a sample user for testing
  const user = {
    identity: 'evan',
    password: '123456',
    username: 'evan',
    email: 'evan@gmail.com',
  };

  // Test case: Register and login a user successfully
  it('should register and login a user successfully', async () => {
    for (const route of ['register', 'login']) {
      // Make HTTP request for registration or login
      const request = await httpRequest<Body & { user: UserType }>('POST', `/user/${route}`, user);

      // Assertions for a successful response
      expect(request.body?.code).toBe(ResponseCode.SUCCESS);
      expect(request.body?.user).toMatchObject<Partial<UserType>>({
        username: user.username,
        email: user.email,
      });
      expect([200, 201]).toContain(request.status);

      // Check if the session cookie is present
      testCookie(request.headers, true);
    }
  });

  // Test case: Register a user with errors
  it('should register a user with errors', async () => {
    // Make HTTP request for user registration
    const request = await httpRequest<Body & { user: UserType }>('POST', '/user/register', user);

    // Assertions for an error response
    expect(request.body?.code).toBe(ResponseCode.FORBIDDEN);
    expect(request.status).toBe(400);
  });

  // Test case: Login a user with errors
  it('should login a user with errors', async () => {
    // Modify username to a non-existing user
    user.identity = 'john';

    // Make HTTP request for user login with modified username
    const request = await httpRequest<Body & { user: UserType }>('POST', '/user/login', user);

    // Assertions for an error response
    expect(request.body?.code).toBe(ResponseCode.INPUT_ERROR);
    expect(request.status).toBe(400);
  });
});
