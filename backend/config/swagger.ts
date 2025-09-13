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
  // 这里配置需要扫描的 API 文件路径。
  // 注意：需要根据实际的项目结构调整，确保能找到路由文件和模型文件
  apis: [
    './src/routes/*.ts', // 扫描所有路由文件及其子目录
    './src/models/*.ts', // 扫描所有模型文件及其子目录，用于生成 DTO/Schema
    './src/routes/common/types/*.ts', // 如果有公共类型定义
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // 添加一个路由来直接提供 OpenAPI 规范 JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}