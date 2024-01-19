declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      SERVER_PORT: string;
      SERVER_HOST: string;
      API_VERSION: string;
      SESSION_ID: string;
      SESSION_SECRET: string;
      REDIS_DB_HOST: string;
      REDIS_DB_PORT: string;
      MONGO_INITDB_ROOT_USERNAME: string;
      MONGO_INITDB_ROOT_PASSWORD: string;
      MONGO_INITDB_DATABASE: string;
      MONGO_DB_HOST: string;
      MONGO_DB_PORT: string;
    }
  }
}

export {}
