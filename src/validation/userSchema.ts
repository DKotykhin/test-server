class UserSchema {
  getUserById() {
    return {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            avatarUrl: { type: 'string', format: 'uri' },
            isEmailVerified: { type: 'boolean' },
          },
        },
      },
    };
  }

  createUser() {
    return {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          avatarUrl: { type: 'string', format: 'uri' },
        },
        required: ['name', 'email', 'password'],
        additionalProperties: false,
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            avatarUrl: { type: 'string', format: 'uri' },
            isEmailVerified: { type: 'boolean' },
          },
        },
      },
    };
  }
}

export { UserSchema };
