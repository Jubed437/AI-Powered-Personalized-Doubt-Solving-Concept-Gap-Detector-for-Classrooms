const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KNOWRA API',
      version: '1.0.0',
      description: 'API for the KNOWRA classroom learning platform',
    },
    servers: [{ url: '/api', description: 'Backend API' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    'auth.routes.js',
    'classroom.routes.js',
    'doubt.routes.js',
    'gap.routes.js',
    'index.js',
  ].map((file) => path.join(__dirname, '..', 'routes', file)),
};

module.exports = swaggerJsdoc(options);
