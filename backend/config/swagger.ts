import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LucidFlow API',
      version: '1.0.0',
      description: 'LucidFlow 后端 API 文档',
    },
    servers: [{ url: '/api' }], // 您的 API 基础路径
  },
  apis: [
    './src/routes/*.ts', 
    './src/models/**/*.swagger.ts'
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}