// ensures that all necessary environment variables are defined after reading from .env
import dotenv from 'dotenv-safe';
dotenv.config({ allowEmptyValues: true });
// Express
import express from 'express';
// Http
import { Server } from 'http';
// Cors
import cors from 'cors';
// Middleware
import session from './middleware/session';
// Routes
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import ImageRoutes from './routes/ImageRoutes';
// Constants, Helpers & Types
import { mongoConnect } from './utils';
import { API_VERSION, SERVER_PORT, SERVER_HOST, serverReady, testing } from './constants';

// server startup
const initializeApp = () => {
  const app = express();

  // enable this if you run behind a proxy (e.g. nginx) for example, rate limiting
  app.enable('trust proxy');

  // setup cors
  app.use(
    cors({
      credentials: true,
      origin: [`http://${SERVER_HOST}:${SERVER_PORT}`, 'http://localhost:3000'],
    }),
  );

  // middleware that parses json request
  app.use(express.json());

  // session
  app.use(session);

  // user related routes
  app.use(`${API_VERSION}/user`, userRoutes);
  // post related routes
  app.use(`${API_VERSION}/post`, postRoutes);
  // image related routes
  app.use(`${API_VERSION}/image`, ImageRoutes);

  // server status for container health checks purposes
  app.get(`${API_VERSION}/status`, (_, res) => {
    res.send(serverReady);
  });

  // main route server status
  app.get(API_VERSION, (_, res) => res.send(serverReady));

  return app;
};

export const startServer = async () => {
  // Start the database server
  await mongoConnect();

  // Initialize the Express app
  const app = initializeApp();

  // Start the server and wait for it to listen on the specified port
  const server = await new Promise<Server>((resolve) => {
    const serverInstance = app.listen(SERVER_PORT, () => {
      console.log(serverReady);
      resolve(serverInstance);
    });
  });

  return server;
};

// start server when not testing
!testing && startServer();
