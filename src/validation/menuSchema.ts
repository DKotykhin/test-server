class MenuSchema {
  getMenuByLanguage() {
    return {
      summary: 'Get Menu by Language',
      description: 'Retrieve the menu categories and items for a specified language',
      tags: ['Menu'],
      querystring: {
        type: 'object',
        properties: {
          language: { type: 'string', enum: ['EN', 'UA', 'RU'] },
        },
        required: ['language'],
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              description: { type: 'string' },
              isAvailable: { type: 'boolean' },
              position: { type: 'integer' },
              imageUrl: { type: 'string', nullable: true },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'string' },
                    imageUrl: { type: 'string', nullable: true },
                    isAvailable: { type: 'boolean' },
                    position: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
        404: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer' },
            message: { type: 'string' },
          },
        },
      },
    };
  }
}

export { MenuSchema };
