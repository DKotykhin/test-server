export const userProperties = {
  id: { type: 'string', format: 'uuid' },
  name: { type: 'string', minLength: 2, maxLength: 100 },
  email: { type: 'string', format: 'email' },
  avatarUrl: { type: 'string', format: 'uri' },
  isEmailVerified: { type: 'boolean' },
};
