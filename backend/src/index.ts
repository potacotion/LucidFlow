import logger from 'jet-logger';

import ENV from '@src/common/constants/ENV';
import server from './server';
import { setupSwagger } from '../config/swagger';
import ConfigService from '@src/services/ConfigService';

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

    // Start the server
    server.listen(ENV.Port, host, () => {
      logger.info(`Express server started on http://${host}:${ENV.Port}`);
    });

  } catch (err) {
    logger.err('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
