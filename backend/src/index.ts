import logger from 'jet-logger';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import url from 'url';

import ENV from '@src/common/constants/ENV';
import server from './server';
import { setupSwagger } from '../config/swagger';
import ConfigService from '@src/services/ConfigService';
import { connectionManager } from './services/WebSocketService';
import WorkflowExecutionManager from './services/WorkflowExecutionManager';

/******************************************************************************
 *                                   Run
 ******************************************************************************/

const startServer = async () => {
  try {
    // Get global config to determine server host
    const globalConfig = await ConfigService.getGlobalConfig() as { multiUserMode?: boolean };

    // Determine host based on multiUserMode
    const host = globalConfig.multiUserMode === false ? '127.0.0.1' : '0.0.0.0';

    // Setup Swagger UI
    setupSwagger(server);

    // Create HTTP server
    const httpServer = createServer(server);

    // Create WebSocket server
    const wss = new WebSocketServer({ noServer: true });

    httpServer.on('upgrade', (request, socket, head) => {
      const pathname = request.url ? url.parse(request.url).pathname : undefined;
      const wsPathRegex = /^\/ws\/workflow\/([a-zA-Z0-9_-]+)$/;
      
      if (pathname && wsPathRegex.test(pathname)) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    wss.on('connection', (ws, request) => {
      const pathname = request.url ? url.parse(request.url).pathname : '';
      const match = pathname?.match(/^\/ws\/workflow\/([a-zA-Z0-9_-]+)$/);
      if (match) {
        const runId = match[1];
        connectionManager.add(runId, ws);

        // This is the crucial part: Start the execution only after the WS is connected.
        // For UI/Editor execution, we use a fixed internal tag and no initial data.
        WorkflowExecutionManager.startExecution(runId, '__INTERNAL_UI_START__');

        ws.on('close', () => {
          connectionManager.remove(runId, ws);
        });
      } else {
        ws.close();
      }
    });

    // Start the server
    httpServer.listen(ENV.Port, host, () => {
      logger.info(`Express server with WebSocket support started on http://${host}:${ENV.Port}`);
    });

  } catch (err) {
    logger.err('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
