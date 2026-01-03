import { userProperties } from './_properties.ts';

class UserSchema {
  // Common ID parameter schema
  private idParam = {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
    required: ['id'],
  };

  confirmPassword() {
    return {
      summary: 'Confirm user password',
      description: 'Check if the provided password matches the user\'s current password',
      tags: ['User'],
      params: this.idParam,
      body: {
        type: 'object',
        properties: {
          password: { type: 'string' },
        },
        required: ['password'],
        additionalProperties: false,
      },
      response: {
        200: {
          type: 'object',
          properties: {
            isMatch: { type: 'boolean' },
          },
        },
      },
    };
  }

  updateUserPassword() {
    return {
      summary: 'Update user password',
      description: 'Update the password for a specific user',
      tags: ['User'],
      params: this.idParam,
      body: {
        type: 'object',
        properties: {
          password: { type: 'string', minLength: 6 },
        },
        required: ['password'],
        additionalProperties: false,
      },
      response: {
        200: {
          type: 'object',
          properties: userProperties,
        },
      },
    };
  }

  updateUserName() {
    return {
      summary: 'Update user name',
      description: 'Update the name of a specific user',
      tags: ['User'],
      params: this.idParam,
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
        additionalProperties: false,
      },
      response: {
        200: {
          type: 'object',
          properties: userProperties,
        },
      },
    };
  }

  deleteUser() {
    return {
      summary: 'Delete user',
      description: 'Delete a user by their unique ID',
      tags: ['User'],
      params: this.idParam,
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

export { UserSchema };
