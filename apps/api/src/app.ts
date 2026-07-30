import express, { Express } from 'express';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Consult Platform API',
    version: '0.1.0',
    description: 'API for AI-first dev consult platform',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  role: { type: 'string', enum: ['client', 'worker', 'admin'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User created' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Token refreshed' },
          '401': { description: 'Invalid refresh token' },
        },
      },
    },
    '/api/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'List of projects' } },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create project',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  budget: { type: 'number' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Project created' } },
      },
    },
    '/api/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Project details' },
          '404': { description: 'Not found' },
        },
      },
      put: {
        tags: ['Projects'],
        summary: 'Update project',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Project updated' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'List of tasks' } },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  projectId: { type: 'integer' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                  estimatedHours: { type: 'number' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Task created' } },
      },
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get task by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Task details' },
          '404': { description: 'Not found' },
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Update task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Task updated' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/tasks/{id}/bids': {
      get: {
        tags: ['Tasks'],
        summary: 'List bids for task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: { '200': { description: 'List of bids' } },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create bid for task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  proposedHours: { type: 'number' },
                  proposedPrice: { type: 'number' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Bid created' } },
      },
    },
    '/api/tasks/{id}/claim': {
      post: {
        tags: ['Tasks'],
        summary: 'Claim task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Task claimed' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/payments/create-intent': {
      post: {
        tags: ['Payments'],
        summary: 'Create payment intent',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  projectId: { type: 'integer' },
                  amount: { type: 'number' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Payment intent created' } },
      },
    },
    '/api/payments/webhook': {
      get: {
        tags: ['Payments'],
        summary: 'Stripe webhook endpoint',
        responses: { '200': { description: 'Webhook received' } },
      },
    },
  },
};

const swaggerOptions = { definition: swaggerDefinition };

export function setupSwagger(app: Express): void {
  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
}

export function createApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(rateLimiter);
  app.use('/api', routes);
  app.use(errorHandler);
  setupSwagger(app);
  return app;
}
