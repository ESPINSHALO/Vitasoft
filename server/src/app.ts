import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import env from './config/env';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import { authenticate } from './middleware/auth.middleware';
import swaggerDocument from './config/swagger';

/**
 * Creates and configures the Express application:
 * - Security, CORS, logging, and body parsing middleware
 * - Swagger UI for API docs
 * - Route registration for auth and tasks
 * - Global error handler
 */
export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use('/api/auth', authRoutes);
  app.use('/tasks', taskRoutes);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/protected', authenticate, (_req, res) => {
    res.json({ message: 'You have accessed a protected route' });
  });

  // Global error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  });

  return app;
};

export default createApp;

