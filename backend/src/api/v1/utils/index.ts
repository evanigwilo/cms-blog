// Express
import { Request, Response } from 'express';
// Mongoose
import { Error, connections, Document, Connection, createConnection } from 'mongoose';
// Constants, Helpers & Types
import { Databases } from '../types';
import { ResponseCode } from '../types/enum';
import {
  MONGO_INITDB_ROOT_USERNAME,
  MONGO_DB_HOST,
  MONGO_DB_PORT,
  MONGO_INITDB_ROOT_PASSWORD,
  mongoDbs,
  MAX_LIMIT,
  testing,
} from '../constants';

// Construct MongoDB connection URL
export const mongoUrl = (db: string) =>
  `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGO_DB_HOST}:${MONGO_DB_PORT}/${db}?authSource=${MONGO_INITDB_ROOT_USERNAME}`;

// Reuse existing connections or pools
export const mongoGetDb = (db: Databases) => connections.find((connection) => connection.name === mongoDbs[db]);

// mongo database connection helper
export const mongoConnect = async () => {
  const connect = (db: string) =>
    new Promise<Connection>((resolve, reject) => {
      const connection = createConnection(mongoUrl(db), {
        serverSelectionTimeoutMS: 3000,
        keepAlive: true,
      });

      connection.once('open', () => {
        console.log(`Connected to MongoDB(db:${db})`);
        resolve(connection);
      });

      connection.on('error', () => {
        console.log(`Waiting for MongoDB(db:${db})`);
        connection.destroy().then(() => reject());
      });

      connection.on('disconnected', () => {
        console.log(`Disconnected MongoDB(db:${db})`);
      });
    });

  const recreate = async (connection: Connection) => {
    const db = connection.db.databaseName;
    console.log(`Waiting for MongoDB(db:${db})`);
    connection.destroy().then(() => reconnect(db));
  };

  const reconnect = async (db: string) => {
    try {
      const connection = await connect(db);
      // no reconnection if testing
      if (testing) {
        return;
      }
      connection.on('disconnected', () => recreate(connection)).on('error', () => recreate(connection));
    } catch (error) {
      // fail test on first error connecting to mongo database
      if (testing) {
        throw new Error(ResponseCode.DATABASE_ERROR);
      }
      reconnect(db);
    }
  };

  // connect to all mongo databases
  for (const db in mongoDbs) {
    await reconnect(mongoDbs[db as Databases]);
  }
};

/**
 * Validates a Mongoose model and handles errors by responding with the first encountered error.
 *
 * @param model - The Mongoose model to be validated.
 * @param res - Express response object for sending HTTP responses.
 * @returns `true` if there's a validation error, `false` otherwise.
 */
export const validateError = async (model: Document, res: Response): Promise<boolean> => {
  try {
    // Validate the Mongoose model
    await model?.validate();
  } catch (error) {
    // Handle validation errors
    const validationError = error as Error.ValidationError;

    // Iterate through validation errors
    for (const [, error] of Object.entries(validationError.errors)) {
      // Respond with the first encountered error
      res.status(400).json({
        code: ResponseCode.INPUT_ERROR,
        message: error.message,
      });
      // Return true to indicate a validation error
      return true;
    }
  }

  // Return false if there are no validation errors
  return false;
};

export const databaseError = (res: Response) =>
  res.status(500).json({
    code: ResponseCode.DATABASE_ERROR,
    message: 'Internal Server Error',
  });

export const validInteger = (num: string) => /^[0-9]+$/.test(num);

export const validateLimitOffset = (body: Request['body']) => {
  const limit = validInteger(body.limit || '') ? Math.min(Number(body.limit), MAX_LIMIT) : MAX_LIMIT;
  const offset = validInteger(body.offset || '') ? Number(body.offset) : 0;
  return { limit, offset };
};
