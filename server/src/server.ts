import { env } from './config/env';
import { createApp } from './app';

/**
 * Application entrypoint. Bootstraps the Express app and starts the HTTP server.
 */
const app = createApp();

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${env.port}`);
});

