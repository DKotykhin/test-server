import { userProperties } from './_properties.ts';

class AuthSchema {
  getCurrentUser() {
    return {
      summary: 'Get current user',
      description: 'Retrieve the currently authenticated user',
      tags: ['Auth'],
      response: {
        200: {
          type: 'object',
          properties: userProperties,
        },
      },
    };
  }

  signUp() {
    return {
      summary: 'User sign-up',
      description: 'Register a new user',
      tags: ['Auth'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
        required: ['name', 'email', 'password'],
        additionalProperties: false,
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    };
  }

  signIn() {
    return {
      summary: 'User sign-in',
      description: 'Authenticate a user and return a JWT token',
      tags: ['Auth'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
        required: ['email', 'password'],
        additionalProperties: false,
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
          },
        },
      },
    };
  }

  verifyEmail() {
    return {
      summary: 'Verify user email',
      description: 'Verify the email address of a specific user',
      tags: ['Auth'],
      querystring: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
        required: ['token'],
        additionalProperties: false,
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    };
  }
}

export { AuthSchema };
