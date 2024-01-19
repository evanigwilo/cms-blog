// Redis
import Redis, { RedisOptions } from 'ioredis';
// Constants, Helpers & Types
import { RedisDB, ResponseCode } from '../types/enum';
import { REDIS_DB_HOST, REDIS_DB_PORT, testing } from '../constants';

const options = (db: RedisDB): RedisOptions => ({
  host: REDIS_DB_HOST,
  port: Number(REDIS_DB_PORT),
  db,
  lazyConnect: true,
  // no reconnecting if testing
  reconnectOnError: () => !testing,
  maxRetriesPerRequest: testing ? 0 : 20,
});

const setEvents = (client: Redis & { connected?: boolean }, dbName: string) => {
  client.on('connect', () => {
    console.log(`Connected to RedisDB(db:${dbName})`);
    client.connected = true;
  });

  client.on('error', () => {
    // fail test on first error connecting to redis client
    if (testing) {
      client.quit();
      if (!client.connected) {
        throw new Error(ResponseCode.DATABASE_ERROR);
      }
    } else {
      console.log(`Waiting for RedisDB(db:${dbName})`);
    }
  });
};

// Configure redis clients
export const session = new Redis(options(RedisDB.SESSION));
setEvents(session, 'session');

export const cache = new Redis(options(RedisDB.CACHE));
setEvents(cache, 'cache');
