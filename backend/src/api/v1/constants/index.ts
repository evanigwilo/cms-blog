import { Databases } from '../types';

// .env destructuring
export const {
  NODE_ENV,
  SERVER_HOST,
  SERVER_PORT,
  API_VERSION,
  MONGO_DB_HOST,
  MONGO_DB_PORT,
  MONGO_INITDB_DATABASE,
  MONGO_INITDB_ROOT_PASSWORD,
  MONGO_INITDB_ROOT_USERNAME,
  REDIS_DB_HOST,
  REDIS_DB_PORT,
  SESSION_ID,
  SESSION_SECRET,
} = process.env;

export const production = NODE_ENV === 'production';
export const development = NODE_ENV === 'development';
export const testing = NODE_ENV === 'testing';
export const rootDir = production ? 'build/api/v1' : 'src/api/v1';
export const fileExtension = production ? '*.js' : '*.ts';

// server ready message
export const serverReady = `\n🚀 Server ready at http://${SERVER_HOST}:${SERVER_PORT}${API_VERSION}`;

// cookie max age in ms of 1 hour
export const maxAge = 1000 * 60 * 60;

// maximum items to return from database for each query requests
export const MAX_LIMIT = 10;

export const MAX_IMAGE_UPLOAD = 1024 * 1024; // 1 MB

export const mimeTypes = {
  image: 'image/png, image/gif, image/jpeg, image/bmp, image/svg+xml',
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// mongo databases
export const mongoDbs: Record<Databases, string> = {
  user: MONGO_INITDB_DATABASE,
  image: 'image',
  post: 'post',
};
