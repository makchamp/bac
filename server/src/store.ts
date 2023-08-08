import redis from 'redis';
import connectRedis from 'connect-redis';

module.exports = (session: any) => {
  const RedisStore = connectRedis(session);

  const redisClient = redis.createClient({
    host: process.env.REDIS_DOMAIN || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  });

  redisClient.on('error', (error: any) => {
    console.error(`Redis connection failed ${error}`);
    process.exit(1);
  });

  redisClient.on('connect', () => {
    console.log('Redis connection established');
  });

  return new RedisStore({ client: redisClient });
};
