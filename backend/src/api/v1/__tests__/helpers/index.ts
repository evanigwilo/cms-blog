import { IncomingHttpHeaders, Server } from 'http';
import { connections } from 'mongoose';
import { startServer } from '../..';
import { API_VERSION, SERVER_HOST, SERVER_PORT, SESSION_ID } from '../../constants';
import supertest from 'supertest';
import Post from '../../models/Post';
import User from '../../models/User';
import Image from '../../models/Image';

// Create a supertest request object for making API requests
const apiRequest = supertest(`http://${SERVER_HOST}:${SERVER_PORT}`);

/**
 * Make an HTTP request to the specified route with optional body and headers.
 *
 * @param method - The HTTP method (GET, POST, DELETE).
 * @param route - The API route to request.
 * @param body - (Optional) The request body as a Record<string, string | number>.
 * @param headers - (Optional) Additional HTTP headers as IncomingHttpHeaders.
 * @returns An object containing the response details.
 */
export const httpRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  route: string,
  body?: Record<string, string | number>,
  headers?: IncomingHttpHeaders,
) => {
  // Build the complete URL
  const url = API_VERSION + route;

  // Create the initial request based on the HTTP method
  const request =
    method === 'GET'
      ? apiRequest.get(url)
      : method === 'POST'
      ? apiRequest.post(url)
      : method === 'PUT'
      ? apiRequest.put(url)
      : apiRequest.delete(url);

  // Extract and set the 'set-cookie' header if present in the provided headers
  const cookie = headers?.['set-cookie'];
  if (cookie) {
    request.set('Cookie', cookie);
  }

  // Send the request with the optional body
  const response = await request.send(body);

  // Return a formatted response object
  return {
    body: response.body as T | undefined,
    text: response.text,
    headers: response.headers as IncomingHttpHeaders,
    status: response.statusCode,
    HTTPError: response.error,
  };
};

/**
 * Utility function to set up and tear down a test server and clear database collections.
 * @returns A function to access the test server.
 */
export const useTestServer = () => {
  let server: Server;

  // Before the tests, spin up a new Express Server and clear database collections
  beforeAll(async () => {
    try {
      // Start the Express server
      server = await startServer();

      // Clear all documents from the collections
      await Post()?.deleteMany({});
      await User()?.deleteMany({});
      await Image()?.deleteMany({});
    } catch (error) {
      console.error('Error setting up test server and database collections:', error);
    }
  });

  // After the tests, stop the server and close database connections
  afterAll(async () => {
    try {
      // Stop the Express server
      if (server) {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }

      // Close all database connections
      for (const connection of connections) {
        await connection.close();
      }
    } catch (error) {
      console.error('Error tearing down test server and closing database connections:', error);
    }
  });
};
/**
 * Extracts the value of a specific key from a cookie string.
 *
 * @param cookie - The cookie string to extract the value from.
 * @param key - The key to search for in the cookie. It can be 'Path=', 'Expires=', 'HttpOnly', or a custom string.
 * @returns The value associated with the specified key in the cookie.
 */
export const getCookieValue = (cookie: string, key: 'Path=' | 'Expires=' | 'HttpOnly' | string): string | boolean => {
  // Check if the key is 'HttpOnly'
  if (key === 'HttpOnly') {
    return cookie.includes('HttpOnly'); // case-sensitive
  }

  // Find the index of the key in the cookie string
  const index = cookie.indexOf(key);

  // Extract the value associated with the key
  const value = cookie.substring(index, cookie.indexOf(';', index)).slice(key.length);

  return value;
};

/**
 * Tests the presence or absence of a specific cookie in the headers.
 *
 * @param headers - The incoming HTTP headers containing the 'set-cookie' field.
 * @param valid - A boolean indicating whether the cookie is expected to be present (true) or absent (false).
 */
export const testCookie = (headers: IncomingHttpHeaders, valid: boolean): void => {
  // Get the 'set-cookie' field from the headers
  const cookies = headers['set-cookie'];

  // Extract the value associated with the SESSION_ID key from the first cookie (if available)
  const value = cookies && getCookieValue(cookies[0], `${SESSION_ID}=`);

  // Perform the expectation based on the validity condition
  if (valid) {
    expect(value).toBeTruthy();
  } else {
    expect(value).toBeFalsy();
  }
};
