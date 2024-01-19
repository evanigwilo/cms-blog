// Session
import session from 'express-session';
// Redis
import connectRedis from 'connect-redis';
// Services
import { session as client } from '../utils/redis';
// Constants, Helpers & Types
import { SESSION_ID, SESSION_SECRET, maxAge } from '../constants';

const redisStore = connectRedis(session);

// configure session using redis client
export default session({
  name: SESSION_ID,
  secret: SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  store: new redisStore({
    client,
    disableTouch: true,
  }),
  cookie: {
    maxAge,
    secure: false,
    // prevent client side JS from reading the cookie
    httpOnly: true,
  },
});
