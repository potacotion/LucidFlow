import logger from 'jet-logger';

import ENV from '@src/common/constants/ENV';
import server from './server';
import { setupSwagger } from '../config/swagger';


/******************************************************************************
                                Constants
******************************************************************************/

const SERVER_START_MSG = (
  'Express server started on port: ' + ENV.Port.toString()
);


/******************************************************************************
                                  Run
******************************************************************************/

// Setup Swagger UI
setupSwagger(server);

// Start the server
server.listen(ENV.Port, err => {
  if (!!err) {
    logger.err(err.message);
  } else {
    logger.info(SERVER_START_MSG);
  }
});
