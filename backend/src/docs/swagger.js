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
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'name', 'email', 'role'],
          properties: {
            id: { type: 'string', readOnly: true },
            name: { type: 'string', minLength: 2, maxLength: 80 },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['student', 'teacher'] },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', readOnly: true },
          },
        },
        Classroom: {
          type: 'object',
          required: ['name', 'subject', 'teacher', 'joinCode'],
          properties: {
            _id: { type: 'string', readOnly: true },
            name: { type: 'string', minLength: 2, maxLength: 100 },
            subject: { type: 'string', minLength: 2, maxLength: 80 },
            teacher: { type: 'string', description: 'Teacher user ID' },
            students: {
              type: 'array',
              items: { type: 'string', description: 'Student user ID' },
            },
            joinCode: { type: 'string', pattern: '^[A-Z0-9]{6}$' },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', readOnly: true },
          },
        },
        Doubt: {
          type: 'object',
          required: ['student', 'classroom', 'subject', 'topic', 'text', 'status'],
          properties: {
            _id: { type: 'string', readOnly: true },
            student: { type: 'string', description: 'Student user ID' },
            classroom: { type: 'string', description: 'Classroom ID' },
            subject: { type: 'string' },
            topic: { type: 'string', maxLength: 120 },
            text: { type: 'string', minLength: 1, maxLength: 2000 },
            aiAnswer: { type: 'string', nullable: true },
            detectedGaps: {
              type: 'array',
              items: { type: 'string', description: 'ConceptGap ID' },
            },
            status: { type: 'string', enum: ['pending', 'answered', 'failed'] },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', readOnly: true },
          },
        },
        ConceptGap: {
          type: 'object',
          required: [
            'classroom',
            'student',
            'subject',
            'concept',
            'conceptKey',
            'severity',
            'occurrences',
          ],
          properties: {
            _id: { type: 'string', readOnly: true },
            classroom: { type: 'string', description: 'Classroom ID' },
            student: { type: 'string', description: 'Student user ID' },
            subject: { type: 'string' },
            concept: { type: 'string', description: 'Display name for the concept' },
            conceptKey: { type: 'string', description: 'Normalized concept key' },
            prerequisiteOf: { type: 'string', nullable: true },
            severity: { type: 'string', enum: ['low', 'medium', 'high'] },
            doubts: {
              type: 'array',
              items: { type: 'string', description: 'Doubt ID' },
            },
            occurrences: { type: 'integer', minimum: 1 },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', readOnly: true },
          },
        },
        ApiSuccess: {
          type: 'object',
          required: ['success', 'message', 'data'],
          properties: {
            success: { type: 'boolean', enum: [true] },
            message: { type: 'string' },
            data: {},
          },
        },
        ApiError: {
          type: 'object',
          required: ['success', 'message'],
          properties: {
            success: { type: 'boolean', enum: [false] },
            message: { type: 'string' },
          },
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
