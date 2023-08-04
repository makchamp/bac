const redis = require('redis');
const connectRedis = require('connect-redis');

module.exports = (session) => {
  const RedisStore = connectRedis(session);

  const redisClient = redis.createClient({
    host: process.env.REDIS_DOMAIN || 'localhost',
    port: process.env.REDIS_PORT || 6379
  });

  redisClient.on('error', (error) => {
    console.log(`redis connection failed ${error}`);
  });

  redisClient.on('connect', () => {
    console.log('redis connection established');
  });

  return new RedisStore({ client: redisClient });
};